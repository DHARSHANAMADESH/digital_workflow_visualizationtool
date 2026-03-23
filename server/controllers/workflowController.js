const WorkflowTemplate = require('../models/WorkflowTemplate');

exports.createWorkflow = async (req, res) => {
    try {
        const { workflowName, description, nodes, allowedRoles, triggerConditions, status } = req.body;

        // Basic validation for START and END nodes
        const hasStart = nodes.some(n => n.type === 'START');
        const hasEnd = nodes.some(n => n.type === 'END');

        if (!hasStart || !hasEnd) {
            return res.status(400).json({ message: "Workflow must contain at least one START and one END node." });
        }

        const workflowTemplate = new WorkflowTemplate({
            workflowName,
            description,
            nodes,
            allowedRoles: allowedRoles || ['Employee'],
            triggerConditions,
            status,
            createdBy: req.user._id
        });

        await workflowTemplate.save();
        res.status(201).json(workflowTemplate);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getAllWorkflows = async (req, res) => {
    try {
        const workflows = await WorkflowTemplate.find().populate('createdBy', 'name email');
        res.json(workflows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAvailableWorkflows = async (req, res) => {
    try {
        const workflows = await WorkflowTemplate.find({
            status: 'active',
            allowedRoles: req.user.role
        });
        res.json(workflows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getWorkflowById = async (req, res) => {
    try {
        const workflow = await WorkflowTemplate.findById(req.params.id);
        if (!workflow) {
            return res.status(404).json({ message: "Workflow Template not found" });
        }
        res.json(workflow);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
