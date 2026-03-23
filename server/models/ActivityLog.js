const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    requestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WorkflowInstance',
        required: true
    },
    actionType: {
        type: String,
        enum: ['SUBMITTED', 'APPROVED', 'REJECTED', 'REVISION_REQUESTED', 'RESUBMITTED', 'PROCESSING', 'COMPLETED'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    actor: {
        type: String,
        enum: ['employee', 'manager', 'system'],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for fast retrieval of latest activities for a user
activityLogSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.Schema.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);
