"use client";

import React, { useState, useEffect } from 'react';
import {
    X,
    User,
    IndianRupee,
    Phone,
    Mail,
    MapPin,
    Star,
    CheckCircle2,
    Ban,
    Languages,
    Compass,
    Loader2
} from 'lucide-react';
import AdminAPI from '../../../../../services/AdminAPI';

// Helper to construct full backend image URL
const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.1.6:5002').replace(/\/$/, '');
    const cleanPath = imagePath.replace(/^\//, '');
    return `${backendUrl}/${cleanPath}`;
};

export default function ViewCoach({ isOpen, onClose, coachId }) {
    const [coach, setCoach] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isOpen || !coachId) return;

        const fetchDetails = async () => {
            setLoading(true);
            try {
                const response = await AdminAPI.getDiabetesCoachById(coachId);
                if (response && response.success) {
                    setCoach(response.data);
                }
            } catch (err) {
                console.error('Failed to load coach details:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [isOpen, coachId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-left overflow-hidden max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0 mb-4">
                    <span className="text-[11px] font-black uppercase text-[#3d3f96] bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full shadow-2xs">
                        Coach Dossier
                    </span>
                    <button
                        onClick={onClose}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center space-y-3">
                        <Loader2 className="animate-spin text-[#3d3f96]" size={32} />
                        <p className="text-xs font-bold text-slate-400">Loading profile data...</p>
                    </div>
                ) : !coach ? (
                    <div className="py-16 text-center text-xs font-bold text-slate-400">
                        Unable to find coach records.
                    </div>
                ) : (
                    <div className="overflow-y-auto space-y-5 pr-1 flex-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">

                        {/* Top Card: Avatar, Name, Rating & Status */}
                        <div className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-100">
                            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-xs relative">
                                {coach.profileImage ? (
                                    <img
                                        src={getImageUrl(coach.profileImage)}
                                        alt={coach.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <User className="text-slate-400" size={28} />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-base font-black text-slate-900 truncate">
                                        {coach.name}
                                    </h3>
                                    {coach.isActive ? (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                            <CheckCircle2 size={10} /> Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                            <Ban size={10} /> Inactive
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 mt-1 text-xs">
                                    <div className="flex items-center gap-1 text-amber-500 font-black">
                                        <Star size={13} fill="currentColor" />
                                        <span>{coach.rating || '0.0'}</span>
                                        <span className="text-slate-400 font-semibold text-[10px]">
                                            ({coach.totalReviews || 0} reviews)
                                        </span>
                                    </div>
                                    <div className="flex items-center font-black text-slate-900">
                                        <span>₹{coach.price}</span>
                                        <span className="text-[10px] text-slate-400 font-semibold ml-1">/ session</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="p-3 bg-white border border-slate-200/80 rounded-2xl flex items-center gap-3">
                                <Phone size={16} className="text-[#3d3f96]" />
                                <div className="min-w-0">
                                    <span className="text-[9px] font-black uppercase text-slate-400 block">Phone</span>
                                    <span className="font-bold text-slate-800 truncate block">
                                        {coach.phone || 'Not provided'}
                                    </span>
                                </div>
                            </div>

                            <div className="p-3 bg-white border border-slate-200/80 rounded-2xl flex items-center gap-3">
                                <Mail size={16} className="text-[#3d3f96]" />
                                <div className="min-w-0">
                                    <span className="text-[9px] font-black uppercase text-slate-400 block">Email</span>
                                    <span className="font-bold text-slate-800 truncate block">
                                        {coach.email || 'Not provided'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Languages */}
                        {coach.languages && coach.languages.length > 0 && (
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                                    Languages Supported
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                    {(Array.isArray(coach.languages)
                                        ? coach.languages
                                        : [coach.languages]
                                    ).map((lang, index) => (
                                        <span
                                            key={index}
                                            className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200"
                                        >
                                            {lang}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Bio */}
                        {coach.about && (
                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                    Guidance Summary & Expertise
                                </span>
                                <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                                    {coach.about}
                                </p>
                            </div>
                        )}

                        {/* Address & Coordinates */}
                        <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <MapPin size={12} className="text-[#3d3f96]" /> Operating Location
                            </span>

                            <p className="text-xs font-bold text-slate-800">
                                {[
                                    coach.location?.address,
                                    coach.location?.city,
                                    coach.location?.state,
                                    coach.location?.pincode
                                ]
                                    .filter(Boolean)
                                    .join(', ') || 'No physical address specified.'}
                            </p>

                            {(coach.location?.lat || coach.location?.lng) && (
                                <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                                    <Compass size={11} />
                                    <span>Lat: {coach.location?.lat || 'N/A'}, Lng: {coach.location?.lng || 'N/A'}</span>
                                </div>
                            )}
                        </div>

                        {/* Footer timestamps */}
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 pt-2 border-t border-slate-100">
                            <span>ID: {coach._id}</span>
                            <span>Added: {new Date(coach.createdAt).toLocaleDateString()}</span>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}