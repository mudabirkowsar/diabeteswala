"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Store,
  Pencil,
  Eye,
  Save,
  X,
  Phone,
  Mail,
  MapPin,
  Clock,
  Truck,
  Building,
  CreditCard,
  FileText,
  UploadCloud,
  Loader2,
  ExternalLink,
  Info,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

import ClinicAPI from '../../../../../services/ClinicAPI'; // Adjust path according to your structure

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.1.7:5002';

const getImageUrl = (path) => {
  if (!path) return 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&q=80&w=200';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:') || path.startsWith('data:')) {
    return path;
  }
  const cleanBase = BACKEND_URL.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

export default function ViewClinicPharmacy({ pharmacyId, onClose, onPharmacyUpdated }) {
  const [mounted, setMounted] = useState(false);
  const [pharmacy, setPharmacy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'location' | 'licensing' | 'banking' | 'documents'

  const [errorMessage, setErrorMessage] = useState(null);
  const [successInfo, setSuccessInfo] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    alternatePhone: '',
    about: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    isHomeDeliveryAvailable: false,
    is24x7: false,

    // Legal
    cinNumber: '',
    gstNumber: '',
    tanNumber: '',
    panNumber: '',
    drugLicenseNumber: '',
    foodLicenseNumber: '',
    documentState: '',
    issuingAuthority: '',
    drugLicenseType: 'Retail',

    // Bank
    accountType: 'Current',
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: ''
  });

  const [newFiles, setNewFiles] = useState({
    profileImage: null,
    signatureImage: null
  });

  const [mediaPreviews, setMediaPreviews] = useState({
    profileImage: null,
    signatureImage: null
  });

  // Fetch full details
  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';

    const loadDetails = async () => {
      try {
        setLoading(true);
        const res = await ClinicAPI.getPharmacyDetails(pharmacyId);
        if (res?.success && res.data) {
          const p = res.data;
          setPharmacy(p);
          setFormData({
            name: p.name || '',
            phone: p.phone || '',
            email: p.email || '',
            alternatePhone: p.alternatePhone || '',
            about: p.about || '',
            address: p.address || '',
            city: p.city || '',
            state: p.state || '',
            country: p.country || 'India',
            isHomeDeliveryAvailable: !!p.isHomeDeliveryAvailable,
            is24x7: !!p.is24x7,

            cinNumber: p.documents?.cinNumber || '',
            gstNumber: p.documents?.gstNumber || '',
            tanNumber: p.documents?.tanNumber || '',
            panNumber: p.documents?.panNumber || '',
            drugLicenseNumber: p.documents?.drugLicenseNumber || '',
            foodLicenseNumber: p.documents?.foodLicenseNumber || '',
            documentState: p.documents?.documentState || '',
            issuingAuthority: p.documents?.issuingAuthority || '',
            drugLicenseType: p.documents?.drugLicenseType || 'Retail',

            accountType: p.bankDetails?.accountType || 'Current',
            bankName: p.bankDetails?.bankName || '',
            accountHolderName: p.bankDetails?.accountHolderName || '',
            accountNumber: p.bankDetails?.accountNumber || '',
            ifscCode: p.bankDetails?.ifscCode || '',
            upiId: p.bankDetails?.upiId || ''
          });

          setMediaPreviews({
            profileImage: p.profileImage ? getImageUrl(p.profileImage) : null,
            signatureImage: p.documents?.signatureImage ? getImageUrl(p.documents.signatureImage) : null
          });
        }
      } catch (err) {
        console.error("Failed to load pharmacy details:", err);
        setErrorMessage("Could not load full pharmacy record.");
      } finally {
        setLoading(false);
      }
    };

    loadDetails();

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [pharmacyId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (field, e) => {
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
    setSuccessInfo(null);

    try {
      const payload = new FormData();

      if (formData.name) payload.append('name', formData.name.trim());
      if (formData.phone) payload.append('phone', formData.phone.trim());
      if (formData.email) payload.append('email', formData.email.trim());
      if (formData.alternatePhone) payload.append('alternatePhone', formData.alternatePhone.trim());
      if (formData.about) payload.append('about', formData.about.trim());
      payload.append('isHomeDeliveryAvailable', String(formData.isHomeDeliveryAvailable));
      payload.append('is24x7', String(formData.is24x7));

      // Address
      if (formData.address) payload.append('address', formData.address.trim());
      if (formData.city) payload.append('city', formData.city.trim());
      if (formData.state) payload.append('state', formData.state.trim());
      if (formData.country) payload.append('country', formData.country.trim());

      // Legal & License
      if (formData.cinNumber) payload.append('cinNumber', formData.cinNumber.trim());
      if (formData.gstNumber) payload.append('gstNumber', formData.gstNumber.trim());
      if (formData.tanNumber) payload.append('tanNumber', formData.tanNumber.trim());
      if (formData.panNumber) payload.append('panNumber', formData.panNumber.trim());
      if (formData.drugLicenseNumber) payload.append('drugLicenseNumber', formData.drugLicenseNumber.trim());
      if (formData.foodLicenseNumber) payload.append('foodLicenseNumber', formData.foodLicenseNumber.trim());
      if (formData.documentState) payload.append('documentState', formData.documentState.trim());
      if (formData.issuingAuthority) payload.append('issuingAuthority', formData.issuingAuthority.trim());
      if (formData.drugLicenseType) payload.append('drugLicenseType', formData.drugLicenseType);

      // Bank JSON
      const bankDetailsObj = {
        accountType: formData.accountType,
        bankName: formData.bankName.trim(),
        accountHolderName: formData.accountHolderName.trim(),
        accountNumber: formData.accountNumber.trim(),
        ifscCode: formData.ifscCode.trim(),
        upiId: formData.upiId.trim()
      };
      payload.append('bankDetails', JSON.stringify(bankDetailsObj));

      // Replacements
      if (newFiles.profileImage) payload.append('profileImage', newFiles.profileImage);
      if (newFiles.signatureImage) payload.append('signatureImage', newFiles.signatureImage);

      const response = await ClinicAPI.updatePharmacy(pharmacyId, payload);

      if (response?.success) {
        const updatedRecord = response.data?.updatedFields || response.data || {
          ...pharmacy,
          ...formData
        };

        onPharmacyUpdated(updatedRecord, response.message);
        setIsEditing(false);
        setSuccessInfo(response.message || "Changes saved successfully.");
      } else {
        setErrorMessage(response?.message || "Failed to update pharmacy details.");
      }
    } catch (err) {
      console.error("Error updating pharmacy:", err);
      setErrorMessage(err.response?.data?.message || err.message || "Failed to save updates.");
    } finally {
      setSaving(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-md">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* --- HEADER --- */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3.5">
            <img
              src={mediaPreviews.profileImage || getImageUrl(pharmacy?.profileImage)}
              alt="Pharmacy"
              className="w-12 h-12 rounded-2xl object-cover border border-slate-100 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 leading-tight">{formData.name || 'Pharmacy Profile'}</h3>
                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                  pharmacy?.profileStatus === 'Approved'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-amber-50 text-amber-600'
                }`}>
                  {pharmacy?.profileStatus || 'Pending'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                License: {formData.drugLicenseNumber || 'N/A'} • {formData.city || 'Location N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsEditing(!isEditing);
                setSuccessInfo(null);
                setErrorMessage(null);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isEditing
                  ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                  : 'bg-indigo-50 text-[#3D3F96] border border-indigo-100 hover:bg-indigo-100'
              }`}
            >
              {isEditing ? <><Eye size={13} /> View Mode</> : <><Pencil size={13} /> Edit Details</>}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* --- TABS --- */}
        <div className="px-6 bg-slate-50/80 border-b border-slate-100 flex gap-2 overflow-x-auto shrink-0 py-2">
          {[
            { key: 'overview', label: 'Store Overview' },
            { key: 'location', label: 'Address & Delivery' },
            { key: 'licensing', label: 'Drug Licensing' },
            { key: 'banking', label: 'Bank Settlements' },
            { key: 'documents', label: 'Documents & Sign' }
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-[#3D3F96] shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* --- NOTICES --- */}
        {successInfo && (
          <div className="mx-6 mt-3 p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 text-[#3D3F96] text-xs font-semibold flex items-center gap-2.5">
            <Info size={16} className="shrink-0" />
            <span className="flex-1">{successInfo}</span>
            <button onClick={() => setSuccessInfo(null)} className="text-indigo-400 hover:text-indigo-700"><X size={13} /></button>
          </div>
        )}

        {errorMessage && (
          <div className="mx-6 mt-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-rose-700"><X size={13} /></button>
          </div>
        )}

        {/* --- TAB BODY --- */}
        <form id="view-pharmacy-form" onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-slate-50/30">
          
          {loading ? (
            <div className="py-20 text-center text-slate-400">
              <Loader2 className="animate-spin text-2xl mx-auto mb-2 text-[#3D3F96]" size={24} />
              <span className="text-xs font-medium">Loading pharmacy details...</span>
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#3D3F96] border-b border-slate-100 pb-3">
                    Pharmacy Store Profile
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">Display Store Name</label>
                      {isEditing ? (
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-white outline-none focus:border-[#3D3F96]" />
                      ) : (
                        <p className="text-xs font-bold text-slate-800 py-1.5">{formData.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">Contact Phone</label>
                      {isEditing ? (
                        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-white outline-none focus:border-[#3D3F96]" />
                      ) : (
                        <p className="text-xs font-bold text-slate-800 py-1.5 flex items-center gap-1.5"><Phone size={12} className="text-slate-400" /> {formData.phone}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">Email Address</label>
                      {isEditing ? (
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-white outline-none focus:border-[#3D3F96]" />
                      ) : (
                        <p className="text-xs font-bold text-slate-800 py-1.5 flex items-center gap-1.5"><Mail size={12} className="text-slate-400" /> {formData.email || 'N/A'}</p>
                      )}
                    </div>

                    <div className="md:col-span-3">
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">About Store</label>
                      {isEditing ? (
                        <textarea rows={2} name="about" value={formData.about} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-white outline-none focus:border-[#3D3F96]" />
                      ) : (
                        <p className="text-xs text-slate-700 py-1.5">{formData.about || 'No description provided.'}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ADDRESS & DELIVERY */}
              {activeTab === 'location' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#3D3F96] border-b border-slate-100 pb-3">
                    Store Location & Logistics
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck className="text-[#3D3F96]" size={18} />
                        <span className="text-xs font-bold text-slate-800">Home Delivery Support</span>
                      </div>
                      {isEditing ? (
                        <input type="checkbox" name="isHomeDeliveryAvailable" checked={formData.isHomeDeliveryAvailable} onChange={handleInputChange} className="w-4 h-4 rounded text-[#3D3F96]" />
                      ) : (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${formData.isHomeDeliveryAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                          {formData.isHomeDeliveryAvailable ? 'Enabled' : 'Disabled'}
                        </span>
                      )}
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="text-amber-600" size={18} />
                        <span className="text-xs font-bold text-slate-800">24x7 Operations</span>
                      </div>
                      {isEditing ? (
                        <input type="checkbox" name="is24x7" checked={formData.is24x7} onChange={handleInputChange} className="w-4 h-4 rounded text-[#3D3F96]" />
                      ) : (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${formData.is24x7 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                          {formData.is24x7 ? '24x7 Active' : 'Standard Hours'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-3">
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">Street Address</label>
                      {isEditing ? (
                        <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-white outline-none focus:border-[#3D3F96]" />
                      ) : (
                        <p className="text-xs font-bold text-slate-800">{formData.address || 'N/A'}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">City</label>
                      {isEditing ? (
                        <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-white" />
                      ) : (
                        <p className="text-xs font-bold text-slate-800">{formData.city || 'N/A'}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">State</label>
                      {isEditing ? (
                        <input type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-white" />
                      ) : (
                        <p className="text-xs font-bold text-slate-800">{formData.state || 'N/A'}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">Country</label>
                      {isEditing ? (
                        <input type="text" name="country" value={formData.country} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-white" />
                      ) : (
                        <p className="text-xs font-bold text-slate-800">{formData.country || 'India'}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: LICENSING */}
              {activeTab === 'licensing' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#3D3F96] border-b border-slate-100 pb-3">
                    Drug Licensing & Legal Compliance
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">Drug License No.</label>
                      {isEditing ? (
                        <input type="text" name="drugLicenseNumber" value={formData.drugLicenseNumber} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-white" />
                      ) : (
                        <p className="text-xs font-bold text-slate-800">{formData.drugLicenseNumber || 'N/A'}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">License Type</label>
                      {isEditing ? (
                        <select name="drugLicenseType" value={formData.drugLicenseType} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-white">
                          <option value="Retail">Retail</option>
                          <option value="Wholesale">Wholesale</option>
                          <option value="Restricted">Restricted</option>
                          <option value="Blood Bank">Blood Bank</option>
                          <option value="None">None</option>
                        </select>
                      ) : (
                        <p className="text-xs font-bold text-slate-800">{formData.drugLicenseType || 'Retail'}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">FSSAI License No.</label>
                      {isEditing ? (
                        <input type="text" name="foodLicenseNumber" value={formData.foodLicenseNumber} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-white" />
                      ) : (
                        <p className="text-xs font-bold text-slate-800">{formData.foodLicenseNumber || 'N/A'}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">GSTIN</label>
                      {isEditing ? (
                        <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-white" />
                      ) : (
                        <p className="text-xs font-bold text-slate-800">{formData.gstNumber || 'N/A'}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">PAN Card</label>
                      {isEditing ? (
                        <input type="text" name="panNumber" value={formData.panNumber} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-white" />
                      ) : (
                        <p className="text-xs font-bold text-slate-800">{formData.panNumber || 'N/A'}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">Issuing Authority</label>
                      {isEditing ? (
                        <input type="text" name="issuingAuthority" value={formData.issuingAuthority} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-white" />
                      ) : (
                        <p className="text-xs font-bold text-slate-800">{formData.issuingAuthority || 'N/A'}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: BANKING */}
              {activeTab === 'banking' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#3D3F96] border-b border-slate-100 pb-3">
                    Bank Accounts & Settlement Details
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">Bank Name</label>
                      {isEditing ? (
                        <input type="text" name="bankName" value={formData.bankName} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-white" />
                      ) : (
                        <p className="text-xs font-bold text-slate-800">{formData.bankName || 'N/A'}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">Account Holder</label>
                      {isEditing ? (
                        <input type="text" name="accountHolderName" value={formData.accountHolderName} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-white" />
                      ) : (
                        <p className="text-xs font-bold text-slate-800">{formData.accountHolderName || 'N/A'}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">Account Number</label>
                      {isEditing ? (
                        <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-white" />
                      ) : (
                        <p className="text-xs font-bold text-slate-800">{formData.accountNumber || 'N/A'}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">IFSC Code</label>
                      {isEditing ? (
                        <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-white" />
                      ) : (
                        <p className="text-xs font-bold text-slate-800">{formData.ifscCode || 'N/A'}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">UPI ID</label>
                      {isEditing ? (
                        <input type="text" name="upiId" value={formData.upiId} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-white" />
                      ) : (
                        <p className="text-xs font-bold text-slate-800">{formData.upiId || 'N/A'}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: DOCUMENTS & SIGNATURE */}
              {activeTab === 'documents' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#3D3F96] border-b border-slate-100 pb-3">
                    Verification Documents & Media
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Storefront Image */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                      <span className="text-xs font-bold text-slate-700 block">Pharmacy Storefront</span>
                      <div className="flex items-center gap-3">
                        <img
                          src={mediaPreviews.profileImage}
                          alt="Storefront"
                          className="w-16 h-16 rounded-xl object-cover border bg-white"
                        />
                        <div className="flex-1 min-w-0">
                          {mediaPreviews.profileImage && (
                            <a href={mediaPreviews.profileImage} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#3D3F96] hover:underline flex items-center gap-1">
                              <ExternalLink size={11} /> Open Photo
                            </a>
                          )}
                          {isEditing && (
                            <label className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer">
                              <UploadCloud size={12} /> Replace Storefront
                              <input type="file" accept="image/*" onChange={(e) => handleFileChange('profileImage', e)} className="hidden" />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Signature / Stamp */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                      <span className="text-xs font-bold text-slate-700 block">Authorized Signatory Stamp</span>
                      <div className="flex items-center gap-3">
                        {mediaPreviews.signatureImage ? (
                          <img src={mediaPreviews.signatureImage} alt="Stamp" className="w-16 h-16 rounded-xl object-contain bg-white border p-1" />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-white border flex items-center justify-center text-slate-300 text-xs">None</div>
                        )}
                        <div className="flex-1 min-w-0">
                          {mediaPreviews.signatureImage && (
                            <a href={mediaPreviews.signatureImage} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#3D3F96] hover:underline flex items-center gap-1">
                              <ExternalLink size={11} /> Open Stamp
                            </a>
                          )}
                          {isEditing && (
                            <label className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer">
                              <UploadCloud size={12} /> Replace Stamp
                              <input type="file" accept="image/*" onChange={(e) => handleFileChange('signatureImage', e)} className="hidden" />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </form>

        {/* --- FOOTER --- */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between shrink-0">
          <div className="text-xs font-bold text-slate-400">
            Pharmacy ID: <span className="font-mono text-slate-700">{pharmacyId}</span>
          </div>

          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setErrorMessage(null);
                    setSuccessInfo(null);
                  }}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="view-pharmacy-form"
                  disabled={saving}
                  className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-[#3D3F96] hover:bg-[#2C2E75] text-white text-xs font-bold shadow-lg shadow-indigo-950/10 transition-all disabled:opacity-60"
                >
                  {saving ? <><Loader2 className="animate-spin" size={14} /> Saving Updates...</> : <><Save size={14} /> Save Changes</>}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-[#3D3F96] hover:bg-[#2C2E75] text-white text-xs font-bold transition-all"
              >
                Close
              </button>
            )}
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}