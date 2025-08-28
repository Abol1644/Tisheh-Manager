import apiClient from "./apiClient";
import { CategorySale } from "@/models/"

export const getSaleCategories = async (): Promise<CategorySale[]> => {
  try {
    const response = await apiClient.get<CategorySale[]>(
      'Category/GetAllCategorySale'
    );
    // console.log('CategorySale Gottne: ', response.data)
    return response.data;
  } catch (error: any) {
    console.error("Find CategorySale API error: ", error);
    
    const serverMessage = error.response?.data || "Failed to find CategorySale";
    throw new Error(serverMessage);
  }
};
