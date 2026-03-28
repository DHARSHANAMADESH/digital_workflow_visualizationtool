import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();
    // Fix: Token is stored inside the 'user' object in localStorage
    const storedUser = localStorage.getItem("user");
    const token = storedUser ? JSON.parse(storedUser).token : null;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const hasAccess = !allowedRoles || (user && allowedRoles.some(role =>
        role.toLowerCase() === user.role?.toLowerCase()
    ));

    if (!hasAccess) {
        // Redirect to their own dashboard if they try to access unauthorized role dashboard
        return <Navigate to={`/${user.role?.toLowerCase() || 'employee'}/dashboard`} replace />;
    }

    return children;
};

export default ProtectedRoute;
