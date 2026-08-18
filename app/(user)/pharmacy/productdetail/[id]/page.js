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
  Store
} from 'lucide-react';
import UserAPI from '../../../../services/UserAPI'; // Adjust based on your folder structure
import { useNotification } from '../../../../context/NotificationContext'; // Adjust based on your folder structure

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

  // Selected Seller State
  const [selectedSeller, setSelectedSeller] = useState(null);

  // Central Quantity Counter
  const [globalQuantity, setGlobalQuantity] = useState(1);

  // Gallery and Tab States
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("uses");

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

  // Central Global Add to Cart Handler
  const handleGlobalAddToCart = () => {
    if (!selectedSeller) {
      if (showNotification) {
        showNotification("Please select a pharmacy seller first.", "error");
      }
      return;
    }

    if (showNotification) {
      showNotification(
        `Added ${globalQuantity} item(s) from "${selectedSeller.name}" to your cart.`,
        "success"
      );
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 items-start">

          {/* Left: Pixel-Matched Pharmacy Sellers List */}
          <div className="lg:col-span-7 bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 px-1">
              <div className="flex items-center gap-2.5">
                <Store size={18} className="text-slate-600" />
                <h2 className="text-lg font-black text-slate-800 tracking-tight">Available Sellers</h2>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {sellers.length} Near You
              </span>
            </div>

            {sellers.length > 0 ? (
              <div className="space-y-4">
                {sellers.map((seller) => {
                  const isSelected = selectedSeller?.pharmacyId === seller.pharmacyId;
                  const itemDiscount = seller.discount || 0;

                  return (
                    <div
                      key={seller.pharmacyId}
                      onClick={() => {
                        setSelectedSeller(seller);
                        setGlobalQuantity(1); // Reset qty stepper to 1 on select
                      }}
                      className={`w-full flex items-center justify-between p-4 rounded-3xl transition-all duration-300 border cursor-pointer ${isSelected
                        ? 'border-emerald-500 bg-white shadow-sm ring-1 ring-emerald-500/20'
                        : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'
                        }`}
                    >
                      {/* Left Logo and Address Info */}
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-slate-100 bg-slate-50 flex items-center justify-center">
                          <img
                            src={getSanitizedImageUrl(seller.image)}
                            alt={seller.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col items-start ml-4 text-left min-w-0">
                          <p className="font-black text-sm text-slate-800 truncate leading-snug">
                            {seller.name}
                          </p>
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 mt-1 truncate">
                            <MapPin size={10} className="text-emerald-500 fill-emerald-50 shrink-0" />
                            <span>{seller.distance} km • {seller.address}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Pricing details */}
                      <div className="flex flex-col items-end shrink-0">
                        <p className="font-black text-base text-slate-900 leading-none">
                          ₹{seller.price}
                        </p>
                        {itemDiscount > 0 && (
                          <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg mt-1 tracking-wide select-none">
                            {itemDiscount}% OFF
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-slate-50 border-2 border-dashed border-slate-100 p-8 text-center rounded-[2rem]">
                <p className="text-sm font-bold text-slate-500">This medicine is currently out of stock near you.</p>
              </div>
            )}
          </div>

          {/* Right: Unified Single Cart Controller Section */}
          <div className="lg:col-span-5 bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm space-y-5">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 pb-2.5">
              Order Settings
            </p>

            {selectedSeller ? (
              <div className="space-y-5">
                {/* Selected Store Details Card */}
                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/60">
                  <p className="text-[10px] font-black text-indigo-700/80 uppercase tracking-wider">
                    Active Selected Seller
                  </p>
                  <p className="text-sm font-black text-slate-800 mt-1">{selectedSeller.name}</p>
                  <p className="text-[11px] text-slate-400 font-bold mt-0.5">{selectedSeller.address}</p>

                  <div className="flex justify-between items-center mt-3.5 pt-3.5 border-t border-slate-100">
                    <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                      <Truck size={12} className="text-[#3d3f96]" />
                      {selectedSeller.isHomeDelivery ? "Home Delivery" : "Store Pickup Only"}
                    </span>
                    <span className="text-[11px] text-slate-400 font-bold">
                      Stock: {selectedSeller.stock} available
                    </span>
                  </div>
                </div>

                {/* Dynamic Price Calculation Summary */}
                <div className="flex justify-between items-end bg-[#3d3f96]/5 border border-[#3d3f96]/10 p-4 rounded-2xl">
                  <div>
                    <span className="text-[10px] text-[#3d3f96] font-black uppercase tracking-wider">
                      Subtotal Amount
                    </span>
                    <p className="text-2xl font-black text-slate-900 mt-1 leading-none">
                      ₹{selectedSeller.price * globalQuantity}
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">
                    ₹{selectedSeller.price} × {globalQuantity} strip{globalQuantity > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Stepper & Add To Cart Horizontal Block */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Stepper controls */}
                  <div className="flex items-center justify-between border border-[#3d3f96]/20 rounded-2xl p-1 bg-indigo-50/20 w-full sm:w-max shrink-0">
                    <button
                      onClick={() => setGlobalQuantity(prev => Math.max(1, prev - 1))}
                      disabled={globalQuantity <= 1}
                      className="p-3 bg-white text-[#3d3f96] hover:bg-indigo-50 rounded-xl shadow-sm transition-all disabled:opacity-50"
                    >
                      <Minus size={14} className="stroke-[2.5]" />
                    </button>

                    <span className="text-sm font-black text-slate-800 px-5 select-none">
                      {globalQuantity}
                    </span>

                    <button
                      onClick={() => setGlobalQuantity(prev => prev + 1)}
                      disabled={globalQuantity >= selectedSeller.stock}
                      className="p-3 bg-white text-[#3d3f96] hover:bg-indigo-50 rounded-xl shadow-sm transition-all disabled:opacity-50"
                    >
                      <Plus size={14} className="stroke-[2.5]" />
                    </button>
                  </div>

                  {/* Unified Add to Cart button */}
                  <button
                    onClick={handleGlobalAddToCart}
                    className="w-full flex-1 py-4 bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-xs sm:text-sm font-black rounded-2xl shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <ShoppingBag size={16} />
                    <span>Add To Cart</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-xs font-bold text-slate-400">Select an available partner pharmacy on the left to set order options.</p>
              </div>
            )}
          </div>

        </div>

        {/* --- SECTION 3: TABBED CLINICAL MONOGRAPHS & GUIDES --- */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
          {/* Header Tabs */}
          <div className="flex border-b border-slate-100 overflow-x-auto scrollbar-none bg-slate-50/50 p-1.5">
            {[
              { id: "uses", label: "Uses & Benefits", icon: Activity },
              { id: "how", label: "How to Use & Workings", icon: HelpCircle },
              { id: "safety", label: "Safety & Dosage", icon: ShieldCheck },
              { id: "alternatives", label: "Comparable Brands", icon: FileText }
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

            {/* Tab 4: Alternatives */}
            {activeTab === "alternatives" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2">Alternative Formulation Equivalents</h3>
                  <p className="text-xs font-bold text-slate-400 mb-4">Please verify the molecule strength with your primary healthcare physician before shifting brands.</p>
                </div>

                {alternativeBrands.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {alternativeBrands.map((brand, i) => (
                      <div key={i} className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between">
                        <div>
                          <p className="font-black text-sm text-slate-800">{brand.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{brand.company}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-[#3d3f96]">{brand.price}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">{brand.tag}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-bold text-slate-400">No equivalent products mapped for this formulation.</p>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </main>
  );
};

export default ProductDetailPage;