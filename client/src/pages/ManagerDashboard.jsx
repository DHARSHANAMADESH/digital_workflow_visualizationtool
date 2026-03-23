import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { approvalService, workflowService } from '../services/api';
import { Loader2, Briefcase, ChevronRight, CheckCircle2 } from 'lucide-react';

const ManagerDashboard = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [assignedRequests, setAssignedRequests] = useState([]);
    const [myWorkflows, setMyWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            approvalService.getRequests(),
            workflowService.getAll(),
            approvalService.getAssigned()
        ]).then(([reqRes, wfRes, assignedRes]) => {
            setRequests(reqRes.data || []);
            setAssignedRequests(assignedRes.data || []);

            // Store all unique workflow names
            const allWorkflows = (wfRes.data || []).map(w => w.workflowName);
            setMyWorkflows([...new Set(allWorkflows)]);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                    <p className="text-indigo-700 font-medium tracking-wide">Syncing Manager Data...</p>
                </div>
            </div>
        );
    }

    // --- Data Processing for Charts ---

    // 1. Approval Distribution Data (Donut Chart)
    const approvedCount = assignedRequests.filter(r => r.status?.toLowerCase() === 'approved').length;
    const pendingCount = assignedRequests.filter(r => r.status?.toLowerCase() === 'pending').length;
    const rejectedCount = assignedRequests.filter(r => r.status?.toLowerCase() === 'rejected').length;

    const distributionData = [
        { name: 'Approved', value: approvedCount, color: '#10b981' }, // Emerald
        { name: 'Pending', value: pendingCount, color: '#facc15' },  // Yellow
        { name: 'Rejected', value: rejectedCount, color: '#ef4444' } // Red
    ].filter(d => d.value > 0);

    // 2. Trend Data (Area Chart)
    const getTrendData = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayCounts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

        assignedRequests.forEach(req => {
            if (req.createdAt) {
                const date = new Date(req.createdAt);
                const dayName = days[date.getDay()];
                if (dayCounts[dayName] !== undefined) {
                    dayCounts[dayName]++;
                }
            }
        });

        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
            name: day,
            requests: dayCounts[day]
        }));
    };
    const trendData = getTrendData();

    // 3. Comparison Data (Progress Bars)
    const comparisonData = myWorkflows.map((name, idx) => {
        const reqs = requests.filter(r => r.templateId?.workflowName === name);
        const approvedCount = reqs.filter(r => r.status?.toLowerCase() === 'approved').length;
        const pendingCount = reqs.filter(r => r.status?.toLowerCase() === 'pending').length;
        const rejectedCount = reqs.filter(r => r.status?.toLowerCase() === 'rejected').length;
        const total = reqs.length;

        return {
            name,
            total,
            Approved: approvedCount,
            Pending: pendingCount,
            Rejected: rejectedCount,
        };
    }).sort((a, b) => b.total - a.total); // Sort by most requests first

    // Helpers
    const getPercentage = (value, total) => {
        if (total === 0) return 0;
        return Math.round((value / total) * 100);
    };

    // Custom Tooltip for Recharts Donut
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/90 backdrop-blur-sm px-4 py-3 rounded-xl shadow-xl justify-center flex flex-col items-center border border-indigo-100 z-50">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{payload[0].name}</span>
                    <span className="text-xl font-black text-gray-900 mt-1">{payload[0].value} <span className="text-sm">Reqs</span></span>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8 max-w-[1400px] mx-auto pb-12">


            {/* Section 2 & 3: Top Analytics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Section 2: Approval Distribution (Donut Chart) */}
                <div className="lg:col-span-4 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-between ring-1 ring-black/5 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold tracking-tight text-gray-900 flex items-center">
                            Approval Distribution
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Status of Assigned Requests</p>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center min-h-[250px] relative">
                        {assignedRequests.length === 0 ? (
                            <div className="flex flex-col items-center justify-center opacity-60">
                                <CheckCircle2 className="w-16 h-16 text-indigo-200 mb-4" />
                                <span className="text-indigo-800 font-semibold text-lg">All Caught Up!</span>
                                <span className="text-gray-500 text-sm">No assigned requests pending</span>
                            </div>
                        ) : (
                            <>
                                <div className="h-[220px] w-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={distributionData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={70}
                                                outerRadius={100}
                                                paddingAngle={4}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {distributionData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>

                                    {/* Center Text */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-4xl font-semibold tracking-tight text-gray-900 leading-none">
                                            {assignedRequests.length}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-1">
                                            Total Requests
                                        </span>
                                    </div>
                                </div>

                                {/* Legend */}
                                <div className="flex justify-center flex-wrap gap-4 mt-6">
                                    {distributionData.map((item, idx) => (
                                        <div key={idx} className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                            <div className="w-2.5 h-2.5 rounded-full mr-2 shadow-sm" style={{ backgroundColor: item.color }} />
                                            <span className="text-xs font-medium text-gray-700 mr-2">{item.name}</span>
                                            <span className="text-xs font-semibold text-gray-900">{getPercentage(item.value, assignedRequests.length)}%</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Section 3: Requests per Day (Line Chart / Area Chart) */}
                <div className="lg:col-span-8 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col ring-1 ring-black/5 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold tracking-tight text-gray-900">Requests per Day</h2>
                        <p className="text-sm text-gray-500 mt-1">Trend of Workflow Requests</p>
                    </div>

                    <div className="flex-1 min-h-[250px] mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorIndigo" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 500 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 500 }}
                                    dx={-10}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', fontWeight: '500' }}
                                    cursor={{ stroke: '#818cf8', strokeWidth: 2, strokeDasharray: '4 4' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="requests"
                                    stroke="#4f46e5"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorIndigo)"
                                    activeDot={{ r: 8, fill: '#fff', stroke: '#4f46e5', strokeWidth: 3 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Section 4: Workflow Comparison (Progress Bars) */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 ring-1 ring-black/5 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300">
                <div className="mb-8">
                    <h2 className="text-xl font-semibold tracking-tight text-gray-900">Workflow Analytics</h2>
                    <p className="text-sm text-gray-500 mt-1">Activity breakdown by workflow category</p>
                </div>

                <div className="space-y-6">
                    {comparisonData.map((workflow, idx) => {
                        const total = workflow.total;
                        const pApproved = getPercentage(workflow.Approved, total);
                        const pPending = getPercentage(workflow.Pending, total);
                        const pRejected = getPercentage(workflow.Rejected, total);

                        return (
                            <div key={idx} className="group border border-gray-50 rounded-2xl p-5 hover:bg-indigo-50/30 transition-all duration-300">
                                <div className="flex flex-col lg:flex-row lg:items-center gap-6">

                                    {/* Left: Name & Count */}
                                    <div className="flex items-center justify-between lg:w-[30%] min-w-[250px]">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 text-indigo-600 group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300">
                                                <Briefcase className="w-5 h-5" />
                                            </div>
                                            <span className="text-[15px] font-semibold tracking-tight text-gray-800">{workflow.name}</span>
                                        </div>
                                        <div className="flex flex-col items-end mr-4">
                                            <span className="text-2xl font-semibold tracking-tight text-indigo-900 leading-none">{total}</span>
                                            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-1">Total</span>
                                        </div>
                                    </div>

                                    {/* Middle: Progress Bar */}
                                    <div className="flex-1 max-w-full lg:max-w-[40%] flex flex-col justify-center">
                                        {total === 0 ? (
                                            <div className="w-full h-4 bg-gray-50 rounded-full border border-gray-100 flex items-center justify-center">
                                                <span className="text-[10px] text-gray-400 font-medium italic">Awaiting First Request</span>
                                            </div>
                                        ) : (
                                            <div className="w-full h-4 flex overflow-hidden rounded-full shadow-inner bg-gray-100 space-x-[2px]">
                                                {workflow.Approved > 0 && (
                                                    <div style={{ width: `${pApproved}%` }} className="h-full bg-emerald-500 hover:opacity-90 transition-opacity" />
                                                )}
                                                {workflow.Pending > 0 && (
                                                    <div style={{ width: `${pPending}%` }} className="h-full bg-yellow-400 hover:opacity-90 transition-opacity" />
                                                )}
                                                {workflow.Rejected > 0 && (
                                                    <div style={{ width: `${pRejected}%` }} className="h-full bg-red-500 hover:opacity-90 transition-opacity" />
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Legend Pills */}
                                    <div className="flex-1 flex flex-wrap items-center justify-start lg:justify-end gap-3 min-w-[300px]">
                                        {total > 0 ? (
                                            <>
                                                {workflow.Approved > 0 && (
                                                    <div className="flex items-center bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2" />
                                                        <span className="text-xs font-medium text-gray-700 mr-2">Approved</span>
                                                        <span className="text-sm font-semibold text-gray-900">{workflow.Approved}</span>
                                                    </div>
                                                )}
                                                {workflow.Pending > 0 && (
                                                    <div className="flex items-center bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 mr-2" />
                                                        <span className="text-xs font-medium text-gray-700 mr-2">Pending</span>
                                                        <span className="text-sm font-semibold text-gray-900">{workflow.Pending}</span>
                                                    </div>
                                                )}
                                                {workflow.Rejected > 0 && (
                                                    <div className="flex items-center bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 mr-2" />
                                                        <span className="text-xs font-medium text-gray-700 mr-2">Rejected</span>
                                                        <span className="text-sm font-semibold text-gray-900">{workflow.Rejected}</span>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="opacity-0 lg:opacity-100 flex items-center bg-white px-4 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                                                <span className="text-xs font-medium text-gray-400">0 metrics available</span>
                                            </div>
                                        )}
                                        <ChevronRight className="w-5 h-5 text-gray-300 ml-auto group-hover:text-indigo-500 transition-colors hidden lg:block" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    );
};

export default ManagerDashboard;
