import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, UserRole } from '../../store/authStore';
import Button from '../../components/ui/Button';
import { UserIcon, MailIcon, LockIcon, ArrowLeftIcon, PhoneIcon } from 'lucide-react';
import bg2 from '../../images/bg2.jpg';
const Register = () => {
  const navigate = useNavigate();  const {
    register,
    isAuthenticated,
    user,
    isLoading: authLoading,
    error: authError,
    clearError,
    initializeAuth,
    logout
  } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('patient');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Additional fields for doctor registration
  const [specialization, setSpecialization] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [department, setDepartment] = useState('');

  // Initialize authentication on component mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);  // Redirect if already authenticated
  useEffect(() => {
    console.log('Register useEffect triggered:', {
      isAuthenticated,
      userExists: !!user,
      userRole: user?.role,
      isLoading: authLoading
    });
    
    // Only redirect if user is authenticated, not loading, and has a valid role
    if (isAuthenticated && user && user.role && !authLoading) {
      console.log('User already authenticated, redirecting to dashboard');
      // Create proper redirect path based on user role
      const validRoles = ['patient', 'doctor', 'admin', 'billing'];
      if (validRoles.includes(user.role)) {
        const redirectPath = `/${user.role}`;
        navigate(redirectPath);
      } else {
        console.warn('Invalid user role detected:', user.role);
        // Clear invalid auth state
        logout();
      }
    }
  }, [isAuthenticated, user, navigate, authLoading]);

  // Handle auth errors
  useEffect(() => {
    if (authError) {
      setError(authError);
      clearError();
    }
  }, [authError, clearError]);  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }    // Check password complexity (matches backend validation)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
      return;
    }    // Validate phone number format if provided (Sri Lankan format: 0771234567)
    if (phone && !/^0\d{9}$/.test(phone)) {
      setError('Please enter a valid Sri Lankan phone number (10 digits starting with 0)');
      return;
    }

    try {
      setIsLoading(true);
      
      const additionalData: any = {
        phone: phone || undefined,
      };

      // Add doctor-specific data if registering as doctor
      if (role === 'doctor') {
        if (!specialization || !licenseNumber) {
          setError('Please fill in all required doctor fields');
          return;
        }        additionalData.profileData = {
          specialty: specialization, // Changed from specialization to specialty
          license_number: licenseNumber,
          experience_years: experienceYears ? parseInt(experienceYears) : undefined,
          department: department || undefined,
        };      }      console.log('Attempting registration with:', { name, email, role, phone: phone || 'none' });
      await register(name, email, password, role, additionalData);
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
      setError(errorMessage);    } finally {
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
            {error && <div className="rounded-md bg-red-50 p-4 col-span-2">
                <div className="text-sm text-red-700">{error}</div>
              </div>}
            
            {/* Basic Information - 2 Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input id="name" name="name" type="text" autoComplete="name" value={name} onChange={e => setName(e.target.value)} required className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="John Smith" />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MailIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input id="email" name="email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="email@example.com" />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input id="password" name="password" type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} required className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="••••••••" />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 8 characters with uppercase, lowercase, number, and special character
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="••••••••" />
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
                  <input id="phone" name="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="0771234567" />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Enter 10-digit Sri Lankan phone number starting with 0 (e.g., 0771234567)
                </p>
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Register as
                </label>
                <select id="role" name="role" value={role} onChange={e => setRole(e.target.value as UserRole)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="admin">Admin Staff</option>
                  <option value="billing">Billing Staff</option>
                </select>
              </div>
            </div>

            {/* Doctor Specific Fields */}
            {role === 'doctor' && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
                  Professional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
                      Specialization *
                    </label>
                    <input
                      id="specialization"
                      name="specialization"
                      type="text"
                      value={specialization}
                      onChange={e => setSpecialization(e.target.value)}
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
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                      Department
                    </label>
                    <input
                      id="department"
                      name="department"
                      type="text"
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Department/Unit"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full flex justify-center">
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
              <button onClick={() => navigate('/login')} className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to Login
              </button>
            </div>          </div>
        </div>
      </div>
    </div>
  );
};
export default Register;