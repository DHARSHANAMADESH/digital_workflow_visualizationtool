import React from 'react';
import { motion } from 'framer-motion';
import { User, ShieldCheck, UserCheck, CheckCircle2, ChevronRight } from 'lucide-react';

const WorkflowPipeline = ({ metrics }) => {
    const stages = [
        {
            id: 'employee_request',
            label: 'Employee Request',
            description: 'Total requests submitted',
            count: metrics?.employee_request || 0,
            icon: User,
            color: 'text-primary',
            bgColor: 'bg-background',
            borderColor: 'border-blue-200',
            shadowColor: 'shadow-blue-100'
        },
        {
            id: 'manager_pending',
            label: 'Manager Approval',
            description: 'Waiting for manager',
            count: metrics?.manager_pending || 0,
            icon: UserCheck,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200',
            shadowColor: 'shadow-orange-100'
        },
        {
            id: 'admin_pending',
            label: 'Admin Approval',
            description: 'Waiting for admin',
            count: metrics?.admin_pending || 0,
            icon: ShieldCheck,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200',
            shadowColor: 'shadow-purple-100'
        },
        {
            id: 'completed',
            label: 'Completed',
            description: 'Fully approved',
            count: metrics?.completed || 0,
            icon: CheckCircle2,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
            borderColor: 'border-emerald-200',
            shadowColor: 'shadow-emerald-100'
        }
    ];

    return (
        <div className="w-full py-8 overflow-x-auto no-scrollbar">
            <div className="flex items-center space-x-4 min-w-max px-2">
                {stages.map((stage, index) => (
                    <React.Fragment key={stage.id}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex flex-col items-center justify-center p-6 bg-white border ${stage.borderColor} rounded-[2rem] shadow-sm hover:shadow-md transition-all w-64 h-44 relative group`}
                        >
                            {/* Icon Circle */}
                            <div className={`h-14 w-14 rounded-2xl ${stage.bgColor} flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300`}>
                                <stage.icon className={`h-7 w-7 ${stage.color}`} />
                            </div>

                            {/* Label & Description */}
                            <h3 className="text-sm font-semibold text-content-primary uppercase tracking-tight text-center">{stage.label}</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 mb-2">{stage.description}</p>

                            {/* Count Badge */}
                            <div className={`mt-auto px-4 py-1.5 rounded-full ${stage.bgColor} ${stage.color} text-lg font-semibold shadow-inner flex items-center justify-center min-w-[3rem]`}>
                                {stage.count}
                            </div>

                            {/* Subtle Glow Influence */}
                            <div className={`absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-20 transition-opacity bg-gradient-to-br from-transparent to-current ${stage.color} pointer-events-none`} />
                        </motion.div>

                        {index < stages.length - 1 && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.15 }}
                                className="flex items-center text-gray-200"
                            >
                                <ChevronRight className="h-8 w-8 stroke-[1.5]" />
                            </motion.div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default WorkflowPipeline;
