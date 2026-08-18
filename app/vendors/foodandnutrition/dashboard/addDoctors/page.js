"use client";

import React, { useState, useEffect } from 'react';
import { 
  FaUserMd, 
  FaGraduationCap, 
  FaCloudUploadAlt, 
  FaPlus, 
  FaTrashAlt, 
  FaCheckCircle, 
  FaTimes, 
  FaAward, 
  FaIdCard, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaRupeeSign,
  FaFileAlt
} from 'react-icons/fa';

export default function AddDoctorPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- BASIC FORM STATE ---
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    altPhone: '',
    gender: 'Male',
    consultationFee: '',
    specialist: '',
    experience: '',
    licenseNumber: '',
    councilName: '',
    clinicName: 'Diabetic 11',
    address: '',
    city: '',
    state: '',
    pincode: '',
    latitude: '28.7041',
    longitude: '77.1025'
  });

  // --- DYNAMIC MULTIPLE EDUCATION QUALIFICATIONS STATE ---
  const [qualifications, setQualifications] = useState([
    { id: 1, degree: 'MBBS', college: '', year: '', certFile: null, certPreview: null }
  ]);

  // --- MEDIA FILES & PREVIEWS STATE ---
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

  const [notification, setNotification] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = (text, type = "success") => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- MULTIPLE QUALIFICATION HANDLERS ---
  const handleAddQualification = () => {
    setQualifications([
      ...qualifications,
      { id: Date.now(), degree: '', college: '', year: '', certFile: null, certPreview: null }
    ]);
  };

  const handleRemoveQualification = (id) => {
    if (qualifications.length === 1) {
      alert("At least one educational degree is required.");
      return;
    }
    setQualifications(qualifications.filter(q => q.id !== id));
  };

  const handleQualificationChange = (id, field, value) => {
    setQualifications(qualifications.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const handleQualificationCertChange = (id, e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setQualifications(qualifications.map(q => 
        q.id === id 
          ? { ...q, certFile: file, certPreview: URL.createObjectURL(file) } 
          : q
      ));
    }
  };

  const handleRemoveQualificationCert = (id) => {
    setQualifications(qualifications.map(q => 
      q.id === id ? { ...q, certFile: null, certPreview: null } : q
    ));
  };

  // --- GENERAL MEDIA FILE HANDLERS ---
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

  // --- SUBMIT HANDLER ---
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      showToast(`Dr. ${formData.name || 'New Doctor'} registered successfully!`);
      
      // Reset form
      setFormData({
        name: '', email: '', phone: '', altPhone: '', gender: 'Male', consultationFee: '',
        specialist: '', experience: '', licenseNumber: '', councilName: '', clinicName: 'Diabetic 11',
        address: '', city: '', state: '', pincode: '', latitude: '28.7041', longitude: '77.1025'
      });
      setQualifications([{ id: Date.now(), degree: '', college: '', year: '', certFile: null, certPreview: null }]);
      setPreviews({ profileImage: null, licenseCert: null, idProof: null, signature: null });
    }, 1000);
  };

  if (!mounted) return null;

  // REUSABLE MEDIA UPLOAD BOX
  const LargeMediaBox = ({ label, field, accept = "image/*,.pdf" }) => {
    const prev = previews[field];
    return (
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
        <label className="text-xs font-black text-gray-800 block uppercase tracking-wider">{label}</label>
        
        {prev ? (
          <div className="relative rounded-xl overflow-hidden border border-indigo-200 bg-white p-2">
            <img src={prev.url} alt={label} className="w-full h-32 object-cover rounded-lg" />
            <div className="mt-2 flex items-center justify-between px-1">
              <span className="text-[10px] font-bold text-gray-600 truncate max-w-[140px]">{prev.name}</span>
              <button 
                type="button" 
                onClick={() => handleRemoveMedia(field)}
                className="p-1.5 rounded-lg bg-rose-50 text-rose-600 text-xs font-bold hover:bg-rose-100 transition-all"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full py-6 px-4 rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#3D3F96] bg-white hover:bg-indigo-50/20 cursor-pointer transition-all text-center">
            <FaCloudUploadAlt className="text-3xl text-[#3D3F96] mb-1.5" />
            <span className="text-xs font-black text-[#3D3F96]">Upload {label}</span>
            <span className="text-[9px] font-semibold text-gray-400 mt-0.5">Click to browse file</span>
            <input 
              type="file" 
              accept={accept} 
              onChange={(e) => handleMediaChange(field, e)} 
              className="hidden" 
            />
          </label>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 space-y-8 select-none animate-fadeIn">
      
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>

      {/* Dynamic Toast Alert */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-2xl shadow-2xl text-xs font-black uppercase tracking-wider text-white border border-white/20 animate-fadeIn ${
          notification.type === 'danger' ? 'bg-rose-600' : 'bg-[#3D3F96]'
        }`}>
          {notification.text}
        </div>
      )}

      {/* Header Container */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-800">Register New Clinic Doctor</h2>
          <p className="text-xs text-gray-400 mt-1">Complete professional onboarding directory form with degree certifications.</p>
        </div>

        <span className="px-4 py-2 rounded-2xl text-xs font-black bg-[#3D3F96]/10 text-[#3D3F96] border border-[#3D3F96]/10 self-start sm:self-auto">
          Clinic: {formData.clinicName}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* --- SECTION 1: BASIC & CONTACT INFORMATION (3 COLUMNS GRID) --- */}
        <div className="bg-white rounded-[2rem] border border-gray-100 p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#3D3F96] flex items-center justify-center text-lg">
              <FaUserMd />
            </div>
            <div>
              <h4 className="text-base font-black text-gray-800">1. Basic & Personal Details</h4>
              <span className="text-[10px] text-gray-400 font-bold block mt-0.5">Doctor identity and contact information</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Full Name *</label>
              <input 
                type="text" 
                name="name" 
                placeholder="e.g. Dr. Alok Sharma"
                value={formData.name} 
                onChange={handleInputChange} 
                required 
                className="w-full px-4 py-3 rounded-xl border border-gray-200/80 bg-slate-50/50 focus:bg-white text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-[#3D3F96]/20 focus:border-[#3D3F96] transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Email Address *</label>
              <input 
                type="email" 
                name="email" 
                placeholder="dr.sharma@yopmail.com"
                value={formData.email} 
                onChange={handleInputChange} 
                required 
                className="w-full px-4 py-3 rounded-xl border border-gray-200/80 bg-slate-50/50 focus:bg-white text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-[#3D3F96]/20 focus:border-[#3D3F96] transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Phone Number *</label>
              <input 
                type="tel" 
                name="phone" 
                placeholder="+91 9876543210"
                value={formData.phone} 
                onChange={handleInputChange} 
                required 
                className="w-full px-4 py-3 rounded-xl border border-gray-200/80 bg-slate-50/50 focus:bg-white text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-[#3D3F96]/20 focus:border-[#3D3F96] transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Alternate Phone</label>
              <input 
                type="tel" 
                name="altPhone" 
                placeholder="+91 9123456789"
                value={formData.altPhone} 
                onChange={handleInputChange} 
                className="w-full px-4 py-3 rounded-xl border border-gray-200/80 bg-slate-50/50 focus:bg-white text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-[#3D3F96]/20 focus:border-[#3D3F96] transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Gender</label>
              <select 
                name="gender" 
                value={formData.gender} 
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200/80 bg-slate-50/50 focus:bg-white text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-[#3D3F96]/20 focus:border-[#3D3F96] transition-all"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Consultation Fee (₹) *</label>
              <input 
                type="number" 
                name="consultationFee" 
                placeholder="e.g. 800"
                value={formData.consultationFee} 
                onChange={handleInputChange} 
                required 
                className="w-full px-4 py-3 rounded-xl border border-gray-200/80 bg-slate-50/50 focus:bg-white text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-[#3D3F96]/20 focus:border-[#3D3F96] transition-all"
              />
            </div>

          </div>
        </div>

        {/* --- SECTION 2: PROFESSIONAL REGISTRATION DETAILS (2-3 COLUMNS GRID) --- */}
        <div className="bg-white rounded-[2rem] border border-gray-100 p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#3D3F96] flex items-center justify-center text-lg">
              <FaAward />
            </div>
            <div>
              <h4 className="text-base font-black text-gray-800">2. Medical Specialization & Council Registration</h4>
              <span className="text-[10px] text-gray-400 font-bold block mt-0.5">Primary medical specialization & license details</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Primary Specialization *</label>
              <input 
                type="text" 
                name="specialist" 
                placeholder="e.g. Endocrinology / Diabetology"
                value={formData.specialist} 
                onChange={handleInputChange} 
                required 
                className="w-full px-4 py-3 rounded-xl border border-gray-200/80 bg-slate-50/50 focus:bg-white text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-[#3D3F96]/20 focus:border-[#3D3F96] transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Experience (Years) *</label>
              <input 
                type="number" 
                name="experience" 
                placeholder="e.g. 12"
                value={formData.experience} 
                onChange={handleInputChange} 
                min="0"
                required 
                className="w-full px-4 py-3 rounded-xl border border-gray-200/80 bg-slate-50/50 focus:bg-white text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-[#3D3F96]/20 focus:border-[#3D3F96] transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Medical License / Reg Number *</label>
              <input 
                type="text" 
                name="licenseNumber" 
                placeholder="e.g. MCI-48209"
                value={formData.licenseNumber} 
                onChange={handleInputChange} 
                required 
                className="w-full px-4 py-3 rounded-xl border border-gray-200/80 bg-slate-50/50 focus:bg-white text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-[#3D3F96]/20 focus:border-[#3D3F96] transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Medical Council Name / State Board</label>
              <input 
                type="text" 
                name="councilName" 
                placeholder="e.g. Delhi Medical Council / Medical Council of India"
                value={formData.councilName} 
                onChange={handleInputChange} 
                className="w-full px-4 py-3 rounded-xl border border-gray-200/80 bg-slate-50/50 focus:bg-white text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-[#3D3F96]/20 focus:border-[#3D3F96] transition-all"
              />
            </div>

          </div>
        </div>

        {/* --- SECTION 3: DYNAMIC MULTIPLE EDUCATION QUALIFICATIONS (SPECIAL FEATURE) --- */}
        <div className="bg-white rounded-[2rem] border border-gray-100 p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#3D3F96] flex items-center justify-center text-lg">
                <FaGraduationCap />
              </div>
              <div>
                <h4 className="text-base font-black text-gray-800">3. Educational Qualifications & Degree Certificates</h4>
                <span className="text-[10px] text-gray-400 font-bold block mt-0.5">Add multiple degrees (MBBS, MD, DM, Fellowships) with certificate photo uploads</span>
              </div>
            </div>

            {/* Add Degree Button */}
            <button 
              type="button" 
              onClick={handleAddQualification}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3D3F96] hover:bg-[#2C2E75] text-white text-xs font-black uppercase tracking-wider transition-all shadow-md"
            >
              <FaPlus size={11} /> Add Another Degree
            </button>
          </div>

          {/* Dynamic Qualifications List */}
          <div className="space-y-6">
            {qualifications.map((item, index) => (
              <div key={item.id} className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/60 relative space-y-4">
                
                <div className="flex items-center justify-between border-b border-gray-200/50 pb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-[#3D3F96]">
                    Degree Qualification #{index + 1}
                  </span>

                  {qualifications.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => handleRemoveQualification(item.id)}
                      className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100 transition-all"
                    >
                      <FaTrashAlt size={11} /> Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Degree Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-400">Degree Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. MBBS, MD, DM, Fellowship"
                      value={item.degree}
                      onChange={(e) => handleQualificationChange(item.id, 'degree', e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-[#3D3F96]/20 transition-all"
                    />
                  </div>

                  {/* University / Institute */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-400">College / Institute *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. AIIMS New Delhi"
                      value={item.college}
                      onChange={(e) => handleQualificationChange(item.id, 'college', e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-[#3D3F96]/20 transition-all"
                    />
                  </div>

                  {/* Completion Year */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-400">Passing Year *</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 2015"
                      value={item.year}
                      onChange={(e) => handleQualificationChange(item.id, 'year', e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-[#3D3F96]/20 transition-all"
                    />
                  </div>

                </div>

                {/* Degree Certificate Upload Box with Live Image Preview */}
                <div className="pt-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 block mb-1.5">
                    Upload Degree Certificate Photo ({item.degree || 'Certificate'})
                  </label>

                  {item.certPreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-indigo-200 bg-white p-2 max-w-sm">
                      <img src={item.certPreview} alt="Degree Certificate" className="w-full h-32 object-cover rounded-lg" />
                      <div className="mt-2 flex items-center justify-between px-1">
                        <span className="text-[10px] font-bold text-gray-700 truncate max-w-[200px]">
                          {item.certFile?.name || 'Certificate Uploaded'}
                        </span>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveQualificationCert(item.id)}
                          className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-600 text-[10px] font-bold"
                        >
                          Remove Photo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#3D3F96] bg-white cursor-pointer transition-all max-w-md">
                      <FaCloudUploadAlt className="text-xl text-[#3D3F96] shrink-0" />
                      <div>
                        <span className="text-xs font-black text-[#3D3F96] block">Choose Certificate Photo</span>
                        <span className="text-[9px] text-gray-400 font-bold block">JPG, PNG, PDF supported</span>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*,.pdf" 
                        onChange={(e) => handleQualificationCertChange(item.id, e)} 
                        className="hidden" 
                      />
                    </label>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* --- SECTION 4: LOCATION ADDRESS (3 COLUMNS GRID) --- */}
        <div className="bg-white rounded-[2rem] border border-gray-100 p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#3D3F96] flex items-center justify-center text-lg">
              <FaMapMarkerAlt />
            </div>
            <div>
              <h4 className="text-base font-black text-gray-800">4. Clinic Location Address</h4>
              <span className="text-[10px] text-gray-400 font-bold block mt-0.5">Physical consultation location & GPS coordinates</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Complete Address *</label>
              <input 
                type="text" 
                name="address" 
                placeholder="Building, Street, Landmark"
                value={formData.address} 
                onChange={handleInputChange} 
                required 
                className="w-full px-4 py-3 rounded-xl border border-gray-200/80 bg-slate-50/50 focus:bg-white text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-[#3D3F96]/20 focus:border-[#3D3F96] transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">City *</label>
              <input 
                type="text" 
                name="city" 
                placeholder="New Delhi"
                value={formData.city} 
                onChange={handleInputChange} 
                required 
                className="w-full px-4 py-3 rounded-xl border border-gray-200/80 bg-slate-50/50 focus:bg-white text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-[#3D3F96]/20 focus:border-[#3D3F96] transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">State *</label>
              <input 
                type="text" 
                name="state" 
                placeholder="Delhi"
                value={formData.state} 
                onChange={handleInputChange} 
                required 
                className="w-full px-4 py-3 rounded-xl border border-gray-200/80 bg-slate-50/50 focus:bg-white text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-[#3D3F96]/20 focus:border-[#3D3F96] transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Postal Pincode</label>
              <input 
                type="text" 
                name="pincode" 
                placeholder="110016"
                value={formData.pincode} 
                onChange={handleInputChange} 
                className="w-full px-4 py-3 rounded-xl border border-gray-200/80 bg-slate-50/50 focus:bg-white text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-[#3D3F96]/20 focus:border-[#3D3F96] transition-all"
              />
            </div>

          </div>
        </div>

        {/* --- SECTION 5: MEDIA FILES & DOCUMENTS (LARGE DROPZONES WITH PREVIEWS) --- */}
        <div className="bg-white rounded-[2rem] border border-gray-100 p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#3D3F96] flex items-center justify-center text-lg">
              <FaCloudUploadAlt />
            </div>
            <div>
              <h4 className="text-base font-black text-gray-800">5. Verification Documents & Photo Uploads</h4>
              <span className="text-[10px] text-gray-400 font-bold block mt-0.5">Upload doctor profile photo, medical license image, ID proof, and signature</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <LargeMediaBox label="Doctor Profile Photo" field="profileImage" />
            <LargeMediaBox label="Medical Registration License" field="licenseCert" />
            <LargeMediaBox label="Aadhar / Govt ID Proof" field="idProof" />
            <LargeMediaBox label="Doctor Digital Signature" field="signature" />
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex justify-end pt-2">
          <button 
            type="submit"
            disabled={loading}
            className="px-10 py-4 rounded-2xl bg-[#3D3F96] hover:bg-[#2C2E75] text-white text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-xl shadow-indigo-950/10 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-spin inline-block w-4 h-4 border-2 border-white rounded-full"></span>
            ) : (
              <>
                <FaCheckCircle size={16} /> Register Doctor Profile
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}