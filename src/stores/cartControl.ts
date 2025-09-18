// store/useToggleStore.js
import { create } from 'zustand';

interface ToggleState {
  isCartOpen: boolean;
  toggleCart: () => void;
  cartOpen: () => void;
  cartClose: () => void;
}

export const useControlCart = create<ToggleState>((set) => ({
  isCartOpen: false,
  toggleCart: () => set((state:any) => ({ isCartOpen: !state.isCartOpen })),
  cartOpen: () => set({ isCartOpen: true }),
  cartClose: () => set({ isCartOpen: false }),
}));