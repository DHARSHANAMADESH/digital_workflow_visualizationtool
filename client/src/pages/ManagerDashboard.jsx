import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Activity, CheckCircle, Clock } from 'lucide-react';
import Dashboard from './Dashboard';
import Approvals from './Approvals';

const ManagerDashboard = () => {
    const { user } = useAuth();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
        >
            <div className="flex justify-between items-center bg-fuchsia-600/10 p-6 rounded-2xl border border-fuchsia-500/20">
                <div>
                    <h1 className="text-3xl font-bold">Manager Console: {user?.name}</h1>
                    <p className="text-gray-400 mt-1">Reviewing workflows and team requests.</p>
                </div>
                <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-fuchsia-500 to-violet-500 flex items-center justify-center border-4 border-white/10 shadow-xl">
                    <Briefcase className="h-8 w-8 text-white" />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <Approvals />
            </div>
        </motion.div>
    );
};

export default ManagerDashboard;
