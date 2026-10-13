"use client";
import React, { useState, useEffect } from 'react';
import {
    X,
    Building2,
    MapPin,
    Phone,
    Mail,
    Calendar,
    Clock,
    ShieldCheck,
    CheckCircle2,
    XCircle,
    AlertCircle,
    FileText,
    ExternalLink,
    Stethoscope,
    BedDouble,
    Truck,
    Landmark,
    Award,
    Image as ImageIcon,
    Loader2,
    DollarSign,
    Check,
    ChevronRight,
    Users,
    Activity
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminAPI from '../../../../../services/AdminAPI';

export default function ClinicDetail({ clinicId, onClose, onActionSuccess, onTriggerDecision }) {
    const [loading, setLoading] = useState(true);
    const [detailData, setDetailData] = useState(null);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'doctors' | 'wards' | 'ambulances' | 'documents' | 'bank'
    const [previewImage, setPreviewImage] = useState(null);

    const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

    const getMediaUrl = (path) => {
        if (!path) return null;
        if (path.startsWith("http://") || path.startsWith("https://")) return path;
        const cleanPath = path.startsWith("/") ? path.substring(1) : path;
        return `${BASE_SERVER_URL}/${cleanPath}`;
    };

    const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1631549916768-4119b255f926?q=80&w=200";

    useEffect(() => {
        if (!clinicId) return;
        const fetchClinicDetails = async () => {
            setLoading(true);
            try {
                const response = await AdminAPI.getClinicDetailAdmin(clinicId);
                if (response && response.success) {
                    setDetailData(response.data);
                } else {
                    toast.error(response?.message || "Failed to load clinic details.");
                }
            } catch (err) {
                console.error(err);
                toast.error(err.response?.data?.message || "Error fetching clinic dossier.");
            } finally {
                setLoading(false);
            }
        };

        fetchClinicDetails();
    }, [clinicId]);

    if (!clinicId) return null;

    const clinic = detailData?.clinic;
    const overview = detailData?.overview;
    const doctors = detailData?.doctors || [];
    const wards = detailData?.wards || [];
    const ambulances = detailData?.ambulances || [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 select-none">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
                onClick={onClose} 
            />

            {/* Modal Dialog */}
            <div className="bg-slate-50 rounded-[2.5rem] max-w-6xl w-full h-[92vh] flex flex-col shadow-2xl relative z-10 border border-slate-100 overflow-hidden">
                
                {/* --- HEADER --- */}
                <div className="bg-white px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-150 overflow-hidden flex-shrink-0 shadow-sm">
                            <img
                                src={getMediaUrl(clinic?.image) || PLACEHOLDER_IMAGE}
                                alt={clinic?.clinicName || "Clinic"}
                                onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                                    {clinic?.clinicName || "Clinic 360° Audit"}
                                </h2>
                                {clinic && (
                                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
                                        clinic.Accountverify === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                        clinic.Accountverify === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                        clinic.Accountverify === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                        'bg-slate-100 text-slate-600 border-slate-200'
                                    }`}>
                                        {clinic.Accountverify}
                                    </span>
                                )}
                                {clinic && (
                                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
                                        clinic.isActive ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                                    }`}>
                                        {clinic.isActive ? 'Active on Directory' : 'Hidden'}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-400 font-semibold mt-0.5 flex items-center gap-2">
                                <span>Owner: <strong className="text-slate-600">{clinic?.name || "--"}</strong></span>
                                {clinic?.regId && <span>• Reg ID: <span className="font-mono text-slate-600">{clinic.regId}</span></span>}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {clinic && (
                            <div className="hidden sm:flex items-center gap-2">
                                <button
                                    onClick={() => onTriggerDecision(clinic, 'Rejected')}
                                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl transition cursor-pointer"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => onTriggerDecision(clinic, 'Approved')}
                                    className="px-4 py-2 bg-[#3d3f96] hover:bg-[#32347d] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm shadow-[#3d3f96]/20"
                                >
                                    Approve Clinic
                                </button>
                            </div>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-all cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* --- NAVIGATION TABS --- */}
                <div className="bg-white px-6 sm:px-8 border-b border-slate-100 flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar shrink-0">
                    {[
                        { id: 'overview', label: 'Overview & Operations', icon: Activity },
                        { id: 'doctors', label: `Doctors (${doctors.length})`, icon: Stethoscope },
                        { id: 'wards', label: `Wards & Beds (${wards.length})`, icon: BedDouble },
                        { id: 'ambulances', label: `Ambulances (${ambulances.length})`, icon: Truck },
                        { id: 'documents', label: 'Documents & Gallery', icon: FileText },
                        { id: 'bank', label: 'Bank Account', icon: Landmark }
                    ].map(tab => {
                        const IconComponent = tab.icon;
                        const isCurrent = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 py-3.5 px-3.5 border-b-2 text-xs font-bold tracking-tight transition-all whitespace-nowrap cursor-pointer ${
                                    isCurrent
                                        ? 'border-[#3d3f96] text-[#3d3f96]'
                                        : 'border-transparent text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                <IconComponent size={14} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* --- MODAL CONTENT BODY --- */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                    {loading ? (
                        <div className="h-full min-h-[350px] flex flex-col items-center justify-center">
                            <Loader2 size={36} className="animate-spin text-[#3d3f96] mb-3" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Generating 360° Clinic Dossier...
                            </p>
                        </div>
                    ) : !clinic ? (
                        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
                            <AlertCircle size={40} className="mx-auto text-slate-300 mb-2" />
                            <p className="text-sm font-bold text-slate-500">Failed to render clinic details.</p>
                        </div>
                    ) : (
                        <>
                            {/* Rejection Alert if applicable */}
                            {clinic.Accountverify === 'Rejected' && (clinic.rejectionReason || clinic.rejectReason) && (
                                <div className="p-4 bg-rose-50 border border-rose-200/60 rounded-2xl flex items-start gap-3">
                                    <AlertCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-xs font-black uppercase text-rose-800 tracking-wider">Rejection Reason</h4>
                                        <p className="text-xs font-medium text-rose-700 mt-0.5">
                                            {clinic.rejectionReason || clinic.rejectReason}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* --- TAB 1: OVERVIEW & OPERATIONS --- */}
                            {activeTab === 'overview' && (
                                <div className="space-y-6">
                                    {/* Metric Counters */}
                                    {overview && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Doctors</p>
                                                <p className="text-xl font-black text-slate-900 mt-1">{overview.totalDoctors || 0}</p>
                                            </div>
                                            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Wards</p>
                                                <p className="text-xl font-black text-slate-900 mt-1">{overview.totalWards || 0}</p>
                                            </div>
                                            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Beds</p>
                                                <p className="text-xl font-black text-slate-900 mt-1">{overview.totalBeds || 0}</p>
                                            </div>
                                            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-500">Available Beds</p>
                                                <p className="text-xl font-black text-emerald-600 mt-1">{overview.availableBeds || 0}</p>
                                            </div>
                                            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                                <p className="text-[10px] font-black uppercase tracking-wider text-amber-500">Occupied Beds</p>
                                                <p className="text-xl font-black text-amber-600 mt-1">{overview.occupiedBeds || 0}</p>
                                            </div>
                                            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Ambulances</p>
                                                <p className="text-xl font-black text-[#3d3f96] mt-1">{overview.totalAmbulances || 0}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Primary Info & Features Grid */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Basic Dossier */}
                                        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Basic Clinic Information</h3>
                                            
                                            {clinic.About && (
                                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">About / Bio</p>
                                                    <p className="text-xs text-slate-600 leading-relaxed">{clinic.About}</p>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase text-slate-400">Registered Email</p>
                                                    <p className="text-xs font-bold text-slate-800 mt-0.5 select-all">{clinic.email || "--"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase text-slate-400">Primary Phone</p>
                                                    <p className="text-xs font-bold text-slate-800 mt-0.5">
                                                        {clinic.ctrCode ? `${clinic.ctrCode} ` : ""}{clinic.phoneNumber || "--"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase text-slate-400">Alternate Phone</p>
                                                    <p className="text-xs font-bold text-slate-800 mt-0.5">
                                                        {clinic.altphnctrcode ? `${clinic.altphnctrcode} ` : ""}{clinic.alternatePhoneNumber || "--"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase text-slate-400">Doctor / Clinic Experience</p>
                                                    <p className="text-xs font-bold text-slate-800 mt-0.5">{clinic.experience || "Not Provided"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase text-slate-400">Physical Address</p>
                                                    <p className="text-xs font-bold text-slate-800 mt-0.5">
                                                        {clinic.address ? `${clinic.address}, ${clinic.city}, ${clinic.state}, ${clinic.country}` : "Unspecified"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase text-slate-400">GPS Coordinates</p>
                                                    <p className="text-xs font-mono font-bold text-slate-800 mt-0.5">
                                                        {clinic.location?.coordinates ? `${clinic.location.coordinates[1]} N, ${clinic.location.coordinates[0]} E` : "--"}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Specialities tags */}
                                            {clinic.SpecialistsId && clinic.SpecialistsId.length > 0 && (
                                                <div className="pt-3 border-t border-slate-100">
                                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Registered Specialities</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {clinic.SpecialistsId.map(spec => (
                                                            <span key={spec._id || spec.name} className="px-3 py-1 bg-indigo-50/70 border border-indigo-150 text-[#3d3f96] rounded-xl text-[11px] font-bold">
                                                                {spec.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Service Capabilities & Flags */}
                                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Facility Capabilities</h3>
                                            <div className="space-y-2.5">
                                                {[
                                                    { label: "24x7 Facility", val: clinic.is24x7 },
                                                    { label: "OPD Services", val: clinic.isOPD },
                                                    { label: "IPD / Daycare", val: clinic.isIPD },
                                                    { label: "Emergency Unit", val: clinic.isEmergency },
                                                    { label: "Ambulance Network", val: clinic.isAmbulanceAvailable },
                                                    { label: "Online Chat Support", val: clinic.chatStatus === 'Active' },
                                                    { label: "Telehealth Live", val: clinic.isOnline }
                                                ].map((item, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs font-bold">
                                                        <span className="text-slate-700">{item.label}</span>
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                                                            item.val ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200/70 text-slate-400'
                                                        }`}>
                                                            {item.val ? <Check size={11} /> : null}
                                                            {item.val ? 'Available' : 'Disabled'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Operational Timings & Shifts */}
                                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Operational Shifts & Schedule</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                <p className="text-[10px] font-black uppercase text-slate-400">Working Days</p>
                                                <p className="text-xs font-black text-slate-800 mt-1">
                                                    {clinic.startDay || "Mon"} – {clinic.endDay || "Sat"}
                                                </p>
                                                <p className="text-[10px] font-bold text-rose-500 mt-0.5">Off: {clinic.holiday || "None"}</p>
                                            </div>
                                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                <p className="text-[10px] font-black uppercase text-slate-400">General OPD Shifts</p>
                                                <p className="text-xs font-bold text-slate-800 mt-1">
                                                    M: {clinic.MorningStartTime || "--"} - {clinic.MorningEndTime || "--"}
                                                </p>
                                                <p className="text-xs font-bold text-slate-800">
                                                    E: {clinic.eveningStartTime || "--"} - {clinic.eveningEndTime || "--"}
                                                </p>
                                            </div>
                                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                <p className="text-[10px] font-black uppercase text-slate-400">IPD Hours</p>
                                                <p className="text-xs font-bold text-slate-800 mt-1">
                                                    {clinic.ipdTimings?.is24x7 ? "24x7 Available" : `${clinic.ipdTimings?.startTime || "--"} - ${clinic.ipdTimings?.endTime || "--"}`}
                                                </p>
                                            </div>
                                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                <p className="text-[10px] font-black uppercase text-slate-400">Emergency Timings</p>
                                                <p className="text-xs font-bold text-rose-600 mt-1">
                                                    {clinic.emergencyTimings?.is24x7 ? "24x7 Emergency Ready" : `${clinic.emergencyTimings?.startTime || "--"} - ${clinic.emergencyTimings?.endTime || "--"}`}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- TAB 2: DOCTORS --- */}
                            {activeTab === 'doctors' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Attached Medical Practitioners</h3>
                                        <span className="text-xs font-bold text-slate-500">{doctors.length} doctors found</span>
                                    </div>

                                    {doctors.length === 0 ? (
                                        <div className="p-12 text-center bg-white rounded-3xl border border-slate-100">
                                            <Stethoscope size={36} className="mx-auto text-slate-300 mb-2" />
                                            <p className="text-xs font-bold text-slate-500">No doctors registered under this clinic yet.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {doctors.map((doc) => (
                                                <div key={doc._id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between gap-4">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-150 overflow-hidden shrink-0">
                                                            <img
                                                                src={getMediaUrl(doc.profileImage) || PLACEHOLDER_IMAGE}
                                                                alt={doc.name}
                                                                onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between">
                                                                <h4 className="text-sm font-black text-slate-800">{doc.name}</h4>
                                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                                                                    doc.dutyStatus === 'On Duty' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                                                }`}>
                                                                    {doc.dutyStatus}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-[#3d3f96] font-bold mt-0.5">{doc.speciality}</p>
                                                            <p className="text-[11px] text-slate-400 font-semibold">{doc.qualification} • {doc.experienceYears || 0} yrs exp</p>
                                                            
                                                            <div className="mt-2 text-[11px] text-slate-500 space-y-0.5">
                                                                <p className="flex items-center gap-1.5"><Phone size={11} /> {doc.phone || "--"}</p>
                                                                <p className="flex items-center gap-1.5 select-all"><Mail size={11} /> {doc.email || "--"}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Doctor Consultation Pricing */}
                                                    {doc.fees && (
                                                        <div className="bg-slate-50 p-3 rounded-2xl grid grid-cols-3 gap-2 text-center border border-slate-100">
                                                            <div>
                                                                <p className="text-[9px] font-black uppercase text-slate-400">Online</p>
                                                                <p className="text-xs font-black text-slate-800">₹{doc.fees.online ?? 0}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[9px] font-black uppercase text-slate-400">In-Clinic</p>
                                                                <p className="text-xs font-black text-slate-800">₹{doc.fees.clinic ?? 0}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[9px] font-black uppercase text-slate-400">Home Visit</p>
                                                                <p className="text-xs font-black text-slate-800">₹{doc.fees.home ?? 0}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* --- TAB 3: WARDS & BEDS --- */}
                            {activeTab === 'wards' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Wards and IPD Bed Allocation</h3>
                                        <span className="text-xs font-bold text-slate-500">{wards.length} wards configured</span>
                                    </div>

                                    {wards.length === 0 ? (
                                        <div className="p-12 text-center bg-white rounded-3xl border border-slate-100">
                                            <BedDouble size={36} className="mx-auto text-slate-300 mb-2" />
                                            <p className="text-xs font-bold text-slate-500">No daycare or IPD wards registered.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {wards.map((ward) => (
                                                <div key={ward._id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h4 className="text-sm font-black text-slate-800">{ward.name}</h4>
                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                                                                {ward.type}
                                                            </span>
                                                        </div>
                                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                                                            ward.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'
                                                        }`}>
                                                            {ward.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50">
                                                        <div className="bg-slate-50 p-2.5 rounded-xl">
                                                            <p className="text-[9px] font-black uppercase text-slate-400">Total Capacity</p>
                                                            <p className="text-sm font-black text-slate-800 mt-0.5">{ward.totalBeds} Beds</p>
                                                        </div>
                                                        <div className="bg-emerald-50/60 p-2.5 rounded-xl">
                                                            <p className="text-[9px] font-black uppercase text-emerald-600">Available Beds</p>
                                                            <p className="text-sm font-black text-emerald-700 mt-0.5">{ward.availableBeds} Free</p>
                                                        </div>
                                                    </div>

                                                    <div className="bg-slate-50 p-2.5 rounded-xl flex items-center justify-between">
                                                        <span className="text-xs font-bold text-slate-500">Price Per Day</span>
                                                        <span className="text-sm font-black text-[#3d3f96]">₹{ward.pricePerDay || 0}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* --- TAB 4: AMBULANCES --- */}
                            {activeTab === 'ambulances' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Ambulance Emergency Dispatch Fleet</h3>
                                        <span className="text-xs font-bold text-slate-500">{ambulances.length} fleet vehicles</span>
                                    </div>

                                    {ambulances.length === 0 ? (
                                        <div className="p-12 text-center bg-white rounded-3xl border border-slate-100">
                                            <Truck size={36} className="mx-auto text-slate-300 mb-2" />
                                            <p className="text-xs font-bold text-slate-500">No emergency ambulances listed.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {ambulances.map((amb) => (
                                                <div key={amb._id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h4 className="text-sm font-black text-slate-800">{amb.name}</h4>
                                                            <p className="text-xs font-bold text-slate-400 mt-0.5">
                                                                Plate: <span className="text-slate-800 font-mono">{amb.vehicleNumber}</span>
                                                            </p>
                                                        </div>
                                                        <span className="px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase bg-indigo-50 text-[#3d3f96]">
                                                            {amb.vehicleType}
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                                        <p className="text-slate-600 font-bold flex items-center gap-1.5">
                                                            <Phone size={12} className="text-slate-400" /> {amb.phone || "--"}
                                                        </p>
                                                        <p className="text-slate-600 font-bold flex items-center gap-1.5">
                                                            <MapPin size={12} className="text-rose-400" /> Radius: {amb.serviceRadius || "--"}
                                                        </p>
                                                    </div>

                                                    {amb.pricing && (
                                                        <div className="bg-slate-50 p-3 rounded-2xl space-y-1.5 border border-slate-100">
                                                            <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Ride Pricing</p>
                                                            <div className="grid grid-cols-4 gap-2 text-center">
                                                                <div>
                                                                    <p className="text-[9px] text-slate-400">Single</p>
                                                                    <p className="text-xs font-bold text-slate-800">₹{amb.pricing.singleRidePrice}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[9px] text-slate-400">Double</p>
                                                                    <p className="text-xs font-bold text-slate-800">₹{amb.pricing.doubleRidePrice}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[9px] text-slate-400">Base Dist</p>
                                                                    <p className="text-xs font-bold text-slate-800">{amb.pricing.baseDistance} km</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[9px] text-slate-400">Per KM</p>
                                                                    <p className="text-xs font-bold text-slate-800">₹{amb.pricing.pricePerKM}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {amb.supportStaff && (
                                                        <div className="flex gap-2">
                                                            <div className="flex-1 p-2 bg-slate-50 rounded-xl text-center">
                                                                <p className="text-[9px] font-bold text-slate-400">Nurse on Board</p>
                                                                <p className="text-xs font-black text-slate-800">
                                                                    {amb.supportStaff.nurse?.available ? `+₹${amb.supportStaff.nurse.price}` : "Not Available"}
                                                                </p>
                                                            </div>
                                                            <div className="flex-1 p-2 bg-slate-50 rounded-xl text-center">
                                                                <p className="text-[9px] font-bold text-slate-400">Doctor on Board</p>
                                                                <p className="text-xs font-black text-slate-800">
                                                                    {amb.supportStaff.doctor?.available ? `+₹${amb.supportStaff.doctor.price}` : "Not Available"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* --- TAB 5: DOCUMENTS & GALLERY --- */}
                            {activeTab === 'documents' && (
                                <div className="space-y-6">
                                    {/* Medical Council & Licensing */}
                                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Statutory Licensing & Registration</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div className="bg-slate-50 p-3.5 rounded-2xl">
                                                <p className="text-[10px] font-black uppercase text-slate-400">Medical Council</p>
                                                <p className="text-xs font-bold text-slate-800 mt-1">{clinic.councilName || "Not Provided"}</p>
                                            </div>
                                            <div className="bg-slate-50 p-3.5 rounded-2xl">
                                                <p className="text-[10px] font-black uppercase text-slate-400">Council Registration No.</p>
                                                <p className="text-xs font-mono font-bold text-slate-800 mt-1">{clinic.councilNumber || "Not Provided"}</p>
                                            </div>
                                            <div className="bg-slate-50 p-3.5 rounded-2xl">
                                                <p className="text-[10px] font-black uppercase text-slate-400">Active License No.</p>
                                                <p className="text-xs font-mono font-bold text-slate-800 mt-1">{clinic.licenseNumber || "Not Provided"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Attached PDF / File Documents */}
                                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Uploaded Official Documents (PDF / Files)</h3>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {/* License Documents */}
                                            {clinic.licenseDocument && clinic.licenseDocument.length > 0 ? (
                                                clinic.licenseDocument.map((doc, idx) => (
                                                    <a
                                                        key={idx}
                                                        href={getMediaUrl(doc)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-3 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/60 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-700 hover:text-[#3d3f96] transition group"
                                                    >
                                                        <span className="flex items-center gap-2 truncate">
                                                            <FileText size={16} className="text-[#3d3f96] shrink-0" />
                                                            <span className="truncate">License Certificate #{idx + 1}</span>
                                                        </span>
                                                        <ExternalLink size={14} className="text-slate-400 group-hover:text-[#3d3f96] shrink-0 ml-2" />
                                                    </a>
                                                ))
                                            ) : (
                                                <div className="p-3 bg-slate-50 rounded-2xl text-xs text-slate-400 font-semibold text-center col-span-2">
                                                    No license documents uploaded.
                                                </div>
                                            )}

                                            {/* Other Compliance Documents */}
                                            {clinic.otherDocuments && clinic.otherDocuments.map((doc, idx) => (
                                                <a
                                                    key={idx}
                                                    href={getMediaUrl(doc)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-3 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/60 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-700 hover:text-[#3d3f96] transition group"
                                                >
                                                    <span className="flex items-center gap-2 truncate">
                                                        <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                                                        <span className="truncate">Compliance / NOC Document #{idx + 1}</span>
                                                    </span>
                                                    <ExternalLink size={14} className="text-slate-400 group-hover:text-emerald-600 shrink-0 ml-2" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Certificates & Posters */}
                                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Certificates & Posters</h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            {clinic.certificateImage && (
                                                <div 
                                                    onClick={() => setPreviewImage(getMediaUrl(clinic.certificateImage))}
                                                    className="group relative aspect-video rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden cursor-pointer"
                                                >
                                                    <img src={getMediaUrl(clinic.certificateImage)} alt="Certificate" className="w-full h-full object-cover group-hover:scale-105 transition" />
                                                    <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[10px] font-bold">
                                                        View Certificate
                                                    </div>
                                                </div>
                                            )}
                                            {clinic.posterimage && (
                                                <div 
                                                    onClick={() => setPreviewImage(getMediaUrl(clinic.posterimage))}
                                                    className="group relative aspect-video rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden cursor-pointer"
                                                >
                                                    <img src={getMediaUrl(clinic.posterimage)} alt="Poster" className="w-full h-full object-cover group-hover:scale-105 transition" />
                                                    <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[10px] font-bold">
                                                        View Poster
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Clinic Photos & Achievements */}
                                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Clinic Premises & Achievement Gallery</h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            {clinic.clinicImages?.map((img, i) => (
                                                <div 
                                                    key={i} 
                                                    onClick={() => setPreviewImage(getMediaUrl(img))}
                                                    className="group relative aspect-video rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden cursor-pointer"
                                                >
                                                    <img src={getMediaUrl(img)} alt={`Premises ${i+1}`} className="w-full h-full object-cover group-hover:scale-105 transition" />
                                                    <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[10px] font-bold">
                                                        Premises #{i+1}
                                                    </div>
                                                </div>
                                            ))}
                                            {clinic.achievementImages?.map((img, i) => (
                                                <div 
                                                    key={i} 
                                                    onClick={() => setPreviewImage(getMediaUrl(img))}
                                                    className="group relative aspect-video rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden cursor-pointer"
                                                >
                                                    <img src={getMediaUrl(img)} alt={`Award ${i+1}`} className="w-full h-full object-cover group-hover:scale-105 transition" />
                                                    <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[10px] font-bold">
                                                        Award #{i+1}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- TAB 6: BANK DETAILS --- */}
                            {activeTab === 'bank' && (
                                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 max-w-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-150 flex items-center justify-center text-[#3d3f96]">
                                            <Landmark size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black text-slate-800">Settlement Bank Account</h3>
                                            <p className="text-xs text-slate-400">Used for payouts, doctor splits, and platform settlements.</p>
                                        </div>
                                    </div>

                                    {clinic.bankDetails ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                <p className="text-[10px] font-black uppercase text-slate-400">Bank Name</p>
                                                <p className="text-sm font-black text-slate-800 mt-0.5">{clinic.bankDetails.bankName || "--"}</p>
                                            </div>
                                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                <p className="text-[10px] font-black uppercase text-slate-400">Account Type</p>
                                                <p className="text-sm font-black text-slate-800 mt-0.5">{clinic.bankDetails.accountType || "Savings/Current"}</p>
                                            </div>
                                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                <p className="text-[10px] font-black uppercase text-slate-400">Beneficiary Holder Name</p>
                                                <p className="text-xs font-bold text-slate-800 mt-0.5 select-all">{clinic.bankDetails.accountHolderName || "--"}</p>
                                            </div>
                                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                <p className="text-[10px] font-black uppercase text-slate-400">Account Number</p>
                                                <p className="text-xs font-mono font-bold text-slate-800 mt-0.5 select-all">{clinic.bankDetails.accountNumber || "--"}</p>
                                            </div>
                                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                <p className="text-[10px] font-black uppercase text-slate-400">IFSC Code</p>
                                                <p className="text-xs font-mono font-bold text-slate-800 mt-0.5 select-all">{clinic.bankDetails.ifscCode || "--"}</p>
                                            </div>
                                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                <p className="text-[10px] font-black uppercase text-slate-400">UPI VPA</p>
                                                <p className="text-xs font-mono font-bold text-slate-800 mt-0.5 select-all">{clinic.bankDetails.upiId || "--"}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-150">
                                            <p className="text-xs font-bold text-slate-500">No bank details provided for this clinic.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* --- FOOTER ACTION BAR (Mobile & Secondary) --- */}
                {clinic && (
                    <div className="bg-white px-6 sm:px-8 py-4 border-t border-slate-100 flex items-center justify-between sm:justify-end gap-3 shrink-0">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                            Close Dossier
                        </button>
                        <div className="flex sm:hidden items-center gap-2">
                            <button
                                onClick={() => onTriggerDecision(clinic, 'Rejected')}
                                className="px-4 py-2.5 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl transition cursor-pointer"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => onTriggerDecision(clinic, 'Approved')}
                                className="px-4 py-2.5 bg-[#3d3f96] text-white text-xs font-bold rounded-xl transition cursor-pointer"
                            >
                                Approve
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* --- FULLSCREEN IMAGE PREVIEW LIGHTBOX --- */}
            {previewImage && (
                <div 
                    className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={() => setPreviewImage(null)}
                >
                    <button
                        onClick={() => setPreviewImage(null)}
                        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition cursor-pointer"
                    >
                        <X size={24} />
                    </button>
                    <img
                        src={previewImage}
                        alt="Enlarged Document"
                        className="max-w-full max-h-[90vh] object-contain rounded-xl"
                    />
                </div>
            )}
        </div>
    );
}