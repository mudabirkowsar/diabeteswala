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
    Mail,
    ChevronRight,
    Sparkles,
    LogOut,
    Stethoscope,
    Link as LinkIcon
} from 'lucide-react';

import ClinicDoctorAPI from '../../../../../../services/ClinicDoctorAPI';

export default function ClinicDoctorIpdCaseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id;

    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchCaseDetails = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const response = await ClinicDoctorAPI.getClinicDoctorIpdAppointmentDetails(id);
            if (response && response.success) {
                setCaseData(response.data);
            } else {
                toast.error(response?.message || "Failed to load IPD admission details");
            }
        } catch (err) {
            console.error("Error fetching IPD case details:", err);
            toast.error(err?.response?.data?.message || err.message || "Failed to retrieve admission details");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchCaseDetails();
    }, [fetchCaseDetails]);

    if (loading) {
        return (
            <div className="min-h-screen bg-purple-50/20 flex flex-col items-center justify-center p-6 text-center">
                <BedDouble size={44} className="text-purple-600 animate-pulse mb-3" />
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-800">
                    Retrieving Inpatient 360° Dossier...
                </h2>
                <p className="text-xs text-slate-400 mt-1">Connecting ward metrics, bedside stay logs, vitals &amp; posology</p>
            </div>
        );
    }

    if (!caseData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <ShieldAlert size={48} className="text-rose-500 mb-3" />
                <h2 className="text-lg font-black text-slate-900">Admission Record Not Found</h2>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    The requested inpatient admission record is unavailable or archived.
                </p>
                <button
                    onClick={() => router.push('/vendors/clinicdoctor/dashboard/IPDAppointments')}
                    className="mt-4 px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-2xl cursor-pointer"
                >
                    Return to IPD Roster
                </button>
            </div>
        );
    }

    // Extracted Objects with fallback null-checks
    const patient = caseData.resolvedPatient || {};
    const diabeticProfile = patient.diabeticProfile || null;
    const conditions = diabeticProfile?.conditionStatus || {};
    const vitals = caseData.clinicalSummary?.vitals || {};
    const ward = caseData.wardId || {};
    const bed = caseData.bedId || {};
    const stayCalc = caseData.stayCalculation || null;
    const parentOpd = caseData.opdAppointmentId || null;
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
                        onClick={() => router.push('/vendors/clinicdoctor/dashboard/IPDAppointments')}
                        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200 transition shadow-2xs self-start cursor-pointer"
                    >
                        <ArrowLeft size={14} /> Back to IPD Roster
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 transition shadow-2xs cursor-pointer"
                        >
                            <Printer size={14} /> Print IPD Dossier
                        </button>
                    </div>
                </div>

                {/* 1. Master Inpatient Header */}
                <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-600" />

                    <div className="flex items-start sm:items-center gap-4 pl-2">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-700 flex items-center justify-center text-white text-xl font-black shadow-md border-2 border-white shrink-0 overflow-hidden">
                            {patient.profilePic ? (
                                <img src={patient.profilePic} alt={patient.patientName} className="w-full h-full object-cover" />
                            ) : (
                                <span>{patient.patientName?.charAt(0) || 'P'}</span>
                            )}
                        </div>

                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono font-bold text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-lg">
                                    {caseData.bookingId}
                                </span>
                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-300 px-2.5 py-0.5 rounded-lg shadow-2xs">
                                    <BedDouble size={11} className="text-purple-600" /> Inpatient Admission
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg border border-slate-200">
                                    {caseData.status}
                                </span>
                            </div>

                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                                {patient.patientName || 'Inpatient Admission'}
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

                    {/* Ward & Bed Stay Box */}
                    <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80 flex items-center gap-4 self-stretch sm:self-auto justify-between sm:justify-start">
                        <div>
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-purple-600">Ward Unit</span>
                            <span className="font-bold text-xs text-slate-800 block mt-0.5">
                                {caseData.wardName || 'Inpatient Ward'}
                            </span>
                            <span className="font-mono font-black text-purple-700 text-xs">
                                Bed: {caseData.bedNumber || 'Assigned'}
                            </span>
                        </div>
                        <div className="h-8 w-px bg-purple-200" />
                        <div>
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-purple-600">Attending Clinician</span>
                            <span className="font-bold text-xs text-slate-800 block mt-0.5">{doctor.name || 'Primary Doctor'}</span>
                            <span className="text-[11px] text-slate-500 font-semibold">{doctor.cabinNumber || 'Ward Rounds'}</span>
                        </div>
                    </div>
                </div>

                {/* 2. Inpatient Stay Metrics & Parent OPD Referral Strip */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Stay Calculation Details */}
                    <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-2 text-xs font-black text-slate-900">
                                <BedDouble size={18} className="text-purple-600" /> Ward Stay Duration &amp; Hours
                            </span>
                            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                                {stayCalc?.exactStayHours != null ? `${stayCalc.exactStayHours} Hours Logged` : `${caseData.stayDuration || 1} Days Booked`}
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2.5 text-xs pt-1">
                            <div className="p-2.5 bg-purple-50/50 rounded-2xl border border-purple-200 text-center">
                                <span className="block text-[10px] font-bold uppercase text-purple-600">Ward / Type</span>
                                <span className="text-xs font-bold text-purple-950 block mt-0.5 truncate">
                                    {stayCalc?.wardName || ward?.name || 'General Ward'}
                                </span>
                            </div>
                            <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                                <span className="block text-[10px] font-bold uppercase text-slate-400">Bed Number</span>
                                <span className="text-xs font-mono font-black text-slate-800 block mt-0.5">
                                    {stayCalc?.bedNumber || bed?.bedNumber || caseData.bedNumber || 'TBD'}
                                </span>
                            </div>
                            <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
                                <span className="block text-[10px] font-bold uppercase text-emerald-600">Per Day Tariff</span>
                                <span className="text-xs font-mono font-black text-emerald-800 block mt-0.5">
                                    ₹{stayCalc?.pricePerDay || ward?.pricePerDay || 0}/Day
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-100">
                            <span>Admission: <strong>{caseData.startDate ? new Date(caseData.startDate).toLocaleDateString() : 'N/A'}</strong></span>
                            <span>Discharge: <strong>{caseData.endDate ? new Date(caseData.endDate).toLocaleDateString() : 'N/A'}</strong></span>
                        </div>
                    </div>

                    {/* Parent OPD Link or Referral Origin */}
                    <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-2 text-xs font-black text-slate-900">
                                <Stethoscope size={18} className="text-indigo-600" /> Originating OPD Encounter
                            </span>
                            {parentOpd ? (
                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    OPD Referral Linked
                                </span>
                            ) : (
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                                    Direct Ward Admission
                                </span>
                            )}
                        </div>

                        {parentOpd ? (
                            <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-xs space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-indigo-950 font-mono">OPD Ref: {parentOpd.bookingId}</span>
                                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800">
                                        {parentOpd.status}
                                    </span>
                                </div>
                                <span className="text-[11px] text-slate-600 block">
                                    Admitted on {parentOpd.appointmentDate} at {parentOpd.appointmentTime}
                                </span>
                            </div>
                        ) : (
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                                <p className="text-slate-600 font-medium">
                                    Admitted directly into Inpatient Services without an outpatient pre-consultation.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Grid: Chronic / Diabetic Profile & Inpatient Vitals */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Diabetic / Chronic Profile */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                <HeartPulse size={16} className="text-rose-600" />
                                Chronic Medical &amp; Diabetic Profile
                            </h2>
                            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase">
                                Diabetic Since: {diabeticProfile?.sinceHowLong || 'N/A'}
                            </span>
                        </div>

                        {diabeticProfile ? (
                            <>
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

                                <div>
                                    <span className="block text-[11px] font-bold uppercase text-slate-400 mb-2">Comorbidities &amp; Alert Flags</span>
                                    <div className="flex flex-wrap gap-2">
                                        {conditions?.diabetes && (
                                            <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                Diabetes Mellitus
                                            </span>
                                        )}
                                        {conditions?.hypertension && (
                                            <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                Hypertension
                                            </span>
                                        )}
                                        {conditions?.heartDisease && (
                                            <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                                Cardiovascular
                                            </span>
                                        )}
                                        {conditions?.asthma && (
                                            <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                                Asthma
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p className="text-xs text-slate-400 italic">No chronic diabetic profile recorded for this patient.</p>
                        )}
                    </div>

                    {/* Inpatient Vitals & Observations */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                <Activity size={16} className="text-purple-600" />
                                Bedside Ward Vitals &amp; Symptoms
                            </h2>
                            <span className="text-[10px] font-mono text-slate-400">
                                {vitals.recordedAt ? new Date(vitals.recordedAt).toLocaleTimeString() : 'Current Shift'}
                            </span>
                        </div>

                        {/* Vitals Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-200 text-center">
                                <span className="block text-[10px] font-black uppercase text-rose-500">Blood Pressure</span>
                                <span className="text-base font-black font-mono text-rose-950 mt-1 block">
                                    {vitals.bp || '130/85'}
                                </span>
                            </div>
                            <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200 text-center">
                                <span className="block text-[10px] font-black uppercase text-amber-500">Pulse (BPM)</span>
                                <span className="text-base font-black font-mono text-amber-950 mt-1 block">
                                    {vitals.pulse || '82'}
                                </span>
                            </div>
                            <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-200 text-center">
                                <span className="block text-[10px] font-black uppercase text-blue-500">SpO2</span>
                                <span className="text-base font-black font-mono text-blue-950 mt-1 block">
                                    {vitals.spo2 || '98%'}
                                </span>
                            </div>
                            <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-200 text-center">
                                <span className="block text-[10px] font-black uppercase text-indigo-500">Temp</span>
                                <span className="text-base font-black font-mono text-indigo-950 mt-1 block">
                                    {vitals.temp || '98.8 F'}
                                </span>
                            </div>
                        </div>

                        {/* Admission Complaint */}
                        <div className="space-y-2 pt-1 text-xs">
                            <div>
                                <span className="text-[11px] font-bold text-slate-400 block uppercase">Reason for Admission</span>
                                <p className="font-semibold text-slate-900 mt-0.5 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                                    {caseData.clinicalSummary?.chiefComplaint || caseData.bookingReason || "Post-surgery recovery and inpatient monitoring"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Prescriptions & Inpatient Posology */}
                {primaryRx && (
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <Pill size={18} className="text-purple-600" />
                                <div>
                                    <h2 className="text-sm font-black text-slate-900">Ward Posology &amp; Inpatient Rx</h2>
                                    <span className="text-[11px] text-slate-400 font-medium">
                                        Ordered by {doctor.name}
                                    </span>
                                </div>
                            </div>
                            {primaryRx.pdfUrl && (
                                <a
                                    href={primaryRx.pdfUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition border border-purple-100"
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
                                            <td className="py-3 px-3 font-mono font-bold text-purple-600">{med.dose}</td>
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

                {/* 5. Referrals & Cross-Consultations */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Pharmacy Referral */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 text-xs font-black text-slate-900">
                                <Pill size={15} className="text-emerald-600" /> Ward Pharmacy
                            </span>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                {pharmacyRef?.status || 'None'}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 italic">
                            {pharmacyRef?.medicines && pharmacyRef.medicines.length > 0
                                ? `${pharmacyRef.medicines.length} inpatient medicine(s) indented.`
                                : "No pending pharmacy indents."}
                        </p>
                    </div>

                    {/* Diagnostic Lab */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 text-xs font-black text-slate-900">
                                <FlaskConical size={15} className="text-purple-600" /> Routine Ward Labs
                            </span>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                                {labRef?.priority || labRef?.status || 'None'}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 italic">
                            {labRef?.tests && labRef.tests.length > 0
                                ? `${labRef.tests.length} diagnostic test(s) ordered.`
                                : "No active laboratory orders."}
                        </p>
                    </div>

                    {/* Bedside Specialist Care Team */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 text-xs font-black text-slate-900">
                                <Users size={15} className="text-indigo-600" /> Bedside Specialists
                            </span>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                                {bedsideTeam.length} Assigned
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 italic">
                            {bedsideTeam.length > 0
                                ? `${bedsideTeam.length} secondary clinician(s) on case.`
                                : "No cross-consult specialists active."}
                        </p>
                    </div>
                </div>

                {/* 6. Inpatient Billing Settlement Strip */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100">
                            <CreditCard size={20} />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">IPD Billing Settlement</span>
                            <div className="flex items-baseline gap-2 mt-0.5">
                                <span className="text-xl font-black font-mono text-slate-900">₹{billing.totalAmount || caseData.totalAmount || 0}</span>
                                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                    {billing.paymentStatus || caseData.paymentStatus || 'Pending'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
                        {(billing.bedOrVisitCharges || 0) > 0 && <div>Ward Charges: <strong className="text-slate-800">₹{billing.bedOrVisitCharges}</strong></div>}
                        {(billing.baseDoctorFee || 0) > 0 && <div>Doctor Rounds Fee: <strong className="text-slate-800">₹{billing.baseDoctorFee}</strong></div>}
                    </div>
                </div>

            </div>
        </div>
    );
}