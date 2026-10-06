'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Plus, ChevronRight, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import UserAPI from '../../../../services/UserAPI';

const Bestsellers = () => {
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState('all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper for image source
  const getImageSrc = (imgPath) => {
    if (!imgPath) {
      return 'https://images.unsplash.com/photo-1583947581924-860bda6a26df?q=80&w=400&auto=format&fit=crop';
    }
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
      return imgPath;
    }
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
    return `${baseUrl}${imgPath}`;
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

  // 2. Fetch Bestseller Products based on active category
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = {
          isPopular: true,
          limit: 8
        };

        if (activeCategoryId && activeCategoryId !== 'all') {
          params.categoryId = activeCategoryId;
        }

        const res = await UserAPI.getUserCgmProductsCatalog(params);
        if (res && res.data) {
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
    <section className="py-16 sm:py-20 relative overflow-hidden antialiased">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#EBF2FC] via-white to-white -z-10" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 text-[#3d3f96] font-bold text-xs tracking-widest uppercase bg-indigo-50/80 border border-indigo-100 px-3 py-1 rounded-full mb-3">
            <Sparkles size={14} className="text-[#3d3f96]" /> Top Rated & Doctor Approved
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#3d3f96] mb-6 tracking-tight">
            Bestsellers
          </h2>

          {/* Dynamic Filter Tabs */}
          <div className="flex justify-center items-center gap-4 sm:gap-10 border-b border-slate-200/70 pb-3 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveCategoryId('all')}
              className={`relative pb-2 text-sm sm:text-lg font-bold whitespace-nowrap transition-all duration-300 cursor-pointer ${
                activeCategoryId === 'all' ? 'text-[#3d3f96]' : 'text-slate-400 hover:text-[#3d3f96]'
              }`}
            >
              All Bestsellers
              {activeCategoryId === 'all' && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute -bottom-[13px] left-0 right-0 h-[3px] bg-[#3d3f96] rounded-full"
                />
              )}
            </button>

            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setActiveCategoryId(cat._id)}
                className={`relative pb-2 text-sm sm:text-lg font-bold whitespace-nowrap transition-all duration-300 cursor-pointer ${
                  activeCategoryId === cat._id ? 'text-[#3d3f96]' : 'text-slate-400 hover:text-[#3d3f96]'
                }`}
              >
                {cat.name}
                {activeCategoryId === cat._id && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute -bottom-[13px] left-0 right-0 h-[3px] bg-[#3d3f96] rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid / Loading / Empty */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
            <Loader2 className="animate-spin text-[#3d3f96]" size={36} />
            <p className="text-sm font-semibold">Loading top devices & supplements...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-lg mx-auto p-6">
            <p className="text-slate-600 font-semibold text-sm sm:text-base">No bestsellers found in this category right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6 lg:gap-8">
            <AnimatePresence mode="popLayout">
              {products.map((product) => {
                const discountPercent = product.mrp && product.sellingPrice
                  ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
                  : 0;

                return (
                  <motion.div
                    key={product._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => handleProductClick(product._id)}
                    className="group bg-white rounded-2xl sm:rounded-[2rem] border border-slate-100/90 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-500 flex flex-col overflow-hidden cursor-pointer relative"
                  >
                    {/* Image Area */}
                    <div className="relative h-36 sm:h-56 lg:h-60 bg-slate-50 overflow-hidden flex items-center justify-center p-3">
                      <img
                        src={getImageSrc(product.mainImage)}
                        alt={product.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 ease-out"
                        onError={(e) => {
                          e.currentTarget.src =
                            'https://images.unsplash.com/photo-1583947581924-860bda6a26df?q=80&w=400&auto=format&fit=crop';
                        }}
                      />

                      {/* Badge / Tag */}
                      {product.badge && (
                        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-[#3d3f96] text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2.5 py-0.5 rounded-full shadow-sm">
                          {product.badge}
                        </div>
                      )}

                      {/* Rating pill */}
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white/90 backdrop-blur-xs px-1.5 sm:px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-xs border border-slate-100">
                        <Star size={10} className="text-amber-400 fill-amber-400" />
                        <span className="text-[9px] sm:text-[10px] font-bold text-slate-700">
                          {product.averageRating || 4.8}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          <span>{product.brand || 'DiabetesWala'}</span>
                          {product.compatibility && (
                            <>
                              <span>•</span>
                              <span className="truncate">{product.compatibility}</span>
                            </>
                          )}
                        </div>

                        <h3 className="text-xs sm:text-sm lg:text-base font-extrabold text-slate-800 line-clamp-2 leading-snug group-hover:text-[#3d3f96] transition-colors">
                          {product.title}
                        </h3>
                      </div>

                      {/* Pricing & CTA */}
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-1">
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-sm sm:text-lg font-black text-slate-900">
                              ₹{product.sellingPrice?.toLocaleString('en-IN')}
                            </span>
                            {product.mrp && product.mrp > product.sellingPrice && (
                              <span className="text-[10px] sm:text-xs text-slate-400 line-through font-medium">
                                ₹{product.mrp?.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                          {discountPercent > 0 && (
                            <p className="text-[9px] sm:text-[10px] font-bold text-emerald-600">
                              {discountPercent}% OFF
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductClick(product._id);
                          }}
                          className="bg-[#3d3f96] hover:bg-slate-900 text-white p-2 sm:p-2.5 rounded-xl transition-all shadow-md shadow-indigo-100 active:scale-95 cursor-pointer"
                          aria-label="View Product"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* View All Footer */}
        <div className="mt-12 sm:mt-16 text-center">
          <button
            onClick={() => router.push('/shop')}
            className="inline-flex items-center gap-2 text-slate-500 font-bold text-xs sm:text-sm hover:text-[#3d3f96] transition-colors uppercase tracking-[0.2em] cursor-pointer"
          >
            Explore All Products <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Bestsellers;