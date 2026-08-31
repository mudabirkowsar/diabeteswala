"use client";

import React, { useState, useEffect } from 'react';
import {
  Store,
  Mail,
  Phone,
  MapPin,
  FileText,
  ShieldCheck,
  UploadCloud,
  Save,
  Loader2,
  Camera,
  CheckCircle2,
  AlertCircle,
  Info,
  Image as ImageIcon,
  Building2,
  CreditCard,
  FileCheck
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Import Vendor API Service
import FoodAPI from '../../../../services/FoodVendorAPI'; // Adjust relative path based on folder depth

// --- BASE MEDIA HELPER ---
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const getMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  return `${BASE_SERVER_URL}/${cleanPath}`;
};

const KITCHEN_PLACEHOLDER = "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=300";

export default function FoodVendorProfilePage() {
  // --- Data & Loading States ---
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // --- Form Text Field States ---
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  // Compliance Text Fields
  const [fssaiNumber, setFssaiNumber] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [documentState, setDocumentState] = useState('');
  const [issuingAuthority, setIssuingAuthority] = useState('');

  // --- Dynamic File Binary States ---
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  const [kitchenImageFiles, setKitchenImageFiles] = useState([]);
  const [fssaiCertFiles, setFssaiCertFiles] = useState([]);
  const [gstCertFiles, setGstCertFiles] = useState([]);
  const [otherCertFiles, setOtherCertFiles] = useState([]);

  // --- Fetch Vendor Profile on Mount ---
  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const response = await FoodAPI.getFoodVendorProfile();
      if (response && response.success) {
        const data = response.data || {};
        setProfile(data);

        // Populate Text Fields
        setName(data.name || '');
        setAbout(data.about || '');
        setAlternatePhone(data.alternatePhone || '');
        setAddress(data.address || '');
        setCountry(data.country || 'India');
        setState(data.state || '');
        setCity(data.city || '');
        setLat(data.location?.lat?.toString() || '');
        setLng(data.location?.lng?.toString() || '');

        // Populate Compliance
        setFssaiNumber(data.documents?.fssaiNumber || '');
        setGstNumber(data.documents?.gstNumber || '');
        setDocumentState(data.documents?.documentState || '');
        setIssuingAuthority(data.documents?.issuingAuthority || '');
      } else {
        toast.error("Unable to load profile data.");
      }
    } catch (err) {
      console.error("Error retrieving food vendor profile:", err);
      toast.error("Failed to load vendor profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  // --- Profile Avatar Handler ---
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  // --- Handle Staged Profile Update Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Construct Multipart FormData payload
    const formData = new FormData();

    // 1. Text Fields
    formData.append('name', name.trim());
    formData.append('about', about.trim());
    formData.append('alternatePhone', alternatePhone.trim());
    formData.append('address', address.trim());
    formData.append('country', country.trim());
    formData.append('state', state.trim());
    formData.append('city', city.trim());
    if (lat) formData.append('lat', lat);
    if (lng) formData.append('lng', lng);

    formData.append('fssaiNumber', fssaiNumber.trim());
    formData.append('gstNumber', gstNumber.trim());
    formData.append('documentState', documentState.trim());
    formData.append('issuingAuthority', issuingAuthority.trim());

    // 2. File Binaries (Multer foodDocUploads)
    if (profileImageFile) {
      formData.append('profileImage', profileImageFile);
    }

    kitchenImageFiles.forEach((file) => {
      formData.append('kitchenImages', file);
    });

    fssaiCertFiles.forEach((file) => {
      formData.append('fssaiCertificates', file);
    });

    gstCertFiles.forEach((file) => {
      formData.append('gstCertificates', file);
    });

    otherCertFiles.forEach((file) => {
      formData.append('otherCertificates', file);
    });

    try {
      const response = await FoodAPI.updateFoodVendorProfile(formData);
      if (response && response.success) {
        toast.success(response.message || "Profile updates staged successfully! Awaiting Admin verification.");
        // Reset newly selected files
        setProfileImageFile(null);
        setKitchenImageFiles([]);
        setFssaiCertFiles([]);
        setGstCertFiles([]);
        setOtherCertFiles([]);
        fetchProfileData(); // Re-sync profile
      }
    } catch (err) {
      console.error("Error submitting profile update:", err);
      toast.error(err.response?.data?.message || "Failed to submit profile updates.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fbff] select-none">
        <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading vendor credentials...</p>
      </div>
    );
  }

  const currentAvatarUrl = profileImagePreview || getMediaUrl(profile?.profileImage) || KITCHEN_PLACEHOLDER;
  const documents = profile?.documents || {};
  const bankDetails = profile?.bankDetails || {};

  return (
    <div className="max-w-[1400px] mx-auto py-6 px-4 sm:px-6 space-y-8 select-none antialiased text-left text-slate-800">
      <Toaster position="top-right" />

      {/* --- HEADER PROFILE CARD --- */}
      <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">

        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left z-10">
          {/* Kitchen Avatar with interactive camera trigger */}
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-slate-100 border-2 border-slate-200 shadow-inner shrink-0">
              <img
                src={currentAvatarUrl}
                alt={profile?.name || "Kitchen Profile"}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = KITCHEN_PLACEHOLDER; }}
              />
            </div>
            <label className="absolute -bottom-2 -right-2 p-2.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white rounded-2xl cursor-pointer shadow-lg transition active:scale-95">
              <Camera size={15} />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfileImageChange}
              />
            </label>
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {profile?.name || "Healthy Food Partner"}
              </h1>
              <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border ${profile?.profileStatus === 'Approved'
                ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                : profile?.profileStatus === 'Rejected'
                  ? 'bg-rose-50 border-rose-100 text-rose-600'
                  : 'bg-amber-50 border-amber-100 text-amber-600'
                }`}>
                {profile?.profileStatus || "Pending Review"}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-bold text-slate-400">
              <span className="flex items-center gap-1"><Mail size={13} /> {profile?.email}</span>
              <span className="flex items-center gap-1"><Phone size={13} /> {profile?.phone}</span>
              <span className="flex items-center gap-1 text-slate-600"><Store size={13} className="text-[#3d3f96]" /> {profile?.role || "Food"} Partner</span>
            </div>
          </div>
        </div>

        {/* Staging Notice Pill */}
        <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl max-w-xs text-xs space-y-1 z-10 text-center sm:text-left">
          <span className="text-[10px] font-black uppercase text-[#3d3f96] flex items-center justify-center sm:justify-start gap-1">
            <ShieldCheck size={13} /> Staged Approval System
          </span>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
            Any profile or compliance updates will be queued for Admin verification before reflecting live on user storefronts.
          </p>
        </div>

        {/* Background lighting accents */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* --- MAIN FORM WORKSPACE --- */}
      <form onSubmit={handleSubmit} className="space-y-8">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT COLUMN: PRIMARY PROFILE & LOCATION (7/12) */}
          <div className="lg:col-span-7 space-y-6">

            {/* Section 1: Kitchen Information */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-5">
              <div className="border-b border-slate-50 pb-3 flex items-center gap-2">
                <Store size={18} className="text-[#3d3f96]" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Kitchen Identity &amp; Bio</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kitchen / Outlet Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Healthy Bites Kitchen"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Primary Phone (Registered)</label>
                    <input
                      type="text"
                      disabled
                      value={profile?.phone || ''}
                      className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Alternate Contact Phone</label>
                    <input
                      type="text"
                      value={alternatePhone}
                      onChange={(e) => setAlternatePhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">About Kitchen / Culinary Overview</label>
                  <textarea
                    rows={4}
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    placeholder="Describe your kitchen facilities, chef background, and hygiene protocols..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Regional Delivery Location & Coordinates */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-5">
              <div className="border-b border-slate-50 pb-3 flex items-center gap-2">
                <MapPin size={18} className="text-[#3d3f96]" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Physical Address &amp; GPS Coordinates</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kitchen Outlet Full Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. SCO 45, Phase 5, Industrial Area"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="India"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-[#3d3f96]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Punjab"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-[#3d3f96]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Mohali"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-[#3d3f96]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-50 pt-3">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Delivery Latitude (Lat)</label>
                    <input
                      type="number"
                      step="any"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      placeholder="e.g. 30.7114"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-[#3d3f96]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Delivery Longitude (Lng)</label>
                    <input
                      type="number"
                      step="any"
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      placeholder="e.g. 76.6908"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-[#3d3f96]"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: COMPLIANCE, FILES & BANKING (5/12) */}
          <div className="lg:col-span-5 space-y-6">

            {/* Section 3: Regulatory Compliance */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-5">
              <div className="border-b border-slate-50 pb-3 flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#3d3f96]" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">FSSAI &amp; GST Compliance</h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">FSSAI License No.</label>
                    <input
                      type="text"
                      value={fssaiNumber}
                      onChange={(e) => setFssaiNumber(e.target.value)}
                      placeholder="e.g. 10019011000123"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-[#3d3f96]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">GST Number</label>
                    <input
                      type="text"
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value)}
                      placeholder="e.g. 03AAAAA0000A1Z5"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-[#3d3f96]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Document State</label>
                    <input
                      type="text"
                      value={documentState}
                      onChange={(e) => setDocumentState(e.target.value)}
                      placeholder="e.g. Punjab"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-[#3d3f96]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Issuing Authority</label>
                    <input
                      type="text"
                      value={issuingAuthority}
                      onChange={(e) => setIssuingAuthority(e.target.value)}
                      placeholder="e.g. Punjab FSSAI Dept"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-[#3d3f96]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Document & Certificate File Uploads */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-5">
              <div className="border-b border-slate-50 pb-3 flex items-center gap-2">
                <UploadCloud size={18} className="text-[#3d3f96]" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Certificate &amp; Photo Documents</h3>
              </div>

              <div className="space-y-4 text-xs font-bold">

                {/* FSSAI Certificates */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">FSSAI Certificates (Multiple)</label>
                  <div className="border border-dashed border-slate-200 rounded-2xl p-3.5 bg-slate-50/50 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-500 truncate">
                      {fssaiCertFiles.length > 0 ? `${fssaiCertFiles.length} file(s) selected` : `${documents.fssaiCertificates?.length || 0} existing file(s)`}
                    </span>
                    <label className="cursor-pointer px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[10px] font-black uppercase rounded-xl transition shrink-0">
                      Choose Files
                      <input
                        type="file"
                        multiple
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => setFssaiCertFiles(Array.from(e.target.files))}
                      />
                    </label>
                  </div>
                </div>

                {/* Kitchen Photos */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kitchen Premises Photos (Multiple)</label>
                  <div className="border border-dashed border-slate-200 rounded-2xl p-3.5 bg-slate-50/50 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-500 truncate">
                      {kitchenImageFiles.length > 0 ? `${kitchenImageFiles.length} file(s) selected` : `${documents.kitchenImages?.length || 0} existing photo(s)`}
                    </span>
                    <label className="cursor-pointer px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[10px] font-black uppercase rounded-xl transition shrink-0">
                      Choose Photos
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setKitchenImageFiles(Array.from(e.target.files))}
                      />
                    </label>
                  </div>
                </div>

                {/* GST Certificates */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">GST Certificates (Multiple)</label>
                  <div className="border border-dashed border-slate-200 rounded-2xl p-3.5 bg-slate-50/50 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-500 truncate">
                      {gstCertFiles.length > 0 ? `${gstCertFiles.length} file(s) selected` : `${documents.gstCertificates?.length || 0} existing file(s)`}
                    </span>
                    <label className="cursor-pointer px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[10px] font-black uppercase rounded-xl transition shrink-0">
                      Choose Files
                      <input
                        type="file"
                        multiple
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => setGstCertFiles(Array.from(e.target.files))}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: Settled Banking Information (Read-only reference) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="border-b border-slate-50 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard size={18} className="text-[#3d3f96]" />
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Payout Account</h3>
                </div>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${bankDetails.isVerified ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                  {bankDetails.isVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Account Type:</span>
                  <strong className="text-slate-800">{bankDetails.accountType || "Savings"}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bank Name:</span>
                  <strong className="text-slate-800">{bankDetails.bankName || "N/A"}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Account No:</span>
                  <strong className="font-mono text-slate-800">{bankDetails.accountNumber ? `••••${bankDetails.accountNumber.slice(-4)}` : "N/A"}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">UPI ID:</span>
                  <strong className="text-slate-800">{bankDetails.upiId || "N/A"}</strong>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* --- BOTTOM STAGED SUBMIT BAR --- */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <Info size={14} className="text-[#3d3f96]" />
            <span>All submissions are recorded in the ProfileUpdateRequest staging collection [cite: custom_context].</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-10 py-4 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-indigo-950/15 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-75"
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin text-white" />
            ) : (
              <Save size={16} />
            )}
            <span>Submit Staged Updates</span>
          </button>
        </div>

      </form>
    </div>
  );
}