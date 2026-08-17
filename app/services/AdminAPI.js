import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// 1. Public Instance: For data accessible without login
const publicApi = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. Private (Authenticated) Instance: For user-specific/protected actions
const authApi = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to attach token to all private requests
authApi.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('adminToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

const AdminAPI = {
    registerAdmin: async (adminData) => {
        const response = await publicApi.post('/api/auth/admin/register', adminData);
        return response.data;
    },

    loginAdmin: async (credentials) => {
        const response = await publicApi.post('/api/auth/admin/login', credentials);
        return response.data;
    },
    getAdminProfile: async () => {
        const response = await authApi.get('/api/auth/admin/profile');
        return response.data;
    },
    updateAdminProfile: async (profileData) => {
        const response = await authApi.put('/api/auth/admin/update', profileData);
        return response.data;
    },


    //Clinic Management APIs
    getClinicsList: async (params) => {
        const response = await authApi.get('/api/admin/clinic/list', { params });
        return response.data;
    },

    approveRejectClinic: async (id, payload) => {
        const response = await authApi.patch(`/api/admin/clinic/approve/${id}`, payload);
        return response.data;
    },

    toggleClinicActive: async (id) => {
        const response = await authApi.patch(`/api/admin/clinic/toggle-active/${id}`);
        return response.data;
    },


    //Lab Management APIs
    getLabsList: async (params) => {
        const response = await authApi.get('/admin/lab/list', { params });
        return response.data;
    },

    approveRejectLab: async (id, payload) => {
        const response = await authApi.patch(`/admin/lab/approve/${id}`, payload);
        return response.data;
    },

    toggleLabActive: async (id) => {
        const response = await authApi.patch(`/admin/lab/toggle-active/${id}`);
        return response.data;
    },



}

export default AdminAPI;