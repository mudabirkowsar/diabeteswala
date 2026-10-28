"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Phone,
    Mail,
    MapPin,
    Package,
    Truck,
    CheckCircle2,
    AlertCircle,
    UserCheck,
    CreditCard,
    FileText,
    Key,
    Loader2,
    Calendar,
    ExternalLink
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import PharmacyAPI from '../../../../../../services/PharmacyVendorAPI';
import AllDrivers from '../components/AllDrivers';

// --- SEPARATE DRIVERS COMPONENT ---
// import AllDrivers from './components/AllDrivers';

// Base Media Server Helper
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";

const getMediaUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    return `${BASE_SERVER_URL}/${cleanPath}`;
};

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params?.id;

    // --- Component State ---
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Driver Modal Visibility State
    const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);

    // Fetch Details
    const fetchDetails = async () => {
        if (!orderId) return;
        setLoading(true);
        try {
            const response = await PharmacyAPI.getPharmacyOrderDetails(orderId);
            if (response && response.success) {
                setOrder(response.data);
            } else {
                toast.error("Order details not found");
            }
        } catch (err) {
            console.error("Error fetching order details:", err);
            toast.error("Failed to load order information.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [orderId]);

    // Update Status Handler
    const handleStatusUpdate = async (newStatus, newDeliveryStatus) => {
        setActionLoading(true);
        try {
            const payload = {
                ...(newStatus && { status: newStatus }),
                ...(newDeliveryStatus && { deliveryStatus: newDeliveryStatus })
            };
            const response = await PharmacyAPI.updateOrderStatus(order._id || order.orderId, payload);
            if (response && response.success) {
                toast.success(`Order status updated to ${newStatus || newDeliveryStatus}`);
                fetchDetails();
            }
        } catch (err) {
            console.error("Failed to update order status:", err);
            toast.error("Status update failed. Please try again.");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-600">
                <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={40} />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading Order Breakdown...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle size={48} className="text-rose-500 mb-3" />
                <h2 className="text-xl font-black text-slate-800">Order Not Found</h2>
                <button
                    onClick={() => router.back()}
                    className="mt-4 px-4 py-2 bg-[#3d3f96] text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const {
        orderId: trackingId,
        orderType,
        status,
        deliveryStatus,
        deliveryOTP,
        customer,
        deliveryAddress,
        billSummary,
        items = [],
        prescriptionImages = [],
        assignedDriver,
        timing,
        paymentMethod,
        paymentStatus,
        timestamps
    } = order;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 text-left select-none antialiased">
            <Toaster position="top-right" />

            <div className="max-w-6xl mx-auto space-y-6">

                {/* --- TOP BACK BUTTON & QUICK HEADER --- */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-black text-slate-900 tracking-tight">{trackingId}</h1>
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${orderType === 'Prescription'
                                    ? 'bg-rose-50 text-rose-600 border-rose-200'
                                    : 'bg-indigo-50 text-indigo-600 border-indigo-200'
                                    }`}>
                                    {orderType} Order
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 font-semibold mt-0.5">
                                Placed on {new Date(timestamps?.createdAt || order.createdAt).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Delivery OTP & Current Status */}
                    <div className="flex items-center gap-3">
                        {deliveryOTP && (
                            <div className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-3.5 py-1.5 rounded-xl font-mono text-xs font-black">
                                <Key size={14} />
                                <span>OTP: {deliveryOTP}</span>
                            </div>
                        )}
                        <span className="px-3.5 py-1.5 rounded-xl text-xs font-black uppercase bg-[#3d3f96]/10 text-[#3d3f96] border border-[#3d3f96]/20">
                            {status}
                        </span>
                    </div>
                </div>

                {/* --- WORKFLOW ACTION BAR --- */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Quick Actions:</span>
                        {status === 'Placed' && (
                            <button
                                disabled={actionLoading}
                                onClick={() => handleStatusUpdate('Packed')}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                            >
                                <Package size={14} /> Mark as Packed
                            </button>
                        )}
                        {status === 'Packed' && (
                            <button
                                disabled={actionLoading}
                                onClick={() => handleStatusUpdate('Shipped', 'OutForDelivery')}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                            >
                                <Truck size={14} /> Mark as Shipped
                            </button>
                        )}
                        {status === 'Shipped' && (
                            <button
                                disabled={actionLoading}
                                onClick={() => handleStatusUpdate('Delivered', 'Delivered')}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                            >
                                <CheckCircle2 size={14} /> Complete Delivery
                            </button>
                        )}
                        {status !== 'Cancelled' && status !== 'Delivered' && (
                            <button
                                disabled={actionLoading}
                                onClick={() => handleStatusUpdate('Cancelled')}
                                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-xs rounded-xl transition cursor-pointer"
                            >
                                Cancel Order
                            </button>
                        )}
                    </div>

                    {/* Driver Modal Trigger */}
                    <button
                        onClick={() => setIsDriverModalOpen(true)}
                        className="px-4 py-2 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer flex items-center gap-1.5"
                    >
                        <UserCheck size={14} />
                        <span>{assignedDriver ? 'Reassign Driver' : 'Assign Delivery Partner'}</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* --- LEFT 2 COLUMNS: ITEMS, PRESCRIPTION, TIMINGS --- */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Order Items Table */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
                                    <Package size={16} className="text-[#3d3f96]" />
                                    Prescribed &amp; Ordered Medicines ({items.length})
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase font-black tracking-wider">
                                        <tr>
                                            <th className="py-3 px-5">Medicine</th>
                                            <th className="py-3 px-5">MRP / Price</th>
                                            <th className="py-3 px-5 text-center">Qty</th>
                                            <th className="py-3 px-5 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-bold">
                                        {items.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/50">
                                                <td className="py-3.5 px-5">
                                                    <p className="text-slate-900 font-black text-xs">{item.name}</p>
                                                    {item.duration && (
                                                        <span className="text-[10px] text-slate-400 font-normal">Duration: {item.duration}</span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-5 font-mono">
                                                    <span className="text-slate-400 line-through mr-1 text-[11px]">₹{item.mrp}</span>
                                                    <span className="text-slate-800">₹{item.price}</span>
                                                </td>
                                                <td className="py-3.5 px-5 text-center">
                                                    <span className="px-2 py-1 bg-slate-100 rounded-md font-black">{item.quantity}</span>
                                                </td>
                                                <td className="py-3.5 px-5 text-right font-mono font-black text-slate-900">
                                                    ₹{(item.price || 0) * (item.quantity || 1)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Prescriptions Attached */}
                        {prescriptionImages && prescriptionImages.length > 0 && (
                            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
                                <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
                                    <FileText size={16} className="text-rose-500" /> Attached Doctor Prescriptions (Rx)
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {prescriptionImages.map((img, idx) => {
                                        const fullImgUrl = getMediaUrl(img);
                                        return (
                                            <a
                                                key={idx}
                                                href={fullImgUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="group relative rounded-xl overflow-hidden border border-slate-200 aspect-square bg-slate-100 block"
                                            >
                                                <img
                                                    src={fullImgUrl}
                                                    alt={`Prescription ${idx + 1}`}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[11px] font-bold gap-1">
                                                    <ExternalLink size={12} /> View Full
                                                </div>
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Delivery Slot Details */}
                        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 text-[#3d3f96] rounded-2xl">
                                <Calendar size={22} />
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Scheduled Delivery Slot</h4>
                                <p className="text-sm font-black text-slate-800 mt-0.5">
                                    {timing?.appointmentTime || 'Standard Same-Day Window'}
                                </p>
                                {timing?.appointmentDate && (
                                    <p className="text-xs text-slate-500 font-semibold">
                                        Date: {new Date(timing.appointmentDate).toDateString()}
                                    </p>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* --- RIGHT COLUMN: PATIENT, DRIVER & BILL SUMMARY --- */}
                    <div className="space-y-6">

                        {/* Customer & Address Details */}
                        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                            <h3 className="font-black text-slate-800 text-sm">Customer &amp; Address</h3>

                            {/* Customer Profile */}
                            <div className="space-y-1.5 pb-3 border-b border-slate-100 text-xs font-bold">
                                <p className="text-slate-900 font-black text-sm">{customer?.name}</p>
                                <a href={`tel:${customer?.phone}`} className="flex items-center gap-1.5 text-[#3d3f96] hover:underline">
                                    <Phone size={12} /> {customer?.phone}
                                </a>
                                {customer?.email && (
                                    <a href={`mailto:${customer?.email}`} className="flex items-center gap-1.5 text-slate-500 hover:underline">
                                        <Mail size={12} /> {customer?.email}
                                    </a>
                                )}
                            </div>

                            {/* Delivery Location */}
                            <div className="space-y-1 text-xs">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                    <MapPin size={11} /> Shipping Address
                                </span>
                                <p className="text-slate-700 font-semibold leading-relaxed">
                                    {[
                                        deliveryAddress?.houseNo,
                                        deliveryAddress?.sector,
                                        deliveryAddress?.landmark,
                                        deliveryAddress?.city,
                                        deliveryAddress?.state,
                                        deliveryAddress?.pincode
                                    ].filter(Boolean).join(", ")}
                                </p>
                            </div>
                        </div>

                        {/* Current Driver Card */}
                        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-black text-slate-800 text-sm">Delivery Partner</h3>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    {deliveryStatus || 'Pending'}
                                </span>
                            </div>

                            {assignedDriver ? (
                                <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-[#3d3f96] flex items-center justify-center font-black">
                                        <Truck size={18} />
                                    </div>
                                    <div className="text-xs">
                                        <p className="font-black text-slate-900">{assignedDriver.name || "Assigned Driver"}</p>
                                        <p className="text-slate-500">{assignedDriver.phone}</p>
                                        {assignedDriver.vehicleNumber && (
                                            <span className="text-[10px] font-mono text-slate-400">{assignedDriver.vehicleNumber}</span>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                    <Truck size={20} className="mx-auto text-slate-300 mb-1" />
                                    <p className="text-xs text-slate-400 font-bold">No driver assigned yet</p>
                                    <button
                                        onClick={() => setIsDriverModalOpen(true)}
                                        className="mt-2 text-xs font-bold text-[#3d3f96] hover:underline cursor-pointer"
                                    >
                                        Assign Now
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Bill Summary */}
                        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
                            <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
                                <CreditCard size={16} className="text-[#3d3f96]" /> Payment Breakdown
                            </h3>
                            <div className="space-y-2 text-xs font-bold divide-y divide-slate-100">
                                <div className="flex justify-between text-slate-600 pt-1">
                                    <span>Item Subtotal</span>
                                    <span className="font-mono">₹{billSummary?.itemTotal || 0}</span>
                                </div>
                                <div className="flex justify-between text-slate-600 pt-2">
                                    <span>Delivery Charge</span>
                                    <span className="font-mono">₹{billSummary?.deliveryCharge || 0}</span>
                                </div>
                                {billSummary?.couponDiscount > 0 && (
                                    <div className="flex justify-between text-emerald-600 pt-2">
                                        <span>Coupon Savings</span>
                                        <span className="font-mono">-₹{billSummary.couponDiscount}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-slate-900 text-sm font-black pt-3">
                                    <span>Grand Total</span>
                                    <span className="font-mono text-[#3d3f96]">₹{billSummary?.totalAmount || order.totalAmount || 0}</span>
                                </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                                <span className="text-slate-400 uppercase">Method</span>
                                <span className="uppercase text-slate-700">{paymentMethod} ({paymentStatus})</span>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            {/* --- SEPARATE ALL DRIVERS MODAL COMPONENT --- */}
            <AllDrivers
                isOpen={isDriverModalOpen}
                onClose={() => setIsDriverModalOpen(false)}
                orderId={order._id || order.orderId}
                assignedDriver={assignedDriver}
                onDriverAssigned={fetchDetails}
            />

        </div>
    );
}