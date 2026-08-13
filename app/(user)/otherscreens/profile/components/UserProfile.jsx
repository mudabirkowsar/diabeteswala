"use client";
import React, { useState, useEffect, useRef } from 'react';
import {
  User, Mail, Phone, MapPin, Camera,
  ShieldCheck, Calendar, Ruler, Scale,
  Loader2, CheckCircle2, Edit3, Save,
  Globe, Map, HeartPulse, Activity, Info, X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Country, State, City } from 'country-state-city';
import { useAuth } from '../../../../context/AuthContext';
import { useNotification } from '../../../../context/NotificationContext';
import UserAPI from '../../../../services/UserAPI';

const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

function UserProfile() {
  const { updateUser } = useAuth();
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // --- Profile Data States ---
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    dob: '',
    height: '',
    weight: '',
    country: '',
    state: '',
    city: '',
    fatherName: ''
  });

  // --- File Upload States ---
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // --- Location States ---
  const [countries] = useState(Country.getAllCountries());
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${BACKEND_BASE}${path}`;
  };

  // 1. Fetch Profile on Mount
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await UserAPI.getUserProfile();
      if (response.success) {
        const d = response.data;
        setProfileData(d);
        setFormData({
          name: d.name || '',
          email: d.email || '',
          phone: d.phone || '',
          gender: d.gender || '',
          dob: d.dob ? d.dob.split('T')[0] : '',
          height: d.height || '',
          weight: d.weight || '',
          country: d.country || '',
          state: d.state || '',
          city: d.city || '',
          fatherName: d.fatherName || ''
        });
        setPreviewUrl(getImageUrl(d.profilePic));

        // Initialize Location Dropdowns if data exists
        if (d.country) {
          const c = countries.find(item => item.name === d.country);
          if (c) {
            const sList = State.getStatesOfCountry(c.isoCode);
            setStates(sList);
            const s = sList.find(item => item.name === d.state);
            if (s) setCities(City.getCitiesOfState(c.isoCode, s.isoCode));
          }
        }
      }
    } catch (err) {
      showNotification("Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // 2. Handle Input Changes
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // 3. Handle Location Logic
  const onCountryChange = (e) => {
    const c = countries.find(item => item.isoCode === e.target.value);
    setFormData({ ...formData, country: c.name, state: '', city: '' });
    setStates(State.getStatesOfCountry(c.isoCode));
    setCities([]);
  };

  const onStateChange = (e) => {
    const s = states.find(item => item.isoCode === e.target.value);
    const c = countries.find(item => item.name === formData.country);
    setFormData({ ...formData, state: s.name, city: '' });
    setCities(City.getCitiesOfState(c.isoCode, s.isoCode));
  };

  // 4. Submit Update
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setBtnLoading(true);
      const fd = new FormData();

      Object.keys(formData).forEach(key => {
        if (formData[key]) fd.append(key, formData[key]);
      });

      if (selectedFile) {
        fd.append('profilePic', selectedFile);
      }

      const response = await UserAPI.updateUserProfile(fd);
      if (response.success) {
        showNotification("Profile updated successfully", "success");
        setIsEditing(false);
        updateUser(response.data); // Update global Auth state
        fetchProfile();
      }
    } catch (err) {
      showNotification("Update failed", "error");
    } finally {
      setBtnLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
      <Loader2 className="animate-spin text-[#3d3f96]" size={40} />
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Synchronizing Health Profile...</p>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10 antialiased">

      {/* --- PROFILE HERO SECTION --- */}
      <div className="relative mb-12">
        <div className="h-48 w-full bg-gradient-to-r from-[#3d3f96] to-[#5255a5] rounded-[3rem] shadow-lg overflow-hidden relative">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(#fff 1px, transparent 1px)`, backgroundSize: '20px 20px' }} />
        </div>

        <div className="absolute -bottom-10 left-10 flex flex-col md:flex-row items-end gap-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[2.5rem] border-4 border-white shadow-2xl overflow-hidden bg-slate-100">
              {previewUrl ? (
                <img src={previewUrl} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300"><User size={48} /></div>
              )}
            </div>
            {isEditing && (
              <button
                onClick={() => fileInputRef.current.click()}
                className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem]"
              >
                <Camera size={24} />
              </button>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          </div>

          <div className="mb-4">
            <h1 className="text-3xl font-bold text-white">{profileData?.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest">
                {profileData?.profileStatus}
              </span>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-tighter">Member since {new Date(profileData?.createdAt).getFullYear()}</span>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-6 right-10">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg ${isEditing ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-white text-[#3d3f96] hover:bg-slate-50'}`}
          >
            {isEditing ? <X size={16} /> : <Edit3 size={16} />}
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-20">

        {/* --- LEFT: FORM FIELDS (8 Columns) --- */}
        <div className="lg:col-span-8 space-y-8">
          <form onSubmit={handleUpdate} className="bg-white p-8 md:p-12 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Basic Inputs */}
              {[
                { label: 'Full Name', name: 'name', icon: <User size={18} /> },
                { label: 'Father Name', name: 'fatherName', icon: <User size={18} /> },
                { label: 'Email Address', name: 'email', icon: <Mail size={18} />, disabled: true },
                { label: 'Phone Number', name: 'phone', icon: <Phone size={18} /> },
                { label: 'Date of Birth', name: 'dob', icon: <Calendar size={18} />, type: 'date' },
                { label: 'Gender', name: 'gender', icon: <User size={18} />, type: 'select', options: ['Male', 'Female', 'Other'] },
                { label: 'Height', name: 'height', icon: <Ruler size={18} />, placeholder: "e.g. 5'11" },
                { label: 'Weight', name: 'weight', icon: <Scale size={18} />, placeholder: "e.g. 70 kg" },
              ].map((field) => (
                <div key={field.name} className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">{field.icon}</div>
                    {field.type === 'select' ? (
                      <select
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none appearance-none disabled:opacity-60"
                      >
                        <option value="">Select {field.label}</option>
                        {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <input
                        type={field.type || 'text'}
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleInputChange}
                        disabled={field.disabled || !isEditing}
                        placeholder={field.placeholder}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-[#3d3f96] transition-all disabled:opacity-60"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Location Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-50">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Country</label>
                <select disabled={!isEditing} onChange={onCountryChange} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none disabled:opacity-60">
                  <option value="">{formData.country || "Select Country"}</option>
                  {countries.map(c => <option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">State</label>
                <select disabled={!isEditing || states.length === 0} onChange={onStateChange} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none disabled:opacity-60">
                  <option value="">{formData.state || "Select State"}</option>
                  {states.map(s => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City</label>
                <select disabled={!isEditing || cities.length === 0} name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none disabled:opacity-60">
                  <option value="">{formData.city || "Select City"}</option>
                  {cities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
            </div>

            {isEditing && (
              <motion.button
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                disabled={btnLoading}
                type="submit"
                className="w-full py-5 bg-[#3d3f96] text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-[#2d2f75] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {btnLoading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} /> SAVE CHANGES</>}
              </motion.button>
            )}
          </form>
        </div>

        {/* --- RIGHT: MEDICAL OVERVIEW (4 Columns) --- */}
        <div className="lg:col-span-4 space-y-6">

          {/* Condition Status Card */}
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-red-50 p-2.5 rounded-xl text-red-500"><HeartPulse size={20} /></div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Medical Status</h3>
            </div>

            <div className="space-y-4">
              {Object.entries(profileData?.conditionStatus).map(([key, value]) => (
                typeof value === 'boolean' && (
                  <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{key}</span>
                    {value ? (
                      <span className="bg-red-100 text-red-600 text-[9px] font-black px-2 py-1 rounded-md uppercase">Detected</span>
                    ) : (
                      <CheckCircle2 size={16} className="text-emerald-500" />
                    )}
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Family History Card */}
          <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10"><Activity size={80} /></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-white/10 p-2.5 rounded-xl text-blue-300"><Info size={20} /></div>
                <h3 className="text-lg font-black uppercase tracking-tight">Family History</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(profileData.familyHistory).map(([key, value]) => (
                  <div key={key} className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{key}</p>
                    <p className="text-xs font-bold text-blue-200">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default UserProfile;