import apiClient from "./apiClient";
import type { Project, Account } from "@/models/";

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

export const getAllProjects = async (): Promise<Project[]> => {
  console.log("Getting All Projects");
  try {
    const response = await apiClient.get<Project[]>(
      "Projects/GetAll"
    );
    return response.data;
  } catch (error: any) {
    console.error("Get All Projects API error: ", error);
    const serverMessage = error.response?.data || "Failed to fetch All Projects";
    throw new Error(serverMessage);
  }
};

export const getConnectedProject = async (
  BranchCenterDelivery: boolean,
  id: number
): Promise<Project[]> => {
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

export const addProject = async (
  title: string,
  address: string,
  longitude: number,
  latitude: number,
  elevation: number,
  recipientName: string,
  recipientNumber: string,
  nationalId: number
): Promise<Project> => {
  try {
    const response = await apiClient.post<Project>("/Projects/Add", {
      title: title,
      address: address,
      longitude: longitude,
      latitude: latitude,
      elevation: elevation,
      recipientName: recipientName,
      recipientNumber: recipientNumber,
    });
    // console.log("Add Project responce: " , response.data)
    return response.data;
  } catch (error: any) {
    console.error("Add Project API error: ", error);

    const serverMessage = error.response?.data || "Add Project failed";
    throw new Error(serverMessage);
  }
};

export const findProject = async (projectId: number): Promise<Project> => {
  try {
    // const response = await apiClient.post<Project>("/Projects/Find", {
    //   Id: projectId,
    // });
    const response = await apiClient.post<Project>(`/Projects/Find?Id=${projectId}`);
    return response.data;
  } catch (error: any) {
    console.error("Find Project API error: ", error);

    const serverMessage = error.response?.data || "Find Project failed";
    throw new Error(serverMessage);
  }
};

export const editProject = async (project: Project): Promise<Project> => {
  try {
    const response = await apiClient.put<Project>("/Projects/UpdatePut", {
      id: project.id,
      title: project.title,
      address: project.address,
      longitude: project.longitude,
      latitude: project.latitude,
      elevation: project.elevation,
      recipientName: project.recipientName,
      recipientNumber: project.recipientNumber,
      codeAccConnect: project.codeAccConnect,
      postalCode: project.postalCode,
      nationalId: project.nationalId,
      systemy: project.systemy,
      dateTime: project.dateTime,
      userIdMng: project.userIdMng,
      userIpMng: project.userIpMng,
    });
    console.log("✏ Edit Project responce: " , response.data)
    return response.data;
  } catch (error: any) {
    console.error("Edit Project API error: ", error);

    const serverMessage = error.response?.data || "Edit Project failed";
    throw new Error(serverMessage);
  }
};


export const deleteProjects = async (projectIds: number[]): Promise<void> => {
  try {
    const response = await apiClient.delete<void>("/Projects/Delete", {
      data: projectIds, // Axios uses `data` option to send body with DELETE
    });
    console.log("🗑️ Delete Projects response:", response.data);
  } catch (error: any) {
    console.error("Delete Projects API error:", error);

    const serverMessage = error.response?.data || "Delete Projects failed";
    throw new Error(serverMessage);
  }
};

export const deleteProject = async (projectId: number): Promise<void> => {
  try {
    const response = await apiClient.delete<void>("/Projects/Delete", {
       data: [projectId], // ✅ Now sends [123] as JSON array
    });
    console.log("🗑️ Delete Project response:", response.data);
  } catch (error: any) {
    console.error("Delete Project API error:", error);
    const serverMessage = error.response?.data || "Delete Project failed";
    throw new Error(serverMessage);
  }
};

export const connectProject = async (
  project: Project,
  account: Account
): Promise<Project> => {
  try {
    const updatedProject = { ...project };
    
    if (!updatedProject.codeAccConnect) {
      updatedProject.codeAccConnect = "";
    }
    
    // Check if already connected (avoid duplicates)
    const currentCodes = updatedProject.codeAccConnect
      .split(',')
      .filter(code => code.trim() !== '');
    
    if (!currentCodes.includes(account.codeAcc)) {
      updatedProject.codeAccConnect += account.codeAcc + ",";
    }
    
    const response = await apiClient.post("/Accounts/UpdatePutConnectProjects", [updatedProject]);
    return updatedProject;
  } catch (error: any) {
    console.error("Connect Project API error:", error);
    const serverMessage = error.response?.data || "Connect Project failed";
    throw new Error(serverMessage);
  }
};

// Disconnect a project from an account
export const disconnectProject = async (
  project: Project,
  account: Account
): Promise<Project> => {
  try {
    const updatedProject = { ...project };
    console.log("🚀 ~ disconnectProject ~ updatedProject:", updatedProject);

    if (!updatedProject.codeAccConnect) {
      updatedProject.codeAccConnect = "";
      return updatedProject;
    }
    
    // Remove the specific account code (with comma)
    updatedProject.codeAccConnect = updatedProject.codeAccConnect.replace(
      account.codeAcc + ",", 
      ""
    );
    
    const response = await apiClient.post("/Accounts/UpdatePutConnectProjects", [updatedProject]);
    console.log("🚀 ~ disconnectProject ~ response:", response)
    return updatedProject;
  } catch (error: any) {
    console.error("Disconnect Project API error:", error);
    const serverMessage = error.response?.data || "Disconnect Project failed";
    throw new Error(serverMessage);
  }
};

// Bulk connect multiple projects to an account
export const connectMultipleProjects = async (
  projects: Project[],
  account: Account
): Promise<Project[]> => {
  try {
    const updatedProjects = projects.map(project => {
      const updatedProject = { ...project };
      
      if (!updatedProject.codeAccConnect) {
        updatedProject.codeAccConnect = "";
      }
      
      const currentCodes = updatedProject.codeAccConnect
        .split(',')
        .filter(code => code.trim() !== '');
      
      if (!currentCodes.includes(account.codeAcc)) {
        updatedProject.codeAccConnect += account.codeAcc + ",";
      }
      
      return updatedProject;
    });
    
    const response = await apiClient.post("/Accounts/UpdatePutConnectProjects", updatedProjects);
    return updatedProjects;
  } catch (error: any) {
    console.error("Bulk Connect Projects API error:", error);
    const serverMessage = error.response?.data || "Bulk Connect Projects failed";
    throw new Error(serverMessage);
  }
};

// Bulk disconnect multiple projects from an account
export const disconnectMultipleProjects = async (
  projects: Project[],
  account: Account
): Promise<Project[]> => {
  try {
    const updatedProjects = projects.map(project => {
      const updatedProject = { ...project };
      
      if (!updatedProject.codeAccConnect) {
        updatedProject.codeAccConnect = "";
        return updatedProject;
      }
      
      updatedProject.codeAccConnect = updatedProject.codeAccConnect.replace(
        account.codeAcc + ",", 
        ""
      );
      
      return updatedProject;
    });
    
    const response = await apiClient.post("/Accounts/UpdatePutConnectProjects", updatedProjects);
    return updatedProjects;
  } catch (error: any) {
    console.error("Bulk Disconnect Projects API error:", error);
    const serverMessage = error.response?.data || "Bulk Disconnect Projects failed";
    throw new Error(serverMessage);
  }
};