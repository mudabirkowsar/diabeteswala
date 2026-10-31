"use client";

import React, { useState, useEffect } from 'react';
import {
    Building2,
    ShieldCheck,
    MapPin,
    Phone,
    Mail,
    Clock,
    FileText,
    Camera,
    Upload,
    CheckCircle2,
    AlertCircle,
    Info,
    RefreshCw,
    Loader2,
    PenTool,
    Save,
    Landmark,
    Plus,
    X,
    Sparkles
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Import Lab Vendor API service functions
import LabVendorAPI from '../../../../services/LabVendorAPI';

// Helper to resolve backend image paths
export const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('blob:') || path.startsWith('http://') || path.startsWith('https://')) return path;
    const base = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.1.10:5002').replace(/\/+$/, '');
    const clean = path.replace(/^public\//, '').replace(/^\/+/, '');
    return `${base}/${clean}`;
};

export default function LabProfilePage() {
    // --- Data States ---
    const [profile, setProfile] = useState(null);
    const [updateStatus, setUpdateStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // --- Form States ---
    const [name, setName] = useState('');
    const [about, setAbout] = useState('');
    const [alternatePhone, setAlternatePhone] = useState('');
    const [nablNumber, setNablNumber] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [country, setCountry] = useState('India');
    const [lat, setLat] = useState('');
    const [lng, setLng] = useState('');

    // Feature Toggles
    const [isHomeCollectionAvailable, setIsHomeCollectionAvailable] = useState(false);
    const [isRapidServiceAvailable, setIsRapidServiceAvailable] = useState(false);
    const [isInsuranceAccepted, setIsInsuranceAccepted] = useState(false);
    const [is24x7, setIs24x7] = useState(false);

    // Accepted Insurances list
    const [insurances, setInsurances] = useState([]);
    const [insuranceInput, setInsuranceInput] = useState('');

    // Files & Previews
    const [profileImageFile, setProfileImageFile] = useState(null);
    const [profileImagePreview, setProfileImagePreview] = useState('');
    const [signatureImageFile, setSignatureImageFile] = useState(null);
    const [signatureImagePreview, setSignatureImagePreview] = useState('');

    // --- 1. Fetch Profile & Review Status ---
    const fetchData = async () => {
        setLoading(true);
        try {
            const [profileRes, statusRes] = await Promise.all([
                LabVendorAPI.labVendorGetProfile(),
                LabVendorAPI.labVendorGetProfileUpdateStatus()
            ]);

            if (profileRes && profileRes.success && profileRes.data) {
                const data = profileRes.data;
                setProfile(data);

                // Populate Form Fields
                setName(data.name || '');
                setAbout(data.about || '');
                setAlternatePhone(data.alternatePhone || '');
                setNablNumber(data.documents?.nablNumber || data.nablNumber || '');
                setAddress(data.address || '');
                setCity(data.city || '');
                setState(data.state || '');
                setCountry(data.country || 'India');
                setLat(data.location?.lat !== undefined ? String(data.location.lat) : '');
                setLng(data.location?.lng !== undefined ? String(data.location.lng) : '');

                setIsHomeCollectionAvailable(Boolean(data.isHomeCollectionAvailable));
                setIsRapidServiceAvailable(Boolean(data.isRapidServiceAvailable));
                setIsInsuranceAccepted(Boolean(data.isInsuranceAccepted));
                setIs24x7(Boolean(data.is24x7));

                setInsurances(Array.isArray(data.acceptedInsurances) ? data.acceptedInsurances : []);

                // Existing Images Preview
                if (data.profileImage) setProfileImagePreview(getImageUrl(data.profileImage));
                if (data.signatureImage) setSignatureImagePreview(getImageUrl(data.signatureImage));
            } else {
                toast.error("Failed to load lab profile.");
            }

            if (statusRes && statusRes.success) {
                setUpdateStatus(statusRes.data);
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Error fetching profile information.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- Handle Image Upload Selects ---
    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Profile picture must be under 5MB");
                return;
            }
            setProfileImageFile(file);
            setProfileImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSignatureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Signature image must be under 5MB");
                return;
            }
            setSignatureImageFile(file);
            setSignatureImagePreview(URL.createObjectURL(file));
        }
    };

    // --- Insurance Tag Handlers ---
    const handleAddInsurance = (e) => {
        e.preventDefault();
        const trimmed = insuranceInput.trim();
        if (!trimmed) return;
        if (insurances.includes(trimmed)) {
            toast.error("Insurance provider already added");
            return;
        }
        setInsurances(prev => [...prev, trimmed]);
        setInsuranceInput('');
    };

    const handleRemoveInsurance = (indexToRemove) => {
        setInsurances(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    // --- 2. Submit Profile Update (Multipart Form) ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Lab business name is required.");
            return;
        }

        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('name', name.trim());
            formData.append('about', about.trim());
            formData.append('address', address.trim());
            formData.append('city', city.trim());
            formData.append('state', state.trim());
            formData.append('country', country.trim());
            if (alternatePhone.trim()) formData.append('alternatePhone', alternatePhone.trim());
            if (nablNumber.trim()) formData.append('nablNumber', nablNumber.trim().toUpperCase());

            if (lat !== '') formData.append('lat', parseFloat(lat) || 0);
            if (lng !== '') formData.append('lng', parseFloat(lng) || 0);

            // Boolean Flags as String values
            formData.append('isHomeCollectionAvailable', String(isHomeCollectionAvailable));
            formData.append('isRapidServiceAvailable', String(isRapidServiceAvailable));
            formData.append('isInsuranceAccepted', String(isInsuranceAccepted));
            formData.append('is24x7', String(is24x7));

            // Accepted Insurances as JSON stringified array
            formData.append('acceptedInsurances', JSON.stringify(insurances));

            // Replacement files
            if (profileImageFile) formData.append('profileImage', profileImageFile);
            if (signatureImageFile) formData.append('signatureImage', signatureImageFile);

            const res = await LabVendorAPI.labVendorUpdateProfile(formData);

            if (res && res.success) {
                toast.success(res.message || "Profile changes submitted to Admin for review!");
                fetchData();
            } else {
                toast.error(res?.message || "Failed to update profile.");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Error submitting profile update.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 py-6 pb-16 antialiased select-none text-left">
            <Toaster position="top-right" />

            {/* --- HEADER SECTION --- */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-3xl bg-[#3d3f96]/10 text-[#3d3f96] flex items-center justify-center border border-[#3d3f96]/10 shrink-0 shadow-sm">
                        <Building2 className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                            Lab Profile &amp; Accreditations
                        </h1>
                        <p className="text-xs text-slate-500 font-bold mt-1">
                            Supervise your diagnostic center details, NABL licensing, digital signatures, and collection services.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="p-3.5 rounded-2xl border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 shadow-sm transition-all duration-150 cursor-pointer disabled:opacity-50"
                        title="Reload profile"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* --- REVIEW STATUS BANNERS --- */}
            {updateStatus && updateStatus.status === 'Pending' && (
                <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 flex items-start gap-4 text-amber-900 shadow-sm">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-200">
                        <Clock size={20} />
                    </div>
                    <div className="space-y-1">
                        <h4 className="font-extrabold text-sm sm:text-base tracking-tight">
                            Profile Changes Under Admin Verification
                        </h4>
                        <p className="text-xs text-amber-800 font-medium leading-relaxed">
                            Your latest updates submitted on <strong className="font-mono font-bold">{new Date(updateStatus.createdAt).toLocaleDateString()}</strong> are currently being reviewed by the platform administration team. Your live profile will automatically update upon approval.
                        </p>
                    </div>
                </div>
            )}

            {updateStatus && updateStatus.status === 'Rejected' && (
                <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 flex items-start gap-4 text-rose-900 shadow-sm">
                    <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-200">
                        <AlertCircle size={20} />
                    </div>
                    <div className="space-y-1">
                        <h4 className="font-extrabold text-sm sm:text-base tracking-tight">
                            Previous Profile Update Rejected
                        </h4>
                        <p className="text-xs text-rose-800 font-semibold leading-relaxed">
                            Reason: <span className="font-bold underline">{updateStatus.rejectionReason || "Please verify your submitted documentation and credentials."}</span>
                        </p>
                        <p className="text-[11px] text-rose-600 font-medium">
                            Please make the necessary corrections below and re-submit your profile for review.
                        </p>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Loading Diagnostic Center Dossier...
                    </p>
                </div>
            ) : profile ? (
                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* --- TOP PROFILE HERO CARD --- */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                            {/* Profile Picture Upload Container */}
                            <div className="relative group shrink-0">
                                <div className="w-24 h-24 rounded-3xl border-2 border-dashed border-[#3d3f96]/30 bg-slate-50 overflow-hidden flex items-center justify-center shadow-inner">
                                    {profileImagePreview ? (
                                        <img
                                            src={profileImagePreview}
                                            alt={profile.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src = 'https://placehold.co/120x120?text=Lab';
                                            }}
                                        />
                                    ) : (
                                        <Building2 size={36} className="text-slate-300" />
                                    )}
                                </div>
                                <label className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-[#3d3f96] hover:bg-[#2d2f75] text-white shadow-md cursor-pointer transition-all active:scale-95">
                                    <Camera size={14} />
                                    <input
                                        type="file"
                                        accept="image/png, image/jpeg"
                                        className="hidden"
                                        onChange={handleProfilePicChange}
                                    />
                                </label>
                            </div>

                            {/* Essential Details */}
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2.5 flex-wrap">
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                        {profile.name}
                                    </h2>
                                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg border bg-emerald-50 text-emerald-700 border-emerald-200">
                                        {profile.profileStatus || "Approved"}
                                    </span>
                                    {profile.isOnline && (
                                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg border bg-indigo-50 text-[#3d3f96] border-indigo-100 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#3d3f96] animate-pulse" /> Live on app
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 flex-wrap">
                                    <span className="flex items-center gap-1.5">
                                        <Mail size={13} className="text-slate-400" /> {profile.email}
                                    </span>
                                    <span className="flex items-center gap-1.5 font-mono">
                                        <Phone size={13} className="text-slate-400" /> {profile.phone}
                                    </span>
                                    {profile.rating > 0 && (
                                        <span className="text-amber-600 font-bold flex items-center gap-1">
                                            ★ {profile.rating} ({profile.totalReviews} reviews)
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Save Action Button */}
                        <div className="self-end sm:self-center">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-7 py-3.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold text-xs rounded-2xl transition-all shadow-lg shadow-indigo-950/10 flex items-center gap-2 cursor-pointer disabled:opacity-70"
                            >
                                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                                <span>{saving ? 'Saving Changes...' : 'SUBMIT FOR APPROVAL'}</span>
                            </button>
                        </div>
                    </div>

                    {/* --- MAIN GRID LAYOUT --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* --- LEFT 2 COLS: EDITABLE FORM FIELDS --- */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Section 1: Business Identity & Accreditation */}
                            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-5">
                                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#3d3f96] flex items-center justify-center shrink-0">
                                        <FileText size={16} />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight uppercase">
                                            1. Diagnostic Identity &amp; Accreditation
                                        </h3>
                                        <p className="text-[11px] text-slate-400 font-semibold">
                                            Official center display name, statutory bio, and accreditation UID
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    
                                    {/* Lab Name */}
                                    <div className="space-y-1 sm:col-span-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                                            Lab Business Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="e.g. Apex Clinical Diagnostics"
                                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-[#3d3f96]"
                                        />
                                    </div>

                                    {/* Alternate Phone */}
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                                            Emergency / Alternate Mobile
                                        </label>
                                        <input
                                            type="tel"
                                            maxLength={10}
                                            value={alternatePhone}
                                            onChange={(e) => setAlternatePhone(e.target.value.replace(/\D/g, ''))}
                                            placeholder="10-digit number"
                                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-[#3d3f96]"
                                        />
                                    </div>

                                    {/* NABL Accreditation Number */}
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                                            NABL Accreditation UID
                                        </label>
                                        <input
                                            type="text"
                                            value={nablNumber}
                                            onChange={(e) => setNablNumber(e.target.value.toUpperCase())}
                                            placeholder="e.g. MC-1234-XYZ"
                                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-[#3d3f96] uppercase"
                                        />
                                    </div>

                                    {/* About & Bio */}
                                    <div className="space-y-1 sm:col-span-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                                            About Center / Bio for Patients
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={about}
                                            onChange={(e) => setAbout(e.target.value)}
                                            placeholder="Provide a concise description of testing equipment, pathologist experience, and diagnostic quality standards..."
                                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-[#3d3f96]"
                                        />
                                    </div>

                                </div>
                            </div>

                            {/* Section 2: Address & Geographic Location */}
                            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-5">
                                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#3d3f96] flex items-center justify-center shrink-0">
                                        <MapPin size={16} />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight uppercase">
                                            2. Physical Address &amp; Coordinates
                                        </h3>
                                        <p className="text-[11px] text-slate-400 font-semibold">
                                            Premises street address and latitude/longitude coordinates for patient navigation
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    
                                    {/* Street Address */}
                                    <div className="space-y-1 sm:col-span-3">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                                            Street Address / Complex Name
                                        </label>
                                        <input
                                            type="text"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            placeholder="e.g. SCO 12, Phase 5, Industrial Area"
                                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-[#3d3f96]"
                                        />
                                    </div>

                                    {/* City */}
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            placeholder="e.g. Mohali"
                                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-[#3d3f96]"
                                        />
                                    </div>

                                    {/* State */}
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                                            State
                                        </label>
                                        <input
                                            type="text"
                                            value={state}
                                            onChange={(e) => setState(e.target.value)}
                                            placeholder="e.g. Punjab"
                                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-[#3d3f96]"
                                        />
                                    </div>

                                    {/* Country */}
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                                            Country
                                        </label>
                                        <input
                                            type="text"
                                            value={country}
                                            onChange={(e) => setCountry(e.target.value)}
                                            placeholder="e.g. India"
                                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-[#3d3f96]"
                                        />
                                    </div>

                                    {/* Latitude */}
                                    <div className="space-y-1 sm:col-span-1.5">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                                            Latitude (GPS)
                                        </label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={lat}
                                            onChange={(e) => setLat(e.target.value)}
                                            placeholder="e.g. 30.7046"
                                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-[#3d3f96]"
                                        />
                                    </div>

                                    {/* Longitude */}
                                    <div className="space-y-1 sm:col-span-1.5">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                                            Longitude (GPS)
                                        </label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={lng}
                                            onChange={(e) => setLng(e.target.value)}
                                            placeholder="e.g. 76.7179"
                                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-[#3d3f96]"
                                        />
                                    </div>

                                </div>
                            </div>

                            {/* Section 3: Diagnostic Facilities & Service Toggles */}
                            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-5">
                                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#3d3f96] flex items-center justify-center shrink-0">
                                        <Sparkles size={16} />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight uppercase">
                                            3. Diagnostic Capabilities &amp; Patient Services
                                        </h3>
                                        <p className="text-[11px] text-slate-400 font-semibold">
                                            Enable patient conveniences like home collection, fast-track testing, and 24x7 support
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    
                                    {/* Home Collection Toggle */}
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                                        <div>
                                            <span className="block text-xs font-black text-slate-800">
                                                Home Sample Collection
                                            </span>
                                            <span className="text-[10px] font-semibold text-slate-400">
                                                Dispatch phlebotomists to patient doorsteps
                                            </span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={isHomeCollectionAvailable}
                                            onChange={(e) => setIsHomeCollectionAvailable(e.target.checked)}
                                            className="w-5 h-5 accent-[#3d3f96] rounded-md cursor-pointer"
                                        />
                                    </div>

                                    {/* Rapid Service Toggle */}
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                                        <div>
                                            <span className="block text-xs font-black text-slate-800">
                                                Rapid / Express Reports
                                            </span>
                                            <span className="text-[10px] font-semibold text-slate-400">
                                                Same-day expedited diagnostic reporting
                                            </span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={isRapidServiceAvailable}
                                            onChange={(e) => setIsRapidServiceAvailable(e.target.checked)}
                                            className="w-5 h-5 accent-[#3d3f96] rounded-md cursor-pointer"
                                        />
                                    </div>

                                    {/* 24x7 Operation Toggle */}
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                                        <div>
                                            <span className="block text-xs font-black text-slate-800">
                                                24x7 Emergency Diagnostics
                                            </span>
                                            <span className="text-[10px] font-semibold text-slate-400">
                                                Open continuously day &amp; night
                                            </span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={is24x7}
                                            onChange={(e) => setIs24x7(e.target.checked)}
                                            className="w-5 h-5 accent-[#3d3f96] rounded-md cursor-pointer"
                                        />
                                    </div>

                                    {/* Insurance Accepted Toggle */}
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                                        <div>
                                            <span className="block text-xs font-black text-slate-800">
                                                Cashless / Health Insurance
                                            </span>
                                            <span className="text-[10px] font-semibold text-slate-400">
                                                Direct cashless diagnostic coverage
                                            </span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={isInsuranceAccepted}
                                            onChange={(e) => setIsInsuranceAccepted(e.target.checked)}
                                            className="w-5 h-5 accent-[#3d3f96] rounded-md cursor-pointer"
                                        />
                                    </div>

                                </div>

                                {/* Insurance Providers Tag Manager */}
                                {isInsuranceAccepted && (
                                    <div className="pt-3 border-t border-slate-100 space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                                            Supported Insurance Networks
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={insuranceInput}
                                                onChange={(e) => setInsuranceInput(e.target.value)}
                                                placeholder="e.g. HDFC ERGO, Star Health, ICICI Lombard"
                                                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-[#3d3f96]"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddInsurance}
                                                className="px-4 py-2.5 bg-[#3d3f96] text-white rounded-xl text-xs font-bold hover:bg-[#2d2f75] transition"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                            {insurances.map((ins, idx) => (
                                                <span
                                                    key={idx}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 text-[#3d3f96] rounded-xl text-xs font-bold"
                                                >
                                                    {ins}
                                                    <X
                                                        size={12}
                                                        className="cursor-pointer hover:text-rose-600"
                                                        onClick={() => handleRemoveInsurance(idx)}
                                                    />
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* --- RIGHT 1 COL: DIGITAL SIGNATURE & VERIFIED SYSTEM DETAILS --- */}
                        <div className="space-y-6">

                            {/* Section 4: Authorized Digital Signature */}
                            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-4">
                                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#3d3f96] flex items-center justify-center shrink-0">
                                        <PenTool size={16} />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-slate-900 text-sm tracking-tight uppercase">
                                            Authorized Signature
                                        </h3>
                                        <p className="text-[10px] text-slate-400 font-semibold">
                                            Affixed to diagnostic test reports &amp; invoices
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="w-full h-32 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden relative">
                                        {signatureImagePreview ? (
                                            <img
                                                src={signatureImagePreview}
                                                alt="Digital Signature"
                                                className="w-full h-full object-contain p-2"
                                            />
                                        ) : (
                                            <span className="text-xs text-slate-400 font-bold italic">
                                                No Signature Uploaded
                                            </span>
                                        )}
                                    </div>

                                    <label className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-sm">
                                        <Upload size={14} />
                                        <span>Upload New Signature</span>
                                        <input
                                            type="file"
                                            accept="image/png, image/jpeg"
                                            className="hidden"
                                            onChange={handleSignatureChange}
                                        />
                                    </label>
                                    <p className="text-[10px] text-slate-400 text-center font-medium">
                                        PNG transparent background recommended (Max 5MB)
                                    </p>
                                </div>
                            </div>

                            {/* Section 5: Operating Hours & Bank Details (Read-only / Audit) */}
                            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-4">
                                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#3d3f96] flex items-center justify-center shrink-0">
                                        <Landmark size={16} />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-slate-900 text-sm tracking-tight uppercase">
                                            Registry &amp; Settlement
                                        </h3>
                                        <p className="text-[10px] text-slate-400 font-semibold">
                                            Configured operational timings &amp; payout ledger
                                        </p>
                                    </div>
                                </div>

                                {/* Operating Hours */}
                                <div className="space-y-2 text-xs">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                                        Operational Schedule
                                    </span>
                                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                                        <div className="flex justify-between font-bold text-slate-700">
                                            <span>Hours:</span>
                                            <span className="font-mono">{profile.openingTime || '09:00 AM'} - {profile.closeTime || '09:00 PM'}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-slate-700">
                                            <span>Weekly Off:</span>
                                            <span className="text-rose-600 font-semibold">{profile.holiday || 'Sunday'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Bank Account for Payouts */}
                                <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                            Bank Settlement Account
                                        </span>
                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                                            profile.bankDetails?.isVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                            {profile.bankDetails?.isVerified ? 'Verified' : 'Unverified'}
                                        </span>
                                    </div>

                                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 font-mono text-slate-700 text-[11px] font-bold">
                                        <div className="flex justify-between">
                                            <span className="text-slate-400 font-sans">Bank:</span>
                                            <span>{profile.bankDetails?.bankName || '--'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400 font-sans">A/C No:</span>
                                            <span>{profile.bankDetails?.accountNumber || '--'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400 font-sans">IFSC:</span>
                                            <span>{profile.bankDetails?.ifscCode || '--'}</span>
                                        </div>
                                        {profile.bankDetails?.upiId && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-400 font-sans">UPI ID:</span>
                                                <span>{profile.bankDetails.upiId}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>

                        </div>

                    </div>

                </form>
            ) : (
                <div className="flex flex-col items-center justify-center p-24 text-center bg-white rounded-3xl border border-slate-100 shadow-sm border-dashed">
                    <Building2 size={40} className="text-slate-300 mb-3" />
                    <p className="font-bold text-slate-700">Lab Profile Unavailable</p>
                    <p className="text-xs text-slate-400 mt-1">
                        Unable to load laboratory profile details. Please refresh the page.
                    </p>
                </div>
            )}

        </div>
    );
}