import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import { useQueueStore } from '../../store/queueStore';
import { useAuthStore } from '../../store/authStore';
import WorkingHoursSuccessModal from '../../components/modals/WorkingHoursSuccessModal';
import { 
  UserIcon, 
  ClockIcon, 
  CheckIcon, 
  SettingsIcon, 
  PlayIcon, 
  PauseIcon,
  PhoneIcon,
  RefreshCwIcon,
  Stethoscope,
  UserCheck
} from 'lucide-react';

type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

interface DaySchedule {
  start: string;
  end: string;
  enabled: boolean;
}

type WorkingHours = Record<DayOfWeek, DaySchedule>;

const ManageQueue = () => {
  const { user } = useAuthStore();
  const {
    queue,
    queueStatus,
    doctorAvailability,
    isLoading,
    error,
    showWorkingHoursSuccessModal,
    fetchTodayAppointments,
    fetchDoctorAvailability,
    updateAvailabilityStatus,
    updateWorkingHours,
    callNextPatient,
    completeConsultation,
    setShowWorkingHoursSuccessModal,
    getWaitingPatients,
    getInProgressPatients,
    getCompletedPatients,
    // New enhanced methods
    startQueue,
    stopQueue,
    getNextPaidPatient,
    updatePaymentStatus
  } = useQueueStore();

  const [activeTab, setActiveTab] = useState<'availability' | 'queue'>('availability');
  const [nextPatient, setNextPatient] = useState<any>(null);
  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    monday: { start: '09:00', end: '17:00', enabled: true },
    tuesday: { start: '09:00', end: '17:00', enabled: true },
    wednesday: { start: '09:00', end: '17:00', enabled: true },
    thursday: { start: '09:00', end: '17:00', enabled: true },
    friday: { start: '09:00', end: '17:00', enabled: true },
    saturday: { start: '10:00', end: '14:00', enabled: false },
    sunday: { start: '10:00', end: '14:00', enabled: false }
  });

  useEffect(() => {
    if (user) {
      // fetchTodayAppointments now includes queue status, so no need for separate fetchQueueStatus call
      fetchTodayAppointments();
      fetchDoctorAvailability();
    }
  }, [user]);

  // Fetch next patient when queue status changes to active
  useEffect(() => {
    if (queueStatus?.is_active) {
      handleGetNextPatient();
    } else {
      setNextPatient(null);
    }
  }, [queueStatus?.is_active]);

  useEffect(() => {
    console.log('Doctor availability data:', doctorAvailability);
    if (doctorAvailability?.working_hours) {
      console.log('Working hours from backend:', doctorAvailability.working_hours);
      // Merge backend data with defaults to ensure all days are present
      const mergedHours = {
        monday: doctorAvailability.working_hours.monday || { start: '09:00', end: '17:00', enabled: true },
        tuesday: doctorAvailability.working_hours.tuesday || { start: '09:00', end: '17:00', enabled: true },
        wednesday: doctorAvailability.working_hours.wednesday || { start: '09:00', end: '17:00', enabled: true },
        thursday: doctorAvailability.working_hours.thursday || { start: '09:00', end: '17:00', enabled: true },
        friday: doctorAvailability.working_hours.friday || { start: '09:00', end: '17:00', enabled: true },
        saturday: doctorAvailability.working_hours.saturday || { start: '10:00', end: '14:00', enabled: false },
        sunday: doctorAvailability.working_hours.sunday || { start: '10:00', end: '14:00', enabled: false }
      };
      setWorkingHours(mergedHours);
    } else {
      console.log('No working hours received from backend, keeping defaults');
    }
  }, [doctorAvailability]);

  const handleAvailabilityStatusChange = async (status: 'available' | 'busy' | 'offline') => {
    await updateAvailabilityStatus(status);
  };

  const handleWorkingHoursUpdate = async () => {
    await updateWorkingHours(workingHours);
  };

  const handleToggleQueue = async () => {
    const newStatus = !queueStatus?.is_active;
    
    try {
      if (newStatus) {
        // Starting queue
        await startQueue();
        await fetchTodayAppointments(); // This now includes queue status
        
        // Wait a moment for data to update
        setTimeout(async () => {
          const next = await getNextPaidPatient();
          setNextPatient(next);
        }, 1000);
      } else {
        // Stopping queue
        await stopQueue();
        // Refresh appointments with queue status
        await fetchTodayAppointments();
        setNextPatient(null);
      }
    } catch (error) {
    }
  };

  const handleCallNextPatient = async (appointmentId: string) => {
    try {
      await callNextPatient(appointmentId);
      // Refresh data after action - this will update the patient status to 'in-progress'
      await fetchTodayAppointments();
      // Refresh the next patient display to show updated status
      await handleGetNextPatient();
    } catch (error) {
    }
  };

  const handleCompleteConsultation = async (appointmentId: string) => {
    try {
      await completeConsultation(appointmentId);
      // Refresh data after action
      await fetchTodayAppointments();
      
      // Automatically get the next patient after completing consultation
      if (queueStatus?.is_active) {
        setTimeout(async () => {
          await handleGetNextPatient();
        }, 500); // Small delay to ensure backend updates are complete
      }
    } catch (error) {
    }
  };

  const handlePaymentStatusUpdate = async (appointmentId: string, newStatus: string) => {
    try {
      await updatePaymentStatus(appointmentId, newStatus);
      // Refresh data after payment update
      await fetchTodayAppointments();
      if (queueStatus?.is_active) {
        await handleGetNextPatient();
      }
    } catch (error) {
    }
  };

  const handleGetNextPatient = async () => {
    try {
      // Check if user is authenticated and is a doctor
      if (!user || user.role !== 'doctor') {
        return;
      }
      
      // Only get next patient if queue is active
      if (!queueStatus?.is_active) {
        setNextPatient(null);
        return;
      }
      
      const next = await getNextPaidPatient();
      
      if (next) {
        setNextPatient(next);
        console.log('Next patient loaded:', next.name, 'Queue #:', next.queue_number);
      } else {
        setNextPatient(null);
        console.log('No more patients in queue');
      }
    } catch (error) {
      console.error('Error getting next patient:', error);
      setNextPatient(null);
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      case 'partially_paid':
        return 'bg-yellow-100 text-yellow-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const waitingPatients = getWaitingPatients();
  const inProgressPatients = getInProgressPatients();
  const completedPatients = getCompletedPatients();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderAvailabilityTab = () => (
    <div className="space-y-6">
      {/* Availability Status */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Availability Status</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Current Status:</span>
              <StatusBadge 
                status={doctorAvailability?.availability_status as 'available' | 'busy' | 'offline' || 'offline'}
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant={doctorAvailability?.availability_status === 'available' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleAvailabilityStatusChange('available')}
              >
                Available
              </Button>
              <Button
                variant={doctorAvailability?.availability_status === 'busy' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleAvailabilityStatusChange('busy')}
              >
                Busy
              </Button>
              <Button
                variant={doctorAvailability?.availability_status === 'offline' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleAvailabilityStatusChange('offline')}
              >
                Offline
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Working Hours */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Default Working Hours</h3>
          <div className="space-y-4">
            {Object.entries(workingHours).map(([day, hours]) => (
              <div key={day} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={hours.enabled}
                    onChange={(e) => setWorkingHours(prev => ({
                      ...prev,
                      [day as DayOfWeek]: { ...prev[day as DayOfWeek], enabled: e.target.checked }
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    aria-label={`Enable ${day}`}
                  />
                  <span className="font-medium capitalize">{day}</span>
                </div>
                {hours.enabled && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="time"
                      value={hours.start}
                      onChange={(e) => setWorkingHours(prev => ({
                        ...prev,
                        [day as DayOfWeek]: { ...prev[day as DayOfWeek], start: e.target.value }
                      }))}
                      className="border rounded px-2 py-1 text-sm"
                      aria-label={`Start time for ${day}`}
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="time"
                      value={hours.end}
                      onChange={(e) => setWorkingHours(prev => ({
                        ...prev,
                        [day as DayOfWeek]: { ...prev[day as DayOfWeek], end: e.target.value }
                      }))}
                      className="border rounded px-2 py-1 text-sm"
                      aria-label={`End time for ${day}`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={handleWorkingHoursUpdate} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Working Hours'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderQueueTab = () => (
    <div className="space-y-6">
      {/* Queue Control */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Queue Management</h3>
              <p className="text-sm text-gray-600">
                {queueStatus?.is_active ? 'Queue is active' : 'Queue is stopped'}
              </p>
            </div>
            <Button
              variant={queueStatus?.is_active ? 'outline' : 'primary'}
              onClick={handleToggleQueue}
              className="flex items-center space-x-2"
            >
              {queueStatus?.is_active ? (
                <>
                  <PauseIcon className="w-4 h-4" />
                  <span>Stop Queue</span>
                </>
              ) : (
                <>
                  <PlayIcon className="w-4 h-4" />
                  <span>Start Queue</span>
                </>
              )}
            </Button>
          </div>
          
          {queueStatus && (
            <>
              {/* Status Statistics */}
              <div className="mt-4 grid grid-cols-4 gap-4 text-center">
                <div className="bg-blue-50 p-3 rounded">
                  <div className="text-2xl font-bold text-blue-600">{waitingPatients.length}</div>
                  <div className="text-sm text-gray-600">Waiting</div>
                </div>
                <div className="bg-yellow-50 p-3 rounded">
                  <div className="text-2xl font-bold text-yellow-600">{inProgressPatients.length}</div>
                  <div className="text-sm text-gray-600">In Progress</div>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <div className="text-2xl font-bold text-green-600">{completedPatients.length}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <div className="text-2xl font-bold text-purple-600">
                    {queueStatus?.current_number || '0'}
                  </div>
                  <div className="text-sm text-gray-600">Current #</div>
                </div>
              </div>
              
              {/* Payment Statistics */}
              <div className="mt-4 grid grid-cols-4 gap-4 text-center">
                <div className="bg-green-50 p-3 rounded">
                  <div className="text-2xl font-bold text-green-600">
                    {queue.filter(p => p.payment_status === 'paid').length}
                  </div>
                  <div className="text-sm text-gray-600">Paid</div>
                </div>
                <div className="bg-red-50 p-3 rounded">
                  <div className="text-2xl font-bold text-red-600">
                    {queue.filter(p => p.payment_status === 'unpaid').length}
                  </div>
                  <div className="text-sm text-gray-600">Unpaid</div>
                </div>
                <div className="bg-yellow-50 p-3 rounded">
                  <div className="text-2xl font-bold text-yellow-600">
                    {queue.filter(p => p.payment_status === 'partially_paid').length}
                  </div>
                  <div className="text-sm text-gray-600">Partial</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-2xl font-bold text-gray-600">
                    {queue.filter(p => p.payment_status === 'refunded').length}
                  </div>
                  <div className="text-sm text-gray-600">Refunded</div>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Enhanced Queue Status Display */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Live Queue Status</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Number Being Served */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Currently Serving</p>
                  <p className="text-3xl font-bold">
                    {(() => {
                      const currentPatient = queue.find(p => p.status === 'in-progress');
                      return currentPatient ? currentPatient.queue_number : (queueStatus?.current_number || '0');
                    })()}
                  </p>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                  <UserIcon className="h-8 w-8" />
                </div>
              </div>
            </div>

            {/* Queue Activity Status */}
            <div className={`p-6 rounded-xl shadow-lg ${
              queueStatus?.is_active 
                ? 'bg-gradient-to-br from-green-500 to-green-600 text-white' 
                : 'bg-gradient-to-br from-gray-400 to-gray-500 text-white'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${queueStatus?.is_active ? 'text-green-100' : 'text-gray-100'}`}>
                    Queue Status
                  </p>
                  <p className="text-2xl font-bold">
                    {queueStatus?.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </p>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                  {queueStatus?.is_active ? (
                    <PlayIcon className="h-8 w-8" />
                  ) : (
                    <PauseIcon className="h-8 w-8" />
                  )}
                </div>
              </div>
            </div>

            {/* Remaining Paid Patients */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Remaining Paid Patients</p>
                  <p className="text-3xl font-bold">
                    {queue.filter(p => p.payment_status === 'paid' && ['scheduled', 'confirmed'].includes(p.status)).length}
                  </p>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                  <UserIcon className="h-8 w-8" />
                </div>
              </div>
            </div>
          </div>

          {/* Queue Operating Hours */}
          {queueStatus && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Operating Hours:</span>
                <span className="font-semibold text-gray-800">
                  {queueStatus.available_from} - {queueStatus.available_to}
                </span>
                <span className="text-gray-600">Date:</span>
                <span className="font-semibold text-gray-800">{queueStatus.queue_date}</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Enhanced Next Patient Section - Only show when queue is active */}
      {queueStatus?.is_active && (
        <Card className="shadow-lg border-t-4 border-t-blue-500">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <UserIcon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Next Patient</h3>
                  <p className="text-blue-100 text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGetNextPatient}
                className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm"
              >
                <RefreshCwIcon className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
          
          <div className="p-6">
            {nextPatient ? (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
                {/* Patient Header */}
                <div className="px-6 py-4 border-b border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="h-16 w-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                          <UserIcon className="h-8 w-8 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                          <span className="text-xs font-bold text-white">#{nextPatient.queue_number}</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">{nextPatient.name}</h4>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center text-gray-600">
                            <PhoneIcon className="h-4 w-4 mr-1" />
                            <span className="text-sm">{nextPatient.phone}</span>
                          </div>
                          {nextPatient.email && (
                            <div className="flex items-center text-gray-600">
                              <span className="text-sm">{nextPatient.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800 shadow-sm">
                          💳 Paid
                        </span>
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium shadow-sm ${
                          nextPatient.status === 'in-progress' 
                            ? 'bg-amber-100 text-amber-800' 
                            : nextPatient.status === 'confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {nextPatient.status === 'in-progress' ? '🔄 In Consultation' : 
                           nextPatient.status === 'confirmed' ? '⏳ Ready to Start' : 
                           `📋 ${nextPatient.status}`}
                        </span>
                      </div>
                      {nextPatient.estimatedWaitTime && (
                        <p className="text-sm text-gray-600">
                          ⏱️ Est. wait: {nextPatient.estimatedWaitTime} min
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Patient Details */}
                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-3 shadow-sm border border-blue-100">
                        <h5 className="font-semibold text-gray-700 text-sm mb-1">Reason for Visit</h5>
                        <p className="text-gray-900">{nextPatient.reason_for_visit || 'General consultation'}</p>
                      </div>
                      {nextPatient.symptoms && (
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-orange-100">
                          <h5 className="font-semibold text-gray-700 text-sm mb-1">Symptoms</h5>
                          <p className="text-gray-900">{nextPatient.symptoms}</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-3 shadow-sm border border-purple-100">
                        <h5 className="font-semibold text-gray-700 text-sm mb-1">Priority Level</h5>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          nextPatient.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          nextPatient.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          nextPatient.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {nextPatient.priority || 'normal'}
                        </span>
                      </div>
                      <div className="bg-white rounded-lg p-3 shadow-sm border border-indigo-100">
                        <h5 className="font-semibold text-gray-700 text-sm mb-1">Appointment Type</h5>
                        <p className="text-gray-900">
                          {nextPatient.is_emergency ? '🚨 Emergency' : '📅 Regular'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-6 py-4 bg-white/50 rounded-b-xl border-t border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-3">
                      {nextPatient.status === 'in-progress' ? (
                        <Button
                          variant="primary"
                          onClick={() => handleCompleteConsultation(nextPatient.id)}
                          className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg"
                        >
                          <CheckIcon className="w-5 h-5" />
                          <span>Complete Consultation</span>
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          onClick={() => handleCallNextPatient(nextPatient.id)}
                          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
                        >
                          <Stethoscope className="w-5 h-5" />
                          <span>Start Consultation</span>
                        </Button>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <span>🕒</span>
                        <span>Queue position: #{nextPatient.queue_number}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="max-w-sm mx-auto">
                  <div className="mb-6">
                    <div className="h-20 w-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-inner">
                      <UserIcon className="h-10 w-10 text-gray-400" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-xl font-semibold text-gray-900">Queue Complete! 🎉</h4>
                    <p className="text-gray-600">
                      Excellent work! All paid patients have been served.
                    </p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                      <p className="text-sm text-green-800">
                        ✅ You can now take a break or check for new appointments
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleGetNextPatient}
                    className="mt-6 flex items-center space-x-2 mx-auto"
                  >
                    <RefreshCwIcon className="w-4 h-4" />
                    <span>Check for New Patients</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Patient Queue */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Today's Patients</h3>
            {queueStatus?.is_active && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-green-600 font-medium">Queue Active</span>
                <span className="text-gray-500">-</span>
                <span className="text-blue-600">Showing paid patients only</span>
              </div>
            )}
          </div>
          
          {queue.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No appointments scheduled for today
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Queue #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {queue.map((patient) => (
                    <tr key={patient.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {patient.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {patient.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-medium">
                            {patient.queue_number}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Regular
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(patient.status)}`}>
                          {patient.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={patient.payment_status || 'unpaid'}
                          onChange={(e) => handlePaymentStatusUpdate(patient.id, e.target.value)}
                          className={`text-xs font-semibold rounded px-2 py-1 border-0 focus:ring-1 focus:ring-blue-500 ${getPaymentStatusColor(patient.payment_status || 'unpaid')}`}
                          title={`Payment status for ${patient.name}`}
                        >
                          <option value="unpaid">Unpaid</option>
                          <option value="paid">Paid</option>
                          <option value="partially_paid">Partially Paid</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {patient.reason_for_visit || 'Not specified'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          {['scheduled', 'confirmed'].includes(patient.status) && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleCallNextPatient(patient.id)}
                              className="flex items-center space-x-1"
                            >
                              <UserCheck className="w-4 h-4" />
                              <span>Consult</span>
                            </Button>
                          )}
                          {patient.status === 'in-progress' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCompleteConsultation(patient.id)}
                              className="flex items-center space-x-1"
                            >
                              <CheckIcon className="w-4 h-4" />
                              <span>Complete</span>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );

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
        <h1 className="text-2xl font-bold text-gray-900">Queue Management</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Total Patients:</span>
          <span className="font-medium">{queue.length}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800 text-sm">{error}</div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('availability')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'availability'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <SettingsIcon className="w-4 h-4" />
              <span>Availability</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'queue'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-4 h-4" />
              <span>Queue</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'availability' && renderAvailabilityTab()}
      {activeTab === 'queue' && renderQueueTab()}

      {/* Working Hours Success Modal */}
      <WorkingHoursSuccessModal
        isOpen={showWorkingHoursSuccessModal}
        onClose={() => setShowWorkingHoursSuccessModal(false)}
      />
    </div>
  );
};

export default ManageQueue;