import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Search,
    Filter,
    MoreHorizontal,
    Clock,
    User,
    ChevronRight,
    Activity,
    Trello
} from 'lucide-react';
import { requestService } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { useNavigate } from 'react-router-dom';

const WorkflowMonitor = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await requestService.getMy();
            setRequests(res.data);
        } catch (error) {
            console.error('Error fetching requests for monitor:', error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { id: 'submitted', title: 'Submitted', color: 'primary' },
        { id: 'manager', title: 'Manager Review', color: 'amber' },
        { id: 'admin', title: 'Admin Approval', color: 'rose' },
        { id: 'completed', title: 'Completed', color: 'secondary' }
    ];

    const getColumnRequests = (colId) => {
        return requests.filter(req => {
            if (colId === 'completed') return req.status === 'approved' || req.status === 'rejected';
            if (req.status !== 'pending') return false;

            const nodeId = req.currentNodeId?.toLowerCase() || '';
            if (colId === 'submitted') return nodeId.includes('start') || nodeId === '';
            if (colId === 'manager') return nodeId.includes('manager');
            if (colId === 'admin') return nodeId.includes('admin');
            return false;
        }).filter(req =>
            req.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req._id.includes(searchQuery)
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold text-content-primary tracking-tighter">Workflow Monitor</h1>
                    <p className="text-gray-400 font-normal text-sm mt-1">Cross-pipeline visualization board</p>
                </div>

                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Filter board..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-border rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-sm w-64 shadow-sm"
                        />
                    </div>
                    <button className="p-2.5 bg-white border border-border rounded-xl text-gray-400 hover:text-primary shadow-sm transition-all">
                        <Filter className="h-5 w-5" />
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-[calc(100vh-250px)] min-h-[600px]">
                {columns.map((col) => (
                    <div key={col.id} className="flex flex-col h-full bg-gray-50/50 rounded-[32px] border border-border/50 p-4">
                        <div className="flex items-center justify-between px-4 py-4 mb-4">
                            <div className="flex items-center space-x-3">
                                {col.color === 'primary' ? (
                                    <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(20,184,166,0.3)]" />
                                ) : col.color === 'secondary' ? (
                                    <span className="h-2.5 w-2.5 rounded-full bg-secondary shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                                ) : (
                                    <span className={`h-2.5 w-2.5 rounded-full bg-${col.color}-500 shadow-[0_0_10px_rgba(var(--${col.color}-500),0.3)]`} />
                                )}
                                <h3 className="font-bold text-xs text-content-primary uppercase tracking-widest">{col.title}</h3>
                            </div>
                            <span className="bg-white px-2.5 py-1 rounded-lg border border-border text-[10px] font-normal text-gray-400 shadow-sm">
                                {getColumnRequests(col.id).length}
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2 px-1">
                            {getColumnRequests(col.id).map((req, idx) => (
                                <motion.div
                                    key={req._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => navigate(`/employee/requests/${req._id}`)}
                                    className="bg-white p-5 rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary/30 cursor-pointer transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">
                                            #{req._id.slice(-6).toUpperCase()}
                                        </span>
                                        <StatusBadge status={req.status} className="text-[9px] px-2 py-0.5" />
                                    </div>

                                    <h4 className="font-semibold text-content-primary text-sm mb-4 leading-tight group-hover:text-primary transition-colors">
                                        {req.title}
                                    </h4>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                        <div className="flex items-center space-x-2">
                                            <div className="h-6 w-6 rounded-lg bg-background flex items-center justify-center">
                                                <User className="h-3 w-3 text-primary/40" />
                                            </div>
                                            <span className="text-[10px] font-normal text-gray-400">{req.requesterId?.name || 'User'}</span>
                                        </div>
                                        <div className="flex items-center space-x-1 text-gray-400">
                                            <Clock className="h-3 w-3" />
                                            <span className="text-[9px] font-normal">
                                                {new Date(req.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {getColumnRequests(col.id).length === 0 && (
                                <div className="flex flex-col items-center justify-center py-20 opacity-20 border border-border border-dashed rounded-3xl">
                                    <p className="text-gray-400 text-[9px] font-black uppercase tracking-widest italic text-center px-4">
                                        Queue Empty
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WorkflowMonitor;
