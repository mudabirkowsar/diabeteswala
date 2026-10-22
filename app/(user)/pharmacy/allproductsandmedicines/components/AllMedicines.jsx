"use client";
import React, { useState, useEffect } from 'react';
import {
  Star,
  Info,
  AlertCircle,
  Pill,
  ShieldCheck,
  Loader2,
  Sparkles,
  RotateCcw,
  RefreshCw
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import UserAPI from '../../../../services/UserAPI'; // Adjust relative path as needed
import { useNotification } from '../../../../context/NotificationContext'; // Adjust relative path as needed

// High-quality static fallback images for products without custom images
const STATIC_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=400&auto=format&fit=crop",
  "https://png.pngtree.com/png-clipart/20240619/original/pngtree-drug-capsule-pill-from-prescription-in-drugstore-pharmacy-for-treatment-health-png-image_15366552.png",
  "https://img.magnific.com/free-vector/isometric-gastroenterology-composition-with-view-medication-with-tubes-pills-illustration_1284-63536.jpg?semt=ais_test_b&w=740&q=80",
  "https://img.magnific.com/free-vector/blue-capsules-pot-drug-icon_18591-82034.jpg?semt=ais_test_b&w=740&q=80",
  "https://images.unsplash.com/photo-1628771065518-0d82f1938462?q=80&w=400&auto=format&fit=crop",
];

const AllMedicines = ({ pharmacyId, searchQuery }) => {
  const router = useRouter();
  const { showNotification } = useNotification?.() || {};

  // Category and Product States
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);

  // Pagination States
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // UI Load & Error States
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState(false);

  // Fetch Categories only when viewing global catalog (no single pharmacy selected)
  useEffect(() => {
    if (pharmacyId) return;

    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await UserAPI.getMedicineCategories();
        if (res && res.success) {
          setCategories(res.data || []);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [pharmacyId]);

  // Reset pagination state when pharmacy selection or category changes
  useEffect(() => {
    setPage(1);
    setProducts([]);
    setHasMore(false);
  }, [pharmacyId, selectedCategory]);

  // Fetch Products: Handles pharmacy-specific catalog vs general catalog
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (page === 1) {
          setLoadingProducts(true);
        } else {
          setLoadingMore(true);
        }
        setError(false);

        let res = null;

        if (pharmacyId) {
          // 1. Fetch specific pharmacy inventory using the new API
          res = await UserAPI.getPharmacyStoreMedicinesCatalog(pharmacyId, { page });
          if (res && res.success) {
            const fetchedData = res.data || [];
            setProducts((prev) => (page === 1 ? fetchedData : [...prev, ...fetchedData]));
            setHasMore(res.currentPage < res.totalPages);
          } else {
            setError(true);
          }
        } else {
          // 2. Fetch general catalog
          const params = {
            page: page,
            limit: 20
          };
          if (selectedCategory) {
            params.category = selectedCategory;
          }

          res = await UserAPI.getAllProducts(params);
          if (res && res.success) {
            const fetchedData = res.data || [];
            setProducts((prev) => (page === 1 ? fetchedData : [...prev, ...fetchedData]));

            if (res.pagination) {
              setHasMore(res.pagination.hasNextPage ?? (res.pagination.currentPage < res.pagination.totalPages));
            } else {
              setHasMore(res.currentPage < res.totalPages);
            }
          } else {
            setError(true);
          }
        }
      } catch (err) {
        setError(true);
        if (showNotification) {
          showNotification(err.message || "Failed to retrieve medicines.", "error");
        }
      } finally {
        setLoadingProducts(false);
        setLoadingMore(false);
      }
    };

    fetchProducts();
  }, [pharmacyId, selectedCategory, page, showNotification]);

  // Client-side search filtering on loaded products
  const filteredProducts = products.filter((product) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    const productName = product.name?.toLowerCase() || "";
    const salt = (product.salt || product.salt_composition || "").toLowerCase();
    const manufacturer = (product.manufacturers || "").toLowerCase();

    return (
      productName.includes(searchLower) ||
      salt.includes(searchLower) ||
      manufacturer.includes(searchLower)
    );
  });

  // Resolve Product Image safely
  const getProductImage = (item, index) => {
    if (item.image) return item.image;
    if (item.image_url && item.image_url.length > 0) return item.image_url[0];
    return STATIC_FALLBACK_IMAGES[index % STATIC_FALLBACK_IMAGES.length];
  };

  // Helper dynamic metadata resolvers
  const getFormFactor = (item) => {
    if (item.bread_crumb) {
      const parts = item.bread_crumb.split('>');
      return parts[parts.length - 1].trim();
    }
    return "Tablet";
  };

  // Click handler to redirect to specific details page
  const handleCardClick = (product) => {
    const targetId = product.medicineId || product._id || product.Id;
    if (targetId) {
      router.push(`/pharmacy/productdetail/${targetId}`);
    }
  };

  return (
    <div className="space-y-8">

      {/* --- CATEGORIES PILLED SELECTOR BAR (Displayed only for All Medicines mode) --- */}
      {!pharmacyId && !loadingCategories && categories.length > 0 && (
        <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-none select-none">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-300 shrink-0 border whitespace-nowrap ${!selectedCategory
                ? 'bg-[#3d3f96] text-white border-[#3d3f96] shadow-lg shadow-indigo-100/60'
                : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
              }`}
          >
            All Medicines
          </button>

          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-300 shrink-0 border whitespace-nowrap flex items-center gap-2 ${selectedCategory === cat.name
                  ? 'bg-[#3d3f96] text-white border-[#3d3f96] shadow-lg shadow-indigo-100/60'
                  : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
                }`}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* --- MAIN CONTENT GRID --- */}
      {loadingProducts && page === 1 ? (
        // Loading State: Skeletons
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
            <div key={index} className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 p-4 animate-pulse space-y-4">
              <div className="bg-slate-100 rounded-[1rem] sm:rounded-[2rem] h-36 sm:h-52 w-full" />
              <div className="h-4 bg-slate-100 rounded w-1/3" />
              <div className="h-6 bg-slate-100 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
              <div className="h-10 bg-slate-100 rounded-xl w-full pt-4" />
            </div>
          ))}
        </div>
      ) : error ? (
        // Error State
        <div className="py-20 text-center bg-white rounded-[2rem] sm:rounded-[3rem] border-2 border-dashed border-slate-100">
          <AlertCircle size={48} className="mx-auto text-rose-300 mb-4 animate-bounce" />
          <p className="text-slate-600 font-bold">Failed to load medicines from catalog</p>
          <p className="text-slate-400 text-xs mt-1">Please try refreshing your browser or choosing another pharmacy</p>
        </div>
      ) : filteredProducts.length > 0 ? (
        // Active Products List
        <div className="space-y-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product, index) => {
              // 1. Prescription check
              const isRx =
                product.prescriptionRequired?.toUpperCase() === "YES" ||
                product.prescription_required === "YES" ||
                product.isRxRequired === true;

              // 2. Pricing and Discount calculations
              const sellingPrice = product.vendorPrice ?? product.best_price ?? product.minPrice;
              const mrpPrice = product.mrp;
              const discountText = product.discountPercentage
                ? `${product.discountPercentage}% OFF`
                : product.discont_percent || (product.discountPercentage ? `${product.discountPercentage}% OFF` : null);

              // 3. Stock & Availability
              const stock = product.stock ?? product.cheapestSeller?.stock;
              const isAvailable = product.isAvailable !== false && (stock === undefined || stock > 0);

              // 4. Combo / BOGO Offer Data
              const comboOffer = product.comboOffer;

              const currentImg = getProductImage(product, index);
              const formFactor = getFormFactor(product);

              return (
                <div
                  key={product.inventoryId || product.medicineId || product._id || product.Id || index}
                  onClick={() => handleCardClick(product)}
                  className={`bg-white rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 p-1.5 sm:p-2 shadow-sm transition-all duration-500 group flex flex-col justify-between overflow-hidden cursor-pointer ${!isAvailable ? 'opacity-75 bg-slate-50/70 hover:opacity-90' : 'hover:shadow-xl'
                    }`}
                >
                  <div>
                    {/* Product Image Area */}
                    <div className="relative h-36 sm:h-52 rounded-[1rem] sm:rounded-[2rem] overflow-hidden bg-slate-50">
                      <img
                        src={currentImg}
                        alt={product.name}
                        className={`w-full h-full object-cover transition-transform duration-700 ${!isAvailable ? 'filter blur-[1.5px] grayscale-[30%]' : 'group-hover:scale-110'
                          }`}
                        loading="lazy"
                      />

                      {/* RX Required Badge */}
                      {isRx && (
                        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10 bg-rose-500 text-white text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg shadow-lg flex items-center gap-1">
                          <AlertCircle size={8} className="sm:w-2.5 sm:h-2.5" /> RX REQUIRED
                        </div>
                      )}

                      {/* Combo / BOGO Deal Promo Tag */}
                      {comboOffer && comboOffer.campaignDisplayName && (
                        <div className="absolute bottom-2 left-2 right-2 z-10 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[8px] sm:text-[9px] font-black px-2 py-1 rounded-lg shadow-md flex items-center justify-center gap-1 truncate uppercase tracking-wider">
                          <Sparkles size={10} className="shrink-0" />
                          <span className="truncate">{comboOffer.campaignDisplayName}</span>
                        </div>
                      )}

                      {/* Out of Stock Overlay */}
                      {!isAvailable && (
                        <div className="absolute inset-0 bg-slate-900/35 backdrop-blur-[2px] flex items-center justify-center p-2 z-10">
                          <span className="bg-rose-500 text-white text-[9px] sm:text-[11px] font-black px-3 py-1 rounded-lg shadow-md uppercase tracking-wider">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Details Section */}
                    <div className="p-3 sm:p-5">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[65%]">
                          {product.manufacturers || "Verified Product"}
                        </p>
                        <span className="text-[8px] sm:text-[9px] font-bold text-[#3d3f96] bg-indigo-50/60 px-1.5 py-0.5 rounded-md shrink-0 truncate max-w-[35%]">
                          {formFactor}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-black text-slate-800 mt-1 sm:mt-1.5 group-hover:text-[#3d3f96] transition-colors line-clamp-1" title={product.name}>
                        {product.name}
                      </h3>

                      <p className="text-[8px] sm:text-[10px] text-slate-500 font-medium mt-1 truncate">
                        Active: {product.salt || product.salt_composition || "Active Formulation"}
                      </p>

                      <div className="flex items-center justify-between mt-1">
                        <p className="text-[8px] sm:text-[10px] text-slate-400 font-bold truncate">
                          Pack: {product.packaging || "1 unit"}
                        </p>

                        {/* Stock Tag */}
                        <div className="flex items-center gap-1 shrink-0">
                          <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <span className={`text-[8px] sm:text-[9.5px] font-bold ${isAvailable ? 'text-emerald-600' : 'text-rose-500'}`}>
                            {isAvailable
                              ? (stock !== undefined ? `In Stock (${stock})` : 'In Stock')
                              : 'Unavailable'}
                          </span>
                        </div>
                      </div>

                      {/* Store Policy Badges (Return / Replacement) */}
                      {(product.isReturnAllowed || product.isReplacementAllowed) && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-50">
                          {product.isReturnAllowed && (
                            <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-slate-400">
                              <RotateCcw size={9} className="text-emerald-500" /> Returns Allowed
                            </span>
                          )}
                          {product.isReplacementAllowed && (
                            <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-slate-400">
                              <RefreshCw size={9} className="text-indigo-500" /> Replacement
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price & Action Section at Bottom */}
                  <div className="px-3 pb-3 sm:px-5 sm:pb-5 pt-0 mt-auto">
                    <div className="border-t border-slate-50 pt-3">

                      {/* Pricing Block */}
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                            {pharmacyId ? "Store Price" : "Price"}
                          </p>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-base sm:text-xl font-black text-slate-900 leading-none">
                              ₹{sellingPrice ?? mrpPrice}
                            </span>
                            {mrpPrice && parseFloat(mrpPrice) > parseFloat(sellingPrice) && (
                              <del className="text-[9px] sm:text-[11px] text-slate-400 font-bold">
                                ₹{mrpPrice}
                              </del>
                            )}
                          </div>
                        </div>

                        {discountText && discountText !== "0%" && discountText !== "0% OFF" && (
                          <span className="text-[8px] sm:text-[10px] bg-emerald-50 text-emerald-600 font-black px-1.5 py-0.5 rounded-md">
                            {discountText}
                          </span>
                        )}
                      </div>

                      {/* View Details Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(product);
                        }}
                        className={`mt-4 w-full py-2 sm:py-3 px-4 text-white text-[10px] sm:text-xs font-bold rounded-xl sm:rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5 ${isAvailable
                            ? 'bg-gradient-to-r from-[#3d3f96] to-[#5a5dbd] hover:from-[#2d2f75] hover:to-[#4a4d9e] shadow-indigo-100/50 hover:shadow-lg active:scale-95'
                            : 'bg-slate-400 hover:bg-slate-500 shadow-slate-100'
                          }`}
                      >
                        <Info size={14} className="sm:w-3.5 sm:h-3.5" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* --- LOAD MORE PAGINATION BUTTON --- */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                disabled={loadingMore}
                onClick={() => setPage((prev) => prev + 1)}
                className="bg-white hover:bg-slate-50 text-[#3d3f96] border border-[#3d3f96]/20 py-3.5 px-8 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed select-none"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span>Loading More...</span>
                  </>
                ) : (
                  <span>Load More Medicines</span>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        // Empty State
        <div className="py-20 text-center bg-white rounded-[2rem] sm:rounded-[3rem] border-2 border-dashed border-slate-100">
          <Pill size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-500 font-bold px-4">
            {pharmacyId ? "No in-stock medicines listed by this pharmacy store." : "No medicines found matching your criteria."}
          </p>
        </div>
      )}
    </div>
  );
};

export default AllMedicines;