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
    // ===================================================
    // --- VENDOR PROFILE APIS (FOOD VENDOR) -------------
    // ===================================================

    // --- 1. Get Food Profile ---
    getFoodVendorProfile: async () => {
        // Returns the logged-in food vendor's profile, including document statuses and metadata
        const response = await authApi.get('/provider/food/profile/');
        return response.data;
    },

    // --- 2. Update Food Profile (Staged Request) ---
    updateFoodVendorProfile: async (formData) => {
        // formData: Must be an instance of FormData containing text fields and staged file binaries
        const response = await authApi.put('/provider/food/profile/update', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
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
    },

    // ===================================================
    // --- VENDOR TIFFIN PLANS INVENTORY APIS ------------
    // ===================================================

    getVendorMasterTiffinPlans: async () => {
        const response = await authApi.get('/provider/food/inventory/master-plans');
        return response.data;
    },

    syncVendorTiffinPlans: async (syncPayload) => {
        const response = await authApi.post('/provider/food/inventory/sync-plans', syncPayload);
        return response.data;
    },

    toggleVendorTiffinPlan: async (planId) => {
        const response = await authApi.patch(`/provider/food/inventory/toggle-plan/${planId}`);
        return response.data;
    },

    // ===================================================
    // --- VENDOR FOOD ORDERS & KITCHEN CONSOLE APIS ----
    // ===================================================

    getKitchenOrders: async (params) => {
        const response = await authApi.get('/provider/food/orders/my-orders', { params });
        return response.data;
    },

    getKitchenOrderDetail: async (id) => {
        const response = await authApi.get(`/provider/food/orders/${id}`);
        return response.data;
    },

    updateKitchenOrderStatus: async (id, statusPayload) => {
        const response = await authApi.patch(`/provider/food/orders/${id}/status`, statusPayload);
        return response.data;
    },
    // ===================================================
    // --- VENDOR TIFFIN & CUSTOM REQUESTS APIS ---------
    // ===================================================

    getVendorStandardSubscriptions: async (params) => {
        const response = await authApi.get('/provider/food/tiffin/subscriptions', { params });
        return response.data;
    },

    getVendorStandardSubscriptionDetails: async (id) => {
        const response = await authApi.get(`/provider/food/tiffin/subscriptions/${id}`);
        return response.data;
    },

    getVendorCustomRequests: async (params) => {
        const response = await authApi.get('/provider/food/tiffin/custom-requests', { params });
        return response.data;
    },

    getVendorCustomRequestDetails: async (id) => {
        const response = await authApi.get(`/provider/food/tiffin/custom-requests/${id}`);
        return response.data;
    },

    processVendorCustomRequest: async (id, actionPayload) => {
        const response = await authApi.patch(`/provider/food/tiffin/custom-requests/${id}/action`, actionPayload);
        return response.data;
    },
    cancelSubscriptionTiffin: async (id, actionPayload) => {
        const response = await authApi.patch(`provider/food/tiffin/subscriptions/${id}/action`, actionPayload);
        return response.data;
    },

    // ==========================================
    // HEALTHY PLANS INVENTORY (VENDOR/KITCHEN)
    // ==========================================

    getMasterHealthyPlans: async (params = {}) => {
        const response = await authApi.get('/provider/food/inventory/master-healthy-plans', {
            params,
        });
        return response.data;
    },

    syncHealthyPlans: async (payload) => {
        const response = await authApi.post('/provider/food/inventory/sync-healthy-plans', payload);
        return response.data;
    },

    toggleHealthyPlanAvailability: async (healthyPlanId) => {
        const response = await authApi.patch(
            `/provider/food/inventory/toggle-healthy-plan/${healthyPlanId}`
        );
        return response.data;
    },

    getVendorHealthyPlans: async (params = {}) => {
        const response = await authApi.get('/provider/food/inventory/healthy-plans', {
            params,
        });
        return response.data;
    },

    getSingleVendorHealthyPlan: async (id) => {
        const response = await authApi.get(`/provider/food/inventory/healthy-plans/${id}`);
        return response.data;
    },

    getUserHealthPlanOrders: async (params) => {
        // params (optional): { status, bookingType, search, page, limit }
        const response = await authApi.get('/provider/food/healthy-plans/orders', { params })
        return response.data
    },

    getUserHealthPlanOrderDetail: async (id) => {
        // id: Order Mongoose Object ID (_id) or custom bookingId (e.g. "ORD-FD-281415")
        const response = await authApi.get(`/provider/food/healthy-plans/orders/${id}`);
        return response.data;
    },

    cancelUserHealthPlan: async (id, cancelReason) => {
        const response = await authApi.patch(`/provider/food/healthy-plans/orders/${id}/cancel`, {
            cancelReason
        });
        return response.data;
    },

    //Manage Smoothies 

    // 1. Get Master Catalog Checklist
    getMasterDrinksCatalog: async (params = {}) => {
        const response = await authApi.get('/provider/food/drinks/master-catalog', { params });
        return response.data;
    },

    // 2. Sync / Multi-Select Drinks
    syncDrinksMenu: async (selectedDrinkIds) => {
        const response = await authApi.post('/provider/food/drinks/sync', { selectedDrinkIds });
        return response.data;
    },

    // 3. Toggle Single Drink Availability
    toggleDrinkAvailability: async (drinkId) => {
        const response = await authApi.patch(`/provider/food/drinks/toggle/${drinkId}`);
        return response.data;
    },

    // 4. Get Vendor's Own Drinks Inventory
    getMyDrinks: async (params = {}) => {
        const response = await authApi.get('/provider/food/drinks/my-drinks', { params });
        return response.data;
    },

    // 5. Get Single Drink Details with Ingredients
    getDrinkDetails: async (drinkId) => {
        const response = await authApi.get(`/provider/food/drinks/${drinkId}`);
        return response.data;
    },


};

export default FoodAPI;
