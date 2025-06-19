import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService, type RegisterRequest } from '../services/api';

export type UserRole = 'patient' | 'doctor' | 'admin' | 'nurse';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  phoneNumber?: string;
  avatar_url?: string;
  isActive?: boolean;
  email_verified?: boolean;
  last_login?: string;
  profile?: any;
  createdAt?: string;
  updated_at?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole, additionalData?: any) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  initializeAuth: () => Promise<void>;
}
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      clearError: () => set({ error: null }),

      initializeAuth: async () => {
        const token = apiService.getToken();
        if (!token) return;

        set({ isLoading: true });
        try {
          const response = await apiService.getProfile();
          if (response.success && response.data) {
            set({
              user: response.data,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
          } else {
            // Invalid token, clear it
            apiService.setToken(null);
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null
            });
          }
        } catch (error) {
          console.error('Auth initialization failed:', error);
          apiService.setToken(null);
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        }
      },      login: async (email, password) => {
        set({ isLoading: true, error: null });        try {          const response = await apiService.login({ email, password });
          
          if (response.success && response.data) {
            // The backend returns: { data: { user: {...}, token } }
            const userData = response.data.user;
            
            set({
              user: userData,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
          } else {
            throw new Error(response.message || 'Login failed');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          set({
            isLoading: false,
            error: errorMessage,
            user: null,
            isAuthenticated: false
          });
          throw error;
        }
      },      register: async (name, email, password, role, additionalData = {}) => {
        set({ isLoading: true, error: null });
        
        try {
          // Split name into firstName and lastName
          const nameParts = name.trim().split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || 'User';
          
          const registerData: RegisterRequest = {
            firstName,
            lastName,
            email,
            password,
            role,
            phoneNumber: additionalData.phone,
            profileData: additionalData.profileData
          };          const response = await apiService.register(registerData);
          
          if (response.success && response.data) {
            const userData = response.data.user;
            
            set({
              user: userData,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
            
            // Immediately verify what was set
            const currentState = get();
            console.log('Auth store state after setting:', {
              isAuthenticated: currentState.isAuthenticated,
              userExists: !!currentState.user,
              userRole: currentState.user?.role,
              userRoleType: typeof currentState.user?.role
            });
          } else {
            throw new Error(response.message || 'Registration failed');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Registration failed';
          set({
            isLoading: false,
            error: errorMessage,
            user: null,
            isAuthenticated: false
          });
          throw error;
        }
      },      logout: () => {
        apiService.logout();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);