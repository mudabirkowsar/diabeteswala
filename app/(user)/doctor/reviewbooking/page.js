'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ChevronLeft,
    Video,
    MapPin,
    Home,
    ShieldCheck,
    CheckCircle2,
    Calendar,
    Clock,
    User,
    Building2,
    CreditCard,
    Lock,
    AlertCircle,
    Loader2,
    Sparkles,
    ArrowRight,
    BadgeCheck,
    Tag,
    Upload,
    FileCheck,
    X,
    Banknote,
    Crown
} from 'lucide-react';
import UserAPI from '../../../services/UserAPI';

export default function ReviewBookingPage() {
    const router = useRouter();
    const [reviewData, setReviewData] = useState(null);
    const [loadingContext, setLoadingContext] = useState(true);

    // Form & Interaction State
    const [symptomsNote, setSymptomsNote] = useState('');
    const [medicalReportFile, setMedicalReportFile] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'COD' | 'UPI' | 'Card' | 'Netbanking' | 'Wallet'

    // Coupon States
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [couponCodeInput, setCouponCodeInput] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState(null);

    // Live Bill Summary Preview State (From API)
    const [billSummary, setBillSummary] = useState(null);
    const [summaryLoading, setSummaryLoading] = useState(false);

    // Final Action Loading & Confirmation
    const [submitting, setSubmitting] = useState(false);
    const [confirmedSuccessData, setConfirmedSuccessData] = useState(null);

    // Dynamically load Razorpay SDK
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (typeof window === 'undefined') return resolve(false);
            if (window.Razorpay) return resolve(true);

            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    // 1. Load context from localStorage on Mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const cached = localStorage.getItem('doctorBookingReview');
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    setReviewData(parsed);
                } catch (e) {
                    console.error('Error parsing booking review context:', e);
                }
            }
            setLoadingContext(false);
        }
    }, []);

    // 2. Fetch Available Doctor Coupons
    useEffect(() => {
        if (!reviewData?.doctorId) return;

        const fetchCoupons = async () => {
            try {
                const res = await UserAPI.getDoctorCoupons(reviewData.doctorId);
                if (res && res.success && Array.isArray(res.data)) {
                    setAvailableCoupons(res.data);
                }
            } catch (err) {
                console.error('Error fetching doctor coupons:', err);
            }
        };

        fetchCoupons();
    }, [reviewData?.doctorId]);

    // 3. Fetch Live Checkout Summary & Bill Preview
    const fetchCheckoutSummary = async (activeCouponCode = appliedCoupon?.couponCode) => {
        if (!reviewData?.doctorId) return;

        try {
            setSummaryLoading(true);

            const patientPayload = reviewData.patient ? [{
                patientName: reviewData.patient.memberName || 'Self',
                relation: reviewData.patient.relation || 'Self',
                patientAge: Number(reviewData.patient.age) || 28,
                gender: reviewData.patient.gender || 'Male'
            }] : [];

            const payload = {
                doctorId: reviewData.doctorId,
                consultationType: reviewData.consultationType || 'Clinic Visit',
                appointmentDate: reviewData.slot?.date,
                timeSlot: reviewData.slot?.time || reviewData.slot?.formattedTime,
                couponCode: activeCouponCode || undefined,
                distance: reviewData.consultationType === 'Home Visit' ? 5 : 0,
                address: reviewData.homeAddress || undefined,
                patients: patientPayload
            };

            const res = await UserAPI.getDoctorCheckoutSummary(payload);
            if (res && res.success && res.data) {
                setBillSummary(res.data);
            }
        } catch (err) {
            console.error('Error fetching checkout summary:', err);
        } finally {
            setSummaryLoading(false);
        }
    };

    useEffect(() => {
        if (reviewData?.doctorId) {
            fetchCheckoutSummary();
        }
    }, [reviewData]);

    // Handle Manual/Available Coupon Apply
    const handleApplyCoupon = async (codeToApply) => {
        const code = (codeToApply || couponCodeInput).trim().toUpperCase();
        if (!code) return;

        setCouponLoading(true);
        setCouponError(null);

        try {
            const subtotalAmount = billSummary?.subtotal || reviewData?.totalFee || reviewData?.consultationFee || 500;

            const payload = {
                couponCode: code,
                subtotal: subtotalAmount,
                doctorId: reviewData.doctorId
            };

            const res = await UserAPI.validateDoctorCoupon(payload);

            if (res && res.success && res.data) {
                setAppliedCoupon({
                    couponCode: code,
                    discountAmount: res.data.discountAmount,
                    finalAmount: res.data.finalAmount
                });
                setCouponCodeInput('');
                fetchCheckoutSummary(code);
            } else {
                setCouponError(res?.message || 'Invalid or expired coupon code.');
            }
        } catch (err) {
            console.error('Error validating coupon:', err);
            setCouponError(err?.response?.data?.message || 'Unable to apply coupon. Minimum amount requirement not met.');
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponError(null);
        fetchCheckoutSummary(null);
    };

    const getImageSrc = (imgPath) => {
        if (!imgPath) return 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop';
        if (imgPath.startsWith('http')) return imgPath;
        return `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}${imgPath}`;
    };

    // 4. Booking and Payment Execution Flow (Strictly Matched to API Spec)
    const handleConfirmAndPay = async () => {
        if (!reviewData?.doctorId || !reviewData?.slot) {
            alert('Incomplete booking session. Please select an appointment slot first.');
            return;
        }

        if (reviewData.consultationType === 'Home Visit' && !reviewData.homeAddress) {
            alert('Address is mandatory for Home Visit consultations.');
            return;
        }

        setSubmitting(true);

        try {
            const payableAmount = Number(billSummary?.totalPayable ?? reviewData.totalFee);

            const pricingBreakdownObj = {
                baseFee: Number(billSummary?.baseFee ?? reviewData.consultationFee ?? 0),
                visitCharges: Number(billSummary?.visitCharge ?? 0),
                extraCharges: Number(billSummary?.premiumFee ?? reviewData.slot?.premiumFee ?? 0),
                discountAmount: Number(billSummary?.discount ?? appliedCoupon?.discountAmount ?? 0),
                subtotal: Number(billSummary?.subtotal ?? reviewData.totalFee ?? 0)
            };

            const patientsArray = [{
                patientName: reviewData.patient?.memberName || 'Self',
                patientAge: Number(reviewData.patient?.age) || 28,
                gender: reviewData.patient?.gender || 'Male',
                relation: reviewData.patient?.relation || 'Self',
                reasonForVisit: symptomsNote || 'General Consultation'
            }];

            const formattedSlotTime = reviewData.slot?.formattedTime || reviewData.slot?.time;
            const formattedDate = reviewData.slot?.date;

            let bookingPayload;
            let isMultipart = false;

            // When uploading a medical report file or sending standard data
            if (medicalReportFile) {
                isMultipart = true;
                const formData = new FormData();
                formData.append('doctorId', reviewData.doctorId);
                formData.append('appointmentDate', formattedDate);
                formData.append('timeSlot', formattedSlotTime);
                formData.append('consultationType', reviewData.consultationType);
                formData.append('paymentMethod', paymentMethod);
                formData.append('totalAmount', String(payableAmount));
                formData.append('clinicalNote', symptomsNote || 'General Consultation');
                formData.append('pricingBreakdown', JSON.stringify(pricingBreakdownObj));
                formData.append('patients', JSON.stringify(patientsArray));

                if (reviewData.consultationType === 'Home Visit' && reviewData.homeAddress) {
                    const addressObj = {
                        name: reviewData.homeAddress.name || reviewData.patient?.memberName || 'User',
                        phone: reviewData.homeAddress.phone || '1234567890',
                        houseNo: reviewData.homeAddress.houseNo || '',
                        sector: reviewData.homeAddress.sector || '',
                        city: reviewData.homeAddress.city || '',
                        state: reviewData.homeAddress.state || '',
                        pincode: reviewData.homeAddress.pincode || ''
                    };
                    formData.append('address', JSON.stringify(addressObj));
                }

                // Attach actual file with exact key 'medicalReport'
                formData.append('medicalReport', medicalReportFile);
                bookingPayload = formData;
            } else {
                isMultipart = false;
                bookingPayload = {
                    doctorId: reviewData.doctorId,
                    appointmentDate: formattedDate,
                    timeSlot: formattedSlotTime,
                    consultationType: reviewData.consultationType,
                    paymentMethod: paymentMethod,
                    totalAmount: payableAmount,
                    clinicalNote: symptomsNote || 'General Consultation',
                    pricingBreakdown: pricingBreakdownObj,
                    patients: patientsArray,
                    address: reviewData.consultationType === 'Home Visit' && reviewData.homeAddress ? {
                        name: reviewData.homeAddress.name || reviewData.patient?.memberName || 'User',
                        phone: reviewData.homeAddress.phone || '1234567890',
                        houseNo: reviewData.homeAddress.houseNo || '',
                        sector: reviewData.homeAddress.sector || '',
                        city: reviewData.homeAddress.city || '',
                        state: reviewData.homeAddress.state || '',
                        pincode: reviewData.homeAddress.pincode || ''
                    } : undefined
                };
            }

            // Call API 4: Book Doctor Appointment
            const bookRes = await UserAPI.bookDoctorAppointment(bookingPayload, isMultipart);

            if (!bookRes || !bookRes.success) {
                throw new Error(bookRes?.message || 'Failed to initialize booking.');
            }

            // ==========================================
            // CASE A: COD / Free Booking -> Instant Confirmed
            // ==========================================
            if (paymentMethod === 'COD' || payableAmount === 0 || bookRes.data?.status === 'Confirmed') {
                setConfirmedSuccessData(bookRes.data);
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('doctorBookingReview');
                    localStorage.removeItem('pendingDoctorBooking');
                }
                setSubmitting(false);
                return;
            }

            // ==========================================
            // CASE B: Online Payment via Razorpay
            // ==========================================
            const { key_id, razorpayOrderId, amount, appointmentId } = bookRes;

            const sdkReady = await loadRazorpayScript();
            if (!sdkReady) {
                alert('Razorpay Payment Gateway failed to load. Please check your internet connection.');
                setSubmitting(false);
                return;
            }

            const options = {
                key: key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: amount,
                currency: 'INR',
                name: 'Doctor Consultation',
                description: `${reviewData.consultationType} with Dr. ${reviewData.doctorName}`,
                image: getImageSrc(reviewData.doctorImage),
                order_id: razorpayOrderId,
                handler: async function (response) {
                    try {
                        setSubmitting(true);

                        // Call API 5: Verify Payment
                        const verifyPayload = {
                            appointmentId: appointmentId || bookRes.data?._id,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature
                        };

                        const verifyRes = await UserAPI.verifyDoctorPayment(verifyPayload);

                        if (verifyRes && verifyRes.success) {
                            setConfirmedSuccessData(verifyRes.data);
                            if (typeof window !== 'undefined') {
                                localStorage.removeItem('doctorBookingReview');
                                localStorage.removeItem('pendingDoctorBooking');
                            }
                        } else {
                            alert(verifyRes?.message || 'Payment verification failed. Please contact support.');
                        }
                    } catch (verifyErr) {
                        console.error('Payment verification error:', verifyErr);
                        alert(verifyErr?.response?.data?.message || 'Payment verified with issue. Please contact support.');
                    } finally {
                        setSubmitting(false);
                    }
                },
                prefill: {
                    name: reviewData.patient?.memberName || 'User',
                    contact: reviewData.patient?.phone || ''
                },
                theme: {
                    color: '#3d3f96'
                }
            };

            const razorpayInstance = new window.Razorpay(options);
            razorpayInstance.on('payment.failed', function (resp) {
                alert(`Payment Failed: ${resp.error.description}`);
                setSubmitting(false);
            });
            razorpayInstance.open();

        } catch (err) {
            console.error('Booking submission error:', err);
            alert(err?.response?.data?.message || err?.message || 'Unable to complete appointment booking. Please try again.');
            setSubmitting(false);
        }
    };

    if (loadingContext) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin text-[#3d3f96]" size={36} />
                <p className="text-slate-600 font-semibold text-sm">Preparing checkout session...</p>
            </div>
        );
    }

    // Success Confirmation Screen
    if (confirmedSuccessData) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
                <div className="max-w-lg w-full bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 text-center shadow-xl space-y-6">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto border-2 border-emerald-100 shadow-md">
                        <CheckCircle2 size={44} strokeWidth={2.5} />
                    </div>

                    <div>
                        <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-200">
                            Booking Confirmed
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
                            Appointment Scheduled!
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                            Booking ID: <span className="font-extrabold text-slate-900">{confirmedSuccessData.bookingId || 'HK-CONFIRMED'}</span>
                        </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left space-y-2.5 text-xs">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Doctor:</span>
                            <span className="font-bold text-slate-900">{reviewData?.doctorName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Scheduled Time:</span>
                            <span className="font-bold text-slate-900">
                                {confirmedSuccessData.appointmentDate ? new Date(confirmedSuccessData.appointmentDate).toISOString().split('T')[0] : reviewData?.slot?.date} • {confirmedSuccessData.appointmentTime || reviewData?.slot?.formattedTime}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Consultation Channel:</span>
                            <span className="font-bold text-[#3d3f96]">{confirmedSuccessData.consultationType || reviewData?.consultationType}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-slate-200">
                            <span className="text-slate-700 font-bold">Total Paid / Payable:</span>
                            <span className="font-extrabold text-[#3d3f96] text-sm">₹{confirmedSuccessData.totalAmount || billSummary?.totalPayable || reviewData?.totalFee}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => router.push('/doctor')}
                        className="w-full bg-[#3d3f96] hover:bg-slate-900 text-white py-4 rounded-2xl font-bold text-xs tracking-wider uppercase transition-all shadow-md shadow-indigo-100 cursor-pointer"
                    >
                        Return to Doctor Directory
                    </button>
                </div>
            </div>
        );
    }

    if (!reviewData) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white border border-slate-200/80 rounded-3xl p-8 text-center shadow-xl">
                    <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
                        <AlertCircle size={28} />
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mb-2">No Active Booking</h2>
                    <p className="text-sm text-slate-500 mb-6 font-medium">Please select a doctor consultation session first.</p>
                    <button
                        onClick={() => router.push('/doctor')}
                        className="w-full bg-[#3d3f96] hover:bg-slate-900 text-white py-3.5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-md shadow-indigo-100 cursor-pointer"
                    >
                        Return to Directory
                    </button>
                </div>
            </div>
        );
    }

    const {
        doctorName,
        doctorSpeciality,
        doctorQualification,
        doctorImage,
        consultationType,
        slot,
        patient,
        homeAddress,
        practiceAddress,
        slotDuration = 30
    } = reviewData;

    const payableFee = billSummary?.totalPayable ?? reviewData.totalFee;

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-28 relative selection:bg-[#3d3f96] selection:text-white">
            {/* Structural subtle geometric accents */}
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-70 pointer-events-none -z-10" />

            {/* Top Header */}
            <header className="bg-white/90 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-200/80 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-[#3d3f96] transition-colors group cursor-pointer"
                    >
                        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Modify Selection</span>
                    </button>

                    <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                        <ShieldCheck size={14} className="fill-emerald-100" />
                        Final Checkout Review
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

                {/* Title Header */}
                <div className="mb-8">
                    <span className="text-xs font-bold text-[#3d3f96] uppercase tracking-widest bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-xl">
                        Appointment Confirmation
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
                        Review Details & Confirm Booking
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                        Verify your consultation channel, medical notes, attach prescription reports, and apply available offers.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* =========================================================
              LEFT COLUMN (ENHANCED DETAILS & ACTIONS - 7 COLS)
             ========================================================= */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* 1. Doctor Profile & Schedule Hero */}
                        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm relative overflow-hidden">
                            <div className="flex flex-col sm:flex-row gap-5 items-start">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 border-2 border-white shadow-md shrink-0">
                                    <img src={getImageSrc(doctorImage)} alt={doctorName || 'Doctor'} className="w-full h-full object-cover" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                        <span className="text-[10px] font-extrabold text-[#3d3f96] bg-indigo-50 border border-indigo-100/90 px-2.5 py-0.5 rounded-lg uppercase tracking-wider">
                                            {doctorSpeciality || 'Medical Specialist'}
                                        </span>
                                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                                            <BadgeCheck size={12} /> Verified MCI
                                        </span>
                                    </div>

                                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight truncate">
                                        {doctorName?.toLowerCase().startsWith('dr.') ? doctorName : `Dr. ${doctorName || ''}`}
                                    </h2>
                                    <p className="text-xs font-semibold text-slate-500 mt-0.5">{doctorQualification || 'MBBS, MD'}</p>

                                    {practiceAddress && (
                                        <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                            <Building2 size={13} className="text-[#3d3f96] shrink-0" />
                                            <span className="truncate">{practiceAddress}</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Consultation Channel & Timing Strip */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5 pt-5 border-t border-slate-100">
                                <div className="p-3.5 rounded-2xl bg-indigo-50/40 border border-indigo-100 flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700 shrink-0">
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date & Slot</p>
                                        <p className="text-xs font-extrabold text-slate-900 mt-0.5">
                                            {slot?.date} • {slot?.formattedTime || slot?.time}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-100 flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                                        {consultationType === 'Video Consult' && <Video size={18} />}
                                        {consultationType === 'Clinic Visit' && <MapPin size={18} />}
                                        {consultationType === 'Home Visit' && <Home size={18} />}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Consultation Channel</p>
                                        <p className="text-xs font-extrabold text-slate-900 mt-0.5">
                                            {consultationType} ({slotDuration} Mins)
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Home Visit Destination Address if applicable */}
                            {consultationType === 'Home Visit' && homeAddress && (
                                <div className="mt-3.5 p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/70 text-xs">
                                    <p className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                                        <Home size={14} className="text-amber-700" /> Home Visit Arrival Address:
                                    </p>
                                    <p className="text-slate-700 font-medium">
                                        {homeAddress.name} • {[homeAddress.houseNo, homeAddress.sector, homeAddress.city, homeAddress.pincode].filter(Boolean).join(', ')}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* 2. Patient Profile & Clinical Note & Report Upload */}
                        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                                    <User size={15} className="text-[#3d3f96]" /> Patient & Clinical Information
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                                    {patient?.relation || 'SELF'}
                                </span>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                                        <User size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-extrabold text-slate-900">{patient?.memberName || 'Myself'}</p>
                                        <p className="text-[11px] text-slate-500">{patient?.relation || 'Self'} • {patient?.gender || 'Patient'}</p>
                                    </div>
                                </div>
                                <BadgeCheck size={18} className="text-emerald-600" />
                            </div>

                            {/* Symptoms / Note (mapped to clinicalNote) */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Reason for Visit / Symptoms (Saved as Clinical Note)</label>
                                <textarea
                                    rows={2}
                                    placeholder="e.g. Fasting blood sugar evaluation, chest discomfort, or diet consultation..."
                                    value={symptomsNote}
                                    onChange={(e) => setSymptomsNote(e.target.value)}
                                    className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3d3f96]/30 bg-slate-50/50"
                                />
                            </div>

                            {/* Medical Report Upload (Key: medicalReport) */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Attach Medical Prescription / Reports (Optional)</label>
                                {medicalReportFile ? (
                                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2 text-emerald-800 font-semibold truncate">
                                            <FileCheck size={16} />
                                            <span className="truncate">{medicalReportFile.name}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setMedicalReportFile(null)}
                                            className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-300 bg-slate-50/50 hover:bg-slate-50 text-xs font-bold text-slate-600 cursor-pointer transition-all">
                                        <Upload size={16} className="text-[#3d3f96]" />
                                        <span>Upload Prescription / Lab Report (PDF, JPG, PNG)</span>
                                        <input
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            className="hidden"
                                            onChange={(e) => {
                                                if (e.target.files?.[0]) {
                                                    setMedicalReportFile(e.target.files[0]);
                                                }
                                            }}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* 3. Payment Mode Selection */}
                        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-4">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2 pb-3 border-b border-slate-100">
                                <CreditCard size={15} className="text-[#3d3f96]" /> Select Payment Method
                            </span>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                {/* Pay Online */}
                                <div
                                    onClick={() => setPaymentMethod('UPI')}
                                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${paymentMethod !== 'COD'
                                            ? 'border-[#3d3f96] bg-indigo-50/40 ring-2 ring-[#3d3f96]/20 shadow-xs'
                                            : 'border-slate-200 bg-white hover:border-slate-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700">
                                            <CreditCard size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-extrabold text-slate-900">Pay Online (Instant)</p>
                                            <p className="text-[10px] text-slate-500">UPI, Credit/Debit Card, Netbanking</p>
                                        </div>
                                    </div>
                                    {paymentMethod !== 'COD' && <CheckCircle2 size={16} className="text-[#3d3f96]" />}
                                </div>

                                {/* Pay at Clinic / COD */}
                                {(billSummary?.isCodAvailable ?? true) && (
                                    <div
                                        onClick={() => setPaymentMethod('COD')}
                                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${paymentMethod === 'COD'
                                                ? 'border-[#3d3f96] bg-indigo-50/40 ring-2 ring-[#3d3f96]/20 shadow-xs'
                                                : 'border-slate-200 bg-white hover:border-slate-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
                                                <Banknote size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-extrabold text-slate-900">
                                                    {consultationType === 'Clinic Visit' ? 'Pay at Clinic' : 'Cash on Visit (COD)'}
                                                </p>
                                                <p className="text-[10px] text-slate-500">Pay directly during consultation</p>
                                            </div>
                                        </div>
                                        {paymentMethod === 'COD' && <CheckCircle2 size={16} className="text-[#3d3f96]" />}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* =========================================================
              RIGHT COLUMN (STICKY COUPONS & FEE BREAKDOWN - 5 COLS)
             ========================================================= */}
                    <div className="lg:col-span-5 space-y-6">

                        {/* 1. COUPONS CARD */}
                        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                                    <Tag size={16} className="text-[#3d3f96]" />
                                    <span>Apply Coupon & Offers</span>
                                </h3>
                                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                    Instant Savings
                                </span>
                            </div>

                            {/* Coupon Code Input */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Enter Code (e.g. DOCDR20)"
                                    value={couponCodeInput}
                                    onChange={(e) => setCouponCodeInput(e.target.value)}
                                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold uppercase text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3d3f96]/30 bg-slate-50/60"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleApplyCoupon(couponCodeInput)}
                                    disabled={couponLoading || !couponCodeInput.trim()}
                                    className="bg-[#3d3f96] hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition-all disabled:opacity-50 cursor-pointer"
                                >
                                    {couponLoading ? <Loader2 size={14} className="animate-spin" /> : 'Apply'}
                                </button>
                            </div>

                            {couponError && (
                                <p className="text-[11px] text-rose-500 font-semibold">{couponError}</p>
                            )}

                            {/* Applied Coupon Banner */}
                            {appliedCoupon && (
                                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2 text-emerald-800 font-bold">
                                        <Sparkles size={14} />
                                        <span>&apos;{appliedCoupon.couponCode}&apos; Applied (-₹{appliedCoupon.discountAmount})</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRemoveCoupon}
                                        className="text-rose-600 hover:text-rose-800 font-bold text-xs cursor-pointer"
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}

                            {/* Available Coupons Strip / Clickable Cards */}
                            {availableCoupons.length > 0 && (
                                <div className="space-y-2 pt-2 border-t border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available Offers:</p>
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                        {availableCoupons.map((coupon) => {
                                            const isApplied = appliedCoupon?.couponCode === coupon.couponName;
                                            return (
                                                <div
                                                    key={coupon._id}
                                                    onClick={() => !isApplied && handleApplyCoupon(coupon.couponName)}
                                                    className={`p-3 rounded-2xl border border-dashed transition-all cursor-pointer flex items-center justify-between gap-2 ${isApplied
                                                            ? 'border-emerald-300 bg-emerald-50/50'
                                                            : 'border-indigo-200 bg-indigo-50/30 hover:bg-indigo-50/60'
                                                        }`}
                                                >
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-xs font-extrabold text-[#3d3f96]">{coupon.couponName}</span>
                                                            {isApplied && (
                                                                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">Applied</span>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] text-slate-500 mt-0.5">
                                                            {coupon.discountPercentage}% OFF up to ₹{coupon.maxDiscount} (Min ₹{coupon.minOrderAmount})
                                                        </p>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        className="text-[11px] font-extrabold text-[#3d3f96] hover:underline shrink-0 cursor-pointer"
                                                    >
                                                        {isApplied ? 'Active' : 'Apply'}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 2. STICKY PAYMENT SUMMARY & CTA */}
                        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-lg shadow-slate-100 sticky top-24 z-30">

                            <h3 className="text-base font-extrabold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
                                <span>Payment Summary</span>
                                {summaryLoading && <Loader2 size={14} className="animate-spin text-[#3d3f96]" />}
                            </h3>

                            {/* Active Subscription Banner (If active) */}
                            {billSummary?.subscriptionDetails?.isSubscriptionApplied && (
                                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 mb-4 flex items-center gap-2 text-xs text-amber-900 font-bold">
                                    <Crown size={16} className="text-amber-600 shrink-0" />
                                    <span>Free Consultation with {billSummary.subscriptionDetails.planName || 'Active Plan'}</span>
                                </div>
                            )}

                            {/* Detailed Bill Breakdown */}
                            <div className="space-y-2.5 text-xs text-slate-600 mb-5">
                                <div className="flex justify-between">
                                    <span>Consultation Base Fee</span>
                                    <span className="font-bold text-slate-800">
                                        ₹{billSummary?.baseFee ?? reviewData.consultationFee}
                                    </span>
                                </div>

                                {(billSummary?.visitCharge > 0) && (
                                    <div className="flex justify-between">
                                        <span>Home Visit Travel Fee</span>
                                        <span className="font-bold text-slate-800">₹{billSummary.visitCharge}</span>
                                    </div>
                                )}

                                {(billSummary?.premiumFee > 0 || reviewData.slot?.premiumFee > 0) && (
                                    <div className="flex justify-between text-amber-700 font-semibold">
                                        <span>Peak Slot Surcharge</span>
                                        <span>+₹{billSummary?.premiumFee || reviewData.slot?.premiumFee}</span>
                                    </div>
                                )}

                                {(billSummary?.discount > 0 || appliedCoupon?.discountAmount > 0) && (
                                    <div className="flex justify-between text-emerald-600 font-bold">
                                        <span>Coupon / Promo Discount</span>
                                        <span>-₹{billSummary?.discount || appliedCoupon?.discountAmount}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-slate-600">
                                    <span>Platform & Processing Fee</span>
                                    <span className="font-bold text-emerald-600">FREE</span>
                                </div>

                                <div className="flex justify-between text-base font-extrabold text-slate-900 pt-3 border-t border-slate-200/80">
                                    <span>Total Amount Payable</span>
                                    <span className="text-[#3d3f96] text-lg">₹{payableFee}</span>
                                </div>
                            </div>

                            {/* Final Confirmation CTA Button */}
                            <button
                                type="button"
                                onClick={handleConfirmAndPay}
                                disabled={submitting || summaryLoading}
                                className="w-full bg-[#3d3f96] hover:bg-slate-900 text-white py-4 rounded-2xl text-xs font-extrabold tracking-wider uppercase transition-all duration-200 shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99] mb-3"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        <span>Processing Appointment...</span>
                                    </>
                                ) : (
                                    <>
                                        <Lock size={15} />
                                        <span>{paymentMethod === 'COD' ? 'Confirm Appointment (COD)' : `Pay ₹${payableFee} & Book`}</span>
                                        <ArrowRight size={15} />
                                    </>
                                )}
                            </button>

                            {/* Trust & Guarantee */}
                            <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50/80 border border-emerald-200/60 p-2.5 rounded-2xl">
                                <ShieldCheck size={14} className="fill-emerald-100" />
                                <span>100% Encrypted & MCI Compliant</span>
                            </div>

                        </div>

                    </div>

                </div>
            </main>
        </div>
    );
}