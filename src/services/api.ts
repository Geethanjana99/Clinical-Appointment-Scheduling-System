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

  private async makeRequestWithRetry<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry: boolean = false
  ): Promise<ApiResponse<T>> {
    try {
      return await this.makeRequest<T>(endpoint, options);
    } catch (error) {
      // If it's a 401 error and we haven't already retried, try refreshing the token
      if (!isRetry && error instanceof Error && error.message.includes('401') && endpoint !== '/auth/refresh-token') {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            console.log('🔄 Attempting automatic token refresh...');
            const refreshResponse = await this.refreshToken();
            if (refreshResponse.success && refreshResponse.data) {
              console.log('✅ Token refreshed, retrying original request...');
              // Retry the original request with the new token
              return await this.makeRequest<T>(endpoint, options);
            }
          } catch (refreshError) {
            console.log('❌ Token refresh failed:', refreshError);
            // Clear tokens and let the error propagate
            this.setToken(null);
            localStorage.removeItem('refreshToken');
          }
        }
      }
      throw error;
    }
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
        // Handle authentication errors
        if (response.status === 401) {
          if (this.token && (data.message === 'Token is not valid' || data.message === 'Token has expired' || data.message === 'Server error during authentication')) {
            console.warn('Authentication failed with token, clearing it');
            this.setToken(null);
            localStorage.removeItem('refreshToken');
          }
        }
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', {
        url,
        error: error instanceof Error ? error.message : error,
        token: this.token ? 'present' : 'absent'
      });
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
    const currentToken = this.getToken();
    
    try {
      // Only make API call if we have a token
      if (currentToken) {
        await this.makeRequest('/auth/logout', {
          method: 'POST',
        });
        console.log('✅ Backend logout notification sent');
      } else {
        console.log('ℹ️ No token present, skipping backend logout call');
      }
    } catch (error) {
      console.error('❌ Logout API error (continuing anyway):', error);
    } finally {
      // Always clear local tokens regardless of API call result
      this.setToken(null);
      localStorage.removeItem('refreshToken');
      console.log('🧹 Local tokens cleared');
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
    return this.makeRequestWithRetry<User>('/auth/profile');
  }

  async updateProfile(profileData: Partial<User>): Promise<ApiResponse<User>> {
    return this.makeRequestWithRetry<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Patient methods
  async getPatients(): Promise<ApiResponse<any[]>> {
    return this.makeRequestWithRetry<any[]>('/patients');
  }

  async getPatient(id: string): Promise<ApiResponse<any>> {
    return this.makeRequestWithRetry<any>(`/patients/${id}`);
  }

  // Doctor methods
  async getDoctors(): Promise<ApiResponse<any[]>> {
    return this.makeRequestWithRetry<any[]>('/doctors');
  }

  async getDoctor(id: string): Promise<ApiResponse<any>> {
    return this.makeRequestWithRetry<any>(`/doctors/${id}`);
  }

  // Doctor Dashboard methods
  async getDoctorDashboard(): Promise<ApiResponse<any>> {
    return this.makeRequestWithRetry<any>('/doctors/dashboard');
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

  async getTodayAppointments(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/doctors/appointments/today');
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
    paymentMethod?: string;
    paymentStatus?: string;
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
    return this.makeRequest<any>('/doctors/availability');
  }

  async updateWorkingHours(workingHours: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/doctors/availability/working-hours', {
      method: 'PUT',
      body: JSON.stringify({ working_hours: workingHours }),
    });
  }

  async updateAvailabilityStatus(status: 'available' | 'busy' | 'offline'): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/doctors/availability/status', {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getQueueStatus(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/doctors/queue/status');
  }

  // New enhanced queue management methods
  async startQueue(date?: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/doctors/queue/start', {
      method: 'POST',
      body: JSON.stringify({ date }),
    });
  }

  async stopQueue(date?: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/doctors/queue/stop', {
      method: 'POST',
      body: JSON.stringify({ date }),
    });
  }

  async getQueue(date?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    return this.makeRequest<any>(`/doctors/queue?${params.toString()}`);
  }

  async getNextPaidPatient(date?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    return this.makeRequest<any>(`/doctors/queue/next-patient?${params.toString()}`);
  }

  // Legacy method - kept for compatibility but updated endpoint
  async toggleQueue(isActive: boolean): Promise<ApiResponse<any>> {
    // Use the new start/stop methods based on isActive flag
    return isActive ? this.startQueue() : this.stopQueue();
  }

  async callNextPatient(appointmentId: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/doctors/queue/start/${appointmentId}`, {
      method: 'POST',
    });
  }

  async completeConsultation(appointmentId: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/doctors/queue/complete/${appointmentId}`, {
      method: 'POST',
    });
  }

  async updatePaymentStatus(appointmentId: string, paymentStatus: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/doctors/appointments/${appointmentId}/payment-status`, {
      method: 'PUT',
      body: JSON.stringify({ paymentStatus }),
    });
  }

  // Patient Queue Management
  async getPatientQueuePosition(doctorId?: string, date?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (doctorId) params.append('doctorId', doctorId);
    if (date) params.append('date', date);
    return this.makeRequest<any>(`/patients/queue/position?${params.toString()}`);
  }

  async getPatientNotification(doctorId: string, date?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    params.append('doctorId', doctorId);
    if (date) params.append('date', date);
    return this.makeRequest<any>(`/patients/queue/notification?${params.toString()}`);
  }

  async getDoctorQueueInfo(doctorId: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/patients/queue/status?doctorId=${doctorId}`);
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
  }): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/admin/appointments/queue', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  // Patient Health Data Submission
  async submitHealthData(healthData: {
    pregnancies?: number;
    glucose: number;
    bmi: number;
    age: number;
    insulin?: number;
    notes?: string;
  }): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/patient/health-predictions', {
      method: 'POST',
      body: JSON.stringify(healthData),
    });
  }

  async getHealthSubmissions(params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const url = `/patient/health-predictions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest<any>(url);
  }

  async getHealthSubmissionById(id: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/patient/health-predictions/${id}`);
  }

  async getHealthDashboard(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/patient/health-predictions/dashboard');
  }

  // Admin Health Prediction Management
  async getPatientSubmissions(params?: {
    page?: number;
    limit?: number;
    status?: 'pending' | 'processing' | 'processed' | 'failed' | 'all';
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    
    const url = `/admin/health-predictions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest<any>(url);
  }

  async getPatientSubmissionById(id: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/admin/health-predictions/${id}`);
  }

  async processPatientSubmission(id: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/admin/health-predictions/${id}/process`, {
      method: 'POST',
    });
  }

  async batchProcessSubmissions(submissionIds: string[]): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/admin/health-predictions/batch-process', {
      method: 'POST',
      body: JSON.stringify({ submissionIds }),
    });
  }

  async getAdminHealthDashboard(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/admin/health-predictions/dashboard');
  }
}

export const apiService = ApiService.getInstance();
export default apiService;
