import { create } from "zustand";
import { authApi } from "../services/api";

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  fetchMe: async () => {
    try {
      const { user } = await authApi.me();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (payload) => {
    const { user } = await authApi.login(payload);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  register: async (payload) => {
    const { user } = await authApi.register(payload);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    await authApi.logout();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
}));

export default useAuthStore;
