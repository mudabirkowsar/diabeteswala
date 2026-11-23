"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import {
    ArrowLeft,
    Calendar,
    Clock,
    User,
    Phone,
    Mail,
    Building2,
    CheckCircle2,
    Clock3,
    XCircle,
    FileText,
    Receipt,
    ExternalLink,
    Stethoscope,
    CreditCard,
    AlertCircle,
    Sparkles,
    Printer,
    Activity,
    FileCheck,
    Loader2,
    BedDouble,
    HeartPulse,
    Ambulance,
    Users,
    ShieldAlert,
    Droplet,
    Check,
    X,
    AlertTriangle,
    PlayCircle,
    UserPlus,
    Heart,
    Thermometer,
    Wind,
    PlusCircle,
    Pill,
    Edit3,
    FlaskConical,
    Package
} from 'lucide-react';

import ClinicDoctorAPI from '../../../../../../services/ClinicDoctorAPI';

// Modular OPD Components from ./components
import PatientVitalsModal from '../components/PatientVitalsModal';
import PrescriptionModal from '../components/PrescriptionModal';
import SecondaryDoctorModal from '../components/SecondaryDoctorModal';
import PrescribeTestModal from '../components/PrescribeTestModal';

export default function ClinicDoctorAppointmentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const appointmentId = params?.id;

    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);

    // Accept / Reject Action States
    const [actionLoading, setActionLoading] = useState(false);
    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [acceptNotes, setAcceptNotes] = useState('');
    const [rejectReason, setRejectReason] = useState('');

    // 4-Step Consultation Modals
    const [showVitalsModal, setShowVitalsModal] = useState(false);
    const [showSecondaryDocModal, setShowSecondaryDocModal] = useState(false);
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
    const [showTestModal, setShowTestModal] = useState(false);

    // Fetch 360° Appointment Dossier
    const fetchFullDetails = useCallback(async () => {
        if (!appointmentId) return;
        setLoading(true);
        try {
            const response = await ClinicDoctorAPI.getClinicDoctorAppointmentDetails(appointmentId);
            if (response && response.success) {
                setDetail(response.data);
            } else {
                setDetail(null);
                toast.error(response?.message || "Failed to load appointment details");
            }
        } catch (err) {
            console.error("Error retrieving clinic appointment dossier:", err);
            toast.error(err?.response?.data?.message || err.message || "Failed to fetch appointment record");
            setDetail(null);
        } finally {
            setLoading(false);
        }
    }, [appointmentId]);

    useEffect(() => {
        fetchFullDetails();
    }, [fetchFullDetails]);

    // MongoDB _id fallback
    const activeMongoId = detail?._id || appointmentId;

    // Handle Accept
    const handleAcceptAppointment = async () => {
        if (!activeMongoId) return;
        setActionLoading(true);
        try {
            const response = await ClinicDoctorAPI.acceptClinicDoctorAppointment(
                activeMongoId,
                acceptNotes.trim()
            );
            if (response && response.success) {
                toast.success(response.message || "Appointment accepted successfully!");
                setShowAcceptModal(false);
                setAcceptNotes('');
                await fetchFullDetails();
            } else {
                toast.error(response?.message || "Failed to accept appointment");
            }
        } catch (err) {
            console.error("Error accepting appointment:", err);
            toast.error(err?.response?.data?.message || err.message || "Could not accept appointment");
        } finally {
            setActionLoading(false);
        }
    };

    // Handle Reject
    const handleRejectAppointment = async () => {
        if (!activeMongoId) return;
        if (!rejectReason.trim()) {
            toast.error("Rejection reason is mandatory.");
            return;
        }

        setActionLoading(true);
        try {
            const response = await ClinicDoctorAPI.rejectClinicDoctorAppointment(
                activeMongoId,
                rejectReason.trim()
            );
            if (response && response.success) {
                toast.success(response.message || "Appointment returned to Clinic for reassignment.");
                setShowRejectModal(false);
                setRejectReason('');
                await fetchFullDetails();
            } else {
                toast.error(response?.message || "Failed to reject appointment");
            }
        } catch (err) {
            console.error("Error rejecting appointment:", err);
            toast.error(err?.response?.data?.message || err.message || "Could not reject appointment");
        } finally {
            setActionLoading(false);
        }
    };

    // Handle Start OPD Consultation
    const handleStartConsultation = async () => {
        if (!activeMongoId) return;
        setActionLoading(true);
        try {
            const response = await ClinicDoctorAPI.startOPDConsultation(activeMongoId);
            if (response && response.success) {
                toast.success(response.message || "Consultation started! Status is now 'In-Progress'.");
                await fetchFullDetails();
            } else {
                toast.error(response?.message || "Failed to start consultation");
            }
        } catch (err) {
            console.error("Error starting consultation:", err);
            toast.error(err?.response?.data?.message || err.message || "Could not start consultation");
        } finally {
            setActionLoading(false);
        }
    };

    // Badges Helpers
    const getCategoryBadge = (category = '', triage = null) => {
        const upper = (category || '').toUpperCase();
        if (upper === 'EMERGENCY' || triage === 'Emergency') {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 shadow-2xs">
                    <HeartPulse size={13} className="text-rose-600 animate-pulse" /> Emergency Case
                </span>
            );
        }
        if (upper === 'IPD') {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200 shadow-2xs">
                    <BedDouble size={13} className="text-purple-600" /> Inpatient Admission (IPD)
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 shadow-2xs">
                <Activity size={13} className="text-blue-600" /> Outpatient Consultation (OPD)
            </span>
        );
    };

    const getStatusBadge = (status = '') => {
        const normalized = (status || '').toLowerCase().replace(/[\s_]/g, '-');
        if (['confirmed', 'in-progress'].includes(normalized)) {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                    <CheckCircle2 size={13} /> {status || 'Confirmed'}
                </span>
            );
        }
        if (['pending', 'clinic-pending'].includes(normalized)) {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
                    <Clock3 size={13} /> {status || 'Pending'}
                </span>
            );
        }
        if (normalized.includes('cancel') || normalized.includes('reject')) {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
                    <XCircle size={13} /> {status || 'Cancelled'}
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs">
                {status || 'Scheduled'}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen text-slate-800 flex flex-col items-center justify-center p-6 text-center">
                <Toaster position="top-right" />
                <Loader2 className="animate-spin text-indigo-600 mb-3" size={36} />
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">
                    Loading Clinical Case Dossier...
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                    Retrieving 360° clinical summary, stay calculations, and treatment timeline
                </p>
            </div>
        );
    }

    if (!detail) {
        return (
            <div className="min-h-screen text-slate-800 flex flex-col items-center justify-center p-6 text-center space-y-4">
                <Toaster position="top-right" />
                <div className="w-14 h-14 rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm">
                    <AlertCircle size={28} />
                </div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">Case Record Not Found</h2>
                <p className="text-xs text-slate-400 max-w-sm font-medium">
                    Unable to locate this clinical case dossier. You may not be assigned as an attending physician or bedside specialist.
                </p>
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-2xl transition shadow-md cursor-pointer"
                >
                    <ArrowLeft size={14} /> Back to Appointments List
                </button>
            </div>
        );
    }

    // Safe Data Deconstruction
    const patient = detail?.resolvedPatient || detail?.patient || {};
    const diabetic = patient?.diabeticProfile || null;
    const clinic = detail?.clinicId || detail?.clinic || {};
    const primaryDoc = detail?.doctorId || detail?.doctor || {};
    const stay = detail?.stayCalculation || detail?.stayDetails || null;
    const billing = detail?.billingSummary || detail?.payment || {};
    const paymentDetails = billing?.paymentDetails || {};
    const clinical = detail?.clinicalSummary || {};

    // Vitals
    const vitals =
        clinical?.vitals ||
        detail?.vitals ||
        clinical?.patientVitals ||
        detail?.patientVitals ||
        null;

    const hasVitals = !!(
        vitals &&
        (vitals.bp || vitals.pulse || vitals.temp || vitals.spo2 || vitals.notes)
    );

    const files = detail?.clinicalFiles || {};
    const timeline = detail?.treatmentTeamTimeline || detail?.bedsideCareTeam || [];
    const permissions = detail?.doctorPermissions || {};
    const reports = files?.uploadedReports || clinical?.uploadedReports || [];
    const prescriptions = detail?.prescriptions || [];

    // Lab Referrals sent to Clinic Lab
    const clinicLabReferral = detail?.clinicLabReferral || null;
    const referredTests = clinicLabReferral?.tests || [];

    // Normalized Status Checks
    const rawStatus = (detail?.status || detail?.appointmentInfo?.status || '').trim().toLowerCase().replace(/[\s_]/g, '-');
    const rawAcceptance = (detail?.doctorAcceptanceStatus || '').trim().toLowerCase();

    const isConsultationInProgress = rawStatus === 'in-progress' || rawStatus.includes('progress');
    const isConfirmed = rawStatus === 'confirmed';
    const isAccepted = rawAcceptance === 'accepted' || isConsultationInProgress || isConfirmed;
    const isRejected = rawAcceptance === 'rejected';
    const isClosed = ['completed', 'cancelled', 'no-show', 'discharged'].some((st) => rawStatus.includes(st));

    const canRespond = !isAccepted && !isRejected && !isClosed && !isConsultationInProgress;
    const canStartConsultation = isConfirmed && !isConsultationInProgress && !isClosed;

    return (
        <div className="min-h-screen text-slate-800 pb-20">
            <Toaster position="top-right" reverseOrder={false} />

            <div className="max-w-7xl mx-auto space-y-6">

                {/* Top Header */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="inline-flex items-center gap-2 text-xs font-black text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 px-3.5 py-2 rounded-xl transition cursor-pointer"
                        >
                            <ArrowLeft size={14} />
                            <span>Back</span>
                        </button>
                        <span className="h-4 w-px bg-slate-200" />
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block leading-none">
                                Clinical Booking ID
                            </span>
                            <h1 className="text-sm sm:text-base font-black text-indigo-700 font-mono mt-0.5">
                                {detail.bookingId || detail._id}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {getCategoryBadge(detail.categoryTag || detail.bookingType, detail.triageLevel)}
                        {getStatusBadge(detail.status)}
                        <button
                            onClick={() => window.print()}
                            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition cursor-pointer"
                            title="Print Clinical Record"
                        >
                            <Printer size={15} />
                        </button>
                    </div>
                </div>

                {/* Action Required: Accept / Reject Banner */}
                {canRespond && (
                    <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-500/10 border-2 border-amber-300 p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
                                    Action Required • Assigned Case
                                </span>
                                <h3 className="text-sm font-black text-slate-900">
                                    {permissions.isPendingHandoverTarget
                                        ? "Incoming Handover Request Awaiting Your Confirmation"
                                        : "This patient appointment is assigned to you"}
                                </h3>
                                <p className="text-xs text-slate-600 font-medium mt-0.5">
                                    Please review the patient summary and accept this case or reject it back to the clinic queue.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
                            <button
                                type="button"
                                onClick={() => setShowRejectModal(true)}
                                disabled={actionLoading}
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-rose-700 bg-white hover:bg-rose-50 border border-rose-300 transition shadow-2xs cursor-pointer disabled:opacity-50"
                            >
                                <X size={14} />
                                <span>Reject Case</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowAcceptModal(true)}
                                disabled={actionLoading}
                                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
                            >
                                <Check size={15} />
                                <span>Accept Case</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* TOP OPD CLINICAL WORKSPACE CONTROL STRIP */}
                <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-5 sm:p-6 rounded-3xl shadow-xl border border-indigo-700/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${isConsultationInProgress
                                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 animate-pulse'
                                : 'bg-white/10 border-white/20 text-white'
                            }`}>
                            <Activity size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${isConsultationInProgress
                                        ? 'text-emerald-300 bg-emerald-950/60 border-emerald-800'
                                        : 'text-indigo-200 bg-indigo-950/60 border-indigo-800'
                                    }`}>
                                    {isConsultationInProgress ? 'Encounter In-Progress' : (detail.status || 'Active Consultation')}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">Clinical Desk</span>
                            </div>
                            <h3 className="text-sm sm:text-base font-black text-white mt-1">
                                OPD Consultation &amp; Prescription Desk
                            </h3>
                            <p className="text-xs text-indigo-200 font-medium mt-0.5">
                                Follow clinical steps: record vitals, collaborate with specialists, prescribe medicines &amp; order tests.
                            </p>
                        </div>
                    </div>

                    {/* Sequential Action Buttons: Start Consultation -> 1. Vitals -> 2. Add Doctor -> 3. Prescribe Medicine -> 4. Prescribe Test */}
                    <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto shrink-0">
                        {canStartConsultation && (
                            <button
                                type="button"
                                onClick={handleStartConsultation}
                                disabled={actionLoading}
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black text-indigo-950 bg-emerald-400 hover:bg-emerald-300 transition shadow-md cursor-pointer disabled:opacity-50"
                            >
                                {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <PlayCircle size={15} />}
                                <span>Start Consultation</span>
                            </button>
                        )}

                        {/* 1. Vitals */}
                        <button
                            type="button"
                            onClick={() => setShowVitalsModal(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition shadow-xs cursor-pointer"
                        >
                            <Activity size={14} className="text-rose-400" />
                            <span>1. Vitals</span>
                        </button>

                        {/* 2. Add Another Doctor */}
                        <button
                            type="button"
                            onClick={() => setShowSecondaryDocModal(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition shadow-xs cursor-pointer"
                        >
                            <UserPlus size={14} className="text-teal-400" />
                            <span>2. Add Another Doctor</span>
                        </button>

                        {/* 3. Prescribe Medicine */}
                        <button
                            type="button"
                            onClick={() => setShowPrescriptionModal(true)}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black text-indigo-950 bg-white hover:bg-indigo-50 transition shadow-md shadow-white/10 cursor-pointer"
                        >
                            <Pill size={14} className="text-indigo-600" />
                            <span>3. Prescribe Medicine</span>
                        </button>

                        {/* 4. Prescribe Test */}
                        <button
                            type="button"
                            onClick={() => setShowTestModal(true)}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black text-cyan-950 bg-cyan-400 hover:bg-cyan-300 transition shadow-md shadow-cyan-400/20 cursor-pointer"
                        >
                            <FlaskConical size={14} className="text-cyan-950" />
                            <span>4. Prescribe Test</span>
                        </button>
                    </div>
                </div>

                {/* Main 2-Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* LEFT COLUMN: VITALS, PRESCRIBED MEDICINES, PRESCRIBED TESTS, SCHEDULE, PATIENT, CLINICAL (7/12) */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* 1. PATIENT VITALS SECTION */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                                <div className="flex items-center gap-2 text-rose-600">
                                    <Activity size={18} />
                                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                        Patient Physiological Vitals
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowVitalsModal(true)}
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-xl transition cursor-pointer"
                                >
                                    <Edit3 size={12} />
                                    <span>{hasVitals ? "Update Vitals" : "Record Vitals"}</span>
                                </button>
                            </div>

                            {hasVitals ? (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {/* BP */}
                                        <div className="bg-rose-50/60 p-3 rounded-2xl border border-rose-100 flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                                                <Activity size={16} />
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-rose-700 uppercase block font-bold">BP (mmHg)</span>
                                                <strong className="text-xs sm:text-sm font-black text-slate-900 font-mono">
                                                    {vitals?.bp || '—'}
                                                </strong>
                                            </div>
                                        </div>

                                        {/* Pulse */}
                                        <div className="bg-red-50/60 p-3 rounded-2xl border border-red-100 flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                                                <Heart size={16} />
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-red-700 uppercase block font-bold">Pulse (BPM)</span>
                                                <strong className="text-xs sm:text-sm font-black text-slate-900 font-mono">
                                                    {vitals?.pulse || '—'}
                                                </strong>
                                            </div>
                                        </div>

                                        {/* Temp */}
                                        <div className="bg-amber-50/60 p-3 rounded-2xl border border-amber-100 flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                                                <Thermometer size={16} />
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-amber-700 uppercase block font-bold">Body Temp</span>
                                                <strong className="text-xs sm:text-sm font-black text-slate-900 font-mono">
                                                    {vitals?.temp || '—'}
                                                </strong>
                                            </div>
                                        </div>

                                        {/* SpO2 */}
                                        <div className="bg-blue-50/60 p-3 rounded-2xl border border-blue-100 flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                                <Wind size={16} />
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-blue-700 uppercase block font-bold">SpO2 (%)</span>
                                                <strong className="text-xs sm:text-sm font-black text-slate-900 font-mono">
                                                    {vitals?.spo2 || '—'}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>

                                    {vitals?.notes && (
                                        <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 font-medium">
                                            <strong className="font-bold text-slate-800">Triage Note: </strong>
                                            {vitals.notes}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center space-y-2.5">
                                    <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
                                        <Activity size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-800">No Patient Vitals Recorded</h4>
                                        <p className="text-[11px] text-slate-400">
                                            Record BP, pulse, temperature, and SpO2 to complete the clinical examination.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowVitalsModal(true)}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                                    >
                                        <PlusCircle size={13} />
                                        <span>Record Vitals Now</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 2. CLINICAL PRESCRIPTION SECTION (Rx & Pharmacy) */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                                <div className="flex items-center gap-2 text-indigo-600">
                                    <Pill size={18} />
                                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                        Prescribed Medications &amp; Pharmacy Rx ({prescriptions.length})
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowPrescriptionModal(true)}
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-xl transition cursor-pointer"
                                >
                                    <PlusCircle size={12} />
                                    <span>Prescribe Medicine</span>
                                </button>
                            </div>

                            {prescriptions.length > 0 ? (
                                <div className="space-y-3">
                                    {prescriptions.map((rx, idx) => (
                                        <div key={rx._id || idx} className="p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100 space-y-3">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                                                    Prescription #{idx + 1}
                                                </span>
                                                {rx.nextAppointment && (
                                                    <span className="text-[11px] font-bold text-slate-500">
                                                        Follow-up: <strong className="text-slate-800">{rx.nextAppointment}</strong>
                                                    </span>
                                                )}
                                            </div>

                                            {rx.medicines && rx.medicines.length > 0 && (
                                                <div className="space-y-1.5 pt-1">
                                                    {rx.medicines.map((med, mIdx) => (
                                                        <div key={mIdx} className="p-2.5 bg-white rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                                                            <div>
                                                                <strong className="text-slate-900 block font-bold">{med.name}</strong>
                                                                <span className="text-[11px] text-slate-400">
                                                                    {med.instructions || 'After food'}
                                                                </span>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="font-mono font-bold text-indigo-700 block text-[11px]">
                                                                    {med.dose} • {med.duration}
                                                                </span>
                                                                <span className="text-[10px] text-slate-400 block">{med.time || 'Daily'}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {rx.adviceGiven && (
                                                <p className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100">
                                                    <strong>Advice: </strong>{rx.adviceGiven}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center space-y-2.5">
                                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-800">No Medications Prescribed Yet</h4>
                                        <p className="text-[11px] text-slate-400">
                                            Search medicines from clinic pharmacy stock or master catalog and dispatch directly.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowPrescriptionModal(true)}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                                    >
                                        <PlusCircle size={13} />
                                        <span>Prescribe Medicine</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 3. ORDERED DIAGNOSTIC LAB TESTS SECTION (Live API Linked) */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                                <div className="flex items-center gap-2 text-cyan-600">
                                    <FlaskConical size={18} />
                                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                        Referred Clinic Lab Tests ({referredTests.length})
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowTestModal(true)}
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-700 hover:text-cyan-900 bg-cyan-50 hover:bg-cyan-100 px-3 py-1 rounded-xl transition cursor-pointer"
                                >
                                    <PlusCircle size={12} />
                                    <span>Prescribe Test</span>
                                </button>
                            </div>

                            {referredTests.length > 0 ? (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between bg-cyan-50/70 p-3 rounded-2xl border border-cyan-200 text-xs">
                                        <div className="flex items-center gap-2">
                                            <Building2 size={16} className="text-cyan-700" />
                                            <span className="font-bold text-cyan-950">
                                                Order Status: <strong className="uppercase text-cyan-800">{clinicLabReferral?.status || 'Sent'}</strong>
                                            </span>
                                        </div>
                                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase bg-white text-cyan-800 border border-cyan-200">
                                            Priority: {clinicLabReferral?.priority || 'Routine'}
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        {referredTests.map((t, idx) => (
                                            <div
                                                key={idx}
                                                className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between text-xs shadow-2xs"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center shrink-0">
                                                        {t.itemType === 'LabPackage' ? <Package size={15} /> : <FlaskConical size={15} />}
                                                    </div>
                                                    <div>
                                                        <strong className="text-slate-900 block font-bold">{t.name}</strong>
                                                        <span className="text-[10px] text-slate-500">
                                                            {t.instructions || t.itemType || 'Diagnostic Requisition'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <span className="font-mono font-bold text-slate-800">
                                                    ₹{t.price || 0}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {clinicLabReferral?.notes && (
                                        <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 font-medium">
                                            <strong>Technician Instructions: </strong>{clinicLabReferral.notes}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center space-y-2.5">
                                    <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-600 mx-auto flex items-center justify-center">
                                        <FlaskConical size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-800">No Diagnostic Tests Ordered</h4>
                                        <p className="text-[11px] text-slate-400">
                                            Prescribe pathology tests, packages, or custom lab orders to be routed directly to the Clinic Lab.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowTestModal(true)}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                                    >
                                        <PlusCircle size={13} />
                                        <span>Prescribe Test Now</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 4. Schedule & Admission Card */}
                        <div className="bg-gradient-to-br from-indigo-500/10 via-amber-500/5 to-transparent bg-white p-6 rounded-3xl border-2 border-indigo-200 shadow-sm space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-800 flex items-center gap-1.5">
                                    <Sparkles size={13} className="text-indigo-600" /> Case Scheduling &amp; Encounter Details
                                </span>
                                <span className="text-[10px] font-bold text-slate-500 font-mono">
                                    {detail.consultationType || 'Clinic Visit'}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                <div className="p-3.5 bg-white/95 rounded-2xl border border-indigo-100 flex items-center gap-3 shadow-2xs">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Appointment Date</span>
                                        <strong className="text-xs sm:text-sm font-black text-slate-900 font-mono">
                                            {detail.appointmentDate ? new Date(detail.appointmentDate).toISOString().split('T')[0] : 'Today'}
                                        </strong>
                                    </div>
                                </div>

                                <div className="p-3.5 bg-white/95 rounded-2xl border border-indigo-100 flex items-center gap-3 shadow-2xs">
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Time Slot</span>
                                        <strong className="text-xs sm:text-sm font-black text-amber-800 font-mono">
                                            {detail.appointmentTime || 'Immediate Walk-in'}
                                        </strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 5. Patient Profile Card */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                                <div className="flex items-center gap-2 text-indigo-600">
                                    <User size={16} />
                                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                        Patient Profile Dossier
                                    </h3>
                                </div>
                                {patient.bloodGroup && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                                        <Droplet size={11} /> {patient.bloodGroup}
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-medium">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Patient Name</span>
                                    <strong className="text-sm font-black text-slate-900 block mt-0.5">
                                        {patient.patientName || patient.name || 'Anonymous'}
                                    </strong>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Demographics</span>
                                    <span className="text-slate-800 font-bold block mt-0.5">
                                        {patient.age || 'N/A'} Yrs • {patient.gender || 'N/A'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Relation</span>
                                    <span className="text-slate-800 font-bold block mt-0.5">
                                        {patient.relation || 'Self'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Contact Phone</span>
                                    <span className="text-slate-800 font-mono font-bold block mt-0.5 flex items-center gap-1">
                                        <Phone size={11} className="text-slate-400" /> {patient.phone || 'N/A'}
                                    </span>
                                </div>
                                {patient.email && (
                                    <div className="col-span-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Email Address</span>
                                        <span className="text-slate-800 font-mono font-bold block mt-0.5 flex items-center gap-1">
                                            <Mail size={11} className="text-slate-400" /> {patient.email}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Reported Symptoms */}
                            {(detail.bookingReason || clinical.chiefComplaint) && (
                                <div className="pt-2 border-t border-slate-50 space-y-1">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                                        Chief Complaint / Admission Reason
                                    </span>
                                    <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 font-semibold leading-relaxed">
                                        &ldquo;{detail.bookingReason || clinical.chiefComplaint}&rdquo;
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* 6. Diabetic Profile & Comorbidities */}
                        {diabetic && (
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                                <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                                    <div className="flex items-center gap-2 text-rose-600">
                                        <Activity size={16} />
                                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                            Diabetic &amp; Chronic Profile
                                        </h3>
                                    </div>
                                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                                        {diabetic.diabeticType || 'Diabetic'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                        <span className="text-[10px] text-slate-400 uppercase block font-bold">Duration</span>
                                        <span className="font-bold text-slate-900">{diabetic.sinceHowLong || 'N/A'}</span>
                                    </div>
                                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                        <span className="text-[10px] text-slate-400 uppercase block font-bold">Height / Weight</span>
                                        <span className="font-bold text-slate-900">{diabetic.height || '—'} / {diabetic.weight || '—'}</span>
                                    </div>
                                    <div className="col-span-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                        <span className="text-[10px] text-slate-400 uppercase block font-bold">Current Medications</span>
                                        <span className="font-bold text-slate-900 truncate block">{diabetic.takingMedicines || 'None specified'}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 7. Inpatient Ward & Bed Details */}
                        {stay && (
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                                    <div className="flex items-center gap-2 text-purple-700">
                                        <BedDouble size={16} />
                                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                            Inpatient Ward &amp; Bed Details
                                        </h3>
                                    </div>
                                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200">
                                        {stay.wardType || 'Ward'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                    <div className="bg-purple-50/50 p-3 rounded-2xl border border-purple-100">
                                        <span className="text-[10px] text-purple-600 uppercase block font-bold">Ward Name</span>
                                        <strong className="text-slate-900 font-black">{stay.wardName}</strong>
                                    </div>
                                    <div className="bg-purple-50/50 p-3 rounded-2xl border border-purple-100">
                                        <span className="text-[10px] text-purple-600 uppercase block font-bold">Bed Number</span>
                                        <strong className="text-slate-900 font-mono font-black">{stay.bedNumber}</strong>
                                    </div>
                                    <div className="bg-purple-50/50 p-3 rounded-2xl border border-purple-100">
                                        <span className="text-[10px] text-purple-600 uppercase block font-bold">Stay Duration</span>
                                        <strong className="text-slate-900 font-black">{stay.bookedDays || stay.stayDuration || 1} Day(s)</strong>
                                    </div>
                                    <div className="bg-purple-50/50 p-3 rounded-2xl border border-purple-100">
                                        <span className="text-[10px] text-purple-600 uppercase block font-bold">Rate Per Day</span>
                                        <strong className="text-purple-800 font-mono font-black">₹{stay.pricePerDay || 0}</strong>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 8. Care Team & Specialist Timeline */}
                        {timeline.length > 0 && (
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                                <div className="flex items-center gap-2 text-indigo-600 border-b border-slate-50 pb-3">
                                    <Users size={16} />
                                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                        Clinical Care Team &amp; Specialists
                                    </h3>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {timeline.map((member, idx) => (
                                        <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                                            <div>
                                                <strong className="text-slate-900 font-bold block">{member.name}</strong>
                                                <span className="text-[11px] text-slate-500">{member.speciality} • {member.qualification}</span>
                                            </div>
                                            <span className="px-2.5 py-1 rounded-xl text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                {member.role || 'Specialist'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* RIGHT COLUMN: CLINIC INFO, DOCTOR, BILLING, TRANSACTION (5/12) */}
                    <div className="lg:col-span-5 space-y-6">

                        {/* Clinic Facility */}
                        {clinic && clinic.clinicName && (
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                                <div className="flex items-center gap-2 text-indigo-600 border-b border-slate-50 pb-3">
                                    <Building2 size={16} />
                                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                        Clinic Center
                                    </h3>
                                </div>
                                <div className="text-xs space-y-1">
                                    <h4 className="text-sm font-black text-slate-900">{clinic.clinicName}</h4>
                                    <p className="text-slate-600 font-medium">{clinic.address}, {clinic.city}, {clinic.state}</p>
                                    {clinic.phoneNumber && (
                                        <p className="text-slate-500 font-mono text-[11px] pt-1">
                                            Helpline: {clinic.phoneNumber}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Doctor Profile */}
                        {primaryDoc && primaryDoc.name && (
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                                <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                                    <div className="flex items-center gap-2 text-indigo-600">
                                        <Stethoscope size={16} />
                                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                            Primary Attending Doctor
                                        </h3>
                                    </div>
                                    {primaryDoc.dutyStatus && (
                                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            {primaryDoc.dutyStatus}
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs space-y-1">
                                    <h4 className="text-sm font-black text-slate-900">{primaryDoc.name}</h4>
                                    <p className="text-indigo-700 font-bold">{primaryDoc.speciality} ({primaryDoc.qualification})</p>
                                    <p className="text-slate-500 text-[11px]">Experience: {primaryDoc.experienceYears || '10+'} Years</p>
                                </div>
                            </div>
                        )}

                        {/* Billing Ledger & Hospital Fees */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                                <div className="flex items-center gap-2 text-indigo-600">
                                    <Receipt size={16} />
                                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                        Billing &amp; Hospital Fees
                                    </h3>
                                </div>
                                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md ${billing.paymentStatus === 'Paid'
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : 'bg-amber-50 text-amber-700'
                                    }`}>
                                    {billing.paymentStatus || 'Unpaid'}
                                </span>
                            </div>

                            <div className="space-y-2.5 text-xs font-medium text-slate-600">
                                <div className="flex justify-between">
                                    <span>Base Doctor Fee:</span>
                                    <span className="font-mono font-bold text-slate-900">₹{billing.baseDoctorFee || 0}</span>
                                </div>

                                {billing.bedOrVisitCharges > 0 && (
                                    <div className="flex justify-between">
                                        <span>Bed / Admission Charges:</span>
                                        <span className="font-mono font-bold text-slate-900">₹{billing.bedOrVisitCharges}</span>
                                    </div>
                                )}

                                {billing.ambulanceOrExtraCharges > 0 && (
                                    <div className="flex justify-between">
                                        <span>Ambulance / Emergency Surcharge:</span>
                                        <span className="font-mono font-bold text-slate-900">₹{billing.ambulanceOrExtraCharges}</span>
                                    </div>
                                )}

                                {billing.discountAmount > 0 && (
                                    <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50/70 p-2 rounded-xl border border-emerald-100">
                                        <span>Applied Concession / Discount:</span>
                                        <span className="font-mono">- ₹{billing.discountAmount}</span>
                                    </div>
                                )}

                                <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between text-slate-900">
                                    <div>
                                        <span className="text-xs font-black uppercase tracking-wider block">Total Amount</span>
                                        <span className="text-[10px] text-slate-400">All inclusive</span>
                                    </div>
                                    <strong className="text-xl font-black font-mono text-indigo-700">
                                        ₹{billing.totalAmount || detail.totalAmount || 0}
                                    </strong>
                                </div>
                            </div>
                        </div>

                        {/* Gateway Transaction ID */}
                        {paymentDetails && paymentDetails.razorpayPaymentId && (
                            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2.5 text-xs">
                                <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-50 pb-2">
                                    <CreditCard size={14} className="text-indigo-600" />
                                    <h4 className="text-[11px] font-black uppercase tracking-wider">Gateway Transaction ID</h4>
                                </div>
                                <div className="space-y-1.5 font-mono text-[11px] text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                    <div className="flex justify-between">
                                        <span className="font-sans text-slate-400">Payment ID:</span>
                                        <strong className="text-slate-800">{paymentDetails.razorpayPaymentId}</strong>
                                    </div>
                                    {paymentDetails.razorpayOrderId && (
                                        <div className="flex justify-between">
                                            <span className="font-sans text-slate-400">Order ID:</span>
                                            <span>{paymentDetails.razorpayOrderId}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Ambulance Transport */}
                        {detail.ambulanceId && (
                            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2 text-xs">
                                <div className="flex items-center gap-2 text-rose-600 font-bold border-b border-slate-50 pb-2">
                                    <Ambulance size={16} />
                                    <h4 className="text-[11px] font-black uppercase tracking-wider">Emergency Ambulance Linked</h4>
                                </div>
                                <div className="text-slate-700 space-y-1">
                                    <p>Vehicle: <strong className="font-mono text-slate-900">{detail.ambulanceId.vehicleNumber}</strong></p>
                                    <p>Driver: <strong className="text-slate-900">{detail.ambulanceId.driverName}</strong> ({detail.ambulanceId.phone})</p>
                                </div>
                            </div>
                        )}

                    </div>

                </div>

            </div>

            {/* MODALS */}
            {showAcceptModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                <CheckCircle2 size={22} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-900">Accept Clinical Case</h3>
                                <p className="text-xs text-slate-500">Confirm assignment for Booking #{detail.bookingId}</p>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600 uppercase">
                                Initial Consultation Notes (Optional)
                            </label>
                            <textarea
                                rows={3}
                                placeholder="E.g., Patient accepted for consultation, ready in OPD Room 2..."
                                value={acceptNotes}
                                onChange={(e) => setAcceptNotes(e.target.value)}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowAcceptModal(false)}
                                disabled={actionLoading}
                                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleAcceptAppointment}
                                disabled={actionLoading}
                                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
                            >
                                {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                <span>Confirm Acceptance</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showRejectModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-rose-100 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                                <AlertTriangle size={22} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-900">Reject Assigned Case</h3>
                                <p className="text-xs text-rose-600 font-medium">This will return the case to the Clinic for reassignment</p>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-700 uppercase flex items-center justify-between">
                                <span>Reason for Rejection <span className="text-rose-500">*</span></span>
                                <span className="text-[10px] text-slate-400 font-normal">Mandatory</span>
                            </label>
                            <textarea
                                rows={3}
                                placeholder="E.g., Currently handling an emergency in OT, please reassign to another specialist..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowRejectModal(false)}
                                disabled={actionLoading}
                                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleRejectAppointment}
                                disabled={actionLoading || !rejectReason.trim()}
                                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-md shadow-rose-600/20 cursor-pointer disabled:opacity-50"
                            >
                                {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                                <span>Reject &amp; Return</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 1. Vitals Modal */}
            <PatientVitalsModal
                appointmentId={activeMongoId}
                currentVitals={vitals}
                isOpen={showVitalsModal}
                onClose={() => setShowVitalsModal(false)}
                onSuccess={() => fetchFullDetails()}
            />

            {/* 2. Secondary Doctor Modal */}
            <SecondaryDoctorModal
                appointmentId={activeMongoId}
                isOpen={showSecondaryDocModal}
                onClose={() => setShowSecondaryDocModal(false)}
                onSuccess={() => fetchFullDetails()}
            />

            {/* 3. Prescription Modal */}
            <PrescriptionModal
                appointmentId={activeMongoId}
                isOpen={showPrescriptionModal}
                onClose={() => setShowPrescriptionModal(false)}
                onSuccess={() => fetchFullDetails()}
            />

            {/* 4. Live Prescribe Test Modal (With Clinic Lab API) */}
            <PrescribeTestModal
                appointmentId={activeMongoId}
                isOpen={showTestModal}
                onClose={() => setShowTestModal(false)}
                onSuccess={() => fetchFullDetails()}
            />

        </div>
    );
}