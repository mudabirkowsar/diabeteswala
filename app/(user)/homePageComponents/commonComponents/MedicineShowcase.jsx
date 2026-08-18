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
    <section className="py-20 bg-gradient-to-b from-white to-[#fdfeff]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16">

        {/* --- HEADER BLOCK --- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12">
          <div>
            {/* Soft Sparkle Tag */}
            <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100/60 px-3 py-1 rounded-full mb-3">
              <Sparkles size={11} className="text-indigo-600 fill-indigo-500" />
              <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider">Certified Care</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none">
              Our <span className="text-[#3d3f96]">Medicines</span>
            </h2>
            <p className="text-slate-500 text-sm font-medium mt-2">Genuine diabetes medications batch-tested and storage-verified</p>
          </div>

          <Link href="/pharmacy/allproductsandmedicines" className="group text-[#3d3f96] font-bold text-xs flex items-center gap-1.5 hover:text-[#2a2c7a] uppercase tracking-wider transition-colors shrink-0">
            View All Medicines
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* --- LOADING SKELETON STATE --- */}
        {loading && (
          <div className="flex overflow-x-auto gap-6 pb-10 scrollbar-none px-1">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="flex-shrink-0 w-[270px] bg-white rounded-[2.2rem] border border-slate-100 p-6 flex flex-col space-y-4 animate-pulse"
              >
                <div className="w-full h-44 bg-slate-100 rounded-[1.8rem]" />
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-6 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
                <div className="h-10 bg-slate-200 rounded-2xl w-full mt-4" />
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

        {/* --- CAROUSEL WRAPPER WITH INVISIBLE SCROLL --- */}
        {!loading && !error && medicines.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="flex overflow-x-auto gap-6 pb-10 
              [&::-webkit-scrollbar]:hidden 
              [-ms-overflow-style:none] 
              [scrollbar-width:none]
              px-1"
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
                  className="flex-shrink-0 w-[270px] bg-white rounded-[2.2rem] border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(61,63,150,0.12)] hover:-translate-y-1.5 transition-all duration-300 group overflow-hidden flex flex-col justify-between"
                >
                  {/* Media Section */}
                  <div className="relative h-52 w-full bg-slate-50 overflow-hidden">
                    <img
                      src={productImage}
                      alt={med.name}
                      className="w-full h-full object-cover scale-102 group-hover:scale-110 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />

                    {/* Discount Tag */}
                    {hasDiscount && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white text-[9px] font-black px-2.5 py-1.5 rounded-xl shadow-md shadow-red-500/20 tracking-wider">
                        {med.discont_percent} OFF
                      </div>
                    )}

                    {/* Glassmorphic Wishlist Button */}
                    <button className="absolute top-4 right-4 p-2.5 bg-white/75 hover:bg-white backdrop-blur-md rounded-xl text-slate-400 hover:text-rose-500 hover:scale-105 active:scale-95 transition-all shadow-sm">
                      <Heart size={15} className="stroke-[2.5]" />
                    </button>

                    {/* Rating Badge */}
                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-sm border border-slate-100/50">
                      <Star size={11} fill="currentColor" className="text-amber-400 stroke-amber-400" />
                      <span className="text-[10px] font-black text-slate-800">{rating}</span>
                    </div>
                  </div>

                  {/* Content Block */}
                  <div className="p-6 flex flex-col flex-grow">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">
                      {med.manufacturers || "General Healthcare"}
                    </span>
                    <h3 className="text-base font-black text-slate-800 mt-1.5 truncate group-hover:text-[#3d3f96] transition-colors leading-snug" title={med.name}>
                      {med.name}
                    </h3>

                    {/* Pricing Block */}
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-xl font-black text-slate-900 leading-none">
                        ₹{med.best_price}
                      </span>
                      {parseFloat(med.mrp) > parseFloat(med.best_price) && (
                        <span className="text-xs text-slate-400 line-through font-bold">
                          ₹{med.mrp}
                        </span>
                      )}
                    </div>

                    {/* Salt Composition / Packaging Sub-detail */}
                    <p className="text-[10px] text-slate-400 font-medium mt-1.5 truncate">
                      {med.packaging || "1 unit"} • {med.salt_composition || "OTC Formulation"}
                    </p>

                    {/* View Details CTA */}
                    <Link href={`/pharmacy/productdetail/${med._id}`} className="block w-full mt-5">
                      <button className="w-full bg-gradient-to-r from-[#3d3f96] to-[#5a5dbd] hover:from-[#5a5dbd] hover:to-[#3d3f96] text-white py-3.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_10px_20px_rgba(61,63,150,0.2)] hover:shadow-[0_12px_25px_rgba(61,63,150,0.3)] active:scale-[0.98] transition-all duration-300 group/btn">
                        View Details
                        <ArrowRight
                          size={14}
                          className="group-hover/btn:translate-x-1 transition-transform stroke-[2.5]"
                        />
                      </button>
                    </Link>

                    {/* Availability / Delivery Tag */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isInstock ? (
                          <>
                            <div className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500">In Stock • Delivery tomorrow</span>
                          </>
                        ) : (
                          <>
                            <div className="flex h-2 w-2 rounded-full bg-rose-400" />
                            <span className="text-[10px] font-bold text-rose-500">Out of Stock</span>
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