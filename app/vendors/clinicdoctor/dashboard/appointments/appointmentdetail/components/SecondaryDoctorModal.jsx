"use client";

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Users, X, Search, UserPlus, Loader2, Check } from 'lucide-react';
import ClinicDoctorAPI from '../../../../../../services/ClinicDoctorAPI';

export default function SecondaryDoctorModal({ appointmentId, isOpen, onClose, onSuccess }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [roleType, setRoleType] = useState('Second-Opinion');
  const [priority, setPriority] = useState('Routine');
  const [patientCondition, setPatientCondition] = useState('Stable');
  const [requestReason, setRequestReason] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  // Fetch Available On-Duty Doctors in the Clinic
  useEffect(() => {
    if (!isOpen || !appointmentId) return;

    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const response = await ClinicDoctorAPI.getAvailableSecondaryDoctors({
          appointmentId,
          search: searchFilter.trim()
        });
        if (response && response.success) {
          setDoctors(response.data || []);
        } else {
          setDoctors([]);
        }
      } catch (err) {
        console.error("Error fetching available clinic doctors:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [isOpen, appointmentId, searchFilter]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId) {
      toast.error("Please select a doctor from the list.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        secondaryDoctorId: selectedDoctorId,
        roleType,
        priority,
        patientCondition,
        requestReason: requestReason.trim()
      };

      const response = await ClinicDoctorAPI.addSecondaryDoctor(appointmentId, payload);
      if (response && response.success) {
        toast.success(response.message || "Specialist requested successfully!");
        onSuccess();
        onClose();
      } else {
        toast.error(response?.message || "Failed to add doctor");
      }
    } catch (err) {
      console.error("Error adding secondary doctor:", err);
      toast.error(err?.response?.data?.message || err.message || "Failed to add specialist.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5 text-teal-600">
            <Users size={20} />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              Request Secondary Doctor / 2nd Opinion
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Role & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                Consultation Role
              </label>
              <select
                value={roleType}
                onChange={(e) => setRoleType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="Second-Opinion">Second Opinion</option>
                <option value="Secondary-Doctor">Secondary Attending</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                Triage Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="Routine">Routine</option>
                <option value="Urgent">Urgent</option>
                <option value="Most Urgent">Most Urgent</option>
              </select>
            </div>
          </div>

          {/* Select Doctor from Available List */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-600 uppercase block">
              Choose Available Specialist (On Duty)
            </label>

            <div className="relative mb-2">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by name, speciality..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              />
            </div>

            <div className="max-h-44 overflow-y-auto space-y-1.5 border border-slate-100 rounded-2xl p-2 bg-slate-50/50">
              {loading ? (
                <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 size={14} className="animate-spin text-teal-600" />
                  <span>Loading doctors...</span>
                </div>
              ) : doctors.length === 0 ? (
                <p className="p-4 text-center text-xs text-slate-400">
                  No other active on-duty specialists found in this clinic.
                </p>
              ) : (
                doctors.map((doc) => {
                  const isSelected = selectedDoctorId === doc._id;
                  const isAlreadyAdded = doc.isAlreadyAddedOnCase;

                  return (
                    <div
                      key={doc._id}
                      onClick={() => !isAlreadyAdded && setSelectedDoctorId(doc._id)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition cursor-pointer ${
                        isSelected
                          ? 'bg-teal-50 border-teal-500 shadow-2xs'
                          : isAlreadyAdded
                          ? 'opacity-50 cursor-not-allowed bg-slate-100 border-slate-200'
                          : 'bg-white border-slate-200 hover:border-teal-300'
                      }`}
                    >
                      <div>
                        <strong className="text-slate-900 block font-bold">{doc.name}</strong>
                        <span className="text-[11px] text-slate-500">
                          {doc.speciality} • {doc.qualification}
                        </span>
                      </div>

                      {isAlreadyAdded ? (
                        <span className="text-[10px] font-bold text-slate-400">Already Added</span>
                      ) : isSelected ? (
                        <span className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                          <Check size={14} />
                        </span>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Clinical Reason & Condition */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
              Clinical Reason for Referral / Opinion
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Need endocrinologist opinion on insulin dosage adjustment..."
              value={requestReason}
              onChange={(e) => setRequestReason(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedDoctorId}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition shadow-md shadow-teal-600/20 cursor-pointer disabled:opacity-50"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
              <span>Send Specialist Request</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}