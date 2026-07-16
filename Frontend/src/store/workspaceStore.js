import { create } from "zustand";
import { workspaceApi } from "../services/api";

const useWorkspaceStore = create((set) => ({
  workspaces: [],
  isLoading: true,

  fetchWorkspaces: async () => {
    set({ isLoading: true });
    const { workspaces } = await workspaceApi.list();
    set({ workspaces, isLoading: false });
  },

  createWorkspace: async (name) => {
    const { workspace } = await workspaceApi.create({ name });
    set((state) => ({ workspaces: [workspace, ...state.workspaces] }));
    return workspace;
  },
}));

export default useWorkspaceStore;
