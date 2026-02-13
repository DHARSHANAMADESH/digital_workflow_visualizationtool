import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Mail, Lock, User as UserIcon, Loader2, UserPlus, LogIn, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Login = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Employee'
    });
    const [isLoading, setIsLoading] = useState(false);
    const { login, register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isRegister && formData.password !== formData.confirmPassword) {
            return toast.error('Passwords do not match');
        }

        setIsLoading(true);
        try {
            if (isRegister) {
                await register(formData.name, formData.email, formData.password, formData.role);
                toast.success('Account created! Please sign in.');
                setIsRegister(false);
                setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
            } else {
                await login(formData.email, formData.password, formData.role);
                toast.success('Welcome to FlowStream!');
            }
        } catch (error) {
            console.error('Full Registration/Login Error:', error);
            if (error.response) {
                console.error('Error Response Data:', error.response.data);
                console.error('Error Status:', error.response.status);
            }
            toast.error(error.response?.data?.message || 'Connection to server failed');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setIsRegister(!isRegister);
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card w-full max-w-md p-8 relative overflow-hidden group transition-all duration-500"
            >
                {/* Decorative gradients */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-600/20 rounded-full blur-3xl group-hover:bg-violet-600/30 transition-all duration-500" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-fuchsia-600/20 rounded-full blur-3xl group-hover:bg-fuchsia-600/30 transition-all duration-500" />

                <div className="flex flex-col items-center mb-8 relative z-10">
                    <motion.div
                        whileHover={{ rotate: 15, scale: 1.1 }}
                        className="p-3 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl mb-4 shadow-lg active:scale-95 transition-transform duration-300"
                    >
                        <Layers className="h-8 w-8 text-white" />
                    </motion.div>
                    <motion.h1
                        key={isRegister ? 'register-title' : 'login-title'}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {isRegister ? 'Create Account' : 'Welcome Back'}
                    </motion.h1>
                    <p className="text-gray-400 mt-2">
                        {isRegister ? 'Join FlowStream enterprise' : 'FlowStream Management System'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                    <AnimatePresence mode="popLayout">
                        {isRegister && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-2 overflow-hidden"
                            >
                                <label className="text-xs font-medium text-gray-500 flex items-center space-x-2 uppercase tracking-wider">
                                    <UserIcon className="h-4 w-4" />
                                    <span>Full Name</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-violet-500 transition-all placeholder:text-gray-600"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500 flex items-center space-x-2 uppercase tracking-wider">
                            <Mail className="h-4 w-4" />
                            <span>Email Address</span>
                        </label>
                        <input
                            type="email"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-violet-500 transition-all placeholder:text-gray-600"
                            placeholder="name@company.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-1 gap-5">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-500 flex items-center space-x-2 uppercase tracking-wider">
                                <Lock className="h-4 w-4" />
                                <span>Password</span>
                            </label>
                            <input
                                type="password"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-violet-500 transition-all placeholder:text-gray-600"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <AnimatePresence mode="popLayout">
                            {isRegister && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-2 overflow-hidden"
                                >
                                    <label className="text-xs font-medium text-gray-500 flex items-center space-x-2 uppercase tracking-wider">
                                        <Lock className="h-4 w-4" />
                                        <span>Confirm Password</span>
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-violet-500 transition-all placeholder:text-gray-600"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500 flex items-center space-x-2 uppercase tracking-wider">
                            <UserIcon className="h-4 w-4" />
                            <span>System Role</span>
                        </label>
                        <select
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-violet-500 transition-all appearance-none cursor-pointer"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="Employee" className="bg-[#0f0c29]">Employee</option>
                            <option value="Manager" className="bg-[#0f0c29]">Manager</option>
                            <option value="Admin" className="bg-[#0f0c29]">Admin</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn-primary py-4 mt-2 flex items-center justify-center space-x-2 group relative overflow-hidden"
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <span className="font-semibold">{isRegister ? 'Create Account' : 'Sign In'}</span>
                                {isRegister ? <UserPlus className="h-4 w-4 group-hover:scale-110 transition-transform" /> : <LogIn className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
                            </>
                        )}
                    </button>

                    <div className="text-center pt-4">
                        <button
                            type="button"
                            onClick={toggleMode}
                            className="text-sm text-gray-400 hover:text-white transition-colors flex items-center justify-center space-x-2 mx-auto"
                        >
                            <span>{isRegister ? 'Already have an account? Sign In' : "Don't have an account? Create one"}</span>
                            <ArrowRight className="h-3 w-3" />
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
