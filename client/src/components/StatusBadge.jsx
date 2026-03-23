import React from 'react';

const StatusBadge = ({ status, className = '' }) => {
    const s = status?.toLowerCase();
    const styles = {
        draft: 'bg-gray-100 text-gray-700 border-gray-200',
        submitted: 'bg-indigo-50 text-indigo-700 border-indigo-100',
        pending: 'bg-amber-50 text-amber-700 border-amber-100',
        approved: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        rejected: 'bg-red-50 text-red-700 border-red-100',
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${styles[s] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'} ${className}`}>
            {status}
        </span>
    );
};

export default StatusBadge;
