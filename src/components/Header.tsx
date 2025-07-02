import React from 'react';
import { useAuthStore } from '../store/authStore';
import { BellIcon, SearchIcon, LogOutIcon } from 'lucide-react';
const Header = () => {
  const {
    user,
    logout
  } = useAuthStore();
  const getRoleTitle = () => {
    switch (user?.role) {      case 'patient':
        return 'Patient Portal';
      case 'doctor':
        return 'Doctor Dashboard';
      case 'admin':
        return 'Admin Dashboard';
      case 'billing':
        return 'Billing Management';
      default:
        return 'CareSync';
    }
  };
  return <header className="bg-white shadow-sm z-10">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              {getRoleTitle()}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-1 rounded-full text-gray-500 hover:text-blue-600 focus:outline-none">
              <span className="sr-only">Notifications</span>
              <BellIcon className="h-6 w-6" />
            </button>
            <div className="flex items-center">
              {user?.avatar ? <img className="h-8 w-8 rounded-full" src={user.avatar} alt={user.name} /> : <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  {user?.name.charAt(0)}
                </div>}
              <span className="ml-2 font-medium text-gray-700 hidden md:block">
                {user?.name}
              </span>
            </div>
            <button onClick={logout} className="p-1 rounded-full text-gray-500 hover:text-red-600 focus:outline-none">
              <span className="sr-only">Log out</span>
              <LogOutIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>;
};
export default Header;