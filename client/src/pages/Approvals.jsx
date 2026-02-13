import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, MessageSquare, ArrowRight } from 'lucide-react';
import { requestService, approvalService } from '../services/api';
import { toast } from 'react-hot-toast';

const Approvals = () => {
    const [allRequests, setAllRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [selectedWorkflow, setSelectedWorkflow] = useState('All');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');

    useEffect(() => {
        fetchRequests();
    }, []);

    useEffect(() => {
        applyFilter();
    }, [selectedWorkflow, allRequests]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            // Use getAssigned to only show requests the user can actually process
            const res = await approvalService.getAssigned();
            setAllRequests(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching approvals:', error);
            toast.error('Failed to load assigned approvals');
            setLoading(false);
        }
    };

    const applyFilter = () => {
        if (selectedWorkflow === 'All') {
            setFilteredRequests(allRequests);
        } else {
            const filtered = allRequests.filter(req => req.workflowId?.workflowName === selectedWorkflow);
            setFilteredRequests(filtered);
        }
    };

    const workflowOptions = ['All', ...new Set(allRequests.map(req => req.workflowId?.workflowName).filter(Boolean))];

    const processApproval = async (requestId, action) => {
        try {
            await requestService.approve({
                requestId,
                action,
                performedBy: '65c9f5e1e4b0a1b2c3d4e5f6', // Mock user for demo
                comment
            });

            toast.success(`Request ${action === 'Approved' ? 'approved' : 'rejected'}`);
            setSelectedRequest(null);
            setComment('');
            fetchRequests(); // Refresh data after action
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to process approval';
            console.error('[APPROVAL_PROCESS_ERROR]', error);
            toast.error(message);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Review Center</h1>
                    <p className="text-gray-400 mt-1">Manage and filter workflow approvals.</p>
                </div>

                <div className="flex items-center space-x-3 bg-white/5 p-2 rounded-xl border border-white/10">
                    <span className="text-sm font-medium text-gray-400 ml-2">Filter Workflow:</span>
                    <select
                        value={selectedWorkflow}
                        onChange={(e) => setSelectedWorkflow(e.target.value)}
                        className="bg-black/40 border border-white/10 text-white text-sm rounded-lg focus:ring-violet-500 focus:border-violet-500 block p-2.5 outline-none"
                    >
                        {workflowOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="flex items-center space-x-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                        <span>Requests</span>
                        <span className="bg-violet-500/20 text-violet-400 px-2 rounded-full text-[10px]">
                            {filteredRequests.length}
                        </span>
                    </h3>

                    <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredRequests.length === 0 ? (
                            <div className="glass-card p-8 text-center text-gray-500 italic">
                                No requests found for "{selectedWorkflow}"
                            </div>
                        ) : (
                            filteredRequests.map(req => (
                                <div
                                    key={req._id}
                                    onClick={() => setSelectedRequest(req)}
                                    className={`glass-card p-4 cursor-pointer transition-all border-l-4 ${selectedRequest?._id === req._id
                                        ? 'border-l-violet-500 bg-white/10'
                                        : 'border-l-transparent hover:bg-white/5'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="font-bold text-white truncate flex-1">{req.title}</p>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${req.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                            req.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                                'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                            {req.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-400">{req.workflowId?.workflowName || 'Workflow'}</span>
                                        <span className="bg-white/5 px-2 py-0.5 rounded text-violet-300">
                                            Step {req.currentStepIndex + 1}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2">
                    {selectedRequest ? (
                        <motion.div
                            key={selectedRequest._id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card p-8 min-h-[500px] flex flex-col"
                        >
                            <div className="flex justify-between items-start mb-8 border-b border-white/5 pb-6">
                                <div>
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h2 className="text-3xl font-bold">{selectedRequest.title}</h2>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${selectedRequest.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                            selectedRequest.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                                'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                            {selectedRequest.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-400">{selectedRequest.description || 'No description provided.'}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-gray-500 block uppercase tracking-widest mb-1">Requester</span>
                                    <span className="font-medium text-violet-300 bg-violet-500/10 px-3 py-1 rounded-lg">
                                        {selectedRequest.requesterId?.name || 'Unknown'}
                                    </span>
                                </div>
                            </div>

                            {/* Progress Visualizer */}
                            <div className="mb-12 bg-white/5 p-6 rounded-2xl border border-white/10">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-8">Execution Flow Implementation</h4>
                                <div className="flex items-center w-full overflow-hidden">
                                    {selectedRequest.workflowId?.steps.map((step, i) => (
                                        <React.Fragment key={i}>
                                            <div className={`relative flex flex-col items-center flex-1`}>
                                                <div className={`h-12 w-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10 ${i < selectedRequest.currentStepIndex || selectedRequest.status === 'approved'
                                                    ? 'bg-green-500 border-green-400 text-white'
                                                    : i === selectedRequest.currentStepIndex && selectedRequest.status === 'pending'
                                                        ? 'bg-violet-600 border-violet-400 shadow-[0_0_20px_rgba(139,92,246,0.6)] animate-pulse'
                                                        : selectedRequest.status === 'rejected' && i === selectedRequest.currentStepIndex
                                                            ? 'bg-red-500 border-red-400 text-white'
                                                            : 'bg-white/5 border-white/10 text-gray-500'
                                                    }`}>
                                                    {i < selectedRequest.currentStepIndex || selectedRequest.status === 'approved' ? <CheckCircle className="h-7 w-7" /> : i + 1}
                                                </div>
                                                <span className={`mt-4 text-[10px] font-bold uppercase tracking-wider text-center ${i === selectedRequest.currentStepIndex ? 'text-violet-400' : 'text-gray-500'
                                                    }`}>
                                                    {step.stepName}
                                                </span>

                                                {i < selectedRequest.workflowId.steps.length - 1 && (
                                                    <div className={`absolute top-6 left-1/2 w-full h-[3px] -z-0 ${i < selectedRequest.currentStepIndex || selectedRequest.status === 'approved' ? 'bg-green-500' : 'bg-white/10'
                                                        }`} />
                                                )}
                                            </div>
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>

                            {selectedRequest.status === 'pending' && (
                                <>
                                    <div className="flex-1">
                                        <div className="space-y-6">
                                            <div>
                                                <label className="flex items-center space-x-2 text-sm font-medium text-gray-400 mb-2">
                                                    <MessageSquare className="h-4 w-4" />
                                                    <span>Decision Rationale</span>
                                                </label>
                                                <textarea
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-violet-500 transition-all text-white"
                                                    rows="4"
                                                    placeholder="Provide details on why this request is being approved or rejected..."
                                                    value={comment}
                                                    onChange={(e) => setComment(e.target.value)}
                                                ></textarea>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex space-x-4 pt-8">
                                        <button
                                            onClick={() => processApproval(selectedRequest._id, 'Rejected')}
                                            className="flex-1 py-4 border border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-xl font-bold transition-all flex items-center justify-center space-x-2"
                                        >
                                            <XCircle className="h-5 w-5" />
                                            <span>Reject</span>
                                        </button>
                                        <button
                                            onClick={() => processApproval(selectedRequest._id, 'Approved')}
                                            className="flex-[2] py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-[0_4px_20px_rgba(139,92,246,0.3)] rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 text-white"
                                        >
                                            <CheckCircle className="h-5 w-5" />
                                            <span>Approve Step</span>
                                        </button>
                                    </div>
                                </>
                            )}

                            {selectedRequest.status !== 'pending' && (
                                <div className="mt-auto bg-white/5 p-6 rounded-2xl border border-white/10">
                                    <h4 className="text-sm font-semibold text-gray-400 mb-4 flex items-center">
                                        <Activity className="h-4 w-4 mr-2" />
                                        Request History
                                    </h4>
                                    <div className="space-y-3">
                                        {selectedRequest.approvalTrail?.map((trail, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-sm">
                                                <div className="flex items-center space-x-3">
                                                    <span className={`w-2 h-2 rounded-full ${trail.action === 'approved' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                    <span className="text-gray-300">{trail.stepName}</span>
                                                </div>
                                                <span className="text-gray-500 italic text-xs">
                                                    {new Date(trail.timestamp).toLocaleDateString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <div className="glass-card p-12 h-full flex flex-col items-center justify-center text-center text-gray-500 italic">
                            <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                <CheckCircle className="h-10 w-10 text-white/20" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-white/40">Queue Selection</h3>
                            <p>Select a request from the sidebar queue to review execution flow and perform actions.</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default Approvals;
