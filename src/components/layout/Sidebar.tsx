import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { UserIcon, CalendarIcon, ClipboardIcon, FileTextIcon, BarChartIcon, UsersIcon, HeartPulseIcon, ActivityIcon, FileUpIcon, CreditCardIcon, SettingsIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    user
  } = useAuthStore();
  const location = useLocation();
  const getNavItems = () => {
    switch (user?.role) {
      case 'patient':
        return [{
          name: 'Dashboard',
          icon: <ActivityIcon />,
          path: '/dashboard/patient'
        }, {
          name: 'Appointments',
          icon: <CalendarIcon />,
          path: '/dashboard/patient/appointments'
        }, {
          name: 'My Reports',
          icon: <FileTextIcon />,
          path: '/dashboard/patient/reports'
        }, {
          name: 'Upload Reports',
          icon: <FileUpIcon />,
          path: '/dashboard/patient/upload'
        }, {
          name: 'Health Predictions',
          icon: <HeartPulseIcon />,
          path: '/dashboard/patient/predictions'
        }];
      case 'doctor':
        return [{
          name: 'Dashboard',
          icon: <ActivityIcon />,
          path: '/dashboard/doctor'
        }, {
          name: 'Appointments',
          icon: <CalendarIcon />,
          path: '/dashboard/doctor/appointments'
        }, {
          name: 'Patients',
          icon: <UsersIcon />,
          path: '/dashboard/doctor/patients'
        }, {
          name: 'AI Predictions',
          icon: <HeartPulseIcon />,
          path: '/dashboard/doctor/predictions'
        }];
      case 'data-entry':
        return [{
          name: 'Dashboard',
          icon: <ActivityIcon />,
          path: '/dashboard/data-entry'
        }, {
          name: 'Patients',
          icon: <UsersIcon />,
          path: '/dashboard/data-entry/patients'
        }, {
          name: 'Doctors',
          icon: <UserIcon />,
          path: '/dashboard/data-entry/doctors'
        }, {
          name: 'Appointments',
          icon: <CalendarIcon />,
          path: '/dashboard/data-entry/appointments'
        }, {
          name: 'Reports',
          icon: <FileUpIcon />,
          path: '/dashboard/data-entry/reports'
        }];
      case 'billing':
        return [{
          name: 'Dashboard',
          icon: <ActivityIcon />,
          path: '/dashboard/billing'
        }, {
          name: 'Invoices',
          icon: <FileTextIcon />,
          path: '/dashboard/billing/invoices'
        }, {
          name: 'Payments',
          icon: <CreditCardIcon />,
          path: '/dashboard/billing/payments'
        }, {
          name: 'Reports',
          icon: <BarChartIcon />,
          path: '/dashboard/billing/reports'
        }];
      case 'manager':
        return [{
          name: 'Dashboard',
          icon: <ActivityIcon />,
          path: '/dashboard/manager'
        }, {
          name: 'Staff',
          icon: <UsersIcon />,
          path: '/dashboard/manager/staff'
        }, {
          name: 'Operations',
          icon: <ClipboardIcon />,
          path: '/dashboard/manager/operations'
        }, {
          name: 'Financial',
          icon: <BarChartIcon />,
          path: '/dashboard/manager/financial'
        }, {
          name: 'Reports',
          icon: <FileTextIcon />,
          path: '/dashboard/manager/reports'
        }, {
          name: 'Settings',
          icon: <SettingsIcon />,
          path: '/dashboard/manager/settings'
        }];
      default:
        return [];
    }
  };
  const navItems = getNavItems();
  return <aside className={`bg-white shadow-sm transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} h-full`}>
      <div className="h-16 flex items-center justify-between px-4 border-b">
        <div className={`flex items-center ${collapsed ? 'justify-center w-full' : ''}`}>
          {!collapsed && <span className="text-blue-600 font-bold text-lg">
              MediSchedule
            </span>}
          {collapsed && <HeartPulseIcon className="h-6 w-6 text-blue-600" />}
        </div>
        <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none">
          {collapsed ? <ChevronRightIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
        </button>
      </div>
      <nav className="mt-5 px-2">
        <div className="space-y-1">
          {navItems.map(item => <Link key={item.path} to={item.path} className={`${location.pathname === item.path ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors`}>
              <div className={`${location.pathname === item.path ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'} mr-3 h-5 w-5`}>
                {item.icon}
              </div>
              {!collapsed && <span>{item.name}</span>}
            </Link>)}
        </div>
      </nav>
    </aside>;
};
export default Sidebar;