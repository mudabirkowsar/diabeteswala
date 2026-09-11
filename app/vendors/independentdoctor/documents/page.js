"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  LogOut, 
  Loader2, 
  Plus, 
  Trash2, 
  Info, 
  X, 
  FileCheck, 
  Stethoscope, 
  Award, 
  ShieldCheck, 
  PenTool, 
  UserCheck 
} from 'lucide-react';
import { useNotification } from '../../../context/NotificationContext';
import IndependentDoctorAPI from '../../../services/IndependentDoctorAPI'; // Adjust path if needed

export default function DoctorDocumentsPage() {
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

  // --- Form Text Fields State ---
  const [textData, setTextData] = useState({
    qualification: '',
    speciality: '',
    licenseNumber: '',
    councilName: '',
    councilNumber: '',
    experienceYears: '',
    about: ''
  });

  // --- Binary Files Upload State ---
  const [files, setFiles] = useState({
    profileImage: null,
    signatureImage: null,
    licenseDoc: null,
    qualificationDoc: null,
    photoId: null,
    certificates: []
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

  // --- Submit KYC Documents ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Mandatory Text Validation
    if (!textData.qualification.trim() || !textData.speciality.trim() || !textData.licenseNumber.trim() || !textData.councilName.trim()) {
      return triggerNotification("Please fill in Qualification, Speciality, License Number, and Council Name.", "warning");
    }

    // 2. Mandatory Files Validation
    if (!files.licenseDoc) {
      return triggerNotification("Please upload your Medical Council Registration Certificate (licenseDoc).", "warning");
    }
    if (!files.qualificationDoc) {
      return triggerNotification("Please upload your Primary Medical Degree Certificate (qualificationDoc).", "warning");
    }
    if (!files.photoId) {
      return triggerNotification("Please upload your Government Photo ID Proof (photoId).", "warning");
    }

    setLoading(true);

    try {
      // Build native multipart FormData payload
      const payload = new FormData();

      // Append text data
      Object.keys(textData).forEach((key) => {
        if (textData[key] !== '') {
          payload.append(key, textData[key]);
        }
      });

      // Append single files
      if (files.profileImage) payload.append('profileImage', files.profileImage);
      if (files.signatureImage) payload.append('signatureImage', files.signatureImage);
      if (files.licenseDoc) payload.append('licenseDoc', files.licenseDoc);
      if (files.qualificationDoc) payload.append('qualificationDoc', files.qualificationDoc);
      if (files.photoId) payload.append('photoId', files.photoId);

      // Append multiple certificates
      if (files.certificates && files.certificates.length > 0) {
        files.certificates.forEach((file) => {
          payload.append('certificates', file);
        });
      }

      // Execute PUT API call
      const response = await IndependentDoctorAPI.uploadIndependentDoctorKYCDocuments(payload);

      if (response && response.success) {
        setShowSuccessModal(true);
      } else {
        triggerNotification(response.message || "Failed to submit medical credentials.", "error");
      }
    } catch (err) {
      console.error(err);
      triggerNotification(
        err.response?.data?.message || "An error occurred while uploading medical credentials.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // --- Handle Logout and Session Removal ---
  const handleLogout = () => {
    localStorage.removeItem('independentDoctorToken');
    setShowSuccessModal(false);
    router.push('/authFiles/login');
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-12 antialiased select-none">
      
      {/* Local Fallback Alert UI */}
      {localAlert && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-2xl shadow-xl border text-xs font-black flex items-center gap-3 animate-bounce ${
          localAlert.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
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
      <div className="max-w-5xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Stethoscope className="text-[#3d3f96]" /> Doctor KYC &amp; Verification
          </h1>
          <p className="text-slate-500 font-semibold text-xs mt-1">Submit your medical qualifications, council licenses, photo ID, and digital signature for verification.</p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 bg-white hover:bg-slate-50 text-rose-600 px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-xs font-bold transition-all"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>

      {/* --- MAIN FORM --- */}
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Side: Medical Credentials & Text Fields */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-2">
              <Award size={16} className="text-[#3d3f96]" /> Practitioner Information
            </h2>

            {/* Qualifications */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Primary Qualifications <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                name="qualification"
                value={textData.qualification}
                onChange={handleTextChange}
                placeholder="e.g. MBBS, MD"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] transition-all"
              />
            </div>

            {/* Speciality */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Medical Speciality <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                name="speciality"
                value={textData.speciality}
                onChange={handleTextChange}
                placeholder="e.g. Cardiologist"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] transition-all"
              />
            </div>

            {/* Medical License Number */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Medical License Number <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                name="licenseNumber"
                value={textData.licenseNumber}
                onChange={handleTextChange}
                placeholder="e.g. MCI-48209"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] transition-all"
              />
            </div>

            {/* Medical Council Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Medical Council Name <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                name="councilName"
                value={textData.councilName}
                onChange={handleTextChange}
                placeholder="e.g. Delhi Medical Council"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] transition-all"
              />
            </div>

            {/* Council Registration ID */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Council Registration ID (Optional)
              </label>
              <input
                type="text"
                name="councilNumber"
                value={textData.councilNumber}
                onChange={handleTextChange}
                placeholder="e.g. MCI-2232"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] transition-all"
              />
            </div>

            {/* Experience in Years */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Practice Experience (Years)
              </label>
              <input
                type="number"
                min="0"
                name="experienceYears"
                value={textData.experienceYears}
                onChange={handleTextChange}
                placeholder="e.g. 6"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] transition-all"
              />
            </div>

            {/* About Doctor */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Doctor Biography / Professional Summary
              </label>
              <textarea
                rows={3}
                name="about"
                value={textData.about}
                onChange={handleTextChange}
                placeholder="Senior Cardiologist with 6+ years of clinical experience in cardiac care..."
                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] transition-all resize-none"
              />
            </div>

          </div>
        </div>

        {/* Right Side: Binary Documents, License, ID, Photo & Digital Signature Attachments */}
        <div className="md:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h2 className="text-sm font-black text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#3d3f96]" /> Required KYC Files &amp; Certificates
            </h2>

            {/* 1. Profile Photo & Digital Signature in Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Profile Image */}
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Profile Photo (.jpg, .jpeg, .png)</p>
                {!files.profileImage ? (
                  <label className="border-2 border-dashed border-slate-200 hover:border-[#3d3f96] rounded-2xl p-4 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all bg-slate-50/50 min-h-[90px]">
                    <Upload size={16} className="text-slate-400" />
                    <span className="text-[11px] font-bold text-slate-600">Select Photo</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      onChange={(e) => handleSingleFileChange(e, 'profileImage')}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-[#3d3f96]/5 border border-[#3d3f96]/10 rounded-2xl min-h-[90px]">
                    <div className="flex items-center gap-2 truncate">
                      <CheckCircle2 size={14} className="text-[#3d3f96] shrink-0" />
                      <span className="text-xs font-bold text-slate-700 truncate">{files.profileImage.name}</span>
                    </div>
                    <button type="button" onClick={() => removeSingleFile('profileImage')} className="text-slate-400 hover:text-red-500 transition-all ml-2">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Digital Signature */}
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                  <PenTool size={11} className="text-slate-400" /> Digital Prescription Signature
                </p>
                {!files.signatureImage ? (
                  <label className="border-2 border-dashed border-slate-200 hover:border-[#3d3f96] rounded-2xl p-4 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all bg-slate-50/50 min-h-[90px]">
                    <Upload size={16} className="text-slate-400" />
                    <span className="text-[11px] font-bold text-slate-600">Select Signature</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      onChange={(e) => handleSingleFileChange(e, 'signatureImage')}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-[#3d3f96]/5 border border-[#3d3f96]/10 rounded-2xl min-h-[90px]">
                    <div className="flex items-center gap-2 truncate">
                      <CheckCircle2 size={14} className="text-[#3d3f96] shrink-0" />
                      <span className="text-xs font-bold text-slate-700 truncate">{files.signatureImage.name}</span>
                    </div>
                    <button type="button" onClick={() => removeSingleFile('signatureImage')} className="text-slate-400 hover:text-red-500 transition-all ml-2">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* 2. Mandatory KYC Medical Certificates */}
            {[
              { label: 'Medical Council Registration Certificate (licenseDoc)', key: 'licenseDoc', mandatory: true },
              { label: 'Primary Degree Certificate (MBBS / MD) (qualificationDoc)', key: 'qualificationDoc', mandatory: true },
              { label: 'Government Photo ID Proof (Aadhaar / Passport) (photoId)', key: 'photoId', mandatory: true }
            ].map((field) => (
              <div key={field.key} className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  {field.label} {field.mandatory && <span className="text-red-500">*</span>}
                </p>
                
                {!files[field.key] ? (
                  <label className="border-2 border-dashed border-slate-200 hover:border-[#3d3f96] rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <Upload size={16} className="text-slate-400" />
                      <span className="text-xs font-bold text-slate-600">Upload File (.pdf, .jpg, .png)</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Browse</span>
                    <input
                      type="file"
                      accept=".pdf,image/jpeg,image/png,image/jpg"
                      onChange={(e) => handleSingleFileChange(e, field.key)}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-indigo-50/40 border border-indigo-100 rounded-2xl">
                    <div className="flex items-center gap-2 truncate">
                      <FileText size={14} className="text-[#3d3f96] shrink-0" />
                      <span className="text-xs font-bold text-slate-700 truncate">{files[field.key].name}</span>
                    </div>
                    <button type="button" onClick={() => removeSingleFile(field.key)} className="text-slate-400 hover:text-red-500 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* 3. Additional Fellowships, Diplomas & Certificates (Up to 10 Files) */}
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Additional Fellowships, Diplomas &amp; Certificates (Up to 10 Files)
              </p>
              
              <label className="border-2 border-dashed border-slate-200 hover:border-[#3d3f96] rounded-2xl p-4 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all bg-slate-50/50">
                <Plus size={18} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-600">Attach Additional Certificates</span>
                <input
                  multiple
                  type="file"
                  accept=".pdf,image/jpeg,image/png,image/jpg"
                  onChange={(e) => handleMultipleFileChange(e, 'certificates')}
                  className="hidden"
                />
              </label>

              {files.certificates && files.certificates.length > 0 && (
                <div className="space-y-1.5 mt-2">
                  {files.certificates.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-100 rounded-xl">
                      <div className="flex items-center gap-2 truncate">
                        <FileText size={12} className="text-slate-400 shrink-0" />
                        <span className="text-[11px] font-bold text-slate-600 truncate">{file.name}</span>
                      </div>
                      <button type="button" onClick={() => removeMultipleFile('certificates', idx)} className="text-slate-400 hover:text-red-500 transition-all">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

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
                  <span>Submit Medical Documents</span>
                  <Upload size={18} />
                </>
              )}
            </button>

          </div>
        </div>

      </form>

      {/* --- SUCCESS / AWAITING ADMIN APPROVAL MODAL --- */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
          
          <div className="bg-white rounded-[2.5rem] max-w-md w-full p-8 shadow-2xl relative z-10 border border-slate-100 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-[#3d3f96]/10 text-[#3d3f96] flex items-center justify-center mb-6 mx-auto">
              <FileCheck size={32} />
            </div>

            <h3 className="text-xl font-black text-slate-900 tracking-tight">Documents Submitted</h3>
            <p className="text-xs text-slate-500 font-semibold mt-3 leading-relaxed">
              Your medical licenses, degrees, and identity verification files have been submitted successfully. Your profile status is now set to <strong className="text-[#3d3f96]">Pending Admin Approval</strong>.
            </p>

            <div className="mt-4 p-4 bg-amber-50/60 rounded-2xl border border-amber-100/50 flex items-start gap-2.5 text-left">
              <Info size={14} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-black text-amber-800 uppercase tracking-wider">Verification in Progress</p>
                <p className="text-[11px] text-amber-700 font-medium mt-0.5">Our medical council review committee will verify your license number and degree credentials. This process usually completes within 24 to 48 hours.</p>
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