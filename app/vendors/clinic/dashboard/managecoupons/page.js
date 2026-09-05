"use client";

import React, { useState, useEffect } from 'react';
import {
  Tag,
  RefreshCw,
  Plus,
  IndianRupee,
  Users,
  Calendar,
  Edit3,
  Trash2,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Percent,
  Ticket
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Import Clinic API service functions
import ClinicAPI from '../../../../services/ClinicAPI'; // Adjust relative path based on your folder structure

export default function ClinicCouponsPage() {
  // --- Data States ---
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  // --- Modal States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [editingId, setEditingId] = useState(null);

  // --- Form Field States ---
  const [formCode, setFormCode] = useState('');
  const [formDiscount, setFormDiscount] = useState('');
  const [formMinOrder, setFormMinOrder] = useState('0');
  const [formMaxDiscount, setFormMaxDiscount] = useState('');
  const [formUserLimit, setFormUserLimit] = useState('1'); 
  const [formStartDate, setFormStartDate] = useState('');
  const [formExpiry, setFormExpiry] = useState('');

  // --- Helper: Format ISO string to Date Input format (YYYY-MM-DD) ---
  const formatForDateInput = (isoDate) => {
    if (!isoDate) return '';
    try {
      return new Date(isoDate).toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // --- Helper: Format ISO string to Display format (DD/MM/YYYY) ---
  const formatDisplayDate = (isoDate) => {
    if (!isoDate) return '--';
    try {
      const d = new Date(isoDate);
      if (isNaN(d.getTime())) return isoDate;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return isoDate;
    }
  };

  // --- 1. Fetch All Clinic & Global Coupons ---
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await ClinicAPI.getClinicCouponsList();
      if (response && response.success) {
        setCoupons(response.data || []);
      } else {
        toast.error("Failed to load clinic coupons.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error reading coupons database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // --- 2. Toggle Live / Paused State ---
  const handleToggleStatus = async (coupon) => {
    if (coupon.isAdminCreated) {
      toast.error("Cannot toggle platform-managed admin coupons.");
      return;
    }

    setTogglingId(coupon._id);
    try {
      const response = await ClinicAPI.toggleClinicCouponStatus(coupon._id);
      if (response && response.success) {
        toast.success(response.message || `Coupon is now ${response.isActive ? 'Live' : 'Paused'}`);
        // Toggle locally for instant UI update
        setCoupons(prev => prev.map(c => 
          c._id === coupon._id ? { ...c, isActive: !c.isActive } : c
        ));
      } else {
        toast.error("Failed to update coupon status.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error modifying coupon status.");
    } finally {
      setTogglingId(null);
    }
  };

  // --- 3. Delete Coupon ---
  const handleDeleteCoupon = async (coupon) => {
    if (coupon.isAdminCreated) {
      toast.error("Admin global coupons cannot be deleted by clinic.");
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete coupon "${coupon.couponName}"?`)) return;
    setActionLoading(true);
    try {
      const response = await ClinicAPI.deleteClinicCoupon(coupon._id);
      if (response && response.success) {
        toast.success(response.message || "Coupon deleted successfully.");
        setCoupons(prev => prev.filter(c => c._id !== coupon._id));
      } else {
        toast.error("Failed to delete coupon.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error removing coupon.");
    } finally {
      setActionLoading(false);
    }
  };

  // --- Open Create Modal ---
  const openCreateModal = () => {
    setModalMode('create');
    resetForm();
    
    const today = new Date();
    const future = new Date();
    future.setDate(today.getDate() + 30);

    setFormStartDate(today.toISOString().split('T')[0]);
    setFormExpiry(future.toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  // --- Open Edit Modal ---
  const openEditModal = (coupon) => {
    if (coupon.isAdminCreated) {
      toast.error("Admin global coupons cannot be edited by clinic.");
      return;
    }

    setModalMode('edit');
    setEditingId(coupon._id);
    
    setFormCode(coupon.couponName || '');
    setFormDiscount((coupon.discountPercentage || 0).toString());
    setFormMinOrder((coupon.minOrderAmount || 0).toString());
    setFormMaxDiscount((coupon.maxDiscount || 0).toString());
    setFormUserLimit((coupon.maxUsagePerUser || 1).toString());
    setFormStartDate(formatForDateInput(coupon.startDate));
    setFormExpiry(formatForDateInput(coupon.expiryDate));
    
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormCode('');
    setFormDiscount('');
    setFormMinOrder('0');
    setFormMaxDiscount('');
    setFormUserLimit('1');
    setFormStartDate('');
    setFormExpiry('');
    setEditingId(null);
  };

  // --- 4. Submit Create or Update ---
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formCode.trim()) {
      toast.error("Please enter a valid coupon code.");
      return;
    }

    if (!formExpiry) {
      toast.error("Please select an expiration date.");
      return;
    }

    if (formStartDate && new Date(formExpiry) < new Date(formStartDate)) {
      toast.error("Expiration date must be after the start date.");
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        couponName: formCode.toUpperCase().replace(/\s+/g, ''),
        discountPercentage: Number(formDiscount),
        maxDiscount: Number(formMaxDiscount),
        minOrderAmount: Number(formMinOrder) || 0,
        maxUsagePerUser: Number(formUserLimit) || 1,
        startDate: formStartDate || new Date().toISOString().split('T')[0],
        expiryDate: formExpiry
      };

      let response;
      if (modalMode === 'create') {
        response = await ClinicAPI.createClinicCoupon(payload);
      } else {
        response = await ClinicAPI.updateClinicCoupon(editingId, payload);
      }

      if (response && response.success) {
        toast.success(response.message || "Coupon saved successfully.");
        resetForm();
        setIsModalOpen(false);
        fetchCoupons();
      } else {
        toast.error("Failed to save coupon.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error submitting coupon.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 py-6 pb-12 antialiased select-none">
      <Toaster position="top-right" />
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-[#3d3f96]/10 text-[#3d3f96] flex items-center justify-center border border-[#3d3f96]/10 shrink-0 shadow-sm">
            <Ticket className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Clinic Coupons &amp; Promotions</h1>
            <p className="text-xs text-slate-500 font-bold mt-1">Configure and manage discount vouchers for patient OPD visits, consultations, and packages.</p>
          </div>
        </div>

        {/* Action Header Controls */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button 
            onClick={fetchCoupons}
            disabled={loading}
            className="p-3.5 rounded-2xl border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 shadow-sm transition-all duration-150 cursor-pointer disabled:opacity-50"
            title="Refresh coupon database"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          
          <button
            onClick={openCreateModal}
            className="px-6 py-3.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold text-xs rounded-2xl transition-all shadow-lg shadow-indigo-950/10 flex items-center gap-2 cursor-pointer"
          >
            <Plus size={15} /> CREATE CLINIC COUPON
          </button>
        </div>
      </div>

      {/* --- COUPONS GRID --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-28 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading coupons catalog...</p>
        </div>
      ) : coupons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon) => {
            const isLive = coupon.isActive !== undefined ? coupon.isActive : true;
            return (
              <div 
                key={coupon._id} 
                className="bg-white rounded-3xl border border-slate-200/80 flex shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden min-h-[220px]"
              >
                {/* Left Ticket Value Cutout Block */}
                <div className={`w-1/3 ${
                  !isLive ? 'bg-slate-400' : 'bg-[#3d3f96]'
                } text-white flex flex-col items-center justify-center relative transition-all duration-300 select-none`}>
                  
                  {/* Ticket Edge Circle Cutouts */}
                  <div className="w-5 h-5 rounded-full bg-[#f8fbff] absolute -top-2.5 -right-2.5 border-b border-slate-200/60" />
                  <div className="w-5 h-5 rounded-full bg-[#f8fbff] absolute -bottom-2.5 -right-2.5 border-t border-slate-200/60" />

                  <div className="text-center p-2">
                    <span className="text-3xl sm:text-4xl font-black tracking-tighter font-mono">{coupon.discountPercentage}</span>
                    <p className="text-[10px] font-black uppercase tracking-widest mt-0.5 opacity-90">% Off</p>
                  </div>
                </div>

                {/* Right Ticket Section */}
                <div className="flex-1 flex flex-col justify-between p-5 pl-7 border-l border-dashed border-slate-200 relative text-left">
                  
                  {/* Header: Code & Target Service */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h3 className="text-lg font-black text-slate-800 tracking-tight font-mono">{coupon.couponName}</h3>
                      <span className={`text-[9px] font-black border px-2.5 py-0.5 rounded-lg uppercase tracking-wider ${
                        coupon.isAdminCreated 
                          ? 'bg-purple-50 border-purple-100 text-purple-700' 
                          : 'bg-indigo-50 border-indigo-100 text-[#3d3f96]'
                      }`}>
                        {coupon.isAdminCreated ? "ADMIN CAMPAIGN" : (coupon.vendorType || "CLINIC")}
                      </span>
                    </div>

                    {/* Requirements & Details */}
                    <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 pt-2 text-[11px] text-slate-500 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <IndianRupee size={12} className="text-slate-400 shrink-0" />
                        <span>Min: <strong className="text-slate-700 font-mono">₹{coupon.minOrderAmount || 0}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Percent size={12} className="text-slate-400 shrink-0" />
                        <span>Max Cap: <strong className="text-slate-700 font-mono">₹{coupon.maxDiscount || 0}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2">
                        <Users size={12} className="text-slate-400 shrink-0" />
                        <span>Limit: <strong className="text-slate-700">{coupon.maxUsagePerUser || 1} per patient</strong></span>
                      </div>
                      <div className="col-span-2 flex items-center gap-1.5 mt-0.5 text-slate-400">
                        <Calendar size={12} className="shrink-0" />
                        <span>Valid: <strong className="font-bold text-slate-700 font-mono">{formatDisplayDate(coupon.startDate)} - {formatDisplayDate(coupon.expiryDate)}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-2">
                    <div className="flex items-center gap-1.5">
                      {coupon.isAdminCreated ? (
                        <span className="text-[10px] font-bold text-slate-400 italic">Platform Managed</span>
                      ) : (
                        <>
                          <button 
                            onClick={() => openEditModal(coupon)}
                            className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-[#3d3f96] hover:bg-slate-50 transition cursor-pointer"
                            title="Edit Coupon"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteCoupon(coupon)}
                            disabled={actionLoading}
                            className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Delete Coupon"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Status Badge Toggle */}
                    <button
                      type="button"
                      disabled={coupon.isAdminCreated || togglingId === coupon._id}
                      onClick={() => handleToggleStatus(coupon)}
                      className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider border px-3 py-1 rounded-full transition-all ${
                        coupon.isAdminCreated 
                          ? "opacity-60 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-500" 
                          : isLive
                          ? "text-emerald-700 border-emerald-100 bg-emerald-50 hover:bg-emerald-100 cursor-pointer"
                          : "text-slate-500 border-slate-200 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                      }`}
                      title={coupon.isAdminCreated ? "Admin managed coupon" : "Click to toggle status"}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        isLive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                      }`} />
                      {isLive ? "Live" : "Paused"}
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-24 text-center bg-white rounded-3xl border border-slate-100 shadow-sm border-dashed">
          <Tag size={40} className="text-slate-300 mb-3" />
          <p className="font-bold text-slate-700">No Active Promotional Coupons</p>
          <p className="text-xs text-slate-400 mt-1">There are no discount vouchers configured. Click "+ Create" above to launch one.</p>
        </div>
      )}

      {/* --- CREATE & EDIT OVERLAY MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 max-w-xl w-full p-6 sm:p-8 shadow-2xl relative flex flex-col [&::-webkit-scrollbar]:hidden text-left">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#3d3f96]/10 text-[#3d3f96] flex items-center justify-center border border-[#3d3f96]/10 shrink-0">
                  <Tag size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg uppercase tracking-tight">
                    {modalMode === 'create' ? 'Create Clinic Voucher' : 'Update Clinic Voucher'}
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Configure patient discount codes and usage rules</p>
                </div>
              </div>
              <button
                onClick={() => { resetForm(); setIsModalOpen(false); }}
                disabled={actionLoading}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {/* Coupon Code */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                  placeholder="e.g. CLINIC20"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-[#3d3f96] uppercase font-mono"
                />
              </div>

              {/* Discount Percentage & User Limit */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Discount (%) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={formDiscount}
                    onChange={(e) => setFormDiscount(e.target.value)}
                    placeholder="e.g. 20"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-[#3d3f96]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Max Uses Per Patient</label>
                  <input
                    type="number"
                    min="1"
                    value={formUserLimit}
                    onChange={(e) => setFormUserLimit(e.target.value)}
                    placeholder="e.g. 1"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-[#3d3f96]"
                  />
                </div>
              </div>

              {/* Min Order & Max Discount limits */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Min Bill Subtotal (₹)</label>
                  <input
                    type="number"
                    value={formMinOrder}
                    onChange={(e) => setFormMinOrder(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-[#3d3f96]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Max Discount Cap (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formMaxDiscount}
                    onChange={(e) => setFormMaxDiscount(e.target.value)}
                    placeholder="e.g. 300"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-[#3d3f96]"
                  />
                </div>
              </div>

              {/* Start Date & Expiry Date Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Start Date</label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-[#3d3f96]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={formExpiry}
                    onChange={(e) => setFormExpiry(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-[#3d3f96]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { resetForm(); setIsModalOpen(false); }}
                  disabled={actionLoading}
                  className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-950/10 flex items-center gap-1.5 transition cursor-pointer disabled:opacity-70"
                >
                  {actionLoading ? <Loader2 size={13} className="animate-spin" /> : null}
                  <span>{modalMode === 'create' ? 'Create Coupon' : 'Save Changes'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}