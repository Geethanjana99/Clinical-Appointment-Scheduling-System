import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import { apiService } from '../../services/api';
import { ClockIcon, UserIcon, CalendarIcon } from 'lucide-react';

interface QueuePosition {
  id: string;
  appointment_id: string;
  doctor_id: string;
  queue_number: number;
  status: string;
  priority: string;
  is_emergency: boolean;
  doctor_name: string;
  specialty: string;
  current_number: string;
  current_emergency_number: string;
  queue_active: boolean;
  queue_position: number;
  estimated_wait_time: number;
}

const PatientQueue = () => {
  const [appointments, setAppointments] = useState<QueuePosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQueuePosition();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchQueuePosition, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchQueuePosition = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.getPatientQueuePosition();
      
      if (response.success && response.data) {
        setAppointments(response.data.appointments || []);
      } else {
        setError(response.error || 'Failed to fetch queue position');
      }
    } catch (err) {
      setError('Failed to fetch queue position');
      console.error('Error fetching queue position:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatWaitTime = (minutes: number) => {
    if (minutes === 0) return 'Now';
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Queue Status</h1>
        <button
          onClick={fetchQueuePosition}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800 text-sm">{error}</div>
        </div>
      )}

      {appointments.length === 0 ? (
        <Card>
          <div className="p-8 text-center">
            <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointments Today</h3>
            <p className="text-gray-500">You don't have any appointments scheduled for today.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <Card key={appointment.id}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Dr. {appointment.doctor_name}
                      </h3>
                      <p className="text-sm text-gray-500">{appointment.specialty}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      {appointment.is_emergency && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Emergency
                        </span>
                      )}
                      <StatusBadge status={appointment.status as any} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-700">Your Queue Number</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {appointment.is_emergency ? `E${appointment.queue_number}` : appointment.queue_number}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Current Number</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {appointment.is_emergency ? appointment.current_emergency_number : appointment.current_number}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-700">Position in Queue</div>
                        <div className="text-2xl font-bold text-yellow-600">
                          {appointment.queue_position === 0 ? 'Next' : `${appointment.queue_position + 1}`}
                        </div>
                      </div>
                      <ClockIcon className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-700">Estimated Wait</div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatWaitTime(appointment.estimated_wait_time)}
                        </div>
                      </div>
                      <ClockIcon className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-700">Queue Status</div>
                      <div className="text-sm text-gray-600">
                        {appointment.queue_active ? (
                          <span className="text-green-600">✓ Queue is active</span>
                        ) : (
                          <span className="text-red-600">⏸ Queue is paused</span>
                        )}
                      </div>
                    </div>
                    {appointment.queue_position === 0 && appointment.queue_active && (
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600">You're Next!</div>
                        <div className="text-xs text-gray-500">Please be ready</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientQueue;
