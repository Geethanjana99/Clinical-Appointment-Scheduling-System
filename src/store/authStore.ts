import { create } from 'zustand';
export type UserRole = 'patient' | 'doctor' | 'admin' | 'billing';
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
}
// Mock user data for demonstration
const mockUsers = {
  patient: {
    id: 'p1',
    name: 'John Smith',
    email: 'patient@example.com',
    role: 'patient' as UserRole,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  doctor: {
    id: 'd1',
    name: 'Dr. Sarah Johnson',
    email: 'doctor@example.com',
    role: 'doctor' as UserRole,
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg'
  },
  admin: {
    id: 'a1',
    name: 'Mike Wilson',
    email: 'admin@example.com',
    role: 'admin' as UserRole,
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg'
  },
  billing: {
    id: 'b1',
    name: 'Lisa Chen',
    email: 'billing@example.com',
    role: 'billing' as UserRole,
    avatar: 'https://randomuser.me/api/portraits/women/28.jpg'
  }
};
export const useAuthStore = create<AuthState>(set => ({
  user: null,
  isAuthenticated: false,
  login: async (email, password, role) => {
    // In a real app, this would be an API call
    return new Promise<void>(resolve => {
      setTimeout(() => {
        const user = mockUsers[role];
        set({
          user,
          isAuthenticated: true
        });
        resolve();
      }, 1000);
    });
  },
  register: async (name, email, password, role) => {
    // In a real app, this would be an API call
    return new Promise<void>(resolve => {
      setTimeout(() => {
        const newUser = {
          id: Math.random().toString(36).substring(2, 9),
          name,
          email,
          role
        };
        set({
          user: newUser,
          isAuthenticated: true
        });
        resolve();
      }, 1000);
    });
  },
  logout: () => {
    set({
      user: null,
      isAuthenticated: false
    });
  }
}));