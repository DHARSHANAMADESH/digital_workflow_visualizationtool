const mongoose = require('mongoose');
const WorkflowTemplate = require('./models/WorkflowTemplate');
const WorkflowInstance = require('./models/WorkflowInstance');

async function debugData() {
    await mongoose.connect('mongodb://localhost:27017/workflowDB');

    console.log('--- WORKFLOW TEMPLATES ---');
    const templates = await WorkflowTemplate.find();
    templates.forEach(t => {
        console.log(`Template: ${t.workflowName}, ID: ${t._id}`);
    });

    console.log('\n--- WORKFLOW INSTANCES ---');
    const instances = await WorkflowInstance.find().populate('templateId');
    instances.forEach(i => {
        const obj = i.toObject();
        console.log(`Instance Title: ${i.title}`);
        console.log(`Instance Status: ${i.status}`);
        console.log(`Instance templateId: ${obj.templateId?._id || obj.templateId}`);
        console.log(`Instance workflowId: ${obj.workflowId?._id || obj.workflowId}`);
        console.log('---');
    });

    await mongoose.disconnect();
}

debugData();
