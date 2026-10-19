"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  Heart,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import UserAPI from '../../../services/UserAPI'; // Adjust relative path as needed
import { useNotification } from '../../../context/NotificationContext'; // Adjust path as needed

// Motion container and card configurations
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
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 16 }
  }
};

// Selection of high-quality static images to use if the API returns an empty image list
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=400&auto=format&fit=crop",
  "https://png.pngtree.com/png-clipart/20240619/original/pngtree-drug-capsule-pill-from-prescription-in-drugstore-pharmacy-for-treatment-health-png-image_15366552.png",
  "https://img.magnific.com/free-vector/isometric-gastroenterology-composition-with-view-medication-with-tubes-pills-illustration_1284-63536.jpg?semt=ais_test_b&w=740&q=80",
  "https://img.magnific.com/free-vector/blue-capsules-pot-drug-icon_18591-82034.jpg?semt=ais_test_b&w=740&q=80",
  "https://images.unsplash.com/photo-1628771065518-0d82f1938462?q=80&w=400&auto=format&fit=crop",
];

const MedicineShowcase = () => {
  const { showNotification } = useNotification();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setLoading(true);
        setError(false);
        // Call the non-prescription medicines API with default query parameters
        const response = await UserAPI.getNonPrescriptionMedicinse({ page: 1, limit: 8 });

        if (response && response.success) {
          setMedicines(response.data || []);
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
        if (showNotification) {
          showNotification(err.message || "Failed to load medicines. Please try again.", "error");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, [showNotification]);

  // Helper function to pick a deterministic fallback image based on the item index
  const getProductImage = (item, index) => {
    if (item.image_url && item.image_url.length > 0) {
      return item.image_url[0];
    }
    return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
  };

  // Helper function to generate a stable mock rating for aesthetic completeness
  const getProductRating = (index) => {
    const ratings = [4.8, 4.7, 4.9, 4.6, 4.5, 4.7];
    return ratings[index % ratings.length];
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white to-[#fdfeff]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-16">

        {/* --- HEADER BLOCK --- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 sm:mb-12">
          <div>
            {/* Soft Sparkle Tag */}
            <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100/60 px-2.5 sm:px-3 py-1 rounded-full mb-2 sm:mb-3">
              <Sparkles size={11} className="text-indigo-600 fill-indigo-500" />
              <span className="text-[9px] sm:text-[10px] font-black text-indigo-700 uppercase tracking-wider">Certified Care</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none">
              Our <span className="text-[#3d3f96]">Medicines</span>
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1.5 sm:mt-2">
              Genuine diabetes medications batch-tested and storage-verified
            </p>
          </div>

          <Link
            href="/pharmacy/allproductsandmedicines"
            className="group text-[#3d3f96] font-bold text-[11px] sm:text-xs flex items-center gap-1.5 hover:text-[#2a2c7a] uppercase tracking-wider transition-colors shrink-0"
          >
            View All Medicines
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* --- LOADING SKELETON STATE --- */}
        {loading && (
          <div className="flex overflow-x-auto gap-3 sm:gap-6 pb-6 sm:pb-10 scrollbar-none px-1">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="flex-none w-[calc(50%-6px)] min-w-[calc(50%-6px)] max-w-[calc(50%-6px)] sm:w-[260px] sm:min-w-[260px] sm:max-w-[260px] lg:w-[270px] lg:min-w-[270px] lg:max-w-[270px] bg-white rounded-2xl sm:rounded-[2.2rem] border border-slate-100 p-3 sm:p-5 lg:p-6 flex flex-col space-y-3 sm:space-y-4 animate-pulse"
              >
                <div className="w-full h-36 sm:h-48 lg:h-52 bg-slate-100 rounded-xl sm:rounded-[1.8rem]" />
                <div className="h-3 sm:h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-4 sm:h-6 bg-slate-200 rounded w-3/4" />
                <div className="h-3 sm:h-4 bg-slate-200 rounded w-1/2" />
                <div className="h-8 sm:h-10 bg-slate-200 rounded-xl sm:rounded-2xl w-full mt-2 sm:mt-4" />
              </div>
            ))}
          </div>
        )}

        {/* --- ERROR STATE --- */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-12 px-4 rounded-3xl bg-rose-50/50 border border-rose-100">
            <AlertCircle className="text-rose-500 mb-3" size={32} />
            <h3 className="text-base font-black text-slate-800">Unable to retrieve products</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm text-center">We couldn't connect to our servers. Check your connection or try refreshing the page.</p>
          </div>
        )}

        {/* --- EMPTY STATE --- */}
        {!loading && !error && medicines.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 rounded-3xl bg-slate-50 border border-slate-100">
            <p className="text-sm font-bold text-slate-500">No products available at the moment.</p>
          </div>
        )}

        {/* --- CAROUSEL WRAPPER WITH INVISIBLE HORIZONTAL SCROLL --- */}
        {!loading && !error && medicines.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="flex overflow-x-auto gap-3 sm:gap-6 pb-6 sm:pb-10 
              [&::-webkit-scrollbar]:hidden 
              [-ms-overflow-style:none] 
              [scrollbar-width:none]
              px-1 scroll-smooth snap-x snap-mandatory sm:snap-none"
          >
            {medicines.map((med, index) => {
              const rating = getProductRating(index);
              const productImage = getProductImage(med, index);
              const hasDiscount = med.discont_percent && med.discont_percent !== "0%";
              const isInstock = med.isAvailable ?? true; // fallback to true if undefined

              return (
                <motion.div
                  key={med._id || med.Id || index}
                  variants={cardVariants}
                  className="flex-none w-[calc(50%-6px)] min-w-[calc(50%-6px)] max-w-[calc(50%-6px)] sm:w-[260px] sm:min-w-[260px] sm:max-w-[260px] lg:w-[270px] lg:min-w-[270px] lg:max-w-[270px] bg-white rounded-2xl sm:rounded-[2.2rem] border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(61,63,150,0.12)] hover:-translate-y-1.5 transition-all duration-300 group overflow-hidden flex flex-col justify-between snap-start"
                >
                  {/* Media Section */}
                  <div className="relative h-36 sm:h-48 lg:h-52 w-full bg-slate-50 overflow-hidden">
                    <img
                      src={productImage}
                      alt={med.name}
                      className="w-full h-full object-cover scale-102 group-hover:scale-110 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />

                    {/* Discount Tag */}
                    {hasDiscount && (
                      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-red-500 text-white text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl shadow-md shadow-red-500/20 tracking-wider">
                        {med.discont_percent} OFF
                      </div>
                    )}

                    {/* Glassmorphic Wishlist Button */}
                    <button className="absolute top-2 right-2 sm:top-4 sm:right-4 p-1.5 sm:p-2.5 bg-white/75 hover:bg-white backdrop-blur-md rounded-lg sm:rounded-xl text-slate-400 hover:text-rose-500 hover:scale-105 active:scale-95 transition-all shadow-sm">
                      <Heart size={13} className="sm:w-[15px] sm:h-[15px] stroke-[2.5]" />
                    </button>

                    {/* Rating Badge */}
                    <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl flex items-center gap-1 sm:gap-1.5 shadow-sm border border-slate-100/50">
                      <Star size={10} fill="currentColor" className="sm:w-[11px] sm:h-[11px] text-amber-400 stroke-amber-400" />
                      <span className="text-[9px] sm:text-[10px] font-black text-slate-800">{rating}</span>
                    </div>
                  </div>

                  {/* Content Block */}
                  <div className="p-3 sm:p-5 lg:p-6 flex flex-col flex-grow min-w-0">
                    <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate min-w-0">
                      {med.manufacturers || "General Healthcare"}
                    </span>
                    <h3
                      className="text-xs sm:text-sm md:text-base font-black text-slate-800 mt-1 sm:mt-1.5 truncate group-hover:text-[#3d3f96] transition-colors leading-snug min-w-0"
                      title={med.name}
                    >
                      {med.name}
                    </h3>

                    {/* Pricing Block */}
                    <div className="mt-2.5 sm:mt-4 flex items-baseline gap-1.5 sm:gap-2 flex-wrap min-w-0">
                      <span className="text-sm sm:text-base md:text-xl font-black text-slate-900 leading-none">
                        ₹{med.best_price}
                      </span>
                      {parseFloat(med.mrp) > parseFloat(med.best_price) && (
                        <span className="text-[10px] sm:text-xs text-slate-400 line-through font-bold">
                          ₹{med.mrp}
                        </span>
                      )}
                    </div>

                    {/* Salt Composition / Packaging Sub-detail */}
                    <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium mt-1 sm:mt-1.5 truncate min-w-0">
                      {med.packaging || "1 unit"} • {med.salt_composition || "OTC Formulation"}
                    </p>

                    {/* View Details CTA */}
                    <Link href={`/pharmacy/productdetail/${med._id}`} className="block w-full mt-3 sm:mt-5 min-w-0">
                      <button className="w-full bg-gradient-to-r from-[#3d3f96] to-[#5a5dbd] hover:from-[#5a5dbd] hover:to-[#3d3f96] text-white py-2 sm:py-3 lg:py-3.5 px-2 sm:px-4 rounded-xl sm:rounded-2xl font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1 sm:gap-1.5 shadow-[0_10px_20px_rgba(61,63,150,0.2)] hover:shadow-[0_12px_25px_rgba(61,63,150,0.3)] active:scale-[0.98] transition-all duration-300 group/btn">
                        View Details
                        <ArrowRight
                          size={12}
                          className="sm:w-[14px] sm:h-[14px] group-hover/btn:translate-x-1 transition-transform stroke-[2.5]"
                        />
                      </button>
                    </Link>

                    {/* Availability / Delivery Tag */}
                    <div className="mt-3 sm:mt-5 pt-2.5 sm:pt-4 border-t border-slate-100 flex items-center justify-between min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 overflow-hidden">
                        {isInstock ? (
                          <>
                            <div className="relative flex h-2 w-2 shrink-0">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </div>
                            <span className="text-[8px] sm:text-[10px] font-bold text-slate-500 truncate min-w-0">
                              In Stock • Delivery tomorrow
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="flex h-2 w-2 rounded-full bg-rose-400 shrink-0" />
                            <span className="text-[8px] sm:text-[10px] font-bold text-rose-500 truncate min-w-0">
                              Out of Stock
                            </span>
                          </>
                        )}
                      </div>
                    </div>
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

export default MedicineShowcase;