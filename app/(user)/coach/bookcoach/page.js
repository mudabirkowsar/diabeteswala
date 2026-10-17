'use client';

import React, { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Calendar, Clock, Video, MapPin, 
  ShieldCheck, User, CheckCircle2, 
  AlertCircle, Loader2, Users, Home, Building2, 
  CreditCard, Banknote, FileText, Check, Star
} from 'lucide-react';
import SelectFamilyMemberModal from './components/SelectFamilyMemberModal';
import SelectAddressModal from './components/SelectAddressModal';
import UserAPI from '../../../services/UserAPI'; // Adjust your import path

export default function BookCoachPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="animate-spin text-[#3d3f96]" size={36} />
        </div>
      }
    >
      <BookCoachContent />
    </Suspense>
  );
}

function BookCoachContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL Params from Coach Detail Page
  const coachId = searchParams.get('coachId') || '';
  const coachName = searchParams.get('coachName') || 'Certified Diabetes Coach';
  const coachQualification = searchParams.get('coachQualification') || '';
  const coachImage = searchParams.get('coachImage') || '';
  const coachType = searchParams.get('coachType') || 'Diabetes Coach';
  const scheduledDate = searchParams.get('selectedDate') || '';
  
  // Slot parameters: Keep raw 24h slotTime (e.g. "18:00") so backend matches premiumSlots correctly
  const rawSlotTime = searchParams.get('slotTime') || '';
  const displayTime = searchParams.get('displayTime') || rawSlotTime;
  
  // Exact slotTime expected by backend database for matching premium slots
  const exactSlotTime = rawSlotTime || (displayTime.includes(' - ') ? displayTime.split(' - ')[0].trim() : displayTime);

  // Read fees passed from URL
  const passedBaseFee = Number(searchParams.get('baseFee')) || 0;
  const passedExtraFee = Number(searchParams.get('extraFee')) || 0;
  const passedIsPremium = searchParams.get('isPremium') === 'true' || passedExtraFee > 0;

  // Normalize consultationMode to 'Online' or 'Offline'
  const rawMode = searchParams.get('consultationMode') || 'online';
  const consultationMode = rawMode.toLowerCase() === 'offline' ? 'Offline' : 'Online';

  // Modals state
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // Patient Selection (null = Self / Myself)
  const [selectedFamilyMember, setSelectedFamilyMember] = useState(null);
  const bookingFor = selectedFamilyMember ? 'Other' : 'Self';

  // Clinical profile for "Other" member
  const [isDiabetic, setIsDiabetic] = useState(true);
  const [diabetesType, setDiabetesType] = useState('Type 2');

  // Location configuration for Offline Mode
  const [locationType, setLocationType] = useState(consultationMode === 'Offline' ? 'Home' : 'Online');
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [hospitalDetails, setHospitalDetails] = useState({
    hospitalName: '',
    floorNo: '',
    ward: '',
    bedNo: ''
  });

  // Notes & Payment options
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Online'); // 'Online' | 'COD'

  // Dynamic Fare & Calculation state from API
  const [fareData, setFareData] = useState(null);
  const [calculatingFare, setCalculatingFare] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Success Modal State
  const [bookingSuccessData, setBookingSuccessData] = useState(null);

  // Helper: Retrieve coordinates from address or localStorage
  const getCoordinates = useCallback(() => {
    if (selectedAddress?.lat && selectedAddress?.lng) {
      return { lat: Number(selectedAddress.lat), lng: Number(selectedAddress.lng) };
    }
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('userCoords');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return { lat: Number(parsed.lat), lng: Number(parsed.lng) };
        } catch (e) {
          console.error('Error parsing user coords:', e);
        }
      }
    }
    return { lat: 30.7046, lng: 76.7179 }; // Default fallback
  }, [selectedAddress]);

  // Safe Image Helper
  const getImageSrc = (imgPath) => {
    if (!imgPath) return 'https://images.unsplash.com/photo-1594824813579-42b71c26b911?q=80&w=400&auto=format&fit=crop';
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) return imgPath;
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
    return `${baseUrl}${imgPath}`;
  };

  // 1. DYNAMIC BILL CALCULATION API CALL
  const fetchFarePreview = useCallback(async () => {
    if (!coachId || !scheduledDate || !exactSlotTime) return;

    try {
      setCalculatingFare(true);
      const coords = getCoordinates();

      const payload = {
        coachId,
        consultationMode,
        scheduledDate,
        slotTime: exactSlotTime, // Send exact 24h slotTime (e.g. "18:00")
        displayTime,
        isPremiumSlot: passedIsPremium,
        isPremium: passedIsPremium,
        premiumExtraFee: passedExtraFee,
        extraFee: passedExtraFee,
        bookingFor,
        specialInstructions
      };

      if (consultationMode === 'Offline') {
        payload.locationType = locationType;
        payload.userLat = coords.lat;
        payload.userLng = coords.lng;

        if (locationType === 'Hospital') {
          payload.hospitalDetails = hospitalDetails;
        }
      } else {
        payload.locationType = 'Online';
      }

      const res = await UserAPI.calculateDiabeticCoachFare(payload);
      if (res && res.success && res.data) {
        setFareData(res.data.pricing);
      }
    } catch (err) {
      console.error('Error calculating bill preview:', err);
    } finally {
      setCalculatingFare(false);
    }
  }, [coachId, consultationMode, scheduledDate, exactSlotTime, displayTime, passedIsPremium, passedExtraFee, bookingFor, locationType, hospitalDetails, specialInstructions, getCoordinates]);

  // Trigger fare calculation on state changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFarePreview();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchFarePreview]);

  // Ensure Premium Slot extra fee is strictly accounted for
  const isPremiumSlot = Boolean(
    fareData?.isPremiumSlot || 
    (fareData?.premiumExtraFee && Number(fareData.premiumExtraFee) > 0) || 
    passedIsPremium
  );

  const premiumExtraFee = fareData && Number(fareData.premiumExtraFee) > 0 
    ? Number(fareData.premiumExtraFee) 
    : (isPremiumSlot ? passedExtraFee : 0);

  const baseFee = fareData?.baseFee ?? passedBaseFee;
  const travelCharge = Number(fareData?.extraDistanceCharge) || 0;
  const discountAmount = Number(fareData?.discountAmount) || 0;

  // Accurately calculate total payable so frontend matches backend
  const computedTotalPayable = fareData && Number(fareData.totalPayable) > 0 && fareData.isPremiumSlot
    ? Number(fareData.totalPayable)
    : (baseFee + travelCharge + premiumExtraFee - discountAmount);

  // Load Razorpay Script dynamically for online payment
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
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

  // 2. BOOK COACH & ORDER CREATION HANDLER
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (consultationMode === 'Offline' && locationType === 'Hospital') {
      if (!hospitalDetails.hospitalName.trim()) {
        setErrorMessage('Hospital name is required when location is Hospital.');
        return;
      }
    }

    if (consultationMode === 'Offline' && locationType === 'Home' && !selectedAddress) {
      setErrorMessage('Please select a saved address for home visit consultation.');
      return;
    }

    try {
      setSubmitting(true);
      const coords = getCoordinates();

      // Pass all necessary fields so the backend charges the full amount (including Prime Fee)
      const payload = {
        coachId,
        bookingFor,
        consultationMode,
        scheduledDate,
        slotTime: exactSlotTime, // e.g. "18:00"
        displayTime,
        isPremiumSlot: isPremiumSlot,
        isPremium: isPremiumSlot,
        premiumExtraFee: premiumExtraFee,
        extraFee: premiumExtraFee,
        totalPayable: computedTotalPayable,
        specialInstructions,
        locationType: consultationMode === 'Online' ? 'Online' : locationType,
        paymentMethod
      };

      if (bookingFor === 'Other' && selectedFamilyMember) {
        let age = null;
        if (selectedFamilyMember.dob) {
          const birthYear = new Date(selectedFamilyMember.dob).getFullYear();
          if (!isNaN(birthYear)) age = new Date().getFullYear() - birthYear;
        }

        payload.patientDetails = {
          name: selectedFamilyMember.memberName || 'Family Member',
          phone: selectedFamilyMember.phone || '',
          gender: selectedFamilyMember.gender || 'Other',
          age: age,
          relation: selectedFamilyMember.relation || 'Relative',
          isDiabetic: isDiabetic,
          diabetesType: isDiabetic ? diabetesType : 'Non-Diabetic'
        };
      }

      if (consultationMode === 'Offline' && locationType === 'Home' && selectedAddress) {
        payload.address = {
          name: selectedAddress.name || '',
          phone: selectedAddress.phone || '',
          houseNo: selectedAddress.houseNo || '',
          sector: selectedAddress.sector || '',
          landmark: selectedAddress.landmark || '',
          city: selectedAddress.city || '',
          state: selectedAddress.state || '',
          pincode: selectedAddress.pincode || '',
          lat: selectedAddress.lat || coords.lat,
          lng: selectedAddress.lng || coords.lng
        };
      }

      if (consultationMode === 'Offline' && locationType === 'Hospital') {
        payload.hospitalDetails = hospitalDetails;
      }

      const response = await UserAPI.bookDiabeticCoach(payload);

      if (!response || !response.success) {
        throw new Error(response?.message || 'Failed to initiate coach booking.');
      }

      // COD Flow
      if (!response.isOnlinePayment || paymentMethod === 'COD') {
        setBookingSuccessData({
          bookingId: response.bookingId,
          sessionOtp: response.sessionOtp,
          totalPayable: response.totalPayable || computedTotalPayable,
          paymentStatus: 'Pending',
          paymentMethod: 'COD'
        });
        return;
      }

      // Online Razorpay Flow
      if (response.isOnlinePayment && response.razorpayOrderId) {
        const isScriptLoaded = await loadRazorpayScript();
        if (!isScriptLoaded) {
          throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
        }

        // Use the exact verified order amount from backend response
        const orderAmountInPaise = response.amount || (computedTotalPayable * 100);

        const options = {
          key: response.key_id,
          amount: orderAmountInPaise,
          currency: 'INR',
          name: 'DiabetesWala Coach Consultation',
          description: `Consultation with ${coachName}`,
          order_id: response.razorpayOrderId,
          handler: async function (paymentResponse) {
            try {
              setSubmitting(true);
              const verifyRes = await UserAPI.verifyDiabeticCoachPayment({
                bookingId: response.bookingId,
                razorpayOrderId: paymentResponse.razorpay_order_id,
                razorpayPaymentId: paymentResponse.razorpay_payment_id,
                razorpaySignature: paymentResponse.razorpay_signature
              });

              if (verifyRes && verifyRes.success) {
                setBookingSuccessData({
                  bookingId: verifyRes.bookingId,
                  sessionOtp: verifyRes.sessionOtp,
                  totalPayable: response.totalPayable || computedTotalPayable,
                  paymentStatus: 'Paid',
                  paymentMethod: 'Online'
                });
              } else {
                setErrorMessage(verifyRes?.message || 'Payment verification failed.');
              }
            } catch (vErr) {
              console.error('Verification error:', vErr);
              setErrorMessage('Payment verification error. Contact support.');
            } finally {
              setSubmitting(false);
            }
          },
          theme: {
            color: '#3d3f96'
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          setErrorMessage(resp.error?.description || 'Online payment was declined.');
        });
        rzp.open();
      }

    } catch (err) {
      console.error('Error creating booking:', err);
      setErrorMessage(err?.response?.data?.message || err?.message || 'Booking failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* Top Navbar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} /> Back to Slots
          </button>
          <div className="flex items-center gap-1.5 text-[#3d3f96] font-bold text-xs uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-md">
            <ShieldCheck size={16} className="text-red-500 fill-red-50" />
            Verified Booking
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Selection Cards & Forms */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Error Notification */}
            {errorMessage && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle size={16} className="shrink-0" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            {/* 1. PATIENT SELECTION (CARD ONLY - ZERO MANUAL INPUTS) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <User size={18} className="text-[#3d3f96]" />
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">Patient Profile</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#3d3f96] hover:text-slate-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <Users size={14} />
                  <span>{selectedFamilyMember ? 'Change Member' : 'Choose Member'}</span>
                </button>
              </div>

              {!selectedFamilyMember ? (
                // SELF CARD
                <div className="p-4 bg-indigo-50/40 rounded-xl border border-indigo-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#3d3f96] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      <User size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-slate-900">Myself</span>
                        <span className="text-[10px] font-bold text-white bg-[#3d3f96] px-2 py-0.5 rounded-full uppercase">
                          Self
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Your account profile, past glucose records & CGM logs will be used.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#3d3f96] bg-white px-2.5 py-1 rounded-md border border-indigo-100 shadow-xs">
                    Auto-Synced
                  </span>
                </div>
              ) : (
                // FAMILY MEMBER CARD
                <div className="space-y-3">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/90 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {selectedFamilyMember.profilePic ? (
                        <img
                          src={getImageSrc(selectedFamilyMember.profilePic)}
                          alt={selectedFamilyMember.memberName}
                          className="w-12 h-12 rounded-full object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#3d3f96] text-white flex items-center justify-center font-bold text-sm uppercase">
                          {selectedFamilyMember.memberName?.[0] || 'M'}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-slate-900">
                            {selectedFamilyMember.memberName}
                          </span>
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded uppercase">
                            {selectedFamilyMember.relation}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          {selectedFamilyMember.phone && <span>Ph: {selectedFamilyMember.phone}</span>}
                          {selectedFamilyMember.gender && <span>• {selectedFamilyMember.gender}</span>}
                          {selectedFamilyMember.dob && <span>• DOB: {selectedFamilyMember.dob}</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Diagnosed with Diabetes?</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsDiabetic(true)}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                            isDiabetic ? 'bg-[#3d3f96] text-white shadow-xs' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsDiabetic(false)}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                            !isDiabetic ? 'bg-[#3d3f96] text-white shadow-xs' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>

                    {isDiabetic && (
                      <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700">Diabetes Type</label>
                        <select
                          value={diabetesType}
                          onChange={(e) => setDiabetesType(e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none"
                        >
                          <option value="Type 2">Type 2</option>
                          <option value="Type 1">Type 1</option>
                          <option value="Prediabetes">Prediabetes</option>
                          <option value="Gestational">Gestational</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 2. OFFLINE LOCATION TYPE & ADDRESS SELECTION */}
            {consultationMode === 'Offline' && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-emerald-600" />
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-slate-900">Consultation Location</h2>
                      <p className="text-[11px] text-slate-400">Where should the coach visit?</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setLocationType('Home')}
                      className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        locationType === 'Home'
                          ? 'bg-white text-emerald-800 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Home size={13} /> Home
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocationType('Hospital')}
                      className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        locationType === 'Hospital'
                          ? 'bg-white text-[#3d3f96] shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Building2 size={13} /> Hospital
                    </button>
                  </div>
                </div>

                {locationType === 'Home' && (
                  <div>
                    {selectedAddress ? (
                      <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-200 flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-emerald-950 uppercase tracking-wide">
                              {selectedAddress.addressType || 'Home'}
                            </span>
                            <span className="text-xs text-emerald-800 font-semibold">• {selectedAddress.name}</span>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed">
                            {[selectedAddress.houseNo, selectedAddress.sector, selectedAddress.landmark].filter(Boolean).join(', ')}
                          </p>
                          <p className="text-xs text-slate-500 font-medium">
                            {selectedAddress.city}, {selectedAddress.state} - <strong>{selectedAddress.pincode}</strong>
                          </p>
                          {selectedAddress.phone && (
                            <p className="text-[11px] text-slate-400">Phone: {selectedAddress.phone}</p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsAddressModalOpen(true)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-800 bg-white border border-emerald-200 shadow-xs hover:bg-emerald-50 transition-colors cursor-pointer"
                        >
                          Change Address
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-300 p-4">
                        <MapPin size={28} className="mx-auto text-slate-400 mb-2" />
                        <p className="text-xs font-bold text-slate-700">No Address Selected</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 mb-3">Please choose your saved address for the coach visit</p>
                        <button
                          type="button"
                          onClick={() => setIsAddressModalOpen(true)}
                          className="px-4 py-2 bg-[#3d3f96] hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                        >
                          Select From Saved Addresses
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {locationType === 'Hospital' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Hospital Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Max Super Speciality Hospital"
                        value={hospitalDetails.hospitalName}
                        onChange={(e) => setHospitalDetails({ ...hospitalDetails, hospitalName: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#3d3f96]/20 focus:border-[#3d3f96]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Floor / Wing</label>
                      <input
                        type="text"
                        placeholder="e.g. 3rd Floor, Cardiology Wing"
                        value={hospitalDetails.floorNo}
                        onChange={(e) => setHospitalDetails({ ...hospitalDetails, floorNo: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#3d3f96]/20 focus:border-[#3d3f96]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Ward / Bed Number</label>
                      <input
                        type="text"
                        placeholder="e.g. Bed-304 / ICU"
                        value={hospitalDetails.bedNo}
                        onChange={(e) => setHospitalDetails({ ...hospitalDetails, bedNo: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#3d3f96]/20 focus:border-[#3d3f96]"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. SPECIAL INSTRUCTIONS / NOTES */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-2">
              <div className="flex items-center gap-2 pb-2">
                <FileText size={17} className="text-[#3d3f96]" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Special Instructions / Coach Notes
                </h3>
              </div>
              <textarea
                rows={2}
                placeholder="Mention any sudden spike readings, current medications, or specific CGM sensor concerns..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#3d3f96]/20 focus:border-[#3d3f96]"
              />
            </div>

            {/* 4. PAYMENT METHOD SELECTOR */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Select Payment Mode
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Online')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    paymentMethod === 'Online'
                      ? 'border-[#3d3f96] bg-indigo-50/50 ring-1 ring-[#3d3f96]'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CreditCard size={18} className="text-[#3d3f96]" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Online Payment</div>
                      <div className="text-[10px] text-slate-400">UPI, Cards, NetBanking</div>
                    </div>
                  </div>
                  {paymentMethod === 'Online' && <Check size={16} className="text-[#3d3f96]" />}
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    paymentMethod === 'COD'
                      ? 'border-[#3d3f96] bg-indigo-50/50 ring-1 ring-[#3d3f96]'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Banknote size={18} className="text-emerald-600" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Pay on Visit (COD)</div>
                      <div className="text-[10px] text-slate-400">Cash / UPI during session</div>
                    </div>
                  </div>
                  {paymentMethod === 'COD' && <Check size={16} className="text-[#3d3f96]" />}
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Appointment Checkout Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-5 sticky top-20">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Fare & Order Summary</span>
                {calculatingFare && <Loader2 size={14} className="animate-spin text-[#3d3f96]" />}
              </h3>

              {/* Coach Mini Profile */}
              <div className="flex gap-3 items-center">
                <img
                  src={getImageSrc(coachImage)}
                  alt={coachName}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-100"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1594824813579-42b71c26b911?q=80&w=400&auto=format&fit=crop';
                  }}
                />
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">{coachName}</h4>
                  <p className="text-xs text-slate-500">{coachQualification || coachType}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold text-[#3d3f96] bg-indigo-50 px-2 py-0.5 rounded">
                    {coachType}
                  </span>
                </div>
              </div>

              {/* Slot & Booking Overview */}
              <div className="bg-slate-50 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar size={14} className="text-[#3d3f96]" /> Date
                  </span>
                  <span className="font-bold text-slate-800">{scheduledDate || 'Not selected'}</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock size={14} className="text-[#3d3f96]" /> Slot Window
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-800">{displayTime}</span>
                    {isPremiumSlot && (
                      <span className="inline-flex items-center gap-0.5 bg-amber-500 text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                        <Star size={9} fill="currentColor" /> Prime
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5 font-medium">
                    {consultationMode === 'Online' ? (
                      <Video size={14} className="text-[#3d3f96]" />
                    ) : (
                      <MapPin size={14} className="text-emerald-600" />
                    )}
                    Mode
                  </span>
                  <span className="font-bold text-slate-800">
                    {consultationMode === 'Online' ? 'Online Video' : `In-Person (${locationType})`}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-200/60">
                  <span className="font-medium text-slate-500">Patient</span>
                  <span className="font-extrabold text-[#3d3f96]">
                    {selectedFamilyMember ? `${selectedFamilyMember.memberName} (${selectedFamilyMember.relation})` : 'Myself (Self)'}
                  </span>
                </div>
              </div>

              {/* Dynamic Bill Breakdown */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Base Consultation Fee</span>
                  <span className="font-semibold text-slate-800">₹{baseFee}</span>
                </div>

                {travelCharge > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>
                      Travel Surcharge ({fareData?.distanceInKM || 0} km)
                    </span>
                    <span className="font-semibold text-slate-800">+ ₹{travelCharge}</span>
                  </div>
                )}

                {/* Explicit Prime Slot Surcharge Row */}
                {isPremiumSlot && premiumExtraFee > 0 && (
                  <div className="flex justify-between text-amber-700 bg-amber-50/70 p-2 rounded-lg border border-amber-200/60">
                    <span className="font-semibold flex items-center gap-1">
                      <Star size={12} fill="currentColor" className="text-amber-500" />
                      Prime Slot Surcharge
                    </span>
                    <span className="font-bold">+ ₹{premiumExtraFee}</span>
                  </div>
                )}

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount Applied</span>
                    <span>- ₹{discountAmount}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-900 font-extrabold text-base pt-3 border-t border-slate-100">
                  <span>Total Payable</span>
                  <span className="text-[#3d3f96] text-lg font-black">
                    ₹{computedTotalPayable}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="button"
                onClick={handleBookingSubmit}
                disabled={submitting || calculatingFare}
                className="w-full bg-[#3d3f96] hover:bg-slate-900 text-white py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Processing Booking...</span>
                  </>
                ) : (
                  <span>
                    {paymentMethod === 'Online' ? `Pay & Confirm (₹${computedTotalPayable})` : `Confirm Booking with COD`}
                  </span>
                )}
              </button>

              <div className="bg-emerald-50 text-emerald-800 rounded-xl p-3 text-[11px] flex items-center gap-2 border border-emerald-100">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Slot collision locked. 4-Digit session verification OTP provided.</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Select Family Member Modal */}
      <SelectFamilyMemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        selectedMemberId={selectedFamilyMember?._id || null}
        onSelectMember={(member) => {
          setSelectedFamilyMember(member);
        }}
      />

      {/* Select Saved Address Modal */}
      <SelectAddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        selectedAddressId={selectedAddress?._id || null}
        onSelectAddress={(addr) => {
          setSelectedAddress(addr);
        }}
      />

      {/* 5. SUCCESS CONFIRMATION MODAL */}
      {bookingSuccessData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Consultation Confirmed!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your appointment with {coachName} has been booked.
              </p>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                Session Verification OTP
              </span>
              <span className="text-2xl font-black text-[#3d3f96] tracking-widest">
                {bookingSuccessData.sessionOtp}
              </span>
              <p className="text-[10px] text-slate-500 mt-1">
                Share this OTP with your coach when starting the consultation session.
              </p>
            </div>

            <div className="text-xs text-slate-600 space-y-1.5 py-2 border-y border-slate-100 text-left">
              <div className="flex justify-between">
                <span>Booking ID:</span>
                <strong className="text-slate-800">{bookingSuccessData.bookingId}</strong>
              </div>
              <div className="flex justify-between">
                <span>Payment Mode:</span>
                <strong className="text-slate-800">{bookingSuccessData.paymentMethod}</strong>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <strong className="text-emerald-600">{bookingSuccessData.paymentStatus}</strong>
              </div>
            </div>

            <button
              onClick={() => router.push('/')}
              className="w-full bg-[#3d3f96] hover:bg-slate-900 text-white py-3 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer"
            >
              View My Consultations
            </button>
          </div>
        </div>
      )}
    </div>
  );
}