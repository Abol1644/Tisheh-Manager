import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://api.skantisheh.ir/api',
  // baseURL: 'http://192.168.100.100:5230/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

const getAuthToken = () => localStorage.getItem('token');

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
