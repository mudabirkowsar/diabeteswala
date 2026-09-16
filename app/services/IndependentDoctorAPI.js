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
        const token = localStorage.getItem('independentDoctorToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

const IndependentDoctorAPI = {
    // ===================================================
    // --- INDEPENDENT DOCTOR AUTH & ONBOARDING APIS ----
    // ===================================================

    registerIndependentDoctor: async (registrationData) => {
        const response = await publicApi.post('/api/auth/doctor/register', registrationData);
        return response.data;
    },

    uploadIndependentDoctorKYCDocuments: async (formData) => {
        const response = await authApi.put('/api/auth/doctor/upload-docs', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    loginIndependentDoctor: async (credentials) => {
        const response = await publicApi.post('/api/auth/doctor/login', credentials);
        return response.data;
    },

    // ===================================================
    // --- INDEPENDENT DOCTOR PROFILE & FEES APIS -------
    // ===================================================

    // --- 1. Update Doctor Profile & 3-Way Consultation Fees ---
    updateDoctorProfileAndFees: async (formData) => {
        // formData: Must be an instance of FormData to handle 3-way fees (onlineFee, clinicFee, homeFee), 
        // availability switches, JSON-stringified arrays, and media uploads (profileImage, signatureImage)
        const response = await authApi.put('/api/auth/doctor/update-profile', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // --- 2. Get Doctor Profile (Self - Complete Profile & Fees) ---
    getDoctorSelfProfile: async () => {
        // Retrieves the logged-in doctor's live profile, consultation fees, active shifts, degrees, and documents
        const response = await authApi.get('/api/auth/doctor/profile');
        return response.data;
    },

    // ==========================================================
    // --- DOCTOR SLOTS, SHIFTS & PREMIUM PRICING APIS ----------
    // ==========================================================

    // --- 1. Set / Update Doctor Availability & Premium Slots ---
    setDoctorAvailability: async (availabilityData) => {
        // availabilityData: { startTime: "09:00", endTime: "20:00", slotDuration: 30, morningSlots: true, afternoonSlots: true, eveningSlots: true, offDays: ["Sunday"], blockedDates: [], premiumSlots: [{ time: "18:00", extraFee: 200 }] }
        const response = await authApi.post('/doctor/availability/set', availabilityData);
        return response.data;
    },

    // --- 2. Get Doctor Slots (Live Generated Slots with Premium Badges) ---
    getMyDoctorSlots: async () => {
        // Retrieves live categorized time slots (Morning/Afternoon/Evening) and attached extraFee parameters
        const response = await authApi.get('/doctor/availability/my-slots');
        return response.data;
    },

    // --- 3. Block Specific Doctor Slot (Break / Emergency) ---
    blockDoctorSlot: async (payload) => {
        // payload: { time: "13:30" } in 24h string format
        const response = await authApi.post('/doctor/availability/block', payload);
        return response.data;
    },

    // --- 4. Unblock Previously Blocked Slot ---
    unblockDoctorSlot: async (payload) => {
        // payload: { time: "13:30" } in 24h string format
        const response = await authApi.post('/doctor/availability/unblock', payload);
        return response.data;
    },

    // ===================================================
    // --- DOCTOR COUPON MANAGEMENT APIS ----------------
    // ===================================================

    // --- 1. Create Doctor Coupon ---
    createDoctorCoupon: async (couponData) => {
        // couponData: { couponName, discountPercentage, maxDiscount, expiryDate, minOrderAmount, maxUsagePerUser, startDate }
        const response = await authApi.post('/doctor/coupon/add', couponData);
        return response.data;
    },

    // --- 2. List Doctor Coupons (Own + Admin Global) ---
    getDoctorCouponsList: async () => {
        // Fetches doctor's own created coupons along with platform-wide admin global vouchers
        const response = await authApi.get('/doctor/coupon/list');
        return response.data;
    },

    // --- 3. Toggle Coupon Status (Active / Inactive) ---
    toggleDoctorCouponStatus: async (id) => {
        // id: Coupon unique ObjectID (_id) (e.g. "6aa8a1015949ee41047f9001")
        const response = await authApi.patch(`/doctor/coupon/toggle/${id}`);
        return response.data;
    },

    // --- 4. Update Doctor Coupon ---
    updateDoctorCoupon: async (id, couponData) => {
        // id: Coupon unique ObjectID (_id)
        // couponData: Partial object containing the fields needing update (e.g. { discountPercentage: 25, maxDiscount: 250 })
        const response = await authApi.put(`/doctor/coupon/update/${id}`, couponData);
        return response.data;
    },

    // --- 5. Delete Doctor Coupon ---
    deleteDoctorCoupon: async (id) => {
        // id: Coupon unique ObjectID (_id) to permanently remove from database
        const response = await authApi.delete(`/doctor/coupon/delete/${id}`);
        return response.data;
    }
}

export default IndependentDoctorAPI;