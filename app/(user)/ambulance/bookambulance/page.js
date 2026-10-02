"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { 
  Ambulance, 
  ArrowLeft, 
  MapPin, 
  Phone, 
  User, 
  ShieldCheck, 
  HeartPulse, 
  Clock, 
  Calendar as CalendarIcon, 
  IndianRupee, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  LocateFixed, 
  Send, 
  Loader2, 
  Sparkles, 
  Ticket, 
  CreditCard, 
  Banknote, 
  Radio, 
  Check, 
  X, 
  AlertCircle, 
  Stethoscope, 
  KeyRound, 
  Zap,
  CalendarCheck
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Import UserAPI service
import UserAPI from '../../../services/UserAPI';

export default function BookAmbulancePage() {
  const router = useRouter();

  // -------------------------------------------------------------
  // 1. BASE STATE (PREVIOUS PAGE SELECTION)
  // -------------------------------------------------------------
  const [initialBooking, setInitialBooking] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // User Service Type: 'emergency' | 'scheduled'
  const [serviceType, setServiceType] = useState('emergency');

  // -------------------------------------------------------------
  // 2. FORM & BOOKING STATES
  // -------------------------------------------------------------
  // Route / Locations
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupCoords, setPickupCoords] = useState({ lat: 30.7046, lng: 76.7179 });
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [dropoffCoords, setDropoffCoords] = useState({ lat: 30.7185, lng: 76.7112 });
  const [isLocating, setIsLocating] = useState(false);

  // Patient Info
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('Male');
  const [patientRelation, setPatientRelation] = useState('Self');
  const [patientCondition, setPatientCondition] = useState('');
  const [purpose, setPurpose] = useState('Hospital Patient Transfer');

  // Scheduled Service Specifics
  const [scheduledDate, setScheduledDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [estimateTime, setEstimateTime] = useState('1 hr 30 mins');

  // Support Staff & Add-ons
  const [selectedStaffList, setSelectedStaffList] = useState([]);

  // Ride Mode
  const [rideType, setRideType] = useState('Single Ride'); // 'Single Ride' | 'Double Ride'

  // Payment & Coupons
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' | 'Online'
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState('');

  // Fare Preview Breakdown
  const [fareBreakdown, setFareBreakdown] = useState(null);
  const [calculatingFare, setCalculatingFare] = useState(false);

  // Execution & Confirmation
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [confirmedBookingResult, setConfirmedBookingResult] = useState(null);

  // -------------------------------------------------------------
  // 3. LOAD PERSISTED DATA FROM PREVIOUS STEP
  // -------------------------------------------------------------
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("pendingAmbulanceBooking");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setInitialBooking(parsed);

          if (parsed.selectedRideType === 'double') {
            setRideType('Double Ride');
          } else {
            setRideType('Single Ride');
          }

          if (parsed.selectedFacilities && Array.isArray(parsed.selectedFacilities)) {
            const formattedStaff = parsed.selectedFacilities.map(f => ({
              facilityId: f.facilityId || f._id,
              name: f.name,
              price: f.price
            }));
            setSelectedStaffList(formattedStaff);
          }

          if (parsed.ambulance?.clinic?.address) {
            setDropoffAddress(`${parsed.ambulance.clinic.name}, ${parsed.ambulance.clinic.address}`);
          }
        } catch (e) {
          console.error("Error reading saved booking data:", e);
        }
      }
      setLoadingInitial(false);
    }
  }, []);

  const ambulanceId = initialBooking?.ambulanceId || initialBooking?.ambulance?._id;

  // -------------------------------------------------------------
  // 4. API 1: FETCH TIME SLOTS (SCHEDULED SERVICE ONLY)
  // -------------------------------------------------------------
  const fetchTimeSlots = useCallback(async (ambId, dateStr) => {
    if (!ambId || !dateStr) return;
    setLoadingSlots(true);
    try {
      const response = await UserAPI.getAmbulanceBookingSlots(ambId, { date: dateStr });
      if (response && response.success) {
        setSlots(response.slots || []);
        const firstAvail = (response.slots || []).find(s => s.isAvailable !== false && s.status !== 'Booked');
        if (firstAvail) {
          setSelectedSlot(firstAvail.displayTime || firstAvail.slotTime);
        } else {
          setSelectedSlot(null);
        }
      } else {
        setSlots([]);
      }
    } catch (err) {
      console.error("Failed to load time slots:", err);
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    if (serviceType === 'scheduled' && ambulanceId) {
      fetchTimeSlots(ambulanceId, scheduledDate);
    }
  }, [serviceType, ambulanceId, scheduledDate, fetchTimeSlots]);

  // -------------------------------------------------------------
  // 5. API 2: FETCH APPLICABLE COUPONS
  // -------------------------------------------------------------
  useEffect(() => {
    const fetchCoupons = async () => {
      if (!ambulanceId) return;
      try {
        const response = await UserAPI.getApplicableAmbulanceCoupons(ambulanceId);
        if (response && response.success) {
          setAvailableCoupons(response.data || []);
        }
      } catch (err) {
        console.error("Failed to load coupons:", err);
      }
    };
    fetchCoupons();
  }, [ambulanceId]);

  // -------------------------------------------------------------
  // 6. API 3: CALCULATE FARE (STEP 2 PREVIEW)
  // -------------------------------------------------------------
  const calculateFare = useCallback(async () => {
    if (!ambulanceId) return;

    setCalculatingFare(true);
    try {
      const payload = {
        ambulanceId,
        rideType,
        pickupLocation: {
          address: pickupAddress.trim() || "Sector 62, Phase 8, Mohali (Pickup Point)",
          lat: pickupCoords.lat || 30.7046,
          lng: pickupCoords.lng || 76.7179
        },
        dropoffLocation: {
          address: dropoffAddress.trim() || "Emergency Super Speciality Hospital",
          lat: dropoffCoords.lat || 30.7185,
          lng: dropoffCoords.lng || 76.7112
        },
        supportStaff: selectedStaffList,
        couponCode: appliedCouponCode || undefined
      };

      const response = await UserAPI.calculateAmbulanceFare(payload);
      if (response && response.success) {
        setFareBreakdown(response.data);
      }
    } catch (err) {
      console.error("Fare calculation error:", err);
      // Client-side fallback calculation
      if (initialBooking?.ambulance?.pricing) {
        const base = rideType === 'Single Ride' 
          ? (initialBooking.ambulance.pricing.singleRidePrice || 400)
          : (initialBooking.ambulance.pricing.doubleRidePrice || 700);
        const staffSum = selectedStaffList.reduce((acc, curr) => acc + (curr.price || 0), 0);
        setFareBreakdown({
          pricingBreakdown: {
            baseRideCharge: base,
            distanceCharge: 0,
            staffChargesTotal: staffSum,
            subtotal: base + staffSum,
            couponDiscount: 0,
            totalPayable: base + staffSum
          },
          routeDetails: {
            distanceInKM: initialBooking.ambulance.pricing.baseDistance || 5,
            extraKM: 0
          }
        });
      }
    } finally {
      setCalculatingFare(false);
    }
  }, [ambulanceId, rideType, pickupAddress, pickupCoords, dropoffAddress, dropoffCoords, selectedStaffList, appliedCouponCode, initialBooking]);

  useEffect(() => {
    if (ambulanceId) {
      calculateFare();
    }
  }, [calculateFare, ambulanceId]);

  // -------------------------------------------------------------
  // 7. GPS AUTO-DETECT HANDLER
  // -------------------------------------------------------------
  const handleDetectGPS = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPickupCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setPickupAddress("Current GPS Location (Coordinates Attached)");
          setIsLocating(false);
          toast.success("Current GPS coordinates locked!");
        },
        () => {
          setPickupCoords({ lat: 30.7046, lng: 76.7179 });
          setPickupAddress("Sector 62, Phase 8, Mohali (GPS Approx)");
          setIsLocating(false);
          toast.success("Approximate location selected");
        },
        { timeout: 5000 }
      );
    } else {
      setIsLocating(false);
      toast.error("Geolocation not supported on this device.");
    }
  };

  // -------------------------------------------------------------
  // 8. COUPON HANDLERS
  // -------------------------------------------------------------
  const handleApplyCoupon = (code) => {
    if (!code) return;
    setAppliedCouponCode(code);
    toast.success(`Coupon "${code}" applied!`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCouponCode('');
    toast.success('Coupon removed.');
  };

  // -------------------------------------------------------------
  // 9. API 4 & 5: DISPATCH SUBMISSION
  // -------------------------------------------------------------
  const handleFinalBooking = async (e) => {
    e.preventDefault();

    if (!patientName.trim()) {
      toast.error("Please enter the patient's full name.");
      return;
    }
    if (!pickupAddress.trim()) {
      toast.error("Please specify a pickup location.");
      return;
    }
    if (serviceType === 'scheduled' && !selectedSlot) {
      toast.error("Please select a time slot for the scheduled ride.");
      return;
    }

    setSubmittingBooking(true);

    try {
      let bookingResponse;

      if (serviceType === 'emergency') {
        // Immediate Emergency Flow
        const emergencyPayload = {
          pickupLocation: {
            address: pickupAddress,
            lat: pickupCoords.lat,
            lng: pickupCoords.lng
          },
          dropoffLocation: {
            address: dropoffAddress || "Nearest Emergency Hospital",
            lat: dropoffCoords.lat,
            lng: dropoffCoords.lng
          },
          patientDetails: {
            name: patientName,
            relation: patientRelation,
            age: Number(patientAge) || 45,
            gender: patientGender,
            condition: patientCondition || "Acute Emergency"
          },
          purpose: "Emergency Medical Care",
          estimateTime: "Immediate (30 mins)",
          paymentMethod: paymentMethod
        };

        bookingResponse = await UserAPI.bookEmergencyAmbulance(emergencyPayload);
      } else {
        // Scheduled Referral Flow
        const referralPayload = {
          ambulanceId: ambulanceId,
          rideType: rideType,
          pickupLocation: {
            address: pickupAddress,
            lat: pickupCoords.lat,
            lng: pickupCoords.lng
          },
          dropoffLocation: {
            address: dropoffAddress || "Designated Hospital Destination",
            lat: dropoffCoords.lat,
            lng: dropoffCoords.lng
          },
          patientDetails: {
            name: patientName,
            age: Number(patientAge) || 50,
            gender: patientGender,
            relation: patientRelation,
            condition: patientCondition || "Scheduled Patient Transport"
          },
          purpose: purpose || "Hospital Transfer",
          scheduledDate: scheduledDate,
          scheduledTime: selectedSlot,
          estimateTime: estimateTime || "1 hr 30 mins",
          supportStaff: selectedStaffList,
          couponCode: appliedCouponCode || undefined,
          paymentMethod: paymentMethod
        };

        bookingResponse = await UserAPI.bookReferralAmbulance(referralPayload);
      }

      if (bookingResponse && bookingResponse.success) {
        if (paymentMethod === 'Online' && bookingResponse.isOnlinePayment) {
          initiateRazorpayPayment(bookingResponse);
        } else {
          setConfirmedBookingResult(bookingResponse);
          localStorage.removeItem("pendingAmbulanceBooking");
          toast.success(bookingResponse.message || "Booking confirmed successfully!");
        }
      } else {
        toast.error(bookingResponse?.message || "Failed to confirm ambulance request.");
      }
    } catch (err) {
      console.error("Booking error:", err);
      toast.error(err.response?.data?.message || "Error submitting booking request.");
    } finally {
      setSubmittingBooking(false);
    }
  };

  // -------------------------------------------------------------
  // 10. API 6: RAZORPAY PAYMENT VERIFICATION
  // -------------------------------------------------------------
  const initiateRazorpayPayment = (orderRes) => {
    if (typeof window === "undefined" || !window.Razorpay) {
      toast.error("Razorpay payment gateway unavailable. Please choose Cash on Delivery.");
      return;
    }

    const options = {
      key: orderRes.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_key",
      amount: orderRes.amount,
      currency: "INR",
      name: "Ambulance Dispatch Services",
      description: `Ride Booking ID: ${orderRes.bookingId}`,
      order_id: orderRes.razorpayOrderId,
      handler: async function (response) {
        try {
          const verifyPayload = {
            bookingId: orderRes.bookingId,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature
          };

          const verifyRes = await UserAPI.verifyAmbulancePayment(verifyPayload);
          if (verifyRes && verifyRes.success) {
            toast.success("Payment verified! Ambulance is dispatched.");
            setConfirmedBookingResult(verifyRes);
            localStorage.removeItem("pendingAmbulanceBooking");
          } else {
            toast.error("Payment verification failed.");
          }
        } catch (vErr) {
          console.error("Verification error:", vErr);
          toast.error("Payment verification encountered an issue.");
        }
      },
      prefill: {
        name: patientName,
        contact: initialBooking?.ambulance?.phone || "9876543210"
      },
      theme: {
        color: "#DC2626"
      }
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Loader2 className="animate-spin text-red-600" size={36} />
      </div>
    );
  }

  if (!initialBooking && !confirmedBookingResult) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <Toaster position="top-right" />
        <AlertTriangle size={52} className="text-amber-500 mb-3" />
        <h2 className="text-xl font-black text-slate-800">No Ambulance Selected</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Please select an emergency unit from the fleet before checking out.
        </p>
        <button
          onClick={() => router.push('/ambulance')}
          className="mt-6 px-6 py-2.5 bg-slate-900 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer hover:bg-slate-800"
        >
          Return to Ambulance Fleet
        </button>
      </div>
    );
  }

  const { ambulance } = initialBooking || {};
  const pricingData = fareBreakdown?.pricingBreakdown;

  // -------------------------------------------------------------
  // 11. CONFIRMATION SUCCESS SCREEN
  // -------------------------------------------------------------
  if (confirmedBookingResult) {
    return (
      <div className="min-h-screen bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 antialiased">
        <Toaster position="top-right" />
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 text-center space-y-6 animate-in fade-in zoom-in duration-300">
          
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 size={36} strokeWidth={2.5} />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Request {confirmedBookingResult.bookingId ? 'Confirmed' : 'Dispatched'}
            </span>
            <h2 className="text-2xl font-black text-slate-900 pt-2">Ambulance Confirmed</h2>
            <p className="text-xs text-slate-500">
              {confirmedBookingResult.message || "Your ambulance dispatch request is active."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Booking ID</span>
              <strong className="text-xs font-black text-slate-800">
                {confirmedBookingResult.bookingId || confirmedBookingResult.data?.bookingId || 'HK-EMG-ACTIVE'}
              </strong>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Case Reference</span>
              <strong className="text-xs font-black text-slate-800">
                {confirmedBookingResult.caseReference || confirmedBookingResult.data?.caseReference || 'CAS-REF-9021'}
              </strong>
            </div>

            {confirmedBookingResult.otp && (
              <div className="col-span-2 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-xs font-bold text-red-600 flex items-center gap-1.5">
                  <KeyRound size={14} /> Pilot Verification OTP:
                </span>
                <span className="text-lg font-black tracking-widest text-slate-900 bg-red-50 border border-red-200 px-3 py-0.5 rounded-lg">
                  {confirmedBookingResult.otp}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => router.push('/')}
            className="w-full py-3.5 bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider rounded-2xl transition shadow-lg cursor-pointer"
          >
            Back to Home Dashboard
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 12. MAIN BOOKING FORM
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 py-8 px-4 sm:px-6 lg:px-8 text-left antialiased">
      <Toaster position="top-right" />
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="max-w-6xl mx-auto space-y-6">

        {/* Top Back Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-600 hover:text-slate-900 bg-white px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-xs transition cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to Unit Specs</span>
          </button>

          <span className="text-[11px] font-black uppercase px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
            Ambulance Checkout
          </span>
        </div>

        {/* ========================================================
            CHOOSE TYPE OF SERVICE (USER-FRIENDLY VISUAL SELECTOR)
           ======================================================== */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-red-600 block">Step 1</span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">Choose Type of Service</h2>
            </div>
            <span className="text-xs font-bold text-slate-400">Select transport urgency</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* OPTION 1: EMERGENCY SOS */}
            <div
              onClick={() => setServiceType('emergency')}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                serviceType === 'emergency'
                  ? 'border-red-600 bg-red-50/40 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${serviceType === 'emergency' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600'}`}>
                    <Radio size={22} className={serviceType === 'emergency' ? 'animate-pulse' : ''} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900">Emergency Dispatch (SOS)</h3>
                    <p className="text-xs text-red-600 font-bold">Immediate Response (Under 15 Mins)</p>
                  </div>
                </div>

                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  serviceType === 'emergency' ? 'border-red-600 bg-red-600 text-white' : 'border-slate-300'
                }`}>
                  {serviceType === 'emergency' && <Check size={12} strokeWidth={3} />}
                </div>
              </div>

              <p className="text-xs text-slate-500 font-medium mt-3 pt-3 border-t border-slate-200/60 leading-relaxed">
                Instant emergency broadcast to the closest available ambulances. No slot scheduling needed.
              </p>
            </div>

            {/* OPTION 2: SCHEDULED / HOSPITAL REFERRAL */}
            <div
              onClick={() => setServiceType('scheduled')}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                serviceType === 'scheduled'
                  ? 'border-indigo-600 bg-indigo-50/40 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${serviceType === 'scheduled' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                    <CalendarCheck size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900">Scheduled / Hospital Referral</h3>
                    <p className="text-xs text-indigo-600 font-bold">Choose Specific Date & 2-Hour Slot</p>
                  </div>
                </div>

                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  serviceType === 'scheduled' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                }`}>
                  {serviceType === 'scheduled' && <Check size={12} strokeWidth={3} />}
                </div>
              </div>

              <p className="text-xs text-slate-500 font-medium mt-3 pt-3 border-t border-slate-200/60 leading-relaxed">
                Book in advance for hospital discharge, dialysis, inter-hospital transfers, or planned clinical visits.
              </p>
            </div>

          </div>
        </div>

        {/* --- Main 2-Column Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* =========================================================
              LEFT COLUMN (7 COLS): PATIENT, LOCATION, SLOTS FORM
             ========================================================= */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleFinalBooking} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">

              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-red-600 block">Step 2</span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {serviceType === 'emergency' ? 'Emergency Dispatch Details' : 'Scheduled Transfer Reservation'}
                </h2>
              </div>

              {/* ------------------------------------------------------
                  DATE & TIME SLOTS (VISIBLE ONLY WHEN SCHEDULED IS SELECTED)
                 ------------------------------------------------------ */}
              {serviceType === 'scheduled' && (
                <div className="space-y-4 p-5 bg-indigo-50/40 rounded-3xl border border-indigo-100/80 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-indigo-900 flex items-center gap-2">
                      <CalendarIcon size={15} className="text-indigo-600" /> Select Date & Time Slot
                    </h3>
                    <span className="text-[10px] font-bold text-indigo-500">2-Hour Time Intervals</span>
                  </div>

                  {/* Date Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Scheduled Ride Date *</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Time Slots Grid */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                      <span>Available Time Slots</span>
                      {loadingSlots && (
                        <span className="text-[10px] text-indigo-600 font-bold flex items-center gap-1">
                          <Loader2 size={10} className="animate-spin" /> Loading slots...
                        </span>
                      )}
                    </label>

                    {slots.length === 0 && !loadingSlots ? (
                      <p className="text-xs text-slate-400 italic">No available slots for this date.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                        {slots.map((s, idx) => {
                          const slotValue = s.displayTime || s.slotTime;
                          const isSelected = selectedSlot === slotValue;
                          const isAvail = s.isAvailable !== false && s.status !== 'Booked';

                          return (
                            <button
                              type="button"
                              key={idx}
                              disabled={!isAvail}
                              onClick={() => isAvail && setSelectedSlot(slotValue)}
                              className={`p-2.5 rounded-xl border text-left text-xs font-bold transition flex items-center justify-between ${
                                !isAvail 
                                  ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
                                  : isSelected
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Clock size={13} className={isSelected ? "text-white" : "text-indigo-600"} />
                                <span>{s.displayTime || s.slotTime}</span>
                              </div>
                              <span className="text-[9px] font-black uppercase">
                                {isAvail ? s.category || 'Available' : 'Booked'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Transfer Purpose & Estimated Duration */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Transfer Purpose</label>
                      <input
                        type="text"
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        placeholder="e.g. Hospital Discharge / Dialysis"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Estimated Journey Duration</label>
                      <input
                        type="text"
                        value={estimateTime}
                        onChange={(e) => setEstimateTime(e.target.value)}
                        placeholder="e.g. 1 hr 30 mins"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------
                  PATIENT INFORMATION
                 ------------------------------------------------------ */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
                  Patient Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Patient Full Name *</label>
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. Rajesh Sharma"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Age *</label>
                      <input
                        type="number"
                        required
                        value={patientAge}
                        onChange={(e) => setPatientAge(e.target.value)}
                        placeholder="e.g. 52"
                        className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Gender</label>
                      <select
                        value={patientGender}
                        onChange={(e) => setPatientGender(e.target.value)}
                        className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Relation to Patient</label>
                    <input
                      type="text"
                      value={patientRelation}
                      onChange={(e) => setPatientRelation(e.target.value)}
                      placeholder="e.g. Self, Mother, Father"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Medical Symptoms / Condition</label>
                    <input
                      type="text"
                      value={patientCondition}
                      onChange={(e) => setPatientCondition(e.target.value)}
                      placeholder="e.g. Hypoglycemia / Diabetic Crisis / Post-Op"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------
                  PICKUP & DROPOFF ROUTE
                 ------------------------------------------------------ */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
                  Pickup & Destination Route
                </h3>

                {/* Pickup Address */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Pickup Address *</label>
                    <button
                      type="button"
                      onClick={handleDetectGPS}
                      disabled={isLocating}
                      className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                    >
                      <LocateFixed size={13} className={isLocating ? "animate-spin" : ""} />
                      {isLocating ? "Detecting GPS..." : "Auto-Detect GPS"}
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-red-500">
                      <MapPin size={18} />
                    </div>
                    <input
                      type="text"
                      required
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      placeholder="Enter pickup house/building address"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition"
                    />
                  </div>
                </div>

                {/* Dropoff Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Destination Hospital / Clinic *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Building2 size={18} />
                    </div>
                    <input
                      type="text"
                      required
                      value={dropoffAddress}
                      onChange={(e) => setDropoffAddress(e.target.value)}
                      placeholder="Enter destination hospital / clinic address"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------
                  PAYMENT METHOD
                 ------------------------------------------------------ */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
                  Payment Method
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-center gap-3 ${
                      paymentMethod === 'COD'
                        ? 'border-red-600 bg-red-50/40 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <Banknote size={20} className={paymentMethod === 'COD' ? "text-red-600" : "text-slate-400"} />
                    <div>
                      <h4 className="text-xs font-black text-slate-900">Cash on Delivery</h4>
                      <p className="text-[10px] text-slate-500 font-medium">Pay pilot directly</p>
                    </div>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('Online')}
                    className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-center gap-3 ${
                      paymentMethod === 'Online'
                        ? 'border-red-600 bg-red-50/40 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <CreditCard size={20} className={paymentMethod === 'Online' ? "text-red-600" : "text-slate-400"} />
                    <div>
                      <h4 className="text-xs font-black text-slate-900">Razorpay / UPI / Card</h4>
                      <p className="text-[10px] text-slate-500 font-medium">Instant online checkout</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Confirm CTA */}
              <button
                type="submit"
                disabled={submittingBooking}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-500/25 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2 mt-4"
              >
                {submittingBooking ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
                <span>
                  {submittingBooking 
                    ? "Processing..." 
                    : serviceType === 'emergency' 
                      ? "Dispatch Emergency Ambulance Now" 
                      : `Confirm Scheduled Booking (₹${pricingData?.totalPayable || 0})`
                  }
                </span>
              </button>

            </form>
          </div>

          {/* =========================================================
              RIGHT COLUMN (5 COLS): SUMMARY, COUPONS, LIVE BILL
             ========================================================= */}
          <div className="lg:col-span-5 space-y-6">

            {/* Selected Vehicle Card */}
            {ambulance && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Assigned Unit
                  </span>
                  <span className="text-[10px] font-bold bg-red-50 text-red-700 px-2 py-0.5 rounded">
                    {rideType}
                  </span>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-200 shrink-0">
                    <Ambulance size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{ambulance.vehicleNumber}</h3>
                    <p className="text-xs text-slate-500 font-semibold">{ambulance.vehicleType || 'ICU Ambulance'}</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1">
                  <p className="font-bold text-slate-800 flex items-center justify-between">
                    <span>Assigned Pilot:</span>
                    <strong className="text-slate-900">{ambulance.driverName}</strong>
                  </p>
                  <p className="text-slate-500 flex items-center justify-between">
                    <span>Phone:</span>
                    <strong className="text-slate-700">{ambulance.phone}</strong>
                  </p>
                  {ambulance.clinic && (
                    <p className="text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span>Affiliated Hub:</span>
                      <strong className="text-indigo-600">{ambulance.clinic.name}</strong>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Applicable Coupons Section (API 2) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block border-b border-slate-100 pb-2">
                Apply Promo Coupons
              </span>

              {/* Manual Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                  placeholder="ENTER PROMO CODE"
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black uppercase outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  type="button"
                  onClick={() => handleApplyCoupon(couponCodeInput)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-black transition cursor-pointer"
                >
                  Apply
                </button>
              </div>

              {/* Applied Coupon Tag */}
              {appliedCouponCode && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs font-bold text-emerald-800">
                  <span className="flex items-center gap-1.5">
                    <Ticket size={14} className="text-emerald-600" />
                    Coupon "{appliedCouponCode}" Applied
                  </span>
                  <button type="button" onClick={handleRemoveCoupon} className="text-emerald-700 hover:text-rose-600 cursor-pointer">
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Available Coupons List */}
              {availableCoupons.length > 0 && (
                <div className="space-y-2 pt-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Available Offers</p>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {availableCoupons.map((c) => (
                      <div
                        key={c._id}
                        onClick={() => handleApplyCoupon(c.couponName)}
                        className="p-2.5 rounded-xl border border-dashed border-red-200 bg-red-50/40 hover:bg-red-50 transition flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <p className="text-xs font-black text-red-700">{c.couponName}</p>
                          <p className="text-[10px] text-slate-500">{c.discountPercentage}% OFF (Up to ₹{c.maxDiscount})</p>
                        </div>
                        <span className="text-[10px] font-black text-red-600 bg-white px-2 py-0.5 rounded border border-red-200">
                          APPLY
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Selected Support Staff Breakdown */}
            {selectedStaffList.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block border-b border-slate-100 pb-2">
                  Selected Medical Add-ons
                </span>
                <div className="space-y-1.5">
                  {selectedStaffList.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <Stethoscope size={13} className="text-emerald-600" /> {item.name}
                      </span>
                      <span>+₹{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Bill Breakdown (API 3 Preview) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xl shadow-slate-100 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Fare Breakdown
                </span>
                {calculatingFare && (
                  <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                    <Loader2 size={10} className="animate-spin" /> Calculating...
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs font-bold">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Base Ride Fare:</span>
                  <span className="font-black text-slate-900">₹{pricingData?.baseRideCharge || 0}</span>
                </div>

                {pricingData?.distanceCharge > 0 && (
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Extra Distance ({fareBreakdown?.routeDetails?.extraKM || 0} km):</span>
                    <span className="font-black text-slate-900">+₹{pricingData?.distanceCharge}</span>
                  </div>
                )}

                {pricingData?.staffChargesTotal > 0 && (
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Support Staff Add-ons:</span>
                    <span className="font-black text-emerald-700">+₹{pricingData?.staffChargesTotal}</span>
                  </div>
                )}

                {pricingData?.couponDiscount > 0 && (
                  <div className="flex items-center justify-between text-rose-600">
                    <span>Coupon Discount:</span>
                    <span className="font-black">-₹{pricingData?.couponDiscount}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 block">Total Payable</span>
                  <span className="text-[10px] text-emerald-600 font-bold">
                    {paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}
                  </span>
                </div>
                <div className="text-3xl font-black text-slate-900">
                  ₹{pricingData?.totalPayable || 0}
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}