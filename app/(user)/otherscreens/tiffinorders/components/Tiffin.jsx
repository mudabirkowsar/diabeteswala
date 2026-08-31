"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Utensils,
    Calendar,
    ChevronRight,
    Clock,
    Layers,
    ReceiptText,
    Loader2,
    AlertCircle,
    ArrowLeft,
    Sparkles,
    CheckCircle2,
    RefreshCw
} from 'lucide-react';

// Import your API service and Notification context
import UserAPI from '../../../../services/UserAPI'; // Adjust path if needed
import { useNotification } from '../../../../context/NotificationContext'; // Adjust path if needed

export default function Tiffin() {
    const router = useRouter();
    const { showNotification } = useNotification?.() || {};

    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch user tiffin subscriptions
    const fetchSubscriptions = async (isManualRefresh = false) => {
        if (isManualRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const response = await UserAPI.getUserTiffinSubscriptions();
            if (response && response.success && Array.isArray(response.data)) {
                setSubscriptions(response.data);
            } else {
                setSubscriptions([]);
            }
        } catch (error) {
            console.error("Error fetching tiffin subscriptions:", error);
            if (showNotification) {
                showNotification("Failed to load your tiffin subscriptions.", "error");
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    // Format Date helper (e.g. "2026-09-01" -> "Sep 1, 2026")
    const formatDate = (dateString) => {
        if (!dateString) return "—";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric"
            });
        } catch (e) {
            return dateString;
        }
    };

    // Dynamic Status Badge
    const renderStatusBadge = (status = "") => {
        const lower = status.toLowerCase();

        if (lower === "active" || lower === "new") {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {status}
                </span>
            );
        }
        if (lower === "pending") {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    {status}
                </span>
            );
        }
        if (lower === "cancelled") {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    {status}
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                {status || "Completed"}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center select-none">
                <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Loading your tiffin subscriptions...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-10 max-w-[960px] mx-auto space-y-6 antialiased select-none text-left">

            {/* Header Block */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-indigo-50 border border-indigo-100 text-[#3d3f96]">
                            <Utensils size={12} />
                            My Meal Plans
                        </span>
                        <span className="text-xs font-bold text-slate-400">
                            • {subscriptions.length} Subscription{subscriptions.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        Tiffin Subscriptions
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">
                        Manage your active meal schedules, timings, and delivery orders
                    </p>
                </div>

                {/* Refresh Button */}
                <button
                    onClick={() => fetchSubscriptions(true)}
                    disabled={refreshing}
                    className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-black text-slate-700 uppercase tracking-wider transition-all shadow-xs cursor-pointer disabled:opacity-60"
                >
                    <RefreshCw size={13} className={refreshing ? "animate-spin text-[#3d3f96]" : "text-slate-500"} />
                    <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
                </button>
            </div>

            {/* Empty State */}
            {subscriptions.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 sm:p-14 text-center space-y-4">
                    <div className="w-16 h-16 bg-indigo-50 text-[#3d3f96] rounded-2xl flex items-center justify-center mx-auto border border-indigo-100">
                        <Utensils size={28} />
                    </div>
                    <div className="space-y-1 max-w-sm mx-auto">
                        <h3 className="text-base font-black text-slate-800">No Active Tiffin Subscriptions</h3>
                        <p className="text-xs text-slate-400 font-medium">
                            You haven't subscribed to any meal plans yet. Explore our dietitian-crafted plans near you!
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/food/nearest')}
                        className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#3d3f96] hover:bg-[#2F3175] text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-indigo-950/10 cursor-pointer"
                    >
                        <span>Explore Tiffin Plans</span>
                        <ChevronRight size={14} />
                    </button>
                </div>
            ) : (
                /* Subscriptions List */
                <div className="space-y-4">
                    {subscriptions.map((sub) => {
                        return (
                            <div
                                key={sub._id}
                                onClick={() => router.push(`/otherscreens/tiffinorders/tiffin/${sub._id}`)}
                                className="bg-white rounded-[2rem] border border-slate-200/80 hover:border-[#3d3f96] shadow-sm hover:shadow-md transition-all p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 cursor-pointer group"
                            >
                                {/* Left: Plan Info & Dates */}
                                <div className="space-y-3 flex-1 min-w-0">
                                    {/* Top Line: Booking ID & Status */}
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <span className="font-mono text-xs font-black text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                                            {sub.bookingId}
                                        </span>
                                        {renderStatusBadge(sub.status)}
                                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-[#3d3f96] border border-indigo-100">
                                            {sub.billingCycle || "weekly"}
                                        </span>
                                    </div>

                                    {/* Plan Name */}
                                    <h3 className="text-lg font-black text-slate-900 group-hover:text-[#3d3f96] transition-colors truncate">
                                        {sub.planName}
                                    </h3>

                                    {/* Dates Duration */}
                                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={13} className="text-[#3d3f96]" />
                                            <span>
                                                {formatDate(sub.startDate)} – {formatDate(sub.endDate)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Price & CTA */}
                                <div className="flex items-center justify-between md:flex-col md:items-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                                    <div className="text-left md:text-right">
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                                            Total Paid
                                        </span>
                                        <span className="font-mono font-black text-lg sm:text-xl text-slate-900">
                                            ₹{sub.totalAmount}
                                        </span>
                                    </div>

                                    <div className="inline-flex items-center gap-1 text-xs font-black text-[#3d3f96] group-hover:translate-x-0.5 transition-transform">
                                        <span>View Schedule &amp; Details</span>
                                        <ChevronRight size={16} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

        </div>
    );
}