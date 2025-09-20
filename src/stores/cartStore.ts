// store/useToggleStore.js
import { create } from 'zustand';

interface ToggleState {
  isCartOpen: boolean;
  openCartId: number | null;
  toggleCart: () => void;
  cartOpen: () => void;
  cartClose: () => void;
  setOpenCartId: (id: number | null) => void;
}

export const useControlCart = create<ToggleState>((set) => ({
  isCartOpen: false,
  openCartId: null,
  toggleCart: () => set((state:any) => ({ isCartOpen: !state.isCartOpen })),
  cartOpen: () => set({ isCartOpen: true }),
  cartClose: () => set({ isCartOpen: false }),
  setOpenCartId: (id: number | null) => set({ openCartId: id }),
}));