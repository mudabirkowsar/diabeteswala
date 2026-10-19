"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, Share2, Printer, CheckCircle2, ShieldCheck,
    Droplets, Activity, MapPin, Phone, Mail, Calendar,
    QrCode, Sparkles, Copy, Check, AlertCircle, RefreshCw,
    Edit3, RotateCw, Wifi, HeartPulse, User
} from 'lucide-react';
import UserAPI from '../../../services/UserAPI';
import { useNotification } from '../../../context/NotificationContext';

export default function ProfileCardPage() {
    const router = useRouter();
    const { showNotification } = useNotification?.() || { showNotification: () => { } };

    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState(null);
    const [error, setError] = useState(null);
    const [isFlipped, setIsFlipped] = useState(false);
    const [copiedAbha, setCopiedAbha] = useState(false);
    const [copiedId, setCopiedId] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Multer Image URL Resolver
    const getFullImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        const backendBaseUrl = (
            process.env.NEXT_PUBLIC_BACKEND_URL ||
            process.env.NEXT_PUBLIC_API_URL ||
            process.env.NEXT_PUBLIC_BASE_URL ||
            ''
        ).replace(/\/+$/, '');

        const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
        return `${backendBaseUrl}${cleanPath}`;
    };

    // Fetch Profile Card Data
    const fetchCardData = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await UserAPI.getUserProfileCard();
            if (res?.success && res?.data) {
                setProfileData(res.data);
            } else {
                setError(res?.message || "Failed to load profile card details");
            }
        } catch (err) {
            console.error("Profile Card Fetch Error:", err);
            setError(err?.response?.data?.message || "Failed to fetch profile card. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCardData();
    }, []);

    const handleCopy = (text, type) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        if (type === 'abha') {
            setCopiedAbha(true);
            setTimeout(() => setCopiedAbha(false), 2000);
            showNotification?.("ABHA Number copied!", "success");
        } else {
            setCopiedId(true);
            setTimeout(() => setCopiedId(false), 2000);
            showNotification?.("Card ID copied!", "success");
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${profileData?.name || 'User'} - Diabetes Wala Health Card`,
                    text: `Digital Health Profile Card for ${profileData?.name}`,
                    url: window.location.href,
                });
            } catch (err) {
                console.log("Share dismissed", err);
            }
        } else {
            handleCopy(window.location.href, 'id');
            alert("Profile link copied to clipboard!");
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        try {
            return new Date(dateStr).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F0F4FA] flex flex-col items-center justify-center p-4">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-[#3d3f96]/20 border-t-[#3d3f96] rounded-full animate-spin" />
                    <HeartPulse size={22} className="absolute inset-0 m-auto text-[#3d3f96] animate-pulse" />
                </div>
                <p className="mt-4 text-xs font-bold text-slate-600 tracking-wide">
                    Crafting Your Digital Health ID Card...
                </p>
            </div>
        );
    }

    if (error || !profileData) {
        return (
            <div className="min-h-screen bg-[#F0F4FA] flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-xl border border-slate-100">
                    <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={26} />
                    </div>
                    <h2 className="text-lg font-black text-slate-800 mb-1">Card Unavailable</h2>
                    <p className="text-xs text-slate-500 mb-6">{error || "Could not retrieve your digital card."}</p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => router.back()}
                            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
                        >
                            Back
                        </button>
                        <button
                            onClick={fetchCardData}
                            className="flex-1 py-3 bg-[#3d3f96] hover:bg-[#2d2f75] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                            <RefreshCw size={14} /> Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const {
        userId, name, profilePic, phone, email, gender, age, dob,
        bloodGroup, vitals, location, diabeticProfile, abhaInfo,
        profileProgress, memberSince
    } = profileData;

    const fullProfilePicUrl = getFullImageUrl(profilePic);

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#E8EEF8] via-[#F3F6FD] to-[#FFFFFF] py-4 sm:py-8 px-3 sm:px-6 antialiased print:bg-white print:p-0">
            <div className="max-w-2xl mx-auto space-y-5">

                {/* --- Top Action Header --- */}
                <div className="flex items-center justify-between gap-2 print:hidden">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-slate-600 hover:text-[#3d3f96] bg-white rounded-xl border border-slate-200 shadow-sm transition-all"
                    >
                        <ArrowLeft size={14} /> Back
                    </button>

                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-[#3d3f96] rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95"
                        >
                            <Printer size={14} /> <span className="hidden sm:inline">Print</span>
                        </button>
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-[#3d3f96] rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95"
                        >
                            <Share2 size={14} /> <span className="hidden sm:inline">Share</span>
                        </button>
                        <Link
                            href="/otherscreens/profile"
                            className="flex items-center gap-1 px-3.5 py-1.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95"
                        >
                            <Edit3 size={14} /> <span className="hidden sm:inline">Edit</span>
                        </Link>
                    </div>
                </div>

                {/* --- Flip Hint Indicator --- */}
                <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-slate-500 print:hidden">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>Interactive 3D Smart Card &bull; Click to Flip</span>
                </div>

                {/* --- 3D FLIPPABLE SPECIAL CARD WRAPPER --- */}
                <div
                    className="perspective-1000 w-full cursor-pointer select-none"
                    onClick={() => setIsFlipped(!isFlipped)}
                >
                    <div
                        className={`relative w-full transition-transform duration-700 transform-style-3d ${isFlipped ? "rotate-y-180" : ""
                            }`}
                        style={{
                            transformStyle: 'preserve-3d',
                            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                            transition: 'transform 0.65s cubic-bezier(0.4, 0.2, 0.2, 1)'
                        }}
                    >

                        {/* ========================================================= */}
                        {/* 1. FRONT SIDE OF CARD                                     */}
                        {/* ========================================================= */}
                        <div
                            className={`w-full min-h-[320px] sm:min-h-[330px] rounded-[1.75rem] sm:rounded-[2.2rem] p-4 sm:p-6 text-white relative overflow-hidden shadow-2xl border border-indigo-300/30 bg-gradient-to-br from-[#0D1033] via-[#1A1F5E] to-[#2E338A] ${isFlipped ? "pointer-events-none" : ""
                                }`}
                            style={{ backfaceVisibility: 'hidden' }}
                        >
                            {/* Holographic Refraction Effects */}
                            <div className="absolute -top-20 -right-20 w-52 h-52 bg-gradient-to-br from-indigo-400/20 via-pink-400/10 to-transparent rounded-full blur-2xl pointer-events-none" />
                            <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-gradient-to-tr from-cyan-400/15 via-blue-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-60 pointer-events-none" />

                            {/* Front Header */}
                            <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/10">
                                <div className="flex items-center gap-2 sm:gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center shadow-md border border-white/20">
                                        <Activity size={18} className="text-white" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs sm:text-sm font-black tracking-wider uppercase">Diabetes Wala</span>
                                            <span className="bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[8px] sm:text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                                                Verified
                                            </span>
                                        </div>
                                        <span className="text-[8px] sm:text-[9px] tracking-widest text-indigo-200/80 uppercase font-black block">
                                            Digital Health Identity
                                        </span>
                                    </div>
                                </div>

                                {/* EMV Gold Chip & Contactless Waves */}
                                <div className="flex items-center gap-2">
                                    <div className="w-9 h-7 rounded-md bg-gradient-to-tr from-amber-200 via-amber-300 to-amber-100 border border-amber-400/60 p-1 flex flex-col justify-between shadow-inner">
                                        <div className="w-full h-px bg-amber-700/40" />
                                        <div className="w-1/2 h-px bg-amber-700/40 self-end" />
                                        <div className="w-full h-px bg-amber-700/40" />
                                    </div>
                                    <Wifi size={17} className="text-indigo-200 rotate-90" />
                                </div>
                            </div>

                            {/* Front Body: Photo & Identity */}
                            <div className="relative z-10 mt-3.5 flex items-center gap-3 sm:gap-4">
                                {/* Profile Pic with fallback */}
                                <div className="relative shrink-0">
                                    <div className="w-18 h-18 sm:w-20 sm:h-20 w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] rounded-2xl overflow-hidden bg-white/10 border-2 border-white/30 backdrop-blur-md shadow-lg flex items-center justify-center">
                                        {fullProfilePicUrl && !imageError ? (
                                            <Image
                                                src={fullProfilePicUrl}
                                                alt={name || "User"}
                                                width={84}
                                                height={84}
                                                unoptimized
                                                onError={() => setImageError(true)}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-2xl font-black text-white/90">
                                                {name?.charAt(0) || "U"}
                                            </span>
                                        )}
                                    </div>
                                    {bloodGroup && (
                                        <div className="absolute -bottom-1.5 -right-1.5 bg-rose-600 text-white font-black text-[10px] px-1.5 py-0.2 rounded-md border-2 border-[#1a1f5e] shadow flex items-center gap-0.5">
                                            <Droplets size={10} fill="currentColor" /> {bloodGroup}
                                        </div>
                                    )}
                                </div>

                                {/* User Info */}
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-base sm:text-lg font-black text-white truncate tracking-tight">
                                        {name}
                                    </h2>

                                    {/* Embossed Card User ID */}
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="font-mono text-[11px] sm:text-xs text-indigo-200 tracking-wider">
                                            {userId ? `${userId.slice(0, 4)} •••• ${userId.slice(-4)}` : "DW-HEALTH-PASS"}
                                        </span>
                                        <span className="text-[9px] bg-white/10 px-1.5 py-0.2 rounded text-indigo-100 font-mono">
                                            {gender || "—"} &bull; {age || "—"}
                                        </span>
                                    </div>

                                    {/* Diabetic Status Badge */}
                                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                        <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-200 border border-rose-400/30">
                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                                            {diabeticProfile?.diabeticType || "Diabetic"}
                                        </span>
                                        {diabeticProfile?.duration && (
                                            <span className="text-[9px] text-indigo-200/80 font-bold">
                                                Since {diabeticProfile.duration}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Front Footer: ABHA Pill & Holographic Flip Tag */}
                            <div className="relative z-10 mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-left">
                                <div className="flex items-center gap-2">
                                    <div className="p-1 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
                                        <ShieldCheck size={16} />
                                    </div>
                                    <div>
                                        <span className="text-[8px] uppercase tracking-widest text-indigo-200 block font-black">
                                            ABHA ID
                                        </span>
                                        <span className="font-mono text-[11px] sm:text-xs font-black text-white tracking-wide">
                                            {abhaInfo?.abhaNumber || "14-XXXX-XXXX-XXXX"}
                                        </span>
                                    </div>
                                </div>

                                {/* Flip Badge */}
                                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-[9px] font-black tracking-wider uppercase text-indigo-100 transition-colors">
                                    <RotateCw size={11} /> Flip Card
                                </div>
                            </div>
                        </div>

                        {/* ========================================================= */}
                        {/* 2. BACK SIDE OF CARD                                      */}
                        {/* ========================================================= */}
                        <div
                            className={`absolute inset-0 w-full min-h-[320px] sm:min-h-[330px] rounded-[1.75rem] sm:rounded-[2.2rem] text-white p-4 sm:p-5 shadow-2xl border border-indigo-300/30 bg-gradient-to-br from-[#12163E] via-[#1B205E] to-[#252C75] flex flex-col justify-between overflow-hidden ${!isFlipped ? "pointer-events-none" : ""
                                }`}
                            style={{
                                backfaceVisibility: 'hidden',
                                transform: 'rotateY(180deg)'
                            }}
                        >
                            {/* Magnetic Strip Accent */}
                            <div className="absolute top-4 left-0 right-0 h-8 sm:h-9 bg-slate-950/80 border-y border-white/5 shadow-inner" />

                            {/* Top Spacing to account for Magnetic Strip */}
                            <div className="relative z-10 pt-9 flex items-center justify-between text-[9px] font-mono text-indigo-200">
                                <span>SECURITY CODE: DW-PASS</span>
                                <span className="text-white font-bold tracking-widest">AUTHORIZED SIGNATURE</span>
                            </div>

                            {/* Back Content Grid: Vitals & QR */}
                            <div className="relative z-10 mt-2 flex items-center justify-between gap-3">
                                {/* Vitals Summary Strip */}
                                <div className="flex-1 space-y-1.5 text-left">
                                    <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                                        <div className="bg-white/5 border border-white/10 p-1.5 rounded-lg">
                                            <span className="text-[8px] text-indigo-200/80 block uppercase font-black">Height</span>
                                            <span className="font-black text-white">{vitals?.height || "—"}</span>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 p-1.5 rounded-lg">
                                            <span className="text-[8px] text-indigo-200/80 block uppercase font-black">Weight</span>
                                            <span className="font-black text-white">{vitals?.weight || "—"}</span>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 border border-white/10 p-1.5 rounded-lg text-[10px]">
                                        <span className="text-[8px] text-indigo-200/80 block uppercase font-black">Location</span>
                                        <span className="font-bold text-white truncate block">
                                            {location?.displayLocation || `${location?.city || ''}, ${location?.state || ''}`}
                                        </span>
                                    </div>
                                </div>

                                {/* Verification QR Code */}
                                <div className="shrink-0 flex flex-col items-center">
                                    <div className="bg-white p-1.5 rounded-xl shadow-md text-slate-900">
                                        <QrCode size={48} className="sm:w-[56px] sm:h-[56px]" />
                                    </div>
                                    <span className="text-[7px] font-black uppercase tracking-wider text-indigo-200 mt-1">
                                        Scan to Verify
                                    </span>
                                </div>
                            </div>

                            {/* Back Footer */}
                            <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between text-[8px] sm:text-[9px] text-indigo-200 font-bold">
                                <span className="truncate max-w-[200px]">
                                    Emergency Helpline: 24x7 Diabetes Wala Care
                                </span>
                                <div className="flex items-center gap-1 text-white font-mono">
                                    <RotateCw size={10} /> Flip Front
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* --- Card Quick Action Bar --- */}
                <div className="grid grid-cols-2 gap-2 print:hidden">
                    <button
                        onClick={() => handleCopy(abhaInfo?.abhaNumber, 'abha')}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white border border-slate-200 hover:border-[#3d3f96] text-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                    >
                        {copiedAbha ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-[#3d3f96]" />}
                        <span>{copiedAbha ? "ABHA Copied" : "Copy ABHA"}</span>
                    </button>

                    <button
                        onClick={() => handleCopy(userId, 'id')}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white border border-slate-200 hover:border-[#3d3f96] text-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                    >
                        {copiedId ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-[#3d3f96]" />}
                        <span>{copiedId ? "Card ID Copied" : "Copy Card ID"}</span>
                    </button>
                </div>

                {/* --- SUPPLEMENTARY DETAILS CONTAINER --- */}
                <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200/80 space-y-4 print:hidden">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider">
                            Health Record Details
                        </h3>
                        <span className="text-[10px] sm:text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                            {profileProgress?.completionPercentage || 100}% Profile Active
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs font-bold text-slate-600">
                        {/* Phone */}
                        <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#3d3f96] flex items-center justify-center shrink-0">
                                <Phone size={14} />
                            </div>
                            <div className="min-w-0">
                                <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-black">Mobile</span>
                                <span className="text-slate-800 truncate block">{phone || "Not Provided"}</span>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#3d3f96] flex items-center justify-center shrink-0">
                                <Mail size={14} />
                            </div>
                            <div className="min-w-0">
                                <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-black">Email</span>
                                <span className="text-slate-800 truncate block">{email || "Not Provided"}</span>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#3d3f96] flex items-center justify-center shrink-0">
                                <MapPin size={14} />
                            </div>
                            <div className="min-w-0">
                                <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-black">Location</span>
                                <span className="text-slate-800 truncate block">
                                    {location?.displayLocation || `${location?.city || ''}, ${location?.state || ''}`}
                                </span>
                            </div>
                        </div>

                        {/* Joined */}
                        <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#3d3f96] flex items-center justify-center shrink-0">
                                <Calendar size={14} />
                            </div>
                            <div className="min-w-0">
                                <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-black">Member Since</span>
                                <span className="text-slate-800 truncate block">{formatDate(memberSince)}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* --- Embedded Styles for 3D Transform & Print Support --- */}
            <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        @media print {
          body {
            background: white !important;
          }
          .perspective-1000 {
            perspective: none !important;
          }
        }
      `}</style>
        </div>
    );
}