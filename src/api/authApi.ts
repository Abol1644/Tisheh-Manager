import apiClient from './apiClient';
import type { AuthResponse } from '@/models/AuthResponse';
import type { Organ } from '@/models/Organ';
import type { Period } from '@/models/Period';

export const loginApi = async (
  mobile: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>('/Auth/Login', {
      Mobile: mobile,
      Password: password,
    });
    // console.log("login responce: " , response)
    // console.log("login responce: " , response.data)
    return response.data;
  } catch (error: any) {
    console.error('Login API error: ', error);
    
    const serverMessage = error.response?.data || 'Login failed';
    throw new Error(serverMessage);
  }
};

export const getOrgans = async (): Promise<Organ[]> => {
  try {
    const response = await apiClient.get<Organ[]>('/Organs/GetAll');
    // console.log('Organs:', response.data )
    return response.data;
  } catch (error: any) {
    console.error('Get organs API error: ', error);
    
    const serverMessage = error.response?.data || 'Failed to fetch organs';
    throw new Error(serverMessage);
  }
};

export const getPeriods = async (organId: number): Promise<Period[]> => {
  try {
    const response = await apiClient.get<Period[]>(
      `/FinancialPeriod/GetAll?OrganId=${organId}`
    );
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    console.error('Get periods API error: ', error);
    
    const serverMessage = error.response?.data || 'Failed to fetch periods';
    throw new Error(serverMessage);
  }
};