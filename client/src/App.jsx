import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ProtectedRoute from './routes/ProtectedRoute';

import Dashboard from './pages/Dashboard';
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

const AppContent = () => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen">
      {user && <Sidebar />}
      <div className={`flex-1 flex flex-col ${user ? 'ml-64' : ''}`}>
        {user && <Navbar />}
        <main className={`flex-1 ${user ? 'p-8 pb-12' : ''} overflow-y-auto`}>
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to={`/${user.role.toLowerCase()}/dashboard`} />} />

            <Route path="/employee/dashboard" element={
              <ProtectedRoute allowedRoles={['Employee']}>
                <EmployeeDashboard />
              </ProtectedRoute>
            } />

            <Route path="/manager/dashboard" element={
              <ProtectedRoute allowedRoles={['Manager']}>
                <ManagerDashboard />
              </ProtectedRoute>
            } />

            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* Existing Routes protected */}
            <Route path="/create-workflow" element={
              <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
                <CreateWorkflow />
              </ProtectedRoute>
            } />
            <Route path="/my-requests" element={
              <ProtectedRoute>
                <MyRequests />
              </ProtectedRoute>
            } />
            <Route path="/approvals" element={
              <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
                <Approvals />
              </ProtectedRoute>
            } />

            <Route path="/employee/new-request" element={
              <ProtectedRoute allowedRoles={['Employee']}>
                <NewRequestSelection />
              </ProtectedRoute>
            } />
            <Route path="/employee/request/:workflowId" element={
              <ProtectedRoute allowedRoles={['Employee']}>
                <RequestForm />
              </ProtectedRoute>
            } />
            <Route path="/employee/requests/:requestId" element={
              <ProtectedRoute allowedRoles={['Employee']}>
                <RequestDetails />
              </ProtectedRoute>
            } />

            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'rgba(15, 12, 41, 0.9)',
            backdropFilter: 'blur(10px)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
