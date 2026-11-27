import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Keychain from 'react-native-keychain';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { User } from '../types/auth.types';
import { findEmployeeByIdentifier, mapEmployeeToUser } from './auth.service';

export const BIOMETRIC_KEYCHAIN_SERVICE = 'com.priorityone.biometric_auth';
export const BIOMETRIC_TEST_SERVICE = 'com.priorityone.biometric_test';

export interface BiometricRegistrationMeta {
  userId: string;
  employeeId: string;
  email: string;
  name: string;
  registeredAt: string;
}

interface BiometricPayload {
  userId: string;
  employeeId: string;
  email: string;
  name: string;
  registeredAt: string;
}

export const getSupportedBiometryType =
  async (): Promise<Keychain.BIOMETRY_TYPE | null> => {
    try {
      return await Keychain.getSupportedBiometryType();
    } catch {
      return null;
    }
  };

export const getBiometricLabel = (
  biometryType: Keychain.BIOMETRY_TYPE | null,
): string => {
  if (biometryType === Keychain.BIOMETRY_TYPE.FACE_ID) return 'Face ID';
  if (biometryType === Keychain.BIOMETRY_TYPE.TOUCH_ID) return 'Touch ID';
  if (biometryType === Keychain.BIOMETRY_TYPE.FINGERPRINT) return 'Fingerprint';
  if (biometryType === Keychain.BIOMETRY_TYPE.FACE) return 'Face Unlock';
  if (biometryType === Keychain.BIOMETRY_TYPE.IRIS) return 'Iris Scanner';
  return 'Biometrics';
};

export const getBiometricRegistration =
  async (): Promise<BiometricRegistrationMeta | null> => {
    try {
      const rawMeta = await AsyncStorage.getItem(
        STORAGE_KEYS.BIOMETRIC_REGISTERED_META,
      );
      if (!rawMeta) return null;

      const hasStored = await Keychain.hasGenericPassword({
        service: BIOMETRIC_KEYCHAIN_SERVICE,
      });
      if (!hasStored) {
        await AsyncStorage.removeItem(STORAGE_KEYS.BIOMETRIC_REGISTERED_META);
        return null;
      }

      return JSON.parse(rawMeta) as BiometricRegistrationMeta;
    } catch {
      return null;
    }
  };

export const registerBiometric = async (
  user: User,
): Promise<BiometricRegistrationMeta> => {
  const biometryType = await getSupportedBiometryType();
  if (!biometryType) {
    throw new Error(
      'Biometric authentication is not available or not enrolled on this device.',
    );
  }

  const label = getBiometricLabel(biometryType);
  const meta: BiometricRegistrationMeta = {
    userId: user.id,
    employeeId: user.employeeId || user.id,
    email: user.email,
    name: user.name,
    registeredAt: new Date().toISOString(),
  };

  const payload: BiometricPayload = { ...meta };

  const setResult = await Keychain.setGenericPassword(
    user.email,
    JSON.stringify(payload),
    {
      service: BIOMETRIC_KEYCHAIN_SERVICE,
      accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      authenticationPrompt: {
        title: `Register ${label} Sign-In`,
        subtitle: `${user.name} (${meta.employeeId})`,
        description: `Verify your ${label.toLowerCase()} to link biometric sign-in`,
        cancel: 'Cancel',
      },
    },
  );

  if (!setResult) {
    throw new Error('Could not save biometric credentials to secure storage.');
  }

  // On iOS, setGenericPassword does not show the biometric prompt, so confirm
  // with getGenericPassword to verify the user's Face ID / Touch ID during setup.
  if (Platform.OS === 'ios') {
    try {
      const verified = await Keychain.getGenericPassword({
        service: BIOMETRIC_KEYCHAIN_SERVICE,
        authenticationPrompt: {
          title: `Confirm ${label} Registration`,
          cancel: 'Cancel',
        },
      });
      if (!verified) {
        await Keychain.resetGenericPassword({
          service: BIOMETRIC_KEYCHAIN_SERVICE,
        });
        throw new Error('Biometric verification was cancelled.');
      }
    } catch (error) {
      await Keychain.resetGenericPassword({
        service: BIOMETRIC_KEYCHAIN_SERVICE,
      });
      throw error;
    }
  }

  await AsyncStorage.setItem(
    STORAGE_KEYS.BIOMETRIC_REGISTERED_META,
    JSON.stringify(meta),
  );
  return meta;
};

export const fetchBiometricUser = async (): Promise<User> => {
  const hasStored = await Keychain.hasGenericPassword({
    service: BIOMETRIC_KEYCHAIN_SERVICE,
  });
  if (!hasStored) {
    await AsyncStorage.removeItem(STORAGE_KEYS.BIOMETRIC_REGISTERED_META);
    throw new Error(
      'Biometric sign-in is not registered yet. Please register first.',
    );
  }

  const credentials = await Keychain.getGenericPassword({
    service: BIOMETRIC_KEYCHAIN_SERVICE,
    authenticationPrompt: {
      title: 'Biometric Sign-In',
      subtitle: 'PriorityOne Security',
      description: 'Verify your biometrics to fetch credentials and sign in',
      cancel: 'Cancel',
    },
  });

  if (!credentials) {
    throw new Error('Biometric authentication was cancelled or failed.');
  }

  let payload: BiometricPayload;
  try {
    payload = JSON.parse(credentials.password) as BiometricPayload;
  } catch {
    throw new Error('Stored biometric data is invalid. Please re-register.');
  }

  const emp =
    (await findEmployeeByIdentifier(payload.email)) ||
    (await findEmployeeByIdentifier(payload.employeeId)) ||
    (await findEmployeeByIdentifier(payload.userId));

  if (!emp) {
    throw new Error(
      'Registered employee record could not be found. Please sign in with your password.',
    );
  }

  return mapEmployeeToUser(emp);
};

export const clearBiometricRegistration = async (): Promise<void> => {
  await Keychain.resetGenericPassword({ service: BIOMETRIC_KEYCHAIN_SERVICE });
  await AsyncStorage.removeItem(STORAGE_KEYS.BIOMETRIC_REGISTERED_META);
};
