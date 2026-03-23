const mongoose = require('mongoose');
const WorkflowTemplate = require('./models/WorkflowTemplate');
const WorkflowInstance = require('./models/WorkflowInstance');
const User = require('./models/User');

async function submitTestRequest() {
    await mongoose.connect('mongodb://localhost:27017/workflowDB');

    const template = await WorkflowTemplate.findOne({ workflowName: 'Annual Leave Request' });
    const employee = await User.findOne({ role: 'Employee' });

    if (!template || !employee) {
        console.log('Template or Employee not found!');
        process.exit(1);
    }

    const startNode = template.nodes.find(n => n.type === 'START');
    const nextNodeId = startNode.onApprove;

    const instance = new WorkflowInstance({
        templateId: template._id,
        requesterId: employee._id,
        title: "LEGITIMATE Annual Leave - Test 001",
        description: "This is a correctly categorized request.",
        status: 'pending',
        currentNodeId: nextNodeId,
        formData: { days: 5, reason: "Vacation" },
        history: [{
            action: 'SUBMITTED',
            nodeId: startNode.nodeId,
            performedBy: employee._id,
            comment: 'System generated test'
        }]
    });

    await instance.save();
    console.log(`Created valid request: ${instance.title} (ID: ${instance._id}) under Template: ${template.workflowName}`);

    await mongoose.disconnect();
}

submitTestRequest();
