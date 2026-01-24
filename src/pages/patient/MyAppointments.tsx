import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import AppointmentCard from '../../components/ui/AppointmentCard';
import AppointmentDetailModal from '../../components/ui/AppointmentDetailModal';
import { CalendarIcon, FilterIcon, SearchIcon, Loader2 } from 'lucide-react';
import { apiService } from '../../services/api';
import { toast } from 'sonner';

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
  queue_number?: number | string;
  queue_position?: number;
}

const MyAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
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
  }, []);  // Handle appointment cancellation
  const handleCancelAppointment = async (appointmentId: number) => {
    // Show confirmation dialog
    const confirmCancel = window.confirm(
      'Are you sure you want to cancel this appointment? This action cannot be undone.'
    );
    
    if (!confirmCancel) {
      return;
    }

    // Get cancellation reason from user
    const reason = window.prompt(
      'Please provide a reason for cancellation (optional):'
    );

    setCancellingId(appointmentId);

    try {
      const response = await apiService.cancelAppointment(appointmentId.toString(), reason || undefined);
      
      if (response.success) {
        // Remove appointment from local state (since it's cancelled/deleted)
        setAppointments(prev => 
          prev.map(apt => 
            apt.id === appointmentId 
              ? { ...apt, status: 'cancelled' }
              : apt
          )
        );
        
        // Show success notification
        toast.success('Appointment cancelled successfully', {
          description: 'You will receive a confirmation email shortly.'
        });
      } else {
        toast.error('Failed to cancel appointment', {
          description: response.message || 'Please try again or contact support.'
        });
      }
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      toast.error('An error occurred while cancelling the appointment', {
        description: 'Please try again or contact support.'
      });
    } finally {
      setCancellingId(null);
    }
  };  // Handle appointment rescheduling
  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedAppointment(null);
  };
    // Filter appointments based on search term and status
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.appointment_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              variant="full"
              onViewDetails={handleViewDetails}
              onCancel={() => handleCancelAppointment(appointment.id)}
              isLoading={cancellingId === appointment.id}
            />
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
        </Card>      )}
      
      {/* Appointment Detail Modal */}
      <AppointmentDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        appointment={selectedAppointment}
        onCancel={(appointment) => {
          handleCloseDetailModal();
          handleCancelAppointment(appointment.id);
        }}
      />
    </div>
  );
};

export default MyAppointments;
