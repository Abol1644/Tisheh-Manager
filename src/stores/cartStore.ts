// store/useToggleStore.js
import { create } from 'zustand';
import { ListCart, ItemResaultPrice } from '@/models'

interface ToggleState {
  products: ItemResaultPrice[];
  isCartOpen: boolean;
  openCartId: number | null;
  cartList: ListCart | null; 
  toggleCart: () => void;
  cartOpen: () => void;
  cartClose: () => void;
  setOpenCart: (cart: ListCart) => void;
  setCartProducts: (products: ItemResaultPrice[]) => void;
}

export const useControlCart = create<ToggleState>((set) => ({
  products: [],
  isCartOpen: false,
  openCartId: null,
  cartList: null, // Initialize cartList as null
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  cartOpen: () => set({ isCartOpen: true }),
  cartClose: () => set({ isCartOpen: false }),
  setOpenCart: (cart: ListCart) => set({ cartList: cart }),
  setCartProducts: (products) => set({ products }),
}));
