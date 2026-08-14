"use client";

import { useState, useMemo, useEffect } from "react";
import { 
    FaClinicMedical, FaSearch,FaUserMd, FaFilter, FaUndo, FaSync, 
    FaMapMarkerAlt, FaEye, FaCheck, FaTimes, FaInbox, 
    FaFileContract, FaPhoneAlt, FaEnvelope, FaRegClock, FaIdCard 
} from "react-icons/fa";

export default function ClinicManagement() {
    // 1. Standalone Mock Data with exactly 4 realistic clinic entries
    const [clinics, setClinics] = useState([
        { 
            id: 1, 
            initial: "O",
            name: "Omninos Health Clinic", 
            doctor: "Dr. Amit Verma (MD, Cardiology)",
            email: "contact@omninoshealth.com", 
            phone: "+91 98765 43210", 
            specialty: "Cardiology & Diabetes Care", 
            location: "Mohali, Punjab", 
            license: "LIC-998811",
            timing: "09:00 AM - 05:00 PM",
            status: "Pending" // 'Pending', 'Approved', 'Rejected'
        },
        { 
            id: 2, 
            initial: "A",
            name: "Apex Skin & Laser Center", 
            doctor: "Dr. Priya Sharma (MBBS, MS)",
            email: "care@apexskin.com", 
            phone: "+91 87654 32109", 
            specialty: "Dermatology & Cosmetology", 
            location: "Jaipur, Rajasthan", 
            license: "LIC-775533",
            timing: "10:00 AM - 07:00 PM",
            status: "Approved"
        },
        { 
            id: 3, 
            initial: "C",
            name: "Care Diabetes Center", 
            doctor: "Dr. Rajesh Choudhary (MBBS, BAMS)",
            email: "info@carediabetes.com", 
            phone: "+91 76543 21098", 
            specialty: "Diabetology & Medicine", 
            location: "Mohali, Punjab", 
            license: "LIC-442211",
            timing: "08:00 AM - 04:00 PM",
            status: "Pending"
        },
        { 
            id: 4, 
            initial: "L",
            name: "LifeLine MultiSpecialty", 
            doctor: "Dr. Suresh Kumar (MD, Pediatrics)",
            email: "lifeline@yopmail.com", 
            phone: "+91 65432 10987", 
            specialty: "Pediatrics & Family Medicine", 
            location: "New Delhi, Delhi", 
            license: "LIC-221188",
            timing: "11:00 AM - 08:00 PM",
            status: "Rejected"
        }
    ]);

    // Filter, Search, and Modal States
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [showModal, setShowModal] = useState(false);
    const [selectedClinic, setSelectedMedicine] = useState(null);

    // Theme Color Tokens based on #3D3F96
    const themeBg = "bg-[#3D3F96]";
    const themeText = "text-[#3D3F96]";
    const themeHoverBg = "hover:bg-[#2C2D75]";
    const themeShadow = "shadow-[#3D3F96]/20";
    const themeRing = "focus:ring-[#3D3F96]/30";

    // Dynamic filtering using useMemo
    const filteredClinics = useMemo(() => {
        return clinics.filter(clinic => {
            const matchesSearch = 
                clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                clinic.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                clinic.specialty.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === "All" || clinic.status.toLowerCase() === statusFilter.toLowerCase();

            return matchesSearch && matchesStatus;
        });
    }, [clinics, searchTerm, statusFilter]);

    // Handle Approve Status
    const handleApprove = (id) => {
        setClinics(prev => prev.map(c => 
            c.id === id ? { ...c, status: "Approved" } : c
        ));
    };

    // Handle Reject Status
    const handleReject = (id) => {
        setClinics(prev => prev.map(c => 
            c.id === id ? { ...c, status: "Rejected" } : c
        ));
    };

    // Trigger detailed info modal
    const handleViewDetails = (clinic) => {
        setSelectedMedicine(clinic);
        setShowModal(true);
    };

    const handleResetFilters = () => {
        setSearchTerm("");
        setStatusFilter("All");
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 py-8 select-none animate-fadeIn">
            
            {/* 1. TOP HEADER SECTION */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center shrink-0">
                        <FaClinicMedical className="text-xl" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-800 tracking-tight leading-snug">Clinic Verification &amp; Approvals</h2>
                        <p className="text-xs text-gray-400">Verify, track, and manage pending clinic listings and registrations</p>
                    </div>
                </div>

                <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-[#3D3F96]/10 text-[#3D3F96]">
                    Total Registered: {clinics.length}
                </span>
            </div>

            {/* 2. SEARCH & FILTER CONTROLS */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col md:flex-row items-center justify-between gap-4">
                
                {/* Search Input */}
                <div className="relative w-full md:w-80">
                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search by clinic name, doctor, or specialty..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`pl-9 pr-4 py-2 w-full rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                    />
                </div>

                {/* Dropdowns Status */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                    >
                        <option value="All">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>

                    <button 
                        onClick={handleResetFilters}
                        className="p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 hover:text-gray-800 transition-all focus:outline-none"
                        title="Reset Filters"
                    >
                        <FaUndo className="text-xs" />
                    </button>
                </div>
            </div>

            {/* 3. CLINICS DATA GRID TABLE */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[1000px] table-auto align-middle">
                        <thead>
                            <tr className="text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50 border-b border-gray-100">
                                <th className="text-center px-6 py-4 w-16">S No.</th>
                                <th className="text-center px-6 py-4 w-20">Profile</th>
                                <th className="text-left px-6 py-4">Clinic Identity</th>
                                <th className="text-left px-6 py-4">Contact &amp; Specialty</th>
                                <th className="text-left px-6 py-4">Location</th>
                                <th className="text-center px-6 py-4">Verification Status</th>
                                <th className="text-center px-6 py-4 w-48">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredClinics.length > 0 ? (
                                filteredClinics.map((clinic, index) => (
                                    <tr 
                                        key={clinic.id}
                                        className="hover:bg-gray-50/60 transition-colors duration-150"
                                    >
                                        {/* S No. */}
                                        <td className="px-6 py-4 text-center font-bold text-gray-400 text-xs">
                                            {String(index + 1).padStart(2, "0")}
                                        </td>

                                        {/* Profile Initial */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full font-black text-white text-xs shrink-0 shadow-sm bg-[#3D3F96]">
                                                {clinic.initial}
                                            </div>
                                        </td>

                                        {/* Clinic Name & Doctor */}
                                        <td className="px-6 py-4">
                                            <h3 className="font-bold text-gray-800 tracking-tight leading-none">{clinic.name}</h3>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mt-1.5">{clinic.doctor}</p>
                                        </td>

                                        {/* Contact & Specialty */}
                                        <td className="px-6 py-4 space-y-1">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-600 font-bold">
                                                <FaPhoneAlt className="text-gray-300 text-[10px]" />
                                                {clinic.phone}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-semibold">
                                                <FaEnvelope className="text-gray-300 text-[10px]" />
                                                {clinic.email}
                                            </div>
                                            <p className="text-[10px] text-emerald-600 font-black uppercase tracking-wide pt-1">{clinic.specialty}</p>
                                        </td>

                                        {/* Location */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-600 font-bold">
                                                <FaMapMarkerAlt className="text-rose-500" />
                                                {clinic.location}
                                            </div>
                                        </td>

                                        {/* Verification Status Badge */}
                                        <td className="px-6 py-4 text-center">
                                            {clinic.status === "Approved" ? (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide">
                                                    Approved
                                                </span>
                                            ) : clinic.status === "Pending" ? (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wide">
                                                    Pending
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100 uppercase tracking-wide">
                                                    Rejected
                                                </span>
                                            )}
                                        </td>

                                        {/* Action Buttons */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {/* Approve Action */}
                                                <button
                                                    onClick={() => handleApprove(clinic.id)}
                                                    disabled={clinic.status === "Approved"}
                                                    className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                                    title="Approve Clinic"
                                                >
                                                    <FaCheck className="text-xs" />
                                                </button>

                                                {/* Reject Action */}
                                                <button
                                                    onClick={() => handleReject(clinic.id)}
                                                    disabled={clinic.status === "Rejected"}
                                                    className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                                    title="Reject Clinic"
                                                >
                                                    <FaTimes className="text-xs" />
                                                </button>

                                                {/* View Info Action (Opens Modal) */}
                                                <button
                                                    onClick={() => handleViewDetails(clinic)}
                                                    className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-[#3D3F96] border border-indigo-100/60 transition-all"
                                                    title="View Clinic Details"
                                                >
                                                    <FaEye className="text-xs" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                /* Empty Filter State */
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center text-slate-400 font-semibold text-xs">
                                        No clinic listings match the current search or status filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 4. PREMIUM CLINIC INFO DETAILS MODAL */}
            {showModal && selectedClinic && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 p-6 relative flex flex-col gap-6 select-none animate-in zoom-in-95 duration-200">
                        
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/15 text-[#3D3F96] flex items-center justify-center shrink-0">
                                    <FaClinicMedical className="text-lg" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black tracking-tight text-gray-800">{selectedClinic.name}</h3>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mt-0.5">Clinic ID: #{selectedClinic.id}</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-400 flex items-center justify-center transition-colors focus:outline-none"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Modal Form/Info Body */}
                        <div className="space-y-4 text-sm text-gray-600">
                            
                            {/* Doctor & Specialty Block */}
                            <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
                                <div className="flex items-center gap-2">
                                    <FaUserMd className={themeText} />
                                    <span className="font-bold text-gray-800">{selectedClinic.doctor}</span>
                                </div>
                                <div className="text-xs text-emerald-600 font-bold uppercase tracking-wider pl-7">
                                    {selectedClinic.specialty}
                                </div>
                            </div>

                            {/* Contact Details */}
                            <div className="space-y-2.5 px-2">
                                <div className="flex items-center gap-3 text-xs font-semibold text-gray-700">
                                    <FaPhoneAlt className="text-gray-400 text-sm" />
                                    <span>Phone: <strong className="text-gray-800">{selectedClinic.phone}</strong></span>
                                </div>
                                <div className="flex items-center gap-3 text-xs font-semibold text-gray-700">
                                    <FaEnvelope className="text-gray-400 text-sm" />
                                    <span>Email: <strong className="text-gray-800">{selectedClinic.email}</strong></span>
                                </div>
                                <div className="flex items-center gap-3 text-xs font-semibold text-gray-700">
                                    <FaMapMarkerAlt className="text-rose-500 text-sm" />
                                    <span>Location: <strong className="text-gray-800">{selectedClinic.location}</strong></span>
                                </div>
                                <div className="flex items-center gap-3 text-xs font-semibold text-gray-700">
                                    <FaIdCard className="text-gray-400 text-sm" />
                                    <span>License Number: <strong className="font-mono text-gray-800">{selectedClinic.license}</strong></span>
                                </div>
                                <div className="flex items-center gap-3 text-xs font-semibold text-gray-700">
                                    <FaRegClock className="text-gray-400 text-sm" />
                                    <span>Timings: <strong className="text-gray-800">{selectedClinic.timing}</strong></span>
                                </div>
                            </div>

                            {/* Verification Banner */}
                            <div className="pt-2">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Registration Status</span>
                                {selectedClinic.status === "Approved" ? (
                                    <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl p-3 text-xs font-bold uppercase tracking-wide text-center">
                                        Approved &amp; Verified
                                    </div>
                                ) : selectedClinic.status === "Pending" ? (
                                    <div className="bg-amber-50 text-amber-700 border border-amber-100 rounded-xl p-3 text-xs font-bold uppercase tracking-wide text-center animate-pulse">
                                        Awaiting Verification
                                    </div>
                                ) : (
                                    <div className="bg-rose-50 text-rose-700 border border-rose-100 rounded-xl p-3 text-xs font-bold uppercase tracking-wide text-center">
                                        Listing Rejected
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer Controls */}
                        <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-4 shrink-0">
                            <button 
                                type="button" 
                                onClick={() => setShowModal(false)}
                                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold uppercase tracking-wider transition-all focus:outline-none"
                            >
                                Close
                            </button>
                            {selectedClinic.status === "Pending" && (
                                <button 
                                    onClick={() => { handleApprove(selectedClinic.id); setShowModal(false); }}
                                    className={`flex items-center gap-1.5 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all focus:outline-none ${themeBg} ${themeHoverBg}`}
                                >
                                    Approve Now
                                </button>
                            )}
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}