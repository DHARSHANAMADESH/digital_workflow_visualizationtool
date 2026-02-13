import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Activity, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WorkflowCard from '../components/WorkflowCard';
import { workflowService, requestService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import StatusBadge from '../components/StatusBadge';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState([
        { label: 'Available Workflows', value: 0, icon: Activity, color: 'text-violet-400' },
        { label: 'Pending Submission', value: 0, icon: Clock, color: 'text-yellow-400' },
        { label: 'Approved Requests', value: 0, icon: CheckCircle, color: 'text-green-400' },
    ]);
    const [workflows, setWorkflows] = useState([]);
    const [recentRequests, setRecentRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (user.role === 'Employee') {
                const [wfRes, pendingRes, approvedRes, allMyRes] = await Promise.all([
                    workflowService.getAvailable(),
                    requestService.getMy({ status: 'pending' }),
                    requestService.getMy({ status: 'approved' }),
                    requestService.getMy()
                ]);

                setWorkflows(wfRes.data);
                setRecentRequests(allMyRes.data.slice(0, 5));
                setStats([
                    { label: 'Available Workflows', value: wfRes.data.length, icon: Activity, color: 'text-violet-400' },
                    { label: 'Pending Submission', value: pendingRes.data.length, icon: Clock, color: 'text-yellow-400' },
                    { label: 'Approved Requests', value: approvedRes.data.length, icon: CheckCircle, color: 'text-green-400' },
                ]);
            } else {
                // Admin/Manager Logic (Existing or similar)
                const [wfRes, allReqRes] = await Promise.all([
                    workflowService.getAll(),
                    requestService.getAll()
                ]);
                setWorkflows(wfRes.data);
                setStats([
                    { label: 'System Workflows', value: wfRes.data.length, icon: Activity, color: 'text-violet-400' },
                    { label: 'Awaiting Review', value: allReqRes.data.filter(r => r.status === 'pending').length, icon: Clock, color: 'text-yellow-400' },
                    { label: 'Total Executions', value: allReqRes.data.length, icon: CheckCircle, color: 'text-green-400' },
                ]);
            }
        } catch (error) {
            console.error('Dashboard Fetch Error:', error);
            toast.error('Sync failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10 pb-12"
        >
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-white">Enterprise Command Center</h1>
                    <p className="text-gray-400 mt-1">Real-time oversight of organizational workflow streams.</p>
                </div>
                {user.role === 'Employee' && (
                    <button
                        onClick={() => navigate('/employee/new-request')}
                        className="btn-primary group flex items-center space-x-2"
                    >
                        <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                        <span>New Request</span>
                    </button>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="glass-card p-5 flex items-center space-x-4 border border-white/5 hover:border-violet-500/20 transition-all bg-white/2 cursor-default">
                        <div className={`p-4 bg-white/5 rounded-2xl flex-shrink-0 ${stat.color}`}>
                            <stat.icon className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-medium uppercase text-gray-500 truncate">{stat.label}</p>
                            <p className="text-2xl font-semibold mt-1 text-white">{loading ? '...' : stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Workflows Column */}
                <div className="space-y-6">
                    <h2 className="flex items-center space-x-3 text-white">
                        <span>Available Protocols</span>
                        <span className="px-2 py-0.5 bg-violet-500/10 border border-violet-500/20 rounded-md text-xs font-semibold text-violet-400">
                            {workflows.length} LIVE
                        </span>
                    </h2>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2].map(i => <div key={i} className="glass-card h-32 animate-pulse bg-white/5" />)}
                        </div>
                    ) : workflows.length === 0 ? (
                        <div className="glass-card p-12 text-center bg-white/5 border-dashed border-2 border-white/5">
                            <Activity className="h-12 w-12 text-gray-600 mx-auto mb-4 opacity-20" />
                            <p className="text-gray-400 font-medium">No protocols assigned to your clearance level.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {workflows.slice(0, 3).map(wf => (
                                <WorkflowCard
                                    key={wf._id}
                                    workflow={wf}
                                    onClick={() => navigate(`/employee/request/${wf._id}`)}
                                />
                            ))}
                            {workflows.length > 3 && (
                                <button
                                    onClick={() => navigate('/employee/new-request')}
                                    className="text-sm font-bold text-violet-400 hover:text-violet-300 text-center py-2"
                                >
                                    View all available workflows →
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Recent Activity Column */}
                <div className="space-y-6">
                    <h2 className="flex items-center space-x-3 text-white">
                        <span>Recent Submissions</span>
                    </h2>

                    <div className="glass-card border border-white/5 overflow-hidden">
                        {loading ? (
                            <div className="p-8 space-y-4 animate-pulse">
                                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-white/5 rounded-lg" />)}
                            </div>
                        ) : recentRequests.length === 0 ? (
                            <div className="p-12 text-center">
                                <Clock className="h-10 w-10 text-gray-700 mx-auto mb-4" />
                                <p className="text-gray-500 italic">No activity logs found for your profile.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {recentRequests.map(req => (
                                    <div key={req._id} className="p-5 flex items-center justify-between hover:bg-white/5 transition-all group">
                                        <div className="space-y-1">
                                            <p className="font-bold text-sm text-gray-200 group-hover:text-violet-400 transition-colors">{req.title}</p>
                                            <div className="flex items-center space-x-3">
                                                <span className="text-xs text-gray-500 font-medium uppercase">{new Date(req.createdAt).toLocaleDateString()}</span>
                                                <span className="h-1 w-1 bg-gray-700 rounded-full" />
                                                <span className="text-xs text-gray-400">
                                                    Phase: {req.status === 'pending' ? req.workflowId?.steps[req.currentStepIndex]?.stepName : 'Finished'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <StatusBadge status={req.status} className="scale-75 origin-right" />
                                            <button
                                                onClick={() => navigate(`/employee/requests/${req._id}`)}
                                                className="p-2 bg-white/5 rounded-lg border border-white/10 hover:border-violet-500/50 hover:bg-violet-500/10 transition-all"
                                            >
                                                <Activity className="h-4 w-4 text-gray-400" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {recentRequests.length > 0 && (
                            <div className="p-4 bg-white/5 bg-opacity-30 flex justify-center">
                                <button
                                    onClick={() => navigate('/my-requests')}
                                    className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 hover:text-white transition-colors"
                                >
                                    Access Full Archive
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
