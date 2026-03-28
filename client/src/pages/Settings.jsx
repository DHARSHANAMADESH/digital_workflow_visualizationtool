import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Lock,
    Bell,
    Palette,
    Info,
    History,
    Save,
    Mail,
    Shield,
    Smartphone,
    Monitor,
    Moon,
    Sun,
    CheckCircle2,
    Clock,
    Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Settings = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');

    // Mock data for Activity Log
    const [activityLog] = useState([
        { id: 1, action: 'Password Changed', date: '2026-03-05 14:30', icon: Lock, status: 'Authorized' },
        { id: 2, action: 'Profile Updated', date: '2026-03-04 09:15', icon: User, status: 'Authorized' },
        { id: 3, action: 'Email Login', date: '2026-03-06 10:05', icon: Shield, status: 'Authorized' },
    ]);

    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        department: 'Engineering',
        role: user?.role || ''
    });

    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        system: true
    });

    const [currentTheme, setCurrentTheme] = useState('light');

    const handleThemeChange = (themeId) => {
        setCurrentTheme(themeId);

        // Remove all theme classes first
        document.documentElement.classList.remove('dark', 'classic');

        if (themeId === 'dark') {
            document.documentElement.classList.add('dark');
            toast.success('Deep Teal protocol initiated');
        } else if (themeId === 'classic') {
            document.documentElement.classList.add('classic');
            toast.success('Enterprise Green theme applied');
        } else {
            toast.success('Standard Teal protocol restored');
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile Settings', icon: User },
        { id: 'security', label: 'Security & Access', icon: Lock },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'theme', label: 'Theme & Appearance', icon: Palette },
        { id: 'activity', label: 'Activity History', icon: History },
        { id: 'account', label: 'System Analytics', icon: Info },
    ];

    const handleSave = () => {
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 1000)),
            {
                loading: 'Syncing changes with core...',
                success: 'System parameters updated!',
                error: 'Failed to commit updates',
            }
        );
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-content-primary tracking-tight">System Settings</h1>
                    <p className="text-sm text-content-secondary mt-1">Manage your account preferences and security protocols.</p>
                </div>
                <div className="flex items-center space-x-2 bg-white border border-border shadow-sm px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-widest">Active Session</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${activeTab === tab.id
                                ? 'bg-background text-primary'
                                : 'text-content-secondary hover:bg-gray-50 hover:text-content-primary'
                                }`}
                        >
                            <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-primary' : ''}`} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="lg:col-span-3">
                    <AnimatePresence mode="wait">
                        <div
                            key={activeTab}
                            className="bg-white rounded-xl shadow-sm border border-border min-h-[600px] overflow-hidden flex flex-col"
                        >
                            <div className="p-12 flex-1">
                                {activeTab === 'profile' && (
                                    <div className="space-y-8">
                                        <div className="flex items-center space-x-8 pb-8 border-b border-border">
                                            <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center text-3xl font-bold text-white shadow-sm ring-8 ring-primary/5 border-2 border-white">
                                                {user?.name?.[0]}
                                            </div>
                                            <div className="space-y-1">
                                                <h2 className="text-xl font-semibold text-content-primary">{user?.name}</h2>
                                                <p className="text-sm text-content-secondary flex items-center">
                                                    <Shield className="h-3 w-3 mr-1.5 text-primary" />
                                                    {user?.role} Access Level
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-content-secondary uppercase tracking-wider block">Full Name</label>
                                                <input
                                                    type="text"
                                                    value={profileData.name}
                                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                    className="w-full bg-white border border-border rounded-lg py-2.5 px-3.5 focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-sm text-content-primary font-bold placeholder:text-content-secondary/40"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-content-secondary uppercase tracking-wider block">Email Address</label>
                                                <input
                                                    type="email"
                                                    value={profileData.email}
                                                    disabled
                                                    className="w-full bg-gray-50 border border-border rounded-lg py-2.5 px-3.5 text-sm text-content-secondary cursor-not-allowed"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-content-secondary uppercase tracking-wider block">Department</label>
                                                <select
                                                    value={profileData.department}
                                                    onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                                                    className="w-full bg-white border border-border rounded-lg py-2.5 px-3.5 focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-sm text-content-primary font-bold placeholder:text-content-secondary/40 appearance-none cursor-pointer"
                                                >
                                                    <option>Engineering</option>
                                                    <option>Product Design</option>
                                                    <option>Strategic Operations</option>
                                                    <option>Human Capital</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-content-secondary uppercase tracking-wider block">Clearance Level</label>
                                                <input
                                                    type="text"
                                                    value={profileData.role}
                                                    disabled
                                                    className="w-full bg-gray-50 border border-border rounded-lg py-2.5 px-3.5 text-sm text-content-secondary cursor-not-allowed"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'security' && (
                                    <div className="space-y-8 max-w-xl">
                                        <div className="p-4 bg-background rounded-xl border border-primary/10 flex items-start space-x-4">
                                            <Shield className="h-5 w-5 text-primary mt-0.5 flex-none" />
                                            <div>
                                                <h4 className="font-bold text-primary text-sm">Security Protocols</h4>
                                                <p className="text-[10px] text-primary/70 mt-1 uppercase tracking-widest font-black">Regularly updating your security keys helps maintain architectural integrity.</p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            {[
                                                { label: 'Current Password', placeholder: 'Enter your current password' },
                                                { label: 'New Password', placeholder: 'Minimum 8 characters' },
                                                { label: 'Confirm Password', placeholder: 'Repeat your new password' },
                                            ].map((field, i) => (
                                                <div key={i} className="space-y-2">
                                                    <label className="text-xs font-semibold text-content-secondary uppercase tracking-wider block">{field.label}</label>
                                                    <input
                                                        type="password"
                                                        placeholder={field.placeholder}
                                                        className="w-full bg-white border border-border rounded-lg py-2.5 px-3.5 focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-sm text-content-primary font-bold placeholder:text-content-secondary/40"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'notifications' && (
                                    <div className="space-y-4">
                                        {[
                                            { id: 'email', label: 'Email Notifications', desc: 'Receive daily digests and approval alerts.', icon: Mail },
                                            { id: 'push', label: 'Push Notifications', desc: 'Real-time alerts for incoming requests.', icon: Smartphone },
                                            { id: 'system', label: 'System Alerts', desc: 'In-app notifications for workflow updates.', icon: Bell },
                                        ].map((item) => (
                                            <div key={item.id} className="flex items-center justify-between p-6 bg-white rounded-xl border border-border hover:border-primary/20 transition-colors group">
                                                <div className="flex items-start space-x-4">
                                                    <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                                                        <item.icon className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-content-primary leading-none">{item.label}</p>
                                                        <p className="text-[10px] text-content-secondary/40 font-black uppercase tracking-widest mt-1.5">{item.desc}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setNotifications({ ...notifications, [item.id]: !notifications[item.id] })}
                                                    className={`w-11 h-6 rounded-full p-1 transition-all duration-300 ${notifications[item.id] ? 'bg-primary' : 'bg-gray-200'}`}
                                                >
                                                    <div className={`h-4 w-4 bg-white rounded-full transition-transform duration-300 transform ${notifications[item.id] ? 'translate-x-5' : 'translate-x-0'}`} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeTab === 'theme' && (
                                    <div className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {[
                                                { id: 'light', label: 'Classic Teal', icon: Sun, colors: ['#14B8A6', '#F0FDFA'], desc: 'Modern light interface with teal accents.' },
                                                { id: 'dark', label: 'Deep Emerald', icon: Moon, colors: ['#134E4A', '#0F172A'], desc: 'High-contrast dark layout for eye comfort.' },
                                                { id: 'classic', label: 'Enterprise Green', icon: Monitor, colors: ['#10B981', '#F1F5F9'], desc: 'Traditional corporate green experience.' },
                                            ].map((theme) => (
                                                <button
                                                    key={theme.id}
                                                    onClick={() => handleThemeChange(theme.id)}
                                                    className={`relative p-6 rounded-xl border-2 transition-all duration-200 text-left flex flex-col justify-between h-full group ${currentTheme === theme.id
                                                        ? 'border-primary bg-background/20'
                                                        : 'border-border bg-white hover:border-primary/20 hover:shadow-sm'
                                                        }`}
                                                >
                                                    <div className="space-y-6">
                                                        <div className={`h-12 w-12 rounded-lg bg-white border border-border shadow-sm flex items-center justify-center transition-all ${currentTheme === theme.id ? 'text-primary' : 'text-content-secondary/40 group-hover:text-primary'}`}>
                                                            <theme.icon className="h-6 w-6" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center justify-between">
                                                                <p className="font-semibold text-content-primary text-sm">{theme.label}</p>
                                                                {currentTheme === theme.id && <CheckCircle2 className="h-4 w-4 text-primary" />}
                                                            </div>
                                                            <p className="text-[10px] text-content-secondary font-medium mt-1 uppercase tracking-wider">{theme.desc}</p>
                                                            <div className="flex space-x-1.5 mt-4">
                                                                {theme.colors.map((c, idx) => (
                                                                    <div key={idx} className="h-3 w-3 rounded-full border border-border" style={{ backgroundColor: c }} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'activity' && (
                                    <div className="space-y-6">
                                        <div className="relative border-l-2 border-border ml-3 pl-8 space-y-6 py-2">
                                            {activityLog.map((log) => (
                                                <div key={log.id} className="relative">
                                                    <div className="absolute -left-[37px] top-6 h-3 w-3 rounded-full bg-white border-2 border-primary ring-4 ring-primary/5 shadow-sm" />
                                                    <div className="bg-white border border-border p-4 rounded-xl hover:border-primary/20 transition-colors flex justify-between items-center group">
                                                        <div className="flex items-center space-x-4">
                                                            <div className="h-10 w-10 bg-background rounded-lg flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                                                                <log.icon className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-content-primary leading-none">{log.action}</p>
                                                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-2 flex items-center">
                                                                    <Clock className="h-3 w-3 mr-1.5" />
                                                                    {log.date}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] font-normal uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                                                            {log.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'account' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <h3 className="text-sm font-semibold text-content-primary flex items-center space-x-2">
                                                <Activity className="h-4 w-4 text-primary" />
                                                <span>Usage Analytics</span>
                                            </h3>
                                            <div className="p-6 bg-gray-50 rounded-xl border border-border space-y-6">
                                                {[
                                                    { label: 'Storage Persistence', value: '4.2 GB', progress: 42 },
                                                    { label: 'Sync Capacity', value: '72%', progress: 72 },
                                                    { label: 'Request Volume', value: '1,204', progress: 55 },
                                                ].map((stat, i) => (
                                                    <div key={i} className="space-y-3">
                                                        <div className="flex justify-between text-[10px] font-semibold uppercase tracking-wider">
                                                            <span className="text-content-secondary">{stat.label}</span>
                                                            <span className="text-primary">{stat.value}</span>
                                                        </div>
                                                        <div className="h-2 w-full bg-white rounded-full overflow-hidden border border-border shadow-sm">
                                                            <div
                                                                className="h-full bg-primary rounded-full transition-all duration-1000"
                                                                style={{ width: `${stat.progress}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-primary rounded-xl p-8 text-white relative overflow-hidden shadow-sm flex flex-col justify-center">
                                            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/10 rounded-full blur-[64px]" />
                                            <div className="relative z-10 space-y-4">
                                                <Shield className="h-10 w-10 text-white/30 mb-2" />
                                                <h4 className="text-xl font-bold tracking-tight leading-tight uppercase">Elite Security Protocols</h4>
                                                <p className="text-white/70 text-sm font-medium leading-relaxed">Your account is secured with bank-grade encryption and real-time threat monitoring.</p>
                                                <div className="pt-2">
                                                    <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Security ID</div>
                                                    <div className="font-mono text-[10px] text-white/80 bg-white/10 py-3 px-4 rounded-lg border border-white/10 tracking-widest">FS-RETA-82991-X</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Buffer */}
                            {['profile', 'security', 'notifications'].includes(activeTab) && (
                                <div className="p-6 bg-gray-50 border-t border-border flex justify-between items-center">
                                    <p className="text-[10px] text-content-secondary font-semibold uppercase tracking-widest">
                                        Warning: <span className="text-rose-600">Unsaved changes detected</span>
                                    </p>
                                    <button onClick={handleSave} className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-lg font-semibold text-xs uppercase tracking-widest flex items-center space-x-2 shadow-sm transition-all hover:shadow-md active:scale-95">
                                        <Save className="h-4 w-4" />
                                        <span>Save Changes</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Settings;
