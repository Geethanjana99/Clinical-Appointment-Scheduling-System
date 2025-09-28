import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { UserPlus, Edit, Trash2, AlertCircle } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  email: string;
  specialty: string;
  phone: string;
  status: 'active' | 'inactive';
  availability?: string[]; // Optional for compatibility
}

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialty: '',
    phone: '',
    availability: [] as string[],
    status: 'active' as 'active' | 'inactive'
  });

  const API_BASE_URL = 'http://localhost:5000/api';

  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/mock/doctors`);

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();

      if (result.success) {
        setDoctors(result.data || []);
        setDataSource(result.source || 'mock_api');
      } else {
        throw new Error(result.message || 'Failed to fetch doctors');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to load doctors: ${msg}`);
      setDoctors([]);
      setDataSource('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const addDoctor = async (doctorData: Omit<Doctor, 'id'>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/mock/doctors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doctorData),
      });
      const result = await response.json();
      if (result.success) {
        await fetchDoctors();
        setError(null);
        setSuccess(`Doctor "${doctorData.name}" added successfully!`);
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
        return result.data;
      } else throw new Error(result.message);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to add doctor';
      setError(msg);
      setSuccess(null);
      throw new Error(msg);
    }
  };

  const updateDoctor = async (id: string, doctorData: Omit<Doctor, 'id'>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/mock/doctors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doctorData),
      });
      const result = await response.json();
      if (result.success) {
        await fetchDoctors();
        setError(null);
        setSuccess(`Doctor "${doctorData.name}" updated successfully!`);
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
        return result.data;
      } else throw new Error(result.message);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update doctor';
      setError(msg);
      setSuccess(null);
      throw new Error(msg);
    }
  };

  const deleteDoctor = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/mock/doctors/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        await fetchDoctors();
        setError(null);
        setSuccess('Doctor deleted successfully!');
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
        return result.data;
      } else throw new Error(result.message);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete doctor';
      setError(msg);
      setSuccess(null);
      throw new Error(msg);
    }
  };

  const handleAddDoctor = () => {
    setEditingDoctor(null);
    setFormData({ name: '', email: '', specialty: '', phone: '', availability: [], status: 'active' });
    setIsModalOpen(true);
  };

  const handleEditDoctor = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name,
      email: doctor.email,
      specialty: doctor.specialty,
      phone: doctor.phone,
      availability: doctor.availability || [],
      status: doctor.status,
    });
    setIsModalOpen(true);
  };

  const handleDeleteDoctor = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      await deleteDoctor(id);
    }
  };

  const handleAvailabilityChange = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(day)
        ? prev.availability.filter(d => d !== day)
        : [...prev.availability, day]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDoctor) {
        await updateDoctor(editingDoctor.id, formData);
      } else {
        await addDoctor(formData);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Doctors</h1>
          {dataSource && (
            <p className="text-sm text-gray-500 mt-1">
              Data source: {dataSource === 'mock_api' ? 'Mock API (Permanent Storage)' : dataSource}
            </p>
          )}
        </div>
        <Button onClick={handleAddDoctor} className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Add Doctor
        </Button>
      </div>

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
                  onClick={fetchDoctors}
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
            <div className="text-gray-500">Loading doctors...</div>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Availability</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {doctors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No doctors found. Click "Add Doctor" to create the first doctor.
                    </td>
                  </tr>
                ) : (
                  doctors.map((doctor) => (
                    <tr key={doctor.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{doctor.name}</div>
                        <div className="text-sm text-gray-500">{doctor.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{doctor.specialty}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{doctor.phone}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(doctor.availability || []).map((day) => (
                            <span key={day} className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                              {day.slice(0, 3)}
                            </span>
                          ))}
                          {(!doctor.availability || doctor.availability.length === 0) && (
                            <span className="text-sm text-gray-400">Not set</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          doctor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {doctor.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditDoctor(doctor)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteDoctor(doctor.id)} className="text-red-600 hover:text-red-900">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <Input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
            <Input type="text" value={formData.specialty} onChange={(e) => setFormData({ ...formData, specialty: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <Input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
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
                    checked={formData.availability.includes(day)}
                    onChange={() => handleAvailabilityChange(day)}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{day}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editingDoctor ? 'Update' : 'Add'} Doctor</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageDoctors;
