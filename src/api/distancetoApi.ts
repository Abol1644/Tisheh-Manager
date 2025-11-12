// src/api/distance.ts
import apiClient from "./apiClient";
import { Distance, Warehouse, Project } from "@/models/";
import { useProjectStore, useProductsStore } from "@/stores/";

export const getDistance = async ( project: Project, onlyLoad: false ): Promise<Distance[]> => {
  try {
    const requestUrl = `Transport/ReLoadDistance?&ProjectId=${project.id}&LatitudeProject=${project.latitude}&LongitudeProject=${project.longitude}&ElevationProject=${project.elevation}&OnlyLoad=${onlyLoad}`;
    const response = await apiClient.post<Distance[] | Distance>( requestUrl );
    let distanceArray: Distance[] = [];
    if (Array.isArray(response.data)) {
      distanceArray = response.data;
    } else if (response.data && typeof response.data === "object") {
      distanceArray = [response.data];
      console.warn(
        "API returned single Distance object; wrapping in array.",
        response.data
      );
    }
    console.log("Resolved distance array:", distanceArray);
    return distanceArray;
  } catch (error: any) {
    console.error("API error fetching distance:", error);
    const serverMessage = error.response.data || "Failed to fetch distance";
    throw new Error(serverMessage);
  }
};

export const reloadDistance = async (
  project: Project | null,
  onlyLoad: boolean
): Promise<Distance[]> => {
  if (!project) {
    throw new Error("Project is required for reloadDistance");
  }
  const requestUrl = `Transport/ReLoadDistance?&ProjectId=${project.id}&LatitudeProject=${project.latitude}&LongitudeProject=${project.longitude}&ElevationProject=${project.elevation}&OnlyLoad=${onlyLoad}`;
  console.log("requseting reload distance:", requestUrl);
  try {
    const response = await apiClient.post<Distance[] | Distance>(requestUrl);

    let distanceArray: Distance[] = [];

    if (Array.isArray(response.data)) {
      distanceArray = response.data;
    } else if (response.data && typeof response.data === "object") {
      distanceArray = [response.data];
      console.warn(
        "API returned single Distance object; wrapping in array.",
        response.data
      );
    }

    console.log("Resolved distance array:", distanceArray);
    return distanceArray;
  } catch (error: any) {
    console.error("API error fetching distance:", error);

    const serverMessage = error.response.data || "Failed to fetch distance";
    throw new Error(serverMessage);
  }
};
