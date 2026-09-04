"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  FaUserMd, 
  FaPencilAlt, 
  FaTimes, 
  FaSave, 
  FaCheckCircle, 
  FaCertificate, 
  FaAward, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaIdCard, 
  FaCloudUploadAlt, 
  FaPlus, 
  FaTrashAlt, 
  FaSpinner, 
  FaEye, 
  FaExternalLinkAlt,
  FaRupeeSign,
  FaClinicMedical,
  FaVideo,
  FaHome,
  FaLock
} from 'react-icons/fa';

import ClinicAPI from '../../../../../services/ClinicAPI';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.1.7:5002';

const getImageUrl = (path) => {
  if (!path) return 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:') || path.startsWith('data:')) {
    return path;
  }
  const cleanBase = BACKEND_URL.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

export default function ViewDoctor({ doctor, onClose, onDoctorUpdated }) {
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'fees' | 'qualifications' | 'documents' | 'address'
  const [errorMessage, setErrorMessage] = useState(null);

  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    name: doctor?.name || '',
    email: doctor?.email || '',
    phone: doctor?.phone || '',
    altPhone: doctor?.alternatePhone || doctor?.altPhone || '',
    gender: doctor?.gender || 'Male',
    specialist: doctor?.speciality || doctor?.specialist || '',
    experience: doctor?.experienceYears || doctor?.experience || 0,
    licenseNumber: doctor?.licenseNumber || '',
    councilNumber: doctor?.councilNumber || doctor?.licenseNumber || '',
    councilName: doctor?.councilName || '',
    stateName: doctor?.stateName || '',
    dutyStatus: doctor?.dutyStatus || 'On Duty',
    password: '',

    // 3-Way Fees
    clinicFee: doctor?.fees?.clinic ?? 800,
    onlineFee: doctor?.fees?.online ?? 500,
    homeFee: doctor?.fees?.home ?? 1200,
    isClinicAvailable: doctor?.consultationStatus?.clinic ?? true,
    isOnlineAvailable: doctor?.consultationStatus?.online ?? true,
    isHomeAvailable: doctor?.consultationStatus?.home ?? false,

    // Address
    address: doctor?.address || '',
    city: doctor?.city || '',
    state: doctor?.state || '',
    pincode: doctor?.pincode || '',
    latitude: doctor?.location?.lat || '',
    longitude: doctor?.location?.lng || '',
  });

  // Dynamic Qualifications
  const [qualifications, setQualifications] = useState(
    Array.isArray(doctor?.qualifications) && doctor.qualifications.length > 0
      ? doctor.qualifications.map((q, idx) => ({
          id: idx + 1,
          degree: q.degree || '',
          college: q.college || '',
          year: q.year || '',
          councilName: q.councilName || '',
          registrationNo: q.registrationNo || '',
          stateName: q.stateName || '',
          certFile: null,
          certPreview: q.certUrl ? getImageUrl(q.certUrl) : null
        }))
      : [{ id: 1, degree: doctor?.qualification || 'MBBS', college: '', year: '', councilName: '', registrationNo: '', stateName: '', certFile: null, certPreview: null }]
  );

  // Replacement Files
  const [newFiles, setNewFiles] = useState({
    profileImage: null,
    licenseCert: null,
    idProof: null,
    signature: null
  });

  const [mediaPreviews, setMediaPreviews] = useState({
    profileImage: doctor?.profileImage ? getImageUrl(doctor.profileImage) : null,
    signature: doctor?.signatureImage ? getImageUrl(doctor.signatureImage) : null,
    licenseCert: doctor?.documents?.[0] ? getImageUrl(doctor.documents[0]) : null,
    idProof: doctor?.documents?.[1] ? getImageUrl(doctor.documents[1]) : null,
  });

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
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

  const handleAddQualification = () => {
    setQualifications(prev => [
      ...prev,
      { id: Date.now(), degree: '', college: '', year: '', councilName: '', registrationNo: '', stateName: '', certFile: null, certPreview: null }
    ]);
  };

  const handleRemoveQualification = (id) => {
    if (qualifications.length === 1) return;
    setQualifications(prev => prev.filter(q => q.id !== id));
  };

  const handleQualificationChange = (id, field, value) => {
    setQualifications(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const handleDegreeCertChange = (id, e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setQualifications(prev => prev.map(q => 
        q.id === id ? { ...q, certFile: file, certPreview: URL.createObjectURL(file) } : q
      ));
    }
  };

  const handleMediaReplace = (field, e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewFiles(prev => ({ ...prev, [field]: file }));
      setMediaPreviews(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
    }
  };

  // --- SAVE CHANGES ---
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);

    try {
      const payload = new FormData();

      payload.append('name', formData.name.trim());
      payload.append('phone', formData.phone.trim());
      payload.append('email', formData.email.trim());
      payload.append('altPhone', formData.altPhone.trim());
      payload.append('gender', formData.gender);
      payload.append('specialist', formData.specialist);
      payload.append('experience', Number(formData.experience));
      payload.append('licenseNumber', formData.licenseNumber.trim());
      payload.append('councilName', formData.councilName.trim());
      payload.append('councilNumber', formData.councilNumber.trim());

      // 3-Way Fees
      payload.append('clinicFee', Number(formData.clinicFee));
      payload.append('onlineFee', Number(formData.onlineFee));
      payload.append('homeFee', Number(formData.homeFee));

      // Address
      payload.append('address', formData.address.trim());
      payload.append('city', formData.city.trim());
      payload.append('state', formData.state.trim());
      payload.append('pincode', formData.pincode.trim());

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
      payload.append('qualifications', JSON.stringify(sanitizedQualifications));

      // Replace Documents
      if (newFiles.profileImage) payload.append('profileImage', newFiles.profileImage);
      if (newFiles.licenseCert) payload.append('licenseCert', newFiles.licenseCert);
      if (newFiles.idProof) payload.append('idProof', newFiles.idProof);
      if (newFiles.signature) payload.append('signature', newFiles.signature);

      qualifications.forEach(q => {
        if (q.certFile) payload.append('degreeCertificates', q.certFile);
      });

      const response = await ClinicAPI.updateClinicDoctor(doctor._id, payload);

      if (response?.success) {
        if (formData.dutyStatus !== doctor.dutyStatus) {
          await ClinicAPI.toggleDoctorDutyStatus(doctor._id, { dutyStatus: formData.dutyStatus });
        }
        onDoctorUpdated(response.data);
        setIsEditing(false);
      } else {
        setErrorMessage(response?.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Error updating doctor:", err);
      setErrorMessage(err.response?.data?.message || err.message || "Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-md">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden animate-modalScale">
        
        {/* --- MODAL HEADER --- */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img 
                src={mediaPreviews.profileImage || getImageUrl(doctor?.profileImage)} 
                alt={formData.name} 
                className="w-12 h-12 rounded-2xl object-cover border border-slate-100 shadow-sm"
              />
              <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                formData.dutyStatus === 'On Duty' ? 'bg-emerald-500' :
                formData.dutyStatus === 'Busy' ? 'bg-rose-500' :
                formData.dutyStatus === 'On Leave' ? 'bg-amber-500' : 'bg-slate-400'
              }`} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 leading-tight">{formData.name}</h3>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-indigo-50 text-[#3D3F96]">
                  {formData.specialist || 'General Medicine'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                License: {formData.licenseNumber || 'N/A'} • {formData.councilName || 'State Medical Council'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isEditing 
                  ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100' 
                  : 'bg-indigo-50 text-[#3D3F96] border border-indigo-100 hover:bg-indigo-100'
              }`}
            >
              {isEditing ? <><FaEye size={12} /> View Profile</> : <><FaPencilAlt size={12} /> Edit Details</>}
            </button>

            <button 
              type="button" 
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all"
            >
              <FaTimes size={14} />
            </button>
          </div>
        </div>

        {/* --- NAVIGATION TABS --- */}
        <div className="px-6 bg-slate-50/80 border-b border-slate-100 flex gap-2 overflow-x-auto shrink-0 py-2">
          {[
            { key: 'overview', label: 'Identity & Registration' },
            { key: 'fees', label: '3-Way Consultation Fees' },
            { key: 'qualifications', label: 'Degrees & Council' },
            { key: 'documents', label: 'Documents & Signature' },
            { key: 'address', label: 'Clinic Address' },
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.key 
                  ? 'bg-white text-[#3D3F96] shadow-sm border border-slate-200' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* --- ERROR BANNER --- */}
        {errorMessage && (
          <div className="mx-6 mt-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-rose-700"><FaTimes /></button>
          </div>
        )}

        {/* --- TAB CONTENT BODY --- */}
        <form id="view-doctor-form" onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-slate-50/30">
          
          {/* TAB 1: IDENTITY & REGISTRATION */}
          {activeTab === 'overview' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#3D3F96]">
                  Doctor Identity & Registration Credentials
                </h4>
                {isEditing && <span className="text-[10px] font-bold uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">Edit Mode</span>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Full Name</label>
                  {isEditing ? (
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-white" />
                  ) : (
                    <p className="text-xs font-bold text-slate-800 py-1.5">{formData.name}</p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Primary Phone</label>
                  {isEditing ? (
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-white" />
                  ) : (
                    <p className="text-xs font-bold text-slate-800 py-1.5 flex items-center gap-1.5"><FaPhone className="text-slate-400" /> {formData.phone}</p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Email Address</label>
                  {isEditing ? (
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-white" />
                  ) : (
                    <p className="text-xs font-bold text-slate-800 py-1.5">{formData.email || 'N/A'}</p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Specialization</label>
                  {isEditing ? (
                    <input type="text" name="specialist" value={formData.specialist} onChange={handleInputChange} required className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-white" />
                  ) : (
                    <p className="text-xs font-bold text-slate-800 py-1.5">{formData.specialist || 'General Medicine'}</p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Experience (Years)</label>
                  {isEditing ? (
                    <input type="number" name="experience" value={formData.experience} onChange={handleInputChange} min="0" className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-white" />
                  ) : (
                    <p className="text-xs font-bold text-slate-800 py-1.5 flex items-center gap-1.5"><FaAward className="text-amber-500" /> {formData.experience} Years</p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Duty Status</label>
                  {isEditing ? (
                    <select name="dutyStatus" value={formData.dutyStatus} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-white">
                      <option value="On Duty">On Duty</option>
                      <option value="Off Duty">Off Duty</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Busy">Busy</option>
                    </select>
                  ) : (
                    <span className={`inline-block mt-1 px-3 py-1 rounded-lg text-xs font-bold ${
                      formData.dutyStatus === 'On Duty' ? 'bg-emerald-50 text-emerald-600' :
                      formData.dutyStatus === 'Busy' ? 'bg-rose-50 text-rose-600' :
                      formData.dutyStatus === 'On Leave' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {formData.dutyStatus}
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">License Number</label>
                  {isEditing ? (
                    <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-white" />
                  ) : (
                    <p className="text-xs font-bold text-slate-800 py-1.5">{formData.licenseNumber || 'N/A'}</p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">State Council Name</label>
                  {isEditing ? (
                    <input type="text" name="councilName" value={formData.councilName} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-white" />
                  ) : (
                    <p className="text-xs font-bold text-slate-800 py-1.5">{formData.councilName || 'Not Specified'}</p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Council Registration No.</label>
                  {isEditing ? (
                    <input type="text" name="councilNumber" value={formData.councilNumber} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-white" />
                  ) : (
                    <p className="text-xs font-bold text-slate-800 py-1.5">{formData.councilNumber || 'N/A'}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 3-WAY CONSULTATION FEES */}
          {activeTab === 'fees' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#3D3F96] border-b border-slate-100 pb-3">
                3-Way Consultation Channels & Pricing
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Clinic OPD */}
                <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#3D3F96] flex items-center gap-1.5">
                      <FaClinicMedical /> Physical Clinic OPD
                    </span>
                    {isEditing ? (
                      <input 
                        type="checkbox" 
                        name="isClinicAvailable"
                        checked={formData.isClinicAvailable}
                        onChange={handleInputChange}
                        className="rounded text-[#3D3F96]"
                      />
                    ) : (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${formData.isClinicAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                        {formData.isClinicAvailable ? 'Enabled' : 'Disabled'}
                      </span>
                    )}
                  </div>
                  {isEditing ? (
                    <input 
                      type="number" 
                      name="clinicFee"
                      value={formData.clinicFee}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs font-bold rounded-xl border bg-white"
                    />
                  ) : (
                    <p className="text-xl font-black text-slate-800">₹{formData.clinicFee}</p>
                  )}
                </div>

                {/* Video / Online */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <FaVideo className="text-indigo-600" /> Video Consultation
                    </span>
                    {isEditing ? (
                      <input 
                        type="checkbox" 
                        name="isOnlineAvailable"
                        checked={formData.isOnlineAvailable}
                        onChange={handleInputChange}
                        className="rounded text-indigo-600"
                      />
                    ) : (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${formData.isOnlineAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                        {formData.isOnlineAvailable ? 'Enabled' : 'Disabled'}
                      </span>
                    )}
                  </div>
                  {isEditing ? (
                    <input 
                      type="number" 
                      name="onlineFee"
                      value={formData.onlineFee}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs font-bold rounded-xl border bg-white"
                    />
                  ) : (
                    <p className="text-xl font-black text-slate-800">₹{formData.onlineFee}</p>
                  )}
                </div>

                {/* Home Visit */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <FaHome className="text-emerald-600" /> Home Visit Consult
                    </span>
                    {isEditing ? (
                      <input 
                        type="checkbox" 
                        name="isHomeAvailable"
                        checked={formData.isHomeAvailable}
                        onChange={handleInputChange}
                        className="rounded text-emerald-600"
                      />
                    ) : (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${formData.isHomeAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                        {formData.isHomeAvailable ? 'Enabled' : 'Disabled'}
                      </span>
                    )}
                  </div>
                  {isEditing ? (
                    <input 
                      type="number" 
                      name="homeFee"
                      value={formData.homeFee}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs font-bold rounded-xl border bg-white"
                    />
                  ) : (
                    <p className="text-xl font-black text-slate-800">₹{formData.homeFee}</p>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: QUALIFICATIONS & COUNCIL */}
          {activeTab === 'qualifications' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#3D3F96]">
                  Educational Qualifications & Council Credentials
                </h4>
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleAddQualification}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 text-[#3D3F96] text-xs font-bold hover:bg-indigo-100"
                  >
                    <FaPlus size={10} /> Add Degree
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {qualifications.map((item, index) => (
                  <div key={item.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Degree Qualification #{index + 1}</span>
                      {isEditing && qualifications.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => handleRemoveQualification(item.id)}
                          className="text-xs text-rose-500 font-bold hover:text-rose-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Degree Name</label>
                        {isEditing ? (
                          <input type="text" value={item.degree} onChange={(e) => handleQualificationChange(item.id, 'degree', e.target.value)} required className="w-full px-3 py-2 text-xs font-bold rounded-lg border bg-white" />
                        ) : (
                          <p className="text-xs font-bold text-slate-800">{item.degree || 'MBBS'}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">College / Institute</label>
                        {isEditing ? (
                          <input type="text" value={item.college} onChange={(e) => handleQualificationChange(item.id, 'college', e.target.value)} className="w-full px-3 py-2 text-xs font-bold rounded-lg border bg-white" />
                        ) : (
                          <p className="text-xs font-bold text-slate-800">{item.college || 'N/A'}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Passing Year</label>
                        {isEditing ? (
                          <input type="number" value={item.year} onChange={(e) => handleQualificationChange(item.id, 'year', e.target.value)} className="w-full px-3 py-2 text-xs font-bold rounded-lg border bg-white" />
                        ) : (
                          <p className="text-xs font-bold text-slate-800">{item.year || 'N/A'}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Medical Council</label>
                        {isEditing ? (
                          <input type="text" value={item.councilName} onChange={(e) => handleQualificationChange(item.id, 'councilName', e.target.value)} className="w-full px-3 py-2 text-xs font-bold rounded-lg border bg-white" />
                        ) : (
                          <p className="text-xs font-bold text-slate-800">{item.councilName || 'N/A'}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Registration No.</label>
                        {isEditing ? (
                          <input type="text" value={item.registrationNo} onChange={(e) => handleQualificationChange(item.id, 'registrationNo', e.target.value)} className="w-full px-3 py-2 text-xs font-bold rounded-lg border bg-white" />
                        ) : (
                          <p className="text-xs font-bold text-slate-800">{item.registrationNo || 'N/A'}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">State</label>
                        {isEditing ? (
                          <input type="text" value={item.stateName} onChange={(e) => handleQualificationChange(item.id, 'stateName', e.target.value)} className="w-full px-3 py-2 text-xs font-bold rounded-lg border bg-white" />
                        ) : (
                          <p className="text-xs font-bold text-slate-800">{item.stateName || 'N/A'}</p>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      {item.certPreview ? (
                        <a href={getImageUrl(item.certPreview)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-[#3D3F96] font-bold hover:underline">
                          <FaExternalLinkAlt size={10} /> View Certificate Attachment
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">No certificate attached</span>
                      )}

                      {isEditing && (
                        <label className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center gap-1">
                          <FaCloudUploadAlt /> {item.certFile ? item.certFile.name : "Replace Certificate"}
                          <input type="file" accept="image/*,.pdf" onChange={(e) => handleDegreeCertChange(item.id, e)} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DOCUMENTS & SIGNATURE */}
          {activeTab === 'documents' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#3D3F96] border-b border-slate-100 pb-3">
                Verification Documents & Digital Signature
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Profile Picture */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <span className="text-xs font-bold text-slate-700 block">Doctor Profile Photo</span>
                  <div className="flex items-center gap-3">
                    <img 
                      src={mediaPreviews.profileImage} 
                      alt="Profile" 
                      className="w-16 h-16 rounded-xl object-cover border" 
                    />
                    <div className="flex-1 min-w-0">
                      <a href={mediaPreviews.profileImage} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#3D3F96] hover:underline flex items-center gap-1">
                        <FaExternalLinkAlt size={10} /> Open Full Picture
                      </a>
                      {isEditing && (
                        <label className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer">
                          <FaCloudUploadAlt /> Replace Photo
                          <input type="file" accept="image/*" onChange={(e) => handleMediaReplace('profileImage', e)} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {/* Medical License */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <span className="text-xs font-bold text-slate-700 block">Medical License Document</span>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl bg-white border flex items-center justify-center text-[#3D3F96]">
                      <FaCertificate size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      {mediaPreviews.licenseCert ? (
                        <a href={mediaPreviews.licenseCert} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#3D3F96] hover:underline flex items-center gap-1">
                          <FaExternalLinkAlt size={10} /> View License PDF/Image
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">Not Uploaded</span>
                      )}
                      {isEditing && (
                        <label className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer">
                          <FaCloudUploadAlt /> Replace Document
                          <input type="file" accept="image/*,.pdf" onChange={(e) => handleMediaReplace('licenseCert', e)} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {/* Govt ID */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <span className="text-xs font-bold text-slate-700 block">Govt ID Proof (Aadhar / PAN)</span>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl bg-white border flex items-center justify-center text-[#3D3F96]">
                      <FaIdCard size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      {mediaPreviews.idProof ? (
                        <a href={mediaPreviews.idProof} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#3D3F96] hover:underline flex items-center gap-1">
                          <FaExternalLinkAlt size={10} /> View Govt ID
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">Not Uploaded</span>
                      )}
                      {isEditing && (
                        <label className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer">
                          <FaCloudUploadAlt /> Replace ID
                          <input type="file" accept="image/*,.pdf" onChange={(e) => handleMediaReplace('idProof', e)} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {/* Digital Signature */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <span className="text-xs font-bold text-slate-700 block">Digital Doctor Signature</span>
                  <div className="flex items-center gap-3">
                    {mediaPreviews.signature ? (
                      <img src={mediaPreviews.signature} alt="Signature" className="w-16 h-16 rounded-xl object-contain bg-white border p-1" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-white border flex items-center justify-center text-slate-300 text-xs">None</div>
                    )}
                    <div className="flex-1 min-w-0">
                      {mediaPreviews.signature && (
                        <a href={mediaPreviews.signature} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#3D3F96] hover:underline flex items-center gap-1">
                          <FaExternalLinkAlt size={10} /> View Signature
                        </a>
                      )}
                      {isEditing && (
                        <label className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer">
                          <FaCloudUploadAlt /> Upload Signature
                          <input type="file" accept="image/*" onChange={(e) => handleMediaReplace('signature', e)} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: ADDRESS */}
          {activeTab === 'address' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#3D3F96] border-b border-slate-100 pb-3">
                Consultation Location & Address
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-3">
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Street Address</label>
                  {isEditing ? (
                    <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-white" />
                  ) : (
                    <p className="text-xs font-bold text-slate-800">{formData.address || 'Not Provided'}</p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">City</label>
                  {isEditing ? (
                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-white" />
                  ) : (
                    <p className="text-xs font-bold text-slate-800">{formData.city || 'N/A'}</p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">State</label>
                  {isEditing ? (
                    <input type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-white" />
                  ) : (
                    <p className="text-xs font-bold text-slate-800">{formData.state || 'N/A'}</p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Pincode</label>
                  {isEditing ? (
                    <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-white" />
                  ) : (
                    <p className="text-xs font-bold text-slate-800">{formData.pincode || 'N/A'}</p>
                  )}
                </div>
              </div>
            </div>
          )}

        </form>

        {/* --- STICKY FOOTER --- */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between shrink-0">
          <div className="text-xs font-bold text-slate-400">
            Doctor ID: <span className="font-mono text-slate-700">{doctor._id}</span>
          </div>

          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="view-doctor-form"
                  disabled={saving}
                  className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-[#3D3F96] hover:bg-[#2C2E75] text-white text-xs font-bold shadow-lg shadow-indigo-950/10 transition-all disabled:opacity-60"
                >
                  {saving ? <><FaSpinner className="animate-spin" /> Saving...</> : <><FaSave /> Save Changes</>}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-[#3D3F96] hover:bg-[#2C2E75] text-white text-xs font-bold transition-all"
              >
                Close
              </button>
            )}
          </div>
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