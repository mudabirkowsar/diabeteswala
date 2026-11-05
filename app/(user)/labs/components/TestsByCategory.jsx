"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Beaker,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Droplet,
  Droplets,
  Heart,
  Activity,
  Thermometer,
  ShieldAlert,
  Wind,
  Layers,
  Dna,
  Microscope,
  Sun,
  Flame,
  Bug,
  Radio,
  FileText,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Syringe,
  Eye,
  HeartPulse,
  ShieldCheck,
  FlaskConical,
  Scale
} from 'lucide-react';
import UserAPI from '../../../services/UserAPI'; // Adjust relative path as needed
import { useNotification } from '../../../context/NotificationContext'; // Adjust relative path as needed

// Diverse pool of fallback medical & lab icons
const fallbackIconPool = [
  FlaskConical,
  Stethoscope,
  HeartPulse,
  ShieldCheck,
  Microscope,
  Dna,
  Activity,
  Syringe,
  Eye,
  Scale,
  Thermometer,
  Wind,
  Beaker
];

// Dynamic Lucide icon assigner with diversified fallback
const getCategoryIcon = (categoryName = "") => {
  const norm = categoryName.toLowerCase().trim();
  if (!norm || norm === "all") return Layers;
  
  if (norm.includes("allergy") || norm.includes("immune")) return ShieldAlert;
  if (norm.includes("anemia") || norm.includes("blood")) return Droplets;
  if (norm.includes("bone") || norm.includes("joint")) return Activity;
  if (norm.includes("cancer") || norm.includes("tumor")) return AlertCircle;
  if (norm.includes("cardio") || norm.includes("heart")) return Heart;
  if (norm.includes("chromosome") || norm.includes("genetic") || norm.includes("dna")) return Dna;
  if (norm.includes("diabetes") || norm.includes("sugar") || norm.includes("glucose")) return Activity;
  if (norm.includes("fever") || norm.includes("infection")) return Thermometer;
  if (norm.includes("full body") || norm.includes("package") || norm.includes("cbc")) return Layers;
  if (norm.includes("hormon") || norm.includes("thyroid")) return Flame;
  if (norm.includes("kidney") || norm.includes("renal") || norm.includes("urine")) return FlaskConical;
  if (norm.includes("liver") || norm.includes("hepatic")) return Droplet;
  if (norm.includes("lung") || norm.includes("respiratory") || norm.includes("chest")) return Wind;
  if (norm.includes("microbio") || norm.includes("parasitol") || norm.includes("bacterial")) return Bug;
  if (norm.includes("pathology")) return Microscope;
  if (norm.includes("radiology") || norm.includes("xray") || norm.includes("scan")) return Radio;
  if (norm.includes("vitamin") || norm.includes("sun")) return Sun;
  if (norm.includes("eye") || norm.includes("vision")) return Eye;
  if (norm.includes("stool") || norm.includes("digestive")) return Beaker;

  // Deterministic icon assignment based on category name string hash
  const hash = Array.from(norm).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return fallbackIconPool[hash % fallbackIconPool.length];
};

// Dynamic Category Palette Assignor
const getCategoryTheme = (categoryName = "") => {
  const norm = categoryName.toLowerCase();

  if (norm.includes("heart") || norm.includes("cardio") || norm.includes("anemia") || norm.includes("blood")) {
    return {
      gradient: "from-rose-500 via-rose-600 to-red-600",
      glow: "shadow-rose-500/25",
      ring: "ring-rose-400/40",
      iconColor: "text-rose-600",
      lightBg: "bg-rose-50",
      border: "border-rose-200",
      accentText: "text-rose-600",
      badge: "bg-rose-50 text-rose-700 border-rose-200"
    };
  }
  if (norm.includes("diabetes") || norm.includes("sugar")) {
    return {
      gradient: "from-violet-500 via-purple-600 to-indigo-600",
      glow: "shadow-violet-500/25",
      ring: "ring-violet-400/40",
      iconColor: "text-violet-600",
      lightBg: "bg-violet-50",
      border: "border-violet-200",
      accentText: "text-violet-600",
      badge: "bg-violet-50 text-violet-700 border-violet-200"
    };
  }
  if (norm.includes("liver") || norm.includes("kidney") || norm.includes("urine")) {
    return {
      gradient: "from-teal-500 via-emerald-600 to-cyan-600",
      glow: "shadow-teal-500/25",
      ring: "ring-teal-400/40",
      iconColor: "text-teal-600",
      lightBg: "bg-teal-50",
      border: "border-teal-200",
      accentText: "text-teal-600",
      badge: "bg-teal-50 text-teal-700 border-teal-200"
    };
  }
  if (norm.includes("fever") || norm.includes("hormon") || norm.includes("thyroid") || norm.includes("infection")) {
    return {
      gradient: "from-amber-500 via-orange-500 to-red-500",
      glow: "shadow-amber-500/25",
      ring: "ring-amber-400/40",
      iconColor: "text-amber-600",
      lightBg: "bg-amber-50",
      border: "border-amber-200",
      accentText: "text-amber-600",
      badge: "bg-amber-50 text-amber-700 border-amber-200"
    };
  }
  if (norm.includes("vitamin") || norm.includes("sun")) {
    return {
      gradient: "from-amber-400 via-yellow-500 to-orange-400",
      glow: "shadow-yellow-500/25",
      ring: "ring-yellow-400/40",
      iconColor: "text-amber-600",
      lightBg: "bg-yellow-50",
      border: "border-yellow-200",
      accentText: "text-amber-600",
      badge: "bg-yellow-50 text-amber-800 border-yellow-200"
    };
  }
  if (norm.includes("bone") || norm.includes("lung") || norm.includes("microbio") || norm.includes("allergy")) {
    return {
      gradient: "from-emerald-500 via-teal-600 to-cyan-600",
      glow: "shadow-emerald-500/25",
      ring: "ring-emerald-400/40",
      iconColor: "text-emerald-600",
      lightBg: "bg-emerald-50",
      border: "border-emerald-200",
      accentText: "text-emerald-600",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200"
    };
  }
  if (norm.includes("cancer") || norm.includes("pathology") || norm.includes("radiology")) {
    return {
      gradient: "from-pink-500 via-fuchsia-600 to-purple-600",
      glow: "shadow-pink-500/25",
      ring: "ring-pink-400/40",
      iconColor: "text-pink-600",
      lightBg: "bg-pink-50",
      border: "border-pink-200",
      accentText: "text-pink-600",
      badge: "bg-pink-50 text-pink-700 border-pink-200"
    };
  }

  // Fallback Indigo
  return {
    gradient: "from-[#3d3f96] via-indigo-600 to-blue-600",
    glow: "shadow-indigo-500/25",
    ring: "ring-indigo-400/40",
    iconColor: "text-[#3d3f96]",
    lightBg: "bg-indigo-50",
    border: "border-indigo-200",
    accentText: "text-[#3d3f96]",
    badge: "bg-indigo-50 text-[#3d3f96] border-indigo-200"
  };
};

export default function TestsByCategory() {
  const { showNotification } = useNotification();

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [tests, setTests] = useState([]);
  const [totalCategoryTests, setTotalCategoryTests] = useState(0);

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingTests, setLoadingTests] = useState(true);
  const [error, setError] = useState(false);

  // Slider controls
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 6);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
    }
  };

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // 1. Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await UserAPI.getAllTestCategories();
        if (res && res.success && Array.isArray(res.data)) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Update slider arrows when categories change
  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [categories]);

  // 2. Fetch Strictly 3 Tests for Preview
  useEffect(() => {
    const fetchThreeTests = async () => {
      try {
        setLoadingTests(true);
        setError(false);

        const params = {
          category: selectedCategory,
          page: 1,
          limit: 3
        };

        const res = await UserAPI.getTestsByTestCategory(params);

        if (res && res.success) {
          setTests(res.data?.slice(0, 3) || []);
          setTotalCategoryTests(res.total || res.data?.length || 0);
        } else {
          setTests([]);
          setTotalCategoryTests(0);
        }
      } catch (err) {
        console.error("Error loading preview tests:", err);
        setError(true);
        if (showNotification) {
          showNotification("Unable to load tests for this category.", "error");
        }
      } finally {
        setLoadingTests(false);
      }
    };

    fetchThreeTests();
  }, [selectedCategory, showNotification]);

  const allCategoriesList = useMemo(() => ["All", ...categories], [categories]);
  const ActiveCategoryIcon = getCategoryIcon(selectedCategory);

  return (
    <section className="relative py-12 sm:py-16 md:py-20 bg-gradient-to-b from-indigo-50/40 via-white to-slate-50/60 overflow-hidden">
      {/* Ambient Lighting Orbs */}
      <div className="absolute -top-32 left-10 w-96 h-96 bg-gradient-to-br from-indigo-300/20 to-purple-300/15 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-[450px] h-[450px] bg-gradient-to-bl from-rose-200/20 to-pink-200/15 rounded-full blur-[120px] pointer-events-none" />

      {/* RESTORED LAPTOP CONTAINER WIDTH */}
      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-16 z-10">

        {/* --- CENTERED HEADING & SUBHEADING --- */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-200/70 shadow-xs mb-2.5">
            <Sparkles size={11} className="text-indigo-600 fill-indigo-600 animate-bounce" />
            <span className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Diagnostic Directory
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Explore Tests by{" "}
            <span className="bg-gradient-to-r from-[#3d3f96] via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Category
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-2 max-w-lg leading-relaxed">
            Select a clinical department or health condition to browse accredited lab tests and diagnostic packages.
          </p>
        </div>

        {/* --- CATEGORY SLIDER WITH LAPTOP NAVIGATION ARROWS --- */}
        <div className="relative mb-12 sm:mb-14 group/slider">

          {/* Left Arrow (Desktop / Laptop) */}
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className={`hidden md:flex absolute -left-4 lg:-left-6 top-[28px] -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center text-slate-700 hover:text-white hover:bg-[#3d3f96] hover:border-transparent transition-all duration-200 active:scale-95 ${
              canScrollLeft ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
            aria-label="Scroll left"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Right Arrow (Desktop / Laptop) */}
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className={`hidden md:flex absolute -right-4 lg:-right-6 top-[28px] -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center text-slate-700 hover:text-white hover:bg-[#3d3f96] hover:border-transparent transition-all duration-200 active:scale-95 ${
              canScrollRight ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
            aria-label="Scroll right"
          >
            <ChevronRight size={16} />
          </button>

          {loadingCategories ? (
            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 scrollbar-none">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <div key={n} className="flex flex-col items-center gap-1.5 shrink-0 w-16 sm:w-20">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-200/70 animate-pulse" />
                  <div className="w-10 h-2.5 bg-slate-200/60 rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div
              ref={scrollRef}
              onScroll={checkScroll}
              className="flex gap-2.5 sm:gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth scrollbar-none 
                [&::-webkit-scrollbar]:hidden 
                [-ms-overflow-style:none] 
                [scrollbar-width:none] px-2"
            >
              {allCategoriesList.map((cat) => {
                const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
                const IconComponent = getCategoryIcon(cat);
                const theme = getCategoryTheme(cat);

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className="group flex flex-col items-center gap-1.5 w-16 sm:w-20 shrink-0 select-none focus:outline-none transition-transform duration-200 active:scale-95"
                  >
                    {/* Compact Circle Icon */}
                    <div
                      className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isSelected
                          ? `bg-gradient-to-tr ${theme.gradient} text-white shadow-md ${theme.glow} ring-2 sm:ring-3 ${theme.ring} ring-offset-2 scale-105`
                          : `${theme.lightBg} ${theme.iconColor} border border-slate-200/80 hover:scale-105 hover:shadow-xs shadow-2xs`
                      }`}
                    >
                      <IconComponent
                        size={19}
                        className={`transition-transform duration-300 ${
                          isSelected ? 'scale-110 text-white' : 'group-hover:scale-110'
                        }`}
                      />

                      {/* Active indicator dot */}
                      {isSelected && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-white rounded-full p-0.5 shadow-xs flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </span>
                      )}
                    </div>

                    {/* Category Label Below */}
                    <span
                      className={`text-[10px] sm:text-[11px] text-center leading-tight line-clamp-2 transition-all duration-200 w-full px-0.5 ${
                        isSelected
                          ? `${theme.accentText} font-bold`
                          : 'text-slate-600 group-hover:text-slate-900 font-medium'
                      }`}
                      title={cat}
                    >
                      {cat}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* --- 3 TESTS DISPLAY GRID --- */}
        {loadingTests ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4 animate-pulse shadow-xs">
                <div className="flex justify-between items-center">
                  <div className="w-24 h-5 bg-slate-100 rounded-lg" />
                  <div className="w-14 h-5 bg-slate-100 rounded-full" />
                </div>
                <div className="h-5 bg-slate-200/70 rounded-md w-4/5" />
                <div className="h-16 bg-slate-50 rounded-xl" />
                <div className="h-10 bg-slate-100 rounded-xl mt-3" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-8 text-center max-w-md mx-auto shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-2">
              <AlertCircle size={22} />
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-800">Unable to load diagnostics for {selectedCategory}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Please check your connection or pick another category.</p>
          </div>
        ) : tests.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-10 text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-400 flex items-center justify-center mx-auto mb-2.5">
              <Beaker size={24} />
            </div>
            <p className="text-sm font-bold text-slate-800">No tests indexed under {selectedCategory}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Try selecting &quot;All&quot; or another specialty above.</p>
          </div>
        ) : (
          <div className="space-y-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
              >
                {tests.map((test) => {
                  const hasDiscount = test.standardMRP && test.minPrice && test.standardMRP > test.minPrice;
                  const discountPercent = hasDiscount
                    ? Math.round(((test.standardMRP - test.minPrice) / test.standardMRP) * 100)
                    : 0;
                  const isAvailable = test.hasVendor === 1 || test.vendorCount > 0;
                  const catTheme = getCategoryTheme(test.category || test.mainCategory || "");
                  const CardCategoryIcon = getCategoryIcon(test.category || test.mainCategory || "");

                  return (
                    <div
                      key={test._id}
                      className="group relative bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(61,63,150,0.18)] transition-all duration-300 flex flex-col justify-between overflow-hidden"
                    >
                      {/* Top Accent Strip */}
                      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${catTheme.gradient} opacity-80 group-hover:opacity-100 transition-opacity`} />

                      <div>
                        {/* Header: Category Badge & Lab Availability */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${catTheme.badge} truncate max-w-[150px]`}>
                            <CardCategoryIcon size={11} className="shrink-0" />
                            <span className="truncate">{test.category || test.mainCategory || "Pathology"}</span>
                          </div>

                          {isAvailable ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              <CheckCircle2 size={10} className="text-emerald-600" />
                              {test.vendorCount} Lab{test.vendorCount > 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                              Available Soon
                            </span>
                          )}
                        </div>

                        {/* Test Name */}
                        <h3
                          className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#3d3f96] transition-colors leading-snug line-clamp-2 min-h-[46px]"
                          title={test.testName}
                        >
                          {test.testName}
                        </h3>

                        {/* Specs Box */}
                        <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3 my-3 space-y-2">
                          <div className="flex items-center gap-2 text-[11px] font-medium text-slate-700">
                            <div className="w-5 h-5 rounded-md bg-rose-100/70 text-rose-600 flex items-center justify-center shrink-0">
                              <Droplets size={11} />
                            </div>
                            <span className="truncate">Sample: <span className="font-semibold text-slate-900">{test.sampleType || "Blood"}</span></span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] font-medium text-slate-600">
                            <div className="w-5 h-5 rounded-md bg-amber-100/70 text-amber-600 flex items-center justify-center shrink-0">
                              <Clock size={11} />
                            </div>
                            <span className="truncate">{test.pretestPreparation || "No fasting required"}</span>
                          </div>
                        </div>

                        {/* Biomarkers */}
                        {test.parameters && test.parameters.length > 0 && (
                          <div className="mb-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                              <FileText size={10} className="text-indigo-400" /> Parameters ({test.parameters.length}):
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {test.parameters.slice(0, 2).map((p, idx) => (
                                <span key={idx} className="text-[10px] font-medium bg-slate-50 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md truncate max-w-[120px]">
                                  {p}
                                </span>
                              ))}
                              {test.parameters.length > 2 && (
                                <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-md">
                                  +{test.parameters.length - 2} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Footer */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-1">
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                              ₹{test.minPrice || test.standardMRP}
                            </span>
                            {hasDiscount && (
                              <span className="text-[11px] text-slate-400 line-through font-semibold">
                                ₹{test.standardMRP}
                              </span>
                            )}
                          </div>
                          {discountPercent > 0 && (
                            <span className="inline-block text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded mt-0.5">
                              {discountPercent}% OFF
                            </span>
                          )}
                        </div>

                        <Link href={`/labs/testdetail/${test._id}`}>
                          <button className="relative group/btn overflow-hidden bg-[#3d3f96] hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition-all duration-200 active:scale-95">
                            <span>Book Now</span>
                            <ArrowRight size={12} className="stroke-[2.5] group-hover/btn:translate-x-0.5 transition-transform" />
                          </button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            {/* --- BOTTOM CTA --- */}
            <div className="flex justify-center pt-2">
              <Link
                href={`/labs/category/${encodeURIComponent(selectedCategory)}`}
                className="w-full sm:w-auto"
              >
                <button className="w-full sm:w-auto group relative px-7 py-3 rounded-xl bg-white hover:bg-slate-900 text-slate-800 hover:text-white border border-slate-300 hover:border-transparent text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xs hover:shadow-md transition-all duration-200 active:scale-95">
                  <ActiveCategoryIcon size={15} className="group-hover:scale-110 transition-transform" />
                  <span>
                    View All {totalCategoryTests > 0 ? `(${totalCategoryTests})` : ""} {selectedCategory === "All" ? "Tests" : `${selectedCategory} Tests`}
                  </span>
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}