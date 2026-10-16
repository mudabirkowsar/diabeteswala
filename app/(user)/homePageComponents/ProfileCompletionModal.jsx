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
  Activity,
  MapPin,
  Users,
  Stethoscope,
  UtensilsCrossed,
  Truck
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import UserAPI from "../../services/UserAPI";

const ProfileCompletionModal = () => {
  const { isLoggedIn } = useAuth();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [completionData, setCompletionData] = useState(null);

  // Check if dismissed in this session
  const isDismissedInSession = () => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("dw_profile_modal_dismissed") === "true";
  };

  const fetchCompletionStatus = useCallback(async () => {
    if (!isLoggedIn) return;

    try {
      const res = await UserAPI.getUserProfileCompletionStatus();
      if (res?.success && res?.data) {
        setCompletionData(res.data);

        const isNotOnProfilePage = pathname !== "/otherscreens/profile";
        if (
          !res.data.is100PercentCompleted &&
          !isDismissedInSession() &&
          isNotOnProfilePage
        ) {
          const timer = setTimeout(() => setIsOpen(true), 1200);
          return () => clearTimeout(timer);
        }
      }
    } catch (error) {
      console.error("Failed to load profile completion status:", error);
    }
  }, [isLoggedIn, pathname]);

  useEffect(() => {
    fetchCompletionStatus();
  }, [fetchCompletionStatus]);

  const handleClose = () => {
    sessionStorage.setItem("dw_profile_modal_dismissed", "true");
    setIsOpen(false);
  };

  if (!isOpen || !isLoggedIn || !completionData || completionData.is100PercentCompleted) {
    return null;
  }

  const { percentage = 0, nextStep, checklist = {} } = completionData;

  const checklistItems = [
    {
      key: "mainUserDetails",
      title: "Basic Info",
      desc: "Age & Vitals",
      icon: <User size={14} />,
      done: Boolean(checklist.mainUserDetails),
    },
    {
      key: "diseaseDetails",
      title: "Diabetic & HbA1c",
      desc: "Sugar History",
      icon: <Activity size={14} />,
      done: Boolean(checklist.diseaseDetails),
    },
    {
      key: "addressDetails",
      title: "Delivery Address",
      desc: "Tiffins & Meds",
      icon: <MapPin size={14} />,
      done: Boolean(checklist.addressDetails),
    },
    {
      key: "familyMemberDetails",
      title: "Family Care Circle",
      desc: "Emergency Contacts",
      icon: <Users size={14} />,
      done: Boolean(checklist.familyMemberDetails),
    },
  ];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* --- WIDE MODAL CONTAINER (Low Height, 2-Column) --- */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 grid grid-cols-1 md:grid-cols-12 animate-in fade-in zoom-in-95">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-100 md:bg-slate-100/80 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors z-20"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* --- LEFT COLUMN: Brand Perks & Completion Meter (5 Cols) --- */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#242663] via-[#3d3f96] to-[#4c4faa] text-white p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            {/* Brand Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-indigo-100 border border-white/10 mb-2.5">
              <Sparkles size={11} className="text-amber-300" />
              <span>Diabetes Wala</span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
              Personalized Diabetes Reversal
            </h3>
            <p className="text-[11px] text-indigo-100/90 mt-1 font-medium leading-relaxed">
              Complete your profile to unlock custom doctor consults, meal plans, and lab discounts.
            </p>
          </div>

          {/* Progress Widget */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 my-3">
            <div className="flex items-center justify-between text-xs font-black mb-1.5">
              <span className="text-indigo-200 uppercase tracking-wider text-[10px]">Readiness</span>
              <span className="text-white bg-[#242663]/60 px-2 py-0.5 rounded-md text-[11px]">
                {percentage}% Done
              </span>
            </div>
            <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-amber-400 to-emerald-400"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Promotional Mini-Perks Row */}
          <div className="grid grid-cols-3 gap-1 pt-1 border-t border-white/10 text-center">
            <div className="flex flex-col items-center">
              <Stethoscope size={13} className="text-emerald-300 mb-0.5" />
              <span className="text-[9px] font-bold text-white/90">Doctor Plan</span>
            </div>
            <div className="flex flex-col items-center">
              <UtensilsCrossed size={13} className="text-amber-300 mb-0.5" />
              <span className="text-[9px] font-bold text-white/90">Diet Chart</span>
            </div>
            <div className="flex flex-col items-center">
              <Truck size={13} className="text-cyan-300 mb-0.5" />
              <span className="text-[9px] font-bold text-white/90">Fast Meds</span>
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: Checklist & Actions (7 Cols) --- */}
        <div className="md:col-span-7 p-5 sm:p-6 flex flex-col justify-between bg-white">
          
          <div className="space-y-3">
            {/* Header / Immediate Action Pill */}
            {nextStep && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200/80 px-3 py-2 rounded-xl text-amber-900 pr-8">
                <AlertCircle size={14} className="text-amber-600 shrink-0" />
                <span className="text-[11px] font-bold truncate">
                  <strong className="font-black text-amber-800">Next Action:</strong> {nextStep}
                </span>
              </div>
            )}

            {/* 2x2 COMPACT CHECKLIST GRID (Saves maximum vertical space) */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {checklistItems.map((item) => (
                <div
                  key={item.key}
                  className={`p-2.5 rounded-xl border transition-all flex items-start justify-between ${
                    item.done
                      ? "bg-emerald-50/50 border-emerald-200/80 text-slate-800"
                      : "bg-slate-50 border-slate-200/70 text-slate-500"
                  }`}
                >
                  <div className="flex items-start gap-2 min-w-0">
                    <span
                      className={`p-1 rounded-lg mt-0.5 shrink-0 ${
                        item.done
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-white text-slate-400 border border-slate-200"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <div className="min-w-0">
                      <p className={`text-[11px] font-black truncate leading-tight ${item.done ? "text-slate-800" : "text-slate-600"}`}>
                        {item.title}
                      </p>
                      <p className="text-[9px] text-slate-400 font-medium truncate mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  {item.done ? (
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0 ml-1 mt-0.5" />
                  ) : (
                    <Circle size={14} className="text-slate-300 shrink-0 ml-1 mt-0.5" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center gap-2.5 pt-4 mt-2 border-t border-slate-100">
            <Link
              href="/otherscreens/profile"
              onClick={() => setIsOpen(false)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-[#3d3f96] hover:bg-[#2d2f75] text-white rounded-xl font-black text-xs shadow-md shadow-indigo-100 active:scale-95 transition-all text-center"
            >
              <span>Complete Profile</span>
              <ArrowRight size={13} />
            </Link>

            <button
              onClick={handleClose}
              type="button"
              className="py-2.5 px-3 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Remind Later
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProfileCompletionModal;