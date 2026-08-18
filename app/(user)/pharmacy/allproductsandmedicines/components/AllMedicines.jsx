"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Star, Info, AlertCircle, Pill, ShieldCheck, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import UserAPI from '../../../../services/UserAPI'; // Adjust relative path as needed
import { useNotification } from '../../../../context/NotificationContext'; // Adjust path as needed

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
  const { showNotification } = useNotification();

  // Category and Product States
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);

  // Pagination States
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // UI Load & Error States
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState(false);

  // Fetch Categories on Mount
  useEffect(() => {
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
  }, []);

  // Reset pagination state when a new category is selected
  useEffect(() => {
    setPage(1);
    setProducts([]);
    setHasMore(false);
  }, [selectedCategory]);

  // Fetch Products whenever selectedCategory, page, pharmacyId, or searchQuery changes
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (page === 1) {
          setLoadingProducts(true);
        } else {
          setLoadingMore(true);
        }
        setError(false);

        // Build API query params
        const params = {
          page: page,
          limit: 20
        };

        if (selectedCategory) {
          params.category = selectedCategory;
        }

        const res = await UserAPI.getAllProducts(params);
        if (res && res.success) {
          const fetchedData = res.data || [];
          setProducts((prev) => (page === 1 ? fetchedData : [...prev, ...fetchedData]));
          setHasMore(res.currentPage < res.totalPages);
        } else {
          setError(true);
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
  }, [selectedCategory, page, showNotification]);

  // Handle Client-Side Search Query Filtering on Retrieved Products
  const filteredProducts = products.filter((product) => {
    const matchesPharmacy = pharmacyId ? product.pharmacyId === pharmacyId : true;

    const searchLower = searchQuery ? searchQuery.toLowerCase() : "";
    const matchesSearch = !searchQuery ||
      product.name?.toLowerCase().includes(searchLower) ||
      product.manufacturers?.toLowerCase().includes(searchLower) ||
      product.salt_composition?.toLowerCase().includes(searchLower);

    return matchesPharmacy && matchesSearch;
  });

  // Resolve Product Image
  const getProductImage = (item, index) => {
    if (item.image_url && item.image_url.length > 0) {
      return item.image_url[0];
    }
    return STATIC_FALLBACK_IMAGES[index % STATIC_FALLBACK_IMAGES.length];
  };

  // Helper dynamic metadata resolvers to fit original premium visual layout
  const getFormFactor = (item) => {
    if (item.bread_crumb) {
      const parts = item.bread_crumb.split('>');
      return parts[parts.length - 1].trim(); // Extract subcategory
    }
    return "Tablet";
  };
  // Click handler to redirect to specific details page
  const handleCardClick = (product) => {
    const productId = product._id || product.Id;
    if (productId) {
      router.push(`/pharmacy/productdetail/${productId}`);
    }
  };

  return (
    <div className="space-y-8">

      {/* --- CATEGORIES PILLED SELECTOR BAR --- */}
      {!loadingCategories && categories.length > 0 && (
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
        // Loading State: Render visual card skeletons matching layout
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
          <p className="text-slate-400 text-xs mt-1">Please try refreshing your browser or changing selection</p>
        </div>
      ) : filteredProducts.length > 0 ? (
        // Active Medicines List
        <div className="space-y-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product, index) => {
              const hasRx = product.prescription_required === "YES";
              const currentImg = getProductImage(product, index);
              const formFactor = getFormFactor(product);
              const displayDiscount = product.discont_percent || `${product.discountPercentage}% OFF`;

              return (
                <div
                  key={product._id || product.Id || index}
                  onClick={() => handleCardClick(product)}
                  className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 p-1.5 sm:p-2 shadow-sm hover:shadow-xl transition-all duration-500 group flex flex-col justify-between overflow-hidden cursor-pointer"
                >
                  <div>
                    {/* Product Image Area */}
                    <div className="relative h-36 sm:h-52 rounded-[1rem] sm:rounded-[2rem] overflow-hidden bg-slate-50">
                      <img
                        src={currentImg}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />

                      {hasRx && (
                        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-amber-500 text-white text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg shadow-lg flex items-center gap-1">
                          <AlertCircle size={8} className="sm:w-2.5 sm:h-2.5" /> RX REQUIRED
                        </div>
                      )}
                    </div>

                    {/* Product Details Section */}
                    <div className="p-3 sm:p-5">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[65%]">
                          {product.manufacturers || "General Healthcare"}
                        </p>
                        <span className="text-[8px] sm:text-[9px] font-bold text-[#3d3f96] bg-indigo-50/60 px-1.5 py-0.5 rounded-md shrink-0 truncate max-w-[35%]">
                          {formFactor}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-black text-slate-800 mt-1 sm:mt-1.5 group-hover:text-[#3d3f96] transition-colors line-clamp-1" title={product.name}>
                        {product.name}
                      </h3>

                      <p className="text-[8px] sm:text-[10px] text-slate-500 font-medium mt-1 truncate">
                        Active: {product.salt_composition || "OTC Formulation"}
                      </p>
                      <p className="text-[8px] sm:text-[10px] text-slate-400 font-bold mt-0.5">
                        Pack: {product.packaging || "1 unit"}
                      </p>
                    </div>
                  </div>

                  {/* Price & Action Section at Bottom */}
                  <div className="px-3 pb-3 sm:px-5 sm:pb-5 pt-0 mt-auto">
                    <div className="border-t border-slate-50 pt-3">

                      {/* Pricing Block */}
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Price</p>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-base sm:text-xl font-black text-slate-900 leading-none">
                              ₹{product.best_price}
                            </span>
                            {parseFloat(product.mrp) > parseFloat(product.best_price) && (
                              <span className="text-[9px] sm:text-[11px] text-slate-400 line-through font-bold">
                                ₹{product.mrp}
                              </span>
                            )}
                          </div>
                        </div>

                        {product.discont_percent && product.discont_percent !== "0%" && (
                          <span className="text-[8px] sm:text-[10px] bg-red-50 text-red-500 font-extrabold px-1.5 py-0.5 rounded-md">
                            {displayDiscount}
                          </span>
                        )}
                      </div>

                      {/* View Details Linear Gradient Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(product);
                        }}
                        className="mt-4 w-full py-2 sm:py-3 px-4 bg-gradient-to-r from-[#3d3f96] to-[#5a5dbd] hover:from-[#2d2f75] hover:to-[#4a4d9e] text-white text-[10px] sm:text-xs font-bold rounded-xl sm:rounded-2xl shadow-md shadow-indigo-100/50 hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5"
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

          {/* --- LOAD MORE BUTTON --- */}
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
        // Empty State: Matches styling rules
        <div className="py-20 text-center bg-white rounded-[2rem] sm:rounded-[3rem] border-2 border-dashed border-slate-100">
          <Pill size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-500 font-bold px-4">No medicines found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default AllMedicines;