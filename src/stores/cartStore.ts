// store/useToggleStore.js
import { create } from "zustand";
import { ListCart, ItemResaultPrice, CartDetails, Warehouse } from "@/models";

interface ToggleState {
  products: ItemResaultPrice[];
  isCartOpen: boolean;
  openCartId: number | null;
  cartList: ListCart | null;
  isFetchingItems: boolean;
  isSelectingProject: boolean;
  isSelectingTransit: boolean;
  isFindingWarehouse: boolean;
  selectedCartWarehouse: Warehouse | null;
  toggleCart: () => void;
  cartOpen: () => void;
  cartClose: () => void;
  setOpenCart: (cart: ListCart) => void;
  setCartProducts: (products: ItemResaultPrice[]) => void;
  currentCartDetails: CartDetails | null; 
  setCurrentCartDetails: (details: CartDetails) => void;
  setIsFetchingItems: (fetching: boolean) => void; 
  setIsSelectingProject: (selecting: boolean) => void; 
  setIsSelectingTransit: (selecting: boolean) => void; 
  setIsFindingWarehouse: (finding: boolean) => void; 
  setSelectedCartWarehouse: (warehouse: Warehouse | null) => void;
}

export const useControlCart = create<ToggleState>((set) => ({
  products: [],
  isCartOpen: false,
  openCartId: null,
  cartList: null, // Initialize cartList as null
  currentCartDetails: null, // ← Initialize
  isFetchingItems: false,
  isSelectingProject: false,
  isSelectingTransit: false,
  isFindingWarehouse: false,
  selectedCartWarehouse: null,

  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  cartOpen: () => set({ isCartOpen: true }),
  cartClose: () => set({ isCartOpen: false }),
  setOpenCart: (cart: ListCart) => set({ cartList: cart, isCartOpen: false }),
  setCartProducts: (products) => set({ products }),
  setCurrentCartDetails: (details: CartDetails) =>
    set({ currentCartDetails: details }),
  setIsFetchingItems: (fetching) => set({ isFetchingItems: fetching }), 
  setIsSelectingProject: (selecting) => set({ isSelectingProject: selecting }), 
  setIsSelectingTransit: (selecting) => set({ isSelectingTransit: selecting }), 
  setIsFindingWarehouse: (finding) => set({ isFindingWarehouse: finding }), 
  setSelectedCartWarehouse: (warehouse) => set({ selectedCartWarehouse: warehouse }),
}));
