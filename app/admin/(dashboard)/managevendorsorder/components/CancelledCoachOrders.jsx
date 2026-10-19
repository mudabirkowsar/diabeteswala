"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Ban,
  X,
  Search,
  Calendar,
  Phone,
  Mail,
  User,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Inbox,
  Clock,
  AlertCircle,
  Copy,
  Check,
  Video,
  Building2,
  HeartHandshake
} from "lucide-react";

import AdminAPI from "../../../../services/AdminAPI";

// --- BASE MEDIA HELPER ---
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.4:5002";

const getMediaUrl = (path) => {
  if (!path || typeof path !== "string") return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const cleanBase = BASE_SERVER_URL.replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

const COACH_PLACEHOLDER = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&auto=format&fit=crop";

export default function CancelledCoachOrders({ isOpen, onClose }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [consultationMode, setConsultationMode] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCancelled, setTotalCancelled] = useState(0);
  const [copiedId, setCopiedId] = useState(null);

  const modalRef = useRef(null);

  // ========================================================
  // 1. FETCH CANCELLED COACH BOOKINGS (API 1)
  // ========================================================
  const fetchCancelledBookings = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        ...(search.trim() && { search: search.trim() }),
        ...(paymentMethod && { paymentMethod }),
        ...(consultationMode && { consultationMode })
      };

      const response = await AdminAPI.getAdminCancelledCoachBookings(params);

      if (response && response.success) {
        setOrders(response.data || []);
        setTotalPages(response.totalPages || 1);
        setTotalCancelled(response.totalCancelled || response.count || 0);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching cancelled coach bookings:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, paymentMethod, consultationMode]);

  useEffect(() => {
    if (isOpen === false) return;
    const debounce = setTimeout(() => {
      fetchCancelledBookings();
    }, 300);
    return () => clearTimeout(debounce);
  }, [isOpen, fetchCancelledBookings]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        if (onClose) onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Copy helper
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isOpen === false) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-y-auto animate-in fade-in duration-150 text-left select-none">
      <div
        ref={modalRef}
        className="bg-white rounded-3xl w-full max-w-7xl h-[92vh] max-h-[92vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-in zoom-in-95 duration-150 relative"
      >
        {/* 1. MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-rose-50/40 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200 shadow-xs">
              <Ban className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Cancelled Coach Sessions Hub</h3>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                  {totalCancelled} Cancelled
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Audit cancelled diabetes educator visits, patient justifications, and admin refund statuses
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer shadow-xs focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* 2. SEARCH & FILTER CONTROLS */}
        <div className="px-6 py-3.5 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Booking ID, Patient Name, Phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-rose-400 focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2.5">
            {/* Payment Method Filter */}
            <select
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value);
                setPage(1);
              }}
              className="text-xs font-bold rounded-xl px-4 py-2 bg-slate-50 border border-slate-200 focus:outline-none text-slate-700 cursor-pointer"
            >
              <option value="">All Payment Modes</option>
              <option value="COD">COD</option>
              <option value="Online">Online</option>
            </select>

            {/* Consultation Mode Filter */}
            <select
              value={consultationMode}
              onChange={(e) => {
                setConsultationMode(e.target.value);
                setPage(1);
              }}
              className="text-xs font-bold rounded-xl px-4 py-2 bg-slate-50 border border-slate-200 focus:outline-none text-slate-700 cursor-pointer"
            >
              <option value="">All Modes</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
            </select>
          </div>
        </div>

        {/* 3. TABLE BODY */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-xs text-left align-middle">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-4">Booking Code</th>
                  <th className="px-5 py-4">Assigned Coach</th>
                  <th className="px-5 py-4">Patient Details</th>
                  <th className="px-5 py-4">Slot &amp; Mode</th>
                  <th className="px-5 py-4 w-1/4">Cancellation Reason</th>
                  <th className="px-5 py-4">Payment &amp; Refund</th>
                  <th className="px-5 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-24 text-center">
                      <div className="flex flex-col items-center justify-center gap-2.5">
                        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                        <span className="text-xs font-bold text-slate-500">Loading cancelled sessions...</span>
                      </div>
                    </td>
                  </tr>
                ) : orders.length > 0 ? (
                  orders.map((b) => {
                    const coach = b.coach || {};
                    const patient = b.patient || {};
                    const cancellation = b.cancellationDetails || {};
                    const coachImage = getMediaUrl(coach.profileImage) || COACH_PLACEHOLDER;
                    const isOnline = b.consultationMode?.toLowerCase() === "online";

                    return (
                      <tr key={b._id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Booking Code */}
                        <td className="px-5 py-4 align-top">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-black text-rose-600 text-xs">
                              {b.bookingId}
                            </span>
                            <button
                              onClick={() => handleCopy(b.bookingId, b._id)}
                              title="Copy ID"
                              className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                            >
                              {copiedId === b._id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono block mt-1">
                            {b.bookingDate ? new Date(b.bookingDate).toLocaleDateString() : ""}
                          </span>
                        </td>

                        {/* Coach Info */}
                        <td className="px-5 py-4 align-top">
                          <div className="flex items-center gap-3">
                            <img
                              src={coachImage}
                              alt={coach.name}
                              className="w-8 h-8 rounded-xl object-cover border border-slate-200 shrink-0"
                              onError={(e) => {
                                e.currentTarget.src = COACH_PLACEHOLDER;
                              }}
                            />
                            <div className="min-w-0">
                              <div className="font-extrabold text-slate-900 text-xs truncate">
                                {coach.name || "Educator"}
                              </div>
                              <div className="text-[10px] text-[#3D3F96] font-bold truncate">
                                {coach.qualification || "Diabetes Coach"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Patient Details */}
                        <td className="px-5 py-4 align-top">
                          <div className="font-extrabold text-slate-900 text-xs">
                            {patient.name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                            <Phone className="w-2.5 h-2.5 text-slate-400" /> {patient.phone || "N/A"}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                              {patient.relation || patient.bookingFor || "Self"}
                            </span>
                            {patient.isDiabetic && (
                              <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                {patient.diabetesType || "Diabetic"}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Slot & Mode */}
                        <td className="px-5 py-4 align-top">
                          <div className="font-bold text-slate-800 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#3D3F96]" />
                            <span>{b.scheduledDate}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                            <Clock className="w-2.5 h-2.5 text-amber-500" />
                            <span>{b.slotTime}</span>
                          </div>
                          <div className="mt-1">
                            <span
                              className={`inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                                isOnline
                                  ? "bg-purple-50 text-purple-700 border-purple-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              }`}
                            >
                              {isOnline ? <Video className="w-2.5 h-2.5" /> : <Building2 className="w-2.5 h-2.5" />}
                              <span>{b.consultationMode || "Offline"}</span>
                            </span>
                          </div>
                        </td>

                        {/* Cancellation Reason */}
                        <td className="px-5 py-4 align-top">
                          <div className="inline-flex items-start gap-1.5 p-2 rounded-xl bg-rose-50/80 border border-rose-200/60 text-rose-700 text-[11px] font-medium w-full">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold block">
                                Cancelled by: {cancellation.cancelledBy || "User"}
                              </span>
                              <span className="text-rose-800 font-normal">
                                {cancellation.reason || "Patient cancelled consultation."}
                              </span>
                            </div>
                          </div>
                          {cancellation.cancelledAt && (
                            <div className="text-[10px] text-slate-400 font-mono mt-1">
                              Time: {new Date(cancellation.cancelledAt).toLocaleString()}
                            </div>
                          )}
                        </td>

                        {/* Payment & Refund */}
                        <td className="px-5 py-4 align-top">
                          <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                            <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                            {b.paymentMethod || "COD"}
                          </div>
                          <div className="mt-1">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${
                                b.paymentStatus === "Refund-Pending"
                                  ? "bg-purple-50 text-purple-700 border-purple-200"
                                  : "bg-slate-100 text-slate-600 border-slate-200"
                              }`}
                            >
                              {b.paymentStatus || "Cancelled"}
                            </span>
                          </div>
                          <div className="text-[10px] font-semibold text-slate-500 mt-1">
                            Refund: <strong className="text-slate-800">{cancellation.refundStatus || "N/A"}</strong>
                            {cancellation.refundAmount > 0 && ` (₹${cancellation.refundAmount})`}
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="px-5 py-4 align-top text-right">
                          <span className="font-black text-slate-900 text-sm font-mono block">
                            ₹{b.totalPayable}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">Total Fee</span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center gap-2.5">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
                          <Inbox className="w-6 h-6" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-700">No Cancelled Bookings Found</h4>
                        <p className="text-[11px] text-slate-400">
                          There are no cancelled coach consultation records matching this filter.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. MODAL FOOTER & PAGINATION */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/70 shrink-0 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold disabled:opacity-40 hover:bg-slate-50 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </button>
            <span className="text-xs font-extrabold text-slate-600">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages || loading}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold disabled:opacity-40 hover:bg-slate-50 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 text-white hover:bg-black text-xs font-extrabold uppercase tracking-wider transition-all focus:outline-none shadow-xs cursor-pointer"
            >
              Close Hub
            </button>
          )}
        </div>
      </div>
    </div>
  );
}