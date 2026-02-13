import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    GitBranch,
    Send,
    CheckCircle2,
    Settings,
    Layers,
    LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: `/${user?.role?.toLowerCase()}/dashboard` },
        { name: 'My Requests', icon: Send, path: '/my-requests' },
    ];

    if (user?.role === 'Admin' || user?.role === 'Manager') {
        menuItems.push({ name: 'Approvals', icon: CheckCircle2, path: '/approvals' });
    }

    if (user?.role === 'Admin') {
        menuItems.push({ name: 'Create Workflow', icon: GitBranch, path: '/create-workflow' });
    }

    return (
        <aside className="w-64 border-r border-white/10 flex flex-col h-screen fixed left-0 top-0 bg-[#0f0c29]/50 backdrop-blur-xl z-50">
            <div className="p-6 flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl">
                    <Layers className="h-6 w-6 text-white" />
                </div>
                <span className="font-semibold text-xl">FlowStream</span>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `nav-link ${isActive ? 'active' : ''}`
                        }
                    >
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-white/10 space-y-2">
                <button className="nav-link w-full">
                    <Settings className="h-5 w-5" />
                    <span className="font-medium">Settings</span>
                </button>
                <button onClick={logout} className="nav-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
