import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { requestService } from '../services/api';

const UserDashboard = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await requestService.getMy();
            setRequests(res.data);
            if (res.data && res.data.length > 0) {
                setSelectedRequest(res.data[0]);
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };


    const stats = [
        { label: 'Total Requests', value: requests.length, icon: FileText, color: 'text-gray-700', bg: 'bg-gray-100' },
        { label: 'Pending Requests', value: requests.filter(r => r.status === 'pending').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
        { label: 'Approved Requests', value: requests.filter(r => r.status === 'approved').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        { label: 'Rejected Requests', value: requests.filter(r => r.status === 'rejected').length, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-100' },
    ];

    // Aggregate requests by category (Workflow Type)
    const categoryStats = React.useMemo(() => {
        const counts = {};
        requests.forEach(req => {
            const cat = req.templateId?.workflowName || 'General';
            counts[cat] = (counts[cat] || 0) + 1;
        });

        // Convert to array and sort by count descending
        return Object.entries(counts)
            .map(([label, value]) => ({ label, value }))
            .sort((a, b) => b.value - a.value);
    }, [requests]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-content-primary tracking-tight">Flow Insights</h1>
                    <p className="text-sm text-content-secondary mt-1">Overview of your request activity</p>
                </div>
                <div className="flex items-center space-x-2 bg-white border border-border shadow-sm px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"></span>
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-widest">Live Syncing</span>
                </div>
            </div>

            {/* Statistics Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {stats.map((stat, i) => (
                    <div
                        key={i}
                        className="bg-white p-5 rounded-xl border border-border shadow-sm flex flex-col justify-between"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2 rounded-lg ${stat.bg}`}>
                                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                            </div>
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-content-primary leading-tight tracking-tight">{stat.value}</p>
                            <p className="text-[11px] font-medium text-content-secondary uppercase tracking-wider mt-1">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Requests Table */}
            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-border">
                    <h2 className="text-sm font-semibold text-content-primary tracking-tight">Recent Requests</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b border-border text-content-secondary font-medium text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-3 font-semibold">Request ID</th>
                                <th className="px-6 py-3 font-semibold">Title</th>
                                <th className="px-6 py-3 font-semibold">Department</th>
                                <th className="px-6 py-3 font-semibold">Status</th>
                                <th className="px-6 py-3 font-semibold">Date Submitted</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {requests.length > 0 ? (
                                requests.slice(0, 10).map((req) => (
                                    <tr
                                        key={req._id}
                                        className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${selectedRequest?._id === req._id ? 'bg-background/50' : ''}`}
                                        onClick={() => navigate(`/employee/requests/${req._id}`)}
                                    >
                                        <td className="px-6 py-4 text-content-secondary font-mono text-xs">#{req._id.slice(-6).toUpperCase()}</td>
                                        <td className="px-6 py-4 text-content-primary font-medium text-sm">{req.title}</td>
                                        <td className="px-6 py-4 text-content-secondary text-sm">
                                            {req.templateId?.workflowName || 'General'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${req.status === 'approved' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20' :
                                                req.status === 'rejected' ? 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20' :
                                                    'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20'
                                                }`}>
                                                {req.status === 'approved' ? 'Approved' : req.status === 'rejected' ? 'Rejected' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-content-secondary text-sm">
                                            {new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-content-secondary text-sm">
                                        No requests found. Create one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Request Categories Breakdown */}
            <div className="mt-8 bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-border flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-semibold text-content-primary tracking-tight">Request Categories</h2>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">Frequency by instance type</p>
                    </div>
                    <div className="bg-background px-2 py-1 rounded text-[10px] font-bold text-primary uppercase tracking-widest">
                        Total Types: {categoryStats.length}
                    </div>
                </div>
                <div className="p-6">
                    {categoryStats.length > 0 ? (
                        <div className="space-y-6">
                            {categoryStats.map((item, index) => {
                                const maxVal = Math.max(...categoryStats.map(s => s.value));
                                const percentage = (item.value / maxVal) * 100;

                                return (
                                    <div key={index} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-semibold text-gray-700">{item.label}</span>
                                            <span className="font-bold text-primary bg-background px-2 py-0.5 rounded text-xs">{item.value}</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-gray-400 text-xs italic">
                            No categories identified yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
