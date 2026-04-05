import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Objective } from '../types';
import { dbService } from '../services/dbService';
import { supabase } from '../services/supabase';
import { encryptData, decryptData, deriveKeyFromPhrase, EnclaveStore } from '../utils/crypto';

interface ObjectiveState {
  objectives: Objective[];
  isLoading: boolean;
  error: string | null;
  fetchObjectives: () => Promise<void>;
  loadObjectives: (userId?: string) => Promise<void>;
  setObjectives: (objectives: Objective[]) => void;
  addObjective: (objective: Omit<Objective, 'id' | 'user_id' | 'createdAt'>) => Promise<void>;
  updateObjective: (id: string, updates: Partial<Objective>) => Promise<void>;
  deleteObjective: (id: string) => Promise<void>;
}

async function getEncryptionKey(): Promise<CryptoKey | null> {
  const phrase = await EnclaveStore.loadKeyReference();
  if (!phrase) return null;
  return deriveKeyFromPhrase(phrase);
}

export const useObjectiveStore = create<ObjectiveState>()(
  persist(
    (set, get) => ({
  objectives: [],
  isLoading: false,
  error: null,

  fetchObjectives: async () => {
    try {
      set({ isLoading: true, error: null });
      const user = (await supabase?.auth.getUser())?.data.user;
      if (!user) {
        set({ isLoading: false });
        return;
      }
      
      const data = await dbService.getObjectives(user.id);
      const key = await getEncryptionKey();
      const decryptedData = await Promise.all(data.map(async (obj) => {
        let title = obj.title;
        let description = obj.description;
        try {
          if (key && title.startsWith('E2EE::')) {
            const parts = title.replace('E2EE::', '').split('::');
            if (parts.length === 2) title = await decryptData(parts[0], parts[1], key);
          }
          if (key && description && description.startsWith('E2EE::')) {
            const parts = description.replace('E2EE::', '').split('::');
            if (parts.length === 2) description = await decryptData(parts[0], parts[1], key);
          }
        } catch(e) { /* silent */ }
        return {
          ...obj,
          status: obj.status as Objective['status'],
          title,
          description,
        };
      }));
      
      const { useSyncQueueStore } = await import('./useSyncQueueStore');
      const pendingQueue = useSyncQueueStore.getState().queue.filter(q => q.target === 'objective');
      
      // Smart Merge
      set((state) => {
        const localData = state.objectives;
        
        // 1. Empezamos con los datos del servidor
        const merged = decryptedData.map((serverObj: Objective) => {
           const localObj = localData.find(l => l.id === serverObj.id);
           // Si el objeto está en la cola pendiente de actualización, conservamos el local
           const isUpdating = pendingQueue.some(q => q.action === 'update' && q.entityId === serverObj.id);
           if (localObj && isUpdating) return localObj;
           return serverObj;
        });

        // 2. Filtramos deletes locales
        const afterDeletes = merged.filter((obj) => 
           !pendingQueue.some(q => q.action === 'delete' && q.entityId === obj.id)
        );

        // 3. Añadimos creates locales que aún no están en el servidor
        const localCreates = localData.filter(l => 
           pendingQueue.some(q => q.action === 'create' && q.payload?.id === l.id)
        );

        return { objectives: [...localCreates, ...afterDeletes], isLoading: false };
      });
      
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      set({ error: message, isLoading: false });
      console.error('Error fetching objectives:', error);
    }
  },

  loadObjectives: async () => {
    await get().fetchObjectives();
  },

  setObjectives: (objectives) => set({ objectives }),

  addObjective: async (objectiveData) => {
    try {
      const user = (await supabase?.auth.getUser())?.data.user;

      const tempId = crypto.randomUUID();
      const optimisticObjective: Objective = {
        ...objectiveData,
        id: tempId,
        targetValue: objectiveData.targetValue ?? 100,
        currentValue: objectiveData.currentValue ?? 0,
        unit: objectiveData.unit ?? '%',
        color: objectiveData.color ?? '#c9935a',
        progress: objectiveData.progress ?? 0,
        status: objectiveData.status ?? 'active',
        createdAt: new Date(),
      };
      
      set((state) => ({
        objectives: [optimisticObjective, ...state.objectives]
      }));

      if (!user) {
        return;
      }

      const payloadToSync = { ...objectiveData };
      const key = await getEncryptionKey();
      
      if (key) {
        const encryptedTitle = await encryptData(payloadToSync.title, key);
        payloadToSync.title = `E2EE::${encryptedTitle.cipher}::${encryptedTitle.iv}`;
        
        if (payloadToSync.description) {
          const encryptedDesc = await encryptData(payloadToSync.description, key);
          payloadToSync.description = `E2EE::${encryptedDesc.cipher}::${encryptedDesc.iv}`;
        }
      }

      const newObjective = await dbService.createObjective(user.id, payloadToSync);
      
      // Update with real ID (keep the unencrypted version in the UI)
      set((state) => ({
        objectives: state.objectives.map(obj => obj.id === tempId ? { ...optimisticObjective, id: newObjective.id } : obj)
      }));
    } catch (error: unknown) {
      console.error('Error creating objective:', error);
      get().fetchObjectives(); 
    }
  },

  updateObjective: async (id, updates) => {
    try {
      const user = (await supabase?.auth.getUser())?.data.user;

      set((state) => ({
        objectives: state.objectives.map((obj) => 
          obj.id === id ? { ...obj, ...updates } : obj
        )
      }));

      if (!user) {
        return;
      }

      const payloadToSync = { ...updates };
      const key = await getEncryptionKey();
      
      if (key && payloadToSync.title) {
        const encryptedTitle = await encryptData(payloadToSync.title, key);
        payloadToSync.title = `E2EE::${encryptedTitle.cipher}::${encryptedTitle.iv}`;
      }
      
      if (key && payloadToSync.description) {
        const encryptedDesc = await encryptData(payloadToSync.description, key);
        payloadToSync.description = `E2EE::${encryptedDesc.cipher}::${encryptedDesc.iv}`;
      }

      await dbService.updateObjective(user.id, id, payloadToSync);
    } catch (error: unknown) {
      console.error('Error updating objective:', error);
      get().fetchObjectives();
    }
  },

  deleteObjective: async (id) => {
    try {
      const user = (await supabase?.auth.getUser())?.data.user;

      set((state) => ({
        objectives: state.objectives.filter(obj => obj.id !== id)
      }));

      if (!user) {
        return;
      }

      await dbService.deleteObjective(user.id, id);
    } catch (error: unknown) {
      console.error('Error deleting objective:', error);
      get().fetchObjectives();
    }
  }
}),
{
  name: 'iterum_objectives_v1',
  storage: createJSONStorage(() => localStorage),
  onRehydrateStorage: () => (state) => {
    if (state) {
      state.objectives = state.objectives.map((objective) => ({
        ...objective,
        createdAt: new Date(objective.createdAt),
        deadline: objective.deadline ? new Date(objective.deadline) : undefined,
        milestones: objective.milestones?.map((milestone) => ({
          ...milestone,
          completedAt: milestone.completedAt ? new Date(milestone.completedAt) : undefined,
        })),
      }));
    }
  },
}
));
