'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Video, MapPin, Home, Calendar, ChevronRight, CheckCircle2, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import UserAPI from '../../../services/UserAPI';

function DoctorShowcase() {
  const router = useRouter();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to retrieve saved user coordinates from localStorage
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

  // Fetch nearest approved doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);

        const { lat, lng } = getInitialCoords();
        const payload = {};

        if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {
          payload.userLat = lat;
          payload.userLng = lng;
        }

        // Call API with coordinates (if available) for distance sorting
        const res = await UserAPI.getIndependentDoctors(payload);

        if (res && res.data) {
          setDoctors(res.data);
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Helper to format image URL safely
  const getImageSrc = (imgPath) => {
    if (!imgPath) {
      return 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop';
    }
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
      return imgPath;
    }
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
    return `${baseUrl}${imgPath}`;
  };

  // Route to doctor details page
  const handleDoctorClick = (id) => {
    if (id) {
      router.push(`/doctor/doctordetail/${id}`);
    }
  };

  return (
    <section className="py-20 relative">
      {/* Structural subtle geometric accents */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-70 pointer-events-none"></div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Modern Minimalist Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-slate-200/60 gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#3d3f96] font-bold text-xs tracking-widest uppercase mb-2">
              <ShieldCheck size={16} className="text-red-500 fill-red-50" />
              Verified Expert Panels
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              Consult Top <span className="text-[#3d3f96] relative inline-block">Diabetes Experts</span>
            </h2>
            <p className="text-slate-500 text-base font-normal mt-2">Direct access to clinical leaders, credentialed specialists, and certified nutritionists.</p>
          </div>
          <button
            onClick={() => router.push('/doctor')}
            className="flex items-center gap-2 text-sm font-bold text-[#3d3f96] hover:text-slate-900 transition-colors group bg-white border border-slate-200 shadow-sm px-5 py-3 rounded-2xl whitespace-nowrap self-start md:self-end cursor-pointer"
          >
            View Panel Directory
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
            <Loader2 className="animate-spin text-[#3d3f96]" size={36} />
            <p className="text-sm font-semibold">Finding nearest verified doctors...</p>
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-slate-600 font-medium">No doctors currently available in your area.</p>
          </div>
        ) : (
          /* Horizontal Scroll Layout (Scrollbar completely hidden) */
          <div
            className="flex overflow-x-auto gap-x-5 pt-8 pb-4 scroll-smooth [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {doctors.slice(0, 6).map((doc) => (
              <div
                key={doc._id}
                onClick={() => handleDoctorClick(doc._id)}
                className="flex flex-col bg-white rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-2xl hover:border-transparent transition-all duration-300 group h-full relative p-4 cursor-pointer shrink-0 w-[260px] sm:w-[280px]"
              >
                {/* Profile Image Container with Layer offset */}
                <div className="relative -mt-8 mx-2 h-48 rounded-xl overflow-hidden bg-slate-100 shadow-md border border-white">
                  <img
                    src={getImageSrc(doc.profileImage)}
                    alt={doc.name || 'Doctor'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop';
                    }}
                  />

                  {/* Clean rating strip on image edge */}
                  <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-md text-white px-2 py-0.5 rounded-lg flex items-center gap-1 text-[10px] font-bold border border-white/10">
                    <Star size={10} fill="currentColor" className="text-amber-400" />
                    <span>{doc.averageRating ?? 5.0}</span>
                    <span className="text-slate-400 font-normal">({doc.totalReviews ?? 0})</span>
                  </div>
                </div>

                {/* Doctor Metadata Body */}
                <div className="flex flex-col flex-1 pt-4 px-1">
                  <div className="flex-1">
                    {/* Experience pill left, specialty top right */}
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                        {doc.experienceYears ? `${doc.experienceYears}+ Yrs` : doc.experience || '10+ Yrs'} Experience
                      </span>
                      <div className="flex items-center gap-0.5 text-red-500 bg-red-50 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">
                        <CheckCircle2 size={10} className="fill-red-100" /> {doc.dutyStatus === 'On Duty' || doc.isOnline ? 'Live' : 'Verified'}
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 tracking-tight truncate group-hover:text-[#3d3f96] transition-colors">
                      {doc.name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5 truncate">{doc.speciality || 'Specialist'}</p>

                    {/* All 3 Service delivery configuration rows */}
                    <div className="mt-3 flex flex-wrap gap-1.5 items-center">
                      {(doc.isOnlineAvailable || doc.consultationStatus?.online) && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-indigo-50/70 text-indigo-700 rounded-lg border border-indigo-100/40">
                          <Video size={11} strokeWidth={2.5} /> Telehealth
                        </span>
                      )}
                      {(doc.isClinicAvailable || doc.consultationStatus?.clinic) && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-red-50/70 text-red-500 rounded-lg border border-red-100/40">
                          <MapPin size={11} strokeWidth={2.5} /> In-Person
                        </span>
                      )}
                      {(doc.isHomeAvailable || doc.consultationStatus?.home) && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-amber-50/70 text-amber-700 rounded-lg border border-amber-100/40">
                          <Home size={11} strokeWidth={2.5} /> Home Visit
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Unified Contextual Action Footer */}
                  <div className="mt-6 pt-3 border-t border-slate-100 flex flex-col gap-2.5">
                    <div>
                      <div className="flex items-center gap-1 text-slate-400">
                        <Calendar size={11} />
                        <span className="text-[9px] font-bold tracking-widest uppercase text-slate-400">
                          {doc.distance !== undefined ? `${doc.distance} km away` : 'Earliest Window'}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">
                        {doc.city ? `${doc.city} • Available Today` : 'Today, Available'}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDoctorClick(doc._id);
                      }}
                      className="w-full bg-[#3d3f96] hover:bg-slate-900 text-white py-3 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-1.5 group/btn shadow-md shadow-indigo-100 cursor-pointer"
                    >
                      <span>Request Booking</span>
                      <ChevronRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default DoctorShowcase;