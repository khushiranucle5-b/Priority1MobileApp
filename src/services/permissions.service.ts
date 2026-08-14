export type PermissionStatus = 'granted' | 'denied' | 'blocked' | 'unavailable';

export interface PermissionResult {
  status: PermissionStatus;
  canAskAgain: boolean;
}

// Placeholder — implementation requires react-native-permissions (Phase 3+)
const requestCameraPermission = async (): Promise<PermissionResult> => {
  // TODO: implement with react-native-permissions
  return { status: 'unavailable', canAskAgain: false };
};

const requestLocationPermission = async (): Promise<PermissionResult> => {
  // TODO: implement with react-native-permissions
  return { status: 'unavailable', canAskAgain: false };
};

const requestNotificationPermission = async (): Promise<PermissionResult> => {
  // TODO: implement with react-native-permissions
  return { status: 'unavailable', canAskAgain: false };
};

const checkCameraPermission = async (): Promise<PermissionStatus> => {
  // TODO: implement with react-native-permissions
  return 'unavailable';
};

const checkLocationPermission = async (): Promise<PermissionStatus> => {
  // TODO: implement with react-native-permissions
  return 'unavailable';
};

export const PermissionsService = {
  requestCamera: requestCameraPermission,
  requestLocation: requestLocationPermission,
  requestNotification: requestNotificationPermission,
  checkCamera: checkCameraPermission,
  checkLocation: checkLocationPermission,
};
