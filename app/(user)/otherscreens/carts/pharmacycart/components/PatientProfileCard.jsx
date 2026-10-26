// components/PatientProfileCard.jsx
"use client";
import React from 'react';
import { Users, User, CheckCircle2 } from 'lucide-react';

export default function PatientProfileCard({
  familyMembers = [],
  selectedPatient,
  onSelectPatient,
  getMediaUrl
}) {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-slate-100 shadow-sm space-y-3 sm:space-y-4">
      <div className="flex items-center gap-2 pb-2.5 sm:pb-3 border-b border-slate-100">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#3d3f96]/10 text-[#3d3f96] flex items-center justify-center shrink-0">
          <Users size={16} />
        </div>
        <div>
          <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
            Patient Profile
          </h3>
          <p className="text-[10px] sm:text-[11px] font-bold text-slate-400">
            Prescription & medicines will be tagged to this patient
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
        {/* Self Profile Option */}
        <div
          onClick={() => onSelectPatient({ _id: "Self", memberName: "Self", relation: "Primary Account" })}
          className={`cursor-pointer rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border transition-all relative flex flex-col items-center text-center ${
            selectedPatient?._id === "Self"
              ? "border-[#3d3f96] bg-[#3d3f96]/5 ring-2 ring-[#3d3f96]/20"
              : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
          }`}
        >
          {selectedPatient?._id === "Self" && (
            <CheckCircle2 size={14} className="text-[#3d3f96] absolute top-1.5 right-1.5 sm:top-2 sm:right-2" />
          )}
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center mb-1.5 sm:mb-2">
            <User size={16} />
          </div>
          <h4 className="text-[11px] sm:text-xs font-black text-slate-900">Self</h4>
          <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase">Primary</span>
        </div>

        {/* Dynamic Family Members */}
        {familyMembers.map((member) => {
          const isSelected = selectedPatient?._id === member._id;
          const memberImg = getMediaUrl ? getMediaUrl(member.profilePic) : member.profilePic;

          return (
            <div
              key={member._id}
              onClick={() => onSelectPatient(member)}
              className={`cursor-pointer rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border transition-all relative flex flex-col items-center text-center ${
                isSelected
                  ? "border-[#3d3f96] bg-[#3d3f96]/5 ring-2 ring-[#3d3f96]/20"
                  : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
              }`}
            >
              {isSelected && (
                <CheckCircle2 size={14} className="text-[#3d3f96] absolute top-1.5 right-1.5 sm:top-2 sm:right-2" />
              )}
              {member.profilePic ? (
                <img
                  src={memberImg}
                  alt={member.memberName}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover mb-1.5 sm:mb-2 border border-slate-200 shadow-xs"
                />
              ) : (
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-100 text-[#3d3f96] flex items-center justify-center mb-1.5 sm:mb-2 font-black text-[11px] sm:text-xs">
                  {member.memberName?.charAt(0) || "P"}
                </div>
              )}
              <h4 className="text-[11px] sm:text-xs font-black text-slate-900 truncate max-w-full">
                {member.memberName}
              </h4>
              <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase">
                {member.relation}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}