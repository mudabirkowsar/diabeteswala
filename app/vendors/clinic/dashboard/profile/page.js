"use client";
import React, { useState, useEffect } from 'react';
import {
    User, Mail, Phone, Building, Award, ShieldCheck, MapPin,
    CreditCard, Clock, Calendar, Image, FileText, Loader2, CheckCircle2,
    AlertCircle, Globe, ToggleLeft, ToggleRight, ArrowRight, X
} from 'lucide-react';
import { useNotification } from '../../../../context/NotificationContext';
import ClinicAPI from '../../../../services/ClinicAPI'; // Adjust path based on your structure
import { useRouter } from 'next/navigation';

export default function ClinicProfilePage() {
    const router = useRouter()

    // --- Safe Context Extraction & Fallback ---
    const notificationContext = useNotification();
    const [localAlert, setLocalAlert] = useState(null); // Fallback state if context is undefined

    const triggerNotification = (message, type = 'info') => {
        if (notificationContext && typeof notificationContext.showNotification === 'function') {
            notificationContext.showNotification(message, type);
        } else {
            // Local self-contained alert system when provider is missing
            setLocalAlert({ message, type });
            setTimeout(() => setLocalAlert(null), 4000);
        }
    };

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profile, setProfile] = useState(null);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await ClinicAPI.getClinicProfile();
            if (response.success && response.data) {
                setProfile(response.data);
            } else {
                setError("Failed to fetch clinic profile data.");
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
        fetchProfile();
    }, []);

    // Format Date Utility
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
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
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center select-none">
                <Loader2 className="animate-spin text-[#3d3f96]" size={42} />
                <p className="text-xs font-black text-slate-400 mt-4 uppercase tracking-widest">Loading Clinic Profile...</p>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 max-w-md w-full text-center">
                    <AlertCircle className="text-rose-500 mx-auto mb-4" size={48} />
                    <h3 className="text-lg font-black text-gray-800">Failed to Load Profile</h3>
                    <p className="text-xs text-gray-400 mt-2 leading-relaxed">{error || "Check your network connection."}</p>
                    <button
                        onClick={fetchProfile}
                        className="w-full mt-6 py-4 rounded-2xl bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-100"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-0 px-4 sm:px-6 lg:px-8 select-none antialiased relative">

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

            <div className="max-w-5xl mx-auto space-y-8">

                {/* 1. HERO/HEADER BANNER COMPONENT */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden relative">
                    <div className="h-44 w-full bg-gradient-to-r from-[#3d3f96] to-[#5558bc] relative">
                        {profile.posterimage && (
                            <img src={profile.posterimage} alt="Poster" className="w-full h-full object-cover" />
                        )}
                        <div className="absolute right-6 top-6 flex items-center gap-2">
                            {profile.isOnline ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" /> Online
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-400 text-white">
                                    Offline
                                </span>
                            )}
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
                                    <h1 className="text-2xl font-black text-gray-800">{profile.name}</h1>
                                    {getVerificationBadge(profile.Accountverify)}
                                </div>
                                <p className="text-sm font-bold text-slate-400">{profile.clinicName || "Workspace Name Not Set"}</p>
                                <span className="inline-block text-[10px] font-black uppercase tracking-widest text-[#3d3f96] bg-indigo-50 px-2.5 py-1 rounded-lg">
                                    {profile.type} Workspace
                                </span>
                            </div>
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

                {/* 2. REJECTION NOTICE (IF REJECTED) */}
                {profile.Accountverify === 'Rejected' && (
                    <div className="bg-rose-50 border border-rose-100 rounded-3xl p-6 flex gap-4 text-rose-800">
                        <AlertCircle className="shrink-0 text-rose-600 mt-1" size={20} />
                        <div className="space-y-1">
                            <h4 className="font-black text-sm">Application Rejection Notice</h4>
                            <p className="text-xs font-semibold text-rose-700/90 leading-relaxed">
                                {profile.rejectReason || "Your document submissions were blurry or expired. Please upload valid credentials again."}
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN: GENERAL, TIMINGS, GEOGRAPHY */}
                    <div className="lg:col-span-7 space-y-8">

                        {/* GENERAL INFORMATION */}
                        <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-gray-100 space-y-6">
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
                        <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-gray-100 space-y-6">
                            <div className="flex items-center gap-2 border-b border-gray-50 pb-4">
                                <MapPin className="text-[#3d3f96]" size={18} />
                                <h3 className="text-base font-black text-gray-800">Geographical Location</h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="space-y-1">
                                    <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 block">City</span>
                                    <span className="text-xs font-black text-slate-700">{profile.city || "Mohali"}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 block">State</span>
                                    <span className="text-xs font-black text-slate-700">{profile.state || "Punjab"}</span>
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
                            {profile.location && (
                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="flex items-center gap-2.5">
                                        <Globe className="text-slate-400" size={16} />
                                        <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Map Coordinates</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
                                        <span>Lat: {profile.location.lat || 0}</span>
                                        <span>Lng: {profile.location.lng || 0}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* RIGHT COLUMN: BANK, REGISTRATION, GALLERY */}
                    <div className="lg:col-span-5 space-y-8">
                        <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-gray-100 space-y-6">
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
                                {profile.regId && (
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-400">Internal Registration ID</span>
                                        <span className="font-black text-slate-700">{profile.regId}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ATTACHMENT GALLERY (CLINIC IMAGES & DOCUMENT PREVIEWS) */}
                        <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-gray-100 space-y-6">
                            <div className="flex items-center gap-2 border-b border-gray-50 pb-4">
                                <Image className="text-[#3d3f96]" size={18} />
                                <h3 className="text-base font-black text-gray-800">Verification Galleries</h3>
                            </div>

                            {/* Clinic Images Gallery */}
                            <div className="space-y-3">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Workspace Photos</span>
                                {profile.clinicImages?.length > 0 ? (
                                    <div className="grid grid-cols-3 gap-2">
                                        {profile.clinicImages.map((src, index) => (
                                            <a key={index} href={src} target="_blank" rel="noreferrer" className="aspect-square bg-slate-50 border border-slate-100 rounded-xl overflow-hidden hover:opacity-85 transition-all">
                                                <img src={src} alt="Clinic Space" className="w-full h-full object-cover" />
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-300 font-bold italic">No workspace photos uploaded</p>
                                )}
                            </div>

                            {/* Licensing Files list */}
                            <div className="space-y-3 pt-2">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">License Document</span>
                                {profile.licenseDocument?.length > 0 ? (
                                    <div className="space-y-2">
                                        {profile.licenseDocument.map((src, index) => (
                                            <a key={index} href={src} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 hover:border-indigo-100 rounded-2xl text-xs font-bold text-slate-700 transition-all">
                                                <div className="flex items-center gap-2.5 truncate">
                                                    <FileText className="text-[#3d3f96]" size={14} />
                                                    <span className="truncate">licence_cert_v{index + 1}.pdf</span>
                                                </div>
                                                <ArrowRight size={14} className="text-slate-400 shrink-0" />
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-300 font-bold italic">No licensing files uploaded</p>
                                )}
                            </div>
                        </div>

                    </div>

                </div>

                {/* FOOTER SYSTEM METADATA LOG */}
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
        </div>
    );
}