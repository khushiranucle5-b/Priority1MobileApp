import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import { CONFIG } from '../constants/config';

export const apiClient = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

const getAccessToken = async (): Promise<string | null> => {
  const credentials = await Keychain.getGenericPassword();
  if (credentials) {
    return JSON.parse(credentials.password).accessToken;
  }
  return null;
};

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await getAccessToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      console.error('Error fetching token', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const credentials = await Keychain.getGenericPassword();
        if (credentials) {
          const { refreshToken } = JSON.parse(credentials.password);
          const { data } = await axios.post(`${CONFIG.API_BASE_URL}/auth/refresh`, { refreshToken });
          await Keychain.setGenericPassword('tokens', JSON.stringify({ accessToken: data.accessToken, refreshToken }));
          apiClient.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Refresh token failed', refreshError);
        await Keychain.resetGenericPassword();
      }
    }
    return Promise.reject(error);
  }
);
