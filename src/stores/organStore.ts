import { create } from 'zustand';
import type { Organ, Period } from '@/models/';
import { getOrgans, getPeriods } from '@/api'; 

interface OrgansStore {
  // Organs
  organs: Organ[];
  loading: boolean;  // ✅ Restored original loading
  setOrgans: (organs: Organ[]) => void;
  setLoading: (loading: boolean) => void;  // ✅ Restored
  fetchOrgans: () => Promise<void>;
  
  // Periods
  periods: Period[];
  periodsLoading: boolean;
  selectedPeriod: Period | null;
  setPeriods: (periods: Period[]) => void;
  setPeriodsLoading: (loading: boolean) => void;
  setSelectedPeriod: (period: Period | null) => void;
  fetchPeriods: (companyId: number) => Promise<void>;
}

export const useOrgansStore = create<OrgansStore>((set, get) => ({
  // Organs state
  organs: [],
  loading: false,  // ✅ Restored original loading
  
  // Periods state
  periods: [],
  periodsLoading: false,
  selectedPeriod: null,
  
  // Organs actions
  setOrgans: (organs) => set({ organs }),
  setLoading: (loading) => set({ loading }),  // ✅ Restored
  
  fetchOrgans: async () => {
    set({ loading: true });  // ✅ Uses original loading
    try {
      const organs = await getOrgans();
      set({ organs });
    } catch (error) {
      console.error('Failed to fetch organs:', error);
    } finally {
      set({ loading: false });  // ✅ Uses original loading
    }
  },
  
  // Periods actions
  setPeriods: (periods) => set({ periods }),
  setPeriodsLoading: (loading) => set({ periodsLoading: loading }),
  setSelectedPeriod: (period) => set({ selectedPeriod: period }),
  
  fetchPeriods: async (companyId: number) => {
    set({ periodsLoading: true });
    try {
      const periods = await getPeriods(companyId);
      set({ periods });
    } catch (error) {
      console.error('Failed to fetch periods:', error);
    } finally {
      set({ periodsLoading: false });
    }
  },
}));