import React, { useState, useEffect } from 'react';

import { Search, Bell, Plus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { notificationService } from '../services/api';


const Navbar = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = async () => {
        try {
            const res = await notificationService.getAll();
            const unread = (res.data || []).filter(n => !n.read).length;
            setUnreadCount(unread);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        fetchUnreadCount();

        // Listen for internal refresh signals
        const handleRefresh = () => fetchUnreadCount();
        window.addEventListener('notifications-updated', handleRefresh);
        window.addEventListener('approvals-updated', handleRefresh); // Approvals often trigger notifications

        // Background polling
        const interval = setInterval(fetchUnreadCount, 30000);

        return () => {
            window.removeEventListener('notifications-updated', handleRefresh);
            window.removeEventListener('approvals-updated', handleRefresh);
            clearInterval(interval);
        };
    }, []);


    const currentUser = user || { name: "Guest", role: "Employee" };

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            setIsSearching(true);
            // Simulate global search activity
            toast.promise(
                new Promise(resolve => setTimeout(resolve, 1500)),
                {
                    loading: `Searching for "${searchQuery}"...`,
                    success: 'Search complete. No matches found for this query.',
                    error: 'Search failed. Please try again.',
                }
            ).finally(() => setIsSearching(false));
        }
    };

    return (
        <header className="h-16 bg-white border-b border-border px-8 flex items-center justify-between sticky top-0 z-40">
            {/* Global search bar */}
            <div className="flex-1 max-w-lg">
                <div className="relative group">
                    {isSearching ? (
                        <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-spin" />
                    ) : (
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-secondary/40 group-focus-within:text-primary transition-colors" />
                    )}
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                        placeholder="Search workflows, requests..."
                        className="w-full pl-9 pr-4 py-1.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm text-content-primary placeholder:text-content-secondary/40 shadow-sm"
                    />
                </div>
            </div>

            {/* Actions Section */}
            <div className="flex items-center space-x-5">
                <button
                    onClick={() => navigate('/employee/new-request')}
                    className="bg-primary hover:bg-primary-hover text-white px-3 py-1.5 rounded-lg font-medium text-sm flex items-center space-x-1.5 shadow-sm transition-all active:scale-95"
                >
                    <Plus className="h-4 w-4" />
                    <span>New Request</span>
                </button>

                <div className="h-4 border-l border-border"></div>

                <button
                    onClick={() => navigate('/notifications')}
                    className="p-2 text-content-secondary/40 hover:text-primary hover:bg-background rounded-lg transition-all relative group"
                    title="Notifications"
                >
                    <Bell className="h-5 w-5 group-hover:animate-swing" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center rounded-full border-2 border-white pointer-events-none">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>

                <div className="flex items-center space-x-3 border-l border-border pl-5">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-medium text-content-primary leading-tight">{currentUser.name}</p>
                        <p className="text-xs text-content-secondary font-normal">{currentUser.role}</p>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-background text-primary flex items-center justify-center font-semibold text-sm ring-2 ring-white shadow-sm cursor-pointer hover:ring-primary/10 transition-all">
                        {currentUser.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
