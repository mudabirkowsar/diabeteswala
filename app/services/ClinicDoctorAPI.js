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
    // 1. Clinic Doctor Login (stores token as 'clinicDoctorToken')
    clinicDoctorLogin: async (credentials) => {
        const response = await publicApi.post('/api/clinic/doctors/login', credentials);
        if (typeof window !== 'undefined' && response.data?.token) {
            localStorage.setItem('clinicDoctorToken', response.data.token);
        }
        return response.data;
    },

    // 2. Clinic Doctor Logout
    clinicDoctorLogout: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('clinicDoctorToken');
        }
    },

    // 3. Get paginated appointments list
    // params: { tab: 'all'|'opd'|'ipd'|'emergency'|'handover'|'bedside', status: 'active'|'history', date: 'YYYY-MM-DD'|'today'|'all', search: '...', page: 1, limit: 20 }
    getClinicDoctorAppointments: async (params = {}) => {
        const response = await authApi.get('/api/clinic/doctor-panel/appointments', { params });
        return response.data;
    },

    // 4. Get full 360° appointment details by ID or bookingId
    getClinicDoctorAppointmentDetails: async (id) => {
        const response = await authApi.get(`/api/clinic/doctor-panel/appointments/${id}`);
        return response.data;
    },

    // 5. Accept an assigned appointment
    acceptClinicDoctorAppointment: async (id, notes = '') => {
        const response = await authApi.patch(`/api/clinic/doctor-panel/appointments/${id}/respond`, {
            action: 'Accept',
            notes,
        });
        return response.data;
    },

    // 6. Reject an assigned appointment (reason is mandatory)
    rejectClinicDoctorAppointment: async (id, reason) => {
        const response = await authApi.patch(`/api/clinic/doctor-panel/appointments/${id}/respond`, {
            action: 'Reject',
            reason,
        });
        return response.data;
    },
};

export default ClinicDoctorAPI;