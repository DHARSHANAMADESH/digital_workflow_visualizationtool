import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, User, ShieldCheck, Settings, CheckCircle2, ChevronRight, Plus, Check, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { workflowService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const CreateWorkflow = ({ onSave }) => {
    const navigate = useNavigate();
    const [workflowName, setWorkflowName] = useState('');
    const [description, setDescription] = useState('');
    const [allowedRoles, setAllowedRoles] = useState(['Employee', 'Manager', 'Admin', 'Finance', 'IT']);

    // We keep a default status and nodes internally to send to the backend, 
    // even though it isn't shown heavily in the new UI per the mockup.
    const [status] = useState('active');

    // The steps array based on the mockup. Starts with Employee Request, Manager Approval, Admin Approval
    const [steps, setSteps] = useState([
        { id: 1, name: 'Employee Request', role: 'Employee', type: 'start', color: 'bg-primary/20', icon: User },
        { id: 2, name: 'Manage Approval', role: 'Manager', type: 'approval', color: 'bg-orange-500', icon: User },
        { id: 3, name: 'Admin Approval', role: 'Admin', type: 'approval', color: 'bg-primary', icon: ShieldCheck },
    ]);

    const handleRoleToggle = (role) => {
        if (allowedRoles.includes(role)) {
            // Ensure at least one role remains if they try to unselect all
            if (allowedRoles.length > 1) {
                setAllowedRoles(allowedRoles.filter(r => r !== role));
            } else {
                toast.error('At least one role must be allowed');
            }
        } else {
            setAllowedRoles([...allowedRoles, role]);
        }
    };

    const addStep = () => {
        const newId = steps.length > 0 ? Math.max(...steps.map(s => s.id)) + 1 : 1;
        setSteps([
            ...steps,
            { id: newId, name: 'New Approval Step', role: 'Manager', type: 'approval', color: 'bg-blue-400', icon: User }
        ]);
    };

    const updateStep = (id, field, value) => {
        setSteps(steps.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const moveStep = (index, direction) => {
        if (index + direction < 0 || index + direction >= steps.length) return;
        const newSteps = [...steps];
        const temp = newSteps[index];
        newSteps[index] = newSteps[index + direction];
        newSteps[index + direction] = temp;
        setSteps(newSteps);
    };

    const removeStep = (id) => {
        if (steps.length <= 1) return toast.error('Workflow must have at least one step.');
        setSteps(steps.filter(s => s.id !== id));
    };

    const handleSave = async () => {
        if (!workflowName.trim()) return toast.error('Workflow name is required');
        if (!description.trim()) return toast.error('Description is required');

        try {
            const nodes = [];

            // Convert UI steps to backend node format
            steps.forEach((step, idx) => {
                nodes.push({
                    nodeId: `NODE_${idx}`,
                    type: idx === 0 ? 'START' : 'APPROVAL',
                    title: step.name,
                    // If it's a start node, anyone in allowedRoles can start.
                    // If it's an approval node, use the specific role assigned.
                    approverRoles: idx === 0 ? allowedRoles : [step.role],
                    onApprove: idx < steps.length - 1 ? `NODE_${idx + 1}` : 'END_APPROVED',
                    onReject: 'END_REJECTED'
                });
            });

            // Always add the end nodes
            nodes.push({ nodeId: 'END_APPROVED', type: 'END', title: 'Approved' });
            nodes.push({ nodeId: 'END_REJECTED', type: 'END', title: 'Rejected' });

            await workflowService.create({
                workflowName,
                description,
                nodes,
                allowedRoles,
                status
            });
            toast.success('Workflow saved successfully!');
            
            if (onSave) {
                onSave();
                setWorkflowName('');
                setDescription('');
                setSteps([
                    { id: 1, name: 'Employee Request', role: 'Employee', type: 'start', color: 'bg-primary/20', icon: User },
                    { id: 2, name: 'Manage Approval', role: 'Manager', type: 'approval', color: 'bg-orange-500', icon: User },
                    { id: 3, name: 'Admin Approval', role: 'Admin', type: 'approval', color: 'bg-primary', icon: ShieldCheck },
                ]);
                setAllowedRoles(['Employee', 'Manager', 'Admin', 'Finance', 'IT']);
            } else {
                navigate('/admin/dashboard');
            }
        } catch (error) {
            toast.error('Failed to create workflow');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">

            {/* Top Bar matching the mockup background */}
            <div className="max-w-[1000px] mx-auto flex items-center justify-between mb-8">
                <div className="relative w-64 md:w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search workflows, requests..."
                        className="w-full pl-9 pr-4 py-2 bg-white/50 border border-border rounded-lg text-sm text-content-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors shadow-sm"
                    >
                        Save Workflow
                    </button>
                </div>
            </div>

            {/* Main Content Card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-[1000px] mx-auto bg-white rounded-3xl shadow-sm border border-border overflow-hidden"
            >
                <div className="p-8 md:p-10">
                    <h1 className="text-2xl font-bold text-gray-800 mb-8">Create Workflow</h1>

                    {/* Workflow Details Section */}
                    <div className="bg-gray-50 rounded-2xl p-6 mb-10 border border-border">
                        <h2 className="text-[15px] font-semibold text-gray-700 mb-6 font-medium">Workflow Details</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm text-content-secondary mb-2">Workflow Name</label>
                                <input
                                    type="text"
                                    value={workflowName}
                                    onChange={(e) => setWorkflowName(e.target.value)}
                                    placeholder="Enter workflow name"
                                    className="w-full bg-white border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-shadow text-content-primary font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-content-secondary mb-2">Description</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Enter workflow description..."
                                    className="w-full bg-white border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-shadow text-content-primary font-bold"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-content-secondary mb-3">Allowed Roles</label>
                            <div className="flex flex-wrap gap-3">
                                {[
                                    { id: 'Employee', icon: User, color: 'text-primary' },
                                    { id: 'Manager', icon: User, color: 'text-content-secondary' },
                                    { id: 'Admin', icon: User, color: 'text-content-secondary' },
                                    { id: 'Finance', icon: User, color: 'text-content-secondary' },
                                    { id: 'IT', icon: User, color: 'text-content-secondary' }
                                ].map((role) => (
                                    <button
                                        key={role.id}
                                        onClick={() => handleRoleToggle(role.id)}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm transition-all border ${allowedRoles.includes(role.id)
                                                ? 'bg-background border-primary/20 text-content-primary'
                                                : 'bg-white border-border text-content-secondary hover:bg-gray-50'
                                            }`}
                                    >
                                        <role.icon className={`h-4 w-4 ${allowedRoles.includes(role.id) ? 'text-primary' : 'text-gray-400'}`} />
                                        <span className="font-medium">{role.id}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Workflow Pipeline Section */}
                    <div className="mb-4">
                        <div className="flex items-center mb-6">
                            <h2 className="text-[18px] font-semibold text-gray-800 pr-4">Workflow Pipeline</h2>
                            <div className="h-px bg-gray-100 flex-grow"></div>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-6 border border-border">
                            <div className="flex flex-wrap items-stretch justify-start gap-4 overflow-x-auto pb-6">

                                {steps.map((step, index) => (
                                    <React.Fragment key={step.id}>
                                        <div className="flex flex-col mb-4">
                                            <span className="text-xs text-content-secondary font-medium mb-2 uppercase tracking-wide">Step {index + 1}</span>
                                            <div className="w-64 bg-gray-100 border border-border/60 rounded-xl p-4 flex flex-col justify-between h-full relative z-10 group overflow-hidden">
                                                <div className="flex items-center space-x-3 mb-4">
                                                    <div className={`shrink-0 h-8 w-8 rounded-lg flex items-center justify-center text-white ${step.color}`}>
                                                        <step.icon className="h-4 w-4" />
                                                    </div>
                                                    <input 
                                                        value={step.name}
                                                        onChange={(e) => updateStep(step.id, 'name', e.target.value)}
                                                        className="font-bold text-content-primary bg-transparent outline-none w-full border-b border-transparent hover:border-border focus:border-primary transition-colors pb-1 text-sm placeholder:text-content-secondary/40"
                                                    />
                                                </div>
                                                <div className="text-xs text-content-secondary flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        Role: 
                                                        <select
                                                            value={step.role}
                                                            onChange={(e) => updateStep(step.id, 'role', e.target.value)}
                                                            className="ml-2 font-medium bg-transparent outline-none cursor-pointer text-gray-700 hover:text-primary transition-colors"
                                                        >
                                                            {['Employee', 'Manager', 'Finance', 'IT', 'Admin'].map(r => (
                                                                <option key={r} value={r}>{r}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-100 flex items-center space-x-1 pl-2">
                                                    <button onClick={() => moveStep(index, -1)} disabled={index === 0} className="p-1 text-content-secondary/40 hover:text-primary disabled:opacity-30 disabled:hover:text-content-secondary/40 transition-colors">
                                                        <ArrowUp className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button onClick={() => moveStep(index, 1)} disabled={index === steps.length - 1} className="p-1 text-content-secondary/40 hover:text-primary disabled:opacity-30 disabled:hover:text-content-secondary/40 transition-colors">
                                                        <ArrowDown className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button onClick={() => removeStep(step.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors ml-1">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-center pt-8 px-2 relative">
                                            <ChevronRight className={`h-5 w-5 text-primary/40`} />
                                        </div>
                                    </React.Fragment>
                                ))}

                                {/* Completed Node */}
                                <div className="flex flex-col mb-4 mt-6">
                                    <div className="w-56 bg-white border border-border rounded-xl p-4 flex items-center space-x-3 shadow-sm h-[68px]">
                                        <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                                            <Check className="h-5 w-5" />
                                        </div>
                                        <span className="font-semibold text-gray-800">Completed</span>
                                    </div>
                                </div>
                            </div>

                            {/* Add Buttons Area */}
                            <div className="flex items-center justify-center space-x-4 mt-4 relative">
                                <div className="absolute inset-x-0 top-1/2 h-px bg-gray-200 -z-10"></div>
                                <button
                                    onClick={addStep}
                                    className="flex items-center space-x-2 px-4 py-2 bg-white border border-border rounded-lg text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors z-10"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Add Step</span>
                                </button>
                                <button
                                    className="flex items-center space-x-2 px-4 py-2 bg-white border border-border rounded-lg text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors z-10"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Add Condition</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="mt-12 flex justify-end space-x-4 pt-6 border-t border-border">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-white border border-border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2.5 text-sm font-black text-white bg-primary hover:bg-hover rounded-xl transition-colors shadow-lg shadow-primary/20 uppercase tracking-widest"
                        >
                            Save Workflow
                        </button>
                    </div>

                </div>
            </motion.div>
        </div>
    );
};

export default CreateWorkflow;
