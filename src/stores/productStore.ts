import { create } from "zustand";
import type { ItemResaultPrice, CategorySale, Warehouse } from "@/models";
import { getItemPrice } from "@/api";
import { useBranchDeliveryStore } from "./branchDeliveryStore";

interface ProductsStore {
  // State
  products: ItemResaultPrice[];
  selectedCategory: CategorySale | null;
  selectedWarehouse: Warehouse | null;
  loading: boolean;
  error: string | null;
  selectedItem: ItemResaultPrice | null;
  setSelectedItem: (item: ItemResaultPrice | null) => void;
  getAvailableUnits: (priceId: number) => ItemResaultPrice[];
  getListModelPrice: (priceId: number) => ItemResaultPrice[];

  // Actions
  setProducts: (products: ItemResaultPrice[]) => void;
  setSelectedCategory: (category: CategorySale | null) => void;
  setSelectedWarehouse: (warehouse: Warehouse | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Async Actions
  fetchProducts: (warehouseId: number, categoryId: number) => Promise<void>;
  clearProducts: () => void;
  clearSelections: () => void;

  // Computed
  filteredProducts: () => ItemResaultPrice[];
}

export const useProductsStore = create<ProductsStore>((set, get) => ({
  // Initial State
  products: [],
  selectedCategory: null,
  selectedWarehouse: null,
  loading: false,
  error: null,
  selectedItem: null,

  // Basic Setters

  setSelectedItem: (item) => set({ selectedItem: item }),

  getAvailableUnits: (priceId) => {
    const { products } = get();

    // Get all products with the same priceId
    const relatedProducts = products.filter((p) => p.priceId === priceId);

    // Group by valueId to get unique units
    const uniqueUnits = new Map();

    relatedProducts.forEach((product) => {
      if (!uniqueUnits.has(product.valueId)) {
        uniqueUnits.set(product.valueId, product);
      }
    });

    return Array.from(uniqueUnits.values());
  },

  getListModelPrice: (priceId:any) => {
    const { products } = get();

    // Get all products with the same priceId
    const TransportListItemShipPrice = products.filter((p) => p.priceId === priceId && p.valueId !== p.valueIdBase);

    return Array.from(TransportListItemShipPrice.values());
  },

  setProducts: (products) => set({ products }),

  setSelectedCategory: (category) => {
    set({ selectedCategory: category });

    // Auto-fetch products when category changes
    const { selectedWarehouse, fetchProducts, clearProducts } = get();

    if (!category) {
      clearProducts();
      return;
    }

    if (selectedWarehouse?.id && category?.id) {
      fetchProducts(selectedWarehouse.id, category.id);
    } else {
      clearProducts();
    }
  },

  setSelectedWarehouse: (warehouse) => {
    set({ selectedWarehouse: warehouse });

    // Clear products and category when warehouse changes
    const { selectedCategory, fetchProducts, clearProducts } = get();

    if (!warehouse) {
      clearProducts();
      set({ selectedCategory: null });
      return;
    }

    // Re-fetch products if category is already selected
    if (warehouse?.id && selectedCategory?.id) {
      fetchProducts(warehouse.id, selectedCategory.id);
    }
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Async Actions
  fetchProducts: async (warehouseId: number, categoryId: number) => {
    const { setLoading, setError, setProducts } = get();

    try {
      setLoading(true);
      setProducts([]);
      setError(null);

      const products = await getItemPrice(warehouseId, categoryId);
      const productArray = Array.isArray(products) ? products : [];

      setProducts(productArray);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch products";
      console.error("❌ Failed to fetch products:", error);
      setError(errorMessage);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  },

  clearProducts: () => {
    set({ products: [], error: null });
  },

  clearSelections: () => {
    set({
      products: [],
      selectedCategory: null,
      selectedWarehouse: null,
      error: null,
    });
  },

  // filteredProducts: () => {
  //   const { products, selectedWarehouse } = get();

  //   if (!selectedWarehouse) return [];

  //   return products.filter(
  //     (product) => product.warehouseId === selectedWarehouse.id
  //   );
  // },

  filteredProducts: () => {
    const { products, selectedWarehouse } = get();

    if (!selectedWarehouse) return [];

    const currentWarehouseId = selectedWarehouse.id;
    const isBranchDelivery = useBranchDeliveryStore.getState().isBranchDelivery;

    // Step 1: Filter products where ValueId === ValueIdBase
    const filteredByValueId = products.filter(
      (p) => p.valueId === p.valueIdBase
    );

    // Step 2: Group by { PriceId, ValueId }
    const grouped = new Map<string, ItemResaultPrice[]>();
    filteredByValueId.forEach((product) => {
      const key = `${product.priceId}-${product.valueId}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(product);
    });

    // Step 3: For each group, select preferred item
    const result: ItemResaultPrice[] = [];
    grouped.forEach((group) => {
      const selectedItem =
        group.find((p) => p.warehouseId === currentWarehouseId) || group[0];

      // If isBranchDelivery is true, only show products from current warehouse
      if (isBranchDelivery && selectedItem.warehouseId !== currentWarehouseId) {
        return; // Skip this product entirely
      }

      if (selectedItem.warehouseId !== currentWarehouseId) {
        result.push({
          ...selectedItem,
          warehouseTitle: "",
          activateWarehouse: false,
          activateAlternate: false,
          codeAccWarehouse: 0,
          discountPriceWarehouse: 0,
          discountPriceWarehouse1: 0,
          discountPriceWarehouse2: 0,
          percentWarehouse: 0,
          priceWarehouse: 0,
          shippingStartTimeWarehouse: 0,
          shippingEndTimeWarehouse: 0,
          percentage: 0,
          percentageDiscount: 0,
          percentageDiscount1: 0,
          percentageDiscount2: 0,
        });
      } else {
        result.push(selectedItem);
      }
    });

    return result;
  },
}));
