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
  MapPin,
  Sparkles,
  UserCheck,
  CheckCircle2,
  Loader2,
  PackageCheck,
  ChevronDown,
  HelpCircle,
  PlusCircle,
  Check,
  AlertCircle,
  Zap,
  Activity,
  HeartPulse,
  ShoppingBag,
  RotateCcw,
  CheckCircle,
  Home,
  Briefcase
} from 'lucide-react';
import UserAPI from '../../../../services/UserAPI';
import { useNotification } from '../../../../context/NotificationContext';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

const DIABETES_TYPES = [
  // Common types
  'Type 1 Diabetes',
  'Type 2 Diabetes',
  'Gestational Diabetes',

  // Intermediate / related condition
  'Prediabetes',

  // Autoimmune diabetes
  'Latent Autoimmune Diabetes in Adults (LADA)',
  'Type 1 Diabetes with Autoimmune Polyglandular Syndrome',

  // Genetic / monogenic diabetes
  'Maturity-Onset Diabetes of the Young (MODY)',
  'Neonatal Diabetes Mellitus',
  'Permanent Neonatal Diabetes',
  'Transient Neonatal Diabetes',
  'Mitochondrial Diabetes',

  // Secondary / diabetes due to other conditions
  'Diabetes due to Pancreatic Disease',
  'Diabetes due to Pancreatitis',
  'Diabetes due to Cystic Fibrosis',
  'Diabetes due to Hemochromatosis',
  'Diabetes due to Endocrine Disorders',
  'Diabetes due to Genetic Syndromes',
  'Post-Pancreatectomy Diabetes',
  'Post-Transplantation Diabetes',

  // Drug / chemical-induced
  'Steroid-Induced Diabetes',
  'Drug-Induced Diabetes',
  'Chemical-Induced Diabetes',

  // Endocrine-related diabetes
  'Diabetes due to Cushing Syndrome',
  'Diabetes due to Acromegaly',
  'Diabetes due to Hyperthyroidism',
  'Diabetes due to Pheochromocytoma',

  // Genetic syndromes associated with diabetes
  'Wolfram Syndrome',
  'Alström Syndrome',
  'Down Syndrome-associated Diabetes',
  'Turner Syndrome-associated Diabetes',
  'Klinefelter Syndrome-associated Diabetes',
  'Prader-Willi Syndrome-associated Diabetes',

  // Pregnancy-related
  'Gestational Diabetes - Diet Controlled',
  'Gestational Diabetes - Medication Controlled',

  // Other
  'Secondary Diabetes Mellitus',
  'Other Specified Diabetes',
  'Unspecified Diabetes',
  'Diabetes in Remission',
  'Not Sure',

  // Non-diabetes wellness category
  'General Wellness'
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

  // Core Product Checkout State
  const [checkoutItem, setCheckoutItem] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [calculatingBill, setCalculatingBill] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Health Profile Questionnaire
  const [isDiabetic, setIsDiabetic] = useState('yes'); // 'yes' | 'no' | 'pre-diabetic'
  const [diabetesType, setDiabetesType] = useState('Type 2');
  const [hasUsedBefore, setHasUsedBefore] = useState(false);

  // Coach Charge Consultation
  const [coachData, setCoachData] = useState(null);
  const [includeCoachCharge, setIncludeCoachCharge] = useState(false);

  // Add-ons
  const [availableAddons, setAvailableAddons] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState({}); // { [addonId]: quantity }

  // Addresses
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('new');
  const [customAddress, setCustomAddress] = useState({
    name: '',
    phone: '',
    houseNo: '',
    sector: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    addressType: 'Home'
  });

  // Payment Options
  const [paymentMethod, setPaymentMethod] = useState('Online'); // 'Online' | 'COD'

  // Calculated Backend Bill Breakdown
  const [billSummary, setBillSummary] = useState(null);

  // Order Success Screen State
  const [orderSuccessData, setOrderSuccessData] = useState(null);

  // Helper for image format
  const getImageSrc = (imgPath) => {
    if (!imgPath) {
      return 'https://images.unsplash.com/photo-1583947581924-860bda6a26df?q=80&w=800&auto=format&fit=crop';
    }
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
      return imgPath;
    }
    return `${BASE_URL}${imgPath}`;
  };

  // 1. Initial Load: Retrieve Product, Add-ons, Coach charges & Saved Addresses
  useEffect(() => {
    const initializeCheckout = async () => {
      try {
        setPageLoading(true);

        // Load Session Product
        let currentItem = null;
        if (typeof window !== 'undefined') {
          const stored = sessionStorage.getItem('cgm_checkout_item');
          if (stored) {
            currentItem = JSON.parse(stored);
            setCheckoutItem(currentItem);
          }
        }

        // Fallback API Load if session is absent
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

        // Parallel Fetch: Addons, Coach Charges & User Addresses
        const [addonsRes, coachRes, addressRes] = await Promise.allSettled([
          UserAPI.getCgmAddOns(),
          UserAPI.getCgmCoachCharges(),
          UserAPI.getAddressList()
        ]);

        if (addonsRes.status === 'fulfilled' && addonsRes.value?.data) {
          setAvailableAddons(addonsRes.value.data);
        }

        if (coachRes.status === 'fulfilled' && coachRes.value?.data) {
          setCoachData(coachRes.value.data);
        }

        if (addressRes.status === 'fulfilled' && addressRes.value?.data && Array.isArray(addressRes.value.data)) {
          const addrs = addressRes.value.data;
          setSavedAddresses(addrs);
          const defaultAddr = addrs.find((a) => a.isDefault) || addrs[0];
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr._id);
          }
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

  // 2. Format Add-ons for Bill Calculation & Place Order
  const formattedAddonsPayload = useMemo(() => {
    return Object.entries(selectedAddons)
      .filter(([_, qty]) => qty > 0)
      .map(([addonId, qty]) => ({
        addonId,
        quantity: qty
      }));
  }, [selectedAddons]);

  // 3. Dynamic Live Bill Preview API
  const calculateBill = useCallback(async () => {
    if (!checkoutItem?.productId) return;
    try {
      setCalculatingBill(true);

      const billPayload = {
        deviceId: checkoutItem.productId,
        variantId: checkoutItem.selectedVariant?._id || undefined,
        quantity: checkoutItem.quantity || 1,
        includeCoachCharge,
        coachChargeId: coachData?._id || undefined,
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
  }, [checkoutItem, includeCoachCharge, coachData, formattedAddonsPayload]);

  // Trigger recalculation whenever selection updates
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

  // Handle Addon selection toggle & qty
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

  // Get active delivery address object
  const getActiveDeliveryAddress = () => {
    if (selectedAddressId !== 'new') {
      const found = savedAddresses.find((a) => a._id === selectedAddressId);
      if (found) {
        return {
          name: found.name,
          phone: found.phone,
          houseNo: found.houseNo,
          sector: found.sector || '',
          landmark: found.landmark || '',
          city: found.city,
          state: found.state,
          pincode: found.pincode,
          addressType: found.addressType || 'Home'
        };
      }
    }
    return customAddress;
  };

  // 4. Place Order Handler (Razorpay Online & Cash on Delivery)
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    const activeAddress = getActiveDeliveryAddress();

    if (!activeAddress.name?.trim() || !activeAddress.phone?.trim() || !activeAddress.houseNo?.trim() || !activeAddress.city?.trim() || !activeAddress.pincode?.trim()) {
      if (showNotification) {
        showNotification('Please provide complete delivery address details.', 'error');
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
          diabetesType: isDiabetic === 'no' ? 'General Wellness' : isDiabetic === 'pre-diabetic' ? 'Pre-diabetic' : diabetesType,
          hasUsedBefore: Boolean(hasUsedBefore)
        },
        includeCoachCharge,
        addons: formattedAddonsPayload,
        paymentMethod,
        deliveryAddress: activeAddress
      };

      const res = await UserAPI.placeCgmOrder(orderPayload);

      if (res && res.success) {
        // CASE A: Razorpay Online Payment Flow
        if (res.isOnlinePayment && res.razorpayOrderId) {
          const isScriptLoaded = await loadRazorpayScript();

          if (!isScriptLoaded) {
            if (showNotification) {
              showNotification('Razorpay SDK failed to load. Please check your internet connection.', 'error');
            }
            setPlacingOrder(false);
            return;
          }

          const options = {
            key: res.key_id,
            amount: res.amount,
            currency: 'INR',
            name: 'DiabetesWala',
            description: `Order ${res.orderId}`,
            image: getImageSrc(checkoutItem.mainImage),
            order_id: res.razorpayOrderId,
            handler: async (response) => {
              try {
                // Verify Payment on Backend
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
                    amountPaid: billSummary?.pricingBreakdown?.totalPayable || (res.amount / 100)
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
              name: activeAddress.name,
              contact: activeAddress.phone
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
            amountPaid: res.billSummary?.totalPayable || billSummary?.pricingBreakdown?.totalPayable
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
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-[#3d3f96]" size={42} />
        <p className="text-sm font-semibold text-slate-500">Preparing checkout preferences & fare preview...</p>
      </div>
    );
  }

  // Fallback if no item
  if (!checkoutItem) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-indigo-50 text-[#3d3f96] rounded-3xl flex items-center justify-center mb-4">
          <PackageCheck size={32} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">No Product in Checkout</h2>
        <p className="text-sm text-slate-500 max-w-md mb-6">
          Please select a CGM device or glucometer to proceed with your order.
        </p>
        <button
          onClick={() => router.push('/shop')}
          className="px-6 py-2.5 bg-[#3d3f96] text-white rounded-xl font-bold text-sm shadow-md hover:bg-slate-900 transition-all cursor-pointer"
        >
          Explore Store
        </button>
      </div>
    );
  }

  // Active pricing calculations
  const payableAmount = billSummary?.pricingBreakdown?.totalPayable ?? checkoutItem.totalSellingPrice;
  const itemTotal = billSummary?.pricingBreakdown?.itemTotal ?? checkoutItem.totalSellingPrice;
  const mrpTotal = billSummary?.pricingBreakdown?.mrpTotal ?? checkoutItem.totalMrp;
  const savings = billSummary?.pricingBreakdown?.deviceSavings ?? (mrpTotal && mrpTotal > itemTotal ? mrpTotal - itemTotal : 0);
  const isCgm = checkoutItem.productType === 'CGM' || checkoutItem.categoryName?.toLowerCase().includes('cgm');

  return (
    <div className="min-h-screen bg-slate-50/60 pb-28 text-slate-800 antialiased selection:bg-[#3d3f96] selection:text-white">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none -z-10" />

      {/* Top Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-[#3d3f96] transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-indigo-50 flex items-center justify-center transition-colors">
              <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span>Back to Details</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full">
            <Lock size={13} />
            <span>256-Bit SSL Encrypted Checkout</span>
          </div>
        </div>
      </header>

      {/* Main Checkout Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* ================= LEFT COLUMN: DETAILS & CUSTOMIZATIONS (7 COLS) ================= */}
            <div className="lg:col-span-7 space-y-6">

              {/* 1. PRODUCT SUMMARY CARD */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <ShoppingBag size={14} className="text-[#3d3f96]" /> Selected Order Item
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    100% Genuine Certified
                  </span>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 border border-slate-100 rounded-2xl p-2 shrink-0 flex items-center justify-center overflow-hidden">
                    <img
                      src={getImageSrc(checkoutItem.mainImage)}
                      alt={checkoutItem.productTitle}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-[#3d3f96] bg-indigo-50 px-2 py-0.5 rounded">
                        {checkoutItem.productBrand || 'DiabetesWala'}
                      </span>
                      {checkoutItem.selectedVariant && (
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded truncate max-w-[150px]">
                          {checkoutItem.selectedVariant.displayName}
                        </span>
                      )}
                    </div>

                    <h2 className="text-sm sm:text-base font-extrabold text-slate-900 line-clamp-2 leading-snug">
                      {checkoutItem.productTitle}
                    </h2>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-base sm:text-lg font-black text-slate-900">
                          ₹{checkoutItem.totalSellingPrice?.toLocaleString('en-IN')}
                        </span>
                        {checkoutItem.totalMrp && checkoutItem.totalMrp > checkoutItem.totalSellingPrice && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{checkoutItem.totalMrp?.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-0.5">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(checkoutItem.quantity - 1)}
                          disabled={checkoutItem.quantity <= 1}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-slate-900">
                          {checkoutItem.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(checkoutItem.quantity + 1)}
                          disabled={checkoutItem.quantity >= 10}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. HEALTH & DIABETES PROFILE QUESTIONNAIRE */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Activity size={18} className="text-[#3d3f96]" />
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                    Health & Diabetes Profile
                  </h3>
                  <span className="text-[10px] text-slate-400 ml-auto font-medium">For tailored sensor setup</span>
                </div>

                {/* Question 1: Are you diabetic? */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                    1. Have you been diagnosed with Diabetes?
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { label: 'Yes, Diagnosed', value: 'yes' },
                      { label: 'Pre-diabetic', value: 'pre-diabetic' },
                      { label: 'No / Wellness', value: 'no' }
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setIsDiabetic(opt.value)}
                        className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer text-center ${isDiabetic === opt.value
                          ? 'border-[#3d3f96] bg-indigo-50/70 text-[#3d3f96] ring-1 ring-[#3d3f96]'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 1b: Dropdown for Diabetes Type (If Yes) */}
                {isDiabetic === 'yes' && (
                  <div className="space-y-2 pt-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                      Select Diabetes Type
                    </label>
                    <div className="relative">
                      <select
                        value={diabetesType}
                        onChange={(e) => setDiabetesType(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3d3f96] appearance-none"
                      >
                        {DIABETES_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type} Diabetes
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Question 2: Have you used CGM before? */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                    2. Have you ever used a {isCgm ? 'CGM Sensor' : 'Glucometer'} before?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setHasUsedBefore(true)}
                      className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${hasUsedBefore === true
                        ? 'border-[#3d3f96] bg-indigo-50/70 text-[#3d3f96] ring-1 ring-[#3d3f96]'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                    >
                      Yes, Experienced User
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasUsedBefore(false)}
                      className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${hasUsedBefore === false
                        ? 'border-[#3d3f96] bg-indigo-50/70 text-[#3d3f96] ring-1 ring-[#3d3f96]'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                    >
                      No, First-time User
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. 1-ON-1 CERTIFIED COACH CONSULTATION (OPTIONAL ADD-ON) */}
              {coachData && coachData.isActive && (
                <div className={`rounded-3xl p-5 sm:p-6 border transition-all ${includeCoachCharge
                  ? 'border-[#3d3f96] bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/40 ring-1 ring-[#3d3f96] shadow-xs'
                  : 'border-slate-200/80 bg-white shadow-xs'
                  }`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-[#3d3f96] flex items-center justify-center shrink-0 mt-0.5">
                        <UserCheck size={20} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-slate-900">
                            1-on-1 Certified Diabetes Coach Session
                          </h4>
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#3d3f96] bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                            Recommended
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {coachData.description || 'Live virtual onboarding, sensor placement guide, and personalized glucose target coaching.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-base font-black text-slate-900">
                        +₹{coachData.coachCharge}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIncludeCoachCharge(!includeCoachCharge)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${includeCoachCharge
                          ? 'bg-[#3d3f96] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                      >
                        {includeCoachCharge ? <Check size={14} /> : <Plus size={14} />}
                        <span>{includeCoachCharge ? 'Added' : 'Add Coach'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. FREQUENTLY BOUGHT ACCESSORIES & ADD-ONS */}
              {availableAddons.length > 0 && (
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Sparkles size={18} className="text-[#3d3f96]" />
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                        Recommended Accessories & Add-ons
                      </h3>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">Save on bundle</span>
                  </div>

                  <div className="space-y-3">
                    {availableAddons.map((addon) => {
                      const qty = selectedAddons[addon._id] || 0;
                      const isAdded = qty > 0;
                      return (
                        <div
                          key={addon._id}
                          className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${isAdded
                            ? 'border-[#3d3f96] bg-indigo-50/30'
                            : 'border-slate-200/80 bg-white hover:border-slate-300'
                            }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 p-1.5 shrink-0 flex items-center justify-center overflow-hidden">
                              <img
                                src={getImageSrc(addon.imageUrl)}
                                alt={addon.name}
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-900 leading-snug truncate">
                                {addon.name}
                              </h4>
                              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                {addon.description}
                              </p>
                              <span className="text-xs font-extrabold text-slate-900 block mt-1">
                                ₹{addon.price}
                              </span>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {isAdded ? (
                              <div className="flex items-center border border-[#3d3f96] rounded-xl bg-white p-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleAddonQty(addon._id, -1)}
                                  className="w-6 h-6 rounded-lg bg-indigo-50 text-[#3d3f96] flex items-center justify-center hover:bg-indigo-100 transition-all cursor-pointer"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="w-6 text-center text-xs font-bold text-slate-900">
                                  {qty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleAddonQty(addon._id, 1)}
                                  className="w-6 h-6 rounded-lg bg-indigo-50 text-[#3d3f96] flex items-center justify-center hover:bg-indigo-100 transition-all cursor-pointer"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleAddon(addon._id)}
                                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-[#3d3f96] text-slate-700 hover:text-[#3d3f96] text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Plus size={13} />
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

              {/* 5. DELIVERY ADDRESS SELECTION */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-[#3d3f96]" />
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                      Delivery Address
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Free express courier</span>
                </div>

                {/* Saved Address Radios (if user has saved addresses) */}
                {savedAddresses.length > 0 && (
                  <div className="space-y-2.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                      Saved Addresses
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {savedAddresses.map((addr) => {
                        const isSelected = selectedAddressId === addr._id;
                        return (
                          <div
                            key={addr._id}
                            onClick={() => setSelectedAddressId(addr._id)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${isSelected
                              ? 'border-[#3d3f96] bg-indigo-50/40 ring-1 ring-[#3d3f96]'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                              }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1">
                                {addr.addressType === 'Work' ? <Briefcase size={13} /> : <Home size={13} />}
                                {addr.name}
                              </span>
                              {isSelected && <CheckCircle2 size={16} className="text-[#3d3f96]" />}
                            </div>
                            <p className="text-[11px] text-slate-500 leading-snug">
                              {addr.houseNo}, {addr.sector && `${addr.sector}, `}
                              {addr.landmark && `${addr.landmark}, `}
                              {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                            <span className="text-[10px] font-bold text-slate-400 block mt-1">
                              Phone: {addr.phone}
                            </span>
                          </div>
                        );
                      })}

                      {/* Add New Address Card */}
                      <div
                        onClick={() => setSelectedAddressId('new')}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center gap-1 min-h-[95px] ${selectedAddressId === 'new'
                          ? 'border-[#3d3f96] bg-indigo-50/40 ring-1 ring-[#3d3f96]'
                          : 'border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/50'
                          }`}
                      >
                        <PlusCircle size={18} className="text-[#3d3f96]" />
                        <span className="text-xs font-bold text-slate-800">Enter New Address</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Custom New Address Form (shown if 'new' selected or no saved address) */}
                {(selectedAddressId === 'new' || savedAddresses.length === 0) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Mudabir Kowser"
                        value={customAddress.name}
                        onChange={(e) => setCustomAddress({ ...customAddress, name: e.target.value })}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#3d3f96]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Contact Phone *
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. 9876543210"
                        value={customAddress.phone}
                        onChange={(e) => setCustomAddress({ ...customAddress, phone: e.target.value })}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#3d3f96]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        House No / Flat / Street *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Flat 402, Green Valley"
                        value={customAddress.houseNo}
                        onChange={(e) => setCustomAddress({ ...customAddress, houseNo: e.target.value })}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#3d3f96]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Sector / Area
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Sector 62"
                        value={customAddress.sector}
                        onChange={(e) => setCustomAddress({ ...customAddress, sector: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#3d3f96]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Landmark
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Near City Hospital"
                        value={customAddress.landmark}
                        onChange={(e) => setCustomAddress({ ...customAddress, landmark: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#3d3f96]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Mohali"
                        value={customAddress.city}
                        onChange={(e) => setCustomAddress({ ...customAddress, city: e.target.value })}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#3d3f96]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Punjab"
                        value={customAddress.state}
                        onChange={(e) => setCustomAddress({ ...customAddress, state: e.target.value })}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#3d3f96]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 160062"
                        value={customAddress.pincode}
                        onChange={(e) => setCustomAddress({ ...customAddress, pincode: e.target.value })}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#3d3f96]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 6. PAYMENT MODE SELECTOR */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <CreditCard size={18} className="text-[#3d3f96]" />
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                    Payment Option
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    onClick={() => setPaymentMethod('Online')}
                    className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${paymentMethod === 'Online'
                      ? 'border-[#3d3f96] bg-indigo-50/40 ring-2 ring-[#3d3f96]/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-100 text-[#3d3f96] flex items-center justify-center">
                        <Zap size={18} />
                      </div>
                      <div>
                        <strong className="text-xs font-bold text-slate-900 block">UPI / Online / Cards</strong>
                        <span className="text-[10px] text-emerald-600 font-bold">Fast Razorpay Checkout</span>
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
                    className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${paymentMethod === 'COD'
                      ? 'border-[#3d3f96] bg-indigo-50/40 ring-2 ring-[#3d3f96]/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                        <Truck size={18} />
                      </div>
                      <div>
                        <strong className="text-xs font-bold text-slate-900 block">Cash on Delivery</strong>
                        <span className="text-[10px] text-slate-400">Pay at doorstep</span>
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

            {/* ================= RIGHT COLUMN: STICKY FARE BREAKDOWN (5 COLS) ================= */}
            <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-4">

              {/* Fare Summary Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4 relative">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Order Price Details
                  </h3>
                  {calculatingBill && (
                    <span className="flex items-center gap-1 text-[10px] text-[#3d3f96] font-bold">
                      <Loader2 size={12} className="animate-spin" /> Updating bill...
                    </span>
                  )}
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>
                      Device Total ({checkoutItem.quantity} unit{checkoutItem.quantity > 1 ? 's' : ''})
                    </span>
                    <span className="font-bold text-slate-900">
                      ₹{itemTotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {savings > 0 && (
                    <div className="flex items-center justify-between text-emerald-600">
                      <span>Instant Device Savings</span>
                      <span className="font-bold">-₹{savings.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {includeCoachCharge && coachData && (
                    <div className="flex items-center justify-between text-slate-600">
                      <span>1-on-1 Coach Consultation</span>
                      <span className="font-bold text-slate-900">
                        +₹{coachData.coachCharge}
                      </span>
                    </div>
                  )}

                  {billSummary?.pricingBreakdown?.addonsTotal > 0 && (
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Add-on Accessories ({formattedAddonsPayload.length})</span>
                      <span className="font-bold text-slate-900">
                        +₹{billSummary.pricingBreakdown.addonsTotal}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-slate-600">
                    <span>Express Insulated Shipping</span>
                    <span className="font-bold text-emerald-600">FREE</span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                    <div>
                      <span className="text-sm font-extrabold text-slate-900 block">Total Payable</span>
                      <span className="text-[10px] text-slate-400">Inclusive of all taxes & GST</span>
                    </div>
                    <span className="text-2xl font-black text-slate-900">
                      ₹{payableAmount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Final Order Submit Button */}
                <button
                  type="submit"
                  disabled={placingOrder || calculatingBill}
                  className="w-full bg-[#3d3f96] hover:bg-slate-900 text-white py-4 rounded-2xl font-black text-sm sm:text-base shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {placingOrder ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Processing Order...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard size={18} />
                      <span>
                        {paymentMethod === 'Online' ? 'Pay Online via Razorpay' : 'Place Cash on Delivery Order'} • ₹
                        {payableAmount?.toLocaleString('en-IN')}
                      </span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 text-center pt-1">
                  <ShieldCheck size={13} className="text-[#3d3f96]" />
                  <span>ISO Certified • Free Doorstep Delivery Support</span>
                </div>
              </div>

              {/* Security Banner */}
              <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#3d3f96] text-white flex items-center justify-center shrink-0">
                  <Lock size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Buyer Protection Guarantee</h4>
                  <p className="text-[11px] text-slate-500">Full warranty and verified medical devices only.</p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* ================= ORDER SUCCESS CONFIRMATION MODAL ================= */}
      {orderSuccessData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center space-y-5 shadow-2xl border border-slate-100">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle size={36} />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Order Confirmed!
              </h2>
              <p className="text-xs text-slate-500">
                Your device order has been placed and dispatched for packing.
              </p>
            </div>

            {/* Order Meta Box */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 text-left text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Order ID</span>
                <strong className="text-slate-900 font-extrabold">{orderSuccessData.orderId}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Payment</span>
                <strong className="text-emerald-700 font-bold">
                  {orderSuccessData.isOnlinePayment ? 'Paid Online' : 'Cash on Delivery (COD)'}
                </strong>
              </div>

              {orderSuccessData.deliveryOtp && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-slate-400 font-semibold uppercase text-[10px] block">Delivery OTP</span>
                    <span className="text-[10px] text-slate-500">Share with courier at delivery</span>
                  </div>
                  <strong className="text-lg font-black text-[#3d3f96] tracking-widest">
                    {orderSuccessData.deliveryOtp}
                  </strong>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => router.push('/shop/cgmdevices')}
              className="w-full py-3.5 bg-[#3d3f96] hover:bg-slate-900 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}