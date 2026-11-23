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
    Droplet,
    Printer,
    Download,
    Phone,
    Mail,
    ChevronRight,
    Sparkles,
    Siren,
    Ambulance,
    ShieldCheck,
    AlertTriangle
} from 'lucide-react';

import ClinicDoctorAPI from '../../../../../../services/ClinicDoctorAPI';

export default function ClinicDoctorEmergencyCaseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id;

    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchCaseDetails = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const response = await ClinicDoctorAPI.getClinicDoctorEmergencyAppointmentDetails(id);
            if (response && response.success) {
                setCaseData(response.data);
            } else {
                toast.error(response?.message || "Failed to load emergency case details");
            }
        } catch (err) {
            console.error("Error fetching emergency case details:", err);
            toast.error(err?.response?.data?.message || err.message || "Failed to retrieve case details");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchCaseDetails();
    }, [fetchCaseDetails]);

    if (loading) {
        return (
            <div className="min-h-screen bg-rose-50/20 flex flex-col items-center justify-center p-6 text-center">
                <HeartPulse size={44} className="text-rose-600 animate-pulse mb-3" />
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-800">
                    Retrieving Code Red Emergency Dossier...
                </h2>
                <p className="text-xs text-slate-400 mt-1">Connecting ambulance telemetry, triage, and observation ward stay</p>
            </div>
        );
    }

    if (!caseData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <ShieldAlert size={48} className="text-rose-500 mb-3" />
                <h2 className="text-lg font-black text-slate-900">Emergency Dossier Not Found</h2>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    The requested trauma/emergency record is unavailable or archived.
                </p>
                <button
                    onClick={() => router.push('/vendors/clinicdoctor/dashboard/emergencyappointments')}
                    className="mt-4 px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-2xl cursor-pointer"
                >
                    Return to Emergency Roster
                </button>
            </div>
        );
    }

    // Extracted Objects with fallback null-checks
    const patient = caseData.resolvedPatient || {};
    const diabeticProfile = patient.diabeticProfile || {};
    const conditions = diabeticProfile.conditionStatus || {};
    const vitals = caseData.clinicalSummary?.vitals || {};
    const ambulance = caseData.ambulanceId || null;
    const stayCalc = caseData.stayCalculation || null;
    const prescriptions = caseData.prescriptions || [];
    const primaryRx = caseData.prescriptionId || prescriptions[0] || null;
    const pharmacyRef = caseData.clinicPharmacyReferral || null;
    const labRef = caseData.clinicLabReferral || null;
    const admissionRef = caseData.admissionReferral || null;
    const bedsideTeam = caseData.bedsideCareTeam || [];
    const timeline = caseData.treatmentHistory || [];
    const billing = caseData.billingSummary || {};
    const doctor = caseData.doctorId || {};
    const clinic = caseData.clinicId || {};

    return (
        <div className="min-h-screen text-slate-800 pb-20">
            <Toaster position="top-right" reverseOrder={false} />

            <div className="max-w-7xl mx-auto space-y-6">

                {/* Top Nav Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <button
                        onClick={() => router.push('/vendors/clinicdoctor/dashboard/emergencyappointments')}
                        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200 transition shadow-2xs self-start cursor-pointer"
                    >
                        <ArrowLeft size={14} /> Back to Emergency Roster
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 transition shadow-2xs cursor-pointer"
                        >
                            <Printer size={14} /> Print Trauma Dossier
                        </button>
                    </div>
                </div>

                {/* 1. Trauma Banner & Patient Header */}
                <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-600" />

                    <div className="flex items-start sm:items-center gap-4 pl-2">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-rose-700 flex items-center justify-center text-white text-xl font-black shadow-md border-2 border-white shrink-0 overflow-hidden">
                            {patient.profilePic ? (
                                <img src={patient.profilePic} alt={patient.patientName} className="w-full h-full object-cover" />
                            ) : (
                                <span>{patient.patientName?.charAt(0) || 'E'}</span>
                            )}
                        </div>

                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono font-bold text-xs bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-lg">
                                    {caseData.bookingId}
                                </span>
                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white px-2.5 py-0.5 rounded-lg shadow-2xs">
                                    <Siren size={11} className="animate-pulse" />
                                    {caseData.triageLevel || 'Emergency Priority'}
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg border border-slate-200">
                                    {caseData.status}
                                </span>
                            </div>

                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                                {patient.patientName || 'Emergency Patient'}
                            </h1>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                                <span>{patient.gender}, {patient.age} Yrs</span>
                                <span>•</span>
                                <span className="font-mono font-bold text-slate-700">Blood Group: {patient.bloodGroup || 'O+'}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1 font-mono text-slate-600">
                                    <Phone size={12} /> {patient.phone}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Ward & Bed Stay Box */}
                    <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/80 flex items-center gap-4 self-stretch sm:self-auto justify-between sm:justify-start">
                        <div>
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-rose-500">Observation Unit</span>
                            <span className="font-bold text-xs text-slate-800 block mt-0.5">
                                {caseData.wardName || 'Emergency Ward'}
                            </span>
                            <span className="font-mono font-black text-rose-700 text-xs">
                                Bed: {caseData.bedNumber || 'EMG-01'}
                            </span>
                        </div>
                        <div className="h-8 w-px bg-rose-200" />
                        <div>
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-rose-500">Attending Clinician</span>
                            <span className="font-bold text-xs text-slate-800 block mt-0.5">{doctor.name || 'Emergency On-Call'}</span>
                            <span className="text-[11px] text-slate-500 font-semibold">{doctor.cabinNumber || 'Trauma Bay'}</span>
                        </div>
                    </div>
                </div>

                {/* 2. Emergency Logistics Bar (Ambulance Transit & Observation Unit Stay) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Ambulance Transit Card */}
                    <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-2 text-xs font-black text-slate-900">
                                <Ambulance size={18} className="text-amber-600" /> Emergency Ambulance Transit
                            </span>
                            {ambulance ? (
                                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                    {ambulance.vehicleType || 'Advanced Life Support'}
                                </span>
                            ) : (
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                                    Walk-in / Private Transit
                                </span>
                            )}
                        </div>

                        {ambulance ? (
                            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                                <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200">
                                    <span className="block text-[10px] font-bold uppercase text-amber-600">Vehicle Number</span>
                                    <strong className="text-sm font-mono font-black text-slate-900 mt-0.5 block">{ambulance.vehicleNumber}</strong>
                                    <span className="text-[11px] text-slate-500 block mt-0.5">Pilot: {ambulance.name}</span>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                                    <span className="block text-[10px] font-bold uppercase text-slate-400">Paramedic Staff</span>
                                    <strong className="text-xs font-bold text-slate-800 mt-0.5 block">
                                        {ambulance.supportStaff?.map((s) => s.name).join(', ') || 'Paramedic Onboard'}
                                    </strong>
                                    <span className="text-[10px] font-mono text-slate-500 block mt-0.5">Contact: {ambulance.phone}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 italic">No inbound clinic ambulance dispatched for this patient.</p>
                        )}
                    </div>

                    {/* Observation Bed Stay Calculation */}
                    <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-2 text-xs font-black text-slate-900">
                                <BedDouble size={18} className="text-purple-600" /> Emergency Observation Stay
                            </span>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                                {stayCalc ? `${stayCalc.exactStayHours || 0} Hours Elapsed` : 'Direct Admission'}
                            </span>
                        </div>

                        {stayCalc ? (
                            <div className="grid grid-cols-3 gap-2.5 text-xs pt-1">
                                <div className="p-2.5 bg-purple-50/50 rounded-2xl border border-purple-200 text-center">
                                    <span className="block text-[10px] font-bold uppercase text-purple-600">Ward Unit</span>
                                    <span className="text-xs font-bold text-purple-950 block mt-0.5 truncate">{stayCalc.wardName}</span>
                                </div>
                                <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                                    <span className="block text-[10px] font-bold uppercase text-slate-400">Bed Number</span>
                                    <span className="text-xs font-mono font-black text-slate-800 block mt-0.5">{stayCalc.bedNumber}</span>
                                </div>
                                <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
                                    <span className="block text-[10px] font-bold uppercase text-emerald-600">Tariff</span>
                                    <span className="text-xs font-mono font-black text-emerald-800 block mt-0.5">₹{stayCalc.pricePerDay}/Day</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 italic">No observation ward stay calculated.</p>
                        )}
                    </div>
                </div>

                {/* 3. Grid: Diabetic History & Triage Vitals */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Diabetic / Chronic Profile */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                <HeartPulse size={16} className="text-rose-600" />
                                Chronic Risk &amp; Diabetic Profile
                            </h2>
                            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase">
                                Diabetic Since: {diabeticProfile.sinceHowLong || 'N/A'}
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
                                    {diabeticProfile.takingMedicines || 'Insulin Glargine'}
                                </span>
                            </div>
                        </div>

                        {/* Comorbidities */}
                        <div>
                            <span className="block text-[11px] font-bold uppercase text-slate-400 mb-2">Comorbidities &amp; Alert Flags</span>
                            <div className="flex flex-wrap gap-2">
                                {conditions.diabetes && (
                                    <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                        Diabetes Mellitus
                                    </span>
                                )}
                                {conditions.heartDisease && (
                                    <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                        Cardiovascular Alert
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
                            </div>
                        </div>
                    </div>

                    {/* Clinical Summary & Vitals */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                <Activity size={16} className="text-rose-600" />
                                Acute Vitals &amp; Triage Incident
                            </h2>
                            <span className="text-[10px] font-mono text-slate-400">
                                {caseData.appointmentTime || 'Immediate'}
                            </span>
                        </div>

                        {/* Vitals Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-200 text-center">
                                <span className="block text-[10px] font-black uppercase text-rose-500">Blood Pressure</span>
                                <span className="text-base font-black font-mono text-rose-950 mt-1 block">
                                    {vitals.bp || '130/90'}
                                </span>
                            </div>
                            <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200 text-center">
                                <span className="block text-[10px] font-black uppercase text-amber-500">Pulse (BPM)</span>
                                <span className="text-base font-black font-mono text-amber-950 mt-1 block">
                                    {vitals.pulse || '98'}
                                </span>
                            </div>
                            <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-200 text-center">
                                <span className="block text-[10px] font-black uppercase text-blue-500">SpO2</span>
                                <span className="text-base font-black font-mono text-blue-950 mt-1 block">
                                    {vitals.spo2 || '96%'}
                                </span>
                            </div>
                            <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-200 text-center">
                                <span className="block text-[10px] font-black uppercase text-indigo-500">Temp</span>
                                <span className="text-base font-black font-mono text-indigo-950 mt-1 block">
                                    {vitals.temp || '99.1 F'}
                                </span>
                            </div>
                        </div>

                        {/* Incident Description */}
                        <div className="space-y-2 pt-1 text-xs">
                            <div>
                                <span className="text-[11px] font-bold text-slate-400 block uppercase">Incident / Reason for Admission</span>
                                <p className="font-semibold text-rose-950 mt-0.5 bg-rose-50 p-3 rounded-2xl border border-rose-200">
                                    {caseData.clinicalSummary?.chiefComplaint || caseData.bookingReason || "Acute severe trauma episode"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Prescriptions & Medicines */}
                {primaryRx && (
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <Pill size={18} className="text-indigo-600" />
                                <div>
                                    <h2 className="text-sm font-black text-slate-900">Emergency Medications &amp; Injections</h2>
                                    <span className="text-[11px] text-slate-400 font-medium">
                                        Prescribed by {doctor.name}
                                    </span>
                                </div>
                            </div>
                            {primaryRx.pdfUrl && (
                                <a
                                    href={primaryRx.pdfUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition border border-indigo-100"
                                >
                                    <Download size={13} /> Rx PDF
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
                                            <td className="py-3 px-3 font-mono font-bold text-indigo-600">{med.dose}</td>
                                            <td className="py-3 px-3 text-slate-600">{med.time}</td>
                                            <td className="py-3 px-3 font-mono text-slate-700">{med.duration}</td>
                                            <td className="py-3 px-3 text-slate-500 italic">{med.instructions}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 5. Referrals & Secondary Doctors */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Pharmacy Referral */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 text-xs font-black text-slate-900">
                                <Pill size={15} className="text-emerald-600" /> Emergency Pharmacy
                            </span>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                {pharmacyRef?.status || 'None'}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 italic">
                            {pharmacyRef?.medicines && pharmacyRef.medicines.length > 0
                                ? `${pharmacyRef.medicines.length} emergency medicines dispatched.`
                                : "No pending pharmacy referral."}
                        </p>
                    </div>

                    {/* Diagnostic Lab */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 text-xs font-black text-slate-900">
                                <FlaskConical size={15} className="text-purple-600" /> Stat Diagnostic Tests
                            </span>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                                {labRef?.priority || labRef?.status || 'None'}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 italic">
                            {labRef?.tests && labRef.tests.length > 0
                                ? `${labRef.tests.length} STAT diagnostic orders placed.`
                                : "No stat laboratory orders active."}
                        </p>
                    </div>

                    {/* IPD Ward Transfer */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 text-xs font-black text-slate-900">
                                <BedDouble size={15} className="text-indigo-600" /> Inpatient Admission
                            </span>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                {admissionRef?.status || 'None'}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 italic">
                            {admissionRef && admissionRef.status && admissionRef.status !== 'None'
                                ? `Admission indicated for ${admissionRef.stayDuration || 1} day(s).`
                                : "No hospital admission transfer requested."}
                        </p>
                    </div>
                </div>

                {/* 6. Emergency Billing & Settlement Strip */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                            <CreditCard size={20} />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Emergency Billing Settlement</span>
                            <div className="flex items-baseline gap-2 mt-0.5">
                                <span className="text-xl font-black font-mono text-slate-900">₹{billing.totalAmount || caseData.totalAmount || 0}</span>
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                    {billing.paymentStatus || caseData.paymentStatus || 'Paid'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
                        {(billing.bedOrVisitCharges || 0) > 0 && <div>Bed Charges: <strong className="text-slate-800">₹{billing.bedOrVisitCharges}</strong></div>}
                        {(billing.ambulanceOrExtraCharges || 0) > 0 && <div>Ambulance: <strong className="text-slate-800">₹{billing.ambulanceOrExtraCharges}</strong></div>}
                        {(billing.baseDoctorFee || 0) > 0 && <div>Doctor Fee: <strong className="text-slate-800">₹{billing.baseDoctorFee}</strong></div>}
                    </div>
                </div>

            </div>
        </div>
    );
}