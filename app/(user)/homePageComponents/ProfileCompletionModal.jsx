"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    CheckCircle2,
    Circle,
    AlertCircle,
    ArrowRight,
    X,
    Sparkles,
    User,
    HeartPulse,
    MapPin,
    Users,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import UserAPI from "../../services/UserAPI";

const ProfileCompletionModal = () => {
    const { isLoggedIn } = useAuth();
    const pathname = usePathname();

    const [isOpen, setIsOpen] = useState(false);
    const [completionData, setCompletionData] = useState(null);
    const [loading, setLoading] = useState(false);

    // Check if modal was already dismissed during the current session
    const isDismissedInSession = () => {
        if (typeof window === "undefined") return false;
        return sessionStorage.getItem("profile_modal_dismissed") === "true";
    };

    const fetchCompletionStatus = useCallback(async () => {
        if (!isLoggedIn) return;

        try {
            setLoading(true);
            const res = await UserAPI.getUserProfileCompletionStatus();

            if (res?.success && res?.data) {
                setCompletionData(res.data);

                // Show modal only if profile is NOT 100% complete,
                // user has not dismissed it in this session,
                // and user is not currently already on the profile page
                const isNotOnProfilePage = pathname !== "/otherscreens/profile";
                if (
                    !res.data.is100PercentCompleted &&
                    !isDismissedInSession() &&
                    isNotOnProfilePage
                ) {
                    // Slight delay for smooth appearance after page load
                    const timer = setTimeout(() => setIsOpen(true), 1200);
                    return () => clearTimeout(timer);
                }
            }
        } catch (error) {
            console.error("Error checking profile completion modal status:", error);
        } finally {
            setLoading(false);
        }
    }, [isLoggedIn, pathname]);

    useEffect(() => {
        fetchCompletionStatus();
    }, [fetchCompletionStatus]);

    // Handle Close / Remind Later
    const handleClose = () => {
        sessionStorage.setItem("profile_modal_dismissed", "true");
        setIsOpen(false);
    };

    // If not open or user is complete or not logged in, don't render modal
    if (!isOpen || !isLoggedIn || !completionData || completionData.is100PercentCompleted) {
        return null;
    }

    const { percentage = 0, nextStep, checklist = {} } = completionData;

    const checklistItems = [
        {
            key: "mainUserDetails",
            label: "Basic Profile Details",
            icon: <User size={15} />,
            done: Boolean(checklist.mainUserDetails),
        },
        {
            key: "diseaseDetails",
            label: "Diabetic & Health Info",
            icon: <HeartPulse size={15} />,
            done: Boolean(checklist.diseaseDetails),
        },
        {
            key: "addressDetails",
            label: "Delivery Address",
            icon: <MapPin size={15} />,
            done: Boolean(checklist.addressDetails),
        },
        {
            key: "familyMemberDetails",
            label: "Family Medical Circle",
            icon: <Users size={15} />,
            done: Boolean(checklist.familyMemberDetails),
        },
    ];

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
                onClick={handleClose}
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 transform transition-all duration-300 scale-100 animate-scaleUp">
                {/* Top Header Pattern */}
                <div className="relative bg-gradient-to-r from-[#3d3f96] to-[#2d2f75] px-6 py-5 text-white">
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        aria-label="Close modal"
                    >
                        <X size={18} />
                    </button>

                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="p-1.5 rounded-xl bg-white/10">
                            <Sparkles size={16} className="text-amber-300" />
                        </span>
                        <span className="text-[11px] font-black uppercase tracking-widest text-indigo-200">
                            Complete Your Account
                        </span>
                    </div>

                    <h3 className="text-xl font-black tracking-tight text-white">
                        Unlock Full Diabetes Care
                    </h3>
                    <p className="text-xs text-indigo-100 mt-1">
                        Complete your profile to receive personalized diet plans, lab report tracking, and seamless delivery.
                    </p>
                </div>

                {/* Content Body */}
                <div className="p-6 space-y-5">
                    {/* Progress Section */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                                Profile Completion
                            </span>
                            <span className="text-sm font-black text-[#3d3f96]">
                                {percentage}%
                            </span>
                        </div>

                        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-[#3d3f96] to-indigo-500"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>

                        {nextStep && (
                            <div className="flex items-center gap-2 pt-1 text-xs font-bold text-amber-700">
                                <AlertCircle size={14} className="text-amber-500 shrink-0" />
                                <span className="truncate">Next: {nextStep}</span>
                            </div>
                        )}
                    </div>

                    {/* Checklist Items */}
                    <div className="space-y-2.5">
                        <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                            Completion Steps
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                            {checklistItems.map((item) => (
                                <div
                                    key={item.key}
                                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all text-xs font-bold ${item.done
                                            ? "bg-emerald-50/60 border-emerald-200 text-slate-700"
                                            : "bg-white border-slate-200/80 text-slate-500"
                                        }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <span
                                            className={`p-1.5 rounded-lg ${item.done
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-slate-100 text-slate-400"
                                                }`}
                                        >
                                            {item.icon}
                                        </span>
                                        <span>{item.label}</span>
                                    </div>

                                    {item.done ? (
                                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                                    ) : (
                                        <Circle size={16} className="text-slate-300 shrink-0" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                        <Link
                            href="/otherscreens/profile"
                            onClick={() => setIsOpen(false)}
                            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[#3d3f96] text-white rounded-xl font-black text-xs hover:bg-[#2d2f75] transition-all shadow-md active:scale-95"
                        >
                            <span>Complete Profile Now</span>
                            <ArrowRight size={14} />
                        </Link>

                        <button
                            onClick={handleClose}
                            type="button"
                            className="py-3 px-4 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                        >
                            Remind Me Later
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileCompletionModal;