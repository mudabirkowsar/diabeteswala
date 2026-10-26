"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Star,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  Clock,
  Truck,
  MapPin,
  ShoppingBag,
  Loader2,
  CheckCircle2,
  Info,
  HelpCircle,
  Activity,
  FileText,
  Bookmark,
  Plus,
  Minus,
  Store,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  RotateCcw,
  Banknote,
  Pill,
  Thermometer,
  Package,
  Check,
  Share2,
  Heart
} from 'lucide-react';
import UserAPI from '../../../../services/UserAPI'; // Adjust based on your folder structure
import { useNotification } from '../../../../context/NotificationContext'; // Adjust based on your folder structure

// Import Sellers List & Cart Controller Sub-Component
import SellersAndCartSection from '../components/SellersAndCartSection'; // Adjust based on your folder structure

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const STATIC_PRODUCT_FALLBACK_GALLERY = [
  "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?q=80&w=600&auto=format&fit=crop"
];

const ProductDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { showNotification } = useNotification();

  const productId = params?.id;

  // Data States
  const [product, setProduct] = useState(null);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected Seller State (Shared state passed to child section)
  const [selectedSeller, setSelectedSeller] = useState(null);

  // Gallery and Tab States
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("uses");

  // State to track which alternative brand is currently loading/querying
  const [searchingBrand, setSearchingBrand] = useState(null);

  useEffect(() => {
    if (!productId) return;
    const loadProductDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        // Get user coordinates from localStorage
        let lat = null;
        let lng = null;
        if (typeof window !== "undefined") {
          const savedCoords = localStorage.getItem("userCoords");
          if (savedCoords) {
            try {
              const parsed = JSON.parse(savedCoords);
              lat = parsed.lat;
              lng = parsed.lng;
              console.log("Latitude:", lat);
              console.log("Longitude:", lng);
            } catch (e) {
              console.error(
                "Error reading stored user coordinates:",
                e
              );
            }
          }
        }
        // Send exact coordinates to backend
        const response = await UserAPI.getProductFullDetail(
          productId,
          {
            lat,
            lng,
          }
        );
        if (response && response.success) {
          setProduct(response.data?.medicineDetails || null);
          const fetchedSellers =
            response.data?.availableInPharmacies || [];
          setSellers(fetchedSellers);
          // Auto-select first pharmacy
          if (fetchedSellers.length > 0) {
            setSelectedSeller(fetchedSellers[0]);
          }
        } else {
          setError("Unable to find matching medicine details");
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("Failed to retrieve product profile details");
        if (showNotification) {
          showNotification(
            err.message || "Unable to fetch product details.",
            "error"
          );
        }
      } finally {
        setLoading(false);
      }
    };
    loadProductDetails();
  }, [productId, showNotification]);

  // Format server image paths correctly
  const getSanitizedImageUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?q=80&w=400&auto=format&fit=crop";
    if (path.startsWith('http://') || path.startsWith('https://')) return path;

    let cleanPath = path.replace(/\\/g, '/');
    cleanPath = cleanPath.replace(/^public\//, '');
    if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.substring(1);
    }
    return `${BASE_URL}/${cleanPath}`;
  };

  // Parse the unstructured alternative brand strings from API
  const parseAlternativeBrands = (str) => {
    if (!str) return [];
    return str.split('|').map(item => {
      const parts = item.split('::').map(p => p.trim());
      return {
        name: parts[0] || "Alternative Brand",
        company: parts[1] || "Generic Lab",
        price: parts[2] || "N/A",
        tag: parts[3] || "Comparable Formulation"
      };
    });
  };

  // Queries alternate brand information and redirects on success
  const handleAlternativeBrandClick = async (name) => {
    if (!name) return;
    setSearchingBrand(name);
    try {
      const res = await UserAPI.searchAlternativeBrand(name);
      if (res && (res.success || res.Success)) {
        const detailsId = res.data?.details?._id || res.Data?.details?._id;
        if (detailsId) {
          router.push(`/pharmacy/productdetail/${detailsId}`);
        } else {
          if (showNotification) {
            showNotification("Medicine details not found for this alternative.", "error");
          }
        }
      } else {
        if (showNotification) {
          showNotification("Medicine details not found for this alternative.", "error");
        }
      }
    } catch (err) {
      console.error("Error navigating to alternative brand:", err);
      if (showNotification) {
        showNotification("Failed to load alternative brand details.", "error");
      }
    } finally {
      setSearchingBrand(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-[#3d3f96]/10 flex items-center justify-center">
            <Loader2 className="animate-spin text-[#3d3f96]" size={32} />
          </div>
        </div>
        <p className="text-slate-800 text-sm font-bold mt-4 tracking-tight">Accessing Medicine Database</p>
        <p className="text-slate-400 text-xs font-medium mt-1">Retrieving verified clinical monograph &amp; pharmacy stock...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mb-4">
          <AlertCircle className="text-rose-500" size={32} />
        </div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Medicine Profile Unavailable</h1>
        <p className="text-slate-500 text-xs mt-2 max-w-sm">{error || "The requested medicine record could not be found."}</p>
        <button
          onClick={() => router.back()}
          className="mt-6 inline-flex items-center gap-2 bg-[#3d3f96] hover:bg-[#323480] text-white px-6 py-3 rounded-xl font-bold text-xs transition-all shadow-md shadow-[#3d3f96]/20 active:scale-95"
        >
          <ArrowLeft size={14} /> Return to Store Catalog
        </button>
      </div>
    );
  }

  const hasRx = product.prescription_required === "YES";

  // Resolve dynamic gallery array
  const galleryImages = product.image_url && product.image_url.length > 0
    ? product.image_url
    : STATIC_PRODUCT_FALLBACK_GALLERY;

  const alternativeBrands = parseAlternativeBrands(product.alternate_brand);

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-6 sm:py-8 antialiased text-slate-800">
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* --- CLINICAL BREADCRUMB STRIP --- */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6 overflow-x-auto whitespace-nowrap pb-1 scrollbar-none">
          <button 
            onClick={() => router.back()} 
            className="hover:text-slate-700 flex items-center gap-1.5 transition-colors py-1 px-2 -ml-2 rounded-lg hover:bg-slate-200/50"
          >
            <ArrowLeft size={13} /> Back
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-500">{product.bread_crumb?.split('>')[0]?.trim() || "Pharmacy"}</span>
          {product.bread_crumb?.split('>')[1] && (
            <>
              <ChevronRight size={12} className="text-slate-300" />
              <span className="text-slate-500">{product.bread_crumb.split('>')[1].trim()}</span>
            </>
          )}
          <ChevronRight size={12} className="text-slate-300" />
          <span className="text-[#3d3f96] font-bold truncate max-w-[240px]">{product.name}</span>
        </div>

        {/* --- SECTION 1: PRIMARY PROFILE GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">

          {/* Media Column (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-sm relative overflow-hidden group">
              <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden bg-slate-50/60 border border-slate-100 flex items-center justify-center p-6">
                <img
                  src={getSanitizedImageUrl(galleryImages[selectedImageIndex])}
                  alt={product.name}
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                />

                {/* Prescription Required Badge */}
                {hasRx && (
                  <div className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5 tracking-wider uppercase">
                    <ShieldAlert size={12} className="stroke-[2.5]" /> Rx Prescription Required
                  </div>
                )}

                {/* Verified Formula Micro-badge */}
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-emerald-700 border border-emerald-100 text-[10px] font-bold px-2.5 py-1 rounded-xl shadow-sm flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-emerald-500" /> Verified Monograph
                </div>
              </div>
            </div>

            {/* Interactive Thumbnail Strip */}
            {galleryImages.length > 1 && (
              <div className="flex gap-2.5 justify-center select-none overflow-x-auto py-1 scrollbar-none">
                {galleryImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 bg-white p-1 transition-all shrink-0 ${
                      selectedImageIndex === index
                        ? 'border-[#3d3f96] shadow-sm scale-105'
                        : 'border-slate-200/70 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={getSanitizedImageUrl(img)}
                      alt={`${product.name} View ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Trust Assurance Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="bg-white border border-slate-200/80 p-3.5 rounded-2xl flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center text-[#3d3f96] shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-800">100% Genuine</p>
                  <p className="text-[10px] font-medium text-slate-400">Direct from certified labs</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 p-3.5 rounded-2xl flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100/50 flex items-center justify-center text-emerald-600 shrink-0">
                  <RotateCcw size={15} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-800">
                    {product.isReturnAllowed ? "Returnable" : "Non-Returnable"}
                  </p>
                  <p className="text-[10px] font-medium text-slate-400">
                    {product.returnWindowDays ? `${product.returnWindowDays}-day policy` : "Standard hygiene code"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Product Specifications & Pricing Column (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Title & Manufacturer Header */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100/60 px-3 py-1 rounded-full text-[10px] font-bold text-[#3d3f96] uppercase tracking-wider">
                  <Bookmark size={10} className="fill-[#3d3f96]" />
                  {product.bread_crumb?.split('>')[0]?.trim() || "Prescription Drug"}
                </span>

                {product.exp_formatted && (
                  <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-100/80 px-2.5 py-1 rounded-full text-[10px] font-bold text-amber-700">
                    <Calendar size={11} /> Expiry: {product.exp_formatted}
                  </span>
                )}

                {product.batch_number && (
                  <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-600">
                    <Layers size={11} /> Batch: {product.batch_number}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {product.name}
              </h1>

              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <p className="text-xs text-slate-500 font-medium">
                  Manufactured by <span className="text-[#3d3f96] font-bold">{product.manufacturers}</span>
                </p>
                {product.manufaturer_address && (
                  <span className="text-[11px] text-slate-400 font-normal">({product.manufaturer_address})</span>
                )}
              </div>
            </div>

            {/* Salt Molecule Formulation Block */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-[#3d3f96] mt-0.5">
                  <Pill size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Active Chemical Composition</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{product.salt_composition || "Active Chemical Composition"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Package size={14} className="text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] font-medium text-slate-400 uppercase">Packaging Unit</p>
                    <p className="text-xs font-bold text-slate-700">{product.packaging || "Standard Pack"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Thermometer size={14} className="text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] font-medium text-slate-400 uppercase">Storage Requirement</p>
                    <p className="text-xs font-bold text-slate-700">{product.storage || "Cool & dry place"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                  <Banknote size={14} className="text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] font-medium text-slate-400 uppercase">Payment Policy</p>
                    <p className="text-xs font-bold text-slate-700">{product.isCodAvailable ? "COD Available" : "Online Pre-paid"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Primary Indication Callout */}
            {product.primary_use && (
              <div className="bg-emerald-50/70 border border-emerald-200/60 p-4 rounded-2xl flex items-start gap-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-700 rounded-xl shrink-0 mt-0.5">
                  <Activity size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider">Primary Medical Indication</p>
                  <p className="text-sm font-extrabold text-emerald-950 mt-0.5">{product.primary_use}</p>
                  {product.description && (
                    <p className="text-xs text-emerald-800/80 mt-1 font-medium leading-relaxed">{product.description}</p>
                  )}
                </div>
              </div>
            )}

            {/* Price Monograph Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Standard Market Rate</p>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-3xl font-extrabold text-slate-900 leading-none">
                    ₹{product.best_price}
                  </span>
                  {parseFloat(product.mrp) > parseFloat(product.best_price) && (
                    <span className="text-sm text-slate-400 line-through font-semibold">
                      ₹{product.mrp}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 font-medium mt-1">Inclusive of GST and applicable taxes</p>
              </div>

              {product.discont_percent && product.discont_percent !== "0%" && (
                <div className="bg-rose-50 border border-rose-200 text-rose-600 font-extrabold text-xs uppercase px-3.5 py-1.5 rounded-xl tracking-wider">
                  {product.discont_percent} OFF
                </div>
              )}
            </div>

          </div>
        </div>

        {/* --- SECTION 2: LOCAL PHARMACY SELLER LIST & CART CONTROLLER --- */}
        <SellersAndCartSection
          productId={productId}
          sellers={sellers}
          selectedSeller={selectedSeller}
          setSelectedSeller={setSelectedSeller}
          getSanitizedImageUrl={getSanitizedImageUrl}
        />

        {/* --- SECTION 3: CLINICAL GUIDELINES TABBED SECTION --- */}
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm mt-8">
          {/* Header Tabs */}
          <div className="flex border-b border-slate-200/70 overflow-x-auto scrollbar-none bg-slate-50/70 p-1.5 gap-1">
            {[
              { id: "uses", label: "Uses & Benefits", icon: Activity },
              { id: "how", label: "How to Use & Action", icon: HelpCircle },
              { id: "safety", label: "Safety & Warnings", icon: ShieldCheck }
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-[#3d3f96] shadow-sm border border-slate-200/60'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <TabIcon size={14} className={activeTab === tab.id ? "text-[#3d3f96]" : "text-slate-400"} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content Panes */}
          <div className="p-6 sm:p-8 min-h-[200px]">

            {/* Tab 1: Uses */}
            {activeTab === "uses" && (
              <div className="space-y-6">
                {product.introduction && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Product Summary</h3>
                    <p className="text-sm font-medium text-slate-700 leading-relaxed">{product.introduction}</p>
                  </div>
                )}
                {product.benefits && (
                  <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-[#3d3f96]" /> Therapeutic Benefits
                    </h3>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed">{product.benefits}</p>
                  </div>
                )}
                {product.use_of && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Prescribed For</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.use_of.split('|').map((use, idx) => (
                        <span key={idx} className="bg-indigo-50 text-[#3d3f96] border border-indigo-100 text-xs font-bold px-3 py-1.5 rounded-xl">
                          {use.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: How to Use */}
            {activeTab === "how" && (
              <div className="space-y-6">
                {product.how_to_use && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Dosage &amp; Administration</h3>
                    <p className="text-sm font-medium text-slate-700 leading-relaxed">{product.how_to_use}</p>
                  </div>
                )}
                {product.how_works && (
                  <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Mechanism of Action</h3>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed">{product.how_works}</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Safety */}
            {activeTab === "safety" && (
              <div className="space-y-6">
                {product.safety_advise && (
                  <div className="bg-amber-50/50 border border-amber-200/60 p-4 rounded-2xl">
                    <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <AlertCircle size={14} className="text-amber-600" /> Warnings &amp; Precautions
                    </h3>
                    <p className="text-sm font-medium text-amber-950 leading-relaxed">{product.safety_advise}</p>
                  </div>
                )}
                {product.side_effect && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Common Side Effects</h3>
                      <p className="text-sm font-medium text-slate-600 leading-relaxed">{product.side_effect}</p>
                    </div>
                    {product.how_crop_side_effects && (
                      <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Managing Side Effects</h3>
                        <p className="text-sm font-medium text-slate-600 leading-relaxed">{product.how_crop_side_effects}</p>
                      </div>
                    )}
                  </div>
                )}
                {product.if_miss && (
                  <div className="border-t border-slate-100 pt-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">If you miss a dose</h3>
                    <p className="text-sm font-medium text-slate-700 leading-relaxed">{product.if_miss}</p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* --- SECTION 4: ALTERNATIVE BRANDS / SUBSTITUTES --- */}
        {alternativeBrands.length > 0 && (
          <div className="mt-8 bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm p-6 sm:p-8 space-y-5">

            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Substitute Formulations
                </h3>
                <p className="text-xs text-slate-400 font-medium">Alternative brands containing the same active ingredient</p>
              </div>
              <span className="self-start sm:self-auto text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                {alternativeBrands.length} Verified Brands
              </span>
            </div>

            {/* Interactive Substitutes List */}
            <div className="divide-y divide-slate-100">
              {alternativeBrands.map((brand, index) => {
                const isSearchingThis = searchingBrand === brand.name;
                const isCostlier = brand.tag?.toLowerCase().includes('costlier') || brand.tag?.toLowerCase().includes('expensive');

                return (
                  <div
                    key={index}
                    onClick={() => !searchingBrand && handleAlternativeBrandClick(brand.name)}
                    className={`group py-3.5 px-3 -mx-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all duration-200 hover:bg-slate-50 ${
                      searchingBrand && !isSearchingThis ? 'opacity-40 pointer-events-none' : ''
                    }`}
                  >
                    {/* Brand info */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100/60 flex items-center justify-center shrink-0 group-hover:bg-[#3d3f96] text-[#3d3f96] group-hover:text-white transition-colors">
                        <Pill size={16} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 group-hover:text-[#3d3f96] transition-colors">
                          {brand.name}
                        </h4>
                        <p className="text-xs text-slate-400 font-medium">
                          by <span className="text-slate-600 font-semibold">{brand.company}</span>
                        </p>
                      </div>
                    </div>

                    {/* Price, Badge & Arrow */}
                    <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0">
                      <div className="text-left sm:text-right">
                        <p className="text-xs sm:text-sm font-bold text-slate-900">{brand.price}</p>
                        {brand.tag && (
                          <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-lg border mt-0.5 ${
                            isCostlier
                              ? 'text-rose-600 bg-rose-50 border-rose-100'
                              : 'text-emerald-700 bg-emerald-50 border-emerald-100'
                          }`}>
                            {brand.tag}
                          </span>
                        )}
                      </div>

                      <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-[#3d3f96] text-slate-400 group-hover:text-white flex items-center justify-center transition-colors">
                        {isSearchingThis ? (
                          <Loader2 size={14} className="animate-spin text-[#3d3f96] group-hover:text-white" />
                        ) : (
                          <ChevronRight size={15} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

      </div>
    </main>
  );
};

export default ProductDetailPage;