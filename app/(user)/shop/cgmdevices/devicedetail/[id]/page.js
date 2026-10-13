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
  CreditCard,
  Lock,
  Check,
  Radio,
  UserCheck,
  Waves,
  Clock,
  ArrowRight,
  FileText,
  Video,
  Download,
  Usb,
  Cpu,
  AlertCircle,
  Info
} from 'lucide-react';
import UserAPI from '../../../../../services/UserAPI';
import { useNotification } from '../../../../../context/NotificationContext';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

const STATIC_PRODUCT_FALLBACK_GALLERY = [
  'https://images.unsplash.com/photo-1583947581924-860bda6a26df?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?q=80&w=600&auto=format&fit=crop'
];

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id;
  const { showNotification } = useNotification?.() || {};

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  // Amazon-style Image Zoom state
  const [zoomState, setZoomState] = useState({
    isZoomed: false,
    x: 50,
    y: 50
  });

  // Helper for safe image URL formatting
  const getImageSrc = (imgPath) => {
    if (!imgPath) {
      return STATIC_PRODUCT_FALLBACK_GALLERY[0];
    }
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
      return imgPath;
    }
    return `${BASE_URL}${imgPath}`;
  };

  // Amazon-style Mouse Move Zoom Handler
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomState({ isZoomed: true, x, y });
  };

  const handleMouseLeave = () => {
    setZoomState({ isZoomed: false, x: 50, y: 50 });
  };

  // Fetch product details by ID
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      try {
        setLoading(true);
        setError(null);
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
        } else {
          throw new Error('Product details not found.');
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to retrieve product details');
        if (showNotification) {
          showNotification(err?.message || 'Unable to fetch product details.', 'error');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, showNotification]);

  // Handle Share link
  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      if (showNotification) {
        showNotification('Product link copied to clipboard!', 'success');
      }
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
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center gap-3 p-4">
        <Loader2 className="animate-spin text-[#3d3f96]" size={38} />
        <p className="text-xs sm:text-sm font-semibold text-slate-500 tracking-wide text-center">
          Loading device specifications & configurations...
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-4 shadow-sm">
          <Activity size={28} />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">Product Not Found</h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
          {error || 'The requested device or supplement might be out of stock or currently unavailable.'}
        </p>
        <button
          onClick={() => router.back()}
          className="px-5 py-2.5 bg-[#3d3f96] text-white rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-indigo-100 hover:bg-slate-900 transition-all cursor-pointer"
        >
          Return to Store
        </button>
      </div>
    );
  }

  // Determine Category Type
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

  // List of unique images
  const allImages = [product.mainImage, ...(product.images || [])].filter(Boolean);

  // Buy Now: Package all user choices and navigate to /shop/cgmdevices/buyproduct
  const handleBuyNow = () => {
    try {
      const checkoutPayload = {
        productId: product._id,
        productTitle: product.title,
        productBrand: product.brand || 'DiabetesWala',
        productType: product.productType || 'Device',
        categoryName: product.categoryId?.name || product.productType,
        mainImage: product.mainImage,
        badge: product.badge,
        selectedVariant: selectedVariant
          ? {
            _id: selectedVariant._id,
            displayName: selectedVariant.displayName,
            type: selectedVariant.type,
            sensorsCount: selectedVariant.sensorsCount,
            stripsCount: selectedVariant.stripsCount,
            lancetsCount: selectedVariant.lancetsCount,
            compatibility: selectedVariant.compatibility,
            mrp: selectedVariant.mrp,
            sellingPrice: selectedVariant.sellingPrice,
            savingsAmount: selectedVariant.savingsAmount
          }
          : null,
        quantity,
        unitSellingPrice,
        unitMrp,
        totalSellingPrice,
        totalMrp,
        totalSavings,
        compatibility,
        connectorType,
        cgmConfig: cgmConfig
          ? {
            sensorLifeSpanDays: cgmConfig.sensorLifeSpanDays,
            isCoachSupportIncluded: cgmConfig.isCoachSupportIncluded,
            coachSupportDuration: cgmConfig.coachSupportDuration
          }
          : null,
        timestamp: new Date().toISOString()
      };

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('cgm_checkout_item', JSON.stringify(checkoutPayload));
      }

      router.push(`/shop/cgmdevices/buyproduct?productId=${product._id}`);
    } catch (err) {
      console.error('Error initiating buy now flow:', err);
      if (showNotification) {
        showNotification('Unable to proceed to checkout. Please try again.', 'error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-28 text-slate-800 antialiased selection:bg-[#3d3f96] selection:text-white">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none -z-10" />

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">

          {/* ================= LEFT COLUMN: STICKY GALLERY & TRUST BADGES (5 COLS) ================= */}
          <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-3 sm:space-y-4">

            {/* Main Image Display Card with Amazon-Style Zoom */}
            <div
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 flex items-center justify-center h-72 sm:h-96 md:h-[420px] shadow-sm overflow-hidden select-none group cursor-crosshair"
            >
              <img
                src={getImageSrc(selectedImage)}
                alt={product.title}
                style={{
                  transformOrigin: `${zoomState.x}% ${zoomState.y}%`,
                  transform: zoomState.isZoomed ? 'scale(2.2)' : 'scale(1)',
                  transition: zoomState.isZoomed ? 'transform 0.08s ease-out' : 'transform 0.3s ease-out'
                }}
                className="max-h-full max-w-full object-contain pointer-events-none will-change-transform"
                onError={(e) => {
                  e.currentTarget.src = STATIC_PRODUCT_FALLBACK_GALLERY[0];
                }}
              />

              {/* Badges Overlay */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-col gap-1.5 items-start pointer-events-none z-10">
                {product.badge && (
                  <span className="bg-[#3d3f96] text-white text-[9px] sm:text-xs font-black tracking-wide px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-sm flex items-center gap-1">
                    <Sparkles size={10} /> {product.badge}
                  </span>
                )}
                {isCgmProduct && (
                  <span className="bg-emerald-600 text-white text-[9px] sm:text-[10px] font-black tracking-wide px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                    <Radio size={9} /> 24x7 Realtime Glucose
                  </span>
                )}
              </div>

              {/* Share Button Overlay */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="Share product"
                  className="p-2 bg-white/80 backdrop-blur-md hover:bg-white text-slate-600 hover:text-[#3d3f96] border border-slate-200/60 rounded-full shadow-xs transition-all cursor-pointer"
                >
                  <Share2 size={15} />
                </button>
              </div>

              {/* Stock Status Pill */}
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 pointer-events-none z-10">
                <span className="bg-emerald-50/95 backdrop-blur-xs text-emerald-700 border border-emerald-200/80 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  In Stock ({selectedVariant?.stockQuantity || product.stockQuantity || 50} units)
                </span>
              </div>
            </div>

            {/* Thumbnail Navigation */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 no-scrollbar">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-white border p-1.5 shrink-0 transition-all cursor-pointer ${selectedImage === img
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
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 text-center shadow-xs">
              <div className="flex flex-col items-center gap-0.5 p-1">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-50 text-[#3d3f96] flex items-center justify-center">
                  <ShieldCheck size={16} />
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-900 mt-1">
                  {glucoSpecs?.warranty || 'ISO Certified'}
                </span>
                <span className="text-[8px] sm:text-[9px] text-slate-400">100% Genuine</span>
              </div>

              <div className="flex flex-col items-center gap-0.5 p-1 border-x border-slate-100">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Truck size={16} />
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-900 mt-1">Free Express</span>
                <span className="text-[8px] sm:text-[9px] text-slate-400">Dispatch in 24h</span>
              </div>

              <div className="flex flex-col items-center gap-0.5 p-1">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Award size={16} />
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-900 mt-1">CDSCO Approved</span>
                <span className="text-[8px] sm:text-[9px] text-slate-400">Lab Precision</span>
              </div>
            </div>

            {/* User Manual Document Download (If Provided in Response) */}
            {product.userManualPdf && (
              <a
                href={getImageSrc(product.userManualPdf)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-white hover:bg-indigo-50/40 border border-indigo-150 p-3 sm:p-3.5 rounded-2xl flex items-center justify-between text-slate-700 hover:text-[#3d3f96] shadow-2xs transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#3d3f96] flex items-center justify-center">
                    <FileText size={16} />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] sm:text-xs font-bold text-slate-900">Official User Manual</p>
                    <p className="text-[9px] sm:text-[10px] text-slate-400">Download Device Guide (PDF)</p>
                  </div>
                </div>
                <Download size={15} className="text-slate-400 group-hover:text-[#3d3f96] transition-colors" />
              </a>
            )}

            {/* Demo Video Banner (If provided) */}
            {product.demoVideoUrl && (
              <a
                href={product.demoVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white p-3 rounded-2xl flex items-center justify-between shadow-xs transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white">
                    <Video size={14} />
                  </div>
                  <span className="text-xs font-bold">Watch Device Video Demonstration</span>
                </div>
                <ArrowRight size={14} />
              </a>
            )}
          </div>

          {/* ================= RIGHT COLUMN: DETAILS & BUY NOW CARD (7 COLS) ================= */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">

            {/* Title & Brand Header */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#3d3f96] bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                  {product.brand || 'DiabetesWala'}
                </span>
                {product.deviceModel && (
                  <span className="text-[10px] sm:text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                    Series: {product.deviceModel}
                  </span>
                )}
                {isCgmProduct && (
                  <span className="text-[10px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                    No Finger Pricks
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {product.title}
              </h1>

              {product.tagline && (
                <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                  {product.tagline}
                </p>
              )}

              {/* Rating & Social Proof */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1">
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-xl text-amber-800 text-[11px] sm:text-xs font-black shadow-2xs">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  <span>{product.averageRating || 4.8}</span>
                  <span className="text-slate-400 font-normal">({product.totalReviews || 0} reviews)</span>
                </div>

                {product.totalUsersCountDisplay && (
                  <span className="text-[11px] sm:text-xs font-bold text-slate-700 flex items-center gap-1.5 bg-slate-100 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-xl">
                    <BadgeCheck size={13} className="text-[#3d3f96]" /> {product.totalUsersCountDisplay}
                  </span>
                )}
              </div>
            </div>

            {/* ================= HIGH-VISIBILITY COMPATIBILITY & PHONE SUPPORT CALLOUT ================= */}
            {(compatibility || connectorType) && (
              <div className="relative overflow-hidden bg-gradient-to-r from-amber-500/10 via-amber-50/70 to-indigo-50/50 border-2 border-amber-400/80 rounded-3xl p-4 sm:p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
                      <Smartphone size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md">
                          Important Compatibility Check
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5">
                        {compatibility && (
                          <div className="flex items-center gap-1.5 bg-white border border-amber-300 px-3 py-1 rounded-xl shadow-xs">
                            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase">OS Support:</span>
                            <span className="text-xs sm:text-sm font-black text-amber-950 flex items-center gap-1">
                              <CheckCircle2 size={14} className="text-emerald-600" />
                              {compatibility}
                            </span>
                          </div>
                        )}
                        {connectorType && (
                          <div className="flex items-center gap-1.5 bg-white border border-amber-300 px-3 py-1 rounded-xl shadow-xs">
                            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase">Port:</span>
                            <span className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1">
                              <Usb size={14} className="text-[#3d3f96]" />
                              {connectorType}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="self-end sm:self-center pl-1 sm:pl-0">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-lg">
                      <AlertCircle size={12} className="text-amber-600" /> Direct Plug & Play
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ================= HERO PRICING & BUY NOW ACTION CARD ================= */}
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-5 sm:space-y-6">

              {/* Pricing breakdown */}
              <div>
                <div className="flex items-baseline gap-2.5 sm:gap-3">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                    ₹{totalSellingPrice.toLocaleString('en-IN')}
                  </span>
                  {totalMrp && totalMrp > totalSellingPrice && (
                    <span className="text-sm sm:text-base md:text-lg text-slate-400 line-through font-semibold">
                      ₹{totalMrp.toLocaleString('en-IN')}
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <span className="bg-emerald-500 text-white font-black text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg shadow-sm">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>

                {totalSavings > 0 && (
                  <p className="text-[11px] sm:text-xs font-bold text-emerald-600 mt-1 flex items-center gap-1">
                    <CheckCircle2 size={13} /> You save ₹{totalSavings.toLocaleString('en-IN')} on this selection
                  </p>
                )}
              </div>

              {/* Variant Selector */}
              {activeVariants.length > 0 && (
                <div className="space-y-2.5">
                  <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                    <span>
                      {isCgmProduct ? 'Select Sensor Pack Option' : 'Select Pack / Configuration'}
                    </span>
                    {selectedVariant && (
                      <span className="text-[#3d3f96] font-extrabold">{selectedVariant.displayName}</span>
                    )}
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    {activeVariants.map((v) => {
                      const isSelected = selectedVariant?._id === v._id;
                      return (
                        <button
                          key={v._id}
                          type="button"
                          onClick={() => setSelectedVariant(v)}
                          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${isSelected
                              ? 'border-[#3d3f96] bg-indigo-50/40 ring-2 ring-[#3d3f96]/20 shadow-xs'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-slate-900">{v.displayName}</span>
                            <div className="flex items-center gap-1.5">
                              {v.savingsBadge && (
                                <span className="text-[9px] font-black uppercase text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                                  {v.savingsBadge}
                                </span>
                              )}
                              {isSelected && <CheckCircle2 size={15} className="text-[#3d3f96]" />}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-xs sm:text-sm font-black text-slate-900">₹{v.sellingPrice?.toLocaleString('en-IN')}</span>
                              {v.mrp && (
                                <span className="text-slate-400 line-through text-[10px] sm:text-[11px]">
                                  ₹{v.mrp?.toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>

                            {v.sensorsCount ? (
                              <span className="text-[9px] sm:text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                                {v.sensorsCount} Sensor{v.sensorsCount > 1 ? 's' : ''} ({v.sensorsCount * (cgmConfig?.sensorLifeSpanDays || 15)} Days)
                              </span>
                            ) : v.stripsCount ? (
                              <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
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

              {/* Quantity Stepper & Buy Now CTA */}
              <div className="space-y-3.5 pt-1">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                    Quantity
                  </span>

                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-0.5 sm:p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      disabled={quantity <= 1}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-8 sm:w-10 text-center text-xs sm:text-sm font-bold text-slate-900">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => Math.min(10, prev + 1))}
                      disabled={quantity >= 10}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>

                {/* ONLY BUY NOW ACTION BUTTON */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="w-full bg-[#3d3f96] hover:bg-slate-900 text-white py-3.5 sm:py-4 rounded-2xl font-black text-sm sm:text-base shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer group"
                  >
                    <CreditCard size={18} />
                    <span>Buy Now • ₹{totalSellingPrice.toLocaleString('en-IN')}</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform ml-1" />
                  </button>
                </div>

                {/* Security Guarantee Note */}
                <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400 pt-0.5">
                  <Lock size={11} />
                  <span>256-Bit Encrypted Secure Checkout • Instant Confirmation</span>
                </div>
              </div>
            </div>

            {/* CGM SPECIFICATIONS CARD (Featured when product is CGM) */}
            {isCgmProduct && cgmConfig && (
              <div className="bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/40 rounded-3xl p-5 sm:p-6 border border-indigo-100 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#3d3f96] flex items-center gap-2">
                    <HeartPulse size={15} /> Continuous Glucose Monitoring Features
                  </h3>
                  {cgmConfig.isCoachSupportIncluded && (
                    <span className="text-[10px] font-bold bg-indigo-100 text-[#3d3f96] px-2 py-0.5 rounded-full">
                      Free Care Program
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
                  <div className="bg-white p-3 rounded-2xl border border-indigo-100/70 shadow-2xs">
                    <div className="flex items-center gap-1 text-indigo-700 font-bold mb-1">
                      <Clock size={13} />
                      <span className="text-[9px] uppercase tracking-wider text-slate-400">Sensor Life</span>
                    </div>
                    <strong className="text-slate-900 text-xs sm:text-sm font-extrabold block">
                      {cgmConfig.sensorLifeSpanDays || 15} Days
                    </strong>
                    <span className="text-[9px] sm:text-[10px] text-slate-500">Continuous Wear</span>
                  </div>

                  <div className="bg-white p-3 rounded-2xl border border-indigo-100/70 shadow-2xs">
                    <div className="flex items-center gap-1 text-indigo-700 font-bold mb-1">
                      <Timer size={13} />
                      <span className="text-[9px] uppercase tracking-wider text-slate-400">Warmup</span>
                    </div>
                    <strong className="text-slate-900 text-xs sm:text-sm font-extrabold block">
                      {cgmConfig.sensorWarmupTime || '60 mins'}
                    </strong>
                    <span className="text-[9px] sm:text-[10px] text-slate-500">Quick Start</span>
                  </div>

                  <div className="bg-white p-3 rounded-2xl border border-indigo-100/70 shadow-2xs">
                    <div className="flex items-center gap-1 text-indigo-700 font-bold mb-1">
                      <Waves size={13} />
                      <span className="text-[9px] uppercase tracking-wider text-slate-400">Water Resistance</span>
                    </div>
                    <strong className="text-slate-900 text-xs sm:text-sm font-extrabold block">
                      {cgmConfig.waterResistance || 'IP28'}
                    </strong>
                    <span className="text-[9px] sm:text-[10px] text-slate-500">Shower & Exercise</span>
                  </div>

                  <div className="bg-white p-3 rounded-2xl border border-indigo-100/70 shadow-2xs">
                    <div className="flex items-center gap-1 text-indigo-700 font-bold mb-1">
                      <Smartphone size={13} />
                      <span className="text-[9px] uppercase tracking-wider text-slate-400">App Sync</span>
                    </div>
                    <strong className="text-slate-900 text-xs sm:text-sm font-extrabold block">
                      {cgmConfig.appSyncSupported ? 'Realtime Auto' : 'Manual Scan'}
                    </strong>
                    <span className="text-[9px] sm:text-[10px] text-slate-500">Bluetooth Cloud</span>
                  </div>
                </div>

                {/* Free Coaching banner if included in payload */}
                {cgmConfig.isCoachSupportIncluded && cgmConfig.coachSupportDuration && (
                  <div className="bg-white p-3 rounded-2xl border border-indigo-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <UserCheck size={16} />
                    </div>
                    <div>
                      <p className="text-[11px] sm:text-xs font-bold text-slate-900">
                        Includes {cgmConfig.coachSupportDuration}
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-slate-500">
                        Dedicated clinical certified diabetes educator diet & glucose consultation.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* GLUCOMETER TECHNICAL SPECIFICATIONS */}
            {!isCgmProduct && glucoSpecs && (
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Layers size={14} className="text-[#3d3f96]" /> Technical & Clinical Specifications
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs">
                  {glucoSpecs.bloodSampleSize && (
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase block">Blood Sample</span>
                      <strong className="text-slate-800 flex items-center gap-1 mt-1 font-extrabold text-xs sm:text-sm">
                        <Droplet size={13} className="text-rose-500" /> {glucoSpecs.bloodSampleSize}
                      </strong>
                    </div>
                  )}
                  {glucoSpecs.testDurationSeconds && (
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase block">Testing Speed</span>
                      <strong className="text-slate-800 flex items-center gap-1 mt-1 font-extrabold text-xs sm:text-sm">
                        <Timer size={13} className="text-emerald-500" /> {glucoSpecs.testDurationSeconds} Seconds
                      </strong>
                    </div>
                  )}
                  {glucoSpecs.measuringRange && (
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase block">Measuring Range</span>
                      <strong className="text-slate-800 block mt-1 font-extrabold text-xs sm:text-sm">{glucoSpecs.measuringRange}</strong>
                    </div>
                  )}
                  {glucoSpecs.coefficientOfVariation && (
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase block">Precision / CV</span>
                      <strong className="text-slate-800 block mt-1 font-extrabold text-xs sm:text-sm">{glucoSpecs.coefficientOfVariation}</strong>
                    </div>
                  )}
                  {glucoSpecs.accuracyTesting && (
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase block">Accuracy Grade</span>
                      <strong className="text-slate-800 block mt-1 font-extrabold text-xs sm:text-sm truncate">{glucoSpecs.accuracyTesting}</strong>
                    </div>
                  )}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase block">Power Source</span>
                    <strong className="text-slate-800 flex items-center gap-1 mt-1 font-extrabold text-xs sm:text-sm">
                      <BatteryCharging size={13} className="text-amber-500" />
                      {glucoSpecs.batteryRequired ? 'Battery Operated' : 'Phone Powered'}
                    </strong>
                  </div>
                </div>

                {glucoSpecs.certifications && glucoSpecs.certifications.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-2">
                      Clinical Certifications & Clearances
                    </span>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {glucoSpecs.certifications.map((cert, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-xl"
                        >
                          <CheckCircle2 size={12} className="text-emerald-600" /> {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Key Highlights Grid */}
            {product.highlights && product.highlights.length > 0 && (
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-3.5">
                <h3 className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Key Device Highlights
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {product.highlights.map((h, i) => (
                    <div key={h._id || i} className="flex items-start gap-2.5 bg-slate-50/70 p-3 sm:p-3.5 rounded-2xl border border-slate-100">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-indigo-100/70 text-[#3d3f96] flex items-center justify-center shrink-0 font-bold text-xs">
                        0{i + 1}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{h.title}</h4>
                        <p className="text-[10px] sm:text-[11px] text-slate-500 leading-snug mt-0.5">{h.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* How to Use Steps (If Present in Response) */}
            {product.howToUseSteps && product.howToUseSteps.length > 0 && (
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-3.5">
                <h3 className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Activity size={14} className="text-[#3d3f96]" /> How to Use
                </h3>
                <div className="space-y-2">
                  {product.howToUseSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl">
                      <span className="w-6 h-6 rounded-lg bg-[#3d3f96] text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-xs sm:text-sm text-slate-700 font-medium">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Box Contents */}
            {product.boxContents && product.boxContents.length > 0 && (
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-2.5">
                <h3 className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Package size={14} /> Included in Starter Box
                </h3>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {product.boxContents.map((item, i) => (
                    <span key={i} className="text-[11px] sm:text-xs font-bold bg-slate-100 text-slate-800 px-3 py-1.5 rounded-xl">
                      ✓ {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description Card */}
            {product.description && (
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-2">
                <h3 className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Product Overview
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* FAQs Accordion */}
            {product.faqs && product.faqs.length > 0 && (
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-2.5">
                <h3 className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <HelpCircle size={14} /> Frequently Asked Questions
                </h3>
                <div className="space-y-2">
                  {product.faqs.map((faq, index) => {
                    const isOpen = openFaqIndex === index;
                    return (
                      <div key={faq._id || index} className="border border-slate-100 rounded-2xl overflow-hidden transition-all">
                        <button
                          type="button"
                          onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                          className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left text-xs sm:text-sm font-bold text-slate-800 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <span className="pr-2">{faq.question}</span>
                          {isOpen ? <ChevronUp size={15} className="shrink-0" /> : <ChevronDown size={15} className="shrink-0" />}
                        </button>
                        {isOpen && (
                          <div className="p-3.5 sm:p-4 text-xs sm:text-sm text-slate-600 bg-white border-t border-slate-100 leading-relaxed">
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

      {/* ================= ULTRA-COMPACT FLOATING BUY NOW BAR FOR MOBILE ================= */}
      <aside className="lg:hidden fixed bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 z-40 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col pl-1">
            <span className="text-[9px] uppercase font-bold text-slate-400">Total Price</span>
            <div className="flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-black text-slate-900">
                ₹{totalSellingPrice.toLocaleString('en-IN')}
              </span>
              {totalMrp && totalMrp > totalSellingPrice && (
                <span className="text-[10px] sm:text-[11px] text-slate-400 line-through">
                  ₹{totalMrp.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleBuyNow}
            className="flex-1 max-w-[190px] py-2.5 sm:py-3 bg-[#3d3f96] hover:bg-slate-900 text-white rounded-xl font-extrabold text-xs shadow-md shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <CreditCard size={14} />
            <span>Buy Now</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </aside>
    </div>
  );
}