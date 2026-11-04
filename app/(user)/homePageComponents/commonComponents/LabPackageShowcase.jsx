"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Layers,
  ChevronRight,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Clock,
  Droplets,
  Building2,
  CheckCircle2,
  Activity
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

export default function LabPackageShowcase() {
  const { showNotification } = useNotification();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        setError(false);
        const response = await UserAPI.getStandardPackages({ page: 1 });

        if (response && response.success) {
          setPackages(response.data || []);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Error loading health packages:", err);
        setError(true);
        if (showNotification) {
          showNotification(err.message || "Failed to load health packages.", "error");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [showNotification]);

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-[#fdfeff] to-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-16">

        {/* --- HEADER BLOCK --- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 sm:mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100/60 px-3 py-1 rounded-full mb-2.5">
              <Sparkles size={11} className="text-[#3d3f96] fill-[#3d3f96]" />
              <span className="text-[10px] font-black text-[#3d3f96] uppercase tracking-wider">
                Comprehensive Wellness
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none">
              Popular <span className="text-[#3d3f96]">Health Packages</span>
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1.5">
              Discounted diagnostic bundles with multi-parameter coverage and free home sample collection
            </p>
          </div>

          <Link
            href="/labs/allpackages"
            className="group text-[#3d3f96] font-bold text-xs flex items-center gap-1.5 hover:text-[#2a2c7a] uppercase tracking-wider transition-colors shrink-0"
          >
            Explore All Packages
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* --- LOADING SKELETON STATE --- */}
        {loading && (
          <div className="flex overflow-x-auto gap-4 sm:gap-6 pb-6 scrollbar-none px-1">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="flex-none w-[300px] sm:w-[330px] bg-white rounded-3xl border border-slate-100 p-6 flex flex-col space-y-4 animate-pulse"
              >
                <div className="flex justify-between items-center">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100" />
                  <div className="h-5 bg-slate-100 rounded-full w-24" />
                </div>
                <div className="h-5 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="space-y-2 py-2">
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-5/6" />
                </div>
                <div className="h-10 bg-slate-200 rounded-2xl w-full mt-4" />
              </div>
            ))}
          </div>
        )}

        {/* --- ERROR STATE --- */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-12 px-4 rounded-3xl bg-rose-50/50 border border-rose-100">
            <AlertCircle className="text-rose-500 mb-2" size={32} />
            <h3 className="text-sm font-black text-slate-800">Unable to load health packages</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm text-center">
              Please check your connection or try refreshing the page.
            </p>
          </div>
        )}

        {/* --- EMPTY STATE --- */}
        {!loading && !error && packages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 rounded-3xl bg-slate-50 border border-slate-100">
            <p className="text-sm font-bold text-slate-500">No health packages available at the moment.</p>
          </div>
        )}

        {/* --- HORIZONTAL SCROLL CAROUSEL --- */}
        {!loading && !error && packages.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="flex overflow-x-auto gap-4 sm:gap-6 pb-6 scrollbar-none px-1 scroll-smooth snap-x snap-mandatory sm:snap-none"
          >
            {packages.map((pkg) => {
              const effectivePrice = pkg.minPrice || pkg.standardMRP;
              const hasDiscount = pkg.standardMRP && pkg.minPrice && pkg.standardMRP > pkg.minPrice;
              const discountPercent = hasDiscount
                ? Math.round(((pkg.standardMRP - pkg.minPrice) / pkg.standardMRP) * 100)
                : 0;

              return (
                <motion.div
                  key={pkg._id}
                  variants={cardVariants}
                  className="flex-none w-[300px] sm:w-[330px] bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(61,63,150,0.08)] hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between snap-start"
                >
                  <div>
                    {/* Header: Icon & Category Badge */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100/60 flex items-center justify-center text-[#3d3f96] group-hover:scale-105 transition-transform">
                        <Layers size={20} />
                      </div>
                      <span className="text-[10px] font-extrabold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                        {pkg.category || pkg.mainCategory || "Health Package"}
                      </span>
                    </div>

                    {/* Package Title */}
                    <h3
                      className="text-base font-extrabold text-slate-900 group-hover:text-[#3d3f96] transition-colors leading-snug line-clamp-2"
                      title={pkg.packageName}
                    >
                      {pkg.packageName}
                    </h3>

                    {/* Metadata Strip: Test Count, Sample Types & Gender */}
                    <div className="flex flex-wrap items-center gap-2 mt-2.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-md">
                        <Activity size={10} /> {pkg.testCount || pkg.testNames?.length || 0} Tests Included
                      </span>
                      {pkg.gender && (
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                          Gender: {pkg.gender}
                        </span>
                      )}
                    </div>

                    {/* Bundled Tests Preview */}
                    {pkg.testNames && pkg.testNames.length > 0 && (
                      <div className="bg-slate-50/80 rounded-2xl p-3 my-4 border border-slate-100/80 space-y-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Included In This Package:
                        </p>
                        <div className="space-y-1">
                          {pkg.testNames.slice(0, 3).map((testName, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 truncate">
                              <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                              <span className="truncate">{testName}</span>
                            </div>
                          ))}
                          {pkg.testNames.length > 3 && (
                            <p className="text-[10px] font-bold text-[#3d3f96] pl-4">
                              +{pkg.testNames.length - 3} additional tests
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Specimen Info */}
                    {pkg.sampleTypes && pkg.sampleTypes.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 mb-4">
                        <Droplets size={12} className="text-rose-500 shrink-0" />
                        <span className="truncate">Sample: {pkg.sampleTypes.join(', ')}</span>
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
                              ₹{pkg.standardMRP}
                            </span>
                          )}
                        </div>
                        {pkg.vendorCount > 0 ? (
                          <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                            <Building2 size={11} /> Offered by {pkg.vendorCount} certified lab{pkg.vendorCount > 1 ? 's' : ''}
                          </p>
                        ) : (
                          <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                            Standard Platform Pricing
                          </p>
                        )}
                      </div>

                      {discountPercent > 0 && (
                        <span className="text-[10px] font-extrabold bg-rose-50 text-rose-600 border border-rose-100 px-2 py-0.5 rounded-lg">
                          {discountPercent}% OFF
                        </span>
                      )}
                    </div>

                    <Link href={`/labs/packagedetail/${pkg._id}`} className="block w-full">
                      <button className="w-full bg-[#3d3f96] hover:bg-[#2d2f75] text-white py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#3d3f96]/20 active:scale-95">
                        Select Lab &amp; View Tests
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
}