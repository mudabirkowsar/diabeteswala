"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Bookmark, Loader2, AlertCircle, MapPin, Edit3, ShieldCheck, ArrowRight } from 'lucide-react';

import UserAPI from '../../../../services/UserAPI';
import { useNotification } from '../../../../context/NotificationContext';

// Import our 4 Sub-Components
import PlanMediaSidebar from '../components/PlanMediaSidebar';
import ScheduleCustomizer from '../components/ScheduleCustomizer';
import AddressModal from '../components/AddressModal';
import SubscriptionReviewModal from '../components/SubscriptionReviewModal';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const loadRazorpaySDK = () => {
    return new Promise((resolve) => {
        if (typeof window !== "undefined" && window.Razorpay) return resolve(true);
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export default function TiffinPlanDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { showNotification } = useNotification();

    // Data States
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState(false);

    // Address & Modal States
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    // Calculation & Coupon States
    const [appliedCoupon, setAppliedCoupon] = useState('');
    const [billSummary, setBillSummary] = useState(null);
    const [calculatedDates, setCalculatedDates] = useState(null);
    const [calculatingBill, setCalculatingBill] = useState(false);
    const [confirmedOrder, setConfirmedOrder] = useState(null);

    // Schedule Customization States
    const [specialInstructions, setSpecialInstructions] = useState('');
    const [selectedWeek, setSelectedWeek] = useState(1);
    const [selectedDay, setSelectedDay] = useState('Monday');
    const [applyToAllWeeks, setApplyToAllWeeks] = useState(true);
    const [customizedSchedule, setCustomizedSchedule] = useState({});
    const [deliveryTimes, setDeliveryTimes] = useState({
        breakfast: '08:00 AM - 09:00 AM',
        lunch: '01:00 PM - 02:00 PM',
        dinner: '08:00 PM - 09:00 PM'
    });

    const isMonthly = useMemo(() => {
        return (plan?.planCycle || '').toLowerCase().includes('month');
    }, [plan?.planCycle]);

    const billingCycle = isMonthly ? 'monthly' : 'weekly';

    const getInitialCoords = () => {
        try {
            const saved = localStorage.getItem("userCoords");
            if (saved) return JSON.parse(saved);
        } catch (e) { }
        return { lat: 30.7046, lng: 76.7179 };
    };

    const formatDailyMealSchedule = useCallback(() => {
        if (!plan?.permittedSlots) return [];
        const totalWeeks = isMonthly ? 4 : 1;
        const formatted = [];

        for (let w = 1; w <= totalWeeks; w++) {
            DAYS_OF_WEEK.forEach((day) => {
                const dayLower = day.toLowerCase();
                plan.permittedSlots.forEach((slotName) => {
                    const slotLower = slotName.toLowerCase();
                    const mealId = customizedSchedule[w]?.[day]?.[slotLower];
                    if (mealId) {
                        formatted.push({ weekNumber: w, dayOfWeek: dayLower, slotName: slotLower, mealId });
                    }
                });
            });
        }
        return formatted;
    }, [plan, isMonthly, customizedSchedule]);

    const formatDeliveryTimes = useCallback(() => ({
        breakfastTime: deliveryTimes.breakfast || "08:00 AM - 09:00 AM",
        lunchTime: deliveryTimes.lunch || "01:00 PM - 02:00 PM",
        dinnerTime: deliveryTimes.dinner || "08:00 PM - 09:00 PM"
    }), [deliveryTimes]);

    // Initial Fetch
    useEffect(() => {
        if (!id) return;
        (async () => {
            setLoading(true);
            try {
                const [planRes, addrRes] = await Promise.all([
                    UserAPI.getUserTiffinPlanDetails(id, getInitialCoords()),
                    UserAPI.getAddressList().catch(() => null)
                ]);

                if (planRes?.success) {
                    const planData = planRes.data;
                    setPlan(planData);

                    const defaultSchedule = {};
                    (planData.permittedSlots || []).forEach((slot) => {
                        const dishes = planData.slotDishes?.[slot.toLowerCase()] || [];
                        if (dishes.length > 0) defaultSchedule[slot.toLowerCase()] = dishes[0].itemId?._id || dishes[0]._id;
                    });
                    const initial = {};
                    const totalW = planData.planCycle?.toLowerCase().includes('month') ? 4 : 1;
                    for (let w = 1; w <= totalW; w++) {
                        initial[w] = {};
                        DAYS_OF_WEEK.forEach((d) => { initial[w][d] = { ...defaultSchedule }; });
                    }
                    setCustomizedSchedule(initial);
                }

                if (addrRes?.success && Array.isArray(addrRes.data) && addrRes.data.length > 0) {
                    setSelectedAddress(addrRes.data.find((a) => a.isDefault) || addrRes.data[0]);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    // Real-time Preview Calculation
    const recalculateBill = useCallback(async () => {
        if (!plan || Object.keys(customizedSchedule).length === 0) return;
        const schedule = formatDailyMealSchedule();
        if (schedule.length === 0) return;

        setCalculatingBill(true);
        try {
            const res = await UserAPI.previewTiffinSubscriptionBill({
                foodId: plan.vendorId?._id || plan.vendorId,
                bookingType: "Subscription",
                planId: plan._id,
                billingCycle,
                userLat: getInitialCoords().lat,
                userLng: getInitialCoords().lng,
                address: { city: selectedAddress?.city || "Mohali", state: selectedAddress?.state || "Punjab" },
                universalDeliveryTimes: formatDeliveryTimes(),
                dailyMealSchedule: schedule,
                couponCode: appliedCoupon || undefined
            });
            if (res?.success) {
                setBillSummary(res.billSummary);
                setCalculatedDates(res.dates);
            }
        } catch (err) {
            console.error("Preview Bill Error:", err);
        } finally {
            setCalculatingBill(false);
        }
    }, [plan, billingCycle, selectedAddress, appliedCoupon, formatDailyMealSchedule, formatDeliveryTimes, customizedSchedule]);

    useEffect(() => {
        recalculateBill();
    }, [recalculateBill]);

    const handleSelectDish = (slotKey, dishId) => {
        setCustomizedSchedule((prev) => {
            const updated = { ...prev };
            if (isMonthly && applyToAllWeeks) {
                for (let w = 1; w <= 4; w++) {
                    if (!updated[w]) updated[w] = {};
                    if (!updated[w][selectedDay]) updated[w][selectedDay] = {};
                    updated[w][selectedDay][slotKey] = dishId;
                }
            } else {
                if (!updated[selectedWeek]) updated[selectedWeek] = {};
                if (!updated[selectedWeek][selectedDay]) updated[selectedWeek][selectedDay] = {};
                updated[selectedWeek][selectedDay][slotKey] = dishId;
            }
            return updated;
        });
    };

    const handleReplicateWeekToAll = () => {
        if (!customizedSchedule[selectedWeek]) return;
        setCustomizedSchedule((prev) => {
            const updated = { ...prev };
            for (let w = 1; w <= 4; w++) updated[w] = JSON.parse(JSON.stringify(customizedSchedule[selectedWeek]));
            return updated;
        });
        if (showNotification) showNotification(`Week ${selectedWeek} synced to all weeks!`, "success");
    };

    // Open Review Modal Handler
    const handleProceedToReview = () => {
        if (!selectedAddress) {
            if (showNotification) showNotification("Please choose a delivery address first.", "warning");
            setIsAddressModalOpen(true);
            return;
        }
        setIsReviewModalOpen(true);
    };

    // Razorpay Online Payment Execution
    const handleSubscribeAndPay = async () => {
        if (!selectedAddress) {
            if (showNotification) showNotification("Please select a delivery address.", "warning");
            setIsAddressModalOpen(true);
            return;
        }

        const loaded = await loadRazorpaySDK();
        if (!loaded) return;

        setSubscribing(true);
        try {
            const orderRes = await UserAPI.subscribeTiffinPlan({
                foodId: plan.vendorId?._id || plan.vendorId,
                bookingType: "Subscription",
                planId: plan._id,
                planName: plan.name,
                billingCycle,
                paymentMethod: "Online",
                userLat: getInitialCoords().lat,
                userLng: getInitialCoords().lng,
                address: {
                    name: selectedAddress.name,
                    phone: selectedAddress.phone,
                    houseNo: selectedAddress.houseNo,
                    sector: selectedAddress.sector || "",
                    city: selectedAddress.city,
                    state: selectedAddress.state,
                    pincode: selectedAddress.pincode
                },
                universalDeliveryTimes: formatDeliveryTimes(),
                dailyMealSchedule: formatDailyMealSchedule(),
                specialInstructions: specialInstructions.trim()
            });

            if (!orderRes?.success) throw new Error(orderRes?.message || "Order creation failed");

            const rzp = new window.Razorpay({
                key: orderRes.key,
                amount: orderRes.amount,
                currency: orderRes.currency || "INR",
                name: "Health Cloud Kitchen",
                description: `Tiffin: ${plan.name}`,
                order_id: orderRes.razorpayOrderId,
                prefill: { name: selectedAddress.name, contact: selectedAddress.phone },
                theme: { color: "#3d3f96" },
                handler: async (payRes) => {
                    const verifyRes = await UserAPI.verifyTiffinRazorpayPayment({
                        appointmentId: orderRes.subscriptionId || orderRes.data?._id,
                        bookingId: orderRes.bookingId,
                        razorpayOrderId: payRes.razorpay_order_id,
                        razorpayPaymentId: payRes.razorpay_payment_id,
                        razorpaySignature: payRes.razorpay_signature
                    });
                    if (verifyRes?.success) {
                        setConfirmedOrder(verifyRes.data || { bookingId: orderRes.bookingId });
                    }
                    setSubscribing(false);
                },
                modal: { ondismiss: () => setSubscribing(false) }
            });
            rzp.open();
        } catch (err) {
            console.error(err);
            if (showNotification) showNotification(err.message || "Checkout failed", "error");
            setSubscribing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fbff]">
                <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={40} />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading subscription...</p>
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8">
                <AlertCircle className="text-slate-300 mb-4" size={48} />
                <h2 className="text-lg font-bold text-slate-700">Tiffin Plan Not Found</h2>
                <button onClick={() => router.push('/food/nearest')} className="mt-4 px-6 py-2.5 bg-[#3d3f96] text-white font-extrabold text-xs uppercase rounded-xl">Back to Menu</button>
            </div>
        );
    }

    const allDishes = [...(plan.slotDishes?.breakfast || []), ...(plan.slotDishes?.lunch || []), ...(plan.slotDishes?.dinner || [])].map((i) => i.itemId).filter(Boolean);
    const aggregatedIngredients = Array.from(new Set(allDishes.flatMap((d) => d.ingredients || [])));
    const aggregatedTags = Array.from(new Set(allDishes.flatMap((d) => d.tags || [])));
    const aggregatedFocusAreas = Array.from(new Set(allDishes.map((d) => d.foodEffectCategory).filter(Boolean)));
    const isAvailable = plan.isAvailable !== false && !plan.UnavailablePlan;

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-10 max-w-[1200px] mx-auto space-y-8 antialiased select-none text-left">
            
            {/* Modal 1: Address Selector */}
            <AddressModal
                isOpen={isAddressModalOpen}
                onClose={() => setIsAddressModalOpen(false)}
                selectedAddressId={selectedAddress?._id}
                onSelectAddress={(addr) => setSelectedAddress(addr)}
            />

            {/* Modal 2: Complete Subscription Review & Online Payment */}
            <SubscriptionReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                plan={plan}
                isMonthly={isMonthly}
                selectedAddress={selectedAddress}
                deliveryTimes={deliveryTimes}
                customizedSchedule={customizedSchedule}
                specialInstructions={specialInstructions}
                billSummary={billSummary}
                calculatedDates={calculatedDates}
                calculatingBill={calculatingBill}
                appliedCoupon={appliedCoupon}
                onApplyCoupon={(c) => setAppliedCoupon(c)}
                onRemoveCoupon={() => setAppliedCoupon('')}
                subscribing={subscribing}
                onPayNow={handleSubscribeAndPay}
                confirmedOrder={confirmedOrder}
                onViewOrderConfirmation={() => router.push('/otherscreens/foodbookingconfirmation')}
            />

            {/* Back Button */}
            <button onClick={() => router.back()} className="flex items-center gap-2 text-xs font-extrabold text-slate-400 hover:text-[#3d3f96] uppercase cursor-pointer">
                <ArrowLeft size={16} /> Back to Tiffin Plans
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* 1. LEFT SIDEBAR COMPONENT */}
                <PlanMediaSidebar
                    plan={plan}
                    isAvailable={isAvailable}
                    aggregatedIngredients={aggregatedIngredients}
                />

                {/* RIGHT COLUMN */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
                        
                        {/* Header Details */}
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border bg-indigo-50 border-indigo-100 text-[#3d3f96]">
                                    <Bookmark size={11} className="fill-[#3d3f96]" /> Tiffin Package
                                </span>
                                {aggregatedFocusAreas.map((area) => (
                                    <span key={area} className="text-[10px] font-black uppercase text-red-600 bg-red-50/60 px-3 py-1.5 rounded-xl border border-red-200/60">{area}</span>
                                ))}
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{plan.name}</h1>
                            <p className="text-sm text-slate-600 font-medium">{plan.description}</p>
                        </div>

                        {/* 2. SCHEDULE & DISH CUSTOMIZER COMPONENT */}
                        <ScheduleCustomizer
                            plan={plan}
                            isMonthly={isMonthly}
                            selectedWeek={selectedWeek}
                            setSelectedWeek={setSelectedWeek}
                            selectedDay={selectedDay}
                            setSelectedDay={setSelectedDay}
                            applyToAllWeeks={applyToAllWeeks}
                            setApplyToAllWeeks={setApplyToAllWeeks}
                            customizedSchedule={customizedSchedule}
                            onSelectDish={handleSelectDish}
                            onReplicateWeekToAll={handleReplicateWeekToAll}
                            deliveryTimes={deliveryTimes}
                            onDeliveryTimeChange={(slot, time) => setDeliveryTimes((p) => ({ ...p, [slot]: time }))}
                            specialInstructions={specialInstructions}
                            setSpecialInstructions={setSpecialInstructions}
                            aggregatedTags={aggregatedTags}
                        />

                        {/* Delivery Address Card & Review Trigger */}
                        <div className="space-y-3 pt-2 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                                    Delivery Address
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setIsAddressModalOpen(true)}
                                    className="text-[11px] font-black text-[#3d3f96] hover:text-[#2F3175] flex items-center gap-1 cursor-pointer"
                                >
                                    <Edit3 size={12} />
                                    {selectedAddress ? "Change Address" : "Select Address"}
                                </button>
                            </div>

                            <div
                                onClick={() => setIsAddressModalOpen(true)}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                                    selectedAddress ? 'bg-slate-50/70 border-slate-200 hover:border-indigo-200' : 'bg-amber-50/50 border-amber-200'
                                }`}
                            >
                                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 text-[#3d3f96]">
                                    <MapPin size={17} />
                                </div>

                                <div className="flex-1 min-w-0 space-y-0.5">
                                    {selectedAddress ? (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                                                    {selectedAddress.addressType || "Address"}
                                                </span>
                                                <strong className="text-xs font-black text-slate-800 truncate">{selectedAddress.name}</strong>
                                                <span className="text-[11px] text-slate-400 font-bold">• {selectedAddress.phone}</span>
                                            </div>
                                            <p className="text-xs text-slate-600 font-medium leading-snug pt-0.5">
                                                {[selectedAddress.houseNo, selectedAddress.sector, selectedAddress.city, selectedAddress.state, selectedAddress.pincode].filter(Boolean).join(', ')}
                                            </p>
                                        </>
                                    ) : (
                                        <div className="space-y-0.5">
                                            <strong className="text-xs font-black text-amber-800">No Delivery Address Selected</strong>
                                            <p className="text-[11px] text-amber-700 font-medium">Click here to choose your saved delivery address.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* CTA: Proceed to Review Modal */}
                        <div className="pt-2">
                            {isAvailable ? (
                                <button
                                    onClick={handleProceedToReview}
                                    className="w-full bg-[#3d3f96] hover:bg-[#2F3175] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/10 cursor-pointer"
                                >
                                    <span>Review Subscription &amp; Pay</span>
                                    <ArrowRight size={16} />
                                </button>
                            ) : (
                                <button
                                    disabled
                                    className="w-full bg-slate-100 text-slate-400 py-4 rounded-2xl font-black text-sm uppercase tracking-wider border border-slate-200/60 flex items-center justify-center gap-2 cursor-not-allowed"
                                >
                                    <AlertCircle size={18} />
                                    Not Available in Your Area
                                </button>
                            )}
                        </div>

                    </div>

                    {/* Hygiene Notice Banner */}
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3">
                        <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                        <div className="space-y-0.5">
                            <span className="text-xs font-black uppercase text-emerald-800 tracking-wide block">Clinical Hygiene Protocols</span>
                            <span className="text-xs text-emerald-700/90 font-medium leading-relaxed block">
                                Prepared fresh in sanitized cloud kitchens, packed in food-grade eco containers, and shipped contactless.
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}