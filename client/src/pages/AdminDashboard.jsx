import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Shield, Settings, Users, GitBranch } from 'lucide-react';
import Dashboard from './Dashboard';
import CreateWorkflow from './CreateWorkflow';

const AdminDashboard = () => {
    const { user } = useAuth();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
        >
            <div className="flex justify-between items-center bg-red-600/10 p-6 rounded-2xl border border-red-500/20">
                <div>
                    <h1 className="text-red-100">System Admin: {user?.name}</h1>
                    <p className="text-gray-400 mt-1">Full system control and workflow orchestration.</p>
                </div>
                <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-red-500 to-orange-500 flex items-center justify-center border-4 border-white/10 shadow-xl">
                    <Shield className="h-8 w-8 text-white" />
                </div>
            </div>

            <div className="space-y-10">
                <section>
                    <div className="flex items-center space-x-3 mb-6 bg-white/5 w-fit px-4 py-2 rounded-full border border-white/5">
                        <GitBranch className="h-4 w-4 text-red-400" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Workflow Designer</span>
                    </div>
                    <CreateWorkflow />
                </section>

                <div className="border-t border-white/5 pt-10">
                    <div className="flex items-center space-x-3 mb-6 bg-white/5 w-fit px-4 py-2 rounded-full border border-white/5">
                        <Users className="h-4 w-4 text-red-400" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">System Activity</span>
                    </div>
                    <Dashboard />
                </div>
            </div>
        </motion.div>
    );
};

export default AdminDashboard;
