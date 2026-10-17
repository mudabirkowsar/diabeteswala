'use client';

import React, { useEffect, useState } from 'react';
import { X, User, Phone, CheckCircle2, Users, Loader2, Plus, Calendar } from 'lucide-react';
import UserAPI from '../../../../services/UserAPI'; // Adjust your import path

export default function SelectFamilyMemberModal({
    isOpen,
    onClose,
    onSelectMember,
    selectedMemberId
}) {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [tempSelectedId, setTempSelectedId] = useState(selectedMemberId || null);

    useEffect(() => {
        if (isOpen) {
            setTempSelectedId(selectedMemberId || null);
            fetchMembers();
        }
    }, [isOpen, selectedMemberId]);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await UserAPI.getFamilyMembers();
            if (res && res.success && Array.isArray(res.data)) {
                setMembers(res.data);
            } else {
                setMembers([]);
            }
        } catch (err) {
            console.error('Error fetching family members:', err);
            setError('Could not load family members. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getImageSrc = (imgPath) => {
        if (!imgPath) return '';
        if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) return imgPath;
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
        return `${baseUrl}${imgPath}`;
    };

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (!tempSelectedId) {
            // Selected 'Myself'
            onSelectMember(null);
        } else {
            const chosen = members.find((m) => m._id === tempSelectedId);
            if (chosen) onSelectMember(chosen);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div
                className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#3d3f96] flex items-center justify-center font-bold">
                            <Users size={18} />
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-base font-extrabold text-slate-900">Choose Patient Profile</h3>
                            <p className="text-[11px] text-slate-400">Select consultation for yourself or a family member</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-5 overflow-y-auto space-y-3 flex-1 scrollbar-thin">
                    {loading ? (
                        <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                            <Loader2 className="animate-spin text-[#3d3f96]" size={28} />
                            <span className="text-xs font-semibold">Loading family profiles...</span>
                        </div>
                    ) : error ? (
                        <div className="py-8 text-center text-red-500 text-xs">{error}</div>
                    ) : (
                        <>
                            {/* Option 1: Myself / Self */}
                            <div
                                onClick={() => setTempSelectedId(null)}
                                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${tempSelectedId === null
                                        ? 'border-[#3d3f96] bg-indigo-50/50 shadow-sm'
                                        : 'border-slate-200 hover:border-slate-300 bg-white'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#3d3f96] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                                        <User size={18} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs sm:text-sm font-bold text-slate-900">Myself</span>
                                            <span className="text-[10px] font-bold text-[#3d3f96] bg-indigo-100/70 px-1.5 py-0.2 rounded">
                                                Self
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500">Book under my primary account details</p>
                                    </div>
                                </div>
                                <div
                                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${tempSelectedId === null
                                            ? 'border-[#3d3f96] bg-[#3d3f96] text-white'
                                            : 'border-slate-300'
                                        }`}
                                >
                                    {tempSelectedId === null && <CheckCircle2 size={13} />}
                                </div>
                            </div>

                            {/* Family Members List */}
                            {members.map((member) => {
                                const isSelected = tempSelectedId === member._id;
                                const picUrl = getImageSrc(member.profilePic);

                                return (
                                    <div
                                        key={member._id}
                                        onClick={() => setTempSelectedId(member._id)}
                                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${isSelected
                                                ? 'border-[#3d3f96] bg-indigo-50/50 shadow-sm'
                                                : 'border-slate-200 hover:border-slate-300 bg-white'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {picUrl ? (
                                                <img
                                                    src={picUrl}
                                                    alt={member.memberName}
                                                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs uppercase border border-slate-200">
                                                    {member.memberName?.[0] || 'F'}
                                                </div>
                                            )}

                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                                                        {member.memberName}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 uppercase">
                                                        {member.relation}
                                                    </span>
                                                    {member.gender && (
                                                        <span className="text-[10px] text-slate-400 capitalize">
                                                            • {member.gender}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                                                    {member.phone && (
                                                        <span className="flex items-center gap-1">
                                                            <Phone size={10} className="text-slate-400" />
                                                            {member.phone}
                                                        </span>
                                                    )}
                                                    {member.dob && (
                                                        <span className="flex items-center gap-1">
                                                            <Calendar size={10} className="text-slate-400" />
                                                            DOB: {member.dob}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div
                                            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isSelected
                                                    ? 'border-[#3d3f96] bg-[#3d3f96] text-white'
                                                    : 'border-slate-300'
                                                }`}
                                        >
                                            {isSelected && <CheckCircle2 size={13} />}
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        className="px-5 py-2 rounded-xl bg-[#3d3f96] hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                        Confirm Patient
                    </button>
                </div>
            </div>
        </div>
    );
}