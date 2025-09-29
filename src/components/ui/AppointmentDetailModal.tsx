import React from 'react';
import { 
  X, 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  PhoneIcon, 
  StethoscopeIcon,
  InfoIcon,
  PrinterIcon,
  ShareIcon
} from 'lucide-react';
import Button from './Button';
import StatusBadge from './StatusBadge';

interface AppointmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: {
    id: string | number;
    appointment_id?: string;
    doctor_name: string;
    specialty: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
    appointment_type?: string;
    notes?: string;
    doctor_phone?: string;
    location?: string;
    created_at?: string;
    updated_at?: string;
    queue_number?: number | string;
    queue_position?: number;
  } | null;
  onReschedule?: (appointment: any) => void;
  onCancel?: (appointment: any) => void;
}

const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onCancel
}) => {
  if (!isOpen || !appointment) return null;

  // Helper function to parse and format notes
  const parseNotes = (notes: string) => {
    try {
      // Try to parse as JSON
      const parsedNotes = JSON.parse(notes);
      
      // If it's an object, format it nicely
      if (typeof parsedNotes === 'object' && parsedNotes !== null) {
        const formattedEntries = [];
        
        if (parsedNotes.notes) {
          formattedEntries.push(`📝 Notes: ${parsedNotes.notes}`);
        }
        if (parsedNotes.diagnosis) {
          formattedEntries.push(`🩺 Diagnosis: ${parsedNotes.diagnosis}`);
        }
        if (parsedNotes.prescription) {
          formattedEntries.push(`💊 Prescription: ${parsedNotes.prescription}`);
        }
        
        // Add any other fields that might be present
        Object.keys(parsedNotes).forEach(key => {
          if (!['notes', 'diagnosis', 'prescription'].includes(key)) {
            const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
            formattedEntries.push(`• ${capitalizedKey}: ${parsedNotes[key]}`);
          }
        });
        
        return formattedEntries.join('\n');
      }
      
      // If it's not an object, return as string
      return String(parsedNotes);
    } catch (error) {
      // If parsing fails, return original notes
      return notes;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      full: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  const isUpcoming = (date: string) => {
    return new Date(date) > new Date();
  };

  const canManage = (status: string, date: string) => {
    return (status === 'confirmed' || status === 'pending' || status === 'scheduled') && isUpcoming(date);
  };

  const dateInfo = formatDate(appointment.appointment_date);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mr-4">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Appointment Details</h2>
                <p className="text-gray-600">Complete information about your appointment</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <StatusBadge status={appointment.status as any} />
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Close modal"
                aria-label="Close appointment details modal"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Doctor Information */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <StethoscopeIcon className="w-6 h-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Doctor Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Doctor Name</label>
                <p className="text-lg font-semibold text-gray-900">{appointment.doctor_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Specialization</label>
                <p className="text-lg text-blue-600 font-medium">{appointment.specialty}</p>
              </div>
              {appointment.doctor_phone && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Contact Number</label>
                  <div className="flex items-center mt-1">
                    <PhoneIcon className="w-4 h-4 text-gray-500 mr-2" />
                    <p className="text-gray-900">{appointment.doctor_phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Appointment Schedule */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <ClockIcon className="w-6 h-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Schedule Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Date</label>
                <div className="flex items-center mt-1">
                  <CalendarIcon className="w-4 h-4 text-gray-500 mr-2" />
                  <p className="text-lg font-semibold text-gray-900">{dateInfo.full}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Queue Number</label>
                <div className="flex items-center mt-1">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
                    <span className="text-green-600 font-bold text-sm">Q</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {appointment.queue_number || 'N/A'}
                    </p>
                    {appointment.queue_position && (
                      <p className="text-sm text-gray-600">Position: {appointment.queue_position}</p>
                    )}
                  </div>
                </div>
              </div>
              {appointment.appointment_type && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Appointment Type</label>
                  <p className="text-gray-900 mt-1">{appointment.appointment_type}</p>
                </div>
              )}
              {appointment.location && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Location</label>
                  <div className="flex items-center mt-1">
                    <MapPinIcon className="w-4 h-4 text-gray-500 mr-2" />
                    <p className="text-gray-900">{appointment.location}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Appointment Details */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <InfoIcon className="w-6 h-6 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Appointment Details</h3>
            </div>
            <div className="space-y-3">
              {appointment.appointment_id && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Appointment ID</label>
                  <p className="font-mono text-gray-900 bg-white px-3 py-2 rounded-md mt-1">
                    {appointment.appointment_id}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700">Current Status</label>
                <div className="mt-1">
                  <StatusBadge status={appointment.status as any} />
                </div>
              </div>
              {appointment.notes && (
                <div className="col-span-full">
                  <label className="text-sm font-medium text-gray-700">Important Notes</label>
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400 rounded-lg p-4 mt-2 shadow-sm">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-amber-800 text-sm mb-1">Appointment Notes</h4>
                        <div className="prose prose-sm max-w-none">
                          <p className="text-amber-700 text-sm leading-relaxed whitespace-pre-line">{parseNotes(appointment.notes)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          {(appointment.created_at || appointment.updated_at) && (
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Record Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {appointment.created_at && (
                  <div>
                    <label className="font-medium text-gray-700">Created</label>
                    <p className="text-gray-600">{formatDate(appointment.created_at).full}</p>
                  </div>
                )}
                {appointment.updated_at && (
                  <div>
                    <label className="font-medium text-gray-700">Last Updated</label>
                    <p className="text-gray-600">{formatDate(appointment.updated_at).full}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-xl">
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <div className="flex space-x-3">
              <Button variant="outline" className="flex items-center">
                <PrinterIcon className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" className="flex items-center">
                <ShareIcon className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
            
            <div className="flex space-x-3">
              {canManage(appointment.status, appointment.appointment_date) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    onCancel?.(appointment);
                    onClose();
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  Cancel Appointment
                </Button>
              )}
              <Button variant="primary" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailModal;