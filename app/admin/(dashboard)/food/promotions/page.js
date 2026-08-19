"use client";

import React, { useState } from 'react';

// Default system-wide global coupons managed by the admin
const INITIAL_COUPONS = [
  {
    id: "CPN-GLOBAL-01",
    code: "DIABETES50",
    discount: 50,
    minOrder: 800,
    maxDiscount: 1000,
    userLimit: 1, 
    startDate: "01/05/2026",
    expiry: "30/09/2026",
    status: "Live",
    isGlobal: true,
    tag: "GLOBAL",
    color: "bg-[#00B574]" // Green
  },
  {
    id: "CPN-GLOBAL-02",
    code: "FIRSTDW",
    discount: 20,
    minOrder: 300,
    maxDiscount: 150,
    userLimit: 1,
    startDate: "01/01/2026",
    expiry: "31/12/2026",
    status: "Live",
    isGlobal: true,
    tag: "GLOBAL",
    color: "bg-[#00B574]"
  },
  {
    id: "CPN-GLOBAL-03",
    code: "GLYCEMIC10",
    discount: 10,
    minOrder: 250,
    maxDiscount: 100,
    userLimit: 5,
    startDate: "15/02/2026",
    expiry: "15/10/2026",
    status: "Live",
    isGlobal: true,
    tag: "GLOBAL",
    color: "bg-[#00B574]"
  }
];

export default function PromotionsPage() {
  const [coupons, setCoupons] = useState(INITIAL_COUPONS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [editingId, setEditingId] = useState(null);

  // Form Field States
  const [formCode, setFormCode] = useState('');
  const [formDiscount, setFormDiscount] = useState('');
  const [formMinOrder, setFormMinOrder] = useState('');
  const [formMaxDiscount, setFormMaxDiscount] = useState('');
  const [formUserLimit, setFormUserLimit] = useState('1'); 
  const [formStartDate, setFormStartDate] = useState('');
  const [formExpiry, setFormExpiry] = useState('');

  // Convert "DD/MM/YYYY" to HTML Date Input format "YYYY-MM-DD"
  const convertToInputDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return '';
  };

  // Convert HTML Date Input format "YYYY-MM-DD" to standard "DD/MM/YYYY"
  const convertToDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // Toggle Live/Paused state
  const toggleCouponStatus = (id) => {
    setCoupons(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, status: c.status === "Live" ? "Paused" : "Live" };
      }
      return c;
    }));
  };

  // Edit Action Trigger
  const openEditModal = (coupon) => {
    setModalMode('edit');
    setEditingId(coupon.id);
    
    setFormCode(coupon.code);
    setFormDiscount(coupon.discount.toString());
    setFormMinOrder(coupon.minOrder.toString());
    setFormMaxDiscount(coupon.maxDiscount.toString());
    setFormUserLimit(coupon.userLimit.toString());
    setFormStartDate(convertToInputDate(coupon.startDate));
    setFormExpiry(convertToInputDate(coupon.expiry));
    
    setIsModalOpen(true);
  };

  // Create Action Trigger
  const openCreateModal = () => {
    setModalMode('create');
    resetForm();
    setIsModalOpen(true);
  };

  // Form Submit Handler
  const handleFormSubmit = (e) => {
    e.preventDefault();

    const formattedStart = convertToDisplayDate(formStartDate);
    const formattedExpiry = convertToDisplayDate(formExpiry);

    if (modalMode === 'create') {
      const newCoupon = {
        id: `CPN-GLOBAL-${Date.now()}`,
        code: formCode.toUpperCase().replace(/\s+/g, ''),
        discount: parseInt(formDiscount) || 10,
        minOrder: parseInt(formMinOrder) || 0,
        maxDiscount: parseInt(formMaxDiscount) || 0,
        userLimit: parseInt(formUserLimit) || 1,
        startDate: formattedStart || "01/01/2026",
        expiry: formattedExpiry || "31/12/2026",
        status: "Live",
        isGlobal: true,
        tag: "GLOBAL",
        color: "bg-[#00B574]"
      };
      setCoupons([newCoupon, ...coupons]);
    } else {
      // Edit mode submit
      setCoupons(prev => prev.map(c => 
        c.id === editingId 
          ? {
              ...c,
              code: formCode.toUpperCase().replace(/\s+/g, ''),
              discount: parseInt(formDiscount) || 10,
              minOrder: parseInt(formMinOrder) || 0,
              maxDiscount: parseInt(formMaxDiscount) || 0,
              userLimit: parseInt(formUserLimit) || 1,
              startDate: formattedStart,
              expiry: formattedExpiry
            }
          : c
      ));
    }

    resetForm();
    setIsModalOpen(false);
  };

  const deleteCoupon = (id) => {
    setCoupons(prev => prev.filter(c => c.id !== id));
  };

  const resetForm = () => {
    setFormCode('');
    setFormDiscount('');
    setFormMinOrder('');
    setFormMaxDiscount('');
    setFormUserLimit('1');
    setFormStartDate('');
    setFormExpiry('');
    setEditingId(null);
  };

  return (
    <div className="max-w-[1500px] mx-auto space-y-10 animate-fade-in py-4">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center border border-[#3D3F96]/10 flex-shrink-0">
            <PromoIcon className="w-7 h-7 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Active Coupons</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Configure and manage platform-wide global discount coupons.</p>
          </div>
        </div>

        {/* Action Header controls */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setCoupons(INITIAL_COUPONS)}
            className="p-3.5 rounded-xl border border-slate-200 text-slate-500 bg-white hover:bg-slate-50 transition-all duration-150 focus:outline-none"
            title="Reset to default coupons"
          >
            <RefreshIcon className="w-5 h-5 stroke-[2.5]" />
          </button>
          
          <button
            onClick={openCreateModal}
            className="px-6 py-3.5 bg-[#3D3F96] hover:bg-[#3D3F96]/95 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-[#3D3F96]/10 flex items-center gap-2"
          >
            <span>+</span>
            CREATE FOOD COUPON
          </button>
        </div>
      </div>

      {/* Coupons grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <div 
            key={coupon.id} 
            className="bg-white rounded-3xl border border-slate-200/80 flex shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden aspect-[2.4/1]"
          >
            {/* Left Value Block */}
            <div className={`w-1/3 ${
              coupon.status === 'Paused' ? 'bg-slate-400' : coupon.color
            } text-white flex flex-col items-center justify-center relative transition-all duration-300`}>
              
              {/* Ticket Edge Circle Cutouts */}
              <div className="w-5 h-5 rounded-full bg-slate-50 absolute -top-2.5 -right-2.5 border-b border-slate-200/60" />
              <div className="w-5 h-5 rounded-full bg-slate-50 absolute -bottom-2.5 -right-2.5 border-t border-slate-200/60" />

              <div className="text-center">
                <span className="text-3xl sm:text-4xl font-black tracking-tighter">{coupon.discount}</span>
                <p className="text-[10px] font-extrabold uppercase tracking-widest mt-1 opacity-90">% Off</p>
              </div>
            </div>

            {/* Right Ticket Section */}
            <div className="flex-1 flex flex-col justify-between p-5 pl-7 border-l border-dashed border-slate-200 relative">
              
              {/* Header: Code */}
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="text-lg font-black text-slate-800 tracking-tight">{coupon.code}</h3>
                  <span className="text-[9px] font-extrabold border px-2.5 py-0.5 rounded-md bg-emerald-50 border-emerald-100 text-[#00B574]">
                    {coupon.tag}
                  </span>
                </div>

                {/* Requirements & Details */}
                <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 pt-2 text-[11px] text-slate-500 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <CurrencyRupeeIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>Min: <strong className="text-slate-700">₹{coupon.minOrder}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <PromoIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>Max: <strong className="text-slate-700">₹{coupon.maxDiscount}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>Limit: <strong className="text-slate-700">{coupon.userLimit} per customer</strong></span>
                  </div>
                  <div className="col-span-2 flex items-center gap-1.5 mt-0.5 text-slate-505">
                    <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>Valid: <strong className="font-bold text-slate-700">{coupon.startDate} - {coupon.expiry}</strong></span>
                  </div>
                </div>
              </div>

              {/* Footer Actions (Enabled for Admin Modification) */}
              <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-2">
                <div className="flex items-center gap-2 animate-fade-in">
                  <button 
                    onClick={() => openEditModal(coupon)}
                    className="p-1 rounded text-slate-400 hover:text-[#3D3F96] hover:bg-[#3D3F96]/5 transition-all"
                    title="Edit Coupon"
                  >
                    <EditIcon className="w-4 h-4 stroke-[2]" />
                  </button>
                  <button 
                    onClick={() => deleteCoupon(coupon.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                    title="Delete Coupon"
                  >
                    <TrashIcon className="w-4 h-4 stroke-[2]" />
                  </button>
                </div>

                {/* Status Badge */}
                <button
                  onClick={() => toggleCouponStatus(coupon.id)}
                  title="Click to toggle Status"
                  className={`flex items-center gap-1.5 text-[10px] font-bold border px-3 py-1 rounded-full transition-all duration-300 ${
                    coupon.status === "Live"
                      ? "text-emerald-600 border-emerald-100 bg-emerald-50 hover:bg-emerald-100"
                      : "text-slate-500 border-slate-200 bg-slate-100 hover:bg-slate-200"
                  } cursor-pointer`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    coupon.status === "Live" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                  }`} />
                  {coupon.status}
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* CREATE & EDIT OVERLAY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-xl w-full p-6 sm:p-8 shadow-2xl relative animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center border border-[#3D3F96]/10 flex-shrink-0">
                  <PromoIcon className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg uppercase tracking-tight">
                    {modalMode === 'create' ? 'Create Promo Ticket' : 'Update Promotional Code'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Configure platform-wide discount codes</p>
                </div>
              </div>
              <button
                onClick={() => { resetForm(); setIsModalOpen(false); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus:outline-none"
              >
                <CloseIcon className="w-5 h-5 stroke-[2]" />
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleFormSubmit} className="space-y-5">
              
              {/* Coupon Code (Full Width) */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  placeholder="e.g. FITDIET20"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/5 uppercase"
                />
              </div>

              {/* Discount Percentage & User Limit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Discount (%)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={formDiscount}
                    onChange={(e) => setFormDiscount(e.target.value)}
                    placeholder="e.g. 20"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">User Limit (Per User)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formUserLimit}
                    onChange={(e) => setFormUserLimit(e.target.value)}
                    placeholder="e.g. 1"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/5"
                  />
                </div>
              </div>

              {/* Min Order & Max Discount limits */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Min Order (₹)</label>
                  <input
                    type="number"
                    required
                    value={formMinOrder}
                    onChange={(e) => setFormMinOrder(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Max Discount (₹)</label>
                  <input
                    type="number"
                    required
                    value={formMaxDiscount}
                    onChange={(e) => setFormMaxDiscount(e.target.value)}
                    placeholder="e.g. 100"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/5"
                  />
                </div>
              </div>

              {/* Start Date & Expiry Date Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={formExpiry}
                    onChange={(e) => setFormExpiry(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/5"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { resetForm(); setIsModalOpen(false); }}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#3D3F96] hover:bg-[#3D3F96]/95 text-white font-bold text-xs rounded-xl shadow-lg shadow-[#3D3F96]/10"
                >
                  {modalMode === 'create' ? 'Create Coupon' : 'Save Changes'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Custom simple path-icon configurations

function PromoIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 7.5h.007v.008H6V7.5z" />
    </svg>
  );
}

function RefreshIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

function CurrencyRupeeIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 8.25H9m6 3H9m3 1.5a3 3 0 100-6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CalendarIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008z" />
    </svg>
  );
}

function EditIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  );
}

function TrashIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function CloseIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function UserIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}