import apiClient from './apiClient';
import { TransportList, GeoFence, ItemResaultPrice, Distance } from '@/models/'

export const getTransportListSale = async (
  item: ItemResaultPrice[],
  geofence: GeoFence,
  distance: Distance[],
  branchDeliveryCenter: boolean,
  warehouseId: number | undefined
): Promise<TransportList[]> => {
  try {
    const response = await apiClient.post<TransportList[]>('Transport/GetListTansportSale', {
      branchCenterDelivery: branchDeliveryCenter,
      listDistance: distance,
      warehouseId: warehouseId,
      listModelPrice: item,
      modelGeofences: geofence,
    });
    // console.log('❤ get transport sale list', response.data)
    return response.data;
  } catch (error: any) {
    console.error("Get Transport List Sale API error: ", error);
    const serverMessage = error.response?.data || "Failed to find transport sale";
    throw new Error(serverMessage);
  }
};

// export const getTransportList = async (
//   item: ItemResaultPrice,
//   geofence: GeoFence,
//   branchDeliveryCenter: boolean
// ): Promise<TransportList> => {
//   try {
//     const requestUrl = `Tansport/GetListTansport?BranchCenterDelivery=${branchDeliveryCenter}&ActivateTransit=${item.activateTransit}&ActivateWarehouse=${item.activateWarehouse}&ActivateAlternate=${item.activateAlternate}&CategoryId=${item.id}&ModelId=${item.modelId}&CodeAccSupplier=${item.codeAccSupplier}&FloatSupplier=${item.floatSupplier}&CodeAccSeller=${item.codeAccSeller}&FloatSeller=${item.floatSeller}&Product=${item.product}&Service=${item.service}&InTrafficZone=${geofence.inTrafficZone}&ExceptWarehouse=${geofence.exceptWarehouse}&ExceptTransit=${geofence.exceptTransit}`

//     const response = await apiClient.post<TransportList>(requestUrl);
//     console.log('get transport list', response.data)
//     return response.data;
//   } catch (error: any) {
//     console.error('Find transport API error: ', error);
    
//     const serverMessage = error.response?.data || 'Failed to find transport';
//     throw new Error(serverMessage);
//   }
// };
