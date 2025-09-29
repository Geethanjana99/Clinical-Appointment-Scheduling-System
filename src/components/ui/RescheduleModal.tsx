import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Loader2 } from 'lucide-react';
import Button from './Button';
import { apiService } from '../../services/api';
import { toast } from 'sonner';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: {
    id: number;
    doctor_id: number;
    doctor_name: string;
    specialty: string;
    appointment_date: string;
    appointment_time: string;
    appointment_type?: string;
    status: string;
  };
  onRescheduleSuccess: (appointmentId: number, newDate: string, newTime: string) => void;
}

const RescheduleModal = ({ isOpen, onClose, appointment, onRescheduleSuccess }: RescheduleModalProps) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedDate('');
      setSelectedTime('');
      setAvailableSlots([]);
    }
  }, [isOpen]);

  // Fetch available slots when date is selected
  useEffect(() => {
    if (selectedDate && appointment.doctor_id) {
      fetchAvailableSlots();
    }
  }, [selectedDate, appointment.doctor_id]);

  const fetchAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      const response = await apiService.getAvailableSlots(
        appointment.doctor_id.toString(),
        selectedDate
      );
      
      if (response.success && response.data) {
        setAvailableSlots(response.data.slots || []);
      } else {
        toast.error('Failed to fetch available slots');
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast.error('Failed to fetch available slots');
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };
  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select both date and time');
      return;
    }

    // Check if selected date/time is in the future
    const selectedDateTime = new Date(`${selectedDate}T${selectedTime}`);
    const now = new Date();
    
    if (selectedDateTime <= now) {
      toast.error('Please select a future date and time');
      return;
    }

    // Check if it's the same as current appointment
    if (selectedDate === appointment.appointment_date && selectedTime === appointment.appointment_time) {
      toast.error('Please select a different date or time');
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.rescheduleAppointment(
        appointment.id.toString(),
        selectedDate,
        selectedTime
      );

      if (response.success) {
        toast.success('Appointment rescheduled successfully', {
          description: 'You will receive a confirmation email shortly.'
        });
        onRescheduleSuccess(appointment.id, selectedDate, selectedTime);
        onClose();
      } else {
        toast.error('Failed to reschedule appointment', {
          description: response.message || 'Please try again or contact support.'
        });
      }
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      toast.error('An error occurred while rescheduling', {
        description: 'Please try again or contact support.'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Get maximum date (3 months from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    return maxDate.toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Reschedule Appointment</h2>          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Current Appointment Details */}
        <div className="p-6 border-b bg-gray-50">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Current Appointment</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p><strong>Doctor:</strong> {appointment.doctor_name}</p>
            <p><strong>Specialty:</strong> {appointment.specialty}</p>
            <p><strong>Date:</strong> {formatDate(appointment.appointment_date)}</p>
            <p><strong>Time:</strong> {formatTime(appointment.appointment_time)}</p>
          </div>
        </div>

        {/* Reschedule Form */}
        <div className="p-6 space-y-4">
          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Select New Date
            </label>            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={getMinDate()}
              max={getMaxDate()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              aria-label="Select appointment date"
            />
          </div>

          {/* Time Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Select New Time
            </label>
            
            {!selectedDate ? (
              <p className="text-sm text-gray-500 py-8 text-center">
                Please select a date first to see available time slots
              </p>
            ) : loadingSlots ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-2" />
                <span className="text-sm text-gray-600">Loading available slots...</span>
              </div>
            ) : availableSlots.length === 0 ? (
              <p className="text-sm text-gray-500 py-8 text-center">
                No available slots for this date. Please select another date.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedTime(slot)}
                    className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                      selectedTime === slot
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {formatTime(slot)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleReschedule}
            className="flex-1"
            disabled={loading || !selectedDate || !selectedTime}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Rescheduling...
              </>
            ) : (
              'Reschedule Appointment'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RescheduleModal;
