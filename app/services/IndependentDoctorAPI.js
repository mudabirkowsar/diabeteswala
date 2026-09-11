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

    // --- 1. Register Doctor (Step 1: Basic Info) ---
    registerIndependentDoctor: async (registrationData) => {
        // registrationData: { name, phone, password, email, countryCode, city, state, country }
        const response = await publicApi.post('/api/auth/doctor/register', registrationData);
        return response.data;
    },

    // --- 2. Upload Documents & KYC Verification (Step 2) ---
    uploadIndependentDoctorKYCDocuments: async (formData) => {
        // formData: Must be an instance of FormData containing text keys and binary files (profileImage, signatureImage, licenseDoc, etc.)
        const response = await authApi.put('/api/auth/doctor/upload-docs', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // --- 3. Login Doctor (Multi-State Authentication) ---
    loginIndependentDoctor: async (credentials) => {
        // credentials: { phone: "9876543210" (or email: "dr@example.com"), password: "..." }
        const response = await publicApi.post('/api/auth/doctor/login', credentials);
        return response.data;
    }
}

export default IndependentDoctorAPI;