"use client";

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Bike,
  MapPin,
  ExternalLink,
  Loader2,
  FileCheck,
  ShieldCheck,
  Building,
  Globe
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import LabVendorAPI from '../../../../../services/LabVendorAPI';

// Helper to resolve URLs
const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('blob:') || path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.1.10:5002').replace(/\/+$/, '');
  const clean = path.replace(/^public\//, '').replace(/^\/+/, '');
  return `${base}/${clean}`;
};

export default function ViewDriver({ driverId, isOpen, onClose, onStatusUpdated }) {
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (!isOpen || !driverId) return;

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await LabVendorAPI.labVendorGetDriverDetailsById(driverId);
        if (res && res.success) {
          setDriver(res.data);
        } else {
          toast.error('Failed to load phlebotomist details');
        }
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || 'Error fetching staff profile');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [driverId, isOpen]);

  if (!isOpen) return null;

  const handleStatusChange = async (newStatus) => {
    if (!driver || driver.status === newStatus) return;
    setUpdatingStatus(true);
    try {
      const res = await LabVendorAPI.labVendorToggleDriverStatus(driver._id, { status: newStatus });
      if (res && res.success) {
        toast.success(res.message || `Status updated to ${newStatus}`);
        setDriver(prev => ({ ...prev, status: newStatus, isOnline: res.isOnline }));
        if (onStatusUpdated) onStatusUpdated(driver._id, newStatus, res.isOnline);
      } else {
        toast.error(res?.message || 'Failed to update status');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error updating status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl relative max-h-[85vh] overflow-y-auto space-y-4 text-left border border-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight flex items-center gap-2">
            <ShieldCheck className="text-[#3d3f96]" size={20} /> Phlebotomist Dossier &amp; KYC
          </h3>
          <p className="text-xs text-slate-400 font-bold mt-0.5">
            Verified identity credentials, medical/training certifications, and vehicle registration
          </p>
        </div>

        {/* Body Content */}
        {loading ? (
          <div className="py-14 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="animate-spin text-[#3d3f96] mb-2" size={28} />
            <span className="text-xs font-bold uppercase tracking-wider">Loading Record...</span>
          </div>
        ) : !driver ? (
          <div className="py-8 text-center text-xs text-slate-500 font-semibold">
            Phlebotomist record could not be retrieved.
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            
            {/* Overview Card */}
            <div className="flex items-start gap-3.5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-16 h-16 rounded-2xl border border-slate-200 bg-white overflow-hidden shrink-0 flex items-center justify-center">
                {driver.profilePic ? (
                  <img
                    src={getImageUrl(driver.profilePic)}
                    alt={driver.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://placehold.co/100x100?text=Staff';
                    }}
                  />
                ) : (
                  <User size={28} className="text-slate-300" />
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-base font-black text-slate-900 truncate">{driver.name}</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase border ${
                    driver.status === 'Available'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : driver.status === 'Busy'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-slate-200 text-slate-700 border-slate-300'
                  }`}>
                    {driver.status}
                  </span>
                </div>

                <p className="text-xs text-slate-500 font-mono">
                  Username: <strong className="text-slate-800">@{driver.username}</strong>
                </p>

                <div className="flex items-center gap-3 pt-0.5 text-xs text-slate-600 font-bold">
                  <span className="flex items-center gap-1">
                    <Phone size={12} className="text-slate-400" />
                    {driver.phone}
                  </span>
                  {driver.alternateNumber && (
                    <span className="text-slate-400 text-[11px]">
                      Alt: {driver.alternateNumber}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Availability Toolbar */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Duty Availability:
              </span>
              <div className="flex items-center gap-1.5">
                {['Available', 'Busy', 'Offline'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    disabled={updatingStatus || driver.status === st}
                    onClick={() => handleStatusChange(st)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                      driver.status === st
                        ? 'bg-[#3d3f96] text-white shadow-md shadow-teal-100'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    } disabled:opacity-50 cursor-pointer`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Vehicle & Identity Details */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-black">Vehicle</span>
                <span className="text-slate-800 text-sm font-black">{driver.vehicleType || 'Bike'}</span>
                <p className="font-mono text-slate-500 text-[11px] font-bold">{driver.vehicleNumber || 'Unassigned'}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-black">Aadhaar UID</span>
                <span className="font-mono text-slate-800 text-sm font-black">
                  {driver.aadhaarNumber || 'Not Uploaded'}
                </span>
                <p className="text-[10px] text-emerald-600 font-bold">Govt ID On File</p>
              </div>

              {/* Address / Location details */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 col-span-2 space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-black">Residential &amp; Region Info</span>
                <p className="text-xs font-bold text-slate-700">{driver.address || 'Address not registered'}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-semibold pt-1">
                  {driver.city && <span>City: <strong className="text-slate-800">{driver.city}</strong></span>}
                  {driver.state && <span>State: <strong className="text-slate-800">{driver.state}</strong></span>}
                  {driver.country && <span>Country: <strong className="text-slate-800">{driver.country}</strong></span>}
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Statutory &amp; Medical Certifications
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                
                {/* Training / Medical Certificate */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-500 block">Medical / Cert</span>
                  {driver.documents?.certificate ? (
                    <a
                      href={getImageUrl(driver.documents.certificate)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#3d3f96] hover:underline"
                    >
                      <FileCheck size={13} /> View <ExternalLink size={10} />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium italic">Missing</span>
                  )}
                </div>

                {/* Driving License */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-500 block">Driving License</span>
                  {driver.documents?.license ? (
                    <a
                      href={getImageUrl(driver.documents.license)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#3d3f96] hover:underline"
                    >
                      <FileCheck size={13} /> View <ExternalLink size={10} />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium italic">Missing</span>
                  )}
                </div>

                {/* RC */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-500 block">Vehicle RC</span>
                  {driver.documents?.rcImage ? (
                    <a
                      href={getImageUrl(driver.documents.rcImage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#3d3f96] hover:underline"
                    >
                      <FileCheck size={13} /> View <ExternalLink size={10} />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium italic">Missing</span>
                  )}
                </div>

              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                Close Dossier
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}