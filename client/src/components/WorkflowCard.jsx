import React from 'react';
import { GitBranch, Clock, User } from 'lucide-react';
import StatusBadge from './StatusBadge';

const WorkflowCard = ({ workflow, requestsCount, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="glass-card p-6 transition-all duration-300 hover:translate-y-[-4px] hover:shadow-2xl group cursor-pointer border border-white/5 hover:border-violet-500/30"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-violet-500/10 rounded-xl group-hover:bg-violet-500/20 transition-colors">
                    <GitBranch className="h-6 w-6 text-violet-400" />
                </div>
                <div className="text-right">
                    <p className="text-2xl font-semibold text-white">{requestsCount || 0}</p>
                    <p className="text-[11px] text-gray-500 uppercase font-semibold tracking-wider">Logs</p>
                </div>
            </div>

            <h3 className="text-xl font-bold mb-1 text-white group-hover:text-violet-400 transition-colors">{workflow.workflowName}</h3>
            <p className="text-xs text-gray-500 mb-4 line-clamp-2 italic leading-relaxed">{workflow.description}</p>

            <div className="flex items-center space-x-4 mb-6">
                <div className="flex -space-x-2">
                    {workflow.steps.map((step, i) => (
                        <div
                            key={i}
                            className="h-7 w-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-semibold text-gray-400"
                            title={step.name}
                        >
                            {i + 1}
                        </div>
                    ))}
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-600">{workflow.steps.length} Phases</span>
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
                className="w-full py-3 bg-white/5 rounded-xl text-[11px] font-semibold uppercase tracking-wider text-gray-400 border border-white/10 group-hover:bg-violet-600 group-hover:text-white group-hover:border-violet-600 transition-all duration-500"
            >
                Initiate Flow
            </button>
        </div>
    );
};

export default WorkflowCard;
