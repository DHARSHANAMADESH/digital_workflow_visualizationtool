import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, MessageSquare, ArrowRight, Loader2, Search, CheckSquare, GitBranch, ShieldCheck, Activity } from 'lucide-react';
import { requestService, approvalService } from '../services/api';
import { toast } from 'react-hot-toast';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

const Approvals = () => {
    const { user } = useAuth();
    const [allRequests, setAllRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [selectedWorkflow, setSelectedWorkflow] = useState('All');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [comment, setComment] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        fetchRequests();
    }, []);

    useEffect(() => {
        applyFilter();
    }, [selectedWorkflow, statusFilter, allRequests]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
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
        let filtered = allRequests;
        if (selectedWorkflow !== 'All') {
            filtered = filtered.filter(req => req.templateId?.workflowName === selectedWorkflow);
        }
        if (statusFilter !== 'All') {
            filtered = filtered.filter(req => (req.status || '').toLowerCase() === statusFilter.toLowerCase());
        }
        setFilteredRequests(filtered);
    };

    const statusOptions = ['All', 'Pending', 'Approved', 'Rejected'];
    const workflowOptions = ['All', ...new Set(allRequests.map(req => req.templateId?.workflowName).filter(Boolean))];

    const processApproval = async (requestId, action) => {
        if (!comment.trim()) {
            toast.error('Approval comment is mandatory');
            return;
        }
        try {
            setActionLoading(true);
            await requestService.approve({
                requestId,
                action,
                performedBy: user?._id || user?.id,
                comment
            });

            toast.success(`Request ${action === 'Approved' ? 'Authorized' : 'Purged'}`);
            setSelectedRequest(null);
            setComment('');

            // Broadcast refresh signal for sidebar badge
            window.dispatchEvent(new CustomEvent('approvals-updated'));

            await fetchRequests();
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to process approval';
            toast.error(message);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-6">
                <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
                <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px]">Syncing Review Queue</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 pb-12 px-4 md:px-8 max-w-[1400px] mx-auto"
        >
            {/* Header Section: Manager Dashboard Style */}
            <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500 p-10 rounded-[2rem] shadow-lg shadow-indigo-500/20 flex flex-col md:flex-row items-center justify-between relative overflow-hidden ring-1 ring-white/20">
                <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-12 -translate-y-12">
                    <CheckSquare className="w-64 h-64 text-white" />
                </div>

                <div className="relative z-10 space-y-2 text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white flex items-center justify-center md:justify-start">
                        Approvals Management
                    </h1>
                    <p className="text-indigo-100 text-lg font-medium flex items-center justify-center md:justify-start">
                        <GitBranch className="w-5 h-5 mr-2 opacity-70" />
                        Review and authorize pending team requests.
                    </p>
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-4 mt-6 md:mt-0">
                    <div className="flex bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/20">
                        {statusOptions.map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${statusFilter === status
                                    ? 'bg-white text-indigo-600 shadow-md'
                                    : 'text-indigo-50 hover:bg-white/10'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-white min-w-[200px]">
                        <span className="text-xs font-bold text-indigo-100 uppercase tracking-wider">Workflow:</span>
                        <select
                            value={selectedWorkflow}
                            onChange={(e) => setSelectedWorkflow(e.target.value)}
                            className="bg-transparent border-none text-white text-sm focus:ring-0 block p-0 outline-none w-full font-semibold cursor-pointer"
                        >
                            {workflowOptions.map(option => (
                                <option key={option} value={option} className="text-gray-900 bg-white">{option}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-1 space-y-6">
                    <div className="flex items-center justify-between px-6">
                        <h3 className="text-sm font-semibold text-indigo-600 flex items-center space-x-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
                            <span>Review Queue</span>
                        </h3>
                        <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-xl text-xs font-bold border border-indigo-100">
                            {filteredRequests.filter(req => !req.history?.some(h => (h.performedBy?._id === (user?._id || user?.id) || h.performedBy === (user?._id || user?.id)) && h.action === 'APPROVED')).length} Pending
                        </span>
                    </div>

                    <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredRequests.length === 0 ? (
                            <div className="bg-white/50 border border-dashed border-gray-200 p-12 rounded-[2rem] text-center flex flex-col items-center justify-center space-y-4">
                                <Search className="h-8 w-8 text-gray-200" />
                                <p className="text-gray-400 font-medium text-sm">No pending requests</p>
                            </div>
                        ) : (
                            filteredRequests.map(req => {
                                const hasUserApproved = req.history?.some(h =>
                                    (h.performedBy?._id === (user?._id || user?.id) || h.performedBy === (user?._id || user?.id)) && h.action === 'APPROVED'
                                );
                                const isEmerald = req.status === 'approved' || hasUserApproved;

                                return (
                                    <motion.div
                                        whileHover={{ x: 4 }}
                                        key={req._id}
                                        onClick={() => setSelectedRequest(req)}
                                        className={`bg-white p-6 rounded-[2rem] cursor-pointer transition-all border shadow-sm group ${selectedRequest?._id === req._id
                                            ? (isEmerald ? 'border-emerald-500 ring-4 ring-emerald-500/10' : 'border-red-500 ring-4 ring-red-500/10')
                                            : (isEmerald ? 'border-emerald-100 hover:border-emerald-300' : 'border-red-100 hover:border-red-300')
                                            } ${selectedRequest?._id === req._id ? 'shadow-xl' : 'hover:shadow-xl hover:shadow-indigo-500/5'}`}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <p className={`font-semibold text-lg tracking-tight truncate leading-none ${selectedRequest?._id === req._id
                                                ? (isEmerald ? 'text-emerald-600' : 'text-red-600')
                                                : 'text-gray-900'
                                                }`}>{req.title}</p>
                                            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${isEmerald
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                : 'bg-red-50 text-red-600 border-red-100'
                                                }`}>
                                                {hasUserApproved ? 'Approved' : req.status}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <span className="text-[11px] text-indigo-500 font-semibold uppercase tracking-wider leading-none">{req.templateId?.workflowName || 'Standard'}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2">
                    {selectedRequest ? (
                        <motion.div
                            key={selectedRequest._id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col min-h-[600px]"
                        >
                            {/* Approval Path Section */}
                            <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100 ring-1 ring-black/5 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 overflow-hidden mt-0">
                                <div className="flex items-center space-x-3 mb-8 relative z-10">
                                    <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 text-indigo-600">
                                        <GitBranch className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <h4 className="text-lg font-semibold tracking-tight text-gray-900">Approval Workflow</h4>
                                        <p className="text-xs text-gray-400 mt-0.5 font-medium">Expected sequence of organizational verification.</p>
                                    </div>
                                </div>

                                <div className="space-y-0 relative">
                                    {selectedRequest.templateId?.nodes?.filter(n => n.type === 'APPROVAL').map((node, i) => {
                                        const isStepApproved = selectedRequest.history?.some(h =>
                                            h.nodeId === node.nodeId && (h.action === 'APPROVED' || h.status === 'APPROVED')
                                        );
                                        const isCurrentStep = selectedRequest.currentNodeId === node.nodeId;

                                        return (
                                            <div key={i} className="flex items-start space-x-6 group/step relative">
                                                <div className="relative shrink-0 w-12 flex flex-col items-center">
                                                    <div className="absolute top-0 bottom-0 w-[3px] bg-indigo-50/50 rounded-full" />
                                                    <div className={`absolute top-0 h-1/2 w-[3px] rounded-full transition-all duration-700 ${isStepApproved || isCurrentStep ? 'bg-emerald-500' : 'bg-transparent'
                                                        }`} style={{ display: i === 0 ? 'none' : 'block' }} />
                                                    <div className={`absolute top-1/2 bottom-0 w-[3px] rounded-full transition-all duration-700 ${isStepApproved ? 'bg-emerald-500' : (isCurrentStep ? 'bg-red-500' : 'bg-transparent')
                                                        }`} />
                                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center border-2 shadow-sm relative z-10 transition-all duration-500 transform group-hover/step:scale-105 ${isStepApproved
                                                        ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20'
                                                        : (isCurrentStep
                                                            ? 'bg-red-500 text-white border-red-400 shadow-lg shadow-red-500/20 ring-4 ring-red-500/5'
                                                            : 'bg-white border-indigo-100 text-indigo-400 group-hover/step:border-indigo-600 group-hover/step:text-indigo-600')
                                                        }`}>
                                                        {isStepApproved ? <CheckCircle className="h-6 w-6" /> : (isCurrentStep ? <Activity className="h-6 w-6 animate-pulse" /> : <span className="font-bold text-base">{i + 1}</span>)}
                                                        {isCurrentStep && <div className="absolute -inset-1 rounded-xl border-2 border-red-500 animate-ping opacity-20" />}
                                                    </div>
                                                </div>

                                                <div className="pt-2 pb-8 flex flex-col items-start space-y-2">
                                                    <div className="flex items-center space-x-2">
                                                        <h5 className={`text-lg font-bold tracking-tight transition-colors duration-500 ${isStepApproved ? 'text-emerald-800' : (isCurrentStep ? 'text-red-700' : 'text-gray-900')}`}>
                                                            {node.title || node.nodeId}
                                                        </h5>
                                                        {isStepApproved && <div className="bg-emerald-100 text-emerald-700 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter border border-emerald-200">Verified</div>}
                                                    </div>
                                                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-xl border backdrop-blur-sm transition-all duration-500 ${isStepApproved ? 'bg-emerald-50/80 border-emerald-100' : (isCurrentStep ? 'bg-red-50/80 border-red-100' : 'bg-gray-50/50 border-gray-100')}`}>
                                                        <ShieldCheck className={`h-3.5 w-3.5 ${isStepApproved ? 'text-emerald-500' : (isCurrentStep ? 'text-red-500' : 'text-gray-400')}`} />
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isStepApproved ? 'text-emerald-600' : (isCurrentStep ? 'text-red-600' : 'text-gray-500')}`}>Authority: {node.approverRoles?.[0] || 'Executive'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    <div className="flex items-start space-x-6 group/final relative">
                                        <div className="relative shrink-0 w-12 flex flex-col items-center">
                                            <div className="absolute top-0 h-1/2 w-[3px] bg-indigo-50/50 rounded-full" />
                                            <div className={`absolute top-0 h-1/2 w-[3px] rounded-full transition-all duration-700 ${selectedRequest.status === 'approved' || selectedRequest.status === 'Completed' ? 'bg-emerald-500' : 'bg-indigo-50/50'}`} />
                                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center border-2 shadow-sm z-10 transition-all duration-700 ${selectedRequest.status === 'approved' || selectedRequest.status === 'Completed' ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20' : 'bg-white border-indigo-50 text-indigo-100'}`}>
                                                <CheckCircle className="h-6 w-6" />
                                            </div>
                                        </div>
                                        <div className="pt-2 flex flex-col items-start space-y-0.5">
                                            <h5 className={`text-lg font-bold tracking-tight transition-colors duration-700 ${selectedRequest.status === 'approved' || selectedRequest.status === 'Completed' ? 'text-emerald-800' : 'text-gray-300'}`}>Final Resolution</h5>
                                            <p className="text-xs text-gray-400 font-medium max-w-[250px] leading-relaxed">Workflow automatically finalized once all verification benchmarks are satisfied.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {selectedRequest.status === 'pending' && (
                                <div className="flex flex-col flex-1 mt-auto">
                                    <div className="mt-8">
                                        <label className="flex items-center space-x-2 text-xs font-semibold text-indigo-600 mb-4 ml-4">
                                            <MessageSquare className="h-4 w-4" />
                                            <span>Approval Decision Comment <span className="text-red-500">*</span></span>
                                        </label>
                                        <textarea
                                            className="w-full bg-white border border-gray-100 rounded-[2rem] p-6 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-gray-900 placeholder-gray-400 font-medium text-lg shadow-sm"
                                            rows="4"
                                            placeholder="Document the basis for this decision..."
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            required
                                        ></textarea>
                                    </div>
                                    <div className="flex gap-4 pt-8">
                                        <button onClick={() => processApproval(selectedRequest._id, 'Rejected')} disabled={!comment.trim() || actionLoading} className="flex-1 bg-white hover:bg-red-50 text-gray-500 hover:text-red-600 px-6 py-4 rounded-2xl flex items-center justify-center space-x-3 border border-gray-100 transition-all disabled:opacity-50 font-semibold">
                                            {actionLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                                            <span>Purge</span>
                                        </button>
                                        <button onClick={() => processApproval(selectedRequest._id, 'Approved')} disabled={!comment.trim() || actionLoading} className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-2xl flex items-center justify-center space-x-3 shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] disabled:opacity-50 font-semibold">
                                            {actionLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                                            <span>Authorize Approval</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <div className="bg-white p-20 h-full flex flex-col items-center justify-center text-center rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden ring-1 ring-black/5">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-[80px]" />
                            <div className="h-24 w-24 rounded-[2rem] bg-indigo-50 flex items-center justify-center mb-8 border border-indigo-100">
                                <CheckSquare className="h-10 w-10 text-indigo-600" />
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900 tracking-tight mb-2">Review Pending</h3>
                            <p className="text-gray-500 font-medium max-w-xs leading-relaxed">Select a request from the queue to start the verification process.</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default Approvals;
