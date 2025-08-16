import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import { SearchIcon, PlusIcon, FilterIcon, UserIcon, AlertCircle, Calendar, Clock, User, Stethoscope } from 'lucide-react';
import { apiService } from '../../services/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Patient {
  id: string;
  patientId: string;
  name: string;
  email: string;
  phone?: string;
}

interface Doctor {
  id: string;
  name: string;
  email: string;
  specialty: string;
  phone?: string;
  consultationFee?: number;
}

interface Appointment {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
  reasonForVisit: string;
  symptoms?: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  consultationFee?: number;
  createdAt: string;
  updatedAt: string;
}

const ManageAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');

  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    appointmentType: 'consultation',
    reasonForVisit: '',
    symptoms: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
  });

  // Fetch all appointments (admin can see all)
  const fetchAppointments = async () => {
    try {
      const token = apiService.getToken();
      const response = await fetch(`${API_BASE_URL}/appointments?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        setAppointments(result.data.appointments || []);
      } else {
        throw new Error(result.message || 'Failed to fetch appointments');
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(`Failed to load appointments: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setAppointments([]);
    }
  };

  // Fetch patients for appointment creation
  const fetchPatients = async () => {
    try {
      const token = apiService.getToken();
      const response = await fetch(`${API_BASE_URL}/admin/reports/patients`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        setPatients(result.data.patients || []);
      } else {
        throw new Error(result.message || 'Failed to fetch patients');
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError(`Failed to load patients: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setPatients([]);
    }
  };

  // Fetch doctors for appointment creation
  const fetchDoctors = async () => {
    try {
      const token = apiService.getToken();
      const response = await fetch(`${API_BASE_URL}/doctors`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        setDoctors(result.data.doctors || []);
      } else {
        throw new Error(result.message || 'Failed to fetch doctors');
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError(`Failed to load doctors: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setDoctors([]);
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([fetchAppointments(), fetchPatients(), fetchDoctors()]);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Create new appointment
  const createAppointment = async (appointmentData: typeof formData) => {
    try {
      const token = apiService.getToken();
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: appointmentData.patientId,
          doctorId: appointmentData.doctorId,
          appointmentDate: appointmentData.appointmentDate,
          appointmentTime: appointmentData.appointmentTime,
          appointmentType: appointmentData.appointmentType,
          reasonForVisit: appointmentData.reasonForVisit,
          symptoms: appointmentData.symptoms,
          priority: appointmentData.priority
        }),
      });

      const result = await response.json();

      if (result.success) {
        await fetchAppointments(); // Refresh appointments list
        setError(null);
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to create appointment');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create appointment';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Update appointment status
  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      const token = apiService.getToken();
      const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();

      if (result.success) {
        await fetchAppointments(); // Refresh appointments list
        setError(null);
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to update appointment');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update appointment';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Cancel appointment
  const cancelAppointment = async (appointmentId: string) => {
    return updateAppointmentStatus(appointmentId, 'cancelled');
  };

  // Confirm appointment
  const confirmAppointment = async (appointmentId: string) => {
    return updateAppointmentStatus(appointmentId, 'confirmed');
  };

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingAppointment) {
        // Update existing appointment
        await updateAppointmentStatus(editingAppointment.id, 'scheduled');
        setEditingAppointment(null);
      } else {
        // Create new appointment
        await createAppointment(formData);
      }
      
      setShowAppointmentForm(false);
      setFormData({
        patientId: '',
        doctorId: '',
        appointmentDate: '',
        appointmentTime: '',
        appointmentType: 'consultation',
        reasonForVisit: '',
        symptoms: '',
        priority: 'medium'
      });
    } catch (err) {
      console.error('Failed to save appointment:', err);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await cancelAppointment(appointmentId);
      } catch (err) {
        console.error('Failed to cancel appointment:', err);
      }
    }
  };

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      await confirmAppointment(appointmentId);
    } catch (err) {
      console.error('Failed to confirm appointment:', err);
    }
  };

  const handleNewAppointment = () => {
    setEditingAppointment(null);
    setFormData({
      patientId: '',
      doctorId: '',
      appointmentDate: '',
      appointmentTime: '',
      appointmentType: 'consultation',
      reasonForVisit: '',
      symptoms: '',
      priority: 'medium'
    });
    setShowAppointmentForm(true);
  };

  // Filter appointments based on search and filters
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = !searchTerm || 
      appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.appointmentId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || appointment.status === statusFilter;
    
    const matchesDate = !selectedDate || appointment.appointmentDate === selectedDate;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Get upcoming appointments (today and future dates)
  const upcomingAppointments = filteredAppointments.filter(appointment => {
    const appointmentDate = new Date(appointment.appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return appointmentDate >= today && appointment.status !== 'cancelled' && appointment.status !== 'completed';
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Map appointment status to StatusBadge status
  const mapStatus = (status: string): 'waiting' | 'in-progress' | 'completed' | 'cancelled' | 'pending' | 'approved' | 'rejected' => {
    switch (status) {
      case 'scheduled': return 'pending';
      case 'confirmed': return 'approved';
      case 'in_progress': return 'in-progress';
      case 'completed': return 'completed';
      case 'cancelled': return 'cancelled';
      case 'no_show': return 'rejected';
      default: return 'pending';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Appointments</h1>
          <p className="text-gray-600">View and manage all appointments</p>
        </div>
        <Button
          onClick={handleNewAppointment}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>New Appointment</span>
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setSelectedDate('');
              }}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md flex items-center justify-center space-x-2"
            >
              <FilterIcon className="h-4 w-4" />
              <span>Clear Filters</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Upcoming Appointments Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredAppointments.filter(apt => apt.appointmentDate === new Date().toISOString().split('T')[0]).length}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <User className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Confirmation</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredAppointments.filter(apt => apt.status === 'scheduled').length}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <Stethoscope className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Urgent</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredAppointments.filter(apt => apt.priority === 'urgent').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Appointments List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{appointment.patientName}</div>
                      <div className="text-sm text-gray-500">{appointment.patientEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{appointment.doctorName}</div>
                      <div className="text-sm text-gray-500">{appointment.doctorSpecialty}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{appointment.appointmentDate}</div>
                    <div className="text-sm text-gray-500">{appointment.appointmentTime}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {appointment.appointmentType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge
                      status={mapStatus(appointment.status)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(appointment.priority)}`}>
                      {appointment.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {appointment.status === 'scheduled' && (
                      <Button
                        onClick={() => handleConfirmAppointment(appointment.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Confirm
                      </Button>
                    )}
                    {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                      <Button
                        onClick={() => handleCancelAppointment(appointment.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Cancel
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredAppointments.length === 0 && (
            <div className="text-center py-8">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter || selectedDate
                  ? 'Try adjusting your search filters.'
                  : 'Get started by creating your first appointment.'}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* New Appointment Modal */}
      <Modal isOpen={showAppointmentForm} onClose={() => setShowAppointmentForm(false)}>
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-4">
            {editingAppointment ? 'Edit Appointment' : 'New Appointment'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
              <select
                name="patientId"
                value={formData.patientId}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Patient</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} ({patient.patientId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
              <select
                name="doctorId"
                value={formData.doctorId}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Doctor</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialty}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleInputChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  name="appointmentTime"
                  value={formData.appointmentTime}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Type</label>
              <select
                name="appointmentType"
                value={formData.appointmentType}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="consultation">Consultation</option>
                <option value="follow_up">Follow Up</option>
                <option value="emergency">Emergency</option>
                <option value="routine_checkup">Routine Checkup</option>
                <option value="procedure">Procedure</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
              <textarea
                name="reasonForVisit"
                value={formData.reasonForVisit}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter reason for the appointment..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Symptoms (Optional)</label>
              <textarea
                name="symptoms"
                value={formData.symptoms}
                onChange={handleInputChange}
                rows={3}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter any symptoms..."
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                onClick={() => setShowAppointmentForm(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                {editingAppointment ? 'Update' : 'Create'} Appointment
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default ManageAppointments;
