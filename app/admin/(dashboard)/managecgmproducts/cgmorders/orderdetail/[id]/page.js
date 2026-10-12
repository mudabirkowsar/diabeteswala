"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Loader2,
    Calendar,
    Phone,
    Mail,
    MapPin,
    Package,
    ShieldCheck,
    CreditCard,
    FileText,
    CheckCircle2,
    Clock,
    User,
    Activity,
    AlertCircle,
    Truck,
    Info,
    ExternalLink
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Update this import to where your API functions are declared
import AdminAPI from '../../../../../../services/AdminAPI';

// Base media helper for images & PDFs
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";

const getMediaUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    return `${BASE_SERVER_URL}/${cleanPath}`;
};

const USER_PLACEHOLDER = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150";
const PRODUCT_PLACEHOLDER = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=300";

export default function CgmOrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const fetchOrderDetails = async () => {
            setLoading(true);
            try {
                const response = await AdminAPI.getAdminCgmOrderDetailsById(id);
                if (response && response.success) {
                    setOrder(response.data);
                } else {
                    toast.error(response?.message || "Order not found");
                }
            } catch (err) {
                console.error("Error retrieving order details:", err);
                toast.error(err.response?.data?.message || "Failed to load order details");
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={38} />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Loading CGM Order Details...
                </p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="w-14 h-14 text-rose-400 mb-3" />
                <h2 className="text-lg font-bold text-slate-800">Order Not Found</h2>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    The requested CGM/Glucometer order could not be located.
                </p>
                <button
                    onClick={() => router.back()}
                    className="mt-5 px-4 py-2 bg-[#3d3f96] text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                    Return to Orders
                </button>
            </div>
        );
    }

    const customer = order.userId || {};
    const device = order.device || {};
    const deviceConfig = device.deviceId || {};
    const glucoSpecs = deviceConfig?.glucometerConfig?.specifications || {};
    const cgmConfig = deviceConfig?.cgmConfig || {};
    const address = order.deliveryAddress || {};
    const coach = order.coachConsultation || {};
    const bill = order.billSummary || {};

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 antialiased text-slate-800 text-left">
            <Toaster position="top-right" />

            {/* Back Button & Top Action Strip */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl transition cursor-pointer shadow-sm"
                >
                    <ArrowLeft size={14} /> Back to Orders
                </button>

                <div className="flex items-center gap-3">
                    {order.deliveryOtp && (
                        <div className="bg-red-50 text-red-600 border border-red-200/80 px-3 py-1.5 rounded-xl text-xs font-mono font-black tracking-wider flex items-center gap-1.5">
                            <span>OTP:</span>
                            <span className="text-sm">{order.deliveryOtp}</span>
                        </div>
                    )}
                    <span className="text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-xl border bg-slate-900 text-white">
                        {order.status}
                    </span>
                </div>
            </div>

            {/* Order Overview Header Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <span className="text-[10px] font-black uppercase text-[#3d3f96] tracking-widest bg-[#3d3f96]/10 px-2.5 py-1 rounded-md">
                        {device.productType || 'Medical Device'} Order
                    </span>
                    <h1 className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
                        {order.orderId}
                    </h1>
                    <p className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 mt-1">
                        <Calendar size={13} />
                        Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric"
                        })} at {new Date(order.createdAt).toLocaleTimeString("en-IN", {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                        })}
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 border border-slate-200/60 p-4 rounded-2xl w-full md:w-auto">
                    <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Payable</span>
                        <p className="text-xl font-black font-mono text-slate-900">
                            ₹{bill.totalPayable?.toLocaleString('en-IN') || order.totalAmount || 0}
                        </p>
                    </div>
                    <div className="h-8 w-px bg-slate-200" />
                    <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Payment</span>
                        <p className="text-xs font-bold text-slate-800">
                            {order.paymentMethod} • <span className={order.paymentStatus === 'Paid' ? 'text-emerald-600 font-black' : 'text-amber-600 font-black'}>{order.paymentStatus}</span>
                        </p>
                        {order.transactionId && (
                            <span className="text-[9px] text-slate-400 font-mono block">Txn: {order.transactionId}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Grid: 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT 2 COLS: Product, Coach, Addons */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Device / Product Details */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
                        <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                            <Package size={16} className="text-[#3d3f96]" />
                            Device & Product Configuration
                        </h2>

                        <div className="flex flex-col sm:flex-row gap-5">
                            <img
                                src={getMediaUrl(device.mainImage) || PRODUCT_PLACEHOLDER}
                                alt={device.title}
                                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                                onError={(e) => { e.currentTarget.src = PRODUCT_PLACEHOLDER; }}
                            />
                            <div className="space-y-2 flex-1">
                                <div>
                                    <span className="text-[9px] font-black uppercase text-[#3d3f96] bg-[#3d3f96]/10 px-2 py-0.5 rounded">
                                        {device.brand} • {device.deviceModel}
                                    </span>
                                    <h3 className="text-base font-extrabold text-slate-900 mt-1">
                                        {device.title}
                                    </h3>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <div>
                                        <span className="text-[10px] text-slate-400 font-bold block">Selected Variant</span>
                                        <p className="font-extrabold text-slate-800">{device.selectedVariant?.variantName || "Standard"}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-400 font-bold block">Quantity</span>
                                        <p className="font-extrabold text-slate-800">x{device.quantity || 1}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-400 font-bold block">Unit Price / MRP</span>
                                        <p className="font-extrabold text-slate-800">
                                            ₹{device.unitPrice} <span className="line-through text-slate-400 font-normal">₹{device.unitMrp}</span>
                                        </p>
                                    </div>
                                </div>

                                {deviceConfig?.userManualPdf && (
                                    <a
                                        href={getMediaUrl(deviceConfig.userManualPdf)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-xs text-[#3d3f96] font-bold hover:underline mt-1"
                                    >
                                        <FileText size={13} /> View User Manual (PDF) <ExternalLink size={11} />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Specs for CGM or Glucometer */}
                        {device.productType === 'CGM' && cgmConfig && (
                            <div className="border-t border-slate-100 pt-4">
                                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                                    CGM Sensor Specifications
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                    <div className="bg-slate-50 p-2.5 rounded-xl">
                                        <span className="text-[10px] text-slate-400 block font-bold">Lifespan</span>
                                        <p className="font-bold text-slate-800">{cgmConfig.sensorLifeSpanDays || 15} Days</p>
                                    </div>
                                    <div className="bg-slate-50 p-2.5 rounded-xl">
                                        <span className="text-[10px] text-slate-400 block font-bold">Warmup Time</span>
                                        <p className="font-bold text-slate-800">{cgmConfig.sensorWarmupTime || 'N/A'}</p>
                                    </div>
                                    <div className="bg-slate-50 p-2.5 rounded-xl">
                                        <span className="text-[10px] text-slate-400 block font-bold">Water Resistance</span>
                                        <p className="font-bold text-slate-800">{cgmConfig.waterResistance || 'N/A'}</p>
                                    </div>
                                    <div className="bg-slate-50 p-2.5 rounded-xl">
                                        <span className="text-[10px] text-slate-400 block font-bold">Coach Included</span>
                                        <p className="font-bold text-teal-600">{cgmConfig.isCoachSupportIncluded ? 'Yes' : 'No'}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {device.productType === 'Glucometer' && glucoSpecs && (
                            <div className="border-t border-slate-100 pt-4">
                                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                                    Glucometer Specifications
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                    <div className="bg-slate-50 p-2.5 rounded-xl">
                                        <span className="text-[10px] text-slate-400 block font-bold">Accuracy</span>
                                        <p className="font-bold text-slate-800">{glucoSpecs.accuracyTesting || 'Standard'}</p>
                                    </div>
                                    <div className="bg-slate-50 p-2.5 rounded-xl">
                                        <span className="text-[10px] text-slate-400 block font-bold">Sample Size</span>
                                        <p className="font-bold text-slate-800">{glucoSpecs.bloodSampleSize || '0.5 µL'}</p>
                                    </div>
                                    <div className="bg-slate-50 p-2.5 rounded-xl">
                                        <span className="text-[10px] text-slate-400 block font-bold">Duration</span>
                                        <p className="font-bold text-slate-800">{glucoSpecs.testDurationSeconds || 5}s</p>
                                    </div>
                                    <div className="bg-slate-50 p-2.5 rounded-xl">
                                        <span className="text-[10px] text-slate-400 block font-bold">Warranty</span>
                                        <p className="font-bold text-emerald-600">{glucoSpecs.warranty || 'Available'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Add-ons Section */}
                    {order.addons && order.addons.length > 0 && (
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                                <ShieldCheck size={16} className="text-[#3d3f96]" />
                                Accessories & Add-ons ({order.addons.length})
                            </h2>
                            <div className="divide-y divide-slate-100">
                                {order.addons.map((addon) => (
                                    <div key={addon._id} className="py-3 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            {addon.addonId?.imageUrl ? (
                                                <img
                                                    src={getMediaUrl(addon.addonId.imageUrl)}
                                                    alt={addon.name}
                                                    className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                                                    <Package size={16} />
                                                </div>
                                            )}
                                            <div>
                                                <h4 className="text-xs font-extrabold text-slate-800">{addon.name}</h4>
                                                <p className="text-[10px] text-slate-400 line-clamp-1">
                                                    {addon.addonId?.description || "Device accessory"}
                                                </p>
                                                <span className="text-[10px] font-bold text-slate-500">
                                                    Qty: {addon.quantity} × ₹{addon.price}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-mono text-xs font-black text-slate-900">
                                                ₹{addon.totalPrice}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Coach Consultation Info */}
                    {coach.isIncluded && (
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                                <Activity size={16} className="text-[#3d3f96]" />
                                Dedicated Diabetes Coach Consultation
                            </h2>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-teal-50/50 border border-teal-100 p-4 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-teal-200 shrink-0">
                                        <img
                                            src={getMediaUrl(coach.coachId?.profileImage) || USER_PLACEHOLDER}
                                            alt={coach.coachName}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.currentTarget.src = USER_PLACEHOLDER; }}
                                        />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-slate-900">{coach.coachName}</h4>
                                        <p className="text-[10px] font-bold text-teal-700">{coach.coachId?.qualification || "Diabetes Coach"}</p>
                                        <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                            <Phone size={10} /> {coach.coachId?.phone || "No direct phone"}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-left sm:text-right space-y-1">
                                    <span className="text-[10px] font-black uppercase tracking-wider bg-teal-600 text-white px-2.5 py-0.5 rounded-full">
                                        {coach.consultationMode} Session
                                    </span>
                                    {coach.scheduledDate && (
                                        <p className="text-[11px] font-bold text-slate-700 flex sm:justify-end items-center gap-1">
                                            <Calendar size={11} /> {coach.scheduledDate} at {coach.slotTime}
                                        </p>
                                    )}
                                    <span className="text-[10px] font-bold text-slate-500 block">
                                        Total Fee: ₹{coach.charge || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tracking Timeline */}
                    {order.trackingTimeline && order.trackingTimeline.length > 0 && (
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                                <Clock size={16} className="text-[#3d3f96]" />
                                Order History & Timeline
                            </h2>
                            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                                {order.trackingTimeline.map((step) => (
                                    <div key={step._id} className="relative">
                                        <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-[#3d3f96] border-2 border-white shadow-sm" />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">{step.status}</h4>
                                                <span className="text-[10px] text-slate-400 font-semibold">
                                                    {new Date(step.timestamp).toLocaleString("en-IN")}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-600 font-medium mt-0.5">{step.note}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

                {/* RIGHT 1 COL: Customer, Address, Bill Summary */}
                <div className="space-y-6">

                    {/* Customer Info Card */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                        <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                            <User size={16} className="text-[#3d3f96]" /> Customer Profile
                        </h2>

                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                                <img
                                    src={getMediaUrl(customer.profilePic) || USER_PLACEHOLDER}
                                    alt={customer.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.currentTarget.src = USER_PLACEHOLDER; }}
                                />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-xs font-black text-slate-900 truncate">{customer.name || "Customer"}</h3>
                                <p className="text-[10px] text-slate-400 font-bold">{customer.gender || 'Not specified'}</p>
                            </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400 font-bold flex items-center gap-1.5"><Phone size={12} /> Phone</span>
                                <a href={`tel:${customer.phone}`} className="font-extrabold text-[#3d3f96] hover:underline">
                                    {customer.phone || 'N/A'}
                                </a>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400 font-bold flex items-center gap-1.5"><Mail size={12} /> Email</span>
                                <span className="font-semibold text-slate-700 truncate max-w-[150px]">{customer.email || 'N/A'}</span>
                            </div>
                            {order.diabetesProfile && (
                                <div className="flex items-center justify-between bg-amber-50/60 p-2 rounded-xl text-amber-900 font-bold mt-2">
                                    <span>Diabetes Type:</span>
                                    <span>{order.diabetesProfile.diabetesType || "N/A"}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Delivery Address Card */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                                <MapPin size={16} className="text-[#3d3f96]" /> Delivery Address
                            </h2>
                            <span className="text-[9px] font-black uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                                {address.addressType || "Home"}
                            </span>
                        </div>
                        <div className="text-xs space-y-1 text-slate-600 font-medium">
                            <p className="font-black text-slate-800">{address.name}</p>
                            <p>{address.houseNo}, {address.sector}</p>
                            {address.landmark && <p className="text-slate-400">Near: {address.landmark}</p>}
                            <p className="font-bold text-slate-700">{address.city}, {address.state} - {address.pincode}</p>
                            <p className="text-slate-500 font-semibold pt-1">Contact: {address.phone}</p>
                        </div>
                    </div>

                    {/* Bill Summary Card */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                        <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                            <CreditCard size={16} className="text-[#3d3f96]" /> Bill Breakdown
                        </h2>

                        <div className="space-y-2 text-xs divide-y divide-slate-100 font-semibold">
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-slate-500">Device Item Total</span>
                                <span className="text-slate-800 font-bold">₹{bill.itemTotal || 0}</span>
                            </div>

                            {bill.deviceSavings > 0 && (
                                <div className="flex justify-between items-center pt-2 text-emerald-600">
                                    <span>Device MRP Savings</span>
                                    <span>-₹{bill.deviceSavings}</span>
                                </div>
                            )}

                            {bill.addonsTotal > 0 && (
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-slate-500">Accessories Total</span>
                                    <span className="text-slate-800 font-bold">₹{bill.addonsTotal}</span>
                                </div>
                            )}

                            {bill.coachChargeTotal > 0 && (
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-slate-500">Coach Consultation</span>
                                    <span className="text-slate-800 font-bold">₹{bill.coachChargeTotal}</span>
                                </div>
                            )}

                            {bill.couponDiscount > 0 && (
                                <div className="flex justify-between items-center pt-2 text-emerald-600">
                                    <span>Coupon Discount</span>
                                    <span>-₹{bill.couponDiscount}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-3 text-sm font-black text-slate-900">
                                <span>Grand Total</span>
                                <span className="font-mono text-base">₹{bill.totalPayable?.toLocaleString('en-IN') || 0}</span>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-[11px] space-y-1">
                            <div className="flex justify-between">
                                <span className="text-slate-400 font-bold">Payment Method:</span>
                                <span className="font-extrabold text-slate-700">{order.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400 font-bold">Payment Status:</span>
                                <span className={`font-black ${order.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {order.paymentStatus}
                                </span>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}