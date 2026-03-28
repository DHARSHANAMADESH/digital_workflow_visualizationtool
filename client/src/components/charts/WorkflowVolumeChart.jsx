import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import ChartCard from './ChartCard';

const WorkflowVolumeChart = ({ requests = [] }) => {
    const data = useMemo(() => {
        const counts = {};

        requests.forEach(req => {
            const wfName = req.templateId?.workflowName || 'Unknown';
            counts[wfName] = (counts[wfName] || 0) + 1;
        });

        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, value]) => ({ name, value }));
    }, [requests]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-900 p-4 rounded-[20px] shadow-2xl border border-white/10 backdrop-blur-xl">
                    <p className="text-primary/40 text-[8px] font-normal uppercase tracking-[0.2em] mb-2 truncate max-w-[150px]">{label}</p>
                    <p className="text-white font-semibold text-2xl tabular-nums">{payload[0].value} <span className="text-[10px] text-content-secondary font-normal uppercase ml-1">Total</span></p>
                </div>
            );
        }
        return null;
    };

    return (
        <ChartCard title="Request Volume by Category" subtitle="Most active request types">
            {data.length > 0 ? (
                <div className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 20, right: 10, left: -40, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorVolumePrimary" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="name"
                                hide
                            />
                            <YAxis
                                hide
                            />
                            <Tooltip content={<CustomTooltip />} cursor={false} />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#14B8A6"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#colorVolumePrimary)"
                                dot={{ r: 6, fill: '#14B8A6', strokeWidth: 3, stroke: '#fff' }}
                                activeDot={{ r: 8, strokeWidth: 0, fill: '#0D9488' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <div className="h-16 w-16 rounded-[24px] bg-gray-50 flex items-center justify-center border border-dashed border-border shadow-inner">
                        <span className="text-gray-200 font-semibold text-xl">0</span>
                    </div>
                    <p className="text-[10px] font-extrabold text-gray-300 uppercase tracking-widest italic">Zero active throughput</p>
                </div>
            )}
        </ChartCard>
    );
};

export default WorkflowVolumeChart;
