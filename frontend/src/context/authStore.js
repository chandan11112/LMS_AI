import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../utils/api";
import toast from "react-hot-toast";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post("/auth/login", { email, password });
          set({ user: data.user, token: data.token, isLoading: false });
          // FIX: also store token for axios interceptor (persist stores to localStorage automatically)
          localStorage.setItem("learnkro_token", data.token);
          toast.success(`Welcome back, ${data.user.name.split(" ")[0]}!`);
          return data.user;
        } catch (error) {
          set({ isLoading: false });
          const msg = error.response?.data?.message || "Login failed";
          toast.error(msg);
          throw error;
        }
      },

      register: async (name, email, password, role = "student") => {
        set({ isLoading: true });
        try {
          const { data } = await api.post("/auth/register", { name, email, password, role });
          set({ user: data.user, token: data.token, isLoading: false });
          localStorage.setItem("learnkro_token", data.token);
          toast.success("Account created successfully! Welcome to LearnKro 🎉");
          return data.user;
        } catch (error) {
          set({ isLoading: false });
          const msg = error.response?.data?.message || "Registration failed";
          toast.error(msg);
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem("learnkro_token");
        set({ user: null, token: null });
        toast.success("Logged out successfully");
      },

      updateUser: (userData) => {
        const updated = { ...get().user, ...userData };
        set({ user: updated });
      },

      fetchMe: async () => {
        try {
          const { data } = await api.get("/auth/me");
          set({ user: data.user });
        } catch {
          get().logout();
        }
      },
    }),
    {
      name: "learnkro-auth",
      // FIX: only persist token and user, not loading state
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        // Sync token to localStorage for axios interceptor
        if (state?.token) {
          localStorage.setItem("learnkro_token", state.token);
        }
      },
    }
  )
);
