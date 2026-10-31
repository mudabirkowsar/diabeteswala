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
        const token = localStorage.getItem('labToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

const LabVendorAPI = {
    registerLab: async (labData) => {
        const response = await publicApi.post('api/auth/provider/register', labData);
        return response.data;
    },
    uploadDocuments: async (formData) => {
        const response = await authApi.put('/api/auth/provider/upload-docs/lab', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    loginLab: async (credentials) => {
        const response = await publicApi.post('api/auth/provider/login', credentials);
        return response.data;
    },

    getLabProfile: async () => {
        const response = await authApi.get('/api/auth/provider/profile');
        return response.data;
    },

    // =========================================================================
    // LAB VENDOR: COUPON MANAGEMENT
    // =========================================================================

    // --- 1. Create Lab Coupon ---
    labVendorCreateCoupon: async (data) => {
        // data: { 
        //   couponName: "LABHEALTH20", 
        //   discountPercentage: 20, 
        //   maxDiscount: 300, 
        //   expiryDate: "2026-12-31T23:59:59.000Z", 
        //   minOrderAmount: 799, 
        //   maxUsagePerUser: 2, 
        //   startDate: "2026-11-01T00:00:00.000Z" 
        // }
        const response = await authApi.post('/provider/coupons/add', data);
        return response.data;
    },

    // --- 2. Get All Lab Coupons (Including Global Admin Coupons) ---
    labVendorGetMyCoupons: async () => {
        const response = await authApi.get('/provider/coupons/list');
        return response.data;
    },

    // --- 3. Toggle Lab Coupon Status (Active / Inactive) ---
    labVendorToggleCoupon: async (id) => {
        // id: Coupon MongoDB Document _id
        const response = await authApi.patch(`/provider/coupons/toggle/${id}`);
        return response.data;
    },

    // --- 4. Update Lab Coupon ---
    labVendorUpdateCoupon: async (id, data) => {
        // id: Coupon MongoDB Document _id
        // data (all optional): { 
        //   couponName: "LABHEALTH20", 
        //   discountPercentage: 25, 
        //   maxDiscount: 400, 
        //   minOrderAmount: 999, 
        //   maxUsagePerUser: 2, 
        //   startDate: "...", 
        //   expiryDate: "2027-01-31T23:59:59.000Z", 
        //   isActive: true 
        // }
        const response = await authApi.put(`/provider/coupons/update/${id}`, data);
        return response.data;
    },

    // --- 5. Delete Lab Coupon ---
    labVendorDeleteCoupon: async (id) => {
        // id: Coupon MongoDB Document _id
        const response = await authApi.delete(`/provider/coupons/delete/${id}`);
        return response.data;
    },

    // =========================================================================
    // LAB VENDOR: PHLEBOTOMIST & DRIVER MANAGEMENT
    // =========================================================================

    // --- 1. Register Lab Phlebotomist / Driver (Multipart Form-Data) ---
    labVendorAddDriver: async (formData) => {
        // formData: FormData object containing:
        //   - Required: 'name', 'phone', 'username', 'password'
        //   - Optional: 'alternateNumber', 'vehicleType' ('Bike'|'Scooter'|'Van'), 'vehicleNumber', 'aadhaarNumber', 'address', 'city', 'state', 'country'
        //   - Files: 'profilePic', 'certificate', 'license', 'rcImage'
        const response = await authApi.post('/provider/driver/add', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    // --- 2. Get Lab Drivers & Phlebotomists (Paginated List) ---
    labVendorGetDriversList: async (params) => {
        // params (optional): { page: 1 }
        const response = await authApi.get('/provider/driver/list', { params });
        return response.data;
    },

    // --- 3. Search Lab Drivers & Phlebotomists ---
    labVendorSearchDrivers: async (data) => {
        // data: { query: "Rahul" }
        const response = await authApi.post('/provider/driver/search', data);
        return response.data;
    },

    // --- 4. Get Lab Driver Details By ID ---
    labVendorGetDriverDetailsById: async (id) => {
        // id: MongoDB Document _id
        const response = await authApi.get(`/provider/driver/details/${id}`);
        return response.data;
    },

    // --- 5. Update Lab Driver / Phlebotomist (Multipart Form-Data) ---
    labVendorUpdateDriver: async (id, formData) => {
        // id: MongoDB Document _id
        // formData: FormData object with optional updated text and replacement files ('profilePic', 'certificate', 'license', 'rcImage')
        const response = await authApi.put(`/provider/driver/update/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    // --- 6. Delete Lab Driver / Phlebotomist ---
    labVendorDeleteDriver: async (id) => {
        // id: MongoDB Document _id (Blocked if actively assigned to a home sample collection/pickup)
        const response = await authApi.delete(`/provider/driver/delete/${id}`);
        return response.data;
    },

    // --- 7. Toggle Lab Driver Status (Available / Busy / Offline) ---
    labVendorToggleDriverStatus: async (id, data) => {
        // id: MongoDB Document _id
        // data: { status: "Available" | "Busy" | "Offline" }
        const response = await authApi.patch(`/provider/driver/status/${id}`, data);
        return response.data;
    },

}

export default LabVendorAPI;