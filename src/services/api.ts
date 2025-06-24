// API Service for connecting to the backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'patient' | 'doctor' | 'admin' | 'billing';
  phone?: string;
  profileData?: {
    gender?: string;
    date_of_birth?: string;
    address?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    preferred_language?: string;
    specialization?: string;
    license_number?: string;
    experience_years?: number;
    department?: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin' | 'billing';
  phone?: string;
  avatar_url?: string;
  is_active?: boolean;
  email_verified?: boolean;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
  profile?: any;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface RegisterResponse {
  user: User;
  requiresLogin: boolean;
}

class ApiService {
  private static instance: ApiService;
  private token: string | null = null;

  private constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('token');
  }

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      defaultHeaders.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.makeRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data) {
      this.setToken(response.data.token);
    }

    return response;
  }  async register(userData: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    const response = await this.makeRequest<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // Don't set token on registration - user must login explicitly

    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.makeRequest('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.setToken(null);
      localStorage.removeItem('refreshToken');
    }
  }

  async refreshToken(): Promise<ApiResponse<{ token: string; refreshToken: string }>> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.makeRequest<{ token: string; refreshToken: string }>('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    if (response.success && response.data) {
      this.setToken(response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }

    return response;
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.makeRequest<User>('/auth/profile');
  }

  async updateProfile(profileData: Partial<User>): Promise<ApiResponse<User>> {
    return this.makeRequest<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Patient methods
  async getPatients(): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>('/patients');
  }

  async getPatient(id: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/patients/${id}`);
  }

  // Doctor methods
  async getDoctors(): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>('/doctors');
  }

  async getDoctor(id: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/doctors/${id}`);
  }

  // Doctor Dashboard methods
  async getDoctorDashboard(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/doctors/dashboard');
  }

  async getDoctorAppointments(params?: { 
    page?: number; 
    limit?: number; 
    status?: string; 
    startDate?: string; 
    endDate?: string; 
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    return this.makeRequest<any>(`/doctors/appointments${queryString ? `?${queryString}` : ''}`);
  }

  async getDoctorStatistics(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/doctors/statistics');
  }

  async getDoctorEarnings(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/doctors/earnings');
  }
  async updateAppointmentStatus(appointmentId: string, status: string, notes?: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/appointments/${appointmentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  }

  async handleAppointmentAction(appointmentId: string, action: 'start' | 'complete' | 'cancel'): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/doctors/appointments/${appointmentId}/action`, {
      method: 'PATCH',
      body: JSON.stringify({ action }),
    });
  }

  async completeAppointment(appointmentId: string, notes?: string, actualWaitTime?: number): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/appointments/${appointmentId}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ notes, actualWaitTime }),
    });
  }

  // Patient-specific methods
  async searchDoctors(params: {
    specialty?: string;
    name?: string;
    location?: string;
    rating?: number;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    const url = `/patients/doctors/search${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest<any[]>(url);
  }

  async bookAppointment(appointmentData: {
    doctorId: string;
    appointmentDate: string;
    appointmentTime: string;
    appointmentType: string;
    reasonForVisit: string;
    symptoms?: string;
    priority?: string;
  }): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  async getMyAppointments(params?: {
    page?: number;
    limit?: number;
    status?: string | string[];
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v.toString()));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }
    
    const url = `/patients/appointments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest<any>(url);
  }

  async getMyUpcomingAppointments(): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>('/patients/appointments/upcoming');
  }

  async cancelAppointment(appointmentId: string, reason?: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/appointments/${appointmentId}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ cancellation_reason: reason }),
    });
  }

  async rescheduleAppointment(appointmentId: string, newDate: string, newTime: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/appointments/${appointmentId}/reschedule`, {
      method: 'PUT',
      body: JSON.stringify({ 
        appointment_date: newDate,
        appointment_time: newTime
      }),
    });
  }

  async getDoctorProfile(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/doctors/profile');
  }
  async getAvailableSlots(doctorId: string, date: string): Promise<ApiResponse<{date: string, slots: string[]}>> {
    const params = new URLSearchParams({ doctorId, date });
    return this.makeRequest<{date: string, slots: string[]}>(`/appointments/available-slots?${params.toString()}`);
  }
}

export const apiService = ApiService.getInstance();
export default apiService;
