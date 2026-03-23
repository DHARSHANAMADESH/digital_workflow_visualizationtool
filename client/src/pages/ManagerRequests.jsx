import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    Database,
    Cpu,
    Plus,
    ChevronRight,
    Send,
    Loader2,
    LayoutGrid,
    Info,
    Upload,
    FileCheck,
    X
} from 'lucide-react';
import { workflowService, requestService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const ManagerRequests = () => {
    const { user } = useAuth();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [activeForm, setActiveForm] = useState(null); // 'Software', 'Data', 'Support'
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        softwareName: '',
        employeeName: '',
        department: '',
        reason: '',
        reportType: '',
        dateRange: '',
        format: 'PDF',
        systemModule: '',
        issueType: 'Bug',
        priority: 'Medium',
        description: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const tmplRes = await workflowService.getAvailable();

                // Filter specifically for the new Manager-to-Admin workflows
                const managerTmpls = tmplRes.data.filter(t =>
                    ['Software / System Access Request', 'Data / Report Request', 'System Issue / Support Request'].includes(t.workflowName)
                );

                setTemplates(managerTmpls);
            } catch (error) {
                console.error('Error fetching templates:', error);
                toast.error('Failed to sync with FlowStream servers');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const templateMap = {
                'Software': 'Software / System Access Request',
                'Data': 'Data / Report Request',
                'Support': 'System Issue / Support Request'
            };

            const template = templates.find(t => t.workflowName === templateMap[activeForm]);
            if (!template) throw new Error('Workflow template not found');

            const payload = {
                templateId: template._id,
                title: formData.title,
                description: formData.description || formData.reason,
                formData: { ...formData, type: activeForm, fileName: selectedFile?.name }
            };

            await requestService.submit(payload);
            toast.success('Request dispatched to Admin pipeline');
            setActiveForm(null);
            setSelectedFile(null);
            setFormData({
                title: '', softwareName: '', employeeName: '', department: '',
                reason: '', reportType: '', dateRange: '', format: 'PDF',
                systemModule: '', issueType: 'Bug', priority: 'Medium', description: ''
            });
        } catch (error) {
            toast.error(error.message || 'Transmission failure');
        } finally {
            setSubmitting(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            toast.success(`Attached: ${file.name}`);
        }
    };

    const removeFile = (e) => {
        e.stopPropagation();
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const requestTypes = [
        {
            id: 'Software',
            name: 'Software / System Access',
            icon: Shield,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            border: 'border-indigo-100',
            description: 'Request access to primary software tools or internal secure systems.'
        },
        {
            id: 'Data',
            name: 'Data / Report Request',
            icon: Database,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            border: 'border-emerald-100',
            description: 'Request advanced datasets, monthly reports, or custom analytics exports.'
        },
        {
            id: 'Support',
            name: 'System Issue / Support',
            icon: Cpu,
            color: 'text-rose-600',
            bg: 'bg-rose-50',
            border: 'border-rose-100',
            description: 'Report architectural bugs or request technical system reinforcements.'
        }
    ];

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-6">
                <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">Synchronizing Matrix</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            {/* Header section (Light SaaS Style) */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manager Request Portal</h1>
                    <p className="text-gray-500 mt-1 font-medium">Coordinate with system administrators to optimize your workflow trajectory.</p>
                </div>
                <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 flex items-center space-x-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Admin Pipeline Active</span>
                </div>
            </div>

            {/* Request Type Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {requestTypes.map((type) => (
                    <motion.button
                        key={type.id}
                        whileHover={{ y: -5, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveForm(type.id)}
                        className={`text-left bg-white p-8 rounded-[32px] border ${activeForm === type.id ? 'ring-2 ring-indigo-600 border-indigo-200 shadow-lg shadow-indigo-100' : 'border-gray-100 shadow-sm'} transition-all group`}
                    >
                        <div className={`h-14 w-14 rounded-2xl ${type.bg} flex items-center justify-center mb-6 border ${type.border} transition-transform group-hover:rotate-6`}>
                            <type.icon className={`h-7 w-7 ${type.color}`} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{type.name}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed mb-6">{type.description}</p>
                        <div className="flex items-center text-xs font-bold text-indigo-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                            <span>Initiate Protocol</span>
                            <ChevronRight className="h-4 w-4 ml-2" />
                        </div>
                    </motion.button>
                ))}
            </div>

            {/* Centered Form Area */}
            <div className="max-w-4xl mx-auto">
                <div className="space-y-10">
                    <AnimatePresence mode="wait">
                        {activeForm ? (
                            <motion.div
                                key={activeForm}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="bg-white p-10 md:p-14 rounded-[48px] border border-gray-100 shadow-sm ring-1 ring-black/5"
                            >
                                <div className="flex items-center justify-between mb-12">
                                    <div className="flex items-center space-x-5">
                                        <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-inner">
                                            <Plus className="h-6 w-6 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight leading-none">New {activeForm} Request</h2>
                                            <p className="text-gray-400 text-xs font-medium mt-1 uppercase tracking-widest">Administrative Authorization Route</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setActiveForm(null);
                                            setSelectedFile(null);
                                        }}
                                        className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 py-2 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all border border-gray-100"
                                    >
                                        Cancel Request
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    {/* Common Title Field */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Request Summary</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="Briefly describe the objective..."
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900 font-semibold"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {activeForm === 'Software' && (
                                            <>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">System Architecture</label>
                                                    <input
                                                        type="text"
                                                        value={formData.softwareName}
                                                        onChange={(e) => setFormData({ ...formData, softwareName: e.target.value })}
                                                        placeholder="Software / System Name"
                                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900 font-semibold"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Target Personnel (Optional)</label>
                                                    <input
                                                        type="text"
                                                        value={formData.employeeName}
                                                        onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                                                        placeholder="Employee Name"
                                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900 font-semibold"
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {activeForm === 'Data' && (
                                            <>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Report Specification</label>
                                                    <input
                                                        type="text"
                                                        value={formData.reportType}
                                                        onChange={(e) => setFormData({ ...formData, reportType: e.target.value })}
                                                        placeholder="e.g. Monthly Expense Analysis"
                                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900 font-semibold"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Output Format</label>
                                                    <select
                                                        value={formData.format}
                                                        onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900 font-semibold cursor-pointer"
                                                    >
                                                        <option value="PDF">Portable Document Format (.pdf)</option>
                                                        <option value="Excel">Microsoft Excel (.xlsx)</option>
                                                        <option value="CSV">Comma Separated Values (.csv)</option>
                                                    </select>
                                                </div>
                                            </>
                                        )}

                                        {activeForm === 'Support' && (
                                            <>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Component Module</label>
                                                    <input
                                                        type="text"
                                                        value={formData.systemModule}
                                                        onChange={(e) => setFormData({ ...formData, systemModule: e.target.value })}
                                                        placeholder="e.g. Authentication Gateway"
                                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900 font-semibold"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Severity / Issue Type</label>
                                                    <select
                                                        value={formData.issueType}
                                                        onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
                                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900 font-semibold cursor-pointer"
                                                    >
                                                        <option value="Bug">Technical Defect (Bug)</option>
                                                        <option value="Error">System Termination (Error)</option>
                                                        <option value="Access Issue">Credential / Access Issue</option>
                                                        <option value="Performance Issue">High Latency / Slow Execution</option>
                                                    </select>
                                                </div>
                                            </>
                                        )}

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Organizational Unit</label>
                                            <input
                                                type="text"
                                                value={formData.department}
                                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                                placeholder="e.g. Strategic Operations"
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900 font-semibold"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Priority Classification</label>
                                            <select
                                                value={formData.priority}
                                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900 font-semibold cursor-pointer"
                                            >
                                                <option value="Low">Low - Deferred</option>
                                                <option value="Medium">Medium - Standard</option>
                                                <option value="High">High - Accelerated</option>
                                                <option value="Critical">Critical - Immediate</option>
                                            </select>
                                        </div>
                                    </div>

                                    {activeForm === 'Data' && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Temporal Window (Date Range)</label>
                                            <input
                                                type="text"
                                                value={formData.dateRange}
                                                onChange={(e) => setFormData({ ...formData, dateRange: e.target.value })}
                                                placeholder="e.g. Q1 2024 / Jan 01 - Mar 31"
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900 font-semibold"
                                                required
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Strategic Rationale / Description</label>
                                        <textarea
                                            value={activeForm === 'Support' ? formData.description : formData.reason}
                                            onChange={(e) => setFormData({ ...formData, [activeForm === 'Support' ? 'description' : 'reason']: e.target.value })}
                                            placeholder="Provide detailed context for administrative review..."
                                            className="w-full h-40 bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900 font-semibold resize-none"
                                            required
                                        />
                                    </div>

                                    {activeForm === 'Support' && (
                                        <div className="space-y-4">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                className="hidden"
                                                accept="image/*,.log,.txt,.pdf"
                                            />
                                            {selectedFile ? (
                                                <div className="p-6 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between group animate-in slide-in-from-bottom-2 duration-300">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-indigo-100">
                                                            <FileCheck className="h-5 w-5 text-emerald-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Selected Evidence</p>
                                                            <p className="text-sm font-bold text-gray-900">{selectedFile.name}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={removeFile}
                                                        className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="p-8 bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center space-y-3 group cursor-pointer hover:bg-white hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-50 transition-all"
                                                >
                                                    <div className="h-10 w-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                        <Upload className="h-5 w-5 text-indigo-500" />
                                                    </div>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Evidence Upload (Capture / Logs)</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                                        <div className="flex items-center text-gray-400 space-x-2">
                                            <Info className="h-4 w-4" />
                                            <span className="text-[10px] uppercase font-bold tracking-widest">Routed to Administrator for Tier 1 Clearance</span>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center space-x-3"
                                        >
                                            {submitting ? (
                                                <>
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                    <span className="uppercase tracking-widest text-xs">Transmitting...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="h-5 w-5" />
                                                    <span className="uppercase tracking-widest text-xs tracking-[0.2em]">Initiate Dispatch</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white border border-dashed border-gray-200 p-20 rounded-[48px] flex flex-col items-center justify-center text-center space-y-8 h-full min-h-[500px]"
                            >
                                <div className="h-24 w-24 bg-gray-50 rounded-[32px] flex items-center justify-center border border-gray-100 shadow-inner">
                                    <LayoutGrid className="h-10 w-10 text-gray-200" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Selective Queue Initialization</h3>
                                    <p className="text-gray-400 text-sm max-w-sm mx-auto">Select an administrative protocol card above to begin structuring your executive request.</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default ManagerRequests;
