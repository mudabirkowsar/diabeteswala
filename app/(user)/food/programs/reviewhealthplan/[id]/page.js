"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Utensils,
  Loader2,
  CreditCard,
  Banknote,
  Sun,
  Sunset,
  Moon,
  Plus,
  Phone,
  Tag,
  Target,
  AlertCircle,
  X
} from "lucide-react";
import UserAPI from "../../../../../services/UserAPI";
import AddressModal from "../components/AddressModal";

const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";

const getMediaUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const cleanBackendUrl = BASE_SERVER_URL.endsWith("/") ? BASE_SERVER_URL.slice(0, -1) : BASE_SERVER_URL;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBackendUrl}${cleanPath}`;
};

// Dynamically load Razorpay SDK
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function ReviewHealthPlanPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const planId = resolvedParams?.id;

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculatingBill, setCalculatingBill] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Address State
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // Form Preferences State
  const [startDate, setStartDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [breakfastSlot, setBreakfastSlot] = useState("07:30 AM - 08:30 AM");
  const [lunchSlot, setLunchSlot] = useState("12:30 PM - 01:30 PM");
  const [dinnerSlot, setDinnerSlot] = useState("07:30 PM - 08:30 PM");

  const [paymentMethod, setPaymentMethod] = useState("Online"); // 'Online' | 'COD'
  const [purposeOfBuying, setPurposeOfBuying] = useState("Weight Loss & PCOD Hormonal Balance");
  const [userNote, setUserNote] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponMessage, setCouponMessage] = useState(null);

  // Backend Live Bill Summary
  const [billSummary, setBillSummary] = useState(null);
  const [isCodAvailable, setIsCodAvailable] = useState(true);

  // Get user coordinates
  const getCoordinates = () => {
    if (typeof window !== "undefined") {
      try {
        const savedCoords = localStorage.getItem("userCoords");
        if (savedCoords) {
          const parsed = JSON.parse(savedCoords);
          return {
            userLat: parsed.lat !== undefined ? Number(parsed.lat) : 30.6983,
            userLng: parsed.lng !== undefined ? Number(parsed.lng) : 76.6857
          };
        }
      } catch (e) {
        console.error("Failed to parse coords:", e);
      }
    }
    return { userLat: 30.6983, userLng: 76.6857 };
  };

  // 1. Fetch Plan Details
  useEffect(() => {
    const fetchPlan = async () => {
      if (!planId) return;
      setLoading(true);
      setError(null);
      try {
        const coords = getCoordinates();
        const response = await UserAPI.getSingleHealthyPlanDetails(planId, coords);
        if (response?.success && response?.data) {
          setPlan(response.data);
        } else {
          setError("Health plan details could not be found.");
        }
      } catch (err) {
        console.error("Failed to load plan:", err);
        setError(err?.response?.data?.message || "Failed to load plan details.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [planId]);

  // 2. Fetch User Addresses
  const fetchAddressList = async () => {
    setLoadingAddresses(true);
    try {
      const response = await UserAPI.getAddressList();
      if (response?.success && Array.isArray(response.data)) {
        setAddresses(response.data);
        const defaultAddr = response.data.find((a) => a.isDefault) || response.data[0] || null;
        setSelectedAddress(defaultAddr);
      }
    } catch (err) {
      console.error("Failed to load address list:", err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    fetchAddressList();
  }, []);

  // Build delivery times matching exact API docs: { breakfastTime, lunchTime, dinnerTime }
  const buildDeliveryTimes = () => {
    const times = {};
    if (plan?.dayWiseSchedule?.some((d) => d.breakfast && d.breakfast.length > 0)) {
      times.breakfastTime = breakfastSlot;
    }
    if (plan?.dayWiseSchedule?.some((d) => d.lunch && d.lunch.length > 0)) {
      times.lunchTime = lunchSlot;
    }
    if (plan?.dayWiseSchedule?.some((d) => d.dinner && d.dinner.length > 0)) {
      times.dinnerTime = dinnerSlot;
    }
    return times;
  };

  // 3. Trigger Calculate Bill (POST /api/food/healthy-plans/calculate)
  const triggerCalculateBill = async (couponToApply = appliedCoupon) => {
    if (!planId || !selectedAddress) return;
    setCalculatingBill(true);
    try {
      const coords = getCoordinates();
      const payload = {
        healthyPlanId: planId,
        foodId: plan?.vendorId?._id || undefined,
        startAtThisDate: startDate,
        purposeOfBuying,
        userNote,
        deliveryTimes: buildDeliveryTimes(),
        couponCode: couponToApply || undefined,
        userLat: coords.userLat,
        userLng: coords.userLng,
        address: {
          name: selectedAddress.name,
          phone: selectedAddress.phone,
          houseNo: selectedAddress.houseNo,
          sector: selectedAddress.sector,
          landmark: selectedAddress.landmark,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode,
          addressType: selectedAddress.addressType || "Home"
        }
      };

      const response = await UserAPI.calculateBill(payload);
      if (response?.success && response?.billSummary) {
        setBillSummary(response.billSummary);
        if (response.orderRestrictions) {
          setIsCodAvailable(response.orderRestrictions.isCodAvailable ?? true);
        }
        if (couponToApply) {
          setCouponMessage({ type: "success", text: "Coupon applied successfully!" });
          setAppliedCoupon(couponToApply);
        }
      } else {
        if (couponToApply) {
          setCouponMessage({ type: "error", text: response?.message || "Invalid coupon code." });
          setAppliedCoupon("");
        }
      }
    } catch (err) {
      console.error("Calculate Bill Error:", err);
      if (couponToApply) {
        setCouponMessage({ type: "error", text: err?.response?.data?.message || "Coupon cannot be applied." });
        setAppliedCoupon("");
      }
    } finally {
      setCalculatingBill(false);
    }
  };

  // Re-calculate bill whenever start date, address, or delivery times change
  useEffect(() => {
    if (plan && startDate && selectedAddress) {
      triggerCalculateBill(appliedCoupon);
    }
  }, [plan, startDate, selectedAddress, breakfastSlot, lunchSlot, dinnerSlot]);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    triggerCalculateBill(couponCode.trim());
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setAppliedCoupon("");
    setCouponMessage(null);
    triggerCalculateBill("");
  };

  // 4. Subscribe / Buy Plan (POST /api/food/healthy-plans/subscribe & verify-payment)
  const handleSubscribeAndPay = async () => {
    if (!selectedAddress) {
      alert("Please select a delivery address.");
      setIsAddressModalOpen(true);
      return;
    }
    if (!startDate) {
      alert("Please select a start date.");
      return;
    }

    setSubmitting(true);
    try {
      const coords = getCoordinates();
      const payload = {
        healthyPlanId: planId,
        startAtThisDate: startDate,
        paymentMethod,
        purposeOfBuying,
        userNote,
        deliveryTimes: buildDeliveryTimes(),
        couponCode: appliedCoupon || undefined,
        userLat: coords.userLat,
        userLng: coords.userLng,
        address: {
          name: selectedAddress.name,
          phone: selectedAddress.phone,
          houseNo: selectedAddress.houseNo,
          sector: selectedAddress.sector,
          landmark: selectedAddress.landmark,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode,
          addressType: selectedAddress.addressType || "Home"
        }
      };

      const res = await UserAPI.subscribePlan(payload);

      if (!res?.success) {
        alert(res?.message || "Failed to create subscription order.");
        setSubmitting(false);
        return;
      }

      // COD Flow
      if (paymentMethod === "COD" || res.isOnlinePayment === false) {
        alert(res.message || "🎉 Healthy Diet Plan activated successfully (COD)!");
        router.push("/food/programs");
        return;
      }

      // Online Razorpay Flow (Fixed: Read key and order params from root level)
      if (paymentMethod === "Online" || res.isOnlinePayment === true) {
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          alert("Unable to load Razorpay payment gateway. Please check your internet connection.");
          setSubmitting(false);
          return;
        }

        // Direct Root Level Values from Documentation
        const razorpayKey = res.key || res.data?.key;
        const razorpayOrderId = res.razorpayOrderId || res.data?.razorpayOrderId;
        const bookingId = res.bookingId || res.data?.bookingId || res.orderId || res.data?._id;
        const amount = res.amount || (res.amountInRupees ? res.amountInRupees * 100 : undefined);

        if (!razorpayKey) {
          alert("Razorpay payment key is missing in response. Please try again.");
          setSubmitting(false);
          return;
        }

        const options = {
          key: razorpayKey,
          amount: amount,
          currency: res.currency || "INR",
          name: "Healthy Meal Subscription",
          description: `${plan.title} (${plan.daysCount} Days)`,
          image: getMediaUrl(plan.bannerImage || plan.images?.[0]),
          order_id: razorpayOrderId,
          handler: async function (response) {
            try {
              const verifyPayload = {
                bookingId: bookingId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              };

              const verifyRes = await UserAPI.verifyPayment(verifyPayload);

              if (verifyRes?.success) {
                alert("🎉 " + (verifyRes?.message || "Payment verified successfully & Healthy Diet Plan is now Active!"));
                router.push("/food/programs");
              } else {
                alert(verifyRes?.message || "Payment verification failed. Please contact support.");
              }
            } catch (vErr) {
              console.error("Payment Verification Error:", vErr);
              alert(vErr?.response?.data?.message || "Payment verification failed.");
            } finally {
              setSubmitting(false);
            }
          },
          prefill: {
            name: selectedAddress?.name || "",
            contact: selectedAddress?.phone || ""
          },
          theme: {
            color: "#3d3f96"
          },
          modal: {
            ondismiss: function () {
              setSubmitting(false);
            }
          }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      }
    } catch (err) {
      console.error("Subscription Error:", err);
      alert(err?.response?.data?.message || "Failed to complete subscription. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6">
        <Loader2 className="w-12 h-12 animate-spin text-[#3d3f96]" />
        <p className="mt-4 text-slate-700 font-bold text-sm tracking-wide">
          Loading your plan review...
        </p>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 max-w-md w-full text-center shadow-lg">
          <h2 className="text-xl font-black text-slate-800">Review Unavailable</h2>
          <p className="text-slate-500 text-xs mt-2">{error || "Unable to proceed with review."}</p>
          <Link
            href={`/food/programs/plandetail/${planId || ""}`}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-[#3d3f96] text-white rounded-xl text-xs font-bold hover:bg-[#32347d] transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Plan Details
          </Link>
        </div>
      </div>
    );
  }

  // Meal Checks
  const hasBreakfast = plan.dayWiseSchedule?.some((d) => d.breakfast && d.breakfast.length > 0);
  const hasLunch = plan.dayWiseSchedule?.some((d) => d.lunch && d.lunch.length > 0);
  const hasDinner = plan.dayWiseSchedule?.some((d) => d.dinner && d.dinner.length > 0);
  const activeSlotsCount = [hasBreakfast, hasLunch, hasDinner].filter(Boolean).length;

  // Pricing values mapped directly from API Documentation
  const fallbackPricing = plan.pricing || {};
  const displayItemTotal = billSummary?.itemTotal ?? fallbackPricing.totalPrice ?? 0;
  const displayDeliveryCharge = billSummary?.deliveryCharge ?? 0;
  const displayPackagingCharge = billSummary?.packagingCharge ?? 0;
  const displayTaxAmount = billSummary?.taxAmount ?? 0;
  const displayCouponDiscount = billSummary?.couponDiscount ?? 0;
  const displayTotalAmount = billSummary?.totalAmount ?? fallbackPricing.discountTotalPrice ?? displayItemTotal;
  const displaySavings = billSummary?.savingsAmount ?? (displayItemTotal > displayTotalAmount ? displayItemTotal - displayTotalAmount : 0);

  const formatFullAddress = (addr) => {
    if (!addr) return "";
    const parts = [addr.houseNo, addr.sector, addr.landmark && `Near ${addr.landmark}`, addr.city, addr.state, addr.pincode].filter(Boolean);
    return parts.join(", ");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24">
      
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href={`/food/programs/plandetail/${planId}`}
            className="inline-flex items-center gap-2 text-xs font-black text-slate-700 hover:text-[#3d3f96] transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Plan Details
          </Link>
          <div className="text-center">
            <h1 className="text-base sm:text-lg font-black text-slate-900">Review & Customize Subscription</h1>
            <p className="text-[11px] text-slate-500 font-semibold">Delivery & Schedule Setup</p>
          </div>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Columns: Plan Customization & Preferences */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Selected Plan Summary Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-5 items-start sm:items-center">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-900 overflow-hidden flex-shrink-0 relative">
                <img
                  src={getMediaUrl(plan.bannerImage || plan.images?.[0])}
                  alt={plan.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  {plan.subCategory && (
                    <span className="px-2.5 py-0.5 bg-[#3d3f96]/10 text-[#3d3f96] text-[10px] font-black rounded-md uppercase">
                      {plan.subCategory}
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md">
                    {plan.daysCount} Days Schedule
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900">{plan.title}</h3>
                <p className="text-xs text-slate-500 font-medium line-clamp-1">{plan.tagline}</p>
                
                {plan.vendorId && (
                  <p className="text-xs text-slate-600 font-semibold flex items-center gap-1 pt-1">
                    <Utensils className="w-3.5 h-3.5 text-[#3d3f96]" />
                    Prepared fresh by: <span className="font-extrabold text-slate-900">{plan.vendorId.name}</span>
                  </p>
                )}
              </div>
            </div>

            {/* 1. Start Date Selector */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">Program Start Date</h4>
                  <p className="text-xs text-slate-500 font-medium">Choose when your first meal delivery should begin</p>
                </div>
              </div>

              <div className="pt-2">
                <input
                  type="date"
                  value={startDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full sm:w-72 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:border-[#3d3f96] transition cursor-pointer"
                />
              </div>
            </div>

            {/* 2. Conditional Meal Delivery Time Preferences */}
            {activeSlotsCount > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900">Delivery Time Slots</h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Set preferred arrival times for included meals
                    </p>
                  </div>
                </div>

                <div className={`grid grid-cols-1 ${activeSlotsCount === 1 ? 'sm:grid-cols-1' : activeSlotsCount === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-4 pt-2`}>
                  
                  {hasBreakfast && (
                    <div className="bg-amber-50/50 border border-amber-200/80 p-4 rounded-2xl space-y-2">
                      <div className="flex items-center gap-1.5 text-amber-900 font-black text-xs">
                        <Sun className="w-4 h-4 text-amber-600" />
                        <span>Breakfast Delivery</span>
                      </div>
                      <select
                        value={breakfastSlot}
                        onChange={(e) => setBreakfastSlot(e.target.value)}
                        className="w-full p-2.5 bg-white border border-amber-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-400"
                      >
                        <option>07:00 AM - 08:00 AM</option>
                        <option>07:30 AM - 08:30 AM</option>
                        <option>08:00 AM - 09:00 AM</option>
                        <option>09:00 AM - 10:00 AM</option>
                      </select>
                    </div>
                  )}

                  {hasLunch && (
                    <div className="bg-emerald-50/50 border border-emerald-200/80 p-4 rounded-2xl space-y-2">
                      <div className="flex items-center gap-1.5 text-emerald-900 font-black text-xs">
                        <Sunset className="w-4 h-4 text-emerald-600" />
                        <span>Lunch Delivery</span>
                      </div>
                      <select
                        value={lunchSlot}
                        onChange={(e) => setLunchSlot(e.target.value)}
                        className="w-full p-2.5 bg-white border border-emerald-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-400"
                      >
                        <option>12:00 PM - 01:00 PM</option>
                        <option>12:30 PM - 01:30 PM</option>
                        <option>01:00 PM - 02:00 PM</option>
                        <option>02:00 PM - 03:00 PM</option>
                      </select>
                    </div>
                  )}

                  {hasDinner && (
                    <div className="bg-indigo-50/50 border border-indigo-200/80 p-4 rounded-2xl space-y-2">
                      <div className="flex items-center gap-1.5 text-indigo-900 font-black text-xs">
                        <Moon className="w-4 h-4 text-[#3d3f96]" />
                        <span>Dinner Delivery</span>
                      </div>
                      <select
                        value={dinnerSlot}
                        onChange={(e) => setDinnerSlot(e.target.value)}
                        className="w-full p-2.5 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#3d3f96]"
                      >
                        <option>07:00 PM - 08:00 PM</option>
                        <option>07:30 PM - 08:30 PM</option>
                        <option>08:00 PM - 09:00 PM</option>
                        <option>09:00 PM - 10:00 PM</option>
                      </select>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* 3. Doorstep Delivery Address */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#3d3f96] border border-indigo-200 flex items-center justify-center font-bold">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900">Doorstep Delivery Address</h4>
                    <p className="text-xs text-slate-500 font-medium">Daily packages will be delivered here</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(true)}
                  className="px-4 py-2 bg-[#3d3f96]/10 hover:bg-[#3d3f96] text-[#3d3f96] hover:text-white rounded-xl text-xs font-black transition-all cursor-pointer"
                >
                  {selectedAddress ? "Change" : "Select Address"}
                </button>
              </div>

              {loadingAddresses ? (
                <div className="p-6 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-500 gap-2 text-xs font-bold">
                  <Loader2 className="w-4 h-4 animate-spin text-[#3d3f96]" />
                  Loading your addresses...
                </div>
              ) : selectedAddress ? (
                <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-[#3d3f96] text-white text-[10px] font-black rounded-md uppercase">
                        {selectedAddress.addressType || "Home"}
                      </span>
                      <span className="text-xs font-black text-slate-900">{selectedAddress.name}</span>
                      {selectedAddress.isDefault && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                          Default
                        </span>
                      )}
                    </div>

                    {selectedAddress.phone && (
                      <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {selectedAddress.phone}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    {formatFullAddress(selectedAddress)}
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(true)}
                  className="w-full p-6 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-[#3d3f96] hover:text-[#3d3f96] transition cursor-pointer"
                >
                  <Plus className="w-6 h-6 mb-1" />
                  <span className="text-xs font-black">No Delivery Address Selected</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">Click here to choose or add an address</span>
                </button>
              )}
            </div>

            {/* 4. Purpose of Buying & Kitchen Instructions */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 border border-violet-200 flex items-center justify-center font-bold">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">Goal & Kitchen Instructions</h4>
                  <p className="text-xs text-slate-500 font-medium">Help the chef personalize your meal preparation</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="text-[11px] font-black text-slate-600 uppercase">Primary Goal</label>
                  <select
                    value={purposeOfBuying}
                    onChange={(e) => setPurposeOfBuying(e.target.value)}
                    className="w-full mt-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option>Weight Loss & PCOD Hormonal Balance</option>
                    <option>Muscle Gain & High Protein</option>
                    <option>Clean Daily Eating</option>
                    <option>Medical / Low Sodium</option>
                    <option>General Well-being</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-600 uppercase">Kitchen / Delivery Note (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Please use minimum oil in dinner and make food mild spicy"
                    value={userNote}
                    onChange={(e) => setUserNote(e.target.value)}
                    className="w-full mt-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#3d3f96]"
                  />
                </div>
              </div>
            </div>

            {/* 5. Payment Method Selection */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#3d3f96]/10 text-[#3d3f96] border border-[#3d3f96]/20 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">Select Payment Method</h4>
                  <p className="text-xs text-slate-500 font-medium">Choose your preferred payment mode</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                
                {/* Online Payment Card */}
                <div
                  onClick={() => setPaymentMethod("Online")}
                  className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between ${
                    paymentMethod === "Online"
                      ? "border-[#3d3f96] bg-[#3d3f96]/5"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      paymentMethod === "Online" ? "bg-[#3d3f96] text-white" : "bg-slate-100 text-slate-600"
                    }`}>
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">Online Payment</div>
                      <div className="text-[10px] text-slate-500 font-semibold">UPI, Cards, NetBanking (Razorpay)</div>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === "Online" ? "border-[#3d3f96] bg-[#3d3f96]" : "border-slate-300"
                  }`}>
                    {paymentMethod === "Online" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>

                {/* Cash on Delivery Card */}
                {isCodAvailable && (
                  <div
                    onClick={() => setPaymentMethod("COD")}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between ${
                      paymentMethod === "COD"
                        ? "border-[#3d3f96] bg-[#3d3f96]/5"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        paymentMethod === "COD" ? "bg-[#3d3f96] text-white" : "bg-slate-100 text-slate-600"
                      }`}>
                        <Banknote className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900">Cash on Delivery</div>
                        <div className="text-[10px] text-slate-500 font-semibold">Pay at first delivery drop</div>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === "COD" ? "border-[#3d3f96] bg-[#3d3f96]" : "border-slate-300"
                    }`}>
                      {paymentMethod === "COD" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>

          {/* Right 1 Column: Live Calculated Billing Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl sticky top-24 space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-base font-black text-slate-900">
                  Bill Summary
                </h4>
                {calculatingBill && (
                  <span className="text-[10px] text-[#3d3f96] font-bold flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Updating...
                  </span>
                )}
              </div>

              {/* Coupon Code Box */}
              <div className="space-y-2">
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      placeholder="e.g. SORRY40"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 uppercase focus:outline-none focus:border-[#3d3f96]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!couponCode.trim() || calculatingBill}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-[#3d3f96] disabled:opacity-40 text-white rounded-xl text-xs font-black transition cursor-pointer"
                  >
                    Apply
                  </button>
                </form>

                {appliedCoupon && (
                  <div className="flex items-center justify-between px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] font-black text-emerald-800">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" /> Coupon '{appliedCoupon}' Applied
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-slate-400 hover:text-rose-600 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {couponMessage && !appliedCoupon && (
                  <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" /> {couponMessage.text}
                  </p>
                )}
              </div>

              {/* Itemized Calculations */}
              <div className="space-y-3 text-xs font-medium text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Item Total</span>
                  <span className="font-bold text-slate-800">₹{displayItemTotal}</span>
                </div>

                {displaySavings > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 font-bold">
                    <span>Plan Savings</span>
                    <span>- ₹{displaySavings}</span>
                  </div>
                )}

                {displayCouponDiscount > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 font-bold">
                    <span>Coupon Discount</span>
                    <span>- ₹{displayCouponDiscount}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span>Delivery Charge</span>
                  <span className="text-emerald-600 font-extrabold uppercase">
                    {displayDeliveryCharge > 0 ? `₹${displayDeliveryCharge}` : "Free"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Packaging & Taxes</span>
                  <span className="font-bold text-slate-800">
                    ₹{displayPackagingCharge + displayTaxAmount}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between text-slate-900">
                  <span className="text-sm font-black">Total Payable Amount</span>
                  <span className="text-2xl font-black text-[#3d3f96]">₹{displayTotalAmount}</span>
                </div>
              </div>

              {displaySavings > 0 && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="text-[11px] font-black text-emerald-800">
                    You are saving ₹{displaySavings + displayCouponDiscount} on this healthy subscription!
                  </span>
                </div>
              )}

              <button
                onClick={handleSubscribeAndPay}
                disabled={submitting || calculatingBill}
                className="w-full py-4 bg-[#3d3f96] hover:bg-[#32347d] text-white rounded-2xl text-sm font-black shadow-lg shadow-[#3d3f96]/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Subscription...</span>
                  </>
                ) : paymentMethod === "Online" ? (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Pay ₹{displayTotalAmount} Online</span>
                  </>
                ) : (
                  <>
                    <Banknote className="w-4 h-4" />
                    <span>Confirm Order (COD) — ₹{displayTotalAmount}</span>
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <span className="text-[11px] font-bold text-slate-400 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  100% Safe & Secure Encrypted Checkout
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Address Selection Modal */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        addresses={addresses}
        selectedAddress={selectedAddress}
        onSelectAddress={(addr) => {
          setSelectedAddress(addr);
          setIsAddressModalOpen(false);
        }}
      />

    </div>
  );
}