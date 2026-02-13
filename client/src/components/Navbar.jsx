import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, User as UserIcon, Check, Clock, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
            return () => clearInterval(interval);
        }
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await notificationService.getAll();
            setNotifications(res.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markRead(id);
            setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleNotificationClick = async (notification) => {
        // Mark as read first
        if (!notification.read) {
            await handleMarkAsRead(notification._id);
        }

        // Hide dropdown
        setShowNotifications(false);

        // Navigate based on type and user role
        if (notification.requestId) {
            if (user.role === 'Employee') {
                navigate(`/employee/requests/${notification.requestId}`);
            } else if (user.role === 'Manager' || user.role === 'Admin') {
                // For approvers, we can go to Approvals or a general Details page if exists
                navigate(`/approvals`);
            }
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllRead();
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <nav className="h-16 border-b border-white/10 flex items-center justify-between px-8 backdrop-blur-md sticky top-0 z-50">
            <div className="flex items-center space-x-4 flex-1">
                <div className="relative w-64">
                    <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search workflows..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:border-violet-500 transition-all text-sm"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-6">
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 hover:bg-white/5 rounded-full transition-colors group"
                    >
                        <Bell className={`h-6 w-6 ${unreadCount > 0 ? 'text-violet-400' : 'text-gray-300'} group-hover:scale-110 transition-transform`} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-fuchsia-500 rounded-full border-2 border-[#0f0c29] flex items-center justify-center text-[10px] font-bold text-white">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-2 w-80 glass-card p-0 overflow-hidden z-[100]"
                            >
                                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                                    <h3 className="text-sm font-bold">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={handleMarkAllAsRead}
                                            className="text-[10px] text-violet-400 hover:text-violet-300 font-bold uppercase tracking-wider"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-[400px] overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center text-gray-500 italic text-sm">
                                            No notifications yet
                                        </div>
                                    ) : (
                                        notifications.map(notification => (
                                            <div
                                                key={notification._id}
                                                onClick={() => handleNotificationClick(notification)}
                                                className={`p-4 border-b border-white/5 transition-colors cursor-pointer hover:bg-white/10 ${notification.read ? 'opacity-60 bg-transparent' : 'bg-white/5'}`}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <p className={`text-sm ${notification.read ? 'text-gray-400' : 'text-white'}`}>
                                                        {notification.message}
                                                    </p>
                                                    {!notification.read && <div className="h-2 w-2 rounded-full bg-fuchsia-500 flex-shrink-0 mt-1" />}
                                                </div>
                                                <div className="flex items-center text-[10px] text-gray-500 space-x-2">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="p-2 text-center bg-white/5 border-t border-white/10">
                                    <button className="text-xs text-gray-400 hover:text-white transition-colors py-1 w-full">
                                        View all Activity
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex items-center space-x-3 pl-6 border-l border-white/10">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-medium">{user?.name || 'Authorized User'}</p>
                        <p className="text-xs text-gray-400 capitalize">{user?.role || 'Access Tier'}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center border-2 border-white/20">
                        <UserIcon className="h-5 w-5 text-white" />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
