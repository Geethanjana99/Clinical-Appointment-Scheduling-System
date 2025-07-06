import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, UserRole } from '../../store/authStore';
import Button from '../../components/ui/Button';
import { UserIcon, MailIcon, LockIcon, ArrowLeftIcon, PhoneIcon } from 'lucide-react';
import bg2 from '../../images/bg2.jpg';

const Register = () => {
  const navigate = useNavigate();
  const {
    register,
    isAuthenticated,
    user,
    clearError,
    initializeAuth
  } = useAuthStore();

  // Basic form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('patient');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Patient-specific fields
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [address, setAddress] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [occupation, setOccupation] = useState('');
  const [maritalStatus, setMaritalStatus] = useState<'single' | 'married' | 'divorced' | 'widowed'>('single');
  const [preferredLanguage, setPreferredLanguage] = useState('English');
  
  // Doctor-specific fields
  const [specialty, setSpecialty] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [education, setEducation] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');
  const [bio, setBio] = useState('');

  // Initialize authentication on component mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Basic validation
      if (!name || !email || !password || !confirmPassword) {
        setError('Please fill in all required fields');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address');
        return;
      }

      // Phone validation (optional but if provided must be valid)
      if (phone) {
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
          setError('Phone number must be exactly 10 digits');
          return;
        }
      }

      // Build registration data
      const registrationData: any = {
        name,
        email,
        password,
        role,
        phone: phone || undefined,
      };

      // Add patient-specific data if registering as patient
      if (role === 'patient') {
        registrationData.patientData = {
          date_of_birth: dateOfBirth || undefined,
          gender: gender || undefined,
          address: address || undefined,
          emergency_contact_name: emergencyContactName || undefined,
          emergency_contact_phone: emergencyContactPhone || undefined,
          blood_type: bloodType || undefined,
          occupation: occupation || undefined,
          marital_status: maritalStatus || undefined,
          preferred_language: preferredLanguage || 'English',
        };
      }

      // Add doctor-specific data if registering as doctor
      if (role === 'doctor') {
        if (!specialty || !licenseNumber) {
          setError('Please fill in all required doctor fields (Specialty and License Number)');
          return;
        }

        registrationData.doctorData = {
          specialty: specialty,
          license_number: licenseNumber,
          years_of_experience: experienceYears ? parseInt(experienceYears) : undefined,
          education: education || undefined,
          consultation_fee: consultationFee ? parseFloat(consultationFee) : undefined,
          office_address: officeAddress || undefined,
          bio: bio || undefined,
        };
      }

      console.log('Attempting registration with:', registrationData);
      await register(name, email, password, role, registrationData);
      console.log('Registration successful, redirecting to login...');
      
      // After successful registration, redirect to login page
      navigate('/login', { 
        state: { 
          message: 'Registration successful! Please login to continue.',
          email: email 
        } 
      });
    } catch (err) {
      console.error('Registration error details:', err);
      // Display the actual error message from the backend if available
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bg2})` }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      
      <div className="max-w-4xl w-full space-y-8 relative z-10">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white drop-shadow-lg">
            Create an account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-200 drop-shadow">
            Join CareSync Healthcare Management System
          </p>
        </div>
        
        <div className="bg-white bg-opacity-95 backdrop-blur-sm py-8 px-6 shadow-xl sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}
            
            {/* Basic Information - 2 Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MailIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Create a secure password"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 8 characters long
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password *
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number (Optional)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="0771234567"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Enter 10-digit Sri Lankan phone number starting with 0 (e.g., 0771234567)
                </p>
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Register as
                </label>
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={e => setRole(e.target.value as UserRole)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="admin">Admin Staff</option>
                  <option value="billing">Billing Staff</option>
                </select>
              </div>
            </div>

            {/* Patient Specific Fields */}
            {role === 'patient' && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
                  Patient Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                      Date of Birth
                    </label>
                    <input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={dateOfBirth}
                      onChange={e => setDateOfBirth(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                      Gender
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={gender}
                      onChange={e => setGender(e.target.value as 'male' | 'female' | 'other')}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700">
                      Blood Type
                    </label>
                    <select
                      id="bloodType"
                      name="bloodType"
                      value={bloodType}
                      onChange={e => setBloodType(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Select Blood Type</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-700">
                      Marital Status
                    </label>
                    <select
                      id="maritalStatus"
                      name="maritalStatus"
                      value={maritalStatus}
                      onChange={e => setMaritalStatus(e.target.value as 'single' | 'married' | 'divorced' | 'widowed')}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="divorced">Divorced</option>
                      <option value="widowed">Widowed</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="occupation" className="block text-sm font-medium text-gray-700">
                      Occupation
                    </label>
                    <input
                      id="occupation"
                      name="occupation"
                      type="text"
                      value={occupation}
                      onChange={e => setOccupation(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Your occupation"
                    />
                  </div>

                  <div>
                    <label htmlFor="preferredLanguage" className="block text-sm font-medium text-gray-700">
                      Preferred Language
                    </label>
                    <input
                      id="preferredLanguage"
                      name="preferredLanguage"
                      type="text"
                      value={preferredLanguage}
                      onChange={e => setPreferredLanguage(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="e.g., English, Sinhala, Tamil"
                    />
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="emergencyContactName" className="block text-sm font-medium text-gray-700">
                      Emergency Contact Name
                    </label>
                    <input
                      id="emergencyContactName"
                      name="emergencyContactName"
                      type="text"
                      value={emergencyContactName}
                      onChange={e => setEmergencyContactName(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Emergency contact full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-gray-700">
                      Emergency Contact Phone
                    </label>
                    <input
                      id="emergencyContactPhone"
                      name="emergencyContactPhone"
                      type="tel"
                      value={emergencyContactPhone}
                      onChange={e => setEmergencyContactPhone(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="0771234567"
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    rows={3}
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Your complete address"
                  />
                </div>
              </div>
            )}

            {/* Doctor Specific Fields */}
            {role === 'doctor' && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
                  Professional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">
                      Specialty *
                    </label>
                    <input
                      id="specialty"
                      name="specialty"
                      type="text"
                      value={specialty}
                      onChange={e => setSpecialty(e.target.value)}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="e.g., Cardiology, Pediatrics"
                    />
                  </div>

                  <div>
                    <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
                      Medical License Number *
                    </label>
                    <input
                      id="licenseNumber"
                      name="licenseNumber"
                      type="text"
                      value={licenseNumber}
                      onChange={e => setLicenseNumber(e.target.value)}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Medical License Number"
                    />
                  </div>

                  <div>
                    <label htmlFor="experienceYears" className="block text-sm font-medium text-gray-700">
                      Years of Experience
                    </label>
                    <input
                      id="experienceYears"
                      name="experienceYears"
                      type="number"
                      min="0"
                      value={experienceYears}
                      onChange={e => setExperienceYears(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Years of practice"
                    />
                  </div>

                  <div>
                    <label htmlFor="consultationFee" className="block text-sm font-medium text-gray-700">
                      Consultation Fee (Optional)
                    </label>
                    <input
                      id="consultationFee"
                      name="consultationFee"
                      type="number"
                      min="0"
                      step="0.01"
                      value={consultationFee}
                      onChange={e => setConsultationFee(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="e.g., 5000.00"
                    />
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="education" className="block text-sm font-medium text-gray-700">
                      Education
                    </label>
                    <textarea
                      id="education"
                      name="education"
                      rows={3}
                      value={education}
                      onChange={e => setEducation(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Educational background, degrees, etc."
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="officeAddress" className="block text-sm font-medium text-gray-700">
                      Office Address
                    </label>
                    <textarea
                      id="officeAddress"
                      name="officeAddress"
                      rows={3}
                      value={officeAddress}
                      onChange={e => setOfficeAddress(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Clinic/Hospital address"
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                    Professional Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Brief professional biography and areas of expertise"
                  />
                </div>
              </div>
            )}

            <div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full flex justify-center"
              >
                Register
              </Button>
            </div>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Already have an account?
                </span>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={() => navigate('/login')}
                className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
