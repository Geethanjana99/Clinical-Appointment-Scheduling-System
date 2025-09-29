import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import AppointmentCard from '../../components/ui/AppointmentCard';
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
    // Navigate to appointment details or show details inline
    console.log('View details for appointment:', appointment);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Patient Dashboard</h1>
        <Link to="/patient/book-appointment">
          <Button variant="primary">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Book Appointment
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
              <p className="text-sm text-gray-600 mt-1">Manage your healthcare journey</p>
            </div>
          </div>
          <div className="space-y-4">
            {/* Book New Appointment */}
            <Link to="/patient/book-appointment" className="block">
              <div className="group p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-300 transition-colors">
                    <PlusIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-900">Book New Appointment</h3>
                    <p className="text-sm text-gray-500 group-hover:text-blue-700">Schedule a consultation with your preferred doctor</p>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            </Link>

            {/* View My Appointments */}
            <Link to="/patient/my-appointments" className="block">
              <div className="group p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center group-hover:from-green-200 group-hover:to-green-300 transition-colors">
                    <CalendarIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 group-hover:text-green-900">View My Appointments</h3>
                    <p className="text-sm text-gray-500 group-hover:text-green-700">Check your appointment history and manage bookings</p>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                </div>
              </div>
            </Link>

            {/* Check Queue Status */}
            <Link to="/patient/queue" className="block">
              <div className="group p-4 rounded-lg border border-gray-200 hover:border-yellow-300 hover:shadow-md transition-all duration-200 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-amber-50">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg flex items-center justify-center group-hover:from-yellow-200 group-hover:to-yellow-300 transition-colors">
                    <ClockIcon className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 group-hover:text-yellow-900">Check Queue Status</h3>
                    <p className="text-sm text-gray-500 group-hover:text-yellow-700">View your position and estimated wait time</p>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-yellow-600 transition-colors" />
                </div>
              </div>
            </Link>

            {/* Medical Reports */}
            <Link to="/patient/medical-reports" className="block">
              <div className="group p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center group-hover:from-purple-200 group-hover:to-purple-300 transition-colors">
                    <FileTextIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 group-hover:text-purple-900">Medical Reports</h3>
                    <p className="text-sm text-gray-500 group-hover:text-purple-700">Access your test results and medical documents</p>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                </div>
              </div>
            </Link>

            {/* Health Predictions */}
            <Link to="/patient/health-predictions" className="block">
              <div className="group p-4 rounded-lg border border-gray-200 hover:border-rose-300 hover:shadow-md transition-all duration-200 hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-rose-100 to-rose-200 rounded-lg flex items-center justify-center group-hover:from-rose-200 group-hover:to-rose-300 transition-colors">
                    <ActivityIcon className="w-6 h-6 text-rose-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 group-hover:text-rose-900">Health Predictions</h3>
                    <p className="text-sm text-gray-500 group-hover:text-rose-700">AI-powered health insights and recommendations</p>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-rose-600 transition-colors" />
                </div>
              </div>
            </Link>
          </div>
        </Card>
        
        <Card className="md:col-span-2">
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
              {upcomingAppointments.map(appointment => (
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
      </div>

      {/* Enhanced AI Health Predictions Section */}
      <Card className="mt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <ActivityIcon className="w-6 h-6 text-blue-600 mr-2" />
              AI Health Insights & Predictions
            </h2>
            <p className="text-sm text-gray-600 mt-1">Personalized health analysis powered by artificial intelligence</p>
          </div>
          <Link to="/patient/health-predictions">
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <span>View Full Report</span>
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Diabetes Risk Assessment */}
          <div className="bg-gradient-to-br from-red-50 to-rose-100 p-6 rounded-lg border border-red-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold text-lg">🩺</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Diabetes Risk</h3>
                  <p className="text-sm text-gray-600">Based on your health data</p>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Risk Level</span>
                <span className="text-sm font-bold text-orange-600">Moderate</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full" style={{width: '65%'}}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">65% probability</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                <span className="text-gray-700">BMI: Above normal range</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                <span className="text-gray-700">Blood sugar: Monitor closely</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                <span className="text-gray-700">Exercise: On track</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-white rounded-md">
              <p className="text-xs text-gray-600">
                <strong>AI Recommendation:</strong> Consider dietary adjustments and regular glucose monitoring. Schedule consultation with endocrinologist.
              </p>
            </div>
          </div>

          {/* Cardiovascular Health */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">❤️</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Heart Health</h3>
                  <p className="text-sm text-gray-600">Cardiovascular analysis</p>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Health Score</span>
                <span className="text-sm font-bold text-green-600">Good</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full" style={{width: '78%'}}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">78/100 score</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                <span className="text-gray-700">Blood pressure: Normal</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                <span className="text-gray-700">Cholesterol: Within range</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                <span className="text-gray-700">Activity: Could improve</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-white rounded-md">
              <p className="text-xs text-gray-600">
                <strong>AI Recommendation:</strong> Maintain current lifestyle. Consider increasing cardio exercise to 30 mins daily for optimal heart health.
              </p>
            </div>
          </div>

          {/* Mental Health & Stress */}
          <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-6 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-lg">🧠</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Mental Wellness</h3>
                  <p className="text-sm text-gray-600">Stress & mood analysis</p>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Stress Level</span>
                <span className="text-sm font-bold text-blue-600">Low</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-400 to-cyan-500 h-2 rounded-full" style={{width: '25%'}}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">25% stress indicators</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                <span className="text-gray-700">Sleep quality: Good</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                <span className="text-gray-700">Mood stability: Positive</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                <span className="text-gray-700">Work-life balance: Stable</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-white rounded-md">
              <p className="text-xs text-gray-600">
                <strong>AI Recommendation:</strong> Great mental health indicators! Continue current stress management practices and maintain regular sleep schedule.
              </p>
            </div>
          </div>
        </div>

        {/* Overall Health Summary */}
        <div className="mt-6 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🤖</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">AI Health Assistant Summary</h3>
              <p className="text-gray-700 mb-4">
                Based on your recent health data, appointments, and lifestyle patterns, our AI has identified key areas for your attention. 
                Your overall health trajectory is positive with some areas for improvement.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white p-3 rounded-md">
                  <div className="text-sm font-medium text-gray-900">Next Recommended Action</div>
                  <div className="text-sm text-blue-600 font-medium">Schedule diabetes screening</div>
                </div>
                <div className="bg-white p-3 rounded-md">
                  <div className="text-sm font-medium text-gray-900">Improvement Focus</div>
                  <div className="text-sm text-green-600 font-medium">Increase physical activity</div>
                </div>
                <div className="bg-white p-3 rounded-md">
                  <div className="text-sm font-medium text-gray-900">Strength Area</div>
                  <div className="text-sm text-purple-600 font-medium">Excellent mental wellness</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last updated: {new Date().toLocaleDateString()}</span>
                <Link to="/patient/health-predictions">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Get Detailed Analysis
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
              <p className="text-sm text-gray-600 mt-1">Manage your healthcare journey</p>
            </div>
          </div>
          <div className="space-y-4">
            {/* Book New Appointment */}
            <Link to="/patient/book-appointment" className="block">
              <div className="group p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-300 transition-colors">
                    <PlusIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-900">Book New Appointment</h3>
                    <p className="text-sm text-gray-500 group-hover:text-blue-700">Schedule a consultation with your preferred doctor</p>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            </Link>

            {/* View My Appointments */}
            <Link to="/patient/my-appointments" className="block">
              <div className="group p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center group-hover:from-green-200 group-hover:to-green-300 transition-colors">
                    <CalendarIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 group-hover:text-green-900">View My Appointments</h3>
                    <p className="text-sm text-gray-500 group-hover:text-green-700">Check your appointment history and manage bookings</p>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                </div>
              </div>
            </Link>

            {/* Check Queue Status */}
            <Link to="/patient/queue" className="block">
              <div className="group p-4 rounded-lg border border-gray-200 hover:border-yellow-300 hover:shadow-md transition-all duration-200 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-amber-50">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg flex items-center justify-center group-hover:from-yellow-200 group-hover:to-yellow-300 transition-colors">
                    <ClockIcon className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 group-hover:text-yellow-900">Check Queue Status</h3>
                    <p className="text-sm text-gray-500 group-hover:text-yellow-700">View your position and estimated wait time</p>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-yellow-600 transition-colors" />
                </div>
              </div>
            </Link>

            {/* Medical Reports */}
            <Link to="/patient/medical-reports" className="block">
              <div className="group p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center group-hover:from-purple-200 group-hover:to-purple-300 transition-colors">
                    <FileTextIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 group-hover:text-purple-900">Medical Reports</h3>
                    <p className="text-sm text-gray-500 group-hover:text-purple-700">Access your test results and medical documents</p>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                </div>
              </div>
            </Link>

            {/* Health Predictions */}
            <Link to="/patient/health-predictions" className="block">
              <div className="group p-4 rounded-lg border border-gray-200 hover:border-rose-300 hover:shadow-md transition-all duration-200 hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-rose-100 to-rose-200 rounded-lg flex items-center justify-center group-hover:from-rose-200 group-hover:to-rose-300 transition-colors">
                    <ActivityIcon className="w-6 h-6 text-rose-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 group-hover:text-rose-900">Health Predictions</h3>
                    <p className="text-sm text-gray-500 group-hover:text-rose-700">AI-powered health insights and recommendations</p>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-rose-600 transition-colors" />
                </div>
              </div>
            </Link>
          </div>
        </Card>
      </div>
      
      {/* AI Health Predictions Section */}
      <div className="mt-6">
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
              {predictionResults.map(prediction => (
                <div key={prediction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                  <div>
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
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ActivityIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No AI predictions available</h3>
              <p className="text-sm text-gray-500 mb-4">
                Upload your medical reports to get personalized health predictions
              </p>
              <Link to="/patient/upload-reports">
                <Button variant="outline">
                  Upload Reports
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PatientDashboard;