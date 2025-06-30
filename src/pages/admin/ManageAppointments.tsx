import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import { SearchIcon, PlusIcon, FilterIcon, UserIcon, AlertCircle } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  email: string;
  specialty: string;
  phone: string;
  availability: string[];
  status: 'active' | 'inactive';
}

interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
  notes: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
const ManageAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('');
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    patientName: '',
    patientEmail: '',
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    notes: ''
  });
  const [doctorFormData, setDoctorFormData] = useState({
    name: '',
    email: '',
    specialty: '',
    phone: '',
    availability: [] as string[],
    status: 'active' as 'active' | 'inactive'
  });

  // API base URL
  const API_BASE_URL = 'http://localhost:5000/api';

  // Fetch appointments from API
  const fetchAppointments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/mock/appointments`);
      const result = await response.json();
      
      if (result.success) {
        setAppointments(result.data || []);
        setDataSource(result.source || 'mock_api');
      } else {
        throw new Error(result.message || 'Failed to fetch appointments');
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(`Failed to load appointments: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setAppointments([]);
    }
  };

  // Fetch doctors from API
  const fetchDoctors = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/mock/doctors`);
      const result = await response.json();
      
      if (result.success) {
        setDoctors(result.data || []);
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
        await Promise.all([fetchAppointments(), fetchDoctors()]);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Create new doctor via API
  const createDoctor = async (doctorData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/mock/doctors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(doctorData),
      });

      const result = await response.json();

      if (result.success) {
        await fetchDoctors(); // Refresh doctors list
        setError(null);
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to create doctor');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create doctor';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Create new appointment via API
  const createAppointment = async (appointmentData: any) => {
    try {
      const selectedDoctor = doctors.find(d => d.id === appointmentData.doctorId);
      
      const response = await fetch(`${API_BASE_URL}/mock/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...appointmentData,
          doctorName: selectedDoctor?.name || '',
          doctorSpecialty: selectedDoctor?.specialty || ''
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

  // Cancel appointment
  const cancelAppointment = async (appointmentId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/mock/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      const result = await response.json();

      if (result.success) {
        await fetchAppointments(); // Refresh appointments list
        setError(null);
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to cancel appointment');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel appointment';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Update appointment (for reschedule)
  const updateAppointment = async (appointmentId: string, appointmentData: any) => {
    try {
      const selectedDoctor = doctors.find(d => d.id === appointmentData.doctorId);
      
      const response = await fetch(`${API_BASE_URL}/mock/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...appointmentData,
          doctorName: selectedDoctor?.name || '',
          doctorSpecialty: selectedDoctor?.specialty || ''
        }),
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDoctorInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDoctorFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDoctorAvailabilityChange = (day: string) => {
    setDoctorFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(day)
        ? prev.availability.filter(d => d !== day)
        : [...prev.availability, day]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingAppointment) {
        // Reschedule existing appointment
        await updateAppointment(editingAppointment.id, formData);
        setShowRescheduleModal(false);
        setEditingAppointment(null);
      } else {
        // Create new appointment
        await createAppointment(formData);
        setShowAppointmentForm(false);
      }
      
      setFormData({
        patientName: '',
        patientEmail: '',
        doctorId: '',
        appointmentDate: '',
        appointmentTime: '',
        reason: '',
        notes: ''
      });
    } catch (err) {
      // Error is already handled in createAppointment/updateAppointment functions
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

  const handleRescheduleAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      patientName: appointment.patientName,
      patientEmail: appointment.patientEmail,
      doctorId: appointment.doctorId,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      reason: appointment.reason,
      notes: appointment.notes
    });
    setShowRescheduleModal(true);
  };

  const handleNewAppointment = () => {
    setEditingAppointment(null);
    setFormData({
      patientName: '',
      patientEmail: '',
      doctorId: '',
      appointmentDate: '',
      appointmentTime: '',
      reason: '',
      notes: ''
    });
    setShowAppointmentForm(true);
  };

  const handleAddNewDoctor = () => {
    setDoctorFormData({
      name: '',
      email: '',
      specialty: '',
      phone: '',
      availability: [],
      status: 'active'
    });
    setShowAddDoctorModal(true);
  };

  const handleDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newDoctor = await createDoctor(doctorFormData);
      
      // Close the modal
      setShowAddDoctorModal(false);
      
      // Reset the form
      setDoctorFormData({
        name: '',
        email: '',
        specialty: '',
        phone: '',
        availability: [],
        status: 'active'
      });
      
      // Optionally auto-select the new doctor in the appointment form
      if (newDoctor && newDoctor.id) {
        setFormData(prev => ({
          ...prev,
          doctorId: newDoctor.id
        }));
      }
    } catch (err) {
      console.error('Failed to add doctor:', err);
    }
  };
  return <div className="space-y-6">      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Manage Appointments
          </h1>
          {dataSource && (
            <p className="text-sm text-gray-500 mt-1">
              Data source: {dataSource === 'mock_api' ? 'Mock API (Permanent Storage)' : dataSource}
            </p>
          )}
        </div>
        <Button variant="primary" onClick={handleNewAppointment}>
          <PlusIcon className="w-4 h-4 mr-2" />
          New Appointment
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <Button 
                  onClick={() => {
                    setError(null);
                    fetchAppointments();
                    fetchDoctors();
                  }}
                  size="sm"
                  variant="outline"
                  className="text-red-800 border-red-300 hover:bg-red-50"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <Card>
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-500">Loading appointments...</div>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <input type="text" placeholder="Search appointments..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <SearchIcon className="h-5 w-5" />
                </div>
              </div>
              <Button variant="outline">
                <FilterIcon className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <input type="date" className="border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
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
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.patientName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.patientEmail}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {appointment.doctorName}
                      </div>
                      <div className="text-sm text-gray-500">{appointment.doctorSpecialty}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(appointment.appointmentDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">{appointment.appointmentTime}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={appointment.status as any} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mr-2"
                        onClick={() => handleRescheduleAppointment(appointment)}
                        disabled={appointment.status === 'cancelled'}
                      >
                        Reschedule
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleCancelAppointment(appointment.id)}
                        disabled={appointment.status === 'cancelled'}
                      >
                        Cancel
                      </Button>
                    </td>
                  </tr>
                ))}
                {appointments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No appointments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {appointments.length} appointments
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>          
            </div>
          </div>
        </Card>
      )}

      {/* New Appointment Modal */}
      <Modal 
        isOpen={showAppointmentForm} 
        onClose={() => setShowAppointmentForm(false)}
        title="Schedule New Appointment"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="patientName" className="block text-sm font-medium text-gray-700">
                Patient Name *
              </label>
              <input
                type="text"
                id="patientName"
                name="patientName"
                value={formData.patientName}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter patient name"
              />
            </div>
            <div>
              <label htmlFor="patientEmail" className="block text-sm font-medium text-gray-700">
                Patient Email
              </label>
              <input
                type="email"
                id="patientEmail"
                name="patientEmail"
                value={formData.patientEmail}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="patient@example.com"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700">
                Doctor *
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddNewDoctor}
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                + Add New Doctor
              </Button>
            </div>
            <select
              id="doctorId"
              name="doctorId"
              value={formData.doctorId}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a doctor</option>
              {doctors.filter(doctor => doctor.status === 'active').map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} - {doctor.specialty}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700">
                Appointment Date *
              </label>
              <input
                type="date"
                id="appointmentDate"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="appointmentTime" className="block text-sm font-medium text-gray-700">
                Appointment Time *
              </label>
              <select
                id="appointmentTime"
                name="appointmentTime"
                value={formData.appointmentTime}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select time</option>
                <option value="09:00">09:00 AM</option>
                <option value="09:30">09:30 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="10:30">10:30 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="11:30">11:30 AM</option>
                <option value="14:00">02:00 PM</option>
                <option value="14:30">02:30 PM</option>
                <option value="15:00">03:00 PM</option>
                <option value="15:30">03:30 PM</option>
                <option value="16:00">04:00 PM</option>
                <option value="16:30">04:30 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
              Reason for Visit *
            </label>
            <input
              type="text"
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Regular checkup, Follow-up visit, etc."
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Additional Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any additional information or special requirements..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowAppointmentForm(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Schedule Appointment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reschedule Appointment Modal */}
      <Modal 
        isOpen={showRescheduleModal} 
        onClose={() => {
          setShowRescheduleModal(false);
          setEditingAppointment(null);
        }}
        title="Reschedule Appointment"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="patientName" className="block text-sm font-medium text-gray-700">
                Patient Name *
              </label>
              <input
                type="text"
                id="patientName"
                name="patientName"
                value={formData.patientName}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter patient name"
              />
            </div>
            <div>
              <label htmlFor="patientEmail" className="block text-sm font-medium text-gray-700">
                Patient Email
              </label>
              <input
                type="email"
                id="patientEmail"
                name="patientEmail"
                value={formData.patientEmail}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="patient@example.com"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700">
                Doctor *
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddNewDoctor}
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                + Add New Doctor
              </Button>
            </div>
            <select
              id="doctorId"
              name="doctorId"
              value={formData.doctorId}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a doctor</option>
              {doctors.filter(doctor => doctor.status === 'active').map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} - {doctor.specialty}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700">
                Appointment Date *
              </label>
              <input
                type="date"
                id="appointmentDate"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="appointmentTime" className="block text-sm font-medium text-gray-700">
                Appointment Time *
              </label>
              <select
                id="appointmentTime"
                name="appointmentTime"
                value={formData.appointmentTime}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select time</option>
                <option value="09:00">09:00 AM</option>
                <option value="09:30">09:30 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="10:30">10:30 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="11:30">11:30 AM</option>
                <option value="14:00">02:00 PM</option>
                <option value="14:30">02:30 PM</option>
                <option value="15:00">03:00 PM</option>
                <option value="15:30">03:30 PM</option>
                <option value="16:00">04:00 PM</option>
                <option value="16:30">04:30 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
              Reason for Visit *
            </label>
            <input
              type="text"
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Regular checkup, Follow-up visit, etc."
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Additional Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any additional information or special requirements..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setShowRescheduleModal(false);
                setEditingAppointment(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Update Appointment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add New Doctor Modal */}
      <Modal 
        isOpen={showAddDoctorModal} 
        onClose={() => setShowAddDoctorModal(false)}
        title="Add New Doctor"
      >
        <form onSubmit={handleDoctorSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="doctorName" className="block text-sm font-medium text-gray-700">
                Doctor Name *
              </label>
              <input
                type="text"
                id="doctorName"
                name="name"
                value={doctorFormData.name}
                onChange={handleDoctorInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Dr. John Smith"
              />
            </div>
            <div>
              <label htmlFor="doctorEmail" className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <input
                type="email"
                id="doctorEmail"
                name="email"
                value={doctorFormData.email}
                onChange={handleDoctorInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="doctor@hospital.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="doctorSpecialty" className="block text-sm font-medium text-gray-700">
                Specialty *
              </label>
              <input
                type="text"
                id="doctorSpecialty"
                name="specialty"
                value={doctorFormData.specialty}
                onChange={handleDoctorInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Cardiology, Neurology"
              />
            </div>
            <div>
              <label htmlFor="doctorPhone" className="block text-sm font-medium text-gray-700">
                Phone Number *
              </label>
              <input
                type="tel"
                id="doctorPhone"
                name="phone"
                value={doctorFormData.phone}
                onChange={handleDoctorInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="+1 234 567 8900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Availability (Days of the week)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                <label key={day} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={doctorFormData.availability.includes(day)}
                    onChange={() => handleDoctorAvailabilityChange(day)}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{day}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="doctorStatus" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="doctorStatus"
              name="status"
              value={doctorFormData.status}
              onChange={handleDoctorInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowAddDoctorModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Doctor
            </Button>
          </div>
        </form>
      </Modal>
    </div>;
};
export default ManageAppointments;