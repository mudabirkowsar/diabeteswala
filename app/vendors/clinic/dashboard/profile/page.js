"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    User, Mail, Phone, Building, Award, ShieldCheck, MapPin,
    CreditCard, Clock, Calendar, Image as ImageIcon, FileText, Loader2, CheckCircle2,
    AlertCircle, Globe, ToggleLeft, ToggleRight, ArrowRight, X, Edit3,
    Upload, Plus, Trash2, ExternalLink, RefreshCw, Layers, Check, Info
} from 'lucide-react';
import { useNotification } from '../../../../context/NotificationContext';
import ClinicAPI from '../../../../services/ClinicAPI';
import { useRouter } from 'next/navigation';

export default function ClinicProfilePage() {
    const router = useRouter();

    // --- Safe Context Extraction & Fallback ---
    const notificationContext = useNotification();
    const [localAlert, setLocalAlert] = useState(null);

    const triggerNotification = (message, type = 'info') => {
        if (notificationContext && typeof notificationContext.showNotification === 'function') {
            notificationContext.showNotification(message, type);
        } else {
            setLocalAlert({ message, type });
            setTimeout(() => setLocalAlert(null), 4000);
        }
    };

    // --- State Management ---
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profile, setProfile] = useState(null);
    const [pendingRequest, setPendingRequest] = useState(null);
    const [togglingStatus, setTogglingStatus] = useState(false);

    // --- Modal / Edit Form State ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('basic'); // 'basic' | 'location' | 'credentials' | 'documents' | 'bank'
    const [submitting, setSubmitting] = useState(false);

    // Form inputs state
    const [formData, setFormData] = useState({
        name: '',
        clinicName: '',
        experience: '',
        About: '',
        address: '',
        city: '',
        state: '',
        country: 'India',
        zipCode: '',
        lat: '',
        lng: '',
        licenseNumber: '',
        councilName: '',
        councilNumber: '',
        bankName: '',
        accountNumber: '',
        ifscCode: ''
    });

    // File attachments state
    const [fileInputs, setFileInputs] = useState({
        image: null,
        posterimage: null,
        certificateImage: null,
        licenceCertificate: null,
        clinicImages: [],
        achievementImages: [],
        licenseDocument: [],
        otherDocuments: []
    });

    // File preview URLs state
    const [previews, setPreviews] = useState({
        image: null,
        posterimage: null,
        certificateImage: null,
        licenceCertificate: null
    });

    // --- Fetch Data ---
    const fetchInitialData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch profile and pending status in parallel
            const [profileRes, statusRes] = await Promise.allSettled([
                ClinicAPI.getClinicProfile(),
                ClinicAPI.getClinicProfileUpdateStatus()
            ]);

            if (profileRes.status === 'fulfilled' && profileRes.value?.success && profileRes.value?.data) {
                const profileData = profileRes.value.data;
                setProfile(profileData);
                syncFormData(profileData);
            } else {
                setError("Failed to fetch clinic profile data.");
            }

            if (statusRes.status === 'fulfilled' && statusRes.value?.hasPendingRequest) {
                setPendingRequest(statusRes.value.data || statusRes.value.requestDetails || null);
            } else {
                setPendingRequest(null);
            }
        } catch (err) {
            const errMsg = err.response?.data?.message || "An error occurred while loading your profile.";
            setError(errMsg);
            triggerNotification(errMsg, "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    // Sync state for edit form
    const syncFormData = (data) => {
        const coords = data.location?.coordinates || [];
        setFormData({
            name: data.name || '',
            clinicName: data.clinicName || '',
            experience: data.experience || '',
            About: data.About || '',
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            country: data.country || 'India',
            zipCode: data.zipCode || '',
            lng: coords[0] !== undefined ? String(coords[0]) : '',
            lat: coords[1] !== undefined ? String(coords[1]) : '',
            licenseNumber: data.licenseNumber || '',
            councilName: data.councilName || '',
            councilNumber: data.councilNumber || '',
            bankName: '',
            accountNumber: '',
            ifscCode: ''
        });
    };

    // --- Instant Online/Active Status Toggle API ---
    const handleToggleActive = async () => {
        if (!profile || togglingStatus) return;
        const newStatus = !profile.isActive;
        try {
            setTogglingStatus(true);
            const response = await ClinicAPI.toggleClinicOnlineStatus({ isActive: newStatus });
            if (response.success) {
                setProfile((prev) => ({ ...prev, isActive: newStatus }));
                triggerNotification(response.message || `Clinic status changed to ${newStatus ? 'Active' : 'Inactive'}.`, "success");
            } else {
                triggerNotification("Failed to update status", "error");
            }
        } catch (err) {
            const errMsg = err.response?.data?.message || "Status toggle failed.";
            triggerNotification(errMsg, "error");
        } finally {
            setTogglingStatus(false);
        }
    };

    // --- Handle Single File Change ---
    const handleSingleFileChange = (field, file) => {
        if (!file) return;
        setFileInputs((prev) => ({ ...prev, [field]: file }));
        if (file.type.startsWith('image/')) {
            const previewUrl = URL.createObjectURL(file);
            setPreviews((prev) => ({ ...prev, [field]: previewUrl }));
        }
    };

    // --- Handle Multiple Files Change ---
    const handleMultipleFileChange = (field, filesList, maxLimit = 10) => {
        const filesArray = Array.from(filesList);
        setFileInputs((prev) => {
            const combined = [...prev[field], ...filesArray].slice(0, maxLimit);
            return { ...prev, [field]: combined };
        });
    };

    const removeMultiFile = (field, index) => {
        setFileInputs((prev) => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    // --- Submit Update Profile Request (Multipart Form-Data) ---
    const handleSubmitUpdate = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const fd = new FormData();

            // Text fields
            Object.entries(formData).forEach(([key, val]) => {
                if (val && !['lat', 'lng', 'bankName', 'accountNumber', 'ifscCode'].includes(key)) {
                    fd.append(key, val);
                }
            });

            // GeoJSON Location
            if (formData.lat && formData.lng) {
                const locationObj = {
                    type: "Point",
                    coordinates: [parseFloat(formData.lng) || 0, parseFloat(formData.lat) || 0]
                };
                fd.append('location', JSON.stringify(locationObj));
            }

            // Bank Details
            if (formData.bankName || formData.accountNumber || formData.ifscCode) {
                const bankObj = {
                    bankName: formData.bankName,
                    accountNumber: formData.accountNumber,
                    ifscCode: formData.ifscCode
                };
                fd.append('bankDetails', JSON.stringify(bankObj));
            }

            // Single Files
            if (fileInputs.image) fd.append('image', fileInputs.image);
            if (fileInputs.posterimage) fd.append('posterimage', fileInputs.posterimage);
            if (fileInputs.certificateImage) fd.append('certificateImage', fileInputs.certificateImage);
            if (fileInputs.licenceCertificate) fd.append('licenceCertificate', fileInputs.licenceCertificate);

            // Multi Files
            fileInputs.clinicImages.forEach((f) => fd.append('clinicImages', f));
            fileInputs.achievementImages.forEach((f) => fd.append('achievementImages', f));
            fileInputs.licenseDocument.forEach((f) => fd.append('licenseDocument', f));
            fileInputs.otherDocuments.forEach((f) => fd.append('otherDocuments', f));

            const response = await ClinicAPI.updateClinicProfile(fd);

            if (response.success) {
                triggerNotification(response.message || "Update submitted for admin approval!", "success");
                setIsEditModalOpen(false);
                // Reset file selections
                setFileInputs({
                    image: null,
                    posterimage: null,
                    certificateImage: null,
                    licenceCertificate: null,
                    clinicImages: [],
                    achievementImages: [],
                    licenseDocument: [],
                    otherDocuments: []
                });
                // Re-fetch details to sync review banners
                await fetchInitialData();
            } else {
                triggerNotification(response.message || "Failed to update profile", "error");
            }
        } catch (err) {
            const errMsg = err.response?.data?.message || "Failed to submit profile updates.";
            triggerNotification(errMsg, "error");
        } finally {
            setSubmitting(false);
        }
    };

    // Format Date Utility
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Helper for Badges
    const getVerificationBadge = (status) => {
        const s = status || 'Incomplete';
        if (s === 'Approved') {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <CheckCircle2 size={13} /> Approved
                </span>
            );
        }
        if (s === 'Pending') {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-700 border border-amber-100">
                    <Clock size={13} /> Pending Review
                </span>
            );
        }
        if (s === 'Rejected') {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-100">
                    <AlertCircle size={13} /> Rejected
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-slate-50 text-slate-700 border border-slate-100">
                <AlertCircle size={13} /> Incomplete
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center select-none bg-slate-50/50">
                <Loader2 className="animate-spin text-[#3d3f96]" size={42} />
                <p className="text-xs font-black text-slate-400 mt-4 uppercase tracking-widest">Loading Clinic Profile...</p>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50/50">
                <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 max-w-md w-full text-center">
                    <AlertCircle className="text-rose-500 mx-auto mb-4" size={48} />
                    <h3 className="text-lg font-black text-gray-800">Failed to Load Profile</h3>
                    <p className="text-xs text-gray-400 mt-2 leading-relaxed">{error || "Check your network connection."}</p>
                    <button
                        onClick={fetchInitialData}
                        className="w-full mt-6 py-4 rounded-2xl bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={14} /> Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 select-none antialiased relative">

            {/* Local Fallback Alert UI */}
            {localAlert && (
                <div className={`fixed top-6 right-6 z-50 p-4 rounded-2xl shadow-xl border text-xs font-black flex items-center gap-3 animate-bounce ${localAlert.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                    localAlert.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-800' :
                        localAlert.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-800' :
                            'bg-slate-50 border-slate-100 text-slate-800'
                    }`}>
                    <span>{localAlert.message}</span>
                    <button type="button" onClick={() => setLocalAlert(null)} className="text-slate-400 hover:text-slate-600">
                        <X size={14} />
                    </button>
                </div>
            )}

            <div className="max-w-6xl mx-auto space-y-6">

                {/* --- PENDING UPDATE REQUEST NOTICE BANNER --- */}
                {pendingRequest && (
                    <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="p-2.5 bg-amber-100 text-amber-700 rounded-2xl shrink-0 mt-0.5">
                                <Clock size={20} className="animate-spin" />
                            </div>
                            <div>
                                <h4 className="font-black text-sm text-amber-900 flex items-center gap-2">
                                    Profile Update Pending Verification
                                </h4>
                                <p className="text-xs font-semibold text-amber-700/90 mt-1">
                                    You submitted a modification request on <span className="font-black">{formatDate(pendingRequest.createdAt)}</span>. An administrator is verifying your updated details.
                                </p>
                                {pendingRequest.updatedFields && (
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        {Object.keys(pendingRequest.updatedFields).map((fieldKey) => (
                                            <span key={fieldKey} className="px-2 py-0.5 bg-amber-100/80 text-amber-800 text-[10px] font-black rounded-md tracking-wider uppercase">
                                                {fieldKey}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <span className="shrink-0 self-start md:self-center px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-200/70 text-amber-900">
                            Under Review
                        </span>
                    </div>
                )}

                {/* --- REJECTION BANNER --- */}
                {profile.Accountverify === 'Rejected' && (
                    <div className="bg-rose-50 border border-rose-100 rounded-3xl p-6 flex items-start gap-4 text-rose-800 shadow-sm">
                        <AlertCircle className="shrink-0 text-rose-600 mt-0.5" size={22} />
                        <div className="space-y-1">
                            <h4 className="font-black text-sm">Application Rejection Notice</h4>
                            <p className="text-xs font-semibold text-rose-700/90 leading-relaxed">
                                {profile.rejectReason || "Your document submissions were blurry or expired. Please update and re-upload valid credentials."}
                            </p>
                        </div>
                    </div>
                )}

                {/* --- 1. HERO / HEADER BANNER --- */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden relative">
                    <div className="h-48 w-full bg-gradient-to-r from-[#3d3f96] to-[#5558bc] relative">
                        {profile.posterimage && (
                            <img src={profile.posterimage} alt="Poster" className="w-full h-full object-cover" />
                        )}

                        <div className="absolute top-5 right-5 flex items-center gap-3">
                            {/* Online / Active Instant Toggle Button */}
                            <button
                                onClick={handleToggleActive}
                                disabled={togglingStatus}
                                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-md ${profile.isActive
                                        ? 'bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-600'
                                        : 'bg-slate-700 text-slate-200 hover:bg-slate-800'
                                    }`}
                                title="Click to toggle live availability"
                            >
                                {togglingStatus ? (
                                    <Loader2 size={13} className="animate-spin" />
                                ) : profile?.isActive ? (
                                    <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                                ) : (
                                    <span className="w-2 h-2 bg-gray-400 rounded-full" />
                                )}
                                {profile.isActive ? "Live / Active" : "Offline / Inactive"}
                            </button>
                        </div>
                    </div>

                    <div className="p-6 md:p-10 -mt-16 flex flex-col md:flex-row items-center md:items-end justify-between gap-6 border-b border-slate-50">
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-5 text-center md:text-left">
                            <div className="w-28 h-28 rounded-[2rem] bg-white border-4 border-white shadow-md overflow-hidden relative shrink-0">
                                {profile.image ? (
                                    <img src={profile.image} alt={profile.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                                        <Building size={42} />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                                    <h1 className="text-2xl font-black text-gray-800">{profile.name || "Clinic Provider"}</h1>
                                    {getVerificationBadge(profile.Accountverify)}
                                </div>
                                <p className="text-sm font-bold text-slate-400">{profile.clinicName || "Workspace Name Not Set"}</p>
                                <span className="inline-block text-[10px] font-black uppercase tracking-widest text-[#3d3f96] bg-indigo-50 px-2.5 py-1 rounded-lg">
                                    {profile.type || "Clinic"} Workspace
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    syncFormData(profile);
                                    setIsEditModalOpen(true);
                                }}
                                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-indigo-100"
                            >
                                <Edit3 size={15} /> Edit Profile & Documents
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-50/50 grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100 text-center py-4">
                        <div>
                            <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Profile Status</span>
                            <span className="text-xs font-black text-slate-700 block mt-1">{profile.profileStatus || "Incomplete"}</span>
                        </div>
                        <div>
                            <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Consultation Fee</span>
                            <span className="text-xs font-black text-emerald-600 block mt-1">₹{profile.amount || 0}</span>
                        </div>
                        <div>
                            <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Experience</span>
                            <span className="text-xs font-black text-slate-700 block mt-1">{profile.experience || "Not Provided"}</span>
                        </div>
                        <div>
                            <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">System Role</span>
                            <span className="text-xs font-black text-slate-700 block mt-1 capitalize">{profile.role || "Clinic"}</span>
                        </div>
                    </div>
                </div>

                {/* --- 2. MAIN GRID SECTION --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN: GENERAL INFO & GEOGRAPHY */}
                    <div className="lg:col-span-7 space-y-8">

                        {/* GENERAL INFORMATION */}
                        <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100 space-y-6">
                            <div className="flex items-center gap-2 border-b border-gray-50 pb-4">
                                <Building className="text-[#3d3f96]" size={18} />
                                <h3 className="text-base font-black text-gray-800">Clinic General Information</h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 block">Email Address</span>
                                    <div className="flex items-center gap-2 text-xs font-black text-slate-700">
                                        <Mail size={13} className="text-slate-400" />
                                        <span>{profile.email}</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 block">Phone Number</span>
                                    <div className="flex items-center gap-2 text-xs font-black text-slate-700">
                                        <Phone size={13} className="text-slate-400" />
                                        <span>{profile.phoneNumber}</span>
                                    </div>
                                </div>

                                {profile.alternatePhoneNumber && (
                                    <div className="space-y-1">
                                        <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 block">Alternate Phone</span>
                                        <div className="flex items-center gap-2 text-xs font-black text-slate-700">
                                            <Phone size={13} className="text-slate-400" />
                                            <span>{profile.alternatePhoneNumber}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 block">Account Status</span>
                                    <div className="flex items-center gap-2 text-xs font-black">
                                        {profile.isActive ? (
                                            <span className="text-emerald-600 flex items-center gap-1"><ToggleRight size={16} /> Active Account</span>
                                        ) : (
                                            <span className="text-slate-400 flex items-center gap-1"><ToggleLeft size={16} /> Inactive</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {profile.About && (
                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                                    <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 block mb-2">About the Clinic</span>
                                    <p className="text-xs font-semibold text-slate-600 leading-relaxed">{profile.About}</p>
                                </div>
                            )}
                        </div>

                        {/* ADDRESS & GEOGRAPHICAL DETAILS */}
                        <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100 space-y-6">
                            <div className="flex items-center gap-2 border-b border-gray-50 pb-4">
                                <MapPin className="text-[#3d3f96]" size={18} />
                                <h3 className="text-base font-black text-gray-800">Geographical Location</h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="space-y-1">
                                    <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 block">City</span>
                                    <span className="text-xs font-black text-slate-700">{profile.city || "Not Set"}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 block">State</span>
                                    <span className="text-xs font-black text-slate-700">{profile.state || "Not Set"}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 block">Country</span>
                                    <span className="text-xs font-black text-slate-700">{profile.country || "India"}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                                <div className="space-y-1 sm:col-span-2">
                                    <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 block">Physical Address</span>
                                    <span className="text-xs font-black text-slate-700 leading-normal">{profile.address || "No Specific Street Address Setup"}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 block">Zip Code</span>
                                    <span className="text-xs font-black text-slate-700">{profile.zipCode || "N/A"}</span>
                                </div>
                            </div>

                            {/* Geo Location coordinates block */}
                            {profile.location?.coordinates && (
                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="flex items-center gap-2.5">
                                        <Globe className="text-[#3d3f96]" size={16} />
                                        <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Map Coordinates (GeoJSON Point)</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
                                        <span>Lng: {profile.location.coordinates[0]}</span>
                                        <span>Lat: {profile.location.coordinates[1]}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* RIGHT COLUMN: VERIFICATION CREDENTIALS & GALLERIES */}
                    <div className="lg:col-span-5 space-y-8">

                        {/* CREDENTIALS */}
                        <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100 space-y-6">
                            <div className="flex items-center gap-2 border-b border-gray-50 pb-4">
                                <Award className="text-[#3d3f96]" size={18} />
                                <h3 className="text-base font-black text-gray-800">Verification Credentials</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-400">License Number</span>
                                    <span className="font-black text-slate-700">{profile.licenseNumber || "Not Set"}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-400">Medical Council Name</span>
                                    <span className="font-black text-slate-700">{profile.councilName || "Not Set"}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-400">Council Registration No</span>
                                    <span className="font-black text-slate-700">{profile.councilNumber || "Not Set"}</span>
                                </div>
                            </div>
                        </div>

                        {/* ATTACHMENT & CERTIFICATE GALLERIES */}
                        <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100 space-y-6">
                            <div className="flex items-center gap-2 border-b border-gray-50 pb-4">
                                <ImageIcon className="text-[#3d3f96]" size={18} />
                                <h3 className="text-base font-black text-gray-800">Clinic Documents & Gallery</h3>
                            </div>

                            {/* Certificates Section */}
                            <div className="space-y-3">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Statutory Certificates</span>
                                <div className="grid grid-cols-2 gap-3">
                                    {profile.certificateImage ? (
                                        <a href={profile.certificateImage} target="_blank" rel="noreferrer" className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center text-center gap-2 hover:border-indigo-200 transition-all">
                                            <FileText className="text-[#3d3f96]" size={20} />
                                            <span className="text-[10px] font-black text-slate-700 truncate w-full">Reg Certificate</span>
                                        </a>
                                    ) : (
                                        <div className="p-3 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center text-center gap-1">
                                            <FileText className="text-slate-300" size={20} />
                                            <span className="text-[9px] font-black text-slate-400">No Reg Cert</span>
                                        </div>
                                    )}

                                    {profile.licenceCertificate ? (
                                        <a href={profile.licenceCertificate} target="_blank" rel="noreferrer" className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center text-center gap-2 hover:border-indigo-200 transition-all">
                                            <ShieldCheck className="text-emerald-600" size={20} />
                                            <span className="text-[10px] font-black text-slate-700 truncate w-full">Medical License</span>
                                        </a>
                                    ) : (
                                        <div className="p-3 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center text-center gap-1">
                                            <ShieldCheck className="text-slate-300" size={20} />
                                            <span className="text-[9px] font-black text-slate-400">No License Doc</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Clinic Images Gallery */}
                            <div className="space-y-3 pt-2">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Clinic Photos</span>
                                {profile.clinicImages?.length > 0 ? (
                                    <div className="grid grid-cols-3 gap-2">
                                        {profile.clinicImages.map((src, index) => (
                                            <a key={index} href={src} target="_blank" rel="noreferrer" className="aspect-square bg-slate-50 border border-slate-100 rounded-xl overflow-hidden hover:opacity-85 transition-all">
                                                <img src={src} alt="Clinic Space" className="w-full h-full object-cover" />
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400 font-medium italic">No clinic space photos uploaded</p>
                                )}
                            </div>

                            {/* Achievements & Awards */}
                            {profile.achievementImages?.length > 0 && (
                                <div className="space-y-3 pt-2">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Awards & Achievements</span>
                                    <div className="grid grid-cols-3 gap-2">
                                        {profile.achievementImages.map((src, index) => (
                                            <a key={index} href={src} target="_blank" rel="noreferrer" className="aspect-square bg-slate-50 border border-slate-100 rounded-xl overflow-hidden hover:opacity-85 transition-all">
                                                <img src={src} alt="Achievement" className="w-full h-full object-cover" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Additional License Documents list */}
                            {profile.licenseDocument?.length > 0 && (
                                <div className="space-y-3 pt-2">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Additional Licenses</span>
                                    <div className="space-y-2">
                                        {profile.licenseDocument.map((src, index) => (
                                            <a key={index} href={src} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 hover:border-indigo-100 rounded-2xl text-xs font-bold text-slate-700 transition-all">
                                                <div className="flex items-center gap-2.5 truncate">
                                                    <FileText className="text-[#3d3f96]" size={14} />
                                                    <span className="truncate">license_cert_v{index + 1}.pdf</span>
                                                </div>
                                                <ArrowRight size={14} className="text-slate-400 shrink-0" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>

                </div>

                {/* --- FOOTER METADATA --- */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 text-center md:text-left">
                    <div>
                        <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">Created On</span>
                        <span className="text-xs font-bold text-slate-500 mt-1 block">{formatDate(profile.createdAt)}</span>
                    </div>
                    <div>
                        <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">Last Updated</span>
                        <span className="text-xs font-bold text-slate-500 mt-1 block">{formatDate(profile.updatedAt)}</span>
                    </div>
                </div>

            </div>

            {/* ========================================================= */}
            {/* --- UPDATE PROFILE & DOCUMENTS MULTI-SECTION MODAL --- */}
            {/* ========================================================= */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                        {/* Modal Header */}
                        <div className="px-6 sm:px-8 py-5 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-black text-gray-800">Edit Clinic Profile & Verification</h3>
                                <p className="text-xs font-bold text-slate-400">Updates will be submitted to the Admin for approval</p>
                            </div>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="px-6 sm:px-8 pt-3 border-b border-gray-100 flex gap-2 overflow-x-auto select-none">
                            {[
                                { id: 'basic', label: 'Basic Info' },
                                { id: 'location', label: 'Location' },
                                { id: 'credentials', label: 'Credentials' },
                                { id: 'documents', label: 'Documents & Photos' },
                                { id: 'bank', label: 'Bank Details' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-2.5 text-xs font-black rounded-t-xl transition-all border-b-2 whitespace-nowrap ${activeTab === tab.id
                                            ? 'border-[#3d3f96] text-[#3d3f96] bg-indigo-50/50'
                                            : 'border-transparent text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleSubmitUpdate} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">

                            {/* TAB 1: BASIC INFO */}
                            {activeTab === 'basic' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">Doctor / Owner Name</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="e.g. Dr. Rajesh Sharma"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3d3f96]"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">Clinic Name</label>
                                            <input
                                                type="text"
                                                value={formData.clinicName}
                                                onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                                                placeholder="e.g. Sharma Diabetes & Multi-Specialty"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3d3f96]"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">Experience</label>
                                        <input
                                            type="text"
                                            value={formData.experience}
                                            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                            placeholder="e.g. 12 Years"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3d3f96]"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">About / Scope of Practice</label>
                                        <textarea
                                            rows={4}
                                            value={formData.About}
                                            onChange={(e) => setFormData({ ...formData, About: e.target.value })}
                                            placeholder="Brief description of the clinic..."
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3d3f96] resize-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                        <div>
                                            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">Profile Avatar / Logo</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleSingleFileChange('image', e.target.files[0])}
                                                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-indigo-50 file:text-[#3d3f96] hover:file:bg-indigo-100"
                                            />
                                            {previews.image && (
                                                <img src={previews.image} alt="Preview" className="w-14 h-14 object-cover rounded-xl mt-2 border" />
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">Poster / Header Banner</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleSingleFileChange('posterimage', e.target.files[0])}
                                                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-indigo-50 file:text-[#3d3f96] hover:file:bg-indigo-100"
                                            />
                                            {previews.posterimage && (
                                                <img src={previews.posterimage} alt="Preview" className="w-24 h-14 object-cover rounded-xl mt-2 border" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: LOCATION */}
                            {activeTab === 'location' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">Physical Street Address</label>
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="e.g. SCO 45, Phase 7, Mohali"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3d3f96]"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">City</label>
                                            <input
                                                type="text"
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                placeholder="e.g. Mohali"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3d3f96]"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">State</label>
                                            <input
                                                type="text"
                                                value={formData.state}
                                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                                placeholder="e.g. Punjab"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3d3f96]"
                                            />
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                                        <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider block">GeoJSON Map Coordinates (Point)</span>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[9px] uppercase font-black text-slate-400 block mb-1">Longitude (Lng)</label>
                                                <input
                                                    type="number"
                                                    step="any"
                                                    value={formData.lng}
                                                    onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                                                    placeholder="76.7179"
                                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3d3f96]"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[9px] uppercase font-black text-slate-400 block mb-1">Latitude (Lat)</label>
                                                <input
                                                    type="number"
                                                    step="any"
                                                    value={formData.lat}
                                                    onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                                                    placeholder="30.7046"
                                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3d3f96]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 3: CREDENTIALS */}
                            {activeTab === 'credentials' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">Medical License Number</label>
                                        <input
                                            type="text"
                                            value={formData.licenseNumber}
                                            onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                                            placeholder="e.g. MED-PB-84920"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3d3f96]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">Medical Council Name</label>
                                        <input
                                            type="text"
                                            value={formData.councilName}
                                            onChange={(e) => setFormData({ ...formData, councilName: e.target.value })}
                                            placeholder="e.g. Punjab Medical Council"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3d3f96]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">Council Registration Number</label>
                                        <input
                                            type="text"
                                            value={formData.councilNumber}
                                            onChange={(e) => setFormData({ ...formData, councilNumber: e.target.value })}
                                            placeholder="e.g. PMC-2014-9921"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3d3f96]"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* TAB 4: DOCUMENTS & MULTI-IMAGE UPLOADS */}
                            {activeTab === 'documents' && (
                                <div className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">Registration Certificate</label>
                                            <input
                                                type="file"
                                                accept="image/*,application/pdf"
                                                onChange={(e) => handleSingleFileChange('certificateImage', e.target.files[0])}
                                                className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:bg-indigo-50 file:text-[#3d3f96]"
                                            />
                                        </div>
                                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">Medical Practice License</label>
                                            <input
                                                type="file"
                                                accept="image/*,application/pdf"
                                                onChange={(e) => handleSingleFileChange('licenceCertificate', e.target.files[0])}
                                                className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:bg-indigo-50 file:text-[#3d3f96]"
                                            />
                                        </div>
                                    </div>

                                    {/* Clinic Multi Photos */}
                                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Clinic Images (Max 10)</label>
                                            <span className="text-[10px] font-bold text-slate-400">{fileInputs.clinicImages.length} selected</span>
                                        </div>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={(e) => handleMultipleFileChange('clinicImages', e.target.files, 10)}
                                            className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:bg-indigo-50 file:text-[#3d3f96]"
                                        />
                                        {fileInputs.clinicImages.length > 0 && (
                                            <div className="flex flex-wrap gap-2 pt-2">
                                                {fileInputs.clinicImages.map((f, i) => (
                                                    <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700">
                                                        {f.name}
                                                        <X size={12} className="cursor-pointer text-rose-500" onClick={() => removeMultiFile('clinicImages', i)} />
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Achievements Multi Photos */}
                                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Achievement Images (Max 10)</label>
                                            <span className="text-[10px] font-bold text-slate-400">{fileInputs.achievementImages.length} selected</span>
                                        </div>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={(e) => handleMultipleFileChange('achievementImages', e.target.files, 10)}
                                            className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:bg-indigo-50 file:text-[#3d3f96]"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* TAB 5: BANK DETAILS */}
                            {activeTab === 'bank' && (
                                <div className="space-y-4">
                                    <div className="p-3.5 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3 text-amber-800 text-xs font-semibold">
                                        <Info size={16} className="shrink-0 text-amber-600" />
                                        <span>Bank details are securely handled and updated via administrative review.</span>
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">Bank Name</label>
                                        <input
                                            type="text"
                                            value={formData.bankName}
                                            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                            placeholder="e.g. HDFC Bank"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3d3f96]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">Account Number</label>
                                        <input
                                            type="text"
                                            value={formData.accountNumber}
                                            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                            placeholder="Enter account number"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3d3f96]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">IFSC Code</label>
                                        <input
                                            type="text"
                                            value={formData.ifscCode}
                                            onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                                            placeholder="e.g. HDFC0001234"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3d3f96]"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Modal Footer Controls */}
                            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    disabled={submitting}
                                    className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black uppercase tracking-wider transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-3 rounded-2xl bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-indigo-100 flex items-center gap-2"
                                >
                                    {submitting && <Loader2 size={14} className="animate-spin" />}
                                    {submitting ? "Submitting..." : "Submit For Review"}
                                </button>
                            </div>

                        </form>

                    </div>
                </div>
            )}

        </div>
    );
}