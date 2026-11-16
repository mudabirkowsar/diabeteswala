// app/lab/cart/page.js
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Clock,
  MapPin,
  ChevronRight,
  Loader2,
  Beaker,
  CheckCircle2,
  KeyRound,
  ArrowRight,
  PlusCircle,
  Calendar,
  Users,
  User,
  Edit3,
  Check,
  Home,
  Building2,
  Zap,
  Tag,
  CreditCard,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Navigation,
  ShieldCheck,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';

import { useCart } from '../../../../context/CartContext';
import { useNotification } from '../../../../context/NotificationContext';
import UserAPI from '../../../../services/UserAPI';

import AddressModal from './components/AddressModal';
import CouponsModal from './components/CouponsModal';

const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

const getSanitizedImageUrl = (path) => {
  if (!path) return "https://images.unsplash.com/photo-1582719471384-894fbb16e074?q=80&w=400&auto=format&fit=crop";
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  let cleanPath = path.replace(/\\/g, '/').replace(/^public\//, '');
  if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);
  return `${BASE_SERVER_URL}/${cleanPath}`;
};

// Converts local Date to YYYY-MM-DD format (avoids UTC timezone shift)
const formatToYMD = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// 🛡️ Fixes "Invalid date" by falling back to slotTime / normalizedTime (e.g., "14:00" -> "02:00 PM")
const getValidDisplayTime = (slot) => {
  if (
    slot?.displayTime &&
    typeof slot.displayTime === 'string' &&
    !slot.displayTime.toLowerCase().includes('invalid')
  ) {
    return slot.displayTime;
  }

  const raw = slot?.slotTime || slot?.normalizedTime || slot?.time || slot?.startTime;
  if (!raw || typeof raw !== 'string') return 'Available Slot';

  if (/[ap]m/i.test(raw)) return raw;

  const match = raw.match(/^(\d{1,2}):(\d{2})/);
  if (match) {
    let hour = parseInt(match[1], 10);
    const minute = match[2];
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${String(hour).padStart(2, '0')}:${minute} ${ampm}`;
  }

  return raw;
};

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

export default function LabCartPage() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const {
    labCart,
    labCartTotal,
    updateLabItemQuantity,
    removeLabCartItem,
    clearLabCart,
    loading: cartLoading
  } = useCart();

  // Item & Checkout States
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [clearingCart, setClearingCart] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  // Address & GPS States
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [userCoords, setUserCoords] = useState(null);

  // Multi-Patient States
  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedPatients, setSelectedPatients] = useState([
    { patientId: 'Self', name: 'Self', age: 28, gender: 'Male', relation: 'Self', isCustomName: false }
  ]);
  const [editingPatientId, setEditingPatientId] = useState(null);

  // Collection Mode, Rapid & Time Slot States
  const [collectionType, setCollectionType] = useState('Home Collection');
  const [isRapid, setIsRapid] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => formatToYMD(new Date()));
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isSlotLoading, setIsSlotLoading] = useState(false);
  const [isSlotClosed, setIsSlotClosed] = useState(false);
  const [slotClosedMessage, setSlotClosedMessage] = useState('');

  // Coupon States
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  // Live Bill & Payment States
  const [paymentMethod, setPaymentMethod] = useState('Online');
  const [checkoutData, setCheckoutData] = useState(null);
  const [calculatingBill, setCalculatingBill] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // Retry Online Payment & Confirmation Modal States
  const [pendingBooking, setPendingBooking] = useState(null);
  const [retryingPayment, setRetryingPayment] = useState(false);
  const [placedOrderData, setPlacedOrderData] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const cartItems = labCart?.items || [];
  const labDetails = labCart?.labId;
  const labId = labDetails?._id || (typeof labDetails === 'string' ? labDetails : labCart?.vendorId);

  const hasRadiologyItem = useMemo(() => {
    return cartItems.some(
      (item) =>
        item.mainCategory?.toLowerCase().includes('radiology') ||
        item.productType?.toLowerCase().includes('radiology') ||
        item.name?.toLowerCase().includes('x-ray') ||
        item.name?.toLowerCase().includes('mri') ||
        item.name?.toLowerCase().includes('ct scan') ||
        item.name?.toLowerCase().includes('ultrasound')
    );
  }, [cartItems]);

  const calendarDates = [0, 1, 2, 3, 4].map((offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return {
      iso: formatToYMD(d),
      label:
        offset === 0
          ? "Today"
          : offset === 1
          ? "Tomorrow"
          : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    };
  });

  // 1. Initial Load: Addresses & Family Members
  useEffect(() => {
    const fetchDependencies = async () => {
      setLoadingAddress(true);
      try {
        const [addrRes, famRes] = await Promise.all([
          UserAPI.getAddressList(),
          UserAPI.getFamilyMembers()
        ]);

        if (addrRes?.success) {
          const list = addrRes.data || [];
          const defaultAddr = list.find((a) => a.isDefault) || list[0] || null;
          if (defaultAddr) {
            setSelectedAddress(defaultAddr);
            if (defaultAddr.name) {
              setSelectedPatients((prev) =>
                prev.map((p) => (p.patientId === 'Self' && !p.isCustomName ? { ...p, name: defaultAddr.name } : p))
              );
            }
          }
        }

        if (famRes?.success) {
          setFamilyMembers(famRes.data || []);
        }
      } catch (err) {
        console.error('Error fetching dependencies:', err);
      } finally {
        setLoadingAddress(false);
      }
    };

    fetchDependencies();

    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { timeout: 5000 }
      );
    }
  }, []);

  // 2. Fetch Time Slots (GET /user/labs/slots) with Sanitized Display Time
  useEffect(() => {
    if (!labId || !selectedDate) return;

    const fetchSlots = async () => {
      setIsSlotLoading(true);
      setIsSlotClosed(false);
      setSlotClosedMessage('');
      try {
        const res = await UserAPI.getLabTimeSlots({ labId, date: selectedDate });
        if (res?.success) {
          setIsSlotClosed(res.isClosed || false);
          setSlotClosedMessage(res.message || '');

          // Sanitizing slots to guarantee valid displayTime
          const sanitizedSlots = (res.slots || []).map((s) => ({
            ...s,
            displayTime: getValidDisplayTime(s)
          }));

          setAvailableSlots(sanitizedSlots);
          const firstOpen = sanitizedSlots.find((s) => s.isAvailable);
          setSelectedSlot(firstOpen || null);
        }
      } catch (err) {
        console.error('Error fetching lab slots:', err);
        setAvailableSlots([]);
        setSelectedSlot(null);
      } finally {
        setIsSlotLoading(false);
      }
    };

    fetchSlots();
  }, [labId, selectedDate]);

  // Payloads
  const formattedAddressPayload = useMemo(() => {
    if (!selectedAddress) return undefined;
    return {
      houseNo: selectedAddress.houseNo,
      sector: selectedAddress.sector || undefined,
      landmark: selectedAddress.landmark || undefined,
      city: selectedAddress.city,
      state: selectedAddress.state,
      pincode: selectedAddress.pincode,
      phone: selectedAddress.phone
    };
  }, [selectedAddress]);

  const formattedPatientsPayload = useMemo(() => {
    return selectedPatients.map(({ patientId, name, age, gender, relation }) => ({
      patientId,
      name: name || 'Patient',
      age: Number(age) || 28,
      gender: gender || 'Male',
      relation: relation || 'Self'
    }));
  }, [selectedPatients]);

  // 3. Evaluate Checkout Bill Summary
  const evaluateCheckoutSummary = useCallback(async () => {
    if (!labId || cartItems.length === 0) return;

    setCalculatingBill(true);
    setCheckoutError('');
    try {
      const payload = {
        labId,
        collectionType,
        isRapid,
        couponCode: appliedCoupon?.couponName || undefined,
        userLat: userCoords?.lat,
        userLng: userCoords?.lng,
        selectedPatients: formattedPatientsPayload,
        address: formattedAddressPayload
      };

      const res = await UserAPI.checkoutLabSummary(payload);
      if (res?.success && res.data) {
        setCheckoutData(res.data);
        if (res.data.isCodAvailable === false && paymentMethod === 'COD') {
          setPaymentMethod('Online');
        }
      } else {
        setCheckoutError(res?.message || 'Unable to calculate bill summary.');
      }
    } catch (err) {
      setCheckoutError(err?.response?.data?.message || 'Failed to evaluate checkout bill.');
    } finally {
      setCalculatingBill(false);
    }
  }, [
    labId,
    cartItems.length,
    collectionType,
    isRapid,
    appliedCoupon,
    userCoords,
    formattedPatientsPayload,
    formattedAddressPayload,
    paymentMethod
  ]);

  useEffect(() => {
    if (cartItems.length > 0 && labId) {
      evaluateCheckoutSummary();
    }
  }, [evaluateCheckoutSummary, cartItems.length, labId]);

  const handleTogglePatient = (patientObj) => {
    setSelectedPatients((prev) => {
      const exists = prev.some((p) => p.patientId === patientObj.patientId);
      if (exists) {
        if (prev.length === 1) {
          showNotification?.('At least one patient must be selected.', 'error');
          return prev;
        }
        return prev.filter((p) => p.patientId !== patientObj.patientId);
      }
      return [...prev, patientObj];
    });
    if (pendingBooking) setPendingBooking(null);
  };

  const handleUpdatePatientDetails = (patientId, updatedFields) => {
    setSelectedPatients((prev) =>
      prev.map((p) => (p.patientId === patientId ? { ...p, ...updatedFields } : p))
    );
  };

  const handleQuantityChange = async (itemId, action, currentQty) => {
    setUpdatingItemId(itemId);
    try {
      if (action === 'dec' && currentQty <= 1) {
        await removeLabCartItem(itemId);
        showNotification?.('Test removed from cart.', 'success');
      } else {
        await updateLabItemQuantity(itemId, action);
      }
      if (pendingBooking) setPendingBooking(null);
    } catch (err) {
      showNotification?.('Failed to update quantity.', 'error');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (itemId, itemName) => {
    setUpdatingItemId(itemId);
    try {
      await removeLabCartItem(itemId);
      showNotification?.(`Removed "${itemName}" from cart.`, 'success');
      if (pendingBooking) setPendingBooking(null);
    } catch (err) {
      showNotification?.('Failed to remove item.', 'error');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your lab cart?')) return;
    setClearingCart(true);
    try {
      await clearLabCart();
      setAppliedCoupon(null);
      setPendingBooking(null);
      showNotification?.('Lab cart cleared successfully.', 'success');
    } catch (err) {
      showNotification?.('Failed to clear cart.', 'error');
    } finally {
      setClearingCart(false);
    }
  };

  const safeSyncClearedCart = async () => {
    try {
      await clearLabCart();
    } catch (e) {}
  };

  const openRazorpayCheckout = async (orderDetails) => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      showNotification?.('Razorpay payment gateway failed to load.', 'error');
      return;
    }

    const razorpayKey = orderDetails.key_id || orderDetails.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const activeBookingId = orderDetails.bookingId;

    const options = {
      key: razorpayKey,
      amount: orderDetails.amount,
      currency: orderDetails.currency || 'INR',
      name: labDetails?.name || 'Diagnostic Laboratory',
      description: `Lab Test Booking (${activeBookingId})`,
      image: getSanitizedImageUrl(labDetails?.profileImage),
      order_id: orderDetails.razorpayOrderId,
      handler: async function (paymentResponse) {
        try {
          const verifyPayload = {
            bookingId: activeBookingId,
            razorpay_order_id: paymentResponse.razorpay_order_id,
            razorpay_payment_id: paymentResponse.razorpay_payment_id,
            razorpay_signature: paymentResponse.razorpay_signature
          };

          const verifyRes = await UserAPI.verifyLabPayment(verifyPayload);
          if (verifyRes?.success) {
            setPendingBooking(null);
            await safeSyncClearedCart();
            setPlacedOrderData({
              bookingId: verifyRes.bookingId || activeBookingId,
              pickupOtp: verifyRes.pickupOtp || verifyRes.data?.tracking?.otp,
              paymentMethod: verifyRes.data?.paymentMethod || 'Online',
              paymentStatus: verifyRes.data?.paymentStatus || 'Paid',
              status: verifyRes.data?.status || 'Confirmed',
              totalAmount:
                verifyRes.data?.paymentDetails?.amount ||
                checkoutData?.billSummary?.totalAmount ||
                (orderDetails.amount ? orderDetails.amount / 100 : labCartTotal),
              appointmentDate: selectedDate,
              appointmentTime: selectedSlot?.displayTime,
              collectionType
            });
            setIsSuccessModalOpen(true);
            showNotification?.(verifyRes.message || 'Payment verified & lab booking confirmed!', 'success');
          } else {
            showNotification?.(verifyRes?.message || 'Payment verification failed.', 'error');
          }
        } catch (verifyErr) {
          showNotification?.(verifyErr?.response?.data?.message || 'Payment verification error.', 'error');
        }
      },
      modal: {
        ondismiss: function () {
          showNotification?.(`Payment cancelled. Click "Retry Payment" to resume Booking ${activeBookingId}.`, 'error');
        }
      },
      prefill: {
        name: selectedAddress?.name || selectedPatients[0]?.name || '',
        contact: selectedAddress?.phone || ''
      },
      theme: { color: '#3d3f96' }
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (res) {
      showNotification?.(res?.error?.description || 'Payment transaction failed.', 'error');
    });
    rzp.open();
  };

  // 4. Place Booking
  const handleProceedToBooking = async () => {
    if (collectionType === 'Home Collection' && !selectedAddress) {
      showNotification?.('Please select a collection address.', 'error');
      setIsAddressModalOpen(true);
      return;
    }

    if (!selectedSlot) {
      showNotification?.('Please select an appointment time slot.', 'error');
      return;
    }

    if (selectedPatients.length === 0) {
      showNotification?.('Please select at least one patient.', 'error');
      return;
    }

    if (checkoutError) {
      showNotification?.(checkoutError, 'error');
      return;
    }

    if (paymentMethod === 'Online' && pendingBooking?.bookingId) {
      await handleRetryPayment();
      return;
    }

    setCheckingOut(true);
    try {
      const bookingPayload = {
        collectionType,
        paymentMethod,
        isRapid,
        couponCode: appliedCoupon?.couponName || undefined,
        appointmentDate: selectedDate,
        appointmentTime: selectedSlot.displayTime,
        selectedPatients: formattedPatientsPayload,
        address: formattedAddressPayload,
        userLat: userCoords?.lat,
        userLng: userCoords?.lng
      };

      const res = await UserAPI.bookLabOrder(bookingPayload);
      if (!res?.success) {
        showNotification?.(res?.message || 'Failed to place lab booking.', 'error');
        return;
      }

      if (paymentMethod === 'COD') {
        await safeSyncClearedCart();
        setPlacedOrderData({
          bookingId: res.bookingId || res.data?.bookingId,
          pickupOtp: res.pickupOtp || res.data?.tracking?.otp,
          paymentMethod: 'COD',
          paymentStatus: res.data?.paymentStatus || 'Pending',
          status: res.data?.status || 'Confirmed',
          totalAmount: res.data?.billSummary?.totalAmount ?? checkoutData?.billSummary?.totalAmount ?? labCartTotal,
          appointmentDate: selectedDate,
          appointmentTime: selectedSlot.displayTime,
          collectionType
        });
        setIsSuccessModalOpen(true);
        showNotification?.(res.message || 'Lab booking confirmed (COD)!', 'success');
        return;
      }

      setPendingBooking({
        bookingId: res.bookingId,
        bookingMongoId: res.bookingMongoId || res.data?._id,
        totalAmount: res.amount ? res.amount / 100 : checkoutData?.billSummary?.totalAmount
      });
      await openRazorpayCheckout(res);
    } catch (err) {
      showNotification?.(err?.response?.data?.message || 'An error occurred during booking.', 'error');
    } finally {
      setCheckingOut(false);
    }
  };

  // 5. Retry Payment
  const handleRetryPayment = async () => {
    if (!pendingBooking?.bookingId) return;
    setRetryingPayment(true);
    try {
      const retryRes = await UserAPI.retryLabPayment(pendingBooking.bookingId);
      if (retryRes?.success) {
        await openRazorpayCheckout(retryRes);
      } else {
        showNotification?.(retryRes?.message || 'Could not retry payment.', 'error');
      }
    } catch (err) {
      showNotification?.(err?.response?.data?.message || 'Failed to re-initialize payment.', 'error');
    } finally {
      setRetryingPayment(false);
    }
  };

  const bill = checkoutData?.billSummary;
  const sub = checkoutData?.subscriptionBenefit;
  const isCodAvailable = checkoutData?.isCodAvailable !== false;

  const baseTestsTotal = bill?.baseTestsTotal ?? labCartTotal;
  const multiplier = bill?.patientMultiplier ?? selectedPatients.length;
  const multipliedTotal = bill?.multipliedTotal ?? (baseTestsTotal * multiplier);
  const couponDiscount = bill?.couponDiscount ?? 0;
  const homeCollectionFee = bill?.homeSampleCollectionCharge ?? 0;
  const originalHomeFee = bill?.originalHomeCollectionCharge ?? 0;
  const fastReportCharge = bill?.fastReportCharge ?? 0;
  const slotExtraFee = selectedSlot?.isPremium ? (selectedSlot?.extraFee || 0) : 0;
  const finalTotal = bill?.totalAmount ?? Math.max(0, multipliedTotal - couponDiscount + homeCollectionFee + fastReportCharge + slotExtraFee);

  const selfPatient = selectedPatients.find((p) => p.patientId === 'Self');
  const isSelfSelected = Boolean(selfPatient);

  if (cartItems.length === 0 && !isSuccessModalOpen && !cartLoading) {
    return (
      <main className="min-h-screen bg-[#f8fbff] flex items-center justify-center py-12 px-4 antialiased text-left">
        <div className="bg-white rounded-[2.5rem] p-8 sm:p-14 text-center border border-slate-100 shadow-xl shadow-indigo-100/30 max-w-lg w-full space-y-6">
          <div className="bg-[#3d3f96]/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto text-[#3d3f96]">
            <ShoppingBag size={44} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Diagnostic Cart is Empty</h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-2 leading-relaxed max-w-sm mx-auto">
              You don&apos;t have any diagnostic or pathology tests queued for dispatch. Explore our accredited partner labs to schedule tests.
            </p>
          </div>
          <Link
            href="/lab/alltests"
            className="inline-flex items-center justify-center gap-2 bg-[#3d3f96] hover:bg-[#2d2f75] text-white px-8 py-3.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-indigo-100"
          >
            Browse Diagnostic Tests <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fbff] py-4 sm:py-8 lg:py-12 antialiased select-none text-slate-800 text-left">
      <div className="max-w-[1200px] mx-auto px-3 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">

        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 sm:gap-2 text-[#3d3f96] hover:text-[#2d2f75] font-black text-[11px] sm:text-xs uppercase tracking-wider transition-colors cursor-pointer bg-white px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl border border-slate-100 shadow-xs"
          >
            <ArrowLeft size={13} className="stroke-[2.5]" />
            <span>Back to Tests</span>
          </button>

          <button
            type="button"
            onClick={handleClearCart}
            disabled={clearingCart}
            className="text-[11px] sm:text-xs font-black text-rose-600 hover:text-rose-800 uppercase tracking-wider cursor-pointer disabled:opacity-50 flex items-center gap-1"
          >
            {clearingCart ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
            <span>Clear Full Cart</span>
          </button>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-start">

          {/* LEFT COLUMN: Items, Patients, Collection & Slots */}
          <div className="lg:col-span-7 space-y-3.5 sm:space-y-5">

            {/* 1. Items List */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-slate-100 shadow-sm space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-100">
                <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
                  Diagnostic Tests &amp; Packages ({cartItems.length})
                </h3>
                <button
                  type="button"
                  onClick={() => router.push(labId ? `/lab/alltests?labId=${labId}` : '/lab/alltests')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#3d3f96]/10 hover:bg-[#3d3f96]/20 text-[#3d3f96] font-black text-[10px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  <PlusCircle size={13} />
                  <span>Add More Tests</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {cartItems.map((item, idx) => {
                  const itemId = item.itemId || item._id || idx;
                  const isUpdating = updatingItemId === itemId;

                  return (
                    <div
                      key={itemId}
                      className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50/60 flex flex-col space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-indigo-50 border border-indigo-100 text-[#3d3f96] px-2 py-0.5 rounded">
                              {item.mainCategory || "Pathology"}
                            </span>
                            <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                              {item.productType}
                            </span>
                          </div>

                          <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate mt-1">
                            {item.name}
                          </h4>

                          <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 mt-0.5">
                            Unit Price: <span className="text-slate-800 font-black">₹{item.price}</span>
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-xs sm:text-sm font-black text-slate-900">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </p>
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleRemoveItem(itemId, item.name)}
                            className="text-slate-400 hover:text-rose-500 transition-colors p-1 mt-0.5 cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {item.preparationGuide && (
                        <div className="bg-white border border-slate-100 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 text-[10px] text-slate-600 font-medium">
                          <Clock size={12} className="text-amber-500 shrink-0" />
                          <span className="truncate"><strong className="text-slate-700">Prep:</strong> {item.preparationGuide}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-end pt-1">
                        <div className="flex items-center bg-white border border-slate-200 rounded-lg sm:rounded-xl p-0.5 sm:p-1 shadow-inner shrink-0">
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleQuantityChange(itemId, 'dec', item.quantity)}
                            className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 disabled:opacity-40"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="w-6 sm:w-7 text-center text-[11px] sm:text-xs font-black text-slate-800">
                            {isUpdating ? <Loader2 size={10} className="animate-spin mx-auto text-[#3d3f96]" /> : item.quantity}
                          </span>
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleQuantityChange(itemId, 'inc', item.quantity)}
                            className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 disabled:opacity-40"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Patient Profile Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-slate-100 shadow-sm space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#3d3f96]/10 text-[#3d3f96] flex items-center justify-center shrink-0">
                    <Users size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
                      Selected Patients ({selectedPatients.length})
                    </h3>
                    <p className="text-[10px] sm:text-[11px] font-bold text-slate-400">
                      Tests will be scheduled for all selected patients
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-black bg-indigo-50 border border-indigo-100 text-[#3d3f96] px-2.5 py-1 rounded-full">
                  {selectedPatients.length}x Multiplier
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                <div
                  onClick={() =>
                    handleTogglePatient({
                      patientId: "Self",
                      name: selfPatient?.name || "Self",
                      age: selfPatient?.age || 28,
                      gender: selfPatient?.gender || "Male",
                      relation: "Self"
                    })
                  }
                  className={`cursor-pointer rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border transition-all relative flex flex-col items-center text-center ${
                    isSelfSelected
                      ? "border-[#3d3f96] bg-[#3d3f96]/5 ring-2 ring-[#3d3f96]/20"
                      : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                  }`}
                >
                  {isSelfSelected && <CheckCircle2 size={14} className="text-[#3d3f96] absolute top-2 right-2" />}
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center mb-1.5 sm:mb-2">
                    <User size={16} />
                  </div>
                  <h4 className="text-[11px] sm:text-xs font-black text-slate-900 truncate max-w-full">
                    {selfPatient?.name || "Self"}
                  </h4>
                  <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase">Self</span>
                </div>

                {familyMembers.map((member) => {
                  const isSelected = selectedPatients.some((p) => p.patientId === member._id);
                  const memberName = member.memberName || member.name || "Family Member";
                  const memberImg = member.profilePic ? getSanitizedImageUrl(member.profilePic) : null;

                  return (
                    <div
                      key={member._id}
                      onClick={() =>
                        handleTogglePatient({
                          patientId: member._id,
                          name: memberName,
                          age: Number(member.age) || 30,
                          gender: member.gender || "Other",
                          relation: member.relation || "Family"
                        })
                      }
                      className={`cursor-pointer rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border transition-all relative flex flex-col items-center text-center ${
                        isSelected
                          ? "border-[#3d3f96] bg-[#3d3f96]/5 ring-2 ring-[#3d3f96]/20"
                          : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                      }`}
                    >
                      {isSelected && <CheckCircle2 size={14} className="text-[#3d3f96] absolute top-2 right-2" />}
                      {memberImg ? (
                        <img src={memberImg} alt={memberName} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover mb-1.5 sm:mb-2 border border-slate-200" />
                      ) : (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-100 text-[#3d3f96] flex items-center justify-center mb-1.5 sm:mb-2 font-black text-xs">
                          {memberName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <h4 className="text-[11px] sm:text-xs font-black text-slate-900 truncate max-w-full">
                        {memberName}
                      </h4>
                      <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase">
                        {member.relation || "Family"}
                      </span>
                    </div>
                  );
                })}
              </div>

              {selectedPatients.length > 0 && (
                <div className="pt-2 space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Report Demographic Information
                  </p>
                  {selectedPatients.map((patient) => {
                    const isEditing = editingPatientId === patient.patientId;
                    return (
                      <div key={patient.patientId} className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-xs">
                        {isEditing ? (
                          <div className="grid grid-cols-12 gap-2 items-center">
                            <input
                              type="text"
                              value={patient.name}
                              onChange={(e) => handleUpdatePatientDetails(patient.patientId, { name: e.target.value, isCustomName: true })}
                              className="col-span-5 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold outline-none focus:border-[#3d3f96]"
                            />
                            <input
                              type="number"
                              min={1}
                              max={120}
                              value={patient.age}
                              onChange={(e) => handleUpdatePatientDetails(patient.patientId, { age: e.target.value })}
                              className="col-span-2 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold outline-none focus:border-[#3d3f96]"
                            />
                            <select
                              value={patient.gender}
                              onChange={(e) => handleUpdatePatientDetails(patient.patientId, { gender: e.target.value })}
                              className="col-span-3 bg-white border border-slate-200 rounded-lg px-1.5 py-1.5 text-xs font-bold outline-none focus:border-[#3d3f96]"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => setEditingPatientId(null)}
                              className="col-span-2 bg-[#3d3f96] text-white py-1.5 rounded-lg font-black text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Check size={12} /> Save
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-black text-slate-900">{patient.name}</span>
                              <span className="text-[10px] font-bold bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-600">
                                {patient.age} yrs • {patient.gender}
                              </span>
                              <span className="text-[10px] font-bold text-[#3d3f96]">({patient.relation})</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setEditingPatientId(patient.patientId)}
                              className="text-[11px] font-bold text-[#3d3f96] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 size={11} /> Edit
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Collection Mode, Rapid & Slots (Now with Fixed Display Time) */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-slate-100 shadow-sm space-y-3 sm:space-y-4">
              <div className="pb-2.5 sm:pb-3 border-b border-slate-100">
                <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
                  Sample Collection &amp; Time Slot
                </h3>
                <p className="text-[10px] sm:text-[11px] font-bold text-slate-400">
                  Select home sample collection or diagnostic center visit
                </p>
              </div>

              {hasRadiologyItem && collectionType === 'Home Collection' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start justify-between gap-3 text-left">
                  <div className="flex items-start gap-2 text-amber-900 text-[11px] font-bold">
                    <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                    <span>Radiology scans require clinic visit. Home collection is unavailable.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCollectionType('Visit Lab')}
                    className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg cursor-pointer"
                  >
                    Switch to Visit Lab
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setCollectionType('Home Collection')}
                  className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border text-left transition-all cursor-pointer ${
                    collectionType === 'Home Collection'
                      ? 'border-[#3d3f96] bg-[#3d3f96]/5 ring-2 ring-[#3d3f96]/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 rounded-lg bg-indigo-50 text-[#3d3f96]"><Home size={15} /></div>
                    <h4 className="text-xs font-black text-slate-900">Home Collection</h4>
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium">Doorstep sample pickup</p>
                </button>

                <button
                  type="button"
                  onClick={() => setCollectionType('Visit Lab')}
                  className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border text-left transition-all cursor-pointer ${
                    collectionType === 'Visit Lab'
                      ? 'border-[#3d3f96] bg-[#3d3f96]/5 ring-2 ring-[#3d3f96]/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700"><Building2 size={15} /></div>
                    <h4 className="text-xs font-black text-slate-900">Visit Lab</h4>
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium">Walk-in to lab center</p>
                </button>
              </div>

              <div
                onClick={() => setIsRapid(!isRapid)}
                className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  isRapid ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20' : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-600 shrink-0"><Zap size={16} /></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-slate-900">Express 6-Hour Reporting</h4>
                      <span className="bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Fast</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">Priority pathology processing for rapid digital reports</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isRapid}
                  onChange={(e) => setIsRapid(e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-4 h-4 accent-[#3d3f96] cursor-pointer"
                />
              </div>

              {/* Date & Slots */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div>
                  <label className="text-[11px] sm:text-xs font-black text-slate-700 block mb-1.5">Appointment Date</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2">
                    {calendarDates.map((item) => (
                      <button
                        key={item.iso}
                        type="button"
                        onClick={() => setSelectedDate(item.iso)}
                        className={`py-1.5 px-2.5 rounded-lg sm:rounded-xl border text-center transition-all text-[11px] sm:text-xs font-bold cursor-pointer ${
                          selectedDate === item.iso
                            ? "border-[#3d3f96] bg-[#3d3f96] text-white shadow-xs"
                            : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] sm:text-xs font-black text-slate-700 block mb-1.5">Available Time Slots</label>
                  {isSlotLoading ? (
                    <div className="p-4 text-center text-slate-400 flex items-center justify-center gap-2">
                      <Loader2 size={14} className="animate-spin text-[#3d3f96]" />
                      <span className="text-[11px] font-bold">Checking real-time lab slots...</span>
                    </div>
                  ) : isSlotClosed ? (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-[11px] font-bold">
                      <AlertCircle size={14} /> {slotClosedMessage || "Lab is closed on chosen date."}
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 sm:gap-2">
                      {availableSlots.map((slot, idx) => {
                        const isSelected = selectedSlot?.displayTime === slot.displayTime;
                        const disabled = !slot.isAvailable;

                        return (
                          <button
                            key={`${slot.slotTime}-${idx}`}
                            type="button"
                            disabled={disabled}
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2 ${
                              disabled
                                ? "opacity-45 cursor-not-allowed bg-slate-100 border-slate-200"
                                : isSelected
                                ? "border-[#3d3f96] bg-[#3d3f96]/10 text-[#3d3f96] font-black ring-2 ring-[#3d3f96]/20 cursor-pointer"
                                : "border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-700 font-bold cursor-pointer"
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <Clock size={12} className={isSelected ? "text-[#3d3f96]" : "text-slate-400"} />
                                <span className="text-[11px] font-black truncate">{slot.displayTime}</span>
                              </div>
                              <span className="text-[9px] text-slate-400 font-bold uppercase block mt-0.5">
                                {disabled ? slot.status : slot.category}
                              </span>
                            </div>
                            {slot.isPremium && slot.extraFee > 0 && (
                              <span className="text-[9px] font-black bg-amber-100 text-amber-800 px-1 py-0.5 rounded shrink-0">
                                +₹{slot.extraFee}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-xl text-center text-slate-400 text-[11px] font-bold">
                      No slots open for chosen date.
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Summary, Address, Coupons & Total */}
          <div className="lg:col-span-5 space-y-3.5 sm:space-y-4">

            {/* Lab Card */}
            {labDetails && (
              <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 border border-slate-100 shadow-sm flex items-center gap-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/70 shrink-0">
                  <img src={getSanitizedImageUrl(labDetails.profileImage)} alt={labDetails.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center gap-1 text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mb-0.5">
                    <ShieldCheck size={10} /> NABL &amp; ICMR Certified
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">{labDetails.name}</h4>
                  <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                    <MapPin size={10} /> {labDetails.address || labDetails.city || "Central Pathology Lab"}
                  </p>
                </div>
              </div>
            )}

            {/* Address Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 border border-slate-100 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#3d3f96]/10 text-[#3d3f96] flex items-center justify-center shrink-0">
                    <MapPin size={15} />
                  </div>
                  <div>
                    <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-400">
                      {collectionType === 'Home Collection' ? "Sample Pickup Address" : "Billing Address"}
                    </h4>
                    <p className="text-[11px] sm:text-xs font-black text-slate-800">
                      {selectedAddress?.addressType ? `${selectedAddress.addressType} Location` : "Patient Location"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(true)}
                  className="text-xs font-black text-[#3d3f96] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  {selectedAddress ? "Change" : "Add"} <ChevronRight size={13} />
                </button>
              </div>

              {loadingAddress ? (
                <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold py-1">
                  <Loader2 size={13} className="animate-spin" /> Fetching destination...
                </div>
              ) : selectedAddress ? (
                <div className="text-[11px] sm:text-xs space-y-0.5">
                  <div className="flex items-center justify-between">
                    <p className="font-black text-slate-900">{selectedAddress.name}</p>
                    {userCoords && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <Navigation size={9} /> GPS Active
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    {selectedAddress.houseNo}, {selectedAddress.sector && `${selectedAddress.sector}, `}
                    {selectedAddress.landmark && `Near ${selectedAddress.landmark}, `}
                    {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                  </p>
                  <p className="text-slate-400 font-bold text-[10px] pt-0.5">
                    Phone: <span className="text-slate-700">{selectedAddress.phone}</span>
                  </p>
                </div>
              ) : (
                <div className="text-[11px] text-rose-500 font-bold py-1">
                  No address selected. Please select a collection address.
                </div>
              )}
            </div>

            {/* Coupon Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 border border-slate-100 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Tag size={15} />
                  </div>
                  <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-800">
                    Lab Promo Offers
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(true)}
                  className="text-xs font-black text-[#3d3f96] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  {appliedCoupon ? "Change Offer" : "View Coupons"} <ChevronRight size={13} />
                </button>
              </div>

              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200/80 rounded-xl p-2.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-[11px] sm:text-xs font-black text-emerald-800 uppercase tracking-wider">
                        {appliedCoupon.couponName}
                      </p>
                      <p className="text-[9px] sm:text-[10px] font-bold text-emerald-600">
                        Savings: ₹{couponDiscount} applied to this order
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedCoupon(null);
                      if (pendingBooking) setPendingBooking(null);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded-lg cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <p className="text-[10px] sm:text-[11px] font-medium text-slate-400">
                  Apply eligible diagnostic promo codes for test package discounts.
                </p>
              )}
            </div>

            {/* Cost Breakdown & Payment Card */}
            <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 border border-slate-100 shadow-xl shadow-indigo-100/40 space-y-4">
              <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-100">
                <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
                  Payment Breakdown
                </h2>
                <CreditCard size={16} className="text-slate-400" />
              </div>

              {calculatingBill && (
                <div className="text-[10px] text-indigo-500 font-bold flex items-center gap-1.5">
                  <Loader2 size={11} className="animate-spin" /> Evaluating patients, distance &amp; offers...
                </div>
              )}

              {sub?.hasActiveSubscription && (
                <div
                  className={`rounded-xl p-3 border text-[11px] flex items-start gap-2 ${
                    sub.isApplied ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <Sparkles size={14} className={sub.isApplied ? 'text-emerald-600 shrink-0 mt-0.5' : 'text-amber-600 shrink-0 mt-0.5'} />
                  <div>
                    <span className="font-black uppercase tracking-wider block">{sub.planName}</span>
                    {sub.isApplied ? (
                      <span className="font-medium text-emerald-700">
                        Free Home Collection applied ({sub.remainingCount} uses left)
                      </span>
                    ) : (
                      <span className="font-medium text-amber-800">
                        {sub.exhaustedMessage || "Subscription collection quota exhausted."}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {checkoutError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={15} className="shrink-0 mt-0.5" />
                    <span>{checkoutError}</span>
                  </div>
                  {collectionType === 'Home Collection' && checkoutError.toLowerCase().includes('radiology') && (
                    <button
                      type="button"
                      onClick={() => setCollectionType('Visit Lab')}
                      className="bg-rose-600 text-white text-[10px] font-black px-3 py-1.5 rounded-lg cursor-pointer"
                    >
                      Switch to Visit Lab
                    </button>
                  )}
                </div>
              )}

              <div className="space-y-2 text-[11px] sm:text-xs font-bold text-slate-600">
                <div className="flex justify-between">
                  <span>Base Tests Total</span>
                  <span className="text-slate-900 font-black">₹{baseTestsTotal}</span>
                </div>

                {multiplier > 1 && (
                  <div className="flex justify-between text-[#3d3f96]">
                    <span>Patients ({multiplier}x Multiplier)</span>
                    <span className="font-black">₹{multipliedTotal}</span>
                  </div>
                )}

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Coupon Discount</span>
                    <span className="font-black">-₹{couponDiscount}</span>
                  </div>
                )}

                {collectionType === 'Home Collection' && (
                  <div className="flex justify-between">
                    <span>Home Sample Collection</span>
                    <span className={homeCollectionFee === 0 ? "text-emerald-600 font-black" : "text-slate-900 font-black"}>
                      {originalHomeFee > 0 && homeCollectionFee === 0 && (
                        <span className="line-through text-slate-400 mr-1.5">₹{originalHomeFee}</span>
                      )}
                      {homeCollectionFee === 0 ? "FREE" : `₹${homeCollectionFee}`}
                    </span>
                  </div>
                )}

                {isRapid && (
                  <div className="flex justify-between">
                    <span>Fast 6-Hour Reporting</span>
                    <span className="text-slate-900 font-black">₹{fastReportCharge}</span>
                  </div>
                )}

                {slotExtraFee > 0 && (
                  <div className="flex justify-between">
                    <span>Premium Slot Fee</span>
                    <span className="text-slate-900 font-black">₹{slotExtraFee}</span>
                  </div>
                )}

                <div className="pt-2.5 border-t border-slate-100 flex justify-between items-baseline">
                  <div>
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                      Total Payable
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">
                      Inclusive of all diagnostic taxes
                    </span>
                  </div>
                  <span className="text-xl sm:text-2xl font-black text-[#3d3f96]">
                    ₹{finalTotal}
                  </span>
                </div>
              </div>

              {/* Payment Method Toggle */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-400 block">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={!isCodAvailable}
                    onClick={() => setPaymentMethod('COD')}
                    className={`py-2.5 px-2 rounded-xl sm:rounded-2xl border text-center transition-all text-[11px] sm:text-xs font-black cursor-pointer ${
                      !isCodAvailable
                        ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200'
                        : paymentMethod === 'COD'
                        ? 'border-[#3d3f96] bg-[#3d3f96] text-white shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    Cash / COD
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Online')}
                    className={`py-2.5 px-2 rounded-xl sm:rounded-2xl border text-center transition-all text-[11px] sm:text-xs font-black cursor-pointer ${
                      paymentMethod === 'Online'
                        ? 'border-[#3d3f96] bg-[#3d3f96] text-white shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    Online Payment
                  </button>
                </div>
              </div>

              {/* Retry Banner */}
              {pendingBooking && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                  <div className="flex items-start gap-2 text-amber-900 text-xs font-bold">
                    <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                    <span>Booking saved ({pendingBooking.bookingId}). Complete payment to confirm.</span>
                  </div>
                  <button
                    type="button"
                    disabled={retryingPayment}
                    onClick={handleRetryPayment}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {retryingPayment ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Re-opening Gateway...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw size={13} />
                        <span>Retry Online Payment (₹{pendingBooking.totalAmount || finalTotal})</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Proceed Button */}
              <button
                type="button"
                disabled={checkingOut || calculatingBill || Boolean(checkoutError)}
                onClick={handleProceedToBooking}
                className="w-full bg-[#3d3f96] hover:bg-[#2d2f75] text-white py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {checkingOut ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>PROCESSING BOOKING...</span>
                  </>
                ) : (
                  <>
                    <span>CONFIRM BOOKING (₹{finalTotal})</span>
                    <ChevronRight size={16} />
                  </>
                )}
              </button>

              <div className="pt-2 border-t border-slate-50 space-y-1 text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-emerald-500 shrink-0" />
                  <span>NABL &amp; ICMR Certified Partner Labs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={13} className="text-[#3d3f96] shrink-0" />
                  <span>Anti-Fraud 6-Digit Pickup OTP Secured</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Address Selection Modal */}
      {isAddressModalOpen && (
        <AddressModal
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          selectedAddressId={selectedAddress?._id}
          userCoords={userCoords}
          onUpdateCoords={setUserCoords}
          onSelectAddress={(addr) => {
            setSelectedAddress(addr);
            if (addr.name) {
              setSelectedPatients((prev) =>
                prev.map((p) => (p.patientId === 'Self' && !p.isCustomName ? { ...p, name: addr.name } : p))
              );
            }
            setIsAddressModalOpen(false);
            if (pendingBooking) setPendingBooking(null);
            showNotification?.(`Address set to ${addr.city}.`, 'success');
          }}
        />
      )}

      {/* Coupons Selection Modal */}
      {isCouponModalOpen && (
        <CouponsModal
          isOpen={isCouponModalOpen}
          onClose={() => setIsCouponModalOpen(false)}
          cartTotal={multipliedTotal}
          appliedCoupon={appliedCoupon}
          labId={labId}
          onApplyCoupon={(coupon) => {
            setAppliedCoupon(coupon);
            if (pendingBooking) setPendingBooking(null);
            showNotification?.(`Coupon ${coupon.couponName} applied!`, 'success');
          }}
          onRemoveCoupon={() => {
            setAppliedCoupon(null);
            if (pendingBooking) setPendingBooking(null);
            showNotification?.('Coupon removed.', 'success');
          }}
        />
      )}

      {/* Order Confirmed Success Modal */}
      {isSuccessModalOpen && placedOrderData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-left">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] p-6 sm:p-8 max-w-md w-full relative z-10 text-center shadow-2xl border border-slate-100 space-y-5"
          >
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={38} />
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Lab Booking Confirmed!
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {placedOrderData.collectionType === 'Home Collection'
                  ? "A certified phlebotomist will arrive for sample draw at your scheduled slot."
                  : "Your appointment slot at the diagnostic center is confirmed."}
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2.5 text-left text-xs font-bold text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400">Booking ID:</span>
                <span className="text-slate-900 font-black">{placedOrderData.bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Slot:</span>
                <span className="text-slate-900 font-black flex items-center gap-1">
                  <Calendar size={12} className="text-[#3d3f96]" />
                  {placedOrderData.appointmentDate} • {placedOrderData.appointmentTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment:</span>
                <span className="text-slate-900 font-black uppercase">
                  {placedOrderData.paymentMethod} ({placedOrderData.paymentStatus || 'Confirmed'})
                </span>
              </div>

              {placedOrderData.pickupOtp && (
                <div className="flex justify-between items-center bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  <span className="text-amber-800 flex items-center gap-1 font-black">
                    <KeyRound size={14} /> Pickup OTP:
                  </span>
                  <span className="text-base font-black text-amber-900 tracking-wider">
                    {placedOrderData.pickupOtp}
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setIsSuccessModalOpen(false);
                router.push('/lab');
              }}
              className="w-full bg-[#3d3f96] hover:bg-[#2d2f75] text-white py-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 transition-all cursor-pointer"
            >
              Return to Diagnostics <ArrowRight size={16} />
            </button>
          </motion.div>
        </div>
      )}
    </main>
  );
}