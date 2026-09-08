"use client";

import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Stethoscope,
  User,
  Calendar,
  Clock,
  MapPin,
  Video,
  Home,
  Bed,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Receipt,
  Phone,
  Loader2,
  Percent,
  FileText,
  Ambulance,
  Activity,
  Printer,
  HeartPulse,
  ShieldAlert,
  Check
} from 'lucide-react';

import ClinicAPI from '../../../../../services/ClinicAPI'; // Adjust relative path as needed

// --- BASE MEDIA HELPER ---
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";

const getMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  return `${BASE_SERVER_URL}/${cleanPath}`;
};

const CLINIC_PLACEHOLDER = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=300&auto=format&fit=crop";
const DOC_PLACEHOLDER = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=300&auto=format&fit=crop";

export default function AppointmentDetail({ isOpen, onClose, bookingId }) {
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch full 360° Clinical Dossier on modal open
  useEffect(() => {
    if (!isOpen || !bookingId) return;

    const fetchDossier = async () => {
      setLoading(true);
      try {
        const response = await ClinicAPI.getClinicBookingDetails(bookingId);
        if (response && response.success) {
          setDossier(response.data);
        } else {
          setDossier(null);
        }
      } catch (err) {
        console.error("Error fetching clinical dossier details:", err);
        setDossier(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDossier();
  }, [isOpen, bookingId]);

  // Lock body scroll and handle Escape key on modal open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 sm:p-6 select-none antialiased"
      style={{ zIndex: 5000 }}
    >
      {/* Centered Dark Backdrop with Blur */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        style={{ zIndex: 5000 }}
      />

      {/* Centered Modal Card */}
      <div
        className="relative w-full max-w-3xl bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden z-10 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 text-left"
        style={{ zIndex: 5001 }}
      >
        
        {/* Header Bar */}
        <div className="p-6 sm:p-7 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-[#3d3f96] bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                Clinical Dossier
              </span>
              <h3 className="text-base font-black text-slate-900 font-mono tracking-wider">
                {dossier?.bookingId || bookingId}
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              360-Degree Patient Admission &amp; Medical Consultation File
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors border border-slate-200 cursor-pointer"
              title="Print Dossier"
            >
              <Printer size={16} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors border border-slate-200 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-6 sm:p-7 flex-1 overflow-y-auto space-y-6 [&::-webkit-scrollbar]:hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Retrieving patient record dossier...
              </p>
            </div>
          ) : !dossier ? (
            <div className="p-10 text-center bg-slate-50 rounded-3xl border border-slate-200/60 border-dashed space-y-2 my-auto">
              <AlertCircle size={36} className="text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">Dossier Unavailable</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Unable to load the complete clinical file for this appointment record.
              </p>
            </div>
          ) : (
            <>
              {/* Top Status & Lifecycle Banner */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-500">Category:</span>
                  <span className="font-black text-slate-900 uppercase bg-white px-2 py-0.5 rounded border border-slate-200">
                    {dossier.bookingType || "Admission"}
                  </span>
                  <span className="font-bold text-slate-500">• Mode:</span>
                  <span className="font-bold text-[#3d3f96]">{dossier.consultationType}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {dossier.status || "Confirmed"}
                  </span>
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-indigo-50 text-[#3d3f96] border border-indigo-100">
                    {dossier.paymentStatus || "Paid"} ({dossier.paymentMethod || "Online"})
                  </span>
                </div>
              </div>

              {/* 1. Patient Profile Card */}
              {(() => {
                const primaryPatient = dossier.patients?.[0] || {};
                const user = dossier.userId || {};

                return (
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-2.5">
                      <div className="flex items-center gap-2 text-[#3d3f96]">
                        <User size={16} />
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                          Patient Profile
                        </h4>
                      </div>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {primaryPatient.relation || "SELF"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Patient Name</span>
                        <strong className="text-slate-900 block mt-0.5">
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
                        <span className="text-slate-800 font-bold block mt-0.5">
                          {user.phone || "Not Provided"}
                        </span>
                      </div>
                    </div>

                    {/* Chief Complaint / Booking Reason */}
                    {(dossier.bookingReason || primaryPatient.reasonForVisit) && (
                      <div className="pt-2 border-t border-slate-50 space-y-1">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                          Chief Medical Complaint
                        </span>
                        <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed font-medium">
                          "{dossier.bookingReason || primaryPatient.reasonForVisit}"
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* 2. Attending Medical Specialist */}
              {(() => {
                const doc = dossier.doctorId || {};
                const docImage = getMediaUrl(doc.profileImage) || DOC_PLACEHOLDER;

                return (
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-2.5">
                      <div className="flex items-center gap-2 text-[#3d3f96]">
                        <Stethoscope size={16} />
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                          Attending Specialist
                        </h4>
                      </div>
                      <span className="text-[11px] font-mono font-black text-slate-800">
                        Fee: ₹{doc.fees?.clinic || doc.fees?.online || 900}
                      </span>
                    </div>

                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0">
                        <img
                          src={docImage}
                          alt={doc.name || "Doctor"}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = DOC_PLACEHOLDER; }}
                        />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <h5 className="text-sm font-black text-slate-900 truncate">{doc.name}</h5>
                        <p className="text-xs font-bold text-[#3d3f96] truncate">
                          {doc.speciality} {doc.qualification ? `(${doc.qualification})` : ''} • {doc.experienceYears || 10}+ Yrs Exp
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 3. Inpatient Ward Stay & Bed Allocation (If IPD or Emergency) */}
              {dossier.wardName && (
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-50 pb-2.5">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <Bed size={16} />
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                        Inpatient Ward &amp; Bed Allocation
                      </h4>
                    </div>
                    <span className="text-xs font-mono font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                      {dossier.stayDuration || 1} Days Stay
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
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

              {/* 4. Patient Residential / Visiting Address */}
              {dossier.address?.city && (
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                    <MapPin size={13} className="text-[#3d3f96]" />
                    <span>Patient Location / Visiting Address:</span>
                  </div>
                  <p className="text-slate-600 font-medium pl-4.5 leading-relaxed">
                    {dossier.address.houseNo ? `${dossier.address.houseNo}, ` : ''}
                    {dossier.address.city}, {dossier.address.state} - <span className="font-mono font-bold text-slate-900">{dossier.address.pincode}</span> ({dossier.address.addressType || 'Home'})
                  </p>
                </div>
              )}

              {/* 5. Itemized Accounting Breakdown */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-50 pb-2.5">
                  <div className="flex items-center gap-2 text-[#3d3f96]">
                    <Receipt size={16} />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Itemized Accounting Breakdown
                    </h4>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {dossier.paymentStatus || "Paid"}
                  </span>
                </div>

                <div className="space-y-2 text-xs font-medium text-slate-600">
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
                    <div className="flex items-center justify-between text-emerald-700 font-bold bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                      <span className="flex items-center gap-1">
                        <Percent size={12} /> Coupon ({dossier.couponDetails?.couponCode || "DISCOUNT"})
                      </span>
                      <span className="font-mono">- ₹{dossier.pricingBreakdown.discountAmount}</span>
                    </div>
                  )}

                  <div className="pt-2.5 border-t border-slate-100 flex items-baseline justify-between text-slate-900">
                    <span className="text-xs font-black uppercase">Net Total Billed</span>
                    <strong className="text-xl font-black font-mono text-[#3d3f96]">
                      ₹{dossier.totalAmount}
                    </strong>
                  </div>
                </div>

                {/* Razorpay Online Transaction Reference */}
                {dossier.paymentDetails?.razorpayPaymentId && (
                  <div className="pt-2 border-t border-slate-50 text-[11px] font-mono text-slate-500 flex items-center justify-between">
                    <span>Payment Ref: {dossier.paymentDetails.razorpayPaymentId}</span>
                    {dossier.paymentDetails.paidAt && (
                      <span>{new Date(dossier.paymentDetails.paidAt).toLocaleTimeString()}</span>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 px-5 rounded-2xl font-black text-xs uppercase tracking-wider bg-[#3d3f96] hover:bg-[#2d2f75] text-white transition-all cursor-pointer shadow-md shadow-indigo-950/15"
          >
            Close Dossier
          </button>
        </div>

      </div>
    </div>
  );
}