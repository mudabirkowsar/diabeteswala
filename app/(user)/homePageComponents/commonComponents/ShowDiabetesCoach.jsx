'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Star, Video, MapPin, Search, ShieldCheck, 
  ChevronRight, Loader2, Sparkles, Languages, CheckCircle2 
} from 'lucide-react';
import UserAPI from '../../../services/UserAPI'; // Adjust your import path

const COACH_TYPES = ['All', 'Diabetes Educator', 'Diabetes Coach', 'Both'];

export default function ShowDiabetesCoach() {
  const router = useRouter();
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [cityFilter, setCityFilter] = useState('');
  const [isPending, startTransition] = useTransition();

  // Helper to retrieve saved user coordinates from localStorage
  const getInitialCoords = () => {
    let lat, lng;
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

  // Safe image path builder
  const getImageSrc = (imgPath) => {
    if (!imgPath) {
      return 'https://images.unsplash.com/photo-1594824813579-42b71c26b911?q=80&w=400&auto=format&fit=crop';
    }
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
      return imgPath;
    }
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
    return `${baseUrl}${imgPath}`;
  };

  // Fetch coaches from API
  const fetchCoaches = async () => {
    try {
      setLoading(true);
      const { lat, lng } = getInitialCoords();

      const payload = {};
      if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {
        payload.userLat = lat;
        payload.userLng = lng;
      }
      if (selectedType !== 'All') {
        payload.coachType = selectedType;
      }
      if (cityFilter.trim()) {
        payload.city = cityFilter.trim();
      }
      if (searchTerm.trim()) {
        payload.search = searchTerm.trim();
      }

      const res = await UserAPI.getNearbyDiabetesCoaches(payload);

      if (res && res.success && Array.isArray(res.data)) {
        setCoaches(res.data);
      } else {
        setCoaches([]);
      }
    } catch (error) {
      console.error('Error fetching diabetes coaches:', error);
      setCoaches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCoaches();
    }, 300); // 300ms debounce
    return () => clearTimeout(timer);
  }, [selectedType, cityFilter, searchTerm]);

  return (
    <section className="min-h-screen py-8 sm:py-12 bg-slate-50/60 relative overflow-hidden">
      {/* Background Accent Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-70 pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-slate-200/80 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#3d3f96] font-bold text-xs tracking-widest uppercase mb-1.5">
              <ShieldCheck size={16} className="text-red-500 fill-red-50" />
              Certified CGM & Reversal Experts
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Personalized <span className="text-[#3d3f96]">Diabetes Coaches</span>
            </h1>
            <p className="text-slate-500 text-xs sm:text-base font-normal mt-1 max-w-2xl">
              Connect with certified diabetes educators and coaches for live CGM trend monitoring, diet planning, and glucose reversal.
            </p>
          </div>

          <div className="text-xs sm:text-sm font-semibold text-slate-600 bg-white border border-slate-200 shadow-sm px-4 py-2 rounded-xl self-start md:self-end">
            Showing <span className="text-[#3d3f96] font-bold">{coaches.length}</span> Verified Coaches
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-sm mb-8 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="md:col-span-8 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by Coach Name, Qualification, City, or Languages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#3d3f96]/20 focus:border-[#3d3f96] transition-all"
              />
            </div>

            {/* City Filter */}
            <div className="md:col-span-4 relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Filter by city (e.g. Mohali)"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#3d3f96]/20 focus:border-[#3d3f96] transition-all"
              />
            </div>
          </div>

          {/* Type Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase text-slate-400 mr-2 tracking-wider">Type:</span>
            {COACH_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedType === type
                    ? 'bg-[#3d3f96] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
            <Loader2 className="animate-spin text-[#3d3f96]" size={36} />
            <p className="text-sm font-semibold">Finding nearest verified diabetes coaches...</p>
          </div>
        ) : coaches.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm px-4">
            <Sparkles className="mx-auto text-slate-400 mb-2" size={32} />
            <p className="text-slate-700 font-bold text-base">No coaches found</p>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">Try adjusting your filters or location search query.</p>
          </div>
        ) : (
          /* Cards Grid: 2 columns on mobile, 3 on tablet, 4 on desktop */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 pt-4">
            {coaches.map((coach) => (
              <div
                key={coach._id}
                onClick={() => router.push(`/coach/coachdetail/${coach._id}`)}
                className="flex flex-col bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-transparent transition-all duration-300 group h-full relative p-2.5 sm:p-4 cursor-pointer"
              >
                {/* Profile Image & Badge */}
                <div className="relative -mt-5 sm:-mt-6 mx-0.5 sm:mx-1 h-32 sm:h-44 rounded-lg sm:rounded-xl overflow-hidden bg-slate-100 shadow-md border border-white">
                  <img
                    src={getImageSrc(coach.profileImage)}
                    alt={coach.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1594824813579-42b71c26b911?q=80&w=400&auto=format&fit=crop';
                    }}
                  />

                  {/* Rating Tag */}
                  <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 bg-slate-900/80 backdrop-blur-md text-white px-1.5 sm:px-2 py-0.5 rounded-md flex items-center gap-1 text-[9px] sm:text-[10px] font-bold">
                    <Star size={10} fill="currentColor" className="text-amber-400" />
                    <span>{coach.rating || 5.0}</span>
                    <span className="text-slate-400 font-normal hidden sm:inline">({coach.totalReviews || 0})</span>
                  </div>

                  {/* Coach Type Badge on top-left */}
                  <div className="absolute top-1.5 left-1.5 bg-[#3d3f96]/90 backdrop-blur-sm text-white px-2 py-0.5 rounded-md text-[8px] sm:text-[9px] font-bold tracking-wide uppercase">
                    {coach.coachType}
                  </div>
                </div>

                {/* Body Details */}
                <div className="flex flex-col flex-1 pt-2 sm:pt-3">
                  {/* Distance & Verified */}
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[8px] sm:text-[10px] font-bold text-slate-500 flex items-center gap-0.5">
                      <MapPin size={11} className="text-[#3d3f96]" />
                      <span className="truncate">{coach.distanceDisplay || (coach.location?.city ? `${coach.location.city}` : 'Nearby')}</span>
                    </span>
                    <span className="flex items-center gap-0.5 text-red-600 bg-red-50 px-1 py-0.5 rounded text-[8px] sm:text-[9px] font-bold uppercase">
                      <CheckCircle2 size={10} className="fill-red-100" />
                      <span className="hidden sm:inline">Verified</span>
                    </span>
                  </div>

                  {/* Coach Name & Qualification */}
                  <h2 className="text-xs sm:text-base font-bold text-slate-900 tracking-tight truncate group-hover:text-[#3d3f96] transition-colors">
                    {coach.name}
                  </h2>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate mt-0.5">
                    {coach.qualification || 'Certified Diabetes Coach'}
                  </p>

                  {/* Spoken Languages */}
                  {coach.languages && coach.languages.length > 0 && (
                    <div className="mt-1.5 flex items-center gap-1 text-[9px] sm:text-[10px] text-slate-500 truncate">
                      <Languages size={10} className="text-slate-400 shrink-0" />
                      <span className="truncate">{coach.languages.join(', ')}</span>
                    </div>
                  )}

                  {/* Consultation Mode Badges */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {coach.consultationModes?.isOnlineAvailable && (
                      <span className="inline-flex items-center gap-0.5 text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-100">
                        <Video size={9} /> Online
                      </span>
                    )}
                    {coach.consultationModes?.isOfflineAvailable && (
                      <span className="inline-flex items-center gap-0.5 text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-100">
                        <MapPin size={9} /> Home / Visit
                      </span>
                    )}
                  </div>

                  {/* Pricing Overview & Action CTA */}
                  <div className="mt-auto pt-3 border-t border-slate-100">
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-semibold uppercase">Consultation</span>
                      <div className="text-right">
                        <span className="text-xs sm:text-sm font-extrabold text-[#3d3f96]">
                          ₹{coach.pricing?.onlineFee || coach.pricing?.offlineBaseFee || '—'}
                        </span>
                        <span className="text-[8px] sm:text-[9px] text-slate-400 ml-0.5">/ session</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/coach/coachdetail/${coach._id}`);
                      }}
                      className="w-full bg-[#3d3f96] hover:bg-slate-900 text-white py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-1 group/btn cursor-pointer active:scale-95 shadow-sm"
                    >
                      <span>Book Slots</span>
                      <ChevronRight size={13} className="group-hover/btn:translate-x-0.5 transition-transform" />
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