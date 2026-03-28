import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    DollarSign, 
    Save, 
    ArrowLeft, 
    ShieldCheck, 
    TrendingUp,
    AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const BudgetManagement = () => {
    const navigate = useNavigate();
    const [budget, setBudget] = useState(450000);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const savedBudget = localStorage.getItem('total_budget');
        if (savedBudget) {
            setBudget(parseInt(savedBudget));
        }
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        
        try {
            // Simulated delay for premium feel
            await new Promise(resolve => setTimeout(resolve, 800));
            localStorage.setItem('total_budget', budget.toString());
            toast.success('Total budget updated successfully!');
            
            // Dispatch event for other tabs/components
            window.dispatchEvent(new Event('budget-updated'));
            
            navigate('/finance/dashboard');
        } catch (error) {
            toast.error('Failed to update budget');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <button 
                        onClick={() => navigate('/finance/dashboard')}
                        className="flex items-center space-x-2 text-content-secondary hover:text-primary transition-all font-bold text-[10px] uppercase tracking-[0.2em] mb-4 group"
                    >
                        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
                        <span>Return to Dashboard</span>
                    </button>
                    <h1 className="text-3xl font-extrabold text-content-primary tracking-tight">Budget Management</h1>
                    <p className="text-content-secondary mt-1 font-medium italic">Configure annual fiscal limits and allocations</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-12">
                    <div className="bg-white rounded-[40px] border border-border shadow-sm p-10 md:p-14 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
                            <TrendingUp className="h-48 w-48 text-primary" />
                        </div>

                        <form onSubmit={handleSave} className="relative z-10 space-y-12">
                            <div className="space-y-4">
                                <label className="flex items-center space-x-3 text-[11px] font-black text-content-secondary/40 uppercase tracking-[0.3em]">
                                    <DollarSign className="h-4 w-4 text-primary" />
                                    <span>Total Operational Budget</span>
                                </label>
                                
                                <div className="relative group">
                                    <span className="absolute left-8 top-1/2 -translate-y-1/2 text-4xl font-black text-content-secondary/20 group-focus-within:text-primary transition-colors">$</span>
                                    <input
                                        type="number"
                                        value={budget}
                                        onChange={(e) => setBudget(parseInt(e.target.value) || 0)}
                                        className="w-full bg-background border-2 border-border rounded-[32px] py-10 pl-20 pr-10 text-5xl font-black text-content-primary focus:outline-none focus:border-primary focus:bg-white transition-all shadow-inner tracking-tighter"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-gray-400 font-medium px-4">
                                    * This value defines the cap for all financial dashboards and utilization analytics.
                                </p>
                            </div>

                            <div className="bg-background rounded-3xl p-8 border border-primary/10 flex items-start space-x-6">
                                <div className="p-3 bg-white rounded-2xl text-primary shadow-sm">
                                    <AlertCircle className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-black text-content-primary uppercase">Impact Analysis</h4>
                                    <p className="text-xs text-content-secondary font-medium leading-relaxed">
                                        Adjusting the budget total will immediately update the utilization graphs, progress bars, and allocation charts for all Finance personnel across the application. Previous history is maintained.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-border flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
                                    <span className="text-[10px] font-bold text-content-secondary/40 uppercase tracking-widest">Protocol Version: 4.2.0</span>
                                </div>
                                
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="bg-primary hover:bg-hover text-white px-10 py-5 rounded-[24px] font-black text-sm uppercase tracking-widest flex items-center space-x-3 shadow-xl shadow-primary/10 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Save className="h-5 w-5" />
                                    )}
                                    <span>Sync Fiscal Limit</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BudgetManagement;
