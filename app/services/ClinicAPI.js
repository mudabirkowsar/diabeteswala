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
        const token = localStorage.getItem('clinicToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

const ClinicAPI = {
    registerClinic: async (clinicData) => {
        const response = await publicApi.post('/api/auth/clinic/register', clinicData);
        return response.data;
    },
    uploadDocuments: async (formData) => {
        const response = await authApi.put('/api/auth/clinic/profile/update', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    loginClinic: async (credentials) => {
        const response = await publicApi.post('/api/auth/clinic/login', credentials);
        return response.data;
    },

    getClinicProfile: async () => {
        const response = await authApi.get('/api/auth/clinic/profile');
        return response.data;
    },

}

export default ClinicAPI;