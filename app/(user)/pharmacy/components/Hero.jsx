"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Truck, 
  ShieldCheck, 
  UploadCloud, 
  ArrowRight, 
  Clock, 
  ShoppingBag, 
  CheckCircle2, 
  Sparkles, 
  Percent,
  Loader2,
  X,
  FileText,
  Store,
  Pill
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import UserAPI from '../../../services/UserAPI'; // Adjust relative path as needed

// Spring animation configuration
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

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=400&auto=format&fit=crop";

const PharmacyHero = () => {
  const router = useRouter();
  const searchContainerRef = useRef(null);

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 300ms Debounced Search API Trigger
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await UserAPI.searchMedicines({
          query: query.trim(),
          category: "All",
          page: 1
        });

        if (response && response.success) {
          setSearchResults(response.data || []);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error("Medicine search failed:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener to dismiss search dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsDropdownOpen(false);
    router.push(`/pharmacy/allproductsandmedicines?search=${encodeURIComponent(query.trim())}`);
  };

  const handleSelectMedicine = (id) => {
    setIsDropdownOpen(false);
    router.push(`/pharmacy/productdetail/${id}`);
  };

  return (
    <section className="relative w-full min-h-screen bg-[#f8fbff] overflow-visible flex items-center pt-24 pb-16 lg:py-0">
      
      {/* --- PREMIUM DECORATIVE BACKDROPS --- */}
      <div className="absolute top-0 right-0 w-full lg:w-[52%] h-full bg-gradient-to-bl from-blue-50/80 via-indigo-50/20 to-transparent rounded-bl-[120px] lg:rounded-bl-[200px] pointer-events-none z-0"></div>
      <div className="absolute top-1/4 left-10 w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="absolute bottom-10 right-1/4 w-[350px] h-[350px] bg-sky-200/25 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35 pointer-events-none z-0"></div>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center z-10 w-full">
        
        {/* --- LEFT SIDE: CONTENT & MEDICINE SEARCH (Span 7/12) --- */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          
          {/* Tagline Badge */}
          <motion.div 
            custom={0}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-blue-100/80 px-4 py-2 rounded-2xl shadow-sm mb-6 w-fit"
          >
            <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-1.5 rounded-xl text-white">
              <ShieldCheck size={13} />
            </div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              100% Genuine Medicines Guaranteed <Sparkles size={12} className="text-amber-500 fill-amber-500" />
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
            Your Pharmacy, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3d3f96] via-[#5053b5] to-[#3d3f96] bg-[length:200%_auto]">
              Delivered in 24h.
            </span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p 
            custom={2}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="text-base sm:text-lg text-slate-600 max-w-xl mb-8 leading-relaxed font-normal"
          >
            Get genuine diabetes care essentials, cold-chain insulin, and clinical supplements dispatched directly to your doorstep at unmatched prices.
          </motion.p>

          {/* --- SEARCH BAR WRAPPER WITH DEBOUNCE DROPDOWN --- */}
          <div ref={searchContainerRef} className="relative w-full mb-6 z-40">
            <motion.form 
              onSubmit={handleManualSearch}
              custom={3}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              className="bg-white p-2 sm:p-2.5 rounded-3xl lg:rounded-[2.2rem] shadow-[0_20px_50px_rgba(61,63,150,0.08)] border border-slate-100 flex flex-col md:flex-row items-stretch md:items-center gap-2 group focus-within:shadow-[0_24px_60px_rgba(61,63,150,0.14)] focus-within:border-indigo-200 transition-all duration-300"
            >
              <div className="flex items-center gap-3 px-3 sm:px-4 py-2 w-full">
                {isSearching ? (
                  <Loader2 className="text-[#3d3f96] animate-spin shrink-0" size={20} />
                ) : (
                  <Search className="text-indigo-500 shrink-0" size={20} />
                )}
                
                <div className="flex flex-col w-full">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                    Search Medicine or Salt
                  </label>
                  <input 
                    type="text" 
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    placeholder="Search Dolo, Paracetamol, Metformin, Tiniba..." 
                    className="bg-transparent outline-none text-sm font-semibold text-slate-800 w-full placeholder:text-slate-400 mt-1"
                  />
                </div>

                {query.length > 0 && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setQuery("");
                      setSearchResults([]);
                      setIsDropdownOpen(false);
                    }}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              
              <button 
                type="submit"
                className="bg-gradient-to-r from-[#3d3f96] to-[#5a5dbd] hover:from-[#2d2f75] hover:to-[#4a4ca6] text-white py-3.5 sm:py-4 px-8 rounded-2xl md:rounded-[1.6rem] font-bold text-sm shadow-[0_10px_25px_rgba(61,63,150,0.2)] hover:shadow-[0_12px_30px_rgba(61,63,150,0.35)] active:scale-[0.98] transition-all duration-300 w-full md:w-auto shrink-0 flex items-center justify-center gap-2 group/btn"
              >
                Search <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </motion.form>

            {/* --- LIVE SEARCH RESULTS POPUP DROPDOWN --- */}
            <AnimatePresence>
              {isDropdownOpen && query.trim().length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 right-0 mt-3 bg-white/98 backdrop-blur-xl border border-slate-100 rounded-3xl shadow-[0_25px_60px_rgba(15,23,42,0.14)] overflow-hidden z-50 max-h-[460px] flex flex-col"
                >
                  {/* Results Header */}
                  <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      {isSearching ? "Searching catalog..." : `${searchResults.length} Results Found`}
                    </span>
                    <span className="text-[10px] text-indigo-600 font-bold">
                      Live Pharmacy Prices
                    </span>
                  </div>

                  {/* Results List */}
                  <div className="overflow-y-auto divide-y divide-slate-100/80 max-h-[380px] p-2">
                    {/* Empty State */}
                    {!isSearching && searchResults.length === 0 && (
                      <div className="py-10 text-center px-4">
                        <Pill size={32} className="mx-auto text-slate-300 mb-2 stroke-1" />
                        <p className="text-sm font-bold text-slate-700">No medicines found</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          We couldn't find matches for "{query}". Try checking the spelling or salt name.
                        </p>
                      </div>
                    )}

                    {/* Medicine Items */}
                    {searchResults.map((med) => {
                      const image = (med.image_url && med.image_url.length > 0) ? med.image_url[0] : FALLBACK_IMAGE;
                      const hasDiscount = med.isAvailable && med.discont_percent && med.discont_percent !== "0%" && med.discont_percent !== "0";
                      const sellingPrice = med.best_vendor_price || med.best_price;
                      const isRxRequired = (med.prescription_required || "").toUpperCase() === "YES";

                      return (
                        <div
                          key={med._id || med.Id}
                          onClick={() => handleSelectMedicine(med._id)}
                          className="p-3 sm:p-3.5 hover:bg-indigo-50/50 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 group"
                        >
                          {/* Left: Thumbnail & Details */}
                          <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                              <img 
                                src={image} 
                                alt={med.name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="text-xs sm:text-sm font-black text-slate-800 group-hover:text-[#3d3f96] transition-colors truncate">
                                  {med.name}
                                </h4>

                                {isRxRequired ? (
                                  <span className="text-[8px] font-black bg-amber-50 text-amber-700 border border-amber-200/60 px-1.5 py-0.2 rounded uppercase">
                                    Rx Req
                                  </span>
                                ) : (
                                  <span className="text-[8px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-1.5 py-0.2 rounded uppercase">
                                    OTC
                                  </span>
                                )}
                              </div>

                              <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                                {med.salt_composition}
                              </p>

                              {/* Pharmacy Name Tag */}
                              {med.pharmacy_name ? (
                                <p className="text-[9px] text-slate-400 font-medium flex items-center gap-1 mt-0.5 truncate">
                                  <Store size={10} className="text-indigo-500 shrink-0" />
                                  Sold by <span className="font-bold text-slate-600">{med.pharmacy_name}</span>
                                </p>
                              ) : (
                                <p className="text-[9px] text-slate-400 font-medium mt-0.5">
                                  {med.packaging || "1 Unit"}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Right: Pricing & Status */}
                          <div className="flex flex-col items-end shrink-0 pl-2">
                            {med.isAvailable ? (
                              <>
                                <div className="flex items-baseline gap-1.5">
                                  <span className="text-sm sm:text-base font-black text-slate-900">
                                    ₹{sellingPrice}
                                  </span>
                                  {parseFloat(med.mrp) > parseFloat(sellingPrice) && (
                                    <span className="text-[10px] text-slate-400 line-through font-semibold">
                                      ₹{med.mrp}
                                    </span>
                                  )}
                                </div>

                                {hasDiscount && (
                                  <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded mt-0.5">
                                    {med.discont_percent} OFF
                                  </span>
                                )}
                              </>
                            ) : (
                              <div className="text-right">
                                <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md">
                                  Out of Stock
                                </span>
                                {med.mrp && (
                                  <p className="text-[9px] text-slate-400 line-through mt-0.5">₹{med.mrp}</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Prescription Upload & Promo Segment */}
          <motion.div 
            custom={4}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap items-center gap-y-3 gap-x-4 mb-10 text-slate-500 font-medium text-sm"
          >
            <Link 
              href="/pharmacy/uploadprescription"
              className="flex items-center gap-2 text-[#3d3f96] hover:text-[#2d2f75] font-bold transition-colors group/upload"
            >
              <UploadCloud size={18} className="group-hover/upload:-translate-y-0.5 transition-transform" />
              Upload Prescription
            </Link>
            <span className="text-slate-200 hidden sm:inline">|</span>
            <div className="flex items-center gap-1.5 bg-amber-50 text-amber-800 px-3 py-1 rounded-full border border-amber-200/50">
              <Percent size={13} className="stroke-[3]" />
              <p className="text-xs font-black uppercase tracking-wider">Flat 20% Off on your first order</p>
            </div>
          </motion.div>

          {/* Quick Value Pillars */}
          <motion.div 
            custom={5}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap items-center gap-y-4 gap-x-8 border-t border-slate-100 pt-6"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 text-[#3d3f96] p-2.5 rounded-2xl border border-blue-100/50">
                <Truck size={18} className="stroke-[2.5]" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-800">24-Hour Delivery</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Express dispatch</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-2xl border border-emerald-100/50">
                <ShieldCheck size={18} className="stroke-[2.5]" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-800">100% Certified Safe</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Batch verified</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-amber-50 text-amber-600 p-2.5 rounded-2xl border border-amber-100/50">
                <Clock size={18} className="stroke-[2.5]" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-800">Hassle-Free Returns</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">No questions asked</p>
              </div>
            </div>
          </motion.div>

        </div>

        {/* --- RIGHT SIDE: VISUALS (Span 5/12) --- */}
        <div className="lg:col-span-5 relative mt-10 lg:mt-0 flex justify-center items-center">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 rounded-[3rem] lg:rounded-[4.5rem] overflow-hidden border-[10px] border-white shadow-[0_30px_70px_rgba(15,23,42,0.12)] aspect-[4/5] w-full max-w-[420px]"
          >
            <img 
              src="https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?q=80&w=2070&auto=format&fit=crop" 
              alt="Genuine verified pharmacy and cold-chain insulin storage" 
              className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-[2000ms] ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#3d3f96]/25 via-transparent to-transparent"></div>
          </motion.div>

          {/* Floating Card 1: Order Tracking Status */}
          <motion.div 
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-16 -left-8 lg:-left-12 z-20 bg-white/95 backdrop-blur-xl p-4 rounded-3xl shadow-[0_15px_35px_rgba(0,0,0,0.06)] border border-white/50 flex items-center gap-4 min-w-[230px] pointer-events-none hover:scale-105 transition-transform duration-300"
          >
            <div className="bg-gradient-to-br from-[#3d3f96] to-indigo-600 text-white p-3 rounded-2xl shadow-lg shadow-indigo-500/25">
              <Truck size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none mb-1">Live Tracking</p>
              <p className="text-base font-black text-slate-800">Out for delivery</p>
            </div>
          </motion.div>

          {/* Floating Card 2: Discount Badge */}
          <motion.div 
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute bottom-12 -right-4 lg:-right-8 z-20 bg-white/95 backdrop-blur-xl p-5 rounded-[2.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-white/50 flex flex-col gap-3 min-w-[200px] pointer-events-none"
          >
            <div className="flex items-center gap-2">
              <div className="bg-emerald-50 text-emerald-600 p-1 rounded-md">
                <CheckCircle2 size={13} className="stroke-[3]" />
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Verified Pharmacist</span>
            </div>
            
            <div className="flex items-center gap-3.5">
              <div className="bg-orange-50 text-orange-600 p-3 rounded-2xl">
                <ShoppingBag size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-800 tracking-tight">Flat 20%</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Discount Applied</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default PharmacyHero;