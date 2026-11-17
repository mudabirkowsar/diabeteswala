"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  FlaskConical,
  TestTube,
  Building2,
  Eye,
  CheckCircle2,
  Inbox,
  ChevronLeft,
  ChevronRight,
  X,
  Receipt,
  User,
  Users,
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
  Home,
  Check,
  Copy,
  ExternalLink,
  IndianRupee,
  Activity
} from "lucide-react";

// Exact AdminAPI service path
import AdminAPI from "../../../../services/AdminAPI";

// Dedicated Cancelled Lab Orders Modal Component
import CancelledLabOrders from "./CancelledLabOrders";

export default function LabVendorOrders() {
  // ----------------- VENDORS TABLE STATE (Step 1) -----------------
  const [vendors, setVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [profileStatusFilter, setProfileStatusFilter] = useState("");
  const [activeStatusFilter, setActiveStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVendorsCount, setTotalVendorsCount] = useState(0);

  // ----------------- CANCELLED ORDERS MODAL STATE -----------------
  const [showCancelledModal, setShowCancelledModal] = useState(false);

  // ----------------- VENDOR BOOKINGS MODAL STATE (Step 2) -----------------
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [selectedLab, setSelectedLab] = useState(null);
  const [labBookings, setLabBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingSearch, setBookingSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [collectionTypeFilter, setCollectionTypeFilter] = useState("");
  const [modalPage, setModalPage] = useState(1);
  const [modalTotalPages, setModalTotalPages] = useState(1);
  const [totalLabBookings, setTotalLabBookings] = useState(0);

  // ----------------- COMPLETE BOOKING DETAILS MODAL (Step 3) -----------------
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);

  const labModalRef = useRef(null);
  const detailModalRef = useRef(null);

  // ========================================================
  // 1. FETCH LAB VENDORS SORTED BY TOTAL ORDERS (Step 1 API)
  // ========================================================
  const fetchVendors = useCallback(async () => {
    try {
      setLoadingVendors(true);
      const params = {
        page: currentPage,
        limit: 20,
        ...(searchQuery.trim() && { search: searchQuery.trim() }),
        ...(cityFilter.trim() && { city: cityFilter.trim() }),
        ...(profileStatusFilter && { profileStatus: profileStatusFilter }),
        ...(activeStatusFilter !== "" && { isActive: activeStatusFilter === "true" })
      };

      const response = await AdminAPI.adminGetLabVendorsByOrders(params);

      if (response && response.success) {
        let fetchedData = response.data || [];

        // Client-side search & filter fallback if backend pagination is static
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
      console.error("Error fetching lab vendors:", error);
      setVendors([]);
    } finally {
      setLoadingVendors(false);
    }
  }, [currentPage, searchQuery, cityFilter, profileStatusFilter, activeStatusFilter]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchVendors();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchVendors]);

  // ========================================================
  // 2. FETCH SPECIFIC LAB VENDOR BOOKINGS (Step 2 API)
  // ========================================================
  const fetchVendorBookings = useCallback(
    async (labId, page = 1) => {
      if (!labId) return;
      try {
        setLoadingBookings(true);
        const params = {
          labId,
          page,
          limit: 20,
          ...(bookingSearch.trim() && { search: bookingSearch.trim() }),
          ...(statusFilter && { status: statusFilter }),
          ...(collectionTypeFilter && { collectionType: collectionTypeFilter })
        };

        const response = await AdminAPI.adminGetVendorBookings(params);

        if (response && response.success) {
          setLabBookings(response.data || []);
          setModalTotalPages(response.totalPages || 1);
          setModalPage(response.currentPage || 1);
          setTotalLabBookings(response.total || response.count || 0);
        } else {
          setLabBookings([]);
        }
      } catch (error) {
        console.error("Error fetching vendor bookings:", error);
        setLabBookings([]);
      } finally {
        setLoadingBookings(false);
      }
    },
    [bookingSearch, statusFilter, collectionTypeFilter]
  );

  // Open Bookings Modal
  const handleViewLabBookings = (lab) => {
    setSelectedLab(lab);
    setBookingSearch("");
    setStatusFilter("");
    setCollectionTypeFilter("");
    setModalPage(1);
    setShowOrdersModal(true);
    fetchVendorBookings(lab._id, 1);
  };

  // ========================================================
  // 3. FETCH COMPLETE SINGLE BOOKING FULL DETAILS (Step 3 API)
  // ========================================================
  const handleViewBookingDetails = async (bookingId) => {
    if (!bookingId) return;
    try {
      setSelectedBookingId(bookingId);
      setShowDetailModal(true);
      setLoadingDetails(true);

      const response = await AdminAPI.adminGetBookingDetails(bookingId);

      if (response && response.success) {
        setBookingDetails(response.data);
      } else {
        setBookingDetails(null);
      }
    } catch (error) {
      console.error("Error fetching full booking details:", error);
      setBookingDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Close modals on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!showDetailModal && labModalRef.current && !labModalRef.current.contains(e.target)) {
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

  // Copy helper
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  // Badges Styling Helper
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "testing":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "confirmed":
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
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Diagnostic Lab Orders</h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> {totalVendorsCount} Labs Listed
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Ranked by total test orders, real-time revenue, home collections & sample audits
            </p>
          </div>
        </div>

        {/* Right Actions: Cancelled Orders Hub Button + Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowCancelledModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-black text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 rounded-xl transition-all shadow-xs cursor-pointer focus:outline-none"
          >
            <Ban className="w-4 h-4 text-rose-600" />
            <span>Cancelled Bookings</span>
          </button>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search lab, email, phone..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8.5 pr-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#3D3F96] focus:outline-none transition-all w-44 sm:w-52"
            />
          </div>

          {/* City Filter */}
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

          {/* Profile Status Filter */}
          <select
            value={profileStatusFilter}
            onChange={(e) => {
              setProfileStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs font-bold rounded-xl px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none text-slate-700 cursor-pointer"
          >
            <option value="">All Profiles</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* Active Status */}
          <select
            value={activeStatusFilter}
            onChange={(e) => {
              setActiveStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs font-bold rounded-xl px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none text-slate-700 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* 2. DIAGNOSTIC LABS RANKED DATA TABLE (Step 1) */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[1000px] table-auto align-middle">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/70 border-b border-slate-100">
                <th className="text-center px-4 py-4 w-12">#</th>
                <th className="text-left px-5 py-4">Diagnostic Lab</th>
                <th className="text-left px-5 py-4">Contact Details</th>
                <th className="text-left px-5 py-4">City / State</th>
                <th className="text-center px-5 py-4">Order Metrics</th>
                <th className="text-right px-5 py-4">Total Revenue</th>
                <th className="text-center px-5 py-4">Status</th>
                <th className="text-center px-5 py-4 w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loadingVendors ? (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-7 h-7 text-[#3D3F96] animate-spin" />
                      <span className="text-xs font-bold text-slate-500">Loading diagnostic labs...</span>
                    </div>
                  </td>
                </tr>
              ) : vendors.length > 0 ? (
                vendors.map((lab, index) => (
                  <tr key={lab._id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Rank Index */}
                    <td className="px-4 py-4 text-center font-mono font-bold text-slate-400">
                      {(currentPage - 1) * 20 + index + 1}
                    </td>

                    {/* Lab Name & Profile */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3D3F96] to-[#5a5db8] text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                          {lab.name?.charAt(0) || "L"}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-[#3D3F96]" />
                            {lab.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                                lab.profileStatus === "Approved"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {lab.profileStatus || "Approved"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-700 flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-400" /> {lab.email}
                      </div>
                      <div className="text-slate-500 font-semibold flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" /> {lab.phone}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-5 py-4">
                      <span className="font-bold text-slate-800 block">{lab.city || "Mohali"}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{lab.state || "Punjab"}</span>
                    </td>

                    {/* Order Metrics breakdown */}
                    <td className="px-5 py-4 text-center">
                      <div className="inline-flex flex-col items-center gap-1">
                        <span className="text-xs font-black text-slate-900">
                          {lab.totalOrders || 0} Total Orders
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            ✓ {lab.completedOrders || 0} Done
                          </span>
                          <span className="text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            ⏳ {lab.pendingOrders || 0} Active
                          </span>
                          {lab.cancelledOrders > 0 && (
                            <span className="text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                              ✕ {lab.cancelledOrders}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Total Revenue */}
                    <td className="px-5 py-4 text-right">
                      <span className="font-black text-slate-900 text-sm block">
                        ₹{(lab.totalRevenue || 0).toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">Total Realized</span>
                    </td>

                    {/* Operational Status */}
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${
                          lab.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-50 text-slate-600 border-slate-200"
                        }`}
                      >
                        <CircleDot
                          className={`w-2.5 h-2.5 ${lab.isActive ? "text-emerald-500" : "text-slate-400"}`}
                        />
                        {lab.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>

                    {/* Action Button: View Bookings */}
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => handleViewLabBookings(lab)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-extrabold uppercase tracking-wider bg-[#3D3F96]/10 text-[#3D3F96] hover:bg-[#3D3F96] hover:text-white transition-all focus:outline-none shadow-xs cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Bookings
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2.5">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
                        <Inbox className="w-6 h-6" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-700">No Diagnostic Labs Found</h4>
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
                3. STEP 2: VENDOR BOOKINGS MODAL
            ======================================================== */}
      {showOrdersModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-y-auto animate-in fade-in duration-150">
          <div
            ref={labModalRef}
            className="bg-white rounded-3xl w-full max-w-7xl h-[92vh] max-h-[92vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col select-none animate-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0 bg-slate-50/70">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center shrink-0 border border-[#3D3F96]/20 shadow-xs">
                  <Receipt className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Lab Diagnostic Bookings</h3>
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-[#3D3F96]/10 text-[#3D3F96] border border-[#3D3F96]/20">
                      {totalLabBookings} Bookings Found
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500 mt-1">
                    <span>
                      Lab: <strong className="text-slate-800 font-extrabold">{selectedLab?.name}</strong>
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> {selectedLab?.city}
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" /> {selectedLab?.phone}
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
                {/* Search Input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search order ID or patient..."
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    className="pl-8.5 pr-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#3D3F96] focus:outline-none transition-all w-52"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                  }}
                  className="text-xs font-bold rounded-xl px-3.5 py-2 bg-slate-50 border border-slate-200 focus:outline-none text-slate-700 cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Testing">Testing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                {/* Collection Type Filter */}
                <select
                  value={collectionTypeFilter}
                  onChange={(e) => {
                    setCollectionTypeFilter(e.target.value);
                  }}
                  className="text-xs font-bold rounded-xl px-3.5 py-2 bg-slate-50 border border-slate-200 focus:outline-none text-slate-700 cursor-pointer"
                >
                  <option value="">All Collection Types</option>
                  <option value="Home Collection">Home Collection</option>
                  <option value="Visit Lab">Visit Lab</option>
                </select>

                <button
                  onClick={() => fetchVendorBookings(selectedLab?._id, 1)}
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-black rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Apply Filter
                </button>
              </div>
            </div>

            {/* Table of Bookings */}
            <div className="overflow-y-auto flex-1 p-6 space-y-4">
              <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left align-middle">
                  <thead>
                    <tr className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-100">
                      <th className="px-5 py-4">Booking ID & Type</th>
                      <th className="px-5 py-4">Customer & Patients</th>
                      <th className="px-5 py-4">Appointment Schedule</th>
                      <th className="px-5 py-4 w-1/4">Tests / Packages</th>
                      <th className="px-5 py-4">Payment</th>
                      <th className="px-5 py-4 text-right">Amount</th>
                      <th className="px-5 py-4 text-center">Status</th>
                      <th className="px-5 py-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loadingBookings ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-24 text-center">
                          <div className="flex flex-col items-center justify-center gap-2.5">
                            <Loader2 className="w-8 h-8 text-[#3D3F96] animate-spin" />
                            <span className="text-xs font-bold text-slate-500">Loading lab bookings...</span>
                          </div>
                        </td>
                      </tr>
                    ) : labBookings.length > 0 ? (
                      labBookings.map((bk) => (
                        <tr key={bk._id} className="hover:bg-slate-50/60 transition-colors">
                          {/* Booking ID & Badges */}
                          <td className="px-5 py-4 align-top">
                            <span className="font-mono font-black text-sm text-[#3D3F96] block">
                              {bk.bookingId || bk._id}
                            </span>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <span
                                className={`inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                                  bk.collectionType === "Home Collection"
                                    ? "bg-purple-50 text-purple-700 border-purple-200"
                                    : "bg-blue-50 text-blue-700 border-blue-200"
                                }`}
                              >
                                {bk.collectionType === "Home Collection" ? (
                                  <Home className="w-2.5 h-2.5" />
                                ) : (
                                  <Building2 className="w-2.5 h-2.5" />
                                )}
                                {bk.collectionType}
                              </span>

                              {bk.isRapid && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-300">
                                  <Zap className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> Rapid
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Customer & Patient */}
                          <td className="px-5 py-4 align-top">
                            <div className="font-extrabold text-slate-900 text-xs">
                              {bk.customer?.name || "Customer"}
                            </div>
                            <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" /> {bk.customer?.phone || "N/A"}
                            </div>
                            {bk.patientSummary && (
                              <div className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded mt-1 font-bold inline-flex items-center gap-1">
                                <Users className="w-3 h-3 text-slate-400" />
                                <span>
                                  {bk.patientSummary.primaryPatientName}
                                  {bk.patientSummary.totalPatients > 1
                                    ? ` +${bk.patientSummary.totalPatients - 1} more`
                                    : ""}
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Date & Appointment Slot */}
                          <td className="px-5 py-4 align-top">
                            <div className="font-bold text-slate-800 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {bk.appointmentDate
                                ? new Date(bk.appointmentDate).toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric"
                                  })
                                : "N/A"}
                            </div>
                            <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-slate-400" /> {bk.appointmentTime || "Standard Slot"}
                            </div>
                          </td>

                          {/* Items / Tests Summary */}
                          <td className="px-5 py-4 align-top">
                            <div className="space-y-1">
                              {bk.itemsSummary?.displayNames?.length > 0 ? (
                                bk.itemsSummary.displayNames.map((name, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-1.5 text-[11px] bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 font-bold text-slate-800"
                                  >
                                    <TestTube className="w-3 h-3 text-[#3D3F96] shrink-0" />
                                    <span className="truncate">{name}</span>
                                  </div>
                                ))
                              ) : (
                                <span className="text-slate-400 text-xs">
                                  {bk.itemsSummary?.totalItems || 1} Tests Booked
                                </span>
                              )}
                              {bk.itemsSummary?.hasMore && (
                                <span className="text-[10px] text-slate-400 font-bold pl-1">
                                  + more tests
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Payment Info */}
                          <td className="px-5 py-4 align-top">
                            <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                              {bk.paymentMethod || "Online"}
                            </div>
                            <span
                              className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider mt-1 border ${
                                bk.paymentStatus === "Paid"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                            >
                              {bk.paymentStatus || "Pending"}
                            </span>
                          </td>

                          {/* Amount */}
                          <td className="px-5 py-4 align-top text-right">
                            <span className="font-black text-slate-900 text-sm block">
                              ₹{(bk.totalAmount || 0).toLocaleString("en-IN")}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold">Total Bill</span>
                          </td>

                          {/* Status Badge */}
                          <td className="px-5 py-4 align-top text-center">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusBadge(
                                bk.status
                              )}`}
                            >
                              {bk.status || "Confirmed"}
                            </span>
                          </td>

                          {/* Action: Open Step 3 Complete Details */}
                          <td className="px-5 py-4 align-top text-center">
                            <button
                              onClick={() => handleViewBookingDetails(bk.bookingId || bk._id)}
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
                          No bookings found for this lab matching the selected filter criteria.
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
                  disabled={modalPage <= 1 || loadingBookings}
                  onClick={() => fetchVendorBookings(selectedLab?._id, modalPage - 1)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold disabled:opacity-40 hover:bg-slate-50 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </button>
                <span className="text-xs font-extrabold text-slate-600">
                  Page {modalPage} of {modalTotalPages}
                </span>
                <button
                  disabled={modalPage >= modalTotalPages || loadingBookings}
                  onClick={() => fetchVendorBookings(selectedLab?._id, modalPage + 1)}
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
                4. STEP 3: 100% COMPLETE SINGLE BOOKING DETAILS MODAL
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
                      Booking: {bookingDetails?.bookingId || selectedBookingId}
                    </h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusBadge(
                        bookingDetails?.status
                      )}`}
                    >
                      {bookingDetails?.status || "Confirmed"}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-500">
                    Booked on:{" "}
                    {bookingDetails?.createdAt
                      ? new Date(bookingDetails.createdAt).toLocaleString("en-IN")
                      : "N/A"}
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
                  <span className="text-xs font-bold text-slate-500">Fetching diagnostic order audit...</span>
                </div>
              ) : bookingDetails ? (
                <>
                  {/* Top Alert Row: OTP, Collection Mode & Schedule */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {/* Collection OTP Card */}
                    <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 block">
                          Sample Collection OTP
                        </span>
                        <span className="font-mono text-xl font-black text-amber-900 tracking-widest">
                          {bookingDetails.tracking?.otp || "----"}
                        </span>
                      </div>
                      {bookingDetails.tracking?.otp && (
                        <button
                          onClick={() => handleCopy(bookingDetails.tracking.otp)}
                          className="p-2 rounded-xl bg-white border border-amber-200 text-amber-800 hover:bg-amber-100 transition-all cursor-pointer"
                          title="Copy OTP"
                        >
                          {copiedOtp ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      )}
                    </div>

                    {/* Collection Type & Speed */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        Collection Mode
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-black bg-[#3D3F96] text-white shadow-xs">
                          {bookingDetails.collectionType === "Home Collection" ? (
                            <Home className="w-3.5 h-3.5" />
                          ) : (
                            <Building2 className="w-3.5 h-3.5" />
                          )}
                          {bookingDetails.collectionType}
                        </span>
                        {bookingDetails.isRapid && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500 text-white">
                            <Zap className="w-3 h-3 fill-white" /> Rapid
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Appointment Schedule */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        Scheduled Slot
                      </span>
                      <div className="mt-1">
                        <span className="font-extrabold text-xs text-slate-900 block flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {bookingDetails.appointmentDate
                            ? new Date(bookingDetails.appointmentDate).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                              })
                            : "N/A"}
                        </span>
                        <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {bookingDetails.appointmentTime || "Standard Slot"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3-Column Info Cards: Customer, Sample Address, Diagnostic Lab Profile */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* User Profile */}
                    <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider">
                        <User className="w-3.5 h-3.5 text-[#3D3F96]" /> User Profile
                      </div>
                      <div className="text-xs space-y-1">
                        <div className="font-extrabold text-slate-900">
                          {bookingDetails.userId?.name || "Patient Account"}
                        </div>
                        <div className="text-slate-600 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" /> {bookingDetails.userId?.phone || "N/A"}
                        </div>
                        {bookingDetails.userId?.email && (
                          <div className="text-slate-600 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" /> {bookingDetails.userId.email}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sample Collection / Drop-off Address */}
                    <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider">
                        <MapPin className="w-3.5 h-3.5 text-[#3D3F96]" /> Sample Address
                      </div>
                      <div className="text-xs space-y-0.5 text-slate-700">
                        <div className="font-extrabold text-slate-900">
                          {bookingDetails.address?.name || "Patient Contact"}
                        </div>
                        <p className="text-[11px] font-semibold text-slate-800">
                          {bookingDetails.address?.city || ""}, {bookingDetails.address?.state || ""} -{" "}
                          {bookingDetails.address?.pincode || ""}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Contact: {bookingDetails.address?.phone || "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Diagnostic Lab Info */}
                    <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider">
                        <FlaskConical className="w-3.5 h-3.5 text-[#3D3F96]" /> Diagnostic Lab
                      </div>
                      <div className="text-[11px] space-y-1 text-slate-700">
                        <div className="font-extrabold text-slate-900">{bookingDetails.labId?.name}</div>
                        <div className="text-slate-600 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" /> {bookingDetails.labId?.phone}
                        </div>
                        <div className="text-slate-600 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" /> {bookingDetails.labId?.email}
                        </div>
                        <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between text-slate-500 font-bold">
                          <span>Home Collection:</span>
                          <span
                            className={
                              bookingDetails.labId?.isHomeCollectionAvailable
                                ? "text-emerald-700"
                                : "text-slate-400"
                            }
                          >
                            {bookingDetails.labId?.isHomeCollectionAvailable ? "Available" : "No"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Registered Patients List */}
                  <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                    <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#3D3F96]" /> Registered Patient Details (
                        {bookingDetails.patients?.length || 0})
                      </span>
                    </div>
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {bookingDetails.patients?.map((pt, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 text-xs space-y-1"
                        >
                          <div className="font-extrabold text-slate-900 text-sm">{pt.name}</div>
                          <div className="text-slate-600 font-semibold">
                            {pt.gender} &bull; {pt.age} yrs &bull; Relation: {pt.relation || "Self"}
                          </div>
                          {pt.medicalReport && (
                            <a
                              href={pt.medicalReport}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-black text-[#3D3F96] hover:underline pt-1"
                            >
                              <ExternalLink className="w-3 h-3" /> View Medical Report
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Itemized Tests and Packages Table */}
                  <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                    <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                        Booked Diagnostic Tests & Packages
                      </span>
                    </div>
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="text-[10px] font-black uppercase text-slate-400 bg-white border-b border-slate-100">
                          <th className="px-4 py-3">Item Name</th>
                          <th className="px-4 py-3">Sample Specimen Type</th>
                          <th className="px-4 py-3 text-right">Standard MRP</th>
                          <th className="px-4 py-3 text-right">Offered Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {/* Tests */}
                        {bookingDetails.items?.tests?.map((test, idx) => (
                          <tr key={`test-${idx}`} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3">
                              <div className="font-extrabold text-slate-900">{test.name || test.testId?.testName}</div>
                              <span className="text-[9px] font-black uppercase bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded border border-blue-200">
                                Single Test
                              </span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-600">
                              {test.testId?.sampleType || "Blood / Serum"}
                            </td>
                            <td className="px-4 py-3 text-right text-slate-400 line-through">
                              ₹{test.testId?.amount || test.price}
                            </td>
                            <td className="px-4 py-3 text-right font-black text-slate-900">
                              ₹{test.price || test.testId?.discountPrice}
                            </td>
                          </tr>
                        ))}

                        {/* Packages */}
                        {bookingDetails.items?.packages?.map((pkg, idx) => (
                          <tr key={`pkg-${idx}`} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3">
                              <div className="font-extrabold text-slate-900">{pkg.name}</div>
                              <span className="text-[9px] font-black uppercase bg-purple-50 text-purple-700 px-1.5 py-0.2 rounded border border-purple-200">
                                Full Package
                              </span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-600">Multiple Samples</td>
                            <td className="px-4 py-3 text-right text-slate-400 line-through">
                              ₹{pkg.mrp || pkg.price}
                            </td>
                            <td className="px-4 py-3 text-right font-black text-slate-900">
                              ₹{pkg.price}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Financial Bill Summary Breakdown */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="space-y-1 text-xs">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        Payment Status
                      </span>
                      <div className="font-extrabold text-slate-800">
                        Method: {bookingDetails.paymentMethod} &bull; Status:{" "}
                        <span className="text-emerald-700 font-black">{bookingDetails.paymentStatus}</span>
                      </div>
                    </div>

                    <div className="w-full sm:w-72 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-500">
                        <span>Tests / Items Total:</span>
                        <span className="font-bold text-slate-700">
                          ₹{bookingDetails.billSummary?.itemTotal || 0}
                        </span>
                      </div>
                      {bookingDetails.billSummary?.couponDiscount > 0 && (
                        <div className="flex justify-between text-emerald-600 font-bold">
                          <span>Coupon Discount:</span>
                          <span>- ₹{bookingDetails.billSummary.couponDiscount}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-500">
                        <span>Home Collection Charge:</span>
                        <span>₹{bookingDetails.billSummary?.homeVisitCharge || 0}</span>
                      </div>
                      {bookingDetails.billSummary?.rapidDeliveryCharge > 0 && (
                        <div className="flex justify-between text-slate-500">
                          <span>Express Surcharge:</span>
                          <span>₹{bookingDetails.billSummary.rapidDeliveryCharge}</span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                        <span>Final Bill Amount:</span>
                        <span className="text-[#3D3F96]">
                          ₹{(bookingDetails.billSummary?.totalAmount || 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-16 text-slate-400 font-bold text-xs">
                  Unable to load complete details for this booking.
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
                5. CANCELLED LAB ORDERS HUB MODAL
            ======================================================== */}
      {showCancelledModal && (
        <CancelledLabOrders
          isOpen={showCancelledModal}
          onClose={() => setShowCancelledModal(false)}
        />
      )}
    </div>
  );
}