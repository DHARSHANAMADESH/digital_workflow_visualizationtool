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
        priority: 'Normal',
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
                workflowId,
                title: formData.title,
                description: formData.description,
                formData: {
                    priority: formData.priority,
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
                <Loader2 className="h-10 w-10 text-violet-500 animate-spin" />
                <p className="text-gray-400">Preparing submission environment...</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12"
        >
            {/* Left side: Form */}
            <div className="lg:col-span-2 space-y-6">
                <button onClick={() => navigate('/employee/new-request')} className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors group">
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Selection</span>
                </button>

                <div className="glass-card p-8 border border-white/10">
                    <div className="mb-8">
                        <h1 className="text-white">{workflow.workflowName}</h1>
                        <p className="text-gray-400 mt-2">{workflow.description}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center space-x-2">
                                <FileText className="h-4 w-4" />
                                <span>Request Title</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Short descriptive title for your request"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 focus:outline-none focus:border-violet-500 transition-all text-white placeholder:text-gray-600"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority Level</label>
                                <select
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    className="w-full bg-[#1a1635] border border-white/10 rounded-xl py-4 px-5 focus:outline-none focus:border-violet-500 transition-all text-white"
                                >
                                    <option value="Low">Low - Non Critical</option>
                                    <option value="Normal">Normal - Standard Process</option>
                                    <option value="High">High - Priority Review</option>
                                    <option value="Urgent">Urgent - Immediate Attention</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</label>
                                <input
                                    type="text"
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    placeholder="e.g. Engineering, Sales"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 focus:outline-none focus:border-violet-500 transition-all text-white placeholder:text-gray-600"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center space-x-2">
                                <span>Core Description</span>
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows="4"
                                placeholder="Describe the details of your request..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 focus:outline-none focus:border-violet-500 transition-all text-white placeholder:text-gray-600"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center space-x-2">
                                <span>Additional Supporting Info</span>
                            </label>
                            <textarea
                                value={formData.additionalInfo}
                                onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                                rows="2"
                                placeholder="Any other context or links (optional)..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 focus:outline-none focus:border-violet-500 transition-all text-white placeholder:text-gray-600"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center space-x-3 transition-all ${submitting
                                ? 'bg-gray-600 cursor-not-allowed opacity-50'
                                : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]'
                                }`}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Submitting to Database...</span>
                                </>
                            ) : (
                                <>
                                    <Send className="h-5 w-5" />
                                    <span>Dispatch Request</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Right side: Sidebar info */}
            <div className="space-y-6">
                <div className="glass-card p-6 border-l-4 border-l-violet-500">
                    <h3 className="flex items-center space-x-2 text-violet-400 uppercase tracking-wider">
                        <GitBranch className="h-5 w-5" />
                        <span>Approval Path</span>
                    </h3>
                    <p className="text-gray-400 text-[12px] mt-1 mb-6">Expected sequence of organizational verification.</p>

                    <div className="space-y-8 relative">
                        {workflow.steps.map((step, idx) => (
                            <div key={idx} className="flex items-start space-x-4 relative">
                                {idx < workflow.steps.length - 1 && (
                                    <div className="absolute left-[15px] top-[30px] bottom-[-20px] w-0.5 bg-white/5" />
                                )}
                                <div className="h-8 w-8 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-none relative z-10">
                                    <span className="text-xs font-semibold text-violet-400">{idx + 1}</span>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-[14px] font-semibold text-white leading-tight">{step.stepName}</h4>
                                    <div className="flex items-center space-x-2">
                                        <div className="px-2 py-0.5 bg-white/5 rounded text-[10px] font-semibold text-gray-500 border border-white/5 uppercase">
                                            Role: {step.approverRole}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="flex items-start space-x-4">
                            <div className="h-8 w-8 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-none">
                                <ShieldCheck className="h-4 w-4 text-green-500" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-bold text-green-400 leading-tight">Final Resolution</h4>
                                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Success State</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 border-white/5 bg-violet-600/5">
                    <h3 className="text-xs font-semibold flex items-center space-x-2 text-gray-300 uppercase tracking-wider mb-4">
                        <Mail className="h-4 w-4" />
                        <span>Requester</span>
                    </h3>
                    <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 flex items-center justify-center font-bold text-white border border-white/10">
                            {user?.name?.[0]}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white">{user?.name}</p>
                            <p className="text-[11px] text-gray-500 uppercase font-semibold">{user?.role}</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default RequestForm;
