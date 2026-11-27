import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

jest.mock('@react-native-documents/picker', () => ({
  pickSingle: jest.fn(),
  types: {},
  isCancel: jest.fn(),
}));

jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(),
  launchImageLibrary: jest.fn(),
}));

jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(),
  getGenericPassword: jest.fn(),
  hasGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
  getSupportedBiometryType: jest.fn(),
  ACCESS_CONTROL: {
    BIOMETRY_ANY: 'BiometryAny',
  },
  ACCESSIBLE: {
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'AccessibleWhenUnlockedThisDeviceOnly',
  },
  BIOMETRY_TYPE: {
    FACE_ID: 'FaceID',
    TOUCH_ID: 'TouchID',
    FINGERPRINT: 'Fingerprint',
    FACE: 'Face',
    IRIS: 'Iris',
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));
