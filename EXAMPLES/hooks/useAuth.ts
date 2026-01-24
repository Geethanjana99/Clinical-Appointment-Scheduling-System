// src/hooks/useAuth.ts

/**
 * Custom hook for authentication logic
 * Wraps the Zustand auth store with additional functionality
 */

import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { UserRole } from '../store/authStore';

export const useAuth = () => {
  const navigate = useNavigate();
  const authStore = useAuthStore();
  
  /**
   * Login with email and password
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      await authStore.login(email, password);
      
      // Navigate based on user role
      const user = useAuthStore.getState().user;
      if (user) {
        const dashboardRoutes: Record<UserRole, string> = {
          patient: '/patient',
          doctor: '/doctor',
          admin: '/admin',
          billing: '/billing',
        };
        navigate(dashboardRoutes[user.role]);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, [authStore, navigate]);
  
  /**
   * Logout and redirect to home
   */
  const logout = useCallback(() => {
    authStore.logout();
    navigate('/');
  }, [authStore, navigate]);
  
  /**
   * Check if user has specific role
   */
  const hasRole = useCallback((role: UserRole | UserRole[]): boolean => {
    const user = authStore.user;
    if (!user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    
    return user.role === role;
  }, [authStore.user]);
  
  /**
   * Require authentication - redirects to login if not authenticated
   */
  const requireAuth = useCallback(() => {
    if (!authStore.isAuthenticated) {
      navigate('/login');
      return false;
    }
    return true;
  }, [authStore.isAuthenticated, navigate]);
  
  return {
    // State
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    isLoading: authStore.isLoading,
    error: authStore.error,
    
    // Actions
    login,
    logout,
    register: authStore.register,
    updateProfile: authStore.updateProfile,
    clearError: authStore.clearError,
    
    // Utilities
    hasRole,
    requireAuth,
  };
};
