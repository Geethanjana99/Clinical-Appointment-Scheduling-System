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
  // Common user fields (goes to users table)
  name: string;
  email: string;
  password: string;
  role: 'patient' | 'doctor' | 'admin' | 'billing';
  phone?: string;
  avatar_url?: string;
  
  // Patient-specific fields (goes to patients table if role is 'patient')
  patientData?: {
    date_of_birth?: string;
    gender?: 'male' | 'female' | 'other';
    address?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    medical_history?: string;
    allergies?: string;
    current_medications?: string;
    insurance_provider?: string;
    insurance_policy_number?: string;
    blood_type?: string;
    height?: number;
    weight?: number;
    occupation?: string;
    marital_status?: 'single' | 'married' | 'divorced' | 'widowed';
    preferred_language?: string;
  };
  
  // Doctor-specific fields (goes to doctors table if role is 'doctor')
  doctorData?: {
    specialty: string;
    license_number: string;
    years_of_experience?: number;
    education?: string;
    certifications?: string;
    consultation_fee?: number;
    languages_spoken?: string[];
    office_address?: string;
    bio?: string;
    working_hours?: any;
    commission_rate?: number;
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
  
  // Patient profile data (if role is 'patient')
  patientProfile?: {
    patient_id?: string;
    date_of_birth?: string;
    gender?: 'male' | 'female' | 'other';
    address?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    medical_history?: string;
    allergies?: string;
    current_medications?: string;
    insurance_provider?: string;
    insurance_policy_number?: string;
    blood_type?: string;
    height?: number;
    weight?: number;
    occupation?: string;
    marital_status?: 'single' | 'married' | 'divorced' | 'widowed';
    preferred_language?: string;
    status?: 'active' | 'inactive' | 'suspended';
  };
  
  // Doctor profile data (if role is 'doctor')
  doctorProfile?: {
    doctor_id?: string;
    specialty?: string;
    license_number?: string;
    years_of_experience?: number;
    education?: string;
    certifications?: string;
    consultation_fee?: number;
    languages_spoken?: string[];
    office_address?: string;
    bio?: string;
    rating?: number;
    total_reviews?: number;
    working_hours?: any;
    availability_status?: 'available' | 'busy' | 'offline';
    commission_rate?: number;
    status?: 'active' | 'inactive' | 'suspended' | 'pending_approval';
    total_appointments?: number;
    total_earnings?: number;
  };
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
    try {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        // Basic validation - JWT tokens should have 3 parts separated by dots
        const tokenParts = storedToken.split('.');
        if (tokenParts.length === 3) {
          this.token = storedToken;
        } else {
          console.warn('Invalid token format found in localStorage, clearing it');
          localStorage.removeItem('token');
          this.token = null;
        }
      } else {
        this.token = null;
      }
    } catch (error) {
      console.error('Error loading token from localStorage:', error);
      localStorage.removeItem('token');
      this.token = null;
    }
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
        // If it's an authentication error and we have a token, it might be corrupted
        if (response.status === 401 || response.status === 500) {
          if (this.token && (data.message === 'Token is not valid' || data.message === 'Server error during authentication')) {
            console.warn('Authentication failed, clearing potentially corrupted token');
            this.setToken(null);
          }
        }
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
    
    const url = `/doctors/search${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
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

  async bookQueueAppointment(appointmentData: {
    doctorId: string;
    appointmentDate: string;
    appointmentType?: string;
    reasonForVisit: string;
    symptoms?: string;
    priority?: string;
    isEmergency?: boolean;
  }): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/patients/appointments/queue', {
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

  // Doctor Queue Management
  async getDoctorAvailability(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/doctor/availability');
  }

  async updateWorkingHours(workingHours: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/doctor/availability/working-hours', {
      method: 'PUT',
      body: JSON.stringify({ working_hours: workingHours }),
    });
  }

  async updateAvailabilityStatus(status: 'available' | 'busy' | 'offline'): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/doctor/availability/status', {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getQueueStatus(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/doctor/queue/status');
  }

  async toggleQueue(isActive: boolean): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/doctor/queue/toggle', {
      method: 'PUT',
      body: JSON.stringify({ is_active: isActive }),
    });
  }

  async getTodayAppointments(): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>('/doctor/appointments/today');
  }

  async callNextPatient(appointmentId: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/doctor/appointments/${appointmentId}/call-next`, {
      method: 'PUT',
    });
  }

  async completeConsultation(appointmentId: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/doctor/appointments/${appointmentId}/complete`, {
      method: 'PUT',
    });
  }

  // Patient Queue Management
  async getPatientQueuePosition(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/patient/queue/position');
  }

  async getDoctorQueueInfo(doctorId: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/patient/queue/doctor/${doctorId}`);
  }

  // Admin-specific appointment booking
  async bookQueueAppointmentForPatient(appointmentData: {
    patientId: string;
    doctorId: string;
    appointmentDate: string;
    appointmentType?: string;
    reasonForVisit: string;
    symptoms?: string;
    priority?: string;
    isEmergency?: boolean;
  }): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/admin/appointments/queue', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }
}

export const apiService = ApiService.getInstance();
export default apiService;
