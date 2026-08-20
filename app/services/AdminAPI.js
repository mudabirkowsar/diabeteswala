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
    getFoodApprovalList: async (params) => {
        const response = await authApi.get('/api/admin/approval/food', { params });
        return response.data;
    },

    approveFoodPartner: async (id) => {
        const response = await authApi.patch(`/api/admin/approval/food/approve/${id}`);
        return response.data;
    },

    rejectFoodPartner: async (id, payload) => {
        const response = await authApi.patch(`/api/admin/approval/food/reject/${id}`, payload);
        return response.data;
    },
    toggleFoodPartnerActive: async (id) => {
        const response = await authApi.patch(`/admin/food/toggle-active/${id}`);
        return response.data;
    },

    addFoodCategory: async (categoryData) => {
        const response = await authApi.post('/admin/food/category/add', categoryData);
        return response.data;
    },

    updateFoodCategory: async (id, categoryData) => {
        const response = await authApi.put(`/admin/food/category/update/${id}`, categoryData);
        return response.data;
    },

    deleteFoodCategory: async (id) => {
        const response = await authApi.delete(`/admin/food/category/delete/${id}`);
        return response.data;
    },

    getFoodCategories: async () => {
        const response = await publicApi.get('/admin/food/category/get');
        return response.data;
    },
    // ===================================================
    // --- FOOD ITEMS & MENU MANAGEMENT APIS -------------
    // ===================================================
    addFoodItem: async (formData) => {
        const response = await authApi.post('/admin/food/manage/add', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    updateFoodItem: async (id, payload, isMultipart = false) => {
        const headers = isMultipart ? { 'Content-Type': 'multipart/form-data' } : {};
        const response = await authApi.put(`/admin/food/manage/update/${id}`, payload, { headers });
        return response.data;
    },

    deleteFoodItem: async (id) => {
        const response = await authApi.delete(`/admin/food/manage/delete/${id}`);
        return response.data;
    },

    toggleFoodStatus: async (id) => {
        const response = await authApi.patch(`/admin/food/manage/toggle-status/${id}`);
        return response.data;
    },

    getAllFoodItems: async (params) => {
        const response = await publicApi.get('/admin/food/manage/get', { params });
        return response.data;
    },

    getSingleFoodItem: async (id) => {
        const response = await publicApi.get(`/admin/food/manage/get/${id}`);
        return response.data;
    },

    // ===================================================
    // --- TODAY'S SPECIALS & WEEKLY PLANNER APIS --------
    // =============================================
    getTodaysSpecials: async () => {
        const response = await publicApi.get('/admin/food/special/today');
        return response.data;
    },

    publishTodaysSpecials: async (payload) => {
        const response = await authApi.post('/admin/food/special/today/publish', payload);
        return response.data;
    },

    removeTodaysSpecial: async (id) => {
        const response = await authApi.delete(`/admin/food/special/today/delete/${id}`);
        return response.data;
    },

    getWeeklyMenuTemplate: async () => {
        const response = await publicApi.get('/admin/food/special/weekly');
        return response.data;
    },

    updateWeeklyDayMenu: async (day, payload) => {
        const response = await authApi.put(`/admin/food/special/weekly/update/${day}`, payload);
        return response.data;
    }

}

export default AdminAPI;