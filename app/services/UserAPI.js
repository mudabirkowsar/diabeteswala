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
        const token = localStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

const UserAPI = {
    registerUser: async (userData) => {
        const response = await publicApi.post('/api/auth/user/register', userData);
        return response.data;
    },

    loginUser: async (credentials) => {
        const response = await publicApi.post('/api/auth/user/login', credentials);
        return response.data;
    },

    // ===================================================
    // --- USER PASSWORD STATUS & SETUP APIS ------------
    // ===================================================
    checkUserPasswordStatus: async (payload) => {
        const response = await publicApi.post('/api/auth/user/check-password-status', payload);
        return response.data;
    },

    setUserInitialPassword: async (payload) => {
        const response = await publicApi.post('/api/auth/user/set-password', payload);
        return response.data;
    },

    getUserProfile: async () => {
        const response = await authApi.get('/api/auth/user/profile');
        return response.data;
    },
    // --- 1. Get User Profile Card Details ---
    getUserProfileCard: async () => {
        const response = await authApi.get('/api/auth/user/profile-card');
        return response.data;
    },

    // --- 1. Get User Profile Completion Status (Checklist & Percentage) ---
    getUserProfileCompletionStatus: async () => {
        const response = await authApi.get('/api/auth/user/profile-completion');
        return response.data;
    },

    updateUserProfile: async (formData) => {
        const response = await authApi.put('/api/auth/user/update', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    updateInsurance: async (formData) => {
        const response = await authApi.put('/api/auth/user/update-insurance', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    getMyInsurance: async () => {
        const response = await authApi.get('/api/auth/user/my-insurance');
        return response.data;
    },

    updateFamilyHistory: async (historyData) => {
        const response = await authApi.put('/api/auth/user/update-family-history', historyData);
        return response.data;
    },

    getFamilyHistory: async () => {
        const response = await authApi.get('/api/auth/user/get-family-history');
        return response.data;
    },

    updateMedicalConditions: async (conditionData) => {
        const response = await authApi.put('/api/auth/user/update-medical-conditions', conditionData);
        return response.data;
    },

    //User Address
    addAddress: async (addressData) => {
        const response = await authApi.post('/api/auth/user/add-address', addressData);
        return response.data;
    },

    getAddressList: async () => {
        const response = await authApi.get('/api/auth/user/addresses');
        return response.data;
    },

    setDefaultAddress: async (addressId) => {
        const response = await authApi.patch(`/api/auth/user/set-default-address/${addressId}`);
        return response.data;
    },

    removeAddress: async (itemId) => {
        const response = await authApi.delete(`/api/auth/user/remove-address/${itemId}`);
        return response.data;
    },
    updateAddress: async (itemId, updateData) => {
        const response = await authApi.put(`/api/auth/user/update-address/${itemId}`, updateData);
        return response.data;
    },

    //User Emergency Contacts
    addEmergencyContact: async (contactData) => {
        const response = await authApi.post('/api/auth/user/add-emergency', contactData);
        return response.data;
    },

    getEmergencyContactsList: async () => {
        const response = await authApi.get('/api/auth/user/emergency-contacts');
        return response.data;
    },

    removeEmergencyContact: async (itemId) => {
        const response = await authApi.delete(`/api/auth/user/remove-emergency/${itemId}`);
        return response.data;
    },

    //Family Members
    addFamilyMember: async (formData) => {
        const response = await authApi.post('/api/auth/user/add-family', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    getFamilyMembers: async () => {
        const response = await authApi.get('/api/auth/user/family-members');
        return response.data;
    },

    getFamilyMemberCount: async () => {
        const response = await authApi.get('/api/auth/user/family-member-count');
        return response.data;
    },

    editFamilyMember: async (itemId, formData) => {
        const response = await authApi.put(`/api/auth/user/edit-family-member/${itemId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    removeFamilyMember: async (itemId) => {
        const response = await authApi.delete(`/api/auth/user/remove-family-member/${itemId}`);
        return response.data;
    },

    //Science page
    getSciencePageHeroDetail: async () => {
        const response = await publicApi.get('/api/homepage/science')
        return response.data;
    },

    //Blogs Page
    getBlogsHeroContent: async () => {
        const response = await publicApi.get('/api/homepage/blogs/user/get-hero')
        return response.data;
    },

    getAllBlogs: async () => {
        const response = await publicApi.get('/api/homepage/blogs/user/get')
        return response.data;
    },

    getBlogDetail: async (id) => {
        const response = await publicApi.get(`/api/homepage/blogs/user/get/${id}`)
        return response.data;
    },

    getAboutUsDetails: async () => {
        const response = await publicApi.get('/api/aboutus/get-about-us')
        return response.data;
    },

    //Videos Page
    getAllYoutubeVideos: async () => {
        const response = await publicApi.get('/upload-videos/get-youtube-links')
        return response.data;
    },

    getAllLocalVideos: async () => {
        const response = await publicApi.get('/upload-videos/getVideo')
        return response.data;
    },

    //search APIs
    getFoodSearchSuggestions: async (searchPayload) => {
        // searchPayload: { query: "Salad", limit: 10 }
        const response = await publicApi.post('/api/foodpage/search-suggestions', searchPayload);
        return response.data;
    },

    // Custom Tiffin 
    getAllNearestFoods: async (locationPayload, params) => {
        const response = await publicApi.post('/api/foodpage/all-foods', locationPayload, { params });
        return response.data;
    },

    getCustomTiffinBuilderLoader: async () => {
        const response = await authApi.get('/api/food/custom-tiffin/menu-config');
        return response.data;
    },

    previewCustomTiffinBill: async (calculationPayload) => {
        const response = await authApi.post('/api/food/custom-tiffin/calculate', calculationPayload);
        return response.data;
    },

    createCustomTiffinOrder: async (orderPayload) => {
        const response = await authApi.post('/api/food/custom-tiffin/create', orderPayload);
        return response.data;
    },

    getCustomTiffinPlanDetails: async (bookingId) => {
        const response = await authApi.get(`/api/food/custom-tiffin/my-custom-plan/${bookingId}`);
        return response.data;
    },

    getUserCustomTiffinPlans: async (params) => {
        const response = await authApi.get('/api/food/custom-tiffin/my-custom-plans', { params });
        return response.data;
    },

    getSingleCustomTiffinDetails: async (bookingId) => {
        const response = await authApi.get(`/api/food/custom-tiffin/my-custom-plan/${bookingId}`);
        return response.data;
    },

    skipTiffinMeals: async (bookingId, skipPayload) => {
        const response = await authApi.patch(`/api/food/tiffin/skip-meals/${bookingId}`, skipPayload);
        return response.data;
    },

    //Pharmacy APIS 
    // ===================================================
    // --- USER PHARMACY DISCOVERY & CATALOG APIS -------
    // ===================================================
    getAllProducts: async (params) => {
        const response = await publicApi.get('/user/pharmacy/standard-list', { params });
        return response.data;
    },

    getNonPrescriptionMedicinse: async (params) => {
        const response = await publicApi.get('/user/pharmacy/non-prescription-list', { params });
        return response.data
    },

    getProductFullDetail: async (productId, params) => {
        const response = await publicApi.get(`/user/pharmacy/medicine-details/${productId}`, { params });
        return response.data;
    },

    searchAlternativeBrand: async (name) => {
        console.log(name);
        const response = await publicApi.get(`/user/pharmacy/search-alternate`, {
            params: { name }
        });
        return response.data;
    },
    getSameCompositionMedicine: async (id) => {
        const response = await publicApi.get(`/user/pharmacy/medicine-details/${id}/substitutes`);
        return response.data;
    },

    getAllPharmacies: async (searchPayload) => {
        const response = await publicApi.post('/user/pharmacy/list', searchPayload);
        return response.data;
    },

    getPharmacyProfileDetails: async (id) => {
        const response = await publicApi.get(`/user/pharmacy/details/${id}`);
        return response.data;
    },

    getMedicineByCategory: async (params) => {
        const response = await publicApi.get('/user/pharmacy/category-details', { params });
        return response.data;
    },

    getPharmacySuggestions: async (params) => {
        const response = await publicApi.get('/user/pharmacy/pharmacy-suggestions', { params });
        return response.data;
    },

    getMedicineCategories: async () => {
        const response = await publicApi.get('/user/pharmacy/categories');
        return response.data;
    },
    getPharmacyStoreMedicinesCatalog: async (pharmacyId, params) => {
        // pharmacyId: Pharmacy store unique ObjectID (_id)
        // params (optional): { page: 1 }
        const response = await publicApi.get(`/user/medicine/pharmacies/${pharmacyId}`, { params });
        return response.data;
    },

    // --- 1. Get Pharmacy Delivery Time Slots ---
    getUserPharmacyDeliverySlots: async (params) => {
        // params: { pharmacyId: "6a7ee5e61fc7d77a0c20e009", date: "2026-10-24" }
        const response = await authApi.get('/user/pharmacy/slots', { params });
        return response.data;
    },

    // --- 2. Get Pharmacy Delivery Charges & COD Status ---
    getUserPharmacyDeliveryCharges: async (params) => {
        // params (optional): query filters if applicable
        const response = await authApi.get('/user/pharmacy/delivery-charges', { params });
        return response.data;
    },

    // --- 3. Get Available Coupons for Pharmacy Cart ---
    getUserPharmacyAvailableCoupons: async () => {
        const response = await authApi.get('/user/pharmacy/available-coupons');
        return response.data;
    },

    // --- 4. Validate Specific Pharmacy Coupon Code ---
    validateUserPharmacyCoupon: async (data) => {
        // data: { couponName: "HEALTH10", pharmacyId: "6a7ee5e61fc7d77a0c20e009", totalAmount: 450 }
        const response = await authApi.post('/user/pharmacy/validate-coupon', data);
        return response.data;
    },

    // --- 5. Evaluate Checkout Summary (Pre-Order Calculation) ---
    evaluateUserPharmacyCheckoutSummary: async (data) => {
        // data: { collectionType: "Home Delivery" | "Self Pickup", isRapid: false, isSlotSelected: true, appointmentTime: "10:00 AM - 11:00 AM", couponCode: "HEALTH10" }
        const response = await authApi.post('/user/pharmacy/checkout', data);
        return response.data;
    },

    // --- 6. Place Pharmacy Order (Final Booking - Multipart Form-Data) ---
    placeUserPharmacyOrder: async (formData) => {
        // formData: FormData object containing 'paymentMethod' ('COD' | 'Online'), 'collectionType', 'address' (JSON string), 'isRapid', 'isSlotSelected', 'appointmentTime', 'appointmentDate', 'couponCode', 'patientIds', and conditional 'prescriptionImages' file(s)
        const response = await authApi.post('/user/pharmacy/place-order', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    // --- 7. Verify Pharmacy Razorpay Payment (Online Flow Only) ---
    verifyUserPharmacyPayment: async (data) => {
        // data: { orderId: "HK-MED-616719393", razorpay_order_id: "order_P1Q2R3S4T5", razorpay_payment_id: "pay_ABC123XYZ", razorpay_signature: "9a8b7c6d5e4f3a2b1c..." }
        const response = await authApi.post('/user/pharmacy/verify-payment', data);
        return response.data;
    },

    // --- 8. Direct Prescription Upload Flow (Without Cart - Multipart Form-Data) ---
    uploadUserDirectPrescription: async (formData) => {
        // formData: FormData object containing 'pharmacyId', 'address' (JSON string), 'collectionType', and 'prescriptionImages' file
        const response = await authApi.post('/user/pharmacy/upload-prescription', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    // --- 1. Get Pharmacy Order History (Lightweight List & Cards) ---
    getUserPharmacyOrderHistory: async (params) => {
        // params (optional): { status: "All" | "Placed" | "Packed" | "Shipped" | "Delivered" | "Cancelled", page: 1, limit: 10 }
        const response = await authApi.get('/user/pharmacy/order-history', { params });
        return response.data;
    },

    // --- 2. Get Pharmacy Order Details & Live Step-by-Step Tracking ---
    getUserPharmacyOrderDetails: async (orderId) => {
        // orderId: Custom Tracking ID (e.g. "DW-MED-604732254") OR MongoDB ObjectId (_id)
        const response = await authApi.get(`/user/pharmacy/order-details/${orderId}`);
        return response.data;
    },

    // --- 3. Cancel Pharmacy Medicine Order ---
    cancelUserPharmacyOrder: async (data) => {
        // data: { orderId: "DW-MED-604732254", reason: "Ordered wrong dosage" }
        const response = await authApi.post('/user/pharmacy/cancel-order', data);
        return response.data;
    },



    // ===================================================
    // --- USER-END FOOD PAGE & DISCOVERY APIS -----------
    // ===================================================
    getUserFoodPageDaywise: async (locationPayload, params) => {
        // locationPayload: { lat: 30.7046, lng: 76.7179 } to calculate nearest vendor offsets
        // params (optional): { search, dietType, page, limit } for cross-section search filtering
        const response = await publicApi.post('/api/foodpage/daywise', locationPayload, { params });
        return response.data;
    },

    getUserFoodPageWeeklyMenu: async (locationPayload, params) => {
        const response = await publicApi.post('/api/foodpage/weekly', locationPayload, { params });
        return response.data;
    },
    // ===================================================
    // --- USER GEOLOCATED MEALS CATALOG APIS -----------
    // ===================================================

    getFoodCoupons: async () => {
        const response = await authApi.get('/api/foodpage/coupons')
        return response.data
    },

    getFoodCatgoriesAll: async () => {
        const response = await publicApi.get('/api/foodpage/categories');
        return response.data;
    },

    getMedicalCatgoriesAll: async () => {
        const response = await publicApi.get('/api/foodpage/effects');
        return response.data;
    },

    getNearestGeolocatedMeals: async (locationPayload) => {
        const response = await publicApi.post('/api/foodpage/nearest-meals', locationPayload);
        return response.data;
    },
    getSinglMealDetailsById: async (id) => {
        const response = await publicApi.get(`/api/foodpage/meals/${id}`);
        return response.data;
    },

    getNearestGeolocatedCombos: async (locationPayload) => {
        const response = await publicApi.post('/api/foodpage/nearest-combos', locationPayload);
        return response.data;
    },

    getSinglComboDetailsById: async (id) => {
        const response = await publicApi.get(`/api/foodpage/combos/${id}`);
        return response.data;
    },

    // ===================================================
    // --- USER FOOD ORDER CHECKOUT APIS -----------------
    // ===================================================
    previewFoodBill: async (calculationPayload) => {
        const response = await authApi.post('/api/food/checkout/calculate', calculationPayload);
        return response.data;
    },

    placeFoodOrder: async (orderPayload) => {
        const response = await authApi.post('/api/food/checkout/place-order', orderPayload);
        return response.data;
    },

    verifyRazorpayPayment: async (paymentPayload) => {
        const response = await authApi.post('/api/food/checkout/verify-payment', paymentPayload);
        return response.data;
    },

    getUserOrdersList: async (params) => {
        const response = await authApi.get('/api/food/checkout/my-orders', { params });
        return response.data;
    },

    getSingleOrderDetails: async (id) => {
        const response = await authApi.get(`/api/food/checkout/order/${id}`);
        return response.data;
    },

    getFoodAddons: async () => {
        const response = await publicApi.get('/api/food/checkout/addons');
        return response.data;
    },

    // ===================================================
    // --- USER TIFFIN PLANS DISCOVERY & DETAILS APIS ----
    // ===================================================
    //Tiffin plans and checkout all
    getNearestTiffinPlans: async (locationPayload, params) => {
        const response = await publicApi.post('/api/foodpage/nearest-plans', locationPayload, { params });
        return response.data;
    },

    getUserTiffinPlanDetails: async (id, params) => {
        const response = await publicApi.get(`/api/foodpage/plans/${id}`, { params });
        return response.data;
    },

    previewTiffinSubscriptionBill: async (calculationPayload) => {
        const response = await authApi.post('/api/food/tiffin/calculate', calculationPayload);
        return response.data;
    },

    subscribeTiffinPlan: async (subscriptionPayload) => {
        const response = await authApi.post('/api/food/tiffin/subscribe', subscriptionPayload);
        return response.data;
    },

    verifyTiffinRazorpayPayment: async (paymentPayload) => {
        const response = await authApi.post('/api/food/checkout/verify-payment', paymentPayload);
        return response.data;
    },

    modifyTiffinDailySchedule: async (bookingId, schedulePayload) => {
        const response = await authApi.put(`/api/food/tiffin/schedule/${bookingId}`, schedulePayload);
        return response.data;
    },

    // ===================================================
    // --- USER TIFFIN SUBSCRIPTION MANAGEMENT APIS ------
    // ===================================================

    getUserTiffinSubscriptions: async () => {
        const response = await authApi.get('/api/food/tiffin/my-subscriptions');
        return response.data;
    },

    getUserTiffinSubscriptionDetails: async (id) => {
        const response = await authApi.get(`/api/food/tiffin/my-subscription/${id}`);
        return response.data;
    },

    // ==========================================
    // HEALTHY DIET PLANS STOREFRONT API SERVICES
    // Base URL Path: /api/foodpage
    // ==========================================

    getNearestHealthyPlans: async (coordinatesPayload, filters = {}) => {
        const response = await authApi.post('/api/foodpage/healthy-plans', coordinatesPayload, {
            params: filters
        });
        return response.data;
    },

    getSingleHealthyPlanDetails: async (planId, coordinates = {}) => {
        const response = await authApi.get(`/api/foodpage/healthy-plans/${planId}`, {
            params: coordinates
        });
        return response.data;
    },

    calculateBill: async (payload) => {
        const response = await authApi.post('/api/food/healthy-plans/calculate', payload);
        return response.data;
    },

    subscribePlan: async (payload) => {
        const response = await authApi.post('/api/food/healthy-plans/subscribe', payload);
        return response.data;
    },

    verifyPayment: async (paymentData) => {
        const response = await authApi.post('/api/food/healthy-plans/verify-payment', paymentData);
        return response.data;
    },

    getMyFoodHealthPlans: async (params = {}) => {
        const response = await authApi.get('/api/food/healthy-plans/my-plans', { params });
        return response.data;
    },

    getMyFoodHealthPlanDetails: async (orderId) => {
        const response = await authApi.get(`/api/food/healthy-plans/my-plan/${orderId}`);
        return response.data;
    },

    //Manage Smoothies 
    getNearestDrinks: async (location, params = {}) => {
        const response = await authApi.post('/api/food/drinks/nearest', location, { params });
        return response.data;
    },

    getDrinkDetails: async (id) => {
        const response = await authApi.get(`/api/food/drinks/details/${id}`);
        return response.data;
    },

    // ===================================================
    // --- USER CLINIC DISCOVERY & DOCTOR DETAILS APIS ---
    // ===================================================
    getUserNearestClinics: async (locationPayload, params) => {
        const response = await publicApi.post('/api/user/clinics/nearest', locationPayload, { params });
        return response.data;
    },

    getUserClinicProfileDetails: async (id, params) => {
        const response = await publicApi.get(`/api/user/clinics/${id}`, { params });
        return response.data;
    },

    getClinicDoctorsAndBeds: async (clinicId) => {
        const response = await publicApi.get(`/api/user/clinics/${clinicId}/doctors-and-beds`);
        return response.data;
    },

    getClinicSearchSuggestions: async (searchPayload) => {
        const response = await publicApi.post('/api/user/clinics/search-suggestions', searchPayload);
        return response.data;
    },

    getUserClinicCoupons: async (clinicId) => {
        const response = await authApi.get(`/api/user/clinics/coupons/${clinicId}`);
        return response.data;
    },

    getUserClinicAmbulances: async (clinicId, params) => {
        const response = await authApi.get(`/api/user/clinics/ambulances/${clinicId}`, { params });
        return response.data;
    },

    previewClinicBookingBill: async (calculationPayload) => {
        const response = await authApi.post('/api/clinic/checkout/calculate', calculationPayload);
        return response.data;
    },

    placeClinicBooking: async (bookingPayload) => {
        const response = await authApi.post('/api/clinic/checkout/book', bookingPayload, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    verifyClinicBookingPayment: async (paymentPayload) => {
        const response = await authApi.post('/api/clinic/checkout/verify-payment', paymentPayload);
        return response.data;
    },

    getClinicalBookingsList: async () => {
        const response = await authApi.get('/api/clinic/checkout/my-bookings');
        return response.data;
    },

    getSingleClinicalBookingDetails: async (bookingId) => {
        const response = await authApi.get(`/api/clinic/checkout/booking/${bookingId}`);
        return response.data;
    },


    //Independent Doctor 
    // ===================================================
    // --- USER INDEPENDENT DOCTOR DISCOVERY APIS -------
    // ===================================================

    // --- 1. Search & Filter Independent Doctors (Listing) ---
    getIndependentDoctors: async (searchPayload) => {
        const response = await publicApi.post('/user/doctors/list', searchPayload);
        return response.data;
    },

    // --- 2. Get Independent Doctor Profile Details ---
    getIndependentDoctorDetails: async (id) => {
        const response = await publicApi.get(`/user/doctors/details/${id}`);
        return response.data;
    },
    // --- 1. Get Live Doctor & Speciality Search Suggestions (Auto-complete) ---
    getDoctorSearchSuggestions: async (data) => {
        // data: { query: "Kab", limit: 10 } (Note: 'query' requires minimum 2 characters)
        const response = await publicApi.post('/user/doctors/search-suggestions', data);
        return response.data;
    },

    // ===================================================
    // --- USER DOCTOR APPOINTMENT & SLOTS APIS ---------
    // ===================================================

    // --- 1. Get Doctor Available Slots by Date ---
    getDoctorAvailableSlots: async (doctorId, params) => {
        const response = await authApi.get(`/user/doctors/slots/${doctorId}`, { params });
        return response.data;
    },

    // ===================================================
    // --- USER DOCTOR CHECKOUT, BOOKING & PAYMENT APIS --
    // ===================================================

    // --- 1. Get Applicable Coupons for Doctor ---
    getDoctorCoupons: async (doctorId) => {
        const response = await authApi.get(`/user/doctors/coupons/${doctorId}`);
        return response.data;
    },

    // --- 2. Validate & Apply Coupon Code ---
    validateDoctorCoupon: async (couponPayload) => {
        const response = await authApi.post('/user/doctors/validate-coupon', couponPayload);
        return response.data;
    },

    // --- 3. Get Checkout Summary & Bill Preview ---
    getDoctorCheckoutSummary: async (summaryPayload) => {
        const response = await authApi.post('/user/doctors/checkout-summary', summaryPayload);
        return response.data;
    },

    // --- 4. Book Appointment (Create Order & Book) ---
    bookDoctorAppointment: async (bookingPayload) => {
        const response = await authApi.post('/user/doctors/book', bookingPayload, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // --- 5. Verify Razorpay Payment & Confirm Booking ---
    verifyDoctorPayment: async (paymentPayload) => {
        const response = await authApi.post('/user/doctors/verify-payment', paymentPayload);
        return response.data;
    },

    getIndependentDoctorBookingsList: async () => {
        const response = await authApi.get('/user/doctors/my-appointments');
        return response.data;
    },

    getIndependentDoctorBookingDetails: async (bookingId) => {
        const response = await authApi.get(`/user/doctors/my-appointments/${bookingId}`);
        return response.data;
    },

    // ===================================================
    // --- USER DOCTOR CANCELLATION & RESCHEDULE APIS ----
    // ===================================================

    // --- 1. Cancel Doctor Appointment (Patient-Side) ---
    cancelUserDoctorAppointment: async (appointmentId, cancelPayload) => {
        const response = await authApi.patch(`/user/doctors/cancel/${appointmentId}`, cancelPayload);
        return response.data;
    },

    // --- 2. Reschedule Doctor Appointment ---
    rescheduleUserDoctorAppointment: async (reschedulePayload) => {
        const response = await authApi.post('/user/doctors/reschedule', reschedulePayload);
        return response.data;
    },

    //Ambulance

    // --- 1. Search Nearest Ambulances (Live GPS Discovery) ---
    getNearestAmbulances: async (data) => {
        // data: { lat: 30.7046, lng: 76.7179, search: '', city: 'Mohali', vehicleType: 'Advance Life Support', hasNurse: true, hasDoctor: false, type: 'all', page: 1, limit: 10 }
        const response = await publicApi.post('/api/user/ambulance/nearest', data);
        return response.data;
    },

    // --- 2. Get Single Ambulance Details ---
    getAmbulanceDetails: async (id, params) => {
        // id: Ambulance unique ObjectID (_id)
        // params (optional): { lat: 30.7046, lng: 76.7179 }
        const response = await publicApi.get(`/api/user/ambulance/details/${id}`, { params });
        return response.data;
    },
    // ==========================================
    // STEP 1: PRE-REQUISITES & DISCOVERY
    // ==========================================

    // --- 1. Get Ambulance Time Slots (Scheduled / Referral) ---
    getAmbulanceBookingSlots: async (ambulanceId, params) => {
        // ambulanceId: Ambulance unique ObjectID (_id)
        // params (optional): { date: '2026-10-02' }
        const response = await authApi.get(`/api/user/ambulance/slots/ambu/${ambulanceId}`, { params });
        return response.data;
    },

    // --- 2. Get Applicable Ambulance Coupons ---
    getApplicableAmbulanceCoupons: async (ambulanceId) => {
        // ambulanceId: Selected Ambulance unique ObjectID (_id)
        const response = await authApi.get(`/api/user/ambulance/coupons/${ambulanceId}`);
        return response.data;
    },

    // ==========================================
    // STEP 2: CHECKOUT BILL CALCULATION
    // ==========================================

    // --- 3. Calculate Ambulance Fare & Preview Bill Breakdown ---
    calculateAmbulanceFare: async (data) => {
        // data: { ambulanceId: "6a9e4316063d78a2c13991c2", rideType: "Single Ride", pickupLocation: { address: "House 102, Phase 7, Mohali", lat: 30.7046, lng: 76.7179 }, dropoffLocation: { address: "Max Super Speciality Hospital, Phase 6", lat: 30.7185, lng: 76.7112 }, supportStaff: [{ facilityId: "6741ab89c10234ef56789012", name: "Nurse", price: 400 }], couponCode: "CLINICAMB25" }
        const response = await authApi.post('/api/user/ambulance/booking/calculate-fare', data);
        return response.data;
    },

    // ==========================================
    // STEP 3: PLACING THE BOOKING
    // ==========================================

    // --- 4. Book Referral / Scheduled Ambulance Transfer (Flow 2) ---
    bookReferralAmbulance: async (data) => {
        // data: { ambulanceId: "6a9e4316063d78a2c13991c2", rideType: "Single Ride", pickupLocation: { address: "House 102, Phase 7, Mohali", lat: 30.7046, lng: 76.7179 }, dropoffLocation: { address: "Max Hospital, Phase 6", lat: 30.7185, lng: 76.7112 }, patientDetails: { name: "Kavita Verma", age: 60, gender: "Female", relation: "Mother", condition: "Post-Surgery Transfer" }, purpose: "Hospital Discharge Patient Transfer", scheduledDate: "2026-10-02", scheduledTime: "10:00 AM - 12:00 PM", estimateTime: "1 hr 30 mins", supportStaff: [{ facilityId: "6741ab89c10234ef56789012", name: "Nurse", price: 400 }], couponCode: "CLINICAMB25", paymentMethod: "COD" }
        const response = await authApi.post('/api/user/ambulance/booking/referral', data);
        return response.data;
    },

    // --- 5. Book Emergency Ambulance Broadcast (Flow 1) ---
    bookEmergencyAmbulance: async (data) => {
        // data: { pickupLocation: { address: "Sector 62, Phase 8, Mohali", lat: 30.7046, lng: 76.7179 }, dropoffLocation: { address: "Fortis Hospital, Sector 62", lat: 30.6983, lng: 76.7321 }, patientDetails: { name: "Amit Sharma", relation: "Self", age: 45, gender: "Male", condition: "Severe Chest Pain" }, purpose: "Cardiac Emergency", estimateTime: "Immediate (30 mins)", paymentMethod: "COD" }
        const response = await authApi.post('/api/user/ambulance/booking/emergency', data);
        return response.data;
    },

    // ==========================================
    // STEP 4: PAYMENT CONFIRMATION
    // ==========================================

    // --- 6. Verify Ambulance Booking Razorpay Payment ---
    verifyAmbulancePayment: async (data) => {
        // data: { bookingId: "HK-REF-845123", razorpayOrderId: "order_P123456789abcd", razorpayPaymentId: "pay_P987654321wxyz", razorpaySignature: "2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p" }
        const response = await authApi.post('/api/user/ambulance/booking/verify-payment', data);
        return response.data;
    },
    // --- 1. Get All Ambulance Booking Orders (Summary List) ---
    getMyAmbulanceBookingOrders: async () => {
        const response = await authApi.get('/api/user/ambulance/booking/my-orders');
        return response.data;
    },

    // --- 2. Get Single Ambulance Booking Order Details by ID / BookingId ---
    getAmbulanceBookingOrderById: async (id) => {
        // id: Order MongoDB ObjectId (_id) or Booking ID (e.g. 'HK-REF-845123' or '6abe24a103800dc3c0fb2fde')
        const response = await authApi.get(`/api/user/ambulance/booking/order/${id}`);
        return response.data;
    },

    // --- 1. Get User CGM Storefront Categories (Category Tabs) ---
    getUserCgmCategories: async () => {
        const response = await publicApi.get('/user/cgm/devices/categories');
        return response.data;
    },

    // --- 2. Get User CGM Products Catalog (Listing, Filters & Search) ---
    getUserCgmProductsCatalog: async (params) => {
        // params (optional): { categoryId: '', productType: 'Glucometer' | 'CGM' | 'Supplement' | 'Accessory', search: 'DiabetesWala', sortBy: 'newest' | 'price_low_high' | 'price_high_low' | 'popular', isPopular: true, isFeatured: true, page: 1, limit: 20 }
        const response = await publicApi.get('/user/cgm/devices/get', { params });
        return response.data;
    },

    // --- 3. Get Single CGM Product Details by ID (Full View) ---
    getUserCgmProductDetailsById: async (id) => {
        // id: Product unique ObjectID (_id)
        const response = await publicApi.get(`/user/cgm/devices/get/${id}`);
        return response.data;
    },

    // --- 1. Calculate CGM & Glucometer Bill / Checkout Preview (With Coach & Surcharge) ---
    calculateCgmOrderBill: async (data) => {
        // data: { deviceId: "6ac4a2935bdb7103f2a81719", variantId: "6ac47ee6ed529727b5e8ffc6", quantity: 1, coachId: "6ac5f22035b0cd0678eef501", consultationMode: "Offline", userLat: 30.7046, userLng: 76.7179, scheduledDate: "2026-10-12", slotTime: "18:00", addons: [{ addonId: "6ac4d0ff2e447457af17d724", quantity: 1 }] }
        const response = await authApi.post('/api/user/cgm/checkout/calculate-bill', data);
        return response.data;
    },

    // --- 2. Place CGM & Glucometer Order (COD & Online Razorpay) ---
    placeCgmOrder: async (data) => {
        // data: { deviceId: "6ac4a2935bdb7103f2a81719", variantId: "6ac47ee6ed529727b5e8ffc6", quantity: 1, coachId: "6ac5f22035b0cd0678eef501", consultationMode: "Offline", userLat: 30.7046, userLng: 76.7179, scheduledDate: "2026-10-12", slotTime: "18:00", addons: [{ addonId: "6ac4d0ff2e447457af17d724", quantity: 1 }], diabetesProfile: { diabetesType: "Type 2", hasUsedBefore: false }, paymentMethod: "COD" | "Online", deliveryAddress: { name: "Mudabir Kowsar", phone: "1234567890", houseNo: "Flat 102 Casa Homes", sector: "Sector 911", landmark: "Near Infosiv", city: "Mohali", state: "Punjab", pincode: "140301", addressType: "Home" } }
        const response = await authApi.post('/api/user/cgm/checkout/place-order', data);
        return response.data;
    },

    // --- 3. Verify CGM Order Razorpay Payment ---
    verifyCgmPayment: async (data) => {
        // data: { orderId: "HK-CGM-105432", razorpayOrderId: "order_NzM992019283", razorpayPaymentId: "pay_NzM998877112", razorpaySignature: "9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d" }
        const response = await authApi.post('/api/user/cgm/checkout/verify-payment', data);
        return response.data;
    },
    getCgmAddOns: async () => {
        const response = await authApi.get("/user/cgm/devices/addons")
        return response.data;
    },

    getCgmCoachCharges: async () => {
        const response = await authApi.get('/user/cgm/devices/coach-charge')
        return response.data;
    },
    // --- 1. Get Nearby Diabetes Coaches (Distance Calculation & Discovery) ---
    getNearbyDiabetesCoaches: async (data) => {
        // data: { userLat: 30.7046, userLng: 76.7179, city: "Mohali", search: "Ananya" }
        const response = await publicApi.post('/user/cgm/coaches/nearby', data);
        return response.data;
    },

    // --- 2. Get Single Diabetes Coach Details by ID (With Optional Slots Preview) ---
    getUserDiabetesCoachById: async (id, params) => {
        // id: Coach unique ObjectID (_id)
        // params (optional): { selectedDate: "2026-10-10" }
        const response = await publicApi.get(`/user/cgm/coaches/get/${id}`, { params });
        return response.data;
    },

    // --- 3. Get Available Diabetes Coach Slots by Date (Calendar Date Picker) ---
    getUserDiabetesCoachSlotsByDate: async (id, params) => {
        // id: Coach unique ObjectID (_id)
        // params (required): { selectedDate: "2026-10-10" }
        const response = await publicApi.get(`/user/cgm/coaches/slots/${id}`, { params });
        return response.data;
    },

    // --- 1. Get My CGM & Glucometer Orders (Order History & Cards) ---
    getMyCgmOrders: async (params) => {
        // params (optional): { page: 1, limit: 10, status: 'Placed' | 'Confirmed' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled' }
        const response = await authApi.get('/api/user/cgm/checkout/my-orders', { params });
        return response.data;
    },

    // --- 2. Get Single CGM & Glucometer Order Details by ID / OrderId ---
    getCgmOrderDetailsById: async (id) => {
        // id: Custom Order ID (e.g. 'HK-CGM-458265') OR MongoDB ObjectId (_id)
        const response = await authApi.get(`/api/user/cgm/checkout/order/${id}`);
        return response.data;
    },

    // --- 3. Cancel CGM & Glucometer Order (With Optional Reason & Auto-Refund) ---
    cancelCgmOrder: async (id, data = {}) => {
        // id: Custom Order ID (e.g. 'HK-CGM-458265') OR MongoDB ObjectId (_id)
        // data (optional): { cancelReason: "Ordered by mistake, want to purchase different pack." }
        const response = await authApi.patch(`/api/user/cgm/checkout/order/cancel/${id}`, data);
        return response.data;
    },

    // --- 1. Calculate Diabetic Coach Booking Fare / Bill Preview ---
    calculateDiabeticCoachFare: async (data) => {
        // data: { coachId: "67b848c9031c2384f9821a10", consultationMode: "Offline" | "Online", scheduledDate: "2026-10-25", slotTime: "11:00 AM", userLat: 30.7046, userLng: 76.7179, locationType: "Hospital" | "Home" | "Online" | "Other", hospitalDetails: { hospitalName: "Max Super Speciality Hospital", floorNo: "3rd Floor", ward: "Cardiology Wing", bedNo: "Bed-304" }, bookingFor: "Self" | "Other", specialInstructions: "..." }
        const response = await authApi.post('/api/user/coach-booking/calculate-bill', data);
        return response.data;
    },

    // --- 2. Book Diabetic Coach (Order Creation & Slot Lock - COD / Online) ---
    bookDiabeticCoach: async (data) => {
        // data: { coachId: "67b848c9031c2384f9821a10", bookingFor: "Other" | "Self", patientDetails: { name: "Ramesh Verma", phone: "9876543210", gender: "Male", age: 62, relation: "Father", isDiabetic: true, diabetesType: "Type 2" }, consultationMode: "Offline" | "Online", scheduledDate: "2026-10-25", slotTime: "11:00 AM", locationType: "Hospital" | "Home" | "Online" | "Other", hospitalDetails: { hospitalName: "...", floorNo: "...", ward: "...", bedNo: "..." }, address: { name: "...", phone: "...", city: "Mohali", state: "Punjab", pincode: "160055", lat: 30.7046, lng: 76.7179 }, paymentMethod: "COD" | "Online", specialInstructions: "..." }
        const response = await authApi.post('/api/user/coach-booking/book', data);
        return response.data;
    },

    // --- 3. Verify Diabetic Coach Booking Razorpay Payment ---
    verifyDiabeticCoachPayment: async (data) => {
        // data: { bookingId: "DW-COACH-104929", razorpayOrderId: "order_COACH987654321", razorpayPaymentId: "pay_XYZ987654321", razorpaySignature: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" }
        const response = await authApi.post('/api/user/coach-booking/verify-payment', data);
        return response.data;
    },
    // --- 1. Get My Diabetic Coach Bookings List ---
    getMyCoachBookings: async (params) => {
        // params (optional): { status: 'Placed' | 'Confirmed' | 'In-Progress' | 'Completed' | 'Cancelled', page: 1, limit: 10 }
        const response = await authApi.get('/api/user/coach-booking/my-bookings', { params });
        return response.data;
    },

    // --- 2. Get Single Diabetic Coach Booking Details by ID / BookingId ---
    getCoachBookingDetailsById: async (id) => {
        // id: Booking MongoDB ObjectId (_id) or Alphanumeric Booking ID (e.g. 'DW-COACH-104928')
        const response = await authApi.get(`/api/user/coach-booking/booking/${id}`);
        return response.data;
    },

    // --- 3. Cancel Diabetic Coach Booking by User ---
    cancelCoachBooking: async (id, data = {}) => {
        // id: Booking MongoDB ObjectId (_id) or Alphanumeric Booking ID (e.g. 'DW-COACH-104928')
        // data (optional): { cancelReason: "Patient is discharged from hospital earlier than scheduled." }
        const response = await authApi.patch(`/api/user/coach-booking/cancel/${id}`, data);
        return response.data;
    },

}
export default UserAPI;