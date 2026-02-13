const Request = require('../models/Request');
const Workflow = require('../models/Workflow');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.submitRequest = async (req, res) => {
    try {
        const { workflowId, title, description, formData } = req.body;
        const requesterId = req.user._id;

        // Find workflow
        const workflow = await Workflow.findById(workflowId);
        if (!workflow) return res.status(404).json({ message: 'Workflow not found' });

        const firstStep = workflow.steps[0];
        if (!firstStep) throw new Error('Workflow has no steps defined');

        // Find approver for the first step
        const approver = await User.findOne({ role: firstStep.approverRole });

        // DEBUG CHECK (MANDATORY)
        console.log(`[SUBMIT_REQUEST] Workflow: ${workflowId}, Assigned Manager: ${approver?._id || 'NULL'}, Step: 0`);

        if (!approver) {
            throw new Error(`No user found with approver role: ${firstStep.approverRole}`);
        }

        const finalTitle = title || `${workflow.workflowName} - ${new Date().toLocaleDateString()}`;

        const request = new Request({
            workflowId,
            requesterId,
            title: finalTitle,
            description,
            formData,
            currentStepIndex: 0,
            currentApproverId: approver._id,
            status: 'pending'
        });

        await request.save();

        // Create notifications for ALL users with that role
        const eligibleApprovers = await User.find({ role: firstStep.approverRole });

        await Promise.all(eligibleApprovers.map(appr =>
            Notification.create({
                recipientId: appr._id,
                senderId: requesterId,
                requestId: request._id,
                message: `New ${workflow.workflowName} submission from ${req.user.name}`,
                type: 'submission'
            })
        ));

        res.status(201).json(request);
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

        const requests = await Request.find(query)
            .populate('workflowId requesterId currentApproverId')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAssignedRequests = async (req, res) => {
    try {
        // Find all requests where:
        // 1. Status is pending
        // AND
        // 2. Either explicitly assigned to this user
        // OR
        // 3. The current step's required role matches the user's role (Pool Approval)

        const requests = await Request.find({ status: 'pending' })
            .populate('workflowId requesterId')
            .sort({ createdAt: -1 });

        // Filter based on role or explicit ID
        // This ensures that even if currentApproverId is old/wrong, the ROLE check works
        const filteredRequests = requests.filter(reqDoc => {
            const isExplicitApprover = reqDoc.currentApproverId?.toString() === req.user._id.toString();

            const currentStep = reqDoc.workflowId?.steps[reqDoc.currentStepIndex];
            const hasCorrectRole = currentStep && currentStep.approverRole === req.user.role;

            return isExplicitApprover || hasCorrectRole || req.user.role === 'Admin';
        });

        res.json(filteredRequests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getRequestById = async (req, res) => {
    try {
        const request = await Request.findById(req.params.id)
            .populate('workflowId requesterId currentApproverId approvalTrail.performedBy');
        if (!request) return res.status(404).json({ message: 'Request not found' });
        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.handleApproval = async (req, res) => {
    try {
        const { requestId, action, comment } = req.body;
        const loggedInUserId = req.user._id;

        // 1. VALIDATION FIX
        const request = await Request.findById(requestId).populate('workflowId');
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }
        if (!request.workflowId) {
            return res.status(400).json({ message: 'Request workflow data is missing. This request may be invalid.' });
        }
        if (request.status !== 'pending') {
            return res.status(400).json({ message: 'Request is no longer pending' });
        }

        // 2. AUTHORIZATION CHECK (Role-based / Pool Approval)
        const currentStep = request.workflowId?.steps[request.currentStepIndex];
        const isExplicitApprover = request.currentApproverId?.toString() === loggedInUserId.toString();
        const hasCorrectRole = currentStep && currentStep.approverRole === req.user.role;
        const isAdmin = req.user.role === 'Admin';

        if (!isExplicitApprover && !hasCorrectRole && !isAdmin) {
            const expected = currentStep?.approverRole || 'Unknown Role';
            console.error(`[AUTH_FAILURE] Request: ${requestId}, Expected Role: ${expected}, User Role: ${req.user.role}`);
            return res.status(403).json({
                message: `Authorization Failed: This step requires the '${expected}' role. Your role is '${req.user.role}'.`
            });
        }

        // 3. APPROVAL LOGIC
        const normalizedAction = action.toLowerCase();

        if (normalizedAction === 'approved') {
            request.approvalTrail.push({
                stepName: currentStep.stepName,
                action: 'approved',
                performedBy: loggedInUserId,
                comment,
                timestamp: new Date()
            });

            // 4. NEXT STEP HANDLING
            if (request.currentStepIndex < request.workflowId.steps.length - 1) {
                const nextStepIndex = request.currentStepIndex + 1;
                const nextStep = request.workflowId.steps[nextStepIndex];

                // Find user with required role
                const nextApprover = await User.findOne({ role: nextStep.approverRole });

                // If no specific user found, we still move index, currentApproverId becomes null (Pool Approval)
                request.currentStepIndex = nextStepIndex;
                request.currentApproverId = nextApprover ? nextApprover._id : null;
                request.status = 'pending';

                if (!nextApprover) {
                    console.log(`[WARNING] No specific user found for next role '${nextStep.approverRole}'. Request moved to role pool.`);
                }
            } else {
                // Final Step Reached
                request.status = 'approved';
                request.currentApproverId = null;
            }
        } else if (normalizedAction === 'rejected') {
            // Handle rejection (standard logic preserved)
            request.approvalTrail.push({
                stepName: currentStep.stepName,
                action: 'rejected',
                performedBy: loggedInUserId,
                comment,
                timestamp: new Date()
            });
            request.status = 'rejected';
            request.currentApproverId = null;
        }

        // 5. SAVE & RETURN
        await request.save();

        // 6. NOTIFICATION TRIGGER
        if (normalizedAction === 'approved') {
            if (request.status === 'approved') {
                // Final Approval - Notify Requester
                await Notification.create({
                    recipientId: request.requesterId,
                    senderId: loggedInUserId,
                    requestId: request._id,
                    message: `Your request "${request.title}" was fully approved!`,
                    type: 'approval'
                });
            } else {
                // Moved to next step - Notify all potential approvers for next step
                const nextStep = request.workflowId.steps[request.currentStepIndex];
                const nextEligibleApprovers = await User.find({ role: nextStep.approverRole });

                await Promise.all(nextEligibleApprovers.map(appr =>
                    Notification.create({
                        recipientId: appr._id,
                        senderId: loggedInUserId,
                        requestId: request._id,
                        message: `Request "${request.title}" was approved by ${req.user.name} and requires your review.`,
                        type: 'approval'
                    })
                ));

                // Also Notify Requester of progress
                await Notification.create({
                    recipientId: request.requesterId,
                    senderId: loggedInUserId,
                    requestId: request._id,
                    message: `Your request "${request.title}" has moved to step: ${nextStep.stepName}.`,
                    type: 'approval'
                });
            }
        } else if (normalizedAction === 'rejected') {
            // Rejection - Notify Requester
            await Notification.create({
                recipientId: request.requesterId,
                senderId: loggedInUserId,
                requestId: request._id,
                message: `Your request "${request.title}" was rejected by ${req.user.name}.`,
                type: 'rejection'
            });
        }

        res.status(200).json(request);

    } catch (error) {
        // 6. ERROR LOGGING (MANDATORY)
        console.error(`[APPROVAL_ERROR] RequestID: ${req.body.requestId}, ApproverID: ${req.user?._id}, CurrentStep: ${req.body.currentStepIndex || 'UNKNOWN'}`);
        console.error('Error Stack:', error);
        res.status(500).json({ message: 'Failed to process approval action', error: error.message });
    }
};

exports.getAllRequests = async (req, res) => {
    try {
        const requests = await Request.find().populate('workflowId requesterId currentApproverId');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
