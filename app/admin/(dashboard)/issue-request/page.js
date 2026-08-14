"use client";

import { useState, useMemo, useEffect } from "react";
import { 
    FaHeadset, FaPlus, FaArrowLeft, FaSearch, FaEdit, 
    FaTrash, FaTimes, FaUser, FaExclamationTriangle, 
    FaInfoCircle, FaCheckCircle, FaInbox, FaTicketAlt 
} from "react-icons/fa";

export default function HelpRequests() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Royal Indigo theme configurations based on #3D3F96
    const themeBg = "bg-[#3D3F96]";
    const themeText = "text-[#3D3F96]";
    const themeHoverBg = "hover:bg-[#2C2D75]";
    const themeShadow = "shadow-[#3D3F96]/20";
    const themeRing = "focus:ring-[#3D3F96]/30";

    // 1. Standalone Mock Data with realistic changed names and details
    const [tickets, setTickets] = useState([
        { 
            id: 1, 
            ref: "TK-102", 
            title: "Medicine buying issue.", 
            user: "Raman Malhotra", 
            priority: "High Priority", 
            detail: "User is reporting a critical checkout failure while trying to purchase diabetes medicines on the portal.", 
            date: "2026-07-16" 
        },
        { 
            id: 2, 
            ref: "TK-103", 
            title: "Service booking problem.", 
            user: "Neha Sharma", 
            priority: "Medium Priority", 
            detail: "Unable to schedule or confirm lab appointment slots on the clinic dashboard.", 
            date: "2026-07-15" 
        },
        { 
            id: 3, 
            ref: "TK-104", 
            title: "Booking Hospital bed issue.", 
            user: "Siddharth Roy", 
            priority: "Low Priority", 
            detail: "Awaiting bed allocation verification status updates from the regional hospital channel.", 
            date: "2026-07-14" 
        },
        { 
            id: 4, 
            ref: "TK-105", 
            title: "Profile update problem.", 
            user: "Aanya Gupta", 
            priority: "Medium Priority", 
            detail: "Driver license and verification documents are pending administrative review.", 
            date: "2026-07-13" 
        }
    ]);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    // Interactive Search Logic
    const filteredTickets = useMemo(() => {
        return tickets.filter(t => 
            t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.ref.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [tickets, searchTerm]);

    const handleOpenModal = (ticket) => {
        setSelectedTicket({ ...ticket });
        setShowModal(true);
    };

    const handleSaveTicket = (e) => {
        e.preventDefault();
        setTickets(prev => prev.map(t => t.id === selectedTicket.id ? selectedTicket : t));
        setShowModal(false);
        setSelectedTicket(null);
    };

    const handleDeleteTicket = (id) => {
        if (window.confirm("Are you sure you want to delete this support ticket?")) {
            setTickets(prev => prev.filter(t => t.id !== id));
        }
    };

    // Priority color mapping helper
    const getPriorityClasses = (priority) => {
        if (priority.includes("High")) return "bg-rose-50 text-rose-600 border border-rose-100";
        if (priority.includes("Medium")) return "bg-amber-50 text-amber-600 border border-amber-100";
        return "bg-blue-50 text-blue-600 border border-blue-100";
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 py-8 select-none animate-fadeIn">
            
            {/* 1. TOP HEADER SECTION */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center shrink-0">
                        <FaHeadset className="text-xl" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-800 tracking-tight leading-snug">Help Requests</h2>
                        <p className="text-xs text-gray-400">Review, process, and track system support ticket registries</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                    <button 
                        onClick={() => alert("New Ticket Feature (Mock Mode)")}
                        className={`flex items-center gap-2 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all focus:outline-none ${themeBg} ${themeHoverBg} ${themeShadow} shadow-lg`}
                    >
                        <FaPlus className="text-xs" /> New Ticket
                    </button>
                    <button 
                        onClick={() => alert("Back Feature (Mock Mode)")}
                        className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-semibold transition-all focus:outline-none"
                    >
                        <FaArrowLeft className="text-xs" /> Back
                    </button>
                </div>
            </div>

            {/* 2. SEARCH CONTROL BAR */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
                <div className="relative w-full md:w-80">
                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search requests..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`pl-9 pr-4 py-2 w-full rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                    />
                </div>
            </div>

            {/* 3. HELP REQUESTS LIST AREA */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[850px] table-auto align-middle">
                        <thead>
                            <tr className="text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50 border-b border-gray-100">
                                <th className="text-center px-6 py-4 w-16">S No.</th>
                                <th className="text-left px-6 py-4">Help Request / Issue</th>
                                <th className="text-center px-6 py-4 w-40">Priority</th>
                                <th className="text-center px-6 py-4 w-32">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredTickets.length > 0 ? (
                                filteredTickets.map((ticket, index) => (
                                    <tr 
                                        key={ticket.id} 
                                        className="hover:bg-gray-50/60 transition-colors duration-150"
                                    >
                                        {/* S No. */}
                                        <td className="px-6 py-4 text-center font-bold text-gray-400 text-xs">
                                            {String(index + 1).padStart(2, "0")}
                                        </td>

                                        {/* Help Request Details */}
                                        <td className="px-6 py-4">
                                            <h3 className="font-bold text-gray-800 tracking-tight leading-none capitalize">{ticket.title}</h3>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-2 flex items-center gap-1.5">
                                                <span>REF: {ticket.ref}</span>
                                                <span className="text-gray-300">•</span>
                                                <span>BY: <span className="text-gray-600 font-extrabold">{ticket.user}</span></span>
                                            </p>
                                        </td>

                                        {/* Priority badge */}
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${getPriorityClasses(ticket.priority)}`}>
                                                {ticket.priority}
                                            </span>
                                        </td>

                                        {/* Actions (View/Delete) */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(ticket)}
                                                    className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all focus:outline-none"
                                                    title="View Summary"
                                                >
                                                    <FaEdit className="text-xs" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTicket(ticket.id)}
                                                    className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-700 transition-all focus:outline-none"
                                                    title="Delete Ticket"
                                                >
                                                    <FaTrash className="text-xs" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                /* Empty Filtered State */
                                <tr>
                                    <td colSpan={4} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                                <FaInbox className="text-3xl" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-700">No Tickets Found</h4>
                                                <p className="text-xs text-slate-400 mt-1">Adjust your search parameters to view matching tickets.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 4. PREMIUM TICKET SUMMARY MODAL */}
            {showModal && selectedTicket && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-100 p-6 relative flex flex-col gap-6 select-none animate-in zoom-in-95 duration-200">
                        
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/15 text-[#3D3F96] flex items-center justify-center shrink-0">
                                    <FaTicketAlt className="text-lg" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black tracking-tight text-gray-800">Ticket Summary</h3>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mt-0.5">HK Internal Support System</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => { setShowModal(false); setSelectedTicket(null); }}
                                className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-400 flex items-center justify-center transition-colors focus:outline-none"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Modal Body Form Area */}
                        <form onSubmit={handleSaveTicket} className="space-y-6">
                            
                            {/* User Identity & Ticket Priority Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">User Identity</label>
                                    <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700">
                                        <FaUser className="text-gray-400 text-xs shrink-0" />
                                        {selectedTicket.user}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ticket Priority</label>
                                    <div className="relative">
                                        <select 
                                            value={selectedTicket.priority}
                                            onChange={(e) => setSelectedTicket({ ...selectedTicket, priority: e.target.value })}
                                            className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none w-full focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                                        >
                                            <option value="High Priority">High Priority</option>
                                            <option value="Medium Priority">Medium Priority</option>
                                            <option value="Low Priority">Low Priority</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* The Help Request Title */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <FaExclamationTriangle className="text-amber-500" /> The Help Request
                                </label>
                                <div className="bg-[#3D3F96]/5 border border-indigo-50/50 rounded-xl p-4 text-xs font-black text-[#3D3F96] uppercase tracking-wide">
                                    {selectedTicket.title}
                                </div>
                            </div>

                            {/* Detailed Log/Message */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Detailed Log / Message</label>
                                <textarea 
                                    rows="4"
                                    value={selectedTicket.detail}
                                    onChange={(e) => setSelectedTicket({ ...selectedTicket, detail: e.target.value })}
                                    className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all resize-none`}
                                />
                            </div>

                            {/* Support Resolution Trace Information Banner */}
                            <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 flex items-start gap-3.5">
                                <FaInfoCircle className="text-blue-500 text-base shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide leading-none">Support Resolution Trace</h4>
                                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                                        This request was logged on <strong className="text-slate-700">{selectedTicket.date}</strong>. Our support agents are currently investigating and tracking this matter.
                                    </p>
                                </div>
                            </div>

                            {/* Modal Footer Controls */}
                            <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-4 shrink-0">
                                <button 
                                    type="button" 
                                    onClick={() => { setShowModal(false); setSelectedTicket(null); }}
                                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold uppercase tracking-wider transition-all focus:outline-none"
                                >
                                    Close
                                </button>
                                <button 
                                    type="submit" 
                                    className={`flex items-center gap-1.5 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all focus:outline-none ${themeBg} ${themeHoverBg} ${themeShadow} shadow-lg`}
                                >
                                    Update Ticket
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            )}
        </div>
    );
}