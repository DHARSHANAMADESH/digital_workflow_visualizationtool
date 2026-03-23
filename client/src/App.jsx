console.log('App.jsx: Module evaluation started');
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

import CreateWorkflow from './pages/CreateWorkflow';
import MyRequests from './pages/MyRequests';
import Approvals from './pages/Approvals';
import Login from './pages/Login';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NewRequestSelection from './pages/NewRequestSelection';
import RequestForm from './pages/RequestForm';
import RequestDetails from './pages/RequestDetails';
import WorkflowMonitor from './pages/WorkflowMonitor';
import Settings from './pages/Settings';
import NotificationsLog from './pages/NotificationsLog';
import ActivityHistoryLog from './pages/ActivityHistoryLog';
import ManagerRequests from './pages/ManagerRequests';
import WorkflowRequests from './pages/WorkflowRequests';

const AppContent = () => {
  const { user, loading } = useAuth();
  console.log('AppContent render:', { user, loading });

  // Robust token retrieval for top-level redirects
  const getStoredToken = () => {
    try {
      const storedUser = localStorage.getItem("user");
      const token = storedUser ? JSON.parse(storedUser).token : null;
      console.log('Token retrieval:', token);
      return token;
    } catch (e) {
      console.error("Error parsing user from localStorage:", e);
      return null;
    }
  };

  const token = getStoredToken();

  if (loading) {
    console.log('AppContent: Loading state active');
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2563EB]"></div>
      </div>
    );
  }

  const getDashboardRoute = () => {
    console.log('Calculating dashboard route for user role:', user?.role);
    if (user?.role) {
      return `/${user.role.toLowerCase()}/dashboard`;
    }
    return "/login";
  };

  console.log('AppContent: Rendering Routes, token exists:', !!token);

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={!token ? <Login /> : <Navigate to={getDashboardRoute()} replace />}
        />
        <Route
          path="/signup"
          element={!token ? <Login /> : <Navigate to={getDashboardRoute()} replace />}
        />

        {/* Protected Dashboard Routes wrapped in DashboardLayout */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Navigate to={getDashboardRoute()} replace />} />

          {/* Employee Routes */}
          <Route path="/employee">
            <Route path="dashboard" element={<ProtectedRoute allowedRoles={['Employee']}><EmployeeDashboard /></ProtectedRoute>} />
            <Route path="new-request" element={<ProtectedRoute allowedRoles={['Employee', 'Manager', 'Admin']}><NewRequestSelection /></ProtectedRoute>} />
            <Route path="request/:workflowId" element={<ProtectedRoute allowedRoles={['Employee', 'Manager', 'Admin']}><RequestForm /></ProtectedRoute>} />
            <Route path="requests/:requestId" element={<ProtectedRoute allowedRoles={['Employee', 'Manager', 'Admin']}><RequestDetails /></ProtectedRoute>} />
          </Route>

          {/* Manager Routes */}
          <Route path="/manager">
            <Route path="dashboard" element={<ProtectedRoute allowedRoles={['Manager']}><ManagerDashboard /></ProtectedRoute>} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin">
            <Route path="dashboard" element={<ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>} />
          </Route>

          {/* General Protected Access Components */}
          <Route path="/create-workflow" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><CreateWorkflow /></ProtectedRoute>} />
          <Route path="/my-requests" element={<ProtectedRoute><MyRequests /></ProtectedRoute>} />
          <Route path="/workflow-monitor" element={<ProtectedRoute><WorkflowMonitor /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsLog /></ProtectedRoute>} />
          <Route path="/activity-log" element={<ProtectedRoute><ActivityHistoryLog /></ProtectedRoute>} />
          <Route path="/manager-requests" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><ManagerRequests /></ProtectedRoute>} />
          <Route path="/approvals" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><Approvals /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/workflow-requests/:workflowId" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><WorkflowRequests /></ProtectedRoute>} />
        </Route>

        {/* Catch-All Route */}
        <Route
          path="*"
          element={<Navigate to={token ? getDashboardRoute() : "/login"} replace />}
        />
      </Routes>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#1e293b',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
            borderRadius: '16px',
            border: '1px solid #f1f5f9',
            fontWeight: '600'
          },
        }}
      />
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <AppContent />
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
