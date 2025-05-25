import { create } from 'zustand';
type QueueStatus = 'waiting' | 'in-consultation' | 'completed';
interface QueueItem {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  appointmentTime: string;
  status: QueueStatus;
  estimatedWaitTime?: number; // in minutes
}
interface QueueState {
  queue: QueueItem[];
  updateStatus: (appointmentId: string, status: QueueStatus) => void;
  getQueueForDoctor: (doctorId: string) => QueueItem[];
  getQueueForPatient: (patientId: string) => QueueItem[];
}
// Mock data
const mockQueue: QueueItem[] = [{
  id: 'appt-1',
  patientId: 'patient-1',
  patientName: 'John Smith',
  doctorId: 'doctor-1',
  doctorName: 'Dr. Sarah Johnson',
  appointmentTime: '09:00 AM',
  status: 'waiting',
  estimatedWaitTime: 15
}, {
  id: 'appt-2',
  patientId: 'patient-2',
  patientName: 'Emily Davis',
  doctorId: 'doctor-1',
  doctorName: 'Dr. Sarah Johnson',
  appointmentTime: '09:30 AM',
  status: 'waiting',
  estimatedWaitTime: 30
}, {
  id: 'appt-3',
  patientId: 'patient-3',
  patientName: 'Michael Brown',
  doctorId: 'doctor-2',
  doctorName: 'Dr. Robert Chen',
  appointmentTime: '10:00 AM',
  status: 'in-consultation',
  estimatedWaitTime: 0
}, {
  id: 'appt-4',
  patientId: 'patient-4',
  patientName: 'Jessica Wilson',
  doctorId: 'doctor-2',
  doctorName: 'Dr. Robert Chen',
  appointmentTime: '10:30 AM',
  status: 'waiting',
  estimatedWaitTime: 45
}, {
  id: 'appt-5',
  patientId: 'patient-5',
  patientName: 'David Miller',
  doctorId: 'doctor-1',
  doctorName: 'Dr. Sarah Johnson',
  appointmentTime: '11:00 AM',
  status: 'completed',
  estimatedWaitTime: 0
}];
export const useQueueStore = create<QueueState>((set, get) => ({
  queue: mockQueue,
  updateStatus: (appointmentId, status) => {
    set(state => ({
      queue: state.queue.map(item => item.id === appointmentId ? {
        ...item,
        status,
        estimatedWaitTime: status === 'waiting' ? 15 : 0
      } : item)
    }));
  },
  getQueueForDoctor: doctorId => {
    return get().queue.filter(item => item.doctorId === doctorId);
  },
  getQueueForPatient: patientId => {
    return get().queue.filter(item => item.patientId === patientId);
  }
}));