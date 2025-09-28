import { create } from 'zustand';
import { apiService } from '../services/api';

type QueueStatus = 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';

interface QueueItem {
  id: string;
  appointment_id: string;
  patient_id: string;
  name: string;
  email: string;
  phone: string;
  queue_number: number;
  status: QueueStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  payment_status: 'unpaid' | 'paid' | 'partially_paid' | 'refunded';
  reason_for_visit?: string;
  symptoms?: string;
  estimatedWaitTime?: number;
}

interface QueueStatusInfo {
  id: string;
  doctor_id: string;
  queue_date: string;
  current_number: string;
  regular_count: number;
  available_from: string;
  available_to: string;
  is_active: boolean;
}

interface DoctorAvailability {
  working_hours: any;
  availability_status: 'available' | 'busy' | 'offline';
}

interface QueueState {
  // Queue items
  queue: QueueItem[];
  queueStatus: QueueStatusInfo | null;
  doctorAvailability: DoctorAvailability | null;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Success modal state
  showWorkingHoursSuccessModal: boolean;
  
  // Actions
  fetchTodayAppointments: () => Promise<void>;
  fetchQueueStatus: () => Promise<void>;
  fetchDoctorAvailability: () => Promise<void>;
  updateAvailabilityStatus: (status: 'available' | 'busy' | 'offline') => Promise<void>;
  updateWorkingHours: (workingHours: any) => Promise<void>;
  toggleQueue: (isActive: boolean) => Promise<void>;
  callNextPatient: (appointmentId: string) => Promise<void>;
  completeConsultation: (appointmentId: string) => Promise<void>;
  
  // New enhanced queue management actions
  startQueue: () => Promise<void>;
  stopQueue: () => Promise<void>;
  getNextPaidPatient: () => Promise<QueueItem | null>;
  updatePaymentStatus: (appointmentId: string, paymentStatus: string) => Promise<void>;
  
  // Modal actions
  setShowWorkingHoursSuccessModal: (show: boolean) => void;
  
  // Selectors
  getWaitingPatients: () => QueueItem[];
  getInProgressPatients: () => QueueItem[];
  getCompletedPatients: () => QueueItem[];
}

export const useQueueStore = create<QueueState>((set, get) => ({
  queue: [],
  queueStatus: null,
  doctorAvailability: null,
  isLoading: false,
  error: null,
  showWorkingHoursSuccessModal: false,

  fetchTodayAppointments: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Try to get enhanced queue data first
      let queueResponse;
      try {
        queueResponse = await apiService.getQueue();
      } catch (error) {
        console.warn('Enhanced queue API failed, falling back to basic appointments:', error);
        // Fallback to basic appointments
        queueResponse = await apiService.getTodayAppointments();
      }
      
      if (queueResponse.success && queueResponse.data) {
        let appointments = [];
        let queueStatus = null;
        
        // Handle enhanced queue response format
        if (queueResponse.data.appointments) {
          const queueData = queueResponse.data;
          appointments = queueData.appointments?.map((appointment: any) => ({
            id: appointment.id,
            appointment_id: appointment.appointment_id,
            patient_id: appointment.patient_id,
            name: appointment.patient_name || appointment.name,
            email: appointment.email,
            phone: appointment.patient_phone || appointment.phone,
            queue_number: appointment.queue_number,
            status: appointment.status,
            priority: appointment.priority || 'medium',
            payment_status: appointment.payment_status,
            reason_for_visit: appointment.reason_for_visit,
            symptoms: appointment.symptoms,
            estimatedWaitTime: 15
          })) || [];
          
          queueStatus = queueData.queueStatus;
        } 
        // Handle basic appointments response format  
        else if (Array.isArray(queueResponse.data)) {
          appointments = queueResponse.data.map((appointment: any) => ({
            id: appointment.id,
            appointment_id: appointment.appointment_id,
            patient_id: appointment.patient_id,
            name: appointment.name,
            email: appointment.email,
            phone: appointment.phone,
            queue_number: appointment.queue_number,
            status: appointment.status,
            priority: appointment.priority || 'medium',
            payment_status: appointment.payment_status || 'unpaid',
            reason_for_visit: appointment.reason_for_visit,
            symptoms: appointment.symptoms,
            estimatedWaitTime: 15
          }));
        }
        
        set({ 
          queue: appointments, 
          isLoading: false,
          error: null 
        });
        
        // Update queue status if available
        if (queueStatus) {
          set({ queueStatus });
        }
      } else {
        set({ error: queueResponse.error || 'Failed to fetch appointments', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to fetch appointments', isLoading: false });
      console.error('Error fetching appointments:', error);
    }
  },

  fetchQueueStatus: async () => {
    try {
      const response = await apiService.getQueueStatus();
      
      if (response.success && response.data) {
        set({ queueStatus: response.data });
      } else {
        set({ error: response.error || 'Failed to fetch queue status' });
      }
    } catch (error) {
      set({ error: 'Failed to fetch queue status' });
      console.error('Error fetching queue status:', error);
    }
  },

  fetchDoctorAvailability: async () => {
    try {
      const response = await apiService.getDoctorAvailability();
      
      if (response.success && response.data) {
        set({ doctorAvailability: response.data });
      } else {
        set({ error: response.error || 'Failed to fetch doctor availability' });
      }
    } catch (error) {
      set({ error: 'Failed to fetch doctor availability' });
      console.error('Error fetching doctor availability:', error);
    }
  },

  updateAvailabilityStatus: async (status: 'available' | 'busy' | 'offline') => {
    try {
      const response = await apiService.updateAvailabilityStatus(status);
      
      if (response.success) {
        set(state => ({
          doctorAvailability: state.doctorAvailability 
            ? { ...state.doctorAvailability, availability_status: status }
            : null
        }));
      } else {
        set({ error: response.error || 'Failed to update availability status' });
      }
    } catch (error) {
      set({ error: 'Failed to update availability status' });
      console.error('Error updating availability status:', error);
    }
  },

  updateWorkingHours: async (workingHours: any) => {
    try {
      const response = await apiService.updateWorkingHours(workingHours);
      
      if (response.success) {
        set(state => ({
          doctorAvailability: state.doctorAvailability 
            ? { ...state.doctorAvailability, working_hours: workingHours }
            : null,
          showWorkingHoursSuccessModal: true
        }));
      } else {
        set({ error: response.error || 'Failed to update working hours' });
      }
    } catch (error) {
      set({ error: 'Failed to update working hours' });
      console.error('Error updating working hours:', error);
    }
  },

  toggleQueue: async (isActive: boolean) => {
    try {
      set({ isLoading: true, error: null });
      
      let response;
      if (isActive) {
        response = await apiService.startQueue();
      } else {
        response = await apiService.stopQueue();
      }
      
      if (response.success) {
        set(state => ({
          queueStatus: state.queueStatus 
            ? { ...state.queueStatus, is_active: isActive }
            : null,
          isLoading: false
        }));
        
        // Refresh queue data to show filtered results when queue is active
        get().fetchTodayAppointments();
      } else {
        set({ error: response.error || 'Failed to toggle queue', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to toggle queue', isLoading: false });
      console.error('Error toggling queue:', error);
    }
  },

  callNextPatient: async (appointmentId: string) => {
    try {
      const response = await apiService.callNextPatient(appointmentId);
      
      if (response.success) {
        set(state => ({
          queue: state.queue.map(item => 
            item.id === appointmentId 
              ? { ...item, status: 'in-progress' as QueueStatus }
              : item
          )
        }));
      } else {
        set({ error: response.error || 'Failed to call next patient' });
      }
    } catch (error) {
      set({ error: 'Failed to call next patient' });
      console.error('Error calling next patient:', error);
    }
  },

  completeConsultation: async (appointmentId: string) => {
    try {
      const response = await apiService.completeConsultation(appointmentId);
      
      if (response.success) {
        set(state => ({
          queue: state.queue.map(item => 
            item.id === appointmentId 
              ? { ...item, status: 'completed' as QueueStatus }
              : item
          )
        }));
      } else {
        set({ error: response.error || 'Failed to complete consultation' });
      }
    } catch (error) {
      set({ error: 'Failed to complete consultation' });
      console.error('Error completing consultation:', error);
    }
  },

  // Enhanced queue management actions
  startQueue: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.startQueue();
      
      if (response.success) {
        set(state => ({
          queueStatus: state.queueStatus 
            ? { ...state.queueStatus, is_active: true }
            : null,
          isLoading: false
        }));
        
        // Refresh queue data to show only paid patients
        get().fetchTodayAppointments();
      } else {
        set({ error: response.error || 'Failed to start queue', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to start queue', isLoading: false });
      console.error('Error starting queue:', error);
    }
  },

  stopQueue: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.stopQueue();
      
      if (response.success) {
        set(state => ({
          queueStatus: state.queueStatus 
            ? { ...state.queueStatus, is_active: false }
            : null,
          isLoading: false
        }));
        
        // Refresh queue data to show all patients
        get().fetchTodayAppointments();
      } else {
        set({ error: response.error || 'Failed to stop queue', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to stop queue', isLoading: false });
      console.error('Error stopping queue:', error);
    }
  },

  getNextPaidPatient: async () => {
    try {
      console.log('🔎 Calling API for next paid patient...');
      const response = await apiService.getNextPaidPatient();
      console.log('📡 API Response:', response);
      
      if (response.success && response.data?.patient) {
        const patient = response.data.patient;
        console.log('✅ Found paid patient:', patient.patient_name, 'Status:', patient.payment_status);
        
        return {
          id: patient.id,
          appointment_id: patient.appointment_id,
          patient_id: patient.patient_id,
          name: patient.patient_name,
          email: patient.email,
          phone: patient.patient_phone,
          queue_number: patient.queue_number,
          status: patient.status,
          priority: patient.priority || 'medium',
          payment_status: patient.payment_status,
          reason_for_visit: patient.reason_for_visit,
          symptoms: patient.symptoms,
          estimatedWaitTime: 15
        };
      } else {
        console.log('❌ No paid patient found. Response:', response);
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting next paid patient:', error);
      return null;
    }
  },

  updatePaymentStatus: async (appointmentId: string, paymentStatus: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.updatePaymentStatus(appointmentId, paymentStatus);
      
      if (response.success) {
        set(state => ({
          queue: state.queue.map(item =>
            item.appointment_id === appointmentId
              ? { ...item, payment_status: paymentStatus as any }
              : item
          ),
          isLoading: false
        }));
        
        // Refresh queue to reflect payment changes in filtered view
        get().fetchTodayAppointments();
      } else {
        set({ error: response.error || 'Failed to update payment status', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to update payment status', isLoading: false });
      console.error('Error updating payment status:', error);
    }
  },

  // Modal actions
  setShowWorkingHoursSuccessModal: (show: boolean) => {
    set({ showWorkingHoursSuccessModal: show });
  },

  // Selectors
  getWaitingPatients: () => {
    const { queue } = get();
    return queue.filter(item => ['scheduled', 'confirmed'].includes(item.status));
  },

  getInProgressPatients: () => {
    const { queue } = get();
    return queue.filter(item => item.status === 'in-progress');
  },

  getCompletedPatients: () => {
    const { queue } = get();
    return queue.filter(item => item.status === 'completed');
  },


}));