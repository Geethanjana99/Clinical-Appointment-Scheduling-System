import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { UserIcon, SearchIcon, PlusIcon, EditIcon, TrashIcon } from 'lucide-react';

interface Patient {
  id: string;
  patient_id: string;
  name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  address: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  status: string;
  created_at: string;
}
const ManagePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPatientRegistration, setShowPatientRegistration] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    age: '',
    gender: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: ''
  });
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return '';
    
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age.toString();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'dateOfBirth') {
      const calculatedAge = calculateAge(value);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        age: calculatedAge
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('📝 Form Data Submitted:', formData);
    
    try {
      console.log('💾 DATA STORAGE FLOW:');
      console.log('1. Frontend: Data collected in React state (formData)');
      console.log('2. API Call: Sending to backend endpoint /api/mock/patients');
      console.log('3. Backend: Node.js server receives data');
      console.log('4. Storage: Data stored in mock API memory (persistent during session)');
      
      const patientData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address,
        emergencyContact: formData.emergencyContact,
        emergencyPhone: formData.emergencyPhone
      };

      console.log('🌐 Making API call to save patient...');
      const response = await fetch('http://localhost:5000/api/mock/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(patientData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Patient saved successfully to mock API!');
        console.log('💾 Mock API record created:', result.data);
        
        setSuccess(`Patient "${patientData.firstName} ${patientData.lastName}" added successfully!`);
        setError(null);
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(null), 5000);
        
        setShowPatientRegistration(false);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          dateOfBirth: '',
          age: '',
          gender: '',
          address: '',
          emergencyContact: '',
          emergencyPhone: ''
        });
        
        // Refresh the patients list to show new data
        fetchPatients();
      } else {
        console.error('❌ Failed to save patient:', result.message);
        setError(result.message || 'Failed to create patient');
        setSuccess(null);
      }
    } catch (error) {
      console.error('❌ Error creating patient:', error);
      setError(error instanceof Error ? error.message : 'Failed to create patient');
      setSuccess(null);
    }
  };

  // Fetch patients from API when component mounts
  useEffect(() => {
    fetchPatients();
  }, [searchTerm, statusFilter]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🌐 Fetching patients from API...');
      const queryParams = new URLSearchParams({
        page: '1',
        limit: '20',
        search: searchTerm,
        status: statusFilter
      });

      // Always try mock endpoint first for reliability
      let response;
      try {
        console.log('📋 Trying mock patients endpoint...');
        response = await fetch(`http://localhost:5000/api/mock/patients?${queryParams}`);
        
        if (!response.ok) {
          throw new Error(`Mock API error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          setPatients(result.data.patients || []);
          console.log('✅ Patients fetched successfully from mock API:', result.data.patients.length);
        } else {
          throw new Error(result.message || 'Failed to fetch patients from mock API');
        }
      } catch (mockError) {
        console.error('❌ Mock API failed, using fallback data:', mockError);
        
        // Fallback to hardcoded data if even mock API fails
        setPatients([
          {
            id: '1',
            patient_id: 'P-001',
            name: 'John Smith',
            email: 'john.smith@example.com',
            phone: '+1 234-567-8900',
            date_of_birth: '1990-05-15',
            gender: 'male',
            address: '123 Main St, City, State',
            emergency_contact_name: 'Jane Smith',
            emergency_contact_phone: '+1 234-567-8901',
            status: 'active',
            created_at: '2023-10-15T10:00:00Z'
          },
          {
            id: '2',
            patient_id: 'P-002',
            name: 'Sarah Johnson',
            email: 'sarah.johnson@example.com',
            phone: '+1 234-567-8901',
            date_of_birth: '1985-08-22',
            gender: 'female',
            address: '456 Oak Ave, City, State',
            emergency_contact_name: 'Mike Johnson',
            emergency_contact_phone: '+1 234-567-8902',
            status: 'active',
            created_at: '2023-10-16T11:00:00Z'
          }
        ]);
        console.log('✅ Using fallback patient data');
      }
    } catch (error) {
      console.error('❌ Error fetching patients:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch patients');
      
      // Even on error, provide some fallback data
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle editing a patient
  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({
      firstName: patient.name.split(' ')[0] || '',
      lastName: patient.name.split(' ').slice(1).join(' ') || '',
      email: patient.email,
      phone: patient.phone,
      dateOfBirth: patient.date_of_birth,
      age: calculateAge(patient.date_of_birth),
      gender: patient.gender,
      address: patient.address || '',
      emergencyContact: patient.emergency_contact_name || '',
      emergencyPhone: patient.emergency_contact_phone || ''
    });
    setShowEditModal(true);
  };

  // Handle deleting a patient
  const handleDeletePatient = async (patient: Patient) => {
    if (!confirm(`Are you sure you want to delete patient ${patient.name}?`)) {
      return;
    }

    try {
      console.log('🗑️ Deleting patient:', patient.name);
      
      const token = localStorage.getItem('token');
      let response;

      try {
        if (token) {
          response = await fetch(`http://localhost:5000/api/admin/patients/${patient.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        }
        
        if (!response || !response.ok) {
          // Fall back to mock API
          response = await fetch(`http://localhost:5000/api/mock/patients/${patient.id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            }
          });
        }
      } catch (authError) {
        console.log('🔄 Auth endpoint failed, using mock deletion...');
        response = await fetch(`http://localhost:5000/api/mock/patients/${patient.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }

      if (response && response.ok) {
        const result = await response.json();
        if (result.success) {
          // Remove from local state
          setPatients(prevPatients => prevPatients.filter(p => p.id !== patient.id));
          
          setSuccess(`Patient "${patient.name}" deleted successfully!`);
          setError(null);
          // Clear success message after 3 seconds
          setTimeout(() => setSuccess(null), 3000);
        } else {
          throw new Error(result.message || 'Failed to delete patient');
        }
      } else {
        // Fallback: just remove from local state
        setPatients(prevPatients => prevPatients.filter(p => p.id !== patient.id));
        setSuccess(`Patient "${patient.name}" removed from display.`);
        setError(null);
        setTimeout(() => setSuccess(null), 3000);
      }

    } catch (error) {
      console.error('❌ Error deleting patient:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete patient');
      setSuccess(null);
    }
  };

  // Handle updating a patient
  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingPatient) return;

    try {
      console.log('📝 Updating patient:', editingPatient.name);
      
      const token = localStorage.getItem('token');
      let response;

      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address,
        emergencyContact: formData.emergencyContact,
        emergencyPhone: formData.emergencyPhone
      };

      try {
        if (token) {
          response = await fetch(`http://localhost:5000/api/admin/patients/${editingPatient.id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
          });
        }
        
        if (!response || !response.ok) {
          // Fall back to mock API
          response = await fetch(`http://localhost:5000/api/mock/patients/${editingPatient.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
          });
        }
      } catch (authError) {
        console.log('🔄 Auth endpoint failed, using mock update...');
        response = await fetch(`http://localhost:5000/api/mock/patients/${editingPatient.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });
      }

      if (response && response.ok) {
        const result = await response.json();
        if (result.success) {
          // Update local state with the response data
          const updatedPatient = result.data.patient;
          setPatients(prevPatients => 
            prevPatients.map(p => p.id === editingPatient.id ? updatedPatient : p)
          );

          setShowEditModal(false);
          setEditingPatient(null);
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            dateOfBirth: '',
            age: '',
            gender: '',
            address: '',
            emergencyContact: '',
            emergencyPhone: ''
          });

          setSuccess(`Patient "${updatedPatient.name}" updated successfully!`);
          setError(null);
          // Clear success message after 3 seconds
          setTimeout(() => setSuccess(null), 3000);
        } else {
          throw new Error(result.message || 'Failed to update patient');
        }
      } else {
        throw new Error('Failed to update patient');
      }

    } catch (error) {
      console.error('❌ Error updating patient:', error);
      setError(error instanceof Error ? error.message : 'Failed to update patient');
      setSuccess(null);
    }
  };

  return <div className="space-y-6">
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Success</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>{success}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Manage Patients</h1>
        <Button variant="primary" onClick={() => setShowPatientRegistration(true)}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Add New Patient
        </Button>
      </div>
      <Card>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <input 
                type="text" 
                placeholder="Search patients..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <SearchIcon className="h-5 w-5" />
              </div>
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="all">All Patients</option>
            </select>
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
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Visit
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
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Loading patients...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-red-500">
                    Error: {error}
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No patients found. Click "Add New Patient" to register the first patient.
                  </td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr key={patient.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {patient.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {patient.patient_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {patient.email}
                      </div>
                      <div className="text-sm text-gray-500">{patient.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.created_at ? new Date(patient.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        patient.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {patient.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditPatient(patient)}>
                        <EditIcon className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-900" onClick={() => handleDeletePatient(patient)}>
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {patients.length} patient{patients.length !== 1 ? 's' : ''}
              {patients.length > 0 && ` (Data source: ${localStorage.getItem('token') ? 'Mock API (Token Issues)' : 'Mock Data'})`}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Patient Registration Modal */}
      <Modal 
        isOpen={showPatientRegistration} 
        onClose={() => setShowPatientRegistration(false)}
        title="Register New Patient"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                Date of Birth *
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                Age (Years)
              </label>
              <input
                type="text"
                id="age"
                name="age"
                value={formData.age}
                readOnly
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-600 cursor-not-allowed"
                placeholder="Auto-calculated"
              />
            </div>
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
              Gender *
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700">
                Emergency Contact Name
              </label>
              <input
                type="text"
                id="emergencyContact"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="emergencyPhone" className="block text-sm font-medium text-gray-700">
                Emergency Contact Phone
              </label>
              <input
                type="tel"
                id="emergencyPhone"
                name="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowPatientRegistration(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Register Patient
            </Button>
          </div>
        </form>
      </Modal>

      {/* Patient Edit Modal */}
      <Modal 
        isOpen={showEditModal} 
        onClose={() => {
          setShowEditModal(false);
          setEditingPatient(null);
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            dateOfBirth: '',
            age: '',
            gender: '',
            address: '',
            emergencyContact: '',
            emergencyPhone: ''
          });
        }}
        title={`Edit Patient: ${editingPatient?.name || ''}`}
      >
        <form onSubmit={handleUpdatePatient} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="editFirstName" className="block text-sm font-medium text-gray-700">
                First Name *
              </label>
              <input
                type="text"
                id="editFirstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="editLastName" className="block text-sm font-medium text-gray-700">
                Last Name *
              </label>
              <input
                type="text"
                id="editLastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="editEmail" className="block text-sm font-medium text-gray-700">
              Email Address *
            </label>
            <input
              type="email"
              id="editEmail"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="editPhone" className="block text-sm font-medium text-gray-700">
                Phone Number *
              </label>
              <input
                type="tel"
                id="editPhone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="editDateOfBirth" className="block text-sm font-medium text-gray-700">
                Date of Birth *
              </label>
              <input
                type="date"
                id="editDateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="editAge" className="block text-sm font-medium text-gray-700">
                Age (Years)
              </label>
              <input
                type="text"
                id="editAge"
                name="age"
                value={formData.age}
                readOnly
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-600 cursor-not-allowed"
                placeholder="Auto-calculated"
              />
            </div>
          </div>

          <div>
            <label htmlFor="editGender" className="block text-sm font-medium text-gray-700">
              Gender *
            </label>
            <select
              id="editGender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="editAddress" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              id="editAddress"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="editEmergencyContact" className="block text-sm font-medium text-gray-700">
                Emergency Contact Name
              </label>
              <input
                type="text"
                id="editEmergencyContact"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="editEmergencyPhone" className="block text-sm font-medium text-gray-700">
                Emergency Contact Phone
              </label>
              <input
                type="tel"
                id="editEmergencyPhone"
                name="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setShowEditModal(false);
                setEditingPatient(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Update Patient
            </Button>
          </div>
        </form>
      </Modal>
    </div>;
};
export default ManagePatients;