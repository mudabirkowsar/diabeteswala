"use client";

import React, { useState, useEffect } from "react";
import { 
  FaUniversity, FaUser, FaIdCard, FaMoneyCheck, FaCheckCircle, 
  FaExclamationTriangle, FaShieldAlt, FaSpinner, FaChevronDown, FaSave,
  FaSyncAlt 
} from "react-icons/fa";
import { toast, Toaster } from 'react-hot-toast';

export default function ManageBankingPage() {
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);

  // Standalone Mock State pre-populated with Heera Lab settlement credentials
  const [bankDetails, setBankDetails] = useState({
    accountType: 'Current',
    bankName: 'HDFC Bank',
    accountHolderName: 'Heera Diagnostic Center',
    accountNumber: '5010023456789',
    ifscCode: 'HDFC0000123',
    upiId: 'heeralab@okhdfc',
    isVerified: true // Verified by default for clean initial view
  });

  // FIXED: Declared theme color utility variables to solve the ReferenceError [1]
  const themeBg = "bg-[#3D3F96]";
  const themeHoverBg = "hover:bg-[#2C2D75]";
  const themeShadow = "shadow-[#3D3F96]/20";

  // Simulated initial load delay for professional dashboard feel
  useEffect(() => {
    const timer = setTimeout(() => {
        setFetching(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBankDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);

    // Simulating API save delay
    setTimeout(() => {
      // In accordance with fraud warning, saving resets the verification status
      setBankDetails(prev => ({ ...prev, isVerified: false }));
      setSaving(false);
      toast.success("Bank details successfully saved. Payouts are locked until verification.");
    }, 1200);
  };

  // Label and Input Tailwind utility classes (Custom styled-jsx removed)
  const labelClass = "block uppercase tracking-wider font-extrabold text-[10px] text-gray-400 mb-2 ml-2";
  const inputClass = "w-full px-5 py-4 bg-gray-50 border border-gray-150 rounded-2xl font-extrabold text-sm text-slate-800 outline-none transition-all duration-300 focus:bg-white focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/15 disabled:opacity-50 disabled:cursor-not-allowed";

  if (fetching) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] animate-fadeIn">
        <FaSyncAlt className="animate-spin text-[#3D3F96] text-4xl mb-4"/>
        <p className="text-gray-400 font-bold uppercase tracking-wider text-xs">Loading Settlement Settings...</p>
    </div>
  );

  return (
    <div className="w-full mx-auto pb-20 px-4 md:px-0 animate-fadeIn select-none">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="mb-12 flex flex-col items-center text-center">
        <div className="p-4 bg-[#3D3F96] text-white rounded-[2rem] shadow-xl shadow-[#3D3F96]/20 mb-4">
          <FaUniversity size={32}/>
        </div>
        <h1 className="text-4xl font-black text-gray-800 tracking-tighter uppercase leading-none">Settlement Settings</h1>
        <p className="text-sm text-gray-400 mt-2 font-bold font-sans">Configure your bank account details for direct wallet payouts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Left column: card preview & info */}
        <div className="md:col-span-1 space-y-6">
          
          {/* Card Representation - Configured with deep indigo and navy gradients */}
          <div className="bg-gradient-to-br from-[#3D3F96] to-[#1E1B4B] rounded-[2.5rem] p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between aspect-[1.58/1]">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            
            <div className="flex justify-between items-start z-10">
              <FaUniversity size={28} className="text-white opacity-90" />
              {/* Card Status Badge */}
              <span className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-full tracking-wider border ${
                bankDetails.isVerified 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              }`}>
                {bankDetails.isVerified ? "Verified" : "Unverified"}
              </span>
            </div>

            <div className="z-10 my-4">
              <p className="text-[9px] uppercase font-bold text-indigo-200 tracking-widest leading-none">Account Number</p>
              <p className="text-lg font-bold tracking-wider font-mono mt-2">
                {bankDetails.accountNumber ? `•••• •••• ${bankDetails.accountNumber.slice(-4)}` : "•••• •••• ••••"}
              </p>
            </div>

            <div className="flex justify-between items-end z-10">
              <div>
                <p className="text-[8px] uppercase font-bold text-indigo-200 tracking-widest leading-none">Account Holder</p>
                <p className="text-xs font-bold truncate max-w-[150px] mt-1.5">{bankDetails.accountHolderName || "Not Configured"}</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] uppercase font-semibold text-blue-200 tracking-widest">Bank</p>
                <p className="text-xs font-bold mt-1.5">{bankDetails.bankName || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Warning notice */}
          <div className="bg-amber-50 border border-amber-200/50 rounded-[2rem] p-6 text-amber-800 text-xs flex gap-3 leading-relaxed">
            <FaShieldAlt className="text-amber-500 shrink-0 mt-0.5" size={18} />
            <div>
              <p className="font-black uppercase tracking-wider text-[10px] mb-1">Fraud Prevention Warning</p>
              Any changes made to bank account credentials automatically reset your status to <strong className="font-bold">Unverified</strong>. Payouts will remain locked until verified by an Administrator.
            </div>
          </div>
        </div>

        {/* Right column: Bank form details */}
        <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 md:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-3">
            <h3 className="text-lg font-black text-gray-800 flex items-center gap-2 uppercase tracking-tighter">
              <FaMoneyCheck className="text-[#3D3F96]" /> Update Bank Settlement Account
            </h3>
            
            {/* Header Status Badge */}
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border w-fit ${
              bankDetails.isVerified 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              {bankDetails.isVerified ? "Verified" : "Unverified"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 font-sans">
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className={labelClass}>Account Holder Name</label>
              <input 
                type="text" 
                name="accountHolderName" 
                required 
                value={bankDetails.accountHolderName} 
                onChange={handleInputChange} 
                className={inputClass}
                placeholder="Full Name as registered on Bank Account"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Bank Name</label>
              <input 
                type="text" 
                name="bankName" 
                required 
                value={bankDetails.bankName} 
                onChange={handleInputChange} 
                className={inputClass}
                placeholder="e.g. HDFC Bank"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Account Type</label>
              <div className="relative">
                <select 
                  name="accountType" 
                  value={bankDetails.accountType} 
                  onChange={handleInputChange} 
                  className={`${inputClass} appearance-none bg-white pr-10`}
                >
                  <option value="Savings">Savings</option>
                  <option value="Current">Current</option>
                </select>
                <FaChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Account Number</label>
              <input 
                type="text" 
                name="accountNumber" 
                required 
                value={bankDetails.accountNumber} 
                onChange={handleInputChange} 
                className={`${inputClass} font-mono`}
                placeholder="Enter bank account number"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>IFSC Code</label>
              <input 
                type="text" 
                name="ifscCode" 
                required 
                value={bankDetails.ifscCode} 
                onChange={handleInputChange} 
                className={`${inputClass} uppercase font-mono`}
                placeholder="e.g. HDFC0000123"
              />
            </div>

            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className={labelClass}>UPI ID (Optional)</label>
              <input 
                type="text" 
                name="upiId" 
                value={bankDetails.upiId || ''} 
                onChange={handleInputChange} 
                className={`${inputClass} font-mono`}
                placeholder="e.g. sameersharma@okhdfc"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end pt-4 border-t border-gray-50">
            <button 
              type="submit" 
              disabled={saving} 
              className={`px-10 py-4.5 text-white font-bold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 active:scale-95 text-xs uppercase tracking-wider focus:outline-none ${themeBg} ${themeHoverBg} ${themeShadow}`}
            >
              {saving ? <><FaSpinner className="animate-spin" /> Saving Account...</> : <><FaSave /> Save Account Info</>}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}