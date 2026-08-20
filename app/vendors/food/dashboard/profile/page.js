"use client";

import React, { useState } from 'react';

export default function ProfilePage() {
  // Editable States
  const [restaurantName, setRestaurantName] = useState('Diabeteswala Food Central');
  const [description, setDescription] = useState('Specialized kitchen preparing meals with precise glycemic monitoring. Low GI, diabetic-friendly, customized calorie plans.');
  const [secondaryPhone, setSecondaryPhone] = useState('+91 91234 56789'); // Editable secondary phone
  const [address, setAddress] = useState('104, Active Kitchen Wing, Bellandur, Bengaluru - 560103');
  const [latitude, setLatitude] = useState(12.9374);
  const [longitude, setLongitude] = useState(77.6874);

  // Simulated Media states
  const [logoFileName, setLogoFileName] = useState('');
  const [bannerFileName, setBannerFileName] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // System Locked / Read-Only Data Mock
  const systemData = {
    primaryPhone: "+91 99887 76655",
    primaryEmail: "payouts@diabeteswala.com",
    gstNumber: "07AAAAA1111A1Z1",
    fssaiNumber: "10021011000124",
    panNumber: "ABCDE1234F",
    openingTime: "09:00 AM",
    closingTime: "10:00 PM",
    deliveryRadius: 5, // in km
    packagingCharge: 15, // in INR
    deliveryCharge: 40, // in INR
    bankAccount: {
      bankName: "ICICI Bank",
      accountNumber: "•••• •••• 7890",
      accountType: "Savings"
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-fade-in py-4 pb-12">
      
      {/* Header section */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Restaurant Profile</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Manage your storefront assets and geolocation. System parameters are locked by administrators.</p>
      </div>

      {/* Profile Media Header (Editable Banner & Logo) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden relative">
        {/* Banner Mock */}
        <div className="h-48 sm:h-64 bg-slate-100 relative group overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/30 transition-all duration-200" />
          <div className="absolute top-4 right-4 z-10">
            <label className="cursor-pointer px-4 py-2 bg-white/95 backdrop-blur hover:bg-white text-slate-700 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 border border-slate-100">
              <ImageIcon className="w-4 h-4 text-slate-500" />
              {bannerFileName ? 'Change Banner' : 'Upload Banner'}
              <input 
                type="file" 
                className="hidden" 
                onChange={(e) => setBannerFileName(e.target.files[0]?.name || '')}
              />
            </label>
          </div>
          {bannerFileName && (
            <div className="absolute bottom-4 right-4 bg-slate-900/60 text-white text-[10px] px-2 py-1 rounded font-mono">
              Selected: {bannerFileName}
            </div>
          )}
        </div>

        {/* Logo Placement Container */}
        <div className="px-6 sm:px-8 pb-6 -mt-16 flex flex-col sm:flex-row sm:items-end justify-between gap-4 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5">
            {/* Logo Circle Mock */}
            <div className="w-32 h-32 rounded-2xl bg-white border border-slate-200 shadow-md flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/30 transition-all duration-200 flex items-center justify-center">
                <label className="cursor-pointer p-2 rounded-lg bg-white/90 shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <UploadIcon className="w-5 h-5 text-slate-600" />
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={(e) => setLogoFileName(e.target.files[0]?.name || '')}
                  />
                </label>
              </div>
              <div className="text-center p-2">
                <div className="w-10 h-10 rounded-full bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center font-bold text-xs mx-auto mb-1">
                  Logo
                </div>
                <span className="text-[10px] text-slate-400 font-semibold truncate block max-w-[100px]">{logoFileName || 'No Logo'}</span>
              </div>
            </div>

            {/* Restaurant Active Title details */}
            <div className="pb-2 space-y-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">{restaurantName}</h2>
              <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <MapPinIcon className="w-3.5 h-3.5 text-slate-400" />
                {address}
              </p>
            </div>
          </div>

          {/* Form Trigger Save button */}
          <button
            onClick={handleSave}
            className="px-6 py-3.5 bg-[#3D3F96] hover:bg-[#3D3F96]/95 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-[#3D3F96]/10 flex items-center gap-2 self-start sm:self-auto"
          >
            <SaveIcon className="w-4 h-4 stroke-[2.5]" />
            {isSaved ? 'Changes Saved!' : 'Save Profile Changes'}
          </button>
        </div>
      </div>

      {/* Form Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Columns: Editable Geolocation & Basic Info (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-bold text-slate-800 text-base uppercase tracking-tight">Basic Storefront Information</h3>
              <p className="text-xs text-slate-400 mt-1">Information visible to clients on the primary search interface.</p>
            </div>

            {/* Store Name Input */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Storefront Name</label>
              <input
                type="text"
                required
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/10 transition-all duration-200"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Description</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/10 transition-all duration-200 resize-none leading-relaxed"
              />
            </div>

            {/* Editable Secondary Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Alternative Phone Number (Editable)</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={secondaryPhone}
                  onChange={(e) => setSecondaryPhone(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/10 transition-all duration-200"
                  placeholder="e.g. +91 91234 56789"
                />
                <PhoneIcon className="absolute left-4 top-3.5 w-4 h-4 text-slate-400 stroke-[2.2]" />
              </div>
            </div>

            {/* Address Details */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Physical Location Address</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/10 transition-all duration-200"
              />
            </div>

            {/* Geolocation Coordinates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Latitude</label>
                <input
                  type="number"
                  step="0.000001"
                  required
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/10 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Longitude</label>
                <input
                  type="number"
                  step="0.000001"
                  required
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/10 transition-all duration-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Read-Only System Parameters & Credentials (1/3 width) */}
        <div className="space-y-6">
          
          {/* System Locked Parameters Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-5 relative">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-tight">System Parameters</h3>
              <LockIcon className="w-4.5 h-4.5 text-slate-400 stroke-[2.5]" />
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-500">
              {/* Primary phone */}
              <div className="flex justify-between">
                <span>Primary Phone</span>
                <span className="text-slate-800">{systemData.primaryPhone}</span>
              </div>
              {/* Primary Email */}
              <div className="flex justify-between">
                <span>Store Email</span>
                <span className="text-slate-800">{systemData.primaryEmail}</span>
              </div>
              {/* Open Time */}
              <div className="flex justify-between">
                <span>Opening Hour</span>
                <span className="text-slate-800">{systemData.openingTime}</span>
              </div>
              {/* Close Time */}
              <div className="flex justify-between">
                <span>Closing Hour</span>
                <span className="text-slate-800">{systemData.closingTime}</span>
              </div>
              {/* Delivery Radius */}
              <div className="flex justify-between">
                <span>Delivery Radius</span>
                <span className="text-slate-800">{systemData.deliveryRadius} Km</span>
              </div>
              {/* Packaging Charge */}
              <div className="flex justify-between">
                <span>Packaging Charge</span>
                <span className="text-slate-800">₹{systemData.packagingCharge}</span>
              </div>
              {/* Delivery Charge */}
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="text-slate-800">₹{systemData.deliveryCharge}</span>
              </div>
            </div>
          </div>

          {/* Business Credentials (Read-Only) */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-5 relative">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-tight">Tax & FSSAI Credentials</h3>
              <LockIcon className="w-4.5 h-4.5 text-slate-400 stroke-[2.5]" />
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-500">
              <div className="flex justify-between">
                <span>FSSAI License No.</span>
                <span className="text-slate-800 font-bold uppercase">{systemData.fssaiNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>GSTIN No.</span>
                <span className="text-slate-800 font-bold uppercase">{systemData.gstNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Business PAN</span>
                <span className="text-slate-800 font-bold uppercase">{systemData.panNumber}</span>
              </div>
            </div>
          </div>

          {/* Linked Bank Details Block */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-5 relative">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-tight">Linked Payout Account</h3>
              <LockIcon className="w-4.5 h-4.5 text-slate-400 stroke-[2.5]" />
            </div>

            <div className="space-y-3 text-xs font-semibold text-slate-500">
              <div className="flex justify-between">
                <span>Settlement Bank</span>
                <span className="text-slate-800 font-bold uppercase">{systemData.bankAccount.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span>Account Number</span>
                <span className="text-slate-800 font-bold tracking-widest">{systemData.bankAccount.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Account Type</span>
                <span className="text-slate-800">{systemData.bankAccount.accountType}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

// Icons

function ImageIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.9 2.9m-18 1.5V19.5a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25V14a2.25 2.25 0 00-2.25-2.25H4.5A2.25 2.25 0 002.25 14v4.75zm10.5-6h.008v.008h-.008V11.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}

function UploadIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
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

function MapPinIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function PhoneIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.28-5.116-3.6-6.397-6.4l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  );
}

function LockIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}