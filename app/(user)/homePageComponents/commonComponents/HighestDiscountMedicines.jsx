"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Flame,
  ChevronRight,
  ArrowRight,
  Heart,
  AlertCircle,
  Tag,
  FileText,
  TrendingDown,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import UserAPI from '../../../services/UserAPI'; // Adjust relative path as needed
import { useNotification } from '../../../context/NotificationContext'; // Adjust path as needed

// Motion staggered animations
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

// Fallback images in case API returns an empty array
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=400&auto=format&fit=crop",
  "https://png.pngtree.com/png-clipart/20240619/original/pngtree-drug-capsule-pill-from-prescription-in-drugstore-pharmacy-for-treatment-health-png-image_15366552.png",
  "https://img.magnific.com/free-vector/isometric-gastroenterology-composition-with-view-medication-with-tubes-pills-illustration_1284-63536.jpg?semt=ais_test_b&w=740&q=80",
  "https://img.magnific.com/free-vector/blue-capsules-pot-drug-icon_18591-82034.jpg?semt=ais_test_b&w=740&q=80",
  "https://images.unsplash.com/photo-1628771065518-0d82f1938462?q=80&w=400&auto=format&fit=crop",
];

const HighestDiscountMedicines = () => {
  const { showNotification } = useNotification();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchDiscountedMedicines = async () => {
      try {
        setLoading(true);
        setError(false);
        // Call the highest discount medicines API
        const response = await UserAPI.getHighestDiscountMedicines({ page: 1, limit: 10 });

        if (response && response.success) {
          setMedicines(response.data || []);
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
        if (showNotification) {
          showNotification(err.message || "Failed to load discount deals. Please try again.", "error");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDiscountedMedicines();
  }, [showNotification]);

  const getProductImage = (item, index) => {
    if (item.image_url && Array.isArray(item.image_url) && item.image_url.length > 0) {
      return item.image_url[0];
    }
    return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white via-amber-50/20 to-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-16">

        {/* --- HEADER BLOCK --- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 sm:mb-12">
          <div>
            {/* Super Saver Highlight Tag */}
            <div className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-100 px-2.5 sm:px-3 py-1 rounded-full mb-2 sm:mb-3">
              <Flame size={12} className="text-rose-600 fill-rose-500 animate-pulse" />
              <span className="text-[9px] sm:text-[10px] font-black text-rose-700 uppercase tracking-wider">
                Mega Savings Zone
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none">
              Highest <span className="text-rose-600">Discount Deals</span>
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1.5 sm:mt-2">
              Maximum markdown on genuine daily medications sourced directly from active partner chemists
            </p>
          </div>

          <Link
            href="/pharmacy/allproductsandmedicines"
            className="group text-rose-600 font-bold text-[11px] sm:text-xs flex items-center gap-1.5 hover:text-rose-700 uppercase tracking-wider transition-colors shrink-0"
          >
            See All Deals
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
                <div className="h-3 bg-slate-200 rounded w-1/3" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-8 bg-slate-200 rounded-xl w-full mt-3" />
              </div>
            ))}
          </div>
        )}

        {/* --- ERROR STATE --- */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-12 px-4 rounded-3xl bg-rose-50/50 border border-rose-100">
            <AlertCircle className="text-rose-500 mb-3" size={32} />
            <h3 className="text-base font-black text-slate-800">Unable to load discount deals</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm text-center">
              Failed to retrieve discounted batch pricing. Please refresh or try again later.
            </p>
          </div>
        )}

        {/* --- EMPTY STATE --- */}
        {!loading && !error && medicines.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 rounded-3xl bg-slate-50 border border-slate-100">
            <p className="text-sm font-bold text-slate-500">No discounted medicines currently available.</p>
          </div>
        )}

        {/* --- HORIZONTAL CAROUSEL --- */}
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
              const medicineId = med._id || med.Id;
              const isRxRequired = (med.prescription_required || "").toUpperCase() === "YES";
              
              // Pricing & Savings math
              const bestPriceNum = parseFloat(med.best_price || med.minimumPrice || 0);
              const mrpNum = parseFloat(med.mrp || med.minimumMRP || 0);
              const savingsAmount = mrpNum > bestPriceNum ? Math.round(mrpNum - bestPriceNum) : 0;
              const discountLabel = med.discont_percent || `${med.discountPercentage || 0}%`;

              return (
                <motion.div
                  key={medicineId || index}
                  variants={cardVariants}
                  className="flex-none w-[calc(50%-6px)] min-w-[calc(50%-6px)] max-w-[calc(50%-6px)] sm:w-[270px] sm:min-w-[270px] sm:max-w-[270px] bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_rgba(225,29,72,0.12)] hover:border-rose-200/80 hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between overflow-hidden snap-start relative"
                >
                  {/* Top Image Preview */}
                  <div className="relative h-36 sm:h-48 w-full bg-slate-50/70 overflow-hidden">
                    <img
                      src={productImage}
                      alt={med.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />

                    {/* Gradient Discount Badge */}
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 flex flex-col gap-1">
                      <div className="inline-flex items-center gap-1 bg-gradient-to-r from-rose-600 to-orange-500 text-white text-[8px] sm:text-[9px] font-black px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg shadow-md shadow-rose-500/25 uppercase tracking-wider">
                        <Flame size={10} className="fill-white" />
                        {discountLabel} OFF
                      </div>

                      {/* Rx / OTC Indicator */}
                      {isRxRequired ? (
                        <span className="inline-flex items-center gap-0.5 bg-amber-500/90 backdrop-blur-sm text-white text-[7px] sm:text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm w-fit">
                          <FileText size={8} /> Rx
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 bg-emerald-600/90 backdrop-blur-sm text-white text-[7px] sm:text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm w-fit">
                          OTC
                        </span>
                      )}
                    </div>

                    {/* Wishlist Button */}
                    <button
                      type="button"
                      aria-label="Add to wishlist"
                      className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 bg-white/85 hover:bg-white backdrop-blur-md rounded-lg sm:rounded-xl text-slate-400 hover:text-rose-500 hover:scale-105 active:scale-95 transition-all shadow-sm"
                    >
                      <Heart size={13} className="sm:w-[15px] sm:h-[15px] stroke-[2.5]" />
                    </button>

                    {/* Bottom Savings Callout */}
                    {savingsAmount > 0 && (
                      <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-emerald-500 text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm">
                        <TrendingDown size={10} />
                        Save ₹{savingsAmount}
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-3 sm:p-4 lg:p-5 flex flex-col flex-grow min-w-0">
                    
                    {/* Primary Indication or Category */}
                    <span className="text-[8px] sm:text-[9px] font-black text-rose-600 uppercase tracking-widest truncate min-w-0">
                      {med.primary_use || med.bread_crumb?.split('>')[0] || "Health & Wellness"}
                    </span>

                    {/* Medicine Brand Name */}
                    <h3
                      className="text-xs sm:text-sm font-black text-slate-800 mt-1 truncate group-hover:text-rose-600 transition-colors leading-snug"
                      title={med.name}
                    >
                      {med.name}
                    </h3>

                    {/* Manufacturer & Packaging */}
                    <div className="text-[8px] sm:text-[9px] text-slate-400 font-medium truncate mt-0.5">
                      {med.manufacturers || "Pharma Lab"} • {med.packaging || "Standard pack"}
                    </div>

                    {/* Active Salt Formulation */}
                    <div className="mt-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-100 min-w-0">
                      <p className="text-[8px] sm:text-[9px] text-slate-500 font-semibold truncate" title={med.salt_composition}>
                        {med.salt_composition || "Standard Formula"}
                      </p>
                    </div>

                    {/* Pricing Display */}
                    <div className="mt-3 flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-sm sm:text-base md:text-xl font-black text-slate-900 leading-none">
                        ₹{med.best_price}
                      </span>
                      {mrpNum > bestPriceNum && (
                        <span className="text-[9px] sm:text-xs text-slate-400 line-through font-bold">
                          ₹{med.mrp}
                        </span>
                      )}
                    </div>

                    {/* Grab Deal CTA */}
                    <Link
                      href={`/pharmacy/productdetail/${medicineId}`}
                      className="block w-full mt-3 min-w-0"
                    >
                      <button className="w-full bg-gradient-to-r from-rose-500 via-rose-600 to-red-600 hover:from-rose-600 hover:to-red-700 text-white py-2 sm:py-2.5 px-3 rounded-xl font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1.5 shadow-[0_6px_16px_rgba(225,29,72,0.22)] hover:shadow-[0_8px_20px_rgba(225,29,72,0.3)] active:scale-[0.98] transition-all group/btn">
                        <span>Grab Deal</span>
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
};

export default HighestDiscountMedicines;