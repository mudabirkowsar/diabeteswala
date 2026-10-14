"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Activity,
    Package,
    MapPin,
    Phone,
    Mail,
    CheckCircle2,
    AlertCircle,
    ShieldCheck,
    Truck,
    ReceiptText,
    CreditCard,
    Tag,
    Clock,
    Loader2,
    Calendar,
    Sparkles,
    RefreshCw,
    Download,
    Droplets,
    Cpu,
    UserCheck,
    X,
    FileText,
    AlertTriangle,
    Boxes
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Import your API service function
import UserAPI from '../../../../../services/UserAPI'; // Adjust relative path based on your directory

// --- BASE MEDIA HELPER ---
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';
const PLACEHOLDER_DEVICE_IMAGE = "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=400";
const PLACEHOLDER_AVATAR = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200";

const getMediaUrl = (path) => {
    if (!path) return PLACEHOLDER_DEVICE_IMAGE;
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }
    const cleanBase = BACKEND_URL.replace(/\/+$/, '');
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
};

export default function CgmOrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params?.id;

    // --- State Management ---
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Cancel Modal States
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [cancelling, setCancelling] = useState(false);

    // --- Fetch Single Order Details ---
    const fetchOrderDetails = useCallback(async (isRefresh = false) => {
        if (!orderId) return;
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const response = await UserAPI.getCgmOrderDetailsById(orderId);
            if (response && response.success) {
                setOrder(response.data);
                if (isRefresh) toast.success("Order ledger updated!");
            } else {
                toast.error("Failed to load CGM order specifications.");
            }
        } catch (err) {
            console.error("Error fetching CGM order details:", err);
            toast.error(err?.response?.data?.message || "Failed to retrieve order details.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [orderId]);

    useEffect(() => {
        fetchOrderDetails();
    }, [fetchOrderDetails]);

    // --- Handle Cancel Order Request ---
    const handleCancelOrder = async () => {
        if (!order) return;
        setCancelling(true);
        try {
            const payload = {
                cancelReason: cancelReason.trim() || "Ordered by mistake, want to purchase different pack."
            };
            const response = await UserAPI.cancelCgmOrder(order._id || order.orderId, payload);
            if (response && response.success) {
                toast.success(response.message || "Order cancelled successfully!");
                setIsCancelModalOpen(false);
                fetchOrderDetails(true);
            } else {
                toast.error(response?.message || "Failed to cancel order.");
            }
        } catch (err) {
            console.error("Error cancelling order:", err);
            toast.error(err?.response?.data?.message || "Cancellation blocked or not permitted.");
        } finally {
            setCancelling(false);
        }
    };

    // --- Status Badge Helper ---
    const renderStatusBadge = (status) => {
        const uppercase = status?.toUpperCase() || 'PLACED';

        if (uppercase === 'DELIVERED') {
            return (
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-xs">
                    <CheckCircle2 size={13} className="text-emerald-600" /> Delivered
                </span>
            );
        }
        if (uppercase === 'CANCELLED') {
            return (
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-3.5 py-1.5 rounded-full border border-rose-200 shadow-xs">
                    <AlertCircle size={13} className="text-rose-600" /> Cancelled
                </span>
            );
        }
        if (uppercase === 'SHIPPED') {
            return (
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200 shadow-xs animate-pulse">
                    <Truck size={13} className="text-amber-600" /> Shipped / In Transit
                </span>
            );
        }
        if (uppercase === 'PACKED') {
            return (
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-3.5 py-1.5 rounded-full border border-purple-200 shadow-xs">
                    <Package size={13} className="text-purple-600" /> Packed
                </span>
            );
        }
        if (uppercase === 'CONFIRMED') {
            return (
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-3.5 py-1.5 rounded-full border border-teal-200 shadow-xs">
                    <CheckCircle2 size={13} className="text-teal-600" /> Confirmed
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#3d3f96] bg-indigo-50 px-3.5 py-1.5 rounded-full border border-indigo-200 shadow-xs">
                <Clock size={13} className="text-[#3d3f96]" /> {status || 'Placed'}
            </span>
        );
    };

    // --- Order Lifecycle Stepper ---
    const renderTimelineStepper = (status) => {
        const uppercase = status?.toUpperCase() || 'PLACED';
        if (uppercase === 'CANCELLED') {
            return (
                <div className="bg-rose-50/70 border border-rose-200 rounded-3xl p-5 flex items-center gap-3">
                    <AlertCircle className="text-rose-600 shrink-0" size={24} />
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-rose-800">
                            Order Voided / Cancelled
                        </h4>
                        <p className="text-xs font-medium text-rose-600 mt-0.5">
                            This device booking was cancelled. Any associated online transactions are initiated for automated refund.
                        </p>
                    </div>
                </div>
            );
        }

        const steps = [
            { label: 'Placed', icon: ReceiptText, completed: true },
            {
                label: 'Confirmed',
                icon: CheckCircle2,
                completed: ['CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED'].includes(uppercase)
            },
            {
                label: 'Packed',
                icon: Package,
                completed: ['PACKED', 'SHIPPED', 'DELIVERED'].includes(uppercase)
            },
            {
                label: 'Shipped',
                icon: Truck,
                completed: ['SHIPPED', 'DELIVERED'].includes(uppercase)
            },
            {
                label: 'Delivered',
                icon: ShieldCheck,
                completed: uppercase === 'DELIVERED'
            }
        ];

        return (
            <div className="bg-gradient-to-r from-slate-50 to-indigo-50/40 p-5 sm:p-6 rounded-3xl border border-slate-100">
                <div className="flex items-center justify-between relative">
                    <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-[2px] bg-slate-200 z-0" />
                    {steps.map((step, idx) => {
                        const StepIcon = step.icon;
                        return (
                            <div key={idx} className="flex flex-col items-center gap-2 relative z-10">
                                <div
                                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${step.completed
                                            ? 'bg-[#3d3f96] text-white shadow-md shadow-indigo-950/20 ring-4 ring-white'
                                            : 'bg-white text-slate-300 border border-slate-200 ring-4 ring-white'
                                        }`}
                                >
                                    <StepIcon size={16} />
                                </div>
                                <span
                                    className={`text-[10px] font-black uppercase tracking-tight text-center ${step.completed ? 'text-slate-900' : 'text-slate-400'
                                        }`}
                                >
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-indigo-50 flex items-center justify-center shadow-xs">
                    <Loader2 className="animate-spin text-[#3d3f96]" size={32} />
                </div>
                <div className="text-center">
                    <p className="text-sm font-black text-slate-800 uppercase tracking-widest">
                        Retrieving CGM Order Ledger...
                    </p>
                    <p className="text-xs font-semibold text-slate-400 mt-1">
                        Fetching hardware specs, tracking timeline and clinical consultation data
                    </p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto space-y-4">
                <AlertCircle className="w-12 h-12 text-rose-500" />
                <h2 className="text-lg font-black text-slate-800">Order Record Not Found</h2>
                <p className="text-xs text-slate-400 font-medium">
                    We couldn&apos;t find specifications for this CGM order reference number.
                </p>
                <button
                    onClick={() => router.back()}
                    className="mt-2 inline-flex items-center gap-2 bg-[#3d3f96] text-white text-xs font-black uppercase px-6 py-3 rounded-2xl cursor-pointer hover:bg-[#2e3075] transition"
                >
                    <ArrowLeft size={14} /> Go Back to Orders
                </button>
            </div>
        );
    }

    const device = order.device || {};
    const deviceDetails = device.deviceId || {};
    const cgmConfig = deviceDetails.cgmConfig || {};
    const coach = order.coachConsultation || {};
    const coachId = coach.coachId || {};

    const isDelivered = order.status?.toUpperCase() === 'DELIVERED';
    const isCancelled = order.status?.toUpperCase() === 'CANCELLED';
    const canCancel = ['PLACED', 'CONFIRMED'].includes(order.status?.toUpperCase());

    const orderDateFormatted = new Date(order.createdAt || order.orderDate).toLocaleString("en-US", {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className="max-w-[1400px] mx-auto py-6 px-4 sm:px-6 space-y-6 text-left select-none antialiased">
            <Toaster position="top-right" />

            {/* --- TOP NAVIGATION BAR --- */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition shadow-xs cursor-pointer"
                        title="Back"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono">
                                #{order.orderId}
                            </h1>
                            <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg">
                                {device.productType || 'CGM'}
                            </span>
                        </div>
                        <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <Calendar size={13} /> Placed on {orderDateFormatted}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <button
                        onClick={() => fetchOrderDetails(true)}
                        disabled={refreshing}
                        className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-extrabold text-slate-700 flex items-center gap-1.5 shadow-xs transition cursor-pointer disabled:opacity-50"
                    >
                        <RefreshCw size={13} className={refreshing ? "animate-spin text-[#3d3f96]" : ""} />
                        <span>Refresh</span>
                    </button>

                    {canCancel && (
                        <button
                            onClick={() => setIsCancelModalOpen(true)}
                            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-2xl text-xs font-extrabold text-rose-700 flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                        >
                            <X size={13} />
                            <span>Cancel Order</span>
                        </button>
                    )}

                    <div>{renderStatusBadge(order.status)}</div>
                </div>
            </div>

            {/* --- MAIN GRID LAYOUT --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* === LEFT COLUMN: TRACKING, SPECS, ADD-ONS, COACH (2 COLS) === */}
                <div className="lg:col-span-2 space-y-6">

                    {/* 1. Dispatch Stepper */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <Sparkles size={14} className="text-[#3d3f96]" /> Dispatch & Milestone Tracker
                            </h3>
                            <span className="text-xs font-bold text-slate-500">
                                Payment: <strong className="text-slate-900">{order.paymentStatus || 'Paid'}</strong> ({order.paymentMethod || 'Online'})
                            </span>
                        </div>
                        {renderTimelineStepper(order.status)}
                    </div>

                    {/* 2. Handover OTP Verification (if not completed & not cancelled) */}
                    {order.deliveryOtp && !isDelivered && !isCancelled && (
                        <div className="bg-gradient-to-r from-red-50/70 to-rose-50/50 border border-red-200/70 p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-red-600 flex items-center gap-1.5">
                                    <ShieldCheck size={14} /> Handover Verification PIN
                                </span>
                                <p className="text-xs font-bold text-slate-600">
                                    Share this secret 4-digit PIN with the logistics partner upon doorstep arrival to unseal device package.
                                </p>
                            </div>
                            <div className="bg-white px-5 py-2.5 rounded-2xl border border-red-200 shadow-xs text-center shrink-0">
                                <span className="text-2xl font-black font-mono tracking-widest text-red-600">
                                    {order.deliveryOtp}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* 3. Primary Biosensor / Device Specifications */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <Cpu size={14} className="text-[#3d3f96]" /> Biosensor Device Specifications
                            </h3>
                            <span className="text-[11px] font-bold text-[#3d3f96] bg-indigo-50 px-2 py-0.5 rounded-md">
                                {device.brand || 'DiabetesWala'} • Model {device.deviceModel || 'Curv'}
                            </span>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-5 items-start">
                            <div className="w-24 h-24 rounded-2xl bg-slate-50 border border-slate-200/80 p-2 shrink-0 flex items-center justify-center">
                                <img
                                    src={getMediaUrl(device.mainImage)}
                                    alt={device.title || "Device"}
                                    className="w-full h-full object-contain"
                                    onError={(e) => { e.target.src = PLACEHOLDER_DEVICE_IMAGE; }}
                                />
                            </div>

                            <div className="space-y-2 flex-1 min-w-0">
                                <div className="space-y-1">
                                    <h4 className="text-base font-black text-slate-900 leading-snug">
                                        {device.title}
                                    </h4>
                                    <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 font-bold">
                                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[11px]">
                                            Variant: {device.selectedVariant?.variantName || "Standard"}
                                        </span>
                                        <span>•</span>
                                        <span>Quantity: {device.quantity || 1}</span>
                                        <span>•</span>
                                        <span className="font-mono text-slate-800">
                                            ₹{device.unitPrice} {device.unitMrp && <del className="text-slate-400 ml-1">₹{device.unitMrp}</del>}
                                        </span>
                                    </div>
                                </div>

                                {/* Clinical CGM Specifics Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                        <span className="text-[9px] font-black uppercase text-slate-400 block">Sensor Life</span>
                                        <span className="text-xs font-black text-slate-800">
                                            {cgmConfig.sensorLifeSpanDays ? `${cgmConfig.sensorLifeSpanDays} Days` : '14 Days'}
                                        </span>
                                    </div>
                                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                        <span className="text-[9px] font-black uppercase text-slate-400 block">Warmup Time</span>
                                        <span className="text-xs font-black text-slate-800">
                                            {cgmConfig.sensorWarmupTime || '60 mins'}
                                        </span>
                                    </div>
                                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                        <span className="text-[9px] font-black uppercase text-slate-400 block">Waterproofing</span>
                                        <span className="text-xs font-black text-slate-800 flex items-center gap-1">
                                            <Droplets size={12} className="text-sky-500" />
                                            {cgmConfig.waterResistance || 'IP28'}
                                        </span>
                                    </div>
                                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                        <span className="text-[9px] font-black uppercase text-slate-400 block">App Sync</span>
                                        <span className="text-xs font-black text-emerald-600">
                                            {cgmConfig.appSyncSupported ? 'Supported' : 'Manual'}
                                        </span>
                                    </div>
                                </div>

                                {/* PDF Manual Download Link */}
                                {deviceDetails.userManualPdf && (
                                    <div className="pt-2">
                                        <a
                                            href={getMediaUrl(deviceDetails.userManualPdf)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#3d3f96] hover:underline"
                                        >
                                            <Download size={13} />
                                            <span>Download User Guide & Application Manual (PDF)</span>
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Diabetes Profile Snippet */}
                        {order.diabetesProfile && (
                            <div className="bg-indigo-50/50 rounded-2xl p-3 border border-indigo-100/70 flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-600">
                                    Patient Profile: <strong className="text-slate-900">{order.diabetesProfile.diabetesType || 'General'} Diabetes</strong>
                                </span>
                                <span className="font-bold text-[#3d3f96]">
                                    {order.diabetesProfile.hasUsedBefore ? 'Experienced User' : 'First-time CGM User'}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* 4. Add-ons & Maintenance Kit */}
                    {order.addons && order.addons.length > 0 && (
                        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                    <Boxes size={14} className="text-[#3d3f96]" />
                                    Companion Accessories & Skin Prep ({order.addons.length})
                                </h3>
                                <span className="text-[11px] font-bold text-slate-400">Essential Protection</span>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {order.addons.map((addon, idx) => {
                                    const meta = addon.addonId || {};
                                    return (
                                        <div key={addon._id || idx} className="py-3.5 first:pt-1 last:pb-1 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200/80 overflow-hidden shrink-0 p-1">
                                                    <img
                                                        src={getMediaUrl(meta.imageUrl)}
                                                        alt={addon.name}
                                                        className="w-full h-full object-contain"
                                                        onError={(e) => { e.target.src = PLACEHOLDER_DEVICE_IMAGE; }}
                                                    />
                                                </div>
                                                <div className="space-y-0.5 min-w-0">
                                                    <h5 className="text-xs font-extrabold text-slate-900 truncate">
                                                        {addon.name}
                                                    </h5>
                                                    <p className="text-[10px] text-slate-400 truncate max-w-sm">
                                                        {meta.description || "Medical grade accessory"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="text-xs text-slate-400 font-bold">
                                                    {addon.quantity} × ₹{addon.price}
                                                </div>
                                                <div className="font-mono text-sm font-black text-slate-900 mt-0.5">
                                                    ₹{addon.totalPrice || (addon.price * addon.quantity)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* 5. Coach Consultation Specification (if included) */}
                    {coach.isIncluded && (
                        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                    <UserCheck size={14} className="text-emerald-600" />
                                    1-on-1 Diabetes Coach Consultation
                                </h3>
                                <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                                    Mode: {coach.consultationMode || 'Offline'}
                                </span>
                            </div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-13 h-13 rounded-2xl bg-slate-50 border border-slate-200/80 overflow-hidden shrink-0">
                                        <img
                                            src={getMediaUrl(coachId.profileImage || "")}
                                            alt={coach.coachName || "Coach"}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.src = PLACEHOLDER_AVATAR; }}
                                        />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h4 className="text-sm font-black text-slate-900">
                                            {coach.coachName || "Certified Diabetes Educator"}
                                        </h4>
                                        <p className="text-xs text-slate-400 font-bold">
                                            {coachId.qualification || "Clinical Nutritionist & CDE"}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right sm:border-l border-slate-100 sm:pl-6 w-full sm:w-auto">
                                    <span className="text-[10px] font-black uppercase text-slate-400 block">Scheduled Slot</span>
                                    <div className="text-xs font-black text-slate-900 mt-0.5">
                                        {coach.scheduledDate || 'To be scheduled'} • {coach.slotTime || 'N/A'}
                                    </div>
                                    {coach.isPremiumSlot && (
                                        <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md inline-block mt-1">
                                            Premium Slot Included
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Coach Contact Details */}
                            <div className="flex items-center gap-4 flex-wrap pt-2 border-t border-slate-100 text-xs text-slate-600 font-bold">
                                {coachId.phone && (
                                    <a href={`tel:${coachId.phone}`} className="flex items-center gap-1.5 hover:text-[#3d3f96]">
                                        <Phone size={12} /> {coachId.phone}
                                    </a>
                                )}
                                {coachId.email && (
                                    <a href={`mailto:${coachId.email}`} className="flex items-center gap-1.5 hover:text-[#3d3f96]">
                                        <Mail size={12} /> {coachId.email}
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 6. Tracking Timeline History Notes */}
                    {order.trackingTimeline && order.trackingTimeline.length > 0 && (
                        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <Clock size={14} className="text-[#3d3f96]" /> Dispatch Timeline Logs
                            </h3>
                            <div className="space-y-3">
                                {order.trackingTimeline.map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-3 text-xs">
                                        <div className="w-2 h-2 rounded-full bg-[#3d3f96] mt-1.5 shrink-0" />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <strong className="text-slate-900 font-black">{item.status}</strong>
                                                <span className="text-[10px] text-slate-400 font-bold">
                                                    {new Date(item.timestamp).toLocaleString("en-US", {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                            <p className="text-slate-500 font-medium mt-0.5">{item.note}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

                {/* === RIGHT COLUMN: BILL SUMMARY, ADDRESS, DETAILS (1 COL) === */}
                <div className="space-y-6">

                    {/* 1. Complete Bill Summary Card */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <ReceiptText size={14} className="text-emerald-500" />
                                Payment & Bill Ledger
                            </h3>
                            <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                {order.paymentMethod || 'Online'}
                            </span>
                        </div>

                        <div className="space-y-2.5 text-xs font-bold text-slate-600">
                            {/* Device Item Total */}
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Device Hardware Price</span>
                                <span className="font-mono text-slate-800">₹{order.billSummary?.itemTotal || 0}</span>
                            </div>

                            {/* Device MRP Savings */}
                            {order.billSummary?.deviceSavings > 0 && (
                                <div className="flex justify-between items-center text-emerald-600">
                                    <span>Special Device Discount</span>
                                    <span className="font-mono font-black">-₹{order.billSummary?.deviceSavings}</span>
                                </div>
                            )}

                            {/* Add-ons Total */}
                            {order.billSummary?.addonsTotal > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Add-ons & Skin Prep</span>
                                    <span className="font-mono text-slate-800">₹{order.billSummary?.addonsTotal}</span>
                                </div>
                            )}

                            {/* Coach Total & Details */}
                            {order.billSummary?.coachChargeTotal > 0 && (
                                <div className="space-y-1 pt-1 border-t border-dashed border-slate-100">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500">Coach Base Consultation</span>
                                        <span className="font-mono text-slate-800">₹{order.billSummary?.coachBaseFee || 0}</span>
                                    </div>
                                    {order.billSummary?.coachExtraDistanceCharge > 0 && (
                                        <div className="flex justify-between items-center text-slate-500">
                                            <span>Coach Doorstep Distance Fee</span>
                                            <span className="font-mono text-slate-800">₹{order.billSummary?.coachExtraDistanceCharge}</span>
                                        </div>
                                    )}
                                    {order.billSummary?.coachPremiumExtraFee > 0 && (
                                        <div className="flex justify-between items-center text-amber-700">
                                            <span>Premium Slot Surcharge</span>
                                            <span className="font-mono font-black">+₹{order.billSummary?.coachPremiumExtraFee}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Coupon Discount */}
                            {order.billSummary?.couponDiscount > 0 && (
                                <div className="flex justify-between items-center text-rose-600 pt-1.5 border-t border-dashed border-slate-200">
                                    <span className="flex items-center gap-1">
                                        <Tag size={12} /> Coupon Applied
                                    </span>
                                    <span className="font-mono font-black">-₹{order.billSummary?.couponDiscount}</span>
                                </div>
                            )}

                            {/* Final Total Amount */}
                            <div className="flex justify-between items-center text-slate-900 border-t border-slate-200 pt-3.5 text-sm font-black">
                                <div>
                                    <span className="block leading-none">Grand Total</span>
                                    <span className="text-[10px] text-slate-400 font-bold">Inclusive of all medical taxes</span>
                                </div>
                                <span className="font-mono text-xl font-black text-[#3d3f96]">
                                    ₹{order.billSummary?.totalPayable || order.totalAmount || 0}
                                </span>
                            </div>
                        </div>

                        {/* Transaction ID */}
                        {order.transactionId && (
                            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                                <span className="flex items-center gap-1.5">
                                    <CreditCard size={13} className="text-[#3d3f96]" /> Payment Txn Ref
                                </span>
                                <span className="font-mono text-slate-700 uppercase">
                                    {order.transactionId}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* 2. Delivery Address Card */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-3.5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <MapPin size={14} className="text-[#3d3f96]" /> Delivery Destination
                            </h3>
                            <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                                {order.deliveryAddress?.addressType || "Home"}
                            </span>
                        </div>

                        <div className="space-y-1 text-xs">
                            <strong className="text-slate-900 font-extrabold block text-sm">
                                {order.deliveryAddress?.name || order.userId?.name || "Customer"}
                            </strong>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                {[
                                    order.deliveryAddress?.houseNo,
                                    order.deliveryAddress?.sector,
                                    order.deliveryAddress?.landmark,
                                    order.deliveryAddress?.city,
                                    order.deliveryAddress?.state,
                                    order.deliveryAddress?.pincode
                                ].filter(Boolean).join(", ")}
                            </p>
                            {order.deliveryAddress?.phone && (
                                <p className="text-slate-400 font-bold pt-1 flex items-center gap-1">
                                    <Phone size={11} /> +91 {order.deliveryAddress.phone}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 3. Hardware Warranty & Support Card */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-3.5">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <ShieldCheck size={14} className="text-emerald-600" /> Device Protection & Care
                        </h3>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            Every continuous glucose monitor is tested against standard medical calibrations. For pairing issues or early detachment, reach out to clinical support.
                        </p>
                        <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex items-center gap-2 text-xs font-bold text-slate-600">
                            <Activity size={14} className="text-[#3d3f96] shrink-0" />
                            <span>100% Certified Biomedical Biosensor</span>
                        </div>
                    </div>

                </div>

            </div>

            {/* --- CANCELLATION MODAL DIALOG --- */}
            {isCancelModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-100 relative">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                                    <AlertTriangle size={16} />
                                </div>
                                <h3 className="text-base font-black text-slate-900">Cancel CGM Order</h3>
                            </div>
                            <button
                                onClick={() => setIsCancelModalOpen(false)}
                                className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            Are you sure you want to cancel order <strong className="text-slate-800">#{order.orderId}</strong>? If paid online, the amount will be automatically refunded through Razorpay.
                        </p>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black uppercase text-slate-500">
                                Reason for Cancellation (Optional)
                            </label>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="e.g. Ordered by mistake, want to purchase different pack."
                                rows={3}
                                className="w-full text-xs font-medium text-slate-800 border border-slate-200 rounded-2xl p-3 focus:outline-none focus:border-[#3d3f96]"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                onClick={() => setIsCancelModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                            >
                                Nevermind
                            </button>
                            <button
                                onClick={handleCancelOrder}
                                disabled={cancelling}
                                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                                {cancelling ? (
                                    <>
                                        <Loader2 size={13} className="animate-spin" />
                                        <span>Cancelling...</span>
                                    </>
                                ) : (
                                    <span>Confirm Cancellation</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}