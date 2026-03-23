console.log('AuthContext.jsx: Module evaluation started');
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        console.log('AuthProvider useEffect starting');
        try {
            const storedUser = localStorage.getItem('user');
            console.log('Stored user:', storedUser);
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                api.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
            }
        } catch (error) {
            console.error('Error parsing stored user:', error);
            localStorage.removeItem('user'); // Clear corrupted data
        } finally {
            console.log('AuthProvider setting loading to false');
            setLoading(false);
        }
    }, []);

    console.log('AuthProvider rendering, loading:', loading);

    const login = async (email, password, role) => {
        const response = await api.post('/auth/login', { email, password, role });
        const userData = response.data;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;

        // Redirect based on role
        navigate(`/${role.toLowerCase()}/dashboard`);
        return userData;
    };

    const register = async (name, email, password, role) => {
        const response = await api.post('/auth/register', { name, email, password, role });
        return response.data;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
