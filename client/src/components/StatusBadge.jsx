import React from 'react';

const StatusBadge = ({ status }) => {
    const s = status?.toLowerCase();
    const styles = {
        pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        approved: 'bg-green-500/10 text-green-500 border-green-500/20',
        rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${styles[s] || 'bg-gray-500/10 text-gray-500 border-gray-500/20'}`}>
            {status}
        </span>
    );
};

export default StatusBadge;
