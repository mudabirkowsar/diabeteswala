"use client";

import React, { useState, useEffect } from 'react';
import {
    X,
    Utensils,
    Loader2,
    CheckCircle2,
    Package,
    ChefHat,
    AlertCircle,
    Phone,
    Truck,
    MapPin,
    Calendar,
    Mail,
    User,
    ShieldCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import FoodAPI from '../../../../../services/FoodVendorAPI';

export default function FoodOrderDetailModal({ orderId, isOpen, onClose, onStatusUpdated }) {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);

    // --- Cancellation Reason State inside Modal ---
    const [showRejectBox, setShowRejectBox] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    // --- Fetch Single Order Full Specification via API ---
    const fetchOrderDetails = async () => {
        setLoading(true);
        try {
            const response = await FoodAPI.getKitchenOrderDetail(orderId);
            if (response && response.success) {
                setOrder(response.data);
            } else {
                toast.error("Unable to load order details.");
            }
        } catch (err) {
            console.error("Error fetching single kitchen order detail:", err);
            toast.error("Failed to load order monograph.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && orderId) {
            fetchOrderDetails();
            setShowRejectBox(false);
            setCancelReason('');
        } else {
            setOrder(null);
        }
    }, [isOpen, orderId]);

    if (!isOpen) return null;

    // --- Kitchen State Machine Transitions inside Modal ---
    const handleStatusTransition = async (targetStatus, reason = null) => {
        setUpdating(true);
        try {
            const payload = {
                status: targetStatus,
                ...(reason && { cancelReason: reason })
            };
            const response = await FoodAPI.updateKitchenOrderStatus(order._id || orderId, payload);
            if (response && response.success) {
                toast.success(response.message || `Order updated to "${targetStatus}"`);
                setShowRejectBox(false);
                setCancelReason('');
                // Refresh modal data
                await fetchOrderDetails();
                // Refresh parent table list
                if (onStatusUpdated) onStatusUpdated();
            }
        } catch (err) {
            console.error("Error updating status:", err);
            toast.error(err.response?.data?.message || "Failed to update order status.");
        } finally {
            setUpdating(false);
        }
    };

    const renderStatusBadge = (status) => {
        const uppercase = status?.toUpperCase();
        if (uppercase === 'DELIVERED') {
            return <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 flex items-center gap-1"><CheckCircle2 size={11} /> Delivered</span>;
        }
        if (uppercase === 'READY' || uppercase === 'READY FOR DELIVERY') {
            return <span className="text-[10px] font-black uppercase text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100 flex items-center gap-1"><Package size={11} /> Ready for Pickup</span>;
        }
        if (uppercase === 'PREPARING') {
            return <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 flex items-center gap-1"><ChefHat size={11} className="animate-bounce" /> Preparing</span>;
        }
        if (uppercase === 'CANCELLED') {
            return <span className="text-[10px] font-black uppercase text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100 flex items-center gap-1"><AlertCircle size={11} /> Cancelled</span>;
        }
        return <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" /> {status || 'New'}</span>;
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none antialiased">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto [&::-webkit-scrollbar]:hidden text-left">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition cursor-pointer"
                >
                    <X size={18} />
                </button>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading order monograph...</p>
                    </div>
                ) : !order ? (
                    <div className="py-12 text-center text-slate-400 text-xs font-bold">
                        No order specification found.
                    </div>
                ) : (
                    <div className="space-y-6">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4 pr-10">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Kitchen Order Ledger</span>
                                <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                                    <Utensils size={18} className="text-[#3d3f96]" /> {order.bookingId}
                                </h3>
                            </div>
                            {renderStatusBadge(order.status)}
                        </div>

                        {/* Security OTP Callout */}
                        {order.deliveryOTP && order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                            <div className="bg-red-50/60 border border-red-200/60 text-red-600 p-3.5 rounded-2xl text-center space-y-0.5">
                                <span className="text-[10px] font-black uppercase tracking-wider block">Security Delivery OTP</span>
                                <strong className="text-2xl font-black font-mono tracking-widest block">{order.deliveryOTP}</strong>
                                <p className="text-[10px] font-bold text-red-500/80 uppercase">Customer will provide this OTP to the delivery driver at the door.</p>
                            </div>
                        )}

                        {/* Complete Customer Details */}
                        <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Customer Monograph</span>
                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 text-xs">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 flex items-center gap-1"><User size={12} /> Customer Name:</span>
                                    <strong className="text-slate-800">{order.userId?.name || "Guest Customer"}</strong>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 flex items-center gap-1"><Phone size={12} /> Phone Number:</span>
                                    <a href={`tel:${order.userId?.phone}`} className="text-[#3d3f96] font-bold hover:underline">
                                        {order.userId?.phone || "N/A"}
                                    </a>
                                </div>
                                {order.userId?.email && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400 flex items-center gap-1"><Mail size={12} /> Email:</span>
                                        <span className="text-slate-700 font-semibold">{order.userId.email}</span>
                                    </div>
                                )}
                                {order.userId?.gender && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400">Gender:</span>
                                        <span className="text-slate-700 font-semibold">{order.userId.gender}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Complete Delivery Address Details */}
                        <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Complete Delivery Address</span>
                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 text-xs">
                                <div className="flex items-center gap-1.5 text-slate-800 font-black">
                                    <MapPin size={14} className="text-rose-500" />
                                    <span>{order.address?.name || order.userId?.name} • {order.address?.phone || order.userId?.phone}</span>
                                    {order.address?.addressType && (
                                        <span className="ml-auto text-[9px] font-black uppercase bg-slate-200 text-slate-600 px-2 py-0.5 rounded">
                                            {order.address.addressType}
                                        </span>
                                    )}
                                </div>
                                <p className="text-slate-600 font-medium leading-relaxed pt-1 border-t border-slate-200/50">
                                    {[
                                        order.address?.houseNo,
                                        order.address?.sector,
                                        order.address?.landmark && `Near ${order.address.landmark}`,
                                        order.address?.city,
                                        order.address?.state,
                                        order.address?.pincode
                                    ].filter(Boolean).join(', ')}
                                </p>
                            </div>
                        </div>

                        {/* Itemized Preparation List */}
                        <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Itemized Preparation List</span>
                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl divide-y divide-slate-100 space-y-2.5 text-xs font-bold">
                                {order.items?.map((item, idx) => (
                                    <div key={idx} className="pt-2 first:pt-0 flex justify-between items-center">
                                        <div>
                                            <span className="text-slate-800">{item.name} <strong className="text-[#3d3f96]">x{item.quantity}</strong></span>
                                            <span className="text-[9px] text-slate-400 block uppercase">{item.mealType || item.productType || "Meal Item"}</span>
                                        </div>
                                        <span className="font-mono text-slate-800">₹{item.price * item.quantity}</span>
                                    </div>
                                ))}
                                {order.addons?.map((addon, idx) => (
                                    <div key={`addon-${idx}`} className="pt-2 flex justify-between items-center text-slate-500 italic">
                                        <span>+ {addon.name} <strong>x{addon.quantity}</strong></span>
                                        <span className="font-mono">₹{addon.price * addon.quantity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Detailed Billing Summary */}
                        <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Payment Breakdown</span>
                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 text-xs font-bold text-slate-600">
                                <div className="flex justify-between">
                                    <span>Items Subtotal</span>
                                    <span className="font-mono">₹{order.billSummary?.itemTotal || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Delivery Charges</span>
                                    <span className="font-mono">₹{order.billSummary?.deliveryCharge || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Packaging &amp; Box Fees</span>
                                    <span className="font-mono">₹{order.billSummary?.packagingCharge || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Logistics Tax (GST)</span>
                                    <span className="font-mono">₹{order.billSummary?.taxAmount || 0}</span>
                                </div>
                                {order.billSummary?.couponDiscount > 0 && (
                                    <div className="flex justify-between text-rose-600">
                                        <span>Coupon Discount</span>
                                        <span className="font-mono">-₹{order.billSummary.couponDiscount}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm text-slate-900 border-t border-slate-200/60 pt-2 font-black">
                                    <span>Total Amount ({order.paymentMethod})</span>
                                    <span className="font-mono text-base text-[#3d3f96]">₹{order.billSummary?.totalAmount || 0}</span>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Driver Status */}
                        <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Delivery Driver Status</span>
                            {order.driverId ? (
                                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-[#3d3f96]">
                                            <Truck size={18} />
                                        </div>
                                        <div>
                                            <strong className="text-xs font-black text-slate-800 block">{order.driverId.name || "Assigned Driver"}</strong>
                                            <span className="text-[10px] text-slate-400 font-bold">{order.driverId.phone}</span>
                                        </div>
                                    </div>
                                    {order.driverId.phone && (
                                        <a href={`tel:${order.driverId.phone}`} className="p-2 bg-white border border-slate-200 rounded-xl text-[#3d3f96] hover:bg-slate-100">
                                            <Phone size={14} />
                                        </a>
                                    )}
                                </div>
                            ) : (
                                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-2 text-xs text-slate-500 font-bold">
                                    <Truck size={16} className="text-slate-400 animate-pulse" />
                                    <span>Awaiting delivery rider assignment...</span>
                                </div>
                            )}
                        </div>

                        {/* --- KITCHEN STATE MACHINE ACTION CONTROLS INSIDE MODAL --- */}
                        <div className="pt-3 border-t border-slate-100 space-y-3">

                            {/* Rejection input box if triggered */}
                            {showRejectBox ? (
                                <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-black uppercase text-rose-600 flex items-center gap-1">
                                            <AlertCircle size={14} /> Specify Rejection Reason
                                        </span>
                                        <button onClick={() => setShowRejectBox(false)} className="text-slate-400 hover:text-slate-600">
                                            <X size={14} />
                                        </button>
                                    </div>
                                    <textarea
                                        rows={2}
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                        placeholder="e.g. Ingredients out of stock, kitchen closed..."
                                        className="w-full p-2.5 bg-white border border-rose-200 rounded-xl text-xs font-semibold text-slate-800 outline-none resize-none"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowRejectBox(false)}
                                            className="px-3.5 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            disabled={!cancelReason.trim() || updating}
                                            onClick={() => handleStatusTransition('Cancelled', cancelReason)}
                                            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase rounded-lg shadow-sm transition disabled:opacity-50"
                                        >
                                            {updating ? <Loader2 size={12} className="animate-spin inline mr-1" /> : null}
                                            Confirm Reject
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-end gap-3">
                                    {order.status === 'New' && (
                                        <>
                                            <button
                                                type="button"
                                                disabled={updating}
                                                onClick={() => setShowRejectBox(true)}
                                                className="px-5 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer disabled:opacity-50"
                                            >
                                                Reject Order
                                            </button>
                                            <button
                                                type="button"
                                                disabled={updating}
                                                onClick={() => handleStatusTransition('Preparing')}
                                                className="px-6 py-3 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-950/10 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                                            >
                                                {updating ? <Loader2 size={14} className="animate-spin" /> : <ChefHat size={15} />}
                                                <span>Accept &amp; Prepare</span>
                                            </button>
                                        </>
                                    )}

                                    {order.status === 'Preparing' && (
                                        <button
                                            type="button"
                                            disabled={updating}
                                            onClick={() => handleStatusTransition('Ready for Delivery')}
                                            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                                        >
                                            {updating ? <Loader2 size={14} className="animate-spin" /> : <Package size={15} />}
                                            <span>Mark Ready for Pickup</span>
                                        </button>
                                    )}

                                    {(order.status === 'Ready' || order.status === 'Ready for Delivery') && (
                                        <div className="w-full py-3 bg-purple-50 border border-purple-100 text-purple-700 rounded-xl text-center text-xs font-black uppercase flex items-center justify-center gap-2">
                                            <Truck size={15} className="animate-pulse" />
                                            <span>Awaiting Rider Pickup</span>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}