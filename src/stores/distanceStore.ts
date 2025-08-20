// src/stores/distanceStore.ts
import { create } from "zustand";
import { getDistance } from "@/api/";
import { Distance } from "@/models/";
import { useProjectStore, useProductsStore } from "@/stores/";

interface DistanceState {
  distance: Distance[];
  loading: boolean;
  error: string | null;
  fetchDistance: () => Promise<void>;
  clearDistance: () => void;
}

export const useDistanceStore = create<DistanceState>((set) => ({
  distance: [],
  loading: false,
  error: null,

  fetchDistance: async () => {
    set({ loading: true, error: null });
    try {
      const { selectedProject } = useProjectStore.getState();
      if (selectedProject) {
        const distanceArray = await getDistance(selectedProject, false);
        set({ distance: distanceArray, loading: false });
      }
    } finally {
      console.log("fetching distance ended");
    }
  },

  clearDistance: () => set({ distance: [], error: null }),
}));
