const ActivityLog = require('../models/ActivityLog');

/**
 * Fetch the latest 10 activities for a specific user
 * GET /api/activity/recent/:userId
 */
exports.getRecentActivity = async (req, res) => {
    try {
        const { userId } = req.params;

        // Ensure security: users can only see their own activity (unless Admin)
        if (req.user._id.toString() !== userId && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized to view this activity log' });
        }

        const activities = await ActivityLog.find({ userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('requestId', 'title status');

        res.json(activities);
    } catch (error) {
        console.error('[GET_RECENT_ACTIVITY_ERROR]', error);
        res.status(500).json({ message: 'Failed to fetch recent activity' });
    }
};

/**
 * Helper function to create an activity log entry
 * This is internally used by other controllers
 */
exports.logActivity = async ({ userId, requestId, actionType, message, actor }) => {
    try {
        const log = new ActivityLog({
            userId,
            requestId,
            actionType,
            message,
            actor
        });
        await log.save();
        return log;
    } catch (error) {
        console.error('[LOG_ACTIVITY_ERROR]', error);
    }
};
