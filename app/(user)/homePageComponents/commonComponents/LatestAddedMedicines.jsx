"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ChevronRight,
  ArrowRight,
  Heart,
  AlertCircle,
  RotateCcw,
  ShieldCheck,
  FileText,
  BadgePercent
} from 'lucide-react';
import Link from 'next/link';
import UserAPI from '../../../services/UserAPI'; // Adjust relative path as needed
import { useNotification } from '../../../context/NotificationContext'; // Adjust path as needed

// Motion configurations
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
    transition: { type: "spring", stiffness: 120, damping: 18 }
  }
};

// Deterministic fallback images
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=400&auto=format&fit=crop",
  "https://png.pngtree.com/png-clipart/20240619/original/pngtree-drug-capsule-pill-from-prescription-in-drugstore-pharmacy-for-treatment-health-png-image_15366552.png",
  "https://img.magnific.com/free-vector/isometric-gastroenterology-composition-with-view-medication-with-tubes-pills-illustration_1284-63536.jpg?semt=ais_test_b&w=740&q=80",
  "https://img.magnific.com/free-vector/blue-capsules-pot-drug-icon_18591-82034.jpg?semt=ais_test_b&w=740&q=80",
  "https://images.unsplash.com/photo-1628771065518-0d82f1938462?q=80&w=400&auto=format&fit=crop",
];

function LatestAddedMedicines() {
  const { showNotification } = useNotification();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchLatestMedicines = async () => {
      try {
        setLoading(true);
        setError(false);
        // Call the newly documented API endpoint
        const response = await UserAPI.getLatestAddedMedicines({ page: 1, limit: 10 });

        if (response && response.success) {
          setMedicines(response.data || []);
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
        if (showNotification) {
          showNotification(err.message || "Failed to load recently added medicines.", "error");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLatestMedicines();
  }, [showNotification]);

  const getProductImage = (item, index) => {
    if (item.image_url && Array.isArray(item.image_url) && item.image_url.length > 0) {
      return item.image_url[0];
    }
    return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-[#fafbfe]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-16">

        {/* --- HEADER BLOCK --- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-2.5 sm:px-3 py-1 rounded-full mb-2 sm:mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-black text-emerald-700 uppercase tracking-wider">
                Fresh Inventory
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none">
              Newly Added <span className="text-[#3d3f96]">Medicines</span>
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1.5 sm:mt-2">
              Recently stocked genuine medications directly verified from trusted chemist partners
            </p>
          </div>

          <Link
            href="/pharmacy/allproductsandmedicines"
            className="group text-[#3d3f96] font-bold text-[11px] sm:text-xs flex items-center gap-1.5 hover:text-[#2a2c7a] uppercase tracking-wider transition-colors shrink-0"
          >
            Explore All
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* --- LOADING SKELETONS --- */}
        {loading && (
          <div className="flex overflow-x-auto gap-3 sm:gap-6 pb-6 sm:pb-10 scrollbar-none px-1">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="flex-none w-[calc(50%-6px)] min-w-[calc(50%-6px)] max-w-[calc(50%-6px)] sm:w-[270px] sm:min-w-[270px] bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-3 sm:p-5 flex flex-col space-y-3 animate-pulse"
              >
                <div className="w-full h-36 sm:h-48 bg-slate-100 rounded-xl sm:rounded-2xl" />
                <div className="h-3 bg-slate-200 rounded w-1/4" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-8 bg-slate-200 rounded-xl w-full mt-3" />
              </div>
            ))}
          </div>
        )}

        {/* --- ERROR STATE --- */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-12 px-4 rounded-3xl bg-rose-50/60 border border-rose-100">
            <AlertCircle className="text-rose-500 mb-3" size={32} />
            <h3 className="text-base font-black text-slate-800">Unable to load new arrivals</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm text-center">
              We couldn't connect to our inventory servers. Please refresh or try again shortly.
            </p>
          </div>
        )}

        {/* --- EMPTY STATE --- */}
        {!loading && !error && medicines.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 rounded-3xl bg-white border border-slate-100">
            <p className="text-sm font-bold text-slate-500">No recently added medicines found.</p>
          </div>
        )}

        {/* --- MEDICINES CAROUSEL --- */}
        {!loading && !error && medicines.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="flex overflow-x-auto gap-3 sm:gap-6 pb-6 sm:pb-10 
              [&::-webkit-scrollbar]:hidden 
              [-ms-overflow-style:none] 
              [scrollbar-width:none]
              px-1 scroll-smooth snap-x snap-mandatory sm:snap-none"
          >
            {medicines.map((med, index) => {
              const productImage = getProductImage(med, index);
              const hasDiscount = med.discont_percent && med.discont_percent !== "0%" && med.discont_percent !== "0";
              const isRxRequired = (med.prescription_required || "").toUpperCase() === "YES";
              const medicineId = med._id || med.medicineId;

              return (
                <motion.div
                  key={medicineId || index}
                  variants={cardVariants}
                  className="flex-none w-[calc(50%-6px)] min-w-[calc(50%-6px)] max-w-[calc(50%-6px)] sm:w-[270px] sm:min-w-[270px] sm:max-w-[270px] bg-white rounded-2xl sm:rounded-3xl border border-slate-200/70 hover:border-indigo-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(61,63,150,0.1)] hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between overflow-hidden snap-start"
                >
                  {/* Top Preview Card Area */}
                  <div className="relative h-36 sm:h-48 w-full bg-[#f6f8fb] overflow-hidden">
                    <img
                      src={productImage}
                      alt={med.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />

                    {/* Top Badges (Discount + Prescription Status) */}
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 z-10">
                      {hasDiscount && (
                        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-[8px] sm:text-[9px] font-black px-1.5 sm:px-2 py-0.5 rounded-md shadow-sm uppercase tracking-wider">
                          <BadgePercent size={10} />
                          {med.discont_percent} OFF
                        </span>
                      )}

                      {/* Rx status pill */}
                      {isRxRequired ? (
                        <span className="inline-flex items-center gap-0.5 bg-amber-500/90 backdrop-blur-sm text-white text-[7px] sm:text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-sm uppercase">
                          <FileText size={9} />
                          Rx Req
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 bg-emerald-600/90 backdrop-blur-sm text-white text-[7px] sm:text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-sm uppercase">
                          OTC
                        </span>
                      )}
                    </div>

                    {/* Wishlist Button */}
                    <button
                      type="button"
                      aria-label="Add to wishlist"
                      className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 bg-white/80 hover:bg-white backdrop-blur-md rounded-lg sm:rounded-xl text-slate-400 hover:text-rose-500 hover:scale-105 active:scale-95 transition-all shadow-sm"
                    >
                      <Heart size={13} className="sm:w-[15px] sm:h-[15px] stroke-[2.5]" />
                    </button>

                    {/* Return Allowed Indicator */}
                    {med.isReturnAllowed && (
                      <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-white/95 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 rounded-md flex items-center gap-1 border border-slate-100 shadow-xs">
                        <RotateCcw size={9} className="text-indigo-600" />
                        <span className="text-[8px] sm:text-[9px] font-bold text-slate-700">Returns Accepted</span>
                      </div>
                    )}
                  </div>

                  {/* Body Content Area */}
                  <div className="p-3 sm:p-4 lg:p-5 flex flex-col flex-grow min-w-0">
                    {/* Primary Indication / Category Tag */}
                    <div className="flex items-center gap-1 min-w-0 mb-1">
                      <span className="text-[8px] sm:text-[9px] font-black text-indigo-600 bg-indigo-50/70 px-1.5 py-0.5 rounded uppercase tracking-wider truncate">
                        {med.primary_use || "General Care"}
                      </span>
                    </div>

                    {/* Medicine Name */}
                    <h3
                      className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-[#3d3f96] transition-colors line-clamp-1 leading-snug mt-0.5"
                      title={med.name}
                    >
                      {med.name}
                    </h3>

                    {/* Manufacturer & Salt */}
                    <p className="text-[8px] sm:text-[9px] text-slate-400 font-semibold truncate mt-0.5">
                      By {med.manufacturers || "Healthcare Ltd"}
                    </p>

                    <p
                      className="text-[8px] sm:text-[9px] text-slate-500 font-medium truncate mt-1 bg-slate-50 p-1 rounded border border-slate-100/80"
                      title={med.salt_composition}
                    >
                      🧪 {med.salt_composition || "Active formulation"}
                    </p>

                    {/* Pricing */}
                    <div className="mt-3 flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-sm sm:text-base md:text-lg font-black text-slate-900 leading-none">
                        ₹{med.best_price}
                      </span>
                      {parseFloat(med.mrp) > parseFloat(med.best_price) && (
                        <span className="text-[9px] sm:text-[11px] text-slate-400 line-through font-bold">
                          ₹{med.mrp}
                        </span>
                      )}
                    </div>

                    {/* Packaging Detail */}
                    <span className="text-[8px] sm:text-[9px] text-slate-400 font-medium mt-0.5">
                      {med.packaging || "1 unit per pack"}
                    </span>

                    {/* Action Button */}
                    <Link
                      href={`/pharmacy/productdetail/${medicineId}`}
                      className="block w-full mt-3 min-w-0"
                    >
                      <button className="w-full bg-[#3d3f96] hover:bg-[#2f3177] text-white py-2 sm:py-2.5 px-3 rounded-xl font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1.5 shadow-[0_6px_16px_rgba(61,63,150,0.18)] hover:shadow-[0_8px_20px_rgba(61,63,150,0.26)] active:scale-[0.98] transition-all group/btn">
                        <span>View Details</span>
                        <ArrowRight
                          size={12}
                          className="group-hover/btn:translate-x-1 transition-transform stroke-[2.5]"
                        />
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

export default LatestAddedMedicines;