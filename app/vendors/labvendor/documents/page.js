"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload,
  FileText,
  CheckCircle2,
  Building2,
  LogOut,
  Loader2,
  Plus,
  Trash2,
  AlertCircle,
  Info,
  X,
  FileCheck
} from 'lucide-react';
import { useNotification } from '../../../context/NotificationContext';
import LabAPI from '../../../services/LabVendorAPI'; // Mapped to LabVendorAPI.js

export default function LabDocumentsPage() {
  const router = useRouter();

  // --- Safe Context Extraction & Fallback ---
  const notificationContext = useNotification();
  const [localAlert, setLocalAlert] = useState(null);

  const triggerNotification = (message, type = 'info') => {
    if (notificationContext && typeof notificationContext.showNotification === 'function') {
      notificationContext.showNotification(message, type);
    } else {
      setLocalAlert({ message, type });
      setTimeout(() => setLocalAlert(null), 4000);
    }
  };

  // --- States ---
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // --- Form States ---
  const [textData, setTextData] = useState({
    documentState: '',
    issuingAuthority: '',
    gstNumber: '',
    experience: '',
    drugLicenseType: 'None',
    about: ''
  });

  const [files, setFiles] = useState({
    profileImage: null,
    labImages: [],
    labCertificates: [],
    labLicenses: [],
    gstCertificates: [],
    drugLicenses: [],
    otherCertificates: []
  });

  const handleTextChange = (e) => {
    setTextData({ ...textData, [e.target.name]: e.target.value });
  };

  // --- File Handler Functions ---
  const handleSingleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFiles((prev) => ({ ...prev, [fieldName]: file }));
    }
  };

  const handleMultipleFileChange = (e, fieldName) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      setFiles((prev) => ({
        ...prev,
        [fieldName]: [...prev[fieldName], ...selectedFiles]
      }));
    }
  };

  const removeSingleFile = (fieldName) => {
    setFiles((prev) => ({ ...prev, [fieldName]: null }));
  };

  const removeMultipleFile = (fieldName, indexToRemove) => {
    setFiles((prev) => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, index) => index !== indexToRemove)
    }));
  };

  // --- Submit Form Data ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form validations
    if (!files.profileImage) {
      return triggerNotification("Please upload a Lab Profile Image", "warning");
    }
    if (files.labLicenses.length === 0) {
      return triggerNotification("Please upload at least one Operating License Document", "warning");
    }

    setLoading(true);

    try {
      // Build native multipart FormData payload
      const payload = new FormData();

      // Append text fields
      Object.keys(textData).forEach((key) => {
        payload.append(key, textData[key]);
      });

      // Append single file
      if (files.profileImage) {
        payload.append('profileImage', files.profileImage);
      }

      // Append arrays of multiple files
      const multiFileKeys = [
        'labImages',
        'labCertificates',
        'labLicenses',
        'gstCertificates',
        'drugLicenses',
        'otherCertificates'
      ];

      multiFileKeys.forEach((key) => {
        if (files[key] && files[key].length > 0) {
          files[key].forEach((file) => {
            payload.append(key, file);
          });
        }
      });

      // Invoke API PUT logic
      const response = await LabAPI.uploadDocuments(payload);

      if (response && response.success) {
        setShowSuccessModal(true);
      } else {
        triggerNotification(response.message || "Failed to submit documents.", "error");
      }
    } catch (err) {
      console.error(err);
      triggerNotification(
        err.response?.data?.message || "An error occurred while uploading documents.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // --- Handle Logout and Session Removal ---
  const handleLogout = () => {
    localStorage.removeItem('labToken');
    setShowSuccessModal(false);
    router.push('/authFiles/login');
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-12 antialiased select-none">

      {/* Local Fallback Alert UI */}
      {localAlert && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-2xl shadow-xl border text-xs font-black flex items-center gap-3 animate-bounce ${localAlert.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
            localAlert.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-800' :
              localAlert.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-800' :
                'bg-slate-50 border-slate-100 text-slate-800'
          }`}>
          <span>{localAlert.message}</span>
          <button type="button" onClick={() => setLocalAlert(null)} className="text-slate-400 hover:text-slate-600">
            <X size={14} />
          </button>
        </div>
      )}

      {/* --- PAGE HEADER --- */}
      <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <FileText className="text-[#3d3f96]" /> Document Uploads
          </h1>
          <p className="text-slate-500 font-semibold text-xs mt-1">Submit registration numbers, details, and document images/PDFs.</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-white hover:bg-slate-50 text-rose-600 px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-xs font-bold transition-all"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>

      {/* --- MAIN FORM --- */}
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">

        {/* Left Side: General Profile Inputs */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-slate-800 border-b border-slate-50 pb-2">Lab Parameters</h2>

            {/* About text input */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">About Lab</label>
              <textarea
                required
                name="about"
                rows={3}
                value={textData.about}
                onChange={handleTextChange}
                placeholder="Brief description of clinical diagnostics offered..."
                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] transition-all resize-none"
              />
            </div>

            {/* Document State */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Document State</label>
              <input
                required
                type="text"
                name="documentState"
                value={textData.documentState}
                onChange={handleTextChange}
                placeholder="e.g. Rajasthan"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] transition-all"
              />
            </div>

            {/* Issuing Authority */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Issuing Authority</label>
              <input
                required
                type="text"
                name="issuingAuthority"
                value={textData.issuingAuthority}
                onChange={handleTextChange}
                placeholder="e.g. State Medical Council"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] transition-all"
              />
            </div>

            {/* GST Number */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">GST Number</label>
              <input
                required
                type="text"
                name="gstNumber"
                value={textData.gstNumber}
                onChange={handleTextChange}
                placeholder="e.g. 08ABCDE1234F1Z5"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] transition-all"
              />
            </div>

            {/* Experience */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Operational Experience</label>
              <input
                required
                type="text"
                name="experience"
                value={textData.experience}
                onChange={handleTextChange}
                placeholder="e.g. 5 Years"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] transition-all"
              />
            </div>

            {/* Drug License Type */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Drug License Type</label>
              <select
                name="drugLicenseType"
                value={textData.drugLicenseType}
                onChange={handleTextChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] cursor-pointer"
              >
                <option value="None">None</option>
                <option value="Retail">Retail</option>
                <option value="Wholesale">Wholesale</option>
                <option value="Restricted">Restricted</option>
                <option value="Blood Bank">Blood Bank</option>
              </select>
            </div>

          </div>
        </div>

        {/* Right Side: Profile Image & Documents Files Attachment */}
        <div className="md:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h2 className="text-sm font-black text-slate-800 border-b border-slate-50 pb-2">File Uploads</h2>

            {/* Single File Upload: Profile Image */}
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Profile Image <span className="text-red-500">*</span></p>
              {!files.profileImage ? (
                <label className="border-2 border-dashed border-slate-200 hover:border-[#3d3f96] rounded-2xl p-4 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all bg-slate-50/50">
                  <Upload size={18} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-600">Choose Profile Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleSingleFileChange(e, 'profileImage')}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between p-3 bg-[#3d3f96]/5 border border-[#3d3f96]/10 rounded-2xl">
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 size={14} className="text-[#3d3f96]" />
                    <span className="text-xs font-bold text-slate-700 truncate">{files.profileImage.name}</span>
                  </div>
                  <button type="button" onClick={() => removeSingleFile('profileImage')} className="text-slate-400 hover:text-red-500 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Multiple File Upload helper container */}
            {[
              { label: 'Lab Operating Licenses', key: 'labLicenses', mandatory: true },
              { label: 'GST Certificates', key: 'gstCertificates', mandatory: false },
              { label: 'Lab Certification Documents', key: 'labCertificates', mandatory: false },
              { label: 'Drug Licenses (If Type != None)', key: 'drugLicenses', mandatory: false },
              { label: 'Lab Gallery Images', key: 'labImages', mandatory: false },
              { label: 'Other Optional Certificates', key: 'otherCertificates', mandatory: false }
            ].map((field) => (
              <div key={field.key} className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  {field.label} {field.mandatory && <span className="text-red-500">*</span>}
                </p>

                <label className="border-2 border-dashed border-slate-200 hover:border-[#3d3f96] rounded-2xl p-4 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all bg-slate-50/50">
                  <Plus size={18} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-600">Add Files</span>
                  <input
                    multiple
                    type="file"
                    onChange={(e) => handleMultipleFileChange(e, field.key)}
                    className="hidden"
                  />
                </label>

                {files[field.key] && files[field.key].length > 0 && (
                  <div className="space-y-1.5 mt-2">
                    {files[field.key].map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="flex items-center gap-2 truncate">
                          <FileText size={12} className="text-slate-400 shrink-0" />
                          <span className="text-[11px] font-bold text-slate-600 truncate">{file.name}</span>
                        </div>
                        <button type="button" onClick={() => removeMultipleFile(field.key, idx)} className="text-slate-400 hover:text-red-500 transition-all">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Submit Button */}
            <button
              disabled={loading}
              type="submit"
              className="w-full bg-[#3d3f96] hover:bg-[#2d2f75] text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 transition-all active:scale-95 mt-6 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>Submit Profile &amp; Documents</span>
                  <Upload size={18} />
                </>
              )}
            </button>

          </div>
        </div>

      </form>

      {/* --- SUCCESS / WAIT FOR APPROVAL MODAL --- */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />

          <div className="bg-white rounded-[2.5rem] max-w-md w-full p-8 shadow-2xl relative z-10 border border-slate-100 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-[#3d3f96]/10 text-[#3d3f96] flex items-center justify-center mb-6 mx-auto">
              <FileCheck size={32} />
            </div>

            <h3 className="text-xl font-black text-slate-900 tracking-tight">Documents Uploaded</h3>
            <p className="text-xs text-slate-500 font-semibold mt-3 leading-relaxed">
              Your documents have been submitted successfully. Your registration profile status is now set to <strong className="text-[#3d3f96]">Pending Admin Approval</strong>.
            </p>

            <div className="mt-4 p-4 bg-amber-50/60 rounded-2xl border border-amber-100/50 flex items-start gap-2.5 text-left">
              <Info size={14} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-black text-amber-800 uppercase tracking-wider">Verification in Progress</p>
                <p className="text-[11px] text-amber-700 font-medium mt-0.5">Please wait for our administrator to inspect and verify your operating license certificates and medical credentials.</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="mt-8 w-full bg-[#3d3f96] hover:bg-[#2d2f75] text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-lg"
            >
              <LogOut size={14} /> Close Session &amp; Logout
            </button>
          </div>
        </div>
      )}

    </main>
  );
}