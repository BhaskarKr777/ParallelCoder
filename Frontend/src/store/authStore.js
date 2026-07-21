import { create } from "zustand";
import { authApi } from "../services/api";
import socket from "../services/socket";

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  fetchMe: async () => {
    try {
      const { user } = await authApi.me();
      set({ user, isAuthenticated: true, isLoading: false });
      socket.connect();
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (payload) => {
    const { user } = await authApi.login(payload);
    set({ user, isAuthenticated: true, isLoading: false });
    socket.connect();
  },

  register: async (payload) => {
    const { user } = await authApi.register(payload);
    set({ user, isAuthenticated: true, isLoading: false });
    socket.connect();
  },

  logout: async () => {
    await authApi.logout();
    socket.disconnect();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  logoutAll: async () => {
    await authApi.logoutAll();
    socket.disconnect();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
}));

export default useAuthStore;
