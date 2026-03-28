import React from 'react';
import { Clock } from 'lucide-react';

const ActivityHistoryLog = () => {
    return (
        <div className="max-w-5xl mx-auto py-12">
            <div className="bg-white p-12 rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center text-center">
                <div className="h-16 w-16 bg-background text-primary rounded-full flex items-center justify-center mb-6">
                    <Clock className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold text-content-primary mb-2">Activity History</h2>
                <p className="text-content-secondary max-w-md">
                    Review your comprehensive timeline of actions, submissions, and systemic events spanning your account lifecycle.
                </p>
            </div>
        </div>
    );
};

export default ActivityHistoryLog;
