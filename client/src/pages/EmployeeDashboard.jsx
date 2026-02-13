import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { User, Send, Clock, CheckCircle } from 'lucide-react';
import Dashboard from './Dashboard';

const EmployeeDashboard = () => {
    const { user } = useAuth();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
        >
            <div className="flex justify-between items-center bg-violet-600/10 p-6 rounded-2xl border border-violet-500/20">
                <div>
                    <h1 className="text-3xl font-bold">Welcome back, {user?.name}</h1>
                    <p className="text-gray-400 mt-1">You are logged in as an <span className="text-violet-400 font-semibold">{user?.role}</span></p>
                </div>
                <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center border-4 border-white/10 shadow-xl">
                    <User className="h-8 w-8 text-white" />
                </div>
            </div>

            <Dashboard />
        </motion.div>
    );
};

export default EmployeeDashboard;
