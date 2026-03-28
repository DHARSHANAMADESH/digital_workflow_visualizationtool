import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { requestService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    ArrowLeft,
    Loader2,
    Clock,
    CheckCircle2,
    XCircle,
    Calendar,
    User as UserIcon,
    History,
    FileText,
    Activity,
    ChevronRight,
    Paperclip,
    MessageSquare,
    CheckCircle,
    ShieldAlert
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import StatusBadge from '../components/StatusBadge';

const ShieldCheck = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .89-.99c6.01-.6 11.23-2.15 11.23-2.15a1 1 0 0 1 .5 0s5.22 1.55 11.23 2.15A1 1 0 0 1 20 6Z"/><path d="m9 12 2 2 4-4"/></svg>
);

const RequestDetails = () => {
    const { requestId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [comment, setComment] = useState('');

    useEffect(() => {
        fetchRequest();
    }, [requestId]);

    const fetchRequest = async () => {
        try {
            setLoading(true);
            const response = await requestService.getById(requestId);
            setRequest(response.data);
        } catch {
            toast.error('Failed to load request details');
        } finally {
            setLoading(false);
        }
    };

    const isApprover = useMemo(() => {
        if (!request || !user || request.status !== 'pending') return false;
        
        // Check if current user role matches any pending approval role
        return request.pendingApprovals?.some(pa => 
            pa.status === 'pending' && 
            pa.role?.toLowerCase() === user.role?.toLowerCase()
        );
    }, [request, user]);

    const handleAction = async (action) => {
        if (!comment.trim()) {
            toast.error('Please provide a comment for your decision');
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

            toast.success(`Request ${action === 'Approved' ? 'Authorized' : 'Rejected'} successfully`);
            setComment('');
            
            // Broadcast refresh for sidebar badges
            window.dispatchEvent(new CustomEvent('approvals-updated'));
            
            // Reload request to show updated status
            await fetchRequest();
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to process decision';
            toast.error(message);
        } finally {
            setActionLoading(false);
        }
    };

    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const workflowSteps = React.useMemo(() => {
        if (!request || !request.templateId?.nodes) return [];
        
        const steps = [];
        let currentNodeId = request.templateId.nodes.find(n => n.type === 'START')?.nodeId;
        
        while (currentNodeId) {
            const node = request.templateId.nodes.find(n => n.nodeId === currentNodeId);
            if (!node || node.type === 'END') break;
            
            steps.push({
                id: node.nodeId,
                label: node.title || (node.type === 'START' ? 'Submission' : 'Approval'),
                role: node.approverRoles?.length > 0 ? `ROLE: ${node.approverRoles.join(', ')}` : (node.type === 'START' ? 'SENDER' : 'SYSTEM'),
                node: node
            });
            
            currentNodeId = node.onApprove;
        }
        return steps;
    }, [request]);

    const getStepStatus = (stepId, index) => {
        if (!request) return 'upcoming';
        
        // Find if there are ANY pending approvals for this node
        const hasPending = request.pendingApprovals?.some(pa => pa.nodeId === stepId && pa.status === 'pending');
        
        // Find if this step is explicitly approved in history
        const isApproved = request.history?.some(h => h.nodeId === stepId && (h.action === 'APPROVED' || h.action === 'SUBMITTED'));
        const isRejected = request.history?.some(h => h.nodeId === stepId && h.action === 'REJECTED');

        if (isRejected) return 'rejected';
        if (isApproved && !hasPending) return 'completed';

        // Check if it's the current node
        if (request.currentNodeId === stepId) {
            if (request.status === 'pending') return 'current';
            if (request.status === 'rejected') return 'rejected';
        }

        // Special case for fully approved requests
        if (request.status === 'approved') return 'completed';

        // Check sequence as fallback, but respect pending status
        const currentIndexInSequence = workflowSteps.findIndex(s => s.id === request.currentNodeId);
        if (currentIndexInSequence > index) {
            return hasPending ? 'current' : 'completed';
        }

        return 'upcoming';
    };

    const getApprovalDetails = (node) => {
        if (!request) return { status: 'Waiting' };
        
        // Find if there are ANY pending approvals for this node
        const hasPending = request.pendingApprovals?.some(pa => pa.nodeId === node.nodeId && pa.status === 'pending');
        
        // Find explicit approval in history for this specific node
        const historyAction = request.history?.find(h => 
            h.nodeId === node.nodeId && (h.action === 'APPROVED' || h.action === 'SUBMITTED')
        );

        if (historyAction && !hasPending) {
            return {
                status: historyAction.action === 'SUBMITTED' ? 'Submitted' : 'Approved',
                date: new Date(historyAction.timestamp).toLocaleString()
            };
        }

        if (request.status === 'approved') {
            return {
                status: 'Approved',
                date: 'Completed'
            };
        }

        if (request.currentNodeId === node.nodeId) {
            return { status: 'Pending' };
        }

        // Check if passed already
        const currentIndexInSequence = workflowSteps.findIndex(s => s.id === request.currentNodeId);
        const nodeIndex = workflowSteps.findIndex(s => s.id === node.nodeId);
        
        if (currentIndexInSequence > nodeIndex && nodeIndex !== -1) {
             return hasPending ? { status: 'Pending' } : { status: 'Approved', date: 'Passed' };
        }

        return { status: 'Waiting' };
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-content-secondary font-medium tracking-wide">Retrieving request data from secure nodes...</p>
            </div>
        );
    }

    if (!request) return (
        <div className="text-center py-20 bg-white rounded-2xl border border-border shadow-sm">
            <XCircle className="mx-auto h-16 w-16 text-red-400 mb-4" />
            <h2 className="text-xl font-semibold text-content-primary">Request Not Found</h2>
            <p className="text-content-secondary mt-2">The request you are looking for does not exist.</p>
            <button onClick={() => navigate(-1)} className="mt-6 px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors">Go Back</button>
        </div>
    );

    const currentNode = request.templateId?.nodes?.find(n => n.nodeId === request.currentNodeId);

    const getTimelineEvent = (milestoneId) => {
        if (milestoneId === 'SUBMITTED') {
            return request.history?.find(h => h.action === 'SUBMITTED');
        }
        return request.history?.find(h =>
            (h.action === 'APPROVED' || h.action === 'REJECTED') &&
            h.nodeId?.toLowerCase().includes(milestoneId.toLowerCase())
        );
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center space-x-2 text-content-secondary hover:text-primary transition-all font-bold text-[10px] uppercase tracking-widest mb-2 group"
                    >
                        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
                        <span>Return to dashboard</span>
                    </button>
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-extrabold text-content-primary tracking-tight">{request.title}</h1>
                        <StatusBadge status={request.status} className="h-fit" />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-content-secondary font-medium">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-primary font-bold">
                            <FileText className="h-4 w-4" />
                            <span>{request.templateId?.workflowName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-gray-400" />
                            <span className="uppercase tracking-widest text-[10px] font-bold">
                                {request.status === 'pending' ? currentNode?.title || 'Processing' : request.status}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center -space-x-3">
                    {request.templateId?.nodes?.filter(n => n.type !== 'END').map((node, i) => (
                        <div key={i} className={`h-10 w-10 rounded-full border-4 border-white flex items-center justify-center text-[10px] font-black shadow-sm ${request.currentNodeId === node.nodeId ? 'bg-primary text-white animate-pulse' : 'bg-background text-content-secondary/40'}`}>
                            {i + 1}
                        </div>
                    ))}
                </div>
            </div>

            {/* Workflow Visualization */}
            <div className="bg-white rounded-[32px] border border-border shadow-sm p-8">
                <div className="flex items-center gap-3 mb-4 overflow-x-auto pb-4 scrollbar-hide">
                    {workflowSteps.map((step, idx) => {
                        const status = getStepStatus(step.id, idx);
                        const isLast = idx === workflowSteps.length - 1;
                        
                        return (
                            <React.Fragment key={step.id}>
                                <div className="flex items-center gap-4 shrink-0">
                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 shadow-sm ${
                                        status === 'completed' ? 'bg-secondary border-secondary/20 text-white' :
                                        status === 'current' ? 'bg-secondary border-secondary text-white' :
                                        status === 'rejected' ? 'bg-rose-500 border-rose-400 text-white' :
                                        'bg-background border-border text-content-secondary/20'
                                    }`}>
                                        {status === 'completed' ? <CheckCircle2 className="h-6 w-6" /> : 
                                         status === 'rejected' ? <XCircle className="h-6 w-6" /> : 
                                         <span className="font-black">{idx + 1}</span>}
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] text-gray-400`}>
                                            Step {idx + 1}
                                        </p>
                                        <h4 className={`text-sm font-bold tracking-tight ${status === 'upcoming' ? 'text-gray-300' : 'text-content-primary'}`}>{step.label}</h4>
                                    </div>
                                </div>
                                {!isLast && (
                                    <div className={`h-0.5 w-12 rounded-full mx-2 ${status === 'completed' ? 'bg-secondary' : 'bg-border'}`} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Decision Panel (Light UI version) */}
                    {isApprover && (
                        <div className="bg-white border-2 border-primary rounded-[32px] p-8 md:p-10 text-content-primary shadow-2xl shadow-primary/5 animate-in zoom-in duration-300">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                                    <ShieldCheck className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black tracking-tight text-primary">Pending Approval</h3>
                                    <p className="text-content-secondary text-xs font-bold uppercase tracking-widest opacity-60">Authentication & Verification Protocol Required</p>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-content-secondary/60">
                                        <MessageSquare className="h-3.5 w-3.5 text-primary" />
                                        <span>Official Decision Comment</span>
                                    </label>
                                    <textarea
                                        rows="4"
                                        className="w-full bg-background border border-border rounded-2xl p-4 text-content-primary placeholder-content-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                                        placeholder="Document your reasoning for audit compliance..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                    />
                                </div>
                                
                                <div className="flex flex-col md:flex-row gap-4 pt-4">
                                    <button
                                        onClick={() => handleAction('Rejected')}
                                        disabled={actionLoading}
                                        className="flex-1 bg-background hover:bg-rose-500 text-content-secondary hover:text-white rounded-2xl py-4 font-black text-xs uppercase tracking-[0.2em] transition-all border border-border hover:border-rose-400 flex items-center justify-center space-x-2"
                                    >
                                        {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                                        <span>Reject Request</span>
                                    </button>
                                    <button
                                        onClick={() => handleAction('Approved')}
                                        disabled={actionLoading}
                                        className="flex-[2] bg-primary hover:bg-hover text-white rounded-2xl py-4 font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-primary/10 flex items-center justify-center space-x-2 border border-primary/20"
                                    >
                                        {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                                        <span>Authorize Approval</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Data Card */}
                    <div className="bg-white rounded-[32px] border border-border shadow-sm overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-content-primary">Request Data</h3>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">ID: #{requestId.slice(-8).toUpperCase()}</span>
                        </div>
                        <div className="p-8 space-y-10">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-2">Description</label>
                                <p className="text-gray-600 text-sm leading-relaxed font-medium">
                                    {request.description || 'No formal description provided.'}
                                </p>
                            </div>

                            {request.formData && Object.keys(request.formData).length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {Object.entries(request.formData).map(([key, value]) => (
                                        <div key={key} className="p-5 rounded-2xl bg-background/50 border border-border group hover:border-primary/20 transition-colors">
                                            <label className="text-[10px] font-black text-content-secondary/60 uppercase tracking-widest block mb-1 group-hover:text-primary transition-colors">{key}</label>
                                            <p className="text-sm font-black text-content-primary">{value?.toString()}</p>
                                        </div>
                                    ))}
                                </div>
                            )}


                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                    {/* Approval Summary Card */}
                    <div className="bg-white rounded-[32px] border border-border shadow-sm p-8">
                        <h3 className="text-lg font-bold text-content-primary mb-8 font-black uppercase tracking-tighter">Role Clearances</h3>
                        <div className="space-y-6">
                            {workflowSteps.filter(s => s.node?.type === 'APPROVAL').map(step => {
                                const details = getApprovalDetails(step.node);
                                return (
                                    <div key={step.id} className="relative pl-6 border-l-2 border-border py-1">
                                        <div className={`absolute left-[-2px] top-0 bottom-0 w-0.5 rounded-full ${
                                            details.status === 'Approved' ? 'bg-secondary' :
                                            details.status === 'Pending' ? 'bg-primary' : 
                                            details.status === 'Rejected' ? 'bg-rose-500' :
                                            'bg-border'
                                        }`} />
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{step.label}</span>
                                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                                details.status === 'Approved' ? 'bg-secondary/10 text-secondary' :
                                                details.status === 'Pending' ? 'bg-background text-primary animate-pulse' :
                                                'bg-background text-content-secondary/40'
                                            }`}>
                                                {details.status}
                                            </span>
                                        </div>
                                        <p className="text-xs font-bold text-content-primary tracking-tight">
                                            {step.role.replace('ROLE: ', '')}
                                        </p>
                                        {details.date && (
                                            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
                                                <History className="h-3 w-3" />
                                                <span>{details.date}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Requester Info */}
                    <div className="bg-white rounded-[32px] border border-border shadow-sm p-8">
                         <h3 className="text-lg font-bold text-content-primary mb-6 uppercase tracking-tighter font-black">Origin Details</h3>
                         <div className="flex items-center gap-4 mb-6">
                            <div className="h-14 w-14 rounded-2xl bg-background text-primary flex items-center justify-center text-lg font-black italic shadow-inner">
                                {getInitials(request.requesterId?.name)}
                            </div>
                            <div>
                                <h4 className="text-base font-black text-content-primary tracking-tight leading-none mb-1">{request.requesterId?.name || 'Unknown User'}</h4>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">{request.requesterId?.role || 'Employee'}</p>
                            </div>
                         </div>
                         <div className="space-y-4 pt-6 border-t border-gray-50">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Employee ID</span>
                                <span className="text-xs font-black text-content-primary uppercase">#{request.requesterId?._id?.slice(-6).toUpperCase() || 'SYS-00'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Node</span>
                                <span className="text-xs font-bold text-primary lowercase tracking-tighter italic font-medium">{request.requesterId?.email || 'N/A'}</span>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestDetails;
