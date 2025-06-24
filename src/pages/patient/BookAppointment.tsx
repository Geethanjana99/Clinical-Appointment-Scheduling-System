import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { CalendarIcon, UserIcon, ClockIcon, CheckCircleIcon, StarIcon, SearchIcon, FilterIcon } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '../../services/api';

interface Doctor {
  id: string;
  doctor_id: string;
  name: string;
  specialty: string;
  rating: number;
  total_reviews: number;
  consultation_fee: number;
  availability_status: string;
  avatar_url?: string;
  years_of_experience: number;
  bio?: string;
  working_hours?: any;
  email: string;
  phone: string;
}

// Mock doctors data
// Note: timeSlots are now fetched dynamically from the backend

const BookAppointment = () => {
  // State for doctors and booking
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  
  // Booking state
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Available slots state
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [step, setStep] = useState(1); // 1: Select Doctor, 2: Select Date/Time, 3: Confirm
  
  // Success state
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState<any>(null);

  // Fetch doctors from backend
  useEffect(() => {
    fetchDoctors();
  }, []);

  // Filter doctors based on search and specialty
  useEffect(() => {
    let filtered = doctors;
    
    if (searchTerm) {
      filtered = filtered.filter(doctor => 
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedSpecialty) {
      filtered = filtered.filter(doctor => doctor.specialty === selectedSpecialty);
    }
    
    setFilteredDoctors(filtered);
  }, [doctors, searchTerm, selectedSpecialty]);

  // Fetch available slots when doctor or date changes
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchAvailableSlots(selectedDoctor.id, selectedDate);
    } else {
      setAvailableSlots([]);
      setSelectedTime('');
    }
  }, [selectedDoctor, selectedDate]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await apiService.searchDoctors({});
      
      if (response.success && response.data) {
        setDoctors(response.data);
        setFilteredDoctors(response.data);
        
        // Extract unique specialties
        const uniqueSpecialties = [...new Set(response.data.map((doctor: Doctor) => doctor.specialty))];
        setSpecialties(uniqueSpecialties);
      } else {
        setError('Failed to load doctors');
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  // Fetch available time slots for selected doctor and date
  const fetchAvailableSlots = async (doctorId: string, date: string) => {
    if (!doctorId || !date) {
      setAvailableSlots([]);
      return;
    }

    try {
      setLoadingSlots(true);
      setSlotsError(null);
      setSelectedTime(''); // Reset selected time when fetching new slots
      
      const response = await apiService.getAvailableSlots(doctorId, date);      if (response.success && response.data) {
        setAvailableSlots(response.data.slots || []);
      } else {
        setAvailableSlots([]);
        setSlotsError('No available slots found for this date');
      }
    } catch (err) {
      console.error('Error fetching available slots:', err);
      setAvailableSlots([]);
      setSlotsError('Failed to load available slots');
    } finally {
      setLoadingSlots(false);
    }
  };

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
    // Hide success banner when starting new booking
    if (bookingSuccess) {
      setBookingSuccess(false);
      setBookedAppointment(null);
    }
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

    try {      const appointmentData = {
        doctorId: selectedDoctor.id,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        appointmentType: 'consultation',
        reasonForVisit: reason,
        symptoms: notes,
        priority: 'medium'
      };      const response = await apiService.bookAppointment(appointmentData);
      
      if (response.success) {
        // Store appointment data with doctor info before resetting
        const appointmentWithDoctorInfo = {
          ...response.data.appointment,
          doctorName: selectedDoctor.name,
          doctorSpecialty: selectedDoctor.specialty
        };
        
        setBookedAppointment(appointmentWithDoctorInfo);
        setBookingSuccess(true);
        
        // Show success toast message
        toast.success(`🎉 Booking Successful! Appointment confirmed with ${selectedDoctor.name}`, {
          duration: 4000
        });
        
        // Reset form
        setSelectedDoctor(null);
        setSelectedDate('');
        setSelectedTime('');
        setReason('');
        setNotes('');
        setStep(1);
        
        // Reset success state after a delay
        setTimeout(() => {
          setBookingSuccess(false);
          setBookedAppointment(null);
        }, 8000);
      } else {
        toast.error(response.message || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
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
    <div className="space-y-6">      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
          <p className="text-gray-600 mt-1">Schedule your visit with our healthcare professionals</p>
        </div>
      </div>

      {/* Success Banner */}
      {bookingSuccess && bookedAppointment && (
        <Card>
          <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  🎉 Booking Successful!
                </h3>                <div className="text-green-700 space-y-1">
                  <p><strong>Appointment ID:</strong> {bookedAppointment.appointment_id}</p>
                  <p><strong>Doctor:</strong> {bookedAppointment.doctorName} ({bookedAppointment.doctorSpecialty})</p>
                  <p><strong>Date:</strong> {new Date(bookedAppointment.appointment_date).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {bookedAppointment.appointment_time}</p>
                  <p><strong>Status:</strong> {bookedAppointment.status}</p>
                </div><div className="mt-3 text-sm text-green-600">
                  <p>You will receive a confirmation shortly. Please arrive 15 minutes before your appointment.</p>
                </div>
                <div className="mt-4">
                  <Button
                    onClick={() => {
                      setBookingSuccess(false);
                      setBookedAppointment(null);
                      setStep(1);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Book Another Appointment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

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
      </Card>      {/* Step 1: Select Doctor */}
      {step === 1 && (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Choose Your Doctor</h2>
            
            {/* Search and Filter Controls */}
            <div className="mb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">                {/* Search Bar */}
                <div className="relative">
                  <label htmlFor="doctor-search" className="sr-only">Search doctors</label>
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="doctor-search"
                    type="text"
                    placeholder="Search doctors by name or specialty..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                {/* Specialty Filter */}
                <div className="relative">
                  <label htmlFor="specialty-filter" className="sr-only">Filter by specialty</label>
                  <FilterIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    id="specialty-filter"
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  >
                    <option value="">All Specialties</option>
                    {specialties.map((specialty) => (
                      <option key={specialty} value={specialty}>
                        {specialty}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                <span className="ml-2 text-gray-600">Loading doctors...</span>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="text-center py-12">
                <div className="text-red-600 mb-4">{error}</div>
                <Button onClick={fetchDoctors} variant="outline">
                  Try Again
                </Button>
              </div>
            )}

            {/* No Results */}
            {!loading && !error && filteredDoctors.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-600 mb-4">No doctors found matching your criteria.</div>
                <Button onClick={() => { setSearchTerm(''); setSelectedSpecialty(''); }} variant="outline">
                  Clear Filters
                </Button>
              </div>
            )}

            {/* Doctor Cards */}
            {!loading && !error && filteredDoctors.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleDoctorSelect(doctor)}
                >
                  <div className="flex items-start space-x-4">
                    <img
                      src={doctor.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=0D8ABC&color=fff`}
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
                          <span className={`px-2 py-1 rounded text-xs ${
                          doctor.availability_status === 'available' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {doctor.availability_status}
                        </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {doctor.years_of_experience} years
                        </div>
                        <div className="text-sm font-medium text-green-600">
                          Rs. {doctor.consultation_fee}
                        </div>
                      </div>
                    </div>
                  </div>                  <div className="mt-4 flex justify-end">
                    <Button variant="primary" size="sm">
                      Select Doctor
                    </Button>
                  </div>
                </div>
              ))}
              </div>
            )}
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
              <div className="flex items-center space-x-3">                <img
                  src={selectedDoctor.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedDoctor.name)}&background=0D8ABC&color=fff`}
                  alt={selectedDoctor.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-medium text-gray-900">{selectedDoctor.name}</h3>
                  <p className="text-blue-600 text-sm">{selectedDoctor.specialty}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">              {/* Date Selection */}
              <div>
                <label htmlFor="appointment-date" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  id="appointment-date"
                  type="date"
                  min={minDate}
                  max={maxDateString}
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    fetchAvailableSlots(selectedDoctor.id, e.target.value); // Fetch slots when date changes
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Time
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {loadingSlots ? (
                    <div className="flex justify-center items-center col-span-2 py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                      <span className="ml-2 text-gray-600">Loading slots...</span>
                    </div>
                  ) : slotsError ? (
                    <div className="text-red-600 text-center py-4 col-span-2">
                      {slotsError}
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="text-gray-500 text-center py-4 col-span-2">
                      Please select a doctor and date first
                    </div>
                  ) : (
                    availableSlots.map((time) => (
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
                    ))
                  )}
                </div>
              </div>
            </div>{/* Reason for Visit */}
            <div className="mt-6">
              <label htmlFor="visit-reason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Visit *
              </label>
              <select
                id="visit-reason"
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
                  <div className="flex items-center space-x-3 mb-4">                    <img
                      src={selectedDoctor.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedDoctor.name)}&background=0D8ABC&color=fff`}
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
                  <div className="text-sm text-gray-600 space-y-1">                    <p>Experience: {selectedDoctor.years_of_experience} years</p>
                    <p className="font-medium text-green-600">Fee: Rs. {selectedDoctor.consultation_fee}</p>
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