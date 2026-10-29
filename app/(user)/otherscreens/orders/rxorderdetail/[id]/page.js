"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    FileText,
    Store,
    Calendar,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
    CreditCard,
    DollarSign,
    ExternalLink,
    MapPin,
    Pill,
    Sparkles,
    ShieldCheck,
    Lock,
    Phone,
    RefreshCw,
    Key,
    PackageCheck,
    Receipt,
    Bike,
    Truck,
    User,
    Check,
    CircleDot,
    RotateCcw,
    Tag,
    Copy,
    ChevronDown,
    X,
    UploadCloud,
    Trash2,
    Ban
} from 'lucide-react';

// API Service & Notification Context
import UserAPI from '../../../../../services/UserAPI';
import { useNotification } from '../../../../../context/NotificationContext';

// --- MEDIA URL HELPER ---
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";
const PLACEHOLDER_STORE = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=300";
const PLACEHOLDER_DRIVER = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200";

const getMediaUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }
    const cleanBase = BASE_SERVER_URL.replace(/\/+$/, '');
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
};

// --- DYNAMIC RAZORPAY SCRIPT LOADER ---
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (typeof window !== "undefined" && window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export default function RxOrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const mongoRequestId = params?.id;
    const { showNotification } = useNotification();

    // --- State Management ---
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [copiedOtp, setCopiedOtp] = useState(false);

    // Collapsible Timeline State
    const [isTimelineOpen, setIsTimelineOpen] = useState(true);

    // Payment & Confirmation State
    const [paymentMethod, setPaymentMethod] = useState("COD"); // "COD" | "Online"
    const [paying, setPaying] = useState(false);
    const [confirmedOrderData, setConfirmedOrderData] = useState(null);

    // --- Modals State ---
    // 1. Cancel Modal
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [cancelling, setCancelling] = useState(false);

    // 2. Return / Replacement Modal
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [returnRequestType, setReturnRequestType] = useState("Return"); // "Return" | "Replacement"
    const [returnReason, setReturnReason] = useState("");
    const [userComments, setUserComments] = useState("");
    const [proofFiles, setProofFiles] = useState([]);
    const [submittingReturn, setSubmittingReturn] = useState(false);

    // --- Fetch Request Details ---
    const fetchDetails = useCallback(async (isRefresh = false) => {
        if (!mongoRequestId) return;
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const res = await UserAPI.getUserPrescriptionRequestDetails(mongoRequestId);
            if (res && res.success) {
                setRequest(res.data);
                if (isRefresh) showNotification("Prescription tracking refreshed!", "success");
            } else {
                showNotification(res?.message || "Failed to load prescription order specifications.", "error");
            }
        } catch (err) {
            console.error("Error fetching Rx details:", err);
            showNotification(err?.response?.data?.message || err?.message || "Failed to load prescription details.", "error");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [mongoRequestId, showNotification]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    // Copy OTP Helper
    const copyToClipboard = (text) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedOtp(true);
        showNotification("Delivery OTP copied to clipboard", "success");
        setTimeout(() => setCopiedOtp(false), 2000);
    };

    // --- Status Normalization & Rules ---
    const normalizedStatus = (request?.status || "").toUpperCase().trim();
    const normalizedDeliveryStatus = (request?.deliveryStatus || "").toUpperCase().trim();

    // Order placed status
    const isOrderPlaced =
        Boolean(confirmedOrderData) ||
        Boolean(request?.bookingId) ||
        Boolean(request?.bookingOrderId) ||
        ['PLACED', 'PACKED', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'PAID'].includes(normalizedStatus);

    const isRejected = ['REJECTED', 'CANCELLED'].includes(normalizedStatus);

    const isPharmacyAccepted =
        !isOrderPlaced &&
        !isRejected &&
        (['BILL GENERATED', 'PENDING PAYMENT', 'ACCEPTED'].includes(normalizedStatus) ||
            Boolean(request?.verifiedBill) ||
            Boolean(request?.items && request.items.length > 0));

    // Target tracking IDs for API calls
    const targetOrderId =
        request?.bookingOrderId ||
        confirmedOrderData?.orderId ||
        request?.orderId ||
        request?.requestId ||
        request?._id ||
        mongoRequestId;

    // Delivery Guard: Is order delivered?
    const isDelivered = normalizedStatus === 'DELIVERED' || normalizedDeliveryStatus === 'DELIVERED';

    // Transit Guard: Has transit started?
    const inTransitStatuses = ['OUTFOR DELIVERY', 'OUT_FOR_DELIVERY', 'OUTFORDELIVERY', 'REACHEDLOCATION', 'PICKEDUP', 'SHIPPED', 'DELIVERED'];
    const isInTransit = inTransitStatuses.includes(normalizedDeliveryStatus) || inTransitStatuses.includes(normalizedStatus);

    // Can order be cancelled? (Only early stages: Placed, Packed, Pending and NOT in transit)
    const isCancellable =
        isOrderPlaced &&
        !isRejected &&
        !isDelivered &&
        !isInTransit &&
        ['PLACED', 'PACKED', 'PENDING'].includes(normalizedStatus);

    // Return & Replacement eligibility checks
    const returnDetails = request?.returnDetails;
    const hasActiveReturn = Boolean(returnDetails && returnDetails.status && returnDetails.status !== "None");

    const itemsList = request?.items && request.items.length > 0 ? request.items : (request?.requestedMedicines || []);
    const hasReturnEligibleItems = itemsList.some(item => item.isReturnAllowed || item.isReplacementAllowed);

    // Can request return / replacement?
    const canRequestReturn = isDelivered && !hasActiveReturn && hasReturnEligibleItems;

    // Calculate financials
    const itemsCalculatedTotal = itemsList.reduce((acc, it) => acc + (Number(it.price || it.mrp || 0) * Number(it.quantity || 1)), 0);
    const deliveryFee = Number(request?.verifiedBill?.deliveryCharge || 0);
    const grandTotal = Number(request?.verifiedBill?.totalAmount) || (itemsCalculatedTotal + deliveryFee);

    const activeDeliveryOtp = request?.deliveryOTP || request?.liveTracking?.deliveryOTP || confirmedOrderData?.deliveryOTP;
    const finalTrackingOrderId = request?.bookingOrderId || confirmedOrderData?.orderId || request?.confirmedOrderId;

    // --- 1. Confirm & Pay Handler ---
    const handlePayAndConfirm = async () => {
        if (!isPharmacyAccepted) {
            showNotification("Pharmacy has not approved or generated the quote yet.", "error");
            return;
        }

        setPaying(true);

        try {
            const targetMongoId = request?._id || mongoRequestId;

            const payload = {
                _id: targetMongoId,
                requestId: targetMongoId,
                paymentMethod: paymentMethod
            };

            const res = await UserAPI.payAndConfirmOrder(payload);

            if (!res || !res.success) {
                showNotification(res?.message || "Could not confirm order.", "error");
                setPaying(false);
                return;
            }

            if (paymentMethod === "COD") {
                showNotification(res.message || "Prescription order confirmed with COD!", "success");
                setConfirmedOrderData(res.data);
                fetchDetails();
                setPaying(false);
                return;
            }

            const razorpayKey = res.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
            const razorpayOrderId = res.razorpayOrderId;
            const payableAmount = res.amount || (grandTotal * 100);

            if (!razorpayKey || !razorpayOrderId) {
                showNotification("Payment gateway configuration missing. Please try COD.", "error");
                setPaying(false);
                return;
            }

            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                showNotification("Could not load payment gateway. Please check your internet connection.", "error");
                setPaying(false);
                return;
            }

            const options = {
                key: razorpayKey,
                amount: payableAmount,
                currency: "INR",
                name: request.pharmacyId?.name || "Partner Pharmacy",
                description: `Prescription #${request.requestId || targetMongoId}`,
                order_id: razorpayOrderId,
                handler: async function (response) {
                    try {
                        setPaying(true);
                        const verifyPayload = {
                            _id: targetMongoId,
                            requestId: targetMongoId,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        };

                        const verifyRes = await UserAPI.verifyPrescriptionRequestPayment(verifyPayload);

                        if (verifyRes && verifyRes.success) {
                            showNotification(verifyRes.message || "Payment verified! Order placed successfully.", "success");
                            setConfirmedOrderData(verifyRes.data);
                            fetchDetails();
                        } else {
                            showNotification(verifyRes?.message || "Online payment verification failed.", "error");
                        }
                    } catch (verifyErr) {
                        console.error("Payment Verification Error:", verifyErr);
                        showNotification(verifyErr?.response?.data?.message || "Payment verification failed.", "error");
                    } finally {
                        setPaying(false);
                    }
                },
                prefill: {
                    name: request.deliveryAddress?.name || request.address?.name || "",
                    contact: request.deliveryAddress?.phone || request.address?.phone || ""
                },
                theme: { color: "#3d3f96" },
                modal: {
                    ondismiss: function () {
                        setPaying(false);
                        showNotification("Payment cancelled. You can retry when ready.", "info");
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (failRes) {
                console.error("Razorpay Payment Failure:", failRes.error);
                showNotification(failRes.error?.description || "Payment failed at gateway.", "error");
                setPaying(false);
            });
            rzp.open();

        } catch (err) {
            console.error("Payment error:", err);
            showNotification(err?.response?.data?.message || err?.message || "Payment processing failed.", "error");
            setPaying(false);
        }
    };

    // --- 2. Cancel Order Handler ---
    const handleCancelOrderSubmit = async (e) => {
        e.preventDefault();
        if (!targetOrderId) {
            showNotification("Order identifier missing.", "error");
            return;
        }

        setCancelling(true);
        try {
            const payload = {
                orderId: targetOrderId,
                reason: cancelReason || "Cancelled by customer before dispatch."
            };

            const res = await UserAPI.cancelUserPharmacyOrder(payload);

            if (res && res.success) {
                showNotification(res.message || "Order cancelled successfully.", "success");
                setIsCancelModalOpen(false);
                setCancelReason("");
                fetchDetails(true);
            } else {
                showNotification(res?.message || "Failed to cancel order.", "error");
            }
        } catch (err) {
            console.error("Cancel Order Error:", err);
            const errMsg = err?.response?.data?.message || err?.message || "Failed to cancel order.";
            showNotification(errMsg, "error");
        } finally {
            setCancelling(false);
        }
    };

    // --- 3. Return / Replacement File Handler ---
    const handleProofFileChange = (e) => {
        const selected = Array.from(e.target.files || []);
        if (proofFiles.length + selected.length > 5) {
            showNotification("You can upload a maximum of 5 proof images.", "error");
            return;
        }

        // Validate image types
        const validImages = selected.filter(file => file.type.startsWith('image/'));
        if (validImages.length !== selected.length) {
            showNotification("Only image files (JPG, PNG, WEBP) are permitted.", "error");
        }

        setProofFiles(prev => [...prev, ...validImages].slice(0, 5));
    };

    const removeProofFile = (indexToRemove) => {
        setProofFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    // --- 4. Return / Replacement Submit Handler ---
    const handleReturnSubmit = async (e) => {
        e.preventDefault();
        if (!returnReason.trim()) {
            showNotification("Please select or enter a primary reason for return/replacement.", "error");
            return;
        }

        if (!targetOrderId) {
            showNotification("Order identifier missing.", "error");
            return;
        }

        setSubmittingReturn(true);

        try {
            const formData = new FormData();
            formData.append("requestType", returnRequestType); // "Return" or "Replacement"
            formData.append("reason", returnReason);
            if (userComments.trim()) {
                formData.append("userComments", userComments.trim());
            }

            // Append proof images
            proofFiles.forEach((file) => {
                formData.append("proofImages", file);
            });

            const res = await UserAPI.requestPharmacyOrderReturn(targetOrderId, formData);

            if (res && res.success) {
                showNotification(res.message || "Return request submitted successfully!", "success");
                setIsReturnModalOpen(false);
                setReturnReason("");
                setUserComments("");
                setProofFiles([]);
                fetchDetails(true);
            } else {
                showNotification(res?.message || "Could not submit return request.", "error");
            }
        } catch (err) {
            console.error("Return Request Error:", err);
            const errMsg = err?.response?.data?.message || err?.message || "Failed to submit return request.";
            showNotification(errMsg, "error");
        } finally {
            setSubmittingReturn(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 space-y-3">
                <Loader2 className="animate-spin text-[#3d3f96]" size={32} />
                <p className="text-[11px] font-black text-slate-600 uppercase tracking-wider text-center">
                    Loading Prescription Order Details...
                </p>
            </div>
        );
    }

    if (!request) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center p-4 text-center max-w-sm mx-auto space-y-3">
                <AlertCircle className="w-10 h-10 text-rose-500" />
                <h2 className="text-base font-black text-slate-800">Prescription Request Not Found</h2>
                <p className="text-xs text-slate-400">
                    We could not retrieve details for this ticket.
                </p>
                <button
                    onClick={() => router.back()}
                    className="mt-2 inline-flex items-center gap-1.5 bg-[#3d3f96] text-white text-xs font-black uppercase px-4 py-2.5 rounded-xl cursor-pointer hover:bg-[#2e3075] transition"
                >
                    <ArrowLeft size={13} /> Go Back
                </button>
            </div>
        );
    }

    const driver = request.driver;
    const deliveryAddress = request.deliveryAddress || request.address;
    const timeline = request.trackingTimeline || [];
    const currentTimelineStep = timeline.find(t => t.isCurrent) || timeline[timeline.length - 1];

    return (
        <div className="max-w-[1200px] mx-auto py-3 sm:py-6 px-3 sm:px-6 space-y-4 text-left select-none antialiased">

            {/* --- TOP HEADER --- */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-start sm:items-center gap-2.5">
                    <button
                        onClick={() => router.back()}
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 shrink-0 shadow-xs cursor-pointer"
                        title="Back"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <h1 className="text-base sm:text-xl font-black text-slate-900 tracking-tight font-mono truncate max-w-[200px] sm:max-w-none">
                                #{request.requestId || request._id}
                            </h1>
                            {finalTrackingOrderId && (
                                <span className="text-[10px] sm:text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                                    Ref: {finalTrackingOrderId}
                                </span>
                            )}
                            <span className="text-[9px] sm:text-[10px] font-black uppercase text-[#3d3f96] bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                                {request.durationType || 'Full Course'}
                            </span>
                        </div>
                        <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mt-0.5">
                            <Calendar size={11} /> Rx: {request.prescriptionDate ? new Date(request.prescriptionDate).toLocaleDateString() : 'N/A'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                    {/* Action 1: Cancel Button (Early Stages Only) */}
                    {isCancellable && (
                        <button
                            onClick={() => setIsCancelModalOpen(true)}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-[11px] font-bold text-rose-700 flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                        >
                            <Ban size={12} />
                            <span>Cancel Order</span>
                        </button>
                    )}

                    {/* Action 2: Return / Replacement Button (Only Delivered Orders) */}
                    {canRequestReturn && (
                        <button
                            onClick={() => setIsReturnModalOpen(true)}
                            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-[11px] font-bold text-amber-800 flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                        >
                            <RotateCcw size={12} />
                            <span>Return / Replacement</span>
                        </button>
                    )}

                    {/* Refresh Status */}
                    <button
                        onClick={() => fetchDetails(true)}
                        disabled={refreshing}
                        className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 flex items-center gap-1.5 shadow-xs transition cursor-pointer disabled:opacity-50"
                    >
                        <RefreshCw size={11} className={refreshing ? "animate-spin text-[#3d3f96]" : ""} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* --- TOP STATUS BANNER --- */}
            {isOrderPlaced ? (
                <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-3.5 sm:p-5 rounded-2xl shadow-sm space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start sm:items-center gap-2.5">
                            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                                <PackageCheck size={20} className="text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <h2 className="text-sm sm:text-base font-black tracking-tight">
                                        {request.liveTracking?.statusHeading || "Prescription Order Confirmed!"}
                                    </h2>
                                    <span className="bg-white/20 px-2 py-0.5 rounded-md text-[9px] font-black uppercase">
                                        {request.status || "In Progress"}
                                    </span>
                                </div>
                                <p className="text-[11px] text-emerald-100 font-medium mt-0.5 leading-tight">
                                    {request.deliveryStatus
                                        ? `Delivery status: ${request.deliveryStatus}`
                                        : "Your medicines are verified & under fulfillment."}
                                </p>
                            </div>
                        </div>

                        {/* Doorstep OTP Badge */}
                        {activeDeliveryOtp && (
                            <div
                                onClick={() => copyToClipboard(activeDeliveryOtp)}
                                className="w-full sm:w-auto bg-white text-emerald-950 px-3 py-1.5 rounded-xl shadow-xs flex items-center justify-between sm:justify-start gap-2.5 shrink-0 cursor-pointer hover:bg-emerald-50 active:scale-98 transition"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                                        <Key size={13} />
                                    </div>
                                    <div>
                                        <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 block">
                                            Delivery OTP
                                        </span>
                                        <span className="text-sm font-mono font-black tracking-widest text-emerald-800">
                                            {activeDeliveryOtp}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded">
                                    <Copy size={11} className={copiedOtp ? "text-emerald-600" : ""} />
                                    <span>{copiedOtp ? "Copied" : "Copy"}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : isRejected ? (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs">
                    <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                        <p className="font-black text-rose-900 text-xs">Prescription Order Inactive</p>
                        <p className="text-[11px] text-rose-700 leading-relaxed font-medium">
                            {request.rejectReason || "This order inquiry has been cancelled or rejected."}
                        </p>
                    </div>
                </div>
            ) : isPharmacyAccepted ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs">
                    <Sparkles size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                        <p className="font-black text-emerald-900 text-xs">Chemist Verified &amp; Quotation Ready!</p>
                        <p className="text-[11px] text-emerald-700 leading-relaxed font-medium">
                            The licensed chemist verified your items. Review ledger and pay below to dispatch.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs">
                    <Clock size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                        <p className="font-black text-amber-900 text-xs">Awaiting Chemist Quotation</p>
                        <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                            The chemist is verifying stock and pricing. You will be notified once ready.
                        </p>
                    </div>
                </div>
            )}

            {/* --- MAIN GRID LAYOUT --- */}
            <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4">

                {/* === LEFT CONTENT: TIMELINE, DRIVER, ITEMS, SLIP, RETURNS === */}
                <div className="lg:col-span-2 space-y-4 order-2 lg:order-1">

                    {/* 1. Collapsible Stepper Timeline */}
                    {timeline.length > 0 && (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden transition-all duration-300">
                            <button
                                type="button"
                                onClick={() => setIsTimelineOpen(!isTimelineOpen)}
                                className="w-full flex items-center justify-between p-3.5 sm:p-5 text-left hover:bg-slate-50/70 transition cursor-pointer"
                            >
                                <div className="space-y-0.5 min-w-0 pr-2">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <Clock size={14} className="text-[#3d3f96]" />
                                        <h3 className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-700">
                                            Fulfillment Timeline
                                        </h3>
                                        <span className="text-[9px] font-bold text-[#3d3f96] bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded">
                                            Stage {timeline.findIndex(t => t.isCurrent) + 1 || timeline.filter(t => t.isCompleted).length}/{timeline.length}
                                        </span>
                                    </div>
                                    {!isTimelineOpen && currentTimelineStep && (
                                        <p className="text-[10px] text-slate-400 font-semibold truncate pl-5">
                                            Current: <span className="text-slate-700 font-bold">{currentTimelineStep.title}</span>
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                    <span className="text-[10px] font-bold text-slate-400 hidden xs:inline">
                                        {isTimelineOpen ? "Hide" : "Show"}
                                    </span>
                                    <div className={`w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 transition-transform duration-300 ${isTimelineOpen ? 'rotate-180' : ''}`}>
                                        <ChevronDown size={14} />
                                    </div>
                                </div>
                            </button>

                            <div
                                className={`transition-all duration-300 ease-in-out px-4 sm:px-6 ${
                                    isTimelineOpen ? 'max-h-[1000px] pb-4 opacity-100 border-t border-slate-100 pt-4' : 'max-h-0 opacity-0 overflow-hidden py-0'
                                }`}
                            >
                                <div className="relative pl-5 sm:pl-7 space-y-4 before:absolute before:left-2 sm:before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                                    {timeline.map((stepItem, idx) => {
                                        const isCompleted = stepItem.isCompleted;
                                        const isCurrent = stepItem.isCurrent;

                                        return (
                                            <div key={stepItem.step || idx} className="relative flex items-start gap-2.5">
                                                <div
                                                    className={`absolute -left-5 sm:-left-7 w-5 sm:w-6 h-5 sm:h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all shadow-2xs ${
                                                        isCompleted
                                                            ? 'bg-emerald-600 text-white'
                                                            : isCurrent
                                                                ? 'bg-[#3d3f96] text-white ring-3 ring-indigo-100 animate-pulse'
                                                                : 'bg-white border-2 border-slate-200 text-slate-300'
                                                    }`}
                                                >
                                                    {isCompleted ? <Check size={10} strokeWidth={3} /> : stepItem.step}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between flex-wrap gap-1">
                                                        <h4 className={`text-xs font-bold leading-tight ${isCurrent ? 'text-[#3d3f96]' : isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                                                            {stepItem.title}
                                                        </h4>
                                                        {stepItem.formattedTime && (
                                                            <span className="text-[9px] font-semibold text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">
                                                                {stepItem.formattedTime}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                                        {stepItem.description}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. Assigned Driver Card */}
                    {driver && (
                        <div className="bg-gradient-to-br from-indigo-50/50 to-slate-50 rounded-2xl border border-indigo-100/70 p-3.5 sm:p-5 shadow-xs space-y-3">
                            <div className="flex items-center justify-between border-b border-indigo-100 pb-2.5">
                                <h3 className="text-[11px] font-black uppercase tracking-wider text-[#3d3f96] flex items-center gap-1.5">
                                    <Bike size={14} /> Assigned Delivery Partner
                                </h3>
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                    {driver.status || "Active Duty"}
                                </span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 overflow-hidden shadow-2xs shrink-0">
                                        <img
                                            src={getMediaUrl(driver.profilePic) || PLACEHOLDER_DRIVER}
                                            alt={driver.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.src = PLACEHOLDER_DRIVER; }}
                                        />
                                    </div>
                                    <div className="space-y-0.5 min-w-0">
                                        <h4 className="text-xs font-black text-slate-900 truncate">
                                            {driver.name}
                                        </h4>
                                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                                            <span>{driver.vehicleType || "Vehicle"}</span>
                                            <span>•</span>
                                            <span className="font-mono font-bold text-slate-700 bg-white px-1.5 py-0.2 rounded border border-slate-200 text-[10px]">
                                                {driver.vehicleNumber}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {driver.phone && (
                                    <a
                                        href={`tel:${driver.phone}`}
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#3d3f96] hover:bg-[#2e3075] text-white text-[11px] font-black uppercase rounded-xl shadow-xs transition shrink-0"
                                    >
                                        <Phone size={11} />
                                        <span>Call Delivery Partner</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 3. Verified Prescribed Medicines List */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-3.5 sm:p-5 shadow-xs space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <Pill size={13} className="text-[#3d3f96]" /> Prescribed Medicines ({itemsList.length})
                            </h3>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                Verified
                            </span>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {itemsList.map((med, idx) => (
                                <div key={med.medicineId || med._id || idx} className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-2.5">
                                    <div className="space-y-1 min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">{med.name}</h4>
                                            {med.isComboApplied && (
                                                <span className="text-[8px] font-black uppercase bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                                                    <Tag size={8} /> +{med.freeQuantity} Free
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-medium text-slate-400 flex-wrap">
                                            {med.packaging && (
                                                <span className="bg-slate-100 px-1.5 py-0.2 rounded text-slate-600">
                                                    {med.packaging}
                                                </span>
                                            )}
                                            {med.duration && (
                                                <>
                                                    <span>•</span>
                                                    <span>{med.duration}</span>
                                                </>
                                            )}
                                            <span>•</span>
                                            <span>Qty: <strong className="text-slate-700">{med.quantity}</strong></span>
                                        </div>

                                        {(med.isReturnAllowed || med.isReplacementAllowed) && (
                                            <div className="flex items-center gap-1.5 text-[8px] sm:text-[9px] font-semibold text-emerald-600">
                                                {med.isReturnAllowed && <span>• Returns Allowed</span>}
                                                {med.isReplacementAllowed && <span>• Replacement Allowed</span>}
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-right shrink-0">
                                        <div className="flex flex-col items-end">
                                            {med.mrp > med.price && (
                                                <span className="text-[10px] text-slate-400 line-through">₹{med.mrp}</span>
                                            )}
                                            <span className="font-mono text-xs sm:text-sm font-black text-slate-900">
                                                ₹{med.price || med.mrp || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 4. Active Return / Replacement Lifecycle Card */}
                    {hasActiveReturn && (
                        <div className="bg-amber-50/60 rounded-2xl border border-amber-200 p-3.5 sm:p-5 shadow-xs space-y-3">
                            <div className="flex items-center justify-between border-b border-amber-200/70 pb-2.5">
                                <h3 className="text-[11px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                                    <RotateCcw size={13} /> Return / Replacement Status
                                </h3>
                                <span className="text-[9px] font-black uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                                    {returnDetails.status}
                                </span>
                            </div>

                            <div className="space-y-1.5 text-[11px] text-amber-900">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold">Request Type:</span>
                                    <span>{returnDetails.requestType || "Return"}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold">Pickup Status:</span>
                                    <span className="font-semibold text-amber-800">{returnDetails.pickupStatus || "PendingAssignment"}</span>
                                </div>
                                {returnDetails.reason && (
                                    <div className="flex justify-between items-start gap-2">
                                        <span className="font-bold">Reason:</span>
                                        <span className="text-right max-w-xs">{returnDetails.reason}</span>
                                    </div>
                                )}
                                {returnDetails.rejectionReason && (
                                    <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-[10px] leading-tight mt-1">
                                        <strong>Chemist Note:</strong> {returnDetails.rejectionReason}
                                    </div>
                                )}
                                {returnDetails.returnOTP && (
                                    <div className="flex justify-between items-center pt-1 border-t border-amber-200">
                                        <span className="font-black">Pickup Handover OTP:</span>
                                        <span className="font-mono font-black text-xs bg-white px-2 py-0.5 rounded border border-amber-300">
                                            {returnDetails.returnOTP}
                                        </span>
                                    </div>
                                )}
                                {returnDetails.refundAmount > 0 && (
                                    <div className="flex justify-between items-center pt-1 border-t border-amber-200">
                                        <span className="font-black">Refund Amount:</span>
                                        <span className="font-mono font-black text-xs text-emerald-700">
                                            ₹{returnDetails.refundAmount}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 5. Uploaded Prescription Document Slip */}
                    {request.prescriptionImage && (
                        <div className="bg-white rounded-2xl border border-slate-100 p-3.5 sm:p-5 shadow-xs space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                    <FileText size={13} className="text-[#3d3f96]" /> Uploaded Doctor Prescription
                                </h3>
                                <a
                                    href={getMediaUrl(request.prescriptionImage)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[11px] font-bold text-[#3d3f96] hover:underline flex items-center gap-0.5"
                                >
                                    <span>View</span>
                                    <ExternalLink size={10} />
                                </a>
                            </div>

                            <div className="rounded-xl border border-slate-200/80 overflow-hidden bg-slate-50 max-h-56 sm:max-h-72 flex items-center justify-center p-2">
                                <img
                                    src={getMediaUrl(request.prescriptionImage)}
                                    alt="Prescription Document"
                                    className="max-h-52 sm:max-h-64 w-auto object-contain rounded-lg"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            </div>

                            <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-medium text-slate-500 pt-0.5 flex-wrap">
                                <span>Doctor: <strong className="text-slate-800">{request.doctorName || "Doctor Note"}</strong></span>
                                <span>•</span>
                                <span>Rx Date: <strong className="text-slate-800">{request.prescriptionDate ? new Date(request.prescriptionDate).toLocaleDateString() : 'N/A'}</strong></span>
                            </div>
                        </div>
                    )}

                </div>

                {/* === RIGHT CONTENT: PAYMENT & LEDGER === */}
                <div className="space-y-4 order-1 lg:order-2">

                    {/* Certified Ledger / Bill */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-3.5 sm:p-5 shadow-xs space-y-3">
                        <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                            <Receipt size={13} className="text-emerald-500" /> Quotation Ledger
                        </h3>

                        {itemsCalculatedTotal > 0 || request.verifiedBill ? (
                            <div className="space-y-2 text-xs font-semibold text-slate-600">
                                <div className="flex justify-between items-center text-[11px] sm:text-xs">
                                    <span>Medicines Total</span>
                                    <span className="font-mono text-slate-800">₹{itemsCalculatedTotal}</span>
                                </div>
                                <div className="flex justify-between items-center text-[11px] sm:text-xs">
                                    <span>Delivery Fee</span>
                                    <span className="font-mono text-slate-800">₹{deliveryFee}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-900 border-t border-slate-200 pt-2 font-black">
                                    <span className="text-xs">Grand Total</span>
                                    <span className="font-mono text-base sm:text-lg text-[#3d3f96]">
                                        ₹{grandTotal}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="p-3 bg-slate-50 rounded-xl text-center space-y-1">
                                <Lock size={16} className="mx-auto text-amber-500" />
                                <p className="text-[11px] font-bold text-slate-700">Pending Chemist Quote</p>
                                <p className="text-[9px] text-slate-400">Total updates when chemist verifies pricing.</p>
                            </div>
                        )}
                    </div>

                    {/* Payment Mode Selection & Action Card */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-3.5 sm:p-5 shadow-xs space-y-3">
                        <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                            <CreditCard size={13} className="text-[#3d3f96]" /> Payment Status
                        </h3>

                        {isOrderPlaced ? (
                            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-center space-y-1">
                                <CheckCircle2 size={18} className="text-emerald-600 mx-auto" />
                                <strong className="text-xs font-black text-emerald-900 block uppercase">
                                    Confirmed &amp; Active
                                </strong>
                                <p className="text-[10px] text-emerald-700 font-medium">
                                    Prescription order verified. Live updates are available above.
                                </p>
                            </div>
                        ) : isRejected ? (
                            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-center space-y-1">
                                <AlertCircle size={18} className="text-rose-600 mx-auto" />
                                <strong className="text-xs font-black text-rose-900 block uppercase">
                                    Inquiry Closed
                                </strong>
                                <p className="text-[10px] text-rose-700 font-medium">
                                    Prescription order was cancelled or rejected.
                                </p>
                            </div>
                        ) : isPharmacyAccepted ? (
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod("COD")}
                                        className={`py-2 px-2.5 rounded-xl border text-[11px] font-black flex items-center justify-center gap-1.5 cursor-pointer transition ${
                                            paymentMethod === "COD"
                                                ? 'border-[#3d3f96] bg-indigo-50/50 text-[#3d3f96] shadow-2xs'
                                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <DollarSign size={13} /> Cash (COD)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod("Online")}
                                        className={`py-2 px-2.5 rounded-xl border text-[11px] font-black flex items-center justify-center gap-1.5 cursor-pointer transition ${
                                            paymentMethod === "Online"
                                                ? 'border-[#3d3f96] bg-indigo-50/50 text-[#3d3f96] shadow-2xs'
                                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <CreditCard size={13} /> Online
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    disabled={paying}
                                    onClick={handlePayAndConfirm}
                                    className="w-full py-2.5 sm:py-3 bg-[#3d3f96] hover:bg-[#2d2f75] disabled:opacity-50 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                                >
                                    {paying ? (
                                        <>
                                            <Loader2 size={13} className="animate-spin" />
                                            <span>Confirming...</span>
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck size={14} />
                                            <span>Pay ₹{grandTotal} &amp; Confirm</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="py-2 text-center space-y-1.5">
                                <button
                                    disabled
                                    className="w-full py-2.5 bg-slate-100 text-slate-400 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-not-allowed"
                                >
                                    <Lock size={12} />
                                    <span>Pending Chemist Quote</span>
                                </button>
                                <p className="text-[9px] text-slate-400 leading-tight">
                                    You can confirm payment as soon as the chemist reviews the items.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Delivery Destination Address */}
                    {deliveryAddress && (
                        <div className="bg-white rounded-2xl border border-slate-100 p-3.5 sm:p-5 shadow-xs space-y-2">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                    <MapPin size={13} className="text-[#3d3f96]" /> Delivery Address
                                </h3>
                                {deliveryAddress.addressType && (
                                    <span className="text-[9px] font-bold uppercase bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                                        {deliveryAddress.addressType}
                                    </span>
                                )}
                            </div>
                            <div className="text-[11px] space-y-0.5">
                                <strong className="text-slate-900 font-bold block">{deliveryAddress.name}</strong>
                                <p className="text-slate-600 font-medium leading-relaxed">
                                    {[deliveryAddress.houseNo, deliveryAddress.sector, deliveryAddress.city, deliveryAddress.pincode]
                                        .filter(Boolean)
                                        .join(", ")}
                                </p>
                                <p className="text-slate-500 pt-0.5">Phone: <strong className="text-slate-800">{deliveryAddress.phone}</strong></p>
                            </div>
                        </div>
                    )}

                </div>

            </div>

            {/* ========================================================================= */}
            {/* 🛑 CANCEL ORDER MODAL                                                     */}
            {/* ========================================================================= */}
            {isCancelModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2 text-rose-600">
                                <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center">
                                    <Ban size={16} />
                                </div>
                                <h3 className="text-sm font-black text-slate-900">Cancel Prescription Order</h3>
                            </div>
                            <button
                                onClick={() => setIsCancelModalOpen(false)}
                                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
                            >
                                <X size={15} />
                            </button>
                        </div>

                        <p className="text-xs text-slate-500 leading-relaxed">
                            Orders can only be cancelled before dispatch begins. Any reserved inventory stock will be restored to the chemist.
                        </p>

                        <form onSubmit={handleCancelOrderSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1">
                                    Reason for Cancellation
                                </label>
                                <textarea
                                    rows={3}
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    placeholder="e.g. Ordered wrong dosage by mistake or doctor modified prescription."
                                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-hidden transition resize-none"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCancelModalOpen(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                                >
                                    Dismiss
                                </button>
                                <button
                                    type="submit"
                                    disabled={cancelling}
                                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    {cancelling ? (
                                        <>
                                            <Loader2 size={13} className="animate-spin" />
                                            <span>Cancelling...</span>
                                        </>
                                    ) : (
                                        <span>Confirm Cancel</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* 🔄 RETURN / REPLACEMENT MODAL                                             */}
            {/* ========================================================================= */}
            {isReturnModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2 text-indigo-900">
                                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-[#3d3f96]">
                                    <RotateCcw size={16} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900">Request Return or Replacement</h3>
                                    <p className="text-[10px] text-slate-400">Order #{targetOrderId}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsReturnModalOpen(false)}
                                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
                            >
                                <X size={15} />
                            </button>
                        </div>

                        <form onSubmit={handleReturnSubmit} className="space-y-4">
                            {/* Request Type Choice */}
                            <div>
                                <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1.5">
                                    Action Requested
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setReturnRequestType("Return")}
                                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                            returnRequestType === "Return"
                                                ? "border-[#3d3f96] bg-indigo-50/50 text-[#3d3f96]"
                                                : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                        }`}
                                    >
                                        <RotateCcw size={13} />
                                        <span>Return &amp; Refund</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setReturnRequestType("Replacement")}
                                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                            returnRequestType === "Replacement"
                                                ? "border-[#3d3f96] bg-indigo-50/50 text-[#3d3f96]"
                                                : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                        }`}
                                    >
                                        <RefreshCw size={13} />
                                        <span>Item Replacement</span>
                                    </button>
                                </div>
                            </div>

                            {/* Reason for Return */}
                            <div>
                                <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1">
                                    Primary Reason <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    required
                                    value={returnReason}
                                    onChange={(e) => setReturnReason(e.target.value)}
                                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-[#3d3f96] outline-hidden bg-white cursor-pointer"
                                >
                                    <option value="">Select reason...</option>
                                    <option value="Damaged or Leaked Medicine">Damaged or Leaked Medicine</option>
                                    <option value="Expired Product Delivered">Expired Product Delivered</option>
                                    <option value="Incorrect Medicine / Dosage Sent">Incorrect Medicine / Dosage Sent</option>
                                    <option value="Seal Broken or Packaging Tampered">Seal Broken or Packaging Tampered</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            {/* Additional Comments */}
                            <div>
                                <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1">
                                    Customer Comments (Optional)
                                </label>
                                <textarea
                                    rows={2}
                                    value={userComments}
                                    onChange={(e) => setUserComments(e.target.value)}
                                    placeholder="Explain specifics (e.g. seal broken on syrup bottle)..."
                                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-[#3d3f96] outline-hidden transition resize-none"
                                />
                            </div>

                            {/* Proof Images Upload (Max 5) */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                                        Proof Images (Up to 5)
                                    </label>
                                    <span className="text-[10px] text-slate-400 font-bold">{proofFiles.length}/5 images</span>
                                </div>

                                <label className="border-2 border-dashed border-slate-200 hover:border-[#3d3f96] rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-indigo-50/20 transition">
                                    <UploadCloud size={22} className="text-[#3d3f96] mb-1" />
                                    <span className="text-xs font-bold text-slate-700">Click to upload photos</span>
                                    <span className="text-[10px] text-slate-400">Photos of batch, damage, or expiry date</span>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleProofFileChange}
                                        disabled={proofFiles.length >= 5}
                                        className="hidden"
                                    />
                                </label>

                                {/* Image Previews */}
                                {proofFiles.length > 0 && (
                                    <div className="grid grid-cols-5 gap-2 mt-2">
                                        {proofFiles.map((file, idx) => (
                                            <div key={idx} className="relative group w-full aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt="proof"
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeProofFile(idx)}
                                                    className="absolute top-1 right-1 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center shadow-xs cursor-pointer hover:bg-rose-700"
                                                >
                                                    <X size={10} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Modal Actions */}
                            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsReturnModalOpen(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingReturn}
                                    className="flex-1 py-2.5 rounded-xl bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-xs font-black uppercase shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    {submittingReturn ? (
                                        <>
                                            <Loader2 size={13} className="animate-spin" />
                                            <span>Submitting...</span>
                                        </>
                                    ) : (
                                        <span>Submit Ticket</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}