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
    <section className="py-12 sm:py-16 lg:py-20 relative overflow-hidden">
      {/* Structural subtle geometric accents */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-70 pointer-events-none"></div>

      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 relative z-10">

        {/* Header - Exactly as original on desktop/tablet, optimized for mobile */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 pb-6 border-b border-slate-200/60 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#3d3f96] font-bold text-xs tracking-widest uppercase mb-2">
              <ShieldCheck size={16} className="text-red-500 fill-red-50" />
              Verified Expert Panels
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Consult Top <span className="text-[#3d3f96] relative inline-block">Diabetes Experts</span>
            </h2>
            <p className="text-slate-500 text-sm sm:text-base font-normal mt-2 max-w-2xl">
              Direct access to clinical leaders, credentialed specialists, and certified nutritionists.
            </p>
          </div>

          <button
            onClick={() => router.push('/doctor/seealldoctors')}
            className="flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-[#3d3f96] hover:text-slate-900 transition-colors group bg-white border border-slate-200 shadow-sm px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl whitespace-nowrap w-full sm:w-auto self-start md:self-end cursor-pointer active:scale-95"
          >
            <span>View Panel Directory</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 gap-3 text-slate-500">
            <Loader2 className="animate-spin text-[#3d3f96]" size={36} />
            <p className="text-sm font-semibold">Finding nearest verified doctors...</p>
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm px-4">
            <p className="text-slate-600 font-medium text-sm sm:text-base">No doctors currently available in your area.</p>
          </div>
        ) : (
          /* Mobile: 2 Cards in a Single Row (grid-cols-2). Tablet/Desktop: Horizontal Scroll unchanged */
          <div
            className="grid grid-cols-2 sm:flex sm:overflow-x-auto gap-2.5 sm:gap-5 pt-6 sm:pt-8 pb-4 scroll-smooth sm:snap-x sm:snap-mandatory lg:snap-none [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {doctors.slice(0, 6).map((doc) => (
              <div
                key={doc._id}
                onClick={() => handleDoctorClick(doc._id)}
                className="flex flex-col bg-white rounded-xl sm:rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-2xl hover:border-transparent transition-all duration-300 group h-full relative p-2.5 sm:p-4 cursor-pointer shrink-0 w-full sm:w-[280px] snap-start"
              >
                {/* Profile Image Container */}
                <div className="relative -mt-5 sm:-mt-8 mx-0.5 sm:mx-2 h-32 sm:h-48 rounded-lg sm:rounded-xl overflow-hidden bg-slate-100 shadow-md border border-white">
                  <img
                    src={getImageSrc(doc.profileImage)}
                    alt={doc.name || 'Doctor'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop';
                    }}
                  />

                  {/* Rating strip on image edge */}
                  <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 bg-slate-900/80 backdrop-blur-md text-white px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] font-bold border border-white/10">
                    <Star size={9} fill="currentColor" className="text-amber-400 sm:w-2.5 sm:h-2.5" />
                    <span>{doc.averageRating ?? 5.0}</span>
                    <span className="text-slate-400 font-normal hidden sm:inline">({doc.totalReviews ?? 0})</span>
                  </div>
                </div>

                {/* Doctor Metadata Body */}
                <div className="flex flex-col flex-1 pt-2 sm:pt-4 px-0.5 sm:px-1">
                  <div className="flex-1">
                    {/* Experience & Status */}
                    <div className="flex items-center justify-between gap-1 mb-1 sm:mb-2">
                      <span className="text-[8px] sm:text-[9px] font-bold tracking-wider text-slate-400 uppercase truncate">
                        {doc.experienceYears ? `${doc.experienceYears}+ Yrs` : doc.experience || '10+ Yrs'} Exp
                      </span>
                      <div className="flex items-center gap-0.5 text-red-500 bg-red-50 px-1 py-0.5 rounded text-[8px] sm:text-[9px] font-bold uppercase shrink-0">
                        <CheckCircle2 size={9} className="fill-red-100 sm:w-2.5 sm:h-2.5" /> 
                        <span className="hidden sm:inline">{doc.dutyStatus === 'On Duty' || doc.isOnline ? 'Live' : 'Verified'}</span>
                      </div>
                    </div>

                    <h3 className="text-xs sm:text-base font-bold text-slate-900 tracking-tight truncate group-hover:text-[#3d3f96] transition-colors">
                      {doc.name}
                    </h3>
                    <p className="text-[10px] sm:text-xs font-semibold text-slate-500 mt-0.5 truncate">
                      {doc.speciality || 'Specialist'}
                    </p>

                    {/* Service badges */}
                    <div className="mt-2 sm:mt-3 flex flex-wrap gap-1 items-center">
                      {(doc.isOnlineAvailable || doc.consultationStatus?.online) && (
                        <span className="inline-flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 bg-indigo-50/70 text-indigo-700 rounded-md sm:rounded-lg border border-indigo-100/40">
                          <Video size={9} strokeWidth={2.5} className="sm:w-2.5 sm:h-2.5" /> 
                          <span className="hidden sm:inline">Telehealth</span>
                          <span className="sm:hidden">Online</span>
                        </span>
                      )}
                      {(doc.isClinicAvailable || doc.consultationStatus?.clinic) && (
                        <span className="inline-flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 bg-red-50/70 text-red-500 rounded-md sm:rounded-lg border border-red-100/40">
                          <MapPin size={9} strokeWidth={2.5} className="sm:w-2.5 sm:h-2.5" /> 
                          <span className="hidden sm:inline">In-Person</span>
                          <span className="sm:hidden">Clinic</span>
                        </span>
                      )}
                      {(doc.isHomeAvailable || doc.consultationStatus?.home) && (
                        <span className="inline-flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 bg-amber-50/70 text-amber-700 rounded-md sm:rounded-lg border border-amber-100/40">
                          <Home size={9} strokeWidth={2.5} className="sm:w-2.5 sm:h-2.5" /> 
                          <span className="hidden sm:inline">Home Visit</span>
                          <span className="sm:hidden">Home</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contextual Action Footer */}
                  <div className="mt-3 sm:mt-6 pt-2 sm:pt-3 border-t border-slate-100 flex flex-col gap-1.5 sm:gap-2.5">
                    <div>
                      <div className="flex items-center gap-1 text-slate-400">
                        <Calendar size={10} className="sm:w-3 sm:h-3" />
                        <span className="text-[8px] sm:text-[9px] font-bold tracking-widest uppercase text-slate-400 truncate">
                          {doc.distance !== undefined ? `${doc.distance} km away` : 'Earliest Window'}
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-xs font-bold text-slate-800 mt-0.5 truncate">
                        {doc.city ? `${doc.city}` : 'Available Today'}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDoctorClick(doc._id);
                      }}
                      className="w-full bg-[#3d3f96] hover:bg-slate-900 text-white py-2 sm:py-3 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-1 group/btn shadow-md shadow-indigo-100 cursor-pointer active:scale-95"
                    >
                      <span>Book Now</span>
                      <ChevronRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform sm:w-3.5 sm:h-3.5" />
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