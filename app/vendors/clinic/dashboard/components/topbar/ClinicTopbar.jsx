"use client";

import React, { useState, useRef, useEffect } from "react";
import { FaUserEdit, FaSignOutAlt, FaUser } from "react-icons/fa";
import { HiMenuAlt2 } from "react-icons/hi";
import { Toaster } from "react-hot-toast";

const ClinicTopbar = ({ heading, toggleSidebar }) => {
    const [openProfile, setOpenProfile] = useState(false);
    const profileRef = useRef(null);
    const themeColor = "#3D3F96";

    // Dynamic Clinic Vendor details based on your screenshot
    const clinicData = {
        name: "Diabetic 11",
        email: "diabeticclinic@yopmail.com",
        role: "Clinic Vendor",
        initial: "D"
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

    // Formatted current date matching the design
    const formattedDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "numeric",
        day: "numeric"
    });

    return (
        <nav className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 px-8 py-4 select-none">
            <Toaster position="top-right" />
           
            <div className="flex items-center justify-between relative">
               
                {/* LEFT SECTION - Toggle Button & Dynamic Headings */}
                <div className="flex items-center gap-4 min-w-[220px]">
                    <button 
                        onClick={toggleSidebar} 
                        className="p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all text-gray-500 border border-gray-100 focus:outline-none"
                    >
                        <HiMenuAlt2 size={22} />
                    </button>
                    <div className="hidden lg:block">
                        <h2 className="text-lg font-black text-gray-800 leading-none">{heading}</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">
                            Clinic Suite / {heading}
                        </p>
                    </div>
                </div>
         
                {/* CENTER IDENTITY SECTION */}
                <div className="absolute left-1/2 -translate-x-1/2 text-center hidden md:flex flex-col items-center">
                    <h3 className="text-base font-black text-gray-800 tracking-tight leading-none uppercase">
                        {clinicData.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-emerald-500"></span>
                        <p className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: themeColor }}>
                            {clinicData.role}
                        </p>
                    </div>
                </div>
         
                {/* RIGHT SECTION - Date & Profile menu */}
                <div className="flex items-center gap-6 min-w-[220px] justify-end" ref={profileRef}>
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Today's Date</span>
                        <span className="text-sm font-extrabold text-gray-700">{formattedDate}</span>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setOpenProfile(!openProfile)}
                            className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-900 text-white shadow-lg hover:scale-[1.02] active:scale-95 transition-all focus:outline-none"
                        >
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black text-white" style={{ backgroundColor: themeColor }}>
                                {clinicData.initial}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Account</span>
                        </button>
         
                        {openProfile && (
                            <div className="absolute right-0 mt-4 w-64 bg-white rounded-[1.5rem] shadow-2xl border border-gray-100 py-3 transition-all duration-200">
                                <div className="px-6 py-3 border-b border-gray-50 mb-2">
                                    <p className="text-xs font-black text-gray-800 truncate">{clinicData.name}</p>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{clinicData.email}</p>
                                </div>
                                <button 
                                    onClick={() => { setOpenProfile(false); alert("Edit Profile Clicked"); }}
                                    className="w-full flex items-center gap-3 px-6 py-3 text-[10px] text-gray-600 hover:bg-gray-50 font-black uppercase tracking-widest transition-all text-left focus:outline-none"
                                >
                                    <FaUserEdit className="text-[#3D3F96] text-sm" /> Edit Profile
                                </button>
                                <button 
                                    onClick={() => { setOpenProfile(false); alert("Sign Out Clicked"); }}
                                    className="w-full flex items-center gap-3 px-6 py-3 text-[10px] text-red-500 hover:bg-red-50 font-black uppercase tracking-widest transition-all text-left focus:outline-none"
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
         
export default ClinicTopbar;