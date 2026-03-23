import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Activity, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WorkflowCard from '../components/WorkflowCard';
import { workflowService, requestService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-hot-toast';
import StatusBadge from '../components/StatusBadge';
import RequestStatusPieChart from '../components/charts/RequestStatusPieChart';
import MonthlySubmissionsChart from '../components/charts/MonthlySubmissionsChart';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState([
        { label: 'Available Workflows', value: 0, icon: Activity, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
        { label: 'Pending Submission', value: 0, icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-50' },
        { label: 'Approved Requests', value: 0, icon: CheckCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    ]);
    const [workflows, setWorkflows] = useState([]);
    const [recentRequests, setRecentRequests] = useState([]);
    const [allRequests, setAllRequests] = useState([]); // For charts
    const [loading, setLoading] = useState(true);
    const { socket } = useSocket();

    useEffect(() => {
        fetchData();

        if (socket) {
            socket.on('workflow_updated', (data) => {
                fetchData(); // Trigger refetch on real-time update
            });
            socket.on('workflow_metrics_update', () => {
                fetchData();
            });
        }

        return () => {
            if (socket) {
                socket.off('workflow_updated');
                socket.off('workflow_metrics_update');
            }
        };
    }, [user, socket]);

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
                setAllRequests(allMyRes.data);
                setStats([
                    { label: 'Available Workflows', value: wfRes.data.length, icon: Activity, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
                    { label: 'Pending Submission', value: pendingRes.data.length, icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-50' },
                    { label: 'Approved Requests', value: approvedRes.data.length, icon: CheckCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
                ]);
            } else {
                // Admin/Manager Logic (Existing or similar)
                const [wfRes, allReqRes] = await Promise.all([
                    workflowService.getAll(),
                    requestService.getAll()
                ]);
                setWorkflows(wfRes.data);
                setStats([
                    { label: 'System Workflows', value: wfRes.data.length, icon: Activity, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
                    { label: 'Awaiting Review', value: allReqRes.data.filter(r => r.status === 'pending').length, icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-50' },
                    { label: 'Total Executions', value: allReqRes.data.length, icon: CheckCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
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
            className="space-y-10 pb-12 px-2 md:px-6"
        >
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-gray-900">Enterprise Command Center</h1>
                    <p className="text-gray-500 mt-1 font-medium">Real-time oversight of organizational workflow streams.</p>
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
                {stats.map((stat, i) => {
                    const progressValue = loading ? 0 : Math.min(100, (stat.value / (stats.reduce((acc, curr) => acc + curr.value, 0) || 1)) * 100);
                    return (
                        <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-default group relative overflow-hidden">
                            <div className="flex items-center space-x-4 mb-4 z-10 relative">
                                <div className={`p-4 ${stat.bgColor} rounded-2xl flex-shrink-0 ${stat.color} shadow-sm`}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 truncate">{stat.label}</p>
                                    <p className="text-3xl font-bold mt-1 text-gray-900">{loading ? '...' : stat.value}</p>
                                </div>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 z-10 overflow-hidden relative">
                                <motion.div
                                    className={`h-1.5 rounded-full ${stat.color.replace('text-', 'bg-')}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressValue}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Analytics Section (Employee Only) */}
            {user.role === 'Employee' && !loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <RequestStatusPieChart requests={allRequests} />
                    <MonthlySubmissionsChart requests={allRequests} />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Workflows Column */}
                <div className="space-y-6">
                    <h2 className="flex items-center space-x-3 text-gray-900 font-bold">
                        <span>Available Protocols</span>
                        <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded-md text-xs font-bold text-indigo-700">
                            {workflows.length} LIVE
                        </span>
                    </h2>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2].map(i => <div key={i} className="bg-gray-50 h-32 animate-pulse rounded-2xl border border-gray-100" />)}
                        </div>
                    ) : workflows.length === 0 ? (
                        <div className="p-12 text-center bg-white border-dashed border-2 border-gray-100 rounded-3xl">
                            <div className="h-20 w-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <Activity className="h-10 w-10 text-indigo-600 opacity-60" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">No Protocols Available</h3>
                            <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">There are currently no workflows assigned to your clearance level.</p>
                            {user.role === 'Admin' && (
                                <button onClick={() => navigate('/admin/dashboard')} className="btn-secondary text-sm">Create Workflow</button>
                            )}
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
                                    className="text-sm font-bold text-indigo-600 hover:text-indigo-700 text-center py-2 transition-colors"
                                >
                                    View all available workflows →
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Recent Activity Column */}
                <div className="space-y-6">
                    <h2 className="flex items-center space-x-3 text-gray-900 font-bold">
                        <span>Recent Submissions</span>
                    </h2>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="p-8 space-y-4 animate-pulse">
                                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-50 rounded-lg" />)}
                            </div>
                        ) : recentRequests.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="h-20 w-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-6 shadow-sm">
                                    <Clock className="h-10 w-10 text-amber-500 opacity-60" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">No Recent Activity</h3>
                                <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">You haven't submitted or interacted with any requests recently.</p>
                                {user.role === 'Employee' && (
                                    <button onClick={() => navigate('/employee/new-request')} className="btn-primary text-sm px-4 py-2">Start a Request</button>
                                )}
                            </div>
                        ) : (
                            <div className="relative border-l border-indigo-500/20 ml-8 mt-4 mb-4 space-y-8">
                                {recentRequests.map(req => (
                                    <div key={req._id} className="relative pl-8 group">
                                        {/* Timeline Dot */}
                                        <div className="absolute -left-[5.5px] top-1.5 h-2.5 w-2.5 rounded-full bg-indigo-500 ring-4 ring-white group-hover:bg-indigo-600 transition-all shadow-sm" />

                                        <div className="bg-white border border-gray-100 p-5 rounded-2xl hover:border-indigo-500/30 hover:bg-gray-50 transition-all flex justify-between items-center group-hover:shadow-md">
                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-[10px] text-indigo-700 font-bold uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-md">
                                                        {new Date(req.createdAt).toLocaleDateString()}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                        {req.templateId?.workflowName || 'Workflow'}
                                                    </span>
                                                </div>
                                                <p className="font-bold text-sm text-gray-900">{req.title}</p>
                                                <p className="text-xs text-gray-500 font-medium">
                                                    Phase: <span className="text-indigo-700">{req.status === 'pending' ? (req.templateId?.nodes?.find(n => n.nodeId === req.currentNodeId)?.title || 'Processing') : req.status.toUpperCase()}</span>
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end space-y-3">
                                                <StatusBadge status={req.status} className="scale-90 origin-right" />
                                                <button
                                                    onClick={() => navigate(`/employee/requests/${req._id}`)}
                                                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all flex items-center space-x-1 shadow-sm opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                                                >
                                                    <span>View</span>
                                                    <ArrowRight className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {recentRequests.length > 0 && (
                            <div className="p-4 bg-gray-50/50 border-t border-gray-50 flex justify-center">
                                <button
                                    onClick={() => navigate('/my-requests')}
                                    className="text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-indigo-700 transition-colors"
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
