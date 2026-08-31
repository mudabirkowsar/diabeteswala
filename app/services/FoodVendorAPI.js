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

    // --- 1. Get Master Tiffin Plans Checklist (Vendor Inventory View) ---
    getVendorMasterTiffinPlans: async () => {
        // Returns the list of admin-created tiffin plans with vendor-specific available statuses
        const response = await authApi.get('/provider/food/inventory/master-plans');
        return response.data;
    },

    // --- 2. Unified Sync Tiffin Plans (Multi-Select Sync API) ---
    syncVendorTiffinPlans: async (syncPayload) => {
        // syncPayload: { selectedPlanIds: ["6a..."], customPricing: { "6a...": 1850 } }
        const response = await authApi.post('/provider/food/inventory/sync-plans', syncPayload);
        return response.data;
    },

    // --- 3. Instant Single Tiffin Plan Toggle Switch (One-Click Toggle) ---
    toggleVendorTiffinPlan: async (planId) => {
        // planId: Target Tiffin Plan Mongoose Object ID (_id) (e.g. "6a8ed141f9ce2083c5626f11")
        const response = await authApi.patch(`/provider/food/inventory/toggle-plan/${planId}`);
        return response.data;
    },

    // ===================================================
    // --- VENDOR FOOD ORDERS & KITCHEN CONSOLE APIS ----
    // ===================================================

    // --- 1. Fetch Kitchen Orders (Filtered, Searched & Paginated) ---
    getKitchenOrders: async (params) => {
        // params (optional): { status, bookingType, search, page, limit }
        const response = await authApi.get('/provider/food/orders/my-orders', { params });
        return response.data;
    },

    // --- 2. Get Single Kitchen Order Full Details By ID ---
    getKitchenOrderDetail: async (id) => {
        // id: Order Mongoose Object ID (_id) or custom bookingId (e.g. "ORD-FD-281415")
        const response = await authApi.get(`/provider/food/orders/${id}`);
        return response.data;
    },

    // --- 3. Update Order Fulfillment Status (Kitchen State Machine) ---
    updateKitchenOrderStatus: async (id, statusPayload) => {
        // id: Order Mongoose Object ID (_id) or custom bookingId
        // statusPayload: { status: 'Preparing' | 'Ready' | 'Ready for Delivery' | 'Cancelled', cancelReason }
        const response = await authApi.patch(`/provider/food/orders/${id}/status`, statusPayload);
        return response.data;
    }


};

export default FoodAPI;
