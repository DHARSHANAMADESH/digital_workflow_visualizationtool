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
        if (role === 'manager' || role === 'admin' || role === 'it' || role === 'finance') {
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
        ...(currentUser.role?.toLowerCase() === 'finance' ? [
            {
                name: 'Budgets',
                icon: Layers,
                path: '/finance/budgets'
            }
        ] : []),
        ...(currentUser.role?.toLowerCase() === 'it' ? [
            {
                name: 'IT Queue',
                icon: Layers,
                path: '/manager-requests' // IT uses the same request list view
            },
            {
                name: 'IT Approvals',
                icon: CheckSquare,
                path: '/approvals',
                badge: pendingCount
            }
        ] : []),
    ];

    const systemItems = [
        { name: 'Notifications', icon: Bell, path: '/notifications' },
        { name: 'Settings', icon: SettingsIcon, path: '/settings' },
    ];

    return (
        <aside className="w-64 bg-white border-r border-border text-content-primary flex flex-col fixed h-full z-50 shadow-sm">
            <div className="px-6 py-8 flex-1">
                <div className="flex items-center space-x-3 text-xl font-bold tracking-tight text-content-primary mb-10">
                    <div className="p-2 bg-primary rounded-xl shadow-md">
                        <Layers className="h-6 w-6 text-white" />
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
                                        `flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${isActive
                                            ? 'bg-primary text-white shadow-md'
                                            : 'text-content-secondary hover:bg-background hover:text-primary'
                                        }`
                                    }
                                >
                                    <div className="flex items-center space-x-3">
                                        <item.icon className={`h-4 w-4 ${location.pathname === item.path ? 'text-white' : 'text-content-secondary'}`} />
                                        <span>{item.name}</span>
                                    </div>
                                    {item.badge !== undefined && item.badge > 0 && (
                                        <span className="bg-red-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                            {item.badge}
                                        </span>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-[10px] text-content-secondary/60 font-medium uppercase tracking-[0.2em] mb-4 px-4">System Protocols</p>
                        <div className="space-y-1">
                            {systemItems.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${isActive
                                            ? 'bg-primary text-white shadow-md'
                                            : 'text-content-secondary hover:bg-background hover:text-primary'
                                        }`
                                    }
                                >
                                    <item.icon className={`h-4 w-4 ${location.pathname === item.path ? 'text-white' : 'text-content-secondary'}`} />
                                    <span>{item.name}</span>
                                </NavLink>
                            ))}
                        </div>
                    </div>
                </nav>
            </div>

            {/* User Profile Card */}
            <div className="p-6 bg-white border-t border-border space-y-4">
                <div className="flex items-center space-x-3 bg-background border border-border p-4 rounded-xl shadow-sm">
                    <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm shadow-md">
                        {currentUser.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-content-primary truncate tracking-tight">{currentUser.name}</p>
                        <p className="text-xs text-secondary font-medium truncate">{currentUser.role}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-content-secondary hover:bg-background hover:text-primary transition-all duration-200 group"
                >
                    <LogOut className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
