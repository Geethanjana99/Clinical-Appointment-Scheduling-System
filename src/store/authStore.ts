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
  avatar_url?: string;
  is_active?: boolean;
  email_verified?: boolean;
  last_login?: string;
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
  register: (name: string, email: string, password: string, role: UserRole, additionalData?: { phone?: string; patientData?: any; doctorData?: any }) => Promise<void>;
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
        if (!token) {
          // No token found, user is not authenticated
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
          return;
        }

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
            console.log('Profile fetch failed, clearing token');
            apiService.setToken(null);
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null
            });
          }
        } catch (error) {
          console.log('Auth initialization failed (token likely expired), clearing auth:', error instanceof Error ? error.message : error);
          // Clear invalid token silently
          apiService.setToken(null);
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        }
      },      login: async (email, password) => {
        set({ isLoading: true, error: null });        try {
          const response = await apiService.login({ email, password });
          
          if (response.success && response.data) {
            // Store refresh token
            localStorage.setItem('refreshToken', response.data.refreshToken);
            
            // The backend returns: { data: { user: {...}, token, refreshToken } }
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
            patientData: additionalData.patientData,
            doctorData: additionalData.doctorData
          };          const response = await apiService.register(registerData);
          
          if (response.success) {
            // Don't auto-login after registration - user must login explicitly
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null
            });
            
            console.log('Registration successful - user must login');
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