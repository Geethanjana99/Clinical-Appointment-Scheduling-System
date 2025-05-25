import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
// Layout
import Layout from './components/Layout';
// Patient Pages
import PatientDashboard from './pages/patient/Dashboard';
import BookAppointment from './pages/patient/BookAppointment';
import UploadReports from './pages/patient/UploadReports';
import ViewQueue from './pages/patient/ViewQueue';
// Doctor Pages
import DoctorDashboard from './pages/doctor/Dashboard';
import PatientDetails from './pages/doctor/PatientDetails';
import ManageQueue from './pages/doctor/ManageQueue';
// Operator Pages
import OperatorDashboard from './pages/operator/Dashboard';
import ManagePatients from './pages/operator/ManagePatients';
import ManageAppointments from './pages/operator/ManageAppointments';
// Billing Pages
import BillingDashboard from './pages/billing/Dashboard';
import Invoices from './pages/billing/Invoices';
import BillingReports from './pages/billing/Reports';
// Manager Pages
import ManagerDashboard from './pages/manager/Dashboard';
import Performance from './pages/manager/Performance';
import ManagerReports from './pages/manager/Reports';
// Protected route component
const ProtectedRoute = ({
  children,
  allowedRoles
}) => {
  const {
    user,
    isAuthenticated
  } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to the appropriate dashboard based on role
    const dashboardRoutes = {
      patient: '/patient',
      doctor: '/doctor',
      operator: '/operator',
      billing: '/billing',
      manager: '/manager'
    };
    return <Navigate to={dashboardRoutes[user.role] || '/login'} replace />;
  }
  return children;
};
export function App() {
  return <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Patient Routes */}
        <Route path="/patient" element={<ProtectedRoute allowedRoles={['patient']}>
              <Layout />
            </ProtectedRoute>}>
          <Route index element={<PatientDashboard />} />
          <Route path="book-appointment" element={<BookAppointment />} />
          <Route path="upload-reports" element={<UploadReports />} />
          <Route path="queue" element={<ViewQueue />} />
        </Route>
        {/* Doctor Routes */}
        <Route path="/doctor" element={<ProtectedRoute allowedRoles={['doctor']}>
              <Layout />
            </ProtectedRoute>}>
          <Route index element={<DoctorDashboard />} />
          <Route path="patient/:id" element={<PatientDetails />} />
          <Route path="queue" element={<ManageQueue />} />
        </Route>
        {/* Operator Routes */}
        <Route path="/operator" element={<ProtectedRoute allowedRoles={['operator']}>
              <Layout />
            </ProtectedRoute>}>
          <Route index element={<OperatorDashboard />} />
          <Route path="patients" element={<ManagePatients />} />
          <Route path="appointments" element={<ManageAppointments />} />
        </Route>
        {/* Billing Routes */}
        <Route path="/billing" element={<ProtectedRoute allowedRoles={['billing']}>
              <Layout />
            </ProtectedRoute>}>
          <Route index element={<BillingDashboard />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="reports" element={<BillingReports />} />
        </Route>
        {/* Manager Routes */}
        <Route path="/manager" element={<ProtectedRoute allowedRoles={['manager']}>
              <Layout />
            </ProtectedRoute>}>
          <Route index element={<ManagerDashboard />} />
          <Route path="performance" element={<Performance />} />
          <Route path="reports" element={<ManagerReports />} />
        </Route>
        {/* Default Route */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>;
}