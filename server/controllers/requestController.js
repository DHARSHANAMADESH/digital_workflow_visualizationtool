const WorkflowInstance = require('../models/WorkflowInstance');
const WorkflowTemplate = require('../models/WorkflowTemplate');
const User = require('../models/User');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

exports.submitRequest = async (req, res) => {
    try {
        const { templateId, title, description, formData } = req.body;
        const requesterId = req.user._id;

        const template = await WorkflowTemplate.findById(templateId);
        if (!template) return res.status(404).json({ message: 'Workflow Template not found' });

        const startNode = template.nodes.find(n => n.type === 'START');
        if (!startNode || !startNode.onApprove) {
            throw new Error('Invalid workflow template: Missing START node or routing');
        }

        const firstApprovalNodeId = startNode.onApprove;
        const firstApprovalNode = template.nodes.find(n => n.nodeId === firstApprovalNodeId);

        if (!firstApprovalNode) throw new Error("Next node after start not found");

        const finalTitle = title || `${template.workflowName} - ${new Date().toLocaleDateString()}`;

        // Initialize pending approvals for the first step
        const pendingApprovals = [];

        for (let role of firstApprovalNode.approverRoles || []) {
            // Find all users with this role and add to pool
            const users = await User.find({ role });
            for (let u of users) {
                pendingApprovals.push({ role, userId: u._id, status: 'pending' });
            }
        }

        for (let uid of firstApprovalNode.approverUsers || []) {
            pendingApprovals.push({ userId: uid, status: 'pending' });
        }

        const instance = new WorkflowInstance({
            templateId,
            requesterId,
            title: finalTitle,
            description,
            formData,
            status: 'pending',
            currentNodeId: firstApprovalNode.nodeId,
            pendingApprovals,
            history: [{
                action: 'SUBMITTED',
                nodeId: startNode.nodeId,
                performedBy: requesterId,
                comment: 'Initial Submission'
            }]
        });

        await instance.save();

        // Log Activity
        await ActivityLog.create({
            userId: requesterId,
            requestId: instance._id,
            actionType: 'SUBMITTED',
            message: `You submitted a new request: "${finalTitle}"`,
            actor: 'employee'
        });

        // Emit real-time activity update
        req.io.to(requesterId.toString()).emit('activity_update');

        // Create notifications
        const notificationPromises = pendingApprovals.map(async (appr) => {
            const notif = await Notification.create({
                recipientId: appr.userId,
                senderId: requesterId,
                requestId: instance._id,
                message: `New ${template.workflowName} requires your approval`,
                type: 'submission'
            });
            // Emit real-time event to the specific user room
            req.io.to(appr.userId.toString()).emit('notification_update', notif);
            return notif;
        });

        await Promise.all(notificationPromises);

        // Emit a global event for dashboard metrics
        req.io.emit('workflow_metrics_update');

        res.status(201).json(instance);
    } catch (error) {
        console.error('[SUBMIT_REQUEST_ERROR]', error.message);
        res.status(400).json({ message: error.message });
    }
};

exports.getMyRequests = async (req, res) => {
    try {
        const { status } = req.query;
        let query = { requesterId: req.user._id };
        if (status) query.status = status;

        const requests = await WorkflowInstance.find(query)
            .populate('templateId requesterId')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAssignedRequests = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;

        // Find all instances
        const instances = await WorkflowInstance.find()
            .populate('templateId requesterId')
            .sort({ createdAt: -1 });

        const filtered = instances.filter(instance => {
            if ((req.user.role || '').toLowerCase() === 'admin') return true; // Admins see all

            // Currently Pending for this user
            const isPendingForMe = instance.status === 'pending' && instance.pendingApprovals.some(pa =>
                pa.status === 'pending' && (
                    pa.userId?.toString() === userId.toString() ||
                    (pa.role && pa.role.toLowerCase() === (userRole || '').toLowerCase())
                )
            );

            // History for this user
            const hasActed = instance.history.some(h =>
                h.performedBy?.toString() === userId.toString()
            );

            return isPendingForMe || hasActed;
        });

        res.json(filtered);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getRequestById = async (req, res) => {
    try {
        const instance = await WorkflowInstance.findById(req.params.id)
            .populate('templateId requesterId history.performedBy pendingApprovals.userId');
        if (!instance) return res.status(404).json({ message: 'Request not found' });
        res.json(instance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.handleApproval = async (req, res) => {
    try {
        const { requestId, action, comment } = req.body;
        const loggedInUserId = req.user._id;

        const instance = await WorkflowInstance.findById(requestId);
        if (!instance) return res.status(404).json({ message: 'Request not found' });
        if (instance.status !== 'pending') return res.status(400).json({ message: 'Request is not pending' });

        const template = await WorkflowTemplate.findById(instance.templateId);
        const currentNode = template.nodes.find(n => n.nodeId === instance.currentNodeId);

        if (!currentNode) return res.status(500).json({ message: 'Invalid Node State' });

        // Verify user can approve
        const userRole = (req.user.role || '').toLowerCase();
        const pendingApprovalIndex = instance.pendingApprovals.findIndex(pa =>
            pa.status === 'pending' &&
            (pa.userId?.toString() === loggedInUserId.toString() ||
                (pa.role && pa.role.toLowerCase() === userRole))
        );

        if (pendingApprovalIndex === -1 && userRole !== 'admin') {
            // Check if they already approved it
            const alreadyApproved = instance.pendingApprovals.some(pa =>
                pa.status === 'approved' && pa.userId?.toString() === loggedInUserId.toString()
            );
            if (alreadyApproved) {
                return res.status(400).json({ message: 'You have already approved this step' });
            }
            return res.status(403).json({ message: 'Not authorized to approve this step' });
        }

        const normalizedAction = action.toUpperCase(); // APPROVED or REJECTED

        // Log history
        instance.history.push({
            action: normalizedAction,
            nodeId: currentNode.nodeId,
            performedBy: loggedInUserId,
            comment,
            timestamp: new Date()
        });

        if (normalizedAction === 'REJECTED') {
            instance.status = 'rejected';
            instance.pendingApprovals = [];

            // Log Activity for Rejection
            await ActivityLog.create({
                userId: instance.requesterId,
                requestId: instance._id,
                actionType: 'REJECTED',
                message: `Manager rejected your request: "${instance.title}"`,
                actor: 'manager'
            });

            // Emit real-time activity update to requester
            req.io.to(instance.requesterId.toString()).emit('activity_update');

            // Allow dynamic rejection routing if defined
            if (currentNode.onReject && currentNode.onReject !== 'END_REJECTED') {
                const rejectNode = template.nodes.find(n => n.nodeId === currentNode.onReject);
                if (rejectNode && rejectNode.type !== 'END') {
                    instance.status = 'pending'; // Re-route back
                    instance.currentNodeId = rejectNode.nodeId;

                    // Logic to populate pendingApprovals for rejectNode...
                    const newPending = [];
                    for (let role of rejectNode.approverRoles || []) {
                        const users = await User.find({ role });
                        for (let u of users) { newPending.push({ role, userId: u._id, status: 'pending' }); }
                    }
                    instance.pendingApprovals = newPending;
                }
            } else {
                instance.status = 'rejected';
                instance.currentNodeId = 'END_REJECTED';
            }
        }
        else if (normalizedAction === 'APPROVED') {
            // Update individual pending approval status
            if (pendingApprovalIndex > -1) {
                instance.pendingApprovals[pendingApprovalIndex].status = 'approved';
                instance.pendingApprovals[pendingApprovalIndex].approvedBy = loggedInUserId;
                instance.markModified('pendingApprovals'); // Explicitly mark array as modified
            } else { // Admin Override
                instance.pendingApprovals.forEach(pa => { pa.status = 'approved'; pa.approvedBy = loggedInUserId; });
                instance.markModified('pendingApprovals');
            }

            // Check if ALL required approvals for this node are met
            // Logic: Group by Role. If any user in that role approved, the role is satisfied.
            let allRolesMet = true;
            const requiredRoles = currentNode.approverRoles || [];

            for (let role of requiredRoles) {
                const roleApprovals = instance.pendingApprovals.filter(pa =>
                    pa.role && pa.role.toLowerCase() === role.toLowerCase()
                );
                if (roleApprovals.length > 0 && !roleApprovals.some(pa => pa.status === 'approved')) {
                    allRolesMet = false;
                    break;
                }
            }

            if (allRolesMet) {
                // Move to next node
                const nextNodeId = currentNode.onApprove;
                const nextNode = template.nodes.find(n => n.nodeId === nextNodeId);

                if (!nextNode || nextNode.type === 'END') {
                    instance.status = 'approved';
                    instance.currentNodeId = nextNode ? nextNode.nodeId : 'END_APPROVED';
                    instance.pendingApprovals = [];

                    // Log Activity for Completion/Approval
                    await ActivityLog.create({
                        userId: instance.requesterId,
                        requestId: instance._id,
                        actionType: 'APPROVED',
                        message: `Your request "${instance.title}" has been fully approved`,
                        actor: 'manager'
                    });

                    // Emit real-time activity update to requester
                    req.io.to(instance.requesterId.toString()).emit('activity_update');
                } else {
                    instance.currentNodeId = nextNode.nodeId;
                    // Populate new pending approvals for next step
                    const newPending = [];
                    for (let role of nextNode.approverRoles || []) {
                        const users = await User.find({ role });
                        for (let u of users) { newPending.push({ role, userId: u._id, status: 'pending' }); }
                    }
                    instance.pendingApprovals = newPending;
                }
            }
        }

        await instance.save();

        // Notify specific users or globally update
        req.io.emit('workflow_updated', { requestId: instance._id, status: instance.status });
        req.io.emit('workflow_metrics_update');

        // Notification Logic for approval/rejection goes here (similar to submit)
        // For brevity, using the general emit above to trigger frontend refetch

        res.status(200).json(instance);

    } catch (error) {
        console.error('[APPROVAL_ERROR]', error);
        res.status(500).json({ message: 'Failed to process approval action', error: error.message });
    }
};

exports.getAllRequests = async (req, res) => {
    try {
        const instances = await WorkflowInstance.find()
            .populate('templateId requesterId')
            .sort({ createdAt: -1 });

        res.json(instances);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getWorkflowMetrics = async (req, res) => {
    try {
        // Fetch all instances and populate history performers to check roles for cumulative logic
        const instances = await WorkflowInstance.find().populate('history.performedBy');

        const metrics = {
            employee_request: instances.length, // Total submissions
            manager_pending: 0,
            admin_pending: 0,
            completed: 0
        };

        instances.forEach(instance => {
            const status = (instance.status || '').toLowerCase();

            if (status === 'approved') {
                metrics.completed++;
            }

            // Cumulative Logic: Count if the request is CURRENTLY in this stage OR has PASSED this stage
            // We verify passage by checking history for role-based approval or if the overall status is approved

            // 1. Manager Stage
            const isWaitingForManager = (instance.pendingApprovals || []).some(pa =>
                pa.status === 'pending' && pa.role?.toLowerCase() === 'manager'
            );
            const hasManagerApproved = instance.history?.some(h =>
                h.action === 'APPROVED' && h.performedBy?.role?.toLowerCase() === 'manager'
            );

            if (isWaitingForManager || hasManagerApproved || status === 'approved') {
                metrics.manager_pending++;
            }

            // 2. Admin Stage
            const isWaitingForAdmin = (instance.pendingApprovals || []).some(pa =>
                pa.status === 'pending' && pa.role?.toLowerCase() === 'admin'
            );
            const hasAdminApproved = instance.history?.some(h =>
                h.action === 'APPROVED' && h.performedBy?.role?.toLowerCase() === 'admin'
            );

            if (isWaitingForAdmin || hasAdminApproved || status === 'approved') {
                metrics.admin_pending++;
            }
        });

        res.json(metrics);
    } catch (error) {
        console.error('[GET_METRICS_ERROR]', error);
        res.status(500).json({ message: 'Failed to fetch workflow metrics' });
    }
};
