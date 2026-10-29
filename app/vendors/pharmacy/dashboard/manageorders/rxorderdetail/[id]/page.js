"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Clock,
    User,
    Phone,
    Mail,
    MapPin,
    Stethoscope,
    Calendar,
    FileText,
    ReceiptText,
    Plus,
    Trash2,
    X,
    ExternalLink,
    Send,
    Edit3,
    IndianRupee,
    Tag,
    Sparkles,
    Key,
    PackageCheck,
    Truck,
    UserCheck,
    Lock
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import PharmacyAPI from '../../../../../../services/PharmacyVendorAPI';
import AllDrivers from '../../orderdetail/components/AllDrivers';

export default function RxOrderDetailPage({ params }) {
    // In Next.js 15 Client Components, unwrap Promise params with React.use()
    const resolvedParams = params && typeof params.then === 'function'
        ? React.use(params)
        : params;

    const routeParams = useParams();
    const router = useRouter();

    // Resolves MongoDB _id from route folder [id] or params
    const _id = routeParams?.id || routeParams?._id || resolvedParams?.id || resolvedParams?._id || '';

    // Data States
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Driver Modal Visibility State
    const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);

    // Pricing & Bill Workbench States
    const [isEditingBill, setIsEditingBill] = useState(false);
    const [billedItems, setBilledItems] = useState([
        { medicineId: '', name: '', mrp: 0, pricePerUnit: 0, quantity: 1 }
    ]);
    const [deliveryCharge, setDeliveryCharge] = useState(40);

    // Rejection Modal State
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const presetRejectReasons = [
        "Prescription is illegible. Please re-upload a clear, well-lit photo of the doctor's slip.",
        "Requested medicines are currently out of stock.",
        "Prescription has expired or lacks a valid doctor registration number.",
        "Contains Schedule X/restricted drugs that cannot be fulfilled online."
    ];

    // Helper for Image URLs
    const getFullImageUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http://') || path.startsWith('https://')) return path;
        const baseUrl =
            process.env.NEXT_PUBLIC_BACKEND_URL ||
            process.env.NEXT_PUBLIC_API_URL ||
            process.env.NEXT_PUBLIC_BASE_URL ||
            'http://192.168.1.3:5002';
        return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
    };

    // --- Fetch Details ---
    const fetchOrderDetails = async () => {
        if (!_id) return;
        setLoading(true);
        try {
            const response = await PharmacyAPI.getProviderPrescriptionRequestDetails(_id);
            if (response && response.success && response.data) {
                const data = response.data;
                setOrder(data);

                // Populate verified bill items if already prepared
                if (data.verifiedBill && data.verifiedBill.items?.length > 0) {
                    setBilledItems(
                        data.verifiedBill.items.map((item) => ({
                            medicineId: item.medicineId || '',
                            name: item.name || '',
                            mrp: item.mrp || 0,
                            pricePerUnit: item.pricePerUnit || 0,
                            quantity: item.quantity || 1
                        }))
                    );
                    setDeliveryCharge(data.verifiedBill.deliveryCharge ?? 40);
                    setIsEditingBill(false);
                } else if (data.requestedMedicines && data.requestedMedicines.length > 0) {
                    // Pre-fill from requested medicines with MRP
                    const initialItems = data.requestedMedicines.map((m) => ({
                        medicineId: m._id || m.medicineId || '',
                        name: m.name || '',
                        mrp: m.mrp || 0,
                        pricePerUnit: m.mrp || 0,
                        quantity: m.durationDays ? Math.max(1, Math.round(m.durationDays)) : 1
                    }));
                    setBilledItems(initialItems);
                    setIsEditingBill(true);
                } else {
                    setIsEditingBill(true);
                }
            } else {
                toast.error("Failed to load prescription inquiry details.");
            }
        } catch (err) {
            console.error("Error fetching Rx request details:", err);
            toast.error(err?.response?.data?.message || err?.message || "Failed to load prescription inquiry.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (_id) {
            fetchOrderDetails();
        }
    }, [_id]);

    // Status helpers
    const currentStatus = (order?.status || '').toUpperCase();
    const isPaid = currentStatus === 'PAID';
    const isRejected = currentStatus === 'REJECTED';

    // Reliable MongoDB identifier for all backend update actions
    const targetMongoId = order?.mongoId || order?._id || _id;

    // Driver target ID: according to docs, use bookingId || mongoId
    const targetOrderIdForDriver = order?.bookingId || order?.bookingMongoId || targetMongoId;

    // --- Action 1: Start Review ---
    const handleStartReview = async () => {
        if (!targetMongoId) {
            toast.error("Missing prescription ID.");
            return;
        }
        setActionLoading(true);
        try {
            const res = await PharmacyAPI.startPrescriptionReview(targetMongoId);
            if (res && res.success) {
                toast.success("Audit initiated. You can now prepare your price quote.");
                setIsEditingBill(true);
                fetchOrderDetails();
            } else {
                toast.error(res?.message || "Could not start review.");
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || err?.message || "Error starting review.");
        } finally {
            setActionLoading(false);
        }
    };

    // --- Action 2: Line Item Modifications ---
    const handleItemChange = (index, field, value) => {
        setBilledItems((prev) => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                [field]:
                    field === 'pricePerUnit' || field === 'quantity' || field === 'mrp'
                        ? value === '' ? '' : Number(value)
                        : value
            };
            return updated;
        });
    };

    const addItemRow = () => {
        setBilledItems((prev) => [
            ...prev,
            { medicineId: '', name: '', mrp: 0, pricePerUnit: 0, quantity: 1 }
        ]);
    };

    const removeItemRow = (index) => {
        if (billedItems.length <= 1) {
            toast.error("At least one medicine item is required in the bill.");
            return;
        }
        setBilledItems((prev) => prev.filter((_, i) => i !== index));
    };

    // Calculations
    const calculatedItemTotal = billedItems.reduce((acc, curr) => {
        return acc + (Number(curr.pricePerUnit || 0) * Number(curr.quantity || 0));
    }, 0);

    const calculatedMrpTotal = billedItems.reduce((acc, curr) => {
        const mrp = Number(curr.mrp) > 0 ? Number(curr.mrp) : Number(curr.pricePerUnit || 0);
        return acc + (mrp * Number(curr.quantity || 0));
    }, 0);

    const calculatedGrandTotal = calculatedItemTotal + Number(deliveryCharge || 0);
    const customerSavings = Math.max(0, calculatedMrpTotal - calculatedItemTotal);

    // --- Action 3: Submit Custom Price Bill to User ---
    const handleSubmitBill = async (e) => {
        e.preventDefault();

        for (const item of billedItems) {
            if (!item.name || !item.name.trim()) {
                toast.error("Every item must have a valid Medicine Name.");
                return;
            }
            if (Number(item.pricePerUnit) <= 0) {
                toast.error(`Please set your custom selling price for "${item.name}".`);
                return;
            }
            if (Number(item.quantity) <= 0) {
                toast.error(`Quantity for "${item.name}" must be at least 1.`);
                return;
            }
        }

        const payload = {
            deliveryCharge: Math.max(0, Number(deliveryCharge) || 0),
            items: billedItems.map((item) => ({
                ...(item.medicineId && item.medicineId.length === 24 ? { medicineId: item.medicineId } : {}),
                name: item.name.trim(),
                mrp: Number(item.mrp) > 0 ? Number(item.mrp) : Number(item.pricePerUnit),
                pricePerUnit: Number(item.pricePerUnit),
                quantity: Number(item.quantity)
            }))
        };

        if (!targetMongoId) {
            toast.error("Missing prescription ID.");
            return;
        }

        setActionLoading(true);
        try {
            const res = await PharmacyAPI.submitPharmacistReview(targetMongoId, payload);
            if (res && res.success) {
                toast.success("Custom pricing bill sent to patient successfully!");
                setIsEditingBill(false);
                fetchOrderDetails();
            } else {
                toast.error(res?.message || "Failed to generate bill.");
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || err?.message || "Error submitting price review.");
        } finally {
            setActionLoading(false);
        }
    };

    // --- Action 4: Reject Prescription Request ---
    const handleRejectRequest = async () => {
        if (!rejectReason.trim()) {
            toast.error("Please provide a decline reason.");
            return;
        }

        if (!targetMongoId) {
            toast.error("Missing prescription ID.");
            return;
        }

        setActionLoading(true);
        try {
            const res = await PharmacyAPI.rejectPrescriptionRequest(targetMongoId, {
                reason: rejectReason.trim()
            });
            if (res && res.success) {
                toast.success("Prescription inquiry declined.");
                setShowRejectModal(false);
                fetchOrderDetails();
            } else {
                toast.error(res?.message || "Failed to decline request.");
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || err?.message || "Error declining request.");
        } finally {
            setActionLoading(false);
        }
    };

    // --- Status Badge Helper ---
    const renderStatusBadge = (status) => {
        const uppercase = status?.toUpperCase();
        if (uppercase === 'PAID') {
            return (
                <span className="text-xs font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 size={13} /> Paid &amp; Confirmed
                </span>
            );
        }
        if (uppercase === 'BILL GENERATED' || uppercase === 'ACCEPTED') {
            return (
                <span className="text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200 flex items-center gap-1.5">
                    <ReceiptText size={13} /> Bill Dispatched (Awaiting User Pay)
                </span>
            );
        }
        if (uppercase === 'REVIEWING') {
            return (
                <span className="text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 flex items-center gap-1.5">
                    <Clock size={13} className="animate-spin" /> In Pharmacist Review
                </span>
            );
        }
        if (uppercase === 'PENDING REVIEW' || uppercase === 'PENDING') {
            return (
                <span className="text-xs font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" /> Pending Review
                </span>
            );
        }
        if (uppercase === 'REJECTED') {
            return (
                <span className="text-xs font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 flex items-center gap-1.5">
                    <AlertCircle size={13} /> Rejected
                </span>
            );
        }
        return (
            <span className="text-xs font-black uppercase tracking-wider text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5">
                {status || 'Unknown'}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-3xl border border-slate-100 shadow-sm p-10">
                <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={40} />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Loading Prescription Request Details...
                </p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
                <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
                <h2 className="text-lg font-bold text-slate-800">Prescription Request Not Found</h2>
                <p className="text-xs text-slate-400">The requested ticket does not exist or was deleted.</p>
                <button
                    onClick={() => router.back()}
                    className="px-5 py-2.5 bg-[#3d3f96] text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                    Back to Orders
                </button>
            </div>
        );
    }

    const rxImageUrl = getFullImageUrl(order.prescriptionImage);
    const activeDeliveryOtp = order.deliveryOTP;
    const trackingOrderId = order.bookingOrderId;

    return (
        <div className="space-y-6 text-left antialiased max-w-7xl mx-auto pb-12">
            <Toaster position="top-right" />

            {/* --- TOP NAVIGATION BAR --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-black text-slate-900 tracking-tight font-mono">
                                #{order.requestId || order._id}
                            </h1>
                            {renderStatusBadge(order.status)}
                        </div>
                        <p className="text-xs text-slate-400 font-medium">
                            Submitted on {order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}
                        </p>
                    </div>
                </div>

                {/* Top Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* According to Docs: Show Assign/Reassign Driver if Paid */}
                    {order.canAssignDriver && (
                        <button
                            type="button"
                            onClick={() => setIsDriverModalOpen(true)}
                            className="px-4 py-2.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                        >
                            <UserCheck size={14} />
                            <span>Assign Delivery Partner</span>
                        </button>
                    )}

                    {order.isDriverAssigned && (
                        <button
                            type="button"
                            onClick={() => setIsDriverModalOpen(true)}
                            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                        >
                            <Truck size={14} />
                            <span>Reassign Driver</span>
                        </button>
                    )}

                    {(currentStatus === 'PENDING REVIEW' || currentStatus === 'PENDING') && (
                        <button
                            type="button"
                            disabled={actionLoading}
                            onClick={handleStartReview}
                            className="px-4 py-2.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Clock size={14} />}
                            <span>Start Audit &amp; Set Prices</span>
                        </button>
                    )}

                    {!isPaid && !isRejected && (
                        <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => setShowRejectModal(true)}
                            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                            <AlertCircle size={14} />
                            <span>Decline Ticket</span>
                        </button>
                    )}
                </div>
            </div>

            {/* --- CONFIRMED ORDER & OTP BANNER (Shown when Paid) --- */}
            {isPaid && (
                <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-6 rounded-3xl shadow-md space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                                <PackageCheck size={26} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-base sm:text-lg font-black tracking-tight">
                                    Customer Confirmed &amp; Paid Order! Please Pack &amp; Handover
                                </h3>
                                <p className="text-xs text-emerald-100 font-medium mt-0.5">
                                    The patient accepted your quotation and paid. Hand over to delivery partner and confirm OTP on handover.
                                </p>
                            </div>
                        </div>

                        {activeDeliveryOtp && (
                            <div className="bg-white text-emerald-900 px-4 py-2 rounded-2xl shadow-sm flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
                                <Key size={16} className="text-emerald-600" />
                                <div>
                                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                                        Doorstep Verification OTP
                                    </span>
                                    <span className="text-lg font-mono font-black tracking-widest text-emerald-700">
                                        {activeDeliveryOtp}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-2 border-t border-white/20 text-xs font-mono font-bold text-emerald-100 flex flex-wrap items-center gap-3">
                        {trackingOrderId && (
                            <div className="flex items-center gap-1.5">
                                <span>Booking Order:</span>
                                <span className="text-white font-black bg-white/10 px-2 py-0.5 rounded">
                                    {trackingOrderId}
                                </span>
                            </div>
                        )}
                        <div className="flex items-center gap-1.5">
                            <span>Dispatch State:</span>
                            <span className="text-white font-black bg-white/10 px-2 py-0.5 rounded">
                                {order.deliveryStatus || 'PendingAssignment'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* --- REJECTED ALERT --- */}
            {isRejected && (
                <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 text-rose-700 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-wider">Ticket Declined</h4>
                        <p className="text-xs font-semibold mt-1">
                            {order.rejectReason || "This prescription inquiry was declined."}
                        </p>
                    </div>
                </div>
            )}

            {/* --- MAIN GRID LAYOUT --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* LEFT COLUMN: Customer Profile, Driver Card, Prescription Document */}
                <div className="lg:col-span-5 space-y-6">

                    {/* Customer Profile Card */}
                    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <User size={14} className="text-[#3d3f96]" /> Customer Profile
                            </span>
                            {order.userId?.gender && (
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                                    {order.userId.gender} {order.userId?.age ? `• ${order.userId.age} yrs` : ''}
                                </span>
                            )}
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-sm font-extrabold text-slate-800">
                                {order.userId?.name || "Customer"}
                            </h3>
                            <div className="space-y-1.5 text-xs text-slate-600 font-medium">
                                <div className="flex items-center gap-2">
                                    <Phone size={13} className="text-slate-400" />
                                    <a href={`tel:${order.userId?.phone}`} className="hover:text-[#3d3f96] hover:underline font-bold">
                                        {order.userId?.phone || "No Phone"}
                                    </a>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail size={13} className="text-slate-400" />
                                    <span className="truncate">{order.userId?.email || "No Email"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Destination Address */}
                        {order.address && (
                            <div className="pt-3 border-t border-slate-100 space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                    <MapPin size={11} className="text-[#3d3f96]" /> Delivery Address
                                </span>
                                <strong className="text-xs font-black text-slate-800 block">
                                    {order.address.name} {order.address.phone ? `(${order.address.phone})` : ''}
                                </strong>
                                <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                                    {[order.address.houseNo, order.address.city, order.address.pincode]
                                        .filter(Boolean)
                                        .join(', ')}
                                </p>
                                <span className="text-[10px] font-bold text-slate-400 block">
                                    Type: {order.address.addressType || 'Home'}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* --- ASSIGNED DRIVER DETAILS CARD (Per API Spec) --- */}
                    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <Truck size={14} className="text-[#3d3f96]" /> Delivery Partner
                            </span>
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider bg-slate-100 px-2.5 py-0.5 rounded-md">
                                {order.deliveryStatus || 'PendingAssignment'}
                            </span>
                        </div>

                        {order.isDriverAssigned && order.driver ? (
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {order.driver.profilePic ? (
                                            <img
                                                src={getFullImageUrl(order.driver.profilePic)}
                                                alt={order.driver.name}
                                                className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-[#3d3f96] flex items-center justify-center font-black text-sm">
                                                {order.driver.name ? order.driver.name.charAt(0).toUpperCase() : <Truck size={20} />}
                                            </div>
                                        )}
                                        <div className="text-xs">
                                            <p className="font-black text-slate-900 text-sm">{order.driver.name}</p>
                                            <a href={`tel:${order.driver.phone}`} className="text-slate-500 font-semibold hover:text-[#3d3f96] hover:underline block">
                                                {order.driver.phone}
                                            </a>
                                            {order.driver.email && (
                                                <span className="text-[11px] text-slate-400 block truncate max-w-[160px]">
                                                    {order.driver.email}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {order.driver.status && (
                                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                                            order.driver.status.toLowerCase() === 'busy'
                                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        }`}>
                                            {order.driver.status}
                                        </span>
                                    )}
                                </div>

                                <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-[11px]">
                                    <div className="bg-white p-2 rounded-xl border border-slate-100">
                                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Vehicle Plate</span>
                                        <strong className="text-slate-800 font-mono font-black">{order.driver.vehicleNumber || '—'}</strong>
                                    </div>
                                    <div className="bg-white p-2 rounded-xl border border-slate-100">
                                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Vehicle Type</span>
                                        <strong className="text-slate-800 font-black">{order.driver.vehicleType || 'Bike'}</strong>
                                    </div>
                                </div>

                                <div className="text-right pt-1">
                                    <button
                                        type="button"
                                        onClick={() => setIsDriverModalOpen(true)}
                                        className="text-xs font-bold text-[#3d3f96] hover:underline cursor-pointer"
                                    >
                                        Reassign Partner
                                    </button>
                                </div>
                            </div>
                        ) : order.canAssignDriver ? (
                            <div className="text-center py-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                                <Truck size={24} className="mx-auto text-slate-300" />
                                <p className="text-xs text-slate-600 font-bold">Order Paid! No Driver Assigned Yet</p>
                                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                                    Assign a delivery partner to dispatch this order to the customer.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setIsDriverModalOpen(true)}
                                    className="mt-1 px-4 py-2 bg-[#3d3f96] text-white rounded-xl text-xs font-bold hover:bg-[#2d2f75] transition cursor-pointer shadow-xs"
                                >
                                    Assign Delivery Partner
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-5 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 space-y-1.5">
                                <Lock size={20} className="mx-auto text-slate-300" />
                                <p className="text-xs text-slate-400 font-bold">Awaiting Customer Payment</p>
                                <p className="text-[11px] text-slate-400">
                                    Driver assignment unlocks automatically once the user accepts the bill and completes payment.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Prescription Details & Slip */}
                    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <Stethoscope size={14} className="text-[#3d3f96]" /> Doctor &amp; Prescription
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-50 text-[#3d3f96]">
                                {order.durationType || 'Full Course'}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-[10px] font-bold text-slate-400 block uppercase">Doctor</span>
                                <strong className="text-slate-800 font-black block mt-0.5 truncate">
                                    {order.doctorName || 'Not Mentioned'}
                                </strong>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-[10px] font-bold text-slate-400 block uppercase">Rx Date</span>
                                <strong className="text-slate-800 font-black block mt-0.5">
                                    {order.prescriptionDate
                                        ? new Date(order.prescriptionDate).toLocaleDateString()
                                        : '—'}
                                </strong>
                            </div>
                        </div>

                        {/* Prescription Image */}
                        <div className="space-y-2 pt-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-700">Prescription Slip</span>
                                {rxImageUrl && (
                                    <a
                                        href={rxImageUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[11px] font-bold text-[#3d3f96] hover:underline flex items-center gap-1"
                                    >
                                        <ExternalLink size={12} /> View Full
                                    </a>
                                )}
                            </div>

                            {rxImageUrl ? (
                                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 relative group max-h-[380px] flex items-center justify-center p-1">
                                    <img
                                        src={rxImageUrl}
                                        alt="Prescription Slip"
                                        className="max-h-[360px] w-auto object-contain rounded-xl"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                                    No document attached.
                                </div>
                            )}
                        </div>

                        {/* OCR / Requested Medicines Summary */}
                        {order.requestedMedicines && order.requestedMedicines.length > 0 && (
                            <div className="pt-3 border-t border-slate-100 space-y-2">
                                <span className="text-xs font-bold text-slate-700 block">
                                    Requested Medicines ({order.requestedMedicines.length})
                                </span>
                                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                    {order.requestedMedicines.map((m, idx) => (
                                        <div
                                            key={idx}
                                            className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                                        >
                                            <div>
                                                <strong className="text-slate-800 font-bold block">{m.name}</strong>
                                                <span className="text-[10px] text-slate-400 font-medium">
                                                    Dosage: {m.dosage || '—'} • {m.durationDays ? `${m.durationDays} Days` : ''}
                                                </span>
                                            </div>
                                            {m.mrp > 0 && (
                                                <span className="font-mono font-bold text-slate-700">
                                                    MRP: ₹{m.mrp}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: Vendor Pricing Workbench & Bill Submission */}
                <div className="lg:col-span-7 space-y-6">

                    {/* VIEW MODE: If Bill already exists AND vendor is not actively editing */}
                    {order.verifiedBill && !isEditingBill ? (
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <div>
                                    <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                        <ReceiptText size={15} className="text-[#3d3f96]" /> Active Price Quote
                                    </span>
                                    <h3 className="text-base font-black text-slate-900 mt-0.5">
                                        {isPaid ? 'Final Paid Quotation' : 'Bill Dispatched to Patient'}
                                    </h3>
                                </div>

                                <div className="flex items-center gap-2">
                                    {!isPaid && !isRejected && (
                                        <button
                                            type="button"
                                            onClick={() => setIsEditingBill(true)}
                                            className="px-3.5 py-2 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <Edit3 size={13} />
                                            <span>Revise Custom Prices</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Verified Items Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 text-slate-400 uppercase font-black bg-slate-50/70">
                                            <th className="py-3 px-3">Medicine</th>
                                            <th className="py-3 px-3 text-center">Qty</th>
                                            <th className="py-3 px-3 text-right">Your Rate</th>
                                            <th className="py-3 px-3 text-right">Taxable</th>
                                            <th className="py-3 px-3 text-right">GST</th>
                                            <th className="py-3 px-3 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                                        {order.verifiedBill.items?.map((item, idx) => {
                                            const totalGst = (Number(item.cgstAmount || 0) + Number(item.sgstAmount || 0)).toFixed(2);
                                            return (
                                                <tr key={idx} className="hover:bg-slate-50/50">
                                                    <td className="py-3 px-3">
                                                        <strong className="block text-slate-900 font-bold">{item.name}</strong>
                                                        <span className="text-[10px] text-slate-400">HSN: {item.hsn_number || '30049099'}</span>
                                                    </td>
                                                    <td className="py-3 px-3 text-center font-bold">{item.quantity}</td>
                                                    <td className="py-3 px-3 text-right font-mono font-bold text-[#3d3f96]">
                                                        ₹{item.pricePerUnit}
                                                    </td>
                                                    <td className="py-3 px-3 text-right font-mono text-slate-500">
                                                        ₹{item.taxableAmount || (item.pricePerUnit * item.quantity).toFixed(2)}
                                                    </td>
                                                    <td className="py-3 px-3 text-right font-mono text-slate-500">
                                                        ₹{totalGst}
                                                    </td>
                                                    <td className="py-3 px-3 text-right font-mono font-black text-slate-900">
                                                        ₹{item.totalPrice || (item.pricePerUnit * item.quantity)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Invoice Summary Breakdown */}
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
                                <div className="flex justify-between text-slate-500 font-semibold">
                                    <span>Medicines Subtotal (Your Rate)</span>
                                    <span className="font-mono">₹{order.verifiedBill.itemTotal || 0}</span>
                                </div>
                                <div className="flex justify-between text-slate-500 font-semibold">
                                    <span>Logistics / Delivery Charge</span>
                                    <span className="font-mono">₹{order.verifiedBill.deliveryCharge || 0}</span>
                                </div>
                                <div className="pt-2 border-t border-slate-200 flex justify-between text-slate-900 font-black text-sm">
                                    <span>Total Payable by Customer</span>
                                    <span className="font-mono text-[#3d3f96] text-base font-extrabold">
                                        ₹{order.verifiedBill.totalAmount || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* EDIT / CREATE MODE: Pharmacist Custom Price Creator */
                        <form onSubmit={handleSubmitBill} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <div>
                                    <span className="text-xs font-black uppercase tracking-wider text-[#3d3f96] flex items-center gap-1.5">
                                        <IndianRupee size={15} /> Custom Pricing Workbench
                                    </span>
                                    <h3 className="text-base font-black text-slate-900 mt-0.5">
                                        Set Your Own Prices &amp; Send Quote
                                    </h3>
                                    <p className="text-[11px] text-slate-400 font-medium">
                                        Define selling prices, batch MRPs, and quantities as per your store's inventory.
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    {order.verifiedBill && (
                                        <button
                                            type="button"
                                            onClick={() => setIsEditingBill(false)}
                                            className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs rounded-xl transition cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={addItemRow}
                                        className="px-3.5 py-2 bg-[#3d3f96]/10 text-[#3d3f96] hover:bg-[#3d3f96]/20 font-bold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer"
                                    >
                                        <Plus size={14} /> Add Medicine
                                    </button>
                                </div>
                            </div>

                            {/* Line Items List */}
                            <div className="space-y-3.5">
                                {billedItems.map((item, index) => {
                                    const itemSellingTotal = (Number(item.pricePerUnit || 0) * Number(item.quantity || 0));
                                    const itemMrpTotal = ((Number(item.mrp) > 0 ? Number(item.mrp) : Number(item.pricePerUnit || 0)) * Number(item.quantity || 0));
                                    const discountPercent =
                                        itemMrpTotal > 0 && itemSellingTotal < itemMrpTotal
                                            ? Math.round(((itemMrpTotal - itemSellingTotal) / itemMrpTotal) * 100)
                                            : 0;

                                    return (
                                        <div
                                            key={index}
                                            className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 relative transition hover:border-slate-300"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                                    Medicine #{index + 1}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    {discountPercent > 0 && (
                                                        <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                                            {discountPercent}% OFF MRP
                                                        </span>
                                                    )}
                                                    {billedItems.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItemRow(index)}
                                                            className="text-slate-400 hover:text-rose-500 transition cursor-pointer p-1"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                                                {/* Medicine Name */}
                                                <div className="md:col-span-5 space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-500">Medicine Name</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="e.g. Acivir 200 Tablet"
                                                        value={item.name}
                                                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96]"
                                                    />
                                                </div>

                                                {/* Batch MRP */}
                                                <div className="md:col-span-2 space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-500">Batch MRP (₹)</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        placeholder="105"
                                                        value={item.mrp === '' ? '' : item.mrp}
                                                        onChange={(e) => handleItemChange(index, 'mrp', e.target.value)}
                                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-800 outline-none focus:border-[#3d3f96]"
                                                    />
                                                </div>

                                                {/* Chemist Selling Price */}
                                                <div className="md:col-span-3 space-y-1">
                                                    <label className="text-[10px] font-black text-[#3d3f96] flex items-center gap-1">
                                                        <Tag size={10} /> Your Price / Unit (₹)*
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0.01"
                                                        step="0.01"
                                                        required
                                                        placeholder="105"
                                                        value={item.pricePerUnit === '' ? '' : item.pricePerUnit}
                                                        onChange={(e) => handleItemChange(index, 'pricePerUnit', e.target.value)}
                                                        className="w-full px-3 py-2 bg-white border-2 border-[#3d3f96]/30 focus:border-[#3d3f96] rounded-xl text-xs font-black font-mono text-[#3d3f96] outline-none"
                                                    />
                                                </div>

                                                {/* Quantity */}
                                                <div className="md:col-span-2 space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-500">Quantity</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        required
                                                        placeholder="7"
                                                        value={item.quantity === '' ? '' : item.quantity}
                                                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-800 outline-none focus:border-[#3d3f96]"
                                                    />
                                                </div>
                                            </div>

                                            {/* Line Item Total */}
                                            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px] font-semibold text-slate-500">
                                                <span>Calculation: ₹{Number(item.pricePerUnit || 0)} × {Number(item.quantity || 0)} units</span>
                                                <span className="font-mono font-bold text-slate-900">
                                                    Line Total: ₹{itemSellingTotal.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Logistics & Delivery Charge Input */}
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                                <div>
                                    <label className="font-extrabold text-slate-800 block">
                                        Logistics &amp; Delivery Fee (₹)
                                    </label>
                                    <span className="text-[10px] text-slate-400">
                                        Set your store's delivery rate or enter 0 for Free Delivery
                                    </span>
                                </div>
                                <div className="w-36">
                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={deliveryCharge === '' ? '' : deliveryCharge}
                                        onChange={(e) => setDeliveryCharge(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black font-mono text-slate-800 outline-none focus:border-[#3d3f96] text-right"
                                    />
                                </div>
                            </div>

                            {/* Live Pricing Summary Box */}
                            <div className="p-5 bg-gradient-to-r from-indigo-50/70 to-purple-50/50 rounded-2xl border border-indigo-100 space-y-3">
                                <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                                    <span>Medicines Subtotal (Your Rate):</span>
                                    <span className="font-mono font-bold text-slate-800">₹{calculatedItemTotal.toFixed(2)}</span>
                                </div>

                                {customerSavings > 0 && (
                                    <div className="flex items-center justify-between text-xs text-emerald-600 font-bold">
                                        <span className="flex items-center gap-1">
                                            <Sparkles size={12} /> Total Discount Offered:
                                        </span>
                                        <span className="font-mono">- ₹{customerSavings.toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                                    <span>Delivery Fee:</span>
                                    <span className="font-mono font-bold text-slate-800">₹{Number(deliveryCharge || 0).toFixed(2)}</span>
                                </div>

                                <div className="pt-2 border-t border-indigo-200 flex items-center justify-between">
                                    <div>
                                        <span className="text-[11px] font-black uppercase tracking-wider text-[#3d3f96] block">
                                            Total Patient Bill
                                        </span>
                                        <span className="text-[10px] text-slate-400">
                                            (Auto-calculates HSN 3004 GST and invoice summary)
                                        </span>
                                    </div>
                                    <div className="font-mono text-2xl font-black text-[#3d3f96]">
                                        ₹{calculatedGrandTotal.toFixed(2)}
                                    </div>
                                </div>
                            </div>

                            {/* Submit Custom Price Button */}
                            <div className="pt-2 flex items-center justify-end gap-3">
                                <button
                                    type="submit"
                                    disabled={actionLoading || isRejected || isPaid}
                                    className="px-6 py-3.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    {actionLoading ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <Send size={16} />
                                    )}
                                    <span>Submit Your Price &amp; Notify Patient</span>
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* --- REJECT / DECLINE MODAL --- */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2 text-rose-600 font-black text-sm">
                                <AlertCircle size={18} />
                                <span>Decline Prescription Request</span>
                            </div>
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <p className="text-xs text-slate-600">
                            Select or enter a reason to decline this prescription request:
                        </p>

                        <div className="space-y-1.5">
                            <span className="text-[10px] font-black uppercase text-slate-400">Presets:</span>
                            {presetRejectReasons.map((reason, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setRejectReason(reason)}
                                    className="w-full text-left text-[11px] p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold border border-slate-100 transition truncate cursor-pointer"
                                >
                                    • {reason}
                                </button>
                            ))}
                        </div>

                        <textarea
                            rows={3}
                            placeholder="Type a custom reason..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-rose-500 focus:bg-white transition"
                        />

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setShowRejectModal(false)}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={actionLoading || !rejectReason.trim()}
                                onClick={handleRejectRequest}
                                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                                {actionLoading ? <Loader2 size={13} className="animate-spin" /> : null}
                                <span>Confirm Decline</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- ALL DRIVERS MODAL --- */}
            <AllDrivers
                isOpen={isDriverModalOpen}
                onClose={() => setIsDriverModalOpen(false)}
                orderId={targetOrderIdForDriver}
                assignedDriver={order.driver}
                onDriverAssigned={fetchOrderDetails}
            />
        </div>
    );
}