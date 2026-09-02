"use client";

import React, { useState, useEffect } from 'react';
import { 
    X, 
    ChefHat, 
    Loader2, 
    User, 
    Phone, 
    Mail, 
    MapPin, 
    Clock, 
    Calendar, 
    Utensils, 
    CheckCircle2, 
    AlertCircle, 
    Check, 
    CreditCard, 
    Flame, 
    Receipt, 
    ShieldCheck,
    Truck
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import FoodAPI from '../../../../../services/FoodVendorAPI';

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

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200";
const USER_PLACEHOLDER = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150";

export default function CustomizedTiffinDetailModal({ requestId, isOpen, onClose, onActionComplete }) {
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Rejection state
    const [showRejectBox, setShowRejectBox] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const response = await FoodAPI.getVendorCustomRequestDetails(requestId);
            if (response && response.success) {
                setDetail(response.data);
            } else {
                toast.error("Failed to load custom request details.");
            }
        } catch (err) {
            console.error("Error loading custom request detail:", err);
            toast.error("Failed to load custom tiffin record.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && requestId) {
            fetchDetail();
            setShowRejectBox(false);
            setRejectReason('');
        } else {
            setDetail(null);
        }
    }, [isOpen, requestId]);

    if (!isOpen) return null;

    // --- State Machine Actions: Accept / Reject ---
    const handleProcessRequest = async (action, reason = null) => {
        setProcessing(true);
        try {
            const payload = {
                action,
                ...(reason && { rejectReason: reason })
            };
            const response = await FoodAPI.processVendorCustomRequest(detail._id || requestId, payload);
            if (response && response.success) {
                toast.success(response.message || `Custom request marked as ${action}ed!`);
                setShowRejectBox(false);
                setRejectReason('');
                await fetchDetail();
                if (onActionComplete) onActionComplete();
            }
        } catch (err) {
            console.error(`Error processing custom request (${action}):`, err);
            toast.error(err.response?.data?.message || `Failed to ${action} custom request.`);
        } finally {
            setProcessing(false);
        }
    };

    // --- Helper: Render Diet Badge ---
    const renderDietBadge = (type) => {
        const isVeg = type === 'Veg' || type === 'veg';
        const isEgg = type === 'Egg' || type === 'egg';
        const isNonVeg = type === 'Non Veg' || type === 'non veg';

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border bg-white ${
                isVeg ? 'text-emerald-600 border-emerald-100' : isEgg ? 'text-amber-600 border-amber-100' : isNonVeg ? 'text-rose-600 border-rose-100' : 'text-slate-500 border-slate-100'
            }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isVeg ? 'bg-emerald-500' : isEgg ? 'bg-amber-500' : isNonVeg ? 'bg-rose-500' : 'bg-slate-400'}`} />
                {type}
            </span>
        );
    };

    const customSpecs = detail?.customTiffinDetails || {};
    const deliveryTimes = customSpecs.universalDeliveryTimes || {};
    const weeklySchedule = customSpecs.weeklyCustomSchedule || [];
    const selectedSlots = customSpecs.selectedMeals || {};
    const user = detail?.userId || {};
    const address = detail?.address || {};
    const bill = detail?.billSummary || {};
    const payment = detail?.paymentDetails || {};

    return (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-6 select-none antialiased">
            {/* Expanded Wide Modal Container (max-w-5xl) */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 max-w-5xl w-full p-6 sm:p-10 shadow-2xl relative max-h-[92vh] overflow-y-auto [&::-webkit-scrollbar]:hidden text-left space-y-8">
                
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition cursor-pointer"
                >
                    <X size={18} />
                </button>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-28">
                        <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={40} />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading custom plate breakdown...</p>
                    </div>
                ) : !detail ? (
                    <div className="py-16 text-center text-slate-400 text-xs font-bold">
                        No custom request located.
                    </div>
                ) : (
                    <div className="space-y-8">
                        
                        {/* --- TOP HEADER WITH IDENTIFICATION --- */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 pr-10">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Custom Plate Request</span>
                                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-50 text-[#3d3f96] border border-indigo-100">
                                        {detail.planType || detail.bookingType || "Custom Plate"}
                                    </span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                                    <ChefHat size={24} className="text-[#3d3f96]" /> {detail.bookingId}
                                </h2>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className={`text-xs font-black uppercase px-3.5 py-1.5 rounded-xl border ${
                                    detail.status === 'Active' 
                                        ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
                                        : detail.status === 'Cancelled'
                                        ? 'text-rose-600 bg-rose-50 border-rose-100'
                                        : 'text-amber-600 bg-amber-50 border-amber-100'
                                }`}>
                                    {detail.status || 'New'}
                                </span>
                            </div>
                        </div>

                        {/* --- DELIVERY OTP BANNER --- */}
                        {detail.deliveryOTP && (
                            <div className="bg-red-50/60 border border-red-200/60 text-red-600 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                                <div className="space-y-0.5">
                                    <span className="text-[10px] font-black uppercase tracking-wider block">Universal Delivery Security OTP</span>
                                    <p className="text-xs text-red-600/90 font-semibold">Customer will provide this code to the delivery rider at the door [cite: custom_context].</p>
                                </div>
                                <strong className="text-2xl font-black font-mono tracking-widest bg-white/90 px-4 py-1.5 rounded-xl border border-red-200/80 shrink-0">
                                    {detail.deliveryOTP}
                                </strong>
                            </div>
                        )}

                        {/* --- 2-COLUMN PRIMARY OVERVIEW GRID --- */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                            
                            {/* COLUMN 1: CUSTOMER & DELIVERY ADDRESS */}
                            <div className="space-y-6">
                                
                                {/* Customer Profile */}
                                <div className="bg-slate-50/50 border border-slate-150 p-5 rounded-3xl space-y-3">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block border-b border-slate-200/50 pb-2">
                                        Customer Monograph
                                    </span>
                                    
                                    <div className="flex items-center gap-3.5 pt-1">
                                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 overflow-hidden shrink-0">
                                            <img 
                                                src={getMediaUrl(user.profilePic) || USER_PLACEHOLDER} 
                                                alt={user.name || "Customer"} 
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.target.src = USER_PLACEHOLDER; }}
                                            />
                                        </div>
                                        <div className="space-y-0.5 min-w-0">
                                            <h4 className="text-sm font-extrabold text-slate-800 truncate">{user.name || "Customer"}</h4>
                                            <p className="text-xs font-bold text-[#3d3f96] flex items-center gap-1">
                                                <Phone size={11} /> {user.phone || "No Phone"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200/50 font-semibold text-slate-600">
                                        <div>
                                            <span className="text-[10px] text-slate-400 block uppercase">Email</span>
                                            <span className="truncate block" title={user.email}>{user.email || "N/A"}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-slate-400 block uppercase">Gender / DOB</span>
                                            <span>{user.gender || "N/A"} • {user.dob ? new Date(user.dob).toLocaleDateString() : "N/A"}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Delivery Address */}
                                <div className="bg-slate-50/50 border border-slate-150 p-5 rounded-3xl space-y-3">
                                    <div className="flex items-center justify-between border-b border-slate-200/50 pb-2">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                            Delivery Location
                                        </span>
                                        <span className="text-[9px] font-black uppercase bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                                            {address.addressType || "Home"}
                                        </span>
                                    </div>

                                    <div className="space-y-1 text-xs">
                                        <div className="flex items-center gap-1.5 text-slate-800 font-extrabold">
                                            <MapPin size={14} className="text-rose-500 shrink-0" />
                                            <span>{address.name || user.name} • {address.phone || user.phone}</span>
                                        </div>
                                        <p className="text-slate-600 font-medium leading-relaxed pt-1 pl-5">
                                            {[address.houseNo, address.sector, address.city, address.state, address.pincode].filter(Boolean).join(', ')}
                                        </p>
                                        <div className="pt-2 pl-5">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Fulfillment Mode:</span>{" "}
                                            <span className="text-xs font-black text-[#3d3f96]">{detail.collectionType || "Home Delivery"}</span>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* COLUMN 2: CUSTOM SPECS & BILLING LEDGER */}
                            <div className="space-y-6">
                                
                                {/* Personalized Parameters & Universal Slots */}
                                <div className="bg-slate-50/50 border border-slate-150 p-5 rounded-3xl space-y-3.5">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block border-b border-slate-200/50 pb-2">
                                        Custom Specifications
                                    </span>

                                    {/* Parameters Grid */}
                                    <div className="grid grid-cols-3 gap-2 font-bold text-center text-xs">
                                        <div className="bg-white p-2.5 rounded-2xl border border-slate-200/70">
                                            <span className="text-[9px] text-slate-400 block uppercase">Duration</span>
                                            <strong className="text-slate-800">{customSpecs.packageDays} Days</strong>
                                        </div>
                                        <div className="bg-white p-2.5 rounded-2xl border border-slate-200/70">
                                            <span className="text-[9px] text-slate-400 block uppercase">Diet Style</span>
                                            <strong className="text-slate-800 capitalize">{customSpecs.dietaryType}</strong>
                                        </div>
                                        <div className="bg-white p-2.5 rounded-2xl border border-slate-200/70">
                                            <span className="text-[9px] text-slate-400 block uppercase">Spice Level</span>
                                            <strong className="text-slate-800 capitalize">{customSpecs.spiceLevel}</strong>
                                        </div>
                                    </div>

                                    {/* Selected Meal Slot Tags */}
                                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                        <span className="text-[9px] font-black uppercase text-slate-400 mr-1">Active Slots:</span>
                                        {selectedSlots.breakfast && <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-[#3d3f96] border border-indigo-100">Breakfast</span>}
                                        {selectedSlots.lunch && <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-[#3d3f96] border border-indigo-100">Lunch</span>}
                                        {selectedSlots.dinner && <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-[#3d3f96] border border-indigo-100">Dinner</span>}
                                    </div>

                                    {/* Clinical Notes */}
                                    {customSpecs.clinicalNotes && (
                                        <div className="bg-amber-50/80 border border-amber-200/60 p-3 rounded-2xl">
                                            <span className="text-[9px] font-black uppercase text-amber-800 block">Patient Clinical Notes</span>
                                            <p className="text-xs text-amber-900 font-semibold mt-0.5">{customSpecs.clinicalNotes}</p>
                                        </div>
                                    )}

                                    {/* Universal Delivery Windows */}
                                    <div className="pt-2 border-t border-slate-200/50 space-y-1.5">
                                        <span className="text-[9px] font-black uppercase text-slate-400 block">Universal Slot Windows</span>
                                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                            <div className="p-2 bg-white rounded-xl border border-slate-200/60">
                                                <span className="text-[9px] font-black uppercase text-slate-400 block">Breakfast</span>
                                                <span className="font-bold text-slate-800 text-[10px]">{deliveryTimes.breakfastTime || "N/A"}</span>
                                            </div>
                                            <div className="p-2 bg-white rounded-xl border border-slate-200/60">
                                                <span className="text-[9px] font-black uppercase text-slate-400 block">Lunch</span>
                                                <span className="font-bold text-slate-800 text-[10px]">{deliveryTimes.lunchTime || "N/A"}</span>
                                            </div>
                                            <div className="p-2 bg-white rounded-xl border border-slate-200/60">
                                                <span className="text-[9px] font-black uppercase text-slate-400 block">Dinner</span>
                                                <span className="font-bold text-slate-800 text-[10px]">{deliveryTimes.dinnerTime || "N/A"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Comprehensive Billing Summary */}
                                <div className="bg-slate-50/50 border border-slate-150 p-5 rounded-3xl space-y-3">
                                    <div className="flex items-center justify-between border-b border-slate-200/50 pb-2">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                            Invoice &amp; Payment Ledger
                                        </span>
                                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                            {detail.paymentStatus || "Paid"} via {detail.paymentMethod || "Online"}
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-xs font-semibold text-slate-600">
                                        <div className="flex justify-between">
                                            <span>Base Items Subtotal:</span>
                                            <span className="font-mono text-slate-800 font-bold">₹{bill.itemTotal || 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Peak Custom Preparation Fee:</span>
                                            <span className="font-mono text-slate-800 font-bold">₹{bill.peakOrderCharge || 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Packaging Fee:</span>
                                            <span className="font-mono text-slate-800 font-bold">₹{bill.packagingCharge || 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Taxes ({bill.taxPercentage || 5}% GST):</span>
                                            <span className="font-mono text-slate-800 font-bold">₹{bill.taxAmount || 0}</span>
                                        </div>
                                        {payment.razorpayPaymentId && (
                                            <div className="pt-2 border-t border-slate-200/50 text-[10px] text-slate-400">
                                                <span>Razorpay Ref: </span>
                                                <span className="font-mono text-slate-600 font-bold">{payment.razorpayPaymentId}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-sm text-slate-900 border-t border-slate-200/60 pt-2 font-black">
                                            <span>Total Amount Settled:</span>
                                            <span className="font-mono text-base text-[#3d3f96]">₹{bill.totalAmount || 0}</span>
                                        </div>
                                    </div>
                                </div>

                            </div>

                        </div>

                        {/* --- SECTION 3: WEEKLY CUSTOM SCHEDULE DISH BREAKDOWN --- */}
                        {weeklySchedule.length > 0 && (
                            <div className="space-y-4 pt-2">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <div>
                                        <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                                            <Utensils size={18} className="text-[#3d3f96]" /> Weekly Dish Allocation Breakdown
                                        </h3>
                                        <p className="text-xs text-slate-400 font-semibold mt-0.5">
                                            Day-by-day customized meal selections across Monday through Sunday [cite: custom_context].
                                        </p>
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-3 py-1 rounded-lg">
                                        {weeklySchedule.length} Days Allocated
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    {weeklySchedule.map((item, idx) => (
                                        <div key={item._id || idx} className="border border-slate-150 rounded-3xl p-5 bg-slate-50/40 space-y-3">
                                            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                                                <h4 className="text-xs font-black uppercase text-[#3d3f96] tracking-wider flex items-center gap-1.5">
                                                    <Calendar size={13} /> {item.dayOfWeek} Schedule
                                                </h4>
                                            </div>

                                            {/* Slots Grid */}
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                                {/* Breakfast Slot */}
                                                {item.breakfast && (
                                                    <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 space-y-2 shadow-xs">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[9px] font-black uppercase text-[#3d3f96] bg-indigo-50 px-1.5 py-0.5 rounded">
                                                                Breakfast
                                                            </span>
                                                            {renderDietBadge(item.breakfast.mealId?.dietType || "Veg")}
                                                        </div>
                                                        <div className="flex gap-2.5 items-center">
                                                            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0">
                                                                <img 
                                                                    src={getMediaUrl(item.breakfast.mealId?.imageUrl) || PLACEHOLDER_IMAGE} 
                                                                    alt={item.breakfast.mealName} 
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                                                                />
                                                            </div>
                                                            <div className="space-y-0.5 min-w-0">
                                                                <strong className="text-xs font-black text-slate-800 block truncate" title={item.breakfast.mealName}>
                                                                    {item.breakfast.mealName}
                                                                </strong>
                                                                <span className="text-[10px] text-slate-400 block font-mono">
                                                                    {item.breakfast.deliverySlot}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 pt-1 border-t border-slate-100">
                                                            <span className="flex items-center gap-0.5 text-amber-600 font-mono">
                                                                <Flame size={10} className="text-amber-500" /> {item.breakfast.calories} Kcal
                                                            </span>
                                                            <span className="font-mono text-slate-700">₹{item.breakfast.price}</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Lunch Slot */}
                                                {item.lunch && (
                                                    <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 space-y-2 shadow-xs">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[9px] font-black uppercase text-[#3d3f96] bg-indigo-50 px-1.5 py-0.5 rounded">
                                                                Lunch
                                                            </span>
                                                            {renderDietBadge(item.lunch.mealId?.dietType || "Veg")}
                                                        </div>
                                                        <div className="flex gap-2.5 items-center">
                                                            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0">
                                                                <img 
                                                                    src={getMediaUrl(item.lunch.mealId?.imageUrl) || PLACEHOLDER_IMAGE} 
                                                                    alt={item.lunch.mealName} 
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                                                                />
                                                            </div>
                                                            <div className="space-y-0.5 min-w-0">
                                                                <strong className="text-xs font-black text-slate-800 block truncate" title={item.lunch.mealName}>
                                                                    {item.lunch.mealName}
                                                                </strong>
                                                                <span className="text-[10px] text-slate-400 block font-mono">
                                                                    {item.lunch.deliverySlot}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 pt-1 border-t border-slate-100">
                                                            <span className="flex items-center gap-0.5 text-amber-600 font-mono">
                                                                <Flame size={10} className="text-amber-500" /> {item.lunch.calories} Kcal
                                                            </span>
                                                            <span className="font-mono text-slate-700">₹{item.lunch.price}</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Dinner Slot */}
                                                {item.dinner && (
                                                    <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 space-y-2 shadow-xs">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[9px] font-black uppercase text-[#3d3f96] bg-indigo-50 px-1.5 py-0.5 rounded">
                                                                Dinner
                                                            </span>
                                                            {renderDietBadge(item.dinner.mealId?.dietType || "Veg")}
                                                        </div>
                                                        <div className="flex gap-2.5 items-center">
                                                            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0">
                                                                <img 
                                                                    src={getMediaUrl(item.dinner.mealId?.imageUrl) || PLACEHOLDER_IMAGE} 
                                                                    alt={item.dinner.mealName} 
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                                                                />
                                                            </div>
                                                            <div className="space-y-0.5 min-w-0">
                                                                <strong className="text-xs font-black text-slate-800 block truncate" title={item.dinner.mealName}>
                                                                    {item.dinner.mealName}
                                                                </strong>
                                                                <span className="text-[10px] text-slate-400 block font-mono">
                                                                    {item.dinner.deliverySlot}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 pt-1 border-t border-slate-100">
                                                            <span className="flex items-center gap-0.5 text-amber-600 font-mono">
                                                                <Flame size={10} className="text-amber-500" /> {item.dinner.calories} Kcal
                                                            </span>
                                                            <span className="font-mono text-slate-700">₹{item.dinner.price}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Cancellation Reason if Rejected */}
                        {detail.cancelReason && (
                            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-1">
                                <span className="text-[10px] font-black uppercase text-rose-700 block">Rejection Reason</span>
                                <p className="text-rose-800 font-medium">{detail.cancelReason}</p>
                            </div>
                        )}

                        {/* --- STATE MACHINE ACTIONS (ACCEPT / REJECT) --- */}
                        {detail.status === 'New' && (
                            <div className="pt-3 border-t border-slate-100 space-y-3">
                                {showRejectBox ? (
                                    <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-black uppercase text-rose-600 flex items-center gap-1">
                                                <AlertCircle size={14} /> Specify Rejection Reason *
                                            </span>
                                            <button onClick={() => setShowRejectBox(false)} className="text-slate-400 hover:text-slate-600">
                                                <X size={14} />
                                            </button>
                                        </div>
                                        <textarea 
                                            rows={2}
                                            required
                                            value={rejectReason}
                                            onChange={(e) => setRejectReason(e.target.value)}
                                            placeholder="e.g. Kitchen capacity exceeded for custom zero-sugar preparation..."
                                            className="w-full p-2.5 bg-white border border-rose-200 rounded-xl text-xs font-semibold text-slate-800 outline-none resize-none"
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowRejectBox(false)}
                                                className="px-3.5 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                disabled={!rejectReason.trim() || processing}
                                                onClick={() => handleProcessRequest('Reject', rejectReason)}
                                                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer"
                                            >
                                                {processing ? <Loader2 size={12} className="animate-spin inline mr-1" /> : null}
                                                Confirm Rejection
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-end gap-3">
                                        <button
                                            type="button"
                                            disabled={processing}
                                            onClick={() => setShowRejectBox(true)}
                                            className="px-6 py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer disabled:opacity-50"
                                        >
                                            Reject Request
                                        </button>
                                        <button
                                            type="button"
                                            disabled={processing}
                                            onClick={() => handleProcessRequest('Accept')}
                                            className="px-7 py-3.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-950/10 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                                        >
                                            {processing ? <Loader2 size={14} className="animate-spin" /> : <Check size={15} />}
                                            <span>Accept Request</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                )}
            </div>
        </div>
    );
}