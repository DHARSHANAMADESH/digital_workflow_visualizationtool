import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Loader2 } from 'lucide-react';
import { workflowService, requestService } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { toast } from 'react-hot-toast';

const WorkflowRequests = () => {
    const { workflowId } = useParams();
    const navigate = useNavigate();
    const [workflow, setWorkflow] = useState(null);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch the specific workflow and all requests
                const [wfRes, reqRes] = await Promise.all([
                    workflowService.getAll(), // Get all to find the specific one, or you might have a getById depending on the API
                    requestService.getAll()
                ]);

                const foundWf = wfRes.data.find(w => w._id === workflowId);
                if (foundWf) {
                    setWorkflow(foundWf);
                } else {
                    toast.error("Workflow not found");
                    navigate('/admin/dashboard');
                }

                const filteredReqs = reqRes.data.filter(req => (req.templateId?._id || req.templateId) === workflowId);
                setRequests(filteredReqs);

            } catch (error) {
                console.error("Failed to fetch workflow requests", error);
                toast.error("Failed to load requests");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [workflowId, navigate]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <p className="text-gray-400 mt-6 font-normal uppercase tracking-widest text-[10px]">Loading Requests</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-[1200px] mx-auto space-y-8 pb-12"
        >
            <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-content-secondary hover:text-primary transition-colors font-bold text-sm"
            >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
            </button>

            <div className="flex items-center space-x-5 px-6">
                <div className="h-12 w-12 rounded-2xl bg-background flex items-center justify-center border border-primary/10 shadow-inner">
                    <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-semibold text-content-primary tracking-tighter uppercase">Employee Requests</h1>
                    <p className="text-gray-400 font-normal text-xs uppercase tracking-[0.15em] mt-1">For {workflow?.workflowName || 'Workflow'}</p>
                </div>
            </div>

            <div className="bg-white rounded-[48px] border border-border shadow-sm ring-1 ring-black/5 p-6 md:p-10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] uppercase tracking-widest text-gray-400 border-b border-border bg-gray-50/30">
                                <th className="px-6 py-4 font-semibold text-left">Request Title</th>
                                <th className="px-6 py-4 font-bold">Requester</th>
                                <th className="px-6 py-4 font-bold">Status</th>
                                <th className="px-6 py-4 font-bold text-right">Date Applied</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-content-secondary font-medium">
                                        No employee requests found for this workflow.
                                    </td>
                                </tr>
                            ) : (
                                requests.map(req => (
                                    <tr key={req._id} onClick={() => navigate(`/employee/requests/${req._id}`)} className="hover:bg-background transition-colors cursor-pointer group">
                                        <td className="px-6 py-5">
                                            <p className="font-bold text-content-primary group-hover:text-primary transition-colors">{req.title}</p>
                                            <p className="text-[11px] text-content-secondary/40 truncate max-w-[200px] mt-0.5 font-bold uppercase tracking-tight">{req.description}</p>
                                        </td>
                                        <td className="px-6 py-5 text-content-secondary font-bold text-xs">{req.requesterId?.name || 'Unknown'}</td>
                                        <td className="px-6 py-5"><StatusBadge status={req.status} /></td>
                                        <td className="px-6 py-5 text-right text-gray-400 font-bold text-[11px]">{new Date(req.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default WorkflowRequests;
