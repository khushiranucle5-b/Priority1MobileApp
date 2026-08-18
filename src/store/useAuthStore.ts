import { create } from 'zustand';
import * as Keychain from 'react-native-keychain';
import { AuthState, User } from '../types/auth.types';
import { initializeDB, getTable, DBEmployee, DBUser } from '../services/db';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async (userData: User, accessToken: string, refreshToken: string) => {
    await Keychain.setGenericPassword('tokens', JSON.stringify({ accessToken, refreshToken, userEmail: userData.email }));
    set({ user: userData, isAuthenticated: true });
  },
  logout: async () => {
    await Keychain.resetGenericPassword();
    set({ user: null, isAuthenticated: false });
  },
  checkSession: async () => {
    try {
      await initializeDB();
      const credentials = await Keychain.getGenericPassword();
      if (credentials) {
        const parsed = JSON.parse(credentials.password);
        const accessToken = parsed.accessToken;
        let userEmail = parsed.userEmail;

        if (accessToken) {
          const employees = await getTable<DBEmployee>('employees');
          if (!userEmail) {
            userEmail = 'john@priority-one.io';
          }
          const emp = employees.find(e => e.email?.trim().toLowerCase() === userEmail.trim().toLowerCase()) || employees[0];
          if (emp) {
            const mappedUser: User = {
              id: emp.id,
              name: emp.name,
              email: emp.email,
              employeeId: emp.id,
              designation: emp.designation,
              role: emp.designation?.toLowerCase().includes('supervisor') ? 'supervisor' : 'guard',
              assignedSite: emp.site || 'Main Gate Site',
            };
            set({ user: mappedUser, isAuthenticated: true, isLoading: false });
            return;
          }
        }
        set({ user: null, isAuthenticated: false, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

