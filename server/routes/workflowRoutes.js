const express = require('express');
const router = express.Router();
const workflowController = require('../controllers/workflowController');

const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/', protect, authorizeRoles('Admin'), workflowController.createWorkflow);
router.get('/available', protect, workflowController.getAvailableWorkflows);
router.get('/', protect, workflowController.getAllWorkflows);
router.delete('/:id', protect, authorizeRoles('Admin'), workflowController.deleteWorkflow);

module.exports = router;
