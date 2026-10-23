"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Store,
    MapPin,
    Truck,
    Minus,
    Plus,
    Loader2,
    Trash2,
    ShoppingBag,
    AlertTriangle,
    X,
    Calendar,
    Layers,
    RotateCcw,
    Check,
    CheckCircle2
} from 'lucide-react';
import { useCart } from '../../../../context/CartContext'; // Adjust based on your folder structure
import { useNotification } from '../../../../context/NotificationContext'; // Adjust based on your folder structure

const SellersAndCartSection = ({
    productId,
    sellers,
    selectedSeller,
    setSelectedSeller,
    getSanitizedImageUrl
}) => {
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

    // Quantity stepper state (local state staging)
    const [globalQuantity, setGlobalQuantity] = useState(1);

    // Multi-vendor Conflict Modal States
    const [showConflictModal, setShowConflictModal] = useState(false);
    const [conflictLoading, setConflictLoading] = useState(false);

    // --- CART ITEM DISCOVERY LOGIC ---
    const cartPharmacyId = typeof pharmacyCart?.pharmacyId === 'object'
        ? pharmacyCart.pharmacyId?._id
        : pharmacyCart?.pharmacyId;

    const isCorrectPharmacy = cartPharmacyId?.toString() === selectedSeller?.pharmacyId?.toString();

    // A conflict exists if there are items in the cart and they belong to another pharmacy
    const isConflictPharmacy = cartPharmacyId && !isCorrectPharmacy;

    const cartItem = isCorrectPharmacy
        ? pharmacyCart?.items?.find(item => {
            const mId = typeof item.medicineId === 'object' ? item.medicineId?._id : item.medicineId;
            return mId?.toString() === productId?.toString();
        })
        : null;

    const isInCart = !!cartItem;
    const currentQuantity = isInCart ? cartItem.quantity : globalQuantity;

    // Handle Increments (Supports both cart sync and local state staging)
    const handleIncrement = async () => {
        if (currentQuantity >= selectedSeller?.stock) return;

        if (isInCart) {
            try {
                await updatePharmacyItemQuantity(productId, 'inc', false);
            } catch (err) {
                console.error("Error incrementing pharmacy cart quantity:", err);
            }
        } else {
            setGlobalQuantity(prev => prev + 1);
        }
    };

    // Handle Decrements (Supports cart sync, item deletions, and local staging)
    const handleDecrement = async () => {
        if (isInCart) {
            try {
                if (currentQuantity <= 1) {
                    await removePharmacyItem(productId);
                    setGlobalQuantity(1);
                } else {
                    await updatePharmacyItemQuantity(productId, 'dec', false);
                }
            } catch (err) {
                console.error("Error decrementing pharmacy cart quantity:", err);
            }
        } else {
            setGlobalQuantity(prev => Math.max(1, prev - 1));
        }
    };

    // Add Item configuration to Cart Provider on database and redirect
    const handleGlobalAddToCart = async () => {
        if (!selectedSeller) {
            if (showNotification) {
                showNotification("Please select a pharmacy seller first.", "error");
            }
            return;
        }

        try {
            await addToPharmacyCart({
                pharmacyId: selectedSeller.pharmacyId,
                medicineId: productId,
                quantity: globalQuantity,
                forceReplace: false,
                isComboApplied: false
            });
            if (showNotification) {
                showNotification(
                    `Added ${globalQuantity} item(s) from "${selectedSeller.name}" to your cart.`,
                    "success"
                );
            }
            // Redirect on success
            router.push('/otherscreens/carts/pharmacycart');
        } catch (err) {
            console.error("Error adding to pharmacy cart:", err);
            if (err.response?.status === 400) {
                setShowConflictModal(true); // Fallback modal trigger if backend returns 400
            } else {
                if (showNotification) {
                    showNotification(err.response?.data?.message || "Failed to add item to cart.", "error");
                }
            }
        }
    };

    // Clear existing different pharmacy items and add current selection
    const handleClearAndAdd = async () => {
        try {
            setConflictLoading(true);

            // 1. Clear cart of different vendor items
            await clearPharmacyCart();

            // 2. Add current pharmacy items
            await addToPharmacyCart({
                pharmacyId: selectedSeller.pharmacyId,
                medicineId: productId,
                quantity: globalQuantity,
                forceReplace: false,
                isComboApplied: false
            });

            if (showNotification) {
                showNotification(
                    `Previous items cleared. Added ${globalQuantity} item(s) from "${selectedSeller.name}" successfully.`,
                    "success"
                );
            }
            setShowConflictModal(false);
            router.push('/otherscreens/carts/pharmacycart');
        } catch (err) {
            console.error("Error clearing and adding new pharmacy items:", err);
            if (showNotification) {
                showNotification("Failed to resolve cart items conflict.", "error");
            }
        } finally {
            setConflictLoading(false);
        }
    };

    // Handle removing product from cart
    const handleRemoveFromCart = async () => {
        try {
            await removePharmacyItem(productId);
            setGlobalQuantity(1);
            if (showNotification) {
                showNotification("Item removed from your cart.", "success");
            }
        } catch (err) {
            console.error("Error removing item from pharmacy cart:", err);
        }
    };

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left: Pixel-Matched Pharmacy Sellers List (7 Cols) */}
                <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-5 px-1">
                        <div className="flex items-center gap-2">
                            <Store size={18} className="text-[#3d3f96]" />
                            <h2 className="text-base font-bold text-slate-900 tracking-tight">Available Sellers Near You</h2>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                            {sellers.length} {sellers.length === 1 ? 'Seller' : 'Sellers'}
                        </span>
                    </div>

                    {sellers.length > 0 ? (
                        <div className="space-y-3">
                            {sellers.map((seller) => {
                                const isSelected = selectedSeller?.pharmacyId === seller.pharmacyId;
                                const itemDiscount = seller.discount || 0;

                                return (
                                    <div
                                        key={seller.pharmacyId}
                                        onClick={() => {
                                            setSelectedSeller(seller);
                                            setGlobalQuantity(1); // Reset qty stepper back to 1 on selection
                                        }}
                                        className={`w-full p-4 rounded-2xl transition-all duration-200 border cursor-pointer relative ${
                                            isSelected
                                                ? 'border-[#3d3f96] bg-indigo-50/20 shadow-sm ring-1 ring-[#3d3f96]'
                                                : 'border-slate-200/70 bg-white hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            {/* Store Logo & Details */}
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-100 bg-slate-50 flex items-center justify-center p-1">
                                                    <img
                                                        src={getSanitizedImageUrl(seller.image)}
                                                        alt={seller.name}
                                                        className="w-full h-full object-cover rounded-lg"
                                                    />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <div className="flex items-center gap-2 truncate">
                                                        <p className="font-bold text-sm text-slate-900 truncate">
                                                            {seller.name}
                                                        </p>
                                                        {seller.isOpen && (
                                                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 shrink-0">
                                                                {seller.isOpen}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mt-0.5 truncate">
                                                        <MapPin size={11} className="text-emerald-500 shrink-0" />
                                                        <span className="truncate">{seller.address}</span>
                                                        {seller.distance && seller.distance !== "N/A" && (
                                                            <span>• {seller.distance} km</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Price and Discount */}
                                            <div className="flex flex-col items-end shrink-0">
                                                <div className="flex items-baseline gap-1.5">
                                                    <span className="font-extrabold text-base text-slate-900 leading-none">
                                                        ₹{seller.price}
                                                    </span>
                                                    {seller.mrp && seller.mrp > seller.price && (
                                                        <span className="text-[11px] font-semibold text-slate-400 line-through">
                                                            ₹{seller.mrp}
                                                        </span>
                                                    )}
                                                </div>
                                                {itemDiscount > 0 && (
                                                    <span className="text-[9px] font-bold bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded mt-1 uppercase">
                                                        {itemDiscount}% OFF
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Bottom Meta Tags: Expiry, Batch, Return, Stock */}
                                        <div className="flex flex-wrap items-center gap-2 mt-3 pt-2.5 border-t border-slate-100 text-[11px] font-semibold text-slate-500">
                                            {seller.exp_formatted && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={11} className="text-slate-400" /> Exp: {seller.exp_formatted}
                                                </span>
                                            )}
                                            {seller.batch_number && (
                                                <>
                                                    <span className="text-slate-200">•</span>
                                                    <span className="flex items-center gap-1">
                                                        <Layers size={11} className="text-slate-400" /> Batch: {seller.batch_number}
                                                    </span>
                                                </>
                                            )}
                                            <span className="text-slate-200">•</span>
                                            <span className={seller.isReturnAllowed ? "text-emerald-600" : "text-slate-400"}>
                                                {seller.isReturnAllowed ? "Returnable" : "Non-Returnable"}
                                            </span>
                                            <span className="text-slate-200">•</span>
                                            <span className="text-slate-600 font-bold">
                                                Stock: {seller.stock_quantity ?? seller.stock}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-slate-50 border border-dashed border-slate-200 p-8 text-center rounded-2xl">
                            <Store className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs font-bold text-slate-600">No partner pharmacies have this item in stock nearby.</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Please check alternative brands listed below.</p>
                        </div>
                    )}
                </div>

                {/* Right: Cart Controller Section (5 Cols) */}
                <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider border-b border-slate-100 pb-2.5">
                        Fulfillment Summary
                    </p>

                    {selectedSeller ? (
                        <div className="space-y-4">
                            {/* Selected Store Card */}
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <span className="text-[10px] font-bold text-[#3d3f96] uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
                                    Selected Pharmacy
                                </span>
                                <p className="text-sm font-bold text-slate-900 mt-2">{selectedSeller.name}</p>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">{selectedSeller.address}</p>

                                <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200/70">
                                    <span className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                                        <Truck size={13} className="text-[#3d3f96]" />
                                        {selectedSeller.isHomeDelivery ? "Home Delivery" : "Store Pickup"}
                                    </span>
                                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                        {selectedSeller.stock} Available
                                    </span>
                                </div>
                            </div>

                            {/* Price Subtotal Calculation Box */}
                            <div className="flex justify-between items-end bg-[#3d3f96]/5 border border-[#3d3f96]/10 p-4 rounded-2xl">
                                <div>
                                    <span className="text-[10px] text-[#3d3f96] font-bold uppercase tracking-wider">
                                        Order Subtotal
                                    </span>
                                    <p className="text-2xl font-extrabold text-slate-900 mt-0.5 leading-none">
                                        ₹{selectedSeller.price * currentQuantity}
                                    </p>
                                </div>
                                <span className="text-xs font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-100">
                                    ₹{selectedSeller.price} × {currentQuantity} unit{currentQuantity > 1 ? 's' : ''}
                                </span>
                            </div>

                            {/* Stepper & CTA Action Block */}
                            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                                {/* Quantity Stepper */}
                                <div className="flex items-center justify-between border border-slate-200 rounded-xl p-1 bg-slate-50 w-full sm:w-max shrink-0">
                                    <button
                                        onClick={handleDecrement}
                                        disabled={cartLoading || (!isInCart && currentQuantity <= 1)}
                                        className="p-2.5 bg-white text-slate-700 hover:text-[#3d3f96] rounded-lg shadow-sm transition-all disabled:opacity-40"
                                    >
                                        <Minus size={13} className="stroke-[2.5]" />
                                    </button>

                                    <span className="text-xs font-bold text-slate-800 px-4 select-none min-w-[2.2rem] text-center">
                                        {cartLoading ? (
                                            <Loader2 size={13} className="animate-spin text-[#3d3f96] inline-block" />
                                        ) : (
                                            currentQuantity
                                        )}
                                    </span>

                                    <button
                                        onClick={handleIncrement}
                                        disabled={cartLoading || currentQuantity >= selectedSeller.stock}
                                        className="p-2.5 bg-white text-slate-700 hover:text-[#3d3f96] rounded-lg shadow-sm transition-all disabled:opacity-40"
                                    >
                                        <Plus size={13} className="stroke-[2.5]" />
                                    </button>
                                </div>

                                {/* Call to action button */}
                                {isInCart ? (
                                    <button
                                        onClick={handleRemoveFromCart}
                                        disabled={cartLoading}
                                        className="w-full flex-1 py-3.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        <Trash2 size={15} />
                                        <span>Remove From Cart</span>
                                    </button>
                                ) : isConflictPharmacy ? (
                                    <button
                                        onClick={() => setShowConflictModal(true)}
                                        className="w-full flex-1 py-3.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                                    >
                                        <AlertTriangle size={15} />
                                        <span>Replace Cart &amp; Add</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleGlobalAddToCart}
                                        disabled={cartLoading}
                                        className="w-full flex-1 py-3.5 bg-[#3d3f96] hover:bg-[#323480] text-white text-xs font-bold rounded-xl shadow-md shadow-[#3d3f96]/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        <ShoppingBag size={15} />
                                        <span>Add To Cart</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="py-6 text-center">
                            <p className="text-xs font-medium text-slate-400">Select a pharmacy from the left list to proceed.</p>
                        </div>
                    )}
                </div>

            </div>

            {/* --- MULTI-VENDOR CONFLICT MODAL --- */}
            {showConflictModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                        onClick={() => !conflictLoading && setShowConflictModal(false)}
                    />

                    {/* Modal Window */}
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-100 relative z-10 flex flex-col items-center text-center">

                        {!conflictLoading && (
                            <button
                                onClick={() => setShowConflictModal(false)}
                                className="absolute top-4 right-4 bg-slate-100 text-slate-500 hover:bg-slate-200 p-1.5 rounded-full transition-colors"
                            >
                                <X size={15} />
                            </button>
                        )}

                        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-500 flex items-center justify-center mb-3">
                            <AlertTriangle size={24} />
                        </div>

                        <h3 className="text-lg font-bold text-slate-900">
                            Clear Current Cart?
                        </h3>

                        <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
                            Your cart already contains items from a different pharmacy. Healthcare orders can only be fulfilled from a single seller at a time.
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                            Would you like to replace your cart with items from <span className="font-bold text-slate-700">"{selectedSeller?.name}"</span>?
                        </p>

                        <div className="flex gap-2.5 w-full mt-5 shrink-0">
                            <button
                                disabled={conflictLoading}
                                onClick={() => setShowConflictModal(false)}
                                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                disabled={conflictLoading}
                                onClick={handleClearAndAdd}
                                className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {conflictLoading ? (
                                    <>
                                        <Loader2 size={13} className="animate-spin" />
                                        <span>Clearing...</span>
                                    </>
                                ) : (
                                    <span>Clear &amp; Proceed</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SellersAndCartSection;