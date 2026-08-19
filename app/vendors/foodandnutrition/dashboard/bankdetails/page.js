"use client";

import React, { useState } from 'react';

export default function BankDetailsPage() {
  // Reactive form state
  const [accountHolder, setAccountHolder] = useState('FOOD VENDOR 1');
  const [bankName, setBankName] = useState('icici bank');
  const [accountType, setAccountType] = useState('Savings');
  const [accountNumber, setAccountNumber] = useState('1234567890');
  const [ifscCode, setIfscCode] = useState('ASD1234567890');
  const [upiId, setUpiId] = useState('test@11');
  const [isSaved, setIsSaved] = useState(false);

  // Helper to safely display masked card number
  const getMaskedCardNumber = (num) => {
    const cleaned = num.replace(/\s+/g, '');
    const lastFour = cleaned.slice(-4) || '7890';
    return `••••  ••••  ${lastFour}`;
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-[1300px] mx-auto space-y-10 animate-fade-in py-4">
      
      {/* Page Title & Status Header */}
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="w-14 h-14 rounded-full bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center shadow-md shadow-[#3D3F96]/5 border border-[#3D3F96]/10">
          <BankIcon className="w-7 h-7 stroke-[2]" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight uppercase">
            Settlement Settings
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Configure secure bank account routing for automated payouts
          </p>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Virtual Card Mock & Warnings */}
        <div className="space-y-6 lg:sticky lg:top-8">
          
          {/* Holographic Chip Bank Card Mockup */}
          <div className="relative overflow-hidden aspect-[1.58/1] w-full rounded-2xl bg-gradient-to-tr from-[#252763] via-[#3D3F96] to-[#595CD2] text-white p-6 shadow-xl shadow-[#3D3F96]/15 flex flex-col justify-between border border-white/10">
            {/* Geometric Tech Line Overlays */}
            <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                <defs>
                  <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M 24 0 L 0 0 0 24" fill="none" stroke="white" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Card Header Row */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-white/10 backdrop-blur-md">
                  <BankIcon className="w-5 h-5 text-white stroke-[2]" />
                </div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-100">Settlement</span>
              </div>
              <span className="text-[10px] font-extrabold tracking-widest uppercase bg-emerald-500 text-white px-3 py-1 rounded-full shadow-sm shadow-emerald-500/10">
                Verified
              </span>
            </div>

            {/* Smart Card Chip Visual */}
            <div className="mt-4 relative z-10">
              <div className="w-10 h-8 rounded-md bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 relative overflow-hidden border border-yellow-200/50 shadow-inner flex items-center justify-center">
                <div className="absolute inset-x-3 inset-y-0 border-r border-amber-600/30 opacity-60" />
                <div className="absolute inset-y-3 inset-x-0 border-b border-amber-600/30 opacity-60" />
              </div>
            </div>

            {/* Masked Account Number */}
            <div className="mt-auto pt-4 relative z-10">
              <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest">Account Number</p>
              <p className="text-xl sm:text-2xl font-bold tracking-widest mt-1">
                {getMaskedCardNumber(accountNumber)}
              </p>
            </div>

            {/* Card Footer Details */}
            <div className="flex justify-between items-end relative z-10 pt-4 border-t border-white/10 mt-4">
              <div className="max-w-[70%]">
                <p className="text-[9px] font-bold text-indigo-200 uppercase tracking-widest">Holder Name</p>
                <p className="text-xs font-bold truncate uppercase tracking-wide mt-0.5">
                  {accountHolder || 'VENDOR NAME'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-indigo-200 uppercase tracking-widest">Bank Network</p>
                <p className="text-xs font-bold truncate uppercase tracking-wide mt-0.5">
                  {bankName || 'BANK'}
                </p>
              </div>
            </div>
          </div>

          {/* Structured Warning Panel */}
          <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-5 shadow-sm">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-amber-800 flex items-center justify-center flex-shrink-0">
                <WarningIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-amber-900 uppercase tracking-wider">
                  Fraud Prevention Warning
                </h4>
                <p className="text-xs text-amber-700 leading-relaxed font-medium mt-1.5">
                  Any changes made to bank account credentials automatically reset your status to <strong className="font-bold underline text-amber-800">Unverified</strong>. Payouts will remain locked until verified by an Administrator.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Update Settlement Account Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-8">
            <div className="flex items-center gap-3.5">
              <CreditCardIcon className="w-5 h-5 text-[#3D3F96]" />
              <h2 className="text-base sm:text-lg font-bold text-slate-800 uppercase tracking-tight">
                Update Bank Settlement Account
              </h2>
            </div>
            <span className="text-[10px] font-extrabold tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-3.5 py-1.5 rounded-full uppercase">
              Verified
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Account Holder Name */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Account Holder Name
              </label>
              <input
                type="text"
                required
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/10 transition-all duration-200"
                placeholder="Enter account holder name"
              />
            </div>

            {/* Bank Name & Account Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/10 transition-all duration-200 uppercase"
                  placeholder="e.g. icici, hdfc"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Account Type
                </label>
                <div className="relative">
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/10 transition-all duration-200 appearance-none cursor-pointer"
                  >
                    <option value="Savings">Savings</option>
                    <option value="Current">Current</option>
                  </select>
                  <ChevronDownIcon className="absolute right-4 top-4.5 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Account Number & IFSC Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/10 transition-all duration-200"
                  placeholder="Enter full account number"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  IFSC Code
                </label>
                <input
                  type="text"
                  required
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/10 transition-all duration-200 uppercase"
                  placeholder="e.g. ICIC0000104"
                />
              </div>
            </div>

            {/* UPI ID (Optional) */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                UPI ID (Optional)
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/10 transition-all duration-200"
                placeholder="e.g. username@upi"
              />
            </div>

            {/* Save Button */}
            <div className="pt-4 flex items-center justify-end">
              <button
                type="submit"
                className="px-6 py-3.5 bg-[#00B574] hover:bg-emerald-600 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/10 flex items-center gap-2"
              >
                <SaveIcon className="w-4 h-4 stroke-[2.5]" />
                {isSaved ? 'Account Saved!' : 'Save Account Info'}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}

// Icons

function BankIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7h20L12 2zM4 11h2v8H4V11zm6 0h2v8h-2V11zm6 0h2v8h-2V11zM2 22h20v-2H2v2z" />
    </svg>
  );
}

function WarningIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function CreditCardIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M5 14h.01M9 14h.01M13 14h.01M17 14h.01M21 16V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2z" />
    </svg>
  );
}

function ChevronDownIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function SaveIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h8l5 5v11a2 2 0 01-2 2z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-8H7v8M7 3v5h8" />
    </svg>
  );
}