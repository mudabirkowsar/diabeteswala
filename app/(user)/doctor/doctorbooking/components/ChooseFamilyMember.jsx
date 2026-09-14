'use client';

import React, { useEffect, useState } from 'react';
import { 
  X, 
  Users, 
  User, 
  Check, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  Loader2, 
  AlertCircle,
  Plus
} from 'lucide-react';
import UserAPI from '../../../../services/UserAPI';

export default function ChooseFamilyMember({ 
  isOpen, 
  onClose, 
  onSelectMember, 
  selectedMemberId 
}) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchMembers = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await UserAPI.getFamilyMembers();

        if (res && res.success && Array.isArray(res.data)) {
          setMembers(res.data);
        } else {
          setMembers([]);
          setError(res?.message || 'No family members found.');
        }
      } catch (err) {
        console.error('Error fetching family members:', err);
        setError(err?.response?.data?.message || 'Failed to load family members.');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [isOpen]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const getImageSrc = (imgPath) => {
    if (!imgPath) return null;
    if (imgPath.startsWith('http')) return imgPath;
    return `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}${imgPath}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
      />

      {/* Right Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col justify-between transform transition-transform duration-300 ease-out animate-slideLeft">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#3d3f96] flex items-center justify-center font-bold border border-indigo-100">
              <Users size={20} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Select Patient</h3>
              <p className="text-xs text-slate-400">Choose who this appointment is for</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Member List Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3.5">
          
          {/* Primary Self (Myself) Option */}
          <div
            onClick={() => {
              onSelectMember({
                _id: 'self',
                memberName: 'Myself (Primary Account)',
                relation: 'SELF',
                gender: '',
                phone: ''
              });
              onClose();
            }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
              selectedMemberId === 'self' || !selectedMemberId
                ? 'border-[#3d3f96] bg-indigo-50/40 ring-2 ring-[#3d3f96]/20 shadow-sm'
                : 'border-slate-200/80 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0">
                  <User size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-extrabold text-slate-900">Myself</h4>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                      Primary User
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Book consultation for self</p>
                </div>
              </div>

              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                selectedMemberId === 'self' || !selectedMemberId
                  ? 'bg-[#3d3f96] border-[#3d3f96] text-white' 
                  : 'border-slate-300 bg-white'
              }`}>
                {(selectedMemberId === 'self' || !selectedMemberId) && <Check size={12} strokeWidth={3} />}
              </div>
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Family Members</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          {/* Dynamic Family Members */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="animate-spin text-[#3d3f96]" size={28} />
              <p className="text-xs font-semibold text-slate-500">Retrieving family profiles...</p>
            </div>
          ) : error && members.length === 0 ? (
            <div className="text-center py-10 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <AlertCircle size={24} className="mx-auto text-amber-500 mb-1.5" />
              <p className="text-xs font-bold text-slate-700">{error}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">No additional family profiles found.</p>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-10 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Users size={24} className="mx-auto text-slate-400 mb-1.5" />
              <p className="text-xs font-bold text-slate-700">No Family Members Added</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Add family members from your user profile settings.</p>
            </div>
          ) : (
            members.map((member) => {
              const isSelected = selectedMemberId === member._id;
              const photo = getImageSrc(member.profilePic);

              return (
                <div
                  key={member._id}
                  onClick={() => {
                    onSelectMember(member);
                    onClose();
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-[#3d3f96] bg-indigo-50/40 ring-2 ring-[#3d3f96]/20 shadow-sm'
                      : 'border-slate-200/80 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    
                    <div className="flex items-start gap-3 min-w-0">
                      {photo ? (
                        <div className="w-11 h-11 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                          <img src={photo} alt={member.memberName} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center font-bold shrink-0">
                          <User size={18} />
                        </div>
                      )}

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-extrabold text-slate-900 tracking-tight">{member.memberName}</h4>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60">
                            {member.relation}
                          </span>
                          {member.hasInsurance && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-0.5">
                              <ShieldCheck size={10} /> Insured
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 font-medium">
                          {[member.gender, member.dob ? `DOB: ${member.dob}` : null].filter(Boolean).join(' • ')}
                        </p>

                        {member.phone && (
                          <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 pt-0.5">
                            <Phone size={11} className="text-slate-400" />
                            <span>{member.phone}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Radio Checkmark */}
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all mt-0.5 ${
                      isSelected 
                        ? 'bg-[#3d3f96] border-[#3d3f96] text-white' 
                        : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>

                  </div>
                </div>
              );
            })
          )}

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-[#3d3f96] hover:bg-slate-900 text-white py-3.5 rounded-2xl text-xs font-bold tracking-wider uppercase transition-all shadow-md shadow-indigo-100 cursor-pointer"
          >
            Confirm Patient Selection
          </button>
        </div>

      </div>
    </div>
  );
}