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
  CheckCircle,
  Info,
  HelpCircle,
  Activity,
  FileText,
  Bookmark,
  Plus,
  Minus,
  Store,
  Trash2
} from 'lucide-react';
import UserAPI from '../../../../services/UserAPI'; // Adjust based on your folder structure
import { useNotification } from '../../../../context/NotificationContext'; // Adjust based on your folder structure
import { useCart } from '../../../../context/CartContext'; // Adjust based on your folder structure

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
  const { 
    pharmacyCart, 
    addToPharmacyCart, 
    updatePharmacyItemQuantity, 
    removePharmacyItem,
    clearPharmacyCart,
    loading: cartLoading 
  } = useCart();

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

  // Queries alternate brand information and redirects on success [4]
  const handleAlternativeBrandClick = async (name) => {
    if (!name) return;
    setSearchingBrand(name);
    try {
      const res = await UserAPI.searchAlternativeBrand(name);
      if (res && (res.success || res.Success)) {
        const detailsId = res.data?.details?._id || res.Data?.details?._id;
        if (detailsId) {
          router.push(`/buymedicine/singleproductdetail/${detailsId}`);
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
      <div className="min-h-screen bg-[#f8fbff] flex flex-col items-center justify-center p-6">
        <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={40} />
        <p className="text-slate-400 text-sm font-bold">Assembling medicine profile monograph...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#f8fbff] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="text-rose-500 mb-4" size={48} />
        <h1 className="text-xl font-black text-slate-800">Monograph Unavailable</h1>
        <p className="text-slate-500 text-sm mt-1 max-w-sm">{error || "The medicine ID was not recognized."}</p>
        <button
          onClick={() => router.back()}
          className="mt-6 inline-flex items-center gap-2 bg-[#3d3f96] hover:bg-[#2d2f75] text-white px-6 py-3 rounded-2xl font-black text-xs transition-colors"
        >
          <ArrowLeft size={14} /> Go Back to Store Catalog
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
    <main className="min-h-screen bg-[#f8fbff] py-10 antialiased">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-12">

        {/* --- BACK NAVIGATION BUTTON --- */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-[#3d3f96] hover:text-[#2d2f75] font-black text-xs uppercase tracking-wider mb-8 transition-colors select-none"
        >
          <ArrowLeft size={16} className="stroke-[2.5]" />
          Back to Catalog
        </button>

        {/* --- SECTION 1: PRIMARY PROFILE GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">

          {/* Media Gallery Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-3 sm:p-4 shadow-sm relative overflow-hidden">
              <div className="relative h-72 sm:h-96 rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-50 flex items-center justify-center">
                <img
                  src={getSanitizedImageUrl(galleryImages[selectedImageIndex])}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {hasRx && (
                  <div className="absolute top-4 left-4 bg-amber-500 text-white text-[9px] font-black px-2.5 py-1 rounded-xl shadow-lg flex items-center gap-1.5 tracking-wider select-none">
                    <AlertCircle size={10} /> RX PRESCRIPTION REQUIRED
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Thumbnail Strip */}
            {galleryImages.length > 1 && (
              <div className="flex gap-3 justify-center select-none overflow-x-auto py-1 scrollbar-none">
                {galleryImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 bg-white p-1 transition-all shrink-0 ${selectedImageIndex === index
                      ? 'border-[#3d3f96] scale-105 shadow-sm'
                      : 'border-slate-100 opacity-70 hover:opacity-100'
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
          </div>

          {/* Metadata Details & Price Card */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              {/* Category Tag */}
              <span className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-100/60 px-3 py-1 rounded-full text-[10px] font-black text-indigo-700 uppercase tracking-widest mb-3">
                <Bookmark size={10} className="fill-indigo-500 text-indigo-600" />
                {product.bread_crumb?.split('>')[0].trim() || "Medicine Formulation"}
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">
                {product.name}
              </h1>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mt-2">
                Manufacturer: <span className="text-[#3d3f96]">{product.manufacturers}</span>
              </p>
            </div>

            {/* Salt Composition & Packaging summary */}
            <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm space-y-3.5">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Salt Composition</p>
                <p className="text-sm font-bold text-slate-700 mt-1">{product.salt_composition || "Unspecified Salt Molecule"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-3.5 border-t border-slate-50">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Packaging unit</p>
                  <p className="text-xs font-bold text-slate-700 mt-1">{product.packaging || "1 unit"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Ideal Storage Temp</p>
                  <p className="text-xs font-bold text-slate-700 mt-1">{product.storage || "Store in cold dry conditions"}</p>
                </div>
              </div>
            </div>

            {/* Interactive Primary Use box */}
            {product.primary_use && (
              <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-[2rem] flex gap-3.5">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl shrink-0 h-max">
                  <Activity size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">Primary Indication</p>
                  <p className="text-sm font-black text-emerald-950 mt-1">{product.primary_use}</p>
                </div>
              </div>
            )}

            {/* Price Call-out Summary */}
            <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Standard Market Price</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">₹{product.best_price}</span>
                  {parseFloat(product.mrp) > parseFloat(product.best_price) && (
                    <span className="text-xs sm:text-sm text-slate-400 line-through font-bold">₹{product.mrp}</span>
                  )}
                </div>
              </div>
              {product.discont_percent && product.discont_percent !== "0%" && (
                <div className="bg-rose-50 text-rose-500 font-black text-xs uppercase px-3 py-1.5 rounded-xl border border-rose-100 tracking-wide shadow-sm shadow-rose-100/30">
                  {product.discont_percent} Save
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

        {/* --- SECTION 3: TABBED CLINICAL MONOGRAPHS & GUIDES --- */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
          {/* Header Tabs */}
          <div className="flex border-b border-slate-100 overflow-x-auto scrollbar-none bg-slate-50/50 p-1.5">
            {[
              { id: "uses", label: "Uses & Benefits", icon: Activity },
              { id: "how", label: "How to Use & Workings", icon: HelpCircle },
              { id: "safety", label: "Safety & Dosage", icon: ShieldCheck }
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${activeTab === tab.id
                    ? 'bg-white text-[#3d3f96] shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  <TabIcon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Panes */}
          <div className="p-6 sm:p-8 min-h-[220px]">

            {/* Tab 1: Uses */}
            {activeTab === "uses" && (
              <div className="space-y-6">
                {product.introduction && (
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2">Introduction Summary</h3>
                    <p className="text-sm font-bold text-slate-500 leading-relaxed">{product.introduction}</p>
                  </div>
                )}
                {product.benefits && (
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2">Primary Therapeutic Benefits</h3>
                    <p className="text-sm font-bold text-slate-500 leading-relaxed">{product.benefits}</p>
                  </div>
                )}
                {product.use_of && (
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2">Secondary Indications</h3>
                    <p className="text-sm font-bold text-slate-500 leading-relaxed">{product.use_of}</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: How to Use */}
            {activeTab === "how" && (
              <div className="space-y-6">
                {product.how_to_use && (
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2">Directions for Use</h3>
                    <p className="text-sm font-bold text-slate-500 leading-relaxed">{product.how_to_use}</p>
                  </div>
                )}
                {product.how_works && (
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2">Mechanism of Action</h3>
                    <p className="text-sm font-bold text-slate-500 leading-relaxed">{product.how_works}</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Safety */}
            {activeTab === "safety" && (
              <div className="space-y-6">
                {product.safety_advise && (
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2">Clinical Contraindications & Warnings</h3>
                    <p className="text-sm font-bold text-slate-500 leading-relaxed">{product.safety_advise}</p>
                  </div>
                )}
                {product.side_effect && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    <div>
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2">Common Side Effects</h3>
                      <p className="text-sm font-bold text-slate-500 leading-relaxed">{product.side_effect}</p>
                    </div>
                    {product.how_crop_side_effects && (
                      <div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2">Mitigation & Care</h3>
                        <p className="text-sm font-bold text-slate-500 leading-relaxed">{product.how_crop_side_effects}</p>
                      </div>
                    )}
                  </div>
                )}
                {product.if_miss && (
                  <div className="border-t border-slate-50 pt-4">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2">If you miss a dose</h3>
                    <p className="text-sm font-bold text-slate-500 leading-relaxed">{product.if_miss}</p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* --- SECTION 4: STANDALONE CLINICALLY DESIGNED ALTERNATIVE BRANDS LIST --- */}
        {alternativeBrands.length > 0 && (
          <div className="mt-8 bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.015)] p-6 md:p-8 space-y-6">
            
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-5 border-b border-slate-100">
              <div>
                <h3 className="text-lg md:text-xl font-black text-[#3d3f96] tracking-tight flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  Alternative Brands
                </h3>
                <p className="text-xs md:text-sm text-slate-400 font-medium mt-0.5">Other medications with equivalent therapeutic effects</p>
              </div>
              <span className="self-start md:self-auto text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100/50 uppercase tracking-wider">
                {alternativeBrands.length} Options
              </span>
            </div>

            {/* Interactive List Wrapper */}
            <div className="divide-y divide-slate-100">
              {alternativeBrands.map((brand, index) => {
                const isSearchingThis = searchingBrand === brand.name;
                const isCostlier = brand.tag?.toLowerCase().includes('costlier') || brand.tag?.toLowerCase().includes('expensive');

                return (
                  <div
                    key={index}
                    onClick={() => !searchingBrand && handleAlternativeBrandClick(brand.name)}
                    className={`group relative py-4 px-3 -mx-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-all duration-300 hover:bg-slate-50/80
                      ${searchingBrand && !isSearchingThis ? 'opacity-40 pointer-events-none' : ''}`}
                  >
                    {/* Left Side: Product Information */}
                    <div className="flex items-start gap-3">
                      {/* Micro-Icon */}
                      <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:border-[#3d3f96]/30 transition-colors">
                        <svg className="w-5 h-5 text-slate-400 group-hover:text-[#3d3f96] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-extrabold text-sm md:text-base text-slate-900 group-hover:text-[#3d3f96] transition-colors tracking-tight">
                          {brand.name}
                        </h4>
                        <p className="text-[10px] md:text-xs text-slate-400 font-semibold flex items-center gap-1">
                          by <span className="text-slate-600 font-bold">{brand.company}</span>
                        </p>
                      </div>
                    </div>

                    {/* Right Side: Price, Badges, & Action Trigger */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0">
                      <div className="text-left sm:text-right space-y-1">
                        <p className="text-xs md:text-sm font-black text-slate-900">{brand.price}</p>
                        {brand.tag && (
                          <div className="flex items-center sm:justify-end">
                            <span className={`inline-flex items-center gap-1.5 text-[9px] md:text-[10px] font-extrabold px-2.5 py-1 rounded-xl shadow-sm border ${isCostlier
                                ? 'text-rose-600 bg-rose-50/60 border-rose-100/50'
                                : 'text-emerald-700 bg-emerald-50/80 border-emerald-100/50'
                              }`}>
                              <span className={`w-1 h-1 rounded-full ${isCostlier ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                              {brand.tag}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Indicator */}
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50/50 group-hover:bg-white group-hover:shadow-sm border border-transparent group-hover:border-slate-100 transition-all shrink-0">
                        {isSearchingThis ? (
                          <div className="w-4 h-4 border-2 border-[#3d3f96] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg
                            className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-all transform group-hover:translate-x-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                          </svg>
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