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
        const token = localStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

const UserAPI = {
    getSciencePageHeroDetail: async () => {
        const response = await publicApi.get('/api/homepage/science')
        return response.data;
    },

    getBlogsHeroContent: async () => {
        const response = await publicApi.get('/api/homepage/blogs/user/get-hero')
        return response.data;
    },

    getAllBlogs: async () => {
        const response = await publicApi.get('/api/homepage/blogs/user/get')
        return response.data;
    },

    getBlogDetail: async (id) => {
        const response = await publicApi.get(`/api/homepage/blogs/user/get/${id}`)
        return response.data;
    },

}
export default UserAPI;