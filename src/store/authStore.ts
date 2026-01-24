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
        console.log('🔄 Initializing auth, token exists:', !!token);
        
        if (!token) {
          // No token found, user is not authenticated
          console.log('❌ No token found, setting unauthenticated state');
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
          console.log('🔍 Fetching user profile with token...');
          const response = await apiService.getProfile();
          
          if (response.success && response.data && response.data.user) {
            console.log('✅ Profile fetch successful, user:', response.data.user.email);
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
          } else {
            // Invalid token or malformed response, clear it
            console.log('❌ Profile fetch failed, response:', response);
            apiService.setToken(null);
            localStorage.removeItem('refreshToken');
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null
            });
          }
        } catch (error) {
          console.log('❌ Auth initialization failed:', error instanceof Error ? error.message : error);
          
          // If it's a 401 error, try refresh token before giving up
          if (error instanceof Error && error.message.includes('401')) {
            try {
              console.log('🔄 Attempting token refresh...');
              const refreshResponse = await apiService.refreshToken();
              if (refreshResponse.success && refreshResponse.data) {
                console.log('✅ Token refresh successful, retrying profile fetch...');
                const retryResponse = await apiService.getProfile();
                if (retryResponse.success && retryResponse.data && retryResponse.data.user) {
                  console.log('✅ Profile fetch successful after refresh');
                  set({
                    user: retryResponse.data.user,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null
                  });
                  return;
                }
              }
            } catch (refreshError) {
              console.log('❌ Token refresh failed:', refreshError);
            }
          }
          
          // Clear invalid tokens
          apiService.setToken(null);
          localStorage.removeItem('refreshToken');
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
        console.log('🚪 Starting logout process...');
        
        // 1. Immediately clear the token to prevent API calls
        apiService.setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        
        // 2. Clear authentication state immediately
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
        
        console.log('✅ Auth state and tokens cleared immediately');
        
        // 3. Attempt to notify backend (fire and forget)
        try {
          apiService.logout().catch((error) => {
            console.warn('⚠️ Backend logout notification failed (ignored):', error);
          });
        } catch (error) {
          console.warn('⚠️ Logout API call setup failed (ignored):', error);
        }
        
        console.log('🎯 Logout process completed');
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