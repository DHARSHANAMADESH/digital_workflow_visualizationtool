import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import UserDashboard from './UserDashboard';

const EmployeeDashboard = () => {
    return (
        <div className="min-h-screen">
            <UserDashboard />
        </div>
    );
};

export default EmployeeDashboard;
