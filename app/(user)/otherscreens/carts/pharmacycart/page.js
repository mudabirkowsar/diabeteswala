"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  Truck,
  ChevronRight,
  AlertCircle,
  Loader2,
  Store,
  Sparkles,
  Tag,
  CheckCircle2,
  FileText,
  X,
  CreditCard
} from 'lucide-react';
import { useCart } from '../../../../context/CartContext';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";
const FREE_SHIPPING_THRESHOLD = 500;

const CartPage = () => {
  const {
    pharmacyCart,
    pharmacyCartTotal,
    updatePharmacyItemQuantity,
    removePharmacyItem,
    clearPharmacyCart,
    loading
  } = useCart();

  // State for promo code
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [isClearing, setIsClearing] = useState(false);
  const [itemProcessingId, setItemProcessingId] = useState(null);

  // Helper to format image paths
  const getSanitizedImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith('http://') || path.startsWith('https://')) return path;

    let cleanPath = path.replace(/\\/g, '/');
    cleanPath = cleanPath.replace(/^public\//, '');
    if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.substring(1);
    }
    return `${BASE_URL}/${cleanPath}`;
  };

  const getProductImage = (item, index) => {
    if (item.medicineId?.image) {
      return getSanitizedImageUrl(item.medicineId.image);
    }
    if (item.image) {
      return getSanitizedImageUrl(item.image);
    }
    if (item.medicineId?.image_url && item.medicineId.image_url.length > 0) {
      return getSanitizedImageUrl(item.medicineId.image_url[0]);
    }
    const fallbackImages = [
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1628771065518-0d82f1938462?q=80&w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?q=80&w=400&auto=format&fit=crop"
    ];
    return fallbackImages[index % fallbackImages.length];
  };

  // Quantity mutation sync handler
  const handleQuantityUpdate = async (item, delta) => {
    const medId = item.medicineId?._id || item.medicineId;
    if (!medId || itemProcessingId) return;

    setItemProcessingId(medId);
    try {
      if (delta === -1 && item.quantity <= 1) {
        await removePharmacyItem(medId);
      } else {
        const action = delta === 1 ? 'inc' : 'dec';
        await updatePharmacyItemQuantity(medId, action, item.isComboApplied || false);
      }
    } finally {
      setItemProcessingId(null);
    }
  };

  // Item deletion sync handler
  const handleItemRemoval = async (item) => {
    const medId = item.medicineId?._id || item.medicineId;
    if (!medId || itemProcessingId) return;

    setItemProcessingId(medId);
    try {
      await removePharmacyItem(medId);
    } finally {
      setItemProcessingId(null);
    }
  };

  // Handle Promo Code Apply
  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoError("");
    const code = promoInput.trim().toUpperCase();

    if (!code) return;

    if (code === "SAVE10") {
      setAppliedPromo({ code: "SAVE10", discountPercent: 10 });
      setPromoInput("");
    } else if (code === "FLAT50") {
      setAppliedPromo({ code: "FLAT50", flatDiscount: 50 });
      setPromoInput("");
    } else {
      setPromoError("Invalid promotional code");
    }
  };

  const cartItems = pharmacyCart?.items || [];
  const subtotal = pharmacyCartTotal || 0;

  // Check if any item in cart requires prescription
  const hasPrescriptionItems = cartItems.some(
    (item) =>
      item.medicineId?.prescription_required === "YES" ||
      item.medicineId?.prescriptionRequired === "YES" ||
      item.prescriptionRequired === "YES"
  );

  // Discount calculation
  let promoDiscount = 0;
  if (appliedPromo) {
    if (appliedPromo.discountPercent) {
      promoDiscount = Math.round((subtotal * appliedPromo.discountPercent) / 100);
    } else if (appliedPromo.flatDiscount) {
      promoDiscount = Math.min(appliedPromo.flatDiscount, subtotal);
    }
  }

  // Dynamic Shipping Fees
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0;
  const shippingFee = isFreeShipping ? 0 : 40;
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const finalTotal = Math.max(0, subtotal - promoDiscount + shippingFee);

  return (
    <main className="min-h-screen bg-[#f8fbff] pt-4 sm:pt-8 pb-24 antialiased">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* --- 1. HEADER SECTION --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b border-slate-100">
          <div>
            <Link
              href="/pharmacy"
              className="inline-flex items-center gap-2 text-[#3d3f96] hover:text-[#2d2f75] font-black text-xs uppercase tracking-wider transition-colors mb-2"
            >
              <ArrowLeft size={16} /> Back to Catalog
            </Link>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Order <span className="text-[#3d3f96]">Cart</span>
            </h1>

            {pharmacyCart?.pharmacyId && (
              <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-white border border-slate-200/70 rounded-full shadow-sm text-xs font-bold text-slate-600">
                <Store size={14} className="text-[#3d3f96] shrink-0" />
                <span className="truncate max-w-[200px] sm:max-w-md">
                  {pharmacyCart.pharmacyId.name}
                  {pharmacyCart.pharmacyId.city ? ` (${pharmacyCart.pharmacyId.city})` : ""}
                </span>
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="flex items-center justify-between sm:justify-end gap-3">
              <span className="text-xs font-bold text-slate-400 bg-white px-3 py-1.5 rounded-xl border border-slate-200/60 shadow-sm flex items-center gap-1.5">
                <ShoppingBag size={14} className="text-[#3d3f96]" /> {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
              </span>

              <button
                onClick={() => setIsClearing(true)}
                className="text-xs font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 border border-transparent hover:border-rose-100"
              >
                <Trash2 size={13} /> Clear All
              </button>
            </div>
          )}
        </div>

        {/* --- LOADING SCREEN --- */}
        {loading && cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 sm:py-36 bg-white rounded-[2rem] sm:rounded-[3rem] border border-slate-100 shadow-sm">
            <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={40} />
            <p className="text-slate-500 text-sm font-bold">Synchronizing cart items...</p>
          </div>
        ) : cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

            {/* --- LEFT SECTION: CART ITEMS LIST (8 COLUMNS) --- */}
            <div className="lg:col-span-8 space-y-4">

              {/* Free Delivery Milestone Indicator */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Truck size={16} className="text-[#3d3f96]" />
                    {isFreeShipping ? (
                      <span className="text-emerald-600 font-black">You qualify for FREE Delivery!</span>
                    ) : (
                      <span>
                        Add <strong className="text-slate-900 font-black">₹{amountToFreeShipping}</strong> more to unlock <span className="text-[#3d3f96] font-black">FREE Express Shipping</span>
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-black text-slate-400">
                    {Math.round(freeShippingProgress)}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#3d3f96] to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>

              {/* Prescription Alert Banner if Rx is needed */}
              {hasPrescriptionItems && (
                <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl sm:rounded-3xl p-4 flex items-start gap-3">
                  <div className="p-2 bg-amber-500 text-white rounded-xl shrink-0 mt-0.5">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-amber-900">
                      Doctor's Prescription Required
                    </h4>
                    <p className="text-[11px] sm:text-xs font-medium text-amber-700 mt-0.5">
                      One or more items in your cart require a valid prescription. You will be prompted to attach it during the final checkout stage.
                    </p>
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-3 sm:space-y-4">
                <AnimatePresence initial={false}>
                  {cartItems.map((item, index) => {
                    const medId = item.medicineId?._id || item.medicineId;
                    const hasRx =
                      item.medicineId?.prescription_required === "YES" ||
                      item.medicineId?.prescriptionRequired === "YES" ||
                      item.prescriptionRequired === "YES";
                    const itemBrand = item.medicineId?.manufacturers || "Verified Partner";
                    const itemImg = getProductImage(item, index);
                    const isMutating = itemProcessingId === medId;

                    return (
                      <motion.div
                        key={item._id || medId || index}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                        className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 relative overflow-hidden"
                      >
                        {/* Thumbnail */}
                        <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0 mx-auto sm:mx-0">
                          <img
                            src={itemImg}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          {hasRx && (
                            <span className="absolute top-1 left-1 bg-rose-500 text-white text-[7.5px] font-black px-1.5 py-0.5 rounded shadow">
                              Rx
                            </span>
                          )}
                        </div>

                        {/* Middle Info Details */}
                        <div className="flex-1 min-w-0 w-full sm:w-auto text-left">
                          <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                              {itemBrand}
                            </span>
                            {item.isComboApplied && (
                              <span className="inline-flex items-center gap-1 text-[8px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                <Sparkles size={9} /> BOGO Deal Applied
                              </span>
                            )}
                          </div>

                          <h3 className="text-sm sm:text-base font-black text-slate-900 truncate" title={item.name}>
                            {item.name}
                          </h3>

                          <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                            Unit Price: <span className="text-slate-700">₹{item.price}</span>
                          </p>

                          {/* Stepper & Mobile Price Controls */}
                          <div className="flex items-center justify-between sm:justify-start gap-4 mt-3">
                            {/* Stepper */}
                            <div className="flex items-center bg-slate-50 border border-slate-200/70 rounded-xl p-1 shadow-inner">
                              <button
                                disabled={isMutating}
                                onClick={() => handleQuantityUpdate(item, -1)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-40"
                              >
                                <Minus size={13} />
                              </button>
                              <span className="w-8 text-center text-xs font-black text-slate-800">
                                {isMutating ? <Loader2 size={12} className="animate-spin mx-auto text-[#3d3f96]" /> : item.quantity}
                              </span>
                              <button
                                disabled={isMutating}
                                onClick={() => handleQuantityUpdate(item, 1)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-40"
                              >
                                <Plus size={13} />
                              </button>
                            </div>

                            {/* Remove button */}
                            <button
                              disabled={isMutating}
                              onClick={() => handleItemRemoval(item)}
                              className="text-slate-400 hover:text-rose-500 text-[11px] font-bold inline-flex items-center gap-1 transition-colors disabled:opacity-40"
                            >
                              <Trash2 size={13} />
                              <span className="hidden sm:inline">Remove</span>
                            </button>

                            {/* Mobile Price display */}
                            <div className="text-right sm:hidden">
                              <p className="text-base font-black text-slate-900">₹{item.price * item.quantity}</p>
                            </div>
                          </div>
                        </div>

                        {/* Desktop Total Price Column */}
                        <div className="hidden sm:block text-right shrink-0">
                          <p className="text-lg font-black text-slate-900">
                            ₹{item.price * item.quantity}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400">
                            {item.quantity} × ₹{item.price}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

            </div>

            {/* --- RIGHT SECTION: SUMMARY SIDEBAR (4 COLUMNS) --- */}
            <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-8">

              {/* Promo Box */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Tag size={14} className="text-[#3d3f96]" /> Promo Code
                </p>

                {appliedPromo ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200/80 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <div>
                        <p className="text-xs font-black text-emerald-800">{appliedPromo.code}</p>
                        <p className="text-[10px] font-bold text-emerald-600">
                          {appliedPromo.discountPercent ? `${appliedPromo.discountPercent}% Off Applied` : `₹${appliedPromo.flatDiscount} Flat Off Applied`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setAppliedPromo(null)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded-lg"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="space-y-1.5">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Try 'SAVE10' or 'FLAT50'"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none uppercase placeholder:normal-case focus:border-[#3d3f96] transition-all"
                      />
                      <button
                        type="submit"
                        className="bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-xs font-black px-4 py-2.5 rounded-xl transition-all active:scale-95 shadow-sm"
                      >
                        Apply
                      </button>
                    </div>
                    {promoError && (
                      <p className="text-[10px] font-bold text-rose-500 pl-1">{promoError}</p>
                    )}
                  </form>
                )}
              </div>

              {/* Order Breakdown Box */}
              <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-7 border border-slate-100 shadow-xl shadow-indigo-100/40 space-y-5">
                <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center justify-between">
                  <span>Order Summary</span>
                  <CreditCard size={18} className="text-slate-400" />
                </h2>

                <div className="space-y-3 text-xs sm:text-sm font-bold">
                  <div className="flex justify-between text-slate-600">
                    <span>Items Subtotal</span>
                    <span className="text-slate-900 font-black">₹{subtotal}</span>
                  </div>

                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Promo Discount ({appliedPromo?.code})</span>
                      <span className="font-black">-₹{promoDiscount}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600">
                    <span>Estimated Shipping</span>
                    <span className={shippingFee === 0 ? "text-emerald-600 font-black" : "text-slate-900 font-black"}>
                      {shippingFee === 0 ? "FREE" : `₹${shippingFee}`}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                    <div>
                      <span className="text-xs font-black text-slate-800 uppercase tracking-widest block">Total Payable</span>
                      <span className="text-[10px] text-slate-400 font-bold">Inclusive of all taxes</span>
                    </div>
                    <span className="text-2xl sm:text-3xl font-black text-[#3d3f96]">
                      ₹{finalTotal}
                    </span>
                  </div>
                </div>

                <Link
                  href="/pharmacy/checkout"
                  className="w-full bg-[#3d3f96] hover:bg-[#2d2f75] text-white py-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 transition-all active:scale-95 text-center"
                >
                  PROCEED TO CHECKOUT
                  <ChevronRight size={18} />
                </Link>

                {/* Trust Seals */}
                <div className="pt-4 border-t border-slate-50 space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                    <span>Safe & Encrypted Transactions</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Truck size={14} className="text-blue-500 shrink-0" />
                    <span>Certified Cold-Chain Safe Delivery</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        ) : (
          /* --- EMPTY CART STATE --- */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl sm:rounded-[3rem] p-8 sm:p-16 text-center border border-slate-100 shadow-md max-w-xl mx-auto my-8"
          >
            <div className="bg-[#3d3f96]/5 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={36} className="text-[#3d3f96]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
              Your Medicine Cart is Empty
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mb-8 max-w-md mx-auto">
              You have no active medications or healthcare products queued. Browse your nearest partner store to add items.
            </p>
            <Link
              href="/pharmacy"
              className="bg-[#3d3f96] text-white px-8 py-3.5 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm hover:bg-[#2d2f75] transition-all shadow-lg shadow-indigo-100 inline-flex items-center gap-2"
            >
              Browse Medicines <ChevronRight size={16} />
            </Link>
          </motion.div>
        )}

      </div>

      {/* --- CLEAR CART CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {isClearing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setIsClearing(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full relative z-10 text-center shadow-2xl border border-slate-100"
            >
              <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-lg font-black text-slate-800">Clear Your Cart?</h3>
              <p className="text-xs text-slate-500 font-medium mt-1 mb-6">
                Are you sure you want to remove all {cartItems.length} items from this pharmacy? This action cannot be undone.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIsClearing(false)}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await clearPharmacyCart();
                    setIsClearing(false);
                  }}
                  className="py-3 px-4 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-200 transition-colors"
                >
                  Yes, Clear
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default CartPage;