"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Share2, Printer, CheckCircle2, ShieldCheck,
  Droplets, Activity, MapPin, Phone, Mail, Calendar,
  QrCode, Sparkles, Copy, Check, AlertCircle, RefreshCw,
  Edit3, RotateCw, Wifi, HeartPulse, User, Award, CheckCircle,
  X, Maximize2, Download
} from 'lucide-react';
import UserAPI from '../../../services/UserAPI';
import { useNotification } from '../../../context/NotificationContext';

export default function ProfileCardPage() {
  const router = useRouter();
  const { showNotification } = useNotification?.() || { showNotification: () => {} };

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [copiedAbha, setCopiedAbha] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

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

  const handleCopy = (e, text, type) => {
    e.stopPropagation();
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
      navigator.clipboard.writeText(window.location.href);
      showNotification?.("Profile link copied to clipboard!", "success");
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

  // Construct Structured Plain-Text Payload for the QR Code
  // Anyone scanning this receives clean, human-readable emergency medical records
  const qrCodeTextPayload = useMemo(() => {
    if (!profileData) return "";
    return `DIABETES WALA DIGITAL HEALTH CARD
------------------------------------
Patient: ${profileData.name || 'N/A'}
Blood Group: ${profileData.bloodGroup || 'N/A'}
Condition: ${profileData.diabeticProfile?.diabeticType || 'Diabetic'} (${profileData.diabeticProfile?.duration ? `Since ${profileData.diabeticProfile.duration}` : ''})
ABHA ID: ${profileData.abhaInfo?.abhaNumber || 'N/A'} [${profileData.abhaInfo?.isAbhaVerified ? 'Verified' : 'Unverified'}]
Vitals: Height: ${profileData.vitals?.height || '—'} | Weight: ${profileData.vitals?.weight || '—'}
Demographics: ${profileData.gender || '—'}, Age: ${profileData.age || '—'}, DOB: ${profileData.dob || '—'}
Mobile: ${profileData.phone || '—'}
Email: ${profileData.email || '—'}
Location: ${profileData.location?.displayLocation || `${profileData.location?.city || ''}, ${profileData.location?.state || ''}`}
Member Since: ${formatDate(profileData.memberSince)}
Digital Card ID: ${profileData.userId || '—'}
Verified by Diabetes Wala Health Network`;
  }, [profileData]);

  // Live QR Code Image Source
  const qrCodeUrl = useMemo(() => {
    if (!qrCodeTextPayload) return "";
    return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=2&data=${encodeURIComponent(qrCodeTextPayload)}`;
  }, [qrCodeTextPayload]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F4FA] flex flex-col items-center justify-center p-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#3d3f96]/20 border-t-[#3d3f96] rounded-full animate-spin" />
          <HeartPulse size={22} className="absolute inset-0 m-auto text-[#3d3f96] animate-pulse" />
        </div>
        <p className="mt-4 text-xs font-bold text-slate-600 tracking-wide">
          Generating Your Digital Health ID Card...
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
      <div className="max-w-2xl mx-auto space-y-4">

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

        {/* --- Side Switch Toggle --- */}
        <div className="flex items-center justify-center gap-2 print:hidden">
          <div className="bg-slate-200/80 p-1 rounded-2xl flex items-center gap-1 shadow-inner">
            <button
              onClick={() => setIsFlipped(false)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                !isFlipped
                  ? "bg-[#3d3f96] text-white shadow-md"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Card Front
            </button>
            <button
              onClick={() => setIsFlipped(true)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isFlipped
                  ? "bg-[#3d3f96] text-white shadow-md"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Card Back (QR Scan)
            </button>
          </div>
        </div>

        {/* --- 3D FLIPPABLE SPECIAL CARD WRAPPER --- */}
        <div
          className="perspective-1000 w-full cursor-pointer select-none"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div
            className={`relative w-full transition-transform duration-700 transform-style-3d ${
              isFlipped ? "rotate-y-180" : ""
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
              className={`w-full min-h-[410px] sm:min-h-[420px] rounded-[1.75rem] sm:rounded-[2.2rem] p-4 sm:p-6 text-white relative overflow-hidden shadow-2xl border border-indigo-300/30 bg-gradient-to-br from-[#0B0E2C] via-[#161B54] to-[#2B3084] flex flex-col justify-between ${
                isFlipped ? "pointer-events-none" : ""
              }`}
              style={{ backfaceVisibility: 'hidden' }}
            >
              {/* Holographic Glowing Orbs */}
              <div className="absolute -top-24 -right-24 w-60 h-60 bg-gradient-to-br from-indigo-400/25 via-pink-400/15 to-transparent rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-gradient-to-tr from-cyan-400/20 via-blue-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-60 pointer-events-none" />

              {/* Front Header: Official Logo + Chip */}
              <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/10 gap-2">
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <div
                    className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-sm border border-white/40 flex items-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link href="/">
                      <Image
                        src="/logo/diabeteslogo.png"
                        alt="Diabetes Wala"
                        width={145}
                        height={38}
                        className="object-contain h-7 sm:h-9 w-auto"
                        priority
                      />
                    </Link>
                  </div>
                  <span className="bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Verified
                  </span>
                </div>

                {/* EMV Gold Chip & Contactless Waves */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-9 h-7 rounded-md bg-gradient-to-tr from-amber-200 via-amber-300 to-amber-100 border border-amber-400/60 p-1 flex flex-col justify-between shadow-inner">
                    <div className="w-full h-px bg-amber-700/40" />
                    <div className="w-1/2 h-px bg-amber-700/40 self-end" />
                    <div className="w-full h-px bg-amber-700/40" />
                  </div>
                  <Wifi size={17} className="text-indigo-200 rotate-90" />
                </div>
              </div>

              {/* Front Center: Photo & Primary Info */}
              <div className="relative z-10 my-auto py-2 flex items-center gap-3 sm:gap-4">
                {/* Photo with Multer + Blood Group */}
                <div className="relative shrink-0">
                  <div className="w-[76px] h-[76px] sm:w-[92px] sm:h-[92px] rounded-2xl overflow-hidden bg-white/10 border-2 border-white/30 backdrop-blur-md shadow-lg flex items-center justify-center">
                    {fullProfilePicUrl && !imageError ? (
                      <Image
                        src={fullProfilePicUrl}
                        alt={name || "User"}
                        width={92}
                        height={92}
                        unoptimized
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-black text-white/90">
                        {name?.charAt(0) || "U"}
                      </span>
                    )}
                  </div>
                  {bloodGroup && (
                    <div className="absolute -bottom-1.5 -right-1.5 bg-rose-600 text-white font-black text-[10px] sm:text-xs px-2 py-0.5 rounded-md border-2 border-[#161B54] shadow flex items-center gap-0.5">
                      <Droplets size={10} fill="currentColor" /> {bloodGroup}
                    </div>
                  )}
                </div>

                {/* User Credentials & Badges */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-black text-white truncate tracking-tight">
                    {name}
                  </h2>

                  {/* Embossed User ID with Copy */}
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono text-[11px] sm:text-xs text-indigo-200 tracking-wider">
                      ID: {userId ? `${userId.slice(0, 6)}••••${userId.slice(-4)}` : "DW-PASS"}
                    </span>
                    <button
                      onClick={(e) => handleCopy(e, userId, 'id')}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                      title="Copy Card ID"
                    >
                      {copiedId ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} className="text-indigo-200" />}
                    </button>
                  </div>

                  {/* Demographics Strip */}
                  <div className="mt-1 flex flex-wrap items-center gap-1 text-[9px] sm:text-[10px] font-bold text-indigo-100">
                    <span className="bg-white/10 px-2 py-0.5 rounded-md">{gender || "—"}</span>
                    <span className="bg-white/10 px-2 py-0.5 rounded-md">{age || "—"}</span>
                    {dob && (
                      <span className="bg-white/10 px-2 py-0.5 rounded-md">
                        DOB: {formatDate(dob)}
                      </span>
                    )}
                  </div>

                  {/* Diabetic Diagnosis Pill */}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-500/25 text-rose-200 border border-rose-400/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                      {diabeticProfile?.diabeticType || "Diabetic"}
                    </span>
                    {diabeticProfile?.duration && (
                      <span className="text-[9px] text-indigo-200 font-bold">
                        Since {diabeticProfile.duration}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Front Footer: ABHA Credentials & Profile Score */}
              <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <span className="text-[8px] uppercase tracking-widest text-indigo-200 block font-black">
                      ABHA NUMBER
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs sm:text-sm font-black text-white tracking-wider">
                        {abhaInfo?.abhaNumber || "14-XXXX-XXXX-XXXX"}
                      </span>
                      <button
                        onClick={(e) => handleCopy(e, abhaInfo?.abhaNumber, 'abha')}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                        title="Copy ABHA Number"
                      >
                        {copiedAbha ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} className="text-indigo-200" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-[8px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 rounded-md">
                    {profileProgress?.completionPercentage || 100}% Active
                  </span>
                  <div className="flex items-center gap-1 mt-1 text-[9px] text-indigo-200 font-bold">
                    <RotateCw size={10} /> Flip for QR
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* 2. BACK SIDE OF CARD: LIVE SCANNABLE HEALTH QR CODE       */}
            {/* ========================================================= */}
            <div
              className={`absolute inset-0 w-full min-h-[410px] sm:min-h-[420px] rounded-[1.75rem] sm:rounded-[2.2rem] text-white p-4 sm:p-6 shadow-2xl border border-indigo-300/30 bg-gradient-to-br from-[#0F1338] via-[#181D58] to-[#242A72] flex flex-col justify-between overflow-hidden ${
                !isFlipped ? "pointer-events-none" : ""
              }`}
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              {/* Magnetic Strip Header */}
              <div className="absolute top-4 left-0 right-0 h-9 bg-slate-950/90 border-y border-white/5 shadow-inner" />

              {/* Space for Magnetic Strip */}
              <div className="relative z-10 pt-9 flex items-center justify-between text-[9px] font-mono text-indigo-200">
                <span>SECURITY KEY: DW-{userId ? userId.slice(-6).toUpperCase() : 'PASS'}</span>
                <span className="text-white font-bold tracking-widest uppercase">Verified Medical Card</span>
              </div>

              {/* Back Content Grid: Contact, Vitals & Real Scannable QR */}
              <div className="relative z-10 my-auto py-1 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                
                {/* Left Column: Contact & Location */}
                <div className="space-y-1.5 text-left">
                  <div className="flex items-center gap-2 p-1.5 sm:p-2 bg-white/5 border border-white/10 rounded-xl">
                    <Phone size={13} className="text-indigo-300 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[8px] uppercase tracking-wider text-indigo-300 block font-black">Mobile</span>
                      <span className="text-[11px] font-bold text-white truncate block">{phone || "Not Provided"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-1.5 sm:p-2 bg-white/5 border border-white/10 rounded-xl">
                    <Mail size={13} className="text-indigo-300 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[8px] uppercase tracking-wider text-indigo-300 block font-black">Email</span>
                      <span className="text-[11px] font-bold text-white truncate block">{email || "Not Provided"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-1.5 sm:p-2 bg-white/5 border border-white/10 rounded-xl">
                    <MapPin size={13} className="text-indigo-300 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[8px] uppercase tracking-wider text-indigo-300 block font-black">Location</span>
                      <span className="text-[11px] font-bold text-white truncate block">
                        {location?.displayLocation || `${location?.city || ''}, ${location?.state || ''}, ${location?.country || ''}`}
                      </span>
                    </div>
                  </div>

                  {/* Vitals Summary Pill */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="p-1.5 bg-white/5 border border-white/10 rounded-xl text-center">
                      <span className="text-[7px] uppercase tracking-wider text-indigo-300 block font-black">Height</span>
                      <span className="text-[11px] font-black text-white">{vitals?.height || "—"}</span>
                    </div>
                    <div className="p-1.5 bg-white/5 border border-white/10 rounded-xl text-center">
                      <span className="text-[7px] uppercase tracking-wider text-indigo-300 block font-black">Weight</span>
                      <span className="text-[11px] font-black text-white">{vitals?.weight || "—"}</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Live Scannable QR Code */}
                <div className="flex flex-col items-center justify-center p-2.5 bg-white/5 border border-white/10 rounded-2xl text-center">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsQrModalOpen(true);
                    }}
                    className="relative bg-white p-2 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer group"
                    title="Click to Enlarge QR Code"
                  >
                    {/* Render Real Scannable QR Code Image */}
                    {qrCodeUrl ? (
                      <img
                        src={qrCodeUrl}
                        alt="Scannable Health Record QR"
                        className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-lg"
                      />
                    ) : (
                      <QrCode size={96} className="text-slate-900" />
                    )}

                    <div className="absolute inset-0 bg-[#3d3f96]/70 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                      <Maximize2 size={20} />
                    </div>
                  </div>

                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-300 mt-2 flex items-center gap-1">
                    <CheckCircle2 size={11} /> Scan for Full Profile
                  </span>
                  <span className="text-[8px] text-indigo-200 mt-0.5">
                    Member Since {formatDate(memberSince)}
                  </span>
                </div>

              </div>

              {/* Back Footer */}
              <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between text-[8px] sm:text-[9px] text-indigo-200 font-bold">
                <span className="truncate">24x7 Diabetes Wala Care Helpline Support</span>
                <div className="flex items-center gap-1 text-white font-mono cursor-pointer">
                  <RotateCw size={10} /> Flip Front
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* --- Quick Action Copy Pills --- */}
        <div className="grid grid-cols-2 gap-2 print:hidden">
          <button
            onClick={(e) => handleCopy(e, abhaInfo?.abhaNumber, 'abha')}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white border border-slate-200 hover:border-[#3d3f96] text-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            {copiedAbha ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-[#3d3f96]" />}
            <span>{copiedAbha ? "ABHA Copied" : "Copy ABHA"}</span>
          </button>

          <button
            onClick={(e) => handleCopy(e, userId, 'id')}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white border border-slate-200 hover:border-[#3d3f96] text-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            {copiedId ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-[#3d3f96]" />}
            <span>{copiedId ? "Card ID Copied" : "Copy Card ID"}</span>
          </button>
        </div>

      </div>

      {/* --- ENLARGED SCANNER MODAL (FOR EASY DIRECT SCREEN SCANNING) --- */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in print:hidden">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl relative">
            <button
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="w-12 h-12 bg-indigo-50 text-[#3d3f96] rounded-2xl flex items-center justify-center mx-auto mb-3">
              <QrCode size={24} />
            </div>

            <h3 className="text-base font-black text-slate-800">Scan Health Passport</h3>
            <p className="text-[11px] text-slate-500 mt-1 mb-4">
              Open your phone camera or Google Lens to view full patient health & emergency details instantly.
            </p>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 inline-block mx-auto mb-4">
              {qrCodeUrl && (
                <img
                  src={qrCodeUrl}
                  alt="Scannable Health Record QR Code"
                  className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-xl"
                />
              )}
            </div>

            <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-xl text-[11px] font-bold text-left space-y-1">
              <div className="flex items-center gap-1.5 font-black uppercase text-[10px]">
                <CheckCircle2 size={12} className="text-emerald-600" /> Scans contain:
              </div>
              <p className="text-slate-600">
                Patient Name, Blood Group ({bloodGroup || '—'}), {diabeticProfile?.diabeticType || 'Diabetic'}, ABHA ({abhaInfo?.abhaNumber || '—'}), Vitals & Emergency Contacts.
              </p>
            </div>

            <button
              onClick={() => setIsQrModalOpen(false)}
              className="mt-4 w-full py-2.5 bg-[#3d3f96] text-white rounded-xl text-xs font-bold hover:bg-[#2d2f75] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

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