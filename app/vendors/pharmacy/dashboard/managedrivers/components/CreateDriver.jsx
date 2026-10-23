"use client";

import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Lock,
  Bike,
  CreditCard,
  MapPin,
  Upload,
  Loader2,
  FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import PharmacyVendorAPI from '../../../../../services/PharmacyVendorAPI';

export default function CreateDriver({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [vehicleType, setVehicleType] = useState('Bike');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [address, setAddress] = useState('');

  // File Attachments
  const [profilePic, setProfilePic] = useState(null);
  const [license, setLicense] = useState(null);
  const [rcImage, setRcImage] = useState(null);
  const [certificate, setCertificate] = useState(null);

  // Previews
  const [profilePicPreview, setProfilePicPreview] = useState('');

  if (!isOpen) return null;

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Profile photo must be less than 5MB');
        return;
      }
      setProfilePic(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setUsername('');
    setPassword('');
    setVehicleType('Bike');
    setVehicleNumber('');
    setAadhaarNumber('');
    setAddress('');
    setProfilePic(null);
    setLicense(null);
    setRcImage(null);
    setCertificate(null);
    setProfilePicPreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) return toast.error('Driver full name is required');
    if (!phone.trim() || phone.trim().length !== 10) {
      return toast.error('Valid 10-digit phone number is required');
    }
    if (!username.trim()) return toast.error('Unique username is required');
    if (!password.trim() || password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('phone', phone.trim());
      formData.append('username', username.trim().toLowerCase());
      formData.append('password', password);
      formData.append('vehicleType', vehicleType);
      if (vehicleNumber.trim()) formData.append('vehicleNumber', vehicleNumber.trim().toUpperCase());
      if (aadhaarNumber.trim()) formData.append('aadhaarNumber', aadhaarNumber.trim());
      if (address.trim()) formData.append('address', address.trim());

      if (profilePic) formData.append('profilePic', profilePic);
      if (license) formData.append('license', license);
      if (rcImage) formData.append('rcImage', rcImage);
      if (certificate) formData.append('certificate', certificate);

      const res = await PharmacyVendorAPI.addPharmacyDriver(formData);

      if (res && res.success) {
        toast.success(res.message || 'Driver registered successfully!');
        resetForm();
        onSuccess();
        onClose();
      } else {
        toast.error(res?.message || 'Failed to onboard driver');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error onboarding delivery driver');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-2xl w-full shadow-2xl relative max-h-[88vh] overflow-y-auto space-y-5 text-left border border-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#3d3f96] flex items-center justify-center shrink-0">
              <Bike size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Onboard Delivery Driver
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Register delivery staff for local prescription and OTC orders
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Section 1: Personal & Login Credentials */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2.5">
              1. Personal &amp; Login Details
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-1">
                  Mobile Number *
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit mobile number"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-1">
                  Driver App Username *
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ''))}
                  placeholder="e.g. ramesh_pharma"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-1">
                  App Login Password *
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Section 2: Vehicle & Identity */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2.5">
              2. Vehicle &amp; Identity
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              
              {/* Vehicle Type */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-1">
                  Vehicle Type
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                >
                  <option value="Bike">Motorcycle / Bike</option>
                  <option value="Scooter">Scooter</option>
                  <option value="Van">Delivery Van</option>
                </select>
              </div>

              {/* Vehicle Number */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-1">
                  Vehicle Reg Number
                </label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. DL-01-AB-1234"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition-all uppercase"
                />
              </div>

              {/* Aadhaar Number */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-1">
                  Aadhaar Card No.
                </label>
                <input
                  type="text"
                  maxLength={14}
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value)}
                  placeholder="12-digit Aadhaar UID"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                />
              </div>

              {/* Address */}
              <div className="space-y-1 sm:col-span-3">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Driver's full residential address"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                />
              </div>

            </div>
          </div>

          {/* Section 3: Verification Documents & Photos */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2.5">
              3. Verification Documents &amp; Photos
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Profile Photo */}
              <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-600">Driver Photo</span>
                  <span className="text-[9px] font-bold text-slate-400">Max 5MB</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl border border-slate-200 bg-white overflow-hidden flex items-center justify-center shrink-0">
                    {profilePicPreview ? (
                      <img src={profilePicPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User size={20} className="text-slate-300" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={handleProfilePicChange}
                    className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#3d3f96]/10 file:text-[#3d3f96] hover:file:bg-[#3d3f96]/20 cursor-pointer"
                  />
                </div>
              </div>

              {/* Driving License */}
              <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-600 block">Driving License</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, .pdf"
                  onChange={(e) => setLicense(e.target.files[0] || null)}
                  className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#3d3f96]/10 file:text-[#3d3f96] hover:file:bg-[#3d3f96]/20 cursor-pointer"
                />
              </div>

              {/* RC Document */}
              <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-600 block">Vehicle RC</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, .pdf"
                  onChange={(e) => setRcImage(e.target.files[0] || null)}
                  className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#3d3f96]/10 file:text-[#3d3f96] hover:file:bg-[#3d3f96]/20 cursor-pointer"
                />
              </div>

              {/* Police/Training Certificate */}
              <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-600 block">Police / Training Cert</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, .pdf"
                  onChange={(e) => setCertificate(e.target.files[0] || null)}
                  className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#3d3f96]/10 file:text-[#3d3f96] hover:file:bg-[#3d3f96]/20 cursor-pointer"
                />
              </div>

            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-sm active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-200 active:scale-95 transition-all disabled:opacity-60"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              <span>{loading ? 'Registering...' : 'Register Driver'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}