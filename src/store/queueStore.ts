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
  is_emergency: boolean;
  reason_for_visit?: string;
  symptoms?: string;
  estimatedWaitTime?: number;
}

interface QueueStatusInfo {
  id: string;
  doctor_id: string;
  queue_date: string;
  current_number: string;
  current_emergency_number: string;
  max_emergency_slots: number;
  emergency_used: number;
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
  
  // Modal actions
  setShowWorkingHoursSuccessModal: (show: boolean) => void;
  
  // Selectors
  getWaitingPatients: () => QueueItem[];
  getInProgressPatients: () => QueueItem[];
  getCompletedPatients: () => QueueItem[];
  getEmergencyPatients: () => QueueItem[];
  getRegularPatients: () => QueueItem[];
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
      const response = await apiService.getTodayAppointments();
      
      if (response.success && response.data) {
        const appointments = response.data.map((appointment: any) => ({
          id: appointment.id,
          appointment_id: appointment.appointment_id,
          patient_id: appointment.patient_id,
          name: appointment.name,
          email: appointment.email,
          phone: appointment.phone,
          queue_number: appointment.queue_number,
          status: appointment.status,
          priority: appointment.priority,
          is_emergency: appointment.is_emergency,
          reason_for_visit: appointment.reason_for_visit,
          symptoms: appointment.symptoms,
          estimatedWaitTime: 15 // Default estimate
        }));
        
        set({ queue: appointments, isLoading: false });
      } else {
        set({ error: response.error || 'Failed to fetch appointments', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to fetch appointments', isLoading: false });
      console.error('Error fetching today appointments:', error);
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
      const response = await apiService.toggleQueue(isActive);
      
      if (response.success) {
        set(state => ({
          queueStatus: state.queueStatus 
            ? { ...state.queueStatus, is_active: isActive }
            : null
        }));
      } else {
        set({ error: response.error || 'Failed to toggle queue' });
      }
    } catch (error) {
      set({ error: 'Failed to toggle queue' });
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

  getEmergencyPatients: () => {
    const { queue } = get();
    return queue.filter(item => item.is_emergency);
  },

  getRegularPatients: () => {
    const { queue } = get();
    return queue.filter(item => !item.is_emergency);
  }
}));