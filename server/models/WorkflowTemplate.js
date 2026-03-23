const mongoose = require('mongoose');

const workflowTemplateSchema = new mongoose.Schema({
    workflowName: { type: String, required: true },
    description: { type: String, required: true },
    version: { type: Number, default: 1 }, // For version control of workflows
    triggerConditions: { type: mongoose.Schema.Types.Mixed }, // e.g., { department: 'IT' }
    nodes: [{
        nodeId: { type: String, required: true },
        type: { type: String, enum: ['START', 'APPROVAL', 'CONDITION', 'END'], required: true },
        title: { type: String },
        approverRoles: [{ type: String }], // Array supports parallel role approvals
        approverUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Specific users
        slaHours: { type: Number }, // Service Level Agreement timeout
        onApprove: { type: String }, // Next nodeId
        onReject: { type: String }   // Next nodeId (can route back or end)
    }],
    allowedRoles: [{ type: String, default: 'Employee' }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('WorkflowTemplate', workflowTemplateSchema);
