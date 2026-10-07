'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  ChevronRight,
  Loader2,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Zap,
  Users,
  ArrowUpRight,
  Flame
} from 'lucide-react';
import UserAPI from '../../../../services/UserAPI';

const Bestsellers = () => {
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState('all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper for image URL resolution
  const getImageSrc = (imgPath) => {
    if (!imgPath) {
      return 'https://images.unsplash.com/photo-1583947581924-860bda6a26df?q=80&w=600&auto=format&fit=crop';
    }
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
      return imgPath;
    }
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
    const cleanBase = baseUrl.replace(/\/+$/, '');
    const cleanPath = imgPath.startsWith('/') ? imgPath : `/${imgPath}`;
    return `${cleanBase}${cleanPath}`;
  };

  // 1. Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await UserAPI.getUserCgmCategories();
        if (res && res.data && Array.isArray(res.data)) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error('Error fetching storefront categories:', err);
      }
    };

    fetchCategories();
  }, []);

  // 2. Fetch Bestsellers Products based on active category
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = {
          isPopular: true,
          limit: 8,
        };

        if (activeCategoryId && activeCategoryId !== 'all') {
          params.categoryId = activeCategoryId;
        }

        const res = await UserAPI.getUserCgmProductsCatalog(params);
        if (res && res.data && Array.isArray(res.data)) {
          setProducts(res.data);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error('Error fetching bestseller products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeCategoryId]);

  const handleProductClick = (id) => {
    if (id) {
      router.push(`/shop/cgmdevices/devicedetail/${id}`);
    }
  };

  return (
    <section className="py-16 sm:py-24 relative overflow-hidden antialiased bg-gradient-to-b from-[#F3F7FD] via-slate-50/50 to-white">
      {/* Background Decorative Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-100/40 via-blue-50/20 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 text-[#3d3f96] font-extrabold text-[11px] sm:text-xs tracking-widest uppercase bg-indigo-50 border border-indigo-100/80 px-3.5 py-1.5 rounded-full mb-3 shadow-xs">
            <Flame size={14} className="text-amber-500 fill-amber-500 animate-pulse" />
            Top Rated & Clinically Tested Devices
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Our <span className="text-[#3d3f96] bg-gradient-to-r from-[#3d3f96] to-indigo-600 bg-clip-text text-transparent">Bestsellers</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-500 font-medium">
            India&apos;s most trusted Continuous Glucose Monitors, Smart Glucometers, and diabetes care essentials.
          </p>

          {/* Category Tabs Filter */}
          <div className="flex justify-center items-center gap-2 sm:gap-3 mt-8 overflow-x-auto no-scrollbar pb-2 px-2">
            <button
              onClick={() => setActiveCategoryId('all')}
              className={`relative px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer whitespace-nowrap ${
                activeCategoryId === 'all'
                  ? 'bg-[#3d3f96] text-white shadow-md shadow-indigo-900/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100/80 border border-slate-200/80 hover:text-slate-900'
              }`}
            >
              All Bestsellers
            </button>

            {categories.map((cat) => {
              const isActive = activeCategoryId === cat._id;
              return (
                <button
                  key={cat._id}
                  onClick={() => setActiveCategoryId(cat._id)}
                  className={`relative px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#3d3f96] text-white shadow-md shadow-indigo-900/20'
                      : 'bg-white text-slate-600 hover:bg-slate-100/80 border border-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Catalog Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
            <Loader2 className="animate-spin text-[#3d3f96]" size={40} />
            <p className="text-xs sm:text-sm font-bold tracking-wide">Fetching bestsellers & live offers...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 shadow-xs max-w-md mx-auto p-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#3d3f96] flex items-center justify-center mx-auto mb-3">
              <Sparkles size={22} />
            </div>
            <h4 className="text-base font-bold text-slate-800">No Bestsellers In This Category</h4>
            <p className="text-xs text-slate-400 mt-1 font-medium">Please select another category or view all devices.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-7">
            <AnimatePresence mode="popLayout">
              {products.map((product) => {
                const discountPercent =
                  product.mrp && product.sellingPrice
                    ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
                    : 0;

                const categoryTitle =
                  typeof product.categoryId === 'object' && product.categoryId?.name
                    ? product.categoryId.name
                    : product.productType || 'Health Device';

                return (
                  <motion.div
                    key={product._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => handleProductClick(product._id)}
                    className="group bg-white rounded-3xl border border-slate-200/70 shadow-xs hover:shadow-xl hover:shadow-indigo-950/10 hover:border-indigo-200/80 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer relative"
                  >
                    {/* Top Media & Image Box */}
                    <div className="relative h-52 sm:h-56 bg-gradient-to-b from-slate-50/80 to-slate-100/40 p-4 flex items-center justify-center overflow-hidden">
                      <img
                        src={getImageSrc(product.mainImage)}
                        alt={product.title}
                        className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-500 ease-out"
                        onError={(e) => {
                          e.currentTarget.src =
                            'https://images.unsplash.com/photo-1583947581924-860bda6a26df?q=80&w=600&auto=format&fit=crop';
                        }}
                      />

                      {/* Top Left: Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                        {product.badge && (
                          <span className="inline-flex items-center gap-1 bg-[#3d3f96] text-white text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow-sm">
                            <Sparkles size={10} className="text-amber-300" />
                            {product.badge}
                          </span>
                        )}

                        {discountPercent > 0 && (
                          <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                            {discountPercent}% OFF
                          </span>
                        )}
                      </div>

                      {/* Top Right: Rating & Users Pill */}
                      <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                        <div className="bg-white/95 backdrop-blur-md px-2 py-1 rounded-xl flex items-center gap-1 shadow-xs border border-slate-100">
                          <Star size={11} className="text-amber-400 fill-amber-400" />
                          <span className="text-[10px] font-black text-slate-800">
                            {product.averageRating ? product.averageRating.toFixed(1) : '4.8'}
                          </span>
                        </div>

                        {product.totalUsersCountDisplay && (
                          <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <Users size={9} className="text-indigo-300" />
                            {product.totalUsersCountDisplay}
                          </span>
                        )}
                      </div>

                      {/* Bottom Image Spec Pill: Compatibility / Connector */}
                      {(product.compatibility || product.connectorType) && (
                        <div className="absolute bottom-2.5 left-3 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-lg border border-slate-200/60 text-[10px] font-bold text-slate-600 flex items-center gap-1 shadow-2xs">
                          <Smartphone size={10} className="text-[#3d3f96]" />
                          <span>
                            {[product.connectorType, product.compatibility].filter(Boolean).join(' • ')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Content & Details */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        {/* Category & Brand info */}
                        <div className="flex items-center justify-between text-[10px] uppercase font-extrabold tracking-wider text-slate-400 mb-1">
                          <span>{product.brand || 'DiabetesWala'}</span>
                          <span className="text-[#3d3f96] font-black">{categoryTitle}</span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 line-clamp-2 leading-snug group-hover:text-[#3d3f96] transition-colors min-h-[2.5rem]">
                          {product.title}
                        </h3>

                        {/* Tagline / Subtitle */}
                        {product.tagline && (
                          <p className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-1 flex items-center gap-1">
                            <ShieldCheck size={12} className="text-emerald-500 shrink-0" />
                            <span>{product.tagline}</span>
                          </p>
                        )}
                      </div>

                      {/* Pricing Block */}
                      <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
                                ₹{product.sellingPrice?.toLocaleString('en-IN')}
                              </span>
                              {product.mrp && product.mrp > product.sellingPrice && (
                                <span className="text-[11px] sm:text-xs text-slate-400 line-through font-semibold">
                                  ₹{product.mrp?.toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>

                            {/* Savings Callout */}
                            {product.savingsAmount ? (
                              <span className="text-[10px] font-bold text-emerald-600 block mt-0.5">
                                Save ₹{product.savingsAmount.toLocaleString('en-IN')}
                              </span>
                            ) : null}
                          </div>

                          {/* Action Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProductClick(product._id);
                            }}
                            className="bg-[#3d3f96] hover:bg-slate-900 text-white px-3 py-2 rounded-xl text-xs font-black transition-all shadow-md shadow-indigo-100 active:scale-95 flex items-center gap-1 group/btn cursor-pointer"
                            aria-label={`View ${product.title}`}
                          >
                            <span>Buy</span>
                            <ArrowUpRight size={13} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                          </button>
                        </div>

                        {/* Prepaid Discount Banner */}
                        {product.prepaidDiscountPrice && product.prepaidDiscountPrice < product.sellingPrice && (
                          <div className="bg-emerald-50/90 border border-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <Zap size={10} className="text-emerald-600 fill-emerald-600" />
                              Prepaid Deal:
                            </span>
                            <span className="font-extrabold text-emerald-900">
                              ₹{product.prepaidDiscountPrice.toLocaleString('en-IN')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* View All CTA Footer */}
        <div className="mt-12 sm:mt-16 text-center">
          <button
            onClick={() => router.push('/shop')}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/80 px-7 py-3.5 rounded-2xl font-black text-xs sm:text-sm tracking-wider uppercase shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <span>Explore All Diabetes Devices</span>
            <ChevronRight size={16} className="text-[#3d3f96] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </section>
  );
};

export default Bestsellers;