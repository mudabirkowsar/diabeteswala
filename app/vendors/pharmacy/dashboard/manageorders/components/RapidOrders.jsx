"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Zap,
    Search,
    Loader2,
    Phone,
    CheckCircle2,
    AlertCircle,
    Package,
    Truck,
    Eye,
    Inbox,
    Clock,
    User,
    ChevronLeft,
    ChevronRight,
    Flame,
    Timer
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import PharmacyAPI from '../../../../../services/PharmacyVendorAPI'

export default function RapidOrders() {
    const router = useRouter();

    // --- State Management ---
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters & Pagination
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);

    const statusOptions = ['All', 'Pending', 'Placed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

    // --- Fetch Rapid (Express 1-Hour) Orders ---
    const fetchRapidOrders = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 15,
                ...(selectedStatus !== 'All' && { status: selectedStatus }),
            };

            const response = await PharmacyAPI.getPharmacyRapidOrders(params);

            if (response && response.success) {
                let fetchedData = response.data || [];

                // Client-side search fallback (Order ID, Customer Name, Phone)
                if (searchQuery.trim()) {
                    const q = searchQuery.trim().toLowerCase();
                    fetchedData = fetchedData.filter(order =>
                        order.orderId?.toLowerCase().includes(q) ||
                        order.customer?.name?.toLowerCase().includes(q) ||
                        order.customer?.phone?.includes(q)
                    );
                }

                setOrders(fetchedData);
                setTotalPages(response.totalPages || 1);
                setTotalOrders(response.total || fetchedData.length);
            } else {
                setOrders([]);
            }
        } catch (err) {
            console.error("Error retrieving rapid orders:", err);
            toast.error("Failed to load express orders.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRapidOrders();
    }, [selectedStatus, page]);

    // Handle instant search filtering
    const filteredOrders = orders.filter((order) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            order.orderId?.toLowerCase().includes(q) ||
            order.customer?.name?.toLowerCase().includes(q) ||
            order.customer?.phone?.includes(q)
        );
    });

    // --- Express Status Badge Helper ---
    const renderStatusBadge = (status) => {
        const uppercase = status?.toUpperCase();
        if (uppercase === 'DELIVERED') {
            return (
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 flex items-center gap-1 w-fit">
                    <CheckCircle2 size={11} /> Delivered
                </span>
            );
        }
        if (uppercase === 'SHIPPED') {
            return (
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 flex items-center gap-1 w-fit">
                    <Truck size={11} /> Shipped
                </span>
            );
        }
        if (uppercase === 'PACKED') {
            return (
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100 flex items-center gap-1 w-fit">
                    <Package size={11} /> Packed
                </span>
            );
        }
        if (uppercase === 'PENDING' || uppercase === 'PLACED') {
            return (
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1.5 w-fit animate-pulse">
                    <Flame size={12} className="text-amber-500 fill-amber-500" /> Action Required
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
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" /> {status || 'Processing'}
            </span>
        );
    };

    return (
        <div className="space-y-6 text-left select-none antialiased">
            <Toaster position="top-right" />

            {/* --- EXPRESS PRIORITY NOTICE BANNER --- */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-[1px] rounded-3xl shadow-sm">
                <div className="bg-white rounded-[23px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-200 shrink-0">
                            <Zap size={20} className="fill-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                                    Express 60-Minute Fast-Track Queue
                                </h3>
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                                    Priority SLA
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">
                                These emergency prescriptions & medicines must be packed and assigned to a driver within 10 minutes.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs font-black bg-amber-50 text-amber-900 px-3 py-1.5 rounded-xl border border-amber-200">
                        <Timer size={14} className="text-amber-600" />
                        <span>SLA: 60 MIN EXPRESS</span>
                    </div>
                </div>
            </div>

            {/* --- TOP SEARCH & STATUS FILTER BAR --- */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">

                    {/* Search Input */}
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-3 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search Express Orders by ID, Customer, Phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-amber-500 focus:bg-white transition"
                        />
                    </div>

                    {/* Status Tabs Filter */}
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto [&::-webkit-scrollbar]:hidden pb-1 md:pb-0">
                        {statusOptions.map((status) => {
                            const isSelected = selectedStatus === status;
                            return (
                                <button
                                    key={status}
                                    onClick={() => {
                                        setSelectedStatus(status);
                                        setPage(1);
                                    }}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                                        isSelected
                                            ? 'bg-amber-500 text-white border-amber-500 font-black shadow-sm'
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

            {/* --- RAPID ORDERS TABLE VIEW --- */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <Loader2 className="animate-spin text-amber-500 mb-3" size={36} />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Loading priority express orders...
                    </p>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm border-dashed">
                    <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl mb-3">
                        <Zap size={28} />
                    </div>
                    <h3 className="text-base font-bold text-slate-700">No Express Orders Pending</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        No 1-hour express rapid deliveries match the selected criteria right now.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 uppercase font-extrabold bg-slate-50/70 tracking-wider">
                                    <th className="py-4 px-5">Express Order ID</th>
                                    <th className="py-4 px-5">Patient & Contact</th>
                                    <th className="py-4 px-5">Items & Prescription</th>
                                    <th className="py-4 px-5">Urgency Slot</th>
                                    <th className="py-4 px-5">Total & Rapid Fee</th>
                                    <th className="py-4 px-5">Status</th>
                                    <th className="py-4 px-5 text-right">View / Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                                {filteredOrders.map((order) => {
                                    const timeFormatted = order.createdAt
                                        ? new Date(order.createdAt).toLocaleTimeString("en-US", {
                                              hour: '2-digit',
                                              minute: '2-digit',
                                              hour12: true
                                          })
                                        : '—';

                                    const targetId = order._id || order.orderId;

                                    return (
                                        <tr
                                            key={order._id}
                                            onClick={() => router.push(`/vendors/pharmacy/dashboard/manageorders/orderdetail/${targetId}`)}
                                            className="hover:bg-amber-50/30 transition-colors cursor-pointer group"
                                        >
                                            {/* Order ID & Express Tag */}
                                            <td className="py-4 px-5">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <Zap size={14} className="text-amber-500 fill-amber-500 shrink-0" />
                                                        <strong className="text-slate-900 font-black tracking-tight group-hover:text-amber-600 transition-colors">
                                                            {order.orderId}
                                                        </strong>
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                                        <Clock size={11} /> {timeFormatted}
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        <span className="inline-block text-[9px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                                            Rapid 60-Min
                                                        </span>
                                                        <span className="inline-block text-[9px] font-bold uppercase text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                                            {order.orderType}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Patient Contact */}
                                            <td className="py-4 px-5">
                                                <div className="flex items-center gap-2.5 min-w-[150px]">
                                                    <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 text-amber-600">
                                                        <User size={15} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <strong className="block text-slate-800 font-extrabold truncate">
                                                            {order.customer?.name || "Patient"}
                                                        </strong>
                                                        <a
                                                            href={`tel:${order.customer?.phone}`}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="text-[10px] text-amber-600 font-bold hover:underline flex items-center gap-1"
                                                        >
                                                            <Phone size={10} /> {order.customer?.phone || "No Contact"}
                                                        </a>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Items List */}
                                            <td className="py-4 px-5">
                                                <div className="space-y-1 max-w-[220px]">
                                                    {order.itemsSummary?.slice(0, 2).map((item, idx) => (
                                                        <p key={idx} className="text-[11px] text-slate-800 truncate font-bold">
                                                            • {item.name} <span className="text-amber-600">x{item.quantity}</span>
                                                        </p>
                                                    ))}
                                                    {order.itemsCount > 2 && (
                                                        <span className="text-[10px] text-slate-400 italic block">
                                                            +{order.itemsCount - 2} more item(s)
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Express Timing Window */}
                                            <td className="py-4 px-5">
                                                <div className="space-y-1">
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                                                        <Timer size={12} />
                                                        {order.timing?.appointmentTime || '1 Hour Express'}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-bold block">
                                                        City: {order.deliveryCity || 'Mohali'}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Billing & Rapid Charge */}
                                            <td className="py-4 px-5">
                                                <div className="space-y-0.5">
                                                    <strong className="font-mono text-sm font-black text-slate-900 block">
                                                        ₹{order.totalAmount || 0}
                                                    </strong>
                                                    {order.rapidCharge > 0 && (
                                                        <span className="text-[9px] font-mono text-amber-700 font-bold block">
                                                            Incl. ₹{order.rapidCharge} express fee
                                                        </span>
                                                    )}
                                                    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                                        order.paymentStatus === 'Paid'
                                                            ? 'bg-emerald-50 text-emerald-600'
                                                            : 'bg-amber-50 text-amber-600'
                                                    }`}>
                                                        {order.paymentMethod} • {order.paymentStatus}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Status Badge */}
                                            <td className="py-4 px-5">
                                                {renderStatusBadge(order.status)}
                                            </td>

                                            {/* View Button */}
                                            <td className="py-4 px-5 text-right">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/vendors/pharmacy/dashboard/manageorders/orderdetail/${targetId}`);
                                                    }}
                                                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
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

                    {/* Pagination Bar */}
                    {totalPages > 1 && (
                        <div className="py-3 px-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <span className="text-xs text-slate-500 font-medium">
                                Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalOrders} express orders)
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((p) => p + 1)}
                                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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