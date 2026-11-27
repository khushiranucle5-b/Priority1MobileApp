import { parsePhoneWithCountry } from '../constants/countryCodes';
import { User } from '../types/auth.types';
import {
  DBEmployee,
  DBUser,
  getTable,
  initializeDB,
  saveTable,
  updateRow,
} from './db';

export type AuthResult =
  | { success: true; user: User; employee: DBEmployee }
  | { success: false; error: string };

interface OtpSession {
  employeeId: string;
  email: string;
  phone: string;
  code: string;
  expiresAt: number;
  attemptsLeft: number;
  verified: boolean;
}

const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;
const activeOtpSessions = new Map<string, OtpSession>();

export const mapEmployeeToUser = (emp: DBEmployee): User => ({
  id: emp.id,
  name: emp.name,
  email: emp.email,
  employeeId: emp.id,
  designation: emp.designation,
  role: emp.designation?.toLowerCase().includes('supervisor')
    ? 'supervisor'
    : 'guard',
  assignedSite: emp.site || 'Main Gate Site',
});

export const findEmployeeByIdentifier = async (
  identifier: string,
): Promise<DBEmployee | null> => {
  await initializeDB();
  const cleanIdentifier = identifier.trim().toLowerCase();
  if (!cleanIdentifier) return null;

  const employees = await getTable<DBEmployee>('employees');
  const match = employees.find(
    (e) =>
      e.email?.trim().toLowerCase() === cleanIdentifier ||
      e.id?.trim().toLowerCase() === cleanIdentifier,
  );
  return match || null;
};

export const findEmployeeByPhone = async (
  phoneInput: string,
  dialCode?: string,
): Promise<DBEmployee | null> => {
  await initializeDB();
  const inputDigits = phoneInput.replace(/\D/g, '');
  if (inputDigits.length < 7) return null;

  const dialDigits = (dialCode || '').replace(/\D/g, '');
  const combinedDigits = dialDigits ? `${dialDigits}${inputDigits}` : inputDigits;

  const employees = await getTable<DBEmployee>('employees');

  // 1. Exact full-number match (country dial code + local digits)
  const exactMatch = employees.find((emp) => {
    const empFullDigits = (emp.phone || '').replace(/\D/g, '');
    return empFullDigits.length > 0 && empFullDigits === combinedDigits;
  });
  if (exactMatch) return exactMatch;

  // 2. Local-digits match fallback (supports entering local 10 digits with any dial code)
  const localMatch = employees.find((emp) => {
    const parsed = parsePhoneWithCountry(emp.phone);
    return parsed.digits.length >= 7 && parsed.digits === inputDigits;
  });
  return localMatch || null;
};

export const maskPhoneNumber = (rawPhone?: string): string => {
  const { country, digits } = parsePhoneWithCountry(rawPhone);
  if (!digits) return rawPhone || '';
  if (digits.length <= 4) return `${country.dialCode} ${digits}`;
  const tail = digits.slice(-4);
  const maskedPrefix = '*'.repeat(Math.max(2, digits.length - 4));
  return `${country.dialCode} ${maskedPrefix}${tail}`;
};

export type RequestOtpResult =
  | {
      success: true;
      employee: DBEmployee;
      otp: string;
      maskedPhone: string;
      expiresInSeconds: number;
    }
  | { success: false; error: string };

export const requestPasswordResetOtp = async (
  phoneInput: string,
  dialCode?: string,
): Promise<RequestOtpResult> => {
  const emp = await findEmployeeByPhone(phoneInput, dialCode);
  if (!emp) {
    return {
      success: false,
      error: 'No employee account found with this mobile number.',
    };
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  activeOtpSessions.set(emp.id, {
    employeeId: emp.id,
    email: emp.email,
    phone: emp.phone,
    code: otp,
    expiresAt: Date.now() + OTP_TTL_MS,
    attemptsLeft: MAX_OTP_ATTEMPTS,
    verified: false,
  });

  return {
    success: true,
    employee: emp,
    otp,
    maskedPhone: maskPhoneNumber(emp.phone),
    expiresInSeconds: OTP_TTL_MS / 1000,
  };
};

export type VerifyOtpResult =
  | { success: true }
  | { success: false; error: string };

export const verifyPasswordResetOtp = (
  employeeId: string,
  enteredOtp: string,
): VerifyOtpResult => {
  const session = activeOtpSessions.get(employeeId);
  if (!session) {
    return {
      success: false,
      error: 'No active OTP request found. Please request a new OTP.',
    };
  }

  if (Date.now() > session.expiresAt) {
    activeOtpSessions.delete(employeeId);
    return {
      success: false,
      error: 'OTP has expired. Please request a new OTP.',
    };
  }

  const cleanOtp = enteredOtp.replace(/\D/g, '').trim();
  if (cleanOtp !== session.code) {
    session.attemptsLeft -= 1;
    if (session.attemptsLeft <= 0) {
      activeOtpSessions.delete(employeeId);
      return {
        success: false,
        error: 'Too many invalid attempts. Please request a new OTP.',
      };
    }
    return {
      success: false,
      error: `Invalid OTP. ${session.attemptsLeft} attempt(s) remaining.`,
    };
  }

  session.verified = true;
  return { success: true };
};

export const completeOtpPasswordReset = async (
  employeeId: string,
  enteredOtp: string,
  newPassword: string,
): Promise<void> => {
  const session = activeOtpSessions.get(employeeId);
  if (!session || Date.now() > session.expiresAt) {
    activeOtpSessions.delete(employeeId);
    throw new Error('OTP session expired. Please verify your mobile number again.');
  }

  const cleanOtp = enteredOtp.replace(/\D/g, '').trim();
  if (!session.verified || cleanOtp !== session.code) {
    throw new Error('Mobile OTP must be verified before changing your password.');
  }

  const emp = await findEmployeeByIdentifier(employeeId);
  await updateUserPassword(
    {
      id: employeeId,
      email: emp?.email || session.email,
      name: emp?.name,
      role: emp?.designation?.toLowerCase().includes('supervisor')
        ? 'supervisor'
        : 'guard',
    },
    newPassword,
  );

  activeOtpSessions.delete(employeeId);
};

export const clearPasswordResetOtp = (employeeId: string): void => {
  activeOtpSessions.delete(employeeId);
};

export const authenticateWithPassword = async (
  identifier: string,
  password: string,
): Promise<AuthResult> => {
  const emp = await findEmployeeByIdentifier(identifier);
  if (!emp) {
    return {
      success: false,
      error: 'Invalid credentials. User not found.',
    };
  }

  const usersList = (await getTable<DBUser>('users')) || [];
  const cleanIdentifier = identifier.trim().toLowerCase();
  const userRecord = usersList.find(
    (u) =>
      u.id === emp.id ||
      u.email?.trim().toLowerCase() === cleanIdentifier ||
      u.email?.trim().toLowerCase() === emp.email?.trim().toLowerCase(),
  );
  const validPassword = userRecord?.password || 'demo';

  if (password.trim() !== validPassword) {
    return {
      success: false,
      error: 'Invalid password. Please enter your correct password.',
    };
  }

  return {
    success: true,
    user: mapEmployeeToUser(emp),
    employee: emp,
  };
};

export const getStoredPasswordForUser = async (
  id: string,
  email: string,
): Promise<string> => {
  await initializeDB();
  const usersList = (await getTable<DBUser>('users')) || [];
  const cleanEmail = email.trim().toLowerCase();
  const userRecord = usersList.find(
    (u) => u.id === id || u.email?.trim().toLowerCase() === cleanEmail,
  );
  return userRecord?.password || 'demo';
};

export const updateUserPassword = async (
  account: { id: string; email: string; name?: string; role?: string },
  newPassword: string,
): Promise<void> => {
  await initializeDB();
  const usersList = (await getTable<DBUser>('users')) || [];
  const cleanEmail = account.email.trim().toLowerCase();
  const userRecord = usersList.find(
    (u) => u.id === account.id || u.email?.trim().toLowerCase() === cleanEmail,
  );

  const trimmedPassword = newPassword.trim();
  if (userRecord) {
    await updateRow<DBUser>('users', userRecord.id, {
      password: trimmedPassword,
    });
  } else {
    const newUser: DBUser = {
      id: account.id,
      name: account.name || 'Guard User',
      email: account.email,
      role: account.role || 'guard',
      companyId: 'c-1',
      password: trimmedPassword,
    };
    await saveTable('users', [...usersList, newUser]);
  }
};
