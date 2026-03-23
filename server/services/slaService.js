const cron = require('node-cron');
const WorkflowInstance = require('../models/WorkflowInstance');
const Notification = require('../models/Notification'); // Assuming a Notification model exists or will exist

// Run every hour at minute 0
cron.schedule('0 * * * *', async () => {
    console.log('[SLA Monitor] Starting SLA breach check...');
    try {
        const now = new Date();

        // 1. Find workflows that are still pending
        const pendingWorkflows = await WorkflowInstance.find({ status: 'pending' }).populate('templateId');

        for (const wf of pendingWorkflows) {
            // Get the current node configuration
            const currentNode = wf.templateId.nodes.find(n => n.nodeId === wf.currentNodeId);

            // 2. Check if the SLA has a timeout defined and if the SLA is breached
            if (currentNode && currentNode.slaParams?.timeoutHours) {
                // Determine when the node was entered. 
                // We'll look at the history for the LAST time this node was entered, or the workflow creation time if it's the first node
                // If history is empty, fall back to creation time
                let nodeEntryTime = wf.createdAt;

                // Simple heuristic: find the latest history entry that is *not* for the current node, meaning we *just* transitioned to the current node
                // Or just the last update time if we don't track node entry explicitly yet
                if (wf.history && wf.history.length > 0) {
                    nodeEntryTime = wf.history[wf.history.length - 1].timestamp;
                }

                const elapsedHours = (now - new Date(nodeEntryTime)) / (1000 * 60 * 60);

                if (elapsedHours > currentNode.slaParams.timeoutHours) {
                    console.log(`[SLA Monitor] Breach detected for Workflow ${wf._id} at Node ${currentNode.nodeId}`);

                    // 3. Handle Escalate / Auto-Reject based on slaParams structure
                    // For now, let's create a notification and mark a flag (if we had one) or auto-reject if instructed

                    if (currentNode.slaParams?.autoReject) {
                        wf.status = 'rejected';
                        wf.history.push({
                            nodeId: wf.currentNodeId,
                            action: 'SLA_AUTO_REJECT',
                            userId: null,
                            comment: `Auto-rejected due to SLA breach (${currentNode.slaParams.timeoutHours}h timeout).`,
                            timestamp: new Date()
                        });
                        await wf.save();
                        console.log(`[SLA Monitor] Auto-rejected Workflow ${wf._id}`);
                    } else if (currentNode.slaParams?.escalateToRole) {
                        // Logic to escalate
                        console.log(`[SLA Monitor] Escalating Workflow ${wf._id} to role: ${currentNode.slaParams.escalateToRole}`);

                        // Create notification for escalation role
                        const notif = new Notification({
                            userId: null, // Broadcast to role, might need role-based notification schema adjustment
                            role: currentNode.slaParams.escalateToRole,
                            message: `SLA Breach: Workflow ${wf.title} is stalled at phase ${currentNode.title}. Escalated to ${currentNode.slaParams.escalateToRole}.`,
                            type: 'SLA_BREACH',
                            requestId: wf._id
                        });
                        await notif.save();
                    }
                }
            }
        }
    } catch (error) {
        console.error('[SLA Monitor] Error during SLA check:', error);
    }
});

console.log('[SLA Monitor] Cron job initialized.');
