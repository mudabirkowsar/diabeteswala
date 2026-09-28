"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  FlaskConical,
  UploadCloud,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Building,
  CreditCard,
  FileText,
  Home,
  Zap,
  ShieldCheck,
  Clock,
  Plus
} from 'lucide-react';

import ClinicAPI from '../../../../../services/ClinicAPI'; // Adjust path if needed

export default function AddClinicLab({ onClose, onLabAdded }) {
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
    experience: '',

    // Lab Features
    isHomeCollectionAvailable: false,
    isRapidServiceAvailable: false,
    isInsuranceAccepted: false,
    is24x7: false,

    // Legal & Accreditation
    nablNumber: '',
    gstNumber: '',
    documentState: '',
    issuingAuthority: '',
    drugLicenseType: 'None',

    // Bank Details
    accountType: 'Current',
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: ''
  });

  // Insurance tags state
  const [insuranceTags, setInsuranceTags] = useState(["RGHS", "ECHS", "Ayushman Bharat"]);
  const [newInsuranceInput, setNewInsuranceInput] = useState('');

  // Single binary files
  const [singleFiles, setSingleFiles] = useState({
    profileImage: null,
    signatureImage: null
  });

  const [singlePreviews, setSinglePreviews] = useState({
    profileImage: null,
    signatureImage: null
  });

  // Multi-files state
  const [multiFiles, setMultiFiles] = useState({
    labImages: [],
    labCertificates: [],
    labLicenses: [],
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

  // Insurance tag handler
  const handleAddInsurance = (e) => {
    e.preventDefault();
    if (newInsuranceInput.trim() && !insuranceTags.includes(newInsuranceInput.trim())) {
      setInsuranceTags(prev => [...prev, newInsuranceInput.trim()]);
      setNewInsuranceInput('');
    }
  };

  const handleRemoveInsurance = (tag) => {
    setInsuranceTags(prev => prev.filter(t => t !== tag));
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

  // Multi file handlers
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

  // --- SUBMISSION ---
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

      // Optional Info
      if (formData.email) payload.append('email', formData.email.trim());
      if (formData.alternatePhone) payload.append('alternatePhone', formData.alternatePhone.trim());
      if (formData.about) payload.append('about', formData.about.trim());
      if (formData.experience) payload.append('experience', formData.experience.trim());
      payload.append('country', formData.country.trim() || 'India');

      // Booleans
      payload.append('isHomeCollectionAvailable', String(formData.isHomeCollectionAvailable));
      payload.append('isRapidServiceAvailable', String(formData.isRapidServiceAvailable));
      payload.append('isInsuranceAccepted', String(formData.isInsuranceAccepted));
      payload.append('is24x7', String(formData.is24x7));

      // Insurance array stringified
      if (formData.isInsuranceAccepted && insuranceTags.length > 0) {
        payload.append('acceptedInsurances', JSON.stringify(insuranceTags));
      }

      // Address & Location
      if (formData.address) payload.append('address', formData.address.trim());
      if (formData.city) payload.append('city', formData.city.trim());
      if (formData.state) payload.append('state', formData.state.trim());
      if (formData.latitude) payload.append('latitude', Number(formData.latitude));
      if (formData.longitude) payload.append('longitude', Number(formData.longitude));

      // Licensing & Statutory
      if (formData.nablNumber) payload.append('nablNumber', formData.nablNumber.trim());
      if (formData.gstNumber) payload.append('gstNumber', formData.gstNumber.trim());
      if (formData.documentState) payload.append('documentState', formData.documentState.trim());
      if (formData.issuingAuthority) payload.append('issuingAuthority', formData.issuingAuthority.trim());
      if (formData.drugLicenseType) payload.append('drugLicenseType', formData.drugLicenseType);

      // Bank JSON
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

      const response = await ClinicAPI.addClinicLab(payload);

      if (response?.success) {
        onLabAdded(response.data);
        onClose();
      } else {
        setErrorMessage(response?.message || "Failed to register diagnostic lab.");
      }
    } catch (err) {
      console.error("Error adding lab:", err);
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
              <FlaskConical size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">Register Diagnostic Lab</h3>
              <p className="text-xs text-slate-400 font-medium">Onboard an in-house laboratory unit and submit for admin approval</p>
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
        <form id="add-lab-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-7 bg-slate-50/40">

          {/* 1. BASIC LAB IDENTITY */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3D3F96]">
              <span className="w-2 h-2 rounded-full bg-[#3D3F96]" /> 1. Lab Identity & Account Credentials
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Lab Display Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Apex Diagnostic Laboratory"
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
                  placeholder="9876543220"
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
                  placeholder="e.g. Lab@12345"
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
                  placeholder="lab@clinic.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none focus:border-[#3D3F96]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Alternate Contact</label>
                <input
                  type="tel"
                  name="alternatePhone"
                  placeholder="9876543221"
                  value={formData.alternatePhone}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none focus:border-[#3D3F96]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Operating Experience</label>
                <input
                  type="text"
                  name="experience"
                  placeholder="e.g. 10 Years"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none focus:border-[#3D3F96]"
                />
              </div>

              <div className="md:col-span-3">
                <label className="text-[11px] font-bold text-slate-600 block mb-1.5">About Lab / Highlights</label>
                <textarea
                  name="about"
                  rows={2}
                  placeholder="Fully automated diagnostic lab with 24x7 emergency sample testing..."
                  value={formData.about}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none focus:border-[#3D3F96]"
                />
              </div>
            </div>
          </div>

          {/* 2. SERVICES & AMENITIES */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3D3F96]">
              <span className="w-2 h-2 rounded-full bg-[#3D3F96]" /> 2. Diagnostic Testing Facilities
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex flex-col justify-between p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <Home className="text-[#3D3F96]" size={18} />
                  <input
                    type="checkbox"
                    name="isHomeCollectionAvailable"
                    checked={formData.isHomeCollectionAvailable}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded text-[#3D3F96] focus:ring-0"
                  />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Home Collection</span>
                  <span className="text-[10px] text-slate-400">Sample pickup at doorstep</span>
                </div>
              </label>

              <label className="flex flex-col justify-between p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <Zap className="text-amber-600" size={18} />
                  <input
                    type="checkbox"
                    name="isRapidServiceAvailable"
                    checked={formData.isRapidServiceAvailable}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded text-[#3D3F96] focus:ring-0"
                  />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Rapid Service</span>
                  <span className="text-[10px] text-slate-400">Express & emergency reports</span>
                </div>
              </label>

              <label className="flex flex-col justify-between p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <ShieldCheck className="text-emerald-600" size={18} />
                  <input
                    type="checkbox"
                    name="isInsuranceAccepted"
                    checked={formData.isInsuranceAccepted}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded text-[#3D3F96] focus:ring-0"
                  />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Insurance Support</span>
                  <span className="text-[10px] text-slate-400">Cashless claims support</span>
                </div>
              </label>

              <label className="flex flex-col justify-between p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="text-purple-600" size={18} />
                  <input
                    type="checkbox"
                    name="is24x7"
                    checked={formData.is24x7}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded text-[#3D3F96] focus:ring-0"
                  />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">24x7 Operations</span>
                  <span className="text-[10px] text-slate-400">Round-the-clock testing</span>
                </div>
              </label>
            </div>

            {/* Insurance tags manager */}
            {formData.isInsuranceAccepted && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <label className="text-[11px] font-bold text-slate-600 block">Supported Insurance Schemes</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Star Health, PMJAY"
                    value={newInsuranceInput}
                    onChange={(e) => setNewInsuranceInput(e.target.value)}
                    className="px-3.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-[#3D3F96] flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleAddInsurance}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 text-[#3D3F96] text-xs font-bold hover:bg-indigo-100"
                  >
                    <Plus size={12} /> Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {insuranceTags.map((tag, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 text-xs bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 font-medium">
                      {tag}
                      <X size={11} className="cursor-pointer text-slate-400 hover:text-rose-500" onClick={() => handleRemoveInsurance(tag)} />
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. LOCATION & ADDRESS */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3D3F96]">
              <span className="w-2 h-2 rounded-full bg-[#3D3F96]" /> 3. Lab Location
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-3">
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Street Address</label>
                <input
                  type="text"
                  name="address"
                  placeholder="SCO 201, Sector 62, Phase 8"
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

          {/* 4. NABL ACCREDITATION & STATUTORY */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3D3F96]">
              <span className="w-2 h-2 rounded-full bg-[#3D3F96]" /> 4. NABL & Legal Credentials
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">NABL Accreditation No.</label>
                <input
                  type="text"
                  name="nablNumber"
                  placeholder="NABL-2026-PB-9876"
                  value={formData.nablNumber}
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
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Issuing Authority</label>
                <input
                  type="text"
                  name="issuingAuthority"
                  placeholder="State Health & Family Welfare"
                  value={formData.issuingAuthority}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none focus:border-[#3D3F96]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Document State</label>
                <input
                  type="text"
                  name="documentState"
                  placeholder="Punjab"
                  value={formData.documentState}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none focus:border-[#3D3F96]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">License Category</label>
                <select
                  name="drugLicenseType"
                  value={formData.drugLicenseType}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none focus:border-[#3D3F96]"
                >
                  <option value="None">None</option>
                  <option value="Retail">Retail</option>
                  <option value="Wholesale">Wholesale</option>
                  <option value="Restricted">Restricted</option>
                  <option value="Blood Bank">Blood Bank</option>
                </select>
              </div>
            </div>
          </div>

          {/* 5. BANKING DETAILS */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3D3F96]">
              <span className="w-2 h-2 rounded-full bg-[#3D3F96]" /> 5. Bank Settlements
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Bank Name</label>
                <input
                  type="text"
                  name="bankName"
                  placeholder="ICICI Bank"
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
                  placeholder="Apex Lab"
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
                  placeholder="123405001234"
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
                  placeholder="ICIC0001234"
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
                  placeholder="apexlab@icici"
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

          {/* 6. UPLOADS */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3D3F96]">
              <span className="w-2 h-2 rounded-full bg-[#3D3F96]" /> 6. Lab Media & Accreditation Uploads
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Profile Image */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Lab Facility Image</label>
                {singlePreviews.profileImage ? (
                  <div className="relative rounded-2xl border border-slate-200 bg-white p-2.5 flex items-center gap-3">
                    <img src={singlePreviews.profileImage.url} alt="Lab" className="w-12 h-12 rounded-xl object-cover" />
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
                      <span className="font-bold text-[#3D3F96]">Upload Facility Image</span>
                      <span className="text-[10px] text-slate-400 block">JPG, PNG up to 5MB</span>
                    </div>
                    <input type="file" accept="image/*" onChange={(e) => handleSingleFileChange('profileImage', e)} className="hidden" />
                  </label>
                )}
              </div>

              {/* Pathologist Signature Stamp */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Pathologist Digital Signature / Stamp</label>
                {singlePreviews.signatureImage ? (
                  <div className="relative rounded-2xl border border-slate-200 bg-white p-2.5 flex items-center gap-3">
                    <img src={singlePreviews.signatureImage.url} alt="Stamp" className="w-12 h-12 rounded-xl object-contain bg-slate-50" />
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
                      <span className="font-bold text-[#3D3F96]">Upload Digital Signature</span>
                      <span className="text-[10px] text-slate-400 block">PNG format preferred</span>
                    </div>
                    <input type="file" accept="image/*" onChange={(e) => handleSingleFileChange('signatureImage', e)} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            {/* Multi-Files (Accreditations & Certificates) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">NABL / Lab Certificates (Max 10)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={(e) => handleMultiFileChange('labCertificates', e)}
                  className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-[#3D3F96] cursor-pointer"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {multiFiles.labCertificates.map((f, i) => (
                    <span key={i} className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1 text-slate-600">
                      {f.name} <X size={10} className="cursor-pointer hover:text-rose-500" onClick={() => handleRemoveMultiFile('labCertificates', i)} />
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Diagnostic Licenses (Max 10)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={(e) => handleMultiFileChange('labLicenses', e)}
                  className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-[#3D3F96] cursor-pointer"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {multiFiles.labLicenses.map((f, i) => (
                    <span key={i} className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1 text-slate-600">
                      {f.name} <X size={10} className="cursor-pointer hover:text-rose-500" onClick={() => handleRemoveMultiFile('labLicenses', i)} />
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
            form="add-lab-form"
            disabled={submitting}
            className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-[#3D3F96] hover:bg-[#2C2E75] text-white text-xs font-bold shadow-lg shadow-indigo-950/10 transition-all disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={14} /> Registering Lab...
              </>
            ) : (
              <>
                <CheckCircle2 size={14} /> Register Lab Profile
              </>
            )}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}