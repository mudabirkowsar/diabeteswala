"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom"; // Added for portal mounting
import { FaUserEdit, FaSignOutAlt } from "react-icons/fa";
import { HiMenuAlt2 } from "react-icons/hi";
import { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

// Import your API functions (Adjust the path based on your file structure)
import AdminAPI from "../../../../services/AdminAPI";

const AdminTopbar = ({ heading, toggleSidebar }) => {
    const [openProfile, setOpenProfile] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [mounted, setMounted] = useState(false); // Track mount state to avoid SSR issues with Portals
    const [adminData, setAdminData] = useState({
        name: "Loading...",
        email: "loading...",
        role: "subadmin"
    });

    const profileRef = useRef(null);
    const router = useRouter();

    // Primary Indigo Theme Color
    const themeColor = "#3D3F96";

    // Set mounted state once running on the client
    useEffect(() => {
        setMounted(true);
    }, []);

    // --- Fetch Real Profile Data on Mount ---
    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const response = await AdminAPI.getAdminProfile();
                if (response && response.success) {
                    setAdminData({
                        name: response.data.name,
                        email: response.data.email,
                        role: response.data.role
                    });
                }
            } catch (error) {
                console.error("Error fetching admin profile:", error);

                // Fallback to locally stored adminInfo if network is offline/latched
                const savedInfo = localStorage.getItem('adminInfo');
                if (savedInfo) {
                    try {
                        const parsed = JSON.parse(savedInfo);
                        setAdminData({
                            name: parsed.name || "Admin",
                            email: parsed.email || "system@diabeteswala.com",
                            role: parsed.role || "subadmin"
                        });
                    } catch (e) {
                        // Ignore parse failures
                    }
                }
            }
        };

        fetchAdminData();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setOpenProfile(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        // Clear all admin session credentials from localStorage
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');

        // Redirect back to Admin Login terminal
        router.push('/admin/login');
    };

    return (
        <nav className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 px-8 py-4 select-none">
            <Toaster position="top-right" />

            <div className="flex items-center justify-between relative">

                {/* LEFT SECTION */}
                <div className="flex items-center gap-4 min-w-[200px]">
                    {/* Trigger toggleSidebar when clicked */}
                    <button
                        onClick={toggleSidebar}
                        className="p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all text-gray-500 border border-gray-100 focus:outline-none"
                    >
                        <HiMenuAlt2 size={22} />
                    </button>
                    <div className="hidden lg:block">
                        <h2 className="text-lg font-black text-gray-800 leading-none">{heading}</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">System / {heading}</p>
                    </div>
                </div>

                {/* CENTER IDENTITY SECTION */}
                <div className="absolute left-1/2 -translate-x-1/2 text-center flex flex-col items-center">
                    <h3 className="text-base font-black text-gray-800 tracking-tight leading-none uppercase truncate max-w-[150px] sm:max-w-[250px]">
                        {adminData.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                        {/* Active status pulse using brand red #EB333C */}
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-[#EB333C]"></span>
                        <p className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: themeColor }}>
                            {adminData.role === 'superadmin' ? 'Super Admin' : 'Sub Admin'}
                        </p>
                    </div>
                </div>

                {/* RIGHT ACCOUNT SECTION */}
                <div className="flex items-center gap-4 min-w-[200px] justify-end" ref={profileRef}>
                    <div className="relative">
                        <button
                            onClick={() => setOpenProfile(!openProfile)}
                            className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-900 text-white shadow-lg hover:scale-105 transition-all focus:outline-none"
                        >
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white" style={{ backgroundColor: themeColor }}>
                                {adminData.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-widest hidden sm:block">Account</span>
                        </button>

                        {openProfile && (
                            <div className="absolute right-0 mt-4 w-64 bg-white rounded-[1.5rem] shadow-2xl border border-gray-100 py-3 transition-all duration-200">
                                <div className="px-6 py-3 border-b border-gray-50 mb-2">
                                    <p className="text-xs font-black text-gray-800 truncate">{adminData.email}</p>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Role: {adminData.role}</p>
                                </div>
                                <button
                                    onClick={() => { setOpenProfile(false); router.push('/admin/profile'); }}
                                    className="w-full flex items-center gap-3 px-6 py-3 text-[11px] text-gray-600 hover:bg-gray-50 font-black uppercase tracking-widest transition-all text-left"
                                >
                                    <FaUserEdit className="text-[#3D3F96] text-sm" /> Edit My Profile
                                </button>
                                <button
                                    onClick={() => { setOpenProfile(false); setShowLogoutModal(true); }}
                                    className="w-full flex items-center gap-3 px-6 py-3 text-[11px] text-red-500 hover:bg-red-50 font-black uppercase tracking-widest transition-all text-left border-t border-slate-50 mt-1"
                                >
                                    <FaSignOutAlt className="text-sm" /> Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- LOGOUT CONFIRMATION PORTAL MODAL --- */}
            {showLogoutModal && mounted && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setShowLogoutModal(false)}
                    />
                    
                    {/* Modal Box */}
                    <div className="bg-white rounded-[2rem] max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative z-10 flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#EB333C] flex items-center justify-center mb-4 shrink-0">
                            <FaSignOutAlt size={20} />
                        </div>
                        <h3 className="text-base font-black text-slate-900">Confirm Sign Out</h3>
                        <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
                            Are you sure you want to sign out? You will need to enter your credentials to access the admin panel again.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-3 w-full mt-6">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                className="py-3 bg-[#EB333C] hover:bg-red-700 text-white font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </nav>
    );
};

export default AdminTopbar;