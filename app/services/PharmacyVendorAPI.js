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

    getPharmacyProfile: async () => {
        const response = await authApi.get('/api/auth/provider/profile');
        return response.data;
    },

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

}

export default PharmacyVendorAPI;