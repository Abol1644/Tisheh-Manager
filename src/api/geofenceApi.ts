import apiClient from "./apiClient";
import { GeoFence, Project, PointDetails, PointElevation, LocationSearchResault } from "@/models/";

export const getGeoFence = async (project: Project): Promise<GeoFence> => {
  try {
    const requestUrl = `Geofence/CheckGeofence?ProjectLatitude=${project.latitude}&ProjectLongitude=${project.longitude}`;

    const response = await apiClient.get<GeoFence>(requestUrl);
    // console.log("🎀 ~ getGeoFence ~ response:", response.data)

    return response.data;
  } catch (error: any) {
    console.error("Get GeoFence API error:", error);
    
    const serverMessage = error.response?.data || "Failed to fetch GeoFence";
    throw new Error(serverMessage);
  }
};

export const getPointDetails = async (longitude: number, latitude: number): Promise<PointDetails> => {
  try {
    const requestUrl = `Geofence/GetPointDetails?Latitude=${latitude}&Longitude=${longitude}`;

    const response = await apiClient.get<PointDetails>(requestUrl);

    return response.data;
  } catch (error: any) {
    console.error("Get getPointDetails API error:", error);
    
    const serverMessage = error.response?.data || "Failed to fetch getPointDetails";
    throw new Error(serverMessage);
  }
};

export const getPointElevation = async (longitude: number, latitude: number): Promise<PointElevation> => {
  try {
    const requestUrl = `Geofence/GetPointElevations?Latitude=${longitude}&Longitude=${latitude}`;

    const response = await apiClient.get<PointElevation>(requestUrl);

    return response.data;
  } catch (error: any) {
    console.error("Get getPointElevation API error:", error);
    
    const serverMessage = error.response?.data || "Failed to fetch getPointElevation";
    throw new Error(serverMessage);
  }
};

export const getLocationSearch = async (searchStr: string, latitudeCenter: number, longitudeCenter: number): Promise<LocationSearchResault> => {
  console.log("🤳 ~ getLocationSearch ~ response:")
  try {
    const requestUrl = `Geofence/GetLocationSearch?SearchStr=${encodeURIComponent(searchStr)}&LatitudeCenter=${longitudeCenter}&LongitudeCenter=${latitudeCenter}`;

    const response = await apiClient.get<LocationSearchResault>(requestUrl);
    console.log("🤳 ~ getLocationSearch ~ response:", response.data)

    return response.data;
  } catch (error: any) {
    console.error("Get Location Search API error:", error);
    
    const serverMessage = error.response?.data || "Failed to fetch location search";
    throw new Error(serverMessage);
  }
};
