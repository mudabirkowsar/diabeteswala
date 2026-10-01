"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
  Ticket,
  Ambulance,
  Building2,
  Sparkles,
  Layers,
  Search,
  Check
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Import Clinic API service functions (adjust relative path if needed)
import ClinicAPI from '../../../../services/ClinicAPI';

export default function ClinicCouponsPage() {
  // --- Data States ---
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  // --- Filter & Search States ---
  const [vendorFilter, setVendorFilter] = useState('ALL'); // 'ALL' | 'Ambulance' | 'Clinic'
  const [searchQuery, setSearchQuery] = useState('');

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
  const [formVendorType, setFormVendorType] = useState('Ambulance'); // 'Ambulance' | 'Clinic' | 'All'

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

  // --- 1. Fetch All Ambulance & Clinic Coupons ---
  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const response = await ClinicAPI.getMyAmbulanceCoupons();
      if (response && response.success) {
        setCoupons(response.data || []);
      } else {
        toast.error("Failed to load discount coupons.");
      }
    } catch (err) {
      console.error('Error reading coupons database:', err);
      toast.error(err.response?.data?.message || "Error reading coupons database.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // --- 2. Toggle Live / Paused State ---
  const handleToggleStatus = async (coupon) => {
    if (coupon.isAdminCreated) {
      toast.error("Cannot toggle platform-managed admin coupons.");
      return;
    }

    setTogglingId(coupon._id);
    try {
      const response = await ClinicAPI.toggleAmbulanceCouponStatus(coupon._id);
      if (response && response.success) {
        toast.success(response.message || `Coupon status updated successfully.`);
        // Toggle locally for instant UI responsiveness
        setCoupons(prev => prev.map(c =>
          c._id === coupon._id ? { ...c, isActive: response.isActive !== undefined ? response.isActive : !c.isActive } : c
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
      const response = await ClinicAPI.deleteAmbulanceCoupon(coupon._id);
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

  // --- Reset Form Helper ---
  const resetForm = () => {
    setFormCode('');
    setFormDiscount('');
    setFormMinOrder('0');
    setFormMaxDiscount('');
    setFormUserLimit('1');
    setFormStartDate('');
    setFormExpiry('');
    setFormVendorType('Ambulance');
    setEditingId(null);
  };

  // --- Open Create Modal ---
  const openCreateModal = (defaultVendor = 'Ambulance') => {
    setModalMode('create');
    resetForm();
    setFormVendorType(defaultVendor === 'ALL' ? 'Ambulance' : defaultVendor);

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
      toast.error("Admin global coupons cannot be edited.");
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
    setFormVendorType(coupon.vendorType || 'Ambulance');

    setIsModalOpen(true);
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
      let response;
      if (modalMode === 'create') {
        const createPayload = {
          couponName: formCode.toUpperCase().replace(/\s+/g, ''),
          discountPercentage: Number(formDiscount),
          maxDiscount: Number(formMaxDiscount),
          minOrderAmount: Number(formMinOrder) || 0,
          maxUsagePerUser: Number(formUserLimit) || 1,
          startDate: formStartDate || new Date().toISOString().split('T')[0],
          expiryDate: formExpiry,
          vendorType: formVendorType
        };
        response = await ClinicAPI.createAmbulanceCoupon(createPayload);
      } else {
        const updatePayload = {
          discountPercentage: Number(formDiscount),
          maxDiscount: Number(formMaxDiscount),
          minOrderAmount: Number(formMinOrder) || 0,
          maxUsagePerUser: Number(formUserLimit) || 1,
          startDate: formStartDate,
          expiryDate: formExpiry
        };
        response = await ClinicAPI.updateAmbulanceCoupon(editingId, updatePayload);
      }

      if (response && response.success) {
        toast.success(response.message || "Coupon saved successfully!");
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

  // --- Filtered Coupons List ---
  const filteredCoupons = coupons.filter(coupon => {
    const matchesVendor =
      vendorFilter === 'ALL'
        ? true
        : (coupon.vendorType || '').toLowerCase() === vendorFilter.toLowerCase() || (coupon.vendorType || '').toLowerCase() === 'all';

    const matchesSearch =
      searchQuery.trim() === ''
        ? true
        : (coupon.couponName || '').toLowerCase().includes(searchQuery.toLowerCase().trim());

    return matchesVendor && matchesSearch;
  });

  return (
    <div className="max-w-[1600px] mx-auto space-y-7 py-6 pb-12 antialiased select-none text-left">
      <Toaster position="top-right" />

      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-red-500/10 text-red-600 flex items-center justify-center border border-red-500/15 shrink-0 shadow-xs">
            <Ticket className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Ambulance &amp; Clinic Promotions
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                <Sparkles size={11} /> Multi-Fleet
              </span>
            </div>
            <p className="text-xs text-slate-500 font-bold mt-0.5">
              Launch and manage discount vouchers for emergency ambulances, clinic rides, and OPD consultations.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
          <button
            onClick={fetchCoupons}
            disabled={loading}
            className="p-3.5 rounded-2xl border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 shadow-xs transition cursor-pointer disabled:opacity-50"
            title="Refresh coupon registry"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={() => openCreateModal(vendorFilter)}
            className="px-6 py-3.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-black text-xs uppercase tracking-wider rounded-2xl transition shadow-lg shadow-indigo-950/10 flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus size={16} strokeWidth={3} />
            <span>Create New Coupon</span>
          </button>
        </div>
      </div>

      {/* --- FILTER & SEARCH TOOLBAR --- */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">

          {/* Target Fleet Selector Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden w-full md:w-auto">
            {[
              { id: 'ALL', label: 'All Coupons', icon: Layers },
              { id: 'Ambulance', label: 'Ambulance Rides', icon: Ambulance },
              { id: 'Clinic', label: 'Clinic OPD', icon: Building2 }
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setVendorFilter(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer shrink-0 flex items-center gap-2 ${vendorFilter === tab.id
                      ? 'bg-white text-red-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                    }`}
                >
                  <TabIcon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Field */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coupon code (e.g. SAVE50)..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white transition"
            />
          </div>

        </div>
      </div>

      {/* --- COUPONS GRID --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-28 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <Loader2 className="animate-spin text-red-600 mb-3" size={36} />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Reading promotional coupon database...
          </p>
        </div>
      ) : filteredCoupons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoupons.map((coupon) => {
            const isLive = coupon.isActive !== undefined ? coupon.isActive : true;
            const isAmbulance = (coupon.vendorType || '').toLowerCase() === 'ambulance';

            return (
              <div
                key={coupon._id}
                className="bg-white rounded-3xl border border-slate-200/80 flex shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden min-h-[220px]"
              >
                {/* Left Ticket Cutout Block */}
                <div className={`w-1/3 ${!isLive
                    ? 'bg-slate-400'
                    : isAmbulance
                      ? 'bg-gradient-to-br from-red-600 to-rose-700'
                      : 'bg-gradient-to-br from-[#3d3f96] to-[#2d2f75]'
                  } text-white flex flex-col items-center justify-center relative transition-all duration-300 select-none`}>

                  {/* Ticket Edge Circle Cutouts */}
                  <div className="w-5 h-5 rounded-full bg-[#f8fbff] absolute -top-2.5 -right-2.5 border-b border-slate-200/60" />
                  <div className="w-5 h-5 rounded-full bg-[#f8fbff] absolute -bottom-2.5 -right-2.5 border-t border-slate-200/60" />

                  <div className="text-center p-2">
                    <span className="text-3xl sm:text-4xl font-black tracking-tighter font-mono">
                      {coupon.discountPercentage}
                    </span>
                    <p className="text-[10px] font-black uppercase tracking-widest mt-0.5 opacity-90">
                      % Off
                    </p>
                  </div>
                </div>

                {/* Right Ticket Body */}
                <div className="flex-1 flex flex-col justify-between p-5 pl-7 border-l border-dashed border-slate-200 relative text-left">

                  {/* Header: Code & Category Tag */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h3 className="text-lg font-black text-slate-900 tracking-tight font-mono">
                        {coupon.couponName}
                      </h3>
                      <span className={`text-[9px] font-black border px-2.5 py-0.5 rounded-lg uppercase tracking-wider flex items-center gap-1 ${coupon.isAdminCreated
                          ? 'bg-purple-50 border-purple-200 text-purple-700'
                          : isAmbulance
                            ? 'bg-red-50 border-red-200 text-red-700'
                            : 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        }`}>
                        {isAmbulance && <Ambulance size={10} />}
                        {coupon.isAdminCreated ? "ADMIN CAMPAIGN" : (coupon.vendorType || "CLINIC")}
                      </span>
                    </div>

                    {/* Requirements & Specifications */}
                    <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 pt-2 text-[11px] text-slate-500 font-bold">
                      <div className="flex items-center gap-1.5">
                        <IndianRupee size={12} className="text-slate-400 shrink-0" />
                        <span>Min Order: <strong className="text-slate-800 font-mono">₹{coupon.minOrderAmount || 0}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Percent size={12} className="text-slate-400 shrink-0" />
                        <span>Max Cap: <strong className="text-slate-800 font-mono">₹{coupon.maxDiscount || 0}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2">
                        <Users size={12} className="text-slate-400 shrink-0" />
                        <span>Usage Limit: <strong className="text-slate-800">{coupon.maxUsagePerUser || 1} ride/user</strong></span>
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
                            className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-[#3d3f96] hover:bg-slate-50 transition cursor-pointer"
                            title="Edit Coupon"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(coupon)}
                            disabled={actionLoading}
                            className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer disabled:opacity-50"
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
                      className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider border px-3 py-1 rounded-full transition-all ${coupon.isAdminCreated
                          ? "opacity-60 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-500"
                          : isLive
                            ? "text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 cursor-pointer"
                            : "text-slate-500 border-slate-200 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                        }`}
                      title={coupon.isAdminCreated ? "Admin managed coupon" : "Click to toggle live status"}
                    >
                      {togglingId === coupon._id ? (
                        <Loader2 size={11} className="animate-spin" />
                      ) : (
                        <span className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                          }`} />
                      )}
                      <span>{isLive ? "Live" : "Paused"}</span>
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-24 text-center bg-white rounded-3xl border border-slate-200 shadow-xs border-dashed">
          <Tag size={44} className="text-slate-300 mb-3" />
          <h4 className="text-base font-bold text-slate-700">No Promotional Coupons Found</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            There are no discount vouchers matching your selected category. Click "Create New Coupon" to configure one.
          </p>
        </div>
      )}

      {/* --- CREATE & EDIT OVERLAY MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 max-w-xl w-full p-6 sm:p-8 shadow-2xl relative flex flex-col [&::-webkit-scrollbar]:hidden text-left">

            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-200 shrink-0">
                  <Ticket size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg uppercase tracking-tight">
                    {modalMode === 'create' ? 'Create Promotional Voucher' : 'Update Promotional Voucher'}
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">
                    Configure ride discounts, minimum bill requirements, and validity dates.
                  </p>
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

              {/* Target Service Fleet (Create Mode Only) */}
              {modalMode === 'create' && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    Target Fleet Application <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'Ambulance', label: 'Ambulances', icon: Ambulance },
                      { id: 'Clinic', label: 'Clinic OPD', icon: Building2 },
                      { id: 'All', label: 'All Services', icon: Layers }
                    ].map((item) => {
                      const Icon = item.icon;
                      const isSelected = formVendorType === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setFormVendorType(item.id)}
                          className={`p-2.5 rounded-xl border text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer ${isSelected
                              ? 'bg-red-50 border-red-300 text-red-700 shadow-2xs'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                          <Icon size={14} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Coupon Code */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  Coupon Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={modalMode === 'edit'}
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                  placeholder="e.g. SAVE50, AMB100, OPD20"
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-red-500 uppercase font-mono ${modalMode === 'edit' ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''
                    }`}
                />
              </div>

              {/* Discount Percentage & Max Users Limit */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    Discount (%) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                    <input
                      type="number"
                      required
                      min="1"
                      max="100"
                      value={formDiscount}
                      onChange={(e) => setFormDiscount(e.target.value)}
                      placeholder="e.g. 20"
                      className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    Max Uses Per Patient / Ride
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                    <input
                      type="number"
                      min="1"
                      value={formUserLimit}
                      onChange={(e) => setFormUserLimit(e.target.value)}
                      placeholder="e.g. 1"
                      className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Min Order & Max Discount Limits */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    Min Order Fare (₹)
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                    <input
                      type="number"
                      min="0"
                      value={formMinOrder}
                      onChange={(e) => setFormMinOrder(e.target.value)}
                      placeholder="e.g. 300"
                      className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    Max Discount Cap (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                    <input
                      type="number"
                      required
                      min="1"
                      value={formMaxDiscount}
                      onChange={(e) => setFormMaxDiscount(e.target.value)}
                      placeholder="e.g. 150"
                      className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Start Date & Expiry Date Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    Activation Start Date
                  </label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    Expiry Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formExpiry}
                    onChange={(e) => setFormExpiry(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Modal Actions */}
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
                  className="px-6 py-2.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-950/10 flex items-center gap-1.5 transition cursor-pointer disabled:opacity-70 active:scale-95"
                >
                  {actionLoading ? <Loader2 size={13} className="animate-spin" /> : <Check size={14} strokeWidth={3} />}
                  <span>{modalMode === 'create' ? 'Publish Coupon' : 'Save Changes'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}