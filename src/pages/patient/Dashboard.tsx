import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import AppointmentCard from '../../components/ui/AppointmentCard';
import AppointmentDetailModal from '../../components/ui/AppointmentDetailModal';
import { CalendarIcon, ClockIcon, ActivityIcon, ChevronRightIcon, PlusIcon, FileTextIcon, ListIcon } from 'lucide-react';
import { apiService } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'sonner';

interface Appointment {
  id: string;
  appointment_id: string;
  doctor_name: string;
  specialty: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  queue_number?: number | string;
  queue_position?: number;
}

// Mock data for AI predictions section
const predictionResults = [{
  id: 1,
  name: 'Diabetes Risk Assessment',
  date: '2023-09-30',
  result: 'Low Risk',
  status: 'completed'
}];
const PatientDashboard = () => {
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();

  // Fetch upcoming appointments on component mount
  useEffect(() => {
    const hasValidToken = apiService.getToken();
    
    if (isAuthenticated && hasValidToken) {
      console.log('✅ Patient Dashboard: Fetching appointments - authenticated with valid token');
      fetchUpcomingAppointments();
    } else {
      console.log('⚠️ Patient Dashboard: Skipping data fetch', { 
        isAuthenticated, 
        hasValidToken: !!hasValidToken 
      });
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchUpcomingAppointments = async () => {
    const hasValidToken = apiService.getToken();
    
    if (!isAuthenticated || !hasValidToken) {
      console.log('⚠️ Patient Dashboard: Cannot fetch appointments - authentication failed', {
        isAuthenticated,
        hasValidToken: !!hasValidToken
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getMyAppointments({
        status: ['scheduled', 'confirmed'],
        limit: 5
      });

      if (response.success && response.data) {
        setUpcomingAppointments(response.data.appointments || []);
      } else {
        setError('Failed to load appointments');
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments');
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedAppointment(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Patient Dashboard</h1>
        <Link to="/patient/book-appointment">
          <Button variant="primary">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Book Appointment
          </Button>
        </Link>
      </div>

      {/* Section 1: Quick Actions - Full Width at Top */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            <p className="text-sm text-gray-600 mt-1">Manage your healthcare journey</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Book New Appointment */}
          <Link to="/patient/book-appointment" className="block">
            <div className="group p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-300 transition-colors">
                  <PlusIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 group-hover:text-blue-900">Book Appointment</h3>
                  <p className="text-sm text-gray-500 group-hover:text-blue-700 mt-1">Schedule consultation</p>
                </div>
              </div>
            </div>
          </Link>

          {/* View My Appointments */}
          <Link to="/patient/my-appointments" className="block">
            <div className="group p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center group-hover:from-green-200 group-hover:to-green-300 transition-colors">
                  <CalendarIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 group-hover:text-green-900">My Appointments</h3>
                  <p className="text-sm text-gray-500 group-hover:text-green-700 mt-1">View history</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Check Queue Status */}
          <Link to="/patient/queue" className="block">
            <div className="group p-4 rounded-lg border border-gray-200 hover:border-yellow-300 hover:shadow-md transition-all duration-200 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-amber-50">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg flex items-center justify-center group-hover:from-yellow-200 group-hover:to-yellow-300 transition-colors">
                  <ClockIcon className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 group-hover:text-yellow-900">Queue Status</h3>
                  <p className="text-sm text-gray-500 group-hover:text-yellow-700 mt-1">Check wait time</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Medical Reports */}
          <Link to="/patient/medical-reports" className="block">
            <div className="group p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center group-hover:from-purple-200 group-hover:to-purple-300 transition-colors">
                  <FileTextIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 group-hover:text-purple-900">Medical Reports</h3>
                  <p className="text-sm text-gray-500 group-hover:text-purple-700 mt-1">View documents</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </Card>

      {/* Section 2 & 3: Appointments and AI Predictions - 50% each */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Upcoming Appointments - 50% width */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Upcoming Appointments
            </h2>
            <Link to="/patient/my-appointments" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
              View all <ChevronRightIcon className="w-4 h-4 ml-1" />
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading appointments...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
              <Button onClick={fetchUpcomingAppointments} variant="outline" className="mt-4">
                Try Again
              </Button>
            </div>
          ) : upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.slice(0, 3).map(appointment => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  variant="dashboard"
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No upcoming appointments</p>
              <Link to="/patient/book-appointment">
                <Button variant="outline" className="mt-4">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Book an Appointment
                </Button>
              </Link>
            </div>
          )}
        </Card>

        {/* AI Health Predictions - 50% width */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              AI Health Predictions
            </h2>
            <Link to="/patient/health-predictions" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
              View all <ChevronRightIcon className="w-4 h-4 ml-1" />
            </Link>
          </div>
          {predictionResults.length > 0 ? (
            <div className="space-y-3">
              {predictionResults.slice(0, 3).map(prediction => (
                <div key={prediction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {prediction.name}
                    </h3>
                    <div className="flex items-center mt-1">
                      <ActivityIcon className="w-4 h-4 mr-1 text-gray-400" />
                      <span className="text-sm text-gray-700">
                        {prediction.result}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{prediction.date}</p>
                  </div>
                  <Button variant="secondary" size="sm">
                    View
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ActivityIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No AI predictions</h3>
              <p className="text-sm text-gray-500 mb-4">
                Upload medical reports for insights
              </p>
              <Link to="/patient/upload-reports">
                <Button variant="outline" size="sm">
                  Upload Reports
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* Appointment Detail Modal */}
      <AppointmentDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        appointment={selectedAppointment}
      />
    </div>
  );
};
export default PatientDashboard;