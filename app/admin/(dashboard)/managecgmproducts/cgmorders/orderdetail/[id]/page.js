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
    ExternalLink,
    RotateCcw,
    X,
    ShieldAlert
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Admin API helper functions
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

    // Refund Modal States
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
    const [refundNote, setRefundNote] = useState("100% refund approved by Admin as user cancelled prior to dispatch.");
    const [processingRefund, setProcessingRefund] = useState(false);

    const fetchOrderDetails = async () => {
        if (!id) return;
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

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    // Handle 100% Refund Process
    const handleProcessRefund = async () => {
        if (!order) return;

        setProcessingRefund(true);
        try {
            const orderIdentifier = order.orderId || order._id;
            const payload = {
                refundNote: refundNote.trim() || undefined
            };

            const response = await AdminAPI.processAdminCgmRefund(orderIdentifier, payload);

            if (response && response.success) {
                toast.success(response.message || "100% refund processed successfully!");
                setIsRefundModalOpen(false);

                // Update order state locally or re-fetch details
                if (response.refundDetails) {
                    setOrder((prev) => ({
                        ...prev,
                        paymentStatus: response.paymentStatus || 'Refunded',
                        refundDetails: response.refundDetails
                    }));
                } else {
                    // Refetch updated details
                    await fetchOrderDetails();
                }
            } else {
                toast.error(response?.message || "Failed to process refund");
            }
        } catch (err) {
            console.error("Refund processing error:", err);
            toast.error(err.response?.data?.message || "Error occurred while processing refund.");
        } finally {
            setProcessingRefund(false);
        }
    };

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
    const refundDetails = order.refundDetails || {};

    // Condition checks for cancellations and refunds
    const isCancelled = order.status?.toLowerCase() === 'cancelled';
    const isRefundProcessed = order.paymentStatus === 'Refunded' || refundDetails.refundStatus === 'Processed';
    const refundAmount = refundDetails.refundAmount || bill.totalPayable || order.totalAmount || 0;

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
                    <span className={`text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl border ${
                        isCancelled
                            ? 'bg-rose-50 text-rose-600 border-rose-200'
                            : 'bg-slate-900 text-white border-slate-900'
                    }`}>
                        {order.status}
                    </span>
                </div>
            </div>

            {/* Cancelled Order & Refund Management Card */}
            {isCancelled && (
                <div className={`rounded-3xl p-6 border shadow-sm ${
                    isRefundProcessed 
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
                        : 'bg-rose-50/70 border-rose-200 text-rose-950'
                }`}>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                {isRefundProcessed ? (
                                    <CheckCircle2 className="text-emerald-600" size={20} />
                                ) : (
                                    <ShieldAlert className="text-rose-600" size={20} />
                                )}
                                <h3 className="text-base font-black tracking-tight">
                                    {isRefundProcessed 
                                        ? "100% Refund Completed" 
                                        : "Order Cancelled — 100% Refund Pending"}
                                </h3>
                            </div>
                            <p className="text-xs text-slate-600 max-w-2xl font-medium">
                                {isRefundProcessed
                                    ? `A full refund of ₹${refundAmount.toLocaleString('en-IN')} has been settled via Razorpay directly to the user's payment method.`
                                    : `This order was cancelled before dispatch. The customer is eligible for a full 100% payout of ₹${refundAmount.toLocaleString('en-IN')} without penalties.`
                                }
                            </p>

                            {/* Additional Refund Metadata if already processed */}
                            {isRefundProcessed && (
                                <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-emerald-900">
                                    {refundDetails.razorpayRefundId && (
                                        <div className="bg-emerald-100/80 px-2.5 py-1 rounded-lg">
                                            <span className="font-bold text-[10px] uppercase text-emerald-700 block">Razorpay Refund ID</span>
                                            <span className="font-mono text-xs">{refundDetails.razorpayRefundId}</span>
                                        </div>
                                    )}
                                    {refundDetails.refundedAt && (
                                        <div className="bg-emerald-100/80 px-2.5 py-1 rounded-lg">
                                            <span className="font-bold text-[10px] uppercase text-emerald-700 block">Settled At</span>
                                            <span>{new Date(refundDetails.refundedAt).toLocaleString('en-IN')}</span>
                                        </div>
                                    )}
                                    {refundDetails.refundNote && (
                                        <div className="bg-emerald-100/80 px-2.5 py-1 rounded-lg max-w-md">
                                            <span className="font-bold text-[10px] uppercase text-emerald-700 block">Audit Note</span>
                                            <span className="line-clamp-2">{refundDetails.refundNote}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Action Button: ONLY IF CANCELLED AND NOT YET PROCESSED */}
                        {!isRefundProcessed && (
                            <button
                                type="button"
                                onClick={() => setIsRefundModalOpen(true)}
                                className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs px-5 py-3 rounded-2xl shadow-sm transition active:scale-95 shrink-0 cursor-pointer"
                            >
                                <RotateCcw size={16} /> Process 100% Refund (₹{refundAmount.toLocaleString('en-IN')})
                            </button>
                        )}
                    </div>
                </div>
            )}

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
                            {order.paymentMethod} • <span className={
                                order.paymentStatus === 'Paid' 
                                    ? 'text-emerald-600 font-black' 
                                    : order.paymentStatus === 'Refunded'
                                    ? 'text-purple-600 font-black'
                                    : 'text-amber-600 font-black'
                            }>
                                {order.paymentStatus}
                            </span>
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
                                <span className={`font-black ${
                                    order.paymentStatus === 'Paid' 
                                        ? 'text-emerald-600' 
                                        : order.paymentStatus === 'Refunded'
                                        ? 'text-purple-600'
                                        : 'text-amber-600'
                                }`}>
                                    {order.paymentStatus}
                                </span>
                            </div>
                        </div>
                    </div>

                </div>

            </div>

            {/* PROCESS REFUND MODAL */}
            {isRefundModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-2 text-slate-900 font-black text-base">
                                <RotateCcw size={18} className="text-rose-600" />
                                Process 100% Refund
                            </div>
                            <button
                                onClick={() => !processingRefund && setIsRefundModalOpen(false)}
                                disabled={processingRefund}
                                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Order & Amount Details */}
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-bold">Order ID:</span>
                                <span className="font-mono font-black text-slate-900">{order.orderId}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-bold">Customer:</span>
                                <span className="font-bold text-slate-900">{customer.name || "Customer"}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-bold">Transaction ID:</span>
                                <span className="font-mono text-slate-700">{order.transactionId || "N/A"}</span>
                            </div>
                            <div className="border-t border-slate-200/80 pt-2 flex justify-between items-center">
                                <span className="text-xs font-black text-slate-800">Refund Amount (100%):</span>
                                <span className="font-mono font-black text-base text-rose-600">
                                    ₹{refundAmount.toLocaleString('en-IN')}
                                </span>
                            </div>
                        </div>

                        {/* Audit Note */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                                Audit Note / Reason (Optional)
                            </label>
                            <textarea
                                value={refundNote}
                                onChange={(e) => setRefundNote(e.target.value)}
                                rows={3}
                                placeholder="Enter an audit note for this refund payout..."
                                className="w-full text-xs font-medium text-slate-800 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#3d3f96]/20 focus:border-[#3d3f96]"
                            />
                            <p className="text-[10px] text-slate-400 font-medium">
                                This note will be recorded in the order tracking history and refund audit log.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsRefundModalOpen(false)}
                                disabled={processingRefund}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleProcessRefund}
                                disabled={processingRefund}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md transition disabled:opacity-50 cursor-pointer"
                            >
                                {processingRefund ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        Initiating Razorpay Refund...
                                    </>
                                ) : (
                                    <>
                                        <RotateCcw size={14} />
                                        Confirm & Process Refund
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}