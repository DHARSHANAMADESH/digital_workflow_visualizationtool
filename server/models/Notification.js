const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request' },
    message: { type: String, required: true },
    type: { type: String, enum: ['submission', 'approval', 'rejection', 'info'], default: 'info' },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
