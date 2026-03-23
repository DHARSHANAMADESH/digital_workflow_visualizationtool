const mongoose = require('mongoose');
const WorkflowTemplate = require('./models/WorkflowTemplate');
const WorkflowInstance = require('./models/WorkflowInstance');

async function fixData() {
    await mongoose.connect('mongodb://localhost:27017/workflowDB');

    const template = await WorkflowTemplate.findOne({ workflowName: 'Annual Leave Request' });
    if (!template) {
        console.log('Annual Leave Request template not found!');
        process.exit(1);
    }

    const currentTemplates = await WorkflowTemplate.find();
    const currentTemplateIds = currentTemplates.map(t => t._id.toString());

    const instances = await WorkflowInstance.find();
    console.log(`Found ${instances.length} total instances.`);

    let updatedCount = 0;
    for (let instance of instances) {
        const tId = instance.templateId ? instance.templateId.toString() : null;
        console.log(`Checking instance: "${instance.title}", templateId: ${tId}`);

        if (!tId || !currentTemplateIds.includes(tId)) {
            console.log(`-> Instance "${instance.title}" has broken/missing template link. Fixing...`);
            instance.templateId = template._id;
            await instance.save();
            updatedCount++;
            console.log(`-> Updated "${instance.title}"`);
        }
    }

    console.log(`Successfully fixed ${updatedCount} instances.`);

    await mongoose.disconnect();
}

fixData();
