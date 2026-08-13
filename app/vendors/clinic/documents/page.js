"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Upload, X, FileText, Image, Camera, CheckCircle, 
    Loader2, Award, Building, BookOpen, LogOut, ArrowRight, ShieldCheck
} from 'lucide-react';
import { useNotification } from '../../../context/NotificationContext';
import ClinicAPI from '../../../services/ClinicAPI'; // Adjust path based on your structure

export default function DocumentUploadPage() {
    const router = useRouter();
    
    // --- Safe Context Extraction & Fallback ---
    const notificationContext = useNotification();
    const [localAlert, setLocalAlert] = useState(null); // Fallback state if context is undefined

    const triggerNotification = (message, type = 'info') => {
        if (notificationContext && typeof notificationContext.showNotification === 'function') {
            notificationContext.showNotification(message, type);
        } else {
            // Local self-contained alert system when provider is missing
            setLocalAlert({ message, type });
            setTimeout(() => setLocalAlert(null), 4000);
        }
    };

    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // --- Form Text Fields ---
    const [licenseNumber, setLicenseNumber] = useState('');
    const [councilName, setCouncilName] = useState('');
    const [councilNumber, setCouncilNumber] = useState('');

    // --- Form File States ---
    const [profileImage, setProfileImage] = useState(null);
    const [clinicImages, setClinicImages] = useState([]);
    const [licenseDocuments, setLicenseDocuments] = useState([]);
    const [otherDocuments, setOtherDocuments] = useState([]);

    // Handlers for File Selection
    const handleProfileImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
        }
    };

    const handleMultipleFileChange = (e, setter, currentFiles, maxCount = 10) => {
        const selected = Array.from(e.target.files);
        if (currentFiles.length + selected.length > maxCount) {
            triggerNotification(`You can only upload up to ${maxCount} files.`, "warning");
            return;
        }
        setter((prev) => [...prev, ...selected]);
    };

    const removeFile = (index, currentFiles, setter) => {
        setter(currentFiles.filter((_, idx) => idx !== index));
    };

    const handleLogoutAndRedirect = () => {
        // Clear authorization token
        localStorage.removeItem('clinicToken');
        setShowSuccessModal(false);
        triggerNotification("Logout successful. Credentials submitted for review.", "success");
        router.push('/authFiles/login'); // Redirect to login page
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();

            // Append Text Fields
            if (licenseNumber) formData.append('licenseNumber', licenseNumber);
            if (councilName) formData.append('councilName', councilName);
            if (councilNumber) formData.append('councilNumber', councilNumber);

            // Append Single Profile Image File
            if (profileImage) {
                formData.append('image', profileImage);
            }

            // Append Arrays of Files (Multipart Array Keys)
            clinicImages.forEach((file) => {
                formData.append('clinicImages', file);
            });
            licenseDocuments.forEach((file) => {
                formData.append('licenseDocument', file);
            });
            otherDocuments.forEach((file) => {
                formData.append('otherDocuments', file);
            });

            // Call Document Upload API
            const response = await ClinicAPI.uploadDocuments(formData);

            if (response.success) {
                triggerNotification("Documents submitted successfully!", "success");
                setShowSuccessModal(true);
            } else {
                triggerNotification(response.message || "Failed to submit documents", "error");
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Something went wrong while uploading credentials.";
            triggerNotification(errorMessage, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 select-none antialiased relative">
            
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

            <div className="max-w-4xl mx-auto">
                
                {/* Upper Header Block */}
                <div className="text-center mb-10">
                    <span className="text-[10px] uppercase font-black tracking-widest text-[#3d3f96] bg-indigo-50 px-4 py-1.5 rounded-full">
                        Step 2: Account Verification
                    </span>
                    <h2 className="text-3xl font-black text-gray-800 mt-4">Professional Credentials</h2>
                    <p className="text-sm text-gray-400 mt-2 max-w-lg mx-auto">
                        Please upload valid credentials and clinical documentation. Clear copies ensure quick validation.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* SECTION 1: TEXT CREDENTIALS */}
                    <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-gray-100 space-y-6">
                        <div className="flex items-center gap-2 border-b border-gray-50 pb-4">
                            <Award className="text-[#3d3f96]" size={20} />
                            <h3 className="text-base font-black text-gray-800">Registration Details</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* License Number */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    Clinic License Number
                                </label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        placeholder="e.g. LIC-2026-REG901"
                                        value={licenseNumber}
                                        onChange={(e) => setLicenseNumber(e.target.value)}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:ring-4 focus:ring-blue-50 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Medical Council Name */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    Medical Council Name
                                </label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        placeholder="e.g. Medical Council of India"
                                        value={councilName}
                                        onChange={(e) => setCouncilName(e.target.value)}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:ring-4 focus:ring-blue-50 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Registration Council Number */}
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    Registration Council Number
                                </label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        placeholder="e.g. MCI-22819"
                                        value={councilNumber}
                                        onChange={(e) => setCouncilNumber(e.target.value)}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:ring-4 focus:ring-blue-50 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: REQUIRED VERIFICATION FILES */}
                    <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-gray-100 space-y-8">
                        
                        {/* Profile Image (Single) */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-gray-50 pb-4">
                                <Camera className="text-[#3d3f96]" size={20} />
                                <h3 className="text-base font-black text-gray-800">Clinic Profile Image</h3>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <div className="w-24 h-24 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0 relative">
                                    {profileImage ? (
                                        <img 
                                            src={URL.createObjectURL(profileImage)} 
                                            alt="Profile Preview" 
                                            className="w-full h-full object-cover" 
                                        />
                                    ) : (
                                        <Image className="text-slate-300" size={28} />
                                    )}
                                </div>
                                <div className="flex-1 w-full text-center sm:text-left">
                                    <label className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-[#3d3f96] text-xs font-black uppercase tracking-wider cursor-pointer transition-all">
                                        <Upload size={14} />
                                        <span>Select Photo</span>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={handleProfileImageChange} 
                                            className="hidden" 
                                        />
                                    </label>
                                    <p className="text-[11px] text-gray-400 mt-2 font-medium">Accepts PNG, JPG, or JPEG. File serves as representative workspace icon.</p>
                                </div>
                            </div>
                        </div>

                        {/* License Documents (Multiple) */}
                        <div className="space-y-4 pt-4">
                            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="text-[#3d3f96]" size={20} />
                                    <h3 className="text-base font-black text-gray-800">Clinic License Documents</h3>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400">Max 10 files</span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Upload Dropzone */}
                                <label className="border-2 border-dashed border-slate-200 hover:border-[#3d3f96] bg-slate-50 hover:bg-indigo-50/20 rounded-[2rem] p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all group">
                                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 group-hover:text-[#3d3f96] shadow-sm transition-all">
                                        <Upload size={20} />
                                    </div>
                                    <span className="text-xs font-black text-gray-700">Browse Licensing Files</span>
                                    <span className="text-[10px] text-gray-400 font-medium">PDF, DOC, DOCX, or Images</span>
                                    <input 
                                        type="file" 
                                        multiple 
                                        onChange={(e) => handleMultipleFileChange(e, setLicenseDocuments, licenseDocuments)} 
                                        className="hidden" 
                                    />
                                </label>

                                {/* Selected Files List */}
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                    {licenseDocuments.length > 0 ? (
                                        licenseDocuments.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <FileText className="text-[#3d3f96] shrink-0" size={16} />
                                                    <span className="text-xs font-bold text-slate-700 truncate">{file.name}</span>
                                                </div>
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeFile(index, licenseDocuments, setLicenseDocuments)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-slate-100 rounded-2xl bg-slate-50/50">
                                            <p className="text-[11px] text-gray-400 font-bold">No licenses selected</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Clinic Infrastructure Photos (Multiple) */}
                        <div className="space-y-4 pt-4">
                            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                                <div className="flex items-center gap-2">
                                    <Building className="text-[#3d3f96]" size={20} />
                                    <h3 className="text-base font-black text-gray-800">Clinic Infrastructure Photos</h3>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400">Max 10 files</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <label className="border-2 border-dashed border-slate-200 hover:border-[#3d3f96] bg-slate-50 hover:bg-indigo-50/20 rounded-[2rem] p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all group">
                                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 group-hover:text-[#3d3f96] shadow-sm transition-all">
                                        <Upload size={20} />
                                    </div>
                                    <span className="text-xs font-black text-gray-700">Add Workspace Photos</span>
                                    <span className="text-[10px] text-gray-400 font-medium">JPEG, JPG, or PNG</span>
                                    <input 
                                        type="file" 
                                        multiple 
                                        accept="image/*"
                                        onChange={(e) => handleMultipleFileChange(e, setClinicImages, clinicImages)} 
                                        className="hidden" 
                                    />
                                </label>

                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                    {clinicImages.length > 0 ? (
                                        clinicImages.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <Image className="text-[#3d3f96] shrink-0" size={16} />
                                                    <span className="text-xs font-bold text-slate-700 truncate">{file.name}</span>
                                                </div>
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeFile(index, clinicImages, setClinicImages)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-slate-100 rounded-2xl bg-slate-50/50">
                                            <p className="text-[11px] text-gray-400 font-bold">No environment photos selected</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Other Documents (Multiple) */}
                        <div className="space-y-4 pt-4">
                            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="text-[#3d3f96]" size={20} />
                                    <h3 className="text-base font-black text-gray-800">Other Verification Proofs</h3>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400">Max 10 files</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <label className="border-2 border-dashed border-slate-200 hover:border-[#3d3f96] bg-slate-50 hover:bg-indigo-50/20 rounded-[2rem] p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all group">
                                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 group-hover:text-[#3d3f96] shadow-sm transition-all">
                                        <Upload size={20} />
                                    </div>
                                    <span className="text-xs font-black text-gray-700">Add Supporting Proofs</span>
                                    <span className="text-[10px] text-gray-400 font-medium">PDF, Document, or Images</span>
                                    <input 
                                        type="file" 
                                        multiple 
                                        onChange={(e) => handleMultipleFileChange(e, setOtherDocuments, otherDocuments)} 
                                        className="hidden" 
                                    />
                                </label>

                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                    {otherDocuments.length > 0 ? (
                                        otherDocuments.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <FileText className="text-[#3d3f96] shrink-0" size={16} />
                                                    <span className="text-xs font-bold text-slate-700 truncate">{file.name}</span>
                                                </div>
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeFile(index, otherDocuments, setOtherDocuments)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-slate-100 rounded-2xl bg-slate-50/50">
                                            <p className="text-[11px] text-gray-400 font-bold">No other proofs selected</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Submit Registration button */}
                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full bg-[#3d3f96] hover:bg-[#2d2f75] text-white py-5 rounded-3xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-blue-100 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="animate-spin" size={20} />
                                <span>Uploading Credentials...</span>
                            </div>
                        ) : (
                            <>
                                Submit For Administrative Review
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* ================= SUCCESS REVIEW DIALOG MODAL ================= */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-[2.5rem] max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 p-8 md:p-10 text-center relative">
                        <div className="w-16 h-16 rounded-3xl bg-emerald-100 flex items-center justify-center text-emerald-600 text-3xl mx-auto mb-6">
                            <CheckCircle size={36} />
                        </div>
                        <h3 className="text-xl font-black text-gray-800">Submission Successful</h3>
                        <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                            Your credentials, license verification documents, and medical council profiles have been uploaded and queued for validation [1].
                        </p>
                        
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 my-6 text-left">
                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 block mb-1">Process Status</span>
                            <span className="text-xs font-bold text-emerald-800">Profile Verification State: Pending Review</span>
                        </div>

                        <button 
                            onClick={handleLogoutAndRedirect}
                            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-100"
                        >
                            <LogOut size={14} /> Finish & Log Out
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}