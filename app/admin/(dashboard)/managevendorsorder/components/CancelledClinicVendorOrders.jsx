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
    Building2,
    Stethoscope,
    Clock,
    AlertCircle,
    Copy,
    Check,
    RotateCcw,
    Tag
} from "lucide-react";

// Exact AdminAPI path
import AdminAPI from "../../../../services/AdminAPI";

export default function CancelledClinicVendorOrders({ isOpen, onClose }) {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCancelledAppointments, setTotalCancelledAppointments] = useState(0);
    const [copiedId, setCopiedId] = useState(null);

    const modalRef = useRef(null);

    // ========================================================
    // 1. FETCH CANCELLED CLINIC APPOINTMENTS API
    // ========================================================
    const fetchCancelledAppointments = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page,
                limit: 20,
                ...(search.trim() && { search: search.trim() })
            };

            const response = await AdminAPI.getCancelledClinicAppointments(params);

            if (response && response.success) {
                setAppointments(response.data || []);
                setTotalPages(response.totalPages || 1);
                setTotalCancelledAppointments(
                    response.totalCancelledAppointments || response.count || 0
                );
            } else {
                setAppointments([]);
            }
        } catch (error) {
            console.error("Error fetching cancelled clinic appointments:", error);
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        if (!isOpen) return;
        const debounce = setTimeout(() => {
            fetchCancelledAppointments();
        }, 300);
        return () => clearTimeout(debounce);
    }, [isOpen, fetchCancelledAppointments]);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onClose]);

    // Copy to clipboard helper
    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-y-auto animate-in fade-in duration-150">
            <div
                ref={modalRef}
                className="bg-white rounded-3xl w-full max-w-7xl h-[92vh] max-h-[92vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col select-none animate-in zoom-in-95 duration-150 relative"
            >
                {/* 1. MODAL HEADER */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-rose-50/40 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200 shadow-xs">
                            <Ban className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                                    Cancelled Clinic Appointments
                                </h3>
                                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                                    {totalCancelledAppointments} Cancelled
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                Audit clinic appointment cancellations, patient reasons, and refund breakdowns
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer shadow-xs focus:outline-none"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* 2. SEARCH BAR */}
                <div className="px-6 py-3.5 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-4 shrink-0">
                    <div className="relative flex-1 min-w-[260px] max-w-md">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by Booking ID, patient, clinic, doctor, or reason..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-rose-400 focus:outline-none transition-all"
                        />
                    </div>
                </div>

                {/* 3. TABLE BODY */}
                <div className="overflow-y-auto flex-1 p-6">
                    <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                        <table className="w-full text-xs text-left align-middle">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-100">
                                    <th className="px-5 py-4">Booking Info</th>
                                    <th className="px-5 py-4">Patient Details</th>
                                    <th className="px-5 py-4">Clinic & Doctor</th>
                                    <th className="px-5 py-4 w-1/4">Cancellation Reason</th>
                                    <th className="px-5 py-4">Timeline</th>
                                    <th className="px-5 py-4">Payment & Refunds</th>
                                    <th className="px-5 py-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-24 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2.5">
                                                <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                                                <span className="text-xs font-bold text-slate-500">Loading cancelled appointments...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : appointments.length > 0 ? (
                                    appointments.map((item) => (
                                        <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                                            
                                            {/* Booking ID & Consultation Type */}
                                            <td className="px-5 py-4 align-top">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-mono font-black text-rose-600 text-xs">
                                                        {item.bookingId}
                                                    </span>
                                                    <button
                                                        onClick={() => handleCopy(item.bookingId, item._id)}
                                                        title="Copy ID"
                                                        className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer transition-colors"
                                                    >
                                                        {copiedId === item._id ? (
                                                            <Check className="w-3 h-3 text-emerald-600" />
                                                        ) : (
                                                            <Copy className="w-3 h-3" />
                                                        )}
                                                    </button>
                                                </div>
                                                <div className="mt-1">
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                                                        <Tag className="w-2.5 h-2.5" />
                                                        {item.consultationType || item.bookingType || "Appointment"}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Patient Details */}
                                            <td className="px-5 py-4 align-top">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 font-bold text-xs">
                                                        <User className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="font-extrabold text-slate-900 text-xs">
                                                            {item.patient?.name || "Anonymous Patient"}
                                                        </div>
                                                        <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                                                            <Phone className="w-2.5 h-2.5 text-slate-400" /> {item.patient?.phone || "N/A"}
                                                        </div>
                                                        {item.patient?.email && (
                                                            <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.2">
                                                                <Mail className="w-2.5 h-2.5" /> {item.patient.email}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Clinic & Doctor Details */}
                                            <td className="px-5 py-4 align-top">
                                                <div className="space-y-1">
                                                    <div className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                                                        <Building2 className="w-3 h-3 text-[#3D3F96] shrink-0" />
                                                        {item.clinic?.name || "Clinic"}
                                                    </div>
                                                    {item.doctor?.name && (
                                                        <div className="font-semibold text-slate-600 text-[11px] flex items-center gap-1">
                                                            <Stethoscope className="w-3 h-3 text-emerald-600 shrink-0" />
                                                            {item.doctor.name}
                                                        </div>
                                                    )}
                                                    <div className="text-[10px] text-slate-400 font-medium">
                                                        {item.clinic?.city || ""} &bull; {item.clinic?.phone || ""}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Cancellation Reason */}
                                            <td className="px-5 py-4 align-top">
                                                <div className="inline-flex items-start gap-1.5 p-2.5 rounded-xl bg-rose-50/80 border border-rose-200/60 text-rose-700 text-[11px] font-medium w-full">
                                                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                                                    <div>
                                                        <span className="font-bold">Reason:</span> {item.cancelReason || "No cancellation reason provided."}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Timeline */}
                                            <td className="px-5 py-4 align-top">
                                                <div className="space-y-1 text-[11px]">
                                                    <div className="text-slate-600 font-semibold flex items-center gap-1">
                                                        <Calendar className="w-3 h-3 text-slate-400" />
                                                        <span>Cancelled:</span>
                                                        <strong className="text-slate-800 font-bold">
                                                            {item.cancelledAt
                                                                ? new Date(item.cancelledAt).toLocaleDateString("en-IN", {
                                                                      day: "2-digit",
                                                                      month: "short",
                                                                      year: "numeric"
                                                                  })
                                                                : "N/A"}
                                                        </strong>
                                                    </div>
                                                    {item.cancelledAt && (
                                                        <div className="text-slate-400 text-[10px] font-medium flex items-center gap-1 pl-4">
                                                            <Clock className="w-2.5 h-2.5" />
                                                            {new Date(item.cancelledAt).toLocaleTimeString([], {
                                                                hour: "2-digit",
                                                                minute: "2-digit"
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Payment & Refund Breakdown */}
                                            <td className="px-5 py-4 align-top">
                                                <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                                                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                                                    {item.payment?.paymentMethod || "Online"}
                                                </div>
                                                <div className="text-xs font-black text-slate-900 mt-0.5">
                                                    Fee: ₹{(item.payment?.totalAmount || 0).toLocaleString("en-IN")}
                                                </div>

                                                <div className="mt-1 space-y-0.5 text-[10px]">
                                                    <div className="flex items-center gap-1 font-bold text-emerald-700">
                                                        <RotateCcw className="w-2.5 h-2.5 text-emerald-600" />
                                                        <span>Refund: ₹{item.refundAmountCalculated || 0}</span>
                                                    </div>
                                                    {item.penaltyApplied > 0 && (
                                                        <div className="text-rose-600 font-bold">
                                                            Penalty: ₹{item.penaltyApplied}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-5 py-4 align-top text-center">
                                                <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                                                    {item.status || "Cancelled"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2.5">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
                                                    <Inbox className="w-6 h-6" />
                                                </div>
                                                <h4 className="text-xs font-bold text-slate-700">No Cancelled Appointments Found</h4>
                                                <p className="text-[11px] text-slate-400">There are no cancelled clinic appointments matching your search.</p>
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

                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 rounded-xl bg-slate-900 text-white hover:bg-black text-xs font-extrabold uppercase tracking-wider transition-all focus:outline-none shadow-xs cursor-pointer"
                    >
                        Close Modal
                    </button>
                </div>
            </div>
        </div>
    );
}