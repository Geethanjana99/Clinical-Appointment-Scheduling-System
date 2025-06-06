import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService, type RegisterRequest } from '../services/api';

export type UserRole = 'patient' | 'doctor' | 'admin' | 'billing';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  profile?: any;
  created_at?: string;
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
    (set) => ({
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
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiService.login({ email, password });
          
          if (response.success && response.data) {
            // Store refresh token
            localStorage.setItem('refreshToken', response.data.refreshToken);
            
            // Debug log the user object structure
            console.log('Login response user object:', response.data.user);
            console.log('User role from response:', response.data.user?.role);
            
            set({
              user: response.data.user,
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
      },

      register: async (name, email, password, role, additionalData = {}) => {
        set({ isLoading: true, error: null });
        
        try {
          const registerData: RegisterRequest = {
            name,
            email,
            password,
            role,
            phone: additionalData.phone,
            profileData: additionalData.profileData
          };

          const response = await apiService.register(registerData);
          
          if (response.success && response.data) {
            // Store refresh token
            localStorage.setItem('refreshToken', response.data.refreshToken);
            
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
              error: null
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
      },

      logout: () => {
        apiService.logout();
        localStorage.removeItem('refreshToken');
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