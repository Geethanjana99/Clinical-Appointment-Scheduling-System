import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { LogOutIcon, BellIcon, UserIcon } from 'lucide-react';
const Header: React.FC = () => {
  const {
    user,
    logout
  } = useAuthStore();
  return <header className="bg-white shadow-sm z-10">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              {user?.role === 'patient' && 'Patient Portal'}
              {user?.role === 'doctor' && 'Doctor Dashboard'}
              {user?.role === 'data-entry' && 'Data Entry Portal'}
              {user?.role === 'billing' && 'Billing Management'}
              {user?.role === 'manager' && 'Management Dashboard'}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-1 rounded-full text-gray-500 hover:text-blue-600 focus:outline-none">
              <BellIcon className="h-6 w-6" />
            </button>
            <div className="relative">
              <div className="flex items-center space-x-3">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-900">
                    {user?.name}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">
                    {user?.role.replace('-', ' ')}
                  </span>
                </div>
                <div className="relative">
                  {user?.avatar ? <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full" /> : <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-white" />
                    </div>}
                </div>
                <button onClick={logout} className="p-1 rounded-full text-gray-500 hover:text-red-600 focus:outline-none" title="Logout">
                  <LogOutIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>;
};
export default Header;