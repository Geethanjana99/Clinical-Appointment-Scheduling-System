import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Calendar, CheckCircle, XCircle, User, MapPin } from 'lucide-react';
import { apiService } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

interface Appointment {
  id: string;
  appointment_id?: string;
  patient_id: string;
  doctor_id: string;
  patient_name?: string;
  patientName?: string;  // API returns camelCase
  patientEmail?: string; // API returns camelCase
  patient_phone?: string;
  appointment_date: string;
  appointment_time: string;
  appointment_type: 'consultation' | 'follow-up';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'pending';
  reason_for_visit: string;
  symptoms?: string;
  priority?: string;
  consultation_fee?: number;
  queue_number?: number;
  duration?: number; // in minutes
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { user } = useAuthStore();

  // Fetch appointments from API
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Appointments: Fetching appointments for date:', selectedDate);
      console.log('🔄 Appointments: User info:', { 
        userId: user?.id, 
        role: user?.role, 
        name: user?.name 
      });
      
      // Calculate date range for the selected date
      const startDate = selectedDate;
      const endDate = selectedDate;
      
      console.log('🔄 Appointments: Making API call with params:', {
        startDate,
        endDate,
        limit: 100
      });
      
      const response = await apiService.getDoctorAppointments({
        startDate,
        endDate,
        limit: 100 // Get all appointments for the day
      });
      
      console.log('✅ Appointments: API response received:', {
        success: response.success,
        dataType: typeof response.data,
        dataLength: response.data?.length,
        appointmentsLength: response.data?.appointments?.length,
        rawData: response.data
      });
      
      if (response.success && response.data) {
        const appointmentsData = response.data.appointments || response.data || [];
        setAppointments(appointmentsData);
      } else {
        console.error('❌ Appointments: API call failed:', response.message);
        setError(response.message || 'Failed to fetch appointments');
      }
    } catch (err) {
      console.error('❌ Appointments: Error fetching appointments:', err);
      setError('An error occurred while fetching appointments');
    } finally {
      setLoading(false);
    }
  };

  // Fetch appointments when component mounts or date changes
  useEffect(() => {
    if (user && user.role === 'doctor') {
      fetchAppointments();
    }
  }, [selectedDate, user]);

  const handleAcceptAppointment = async (appointmentId: string) => {
    try {
      const response = await apiService.updateAppointmentStatus(appointmentId, 'confirmed');
      if (response.success) {
        setAppointments(prev => 
          prev.map(apt => 
            apt.id === appointmentId || apt.appointment_id === appointmentId
              ? { ...apt, status: 'confirmed' as const }
              : apt
          )
        );
      } else {
        setError(response.message || 'Failed to accept appointment');
      }
    } catch (error) {
      setError('Failed to accept appointment');
      console.error('Error accepting appointment:', error);
    }
  };

  const handleCompleteAppointment = async (appointmentId: string) => {
    try {
      const response = await apiService.updateAppointmentStatus(appointmentId, 'completed');
      if (response.success) {
        setAppointments(prev => 
          prev.map(apt => 
            apt.id === appointmentId || apt.appointment_id === appointmentId
              ? { ...apt, status: 'completed' as const }
              : apt
          )
        );
      } else {
        setError(response.message || 'Failed to complete appointment');
      }
    } catch (error) {
      setError('Failed to complete appointment');
      console.error('Error completing appointment:', error);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const response = await apiService.updateAppointmentStatus(appointmentId, 'cancelled');
      if (response.success) {
        setAppointments(prev => 
          prev.map(apt => 
            apt.id === appointmentId || apt.appointment_id === appointmentId
              ? { ...apt, status: 'cancelled' as const }
              : apt
          )
        );
      } else {
        setError(response.message || 'Failed to cancel appointment');
      }
    } catch (error) {
      setError('Failed to cancel appointment');
      console.error('Error cancelling appointment:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'consultation':
        return 'bg-blue-100 text-blue-800';
      case 'follow-up':
        return 'bg-green-100 text-green-800';
      case 'emergency':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setSelectedAppointment(null);
    setShowDetailsModal(false);
  };

  // Since the backend now filters by date correctly, we don't need frontend filtering
  // Just use all appointments returned from the API
  const todayAppointments = appointments;
  
  console.log('📋 Appointments: Frontend filtering result:', {
    totalAppointments: appointments.length,
    selectedDate: selectedDate,
    appointmentsAfterFilter: todayAppointments.length
  });
  
  const pendingCount = todayAppointments.filter(apt => apt.status === 'pending' || apt.status === 'scheduled').length;
  const confirmedCount = todayAppointments.filter(apt => apt.status === 'confirmed').length;
  const completedCount = todayAppointments.filter(apt => apt.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
              title="Select date to view appointments"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-yellow-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {pendingCount}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Confirmed
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {confirmedCount}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Completed
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {completedCount}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-purple-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Today
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {todayAppointments.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Appointments List */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Appointments for {selectedDate}
          </h2>
          
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-2 text-gray-600">Loading appointments...</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <p className="text-red-600">{error}</p>
              <button 
                onClick={fetchAppointments}
                className="mt-2 text-red-700 underline hover:text-red-800"
              >
                Try again
              </button>
            </div>
          )}
          
          {!loading && !error && todayAppointments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No appointments scheduled for this date.</p>
            </div>
          )}
          
          {!loading && !error && todayAppointments.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {todayAppointments.map((appointment) => (
                    <tr key={appointment.id || appointment.appointment_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.patientName || appointment.patient_name || 'Unknown Patient'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {appointment.patientEmail || appointment.patient_phone || 'No contact info'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getTypeColor(appointment.appointment_type)}>
                          {appointment.appointment_type || 'consultation'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {appointment.reason_for_visit || appointment.symptoms || 'No reason provided'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          {appointment.priority || 'Normal'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {(appointment.status === 'pending' || appointment.status === 'scheduled') && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleAcceptAppointment(appointment.id || appointment.appointment_id || '')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelAppointment(appointment.id || appointment.appointment_id || '')}
                                className="text-red-600 hover:text-red-700"
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                          {appointment.status === 'confirmed' && (
                            <Button
                              size="sm"
                              onClick={() => handleCompleteAppointment(appointment.id || appointment.appointment_id || '')}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Complete
                            </Button>
                          )}
                          {(appointment.status === 'completed' || appointment.status === 'confirmed') && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(appointment)}
                            >
                              View Details
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

      {/* Appointment Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Appointment Details</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Patient Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Patient Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {selectedAppointment.patientName || selectedAppointment.patient_name || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {selectedAppointment.patientEmail || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {selectedAppointment.patient_phone || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Patient ID:</span> {selectedAppointment.patient_id || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Appointment Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Appointment Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Appointment ID:</span> {selectedAppointment.appointment_id || selectedAppointment.id}
                  </div>
                  <div>
                    <span className="font-medium">Date:</span> {new Date(selectedAppointment.appointment_date).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Type:</span> 
                    <Badge className={`ml-2 ${getTypeColor(selectedAppointment.appointment_type)}`}>
                      {selectedAppointment.appointment_type}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> 
                    <Badge className={`ml-2 ${getStatusColor(selectedAppointment.status)}`}>
                      {selectedAppointment.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Queue Number:</span> {selectedAppointment.queue_number || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Priority:</span> {selectedAppointment.priority || 'Normal'}
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Medical Information</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Reason for Visit:</span> 
                    <p className="mt-1">{selectedAppointment.reason_for_visit || 'N/A'}</p>
                  </div>
                  {selectedAppointment.symptoms && (
                    <div>
                      <span className="font-medium">Symptoms:</span> 
                      <p className="mt-1">{selectedAppointment.symptoms}</p>
                    </div>
                  )}
                  {selectedAppointment.notes && (
                    <div>
                      <span className="font-medium">Notes:</span> 
                      <div className="mt-1 bg-white p-2 rounded border">
                        {(() => {
                          try {
                            const notes = JSON.parse(selectedAppointment.notes);
                            return (
                              <div className="space-y-1">
                                {notes.notes && <p><strong>Notes:</strong> {notes.notes}</p>}
                                {notes.diagnosis && <p><strong>Diagnosis:</strong> {notes.diagnosis}</p>}
                                {notes.prescription && <p><strong>Prescription:</strong> {notes.prescription}</p>}
                              </div>
                            );
                          } catch {
                            return <p>{selectedAppointment.notes}</p>;
                          }
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Payment Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Consultation Fee:</span> ${selectedAppointment.consultation_fee || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Payment Status:</span> 
                    <Badge className={`ml-2 ${(selectedAppointment as any).payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {(selectedAppointment as any).payment_status || 'pending'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Timeline</h3>
                <div className="space-y-2 text-sm">
                  {selectedAppointment.created_at && (
                    <div>
                      <span className="font-medium">Created:</span> {new Date(selectedAppointment.created_at).toLocaleString()}
                    </div>
                  )}
                  {(selectedAppointment as any).confirmed_at && (
                    <div>
                      <span className="font-medium">Confirmed:</span> {new Date((selectedAppointment as any).confirmed_at).toLocaleString()}
                    </div>
                  )}
                  {(selectedAppointment as any).completed_at && (
                    <div>
                      <span className="font-medium">Completed:</span> {new Date((selectedAppointment as any).completed_at).toLocaleString()}
                    </div>
                  )}
                  {selectedAppointment.updated_at && (
                    <div>
                      <span className="font-medium">Last Updated:</span> {new Date(selectedAppointment.updated_at).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button variant="outline" onClick={handleCloseModal}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
