import React from 'react';
import { GitBranch, Clock, User } from 'lucide-react';
import StatusBadge from './StatusBadge';

const WorkflowCard = ({ workflow, requestsCount, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="bg-white p-6 rounded-2xl transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl group cursor-pointer border border-gray-100 hover:border-indigo-500/30"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors">
                    <GitBranch className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{requestsCount || 0}</p>
                    <p className="text-[11px] text-gray-400 uppercase font-bold tracking-widest">Logs</p>
                </div>
            </div>

            <h3 className="text-xl font-bold mb-1 text-gray-900 group-hover:text-indigo-700 transition-colors">{workflow.workflowName}</h3>
            <p className="text-xs text-gray-500 mb-4 line-clamp-2 italic leading-relaxed font-medium">{workflow.description}</p>

            <div className="flex items-center space-x-4 mb-6">
                <div className="flex -space-x-2">
                    {(workflow.nodes || workflow.steps || []).map((step, i) => (
                        <div
                            key={i}
                            className="h-7 w-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400 shadow-sm"
                            title={step.title || step.stepName || step.name}
                        >
                            {i + 1}
                        </div>
                    ))}
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">{(workflow.nodes || workflow.steps || []).length} Phases</span>
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
                className="w-full py-3 bg-gray-50 rounded-xl text-[11px] font-bold uppercase tracking-widest text-indigo-700 border border-gray-100 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-300"
            >
                Initiate Flow
            </button>
        </div>
    );
};

export default WorkflowCard;
