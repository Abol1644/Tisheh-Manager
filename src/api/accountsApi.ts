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
    console.warn("Get Sale Accounts API");
    const response = await apiClient.get<Account[]>("/Accounts/GetAllSale");
    return response.data;
  } catch (error: any) {
    console.error("Get Sale Accounts API error: ", error);
    
    const serverMessage = error.response?.data || "Failed to fetch Sale Accounts";
    throw new Error(serverMessage);
  }
};

export const addSaleAccount = async (
  title: string,
  description: string,
  genderId: number,
  nationalId: string,
  foreignNational: boolean,
  phoneNumbers: string[],
  phoneNumberDescriptions: string[],
): Promise<Account> => {
  try {
    // Convert Persian digits to English digits
    const convertPersianToEnglish = (persianNumber: string): string => {
      return persianNumber
        .replace(/۰/g, '0')
        .replace(/۱/g, '1')
        .replace(/۲/g, '2')
        .replace(/۳/g, '3')
        .replace(/۴/g, '4')
        .replace(/۵/g, '5')
        .replace(/۶/g, '6')
        .replace(/۷/g, '7')
        .replace(/۸/g, '8')
        .replace(/۹/g, '9');
    };

    const accountsSaleContactDetails = phoneNumbers
      .filter(phoneNumber => phoneNumber && phoneNumber.trim() !== '')
      .map((phoneNumber, index) => {
        const englishNumber = convertPersianToEnglish(phoneNumber);
        console.log("Converting phone number:", phoneNumber, "->", englishNumber);
        
        // Parse as BigInt first to check if it's too large for Int32
        const bigIntValue = BigInt(englishNumber);
        const maxInt32 = 2147483647n;
        
        // If number is too large, we might need to send it as string or handle differently
        const numberId = bigIntValue > maxInt32 ? 0 : Number(bigIntValue);
        
        console.log("Final numberId:", numberId, "Original:", englishNumber);
        
        return {
          countryNumber: 98,
          provinceNumber: 21,
          numberId: 1,
          numberDescription: englishNumber,
          description: phoneNumberDescriptions[index] || ''
        };
      });

    const response = await apiClient.post<Account>("/Accounts/AddSale", {
      codeAcc: 0,
      title: title,
      description: description,
      contactId: 0,
      contactGroupId: 1,
      codeAccConnect: 0,
      genderId: genderId,
      nationalId: nationalId,
      foreignNational: foreignNational,
      accountsSaleContactDetails: accountsSaleContactDetails
    });
    return response.data;
  } catch (error: any) {
    console.error("Add Sale Account API error: ", error);
    
    const serverMessage = error.response?.data || "Failed to add Sale Account";
    throw new Error(serverMessage);
  }
};

export const deleteAccount = async (accountId: string): Promise<void> => {
  try {
    const accountIdInt = parseInt(accountId);
    const response = await apiClient.delete<void>("/Accounts/Delete", {
      data: [accountIdInt],
    });
    console.log("🗑️ Delete Account response:", response.data);
  } catch (error: any) {
    console.error("Delete Account API error:", error);
    const serverMessage = error.response?.data || "Delete Account failed";
    throw new Error(serverMessage);
  }
};
