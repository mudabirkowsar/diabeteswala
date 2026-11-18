"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  Stethoscope,
  User,
  Calendar,
  Clock,
  MapPin,
  Video,
  Home,
  Bed,
  Receipt,
  Phone,
  Loader2,
  Percent,
  Printer,
  AlertCircle,
  FileText,
  CreditCard,
  Sparkles,
  ShieldAlert,
  UserCheck,
  UserPlus,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  X,
  History,
  AlertTriangle,
  ArrowRightLeft
} from 'lucide-react';

import ClinicAPI from '../../../../../../services/ClinicAPI';

// --- BASE MEDIA HELPER ---
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";

const getMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  return `${BASE_SERVER_URL}/${cleanPath}`;
};

const DOC_PLACEHOLDER = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=300&auto=format&fit=crop";

export default function AppointmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentParamId = params?.id;

  // --- Main Dossier State ---
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Doctor Assignment / Reassignment Modal State ---
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isReassignMode, setIsReassignMode] = useState(false);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [doctorWarning, setDoctorWarning] = useState(null);

  // Modal Filters & Selection
  const [doctorSearch, setDoctorSearch] = useState('');
  const [selectedSpeciality, setSelectedSpeciality] = useState('ALL');
  const [chosenDoctor, setChosenDoctor] = useState(null);
  const [assignNotes, setAssignNotes] = useState('');
  const [assignDate, setAssignDate] = useState('');
  const [assignTime, setAssignTime] = useState('');
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState(null);
  const [actionErrorMsg, setActionErrorMsg] = useState(null);

  // --- 1. Fetch Main Dossier Data ---
  const fetchDossier = useCallback(async () => {
    if (!appointmentParamId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await ClinicAPI.getClinicBookingDetails(appointmentParamId);
      if (response && response.success) {
        setDossier(response.data);
      } else {
        setError(response?.message || "Failed to load clinical dossier details.");
        setDossier(null);
      }
    } catch (err) {
      console.error("Error fetching clinical dossier details:", err);
      setError("Network error or server unreachable. Please try again.");
      setDossier(null);
    } finally {
      setLoading(false);
    }
  }, [appointmentParamId]);

  useEffect(() => {
    fetchDossier();
  }, [fetchDossier]);

  // --- 2. Fetch Available (Free) Clinic Doctors ---
  const fetchFreeDoctors = useCallback(async (querySearch = '', speciality = 'ALL') => {
    if (!dossier) return;
    setLoadingDoctors(true);
    setActionErrorMsg(null);
    try {
      const reqQuery = {
        appointmentId: dossier._id || appointmentParamId,
      };

      if (querySearch.trim()) reqQuery.search = querySearch.trim();
      if (speciality !== 'ALL') reqQuery.speciality = speciality;

      const res = await ClinicAPI.getAvailableClinicDoctors(reqQuery);
      if (res && res.success) {
        setAvailableDoctors(res.data || []);
        setDoctorWarning(res.selectedDoctorWarning || null);

        // Auto-select patient's pre-selected doctor if present and free
        const preSelected = (res.data || []).find((d) => d.isDoctorSelectedAlready);
        if (preSelected && !chosenDoctor) {
          setChosenDoctor(preSelected);
        }
      } else {
        setAvailableDoctors([]);
      }
    } catch (err) {
      console.error("Error fetching free doctors:", err);
      setAvailableDoctors([]);
    } finally {
      setLoadingDoctors(false);
    }
  }, [dossier, appointmentParamId, chosenDoctor]);

  // --- 3. Open Modal for Assign / Reassign ---
  const handleOpenAssignModal = (isReassign = false) => {
    setIsReassignMode(isReassign);
    setActionErrorMsg(null);
    setActionSuccessMsg(null);
    setChosenDoctor(null);
    setAssignNotes('');
    setDoctorSearch('');
    setSelectedSpeciality('ALL');

    // Default dates/time from dossier
    if (dossier) {
      if (dossier.appointmentDate) {
        const rawDate = dossier.appointmentDate.split('T')[0];
        setAssignDate(rawDate);
      }
      setAssignTime(dossier.appointmentTime || '');
    }

    setIsAssignModalOpen(true);
    fetchFreeDoctors('', 'ALL');
  };

  // Re-trigger doctor search with debounce
  useEffect(() => {
    if (!isAssignModalOpen) return;
    const timer = setTimeout(() => {
      fetchFreeDoctors(doctorSearch, selectedSpeciality);
    }, 280);
    return () => clearTimeout(timer);
  }, [doctorSearch, selectedSpeciality, isAssignModalOpen, fetchFreeDoctors]);

  // Unique Speciality List for Filter Pill
  const uniqueSpecialities = useMemo(() => {
    const set = new Set();
    availableDoctors.forEach((d) => {
      if (d.speciality) set.add(d.speciality);
    });
    return Array.from(set);
  }, [availableDoctors]);

  // --- 4. Submit Doctor Assignment or Reassignment ---
  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    if (!chosenDoctor?._id) {
      setActionErrorMsg("Please choose a doctor from the list.");
      return;
    }

    const currentDocId = dossier?.doctorId?._id || dossier?.doctorId;
    if (isReassignMode && currentDocId && currentDocId.toString() === chosenDoctor._id.toString()) {
      setActionErrorMsg("Appointment is already assigned to this doctor. Please pick a different doctor.");
      return;
    }

    setAssignSubmitting(true);
    setActionErrorMsg(null);
    setActionSuccessMsg(null);

    try {
      const targetApptId = dossier?._id || appointmentParamId;

      if (isReassignMode) {
        // CALL REASSIGN API
        const payload = {
          appointmentId: targetApptId,
          newDoctorId: chosenDoctor._id,
          reason: assignNotes.trim() || undefined,
          appointmentDate: assignDate || undefined,
          appointmentTime: assignTime || undefined
        };

        const res = await ClinicAPI.reassignAppointmentToDoctor(payload);
        if (res && res.success) {
          setActionSuccessMsg(res.message || "Appointment successfully reassigned.");
          if (res.data) {
            setDossier(res.data);
          } else {
            fetchDossier();
          }
          setTimeout(() => {
            setIsAssignModalOpen(false);
          }, 1200);
        } else {
          setActionErrorMsg(res?.message || "Failed to reassign appointment.");
        }
      } else {
        // CALL ASSIGN API
        const payload = {
          appointmentId: targetApptId,
          doctorId: chosenDoctor._id,
          notes: assignNotes.trim() || undefined,
          appointmentDate: assignDate || undefined,
          appointmentTime: assignTime || undefined
        };

        const res = await ClinicAPI.assignAppointmentToDoctor(payload);
        if (res && res.success) {
          setActionSuccessMsg(res.message || "Doctor successfully assigned.");
          if (res.data) {
            setDossier(res.data);
          } else {
            fetchDossier();
          }
          setTimeout(() => {
            setIsAssignModalOpen(false);
          }, 1200);
        } else {
          setActionErrorMsg(res?.message || "Failed to assign doctor.");
        }
      }
    } catch (err) {
      console.error("Error submitting doctor assignment:", err);
      const serverMsg = err?.response?.data?.message || err?.message || "Internal server error occurred.";
      setActionErrorMsg(serverMsg);
    } finally {
      setAssignSubmitting(false);
    }
  };

  const isAppointmentClosed =
    dossier?.status?.toLowerCase() === 'completed' ||
    dossier?.status?.toLowerCase() === 'cancelled';

  const hasAssignedDoctor = !!dossier?.doctorId;
  const currentAttendingDoc = typeof dossier?.doctorId === 'object' ? dossier.doctorId : null;

  return (
    <div className="min-h-screen bg-slate-50/50 max-w-7xl mx-auto text-slate-800 antialiased select-none text-left">
      
      {/* Top Navigation & Action Buttons */}
      <div className="flex items-center justify-between gap-4 mb-6 print:hidden">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-2xs hover:shadow-xs"
        >
          <ArrowLeft size={16} />
          <span>Back to Admissions</span>
        </button>

        <div className="flex items-center gap-2.5">
          {/* Quick Doctor Assignment Trigger */}
          {dossier && !isAppointmentClosed && (
            <button
              type="button"
              onClick={() => handleOpenAssignModal(hasAssignedDoctor)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                hasAssignedDoctor
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
              }`}
            >
              {hasAssignedDoctor ? (
                <>
                  <ArrowRightLeft size={15} />
                  <span>Reassign Doctor</span>
                </>
              ) : (
                <>
                  <UserPlus size={15} />
                  <span>Assign Doctor</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-2xs hover:shadow-xs"
            title="Print Medical File"
          >
            <Printer size={16} />
            <span className="hidden sm:inline">Print File</span>
          </button>
        </div>
      </div>

      {/* Main Dossier Card Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-6 sm:p-9 space-y-7 print:border-none print:shadow-none print:p-0">
        
        {/* Header Record Title */}
        <div className="border-b border-slate-100 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[11px] font-black uppercase text-[#3d3f96] bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-xl">
                Clinical Dossier
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-wider">
                {dossier?.bookingId || appointmentParamId}
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-bold">
              360-Degree Patient Admission &amp; Medical Consultation File
            </p>
          </div>

          {dossier && (
            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <span className="text-[11px] font-black uppercase px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                {dossier.status || "Confirmed"}
              </span>
              <span className="text-[11px] font-black uppercase px-3 py-1.5 rounded-xl bg-indigo-50 text-[#3d3f96] border border-indigo-100">
                {dossier.paymentStatus || "Paid"}
              </span>
            </div>
          )}
        </div>

        {/* Dynamic State Management */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 text-center space-y-3">
            <Loader2 className="animate-spin text-[#3d3f96]" size={42} />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Retrieving patient record dossier...
            </p>
          </div>
        ) : error || !dossier ? (
          <div className="p-12 text-center bg-slate-50 rounded-3xl border border-slate-200/60 border-dashed space-y-3 my-6">
            <AlertCircle size={40} className="text-rose-400 mx-auto" />
            <h4 className="text-base font-bold text-slate-800">Dossier Unavailable</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {error || "Unable to load the complete clinical file for this appointment record."}
            </p>
            <button
              type="button"
              onClick={() => router.back()}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Back to Appointments
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Top Status & Lifecycle Banner */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-500">Category:</span>
                <span className="font-black text-slate-900 uppercase bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  {dossier.bookingType || "Admission"}
                </span>
                <span className="font-bold text-slate-500">• Mode:</span>
                <span className="font-bold text-[#3d3f96] bg-indigo-50/60 px-2 py-0.5 rounded">
                  {dossier.consultationType || "Clinic Visit"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-500">Method:</span>
                <span className="font-bold text-slate-800 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                  {dossier.paymentMethod || "Online"}
                </span>
              </div>
            </div>

            {/* 1. Patient Profile Card */}
            {(() => {
              const primaryPatient = dossier.patients?.[0] || {};
              const user = dossier.userId || {};

              return (
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                    <div className="flex items-center gap-2 text-[#3d3f96]">
                      <User size={18} />
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                        Patient Profile
                      </h4>
                    </div>
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                      {primaryPatient.relation || "SELF"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Patient Name</span>
                      <strong className="text-sm text-slate-900 block mt-0.5">
                        {primaryPatient.patientName || user.name || "Primary User"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Age / Gender</span>
                      <span className="text-slate-800 font-bold block mt-0.5">
                        {primaryPatient.patientAge || '30'} Yrs • {primaryPatient.gender || user.gender || 'Male'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Contact Phone</span>
                      <span className="text-slate-800 font-bold block mt-0.5 font-mono">
                        {user.phone || "Not Provided"}
                      </span>
                    </div>
                  </div>

                  {(dossier.bookingReason || primaryPatient.reasonForVisit) && (
                    <div className="pt-2 border-t border-slate-50 space-y-1.5">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                        Chief Medical Complaint
                      </span>
                      <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed font-medium">
                        "{dossier.bookingReason || primaryPatient.reasonForVisit}"
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 2. Attending Specialist Card (With Quick Assign / Reassign Button) */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-50 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2 text-[#3d3f96]">
                  <Stethoscope size={18} />
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Attending Specialist
                  </h4>
                </div>

                {!isAppointmentClosed && (
                  <button
                    type="button"
                    onClick={() => handleOpenAssignModal(hasAssignedDoctor)}
                    className="text-xs font-black text-[#3d3f96] hover:text-[#282a69] hover:underline flex items-center gap-1.5 cursor-pointer"
                  >
                    {hasAssignedDoctor ? (
                      <>
                        <ArrowRightLeft size={13} />
                        <span>Change / Reassign Doctor</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={13} />
                        <span>Assign Doctor Now</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {hasAssignedDoctor && currentAttendingDoc ? (
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0">
                      <img
                        src={getMediaUrl(currentAttendingDoc.profileImage) || DOC_PLACEHOLDER}
                        alt={currentAttendingDoc.name || "Doctor"}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = DOC_PLACEHOLDER; }}
                      />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-black text-slate-900 truncate">
                          {currentAttendingDoc.name}
                        </h5>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {currentAttendingDoc.dutyStatus || "On Duty"}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-[#3d3f96] truncate">
                        {currentAttendingDoc.speciality} {currentAttendingDoc.qualification ? `(${currentAttendingDoc.qualification})` : ''}
                      </p>
                      {currentAttendingDoc.phone && (
                        <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                          <Phone size={11} /> {currentAttendingDoc.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Consultation Fee</span>
                    <strong className="text-sm font-mono font-black text-slate-900 block mt-0.5">
                      ₹{currentAttendingDoc.fees?.clinic || currentAttendingDoc.fees?.online || 900}
                    </strong>
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-amber-50/60 border border-amber-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-amber-900 uppercase">
                        Doctor Pending Assignment
                      </h5>
                      <p className="text-xs text-amber-700 font-medium">
                        No doctor has been confirmed yet for this clinical admission.
                      </p>
                    </div>
                  </div>

                  {!isAppointmentClosed && (
                    <button
                      type="button"
                      onClick={() => handleOpenAssignModal(false)}
                      className="px-4 py-2 bg-[#3d3f96] hover:bg-[#2b2d75] text-white rounded-xl text-xs font-black tracking-wider transition-all cursor-pointer shadow-xs whitespace-nowrap"
                    >
                      Assign Free Doctor
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 3. Inpatient Ward Stay & Bed Allocation (If IPD or Emergency) */}
            {dossier.wardName && (
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <Bed size={18} />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Inpatient Ward &amp; Bed Allocation
                    </h4>
                  </div>
                  <span className="text-xs font-mono font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    {dossier.stayDuration || 1} Days Stay
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Ward Category</span>
                    <strong className="text-slate-900 block mt-0.5">{dossier.wardName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Bed Number</span>
                    <span className="font-mono font-black text-emerald-700 block mt-0.5">
                      Bed #{dossier.bedNumber} ({dossier.bedBookingType || "General-Bed"})
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Stay Dates</span>
                    <span className="text-slate-800 font-bold block mt-0.5">
                      {dossier.startDate ? new Date(dossier.startDate).toLocaleDateString() : ''} to {dossier.endDate ? new Date(dossier.endDate).toLocaleDateString() : ''}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Treatment History & Shift Handover Timeline (Audit Trail) */}
            {Array.isArray(dossier.treatmentHistory) && dossier.treatmentHistory.length > 0 && (
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                  <div className="flex items-center gap-2 text-slate-800">
                    <History size={18} className="text-[#3d3f96]" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Doctor Handover &amp; Treatment History
                    </h4>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {dossier.treatmentHistory.length} Event(s)
                  </span>
                </div>

                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {dossier.treatmentHistory.map((step, idx) => (
                    <div key={idx} className="relative group text-xs">
                      <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#3d3f96] ring-4 ring-indigo-50" />
                      <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/70 space-y-1.5">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="font-black text-slate-900 uppercase tracking-wider text-[11px]">
                            {step.action || "Duty Log"}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {step.startTime ? new Date(step.startTime).toLocaleString() : ''}
                          </span>
                        </div>

                        {step.notes && (
                          <p className="text-slate-600 font-medium leading-relaxed">
                            {step.notes}
                          </p>
                        )}

                        {step.durationDisplay && (
                          <div className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded inline-block">
                            Duration: {step.durationDisplay}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Itemized Accounting Breakdown */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                <div className="flex items-center gap-2 text-[#3d3f96]">
                  <Receipt size={18} />
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Itemized Accounting Breakdown
                  </h4>
                </div>
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                  {dossier.paymentStatus || "Paid"}
                </span>
              </div>

              <div className="space-y-2.5 text-xs font-medium text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Doctor Base Consultation Fee</span>
                  <span className="font-mono font-bold text-slate-900">₹{dossier.pricingBreakdown?.baseFee || 0}</span>
                </div>

                {dossier.pricingBreakdown?.visitCharges > 0 && (
                  <div className="flex items-center justify-between">
                    <span>Inpatient Ward Stay Charges</span>
                    <span className="font-mono font-bold text-slate-900">₹{dossier.pricingBreakdown.visitCharges}</span>
                  </div>
                )}

                {dossier.pricingBreakdown?.extraCharges > 0 && (
                  <div className="flex items-center justify-between">
                    <span>Extra Facility / Triage Fees</span>
                    <span className="font-mono font-bold text-slate-900">₹{dossier.pricingBreakdown.extraCharges}</span>
                  </div>
                )}

                {dossier.pricingBreakdown?.discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-700 font-bold bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                    <span className="flex items-center gap-1">
                      <Percent size={13} /> Coupon ({dossier.couponDetails?.couponCode || "DISCOUNT"})
                    </span>
                    <span className="font-mono">- ₹{dossier.pricingBreakdown.discountAmount}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between text-slate-900">
                  <span className="text-xs font-black uppercase">Net Total Billed</span>
                  <strong className="text-2xl font-black font-mono text-[#3d3f96]">
                    ₹{dossier.totalAmount}
                  </strong>
                </div>
              </div>

              {dossier.paymentDetails?.razorpayPaymentId && (
                <div className="pt-3 border-t border-slate-50 text-[11px] font-mono text-slate-500 flex items-center justify-between flex-wrap gap-2">
                  <span>Payment Ref: {dossier.paymentDetails.razorpayPaymentId}</span>
                  {dossier.paymentDetails.paidAt && (
                    <span>{new Date(dossier.paymentDetails.paidAt).toLocaleString()}</span>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Back Button */}
            <div className="pt-2 flex justify-end print:hidden">
              <button
                type="button"
                onClick={() => router.back()}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider bg-[#3d3f96] hover:bg-[#2d2f75] text-white transition-all cursor-pointer shadow-md shadow-indigo-950/15"
              >
                Return to Facility Admissions
              </button>
            </div>

          </div>
        )}
      </div>

      {/* --- DOCTOR ASSIGNMENT / REASSIGNMENT MODAL --- */}
      {isAssignModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 sm:p-6 z-50 select-none antialiased"
          role="dialog"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsAssignModalOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-[#3d3f96] bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                    {isReassignMode ? 'Reassign Doctor' : 'Assign Attending Doctor'}
                  </span>
                  <span className="font-mono font-bold text-xs text-slate-500">
                    {dossier?.bookingId}
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900">
                  {isReassignMode ? 'Transfer Appointment to New Doctor' : 'Assign Free Approved Clinic Doctor'}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 [&::-webkit-scrollbar]:hidden">
              
              {/* Alert: Warning if Pre-Selected Doctor is Unavailable */}
              {doctorWarning && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800">
                  <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="font-semibold leading-relaxed">
                    {doctorWarning}
                  </p>
                </div>
              )}

              {/* Toast Error / Success */}
              {actionErrorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs text-rose-700 font-bold">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{actionErrorMsg}</span>
                </div>
              )}
              {actionSuccessMsg && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-700 font-bold">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>{actionSuccessMsg}</span>
                </div>
              )}

              {/* Filter Controls: Search & Speciality Pill */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input
                    type="text"
                    placeholder="Search doctor by name, qualification, or speciality..."
                    value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96] transition-all"
                  />
                </div>

                {uniqueSpecialities.length > 0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setSelectedSpeciality('ALL')}
                      className={`px-3 py-1 rounded-xl font-black text-[11px] whitespace-nowrap cursor-pointer transition-all ${
                        selectedSpeciality === 'ALL'
                          ? 'bg-[#3d3f96] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      All Specialities
                    </button>
                    {uniqueSpecialities.map((spec) => (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => setSelectedSpeciality(spec)}
                        className={`px-3 py-1 rounded-xl font-black text-[11px] whitespace-nowrap cursor-pointer transition-all ${
                          selectedSpeciality === spec
                            ? 'bg-[#3d3f96] text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Doctors List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Available Doctors On Duty ({availableDoctors.length}):</span>
                  {loadingDoctors && <Loader2 size={14} className="animate-spin text-[#3d3f96]" />}
                </div>

                {loadingDoctors && availableDoctors.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
                    <Loader2 size={28} className="animate-spin text-[#3d3f96]" />
                    <span className="text-xs font-bold uppercase tracking-wider">Finding active doctors...</span>
                  </div>
                ) : availableDoctors.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/80 border-dashed text-xs text-slate-400">
                    No free approved doctors currently available matching this criteria.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {availableDoctors.map((doc) => {
                      const isSelected = chosenDoctor?._id === doc._id;
                      const isPreSelected = doc.isDoctorSelectedAlready;
                      const isCurrentlyAssigned =
                        dossier?.doctorId &&
                        (dossier.doctorId?._id === doc._id || dossier.doctorId === doc._id);

                      return (
                        <div
                          key={doc._id}
                          onClick={() => {
                            if (!isCurrentlyAssigned) setChosenDoctor(doc);
                          }}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isCurrentlyAssigned
                              ? 'bg-slate-100/60 border-slate-200 opacity-60 cursor-not-allowed'
                              : isSelected
                              ? 'bg-indigo-50/80 border-[#3d3f96] ring-2 ring-indigo-200 shadow-xs'
                              : 'bg-white hover:bg-slate-50 border-slate-200/80'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                              <img
                                src={getMediaUrl(doc.profileImage) || DOC_PLACEHOLDER}
                                alt={doc.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = DOC_PLACEHOLDER; }}
                              />
                            </div>
                            <div className="min-w-0 space-y-0.5 text-left">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="text-xs font-black text-slate-900 truncate">
                                  {doc.name}
                                </h5>
                                {isPreSelected && (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded bg-indigo-600 text-white shadow-2xs">
                                    <Sparkles size={9} /> Patient Selected
                                  </span>
                                )}
                                {isCurrentlyAssigned && (
                                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-600">
                                    Currently Assigned
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] font-bold text-[#3d3f96] truncate">
                                {doc.speciality} {doc.qualification ? `(${doc.qualification})` : ''} • {doc.experienceYears || 1}+ Yrs
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[11px] font-black font-mono text-slate-900 block">
                              ₹{doc.fees?.clinic || doc.fees?.online || 900}
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600">
                              {doc.dutyStatus || 'Free'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Assignment Notes / Reassignment Reason */}
              <div className="space-y-1.5 text-xs text-left">
                <label className="font-black text-slate-700 uppercase tracking-wider text-[10px] block">
                  {isReassignMode ? 'Reason for Reassignment *' : 'Internal Clinical Notes (Optional)'}
                </label>
                <textarea
                  rows={2}
                  placeholder={
                    isReassignMode
                      ? "e.g., Doctor entered emergency surgery; transfer requested."
                      : "Optional instructions or notes for attending doctor..."
                  }
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96] transition-all"
                />
              </div>

              {/* Date & Time Slot Confirmation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-left">
                <div>
                  <label className="font-black text-slate-700 uppercase tracking-wider text-[10px] block mb-1">
                    Appointment Date
                  </label>
                  <input
                    type="date"
                    value={assignDate}
                    onChange={(e) => setAssignDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="font-black text-slate-700 uppercase tracking-wider text-[10px] block mb-1">
                    Time Slot
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 11:00 AM"
                    value={assignTime}
                    onChange={(e) => setAssignTime(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:bg-white"
                  />
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/70 transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!chosenDoctor || assignSubmitting}
                onClick={handleDoctorSubmit}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-[#3d3f96] hover:bg-[#2b2d75] disabled:opacity-50 text-white transition-all cursor-pointer shadow-md shadow-indigo-950/15"
              >
                {assignSubmitting && <Loader2 size={14} className="animate-spin" />}
                <span>
                  {isReassignMode ? 'Confirm Reassignment' : 'Confirm Doctor Assignment'}
                </span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}