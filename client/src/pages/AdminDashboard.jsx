import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FileText, GitBranch, Activity, Shield, Settings, Users, BarChart2, Trash2 } from 'lucide-react';
import CreateWorkflow from './CreateWorkflow';
import { requestService, workflowService } from '../services/api';
import WorkflowCard from '../components/WorkflowCard';
import { useNavigate } from 'react-router-dom';
import WorkflowPipeline from '../components/dashboard/WorkflowPipeline';
import { useSocket } from '../context/SocketContext';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [workflows, setWorkflows] = useState([]);
    const [metrics, setMetrics] = useState({
        employee_request: 0,
        manager_pending: 0,
        admin_pending: 0,
        completed: 0
    });
    const [loading, setLoading] = useState(true);
    const { socket } = useSocket();

    const handleDeleteWorkflow = async (id) => {
        if (!window.confirm('Are you sure you want to delete this workflow?')) return;
        try {
            await workflowService.delete(id);
            fetchSystemData();
        } catch (error) {
            console.error('Failed to delete workflow', error);
        }
    };

    const fetchSystemData = async () => {
        try {
            const [wfRes, metricRes] = await Promise.all([
                workflowService.getAll(),
                requestService.getMetrics()
            ]);
            setWorkflows(wfRes.data);
            setMetrics(metricRes.data);
        } catch (error) {
            console.error("Failed to fetch system analytics", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSystemData();

        if (socket) {
            socket.on('workflow_metrics_update', fetchSystemData);
            socket.on('workflow_updated', fetchSystemData);
        }

        return () => {
            if (socket) {
                socket.off('workflow_metrics_update', fetchSystemData);
                socket.off('workflow_updated', fetchSystemData);
            }
        };
    }, [socket]);


    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12 pb-20 px-4 md:px-8 max-w-[1600px] mx-auto"
        >

            {/* Workflow Pipeline View */}
            <section className="bg-white rounded-[3rem] border border-border shadow-sm p-8 md:p-10">
                <div className="flex items-center space-x-5 mb-8 px-2">
                    <div className="h-12 w-12 rounded-2xl bg-background flex items-center justify-center border border-primary/10 shadow-inner">
                        <LayoutDashboard className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold text-content-primary tracking-tighter uppercase">Workflow Pipeline</h2>
                        <p className="text-gray-400 font-normal text-[10px] uppercase tracking-[0.15em] mt-0.5">Real-time status tracking</p>
                    </div>
                </div>
                <WorkflowPipeline metrics={metrics} />
            </section>

            <div className="space-y-16">
                {/* Workflow Designer Section */}
                <section>
                    <div className="flex items-center justify-between mb-10 px-6">
                        <div className="flex items-center space-x-5">
                            <div className="h-12 w-12 rounded-2xl bg-background flex items-center justify-center border border-primary/10 shadow-inner">
                                <GitBranch className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-semibold text-content-primary tracking-tighter uppercase">Workflow Architect</h2>
                            </div>
                        </div>
                        <div className="h-px flex-1 bg-gradient-to-r from-primary/10 to-transparent mx-10 hidden lg:block" />
                    </div>

                    <div className="bg-white rounded-[48px] border border-border shadow-sm ring-1 ring-black/5 overflow-hidden p-6 md:p-10">
                        <CreateWorkflow onSave={fetchSystemData} />
                    </div>
                </section>

                {/* Available Workflows Section */}
                <section>
                    <div className="flex items-center space-x-5 mb-10 px-6">
                        <div className="h-12 w-12 rounded-2xl bg-background flex items-center justify-center border border-primary/10 shadow-inner">
                            <Activity className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-semibold text-content-primary tracking-tighter uppercase">Available Workflows</h2>
                            <p className="text-gray-400 font-normal text-xs uppercase tracking-[0.15em] mt-1">System Protocol Directory</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-border shadow-sm ring-1 ring-black/5 overflow-hidden">
                        {loading ? (
                            <div className="flex items-center justify-center p-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                            </div>
                        ) : workflows.length === 0 ? (
                            <div className="p-12 text-center bg-gray-50 border-dashed border-2 border-border">
                                <h3 className="text-lg font-semibold text-content-primary mb-2">No Protocols Available</h3>
                                <p className="text-sm text-content-secondary max-w-xs mx-auto">There are currently no workflows in the system.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {/* Employee Workflows Section */}
                                <div className="bg-gray-50/50 px-8 py-3 border-b border-border">
                                    <h3 className="text-[10px] font-semibold text-primary uppercase tracking-[0.2em] flex items-center space-x-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                        <span>Employee Operational Protocols</span>
                                    </h3>
                                </div>
                                {workflows.filter(wf => wf.allowedRoles?.includes('Employee')).map(wf => (
                                    <div key={wf._id} className="group">
                                        <div className="flex items-center justify-between p-4 px-6 md:px-8 transition-colors">
                                            <div className="flex items-center space-x-4">
                                                <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center border border-border text-gray-400 transition-all">
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <span className="text-base font-semibold text-gray-800 tracking-tight">{wf.workflowName}</span>
                                            </div>
                                            <button 
                                                onClick={() => handleDeleteWorkflow(wf._id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Manager Workflows Section */}
                                <div className="bg-gray-50/50 px-8 py-3 border-b border-t border-border">
                                    <h3 className="text-[10px] font-semibold text-primary uppercase tracking-[0.2em] flex items-center space-x-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                        <span>Manager Enterprise Protocols</span>
                                    </h3>
                                </div>
                                {workflows.filter(wf => !wf.allowedRoles?.includes('Employee')).map(wf => (
                                    <div key={wf._id} className="group">
                                        <div className="flex items-center justify-between p-4 px-6 md:px-8 transition-colors">
                                            <div className="flex items-center space-x-4">
                                                <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center border border-border text-gray-400 transition-all">
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <span className="text-base font-semibold text-gray-800 tracking-tight">{wf.workflowName}</span>
                                            </div>
                                            <button 
                                                onClick={() => handleDeleteWorkflow(wf._id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div >
        </motion.div >
    );
};

export default AdminDashboard;
