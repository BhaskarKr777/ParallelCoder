import { create } from "zustand";

const useEditorStore = create((set) => ({
  files: {},

  updateFileContent: (id, content) =>
    set((state) => ({
      files: {
        ...state.files,
        [id]: content,
      },
    })),
}));

export default useEditorStore;