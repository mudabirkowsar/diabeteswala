"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import {
    ArrowLeft,
    Calendar,
    Clock,
    User,
    Building2,
    CheckCircle2,
    Clock3,
    XCircle,
    Activity,
    Pill,
    FlaskConical,
    BedDouble,
    Users,
    CreditCard,
    HeartPulse,
    ShieldAlert,
    Thermometer,
    Printer,
    Download,
    Phone,
    Play,
    Sparkles,
    FileCheck,
    Stethoscope
} from 'lucide-react';

import ClinicDoctorAPI from '../../../../../../services/ClinicDoctorAPI';
import AddVitals from '../components/AddVitals';
import AddMedicines from '../components/AddMedicines';
import AddTests from '../components/AddTests';

export default function ClinicDoctorOpdCaseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id;

    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Modal Visibility States
    const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
    const [isMedicinesModalOpen, setIsMedicinesModalOpen] = useState(false);
    const [isTestsModalOpen, setIsTestsModalOpen] = useState(false);

    const fetchCaseDetails = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const response = await ClinicDoctorAPI.getClinicDoctorOpdAppointmentDetails(id);
            if (response && response.success) {
                setCaseData(response.data);
            } else {
                toast.error(response?.message || "Failed to load clinical case details");
            }
        } catch (err) {
            console.error("Error fetching OPD case details:", err);
            toast.error(err?.response?.data?.message || err.message || "Failed to retrieve case details");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchCaseDetails();
    }, [fetchCaseDetails]);

    // Step 1: Start OPD Consultation
    const handleStartConsultation = async () => {
        setActionLoading(true);
        try {
            const res = await ClinicDoctorAPI.startOpdConsultation(id);
            if (res && res.success) {
                toast.success(res.message || "Consultation started! Case is now In-Progress.");
                fetchCaseDetails();
            } else {
                toast.error(res?.message || "Failed to start consultation");
            }
        } catch (err) {
            console.error("Start consultation failed:", err);
            toast.error(err?.response?.data?.message || err.message || "Could not start consultation");
        } finally {
            setActionLoading(false);
        }
    };

    // Step 9: Complete Consultation
    const handleCompleteConsultation = async () => {
        const confirmComplete = window.confirm("Are you sure you want to conclude this consultation and notify the next waiting token?");
        if (!confirmComplete) return;

        setActionLoading(true);
        try {
            const payload = {
                consultationNotes: "Consultation successfully completed with clinical prescriptions/referrals.",
                advice: "Follow up as instructed"
            };
            const res = await ClinicDoctorAPI.completeOpdConsultation(id, payload);
            if (res && res.success) {
                toast.success(res.message || "Consultation marked as Completed!");
                fetchCaseDetails();
            } else {
                toast.error(res?.message || "Failed to complete consultation");
            }
        } catch (err) {
            console.error("Complete consultation failed:", err);
            toast.error(err?.response?.data?.message || err.message || "Could not complete consultation");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-6 text-center">
                <HeartPulse size={40} className="text-indigo-600 animate-pulse mb-3" />
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-800">
                    Retrieving 360° Clinical Dossier...
                </h2>
                <p className="text-xs text-slate-400 mt-1">Populating vitals, pharmacy, and diagnostic records</p>
            </div>
        );
    }

    if (!caseData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <ShieldAlert size={48} className="text-rose-500 mb-3" />
                <h2 className="text-lg font-black text-slate-900">Case Record Not Found</h2>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    The requested clinical record could not be loaded or has been archived.
                </p>
                <button
                    onClick={() => router.push('/vendors/clinicdoctor/dashboard/OPDAppointments')}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-2xl cursor-pointer"
                >
                    Return to OPD Schedule
                </button>
            </div>
        );
    }

    // Extracted Structures
    const patient = caseData.resolvedPatient || {};
    const diabeticProfile = patient.diabeticProfile || {};
    const conditions = diabeticProfile.conditionStatus || {};
    const vitals = caseData.clinicalSummary?.vitals || {};
    const prescriptions = caseData.prescriptions || [];
    const primaryRx = caseData.prescriptionId || prescriptions[0] || null;
    const pharmacyRef = caseData.clinicPharmacyReferral || null;
    const labRef = caseData.clinicLabReferral || null;
    const admissionRef = caseData.admissionReferral || null;
    const bedsideTeam = caseData.bedsideCareTeam || [];
    const timeline = caseData.treatmentHistory || [];
    const billing = caseData.billingSummary || {};
    const doctor = caseData.doctorId || {};

    const isInProgress = (caseData.status || '').toLowerCase() === 'in-progress';
    const isCompleted = (caseData.status || '').toLowerCase() === 'completed';

    return (
        <div className="min-h-screen text-slate-800 pb-20">
            <Toaster position="top-right" reverseOrder={false} />

            <div className="max-w-7xl mx-auto space-y-6">

                {/* Top Action Nav Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <button
                        onClick={() => router.push('/vendors/clinicdoctor/dashboard/OPDAppointments')}
                        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200 transition shadow-2xs self-start cursor-pointer"
                    >
                        <ArrowLeft size={14} /> Back to OPD Roster
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 transition shadow-2xs cursor-pointer"
                        >
                            <Printer size={14} /> Print Dossier
                        </button>
                    </div>
                </div>

                {/* Clinical Lifecycle Action Strip */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase tracking-wider text-indigo-600">
                                Consultation Lifecycle Flow
                            </span>
                            {caseData.tokenNumber && (
                                <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                    Token #{caseData.tokenNumber}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                            {isCompleted
                                ? "This OPD encounter has concluded and doctor shift time is logged."
                                : isInProgress
                                ? "Consultation is currently In-Progress. Perform vitals check, prescriptions, and lab orders."
                                : "Patient has checked in. Accept the consultation to mark In-Progress and summon token."}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        {!isInProgress && !isCompleted && (
                            <button
                                onClick={handleStartConsultation}
                                disabled={actionLoading}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-xs cursor-pointer disabled:opacity-50"
                            >
                                <Play size={14} />
                                <span>Start Consultation</span>
                            </button>
                        )}

                        {isInProgress && (
                            <>
                                <button
                                    onClick={() => setIsVitalsModalOpen(true)}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer"
                                >
                                    <Activity size={14} />
                                    <span>{vitals.bp ? "Edit Vitals" : "Record Vitals"}</span>
                                </button>

                                <button
                                    onClick={() => setIsMedicinesModalOpen(true)}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition cursor-pointer"
                                >
                                    <Pill size={14} />
                                    <span>{primaryRx ? "Edit Prescription" : "Prescribe Rx"}</span>
                                </button>

                                <button
                                    onClick={() => setIsTestsModalOpen(true)}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition cursor-pointer"
                                >
                                    <FlaskConical size={14} />
                                    <span>Order Lab Tests</span>
                                </button>

                                <button
                                    onClick={handleCompleteConsultation}
                                    disabled={actionLoading}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer disabled:opacity-50"
                                >
                                    <FileCheck size={14} />
                                    <span>Complete Consultation</span>
                                </button>
                            </>
                        )}

                        {isCompleted && (
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 size={14} /> Completed &amp; Archived
                            </span>
                        )}
                    </div>
                </div>

                {/* 1. Master Case Header Card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-start sm:items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-xl font-black shadow-md border-2 border-white shrink-0 overflow-hidden">
                            {patient.profilePic ? (
                                <img src={patient.profilePic} alt={patient.patientName} className="w-full h-full object-cover" />
                            ) : (
                                <span>{patient.patientName?.charAt(0) || 'P'}</span>
                            )}
                        </div>

                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono font-bold text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-lg">
                                    {caseData.bookingId}
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg border border-slate-200">
                                    {caseData.categoryTag || 'OPD'} • {caseData.consultationType}
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                                    {caseData.status}
                                </span>
                            </div>

                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                                {patient.patientName || 'Anonymous Patient'}
                            </h1>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                                <span>{patient.gender}, {patient.age} Yrs</span>
                                <span>•</span>
                                <span className="font-mono font-bold text-slate-700">Blood Group: {patient.bloodGroup || 'Not Recorded'}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1 font-mono text-slate-600">
                                    <Phone size={12} /> {patient.phone}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Schedule & Slot Box */}
                    <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center gap-4 self-stretch sm:self-auto justify-between sm:justify-start">
                        <div>
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-indigo-400">Appointment Slot</span>
                            <span className="font-mono font-bold text-xs text-slate-800 block mt-0.5">
                                {new Date(caseData.appointmentDate).toLocaleDateString()}
                            </span>
                            <span className="font-mono font-black text-indigo-700 text-xs">
                                {caseData.appointmentTime}
                            </span>
                        </div>
                        <div className="h-8 w-px bg-indigo-200/60" />
                        <div>
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-indigo-400">Attending Cabin</span>
                            <span className="font-bold text-xs text-slate-800 block mt-0.5">{doctor.cabinNumber || 'Cabin 204'}</span>
                            <span className="text-[11px] text-slate-500 font-semibold">{doctor.name}</span>
                        </div>
                    </div>
                </div>

                {/* 2. Grid: Diabetic Profile & Live Recorded Vitals */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Diabetic / Chronic Profile */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                <HeartPulse size={16} className="text-rose-600" />
                                Chronic Medical &amp; Diabetic Profile
                            </h2>
                            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase">
                                History Since: {diabeticProfile.sinceHowLong || 'N/A'}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                                <span className="block text-[10px] font-bold uppercase text-slate-400">Type</span>
                                <span className="font-bold text-slate-800 mt-1 block">{diabeticProfile.diabeticType || 'None'}</span>
                            </div>
                            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                                <span className="block text-[10px] font-bold uppercase text-slate-400">Height</span>
                                <span className="font-bold text-slate-800 mt-1 block">{diabeticProfile.height || '—'}</span>
                            </div>
                            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                                <span className="block text-[10px] font-bold uppercase text-slate-400">Weight</span>
                                <span className="font-bold text-slate-800 mt-1 block">{diabeticProfile.weight || '—'}</span>
                            </div>
                            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                                <span className="block text-[10px] font-bold uppercase text-slate-400">Current Rx</span>
                                <span className="font-bold text-slate-800 mt-1 block truncate" title={diabeticProfile.takingMedicines}>
                                    {diabeticProfile.takingMedicines || 'None'}
                                </span>
                            </div>
                        </div>

                        {/* Condition Badges */}
                        <div>
                            <span className="block text-[11px] font-bold uppercase text-slate-400 mb-2">Comorbidities &amp; Allergies</span>
                            <div className="flex flex-wrap gap-2">
                                {conditions.diabetes && (
                                    <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                        Diabetes Mellitus
                                    </span>
                                )}
                                {conditions.hypertension && (
                                    <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                        Hypertension
                                    </span>
                                )}
                                {conditions.asthma && (
                                    <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                        Asthma
                                    </span>
                                )}
                                {conditions.heartDisease && (
                                    <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                        Cardiovascular
                                    </span>
                                )}
                                {!conditions.diabetes && !conditions.hypertension && !conditions.asthma && (
                                    <span className="text-xs text-slate-400 italic">No adverse chronic conditions flagged.</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Clinical Summary & Vitals */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                <Activity size={16} className="text-indigo-600" />
                                Recorded Vitals &amp; Clinical Summary
                            </h2>
                            <span className="text-[10px] font-mono text-slate-400">
                                {vitals.recordedAt ? new Date(vitals.recordedAt).toLocaleTimeString() : 'Recent'}
                            </span>
                        </div>

                        {/* Vitals Pills */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-200 text-center">
                                <span className="block text-[10px] font-black uppercase text-rose-500">Blood Pressure</span>
                                <span className="text-base font-black font-mono text-rose-950 mt-1 block">
                                    {vitals.bp || '—'}
                                </span>
                            </div>
                            <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200 text-center">
                                <span className="block text-[10px] font-black uppercase text-amber-500">Pulse (BPM)</span>
                                <span className="text-base font-black font-mono text-amber-950 mt-1 block">
                                    {vitals.pulse || '—'}
                                </span>
                            </div>
                            <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-200 text-center">
                                <span className="block text-[10px] font-black uppercase text-blue-500">SpO2</span>
                                <span className="text-base font-black font-mono text-blue-950 mt-1 block">
                                    {vitals.spo2 || '—'}
                                </span>
                            </div>
                            <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-200 text-center">
                                <span className="block text-[10px] font-black uppercase text-indigo-500">Temperature</span>
                                <span className="text-base font-black font-mono text-indigo-950 mt-1 block">
                                    {vitals.temp || '—'}
                                </span>
                            </div>
                        </div>

                        {/* Complaints & Diagnosis */}
                        <div className="space-y-2 pt-1 text-xs">
                            <div>
                                <span className="text-[11px] font-bold text-slate-400 block uppercase">Chief Complaint</span>
                                <p className="font-semibold text-slate-800 mt-0.5">
                                    {caseData.clinicalSummary?.chiefComplaint || caseData.bookingReason || "Routine checkup"}
                                </p>
                            </div>
                            <div>
                                <span className="text-[11px] font-bold text-slate-400 block uppercase">Provisional Diagnosis</span>
                                <p className="font-bold text-indigo-700 mt-0.5">
                                    {caseData.clinicalSummary?.diagnosis || "Under Clinical Evaluation"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Primary Prescription & Medicines */}
                {primaryRx && (
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <Pill size={18} className="text-indigo-600" />
                                <div>
                                    <h2 className="text-sm font-black text-slate-900">Rx Prescriptions &amp; Posology</h2>
                                    <span className="text-[11px] text-slate-400 font-medium">
                                        Prescribed by {primaryRx.doctorId?.name || doctor.name}
                                    </span>
                                </div>
                            </div>
                            {primaryRx.pdfUrl && (
                                <a
                                    href={primaryRx.pdfUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition border border-indigo-100 cursor-pointer"
                                >
                                    <Download size={13} /> Download PDF
                                </a>
                            )}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                        <th className="py-2.5 px-3">Medication</th>
                                        <th className="py-2.5 px-3">Dosage</th>
                                        <th className="py-2.5 px-3">Frequency / Time</th>
                                        <th className="py-2.5 px-3">Duration</th>
                                        <th className="py-2.5 px-3">Instructions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium">
                                    {(primaryRx.medicines || []).map((med, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50">
                                            <td className="py-3 px-3 font-bold text-slate-900">{med.name}</td>
                                            <td className="py-3 px-3 font-mono font-bold text-indigo-600">{med.dose || med.doseInterval}</td>
                                            <td className="py-3 px-3 text-slate-600">{med.time || med.frequency}</td>
                                            <td className="py-3 px-3 font-mono text-slate-700">{med.duration}</td>
                                            <td className="py-3 px-3 text-slate-500 italic">{med.instructions || med.administrationTiming}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {(primaryRx.doctorSuggestions || primaryRx.adviceGiven) && (
                            <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100/70 text-xs space-y-1">
                                {primaryRx.doctorSuggestions && (
                                    <p><strong className="text-indigo-950 font-bold">Doctor Suggestions:</strong> {primaryRx.doctorSuggestions}</p>
                                )}
                                {primaryRx.adviceGiven && (
                                    <p><strong className="text-indigo-950 font-bold">Doctor Advice:</strong> {primaryRx.adviceGiven}</p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* 4. Clinic Referrals Hub (Pharmacy, Lab, IPD) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Pharmacy Referral */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 text-xs font-black text-slate-900">
                                <Pill size={15} className="text-emerald-600" /> Clinic Pharmacy
                            </span>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {pharmacyRef?.status || 'None'}
                            </span>
                        </div>
                        {pharmacyRef && pharmacyRef.pharmacyId ? (
                            <div className="space-y-2 text-xs">
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                                    <strong className="block text-slate-800 font-bold">{pharmacyRef.pharmacyId.name}</strong>
                                    <span className="text-[11px] text-slate-400 block">{pharmacyRef.pharmacyId.address}</span>
                                </div>
                                <span className="text-[11px] text-slate-500 font-medium block">
                                    {pharmacyRef.medicines?.length || 0} item(s) referred for fulfillment.
                                </span>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 italic">No pharmacy referral registered.</p>
                        )}
                    </div>

                    {/* Lab Referral */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 text-xs font-black text-slate-900">
                                <FlaskConical size={15} className="text-purple-600" /> Diagnostic Lab
                            </span>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                                {labRef?.priority || labRef?.status || 'None'}
                            </span>
                        </div>
                        {labRef && (labRef.labId || (labRef.tests && labRef.tests.length > 0)) ? (
                            <div className="space-y-2 text-xs">
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                                    <strong className="block text-slate-800 font-bold">{labRef.labId?.name || "Clinic Diagnostic Lab"}</strong>
                                    <span className="text-[11px] text-slate-400 block">{labRef.notes || "Standard Investigations"}</span>
                                </div>
                                <span className="text-[11px] text-slate-500 font-medium block">
                                    {labRef.tests?.length || 0} diagnostic order(s) placed.
                                </span>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 italic">No laboratory tests ordered.</p>
                        )}
                    </div>

                    {/* IPD Admission Referral */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 text-xs font-black text-slate-900">
                                <BedDouble size={15} className="text-indigo-600" /> IPD Ward Admission
                            </span>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                {admissionRef?.status || 'None'}
                            </span>
                        </div>
                        {admissionRef && admissionRef.status && admissionRef.status !== 'None' ? (
                            <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-xs space-y-1">
                                <span className="font-bold text-indigo-950 block">Stay: {admissionRef.stayDuration || 1} Day(s)</span>
                                <p className="text-slate-600 text-[11px]">{admissionRef.reason || 'Ward admission indicated.'}</p>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 italic">No admission recommendations active.</p>
                        )}
                    </div>
                </div>

                {/* 5. Bedside Specialist Team & Treatment Shift Timeline */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Bedside Care Team */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                <Users size={16} className="text-purple-600" />
                                Bedside Specialists &amp; Second Opinions
                            </h2>
                            <span className="font-mono text-xs text-slate-400 font-bold">
                                {bedsideTeam.length} Assigned
                            </span>
                        </div>

                        {bedsideTeam.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No secondary doctors or cross-consultants assigned.</p>
                        ) : (
                            <div className="space-y-3">
                                {bedsideTeam.map((doc, idx) => (
                                    <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                                        <div className="flex items-center justify-between">
                                            <strong className="font-bold text-slate-800">{doc.roleType || 'Specialist'}</strong>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                                                {doc.status}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500">{doc.requestReason || 'Consultation request'}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Shift & Treatment Log */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                <Clock size={16} className="text-indigo-600" />
                                Handover &amp; Assignment Logs
                            </h2>
                            <span className="font-mono text-xs text-slate-400 font-bold">
                                {timeline.length} Steps
                            </span>
                        </div>

                        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                            {timeline.map((step, idx) => (
                                <div key={idx} className="flex items-start gap-2.5 text-xs pb-2 border-b border-slate-100 last:border-none">
                                    <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <strong className="font-bold text-slate-900">{step.toDoctorName || doctor.name}</strong>
                                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                                {step.action || 'Assigned'}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 mt-0.5">{step.notes}</p>
                                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                                            {step.assignedAt ? new Date(step.assignedAt).toLocaleString() : ''}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 6. Billing Summary Strip */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                            <CreditCard size={20} />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">OPD Billing &amp; Settlement</span>
                            <div className="flex items-baseline gap-2 mt-0.5">
                                <span className="text-xl font-black font-mono text-slate-900">₹{billing.totalAmount || caseData.totalAmount || 0}</span>
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                    {billing.paymentStatus || caseData.paymentStatus || 'Paid'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {billing.paymentDetails && (
                        <div className="text-right text-[11px] font-mono text-slate-500 space-y-0.5">
                            <div>Order Ref: <span className="text-slate-800 font-semibold">{billing.paymentDetails.razorpayOrderId || 'N/A'}</span></div>
                            <div>Transaction ID: <span className="text-slate-800 font-semibold">{billing.paymentDetails.razorpayPaymentId || 'N/A'}</span></div>
                        </div>
                    )}
                </div>

            </div>

            {/* Modals */}
            <AddVitals
                isOpen={isVitalsModalOpen}
                onClose={() => setIsVitalsModalOpen(false)}
                appointmentId={id}
                initialVitals={vitals}
                onSuccess={fetchCaseDetails}
            />

            <AddMedicines
                isOpen={isMedicinesModalOpen}
                onClose={() => setIsMedicinesModalOpen(false)}
                appointmentId={id}
                initialPrescription={primaryRx}
                onSuccess={fetchCaseDetails}
            />

            <AddTests
                isOpen={isTestsModalOpen}
                onClose={() => setIsTestsModalOpen(false)}
                appointmentId={id}
                onSuccess={fetchCaseDetails}
            />
        </div>
    );
}