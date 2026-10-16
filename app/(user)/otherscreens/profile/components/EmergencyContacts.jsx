"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Phone,
    User,
    Heart,
    Plus,
    Trash2,
    ShieldAlert,
    X,
    Loader2,
    Users,
    Info,
    ChevronDown,
    PhoneCall
} from 'lucide-react';
import { useNotification } from '../../../../context/NotificationContext';
import UserAPI from '../../../../services/UserAPI';

function EmergencyContacts() {
    const { showNotification } = useNotification();
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);

    const [formData, setFormData] = useState({
        contactName: '',
        phone: '',
        relation: ''
    });

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const response = await UserAPI.getEmergencyContactsList();
            if (response.success) {
                setContacts(response.data);
            }
        } catch (err) {
            showNotification("Failed to load emergency contacts", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const handleRemove = async (id) => {
        if (!window.confirm("Remove this emergency contact?")) return;
        try {
            const response = await UserAPI.removeEmergencyContact(id);
            if (response.success) {
                showNotification("Contact removed successfully", "success");
                fetchContacts();
            }
        } catch (err) {
            showNotification("Error removing contact", "error");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setBtnLoading(true);
            const response = await UserAPI.addEmergencyContact(formData);
            if (response.success) {
                showNotification("Emergency contact added", "success");
                setIsModalOpen(false);
                fetchContacts();
                setFormData({ contactName: '', phone: '', relation: '' });
            }
        } catch (err) {
            showNotification("Failed to add contact", "error");
        } finally {
            setBtnLoading(false);
        }
    };

    if (loading) return (
        <div className="p-8 sm:p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-red-500" size={36} />
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Loading Contacts...</p>
        </div>
    );

    return (
        <div className="p-3 sm:p-6 lg:p-10 antialiased">

            {/* --- HEADER --- */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-10">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Emergency Contacts</h1>
                    <Info size={18} className="text-red-400 shrink-0 sm:w-5 sm:h-5" />
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 border border-green-600 text-green-600 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:bg-green-50 transition-all active:scale-95"
                >
                    <Plus size={16} /> Add Contact
                </button>
            </div>

            {/* --- CONTACTS GRID --- */}
            {contacts.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {contacts.map((contact, index) => (
                        <motion.div
                            key={contact._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white p-3.5 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow gap-2 sm:gap-4"
                        >
                            <div className="flex items-center gap-3 sm:gap-5 min-w-0">
                                {/* Left Icon Box */}
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-red-500 shrink-0">
                                    <Heart className="w-5 h-5 sm:w-7 sm:h-7" />
                                </div>

                                {/* Center Info */}
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 flex-wrap">
                                        <h3 className="text-sm sm:text-lg font-bold text-slate-800 truncate">{contact.contactName}</h3>
                                        <span className="bg-red-50 text-red-500 text-[8px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
                                            {contact.relation}
                                        </span>
                                    </div>
                                    <p className="text-xs sm:text-sm font-bold text-slate-500 mb-1.5 sm:mb-2 truncate">{contact.phone}</p>
                                    
                                    <a 
                                        href={`tel:${contact.phone}`}
                                        className="inline-flex items-center gap-1 sm:gap-1.5 text-green-600 text-[10px] sm:text-[11px] font-black uppercase tracking-wider hover:underline"
                                    >
                                        <PhoneCall size={12} className="sm:w-3.5 sm:h-3.5" />
                                        Call Primary
                                    </a>
                                </div>
                            </div>

                            {/* Right Action */}
                            <button
                                onClick={() => handleRemove(contact._id)}
                                className="p-1.5 sm:p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg sm:rounded-xl transition-all shrink-0"
                            >
                                <Trash2 size={18} className="sm:w-5 sm:h-5" />
                            </button>
                        </motion.div>
                    ))}
                </div>
            ) : (
                /* --- EMPTY STATE --- */
                <div className="bg-white rounded-2xl sm:rounded-[3rem] border border-slate-100 p-8 sm:p-16 md:p-20 text-center shadow-sm">
                    <ShieldAlert size={48} className="mx-auto text-slate-200 mb-4 sm:mb-6 sm:w-16 sm:h-16" />
                    <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-1.5 sm:mb-2">No Contacts Added</h3>
                    <p className="text-xs sm:text-sm text-slate-500 mb-6 sm:mb-8 max-w-xs mx-auto">Add trusted individuals to be notified during emergencies.</p>
                    <button onClick={() => setIsModalOpen(true)} className="text-green-600 font-bold text-xs sm:text-sm hover:underline">Add First Contact</button>
                </div>
            )}

            {/* --- ADD CONTACT MODAL --- */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white w-full max-w-md rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-5 sm:mb-8">
                                <h2 className="text-lg sm:text-xl font-bold text-slate-800">Add Emergency Contact</h2>
                                <button onClick={() => setIsModalOpen(false)} className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={18} className="sm:w-5 sm:h-5" /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                                <div className="space-y-1">
                                    <label className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contact Name</label>
                                    <input
                                        required
                                        value={formData.contactName}
                                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                        className="w-full px-4 sm:px-5 py-2.5 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold outline-none focus:border-green-600 transition-all"
                                        placeholder="Full Name"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Relationship</label>
                                    <select
                                        required
                                        value={formData.relation}
                                        onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                                        className="w-full px-4 sm:px-5 py-2.5 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold outline-none"
                                    >
                                        <option value="">Select Relation</option>
                                        <option value="SPOUSE">Spouse</option>
                                        <option value="PARENT">Parent</option>
                                        <option value="SIBLING">Sibling</option>
                                        <option value="FRIEND">Friend</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                    <input
                                        required
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 sm:px-5 py-2.5 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold outline-none focus:border-green-600 transition-all"
                                        placeholder="9876543210"
                                    />
                                </div>

                                <button
                                    disabled={btnLoading}
                                    type="submit"
                                    className="w-full py-3 sm:py-4 bg-green-600 text-white rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm shadow-md sm:shadow-lg shadow-green-100 hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                                >
                                    {btnLoading ? <Loader2 className="animate-spin" size={16} /> : "SAVE CONTACT"}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default EmergencyContacts;