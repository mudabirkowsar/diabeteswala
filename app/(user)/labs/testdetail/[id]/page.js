"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  Beaker,
  Droplets,
  Clock,
  MapPin,
  Star,
  CheckCircle2,
  Building2,
  Home,
  Zap,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Loader2,
  X,
  FileText,
  HelpCircle,
  Sparkles,
  Info
} from 'lucide-react';
import UserAPI from '../../../../services/UserAPI'; // Adjust relative path as needed
import { useNotification } from '../../../../context/NotificationContext'; // Adjust relative path as needed
import { useCart } from '../../../../context/CartContext'; // Adjust relative path as needed

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

export default function LabTestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showNotification } = useNotification();
  const testId = params?.id;

  // Cart Context Operations
  const {
    labCart,
    addToLabCart,
    updateLabItemQuantity,
    removeLabCartItem,
    clearLabCart,
    loading: cartLoading
  } = useCart();

  // Page States
  const [testDetails, setTestDetails] = useState(null);
  const [availableLabs, setAvailableLabs] = useState([]);
  const [selectedLab, setSelectedLab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Local quantity staged before cart push
  const [localQuantity, setLocalQuantity] = useState(1);

  // In-line Conflict & Radiology Warning States
  const [conflictDetected, setConflictDetected] = useState(false);
  const [radiologyModalOpen, setRadiologyModalOpen] = useState(false);
  const [radiologyMessage, setRadiologyMessage] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch Test Details & Labs
  useEffect(() => {
    if (!testId) return;

    const loadTestDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Retrieve user coordinates if available
        let lat = null;
        let lng = null;
        if (typeof window !== "undefined") {
          const savedCoords = localStorage.getItem("userCoords");
          if (savedCoords) {
            try {
              const parsed = JSON.parse(savedCoords);
              lat = parsed.lat;
              lng = parsed.lng;
            } catch (e) {
              console.error("Error reading saved GPS coords:", e);
            }
          }
        }

        const response = await UserAPI.getMasterTestDetails(testId, { lat, lng });

        if (response && response.success && response.data) {
          setTestDetails(response.data.testDetails || null);
          const labs = response.data.availableInLabs || [];
          setAvailableLabs(labs);

          // Auto-select nearest lab by default
          if (labs.length > 0) {
            setSelectedLab(labs[0]);
          }
        } else {
          setError(response?.message || "Diagnostic test details not found.");
        }
      } catch (err) {
        console.error("Error fetching master test details:", err);
        setError("Unable to load test details from the server.");
        if (showNotification) {
          showNotification(err.message || "Failed to load test details.", "error");
        }
      } finally {
        setLoading(false);
      }
    };

    loadTestDetails();
  }, [testId, showNotification]);

  // Image URL Sanitizer
  const getSanitizedImageUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=400&auto=format&fit=crop";
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    let cleanPath = path.replace(/\\/g, '/').replace(/^public\//, '');
    if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);
    return `${BASE_URL}/${cleanPath}`;
  };

  // --- CART & LAB RELATIONSHIP LOGIC ---
  const currentCartLabId = typeof labCart?.labId === 'object' ? labCart?.labId?._id : labCart?.labId;
  const hasCartItems = (labCart?.items?.length || 0) > 0;
  const isSameLabInCart = currentCartLabId?.toString() === selectedLab?.labId?.toString();
  
  // Detect if selected lab conflicts with the current active lab in cart
  const isDifferentLab = hasCartItems && currentCartLabId && !isSameLabInCart;
  const isConflictLab = isDifferentLab || conflictDetected;

  // Selected lab inventory item ID
  const activeItemId = selectedLab?.labTestId;

  // Find item if existing in cart
  const cartItem = isSameLabInCart
    ? labCart?.items?.find(item => item.itemId?.toString() === activeItemId?.toString())
    : null;

  const isInCart = !!cartItem;
  const effectiveQuantity = isInCart ? cartItem.quantity : localQuantity;

  // --- CART HANDLERS ---

  // 1. Standard Add to Cart Request
  const handleAddToCart = async () => {
    if (!selectedLab) {
      if (showNotification) showNotification("Please choose a laboratory first.", "error");
      return;
    }

    const payload = {
      labId: selectedLab.labId,
      itemId: selectedLab.labTestId,
      productType: "LabTest",
      forceReplace: false,
      confirmRadiologyBypass: false
    };

    try {
      setActionLoading(true);
      const res = await addToLabCart(payload);

      if (res && res.success) {
        if (showNotification) showNotification("Test added to your lab cart!", "success");
        router.push('/otherscreens/carts/labcart');
      } else if (res && res.canReplace) {
        // Switch the button in-place to "Replace Cart & Add" without opening a modal
        setConflictDetected(true);
      } else if (res && res.confirmRadiologyBypass) {
        setRadiologyMessage(res.message || "Radiology scan walk-in warning.");
        setRadiologyModalOpen(true);
      } else {
        if (showNotification) showNotification(res?.message || "Failed to add test to cart.", "error");
      }
    } catch (err) {
      console.error("Add to lab cart error:", err);
      if (showNotification) showNotification("Could not add item to cart.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Button Action: Replace Cart & Add (forceReplace: true)
  const handleReplaceAndAdd = async () => {
    if (!selectedLab) return;

    try {
      setActionLoading(true);
      const payload = {
        labId: selectedLab.labId,
        itemId: selectedLab.labTestId,
        productType: "LabTest",
        forceReplace: true
      };

      const res = await addToLabCart(payload);
      if (res && res.success) {
        setConflictDetected(false);
        if (showNotification) {
          showNotification(`Cleared previous items. Added test from "${selectedLab.name}"!`, "success");
        }
        router.push('/otherscreens/carts/labcart');
      } else if (res && res.confirmRadiologyBypass) {
        setRadiologyMessage(res.message || "Radiology scan walk-in warning.");
        setRadiologyModalOpen(true);
      } else {
        if (showNotification) showNotification(res?.message || "Failed to replace cart.", "error");
      }
    } catch (err) {
      console.error("Replace cart error:", err);
      if (showNotification) showNotification("Failed to replace cart.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Radiology Bypass Confirmation
  const handleConfirmRadiologyBypass = async () => {
    try {
      setActionLoading(true);
      const payload = {
        labId: selectedLab.labId,
        itemId: selectedLab.labTestId,
        productType: "LabTest",
        forceReplace: isConflictLab,
        confirmRadiologyBypass: true
      };

      const res = await addToLabCart(payload);
      if (res && res.success) {
        if (showNotification) showNotification("Added radiology scan (Walk-in only applied).", "success");
        setRadiologyModalOpen(false);
        router.push('/otherscreens/carts/labcart');
      } else {
        if (showNotification) showNotification(res?.message || "Failed to proceed with scan.", "error");
      }
    } catch (err) {
      console.error("Radiology bypass error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Quantity Stepper Increment
  const handleIncrement = async () => {
    if (isInCart) {
      try {
        await updateLabItemQuantity(selectedLab.labTestId, 'inc');
      } catch (err) {
        console.error("Failed to increment quantity:", err);
      }
    } else {
      setLocalQuantity(prev => prev + 1);
    }
  };

  // Quantity Stepper Decrement
  const handleDecrement = async () => {
    if (isInCart) {
      try {
        if (effectiveQuantity <= 1) {
          await removeLabCartItem(selectedLab.labTestId);
          setLocalQuantity(1);
          if (showNotification) showNotification("Item removed from cart.", "success");
        } else {
          await updateLabItemQuantity(selectedLab.labTestId, 'dec');
        }
      } catch (err) {
        console.error("Failed to decrement quantity:", err);
      }
    } else {
      setLocalQuantity(prev => Math.max(1, prev - 1));
    }
  };

  // Remove directly from cart
  const handleRemoveFromCart = async () => {
    try {
      await removeLabCartItem(selectedLab.labTestId);
      setLocalQuantity(1);
      if (showNotification) showNotification("Test removed from your cart.", "success");
    } catch (err) {
      console.error("Failed to remove item:", err);
    }
  };

  // --- Render Loading Skeleton ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 rounded-2xl bg-[#3d3f96]/10 flex items-center justify-center">
          <Loader2 className="animate-spin text-[#3d3f96]" size={32} />
        </div>
        <p className="text-slate-800 text-sm font-bold mt-4 tracking-tight">Fetching Diagnostic Profile</p>
        <p className="text-slate-400 text-xs font-medium mt-1">Locating nearby NABL accredited labs...</p>
      </div>
    );
  }

  // --- Render Error State ---
  if (error || !testDetails) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mb-4">
          <AlertCircle className="text-rose-500" size={32} />
        </div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Test Profile Unavailable</h1>
        <p className="text-slate-500 text-xs mt-2 max-w-sm">{error || "Requested lab test could not be found."}</p>
        <button
          onClick={() => router.back()}
          className="mt-6 inline-flex items-center gap-2 bg-[#3d3f96] hover:bg-[#323480] text-white px-6 py-3 rounded-xl font-bold text-xs transition-all shadow-md active:scale-95"
        >
          <ArrowLeft size={14} /> Return to Tests Directory
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-6 sm:py-8 antialiased text-slate-800">
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* --- BREADCRUMB STRIP --- */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6 overflow-x-auto whitespace-nowrap pb-1 scrollbar-none">
          <button 
            onClick={() => router.back()} 
            className="hover:text-slate-700 flex items-center gap-1.5 transition-colors py-1 px-2 -ml-2 rounded-lg hover:bg-slate-200/50"
          >
            <ArrowLeft size={13} /> Back
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-500">Diagnostic Tests</span>
          <ChevronRight size={12} className="text-slate-300" />
          <span className="text-slate-500">{testDetails.mainCategory || "Pathology"}</span>
          <ChevronRight size={12} className="text-slate-300" />
          <span className="text-[#3d3f96] font-bold truncate max-w-[260px]">{testDetails.testName}</span>
        </div>

        {/* --- PRIMARY SECTION: CLINICAL DETAILS & LAB SELECTOR --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-10">

          {/* Left Column: Test Monograph & Available Labs (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">

            {/* Test Header Monograph */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-100/60 px-3 py-1 rounded-full text-[10px] font-extrabold text-[#3d3f96] uppercase tracking-wider">
                  <Beaker size={11} /> {testDetails.mainCategory || "Pathology"}
                </span>
                {testDetails.category && (
                  <span className="bg-slate-100 px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-600">
                    {testDetails.category}
                  </span>
                )}
                {testDetails.testCode && (
                  <span className="bg-amber-50 border border-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-[10px] font-bold">
                    Code: {testDetails.testCode}
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {testDetails.testName}
                </h1>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  Applicable Gender: <span className="text-slate-700 font-bold">{testDetails.gender || "Both"}</span>
                </p>
              </div>

              {/* Sample & Preparation Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-start gap-2.5">
                  <Droplets size={16} className="text-rose-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Specimen Sample</p>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">{testDetails.sampleType || "Blood Sample"}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-start gap-2.5">
                  <Clock size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Pre-test Preparation</p>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">
                      {testDetails.pretestPreparation || "No special fasting required"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Diagnostic Parameters Tag Cloud */}
              {testDetails.parameters && testDetails.parameters.length > 0 && (
                <div className="pt-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <FileText size={12} /> Biomarkers &amp; Parameters Evaluated ({testDetails.parameters.length}):
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {testDetails.parameters.map((param, idx) => (
                      <span key={idx} className="bg-indigo-50 text-[#3d3f96] border border-indigo-100/60 text-xs font-bold px-3 py-1 rounded-xl">
                        {param}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Available Laboratories Listing */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Building2 size={18} className="text-[#3d3f96]" />
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">Available Diagnostic Labs</h2>
                </div>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                  {availableLabs.length} {availableLabs.length === 1 ? 'Lab' : 'Labs'} Nearby
                </span>
              </div>

              {availableLabs.length > 0 ? (
                <div className="space-y-3">
                  {availableLabs.map((lab) => {
                    const isSelected = selectedLab?.labId === lab.labId;

                    return (
                      <div
                        key={lab.labId}
                        onClick={() => {
                          setSelectedLab(lab);
                          setLocalQuantity(1);
                          setConflictDetected(false); // reset warning state on new selection
                        }}
                        className={`w-full p-4 rounded-2xl transition-all duration-200 border cursor-pointer relative ${
                          isSelected
                            ? 'border-[#3d3f96] bg-indigo-50/20 shadow-sm ring-1 ring-[#3d3f96]'
                            : 'border-slate-200/70 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          {/* Lab Info */}
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-100 bg-slate-50 flex items-center justify-center p-1">
                              <img
                                src={getSanitizedImageUrl(lab.image)}
                                alt={lab.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-2 truncate">
                                <p className="font-bold text-sm text-slate-900 truncate">{lab.name}</p>
                                {lab.rating && (
                                  <span className="flex items-center gap-1 text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 shrink-0">
                                    <Star size={10} fill="currentColor" className="text-amber-500" /> {lab.rating}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mt-0.5 truncate">
                                <MapPin size={11} className="text-emerald-500 shrink-0" />
                                <span className="truncate">{lab.address}</span>
                                {lab.distance && (
                                  <span>• {lab.distance} km away</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Price & Discount */}
                          <div className="flex flex-col items-end shrink-0">
                            <div className="flex items-baseline gap-1.5">
                              <span className="font-extrabold text-base text-slate-900 leading-none">
                                ₹{lab.discountPrice || lab.amount}
                              </span>
                              {lab.amount > lab.discountPrice && (
                                <span className="text-[11px] font-semibold text-slate-400 line-through">
                                  ₹{lab.amount}
                                </span>
                              )}
                            </div>
                            {lab.discount > 0 && (
                              <span className="text-[9px] font-bold bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded mt-1 uppercase">
                                {lab.discount}% OFF
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Badges: Home Collection, Express Report */}
                        <div className="flex flex-wrap items-center gap-2 mt-3 pt-2.5 border-t border-slate-100 text-[11px] font-semibold">
                          {lab.isHomeCollection ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              <Home size={11} /> Home Collection Available
                            </span>
                          ) : (
                            <span className="text-slate-400">Walk-in Center Only</span>
                          )}

                          {lab.isRapid && (
                            <span className="inline-flex items-center gap-1 text-[#3d3f96] bg-indigo-50 px-2 py-0.5 rounded font-bold">
                              <Zap size={11} className="fill-[#3d3f96]" /> Express 6-Hour Report
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-slate-50 border border-dashed border-slate-200 p-8 text-center rounded-2xl">
                  <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600">No partner labs currently service this test in your radius.</p>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Checkout & Cart Controller (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-5 sticky top-6">
            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider border-b border-slate-100 pb-2.5">
              Booking &amp; Sample Summary
            </p>

            {selectedLab ? (
              <div className="space-y-4">
                {/* Selected Lab Card */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-[#3d3f96] uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
                    Selected Laboratory
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-2">{selectedLab.name}</p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">{selectedLab.address}</p>

                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200/70">
                    <span className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                      {selectedLab.isHomeCollection ? (
                        <>
                          <Home size={13} className="text-emerald-600" />
                          <span>Home Collection</span>
                        </>
                      ) : (
                        <>
                          <Building2 size={13} className="text-slate-400" />
                          <span>Center Visit Only</span>
                        </>
                      )}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      Distance: {selectedLab.distance || '0'} km
                    </span>
                  </div>
                </div>

                {/* Subtotal Calculation Box */}
                <div className="flex justify-between items-end bg-[#3d3f96]/5 border border-[#3d3f96]/10 p-4 rounded-2xl">
                  <div>
                    <span className="text-[10px] text-[#3d3f96] font-bold uppercase tracking-wider">
                      Total Test Fee
                    </span>
                    <p className="text-2xl font-extrabold text-slate-900 mt-0.5 leading-none">
                      ₹{(selectedLab.discountPrice || selectedLab.amount) * effectiveQuantity}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-100">
                    ₹{selectedLab.discountPrice || selectedLab.amount} × {effectiveQuantity} patient{effectiveQuantity > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Stepper & CTA Action Block */}
                <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                  {/* Quantity Stepper */}
                  <div className="flex items-center justify-between border border-slate-200 rounded-xl p-1 bg-slate-50 w-full sm:w-max shrink-0">
                    <button
                      onClick={handleDecrement}
                      disabled={cartLoading || actionLoading || (!isInCart && effectiveQuantity <= 1)}
                      className="p-2.5 bg-white text-slate-700 hover:text-[#3d3f96] rounded-lg shadow-sm transition-all disabled:opacity-40"
                    >
                      <Minus size={13} className="stroke-[2.5]" />
                    </button>

                    <span className="text-xs font-bold text-slate-800 px-4 select-none min-w-[2.2rem] text-center">
                      {cartLoading || actionLoading ? (
                        <Loader2 size={13} className="animate-spin text-[#3d3f96] inline-block" />
                      ) : (
                        effectiveQuantity
                      )}
                    </span>

                    <button
                      onClick={handleIncrement}
                      disabled={cartLoading || actionLoading}
                      className="p-2.5 bg-white text-slate-700 hover:text-[#3d3f96] rounded-lg shadow-sm transition-all disabled:opacity-40"
                    >
                      <Plus size={13} className="stroke-[2.5]" />
                    </button>
                  </div>

                  {/* Dynamic CTA Button: Remove, Replace & Add, or Add */}
                  {isInCart ? (
                    <button
                      onClick={handleRemoveFromCart}
                      disabled={cartLoading || actionLoading}
                      className="w-full flex-1 py-3.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Trash2 size={15} />
                      <span>Remove Test</span>
                    </button>
                  ) : isConflictLab ? (
                    /* In-place button to Replace existing lab cart with this selection */
                    <button
                      onClick={handleReplaceAndAdd}
                      disabled={cartLoading || actionLoading}
                      className="w-full flex-1 py-3.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {actionLoading ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          <span>Replacing Cart...</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={15} />
                          <span>Replace Cart &amp; Add</span>
                        </>
                      )}
                    </button>
                  ) : (
                    /* Default Add to Cart Button */
                    <button
                      onClick={handleAddToCart}
                      disabled={cartLoading || actionLoading}
                      className="w-full flex-1 py-3.5 bg-[#3d3f96] hover:bg-[#323480] text-white text-xs font-bold rounded-xl shadow-md shadow-[#3d3f96]/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {actionLoading ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          <span>Checking Lab...</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={15} />
                          <span>Book &amp; Add To Cart</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Subtle helper note when replacing lab items */}
                {isConflictLab && !isInCart && (
                  <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200/70 rounded-xl p-2.5 font-medium flex items-center gap-1.5">
                    <AlertTriangle size={13} className="text-amber-500 shrink-0" />
                    <span>Your cart contains tests from another lab. Clicking <strong>Replace Cart &amp; Add</strong> will clear them and start with this lab.</span>
                  </p>
                )}

                <div className="pt-2 text-center">
                  <p className="text-[11px] text-slate-400 font-medium">
                    100% Secure • Certified Phlebotomists • Digital Reports
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-xs font-medium text-slate-400">Choose a lab from the list to book this test.</p>
              </div>
            )}
          </div>

        </div>

        {/* --- SECONDARY SECTION: MEDICAL GUIDANCE & FAQS TABS --- */}
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm mt-8">
          <div className="flex border-b border-slate-200/70 overflow-x-auto scrollbar-none bg-slate-50/70 p-1.5 gap-1">
            {[
              { id: "overview", label: "Clinical Overview", icon: FileText },
              { id: "faqs", label: "Patient FAQs", icon: HelpCircle }
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

          <div className="p-6 sm:p-8 min-h-[160px]">
            {activeTab === "overview" && (
              <div className="space-y-5">
                {testDetails.detailedDescription && testDetails.detailedDescription.length > 0 ? (
                  testDetails.detailedDescription.map((sec) => (
                    <div key={sec._id || sec.sectionTitle}>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                        {sec.sectionTitle}
                      </h3>
                      <p className="text-sm font-medium text-slate-700 leading-relaxed">
                        {sec.sectionContent}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 font-medium">Standard medical monograph applies for this test.</p>
                )}
              </div>
            )}

            {activeTab === "faqs" && (
              <div className="space-y-4">
                {testDetails.faqs && testDetails.faqs.length > 0 ? (
                  testDetails.faqs.map((faq, i) => (
                    <div key={faq._id || i} className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                      <h4 className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                        <Info size={13} className="text-[#3d3f96]" /> {faq.question}
                      </h4>
                      <p className="text-xs font-medium text-slate-600 leading-relaxed mt-1">
                        {faq.answer}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 font-medium">No frequently asked questions listed for this test.</p>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* --- RADIOLOGY SCAN WARNING MODAL (`confirmRadiologyBypass`) --- */}
      {radiologyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => !actionLoading && setRadiologyModalOpen(false)}
          />

          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-100 relative z-10 flex flex-col items-center text-center">
            {!actionLoading && (
              <button
                onClick={() => setRadiologyModalOpen(false)}
                className="absolute top-4 right-4 bg-slate-100 text-slate-500 hover:bg-slate-200 p-1.5 rounded-full"
              >
                <X size={15} />
              </button>
            )}

            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-[#3d3f96] flex items-center justify-center mb-3">
              <Building2 size={24} />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Radiology Walk-in Notice</h3>
            <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
              {radiologyMessage || "This is a Radiology/Imaging scan (X-Ray, CT, MRI, Ultrasound). Home collection cannot be performed for this service."}
            </p>
            <div className="bg-amber-50 border border-amber-200/70 p-3 rounded-xl mt-3 text-left">
              <p className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                <AlertCircle size={13} className="text-amber-600 shrink-0" />
                Home Collection Will Be Disabled
              </p>
              <p className="text-[10px] text-amber-800/80 mt-0.5">
                Adding this item requires an in-person physical center visit for your entire order.
              </p>
            </div>

            <div className="flex gap-2.5 w-full mt-5">
              <button
                disabled={actionLoading}
                onClick={() => setRadiologyModalOpen(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleConfirmRadiologyBypass}
                className="flex-1 py-3 bg-[#3d3f96] hover:bg-[#323480] text-white font-bold text-xs rounded-xl shadow-md shadow-[#3d3f96]/20 flex items-center justify-center gap-1.5 active:scale-95"
              >
                {actionLoading ? <Loader2 size={13} className="animate-spin" /> : <span>Agree &amp; Walk-in</span>}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}