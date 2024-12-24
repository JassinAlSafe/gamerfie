import { create } from "zustand";
import { User } from "@/types/challenge";

interface UserStore {
  user: User | null;
  error: string | null;
  isLoading: boolean;
  fetchUser: () => Promise<void>;
}

export const useUser = create<UserStore>((set) => ({
  user: null,
  error: null,
  isLoading: false,
  fetchUser: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch("/api/user");
      
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }

      const data = await response.json();
      set({ user: data, error: null });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to fetch user" });
    } finally {
      set({ isLoading: false });
    }
  },
})); 