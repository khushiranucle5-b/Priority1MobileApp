export type ThemeMode = 'light' | 'dark' | 'system';

export interface SettingsState {
  themeMode: ThemeMode;
  notificationsEnabled: boolean;
  locationEnabled: boolean;
  language: string;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
  loadSettings: () => Promise<void>;
}
