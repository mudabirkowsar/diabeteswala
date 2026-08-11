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
    registerUser: async (userData) => {
        const response = await publicApi.post('/api/auth/user/register', userData);
        return response.data;
    },

    loginUser: async (credentials) => {
        const response = await publicApi.post('/api/auth/user/login', credentials);
        return response.data;
    },

    getUserProfile: async () => {
        const response = await authApi.get('/api/auth/user/profile');
        return response.data;
    },

    updateUserProfile: async (formData) => {
        const response = await authApi.put('/api/auth/user/update', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    updateInsurance: async (formData) => {
        const response = await authApi.put('/api/auth/user/update-insurance', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    getMyInsurance: async () => {
        const response = await authApi.get('/api/auth/user/my-insurance');
        return response.data;
    },

    updateFamilyHistory: async (historyData) => {
        const response = await authApi.put('/api/auth/user/update-family-history', historyData);
        return response.data;
    },

    getFamilyHistory: async () => {
        const response = await authApi.get('/api/auth/user/get-family-history');
        return response.data;
    },

    updateMedicalConditions: async (conditionData) => {
        const response = await authApi.put('/api/auth/user/update-medical-conditions', conditionData);
        return response.data;
    },

    //User Address
    addAddress: async (addressData) => {
        const response = await authApi.post('/api/auth/user/add-address', addressData);
        return response.data;
    },

    getAddressList: async () => {
        const response = await authApi.get('/api/auth/user/addresses');
        return response.data;
    },

    setDefaultAddress: async (addressId) => {
        const response = await authApi.patch(`/api/auth/user/set-default-address/${addressId}`);
        return response.data;
    },

    removeAddress: async (itemId) => {
        const response = await authApi.delete(`/api/auth/user/remove-address/${itemId}`);
        return response.data;
    },
    updateAddress: async (itemId, updateData) => {
        const response = await authApi.put(`/api/auth/user/update-address/${itemId}`, updateData);
        return response.data;
    },

    //User Emergency Contacts
    addEmergencyContact: async (contactData) => {
        const response = await authApi.post('/api/auth/user/add-emergency', contactData);
        return response.data;
    },

    getEmergencyContactsList: async () => {
        const response = await authApi.get('/api/auth/user/emergency-contacts');
        return response.data;
    },

    removeEmergencyContact: async (itemId) => {
        const response = await authApi.delete(`/api/auth/user/remove-emergency/${itemId}`);
        return response.data;
    },

    //Family Members
    addFamilyMember: async (formData) => {
        const response = await authApi.post('/api/auth/user/add-family', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    getFamilyMembers: async () => {
        const response = await authApi.get('/api/auth/user/family-members');
        return response.data;
    },

    getFamilyMemberCount: async () => {
        const response = await authApi.get('/api/auth/user/family-member-count');
        return response.data;
    },

    editFamilyMember: async (itemId, formData) => {
        const response = await authApi.put(`/api/auth/user/edit-family-member/${itemId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    removeFamilyMember: async (itemId) => {
        const response = await authApi.delete(`/api/auth/user/remove-family-member/${itemId}`);
        return response.data;
    },

    //Science page
    getSciencePageHeroDetail: async () => {
        const response = await publicApi.get('/api/homepage/science')
        return response.data;
    },

    //Blogs Page
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

    getAboutUsDetails: async () => {
        const response = await publicApi.get('/api/aboutus/get-about-us')
        return response.data;
    },

    //Videos Page
    getAllYoutubeVideos: async () => {
        const response = await publicApi.get('/upload-videos/get-youtube-links')
        return response.data;
    },

    getAllLocalVideos: async () => {
        const response = await publicApi.get('/upload-videos/getVideo')
        return response.data;
    }

}
export default UserAPI;