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
    Receipt
} from 'lucide-react';

// API Service & Notification Context
import UserAPI from '../../../../../services/UserAPI';
import { useNotification } from '../../../../../context/NotificationContext';

// --- BASE MEDIA HELPER ---
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";
const PLACEHOLDER_STORE = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=300";

const getMediaUrl = (path) => {
    if (!path) return PLACEHOLDER_STORE;
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
    // requestId here contains the _id passed from the URL
    const requestId = params?.id;
    const { showNotification } = useNotification();

    // --- State Management ---
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Payment & Confirmation State
    const [paymentMethod, setPaymentMethod] = useState("COD"); // "COD" | "Online"
    const [paying, setPaying] = useState(false);
    const [confirmedOrderData, setConfirmedOrderData] = useState(null);

    // --- 1. Fetch Single Request Details ---
    const fetchDetails = useCallback(async (isRefresh = false) => {
        if (!requestId) return;
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const res = await UserAPI.getUserPrescriptionRequestDetails(requestId);
            if (res && res.success) {
                setRequest(res.data);
                if (isRefresh) showNotification("Prescription quote updated!", "success");
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
    }, [requestId, showNotification]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    // 🌟 STATUS HELPERS
    const normalizedStatus = (request?.status || "").toUpperCase().trim();
    const hasVerifiedBill = Boolean(request?.verifiedBill && (request.verifiedBill.totalAmount !== undefined || request.verifiedBill.itemTotal !== undefined));

    const isOrderPlaced =
        Boolean(confirmedOrderData) ||
        normalizedStatus === 'PAID' ||
        normalizedStatus === 'PLACED' ||
        normalizedStatus === 'CONFIRMED' ||
        normalizedStatus === 'COMPLETED';

    const isRejected = 
        normalizedStatus === 'REJECTED' || 
        normalizedStatus === 'CANCELLED';

    const isPharmacyAccepted =
        !isOrderPlaced &&
        !isRejected &&
        (normalizedStatus === 'BILL GENERATED' || normalizedStatus === 'ACCEPTED') &&
        hasVerifiedBill;

    // --- 2. Confirm & Pay Handler ---
    const handlePayAndConfirm = async () => {
        if (!isPharmacyAccepted) {
            showNotification("Pharmacy has not approved or generated the bill yet.", "error");
            return;
        }

        setPaying(true);

        try {
            const targetId = request?._id || requestId;

            const payload = {
                _id: targetId,
                requestId: targetId,
                paymentMethod: paymentMethod
            };

            const res = await UserAPI.payAndConfirmOrder(payload);

            if (!res || !res.success) {
                showNotification(res?.message || "Could not confirm order.", "error");
                setPaying(false);
                return;
            }

            // === A. COD FLOW ===
            if (paymentMethod === "COD") {
                showNotification(res.message || "Prescription order confirmed with COD!", "success");
                setConfirmedOrderData(res.data);
                setRequest((prev) => ({
                    ...prev,
                    status: "Paid",
                    confirmedOrderId: res.data?.orderId || res.data?._id,
                    deliveryOTP: res.data?.deliveryOTP
                }));
                setPaying(false);
                return;
            }

            // === B. ONLINE FLOW (RAZORPAY) ===
            const razorpayKey = res.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
            const razorpayOrderId = res.razorpayOrderId;
            const payableAmount = res.amount || (request.verifiedBill.totalAmount * 100);

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
                name: request.pharmacyId?.name || "Licensed Pharmacy",
                description: `Prescription #${request.requestId || targetId}`,
                order_id: razorpayOrderId,
                handler: async function (response) {
                    try {
                        setPaying(true);
                        const verifyPayload = {
                            _id: targetId,
                            requestId: targetId,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        };

                        const verifyRes = await UserAPI.verifyPrescriptionRequestPayment(verifyPayload);

                        if (verifyRes && verifyRes.success) {
                            showNotification(verifyRes.message || "Payment verified! Order placed successfully.", "success");
                            setConfirmedOrderData(verifyRes.data);
                            setRequest((prev) => ({
                                ...prev,
                                status: "Paid",
                                confirmedOrderId: verifyRes.data?.orderId || verifyRes.data?.bookingMongoId,
                                deliveryOTP: verifyRes.data?.deliveryOTP
                            }));
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
                    name: request.address?.name || "",
                    contact: request.address?.phone || ""
                },
                theme: {
                    color: "#3d3f96"
                },
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

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-4">
                <Loader2 className="animate-spin text-[#3d3f96]" size={36} />
                <p className="text-xs font-black text-slate-700 uppercase tracking-widest">
                    Loading Prescription Quote...
                </p>
            </div>
        );
    }

    if (!request) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto space-y-4">
                <AlertCircle className="w-12 h-12 text-rose-500" />
                <h2 className="text-lg font-black text-slate-800">Prescription Request Not Found</h2>
                <p className="text-xs text-slate-400 font-medium">We could not retrieve the details for this ticket.</p>
                <button
                    onClick={() => router.back()}
                    className="mt-2 inline-flex items-center gap-2 bg-[#3d3f96] text-white text-xs font-black uppercase px-6 py-3 rounded-2xl cursor-pointer hover:bg-[#2e3075] transition"
                >
                    <ArrowLeft size={14} /> Go Back
                </button>
            </div>
        );
    }

    const pharmacy = request.pharmacyId || {};
    const pharmacyImg = getMediaUrl(pharmacy.profileImage);
    const activeDeliveryOtp = confirmedOrderData?.deliveryOTP || request.deliveryOTP;
    const finalTrackingOrderId = confirmedOrderData?.orderId || request.confirmedOrderId;

    return (
        <div className="max-w-[1200px] mx-auto py-6 px-4 sm:px-6 space-y-6 text-left select-none antialiased">

            {/* --- TOP HEADER --- */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition shadow-xs cursor-pointer"
                        title="Back to Rx Orders"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono">
                                #{request.requestId || request._id}
                            </h1>
                            <span className="text-[10px] font-black uppercase text-[#3d3f96] bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-lg">
                                {request.durationType || 'Full Course'}
                            </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <Calendar size={13} /> Placed on {new Date(request.createdAt).toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchDetails(true)}
                        disabled={refreshing}
                        className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-xs transition cursor-pointer disabled:opacity-50"
                    >
                        <RefreshCw size={13} className={refreshing ? "animate-spin text-[#3d3f96]" : ""} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* --- ORDER STATUS BANNER --- */}
            {isOrderPlaced ? (
                <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white p-6 rounded-3xl shadow-lg space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                                <PackageCheck size={26} className="text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-base sm:text-lg font-black tracking-tight">
                                        Prescription Order Confirmed!
                                    </h2>
                                    <span className="bg-white/20 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                        Dispatched Soon
                                    </span>
                                </div>
                                <p className="text-xs text-emerald-100 font-medium mt-0.5">
                                    Your order has been registered with the pharmacy. Medicines are being packed.
                                </p>
                            </div>
                        </div>

                        {/* Doorstep OTP Badge */}
                        {activeDeliveryOtp && (
                            <div className="bg-white text-emerald-900 px-4 py-2 rounded-2xl shadow-sm flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
                                <Key size={16} className="text-emerald-600" />
                                <div>
                                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                                        Delivery OTP
                                    </span>
                                    <span className="text-lg font-mono font-black tracking-widest text-emerald-700">
                                        {activeDeliveryOtp}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {finalTrackingOrderId && (
                        <div className="pt-2 border-t border-white/20 text-xs font-mono font-bold text-emerald-100 flex items-center gap-2">
                            <span>Official Tracking Reference:</span>
                            <span className="text-white font-black bg-white/10 px-2 py-0.5 rounded">
                                #{finalTrackingOrderId}
                            </span>
                        </div>
                    )}
                </div>
            ) : isRejected ? (
                <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 flex items-start gap-3.5 text-xs">
                    <AlertCircle size={20} className="text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="font-black text-rose-900 text-sm">Prescription Request Declined</p>
                        <p className="text-rose-700 leading-relaxed font-medium">
                            {request.rejectReason || "The pharmacy was unable to fulfill this prescription inquiry. Please check the doctor's slip or choose another pharmacy."}
                        </p>
                    </div>
                </div>
            ) : isPharmacyAccepted ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 flex items-start gap-3.5 text-xs">
                    <Sparkles size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="font-black text-emerald-900 text-sm">Prescription Approved &amp; Bill Ready!</p>
                        <p className="text-emerald-700 leading-relaxed font-medium">
                            The pharmacy verified your medicines and generated the final invoice. Select your payment method below to confirm dispatch.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 flex items-start gap-3.5 text-xs">
                    <Clock size={20} className="text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="font-black text-amber-900 text-sm">Awaiting Pharmacist Acceptance &amp; Quotation</p>
                        <p className="text-amber-700 leading-relaxed font-medium">
                            The licensed chemist is verifying your doctor’s prescription and checking medicine stock. Once approved, you will be able to review the certified quotation and pay.
                        </p>
                    </div>
                </div>
            )}

            {/* --- MAIN GRID --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* === LEFT 2 COLUMNS: ATTACHMENT & MEDICINES === */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Prescription Document Preview */}
                    {request.prescriptionImage && (
                        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                    <FileText size={14} className="text-[#3d3f96]" /> Uploaded Doctor Prescription
                                </h3>
                                <a
                                    href={getMediaUrl(request.prescriptionImage)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs font-bold text-[#3d3f96] hover:underline flex items-center gap-1"
                                >
                                    <span>Open Full Document</span>
                                    <ExternalLink size={12} />
                                </a>
                            </div>

                            <div className="rounded-2xl border border-slate-200/80 overflow-hidden bg-slate-50 max-h-80 flex items-center justify-center p-2">
                                <img
                                    src={getMediaUrl(request.prescriptionImage)}
                                    alt="Prescription Document"
                                    className="max-h-72 w-auto object-contain rounded-xl shadow-xs"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </div>

                            <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-1">
                                <span>Doctor: <strong className="text-slate-800">{request.doctorName || "Doctor Note"}</strong></span>
                                <span>•</span>
                                <span>Rx Date: <strong className="text-slate-800">{request.prescriptionDate ? new Date(request.prescriptionDate).toLocaleDateString() : 'N/A'}</strong></span>
                            </div>
                        </div>
                    )}

                    {/* Requested Medicines List */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <Pill size={14} className="text-[#3d3f96]" /> Prescribed Medicines ({request.requestedMedicines?.length || 0})
                            </h3>
                            <span className="text-[11px] font-bold text-slate-400">Stock Verified</span>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {request.requestedMedicines?.map((med, idx) => (
                                <div key={med._id || idx} className="py-3.5 first:pt-1 last:pb-1 flex items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-extrabold text-slate-900">{med.name}</h4>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                                                Dosage: {med.dosage || "1-0-1"}
                                            </span>
                                            <span>•</span>
                                            <span>Duration: {med.durationDays || 15} Days</span>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <span className="text-[10px] text-slate-400 font-bold block">Estimated MRP</span>
                                        <span className="font-mono text-sm font-black text-slate-900">
                                            ₹{med.mrp || 0}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* === RIGHT COLUMN: BILL & PAYMENT CHECKOUT === */}
                <div className="space-y-6">

                    {/* Certified Bill Summary */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-3">
                            <Receipt size={14} className="text-emerald-500" /> Quotation Ledger
                        </h3>

                        {request.verifiedBill ? (
                            <div className="space-y-2.5 text-xs font-bold text-slate-600">
                                <div className="flex justify-between items-center">
                                    <span>Medicines Total</span>
                                    <span className="font-mono text-slate-800">
                                        ₹{request.verifiedBill.itemTotal || 0}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Delivery Fee</span>
                                    <span className="font-mono text-slate-800">
                                        ₹{request.verifiedBill.deliveryCharge || 0}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-slate-900 border-t border-slate-200 pt-3 text-sm font-black">
                                    <span>Grand Total</span>
                                    <span className="font-mono text-xl font-black text-[#3d3f96]">
                                        ₹{request.verifiedBill.totalAmount || (Number(request.verifiedBill.itemTotal || 0) + Number(request.verifiedBill.deliveryCharge || 0))}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 bg-slate-50 rounded-2xl text-center space-y-1">
                                <Lock size={20} className="mx-auto text-amber-500" />
                                <p className="text-xs font-bold text-slate-700">Invoice Pending Pharmacist Approval</p>
                                <p className="text-[10px] text-slate-400">The price calculation will appear here once approved.</p>
                            </div>
                        )}
                    </div>

                    {/* Payment Mode Selection & Checkout Action */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-3">
                            <CreditCard size={14} className="text-[#3d3f96]" /> Payment Status
                        </h3>

                        {isOrderPlaced ? (
                            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-center space-y-2">
                                <CheckCircle2 size={24} className="text-emerald-600 mx-auto" />
                                <strong className="text-xs font-black text-emerald-900 block uppercase">
                                    Payment Verified &amp; Confirmed
                                </strong>
                                <p className="text-[11px] text-emerald-700 font-medium">
                                    This prescription order is complete. The store is dispatching your medicines.
                                </p>
                            </div>
                        ) : isRejected ? (
                            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-2">
                                <AlertCircle size={24} className="text-rose-600 mx-auto" />
                                <strong className="text-xs font-black text-rose-900 block uppercase">
                                    Inquiry Closed
                                </strong>
                                <p className="text-[11px] text-rose-700 font-medium">
                                    This prescription request was declined by the chemist.
                                </p>
                            </div>
                        ) : isPharmacyAccepted ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod("COD")}
                                        className={`p-3 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition ${
                                            paymentMethod === "COD"
                                                ? 'border-[#3d3f96] bg-indigo-50/50 text-[#3d3f96] shadow-xs'
                                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <DollarSign size={15} /> Cash On Delivery
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod("Online")}
                                        className={`p-3 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition ${
                                            paymentMethod === "Online"
                                                ? 'border-[#3d3f96] bg-indigo-50/50 text-[#3d3f96] shadow-xs'
                                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <CreditCard size={15} /> Online Payment
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    disabled={paying}
                                    onClick={handlePayAndConfirm}
                                    className="w-full py-3.5 bg-[#3d3f96] hover:bg-[#2d2f75] disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                                >
                                    {paying ? (
                                        <>
                                            <Loader2 size={15} className="animate-spin" />
                                            <span>Processing Order...</span>
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck size={16} />
                                            <span>Pay ₹{request.verifiedBill?.totalAmount} &amp; Confirm</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="py-3 text-center space-y-2">
                                <button
                                    disabled
                                    className="w-full py-3.5 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed"
                                >
                                    <Lock size={14} />
                                    <span>Payment Locked (Pending Approval)</span>
                                </button>
                                <p className="text-[10px] text-slate-400">
                                    You will be able to choose COD or Online payment as soon as the chemist confirms your prescription.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Pharmacy Store Card */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-3">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <Store size={14} className="text-[#3d3f96]" /> Assigned Pharmacy
                        </h3>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0">
                                <img
                                    src={pharmacyImg}
                                    alt={pharmacy.name || "Store"}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.src = PLACEHOLDER_STORE; }}
                                />
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-sm font-extrabold text-slate-900 truncate">
                                    {pharmacy.name || "Partner Chemist"}
                                </h4>
                                <p className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                                    <MapPin size={11} /> {pharmacy.city || "Mohali"}
                                </p>
                            </div>
                        </div>
                        {pharmacy.phone && (
                            <a
                                href={`tel:${pharmacy.phone}`}
                                className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-slate-700 text-xs font-extrabold flex items-center justify-center gap-1.5 transition"
                            >
                                <Phone size={13} /> Call Chemist ({pharmacy.phone})
                            </a>
                        )}
                    </div>

                    {/* Delivery Destination Address */}
                    {request.address && (
                        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-2">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <MapPin size={14} className="text-[#3d3f96]" /> Delivery Destination
                            </h3>
                            <div className="text-xs space-y-0.5">
                                <strong className="text-slate-900 font-black block">{request.address.name}</strong>
                                <p className="text-slate-600 font-medium leading-relaxed">
                                    {[request.address.houseNo, request.address.sector, request.address.city, request.address.pincode]
                                        .filter(Boolean)
                                        .join(", ")}
                                </p>
                                <p className="text-slate-400 font-bold pt-0.5">Phone: {request.address.phone}</p>
                            </div>
                        </div>
                    )}

                </div>

            </div>

        </div>
    );
}