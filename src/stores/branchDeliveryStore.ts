import { create } from 'zustand';

interface BranchDeliveryState {
  isBranchDelivery: boolean;
  setIsBranchDelivery: (value: boolean) => void;
}

export const useBranchDeliveryStore = create<BranchDeliveryState>()((set) => ({
  isBranchDelivery: true,
  setIsBranchDelivery: (value) => set({ isBranchDelivery: value }),
}));