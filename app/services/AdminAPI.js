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
    getLabsApprovalList: async (params) => {
        const response = await authApi.get('/api/admin/approval/lab', { params });
        return response.data;
    },

    approveLabProfile: async (id) => {
        const response = await authApi.patch(`/api/admin/approval/lab/approve/${id}`);
        return response.data;
    },

    rejectLabProfile: async (id, payload) => {
        const response = await authApi.patch(`/api/admin/approval/lab/reject/${id}`, payload);
        return response.data;
    },

    toggleLabActive: async (id) => {
        const response = await authApi.patch(`/admin/lab/toggle-active/${id}`);
        return response.data;
    },

    // ==========================================
    // --- PHARMACY APPROVAL WORKFLOW APIS -----
    // ==========================================
    getPharmaciesList: async (params) => {
        const response = await authApi.get('/api/admin/approval/pharmacy', { params });
        return response.data;
    },

    approvePharmacy: async (id) => {
        const response = await authApi.patch(`/api/admin/approval/pharmacy/approve/${id}`);
        return response.data;
    },
 
    rejectPharmacy: async (id, payload) => {
        const response = await authApi.patch(`/api/admin/approval/pharmacy/reject/${id}`, payload);
        return response.data;
    },

    togglePharmacyActive: async (id) => {
        const response = await authApi.patch(`/admin/pharmacy/status/active-inactive/${id}`);
        return response.data;
    },

    // ==========================================
    // --- MEDICINE MANAGEMENT APIS -------------
    // ==========================================

    bulkUploadMedicines: async (formData) => {
        const response = await authApi.post('/admin/pharmacy/medicine/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    createMedicine: async (medicineData) => {
        const response = await authApi.post('/admin/pharmacy/medicine/create', medicineData);
        return response.data;
    },

    getMedicinesList: async (params) => {
        const response = await authApi.get('/admin/pharmacy/medicine/list', { params });
        return response.data;
    },

    getMedicineDetails: async (id) => {
        const response = await authApi.get(`/admin/pharmacy/medicine/details/${id}`);
        return response.data;
    },

    searchMedicines: async (searchData) => {
        const response = await authApi.post('/admin/pharmacy/medicine/search', searchData);
        return response.data;
    },

    updateMedicine: async (id, medicineData) => {
        const response = await authApi.put(`/admin/pharmacy/medicine/update/${id}`, medicineData);
        return response.data;
    },

    deleteMedicine: async (id) => {
        const response = await authApi.delete(`/admin/pharmacy/medicine/delete/${id}`);
        return response.data;
    },

    // ============================================
    // --- FOOD PARTNER APPROVAL WORKFLOW APIS ----
    // ============================================

    // --- 1. Get Food Partners List (Paginated & Filtered) ---
    getFoodApprovalList: async (params) => {
        // params: { status, page, limit, search, country, state, city }
        const response = await authApi.get('/api/admin/approval/food', { params });
        return response.data;
    },

    // --- 2. Approve Food Partner Profile ---
    approveFoodPartner: async (id) => {
        // id: The MongoDB Object ID (_id) of the food document to approve
        const response = await authApi.patch(`/api/admin/approval/food/approve/${id}`);
        return response.data;
    },

    // --- 3. Reject Food Partner Profile ---
    rejectFoodPartner: async (id, payload) => {
        // id: The MongoDB Object ID (_id) of the food document to reject
        // payload: { reason: "The uploaded FSSAI registration certificate is..." }
        const response = await authApi.patch(`/api/admin/approval/food/reject/${id}`, payload);
        return response.data;
    },
    toggleFoodPartnerActive: async (id) => {
        const response = await authApi.patch(`/admin/food/toggle-active/${id}`);
        return response.data;
    },

    // ===================================================
    // --- FOOD CATEGORY MANAGEMENT APIS -----------------
    // ===================================================

    // --- 1. Add Food Category ---
    addFoodCategory: async (categoryData) => {
        // categoryData: { foodCategory: "Low GI Rice Bowls", foodEffectCategory: "Diabetes Care" }
        const response = await authApi.post('/admin/food/category/add', categoryData);
        return response.data;
    },

    // --- 2. Update/Rename Category Details ---
    updateFoodCategory: async (id, categoryData) => {
        // id: Mongoose ObjectID of the Category to update
        // categoryData: Partial object containing the fields needing update
        const response = await authApi.put(`/admin/food/category/update/${id}`, categoryData);
        return response.data;
    },

    // --- 3. Delete Category ---
    deleteFoodCategory: async (id) => {
        // id: Mongoose ObjectID of the Category to delete
        const response = await authApi.delete(`/admin/food/category/delete/${id}`);
        return response.data;
    },

    // --- 4. Get Categories List (Public) ---
    getFoodCategories: async () => {
        // Public endpoint (No Authorization Header Check required)
        const response = await publicApi.get('/admin/food/category/get');
        return response.data;
    }



}

export default AdminAPI;