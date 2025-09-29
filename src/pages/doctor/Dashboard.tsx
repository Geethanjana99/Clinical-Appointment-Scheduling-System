import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import apiService from '../../services/api';
import { 
  CalendarIcon, 
  ClockIcon, 
  UserIcon, 
  ChevronRightIcon,
  ActivityIcon,
  TrendingUpIcon,
  PhoneIcon,
  StarIcon,
  UsersIcon,
  DollarSignIcon,
  SettingsIcon
} from 'lucide-react';

interface DashboardData {
  doctor: {
    id: string;
    name: string;
    specialty: string;
    rating: number;
    totalReviews: number;
    consultationFee: number;
    officeAddress: string;
    workingHours: any;
  };
  todayAppointments: {
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
    appointments: Array<{
      id: string;
      patientName: string;
      patientPhone: string;
      appointmentTime: string;
      reason: string;
      status: string;
      queueNumber?: number;
      isEmergency?: boolean;
    }>;
  };
  stats: {
    totalPatients: number;
    totalAppointments: number;
    averageRating: number;
    monthlyEarnings: number;
  };
}

const DoctorDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDoctorDashboard();
      if (response.data) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    try {
      const date = new Date(`1970-01-01T${timeString}`);
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      return timeString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
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

  const handleAppointmentAction = async (appointmentId: string, action: 'start' | 'complete' | 'cancel') => {
    try {
      const result = await apiService.handleAppointmentAction(appointmentId, action);
      
      if (result.success) {
        fetchDashboardData(); // Refresh data
      } else {
        console.error('Error updating appointment:', result.message);
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return <div>No data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
        <Link to="/doctor/manage-queue">
          <Button variant="primary">
            <ClockIcon className="w-4 h-4 mr-2" />
            Manage Queue
          </Button>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <UsersIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.stats?.totalPatients || 0}</p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CalendarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.stats?.totalAppointments || 0}</p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <StarIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rating</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.stats?.averageRating || 0}</p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <DollarSignIcon className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Earnings</p>
                <p className="text-2xl font-bold text-gray-900">${(dashboardData.stats?.monthlyEarnings || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions - Full Width */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
              <p className="text-sm text-gray-600 mt-1">Manage your practice efficiently</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <Link to="/doctor/patients">
              <div className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer border border-blue-100">
                <div className="flex flex-col items-center text-center">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                    <UserIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">View Patients</p>
                  <p className="text-xs text-gray-500">Manage records</p>
                </div>
              </div>
            </Link>
            
            <Link to="/doctor/appointments">
              <div className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer border border-blue-100">
                <div className="flex flex-col items-center text-center">
                  <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                    <CalendarIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">Appointments</p>
                  <p className="text-xs text-gray-500">View schedule</p>
                </div>
              </div>
            </Link>
            
            <Link to="/doctor/ai-predictions">
              <div className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer border border-blue-100">
                <div className="flex flex-col items-center text-center">
                  <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                    <ActivityIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">AI Predictions</p>
                  <p className="text-xs text-gray-500">Health predictions</p>
                </div>
              </div>
            </Link>
            
            <Link to="/doctor/earnings">
              <div className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer border border-blue-100">
                <div className="flex flex-col items-center text-center">
                  <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center mb-2">
                    <TrendingUpIcon className="h-5 w-5 text-yellow-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">View Earnings</p>
                  <p className="text-xs text-gray-500">Track income</p>
                </div>
              </div>
            </Link>
            
            <Link to="/doctor/manage-queue">
              <div className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer border border-blue-100">
                <div className="flex flex-col items-center text-center">
                  <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-2">
                    <ClockIcon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">Queue</p>
                  <p className="text-xs text-gray-500">Manage queue</p>
                </div>
              </div>
            </Link>
            
            <Link to="/doctor/profile">
              <div className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer border border-blue-100">
                <div className="flex flex-col items-center text-center">
                  <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                    <SettingsIcon className="h-5 w-5 text-gray-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">Profile</p>
                  <p className="text-xs text-gray-500">Settings</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </Card>

      {/* Main Content - Patient Queue */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Today's Patient Queue</h2>
              <p className="text-sm text-gray-600 mt-1">Manage your appointments for today</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {dashboardData.todayAppointments?.total || 0} patients in queue
              </span>
              <Link 
                to="/doctor/appointments" 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                View All <ChevronRightIcon className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
          
          {dashboardData.todayAppointments?.appointments?.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.todayAppointments.appointments
                .filter(appointment => appointment && appointment.id)
                .map((appointment) => (
                <div key={appointment.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {appointment.patientName || 'Unknown Patient'}
                          </p>
                          {appointment.queueNumber && (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              appointment.isEmergency 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {appointment.isEmergency ? '🚨' : '#'} {appointment.queueNumber}
                            </span>
                          )}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {appointment.status ? appointment.status.replace('-', ' ') : 'unknown'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center text-sm text-gray-500">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {appointment.appointmentTime ? formatTime(appointment.appointmentTime) : 'Time not set'}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <PhoneIcon className="h-4 w-4 mr-1" />
                            {appointment.patientPhone || 'Phone not available'}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 truncate">
                          {appointment.reason || 'No reason provided'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link to={`/doctor/patients/${appointment.id}`}>
                        <Button variant="outline" size="sm">
                          View Patient
                        </Button>
                      </Link>
                      {appointment.status === 'confirmed' && (
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={() => handleAppointmentAction(appointment.id, 'start')}
                        >
                          Start
                        </Button>
                      )}
                      {appointment.status === 'in-progress' && (
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => handleAppointmentAction(appointment.id, 'complete')}
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Patients in Queue</h3>
              <p className="text-gray-500 mb-6">
                No patients have joined the queue for today yet.
                <br />
                Patients can book queue-based appointments and will be assigned numbers.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default DoctorDashboard;
