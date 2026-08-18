"use client";
import React from 'react';
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
  Store
} from 'lucide-react';
import { useCart } from '../../../../context/CartContext'; // Adjust path based on your folder structure

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";

const CartPage = () => {
  const {
    pharmacyCart,
    pharmacyCartTotal,
    updatePharmacyItemQuantity,
    removePharmacyItem,
    clearPharmacyCart,
    loading
  } = useCart();

  // Helper to format uploaded server image paths
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

  // Select item display image or select a high-quality fallback
  const getProductImage = (item, index) => {
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
    if (!medId) return;

    if (delta === -1 && item.quantity <= 1) {
      // If decremented at 1, prompt removal
      await removePharmacyItem(medId);
    } else {
      const action = delta === 1 ? 'inc' : 'dec';
      await updatePharmacyItemQuantity(medId, action, item.isComboApplied || false);
    }
  };

  // Item deletion sync handler
  const handleItemRemoval = async (item) => {
    const medId = item.medicineId?._id || item.medicineId;
    if (medId) {
      await removePharmacyItem(medId);
    }
  };

  const cartItems = pharmacyCart?.items || [];
  const subtotal = pharmacyCartTotal || 0;

  // Dynamic Shipping Fees
  const shipping = subtotal > 500 || subtotal === 0 ? 0 : 0;
  const total = subtotal + shipping;

  return (
    <main className="min-h-screen bg-[#f8fbff] pt-8 pb-20 antialiased">
      <div className="max-w-[1400px] mx-auto px-6">

        {/* --- 1. HEADER --- */}
        <div className="flex items-center justify-between mb-10">
          <div className="space-y-1">
            <Link href="/pharmacy" className="flex items-center gap-2 text-[#3d3f96] font-bold text-sm hover:underline mb-2">
              <ArrowLeft size={16} /> Back to Pharmacy
            </Link>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Your Shopping <span className="text-[#3d3f96]">Cart</span>
            </h1>
            {pharmacyCart?.pharmacyId && (
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pt-1">
                <Store size={12} className="text-[#3d3f96]" />
                Store: <span className="text-slate-600">{pharmacyCart.pharmacyId.name}</span>
                {pharmacyCart.pharmacyId.city && ` • ${pharmacyCart.pharmacyId.city}`}
              </p>
            )}
          </div>
          <div className="hidden md:flex items-center gap-2 text-slate-400 font-bold text-sm uppercase tracking-widest">
            <ShoppingBag size={20} />
            {cartItems.length} Items
          </div>
        </div>

        {/* LOADING SHIM SCREEN */}
        {loading && cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[4rem] border border-slate-100 shadow-sm">
            <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={40} />
            <p className="text-slate-400 text-sm font-semibold">Syncing cart database contents...</p>
          </div>
        ) : cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

            {/* --- 2. PRODUCT LIST (8 Columns) --- */}
            <div className="lg:col-span-8 space-y-4">
              <AnimatePresence>
                {cartItems.map((item, index) => {
                  const hasRx = item.medicineId?.prescription_required === "YES";
                  const itemBrand = item.medicineId?.manufacturers || "General Healthcare";
                  const itemImg = getProductImage(item, index);

                  return (
                    <motion.div
                      key={item._id || index}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-6 group hover:shadow-md transition-all"
                    >
                      {/* Product Image */}
                      <div className="w-32 h-32 bg-slate-50 rounded-3xl overflow-hidden shrink-0 border border-slate-100/50">
                        <img
                          src={itemImg}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                          <h3 className="text-lg font-black text-slate-800">{item.name}</h3>
                          {hasRx && (
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter border border-amber-100 w-fit mx-auto md:mx-0">
                              <AlertCircle size={10} /> Rx Required
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{itemBrand}</p>

                        <div className="flex items-center justify-center md:justify-start gap-6">
                          {/* Stepper Controls */}
                          <div className="flex items-center gap-3 bg-slate-50 p-1 rounded-xl border border-slate-100">
                            <button
                              onClick={() => handleQuantityUpdate(item, -1)}
                              className="p-2 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-[#3d3f96]"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-sm font-black text-slate-700 w-4 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityUpdate(item, 1)}
                              className="p-2 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-[#3d3f96]"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          {/* Delete/Remove Trigger */}
                          <button
                            onClick={() => handleItemRemoval(item)}
                            className="text-red-400 hover:text-red-600 transition-colors flex items-center gap-1 text-xs font-bold uppercase tracking-widest"
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        </div>
                      </div>

                      {/* Price Section */}
                      <div className="text-right shrink-0">
                        <p className="text-xl font-black text-slate-900">₹{item.price * item.quantity}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">₹{item.price} / unit</p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* --- 3. ORDER SUMMARY (4 Columns) --- */}
            <div className="lg:col-span-4 sticky top-32">
              <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-2xl shadow-blue-100/50">
                <h2 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-tight">Order Summary</h2>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm font-bold text-slate-500">
                    <span>Subtotal</span>
                    <span className="text-slate-900 font-bold">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-500">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? "text-emerald-500 font-bold" : "text-slate-900 font-bold"}>
                      {shipping === 0 ? "FREE" : `₹${shipping}`}
                    </span>
                  </div>
                  <div className="h-px bg-slate-100 my-2" />
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-black text-slate-800 uppercase tracking-widest">Total Amount</span>
                    <span className="text-3xl font-black text-[#3d3f96]">₹{total}</span>
                  </div>
                </div>

                <button className="w-full bg-[#3d3f96] hover:bg-[#2d2f75] text-white py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 transition-all active:scale-95 mb-6">
                  CHECKOUT NOW
                  <ChevronRight size={18} />
                </button>

                {/* Trust Badges */}
                <div className="space-y-4 pt-6 border-t border-slate-50">
                  <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest select-none">
                    <ShieldCheck size={18} className="text-emerald-500" /> 100% Secure Payments
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest select-none">
                    <Truck size={18} className="text-blue-500" /> Express 24h Delivery
                  </div>
                </div>
              </div>

              {/* Promo Code Box */}
              <div className="mt-6 bg-white rounded-[2rem] p-4 border border-slate-100 flex items-center gap-2">
                <input type="text" placeholder="Enter Promo Code" className="flex-1 bg-transparent outline-none text-xs font-bold text-slate-700 px-2" />
                <button className="text-[#3d3f96] font-black text-[10px] uppercase tracking-widest hover:underline">Apply</button>
              </div>
            </div>

          </div>
        ) : (
          /* --- EMPTY STATE --- */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[4rem] p-20 text-center border border-slate-100 shadow-xl"
          >
            <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShoppingBag size={40} className="text-slate-300" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Your cart is empty</h2>
            <p className="text-slate-500 font-medium mb-10">Looks like you haven't added any medicines yet.</p>
            <Link href="/pharmacy" className="bg-[#3d3f96] text-white px-10 py-4 rounded-2xl font-black text-sm hover:bg-[#2d2f75] transition-all shadow-lg shadow-indigo-100 inline-block">
              START SHOPPING
            </Link>
          </motion.div>
        )}

      </div>
    </main>
  );
};

export default CartPage;