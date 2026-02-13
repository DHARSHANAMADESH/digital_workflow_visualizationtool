import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Send, Search, Filter, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { workflowService, requestService } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { toast } from 'react-hot-toast';

const MyRequests = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [workflows, setWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSubmitModal, setShowSubmitModal] = useState(false);

    // Submit Form State
    const [formData, setFormData] = useState({
        workflowId: '',
        title: '',
        description: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            await Promise.all([fetchRequests(), fetchWorkflows()]);
        } finally {
            setLoading(false);
        }
    };

    const fetchRequests = async () => {
        try {
            const res = await requestService.getMy();
            setRequests(res.data);
        } catch (error) {
            console.error('Error fetching requests:', error);
            toast.error('Failed to load requests');
        }
    };

    const fetchWorkflows = async () => {
        try {
            const res = await workflowService.getAll();
            setWorkflows(res.data);
        } catch (error) {
            console.error('Error fetching workflows:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.workflowId || !formData.title) return toast.error('Please fill in required fields');

        try {
            await requestService.submit({
                ...formData,
                requesterId: user?._id
            });
            toast.success('Request submitted for approval!');
            setShowSubmitModal(false);
            setFormData({ workflowId: '', title: '', description: '' });
            fetchRequests();
        } catch (error) {
            toast.error('Failed to submit request');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
        >
            <div className="flex justify-between items-end">
                <div>
                    <h1>My Requests</h1>
                    <p className="text-gray-400 mt-1">Track the status of your submitted requests.</p>
                </div>
                <button
                    onClick={() => setShowSubmitModal(true)}
                    className="btn-primary flex items-center space-x-2"
                >
                    <Send className="h-4 w-4" />
                    <span>New Submission</span>
                </button>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-500 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-black/20 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-violet-500"
                            />
                        </div>
                    </div>
                    <button className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors">
                        <Filter className="h-4 w-4" />
                        <span>Filter</span>
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[11px] uppercase tracking-wider text-gray-500 border-b border-white/10">
                                <th className="px-6 py-4 font-semibold">Request Title</th>
                                <th className="px-6 py-4 font-semibold">Workflow</th>
                                <th className="px-6 py-4 font-semibold">Current Step</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex justify-center items-center space-x-2">
                                            <div className="h-4 w-4 bg-violet-500 rounded-full animate-bounce" />
                                            <div className="h-4 w-4 bg-violet-500 rounded-full animate-bounce delay-75" />
                                            <div className="h-4 w-4 bg-violet-500 rounded-full animate-bounce delay-150" />
                                        </div>
                                    </td>
                                </tr>
                            ) : requests.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        <div className="space-y-3">
                                            <div className="flex justify-center">
                                                <div className="p-4 rounded-full bg-white/5 border border-white/10">
                                                    <Search className="h-8 w-8 opacity-20" />
                                                </div>
                                            </div>
                                            <p>No requests submitted yet.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                requests.map((req) => (
                                    <tr
                                        key={req._id}
                                        onClick={() => navigate(`/employee/requests/${req._id}`)}
                                        className="hover:bg-white/5 transition-colors group cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-white group-hover:text-violet-400 transition-colors">{req.title}</p>
                                            <p className="text-xs text-gray-400 truncate max-w-[200px]">{req.description}</p>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 font-medium">{req.workflowId?.workflowName || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <span className="flex items-center space-x-2 text-gray-300">
                                                <span className="h-1.5 w-1.5 rounded-full bg-violet-600" />
                                                <span className="font-medium">{req.workflowId?.steps[req.currentStepIndex]?.stepName || 'Completed'}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={req.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-500 font-medium">
                                            {new Date(req.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showSubmitModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="glass-card w-full max-w-lg p-8 space-y-6"
                    >
                        <h2 className="text-2xl font-bold">New Submission</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Select Workflow</label>
                                <select
                                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-violet-500 disabled:opacity-50 text-white"
                                    value={formData.workflowId}
                                    onChange={(e) => setFormData({ ...formData, workflowId: e.target.value })}
                                    disabled={workflows.length === 0}
                                >
                                    {workflows.length === 0 ? (
                                        <option value="">No workflows available. Contact admin.</option>
                                    ) : (
                                        <>
                                            <option value="">-- Choose Workflow --</option>
                                            {workflows.map(wf => (
                                                <option key={wf._id} value={wf._id}>{wf.workflowName}</option>
                                            ))}
                                        </>
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Request Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Annual Leave Request"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-violet-500"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Description (Optional)</label>
                                <textarea
                                    rows="3"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-violet-500"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="flex space-x-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowSubmitModal(false)}
                                    className="flex-1 btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 btn-primary"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

export default MyRequests;
