import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex min-h-screen bg-[#F9FAFB] font-sans text-gray-900 selection:bg-indigo-100 selection:text-indigo-900">
            {/* Global Sidebar */}
            <Sidebar />

            {/* Adjusted ml-64 instead of ml-72 to fit new w-64 sidebar */}
            <div className="flex-1 flex flex-col ml-64 min-h-screen">
                {/* Global Navbar (Header) */}
                <Navbar />

                {/* Main Content Area */}
                <main className="flex-1 p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
