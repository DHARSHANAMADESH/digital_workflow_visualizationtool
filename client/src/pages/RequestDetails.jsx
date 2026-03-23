import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    ChevronRight,
    Paperclip
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
        } catch {
            toast.error('Failed to load request details');
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                <p className="text-gray-500 font-medium">Loading request details...</p>
            </div>
        );
    }

    if (!request) return (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <XCircle className="mx-auto h-16 w-16 text-red-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">Request Not Found</h2>
            <p className="text-gray-500 mt-2">The request you are looking for does not exist.</p>
            <button onClick={() => navigate(-1)} className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">Go Back</button>
        </div>
    );

    const currentNode = request.templateId?.nodes?.find(n => n.nodeId === request.currentNodeId);

    // Strictly following 3 roles: Employee -> Manager -> Admin
    const workflowSteps = [
        { id: 'submission', label: 'Request Submission', role: 'ROLE: EMPLOYEE' },
        { id: 'manager', label: 'Manager Review', role: 'ROLE: MANAGER' },
        { id: 'admin', label: 'Admin Final Review', role: 'ROLE: ADMIN' }
    ];

    const getStepStatus = (index) => {
        // Step 0: Submission - Always completed if we are here
        if (index === 0) return 'completed';

        // Overall status is 'approved' - All steps are completed
        if (request.status === 'approved') return 'completed';

        // Step 2: Admin approval - only completed if status is approved
        if (index === 2) {
            if (request.status === 'approved') return 'completed';
            if (request.status === 'rejected' && request.currentNodeId?.toLowerCase().includes('admin')) return 'rejected';
            if (request.status === 'pending' && request.currentNodeId?.toLowerCase().includes('admin')) return 'current';
            return 'upcoming';
        }

        // Step 1: Manager Review
        if (index === 1) {
            // If it's already at Admin or completed, Manager is done
            if (request.status === 'approved') return 'completed';
            if (request.currentNodeId?.toLowerCase().includes('admin')) return 'completed';

            // Check history for manager approval
            const managerApproved = request.history?.some(h =>
                h.action === 'APPROVED' && h.nodeId?.toLowerCase().includes('manager')
            );
            if (managerApproved) return 'completed';

            // Check if currently at Manager
            if (request.status === 'pending' && request.currentNodeId?.toLowerCase().includes('manager')) return 'current';
            if (request.status === 'rejected' && request.currentNodeId?.toLowerCase().includes('manager')) return 'rejected';
        }

        return 'upcoming';
    };

    const getApprovalDetails = (roleName) => {
        // Find explicit approval in history
        const historyAction = request.history?.find(h =>
            (roleName === 'Manager' && h.action === 'APPROVED' && h.nodeId?.toLowerCase().includes('manager')) ||
            (roleName === 'Admin' && h.action === 'APPROVED' && h.nodeId?.toLowerCase().includes('admin'))
        );

        if (historyAction) {
            return {
                status: 'Approved',
                date: new Date(historyAction.timestamp).toLocaleString()
            };
        }

        // Check if overall request is approved (fallback)
        if (request.status === 'approved') {
            return {
                status: 'Approved',
                date: new Date(request.updatedAt).toLocaleString()
            };
        }

        // Manager is considered approved if it's currently at Admin
        if (roleName === 'Manager' && request.currentNodeId?.toLowerCase().includes('admin')) {
            return {
                status: 'Approved',
                date: 'Verification passed'
            };
        }

        const isCurrent = request.currentNodeId?.toLowerCase().includes(roleName.toLowerCase());
        if (request.status === 'pending' && isCurrent) return { status: 'Pending' };
        if (request.status === 'rejected' && isCurrent) return { status: 'Rejected' };

        return { status: 'Waiting' };
    };

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
        <div className="bg-[#F8FAFC] min-h-screen -m-8 p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Back Link */}
                <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors group">
                    <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Back to Dashboard</span>
                </button>

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">{request.title}</h1>
                            <StatusBadge status={request.status} />
                        </div>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                <span>{request.templateId?.workflowName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4" />
                                <span>{request.status === 'pending' ? currentNode?.title || 'Processing' : request.status.toUpperCase()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 2: Workflow Visualization (Horizontal Path) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Activity className="h-6 w-6 text-indigo-500" />
                        <h3 className="text-xl font-black text-indigo-900 uppercase tracking-wider">Approval Path</h3>
                    </div>
                    <p className="text-sm text-gray-400 mb-10 font-medium">Expected sequence of organizational verification.</p>

                    <div className="relative flex items-center justify-between w-full px-4 mb-2">
                        {/* Horizontal base line (Gray) */}
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-[22px] z-0" />

                        {/* Progress line (Emerald) - Fills up based on completion */}
                        <div
                            className="absolute top-1/2 left-0 h-0.5 bg-emerald-500 -translate-y-[22px] z-0 transition-all duration-1000"
                            style={{
                                width: `${(workflowSteps.filter((_, i) => getStepStatus(i) === 'completed').length - 1) / (workflowSteps.length - 1) * 100}%`,
                                maxWidth: '100%'
                            }}
                        />

                        {workflowSteps.map((step, idx) => {
                            const status = getStepStatus(idx);
                            let iconContent;
                            let colors;
                            let textColors;
                            const isLast = idx === workflowSteps.length - 1;

                            if (status === 'completed') {
                                iconContent = <CheckCircle2 className="h-5 w-5" />;
                                colors = "bg-emerald-500 border-emerald-100 text-white shadow-lg shadow-emerald-100";
                                textColors = "text-emerald-500 font-bold";
                            } else if (status === 'current') {
                                iconContent = <span className="font-bold text-sm tracking-tighter">{idx + 1}</span>;
                                colors = "bg-indigo-600 border-indigo-100 text-white shadow-xl shadow-indigo-100 scale-110";
                                textColors = "text-indigo-600 font-black";
                            } else if (status === 'rejected') {
                                iconContent = <XCircle className="h-5 w-5" />;
                                colors = "bg-rose-500 border-rose-100 text-white shadow-lg shadow-rose-100";
                                textColors = "text-rose-600";
                            } else {
                                iconContent = <span className="font-bold text-sm tracking-tighter">{idx + 1}</span>;
                                colors = "bg-gray-50 border-gray-100 text-gray-300";
                                textColors = "text-gray-400";
                            }

                            return (
                                <div key={step.id} className="relative z-10 flex flex-col items-center flex-1">
                                    {/* Step Circle */}
                                    <div className={`h-11 w-11 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${colors}`}>
                                        {iconContent}
                                    </div>

                                    {/* Step Content */}
                                    <div className="mt-4 text-center">
                                        <h4 className={`text-xs font-bold transition-colors uppercase tracking-tight ${textColors}`}>
                                            {step.label}
                                        </h4>
                                        <div className={`mt-1 inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border transition-colors ${status === 'completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                            status === 'current' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                                                'bg-gray-50 border-gray-100 text-gray-400'
                                            }`}>
                                            {step.role}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Request Info & Stepper */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Card 1: Request Information */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-indigo-600" />
                                Request Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Title</label>
                                    <p className="text-gray-900 font-medium">{request.title}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Workflow Type</label>
                                    <p className="text-gray-900 font-medium">{request.templateId?.workflowName}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Initiation Date</label>
                                    <p className="text-gray-900 font-medium">{new Date(request.createdAt).toLocaleString()}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Status</label>
                                    <div className="mt-1"><StatusBadge status={request.status} /></div>
                                </div>
                            </div>
                            <div className="border-t border-gray-50 pt-6">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Description</label>
                                <p className="text-gray-600 text-sm leading-relaxed">{request.description || 'No description provided.'}</p>
                            </div>

                            {/* Dynamic Form Data */}
                            {request.formData && Object.keys(request.formData).length > 0 && (
                                <div className="mt-8 pt-8 border-t border-gray-50">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-4">Instance Metadata</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(request.formData).map(([key, value]) => (
                                            <div key={key} className="bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">{key}</span>
                                                <span className="text-gray-900 font-semibold">{value?.toString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Attachments Placeholder */}
                            <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                        <Paperclip className="h-5 w-5" />
                                    </div>
                                    <span className="text-sm font-medium">View Attachments</span>
                                </div>
                                <ChevronRight className="h-4 w-4" />
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Approvals & Timeline */}
                    <div className="space-y-6">
                        {/* Card 3: Approval Status */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                                Approval Status
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { name: 'Manager', label: 'Manager Approval', sub: 'Standard validation required' },
                                    { name: 'Admin', label: 'Admin Approval', sub: 'Final executive clearance' }
                                ].map(role => {
                                    const details = getApprovalDetails(role.name);
                                    return (
                                        <div key={role.name} className="p-4 rounded-xl border border-gray-100 bg-gray-50/30">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{role.label}</span>
                                                <StatusBadge status={details.status.toLowerCase()} />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <p className="text-[10px] text-gray-400 font-medium">{role.sub}</p>
                                                {details.date && (
                                                    <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold mt-1">
                                                        <History className="h-3 w-3" />
                                                        <span>{details.date}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                </div>
            </div >
        </div >
    );
};

export default RequestDetails;
