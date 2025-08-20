import apiClient from './apiClient';
import { UserData, User } from '@/models/Users'

export const getListOfUsers = async (): Promise<User[]> => {
  try {
    const response = await apiClient.get<User[]>('/UserAccounts/GetAll');
    console.log('Get users list: ', response);
    return response.data;
  } catch (error: any) {
    console.error('Get users API error: ', error);
    
    const serverMessage = error.response?.data || 'Failed to fetch users';
    throw new Error(serverMessage);
  }
};

export const findUser = async (
  Id: string,
): Promise<UserData> => {
  try {
    const response = await apiClient.post<UserData>(
      `/UserAccounts/Find?Id=${Id}`
    );
    // console.log(response)
    return response.data;
  } catch (error: any) {
    console.error('Find current user API error: ', error);
    
    const serverMessage = error.response?.data || 'Failed to find current user';
    throw new Error(serverMessage);
  }
};