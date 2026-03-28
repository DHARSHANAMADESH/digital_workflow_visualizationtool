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
                <div className="bg-gray-900 p-4 rounded-[20px] shadow-2xl border border-white/10 backdrop-blur-xl">
                    <p className="text-indigo-400 text-[8px] font-normal uppercase tracking-[0.2em] mb-2">{payload[0].name}</p>
                    <p className="text-white font-semibold text-2xl tabular-nums">{payload[0].value} <span className="text-[10px] text-content-secondary font-normal uppercase ml-1">Total</span></p>
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
                            paddingAngle={data.length > 1 ? 8 : 0}
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

                {/* Center Text Card */}
                <div 
                    className="absolute flex flex-col items-center justify-center pointer-events-none z-10"
                    style={{
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '16px',
                        padding: '12px 18px',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)'
                    }}
                >
                    <span 
                        className="tabular-nums"
                        style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', lineHeight: '1' }}
                    >
                        {total}
                    </span>
                    <span 
                        style={{ fontSize: '12px', fontWeight: '500', color: '#6B7280', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    >
                        Requests
                    </span>
                </div>
            </div>
        </ChartCard>
    );
};

export default ApprovalStatusBarChart;
