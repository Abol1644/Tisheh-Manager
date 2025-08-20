import apiClient from "./apiClient";
import type { Warehouse } from "@/models/Warehouses";

export const getWarehouses = async (): Promise<Warehouse[]> => {
  try {
    const response = await apiClient.get<Warehouse[]>(
      "Warehouses/GetAll"
    );
    console.log("wearhouses Gotten:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Get wearhouses API error: ", error);
    
    const serverMessage = error.response?.data || "Failed to fetch wearhouses";
    throw new Error(serverMessage);
  }
};