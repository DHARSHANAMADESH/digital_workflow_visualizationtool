import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChartCard from './ChartCard';

const MonthlySubmissionsChart = ({ requests = [] }) => {
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

        return Object.entries(months).map(([name, count]) => ({
            name,
            submissions: count
        }));
    }, [requests]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border border-gray-200 p-3 rounded-lg shadow-lg">
                    <p className="text-gray-500 text-xs mb-1 font-bold uppercase tracking-wider">{label}</p>
                    <p className="text-indigo-700 font-bold">{`${payload[0].value} Submissions`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <ChartCard title="Submission Trends" subtitle="Monthly request volume">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis
                        dataKey="name"
                        stroke="#64748B"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#64748B"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E0E7FF', strokeWidth: 2 }} />
                    <Line
                        type="monotone"
                        dataKey="submissions"
                        stroke="#4F46E5"
                        strokeWidth={3}
                        dot={{ fill: '#4F46E5', r: 4, strokeWidth: 0 }}
                        activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </ChartCard>
    );
};

export default MonthlySubmissionsChart;
