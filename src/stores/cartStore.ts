// store/useToggleStore.js
import { create } from "zustand";
import {
  ListCart,
  ItemResaultPrice,
  CartDetails,
  Warehouse,
  CartShipment,
} from "@/models";

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
  currentCartDetails: CartDetails | null;
  cartShipments: CartShipment[];
  selectedItemKeys: Set<number>;

  // Actions
  toggleCart: () => void;
  cartOpen: () => void;
  cartClose: () => void;
  setOpenCart: (cart: ListCart) => void;
  setCartProducts: (products: ItemResaultPrice[]) => void;
  setCurrentCartDetails: (details: CartDetails) => void;
  setIsFetchingItems: (fetching: boolean) => void;
  setIsSelectingProject: (selecting: boolean) => void;
  setIsSelectingTransit: (selecting: boolean) => void;
  setIsFindingWarehouse: (finding: boolean) => void;
  setSelectedCartWarehouse: (warehouse: Warehouse | null) => void;
  setSelectedItemKeys: (keys: Set<number>) => void;
  toggleSelectedItem: (item: ItemResaultPrice) => void;
  clearSelectedItems: () => void;

  // Shipment Actions
  addShipment: (shipment: Omit<CartShipment, 'id'>) => number;
  removeShipment: (id: number) => void;
  updateShipment: (id: number, updates: Partial<CartShipment>) => void;
}

export const useControlCart = create<ToggleState>((set, get) => {
  let nextId = 1; // Simple ID counter

  return {
    // Initial State
    products: [],
    isCartOpen: false,
    openCartId: null,
    cartList: null,
    currentCartDetails: null,
    isFetchingItems: false,
    isSelectingProject: false,
    isSelectingTransit: false,
    isFindingWarehouse: false,
    selectedCartWarehouse: null,
    cartShipments: [],
    selectedItemKeys: new Set(), // ← Initialize here

    // Actions
    toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
    cartOpen: () => set({ isCartOpen: true }),
    cartClose: () => set({ isCartOpen: false }),

    setOpenCart: (cart) => set({ cartList: cart }),

    setCartProducts: (products) => set({ products }), // Pure – no mapping!

    setCurrentCartDetails: (details) => set({ currentCartDetails: details }),

    setIsFetchingItems: (fetching) => set({ isFetchingItems: fetching }),
    setIsSelectingProject: (selecting) => set({ isSelectingProject: selecting }),
    setIsSelectingTransit: (selecting) => set({ isSelectingTransit: selecting }),
    setIsFindingWarehouse: (finding) => set({ isFindingWarehouse: finding }),
    setSelectedCartWarehouse: (warehouse) => set({ selectedCartWarehouse: warehouse }),
    setSelectedItemKeys: (keys: Set<number>) => set({ selectedItemKeys: new Set(keys) }),

    toggleSelectedItem: (item: ItemResaultPrice) => {
      const key = item.ididentity + item.warehouseId;
      set((state) => {
        const newSet = new Set(state.selectedItemKeys);
        if (newSet.has(key)) {
          newSet.delete(key);
        } else {
          newSet.add(key);
        }
        return { selectedItemKeys: newSet };
      });
    },

    clearSelectedItems: () => set({ selectedItemKeys: new Set() }),

    // Shipment Management
    addShipment: (shipment) => {
      const id = nextId++;
      set((state) => ({
        cartShipments: [...state.cartShipments, { id, ...shipment }],
      }));
      return id;
    },

    removeShipment: (id) => {
      set((state) => ({
        cartShipments: state.cartShipments.filter((s) => s.id !== id),
        products: state.products.map((p) =>
          p.tempShipmentId === id ? { ...p, tempShipmentId: null } : p
        ),
      }));
    },

    updateShipment: (id, updates) => {
      set((state) => ({
        cartShipments: state.cartShipments.map((s) =>
          s.id === id ? { ...s, ...updates } : s
        ),
      }));
    },
  };
});