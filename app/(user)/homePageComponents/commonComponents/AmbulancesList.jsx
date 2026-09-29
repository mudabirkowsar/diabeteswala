"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Ambulance,
  Clock,
  ShieldCheck,
  ArrowRight,
  HeartPulse,
  MapPin,
  ChevronRight,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Navigation,
  Star,
  User,
  Activity,
  Phone
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Import your UserAPI service (adjust path if needed)
import UserAPI from '../../../services/UserAPI';

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

export default function AmbulancesList() {
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState({
    lat: 30.7046,
    lng: 76.7179,
    source: 'Default (Mohali)'
  });
  const [activeVehicleType, setActiveVehicleType] = useState('all');

  // --- 1. Coordinate Resolution Hierarchy (LocalStorage -> Browser GPS -> Default) ---
  useEffect(() => {
    const saved = getInitialCoords();
    if (saved.lat && saved.lng && !isNaN(saved.lat) && !isNaN(saved.lng)) {
      setUserLocation({
        lat: saved.lat,
        lng: saved.lng,
        source: 'Saved Location'
      });
      return;
    }

    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const detectedCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation({
            ...detectedCoords,
            source: 'Live GPS Location'
          });
          try {
            localStorage.setItem("userCoords", JSON.stringify(detectedCoords));
          } catch (e) {
            console.error("Error writing user coords to localStorage:", e);
          }
        },
        (error) => {
          console.warn('Geolocation unavailable, using default coords:', error.message);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []);

  // --- 2. Fetch Nearest Ambulances from User API ---
  const fetchNearestAmbulances = useCallback(async () => {
    setLoading(true);
    try {
      const payload = {
        lat: userLocation.lat,
        lng: userLocation.lng,
        search: '',
        city: '',
        type: 'all',
        hasNurse: false,
        hasDoctor: false,
        page: 1,
        limit: 8
      };

      if (activeVehicleType !== 'all') {
        payload.vehicleType = activeVehicleType;
      }

      const response = await UserAPI.getNearestAmbulances(payload);
      if (response && response.success) {
        setAmbulances(response.data || []);
      } else {
        setAmbulances([]);
      }
    } catch (err) {
      console.error('Error fetching nearest ambulances:', err);
      toast.error(err.response?.data?.message || 'Failed to locate emergency ambulances.');
    } finally {
      setLoading(false);
    }
  }, [userLocation.lat, userLocation.lng, activeVehicleType]);

  useEffect(() => {
    fetchNearestAmbulances();
  }, [fetchNearestAmbulances]);

  // Image helper based on vehicle type
  const getAmbulanceImage = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('icu')) return 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?q=80&w=600&auto=format&fit=crop';
    if (t.includes('advance') || t.includes('cardiac') || t.includes('als')) return 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=600&auto=format&fit=crop';
    return 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?q=80&w=600&auto=format&fit=crop';
  };

  return (
    <section className="py-16 bg-white overflow-hidden text-left">
      <Toaster position="top-right" />
      <div className="max-w-[1400px] mx-auto px-6">

        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-3.5 py-1.5 rounded-full border border-red-100">
              <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Live Dispatch Network
              </span>
              <span className="text-[10px] font-bold text-slate-400">|</span>
              <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                <Navigation size={11} className="text-red-500" />
                {userLocation.source}
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Emergency <span className="text-[#3d3f96]">Ambulance On Call</span>
            </h2>
            <p className="text-slate-500 font-medium text-sm max-w-lg">
              Instant GPS-tracked medical fleet dispatched nearest to your location with oxygen, paramedic and ICU support.
            </p>
          </div>

          {/* Action CTA */}
          <Link href="/ambulance">
            <button className="group flex items-center gap-3 bg-[#3d3f96] text-white px-7 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-[#2d2f75] transition-all active:scale-95 cursor-pointer">
              <span>View All Fleet</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>

        {/* --- Vehicle Category Filter Pills --- */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 [&::-webkit-scrollbar]:hidden">
          {[
            { id: 'all', label: 'All Units' },
            { id: 'Advance Life Support', label: 'Advance Life Support' },
            { id: 'ICU Ambulance', label: 'ICU on Wheels' },
            { id: 'Van', label: 'Basic Transport' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveVehicleType(item.id)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer shrink-0 ${activeVehicleType === item.id
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* --- Fleet Listing / Carousel --- */}
        {loading ? (
          <div className="py-24 rounded-3xl border border-slate-100 bg-slate-50/50 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="animate-spin text-red-600" size={36} />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Scanning nearest active ambulances in your radius...
            </p>
          </div>
        ) : ambulances.length === 0 ? (
          <div className="py-20 rounded-3xl border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-center p-6">
            <AlertCircle size={40} className="text-slate-300 mb-2" />
            <h4 className="text-base font-bold text-slate-700">No Ambulances Available Nearby</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              We couldn't locate active verified emergency units for the selected category in your area right now.
            </p>
          </div>
        ) : (
          <div className="flex overflow-x-auto gap-6 pb-6 
            [&::-webkit-scrollbar]:hidden 
            [-ms-overflow-style:none] 
            [scrollbar-width:none]"
          >
            {ambulances.map((item, index) => {
              const pricing = item.pricing || {};
              const supportStaff = item.supportStaff || {};
              const hasNurse = supportStaff.nurse?.available;
              const hasDoctor = supportStaff.doctor?.available;

              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="flex-shrink-0 w-80 sm:w-84 bg-white rounded-[2.2rem] border border-slate-100 shadow-xl shadow-slate-100/60 hover:shadow-2xl hover:border-slate-200 transition-all duration-300 overflow-hidden flex flex-col group"
                >
                  {/* Image & Badges */}
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img
                      src={getAmbulanceImage(item.vehicleType)}
                      alt={item.vehicleType || 'Ambulance'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                    {/* Distance Badge */}
                    <div className="absolute top-3.5 left-3.5 bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-md">
                      <MapPin size={13} className="text-red-500" />
                      <span className="text-[11px] font-black text-slate-800">
                        {item.distanceText || (typeof item.distance === 'number' ? `${item.distance} km` : 'Nearby')}
                      </span>
                    </div>

                    {/* Provider Tag */}
                    <div className="absolute top-3.5 right-3.5 bg-[#3d3f96] text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                      {item.providerType?.includes('Independent') ? 'Independent' : 'Clinic Unit'}
                    </div>

                    {/* Vehicle Plate Details */}
                    <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white text-xs">
                      <span className="font-black tracking-wide text-white drop-shadow-md">
                        {item.vehicleNumber || 'Emergency Unit'}
                      </span>
                      <span className="text-[10px] bg-emerald-500/90 backdrop-blur-md px-2 py-0.5 rounded font-black uppercase tracking-wider text-white">
                        Online
                      </span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-black text-[#3d3f96] uppercase tracking-wider">
                          {item.vehicleType || 'Advance Life Support'}
                        </span>
                        {item.rating > 0 && (
                          <div className="flex items-center gap-1 text-[11px] font-black text-amber-500">
                            <Star size={12} fill="currentColor" />
                            <span>{item.rating}</span>
                          </div>
                        )}
                      </div>

                      <h3 className="text-lg font-black text-slate-900 leading-snug">
                        {item.driverName || 'Verified Medical Pilot'}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1 mt-0.5">
                        <MapPin size={12} className="text-slate-400" />
                        {item.city || 'Mohali'}, {item.state || 'Punjab'}
                      </p>
                    </div>

                    {/* Key Addons / Features */}
                    <div className="space-y-1.5 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-emerald-500" /> On-Board Nurse
                        </span>
                        <span className={hasNurse ? "text-emerald-700 font-black" : "text-slate-400 font-semibold"}>
                          {hasNurse ? `+₹${supportStaff.nurse?.price}` : 'Unavailable'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-emerald-500" /> Doctor On-Board
                        </span>
                        <span className={hasDoctor ? "text-indigo-700 font-black" : "text-slate-400 font-semibold"}>
                          {hasDoctor ? `+₹${supportStaff.doctor?.price}` : 'Unavailable'}
                        </span>
                      </div>
                    </div>

                    {/* Footer Action to detail page */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                          Base 1-Way Fare
                        </p>
                        <p className="text-lg font-black text-slate-900">
                          ₹{pricing.singleRidePrice || 400}
                          <span className="text-[10px] text-slate-400 font-bold"> / {pricing.baseDistance || 5}km</span>
                        </p>
                      </div>

                      <Link href={`/ambulance/ambulancedetail/${item._id}?lat=${userLocation.lat}&lng=${userLocation.lng}`}>
                        <button className="p-3 rounded-xl bg-[#3d3f96] hover:bg-[#2d2f75] text-white transition-all active:scale-95 shadow-md shadow-indigo-100 cursor-pointer flex items-center gap-1">
                          <span className="text-xs font-black uppercase tracking-wider pl-1">Book</span>
                          <ChevronRight size={16} />
                        </button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* --- Bottom Trust Strip --- */}
        <div className="mt-6 flex items-center gap-6 opacity-75 flex-wrap">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <ShieldCheck size={16} className="text-emerald-600" /> Government & RTO Verified
          </div>
          <div className="w-1 h-1 bg-slate-300 rounded-full" />
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <Clock size={16} className="text-red-600" /> 24x7 Immediate Dispatch
          </div>
          <div className="w-1 h-1 bg-slate-300 rounded-full" />
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <Activity size={16} className="text-[#3d3f96]" /> Live GPS Tracking
          </div>
        </div>
      </div>
    </section>
  );
}