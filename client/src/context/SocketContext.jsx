console.log('SocketContext.jsx: Module evaluation started');
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    console.log('SocketProvider render, user:', user?._id);

    useEffect(() => {
        console.log('SocketProvider useEffect, user:', user?._id);
        if (!user) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
            return;
        }

        // Initialize socket connection
        const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
        const newSocket = io(SOCKET_URL, {
            transports: ['websocket'],
            reconnectionAttempts: 5
        });

        newSocket.on('connect', () => {
            console.log('Connected to WebSocket server');
            // Join a personal room based on user ID
            newSocket.emit('join', user._id);
        });

        // Global Event Listeners
        newSocket.on('notification_update', (notification) => {
            // We can trigger a toast notification here
            toast(notification.message, {
                icon: notification.type === 'approval' ? '✅' : notification.type === 'rejection' ? '❌' : '🔔',
                duration: 5000
            });
            // Trigger UI refresh
            window.dispatchEvent(new CustomEvent('notifications-updated'));
        });


        newSocket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
        });

        setSocket(newSocket);

        return () => {
            console.log('SocketProvider disconnecting');
            newSocket.disconnect();
        };
    }, [user]);

    console.log('SocketProvider returning children');
    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};
