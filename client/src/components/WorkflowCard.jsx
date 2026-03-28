import React from 'react';
import { GitBranch, Clock, User } from 'lucide-react';
import StatusBadge from './StatusBadge';

const WorkflowCard = ({ workflow, requestsCount, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="bg-white p-6 rounded-xl transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md group cursor-pointer border border-border"
        >
            <div className="flex justify-between items-start mb-5">
                <div className="p-3 bg-background rounded-xl group-hover:bg-primary/10 transition-colors shadow-sm">
                    <GitBranch className="h-6 w-6 text-primary" />
                </div>
                <div className="text-right">
                    <p className="text-3xl font-bold text-gray-800">{requestsCount || 0}</p>
                    <p className="text-xs text-content-secondary uppercase font-bold tracking-widest mt-1">Requests</p>
                </div>
            </div>

            <h3 className="text-2xl font-bold mb-2 text-gray-800 transition-colors">{workflow.workflowName}</h3>
            <p className="text-sm text-content-secondary mb-6 line-clamp-2 leading-relaxed font-medium">{workflow.description}</p>

            <div className="flex items-center space-x-4 mb-8">
                <div className="flex -space-x-2">
                    {(workflow.nodes || workflow.steps || []).map((step, i) => (
                        <div
                            key={i}
                            className="h-8 w-8 rounded-full bg-gray-50 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-400 shadow-sm"
                            title={step.title || step.stepName || step.name}
                        >
                            {i + 1}
                        </div>
                    ))}
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{(workflow.nodes || workflow.steps || []).length} Phases</span>
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
                className="w-full py-3.5 bg-primary rounded-xl text-sm font-bold text-white shadow-sm hover:bg-primary-hover hover:shadow-md transition-all duration-300"
            >
                Initiate Flow
            </button>
        </div>
    );
};

export default WorkflowCard;
