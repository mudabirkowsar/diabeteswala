"use client";

import React, { useState, useEffect } from 'react';
import {
    Search,
    Loader2,
    Phone,
    CheckCircle2,
    AlertCircle,
    Package,
    ChefHat,
    Eye,
    Inbox,
    Clock
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

import FoodAPI from '../../../../../services/FoodVendorAPI';
import FoodOrderDetailModal from './FoodOrderDetailModal';

// --- BASE MEDIA HELPER ---
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

export default function FoodOrders() {
    // --- Data & Loading States ---
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- Filter & Search States ---
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // --- Detail Modal Target State ---
    const [inspectOrderId, setInspectOrderId] = useState(null);

    // --- Fetch Food Orders (Strictly Food Orders / Direct) ---
    const fetchKitchenFoodOrders = async () => {
        setLoading(true);
        try {
            const params = {
                bookingType: 'Direct', // STRICTLY DIRECT FOOD ORDERS ONLY
                ...(selectedStatus !== 'All' && { status: selectedStatus }),
                ...(searchQuery.trim() && { search: searchQuery.trim() })
            };
            const response = await FoodAPI.getKitchenOrders(params);
            if (response && response.success) {
                setOrders(response.data || []);
            }
        } catch (err) {
            console.error("Error retrieving kitchen food orders:", err);
            toast.error("Failed to load incoming food orders.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKitchenFoodOrders();
    }, [selectedStatus, searchQuery]);

    // --- Helper: Status Badge Render ---
    const renderStatusBadge = (status) => {
        const uppercase = status?.toUpperCase();
        if (uppercase === 'DELIVERED') {
            return (
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 flex items-center gap-1 w-fit">
                    <CheckCircle2 size={11} /> Delivered
                </span>
            );
        }
        if (uppercase === 'READY' || uppercase === 'READY FOR DELIVERY') {
            return (
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100 flex items-center gap-1 w-fit">
                    <Package size={11} /> Ready
                </span>
            );
        }
        if (uppercase === 'PREPARING') {
            return (
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 flex items-center gap-1 w-fit">
                    <ChefHat size={11} className="animate-bounce" /> Preparing
                </span>
            );
        }
        if (uppercase === 'CANCELLED') {
            return (
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100 flex items-center gap-1 w-fit">
                    <AlertCircle size={11} /> Cancelled
                </span>
            );
        }
        return (
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 flex items-center gap-1 w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" /> {status || 'New'}
            </span>
        );
    };

    const statusOptions = ['All', 'New', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];

    return (
        <div className="space-y-6 text-left select-none antialiased">
            <Toaster position="top-right" />

            {/* --- TOP SEARCH & STATUS FILTER BAR --- */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">

                    {/* Search Input */}
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-3 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by Order ID, Customer, Phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition"
                        />
                    </div>

                    {/* Status Tabs Filter */}
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto [&::-webkit-scrollbar]:hidden pb-1 md:pb-0">
                        {statusOptions.map((status) => {
                            const isSelected = selectedStatus === status;
                            return (
                                <button
                                    key={status}
                                    onClick={() => setSelectedStatus(status)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${isSelected
                                        ? 'bg-red-50/60 text-red-600 border-red-200/60 font-black shadow-sm'
                                        : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                                        }`}
                                >
                                    {status}
                                </button>
                            );
                        })}
                    </div>

                </div>
            </div>

            {/* --- CLEAN ORDERS TABLE VIEW --- */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading food orders table...</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm border-dashed">
                    <Inbox className="w-12 h-12 text-slate-300 mb-3" />
                    <h3 className="text-base font-bold text-slate-700">No Food Orders Found</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        No direct culinary orders match the active filter criteria. Check back for incoming tickets.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 uppercase font-extrabold bg-slate-50/70 tracking-wider">
                                    <th className="py-4 px-5">Order &amp; OTP</th>
                                    <th className="py-4 px-5">Customer &amp; Phone</th>
                                    <th className="py-4 px-5">Ordered Items</th>
                                    <th className="py-4 px-5">Payment &amp; Total</th>
                                    <th className="py-4 px-5">Current Status</th>
                                    <th className="py-4 px-5 text-right">View / Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                                {orders.map((order) => {
                                    const user = order.userId || {};
                                    const customerImg = getMediaUrl(user.profilePic) || USER_PLACEHOLDER;

                                    const timeFormatted = new Date(order.createdAt).toLocaleTimeString("en-US", {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true
                                    });

                                    return (
                                        <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">

                                            {/* Order ID, Time & OTP */}
                                            <td className="py-4 px-5">
                                                <div className="space-y-1">
                                                    <strong className="text-slate-900 font-black tracking-tight block">{order.bookingId}</strong>
                                                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                                        <Clock size={11} /> {timeFormatted}
                                                    </span>
                                                    {order.deliveryOTP && (
                                                        <span className="inline-block text-[9px] font-black uppercase text-red-600 bg-red-50/60 px-2 py-0.5 rounded-md border border-red-200/60 font-mono">
                                                            OTP: {order.deliveryOTP}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Customer Info */}
                                            <td className="py-4 px-5">
                                                <div className="flex items-center gap-2.5 min-w-[150px]">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                                                        <img
                                                            src={customerImg}
                                                            alt={user.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { e.target.src = USER_PLACEHOLDER; }}
                                                        />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <strong className="block text-slate-800 font-extrabold truncate">{user.name || "Customer"}</strong>
                                                        <a href={`tel:${user.phone}`} className="text-[10px] text-[#3d3f96] font-bold hover:underline flex items-center gap-1">
                                                            <Phone size={10} /> {user.phone || "No Phone"}
                                                        </a>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Ordered Items Summary */}
                                            <td className="py-4 px-5">
                                                <div className="space-y-1 max-w-[220px]">
                                                    {order.items?.map((item, idx) => (
                                                        <p key={idx} className="text-[11px] text-slate-800 truncate font-bold">
                                                            • {item.name} <span className="text-[#3d3f96]">x{item.quantity}</span>
                                                        </p>
                                                    ))}
                                                    {order.addons?.length > 0 && (
                                                        <span className="text-[10px] text-slate-400 italic block">
                                                            +{order.addons.length} accessory add-on{order.addons.length > 1 ? 's' : ''}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Payment & Total Amount */}
                                            <td className="py-4 px-5">
                                                <div className="space-y-0.5">
                                                    <strong className="font-mono text-sm font-black text-slate-900 block">₹{order.billSummary?.totalAmount || 0}</strong>
                                                    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${order.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                                        }`}>
                                                        {order.paymentMethod} • {order.paymentStatus}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Order Status Badge */}
                                            <td className="py-4 px-5">
                                                {renderStatusBadge(order.status)}
                                            </td>

                                            {/* Inspect / View Full Details Button */}
                                            <td className="py-4 px-5 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => setInspectOrderId(order._id)}
                                                    className="px-3.5 py-2 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
                                                >
                                                    <Eye size={13} />
                                                    <span>View Details</span>
                                                </button>
                                            </td>

                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- ISOLATED DETAIL MONOGRAPH MODAL COMPONENT (WITH STATUS BUTTONS & FULL ADDRESS) --- */}
            <FoodOrderDetailModal
                orderId={inspectOrderId}
                isOpen={!!inspectOrderId}
                onClose={() => setInspectOrderId(null)}
                onStatusUpdated={fetchKitchenFoodOrders}
            />

        </div>
    );
}