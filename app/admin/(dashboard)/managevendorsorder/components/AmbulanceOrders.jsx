"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    Ambulance,
    Eye,
    CheckCircle2,
    Inbox,
    ChevronLeft,
    ChevronRight,
    X,
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
    ShieldAlert,
    Navigation,
    Activity,
    FileText,
    Car,
    AlertCircle,
    Check
} from "lucide-react";

// Exact AdminAPI path
import AdminAPI from "../../../../services/AdminAPI";

// Cancelled Ambulance Bookings Modal
import CancelledAmbulanceOrders from "./CancelledAmbulanceOrders";

export default function AmbulanceOrders() {
    // ----------------- AMBULANCE FLEET TABLE STATE -----------------
    const [ambulances, setAmbulances] = useState([]);
    const [loadingAmbulances, setLoadingAmbulances] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [cityFilter, setCityFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalAmbulances, setTotalAmbulances] = useState(0);

    // ----------------- CANCELLED ORDERS MODAL STATE -----------------
    const [showCancelledModal, setShowCancelledModal] = useState(false);

    // ----------------- AMBULANCE BOOKINGS MODAL STATE -----------------
    const [showModal, setShowModal] = useState(false);
    const [selectedAmbulanceId, setSelectedAmbulanceId] = useState(null);
    const [modalAmbulance, setModalAmbulance] = useState(null);
    const [modalBookings, setModalBookings] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalSearch, setModalSearch] = useState("");
    const [modalStatus, setModalStatus] = useState("");
    const [modalPage, setModalPage] = useState(1);
    const [modalTotalPages, setModalTotalPages] = useState(1);
    const [totalAssociatedBookings, setTotalAssociatedBookings] = useState(0);

    const modalRef = useRef(null);

    // ========================================================
    // 1. FETCH AMBULANCES FLEET LIST
    // ========================================================
    const fetchAmbulances = useCallback(async () => {
        try {
            setLoadingAmbulances(true);
            const params = {
                page: currentPage,
                limit: 10,
                ...(searchQuery.trim() && { search: searchQuery.trim() }),
                ...(cityFilter.trim() && { city: cityFilter.trim() })
            };

            const response = await AdminAPI.getAdminAmbulancesList(params);

            if (response && response.success) {
                setAmbulances(response.data || []);
                setTotalPages(response.totalPages || 1);
                setTotalAmbulances(response.totalDocs || response.count || 0);
            } else {
                setAmbulances([]);
            }
        } catch (error) {
            console.error("Error fetching ambulance fleet:", error);
            setAmbulances([]);
        } finally {
            setLoadingAmbulances(false);
        }
    }, [currentPage, searchQuery, cityFilter]);

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchAmbulances();
        }, 300);
        return () => clearTimeout(debounce);
    }, [fetchAmbulances]);

    // ========================================================
    // 2. FETCH SPECIFIC AMBULANCE BOOKINGS (MODAL)
    // ========================================================
    const fetchAmbulanceBookings = useCallback(async (ambulanceId, page = 1) => {
        if (!ambulanceId) return;
        try {
            setModalLoading(true);
            const params = {
                page: page,
                limit: 10,
                ...(modalStatus && { status: modalStatus })
            };

            const response = await AdminAPI.getAdminAmbulanceBookings(ambulanceId, params);

            if (response && response.success) {
                setModalBookings(response.data || []);
                setModalTotalPages(response.totalPages || 1);
                setModalPage(response.currentPage || 1);
                setTotalAssociatedBookings(response.totalDocs || response.count || 0);
            } else {
                setModalBookings([]);
            }
        } catch (error) {
            console.error("Error fetching ambulance bookings:", error);
            setModalBookings([]);
        } finally {
            setModalLoading(false);
        }
    }, [modalStatus]);

    // Open Bookings Modal
    const handleViewBookings = (ambulance) => {
        setSelectedAmbulanceId(ambulance._id);
        setModalAmbulance(ambulance);
        setModalSearch("");
        setModalStatus("");
        setModalPage(1);
        setShowModal(true);
        fetchAmbulanceBookings(ambulance._id, 1);
    };

    // Close on outside click
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

    // Status Badges Styling
    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case "completed":
                return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case "confirmed":
                return "bg-blue-50 text-blue-700 border-blue-200";
            case "in progress":
            case "on trip":
            case "searching":
                return "bg-amber-50 text-amber-700 border-amber-200";
            case "cancelled":
                return "bg-rose-50 text-rose-700 border-rose-200";
            default:
                return "bg-slate-50 text-slate-700 border-slate-200";
        }
    };

    // Booking Category Badge
    const getCategoryBadge = (category) => {
        if (category?.toLowerCase() === "emergency") {
            return "bg-rose-50 text-rose-700 border-rose-200";
        }
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
    };

    return (
        <div className="space-y-5">
            {/* 1. TOP HEADER WITH CANCELLED ORDERS BUTTON & FILTERS */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center shrink-0 border border-[#3D3F96]/20 shadow-xs">
                        <Ambulance className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-black text-slate-900 tracking-tight">Ambulance Fleet & Bookings</h2>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" /> {totalAmbulances} Registered
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium">Manage ambulance vehicles, drivers, and dispatch booking operations</p>
                    </div>
                </div>

                {/* Right Actions: Cancelled Orders Button + Search & Filters */}
                <div className="flex flex-wrap items-center gap-2.5">
                    {/* CANCELLED AMBULANCE BOOKINGS BUTTON */}
                    <button
                        onClick={() => setShowCancelledModal(true)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-black text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 rounded-xl transition-all shadow-xs focus:outline-none cursor-pointer"
                    >
                        <Ban className="w-4 h-4 text-rose-600" />
                        <span>Cancelled Bookings</span>
                    </button>

                    {/* Search Input */}
                    <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search driver, vehicle, phone..."
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
                            className="pl-8.5 pr-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#3D3F96] focus:outline-none transition-all w-32 sm:w-36"
                        />
                    </div>
                </div>
            </div>

            {/* 2. AMBULANCES DATA TABLE */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs min-w-[1000px] table-auto align-middle">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/70 border-b border-slate-100">
                                <th className="text-left px-5 py-4">Driver & Vehicle</th>
                                <th className="text-left px-5 py-4">Vehicle Details</th>
                                <th className="text-left px-5 py-4">Contact Info</th>
                                <th className="text-left px-5 py-4">Location & Radius</th>
                                <th className="text-center px-5 py-4">Ride Metrics</th>
                                <th className="text-center px-5 py-4">Profile Status</th>
                                <th className="text-center px-5 py-4 w-36">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loadingAmbulances ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Loader2 className="w-7 h-7 text-[#3D3F96] animate-spin" />
                                            <span className="text-xs font-bold text-slate-500">Loading ambulance fleet...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : ambulances.length > 0 ? (
                                ambulances.map((amb) => (
                                    <tr key={amb._id} className="hover:bg-slate-50/60 transition-colors">
                                        {/* Driver & Provider */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center font-black text-sm shrink-0 border border-[#3D3F96]/20">
                                                    <Ambulance className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                                                        {amb.name}
                                                        {amb.isOnline && (
                                                            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" title="Online" />
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className="text-[10px] font-bold text-slate-500">
                                                            {amb.providerType || "Independent Ambulance"}
                                                        </span>
                                                        {amb.experienceYears && (
                                                            <span className="text-[10px] text-slate-400 font-medium">
                                                                &bull; {amb.experienceYears}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Vehicle Info */}
                                        <td className="px-5 py-4">
                                            <div className="font-bold text-slate-800 text-xs flex items-center gap-1">
                                                <Car className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-black text-slate-700">
                                                    {amb.vehicleNumber || "N/A"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#3D3F96] bg-[#3D3F96]/10 px-2 py-0.5 rounded capitalize">
                                                    {amb.vehicleType || "General"}
                                                </span>
                                                {amb.availableForEmergency && (
                                                    <span className="text-[9px] font-black text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                                        Emergency Ready
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Contact */}
                                        <td className="px-5 py-4">
                                            <div className="font-bold text-slate-700 flex items-center gap-1.5">
                                                <Mail className="w-3 h-3 text-slate-400" /> {amb.email}
                                            </div>
                                            <div className="text-slate-500 font-semibold flex items-center gap-1.5 mt-0.5">
                                                <Phone className="w-3 h-3 text-slate-400" /> {amb.phone}
                                            </div>
                                        </td>

                                        {/* Location */}
                                        <td className="px-5 py-4">
                                            <span className="font-bold text-slate-700 block">{amb.city || "City"}</span>
                                            <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                                <span>{amb.state || "State"}</span>
                                                {amb.serviceRadius && <span>&bull; Radius: {amb.serviceRadius}</span>}
                                            </div>
                                        </td>

                                        {/* Metrics */}
                                        <td className="px-5 py-4 text-center">
                                            <div className="inline-flex items-center gap-2">
                                                <span className="text-[11px] font-extrabold text-slate-800" title="Total Rides">
                                                    {amb.totalRidesCount || 0} Total
                                                </span>
                                                <span className="text-slate-300">&bull;</span>
                                                <span className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full" title="Completed Rides">
                                                    {amb.completedRidesCount || 0} Completed
                                                </span>
                                            </div>
                                        </td>

                                        {/* Profile Status */}
                                        <td className="px-5 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${amb.profileStatus?.toLowerCase() === "approved"
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                    : "bg-amber-50 text-amber-700 border-amber-200"
                                                }`}>
                                                <CircleDot className="w-2.5 h-2.5" />
                                                {amb.profileStatus || "APPROVED"}
                                            </span>
                                        </td>

                                        {/* View Bookings Action */}
                                        <td className="px-5 py-4 text-center">
                                            <button
                                                onClick={() => handleViewBookings(amb)}
                                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-extrabold uppercase tracking-wider bg-[#3D3F96]/10 text-[#3D3F96] hover:bg-[#3D3F96] hover:text-white transition-all focus:outline-none shadow-xs cursor-pointer"
                                            >
                                                <Eye className="w-3.5 h-3.5" /> View Rides
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
                                            <h4 className="text-xs font-bold text-slate-700">No Ambulances Found</h4>
                                            <p className="text-[11px] text-slate-400">Try adjusting your search query or city filters.</p>
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
                        disabled={currentPage <= 1 || loadingAmbulances}
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all cursor-pointer"
                    >
                        <ChevronLeft className="w-3.5 h-3.5" /> Previous
                    </button>

                    <span className="text-xs font-extrabold text-slate-500">
                        Page {currentPage} of {totalPages}
                    </span>

                    <button
                        disabled={currentPage >= totalPages || loadingAmbulances}
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all cursor-pointer"
                    >
                        Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* ========================================================
                3. DETAILED AMBULANCE BOOKINGS MODAL
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
                                    <Ambulance className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2.5">
                                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Ambulance Trip Bookings</h3>
                                        <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-[#3D3F96]/10 text-[#3D3F96] border border-[#3D3F96]/20">
                                            {totalAssociatedBookings} Total Rides
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500 mt-1 flex-wrap">
                                        <span>Driver: <strong className="text-slate-800 font-extrabold">{modalAmbulance?.name}</strong></span>
                                        <span>&bull;</span>
                                        <span className="text-[#3D3F96] font-extrabold">{modalAmbulance?.vehicleType} ({modalAmbulance?.vehicleNumber})</span>
                                        <span>&bull;</span>
                                        <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {modalAmbulance?.phone}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowModal(false)}
                                className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-all focus:outline-none shadow-xs cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Top Filters for Modal */}
                        <div className="px-6 py-3.5 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-4 shrink-0">
                            <div className="text-xs font-bold text-slate-500">
                                Real-time dispatch ride logs & patient route details
                            </div>

                            <div className="flex items-center gap-2.5 flex-wrap">
                                {/* Status Filter */}
                                <select
                                    value={modalStatus}
                                    onChange={(e) => {
                                        setModalStatus(e.target.value);
                                        fetchAmbulanceBookings(selectedAmbulanceId, 1);
                                    }}
                                    className="text-xs font-bold rounded-xl px-4 py-2 bg-slate-50 border border-slate-200 focus:outline-none text-slate-700"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>

                                <button
                                    onClick={() => fetchAmbulanceBookings(selectedAmbulanceId, 1)}
                                    className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-black rounded-xl transition-all shadow-xs cursor-pointer"
                                >
                                    Filter
                                </button>
                            </div>
                        </div>

                        {/* Modal Body - Bookings Table */}
                        <div className="overflow-y-auto flex-1 p-6 space-y-4">
                            <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                                <table className="w-full text-xs text-left align-middle">
                                    <thead>
                                        <tr className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-100">
                                            <th className="px-5 py-4">Booking ID & Type</th>
                                            <th className="px-5 py-4">Customer Details</th>
                                            <th className="px-5 py-4 w-1/3">Route & Location</th>
                                            <th className="px-5 py-4">Schedule / Estimate</th>
                                            <th className="px-5 py-4">Payment</th>
                                            <th className="px-5 py-4 text-right">Fare</th>
                                            <th className="px-5 py-4 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {modalLoading ? (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-24 text-center">
                                                    <div className="flex flex-col items-center justify-center gap-2.5">
                                                        <Loader2 className="w-8 h-8 text-[#3D3F96] animate-spin" />
                                                        <span className="text-xs font-bold text-slate-500">Loading ride history...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : modalBookings.length > 0 ? (
                                            modalBookings.map((item) => (
                                                <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                                                    {/* Booking ID & Category */}
                                                    <td className="px-5 py-4 align-top">
                                                        <span className="font-mono font-black text-sm text-[#3D3F96] block">
                                                            {item.bookingId}
                                                        </span>
                                                        <span className={`inline-flex items-center gap-1 mt-1 text-[10px] font-black uppercase px-2 py-0.5 rounded border ${getCategoryBadge(item.bookingCategory)}`}>
                                                            {item.bookingCategory || "General"}
                                                        </span>
                                                        {item.caseReference && (
                                                            <div className="text-[10px] font-mono text-slate-400 mt-1">
                                                                {item.caseReference}
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* Customer / User Info */}
                                                    <td className="px-5 py-4 align-top">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 font-bold text-xs">
                                                                <User className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <div className="font-extrabold text-slate-900 text-xs">
                                                                    {item.userId?.name || "Customer"}
                                                                </div>
                                                                <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                                                                    <Phone className="w-3 h-3 text-slate-400" /> {item.userId?.phone || "N/A"}
                                                                </div>
                                                                {item.userId?.email && (
                                                                    <div className="text-[10px] text-slate-400 font-medium">
                                                                        {item.userId?.email}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Route: Pickup & Dropoff */}
                                                    <td className="px-5 py-4 align-top">
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-start gap-1.5">
                                                                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                                                                <div className="text-[11px]">
                                                                    <span className="font-bold text-slate-600">Pickup: </span>
                                                                    <span className="text-slate-800 font-medium">{item.pickupLocation?.address || "Pickup address"}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-start gap-1.5">
                                                                <span className="w-2 h-2 rounded-full bg-rose-500 mt-1 shrink-0" />
                                                                <div className="text-[11px]">
                                                                    <span className="font-bold text-slate-600">Dropoff: </span>
                                                                    <span className="text-slate-800 font-medium">{item.dropoffLocation?.address || "Dropoff address"}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Schedule & Estimate */}
                                                    <td className="px-5 py-4 align-top">
                                                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                            {item.scheduledDate || "Immediate"}
                                                        </div>
                                                        {item.scheduledTime && (
                                                            <div className="text-[11px] text-[#3D3F96] font-bold flex items-center gap-1 mt-0.5">
                                                                <Clock className="w-3 h-3 text-[#3D3F96]" />
                                                                {item.scheduledTime}
                                                            </div>
                                                        )}
                                                        {item.estimateTime && (
                                                            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                                                                Est: {item.estimateTime}
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Payment Info */}
                                                    <td className="px-5 py-4 align-top">
                                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                                                            <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                                                            {item.paymentMethod || "Online"}
                                                        </div>
                                                        <div className="mt-1">
                                                            <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${item.paymentStatus === "Paid"
                                                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                                    : "bg-amber-50 text-amber-700 border border-amber-200"
                                                                }`}>
                                                                {item.paymentStatus || "Paid"}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Fare Amount */}
                                                    <td className="px-5 py-4 align-top text-right">
                                                        <span className="font-black text-slate-900 text-sm block">
                                                            ₹{(item.pricing?.total || 0).toLocaleString("en-IN")}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 font-bold">{item.rideType || "Ride fare"}</span>
                                                    </td>

                                                    {/* Status Badge */}
                                                    <td className="px-5 py-4 align-top text-center">
                                                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusBadge(item.status)}`}>
                                                            {item.status || "Confirmed"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-16 text-center text-slate-400 font-semibold">
                                                    No ambulance rides found matching the criteria.
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
                                    onClick={() => fetchAmbulanceBookings(selectedAmbulanceId, modalPage - 1)}
                                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold disabled:opacity-40 hover:bg-slate-50 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" /> Previous
                                </button>
                                <span className="text-xs font-extrabold text-slate-600">
                                    Page {modalPage} of {modalTotalPages}
                                </span>
                                <button
                                    disabled={modalPage >= modalTotalPages || modalLoading}
                                    onClick={() => fetchAmbulanceBookings(selectedAmbulanceId, modalPage + 1)}
                                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold disabled:opacity-40 hover:bg-slate-50 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                                >
                                    Next <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-5 py-2 rounded-xl bg-slate-900 text-white hover:bg-black text-xs font-extrabold uppercase tracking-wider transition-all focus:outline-none shadow-xs cursor-pointer"
                            >
                                Close Modal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================
                4. CANCELLED AMBULANCE BOOKINGS MODAL
            ======================================================== */}
            {showCancelledModal && (
                <CancelledAmbulanceOrders
                    isOpen={showCancelledModal}
                    onClose={() => setShowCancelledModal(false)}
                />
            )}
        </div>
    );
}