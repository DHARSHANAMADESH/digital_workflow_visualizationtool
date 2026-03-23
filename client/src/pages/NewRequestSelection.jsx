import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { workflowService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight, Loader2, AlertCircle, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';

const NewRequestSelection = () => {
    const [workflows, setWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchWorkflows();
    }, []);

    const fetchWorkflows = async () => {
        try {
            const response = await workflowService.getAvailable();
            setWorkflows(response.data);
        } catch (error) {
            toast.error('Failed to load workflows');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
                <p className="text-gray-400 mt-6 font-black uppercase tracking-widest text-[10px]">Retrieving System Protocols</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-5xl mx-auto space-y-10 px-4"
        >
            <div className="flex flex-col space-y-1">
                <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Initiate Request</h1>
                <p className="text-sm text-gray-500">Select an enterprise workflow protocol to begin your submission</p>
            </div>

            {workflows.length === 0 ? (
                <div className="bg-white p-20 text-center space-y-6 border border-gray-200 rounded-2xl shadow-sm">
                    <div className="h-20 w-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto border border-gray-100">
                        <AlertCircle className="h-8 w-8 text-gray-300" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-gray-900 tracking-tight">Access Restricted</h3>
                        <p className="text-gray-500 max-w-sm mx-auto font-medium text-sm">
                            No active workflow protocols were discovered for your current credential tier.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {workflows.map((wf, idx) => {
                        const phasesCount = (wf.nodes || wf.steps || []).filter(n => n.type === 'APPROVAL' || !n.type).length;
                        return (
                            <motion.div
                                key={wf._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                whileHover={{ x: 6 }}
                                onClick={() => navigate(`/employee/request/${wf._id}`)}
                                className="bg-white p-5 cursor-pointer group hover:border-indigo-300 transition-all duration-300 border border-gray-200 rounded-2xl shadow-sm hover:shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden"
                            >
                                <div className="flex items-center space-x-5 flex-1 min-w-0">
                                    <div className="h-12 w-12 bg-gray-50 rounded-xl flex items-center justify-center transition-all group-hover:bg-indigo-600 text-gray-400 group-hover:text-white border border-gray-100 group-hover:border-indigo-500 shadow-sm">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-1 flex-1 min-w-0">
                                        <div className="flex items-center space-x-3">
                                            <h3 className="text-base font-semibold text-gray-900 group-hover:text-indigo-600 tracking-tight transition-colors truncate">
                                                {wf.workflowName}
                                            </h3>
                                            <div className="hidden sm:flex items-center space-x-1 px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-semibold text-gray-500 border border-gray-200 uppercase tracking-wider">
                                                <Activity className="h-3 w-3" />
                                                <span>{phasesCount} Phases</span>
                                            </div>
                                        </div>
                                        <p className="text-xs font-medium text-gray-500 line-clamp-1 leading-relaxed">
                                            {wf.description || 'Standardized approval pipeline with multi-tier validation protocols.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center w-full md:w-auto">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); navigate(`/employee/request/${wf._id}`); }}
                                        className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 active:scale-95 uppercase tracking-wider"
                                    >
                                        <span>Select Option</span>
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </button>
                                </div>

                                <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-indigo-50/5 to-transparent pointer-events-none group-hover:opacity-100 transition-opacity" />
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
};

export default NewRequestSelection;
