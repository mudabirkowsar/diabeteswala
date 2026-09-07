"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Stethoscope, 
  ShieldCheck, 
  ArrowRight, 
  Building2, 
  CheckCircle2,
  Users,
  Clock,
  Sparkles,
  Loader2,
  X,
  ChevronRight
} from 'lucide-react';

import UserAPI from '../../../services/UserAPI';

// --- BASE MEDIA HELPER ---
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";

const getMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  return `${BASE_SERVER_URL}/${cleanPath}`;
};

const CLINIC_PLACEHOLDER = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=300&auto=format&fit=crop";
const DOC_PLACEHOLDER = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=300&auto=format&fit=crop";

// Spring transition configs for smooth, premium-feeling animations
const springTransition = {
  type: "spring",
  stiffness: 100,
  damping: 20,
  mass: 1
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (custom) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.15,
      ...springTransition
    }
  })
};

export default function Hero() {
  const router = useRouter();

  // --- Search & Autocomplete States ---
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const searchContainerRef = useRef(null);

  // --- Fetch Search Suggestions from API ---
  const fetchSuggestions = useCallback(async (queryText) => {
    if (!queryText || queryText.trim().length < 2) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      setLoadingSuggestions(false);
      return;
    }

    setLoadingSuggestions(true);
    try {
      // POST /api/user/clinics/search-suggestions
      const response = await UserAPI.getClinicSearchSuggestions({
        query: queryText.trim(),
        limit: 8
      });

      if (response && response.success) {
        setSuggestions(response.data || []);
        setIsDropdownOpen(true);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.error("Error fetching clinic search suggestions:", err);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  // Debounced Search Effect (250ms delay)
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      fetchSuggestions(searchQuery);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, fetchSuggestions]);

  // Handle Outside Click to Close Dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // --- Navigate via redirectPath from API ---
  const handleSelectSuggestion = (item) => {
    const targetPath = item.redirectPath || `/clinic/clinicdetail/${item.id || item._id}`;
    if (!targetPath) return;

    setIsDropdownOpen(false);
    router.push(targetPath);
  };

  return (
    <section className="relative w-full min-h-screen bg-[#f8fbff] overflow-hidden flex items-center pt-24 pb-16 lg:py-0 select-none">
      
      {/* --- PREMIUM BACKGROUND PATTERNS --- */}
      {/* Decorative Glows */}
      <div className="absolute top-0 right-0 w-full lg:w-[55%] h-full bg-gradient-to-bl from-blue-50/70 via-indigo-50/30 to-transparent rounded-bl-[120px] lg:rounded-bl-[200px] pointer-events-none z-0"></div>
      <div className="absolute top-1/4 left-10 w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-[150px] pointer-events-none z-0"></div>
      <div className="absolute bottom-10 right-1/4 w-[350px] h-[350px] bg-purple-200/20 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35 pointer-events-none z-0"></div>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center z-10 w-full">
        
        {/* --- LEFT SIDE: CONTENT & CLINIC SEARCH (Span 7/12) --- */}
        <div className="lg:col-span-7 flex flex-col justify-center text-left">
          
          {/* Tagline Badge */}
          <motion.div 
            custom={0}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-blue-100/80 px-4 py-2 rounded-2xl shadow-xs mb-6 w-fit"
          >
            <div className="bg-gradient-to-br from-indigo-500 to-[#3d3f96] p-1.5 rounded-xl text-white shadow-xs">
              <Building2 size={13} />
            </div>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              World-Class Health Facilities <Sparkles size={12} className="text-amber-500 fill-amber-500" />
            </span>
          </motion.div>

          {/* Core Headline */}
          <motion.h1 
            custom={1}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="text-4xl sm:text-5xl md:text-6xl xl:text-[4.5rem] font-black text-slate-900 leading-[1.08] mb-6 tracking-tight"
          >
            Modern Clinics <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3d3f96] via-[#5053b5] to-[#3d3f96] bg-[length:200%_auto]">
              Near Your Home.
            </span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p 
            custom={2}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="text-base sm:text-lg text-slate-600 max-w-xl mb-8 leading-relaxed font-medium"
          >
            Experience premium, specialized in-person care. Access advanced diagnostics and consult India's finest medical specialists right in your neighborhood.
          </motion.p>

          {/* --- CLINIC SEARCH BAR WITH LIVE AUTO-SUGGEST DROPDOWN --- */}
          <div ref={searchContainerRef} className="relative z-30 mb-10 w-full max-w-2xl">
            <motion.div 
              custom={3}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              className="bg-white p-2.5 sm:p-3 rounded-3xl lg:rounded-[2.2rem] shadow-[0_20px_50px_rgba(61,63,150,0.08)] border border-slate-100 flex flex-col md:flex-row items-stretch md:items-center gap-2.5 transition-all duration-300 focus-within:shadow-[0_24px_60px_rgba(61,63,150,0.15)] focus-within:border-indigo-100"
            >
              {/* Live Search Input (Clinics, Doctors, Specialities) */}
              <div className="flex items-center gap-3 px-4 py-2 w-full flex-1">
                <Search className="text-[#3d3f96] shrink-0" size={20} />
                <div className="flex flex-col w-full">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Search Clinics, Doctors or Specialties
                  </label>
                  <div className="relative flex items-center">
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => {
                        if (suggestions.length > 0) setIsDropdownOpen(true);
                      }}
                      placeholder="Type at least 2 letters (e.g. Mudabir, Cardio, Heera)..." 
                      className="bg-transparent outline-none text-sm font-bold text-slate-800 w-full placeholder:text-slate-400 placeholder:font-normal mt-0.5"
                    />
                    {searchQuery && (
                      <button 
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setSuggestions([]);
                          setIsDropdownOpen(false);
                        }}
                        className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button 
                type="button"
                onClick={() => {
                  if (suggestions.length > 0) {
                    handleSelectSuggestion(suggestions[0]);
                  }
                }}
                className="bg-[#3d3f96] hover:bg-[#2d2f75] text-white py-3.5 px-7 rounded-2xl md:rounded-[1.6rem] font-black text-xs uppercase tracking-wider shadow-md shadow-indigo-950/20 active:scale-[0.98] transition-all duration-300 w-full md:w-auto shrink-0 flex items-center justify-center gap-2 cursor-pointer group/btn"
              >
                {loadingSuggestions ? (
                  <Loader2 size={16} className="animate-spin text-white" />
                ) : (
                  <>
                    <span>Find Clinic</span>
                    <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </motion.div>

            {/* --- AUTO-SUGGEST DROPDOWN RESULTS --- */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100 shadow-[0_25px_60px_rgba(15,23,42,0.18)] overflow-hidden z-50 p-2.5 max-h-[380px] overflow-y-auto [&::-webkit-scrollbar]:hidden"
                >
                  <div className="px-3 py-2 flex items-center justify-between border-b border-slate-50 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Suggestions for "{searchQuery}"
                    </span>
                    <span className="text-[10px] font-bold text-[#3d3f96]">
                      {suggestions.length} {suggestions.length === 1 ? 'Result' : 'Results'}
                    </span>
                  </div>

                  {suggestions.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs font-bold space-y-1">
                      <p>No matching clinics or specialists found.</p>
                      <p className="text-[10px] font-medium text-slate-400">Try searching with a different name or specialty.</p>
                    </div>
                  ) : (
                    suggestions.map((item) => {
                      const isDoctor = item.itemType?.toLowerCase() === 'doctor';
                      const imageSrc = getMediaUrl(item.imageUrl) || (isDoctor ? DOC_PLACEHOLDER : CLINIC_PLACEHOLDER);

                      return (
                        <div
                          key={item.id || item._id}
                          onClick={() => handleSelectSuggestion(item)}
                          className="p-3 rounded-2xl hover:bg-slate-50/90 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            {/* Thumbnail Image */}
                            <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/70 shrink-0">
                              <img 
                                src={imageSrc} 
                                alt={item.name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  e.target.src = isDoctor ? DOC_PLACEHOLDER : CLINIC_PLACEHOLDER;
                                }}
                              />
                            </div>

                            {/* Details */}
                            <div className="min-w-0 space-y-0.5">
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-black text-slate-900 truncate group-hover:text-[#3d3f96] transition-colors">
                                  {item.name}
                                </h4>
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                                  isDoctor 
                                    ? 'bg-blue-50 text-[#3d3f96] border border-blue-100' 
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                }`}>
                                  {item.itemType || 'Clinic'}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 font-medium truncate max-w-sm">
                                {item.description}
                              </p>
                            </div>
                          </div>

                          <div className="w-7 h-7 rounded-xl bg-slate-100 group-hover:bg-[#3d3f96] group-hover:text-white text-slate-400 flex items-center justify-center transition-colors shrink-0">
                            <ChevronRight size={14} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Trust Indicators */}
          <motion.div 
            custom={4}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap items-center gap-y-4 gap-x-8 border-t border-slate-100 pt-6"
          >
            <div className="flex items-center gap-3">
              <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-2xl border border-emerald-100/50">
                <ShieldCheck size={18} className="stroke-[2.5]" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-800">ISO 9001 Certified</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accredited Safety</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-blue-50 text-[#3d3f96] p-2.5 rounded-2xl border border-blue-100/50">
                <Users size={18} className="stroke-[2.5]" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-800">Expert Medical Staff</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">India's Top Tier</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-amber-50 text-amber-600 p-2.5 rounded-2xl border border-amber-100/50">
                <Clock size={18} className="stroke-[2.5]" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-800">Instant Booking</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Zero Wait Time</p>
              </div>
            </div>
          </motion.div>

        </div>

        {/* --- RIGHT SIDE: PREMIUM VISUALS (Span 5/12) --- */}
        <div className="lg:col-span-5 relative mt-10 lg:mt-0 flex justify-center items-center">
          
          {/* Main Visual Frame */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 rounded-[3rem] lg:rounded-[4.5rem] overflow-hidden border-[10px] border-white shadow-[0_30px_70px_rgba(15,23,42,0.15)] aspect-[4/5] w-full max-w-[420px]"
          >
            <img 
              src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop" 
              alt="State of the art modern clinic interior" 
              className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-[2000ms] ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#3d3f96]/25 via-transparent to-transparent"></div>
          </motion.div>

          {/* --- FLOATING glassmorphism CARDS --- */}
          {/* Floating Card 1: Safety/Sanitized */}
          <motion.div 
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-16 -left-8 lg:-left-12 z-20 bg-white/95 backdrop-blur-xl p-4 rounded-3xl shadow-[0_15px_35px_rgba(0,0,0,0.08)] border border-white/50 flex items-center gap-4.5 min-w-[220px] pointer-events-none hover:scale-105 transition-transform duration-300"
          >
            <div className="bg-emerald-500 text-white p-3 rounded-2xl shadow-lg shadow-emerald-500/20">
              <CheckCircle2 size={22} className="stroke-[3]" />
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Care Standards</p>
              <p className="text-base font-black text-slate-800">100% Sanitized</p>
            </div>
          </motion.div>

          {/* Floating Card 2: Expansion Stats */}
          <motion.div 
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute bottom-12 -right-4 lg:-right-8 z-20 bg-white/95 backdrop-blur-xl p-5 rounded-[2.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-white/50 flex flex-col gap-3 min-w-[210px] pointer-events-none"
          >
            <div className="flex items-center gap-2">
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Rapid Growth</span>
            </div>
            
            <div className="flex items-center gap-3.5">
              <div className="bg-indigo-50 text-[#3d3f96] p-3 rounded-2xl">
                <Building2 size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-800 tracking-tight">25+</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Clinics Nationwide</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}