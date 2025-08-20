import apiClient from "./apiClient";
import type { Account } from "@/models/Accounts";

export const getCustomerAccounts = async (
  TabagheAcc: number,
  GroupAcc: number,
  KolAcc: number,
  MoeinAcc: number
  // TafziliAcc: number
): Promise<Account[]> => {
  try {
    const response = await apiClient.get<Account[]>(
      // `'/Accounts/GetAll?TabagheAcc=${TabagheAcc}&GroupAcc=${GroupAcc}&KolAcc=${KolAcc}&MoeinAcc=${MoeinAcc}&TafziliAcc=${TafziliAcc}'`
      `/Accounts/GetAll?TabagheAcc=${TabagheAcc}&GroupAcc=${GroupAcc}&KolAcc=${KolAcc}&MoeinAcc=${MoeinAcc}`
    );
    // console.log("Accounts Gotten:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Get accounts API error: ", error);
    
    const serverMessage = error.response?.data || "Failed to fetch accounts";
    throw new Error(serverMessage);
  }
};

export const getSaleAccounts = async (): Promise<Account[]> => {
  try {
    const response = await apiClient.get<Account[]>("/Accounts/GetAllSale");
    return response.data;
  } catch (error: any) {
    console.error("Get Sale Accounts API error: ", error);
    
    const serverMessage = error.response?.data || "Failed to fetch Sale Accounts";
    throw new Error(serverMessage);
  }
};
