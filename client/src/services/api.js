import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

export const workflowService = {
    create: (data) => api.post('/workflows', data),
    getAll: () => api.get('/workflows'),
    getAvailable: () => api.get('/workflows/available'),
    delete: (id) => api.delete(`/workflows/${id}`)
};

export const requestService = {
    submit: (data) => api.post('/requests', data),
    approve: (data) => api.post('/requests/approve', data),
    getAll: () => api.get('/requests'),
    getMy: (params) => api.get('/requests/my', { params }),
    getById: (id) => api.get(`/requests/${id}`),
    getMetrics: () => api.get('/requests/metrics'),
};

export const approvalService = {
    getAssigned: () => api.get('/approvals/assigned-to-me'),
    getRequests: () => api.get('/manager/requests'),
};

export const notificationService = {
    getAll: () => api.get('/notifications'),
    markRead: (id) => api.put(`/notifications/${id}/read`),
    markAllRead: () => api.put('/notifications/read-all'),
};

export const activityService = {
    getRecent: (userId) => api.get(`/activity/recent/${userId}`),
};

// Add interceptor to include token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
