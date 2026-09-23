"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
    UtensilsCrossed,
    Eye,
    CheckCircle2,
    Inbox,
    ChevronLeft,
    ChevronRight,
    X,
    Receipt,
    User,
    Calendar,
    Phone,
    Mail,
    Search,
    MapPin,
    Loader2,
    Star,
    CircleDot,
    CreditCard,
    Ban,
    ExternalLink,
    Clock,
    ShoppingBag,
    Tag
} from "lucide-react";

// Exact requested API path
import AdminAPI from "../../../../services/AdminAPI";

// Cancelled Food Orders Modal component
import CancelledFoodOrdersModal from "./CancelledFoodOrdersModal";

export default function FoodVendorOrders() {
    // ----------------- OUTLETS TABLE STATE -----------------
    const [outlets, setOutlets] = useState([]);
    const [loadingOutlets, setLoadingOutlets] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [cityFilter, setCityFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalActiveOutlets, setTotalActiveOutlets] = useState(0);

    // ----------------- CANCELLED ORDERS MODAL STATE -----------------
    const [showCancelledModal, setShowCancelledModal] = useState(false);

    // ----------------- OUTLET ORDER HISTORY MODAL STATE -----------------
    const [showModal, setShowModal] = useState(false);
    const [selectedVendorId, setSelectedVendorId] = useState(null);
    const [modalOutlet, setModalOutlet] = useState(null);
    const [modalOrders, setModalOrders] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalSearch, setModalSearch] = useState("");
    const [modalStatus, setModalStatus] = useState("");
    const [modalPage, setModalPage] = useState(1);
    const [modalTotalPages, setModalTotalPages] = useState(1);
    const [totalAssociatedOrders, setTotalAssociatedOrders] = useState(0);

    const modalRef = useRef(null);

    // ========================================================
    // 1. FETCH APPROVED OUTLETS (DASHBOARD TABLE)
    // ========================================================
    const fetchOutlets = useCallback(async () => {
        try {
            setLoadingOutlets(true);
            const params = {
                page: currentPage,
                limit: 10,
                ...(searchQuery.trim() && { search: searchQuery.trim() }),
                ...(cityFilter.trim() && { city: cityFilter.trim() })
            };

            const response = await AdminAPI.getApprovedOutlets(params);

            if (response && response.success) {
                setOutlets(response.data || []);
                setTotalPages(response.totalPages || 1);
                setTotalActiveOutlets(response.totalActiveOutlets || response.count || 0);
            }
        } catch (error) {
            console.error("Error fetching approved food outlets:", error);
            setOutlets([]);
        } finally {
            setLoadingOutlets(false);
        }
    }, [currentPage, searchQuery, cityFilter]);

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchOutlets();
        }, 300);
        return () => clearTimeout(debounce);
    }, [fetchOutlets]);

    // ========================================================
    // 2. FETCH OUTLET ORDER HISTORY (MODAL POPUP)
    // ========================================================
    const fetchOrderHistory = useCallback(async (vendorId, page = 1) => {
        if (!vendorId) return;
        try {
            setModalLoading(true);
            const params = {
                page: page,
                limit: 20,
                ...(modalSearch.trim() && { search: modalSearch.trim() }),
                ...(modalStatus && { status: modalStatus })
            };

            const response = await AdminAPI.getOutletOrderHistory(vendorId, params);

            if (response && response.success) {
                setModalOutlet(response.outlet || null);
                setModalOrders(response.orders || []);
                setModalTotalPages(response.totalPages || 1);
                setModalPage(response.currentPage || 1);
                setTotalAssociatedOrders(response.totalAssociatedOrders || response.count || 0);
            }
        } catch (error) {
            console.error("Error fetching outlet order history:", error);
            setModalOrders([]);
        } finally {
            setModalLoading(false);
        }
    }, [modalSearch, modalStatus]);

    // Open Order History Modal
    const handleViewOrders = (vendor) => {
        setSelectedVendorId(vendor._id);
        setModalOutlet({
            _id: vendor._id,
            name: vendor.outletName,
            email: vendor.email,
            phone: vendor.phone,
            city: vendor.city,
            profileImage: vendor.profileImage,
            rating: vendor.rating
        });
        setModalSearch("");
        setModalStatus("");
        setModalPage(1);
        setShowModal(true);
        fetchOrderHistory(vendor._id, 1);
    };

    // Close modal on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setShowModal(false);
            }
        };
        if (showModal) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showModal]);

    // Helper Status Badges styling
    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case "completed":
            case "delivered":
                return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case "new":
                return "bg-blue-50 text-blue-700 border-blue-200";
            case "ready":
            case "picked up":
            case "dispatched":
                return "bg-amber-50 text-amber-700 border-amber-200";
            case "cancelled":
                return "bg-rose-50 text-rose-700 border-rose-200";
            default:
                return "bg-slate-50 text-slate-700 border-slate-200";
        }
    };

    return (
        <div className="space-y-5">
            {/* 1. TOP HEADER WITH CANCELLED ORDERS BUTTON & FILTERS */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100/80 shadow-xs">
                        <UtensilsCrossed className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-black text-slate-900 tracking-tight">Approved Food Outlets</h2>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" /> {totalActiveOutlets} Active
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium">Manage and audit verified food delivery vendors & orders</p>
                    </div>
                </div>

                {/* Right Actions: Cancelled Orders Button + Search Inputs */}
                <div className="flex flex-wrap items-center gap-2.5">
                    {/* CANCELLED FOOD ORDERS BUTTON */}
                    <button
                        onClick={() => setShowCancelledModal(true)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-black text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 rounded-xl transition-all shadow-xs focus:outline-none"
                    >
                        <Ban className="w-4 h-4 text-rose-600" />
                        <span>Cancelled Orders</span>
                    </button>

                    {/* Search Input */}
                    <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search outlet, email, phone..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-8.5 pr-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#3D3F96] focus:outline-none transition-all w-48 sm:w-56"
                        />
                    </div>

                    {/* City Filter Input */}
                    <div className="relative">
                        <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="City filter..."
                            value={cityFilter}
                            onChange={(e) => {
                                setCityFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-8.5 pr-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#3D3F96] focus:outline-none transition-all w-28 sm:w-32"
                        />
                    </div>
                </div>
            </div>

            {/* 2. OUTLETS DATA TABLE */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs min-w-[950px] table-auto align-middle">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/70 border-b border-slate-100">
                                <th className="text-center px-5 py-4 w-14">Logo</th>
                                <th className="text-left px-5 py-4">Outlet Info</th>
                                <th className="text-left px-5 py-4">Contact Info</th>
                                <th className="text-left px-5 py-4">Location</th>
                                <th className="text-center px-5 py-4">Order Metrics</th>
                                <th className="text-center px-5 py-4">Status</th>
                                <th className="text-center px-5 py-4 w-36">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loadingOutlets ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Loader2 className="w-7 h-7 text-[#3D3F96] animate-spin" />
                                            <span className="text-xs font-bold text-slate-500">Loading food outlets...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : outlets.length > 0 ? (
                                outlets.map((vendor) => (
                                    <tr key={vendor._id} className="hover:bg-slate-50/60 transition-colors">
                                        {/* Logo */}
                                        <td className="px-5 py-4 text-center">
                                            {vendor.profileImage ? (
                                                <img
                                                    src={vendor.profileImage}
                                                    alt={vendor.outletName}
                                                    className="w-10 h-10 rounded-xl object-cover border border-slate-100 mx-auto shadow-xs"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = "https://placehold.co/100x100?text=Food";
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white font-black text-sm flex items-center justify-center mx-auto shadow-xs">
                                                    {vendor.outletName?.charAt(0) || "F"}
                                                </div>
                                            )}
                                        </td>

                                        {/* Outlet Name & Rating */}
                                        <td className="px-5 py-4">
                                            <div className="font-extrabold text-slate-800 text-sm">{vendor.outletName}</div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded">
                                                    <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                                    {vendor.rating || "0.0"}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-medium truncate max-w-[150px]">
                                                    {vendor.address || "Main Branch"}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Contact */}
                                        <td className="px-5 py-4">
                                            <div className="font-bold text-slate-700 flex items-center gap-1.5">
                                                <Mail className="w-3 h-3 text-slate-400" /> {vendor.email}
                                            </div>
                                            <div className="text-slate-500 font-semibold flex items-center gap-1.5 mt-0.5">
                                                <Phone className="w-3 h-3 text-slate-400" /> {vendor.phone}
                                            </div>
                                        </td>

                                        {/* Location */}
                                        <td className="px-5 py-4">
                                            <span className="font-bold text-slate-700 block">{vendor.city}</span>
                                            <span className="text-[10px] text-slate-400 font-medium">{vendor.state || "State"}</span>
                                        </td>

                                        {/* Metrics */}
                                        <td className="px-5 py-4 text-center">
                                            <div className="inline-flex items-center gap-2">
                                                <span className="text-[11px] font-extrabold text-slate-800" title="Total Orders">
                                                    {vendor.totalOrders || 0} Total
                                                </span>
                                                <span className="text-slate-300">&bull;</span>
                                                <span className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full" title="Active Orders">
                                                    {vendor.activeOrders || 0} Active
                                                </span>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-4 text-center">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wide">
                                                <CircleDot className="w-2.5 h-2.5 text-emerald-500" />
                                                {vendor.verification || "APPROVED"}
                                            </span>
                                        </td>

                                        {/* View Orders Action */}
                                        <td className="px-5 py-4 text-center">
                                            <button
                                                onClick={() => handleViewOrders(vendor)}
                                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-extrabold uppercase tracking-wider bg-[#3D3F96]/10 text-[#3D3F96] hover:bg-[#3D3F96] hover:text-white transition-all focus:outline-none shadow-xs"
                                            >
                                                <Eye className="w-3.5 h-3.5" /> View Orders
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2.5">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
                                                <Inbox className="w-6 h-6" />
                                            </div>
                                            <h4 className="text-xs font-bold text-slate-700">No Food Outlets Found</h4>
                                            <p className="text-[11px] text-slate-400">Try adjusting your search criteria or city filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION BAR */}
                <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 flex-wrap gap-3">
                    <button
                        disabled={currentPage <= 1 || loadingOutlets}
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
                    >
                        <ChevronLeft className="w-3.5 h-3.5" /> Previous
                    </button>

                    <span className="text-xs font-extrabold text-slate-500">
                        Page {currentPage} of {totalPages}
                    </span>

                    <button
                        disabled={currentPage >= totalPages || loadingOutlets}
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
                    >
                        Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* ========================================================
                3. EXTRA-LARGE OUTLET ORDER HISTORY DETAIL MODAL
            ======================================================== */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-y-auto animate-in fade-in duration-150">
                    <div
                        ref={modalRef}
                        className="bg-white rounded-3xl w-full max-w-7xl h-[92vh] max-h-[92vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col select-none animate-in zoom-in-95 duration-150"
                    >
                        {/* Big Modal Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0 bg-slate-50/70">
                            <div className="flex items-center gap-4">
                                <div className="w-13 h-13 rounded-2xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center shrink-0 border border-[#3D3F96]/20 shadow-xs">
                                    <Receipt className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2.5">
                                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Direct Food Orders History</h3>
                                        <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-[#3D3F96]/10 text-[#3D3F96] border border-[#3D3F96]/20">
                                            {totalAssociatedOrders} Total Orders
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500 mt-1">
                                        <span>Outlet: <strong className="text-slate-800 font-extrabold">{modalOutlet?.name}</strong></span>
                                        <span>&bull;</span>
                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {modalOutlet?.city}</span>
                                        <span>&bull;</span>
                                        <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {modalOutlet?.phone}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowModal(false)}
                                className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-all focus:outline-none shadow-xs"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Top Filters for Modal */}
                        <div className="px-6 py-3.5 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-4 shrink-0">
                            <div className="relative flex-1 min-w-[240px] max-w-md">
                                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by Order ID, Customer Name..."
                                    value={modalSearch}
                                    onChange={(e) => setModalSearch(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") fetchOrderHistory(selectedVendorId, 1);
                                    }}
                                    className="w-full pl-10 pr-4 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#3D3F96] focus:outline-none transition-all"
                                />
                            </div>

                            <div className="flex items-center gap-2.5">
                                <select
                                    value={modalStatus}
                                    onChange={(e) => {
                                        setModalStatus(e.target.value);
                                        fetchOrderHistory(selectedVendorId, 1);
                                    }}
                                    className="text-xs font-bold rounded-xl px-4 py-2 bg-slate-50 border border-slate-200 focus:outline-none text-slate-700"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="New">New</option>
                                    <option value="Ready">Ready</option>
                                    <option value="Picked Up">Picked Up</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>

                                <button
                                    onClick={() => fetchOrderHistory(selectedVendorId, 1)}
                                    className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-black rounded-xl transition-all shadow-xs"
                                >
                                    Filter
                                </button>
                            </div>
                        </div>

                        {/* Modal Body - Expanded Table & Detailed Cards */}
                        <div className="overflow-y-auto flex-1 p-6 space-y-4">
                            <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                                <table className="w-full text-xs text-left align-middle">
                                    <thead>
                                        <tr className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-100">
                                            <th className="px-5 py-4">Order ID & Type</th>
                                            <th className="px-5 py-4">Customer Details</th>
                                            <th className="px-5 py-4">Order Date & Time</th>
                                            <th className="px-5 py-4 w-1/3">Food & Meal Items Breakdown</th>
                                            <th className="px-5 py-4">Payment Info</th>
                                            <th className="px-5 py-4 text-right">Total Amount</th>
                                            <th className="px-5 py-4 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {modalLoading ? (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-24 text-center">
                                                    <div className="flex flex-col items-center justify-center gap-2.5">
                                                        <Loader2 className="w-8 h-8 text-[#3D3F96] animate-spin" />
                                                        <span className="text-xs font-bold text-slate-500">Loading order details...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : modalOrders.length > 0 ? (
                                            modalOrders.map((order) => (
                                                <tr key={order._id} className="hover:bg-slate-50/60 transition-colors">
                                                    {/* Order ID */}
                                                    <td className="px-5 py-4 align-top">
                                                        <span className="font-mono font-black text-sm text-[#3D3F96] block">
                                                            {order.orderId}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                                            <Tag className="w-2.5 h-2.5" /> {order.bookingType || "Direct"}
                                                        </span>
                                                    </td>

                                                    {/* Customer Profile */}
                                                    <td className="px-5 py-4 align-top">
                                                        <div className="flex items-center gap-3">
                                                            {order.customer?.profilePic ? (
                                                                <img
                                                                    src={order.customer.profilePic}
                                                                    alt={order.customer.name}
                                                                    className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                                                                    onError={(e) => {
                                                                        e.target.onerror = null;
                                                                        e.target.src = "https://placehold.co/80x80?text=User";
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                                                                    <User className="w-4 h-4" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div className="font-extrabold text-slate-900 text-xs">
                                                                    {order.customer?.name || "Anonymous User"}
                                                                </div>
                                                                <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                                                                    <Phone className="w-3 h-3 text-slate-400" /> {order.customer?.phone || "N/A"}
                                                                </div>
                                                                {order.customer?.email && (
                                                                    <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.2">
                                                                        <Mail className="w-2.5 h-2.5" /> {order.customer.email}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Order Date */}
                                                    <td className="px-5 py-4 align-top">
                                                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                            {order.orderDate}
                                                        </div>
                                                        {order.createdAt && (
                                                            <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-1">
                                                                <Clock className="w-3 h-3 text-slate-400" />
                                                                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* Food Items Breakdown */}
                                                    <td className="px-5 py-4 align-top">
                                                        <div className="space-y-1.5">
                                                            {order.foodItems && order.foodItems.length > 0 ? (
                                                                order.foodItems.map((item, idx) => (
                                                                    <div key={idx} className="flex items-center justify-between gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
                                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                                            <ShoppingBag className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                                                            <span className="font-bold text-slate-800 truncate text-[11px]">
                                                                                {item.name}
                                                                            </span>
                                                                            <span className="text-[10px] font-black text-[#3D3F96] bg-white px-1.5 py-0.2 rounded border border-slate-200">
                                                                                x{item.quantity}
                                                                            </span>
                                                                        </div>
                                                                        <span className="text-xs font-black text-slate-800 shrink-0">
                                                                            ₹{item.price * item.quantity}
                                                                        </span>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="text-xs font-semibold text-slate-700">
                                                                    {order.mealItemsSummary || "Meal details unavailable"}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Payment Info */}
                                                    <td className="px-5 py-4 align-top">
                                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                                                            <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                                                            {order.payment?.paymentMethod || "Online"}
                                                        </div>
                                                        <div className="mt-1">
                                                            <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                                                order.payment?.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                                                            }`}>
                                                                {order.payment?.paymentStatus || "Paid"}
                                                            </span>
                                                        </div>
                                                        {order.payment?.razorpayPaymentId && (
                                                            <div className="text-[9px] font-mono text-slate-400 mt-1 truncate max-w-[120px]" title={order.payment.razorpayPaymentId}>
                                                                ID: {order.payment.razorpayPaymentId}
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* Amount */}
                                                    <td className="px-5 py-4 align-top text-right">
                                                        <span className="font-black text-slate-900 text-sm block">
                                                            ₹{(order.amount || order.payment?.totalAmount || 0).toLocaleString("en-IN")}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 font-bold">Inclusive taxes</span>
                                                    </td>

                                                    {/* Status Badge */}
                                                    <td className="px-5 py-4 align-top text-center">
                                                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusBadge(order.status)}`}>
                                                            {order.status || "New"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-16 text-center text-slate-400 font-semibold">
                                                    No direct orders found matching the filter criteria.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Modal Footer & Pagination */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/70 shrink-0 flex-wrap gap-3">
                            <div className="flex items-center gap-3">
                                <button
                                    disabled={modalPage <= 1 || modalLoading}
                                    onClick={() => fetchOrderHistory(selectedVendorId, modalPage - 1)}
                                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold disabled:opacity-40 hover:bg-slate-50 transition-all flex items-center gap-1 shadow-2xs"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" /> Previous
                                </button>
                                <span className="text-xs font-extrabold text-slate-600">
                                    Page {modalPage} of {modalTotalPages}
                                </span>
                                <button
                                    disabled={modalPage >= modalTotalPages || modalLoading}
                                    onClick={() => fetchOrderHistory(selectedVendorId, modalPage + 1)}
                                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold disabled:opacity-40 hover:bg-slate-50 transition-all flex items-center gap-1 shadow-2xs"
                                >
                                    Next <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-5 py-2 rounded-xl bg-slate-900 text-white hover:bg-black text-xs font-extrabold uppercase tracking-wider transition-all focus:outline-none shadow-xs"
                            >
                                Close Modal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================
                4. CANCELLED FOOD ORDERS MODAL
            ======================================================== */}
            {showCancelledModal && (
                <CancelledFoodOrdersModal 
                    isOpen={showCancelledModal} 
                    onClose={() => setShowCancelledModal(false)} 
                />
            )}
        </div>
    );
}