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
  FaUniversity, 
  FaCloudUploadAlt, 
  FaPlus, 
  FaTrashAlt, 
  FaSpinner, 
  FaEye, 
  FaExternalLinkAlt,
  FaRupeeSign,
  FaClock,
  FaLock
} from 'react-icons/fa';

import ClinicAPI from '../../../../../services/ClinicAPI';

// Base backend URL from environment
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.1.7:5002';

// Helper function to build the full image URL
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
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'qualifications' | 'clinic' | 'documents' | 'banking'
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
    dutyStatus: doctor?.dutyStatus || 'On Duty',
    password: '',

    // Fees & OPD
    clinicFee: doctor?.fees?.clinic ?? 800,
    onlineFee: doctor?.fees?.online ?? 0,
    homeFee: doctor?.fees?.home ?? 0,
    slotDuration: doctor?.slotDuration || 30,

    // Address
    address: doctor?.address || '',
    city: doctor?.city || '',
    state: doctor?.state || '',
    pincode: doctor?.pincode || '',
    country: doctor?.country || 'India',
    latitude: doctor?.location?.lat || doctor?.latitude || '',
    longitude: doctor?.location?.lng || doctor?.longitude || '',

    // Bank Details
    bankName: doctor?.bankDetails?.bankName || '',
    accountHolderName: doctor?.bankDetails?.accountHolderName || '',
    accountNumber: doctor?.bankDetails?.accountNumber || '',
    ifscCode: doctor?.bankDetails?.ifscCode || '',
    upiId: doctor?.bankDetails?.upiId || '',
    accountType: doctor?.bankDetails?.accountType || 'Savings',
  });

  // Dynamic Qualifications list
  const [qualifications, setQualifications] = useState(
    Array.isArray(doctor?.qualifications) && doctor.qualifications.length > 0
      ? doctor.qualifications.map((q, idx) => ({
          id: idx + 1,
          degree: q.degree || '',
          college: q.college || '',
          year: q.year || '',
          certFile: null,
          certPreview: q.certUrl ? getImageUrl(q.certUrl) : null
        }))
      : [{ id: 1, degree: doctor?.qualification || 'MBBS', college: '', year: '', certFile: null, certPreview: null }]
  );

  // Media files replacement state
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
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Qualifications handlers
  const handleAddQualification = () => {
    setQualifications(prev => [
      ...prev,
      { id: Date.now(), degree: '', college: '', year: '', certFile: null, certPreview: null }
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

  // Media file replace handlers
  const handleMediaReplace = (field, e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewFiles(prev => ({ ...prev, [field]: file }));
      setMediaPreviews(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
    }
  };

  // --- SAVE UPDATES ---
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);

    try {
      const payload = new FormData();

      payload.append('name', formData.name);
      payload.append('phone', formData.phone);
      payload.append('email', formData.email);
      payload.append('altPhone', formData.altPhone);
      payload.append('gender', formData.gender);
      payload.append('specialist', formData.specialist);
      payload.append('experience', Number(formData.experience));
      payload.append('licenseNumber', formData.licenseNumber);
      payload.append('councilName', formData.councilName);
      payload.append('consultationFee', Number(formData.clinicFee));

      // Address
      payload.append('address', formData.address);
      payload.append('city', formData.city);
      payload.append('state', formData.state);
      payload.append('pincode', formData.pincode);
      if (formData.latitude) payload.append('latitude', Number(formData.latitude));
      if (formData.longitude) payload.append('longitude', Number(formData.longitude));

      // Optional Password
      if (formData.password) payload.append('password', formData.password);

      // JSON Qualifications
      const sanitizedQualifications = qualifications
        .filter(q => q.degree.trim() !== '')
        .map(q => ({ degree: q.degree, college: q.college, year: q.year }));
      payload.append('qualifications', JSON.stringify(sanitizedQualifications));

      // Replaced files
      if (newFiles.profileImage) payload.append('profileImage', newFiles.profileImage);
      if (newFiles.licenseCert) payload.append('licenseCert', newFiles.licenseCert);
      if (newFiles.idProof) payload.append('idProof', newFiles.idProof);
      if (newFiles.signature) payload.append('signature', newFiles.signature);

      // Multi-file Degree certs
      qualifications.forEach(q => {
        if (q.certFile) payload.append('degreeCertificates', q.certFile);
      });

      const response = await ClinicAPI.updateClinicDoctor(doctor._id, payload);

      if (response?.success) {
        // Also update duty status if changed
        if (formData.dutyStatus !== doctor.dutyStatus) {
          await ClinicAPI.toggleDoctorDutyStatus(doctor._id, { dutyStatus: formData.dutyStatus });
        }

        onDoctorUpdated(response.data);
        setIsEditing(false);
      } else {
        setErrorMessage(response?.message || "Failed to update doctor profile.");
      }
    } catch (err) {
      console.error("Save doctor details error:", err);
      setErrorMessage(err.response?.data?.message || err.message || "Failed to save updates.");
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
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300';
                }}
                className="w-12 h-12 rounded-2xl object-cover border border-slate-100 shadow-sm"
              />
              <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                formData.dutyStatus === 'On Duty' ? 'bg-emerald-500' :
                formData.dutyStatus === 'Busy' ? 'bg-rose-500' :
                formData.dutyStatus === 'On Leave' ? 'bg-amber-500' : 'bg-slate-400'
              }`} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 leading-tight">Dr. {formData.name}</h3>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-indigo-50 text-[#3D3F96]">
                  {formData.specialist || 'General Medicine'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                License: {formData.licenseNumber || 'N/A'} • {formData.councilName || 'Medical Board'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Edit / View Button */}
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isEditing 
                  ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100' 
                  : 'bg-indigo-50 text-[#3D3F96] border border-indigo-100 hover:bg-indigo-100'
              }`}
            >
              {isEditing ? (
                <>
                  <FaEye size={12} /> Exit Edit Mode
                </>
              ) : (
                <>
                  <FaPencilAlt size={12} /> Edit Details
                </>
              )}
            </button>

            {/* Close Button */}
            <button 
              type="button" 
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all"
            >
              <FaTimes size={14} />
            </button>
          </div>
        </div>

        {/* --- NAVIGATION TABS --- */}
        <div className="px-6 bg-slate-50/80 border-b border-slate-100 flex gap-2 overflow-x-auto shrink-0 py-2">
          {[
            { key: 'overview', label: 'Overview & Personal' },
            { key: 'qualifications', label: 'Degrees & Education' },
            { key: 'clinic', label: 'Fees & Address' },
            { key: 'documents', label: 'Documents & Signatures' },
            { key: 'banking', label: 'Bank Details & Role' },
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.key 
                  ? 'bg-white text-[#3D3F96] shadow-sm border border-slate-200/80' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
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

        {/* --- TAB CONTENT CONTAINER --- */}
        <form id="view-doctor-form" onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-slate-50/30">
          
          {/* TAB 1: OVERVIEW & PERSONAL */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#3D3F96] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#3D3F96]"></span> Practitioner Identity & Contact
                  </h4>
                  {isEditing && <span className="text-[10px] font-bold uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">Editing Active</span>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Doctor Name</label>
                    {isEditing ? (
                      <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-white" />
                    ) : (
                      <p className="text-xs font-bold text-slate-800 py-2">{formData.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Primary Phone</label>
                    {isEditing ? (
                      <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-white" />
                    ) : (
                      <p className="text-xs font-bold text-slate-800 py-2 flex items-center gap-1.5"><FaPhone className="text-slate-400" /> {formData.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Email Address</label>
                    {isEditing ? (
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-white" />
                    ) : (
                      <p className="text-xs font-bold text-slate-800 py-2 flex items-center gap-1.5"><FaEnvelope className="text-slate-400" /> {formData.email || 'N/A'}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Alternate Phone</label>
                    {isEditing ? (
                      <input type="tel" name="altPhone" value={formData.altPhone} onChange={handleInputChange} className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-white" />
                    ) : (
                      <p className="text-xs font-bold text-slate-800 py-2">{formData.altPhone || 'None'}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Gender</label>
                    {isEditing ? (
                      <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-white">
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      <p className="text-xs font-bold text-slate-800 py-2">{formData.gender}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Duty Status</label>
                    {isEditing ? (
                      <select name="dutyStatus" value={formData.dutyStatus} onChange={handleInputChange} className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-white">
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
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Primary Specialization</label>
                    {isEditing ? (
                      <input type="text" name="specialist" value={formData.specialist} onChange={handleInputChange} required className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-white" />
                    ) : (
                      <p className="text-xs font-bold text-slate-800 py-2">{formData.specialist || 'General Medicine'}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Years of Experience</label>
                    {isEditing ? (
                      <input type="number" name="experience" value={formData.experience} onChange={handleInputChange} min="0" className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-white" />
                    ) : (
                      <p className="text-xs font-bold text-slate-800 py-2 flex items-center gap-1.5"><FaAward className="text-amber-500" /> {formData.experience} Years</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">License Number</label>
                    {isEditing ? (
                      <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleInputChange} required className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-white" />
                    ) : (
                      <p className="text-xs font-bold text-slate-800 py-2 flex items-center gap-1.5"><FaIdCard className="text-[#3D3F96]" /> {formData.licenseNumber || 'N/A'}</p>
                    )}
                  </div>

                  <div className="sm:col-span-3">
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">State Medical Council Name</label>
                    {isEditing ? (
                      <input type="text" name="councilName" value={formData.councilName} onChange={handleInputChange} className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-white" />
                    ) : (
                      <p className="text-xs font-bold text-slate-800 py-2">{formData.councilName || 'Not Specified'}</p>
                    )}
                  </div>

                  {isEditing && (
                    <div className="sm:col-span-3 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                      <label className="text-[11px] font-bold text-[#3D3F96] block mb-1 flex items-center gap-1.5">
                        <FaLock /> Reset Doctor Password (Optional)
                      </label>
                      <input 
                        type="password" 
                        name="password" 
                        placeholder="Leave blank to keep current password" 
                        value={formData.password} 
                        onChange={handleInputChange} 
                        className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white" 
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DEGREES & EDUCATION */}
          {activeTab === 'qualifications' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#3D3F96] flex items-center gap-2">
                  <FaCertificate /> Educational Qualifications & Certificates
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
                      <span className="text-xs font-bold text-slate-700">Degree #{index + 1}</span>
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
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Degree Title</label>
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
                          <p className="text-xs font-bold text-slate-800">{item.college || 'Medical College'}</p>
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
                    </div>

                    {/* Certificate Preview / Upload */}
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      {item.certPreview ? (
                        <a href={getImageUrl(item.certPreview)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-[#3D3F96] font-bold hover:underline">
                          <FaExternalLinkAlt size={10} /> View Certificate Document
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">No certificate file uploaded</span>
                      )}

                      {isEditing && (
                        <label className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center gap-1">
                          <FaCloudUploadAlt /> {item.certFile ? item.certFile.name : "Upload / Replace Certificate"}
                          <input type="file" accept="image/*,.pdf" onChange={(e) => handleDegreeCertChange(item.id, e)} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: FEES, CLINIC & ADDRESS */}
          {activeTab === 'clinic' && (
            <div className="space-y-5">
              {/* Consultation Fees Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#3D3F96] flex items-center gap-2 border-b border-slate-100 pb-3">
                  <FaRupeeSign /> Consultation Pricing & Duration
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Clinic OPD Fee (₹)</label>
                    {isEditing ? (
                      <input type="number" name="clinicFee" value={formData.clinicFee} onChange={handleInputChange} required className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-emerald-700" />
                    ) : (
                      <p className="text-base font-black text-emerald-600">₹{formData.clinicFee}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Online Audio/Video Fee (₹)</label>
                    {isEditing ? (
                      <input type="number" name="onlineFee" value={formData.onlineFee} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white" />
                    ) : (
                      <p className="text-base font-bold text-slate-700">₹{formData.onlineFee}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Home Visit Fee (₹)</label>
                    {isEditing ? (
                      <input type="number" name="homeFee" value={formData.homeFee} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white" />
                    ) : (
                      <p className="text-base font-bold text-slate-700">₹{formData.homeFee}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Slot Duration (Min)</label>
                    {isEditing ? (
                      <input type="number" name="slotDuration" value={formData.slotDuration} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white" />
                    ) : (
                      <p className="text-base font-bold text-slate-700 flex items-center gap-1"><FaClock className="text-slate-400 text-sm" /> {formData.slotDuration} mins</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Consultation Address Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#3D3F96] flex items-center gap-2 border-b border-slate-100 pb-3">
                  <FaMapMarkerAlt /> Physical Clinic Consultation Address
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-3">
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Full Street Address</label>
                    {isEditing ? (
                      <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white" />
                    ) : (
                      <p className="text-xs font-bold text-slate-800">{formData.address || 'Address not listed'}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">City</label>
                    {isEditing ? (
                      <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white" />
                    ) : (
                      <p className="text-xs font-bold text-slate-800">{formData.city || 'N/A'}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">State</label>
                    {isEditing ? (
                      <input type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white" />
                    ) : (
                      <p className="text-xs font-bold text-slate-800">{formData.state || 'N/A'}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Pincode</label>
                    {isEditing ? (
                      <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white" />
                    ) : (
                      <p className="text-xs font-bold text-slate-800">{formData.pincode || 'N/A'}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Latitude</label>
                    {isEditing ? (
                      <input type="text" name="latitude" value={formData.latitude} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white" />
                    ) : (
                      <p className="text-xs font-bold text-slate-600">{formData.latitude || '28.5244'}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Longitude</label>
                    {isEditing ? (
                      <input type="text" name="longitude" value={formData.longitude} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white" />
                    ) : (
                      <p className="text-xs font-bold text-slate-600">{formData.longitude || '77.2167'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DOCUMENTS & SIGNATURES */}
          {activeTab === 'documents' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#3D3F96] flex items-center gap-2 border-b border-slate-100 pb-3">
                <FaCloudUploadAlt /> Verification Documents & Signature
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Profile Image */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <span className="text-xs font-bold text-slate-700 block">Doctor Profile Picture</span>
                  <div className="flex items-center gap-3">
                    <img 
                      src={mediaPreviews.profileImage} 
                      alt="Profile" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300';
                      }}
                      className="w-16 h-16 rounded-xl object-cover border" 
                    />
                    <div className="flex-1 min-w-0">
                      <a href={mediaPreviews.profileImage} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#3D3F96] hover:underline flex items-center gap-1">
                        <FaExternalLinkAlt size={10} /> View Full Photo
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
                  <span className="text-xs font-bold text-slate-700 block">Medical License Certificate</span>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl bg-white border flex items-center justify-center text-[#3D3F96]">
                      <FaCertificate size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      {mediaPreviews.licenseCert ? (
                        <a href={mediaPreviews.licenseCert} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#3D3F96] hover:underline flex items-center gap-1">
                          <FaExternalLinkAlt size={10} /> View License Document
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">Not Uploaded</span>
                      )}
                      {isEditing && (
                        <label className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer">
                          <FaCloudUploadAlt /> Replace License
                          <input type="file" accept="image/*,.pdf" onChange={(e) => handleMediaReplace('licenseCert', e)} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {/* Govt ID Proof */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <span className="text-xs font-bold text-slate-700 block">Government ID Proof</span>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl bg-white border flex items-center justify-center text-[#3D3F96]">
                      <FaIdCard size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      {mediaPreviews.idProof ? (
                        <a href={mediaPreviews.idProof} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#3D3F96] hover:underline flex items-center gap-1">
                          <FaExternalLinkAlt size={10} /> View ID Document
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
                      <img 
                        src={mediaPreviews.signature} 
                        alt="Signature" 
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                        className="w-16 h-16 rounded-xl object-contain bg-white border p-1" 
                      />
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

          {/* TAB 5: BANKING & ACCOUNT */}
          {activeTab === 'banking' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#3D3F96] flex items-center gap-2 border-b border-slate-100 pb-3">
                <FaUniversity /> Bank Account & Clinic Registry Status
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Bank Name</label>
                  {isEditing ? (
                    <input type="text" name="bankName" value={formData.bankName} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white" />
                  ) : (
                    <p className="text-xs font-bold text-slate-800">{formData.bankName || 'Not Linked'}</p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Account Holder Name</label>
                  {isEditing ? (
                    <input type="text" name="accountHolderName" value={formData.accountHolderName} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white" />
                  ) : (
                    <p className="text-xs font-bold text-slate-800">{formData.accountHolderName || 'N/A'}</p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Account Number</label>
                  {isEditing ? (
                    <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white" />
                  ) : (
                    <p className="text-xs font-bold text-slate-800">{formData.accountNumber || '•••• •••• ••••'}</p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">IFSC Code</label>
                  {isEditing ? (
                    <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white" />
                  ) : (
                    <p className="text-xs font-bold text-slate-800">{formData.ifscCode || 'N/A'}</p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">UPI ID</label>
                  {isEditing ? (
                    <input type="text" name="upiId" value={formData.upiId} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white" />
                  ) : (
                    <p className="text-xs font-bold text-slate-800">{formData.upiId || 'N/A'}</p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Account Type</label>
                  {isEditing ? (
                    <select name="accountType" value={formData.accountType} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white">
                      <option value="Savings">Savings</option>
                      <option value="Current">Current</option>
                    </select>
                  ) : (
                    <p className="text-xs font-bold text-slate-800">{formData.accountType}</p>
                  )}
                </div>
              </div>
            </div>
          )}

        </form>

        {/* --- STICKY FOOTER --- */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between shrink-0">
          <div className="text-xs font-bold text-slate-400">
            Doctor Database ID: <span className="font-mono text-slate-700">{doctor._id}</span>
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
                  {saving ? <><FaSpinner className="animate-spin" /> Saving Changes...</> : <><FaSave /> Save Changes</>}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-[#3D3F96] hover:bg-[#2C2E75] text-white text-xs font-bold transition-all"
              >
                Done
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