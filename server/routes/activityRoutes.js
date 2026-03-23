const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route GET /api/activity/recent/:userId
 * @desc Get the 10 most recent activity logs for a user
 * @access Private
 */
router.get('/recent/:userId', protect, activityController.getRecentActivity);

module.exports = router;
