// store/useToggleStore.js
import { create } from "zustand";
import { ListCart, ItemResaultPrice, CartDetails } from "@/models";

interface ToggleState {
  products: ItemResaultPrice[];
  isCartOpen: boolean;
  openCartId: number | null;
  cartList: ListCart | null;
  isFetchingItems: boolean; // ← Add this
  toggleCart: () => void;
  cartOpen: () => void;
  cartClose: () => void;
  setOpenCart: (cart: ListCart) => void;
  setCartProducts: (products: ItemResaultPrice[]) => void;
  currentCartDetails: CartDetails | null; // ← Add this
  setCurrentCartDetails: (details: CartDetails) => void;
  setIsFetchingItems: (fetching: boolean) => void; // ← Add setter
}

export const useControlCart = create<ToggleState>((set) => ({
  products: [],
  isCartOpen: false,
  openCartId: null,
  cartList: null, // Initialize cartList as null
  currentCartDetails: null, // ← Initialize
  isFetchingItems: false,

  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  cartOpen: () => set({ isCartOpen: true }),
  cartClose: () => set({ isCartOpen: false }),
  setOpenCart: (cart: ListCart) => set({ cartList: cart, isCartOpen: false }),
  setCartProducts: (products) => set({ products }),
  setCurrentCartDetails: (details: CartDetails) =>
    set({ currentCartDetails: details }), // ← Add this function
  setIsFetchingItems: (fetching) => set({ isFetchingItems: fetching }), // ← Add
}));
