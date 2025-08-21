import apiClient from "./apiClient";
import { GeoFence, Project } from "@/models/";

export const getGeoFence = async (project: Project): Promise<GeoFence> => {
  try {
    const requestUrl = `Geofence/CheckGeofence?ProjectLatitude=${project.latitude}&ProjectLongitude=${project.longitude}`;

    const response = await apiClient.get<GeoFence>(requestUrl);

    // console.log("GeoFence API Response:", response.data);

    return response.data;
  } catch (error: any) {
    console.error("Get GeoFence API error:", error);
    
    const serverMessage = error.response?.data || "Failed to fetch GeoFence";
    throw new Error(serverMessage);
  }
};
