"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ShieldCheck,
  Building2,
  Clock,
  AlertCircle,
  MapPin,
  ChevronRight,
  Loader2,
  Beaker,
  FileText,
  Sparkles,
  ArrowRight,
  Info,
  CheckCircle2
} from 'lucide-react';
import { useCart } from '../../../../context/CartContext'; // Adjust path based on your folder structure
import { useNotification } from '../../../../context/NotificationContext'; // Adjust path based on your folder structure

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

export default function LabCartPage() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const {
    labCart,
    labCartTotal,
    updateLabItemQuantity,
    removeLabCartItem,
    clearLabCart,
    loading: cartLoading
  } = useCart();

  // Loading indicator for granular item updates
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearing, setClearing] = useState(false);

  // Path sanitizer for server image strings
  const getSanitizedImageUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1582719471384-894fbb16e074?q=80&w=400&auto=format&fit=crop";
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    let cleanPath = path.replace(/\\/g, '/').replace(/^public\//, '');
    if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);
    return `${BASE_URL}/${cleanPath}`;
  };

  const labDetails = labCart?.labId;
  const cartItems = labCart?.items || [];
  const totalItemCount = cartItems.reduce((acc, item) => acc + (item.quantity || 0), 0);

  // --- Handlers ---
  const handleQuantityChange = async (itemId, action, currentQty) => {
    try {
      setUpdatingItemId(itemId);
      if (action === 'dec' && currentQty <= 1) {
        await removeLabCartItem(itemId);
        if (showNotification) showNotification("Test removed from cart.", "success");
      } else {
        await updateLabItemQuantity(itemId, action);
      }
    } catch (err) {
      console.error("Error updating quantity:", err);
      if (showNotification) showNotification("Could not update item quantity.", "error");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (itemId, itemName) => {
    try {
      setUpdatingItemId(itemId);
      await removeLabCartItem(itemId);
      if (showNotification) showNotification(`Removed "${itemName}" from cart.`, "success");
    } catch (err) {
      console.error("Error deleting item:", err);
      if (showNotification) showNotification("Failed to remove item.", "error");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleClearCart = async () => {
    try {
      setClearing(true);
      await clearLabCart();
      setShowClearModal(false);
      if (showNotification) showNotification("Lab cart cleared successfully.", "success");
    } catch (err) {
      console.error("Error clearing lab cart:", err);
      if (showNotification) showNotification("Failed to clear cart.", "error");
    } finally {
      setClearing(false);
    }
  };

  // --- EMPTY CART STATE ---
  if (!cartLoading && cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 flex items-center justify-center antialiased">
        <div className="max-w-md w-full text-center bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#3d3f96] mx-auto mb-4">
            <ShoppingBag size={28} />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Your Lab Cart is Empty</h1>
          <p className="text-xs text-slate-400 font-medium mt-2 leading-relaxed">
            You haven't scheduled any pathology or diagnostic tests yet. Browse our catalog to book individual lab tests.
          </p>
          <Link href="/lab/alltests" className="block mt-6">
            <button className="w-full bg-[#3d3f96] hover:bg-[#323480] text-white py-3.5 px-6 rounded-xl font-bold text-xs transition-all shadow-md shadow-[#3d3f96]/20 active:scale-95 flex items-center justify-center gap-2">
              <Beaker size={15} />
              <span>Explore Diagnostic Tests</span>
            </button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-6 sm:py-8 antialiased text-slate-800">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* --- TOP BREADCRUMB & CONTROLS --- */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <button 
              onClick={() => router.back()}
              className="hover:text-slate-700 flex items-center gap-1.5 transition-colors py-1 px-2 -ml-2 rounded-lg hover:bg-slate-200/50"
            >
              <ArrowLeft size={13} /> Back
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500">Cart</span>
            <ChevronRight size={12} className="text-slate-300" />
            <span className="text-[#3d3f96] font-bold">Diagnostic Lab Cart</span>
          </div>

          {cartItems.length > 0 && (
            <button
              onClick={() => setShowClearModal(true)}
              disabled={cartLoading || clearing}
              className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1.5 transition-colors px-2 py-1 rounded-lg hover:bg-rose-50"
            >
              <Trash2 size={13} /> Clear Cart
            </button>
          )}
        </div>

        {/* --- HEADER TITLE --- */}
        <div className="mb-6">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Diagnostic Lab Cart
            </h1>
            <span className="bg-indigo-50 border border-indigo-100 text-[#3d3f96] font-extrabold text-xs px-2.5 py-0.5 rounded-full">
              {totalItemCount} {totalItemCount === 1 ? 'Test' : 'Tests'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
            Review test preparation instructions and verify your chosen diagnostic lab.
          </p>
        </div>

        {/* --- MAIN 2-COLUMN LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT COLUMN: FULFILLING LAB & ITEMS LIST (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">

            {/* Fulfilling Laboratory Banner */}
            {labDetails && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-slate-100 bg-slate-50 p-1">
                    <img
                      src={getSanitizedImageUrl(labDetails.profileImage)}
                      alt={labDetails.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-extrabold text-[#3d3f96] uppercase tracking-wider bg-indigo-50 border border-indigo-100/60 px-2 py-0.5 rounded-md">
                      Fulfilling Laboratory
                    </span>
                    <h2 className="text-sm sm:text-base font-extrabold text-slate-900 truncate mt-1">
                      {labDetails.name}
                    </h2>
                    <p className="text-xs text-slate-400 font-medium flex items-center gap-1 truncate mt-0.5">
                      <MapPin size={11} className="text-emerald-500 shrink-0" />
                      <span>{labDetails.address || labDetails.city || "Certified Processing Center"}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 hidden sm:block">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-xl">
                    <CheckCircle2 size={12} className="text-emerald-500" /> NABL Accredited
                  </span>
                </div>
              </div>
            )}

            {/* Preparation Advisory Banner */}
            <div className="bg-amber-50/70 border border-amber-200/70 p-4 rounded-2xl flex items-start gap-3">
              <Info size={17} className="text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-950">Patient Preparation Required</p>
                <p className="text-[11px] text-amber-800/90 font-medium mt-0.5 leading-relaxed">
                  Please review the specific pre-test instructions listed under each test to ensure accurate diagnostic values.
                </p>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="space-y-3">
              {cartItems.map((item) => {
                const isItemUpdating = updatingItemId === item.itemId;

                return (
                  <div
                    key={item._id || item.itemId}
                    className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-4 hover:border-slate-300 transition-colors"
                  >
                    {/* Item Top: Name, Category, Price */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-indigo-50 text-[#3d3f96] border border-indigo-100 text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg uppercase tracking-wider">
                            {item.mainCategory || "Pathology"}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {item.productType}
                          </span>
                        </div>
                        <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug">
                          {item.name}
                        </h3>
                      </div>

                      {/* Pricing */}
                      <div className="text-right shrink-0">
                        <p className="text-lg font-black text-slate-900 leading-tight">
                          ₹{item.price * item.quantity}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                            ₹{item.price} each
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Preparation Guide Card */}
                    {item.preparationGuide && (
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl px-3.5 py-2.5 flex items-center gap-2">
                        <Clock size={13} className="text-amber-500 shrink-0" />
                        <p className="text-xs font-semibold text-slate-600 truncate">
                          <span className="text-slate-400 font-medium">Preparation: </span>
                          {item.preparationGuide}
                        </p>
                      </div>
                    )}

                    {/* Bottom Action Row: Quantity Stepper & Delete */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleRemoveItem(item.itemId, item.name)}
                        disabled={isItemUpdating || cartLoading}
                        className="text-xs font-bold text-slate-400 hover:text-rose-500 flex items-center gap-1.5 transition-colors py-1"
                      >
                        <Trash2 size={13} />
                        <span>Remove</span>
                      </button>

                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-slate-200 rounded-xl p-1 bg-slate-50">
                        <button
                          onClick={() => handleQuantityChange(item.itemId, 'dec', item.quantity)}
                          disabled={isItemUpdating || cartLoading}
                          className="p-1.5 bg-white text-slate-700 hover:text-[#3d3f96] rounded-lg shadow-sm transition-all disabled:opacity-40"
                          title="Decrease"
                        >
                          <Minus size={12} className="stroke-[2.5]" />
                        </button>

                        <span className="text-xs font-extrabold text-slate-800 px-3 min-w-[2rem] text-center select-none">
                          {isItemUpdating ? (
                            <Loader2 size={12} className="animate-spin text-[#3d3f96] inline-block" />
                          ) : (
                            item.quantity
                          )}
                        </span>

                        <button
                          onClick={() => handleQuantityChange(item.itemId, 'inc', item.quantity)}
                          disabled={isItemUpdating || cartLoading}
                          className="p-1.5 bg-white text-slate-700 hover:text-[#3d3f96] rounded-lg shadow-sm transition-all disabled:opacity-40"
                          title="Increase"
                        >
                          <Plus size={12} className="stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* RIGHT COLUMN: ORDER SUMMARY & CHECKOUT (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-5 sticky top-6">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight border-b border-slate-100 pb-3">
              Order Breakdown
            </h2>

            {/* Breakdown Calculations */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-slate-500 font-medium">
                <span>Tests Subtotal ({totalItemCount} items)</span>
                <span className="text-slate-800 font-bold">₹{labCartTotal}</span>
              </div>

              <div className="flex justify-between items-center text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  Home Sample Collection
                </span>
                <span className="text-emerald-600 font-bold uppercase text-[11px]">Free</span>
              </div>

              <div className="flex justify-between items-center text-slate-500 font-medium">
                <span>Sample Packaging &amp; Barcode</span>
                <span className="text-emerald-600 font-bold uppercase text-[11px]">Waived</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-extrabold text-slate-900">Total Payable</span>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Inclusive of all medical taxes</p>
                </div>
                <span className="text-2xl font-black text-slate-900">
                  ₹{labCartTotal}
                </span>
              </div>
            </div>

            {/* Patient Booking CTA */}
            <div className="pt-2">
              <Link href="/lab/checkout" className="block w-full">
                <button
                  disabled={cartLoading || cartItems.length === 0}
                  className="w-full py-4 bg-[#3d3f96] hover:bg-[#323480] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-[#3d3f96]/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <span>Schedule Patient &amp; Slot</span>
                  <ArrowRight size={14} className="stroke-[2.5]" />
                </button>
              </Link>
            </div>

            {/* Assurance Badges */}
            <div className="pt-2 space-y-2 border-t border-slate-100 text-[11px] text-slate-500 font-semibold">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                <span>NABL &amp; ICMR Certified Partner Labs</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-[#3d3f96] shrink-0" />
                <span>Digital Reports Delivered within 24-48 Hours</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* --- CLEAR CART CONFIRMATION MODAL --- */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => !clearing && setShowClearModal(false)}
          />

          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl border border-slate-100 relative z-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center mx-auto mb-3">
              <Trash2 size={22} />
            </div>

            <h3 className="text-base font-bold text-slate-900">Clear All Lab Tests?</h3>
            <p className="text-xs text-slate-500 font-medium mt-1.5 leading-relaxed">
              This will remove all tests from <span className="font-bold text-slate-700">"{labDetails?.name}"</span> and release the lab lock.
            </p>

            <div className="flex gap-2.5 w-full mt-5">
              <button
                disabled={clearing}
                onClick={() => setShowClearModal(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={clearing}
                onClick={handleClearCart}
                className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/20 flex items-center justify-center gap-1.5 active:scale-95"
              >
                {clearing ? <Loader2 size={13} className="animate-spin" /> : <span>Yes, Clear</span>}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}