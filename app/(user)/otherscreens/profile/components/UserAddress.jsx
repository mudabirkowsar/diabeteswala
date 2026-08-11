"use client";
import React, { useState, useEffect } from 'react';
import {
    MapPin,
    Plus,
    Trash2,
    CheckCircle2,
    Home,
    Briefcase,
    MoreHorizontal,
    Phone,
    Navigation,
    X,
    Loader2,
    Globe,
    Map,
    Pencil // Added Pencil icon
} from 'lucide-react';
import { Country, State, City } from 'country-state-city';
import { useNotification } from '../../../../context/NotificationContext';
import UserAPI from '../../../../services/UserAPI';
import { AnimatePresence, motion } from 'framer-motion';

function UserAddress() {
    const { showNotification } = useNotification();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const [editingId, setEditingId] = useState(null); // Track if we are editing

    // --- Form State for Adding/Updating Address ---
    const [formData, setFormData] = useState({
        name: '',
        addressType: 'Home',
        phone: '',
        pincode: '',
        houseNo: '',
        sector: '',
        landmark: '',
        city: '',
        state: '',
        country: 'India',
        isDefault: false
    });

    // --- Location States ---
    const [countries] = useState(Country.getAllCountries());
    const [states, setStates] = useState(State.getStatesOfCountry('IN'));
    const [cities, setCities] = useState([]);

    // 1. Fetch Addresses on Mount
    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const response = await UserAPI.getAddressList();
            if (response.success) {
                setAddresses(response.data);
            }
        } catch (err) {
            showNotification("Failed to load addresses", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    // 2. Handle Set Default
    const handleSetDefault = async (id) => {
        try {
            const response = await UserAPI.setDefaultAddress(id);
            if (response.success) {
                showNotification("Default address updated", "success");
                fetchAddresses();
            }
        } catch (err) {
            showNotification("Error updating default address", "error");
        }
    };

    // 3. Handle Remove Address
    const handleRemove = async (id) => {
        if (!window.confirm("Are you sure you want to delete this address?")) return;
        try {
            const response = await UserAPI.removeAddress(id);
            if (response.success) {
                showNotification("Address deleted", "success");
                fetchAddresses();
            }
        } catch (err) {
            showNotification("Error deleting address", "error");
        }
    };

    // --- NEW: Handle Edit Initialization ---
    const handleEditInitiation = (addr) => {
        setEditingId(addr._id);
        setFormData({
            name: addr.name,
            addressType: addr.addressType,
            phone: addr.phone,
            pincode: addr.pincode,
            houseNo: addr.houseNo,
            sector: addr.sector || '',
            landmark: addr.landmark || '',
            city: addr.city,
            state: addr.state,
            country: addr.country || 'India',
            isDefault: addr.isDefault
        });

        // Pre-load cities for the selected state
        const stateObj = states.find(s => s.name === addr.state);
        if (stateObj) {
            setCities(City.getCitiesOfState('IN', stateObj.isoCode));
        }

        setIsModalOpen(true);
    };

    // 4. Handle Form Submit (Add or Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setBtnLoading(true);
            let response;

            if (editingId) {
                // Call Update API
                response = await UserAPI.updateAddress(editingId, formData);
            } else {
                // Call Add API
                response = await UserAPI.addAddress(formData);
            }

            if (response.success) {
                showNotification(editingId ? "Address updated successfully" : "Address added successfully", "success");
                closeModal();
                fetchAddresses();
            }
        } catch (err) {
            showNotification("Operation failed", "error");
        } finally {
            setBtnLoading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ name: '', addressType: 'Home', phone: '', pincode: '', houseNo: '', sector: '', landmark: '', city: '', state: '', country: 'India', isDefault: false });
    };

    if (loading) return (
        <div className="p-10 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-[#3d3f96]" size={32} />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Saved Addresses...</p>
        </div>
    );

    return (
        <div className="p-6 lg:p-10 antialiased">

            {/* --- HEADER --- */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manage <span className="text-[#3d3f96]">Addresses</span></h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Add or update your delivery locations</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-[#3d3f96] text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-[#2d2f75] transition-all active:scale-95"
                >
                    <Plus size={18} /> Add New Address
                </button>
            </div>

            {/* --- ADDRESS LIST --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {addresses.map((addr) => (
                    <div
                        key={addr._id}
                        className={`relative p-6 rounded-[2.5rem] border-2 transition-all duration-300 bg-white ${addr.isDefault ? 'border-[#3d3f96] shadow-2xl shadow-indigo-50' : 'border-slate-100 hover:border-slate-200 shadow-sm'}`}
                    >
                        {addr.isDefault && (
                            <div className="absolute -top-3 left-8 bg-[#3d3f96] text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                                Default Address
                            </div>
                        )}

                        <div className="flex justify-between items-start mb-6">
                            <div className="bg-slate-50 p-3 rounded-2xl text-[#3d3f96]">
                                {addr.addressType === 'Home' ? <Home size={20} /> : addr.addressType === 'Work' ? <Briefcase size={20} /> : <MapPin size={20} />}
                            </div>
                            <div className="flex gap-1">
                                {/* Edit Button */}
                                <button onClick={() => handleEditInitiation(addr)} className="p-2 text-slate-300 hover:text-[#3d3f96] transition-colors">
                                    <Pencil size={18} />
                                </button>
                                {/* Remove Button */}
                                <button onClick={() => handleRemove(addr._id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-lg font-black text-slate-800 mb-1">{addr.name}</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{addr.addressType}</p>

                        <div className="space-y-2 text-sm text-slate-600 font-medium leading-relaxed mb-6">
                            <p>{addr.houseNo}, {addr.sector}</p>
                            <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                            <div className="flex items-center gap-2 text-[#3d3f96] font-bold mt-4">
                                <Phone size={14} /> {addr.phone}
                            </div>
                        </div>

                        {!addr.isDefault && (
                            <button
                                onClick={() => handleSetDefault(addr._id)}
                                className="w-full py-3 rounded-xl border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 hover:text-[#3d3f96] transition-all"
                            >
                                Set as Default
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* --- ADD/UPDATE ADDRESS MODAL --- */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-2xl rounded-[3rem] p-8 md:p-12 shadow-2xl overflow-y-auto max-h-[90vh]">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-black text-slate-800">{editingId ? 'Update Address' : 'Add New Address'}</h2>
                                <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Recipient Name</label>
                                        <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-[#3d3f96]" placeholder="e.g. John Doe" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                        <input required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-[#3d3f96]" placeholder="9876543210" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Address Type</label>
                                        <select value={formData.addressType} onChange={(e) => setFormData({ ...formData, addressType: e.target.value })} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none appearance-none">
                                            <option value="Home">Home</option>
                                            <option value="Work">Work</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2 space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">House / Flat No.</label>
                                        <input required value={formData.houseNo} onChange={(e) => setFormData({ ...formData, houseNo: e.target.value })} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-[#3d3f96]" placeholder="Flat 102, Shivalik Tower" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sector / Area</label>
                                        <input value={formData.sector} onChange={(e) => setFormData({ ...formData, sector: e.target.value })} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-[#3d3f96]" placeholder="Sector 127" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Landmark</label>
                                        <input value={formData.landmark} onChange={(e) => setFormData({ ...formData, landmark: e.target.value })} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-[#3d3f96]" placeholder="Near Central Park" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">State</label>
                                        <select required value={states.find(s => s.name === formData.state)?.isoCode || ""} onChange={(e) => {
                                            const s = states.find(st => st.isoCode === e.target.value);
                                            setFormData({ ...formData, state: s.name });
                                            setCities(City.getCitiesOfState('IN', s.isoCode));
                                        }} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none">
                                            <option value="">Select State</option>
                                            {states.map(s => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City</label>
                                        <select required value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none">
                                            <option value="">Select City</option>
                                            {cities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pincode</label>
                                        <input required value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-[#3d3f96]" placeholder="140301" />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 py-2">
                                    <input type="checkbox" checked={formData.isDefault} onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })} className="rounded text-[#3d3f96] focus:ring-[#3d3f96]" />
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Set as default delivery address</span>
                                </div>

                                <button disabled={btnLoading} type="submit" className="w-full py-5 bg-[#3d3f96] text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-[#2d2f75] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                                    {btnLoading ? <Loader2 className="animate-spin" size={20} /> : (editingId ? "UPDATE ADDRESS" : "SAVE ADDRESS")}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default UserAddress;