import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { X, FileText } from 'lucide-react';
import { apiService } from '../../services/api';


interface CreateClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateClaim: (claimData: any) => void;
}

const CreateClaimModal: React.FC<CreateClaimModalProps> = ({
  isOpen,
  onClose,
  onCreateClaim
}) => {
  const [formData, setFormData] = useState({
    patientName: '',
    patientId: '',
    appointmentId: '',
    doctorName: '',
    serviceDate: '',
    amount: '',
    insuranceProvider: '',
    serviceType: '',
    notes: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patients, setPatients] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
        const fetchPatients = async () => {
            if (!isOpen) return; // Only fetch when modal is open
            
            setLoading(true);
            setError(null);            try {
                const response = await apiService.getPatientNames();
                
                if (response.success && response.data) {
                    const patientList = response.data.map((patient: any) => ({
                        id: patient.id,
                        name: patient.name || `${patient.first_name} ${patient.last_name}` || patient.email
                    }));
                    setPatients(patientList);
                } else {
                    // Fallback to sample data
                    const fallbackPatients = [
                        { id: 'P-001', name: 'John Smith' },
                        { id: 'P-002', name: 'Sarah Johnson' },
                        { id: 'P-003', name: 'Michael Brown' },
                        { id: 'P-004', name: 'Emily Davis' },
                        { id: 'P-005', name: 'David Wilson' }
                    ];
                    setPatients(fallbackPatients);
                    setError('Using sample patients - Please login as admin to view real data');
                }
            } catch (err) {
                console.error('Error fetching patients:', err);
                // Fallback to sample data
                const fallbackPatients = [
                    { id: 'P-001', name: 'John Smith' },
                    { id: 'P-002', name: 'Sarah Johnson' },
                    { id: 'P-003', name: 'Michael Brown' },
                    { id: 'P-004', name: 'Emily Davis' },
                    { id: 'P-005', name: 'David Wilson' }
                ];
                setPatients(fallbackPatients);
                setError('Using sample patients - Please check your connection and login');
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, [isOpen]);    const patientOptions = [
        { value: '', label: loading ? 'Loading patients...' : 'Select Patient' },
        ...patients.map(patient => ({
            value: patient.name,
            label: patient.name
        }))
    ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.patientName.trim()) {
      newErrors.patientName = 'Patient name is required';
    }
    if (!formData.patientId.trim()) {
      newErrors.patientId = 'Patient ID is required';
    }
    if (!formData.appointmentId.trim()) {
      newErrors.appointmentId = 'Appointment ID is required';
    }
    if (!formData.doctorName.trim()) {
      newErrors.doctorName = 'Doctor name is required';
    }
    if (!formData.serviceDate) {
      newErrors.serviceDate = 'Service date is required';
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }
    if (!formData.insuranceProvider) {
      newErrors.insuranceProvider = 'Insurance provider is required';
    }
    if (!formData.serviceType) {
      newErrors.serviceType = 'Service type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const claimData = {
        id: `CLM-${Date.now().toString().slice(-3)}`,
        patientName: formData.patientName.trim(),
        patientId: formData.patientId.trim(),
        appointmentId: formData.appointmentId.trim(),
        doctorName: formData.doctorName.trim(),
        serviceDate: formData.serviceDate,
        claimDate: new Date().toISOString().split('T')[0],
        amount: parseFloat(formData.amount),
        insuranceProvider: formData.insuranceProvider,
        status: 'pending' as const,
        serviceType: formData.serviceType,
        notes: formData.notes.trim()
      };

      onCreateClaim(claimData);
      handleClose();
    } catch (error) {
      console.error('Error creating claim:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      patientName: '',
      patientId: '',
      appointmentId: '',
      doctorName: '',
      serviceDate: '',
      amount: '',
      insuranceProvider: '',
      serviceType: '',
      notes: ''
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const insuranceProviders = [
    'Blue Cross Blue Shield',
    'Aetna',
    'Cigna',
    'UnitedHealth',
    'Humana',
    'Kaiser Permanente',
    'Anthem',
    'Molina Healthcare',
    'WellCare',
    'Other'
  ];

  const serviceTypes = [
    'Consultation',
    'Follow-up',
    'Routine Checkup',
    'Diagnostic Testing',
    'Laboratory Tests',
    'Imaging Studies',
    'Minor Procedure',
    'Emergency Visit',
    'Specialist Referral',
    'Preventive Care',
    'Other'
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="2xl">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">Create New Insurance Claim</h3>
            <p className="text-sm text-gray-500">Submit a new insurance claim for patient services</p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Information */}
          <div className="md:col-span-2">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Patient Information</h4>
          </div>

          <div>
            <Select
              label="Patient Name"
              value={formData.patientName}
              onChange={(value) => {
                handleInputChange('patientName', value);
                const selectedPatient = patients.find(p => p.name === value);
                handleInputChange('patientId', selectedPatient ? selectedPatient.id : '');
              }}
              options={patientOptions}
              required
              disabled={loading}
              className="transition-all duration-200 hover:border-blue-400 focus:border-blue-500 h-12 text-base"
            />
            {error && (
              <p className="text-red-600 text-sm mt-1">{error}</p>
            )}
          </div>

          <div>
            <Input
              label="Patient ID"
              type="text"
              value={formData.patientId}
              onChange={(e) => handleInputChange('patientId', e.target.value)}
              placeholder="e.g., P001"
              error={errors.patientId}
              required
            />
          </div>

          {/* Service Information */}
          <div className="md:col-span-2">
            <h4 className="text-sm font-medium text-gray-900 mb-4 mt-6">Service Information</h4>
          </div>

          <div>
            <Input
              label="Appointment ID"
              type="text"
              value={formData.appointmentId}
              onChange={(e) => handleInputChange('appointmentId', e.target.value)}
              placeholder="e.g., APT-123"
              error={errors.appointmentId}
              required
            />
          </div>

          <div>
            <Input
              label="Doctor Name"
              type="text"
              value={formData.doctorName}
              onChange={(e) => handleInputChange('doctorName', e.target.value)}
              placeholder="Enter doctor's name"
              error={errors.doctorName}
              required
            />
          </div>

          <div>
            <Input
              label="Service Date"
              type="date"
              value={formData.serviceDate}
              onChange={(e) => handleInputChange('serviceDate', e.target.value)}
              error={errors.serviceDate}
              required
            />
          </div>          <div>
            <Select
              label="Service Type"
              value={formData.serviceType}
              onChange={(value) => handleInputChange('serviceType', value)}
              options={[
                { value: '', label: 'Select service type' },
                ...serviceTypes.map(type => ({ value: type, label: type }))
              ]}
              error={errors.serviceType}
              required
            />
          </div>

          {/* Billing Information */}
          <div className="md:col-span-2">
            <h4 className="text-sm font-medium text-gray-900 mb-4 mt-6">Billing Information</h4>
          </div>

          <div>
            <Input
              label="Claim Amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="0.00"
              error={errors.amount}
              required
            />
          </div>          <div>
            <Select
              label="Insurance Provider"
              value={formData.insuranceProvider}
              onChange={(value) => handleInputChange('insuranceProvider', value)}
              options={[
                { value: '', label: 'Select insurance provider' },
                ...insuranceProviders.map(provider => ({ value: provider, label: provider }))
              ]}
              error={errors.insuranceProvider}
              required
            />
          </div>

          {/* Additional Notes */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Enter any additional notes or comments"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? 'Creating...' : 'Create Claim'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateClaimModal;
