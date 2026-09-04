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
        const token = localStorage.getItem('clinicToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

const ClinicAPI = {
    registerClinic: async (clinicData) => {
        const response = await publicApi.post('/api/auth/clinic/register', clinicData);
        return response.data;
    },
    uploadDocuments: async (formData) => {
        const response = await authApi.put('/api/auth/clinic/profile/update', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    loginClinic: async (credentials) => {
        const response = await publicApi.post('/api/auth/clinic/login', credentials);
        return response.data;
    },

    // ===================================================
    // --- CLINIC PROFILE & VERIFICATION APIS -----------
    // ===================================================
    getClinicProfile: async () => {
        const response = await authApi.get('/api/auth/clinic/profile');
        return response.data;
    },

    updateClinicProfile: async (formData) => {
        const response = await authApi.put('/api/auth/clinic/profile/update', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getClinicProfileUpdateStatus: async () => {
        const response = await authApi.get('/api/auth/clinic/profile/update-status');
        return response.data;
    },

    toggleClinicOnlineStatus: async (payload) => {
        const response = await authApi.patch('/api/auth/clinic/status/toggle', payload);
        return response.data;
    },

    // ==========================================================
    // --- CLINIC TIMINGS, FACILITIES & 24/7 SHIFT APIS ---------
    // ==========================================================
    getClinicTimingsAndFacilities: async () => {
        const response = await authApi.get('/api/clinic/timings');
        return response.data;
    },

    createClinicTimingsAndFacilities: async (configData) => {
        const response = await authApi.post('/api/clinic/timings/create', configData);
        return response.data;
    },

    updateClinicTimingsAndFacilities: async (configData) => {
        const response = await authApi.put('/api/clinic/timings/update', configData);
        return response.data;
    },

    resetClinicTimingsAndFacilities: async () => {
        const response = await authApi.delete('/api/clinic/timings/delete');
        return response.data;
    },

    // ===================================================
    // --- CLINIC DOCTOR MANAGEMENT & ONBOARDING APIS ----
    // ===================================================
    getClinicActiveSpecializations: async () => {
        const response = await publicApi.get('/admin/doctor-data/specializations');
        return response.data;
    },

    getClinicActiveQualifications: async () => {
        const response = await publicApi.get('/admin/doctor-data/qualifications');
        return response.data;
    },


    // ===================================================
    // --- CLINIC DOCTOR MANAGEMENT & ONBOARDING APIS ----
    // ===================================================

    // --- SECTION 1: Public Master Metadata (Dropdown APIs) ---

    // --- 1.1 Get Active Specializations (Dropdown Preload) ---
    getClinicActiveSpecializations: async () => {
        // Public API (No Token Required) - Populates Primary Specialization Select input
        const response = await publicApi.get('/admin/doctor-data/specializations');
        return response.data;
    },

    // --- 1.2 Get Active Qualifications (Dropdown Preload) ---
    getClinicActiveQualifications: async () => {
        // Public API (No Token Required) - Populates Educational Degrees Select input
        const response = await publicApi.get('/admin/doctor-data/qualifications');
        return response.data;
    },


    // --- SECTION 2: Clinic Doctor Management APIs ---

    // --- 2.1 Register New Clinic Doctor ---
    registerClinicDoctor: async (formData) => {
        // formData: Must be an instance of FormData to handle 3-Way Fees (clinicFee, onlineFee, homeFee), files, and JSON strings
        const response = await authApi.post('/api/clinic/doctors/add', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // --- 2.2 Get Clinic Doctor Directory ---
    getClinicDoctorsDirectory: async () => {
        // Fetches all doctors registered under the logged-in clinic's profile
        const response = await authApi.get('/api/clinic/doctors/my-doctors');
        return response.data;
    },

    // --- 2.3 Update Clinic Doctor Details & Documents ---
    updateClinicDoctor: async (id, formData) => {
        // id: Target Doctor unique ObjectID (_id)
        // formData: Must be an instance of FormData to handle optional file replacements and partial field updates
        const response = await authApi.put(`/api/clinic/doctors/update/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // --- 2.4 Toggle Doctor Duty Status ---
    toggleDoctorDutyStatus: async (id, statusPayload) => {
        // id: Target Doctor unique ObjectID (_id)
        // statusPayload: { dutyStatus: "On Duty" | "Off Duty" | "On Leave" | "Busy" }
        const response = await authApi.patch(`/api/clinic/doctors/${id}/duty-status`, statusPayload);
        return response.data;
    },

    // --- 2.5 Remove Doctor from Clinic (Unlink) ---
    removeDoctorFromClinic: async (id) => {
        // id: Target Doctor unique ObjectID (_id) to remove from the clinic directory
        const response = await authApi.delete(`/api/clinic/doctors/${id}`);
        return response.data;
    },


    // ===================================================
    // --- CLINIC WARD & BED MANAGEMENT APIS -------------
    // ===================================================

    createClinicWard: async (wardData) => {
        const response = await authApi.post('/api/clinic/wards/create', wardData);
        return response.data;
    },

    getClinicWardsList: async () => {
        const response = await authApi.get('/api/clinic/wards/list');
        return response.data;
    },

    getClinicWardBeds: async (wardId) => {
        const response = await authApi.get(`/api/clinic/wards/${wardId}/beds`);
        return response.data;
    },

    updateClinicWardBedsCapacity: async (bedsData) => {
        const response = await authApi.put('/api/clinic/wards/update-beds', bedsData);
        return response.data;
    },

    updateClinicWardInfo: async (wardId, wardData) => {
        const response = await authApi.put(`/api/clinic/wards/update/${wardId}`, wardData);
        return response.data;
    },

    updateClinicBedStatus: async (bedPayload) => {
        const response = await authApi.patch('/api/clinic/wards/bed/status', bedPayload);
        return response.data;
    },

    deleteClinicBed: async (bedId) => {
        const response = await authApi.delete(`/api/clinic/wards/bed/${bedId}`);
        return response.data;
    },

    deleteClinicWard: async (wardId) => {
        const response = await authApi.delete(`/api/clinic/wards/delete/${wardId}`);
        return response.data;
    }

}

export default ClinicAPI;