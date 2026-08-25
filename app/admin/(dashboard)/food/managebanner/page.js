"use client";

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Video,
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit3,
  X,
  RefreshCw,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Link as LinkIcon,
  Sliders,
  Eye,
  Check
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Import your API service functions
import AdminAPI from '../../../../services/AdminAPI';

// --- BASE MEDIA HELPER ---
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";

const getMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("blob:")) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  return `${BASE_SERVER_URL}/${cleanPath}`;
};

export default function ManageBannersPage() {
  // --- Data States ---
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  // --- Modal Configurations ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [editingId, setEditingId] = useState(null);

  // --- Form Fields State ---
  const [formType, setFormType] = useState('video');
  const [formBadgeText, setFormBadgeText] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formLink, setFormLink] = useState('/food/menu');
  const [formOpacity, setFormOpacity] = useState(60);
  const [formActive, setFormActive] = useState(true);
  const [formPriority, setFormPriority] = useState('1');
  const [formTaglineColor, setFormTaglineColor] = useState('#00B574');
  
  // --- File Upload & Live Preview States ---
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewMediaUrl, setPreviewMediaUrl] = useState('');

  // --- 1. Fetch All Banners List ---
  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await AdminAPI.getAllBannersList();
      if (response && response.success) {
        setBanners(response.data || []);
      } else {
        toast.error("Failed to load hero banners.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error reading banner database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // --- Handle Local File Pick & Generate Blob Preview ---
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewMediaUrl(objectUrl);
      
      // Auto-detect type from file mime
      if (file.type.startsWith('video/')) {
        setFormType('video');
      } else {
        setFormType('image');
      }
    }
  };

  // --- 2. Toggle Live Active Status ---
  const handleToggleStatus = async (id) => {
    setTogglingId(id);
    try {
      const response = await AdminAPI.toggleBannerStatus(id);
      if (response && response.success) {
        toast.success(response.message || "Banner status updated.");
        const newActive = response.isActive ?? (response.data?.status === 'Active');
        
        setBanners(prev => prev.map(b => {
          if (b._id === id) {
            return {
              ...b,
              status: newActive ? 'Active' : 'Inactive',
              isActive: newActive
            };
          }
          return b;
        }));
      } else {
        toast.error("Failed to update status.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error updating banner visibility.");
    } finally {
      setTogglingId(null);
    }
  };

  // --- 3. Delete Banner ---
  const handleDeleteBanner = async (id) => {
    if (!window.confirm("Are you sure you want to permanently remove this hero banner?")) return;
    setActionLoading(true);
    try {
      const response = await AdminAPI.deleteBannerConfig(id);
      if (response && response.success) {
        toast.success(response.message || "Hero banner configuration removed.");
        setBanners(prev => prev.filter(b => b._id !== id));
      } else {
        toast.error("Failed to delete banner.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error deleting banner.");
    } finally {
      setActionLoading(false);
    }
  };

  // --- Open Create Modal ---
  const openCreateModal = () => {
    setModalMode('create');
    resetForm();
    setIsModalOpen(true);
  };

  // --- Open Edit Modal ---
  const openEditModal = (banner) => {
    setModalMode('edit');
    setEditingId(banner._id);

    setFormType(banner.type || 'video');
    setFormBadgeText(banner.badgeText || '');
    setFormTitle(banner.title || '');
    setFormDescription(banner.description || '');
    setFormLink(banner.link || '/food/menu');
    setFormOpacity(banner.overlayOpacity || 60);
    setFormActive(banner.status === 'Active' || banner.isActive === true);
    setFormPriority((banner.priority || 1).toString());
    setFormTaglineColor(banner.taglineColor || '#00B574');
    
    const mediaSource = banner.image?.[0] || '';
    setPreviewMediaUrl(getMediaUrl(mediaSource));
    setUploadedFile(null);

    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormType('video');
    setFormBadgeText('');
    setFormTitle('');
    setFormDescription('');
    setFormLink('/food/menu');
    setFormOpacity(60);
    setFormActive(true);
    setFormPriority('1');
    setFormTaglineColor('#00B574');
    setUploadedFile(null);
    setPreviewMediaUrl('');
    setEditingId(null);
  };

  // --- 4. Submit Create or Update ---
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      toast.error("Please enter a title headline.");
      return;
    }

    if (!formDescription.trim()) {
      toast.error("Please enter a description subtext.");
      return;
    }

    setActionLoading(true);
    try {
      let response;

      if (modalMode === 'create') {
        if (!uploadedFile) {
          toast.error("Please select a background image or video file.");
          setActionLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('title', formTitle.trim());
        formData.append('description', formDescription.trim());
        formData.append('badgeText', formBadgeText.trim());
        formData.append('taglineColor', formTaglineColor);
        formData.append('overlayOpacity', Number(formOpacity));
        formData.append('priority', Number(formPriority) || 1);
        formData.append('isActive', formActive);
        formData.append('link', formLink.trim());

        response = await AdminAPI.createHeroBanner(formData);
      } else {
        if (uploadedFile) {
          // Multipart update if file changed
          const formData = new FormData();
          formData.append('file', uploadedFile);
          formData.append('title', formTitle.trim());
          formData.append('description', formDescription.trim());
          formData.append('badgeText', formBadgeText.trim());
          formData.append('taglineColor', formTaglineColor);
          formData.append('overlayOpacity', Number(formOpacity));
          formData.append('priority', Number(formPriority) || 1);
          formData.append('isActive', formActive);
          formData.append('link', formLink.trim());

          response = await AdminAPI.updateHeroBannerDetails(editingId, formData, true);
        } else {
          // Standard JSON update if modifying textual metadata
          const jsonPayload = {
            title: formTitle.trim(),
            description: formDescription.trim(),
            badgeText: formBadgeText.trim(),
            taglineColor: formTaglineColor,
            overlayOpacity: Number(formOpacity),
            priority: Number(formPriority) || 1,
            isActive: formActive,
            link: formLink.trim()
          };

          response = await AdminAPI.updateHeroBannerDetails(editingId, jsonPayload, false);
        }
      }

      if (response && response.success) {
        toast.success(response.message || "Hero banner configuration saved.");
        resetForm();
        setIsModalOpen(false);
        fetchBanners();
      } else {
        toast.error("Failed to save banner configuration.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error submitting hero banner.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 py-4 pb-12 antialiased select-none text-slate-800">
      <Toaster position="top-right" />
      
      {/* --- SECTION HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-[#3d3f96]/10 text-[#3d3f96] flex items-center justify-center border border-[#3d3f96]/10 shrink-0 shadow-sm">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Main Page Hero Banners</h1>
            <p className="text-xs text-slate-500 font-bold mt-1">
              Configure full-screen background video/image sliders, manage priority sequence, and control live visibility.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={fetchBanners}
            disabled={loading}
            className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 px-4 py-3 rounded-xl border border-slate-200 shadow-sm text-xs font-bold transition-all cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh List
          </button>
          <button
            onClick={openCreateModal}
            className="px-6 py-3.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-950/10 flex items-center gap-2 cursor-pointer transition-all"
          >
            <Plus size={15} /> CREATE NEW HERO BANNER
          </button>
        </div>
      </div>

      {/* --- ACTIVE BANNERS DIRECTORY CONTAINER --- */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
            Configured Hero Sliders ({banners.length})
          </span>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading slider configurations...</p>
          </div>
        ) : banners.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {banners.map((banner) => {
              const mediaSource = getMediaUrl(banner.image?.[0]);
              const isVideo = banner.type === 'video' || mediaSource?.endsWith('.mp4') || mediaSource?.endsWith('.webm');
              const isBannerActive = banner.status === 'Active' || banner.isActive === true;

              return (
                <div 
                  key={banner._id}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all duration-300"
                >
                  {/* 1. REALISTIC LIVE PREVIEW CARD */}
                  <div className="relative h-72 sm:h-80 w-full overflow-hidden bg-[#0A0B1E] flex items-center justify-center shrink-0">
                    
                    {isVideo ? (
                      <video
                        src={mediaSource}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover z-0"
                      />
                    ) : (
                      <img
                        src={mediaSource}
                        alt={banner.title}
                        className="absolute inset-0 w-full h-full object-cover z-0"
                      />
                    )}

                    {/* Dynamic dark overlay */}
                    <div 
                      className="absolute inset-0 bg-black z-10 transition-opacity duration-300 pointer-events-none" 
                      style={{ opacity: (banner.overlayOpacity || 60) / 100 }}
                    />

                    {/* Foreground Card Details */}
                    <div className="max-w-md sm:max-w-lg mx-auto text-center px-6 relative z-20 pointer-events-none">
                      {banner.badgeText && (
                        <span 
                          className="inline-flex items-center gap-1.5 bg-black/40 backdrop-blur-md text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full mb-3 border border-white/15"
                          style={{ color: banner.taglineColor || '#00B574' }}
                        >
                          <span 
                            className="w-1.5 h-1.5 rounded-full animate-pulse" 
                            style={{ backgroundColor: banner.taglineColor || '#00B574' }} 
                          />
                          {banner.badgeText}
                        </span>
                      )}
                      <h2 className="text-xl sm:text-2xl font-black text-white leading-tight tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                        {banner.title}
                      </h2>
                      <p className="text-[11px] text-indigo-100/90 max-w-sm mx-auto leading-relaxed mt-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] line-clamp-2">
                        {banner.description}
                      </p>
                    </div>

                    {/* Type Badge */}
                    <span className="absolute top-4 left-4 bg-[#3d3f96] text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-md z-20 flex items-center gap-1">
                      {isVideo ? <Video size={11} /> : <ImageIcon size={11} />}
                      {banner.type?.toUpperCase() || 'BANNER'}
                    </span>

                    {/* Navigation Link Tag */}
                    {banner.link && (
                      <span className="absolute top-4 right-4 bg-black/40 backdrop-blur-md text-white text-[9px] font-bold px-2.5 py-1 rounded-lg z-20 flex items-center gap-1">
                        <LinkIcon size={10} /> {banner.link}
                      </span>
                    )}
                  </div>

                  {/* 2. ADMIN CONFIGURATION ROW */}
                  <div className="p-6 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-800 text-sm">Sequence: #{banner.priority || 1}</span>
                        <span className="text-xs text-slate-400 font-bold">• Dark Opacity: {banner.overlayOpacity || 60}%</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-semibold truncate max-w-md font-mono">
                        Source: {banner.image?.[0] || "No media attached"}
                      </p>
                    </div>

                    {/* Actions and Toggle */}
                    <div className="flex items-center justify-between sm:justify-end gap-5">
                      
                      {/* Live Toggle */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-slate-400">
                          {isBannerActive ? 'Active' : 'Offline'}
                        </span>
                        <button
                          type="button"
                          disabled={togglingId === banner._id}
                          onClick={() => handleToggleStatus(banner._id)}
                          className="focus:outline-none transition-colors duration-200 cursor-pointer inline-flex items-center justify-center disabled:opacity-50"
                          title={isBannerActive ? "Set Offline" : "Set Live"}
                        >
                          {isBannerActive ? (
                            <ToggleRight className="text-[#3d3f96]" size={28} />
                          ) : (
                            <ToggleLeft className="text-slate-300" size={28} />
                          )}
                        </button>
                      </div>

                      <div className="w-px h-6 bg-slate-200 hidden sm:block" />

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button 
                          onClick={() => openEditModal(banner)}
                          className="p-2 border border-slate-200 text-slate-400 hover:text-[#3d3f96] hover:bg-[#3d3f96]/5 rounded-xl transition cursor-pointer"
                          title="Edit Configuration"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button 
                          onClick={() => handleDeleteBanner(banner._id)}
                          disabled={actionLoading}
                          className="p-2 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                          title="Delete Banner"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-24 text-center bg-white rounded-3xl border border-slate-100 shadow-sm border-dashed">
            <Sparkles size={40} className="text-slate-300 mb-3" />
            <p className="font-bold text-slate-700">No Hero Banners Configured</p>
            <p className="text-xs text-slate-400 mt-1">There are no banners published to the storefront slider. Click "+ Create" above to launch one.</p>
          </div>
        )}
      </div>

      {/* --- CREATE & EDIT OVERLAY MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col [&::-webkit-scrollbar]:hidden text-left">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#3d3f96]/10 text-[#3d3f96] flex items-center justify-center border border-[#3d3f96]/10">
                  <Sliders size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg uppercase tracking-tight">
                    {modalMode === 'create' ? 'Create Front Page Banner' : 'Edit Slider Configuration'}
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Configure live background media stream and foreground typography</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={actionLoading}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleFormSubmit} className="p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto">
              
              {/* Media Type & Upload Zone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Banner Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#3d3f96] cursor-pointer"
                  >
                    <option value="video">🎥 Background Video Stream (MP4, WebM)</option>
                    <option value="image">🖼️ Static Photo Overlay (PNG, JPG, WebP)</option>
                  </select>
                </div>
                
                {/* Drag-and-Drop Media Input */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                    {formType === 'video' ? 'Select Video File (max 20MB)' : 'Select Photo File (max 5MB)'}
                  </label>
                  
                  <div className="border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-indigo-50/20 rounded-2xl p-5 flex flex-col items-center justify-center text-center space-y-2 relative transition-all">
                    <div className="w-9 h-9 rounded-full bg-[#3d3f96]/10 text-[#3d3f96] flex items-center justify-center">
                      {formType === 'video' ? <Video size={18} /> : <ImageIcon size={18} />}
                    </div>
                    
                    <label className="cursor-pointer bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-extrabold text-[10px] uppercase tracking-wider px-4 py-2 rounded-xl shadow-md transition active:scale-95">
                      Select Local File
                      <input 
                        type="file" 
                        required={modalMode === 'create'}
                        accept={formType === 'video' ? 'video/mp4,video/webm' : 'image/png,image/jpeg,image/jpg,image/webp'}
                        className="hidden" 
                        onChange={handleFileChange}
                      />
                    </label>

                    {previewMediaUrl && (
                      <span className="text-[10px] text-emerald-600 font-extrabold bg-emerald-50 px-3 py-1 rounded-md max-w-[250px] truncate block border border-emerald-100">
                        ✓ {uploadedFile ? uploadedFile.name : 'Using current media file'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Tagline Badge & Tagline Color */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Pulsing Badge Tagline</label>
                  <input
                    type="text"
                    value={formBadgeText}
                    onChange={(e) => setFormBadgeText(e.target.value)}
                    placeholder="e.g. India's 1st Healthy Food Platform"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#3d3f96]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Tagline Accent Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formTaglineColor}
                      onChange={(e) => setFormTaglineColor(e.target.value)}
                      className="w-10 h-[38px] p-0 border-0 rounded-xl cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formTaglineColor}
                      onChange={(e) => setFormTaglineColor(e.target.value)}
                      className="flex-1 px-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3d3f96]"
                    />
                  </div>
                </div>
              </div>

              {/* Title Headline */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Title Headline *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Stable Glucose. Wholesome Flavor."
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#3d3f96]"
                />
              </div>

              {/* Subtitle Description */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Description Subtext *</label>
                <textarea
                  rows={2}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Detail the clinical target, dietitian focus, or marketing highlight..."
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#3d3f96] resize-none leading-relaxed"
                />
              </div>

              {/* Navigation Link Path */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">App Navigation Route Path</label>
                <input
                  type="text"
                  value={formLink}
                  onChange={(e) => setFormLink(e.target.value)}
                  placeholder="/food/menu"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#3d3f96]"
                />
              </div>

              {/* Opacity slider, Priority, Active Switch */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-100 items-center">
                
                {/* Opacity slider */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Dark Overlay Opacity ({formOpacity}%)</label>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    step="5"
                    value={formOpacity}
                    onChange={(e) => setFormOpacity(e.target.value)}
                    className="w-full accent-[#3d3f96] cursor-pointer h-2 bg-slate-100 rounded-lg appearance-none"
                  />
                </div>

                {/* Priority order */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Sort Priority</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value)}
                    placeholder="e.g. 1"
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#3d3f96]"
                  />
                </div>

                {/* Active Switch */}
                <div className="flex items-center gap-3 pb-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Live Active Status</span>
                  <button
                    type="button"
                    onClick={() => setFormActive(!formActive)}
                    className="focus:outline-none transition-colors duration-200 cursor-pointer inline-flex items-center"
                  >
                    {formActive ? (
                      <ToggleRight className="text-[#3d3f96]" size={28} />
                    ) : (
                      <ToggleLeft className="text-slate-300" size={28} />
                    )}
                  </button>
                </div>

              </div>

              {/* Action buttons */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={actionLoading}
                  className="px-6 py-3 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-8 py-3 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-950/10 flex items-center gap-1.5 cursor-pointer disabled:opacity-75"
                >
                  {actionLoading ? <Loader2 size={13} className="animate-spin" /> : null}
                  <span>{modalMode === 'create' ? 'Publish Slider' : 'Save Changes'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}