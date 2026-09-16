"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Video,
  Home,
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
  Shield,
  Printer,
  Activity,
  FileCheck,
  Loader2
} from 'lucide-react';

import IndependentDoctorAPI from '../../../../../../services/IndependentDoctorAPI';

export default function DoctorAppointmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params?.id;

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!appointmentId) return;

    const fetchFullDetails = async () => {
      setLoading(true);
      try {
        const response = await IndependentDoctorAPI.getDoctorAppointmentFullDetails(appointmentId);
        if (response && response.success) {
          setDetail(response.data);
        } else {
          setDetail(null);
          toast.error(response?.message || "Failed to load appointment details");
        }
      } catch (err) {
        console.error("Error retrieving appointment details:", err);
        toast.error(err?.response?.data?.message || err.message || "Failed to fetch appointment record");
        setDetail(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFullDetails();
  }, [appointmentId]);

  // Badges helpers
  const getConsultationBadge = (type = '') => {
    const lower = type.toLowerCase();
    if (lower.includes('home')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
          <Home size={13} /> {type || 'Home Visit'}
        </span>
      );
    }
    if (lower.includes('video') || lower.includes('tele')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200 shadow-2xs">
          <Video size={13} /> {type || 'Video Consult'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 shadow-2xs">
        <Building2 size={13} /> {type || 'In-Clinic Visit'}
      </span>
    );
  };

  const getStatusBadge = (status = '') => {
    const lower = status.toLowerCase();
    if (lower === 'confirmed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
          <CheckCircle2 size={13} /> Confirmed
        </span>
      );
    }
    if (lower === 'pending') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
          <Clock3 size={13} /> Pending
        </span>
      );
    }
    if (lower === 'cancelled') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
          <XCircle size={13} /> Cancelled
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
          Loading Appointment Dossier...
        </h3>
        <p className="text-xs text-slate-400 mt-1 font-medium">
          Retrieving patient records, fee breakdown, and transaction status
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
        <h2 className="text-base font-black text-slate-900 tracking-tight">Appointment Not Found</h2>
        <p className="text-xs text-slate-400 max-w-sm font-medium">
          We could not locate this clinical appointment. It may have been unassigned or removed.
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

  // Deconstruct safe API objects
  const apt = detail?.appointmentInfo || {};
  const patient = detail?.patientDetails || {};
  const doctor = detail?.doctorDetails || {};
  const address = detail?.address || null;
  const pricing = detail?.pricingBreakdown || {};
  const payment = detail?.paymentDetails || {};
  const insurance = detail?.insuranceDetails || {};
  const clinical = detail?.clinicalSummary || {};
  const patientsList = detail?.patients || [];
  const uploadedReports = clinical?.uploadedReports || [];

  return (
    <div className="min-h-screen text-slate-800 pb-20">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Navigation & Action Header */}
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
                Booking Ref
              </span>
              <h1 className="text-sm sm:text-base font-black text-indigo-700 font-mono mt-0.5">
                {apt.bookingId || apt.id || appointmentId}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {getConsultationBadge(apt.consultationType || apt.serviceType)}
            {getStatusBadge(apt.status)}
            <button
              onClick={() => window.print()}
              className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition cursor-pointer"
              title="Print Details"
            >
              <Printer size={15} />
            </button>
          </div>
        </div>

        {/* Main 2-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT COLUMN: SCHEDULE, PATIENT, CLINICAL & ADDRESS (7/12) */}
          <div className="lg:col-span-7 space-y-6">

            {/* 1. Highlighted Time and Schedule Card */}
            <div className="bg-gradient-to-br from-amber-500/10 via-indigo-500/5 to-transparent bg-white p-6 rounded-3xl border-2 border-amber-300 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-600" /> Important Appointment Schedule
                </span>
                <span className="text-[10px] font-bold text-slate-400 font-mono">
                  {apt.serviceType || 'Consultation'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 bg-white/95 rounded-2xl border border-amber-200 flex items-center gap-3 shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Scheduled Date</span>
                    <strong className="text-xs sm:text-sm font-black text-slate-900 font-mono">
                      {apt.formattedDate || apt.date || 'Pending'}
                    </strong>
                  </div>
                </div>

                <div className="p-3.5 bg-white/95 rounded-2xl border border-amber-200 flex items-center gap-3 shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Clock size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Allocated Time Slot</span>
                    <strong className="text-xs sm:text-sm font-black text-amber-800 font-mono">
                      {apt.timeSlot || 'Morning Slot'}
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
                    Patient Details
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-slate-400 font-mono">
                  Profile Info
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-medium">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Patient Name</span>
                  <strong className="text-sm font-black text-slate-900 block mt-0.5">
                    {patient.name || 'Anonymous Patient'}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Age / Gender</span>
                  <span className="text-slate-800 font-bold block mt-0.5">
                    {patient.age || 'N/A'} Yrs • {patient.gender || 'N/A'}
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

              {/* Problem Description / Chief Complaint */}
              {(apt.problemDescription || clinical.chiefComplaint) && (
                <div className="pt-2 border-t border-slate-50 space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                    Reported Symptoms / Reason for Visit
                  </span>
                  <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 font-semibold leading-relaxed">
                    &ldquo;{apt.problemDescription || clinical.chiefComplaint}&rdquo;
                  </p>
                </div>
              )}
            </div>

            {/* 3. Home Visit Patient Address (Rendered if Available) */}
            {address && (address.houseNo || address.city || address.name) && (
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                  <div className="flex items-center gap-2 text-amber-700">
                    <MapPin size={16} />
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Home Visit Location Address
                    </h3>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                    {address.addressType || 'Home'}
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  <strong className="text-slate-900 font-bold block">{address.name}</strong>
                  <p className="text-slate-600 font-semibold leading-relaxed">
                    {address.houseNo}{address.sector ? `, ${address.sector}` : ''}
                    <br />
                    {address.city}, {address.state} - <span className="font-mono font-bold">{address.pincode}</span>
                  </p>
                </div>
              </div>
            )}

            {/* 4. Uploaded Medical Reports */}
            {uploadedReports.length > 0 && (
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <FileText size={16} />
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Uploaded Medical Reports ({uploadedReports.length})
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">
                    Attached Files
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {uploadedReports.map((reportUrl, idx) => (
                    <a
                      key={idx}
                      href={reportUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3 bg-slate-50 hover:bg-indigo-50/50 rounded-2xl border border-slate-200/80 hover:border-indigo-300 flex items-center justify-between gap-3 text-xs transition shadow-2xs group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white flex items-center justify-center shrink-0 transition">
                          <FileCheck size={16} />
                        </div>
                        <span className="font-bold text-slate-800 truncate">
                          Medical Report #{idx + 1}
                        </span>
                      </div>
                      <ExternalLink size={14} className="text-indigo-600 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: DOCTOR INFO, FEES & TRANSACTION (5/12) */}
          <div className="lg:col-span-5 space-y-6">

            {/* 5. Assigned Doctor / Specialist Profile */}
            {doctor && doctor.name && (
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-indigo-600 border-b border-slate-50 pb-3">
                  <Stethoscope size={16} />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Doctor Assigned
                  </h3>
                </div>
                <div className="text-xs space-y-1">
                  <h4 className="text-sm font-black text-slate-900">{doctor.name}</h4>
                  <p className="text-indigo-700 font-bold">{doctor.speciality} {doctor.qualification ? `(${doctor.qualification})` : ''}</p>
                  {doctor.phone && (
                    <p className="text-slate-500 font-mono text-[11px] pt-1">
                      Phone: {doctor.phone}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* 6. Pricing and Fee Breakdown */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                <div className="flex items-center gap-2 text-indigo-600">
                  <Receipt size={16} />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Payment &amp; Fees Receipt
                  </h3>
                </div>
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md ${apt.isPaid ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700'}`}>
                  {apt.paymentStatus || (apt.isPaid ? 'Paid' : 'Unpaid')}
                </span>
              </div>

              <div className="space-y-2.5 text-xs font-medium text-slate-600">
                <div className="flex justify-between">
                  <span>Base Consultation Fee:</span>
                  <span className="font-mono font-bold text-slate-900">₹{pricing.baseFee || 0}</span>
                </div>

                {pricing.visitCharges > 0 && (
                  <div className="flex justify-between">
                    <span>Home Visit Surcharge:</span>
                    <span className="font-mono font-bold text-slate-900">₹{pricing.visitCharges}</span>
                  </div>
                )}

                {pricing.extraCharges > 0 && (
                  <div className="flex justify-between">
                    <span>Extra Facility Charges:</span>
                    <span className="font-mono font-bold text-slate-900">₹{pricing.extraCharges}</span>
                  </div>
                )}

                {pricing.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50/70 p-2 rounded-xl border border-emerald-100">
                    <span>Discount Applied:</span>
                    <span className="font-mono">- ₹{pricing.discountAmount}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between text-slate-900">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider block">Total Amount</span>
                    <span className="text-[10px] text-slate-400">Taxes included</span>
                  </div>
                  <strong className="text-xl font-black font-mono text-indigo-700">
                    ₹{apt.price || pricing.subtotal || 0}
                  </strong>
                </div>
              </div>
            </div>

            {/* 7. Online Payment Transaction Metadata */}
            {payment && payment.razorpayPaymentId && (
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-50 pb-2">
                  <CreditCard size={14} className="text-indigo-600" />
                  <h4 className="text-[11px] font-black uppercase tracking-wider">Transaction Credentials</h4>
                </div>
                <div className="space-y-1.5 font-mono text-[11px] text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-400">Payment ID:</span>
                    <strong className="text-slate-800">{payment.razorpayPaymentId}</strong>
                  </div>
                  {payment.razorpayOrderId && (
                    <div className="flex justify-between">
                      <span className="font-sans text-slate-400">Order ID:</span>
                      <span>{payment.razorpayOrderId}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-400">Method:</span>
                    <span className="uppercase font-bold">{payment.method || 'Online'} {payment.bank ? `(${payment.bank})` : ''}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 8. Insurance Details (If Attached) */}
            {insurance && insurance.hasInsurance && (
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                  <Shield size={14} />
                  <h4 className="text-[11px] font-black uppercase tracking-wider">Insurance Linked</h4>
                </div>
                <p className="text-slate-600 font-medium">
                  Number: <strong className="font-mono text-slate-900">{insurance.insuranceNumber || 'Active'}</strong>
                </p>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}