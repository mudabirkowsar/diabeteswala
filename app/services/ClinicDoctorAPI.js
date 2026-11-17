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
        const token = localStorage.getItem('clinicDoctorToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});
const ClinicDoctorAPI = {
    // 1. Clinic Doctor Login (Authenticates and stores token as 'clinicDoctorToken')
    // credentials: { phone?: string, email?: string, identifier?: string, password: string, fcmToken?: string }
    clinicDoctorLogin: async (credentials) => {
        const response = await publicApi.post('/api/clinic/doctors/login', credentials);

        if (typeof window !== 'undefined' && response.data?.token) {
            localStorage.setItem('clinicDoctorToken', response.data.token);
        }

        return response.data;
    },

    // 2. Clinic Doctor Logout (Clears 'clinicDoctorToken' from localStorage)
    clinicDoctorLogout: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('clinicDoctorToken');
        }
    },
};
export default ClinicDoctorAPI;