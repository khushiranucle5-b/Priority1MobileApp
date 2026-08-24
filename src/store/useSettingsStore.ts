import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SettingsState } from '../types/settings.types';

export const useSettingsStore = create<SettingsState>((set) => ({
  themeMode: 'system',
  notificationsEnabled: true,
  locationEnabled: true,
  language: 'en',
  biometricLockEnabled: false,
  shiftRemindersEnabled: true,
  incidentAlertsEnabled: true,
  loneWorkerAlertsEnabled: true,
  patrolAlertsEnabled: true,
  leaveStatusAlertsEnabled: true,
  companyNoticesEnabled: true,
  emergencyAlarmSoundEnabled: true,
  selfieCheckInRequired: true,
  autoClockOutTimeout: 12,
  setThemeMode: async (mode) => {
    await AsyncStorage.setItem('themeMode', mode);
    set({ themeMode: mode });
  },
  setNotificationsEnabled: async (enabled) => {
    await AsyncStorage.setItem('notificationsEnabled', JSON.stringify(enabled));
    set({ notificationsEnabled: enabled });
  },
  setLocationEnabled: async (enabled) => {
    await AsyncStorage.setItem('locationEnabled', JSON.stringify(enabled));
    set({ locationEnabled: enabled });
  },
  setBiometricLockEnabled: async (enabled) => {
    await AsyncStorage.setItem('biometricLockEnabled', JSON.stringify(enabled));
    set({ biometricLockEnabled: enabled });
  },
  setShiftRemindersEnabled: async (enabled) => {
    await AsyncStorage.setItem('shiftRemindersEnabled', JSON.stringify(enabled));
    set({ shiftRemindersEnabled: enabled });
  },
  setIncidentAlertsEnabled: async (enabled) => {
    await AsyncStorage.setItem('incidentAlertsEnabled', JSON.stringify(enabled));
    set({ incidentAlertsEnabled: enabled });
  },
  setLoneWorkerAlertsEnabled: async (enabled) => {
    await AsyncStorage.setItem('loneWorkerAlertsEnabled', JSON.stringify(enabled));
    set({ loneWorkerAlertsEnabled: enabled });
  },
  setPatrolAlertsEnabled: async (enabled) => {
    await AsyncStorage.setItem('patrolAlertsEnabled', JSON.stringify(enabled));
    set({ patrolAlertsEnabled: enabled });
  },
  setLeaveStatusAlertsEnabled: async (enabled) => {
    await AsyncStorage.setItem('leaveStatusAlertsEnabled', JSON.stringify(enabled));
    set({ leaveStatusAlertsEnabled: enabled });
  },
  setCompanyNoticesEnabled: async (enabled) => {
    await AsyncStorage.setItem('companyNoticesEnabled', JSON.stringify(enabled));
    set({ companyNoticesEnabled: enabled });
  },
  setEmergencyAlarmSoundEnabled: async (enabled) => {
    await AsyncStorage.setItem('emergencyAlarmSoundEnabled', JSON.stringify(enabled));
    set({ emergencyAlarmSoundEnabled: enabled });
  },
  setSelfieCheckInRequired: async (required) => {
    await AsyncStorage.setItem('selfieCheckInRequired', JSON.stringify(required));
    set({ selfieCheckInRequired: required });
  },
  setAutoClockOutTimeout: async (hours) => {
    await AsyncStorage.setItem('autoClockOutTimeout', JSON.stringify(hours));
    set({ autoClockOutTimeout: hours });
  },
  loadSettings: async () => {
    const mode = await AsyncStorage.getItem('themeMode');
    const notifs = await AsyncStorage.getItem('notificationsEnabled');
    const loc = await AsyncStorage.getItem('locationEnabled');
    const bio = await AsyncStorage.getItem('biometricLockEnabled');
    const shiftR = await AsyncStorage.getItem('shiftRemindersEnabled');
    const incA = await AsyncStorage.getItem('incidentAlertsEnabled');
    const lwA = await AsyncStorage.getItem('loneWorkerAlertsEnabled');
    const patrolA = await AsyncStorage.getItem('patrolAlertsEnabled');
    const leaveA = await AsyncStorage.getItem('leaveStatusAlertsEnabled');
    const compA = await AsyncStorage.getItem('companyNoticesEnabled');
    const alarmS = await AsyncStorage.getItem('emergencyAlarmSoundEnabled');
    const selfie = await AsyncStorage.getItem('selfieCheckInRequired');
    const timeout = await AsyncStorage.getItem('autoClockOutTimeout');

    if (mode) set({ themeMode: mode as SettingsState['themeMode'] });
    if (notifs !== null) set({ notificationsEnabled: JSON.parse(notifs) });
    if (loc !== null) set({ locationEnabled: JSON.parse(loc) });
    if (bio !== null) set({ biometricLockEnabled: JSON.parse(bio) });
    if (shiftR !== null) set({ shiftRemindersEnabled: JSON.parse(shiftR) });
    if (incA !== null) set({ incidentAlertsEnabled: JSON.parse(incA) });
    if (lwA !== null) set({ loneWorkerAlertsEnabled: JSON.parse(lwA) });
    if (patrolA !== null) set({ patrolAlertsEnabled: JSON.parse(patrolA) });
    if (leaveA !== null) set({ leaveStatusAlertsEnabled: JSON.parse(leaveA) });
    if (compA !== null) set({ companyNoticesEnabled: JSON.parse(compA) });
    if (alarmS !== null) set({ emergencyAlarmSoundEnabled: JSON.parse(alarmS) });
    if (selfie !== null) set({ selfieCheckInRequired: JSON.parse(selfie) });
    if (timeout !== null) set({ autoClockOutTimeout: JSON.parse(timeout) });
  },
}));
