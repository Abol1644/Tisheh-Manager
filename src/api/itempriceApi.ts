import apiClient from './apiClient';
import { ItemResaultPrice } from '@/models/'


export const getItemPrice = async ( warehouseId:number, itemId:number): Promise<ItemResaultPrice[]> => {
  try {
    const response = await apiClient.get<ItemResaultPrice[]>(`/DashboardSale/GetListModelsPrices?Id=${itemId}&WarehouseId=${warehouseId}`);
    // console.log('Get prices list: ', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Get prices API error: ', error);
    
    const serverMessage = error.response?.data || 'Failed to fetch prices';
    throw new Error(serverMessage);
  }
};