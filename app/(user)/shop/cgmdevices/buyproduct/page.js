'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ShieldCheck,
  Truck,
  CreditCard,
  Lock,
  Plus,
  Minus,
  Sparkles,
  Loader2,
  PackageCheck,
  ChevronDown,
  Zap,
  Activity,
  ShoppingBag,
  CheckCircle,
  ArrowRight,
  Tag,
  Video,
  Home
} from 'lucide-react';
import UserAPI from '../../../../services/UserAPI';
import { useNotification } from '../../../../context/NotificationContext';

// Import Modular Subcomponents
import ChooseAddress from './components/ChooseAddress';
import ChooseCoachAndSlot from './components/ChooseCoachAndSlot';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

const DIABETES_TYPES = [
  'Type 1',
  'Type 2',
  'Pre-diabetic',
  'Gestational',
  'General Wellness',
  'Not Sure'
];

// Helper to dynamically load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function BuyProductCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  const { showNotification } = useNotification?.() || {};

  // Retrieve Stored User Coordinates with default fallback
  const getInitialCoords = () => {
    let lat = 30.698383813970036;
    let lng = 76.68573589283919;

    if (typeof window !== 'undefined') {
      const savedCoords = localStorage.getItem('userCoords');
      if (savedCoords) {
        try {
          const parsed = JSON.parse(savedCoords);
          if (parsed.lat !== undefined && parsed.lng !== undefined) {
            lat = Number(parsed.lat);
            lng = Number(parsed.lng);
          }
        } catch (e) {
          console.error('Error reading stored user coordinates:', e);
        }
      }
    }
    return { lat, lng };
  };

  // Core Product Checkout State
  const [checkoutItem, setCheckoutItem] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [calculatingBill, setCalculatingBill] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Health Profile Questionnaire
  const [isDiabetic, setIsDiabetic] = useState('yes');
  const [diabetesType, setDiabetesType] = useState('Type 2');
  const [hasUsedBefore, setHasUsedBefore] = useState(false);

  // Coach Consultation Modular State (Online vs Offline / Home Visit)
  const [includeCoachCharge, setIncludeCoachCharge] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [consultationMode, setConsultationMode] = useState('Online'); // 'Online' | 'Offline'
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Add-ons
  const [availableAddons, setAvailableAddons] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState({});

  // Delivery Address Modular State
  const [selectedDeliveryAddress, setSelectedDeliveryAddress] = useState(null);

  // User location for coach discovery
  const [userLocation, setUserLocation] = useState(getInitialCoords);

  // Payment Options
  const [paymentMethod, setPaymentMethod] = useState('Online');

  // Calculated Backend Bill Breakdown
  const [billSummary, setBillSummary] = useState(null);

  // Order Success Screen State
  const [orderSuccessData, setOrderSuccessData] = useState(null);

  // Helper for safe image URLs
  const getImageSrc = (imgPath) => {
    if (!imgPath) {
      return 'https://images.unsplash.com/photo-1583947581924-860bda6a26df?q=80&w=800&auto=format&fit=crop';
    }
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
      return imgPath;
    }
    return `${BASE_URL}${imgPath}`;
  };

  // 1. Initial Load: Retrieve Product & Add-ons
  useEffect(() => {
    const initializeCheckout = async () => {
      try {
        setPageLoading(true);

        let currentItem = null;
        if (typeof window !== 'undefined') {
          const stored = sessionStorage.getItem('cgm_checkout_item');
          if (stored) {
            currentItem = JSON.parse(stored);
            setCheckoutItem(currentItem);
          }
        }

        const coords = getInitialCoords();
        setUserLocation(coords);

        if (!currentItem && productId) {
          const res = await UserAPI.getUserCgmProductDetailsById(productId);
          if (res && res.data) {
            const item = res.data;
            const defaultVar =
              item.cgmConfig?.cgmPacks?.[0] ||
              item.glucometerConfig?.stripLancetVariants?.[0] ||
              item.variants?.[0] ||
              null;

            currentItem = {
              productId: item._id,
              productTitle: item.title,
              productBrand: item.brand,
              productType: item.productType,
              categoryName: item.categoryId?.name,
              mainImage: item.mainImage,
              badge: item.badge,
              selectedVariant: defaultVar
                ? {
                    _id: defaultVar._id,
                    displayName: defaultVar.packName || defaultVar.variantName || 'Standard',
                    sellingPrice: defaultVar.sellingPrice,
                    mrp: defaultVar.mrp,
                    savingsAmount: defaultVar.savingsAmount
                  }
                : null,
              quantity: 1,
              unitSellingPrice: defaultVar?.sellingPrice || item.sellingPrice,
              unitMrp: defaultVar?.mrp || item.mrp,
              totalSellingPrice: defaultVar?.sellingPrice || item.sellingPrice,
              totalMrp: defaultVar?.mrp || item.mrp,
              totalSavings: defaultVar?.savingsAmount || item.savingsAmount || 0,
              cgmConfig: item.cgmConfig
            };
            setCheckoutItem(currentItem);
          }
        }

        const addonsRes = await UserAPI.getCgmAddOns();
        if (addonsRes && addonsRes.data && Array.isArray(addonsRes.data)) {
          setAvailableAddons(addonsRes.data);
        }
      } catch (err) {
        console.error('Error initializing checkout data:', err);
        if (showNotification) {
          showNotification('Error initializing checkout. Please try again.', 'error');
        }
      } finally {
        setPageLoading(false);
      }
    };

    initializeCheckout();
  }, [productId, showNotification]);

  // 2. Format Add-ons
  const formattedAddonsPayload = useMemo(() => {
    return Object.entries(selectedAddons)
      .filter(([_, qty]) => qty > 0)
      .map(([addonId, qty]) => ({
        addonId,
        quantity: qty
      }));
  }, [selectedAddons]);

  // 3. Dynamic Live Bill Preview API Call
  const calculateBill = useCallback(async () => {
    if (!checkoutItem?.productId) return;
    try {
      setCalculatingBill(true);

      const billPayload = {
        deviceId: checkoutItem.productId,
        variantId: checkoutItem.selectedVariant?._id || undefined,
        quantity: checkoutItem.quantity || 1,
        includeCoachCharge,
        coachChargeId: selectedCoach?._id || undefined,
        consultationMode: includeCoachCharge ? consultationMode : undefined,
        scheduledDate: selectedSlot?.date || undefined,
        slotTime: selectedSlot?.slotTime || undefined,
        addons: formattedAddonsPayload
      };

      const res = await UserAPI.calculateCgmOrderBill(billPayload);
      if (res && res.data) {
        setBillSummary(res.data);
      }
    } catch (err) {
      console.error('Bill calculation error:', err);
    } finally {
      setCalculatingBill(false);
    }
  }, [checkoutItem, includeCoachCharge, selectedCoach, consultationMode, selectedSlot, formattedAddonsPayload]);

  useEffect(() => {
    if (checkoutItem) {
      calculateBill();
    }
  }, [calculateBill, checkoutItem]);

  // Handle Quantity adjustments
  const handleQuantityChange = (newQty) => {
    if (newQty < 1 || newQty > 10) return;
    setCheckoutItem((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        quantity: newQty,
        totalSellingPrice: prev.unitSellingPrice * newQty,
        totalMrp: prev.unitMrp ? prev.unitMrp * newQty : null
      };
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('cgm_checkout_item', JSON.stringify(updated));
      }
      return updated;
    });
  };

  // Add-ons stepper
  const handleToggleAddon = (addonId) => {
    setSelectedAddons((prev) => {
      const current = prev[addonId] || 0;
      if (current > 0) {
        const copy = { ...prev };
        delete copy[addonId];
        return copy;
      }
      return { ...prev, [addonId]: 1 };
    });
  };

  const handleAddonQty = (addonId, delta) => {
    setSelectedAddons((prev) => {
      const current = prev[addonId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[addonId];
        return copy;
      }
      return { ...prev, [addonId]: next };
    });
  };

  /* ========================================================================
     EXACT MATHEMATICALLY VERIFIED BILL BREAKDOWN
     Device Price + Coach Fee (Online / Offline) + Slot Extra Fee + Add-ons
     ======================================================================== */
  const deviceTotal = billSummary?.pricingBreakdown?.itemTotal ?? checkoutItem?.totalSellingPrice ?? 0;
  const mrpTotal = billSummary?.pricingBreakdown?.mrpTotal ?? checkoutItem?.totalMrp ?? 0;
  const instantDeviceSavings = mrpTotal > deviceTotal ? mrpTotal - deviceTotal : 0;

  // Add-ons total
  const addonsTotal = useMemo(() => {
    if (billSummary?.pricingBreakdown?.addonsTotal !== undefined) {
      return Number(billSummary.pricingBreakdown.addonsTotal);
    }
    return formattedAddonsPayload.reduce((sum, item) => {
      const addon = availableAddons.find((a) => a._id === item.addonId);
      return sum + (addon ? Number(addon.price) * item.quantity : 0);
    }, 0);
  }, [billSummary, formattedAddonsPayload, availableAddons]);

  // Coach Fee based on consultationMode ('Online' vs 'Offline')
  const coachBaseFee = useMemo(() => {
    if (!includeCoachCharge || !selectedCoach) return 0;
    if (consultationMode === 'Offline') {
      return (
        selectedCoach.pricing?.totalEstimatedOfflineFee ||
        selectedCoach.fees?.offline ||
        (selectedCoach.pricing?.offlineBaseFee || 599) + (selectedCoach.pricing?.extraDistanceFee || 0)
      );
    }
    return selectedCoach.pricing?.onlineFee || selectedCoach.fees?.online || selectedCoach.price || 299;
  }, [includeCoachCharge, selectedCoach, consultationMode]);

  // Peak / Premium Slot Extra Fee
  const slotExtraFee = includeCoachCharge && selectedSlot?.extraFee ? Number(selectedSlot.extraFee || 0) : 0;

  // Final 100% Mathematically Correct Total Payable
  const finalPayableAmount = useMemo(() => {
    return deviceTotal + coachBaseFee + slotExtraFee + addonsTotal;
  }, [deviceTotal, coachBaseFee, slotExtraFee, addonsTotal]);

  // 4. Place Order Handler (Razorpay Online & Cash on Delivery)
  const handlePlaceOrder = async (e) => {
    if (e) e.preventDefault();

    if (
      !selectedDeliveryAddress?.name?.trim() ||
      !selectedDeliveryAddress?.phone?.trim() ||
      !selectedDeliveryAddress?.houseNo?.trim() ||
      !selectedDeliveryAddress?.city?.trim() ||
      !selectedDeliveryAddress?.pincode?.trim()
    ) {
      if (showNotification) {
        showNotification('Please select or provide complete delivery address details.', 'error');
      }
      return;
    }

    try {
      setPlacingOrder(true);

      const orderPayload = {
        deviceId: checkoutItem.productId,
        variantId: checkoutItem.selectedVariant?._id || undefined,
        quantity: checkoutItem.quantity || 1,
        diabetesProfile: {
          diabetesType:
            isDiabetic === 'no'
              ? 'General Wellness'
              : isDiabetic === 'pre-diabetic'
              ? 'Pre-diabetic'
              : diabetesType,
          hasUsedBefore: Boolean(hasUsedBefore)
        },
        includeCoachCharge,
        coachChargeId: selectedCoach?._id || undefined,
        consultationDetails: includeCoachCharge && selectedCoach
          ? {
              coachId: selectedCoach._id,
              consultationMode, // 'Online' | 'Offline'
              scheduledDate: selectedSlot?.date || undefined,
              slotTime: selectedSlot?.slotTime || undefined,
              displayTime: selectedSlot?.displayTime || undefined,
              coachFee: coachBaseFee,
              slotExtraFee
            }
          : undefined,
        addons: formattedAddonsPayload,
        paymentMethod,
        deliveryAddress: selectedDeliveryAddress,
        totalAmount: finalPayableAmount
      };

      const res = await UserAPI.placeCgmOrder(orderPayload);

      if (res && res.success) {
        // CASE A: Razorpay Online Payment Flow
        if (res.isOnlinePayment && res.razorpayOrderId) {
          const isScriptLoaded = await loadRazorpayScript();

          if (!isScriptLoaded) {
            if (showNotification) {
              showNotification('Razorpay SDK failed to load. Please check your connection.', 'error');
            }
            setPlacingOrder(false);
            return;
          }

          const options = {
            key: res.key_id,
            amount: res.amount || finalPayableAmount * 100,
            currency: 'INR',
            name: 'DiabetesWala',
            description: `Order ${res.orderId}`,
            image: getImageSrc(checkoutItem.mainImage),
            order_id: res.razorpayOrderId,
            handler: async (response) => {
              try {
                const verifyRes = await UserAPI.verifyCgmPayment({
                  orderId: res.orderId,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature
                });

                if (verifyRes && verifyRes.success) {
                  if (typeof window !== 'undefined') {
                    sessionStorage.removeItem('cgm_checkout_item');
                  }
                  setOrderSuccessData({
                    orderId: res.orderId,
                    isOnlinePayment: true,
                    amountPaid: finalPayableAmount
                  });
                } else {
                  throw new Error(verifyRes?.message || 'Payment verification failed.');
                }
              } catch (verifyErr) {
                console.error('Payment verification error:', verifyErr);
                if (showNotification) {
                  showNotification(verifyErr?.message || 'Payment verification failed.', 'error');
                }
              }
            },
            prefill: {
              name: selectedDeliveryAddress.name,
              contact: selectedDeliveryAddress.phone
            },
            theme: {
              color: '#3d3f96'
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          // CASE B: Cash on Delivery (COD)
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('cgm_checkout_item');
          }
          setOrderSuccessData({
            orderId: res.orderId,
            deliveryOtp: res.deliveryOtp,
            isOnlinePayment: false,
            amountPaid: finalPayableAmount
          });
        }
      } else {
        throw new Error(res?.message || 'Unable to place order.');
      }
    } catch (err) {
      console.error('Order submission error:', err);
      if (showNotification) {
        showNotification(err?.message || 'Failed to complete order. Please try again.', 'error');
      }
    } finally {
      setPlacingOrder(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center gap-2.5 px-4 text-center">
        <Loader2 className="animate-spin text-[#3d3f96]" size={36} />
        <p className="text-xs sm:text-sm font-semibold text-slate-500">
          Preparing checkout preferences & bill preview...
        </p>
      </div>
    );
  }

  if (!checkoutItem) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-indigo-50 text-[#3d3f96] rounded-2xl sm:rounded-3xl flex items-center justify-center mb-3 sm:mb-4">
          <PackageCheck size={28} />
        </div>
        <h2 className="text-lg sm:text-2xl font-black text-slate-900 mb-1.5">No Product in Checkout</h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xs sm:max-w-md mb-5">
          Please select a CGM device or glucometer to proceed with your order.
        </p>
        <button
          onClick={() => router.push('/shop')}
          className="px-5 py-2.5 bg-[#3d3f96] text-white rounded-xl font-bold text-xs sm:text-sm shadow-md hover:bg-slate-900 transition-all cursor-pointer"
        >
          Explore Store
        </button>
      </div>
    );
  }

  const isCgm = checkoutItem.productType === 'CGM' || checkoutItem.categoryName?.toLowerCase().includes('cgm');

  return (
    <div className="min-h-screen bg-slate-50/60 pb-28 text-slate-800 antialiased selection:bg-[#3d3f96] selection:text-white">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none -z-10" />

      {/* Top Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-[#3d3f96] transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 group-hover:bg-indigo-50 flex items-center justify-center transition-colors">
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span>Back</span>
          </button>

          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 sm:px-3 py-1 rounded-full">
            <Lock size={12} />
            <span className="hidden sm:inline">256-Bit SSL Encrypted Checkout</span>
            <span className="sm:hidden">Secure Checkout</span>
          </div>
        </div>
      </header>

      {/* Main Checkout Area */}
      <main className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 pt-4 sm:pt-8">
        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 items-start">
            
            {/* ================= LEFT COLUMN: DETAILS & CUSTOMIZATIONS (7 COLS) ================= */}
            <div className="lg:col-span-7 space-y-3.5 sm:space-y-6">
              
              {/* 1. PRODUCT SUMMARY CARD */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-slate-200/80 shadow-xs space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between pb-2 sm:pb-3 border-b border-slate-100">
                  <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <ShoppingBag size={12} className="text-[#3d3f96]" /> Selected Order Item
                  </h3>
                  <span className="text-[9px] sm:text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded">
                    100% Genuine
                  </span>
                </div>

                <div className="flex items-start gap-2.5 sm:gap-4">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 shrink-0 flex items-center justify-center overflow-hidden">
                    <img
                      src={getImageSrc(checkoutItem.mainImage)}
                      alt={checkoutItem.productTitle}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5 sm:space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] sm:text-[10px] font-black uppercase text-[#3d3f96] bg-indigo-50 px-1.5 sm:px-2 py-0.5 rounded">
                        {checkoutItem.productBrand || 'DiabetesWala'}
                      </span>
                      {checkoutItem.selectedVariant && (
                        <span className="text-[9px] sm:text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 sm:px-2 py-0.5 rounded truncate max-w-[130px] sm:max-w-[150px]">
                          {checkoutItem.selectedVariant.displayName}
                        </span>
                      )}
                    </div>

                    <h2 className="text-xs sm:text-base font-extrabold text-slate-900 line-clamp-2 leading-tight">
                      {checkoutItem.productTitle}
                    </h2>

                    <div className="flex items-center justify-between pt-1 sm:pt-2">
                      <div className="flex items-baseline gap-1.5 sm:gap-2">
                        <span className="text-sm sm:text-lg font-black text-slate-900">
                          ₹{checkoutItem.totalSellingPrice?.toLocaleString('en-IN')}
                        </span>
                        {checkoutItem.totalMrp && checkoutItem.totalMrp > checkoutItem.totalSellingPrice && (
                          <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                            ₹{checkoutItem.totalMrp?.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-slate-200 rounded-lg sm:rounded-xl bg-slate-50 p-0.5">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(checkoutItem.quantity - 1)}
                          disabled={checkoutItem.quantity <= 1}
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="w-6 sm:w-8 text-center text-[11px] sm:text-xs font-bold text-slate-900">
                          {checkoutItem.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(checkoutItem.quantity + 1)}
                          disabled={checkoutItem.quantity >= 10}
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. HEALTH PROFILE QUESTIONNAIRE */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-slate-200/80 shadow-xs space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between pb-1.5 sm:pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Activity size={16} className="text-[#3d3f96]" />
                    <h3 className="text-xs sm:text-base font-extrabold text-slate-900">
                      Health & Diabetes Profile
                    </h3>
                  </div>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">Personalized Setup</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-600 block">
                    1. Diagnosed with Diabetes?
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
                    {[
                      { label: 'Yes, Diagnosed', value: 'yes' },
                      { label: 'Pre-diabetic', value: 'pre-diabetic' },
                      { label: 'No / Wellness', value: 'no' }
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setIsDiabetic(opt.value)}
                        className={`py-2 sm:py-2.5 px-1.5 sm:px-3 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-bold border transition-all cursor-pointer text-center truncate ${
                          isDiabetic === opt.value
                            ? 'border-[#3d3f96] bg-indigo-50/70 text-[#3d3f96] ring-1 ring-[#3d3f96]'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {isDiabetic === 'yes' && (
                  <div className="space-y-1 sm:space-y-2 pt-0.5 sm:pt-1">
                    <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-600 block">
                      Select Diabetes Type
                    </label>
                    <div className="relative">
                      <select
                        value={diabetesType}
                        onChange={(e) => setDiabetesType(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 text-[11px] sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3d3f96] appearance-none"
                      >
                        {DIABETES_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type} Diabetes
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3.5 top-3 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-600 block">
                    2. Ever used a {isCgm ? 'CGM Sensor' : 'Glucometer'} before?
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => setHasUsedBefore(true)}
                      className={`py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-bold border transition-all cursor-pointer truncate ${
                        hasUsedBefore === true
                          ? 'border-[#3d3f96] bg-indigo-50/70 text-[#3d3f96] ring-1 ring-[#3d3f96]'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      Yes, Used Before
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasUsedBefore(false)}
                      className={`py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-bold border transition-all cursor-pointer truncate ${
                        hasUsedBefore === false
                          ? 'border-[#3d3f96] bg-indigo-50/70 text-[#3d3f96] ring-1 ring-[#3d3f96]'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      No, First-timer
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. COACH AND TIME SLOTS (ONLINE & OFFLINE HOME VISIT) */}
              <ChooseCoachAndSlot
                includeCoachCharge={includeCoachCharge}
                onToggleCoachCharge={setIncludeCoachCharge}
                selectedCoach={selectedCoach}
                onCoachSelect={setSelectedCoach}
                consultationMode={consultationMode}
                onConsultationModeChange={setConsultationMode}
                selectedSlot={selectedSlot}
                onSlotSelect={setSelectedSlot}
                userLocation={userLocation}
                showNotification={showNotification}
              />

              {/* 4. RECOMMENDED ACCESSORIES & ADD-ONS */}
              {availableAddons.length > 0 && (
                <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-slate-200/80 shadow-xs space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between pb-1.5 sm:pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Sparkles size={16} className="text-[#3d3f96]" />
                      <h3 className="text-xs sm:text-base font-extrabold text-slate-900">
                        Recommended Accessories
                      </h3>
                    </div>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">Bundle & Save</span>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    {availableAddons.map((addon) => {
                      const qty = selectedAddons[addon._id] || 0;
                      const isAdded = qty > 0;
                      return (
                        <div
                          key={addon._id}
                          className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all flex items-center justify-between gap-2.5 sm:gap-3 ${
                            isAdded
                              ? 'border-[#3d3f96] bg-indigo-50/30'
                              : 'border-slate-200/80 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-100 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                              <img
                                src={getImageSrc(addon.imageUrl)}
                                alt={addon.name}
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-[11px] sm:text-xs font-bold text-slate-900 leading-tight truncate">
                                {addon.name}
                              </h4>
                              <p className="text-[9px] sm:text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                {addon.description}
                              </p>
                              <span className="text-[11px] sm:text-xs font-extrabold text-slate-900 block mt-0.5 sm:mt-1">
                                ₹{addon.price}
                              </span>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {isAdded ? (
                              <div className="flex items-center border border-[#3d3f96] rounded-lg sm:rounded-xl bg-white p-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleAddonQty(addon._id, -1)}
                                  className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-indigo-50 text-[#3d3f96] flex items-center justify-center hover:bg-indigo-100 transition-all cursor-pointer"
                                >
                                  <Minus size={10} />
                                </button>
                                <span className="w-5 sm:w-6 text-center text-[10px] sm:text-xs font-bold text-slate-900">
                                  {qty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleAddonQty(addon._id, 1)}
                                  className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-indigo-50 text-[#3d3f96] flex items-center justify-center hover:bg-indigo-100 transition-all cursor-pointer"
                                >
                                  <Plus size={10} />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleAddon(addon._id)}
                                className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border border-slate-200 hover:border-[#3d3f96] text-slate-700 hover:text-[#3d3f96] text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Plus size={11} />
                                <span>Add</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 5. DELIVERY ADDRESS COMPONENT */}
              <ChooseAddress
                selectedAddress={selectedDeliveryAddress}
                onAddressSelect={setSelectedDeliveryAddress}
                showNotification={showNotification}
              />

              {/* 6. PAYMENT MODE SELECTOR */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-slate-200/80 shadow-xs space-y-3 sm:space-y-4">
                <div className="flex items-center gap-1.5 sm:gap-2 pb-1.5 sm:pb-2 border-b border-slate-100">
                  <CreditCard size={16} className="text-[#3d3f96]" />
                  <h3 className="text-xs sm:text-base font-extrabold text-slate-900">
                    Payment Option
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  <label
                    onClick={() => setPaymentMethod('Online')}
                    className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      paymentMethod === 'Online'
                        ? 'border-[#3d3f96] bg-indigo-50/40 ring-1 sm:ring-2 ring-[#3d3f96]/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-indigo-100 text-[#3d3f96] flex items-center justify-center shrink-0">
                        <Zap size={16} />
                      </div>
                      <div>
                        <strong className="text-[11px] sm:text-xs font-bold text-slate-900 block">UPI / Online / Cards</strong>
                        <span className="text-[9px] sm:text-[10px] text-emerald-600 font-bold">Fast Razorpay Checkout</span>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'Online'}
                      onChange={() => setPaymentMethod('Online')}
                      className="accent-[#3d3f96]"
                    />
                  </label>

                  <label
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      paymentMethod === 'COD'
                        ? 'border-[#3d3f96] bg-indigo-50/40 ring-1 sm:ring-2 ring-[#3d3f96]/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                        <Truck size={16} />
                      </div>
                      <div>
                        <strong className="text-[11px] sm:text-xs font-bold text-slate-900 block">Cash on Delivery</strong>
                        <span className="text-[9px] sm:text-[10px] text-slate-400">Pay at doorstep</span>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="accent-[#3d3f96]"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* ================= RIGHT COLUMN: FARE BREAKDOWN (5 COLS) ================= */}
            <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-3 sm:space-y-4">
              
              {/* Fare Summary Card */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-sm space-y-3 sm:space-y-4 relative">
                <div className="flex items-center justify-between pb-1.5 sm:pb-2 border-b border-slate-100">
                  <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-400">
                    Order Price Details
                  </h3>
                  {calculatingBill && (
                    <span className="flex items-center gap-1 text-[9px] sm:text-[10px] text-[#3d3f96] font-bold">
                      <Loader2 size={11} className="animate-spin" /> Updating...
                    </span>
                  )}
                </div>

                {/* Instant Device Discount Banner */}
                {instantDeviceSavings > 0 && (
                  <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-2.5 flex items-center justify-between text-emerald-800">
                    <span className="text-[11px] font-bold flex items-center gap-1.5">
                      <Tag size={13} className="text-emerald-600" />
                      Instant Device Discount
                    </span>
                    <span className="text-xs font-black text-emerald-700">
                      -₹{instantDeviceSavings.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                <div className="space-y-2 sm:space-y-2.5 text-[11px] sm:text-xs">
                  {/* Line Item 1: Device Price */}
                  <div className="flex items-center justify-between text-slate-700">
                    <span>
                      Device Price ({checkoutItem.quantity} unit{checkoutItem.quantity > 1 ? 's' : ''})
                    </span>
                    <span className="font-extrabold text-slate-900">
                      ₹{deviceTotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Line Item 2: Coach Consultation Fee (Online or Home Visit) */}
                  {includeCoachCharge && selectedCoach && (
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-1">
                        {consultationMode === 'Offline' ? (
                          <Home size={12} className="text-rose-600" />
                        ) : (
                          <Video size={12} className="text-[#3d3f96]" />
                        )}
                        <span>
                          1-on-1 Coach ({selectedCoach.name.split(' ')[0]} - {consultationMode === 'Offline' ? 'Home Visit' : 'Online'})
                        </span>
                      </span>
                      <span className="font-extrabold text-slate-900">
                        +₹{coachBaseFee}
                      </span>
                    </div>
                  )}

                  {/* Line Item 3: Peak Slot Fee */}
                  {includeCoachCharge && slotExtraFee > 0 && (
                    <div className="flex items-center justify-between text-amber-800 bg-amber-50/80 px-2 py-1 rounded-lg border border-amber-200/60">
                      <span className="flex items-center gap-1 font-bold">
                        <span>Peak / Premium Slot Fee</span>
                        <span className="text-[8px] bg-amber-200 text-amber-900 px-1 py-0.2 rounded font-black uppercase">
                          Peak
                        </span>
                      </span>
                      <span className="font-black">+₹{slotExtraFee}</span>
                    </div>
                  )}

                  {/* Line Item 4: Add-on Accessories */}
                  {addonsTotal > 0 && (
                    <div className="flex items-center justify-between text-slate-700">
                      <span>Add-on Accessories ({formattedAddonsPayload.length})</span>
                      <span className="font-extrabold text-slate-900">
                        +₹{addonsTotal}
                      </span>
                    </div>
                  )}

                  {/* Line Item 5: Shipping */}
                  <div className="flex items-center justify-between text-slate-700">
                    <span>Express Insulated Shipping</span>
                    <span className="font-extrabold text-emerald-600">FREE</span>
                  </div>

                  {/* Total Payable Row (Sum of items) */}
                  <div className="pt-2 sm:pt-3 border-t border-slate-100 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900 block">Total Payable</span>
                      <span className="text-[9px] sm:text-[10px] text-slate-400">Inclusive of all taxes & GST</span>
                    </div>
                    <span className="text-lg sm:text-2xl font-black text-slate-900">
                      ₹{finalPayableAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Desktop Primary Submit Button */}
                <button
                  type="submit"
                  disabled={placingOrder || calculatingBill}
                  className="hidden lg:flex w-full bg-[#3d3f96] hover:bg-slate-900 text-white py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm shadow-xl shadow-indigo-200 transition-all items-center justify-center gap-2 active:scale-98 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {placingOrder ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Processing Order...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard size={16} />
                      <span>
                        {paymentMethod === 'Online' ? 'Pay Online via Razorpay' : 'Place Cash on Delivery Order'} • ₹
                        {finalPayableAmount.toLocaleString('en-IN')}
                      </span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[9px] sm:text-[10px] text-slate-400 text-center pt-0.5">
                  <ShieldCheck size={12} className="text-[#3d3f96]" />
                  <span>ISO Certified • Free Doorstep Delivery</span>
                </div>
              </div>

              {/* Security Guarantee Card */}
              <div className="bg-indigo-50/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-indigo-100/80 flex items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[#3d3f96] text-white flex items-center justify-center shrink-0">
                  <Lock size={15} />
                </div>
                <div>
                  <h4 className="text-[11px] sm:text-xs font-bold text-slate-900">Buyer Protection Guarantee</h4>
                  <p className="text-[9px] sm:text-[11px] text-slate-500 leading-tight">
                    Full manufacturer warranty & verified medical device assurance.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ================= FLOATING ACTION BAR FOR MOBILE ================= */}
          <aside className="lg:hidden fixed bottom-2 left-2 right-2 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-2.5 z-40 shadow-2xl">
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex flex-col pl-1">
                <span className="text-[9px] uppercase font-bold text-slate-400">Total Payable</span>
                <span className="text-base sm:text-lg font-black text-slate-900 leading-none">
                  ₹{finalPayableAmount.toLocaleString('en-IN')}
                </span>
                {includeCoachCharge && (
                  <span className="text-[8px] text-[#3d3f96] font-bold mt-0.5">
                    Includes {consultationMode === 'Offline' ? 'Home Visit' : 'Online Coach'}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={placingOrder || calculatingBill}
                className="flex-1 max-w-[220px] py-2.5 px-3 bg-[#3d3f96] hover:bg-slate-900 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {placingOrder ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={14} />
                    <span>{paymentMethod === 'Online' ? 'Pay Online' : 'Place Order'}</span>
                    <ArrowRight size={13} />
                  </>
                )}
              </button>
            </div>
          </aside>
        </form>
      </main>

      {/* ================= ORDER SUCCESS CONFIRMATION MODAL ================= */}
      {orderSuccessData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-xs sm:max-w-md w-full p-5 sm:p-8 text-center space-y-4 sm:space-y-5 shadow-2xl border border-slate-100">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle size={28} className="sm:w-9 sm:h-9" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg sm:text-2xl font-black text-slate-900">
                Order Confirmed!
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Your device order has been placed and dispatched for packing.
              </p>
            </div>

            {/* Order Meta Details */}
            <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-100 space-y-1.5 sm:space-y-2 text-left text-[11px] sm:text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold uppercase text-[9px] sm:text-[10px]">Order ID</span>
                <strong className="text-slate-900 font-extrabold">{orderSuccessData.orderId}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold uppercase text-[9px] sm:text-[10px]">Payment</span>
                <strong className="text-emerald-700 font-bold">
                  {orderSuccessData.isOnlinePayment ? 'Paid Online' : 'Cash on Delivery (COD)'}
                </strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold uppercase text-[9px] sm:text-[10px]">Total Paid</span>
                <strong className="text-slate-900 font-bold">
                  ₹{orderSuccessData.amountPaid?.toLocaleString('en-IN')}
                </strong>
              </div>

              {orderSuccessData.deliveryOtp && (
                <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-slate-400 font-semibold uppercase text-[9px] sm:text-[10px] block">Delivery OTP</span>
                    <span className="text-[9px] sm:text-[10px] text-slate-500">Share with courier agent</span>
                  </div>
                  <strong className="text-base sm:text-lg font-black text-[#3d3f96] tracking-widest">
                    {orderSuccessData.deliveryOtp}
                  </strong>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => router.push('/shop')}
              className="w-full py-2.5 sm:py-3.5 bg-[#3d3f96] hover:bg-slate-900 text-white rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}