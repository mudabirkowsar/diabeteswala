"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Beaker,
  ChevronRight,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Clock,
  Droplets,
  Building2,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import UserAPI from '../../../services/UserAPI'; // Adjust relative path as needed
import { useNotification } from '../../../context/NotificationContext'; // Adjust relative path as needed

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 16 }
  }
};

const LabTestShowcase = () => {
  const { showNotification } = useNotification();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        setError(false);
        const response = await UserAPI.getStandardCatalogTests({ page: 1, limit: 8 });

        if (response && response.success) {
          setTests(response.data || []);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Error loading lab tests:", err);
        setError(true);
        if (showNotification) {
          showNotification(err.message || "Failed to load lab tests.", "error");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [showNotification]);

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-white to-[#fdfeff]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-16">
        
        {/* --- HEADER BLOCK --- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 sm:mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100/60 px-3 py-1 rounded-full mb-2.5">
              <Sparkles size={11} className="text-[#3d3f96] fill-[#3d3f96]" />
              <span className="text-[10px] font-black text-[#3d3f96] uppercase tracking-wider">
                NABL Certified Diagnostics
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none">
              Individual <span className="text-[#3d3f96]">Lab Tests</span>
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1.5">
              Book single pathology &amp; radiology tests with verified home sample collection
            </p>
          </div>

          <Link
            href="/labs/alltests"
            className="group text-[#3d3f96] font-bold text-xs flex items-center gap-1.5 hover:text-[#2a2c7a] uppercase tracking-wider transition-colors shrink-0"
          >
            Explore All Tests
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* --- LOADING SKELETON STATE --- */}
        {loading && (
          <div className="flex overflow-x-auto gap-4 sm:gap-6 pb-6 scrollbar-none px-1">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="flex-none w-[280px] sm:w-[310px] bg-white rounded-3xl border border-slate-100 p-5 flex flex-col space-y-4 animate-pulse"
              >
                <div className="flex justify-between items-center">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100" />
                  <div className="h-5 bg-slate-100 rounded-full w-20" />
                </div>
                <div className="h-4 bg-slate-200 rounded w-2/3" />
                <div className="h-3 bg-slate-100 rounded w-1/3" />
                <div className="h-16 bg-slate-50 rounded-2xl w-full" />
                <div className="h-10 bg-slate-200 rounded-2xl w-full mt-4" />
              </div>
            ))}
          </div>
        )}

        {/* --- ERROR STATE --- */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-12 px-4 rounded-3xl bg-rose-50/50 border border-rose-100">
            <AlertCircle className="text-rose-500 mb-2" size={32} />
            <h3 className="text-sm font-black text-slate-800">Unable to load lab tests</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm text-center">
              Please check your connection or try refreshing the page.
            </p>
          </div>
        )}

        {/* --- EMPTY STATE --- */}
        {!loading && !error && tests.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 rounded-3xl bg-slate-50 border border-slate-100">
            <p className="text-sm font-bold text-slate-500">No diagnostic tests currently listed.</p>
          </div>
        )}

        {/* --- CAROUSEL WRAPPER WITH INVISIBLE HORIZONTAL SCROLL --- */}
        {!loading && !error && tests.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="flex overflow-x-auto gap-4 sm:gap-6 pb-6 scrollbar-none px-1 scroll-smooth snap-x snap-mandatory sm:snap-none"
          >
            {tests.map((test) => {
              const effectivePrice = test.minPrice || test.standardMRP;
              const hasDiscount = test.standardMRP && test.minPrice && test.standardMRP > test.minPrice;
              const discountPercent = hasDiscount
                ? Math.round(((test.standardMRP - test.minPrice) / test.standardMRP) * 100)
                : 0;

              return (
                <motion.div
                  key={test._id}
                  variants={cardVariants}
                  className="flex-none w-[280px] sm:w-[310px] bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(61,63,150,0.08)] hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between snap-start"
                >
                  <div>
                    {/* Top Tag & Category Icon */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100/60 flex items-center justify-center text-[#3d3f96] group-hover:scale-105 transition-transform">
                        <Beaker size={20} />
                      </div>
                      <span className="text-[10px] font-extrabold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                        {test.mainCategory || "Pathology"}
                      </span>
                    </div>

                    {/* Test Code & Name */}
                    {test.testCode && (
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Code: {test.testCode}
                      </span>
                    )}
                    <h3 
                      className="text-base font-extrabold text-slate-900 group-hover:text-[#3d3f96] transition-colors leading-snug line-clamp-2 mt-0.5"
                      title={test.testName}
                    >
                      {test.testName}
                    </h3>

                    {/* Test Specifications Box */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 my-4 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                        <Droplets size={13} className="text-rose-500 shrink-0" />
                        <span className="truncate">Sample: {test.sampleType || "Blood"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                        <Clock size={13} className="text-amber-500 shrink-0" />
                        <span className="truncate">
                          {test.pretestPreparation || "No fasting required"}
                        </span>
                      </div>
                    </div>

                    {/* Parameters Preview */}
                    {test.parameters && test.parameters.length > 0 && (
                      <div className="mb-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                          <FileText size={11} /> Covers {test.parameters.length} Key Marker{test.parameters.length > 1 ? 's' : ''}:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {test.parameters.slice(0, 3).map((param, idx) => (
                            <span 
                              key={idx} 
                              className="text-[10px] font-bold bg-indigo-50/60 text-[#3d3f96] border border-indigo-100/50 px-2 py-0.5 rounded-md truncate max-w-[150px]"
                            >
                              {param}
                            </span>
                          ))}
                          {test.parameters.length > 3 && (
                            <span className="text-[10px] font-bold text-slate-400 self-center">
                              +{test.parameters.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pricing, Vendor count & View Details CTA */}
                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-baseline justify-between mb-3">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-black text-slate-900">
                            ₹{effectivePrice}
                          </span>
                          {hasDiscount && (
                            <span className="text-xs text-slate-400 line-through font-semibold">
                              ₹{test.standardMRP}
                            </span>
                          )}
                        </div>
                        {test.vendorCount > 0 && (
                          <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                            <Building2 size={11} /> Offered by {test.vendorCount} certified lab{test.vendorCount > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>

                      {discountPercent > 0 && (
                        <span className="text-[10px] font-extrabold bg-rose-50 text-rose-600 border border-rose-100 px-2 py-0.5 rounded-lg">
                          {discountPercent}% OFF
                        </span>
                      )}
                    </div>

                    <Link href={`/labs/testdetail/${test._id}`} className="block w-full">
                      <button className="w-full bg-[#3d3f96] hover:bg-[#2d2f75] text-white py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#3d3f96]/20 active:scale-95">
                        Select Lab &amp; Book
                        <ArrowRight size={13} className="stroke-[2.5]" />
                      </button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

      </div>
    </section>
  );
};

export default LabTestShowcase;