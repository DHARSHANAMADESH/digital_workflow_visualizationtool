const Workflow = require('../models/Workflow');

exports.createWorkflow = async (req, res) => {
    try {
        const { workflowName, description, steps, allowedRoles, status } = req.body;
        const workflow = new Workflow({
            workflowName,
            description,
            steps,
            allowedRoles,
            status,
            createdBy: req.user._id
        });
        await workflow.save();
        res.status(201).json(workflow);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getAllWorkflows = async (req, res) => {
    try {
        const workflows = await Workflow.find();
        res.json(workflows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAvailableWorkflows = async (req, res) => {
    try {
        const workflows = await Workflow.find({
            status: 'active',
            allowedRoles: req.user.role
        });
        res.json(workflows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
