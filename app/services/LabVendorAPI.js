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
        const token = localStorage.getItem('labToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

const LabVendorAPI = {
    registerLab: async (labData) => {
        const response = await publicApi.post('api/auth/provider/register', labData);
        return response.data;
    },
    uploadDocuments: async (formData) => {
        const response = await authApi.put('/api/auth/provider/upload-docs/lab', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    loginLab: async (credentials) => {
        const response = await publicApi.post('api/auth/provider/login', credentials);
        return response.data;
    },

    getLabProfile: async () => {
        const response = await authApi.get('/api/auth/provider/profile');
        return response.data;
    },

}

export default LabVendorAPI;