"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Users,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Copy,
  Zap,
  Truck,
  IndianRupee,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  FileText,
  RefreshCw,
  X,
  Bike
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

// Import your API service
import LabVendorAPI from "../../../../../../services/LabVendorAPI";

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id;

  // --- ORDER DETAILS STATE ---
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // --- STAGE 2: PHLEBOTOMIST FLEET STATES ---
  const [phlebotomists, setPhlebotomists] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [isReassigning, setIsReassigning] = useState(false);
  const [loadingPhlebotomists, setLoadingPhlebotomists] = useState(false);

  // Inspector modal for phlebotomist details & active timeline
  const [inspectedPhlebotomist, setInspectedPhlebotomist] = useState(null);
  const [inspectLoading, setInspectLoading] = useState(false);

  // Reject order modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // ==========================================
  // FETCH ORDER DETAILS (API #3)
  // ==========================================
  const fetchOrderDetails = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const res = await LabVendorAPI.getLabOrderDetails(orderId);
      if (res && res.success) {
        setOrder(res.data);
      } else {
        toast.error(res?.message || "Could not retrieve order details.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load order details.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  // ==========================================
  // FETCH AVAILABLE PHLEBOTOMISTS (API #5)
  // ==========================================
  const openAssignModal = async (isReassign = false) => {
    setIsReassigning(isReassign);
    setShowAssignModal(true);
    setLoadingPhlebotomists(true);
    try {
      const res = await LabVendorAPI.getAvailablePhlebotomists();
      if (res && res.success) {
        setPhlebotomists(res.data || []);
      } else {
        toast.error("Could not load phlebotomist fleet.");
      }
    } catch (err) {
      toast.error("Error fetching phlebotomists.");
    } finally {
      setLoadingPhlebotomists(false);
    }
  };

  // ==========================================
  // ASSIGN OR REASSIGN DRIVER (API #6 & #7)
  // ==========================================
  const handleAssignDriver = async (phlebotomistId) => {
    setActionLoading(true);
    try {
      let res;
      if (isReassigning) {
        res = await LabVendorAPI.reassignPhlebotomist(orderId, { newPhlebotomistId: phlebotomistId });
      } else {
        res = await LabVendorAPI.assignPhlebotomist(orderId, { phlebotomistId });
      }

      if (res && res.success) {
        toast.success(res.message || "Phlebotomist updated successfully!");
        setShowAssignModal(false);
        fetchOrderDetails();
      } else {
        toast.error(res?.message || "Failed to assign phlebotomist.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Assignment error.");
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // INSPECT PHLEBOTOMIST PROFILE (API #8)
  // ==========================================
  const inspectDriver = async (phlebotomistId) => {
    setInspectLoading(true);
    try {
      const res = await LabVendorAPI.getPhlebotomistDetails(phlebotomistId);
      if (res && res.success) {
        setInspectedPhlebotomist(res.data);
      } else {
        toast.error("Failed to load driver details.");
      }
    } catch (err) {
      toast.error("Could not load driver profile.");
    } finally {
      setInspectLoading(false);
    }
  };

  // ==========================================
  // ACCEPT / REJECT ORDER (API #4)
  // ==========================================
  const handleAcceptOrder = async () => {
    setActionLoading(true);
    try {
      const res = await LabVendorAPI.acceptLabOrder(orderId);
      if (res && res.success) {
        toast.success("Order confirmed successfully!");
        fetchOrderDetails();
      } else {
        toast.error(res?.message || "Action failed.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectOrder = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) return toast.error("Please provide a rejection reason.");
    setActionLoading(true);
    try {
      const res = await LabVendorAPI.rejectLabOrder(orderId, rejectReason);
      if (res && res.success) {
        toast.success("Order rejected.");
        setShowRejectModal(false);
        fetchOrderDetails();
      } else {
        toast.error(res?.message || "Action failed.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={40} />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loading Order Details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <AlertCircle size={44} className="text-slate-300 mb-3" />
        <h3 className="text-base font-bold text-slate-700">Order not found</h3>
        <button
          onClick={() => router.push("/vendors/labvendor/dashboard/manageorders")}
          className="mt-3 text-xs font-bold text-[#3d3f96] hover:underline flex items-center gap-1"
        >
          <ArrowLeft size={14} /> Back to Orders
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 font-sans">
      <Toaster position="top-right" />

      {/* --- TOP NAV BAR --- */}
      <div className="max-w-6xl mx-auto mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/vendors/labvendor/dashboard/manageorders")}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-2xl text-slate-600 transition-all cursor-pointer shadow-sm"
            title="Back to Orders"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">{order.bookingId}</h1>
              {order.isRapid && (
                <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Zap size={11} className="fill-amber-600" /> Rapid 6-Hr
                </span>
              )}
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-indigo-50 text-[#3d3f96] border border-indigo-100">
                {order.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">
              Booked on {new Date(order.createdAt).toLocaleDateString()} at{" "}
              {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>

        {/* Top Action Buttons if order is still Pending confirmation */}
        {order.status === "Pending" && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowRejectModal(true)}
              className="flex-1 sm:flex-initial px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all"
            >
              Reject Inquiry
            </button>
            <button
              onClick={handleAcceptOrder}
              disabled={actionLoading}
              className="flex-1 sm:flex-initial px-5 py-2 bg-[#3d3f96] hover:bg-[#2d2f75] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <span>Confirm Order</span>}
            </button>
          </div>
        )}
      </div>

      {/* --- MAIN GRID --- */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ===================================================
            LEFT COLUMN: PATIENTS, TESTS & PHLEBOTOMIST
        =================================================== */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. FLEET & PHLEBOTOMIST DISPATCH (STAGE 2) */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Truck size={16} className="text-[#3d3f96]" /> Phlebotomist Fleet Dispatch
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Manage driver assignment for home sample draw and specimen transit
                </p>
              </div>

              {order.phlebotomistId ? (
                <button
                  onClick={() => openAssignModal(true)}
                  className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-[#3d3f96] border border-indigo-200 rounded-xl text-xs font-extrabold transition-all"
                >
                  Reassign Driver
                </button>
              ) : (
                <button
                  onClick={() => openAssignModal(false)}
                  className="px-4 py-2 bg-[#3d3f96] hover:bg-[#2d2f75] text-white rounded-xl text-xs font-extrabold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Truck size={14} /> Assign Driver
                </button>
              )}
            </div>

            {order.phlebotomistId ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-[#3d3f96] font-black text-sm flex items-center justify-center">
                    <Truck size={18} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Driver Assigned: {order.phlebotomistId?.name || "Active Field Staff"}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Phone: {order.phlebotomistId?.phone || "N/A"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() =>
                    inspectDriver(order.phlebotomistId?._id || order.phlebotomistId)
                  }
                  className="text-xs font-bold text-[#3d3f96] hover:underline"
                >
                  View Driver Profile & Route
                </button>
              </div>
            ) : (
              <div className="p-4 bg-amber-50/70 border border-amber-200/70 rounded-2xl text-xs text-amber-800 flex items-center gap-2">
                <AlertCircle size={16} className="text-amber-600 shrink-0" />
                <span>
                  No phlebotomist assigned yet. Assign a team member to collect patient blood/urine specimens on schedule.
                </span>
              </div>
            )}
          </div>

          {/* 2. INCLUDED TESTS & SPECIMEN LINE ITEMS */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <FileText size={16} className="text-[#3d3f96]" /> Included Diagnostic Tests & Bundles
            </h2>

            <div className="divide-y divide-slate-100">
              {order.items?.tests?.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{item.name}</p>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      Sample Type: <strong className="text-slate-600">{item.testId?.sampleType || "Standard Specimen"}</strong>
                    </span>
                  </div>
                  <span className="text-xs font-black text-slate-900">₹{item.price}</span>
                </div>
              ))}

              {order.items?.packages?.map((pkg, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{pkg.name}</p>
                    <span className="text-[10px] font-bold text-[#3d3f96]">Health Package Bundle</span>
                  </div>
                  <span className="text-xs font-black text-slate-900">₹{pkg.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. PATIENTS INFORMATION */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Users size={16} className="text-[#3d3f96]" /> Patient Profiles ({order.patients?.length || 0})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {order.patients?.map((patient, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-[#3d3f96] font-black text-xs flex items-center justify-center">
                      {patient.name?.charAt(0) || "P"}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{patient.name}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold">
                        {patient.age} Yrs • {patient.gender} ({patient.relation})
                      </p>
                    </div>
                  </div>
                  {patient.medicalReport && (
                    <span className="text-[10px] font-bold text-emerald-600 block mt-1">
                      ✓ Lab Report Uploaded
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===================================================
            RIGHT COLUMN: OTP, ADDRESS, FINANCIALS & TIMELINE
        =================================================== */}
        <div className="lg:col-span-4 space-y-6">
          {/* ANTI-FRAUD PICKUP OTP BOX */}
          {order.tracking?.otp && (
            <div className="bg-indigo-50 border-2 border-dashed border-[#3d3f96]/30 p-5 rounded-3xl text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#3d3f96] block mb-1">
                Specimen Collection Pickup OTP
              </span>
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl font-black text-slate-900 tracking-widest">{order.tracking.otp}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(order.tracking.otp);
                    toast.success("OTP Copied!");
                  }}
                  className="p-1 hover:bg-white rounded-lg text-slate-500"
                  title="Copy OTP"
                >
                  <Copy size={16} />
                </button>
              </div>
              <p className="text-[10px] text-slate-500 font-medium mt-1">
                Phlebotomist must enter this verification OTP upon sample collection at patient premises.
              </p>
            </div>
          )}

          {/* SCHEDULE & LOCATION */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Appointment & Pickup</h3>

            <div className="text-xs space-y-2 text-slate-700">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-[#3d3f96]" />
                <span>{new Date(order.appointmentDate).toDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-[#3d3f96]" />
                <span>{order.appointmentTime}</span>
              </div>
              <div className="flex items-start gap-2 pt-2 border-t border-slate-100">
                <MapPin size={14} className="text-[#3d3f96] shrink-0 mt-0.5" />
                <span className="text-slate-600 leading-snug">
                  {order.address?.name && <strong>{order.address.name}, </strong>}
                  {order.address?.city}, {order.address?.state} - {order.address?.pincode}
                  <br />
                  <span className="text-slate-400 font-semibold">Ph: {order.address?.phone || order.userId?.phone}</span>
                </span>
              </div>
            </div>
          </div>

          {/* FINANCIAL SUMMARY */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Billing Breakdown</h3>

            <div className="text-xs space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>Items Total</span>
                <span className="font-bold text-slate-800">₹{order.billSummary?.itemTotal}</span>
              </div>

              {order.billSummary?.homeVisitCharge > 0 && (
                <div className="flex justify-between">
                  <span>Home Visit Fee</span>
                  <span className="font-bold text-slate-800">₹{order.billSummary?.homeVisitCharge}</span>
                </div>
              )}

              {order.billSummary?.rapidDeliveryCharge > 0 && (
                <div className="flex justify-between">
                  <span>Express Rapid Fee</span>
                  <span className="font-bold text-slate-800">₹{order.billSummary?.rapidDeliveryCharge}</span>
                </div>
              )}

              {order.billSummary?.couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>-₹{order.billSummary?.couponDiscount}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-sm font-black text-slate-900">
                <span>Total Amount</span>
                <span className="text-[#3d3f96]">₹{order.billSummary?.totalAmount}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold block text-right uppercase">
                {order.paymentMethod} •{" "}
                <strong className={order.paymentStatus === "Paid" ? "text-emerald-600" : "text-amber-600"}>
                  {order.paymentStatus}
                </strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================
          MODAL: PHLEBOTOMIST DISPATCH SELECTOR
      =================================================== */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAssignModal(false)} />

          <div className="bg-white rounded-[2rem] max-w-md w-full p-6 shadow-2xl border border-slate-100 relative z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  {isReassigning ? "Reassign Phlebotomist" : "Assign Phlebotomist"}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">Select an online staff member for sample collection</p>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {loadingPhlebotomists ? (
                <div className="py-8 flex flex-col items-center justify-center text-slate-400">
                  <Loader2 size={20} className="animate-spin text-[#3d3f96] mb-1" />
                  <span className="text-xs font-semibold">Checking fleet availability...</span>
                </div>
              ) : phlebotomists.length > 0 ? (
                phlebotomists.map((phlebo) => {
                  const isAvailable = phlebo.status === "Available";
                  return (
                    <div
                      key={phlebo._id}
                      className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-[#3d3f96] font-bold text-xs flex items-center justify-center">
                          {phlebo.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{phlebo.name}</p>
                          <span className="text-[10px] text-slate-500">Ph: {phlebo.phone}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                            isAvailable
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {phlebo.status}
                        </span>
                        <button
                          disabled={actionLoading}
                          onClick={() => handleAssignDriver(phlebo._id)}
                          className="px-3 py-1 bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-[11px] font-bold rounded-lg transition-all"
                        >
                          Assign
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center py-6 text-xs text-slate-400">No registered phlebotomists found online.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          MODAL: INSPECT PHLEBOTOMIST PROFILE & ACTIVE TASK
      =================================================== */}
      {inspectedPhlebotomist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setInspectedPhlebotomist(null)} />

          <div className="bg-white rounded-[2rem] max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-black text-slate-900">Phlebotomist Profile & Status</h3>
              <button onClick={() => setInspectedPhlebotomist(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            {/* Profile info */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-[#3d3f96] font-black text-sm flex items-center justify-center">
                {inspectedPhlebotomist.phlebotomist?.name?.charAt(0)}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{inspectedPhlebotomist.phlebotomist?.name}</h4>
                <p className="text-xs text-slate-500">Ph: {inspectedPhlebotomist.phlebotomist?.phone}</p>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold mt-0.5">
                  <span>Vehicle: {inspectedPhlebotomist.phlebotomist?.vehicleType || "Bike"} ({inspectedPhlebotomist.phlebotomist?.vehicleNumber || "N/A"})</span>
                  <span>•</span>
                  <span>Status: <strong className="text-indigo-600">{inspectedPhlebotomist.phlebotomist?.status}</strong></span>
                </div>
              </div>
            </div>

            {/* Active Task / Booking Timeline */}
            {inspectedPhlebotomist.activeBooking ? (
              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                  Active Dispatched Task
                </span>
                <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-xs text-slate-700 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>Booking ID:</span>
                    <span>{inspectedPhlebotomist.activeBooking.bookingId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Patient:</span>
                    <span>{inspectedPhlebotomist.activeBooking.patientDetails?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Destination:</span>
                    <span className="truncate max-w-[200px]">
                      {inspectedPhlebotomist.activeBooking.patientDetails?.address}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-3">No other active bookings currently assigned.</p>
            )}

            <button
              onClick={() => setInspectedPhlebotomist(null)}
              className="w-full mt-4 py-2.5 bg-slate-100 font-bold rounded-xl text-xs text-slate-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ===================================================
          MODAL: REJECT ORDER INQUIRY
      =================================================== */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowRejectModal(false)} />

          <div className="bg-white rounded-[2rem] max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative z-10 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-black text-slate-900 mb-1">Reject Booking Inquiry</h3>
            <p className="text-xs text-slate-500 mb-4">Please specify a mandatory reason for cancelling this booking:</p>

            <form onSubmit={handleRejectOrder} className="space-y-4">
              <textarea
                required
                rows={3}
                placeholder="e.g. Inadequate specimen collection capacity at this time..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white resize-none"
              />

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
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