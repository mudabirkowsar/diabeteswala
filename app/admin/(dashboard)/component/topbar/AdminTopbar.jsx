"use client";
 
import React, { useState, useRef, useEffect } from "react";
import { FaUserEdit, FaSignOutAlt } from "react-icons/fa";
import { HiMenuAlt2 } from "react-icons/hi";
import { Toaster } from "react-hot-toast";
 
// Accept toggleSidebar prop from layout.js
const AdminTopbar = ({ heading, toggleSidebar }) => {
    const [openProfile, setOpenProfile] = useState(false);
    const profileRef = useRef(null);
    
    // Updated primary theme color to Royal Indigo (#3D3F96)
    const themeColor = "#3D3F96";

    const adminData = {
        name: "Rahul Sharma",
        email: "rahul.sharma@diabeteswala.com",
        role: "superadmin"
    };
 
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
 
    const handleLogoutMock = () => {
        alert("Sign Out Clicked (Mock Mode)");
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
                    <h3 className="text-base font-black text-gray-800 tracking-tight leading-none uppercase">
                        {adminData.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: themeColor }}></span>
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
                                    onClick={() => { setOpenProfile(false); alert("Edit Profile Clicked (Mock Mode)"); }}
                                    className="w-full flex items-center gap-3 px-6 py-3 text-[11px] text-gray-600 hover:bg-gray-50 font-black uppercase tracking-widest transition-all text-left"
                                >
                                    <FaUserEdit className="text-[#3D3F96] text-sm" /> Edit My Profile
                                </button>
                                <button 
                                    onClick={handleLogoutMock} 
                                    className="w-full flex items-center gap-3 px-6 py-3 text-[11px] text-red-500 hover:bg-red-50 font-black uppercase tracking-widest transition-all text-left"
                                >
                                    <FaSignOutAlt className="text-sm" /> Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};
 
export default AdminTopbar;