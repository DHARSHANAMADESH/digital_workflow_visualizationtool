import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import ChartCard from './ChartCard';

const ApprovalStatusBarChart = ({ requests = [] }) => {
    const data = useMemo(() => {
        const counts = {
            Pending: 0,
            Approved: 0,
            Rejected: 0
        };

        requests.forEach(req => {
            const reqStatus = (req.status || 'pending').toLowerCase();
            if (reqStatus === 'approved') counts.Approved++;
            else if (reqStatus === 'pending') counts.Pending++;
            else if (reqStatus === 'rejected') counts.Rejected++;
        });

        return [
            { name: 'Approved', value: counts.Approved, color: '#10B981', glow: 'rgba(16, 185, 129, 0.2)' },
            { name: 'Pending', value: counts.Pending, color: '#F59E0B', glow: 'rgba(245, 158, 11, 0.2)' },
            { name: 'Rejected', value: counts.Rejected, color: '#F43F5E', glow: 'rgba(244, 63, 94, 0.2)' }
        ].filter(d => d.value > 0);
    }, [requests]);

    const total = useMemo(() => data.reduce((acc, curr) => acc + curr.value, 0), [data]);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#0F172A] p-4 rounded-[20px] shadow-2xl border border-white/10 backdrop-blur-xl">
                    <p className="text-indigo-400 text-[8px] font-black uppercase tracking-[0.2em] mb-2">{payload[0].name}</p>
                    <p className="text-white font-black text-2xl tabular-nums">{payload[0].value} <span className="text-[10px] text-gray-500 font-bold uppercase ml-1">Total</span></p>
                </div>
            );
        }
        return null;
    };

    return (
        <ChartCard title="Request Status Overview" subtitle="Distribution of current assigned requests">
            <div className="h-full w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={95}
                            paddingAngle={8}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={12}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                    style={{ filter: `drop-shadow(0 0 8px ${entry.glow})` }}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                    </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-4xl font-black text-gray-900 tracking-tighter tabular-nums">{total}</span>
                    <span className="text-[9px] text-gray-400 font-black uppercase tracking-[0.3em] mt-1 italic">Requests</span>
                </div>
            </div>
        </ChartCard>
    );
};

export default ApprovalStatusBarChart;
