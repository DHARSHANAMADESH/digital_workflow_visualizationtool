import React, { useState, useEffect } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { LayoutDashboard, Bell, Clock, Layers, CheckSquare, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { approvalService } from '../services/api';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const currentUser = user || { name: "Guest", role: "Employee" };
    const [pendingCount, setPendingCount] = useState(0);

    const fetchPendingCount = () => {
        const role = currentUser.role?.toLowerCase();
        if (role === 'manager' || role === 'admin') {
            approvalService.getAssigned()
                .then(res => {
                    const userId = currentUser._id || currentUser.id;
                    const userRole = currentUser.role?.toLowerCase();

                    const pending = (res.data || []).filter(r => {
                        // Must be overall pending
                        if (r.status?.toLowerCase() !== 'pending') return false;

                        // Must be specifically waiting for THIS user or THIS user's role
                        return r.pendingApprovals?.some(pa =>
                            pa.status === 'pending' && (
                                pa.userId?.toString() === userId?.toString() ||
                                (pa.role && pa.role.toLowerCase() === userRole)
                            )
                        );
                    }).length;

                    setPendingCount(pending);
                })
                .catch(console.error);
        }
    };

    useEffect(() => {
        fetchPendingCount();

        // Listen for internal refresh signals
        window.addEventListener('approvals-updated', fetchPendingCount);

        // Background polling for consistency
        const interval = setInterval(fetchPendingCount, 60000);

        return () => {
            window.removeEventListener('approvals-updated', fetchPendingCount);
            clearInterval(interval);
        };
    }, [currentUser.role]);

    // Refresh count on every navigation (e.g., when clicking the Approvals link)
    useEffect(() => {
        fetchPendingCount();
    }, [location.pathname]);

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: `/${currentUser.role.toLowerCase()}/dashboard` },
        ...(currentUser.role?.toLowerCase() === 'manager' || currentUser.role?.toLowerCase() === 'admin' ? [
            {
                name: 'Manager Requests',
                icon: Layers,
                path: '/manager-requests'
            },
            {
                name: 'Approvals',
                icon: CheckSquare,
                path: '/approvals',
                badge: pendingCount
            }
        ] : []),
    ];

    const systemItems = [
        { name: 'Notifications', icon: Bell, path: '/notifications' },
        { name: 'Activity History', icon: Clock, path: '/activity-log' },
        { name: 'Settings', icon: SettingsIcon, path: '/settings' },
    ];

    return (
        <aside className="w-64 bg-[#F9FAFB] text-gray-700 flex flex-col fixed h-full border-r border-gray-200 z-50">
            <div className="px-6 py-8 flex-1">
                <div className="flex items-center space-x-2 text-xl font-semibold tracking-tight text-gray-900 mb-10">
                    <div className="p-1.5 bg-indigo-600 rounded-lg shadow-sm">
                        <Layers className="h-5 w-5 text-white" />
                    </div>
                    <span>FlowStream</span>
                </div>

                <nav className="space-y-8">
                    <div>
                        <div className="space-y-1">
                            {menuItems.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center justify-between px-3 py-2 rounded-md transition-colors text-sm font-medium ${isActive
                                            ? 'bg-gray-200/50 text-indigo-600'
                                            : 'text-gray-600 hover:bg-gray-100/50 hover:text-gray-900'
                                        }`
                                    }
                                >
                                    <div className="flex items-center space-x-3">
                                        <item.icon className="h-4 w-4" />
                                        <span>{item.name}</span>
                                    </div>
                                    {item.badge !== undefined && item.badge > 0 && (
                                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                            {item.badge}
                                        </span>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">System</p>
                        <div className="space-y-1">
                            {systemItems.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center space-x-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${isActive
                                            ? 'bg-gray-200/50 text-indigo-600'
                                            : 'text-gray-600 hover:bg-gray-100/50 hover:text-gray-900'
                                        }`
                                    }
                                >
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.name}</span>
                                </NavLink>
                            ))}
                        </div>
                    </div>
                </nav>
            </div>

            {/* User Profile Card */}
            <div className="p-4 border-t border-gray-200 space-y-2">
                <div className="flex items-center space-x-3 bg-white border border-gray-200 p-2.5 rounded-lg shadow-sm">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs ring-1 ring-inset ring-indigo-200">
                        {currentUser.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate tracking-tight leading-tight">{currentUser.name}</p>
                        <p className="text-xs text-gray-500 truncate">{currentUser.role}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors group"
                >
                    <LogOut className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
