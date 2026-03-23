const mongoose = require('mongoose');
const WorkflowTemplate = require('../models/WorkflowTemplate');
const dotenv = require('dotenv');

dotenv.config();

const managerWorkflows = [
    {
        workflowName: 'Software / System Access Request',
        description: 'Request access to software tools or internal systems for managers or team members.',
        allowedRoles: ['Manager', 'Admin'],
        status: 'active',
        nodes: [
            {
                nodeId: 'START_NODE',
                type: 'START',
                title: 'Submission',
                onApprove: 'ADMIN_APPROVAL'
            },
            {
                nodeId: 'ADMIN_APPROVAL',
                type: 'APPROVAL',
                title: 'Admin Authorization',
                approverRoles: ['Admin'],
                onApprove: 'END_APPROVED',
                onReject: 'END_REJECTED'
            },
            {
                nodeId: 'END_APPROVED',
                type: 'END',
                title: 'Approved'
            },
            {
                nodeId: 'END_REJECTED',
                type: 'END',
                title: 'Rejected'
            }
        ]
    },
    {
        workflowName: 'Data / Report Request',
        description: 'Request specific reports or datasets from the admin.',
        allowedRoles: ['Manager', 'Admin'],
        status: 'active',
        nodes: [
            {
                nodeId: 'START_NODE',
                type: 'START',
                title: 'Submission',
                onApprove: 'ADMIN_APPROVAL'
            },
            {
                nodeId: 'ADMIN_APPROVAL',
                type: 'APPROVAL',
                title: 'Report Preparation',
                approverRoles: ['Admin'],
                onApprove: 'END_APPROVED',
                onReject: 'END_REJECTED'
            },
            {
                nodeId: 'END_APPROVED',
                type: 'END',
                title: 'Approved'
            },
            {
                nodeId: 'END_REJECTED',
                type: 'END',
                title: 'Rejected'
            }
        ]
    },
    {
        workflowName: 'System Issue / Support Request',
        description: 'Report system problems or request technical support.',
        allowedRoles: ['Manager', 'Admin'],
        status: 'active',
        nodes: [
            {
                nodeId: 'START_NODE',
                type: 'START',
                title: 'Submission',
                onApprove: 'ADMIN_SUPPORT'
            },
            {
                nodeId: 'ADMIN_SUPPORT',
                type: 'APPROVAL',
                title: 'Support Review',
                approverRoles: ['Admin'],
                onApprove: 'END_APPROVED',
                onReject: 'END_REJECTED'
            },
            {
                nodeId: 'END_APPROVED',
                type: 'END',
                title: 'Approved'
            },
            {
                nodeId: 'END_REJECTED',
                type: 'END',
                title: 'Rejected'
            }
        ]
    }
];

const seedManagerWorkflows = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/workflowDB');
        console.log('Connected to MongoDB for seeding Manager-to-Admin workflows...');

        for (const wf of managerWorkflows) {
            await WorkflowTemplate.findOneAndUpdate(
                { workflowName: wf.workflowName },
                wf,
                { upsert: true, new: true }
            );
            console.log(`Seeded/Updated workflow: ${wf.workflowName}`);
        }

        console.log('Manager-to-Admin workflows seeded successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding workflows:', error);
        process.exit(1);
    }
};

seedManagerWorkflows();
