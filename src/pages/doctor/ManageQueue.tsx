import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import { useQueueStore } from '../../store/queueStore';
import { useAuthStore } from '../../store/authStore';
import { 
  UserIcon, 
  ClockIcon, 
  CheckIcon, 
  SettingsIcon, 
  PlayIcon, 
  PauseIcon,
  AlertTriangleIcon,
  PhoneIcon
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
    fetchTodayAppointments,
    fetchQueueStatus,
    fetchDoctorAvailability,
    updateAvailabilityStatus,
    updateWorkingHours,
    toggleQueue,
    callNextPatient,
    completeConsultation,
    getWaitingPatients,
    getInProgressPatients,
    getCompletedPatients,
    getEmergencyPatients
  } = useQueueStore();

  const [activeTab, setActiveTab] = useState<'availability' | 'queue'>('availability');
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
      fetchTodayAppointments();
      fetchQueueStatus();
      fetchDoctorAvailability();
    }
  }, [user]);

  useEffect(() => {
    if (doctorAvailability?.working_hours) {
      setWorkingHours(doctorAvailability.working_hours);
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
    await toggleQueue(newStatus);
  };

  const handleCallNextPatient = async (appointmentId: string) => {
    await callNextPatient(appointmentId);
  };

  const handleCompleteConsultation = async (appointmentId: string) => {
    await completeConsultation(appointmentId);
  };

  const waitingPatients = getWaitingPatients();
  const inProgressPatients = getInProgressPatients();
  const completedPatients = getCompletedPatients();
  const emergencyPatients = getEmergencyPatients();

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
              <div className="bg-red-50 p-3 rounded">
                <div className="text-2xl font-bold text-red-600">{emergencyPatients.length}</div>
                <div className="text-sm text-gray-600">Emergency</div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Patient Queue */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Today's Patients</h3>
          
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
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {queue.map((patient) => (
                    <tr key={patient.id} className={patient.is_emergency ? 'bg-red-50' : ''}>
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
                          {patient.is_emergency && (
                            <AlertTriangleIcon className="h-4 w-4 text-red-500 mr-2" />
                          )}
                          <span className="text-sm font-medium">
                            {patient.is_emergency ? `E${patient.queue_number}` : patient.queue_number}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          patient.is_emergency ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {patient.is_emergency ? 'Emergency' : 'Regular'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(patient.status)}`}>
                          {patient.status}
                        </span>
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
                              <PhoneIcon className="w-4 h-4" />
                              <span>Call</span>
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
    </div>
  );
};

export default ManageQueue;