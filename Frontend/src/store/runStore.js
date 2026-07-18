import { create } from "zustand";

const useRunStore = create((set) => ({
  isRunning: false,
  runId: null,
  initiatedBy: null,
  output: [],
  exitInfo: null,
  errorMessage: null,

  startRun: (runId, initiatedBy) =>
    set({
      isRunning: true,
      runId,
      initiatedBy,
      output: [],
      exitInfo: null,
      errorMessage: null,
    }),

  appendOutput: (runId, stream, text) =>
    set((state) => {
      if (state.runId !== runId) return state;

      return {
        output: [
          ...state.output,
          { id: `${runId}-${state.output.length}`, stream, text },
        ],
      };
    }),

  finishRun: (runId, exitInfo) =>
    set((state) => {
      if (state.runId !== runId) return state;
      return { isRunning: false, exitInfo };
    }),

  setError: (message) => set({ isRunning: false, errorMessage: message }),

  clear: () => set({ output: [], exitInfo: null, errorMessage: null }),
}));

export default useRunStore;
