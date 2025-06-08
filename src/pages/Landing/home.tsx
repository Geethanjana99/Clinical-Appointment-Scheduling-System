import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRightIcon, 
  CalendarIcon, 
  UsersIcon, 
  BarChartIcon, 
  ShieldCheckIcon,
  PhoneIcon,
  MailIcon,
  ClockIcon,
  CheckIcon,
  MenuIcon,
  XIcon,
  HeartIcon,
  UserIcon,
  StethoscopeIcon,
  CreditCardIcon,
  SettingsIcon,
  TrendingUpIcon,
  SunIcon,
  MoonIcon
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { useDarkMode } from '../../contexts/DarkModeContext';
import styles from './home.module.css';

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const services = [
    {
      icon: UserIcon,
      title: 'Patient Management',
      description: 'Complete patient record management, appointment scheduling, and medical history tracking.',
      features: ['Digital Health Records', 'Appointment Booking', 'Medical History']
    },
    {
      icon: StethoscopeIcon,
      title: 'Doctor Portal',
      description: 'Efficient tools for healthcare providers to manage patients and clinical workflows.',
      features: ['Schedule Management', 'Patient Records', 'Prescription Management']
    },
    {
      icon: CreditCardIcon,
      title: 'Billing Management',
      description: 'Comprehensive billing and payment processing with insurance integration.',
      features: ['Automated Billing', 'Insurance Processing', 'Payment Tracking']
    },
    {
      icon: BarChartIcon,
      title: 'Analytics & Reports',
      description: 'Comprehensive reporting and analytics for informed decision-making.',
      features: ['Performance Metrics', 'Financial Reports', 'Operational Insights']
    },
    {
      icon: ShieldCheckIcon,
      title: 'Security & Compliance',
      description: 'HIPAA-compliant security measures to protect sensitive patient information.',
      features: ['Data Encryption', 'Access Controls', 'Audit Trails']
    },
    {
      icon: HeartIcon,
      title: '24/7 Support',
      description: 'Round-the-clock technical support and system maintenance for uninterrupted service.',
      features: ['Live Chat Support', 'System Monitoring', 'Regular Updates']
    },
  ];

  const features = [
    {
      icon: CalendarIcon,
      title: 'Smart Scheduling',
      description: 'Intelligent appointment scheduling with queue management and real-time updates.',
    },
    {
      icon: UsersIcon,
      title: 'Multi-Role Support',
      description: 'Dedicated interfaces for patients, doctors, admin staff, and billing staff.',
    },
    {
      icon: TrendingUpIcon,
      title: 'AI-Powered Insights',
      description: 'Advanced analytics and predictive insights for better healthcare outcomes.',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure & Compliant',
      description: 'HIPAA-compliant security measures to protect patient data.',
    },
  ];

  const benefits = [
    {
      title: 'Integrated Platform',
      description: 'All your healthcare management needs in one unified system.'
    },
    {
      title: 'User-Friendly Interface',
      description: 'Intuitive design that requires minimal training for staff and patients.'
    },
    {
      title: 'Scalable Solution',
      description: 'Grows with your practice, from small clinics to large hospital systems.'
    }
  ];
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Navigation Bar */}
      <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrollY > 100 ? 'bg-white dark:bg-gray-900 shadow-xl' : 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 text-white rounded-lg p-2">
                <HeartIcon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">CareSync</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Healthcare Management</p>
              </div>
            </div>
              {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <a href="#services" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 px-3 py-2">
                Services
              </a>
              <a href="#about" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 px-3 py-2">
                About
              </a>
              <a href="#contact" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 px-3 py-2">
                Contact
              </a>
              
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
              </button>
              
              <Link to="/login">
                <Button variant="outline" className="ml-4">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary">
                  Get Started
                </Button>
              </Link>
            </div>
              {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              {/* Mobile Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
              </button>
              
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
              >
                {isMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
              </button>
            </div>
          </div>
            {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <div className="px-4 py-4 space-y-3">
                <a href="#services" className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 py-2">
                  Services
                </a>
                <a href="#about" className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 py-2">
                  About
                </a>
                <a href="#contact" className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 py-2">
                  Contact
                </a>
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                  <Link to="/login" className="block w-full">
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register" className="block w-full">
                    <Button variant="primary" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>      {/* Hero Section */}
      <section 
        className={`relative min-h-screen flex items-center justify-center text-white pt-16 ${styles.heroSection}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Comprehensive Healthcare
              <span className="text-blue-300"> Management System</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed">
              Streamline your healthcare operations with our integrated platform. 
              Easy access for patients, doctors, billing staff, and administrators.
            </p>
            
            {/* Key Benefits */}
            <div className="grid md:grid-cols-2 gap-6 mb-10 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-left">
                <UserIcon className="text-blue-300 h-8 w-8 mb-2" />
                <h4 className="font-semibold mb-1">For Patients</h4>
                <p className="text-sm text-blue-200">Book appointments, view medical records, and manage your healthcare journey.</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-left">
                <StethoscopeIcon className="text-blue-300 h-8 w-8 mb-2" />
                <h4 className="font-semibold mb-1">For Healthcare Providers</h4>
                <p className="text-sm text-blue-200">Manage schedules, patient records, and streamline clinical workflows.</p>
              </div>
            </div>            {/* Call-to-Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link to="/login" className="w-full sm:w-auto">
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="w-full bg-white text-blue-700 hover:bg-blue-50 hover:scale-105 transform transition-all duration-300 shadow-xl border-2 border-white font-semibold"
                >
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  Book Your Appointment
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="w-full bg-white text-blue-700 hover:bg-blue-50 hover:scale-105 transform transition-all duration-300 shadow-xl border-2 border-white font-semibold"
                >
                  Healthcare Provider Login
                </Button>
              </Link>
            </div>
            
            {/* Quick Access Info */}
            <div className="text-center">
              <p className="text-blue-200 mb-4">Quick Access For:</p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <span className="bg-white/20 px-3 py-1 rounded-full flex items-center">
                  <UserIcon className="mr-1 h-4 w-4" />Patients
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-full flex items-center">
                  <StethoscopeIcon className="mr-1 h-4 w-4" />Doctors
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-full flex items-center">
                  <CreditCardIcon className="mr-1 h-4 w-4" />Billing Staff
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-full flex items-center">
                  <SettingsIcon className="mr-1 h-4 w-4" />Administrators
                </span>
              </div>
            </div>
          </div>
        </div>
          {/* Scroll Down Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <a href="#features" className="text-white hover:text-blue-300 transition-colors duration-300" title="Scroll to features">
            <ArrowRightIcon className="h-6 w-6 rotate-90" />
          </a>
        </div>
      </section>      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Manage Your Clinic
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              From appointment booking to billing management, we've got you covered with cutting-edge technology.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="text-center p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 dark:border-gray-700"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-xl mb-6">
                  <feature.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Healthcare Services
            </h3>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Comprehensive digital solutions designed to enhance patient care and streamline healthcare operations.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div 
                key={index} 
                className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 w-16 h-16 flex items-center justify-center mb-4">
                  <service.icon className="text-blue-600 dark:text-blue-400 h-8 w-8" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{service.title}</h4>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{service.description}</p>
                <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <CheckIcon className="text-green-500 mr-2 h-4 w-4" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>      {/* About Section */}
      <section id="about" className="py-20 bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
                Why Choose CareSync?
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 transition-colors duration-300">
                Our healthcare management system is designed with the needs of modern medical practices in mind. 
                We provide a comprehensive, user-friendly platform that enhances patient care while streamlining operations.
              </p>
              
              <div className="space-y-4 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="bg-green-500 dark:bg-green-600 text-white rounded-full p-2 mt-1 transition-colors duration-300">
                      <CheckIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-white transition-colors duration-300">{benefit.title}</h5>
                      <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Link to="/register">
                <Button 
                  variant="primary" 
                  size="lg"
                  className="hover:scale-105 transform transition-all duration-300"
                >
                  <ArrowRightIcon className="mr-2 h-5 w-5" />
                  Get Started Today
                </Button>
              </Link>
            </div>
              <div className="lg:order-first">
              <div className="bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-800 rounded-xl p-8 text-center transition-colors duration-300">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 text-center shadow-sm transition-colors duration-300">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">10,000+</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Appointments</div>
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 text-center shadow-sm transition-colors duration-300">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">500+</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Healthcare Providers</div>
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 text-center shadow-sm transition-colors duration-300">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">99.9%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Uptime</div>
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 text-center shadow-sm transition-colors duration-300">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">24/7</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>      {/* Contact Section */}
      <section id="contact" className="py-20 bg-blue-50 dark:bg-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
            Ready to Transform Your Healthcare Operations?
          </h3>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto transition-colors duration-300">
            Join thousands of healthcare providers who trust CareSync to manage their operations efficiently and securely.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link to="/register" className="w-full sm:w-auto">
              <Button 
                variant="primary" 
                size="lg"
                className="w-full hover:scale-105 transform transition-all duration-300"
              >
                <ArrowRightIcon className="mr-2 h-5 w-5" />
                Start Your Free Trial
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="lg"
                className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-gray-900 hover:scale-105 transform transition-all duration-300"
              >
                <PhoneIcon className="mr-2 h-5 w-5" />
                Schedule a Demo
              </Button>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-600 transition-colors duration-300">
              <MailIcon className="text-blue-600 dark:text-blue-400 h-8 w-8 mx-auto mb-3 transition-colors duration-300" />
              <h5 className="font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Email Support</h5>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">support@caresync.com</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-600 transition-colors duration-300">
              <PhoneIcon className="text-blue-600 dark:text-blue-400 h-8 w-8 mx-auto mb-3 transition-colors duration-300" />
              <h5 className="font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Phone Support</h5>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">+1 (800) 123-CARE</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-600 transition-colors duration-300">
              <ClockIcon className="text-blue-600 dark:text-blue-400 h-8 w-8 mx-auto mb-3 transition-colors duration-300" />
              <h5 className="font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Available</h5>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">24/7 Support</p>
            </div>
          </div>
        </div>
      </section>      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-blue-600 dark:bg-blue-500 text-white rounded-lg p-2 transition-colors duration-300">
                  <HeartIcon className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">CareSync</h4>
                  <p className="text-gray-300 dark:text-gray-400 text-sm transition-colors duration-300">Healthcare Management System</p>
                </div>
              </div>
              <p className="text-gray-300 dark:text-gray-400 mb-4 max-w-md transition-colors duration-300">
                Empowering healthcare providers with comprehensive digital solutions for better patient care and operational efficiency.
              </p>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4 text-white">Quick Links</h5>
              <ul className="space-y-2">
                <li><a href="#services" className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors duration-300">Services</a></li>
                <li><a href="#about" className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors duration-300">About Us</a></li>
                <li><Link to="/login" className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors duration-300">Patient Portal</Link></li>
                <li><Link to="/login" className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors duration-300">Doctor Login</Link></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4 text-white">Support</h5>
              <ul className="space-y-2">
                <li><a href="#contact" className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors duration-300">Contact Us</a></li>
                <li><a href="#" className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors duration-300">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors duration-300">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-600 dark:border-gray-700 mt-8 pt-8 text-center transition-colors duration-300">
            <p className="text-gray-300 dark:text-gray-400 transition-colors duration-300">
              © 2025 CareSync Healthcare Management System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
