import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { CalendarIcon, ClockIcon, UserIcon, MapPinIcon, PhoneIcon, FilterIcon, SearchIcon, Loader2 } from 'lucide-react';
import { apiService } from '../../services/api';

interface Appointment {
  id: number;
  doctor_id: number;
  appointment_date: string;
  appointment_time: string;
  status: string;
  appointment_type: string;
  notes?: string;
  doctor_name: string;
  specialty: string;
  doctor_phone?: string;
  location?: string;
}

const MyAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Fetch appointments from API
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getMyAppointments();
        
        if (response.success && response.data) {
          setAppointments(response.data.appointments || response.data || []);
        } else {
          setError(response.message || 'Failed to fetch appointments');
        }
      } catch (err) {
        setError('An error occurred while fetching appointments');
        console.error('Error fetching appointments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Handle appointment cancellation
  const handleCancelAppointment = async (appointmentId: number) => {
    try {
      const response = await apiService.cancelAppointment(appointmentId.toString(), 'Cancelled by patient');
      if (response.success) {
        // Update local state
        setAppointments(prev => 
          prev.map(apt => 
            apt.id === appointmentId 
              ? { ...apt, status: 'cancelled' }
              : apt
          )
        );
      } else {
        alert(`Failed to cancel appointment: ${response.message}`);
      }
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      alert('An error occurred while cancelling the appointment');
    }
  };
  // Handle appointment rescheduling (placeholder - would need a modal for date/time selection)
  const handleRescheduleAppointment = async (_appointmentId: number) => {
    // For now, just show an alert - in a real app, this would open a modal
    alert('Reschedule functionality coming soon! Please contact the clinic directly.');
  };
    // Filter appointments based on search term and status
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.appointment_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isUpcoming = (date: string) => {
    return new Date(date) > new Date();
  };

  const canCancel = (status: string, date: string) => {
    return (status === 'confirmed' || status === 'pending' || status === 'scheduled') && isUpcoming(date);
  };

  const canReschedule = (status: string, date: string) => {
    return (status === 'confirmed' || status === 'pending' || status === 'scheduled') && isUpcoming(date);
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
            <p className="text-gray-600">View and manage all your appointments</p>
          </div>
        </div>
        <Card>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Loading appointments...</span>
          </div>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
            <p className="text-gray-600">View and manage all your appointments</p>
          </div>
        </div>
        <Card>
          <div className="text-center py-8">
            <div className="text-red-500 mb-4">
              <CalendarIcon className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Error Loading Appointments</h3>
            <p className="mt-2 text-gray-500">{error}</p>
            <Button 
              variant="primary" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-600">View and manage all your appointments</p>
        </div>
        <Button variant="primary" onClick={() => window.location.href = '/patient/book-appointment'}>
          <CalendarIcon className="w-4 h-4 mr-2" />
          Book New Appointment
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by doctor, specialty, or appointment type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <FilterIcon className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Filter appointments by status"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No appointments found</h3>
              <p className="mt-2 text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'You don\'t have any appointments yet.'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button 
                  variant="primary" 
                  className="mt-4"
                  onClick={() => window.location.href = '/patient/book-appointment'}
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Book Your First Appointment
                </Button>
              )}
            </div>
          </Card>
        ) : (
          filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <UserIcon className="w-5 h-5 mr-2 text-gray-400" />
                        {appointment.doctor_name || 'Doctor Name Not Available'}
                      </h3>
                      <p className="text-sm text-gray-600">{appointment.specialty || 'Specialization Not Available'}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{new Date(appointment.appointment_date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{appointment.appointment_time}</span>
                    </div>
                    {appointment.location && (
                      <div className="flex items-center">
                        <MapPinIcon className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{appointment.location}</span>
                      </div>
                    )}
                    {appointment.doctor_phone && (
                      <div className="flex items-center">
                        <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{appointment.doctor_phone}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-sm"><strong>Type:</strong> {appointment.appointment_type || 'Not specified'}</p>
                    {appointment.notes && (
                      <p className="text-sm text-gray-600 mt-1"><strong>Notes:</strong> {appointment.notes}</p>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 lg:flex-col lg:w-40">
                  {appointment.status === 'pending' && (
                    <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700">
                      Confirm
                    </Button>
                  )}
                  {canReschedule(appointment.status, appointment.appointment_date) && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRescheduleAppointment(appointment.id)}
                    >
                      Reschedule
                    </Button>
                  )}
                  {canCancel(appointment.status, appointment.appointment_date) && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleCancelAppointment(appointment.id)}
                    >
                      Cancel
                    </Button>
                  )}
                  {appointment.status === 'completed' && (
                    <Button variant="outline" size="sm">
                      View Report
                    </Button>
                  )}
                  {isUpcoming(appointment.appointment_date) && (appointment.status === 'confirmed' || appointment.status === 'scheduled') && (
                    <Button variant="primary" size="sm">
                      View Details
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {filteredAppointments.length > 0 && (
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Appointment Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {filteredAppointments.filter(apt => apt.status === 'scheduled' || apt.status === 'confirmed').length}
              </div>
              <div className="text-sm text-gray-600">Upcoming</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {filteredAppointments.filter(apt => apt.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {filteredAppointments.filter(apt => apt.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {filteredAppointments.filter(apt => apt.status === 'cancelled').length}
              </div>
              <div className="text-sm text-gray-600">Cancelled</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">
                {filteredAppointments.length}
              </div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MyAppointments;
