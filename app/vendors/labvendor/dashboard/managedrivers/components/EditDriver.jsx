"use client";

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Lock,
  Bike,
  Loader2,
  Save,
  Upload
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import LabVendorAPI from '../../../../../services/LabVendorAPI';

export default function EditDriver({ driverId, isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [vehicleType, setVehicleType] = useState('Bike');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [address, setAddress] = useState('');

  // Replacement Files
  const [profilePic, setProfilePic] = useState(null);
  const [license, setLicense] = useState(null);
  const [rcImage, setRcImage] = useState(null);
  const [certificate, setCertificate] = useState(null);

  useEffect(() => {
    if (!isOpen || !driverId) return;

    const loadData = async () => {
      setFetching(true);
      try {
        const res = await LabVendorAPI.labVendorGetDriverDetailsById(driverId);
        if (res && res.success && res.data) {
          const d = res.data;
          setName(d.name || '');
          setPhone(d.phone || '');
          setVehicleType(d.vehicleType || 'Bike');
          setVehicleNumber(d.vehicleNumber || '');
          setAddress(d.address || '');
          setPassword('');
          setProfilePic(null);
          setLicense(null);
          setRcImage(null);
          setCertificate(null);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to pre-fill phlebotomist data');
      } finally {
        setFetching(false);
      }
    };

    loadData();
  }, [driverId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      if (name.trim()) formData.append('name', name.trim());
      if (phone.trim()) formData.append('phone', phone.trim());
      if (password.trim()) formData.append('password', password);
      if (vehicleType) formData.append('vehicleType', vehicleType);
      if (vehicleNumber.trim()) formData.append('vehicleNumber', vehicleNumber.trim().toUpperCase());
      if (address.trim()) formData.append('address', address.trim());

      if (profilePic) formData.append('profilePic', profilePic);
      if (license) formData.append('license', license);
      if (rcImage) formData.append('rcImage', rcImage);
      if (certificate) formData.append('certificate', certificate);

      const res = await LabVendorAPI.labVendorUpdateDriver(driverId, formData);

      if (res && res.success) {
        toast.success(res.message || 'Phlebotomist updated successfully!');
        onSuccess();
        onClose();
      } else {
        toast.error(res?.message || 'Update failed');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error updating phlebotomist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl relative max-h-[85vh] overflow-y-auto space-y-4 text-left border border-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Edit Phlebotomist Details
            </h3>
            <p className="text-xs text-slate-400 font-bold">
              Update credentials, vehicle details, or replace compliance documents
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {fetching ? (
          <div className="py-14 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="animate-spin text-[#3d3f96] mb-2" size={28} />
            <span className="text-xs font-bold uppercase tracking-wider">Loading details...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">Phone</label>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96]"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-500">
                  New Password <span className="font-normal text-slate-400">(Leave blank to keep unchanged)</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">Vehicle Type</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96]"
                >
                  <option value="Bike">Bike</option>
                  <option value="Scooter">Scooter</option>
                  <option value="Van">Van</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">Vehicle Reg Number</label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:border-[#3d3f96]"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-500">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-[#3d3f96]"
                />
              </div>
            </div>

            {/* Document Replacement Inputs */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400 block">
                Replace Documents (Optional)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[9px] uppercase font-black text-slate-500 block mb-1">New Profile Pic</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfilePic(e.target.files[0] || null)}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#3d3f96]/10 file:text-[#3d3f96]"
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase font-black text-slate-500 block mb-1">New Medical / Cert</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setCertificate(e.target.files[0] || null)}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#3d3f96]/10 file:text-[#3d3f96]"
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase font-black text-slate-500 block mb-1">New License</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setLicense(e.target.files[0] || null)}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#3d3f96]/10 file:text-[#3d3f96]"
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase font-black text-slate-500 block mb-1">New RC Image</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setRcImage(e.target.files[0] || null)}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#3d3f96]/10 file:text-[#3d3f96]"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-[#3d3f96] hover:bg-[#0f766e] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-teal-100 active:scale-95 transition-all"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                <span>Save Changes</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}