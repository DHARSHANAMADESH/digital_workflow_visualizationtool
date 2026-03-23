import React from 'react';
import { motion } from 'framer-motion';

const ChartCard = ({ title, subtitle, children, className = '' }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all ${className}`}
        >
            <div className="mb-6 flex flex-col space-y-1">
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h3>
                {subtitle && <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest">{subtitle}</p>}
            </div>
            <div className="w-full h-[300px]">
                {children}
            </div>
        </motion.div>
    );
};

export default ChartCard;
