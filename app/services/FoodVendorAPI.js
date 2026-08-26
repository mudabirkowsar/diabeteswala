import axios from 'axios';
 
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';
 
// 1. Public Instance: For data accessible without login
const publicApi = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});
 
// 2. Private (Authenticated) Instance: For protected vendor operations
const authApi = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});
 
// Interceptor to safely attach the token on the client-side
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
    // Auth & Onboarding Operations
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
    },
 
    // Vendor Tiffin & Meals Inventory Operations
    getVendorMasterCatalog: async () => {
        const response = await authApi.get('/provider/food/inventory/master-catalog');
        return response.data;
    },
 
    getVendorMealById: async (foodServiceId) => {
        const response = await authApi.get(`/provider/food/inventory/${foodServiceId}`);
        return response.data;
    },
 
    bulkSelectVendorMeals: async (foodServiceIds) => {
        const response = await authApi.post('/provider/food/inventory/select', { foodServiceIds });
        return response.data;
    },
 
    deselectVendorMeal: async (foodServiceId) => {
        const response = await authApi.put(`/provider/food/inventory/deselect/${foodServiceId}`);
        return response.data;
    },

    getVendorMasterCombos: async () => {
        const response = await authApi.get('/provider/food/inventory/master-combos');
        return response.data;
    },
 
    getVendorComboById: async (foodComboId) => {
        const response = await authApi.get(`/provider/food/inventory/combo/${foodComboId}`);
        return response.data;
    },

    bulkSelectVendorCombos: async (foodComboIds) => {
        const response = await authApi.post('/provider/food/inventory/select-combos', { foodComboIds });
        return response.data;
    },
 
    deselectVendorCombo: async (foodComboId) => {
        const response = await authApi.put(`/provider/food/inventory/deselect combo/${foodComboId}`);
        return response.data;
    },

    toggleVendorLiveStatus: async (isOnline = null) => {
        const payload = isOnline !== null ? { isOnline } : {};
        const response = await authApi.patch('/provider/food/inventory/toggle-online', payload);
        return response.data;
    }
};
 
export default FoodAPI;
 