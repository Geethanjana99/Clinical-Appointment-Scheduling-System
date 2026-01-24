import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { BellIcon, LogOutIcon } from 'lucide-react';
import LogoutConfirmModal from './modals/LogoutConfirmModal';
const Header = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const {
    user,
    logout
  } = useAuthStore();

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    // Navigate to login page after logout
    navigate('/login', { replace: true });
  };
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
  return <header className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-lg z-10">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-white">
              {getRoleTitle()}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/20 focus:outline-none transition-all duration-200">
              <span className="sr-only">Notifications</span>
              <BellIcon className="h-6 w-6" />
            </button>
            <div className="flex items-center">
              {user?.avatar_url ? <img className="h-8 w-8 rounded-full border-2 border-white/30" src={user.avatar_url} alt={user.name} /> : <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold border-2 border-white/30">
                  {user?.name.charAt(0)}
                </div>}
              <span className="ml-2 font-medium text-white hidden md:block">
                {user?.name}
              </span>
            </div>
            <button onClick={handleLogoutClick} className="p-2 rounded-full text-white/80 hover:text-white hover:bg-red-500/30 focus:outline-none transition-all duration-200">
              <span className="sr-only">Log out</span>
              <LogOutIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
        userName={user?.name}
      />
    </header>;
};
export default Header;