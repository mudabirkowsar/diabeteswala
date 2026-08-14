"use client";
import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle, 
  Calendar, 
  MapPin, 
  Loader2, 
  Save,
  AlertCircle
} from 'lucide-react';

// Import your API functions (Adjust the path based on your file structure)
import AdminAPI from '../../../services/AdminAPI'; 

function Page() {
  // --- Profile States ---
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // --- UI Control States ---
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // --- Fetch Profile on Mount ---
  useEffect(() => {
    const fetchAdminProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await AdminAPI.getAdminProfile();
        if (response && response.success) {
          setProfile(response.data);
          setFormData({
            name: response.data.name || '',
            email: response.data.email || '',
            phone: response.data.phone || ''
          });
        } else {
          setError('Failed to fetch profile settings.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error occurred while loading profile details.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, []);

  // --- Handle Form Submissions ---
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUpdating(true);

    // Front-end Validations
    if (!formData.name.trim()) {
      setError('Admin name is required.');
      setUpdating(false);
      return;
    }
    if (!formData.email.trim()) {
      setError('Admin email is required.');
      setUpdating(false);
      return;
    }
    if (!formData.phone.trim()) {
      setError('Admin phone number is required.');
      setUpdating(false);
      return;
    }

    try {
      const response = await AdminAPI.updateAdminProfile({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim()
      });

      if (response && response.success) {
        setSuccess('Your profile has been updated successfully.');
        setProfile(response.admin);
        
        // Synchronize updated profile in localStorage
        localStorage.setItem('adminInfo', JSON.stringify(response.admin));
      } else {
        setError(response?.message || 'Failed to update admin profile.');
      }
    } catch (err) {
      // Catch specific duplicate errors from API (e.g. Email / Phone duplicates)
      const serverError = err.response?.data?.message || 'Could not update profile details.';
      setError(serverError);
    } finally {
      setUpdating(false);
    }
  };

  // --- Loading Skeleton/Spinner State ---
  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 antialiased">
        <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={40} />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Account Settings...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-16 antialiased">
      <div className="max-w-[1300px] mx-auto">
        
        {/* --- PAGE HEADER --- */}
        <div className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Manage your administrative profile and permissions</p>
        </div>

        {/* --- DUAL COLUMN PROFILE LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT PANEL: Secure Info Card (Read-Only metadata) */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 relative overflow-hidden shrink-0">
            {/* Soft Ambient decorative blobs */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#EB333C]/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#3d3f96]/5 rounded-full -ml-10 -mb-10 blur-2xl"></div>

            <div className="relative z-10 flex flex-col items-center text-center pb-6 border-b border-slate-100">
              {/* Profile Avatar placeholder */}
              <div className="w-20 h-20 bg-gradient-to-tr from-[#3d3f96] to-[#EB333C] text-white flex items-center justify-center text-3xl font-black rounded-3xl shadow-lg shadow-indigo-150 mb-4">
                {profile?.name?.charAt(0) || 'A'}
              </div>

              {/* Name & Role Badge */}
              <h2 className="text-lg font-black text-slate-800 leading-tight">{profile?.name}</h2>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">{profile?.email}</p>
              
              <div className="mt-3 flex gap-2">
                {/* Dynamic Role Badge */}
                <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                  profile?.role === 'superadmin' 
                  ? 'bg-indigo-50 text-[#3d3f96] border border-indigo-100/50' 
                  : 'bg-amber-50 text-amber-700 border border-amber-100'
                }`}>
                  <ShieldCheck size={11} />
                  {profile?.role === 'superadmin' ? 'Superadmin' : 'Sub-admin'}
                </span>

                {/* Status Indicator */}
                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg">
                  <CheckCircle size={11} />
                  Active
                </span>
              </div>
            </div>

            {/* Read-Only System Details */}
            <div className="relative z-10 pt-6 space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">System Metadata</h3>
              
              {/* Admin ID */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-50 text-slate-400 rounded-xl shrink-0">
                  <ShieldAlert size={14} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Security ID</p>
                  <p className="text-xs font-bold text-slate-700 mt-0.5 select-all truncate max-w-[180px]">{profile?._id}</p>
                </div>
              </div>

              {/* Registration Date */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-50 text-slate-400 rounded-xl shrink-0">
                  <Calendar size={14} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Created At</p>
                  <p className="text-xs font-bold text-slate-700 mt-0.5">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    }) : '--'}
                  </p>
                </div>
              </div>

              {/* Location Access */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-50 text-slate-400 rounded-xl shrink-0">
                  <MapPin size={14} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Location Access</p>
                  <p className="text-xs font-bold text-slate-700 mt-0.5">
                    {profile?.locationAccess?.city || profile?.locationAccess?.state 
                      ? `${profile.locationAccess.city || ''}, ${profile.locationAccess.state || ''}`
                      : 'All India (Unrestricted)'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Editable Profile Settings Form */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
            
            {/* Status alerts */}
            {error && (
              <div className="flex items-center gap-2.5 bg-[#EB333C]/5 border border-[#EB333C]/10 text-[#EB333C] px-4 py-3.5 rounded-2xl mb-6 text-xs font-bold leading-relaxed">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3.5 rounded-2xl mb-6 text-xs font-bold leading-relaxed">
                <CheckCircle size={16} className="shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-6 pb-2 border-b border-slate-50">Profile Details</h3>

            <form onSubmit={handleProfileUpdate} className="space-y-6">
              
              {/* Row 1: Name */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter your full name"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Row 2: Grid for Email and Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="admin@diabeteswala.com"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+919876543210"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                    />
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex justify-end">
                <button 
                  type="submit"
                  disabled={updating}
                  className="px-6 py-3.5 bg-gradient-to-r from-[#3d3f96] to-[#4c4ea3] hover:from-[#2d2f75] hover:to-[#EB333C] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-150 hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none cursor-pointer"
                >
                  {updating ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

        </div>
      </div>
    </main>
  );
}

export default Page;