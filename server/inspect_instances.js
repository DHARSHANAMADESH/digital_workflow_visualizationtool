const mongoose = require('mongoose');
const WorkflowInstance = require('./models/WorkflowInstance');
require('dotenv').config();

async function inspect() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const instances = await WorkflowInstance.find();
        console.log('Total Instances:', instances.length);

        instances.forEach((inst, i) => {
            console.log(`\n--- Instance ${i + 1}: ${inst.title} ---`);
            console.log('Status:', inst.status);
            console.log('Current Node:', inst.currentNodeId);
            console.log('Pending Approvals:', JSON.stringify(inst.pendingApprovals, null, 2));
        });

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }
}

inspect();
