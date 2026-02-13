const mongoose = require('mongoose');
const Request = require('../models/Request');
const Workflow = require('../models/Workflow');
const User = require('../models/User');
require('dotenv').config();

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/workflowDB');
        console.log('Connected to MongoDB for migration...');

        const requests = await Request.find();
        console.log(`Found ${requests.length} requests to check.`);

        for (const request of requests) {
            let needsSave = false;

            // 1. Fix missing currentApproverId
            if (!request.currentApproverId && request.status === 'pending') {
                const workflow = await Workflow.findById(request.workflowId);
                if (workflow && workflow.steps[request.currentStepIndex || 0]) {
                    const step = workflow.steps[request.currentStepIndex || 0];
                    const approver = await User.findOne({ role: step.approverRole });
                    if (approver) {
                        request.currentApproverId = approver._id;
                        needsSave = true;
                        console.log(`Assigned approver ${approver.name} to request ${request._id}`);
                    }
                }
            }

            // 2. Standardize currentStepIndex
            if (request.currentStepIndex === undefined) {
                request.currentStepIndex = 0;
                needsSave = true;
            }

            // 3. Ensure approvalTrail exists if it was renamed from history
            if (request.get('history') && (!request.approvalTrail || request.approvalTrail.length === 0)) {
                request.approvalTrail = request.get('history');
                needsSave = true;
                console.log(`Migrated history to approvalTrail for request ${request._id}`);
            }

            if (needsSave) {
                await request.save();
            }
        }

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
