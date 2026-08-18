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
    X
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
                                            setGlobalQuantity(1); // Reset qty stepper back to 1 on selection
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
                                        ₹{selectedSeller.price * currentQuantity}
                                    </p>
                                </div>
                                <span className="text-[11px] font-bold text-slate-400">
                                    ₹{selectedSeller.price} × {currentQuantity} strip{currentQuantity > 1 ? 's' : ''}
                                </span>
                            </div>

                            {/* Stepper & Add To Cart Horizontal Block */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                {/* Stepper controls */}
                                <div className="flex items-center justify-between border border-[#3d3f96]/20 rounded-2xl p-1 bg-indigo-50/20 w-full sm:w-max shrink-0">
                                    <button
                                        onClick={handleDecrement}
                                        disabled={cartLoading || (!isInCart && currentQuantity <= 1)}
                                        className="p-3 bg-white text-[#3d3f96] hover:bg-indigo-50 rounded-xl shadow-sm transition-all disabled:opacity-50"
                                    >
                                        <Minus size={14} className="stroke-[2.5]" />
                                    </button>

                                    <span className="text-sm font-black text-slate-800 px-5 select-none min-w-[2.5rem] text-center">
                                        {cartLoading ? (
                                            <Loader2 size={14} className="animate-spin text-[#3d3f96] inline-block" />
                                        ) : (
                                            currentQuantity
                                        )}
                                    </span>

                                    <button
                                        onClick={handleIncrement}
                                        disabled={cartLoading || currentQuantity >= selectedSeller.stock}
                                        className="p-3 bg-white text-[#3d3f96] hover:bg-indigo-50 rounded-xl shadow-sm transition-all disabled:opacity-50"
                                    >
                                        <Plus size={14} className="stroke-[2.5]" />
                                    </button>
                                </div>

                                {/* Toggle CTA Action */}
                                {isInCart ? (
                                    <button
                                        onClick={handleRemoveFromCart}
                                        disabled={cartLoading}
                                        className="w-full flex-1 py-4 bg-rose-500 hover:bg-rose-600 text-white text-xs sm:text-sm font-black rounded-2xl shadow-lg shadow-rose-100 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        <Trash2 size={16} />
                                        <span>Remove From Cart</span>
                                    </button>
                                ) : isConflictPharmacy ? (
                                    <button
                                        onClick={() => setShowConflictModal(true)}
                                        className="w-full flex-1 py-4 bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-black rounded-2xl shadow-lg shadow-amber-100 flex items-center justify-center gap-2 transition-all active:scale-95 border border-amber-600/15"
                                    >
                                        <AlertTriangle size={16} />
                                        <span>Replace Cart &amp; Add</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleGlobalAddToCart}
                                        disabled={cartLoading}
                                        className="w-full flex-1 py-4 bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-xs sm:text-sm font-black rounded-2xl shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        <ShoppingBag size={16} />
                                        <span>Add To Cart</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="py-6 text-center">
                            <p className="text-xs font-bold text-slate-400">Select an available partner pharmacy on the left to set order options.</p>
                        </div>
                    )}
                </div>

            </div>

            {/* --- MULTI-VENDOR CONFLICT RESOLUTION MODAL --- */}
            {showConflictModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop Overlay */}
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                        onClick={() => !conflictLoading && setShowConflictModal(false)}
                    />

                    {/* Modal Box */}
                    <div className="bg-white rounded-[2.5rem] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative z-10 flex flex-col items-center text-center">

                        {/* Close Trigger Icon */}
                        {!conflictLoading && (
                            <button
                                onClick={() => setShowConflictModal(false)}
                                className="absolute top-4 right-4 bg-slate-50 text-slate-500 hover:bg-slate-100 p-2 rounded-full border border-slate-100 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        )}

                        {/* Warning Header */}
                        <div className="bg-amber-50 text-amber-500 p-4 rounded-full mb-4">
                            <AlertTriangle size={32} />
                        </div>

                        <h3 className="text-xl font-black text-slate-900 tracking-tight leading-snug">
                            Replace Cart Items?
                        </h3>

                        <p className="text-xs text-slate-500 font-bold mt-2.5 leading-relaxed">
                            Your cart already contains products from another pharmacy. Each order can only contain products from a single pharmacy seller.
                        </p>

                        <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed">
                            Would you like to clear your current cart and add this item instead?
                        </p>

                        {/* Confirm Actions */}
                        <div className="flex gap-3 w-full mt-6 shrink-0">
                            <button
                                disabled={conflictLoading}
                                onClick={() => setShowConflictModal(false)}
                                className="flex-1 py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-black text-xs rounded-2xl border border-slate-200/50 transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                disabled={conflictLoading}
                                onClick={handleClearAndAdd}
                                className="flex-1 py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-black text-xs rounded-2xl shadow-md shadow-rose-100 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {conflictLoading ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        <span>Clearing...</span>
                                    </>
                                ) : (
                                    <span>Clear &amp; Add</span>
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