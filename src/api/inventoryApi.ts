import apiClient from "./apiClient";
import { ItemResaultPrice, Inventory, Period } from "@/models/";

export const getInventory = async (
  item: ItemResaultPrice,
  period: Period,
  numberRequired: number
): Promise<Inventory> => {
  try {
    const response = await apiClient.get<Inventory>(`Cardex/GetInventoryProduct?CategoryId=${item.id}&ModelId=${item.modelId}&WarehouseId=${item.warehouseId}&VirtualWarehouse=${item.virtualWarehouse}&DependentOnInventoryInWarehouse=${item.dependentOnInventoryInWarehouse}&EscrowBalance=${item.escrowBalance}&UnlimitedInventory=${item.unlimitedInventory}&NumberRequired=${numberRequired}&UnitRatio=${item.unitRatio}&StartDate=${period.dateTimeStart}&EndDate=${period.dateTimeEnd}`);
    console.log("Get Inventory list: ", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Get Inventory API error: ", error);
    
    const serverMessage = error.response?.data || "Failed to fetch Inventory";
    throw new Error(serverMessage);
  }
};
