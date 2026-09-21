"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    HeartPulse,
    Calendar,
    ChevronRight,
    Sparkles,
    RefreshCw,
    Loader2,
    MapPin,
    Store,
    Clock,
    Tag,
    CheckCircle2,
    UtensilsCrossed
} from 'lucide-react';

// Import your API service and Notification context
import UserAPI from '../../../../services/UserAPI'; // Adjust path if needed
import { useNotification } from '../../../../context/NotificationContext'; // Adjust path if needed

export default function HealthPlans() {
    const router = useRouter();
    const { showNotification } = useNotification?.() || {};

    const [healthPlans, setHealthPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch user health plan orders
    const fetchHealthPlans = async (isManualRefresh = false) => {
        if (isManualRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const response = await UserAPI.getMyFoodHealthPlans();
            if (response && response.success && Array.isArray(response.data)) {
                setHealthPlans(response.data);
            } else {
                setHealthPlans([]);
            }
        } catch (error) {
            console.error("Error fetching health plans:", error);
            if (showNotification) {
                showNotification("Failed to load your health plan subscriptions.", "error");
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchHealthPlans();
    }, []);

    // Format Date helper (e.g. "2026-09-30" -> "Sep 30, 2026")
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

    // Payment Status Badge
    const renderPaymentBadge = (paymentStatus = "") => {
        const isPaid = paymentStatus.toLowerCase() === "paid";
        return (
            <span
                className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                    isPaid
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
            >
                <CheckCircle2 size={10} />
                {paymentStatus || "Unpaid"}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center select-none">
                <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Loading your diet & health plans...
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
                            <HeartPulse size={12} />
                            Dietitian Health Plans
                        </span>
                        <span className="text-xs font-bold text-slate-400">
                            • {healthPlans.length} Program{healthPlans.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        Health & Diet Subscriptions
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">
                        Track your dietitian-curated health schedules, meals, partner kitchens, and ongoing diets
                    </p>
                </div>

                {/* Refresh Button */}
                <button
                    onClick={() => fetchHealthPlans(true)}
                    disabled={refreshing}
                    className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-black text-slate-700 uppercase tracking-wider transition-all shadow-xs cursor-pointer disabled:opacity-60"
                >
                    <RefreshCw size={13} className={refreshing ? "animate-spin text-[#3d3f96]" : "text-slate-500"} />
                    <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
                </button>
            </div>

            {/* Empty State */}
            {healthPlans.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 sm:p-14 text-center space-y-4">
                    <div className="w-16 h-16 bg-indigo-50 text-[#3d3f96] rounded-2xl flex items-center justify-center mx-auto border border-indigo-100">
                        <HeartPulse size={28} />
                    </div>
                    <div className="space-y-1 max-w-sm mx-auto">
                        <h3 className="text-base font-black text-slate-800">No Health Plans Found</h3>
                        <p className="text-xs text-slate-400 font-medium">
                            You haven't subscribed to any dietitian diet plans yet. Choose a curated schedule to start!
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/food/programs')}
                        className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#3d3f96] hover:bg-[#2F3175] text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-indigo-950/10 cursor-pointer"
                    >
                        <span>Explore Health Plans</span>
                        <ChevronRight size={14} />
                    </button>
                </div>
            ) : (
                /* Health Plans List */
                <div className="space-y-4">
                    {healthPlans.map((plan) => {
                        const targetId = plan._id;

                        return (
                            <div
                                key={plan._id}
                                onClick={() => router.push(`/otherscreens/tiffinorders/healthplan/${targetId}`)}
                                className="bg-white rounded-[2rem] border border-slate-200/80 hover:border-[#3d3f96] shadow-sm hover:shadow-md transition-all p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 cursor-pointer group"
                            >
                                {/* Left: Booking Info & Kitchen */}
                                <div className="space-y-3 flex-1 min-w-0">
                                    {/* Top Line: Booking ID, Status, Category & Days */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-mono text-xs font-black text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                                            {plan.bookingId}
                                        </span>
                                        {renderStatusBadge(plan.status)}
                                        {plan.paymentStatus && renderPaymentBadge(plan.paymentStatus)}
                                        {plan.subCategory && (
                                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                                                {plan.subCategory}
                                            </span>
                                        )}
                                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-[#3d3f96] border border-indigo-100">
                                            {plan.daysCount} Days Schedule
                                        </span>
                                    </div>

                                    {/* Plan Title */}
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-black text-slate-900 group-hover:text-[#3d3f96] transition-colors line-clamp-1">
                                            {plan.title}
                                        </h3>
                                        {plan.programType && (
                                            <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                                                <UtensilsCrossed size={12} className="text-[#3d3f96]" />
                                                <span>{plan.programType}</span>
                                                {plan.mainCategory && (
                                                    <span className="text-slate-400">
                                                        • ({plan.mainCategory}'s Diet)
                                                    </span>
                                                )}
                                            </p>
                                        )}
                                    </div>

                                    {/* Kitchen & Dates Details */}
                                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs font-medium text-slate-500 pt-1">
                                        {plan.kitchen?.name && (
                                            <div className="flex items-center gap-1.5">
                                                <Store size={13} className="text-[#3d3f96]" />
                                                <span className="font-bold text-slate-700">{plan.kitchen.name}</span>
                                                {plan.kitchen.city && (
                                                    <span className="text-slate-400">({plan.kitchen.city})</span>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={13} className="text-[#3d3f96]" />
                                            <span>
                                                {formatDate(plan.startDate)} – {formatDate(plan.endDate)}
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
                                            ₹{plan.totalAmount}
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