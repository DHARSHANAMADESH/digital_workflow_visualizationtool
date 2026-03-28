import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChartCard from './ChartCard';

const SystemActivityChart = ({ requests = [] }) => {
    const data = useMemo(() => {
        const months = {};
        const now = new Date();

        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = d.toLocaleString('default', { month: 'short' });
            months[key] = 0;
        }

        requests.forEach(req => {
            const d = new Date(req.createdAt);
            const key = d.toLocaleString('default', { month: 'short' });
            if (months[key] !== undefined) {
                months[key]++;
            }
        });

        return Object.entries(months).map(([name, value]) => ({
            name,
            requests: value
        }));
    }, [requests]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-900 border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
                    <p className="text-gray-400 text-[10px] mb-2 font-normal uppercase tracking-[0.2em]">{label}</p>
                    <p className="text-primary/40 font-semibold text-lg tabular-nums">{`${payload[0].value} Directives`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <ChartCard title="System Activity" subtitle="Total request volume over time">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis
                        dataKey="name"
                        stroke="#94a3b8"
                        fontSize={10}
                        fontWeight={900}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                    />
                    <YAxis
                        stroke="#94a3b8"
                        fontSize={10}
                        fontWeight={900}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366F1', strokeWidth: 2 }} />
                    <Area
                        type="monotone"
                        dataKey="requests"
                        stroke="#6366F1"
                        fillOpacity={1}
                        fill="url(#colorRequests)"
                        strokeWidth={4}
                        dot={false}
                        activeDot={{ r: 6, stroke: '#fff', strokeWidth: 3, fill: '#6366F1' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </ChartCard>
    );
};

export default SystemActivityChart;
