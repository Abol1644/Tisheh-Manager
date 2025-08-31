import apiClient from "./apiClient";
import type { Account, AccountSale } from "@/models/Accounts";

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
    console.log("📊 ~ getSaleAccounts ~ response.data:", response.data);
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
  numberId: number,
  nationalId: string,
  foreignNational: boolean,
  phoneNumbers: string[],
  phoneNumberDescriptions: string[],
): Promise<Account> => {
  try {
    const accountsSaleContactDetails = phoneNumbers
      .filter(phoneNumber => phoneNumber && phoneNumber.trim() !== '')
      .map((phoneNumber, index) => {

        return {
          countryNumber: 98,
          provinceNumber: 21,
          numberId: numberId,
          numberDescription: phoneNumber,
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
    console.log("➕ ~ addSaleAccount ~ response.data:", response.data)
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

export const findAccount = async (accountId: number): Promise<AccountSale> => {
  try {
    const response = await apiClient.post<AccountSale>(`/Accounts/FindSale?CodeAcc=${accountId}`);
    return response.data;
  } catch (error: any) {
    console.error("Find Account API error: ", error);

    const serverMessage = error.response?.data || "Find Account failed";
    throw new Error(serverMessage);
  }
};

export const editAccount = async (account: AccountSale): Promise<AccountSale> => {
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

    // Process contact details to ensure proper data types
    const processedContactDetails = account.accountsSaleContactDetails?.map(contact => ({
      ididentity: contact.ididentity || 0,
      countryNumber: contact.countryNumber || 98,
      provinceNumber: contact.provinceNumber || 21,
      numberId: contact.numberId || 1,
      numberDescription: typeof contact.numberDescription === 'string' 
        ? parseInt(convertPersianToEnglish(contact.numberDescription)) || 0
        : contact.numberDescription,
      description: contact.description || ''
    })) || [];

    const response = await apiClient.put<AccountSale>(`/Accounts/UpdatePutSale`, {
      codeAcc: account.codeAcc,
      title: account.title,
      description: account.description,
      contactId: account.contactId || 0,
      contactGroupId: account.contactGroupId || 1,
      codeAccConnect: account.codeAccConnect || account.codeAcc,
      genderId: account.genderId,
      nationalId: account.nationalId,
      foreignNational: account.foreignNational,
      accountsSaleContactDetails: processedContactDetails
    });
    console.log("✏ Edit Account responce: " , response.data)
    return response.data;
  } catch (error: any) {
    console.error("Edit Account API error: ", error);

    const serverMessage = error.response?.data || "Edit Account failed";
    throw new Error(serverMessage);
  }
};