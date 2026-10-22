"use client";

import React, { useState, useEffect } from 'react';
import {
  Building2,
  FileText,
  ShieldCheck,
  Truck,
  CreditCard,
  Camera,
  CheckCircle,
  AlertCircle,
  Loader2,
  Save,
  MapPin,
  Phone,
  Mail,
  Plus,
  Trash2,
  Info,
  ShieldAlert,
  ExternalLink,
  X,
  FileCheck,
  Image as ImageIcon
} from 'lucide-react';

// Adjust path based on your folder structure
import PharmacyAPI from '../../../../services/PharmacyVendorAPI';

/**
 * Universal Image URL resolver helper:
 * Combines relative paths with process.env.NEXT_PUBLIC_BACKEND_URL
 */
const getImageUrl = (path) => {
  if (!path) return '';
  // Return blob preview or full URL if already fully qualified
  if (path.startsWith('blob:') || path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const backendBase = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.1.10:5002').replace(/\/+$/, '');
  // Sanitize path (strip leading 'public/' or leading slashes)
  const sanitizedPath = path.replace(/^public\//, '').replace(/^\/+/, '');
  return `${backendBase}/${sanitizedPath}`;
};

export default function PharmacyProfilePage() {
  // --- Active Tab State ---
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'operations' | 'compliance' | 'media' | 'bank'

  // --- Profile Raw Data State ---
  const [rawProfile, setRawProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // --- Form States ---
  const [generalForm, setGeneralForm] = useState({
    name: '',
    about: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    lat: '',
    lng: '',
    alternatePhone: ''
  });

  const [opsForm, setOpsForm] = useState({
    isHomeDeliveryAvailable: true,
    isRapidServiceAvailable: false,
    isInsuranceAccepted: false,
    is24x7: false,
    acceptedInsurances: []
  });
  const [newInsuranceInput, setNewInsuranceInput] = useState('');

  // Tax & License Compliance Form
  const [complianceForm, setComplianceForm] = useState({
    taxType: 'gst', // 'gst' or 'tan_pan'
    cinNumber: '',
    gstNumber: '',
    tanNumber: '',
    panNumber: '',
    drugLicenseNumber: '',
    foodLicenseNumber: '',
    issuingAuthority: '',
    drugLicenseType: 'Retail'
  });

  // Media & Files States
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [signatureImageFile, setSignatureImageFile] = useState(null);
  const [drugLicenseFiles, setDrugLicenseFiles] = useState([]);
  const [pharmacyImageFiles, setPharmacyImageFiles] = useState([]);

  // File Previews
  const [profileImagePreview, setProfileImagePreview] = useState('');
  const [signatureImagePreview, setSignatureImagePreview] = useState('');

  // Notifications
  const [bannerError, setBannerError] = useState('');
  const [bannerSuccess, setBannerSuccess] = useState('');

  // Auto-dismiss alerts
  useEffect(() => {
    if (bannerError || bannerSuccess) {
      const timer = setTimeout(() => {
        setBannerError('');
        setBannerSuccess('');
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [bannerError, bannerSuccess]);

  // --- Fetch Profile ---
  const fetchProfile = async () => {
    setLoading(true);
    setBannerError('');
    try {
      const res = await PharmacyAPI.getPharmacyProfile();
      if (res && res.success && res.data) {
        const p = res.data;
        setRawProfile(p);

        // Populate General Info
        setGeneralForm({
          name: p.name || '',
          about: p.about || '',
          address: p.address || '',
          city: p.city || '',
          state: p.state || '',
          country: p.country || 'India',
          lat: p.location?.lat !== undefined ? p.location.lat : '',
          lng: p.location?.lng !== undefined ? p.location.lng : '',
          alternatePhone: p.alternatePhone || ''
        });

        // Populate Operations Info
        setOpsForm({
          isHomeDeliveryAvailable: p.isHomeDeliveryAvailable ?? true,
          isRapidServiceAvailable: p.isRapidServiceAvailable ?? false,
          isInsuranceAccepted: p.isInsuranceAccepted ?? false,
          is24x7: p.is24x7 ?? false,
          acceptedInsurances: Array.isArray(p.acceptedInsurances) ? p.acceptedInsurances : []
        });

        // Determine initial tax selection
        const hasGst = !!p.documents?.gstNumber;
        setComplianceForm({
          taxType: hasGst ? 'gst' : (p.documents?.tanNumber || p.documents?.panNumber ? 'tan_pan' : 'gst'),
          cinNumber: p.documents?.cinNumber || '',
          gstNumber: p.documents?.gstNumber || '',
          tanNumber: p.documents?.tanNumber || '',
          panNumber: p.documents?.panNumber || '',
          drugLicenseNumber: p.documents?.drugLicenseNumber || '',
          foodLicenseNumber: p.documents?.foodLicenseNumber || '',
          issuingAuthority: p.documents?.issuingAuthority || '',
          drugLicenseType: p.documents?.drugLicenseType || 'Retail'
        });

        // Previews from backend with getImageUrl
        if (p.profileImage) {
          setProfileImagePreview(getImageUrl(p.profileImage));
        }
        if (p.documents?.signatureImage) {
          setSignatureImagePreview(getImageUrl(p.documents.signatureImage));
        }
      } else {
        setBannerError('Failed to retrieve pharmacy profile.');
      }
    } catch (err) {
      setBannerError(err.response?.data?.message || 'Error occurred while loading profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // --- Handle Insurance Tag Addition ---
  const handleAddInsurance = (e) => {
    e.preventDefault();
    if (!newInsuranceInput.trim()) return;
    if (opsForm.acceptedInsurances.includes(newInsuranceInput.trim())) {
      setNewInsuranceInput('');
      return;
    }
    setOpsForm({
      ...opsForm,
      acceptedInsurances: [...opsForm.acceptedInsurances, newInsuranceInput.trim()]
    });
    setNewInsuranceInput('');
  };

  const handleRemoveInsurance = (indexToRemove) => {
    setOpsForm({
      ...opsForm,
      acceptedInsurances: opsForm.acceptedInsurances.filter((_, idx) => idx !== indexToRemove)
    });
  };

  // --- File Input Handlers ---
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setBannerError('Profile image cannot exceed 5MB.');
        return;
      }
      setProfileImageFile(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSignatureImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setBannerError('Signature image cannot exceed 5MB.');
        return;
      }
      setSignatureImageFile(file);
      setSignatureImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDrugLicensesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setBannerError('You can upload up to 5 drug license documents only.');
      return;
    }
    setDrugLicenseFiles(files);
  };

  const handlePharmacyImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 10) {
      setBannerError('You can upload up to 10 store showcase images only.');
      return;
    }
    setPharmacyImageFiles(files);
  };

  // --- Submit Form (Multipart Form-Data) ---
  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setBannerError('');
    setBannerSuccess('');

    // --- Strict Tax Compliance Validations ---
    if (complianceForm.taxType === 'gst') {
      if (!complianceForm.gstNumber.trim()) {
        setBannerError('Compliance Error: Valid 15-digit GST Number is required.');
        setActiveTab('compliance');
        return;
      }
    } else {
      if (!complianceForm.tanNumber.trim() || !complianceForm.panNumber.trim()) {
        setBannerError('Compliance Error: Both TAN Number AND PAN Number are mandatory when GST is not provided.');
        setActiveTab('compliance');
        return;
      }
    }

    // CIN validation: If provided, cannot be empty whitespace
    if (complianceForm.cinNumber && !complianceForm.cinNumber.trim()) {
      setBannerError('CIN Number cannot be empty spaces.');
      setActiveTab('compliance');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();

      // Append General Data
      if (generalForm.name.trim()) formData.append('name', generalForm.name.trim());
      if (generalForm.about.trim()) formData.append('about', generalForm.about.trim());
      if (generalForm.address.trim()) formData.append('address', generalForm.address.trim());
      if (generalForm.city.trim()) formData.append('city', generalForm.city.trim());
      if (generalForm.state.trim()) formData.append('state', generalForm.state.trim());
      if (generalForm.country.trim()) formData.append('country', generalForm.country.trim());
      if (generalForm.lat !== '') formData.append('lat', generalForm.lat);
      if (generalForm.lng !== '') formData.append('lng', generalForm.lng);
      if (generalForm.alternatePhone.trim()) formData.append('alternatePhone', generalForm.alternatePhone.trim());

      // Append Operations Data
      formData.append('isHomeDeliveryAvailable', String(opsForm.isHomeDeliveryAvailable));
      formData.append('isRapidServiceAvailable', String(opsForm.isRapidServiceAvailable));
      formData.append('isInsuranceAccepted', String(opsForm.isInsuranceAccepted));
      formData.append('is24x7', String(opsForm.is24x7));
      formData.append('acceptedInsurances', JSON.stringify(opsForm.acceptedInsurances));

      // Append Tax & Licenses
      if (complianceForm.cinNumber.trim()) formData.append('cinNumber', complianceForm.cinNumber.trim());

      if (complianceForm.taxType === 'gst') {
        formData.append('gstNumber', complianceForm.gstNumber.trim().toUpperCase());
      } else {
        formData.append('tanNumber', complianceForm.tanNumber.trim().toUpperCase());
        formData.append('panNumber', complianceForm.panNumber.trim().toUpperCase());
      }

      if (complianceForm.drugLicenseNumber.trim()) {
        formData.append('drugLicenseNumber', complianceForm.drugLicenseNumber.trim());
      }
      if (complianceForm.foodLicenseNumber.trim()) {
        formData.append('foodLicenseNumber', complianceForm.foodLicenseNumber.trim());
      }
      if (complianceForm.issuingAuthority.trim()) {
        formData.append('issuingAuthority', complianceForm.issuingAuthority.trim());
      }
      if (complianceForm.drugLicenseType) {
        formData.append('drugLicenseType', complianceForm.drugLicenseType);
      }

      // Append Files
      if (profileImageFile) {
        formData.append('profileImage', profileImageFile);
      }
      if (signatureImageFile) {
        formData.append('signatureImage', signatureImageFile);
      }
      drugLicenseFiles.forEach((file) => {
        formData.append('drugLicenses', file);
      });
      pharmacyImageFiles.forEach((file) => {
        formData.append('pharmacyImages', file);
      });

      const response = await PharmacyAPI.updatePharmacyProfile(formData);

      if (response && response.success) {
        setBannerSuccess(
          response.message || 'Profile changes submitted to Admin for review. Bills will update upon approval.'
        );
        fetchProfile(); // Refresh details
      } else {
        setBannerError(response?.message || 'Failed to update pharmacy profile.');
      }
    } catch (err) {
      setBannerError(err.response?.data?.message || 'Unexpected error during profile update.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 antialiased">
        <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Loading Pharmacy Provider Profile...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] antialiased">
      <div className="max-w-[1440px] mx-auto space-y-6">

        {/* --- HEADER SUMMARY BAR --- */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
              {profileImagePreview ? (
                <img
                  src={profileImagePreview}
                  alt="Pharmacy Storefront"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://placehold.co/100x100?text=Store';
                  }}
                />
              ) : (
                <Building2 size={28} className="text-slate-400" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  {rawProfile?.name || 'Pharmacy Business Profile'}
                </h1>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${rawProfile?.profileStatus === 'Approved'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                  <CheckCircle size={10} /> {rawProfile?.profileStatus || 'Pending Review'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>{rawProfile?.email}</span>
                <span>•</span>
                <span>{rawProfile?.phone}</span>
                <span>•</span>
                <span className="font-semibold text-slate-700">
                  {[rawProfile?.city, rawProfile?.state].filter(Boolean).join(', ') || 'India'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Service Status</span>
              <span className={`inline-flex items-center gap-1 text-xs font-bold ${rawProfile?.isOnline ? 'text-emerald-600' : 'text-slate-400'}`}>
                <span className={`w-2 h-2 rounded-full ${rawProfile?.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                {rawProfile?.isOnline ? 'Online for Orders' : 'Offline'}
              </span>
            </div>

            <button
              onClick={handleSubmitProfile}
              disabled={saving}
              className="px-5 py-2.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              <span>{saving ? 'Submitting...' : 'Save Profile'}</span>
            </button>
          </div>
        </div>

        {/* --- GLOBAL FEEDBACK ALERTS --- */}
        {bannerError && (
          <div className="flex items-center justify-between bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-xs font-semibold">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-rose-600" />
              <span>{bannerError}</span>
            </div>
            <button onClick={() => setBannerError('')} className="p-1 hover:bg-rose-100 rounded">
              <X size={14} />
            </button>
          </div>
        )}

        {bannerSuccess && (
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-xs font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="shrink-0 text-emerald-600" />
              <span>{bannerSuccess}</span>
            </div>
            <button onClick={() => setBannerSuccess('')} className="p-1 hover:bg-emerald-100 rounded">
              <X size={14} />
            </button>
          </div>
        )}

        {/* --- NOTICE ON ADMIN REVIEW QUEUE --- */}
        <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-lg flex items-start gap-2.5 text-xs text-[#3d3f96]">
          <Info size={16} className="shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">
            <strong className="font-bold">Compliance Note:</strong> Modifications to Legal Name, Drug Licenses, and GST/Tax information are submitted to the Admin Approval Queue. Your live customer bills will update once verified.
          </p>
        </div>

        {/* --- NAVIGATION TABS --- */}
        <div className="flex border-b border-slate-200 gap-6 overflow-x-auto">
          {[
            { id: 'general', label: 'Store & Address', icon: Building2 },
            { id: 'operations', label: 'Logistics & Services', icon: Truck },
            { id: 'compliance', label: 'Corporate & Tax Compliance', icon: ShieldCheck },
            { id: 'media', label: 'Media & Documents', icon: Camera },
            { id: 'bank', label: 'Bank Verification (Read-Only)', icon: CreditCard }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${isActive
                    ? 'border-[#3d3f96] text-[#3d3f96]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* TAB 1: STORE & ADDRESS                                    */}
        {/* ========================================================= */}
        {activeTab === 'general' && (
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100">
              General Pharmacy Identity
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Pharmacy Legal / Trade Name */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Pharmacy Trade / Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={generalForm.name}
                  onChange={(e) => setGeneralForm({ ...generalForm, name: e.target.value })}
                  placeholder="e.g. Apollo Pharmacy (Sector 62 Phase 8)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                />
              </div>

              {/* Bio / About */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Store Bio / Public Description
                </label>
                <textarea
                  rows={3}
                  value={generalForm.about}
                  onChange={(e) => setGeneralForm({ ...generalForm, about: e.target.value })}
                  placeholder="Tell patients about your medical store, doorstep delivery speed, genuine medicines guarantee..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all resize-none"
                />
              </div>

              {/* Street Address */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Full Building / Street Address *
                </label>
                <input
                  type="text"
                  value={generalForm.address}
                  onChange={(e) => setGeneralForm({ ...generalForm, address: e.target.value })}
                  placeholder="e.g. SCO 45-46, Phase 8, Sector 62"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                />
              </div>

              {/* City */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">City *</label>
                <input
                  type="text"
                  value={generalForm.city}
                  onChange={(e) => setGeneralForm({ ...generalForm, city: e.target.value })}
                  placeholder="e.g. Mohali"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                />
              </div>

              {/* State */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">State *</label>
                <input
                  type="text"
                  value={generalForm.state}
                  onChange={(e) => setGeneralForm({ ...generalForm, state: e.target.value })}
                  placeholder="e.g. Punjab"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                />
              </div>

              {/* Secondary Phone */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Alternate / Order Helpdesk Phone
                </label>
                <input
                  type="tel"
                  value={generalForm.alternatePhone}
                  onChange={(e) => setGeneralForm({ ...generalForm, alternatePhone: e.target.value })}
                  placeholder="e.g. 9811122233"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                />
              </div>

              {/* Country */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Country</label>
                <input
                  type="text"
                  disabled
                  value={generalForm.country}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-md text-xs font-semibold text-slate-500 cursor-not-allowed"
                />
              </div>

              {/* Coordinates */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Store Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={generalForm.lat}
                  onChange={(e) => setGeneralForm({ ...generalForm, lat: e.target.value })}
                  placeholder="30.7046"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-mono font-medium text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Store Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={generalForm.lng}
                  onChange={(e) => setGeneralForm({ ...generalForm, lng: e.target.value })}
                  placeholder="76.7179"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-mono font-medium text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                />
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: LOGISTICS & SERVICES                               */}
        {/* ========================================================= */}
        {activeTab === 'operations' && (
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100">
              Delivery Modes & Facility Toggles
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* 24x7 Open Toggle */}
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase">24x7 Operations</h3>
                  <p className="text-[11px] text-slate-500 mt-1">Open 24 hours every day including weekends</p>
                </div>
                <div className="pt-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">{opsForm.is24x7 ? 'Enabled' : 'Disabled'}</span>
                  <input
                    type="checkbox"
                    checked={opsForm.is24x7}
                    onChange={(e) => setOpsForm({ ...opsForm, is24x7: e.target.checked })}
                    className="w-4 h-4 accent-[#3d3f96] cursor-pointer"
                  />
                </div>
              </div>

              {/* Home Delivery Available */}
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase">Home Delivery</h3>
                  <p className="text-[11px] text-slate-500 mt-1">Offer local prescription delivery to customer addresses</p>
                </div>
                <div className="pt-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">{opsForm.isHomeDeliveryAvailable ? 'Active' : 'Inactive'}</span>
                  <input
                    type="checkbox"
                    checked={opsForm.isHomeDeliveryAvailable}
                    onChange={(e) => setOpsForm({ ...opsForm, isHomeDeliveryAvailable: e.target.checked })}
                    className="w-4 h-4 accent-[#3d3f96] cursor-pointer"
                  />
                </div>
              </div>

              {/* Rapid Delivery */}
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase">Rapid 60-Min Delivery</h3>
                  <p className="text-[11px] text-slate-500 mt-1">Express urgent delivery for priority medicines</p>
                </div>
                <div className="pt-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">{opsForm.isRapidServiceAvailable ? 'Active' : 'Inactive'}</span>
                  <input
                    type="checkbox"
                    checked={opsForm.isRapidServiceAvailable}
                    onChange={(e) => setOpsForm({ ...opsForm, isRapidServiceAvailable: e.target.checked })}
                    className="w-4 h-4 accent-[#3d3f96] cursor-pointer"
                  />
                </div>
              </div>

              {/* Insurance Accepted */}
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase">Cashless Insurance</h3>
                  <p className="text-[11px] text-slate-500 mt-1">Direct tie-ups with health insurance TPAs</p>
                </div>
                <div className="pt-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">{opsForm.isInsuranceAccepted ? 'Accepted' : 'No'}</span>
                  <input
                    type="checkbox"
                    checked={opsForm.isInsuranceAccepted}
                    onChange={(e) => setOpsForm({ ...opsForm, isInsuranceAccepted: e.target.checked })}
                    className="w-4 h-4 accent-[#3d3f96] cursor-pointer"
                  />
                </div>
              </div>

            </div>

            {/* Accepted Insurances Tag Manager */}
            {opsForm.isInsuranceAccepted && (
              <div className="space-y-3 pt-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Accepted Insurance Providers
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newInsuranceInput}
                    onChange={(e) => setNewInsuranceInput(e.target.value)}
                    placeholder="e.g. Star Health, HDFC ERGO, Care Health"
                    className="max-w-md px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                  />
                  <button
                    onClick={handleAddInsurance}
                    className="px-3.5 py-2 bg-[#3d3f96] hover:bg-[#2d2f75] text-white rounded-md text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {opsForm.acceptedInsurances.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium"
                    >
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveInsurance(idx)}
                        className="hover:text-rose-600 transition-colors"
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}
                  {opsForm.acceptedInsurances.length === 0 && (
                    <span className="text-xs text-slate-400 italic">No insurance providers listed yet.</span>
                  )}
                </div>
              </div>
            )}

            {/* Read-only Hours info */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
              <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider block">Timings Record</span>
              <p className="text-slate-600">
                Opening Time: <span className="font-semibold text-slate-800">{rawProfile?.openingTime || '09:00 AM'}</span> |
                Closing Time: <span className="font-semibold text-slate-800"> {rawProfile?.closeTime || '09:00 PM'}</span> |
                Scheduled Weekly Holiday: <span className="font-semibold text-slate-800"> {rawProfile?.holiday || 'None'}</span>
              </p>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: CORPORATE & TAX COMPLIANCE                         */}
        {/* ========================================================= */}
        {activeTab === 'compliance' && (
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Statutory Licensure & Tax Details
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Government regulatory credentials for medicine dispensing and GST invoicing.
              </p>
            </div>

            {/* TAX SELECTION MODE TOGGLE */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Tax Registration Structure (Either/Or Mandate)
                </span>
                <div className="flex items-center gap-4 text-xs font-bold">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="taxMode"
                      value="gst"
                      checked={complianceForm.taxType === 'gst'}
                      onChange={() => setComplianceForm({ ...complianceForm, taxType: 'gst' })}
                      className="accent-[#3d3f96]"
                    />
                    <span>Option A: GST Number (Preferred)</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="taxMode"
                      value="tan_pan"
                      checked={complianceForm.taxType === 'tan_pan'}
                      onChange={() => setComplianceForm({ ...complianceForm, taxType: 'tan_pan' })}
                      className="accent-[#3d3f96]"
                    />
                    <span>Option B: Both TAN & PAN</span>
                  </label>
                </div>
              </div>

              {complianceForm.taxType === 'gst' ? (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    15-Digit GSTIN Number *
                  </label>
                  <input
                    type="text"
                    maxLength={15}
                    value={complianceForm.gstNumber}
                    onChange={(e) => setComplianceForm({ ...complianceForm, gstNumber: e.target.value.toUpperCase().replace(/\s+/g, '') })}
                    placeholder="e.g. 03AAAAA0000A1Z5"
                    className="w-full max-w-md px-3.5 py-2.5 bg-white border border-slate-200 rounded-md text-xs font-mono font-bold text-slate-800 outline-none focus:border-[#3d3f96] transition-all"
                  />
                  <p className="text-[11px] text-slate-400">Goods and Services Tax Identification Number</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      10-Digit TAN Number *
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      value={complianceForm.tanNumber}
                      onChange={(e) => setComplianceForm({ ...complianceForm, tanNumber: e.target.value.toUpperCase().replace(/\s+/g, '') })}
                      placeholder="e.g. PTLK12345C"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-md text-xs font-mono font-bold text-slate-800 outline-none focus:border-[#3d3f96] transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      10-Digit PAN Number *
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      value={complianceForm.panNumber}
                      onChange={(e) => setComplianceForm({ ...complianceForm, panNumber: e.target.value.toUpperCase().replace(/\s+/g, '') })}
                      placeholder="e.g. ABCDE1234F"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-md text-xs font-mono font-bold text-slate-800 outline-none focus:border-[#3d3f96] transition-all"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Corporate & License Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">

              {/* CIN Number */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Corporate Identity Number (CIN)
                </label>
                <input
                  type="text"
                  value={complianceForm.cinNumber}
                  onChange={(e) => setComplianceForm({ ...complianceForm, cinNumber: e.target.value.toUpperCase().replace(/\s+/g, '') })}
                  placeholder="e.g. U74999PB2026PTC123456"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-mono font-semibold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                />
                <p className="text-[10px] text-slate-400">Leave empty if operating as an unregistered proprietorship.</p>
              </div>

              {/* Drug License Type */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Drug License Type
                </label>
                <select
                  value={complianceForm.drugLicenseType}
                  onChange={(e) => setComplianceForm({ ...complianceForm, drugLicenseType: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                >
                  <option value="Retail">Retail Chemist</option>
                  <option value="Wholesale">Wholesale Distributor</option>
                  <option value="Restricted">Restricted</option>
                  <option value="Blood Bank">Blood Bank</option>
                  <option value="None">None</option>
                </select>
              </div>

              {/* Drug License Number */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Form 20B/21B Drug License Number *
                </label>
                <input
                  type="text"
                  value={complianceForm.drugLicenseNumber}
                  onChange={(e) => setComplianceForm({ ...complianceForm, drugLicenseNumber: e.target.value })}
                  placeholder="e.g. 20B/21B-PB-12345"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                />
              </div>

              {/* FSSAI License Number */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  FSSAI Food License Number
                </label>
                <input
                  type="text"
                  value={complianceForm.foodLicenseNumber}
                  onChange={(e) => setComplianceForm({ ...complianceForm, foodLicenseNumber: e.target.value.replace(/\s+/g, '') })}
                  placeholder="e.g. 122200260001"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                />
              </div>

              {/* Issuing Authority */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Drug Licensing Issuing Authority
                </label>
                <input
                  type="text"
                  value={complianceForm.issuingAuthority}
                  onChange={(e) => setComplianceForm({ ...complianceForm, issuingAuthority: e.target.value })}
                  placeholder="e.g. State Drugs Standard Control Organization, Punjab"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                />
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: MEDIA & ATTACHMENTS                                */}
        {/* ========================================================= */}
        {activeTab === 'media' && (
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100">
              Identity Proofs & Storefront Assets
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Profile Image / Storefront Logo */}
              <div className="p-4 border border-slate-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Storefront Photo / Logo</h3>
                  <span className="text-[10px] text-slate-400 font-bold">Max 5MB (.jpg, .png)</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center">
                    {profileImagePreview ? (
                      <img
                        src={profileImagePreview}
                        alt="Logo"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://placehold.co/100x100?text=Logo';
                        }}
                      />
                    ) : (
                      <Camera size={24} className="text-slate-300" />
                    )}
                  </div>
                  <div>
                    <label className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-md inline-block cursor-pointer transition-colors">
                      Choose New Image
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleProfileImageChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-slate-400 mt-1">Displayed to patients searching for local pharmacies.</p>
                  </div>
                </div>
              </div>

              {/* Pharmacist Signature / Stamp for Invoices */}
              <div className="p-4 border border-slate-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Pharmacist Signature / Stamp</h3>
                  <span className="text-[10px] text-slate-400 font-bold">Max 5MB (.png, .jpg)</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-28 h-20 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center p-1">
                    {signatureImagePreview ? (
                      <img
                        src={signatureImagePreview}
                        alt="Signature"
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://placehold.co/120x80?text=Sign';
                        }}
                      />
                    ) : (
                      <FileText size={24} className="text-slate-300" />
                    )}
                  </div>
                  <div>
                    <label className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-md inline-block cursor-pointer transition-colors">
                      Upload Signature
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleSignatureImageChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-slate-400 mt-1">Used on computerized patient bills and tax invoices.</p>
                  </div>
                </div>
              </div>

              {/* Scanned Drug Licenses */}
              <div className="p-4 border border-slate-200 rounded-lg space-y-3 md:col-span-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Scanned Drug License Certificates</h3>
                  <span className="text-[10px] text-slate-400 font-bold">Up to 5 files (.pdf, .jpg)</span>
                </div>
                <input
                  type="file"
                  multiple
                  accept=".pdf, image/png, image/jpeg"
                  onChange={handleDrugLicensesChange}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-[#3d3f96]/10 file:text-[#3d3f96] hover:file:bg-[#3d3f96]/20 cursor-pointer"
                />
                {drugLicenseFiles.length > 0 && (
                  <p className="text-[11px] font-semibold text-slate-600">{drugLicenseFiles.length} file(s) queued for upload.</p>
                )}

                {/* Display Current Active Drug License Files */}
                {rawProfile?.documents?.drugLicenses && rawProfile.documents.drugLicenses.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      Active Stored License Documents ({rawProfile.documents.drugLicenses.length}):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {rawProfile.documents.drugLicenses.map((docPath, index) => {
                        const fileUrl = getImageUrl(docPath);
                        return (
                          <a
                            key={index}
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-xs font-semibold text-[#3d3f96] hover:bg-slate-100 transition-colors"
                          >
                            <FileCheck size={13} />
                            <span>Document {index + 1}</span>
                            <ExternalLink size={12} className="text-slate-400" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Store Showcase Images */}
              <div className="p-4 border border-slate-200 rounded-lg space-y-3 md:col-span-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Pharmacy Aisle / Storefront Showcase</h3>
                  <span className="text-[10px] text-slate-400 font-bold">Up to 10 photos</span>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handlePharmacyImagesChange}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-[#3d3f96]/10 file:text-[#3d3f96] hover:file:bg-[#3d3f96]/20 cursor-pointer"
                />
                {pharmacyImageFiles.length > 0 && (
                  <p className="text-[11px] font-semibold text-slate-600">{pharmacyImageFiles.length} new photo(s) selected for submission.</p>
                )}

                {/* Display Current Active Showcase Photos */}
                {rawProfile?.documents?.pharmacyImages && rawProfile.documents.pharmacyImages.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      Currently Published Gallery ({rawProfile.documents.pharmacyImages.length}):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {rawProfile.documents.pharmacyImages.map((imgPath, index) => {
                        const resolvedImg = getImageUrl(imgPath);
                        return (
                          <div key={index} className="aspect-video rounded-md border border-slate-200 bg-slate-50 overflow-hidden relative group">
                            <img
                              src={resolvedImg}
                              alt={`Showcase ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = 'https://placehold.co/120x80?text=Preview';
                              }}
                            />
                            <a
                              href={resolvedImg}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1"
                            >
                              <ExternalLink size={14} />
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: BANK DETAILS (READ-ONLY)                           */}
        {/* ========================================================= */}
        {activeTab === 'bank' && (
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                  Settlement & Payout Bank Account
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Earnings from online orders are settled directly into this account.
                </p>
              </div>

              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold border ${rawProfile?.bankDetails?.isVerified
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                {rawProfile?.bankDetails?.isVerified ? <CheckCircle size={12} /> : <ShieldAlert size={12} />}
                {rawProfile?.bankDetails?.isVerified ? 'Verified by Admin' : 'Unverified'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Holder Name</span>
                <p className="text-xs font-bold text-slate-800 mt-1">
                  {rawProfile?.bankDetails?.accountHolderName || '--'}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bank Name</span>
                <p className="text-xs font-bold text-slate-800 mt-1">
                  {rawProfile?.bankDetails?.bankName || '--'}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Number</span>
                <p className="text-xs font-mono font-bold text-slate-800 mt-1">
                  {rawProfile?.bankDetails?.accountNumber || '--'}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">IFSC Code</span>
                <p className="text-xs font-mono font-bold text-slate-800 mt-1">
                  {rawProfile?.bankDetails?.ifscCode || '--'}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Type</span>
                <p className="text-xs font-bold text-slate-800 mt-1">
                  {rawProfile?.bankDetails?.accountType || 'Current'}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">UPI ID / VPA</span>
                <p className="text-xs font-bold text-slate-800 mt-1">
                  {rawProfile?.bankDetails?.upiId || '--'}
                </p>
              </div>

            </div>

            <p className="text-xs text-slate-500 pt-2 flex items-center gap-1.5">
              <Info size={14} className="text-slate-400" />
              To change settlement bank details, please contact platform support or submit an account re-verification ticket.
            </p>
          </div>
        )}

        {/* --- BOTTOM FLOATING SUBMIT BAR --- */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-400">
            * Changes to regulatory credentials undergo admin compliance verification.
          </p>

          <button
            onClick={handleSubmitProfile}
            disabled={saving}
            className="px-6 py-2.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>{saving ? 'Submitting Changes...' : 'Save Profile Changes'}</span>
          </button>
        </div>

      </div>
    </main>
  );
}