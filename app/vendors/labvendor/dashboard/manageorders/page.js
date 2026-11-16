"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Calendar,
  Clock,
  User,
  Zap,
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
  Filter,
  ArrowRight,
  Truck,
  RotateCcw,
  IndianRupee,
  FileText
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

// Import your API service
import LabVendorAPI from "../../../../services/LabVendorAPI";

export default function LabManageOrdersPage() {
  const router = useRouter();

  // --- TAB & FILTER STATES ---
  const [activeTab, setActiveTab] = useState("Active"); // 'Active' | 'In-Progress' | 'In-Lab' | 'Completed' | 'Cancelled'
  const [priorityFilter, setPriorityFilter] = useState("All"); // 'All' | 'Rapid'
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const limit = 15;

  // --- DATA STATES ---
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // --- REJECT MODAL STATE ---
  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
    orderId: null,
    bookingId: "",
    reason: ""
  });

  // ==========================================
  // FETCH ORDERS (STAGE 1 API #2)
  // ==========================================
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        tab: activeTab,
        page,
        limit
      };

      if (priorityFilter === "Rapid") {
        params.priority = "Rapid";
      }

      const res = await LabVendorAPI.getLabOrders(params);
      if (res && res.success) {
        setOrders(res.data || []);
        setTotalOrders(res.total || 0);
        setTotalPages(res.totalPages || 1);
      } else {
        toast.error(res?.message || "Failed to load orders");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [activeTab, priorityFilter, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Tab count labels
  const tabs = [
    { key: "Active", label: "Active Orders" },
    { key: "In-Progress", label: "In-Progress" },
    { key: "In-Lab", label: "In-Lab Testing" },
    { key: "Completed", label: "Completed" },
    { key: "Cancelled", label: "Cancelled" }
  ];

  // ==========================================
  // QUICK ORDER ACTIONS (ACCEPT / REJECT)
  // ==========================================
  const handleAccept = async (e, orderId) => {
    e.stopPropagation();
    setActionLoading(true);
    try {
      const res = await LabVendorAPI.acceptLabOrder(orderId);
      if (res && res.success) {
        toast.success(res.message || "Order confirmed successfully!");
        fetchOrders();
      } else {
        toast.error(res?.message || "Failed to accept order.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to accept order.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenReject = (e, order) => {
    e.stopPropagation();
    setRejectModal({
      isOpen: true,
      orderId: order._id,
      bookingId: order.bookingId,
      reason: ""
    });
  };

  const handleRejectConfirm = async (e) => {
    e.preventDefault();
    if (!rejectModal.reason.trim()) {
      return toast.error("Please provide a rejection reason.");
    }

    setActionLoading(true);
    try {
      const res = await LabVendorAPI.rejectLabOrder(rejectModal.orderId, rejectModal.reason);
      if (res && res.success) {
        toast.success(res.message || "Order rejected.");
        setRejectModal({ isOpen: false, orderId: null, bookingId: "", reason: "" });
        fetchOrders();
      } else {
        toast.error(res?.message || "Failed to reject order.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject order.");
    } finally {
      setActionLoading(false);
    }
  };

  // Filter client-side search (by bookingId, user name, or phone)
  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      order.bookingId?.toLowerCase().includes(q) ||
      order.user?.name?.toLowerCase().includes(q) ||
      order.user?.phone?.includes(q) ||
      order.patientSummary?.primaryPatientName?.toLowerCase().includes(q)
    );
  });

  return (
    <main className="min-h-screen py-2 px-0 sm:px-6 lg:px-0 antialiased select-none font-sans">
      <Toaster position="top-right" />

      {/* --- TOP HEADER --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <FileText className="text-[#3d3f96]" /> Lab Booking Ingestion
          </h1>
          <p className="text-slate-500 font-semibold text-xs mt-1">
            Accept incoming orders, assign phlebotomists for sample collections, and track patient statuses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrders}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl text-slate-600 transition-all cursor-pointer shadow-sm flex items-center gap-1.5 text-xs font-bold"
            title="Refresh"
          >
            <RotateCcw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* --- TAB SELECTORS --- */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl mb-6 overflow-x-auto w-full scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setPage(1);
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.key
                ? "bg-white text-[#3d3f96] shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- SEARCH & RAPID TOGGLE --- */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by Order ID (e.g. ORD-369539524), patient name, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
          />
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => {
              setPriorityFilter(priorityFilter === "Rapid" ? "All" : "Rapid");
              setPage(1);
            }}
            className={`px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
              priorityFilter === "Rapid"
                ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100"
            }`}
          >
            <Zap size={14} className={priorityFilter === "Rapid" ? "fill-white" : "text-amber-500"} />
            <span>6-Hr Express / Rapid Only</span>
          </button>
        </div>
      </div>

      {/* --- ORDERS LISTING --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Ingested Orders...</p>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-3.5">
          {filteredOrders.map((order) => {
            const formattedDate = new Date(order.appointmentDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric"
            });

            return (
              <div
                key={order._id}
                onClick={() =>
                  router.push(`/vendors/labvendor/dashboard/manageorders/orderdetail/${order._id}`)
                }
                className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer group flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left: Customer & Booking Info */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-[#3d3f96] flex items-center justify-center shrink-0 font-black text-sm">
                    {order.user?.name?.charAt(0) || "U"}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-extrabold text-sm text-slate-900 group-hover:text-[#3d3f96] transition-colors">
                        {order.bookingId}
                      </span>
                      {order.isRapid && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                          <Zap size={10} className="fill-amber-600" /> Rapid 6-Hr
                        </span>
                      )}
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${
                          order.status === "Confirmed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : order.status === "Phlebotomist Assigned"
                            ? "bg-blue-50 text-blue-700 border-blue-100"
                            : order.status === "Sample Collected"
                            ? "bg-purple-50 text-purple-700 border-purple-100"
                            : order.status === "Cancelled" || order.status === "Rejected"
                            ? "bg-rose-50 text-rose-700 border-rose-100"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 font-semibold flex flex-wrap items-center gap-2">
                      <span>Customer: <strong className="text-slate-800">{order.user?.name}</strong> ({order.user?.phone})</span>
                      <span>•</span>
                      <span>
                        Patient: <strong className="text-slate-800">{order.patientSummary?.primaryPatientName}</strong>
                        {order.patientSummary?.totalPatients > 1 && ` (+${order.patientSummary.totalPatients - 1} more)`}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] font-bold text-slate-400">
                      <span className="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 text-slate-600">
                        <Calendar size={12} className="text-[#3d3f96]" /> {formattedDate}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 text-slate-600">
                        <Clock size={12} className="text-[#3d3f96]" /> {order.appointmentTime}
                      </span>
                      <span className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 text-slate-600">
                        {order.collectionType}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Middle: Line Items Preview */}
                <div className="lg:max-w-xs flex flex-col justify-center">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Booked Tests ({order.itemsSummary?.totalItems || 1})
                  </span>
                  <p className="text-xs font-bold text-slate-700 truncate">
                    {order.itemsSummary?.displayNames?.join(", ") || "Standard Lab Panel"}
                  </p>
                  {order.phlebotomist ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 mt-1">
                      <Truck size={12} /> Assigned: {order.phlebotomist.name}
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-400 mt-1">
                      No phlebotomist assigned
                    </span>
                  )}
                </div>

                {/* Right: Total Amount & Actions */}
                <div className="flex items-center justify-between lg:justify-end gap-5 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                  <div className="text-left lg:text-right">
                    <span className="text-sm font-black text-slate-900 block">₹{order.totalAmount}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {order.paymentMethod} •{" "}
                      <span className={order.paymentStatus === "Paid" ? "text-emerald-600" : "text-amber-600"}>
                        {order.paymentStatus}
                      </span>
                    </span>
                  </div>

                  {/* Accept / Reject actions if Pending or quick view */}
                  <div className="flex items-center gap-2">
                    {order.status === "Pending" && (
                      <>
                        <button
                          onClick={(e) => handleAccept(e, order._id)}
                          disabled={actionLoading}
                          className="p-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all"
                          title="Accept Order"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                        <button
                          onClick={(e) => handleOpenReject(e, order)}
                          disabled={actionLoading}
                          className="p-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all"
                          title="Reject Order"
                        >
                          <XCircle size={16} />
                        </button>
                      </>
                    )}

                    <div className="p-2 bg-slate-50 group-hover:bg-[#3d3f96] group-hover:text-white rounded-xl border border-slate-200 transition-all text-slate-500">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 px-2">
              <span className="text-xs font-semibold text-slate-500">
                Page {page} of {totalPages} ({totalOrders} orders)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="py-24 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
          <FileText size={44} className="mx-auto text-slate-200 mb-3" />
          <p className="text-slate-500 font-bold text-sm">No orders found under "{activeTab}".</p>
        </div>
      )}

      {/* --- REJECT ORDER MODAL --- */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !actionLoading && setRejectModal({ isOpen: false, orderId: null, bookingId: "", reason: "" })}
          />
          <div className="bg-white rounded-[2rem] max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative z-10 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-black text-slate-900 mb-1">Reject Lab Order</h3>
            <p className="text-xs text-slate-500 mb-4">
              Order: <strong className="text-slate-800">{rejectModal.bookingId}</strong>. Please specify a mandatory reason for cancellation:
            </p>

            <form onSubmit={handleRejectConfirm} className="space-y-4">
              <textarea
                required
                rows={3}
                placeholder="e.g. Out of phlebotomist capacity / Outside operating radius..."
                value={rejectModal.reason}
                onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white resize-none"
              />

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setRejectModal({ isOpen: false, orderId: null, bookingId: "", reason: "" })}
                  className="py-2.5 bg-slate-100 font-bold rounded-xl text-xs text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="py-2.5 bg-rose-600 hover:bg-rose-700 font-bold rounded-xl text-xs text-white flex items-center justify-center gap-1.5"
                >
                  {actionLoading ? <Loader2 size={13} className="animate-spin" /> : <span>Confirm Reject</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}