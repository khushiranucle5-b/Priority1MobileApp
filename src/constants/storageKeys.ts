export const STORAGE_KEYS = {
  // Keychain (secure)
  AUTH_TOKENS: 'auth_tokens',

  // AsyncStorage (non-sensitive)
  THEME_MODE: 'themeMode',
  NOTIFICATIONS_ENABLED: 'notificationsEnabled',
  LANGUAGE: 'language',
  LAST_SYNC_AT: 'lastSyncAt',
  OFFLINE_ATTENDANCE_QUEUE: 'offlineAttendanceQueue',
  OFFLINE_PATROL_QUEUE: 'offlinePatrolQueue',
  OFFLINE_INCIDENT_QUEUE: 'offlineIncidentQueue',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
