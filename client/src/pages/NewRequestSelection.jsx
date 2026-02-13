import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { workflowService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
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
            <div className="glass-card p-12 h-full flex flex-col items-center justify-center text-center text-gray-500">
                <Loader2 className="h-12 w-12 text-violet-500 animate-spin" />
                <p className="text-gray-400 animate-pulse">Scanning available workflows...</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto space-y-8"
        >
            <div className="flex flex-col space-y-2">
                <h1 className="text-white">Initiate New Request</h1>
                <p className="text-gray-400 text-lg">Select a standardized workflow context to begin your submission.</p>
            </div>

            {workflows.length === 0 ? (
                <div className="glass-card p-12 text-center space-y-6 border-dashed border-2 border-white/5">
                    <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle className="h-10 w-10 text-gray-500" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold">No Workflows Available</h3>
                        <p className="text-gray-400 max-w-md mx-auto">
                            There are currently no active workflows assigned to your role.
                            Please contact your administrator to define new approval processes.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {workflows.map((wf) => (
                        <motion.div
                            key={wf._id}
                            whileHover={{ y: -5, scale: 1.02 }}
                            onClick={() => navigate(`/employee/request/${wf._id}`)}
                            className="glass-card p-6 cursor-pointer group hover:border-violet-500/50 transition-all border border-white/10 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowRight className="h-6 w-6 text-violet-400" />
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-violet-500/10 rounded-xl group-hover:bg-violet-500/20 transition-colors">
                                    <FileText className="h-8 w-8 text-violet-400" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-white group-hover:text-violet-300 transition-colors">
                                        {wf.workflowName}
                                    </h3>
                                    <p className="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                                        {wf.description || 'Standard approval workflow with predefined enterprise steps.'}
                                    </p>
                                    <div className="flex items-center space-x-4 pt-2">
                                        <span className="text-[11px] font-semibold uppercase tracking-wider text-violet-500 py-1 px-2 bg-violet-500/5 rounded border border-violet-500/10">
                                            {wf.steps.length} Phases
                                        </span>
                                        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                                            Enterprise Workflow
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default NewRequestSelection;
