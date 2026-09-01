"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Calendar,
    ChefHat,
    Loader2,
    ShieldCheck,
    MessageSquareText,
    ArrowRight,
    MapPin,
    Edit3
} from 'lucide-react';

import UserAPI from '../../../services/UserAPI';
import { useNotification } from '../../../context/NotificationContext';

import CustomTiffinSlotsPicker from './components/CustomTiffinSlotsPicker';
import CustomTiffinReviewModal from './components/CustomTiffinReviewModal';
import AddressModal from './components/AddressModal';

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

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

export default function CustomTiffinBuilderPage() {
    const router = useRouter();
    const { showNotification } = useNotification();

    // Loader & Base States
    const [loading, setLoading] = useState(true);
    const [loaderData, setLoaderData] = useState(null);

    // 1. TOP DURATION PARAMETERS (Supports 10, 11, 12, 15, 30, etc.)
    const [packageDays, setPackageDays] = useState(10);
    const [customDaysInput, setCustomDaysInput] = useState('10');

    // Starting Date
    const [startDate, setStartDate] = useState(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    });

    // Dietary & Spice Preferences
    const [dietaryType, setDietaryType] = useState('veg');
    const [spiceLevel, setSpiceLevel] = useState('mild');
    const [clinicalNotes, setClinicalNotes] = useState('');

    // Slot Selections & Universal Delivery Times
    const [selectedMeals, setSelectedMeals] = useState({ breakfast: true, lunch: true, dinner: true });
    
    // N-Day Customization State: { 1: { breakfast: "id", ... }, 2: { ... }, ... 11: { ... } }
    const [selectedDayNumber, setSelectedDayNumber] = useState(1);
    const [dailySchedule, setDailySchedule] = useState({});

    const [universalDeliveryTimes, setUniversalDeliveryTimes] = useState({
        breakfastTime: '08:30 AM - 09:30 AM',
        lunchTime: '12:00 PM - 01:00 PM',
        dinnerTime: '07:00 PM - 08:00 PM'
    });

    // Delivery Address & Modals
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    // Calculation & Coupon States
    const [appliedCoupon, setAppliedCoupon] = useState('');
    const [calculatedData, setCalculatedData] = useState(null);
    const [calculatingBill, setCalculatingBill] = useState(false);

    // Payment & Order Status
    const [paymentMethod, setPaymentMethod] = useState('Online');
    const [subscribing, setSubscribing] = useState(false);
    const [confirmedOrder, setConfirmedOrder] = useState(null);

    const getInitialCoords = () => {
        try {
            const saved = localStorage.getItem("userCoords");
            if (saved) return JSON.parse(saved);
        } catch (e) { }
        return { lat: 30.7046, lng: 76.7179 };
    };

    // Calculate day-of-week for any Day Number (1..N) based on startDate
    const getDayOfWeekName = useCallback((dayNum) => {
        try {
            const dateObj = new Date(startDate);
            dateObj.setDate(dateObj.getDate() + (dayNum - 1));
            const dayIdx = dateObj.getDay(); // 0 = Sunday, 1 = Monday ... 6 = Saturday
            const mappedDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            return mappedDays[dayIdx] || 'monday';
        } catch {
            return 'monday';
        }
    }, [startDate]);

    // Format weeklyCustomSchedule Array from N-day customized schedule for API compatibility
    const formatWeeklyCustomSchedule = useCallback(() => {
        return DAYS_OF_WEEK.map((dayName) => {
            const dayObj = { dayOfWeek: dayName };

            // Find the dish configured for this day-of-week from dailySchedule
            for (let d = 1; d <= packageDays; d++) {
                if (getDayOfWeekName(d).toLowerCase() === dayName.toLowerCase()) {
                    const cfg = dailySchedule[d] || {};
                    if (selectedMeals.breakfast && cfg.breakfast) dayObj.breakfast = cfg.breakfast;
                    if (selectedMeals.lunch && cfg.lunch) dayObj.lunch = cfg.lunch;
                    if (selectedMeals.dinner && cfg.dinner) dayObj.dinner = cfg.dinner;
                    break;
                }
            }

            // Fallback to Day 1 configuration if empty
            const fallbackCfg = dailySchedule[1] || {};
            if (selectedMeals.breakfast && !dayObj.breakfast && fallbackCfg.breakfast) dayObj.breakfast = fallbackCfg.breakfast;
            if (selectedMeals.lunch && !dayObj.lunch && fallbackCfg.lunch) dayObj.lunch = fallbackCfg.lunch;
            if (selectedMeals.dinner && !dayObj.dinner && fallbackCfg.dinner) dayObj.dinner = fallbackCfg.dinner;

            return dayObj;
        });
    }, [packageDays, selectedMeals, dailySchedule, getDayOfWeekName]);

    // Format universalDeliveryTimes object
    const formatUniversalDeliveryTimes = useCallback(() => {
        const times = {};
        if (selectedMeals.breakfast) times.breakfastTime = universalDeliveryTimes.breakfastTime || "08:30 AM - 09:30 AM";
        if (selectedMeals.lunch) times.lunchTime = universalDeliveryTimes.lunchTime || "12:00 PM - 01:00 PM";
        if (selectedMeals.dinner) times.dinnerTime = universalDeliveryTimes.dinnerTime || "07:00 PM - 08:00 PM";
        return times;
    }, [selectedMeals, universalDeliveryTimes]);

    // Initial Load
    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const [loaderRes, addrRes] = await Promise.all([
                    UserAPI.getCustomTiffinBuilderLoader(),
                    UserAPI.getAddressList().catch(() => null)
                ]);

                if (loaderRes?.success && loaderRes.data) {
                    const data = loaderRes.data;
                    setLoaderData(data);

                    const defaultDishes = {};
                    ['breakfast', 'lunch', 'dinner'].forEach((slot) => {
                        const list = data[slot]?.foodList || [];
                        if (list.length > 0) {
                            defaultDishes[slot] = list[0].id || list[0]._id;
                        }
                    });

                    // Pre-fill days 1 through 30 with default selections
                    const initSchedule = {};
                    for (let i = 1; i <= 30; i++) {
                        initSchedule[i] = { ...defaultDishes };
                    }
                    setDailySchedule(initSchedule);

                    setUniversalDeliveryTimes({
                        breakfastTime: data.breakfast?.deliverySlots?.[0] || '08:30 AM - 09:30 AM',
                        lunchTime: data.lunch?.deliverySlots?.[0] || '12:00 PM - 01:00 PM',
                        dinnerTime: data.dinner?.deliverySlots?.[0] || '07:00 PM - 08:00 PM'
                    });
                }

                if (addrRes?.success && Array.isArray(addrRes.data) && addrRes.data.length > 0) {
                    setSelectedAddress(addrRes.data.find((a) => a.isDefault) || addrRes.data[0]);
                }
            } catch (err) {
                console.error("Custom Builder Load Error:", err);
                if (showNotification) showNotification("Failed to load custom builder data.", "error");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Recalculate Bill API Preview
    const recalculateBill = useCallback(async () => {
        const activeSlotKeys = Object.keys(selectedMeals).filter((s) => selectedMeals[s]);
        if (activeSlotKeys.length === 0 || Object.keys(dailySchedule).length === 0) return;

        setCalculatingBill(true);
        const coords = getInitialCoords();

        try {
            const calculationPayload = {
                packageDays: Number(packageDays),
                startDate,
                dietaryType,
                spiceLevel,
                clinicalNotes: clinicalNotes.trim(),
                selectedMeals,
                universalDeliveryTimes: formatUniversalDeliveryTimes(),
                weeklyCustomSchedule: formatWeeklyCustomSchedule(),
                userLat: coords.lat,
                userLng: coords.lng,
                address: {
                    city: selectedAddress?.city || "Mohali",
                    state: selectedAddress?.state || "Punjab"
                },
                couponCode: appliedCoupon || undefined
            };

            const response = await UserAPI.previewCustomTiffinBill(calculationPayload);
            if (response?.success) {
                setCalculatedData(response);
            }
        } catch (err) {
            console.error("Bill Calculation Error:", err);
        } finally {
            setCalculatingBill(false);
        }
    }, [packageDays, startDate, dietaryType, spiceLevel, clinicalNotes, selectedMeals, dailySchedule, selectedAddress, appliedCoupon, formatUniversalDeliveryTimes, formatWeeklyCustomSchedule]);

    useEffect(() => {
        if (!loading) {
            recalculateBill();
        }
    }, [recalculateBill, loading]);

    // Handle Custom Package Days Input
    const handleDaysChange = (value) => {
        setCustomDaysInput(value);
        const parsed = parseInt(value, 10);
        if (!isNaN(parsed) && parsed > 0) {
            setPackageDays(parsed);

            // Ensure dailySchedule has keys up to parsed
            setDailySchedule((prev) => {
                const updated = { ...prev };
                const sample = prev[1] || {};
                for (let i = 1; i <= parsed; i++) {
                    if (!updated[i]) updated[i] = { ...sample };
                }
                return updated;
            });
        }
    };

    // Toggle Meal Slots
    const handleToggleMealSlot = (slotKey) => {
        setSelectedMeals((prev) => {
            const updated = { ...prev, [slotKey]: !prev[slotKey] };
            const anyActive = Object.values(updated).some(Boolean);
            if (!anyActive) {
                if (showNotification) showNotification("At least 1 meal slot must remain active.", "warning");
                return prev;
            }
            return updated;
        });
    };

    // Day Dish Selection Handler
    const handleSelectDayDish = (dayNumber, slotKey, dishId) => {
        setDailySchedule((prev) => ({
            ...prev,
            [dayNumber]: {
                ...prev[dayNumber],
                [slotKey]: dishId
            }
        }));
    };

    // 1-Week (Days 1-7) Cyclical Sync to remaining days
    const handleSyncWeekOneToAll = () => {
        setDailySchedule((prev) => {
            const updated = { ...prev };
            for (let d = 8; d <= packageDays; d++) {
                const cycleSourceDay = ((d - 1) % 7) + 1;
                updated[d] = { ...(prev[cycleSourceDay] || prev[1]) };
            }
            return updated;
        });

        if (showNotification) {
            showNotification(`Week 1 (Days 1–7) cycle synced to all ${packageDays} days!`, "success");
        }
    };

    // Copy currently selected day to all days
    const handleSyncCurrentDayToAll = () => {
        const currentCfg = dailySchedule[selectedDayNumber] || {};
        setDailySchedule((prev) => {
            const updated = { ...prev };
            for (let d = 1; d <= packageDays; d++) {
                updated[d] = { ...currentCfg };
            }
            return updated;
        });

        if (showNotification) {
            showNotification(`Day ${selectedDayNumber} meals copied across all ${packageDays} days!`, "success");
        }
    };

    const handleDeliveryTimeChange = (paramKey, slotTime) => {
        setUniversalDeliveryTimes((prev) => ({ ...prev, [paramKey]: slotTime }));
    };

    const handleOpenReview = () => {
        if (!selectedAddress) {
            if (showNotification) showNotification("Please select a delivery address.", "warning");
            setIsAddressModalOpen(true);
            return;
        }
        setIsReviewModalOpen(true);
    };

    // Order Creation & Razorpay Gateway
    const handleConfirmOrder = async () => {
        if (!selectedAddress) {
            if (showNotification) showNotification("Please select an address.", "warning");
            setIsAddressModalOpen(true);
            return;
        }

        const coords = getInitialCoords();

        const orderPayload = {
            packageDays: Number(packageDays),
            startDate,
            paymentMethod,
            dietaryType,
            spiceLevel,
            clinicalNotes: clinicalNotes.trim(),
            selectedMeals,
            universalDeliveryTimes: formatUniversalDeliveryTimes(),
            weeklyCustomSchedule: formatWeeklyCustomSchedule(),
            userLat: coords.lat,
            userLng: coords.lng,
            address: {
                name: selectedAddress.name,
                phone: selectedAddress.phone,
                houseNo: selectedAddress.houseNo,
                sector: selectedAddress.sector || "",
                city: selectedAddress.city,
                state: selectedAddress.state,
                pincode: selectedAddress.pincode
            }
        };

        setSubscribing(true);

        try {
            const orderRes = await UserAPI.createCustomTiffinOrder(orderPayload);

            if (!orderRes?.success) {
                throw new Error(orderRes?.message || "Failed to create custom tiffin order.");
            }

            // Online Payment Flow (Razorpay)
            if (orderRes.isOnlinePayment) {
                const loaded = await loadRazorpaySDK();
                if (!loaded) throw new Error("Payment gateway is currently unavailable.");

                const rzp = new window.Razorpay({
                    key: orderRes.key,
                    amount: orderRes.amount,
                    currency: orderRes.currency || "INR",
                    name: "Health Cloud Kitchen",
                    description: `Custom ${packageDays}-Day Tiffin`,
                    order_id: orderRes.razorpayOrderId,
                    prefill: {
                        name: selectedAddress.name,
                        contact: selectedAddress.phone
                    },
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
                            setConfirmedOrder(verifyRes.data || { bookingId: orderRes.bookingId, deliveryOTP: orderRes.data?.deliveryOTP });
                        }
                        setSubscribing(false);
                    },
                    modal: {
                        ondismiss: () => setSubscribing(false)
                    }
                });
                rzp.open();
            } else {
                // COD Flow
                setConfirmedOrder(orderRes.data || { bookingId: orderRes.bookingId, deliveryOTP: orderRes.data?.deliveryOTP });
                setSubscribing(false);
            }
        } catch (err) {
            console.error("Order creation error:", err);
            if (showNotification) showNotification(err.message || "Failed to create order.", "error");
            setSubscribing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fbff]">
                <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={40} />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Loading Custom Tiffin Builder...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-10 max-w-[1100px] mx-auto space-y-8 antialiased select-none text-left">
            
            {/* Modal 1: Address Selector */}
            <AddressModal
                isOpen={isAddressModalOpen}
                onClose={() => setIsAddressModalOpen(false)}
                selectedAddressId={selectedAddress?._id}
                onSelectAddress={(addr) => setSelectedAddress(addr)}
            />

            {/* Modal 2: Final Review & Checkout */}
            <CustomTiffinReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                packageDays={packageDays}
                startDate={startDate}
                dietaryType={dietaryType}
                spiceLevel={spiceLevel}
                clinicalNotes={clinicalNotes}
                selectedAddress={selectedAddress}
                calculatedData={calculatedData}
                calculatingBill={calculatingBill}
                appliedCoupon={appliedCoupon}
                onApplyCoupon={(c) => setAppliedCoupon(c)}
                onRemoveCoupon={() => setAppliedCoupon('')}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                subscribing={subscribing}
                onConfirmOrder={handleConfirmOrder}
                confirmedOrder={confirmedOrder}
                onViewOrderDetails={() => router.push('/otherscreens/tiffinorders')}
                dailySchedule={dailySchedule}
                getDayOfWeekName={getDayOfWeekName}
                loaderData={loaderData}
            />

            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-xs font-extrabold text-slate-400 hover:text-[#3d3f96] uppercase cursor-pointer"
            >
                <ArrowLeft size={16} /> Back to Food Hub
            </button>

            {/* Main Header */}
            <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-[#3d3f96] text-[10px] font-black uppercase px-3 py-1 rounded-xl">
                    <ChefHat size={13} /> Custom Clinical Tiffin Builder
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Build Your Custom Tiffin Package
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Choose your exact package duration on top, configure dishes day-by-day, or sync with a 1-week pattern.
                </p>
            </div>

            {/* Workspace Card */}
            <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-slate-100 shadow-sm space-y-8">
                
                {/* 1. TOP DURATION SELECTION & STARTING DATE (PRIMARY CONTROL) */}
                <div className="space-y-4">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                        Step 1 • Package Duration &amp; Starting Date
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Custom Days Input + Preset Pills */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                                <span>Total Package Days</span>
                                <span className="text-[11px] font-black text-[#3d3f96] font-mono">
                                    {packageDays} Days Active
                                </span>
                            </label>

                            <div className="flex items-center gap-2">
                                {[7, 10, 11, 15, 20, 30].map((days) => (
                                    <button
                                        key={days}
                                        type="button"
                                        onClick={() => {
                                            setPackageDays(days);
                                            setCustomDaysInput(String(days));
                                        }}
                                        className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                                            packageDays === days
                                                ? 'bg-[#3d3f96] text-white border-[#3d3f96] shadow-sm'
                                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                        }`}
                                    >
                                        {days}D
                                    </button>
                                ))}

                                {/* Any Custom Number Input */}
                                <div className="relative w-28">
                                    <input
                                        type="number"
                                        min="1"
                                        max="90"
                                        value={customDaysInput}
                                        onChange={(e) => handleDaysChange(e.target.value)}
                                        placeholder="Days"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-black text-slate-800 text-center outline-none focus:bg-white focus:border-[#3d3f96]"
                                    />
                                    <span className="absolute right-2 top-2.5 text-[9px] font-bold text-slate-400 pointer-events-none">
                                        Days
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Starting Date */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <Calendar size={13} className="text-[#3d3f96]" /> Delivery Starting Date
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96] cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. MEAL SLOTS PICKER, UNIVERSAL DELIVERY TIMES & N-DAY CUSTOMIZATION */}
                <div className="pt-6 border-t border-slate-100">
                    <CustomTiffinSlotsPicker
                        loaderData={loaderData}
                        selectedMeals={selectedMeals}
                        onToggleMealSlot={handleToggleMealSlot}
                        packageDays={packageDays}
                        selectedDayNumber={selectedDayNumber}
                        setSelectedDayNumber={setSelectedDayNumber}
                        dailySchedule={dailySchedule}
                        onSelectDayDish={handleSelectDayDish}
                        onSyncWeekOneToAll={handleSyncWeekOneToAll}
                        onSyncCurrentDayToAll={handleSyncCurrentDayToAll}
                        getDayOfWeekName={getDayOfWeekName}
                        universalDeliveryTimes={universalDeliveryTimes}
                        onDeliveryTimeChange={handleDeliveryTimeChange}
                    />
                </div>

                {/* 3. CLINICAL DIETARY & SPICE PREFERENCES */}
                <div className="space-y-4 pt-6 border-t border-slate-100">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                        Step 4 • Dietary Type &amp; Spice Level
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700">Dietary Category</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { key: 'veg', label: 'Vegetarian' },
                                    { key: 'egg', label: 'Eggetarian' },
                                    { key: 'jain', label: 'Jain Meal' }
                                ].map((d) => (
                                    <button
                                        key={d.key}
                                        type="button"
                                        onClick={() => setDietaryType(d.key)}
                                        className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                                            dietaryType === d.key
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-black'
                                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                        }`}
                                    >
                                        {d.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700">Spice &amp; Salt Level</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { key: 'mild', label: 'Mild Spice' },
                                    { key: 'medium', label: 'Medium' },
                                    { key: 'low-sodium', label: 'Low Sodium' }
                                ].map((s) => (
                                    <button
                                        key={s.key}
                                        type="button"
                                        onClick={() => setSpiceLevel(s.key)}
                                        className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                                            spiceLevel === s.key
                                                ? 'bg-amber-50 text-amber-800 border-amber-300 font-black'
                                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                        }`}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. CLINICAL NOTES */}
                <div className="space-y-2.5 pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
                            <MessageSquareText size={13} className="text-[#3d3f96]" /> Special Clinical Notes for Kitchen
                        </label>
                        <span className="text-[10px] font-bold text-slate-400">Optional</span>
                    </div>
                    <textarea
                        value={clinicalNotes}
                        onChange={(e) => setClinicalNotes(e.target.value)}
                        placeholder="e.g. Keep salt and oil minimal, strictly zero sugar, separate box..."
                        rows={2}
                        maxLength={250}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96] resize-none"
                    />
                </div>

                {/* 5. DELIVERY ADDRESS CARD */}
                <div className="space-y-3 pt-6 border-t border-slate-100">
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

                {/* 6. REVIEW & CHECKOUT BUTTON */}
                <div className="pt-2">
                    <button
                        onClick={handleOpenReview}
                        className="w-full bg-[#3d3f96] hover:bg-[#2F3175] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/10 cursor-pointer"
                    >
                        <span>Review {packageDays}-Day Plan &amp; Pay (₹{calculatedData?.pricing?.grandTotal || calculatedData?.billSummary?.totalAmount || 0})</span>
                        <ArrowRight size={16} />
                    </button>
                </div>

            </div>

            {/* Hygiene Protocol Guarantee */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3">
                <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                <div className="space-y-0.5">
                    <span className="text-xs font-black uppercase text-emerald-800 tracking-wide block">Audited Cloud Kitchen Guarantee</span>
                    <span className="text-xs text-emerald-700/90 font-medium leading-relaxed block">
                        All custom clinical meals are cooked fresh in compliance with dietitian instructions and delivered daily in contactless insulated containers.
                    </span>
                </div>
            </div>

        </div>
    );
}