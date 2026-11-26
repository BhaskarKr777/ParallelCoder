import { create } from "zustand";

const useRunStore = create((set) => ({
  isRunning: false,
  runId: null,
  initiatedBy: null,
  output: [],
  exitInfo: null,
  errorMessage: null,
  customInput: "",
  activeTab: "terminal", // "terminal" | "input"

  setCustomInput: (customInput) => set({ customInput }),
  setActiveTab: (activeTab) => set({ activeTab }),

  startRun: (runId, initiatedBy) =>
    set({
      isRunning: true,
      runId,
      initiatedBy,
      output: [],
      exitInfo: null,
      errorMessage: null,
      activeTab: "terminal",
    }),

  appendOutput: (runId, stream, text, isInput = false) =>
    set((state) => {
      if (state.runId !== runId) return state;

      return {
        output: [
          ...state.output,
          { id: `${runId}-${state.output.length}`, stream, text, isInput },
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
