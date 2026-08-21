export type ThemeMode = 'light' | 'dark' | 'system';

export interface SettingsState {
  themeMode: ThemeMode;
  notificationsEnabled: boolean;
  locationEnabled: boolean;
  language: string;
  biometricLockEnabled: boolean;
  shiftRemindersEnabled: boolean;
  incidentAlertsEnabled: boolean;
  loneWorkerAlertsEnabled: boolean;
  selfieCheckInRequired: boolean;
  autoClockOutTimeout: number;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
  setLocationEnabled: (enabled: boolean) => Promise<void>;
  setBiometricLockEnabled: (enabled: boolean) => Promise<void>;
  setShiftRemindersEnabled: (enabled: boolean) => Promise<void>;
  setIncidentAlertsEnabled: (enabled: boolean) => Promise<void>;
  setLoneWorkerAlertsEnabled: (enabled: boolean) => Promise<void>;
  setSelfieCheckInRequired: (required: boolean) => Promise<void>;
  setAutoClockOutTimeout: (hours: number) => Promise<void>;
  loadSettings: () => Promise<void>;
}
