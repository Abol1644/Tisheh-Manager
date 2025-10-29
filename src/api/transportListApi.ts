import apiClient from "./apiClient";
import { TransportList, GeoFence, ItemResaultPrice, Distance, Account, Project } from "@/models/";

export const getTransportListSale = async (
  item: ItemResaultPrice[],
  geofence: GeoFence | null,
  distance: Distance[],
  branchDeliveryCenter: boolean,
  warehouseId: number | undefined,
  project: Project | null,
): Promise<TransportList[]> => {
  try {
    const response = await apiClient.post<TransportList[]>(
      '/Transport/GetListTansportSale',
      {
        branchCenterDelivery: branchDeliveryCenter,
        listDistance: distance,
        warehouseId: warehouseId,
        listModelPrice: item,
        modelGeofences: geofence,
        projectCustomerId: project?.id,
        latitudeProject: project?.latitude || 0,
        longitudeProject: project?.longitude || 0,
        elevationProject: project?.elevation || 0,
      }
    );
    console.log('🦈🦈🦈🦈 get transport sale list', project?.id)
    console.log('❤ get transport sale list', response.data)
    return response.data;
  } catch (error: any) {
    console.error("Get Transport List Sale API error: ", error);
    const serverMessage =
      error.response?.data || "Failed to find transport sale";
    throw new Error(serverMessage);
  }
};