const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');

const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/', protect, requestController.submitRequest);
router.get('/my', protect, requestController.getMyRequests);
router.get('/:id', protect, requestController.getRequestById);
router.post('/approve', protect, authorizeRoles('Manager', 'Admin'), requestController.handleApproval);
router.get('/', protect, authorizeRoles('Manager', 'Admin'), requestController.getAllRequests);

module.exports = router;
