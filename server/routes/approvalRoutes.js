const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/assigned-to-me', protect, authorizeRoles('Manager', 'Admin', 'IT', 'Finance'), requestController.getAssignedRequests);
router.get('/requests', protect, authorizeRoles('Manager', 'Admin', 'IT', 'Finance'), requestController.getAllRequests);

module.exports = router;
