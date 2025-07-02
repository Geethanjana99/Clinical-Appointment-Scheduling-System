import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import { CalendarIcon, ClockIcon, ActivityIcon, ChevronRightIcon } from 'lucide-react';
import { apiService } from '../../services/api';
import { toast } from 'sonner';

interface Appointment {
  id: string;
  appointment_id: string;
  doctor_name: string;
  specialty: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
}

// Mock data for other sections (will be replaced later)
const recentReports = [{
  id: 1,
  name: 'Blood Test Results',
  date: '2023-09-30',
  status: 'completed'
}, {
  id: 2,
  name: 'Urine Analysis',
  date: '2023-09-30',
  status: 'completed'
}, {
  id: 3,
  name: 'ECG Report',
  date: '2023-09-15',
  status: 'completed'
}];
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

  // Fetch upcoming appointments on component mount
  useEffect(() => {
    fetchUpcomingAppointments();
  }, []);

  const fetchUpcomingAppointments = async () => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
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

  return <div className="space-y-6">
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
        <Card className="md:col-span-2">          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Upcoming Appointments
            </h2>
            <Link to="/patient/my-appointments" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
              View all <ChevronRightIcon className="w-4 h-4 ml-1" />
            </Link>
          </div>          {loading ? (
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
                <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {appointment.doctor_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {appointment.specialty}
                    </p>
                    <div className="flex items-center mt-1 text-sm text-gray-700">
                      <CalendarIcon className="w-4 h-4 mr-1 text-gray-400" />
                      {formatDate(appointment.appointment_date)} at {formatTime(appointment.appointment_time)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      ID: {appointment.appointment_id}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <StatusBadge status={appointment.status as any} />
                    <Link to={`/patient/queue`} className="mt-2 text-sm text-blue-600 hover:text-blue-800">
                      Check queue
                    </Link>
                  </div>
                </div>
              ))}            </div>
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
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
          </div>          <div className="space-y-3">
            <Link to="/patient/book-appointment">
              <Button variant="outline" className="w-full justify-start">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Book New Appointment
              </Button>
            </Link>            <Link to="/patient/my-appointments">
              <Button variant="outline" className="w-full justify-start">
                <CalendarIcon className="w-4 h-4 mr-2" />
                View My Appointments
              </Button>
            </Link>
            <Link to="/patient/queue">
              <Button variant="outline" className="w-full justify-start">
                <ClockIcon className="w-4 h-4 mr-2" />
                Check Queue Status
              </Button>
            </Link>
          </div>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Recent Medical Reports
            </h2>
          </div>
          {recentReports.length > 0 ? <div className="space-y-3">
              {recentReports.map(report => <div key={report.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{report.name}</h3>
                    <p className="text-sm text-gray-500">{report.date}</p>
                  </div>
                  <Button variant="secondary" size="sm">
                    View
                  </Button>
                </div>)}            </div> : <div className="text-center py-6">
              <p className="text-gray-500">No reports uploaded yet</p>
            </div>}
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              AI Health Predictions
            </h2>
          </div>
          {predictionResults.length > 0 ? <div className="space-y-3">
              {predictionResults.map(prediction => <div key={prediction.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
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
                    Details
                  </Button>
                </div>)}
            </div> : <div className="text-center py-6">
              <p className="text-gray-500">No AI predictions available</p>
              <p className="text-sm text-gray-400 mt-1">
                Upload your reports to get health predictions
              </p>
            </div>}
        </Card>
      </div>
    </div>;
};
export default PatientDashboard;