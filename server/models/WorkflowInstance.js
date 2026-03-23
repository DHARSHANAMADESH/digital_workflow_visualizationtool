const mongoose = require('mongoose');

const workflowInstanceSchema = new mongoose.Schema({
    templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkflowTemplate', required: true },
    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },

    // The data payload submitted with the request
    formData: { type: mongoose.Schema.Types.Mixed, default: {} },

    status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled', 'draft'], default: 'pending' },

    // Current Node in the Directed Acyclic Graph (DAG)
    currentNodeId: { type: String },

    // Real-time tracking of who needs to approve right now for parallel approvals
    pendingApprovals: [{
        role: String,
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],

    // Audit Trail & Timeline (Replaces single approvalTrail)
    history: [{
        action: { type: String, enum: ['SUBMITTED', 'APPROVED', 'REJECTED', 'ESCALATED', 'COMMENTED', 'SYSTEM_UPDATE'] },
        nodeId: String,
        performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        comment: String,
        timestamp: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('WorkflowInstance', workflowInstanceSchema);
