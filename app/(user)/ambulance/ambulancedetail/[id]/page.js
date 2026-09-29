"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Ambulance, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  ArrowLeft, 
  HeartPulse, 
  Stethoscope, 
  User, 
  Check, 
  AlertCircle, 
  Star, 
  CheckCircle2, 
  IndianRupee, 
  Loader2, 
  Navigation, 
  Building2, 
  Share2
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Import UserAPI service
import UserAPI from '../../../../services/UserAPI';

// Helper function to read coordinates from localStorage
const getInitialCoords = () => {
    let lat;
    let lng;

    if (typeof window !== "undefined") {
        const savedCoords = localStorage.getItem("userCoords");
        if (savedCoords) {
            try {
                const parsed = JSON.parse(savedCoords);
                if (parsed.lat !== undefined && parsed.lng !== undefined) {
                    lat = Number(parsed.lat);
                    lng = Number(parsed.lng);
                }
            } catch (e) {
                console.error("Error reading stored user coordinates:", e);
            }
        }
    }
    return { lat, lng };
};

export default function AmbulanceDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const ambulanceId = params?.id;

  // Search Param Coordinates (if passed via URL)
  const queryLat = searchParams?.get('lat');
  const queryLng = searchParams?.get('lng');

  // State Management
  const [ambulance, setAmbulance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRideType, setSelectedRideType] = useState('single'); // 'single' | 'double'
  const [includeNurse, setIncludeNurse] = useState(false);
  const [includeDoctor, setIncludeDoctor] = useState(false);
  const [bookingProcessing, setBookingProcessing] = useState(false);

  // --- Fetch Ambulance Details with Coordinates ---
  const fetchDetails = useCallback(async () => {
    if (!ambulanceId) return;
    setLoading(true);
    try {
      // 1. Check URL search params first, then localStorage fallback, then default
      const saved = getInitialCoords();
      const resolvedLat = queryLat ? parseFloat(queryLat) : (saved.lat || 30.7046);
      const resolvedLng = queryLng ? parseFloat(queryLng) : (saved.lng || 76.7179);

      const geoParams = {
        lat: resolvedLat,
        lng: resolvedLng
      };

      const response = await UserAPI.getAmbulanceDetails(ambulanceId, geoParams);
      if (response && response.success) {
        setAmbulance(response.data);
      } else {
        toast.error('Failed to load ambulance specifications.');
      }
    } catch (err) {
      console.error('Error fetching ambulance details:', err);
      toast.error(err.response?.data?.message || 'Ambulance record not found.');
    } finally {
      setLoading(false);
    }
  }, [ambulanceId, queryLat, queryLng]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  // Fare Calculation
  const calculateTotalFare = () => {
    if (!ambulance) return 0;
    const baseFare = selectedRideType === 'single'
      ? (ambulance.pricing?.singleRidePrice || 400)
      : (ambulance.pricing?.doubleRidePrice || 700);

    let addonTotal = 0;
    if (includeNurse && ambulance.supportStaff?.nurse?.available) {
      addonTotal += (ambulance.supportStaff?.nurse?.price || 0);
    }
    if (includeDoctor && ambulance.supportStaff?.doctor?.available) {
      addonTotal += (ambulance.supportStaff?.doctor?.price || 0);
    }

    return baseFare + addonTotal;
  };

  const handleBookNow = () => {
    setBookingProcessing(true);
    setTimeout(() => {
      setBookingProcessing(false);
      toast.success(`Dispatch request initiated for ${ambulance?.vehicleNumber}! Contacting driver...`);
    }, 1200);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 space-y-4">
        <Toaster position="top-right" />
        <Loader2 className="animate-spin text-red-600" size={42} />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
          Loading vehicle specifications & emergency staff availability...
        </p>
      </div>
    );
  }

  if (!ambulance) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <Toaster position="top-right" />
        <AlertCircle size={52} className="text-rose-400 mb-3" />
        <h2 className="text-xl font-black text-slate-800">Ambulance Not Available</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          The requested emergency unit might have been reassigned or is currently offline.
        </p>
        <button
          onClick={() => router.back()}
          className="mt-6 px-6 py-2.5 bg-[#3d3f96] text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
        >
          Go Back
        </button>
      </div>
    );
  }

  const { pricing = {}, supportStaff = {} } = ambulance;
  const nurseAvailable = supportStaff.nurse?.available;
  const doctorAvailable = supportStaff.doctor?.available;

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 py-8 px-4 sm:px-6 lg:px-8 text-left antialiased">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto space-y-6">

        {/* --- Top Navigation Bar --- */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-600 hover:text-slate-900 bg-white px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-xs transition cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to Fleet</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Active Dispatch Unit
            </span>
          </div>
        </div>

        {/* --- Main Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left 2 Cols: Unit Specs & Staff */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center border border-red-200 shrink-0">
                    <Ambulance size={32} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        {ambulance.vehicleNumber || 'Emergency Unit'}
                      </h1>
                      <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-md bg-red-100/80 text-red-700 border border-red-200">
                        {ambulance.vehicleType || 'Advance Life Support'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-bold mt-1">
                      Provider: <strong className="text-slate-700">{ambulance.providerType || 'Independent Partner'}</strong>
                    </p>
                  </div>
                </div>

                {ambulance.distanceText && (
                  <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-2xl flex items-center gap-2 shrink-0">
                    <MapPin size={15} className="text-red-500" />
                    <div>
                      <span className="text-[9px] font-black uppercase block tracking-wider text-red-500">Live Distance</span>
                      <strong className="text-xs font-black">{ambulance.distanceText}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Spec Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Base Hub</span>
                  <strong className="text-xs font-black text-slate-800">{ambulance.city || 'Mohali'}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Blood Group</span>
                  <strong className="text-xs font-black text-rose-600">{ambulance.bloodGroup || 'N/A'}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Experience</span>
                  <strong className="text-xs font-black text-slate-800">{ambulance.experienceYears || '0 Years'}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Service Radius</span>
                  <strong className="text-xs font-black text-slate-800">{ambulance.serviceRadius || '15 km'}</strong>
                </div>
              </div>
            </div>

            {/* Pilot / Driver Contact Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <User size={15} className="text-indigo-600" /> Driver & Operational Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100 space-y-1">
                  <span className="text-[10px] font-black uppercase text-indigo-600 block">Lead Pilot</span>
                  <h4 className="text-base font-black text-slate-900">{ambulance.driverName || ambulance.name}</h4>
                  <p className="text-slate-600 font-bold flex items-center gap-1.5 pt-1">
                    <Phone size={13} className="text-indigo-500" /> {ambulance.phone}
                  </p>
                  <p className="text-slate-500 font-medium flex items-center gap-1.5 truncate">
                    <Mail size={13} className="text-indigo-500" /> {ambulance.email || 'dispatch@ambulance.com'}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-500 block">Station Location</span>
                  <h4 className="text-sm font-black text-slate-800">{ambulance.address || 'Central Ambulance Terminal'}</h4>
                  <p className="text-slate-500 font-medium">
                    {ambulance.city}, {ambulance.state} - {ambulance.country || 'India'}
                  </p>
                  {ambulance.clinic && (
                    <p className="text-[11px] font-bold text-indigo-700 pt-1">
                      Affiliated with {ambulance.clinic.clinicName || 'Partner Clinic'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Support Staff Add-Ons */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <HeartPulse size={15} className="text-emerald-600" /> Optional Medical Staff Add-Ons
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nurse Option */}
                <div 
                  onClick={() => nurseAvailable && setIncludeNurse(!includeNurse)}
                  className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between ${
                    !nurseAvailable 
                      ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                      : includeNurse
                        ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-emerald-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Stethoscope size={16} className={nurseAvailable ? "text-emerald-600" : "text-slate-400"} />
                      <strong className="text-xs font-black text-slate-900">Registered Nurse</strong>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {nurseAvailable ? `Emergency stabilization (+₹${supportStaff.nurse?.price})` : 'Not available on this unit'}
                    </p>
                  </div>
                  {nurseAvailable && (
                    <div className={`w-6 h-6 rounded-lg border flex items-center justify-center ${
                      includeNurse ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                    }`}>
                      {includeNurse && <Check size={14} strokeWidth={3} />}
                    </div>
                  )}
                </div>

                {/* Doctor Option */}
                <div 
                  onClick={() => doctorAvailable && setIncludeDoctor(!includeDoctor)}
                  className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between ${
                    !doctorAvailable 
                      ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                      : includeDoctor
                        ? 'bg-indigo-50 border-indigo-500 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-indigo-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <HeartPulse size={16} className={doctorAvailable ? "text-indigo-600" : "text-slate-400"} />
                      <strong className="text-xs font-black text-slate-900">Critical Care Doctor</strong>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {doctorAvailable ? `Advanced ALS/ICU Care (+₹${supportStaff.doctor?.price})` : 'Not available on this unit'}
                    </p>
                  </div>
                  {doctorAvailable && (
                    <div className={`w-6 h-6 rounded-lg border flex items-center justify-center ${
                      includeDoctor ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'
                    }`}>
                      {includeDoctor && <Check size={14} strokeWidth={3} />}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Right 1 Col: Booking & Fare Calculator Ledger */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xl shadow-slate-100 space-y-6 sticky top-6">
              
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Fare Breakdown</span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">Booking Summary</h3>
              </div>

              {/* Ride Type Switcher */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setSelectedRideType('single')}
                  className={`py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                    selectedRideType === 'single'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  1-Way Ride
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRideType('double')}
                  className={`py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                    selectedRideType === 'double'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Round Trip
                </button>
              </div>

              {/* Price Calculation Items */}
              <div className="space-y-2.5 text-xs font-bold border-t border-b border-slate-100 py-4">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Base Booking ({selectedRideType === 'single' ? 'One-Way' : 'Round-Trip'}):</span>
                  <span className="font-black text-slate-900">
                    ₹{selectedRideType === 'single' ? (pricing.singleRidePrice || 400) : (pricing.doubleRidePrice || 700)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Included Distance:</span>
                  <span>{pricing.baseDistance || 5} km</span>
                </div>

                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Rate After Base Distance:</span>
                  <span>₹{pricing.pricePerKM || 12}/km</span>
                </div>

                {includeNurse && nurseAvailable && (
                  <div className="flex items-center justify-between text-emerald-700">
                    <span>Nurse On-Board:</span>
                    <span className="font-black">+₹{supportStaff.nurse?.price}</span>
                  </div>
                )}

                {includeDoctor && doctorAvailable && (
                  <div className="flex items-center justify-between text-indigo-700">
                    <span>Doctor On-Board:</span>
                    <span className="font-black">+₹{supportStaff.doctor?.price}</span>
                  </div>
                )}
              </div>

              {/* Total Estimated Cost */}
              <div>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">Estimated Total</span>
                  <div className="text-2xl font-black text-slate-900">
                    ₹{calculateTotalFare()}
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold">
                  *Tolls, extra kilometer charges, and statutory night surcharges may apply based on final GPS route.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  disabled={bookingProcessing}
                  onClick={handleBookNow}
                  className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-500/20 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  {bookingProcessing ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Ambulance size={16} />
                  )}
                  <span>{bookingProcessing ? 'Contacting Pilot...' : 'Confirm Dispatch Now'}</span>
                </button>

                <a
                  href={`tel:${ambulance.phone}`}
                  className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Phone size={14} className="text-slate-600" />
                  <span>Call Pilot Directly</span>
                </a>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}