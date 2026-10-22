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
        const token = localStorage.getItem('pharmacyToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

const PharmacyVendorAPI = {
    registerPharmacy: async (pharmacyData) => {
        const response = await publicApi.post('/api/auth/provider/register', pharmacyData);
        return response.data;
    },

    uploadDocuments: async (formData) => {
        const response = await authApi.put('/api/auth/provider/upload-docs/pharmacy', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    loginPharmacy: async (credentials) => {
        const response = await publicApi.post('/api/auth/provider/login', credentials);
        return response.data;
    },

    // --- 1. Get Pharmacy Provider Profile ---
    getPharmacyProfile: async () => {
        const response = await authApi.get('/provider/pharmacy/profile');
        return response.data;
    },

    // --- 2. Update Pharmacy Provider Profile (Multipart Form-Data) ---
    updatePharmacyProfile: async (formData) => {
        // formData: FormData object containing optional text fields (name, about, address, city, state, country, lat, lng, cinNumber, gstNumber, tanNumber, panNumber, drugLicenseNumber, foodLicenseNumber, issuingAuthority, drugLicenseType, isHomeDeliveryAvailable, isRapidServiceAvailable, isInsuranceAccepted, acceptedInsurances, is24x7) and file attachments ('profileImage', 'signatureImage', 'drugLicenses', 'pharmacyImages')
        const response = await authApi.put('/provider/pharmacy/profile/update', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    //manage coupon
    // --- 1. Create Provider Coupon ---
    createProviderCoupon: async (data) => {
        // data: { couponName: "PHARMA15", discountPercentage: 15, maxDiscount: 200, minOrderAmount: 500, maxUsagePerUser: 2, startDate: "2026-11-01", expiryDate: "2026-12-31" }
        const response = await authApi.post('/provider/coupons/add', data);
        return response.data;
    },

    // --- 2. Get All Provider Coupons (Registry) ---
    getProviderCouponsList: async () => {
        const response = await authApi.get('/provider/coupons/list');
        return response.data;
    },

    // --- 3. Toggle Provider Coupon Active/Inactive Status ---
    toggleProviderCouponStatus: async (id) => {
        // id: Coupon unique ObjectID (_id)
        const response = await authApi.patch(`/provider/coupons/toggle/${id}`);
        return response.data;
    },

    // --- 4. Update Provider Coupon ---
    updateProviderCoupon: async (id, data) => {
        // id: Coupon unique ObjectID (_id)
        // data (all optional): { discountPercentage: 20, maxDiscount: 250, minOrderAmount: 600, expiryDate: "2027-01-31", couponName: "...", maxUsagePerUser: 2, startDate: "...", isActive: true }
        const response = await authApi.put(`/provider/coupons/update/${id}`, data);
        return response.data;
    },

    // --- 5. Delete Provider Coupon ---
    deleteProviderCoupon: async (id) => {
        // id: Coupon unique ObjectID (_id)
        const response = await authApi.delete(`/provider/coupons/delete/${id}`);
        return response.data;
    },

    // --- 6. Get Coupon Vendor Types Enum (Public Helper) ---
    getProviderCouponVendorTypes: async () => {
        const response = await publicApi.get('/provider/coupons/enum-types');
        return response.data;
    },

    
    //manage timing 
    // --- 1. Set / Configure Pharmacy Delivery Slots & Availability ---
    setPharmacyAvailabilitySlots: async (data) => {
        // data: { startTime: "10:00", endTime: "22:00", slotDuration: 60, morningSlots: true, afternoonSlots: true, eveningSlots: true, premiumSlots: [{ time: "21:00", extraFee: 40 }], unavailableSlots: ["14:00"], offDays: ["Sunday"], blockedDates: ["2026-10-25"] }
        const response = await authApi.post('/provider/availability/set-slots', data);
        return response.data;
    },

    // --- 2. Get My Pharmacy Slots Configuration & Live Slots ---
    getMyPharmacySlots: async () => {
        const response = await authApi.get('/provider/availability/my-slots');
        return response.data;
    },

    // --- 3. Block / Hide Specific Pharmacy Delivery Slot ---
    blockPharmacySlot: async (data) => {
        // data: { time: "14:00" }
        const response = await authApi.post('/provider/availability/block-slot', data);
        return response.data;
    },

    // --- 4. Unblock / Show Previously Blocked Pharmacy Delivery Slot ---
    unblockPharmacySlot: async (data) => {
        // data: { time: "14:00" }
        const response = await authApi.post('/provider/availability/unblock-slot', data);
        return response.data;
    },

    // manage medicines 
    // --- 1. Search Master Medicines (Global Catalog) ---
    searchMasterMedicines: async (params) => {
        // params (optional): { query: 'dolo', page: 1, limit: 10 }
        const response = await authApi.get('/provider/pharmacy/inventory/getMaster', { params });
        return response.data;
    },

    // --- 2. Get Master Medicine Full Details by ID ---
    getMasterMedicineDetailsById: async (id) => {
        // id: Master medicine unique ObjectID (_id)
        const response = await authApi.get(`/provider/pharmacy/inventory/getMaster/details/${id}`);
        return response.data;
    },

    // --- 3. Add Medicine Batch to Store Inventory (With Compliance & Return/Replace Rules) ---
    addMedicineBatchToPharmacyInventory: async (data) => {
        // data: { medicineId: "670a1e204b1234ef56789012", batch_number: "DL-2026-B1", mrp: 33.56, vendor_price: 29.50, stock_quantity: 100, expiry_date: "2028-12-31", manufacturing_date: "2026-05-10", hsn_number: "30049099", packaging: "strip of 15 tablets", isReturnAllowed: true, isReplacementAllowed: true }
        const response = await authApi.post('/provider/pharmacy/inventory/add', data);
        return response.data;
    },

    // --- 4. Get My Pharmacy Inventory (All Batches with Master MRP) ---
    getMyPharmacyInventoryList: async () => {
        const response = await authApi.get('/provider/pharmacy/inventory/my-list');
        return response.data;
    },

    // --- 5. Get My Non-Prescription Inventory (OTC Items Only) ---
    getMyPharmacyOtcInventoryList: async () => {
        const response = await authApi.get('/provider/pharmacy/inventory/my-otc-list');
        return response.data;
    },

    // --- 6. Update Inventory Item (Batch, Stock, MRP & Toggles) ---
    updatePharmacyInventoryItem: async (id, data) => {
        // id: MedicineInventory unique ObjectID (_id)
        // data (all optional): { vendor_price: 28.00, stock_quantity: 75, mrp: 33.56, batch_number: "DL-2026-B2", expiry_date: "2029-01-31", manufacturing_date: "2026-06-01", hsn_number: "30049099", isReturnAllowed: false, isReplacementAllowed: true }
        const response = await authApi.put(`/provider/pharmacy/inventory/update/${id}`, data);
        return response.data;
    },

    // --- 7. Delete Inventory Item (With Combo Offers Cascade Cleanup) ---
    deletePharmacyInventoryItem: async (id) => {
        // id: MedicineInventory unique ObjectID (_id)
        const response = await authApi.delete(`/provider/pharmacy/inventory/delete/${id}`);
        return response.data;
    },

    // --- 8. Request New Medicine Add to Master Database ---
    requestNewMedicineToMaster: async (data) => {
        // data: { name: "Crocin 650 Advance Tablet", manufacturers: "GlaxoSmithKline Pharmaceuticals Ltd", salt_composition: "Paracetamol (650mg)", packaging: "strip of 15 tablets", mrp: "35.00", best_price: "31.50", description: "Used to relieve pain and reduce fever.", prescription_required: "No", image_url: ["https://example.com/crocin.jpg"] }
        const response = await authApi.post('/provider/pharmacy/inventory/request-add', data);
        return response.data;
    },

    // --- 9. Request Admin to Increase Master Reference MRP ---
    requestMasterMedicineMrpIncrease: async (data) => {
        // data: { medicineId: "670a1e204b1234ef56789012", proposedMrp: 38.50, reason: "Manufacturer released updated batch with higher printed MRP." }
        const response = await authApi.post('/provider/pharmacy/inventory/request-mrp-increase', data);
        return response.data;
    },

    // --- 10. Request Admin to Add New HSN Code ---
    requestNewHsnCode: async (data) => {
        // data: { hsnCode: "30049080", description: "Antidiabetic herbal formulations", suggestedTaxPercent: 12, reason: "New Ayurvedic diabetes management syrup batch arrived." }
        const response = await authApi.post('/provider/pharmacy/inventory/hsn-request/create', data);
        return response.data;
    },

    getAllActiveHsnCodes: async () => {
        const response = await publicApi.get('/admin/pharmacy/tax-config/hsn/list');
        return response.data;
    },

    // --- 11. Get My Submitted HSN Requests History ---
    getMyHsnRequestsHistory: async () => {
        const response = await authApi.get('/provider/pharmacy/inventory/hsn-request/my-requests');
        return response.data;
    },



}

export default PharmacyVendorAPI;