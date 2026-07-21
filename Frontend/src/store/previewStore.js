import { create } from "zustand";

const usePreviewStore = create((set) => ({
  fileName: null,
  html: null,

  showPreview: (fileName, html) => set({ fileName, html }),
  closePreview: () => set({ fileName: null, html: null }),
}));

export default usePreviewStore;
