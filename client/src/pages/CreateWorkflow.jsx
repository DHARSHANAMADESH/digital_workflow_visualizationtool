import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Save, ArrowRight, Activity, Settings } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { workflowService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const CreateWorkflow = () => {
    const navigate = useNavigate();
    const [workflowName, setWorkflowName] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('active');
    const [allowedRoles, setAllowedRoles] = useState(['Employee']);
    const [steps, setSteps] = useState([
        { stepName: 'Initial Review', approverRole: 'Manager' }
    ]);

    const handleRoleToggle = (role) => {
        if (allowedRoles.includes(role)) {
            setAllowedRoles(allowedRoles.filter(r => r !== role));
        } else {
            setAllowedRoles([...allowedRoles, role]);
        }
    };

    const addStep = () => {
        setSteps([...steps, { stepName: '', approverRole: 'Manager' }]);
    };

    const removeStep = (index) => {
        setSteps(steps.filter((_, i) => i !== index));
    };

    const updateStep = (index, field, value) => {
        const newSteps = [...steps];
        newSteps[index][field] = value;
        setSteps(newSteps);
    };

    const handleSave = async () => {
        if (!workflowName.trim()) return toast.error('Workflow name is required');
        if (!description.trim()) return toast.error('Description is required');
        if (steps.some(s => !s.stepName.trim())) return toast.error('All steps must have a name');
        if (allowedRoles.length === 0) return toast.error('At least one role must be allowed');

        try {
            await workflowService.create({
                workflowName,
                description,
                steps,
                allowedRoles,
                status
            });
            toast.success('Enterprise workflow created successfully!');
            navigate('/admin/dashboard');
        } catch (error) {
            toast.error('Failed to create workflow');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-4xl mx-auto space-y-8"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1>Create Enterprise Workflow</h1>
                    <p className="text-gray-400">Design dynamic approval paths for your organization.</p>
                </div>
                <button onClick={handleSave} className="btn-primary flex items-center space-x-2 w-full md:w-auto justify-center">
                    <Save className="h-5 w-5" />
                    <span>Save Workflow</span>
                </button>
            </div>

            <div className="glass-card p-8 space-y-8">
                {/* Configuration Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Workflow Name</label>
                            <input
                                type="text"
                                value={workflowName}
                                onChange={(e) => setWorkflowName(e.target.value)}
                                placeholder="e.g., Expense Reimbursement"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-violet-500 text-lg font-semibold"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Explain the purpose of this workflow..."
                                rows="3"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-violet-500 text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-3">Allowed Roles</label>
                            <div className="flex flex-wrap gap-2">
                                {['Employee', 'Manager', 'Admin'].map(role => (
                                    <button
                                        key={role}
                                        onClick={() => handleRoleToggle(role)}
                                        className={`px-4 py-2 rounded-lg text-sm border transition-all ${allowedRoles.includes(role)
                                            ? 'bg-violet-500/20 border-violet-500 text-violet-400'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                            }`}
                                    >
                                        {role}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-3">Workflow Status</label>
                            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-fit">
                                {['active', 'inactive'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setStatus(s)}
                                        className={`px-6 py-2 rounded-lg text-sm capitalize transition-all ${status === s
                                            ? 'bg-violet-500 text-white shadow-lg'
                                            : 'text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Steps Section */}
                <div className="border-t border-white/10 pt-8 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold flex items-center space-x-2">
                            <Activity className="h-5 w-5 text-violet-400" />
                            <span>Approval Steps</span>
                        </h3>
                        <button
                            onClick={addStep}
                            className="px-4 py-2 bg-violet-500/10 text-violet-400 rounded-lg text-sm border border-violet-500/20 hover:bg-violet-500/20 transition-all flex items-center space-x-2"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Add Step</span>
                        </button>
                    </div>

                    <div className="space-y-4">
                        {steps.map((step, index) => (
                            <div key={index} className="flex items-start space-x-4 p-4 bg-white/5 rounded-xl border border-white/10 relative">
                                <div className="h-8 w-8 rounded-full bg-violet-500/20 flex items-center justify-center font-bold text-violet-400 flex-shrink-0">
                                    {index + 1}
                                </div>

                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        value={step.stepName}
                                        onChange={(e) => updateStep(index, 'stepName', e.target.value)}
                                        placeholder="Step name (e.g., HR Review)"
                                        className="bg-black/20 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-violet-500"
                                    />
                                    <select
                                        value={step.approverRole}
                                        onChange={(e) => updateStep(index, 'approverRole', e.target.value)}
                                        className="bg-black/20 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-violet-500 appearance-none"
                                    >
                                        <option value="Manager">Approver: Manager</option>
                                        <option value="Admin">Approver: Admin</option>
                                        <option value="Employee">Approver: Employee</option>
                                    </select>
                                </div>

                                <button
                                    onClick={() => removeStep(index)}
                                    className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                                    disabled={steps.length === 1}
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Preview Section */}
            <div className="glass-card p-6 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 border-violet-500/20">
                <h4 className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-4 flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Visual Path Preview</span>
                </h4>
                <div className="flex items-center space-x-3 overflow-x-auto pb-2">
                    {steps.map((step, i) => (
                        <React.Fragment key={i}>
                            <div className="flex-none px-6 py-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md">
                                <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-tighter mb-1">Step {i + 1}</span>
                                <span className="font-semibold text-white">{step.stepName || 'Untitled Step'}</span>
                                <span className="text-[10px] text-violet-400 block mt-1">{step.approverRole}</span>
                            </div>
                            {i < steps.length - 1 && <ArrowRight className="h-4 w-4 text-white/20 flex-none" />}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default CreateWorkflow;
