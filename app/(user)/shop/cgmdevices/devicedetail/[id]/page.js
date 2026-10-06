'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Star,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Truck,
  RotateCcw,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Loader2,
  Share2,
  Package,
  Sparkles,
  Smartphone,
  Activity,
  Award,
  Timer,
  Droplet,
  BatteryCharging,
  Layers,
  HeartPulse,
  BadgeCheck,
  HelpCircle,
  Plus,
  Minus,
  ShoppingBag,
  CreditCard,
  Lock,
  Check,
  Radio,
  UserCheck,
  Waves,
  Clock
} from 'lucide-react';
import UserAPI from '../../../../../services/UserAPI';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  // Helper for safe image URL formatting
  const getImageSrc = (imgPath) => {
    if (!imgPath) {
      return 'https://images.unsplash.com/photo-1583947581924-860bda6a26df?q=80&w=800&auto=format&fit=crop';
    }
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
      return imgPath;
    }
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
    return `${baseUrl}${imgPath}`;
  };

  // Fetch product by ID
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      try {
        setLoading(true);
        const res = await UserAPI.getUserCgmProductDetailsById(productId);
        if (res && res.data) {
          const item = res.data;
          setProduct(item);
          setSelectedImage(item.mainImage || (item.images && item.images[0]) || '');

          // Normalize variants from CGM Packs OR Glucometer Strip Variants OR generic variants
          let availableVariants = [];

          if (item.cgmConfig?.cgmPacks && item.cgmConfig.cgmPacks.length > 0) {
            availableVariants = item.cgmConfig.cgmPacks.map((p) => ({
              ...p,
              displayName: p.packName || `${p.sensorsCount} Sensor${p.sensorsCount > 1 ? 's' : ''}`,
              type: 'cgm'
            }));
          } else if (item.glucometerConfig?.stripLancetVariants && item.glucometerConfig.stripLancetVariants.length > 0) {
            availableVariants = item.glucometerConfig.stripLancetVariants.map((v) => ({
              ...v,
              displayName: v.variantName,
              type: 'glucometer'
            }));
          } else if (item.variants && item.variants.length > 0) {
            availableVariants = item.variants.map((v) => ({
              ...v,
              displayName: v.variantName || 'Standard',
              type: 'generic'
            }));
          }

          if (availableVariants.length > 0) {
            const defaultVar = availableVariants.find((v) => v.isDefault) || availableVariants[0];
            setSelectedVariant(defaultVar);
          }
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Handle Share link
  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Extract combined variant list
  const activeVariants = useMemo(() => {
    if (!product) return [];
    if (product.cgmConfig?.cgmPacks && product.cgmConfig.cgmPacks.length > 0) {
      return product.cgmConfig.cgmPacks.map((p) => ({
        ...p,
        displayName: p.packName || `Pack of ${p.sensorsCount}`,
        type: 'cgm'
      }));
    }
    if (product.glucometerConfig?.stripLancetVariants && product.glucometerConfig.stripLancetVariants.length > 0) {
      return product.glucometerConfig.stripLancetVariants.map((v) => ({
        ...v,
        displayName: v.variantName,
        type: 'glucometer'
      }));
    }
    if (product.variants && product.variants.length > 0) {
      return product.variants.map((v) => ({
        ...v,
        displayName: v.variantName || 'Standard',
        type: 'generic'
      }));
    }
    return [];
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-[#3d3f96]" size={42} />
        <p className="text-sm font-semibold text-slate-500 tracking-wide">
          Loading device specifications & configurations...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-4 shadow-sm">
          <Activity size={32} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Product Not Found</h2>
        <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
          The requested device or supplement might be out of stock or currently unavailable.
        </p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2.5 bg-[#3d3f96] text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-slate-900 transition-all cursor-pointer"
        >
          Return to Store
        </button>
      </div>
    );
  }

  // Determine Product Category Type
  const isCgmProduct =
    product.productType === 'CGM' ||
    product.categoryId?.name?.toLowerCase().includes('cgm') ||
    (product.cgmConfig?.cgmPacks && product.cgmConfig.cgmPacks.length > 0);

  // Pricing Calculation based on selected variant and quantity
  const unitSellingPrice = selectedVariant?.sellingPrice ?? product.sellingPrice;
  const unitMrp = selectedVariant?.mrp ?? product.mrp;
  const totalSellingPrice = unitSellingPrice * quantity;
  const totalMrp = unitMrp ? unitMrp * quantity : null;
  const totalSavings = selectedVariant?.savingsAmount
    ? selectedVariant.savingsAmount * quantity
    : totalMrp && totalSellingPrice
    ? totalMrp - totalSellingPrice
    : 0;

  const discountPercent =
    unitMrp && unitSellingPrice
      ? Math.round(((unitMrp - unitSellingPrice) / unitMrp) * 100)
      : 0;

  // Key configurations
  const glucoSpecs = product.glucometerConfig?.specifications;
  const cgmConfig = product.cgmConfig;
  const compatibility =
    selectedVariant?.compatibility || product.glucometerConfig?.compatibility || product.compatibility;
  const connectorType = product.glucometerConfig?.connectorType || product.connectorType;

  // Build list of unique images
  const allImages = [product.mainImage, ...(product.images || [])].filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-28 text-slate-800 antialiased selection:bg-[#3d3f96] selection:text-white">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none -z-10" />

      {/* Top Header Bar */}
      {/* <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-[#3d3f96] transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-indigo-50 flex items-center justify-center transition-colors">
              <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span>Back to Store</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#3d3f96] bg-indigo-50/90 border border-indigo-100 px-3 py-1 rounded-full">
              <Sparkles size={13} /> {product.categoryId?.name || product.productType}
            </span>

            <button
              onClick={handleShare}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all cursor-pointer relative"
              title="Share Product"
            >
              {isCopied ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
              {isCopied && (
                <span className="absolute -bottom-8 right-0 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md whitespace-nowrap">
                  Link Copied!
                </span>
              )}
            </button>
          </div>
        </div>
      </header> */}

      {/* Main Product Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ================= LEFT COLUMN: STICKY GALLERY & TRUST BADGES (5 COLS) ================= */}
          <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-4">
            
            {/* Main Stage Display Card */}
            <div className="relative bg-white rounded-3xl border border-slate-200/80 p-8 flex items-center justify-center h-80 sm:h-96 md:h-[420px] shadow-sm overflow-hidden group">
              <img
                src={getImageSrc(selectedImage)}
                alt={product.title}
                className="max-h-full max-w-full object-contain transition-transform duration-700 ease-out group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1583947581924-860bda6a26df?q=80&w=800&auto=format&fit=crop';
                }}
              />

              {/* Badges Overlay */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
                {product.badge && (
                  <span className="bg-[#3d3f96] text-white text-[10px] sm:text-xs font-black tracking-wide px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                    <Sparkles size={11} /> {product.badge}
                  </span>
                )}
                {isCgmProduct && (
                  <span className="bg-emerald-600 text-white text-[10px] font-black tracking-wide px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                    <Radio size={10} /> 24x7 Realtime Glucose
                  </span>
                )}
              </div>

              {/* Stock Status Pill */}
              <div className="absolute bottom-4 left-4">
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  In Stock ({selectedVariant?.stockQuantity || product.stockQuantity || 50} units)
                </span>
              </div>
            </div>

            {/* Thumbnail Navigation */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border p-1.5 shrink-0 transition-all cursor-pointer ${
                      selectedImage === img
                        ? 'border-[#3d3f96] ring-2 ring-[#3d3f96]/20 shadow-sm'
                        : 'border-slate-200/80 hover:border-slate-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={getImageSrc(img)}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Trust Assurances Card */}
            <div className="grid grid-cols-3 gap-2 bg-white rounded-2xl p-4 border border-slate-200/80 text-center shadow-xs">
              <div className="flex flex-col items-center gap-1 p-1">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#3d3f96] flex items-center justify-center">
                  <ShieldCheck size={18} />
                </div>
                <span className="text-[11px] font-bold text-slate-900 mt-1">
                  {glucoSpecs?.warranty || 'ISO Certified'}
                </span>
                <span className="text-[9px] text-slate-400">100% Genuine</span>
              </div>

              <div className="flex flex-col items-center gap-1 p-1 border-x border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Truck size={18} />
                </div>
                <span className="text-[11px] font-bold text-slate-900 mt-1">Free Express</span>
                <span className="text-[9px] text-slate-400">Dispatch in 24 hrs</span>
              </div>

              <div className="flex flex-col items-center gap-1 p-1">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Award size={18} />
                </div>
                <span className="text-[11px] font-bold text-slate-900 mt-1">CDSCO Approved</span>
                <span className="text-[9px] text-slate-400">Lab Precision</span>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: PRODUCT INFO & PURCHASE CARD (7 COLS) ================= */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Title & Ratings Block */}
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#3d3f96] bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                  {product.brand || 'DiabetesWala'}
                </span>
                {product.deviceModel && (
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                    Series: {product.deviceModel}
                  </span>
                )}
                {isCgmProduct && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                    No Finger Pricks
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {product.title}
              </h1>

              {product.tagline && (
                <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                  {product.tagline}
                </p>
              )}

              {/* Rating & Social Proof */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl text-amber-800 text-xs font-black shadow-xs">
                  <Star size={13} className="fill-amber-400 text-amber-400" />
                  <span>{product.averageRating || 4.8}</span>
                  <span className="text-slate-400 font-normal">({product.totalReviews || 0} reviews)</span>
                </div>

                {product.totalUsersCountDisplay && (
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-xl">
                    <BadgeCheck size={14} className="text-[#3d3f96]" /> {product.totalUsersCountDisplay}
                  </span>
                )}
              </div>
            </div>

            {/* ================= HERO PRICING & INLINE ACTION CARD ================= */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-6">
              
              {/* Pricing breakdown */}
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    ₹{totalSellingPrice.toLocaleString('en-IN')}
                  </span>
                  {totalMrp && totalMrp > totalSellingPrice && (
                    <span className="text-base sm:text-lg text-slate-400 line-through font-semibold">
                      ₹{totalMrp.toLocaleString('en-IN')}
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <span className="bg-emerald-500 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-sm">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>

                {totalSavings > 0 && (
                  <p className="text-xs font-bold text-emerald-600 mt-1 flex items-center gap-1">
                    <CheckCircle2 size={13} /> You save ₹{totalSavings.toLocaleString('en-IN')} on this order
                  </p>
                )}
              </div>

              {/* Free Health Coach Callout (If CGM coach support is active) */}
              {cgmConfig?.isCoachSupportIncluded && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50/50 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <UserCheck size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>Free Diabetes Coach Consultation Included</span>
                        <span className="bg-emerald-200/80 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-md uppercase">
                          FREE
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {cgmConfig.coachSupportDuration || '1 Month Personalized Diet & Glucose Coaching'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Variant Selector (Supports CGM Packs AND Glucometer Strip Variants) */}
              {activeVariants.length > 0 && (
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                    <span>
                      {isCgmProduct ? 'Select Sensor Pack Option' : 'Select Pack / Configuration'}
                    </span>
                    {selectedVariant && (
                      <span className="text-[#3d3f96] font-extrabold">{selectedVariant.displayName}</span>
                    )}
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeVariants.map((v) => {
                      const isSelected = selectedVariant?._id === v._id;
                      return (
                        <button
                          key={v._id}
                          type="button"
                          onClick={() => setSelectedVariant(v)}
                          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                            isSelected
                              ? 'border-[#3d3f96] bg-indigo-50/40 ring-2 ring-[#3d3f96]/20 shadow-xs'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-900">{v.displayName}</span>
                            {isSelected && <CheckCircle2 size={16} className="text-[#3d3f96]" />}
                          </div>
                          
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-sm font-black text-slate-900">₹{v.sellingPrice?.toLocaleString('en-IN')}</span>
                              {v.mrp && (
                                <span className="text-slate-400 line-through text-[11px]">
                                  ₹{v.mrp?.toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>
                            
                            {/* Sensors count / Strips count pill */}
                            {v.sensorsCount ? (
                              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                                {v.sensorsCount} Sensor{v.sensorsCount > 1 ? 's' : ''} ({v.sensorsCount * (cgmConfig?.sensorLifeSpanDays || 15)} Days)
                              </span>
                            ) : v.stripsCount ? (
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                {v.stripsCount} Strips
                              </span>
                            ) : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Stepper & Inline Actions */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Quantity
                  </span>
                  
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      disabled={quantity <= 1}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center text-sm font-bold text-slate-900">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => Math.min(10, prev + 1))}
                      disabled={quantity >= 10}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Primary Action Buttons (Desktop Inline) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      alert(`Added ${quantity}x ${product.title} (${selectedVariant?.displayName || 'Standard'}) to cart!`)
                    }
                    className="w-full bg-indigo-50/80 hover:bg-indigo-100 text-[#3d3f96] border border-indigo-200 py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                  >
                    <ShoppingBag size={18} />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      alert(`Proceeding to checkout with ${quantity}x ${product.title} (${selectedVariant?.displayName || 'Standard'})`)
                    }
                    className="w-full bg-[#3d3f96] hover:bg-slate-900 text-white py-3.5 rounded-2xl font-extrabold text-sm shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                  >
                    <CreditCard size={18} />
                    <span>Buy Now • ₹{totalSellingPrice.toLocaleString('en-IN')}</span>
                  </button>
                </div>

                {/* Security Guarantee Note */}
                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-1">
                  <Lock size={12} />
                  <span>256-Bit Encrypted Secure Checkout • Instant Order Confirmation</span>
                </div>
              </div>
            </div>

            {/* CGM SPECIFICATIONS CARD (Featured when product is CGM) */}
            {isCgmProduct && cgmConfig && (
              <div className="bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/40 rounded-3xl p-6 border border-indigo-100 shadow-xs space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#3d3f96] flex items-center gap-2">
                  <HeartPulse size={16} /> Continuous Glucose Monitoring Features
                </h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white p-3.5 rounded-2xl border border-indigo-100/70 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-indigo-700 font-bold mb-1">
                      <Clock size={14} />
                      <span className="text-[10px] uppercase tracking-wider text-slate-400">Sensor Life</span>
                    </div>
                    <strong className="text-slate-900 text-sm font-extrabold block">
                      {cgmConfig.sensorLifeSpanDays || 15} Days
                    </strong>
                    <span className="text-[10px] text-slate-500">Per Sensor</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-indigo-100/70 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-indigo-700 font-bold mb-1">
                      <Timer size={14} />
                      <span className="text-[10px] uppercase tracking-wider text-slate-400">Warmup</span>
                    </div>
                    <strong className="text-slate-900 text-sm font-extrabold block">
                      {cgmConfig.sensorWarmupTime || '60 mins'}
                    </strong>
                    <span className="text-[10px] text-slate-500">Quick Start</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-indigo-100/70 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-indigo-700 font-bold mb-1">
                      <Waves size={14} />
                      <span className="text-[10px] uppercase tracking-wider text-slate-400">Waterproof</span>
                    </div>
                    <strong className="text-slate-900 text-sm font-extrabold block">
                      {cgmConfig.waterResistance || 'IP28'}
                    </strong>
                    <span className="text-[10px] text-slate-500">Shower & Workout</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-indigo-100/70 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-indigo-700 font-bold mb-1">
                      <Smartphone size={14} />
                      <span className="text-[10px] uppercase tracking-wider text-slate-400">App Sync</span>
                    </div>
                    <strong className="text-slate-900 text-sm font-extrabold block">
                      {cgmConfig.appSyncSupported ? 'Realtime' : 'Manual'}
                    </strong>
                    <span className="text-[10px] text-slate-500">Bluetooth Sync</span>
                  </div>
                </div>
              </div>
            )}

            {/* GLUCOMETER TECHNICAL SPECIFICATIONS (If Glucometer / Non-CGM) */}
            {!isCgmProduct && glucoSpecs && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Layers size={15} className="text-[#3d3f96]" /> Technical & Clinical Specifications
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  {glucoSpecs.bloodSampleSize && (
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Blood Sample</span>
                      <strong className="text-slate-800 flex items-center gap-1 mt-1 font-extrabold">
                        <Droplet size={13} className="text-rose-500" /> {glucoSpecs.bloodSampleSize}
                      </strong>
                    </div>
                  )}
                  {glucoSpecs.testDurationSeconds && (
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Testing Speed</span>
                      <strong className="text-slate-800 flex items-center gap-1 mt-1 font-extrabold">
                        <Timer size={13} className="text-emerald-500" /> {glucoSpecs.testDurationSeconds} Seconds
                      </strong>
                    </div>
                  )}
                  {glucoSpecs.measuringRange && (
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Measuring Range</span>
                      <strong className="text-slate-800 block mt-1 font-extrabold">{glucoSpecs.measuringRange}</strong>
                    </div>
                  )}
                  {glucoSpecs.coefficientOfVariation && (
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Precision / CV</span>
                      <strong className="text-slate-800 block mt-1 font-extrabold">{glucoSpecs.coefficientOfVariation}</strong>
                    </div>
                  )}
                  {glucoSpecs.accuracyTesting && (
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Accuracy Grade</span>
                      <strong className="text-slate-800 block mt-1 font-extrabold truncate">{glucoSpecs.accuracyTesting}</strong>
                    </div>
                  )}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Power Source</span>
                    <strong className="text-slate-800 flex items-center gap-1 mt-1 font-extrabold">
                      <BatteryCharging size={13} className="text-amber-500" />
                      {glucoSpecs.batteryRequired ? 'Battery Operated' : 'Phone Powered'}
                    </strong>
                  </div>
                </div>

                {glucoSpecs.certifications && glucoSpecs.certifications.length > 0 && (
                  <div className="pt-3 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-2.5">
                      Clinical Certifications & Clearances
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {glucoSpecs.certifications.map((cert, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-xl"
                        >
                          <CheckCircle2 size={13} className="text-emerald-600" /> {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Key Highlights Grid */}
            {product.highlights && product.highlights.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Key Device Highlights
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {product.highlights.map((h, i) => (
                    <div key={h._id || i} className="flex items-start gap-3 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                      <div className="w-8 h-8 rounded-xl bg-indigo-100/70 text-[#3d3f96] flex items-center justify-center shrink-0 font-bold text-xs">
                        0{i + 1}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{h.title}</h4>
                        <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{h.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Box Contents */}
            {product.boxContents && product.boxContents.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Package size={15} /> Included in Starter Box
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.boxContents.map((item, i) => (
                    <span key={i} className="text-xs font-bold bg-slate-100 text-slate-800 px-3.5 py-1.5 rounded-xl">
                      ✓ {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description Card */}
            {product.description && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-2.5">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Product Overview
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* FAQs Accordion */}
            {product.faqs && product.faqs.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <HelpCircle size={15} /> Frequently Asked Questions
                </h3>
                <div className="space-y-2.5">
                  {product.faqs.map((faq, index) => {
                    const isOpen = openFaqIndex === index;
                    return (
                      <div key={faq._id || index} className="border border-slate-100 rounded-2xl overflow-hidden transition-all">
                        <button
                          type="button"
                          onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                          className="w-full flex items-center justify-between p-4 text-left text-xs sm:text-sm font-bold text-slate-800 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <span>{faq.question}</span>
                          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        {isOpen && (
                          <div className="p-4 text-xs sm:text-sm text-slate-600 bg-white border-t border-slate-100 leading-relaxed">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ================= ULTRA-COMPACT FLOATING ACTION BAR FOR MOBILE ================= */}
      <aside className="lg:hidden fixed bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3 z-40 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col pl-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Price</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-slate-900">
                ₹{totalSellingPrice.toLocaleString('en-IN')}
              </span>
              {totalMrp && totalMrp > totalSellingPrice && (
                <span className="text-[11px] text-slate-400 line-through">
                  ₹{totalMrp.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                alert(`Added ${quantity}x ${product.title} to cart!`)
              }
              className="p-2.5 rounded-xl border border-indigo-200 text-[#3d3f96] bg-indigo-50/80 font-bold active:scale-95 transition-all cursor-pointer"
              aria-label="Add to cart"
            >
              <ShoppingBag size={18} />
            </button>

            <button
              type="button"
              onClick={() =>
                alert(`Proceeding to checkout with ${quantity}x ${product.title}`)
              }
              className="px-5 py-2.5 bg-[#3d3f96] hover:bg-slate-900 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-200 active:scale-95 transition-all cursor-pointer"
            >
              Buy Now
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}