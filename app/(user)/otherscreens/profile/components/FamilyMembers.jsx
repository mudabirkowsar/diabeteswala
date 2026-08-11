"use client";
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Trash2, Pencil, Camera, 
  ShieldCheck, Phone, User, X, Loader2,
  Scale, Ruler, Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../../../../context/NotificationContext';
import UserAPI from '../../../../services/UserAPI';

const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

function FamilyMembers() {
  const { showNotification } = useNotification();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [formData, setFormData] = useState({
    memberName: '',
    relation: '',
    dob: '',
    phone: '',
    gender: 'Male',
    height: '',
    weight: '',
    hasInsurance: false,
    insuranceNo: '',
  });

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${BACKEND_BASE}${path}`;
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await UserAPI.getFamilyMembers();
      if (response.success) {
        setMembers(response.data);
      }
    } catch (err) {
      showNotification("Failed to load family members", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleEdit = (member) => {
    setEditingId(member._id);
    setFormData({
      memberName: member.memberName,
      relation: member.relation,
      dob: member.dob || '',
      phone: member.phone || '',
      gender: member.gender || 'Male',
      height: member.height || '',
      weight: member.weight || '',
      hasInsurance: member.hasInsurance || false,
      insuranceNo: member.insuranceNo || '',
    });
    setPreviewUrl(getImageUrl(member.profilePic));
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this family member?")) return;
    try {
      const response = await UserAPI.removeFamilyMember(id);
      if (response.success) {
        showNotification("Member removed", "success");
        fetchMembers();
      }
    } catch (err) {
      showNotification("Error removing member", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setBtnLoading(true);
      const fd = new FormData();
      Object.keys(formData).forEach(key => fd.append(key, formData[key]));
      if (selectedFile) fd.append('profilePic', selectedFile);

      let response = editingId 
        ? await UserAPI.editFamilyMember(editingId, fd)
        : await UserAPI.addFamilyMember(fd);

      if (response.success) {
        showNotification(editingId ? "Profile updated" : "Member added", "success");
        closeModal();
        fetchMembers();
      }
    } catch (err) {
      showNotification("Operation failed", "error");
    } finally {
      setBtnLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setFormData({ memberName: '', relation: '', dob: '', phone: '', gender: 'Male', height: '', weight: '', hasInsurance: false, insuranceNo: '' });
  };

  if (loading) return (
    <div className="p-20 flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[#3d3f96]" size={40} />
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Circle...</p>
    </div>
  );

  return (
    <div className="p-6 lg:p-10 antialiased max-w-[1400px]">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Family <span className="text-[#3d3f96]">Members</span>
          </h1>
          <span className="bg-indigo-50 text-[#3d3f96] text-xs font-black px-3 py-1 rounded-full">
            {members.length}
          </span>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-3 bg-[#3d3f96] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-[#2d2f75] transition-all active:scale-95"
        >
          <Plus size={18} /> Add Member
        </button>
      </div>

      {/* MEMBERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {members.map((member) => (
          <motion.div
            key={member._id}
            layout
            className="group relative bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-5">
                <div className="relative">
                    <div className="w-20 h-20 rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-md bg-slate-100">
                        {member.profilePic ? (
                            <img src={getImageUrl(member.profilePic)} className="w-full h-full object-cover" alt="" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#3d3f96] opacity-30"><User size={32}/></div>
                        )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-xl shadow-lg border border-slate-50 text-[#3d3f96]">
                        <Heart size={12} fill="currentColor" />
                    </div>
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 leading-tight">{member.memberName}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-black text-[#3d3f96] bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest">
                        {member.relation}
                    </span>
                    {member.hasInsurance && <ShieldCheck size={18} className="text-blue-500" />}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(member)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors">
                    <Pencil size={20} />
                </button>
                <button onClick={() => handleDelete(member._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                    <Trash2 size={20} />
                </button>
              </div>
            </div>

            {/* DATA GRID (MATCHING IMAGE STYLE) */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">DOB</p>
                    <p className="text-sm font-bold text-slate-700">{member.dob || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">GENDER</p>
                    <p className="text-sm font-bold text-slate-700">{member.gender || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">HEIGHT</p>
                    <div className="flex items-center gap-2">
                        <Ruler size={14} className="text-slate-300" />
                        <p className="text-sm font-bold text-slate-700">{member.height || 'N/A'}</p>
                    </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">WEIGHT</p>
                    <div className="flex items-center gap-2">
                        <Scale size={14} className="text-slate-300" />
                        <p className="text-sm font-bold text-slate-700">{member.weight || 'N/A'}</p>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center gap-3 text-slate-600">
                <Phone size={18} className="text-[#3d3f96]" />
                <span className="text-base font-black tracking-tight">{member.phone || 'N/A'}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ADD/EDIT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              className="relative bg-white w-full max-w-2xl rounded-[3rem] p-12 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black text-slate-800">{editingId ? 'Edit Profile' : 'Add Family Member'}</h2>
                <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Pic Upload */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                        <div className="w-28 h-28 rounded-[2.5rem] bg-slate-50 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
                            {previewUrl ? (
                                <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                            ) : (
                                <Camera size={32} className="text-slate-300" />
                            )}
                        </div>
                        <div className="absolute inset-0 bg-black/20 rounded-[2.5rem] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Plus size={24} className="text-white" />
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Upload Profile Picture</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Member Name</label>
                    <input required value={formData.memberName} onChange={(e) => setFormData({...formData, memberName: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-[#3d3f96]" placeholder="Full Name" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Relation</label>
                    <select required value={formData.relation} onChange={(e) => setFormData({...formData, relation: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none">
                      <option value="">Select Relation</option>
                      <option value="BROTHER">Brother</option>
                      <option value="SISTER">Sister</option>
                      <option value="MOTHER">Mother</option>
                      <option value="FATHER">Father</option>
                      <option value="SPOUSE">Spouse</option>
                      <option value="CHILD">Child</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                        <input type="date" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                        <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none">
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone</label>
                        <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none" placeholder="9876543210" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Height (e.g. 5'8")</label>
                        <input value={formData.height} onChange={(e) => setFormData({...formData, height: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none" placeholder="Enter height" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Weight (kg)</label>
                        <input value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none" placeholder="Enter weight" />
                    </div>
                </div>

                {/* Insurance Toggle */}
                <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <ShieldCheck size={20} className="text-[#3d3f96]" />
                            <span className="text-sm font-black text-slate-800 uppercase tracking-tight">Health Insurance</span>
                        </div>
                        <input 
                            type="checkbox" 
                            checked={formData.hasInsurance} 
                            onChange={(e) => setFormData({...formData, hasInsurance: e.target.checked})} 
                            className="w-5 h-5 rounded text-[#3d3f96] focus:ring-[#3d3f96]" 
                        />
                    </div>
                    
                    {formData.hasInsurance && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-4 border-t border-indigo-100">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Policy Number</label>
                                <input value={formData.insuranceNo} onChange={(e) => setFormData({...formData, insuranceNo: e.target.value})} className="w-full px-5 py-3.5 bg-white border border-indigo-100 rounded-2xl text-sm font-bold outline-none focus:border-[#3d3f96]" placeholder="POL1234567" />
                            </div>
                        </motion.div>
                    )}
                </div>

                <button disabled={btnLoading} type="submit" className="w-full py-5 bg-[#3d3f96] text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-[#2d2f75] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                    {btnLoading ? <Loader2 className="animate-spin" size={20} /> : (editingId ? "UPDATE PROFILE" : "ADD MEMBER")}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default FamilyMembers;