import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import { useAuthStore } from '../src/store/useAuthStore';
import {
  authenticateWithPassword,
  completeOtpPasswordReset,
  findEmployeeByIdentifier,
  findEmployeeByPhone,
  requestPasswordResetOtp,
  updateUserPassword,
  verifyPasswordResetOtp,
} from '../src/services/auth.service';
import {
  BIOMETRIC_KEYCHAIN_SERVICE,
  clearBiometricRegistration,
  fetchBiometricUser,
  getBiometricRegistration,
  registerBiometric,
} from '../src/services/biometric.service';

describe('Auth, Forgot Password & Mobile OTP Service', () => {
  const memoryStorage: Record<string, string> = {};

  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(memoryStorage).forEach((k) => delete memoryStorage[k]);

    (AsyncStorage.getItem as jest.Mock).mockImplementation(async (key: string) =>
      key in memoryStorage ? memoryStorage[key] : null,
    );
    (AsyncStorage.setItem as jest.Mock).mockImplementation(
      async (key: string, value: string) => {
        memoryStorage[key] = value;
      },
    );
    (AsyncStorage.removeItem as jest.Mock).mockImplementation(
      async (key: string) => {
        delete memoryStorage[key];
      },
    );
  });

  it('finds seeded employee by ID or email and updates password', async () => {
    const emp = await findEmployeeByIdentifier('G-1001');
    expect(emp).not.toBeNull();
    expect(emp?.email).toBe('john@priority-one.io');

    const initialLogin = await authenticateWithPassword('G-1001', 'demo');
    expect(initialLogin.success).toBe(true);

    await updateUserPassword(
      {
        id: emp!.id,
        email: emp!.email,
        name: emp!.name,
      },
      'NewSecret123',
    );

    const oldPasswordAttempt = await authenticateWithPassword(
      'john@priority-one.io',
      'demo',
    );
    expect(oldPasswordAttempt.success).toBe(false);

    const newPasswordAttempt = await authenticateWithPassword(
      'john@priority-one.io',
      'NewSecret123',
    );
    expect(newPasswordAttempt.success).toBe(true);
    if (newPasswordAttempt.success) {
      expect(newPasswordAttempt.user.employeeId).toBe('G-1001');
    }
  });

  it('resets password via mobile number + OTP verification', async () => {
    const empByPhone = await findEmployeeByPhone('4155550101', '+1');
    expect(empByPhone?.id).toBe('G-1001');

    const unknownPhoneOtp = await requestPasswordResetOtp('9999999999', '+91');
    expect(unknownPhoneOtp.success).toBe(false);

    const otpReq = await requestPasswordResetOtp('4155550101', '+1');
    expect(otpReq.success).toBe(true);
    if (!otpReq.success) return;

    expect(otpReq.otp).toHaveLength(6);

    const badVerify = verifyPasswordResetOtp(otpReq.employee.id, '000000');
    expect(badVerify.success).toBe(false);

    await expect(
      completeOtpPasswordReset(otpReq.employee.id, otpReq.otp, 'OtpPass99'),
    ).rejects.toThrow('Mobile OTP must be verified before changing your password.');

    const goodVerify = verifyPasswordResetOtp(otpReq.employee.id, otpReq.otp);
    expect(goodVerify.success).toBe(true);

    await completeOtpPasswordReset(otpReq.employee.id, otpReq.otp, 'OtpPass99');

    const loginWithOtpPass = await authenticateWithPassword(
      'john@priority-one.io',
      'OtpPass99',
    );
    expect(loginWithOtpPass.success).toBe(true);
  });
});

describe('Biometric Registration & Sign-In Service', () => {
  const memoryStorage: Record<string, string> = {};
  const keychainStore: Record<
    string,
    { username: string; password: string }
  > = {};

  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(memoryStorage).forEach((k) => delete memoryStorage[k]);
    Object.keys(keychainStore).forEach((k) => delete keychainStore[k]);

    (AsyncStorage.getItem as jest.Mock).mockImplementation(async (key: string) =>
      key in memoryStorage ? memoryStorage[key] : null,
    );
    (AsyncStorage.setItem as jest.Mock).mockImplementation(
      async (key: string, value: string) => {
        memoryStorage[key] = value;
      },
    );
    (AsyncStorage.removeItem as jest.Mock).mockImplementation(
      async (key: string) => {
        delete memoryStorage[key];
      },
    );

    (Keychain.getSupportedBiometryType as jest.Mock).mockResolvedValue(
      Keychain.BIOMETRY_TYPE.FINGERPRINT,
    );
    (Keychain.setGenericPassword as jest.Mock).mockImplementation(
      async (username: string, password: string, options?: { service?: string }) => {
        const service = options?.service || 'default';
        keychainStore[service] = { username, password };
        return { service, storage: 'KeystoreAESGCM' };
      },
    );
    (Keychain.hasGenericPassword as jest.Mock).mockImplementation(
      async (options?: { service?: string }) => {
        const service = options?.service || 'default';
        return Boolean(keychainStore[service]);
      },
    );
    (Keychain.getGenericPassword as jest.Mock).mockImplementation(
      async (options?: { service?: string }) => {
        const service = options?.service || 'default';
        const entry = keychainStore[service];
        if (!entry) return false;
        return { service, ...entry, storage: 'KeystoreAESGCM' };
      },
    );
    (Keychain.resetGenericPassword as jest.Mock).mockImplementation(
      async (options?: { service?: string }) => {
        const service = options?.service || 'default';
        delete keychainStore[service];
        return true;
      },
    );
  });

  it('registers biometrics first and then fetches user credentials to sign in', async () => {
    const auth = await authenticateWithPassword('G-1001', 'demo');
    expect(auth.success).toBe(true);
    if (!auth.success) return;

    expect(await getBiometricRegistration()).toBeNull();

    const meta = await registerBiometric(auth.user);
    expect(meta.employeeId).toBe('G-1001');
    expect(meta.email).toBe('john@priority-one.io');
    expect(keychainStore[BIOMETRIC_KEYCHAIN_SERVICE]).toBeDefined();

    const savedMeta = await getBiometricRegistration();
    expect(savedMeta?.employeeId).toBe('G-1001');

    const fetchedUser = await fetchBiometricUser();
    expect(fetchedUser.id).toBe('G-1001');
    expect(fetchedUser.email).toBe('john@priority-one.io');

    await clearBiometricRegistration();
    expect(await getBiometricRegistration()).toBeNull();
  });

  it('rejects biometric login when not registered yet', async () => {
    await expect(fetchBiometricUser()).rejects.toThrow(
      'Biometric sign-in is not registered yet. Please register first.',
    );
  });

  it('auto-prompts biometric only on launch when unauthenticated and not immediately after logout', async () => {
    expect(useAuthStore.getState().shouldAutoPromptBiometric).toBe(true);
    useAuthStore.getState().consumeAutoBiometricPrompt();
    expect(useAuthStore.getState().shouldAutoPromptBiometric).toBe(false);

    const auth = await authenticateWithPassword('G-1001', 'demo');
    expect(auth.success).toBe(true);
    if (!auth.success) return;

    await useAuthStore.getState().login(auth.user, 'tok', 'ref');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().shouldAutoPromptBiometric).toBe(false);

    await useAuthStore.getState().logout();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().shouldAutoPromptBiometric).toBe(false);
  });
});
