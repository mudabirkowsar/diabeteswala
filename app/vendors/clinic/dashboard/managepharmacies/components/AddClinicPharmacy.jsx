"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Store,
  UploadCloud,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Building,
  CreditCard,
  FileText,
  Truck,
  Clock,
  ShieldCheck
} from 'lucide-react';

import ClinicAPI from '../../../../../services/ClinicAPI'; // Adjust path according to your structure

export default function AddClinicPharmacy({ onClose, onPharmacyAdded }) {
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // --- FORM FIELDS STATE ---
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    email: '',
    alternatePhone: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    latitude: '',
    longitude: '',
    about: '',
    isHomeDeliveryAvailable: false,
    is24x7: false,

    // Legal & Licensing
    cinNumber: '',
    gstNumber: '',
    tanNumber: '',
    panNumber: '',
    drugLicenseNumber: '',
    foodLicenseNumber: '',
    documentState: '',
    issuingAuthority: '',
    drugLicenseType: 'Retail',

    // Bank Details
    accountType: 'Current',
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: ''
  });

  // Single binary files
  const [singleFiles, setSingleFiles] = useState({
    profileImage: null,
    signatureImage: null
  });

  const [singlePreviews, setSinglePreviews] = useState({
    profileImage: null,
    signatureImage: null
  });

  // Multi-file state
  const [multiFiles, setMultiFiles] = useState({
    pharmacyImages: [],
    pharmacyCertificates: [],
    pharmacyLicenses: [],
    gstCertificates: [],
    drugLicenses: [],
    otherCertificates: []
  });

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Single file handlers
  const handleSingleFileChange = (field, e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSingleFiles(prev => ({ ...prev, [field]: file }));
      setSinglePreviews(prev => ({
        ...prev,
        [field]: { url: URL.createObjectURL(file), name: file.name }
      }));
    }
  };

  const handleRemoveSingleFile = (field) => {
    setSingleFiles(prev => ({ ...prev, [field]: null }));
    setSinglePreviews(prev => ({ ...prev, [field]: null }));
  };

  // Multi-file handlers
  const handleMultiFileChange = (field, e) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setMultiFiles(prev => ({
        ...prev,
        [field]: [...prev[field], ...selected]
      }));
    }
  };

  const handleRemoveMultiFile = (field, index) => {
    setMultiFiles(prev => ({
      ...prev,
      [field]: prev[field].filter((_, idx) => idx !== index)
    }));
  };

  // --- SUBMIT VIA FORM DATA ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      const payload = new FormData();

      // Required Text Fields
      payload.append('name', formData.name.trim());
      payload.append('phone', formData.phone.trim());
      payload.append('password', formData.password);

      // Optional text info
      if (formData.email) payload.append('email', formData.email.trim());
      if (formData.alternatePhone) payload.append('alternatePhone', formData.alternatePhone.trim());
      if (formData.about) payload.append('about', formData.about.trim());
      payload.append('country', formData.country.trim() || 'India');

      // Booleans
      payload.append('isHomeDeliveryAvailable', String(formData.isHomeDeliveryAvailable));
      payload.append('is24x7', String(formData.is24x7));

      // Address & Location
      if (formData.address) payload.append('address', formData.address.trim());
      if (formData.city) payload.append('city', formData.city.trim());
      if (formData.state) payload.append('state', formData.state.trim());
      if (formData.latitude) payload.append('latitude', Number(formData.latitude));
      if (formData.longitude) payload.append('longitude', Number(formData.longitude));

      // Licensing & Legal
      if (formData.cinNumber) payload.append('cinNumber', formData.cinNumber.trim());
      if (formData.gstNumber) payload.append('gstNumber', formData.gstNumber.trim());
      if (formData.tanNumber) payload.append('tanNumber', formData.tanNumber.trim());
      if (formData.panNumber) payload.append('panNumber', formData.panNumber.trim());
      if (formData.drugLicenseNumber) payload.append('drugLicenseNumber', formData.drugLicenseNumber.trim());
      if (formData.foodLicenseNumber) payload.append('foodLicenseNumber', formData.foodLicenseNumber.trim());
      if (formData.documentState) payload.append('documentState', formData.documentState.trim());
      if (formData.issuingAuthority) payload.append('issuingAuthority', formData.issuingAuthority.trim());
      if (formData.drugLicenseType) payload.append('drugLicenseType', formData.drugLicenseType);

      // Bank Details JSON
      const bankDetailsObj = {
        accountType: formData.accountType,
        bankName: formData.bankName.trim(),
        accountHolderName: formData.accountHolderName.trim(),
        accountNumber: formData.accountNumber.trim(),
        ifscCode: formData.ifscCode.trim(),
        upiId: formData.upiId.trim()
      };
      payload.append('bankDetails', JSON.stringify(bankDetailsObj));

      // Single Files
      if (singleFiles.profileImage) payload.append('profileImage', singleFiles.profileImage);
      if (singleFiles.signatureImage) payload.append('signatureImage', singleFiles.signatureImage);

      // Multi Files
      Object.keys(multiFiles).forEach(field => {
        multiFiles[field].forEach(file => {
          payload.append(field, file);
        });
      });

      const response = await ClinicAPI.addPharmacy(payload);

      if (response?.success) {
        onPharmacyAdded(response.data);
        onClose();
      } else {
        setErrorMessage(response?.message || "Failed to register pharmacy.");
      }
    } catch (err) {
      console.error("Error adding pharmacy:", err);
      setErrorMessage(err.response?.data?.message || err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-md">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* --- HEADER --- */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-[#3D3F96] flex items-center justify-center border border-indigo-100/50">
              <Store size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">Add Clinic Pharmacy</h3>
              <p className="text-xs text-slate-400 font-medium">Register an in-house dispensary unit and submit for admin approval</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* --- ERROR BANNER --- */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-center gap-3 text-rose-700 text-xs font-semibold">
            <AlertTriangle className="shrink-0 text-rose-500" size={16} />
            <span className="flex-1">{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-rose-700"><X size={14} /></button>
          </div>
        )}

        {/* --- FORM BODY --- */}
        <form id="add-pharmacy-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-7 bg-slate-50/40">

          {/* 1. BASIC STORE INFORMATION */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3D3F96]">
              <span className="w-2 h-2 rounded-full bg-[#3D3F96]" /> 1. Store Identity & Account Credentials
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Pharmacy Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. City Clinic Pharmacy"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none focus:border-[#3D3F96] focus:ring-2 focus:ring-[#3D3F96]/10"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1.5">10-Digit Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none focus:border-[#3D3F96] focus:ring-2 focus:ring-[#3D3F96]/10"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Login Password *</label>
                <input
                  type="password"
                  name="password"
                  placeholder="e.g. Pharmacy@123"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none focus:border-[#3D3F96] focus:ring-2 focus:ring-[#3D3F96]/10"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="pharmacy@clinic.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none focus:border-[#3D3F96]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Alternate Contact Phone</label>
                <input
                  type="tel"
                  name="alternatePhone"
                  placeholder="9876543211"
                  value={formData.alternatePhone}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none focus:border-[#3D3F96]"
                />
              </div>

              <div className="md:col-span-3">
                <label className="text-[11px] font-bold text-slate-600 block mb-1.5">About / Bio</label>
                <textarea
                  name="about"
                  rows={2}
                  placeholder="e.g. 24x7 in-house clinic pharmacy offering critical medications..."
                  value={formData.about}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none focus:border-[#3D3F96]"
                />
              </div>
            </div>
          </div>

          {/* 2. OPERATIONAL CAPABILITIES */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3D3F96]">
              <span className="w-2 h-2 rounded-full bg-[#3D3F96]" /> 2. Operational Features
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Truck className="text-[#3D3F96]" size={20} />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Home Delivery Available</span>
                    <span className="text-[10px] text-slate-400">Can dispatch doorstep medicine deliveries</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  name="isHomeDeliveryAvailable"
                  checked={formData.isHomeDeliveryAvailable}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded text-[#3D3F96] focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Clock className="text-[#3D3F96]" size={20} />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">24x7 Store Operations</span>
                    <span className="text-[10px] text-slate-400">Open round-the-clock for emergency requirements</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  name="is24x7"
                  checked={formData.is24x7}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded text-[#3D3F96] focus:ring-0 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* 3. LOCATION & ADDRESS */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3D3F96]">
              <span className="w-2 h-2 rounded-full bg-[#3D3F96]" /> 3. Pharmacy Location
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-3">
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Street Address</label>
                <input
                  type="text"
                  name="address"
                  placeholder="SCO 104, Sector 62"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none focus:border-[#3D3F96]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  placeholder="Mohali"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none focus:border-[#3D3F96]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  placeholder="Punjab"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none focus:border-[#3D3F96]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none focus:border-[#3D3F96]"
                />
              </div>
            </div>
          </div>

          {/* 4. LICENSING & STATUTORY DETAILS */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3D3F96]">
              <span className="w-2 h-2 rounded-full bg-[#3D3F96]" /> 4. Drug Licensing & Legal Credentials
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Drug License Number</label>
                <input
                  type="text"
                  name="drugLicenseNumber"
                  placeholder="20B/PB/2026/1029"
                  value={formData.drugLicenseNumber}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none focus:border-[#3D3F96]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">License Type</label>
                <select
                  name="drugLicenseType"
                  value={formData.drugLicenseType}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none focus:border-[#3D3F96]"
                >
                  <option value="Retail">Retail</option>
                  <option value="Wholesale">Wholesale</option>
                  <option value="Restricted">Restricted</option>
                  <option value="Blood Bank">Blood Bank</option>
                  <option value="None">None</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">FSSAI / Food License</label>
                <input
                  type="text"
                  name="foodLicenseNumber"
                  placeholder="12226001000123"
                  value={formData.foodLicenseNumber}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none focus:border-[#3D3F96]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">GSTIN Number</label>
                <input
                  type="text"
                  name="gstNumber"
                  placeholder="03AAAAA0000A1Z5"
                  value={formData.gstNumber}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none focus:border-[#3D3F96]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">PAN Card Number</label>
                <input
                  type="text"
                  name="panNumber"
                  placeholder="ABCDE1234F"
                  value={formData.panNumber}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none focus:border-[#3D3F96]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Issuing Authority</label>
                <input
                  type="text"
                  name="issuingAuthority"
                  placeholder="State Drugs Control Administration"
                  value={formData.issuingAuthority}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none focus:border-[#3D3F96]"
                />
              </div>
            </div>
          </div>

          {/* 5. BANKING & SETTLEMENT */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3D3F96]">
              <span className="w-2 h-2 rounded-full bg-[#3D3F96]" /> 5. Bank Account for Settlements
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Bank Name</label>
                <input
                  type="text"
                  name="bankName"
                  placeholder="HDFC Bank"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none focus:border-[#3D3F96]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Account Holder Name</label>
                <input
                  type="text"
                  name="accountHolderName"
                  placeholder="City Clinic Pharmacy"
                  value={formData.accountHolderName}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none focus:border-[#3D3F96]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Account Number</label>
                <input
                  type="text"
                  name="accountNumber"
                  placeholder="50200012345678"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none focus:border-[#3D3F96]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">IFSC Code</label>
                <input
                  type="text"
                  name="ifscCode"
                  placeholder="HDFC0001234"
                  value={formData.ifscCode}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none focus:border-[#3D3F96]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">UPI ID</label>
                <input
                  type="text"
                  name="upiId"
                  placeholder="pharmacy@hdfcbank"
                  value={formData.upiId}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none focus:border-[#3D3F96]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Account Type</label>
                <select
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none focus:border-[#3D3F96]"
                >
                  <option value="Current">Current</option>
                  <option value="Savings">Savings</option>
                </select>
              </div>
            </div>
          </div>

          {/* 6. UPLOADS & ATTACHMENTS */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3D3F96]">
              <span className="w-2 h-2 rounded-full bg-[#3D3F96]" /> 6. Media & Document Uploads
            </div>

            {/* Single Images */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Profile Image */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Pharmacy Storefront Photo</label>
                {singlePreviews.profileImage ? (
                  <div className="relative rounded-2xl border border-slate-200 bg-white p-2.5 flex items-center gap-3">
                    <img src={singlePreviews.profileImage.url} alt="Store" className="w-12 h-12 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 truncate">{singlePreviews.profileImage.name}</p>
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 size={10} /> Attached
                      </span>
                    </div>
                    <button type="button" onClick={() => handleRemoveSingleFile('profileImage')} className="p-1.5 text-slate-400 hover:text-rose-500">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-3 p-3.5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#3D3F96] bg-slate-50/50 cursor-pointer transition-all">
                    <UploadCloud className="text-[#3D3F96]" size={20} />
                    <div className="text-xs">
                      <span className="font-bold text-[#3D3F96]">Upload Storefront Image</span>
                      <span className="text-[10px] text-slate-400 block">JPG, PNG up to 5MB</span>
                    </div>
                    <input type="file" accept="image/*" onChange={(e) => handleSingleFileChange('profileImage', e)} className="hidden" />
                  </label>
                )}
              </div>

              {/* Signature Image */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Authorized Signatory / Stamp</label>
                {singlePreviews.signatureImage ? (
                  <div className="relative rounded-2xl border border-slate-200 bg-white p-2.5 flex items-center gap-3">
                    <img src={singlePreviews.signatureImage.url} alt="Sign" className="w-12 h-12 rounded-xl object-contain bg-slate-50" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 truncate">{singlePreviews.signatureImage.name}</p>
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 size={10} /> Attached
                      </span>
                    </div>
                    <button type="button" onClick={() => handleRemoveSingleFile('signatureImage')} className="p-1.5 text-slate-400 hover:text-rose-500">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-3 p-3.5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#3D3F96] bg-slate-50/50 cursor-pointer transition-all">
                    <UploadCloud className="text-[#3D3F96]" size={20} />
                    <div className="text-xs">
                      <span className="font-bold text-[#3D3F96]">Upload Signature Stamp</span>
                      <span className="text-[10px] text-slate-400 block">PNG format preferred</span>
                    </div>
                    <input type="file" accept="image/*" onChange={(e) => handleSingleFileChange('signatureImage', e)} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            {/* Multi-Files (Licenses & Certificates) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Drug Licenses */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Drug License PDF / Images (Max 5)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={(e) => handleMultiFileChange('drugLicenses', e)}
                  className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-[#3D3F96] cursor-pointer"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {multiFiles.drugLicenses.map((f, i) => (
                    <span key={i} className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1 text-slate-600">
                      {f.name} <X size={10} className="cursor-pointer hover:text-rose-500" onClick={() => handleRemoveMultiFile('drugLicenses', i)} />
                    </span>
                  ))}
                </div>
              </div>

              {/* GST Certificates */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">GST Certificates (Max 5)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={(e) => handleMultiFileChange('gstCertificates', e)}
                  className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-[#3D3F96] cursor-pointer"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {multiFiles.gstCertificates.map((f, i) => (
                    <span key={i} className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1 text-slate-600">
                      {f.name} <X size={10} className="cursor-pointer hover:text-rose-500" onClick={() => handleRemoveMultiFile('gstCertificates', i)} />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </form>

        {/* --- FOOTER --- */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-500 transition-all"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="add-pharmacy-form"
            disabled={submitting}
            className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-[#3D3F96] hover:bg-[#2C2E75] text-white text-xs font-bold shadow-lg shadow-indigo-950/10 transition-all disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={14} /> Submitting Store...
              </>
            ) : (
              <>
                <CheckCircle2 size={14} /> Register Pharmacy
              </>
            )}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}