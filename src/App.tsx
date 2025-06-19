import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import type { UserRole } from './store/authStore';
import { DarkModeProvider } from './contexts/DarkModeContext';
// Landing Page
import Home from './pages/Landing/home';
// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
// Layout
import Layout from './components/Layout';
// Patient Pages
import PatientDashboard from './pages/patient/Dashboard';
import BookAppointment from './pages/patient/BookAppointment';
import ViewQueue from './pages/patient/ViewQueue';
import MedicalReports from './pages/patient/MedicalReports';
import HealthPredictions from './pages/patient/HealthPredictions';
import MyAppointments from './pages/patient/MyAppointments';
// Doctor Pages
import DoctorDashboard from './pages/doctor/Dashboard';
import PatientDetails from './pages/doctor/PatientDetails';
import ManageQueue from './pages/doctor/ManageQueue';
import MyPatients from './pages/doctor/MyPatients';
import DoctorAppointments from './pages/doctor/Appointments';
import AIPredictions from './pages/doctor/AIPredictions';
import DoctorAvailability from './pages/doctor/Availability';
// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import ManagePatients from './pages/admin/ManagePatients';
import ManageAppointments from './pages/admin/ManageAppointments';
import ManageDoctors from './pages/admin/ManageDoctors';
import UploadReports from './pages/admin/UploadReports';
// Nurse Pages
import NurseDashboard from './pages/nurse/Dashboard';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

// Protected route component
const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to the appropriate dashboard based on role
    const dashboardRoutes: Record<UserRole, string> = {
      patient: '/patient',
      doctor: '/doctor',
      admin: '/admin',
      nurse: '/nurse'
    };
    return <Navigate to={dashboardRoutes[user.role] || '/login'} replace />;
  }
  
  return <>{children}</>;
};
export function App() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <DarkModeProvider>
      <Router>
        <Routes>
        {/* Landing Page */}
        <Route path="/" element={<Home />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />        {/* Patient Routes */}
        <Route path="/patient" element={<ProtectedRoute allowedRoles={['patient']}>
              <Layout />
            </ProtectedRoute>}>
          <Route index element={<PatientDashboard />} />
          <Route path="book-appointment" element={<BookAppointment />} />
          <Route path="queue" element={<ViewQueue />} />
          <Route path="medical-reports" element={<MedicalReports />} />
          <Route path="health-predictions" element={<HealthPredictions />} />
          <Route path="my-appointments" element={<MyAppointments />} />
        </Route>{/* Doctor Routes */}
        <Route path="/doctor" element={<ProtectedRoute allowedRoles={['doctor']}>
              <Layout />
            </ProtectedRoute>}>
          <Route index element={<DoctorDashboard />} />
          <Route path="patient/:id" element={<PatientDetails />} />
          <Route path="queue" element={<ManageQueue />} />
          <Route path="patients" element={<MyPatients />} />
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="ai-predictions" element={<AIPredictions />} />
          <Route path="availability" element={<DoctorAvailability />} />
        </Route>        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}>
              <Layout />
            </ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="patients" element={<ManagePatients />} />
          <Route path="doctors" element={<ManageDoctors />} />
          <Route path="appointments" element={<ManageAppointments />} />
          <Route path="reports" element={<UploadReports />} />
        </Route>

        {/* Nurse Routes */}
        <Route path="/nurse" element={<ProtectedRoute allowedRoles={['nurse']}>
              <Layout />
            </ProtectedRoute>}>
          <Route index element={<NurseDashboard />} />
        </Route>
      </Routes>
    </Router>
    </DarkModeProvider>
  );
}