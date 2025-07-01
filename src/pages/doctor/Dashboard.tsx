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
  CheckIcon,
  ActivityIcon,
  TrendingUpIcon,
  DollarSignIcon,
  MapPinIcon,
  PhoneIcon,
  StarIcon
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
    availability_status?: 'available' | 'busy' | 'offline';
  };
  todayAppointments: {
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
    appointments: Appointment[];
  };
  upcomingAppointments: Appointment[];
  stats: {
    totalPatients: number;
    totalAppointments: number;
    monthlyEarnings: number;
    averageRating: number;
  };
  recentActivity: any[];
}

interface Appointment {
  id: string;
  appointmentId: string;
  patientName: string;
  patientAge?: number;
  patientPhone?: string;
  appointmentTime: string;
  appointmentDate: string;
  reason: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show' | 'pending';
  type: string;
  duration: number;
  consultationFee?: number;
  queueNumber?: string;
  isEmergency?: boolean;
}
const DoctorDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const result = await apiService.getDoctorDashboard();
      
      if (result.success) {
        setDashboardData(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      
      // Fallback to mock queue data for demonstration
      const mockQueueData = (): DashboardData => ({
        doctor: {
          id: '1',
          name: 'Dr. Queue Demo',
          specialty: 'General Medicine',
          rating: 4.8,
          totalReviews: 127,
          consultationFee: 3500.00,
          officeAddress: 'Medical Center, Queue Wing',
          availability_status: 'available',
          workingHours: {
            monday: { start: '09:00', end: '17:00' },
            tuesday: { start: '09:00', end: '17:00' },
            wednesday: { start: '09:00', end: '17:00' },
            thursday: { start: '09:00', end: '17:00' },
            friday: { start: '09:00', end: '15:00' }
          }
        },
        todayAppointments: {
          total: 5,
          completed: 1,
          pending: 3,
          inProgress: 1,
          appointments: [
            {
              id: '1',
              appointmentId: 'APT-Q001',
              patientName: 'John Regular',
              patientAge: 35,
              patientPhone: '0723456789',
              appointmentTime: '09:30',
              appointmentDate: new Date().toISOString().split('T')[0],
              reason: 'Regular health checkup',
              status: 'completed' as const,
              type: 'consultation',
              duration: 30,
              consultationFee: 3500.00,
              queueNumber: '1',
              isEmergency: false
            },
            {
              id: '2',
              appointmentId: 'APT-Q002',
              patientName: 'Mary Emergency',
              patientAge: 28,
              patientPhone: '0723456790',
              appointmentTime: '10:00',
              appointmentDate: new Date().toISOString().split('T')[0],
              reason: 'Severe chest pain',
              status: 'in-progress' as const,
              type: 'consultation',
              duration: 45,
              consultationFee: 3500.00,
              queueNumber: 'E1',
              isEmergency: true
            },
            {
              id: '3',
              appointmentId: 'APT-Q003',
              patientName: 'Peter Queue',
              patientAge: 42,
              patientPhone: '0723456791',
              appointmentTime: '10:30',
              appointmentDate: new Date().toISOString().split('T')[0],
              reason: 'Follow-up consultation',
              status: 'pending' as const,
              type: 'consultation',
              duration: 30,
              consultationFee: 3500.00,
              queueNumber: '2',
              isEmergency: false
            },
            {
              id: '4',
              appointmentId: 'APT-Q004',
              patientName: 'Sarah Patient',
              patientAge: 31,
              patientPhone: '0723456792',
              appointmentTime: '11:00',
              appointmentDate: new Date().toISOString().split('T')[0],
              reason: 'Vaccination',
              status: 'pending' as const,
              type: 'consultation',
              duration: 15,
              consultationFee: 3500.00,
              queueNumber: '3',
              isEmergency: false
            },
            {
              id: '5',
              appointmentId: 'APT-Q005',
              patientName: 'Tom Emergency',
              patientAge: 45,
              patientPhone: '0723456793',
              appointmentTime: '11:15',
              appointmentDate: new Date().toISOString().split('T')[0],
              reason: 'High fever emergency',
              status: 'pending' as const,
              type: 'consultation',
              duration: 30,
              consultationFee: 3500.00,
              queueNumber: 'E2',
              isEmergency: true
            }
          ]
        },
        upcomingAppointments: [],
        stats: {
          totalPatients: 250,
          totalAppointments: 50,
          monthlyEarnings: 175000.00,
          averageRating: 4.8
        },
        recentActivity: []
      });
      
      setDashboardData(mockQueueData());
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    if (!time || typeof time !== 'string') {
      return 'Invalid Time';
    }
    
    const [hours, minutes] = time.split(':');
    if (!hours || !minutes) {
      return 'Invalid Time';
    }
    
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error loading dashboard: {error}</p>
        <button 
          onClick={fetchDashboardData}
          className="mt-2 text-red-600 underline hover:text-red-800"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return <div>No data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center">
              <UserIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{dashboardData.doctor?.name || 'Doctor'}</h1>
              <p className="text-blue-100">{dashboardData.doctor?.specialty || 'General Medicine'}</p>
              <div className="flex items-center mt-1">
                <StarIcon className="h-4 w-4 text-yellow-300 fill-current" />
                <span className="ml-1 text-sm">{dashboardData.doctor?.rating || 0} ({dashboardData.doctor?.totalReviews || 0} reviews)</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center text-white/90 mb-1">
              <MapPinIcon className="h-4 w-4 mr-1" />
              <span className="text-sm">{dashboardData.doctor?.officeAddress || 'Office Address'}</span>
            </div>
            <div className="flex items-center text-white/90">
              <DollarSignIcon className="h-4 w-4 mr-1" />
              <span className="text-sm">Consultation: ${dashboardData.doctor?.consultationFee || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.todayAppointments?.total || 0}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.todayAppointments?.completed || 0}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.todayAppointments?.pending || 0}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUpIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${dashboardData.stats?.monthlyEarnings?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </Card>
      </div>      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Today's Queue</h2>
                  <p className="text-sm text-gray-500">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })} - Queue-based appointments
                  </p>
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
                    .filter(appointment => appointment && appointment.id) // Filter out invalid appointments
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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link to="/doctor/patients">
                  <Button variant="outline" className="w-full justify-start">
                    <UserIcon className="w-4 h-4 mr-2" />
                    View Patients
                  </Button>
                </Link>
                <Link to="/doctor/reports">
                  <Button variant="outline" className="w-full justify-start">
                    <ActivityIcon className="w-4 h-4 mr-2" />
                    Medical Reports
                  </Button>
                </Link>
                <Link to="/doctor/earnings">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUpIcon className="w-4 h-4 mr-2" />
                    View Earnings
                  </Button>
                </Link>
              </div>
            </div>
          </Card>



          {/* Today's Overview */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {dashboardData.todayAppointments?.inProgress || 0}
                      </span>
                    </div>
                    <span className="ml-3 text-sm font-medium">In Progress</span>
                  </div>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-yellow-600 font-semibold text-sm">
                        {dashboardData.todayAppointments?.pending || 0}
                      </span>
                    </div>
                    <span className="ml-3 text-sm font-medium">Waiting</span>
                  </div>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-semibold text-sm">
                        {dashboardData.todayAppointments?.completed || 0}
                      </span>
                    </div>
                    <span className="ml-3 text-sm font-medium">Completed</span>
                  </div>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Today's Revenue</span>
                    <span className="font-semibold text-gray-900">
                      ${((dashboardData.todayAppointments?.completed || 0) * (dashboardData.doctor?.consultationFee || 0)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Monthly Statistics */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Patients</span>
                  <span className="text-sm font-semibold">{dashboardData.stats?.totalPatients || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Appointments</span>
                  <span className="text-sm font-semibold">{dashboardData.stats?.totalAppointments || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Average Rating</span>
                  <div className="flex items-center">
                    <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-semibold ml-1">{dashboardData.stats?.averageRating || 0}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Total Earnings</span>
                  <span className="text-sm font-semibold text-green-600">
                    ${dashboardData.stats?.monthlyEarnings?.toLocaleString() || '0'}
                  </span>
                </div>
              </div>            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;