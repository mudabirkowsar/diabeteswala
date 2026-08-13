"use client";

import React, { useState, useEffect } from 'react';
import { 
  FaTrophy, 
  FaCloudUploadAlt, 
  FaTrashAlt, 
  FaPencilAlt, 
  FaTimes, 
  FaImage, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaPlus
} from 'react-icons/fa';

// --- INITIAL MOCK ACHIEVEMENTS ---
const INITIAL_ACHIEVEMENTS = [
  {
    id: "ach-1",
    title: "Excellence in Diabetic Care Award 2025",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600",
    uploadedAt: "7/23/2026"
  },
  {
    id: "ach-2",
    title: "Best Multi-Specialty Clinic Accreditation",
    image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=600",
    uploadedAt: "7/20/2026"
  }
];

export default function ClinicAchievementsPage() {
  const [mounted, setMounted] = useState(false);
  const [achievements, setAchievements] = useState(INITIAL_ACHIEVEMENTS);
  
  // Upload States
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Modals States
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  
  // Edit Form States
  const [editTitle, setEditTitle] = useState('');
  const [editImagePreview, setEditImagePreview] = useState('');

  const [notification, setNotification] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = (text, type = "success") => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- FILE SELECT HANDLER ---
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
    }
  };

  // --- UPLOAD HANDLER ---
  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      alert("Please select at least one image file first!");
      return;
    }

    setUploading(true);

    setTimeout(() => {
      const newItems = selectedFiles.map((file, idx) => ({
        id: `ach-${Date.now()}-${idx}`,
        title: file.name.replace(/\.[^/.]+$/, ""), // Uses file name as title
        image: URL.createObjectURL(file), // Creates local blob URL for preview
        uploadedAt: new Date().toLocaleDateString()
      }));

      setAchievements([...newItems, ...achievements]);
      setSelectedFiles([]);
      setUploading(false);
      showToast(`${newItems.length} Achievement Image(s) Uploaded!`);
    }, 800);
  };

  // --- DELETE SINGLE ITEM ---
  const handleDeleteSingle = (id) => {
    setAchievements(achievements.filter(item => item.id !== id));
    showToast("Achievement image removed", "danger");
  };

  // --- DELETE ALL ITEMS ---
  const confirmDeleteAll = () => {
    setAchievements([]);
    setShowDeleteAllModal(false);
    showToast("All achievement images deleted", "danger");
  };

  // --- OPEN EDIT MODAL ---
  const handleOpenEdit = (achievement) => {
    setSelectedAchievement(achievement);
    setEditTitle(achievement.title);
    setEditImagePreview(achievement.image);
    setShowEditModal(true);
  };

  // --- SAVE EDITED ACHIEVEMENT ---
  const handleSaveEdit = (e) => {
    e.preventDefault();
    setAchievements(achievements.map(item => 
      item.id === selectedAchievement.id 
        ? { ...item, title: editTitle, image: editImagePreview } 
        : item
    ));
    setShowEditModal(false);
    setSelectedAchievement(null);
    showToast("Achievement details updated!");
  };

  const handleEditFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setEditImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  if (!mounted) return null;

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

      {/* Dynamic Toast Notification */}
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
          <h2 className="text-2xl font-black text-gray-800">Clinic Achievements</h2>
          <p className="text-xs text-gray-400 mt-1">Upload and manage award certifications, accreditation images, and clinic recognitions.</p>
        </div>

        {achievements.length > 0 && (
          <button 
            onClick={() => setShowDeleteAllModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-sm self-start sm:self-auto"
          >
            <FaTrashAlt /> Delete All
          </button>
        )}
      </div>

      {/* --- SECTION 1: UPLOAD CARD --- */}
      <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
        
        {/* Banner Title */}
        <div className="bg-[#3D3F96] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white text-base">
              <FaCloudUploadAlt />
            </div>
            <h4 className="text-sm font-black uppercase tracking-wider">Upload Achievement Images</h4>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-4">
          
          {/* Custom Styled Upload Drag/Drop Box */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            
            <div className="relative flex-1 w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 hover:border-[#3D3F96] rounded-2xl bg-slate-50/50 hover:bg-indigo-50/20 cursor-pointer transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FaImage className="text-2xl text-gray-400 mb-2" />
                  <p className="text-xs font-bold text-gray-600">
                    {selectedFiles.length > 0 ? (
                      <span className="text-[#3D3F96] font-black">{selectedFiles.length} file(s) selected</span>
                    ) : (
                      <span><strong className="text-[#3D3F96]">Click to choose</strong> or drag images here</span>
                    )}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 font-semibold">Supported formats: JPG, PNG, WEBP, GIF</p>
                </div>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*"
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </label>
            </div>

            <button 
              onClick={handleUpload}
              disabled={uploading || selectedFiles.length === 0}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#3D3F96] hover:bg-[#2C2E75] text-white text-xs font-black uppercase tracking-widest transition-all duration-300 disabled:opacity-40 shadow-lg shadow-indigo-950/10 shrink-0 self-stretch flex items-center justify-center gap-2"
            >
              {uploading ? (
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white rounded-full"></span>
              ) : (
                <>
                  <FaCloudUploadAlt size={16} /> Upload Images
                </>
              )}
            </button>

          </div>

          <p className="text-[11px] text-gray-400 font-bold">You can select multiple achievement photos simultaneously for batch upload.</p>
        </div>

      </div>

      {/* --- SECTION 2: GALLERY GRID --- */}
      <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
        
        {/* Banner Header */}
        <div className="bg-emerald-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white text-base">
              <FaTrophy />
            </div>
            <h4 className="text-sm font-black uppercase tracking-wider">Achievement Gallery</h4>
          </div>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-white text-emerald-800 shadow-sm">
            {achievements.length} Images
          </span>
        </div>

        <div className="p-6 md:p-8">
          {achievements.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((item) => (
                <div 
                  key={item.id}
                  className="group bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Image Container with Zoom */}
                  <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-slate-900/60 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider">
                      {item.uploadedAt}
                    </div>
                  </div>

                  {/* Title & Caption */}
                  <div className="p-4 border-b border-gray-50">
                    <h5 className="text-xs font-black text-gray-800 line-clamp-1">{item.title}</h5>
                  </div>

                  {/* Action Controls Bar (EDIT & DELETE) */}
                  <div className="bg-slate-50 p-3 flex items-center justify-between gap-2">
                    
                    {/* EDIT BUTTON */}
                    <button 
                      onClick={() => handleOpenEdit(item)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white hover:bg-indigo-50 text-[#3D3F96] border border-gray-200/60 text-xs font-black uppercase tracking-wider transition-all shadow-sm"
                    >
                      <FaPencilAlt size={11} /> Edit
                    </button>

                    {/* DELETE BUTTON */}
                    <button 
                      onClick={() => handleDeleteSingle(item.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-gray-200/60 text-xs font-black uppercase tracking-wider transition-all shadow-sm"
                    >
                      <FaTrashAlt size={11} /> Delete
                    </button>

                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-400 font-bold">
              <FaTrophy className="text-gray-300 text-4xl mx-auto mb-3" />
              <h5 className="text-base text-gray-700 font-black">No Achievements Uploaded</h5>
              <p className="text-xs text-gray-400 mt-1">Upload images above to build your clinic recognition portfolio.</p>
            </div>
          )}
        </div>

      </div>

      {/* --- EDIT ACHIEVEMENT MODAL --- */}
      {showEditModal && selectedAchievement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-lg p-6 md:p-8 shadow-2xl border border-gray-100 relative animate-fadeIn">
            
            <button onClick={() => setShowEditModal(false)} className="absolute right-6 top-6 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-gray-400 hover:text-gray-600 transition-all">
              <FaTimes />
            </button>

            <div className="mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#3D3F96] flex items-center justify-center text-lg">
                <FaPencilAlt />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-800 leading-none">Edit Achievement</h3>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-1">Update title or replace photo</span>
              </div>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs font-semibold text-gray-600">
              
              {/* Image Preview */}
              <div className="flex flex-col items-center justify-center gap-2">
                <img src={editImagePreview} alt="Preview" className="w-full h-40 object-cover rounded-2xl border border-gray-100 shadow-sm" />
                <label className="cursor-pointer text-[10px] font-black uppercase text-[#3D3F96] hover:underline mt-1">
                  Change Image
                  <input type="file" accept="image/*" onChange={handleEditFileChange} className="hidden" />
                </label>
              </div>

              {/* Title Field */}
              <div className="flex flex-col gap-1.5">
                <label className="uppercase text-[10px] text-gray-400 font-bold">Achievement Title *</label>
                <input 
                  type="text" 
                  value={editTitle} 
                  onChange={(e) => setEditTitle(e.target.value)} 
                  required 
                  className="px-4 py-3 rounded-xl border border-gray-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#3D3F96]/10 outline-none text-gray-800 font-bold transition-all"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)} 
                  className="px-5 py-2.5 rounded-xl border border-gray-100 hover:bg-slate-50 text-[10px] font-black uppercase tracking-wider text-gray-400 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 rounded-xl bg-[#3D3F96] hover:bg-[#2C2D75] text-white text-[10px] font-black uppercase tracking-wider transition-all"
                >
                  Save Changes
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* --- DELETE ALL CONFIRMATION MODAL --- */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-6 md:p-8 shadow-2xl border border-gray-100 relative animate-fadeIn text-center">
            
            <button onClick={() => setShowDeleteAllModal(false)} className="absolute right-6 top-6 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-gray-400 hover:text-gray-600 transition-all">
              <FaTimes />
            </button>

            <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center text-2xl mx-auto mb-4 animate-bounce">
              <FaExclamationTriangle />
            </div>

            <h4 className="text-base font-black text-gray-800">Clear All Achievements?</h4>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Are you sure you want to delete **all {achievements.length} achievement images**? This action cannot be undone.
            </p>

            <div className="grid grid-cols-2 gap-3.5 mt-6">
              <button 
                type="button" 
                onClick={() => setShowDeleteAllModal(false)} 
                className="px-5 py-3 rounded-xl border border-gray-100 hover:bg-slate-50 text-xs font-black uppercase tracking-wider text-gray-400 transition-all"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={confirmDeleteAll} 
                className="px-5 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-black uppercase tracking-wider transition-all"
              >
                Delete All
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}