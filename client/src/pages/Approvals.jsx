import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, MessageSquare, ArrowRight, Loader2, Search, CheckSquare, GitBranch, ShieldCheck, Activity } from 'lucide-react';
import { requestService, approvalService } from '../services/api';
import { toast } from 'react-hot-toast';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

const Approvals = ({ dashboardMode = false }) => {
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
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <p className="text-content-secondary/60 font-bold uppercase tracking-[0.2em] text-[10px]">Syncing Review Queue...</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 pb-12 px-4 md:px-8 max-w-[1400px] mx-auto"
        >
            {/* Header Section: Clean Minimal Style */}
            {!dashboardMode && (
                <div className="flex flex-col md:flex-row items-center justify-between mb-8">
                    <div className="space-y-1 text-center md:text-left">
                        <h1 className="text-3xl font-semibold tracking-tight text-content-primary">
                            Approvals Management
                        </h1>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4 mt-4 md:mt-0">
                        <div className="flex bg-background p-1 rounded-xl border border-border">
                            {statusOptions.map(status => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${statusFilter === status
                                        ? 'bg-white text-primary shadow-sm border border-border'
                                        : 'text-content-secondary hover:bg-background'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center space-x-3 bg-background px-4 py-1.5 rounded-xl border border-border min-w-[200px]">
                            <span className="text-xs font-semibold text-content-secondary uppercase tracking-wider">Workflow:</span>
                            <select
                                value={selectedWorkflow}
                                onChange={(e) => setSelectedWorkflow(e.target.value)}
                                className="bg-transparent border-none text-content-primary text-sm focus:ring-0 block p-0 outline-none w-full font-semibold cursor-pointer"
                            >
                                {workflowOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}

            <div className={`grid grid-cols-1 ${dashboardMode ? '' : 'lg:grid-cols-3'} gap-12`}>
                <div className={`${dashboardMode ? '' : 'lg:col-span-1'} space-y-6`}>
                    <div className="flex items-center justify-between px-6">
                        <h3 className="text-sm font-semibold text-primary flex items-center space-x-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                            <span>Review Queue</span>
                        </h3>
                        <span className="bg-background text-primary px-3 py-1 rounded-xl text-xs font-bold border border-primary/20">
                            {filteredRequests.filter(req => !req.history?.some(h => (h.performedBy?._id === (user?._id || user?.id) || h.performedBy === (user?._id || user?.id)) && h.action === 'APPROVED')).length} Pending
                        </span>
                    </div>

                    <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredRequests.length === 0 ? (
                            <div className="bg-white/50 border border-dashed border-border p-12 rounded-[2rem] text-center flex flex-col items-center justify-center space-y-4">
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
                                            ? (isEmerald ? 'border-secondary ring-4 ring-secondary/10' : 'border-rose-500 ring-4 ring-rose-500/10')
                                            : (isEmerald ? 'border-secondary/20 hover:border-secondary' : 'border-rose-100 hover:border-rose-300')
                                            } ${selectedRequest?._id === req._id ? 'shadow-xl' : 'hover:shadow-xl hover:shadow-primary/5'}`}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <p className={`font-semibold text-lg tracking-tight truncate leading-none ${selectedRequest?._id === req._id
                                                ? (isEmerald ? 'text-secondary' : 'text-rose-600')
                                                : 'text-content-primary'
                                                }`}>{req.title}</p>
                                            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${isEmerald
                                                ? 'bg-secondary/10 text-secondary border-secondary/20'
                                                : 'bg-rose-50 text-rose-600 border-rose-100'
                                                }`}>
                                                {hasUserApproved ? 'Approved' : req.status}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <span className="text-[11px] text-primary font-bold uppercase tracking-widest leading-none">{req.templateId?.workflowName || 'Standard'}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                </div>

                {!dashboardMode && (
                <div className="lg:col-span-2">
                    {selectedRequest ? (
                        <motion.div
                            key={selectedRequest._id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col min-h-[600px]"
                        >
                            {/* Approval Path Section */}
                            <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-border hover:shadow-xl transition-all duration-300 overflow-hidden mt-0">
                                <div className="flex items-center space-x-3 mb-8 relative z-10">
                                    <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center border border-border text-primary">
                                        <GitBranch className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <h4 className="text-lg font-semibold tracking-tight text-content-primary">Approval Workflow</h4>
                                        <p className="text-xs text-gray-400 mt-0.5 font-medium">Expected sequence of organizational verification.</p>
                                    </div>
                                </div>

                                <div className="space-y-0 relative">
                                    {(function() {
                                        const steps = [];
                                        let currId = selectedRequest.templateId?.nodes?.find(n => n.type === 'START')?.nodeId;
                                        while (currId) {
                                            const found = selectedRequest.templateId.nodes.find(n => n.nodeId === currId);
                                            if (!found || found.type === 'END') break;
                                            steps.push(found);
                                            currId = found.onApprove;
                                        }

                                        return steps.map((node, i) => {
                                            const isStepApproved = selectedRequest.history?.some(h =>
                                                h.nodeId === node.nodeId && (h.action === 'APPROVED' || h.action === 'SUBMITTED')
                                            );
                                            const isCurrentStep = selectedRequest.currentNodeId === node.nodeId;
                                            const isLastStep = i === steps.length - 1;

                                            return (
                                                <div key={i} className="flex items-start space-x-6 group/step relative">
                                                    <div className="relative shrink-0 w-12 flex flex-col items-center">
                                                        <div className="absolute top-0 bottom-0 w-[3px] bg-background/50 rounded-full" />
                                                        <div className={`absolute top-0 h-1/2 w-[3px] rounded-full transition-all duration-700 ${isStepApproved || isCurrentStep ? 'bg-secondary' : 'bg-transparent'
                                                            }`} style={{ display: i === 0 ? 'none' : 'block' }} />
                                                        <div className={`absolute top-1/2 bottom-0 w-[3px] rounded-full transition-all duration-700 ${isStepApproved ? 'bg-secondary' : (isCurrentStep ? 'bg-rose-500' : 'bg-transparent')
                                                            }`} />
                                                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center border-2 shadow-sm relative z-10 transition-all duration-500 transform group-hover/step:scale-105 ${isStepApproved
                                                            ? 'bg-secondary text-white border-secondary/20 shadow-lg shadow-secondary/20'
                                                            : (isCurrentStep
                                                                ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/20 ring-4 ring-rose-500/5'
                                                                : 'bg-white border-border text-content-secondary/20 group-hover/step:border-primary group-hover/step:text-primary')
                                                            }`}>
                                                            {isStepApproved ? <CheckCircle className="h-6 w-6" /> : (isCurrentStep ? <Activity className="h-6 w-6 animate-pulse" /> : <span className="font-bold text-base">{i + 1}</span>)}
                                                            {isCurrentStep && <div className="absolute -inset-1 rounded-xl border-2 border-rose-500 animate-ping opacity-20" />}
                                                        </div>
                                                    </div>

                                                    <div className="pt-2 pb-8 flex flex-col items-start space-y-2">
                                                        <div className="flex items-center space-x-2">
                                                            <h5 className={`text-lg font-bold tracking-tight transition-colors duration-500 ${isStepApproved ? 'text-secondary/80' : (isCurrentStep ? 'text-rose-700' : 'text-content-primary')}`}>
                                                                {node.title || (node.type === 'START' ? 'Request Submission' : node.nodeId)}
                                                            </h5>
                                                            {isStepApproved && <div className="bg-secondary/10 text-secondary text-[9px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-tighter border border-secondary/20">{node.type === 'START' ? 'Submitted' : 'Verified'}</div>}
                                                        </div>
                                                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-xl border backdrop-blur-sm transition-all duration-500 ${isStepApproved ? 'bg-secondary/5 border-secondary/10' : (isCurrentStep ? 'bg-rose-50/80 border-rose-100' : 'bg-background border-border')}`}>
                                                            <ShieldCheck className={`h-3.5 w-3.5 ${isStepApproved ? 'text-secondary' : (isCurrentStep ? 'text-rose-500' : 'text-content-secondary/40')}`} />
                                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${isStepApproved ? 'text-secondary' : (isCurrentStep ? 'text-rose-600' : 'text-content-secondary')}`}>
                                                                Authority: {node.type === 'START' ? (selectedRequest.requesterId?.role || 'Employee') : (node.approverRoles?.join(', ') || 'Executive')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}

                                    <div className="flex items-start space-x-6 group/final relative">
                                        <div className="relative shrink-0 w-12 flex flex-col items-center">
                                            <div className="absolute top-0 h-1/2 w-[3px] bg-background/50 rounded-full" />
                                            <div className={`absolute top-0 h-1/2 w-[3px] rounded-full transition-all duration-700 ${selectedRequest.status === 'approved' || selectedRequest.status === 'Completed' ? 'bg-secondary' : 'bg-background/50'}`} />
                                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center border-2 shadow-sm z-10 transition-all duration-700 ${selectedRequest.status === 'approved' || selectedRequest.status === 'Completed' ? 'bg-secondary text-white border-secondary/20 shadow-lg shadow-secondary/20' : 'bg-white border-border text-content-secondary/20'}`}>
                                                <CheckCircle className="h-6 w-6" />
                                            </div>
                                        </div>
                                        <div className="pt-2 flex flex-col items-start space-y-0.5">
                                            <h5 className={`text-lg font-bold tracking-tight transition-colors duration-700 ${selectedRequest.status === 'approved' || selectedRequest.status === 'Completed' ? 'text-secondary' : 'text-content-secondary/20'}`}>Final Resolution</h5>
                                            <p className="text-xs text-gray-400 font-medium max-w-[250px] leading-relaxed">Workflow automatically finalized once all verification benchmarks are satisfied.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {selectedRequest.status === 'pending' && (
                                <div className="flex flex-col flex-1 mt-auto">
                                    <div className="mt-8">
                                        <label className="flex items-center space-x-2 text-xs font-semibold text-primary mb-4 ml-4">
                                            <MessageSquare className="h-4 w-4" />
                                            <span>Approval Decision Comment <span className="text-red-500">*</span></span>
                                        </label>
                                        <textarea
                                            className="w-full bg-background border border-border rounded-[2rem] p-6 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-content-primary placeholder-content-secondary/40 font-medium text-lg shadow-sm"
                                            rows="4"
                                            placeholder="Document the basis for this decision..."
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            required
                                        ></textarea>
                                    </div>
                                    <div className="flex gap-4 pt-8">
                                        <button onClick={() => processApproval(selectedRequest._id, 'Rejected')} disabled={!comment.trim() || actionLoading} className="flex-1 bg-white hover:bg-red-50 text-content-secondary hover:text-red-600 px-6 py-4 rounded-2xl flex items-center justify-center space-x-3 border border-border transition-all disabled:opacity-50 font-semibold">
                                            {actionLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                                            <span>Purge</span>
                                        </button>
                                        <button onClick={() => processApproval(selectedRequest._id, 'Approved')} disabled={!comment.trim() || actionLoading} className="flex-[2] bg-primary hover:bg-hover text-white px-6 py-4 rounded-2xl flex items-center justify-center space-x-3 shadow-lg shadow-primary/10 transition-all hover:scale-[1.02] disabled:opacity-50 font-semibold">
                                            {actionLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                                            <span>Authorize Approval</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ) : null}
                </div>
                )}
            </div>
        </motion.div>
    );
};

export default Approvals;
