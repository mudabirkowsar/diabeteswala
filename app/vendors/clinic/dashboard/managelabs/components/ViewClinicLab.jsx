"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  FlaskConical,
  Pencil,
  Eye,
  Save,
  X,
  Phone,
  Mail,
  MapPin,
  Clock,
  Home,
  Zap,
  ShieldCheck,
  Building,
  CreditCard,
  FileText,
  UploadCloud,
  Loader2,
  ExternalLink,
  Info,
  CheckCircle2,
  Plus,
  Star
} from 'lucide-react';

import ClinicAPI from '../../../../../services/ClinicAPI'; // Adjust path if needed

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.1.7:5002';

const getImageUrl = (path) => {
  if (!path) return 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=200';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:') || path.startsWith('data:')) {
    return path;
  }
  const cleanBase = BACKEND_URL.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

export default function ViewClinicLab({ labId, onClose, onLabUpdated }) {
  const [mounted, setMounted] = useState(false);
  const [lab, setLab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'services' | 'licensing' | 'banking' | 'documents'

  const [errorMessage, setErrorMessage] = useState(null);
  const [successInfo, setSuccessInfo] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    alternatePhone: '',
    about: '',
    experience: '',
    address: '',
    city: '',
    state: '',
    country: 'India',

    // Features
    isHomeCollectionAvailable: false,
    isRapidServiceAvailable: false,
    isInsuranceAccepted: false,
    is24x7: false,

    // Legal
    nablNumber: '',
    gstNumber: '',
    documentState: '',
    issuingAuthority: '',
    drugLicenseType: 'None',

    // Bank
    accountType: 'Current',
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: ''
  });

  const [insuranceTags, setInsuranceTags] = useState([]);
  const [newInsuranceInput, setNewInsuranceInput] = useState('');

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
        const res = await ClinicAPI.getClinicLabDetails(labId);
        if (res?.success && res.data) {
          const l = res.data;
          setLab(l);
          setFormData({
            name: l.name || '',
            phone: l.phone || '',
            email: l.email || '',
            alternatePhone: l.alternatePhone || '',
            about: l.about || '',
            experience: l.documents?.experience || l.experience || '',
            address: l.address || '',
            city: l.city || '',
            state: l.state || '',
            country: l.country || 'India',

            isHomeCollectionAvailable: !!l.isHomeCollectionAvailable,
            isRapidServiceAvailable: !!l.isRapidServiceAvailable,
            isInsuranceAccepted: !!l.isInsuranceAccepted,
            is24x7: !!l.is24x7,

            nablNumber: l.documents?.nablNumber || '',
            gstNumber: l.documents?.gstNumber || '',
            documentState: l.documents?.documentState || '',
            issuingAuthority: l.documents?.issuingAuthority || '',
            drugLicenseType: l.documents?.drugLicenseType || 'None',

            accountType: l.bankDetails?.accountType || 'Current',
            bankName: l.bankDetails?.bankName || '',
            accountHolderName: l.bankDetails?.accountHolderName || '',
            accountNumber: l.bankDetails?.accountNumber || '',
            ifscCode: l.bankDetails?.ifscCode || '',
            upiId: l.bankDetails?.upiId || ''
          });

          setInsuranceTags(Array.isArray(l.acceptedInsurances) ? l.acceptedInsurances : []);

          setMediaPreviews({
            profileImage: l.profileImage ? getImageUrl(l.profileImage) : null,
            signatureImage: l.signatureImage ? getImageUrl(l.signatureImage) : null
          });
        }
      } catch (err) {
        console.error("Failed to load lab details:", err);
        setErrorMessage("Could not load diagnostic lab profile.");
      } finally {
        setLoading(false);
      }
    };

    loadDetails();

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [labId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddInsurance = (e) => {
    e.preventDefault();
    if (newInsuranceInput.trim() && !insuranceTags.includes(newInsuranceInput.trim())) {
      setInsuranceTags(prev => [...prev, newInsuranceInput.trim()]);
      setNewInsuranceInput('');
    }
  };

  const handleRemoveInsurance = (tag) => {
    setInsuranceTags(prev => prev.filter(t => t !== tag));
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
      if (formData.experience) payload.append('experience', formData.experience.trim());

      // Features
      payload.append('isHomeCollectionAvailable', String(formData.isHomeCollectionAvailable));
      payload.append('isRapidServiceAvailable', String(formData.isRapidServiceAvailable));
      payload.append('isInsuranceAccepted', String(formData.isInsuranceAccepted));
      payload.append('is24x7', String(formData.is24x7));

      if (formData.isInsuranceAccepted) {
        payload.append('acceptedInsurances', JSON.stringify(insuranceTags));
      }

      // Address
      if (formData.address) payload.append('address', formData.address.trim());
      if (formData.city) payload.append('city', formData.city.trim());
      if (formData.state) payload.append('state', formData.state.trim());
      if (formData.country) payload.append('country', formData.country.trim());

      // Licensing
      if (formData.nablNumber) payload.append('nablNumber', formData.nablNumber.trim());
      if (formData.gstNumber) payload.append('gstNumber', formData.gstNumber.trim());
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

      // Files
      if (newFiles.profileImage) payload.append('profileImage', newFiles.profileImage);
      if (newFiles.signatureImage) payload.append('signatureImage', newFiles.signatureImage);

      const response = await ClinicAPI.updateClinicLab(labId, payload);

      if (response?.success) {
        const updatedRecord = response.data?.updatedFields || response.data || {
          ...lab,
          ...formData,
          acceptedInsurances: insuranceTags
        };

        onLabUpdated(updatedRecord, response.message);
        setIsEditing(false);
        setSuccessInfo(response.message || "Lab updates submitted successfully.");
      } else {
        setErrorMessage(response?.message || "Failed to update laboratory details.");
      }
    } catch (err) {
      console.error("Error updating lab:", err);
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
              src={mediaPreviews.profileImage || getImageUrl(lab?.profileImage)}
              alt="Lab"
              className="w-12 h-12 rounded-2xl object-cover border border-slate-100 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 leading-tight">{formData.name || 'Lab Details'}</h3>
                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                  lab?.profileStatus === 'Approved'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-amber-50 text-amber-600'
                }`}>
                  {lab?.profileStatus || 'Pending'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                NABL: {formData.nablNumber || 'Standard Registry'} • {formData.city || 'Location N/A'}
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
            { key: 'overview', label: 'Identity & Address' },
            { key: 'services', label: 'Testing Facilities' },
            { key: 'licensing', label: 'NABL & Compliance' },
            { key: 'banking', label: 'Bank Details' },
            { key: 'documents', label: 'Media & Stamp' }
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
        <form id="view-lab-form" onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-slate-50/30">
          
          {loading ? (
            <div className="py-20 text-center text-slate-400">
              <Loader2 className="animate-spin text-2xl mx-auto mb-2 text-[#3D3F96]" size={24} />
              <span className="text-xs font-medium">Loading diagnostic laboratory data...</span>
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW & LOCATION */}
              {activeTab === 'overview' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#3D3F96] border-b border-slate-100 pb-3">
                    Laboratory Identification & Address
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">Display Lab Name</label>
                      {isEditing ? (
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-white outline-none focus:border-[#3D3F96]" />
                      ) : (
                        <p className="text-xs font-bold text-slate-800 py-1.5">{formData.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">Primary Phone</label>
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

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">Experience</label>
                      {isEditing ? (
                        <input type="text" name="experience" value={formData.experience} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-white" />
                      ) : (
                        <p className="text-xs font-bold text-slate-800 py-1.5">{formData.experience || 'N/A'}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">Street Address</label>
                      {isEditing ? (
                        <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-white" />
                      ) : (
                        <p className="text-xs font-bold text-slate-800 py-1.5 flex items-center gap-1.5"><MapPin size={12} className="text-slate-400" /> {formData.address || 'N/A'}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">City</label>
                      {isEditing ? (
                        <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-white" />
                      ) : (
                        <p className="text-xs font-bold text-slate-800 py-1.5">{formData.city || 'N/A'}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">State</label>
                      {isEditing ? (
                        <input type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-white" />
                      ) : (
                        <p className="text-xs font-bold text-slate-800 py-1.5">{formData.state || 'N/A'}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">Country</label>
                      {isEditing ? (
                        <input type="text" name="country" value={formData.country} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-white" />
                      ) : (
                        <p className="text-xs font-bold text-slate-800 py-1.5">{formData.country || 'India'}</p>
                      )}
                    </div>

                    <div className="md:col-span-3">
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">About / Bio</label>
                      {isEditing ? (
                        <textarea rows={2} name="about" value={formData.about} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-white outline-none focus:border-[#3D3F96]" />
                      ) : (
                        <p className="text-xs text-slate-700 py-1.5">{formData.about || 'No description provided.'}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SERVICES & AMENITIES */}
              {activeTab === 'services' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#3D3F96] border-b border-slate-100 pb-3">
                    Diagnostic Testing Capabilities
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Home className="text-[#3D3F96]" size={18} />
                        <span className="text-xs font-bold text-slate-800">Home Sample Collection</span>
                      </div>
                      {isEditing ? (
                        <input type="checkbox" name="isHomeCollectionAvailable" checked={formData.isHomeCollectionAvailable} onChange={handleInputChange} className="w-4 h-4 rounded text-[#3D3F96]" />
                      ) : (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${formData.isHomeCollectionAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                          {formData.isHomeCollectionAvailable ? 'Available' : 'Disabled'}
                        </span>
                      )}
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="text-amber-600" size={18} />
                        <span className="text-xs font-bold text-slate-800">Rapid Testing Service</span>
                      </div>
                      {isEditing ? (
                        <input type="checkbox" name="isRapidServiceAvailable" checked={formData.isRapidServiceAvailable} onChange={handleInputChange} className="w-4 h-4 rounded text-[#3D3F96]" />
                      ) : (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${formData.isRapidServiceAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                          {formData.isRapidServiceAvailable ? 'Available' : 'Disabled'}
                        </span>
                      )}
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="text-emerald-600" size={18} />
                        <span className="text-xs font-bold text-slate-800">Insurance Accepted</span>
                      </div>
                      {isEditing ? (
                        <input type="checkbox" name="isInsuranceAccepted" checked={formData.isInsuranceAccepted} onChange={handleInputChange} className="w-4 h-4 rounded text-[#3D3F96]" />
                      ) : (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${formData.isInsuranceAccepted ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                          {formData.isInsuranceAccepted ? 'Enabled' : 'Disabled'}
                        </span>
                      )}
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="text-purple-600" size={18} />
                        <span className="text-xs font-bold text-slate-800">24x7 Diagnostic Support</span>
                      </div>
                      {isEditing ? (
                        <input type="checkbox" name="is24x7" checked={formData.is24x7} onChange={handleInputChange} className="w-4 h-4 rounded text-[#3D3F96]" />
                      ) : (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${formData.is24x7 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                          {formData.is24x7 ? '24x7 Active' : 'Standard'}
                        </span>
                      )}
                    </div>
                  </div>

                  {formData.isInsuranceAccepted && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 mt-4">
                      <span className="text-xs font-bold text-slate-700 block">Accepted Insurances / Schemes</span>
                      {isEditing && (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Add insurance name..."
                            value={newInsuranceInput}
                            onChange={(e) => setNewInsuranceInput(e.target.value)}
                            className="px-3 py-1.5 text-xs rounded-xl border bg-white flex-1 outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleAddInsurance}
                            className="px-3 py-1.5 rounded-xl bg-indigo-50 text-[#3D3F96] text-xs font-bold"
                          >
                            Add
                          </button>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {insuranceTags.map((tag, i) => (
                          <span key={i} className="text-xs bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 font-medium flex items-center gap-1">
                            {tag}
                            {isEditing && <X size={11} className="cursor-pointer text-slate-400 hover:text-rose-500" onClick={() => handleRemoveInsurance(tag)} />}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: LICENSING */}
              {activeTab === 'licensing' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#3D3F96] border-b border-slate-100 pb-3">
                    NABL Accreditation & Statutory Documents
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">NABL Accreditation Number</label>
                      {isEditing ? (
                        <input type="text" name="nablNumber" value={formData.nablNumber} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-white" />
                      ) : (
                        <p className="text-xs font-bold text-slate-800">{formData.nablNumber || 'N/A'}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">GSTIN Number</label>
                      {isEditing ? (
                        <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-white" />
                      ) : (
                        <p className="text-xs font-bold text-slate-800">{formData.gstNumber || 'N/A'}</p>
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

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">Document State</label>
                      {isEditing ? (
                        <input type="text" name="documentState" value={formData.documentState} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-white" />
                      ) : (
                        <p className="text-xs font-bold text-slate-800">{formData.documentState || 'N/A'}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">License Category</label>
                      {isEditing ? (
                        <select name="drugLicenseType" value={formData.drugLicenseType} onChange={handleInputChange} className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-white">
                          <option value="None">None</option>
                          <option value="Retail">Retail</option>
                          <option value="Wholesale">Wholesale</option>
                          <option value="Restricted">Restricted</option>
                          <option value="Blood Bank">Blood Bank</option>
                        </select>
                      ) : (
                        <p className="text-xs font-bold text-slate-800">{formData.drugLicenseType || 'None'}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: BANKING */}
              {activeTab === 'banking' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#3D3F96] border-b border-slate-100 pb-3">
                    Bank Settlements & Accounts
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
                    Facility Picture & Pathologist Stamp
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Lab Profile */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                      <span className="text-xs font-bold text-slate-700 block">Lab Facility Image</span>
                      <div className="flex items-center gap-3">
                        <img
                          src={mediaPreviews.profileImage}
                          alt="Lab Profile"
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
                              <UploadCloud size={12} /> Replace Photo
                              <input type="file" accept="image/*" onChange={(e) => handleFileChange('profileImage', e)} className="hidden" />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Pathologist Stamp */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                      <span className="text-xs font-bold text-slate-700 block">Pathologist Signature / Stamp</span>
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
            Lab ID: <span className="font-mono text-slate-700">{labId}</span>
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
                  form="view-lab-form"
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