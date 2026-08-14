import { create } from 'zustand';
import * as Keychain from 'react-native-keychain';
import { AuthState } from '../types/auth.types';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async (userData, accessToken, refreshToken) => {
    await Keychain.setGenericPassword('tokens', JSON.stringify({ accessToken, refreshToken }));
    set({ user: userData, isAuthenticated: true });
  },
  logout: async () => {
    await Keychain.resetGenericPassword();
    set({ user: null, isAuthenticated: false });
  },
  checkSession: async () => {
    try {
      const credentials = await Keychain.getGenericPassword();
      if (credentials) {
        const { accessToken } = JSON.parse(credentials.password);
        set({ isAuthenticated: !!accessToken, isLoading: false });
      } else {
        set({ isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ isAuthenticated: false, isLoading: false });
    }
  },
}));
