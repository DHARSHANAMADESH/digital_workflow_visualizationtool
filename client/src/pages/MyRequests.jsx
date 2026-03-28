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
        templateId: '',
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
        if (!formData.templateId || !formData.title) return toast.error('Please fill in required fields');

        try {
            await requestService.submit({
                ...formData,
                requesterId: user?._id
            });
            toast.success('Request submitted for approval!');
            setShowSubmitModal(false);
            setFormData({ templateId: '', title: '', description: '' });
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
                    <h1 className="text-3xl font-semibold text-content-primary">My Requests</h1>
                    <p className="text-content-secondary mt-1 font-medium">Track the status of your submitted petitions.</p>
                </div>
                <button
                    onClick={() => setShowSubmitModal(true)}
                    className="btn-primary flex items-center space-x-2"
                >
                    <Send className="h-4 w-4" />
                    <span>New Submission</span>
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search petitions..."
                                className="bg-white border border-border rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-primary text-content-primary placeholder:text-content-secondary/40 transition-all font-bold"
                            />
                        </div>
                    </div>
                    <button className="flex items-center space-x-2 text-sm text-content-secondary hover:text-primary transition-colors font-medium uppercase tracking-widest">
                        <Filter className="h-4 w-4" />
                        <span>Filter</span>
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] uppercase tracking-widest text-gray-400 border-b border-border bg-gray-50/30">
                                <th className="px-6 py-4 font-semibold text-left">Request Title</th>
                                <th className="px-6 py-4 font-bold">Workflow</th>
                                <th className="px-6 py-4 font-bold">Current Phase</th>
                                <th className="px-6 py-4 font-bold">Status</th>
                                <th className="px-6 py-4 font-bold text-right">Date Applied</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-content-secondary">
                                        <div className="flex justify-center items-center space-x-2">
                                            <div className="h-3 w-3 bg-primary/20 rounded-full animate-bounce" />
                                            <div className="h-3 w-3 bg-primary/40 rounded-full animate-bounce delay-75" />
                                            <div className="h-3 w-3 bg-primary/60 rounded-full animate-bounce delay-150" />
                                        </div>
                                    </td>
                                </tr>
                            ) : requests.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full" />
                                                <div className="h-24 w-24 rounded-2xl bg-background border border-primary/10 flex items-center justify-center relative z-10 shadow-sm">
                                                    <Send className="h-10 w-10 text-primary opacity-60 -ml-1 mt-1 transform -rotate-12" />
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-semibold text-content-primary mt-4">No Requests Found</h3>
                                            <p className="text-content-secondary max-w-sm mx-auto text-sm font-medium">You haven't submitted any workflow requests yet. When you do, they will appear here for you to track.</p>
                                            <button
                                                onClick={() => setShowSubmitModal(true)}
                                                className="bg-primary hover:bg-hover text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center space-x-2 shadow-xl shadow-primary/20 transition-all hover:-translate-y-0.5 mt-4"
                                            >
                                                <Plus className="h-4 w-4" />
                                                <span>Start First Request</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                requests.map((req) => (
                                    <tr
                                        key={req._id}
                                        onClick={() => navigate(`/employee/requests/${req._id}`)}
                                        className="hover:bg-gray-50 transition-colors group cursor-pointer border-b border-gray-50 last:border-0"
                                    >
                                        <td className="px-6 py-5">
                                            <p className="font-bold text-content-primary group-hover:text-primary transition-colors">{req.title}</p>
                                            <p className="text-[11px] text-content-secondary/40 truncate max-w-[200px] mt-0.5 font-bold uppercase tracking-tight">{req.description}</p>
                                        </td>
                                        <td className="px-6 py-5 text-content-secondary font-bold text-xs">{req.templateId?.workflowName || 'Default'}</td>
                                        <td className="px-6 py-5">
                                            <span className="flex items-center space-x-2 text-content-secondary">
                                                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                <span className="font-black text-[10px] uppercase tracking-widest">
                                                    {req.status === 'pending'
                                                        ? req.templateId?.nodes?.find(n => n.nodeId === req.currentNodeId)?.title || 'Processing'
                                                        : req.status.toUpperCase()}
                                                </span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <StatusBadge status={req.status} />
                                        </td>
                                        <td className="px-6 py-5 text-right text-gray-400 font-bold text-[11px]">
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white w-full max-w-lg p-8 space-y-6 rounded-2xl border border-border shadow-xl"
                    >
                        <h2 className="text-2xl font-bold text-content-primary">Initiate New Petition</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Select Protocol</label>
                                <select
                                    className="w-full bg-background border border-border rounded-xl p-4 focus:outline-none focus:border-primary disabled:opacity-50 text-content-primary font-black text-sm appearance-none cursor-pointer"
                                    value={formData.templateId}
                                    onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                                    disabled={workflows.length === 0}
                                >
                                    {workflows.length === 0 ? (
                                        <option value="">No protocols available. Contact administrator.</option>
                                    ) : (
                                        <>
                                            <option value="">-- Select Organizational Workflow --</option>
                                            {workflows.map(wf => (
                                                <option key={wf._id} value={wf._id}>{wf.workflowName}</option>
                                            ))}
                                        </>
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Petition Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Annual Leave Request"
                                    className="w-full bg-background border border-border rounded-xl p-4 focus:outline-none focus:border-primary text-content-primary font-black text-sm placeholder:text-content-secondary/40"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Detailed Summary (Optional)</label>
                                <textarea
                                    rows="3"
                                    className="w-full bg-background border border-border rounded-xl p-4 focus:outline-none focus:border-primary text-content-primary font-bold text-sm placeholder:text-content-secondary/40 resize-none"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="flex space-x-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowSubmitModal(false)}
                                    className="flex-1 px-4 py-2 border border-border rounded-lg text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-primary text-white px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-hover transition-colors shadow-lg shadow-primary/20"
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
