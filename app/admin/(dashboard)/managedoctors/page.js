"use client";

import { useState, useMemo } from "react";
import { 
    FaUserMd, FaCalendarAlt, FaSearch, FaFilter, FaSync, 
    FaMapMarkerAlt, FaEye, FaInbox, FaStethoscope, FaPhoneAlt, FaEnvelope 
} from "react-icons/fa";

export default function ManageDoctors() {
    // 1. Standalone Mock Data with realistic changed names and specializations
    const [doctors, setDoctors] = useState([
        { 
            id: 1, 
            name: "Dr. Amit Verma", 
            qualifications: "MD, MBBS", 
            specialty: "Cardiologist", 
            phone: "+91 98765 43210", 
            email: "dr.amit@diabeteswala.com", 
            location: "Mohali, Punjab", 
            isOnDuty: false, 
            access: true, 
            status: "Incomplete", 
            image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&auto=format&fit=crop" 
        },
        { 
            id: 2, 
            name: "Dr. Priya Sharma", 
            qualifications: "MBBS, MS", 
            specialty: "Dermatologist", 
            phone: "+91 87654 32109", 
            email: "dr.priya@diabeteswala.com", 
            location: "Jaipur, Rajasthan", 
            isOnDuty: false, 
            access: true, 
            status: "Approved", 
            image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop" 
        },
        { 
            id: 3, 
            name: "Dr. Rajesh Choudhary", 
            qualifications: "MBBS, BAMS", 
            specialty: "Diabetologist", 
            phone: "+91 76543 21098", 
            email: "dr.rajesh@diabeteswala.com", 
            location: "Mohali, Punjab", 
            isOnDuty: true, 
            access: true, 
            status: "Approved", 
            image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop" 
        }
    ]);

    // Filter and Search States
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    // Brand theme configurations based on #3D3F96
    const themeBg = "bg-[#3D3F96]";
    const themeText = "text-[#3D3F96]";
    const themeHoverBg = "hover:bg-[#2C2D75]";
    const themeShadow = "shadow-[#3D3F96]/20";
    const themeRing = "focus:ring-[#3D3F96]/30";

    // Dynamic sorting and filtering logic using useMemo
    const filteredDoctors = useMemo(() => {
        return doctors.filter(doc => {
            const matchesSearch = 
                doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.specialty.toLowerCase().includes(searchTerm.toLowerCase());
            
            let matchesStatus = true;
            if (statusFilter !== "All") {
                matchesStatus = doc.status.toLowerCase() === statusFilter.toLowerCase();
            }

            return matchesSearch && matchesStatus;
        });
    }, [doctors, searchTerm, statusFilter]);

    // Handler to toggle active status / App Access
    const toggleAccess = (id) => {
        setDoctors(prev => prev.map(doc => 
            doc.id === id ? { ...doc, access: !doc.access } : doc
        ));
    };

    // Handler to toggle Duty status dynamically
    const toggleDuty = (id) => {
        setDoctors(prev => prev.map(doc => 
            doc.id === id ? { ...doc, isOnDuty: !doc.isOnDuty } : doc
        ));
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
                        <FaUserMd className="text-xl" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-800 tracking-tight leading-snug">Manage Doctors</h2>
                        <p className="text-xs text-gray-400">Review, edit, and configure doctor appointment settings</p>
                    </div>
                </div>

                {/* Reschedule Button styled with your Indigo theme */}
                <button 
                    onClick={() => alert("Reschedule Settings Clicked (Mock Mode)")}
                    className={`flex items-center justify-center gap-2 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all focus:outline-none ${themeBg} ${themeHoverBg} ${themeShadow} shadow-lg`}
                >
                    <FaCalendarAlt className="text-xs" /> Reschedule Settings
                </button>
            </div>

            {/* 2. SEARCH & FILTER CONTROLS */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col md:flex-row items-center justify-between gap-4">
                
                {/* Custom Styled Search Box */}
                <div className="relative w-full md:w-80">
                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search by doctor name..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`pl-9 pr-4 py-2 w-full rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                    />
                </div>

                {/* Status Dropdowns and Reset Controls */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                    >
                        <option value="All">All Profile Status</option>
                        <option value="Approved">Approved</option>
                        <option value="Incomplete">Incomplete</option>
                    </select>

                    <button 
                        onClick={handleResetFilters}
                        className="p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 hover:text-gray-800 transition-all focus:outline-none"
                        title="Reset Filters"
                    >
                        <FaSync className="text-xs" />
                    </button>
                </div>
            </div>

            {/* 3. MANAGE DOCTORS DATA GRID TABLE */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[1000px] table-auto align-middle">
                        <thead>
                            <tr className="text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50 border-b border-gray-100">
                                <th className="text-center px-6 py-4 w-16">S No.</th>
                                <th className="text-left px-6 py-4">Doctor Identity</th>
                                <th className="text-left px-6 py-4">Contact &amp; Role</th>
                                <th className="text-left px-6 py-4">Location</th>
                                <th className="text-center px-6 py-4">Duty</th>
                                <th className="text-center px-6 py-4">App Access</th>
                                <th className="text-center px-6 py-4">Profile Status</th>
                                <th className="text-center px-6 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredDoctors.length > 0 ? (
                                filteredDoctors.map((doc, index) => (
                                    <tr 
                                        key={doc.id}
                                        className="hover:bg-gray-50/60 transition-colors duration-150"
                                    >
                                        {/* S.No */}
                                        <td className="px-6 py-4 text-center font-bold text-gray-400 text-xs">
                                            {String(index + 1).padStart(2, "0")}
                                        </td>

                                        {/* Doctor Identity */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-100 shadow-sm shrink-0">
                                                    <img 
                                                        src={doc.image} 
                                                        alt={doc.name} 
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-800 tracking-tight leading-none">{doc.name}</h3>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mt-1">
                                                        {doc.qualifications} • <span className="text-emerald-600 font-black">{doc.specialty}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Contact & Role */}
                                        <td className="px-6 py-4 space-y-1">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-600 font-bold">
                                                <FaPhoneAlt className="text-gray-300 text-[10px]" />
                                                {doc.phone}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-semibold">
                                                <FaEnvelope className="text-gray-300 text-[10px]" />
                                                {doc.email}
                                            </div>
                                            <div className="pt-1">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[9px] font-bold bg-[#3D3F96]/10 text-[#3D3F96] uppercase tracking-wider">
                                                    <FaUserMd className="text-[9px]" /> Doctor
                                                </span>
                                            </div>
                                        </td>

                                        {/* Location */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-600 font-bold">
                                                <FaMapMarkerAlt className="text-rose-500" />
                                                {doc.location}
                                            </div>
                                        </td>

                                        {/* Duty toggling */}
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => toggleDuty(doc.id)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all focus:outline-none ${
                                                    doc.isOnDuty 
                                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                                        : "bg-slate-50 text-slate-400 border border-slate-100"
                                                }`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${doc.isOnDuty ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
                                                {doc.isOnDuty ? "On Duty" : "Off Duty"}
                                            </button>
                                        </td>

                                        {/* App Access Toggle Switch */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center justify-center">
                                                <button
                                                    onClick={() => toggleAccess(doc.id)}
                                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                        doc.access ? "bg-emerald-500" : "bg-gray-200"
                                                    }`}
                                                >
                                                    <span
                                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                            doc.access ? "translate-x-5" : "translate-x-0"
                                                        }`}
                                                    />
                                                </button>
                                            </div>
                                        </td>

                                        {/* Profile Status Badge */}
                                        <td className="px-6 py-4 text-center">
                                            {doc.status === "Approved" ? (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide">
                                                    Approved
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-[#3D3F96] border border-indigo-100 uppercase tracking-wide">
                                                    Incomplete
                                                </span>
                                            )}
                                        </td>

                                        {/* Action Button */}
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => alert(`Viewing profile of ${doc.name} (Mock Mode)`)}
                                                className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all focus:outline-none"
                                            >
                                                <FaEye className="text-sm" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                /* Empty State Screen for Filter Results */
                                <tr>
                                    <td colSpan={8} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                                <FaInbox className="text-3xl" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-700">No Doctor Profiles Found</h4>
                                                <p className="text-xs text-slate-400 mt-1">Adjust your search parameters or filter options to view results.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}