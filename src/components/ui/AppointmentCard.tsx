import React from 'react';
import { 
  CalendarIcon, 
  MapPinIcon, 
  PhoneIcon, 
  StethoscopeIcon,
  EyeIcon,
  XIcon
} from 'lucide-react';
import Button from './Button';
import StatusBadge from './StatusBadge';

interface AppointmentCardProps {
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
    queue_number?: number | string;
    queue_position?: number;
  };
  variant?: 'dashboard' | 'full';
  onViewDetails?: (appointment: any) => void;
  onCancel?: (appointment: any) => void;
  isLoading?: boolean;
  className?: string;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  variant = 'full',
  onViewDetails,
  onCancel,
  isLoading = false,
  className = ''
}) => {
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
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      year: date.getFullYear(),
      full: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
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

  if (variant === 'dashboard') {
    return (
      <div className={`bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 ${className}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Header with Doctor Info */}
            <div className="flex items-center mb-3">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <StethoscopeIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {appointment.doctor_name}
                </h3>
                <p className="text-sm text-blue-600 font-medium">
                  {appointment.specialty}
                </p>
              </div>
            </div>

            {/* Date and Queue Number with enhanced display */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                      {dateInfo.weekday}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {dateInfo.day}
                    </div>
                    <div className="text-sm text-gray-600">
                      {dateInfo.month} {dateInfo.year}
                    </div>
                  </div>
                  <div className="h-12 w-px bg-gray-300"></div>
                  <div>
                    <div className="flex items-center text-gray-600">
                      {appointment.status === 'completed' ? (
                        <>
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                            <span className="text-green-600 font-bold text-sm">✓</span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Status</span>
                            <div className="font-bold text-lg text-green-600">
                              Appointment Complete
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                            <span className="text-blue-600 font-bold text-sm">Q</span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Queue Number</span>
                            <div className="font-bold text-lg text-blue-600">
                              {appointment.queue_number || 'N/A'}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    {appointment.appointment_type && (
                      <div className="text-sm text-gray-500 mt-1">
                        {appointment.appointment_type}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <StatusBadge status={appointment.status as any} />
                  {appointment.appointment_id && (
                    <div className="text-xs text-gray-500 mt-1">
                      ID: {appointment.appointment_id}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Info and Enhanced Notes */}
            {(appointment.location || appointment.notes) && (
              <div className="space-y-3 mb-4">
                {appointment.location && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPinIcon className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{appointment.location}</span>
                  </div>
                )}
                {appointment.notes && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-amber-600 text-xs font-bold">!</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-amber-800 mb-1">Appointment Notes</h4>
                        <p className="text-amber-700 text-sm leading-relaxed whitespace-pre-line">{parseNotes(appointment.notes)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails?.(appointment)}
            className="flex items-center"
          >
            <EyeIcon className="w-4 h-4 mr-2" />
            View Details
          </Button>
          
          {canManage(appointment.status, appointment.appointment_date) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCancel?.(appointment)}
              className="text-red-600 hover:text-red-700"
              disabled={isLoading}
            >
              <XIcon className="w-4 h-4 mr-1" />
              Cancel
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Full variant for MyAppointments page
  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 ${className}`}>
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mr-4">
                <StethoscopeIcon className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {appointment.doctor_name}
                </h3>
                <p className="text-blue-600 font-medium">
                  {appointment.specialty}
                </p>
                {appointment.appointment_type && (
                  <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md mt-1">
                    {appointment.appointment_type}
                  </span>
                )}
              </div>
            </div>
            <StatusBadge status={appointment.status as any} />
          </div>

          {/* Date & Queue Number Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <CalendarIcon className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-800">Appointment Date</span>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {dateInfo.full}
              </div>
            </div>
            <div className={`rounded-lg p-4 ${appointment.status === 'completed' ? 'bg-gradient-to-r from-green-50 to-emerald-50' : 'bg-gradient-to-r from-purple-50 to-pink-50'}`}>
              <div className="flex items-center mb-2">
                {appointment.status === 'completed' ? (
                  <>
                    <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center mr-2">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-sm font-medium text-green-800">Status</span>
                  </>
                ) : (
                  <>
                    <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center mr-2">
                      <span className="text-white text-xs font-bold">Q</span>
                    </div>
                    <span className="text-sm font-medium text-purple-800">Queue Number</span>
                  </>
                )}
              </div>
              <div className="flex items-center">
                {appointment.status === 'completed' ? (
                  <div className="text-2xl font-bold text-green-600">
                    Appointment Complete
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-purple-600 mr-2">
                      {appointment.queue_number || 'N/A'}
                    </div>
                    {appointment.queue_position && (
                      <div className="text-sm text-gray-600">
                        (Position: {appointment.queue_position})
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Contact & Location Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {appointment.location && (
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <MapPinIcon className="w-5 h-5 text-gray-500 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-700">Location</div>
                  <div className="text-gray-900">{appointment.location}</div>
                </div>
              </div>
            )}
            {appointment.doctor_phone && (
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <PhoneIcon className="w-5 h-5 text-gray-500 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-700">Contact</div>
                  <div className="text-gray-900">{appointment.doctor_phone}</div>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Notes Section */}
          {appointment.notes && (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400 rounded-lg p-6 mb-4 shadow-sm">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-amber-800 mb-2">Important Notes</h4>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-amber-700 leading-relaxed whitespace-pre-line">{parseNotes(appointment.notes)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Appointment ID */}
          {appointment.appointment_id && (
            <div className="text-sm text-gray-500">
              Appointment ID: <span className="font-mono">{appointment.appointment_id}</span>
            </div>
          )}
        </div>

        {/* Action Panel */}
        <div className="lg:w-48 flex flex-col space-y-3">
          <Button
            variant="primary"
            onClick={() => onViewDetails?.(appointment)}
            className="w-full justify-center"
          >
            <EyeIcon className="w-4 h-4 mr-2" />
            View Details
          </Button>
          
          {canManage(appointment.status, appointment.appointment_date) && (
            <Button
              variant="outline"
              onClick={() => onCancel?.(appointment)}
              className="w-full justify-center text-red-600 hover:text-red-700"
              disabled={isLoading}
            >
              <XIcon className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          )}
          
          {appointment.status === 'completed' && (
            <Button
              variant="outline"
              className="w-full justify-center text-green-600 hover:text-green-700"
            >
              View Report
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;