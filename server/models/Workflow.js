const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema({
    workflowName: { type: String, required: true },
    description: { type: String, required: true },
    steps: [{
        stepName: { type: String, required: true }, // e.g., 'HR Approval', 'Manager Approval'
        approverRole: { type: String, required: true } // e.g., 'Manager', 'Admin'
    }],
    allowedRoles: [{ type: String, default: 'Employee' }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Workflow', workflowSchema);
