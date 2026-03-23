import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import ChartCard from './ChartCard';

const WorkflowPerformanceChart = ({ requests = [] }) => {
    const data = useMemo(() => {
        // Calculate average completion time per workflow
        // Group by workflowName
        const wfStats = {};

        requests.forEach(req => {
            if (req.status === 'approved' || req.status === 'rejected') {
                const wfName = req.templateId?.workflowName || 'Unknown';
                if (!wfStats[wfName]) {
                    wfStats[wfName] = { totalTime: 0, count: 0 };
                }

                // Calculate duration
                const start = new Date(req.createdAt);
                let end = new Date(req.updatedAt);

                // Fallback: If updatedAt is invalid or same as createdAt (and there's a history), use last history item
                if ((isNaN(end.getTime()) || end.getTime() === start.getTime()) && req.history?.length > 0) {
                    const lastAction = req.history[req.history.length - 1];
                    if (lastAction?.timestamp) {
                        end = new Date(lastAction.timestamp);
                    }
                }

                if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                    const durationHours = Math.max(0, (end - start) / (1000 * 60 * 60));
                    wfStats[wfName].totalTime += durationHours;
                    wfStats[wfName].count++;
                }
            }
        });

        return Object.entries(wfStats)
            .map(([name, stats]) => ({
                name,
                avgTime: parseFloat((stats.totalTime / stats.count).toFixed(1))
            }))
            .sort((a, b) => b.avgTime - a.avgTime)
            .slice(0, 5); // Top 5 slowest or most active
    }, [requests]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#0F172A] border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
                    <p className="text-gray-400 text-[10px] mb-2 font-black uppercase tracking-[0.2em]">{label}</p>
                    <p className="text-white font-black text-lg tabular-nums">{`${payload[0].value} Hours`}</p>
                    <p className="text-indigo-400 text-[8px] font-black uppercase tracking-widest mt-1">Avg Efficiency</p>
                </div>
            );
        }
        return null;
    };

    return (
        <ChartCard title="Workflow Efficiency" subtitle="Avg. completion time (hours)">
            {data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis
                            dataKey="name"
                            stroke="#94a3b8"
                            fontSize={10}
                            fontWeight={900}
                            tickLine={false}
                            axisLine={false}
                            interval={0}
                            dy={10}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            fontSize={10}
                            fontWeight={900}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} />
                        <Bar
                            dataKey="avgTime"
                            fill="#6366F1"
                            radius={[8, 8, 4, 4]}
                            barSize={32}
                            className="hover:opacity-80 transition-opacity cursor-pointer shadow-lg shadow-indigo-500/20"
                        />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                    No completion data recorded
                </div>
            )}
        </ChartCard>
    );
};

export default WorkflowPerformanceChart;
