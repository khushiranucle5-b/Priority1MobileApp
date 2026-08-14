import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SettingsState } from '../types/settings.types';

export const useSettingsStore = create<SettingsState>((set) => ({
  themeMode: 'system',
  notificationsEnabled: true,
  locationEnabled: false,
  language: 'en',
  setThemeMode: async (mode) => {
    await AsyncStorage.setItem('themeMode', mode);
    set({ themeMode: mode });
  },
  setNotificationsEnabled: async (enabled) => {
    await AsyncStorage.setItem('notificationsEnabled', JSON.stringify(enabled));
    set({ notificationsEnabled: enabled });
  },
  loadSettings: async () => {
    const mode = await AsyncStorage.getItem('themeMode');
    const notifs = await AsyncStorage.getItem('notificationsEnabled');
    if (mode) set({ themeMode: mode as SettingsState['themeMode'] });
    if (notifs !== null) set({ notificationsEnabled: JSON.parse(notifs) });
  },
}));
