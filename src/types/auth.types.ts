export interface User {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  designation: string;
  role: 'guard' | 'supervisor' | 'admin';
  profilePhoto?: string;
  assignedSite: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User, accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}
