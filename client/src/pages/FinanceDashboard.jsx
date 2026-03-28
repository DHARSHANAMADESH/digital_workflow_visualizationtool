import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    DollarSign,
    Clock,
    CheckCircle2,
    Search,
    Plus,
    FileText,
    MoreHorizontal,
    TrendingUp,
    ArrowUpRight,
    ChevronRight
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { approvalService } from '../services/api';
import ChartCard from '../components/charts/ChartCard';
import StatusBadge from '../components/StatusBadge';
import { toast } from 'react-hot-toast';

const FinanceDashboard = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const financeUserRole = 'Finance';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await approvalService.getRequests();
            setRequests(res.data || []);
        } catch (error) {
            console.error('Error fetching Finance data:', error);
            toast.error('Failed to load financial records');
        } finally {
            setLoading(false);
        }
    };

    // --- Dynamic Filtering Logic ---

    // 1. Finance-Specific Requests: Using 'type' or workflow names containing Finance
    const financeRequests = useMemo(() =>
        requests.filter(req =>
            req.type?.toUpperCase() === 'FINANCE' ||
            req.templateId?.workflowName?.toLowerCase().includes('finance') ||
            req.templateId?.nodes?.some(node => node.approverRoles?.some(role => role.toUpperCase() === 'FINANCE'))
        ), [requests]);

    // 2. Pending Approvals: Requests currently waiting for Finance action
    const pendingFinance = useMemo(() =>
        financeRequests.filter(req =>
            req.status === 'pending' &&
            req.pendingApprovals?.some(pa => pa.role?.toUpperCase() === 'FINANCE' && pa.status === 'pending')
        ), [financeRequests]);

    // 3. Status Distribution (Real Data Only)
    const approvedCount = financeRequests.filter(r => r.status === 'approved').length;
    const pendingCount = financeRequests.filter(r => r.status === 'pending').length;
    const rejectedCount = financeRequests.filter(r => r.status === 'rejected').length;

    const chartData = [
        { name: 'Approved', value: approvedCount, color: '#10b981' },
        { name: 'Pending', value: pendingCount, color: '#f59e0b' },
        { name: 'Rejected', value: rejectedCount, color: '#ef4444' },
    ].filter(d => d.value > 0);


    const filteredFinanceRequests = financeRequests.filter(req =>
        (req.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (req._id?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-600"></div>
                    <p className="text-teal-700 font-medium tracking-wide">Syncing Finance Data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-semibold text-content-primary tracking-tight">Finance Dashboard</h1>
                    <p className="text-sm text-content-secondary mt-1">Systemized Financial Protocols & Approval Audit</p>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="relative group flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search requests..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => navigate('/employee/new-request')}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center space-x-2 shadow-lg shadow-teal-100 transition-all active:scale-95 whitespace-nowrap"
                    >
                        <Plus className="h-4 w-4" />
                        <span>New Invoice</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Financial Activity */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Finance Approval Queue Section */}
                    <div className="bg-white rounded-[32px] border border-border shadow-sm overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                            <h3 className="text-xl font-semibold text-content-primary flex items-center space-x-2 tracking-tight">
                                <Clock className="h-5 w-5 text-amber-500" />
                                <span>Awaiting Finance Approval</span>
                            </h3>
                            <div className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black rounded-full uppercase tracking-widest">
                                {pendingFinance.length} PENDING
                            </div>
                        </div>
                        <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
                            {pendingFinance.length > 0 ? pendingFinance.map((req) => (
                                <div
                                    key={req._id}
                                    className="px-8 py-5 flex items-center justify-between hover:bg-gray-50/50 transition-all duration-300 group cursor-pointer"
                                    onClick={() => navigate(`/finance/requests/${req._id}`)}
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors border border-border">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-content-primary tracking-tight">{req.title}</h4>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                                                {req.templateId?.workflowName} • {new Date(req.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-6 text-right">

                                        <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-teal-600 transition-colors" />
                                    </div>
                                </div>
                            )) : (
                                <div className="px-8 py-12 text-center text-gray-400 font-bold h-[150px] flex items-center justify-center uppercase tracking-widest text-[9px] opacity-60">
                                    Queue Clear • No Pending Actions
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Finance Request Table Section */}
                    <div className="bg-white rounded-[32px] border border-border shadow-sm overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-content-primary tracking-tight">Finance Ledger</h3>
                            <p className="text-[10px] font-normal text-gray-400 uppercase tracking-[0.2em]">Latest Transactions</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] border-b border-border">
                                    <tr>
                                        <th className="px-8 py-4 text-left">Invoice ID</th>
                                        <th className="px-8 py-4 text-left">Workflow</th>
                                        <th className="px-8 py-4 text-left">Status</th>
                                        <th className="px-8 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredFinanceRequests.length > 0 ? filteredFinanceRequests.map((inv) => (
                                        <tr key={inv._id} className="hover:bg-gray-50/30 transition-colors group">
                                            <td className="px-8 py-5 text-[11px] font-semibold text-teal-600 tracking-wider">#{inv._id.slice(-6).toUpperCase()}</td>
                                            <td className="px-8 py-5 text-sm font-semibold text-content-primary">{inv.templateId?.workflowName}</td>
                                            <td className="px-8 py-5 text-sm">
                                                <div className="flex items-center space-x-2">
                                                    <div className={`h-1.5 w-1.5 rounded-full ${inv.status === 'approved' ? 'bg-emerald-500' :
                                                            inv.status === 'rejected' ? 'bg-rose-500' : 'bg-amber-500'}`}
                                                    />
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${inv.status === 'approved' ? 'text-emerald-600' :
                                                            inv.status === 'rejected' ? 'text-rose-600' : 'text-amber-600'}`}>
                                                        {inv.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button
                                                    onClick={() => navigate(`/finance/requests/${inv._id}`)}
                                                    className="p-2 hover:bg-white rounded-xl transition-all border border-transparent hover:border-border text-gray-400 hover:text-teal-600"
                                                >
                                                    <ArrowUpRight className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center justify-center space-y-3 opacity-30">
                                                    <FileText className="h-10 w-10 text-gray-400" />
                                                    <p className="text-[10px] font-black text-content-primary uppercase tracking-widest">No Financial Ledger Entries Found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column - Status Insights */}
                <div className="space-y-8">
                    {/* Finance Status Distribution Chart */}
                    <ChartCard title="Finance Allocation" subtitle="Real-time status distribution">
                        <div className="h-[280px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={90}
                                        paddingAngle={chartData.filter(d => d.value > 0).length > 1 ? 8 : 0}
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
                                        formatter={(value) => <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Text */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                                <span className="text-3xl font-semibold tracking-tight text-content-primary leading-none">
                                    {financeRequests.length}
                                </span>
                                <span className="text-[9px] text-gray-400 font-normal uppercase tracking-wider mt-1">
                                    Total Requests
                                </span>
                            </div>
                        </div>
                    </ChartCard>


                </div>
            </div>
        </div>
    );
};

export default FinanceDashboard;
