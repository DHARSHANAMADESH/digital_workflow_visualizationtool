import React, { useState, useEffect } from 'react';
import { Bell, Check, Clock, Info, ShieldCheck, XCircle, Trash2, Loader2 } from 'lucide-react';
import { notificationService } from '../services/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationsLog = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await notificationService.getAll();
            setNotifications(res.data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();

        const handleRefresh = () => fetchNotifications();
        window.addEventListener('notifications-updated', handleRefresh);
        return () => window.removeEventListener('notifications-updated', handleRefresh);
    }, []);

    const markAsRead = async (id) => {
        try {
            await notificationService.markRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
            window.dispatchEvent(new CustomEvent('notifications-updated'));
        } catch (error) {
            toast.error('Failed to mark notification as read');
        }
    };

    const markAllRead = async () => {
        try {
            setActionLoading(true);
            await notificationService.markAllRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            window.dispatchEvent(new CustomEvent('notifications-updated'));
            toast.success('All notifications marked as read');
        } catch (error) {
            toast.error('Failed to mark all as read');
        } finally {
            setActionLoading(false);
        }
    };

    const getIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'submission': return <Info className="h-5 w-5 text-blue-500" />;
            case 'approval': return <ShieldCheck className="h-5 w-5 text-emerald-500" />;
            case 'rejection': return <XCircle className="h-5 w-5 text-rose-500" />;
            default: return <Bell className="h-5 w-5 text-primary" />;
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                <p className="text-content-secondary font-medium">Loading notifications...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-content-primary tracking-tight">Notifications Center</h1>
                    <p className="text-sm text-content-secondary mt-1">Stay updated with your workflow movements and alerts.</p>
                </div>
                <button
                    onClick={markAllRead}
                    disabled={actionLoading || notifications.every(n => n.read)}
                    className="flex items-center space-x-2 px-4 py-2 bg-background text-primary rounded-xl font-semibold text-sm hover:bg-primary/10 transition-colors disabled:opacity-50"
                >
                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    <span>Mark all as read</span>
                </button>
            </div>

            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl border border-border shadow-sm text-center flex flex-col items-center">
                        <div className="h-16 w-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                            <Bell className="h-8 w-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-content-primary">All caught up!</h3>
                        <p className="text-gray-400 text-sm mt-1">No notifications to show right now.</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {notifications.map((notif) => (
                            <motion.div
                                layout
                                key={notif._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`group p-5 rounded-2xl border transition-all duration-300 flex items-start space-x-4 ${notif.read
                                    ? 'bg-white border-border opacity-75'
                                    : 'bg-white border-primary/10 shadow-sm ring-1 ring-primary/5 shadow-primary/5'
                                    }`}
                            >
                                <div className={`mt-1 h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${notif.read ? 'bg-gray-50' : 'bg-background'}`}>
                                    {getIcon(notif.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className={`text-sm font-semibold truncate ${notif.read ? 'text-gray-700' : 'text-content-primary'}`}>
                                            {notif.message}
                                        </p>
                                        {!notif.read && (
                                            <span className="h-2 w-2 bg-primary rounded-full" />
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-3 text-xs text-gray-400">
                                        <div className="flex items-center">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {new Date(notif.createdAt).toLocaleString()}
                                        </div>
                                        {notif.type && (
                                            <span className="bg-gray-100 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                {notif.type}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {!notif.read && (
                                    <button
                                        onClick={() => markAsRead(notif._id)}
                                        className="opacity-0 group-hover:opacity-100 p-2 text-primary hover:bg-background rounded-lg transition-all"
                                        title="Mark as read"
                                    >
                                        <Check className="h-4 w-4" />
                                    </button>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};

export default NotificationsLog;

