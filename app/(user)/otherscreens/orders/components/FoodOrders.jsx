"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Loader2,
    AlertCircle,
    Calendar,
    Store,
    CheckCircle2,
    ShieldCheck,
    Inbox,
    ChevronRight,
    ArrowRight,
    ReceiptText,
    Bike
} from 'lucide-react';

// Import your API service functions & Notification Context
import UserAPI from '../../../../services/UserAPI';
import { useNotification } from '../../../../context/NotificationContext';

// --- BASE MEDIA HELPER ---
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";

const getMediaUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    return `${BASE_SERVER_URL}/${cleanPath}`;
};

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=150";

export default function FoodOrders() {
    const router = useRouter();
    const { showNotification } = useNotification();

    // --- Data & Loading States ---
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- Fetch User's Food Orders List ---
    const fetchUserOrders = async () => {
        setLoading(true);
        try {
            const response = await UserAPI.getUserOrdersList();
            if (response && response.success) {
                setOrders(response.data || []);
            }
        } catch (err) {
            console.error("Error retrieving user orders:", err);
            if (showNotification) {
                showNotification("Failed to load food order history.", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserOrders();
    }, []);

    // --- Helper: Render Colored Status Badges ---
    const renderStatusBadge = (status) => {
        const uppercaseStatus = status?.toUpperCase() || 'NEW';

        if (uppercaseStatus === 'DELIVERED') {
            return (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/70 shadow-xs">
                    <CheckCircle2 size={12} className="text-emerald-500" /> Delivered
                </span>
            );
        }
        if (uppercaseStatus === 'CANCELLED') {
            return (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200/70 shadow-xs">
                    <AlertCircle size={12} className="text-rose-500" /> Cancelled
                </span>
            );
        }
        if (uppercaseStatus === 'OUT_FOR_DELIVERY' || uppercaseStatus === 'ON_THE_WAY') {
            return (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/70 shadow-xs animate-pulse">
                    <Bike size={12} className="text-amber-600" /> On The Way
                </span>
            );
        }
        // Active / Preparing / New States
        return (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#3d3f96] bg-indigo-50/80 px-3 py-1 rounded-full border border-indigo-200/60 shadow-xs">
                <Loader2 size={12} className="animate-spin text-[#3d3f96]" /> {status || 'Processing'}
            </span>
        );
    };

    return (
        <div className="space-y-6 text-left select-none max-w-[1200px] mx-auto py-2">
            {/* Dynamic Orders List (1 Per Row) */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-28 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                        <Loader2 className="animate-spin text-[#3d3f96]" size={28} />
                    </div>
                    <p className="text-xs font-black text-slate-700 uppercase tracking-widest">Scanning clinical kitchen ledgers...</p>
                    <p className="text-[11px] font-semibold text-slate-400 mt-1">Retrieving order logs and dispatch coordinates</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 sm:p-20 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm border-dashed">
                    <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 mb-4 shadow-inner">
                        <Inbox className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-extrabold text-slate-800">No Food Orders Dispatched Yet</h3>
                    <p className="text-xs text-slate-400 mt-1.5 max-w-sm font-medium leading-relaxed">
                        You haven&apos;t placed any therapeutic meals or combo tiffin subscriptions yet. Build your first clinical basket to get started!
                    </p>
                    <button
                        onClick={() => router.push('/food/allfooditems')}
                        className="mt-6 inline-flex items-center gap-2 bg-[#3d3f96] hover:bg-[#2e3075] text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-indigo-950/10 cursor-pointer"
                    >
                        <span>Explore Dietitian Menu</span>
                        <ArrowRight size={14} />
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => {
                        const kitchen = order.foodId || {};
                        const kitchenImg = getMediaUrl(kitchen.profileImage) || PLACEHOLDER_IMAGE;
                        const dateFormatted = new Date(order.createdAt).toLocaleDateString("en-US", {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        });
                        const isDelivered = order.status?.toUpperCase() === 'DELIVERED';
                        const isCancelled = order.status?.toUpperCase() === 'CANCELLED';

                        return (
                            <div
                                key={order._id}
                                className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 flex flex-col lg:flex-row lg:items-center justify-between gap-5 group text-left relative overflow-hidden"
                            >
                                {/* Left indicator bar */}
                                <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${isDelivered ? 'bg-emerald-500' : isCancelled ? 'bg-rose-500' : 'bg-[#3d3f96]'}`} />

                                {/* 1. Main Kitchen & ID Details */}
                                <div className="flex items-center gap-4 min-w-0 flex-1 pl-2">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/80 overflow-hidden shrink-0 shadow-xs">
                                        <img
                                            src={kitchenImg}
                                            alt={kitchen.name || "Kitchen"}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                                        />
                                    </div>
                                    <div className="space-y-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-[10px] font-black uppercase text-slate-400 font-mono tracking-wide">
                                                #{order.bookingId}
                                            </span>
                                            <span className="text-slate-300">•</span>
                                            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                                                <Calendar size={12} /> {dateFormatted}
                                            </span>
                                        </div>
                                        <h4 className="text-sm sm:text-base font-black text-slate-900 tracking-tight truncate group-hover:text-[#3d3f96] transition-colors">
                                            {kitchen.name || "Healthy Partner Cloud Kitchen"}
                                        </h4>
                                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                            <Store size={11} className="text-slate-400" /> {kitchen.city || "Mohali"} Cloud Hub
                                        </span>
                                    </div>
                                </div>

                                {/* 2. Middle: Status & Bill Details */}
                                <div className="flex items-center justify-between lg:justify-center gap-6 border-t lg:border-t-0 lg:border-x border-slate-100 pt-3 lg:pt-0 lg:px-8 shrink-0">
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black uppercase text-slate-400 block leading-none">Order Status</span>
                                        <div>{renderStatusBadge(order.status)}</div>
                                    </div>

                                    <div className="space-y-0.5 text-right lg:text-left">
                                        <span className="text-[9px] font-black uppercase text-slate-400 block leading-none">Total Paid</span>
                                        <span className="font-mono font-black text-lg text-slate-900">
                                            ₹{order.billSummary?.totalAmount || 0}
                                        </span>
                                    </div>
                                </div>

                                {/* 3. Right: Security PIN & Navigation Action */}
                                <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                                    {order.deliveryOTP && !isDelivered && !isCancelled ? (
                                        <div className="flex flex-col text-left">
                                            <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">Delivery PIN</span>
                                            <span className="text-[11px] font-black uppercase text-red-600 bg-red-50/60 px-3 py-1 rounded-xl border border-red-200/60 font-mono tracking-widest shadow-xs">
                                                {order.deliveryOTP}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-bold hidden sm:inline-flex">
                                            <ShieldCheck size={14} className="text-emerald-500" /> {isDelivered ? 'Fulfilled' : 'Secured'}
                                        </span>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => router.push(`/otherscreens/orders/foodorderdetail/${order._id}`)}
                                        className="bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-[10px] font-black uppercase tracking-wider px-5 py-3 rounded-2xl shadow-md shadow-indigo-950/10 transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <ReceiptText size={13} />
                                        <span>Track & Invoice</span>
                                        <ChevronRight size={13} />
                                    </button>
                                </div>

                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}