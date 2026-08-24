import { Platform, PermissionsAndroid, Linking } from 'react-native';

export type PermissionStatus = 'granted' | 'denied' | 'blocked' | 'unavailable';

export interface PermissionResult {
  status: PermissionStatus;
  canAskAgain: boolean;
}

// Internal cache for permissions marked as NEVER_ASK_AGAIN by Android OS during session
const blockedPermissions: Record<string, boolean> = {};

export const PermissionsService = {
  /**
   * Check Fine Location permission
   */
  checkLocation: async (): Promise<PermissionStatus> => {
    if (Platform.OS !== 'android') {
      return 'granted';
    }
    try {
      const isGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (isGranted) return 'granted';
      if (blockedPermissions['location']) return 'blocked';
      return 'denied';
    } catch (e) {
      return 'unavailable';
    }
  },

  /**
   * Request Fine Location permission
   */
  requestLocation: async (): Promise<PermissionResult> => {
    if (Platform.OS !== 'android') {
      return { status: 'granted', canAskAgain: true };
    }
    try {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission Required',
          message: 'Priority One Guard App requires location access for attendance geofence verification and lone worker safety check-ins.',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        }
      );

      if (result === PermissionsAndroid.RESULTS.GRANTED) {
        delete blockedPermissions['location'];
        return { status: 'granted', canAskAgain: true };
      } else if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        blockedPermissions['location'] = true;
        return { status: 'blocked', canAskAgain: false };
      } else {
        return { status: 'denied', canAskAgain: true };
      }
    } catch (e) {
      return { status: 'unavailable', canAskAgain: false };
    }
  },

  /**
   * Check Camera permission
   */
  checkCamera: async (): Promise<PermissionStatus> => {
    if (Platform.OS !== 'android') {
      return 'granted';
    }
    try {
      const isGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      if (isGranted) return 'granted';
      if (blockedPermissions['camera']) return 'blocked';
      return 'denied';
    } catch (e) {
      return 'unavailable';
    }
  },

  /**
   * Request Camera permission
   */
  requestCamera: async (): Promise<PermissionResult> => {
    if (Platform.OS !== 'android') {
      return { status: 'granted', canAskAgain: true };
    }
    try {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission Required',
          message: 'Priority One Guard App requires camera access to scan checkpoint QR codes, capture selfie check-ins, and attach photos to incident reports.',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        }
      );

      if (result === PermissionsAndroid.RESULTS.GRANTED) {
        delete blockedPermissions['camera'];
        return { status: 'granted', canAskAgain: true };
      } else if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        blockedPermissions['camera'] = true;
        return { status: 'blocked', canAskAgain: false };
      } else {
        return { status: 'denied', canAskAgain: true };
      }
    } catch (e) {
      return { status: 'unavailable', canAskAgain: false };
    }
  },

  /**
   * Check Notification permission (POST_NOTIFICATIONS on Android 13+)
   */
  checkNotification: async (): Promise<PermissionStatus> => {
    if (Platform.OS !== 'android') {
      return 'granted';
    }
    if (Platform.Version >= 33) {
      try {
        const isGranted = await PermissionsAndroid.check(
          'android.permission.POST_NOTIFICATIONS' as any
        );
        if (isGranted) return 'granted';
        if (blockedPermissions['notification']) return 'blocked';
        return 'denied';
      } catch (e) {
        return 'unavailable';
      }
    }
    return 'granted';
  },

  /**
   * Request Notification permission
   */
  requestNotification: async (): Promise<PermissionResult> => {
    if (Platform.OS !== 'android') {
      return { status: 'granted', canAskAgain: true };
    }
    if (Platform.Version >= 33) {
      try {
        const result = await PermissionsAndroid.request(
          'android.permission.POST_NOTIFICATIONS' as any,
          {
            title: 'Notification Permission Required',
            message: 'Priority One Guard App requires notification permission for shift reminders and emergency dispatch alerts.',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          }
        );

        if (result === PermissionsAndroid.RESULTS.GRANTED) {
          delete blockedPermissions['notification'];
          return { status: 'granted', canAskAgain: true };
        } else if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          blockedPermissions['notification'] = true;
          return { status: 'blocked', canAskAgain: false };
        } else {
          return { status: 'denied', canAskAgain: true };
        }
      } catch (e) {
        return { status: 'unavailable', canAskAgain: false };
      }
    }
    return { status: 'granted', canAskAgain: true };
  },

  /**
   * Check Storage & Attachments permission
   */
  checkStorage: async (): Promise<PermissionStatus> => {
    if (Platform.OS !== 'android') {
      return 'granted';
    }
    if (Platform.Version >= 33) {
      try {
        const isGranted = await PermissionsAndroid.check(
          'android.permission.READ_MEDIA_IMAGES' as any
        );
        if (isGranted) return 'granted';
        return 'granted';
      } catch (e) {
        return 'granted';
      }
    } else {
      try {
        const isGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );
        if (isGranted) return 'granted';
        if (blockedPermissions['storage']) return 'blocked';
        return 'denied';
      } catch (e) {
        return 'unavailable';
      }
    }
  },

  /**
   * Request Storage permission
   */
  requestStorage: async (): Promise<PermissionResult> => {
    if (Platform.OS !== 'android') {
      return { status: 'granted', canAskAgain: true };
    }
    if (Platform.Version >= 33) {
      try {
        const result = await PermissionsAndroid.request(
          'android.permission.READ_MEDIA_IMAGES' as any,
          {
            title: 'Storage & Photos Permission',
            message: 'Priority One Guard App requires access to select photos for incident report attachments.',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          }
        );
        if (result === PermissionsAndroid.RESULTS.GRANTED) {
          delete blockedPermissions['storage'];
          return { status: 'granted', canAskAgain: true };
        } else if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          blockedPermissions['storage'] = true;
          return { status: 'blocked', canAskAgain: false };
        } else {
          return { status: 'denied', canAskAgain: true };
        }
      } catch (e) {
        return { status: 'granted', canAskAgain: true };
      }
    } else {
      try {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message: 'Priority One Guard App requires storage permission to attach files and cache site manuals.',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          }
        );
        if (result === PermissionsAndroid.RESULTS.GRANTED) {
          delete blockedPermissions['storage'];
          return { status: 'granted', canAskAgain: true };
        } else if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          blockedPermissions['storage'] = true;
          return { status: 'blocked', canAskAgain: false };
        } else {
          return { status: 'denied', canAskAgain: true };
        }
      } catch (e) {
        return { status: 'unavailable', canAskAgain: false };
      }
    }
  },

  /**
   * Open Android App Info Settings screen for the installed package
   */
  openAppSettings: async (): Promise<void> => {
    try {
      await Linking.openSettings();
    } catch (e) {
      console.error('Failed to open app settings:', e);
    }
  },

  /**
   * Open Android Location Settings screen
   */
  openLocationSettings: async (): Promise<void> => {
    if (Platform.OS === 'android') {
      try {
        await Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS');
        return;
      } catch (e) {
        // Fallback to app settings
      }
    }
    await Linking.openSettings();
  }
};
