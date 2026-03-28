import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import ChartCard from './ChartCard';

const RequestStatusPieChart = ({ requests = [] }) => {
    const data = useMemo(() => {
        const counts = {
            pending: 0,
            approved: 0,
            rejected: 0
        };

        requests.forEach(req => {
            const status = (req.status || 'unknown').toLowerCase();
            if (counts[status] !== undefined) {
                counts[status]++;
            }
        });

        return [
            { name: 'Pending', value: counts.pending, color: '#F59E0B' }, // Amber-500
            { name: 'Approved', value: counts.approved, color: '#10B981' }, // Emerald-500
            { name: 'Rejected', value: counts.rejected, color: '#EF4444' }  // Red-500
        ].filter(item => item.value > 0);
    }, [requests]);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border border-border p-3 rounded-lg shadow-lg">
                    <p className="text-content-primary font-bold">{`${payload[0].name}: ${payload[0].value}`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <ChartCard title="Request Status" subtitle="Overview of your submission outcomes">
            {data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={data.length > 1 ? 5 : 0}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value) => <span className="text-gray-600 text-sm font-medium ml-1">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-content-secondary">
                    No data available
                </div>
            )}
        </ChartCard>
    );
};

export default RequestStatusPieChart;
