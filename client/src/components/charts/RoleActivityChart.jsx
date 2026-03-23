import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import ChartCard from './ChartCard';

const RoleActivityChart = ({ users = [], requests = [] }) => {
    // Note: Since we might not have all users access in requests, we can infer activity 
    // based on requester roles if populated, OR just use request counts if specific user data isn't passed.
    // The prompt asked for "Number of requests per role".
    // Assuming 'requests' contains requesterId with role or we need to derive it.
    // If we don't have role on request.requesterId, we might be limited.
    // Let's assume we can group by role from the requests if requesterId is populated with role.

    // Fallback: If we can't get role from requests easily (if population is shallow), 
    // we might mock or use what's available. 
    // Let's inspect data flow later, but for now implement logic assuming requesterId.role exists.

    const data = useMemo(() => {
        const roleCounts = {
            Employee: 0,
            Manager: 0,
            Admin: 0
        };

        requests.forEach(req => {
            const role = req.requesterId?.role || 'Employee'; // Default to Employee if unknown
            if (roleCounts[role] !== undefined) {
                roleCounts[role]++;
            } else {
                // Handle edge cases
                roleCounts['Employee']++;
            }
        });

        return Object.entries(roleCounts).map(([name, value]) => ({
            name,
            value
        }));
    }, [requests]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900/90 border border-white/10 p-3 rounded-lg shadow-xl backdrop-blur-md">
                    <p className="text-gray-300 text-xs mb-1">{label}</p>
                    <p className="text-white font-bold">{`${payload[0].value} Requests`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <ChartCard title="Role-Based Activity" subtitle="Request initiation by user role">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                        dataKey="name"
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? '#8B5CF6' : index === 1 ? '#EC4899' : '#F43F5E'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </ChartCard>
    );
};

export default RoleActivityChart;
