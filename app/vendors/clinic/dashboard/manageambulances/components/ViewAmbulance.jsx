"use client";

import React from 'react';
import {
    X,
    Ambulance,
    User,
    Phone,
    Mail,
    MapPin,
    Gauge,
    IndianRupee,
    HeartPulse,
    Stethoscope,
    FileText,
    ExternalLink,
    CheckCircle2,
    Clock,
    Ban,
    Power,
    Edit3,
    Activity,
    Radio,
    ShieldCheck,
    Calendar,
    Loader2
} from 'lucide-react';

// Helper for backend file URLs
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';
const getMediaUrl = (path) => {
    if (!path || typeof path !== 'string') return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const cleanBase = BACKEND_URL.replace(/\/+$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
};

export default function ViewAmbulance({
    isOpen,
    onClose,
    ambulanceData,
    onEdit,
    onToggleEmergency,
    togglingId
}) {
    if (!isOpen || !ambulanceData) return null;

    const pricing = ambulanceData.pricing || {};
    const supportStaff = ambulanceData.supportStaff || {};
    const docs = ambulanceData.documents || {};
    const hasNurse = supportStaff.nurse?.available;
    const hasDoctor = supportStaff.doctor?.available;

    const formattedDate = new Date(ambulanceData.createdAt || Date.now()).toLocaleDateString("en-US", {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const renderStatusBadge = (status) => {
        if (status === 'Approved') {
            return (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    <CheckCircle2 size={12} className="text-emerald-500" /> Approved by Admin
                </span>
            );
        }
        if (status === 'Rejected') {
            return (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                    <Ban size={12} className="text-rose-500" /> Rejected by Admin
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                <Clock size={12} className="text-amber-500 animate-pulse" /> Pending Document Verification
            </span>
        );
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl relative text-left overflow-hidden">
                
                {/* Modal Header */}
                <div className="px-6 py-5 sm:px-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center border border-red-500/20 shrink-0">
                            <Ambulance size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight">
                                    {ambulanceData.vehicleNumber || 'Unregistered'}
                                </h3>
                                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-red-100/70 text-red-700 border border-red-200">
                                    {ambulanceData.vehicleType || 'Van'}
                                </span>
                                {renderStatusBadge(ambulanceData.profileStatus)}
                            </div>
                            <p className="text-xs text-slate-400 font-semibold mt-0.5">
                                Unit ID: <span className="font-mono text-slate-600">{ambulanceData._id}</span> • Registered On: {formattedDate}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden text-left">
                    
                    {/* Live Operations Readiness Bar */}
                    <div className="bg-slate-50 p-4 sm:p-5 rounded-3xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full ${ambulanceData.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                <div>
                                    <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Driver App Status</span>
                                    <span className="text-xs font-black text-slate-800">
                                        {ambulanceData.isOnline ? 'Online & Available for Trips' : 'Offline'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                disabled={togglingId === ambulanceData._id}
                                onClick={(e) => onToggleEmergency(ambulanceData._id, ambulanceData.availableForEmergency, e)}
                                className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition flex items-center gap-2 border cursor-pointer ${
                                    ambulanceData.availableForEmergency
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                        : 'bg-slate-200 text-slate-600 border-slate-300 hover:bg-slate-300'
                                }`}
                            >
                                {togglingId === ambulanceData._id ? <Loader2 size={13} className="animate-spin" /> : <Power size={13} />}
                                <span>{ambulanceData.availableForEmergency ? 'Emergency Duty Active' : 'Mark Emergency Ready'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Section 1: Driver & Operational Credentials */}
                    <div className="space-y-3">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-900 block flex items-center gap-1.5 border-b border-slate-100 pb-2">
                            <User size={15} className="text-red-600" /> Driver & Vehicle Details
                        </span>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-[10px] font-black uppercase text-slate-400 block">Driver Name</span>
                                <span className="font-extrabold text-slate-900 mt-0.5 block">{ambulanceData.name}</span>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-[10px] font-black uppercase text-slate-400 block">Mobile Phone</span>
                                <span className="font-extrabold text-slate-900 mt-0.5 block">{ambulanceData.phone}</span>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-[10px] font-black uppercase text-slate-400 block">Driver Email</span>
                                <span className="font-extrabold text-slate-900 mt-0.5 block truncate">{ambulanceData.email || 'N/A'}</span>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-[10px] font-black uppercase text-slate-400 block">Blood Group & Exp</span>
                                <span className="font-extrabold text-slate-900 mt-0.5 block">{ambulanceData.bloodGroup || 'B+'} • {ambulanceData.experienceYears || '0'} Yrs</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-[10px] font-black uppercase text-slate-400 block">Service Radius</span>
                                <span className="font-extrabold text-slate-900 mt-0.5 block">{ambulanceData.serviceRadius || '15 km'}</span>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-[10px] font-black uppercase text-slate-400 block">Base City & State</span>
                                <span className="font-extrabold text-slate-900 mt-0.5 block">{ambulanceData.city || 'Mohali'}, {ambulanceData.state || 'Punjab'}</span>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-[10px] font-black uppercase text-slate-400 block">Base Station Address</span>
                                <span className="font-extrabold text-slate-900 mt-0.5 block truncate">{ambulanceData.address || 'Clinic Emergency Bay'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: On-Board Medical Support Staff */}
                    <div className="space-y-3">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-900 block flex items-center gap-1.5 border-b border-slate-100 pb-2">
                            <HeartPulse size={15} className="text-indigo-600" /> On-Board Support Staff Availability
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                                hasNurse ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-200'
                            }`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                        hasNurse ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'
                                    }`}>
                                        <User size={18} />
                                    </div>
                                    <div>
                                        <span className="text-xs font-black text-slate-900 block">On-Board Nurse</span>
                                        <span className="text-[10px] text-slate-500 font-bold">
                                            {hasNurse ? 'Available for Emergency & Critical care' : 'Not configured'}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black uppercase text-slate-400 block">Extra Fee</span>
                                    <span className="text-sm font-black text-emerald-700">₹{supportStaff.nurse?.price || 0}</span>
                                </div>
                            </div>

                            <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                                hasDoctor ? 'bg-indigo-50/60 border-indigo-200' : 'bg-slate-50 border-slate-200'
                            }`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                        hasDoctor ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'
                                    }`}>
                                        <Stethoscope size={18} />
                                    </div>
                                    <div>
                                        <span className="text-xs font-black text-slate-900 block">Emergency Doctor</span>
                                        <span className="text-[10px] text-slate-500 font-bold">
                                            {hasDoctor ? 'On-duty practitioner accompanying unit' : 'Not configured'}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black uppercase text-slate-400 block">Extra Fee</span>
                                    <span className="text-sm font-black text-indigo-700">₹{supportStaff.doctor?.price || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Dynamic Fare & Pricing Structure */}
                    <div className="space-y-3">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-900 block flex items-center gap-1.5 border-b border-slate-100 pb-2">
                            <IndianRupee size={15} className="text-amber-600" /> Fare & Pricing Structure
                        </span>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-[10px] font-black uppercase text-slate-400 block">One-Way Trip</span>
                                <span className="text-base font-black text-slate-900">₹{pricing.singleRidePrice || 400}</span>
                            </div>
                            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-[10px] font-black uppercase text-slate-400 block">Round-Trip Base</span>
                                <span className="text-base font-black text-slate-900">₹{pricing.doubleRidePrice || 700}</span>
                            </div>
                            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-[10px] font-black uppercase text-slate-400 block">Base Distance</span>
                                <span className="text-base font-black text-slate-900">{pricing.baseDistance || 5} KM</span>
                            </div>
                            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-[10px] font-black uppercase text-slate-400 block">Price / Extra KM</span>
                                <span className="text-base font-black text-slate-900">₹{pricing.pricePerKM || 12}</span>
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Statutory Documents & License Numbers */}
                    <div className="space-y-3">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-900 block flex items-center gap-1.5 border-b border-slate-100 pb-2">
                            <FileText size={15} className="text-red-600" /> Statutory Certificates & Document Attachments
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                { key: 'drivingLicenseFile', label: 'Driving License', number: ambulanceData.drivingLicenseNumber, placeholder: 'DL Number' },
                                { key: 'rcFile', label: 'Vehicle RC Certificate', number: ambulanceData.rcNumber, placeholder: 'RC Number' },
                                { key: 'insuranceFile', label: 'Insurance Policy File', number: ambulanceData.insuranceNumber, placeholder: 'Policy Number' },
                                { key: 'fitnessCertificate', label: 'Vehicle Fitness Certificate', number: null },
                                { key: 'ambulancePermit', label: 'Commercial Ambulance Permit', number: null }
                            ].map((doc) => {
                                const filePath = docs[doc.key];
                                const fileUrl = getMediaUrl(filePath);

                                return (
                                    <div
                                        key={doc.key}
                                        className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3 text-xs"
                                    >
                                        <div>
                                            <span className="font-bold text-slate-800 block">{doc.label}</span>
                                            {doc.number && (
                                                <span className="text-[10px] font-mono text-slate-500 block">
                                                    No: {doc.number}
                                                </span>
                                            )}
                                        </div>

                                        {filePath ? (
                                            <a
                                                href={fileUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-black text-[11px] transition shrink-0"
                                            >
                                                <span>View Attachment</span>
                                                <ExternalLink size={12} />
                                            </a>
                                        ) : (
                                            <span className="text-slate-400 font-semibold italic text-[11px] shrink-0">Not Uploaded</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>

                {/* Modal Footer Actions */}
                <div className="px-6 py-4 sm:px-8 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-4 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 text-slate-500 hover:bg-slate-200 text-xs font-black uppercase tracking-wider rounded-2xl transition cursor-pointer"
                    >
                        Close
                    </button>

                    <button
                        type="button"
                        onClick={() => onEdit(ambulanceData)}
                        className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-lg shadow-indigo-600/20 transition flex items-center gap-2 cursor-pointer"
                    >
                        <Edit3 size={14} />
                        <span>Edit Ambulance</span>
                    </button>
                </div>

            </div>
        </div>
    );
}