import React from 'react';

const StatusBadge = ({ status, className = '' }) => {
    const s = status?.toLowerCase();
    const styles = {
        draft: 'bg-background text-content-secondary border-border',
        submitted: 'bg-background text-primary border-primary/20',
        pending: 'bg-amber-50 text-amber-600 border-amber-100',
        approved: 'bg-secondary/10 text-secondary border-secondary/20',
        rejected: 'bg-rose-50 text-rose-600 border-rose-100',
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${styles[s] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'} ${className}`}>
            {status}
        </span>
    );
};

export default StatusBadge;
