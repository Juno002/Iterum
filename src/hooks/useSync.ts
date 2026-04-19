export function useSync() {
  return {
    isSyncing: false,
    isRestoring: false,
    handleSync: async () => {},
    handleRestore: async () => {},
  };
}
