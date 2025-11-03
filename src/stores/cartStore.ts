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
  selectedItemKeys: Set<string>; // ✅ CHANGED: Now uses string keys

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
  setSelectedItemKeys: (keys: Set<string>) => void;
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
    selectedItemKeys: new Set<string>(), // ✅ Explicitly typed as Set<string>

    // Actions
    toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
    cartOpen: () => set({ isCartOpen: true }),
    cartClose: () => set({ isCartOpen: false }),

    setOpenCart: (cart) => set({ cartList: cart }),

    setCartProducts: (products) => set({ products }),

    setCurrentCartDetails: (details) => set({ currentCartDetails: details }),

    setIsFetchingItems: (fetching) => set({ isFetchingItems: fetching }),
    setIsSelectingProject: (selecting) => set({ isSelectingProject: selecting }),
    setIsSelectingTransit: (selecting) => set({ isSelectingTransit: selecting }),
    setIsFindingWarehouse: (finding) => set({ isFindingWarehouse: finding }),
    setSelectedCartWarehouse: (warehouse) => set({ selectedCartWarehouse: warehouse }),
    setSelectedItemKeys: (keys: Set<string>) => set({ selectedItemKeys: new Set(keys) }),

    toggleSelectedItem: (item: ItemResaultPrice) => {
      // ✅ Generate consistent string key: "ididentity-warehouseId"
      const key = `${item.ididentity}-${item.warehouseId}`;
      console.log('🔄 Toggling item:', key, 'Current selected:', Array.from(get().selectedItemKeys));
      
      set((state) => {
        const newSet = new Set(state.selectedItemKeys);
        if (newSet.has(key)) {
          newSet.delete(key);
          console.log('❌ Removed:', key);
        } else {
          newSet.add(key);
          console.log('✅ Added:', key);
        }
        return { selectedItemKeys: newSet };
      });
    },

    clearSelectedItems: () => {
      console.log('🗑️ Clearing all selected items');
      set({ selectedItemKeys: new Set<string>() });
    },

    // Shipment Management
    addShipment: (shipment) => {
      const id = nextId++;
      console.log('➕ Adding shipment:', id);
      set((state) => ({
        cartShipments: [...state.cartShipments, { id, ...shipment }],
      }));
      return id;
    },

    removeShipment: (id) => {
      console.log('🗑️ Removing shipment:', id);
      set((state) => ({
        cartShipments: state.cartShipments.filter((s) => s.id !== id),
        products: state.products.map((p) =>
          p.tempShipmentId === id ? { ...p, tempShipmentId: null } : p
        ),
      }));
    },

    updateShipment: (id, updates) => {
      console.log('📝 Updating shipment:', id, updates);
      set((state) => ({
        cartShipments: state.cartShipments.map((s) =>
          s.id === id ? { ...s, ...updates } : s
        ),
      }));
    },
  };
});