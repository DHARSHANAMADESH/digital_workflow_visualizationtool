import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { requestService } from '../services/api';
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
    MessageSquare,
    ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import StatusBadge from '../components/StatusBadge';

const RequestDetails = () => {
    const { requestId } = useParams();
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequest();
    }, [requestId]);

    const fetchRequest = async () => {
        try {
            const response = await requestService.getById(requestId);
            setRequest(response.data);
        } catch (error) {
            toast.error('Failed to load request details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-10 w-10 text-violet-500 animate-spin" />
                <p className="text-gray-400">Retrieving secure request context...</p>
            </div>
        );
    }

    if (!request) return (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
            <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4 opacity-50" />
            <h2 className="text-2xl font-bold">Request Not Found</h2>
            <p className="text-gray-400 mt-2">The requested document may have been purged or relocated.</p>
            <button onClick={() => navigate('/employee/dashboard')} className="mt-8 btn-primary">Return to Dashboard</button>
        </div>
    );

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved': return <CheckCircle2 className="h-5 w-5 text-green-400" />;
            case 'rejected': return <XCircle className="h-5 w-5 text-red-400" />;
            default: return <Clock className="h-5 w-5 text-violet-400" />;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto space-y-8 pb-20"
        >
            <div className="flex items-center justify-between">
                <button onClick={() => navigate('/employee/dashboard')} className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors group">
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Activity</span>
                </button>
                <div className="flex items-center space-x-2 text-xs font-medium uppercase text-gray-600">
                    <span>Document ID</span>
                    <span className="text-gray-400">/{request._id.slice(-8)}</span>
                </div>
            </div>

            {/* Header Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card p-10 border border-white/10 relative overflow-hidden bg-gradient-to-br from-[#1a1635]/80 to-[#2e1d4a]/80">
                        <div className="absolute top-0 right-0 p-8">
                            <StatusBadge status={request.status} />
                        </div>

                        <div className="space-y-4 max-w-2xl">
                            <div className="flex items-center space-x-3 text-violet-400">
                                <FileText className="h-5 w-5" />
                                <span className="text-xs font-semibold uppercase tracking-wider">{request.workflowId?.workflowName}</span>
                            </div>
                            <h1 className="text-white">{request.title}</h1>
                            <p className="text-gray-400 text-lg">{request.description}</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-2 gap-6 mt-12 pt-10 border-t border-white/5">
                            <div className="flex items-center space-x-4">
                                <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500">
                                    <Calendar className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[11px] uppercase font-semibold text-gray-500">Submitted On</p>
                                    <p className="font-semibold text-gray-300">{new Date(request.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500">
                                    <Activity className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 hover:text-white transition-colors">Current Phase</p>
                                    <p className="font-semibold text-white">
                                        {request.status === 'pending'
                                            ? request.workflowId?.steps[request.currentStepIndex]?.stepName
                                            : request.status.toUpperCase()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Metadata / Form Data Section */}
                    {Object.keys(request.formData || {}).length > 0 && (
                        <div className="glass-card p-8 border border-white/10">
                            <h3 className="text-lg font-bold mb-6 flex items-center space-x-3 text-white">
                                <div className="h-2 w-2 rounded-full bg-violet-500" />
                                <span>Submission Metadata</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {Object.entries(request.formData).map(([key, value]) => (
                                    <div key={key} className="space-y-1 bg-white/5 p-4 rounded-xl border border-white/5">
                                        <p className="text-xs uppercase font-semibold text-gray-500">{key}</p>
                                        <p className="font-medium text-gray-200">{value?.toString() || '--'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar: Approval Timeline */}
                <div className="space-y-6">
                    <div className="glass-card p-8 border border-white/10 bg-black/20">
                        <h3 className="flex items-center space-x-3 text-gray-200 uppercase tracking-tight mb-8">
                            <History className="h-5 w-5 text-violet-500" />
                            <span>Process Registry</span>
                        </h3>

                        <div className="space-y-10 relative">
                            {/* The vertical line */}
                            <div className="absolute left-[15px] top-[20px] bottom-[20px] w-[2px] bg-gradient-to-b from-violet-500/50 via-white/5 to-transparent" />

                            {request.approvalTrail.map((log, idx) => (
                                <div key={idx} className="relative flex items-start space-x-5 group">
                                    <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center flex-none relative z-10 transition-all duration-500 ${log.action === 'Approved'
                                        ? 'bg-green-500/20 border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                                        : 'bg-red-500/20 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                                        }`}>
                                        {log.action === 'Approved' ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <XCircle className="h-4 w-4 text-red-500" />}
                                    </div>
                                    <div className="space-y-2 flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-[14px] font-semibold text-white">{log.stepName}</h4>
                                            <span className="text-[10px] text-gray-600 font-medium whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-lg border border-white/5">
                                            <div className="h-6 w-6 rounded-full bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                                                <UserIcon className="h-3 w-3 text-violet-400" />
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-400">{log.performedBy?.name || 'Authorized System'}</span>
                                        </div>
                                        {log.comment && (
                                            <div className="flex items-start space-x-2 mt-2">
                                                <MessageSquare className="h-3 w-3 text-gray-600 mt-1 flex-none" />
                                                <p className="text-xs text-gray-500 leading-relaxed">"{log.comment}"</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Current Step (if pending) */}
                            {request.status === 'pending' && (
                                <div className="relative flex items-start space-x-5">
                                    <div className="h-8 w-8 rounded-full bg-violet-500/10 border-2 border-violet-500/30 flex items-center justify-center flex-none relative z-10 animate-pulse">
                                        <div className="h-2 w-2 bg-violet-500 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-[14px] font-semibold text-violet-400">
                                            Awaiting: {request.workflowId?.steps[request.currentStepIndex]?.stepName}
                                        </h4>
                                        <p className="text-[11px] text-gray-600 font-semibold uppercase">In Progress</p>
                                    </div>
                                </div>
                            )}

                            {/* Final Outcome */}
                            {(request.status === 'approved' || request.status === 'rejected') && (
                                <div className="relative flex items-start space-x-5">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-none relative z-10 ${request.status === 'approved' ? 'bg-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.5)]' : 'bg-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.5)]'}`}>
                                        <ChevronRight className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className={`text-[14px] font-semibold uppercase tracking-tighter ${request.status === 'approved' ? 'text-green-400' : 'text-red-400'}`}>
                                            Terminal {request.status}
                                        </h4>
                                        <p className="text-xs text-gray-400 mt-1">Expected sequence of organizational verification.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="glass-card p-6 border-white/5 flex items-center justify-between text-gray-500 hover:text-white transition-colors cursor-help">
                        <span className="text-[11px] font-semibold uppercase tracking-wider">Protocol Version</span>
                        <span className="text-xs font-mono">v1.2-GA</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default RequestDetails;
