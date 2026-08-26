"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Utensils,
    Package,
    MapPin,
    Store,
    Phone,
    CheckCircle2,
    AlertCircle,
    ShieldCheck,
    Truck,
    ReceiptText,
    ChefHat,
    Bike,
    ShoppingBag,
    PackageCheck,
    CreditCard,
    Tag,
    Clock,
    Loader2,
    Calendar,
    Sparkles,
    RefreshCw,
    ExternalLink
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Import your API service function
import UserAPI from '../../../../../services/UserAPI'; // Adjust path based on your folder structure

// --- BASE MEDIA HELPER ---
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300";

const getMediaUrl = (path) => {
    if (!path) return PLACEHOLDER_IMAGE;
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }
    const cleanBase = BACKEND_URL.replace(/\/+$/, '');
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
};

export default function FoodOrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params?.id;

    // --- State Management ---
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // --- Fetch Single Order Details ---
    const fetchOrderDetails = useCallback(async (isRefresh = false) => {
        if (!orderId) return;
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const response = await UserAPI.getSingleOrderDetails(orderId);
            if (response && response.success) {
                setOrder(response.data);
                if (isRefresh) toast.success("Order ledger updated!");
            } else {
                toast.error("Failed to load order specifications.");
            }
        } catch (err) {
            console.error("Error fetching order details:", err);
            toast.error(err?.response?.data?.message || "Failed to retrieve order details.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [orderId]);

    useEffect(() => {
        fetchOrderDetails();
    }, [fetchOrderDetails]);

    // --- Render Status Badge ---
    const renderStatusBadge = (status) => {
        const uppercaseStatus = status?.toUpperCase() || 'NEW';

        if (uppercaseStatus === 'DELIVERED') {
            return (
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-xs">
                    <CheckCircle2 size={13} className="text-emerald-600" /> Delivered
                </span>
            );
        }
        if (uppercaseStatus === 'CANCELLED') {
            return (
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-3.5 py-1.5 rounded-full border border-rose-200 shadow-xs">
                    <AlertCircle size={13} className="text-rose-600" /> Cancelled
                </span>
            );
        }
        if (uppercaseStatus === 'OUT_FOR_DELIVERY' || uppercaseStatus === 'ON_THE_WAY') {
            return (
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200 shadow-xs animate-pulse">
                    <Bike size={13} className="text-amber-600" /> Out For Delivery
                </span>
            );
        }
        if (uppercaseStatus === 'PREPARING') {
            return (
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3.5 py-1.5 rounded-full border border-indigo-200 shadow-xs">
                    <ChefHat size={13} className="text-[#3d3f96]" /> Preparing Food
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#3d3f96] bg-indigo-50 px-3.5 py-1.5 rounded-full border border-indigo-200 shadow-xs">
                <Loader2 size={13} className="animate-spin text-[#3d3f96]" /> {status || 'Order Received'}
            </span>
        );
    };

    // --- Order Lifecycle Stepper ---
    const renderTimeline = (status) => {
        const uppercaseStatus = status?.toUpperCase();
        if (uppercaseStatus === 'CANCELLED') return null;

        const steps = [
            { label: 'Placed', icon: ShoppingBag, completed: true },
            { label: 'Preparing', icon: ChefHat, completed: uppercaseStatus !== 'NEW' && uppercaseStatus !== 'PENDING' },
            { label: 'Out for Delivery', icon: Bike, completed: uppercaseStatus === 'OUT_FOR_DELIVERY' || uppercaseStatus === 'DELIVERED' },
            { label: 'Delivered', icon: PackageCheck, completed: uppercaseStatus === 'DELIVERED' }
        ];

        return (
            <div className="bg-gradient-to-r from-slate-50 to-indigo-50/40 p-5 sm:p-6 rounded-3xl border border-slate-100">
                <div className="flex items-center justify-between relative">
                    <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-[2px] bg-slate-200 z-0" />
                    {steps.map((step, idx) => {
                        const StepIcon = step.icon;
                        return (
                            <div key={idx} className="flex flex-col items-center gap-2 relative z-10">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                                    step.completed
                                        ? 'bg-[#3d3f96] text-white shadow-md shadow-indigo-950/20 ring-4 ring-white'
                                        : 'bg-white text-slate-300 border border-slate-200 ring-4 ring-white'
                                }`}>
                                    <StepIcon size={16} />
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-tight text-center ${
                                    step.completed ? 'text-slate-900' : 'text-slate-400'
                                }`}>
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
                    <p className="text-sm font-black text-slate-800 uppercase tracking-widest">Retrieving Order Ledger...</p>
                    <p className="text-xs font-semibold text-slate-400 mt-1">Fetching live tracking and kitchen dispatch coordinates</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto space-y-4">
                <AlertCircle className="w-12 h-12 text-rose-500" />
                <h2 className="text-lg font-black text-slate-800">Order Record Not Found</h2>
                <p className="text-xs text-slate-400 font-medium">We couldn&apos;t find specifications for this order reference number.</p>
                <button
                    onClick={() => router.back()}
                    className="mt-2 inline-flex items-center gap-2 bg-[#3d3f96] text-white text-xs font-black uppercase px-6 py-3 rounded-2xl cursor-pointer hover:bg-[#2e3075] transition"
                >
                    <ArrowLeft size={14} /> Go Back to Orders
                </button>
            </div>
        );
    }

    const kitchen = order.foodId || {};
    const kitchenImg = getMediaUrl(kitchen.profileImage);
    const dateFormatted = new Date(order.createdAt).toLocaleString("en-US", {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const isDelivered = order.status?.toUpperCase() === 'DELIVERED';
    const isCancelled = order.status?.toUpperCase() === 'CANCELLED';

    return (
        <div className="max-w-[1400px] mx-auto py-6 px-4 sm:px-6 space-y-6 text-left select-none antialiased">
            <Toaster position="top-right" />

            {/* --- TOP NAVIGATION BAR --- */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition shadow-xs cursor-pointer"
                        title="Back to Orders"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono">
                                #{order.bookingId}
                            </h1>
                            <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg">
                                {order.bookingType || 'Direct'}
                            </span>
                        </div>
                        <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <Calendar size={13} /> Placed on {dateFormatted}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchOrderDetails(true)}
                        disabled={refreshing}
                        className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-extrabold text-slate-700 flex items-center gap-1.5 shadow-xs transition cursor-pointer disabled:opacity-50"
                    >
                        <RefreshCw size={13} className={refreshing ? "animate-spin text-[#3d3f96]" : ""} />
                        <span>Refresh</span>
                    </button>
                    <div>{renderStatusBadge(order.status)}</div>
                </div>
            </div>

            {/* --- MAIN GRID LAYOUT --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* === LEFT COLUMN: TRACKING, ITEMS & ACCESSORIES (2 COLS) === */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* 1. Live Lifecycle Visualizer */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <Sparkles size={14} className="text-[#3d3f96]" /> Dispatch Tracker
                            </h3>
                            <span className="text-xs font-bold text-slate-500">
                                Delivery Mode: <strong className="text-slate-900">{order.collectionType || 'Home Delivery'}</strong>
                            </span>
                        </div>
                        {renderTimeline(order.status)}
                    </div>

                    {/* 2. Security PIN / Delivery OTP (if not finished) */}
                    {order.deliveryOTP && !isDelivered && !isCancelled && (
                        <div className="bg-gradient-to-r from-red-50/70 to-rose-50/50 border border-red-200/70 p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-red-600 flex items-center gap-1.5">
                                    <ShieldCheck size={14} /> Handover Verification PIN
                                </span>
                                <p className="text-xs font-bold text-slate-600">
                                    Share this secret 4-digit PIN with your delivery driver to confirm package handover.
                                </p>
                            </div>
                            <div className="bg-white px-5 py-2.5 rounded-2xl border border-red-200 shadow-xs text-center shrink-0">
                                <span className="text-2xl font-black font-mono tracking-widest text-red-600">
                                    {order.deliveryOTP}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* 3. Ordered Food Items */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <Utensils size={14} className="text-[#3d3f96]" />
                                Ordered Dishes ({order.items?.length || 0})
                            </h3>
                            <span className="text-[11px] font-bold text-slate-400">Standard Portioning</span>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {order.items?.map((item, idx) => (
                                <div key={item._id || idx} className="py-4 first:pt-1 last:pb-1 flex items-center justify-between gap-4">
                                    <div className="space-y-1 min-w-0">
                                        <h4 className="text-sm font-extrabold text-slate-900 truncate">
                                            {item.name}
                                        </h4>
                                        <div className="flex items-center gap-2 flex-wrap text-[10px] font-bold text-slate-400">
                                            <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-600 uppercase">
                                                {item.productType || 'MealItem'}
                                            </span>
                                            <span>•</span>
                                            <span>{item.mealType || 'Single Meal'}</span>
                                            {item.isComboApplied && (
                                                <>
                                                    <span>•</span>
                                                    <span className="text-emerald-600 font-extrabold">Combo Applied</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="text-xs text-slate-400 font-bold">
                                            {item.quantity} × ₹{item.price}
                                        </div>
                                        <div className="font-mono text-sm font-black text-slate-900 mt-0.5">
                                            ₹{(item.price || 0) * (item.quantity || 1)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 4. Non-Food Add-ons & Packaging Accessories */}
                    {order.addons && order.addons.length > 0 && (
                        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                    <Package size={14} className="text-[#3d3f96]" />
                                    Packaging & Add-on Accessories ({order.addons.length})
                                </h3>
                                <span className="text-[11px] font-bold text-slate-400">Eco-Friendly Essentials</span>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {order.addons.map((addon, idx) => {
                                    const addonMeta = addon.addonId || {};
                                    const addonImg = getMediaUrl(addonMeta.imageUrl);

                                    return (
                                        <div key={addon._id || idx} className="py-3.5 first:pt-1 last:pb-1 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200/80 overflow-hidden shrink-0">
                                                    <img 
                                                        src={addonImg} 
                                                        alt={addon.name} 
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                                                    />
                                                </div>
                                                <div className="space-y-0.5 min-w-0">
                                                    <h5 className="text-xs font-extrabold text-slate-900 truncate">
                                                        {addon.name}
                                                    </h5>
                                                    <p className="text-[10px] text-slate-400 truncate max-w-sm">
                                                        {addonMeta.description || "Hygienic non-food tableware/accessory"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="text-xs text-slate-400 font-bold">
                                                    {addon.quantity} × ₹{addon.price}
                                                </div>
                                                <div className="font-mono text-sm font-black text-slate-900 mt-0.5">
                                                    ₹{(addon.price || 0) * (addon.quantity || 1)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                </div>

                {/* === RIGHT COLUMN: BILL SUMMARY, ADDRESS, OUTLET & DRIVER (1 COL) === */}
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
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Meal Items Total</span>
                                <span className="font-mono text-slate-800">₹{order.billSummary?.itemTotal || 0}</span>
                            </div>

                            {order.billSummary?.packagingCharge > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Packaging & Hygiene Charges</span>
                                    <span className="font-mono text-slate-800">₹{order.billSummary?.packagingCharge}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">
                                    Delivery Charges ({order.billSummary?.fixedDistance || 100}km fix + dist)
                                </span>
                                <span className="font-mono text-slate-800">₹{order.billSummary?.deliveryCharge || 0}</span>
                            </div>

                            {order.billSummary?.fastDeliveryCharge > 0 && (
                                <div className="flex justify-between items-center text-amber-700">
                                    <span>Rapid Priority Dispatch</span>
                                    <span className="font-mono font-black">+₹{order.billSummary?.fastDeliveryCharge}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">
                                    GST & FSSAI Taxes ({order.billSummary?.taxPercentage || 9}%)
                                </span>
                                <span className="font-mono text-slate-800">₹{order.billSummary?.taxAmount || 0}</span>
                            </div>

                            {/* Coupon Discount */}
                            {order.billSummary?.couponDiscount > 0 && (
                                <div className="flex justify-between items-center text-rose-600 pt-1.5 border-t border-dashed border-slate-200">
                                    <span className="flex items-center gap-1">
                                        <Tag size={12} /> Coupon ({order.billSummary?.couponId?.couponName || "PROMO"})
                                    </span>
                                    <span className="font-mono font-black">-₹{order.billSummary?.couponDiscount}</span>
                                </div>
                            )}

                            {/* Final Total Amount */}
                            <div className="flex justify-between items-center text-slate-900 border-t border-slate-200 pt-3.5 text-sm font-black">
                                <div>
                                    <span className="block leading-none">Grand Total</span>
                                    <span className="text-[10px] text-slate-400 font-bold">Inclusive of all taxes</span>
                                </div>
                                <span className="font-mono text-xl font-black text-[#3d3f96]">
                                    ₹{order.billSummary?.totalAmount || 0}
                                </span>
                            </div>
                        </div>

                        {/* Razorpay Transaction ID (if available) */}
                        {order.paymentDetails?.razorpayOrderId && (
                            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                                <span className="flex items-center gap-1.5">
                                    <CreditCard size={13} className="text-[#3d3f96]" /> Razorpay Ref
                                </span>
                                <span className="font-mono text-slate-700 uppercase">
                                    {order.paymentDetails.razorpayOrderId}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* 2. Kitchen Partner Details Card */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-3.5">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <Store size={14} className="text-[#3d3f96]" /> Prepared By
                        </h3>

                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/80 overflow-hidden shrink-0">
                                <img 
                                    src={kitchenImg} 
                                    alt={kitchen.name || "Kitchen Partner"} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                                />
                            </div>
                            <div className="min-w-0 space-y-0.5">
                                <h4 className="text-sm font-extrabold text-slate-900 truncate">
                                    {kitchen.name || "Health Partner Cloud Kitchen"}
                                </h4>
                                <p className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                    <MapPin size={11} /> {kitchen.city || "Mohali"}, {kitchen.state || "Punjab"}
                                </p>
                            </div>
                        </div>

                        {kitchen.phone && (
                            <a 
                                href={`tel:${kitchen.phone}`}
                                className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/70 rounded-xl text-slate-700 text-xs font-extrabold flex items-center justify-center gap-2 transition"
                            >
                                <Phone size={13} /> Call Kitchen ({kitchen.phone})
                            </a>
                        )}
                    </div>

                    {/* 3. Delivery Address Card */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-3.5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <MapPin size={14} className="text-[#3d3f96]" /> Delivery Destination
                            </h3>
                            <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                                {order.address?.addressType || "Home"}
                            </span>
                        </div>

                        <div className="space-y-1 text-xs">
                            <strong className="text-slate-900 font-extrabold block text-sm">
                                {order.address?.name || "Customer"}
                            </strong>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                {[
                                    order.address?.houseNo,
                                    order.address?.sector,
                                    order.address?.landmark,
                                    order.address?.city,
                                    order.address?.state,
                                    order.address?.pincode
                                ].filter(Boolean).join(", ")}
                            </p>
                            {order.address?.phone && (
                                <p className="text-slate-400 font-bold pt-1 flex items-center gap-1">
                                    <Phone size={11} /> +91 {order.address.phone}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 4. Assigned Logistics Partner */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-3.5">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <Truck size={14} className="text-[#3d3f96]" /> Fleet & Dispatch
                        </h3>

                        {order.driverId ? (
                            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-100/70 text-[#3d3f96] flex items-center justify-center shrink-0">
                                        <Bike size={18} />
                                    </div>
                                    <div>
                                        <span className="text-[9px] font-black uppercase text-slate-400 block">Assigned Rider</span>
                                        <strong className="text-xs font-black text-slate-900 block">{order.driverId.name || "Delivery Associate"}</strong>
                                    </div>
                                </div>
                                {order.driverId.phone && (
                                    <a
                                        href={`tel:${order.driverId.phone}`}
                                        className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition"
                                        title="Call Rider"
                                    >
                                        <Phone size={14} />
                                    </a>
                                )}
                            </div>
                        ) : (
                            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-3 text-slate-500">
                                <Truck size={18} className="text-slate-400 animate-pulse shrink-0" />
                                <div className="text-xs">
                                    <span className="font-bold block text-slate-700">Assigning Logistics Partner</span>
                                    <span className="text-[10px] text-slate-400">Finding closest fleet rider once packed</span>
                                </div>
                            </div>
                        )}
                    </div>

                </div>

            </div>
        </div>
    );
}