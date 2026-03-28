import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { workflowService, requestService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Send, ArrowLeft, Loader2, GitBranch, ShieldCheck, Mail, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

const RequestForm = () => {
    const { workflowId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [workflow, setWorkflow] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        department: '',
        additionalInfo: ''
    });

    useEffect(() => {
        fetchWorkflow();
    }, [workflowId]);

    const fetchWorkflow = async () => {
        try {
            const response = await workflowService.getAvailable();
            const wf = response.data.find(w => w._id === workflowId);
            if (!wf) {
                toast.error('Workflow not found or access denied');
                navigate('/employee/new-request');
                return;
            }
            setWorkflow(wf);
        } catch (error) {
            toast.error('Failed to load workflow details');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim()) return toast.error('Request title is required');

        setSubmitting(true);
        try {
            await requestService.submit({
                templateId: workflowId,
                title: formData.title,
                description: formData.description,
                formData: {
                    department: formData.department,
                    additionalInfo: formData.additionalInfo
                }
            });
            toast.success('Request submitted successfully!');
            navigate('/employee/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-gray-400 font-normal uppercase tracking-widest text-[10px]">Secure Environment Protocol</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20 px-4"
        >
            {/* Left side: Form */}
            <div className="lg:col-span-8 space-y-6">
                <button onClick={() => navigate('/employee/new-request')} className="flex items-center space-x-2 text-content-secondary hover:text-primary transition-all group font-medium text-xs uppercase tracking-wider">
                    <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
                    <span>Cancel Initiation</span>
                </button>

                <div className="bg-white p-8 rounded-2xl border border-border shadow-sm overflow-hidden">
                    <div className="mb-10">
                        <h1 className="text-content-primary font-semibold text-2xl tracking-tight leading-tight">{workflow.workflowName}</h1>
                        <p className="text-sm text-content-secondary mt-2 leading-relaxed">{workflow.description}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-content-secondary uppercase tracking-wider flex items-center space-x-2">
                                <FileText className="h-3.5 w-3.5 text-primary" />
                                <span>Request Identity</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter a descriptive title..."
                                className="w-full bg-gray-50 border border-border rounded-xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-content-primary placeholder:text-content-secondary/40 font-black text-sm"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-normal text-content-secondary uppercase tracking-wider">Execution Department</label>
                                    <input
                                        type="text"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        placeholder="e.g. Engineering, Product"
                                        className="w-full bg-gray-50 border border-border rounded-xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-content-primary placeholder:text-gray-400 font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-semibold text-content-secondary uppercase tracking-wider">Strategic Context</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full h-full min-h-[160px] bg-gray-50 border border-border rounded-xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-content-primary placeholder:text-gray-400 font-medium resize-none"
                                    placeholder="Provide detailed context for this request..."
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-border">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-4 rounded-xl bg-primary hover:bg-hover text-white font-black text-xs uppercase tracking-widest shadow-sm hover:shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-3"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span className="uppercase tracking-widest text-xs">Transmitting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-5 w-5" />
                                        <span className="uppercase tracking-widest text-xs font-medium">Dispatch to Pipeline</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right side: Sidebar info */}
            <div className="lg:col-span-4 space-y-6 mt-10 lg:mt-0">
                <div className="bg-white p-8 rounded-2xl border border-border shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.02]">
                        <GitBranch className="h-24 w-24 text-content-primary" />
                    </div>

                    <div className="relative z-10">
                        <h3 className="flex items-center space-x-2 text-primary uppercase tracking-wider text-[10px] font-semibold mb-8">
                            <GitBranch className="h-3.5 w-3.5" />
                            <span>Verification Pipeline</span>
                        </h3>

                        <div className="space-y-0 relative pl-4">
                            <div className="absolute left-[13px] top-6 bottom-6 w-px bg-gray-100 z-0" />

                            {[
                                { id: '01', title: 'Submission', sub: 'Identity Validation', color: 'primary' },
                                ...((workflow?.nodes || workflow?.steps || []).filter(n => n.type === 'APPROVAL' || !n.type).map((n, i) => ({
                                    id: `0${i + 2}`,
                                    title: `${[].concat(n.approverRoles || n.approverRole || []).filter(Boolean).join(', ')} Review`,
                                    sub: 'Approval Required',
                                    color: i % 2 === 0 ? 'orange' : 'purple'
                                })))
                            ].map((step, i) => (
                                <div key={i} className="flex items-start space-x-5 pb-10 relative w-full">
                                    <div className={`h-7 w-7 min-w-[28px] rounded-lg bg-${step.color}-50 border border-${step.color}-100 flex items-center justify-center z-10 shadow-sm ring-4 ring-white`}>
                                        <span className={`text-[9px] font-bold text-${step.color}-600`}>{step.id}</span>
                                    </div>
                                    <div className="space-y-0.5">
                                        <h4 className="text-xs font-semibold text-content-primary uppercase tracking-tight">{step.title}</h4>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{step.sub}</p>
                                    </div>
                                </div>
                            ))}

                            <div className="flex items-start space-x-5 relative">
                                <div className="h-7 w-7 min-w-[28px] rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center z-10 shadow-sm ring-4 ring-white">
                                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="text-xs font-semibold text-content-primary uppercase tracking-tight">Finalized</h4>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Asset Allocated</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                    <h3 className="text-[10px] font-bold flex items-center space-x-2 text-gray-400 uppercase tracking-widest mb-6">
                        <Mail className="h-3.5 w-3.5" />
                        <span>Security Credentials</span>
                    </h3>
                    <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center font-semibold text-white shadow-md">
                            {user?.name?.[0]}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-content-primary leading-none tracking-tight">{user?.name}</p>
                            <p className="text-[10px] text-gray-400 uppercase font-bold mt-1.5 tracking-wider italic">{user?.role}</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};


export default RequestForm;
