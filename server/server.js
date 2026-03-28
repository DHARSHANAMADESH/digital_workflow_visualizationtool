require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); // Needed for Socket.io
const { Server } = require('socket.io');

const workflowRoutes = require('./routes/workflowRoutes');
const requestRoutes = require('./routes/requestRoutes');
const authRoutes = require('./routes/authRoutes');
const approvalRoutes = require('./routes/approvalRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const activityRoutes = require('./routes/activityRoutes');
require('./services/slaService'); // Start Background Jobs

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Define allowed origins
const allowedOrigins = process.env.CLIENT_URL || ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'];

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST']
    }
});

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Pass io to routes via middleware
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Socket.io Connection Logic
io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Users can join a room based on their User ID to receive personal notifications
    socket.on('join', (userId) => {
        if (userId) {
            socket.join(userId);
            console.log(`[Socket.io] User ${userId} joined room`);
        }
    });

    socket.on('disconnect', () => {
        console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
});

// Multi-method Logging
app.use((req, res, next) => {
    console.log(`>>> ${new Date().toLocaleTimeString()} | ${req.method} ${req.url}`);
    if (req.method !== 'GET') console.log('Payload:', JSON.stringify(req.body, null, 2));
    next();
});

// Health Check
app.get('/health', (req, res) => res.json({ status: 'OK', time: new Date().toISOString() }));

// Routes
app.use('/api/workflows', workflowRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/manager', approvalRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activity', activityRoutes);

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/workflowDB')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Start server using HTTP server instead of Express app directly
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server & WebSocket running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});
