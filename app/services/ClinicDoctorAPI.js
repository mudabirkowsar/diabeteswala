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

    // 1. Submit a leave application (startDate must be tomorrow onwards; format: YYYY-MM-DD)
    // leaveData: { startDate: '2026-11-25', endDate: '2026-11-26', reason: 'Attending Conference' }
    applyClinicDoctorLeave: async (leaveData) => {
        const response = await authApi.post('/api/clinic/doctor-panel/leaves/apply', leaveData);
        return response.data;
    },

    // 2. Fetch all leave applications submitted by the logged-in clinic doctor (newest first)
    getClinicDoctorLeaves: async () => {
        const response = await authApi.get('/api/clinic/doctor-panel/leaves');
        return response.data;
    },

    // Get logged-in clinic doctor's OPD fees, cabin, shift schedule, weekly roster & live slot grid
    // date: Optional 'YYYY-MM-DD' string (defaults to today on the backend)
    getMyOpdScheduleAndSlots: async (date) => {
        const response = await authApi.get('/api/clinic/doctor-panel/opd-settings', {
            params: date ? { date } : undefined,
        });
        return response.data;
    },

    // 1. Get lightweight OPD appointments list for the logged-in doctor (supports status shortcuts, date & search)
    // params: { status: 'active' | 'history', date: 'YYYY-MM-DD' | 'today' | 'all', search: '...', page: 1, limit: 20 }
    getClinicDoctorOpdAppointments: async (params = {}) => {
        const response = await authApi.get('/api/clinic/doctor-panel/opd/appointments', {
            params,
        });
        return response.data;
    }, 

    // 2. Get complete 360° clinical, prescription, referral & vitals details of a single OPD visit
    // id: MongoDB _id or custom bookingId (e.g., 'DI-ORD-742794')
    getClinicDoctorOpdAppointmentDetails: async (id) => {
        const response = await authApi.get(`/api/clinic/doctor-panel/opd/appointments/${id}`);
        return response.data;
    },






    // 1. Get lightweight Emergency appointments list for the logged-in doctor (triage level, bed/ward, ambulance status)
    // params: { status: 'active' | 'history', date: 'YYYY-MM-DD' | 'today' | 'all', search: '...', page: 1, limit: 20 }
    getClinicDoctorEmergencyAppointments: async (params = {}) => {
        const response = await authApi.get('/api/clinic/doctor-panel/emergency/appointments', {
            params,
        });
        return response.data;
    },

    // 2. Get full 360° details of a single Emergency case (ambulance, observation bed, vitals, triage notes, prescriptions)
    // id: MongoDB _id or custom bookingId (e.g., 'CLN-EMG-901234')
    getClinicDoctorEmergencyAppointmentDetails: async (id) => {
        const response = await authApi.get(`/api/clinic/doctor-panel/emergency/appointments/${id}`);
        return response.data;
    },





    // 1. Get lightweight IPD (Admission) cases list for the logged-in doctor (ward, bed number, stay dates)
    // params: { status: 'active' | 'history', date: 'YYYY-MM-DD' | 'today' | 'all', search: '...', page: 1, limit: 20 }
    getClinicDoctorIpdAppointments: async (params = {}) => {
        const response = await authApi.get('/api/clinic/doctor-panel/ipd/appointments', {
            params,
        });
        return response.data;
    },

    // 2. Get full 360° details of a single IPD Admission case (ward/bed details, stay metrics, vitals, shift logs, billing)
    // id: MongoDB _id or custom bookingId (e.g., 'CLN-ADM-398989')
    getClinicDoctorIpdAppointmentDetails: async (id) => {
        const response = await authApi.get(`/api/clinic/doctor-panel/ipd/appointments/${id}`);
        return response.data;
    },

    




    // Step 1: Start OPD Consultation (Marks In-Progress & alerts next waiting token)
    startOpdConsultation: async (appointmentId) => {
        const response = await authApi.patch(`/api/clinic/doctor-panel/appointments/${appointmentId}/start-consultation`);
        return response.data;
    },

    // Step 2: Add or update patient vitals during OPD consultation
    // vitalsData: { bp: '120/80', pulse: '76', temp: '98.6 F', spo2: '99%', notes: '...' }
    updateOpdPatientVitals: async (appointmentId, vitalsData) => {
        const response = await authApi.patch(`/api/clinic/doctor-panel/appointments/${appointmentId}/vitals`, vitalsData);
        return response.data;
    },

    // Step 3: Browse/Search medicines from full database catalog (flags inClinicPharmacy: true)
    // params: { search: 'metformin', page: 1, limit: 50, all: 'false' }
    getOpdMedicinesCatalog: async (params = {}) => {
        const response = await authApi.get('/api/clinic/doctor-panel/appointments/medicines', {
            params,
        });
        return response.data;
    },

    // Step 4: Browse/Search all lab tests and packages from full master catalog & clinic lab
    // params: { search: 'hba1c', category: 'Pathology' }
    getOpdLabTestsCatalog: async (params = {}) => {
        const response = await authApi.get('/api/clinic/doctor-panel/appointments/lab-tests', {
            params,
        });
        return response.data;
    },

    // Step 5: Save structured OPD prescription (medicines, timing schedule, doctorSuggestions)
    // Supports JSON payload or FormData (if uploading prescriptionPdf)
    saveOpdPrescription: async (appointmentId, prescriptionData) => {
        const isFormData = prescriptionData instanceof FormData;
        const response = await authApi.post(
            `/api/clinic/doctor-panel/appointments/${appointmentId}/prescribe`,
            prescriptionData,
            {
                headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
            }
        );
        return response.data;
    },

    // Step 6: Send prescribed medicines directly to the attached Clinic Pharmacy
    // payload: { prescriptionId, notes: '...', medicines: [...] }
    sendOpdPrescriptionToPharmacy: async (appointmentId, payload) => {
        const response = await authApi.post(
            `/api/clinic/doctor-panel/appointments/${appointmentId}/send-to-pharmacy`,
            payload
        );
        return response.data;
    },

    // Step 7: Send advised lab tests/packages directly to the attached Clinic Lab
    // payload: { priority: 'Routine' | 'Urgent', notes: '...', tests: [{ testId, packageId, name, price, instructions }] }
    sendOpdReferralToLab: async (appointmentId, payload) => {
        const response = await authApi.post(
            `/api/clinic/doctor-panel/appointments/${appointmentId}/send-to-lab`,
            payload
        );
        return response.data;
    },

    // Step 9: Complete OPD Consultation (Closes shift duration & summons next token)
    // payload: { consultationNotes?: '...', advice?: '...' }
    completeOpdConsultation: async (appointmentId, payload = {}) => {
        const response = await authApi.patch(
            `/api/clinic/doctor-panel/appointments/${appointmentId}/complete-consultation`,
            payload
        );
        return response.data;
    },


















    // // 3. Get paginated appointments list
    // // params: { tab: 'all'|'opd'|'ipd'|'emergency'|'handover'|'bedside', status: 'active'|'history', date: 'YYYY-MM-DD'|'today'|'all', search: '...', page: 1, limit: 20 }
    // getClinicDoctorAppointments: async (params = {}) => {
    //     const response = await authApi.get('/api/clinic/doctor-panel/appointments', { params });
    //     return response.data;
    // },

    // // 4. Get full 360° appointment details by ID or bookingId
    // getClinicDoctorAppointmentDetails: async (id) => {
    //     const response = await authApi.get(`/api/clinic/doctor-panel/appointments/${id}`);
    //     return response.data;
    // },

    // // 5. Accept an assigned appointment
    // acceptClinicDoctorAppointment: async (id, notes = '') => {
    //     const response = await authApi.patch(`/api/clinic/doctor-panel/appointments/${id}/respond`, {
    //         action: 'Accept',
    //         notes,
    //     });
    //     return response.data;
    // },

    // // 6. Reject an assigned appointment (reason is mandatory)
    // rejectClinicDoctorAppointment: async (id, reason) => {
    //     const response = await authApi.patch(`/api/clinic/doctor-panel/appointments/${id}/respond`, {
    //         action: 'Reject',
    //         reason,
    //     });
    //     return response.data;
    // },


    // // 1. Start Consultation (moves status to 'In-Progress' when patient arrives)
    // startOPDConsultation: async (appointmentId) => {
    //     const response = await authApi.patch(`/api/clinic/doctor-panel/appointments/${appointmentId}/start-consultation`);
    //     return response.data;
    // },

    // // 2. Add / Record Patient Vitals
    // // vitalsData: { bp: '120/80', pulse: '76', temp: '98.6 F', spo2: '99%', notes: '...' }
    // recordPatientVitals: async (appointmentId, vitalsData) => {
    //     const response = await authApi.patch(`/api/clinic/doctor-panel/appointments/${appointmentId}/vitals`, vitalsData);
    //     return response.data;
    // },

    // // 3A. Search medicines from Clinic Pharmacy inventory & Master Medicines catalog
    // // params: { search: 'metformin', clinicOnly: 'false', page: 1, limit: 25 }
    // getOPDMedicines: async (params = {}) => {
    //     const response = await authApi.get('/api/clinic/doctor-panel/appointments/medicines', {
    //         params,
    //     });
    //     return response.data;
    // },

    // // 3B. Save Prescription for patient (Supports JSON or FormData for PDF attachments)
    // // prescriptionData: { chiefComplaints, diagnosis, medicines, advisedInvestigations, adviceGiven, specialInstructions, nextAppointment, markCompleted }
    // prescribePatient: async (appointmentId, prescriptionData) => {
    //     const isFormData = prescriptionData instanceof FormData;
    //     const response = await authApi.post(
    //         `/api/clinic/doctor-panel/appointments/${appointmentId}/prescribe`,
    //         prescriptionData,
    //         {
    //             headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    //         }
    //     );
    //     return response.data;
    // },

    // // 3C. Send prescribed medicines to the attached Clinic Pharmacy
    // // payload: { prescriptionId, notes: '...', medicines: [{ medicineId, name, dose, frequency, duration, quantity, instructions }] }
    // sendPrescriptionToPharmacy: async (appointmentId, payload) => {
    //     const response = await authApi.post(`/api/clinic/doctor-panel/appointments/${appointmentId}/send-to-pharmacy`, payload);
    //     return response.data;
    // },

    // // 4A. Get available, free (On Duty) clinic doctors for consultation/second opinion
    // // params: { appointmentId: '...', speciality: 'Endocrinology', search: 'Bajirao' }
    // getAvailableSecondaryDoctors: async (params = {}) => {
    //     const response = await authApi.get('/api/clinic/doctor-panel/appointments/available-doctors', {
    //         params,
    //     });
    //     return response.data;
    // },

    // // 4B. Add Secondary Doctor or request Second Opinion
    // // payload: { secondaryDoctorId, roleType: 'Secondary-Doctor' | 'Second-Opinion', requestReason, patientCondition, priority: 'Routine' | 'Urgent' | 'Most Urgent' }
    // addSecondaryDoctor: async (appointmentId, payload) => {
    //     const response = await authApi.post(`/api/clinic/doctor-panel/appointments/${appointmentId}/add-secondary-doctor`, payload);
    //     return response.data;
    // },

    // // 1. Get all active lab tests & packages (from Clinic Lab & Master Database)
    // // params: { search: 'hba1c', category: 'Pathology' }
    // getDoctorPanelLabTests: async (params = {}) => {
    //     const response = await authApi.get('/api/clinic/doctor-panel/appointments/lab-tests', {
    //         params,
    //     });
    //     return response.data;
    // },

    // // 2. Suggest & send selected lab tests/packages to the Clinic Lab
    // // payload: { priority: 'Routine' | 'Urgent' | 'Emergency', notes: '...', tests: [{ testId, packageId, name, price, instructions }] }
    // sendLabReferralToClinicLab: async (appointmentId, payload) => {
    //     const response = await authApi.post(
    //         `/api/clinic/doctor-panel/appointments/${appointmentId}/send-to-lab`,
    //         payload
    //     );
    //     return response.data;
    // },

    // // 3. Save Prescription for patient (Supports JSON or FormData if uploading prescriptionPdf)
    // // prescriptionData: { chiefComplaints, diagnosis, medicines, adviceGiven, specialInstructions, nextAppointment, markCompleted }
    // prescribePatient: async (appointmentId, prescriptionData) => {
    //     const isFormData = prescriptionData instanceof FormData;
    //     const response = await authApi.post(
    //         `/api/clinic/doctor-panel/appointments/${appointmentId}/prescribe`,
    //         prescriptionData,
    //         {
    //             headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    //         }
    //     );
    //     return response.data;
    // },
};

export default ClinicDoctorAPI;