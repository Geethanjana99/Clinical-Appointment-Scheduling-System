import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { CalendarIcon, UserIcon, ClockIcon, CheckCircleIcon, StarIcon } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useQueueStore } from '../../store/queueStore';
import { toast } from 'sonner';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  availability: string;
  avatar: string;
  experience: string;
  consultationFee: string;
}

// Mock doctors data
const doctors: Doctor[] = [
  {
    id: 'doctor-1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiologist',
    rating: 4.8,
    availability: '9:00 AM - 5:00 PM',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    experience: '15 years',
    consultationFee: '$150'
  },
  {
    id: 'doctor-2',
    name: 'Dr. Michael Wong',
    specialty: 'Neurologist',
    rating: 4.7,
    availability: '8:00 AM - 4:00 PM',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    experience: '12 years',
    consultationFee: '$180'
  },
  {
    id: 'doctor-3',
    name: 'Dr. Emily Davis',
    specialty: 'Pediatrician',
    rating: 4.9,
    availability: '10:00 AM - 6:00 PM',
    avatar: 'https://randomuser.me/api/portraits/women/28.jpg',
    experience: '8 years',
    consultationFee: '$120'
  },
  {
    id: 'doctor-4',
    name: 'Dr. Robert Chen',
    specialty: 'Orthopedic Surgeon',
    rating: 4.6,
    availability: '7:00 AM - 3:00 PM',
    avatar: 'https://randomuser.me/api/portraits/men/35.jpg',
    experience: '20 years',
    consultationFee: '$200'
  }
];

// Available time slots
const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
];

const BookAppointment = () => {
  const { user } = useAuthStore();
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Select Doctor, 2: Select Date/Time, 3: Confirm

  // Get tomorrow's date as minimum date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Get max date (3 months from now)
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateString = maxDate.toISOString().split('T')[0];

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setStep(2);
  };

  const handleDateTimeSelect = () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select both date and time');
      return;
    }
    setStep(3);
  };

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !reason.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Here you would typically add to queue store or make an API call
      toast.success('Appointment booked successfully!');
      
      // Reset form
      setSelectedDoctor(null);
      setSelectedDate('');
      setSelectedTime('');
      setReason('');
      setNotes('');
      setStep(1);
    } catch (error) {
      toast.error('Failed to book appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
          <p className="text-gray-600 mt-1">Schedule your visit with our healthcare professionals</p>
        </div>
      </div>

      {/* Progress Indicator */}
      <Card>
        <div className="flex items-center justify-between p-4">
          <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}>
              1
            </div>
            <span className="ml-2 font-medium">Select Doctor</span>
          </div>
          <div className="flex-1 h-1 mx-4 bg-gray-200">
            <div className={`h-1 transition-all duration-300 ${
              step >= 2 ? 'bg-blue-600 w-1/2' : 'bg-gray-200 w-0'
            }`}></div>
          </div>
          <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}>
              2
            </div>
            <span className="ml-2 font-medium">Date & Time</span>
          </div>
          <div className="flex-1 h-1 mx-4 bg-gray-200">
            <div className={`h-1 transition-all duration-300 ${
              step >= 3 ? 'bg-blue-600 w-full' : 'bg-gray-200 w-0'
            }`}></div>
          </div>
          <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}>
              3
            </div>
            <span className="ml-2 font-medium">Confirm</span>
          </div>
        </div>
      </Card>

      {/* Step 1: Select Doctor */}
      {step === 1 && (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Doctor</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleDoctorSelect(doctor)}
                >
                  <div className="flex items-start space-x-4">
                    <img
                      src={doctor.avatar}
                      alt={doctor.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{doctor.name}</h3>
                      <p className="text-blue-600 text-sm">{doctor.specialty}</p>
                      <div className="flex items-center mt-1">
                        {renderStars(doctor.rating)}
                        <span className="ml-1 text-sm text-gray-600">({doctor.rating})</span>
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          {doctor.availability}
                        </div>
                        <div className="text-sm text-gray-600">
                          Experience: {doctor.experience}
                        </div>
                        <div className="text-sm font-medium text-green-600">
                          Consultation: {doctor.consultationFee}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button variant="primary" size="sm">
                      Select Doctor
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Step 2: Select Date and Time */}
      {step === 2 && selectedDoctor && (
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Select Date & Time</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep(1)}
              >
                Change Doctor
              </Button>
            </div>

            {/* Selected Doctor Summary */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedDoctor.avatar}
                  alt={selectedDoctor.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-medium text-gray-900">{selectedDoctor.name}</h3>
                  <p className="text-blue-600 text-sm">{selectedDoctor.specialty}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  min={minDate}
                  max={maxDateString}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Time
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-2 text-sm border rounded-md transition-colors ${
                        selectedTime === time
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Reason for Visit */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Visit *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select reason</option>
                <option value="routine-checkup">Routine Checkup</option>
                <option value="follow-up">Follow-up Consultation</option>
                <option value="new-symptoms">New Symptoms</option>
                <option value="medication-review">Medication Review</option>
                <option value="test-results">Test Results Discussion</option>
                <option value="emergency">Emergency</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button
                variant="primary"
                onClick={handleDateTimeSelect}
                disabled={!selectedDate || !selectedTime || !reason}
              >
                Continue
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && selectedDoctor && (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Confirm Your Appointment</h2>

            {/* Appointment Summary */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Doctor Information</h3>
                  <div className="flex items-center space-x-3 mb-4">
                    <img
                      src={selectedDoctor.avatar}
                      alt={selectedDoctor.name}
                      className="w-16 h-16 rounded-full"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">{selectedDoctor.name}</h4>
                      <p className="text-blue-600 text-sm">{selectedDoctor.specialty}</p>
                      <div className="flex items-center mt-1">
                        {renderStars(selectedDoctor.rating)}
                        <span className="ml-1 text-sm text-gray-600">({selectedDoctor.rating})</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Experience: {selectedDoctor.experience}</p>
                    <p className="font-medium text-green-600">Fee: {selectedDoctor.consultationFee}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Appointment Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <CalendarIcon className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-600">Date:</span>
                      <span className="ml-2 font-medium">{new Date(selectedDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <ClockIcon className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-600">Time:</span>
                      <span className="ml-2 font-medium">{selectedTime}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <UserIcon className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-600">Reason:</span>
                      <span className="ml-2 font-medium capitalize">{reason.replace('-', ' ')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any additional information you'd like to share with the doctor..."
              />
            </div>

            {/* Terms and Conditions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-blue-900 mb-2">Important Information</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Please arrive 15 minutes before your appointment time</li>
                <li>• Bring a valid ID and insurance card if applicable</li>
                <li>• Cancellations must be made at least 24 hours in advance</li>
                <li>• Late arrivals may result in appointment rescheduling</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button
                variant="primary"
                onClick={handleBookAppointment}
                disabled={isSubmitting}
                className="min-w-[140px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Booking...
                  </div>
                ) : (
                  <>
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    Book Appointment
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default BookAppointment;