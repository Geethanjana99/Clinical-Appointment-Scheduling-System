import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { HomeIcon, CalendarIcon, UserIcon, UsersIcon, FileTextIcon, UploadIcon, ClockIcon, ActivityIcon, Settings2Icon } from 'lucide-react';
const Sidebar = () => {
  const location = useLocation();
  const {
    user
  } = useAuthStore();  const isActive = (path: string) => {
    return location.pathname === path;
  };
  // Navigation items based on user role
  const getNavItems = () => {
    switch (user?.role) {      case 'patient':
        return [{
          name: 'Dashboard',
          path: '/patient',
          icon: <HomeIcon className="w-5 h-5" />
        }, {
          name: 'Book Appointment',
          path: '/patient/book-appointment',
          icon: <CalendarIcon className="w-5 h-5" />        }, {
          name: 'My Appointments',
          path: '/patient/my-appointments',
          icon: <CalendarIcon className="w-5 h-5" />
        }, {
          name: 'Medical Reports',
          path: '/patient/medical-reports',
          icon: <FileTextIcon className="w-5 h-5" />
        }, {
          name: 'View Queue',
          path: '/patient/queue',
          icon: <ClockIcon className="w-5 h-5" />
        }, {
          name: 'Health Predictions',
          path: '/patient/health-predictions',
          icon: <ActivityIcon className="w-5 h-5" />
        }];case 'doctor':
        return [{
          name: 'Dashboard',
          path: '/doctor',
          icon: <HomeIcon className="w-5 h-5" />
        }, {
          name: 'My Patients',
          path: '/doctor/patients',
          icon: <UsersIcon className="w-5 h-5" />
        }, {
          name: 'Appointments',
          path: '/doctor/appointments',
          icon: <CalendarIcon className="w-5 h-5" />
        }, {
          name: 'Manage Queue',
          path: '/doctor/queue',
          icon: <ClockIcon className="w-5 h-5" />        }, {
          name: 'AI Predictions',
          path: '/doctor/ai-predictions',
          icon: <ActivityIcon className="w-5 h-5" />
        }, {
          name: 'Availability',
          path: '/doctor/availability',
          icon: <CalendarIcon className="w-5 h-5" />
        }];case 'admin':
        return [{
          name: 'Dashboard',
          path: '/admin',
          icon: <HomeIcon className="w-5 h-5" />
        }, {
          name: 'Manage Patients',
          path: '/admin/patients',
          icon: <UsersIcon className="w-5 h-5" />
        }, {
          name: 'Manage Doctors',
          path: '/admin/doctors',
          icon: <UserIcon className="w-5 h-5" />
        }, {
          name: 'Appointments',
          path: '/admin/appointments',
          icon: <CalendarIcon className="w-5 h-5" />
        }, {
          name: 'Upload Reports',
          path: '/admin/reports',
          icon: <UploadIcon className="w-5 h-5" />        }];

      case 'nurse':
        return [{
          name: 'Dashboard',
          path: '/nurse',
          icon: <HomeIcon className="w-5 h-5" />
        }, {
          name: 'Patient Care',
          path: '/nurse/patients',
          icon: <UsersIcon className="w-5 h-5" />
        }, {
          name: 'Vitals & Records',
          path: '/nurse/vitals',
          icon: <ActivityIcon className="w-5 h-5" />
        }, {
          name: 'Medications',
          path: '/nurse/medications',
          icon: <FileTextIcon className="w-5 h-5" />
        }, {
          name: 'Schedule',
          path: '/nurse/schedule',
          icon: <CalendarIcon className="w-5 h-5" />
        }];

      default:
        return [];
    }
  };
  const navItems = getNavItems();
  return <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-gray-200">
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <span className="text-xl font-semibold text-blue-600">CareSync</span>
      </div>
      <div className="flex flex-col flex-grow p-4 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map(item => <Link key={item.path} to={item.path} className={`flex items-center px-4 py-3 text-sm font-medium rounded-md group ${isActive(item.path) ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>)}
        </div>
      </div>
      <div className="p-4 border-t border-gray-200">
        <Link to="/settings" className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
          <Settings2Icon className="w-5 h-5 mr-3" />
          Settings
        </Link>
      </div>
    </aside>;
};
export default Sidebar;