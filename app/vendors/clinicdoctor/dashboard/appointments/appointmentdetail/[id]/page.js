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
  MessageSquare
} from 'lucide-react';

import ClinicDoctorAPI from '../../../../../../services/ClinicDoctorAPI';

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

  // Handle Accept Action
  const handleAcceptAppointment = async () => {
    if (!appointmentId) return;
    setActionLoading(true);
    try {
      const response = await ClinicDoctorAPI.acceptClinicDoctorAppointment(
        appointmentId,
        acceptNotes.trim()
      );
      if (response && response.success) {
        toast.success(response.message || "Appointment accepted successfully!");
        setShowAcceptModal(false);
        setAcceptNotes('');
        // Refresh details to update timeline and acceptance status
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

  // Handle Reject Action (Mandatory Reason)
  const handleRejectAppointment = async () => {
    if (!appointmentId) return;
    if (!rejectReason.trim()) {
      toast.error("Rejection reason is mandatory.");
      return;
    }

    setActionLoading(true);
    try {
      const response = await ClinicDoctorAPI.rejectClinicDoctorAppointment(
        appointmentId,
        rejectReason.trim()
      );
      if (response && response.success) {
        toast.success(response.message || "Appointment returned to Clinic for reassignment.");
        setShowRejectModal(false);
        setRejectReason('');
        // Refresh details or return
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
    const lower = (status || '').toLowerCase();
    if (['confirmed', 'in-progress'].includes(lower)) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
          <CheckCircle2 size={13} /> {status || 'Confirmed'}
        </span>
      );
    }
    if (['pending', 'clinic-pending'].includes(lower)) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
          <Clock3 size={13} /> {status || 'Pending'}
        </span>
      );
    }
    if (lower.includes('cancel') || lower.includes('reject')) {
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

  // Deconstruct Safe Objects
  const patient = detail?.resolvedPatient || {};
  const diabetic = patient?.diabeticProfile || null;
  const clinic = detail?.clinicId || {};
  const primaryDoc = detail?.doctorId || {};
  const stay = detail?.stayCalculation || null;
  const billing = detail?.billingSummary || {};
  const paymentDetails = billing?.paymentDetails || {};
  const clinical = detail?.clinicalSummary || {};
  const files = detail?.clinicalFiles || {};
  const timeline = detail?.treatmentTeamTimeline || [];
  const permissions = detail?.doctorPermissions || {};
  const reports = files?.uploadedReports || clinical?.uploadedReports || [];

  // Acceptance Criteria Check
  const acceptanceStatus = detail?.doctorAcceptanceStatus || 'Pending';
  const isAccepted = acceptanceStatus.toLowerCase() === 'accepted';
  const isRejected = acceptanceStatus.toLowerCase() === 'rejected';
  const isClosed = ['completed', 'cancelled', 'no-show'].some((st) =>
    (detail?.status || '').toLowerCase().includes(st)
  );
  const canRespond = !isAccepted && !isRejected && !isClosed;

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

        {/* DOCTOR ACCEPTANCE STATUS BANNERS */}
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

        {isAccepted && (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-3xl flex items-center justify-between gap-3 text-emerald-900">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
              <div className="text-xs">
                <strong className="font-black text-emerald-950">You have Accepted this Clinical Case. </strong>
                <span className="text-emerald-800">
                  {detail.doctorRespondedAt
                    ? `Confirmed on ${new Date(detail.doctorRespondedAt).toLocaleDateString()} at ${new Date(detail.doctorRespondedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : "Appointment is active on your schedule."}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-mono">
              Accepted
            </span>
          </div>
        )}

        {isRejected && (
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-900">
            <div className="flex items-center gap-3">
              <XCircle size={20} className="text-rose-600 shrink-0" />
              <div className="text-xs">
                <strong className="font-black text-rose-950">Case Rejected by You. </strong>
                <span className="text-rose-800">
                  Reason: &ldquo;{detail.doctorRejectionReason || 'No reason specified'}&rdquo;
                </span>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-xl bg-rose-100 text-rose-800 font-mono self-start sm:self-auto">
              Returned to Clinic
            </span>
          </div>
        )}

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT COLUMN: SCHEDULE/STAY, PATIENT, DIABETIC PROFILE, CLINICAL (7/12) */}
          <div className="lg:col-span-7 space-y-6">

            {/* 1. Schedule & Admission Card */}
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

            {/* 2. Patient Profile Card */}
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
                    {patient.patientName || 'Anonymous'}
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

              {/* Reported Symptoms / Chief Complaint */}
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

            {/* 3. Diabetic Profile & Comorbidities (If Populated) */}
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

            {/* 4. Inpatient Stay & Bed Metrics (IPD Admission Case) */}
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
                    <strong className="text-slate-900 font-black">{stay.bookedDays} Day(s)</strong>
                  </div>
                  <div className="bg-purple-50/50 p-3 rounded-2xl border border-purple-100">
                    <span className="text-[10px] text-purple-600 uppercase block font-bold">Rate Per Day</span>
                    <strong className="text-purple-800 font-mono font-black">₹{stay.pricePerDay}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Medical Reports & Clinical Documents */}
            {(reports.length > 0 || files.prescriptionPdf || files.dischargeSummaryPdf) && (
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <FileText size={16} />
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Clinical Documents &amp; Reports
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {files.prescriptionPdf && (
                    <a
                      href={files.prescriptionPdf}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3 bg-indigo-50/50 hover:bg-indigo-50 rounded-2xl border border-indigo-200 flex items-center justify-between gap-3 text-xs transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileCheck size={16} className="text-indigo-600" />
                        <span className="font-bold text-indigo-900">Official Prescription PDF</span>
                      </div>
                      <ExternalLink size={14} className="text-indigo-600 shrink-0" />
                    </a>
                  )}

                  {files.dischargeSummaryPdf && (
                    <a
                      href={files.dischargeSummaryPdf}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3 bg-purple-50/50 hover:bg-purple-50 rounded-2xl border border-purple-200 flex items-center justify-between gap-3 text-xs transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileCheck size={16} className="text-purple-600" />
                        <span className="font-bold text-purple-900">Discharge Summary PDF</span>
                      </div>
                      <ExternalLink size={14} className="text-purple-600 shrink-0" />
                    </a>
                  )}

                  {reports.map((reportUrl, idx) => (
                    <a
                      key={idx}
                      href={reportUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3 bg-slate-50 hover:bg-indigo-50/50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 text-xs transition group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileCheck size={16} className="text-slate-500 group-hover:text-indigo-600" />
                        <span className="font-bold text-slate-800 truncate">
                          Diagnostic Report #{idx + 1}
                        </span>
                      </div>
                      <ExternalLink size={14} className="text-indigo-600 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Care Team & Specialist Timeline */}
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
                        {member.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: CLINIC INFO, DOCTOR, BILLING, TRANSACTION (5/12) */}
          <div className="lg:col-span-5 space-y-6">

            {/* 7. Assigned Clinic Facility */}
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

            {/* 8. Attending Doctor Profile */}
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

            {/* 9. Billing Ledger & Payment Breakdown */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                <div className="flex items-center gap-2 text-indigo-600">
                  <Receipt size={16} />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Billing &amp; Hospital Fees
                  </h3>
                </div>
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md ${
                  billing.paymentStatus === 'Paid' 
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

            {/* 10. Transaction Credentials */}
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
                  {paymentDetails.paidAt && (
                    <div className="flex justify-between">
                      <span className="font-sans text-slate-400">Timestamp:</span>
                      <span>{new Date(paymentDetails.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 11. Ambulance Transport (If Associated) */}
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

      {/* ACCEPT MODAL */}
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

      {/* REJECT MODAL (MANDATORY REASON) */}
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

    </div>
  );
}