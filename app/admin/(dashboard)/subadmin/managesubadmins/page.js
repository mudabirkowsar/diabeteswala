"use client";
 
import React, { useState, useEffect, useMemo } from "react";
import { FaEdit, FaTrash, FaSearch, FaUserShield, FaCheck, FaTimes, FaInbox, FaUsers } from "react-icons/fa";
import AddNewSubadmin from "./components/AddNewSubadmin";
import EditSubadmin from "./components/EditSubadmin";
import { toast, Toaster } from "react-hot-toast";
 
// Standalone Mock Datasets for Roles and Sub-admins
const initialRolesMock = [
    { _id: "r1", name: "Pharmacy Manager" },
    { _id: "r2", name: "Lab Diagnostics Coordinator" },
    { _id: "r3", name: "Food Fleet Supervisor" },
    { _id: "r4", name: "General Content Manager" }
];

const initialSubadminsMock = [
    { 
        _id: "sa1", 
        name: "Amit Verma", 
        email: "dr.amit@diabeteswala.com", 
        phone: "9876543210", 
        locationAccess: { country: "India", state: "Punjab", city: "Mohali" }, 
        roleType: { _id: "r2", name: "Lab Diagnostics Coordinator" } 
    },
    { 
        _id: "sa2", 
        name: "Priya Sharma", 
        email: "dr.priya@diabeteswala.com", 
        phone: "8765432109", 
        locationAccess: { country: "India", state: "Jaipur", city: "Rajasthan" }, 
        roleType: { _id: "r4", name: "General Content Manager" } 
    },
    { 
        _id: "sa3", 
        name: "Rajesh Choudhary", 
        email: "dr.rajesh@diabeteswala.com", 
        phone: "7654321098", 
        locationAccess: { country: "India", state: "Punjab", city: "Mohali" }, 
        roleType: { _id: "r1", name: "Pharmacy Manager" } 
    }
];

export default function Page() {
  const [search, setSearch] = useState("");
  const [openNew, setOpenNew] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [subadmins, setSubadmins] = useState(initialSubadminsMock);
  const [roles] = useState(initialRolesMock); 
  const [loading, setLoading] = useState(false);
 
  // Modals States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState("");

  // Theme Color Tokens based on #3D3F96
  const themeBg = "bg-[#3D3F96]";
  const themeText = "text-[#3D3F96]";
  const themeHoverBg = "hover:bg-[#2C2D75]";
  const themeShadow = "shadow-[#3D3F96]/20";
  const themeRing = "focus:ring-[#3D3F96]/30";
 
  // Simulated assign role submit handler
  const handleAssignSubmit = () => {
    if (!selectedRoleId) return toast.error("Select a role first");
    
    setLoading(true);
    setTimeout(() => {
        const matchedRole = roles.find(r => r._id === selectedRoleId);
        setSubadmins(prev => prev.map(user => 
            user._id === selectedUser._id 
                ? { ...user, roleType: matchedRole } 
                : user
        ));
        toast.success("Role Assigned Successfully (Mock Mode)!");
        setAssignModalOpen(false);
        setLoading(false);
    }, 1000);
  };

  // Simulated delete handler
  const handleDeleteConfirm = () => {
    setLoading(true);
    setTimeout(() => {
        setSubadmins(prev => prev.filter(user => user._id !== selectedUser._id));
        toast.success("Sub-Admin Removed Successfully!");
        setDeleteModalOpen(false);
        setLoading(false);
    }, 1000);
  };

  // Simulated add subadmin success callback
  const handleAddSuccess = () => {
    setOpenNew(false);
    // Dynamic simulated creation has been processed inside AddNewSubadmin locally. 
    // To update the table, we append a mock deployed admin.
    const mockNew = {
        _id: `sa_${Date.now()}`,
        name: "New Administrator",
        email: "new.admin@diabeteswala.com",
        phone: "9999988888",
        locationAccess: { country: "India", state: "Punjab", city: "Mohali" },
        roleType: { _id: "r1", name: "Pharmacy Manager" }
    };
    setSubadmins([mockNew, ...subadmins]);
  };

  // Simulated edit subadmin success callback
  const handleEditSuccess = () => {
    setOpenEdit(false);
    toast.success("Subadmin details re-synced!");
  };
 
  const filteredSubadmins = useMemo(() => {
      return subadmins.filter((user) =>
          user.name?.toLowerCase().includes(search.toLowerCase()) ||
          user.email?.toLowerCase().includes(search.toLowerCase()) ||
          user.roleType?.name?.toLowerCase().includes(search.toLowerCase())
      );
  }, [subadmins, search]);
 
  return (
    <div className="bg-gray-50/50 min-h-screen relative p-4 md:p-8 select-none animate-fadeIn">
      <Toaster 
          position="top-right"
          toastOptions={{
              style: {
                  background: '#1e293b',
                  color: '#fff',
                  borderRadius: '16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  padding: '16px',
              },
          }}
      />
 
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center shrink-0">
                  <FaUsers className="text-xl" />
              </div>
              <div>
                  <h2 className="text-xl font-black text-gray-800 tracking-tight leading-snug">Subadmin Management</h2>
                  <p className="text-xs text-gray-400">Review, register, and assign system permissions to sub-admins</p>
              </div>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto justify-end">
            <div className="relative flex-1 md:w-72">
              <FaSearch className="absolute top-3.5 left-4 text-gray-400" />
              <input
                type="text" 
                placeholder="Search subadmin..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl shadow-sm outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} bg-white text-xs font-semibold text-gray-700`}
              />
            </div>
            <button
              onClick={() => { setOpenNew(!openNew); setOpenEdit(false); }}
              className={`text-white px-8 py-3 rounded-2xl shadow-lg transition-all font-black text-xs uppercase tracking-wider focus:outline-none ${themeBg} ${themeHoverBg} ${themeShadow}`}
            >
              {openNew ? "Back" : "+ Add New"}
            </button>
          </div>
        </div>
 
        {openNew ? (
          <AddNewSubadmin onSuccess={handleAddSuccess} />
        ) : openEdit ? (
          <EditSubadmin user={selectedUser} onClose={() => setOpenEdit(false)} onSuccess={handleEditSuccess} />
        ) : (
          <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left align-middle">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr className="text-gray-400 uppercase text-[10px] font-black tracking-widest">
                    <th className="px-8 py-6">Identity</th>
                    <th className="px-8 py-6">Email Address</th>
                    <th className="px-8 py-6">Permission Role</th>
                    <th className="px-8 py-6 text-center">Actions</th>
                  </tr>
                </thead>
 
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr><td colSpan="4" className="text-center py-20 font-bold text-gray-300 animate-pulse">Syncing with database...</td></tr>
                  ) : filteredSubadmins.map((user) => (
                    <tr key={user._id} className="hover:bg-indigo-50/10 transition-all group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 text-white rounded-xl flex items-center justify-center font-bold text-sm ${themeBg} ${themeShadow} shadow-md`}>
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-slate-800 text-sm uppercase leading-none">{user.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 tracking-widest mt-1.5">{user.phone || 'NO PHONE'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-xs font-bold text-slate-500">{user.email}</td>
                      
                      {/* SINGLE ROLE DISPLAY + ASSIGN BUTTON */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-wrap gap-2">
                            {user.roleType && user.roleType.name ? (
                              <span className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                {user.roleType.name}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">No Role Assigned</span>
                            )}
                          </div>

                          {/* Assign Role Button (Right Side) */}
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setSelectedRoleId(user.roleType?._id || "");
                              setAssignModalOpen(true);
                            }}
                            title="Assign New Role"
                            className="p-2 rounded-xl bg-indigo-50 text-[#3D3F96] border border-indigo-100 hover:bg-[#3D3F96] hover:text-white transition-all cursor-pointer focus:outline-none active:scale-95 flex-shrink-0"
                          >
                            <FaUserShield size={16} />
                          </button>
                        </div>
                      </td>

                      <td className="px-8 py-6">
                        <div className="flex justify-center gap-3">
                          <button className="p-2.5 bg-indigo-50 text-[#3D3F96] rounded-xl hover:bg-[#3D3F96] hover:text-white transition-all focus:outline-none" onClick={() => { setSelectedUser(user); setOpenEdit(true); }}>
                            <FaEdit size={14} />
                          </button>
                          <button className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-600 hover:text-white transition-all focus:outline-none" onClick={() => { setSelectedUser(user); setDeleteModalOpen(true); }}>
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredSubadmins.length === 0 && (
                      <tr>
                          <td colSpan={4} className="px-8 py-16 text-center">
                              <div className="flex flex-col items-center justify-center gap-3">
                                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                      <FaInbox className="text-3xl" />
                                  </div>
                                  <div>
                                      <h4 className="text-sm font-bold text-slate-700">No Sub-Admins Found</h4>
                                      <p className="text-xs text-slate-400 mt-1">Adjust your search parameters to view matching personnel.</p>
                                  </div>
                              </div>
                          </td>
                      </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
 
      {/* ROLE ASSIGNMENT MODAL (Dropdown is preserved) */}
      {assignModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Assign Permissions</h3>
              <button onClick={() => setAssignModalOpen(false)} className="text-slate-300 hover:text-slate-600 focus:outline-none"><FaTimes /></button>
            </div>
 
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Selected Subadmin</p>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-700 text-sm">{selectedUser?.name}</div>
              </div>
 
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Select Role Template</p>
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  className={`w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all font-bold text-slate-700 text-sm cursor-pointer`}
                >
                  <option value="">-- Choose Role --</option>
                  {roles.map(role => (
                    <option key={role._id} value={role._id}>{role.name}</option>
                  ))}
                </select>
              </div>
 
              <button
                onClick={handleAssignSubmit}
                disabled={loading}
                className={`w-full py-4 text-white font-black rounded-2xl shadow-xl transition-all uppercase text-[11px] tracking-widest mt-4 focus:outline-none ${themeBg} ${themeHoverBg} ${themeShadow}`}
              >
                {loading ? "Processing..." : "Confirm Assignment"}
              </button>
            </div>
          </div>
        </div>
      )}
 
      {/* DELETE MODAL */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 text-center animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-gray-800 mb-2">Remove Admin?</h3>
            <p className="text-gray-500 text-sm font-medium mb-8">Are you sure you want to delete <span className="font-bold text-red-500">{selectedUser?.name}</span>?</p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteModalOpen(false)} className="flex-1 py-4 font-bold text-gray-400 focus:outline-none">Cancel</button>
              <button onClick={handleDeleteConfirm} className="flex-1 py-4 bg-rose-600 text-white font-bold rounded-2xl active:scale-95 focus:outline-none">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}