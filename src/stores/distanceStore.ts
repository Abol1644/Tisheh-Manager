// src/stores/distanceStore.ts
import { create } from "zustand";
import { getDistance } from "@/api/";
import { Distance } from "@/models/";
import { useProjectStore, useProductsStore } from "@/stores/";

interface DistanceState {
  distance: Distance[];
  setDistance: (distance: Distance[]) => void;
  loading: boolean;
  error: string | null;
  fetchDistance: () => Promise<Distance[]>; // ← Change return type
  clearDistance: () => void;
}

export const useDistanceStore = create<DistanceState>((set) => ({
  distance: [],
  loading: false,
  error: null,
  setDistance: (distance: Distance[]) => set({ distance }),

  fetchDistance: async (): Promise<Distance[]> => {
    set({ loading: true, error: null });
    try {
      const { selectedProject } = useProjectStore.getState();
      if (!selectedProject) {
        throw new Error("No project selected");
      }

      const distanceArray = await getDistance(selectedProject, false);
      set({ distance: distanceArray, loading: false });
      return distanceArray; // ✅ Return it!
    } catch (error: any) {
      const message = error.message || "Failed to fetch distance";
      set({ error: message, loading: false });
      console.error("Fetch distance failed:", error);
      throw new Error(message);
    }
  },

  clearDistance: () => set({ distance: [], error: null }),
}));