// src/stores/distanceStore.ts
import { create } from "zustand";
import { getDistance } from "@/api/";
import { Distance } from "@/models/";
import { Project } from "@/models/";

interface DistanceState {
  distance: Distance[];
  setDistance: (distance: Distance[]) => void;
  loading: boolean;
  error: string | null;
  fetchDistance: (project: Project | undefined) => Promise<Distance[]>; // ← Accept project as arg
  clearDistance: () => void;
}

export const useDistanceStore = create<DistanceState>((set) => ({
  distance: [],
  loading: false,
  error: null,
  setDistance: (distance: Distance[]) => set({ distance }),

  fetchDistance: async (project): Promise<Distance[]> => {
    if (!project) {
      const error = new Error("No project provided");
      set({ error: error.message, loading: false });
      throw error;
    }

    set({ loading: true, error: null });

    try {
      const distanceArray = await getDistance(project, false);
      set({ distance: distanceArray, loading: false });
      return distanceArray;
    } catch (error: any) {
      const message = error.message || "Failed to fetch distance";
      set({ error: message, loading: false });
      console.error("Fetch distance failed:", error);
      throw new Error(message);
    }
  },

  clearDistance: () => set({ distance: [], error: null }),
}));