"use client";

import React, { useState, useEffect } from 'react';
import { 
  FaFileMedical, 
  FaCloudUploadAlt, 
  FaCheckCircle, 
  FaTimes, 
  FaIdCard, 
  FaCertificate, 
  FaUserMd, 
  FaSearchPlus, 
  FaCreditCard,
  FaAward,
  FaImage,
  FaDownload,
  FaEye,
  FaTrashAlt
} from 'react-icons/fa';

// --- INITIAL MOCK GALLERY DOCUMENTS ---
const INITIAL_GALLERY = [
  {
    id: "doc-1",
    name: "Medical Registration License",
    type: "Medical License",
    url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=600",
    status: "1" // Verified
  },
  {
    id: "doc-2",
    name: "NABH Accreditation Certificate",
    type: "Accreditation",
    url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600",
    status: "1" // Verified
  },
  {
    id: "doc-3",
    name: "Chief Doctor MBBS Certificate",
    type: "Doctor Certificate",
    url: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=600",
    status: "0" // Pending
  },
  {
    id: "doc-4",
    name: "Fire Safety Compliance Clearance",
    type: "Custom Certificate",
    url: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=600",
    status: "1" // Verified
  }
];

export default function ClinicDocumentsPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [galleryDocs, setGalleryDocs] = useState(INITIAL_GALLERY);
  
  // Selected Image for Lightbox Preview Modal
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Form Upload States
  const [formData, setFormData] = useState({
    licenceImage: null,
    accreditation: null,
    doctorCertificate: null,
    customCertName: '',
    customCertFile: null,
    aadharCard: null,
    panCard: null,
    drivingLicence: null
  });

  // LIVE IMAGE PREVIEWS STATE
  const [previews, setPreviews] = useState({
    licenceImage: null,
    accreditation: null,
    doctorCertificate: null,
    customCertFile: null,
    aadharCard: null,
    panCard: null,
    drivingLicence: null
  });

  const [notification, setNotification] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = (text, type = "success") => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Status Badge Renderer
  const renderStatusBadge = (status) => {
    switch(status) {
      case '1':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">Verified</span>;
      case '0':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200">Pending</span>;
      case '3':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-rose-50 text-rose-700 border border-rose-200">Rejected</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-600">Not Uploaded</span>;
    }
  };

  // Handle Local File Selection & Create Instant Preview URL
  const handleFileChange = (field, e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, [field]: file }));
      setPreviews(prev => ({
        ...prev,
        [field]: {
          url: URL.createObjectURL(file),
          name: file.name
        }
      }));
    }
  };

  // Remove Selected File
  const handleRemoveSelected = (field) => {
    setFormData(prev => ({ ...prev, [field]: null }));
    setPreviews(prev => ({ ...prev, [field]: null }));
  };

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const newItems = [];

      // If Custom Certificate uploaded
      if (formData.customCertName && formData.customCertFile) {
        newItems.push({
          id: `custom-${Date.now()}`,
          name: formData.customCertName,
          type: "Custom Certificate",
          url: previews.customCertFile?.url,
          status: "0" // Pending
        });
      }

      // Check each standard field
      const fields = [
        { field: 'licenceImage', name: 'Medical License', type: 'Medical License' },
        { field: 'accreditation', name: 'Accreditation Certificate', type: 'Accreditation' },
        { field: 'doctorCertificate', name: 'Doctor Certificate', type: 'Doctor Certificate' },
        { field: 'aadharCard', name: 'Aadhar Card Proof', type: 'Aadhar Card' },
        { field: 'panCard', name: 'PAN Card Proof', type: 'PAN Card' },
        { field: 'drivingLicence', name: 'Driving Licence', type: 'Driving Licence' }
      ];

      fields.forEach(item => {
        if (formData[item.field] && previews[item.field]) {
          newItems.push({
            id: `${item.field}-${Date.now()}`,
            name: item.name,
            type: item.type,
            url: previews[item.field].url,
            status: "0"
          });
        }
      });

      if (newItems.length === 0) {
        alert("Please select at least one file to upload!");
        setLoading(false);
        return;
      }

      setGalleryDocs([...newItems, ...galleryDocs]);
      setLoading(false);
      
      // Reset Form & Previews
      setFormData({
        licenceImage: null,
        accreditation: null,
        doctorCertificate: null,
        customCertName: '',
        customCertFile: null,
        aadharCard: null,
        panCard: null,
        drivingLicence: null
      });

      setPreviews({
        licenceImage: null,
        accreditation: null,
        doctorCertificate: null,
        customCertFile: null,
        aadharCard: null,
        panCard: null,
        drivingLicence: null
      });

      showToast("Clinic compliance documents updated successfully!");
    }, 800);
  };

  if (!mounted) return null;

  // REUSABLE LARGE FILE UPLOAD BOX WITH LIVE PREVIEW
  const LargeUploadBox = ({ title, field, accept = "image/*,.pdf" }) => {
    const preview = previews[field];

    return (
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between gap-3 transition-all hover:border-indigo-100">
        <div>
          <label className="text-xs font-black text-gray-800 block">{title}</label>
          <span className="text-[10px] text-gray-400 font-bold block mt-0.5">JPG, PNG, WEBP, PDF</span>
        </div>

        {/* Live Preview Display or Large Upload Dropzone */}
        {preview ? (
          <div className="relative group rounded-xl overflow-hidden border border-indigo-200 bg-white p-2">
            <img 
              src={preview.url} 
              alt={title} 
              className="w-full h-32 object-cover rounded-lg"
            />
            <div className="mt-2 flex items-center justify-between px-1">
              <span className="text-[10px] font-bold text-gray-600 truncate max-w-[140px]">
                {preview.name}
              </span>
              <button 
                type="button"
                onClick={() => handleRemoveSelected(field)}
                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-all"
                title="Remove file"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full py-6 px-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#3D3F96] bg-white hover:bg-indigo-50/20 cursor-pointer transition-all text-center">
            <FaCloudUploadAlt className="text-2xl text-[#3D3F96] mb-1.5" />
            <span className="text-xs font-black text-[#3D3F96]">Choose File</span>
            <span className="text-[9px] font-semibold text-gray-400 mt-0.5">Click to browse</span>
            <input 
              type="file" 
              accept={accept}
              onChange={(e) => handleFileChange(field, e)}
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

      {/* Dynamic Toast */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-2xl shadow-2xl text-xs font-black uppercase tracking-wider text-white border border-white/20 animate-fadeIn ${
          notification.type === 'danger' ? 'bg-rose-600' : 'bg-[#3D3F96]'
        }`}>
          {notification.text}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-800">Clinic Documents & Verification</h2>
          <p className="text-xs text-gray-400 mt-1">Manage compliance licenses, medical registrations, identity proofs, and custom certificates.</p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-2xl text-emerald-700 text-xs font-black self-start sm:self-auto">
          <FaCheckCircle className="text-emerald-500" />
          <span>{galleryDocs.length} Active Records</span>
        </div>
      </div>

      {/* --- SECTION 1: VERIFICATION OVERVIEW CARDS --- */}
      <div className="bg-white rounded-[2rem] border border-gray-100 p-6 md:p-8 shadow-sm">
        <h4 className="text-sm font-black text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <FaCertificate className="text-[#3D3F96]" /> Compliance Verification Overview
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Medical License", icon: FaIdCard, status: "1" },
            { label: "Accreditation", icon: FaCertificate, status: "1" },
            { label: "Doctor Certificate", icon: FaUserMd, status: "0" },
            { label: "Aadhar & Identity", icon: FaCreditCard, status: "1" }
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#3D3F96] flex items-center justify-center text-sm">
                    <Icon />
                  </div>
                  <span className="text-xs font-bold text-gray-700">{item.label}</span>
                </div>
                {renderStatusBadge(item.status)}
              </div>
            );
          })}
        </div>
      </div>

      {/* --- SECTION 2: GALLERY VIEW --- */}
      <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-6 md:p-8 bg-slate-50/50 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h4 className="text-base font-black text-gray-800 leading-none">Uploaded Documents Gallery</h4>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-1">Click on any card to preview full size</span>
          </div>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-[#3D3F96] text-white">
            {galleryDocs.length} Items
          </span>
        </div>

        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {galleryDocs.map((doc) => (
              <div 
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className="group bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  <img 
                    src={doc.url} 
                    alt={doc.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 z-10">
                    {renderStatusBadge(doc.status)}
                  </div>
                  
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-2xl">
                    <FaSearchPlus />
                  </div>
                </div>

                <div className="p-4 border-t border-gray-50 flex items-center justify-between gap-2">
                  <div>
                    <h5 className="text-xs font-black text-gray-800 line-clamp-1">{doc.name}</h5>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mt-0.5">{doc.type}</span>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#3D3F96] flex items-center justify-center shrink-0">
                    <FaEye size={12} />
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- SECTION 3: UPLOAD FORM SECTION WITH LARGE BUTTONS & LIVE PREVIEWS --- */}
      <div className="bg-white rounded-[2rem] border border-gray-100 p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 pb-6 border-b border-gray-100 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#3D3F96] flex items-center justify-center text-lg">
            <FaCloudUploadAlt />
          </div>
          <div>
            <h4 className="text-base font-black text-gray-800 leading-none">Upload & Update Documents</h4>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-1">Select files below for instant preview and submission</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Custom Certificate Input Section */}
          <div className="p-5 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-4">
            <div className="flex items-center gap-2 text-xs font-black text-[#3D3F96] uppercase tracking-wider">
              <FaAward />
              <span>Upload Custom Certificate (Custom Name)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {/* Field 1: Custom Name Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase text-gray-500">Certificate Name / Title *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Fire Safety Clearance, NABH Accreditation"
                  value={formData.customCertName}
                  onChange={(e) => setFormData({ ...formData, customCertName: e.target.value })}
                  className="px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-[#3D3F96]/20 transition-all"
                />
              </div>

              {/* Field 2: Custom File Uploader with Live Preview */}
              <div>
                <label className="text-[10px] font-black uppercase text-gray-500 block mb-1.5">Select Certificate Image *</label>
                {previews.customCertFile ? (
                  <div className="relative rounded-xl overflow-hidden border border-indigo-200 bg-white p-2">
                    <img src={previews.customCertFile.url} alt="Custom Cert Preview" className="w-full h-36 object-cover rounded-lg" />
                    <div className="mt-2 flex items-center justify-between px-1">
                      <span className="text-xs font-bold text-gray-700 truncate">{previews.customCertFile.name}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveSelected('customCertFile')}
                        className="px-3 py-1 rounded-lg bg-rose-50 text-rose-600 text-xs font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full py-5 px-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#3D3F96] bg-white hover:bg-indigo-50/20 cursor-pointer transition-all text-center">
                    <FaCloudUploadAlt className="text-3xl text-[#3D3F96] mb-1" />
                    <span className="text-xs font-black text-[#3D3F96]">Choose Custom File</span>
                    <span className="text-[9px] font-semibold text-gray-400 mt-0.5">Click to browse file</span>
                    <input 
                      type="file" 
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange('customCertFile', e)}
                      className="hidden" 
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Standard Document Large Upload Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <LargeUploadBox title="Medical License" field="licenceImage" />
            <LargeUploadBox title="Accreditation Certificate" field="accreditation" />
            <LargeUploadBox title="Doctor Certificate" field="doctorCertificate" />
            <LargeUploadBox title="Aadhar Card Proof" field="aadharCard" />
            <LargeUploadBox title="PAN Card Proof" field="panCard" />
            <LargeUploadBox title="Driving Licence" field="drivingLicence" />
          </div>

          {/* Submit Action Button */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 rounded-2xl bg-[#3D3F96] hover:bg-[#2C2E75] text-white text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-lg shadow-indigo-950/10 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white rounded-full"></span>
              ) : (
                <>
                  <FaCloudUploadAlt size={16} /> Update Clinic Documents
                </>
              )}
            </button>
          </div>

        </form>
      </div>

      {/* --- LIGHTBOX IMAGE PREVIEW MODAL --- */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl border border-gray-100 overflow-hidden relative animate-fadeIn">
            
            {/* Modal Header */}
            <div className="p-6 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h4 className="text-base font-black text-gray-800">{selectedDoc.name}</h4>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-0.5">{selectedDoc.type}</span>
              </div>

              <div className="flex items-center gap-3">
                {renderStatusBadge(selectedDoc.status)}
                <button onClick={() => setSelectedDoc(null)} className="p-2 rounded-xl bg-white hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all">
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Modal Image Body */}
            <div className="p-6 text-center bg-slate-100 flex items-center justify-center min-h-[300px]">
              <img src={selectedDoc.url} alt={selectedDoc.name} className="max-h-[60vh] w-auto object-contain rounded-xl shadow-md" />
            </div>

            {/* Modal Footer Controls */}
            <div className="p-6 bg-white border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400">Clinic Verification Record</span>
              
              <button 
                onClick={() => showToast(`Downloading ${selectedDoc.name}...`)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3D3F96] hover:bg-[#2C2E75] text-white text-xs font-black uppercase tracking-wider transition-all"
              >
                <FaDownload /> Download File
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}