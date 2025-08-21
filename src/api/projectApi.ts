import apiClient from "./apiClient";
import type { Project } from "@/models/Projects";

export const getUnConnectedProjects = async (): Promise<Project[]> => {
  console.log("Getting Projects");
  try {
    const response = await apiClient.get<Project[]>(
      "Projects/GetAll?BranchCenterDelivery=false&OnlyNoConnect=true"
    );
    return response.data;
  } catch (error: any) {
    // console.error("Get Projects API error: ", error);
    
    const serverMessage = error.response?.data || "Failed to fetch Projects";
    throw new Error(serverMessage);
  }
};

export const getConnectedProject = async (BranchCenterDelivery:boolean, id:number): Promise<Project[]> => {
  console.log("Getting Connected Project");
  try {
    const response = await apiClient.get<Project[]>(
      `Projects/GetAll?CodeAccConnect=${id}&BranchCenterDelivery=${BranchCenterDelivery}`
    );
    // console.error("Get Projects API : ", response.data);
    return response.data;
  } catch (error: any) {

    console.error("Get Projects API error: ", error);
    
    const serverMessage = error.response?.data || "Failed to fetch Projects";
    throw new Error(serverMessage);
  }
};

