"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Pill,
  Store,
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
  CircleDot,
  CreditCard,
  Ban,
  Clock,
  Zap,
  FileText,
  Truck,
  ShieldCheck,
  AlertCircle,
  Check,
  Copy,
  ExternalLink
} from "lucide-react";

// Exact AdminAPI service path
import AdminAPI from "../../../../services/AdminAPI";

// Dedicated Cancelled Pharmacy Orders Modal Component
import CancelledPharmacyOrders from "./CancelledPharmacyOrders";

export default function PharmacyVendorOrders() {
  // ----------------- VENDORS TABLE STATE (Step 1) -----------------
  const [vendors, setVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVendorsCount, setTotalVendorsCount] = useState(0);

  // ----------------- CANCELLED ORDERS MODAL STATE -----------------
  const [showCancelledModal, setShowCancelledModal] = useState(false);

  // ----------------- STORE ORDERS MODAL STATE (Step 2) -----------------
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [storeOrders, setStoreOrders] = useState([]);
  const [loadingStoreOrders, setLoadingStoreOrders] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [orderTypeFilter, setOrderTypeFilter] = useState("");
  const [rapidFilter, setRapidFilter] = useState("");
  const [modalPage, setModalPage] = useState(1);
  const [modalTotalPages, setModalTotalPages] = useState(1);
  const [totalStoreOrders, setTotalStoreOrders] = useState(0);

  // ----------------- COMPLETE ORDER DETAILS MODAL (Step 3) -----------------
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);

  const storeModalRef = useRef(null);
  const detailModalRef = useRef(null);

  // ========================================================
  // 1. FETCH PHARMACY VENDORS LIST (Step 1 API)
  // ========================================================
  const fetchVendors = useCallback(async () => {
    try {
      setLoadingVendors(true);
      const params = {
        page: currentPage,
        limit: 10
      };

      const response = await AdminAPI.adminGetPharmacyVendorsForOrders(params);

      if (response && response.success) {
        let fetchedData = response.data || [];

        // Client-side search & city filter fallback
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          fetchedData = fetchedData.filter(
            (v) =>
              v.name?.toLowerCase().includes(q) ||
              v.email?.toLowerCase().includes(q) ||
              v.phone?.includes(q)
          );
        }
        if (cityFilter.trim()) {
          const c = cityFilter.toLowerCase().trim();
          fetchedData = fetchedData.filter((v) => v.city?.toLowerCase().includes(c));
        }

        setVendors(fetchedData);
        setTotalPages(response.totalPages || 1);
        setTotalVendorsCount(response.total || response.count || fetchedData.length);
      } else {
        setVendors([]);
      }
    } catch (error) {
      console.error("Error fetching pharmacy vendors:", error);
      setVendors([]);
    } finally {
      setLoadingVendors(false);
    }
  }, [currentPage, searchQuery, cityFilter]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchVendors();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchVendors]);

  // ========================================================
  // 2. FETCH SPECIFIC PHARMACY ORDERS (Step 2 API)
  // ========================================================
  const fetchPharmacyOrders = useCallback(
    async (pharmacyId, page = 1) => {
      if (!pharmacyId) return;
      try {
        setLoadingStoreOrders(true);
        const params = {
          page,
          limit: 20,
          ...(statusFilter && { status: statusFilter }),
          ...(orderTypeFilter && { orderType: orderTypeFilter }),
          ...(rapidFilter !== "" && { isRapid: rapidFilter === "true" })
        };

        const response = await AdminAPI.adminGetOrdersByPharmacyId(pharmacyId, params);

        if (response && response.success) {
          setStoreOrders(response.data || []);
          setModalTotalPages(response.totalPages || 1);
          setModalPage(response.currentPage || 1);
          setTotalStoreOrders(response.total || response.count || 0);
        } else {
          setStoreOrders([]);
        }
      } catch (error) {
        console.error("Error fetching pharmacy store orders:", error);
        setStoreOrders([]);
      } finally {
        setLoadingStoreOrders(false);
      }
    },
    [statusFilter, orderTypeFilter, rapidFilter]
  );

  // Open Orders History Modal
  const handleViewStoreOrders = (pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setStatusFilter("");
    setOrderTypeFilter("");
    setRapidFilter("");
    setModalPage(1);
    setShowOrdersModal(true);
    fetchPharmacyOrders(pharmacy._id, 1);
  };

  // ========================================================
  // 3. FETCH COMPLETE SINGLE ORDER DETAILS (Step 3 API)
  // ========================================================
  const handleViewOrderFullDetails = async (orderId) => {
    if (!orderId) return;
    try {
      setSelectedOrderId(orderId);
      setShowDetailModal(true);
      setLoadingDetails(true);

      const response = await AdminAPI.adminGetPharmacyBookingDetails(orderId);

      if (response && response.success) {
        setOrderDetails(response.data);
      } else {
        setOrderDetails(null);
      }
    } catch (error) {
      console.error("Error fetching full order details:", error);
      setOrderDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Close on outside click for modals
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!showDetailModal && storeModalRef.current && !storeModalRef.current.contains(e.target)) {
        setShowOrdersModal(false);
      }
      if (detailModalRef.current && !detailModalRef.current.contains(e.target)) {
        setShowDetailModal(false);
      }
    };
    if (showOrdersModal || showDetailModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showOrdersModal, showDetailModal]);

  // Copy Helper
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  // Badges Styling Helper
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "shipped":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "packed":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "placed":
        return "bg-blue-50 text-blue-700 border-blue-200";
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
          <div className="w-12 h-12 rounded-2xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center shrink-0 border border-[#3D3F96]/20 shadow-xs">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Pharmacy Store Orders</h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> {totalVendorsCount} Stores Listed
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Audit licensed pharmacy stores, pending medicine dispatches & orders
            </p>
          </div>
        </div>

        {/* Right Actions: Cancelled Orders Button + Search Inputs */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowCancelledModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-black text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 rounded-xl transition-all shadow-xs cursor-pointer focus:outline-none"
          >
            <Ban className="w-4 h-4 text-rose-600" />
            <span>Cancelled Orders</span>
          </button>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search store, email, phone..."
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

      {/* 2. PHARMACY STORES DATA TABLE (Step 1) */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[950px] table-auto align-middle">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/70 border-b border-slate-100">
                <th className="text-center px-5 py-4 w-14">Store</th>
                <th className="text-left px-5 py-4">Store Profile</th>
                <th className="text-left px-5 py-4">Contact Details</th>
                <th className="text-left px-5 py-4">Location</th>
                <th className="text-center px-5 py-4">Order Metrics</th>
                <th className="text-center px-5 py-4">Operational Status</th>
                <th className="text-center px-5 py-4 w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loadingVendors ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-7 h-7 text-[#3D3F96] animate-spin" />
                      <span className="text-xs font-bold text-slate-500">Loading pharmacy stores...</span>
                    </div>
                  </td>
                </tr>
              ) : vendors.length > 0 ? (
                vendors.map((vendor) => (
                  <tr key={vendor._id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Profile / Store Icon */}
                    <td className="px-5 py-4 text-center">
                      {vendor.profileImage ? (
                        <img
                          src={vendor.profileImage}
                          alt={vendor.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-100 mx-auto shadow-xs"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://placehold.co/100x100?text=Pharmacy";
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3D3F96] to-[#5153a7] text-white font-black text-sm flex items-center justify-center mx-auto shadow-xs">
                          {vendor.name?.charAt(0) || "P"}
                        </div>
                      )}
                    </td>

                    {/* Store Name & Address */}
                    <td className="px-5 py-4">
                      <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-[#3D3F96]" />
                        {vendor.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium truncate max-w-[200px] mt-0.5">
                        {vendor.address || "Main Branch"}
                      </div>
                    </td>

                    {/* Contact Info */}
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
                      <span className="font-bold text-slate-800 block">{vendor.city}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{vendor.state || "State"}</span>
                    </td>

                    {/* Metrics: Total & Pending Orders */}
                    <td className="px-5 py-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <span className="text-[11px] font-extrabold text-slate-800" title="Total Orders">
                          {vendor.totalOrders || 0} Total
                        </span>
                        <span className="text-slate-300">&bull;</span>
                        <span
                          className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${vendor.pendingOrders > 0
                            ? "text-amber-700 bg-amber-50 border border-amber-200"
                            : "text-slate-600 bg-slate-50"
                            }`}
                          title="Pending Active Orders"
                        >
                          {vendor.pendingOrders || 0} Pending
                        </span>
                      </div>
                    </td>

                    {/* Operational Status */}
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${vendor.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                          }`}
                      >
                        <CircleDot
                          className={`w-2.5 h-2.5 ${vendor.isActive ? "text-emerald-500" : "text-slate-400"}`}
                        />
                        {vendor.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>

                    {/* Action Button: View Orders */}
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => handleViewStoreOrders(vendor)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-extrabold uppercase tracking-wider bg-[#3D3F96]/10 text-[#3D3F96] hover:bg-[#3D3F96] hover:text-white transition-all focus:outline-none shadow-xs cursor-pointer"
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
                      <h4 className="text-xs font-bold text-slate-700">No Pharmacy Stores Found</h4>
                      <p className="text-[11px] text-slate-400">Try adjusting your search criteria or city filter.</p>
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
            disabled={currentPage <= 1 || loadingVendors}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Previous
          </button>

          <span className="text-xs font-extrabold text-slate-500">
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage >= totalPages || loadingVendors}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all cursor-pointer"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================
                3. STEP 2: PHARMACY STORE ORDERS HISTORY MODAL
            ======================================================== */}
      {showOrdersModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-y-auto animate-in fade-in duration-150">
          <div
            ref={storeModalRef}
            className="bg-white rounded-3xl w-full max-w-7xl h-[92vh] max-h-[92vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col select-none animate-in zoom-in-95 duration-150"
          >
            {/* Store Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0 bg-slate-50/70">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center shrink-0 border border-[#3D3F96]/20 shadow-xs">
                  <Receipt className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Store Pharmacy Bookings</h3>
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-[#3D3F96]/10 text-[#3D3F96] border border-[#3D3F96]/20">
                      {totalStoreOrders} Orders Found
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500 mt-1">
                    <span>
                      Store: <strong className="text-slate-800 font-extrabold">{selectedPharmacy?.name}</strong>
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> {selectedPharmacy?.city}
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" /> {selectedPharmacy?.phone}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowOrdersModal(false)}
                className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer shadow-xs focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Bar */}
            <div className="px-6 py-3.5 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    fetchPharmacyOrders(selectedPharmacy?._id, 1);
                  }}
                  className="text-xs font-bold rounded-xl px-3.5 py-2 bg-slate-50 border border-slate-200 focus:outline-none text-slate-700 cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  <option value="Placed">Placed</option>
                  <option value="Packed">Packed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                {/* Order Type Filter */}
                <select
                  value={orderTypeFilter}
                  onChange={(e) => {
                    setOrderTypeFilter(e.target.value);
                    fetchPharmacyOrders(selectedPharmacy?._id, 1);
                  }}
                  className="text-xs font-bold rounded-xl px-3.5 py-2 bg-slate-50 border border-slate-200 focus:outline-none text-slate-700 cursor-pointer"
                >
                  <option value="">All Order Types</option>
                  <option value="General">General OTC</option>
                  <option value="Prescription">Prescription Required</option>
                </select>

                {/* Rapid / Regular Filter */}
                <select
                  value={rapidFilter}
                  onChange={(e) => {
                    setRapidFilter(e.target.value);
                    fetchPharmacyOrders(selectedPharmacy?._id, 1);
                  }}
                  className="text-xs font-bold rounded-xl px-3.5 py-2 bg-slate-50 border border-slate-200 focus:outline-none text-slate-700 cursor-pointer"
                >
                  <option value="">All Speeds</option>
                  <option value="true">⚡ Express 1-Hr Rapid</option>
                  <option value="false">Regular Delivery</option>
                </select>

                <button
                  onClick={() => fetchPharmacyOrders(selectedPharmacy?._id, 1)}
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-black rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Apply Filter
                </button>
              </div>
            </div>

            {/* Table of Orders */}
            <div className="overflow-y-auto flex-1 p-6 space-y-4">
              <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left align-middle">
                  <thead>
                    <tr className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-100">
                      <th className="px-5 py-4">Order ID & Type</th>
                      <th className="px-5 py-4">Customer</th>
                      <th className="px-5 py-4">Order Placed</th>
                      <th className="px-5 py-4 w-1/3">Medicines Summary</th>
                      <th className="px-5 py-4">Payment</th>
                      <th className="px-5 py-4 text-right">Amount</th>
                      <th className="px-5 py-4 text-center">Status</th>
                      <th className="px-5 py-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loadingStoreOrders ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-24 text-center">
                          <div className="flex flex-col items-center justify-center gap-2.5">
                            <Loader2 className="w-8 h-8 text-[#3D3F96] animate-spin" />
                            <span className="text-xs font-bold text-slate-500">Loading store bookings...</span>
                          </div>
                        </td>
                      </tr>
                    ) : storeOrders.length > 0 ? (
                      storeOrders.map((ord) => (
                        <tr key={ord._id} className="hover:bg-slate-50/60 transition-colors">
                          {/* Order ID & Badges */}
                          <td className="px-5 py-4 align-top">
                            <span className="font-mono font-black text-sm text-[#3D3F96] block">
                              {ord.orderId}
                            </span>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <span
                                className={`inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${ord.orderType === "Prescription"
                                  ? "bg-purple-50 text-purple-700 border-purple-200"
                                  : "bg-slate-100 text-slate-600 border-slate-200"
                                  }`}
                              >
                                <FileText className="w-2.5 h-2.5" />
                                {ord.orderType}
                              </span>

                              {ord.isRapid && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-300">
                                  <Zap className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> Rapid 1-Hr
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Customer Profile */}
                          <td className="px-5 py-4 align-top">
                            <div className="font-extrabold text-slate-900 text-xs">
                              {ord.customer?.name || "Patient"}
                            </div>
                            <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" /> {ord.customer?.phone || "N/A"}
                            </div>
                          </td>

                          {/* Date & Time */}
                          <td className="px-5 py-4 align-top">
                            <div className="font-bold text-slate-800 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {ord.formattedDate || new Date(ord.createdAt).toLocaleDateString("en-IN")}
                            </div>
                          </td>

                          {/* Items Summary */}
                          <td className="px-5 py-4 align-top">
                            <div className="space-y-1">
                              {ord.itemsSummary && ord.itemsSummary.length > 0 ? (
                                ord.itemsSummary.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between text-[11px] bg-slate-50 p-1.5 rounded-lg border border-slate-100"
                                  >
                                    <span className="font-bold text-slate-800 truncate">
                                      {item.name}
                                    </span>
                                    <span className="font-black text-[#3D3F96] bg-white px-1.5 py-0.2 rounded border border-slate-200 shrink-0">
                                      x{item.quantity}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <span className="text-slate-400 text-xs">
                                  {ord.itemsCount || 1} Medicine Items
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Payment Info */}
                          <td className="px-5 py-4 align-top">
                            <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                              {ord.paymentMethod || "Online"}
                            </div>
                            <span
                              className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider mt-1 border ${ord.paymentStatus === "Paid"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                                }`}
                            >
                              {ord.paymentStatus || "Pending"}
                            </span>
                          </td>

                          {/* Amount */}
                          <td className="px-5 py-4 align-top text-right">
                            <span className="font-black text-slate-900 text-sm block">
                              ₹{(ord.totalAmount || 0).toLocaleString("en-IN")}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold">Inclusive GST</span>
                          </td>

                          {/* Status Badge */}
                          <td className="px-5 py-4 align-top text-center">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusBadge(
                                ord.status
                              )}`}
                            >
                              {ord.status || "Placed"}
                            </span>
                          </td>

                          {/* Action: Open Step 3 Complete Details */}
                          <td className="px-5 py-4 align-top text-center">
                            <button
                              onClick={() => handleViewOrderFullDetails(ord.orderId || ord._id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                            >
                              <FileText className="w-3 h-3" /> Details
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-6 py-16 text-center text-slate-400 font-semibold">
                          No orders found for this pharmacy matching the selected filter criteria.
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
                  disabled={modalPage <= 1 || loadingStoreOrders}
                  onClick={() => fetchPharmacyOrders(selectedPharmacy?._id, modalPage - 1)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold disabled:opacity-40 hover:bg-slate-50 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </button>
                <span className="text-xs font-extrabold text-slate-600">
                  Page {modalPage} of {modalTotalPages}
                </span>
                <button
                  disabled={modalPage >= modalTotalPages || loadingStoreOrders}
                  onClick={() => fetchPharmacyOrders(selectedPharmacy?._id, modalPage + 1)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold disabled:opacity-40 hover:bg-slate-50 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowOrdersModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white hover:bg-black text-xs font-extrabold uppercase tracking-wider transition-all focus:outline-none shadow-xs cursor-pointer"
              >
                Close Modal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
                4. STEP 3: 100% COMPLETE SINGLE ORDER DETAILS MODAL
            ======================================================== */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-60 flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-y-auto animate-in fade-in duration-150">
          <div
            ref={detailModalRef}
            className="bg-white rounded-3xl w-full max-w-5xl max-h-[94vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col select-none animate-in zoom-in-95 duration-150 relative"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-[#3D3F96]/5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#3D3F96] text-white flex items-center justify-center font-bold shadow-xs">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-black text-slate-900">
                      Booking: {orderDetails?.orderId || selectedOrderId}
                    </h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusBadge(
                        orderDetails?.status
                      )}`}
                    >
                      {orderDetails?.status || "Placed"}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-500">
                    Placed on: {orderDetails?.formattedDate || orderDetails?.createdAt}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowDetailModal(false)}
                className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body Details */}
            <div className="overflow-y-auto flex-1 p-6 space-y-5">
              {loadingDetails ? (
                <div className="py-24 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-8 h-8 text-[#3D3F96] animate-spin" />
                  <span className="text-xs font-bold text-slate-500">Fetching order audit details...</span>
                </div>
              ) : orderDetails ? (
                <>
                  {/* Top Alert: OTP, Express Delivery, Special Instructions */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {/* Delivery OTP Card */}
                    <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 block">
                          Secure Delivery OTP
                        </span>
                        <span className="font-mono text-xl font-black text-amber-900 tracking-widest">
                          {orderDetails.deliveryOTP || "----"}
                        </span>
                      </div>
                      {orderDetails.deliveryOTP && (
                        <button
                          onClick={() => handleCopy(orderDetails.deliveryOTP)}
                          className="p-2 rounded-xl bg-white border border-amber-200 text-amber-800 hover:bg-amber-100 transition-all cursor-pointer"
                          title="Copy OTP"
                        >
                          {copiedOtp ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      )}
                    </div>

                    {/* Order Type & Speed */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        Delivery Speed & Mode
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        {orderDetails.isRapid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-black bg-amber-500 text-white shadow-xs">
                            <Zap className="w-3.5 h-3.5 fill-white" /> Express 1-Hr
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-200 text-slate-800">
                            Standard Delivery
                          </span>
                        )}
                        <span className="text-xs font-bold text-slate-600">
                          ({orderDetails.orderType || "General"})
                        </span>
                      </div>
                    </div>

                    {/* Assigned Driver */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        Assigned Courier Driver
                      </span>
                      {orderDetails.assignedDriver ? (
                        <div className="mt-1">
                          <span className="font-extrabold text-xs text-slate-900 block">
                            {orderDetails.assignedDriver.name}
                          </span>
                          <span className="text-[11px] text-slate-500 font-semibold">
                            {orderDetails.assignedDriver.phone} &bull; {orderDetails.assignedDriver.vehicleNumber || "Bike"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400 mt-1 inline-block">
                          Driver Not Yet Assigned
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Customer Note if present */}
                  {orderDetails.anyIntruction && (
                    <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>
                        <strong>Customer Note:</strong> {orderDetails.anyIntruction}
                      </span>
                    </div>
                  )}

                  {/* 3-Column Info Cards: Customer, Delivery Address, Vendor Licences */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Customer Profile */}
                    <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider">
                        <User className="w-3.5 h-3.5 text-[#3D3F96]" /> Customer Profile
                      </div>
                      <div className="text-xs space-y-1">
                        <div className="font-extrabold text-slate-900">{orderDetails.customer?.name}</div>
                        <div className="text-slate-600 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" /> {orderDetails.customer?.phone}
                        </div>
                        {orderDetails.customer?.email && (
                          <div className="text-slate-600 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" /> {orderDetails.customer.email}
                          </div>
                        )}
                        <div className="text-[11px] text-slate-400 font-medium pt-1 border-t border-slate-200/60">
                          Gender: {orderDetails.customer?.gender || "N/A"} &bull; Age:{" "}
                          {orderDetails.customer?.age || "N/A"}
                        </div>
                      </div>
                    </div>

                    {/* Drop-Off Address */}
                    <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider">
                        <MapPin className="w-3.5 h-3.5 text-[#3D3F96]" /> Delivery Address
                      </div>
                      <div className="text-xs space-y-0.5 text-slate-700">
                        <div className="font-extrabold text-slate-900">
                          {orderDetails.deliveryAddress?.name} ({orderDetails.deliveryAddress?.addressType || "Home"})
                        </div>
                        <p className="text-[11px]">
                          {orderDetails.deliveryAddress?.houseNo}, {orderDetails.deliveryAddress?.sector}
                        </p>
                        {orderDetails.deliveryAddress?.landmark && (
                          <p className="text-[11px] text-slate-400">
                            Landmark: {orderDetails.deliveryAddress.landmark}
                          </p>
                        )}
                        <p className="text-[11px] font-semibold text-slate-800">
                          {orderDetails.deliveryAddress?.city}, {orderDetails.deliveryAddress?.state} -{" "}
                          {orderDetails.deliveryAddress?.pincode}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Contact: {orderDetails.deliveryAddress?.phone}
                        </p>
                      </div>
                    </div>

                    {/* Vendor Legal & Tax Credentials */}
                    <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#3D3F96]" /> Store Audit & Tax Info
                      </div>
                      <div className="text-[11px] space-y-1 text-slate-700">
                        <div className="font-extrabold text-slate-900">{orderDetails.vendor?.name}</div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-semibold">GSTIN:</span>
                          <span className="font-mono font-bold text-slate-800">
                            {orderDetails.vendor?.gstNumber || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-semibold">Drug Lic:</span>
                          <span className="font-mono font-bold text-slate-800">
                            {orderDetails.vendor?.drugLicenseNumber || "N/A"}
                          </span>
                        </div>
                        {orderDetails.vendor?.cinNumber && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 font-semibold">CIN:</span>
                            <span className="font-mono font-bold text-slate-800">
                              {orderDetails.vendor.cinNumber}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Prescription Photos Preview */}
                  {orderDetails.prescriptionImages && orderDetails.prescriptionImages.length > 0 && (
                    <div className="p-4 rounded-2xl border border-purple-200/80 bg-purple-50/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-black text-purple-900 uppercase tracking-wider">
                          <FileText className="w-4 h-4 text-purple-600" /> Uploaded Rx Prescriptions (
                          {orderDetails.prescriptionImages.length})
                        </div>
                      </div>
                      <div className="flex items-center gap-3 overflow-x-auto py-2">
                        {orderDetails.prescriptionImages.map((imgUrl, idx) => (
                          <a
                            key={idx}
                            href={imgUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="group relative block w-24 h-24 rounded-xl overflow-hidden border border-purple-200 shadow-xs shrink-0"
                          >
                            <img
                              src={imgUrl}
                              alt={`Rx-${idx}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-all"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all text-white">
                              <ExternalLink className="w-4 h-4" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Itemized Medicines List Table */}
                  <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                    <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                        Prescribed Medicines ({orderDetails.itemsCount || orderDetails.items?.length || 0})
                      </span>
                    </div>
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="text-[10px] font-black uppercase text-slate-400 bg-white border-b border-slate-100">
                          <th className="px-4 py-3">Medicine Name & Packaging</th>
                          <th className="px-4 py-3">HSN Code</th>
                          <th className="px-4 py-3 text-center">Qty</th>
                          <th className="px-4 py-3 text-right">MRP</th>
                          <th className="px-4 py-3 text-right">Taxable</th>
                          <th className="px-4 py-3 text-right">GST (CGST+SGST)</th>
                          <th className="px-4 py-3 text-right">Net Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {orderDetails.items?.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3">
                              <div className="font-extrabold text-slate-900">{item.name}</div>
                              <div className="text-[10px] text-slate-400">
                                {item.packaging || "Strip"} &bull; {item.duration || "Course"}
                              </div>
                            </td>
                            <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                              {item.hsn_number || "30049099"}
                            </td>
                            <td className="px-4 py-3 text-center font-black text-slate-800">
                              x{item.quantity}
                            </td>
                            <td className="px-4 py-3 text-right text-slate-400 line-through">
                              ₹{item.mrp}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-slate-700">
                              ₹{item.taxableAmount || (item.price * item.quantity).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-right text-slate-500 font-mono text-[11px]">
                              ₹{((item.cgstAmount || 0) + (item.sgstAmount || 0)).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-right font-black text-slate-900">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Full Financial Bill Summary Breakdown */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="space-y-1 text-xs">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        Payment Breakdown
                      </span>
                      <div className="font-extrabold text-slate-800">
                        Method: {orderDetails.paymentMethod} &bull; Status:{" "}
                        <span className="text-emerald-700 font-black">{orderDetails.paymentStatus}</span>
                      </div>
                      {orderDetails.paymentDetails?.razorpayPaymentId && (
                        <div className="text-[10px] font-mono text-slate-400">
                          Txn: {orderDetails.paymentDetails.razorpayPaymentId}
                        </div>
                      )}
                    </div>

                    <div className="w-full sm:w-72 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-500">
                        <span>Items Total:</span>
                        <span className="font-bold text-slate-700">
                          ₹{orderDetails.billSummary?.itemTotal || 0}
                        </span>
                      </div>
                      {orderDetails.billSummary?.couponDiscount > 0 && (
                        <div className="flex justify-between text-emerald-600 font-bold">
                          <span>Coupon Discount:</span>
                          <span>- ₹{orderDetails.billSummary.couponDiscount}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-500">
                        <span>CGST + SGST Total:</span>
                        <span>
                          ₹
                          {(
                            (orderDetails.billSummary?.cgstTotal || 0) +
                            (orderDetails.billSummary?.sgstTotal || 0)
                          ).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Delivery & Slot Charge:</span>
                        <span>
                          ₹
                          {(orderDetails.billSummary?.deliveryCharge || 0) +
                            (orderDetails.billSummary?.slotCharge || 0) +
                            (orderDetails.billSummary?.rapidDeliveryCharge || 0)}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                        <span>Final Total Amount:</span>
                        <span className="text-[#3D3F96]">
                          ₹{(orderDetails.billSummary?.totalAmount || 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-16 text-slate-400 font-bold text-xs">
                  Unable to load complete details for this order.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end shrink-0">
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white hover:bg-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ========================================================
                5. CANCELLED PHARMACY ORDERS HUB MODAL
            ======================================================== */}
      {showCancelledModal && (
        <CancelledPharmacyOrders
          isOpen={showCancelledModal}
          onClose={() => setShowCancelledModal(false)}
        />
      )}
    </div>
  );
}