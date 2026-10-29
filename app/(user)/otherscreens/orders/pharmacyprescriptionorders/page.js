"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    FileText,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
    CreditCard,
    ChevronRight,
    ChevronLeft,
    Receipt,
    RefreshCw,
    MapPin,
    Sparkles,
    Lock,
    PackageCheck,
    Truck,
    Key
} from 'lucide-react';

// API Service & Notification Context
import UserAPI from '../../../../services/UserAPI';
import { useNotification } from '../../../../context/NotificationContext';

// --- BASE MEDIA HELPER ---
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";
const PLACEHOLDER_STORE = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=200";

const getMediaUrl = (path) => {
    if (!path) return PLACEHOLDER_STORE;
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }
    const cleanBase = BASE_SERVER_URL.replace(/\/+$/, '');
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
};

export default function PharmacyPrescriptionOrdersPage() {
    const router = useRouter();
    const { showNotification } = useNotification();

    // --- State Management ---
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // --- Fetch User Prescription Requests ---
    const fetchPrescriptionRequests = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const res = await UserAPI.getUserPrescriptionRequests({ page: currentPage });
            if (res && res.success) {
                setRequests(res.data || []);
                setTotalPages(res.totalPages || 1);
                if (isRefresh) {
                    showNotification("Prescription requests updated!", "success");
                }
            } else {
                showNotification(res?.message || "Could not retrieve prescription requests.", "error");
            }
        } catch (err) {
            console.error("Error loading prescription orders:", err);
            showNotification(err?.response?.data?.message || err?.message || "Failed to load prescription ledger.", "error");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [currentPage, showNotification]);

    useEffect(() => {
        fetchPrescriptionRequests();
    }, [fetchPrescriptionRequests]);

    // Send strictly the MongoDB _id (24-character hex string) to the detail page
    const goToDetail = (mongoId) => {
        if (!mongoId) return;
        router.push(`/otherscreens/orders/rxorderdetail/${mongoId}`);
    };

    // Calculate total bill amount across all potential API structures
    const computeBillAmount = (req) => {
        if (req.verifiedBill?.totalAmount !== undefined && req.verifiedBill.totalAmount !== null) {
            return Number(req.verifiedBill.totalAmount);
        }
        if (req.verifiedBill?.itemTotal !== undefined && req.verifiedBill.itemTotal !== null) {
            return Number(req.verifiedBill.itemTotal) + Number(req.verifiedBill.deliveryCharge || 0);
        }
        if (req.totalAmount !== undefined && req.totalAmount !== null) {
            return Number(req.totalAmount);
        }
        if (Array.isArray(req.items) && req.items.length > 0) {
            return req.items.reduce((acc, it) => acc + (Number(it.price || it.mrp || 0) * Number(it.quantity || 1)), 0);
        }
        return null;
    };

    // --- Status Badge Helper ---
    const renderRxStatusBadge = (req) => {
        const statusUpper = (req.status || '').toUpperCase().trim();
        const deliveryUpper = (req.deliveryStatus || '').toUpperCase().trim();
        const isConverted = Boolean(req.bookingId || req.bookingOrderId);

        // 1. Delivered
        if (statusUpper === 'DELIVERED' || deliveryUpper === 'DELIVERED') {
            return (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-300">
                    <CheckCircle2 size={11} className="text-emerald-600" /> Delivered
                </span>
            );
        }

        // 2. In Transit / Shipped / Out for Delivery
        if (
            statusUpper === 'SHIPPED' || 
            deliveryUpper === 'OUTFORDELIVERY' || 
            deliveryUpper === 'PICKEDUP' || 
            deliveryUpper === 'REACHEDLOCATION'
        ) {
            return (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-indigo-800 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 animate-pulse">
                    <Truck size={11} className="text-[#3d3f96]" /> Out For Delivery
                </span>
            );
        }

        // 3. Packed
        if (statusUpper === 'PACKED') {
            return (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                    <PackageCheck size={11} className="text-teal-600" /> Packed by Pharmacy
                </span>
            );
        }

        // 4. Placed / Confirmed / Converted Booking
        if (
            isConverted || 
            statusUpper === 'PLACED' || 
            statusUpper === 'CONFIRMED' || 
            statusUpper === 'PAID'
        ) {
            return (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    <CheckCircle2 size={11} className="text-emerald-500" /> Order Placed
                </span>
            );
        }

        // 5. Quote Ready / Bill Generated (Awaiting Payment)
        if (
            statusUpper === 'BILL GENERATED' || 
            statusUpper === 'PENDING PAYMENT' || 
            statusUpper === 'ACCEPTED'
        ) {
            return (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-300 animate-pulse">
                    <Sparkles size={11} className="text-amber-600" /> Quote Ready • Pay Now
                </span>
            );
        }

        // 6. Declined / Cancelled
        if (statusUpper === 'CANCELLED' || statusUpper === 'REJECTED') {
            return (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                    <AlertCircle size={11} className="text-rose-500" /> Declined / Cancelled
                </span>
            );
        }

        // 7. Active Chemist Review
        if (statusUpper === 'REVIEWING') {
            return (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                    <RefreshCw size={11} className="text-indigo-500 animate-spin" /> Reviewing Stock
                </span>
            );
        }

        // 8. Default: Pending Review
        return (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                <Clock size={11} className="text-amber-500" /> Awaiting Chemist Review
            </span>
        );
    };

    return (
        <div className="max-w-[1200px] mx-auto py-6 px-4 sm:px-6 space-y-6 text-left select-none antialiased">

            {/* --- TOP HEADER --- */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/otherscreens/orders')}
                        className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition shadow-xs cursor-pointer"
                        title="Back to All Orders"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                Uploaded Prescriptions &amp; Quotes
                            </h1>
                            <span className="text-[10px] font-black uppercase text-[#3d3f96] bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-lg">
                                Rx Verification
                            </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-400 mt-0.5">
                            Track doctor prescription reviews, certified chemist quotations, and live deliveries.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchPrescriptionRequests(true)}
                        disabled={refreshing}
                        className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-xs transition cursor-pointer disabled:opacity-50"
                    >
                        <RefreshCw size={13} className={refreshing ? "animate-spin text-[#3d3f96]" : ""} />
                        <span>Refresh Quotes</span>
                    </button>
                </div>
            </div>

            {/* --- CONTENT WORKSPACE --- */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-28 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-3">
                    <Loader2 className="animate-spin text-[#3d3f96]" size={32} />
                    <p className="text-xs font-black text-slate-700 uppercase tracking-widest">
                        Checking Prescription Invoices...
                    </p>
                </div>
            ) : requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 text-center bg-white rounded-3xl border border-slate-100 shadow-sm border-dashed space-y-3">
                    <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-[#3d3f96] flex items-center justify-center mx-auto">
                        <FileText size={28} />
                    </div>
                    <h3 className="text-base font-extrabold text-slate-800">No Prescription Quotes Found</h3>
                    <p className="text-xs text-slate-400 max-w-sm font-medium">
                        You have not submitted any handwritten prescriptions for pharmacy quotes yet.
                    </p>
                    <button
                        onClick={() => router.push('/pharmacy')}
                        className="mt-2 bg-[#3d3f96] text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider shadow-md hover:bg-[#2d2f75] transition cursor-pointer"
                    >
                        Upload Prescription Now
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map((req) => {
                        const pharmacy = req.pharmacyId || {};
                        const pharmacyImg = getMediaUrl(pharmacy.profileImage);
                        const statusUpper = (req.status || '').toUpperCase().trim();
                        
                        // Strict Mongo document ID required by details endpoint
                        const mongoId = req._id;

                        // Check converted/confirmed active booking
                        const isConverted = Boolean(req.bookingId || req.bookingOrderId);
                        const isPlaced = isConverted || ['PLACED', 'PACKED', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'PAID', 'CONFIRMED'].includes(statusUpper);
                        
                        // Check quote ready / bill generated
                        const isQuoteReady = !isPlaced && ['BILL GENERATED', 'PENDING PAYMENT', 'ACCEPTED'].includes(statusUpper);
                        const isDeclined = ['REJECTED', 'CANCELLED'].includes(statusUpper);

                        const billTotal = computeBillAmount(req);

                        return (
                            <div
                                key={mongoId || req.requestId}
                                onClick={() => goToDetail(mongoId)}
                                className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative overflow-hidden cursor-pointer group"
                            >
                                {/* Left accent indicator strip */}
                                <div
                                    className={`absolute top-0 bottom-0 left-0 w-1.5 ${
                                        isPlaced
                                            ? 'bg-emerald-500'
                                            : isQuoteReady
                                            ? 'bg-amber-500 animate-pulse'
                                            : isDeclined
                                            ? 'bg-rose-500'
                                            : 'bg-slate-300'
                                    }`}
                                />

                                {/* 1. Request Details & Pharmacy Profile */}
                                <div className="flex items-center gap-4 min-w-0 flex-1 pl-2">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0">
                                        <img
                                            src={pharmacyImg}
                                            alt={pharmacy.name || "Store"}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                            onError={(e) => { e.target.src = PLACEHOLDER_STORE; }}
                                        />
                                    </div>
                                    <div className="space-y-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs font-black uppercase font-mono text-slate-900 group-hover:text-[#3d3f96] transition-colors">
                                                #{req.requestId || mongoId}
                                            </span>
                                            {req.bookingOrderId && (
                                                <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                                    Order #{req.bookingOrderId}
                                                </span>
                                            )}
                                            <span className="text-slate-300">•</span>
                                            <span className="text-[10px] font-bold text-slate-400">
                                                {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : (req.prescriptionDate ? new Date(req.prescriptionDate).toLocaleDateString() : '')}
                                            </span>
                                            <span className="text-slate-300">•</span>
                                            <span className="text-[9px] font-bold uppercase text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                                {req.durationType || "Full Course"}
                                            </span>
                                        </div>

                                        <h4 className="text-sm sm:text-base font-black text-slate-900 truncate">
                                            {pharmacy.name || "Licensed Partner Chemist"}
                                        </h4>

                                        <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold flex-wrap">
                                            <span>Doctor: <strong>{req.doctorName || "Prescription Note"}</strong></span>
                                            {pharmacy.city && (
                                                <>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-0.5"><MapPin size={11} /> {pharmacy.city}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Middle: Status & Quotation Ledger */}
                                <div className="flex items-center justify-between lg:justify-center gap-6 border-t lg:border-t-0 lg:border-x border-slate-100 pt-3 lg:pt-0 lg:px-8 shrink-0">
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black uppercase text-slate-400 block">
                                            Current Status
                                        </span>
                                        <div>{renderRxStatusBadge(req)}</div>
                                    </div>

                                    {billTotal !== null ? (
                                        <div className="space-y-0.5 text-right lg:text-left">
                                            <span className="text-[9px] font-black uppercase text-slate-400 block">
                                                Quoted Bill Total
                                            </span>
                                            <span className="font-mono font-black text-lg text-emerald-600">
                                                ₹{billTotal}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="space-y-0.5 text-right lg:text-left">
                                            <span className="text-[9px] font-black uppercase text-slate-400 block">
                                                Quotation Ledger
                                            </span>
                                            <span className="text-xs font-bold text-slate-400 italic">
                                                Awaiting Quote
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* 3. Right: Action Trigger Buttons */}
                                <div className="flex items-center justify-between lg:justify-end gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                                    {isPlaced ? (
                                        <div className="flex items-center gap-2">
                                            {req.deliveryOTP && (
                                                <div 
                                                    className="bg-emerald-50 border border-emerald-200 px-2.5 py-2 rounded-2xl flex items-center gap-1.5"
                                                    title="Doorstep Delivery OTP"
                                                >
                                                    <Key size={13} className="text-emerald-600" />
                                                    <span className="font-mono text-xs font-black text-emerald-800">
                                                        {req.deliveryOTP}
                                                    </span>
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    goToDetail(mongoId);
                                                }}
                                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                                            >
                                                <Receipt size={14} />
                                                <span>Track Order</span>
                                                <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    ) : isQuoteReady ? (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                goToDetail(mongoId);
                                            }}
                                            className="px-5 py-2.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-sm transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                                        >
                                            <CreditCard size={14} />
                                            <span>Review &amp; Pay</span>
                                            <ChevronRight size={14} />
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                goToDetail(mongoId);
                                            }}
                                            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-2xl transition flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <Lock size={13} className="text-amber-500" />
                                            <span>View Details</span>
                                            <ChevronRight size={14} />
                                        </button>
                                    )}
                                </div>

                            </div>
                        );
                    })}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4 px-2">
                            <span className="text-xs font-bold text-slate-400">
                                Page <strong className="text-slate-800">{currentPage}</strong> of {totalPages}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                                >
                                    <ChevronLeft size={14} /> Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                                >
                                    Next <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}