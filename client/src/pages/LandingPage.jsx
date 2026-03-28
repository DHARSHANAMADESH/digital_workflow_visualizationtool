import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
    Layers, BarChart2, CheckCircle, Shield, Zap, 
    Users, FileText, Activity,
    Globe, MousePointer2, Smartphone, 
    Layout, Search, Bell, MoreHorizontal, Plus,
    FileCheck, Send, User, ChevronRight, Heart, 
    Clock, Monitor, Settings, Lock
} from 'lucide-react';
import { 
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
    CartesianGrid, Tooltip, BarChart, Bar, Cell 
} from 'recharts';

const LandingPage = () => {
    const navigate = useNavigate();

    const trustLogos = [
        { name: 'Acme Corp', icon: BarChart2 },
        { name: 'TechFlow', icon: Zap },
        { name: 'InnovateLab', icon: Activity },
        { name: 'FutureWorks', icon: Shield },
        { name: 'CloudScale', icon: Globe }
    ];

    const workflowSteps = [
        { title: 'Submit Request', desc: 'Pick a pre-defined dynamic workflow and submit details.', icon: FileText, color: 'text-primary', bg: 'bg-background' },
        { title: 'Manager Approval', desc: 'Securely manage and track all active requests.', icon: User, color: 'text-primary', bg: 'bg-background/50' },
        { title: 'Finance Review', desc: 'Ensure all financial details are verified.', icon: Shield, color: 'text-secondary', bg: 'bg-background' },
        { title: 'HR Verification', desc: 'Streamline human resource updates and tasks.', icon: Users, color: 'text-primary', bg: 'bg-background' },
        { title: 'Completed', desc: 'Finalize and log every outcome for audit trails.', icon: CheckCircle, color: 'text-secondary', bg: 'bg-background' }
    ];

    const features = [
        { title: 'Employee Dashboard', desc: 'Securely manage and track all active requests in real-time.', icon: Zap, iconColor: 'text-primary', iconBg: 'bg-background' },
        { title: 'Manager Dashboard', desc: 'Powerful tools for team and project management.', icon: CheckCircle, iconColor: 'text-secondary', iconBg: 'bg-background' },
        { title: 'Role-Based Access', desc: 'Secure actions for every designated role.', icon: Shield, iconColor: 'text-primary', iconBg: 'bg-background' },
        { title: 'Fast Workflow', desc: 'Accelerate productivity with instant updates.', icon: Zap, iconColor: 'text-secondary', iconBg: 'bg-background' }
    ];

    const workflowPerformanceData = [
        { name: 'Jan', efficiency: 45 },
        { name: 'Feb', efficiency: 72 },
        { name: 'Mar', efficiency: 48 },
        { name: 'Apr', efficiency: 85 },
        { name: 'May', efficiency: 62 },
        { name: 'Jun', efficiency: 95 },
        { name: 'Jul', efficiency: 70 },
        { name: 'Aug', efficiency: 88 },
    ];

    const requestTrendsData = [
        { name: 'Submitted', value: 450, color: '#14B8A6' },
        { name: 'Pending', value: 120, color: '#10B981' },
        { name: 'Approved', value: 310, color: '#0D9488' },
        { name: 'Rejected', value: 20, color: '#EF4444' },
    ];

    return (
        <div className="min-h-screen bg-background font-['Poppins',sans-serif] selection:bg-teal-100 selection:text-teal-900 overflow-x-hidden text-content-primary">
            
            {/* 1. NAVBAR (Top) */}
            <nav className="fixed w-full top-0 z-50 bg-white border-b border-border h-[70px] flex items-center transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 w-full flex justify-between items-center">
                    {/* Left: Logo */}
                    <div className="flex items-center space-x-2 cursor-pointer group" onClick={() => navigate('/')}>
                        <div className="p-1.5 bg-primary rounded-lg shadow-sm">
                            <Layers className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-content-primary">FlowStream</span>
                    </div>

                    {/* Center: Menu items */}
                    <div className="hidden md:flex items-center space-x-8">
                        {['Home', 'Features', 'How it Works'].map((item) => (
                            <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="text-[15px] font-medium text-content-secondary hover:text-primary transition-colors">
                                {item}
                            </a>
                        ))}
                    </div>

                    {/* Right: Auth Buttons */}
                    <div className="flex items-center space-x-6">
                        <button onClick={() => navigate('/login')} className="text-[15px] font-semibold text-content-secondary hover:text-primary transition-colors">
                            Sign In
                        </button>
                        <button onClick={() => navigate('/login')} className="px-6 py-2.5 text-[14px] font-bold text-white bg-primary hover:bg-hover rounded-[12px] shadow-sm transition-all active:scale-95">
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* 2. HERO SECTION (2-column layout) */}
            <section id="home" className="pt-[150px] pb-[80px] bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
                    <div className="flex flex-col lg:flex-row items-center gap-12">
                        {/* LEFT SIDE */}
                        <div className="w-full lg:w-1/2 text-left">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <span className="inline-block px-4 py-1.5 rounded-full bg-background text-content-secondary text-[13px] font-semibold tracking-wide mb-8 border border-border">
                                    Digital Workflow Automation
                                </span>
                                <h1 className="text-5xl md:text-6xl font-extrabold text-content-primary tracking-tight leading-[1.1] mb-8">
                                    Digital Workflow <br/>
                                    Made <span className="text-primary">Simple</span>
                                </h1>
                                <p className="text-[17px] text-content-secondary font-medium leading-[1.6] mb-10 max-w-[480px]">
                                    Track, automate, and optimize your company's approvals and tasks. Streamline your processes in one simple, easy-to-use platform.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <button onClick={() => navigate('/login')} className="w-full sm:w-auto px-10 py-4 text-[15px] font-bold text-white bg-primary hover:bg-hover rounded-[12px] shadow-sm border border-transparent transition-all">
                                        Get Started Free
                                    </button>
                                    <button onClick={() => navigate('/login')} className="w-full sm:w-auto px-10 py-4 text-[15px] font-bold text-content-secondary bg-white border border-border hover:bg-background rounded-[12px] shadow-sm transition-all">
                                        View Demo
                                    </button>
                                </div>
                            </motion.div>
                        </div>

                        {/* RIGHT SIDE */}
                        <div className="w-full lg:w-1/2">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8 }}
                                className="bg-white p-10 rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-border"
                            >
                                <div className="flex items-center justify-between gap-2 mb-12">
                                    {[
                                        { label: 'Employee', icon: User, color: 'bg-background', iconColor: 'text-primary' },
                                        { label: 'Request', icon: FileCheck, color: 'bg-background', iconColor: 'text-primary' },
                                        { label: 'Manager', icon: User, color: 'bg-background', iconColor: 'text-primary' },
                                        { label: 'Completed', icon: CheckCircle, color: 'bg-background/80', iconColor: 'text-secondary' }
                                    ].map((item, i) => (
                                        <React.Fragment key={i}>
                                            <div className="flex flex-col items-center gap-4 flex-1">
                                                <div className={`h-16 w-16 rounded-full ${item.color} flex items-center justify-center shadow-sm`}>
                                                    <item.icon className={`h-8 w-8 ${item.iconColor}`} />
                                                </div>
                                                <span className="text-[13px] font-bold text-gray-800">{item.label}</span>
                                            </div>
                                            {i < 3 && <div className="flex-1 border-t-2 border-dashed border-border mt-[-30px] mx-[-10px] pb-8" />}
                                        </React.Fragment>
                                    ))}
                                </div>
                                <div className="relative pt-12 border-t border-gray-50 flex justify-between px-2">
                                     <div className="absolute top-[-5px] left-8 right-8 h-[2px] bg-gray-100" />
                                     <div className="absolute top-[-5px] left-8 w-[66%] h-[2px] bg-primary z-0" />
                                    {[
                                        { label: 'Submit', active: true },
                                        { label: 'Review', active: true },
                                        { label: 'Approve', active: true },
                                        { label: 'Done', active: false }
                                    ].map((step, i) => (
                                        <div key={i} className="flex flex-col items-center gap-3 relative">
                                            <div className={`h-2.5 w-2.5 rounded-full ${step.active ? 'bg-primary' : 'bg-border'} absolute top-[-49px] z-10 border-2 border-white`} />
                                            <span className={`text-[11px] font-bold ${step.active ? 'text-content-primary' : 'text-content-secondary/40'}`}>{step.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. TRUSTED LOGOS ROW */}
            <section className="py-[60px] bg-white border-y border-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-wrap items-center justify-center gap-12 md:gap-24 opacity-60 grayscale cursor-default">
                    {trustLogos.map((logo) => (
                        <div key={logo.name} className="flex items-center gap-3">
                            <logo.icon className="h-6 w-6 text-content-secondary" />
                            <span className="text-[20px] font-bold text-content-secondary">{logo.name}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. WORKFLOW SECTION */}
            <section id="how-it-works" className="py-[80px] bg-[#f8fafc]">
                <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center">
                    <h2 className="text-[32px] md:text-[40px] font-extrabold text-content-primary mb-4">Visualize Your Entire Workflow</h2>
                    <p className="text-content-secondary font-medium mb-24 max-w-2xl mx-auto">Track, automate, and optimize your company's approvals and tasks.</p>

                    <div className="relative">
                        <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-[1px] bg-gray-200" />
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-12">
                            {workflowSteps.map((step, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="flex flex-col items-center group relative z-10"
                                >
                                    <div className={`h-24 w-24 rounded-full ${step.bg} flex items-center justify-center mb-8 shadow-sm border border-transparent`}>
                                        <step.icon className={`h-9 w-9 ${step.color}`} />
                                    </div>
                                    <h3 className="text-[17px] font-bold text-content-primary mb-3">{step.title}</h3>
                                    <p className="text-[13px] text-content-secondary font-medium leading-relaxed px-4">{step.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. FEATURES SECTION */}
            <section id="features" className="py-[80px] bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
                    <div className="text-center mb-24">
                        <h2 className="text-[32px] md:text-[40px] font-extrabold text-content-primary mb-4">Everything You Need to Manage Workflows</h2>
                        <p className="text-content-secondary font-medium">Powerful tools to align your needed tasks performance.</p>
                    </div>

                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                        {/* LEFT → Interactive Graph Showcase */}
                        <div className="w-full lg:w-1/2 space-y-6">
                            <div className="bg-white p-8 rounded-[32px] border border-border shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all h-[400px]">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h4 className="text-sm font-bold text-content-primary tracking-tight">System Efficiency</h4>
                                        <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-0.5">Performance Metrics</p>
                                    </div>
                                    <div className="bg-background px-2 py-1 rounded text-[10px] font-bold text-primary uppercase tracking-widest">+24% Growth</div>
                                </div>
                                <div className="h-[250px] w-full mt-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={workflowPerformanceData}>
                                            <defs>
                                                <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.1}/>
                                                    <stop offset="95%" stopColor="#14B8A6" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} hide />
                                            <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                                            <Area type="monotone" dataKey="efficiency" stroke="#14B8A6" strokeWidth={3} fillOpacity={1} fill="url(#colorEff)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-[24px] border border-border shadow-sm">
                                <h5 className="text-[11px] font-bold text-content-secondary/60 uppercase tracking-[0.2em] mb-4 text-center">Protocol Distribution</h5>
                                <div className="h-[140px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={requestTrendsData}>
                                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                                {requestTrendsData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Bar>
                                            <Tooltip cursor={{fill: 'transparent'}} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT → 4 feature cards (2x2 grid) */}
                        <div className="w-full lg:w-1/2 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {features.map((feat, i) => (
                                <div key={i} className="p-8 bg-white border border-border rounded-[16px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-lg transition-all text-left">
                                    <div className={`h-12 w-12 rounded-[12px] ${feat.iconBg} flex items-center justify-center mb-10`}>
                                        <feat.icon className={`h-6 w-6 ${feat.iconColor}`} />
                                    </div>
                                    <h3 className="text-[17px] font-bold text-content-primary mb-3">{feat.title}</h3>
                                    <p className="text-[13px] text-content-secondary font-medium leading-relaxed">{feat.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. HOW IT WORKS SECTION */}
            <section className="py-[80px] bg-[#f8fafc]">
                <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center">
                    <h2 className="text-[32px] md:text-[40px] font-extrabold text-content-primary mb-4">Get Started in 3 Simple Steps</h2>
                    <p className="text-content-secondary font-medium mb-24">Simple processes to make workflow better.</p>

                    <div className="relative max-w-5xl mx-auto">
                         <div className="hidden md:block absolute top-[50px] left-[20%] right-[20%] h-[1px] bg-gray-200" />
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10">
                            {[
                                { title: 'Submit Request', icon: Send, color: 'bg-background', iconColor: 'text-primary' },
                                { title: 'Approval Flow', icon: Users, color: 'bg-background', iconColor: 'text-secondary' },
                                { title: 'Get Completion', icon: CheckCircle, color: 'bg-background', iconColor: 'text-primary' }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <div className={`h-[100px] w-[100px] rounded-full ${item.color} flex items-center justify-center mb-8 relative border border-white shadow-sm`}>
                                        <item.icon className={`h-10 w-10 ${item.iconColor}`} />
                                        <div className="absolute -top-2 left-[70%] h-7 w-7 rounded-full bg-white text-content-primary text-[13px] font-bold flex items-center justify-center shadow-md border border-border">
                                            {i + 1}
                                        </div>
                                    </div>
                                    <h3 className="text-[19px] font-bold text-content-primary mb-4">{item.title}</h3>
                                    <p className="text-[14px] text-content-secondary font-medium leading-relaxed px-6">Simple process details to show how it works. No more manual work needed.</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 bg-white border-t border-border">
                 <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col items-center text-center">
                    <div className="flex items-center space-x-2 mb-6 grayscale opacity-50">
                        <div className="p-1.5 bg-primary rounded-lg">
                            <Layers className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-lg font-bold text-content-primary">FlowStream</span>
                    </div>
                    <p className="text-sm font-bold text-content-secondary/40">
                        &copy; {new Date().getFullYear()} FlowStream Workflow System. All rights reserved.
                    </p>
                 </div>
            </footer>
        </div>
    );
};

export default LandingPage;
;

