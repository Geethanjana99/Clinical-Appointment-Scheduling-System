import { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { CalendarIcon, ClockIcon, UserIcon, MapPinIcon, PhoneIcon, FilterIcon, SearchIcon } from 'lucide-react';

// Mock data for patient appointments
const mockAppointments = [
  {
    id: 1,
    doctor: 'Dr. Sarah Johnson',
    specialty: 'Cardiologist',
    date: '2025-06-15',
    time: '10:30 AM',
    status: 'confirmed',
    type: 'Consultation',
    location: 'Room 203, Cardiology Wing',
    phone: '(555) 123-4567',
    notes: 'Follow-up for hypertension monitoring'
  },
  {
    id: 2,
    doctor: 'Dr. Michael Wong',
    specialty: 'Neurologist',
    date: '2025-06-22',
    time: '2:00 PM',
    status: 'pending',
    type: 'Consultation',
    location: 'Room 105, Neurology Department',
    phone: '(555) 987-6543',
    notes: 'Initial consultation for headaches'
  },
  {
    id: 3,
    doctor: 'Dr. Emily Chen',
    specialty: 'General Practitioner',
    date: '2025-05-28',
    time: '9:00 AM',
    status: 'completed',
    type: 'Check-up',
    location: 'Room 101, General Medicine',
    phone: '(555) 456-7890',
    notes: 'Annual health check-up'
  },
  {
    id: 4,
    doctor: 'Dr. Robert Davis',
    specialty: 'Orthopedist',
    date: '2025-05-20',
    time: '11:15 AM',
    status: 'cancelled',
    type: 'Consultation',
    location: 'Room 301, Orthopedics',
    phone: '(555) 321-0987',
    notes: 'Knee pain evaluation'
  },
  {
    id: 5,
    doctor: 'Dr. Sarah Johnson',
    specialty: 'Cardiologist',
    date: '2025-07-10',
    time: '3:30 PM',
    status: 'scheduled',
    type: 'Follow-up',
    location: 'Room 203, Cardiology Wing',
    phone: '(555) 123-4567',
    notes: 'Post-treatment follow-up'
  }
];

const MyAppointments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Filter appointments based on search term and status
  const filteredAppointments = mockAppointments.filter(appointment => {
    const matchesSearch = appointment.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.type.toLowerCase().includes(searchTerm.toLowerCase());
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

  return (
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
          </div>          <div className="flex items-center gap-2">
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
                        {appointment.doctor}
                      </h3>
                      <p className="text-sm text-gray-600">{appointment.specialty}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{new Date(appointment.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{appointment.time}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPinIcon className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{appointment.location}</span>
                    </div>
                    <div className="flex items-center">
                      <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{appointment.phone}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-sm"><strong>Type:</strong> {appointment.type}</p>
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
                  {canReschedule(appointment.status, appointment.date) && (
                    <Button variant="outline" size="sm">
                      Reschedule
                    </Button>
                  )}
                  {canCancel(appointment.status, appointment.date) && (
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      Cancel
                    </Button>
                  )}
                  {appointment.status === 'completed' && (
                    <Button variant="outline" size="sm">
                      View Report
                    </Button>
                  )}
                  {isUpcoming(appointment.date) && (appointment.status === 'confirmed' || appointment.status === 'scheduled') && (
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
