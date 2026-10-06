"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope,
  Star,
  ArrowRight,
  CheckCircle2,
  CalendarCheck,
  Search,
  X,
  Loader2,
  Sparkles
} from 'lucide-react';
import UserAPI from '../../../services/UserAPI';

const Hero = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef(null);

  const quickSearches = [
    "Endocrinologist",
    "Nutritionist",
    "Diabetologist",
    "Dietitian"
  ];

  // Helper for image resolving
  const getImageSrc = (imgPath) => {
    if (!imgPath) {
      return 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&auto=format&fit=crop';
    }
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
      return imgPath;
    }
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
    return `${baseUrl}${imgPath}`;
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounced Live Suggestions Fetch (>= 2 characters)
  useEffect(() => {
    const queryTrimmed = searchQuery.trim();

    if (queryTrimmed.length < 2) {
      setSuggestions([]);
      setLoadingSuggestions(false);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoadingSuggestions(true);
        const res = await UserAPI.getDoctorSearchSuggestions({
          query: queryTrimmed,
          limit: 8
        });

        if (res && res.success && Array.isArray(res.data)) {
          setSuggestions(res.data);
          setShowDropdown(true);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error('Error fetching search suggestions:', err);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowDropdown(false);
    if (searchQuery.trim()) {
      router.push(`/doctor/seealldoctors?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/doctor/seealldoctors');
    }
  };

  // Popular pill click handler (populates search and opens suggestions right on the page)
  const handlePopularClick = (item) => {
    setSearchQuery(item);
    setShowDropdown(true);
  };

  const handleSuggestionClick = (item) => {
    setShowDropdown(false);

    if (item.itemType === 'Doctor') {
      const docId = item.id || item._id;
      router.push(`/doctor/doctordetail/${docId}`);
    } else if (item.itemType === 'Speciality') {
      if (item.redirectPath) {
        router.push(item.redirectPath);
      } else {
        router.push(`/doctor/seealldoctors?speciality=${encodeURIComponent(item.name || item.speciality)}`);
      }
    } else if (item.redirectPath) {
      router.push(item.redirectPath);
    } else {
      const docId = item.id || item._id;
      router.push(`/doctor/doctordetail/${docId}`);
    }
  };

  const handleFindDoctor = () => {
    router.push('/doctor/seealldoctors');
  };

  return (
    <section className="relative w-full min-h-screen bg-white flex items-center pt-8 pb-16 lg:py-0 select-none antialiased z-30">

      {/* --- Background Mesh Gradients (Isolated container with overflow-hidden) --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[60%] sm:w-[50%] h-[50%] bg-blue-50 rounded-full blur-[90px] sm:blur-[120px] opacity-60" />
        <div className="absolute bottom-0 left-0 w-[40%] sm:w-[30%] h-[40%] bg-indigo-50 rounded-full blur-[80px] sm:blur-[100px] opacity-60" />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center z-10 w-full">

        {/* --- LEFT SIDE: CONTENT & SEARCH --- */}
        <div className="space-y-6 sm:space-y-8 text-left relative z-40">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-[#3d3f96]/5 border border-[#3d3f96]/10 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full mb-4 sm:mb-6">
              <CalendarCheck size={14} className="text-[#3d3f96] shrink-0 sm:w-4 sm:h-4" />
              <span className="text-[10px] sm:text-[11px] font-bold text-[#3d3f96] uppercase tracking-widest">
                Instant Booking Available
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.12] tracking-tight">
              Expert Care for Your <br className="hidden sm:inline" />
              <span className="text-[#3d3f96]">Diabetes Journey.</span>
            </h1>

            <p className="mt-3 sm:mt-6 text-sm sm:text-lg md:text-xl text-slate-500 max-w-lg leading-relaxed font-medium">
              Access India's most experienced diabetes specialists. From reversal protocols to daily management, find the right expert today.
            </p>
          </motion.div>

          {/* --- DOCTOR SEARCH BAR WITH AUTO-SUGGESTIONS --- */}
          <motion.div
            ref={searchContainerRef}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="space-y-3 max-w-xl relative z-50"
          >
            <div className="relative">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <div className="relative w-full">
                  <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onFocus={() => {
                      if (searchQuery.trim().length >= 2 && suggestions.length > 0) {
                        setShowDropdown(true);
                      }
                    }}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search doctor, speciality, or condition..."
                    className="w-full bg-slate-50 hover:bg-white focus:bg-white text-slate-800 text-sm sm:text-base font-semibold placeholder:text-slate-400 placeholder:font-normal pl-11 pr-10 sm:pr-32 py-3.5 sm:py-4 rounded-2xl border border-slate-200/80 focus:border-[#3d3f96] focus:ring-4 focus:ring-[#3d3f96]/10 outline-none transition-all shadow-sm"
                  />

                  {/* Right Input Controls (Loader / Clear) */}
                  <div className="absolute right-3 sm:right-28 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {loadingSuggestions && (
                      <Loader2 size={16} className="text-[#3d3f96] animate-spin" />
                    )}
                    {searchQuery && !loadingSuggestions && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setSuggestions([]);
                          setShowDropdown(false);
                        }}
                        className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 bg-[#3d3f96] hover:bg-[#2d2f75] text-white px-5 py-2.5 rounded-xl font-bold text-xs items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md"
                >
                  <span>Search</span>
                  <ArrowRight size={14} />
                </button>
              </form>

              {/* --- AUTO-COMPLETE LIVE DROPDOWN --- */}
              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className="absolute left-0 right-0 top-full mt-2 bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden z-[100] max-h-[380px] overflow-y-auto divide-y divide-slate-100"
                  >
                    {suggestions.length > 0 ? (
                      suggestions.map((item, idx) => {
                        const isDoctor = item.itemType === 'Doctor';

                        return (
                          <div
                            key={item.id || item._id || idx}
                            onClick={() => handleSuggestionClick(item)}
                            className="p-3.5 hover:bg-indigo-50/60 active:bg-indigo-100/60 transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Doctor Avatar or Speciality Icon */}
                              {isDoctor ? (
                                <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
                                  <img
                                    src={getImageSrc(item.imageUrl)}
                                    alt={item.name || 'Doctor'}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&auto=format&fit=crop';
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#3d3f96] shrink-0">
                                  <Stethoscope size={20} />
                                </div>
                              )}

                              {/* Item Details */}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-bold text-slate-900 truncate group-hover:text-[#3d3f96] transition-colors">
                                    {item.name}
                                  </p>
                                  <span
                                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${isDoctor
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
                                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200/70'
                                      }`}
                                  >
                                    {item.itemType || 'Doctor'}
                                  </span>
                                </div>

                                <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">
                                  {item.description || item.speciality || item.qualification || 'Specialist Consultant'}
                                </p>
                              </div>
                            </div>

                            {/* Price / Rating or Navigation Arrow */}
                            <div className="text-right shrink-0">
                              {isDoctor && item.price ? (
                                <div>
                                  <span className="text-xs font-extrabold text-[#3d3f96]">
                                    ₹{item.price}
                                  </span>
                                  {item.rating && (
                                    <div className="flex items-center justify-end gap-1 text-[10px] font-bold text-amber-500 mt-0.5">
                                      <Star size={10} fill="currentColor" />
                                      <span>{Number(item.rating).toFixed(1)}</span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-[#3d3f96] group-hover:text-white text-slate-400 flex items-center justify-center transition-all">
                                  <ArrowRight size={13} />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-6 text-center text-slate-500">
                        <p className="text-xs font-bold text-slate-700">No results found for "{searchQuery}"</p>
                        <p className="text-[11px] text-slate-400 mt-1">Try searching with a different speciality or doctor name</p>
                      </div>
                    )}

                    {/* Footer View All Results Action */}
                    <div
                      onClick={handleSearchSubmit}
                      className="p-2.5 bg-slate-50 hover:bg-slate-100 text-center text-xs font-bold text-[#3d3f96] cursor-pointer flex items-center justify-center gap-1.5 border-t border-slate-100"
                    >
                      <span>View all matching results</span>
                      <ArrowRight size={13} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick search pills */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Popular:</span>
              {quickSearches.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePopularClick(item)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${searchQuery === item
                      ? 'bg-[#3d3f96] text-white border-[#3d3f96] shadow-sm'
                      : 'text-slate-600 hover:text-[#3d3f96] bg-slate-100/70 hover:bg-indigo-50/60 border-slate-200/50'
                    }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </motion.div>

          {/* --- ACTION BUTTONS --- */}
          <div className="flex flex-wrap gap-4 pt-1">
            <button
              onClick={handleFindDoctor}
              className="w-full sm:w-auto justify-center bg-[#3d3f96] hover:bg-[#2d2f75] text-white px-8 sm:px-10 py-3.5 sm:py-5 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base flex items-center gap-2.5 sm:gap-3 shadow-xl shadow-indigo-100/60 transition-all active:scale-95 cursor-pointer"
            >
              Browse All Doctors <ArrowRight size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* --- RIGHT SIDE: INTERACTIVE DOCTOR CARD --- */}
        <div className="relative flex justify-center lg:justify-end mt-4 lg:mt-0">

          {/* Main Doctor Image with Frame */}
          <div className="relative w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[450px] aspect-[4/5] rounded-[2rem] sm:rounded-[3rem] overflow-hidden border-[6px] sm:border-[10px] border-white shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop"
              alt="Specialist"
              className="w-full h-full object-cover"
            />

            {/* Glassmorphic Doctor Info Overlay */}
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 backdrop-blur-xl bg-white/85 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-white/50 shadow-xl">
              <div className="flex justify-between items-start mb-1 sm:mb-2">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-800">Dr. Ananya Sharma</h3>
                  <p className="text-[10px] sm:text-xs font-bold text-[#3d3f96] uppercase tracking-wider">Senior Endocrinologist</p>
                </div>
                <div className="bg-emerald-500 text-white px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[9px] sm:text-[10px] font-black shrink-0">
                  AVAILABLE
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-200/50">
                <div className="flex items-center gap-1">
                  <Star size={12} className="text-amber-400 fill-amber-400 sm:w-3.5 sm:h-3.5" />
                  <span className="text-[11px] sm:text-xs font-bold text-slate-700">4.9 (2k+)</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-blue-500 sm:w-3.5 sm:h-3.5" />
                  <span className="text-[11px] sm:text-xs font-bold text-slate-700">MCI Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating "Next Slot" Card */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-3 left-2 sm:-top-6 sm:left-4 lg:-left-8 bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-50 min-w-[170px] sm:min-w-[200px] z-20"
          >
            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 sm:mb-2">
              Next Available Slot
            </p>
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="bg-blue-50 p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-[#3d3f96] shrink-0">
                <CalendarCheck size={16} className="sm:w-5 sm:h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-black text-slate-800">Today, 04:30 PM</p>
                <p className="text-[9px] sm:text-[10px] font-bold text-emerald-500">Instant Confirmation</p>
              </div>
            </div>
          </motion.div>

          {/* Decorative Dot Pattern */}
          <div
            className="absolute -bottom-8 -right-8 w-28 h-28 opacity-20 pointer-events-none hidden lg:block"
            style={{ backgroundImage: 'radial-gradient(#3d3f96 2px, transparent 2px)', backgroundSize: '15px 15px' }}
          />

        </div>
      </div>
    </section>
  );
};

export default Hero;