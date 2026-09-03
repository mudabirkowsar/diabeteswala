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

    // ===================================================
    // --- ADMIN COD POLICY CONFIGURATION APIS -----------
    // ===================================================
    getAllVendorsCodConfig: async () => {
        const response = await authApi.get('/api/admin/policy-config/cod');
        return response.data;
    },
    toggleVendorCodStatus: async (payload) => {
        const response = await authApi.post('/api/admin/policy-config/cod/toggle', payload);
        return response.data;
    },

    // ==========================================================
    // --- ADMIN DELIVERY & LOGISTICS PRICING ENGINE APIS ------
    // ==========================================================
    saveAdminDeliveryCharges: async (chargesPayload) => {
        const response = await authApi.post('/provider/delivery-charges/admin/save', chargesPayload);
        return response.data;
    },
    getAdminDeliveryCharges: async (params) => {
        const response = await authApi.get('/provider/delivery-charges/admin/my-charges', { params });
        return response.data;
    },
    updateAdminGlobalDeliveryCharges: async (chargesPayload) => {
        const response = await authApi.put('/provider/delivery-charges/admin/update', chargesPayload);
        return response.data;
    },
    updateAdminDeliveryChargesById: async (id, chargesPayload) => {
        const response = await authApi.put(`/provider/delivery-charges/admin/update/${id}`, chargesPayload);
        return response.data;
    },

    // ===================================================
    // --- ADMIN PROFILE UPDATE APPROVAL APIS ------------
    // ===================================================

    getProfileUpdateRequests: async (params) => {
        const response = await authApi.get('/api/admin/profile-update', { params });
        return response.data;
    },

    getProfileUpdateRequestDetails: async (requestId) => {
        const response = await authApi.get(`/api/admin/profile-update/${requestId}`);
        return response.data;
    },

    processProfileUpdateRequest: async (requestId, actionPayload) => {
        const response = await authApi.post(`/api/admin/profile-update/${requestId}/action`, actionPayload);
        return response.data;
    },

    // ===================================================
    // --- DOCTOR MASTER DATA (SPECIALIZATION & QUAL) -----
    // ===================================================
    addSpecialization: async (specializationData) => {
        const response = await authApi.post('/admin/doctor-data/add-specialization', specializationData);
        return response.data;
    },

    getSpecializations: async () => {
        const response = await publicApi.get('/admin/doctor-data/specializations');
        return response.data;
    },

    updateSpecialization: async (id, specializationData) => {
        const response = await authApi.put(`/admin/doctor-data/update-specialization/${id}`, specializationData);
        return response.data;
    },

    deleteSpecialization: async (id) => {
        const response = await authApi.delete(`/admin/doctor-data/delete-specialization/${id}`);
        return response.data;
    },

    addQualification: async (qualificationData) => {
        const response = await authApi.post('/admin/doctor-data/add-qualification', qualificationData);
        return response.data;
    },

    getQualifications: async () => {
        const response = await publicApi.get('/admin/doctor-data/qualifications');
        return response.data;
    },

    updateQualification: async (id, qualificationData) => {
        const response = await authApi.put(`/admin/doctor-data/update-qualification/${id}`, qualificationData);
        return response.data;
    },

    deleteQualification: async (id) => {
        const response = await authApi.delete(`/admin/doctor-data/delete-qualification/${id}`);
        return response.data;
    },

    // ===================================================
    // --- ADMIN PEAK ORDER CHARGES APIS -----------------
    // ===================================================

    // --- 1. Get Selected Peak Order Charges (Dashboard Grid) ---
    getPeakCharges: async () => {
        // Fetches Breakfast, Lunch, Dinner, and Global active peak surcharges and toggle states
        const response = await authApi.get('/admin/food/peak-charges');
        return response.data;
    },

    // --- 2. Save / Update Slot-Wise Peak Order Charges ---
    savePeakCharges: async (chargesPayload) => {
        // chargesPayload: { isGlobalActive, breakfast: { charge, isActive }, lunch: { charge, isActive }, dinner: { charge, isActive } }
        const response = await authApi.post('/admin/food/peak-charges/save', chargesPayload);
        return response.data;
    },

    // --- 3. Instant Toggle Specific Slot Status (1-Click Switch) ---
    togglePeakChargeSlot: async (slotName) => {
        // slotName: 'breakfast' | 'lunch' | 'dinner' | 'global'
        const response = await authApi.patch(`/admin/food/peak-charges/toggle-slot/${slotName}`);
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
    },

    // ===================================================
    // --- FOOD COMBO OFFERS MANAGEMENT APIS -------------
    // =================================
    createComboOffer: async (comboData) => {
        // comboData: { name, description, comboPrice, spicyLevel, isPopular, isRecommended, dishes: [{ foodServiceId, quantity }] }
        const response = await authApi.post('/admin/food/manage/combo/add', comboData);
        return response.data;
    },

    updateComboDetails: async (id, comboData) => {
        const response = await authApi.put(`/admin/food/manage/combo/update/${id}`, comboData);
        return response.data;
    },

    deleteComboPackage: async (id) => {
        const response = await authApi.delete(`/admin/food/manage/combo/delete/${id}`);
        return response.data;
    },

    toggleComboStatus: async (id) => {
        const response = await authApi.patch(`/admin/food/manage/combo/toggle-status/${id}`);
        return response.data;
    },

    getAllComboOffers: async (params) => {
        const response = await publicApi.get('/admin/food/manage/combo/get', { params });
        return response.data;
    },

    getSingleComboDetails: async (id) => {
        const response = await publicApi.get(`/admin/food/manage/combo/get/${id}`);
        return response.data;
    },

    // ===================================================
    // --- MAIN PAGE BANNERS MANAGEMENT APIS -------------
    // ===================================================

    // --- 1. Create New Hero Banner ---
    createHeroBanner: async (formData) => {
        const response = await authApi.post('/admin/food/manage/banner/add', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // --- 2. Update Hero Banner Details ---
    updateHeroBannerDetails: async (id, payload, isMultipart = false) => {
        const headers = isMultipart ? { 'Content-Type': 'multipart/form-data' } : {};
        const response = await authApi.put(`/admin/food/manage/banner/update/${id}`, payload, { headers });
        return response.data;
    },

    // --- 3. Remove/Delete Banner Configuration ---
    deleteBannerConfig: async (id) => {
        const response = await authApi.delete(`/admin/food/manage/banner/delete/${id}`);
        return response.data;
    },

    // --- 4. Toggle Active Status Switch (Live Active Status) ---
    toggleBannerStatus: async (id) => {
        const response = await authApi.patch(`/admin/food/manage/banner/toggle-status/${id}`);
        return response.data;
    },

    // --- 5. Get All Banners List ---
    getAllBannersList: async (params) => {
        const response = await publicApi.get('/admin/food/manage/banner/get', { params });
        return response.data;
    },

    // ===================================================
    // --- ADMIN COUPONS & PROMOTIONS APIS ---------------
    // ===================================================
    createAdminCoupon: async (couponData) => {
        const response = await authApi.post('/provider/coupons/admin/add', couponData);
        return response.data;
    },

    getAdminCouponsList: async () => {
        const response = await authApi.get('/provider/coupons/admin/list');
        return response.data;
    },

    toggleAdminCouponStatus: async (id) => {
        const response = await authApi.patch(`/provider/coupons/admin/toggle/${id}`);
        return response.data;
    },

    updateAdminCoupon: async (id, couponData) => {
        const response = await authApi.put(`/provider/coupons/admin/update/${id}`, couponData);
        return response.data;
    },

    deleteAdminCoupon: async (id) => {
        const response = await authApi.delete(`/provider/coupons/admin/delete/${id}`);
        return response.data;
    },

    // ===================================================
    // --- ADMIN TIFFIN SUBSCRIPTION PLANS APIS ---------
    // ===================================================

    // --- 1. Get Catalog Pool for Modal Tabs (Dishes + Combos) ---
    getTiffinCatalogPool: async (params) => {
        // params (optional): { search: "Quinoa" }
        const response = await authApi.get('/admin/food/tiffin/plans/catalog-pool', { params });
        return response.data;
    },

    // --- 2. Create Tiffin Subscription Plan Tier ---
    createTiffinPlanTier: async (planData) => {
        // planData: { name, planCycle, mealsPerDay, price, permittedSlots, slotDishes, description }
        const response = await authApi.post('/admin/food/tiffin/plans/add', planData);
        return response.data;
    },

    // --- 3. Get All Tiffin Subscription Plans (Grid View) ---
    getTiffinPlansList: async () => {
        const response = await authApi.get('/admin/food/tiffin/plans/get');
        return response.data;
    },

    // --- 4. Get Single Plan Full Details By ID ---
    getTiffinPlanDetails: async (id) => {
        // id: Document Mongoose Object ID (_id) or custom planId (e.g. PLN-105)
        const response = await authApi.get(`/admin/food/tiffin/plans/get/${id}`);
        return response.data;
    },

    // --- 5. Update Subscription Plan ---
    updateTiffinPlan: async (id, planData) => {
        // id: Document Mongoose Object ID (_id) or custom planId
        // planData: Partial object containing fields to update (e.g. price, description, etc.)
        const response = await authApi.put(`/admin/food/tiffin/plans/update/${id}`, planData);
        return response.data;
    },

    // --- 6. Delete Subscription Plan ---
    deleteTiffinPlan: async (id) => {
        // id: Document Mongoose Object ID (_id) or custom planId to permanently delete
        const response = await authApi.delete(`/admin/food/tiffin/plans/delete/${id}`);
        return response.data;
    },

    // --- 7. Toggle Plan Active / Inactive Status ---
    toggleTiffinPlanStatus: async (id) => {
        // id: Document Mongoose Object ID (_id) or custom planId
        const response = await authApi.patch(`/admin/food/tiffin/plans/toggle-status/${id}`);
        return response.data;
    },


    // ===================================================
    // --- NON-FOOD ADD-ONS MANAGEMENT APIS -------------
    // ===================================================
    getAvailableAddons: async () => {
        const response = await publicApi.get('/api/food/checkout/addons');
        return response.data;
    },

    getAddonDetails: async (id) => {
        const response = await publicApi.get(`/api/food/checkout/addons/${id}`);
        return response.data;
    },

    createAddon: async (addonData) => {
        const response = await authApi.post('/api/food/checkout/addons/add', addonData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    updateAddonDetails: async (id, addonData) => {
        const response = await authApi.put(`/api/food/checkout/addons/update/${id}`, addonData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    deleteAddon: async (id) => {
        const response = await authApi.delete(`/api/food/checkout/addons/delete/${id}`);
        return response.data;
    },

}

export default AdminAPI;