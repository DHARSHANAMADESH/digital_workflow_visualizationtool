const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional for role-wide broadcasts
    role: { type: String }, // Target role if recipientId is null
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkflowInstance' },
    message: { type: String, required: true },
    type: { type: String, enum: ['submission', 'approval', 'rejection', 'info', 'SLA_BREACH', 'SLA_AUTO_REJECT'], default: 'info' },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
