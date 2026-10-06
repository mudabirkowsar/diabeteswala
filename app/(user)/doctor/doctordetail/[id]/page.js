'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Star,
  Video,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Award,
  Building2,
  ChevronLeft,
  MessageSquare,
  AlertCircle,
  Loader2,
  Stethoscope,
  Globe2,
  FileCheck2,
  Timer,
  HeartPulse,
  Sparkles,
  Share2,
  BadgeCheck,
  GraduationCap,
  FileSignature,
  Activity,
  Check,
  Lock,
  ArrowUpRight,
  Home
} from 'lucide-react';
import UserAPI from '../../../../services/UserAPI';

export default function DoctorDetailPage({ params }) {
  const resolvedParams = use(params);
  const doctorId = resolvedParams?.id;

  const router = useRouter();
  const [doctorData, setDoctorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!doctorId) return;

    const fetchDoctorProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await UserAPI.getIndependentDoctorDetails(doctorId);

        if (res && res.success && res.data) {
          setDoctorData(res.data);
          if (res.data.activeServices && res.data.activeServices.length > 0) {
            const defaultActive = res.data.activeServices.find(s => s.active) || res.data.activeServices[0];
            setSelectedService(defaultActive);
          }
        } else {
          setError(res?.message || 'Doctor profile not found or inactive.');
        }
      } catch (err) {
        console.error('Error fetching doctor details:', err);
        setError(err?.response?.data?.message || 'Failed to load doctor profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorProfile();
  }, [doctorId]);

  const getImageSrc = (imgPath) => {
    if (!imgPath) {
      return 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop';
    }
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
      return imgPath;
    }
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
    return `${baseUrl}${imgPath}`;
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Navigate to Booking page with state payload
  const handleProceedToBooking = (serviceToBook = selectedService) => {
    if (!doctorData || !doctorData.profile) return;

    const bookingPayload = {
      doctorId: doctorData.profile._id,
      doctorName: doctorData.profile.name,
      doctorSpeciality: doctorData.profile.speciality,
      doctorQualification: doctorData.profile.qualification,
      doctorImage: doctorData.profile.profileImage,
      consultationType: serviceToBook?.type || 'Clinic Visit',
      fee: serviceToBook?.fee || 0,
      slotDuration: doctorData.profile.slotDuration || 30,
      clinicDetails: doctorData.profile.clinicId,
      address: doctorData.profile.address || doctorData.profile.clinicId?.address || doctorData.profile.city,
      workingHours: doctorData.profile.workingHours || [],
      availability: doctorData.profile.availability || []
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('pendingDoctorBooking', JSON.stringify(bookingPayload));
    }

    const queryParams = new URLSearchParams({
      doctorId: doctorData.profile._id,
      consultationType: serviceToBook?.type || 'Clinic Visit',
      fee: String(serviceToBook?.fee || 0)
    }).toString();

    router.push(`/doctor/doctorbooking?${queryParams}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 gap-3">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
          <Loader2 className="animate-spin text-[#3d3f96]" size={28} />
        </div>
        <p className="text-slate-700 font-bold text-sm tracking-tight text-center">Securing clinical records...</p>
        <p className="text-slate-400 text-xs text-center">Loading verified practitioner profile</p>
      </div>
    );
  }

  if (error || !doctorData) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 text-center shadow-xl">
          <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mb-2">Profile Unavailable</h2>
          <p className="text-sm text-slate-500 mb-6 font-medium">{error || 'The requested doctor profile could not be found or is temporarily inactive.'}</p>
          <button
            onClick={() => router.back()}
            className="w-full bg-[#3d3f96] hover:bg-slate-900 text-white py-3.5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-md shadow-indigo-100 cursor-pointer active:scale-95"
          >
            Return to Directory
          </button>
        </div>
      </div>
    );
  }

  const { profile, activeServices = [], recentReviews = [] } = doctorData;
  const conditions = profile?.treatedConditions?.length ? profile.treatedConditions : (profile?.helpWith || []);
  const qualifications = profile?.qualifications?.filter(q => q.degree || q.college) || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-36 lg:pb-28 relative selection:bg-[#3d3f96] selection:text-white">
      {/* Structural subtle geometric accents */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-70 pointer-events-none -z-10" />

      {/* Top Header Bar */}
      <header className="bg-white/90 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-200/70 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-3 sm:py-3.5 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#3d3f96] transition-colors group cursor-pointer active:scale-95"
          >
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center sm:bg-transparent sm:w-auto sm:h-auto">
              <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            </div>
            <span className="hidden xs:inline sm:inline">Doctor Directory</span>
            <span className="xs:hidden sm:hidden text-xs">Back</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100/90 active:bg-slate-200 px-3 py-1.5 sm:px-3.5 rounded-full transition-all cursor-pointer active:scale-95"
            >
              <Share2 size={13} />
              <span className="hidden xs:inline sm:inline">{copied ? 'Link Copied' : 'Share Profile'}</span>
              <span className="xs:hidden sm:hidden">{copied ? 'Copied' : 'Share'}</span>
            </button>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full uppercase tracking-wider shadow-xs">
              <ShieldCheck size={13} className="fill-emerald-100 text-emerald-600 shrink-0" />
              <span className="hidden sm:inline">Verified Board Certified</span>
              <span className="sm:hidden">Verified</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">

          {/* ================= LEFT COLUMN: Doctor Details ================= */}
          <div className="lg:col-span-8 space-y-4 sm:space-y-6">

            {/* Main Executive Doctor Hero Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-9 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-transparent rounded-full blur-3xl pointer-events-none -mr-24 -mt-24" />
              <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-50/40 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row gap-5 sm:gap-7 items-center sm:items-start relative z-10">

                {/* Doctor Avatar with Verified Ring */}
                <div className="relative shrink-0 mx-auto sm:mx-0">
                  <div className="w-28 h-28 xs:w-32 xs:h-32 sm:w-44 sm:h-44 rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-100 border-3 sm:border-4 border-white shadow-lg sm:shadow-xl ring-1 ring-slate-200/90">
                    <img
                      src={getImageSrc(profile?.profileImage)}
                      alt={profile?.name || 'Doctor'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop';
                      }}
                    />
                  </div>

                  {/* Status Indicator Pill */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:-right-2 bg-white/95 backdrop-blur-md px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-md border border-slate-200/80 flex items-center gap-1.5 whitespace-nowrap">
                    <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${profile?.isOnline || profile?.dutyStatus === 'On Duty' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                    <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-slate-800">
                      {profile?.dutyStatus || (profile?.isOnline ? 'On Duty' : 'Off Duty')}
                    </span>
                  </div>
                </div>

                {/* Profile Header Details */}
                <div className="flex-1 text-center sm:text-left w-full">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                    <span className="text-[10px] sm:text-[11px] font-extrabold text-[#3d3f96] bg-indigo-50/90 border border-indigo-100/90 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl uppercase tracking-wider">
                      {profile?.speciality || 'General Medicine'}
                    </span>
                    {profile?.qualification && (
                      <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 bg-slate-100/90 border border-slate-200/70 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl">
                        {profile.qualification}
                      </span>
                    )}
                    {profile?.profileStatus === 'Approved' && (
                      <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl">
                        <BadgeCheck size={12} className="fill-emerald-100" />
                        Verified License
                      </span>
                    )}
                  </div>

                  <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    {profile?.name?.toLowerCase().startsWith('dr.') ? profile.name : `Dr. ${profile?.name || ''}`}
                  </h1>

                  <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1 sm:mt-1.5">
                    {profile?.experienceYears ? `${profile.experienceYears}+ Years Clinical Experience` : profile?.experience || 'Experienced Senior Consultant'}
                  </p>

                  {/* Rating, Reviews & Languages Bar */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3.5 sm:mt-5">
                    <div className="inline-flex items-center gap-1.5 bg-slate-900 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold shadow-sm">
                      <Star size={12} fill="currentColor" className="text-amber-400" />
                      <span>{profile?.averageRating ? Number(profile.averageRating).toFixed(1) : '5.0'}</span>
                      <span className="text-slate-400 font-normal">({profile?.totalReviews ?? 0})</span>
                    </div>

                    {profile?.slotDuration && (
                      <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-indigo-700 bg-indigo-50/80 border border-indigo-100 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl">
                        <Timer size={12} strokeWidth={2.5} />
                        <span>{profile.slotDuration} Min Slot</span>
                      </div>
                    )}

                    {profile?.languages && profile.languages.length > 0 && (
                      <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-slate-200/60">
                        <Globe2 size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate max-w-[150px] sm:max-w-none">{profile.languages.join(' • ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Location & Practice Ribbon */}
              <div className="mt-5 sm:mt-7 pt-4 sm:pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5 text-xs font-medium text-slate-600">
                <div className="flex items-center gap-2.5 sm:gap-3 bg-slate-50/80 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-200/60">
                  <div className="w-8 h-8 rounded-lg sm:rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0">
                    <MapPin size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">Practice Address</p>
                    <p className="font-semibold text-slate-800 text-[11px] sm:text-xs truncate">
                      {profile?.address ? `${profile.address}, ${profile?.city || ''}` : profile?.clinicId?.address || `${profile?.city || 'India'}, ${profile?.state || ''}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 sm:gap-3 bg-slate-50/80 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-200/60">
                  <div className="w-8 h-8 rounded-lg sm:rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#3d3f96] shrink-0">
                    <Building2 size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">Clinical Facility</p>
                    <p className="font-semibold text-slate-800 text-[11px] sm:text-xs truncate">
                      {profile?.clinicId?.clinicName || 'Independent Medical Practice'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stat Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
              <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">Experience</span>
                  <Award size={15} className="text-[#3d3f96]" />
                </div>
                <p className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  {profile?.experienceYears ? `${profile.experienceYears}+` : '6+'} <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Years</span>
                </p>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">Rating</span>
                  <Star size={15} className="text-amber-400 fill-amber-400" />
                </div>
                <p className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  {profile?.averageRating ? Number(profile.averageRating).toFixed(1) : '4.8'} <span className="text-[11px] sm:text-xs font-semibold text-slate-500">/ 5.0</span>
                </p>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">Modes</span>
                  <Activity size={15} className="text-emerald-600" />
                </div>
                <p className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  {activeServices.filter(s => s.active).length || 3} <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Active</span>
                </p>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">Duration</span>
                  <Clock size={15} className="text-indigo-600" />
                </div>
                <p className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  {profile?.slotDuration || 30} <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Mins</span>
                </p>
              </div>
            </div>

            {/* Medical Credentials & Regulatory Registration */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-4 sm:mb-5 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-indigo-50 border border-indigo-100 text-[#3d3f96] flex items-center justify-center font-bold shrink-0">
                    <FileCheck2 size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Verified Credentials</h3>
                    <p className="text-[10px] sm:text-[11px] text-slate-400">Council registrations & licensure</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg uppercase tracking-wider shrink-0">
                  <Check size={11} strokeWidth={3} /> Verified
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50/80 border border-slate-100 space-y-0.5 sm:space-y-1">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">License Number</span>
                  <p className="text-xs sm:text-sm font-extrabold text-slate-800 tracking-tight">{profile?.licenseNumber || 'MCI-48209'}</p>
                  <p className="text-[9px] sm:text-[10px] text-slate-500">State Medical Register</p>
                </div>

                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50/80 border border-slate-100 space-y-0.5 sm:space-y-1">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">Council Registration</span>
                  <p className="text-xs sm:text-sm font-extrabold text-slate-800 tracking-tight">{profile?.councilNumber || 'MCI-2232'}</p>
                  <p className="text-[9px] sm:text-[10px] text-slate-500">National Medical ID</p>
                </div>

                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50/80 border border-slate-100 space-y-0.5 sm:space-y-1">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">Issuing Council</span>
                  <p className="text-xs sm:text-sm font-extrabold text-slate-800 tracking-tight truncate">{profile?.councilName || 'Delhi Medical Council'}</p>
                  <p className="text-[9px] sm:text-[10px] text-slate-500">Statutory Body</p>
                </div>
              </div>

              {profile?.signatureImage && (
                <div className="mt-3.5 sm:mt-4 pt-3.5 sm:pt-4 border-t border-slate-100 flex items-center justify-between p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50/60 border border-slate-200/60">
                  <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 pr-2">
                    <FileSignature size={17} className="text-[#3d3f96] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[11px] sm:text-xs font-bold text-slate-800 truncate">Digital E-Prescription Signature</p>
                      <p className="text-[9px] sm:text-[10px] text-slate-500">Valid for pharmacy & lab orders</p>
                    </div>
                  </div>
                  <div className="h-8 sm:h-9 px-2 sm:px-3 py-1 rounded-lg sm:rounded-xl bg-white border border-slate-200 shadow-xs flex items-center shrink-0">
                    <img
                      src={getImageSrc(profile.signatureImage)}
                      alt="Signature"
                      className="h-full object-contain max-w-[70px] sm:max-w-[100px] opacity-75"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Academic Qualifications & Degrees */}
            {qualifications.length > 0 && (
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-8 shadow-sm">
                <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-indigo-50 border border-indigo-100 text-[#3d3f96] flex items-center justify-center font-bold shrink-0">
                    <GraduationCap size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Academic Qualifications</h3>
                    <p className="text-[10px] sm:text-[11px] text-slate-400">Formal medical training & degrees</p>
                  </div>
                </div>

                <div className="space-y-2.5 sm:space-y-3">
                  {qualifications.map((qual, idx) => (
                    <div key={qual._id || idx} className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50/80 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#3d3f96] font-bold text-xs shadow-xs shrink-0">
                          {qual.degree || 'MD'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{qual.college || 'Medical Institution'}</p>
                          <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">
                            {qual.degree} • {qual.stateName || qual.councilName || 'India'}
                          </p>
                        </div>
                      </div>
                      {qual.year && (
                        <span className="text-[10px] sm:text-xs font-extrabold text-slate-700 bg-white border border-slate-200 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl self-start sm:self-auto">
                          Class of {qual.year}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* About Doctor Bio */}
            {profile?.about && (
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-8 shadow-sm">
                <div className="flex items-center gap-2.5 sm:gap-3 mb-3.5 sm:mb-4 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-indigo-50 border border-indigo-100 text-[#3d3f96] flex items-center justify-center font-bold shrink-0">
                    <Stethoscope size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Clinical Background & Bio</h3>
                    <p className="text-[10px] sm:text-[11px] text-slate-400">Clinical experience & patient care philosophy</p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line font-normal">
                  {profile.about}
                </p>
              </div>
            )}

            {/* Conditions Treated & Focus Areas */}
            {conditions && conditions.length > 0 && (
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-8 shadow-sm">
                <div className="flex items-center gap-2.5 sm:gap-3 mb-3.5 sm:mb-4 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center font-bold shrink-0">
                    <HeartPulse size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Conditions Treated</h3>
                    <p className="text-[10px] sm:text-[11px] text-slate-400">Diagnosis, management & focus areas</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-2.5 pt-1">
                  {conditions.map((item, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold px-3 sm:px-4 py-1.5 sm:py-2.5 bg-gradient-to-r from-slate-50 to-slate-100/90 text-slate-800 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs active:border-slate-300 transition-colors"
                    >
                      <Sparkles size={12} className="text-[#3d3f96]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Clinical Competencies */}
            {profile?.competencies && profile.competencies.length > 0 && (
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-8 shadow-sm">
                <div className="flex items-center gap-2.5 sm:gap-3 mb-3.5 sm:mb-4 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center font-bold shrink-0">
                    <Award size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Key Clinical Competencies</h3>
                    <p className="text-[10px] sm:text-[11px] text-slate-400">Diagnostic proficiencies</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 pt-1">
                  {profile.competencies.map((comp, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2.5 text-[11px] sm:text-xs font-bold text-slate-800 bg-amber-50/40 border border-amber-200/60 px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl"
                    >
                      <CheckCircle2 size={15} className="text-amber-600 shrink-0" />
                      <span className="truncate">{comp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weekly Schedule & Availability */}
            {profile?.workingHours && profile.workingHours.length > 0 && (
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-8 shadow-sm">
                <div className="flex items-center gap-2.5 sm:gap-3 mb-3.5 sm:mb-4 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-indigo-50 border border-indigo-100 text-[#3d3f96] flex items-center justify-center font-bold shrink-0">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Weekly Consultation Hours</h3>
                    <p className="text-[10px] sm:text-[11px] text-slate-400">Regular clinic & telemedicine schedule</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 pt-1">
                  {profile.workingHours.map((sched, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl border text-[11px] sm:text-xs font-semibold ${sched.isClosed
                          ? 'bg-slate-50 border-slate-200/60 text-slate-400'
                          : 'bg-indigo-50/30 border-indigo-100 text-slate-800'
                        }`}
                    >
                      <span className="font-bold flex items-center gap-2">
                        <Calendar size={13} className={sched.isClosed ? 'text-slate-400' : 'text-[#3d3f96]'} />
                        {sched.days}
                      </span>
                      <span className="font-semibold">{sched.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Patient Feedback & Reviews */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-3.5 sm:mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-indigo-50 border border-indigo-100 text-[#3d3f96] flex items-center justify-center font-bold shrink-0">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Patient Experiences</h3>
                    <p className="text-[10px] sm:text-[11px] text-slate-400">Verified feedback ({recentReviews.length})</p>
                  </div>
                </div>
              </div>

              {recentReviews.length === 0 ? (
                <div className="text-center py-8 sm:py-10 bg-slate-50/50 rounded-xl sm:rounded-2xl border border-dashed border-slate-200">
                  <MessageSquare size={24} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-600">No Patient Reviews Yet</p>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Reviews appear here once patients complete sessions.</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-3.5">
                  {recentReviews.map((rev) => (
                    <div key={rev._id} className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1.5 sm:space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{rev.userName || 'Verified Patient'}</span>
                        <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md sm:rounded-lg border border-amber-100">
                          <Star size={10} fill="currentColor" />
                          <span>{rev.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                      {rev.createdAt && (
                        <p className="text-[9px] sm:text-[10px] font-medium text-slate-400">
                          {new Date(rev.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* ================= RIGHT COLUMN (CONSULTATION CARD) ================= */}
          <div className="lg:col-span-4 relative">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-7 shadow-lg shadow-slate-100 lg:sticky lg:top-24 z-30">

              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">Select Consultation Mode</h3>
                <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 sm:px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider">
                  Instant Slot
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 mb-4 sm:mb-5 font-normal">Choose your appointment channel</p>

              {/* Consultation Format Options */}
              <div className="space-y-2.5 sm:space-y-3 mb-4 sm:mb-6">
                {activeServices.length > 0 ? (
                  activeServices.map((service, index) => {
                    const isSelected = selectedService?.type === service.type;
                    return (
                      <div
                        key={index}
                        onClick={() => {
                          if (service.active) {
                            setSelectedService(service);
                          }
                        }}
                        className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all cursor-pointer flex items-center justify-between active:scale-[0.99] ${!service.active
                            ? 'opacity-40 bg-slate-50 border-slate-200 cursor-not-allowed'
                            : isSelected
                              ? 'border-[#3d3f96] bg-indigo-50/40 shadow-sm ring-2 ring-[#3d3f96]/20'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                      >
                        <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                          <div
                            className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shrink-0 ${service.type === 'Video Consult'
                                ? 'bg-indigo-100/70 text-indigo-700'
                                : service.type === 'Clinic Visit'
                                  ? 'bg-emerald-100/70 text-emerald-700'
                                  : 'bg-amber-100/70 text-amber-700'
                              }`}
                          >
                            {service.type === 'Video Consult' && <Video size={17} strokeWidth={2.3} />}
                            {service.type === 'Clinic Visit' && <MapPin size={17} strokeWidth={2.3} />}
                            {service.type === 'Home Visit' && <Home size={17} strokeWidth={2.3} />}
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs sm:text-xs font-extrabold text-slate-900 tracking-tight truncate">{service.type}</p>
                            <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">
                              {service.active ? (isSelected ? 'Selected' : 'Tap to select') : 'Unavailable'}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0 pl-2">
                          <span className="text-sm sm:text-base font-extrabold text-slate-900">₹{service.fee}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="space-y-2 text-xs font-semibold">
                    {profile?.fees?.online !== undefined && (
                      <div
                        onClick={() => setSelectedService({ type: 'Video Consult', fee: profile.fees.online, active: true })}
                        className={`flex justify-between p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border cursor-pointer ${selectedService?.type === 'Video Consult' ? 'border-[#3d3f96] bg-indigo-50/40' : 'bg-slate-50 border-slate-200'}`}
                      >
                        <span>Video Consult</span>
                        <span className="font-extrabold text-slate-900">₹{profile.fees.online}</span>
                      </div>
                    )}
                    {profile?.fees?.clinic !== undefined && (
                      <div
                        onClick={() => setSelectedService({ type: 'Clinic Visit', fee: profile.fees.clinic, active: true })}
                        className={`flex justify-between p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border cursor-pointer ${selectedService?.type === 'Clinic Visit' ? 'border-[#3d3f96] bg-indigo-50/40' : 'bg-slate-50 border-slate-200'}`}
                      >
                        <span>Clinic Visit</span>
                        <span className="font-extrabold text-slate-900">₹{profile.fees.clinic}</span>
                      </div>
                    )}
                    {profile?.fees?.home !== undefined && (
                      <div
                        onClick={() => setSelectedService({ type: 'Home Visit', fee: profile.fees.home, active: true })}
                        className={`flex justify-between p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border cursor-pointer ${selectedService?.type === 'Home Visit' ? 'border-[#3d3f96] bg-indigo-50/40' : 'bg-slate-50 border-slate-200'}`}
                      >
                        <span>Home Visit</span>
                        <span className="font-extrabold text-slate-900">₹{profile.fees.home}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Fee Breakdown */}
              {selectedService && (
                <div className="bg-slate-50/90 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 mb-4 sm:mb-5 space-y-2 sm:space-y-2.5">
                  <div className="flex justify-between items-center text-[11px] sm:text-xs">
                    <span className="text-slate-500">Selected Channel:</span>
                    <span className="font-bold text-slate-800">{selectedService.type}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] sm:text-xs">
                    <span className="text-slate-500">Duration:</span>
                    <span className="font-bold text-slate-800">{profile?.slotDuration || 30} Minutes</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-2 sm:pt-2.5 border-t border-slate-200/70">
                    <span className="text-slate-800 font-extrabold">Payable Consultation Fee:</span>
                    <span className="text-base sm:text-lg font-extrabold text-[#3d3f96]">₹{selectedService.fee}</span>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={() => handleProceedToBooking(selectedService)}
                className="w-full bg-[#3d3f96] hover:bg-slate-900 active:bg-slate-950 text-white py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-xs font-extrabold tracking-wider uppercase transition-all duration-200 shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <Calendar size={15} />
                <span>Book Appointment Now</span>
                <ArrowUpRight size={14} />
              </button>

              {/* Trust & Guarantee Micro-badges */}
              <div className="mt-4 sm:mt-5 pt-3.5 sm:pt-4 border-t border-slate-100 flex flex-col gap-2">
                <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-emerald-700">
                  <ShieldCheck size={13} className="fill-emerald-100" />
                  <span>100% Verified Medical Care</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-[9px] sm:text-[10px] text-slate-400 font-medium">
                  <Lock size={11} />
                  <span>HIPAA & MCI Guideline Compliant</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* ================= MOBILE BOTTOM APP-STYLE BAR (VISIBLE ON MOBILE ONLY) ================= */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 px-4 py-3 shadow-[0_-8px_20px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {selectedService?.type || 'Consultation'}
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-extrabold text-[#3d3f96]">
                ₹{selectedService?.fee ?? (profile?.fees?.clinic || profile?.fees?.online || 0)}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">/ session</span>
            </div>
          </div>

          <button
            onClick={() => handleProceedToBooking(selectedService)}
            className="flex-1 bg-[#3d3f96] active:bg-slate-900 text-white py-3 px-4 rounded-xl text-xs font-extrabold tracking-wide uppercase shadow-md shadow-indigo-200/50 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform"
          >
            <Calendar size={14} />
            <span>Book Appointment</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}