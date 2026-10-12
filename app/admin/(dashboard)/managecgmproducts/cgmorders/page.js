"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Search,
    Loader2,
    Phone,
    Mail,
    CheckCircle2,
    AlertCircle,
    Package,
    Clock,
    Truck,
    Eye,
    Inbox,
    Filter,
    ChevronLeft,
    ChevronRight,
    Activity,
    CreditCard,
    UserCheck
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Update this import to where your API functions are declared
import AdminAPI from '../../../../services/AdminAPI';

// Base media helper for image URLs
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";

const getMediaUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    return `${BASE_SERVER_URL}/${cleanPath}`;
};

const PRODUCT_PLACEHOLDER = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=200";

export default function CgmOrdersPage() {
    const router = useRouter();

    // Data & Pagination States
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const limit = 10;

    // Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [selectedProductType, setSelectedProductType] = useState('All');
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('All');

    // Fetch Orders from API
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit,
                ...(searchQuery.trim() && { search: searchQuery.trim() }),
                ...(selectedStatus !== 'All' && { status: selectedStatus }),
                ...(selectedProductType !== 'All' && { productType: selectedProductType }),
                ...(selectedPaymentStatus !== 'All' && { paymentStatus: selectedPaymentStatus }),
            };

            const response = await AdminAPI.getAdminCgmOrdersList(params);

            if (response && response.success) {
                setOrders(response.data || []);
                setTotalPages(response.totalPages || 1);
                setTotalOrders(response.totalOrders || 0);
            } else {
                toast.error(response?.message || "Failed to load CGM orders.");
            }
        } catch (err) {
            console.error("Error retrieving CGM orders:", err);
            toast.error(err.response?.data?.message || "Failed to load CGM orders.");
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchQuery, selectedStatus, selectedProductType, selectedPaymentStatus]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Handle Search/Filter changes by resetting to Page 1
    const handleStatusChange = (status) => {
        setSelectedStatus(status);
        setCurrentPage(1);
    };

    const handleProductTypeChange = (type) => {
        setSelectedProductType(type);
        setCurrentPage(1);
    };

    const handlePaymentStatusChange = (status) => {
        setSelectedPaymentStatus(status);
        setCurrentPage(1);
    };

    // Helper: Render Status Badge
    const renderStatusBadge = (status) => {
        const uppercase = status?.toUpperCase();
        switch (uppercase) {
            case 'DELIVERED':
                return (
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 w-fit">
                        <CheckCircle2 size={11} /> Delivered
                    </span>
                );
            case 'SHIPPED':
                return (
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 flex items-center gap-1 w-fit">
                        <Truck size={11} /> Shipped
                    </span>
                );
            case 'PACKED':
                return (
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 flex items-center gap-1 w-fit">
                        <Package size={11} /> Packed
                    </span>
                );
            case 'CONFIRMED':
                return (
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 flex items-center gap-1 w-fit">
                        <CheckCircle2 size={11} /> Confirmed
                    </span>
                );
            case 'CANCELLED':
                return (
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 flex items-center gap-1 w-fit">
                        <AlertCircle size={11} /> Cancelled
                    </span>
                );
            default: // Placed / New
                return (
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1 w-fit">
                        <Clock size={11} /> {status || 'Placed'}
                    </span>
                );
        }
    };

    const statusOptions = ['All', 'Placed', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

    return (
        <div className="space-y-6 text-left select-none antialiased  max-w-7xl mx-auto">
            <Toaster position="top-right" />

            {/* Header Title */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <Activity className="text-[#3d3f96]" size={22} />
                        CGM & Glucometer Orders
                    </h1>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">
                        Manage continuous glucose monitoring and glucometer device orders
                    </p>
                </div>
                <div className="bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-sm text-xs font-bold text-slate-600">
                    Total Orders: <span className="text-[#3d3f96] font-black">{totalOrders}</span>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">

                    {/* Search Field */}
                    <div className="relative md:col-span-5">
                        <Search className="absolute left-4 top-3 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by Order ID, Customer, Phone, or Product..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition"
                        />
                    </div>

                    {/* Product Type Filter */}
                    <div className="md:col-span-3">
                        <select
                            value={selectedProductType}
                            onChange={(e) => handleProductTypeChange(e.target.value)}
                            className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition"
                        >
                            <option value="All">All Products</option>
                            <option value="CGM">CGM</option>
                            <option value="Glucometer">Glucometer</option>
                        </select>
                    </div>

                    {/* Payment Status Filter */}
                    <div className="md:col-span-4">
                        <select
                            value={selectedPaymentStatus}
                            onChange={(e) => handlePaymentStatusChange(e.target.value)}
                            className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition"
                        >
                            <option value="All">All Payment Statuses</option>
                            <option value="Paid">Paid</option>
                            <option value="Pending">Pending</option>
                            <option value="Failed">Failed</option>
                            <option value="Refunded">Refunded</option>
                        </select>
                    </div>
                </div>

                {/* Status Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-2 shrink-0">
                        <Filter size={12} /> Status:
                    </span>
                    {statusOptions.map((status) => {
                        const isSelected = selectedStatus === status;
                        return (
                            <button
                                key={status}
                                onClick={() => handleStatusChange(status)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${isSelected
                                        ? 'bg-[#3d3f96]/10 text-[#3d3f96] border-[#3d3f96]/30 font-black shadow-sm'
                                        : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                                    }`}
                            >
                                {status}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Table or Empty/Loading States */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Loading CGM Orders...
                    </p>
                </div>
            ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 text-center bg-white rounded-3xl border border-slate-200 shadow-sm border-dashed">
                    <Inbox className="w-12 h-12 text-slate-300 mb-3" />
                    <h3 className="text-base font-bold text-slate-700">No Orders Found</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        No CGM or Glucometer orders matched the current search and filter criteria.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 uppercase font-extrabold bg-slate-50/70 tracking-wider">
                                    <th className="py-4 px-5">Order ID & Date</th>
                                    <th className="py-4 px-5">Customer</th>
                                    <th className="py-4 px-5">Product & Variant</th>
                                    <th className="py-4 px-5">Coach & Extras</th>
                                    <th className="py-4 px-5">Payment & Total</th>
                                    <th className="py-4 px-5">Status</th>
                                    <th className="py-4 px-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                                {orders.map((order) => {
                                    const customer = order.customer || {};
                                    const product = order.product || {};
                                    const coach = order.coach || {};

                                    const orderDateFormatted = new Date(order.orderDate).toLocaleDateString("en-IN", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric"
                                    });

                                    const orderTimeFormatted = new Date(order.orderDate).toLocaleTimeString("en-IN", {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true
                                    });

                                    return (
                                        <tr key={order._id} className="hover:bg-slate-50/60 transition-colors">
                                            {/* Order ID & Date */}
                                            <td className="py-4 px-5">
                                                <div className="space-y-1">
                                                    <span className="text-slate-900 font-black tracking-tight block text-[13px]">
                                                        {order.orderId}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                                        <Clock size={11} /> {orderDateFormatted} • {orderTimeFormatted}
                                                    </span>
                                                    {order.city && (
                                                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md inline-block">
                                                            {order.city}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Customer */}
                                            <td className="py-4 px-5">
                                                <div className="space-y-0.5 min-w-[160px]">
                                                    <strong className="block text-slate-800 font-extrabold truncate">
                                                        {customer.name || "N/A"}
                                                    </strong>
                                                    <a
                                                        href={`tel:${customer.phone}`}
                                                        className="text-[10px] text-slate-500 font-bold hover:underline flex items-center gap-1"
                                                    >
                                                        <Phone size={10} className="text-[#3d3f96]" /> {customer.phone || "No Phone"}
                                                    </a>
                                                    {customer.email && (
                                                        <span className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                                                            <Mail size={10} /> {customer.email}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Product Info */}
                                            <td className="py-4 px-5">
                                                <div className="flex items-center gap-3 min-w-[200px]">
                                                    <img
                                                        src={getMediaUrl(product.mainImage) || PRODUCT_PLACEHOLDER}
                                                        alt={product.title}
                                                        className="w-10 h-10 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                                                        onError={(e) => { e.currentTarget.src = PRODUCT_PLACEHOLDER; }}
                                                    />
                                                    <div className="min-w-0">
                                                        <p className="text-[11px] font-extrabold text-slate-800 truncate max-w-[160px]" title={product.title}>
                                                            {product.title}
                                                        </p>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-[#3d3f96]/10 text-[#3d3f96]">
                                                                {product.productType}
                                                            </span>
                                                            <span className="text-[10px] font-semibold text-slate-500">
                                                                {product.variantName} (x{product.quantity})
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Coach & Extras */}
                                            <td className="py-4 px-5">
                                                <div className="space-y-1">
                                                    {coach.isIncluded ? (
                                                        <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md flex items-center gap-1 w-fit">
                                                            <UserCheck size={11} /> {coach.coachName || "Coach Included"}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] text-slate-400 font-semibold block">
                                                            No Coach Assigned
                                                        </span>
                                                    )}
                                                    {order.addonsCount > 0 && (
                                                        <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 font-bold inline-block">
                                                            +{order.addonsCount} Add-on{order.addonsCount > 1 ? 's' : ''}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Payment & Total Amount */}
                                            <td className="py-4 px-5">
                                                <div className="space-y-0.5">
                                                    <strong className="font-mono text-sm font-black text-slate-900 block">
                                                        ₹{order.totalAmount?.toLocaleString('en-IN') || 0}
                                                    </strong>
                                                    <div className="flex items-center gap-1">
                                                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${order.paymentStatus === 'Paid'
                                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                                : order.paymentStatus === 'Failed'
                                                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                                            }`}>
                                                            {order.paymentStatus}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 font-bold flex items-center gap-0.5">
                                                            <CreditCard size={10} /> {order.paymentMethod}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Order Status */}
                                            <td className="py-4 px-5">
                                                {renderStatusBadge(order.status)}
                                            </td>

                                            {/* View Details Navigation */}
                                            <td className="py-4 px-5 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => router.push(`/admin/managecgmproducts/cgmorders/orderdetail/${order.orderId || order._id}`)}
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

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                            <span className="text-xs font-bold text-slate-500">
                                Page <span className="text-slate-800">{currentPage}</span> of <span className="text-slate-800">{totalPages}</span>
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
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