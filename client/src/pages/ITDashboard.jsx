import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Layout, 
    Layers, 
    CheckSquare, 
    Activity, 
    Search, 
    Plus, 
    FileText, 
    Clock, 
    CheckCircle2, 
    XCircle,
    ChevronRight,
    ArrowUpRight,
    Monitor,
    Shield
} from 'lucide-react';
import { 
    PieChart, 
    Pie, 
    Cell, 
    ResponsiveContainer, 
    Tooltip, 
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { approvalService, requestService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ChartCard from '../components/charts/ChartCard';
import StatusBadge from '../components/StatusBadge';
import { toast } from 'react-hot-toast';

const ITDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [allRequests, setAllRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await approvalService.getRequests(); // This fetches all requests as per my backend update
            setAllRequests(res.data || []);
        } catch (error) {
            console.error('Error fetching IT requests:', error);
            // Fallback for demo/UI if API fails
            toast.error('Failed to load real-time IT data');
        } finally {
            setLoading(false);
        }
    };

    // --- Dynamic Data Logic ---
    const itUserRole = 'IT';

    // 1. IT Involvement: Requests where workflow includes "IT" (Case-insensitive)
    const itInvolvedRequests = allRequests.filter(req => 
        req.templateId?.nodes?.some(node => 
            node.approverRoles?.some(role => role.toUpperCase() === itUserRole)
        )
    );

    // 2. Pending IT Requests: Current turn is IT and status is Pending
    const pendingITRequests = itInvolvedRequests.filter(req => 
        req.status === 'pending' && 
        req.pendingApprovals?.some(pa => pa.role?.toUpperCase() === itUserRole && pa.status === 'pending')
    );

    // 3. IT Handled (Resolved) Requests: IT in workflow && status is Approved or Rejected
    const resolvedITRequests = itInvolvedRequests.filter(req => 
        req.status === 'approved' || req.status === 'rejected'
    );

    // --- Derived Stats ---
    const stats = [
        { 
            label: 'Pending IT Requests', 
            value: pendingITRequests.length, 
            subValue: 'Awaiting your action', 
            icon: Clock, 
            color: 'text-amber-500', 
            bg: 'bg-amber-50' 
        },
        { 
            label: 'IT Queue', 
            value: itInvolvedRequests.length, 
            subValue: 'Total IT lifecycle involvement', 
            icon: Layers, 
            color: 'text-primary', 
            bg: 'bg-background' 
        },
        { 
            label: 'Resolved Requests', 
            value: resolvedITRequests.length, 
            subValue: 'Handled by IT protocols', 
            icon: CheckCircle2, 
            color: 'text-secondary', 
            bg: 'bg-secondary/10' 
        },
    ];

    const chartData = [
        { name: 'Approved', value: resolvedITRequests.filter(r => r.status === 'approved').length, color: '#10B981' }, // Secondary
        { name: 'Pending', value: pendingITRequests.length, color: '#f59e0b' },
        { name: 'Rejected', value: resolvedITRequests.filter(r => r.status === 'rejected').length, color: '#ef4444' },
    ];

    const filteredRequests = itInvolvedRequests.filter(req => 
        (req.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (req._id?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-content-primary tracking-tight">IT Dashboard</h1>
                    <p className="text-content-secondary mt-1 font-medium italic">Systems Protocol & Infrastructure Approvals</p>
                </div>
                
                <div className="flex items-center space-x-4">
                    <div className="relative group flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-secondary/40 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search IT requests..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => navigate('/employee/new-request')}
                        className="bg-primary hover:bg-hover text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center space-x-2 shadow-lg shadow-primary/10 transition-all active:scale-95 whitespace-nowrap"
                    >
                        <Plus className="h-4 w-4" />
                        <span>New IT Request</span>
                    </button>
                </div>
            </div>

            {/* Overview Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-6 rounded-3xl border border-border shadow-sm flex items-center space-x-5 hover:shadow-md transition-shadow relative overflow-hidden group"
                    >
                        <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                            <stat.icon className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-black text-content-primary tracking-tight">{stat.value}</h3>
                            <p className="text-[11px] text-gray-400 font-medium mt-0.5">{stat.subValue}</p>
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform">
                            <stat.icon className="h-24 w-24" />
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* IT Requests Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[32px] border border-border shadow-sm overflow-hidden min-h-[500px]">
                        <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-content-primary flex items-center space-x-2">
                                <Activity className="h-5 w-5 text-primary" />
                                <span>IT Requests Queue</span>
                            </h3>
                            <div className="flex items-center space-x-2">
                                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                <span className="text-[10px] font-bold text-content-secondary/40 uppercase tracking-widest">Real-time Feed</span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] border-b border-border">
                                    <tr>
                                        <th className="px-8 py-4 text-left">Request Details</th>
                                        <th className="px-8 py-4 text-left">Current Stage</th>
                                        <th className="px-8 py-4 text-left">System Status</th>
                                        <th className="px-8 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredRequests.length > 0 ? filteredRequests.map((req) => (
                                        <tr key={req._id} className="hover:bg-gray-50/30 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center space-x-3">
                                                    <div className="p-2 bg-background rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                        <FileText className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-content-primary leading-tight">{req.title}</p>
                                                        <p className="text-[10px] text-content-secondary/40 font-bold uppercase tracking-widest mt-1">
                                                            {req.templateId?.workflowName} • {new Date(req.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center space-x-2">
                                                    <Shield className="h-3.5 w-3.5 text-primary/40" />
                                                    <span className="text-xs font-bold text-gray-600">
                                                        {req.pendingApprovals?.map(pa => pa.role).join(', ') || 'Processing'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                {/* System Status Mapping: Approved -> Online, Pending -> In Progress, Rejected -> Issue */}
                                                <div className="flex items-center space-x-2">
                                                    <div className={`h-1.5 w-1.5 rounded-full ${
                                                        req.status === 'approved' ? 'bg-emerald-500' :
                                                        req.status === 'rejected' ? 'bg-rose-500' : 'bg-amber-500'
                                                    }`} />
                                                    <span className={`text-[11px] font-bold ${
                                                        req.status === 'approved' ? 'text-emerald-600' :
                                                        req.status === 'rejected' ? 'text-rose-600' : 'text-amber-600'
                                                    }`}>
                                                        {req.status === 'approved' ? 'ONLINE' :
                                                         req.status === 'rejected' ? 'ISSUE' : 'IN PROGRESS'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button 
                                                    onClick={() => navigate(`/it/requests/${req._id}`)}
                                                    className="p-2 hover:bg-background rounded-xl transition-all border border-transparent hover:border-border text-content-secondary/40 hover:text-primary"
                                                >
                                                    <ArrowUpRight className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center justify-center space-y-3 opacity-30">
                                                    <Monitor className="h-12 w-12" />
                                                    <p className="text-sm font-bold text-content-primary uppercase tracking-widest">No IT Protocols Detected</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Metrics & Sidebar Content */}
                <div className="space-y-8">
                    {/* Visual Chart - Distribution */}
                    <ChartCard title="Request Distribution" subtitle="Infrastructure allocation audit">
                        <div className="h-[240px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={85}
                                        paddingAngle={chartData.filter(d => d.value > 0).length > 1 ? 5 : 0}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend 
                                        verticalAlign="bottom" 
                                        height={36}
                                        formatter={(value) => <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>

                    {/* System Guard Card */}
                    <div className="bg-white p-8 rounded-[32px] border border-border shadow-sm relative overflow-hidden group">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="p-2.5 bg-background text-primary rounded-xl">
                                <Shield className="h-5 w-5" />
                            </div>
                            <h4 className="text-sm font-black text-content-primary uppercase tracking-tighter">IT Protocol Guard</h4>
                        </div>
                        <p className="text-xs text-gray-400 font-medium leading-relaxed mb-6">
                            All IT requests are being monitored under the new smart substation protocol. Audit trails are active.
                        </p>
                        <div className="h-[2px] w-full bg-background rounded-full overflow-hidden mb-6">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: '85%' }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full bg-primary" 
                            />
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className="text-content-secondary/40 uppercase tracking-widest">System Health</span>
                            <span className="text-primary uppercase tracking-widest">85% OPTIMIZED</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ITDashboard;
