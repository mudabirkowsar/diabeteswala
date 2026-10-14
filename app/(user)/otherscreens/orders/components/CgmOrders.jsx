"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Loader2,
    AlertCircle,
    Calendar,
    CheckCircle2,
    ShieldCheck,
    Inbox,
    ChevronRight,
    ArrowRight,
    ReceiptText,
    Truck,
    Package,
    Activity,
    UserCheck,
    Clock,
    XCircle,
    Boxes,
    ChevronLeft
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Import your API service
import UserAPI from '../../../../services/UserAPI'; // Adjust path based on your folder structure

// --- BASE MEDIA HELPER ---
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";
const PLACEHOLDER_DEVICE_IMAGE = "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=300";

const getMediaUrl = (path) => {
    if (!path) return PLACEHOLDER_DEVICE_IMAGE;
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    return `${BASE_SERVER_URL}/${cleanPath}`;
};

const STATUS_FILTERS = [
    { label: 'All Orders', value: '' },
    { label: 'Placed', value: 'Placed' },
    { label: 'Confirmed', value: 'Confirmed' },
    { label: 'Packed', value: 'Packed' },
    { label: 'Shipped', value: 'Shipped' },
    { label: 'Delivered', value: 'Delivered' },
    { label: 'Cancelled', value: 'Cancelled' }
];

export default function CgmOrders() {
    const router = useRouter();

    // --- State Management ---
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeStatus, setActiveStatus] = useState('');
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalOrders: 0,
        limit: 10
    });

    // --- Fetch CGM Orders ---
    const fetchOrders = useCallback(async (page = 1, status = '') => {
        setLoading(true);
        try {
            const params = { page, limit: 10 };
            if (status) params.status = status;

            const response = await UserAPI.getMyCgmOrders(params);
            if (response && response.success) {
                setOrders(response.data || []);
                setPagination({
                    currentPage: response.currentPage || 1,
                    totalPages: response.totalPages || 1,
                    totalOrders: response.totalOrders || 0,
                    limit: response.limit || 10
                });
            } else {
                toast.error("Failed to load CGM orders.");
            }
        } catch (err) {
            console.error("Error retrieving CGM orders:", err);
            toast.error(err?.response?.data?.message || "Failed to retrieve CGM orders.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders(1, activeStatus);
    }, [fetchOrders, activeStatus]);

    const handleFilterChange = (status) => {
        setActiveStatus(status);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchOrders(newPage, activeStatus);
        }
    };

    // --- Status Badge Helper ---
    const renderStatusBadge = (status) => {
        const uppercase = status?.toUpperCase() || 'PLACED';

        if (uppercase === 'DELIVERED') {
            return (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/70 shadow-xs">
                    <CheckCircle2 size={12} className="text-emerald-500" /> Delivered
                </span>
            );
        }
        if (uppercase === 'CANCELLED') {
            return (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200/70 shadow-xs">
                    <XCircle size={12} className="text-rose-500" /> Cancelled
                </span>
            );
        }
        if (uppercase === 'SHIPPED') {
            return (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/70 shadow-xs animate-pulse">
                    <Truck size={12} className="text-amber-600" /> In Transit (Shipped)
                </span>
            );
        }
        if (uppercase === 'PACKED') {
            return (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200/70 shadow-xs">
                    <Package size={12} className="text-purple-600" /> Packed
                </span>
            );
        }
        if (uppercase === 'CONFIRMED') {
            return (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/70 shadow-xs">
                    <CheckCircle2 size={12} className="text-teal-600" /> Confirmed
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#3d3f96] bg-indigo-50/80 px-3 py-1 rounded-full border border-indigo-200/60 shadow-xs">
                <Clock size={12} className="text-[#3d3f96]" /> {status || 'Placed'}
            </span>
        );
    };

    return (
        <div className="space-y-6 text-left select-none max-w-[1200px] mx-auto py-4 px-3 sm:px-0">
            <Toaster position="top-right" />

            {/* Orders Feed */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-28 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                        <Loader2 className="animate-spin text-[#3d3f96]" size={28} />
                    </div>
                    <p className="text-xs font-black text-slate-700 uppercase tracking-widest">Scanning CGM Order Ledgers...</p>
                    <p className="text-[11px] font-semibold text-slate-400 mt-1">Retrieving hardware serial logs and dispatch milestones</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 sm:p-20 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm border-dashed">
                    <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 mb-4 shadow-inner">
                        <Inbox className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-extrabold text-slate-800">No CGM Devices Ordered Yet</h3>
                    <p className="text-xs text-slate-400 mt-1.5 max-w-sm font-medium leading-relaxed">
                        Continuous glucose monitors give you real-time sugar tracking and metabolic health insights. Order your first biosensor to view history here!
                    </p>
                    <button
                        onClick={() => router.push('/cgm')}
                        className="mt-6 inline-flex items-center gap-2 bg-[#3d3f96] hover:bg-[#2e3075] text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-indigo-950/10 cursor-pointer"
                    >
                        <span>Explore CGM Devices</span>
                        <ArrowRight size={14} />
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => {
                        const device = order.device || {};
                        const deviceImg = getMediaUrl(device.mainImage);
                        const orderDateFormatted = new Date(order.orderDate || order.createdAt).toLocaleDateString("en-US", {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        });

                        const isDelivered = order.status?.toUpperCase() === 'DELIVERED';
                        const isCancelled = order.status?.toUpperCase() === 'CANCELLED';

                        return (
                            <div
                                key={order._id}
                                className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 flex flex-col lg:flex-row lg:items-center justify-between gap-5 group text-left relative overflow-hidden"
                            >
                                {/* Left indicator bar */}
                                <div
                                    className={`absolute top-0 bottom-0 left-0 w-1.5 ${
                                        isDelivered
                                            ? 'bg-emerald-500'
                                            : isCancelled
                                            ? 'bg-rose-500'
                                            : 'bg-[#3d3f96]'
                                    }`}
                                />

                                {/* 1. Main Device & ID Details */}
                                <div className="flex items-center gap-4 min-w-0 flex-1 pl-2">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200/80 overflow-hidden shrink-0 shadow-xs p-1">
                                        <img
                                            src={deviceImg}
                                            alt={device.title || "CGM Device"}
                                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                            onError={(e) => {
                                                e.target.src = PLACEHOLDER_DEVICE_IMAGE;
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg font-mono">
                                                #{order.orderId}
                                            </span>
                                            <span className="text-slate-300">•</span>
                                            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                                                <Calendar size={12} /> {orderDateFormatted}
                                            </span>
                                            {order.city && (
                                                <>
                                                    <span className="text-slate-300">•</span>
                                                    <span className="text-[11px] font-bold text-slate-500">
                                                        {order.city}
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        <h4 className="text-sm sm:text-base font-black text-slate-900 tracking-tight truncate group-hover:text-[#3d3f96] transition-colors">
                                            {device.title || "Continuous Glucose Monitor"}
                                        </h4>

                                        {/* Variant, Coach & Addons Badges */}
                                        <div className="flex items-center gap-2 flex-wrap pt-0.5">
                                            {device.selectedVariant && (
                                                <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                                                    {device.selectedVariant}
                                                </span>
                                            )}

                                            {order.coachSummary?.isIncluded && (
                                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                                                    <UserCheck size={11} /> {order.coachSummary.coachName} ({order.coachSummary.consultationMode || 'Coach'})
                                                </span>
                                            )}

                                            {order.addonsCount > 0 && (
                                                <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                                                    <Boxes size={11} /> +{order.addonsCount} Add-ons
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Middle: Status & Bill Details */}
                                <div className="flex items-center justify-between lg:justify-center gap-6 border-t lg:border-t-0 lg:border-x border-slate-100 pt-3 lg:pt-0 lg:px-8 shrink-0">
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black uppercase text-slate-400 block leading-none">
                                            Status
                                        </span>
                                        <div>{renderStatusBadge(order.status)}</div>
                                    </div>

                                    <div className="space-y-0.5 text-right lg:text-left">
                                        <span className="text-[9px] font-black uppercase text-slate-400 block leading-none">
                                            Total Paid ({order.paymentMethod || 'Online'})
                                        </span>
                                        <span className="font-mono font-black text-lg text-slate-900">
                                            ₹{order.totalAmount || 0}
                                        </span>
                                    </div>
                                </div>

                                {/* 3. Right: Action Navigation */}
                                <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-bold hidden sm:inline-flex">
                                        <ShieldCheck size={14} className="text-emerald-500" />
                                        {isDelivered ? 'Fulfilled' : isCancelled ? 'Closed' : 'Hardware Covered'}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() => router.push(`/otherscreens/orders/cgmorderdetail/${order._id}`)}
                                        className="bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-[10px] font-black uppercase tracking-wider px-5 py-3 rounded-2xl shadow-md shadow-indigo-950/10 transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <ReceiptText size={13} />
                                        <span>View Details & Specs</span>
                                        <ChevronRight size={13} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {/* Pagination Controls */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-100 p-4 shadow-xs">
                            <span className="text-xs font-bold text-slate-500">
                                Page <strong className="text-slate-800">{pagination.currentPage}</strong> of{' '}
                                <strong className="text-slate-800">{pagination.totalPages}</strong>
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                    disabled={pagination.currentPage <= 1}
                                    className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-slate-600 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    disabled={pagination.currentPage >= pagination.totalPages}
                                    className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-slate-600 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}