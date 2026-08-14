"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Toaster, toast } from "react-hot-toast";
import {
    FaArrowLeft, FaShieldAlt, FaUsers, FaEdit, FaTimes,
    FaLayerGroup, FaSave, FaCheckSquare, FaSquare,
    FaInfoCircle, FaCalendarAlt, FaIdBadge, FaCheck
} from "react-icons/fa";
import Link from "next/link";

// Mock Database of permission tabs (Strictly Lab, Pharmacy, Food, Dashboard, Earnings only)
const initialTabsMock = [
    { tabId: 1, parentId: 0, name: "Dashboard Overview" },
    { tabId: 11, parentId: 1, name: "View System Metrics" },
    { tabId: 2, parentId: 0, name: "Pharmacy Management" },
    { tabId: 21, parentId: 2, name: "Manage Medicines" },
    { tabId: 22, parentId: 2, name: "Approve Products" },
    { tabId: 3, parentId: 0, name: "Lab Diagnostics" },
    { tabId: 31, parentId: 3, name: "Manage Lab Outlets" },
    { tabId: 32, parentId: 3, name: "Create Lab Tests" },
    { tabId: 4, parentId: 0, name: "Food & Diet Outlets" },
    { tabId: 41, parentId: 4, name: "Manage Food Vendors" },
    { tabId: 42, parentId: 4, name: "Configure Food Categories" },
    { tabId: 5, parentId: 0, name: "Earnings & Analytics" },
    { tabId: 51, parentId: 5, name: "View Platform Revenue" }
];

const initialRolesMock = [
    { 
        _id: "r1", 
        name: "Pharmacy Manager", 
        tabIds: [1, 11, 2, 21, 22], 
        detailedTabs: [
            { tabId: 1, name: "Dashboard Overview" },
            { tabId: 11, name: "View System Metrics" },
            { tabId: 2, name: "Pharmacy Management" },
            { tabId: 21, name: "Manage Medicines" },
            { tabId: 22, name: "Approve Products" }
        ],
        adminCount: 2,
        createdAt: "2026-07-10T10:00:00.000Z"
    },
    { 
        _id: "r2", 
        name: "Lab Diagnostics Coordinator", 
        tabIds: [1, 11, 3, 31, 32], 
        detailedTabs: [
            { tabId: 1, name: "Dashboard Overview" },
            { tabId: 11, name: "View System Metrics" },
            { tabId: 3, name: "Lab Diagnostics" },
            { tabId: 31, name: "Manage Lab Outlets" },
            { tabId: 32, name: "Create Lab Tests" }
        ],
        adminCount: 1,
        createdAt: "2026-07-12T11:30:00.000Z"
    },
    { 
        _id: "r3", 
        name: "Food Fleet Supervisor", 
        tabIds: [1, 11, 4, 41, 42], 
        detailedTabs: [
            { tabId: 1, name: "Dashboard Overview" },
            { tabId: 11, name: "View System Metrics" },
            { tabId: 4, name: "Food & Diet Outlets" },
            { tabId: 41, name: "Manage Food Vendors" },
            { tabId: 42, name: "Configure Food Categories" }
        ],
        adminCount: 0,
        createdAt: "2026-07-14T09:15:00.000Z"
    }
];

export default function RoleListPage() {
    const [roles, setRoles] = useState(initialRolesMock);
    const [allTabs] = useState(initialTabsMock);
    const [loading, setLoading] = useState(false);
   
    // Modals visibility state
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
   
    // Data state for modals
    const [activeRole, setActiveRole] = useState(null);
    const [editTabIds, setEditTabIds] = useState([]);
    const [updating, setUpdating] = useState(false);

    // Theme Color Tokens based on #3D3F96
    const themeBg = "bg-[#3D3F96]";
    const themeText = "text-[#3D3F96]";
    const themeHoverBg = "hover:bg-[#2C2D75]";
    const themeShadow = "shadow-[#3D3F96]/20";
    const themeRing = "focus:ring-[#3D3F96]/30";
 
    // --- Row Click for Details ---
    const handleRowClick = (role) => {
        setActiveRole(role);
        setIsDetailModalOpen(true);
    };
 
    // --- Edit Click Logic ---
    const handleEditClick = (e, role) => {
        e.stopPropagation(); // Stop row click trigger
        setActiveRole(role);
        setEditTabIds(role.tabIds || []);
        setIsEditModalOpen(true);
    };
 
    const togglePermission = (tabId) => {
        setEditTabIds(prev =>
            prev.includes(tabId) ? prev.filter(id => id !== tabId) : [...prev, tabId]
        );
    };
 
    const handleUpdateSubmit = (e) => {
        e.preventDefault();
        setUpdating(true);
        
        // Simulating API save delay
        setTimeout(() => {
            const updatedDetailedTabs = allTabs.filter(t => editTabIds.includes(t.tabId));
            setRoles(prev => prev.map(r => 
                r._id === activeRole._id 
                    ? { ...r, tabIds: editTabIds, detailedTabs: updatedDetailedTabs } 
                    : r
            ));
            toast.success("Permissions updated successfully (Mock Mode)!");
            setIsEditModalOpen(false);
            setUpdating(false);
        }, 1200);
    };
 
    const buildTree = () => {
        const parents = allTabs.filter(t => t.parentId === 0);
        return parents.map(p => ({
            ...p,
            children: allTabs.filter(c => c.parentId === p.tabId)
        }));
    };
 
    return (
        <div className="p-4 md:p-10 bg-[#F8FAFC] min-h-screen select-none animate-fadeIn">
            <Toaster position="top-right" />
           
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4 border-b border-gray-100 pb-5">
                <div className="flex items-center gap-4">
                    <Link href="/admin/subadmin/managesubadminrole" className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-400 hover:text-[#3D3F96] transition-all focus:outline-none">
                        <FaArrowLeft />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Security Roles</h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Manage Role Manifests &amp; Capabilities</p>
                    </div>
                </div>
                <Link href="/admin/subadmin/managesubadminrole" className={`px-8 py-3.5 text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all text-[11px] uppercase tracking-widest active:scale-95 ${themeBg} ${themeShadow}`}>
                    + Define New Role
                </Link>
            </div>
 
            {/* MAIN TABLE */}
            <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse align-middle">
                        <thead className="bg-slate-50/50 border-b border-gray-100">
                            <tr className="text-slate-400 uppercase text-[10px] font-black tracking-[0.2em]">
                                <th className="px-8 py-6">Identity</th>
                                <th className="px-8 py-6">Authorizations</th>
                                <th className="px-8 py-6 text-center">Assigned</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="4" className="text-center py-20 font-bold text-gray-300 animate-pulse uppercase tracking-[0.3em]">Querying Database...</td></tr>
                            ) : roles.map((role) => (
                                <tr key={role._id} onClick={() => handleRowClick(role)} className="hover:bg-indigo-50/10 transition-all group cursor-pointer">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 text-white rounded-2xl flex items-center justify-center shadow-lg transition-colors ${themeBg} ${themeShadow}`}>
                                                <FaShieldAlt size={18} />
                                            </div>
                                            <div>
                                                <span className="font-black text-slate-800 uppercase text-sm tracking-tight block">{role.name}</span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ID: {role._id.slice(-6)}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-wrap gap-1.5">
                                            {role.detailedTabs?.slice(0, 3).map(tab => (
                                                <span key={tab.tabId} className="px-2.5 py-1 bg-white border border-gray-200 text-slate-500 rounded-md text-[9px] font-black uppercase">{tab.name}</span>
                                            ))}
                                            {role.detailedTabs?.length > 3 && (
                                                <span className={`text-[10px] font-black bg-[#3D3F96]/10 px-2 py-1 rounded ${themeText}`}>+{role.detailedTabs.length - 3}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black border border-blue-100 uppercase tracking-widest">
                                            {role.adminCount} Active
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex justify-end">
                                            {/* Edit Button Permanent / Visible */}
                                            <button
                                                onClick={(e) => handleEditClick(e, role)}
                                                className={`flex items-center gap-2 px-5 py-2.5 text-white rounded-xl transition-all font-black text-[10px] uppercase tracking-widest focus:outline-none ${themeBg} ${themeHoverBg} ${themeShadow} shadow-lg`}
                                            >
                                                <FaEdit size={12} /> Edit Role
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
 
            {/* 🌟 1. ROLE INFO DETAILS MODAL 🌟 */}
            {isDetailModalOpen && activeRole && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 overflow-y-auto animate-in fade-in duration-200">
                    <div onClick={() => setIsDetailModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"></div>
                    
                    <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header banner */}
                        <div className="px-10 py-10 bg-slate-900 text-white relative">
                            <div className="flex justify-between items-start z-10 relative">
                                <h3 className="text-3xl font-black uppercase tracking-tighter">{activeRole.name}</h3>
                                <button onClick={() => setIsDetailModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl hover:bg-white/20 transition-all focus:outline-none"><FaTimes/></button>
                            </div>
                            <div className="absolute -right-20 -top-20 w-60 h-60 bg-[#3D3F96] rounded-full blur-[100px] opacity-20"></div>
                        </div>

                        {/* Stats Info */}
                        <div className="p-10 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Created</p>
                                    <p className="text-xs font-black text-slate-700">{new Date(activeRole.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Modules</p>
                                    <p className="text-xs font-black text-slate-700">{activeRole.detailedTabs?.length} Authorized</p>
                                </div>
                            </div>

                            {/* Scrollable list */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                {activeRole.detailedTabs?.map(tab => (
                                    <div key={tab.tabId} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between">
                                        <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">{tab.name}</span>
                                        <span className="text-[9px] font-bold text-slate-300">#{tab.tabId}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
 
            {/* 🌟 2. EDIT PERMISSIONS MODAL 🌟 */}
            {isEditModalOpen && activeRole && (
                <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 overflow-y-auto animate-in fade-in duration-200">
                    <div onClick={() => setIsEditModalOpen(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"></div>
                    
                    <div className="relative bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-10 py-8 bg-slate-900 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight tracking-widest">Update Capabilities</h3>
                                <p className="text-[10px] text-emerald-400 font-bold uppercase mt-1">Configuring: {activeRole.name}</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl hover:bg-white/20 focus:outline-none"><FaTimes/></button>
                        </div>
 
                        <div className="p-10 max-h-[500px] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {buildTree().map(parent => (
                                    <div key={parent.tabId} className="space-y-4">
                                        <div onClick={() => togglePermission(parent.tabId)} className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`text-xl transition-all ${editTabIds.includes(parent.tabId) ? `${themeText} scale-110` : 'text-slate-200'}`}>
                                                {editTabIds.includes(parent.tabId) ? <FaCheckSquare /> : <FaSquare />}
                                            </div>
                                            <span className={`font-black uppercase text-xs tracking-widest ${editTabIds.includes(parent.tabId) ? 'text-slate-900' : 'text-slate-400'}`}>{parent.name}</span>
                                        </div>
                                        <div className="ml-6 space-y-3 border-l-2 border-slate-50 pl-6">
                                            {parent.children.map(child => (
                                                <div key={child.tabId} onClick={() => togglePermission(child.tabId)} className="flex items-center gap-3 cursor-pointer group">
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${editTabIds.includes(child.tabId) ? `bg-[#3D3F96] border-[#3D3F96]` : 'bg-white border-slate-200'}`}>
                                                        {editTabIds.includes(child.tabId) && <FaCheck size={8} className="text-white" />}
                                                    </div>
                                                    <span className={`text-[11px] font-bold uppercase ${editTabIds.includes(child.tabId) ? 'text-slate-700' : 'text-slate-300'}`}>{child.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
 
                        <div className="p-8 bg-slate-50 border-t flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{editTabIds.length} Nodes Selected</span>
                            <button
                                onClick={handleUpdateSubmit}
                                disabled={updating}
                                className={`px-10 py-3.5 text-white font-black rounded-2xl shadow-xl focus:outline-none text-[11px] uppercase tracking-[0.2em] flex items-center gap-3 ${themeBg} ${themeHoverBg} ${themeShadow}`}
                            >
                                <FaSave /> {updating ? "Synchronizing..." : "Apply Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}