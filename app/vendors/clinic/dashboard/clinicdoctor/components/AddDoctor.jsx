"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  FaUserMd, 
  FaGraduationCap, 
  FaCloudUploadAlt, 
  FaPlus, 
  FaTrashAlt, 
  FaCheckCircle, 
  FaTimes, 
  FaAward, 
  FaMapMarkerAlt,
  FaSpinner,
  FaExclamationTriangle,
  FaClinicMedical,
  FaVideo,
  FaHome,
  FaRupeeSign
} from 'react-icons/fa';

import ClinicAPI from '../../../../../services/ClinicAPI';

export default function AddDoctor({ onClose, onDoctorAdded }) {
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  // Dropdown Master Data Lists
  const [specializationsList, setSpecializationsList] = useState([]);
  const [qualificationsList, setQualificationsList] = useState([]);

  // --- FORM INPUT STATE ---
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    specialist: '',
    email: '',
    altPhone: '',
    gender: 'Male',
    experience: '',
    licenseNumber: '',
    councilName: '',
    councilNumber: '',
    stateName: '',

    // 3-Way Consultation Fees & Channels
    clinicFee: 800,
    onlineFee: 500,
    homeFee: 1200,
    isClinicAvailable: true,
    isOnlineAvailable: true,
    isHomeAvailable: false,

    // Address & Coordinates
    address: '',
    city: '',
    state: '',
    pincode: '',
    latitude: '',
    longitude: '',
    password: 'Doctor@123'
  });

  // --- DYNAMIC MULTI-DEGREE QUALIFICATIONS (With Council & State) ---
  const [qualifications, setQualifications] = useState([
    { 
      id: 1, 
      degree: '', 
      college: '', 
      year: '', 
      councilName: '', 
      registrationNo: '', 
      stateName: '', 
      certFile: null, 
      certPreview: null 
    }
  ]);

  // --- MEDIA FILES ---
  const [mediaFiles, setMediaFiles] = useState({
    profileImage: null,
    licenseCert: null,
    idProof: null,
    signature: null
  });

  const [previews, setPreviews] = useState({
    profileImage: null,
    licenseCert: null,
    idProof: null,
    signature: null
  });

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';

    const loadDropdownData = async () => {
      try {
        setLoadingDropdowns(true);
        const [specsRes, qualsRes] = await Promise.all([
          ClinicAPI.getClinicActiveSpecializations(),
          ClinicAPI.getClinicActiveQualifications()
        ]);

        if (specsRes?.data) setSpecializationsList(specsRes.data);
        if (qualsRes?.data) setQualificationsList(qualsRes.data);
      } catch (err) {
        console.error("Failed to load metadata dropdowns:", err);
      } finally {
        setLoadingDropdowns(false);
      }
    };

    loadDropdownData();

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  // Qualifications handlers
  const handleAddQualification = () => {
    setQualifications(prev => [
      ...prev,
      { 
        id: Date.now(), 
        degree: '', 
        college: '', 
        year: '', 
        councilName: formData.councilName || '', 
        registrationNo: '', 
        stateName: formData.stateName || '', 
        certFile: null, 
        certPreview: null 
      }
    ]);
  };

  const handleRemoveQualification = (id) => {
    if (qualifications.length === 1) return;
    setQualifications(prev => prev.filter(q => q.id !== id));
  };

  const handleQualificationChange = (id, field, value) => {
    setQualifications(prev => prev.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const handleDegreeCertUpload = (id, e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setQualifications(prev => prev.map(q => 
        q.id === id 
          ? { ...q, certFile: file, certPreview: URL.createObjectURL(file) } 
          : q
      ));
    }
  };

  // Media upload handlers
  const handleMediaChange = (field, e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMediaFiles(prev => ({ ...prev, [field]: file }));
      setPreviews(prev => ({
        ...prev,
        [field]: {
          url: URL.createObjectURL(file),
          name: file.name
        }
      }));
    }
  };

  const handleRemoveMedia = (field) => {
    setMediaFiles(prev => ({ ...prev, [field]: null }));
    setPreviews(prev => ({ ...prev, [field]: null }));
  };

  // --- SUBMIT WITH FORM DATA AS MULTIPART ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      const payload = new FormData();

      // Required fields
      payload.append('name', formData.name.trim());
      payload.append('phone', formData.phone.trim());
      payload.append('specialist', formData.specialist);
      payload.append('clinicFee', Number(formData.clinicFee));

      // 3-Way Fees & Channels
      if (formData.onlineFee !== '') payload.append('onlineFee', Number(formData.onlineFee));
      if (formData.homeFee !== '') payload.append('homeFee', Number(formData.homeFee));
      payload.append('isClinicAvailable', Boolean(formData.isClinicAvailable));
      payload.append('isOnlineAvailable', Boolean(formData.isOnlineAvailable));
      payload.append('isHomeAvailable', Boolean(formData.isHomeAvailable));

      // Personal & Licensing Details
      if (formData.email) payload.append('email', formData.email.trim());
      if (formData.altPhone) payload.append('altPhone', formData.altPhone.trim());
      if (formData.gender) payload.append('gender', formData.gender);
      if (formData.experience !== '') payload.append('experience', Number(formData.experience));
      if (formData.licenseNumber) payload.append('licenseNumber', formData.licenseNumber.trim());
      if (formData.councilName) payload.append('councilName', formData.councilName.trim());
      if (formData.councilNumber) payload.append('councilNumber', formData.councilNumber.trim());
      if (formData.stateName) payload.append('stateName', formData.stateName.trim());

      // Address & Location
      if (formData.address) payload.append('address', formData.address.trim());
      if (formData.city) payload.append('city', formData.city.trim());
      if (formData.state) payload.append('state', formData.state.trim());
      if (formData.pincode) payload.append('pincode', formData.pincode.trim());
      if (formData.latitude) payload.append('latitude', Number(formData.latitude));
      if (formData.longitude) payload.append('longitude', Number(formData.longitude));
      if (formData.password) payload.append('password', formData.password);

      // JSON Qualifications
      const sanitizedQualifications = qualifications
        .filter(q => q.degree.trim() !== '')
        .map(q => ({
          degree: q.degree.trim(),
          college: q.college.trim(),
          year: q.year.trim(),
          councilName: q.councilName.trim(),
          registrationNo: q.registrationNo.trim(),
          stateName: q.stateName.trim()
        }));

      if (sanitizedQualifications.length > 0) {
        payload.append('qualifications', JSON.stringify(sanitizedQualifications));
      }

      // Single Binary Files
      if (mediaFiles.profileImage) payload.append('profileImage', mediaFiles.profileImage);
      if (mediaFiles.licenseCert) payload.append('licenseCert', mediaFiles.licenseCert);
      if (mediaFiles.idProof) payload.append('idProof', mediaFiles.idProof);
      if (mediaFiles.signature) payload.append('signature', mediaFiles.signature);

      // Multi-file Degree Certificates
      qualifications.forEach(q => {
        if (q.certFile) {
          payload.append('degreeCertificates', q.certFile);
        }
      });

      const response = await ClinicAPI.registerClinicDoctor(payload);

      if (response?.success) {
        onDoctorAdded(response.data);
        onClose();
      } else {
        setErrorMessage(response?.message || "Failed to register doctor. Please verify details.");
      }
    } catch (err) {
      console.error("Error registering doctor:", err);
      setErrorMessage(err.response?.data?.message || err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return null;

  const UploadCard = ({ label, field }) => {
    const prev = previews[field];
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
        {prev ? (
          <div className="relative rounded-2xl border border-slate-200 bg-white p-2.5 flex items-center gap-3">
            <img src={prev.url} alt={label} className="w-12 h-12 rounded-xl object-cover border border-slate-100" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-700 truncate">{prev.name}</p>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <FaCheckCircle size={10} /> Attached
              </span>
            </div>
            <button 
              type="button" 
              onClick={() => handleRemoveMedia(field)}
              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
            >
              <FaTimes size={12} />
            </button>
          </div>
        ) : (
          <label className="flex items-center gap-3 p-3.5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#3D3F96] bg-slate-50/50 hover:bg-indigo-50/20 cursor-pointer transition-all">
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#3D3F96] shadow-sm shrink-0">
              <FaCloudUploadAlt size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-[#3D3F96] block">Select Document</span>
              <span className="text-[10px] text-slate-400 font-medium block truncate">PNG, JPG, or PDF</span>
            </div>
            <input type="file" accept="image/*,.pdf" onChange={(e) => handleMediaChange(field, e)} className="hidden" />
          </label>
        )}
      </div>
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-md">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden animate-modalScale">
        
        {/* --- STICKY HEADER --- */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-[#3D3F96] flex items-center justify-center text-lg border border-indigo-100/50">
              <FaUserMd />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">Register New Clinic Doctor</h3>
              <p className="text-xs text-slate-400 font-medium">Onboard doctor with 3-way consultation fees, council credentials & documents</p>
            </div>
          </div>
          
          <button 
            type="button" 
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all"
          >
            <FaTimes size={14} />
          </button>
        </div>

        {/* --- ERROR BANNER --- */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-center gap-3 text-rose-700 text-xs font-semibold">
            <FaExclamationTriangle className="shrink-0 text-rose-500 text-base" />
            <span className="flex-1">{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-rose-700"><FaTimes /></button>
          </div>
        )}

        {/* --- SCROLLABLE BODY --- */}
        <form id="add-doctor-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-7 bg-slate-50/40">
          
          {/* SECTION 1: PERSONAL & CONTACT */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3D3F96]">
              <span className="w-2 h-2 rounded-full bg-[#3D3F96]"></span> 1. Personal & Identity Details
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Doctor Full Name *</label>
                <input 
                  type="text" 
                  name="name" 
                  placeholder="e.g. Dr. Bajirao" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  required 
                  className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/10 transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1.5">10-Digit Phone *</label>
                <input 
                  type="tel" 
                  name="phone" 
                  placeholder="9876543211" 
                  value={formData.phone} 
                  onChange={handleInputChange} 
                  required 
                  className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/10 transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Primary Specialization *</label>
                <select 
                  name="specialist"
                  value={formData.specialist}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/10 transition-all"
                >
                  <option value="">{loadingDropdowns ? "Loading..." : "Select Specialization"}</option>
                  {specializationsList.map((item) => (
                    <option key={item._id} value={item.name}>{item.name}</option>
                  ))}
                  <option value="General Medicine">General Medicine</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  placeholder="doctor@yopmail.com" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/10 transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Alternate Contact Phone</label>
                <input 
                  type="tel" 
                  name="altPhone" 
                  placeholder="9123456789" 
                  value={formData.altPhone} 
                  onChange={handleInputChange} 
                  className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/10 transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Gender</label>
                <select 
                  name="gender" 
                  value={formData.gender} 
                  onChange={handleInputChange} 
                  className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:border-[#3D3F96]"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Practice Experience (Years)</label>
                <input 
                  type="number" 
                  name="experience" 
                  placeholder="e.g. 12" 
                  min="0"
                  value={formData.experience} 
                  onChange={handleInputChange} 
                  className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:border-[#3D3F96]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Initial Login Password</label>
                <input 
                  type="password" 
                  name="password" 
                  placeholder="Default: Doctor@123" 
                  value={formData.password} 
                  onChange={handleInputChange} 
                  className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:border-[#3D3F96]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: 3-WAY CONSULTATION FEES & AVAILABILITY */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3D3F96]">
              <span className="w-2 h-2 rounded-full bg-[#3D3F96]"></span> 2. 3-Way Consultation Fees & Channels
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Clinic OPD Fee */}
              <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#3D3F96] flex items-center gap-1.5">
                    <FaClinicMedical /> Physical Clinic OPD *
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="isClinicAvailable"
                      checked={formData.isClinicAvailable}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#3D3F96]"></div>
                  </label>
                </div>

                <div className="relative">
                  <FaRupeeSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                  <input 
                    type="number" 
                    name="clinicFee"
                    placeholder="800"
                    value={formData.clinicFee}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-8 pr-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:border-[#3D3F96]"
                  />
                </div>
              </div>

              {/* Video / Online Fee */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <FaVideo className="text-indigo-600" /> Online Video Consult
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="isOnlineAvailable"
                      checked={formData.isOnlineAvailable}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="relative">
                  <FaRupeeSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                  <input 
                    type="number" 
                    name="onlineFee"
                    placeholder="500"
                    value={formData.onlineFee}
                    onChange={handleInputChange}
                    className="w-full pl-8 pr-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:border-[#3D3F96]"
                  />
                </div>
              </div>

              {/* Home Visit Fee */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <FaHome className="text-emerald-600" /> Home Visit Consult
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="isHomeAvailable"
                      checked={formData.isHomeAvailable}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="relative">
                  <FaRupeeSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                  <input 
                    type="number" 
                    name="homeFee"
                    placeholder="1200"
                    value={formData.homeFee}
                    onChange={handleInputChange}
                    className="w-full pl-8 pr-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:border-[#3D3F96]"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 3: MEDICAL COUNCIL REGISTRATION DETAILS */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3D3F96]">
              <span className="w-2 h-2 rounded-full bg-[#3D3F96]"></span> 3. Medical Council Registration
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">License / Reg Number</label>
                <input 
                  type="text" 
                  name="licenseNumber"
                  placeholder="e.g. MCI-48209"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none focus:border-[#3D3F96]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">State Council Name</label>
                <input 
                  type="text" 
                  name="councilName"
                  placeholder="e.g. Delhi Medical Council"
                  value={formData.councilName}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none focus:border-[#3D3F96]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Council Reg No.</label>
                <input 
                  type="text" 
                  name="councilNumber"
                  placeholder="e.g. DMC-2016-9901"
                  value={formData.councilNumber}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none focus:border-[#3D3F96]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Council State Name</label>
                <input 
                  type="text" 
                  name="stateName"
                  placeholder="e.g. Delhi"
                  value={formData.stateName}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none focus:border-[#3D3F96]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: DYNAMIC QUALIFICATIONS (With Council & State) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3D3F96]">
                <span className="w-2 h-2 rounded-full bg-[#3D3F96]"></span> 4. Educational Qualifications & Degrees
              </div>
              
              <button 
                type="button" 
                onClick={handleAddQualification}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#3D3F96] text-xs font-bold transition-all"
              >
                <FaPlus size={11} /> Add Degree
              </button>
            </div>

            <div className="space-y-3">
              {qualifications.map((item, index) => (
                <div key={item.id} className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-slate-600">Degree #{index + 1}</span>
                    {qualifications.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => handleRemoveQualification(item.id)}
                        className="text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1"
                      >
                        <FaTrashAlt size={10} /> Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      {qualificationsList.length > 0 ? (
                        <select 
                          value={item.degree}
                          onChange={(e) => handleQualificationChange(item.id, 'degree', e.target.value)}
                          className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none focus:border-[#3D3F96]"
                        >
                          <option value="">Select Degree</option>
                          {qualificationsList.map(q => (
                            <option key={q._id} value={q.name}>{q.name}</option>
                          ))}
                        </select>
                      ) : (
                        <input 
                          type="text" 
                          placeholder="Degree (e.g. MBBS)" 
                          value={item.degree}
                          onChange={(e) => handleQualificationChange(item.id, 'degree', e.target.value)}
                          className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none"
                        />
                      )}
                    </div>

                    <input 
                      type="text" 
                      placeholder="College (e.g. AIIMS New Delhi)" 
                      value={item.college}
                      onChange={(e) => handleQualificationChange(item.id, 'college', e.target.value)}
                      className="px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none"
                    />

                    <input 
                      type="number" 
                      placeholder="Passing Year (e.g. 2012)" 
                      value={item.year}
                      onChange={(e) => handleQualificationChange(item.id, 'year', e.target.value)}
                      className="px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none"
                    />

                    <input 
                      type="text" 
                      placeholder="Medical Council (e.g. Delhi Medical Council)" 
                      value={item.councilName}
                      onChange={(e) => handleQualificationChange(item.id, 'councilName', e.target.value)}
                      className="px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none"
                    />

                    <input 
                      type="text" 
                      placeholder="Registration No. (e.g. MCI-48209)" 
                      value={item.registrationNo}
                      onChange={(e) => handleQualificationChange(item.id, 'registrationNo', e.target.value)}
                      className="px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none"
                    />

                    <input 
                      type="text" 
                      placeholder="State (e.g. Delhi)" 
                      value={item.stateName}
                      onChange={(e) => handleQualificationChange(item.id, 'stateName', e.target.value)}
                      className="px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none"
                    />
                  </div>

                  {/* Degree Certificate Upload */}
                  <div className="pt-1 flex items-center justify-between border-t border-slate-200/60">
                    <label className="inline-flex items-center gap-2 text-xs font-bold text-[#3D3F96] hover:underline cursor-pointer">
                      <FaCloudUploadAlt size={14} />
                      {item.certFile ? `Selected: ${item.certFile.name}` : "Attach Degree Certificate File (Optional)"}
                      <input 
                        type="file" 
                        accept="image/*,.pdf" 
                        onChange={(e) => handleDegreeCertUpload(item.id, e)} 
                        className="hidden" 
                      />
                    </label>
                    {item.certFile && (
                      <button 
                        type="button" 
                        onClick={() => handleQualificationChange(item.id, 'certFile', null)}
                        className="text-[11px] text-rose-500 font-semibold hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 5: CLINIC ADDRESS */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3D3F96]">
              <span className="w-2 h-2 rounded-full bg-[#3D3F96]"></span> 5. Physical Consultation Location
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Consultation Street Address</label>
                <input 
                  type="text" 
                  name="address" 
                  placeholder="Plot 42, Health Street, Saket" 
                  value={formData.address} 
                  onChange={handleInputChange} 
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none focus:border-[#3D3F96]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">City</label>
                <input 
                  type="text" 
                  name="city" 
                  placeholder="New Delhi" 
                  value={formData.city} 
                  onChange={handleInputChange} 
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none focus:border-[#3D3F96]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">State</label>
                <input 
                  type="text" 
                  name="state" 
                  placeholder="Delhi" 
                  value={formData.state} 
                  onChange={handleInputChange} 
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none focus:border-[#3D3F96]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Pincode</label>
                <input 
                  type="text" 
                  name="pincode" 
                  placeholder="110017" 
                  value={formData.pincode} 
                  onChange={handleInputChange} 
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none focus:border-[#3D3F96]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 6: VERIFICATION DOCUMENTS */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3D3F96]">
              <span className="w-2 h-2 rounded-full bg-[#3D3F96]"></span> 6. Verification Documents & Digital Signature
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <UploadCard label="Profile Picture" field="profileImage" />
              <UploadCard label="Medical License Certificate" field="licenseCert" />
              <UploadCard label="Govt ID Proof (Aadhar/PAN)" field="idProof" />
              <UploadCard label="Digital Signature (.png)" field="signature" />
            </div>
          </div>

        </form>

        {/* --- STICKY FOOTER --- */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-end gap-3 shrink-0">
          <button 
            type="button" 
            onClick={onClose} 
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-500 transition-all"
          >
            Cancel
          </button>
          
          <button 
            type="submit" 
            form="add-doctor-form"
            disabled={submitting}
            className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-[#3D3F96] hover:bg-[#2C2E75] text-white text-xs font-bold shadow-lg shadow-indigo-950/10 transition-all disabled:opacity-60"
          >
            {submitting ? (
              <>
                <FaSpinner className="animate-spin" /> Onboarding Doctor...
              </>
            ) : (
              <>
                <FaCheckCircle /> Register Doctor Profile
              </>
            )}
          </button>
        </div>

      </div>

      <style jsx global>{`
        @keyframes modalScale {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-modalScale {
          animation: modalScale 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>,
    document.body
  );
}