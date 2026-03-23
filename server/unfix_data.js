const mongoose = require('mongoose');
const WorkflowInstance = require('./models/WorkflowInstance');

async function unfixData() {
    await mongoose.connect('mongodb://localhost:27017/workflowDB');

    const requestsToUnfix = [
        { title: "Digital Workflow visualization Tool", originalId: "69a11c7e4ae21f13f9d6c710" },
        { title: "hh", originalId: "69a11c7e4ae21f13f9d6c710" },
        { title: "dfd", originalId: "69a11c7e4ae21f13f9d6c716" }
    ];

    let updatedCount = 0;
    for (let item of requestsToUnfix) {
        const result = await WorkflowInstance.updateOne(
            { title: item.title, templateId: "69ad5f3d0c51541009d3ba2f" }, // Only if currently mapped to Annual Leave
            { $set: { templateId: new mongoose.Types.ObjectId(item.originalId) } }
        );
        if (result.modifiedCount > 0) {
            console.log(`-> Reverted "${item.title}" to original legacy templateId.`);
            updatedCount++;
        }
    }

    console.log(`Successfully unfixed ${updatedCount} instances.`);
    await mongoose.disconnect();
}

unfixData();
