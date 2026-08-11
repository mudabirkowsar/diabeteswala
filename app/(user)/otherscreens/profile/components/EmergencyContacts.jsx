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
        <div className="p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-red-500" size={40} />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Contacts...</p>
        </div>
    );

    return (
        <div className="p-6 lg:p-10">

            {/* --- HEADER --- */}
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-slate-800">Emergency Contacts</h1>
                    <Info size={20} className="text-red-400" />
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 border border-green-600 text-green-600 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-green-50 transition-all"
                >
                    <Plus size={18} /> Add Contact
                </button>
            </div>

            {/* --- CONTACTS GRID --- */}
            {contacts.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {contacts.map((contact, index) => (
                        <motion.div
                            key={contact._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center gap-5">
                                {/* Left Icon Box */}
                                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
                                    <Heart size={28} />
                                </div>

                                {/* Center Info */}
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-lg font-bold text-slate-800">{contact.contactName}</h3>
                                        <span className="bg-red-50 text-red-500 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                                            {contact.relation}
                                        </span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-500 mb-2">{contact.phone}</p>
                                    
                                    <a 
                                        href={`tel:${contact.phone}`}
                                        className="flex items-center gap-1.5 text-green-600 text-[11px] font-black uppercase tracking-wider hover:underline"
                                    >
                                        <PhoneCall size={14} />
                                        Call Primary
                                    </a>
                                </div>
                            </div>

                            {/* Right Action */}
                            <button
                                onClick={() => handleRemove(contact._id)}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            >
                                <Trash2 size={20} />
                            </button>
                        </motion.div>
                    ))}
                </div>
            ) : (
                /* --- EMPTY STATE --- */
                <div className="bg-white rounded-[3rem] border border-slate-100 p-20 text-center shadow-sm">
                    <ShieldAlert size={60} className="mx-auto text-slate-200 mb-6" />
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No Contacts Added</h3>
                    <p className="text-sm text-slate-500 mb-8 max-w-xs mx-auto">Add trusted individuals to be notified during emergencies.</p>
                    <button onClick={() => setIsModalOpen(true)} className="text-green-600 font-bold text-sm hover:underline">Add First Contact</button>
                </div>
            )}

            {/* --- ADD CONTACT MODAL --- */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xl font-bold text-slate-800">Add Emergency Contact</h2>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contact Name</label>
                                    <input
                                        required
                                        value={formData.contactName}
                                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-green-600 transition-all"
                                        placeholder="Full Name"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Relationship</label>
                                    <select
                                        required
                                        value={formData.relation}
                                        onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none"
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
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                    <input
                                        required
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-green-600 transition-all"
                                        placeholder="9876543210"
                                    />
                                </div>

                                <button
                                    disabled={btnLoading}
                                    type="submit"
                                    className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-green-100 hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {btnLoading ? <Loader2 className="animate-spin" size={18} /> : "SAVE CONTACT"}
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