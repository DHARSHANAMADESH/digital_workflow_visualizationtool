const mongoose = require('mongoose');
const Workflow = require('../models/Workflow');
const dotenv = require('dotenv');

dotenv.config();

const workflows = [
    {
        workflowName: 'Annual Leave Request',
        description: 'Standard workflow for requesting personal or vacation time off.',
        allowedRoles: ['Employee', 'Manager', 'Admin'],
        status: 'active',
        steps: [
            { stepName: 'Manager Approval', approverRole: 'Manager' },
            { stepName: 'HR Final Review', approverRole: 'Admin' }
        ]
    },
    {
        workflowName: 'Expense Reimbursement',
        description: 'Submit for travel, office supplies, or other business expenses.',
        allowedRoles: ['Employee', 'Manager'],
        status: 'active',
        steps: [
            { stepName: 'Department Head Review', approverRole: 'Manager' },
            { stepName: 'Finance Approval', approverRole: 'Admin' }
        ]
    },
    {
        workflowName: 'Project Access Request',
        description: 'Request permissions for restricted code repositories or servers.',
        allowedRoles: ['Employee', 'Manager'],
        status: 'active',
        steps: [
            { stepName: 'Lead Developer Review', approverRole: 'Manager' },
            { stepName: 'Security Audit', approverRole: 'Admin' }
        ]
    }
];

const seedWorkflows = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/workflowDB');
        console.log('Connected to MongoDB for seeding workflows...');

        // Clear existing workflows to avoid duplicates
        await Workflow.deleteMany({});
        console.log('Existing workflows cleared.');

        const createdWorkflows = await Workflow.insertMany(workflows);
        console.log(`Successfully seeded ${createdWorkflows.length} workflows.`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding workflows:', error);
        process.exit(1);
    }
};

seedWorkflows();
