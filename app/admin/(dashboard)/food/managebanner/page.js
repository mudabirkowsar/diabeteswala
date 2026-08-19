"use client";

import React, { useState } from 'react';

// Initial high-fidelity banner templates matching your landing styles
const INITIAL_BANNERS = [
  {
    id: "BN-101",
    type: "video", // 'video' or 'image'
    badgeText: "India's 1st Healthy Food Platform",
    title: "Stable Glucose. Wholesome Flavor.",
    description: "Nutritional formulas designed by clinical dietitians for diabetic, pre-diabetic, and ketogenic wellness.",
    mediaUrl: "/banner-video.mp4", // Default baseline video source
    overlayOpacity: 70, // in percentage
    isActive: true,
    sortOrder: 1,
    taglineColor: "#00B574"
  },
  {
    id: "BN-102",
    type: "image",
    badgeText: "Clinical Subscription Tiffins",
    title: "Insulin-Syncing Daily Meal Subscriptions",
    description: "Portion-accurate breakfast, lunch, and dinner plans delivered fresh to secure flat blood-sugar indicators.",
    mediaUrl: "https://images.unsplash.com/photo-1543362906-acfc16c67564?w=1000&auto=format&fit=crop&q=80",
    overlayOpacity: 50,
    isActive: true,
    sortOrder: 2,
    taglineColor: "#3D3F96"
  }
];

export default function ManageBannersPage() {
  const [banners, setBanners] = useState(INITIAL_BANNERS);
  
  // Modal Configurations
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [editingId, setEditingId] = useState(null);

  // Form Fields State
  const [formType, setFormType] = useState('video');
  const [formBadgeText, setFormBadgeText] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formMediaUrl, setFormMediaUrl] = useState(''); // Holds generated local Blob Object URLs for live testing
  const [uploadedFile, setUploadedFile] = useState(null); // Holds actual raw File object
  const [formOpacity, setFormOpacity] = useState(60);
  const [formActive, setFormActive] = useState(true);
  const [formSortOrder, setFormSortOrder] = useState('1');
  const [formTaglineColor, setFormTaglineColor] = useState('#00B574');

  // Handle local file uploads and generate instant local blobs for previews
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      const objectUrl = URL.createObjectURL(file); // Generates instant local browser URL
      setFormMediaUrl(objectUrl);
    }
  };

  // Toggle active online state directly on card
  const toggleBannerStatus = (id) => {
    setBanners(prev => prev.map(b => 
      b.id === id ? { ...b, isActive: !b.isActive } : b
    ));
  };

  // Open modal for creation
  const openCreateModal = () => {
    setModalMode('create');
    resetForm();
    setIsModalOpen(true);
  };

  // Open modal pre-filled for editing
  const openEditModal = (banner) => {
    setModalMode('edit');
    setEditingId(banner.id);

    setFormType(banner.type);
    setFormBadgeText(banner.badgeText);
    setFormTitle(banner.title);
    setFormDescription(banner.description);
    setFormMediaUrl(banner.mediaUrl);
    setFormOpacity(banner.overlayOpacity);
    setFormActive(banner.isActive);
    setFormSortOrder(banner.sortOrder.toString());
    setFormTaglineColor(banner.taglineColor);
    setUploadedFile(null); // Reset uploaded file instance on edit launch

    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (modalMode === 'create') {
      const newBanner = {
        id: `BN-${Date.now()}`,
        type: formType,
        badgeText: formBadgeText,
        title: formTitle,
        description: formDescription,
        mediaUrl: formMediaUrl || '/banner-video.mp4',
        overlayOpacity: parseInt(formOpacity) || 60,
        isActive: formActive,
        sortOrder: parseInt(formSortOrder) || 1,
        taglineColor: formTaglineColor
      };
      setBanners([...banners, newBanner]);
    } else {
      setBanners(prev => prev.map(b => 
        b.id === editingId 
          ? {
              ...b,
              type: formType,
              badgeText: formBadgeText,
              title: formTitle,
              description: formDescription,
              mediaUrl: formMediaUrl,
              overlayOpacity: parseInt(formOpacity) || 60,
              isActive: formActive,
              sortOrder: parseInt(formSortOrder) || 1,
              taglineColor: formTaglineColor
            }
          : b
      ));
    }

    resetForm();
    setIsModalOpen(false);
  };

  const handleDeleteBanner = (id) => {
    if (confirm("Are you sure you want to delete this banner?")) {
      setBanners(prev => prev.filter(b => b.id !== id));
    }
  };

  const resetForm = () => {
    setFormType('video');
    setFormBadgeText('');
    setFormTitle('');
    setFormDescription('');
    setFormMediaUrl('');
    setFormOpacity(60);
    setFormActive(true);
    setFormSortOrder('1');
    setFormTaglineColor('#00B574');
    setUploadedFile(null);
    setEditingId(null);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-fade-in py-4 pb-12 text-slate-800">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center border border-[#3D3F96]/10 flex-shrink-0">
            <svg className="w-7 h-7 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Main Page Banners</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Configure layout, schedule active visibility, and preview your storefront home hero displays.</p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="px-6 py-3.5 bg-[#3D3F96] hover:bg-[#3D3F96]/95 text-white font-bold text-sm rounded-xl shadow-lg shadow-[#3D3F96]/10 flex items-center gap-2 self-start sm:self-auto"
        >
          <span>+</span>
          CREATE NEW HERO BANNER
        </button>
      </div>

      {/* ACTIVE BANNERS DIRECTORY CONTAINER */}
      <div className="space-y-6">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Active Front Page Sliders</span>
        
        {banners.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {banners.map((banner) => (
              <div 
                key={banner.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm flex flex-col justify-between"
              >
                {/* 1. REALISTIC LIVE PREVIEW CARD (Video plays live in background) */}
                <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-[#0A0B1E] flex items-center justify-center shrink-0">
                  
                  {banner.type === 'video' ? (
                    <video
                      src={banner.mediaUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover z-0"
                    />
                  ) : (
                    <img
                      src={banner.mediaUrl}
                      alt={banner.title}
                      className="absolute inset-0 w-full h-full object-cover z-0"
                    />
                  )}

                  {/* Dark transparent overlay based on opacity state */}
                  <div 
                    className="absolute inset-0 bg-black z-10 transition-opacity duration-300" 
                    style={{ opacity: banner.overlayOpacity / 100 }}
                  />

                  {/* Foreground template card details */}
                  <div className="max-w-xl mx-auto text-center px-4 relative z-20 pointer-events-none">
                    <span 
                      className="inline-flex items-center gap-1.5 bg-black/40 backdrop-blur-md text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full mb-4 border border-white/10"
                      style={{ color: banner.taglineColor }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: banner.taglineColor }} />
                      {banner.badgeText || "Dynamic Badge"}
                    </span>
                    <h2 className="text-xl sm:text-3xl font-black text-white leading-tight tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                      {banner.title || "Headline Title"}
                    </h2>
                    <p className="text-[11px] text-indigo-100 max-w-sm mx-auto leading-relaxed mt-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                      {banner.description || "Sub-description detailing health features..."}
                    </p>
                  </div>

                  {/* Scroll Down icon */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-20 text-white/50 animate-bounce text-[8px] uppercase tracking-widest">
                    <span>Swipe Up</span>
                  </div>

                  {/* Hover Tag */}
                  <span className="absolute top-4 left-4 bg-[#3D3F96] text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow z-20">
                    Type: {banner.type}
                  </span>
                </div>

                {/* 2. ADMIN CONFIGURATION ROW */}
                <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-800 text-sm">ID: {banner.id}</span>
                      <span className="text-xs text-slate-400 font-bold">• Priority Order: {banner.sortOrder}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-semibold truncate max-w-md">Media Source: {banner.mediaUrl}</p>
                  </div>

                  {/* Interactive sliders & action columns */}
                  <div className="flex items-center justify-between sm:justify-end gap-5">
                    
                    {/* Active toggle */}
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 shrink-0">
                      <span>{banner.isActive ? 'Active' : 'Offline'}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={banner.isActive} 
                          onChange={() => toggleBannerStatus(banner.id)}
                          className="sr-only peer" 
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#3D3F96]" />
                      </label>
                    </div>

                    <div className="w-px h-6 bg-slate-200 hidden sm:block" />

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button 
                        onClick={() => openEditModal(banner)}
                        className="p-2 border border-slate-200 text-slate-400 hover:text-[#3D3F96] hover:bg-[#3D3F96]/5 rounded-xl transition"
                        title="Edit Details"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDeleteBanner(banner.id)}
                        className="p-2 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        title="Delete Banner"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                  </div>

                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-24 text-center bg-white rounded-3xl border border-slate-200">
            <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="font-bold text-slate-700">No Banners Configured</p>
            <p className="text-sm text-slate-400 mt-1">There are no sliders active on the storefront. Click "+ Create" above to add one.</p>
          </div>
        )}
      </div>

      {/* CREATE & EDIT FORM OVERLAY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col animate-scale-up">
            
            {/* Modal Header */}
            <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex items-center justify-between flex-shrink-0 rounded-t-3xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center">
                  <svg className="w-4.5 h-4.5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <span className="font-bold text-slate-800 text-base">
                  {modalMode === 'create' ? 'Create Front Page Banner' : 'Edit Slider Configuration'}
                </span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus:outline-none"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleFormSubmit} className="p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto">
              
              {/* Media Selection (Pill triggers) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Banner Type</label>
                  <select
                    value={formType}
                    onChange={(e) => {
                      setFormType(e.target.value);
                      setFormMediaUrl('');
                      setUploadedFile(null);
                    }}
                    className="w-full px-3.5 py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] cursor-pointer"
                  >
                    <option value="video">🎥 Background Video Stream</option>
                    <option value="image">🖼️ Static Photo Overlay</option>
                  </select>
                </div>
                
                {/* Dashed Drag-and-Drop Media File Input zone */}
                <div className="flex flex-col justify-end">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                    {formType === 'video' ? 'Select Video File' : 'Select Photo File'}
                  </label>
                  
                  <div className="border-2 border-dashed border-slate-200 bg-slate-50 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-2.5 relative">
                    <div className="w-10 h-10 rounded-full bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center">
                      {formType === 'video' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    
                    <div>
                      <span className="block text-xs font-black text-slate-700 uppercase">
                        Upload {formType === 'video' ? 'Video File' : 'Photo Image'}
                      </span>
                      <span className="block text-[10px] text-slate-400 font-bold mt-0.5">
                        {formType === 'video' ? 'Accepts MP4, WebM up to 20MB' : 'Accepts PNG, JPG, WEBP up to 5MB'}
                      </span>
                    </div>

                    <label className="cursor-pointer bg-[#3D3F96] hover:bg-indigo-900 text-white font-extrabold text-[11px] px-4 py-2 rounded-xl shadow-md transition active:scale-95">
                      Select Local File
                      <input 
                        type="file" 
                        required={modalMode === 'create'}
                        accept={formType === 'video' ? 'video/*' : 'image/*'}
                        className="hidden" 
                        onChange={handleFileChange}
                      />
                    </label>

                    {formMediaUrl && (
                      <span className="text-[10px] text-emerald-600 font-extrabold bg-emerald-50 px-3 py-1 rounded-md max-w-[250px] truncate block mt-2 border border-emerald-100">
                        ✓ {uploadedFile ? uploadedFile.name : 'Using current media'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Tagline Badge & Tagline Color */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Pulsing Badge Tagline</label>
                  <input
                    type="text"
                    required
                    value={formBadgeText}
                    onChange={(e) => setFormBadgeText(e.target.value)}
                    placeholder="e.g. India's 1st Healthy Food Platform"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Tagline Accent Color</label>
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
                      className="flex-1 px-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3D3F96]"
                    />
                  </div>
                </div>
              </div>

              {/* Title Headline */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Title Headline</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Stable Glucose. Wholesome Flavor."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96]"
                />
              </div>

              {/* Subtitle description */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Description Subtext</label>
                <textarea
                  rows={2}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Detail the clinical target, dietitian focus, or current marketing plan..."
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] resize-none leading-relaxed"
                />
              </div>

              {/* Opacity slider, Sort Order, Availability */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
                
                {/* Opacity slider */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase">Dark Overlay Opacity ({formOpacity}%)</label>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    step="5"
                    value={formOpacity}
                    onChange={(e) => setFormOpacity(e.target.value)}
                    className="w-full accent-[#3D3F96] cursor-pointer h-2 bg-slate-100 rounded-lg appearance-none"
                  />
                </div>

                {/* Priority order */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Sort Order Priority</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(e.target.value)}
                    placeholder="e.g. 1"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96]"
                  />
                </div>

                {/* Active Switch */}
                <div className="flex flex-col justify-end pb-1.5">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500">Live Active Status</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formActive} 
                        onChange={() => setFormActive(!formActive)}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#3D3F96]" />
                    </label>
                  </div>
                </div>

              </div>

              {/* Action buttons */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-8 py-3.5 bg-[#3D3F96] hover:bg-[#3D3F96]/95 text-white font-bold text-xs rounded-xl shadow-lg shadow-[#3D3F96]/10"
                >
                  {modalMode === 'create' ? 'Add Slider' : 'Save Changes'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}