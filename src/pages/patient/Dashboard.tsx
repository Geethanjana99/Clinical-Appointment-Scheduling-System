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
            <div className="group p-4 rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-100 hover:border-blue-400 hover:shadow-lg hover:scale-105 transition-all duration-300 hover:bg-gradient-to-br hover:from-blue-100 hover:to-indigo-200">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:from-blue-600 group-hover:to-indigo-700 transition-all duration-300 shadow-md">
                  <PlusIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 group-hover:text-blue-800">Book Appointment</h3>
                  <p className="text-sm text-blue-700 group-hover:text-blue-600 mt-1">Schedule consultation</p>
                </div>
              </div>
            </div>
          </Link>

          {/* View My Appointments */}
          <Link to="/patient/my-appointments" className="block">
            <div className="group p-4 rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-100 hover:border-emerald-400 hover:shadow-lg hover:scale-105 transition-all duration-300 hover:bg-gradient-to-br hover:from-emerald-100 hover:to-green-200">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center group-hover:from-emerald-600 group-hover:to-green-700 transition-all duration-300 shadow-md">
                  <CalendarIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-900 group-hover:text-emerald-800">My Appointments</h3>
                  <p className="text-sm text-emerald-700 group-hover:text-emerald-600 mt-1">View history</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Check Queue Status */}
          <Link to="/patient/queue" className="block">
            <div className="group p-4 rounded-xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-100 hover:border-orange-400 hover:shadow-lg hover:scale-105 transition-all duration-300 hover:bg-gradient-to-br hover:from-orange-100 hover:to-amber-200">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center group-hover:from-orange-600 group-hover:to-amber-700 transition-all duration-300 shadow-md">
                  <ClockIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-orange-900 group-hover:text-orange-800">Queue Status</h3>
                  <p className="text-sm text-orange-700 group-hover:text-orange-600 mt-1">Check wait time</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Medical Reports */}
          <Link to="/patient/medical-reports" className="block">
            <div className="group p-4 rounded-xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-purple-100 hover:border-violet-400 hover:shadow-lg hover:scale-105 transition-all duration-300 hover:bg-gradient-to-br hover:from-violet-100 hover:to-purple-200">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:from-violet-600 group-hover:to-purple-700 transition-all duration-300 shadow-md">
                  <FileTextIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-violet-900 group-hover:text-violet-800">Medical Reports</h3>
                  <p className="text-sm text-violet-700 group-hover:text-violet-600 mt-1">View documents</p>
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