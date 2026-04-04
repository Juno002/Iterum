import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Task } from '../types';
import { dbService } from '../services/dbService';
import { useUserStore } from './useUserStore';
import { handleSyncError } from '../utils/syncErrors';

interface TaskState {
  tasks: Task[];
  loadTasks: (userId: string) => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  setTasks: (tasks: Task[]) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],

      loadTasks: async (userId) => {
        try {
          const tasks = await dbService.getTasks(userId);
          set({
            tasks: tasks.map((t: any) => ({
              ...t,
              date: new Date(t.date),
              createdAt: new Date(t.created_at),
            })),
          });
        } catch (error) {
          handleSyncError(error, 'tasks');
        }
      },

      addTask: (task) => {
        const userId = useUserStore.getState().userId;
        const newTask: Task = {
          ...task,
          id: crypto.randomUUID(),
          completed: false,
          type: task.type || 'task',
          createdAt: new Date(),
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));

        if (userId) {
          dbService.createTask(userId, newTask).catch((e) => handleSyncError(e, 'tasks'));
        }
      },

      updateTask: (id, updates) => {
        const userId = useUserStore.getState().userId;
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));

        if (userId) {
          dbService.updateTask(userId, id, updates).catch((e) => handleSyncError(e, 'tasks'));
        }
      },

      deleteTask: (id) => {
        const userId = useUserStore.getState().userId;
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }));

        if (userId) {
          dbService.deleteTask(userId, id).catch((e) => handleSyncError(e, 'tasks'));
        }
      },

      toggleTask: (id) => {
        const userId = useUserStore.getState().userId;
        set((state) => {
          const updatedTasks = state.tasks.map((t) => {
            if (t.id === id) {
              const updated = { ...t, completed: !t.completed };
              if (userId) dbService.updateTask(userId, id, { completed: !t.completed }).catch((e) => handleSyncError(e, 'tasks'));
              return updated;
            }
            return t;
          });
          return { tasks: updatedTasks };
        });
      },
      setTasks: (tasks) => set({ tasks }),
    }),
    {
      name: 'planner_tasks',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.tasks = state.tasks.map((t: any) => ({
            ...t,
            date: new Date(t.date),
          }));
        }
      },
    },
  ),
);
