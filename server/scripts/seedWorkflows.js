const mongoose = require('mongoose');
const WorkflowTemplate = require('../models/WorkflowTemplate');
const dotenv = require('dotenv');

dotenv.config();

const workflows = [
    {
        workflowName: 'Annual Leave Request',
        description: 'Standard workflow for requesting personal or vacation time off.',
        allowedRoles: ['Employee', 'Manager', 'Admin'],
        status: 'active',
        nodes: [
            {
                nodeId: 'START_NODE',
                type: 'START',
                title: 'Submission',
                onApprove: 'MANAGER_REVIEW'
            },
            {
                nodeId: 'MANAGER_REVIEW',
                type: 'APPROVAL',
                title: 'Manager Approval',
                approverRoles: ['Manager'], // Any manager can approve
                onApprove: 'ADMIN_REVIEW',
                onReject: 'END_REJECTED'
            },
            {
                nodeId: 'ADMIN_REVIEW',
                type: 'APPROVAL',
                title: 'Admin Final Review',
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
        workflowName: 'High-Value Expense Reimbursement',
        description: 'Requires sequential approval from Manager and Admin.',
        allowedRoles: ['Employee', 'Manager'],
        status: 'active',
        nodes: [
            {
                nodeId: 'START_NODE',
                type: 'START',
                title: 'Submission',
                onApprove: 'MANAGER_REVIEW'
            },
            {
                nodeId: 'MANAGER_REVIEW',
                type: 'APPROVAL',
                title: 'Manager Approval',
                approverRoles: ['Manager'],
                onApprove: 'ADMIN_REVIEW',
                onReject: 'END_REJECTED'
            },
            {
                nodeId: 'ADMIN_REVIEW',
                type: 'APPROVAL',
                title: 'Admin Final Review',
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

const seedWorkflows = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/workflowDB');
        console.log('Connected to MongoDB for seeding DAG workflows...');

        // Clear existing templates to avoid duplicates
        await WorkflowTemplate.deleteMany({});
        console.log('Existing workflow templates cleared.');

        const createdTemplates = await WorkflowTemplate.insertMany(workflows);
        console.log(`Successfully seeded ${createdTemplates.length} DAG workflow templates.`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding workflows:', error);
        process.exit(1);
    }
};

seedWorkflows();
