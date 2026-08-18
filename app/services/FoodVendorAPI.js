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
        const token = localStorage.getItem('foodToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

const FoodAPI = {
    registerFoodPartner: async (registrationData) => {
        const response = await publicApi.post('/api/auth/provider/register', registrationData);
        return response.data;
    },

    loginFoodPartner: async (loginData) => {
        const response = await publicApi.post('/api/auth/provider/login', loginData);
        return response.data;
    },

    uploadFoodDocuments: async (formData) => {
        const response = await authApi.put('/api/auth/provider/upload-docs/food', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }

}

export default FoodAPI;