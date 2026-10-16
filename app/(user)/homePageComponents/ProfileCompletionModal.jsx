"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    ArrowRight,
    X,
    Sparkles,
    ShieldCheck,
    Activity,
    Gift,
    CircleDot
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import UserAPI from '../../services/UserAPI';

function ProfileCompletionModal() {
    const { isLoggedIn } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const [isOpen, setIsOpen] = useState(false);
    const [statusData, setStatusData] = useState(null);

    const fetchStatus = async () => {
        try {
            const res = await UserAPI.getUserProfileCompletionStatus();
            if (res?.success && res?.data) {
                setStatusData(res.data);

                const isCompleted = res.data.is100PercentCompleted || res.data.percentage === 100;
                const isDismissed = sessionStorage.getItem('dw_profile_modal_dismissed');

                if (!isCompleted && !isDismissed && pathname !== '/otherscreens/profile') {
                    setTimeout(() => setIsOpen(true), 1000);
                } else {
                    setIsOpen(false);
                }
            }
        } catch (err) {
            console.error("Failed to check profile completion status:", err);
        }
    };

    useEffect(() => {
        if (isLoggedIn) {
            fetchStatus();
        } else {
            setIsOpen(false);
        }
    }, [isLoggedIn, pathname]);

    const handleClose = () => {
        sessionStorage.setItem('dw_profile_modal_dismissed', 'true');
        setIsOpen(false);
    };

    const handleNavigateToProfile = () => {
        setIsOpen(false);
        router.push('/otherscreens/profile');
    };

    if (!isOpen || !statusData) return null;

    const percentage = statusData.percentage || 0;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 antialiased overflow-hidden select-none">

                {/* Soft Dim Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />

                {/* Minimalist Card Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.94, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94, y: 16 }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                    className="relative bg-white w-full max-w-[420px] rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-100 overflow-hidden"
                >
                    {/* Subtle Top Gradient Bar */}
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#3d3f96] via-indigo-500 to-[#EB333C]" />

                    {/* Close Icon */}
                    <button
                        onClick={handleClose}
                        className="absolute top-3.5 right-3.5 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
                    >
                        <X size={17} />
                    </button>

                    {/* Top Pill */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-200/60 text-[9px] font-black uppercase tracking-wider text-slate-500 mb-2.5">
                        <Sparkles size={11} className="text-[#EB333C]" />
                        Diabetes Wala Care
                    </div>

                    {/* Heading */}
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight mb-1">
                        Let&apos;s Know More About You!
                    </h2>
                    <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-relaxed mb-4">
                        Personalize your clinical care, customized diabetic diets, and free physician reviews.
                    </p>

                    {/* Minimal 3-Item Perk Bar */}
                    <div className="grid grid-cols-3 gap-1.5 py-2 px-2.5 bg-slate-50 rounded-2xl mb-4 border border-slate-100 text-[10px] font-bold text-slate-600">
                        <div className="flex items-center gap-1 truncate">
                            <Activity size={12} className="text-[#3d3f96] shrink-0" />
                            <span className="truncate">Diet Chart</span>
                        </div>
                        <div className="flex items-center gap-1 truncate border-x border-slate-200 px-1.5">
                            <ShieldCheck size={12} className="text-emerald-500 shrink-0" />
                            <span className="truncate">Free Care</span>
                        </div>
                        <div className="flex items-center gap-1 truncate pl-1">
                            <Gift size={12} className="text-[#EB333C] shrink-0" />
                            <span className="truncate">Discounts</span>
                        </div>
                    </div>

                    {/* Progress Indicator */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider mb-1.5">
                            <span className="text-slate-400">Profile Readiness</span>
                            <span className="text-[#3d3f96] font-bold">{percentage}%</span>
                        </div>

                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-[#3d3f96] to-[#EB333C] transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>

                        {/* Checklist Dots */}
                        {statusData.checklist && (
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 mt-3 pt-3 border-t border-slate-100">
                                {[
                                    { key: 'mainUserDetails', label: 'Basic Info' },
                                    { key: 'diseaseDetails', label: 'Diabetic Details' },
                                    { key: 'addressDetails', label: 'Address' },
                                    { key: 'familyMemberDetails', label: 'Family Members' },
                                ].map(({ key, label }) => {
                                    const done = !!statusData.checklist[key];
                                    return (
                                        <div key={key} className="flex items-center gap-1.5 text-[10px] font-bold">
                                            {done ? (
                                                <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                                            ) : (
                                                <CircleDot size={12} className="text-slate-300 shrink-0" />
                                            )}
                                            <span className={`truncate ${done ? 'text-slate-700' : 'text-slate-400'}`}>
                                                {label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* CTAs */}
                    <div className="flex items-center gap-2 pt-1">
                        <button
                            onClick={handleNavigateToProfile}
                            className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-[#3d3f96] to-[#EB333C] text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-md shadow-indigo-100 hover:opacity-95 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                        >
                            <span>Complete Profile</span>
                            <ArrowRight size={13} />
                        </button>
                        <button
                            onClick={handleClose}
                            className="py-2.5 px-3 text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-wider transition-colors rounded-xl"
                        >
                            Later
                        </button>
                    </div>

                </motion.div>
            </div>
        </AnimatePresence>
    );
}

export default ProfileCompletionModal;