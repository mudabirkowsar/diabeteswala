"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  FaUpload, FaImages, FaUniversity, FaTrash, FaCheckCircle, 
  FaTimesCircle, FaSync, FaEdit, FaSortAmountUp, FaSortAmountDown, 
  FaRegClock, FaEnvelope, FaSlidersH, FaInbox, FaArrowRight, FaTimes, 
  FaInfoCircle, FaCheck, FaLock
} from 'react-icons/fa';

// Reusable image preview component with standard fallbacks
const ImageWithFallback = ({ src, alt, className, style, fallbackText = "Image" }) => {
  const [imgError, setImgError] = useState(false);

  if (imgError || !src) {
    return (
      <div 
        className={`bg-gray-100 flex items-center justify-center text-gray-400 rounded-xl ${className}`}
        style={{...style, minHeight: '80px'}}
      >
        <span className="text-[10px] font-bold uppercase tracking-widest">{fallbackText}</span>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt}
      className={className}
      style={style}
      onError={() => setImgError(true)}
    />
  );
};

// Standalone Mock Datasets (No API/Context dependencies)
const initialFooterContentMock = {
  easyHeading: 'Easy to Use',
  easyContent: 'Order medicines, book clinical diagnostic tests, or consult online specialists in just a few taps.',
  affordableHeading: 'Affordable Pricing',
  affordableContent: 'Get the best prices, transparent delivery fees, and pocket-friendly health packages.',
  accessibleHeading: '24/7 Accessible',
  accessibleContent: 'Our specialized diabetic-safe support desk, partner pharmacies, and diagnostic channels are active 24/7.'
};

const initialPoliciesMock = {
  privacyPolicy: "This privacy policy explains how Diabeteswala collects, uses, and safeguards your health data...",
  termsAndConditions: "By using our platform, you agree to our terms of service, clinical booking guidelines, and prescription policies..."
};

const initialBanksLogosMock = [
  { _id: "b1", name: "HDFC Bank", url: "https://images.unsplash.com/photo-1611079830570-2a88062116f1?w=200&auto=format&fit=crop", order: 0, isActive: true, uploadedAt: "2026-07-10T10:00:00.000Z" },
  { _id: "b2", name: "ICICI Bank", url: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=200&auto=format&fit=crop", order: 1, isActive: true, uploadedAt: "2026-07-11T11:00:00.000Z" },
  { _id: "b3", name: "State Bank of India", url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&auto=format&fit=crop", order: 2, isActive: true, uploadedAt: "2026-07-12T09:15:00.000Z" },
  { _id: "b4", name: "Axis Bank", url: "https://images.unsplash.com/photo-1607619056574-7b8d304a2906?w=200&auto=format&fit=crop", order: 3, isActive: false, uploadedAt: "2026-07-13T10:00:00.000Z" }
];

const FooterManagement = () => {
  const [activeTab, setActiveTab] = useState('content');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Standalone states initialized with mock data
  const [footerFormData, setFooterFormData] = useState(initialFooterContentMock);
  const [policyFormData, setPolicyFormData] = useState(initialPoliciesMock);
  const [banksLogos, setBanksLogos] = useState(initialBanksLogosMock);
  const [previewUrls, setPreviewUrls] = useState({});

  // Bank Logos multiple selection states
  const [multipleLogosFiles, setMultipleLogosFiles] = useState([]);
  const [multipleLogosPreview, setMultipleLogosPreview] = useState([]);
  const [editLogoName, setEditLogoName] = useState('');
  const [editLogoOrder, setEditLogoOrder] = useState(0);
  const [editLogoActive, setEditLogoActive] = useState(true);
  const [replaceLogoFile, setReplaceLogoFile] = useState(null);
  const [replaceLogoPreview, setReplaceLogoPreview] = useState('');

  // Modals states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [logoToDelete, setLogoToDelete] = useState(null);
  const [logoToEdit, setLogoToEdit] = useState(null);
  const [logoToReplace, setLogoToReplace] = useState(null);

  // Refs
  const fileInputRef = useRef(null);
  const replaceFileInputRef = useRef(null);

  // Theme Color Tokens based on #3D3F96
  const themeBg = "bg-[#3D3F96]";
  const themeText = "text-[#3D3F96]";
  const themeHoverBg = "hover:bg-[#2C2D75]";
  const themeShadow = "shadow-[#3D3F96]/20";
  const themeRing = "focus:ring-[#3D3F96]/30";

  // Trigger temporary success messages
  const triggerMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  // ==================== BANK LOGOS MULTIPLE HANDLERS ====================

  const handleMultipleFilesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setMultipleLogosFiles(files);
    
    // Create preview objects
    const previews = files.map((file, index) => ({
      id: Date.now() + index,
      url: URL.createObjectURL(file),
      name: file.name
    }));
    setMultipleLogosPreview(previews);
  };

  const handleMultipleLogosSubmit = (e) => {
    e.preventDefault();
    if (multipleLogosFiles.length === 0) return;

    setLoading(true);
    setTimeout(() => {
      const newUploadedLogos = multipleLogosFiles.map((file, index) => {
        const orderIndex = banksLogos.length + index;
        return {
          _id: `b_uploaded_${Date.now()}_${index}`,
          name: file.name.split('.')[0],
          url: "https://images.unsplash.com/photo-1611079830570-2a88062116f1?w=200&auto=format&fit=crop", // premium mockup logo
          order: orderIndex,
          isActive: true,
          uploadedAt: new Date().toISOString()
        };
      });

      setBanksLogos([...banksLogos, ...newUploadedLogos]);
      setMultipleLogosFiles([]);
      setMultipleLogosPreview([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setLoading(false);
      triggerMessage("Bank logos uploaded successfully!");
    }, 1200);
  };

  const handleLogoEditClick = (logo) => {
    setLogoToEdit(logo);
    setEditLogoName(logo.name || '');
    setEditLogoOrder(logo.order || 0);
    setEditLogoActive(logo.isActive !== undefined ? logo.isActive : true);
    setShowEditModal(true);
  };

  const handleUpdateLogo = () => {
    if (!logoToEdit) return;

    setLoading(true);
    setTimeout(() => {
      setBanksLogos(prev => prev.map(logo => {
        if (logo._id === logoToEdit._id) {
          return {
            ...logo,
            name: editLogoName,
            order: editLogoOrder,
            isActive: editLogoActive
          };
        }
        return logo;
      }));
      setShowEditModal(false);
      setLoading(false);
      triggerMessage("Logo parameters updated!");
    }, 800);
  };

  const handleLogoReplaceClick = (logo) => {
    setLogoToReplace(logo);
    setReplaceLogoFile(null);
    setReplaceLogoPreview('');
    setShowReplaceModal(true);
  };

  const handleReplaceFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReplaceLogoFile(file);
      setReplaceLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleReplaceLogoImage = () => {
    if (!logoToReplace || !replaceLogoFile) return;

    setLoading(true);
    setTimeout(() => {
      setBanksLogos(prev => prev.map(logo => {
        if (logo._id === logoToReplace._id) {
          return {
            ...logo,
            url: replaceLogoPreview // update local preview
          };
        }
        return logo;
      }));
      setShowReplaceModal(false);
      setLoading(false);
      triggerMessage("Logo image replaced successfully!");
    }, 1000);
  };

  const handleDeleteLogoClick = (logoId) => {
    setLogoToDelete(logoId);
    setShowDeleteModal(true);
  };

  const handleConfirmDeleteLogo = () => {
    setLoading(true);
    setTimeout(() => {
      setBanksLogos(prev => prev.filter(logo => logo._id !== logoToDelete));
      setShowDeleteModal(false);
      setLoading(false);
      triggerMessage("Logo deleted successfully!");
    }, 800);
  };

  const handleDeleteAllLogos = () => {
    setLoading(true);
    setTimeout(() => {
      setBanksLogos([]);
      setShowDeleteAllModal(false);
      setLoading(false);
      triggerMessage("All logos deleted successfully!");
    }, 1000);
  };

  // Reorder logos (Move Up)
  const handleMoveLogoUp = (logoId, currentOrder) => {
    if (currentOrder <= 0) return;
    
    setLoading(true);
    setTimeout(() => {
      setBanksLogos(prev => {
        const sorted = [...prev].sort((a, b) => a.order - b.order);
        const currentIndex = sorted.findIndex(l => l._id === logoId);
        if (currentIndex > 0) {
          // Swap orders
          const tempOrder = sorted[currentIndex].order;
          sorted[currentIndex].order = sorted[currentIndex - 1].order;
          sorted[currentIndex - 1].order = tempOrder;
        }
        return sorted;
      });
      setLoading(false);
      triggerMessage("Logo order updated!");
    }, 400);
  };

  // Reorder logos (Move Down)
  const handleMoveLogoDown = (logoId, currentOrder) => {
    if (currentOrder >= banksLogos.length - 1) return;
    
    setLoading(true);
    setTimeout(() => {
      setBanksLogos(prev => {
        const sorted = [...prev].sort((a, b) => a.order - b.order);
        const currentIndex = sorted.findIndex(l => l._id === logoId);
        if (currentIndex !== -1 && currentIndex < sorted.length - 1) {
          // Swap orders
          const tempOrder = sorted[currentIndex].order;
          sorted[currentIndex].order = sorted[currentIndex + 1].order;
          sorted[currentIndex + 1].order = tempOrder;
        }
        return sorted;
      });
      setLoading(false);
      triggerMessage("Logo order updated!");
    }, 400);
  };

  // Toggle single logo active state directly from card switcher
  const handleToggleLogoActive = (logoId, currentActive) => {
    setBanksLogos(prev => prev.map(logo => {
      if (logo._id === logoId) {
        return { ...logo, isActive: !currentActive };
      }
      return logo;
    }));
    triggerMessage("Status updated!");
  };

  // ==================== EXISTING SUBMIT HANDLERS ====================

  const handleFooterInputChange = (e) => {
    const { name, value } = e.target;
    setFooterFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePolicyInputChange = (e) => { // FIXED: Added missing policy input change handler
    const { name, value } = e.target;
    setPolicyFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreviewUrls(prev => ({
        ...prev,
        [fieldName]: previewUrl
      }));
    }
  };

  const handleFooterSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPreviewUrls({});
      triggerMessage("Footer content updated successfully (Mock Mode)!");
    }, 1200);
  };

  const handlePolicySubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      triggerMessage("Policies updated successfully (Mock Mode)!");
    }, 1000);
  };

  // ==================== RENDER SECTIONS ====================

  const renderFooterSectionInput = (title, prefix) => {
    const displayImage = previewUrls[`${prefix}Icon`];
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-gray-50 pb-2">{title}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Heading</label>
            <input 
              type="text" 
              name={`${prefix}Heading`}
              value={footerFormData[`${prefix}Heading`]}
              onChange={handleFooterInputChange}
              placeholder={`Enter ${title.toLowerCase()} heading`}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 focus:ring-[#3D3F96]/30 transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Content</label>
            <textarea 
              rows="3"
              name={`${prefix}Content`}
              value={footerFormData[`${prefix}Content`]}
              onChange={handleFooterInputChange}
              placeholder={`Enter ${title.toLowerCase()} content`}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 focus:ring-[#3D3F96]/30 transition-all resize-none"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Icon Image</label>
            <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-[#3D3F96] bg-gray-50/50 rounded-2xl p-5 cursor-pointer transition-colors group">
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => handleFileChange(e, `${prefix}Icon`)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              />
              <FaUpload className="text-2xl text-gray-400 group-hover:text-[#3D3F96] transition-colors mb-2" />
              <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900 transition-colors">Choose Icon File</span>
              <span className="text-[9px] text-gray-400 mt-1 uppercase font-bold tracking-widest">PNG, JPG, JPEG, SVG</span>
            </div>
          </div>
          {displayImage ? (
            <div className="flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Icon Preview</span>
              <div className="h-20 w-20 overflow-hidden rounded-xl border border-gray-100 shadow-sm bg-gray-50">
                <ImageWithFallback src={displayImage} alt="Icon preview" className="w-full h-full object-contain" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center">
              <FaImages className="text-3xl text-gray-300 mb-1" />
              <span className="text-xs text-gray-400 font-semibold">No icon uploaded yet</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-8 select-none animate-fadeIn">
      
      {/* PAGE HEADER TITLE */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center shrink-0">
            <FaSlidersH className="text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-800 tracking-tight leading-snug">Footer Content Management</h2>
            <p className="text-xs text-gray-400">Configure global footer details, banks logos, and platform policy declarations</p>
          </div>
        </div>
      </div>

      {/* ALERT MESSAGES */}
      {message && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3.5 text-emerald-700">
          <FaCheckCircle className="text-base shrink-0 mt-0.5" />
          <span className="text-xs font-semibold">{message}</span>
        </div>
      )}

      {/* PREMIUM TAB SWITCHER */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-wrap gap-2.5">
        <button
          onClick={() => { setActiveTab("content"); setMessage(''); }}
          className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all focus:outline-none ${
            activeTab === "content" ? `${themeBg} text-white shadow-lg ${themeShadow}` : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
          }`}
        >
          📱 Footer Content
        </button>
        <button
          onClick={() => { setActiveTab("bank-logos"); setMessage(''); }}
          className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all focus:outline-none ${
            activeTab === "bank-logos" ? `${themeBg} text-white shadow-lg ${themeShadow}` : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
          }`}
        >
          🏦 Bank Logos
        </button>
        <button
          onClick={() => { setActiveTab("policies"); setMessage(''); }}
          className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all focus:outline-none ${
            activeTab === "policies" ? `${themeBg} text-white shadow-lg ${themeShadow}` : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
          }`}
        >
          📄 Policies
        </button>
      </div>

      {/* TAB PANEL CONTENTS */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
        
        {/* TAB 1: FOOTER CONTENT */}
        {activeTab === "content" && (
          <form onSubmit={handleFooterSubmit} className="space-y-6 animate-fadeIn">
            {renderFooterSectionInput('Easy to Use', 'easy')}
            {renderFooterSectionInput('Affordable Pricing', 'affordable')}
            {renderFooterSectionInput('24/7 Accessible', 'accessible')}

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={loading}
                className={`w-full sm:w-auto flex items-center justify-center gap-1.5 text-white font-bold px-8 py-3 rounded-xl text-sm transition-all focus:outline-none ${themeBg} ${themeHoverBg} ${themeShadow} shadow-lg`}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    Update Footer Content <FaArrowRight />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: BANK LOGOS */}
        {activeTab === "bank-logos" && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Multiple Logo Uploading Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider pb-2 border-b border-gray-50">Upload Multiple Bank Logos</h3>
              
              <form onSubmit={handleMultipleLogosSubmit} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Bank Logo Files</label>
                  <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-[#3D3F96] bg-gray-50/50 rounded-2xl p-5 cursor-pointer transition-colors group">
                    <input 
                      type="file" 
                      id="excel-file" 
                      accept="image/*" 
                      multiple 
                      onChange={handleMultipleFilesChange} 
                      disabled={loading}
                      ref={fileInputRef}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    />
                    <FaUpload className="text-2xl text-gray-400 group-hover:text-[#3D3F96] transition-colors mb-2" />
                    <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900 transition-colors">Choose Bank Files</span>
                    <span className="text-[9px] text-gray-400 mt-1 uppercase font-bold tracking-widest">Supports PNG, JPG, JPEG, SVG (Multiple files)</span>
                  </div>
                </div>

                {/* Local files queues previews */}
                {multipleLogosPreview.length > 0 && (
                  <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5"><FaCheckCircle /> {multipleLogosPreview.length} Logos Ready to Upload</span>
                      <button 
                        type="button" 
                        onClick={() => { setMultipleLogosFiles([]); setMultipleLogosPreview([]); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                        className="text-xs font-bold text-rose-500 hover:underline focus:outline-none"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                      {multipleLogosPreview.map((preview, idx) => (
                        <div key={preview.id} className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm text-center flex flex-col items-center justify-center">
                          <div className="w-12 h-12 overflow-hidden mb-1">
                            <img src={preview.url} alt="p" className="w-full h-full object-contain" />
                          </div>
                          <span className="text-[9px] font-bold text-gray-400 block truncate max-w-full">{preview.name}</span>
                          <span className="mt-1 text-[8px] font-black uppercase bg-indigo-50 text-[#3D3F96] px-1.5 py-0.5 rounded">Slot {idx+1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button 
                    type="submit" 
                    disabled={loading || multipleLogosFiles.length === 0}
                    className={`w-full sm:w-auto flex items-center justify-center gap-1.5 text-white font-bold px-8 py-3 rounded-xl text-sm transition-all focus:outline-none ${themeBg} ${themeHoverBg} ${themeShadow} shadow-lg disabled:opacity-50`}
                  >
                    Upload {multipleLogosFiles.length} Logos
                  </button>
                </div>
              </form>
            </div>

            {/* Displaying Current Logos */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-gray-50 pb-3 flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <FaUniversity className="text-gray-400" />
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Current Bank Logos</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600">{banksLogos.length} Total</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">{banksLogos.filter(l => l.isActive).length} Active</span>
                </div>
                {banksLogos.length > 0 && (
                  <button 
                    onClick={() => setShowDeleteAllModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all focus:outline-none"
                  >
                    <FaTrash /> Delete All
                  </button>
                )}
              </div>

              {/* Logos Grid list */}
              {banksLogos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {banksLogos
                    .sort((a, b) => a.order - b.order)
                    .map((logo, index) => (
                      <div key={logo._id || index} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200">
                        {/* Image wrapper */}
                        <div className="relative w-full h-24 bg-gray-50 flex items-center justify-center p-4 border-b border-gray-100 rounded-xl mb-3 shrink-0">
                          <img src={logo.url} alt={logo.name} className="max-h-full max-w-full object-contain" />
                          <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${logo.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>
                            {logo.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 text-[#3D3F96] border border-indigo-100">
                            #{index + 1}
                          </span>
                        </div>

                        {/* Logo editable parameters */}
                        <div className="space-y-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Logo Name</span>
                            <span className="text-xs font-bold text-gray-800">{logo.name}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-500 pt-2 border-t border-gray-50">
                            <div className="flex items-center gap-1.5">
                              {/* Direct active status flip switch */}
                              <button 
                                onClick={() => handleToggleLogoActive(logo._id, logo.isActive)}
                                className={`w-3.5 h-3.5 rounded border transition-colors flex items-center justify-center shrink-0 ${logo.isActive ? 'bg-[#3D3F96] border-[#3D3F96] text-white' : 'border-gray-300 bg-white'}`}
                              >
                                {logo.isActive && <FaCheck className="text-[8px]" />} {/* FIXED: Imported FaCheck to solve reference error */}
                              </button>
                              <span>Active</span>
                            </div>
                            <span className="text-right text-[10px] text-gray-400 font-bold">Order: {logo.order}</span>
                          </div>

                          {/* Quick sorting and edit controls */}
                          <div className="flex items-center justify-center gap-1 border-t border-gray-50 pt-2">
                            <button onClick={() => handleLogoEditClick(logo)} className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-700" title="Edit"><FaEdit className="text-[10px]" /></button>
                            <button onClick={() => handleLogoReplaceClick(logo)} className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-700" title="Replace"><FaUpload className="text-[10px]" /></button>
                            <button onClick={() => handleMoveLogoUp(logo._id, logo.order)} disabled={logo.order === 0} className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-700 disabled:opacity-30"><FaSortAmountUp className="text-[10px]" /></button>
                            <button onClick={() => handleMoveLogoDown(logo._id, logo.order)} disabled={logo.order >= banksLogos.length - 1} className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-700 disabled:opacity-30"><FaSortAmountDown className="text-[10px]" /></button>
                            <button onClick={() => handleDeleteLogoClick(logo._id)} className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500" title="Delete"><FaTrash className="text-[10px]" /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-12 gap-3">
                  <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                    <FaInbox className="text-2xl" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-700">No Bank Logos Found</h4>
                    <p className="text-xs text-slate-400 mt-1">Upload files using the multi-uploader card above.</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: POLICIES */}
        {activeTab === "policies" && (
          <form onSubmit={handlePolicySubmit} className="space-y-6 animate-fadeIn">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Privacy Policy</label>
              <textarea 
                rows="8"
                name="privacyPolicy"
                value={policyFormData.privacyPolicy}
                onChange={handlePolicyInputChange} // FIXED: Defined handlePolicyInputChange function to solve reference error
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 focus:ring-[#3D3F96]/30 transition-all resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Terms and Conditions</label>
              <textarea 
                rows="8"
                name="termsAndConditions"
                value={policyFormData.termsAndConditions}
                onChange={handlePolicyInputChange} // FIXED: Defined handlePolicyInputChange function to solve reference error
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 focus:ring-[#3D3F96]/30 transition-all resize-none"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={loading}
                className={`w-full sm:w-auto flex items-center justify-center gap-1.5 text-white font-bold px-8 py-3 rounded-xl text-sm transition-all focus:outline-none ${themeBg} ${themeHoverBg} ${themeShadow} shadow-lg`}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    Update Policies <FaArrowRight />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>

      {/* Delete Single Logo Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-gray-100 p-6 text-center animate-in zoom-in-95 duration-200">
            <FaTrash className="text-rose-500 text-4xl mx-auto mb-3" />
            <h3 className="text-lg font-black text-gray-800 mb-2">Delete Logo?</h3>
            <p className="text-gray-500 text-xs font-medium mb-6">Are you sure you want to delete this bank logo? This action cannot be undone.</p>
            <div className="flex gap-4">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 text-sm font-bold text-gray-400 focus:outline-none">Cancel</button>
              <button onClick={handleConfirmDeleteLogo} className="flex-1 py-3 bg-rose-600 text-white text-sm font-bold rounded-xl active:scale-95 focus:outline-none">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Logos Modal */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-gray-100 p-6 text-center animate-in zoom-in-95 duration-200">
            <FaTrash className="text-rose-500 text-4xl mx-auto mb-3 animate-bounce" />
            <h3 className="text-lg font-black text-gray-800 mb-2">Delete All Logos?</h3>
            <p className="text-gray-500 text-xs font-medium mb-6">Are you sure you want to delete ALL bank logos? This will permanently delete {banksLogos.length} logo(s).</p>
            <div className="flex gap-4">
              <button onClick={() => setShowDeleteAllModal(false)} className="flex-1 py-3 text-sm font-bold text-gray-400 focus:outline-none">Cancel</button>
              <button onClick={handleDeleteAllLogos} className="flex-1 py-3 bg-rose-600 text-white text-sm font-bold rounded-xl active:scale-95 focus:outline-none">Delete All</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Logo Modal */}
      {showEditModal && logoToEdit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 p-6 relative flex flex-col gap-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 shrink-0">
              <h3 className="text-base font-black uppercase tracking-wider text-gray-800">Edit Logo Details</h3>
              <button onClick={() => setShowEditModal(false)} className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-400 flex items-center justify-center focus:outline-none"><FaTimes /></button>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Logo Name</label>
                <input 
                  type="text" 
                  value={editLogoName}
                  onChange={(e) => setEditLogoName(e.target.value)}
                  placeholder="Enter logo name"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 focus:ring-[#3D3F96]/30 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Order Position</label>
                  <select 
                    value={editLogoOrder}
                    onChange={(e) => setEditLogoOrder(parseInt(e.target.value))}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] transition-all cursor-pointer"
                  >
                    {banksLogos.map((_, idx) => (
                      <option key={idx} value={idx}>{idx + 1}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status</label>
                  <select 
                    value={editLogoActive ? 'active' : 'inactive'}
                    onChange={(e) => setEditLogoActive(e.target.value === 'active')}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] transition-all cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-4 shrink-0">
              <button type="button" onClick={() => setShowEditModal(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold uppercase tracking-wider focus:outline-none">Cancel</button>
              <button onClick={handleUpdateLogo} className={`flex items-center gap-1.5 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider focus:outline-none ${themeBg} ${themeHoverBg}`}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Replace Logo Image Modal */}
      {showReplaceModal && logoToReplace && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 p-6 relative flex flex-col gap-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 shrink-0">
              <h3 className="text-base font-black uppercase tracking-wider text-gray-800">Replace Logo Image</h3>
              <button onClick={() => setShowReplaceModal(false)} className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-400 flex items-center justify-center focus:outline-none"><FaTimes /></button>
            </div>
            <div className="space-y-4 text-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider mb-2">Current Logo</span>
              <div className="h-16 w-28 overflow-hidden rounded-xl border border-gray-100 shadow-sm mx-auto mb-4">
                <img src={logoToReplace.url} alt="Current" className="w-full h-full object-contain" />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider text-left">Select New Image</label>
                <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-[#3D3F96] bg-gray-50/50 rounded-2xl p-5 cursor-pointer transition-colors group">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleReplaceFileChange}
                    ref={replaceFileInputRef}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  />
                  <FaUpload className="text-2xl text-gray-400 group-hover:text-[#3D3F96] transition-colors mb-2" />
                  <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900 transition-colors">Choose New Logo File</span>
                </div>
              </div>
              
              {replaceLogoPreview && (
                <div className="mt-4">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider mb-2">New Preview</span>
                  <div className="h-16 w-28 overflow-hidden rounded-xl border border-gray-100 shadow-sm mx-auto">
                    <img src={replaceLogoPreview} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-4 shrink-0">
              <button type="button" onClick={() => setShowReplaceModal(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold uppercase tracking-wider focus:outline-none">Cancel</button>
              <button onClick={handleReplaceLogoImage} disabled={!replaceLogoFile} className={`flex items-center gap-1.5 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider focus:outline-none disabled:opacity-50 ${themeBg} ${themeHoverBg}`}>Replace Image</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FooterManagement;