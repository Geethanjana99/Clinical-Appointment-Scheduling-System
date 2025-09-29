import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import { apiService } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { ClockIcon, UserIcon, CalendarIcon } from 'lucide-react';

interface QueuePosition {
  id: string;
  appointment_id: string;
  doctor_id: string;
  queue_number: number;
  status: string;
  priority: string;
  doctor_name: string;
  specialty: string;
  current_number: string;
  queue_active: boolean;
  queue_position: number;
  estimated_wait_time: number;
  payment_status: string;
  message: string;
}

interface PatientNotification {
  status: 'be_ready' | 'prepare' | 'waiting' | 'payment_required' | 'queue_not_active' | 'completed' | 'current_or_missed';
  message: string;
  position?: number;
  isNext?: boolean;
  appointment: {
    queueNumber: string;
    doctorName: string;
    specialty: string;
    status: string;
  };
  queueInfo?: {
    currentNumber: string;
    isActive: boolean;
  };
}

const PatientQueue = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [appointments, setAppointments] = useState<QueuePosition[]>([]);
  const [notifications, setNotifications] = useState<{ [key: string]: PatientNotification }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if user is authenticated
    if (!isAuthenticated || !user) {
      console.log('Patient Queue: User not authenticated, skipping fetch');
      setIsLoading(false);
      return;
    }

    fetchQueuePosition();
    
    // Poll for updates every 60 seconds (reduced frequency)
    const interval = setInterval(() => {
      if (isAuthenticated && user) {
        console.log('Polling queue position...');
        fetchQueuePosition();
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  const fetchQueuePosition = async () => {
    // Double check authentication
    if (!isAuthenticated || !user) {
      console.log('fetchQueuePosition: Not authenticated');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching queue position for user:', user.id);
      
      // Get queue position for all doctors (no specific doctorId)
      const positionResponse = await apiService.getPatientQueuePosition();
      
      console.log('📊 Raw API Response:', positionResponse);
      
      if (positionResponse.success && positionResponse.data) {
        const appointmentData = Array.isArray(positionResponse.data) 
          ? positionResponse.data 
          : [positionResponse.data];
        
        console.log('📋 Processed appointment data:', appointmentData);
        
        // Fix data format issues - map backend property names to frontend expected names
        const fixedData = appointmentData.map(appointment => ({
          ...appointment,
          // Map position from backend to queue_position for frontend
          queue_position: appointment.position !== undefined ? Number(appointment.position) : 
                         (appointment.queue_position !== undefined ? Number(appointment.queue_position) : 0),
          estimated_wait_time: appointment.estimated_wait_time !== undefined ? Number(appointment.estimated_wait_time) : 0,
          queue_number: appointment.queue_number || appointment.queueNumber || 'N/A',
          payment_status: appointment.payment_status || appointment.paymentStatus || 'unpaid',
          doctor_name: appointment.doctor_name || appointment.doctorName || 'Unknown Doctor',
          specialty: appointment.specialty || appointment.specialization || 'Unknown Specialty',
          // Map currentNumber from backend to current_number for frontend
          current_number: appointment.currentNumber || appointment.current_number || 'N/A',
          // Map queueActive status
          queue_active: appointment.queueActive !== undefined ? appointment.queueActive : 
                       (appointment.queue_active !== undefined ? appointment.queue_active : false)
        }));
        
        console.log('🔧 Fixed appointment data:', fixedData);
        setAppointments(fixedData);
        
        // Only get notifications for the first appointment to avoid too many API calls
        if (appointmentData.length > 0) {
          try {
            const firstAppointment = appointmentData[0];
            const doctorId = firstAppointment.doctor_id || firstAppointment.doctorId;
            
            if (doctorId) {
              console.log('Fetching notification for doctor:', doctorId);
              const notifResponse = await apiService.getPatientNotification(doctorId);
              
              if (notifResponse.success && notifResponse.data) {
                setNotifications({
                  [doctorId]: notifResponse.data
                });
              }
            }
          } catch (err) {
            console.warn('Failed to fetch notification:', err);
            // Continue without notifications if they fail
          }
        }
      } else {
        setError(positionResponse.error || 'Failed to fetch queue position');
      }
    } catch (err) {
      setError('Failed to fetch queue position');
      console.error('Error fetching queue position:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatWaitTime = (minutes: number | undefined | null) => {
    if (minutes === undefined || minutes === null || isNaN(minutes) || minutes < 0) {
      return 'Unknown';
    }
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

  if (!isAuthenticated || !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <Card>
          <div className="p-8 text-center">
            <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Please Log In</h3>
            <p className="text-gray-500">You need to be logged in to view your queue status.</p>
          </div>
        </Card>
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
            <p className="text-sm text-gray-400 mt-2">Please book an appointment with a doctor to join the queue.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => {
            const notification = notifications[appointment.doctor_id];
            
            return (
            <Card key={appointment.id}>
              <div className="p-6">
                {/* Enhanced notification banner */}
                {notification && (
                  <div className={`mb-4 p-3 rounded-lg border-l-4 ${
                    notification.status === 'be_ready' 
                      ? 'bg-red-50 border-red-400 text-red-800'
                    : notification.status === 'prepare'
                      ? 'bg-yellow-50 border-yellow-400 text-yellow-800'
                    : notification.status === 'payment_required'
                      ? 'bg-orange-50 border-orange-400 text-orange-800'
                    : notification.status === 'queue_not_active'
                      ? 'bg-gray-50 border-gray-400 text-gray-800'
                    : notification.status === 'completed'
                      ? 'bg-green-50 border-green-400 text-green-800'
                    : 'bg-blue-50 border-blue-400 text-blue-800'
                  }`}>
                    <div className="flex items-center space-x-2">
                      {notification.status === 'be_ready' && (
                        <div className="animate-pulse font-bold text-lg">🔔</div>
                      )}
                      <p className="font-medium">{notification.message}</p>
                    </div>
                    {notification.position && (
                      <p className="text-sm mt-1">
                        Position in queue: {notification.position} 
                        {notification.isNext && " (You're next!)"}
                      </p>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Dr. {notification?.appointment?.doctorName || appointment.doctor_name || 'Unknown'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {notification?.appointment?.specialty || appointment.specialty || 'Unknown Specialty'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
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
                          {appointment.queue_number === undefined || appointment.queue_number === null 
                            ? 'N/A' 
                            : appointment.queue_number}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Current Number</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {appointment.current_number || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-700">Position in Queue</div>
                        <div className="text-2xl font-bold text-yellow-600">
                          {appointment.queue_position === undefined || appointment.queue_position === null || isNaN(appointment.queue_position) 
                            ? 'Unknown' 
                            : appointment.queue_position <= 1 
                              ? 'Next' 
                              : `${appointment.queue_position}`}
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

                {/* Payment Status Section */}
                <div className="mt-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-700">Payment Status</div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        appointment.payment_status === 'paid' 
                          ? 'bg-green-100 text-green-800'
                        : appointment.payment_status === 'partially_paid'
                          ? 'bg-yellow-100 text-yellow-800'
                        : appointment.payment_status === 'unpaid'
                          ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                      }`}>
                        {appointment.payment_status === 'paid' ? 'Paid ✓' :
                         appointment.payment_status === 'partially_paid' ? 'Partially Paid' :
                         appointment.payment_status === 'unpaid' ? 'Payment Required' : 'Refunded'}
                      </span>
                    </div>
                    {appointment.payment_status === 'unpaid' && (
                      <div className="text-right">
                        <div className="text-xs text-red-600 font-medium">
                          Complete payment to join active queue
                        </div>
                      </div>
                    )}
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
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PatientQueue;
