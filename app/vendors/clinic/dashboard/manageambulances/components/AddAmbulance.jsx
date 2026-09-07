"use client";

import React, { useState, useEffect } from 'react';
import {
    X,
    Ambulance,
    User,
    Phone,
    Lock,
    Mail,
    FileText,
    Upload,
    IndianRupee,
    MapPin,
    HeartPulse,
    Stethoscope,
    Loader2,
    Check,
    CheckSquare,
    Square
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Import ClinicAPI service
import ClinicAPI from '../../../../../services/ClinicAPI';

export default function AddAmbulance({ isOpen, onClose, onSuccess, editData = null }) {
    const isEdit = Boolean(editData);

    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
        vehicleNumber: '',
        vehicleType: 'Advance Life Support',
        hasNurse: true,
        nursePrice: 300,
        hasDoctor: true,
        doctorPrice: 700,
        singleRidePrice: 400,
        doubleRidePrice: 700,
        baseDistance: 5,
        pricePerKM: 12,
        drivingLicenseNumber: '',
        rcNumber: '',
        insuranceNumber: '',
        bloodGroup: 'B+',
        experienceYears: '6',
        serviceRadius: '15 km',
        address: '',
        city: 'Mohali',
        state: 'Punjab',
        latitude: '',
        longitude: ''
    });

    // File attachments state
    const [files, setFiles] = useState({
        drivingLicenseFile: null,
        rcFile: null,
        insuranceFile: null,
        fitnessCertificate: null,
        ambulancePermit: null
    });

    // Populate data in edit mode
    useEffect(() => {
        if (editData) {
            const supportStaff = editData.supportStaff || {};
            setFormData({
                name: editData.name || '',
                phone: editData.phone || '',
                email: editData.email || '',
                password: '', // Blank on edit
                vehicleNumber: editData.vehicleNumber || '',
                vehicleType: editData.vehicleType || 'Advance Life Support',
                hasNurse: supportStaff.nurse ? Boolean(supportStaff.nurse.available) : true,
                nursePrice: supportStaff.nurse?.price !== undefined ? supportStaff.nurse.price : 300,
                hasDoctor: supportStaff.doctor ? Boolean(supportStaff.doctor.available) : true,
                doctorPrice: supportStaff.doctor?.price !== undefined ? supportStaff.doctor.price : 700,
                singleRidePrice: editData.pricing?.singleRidePrice !== undefined ? editData.pricing.singleRidePrice : 400,
                doubleRidePrice: editData.pricing?.doubleRidePrice !== undefined ? editData.pricing.doubleRidePrice : 700,
                baseDistance: editData.pricing?.baseDistance !== undefined ? editData.pricing.baseDistance : 5,
                pricePerKM: editData.pricing?.pricePerKM !== undefined ? editData.pricing.pricePerKM : 12,
                drivingLicenseNumber: editData.drivingLicenseNumber || '',
                rcNumber: editData.rcNumber || '',
                insuranceNumber: editData.insuranceNumber || '',
                bloodGroup: editData.bloodGroup || 'B+',
                experienceYears: editData.experienceYears || '6',
                serviceRadius: editData.serviceRadius || '15 km',
                address: editData.address || '',
                city: editData.city || 'Mohali',
                state: editData.state || 'Punjab',
                latitude: editData.location?.lat || '',
                longitude: editData.location?.lng || ''
            });
        }
    }, [editData]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e, fieldKey) => {
        if (e.target.files && e.target.files[0]) {
            setFiles((prev) => ({ ...prev, [fieldKey]: e.target.files[0] }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name.trim()) return toast.error('Driver or vehicle display name is required.');
        if (!formData.phone.trim()) return toast.error('Driver mobile number is required.');
        if (!formData.vehicleNumber.trim()) return toast.error('Vehicle registration plate is required.');
        if (!isEdit && !formData.password.trim()) return toast.error('Driver login password is required for registration.');

        setLoading(true);
        try {
            const data = new FormData();

            // Append all scalar fields
            Object.entries(formData).forEach(([key, val]) => {
                if (val !== '' && val !== null && val !== undefined) {
                    data.append(key, val);
                }
            });

            // Append all file attachments
            Object.entries(files).forEach(([key, file]) => {
                if (file) {
                    data.append(key, file);
                }
            });

            let response;
            if (isEdit) {
                response = await ClinicAPI.updateClinicAmbulance(editData._id, data);
            } else {
                response = await ClinicAPI.registerClinicAmbulance(data);
            }

            if (response && response.success) {
                toast.success(response.message || (isEdit ? 'Ambulance updated successfully!' : 'Ambulance registered and submitted for approval!'));
                onSuccess();
            }
        } catch (err) {
            console.error('Error submitting ambulance:', err);
            toast.error(err.response?.data?.message || 'Failed to submit ambulance details.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl relative text-left overflow-hidden">
                
                {/* Modal Header */}
                <div className="px-6 py-5 sm:px-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center border border-red-500/20">
                            <Ambulance size={22} />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight">
                                {isEdit ? `Edit Ambulance (${formData.vehicleNumber})` : 'Register Clinic Ambulance'}
                            </h3>
                            <p className="text-xs text-slate-400 font-semibold mt-0.5">
                                Configure driver, on-board medical staff (Nurse/Doctor), pricing and statutory certificates.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Unified Scrolling Form with Submit at the Bottom */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 [&::-webkit-scrollbar]:hidden">
                    
                    {/* SECTION 1: DRIVER & VEHICLE CREDENTIALS */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                            <User size={16} className="text-red-600" />
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                1. Driver & Vehicle Information
                            </h4>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-500">
                                    Driver / Vehicle Display Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder='e.g. Rajesh Kumar (Driver)'
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-red-500 focus:bg-white"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-500">
                                    Driver Mobile Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="10-digit mobile number"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-red-500 focus:bg-white"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-500">
                                    Vehicle Registration Plate <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    name="vehicleNumber"
                                    value={formData.vehicleNumber}
                                    onChange={handleInputChange}
                                    placeholder="e.g. PB65AB1234"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 uppercase focus:outline-none focus:border-red-500 focus:bg-white"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-500">
                                    Vehicle Type
                                </label>
                                <select
                                    name="vehicleType"
                                    value={formData.vehicleType}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-red-500 cursor-pointer"
                                >
                                    <option value="Advance Life Support">Advance Life Support</option>
                                    <option value="ICU Ambulance">ICU Ambulance</option>
                                    <option value="Van">Van</option>
                                    <option value="Mini Van">Mini Van</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-500">
                                    Driver Email (Optional)
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="ambulance1@clinic.com"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-red-500 focus:bg-white"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-500">
                                    Driver App Password {isEdit ? '(Leave blank to retain)' : <span className="text-red-500">*</span>}
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    required={!isEdit}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder={isEdit ? '•••••••• (unchanged)' : 'Enter driver login password'}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-red-500 focus:bg-white"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-500">Blood Group</label>
                                <input
                                    type="text"
                                    name="bloodGroup"
                                    value={formData.bloodGroup}
                                    onChange={handleInputChange}
                                    placeholder="B+"
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 text-center"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-500">Experience (Years)</label>
                                <input
                                    type="text"
                                    name="experienceYears"
                                    value={formData.experienceYears}
                                    onChange={handleInputChange}
                                    placeholder="6"
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 text-center"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-500">Coverage Radius</label>
                                <input
                                    type="text"
                                    name="serviceRadius"
                                    value={formData.serviceRadius}
                                    onChange={handleInputChange}
                                    placeholder="15 km"
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 text-center"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: ON-BOARD MEDICAL SUPPORT STAFF */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                            <HeartPulse size={16} className="text-indigo-600" />
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                2. On-Board Medical Support Staff (Nurse & Doctor)
                            </h4>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Nurse Support Toggle & Pricing */}
                            <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-3xl space-y-3">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center gap-2">
                                        <User size={16} className="text-emerald-700" />
                                        <span className="text-xs font-black text-slate-900">On-Board Nurse Support</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        name="hasNurse"
                                        checked={formData.hasNurse}
                                        onChange={handleInputChange}
                                        className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                                    />
                                </label>

                                {formData.hasNurse && (
                                    <div className="space-y-1 pt-1 animate-in fade-in">
                                        <label className="text-[10px] font-black uppercase text-slate-500">
                                            Nurse Additional Charges (₹)
                                        </label>
                                        <input
                                            type="number"
                                            name="nursePrice"
                                            value={formData.nursePrice}
                                            onChange={handleInputChange}
                                            placeholder="300"
                                            className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-xs font-bold text-slate-800"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Emergency Doctor Support Toggle & Pricing */}
                            <div className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-3xl space-y-3">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center gap-2">
                                        <Stethoscope size={16} className="text-indigo-700" />
                                        <span className="text-xs font-black text-slate-900">Emergency Doctor Support</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        name="hasDoctor"
                                        checked={formData.hasDoctor}
                                        onChange={handleInputChange}
                                        className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                                    />
                                </label>

                                {formData.hasDoctor && (
                                    <div className="space-y-1 pt-1 animate-in fade-in">
                                        <label className="text-[10px] font-black uppercase text-slate-500">
                                            Emergency Doctor Charges (₹)
                                        </label>
                                        <input
                                            type="number"
                                            name="doctorPrice"
                                            value={formData.doctorPrice}
                                            onChange={handleInputChange}
                                            placeholder="700"
                                            className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-slate-800"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: FARE STRUCTURE & STATION LOCATION */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                            <IndianRupee size={16} className="text-amber-600" />
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                3. Ride Pricing Structure & Base Station
                            </h4>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-500">One-Way Base (₹)</label>
                                <input
                                    type="number"
                                    name="singleRidePrice"
                                    value={formData.singleRidePrice}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-500">Round-Trip (₹)</label>
                                <input
                                    type="number"
                                    name="doubleRidePrice"
                                    value={formData.doubleRidePrice}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-500">Base Covered (KM)</label>
                                <input
                                    type="number"
                                    name="baseDistance"
                                    value={formData.baseDistance}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-500">Per Extra KM (₹)</label>
                                <input
                                    type="number"
                                    name="pricePerKM"
                                    value={formData.pricePerKM}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1.5 sm:col-span-1">
                                <label className="text-[10px] font-black uppercase text-slate-500">Base Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="Sector 70, Clinic Base"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-500">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-500">State</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4: STATUTORY DOCUMENTS & CERTIFICATES */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                            <FileText size={16} className="text-red-600" />
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                4. Statutory Certificates & Documents
                            </h4>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { key: 'drivingLicenseFile', label: 'Driving License File', numberKey: 'drivingLicenseNumber', placeholder: 'DL Number (e.g. DL-PB-2019-00921)' },
                                { key: 'rcFile', label: 'Vehicle RC Certificate', numberKey: 'rcNumber', placeholder: 'RC Number (e.g. RC-PB-65-1234)' },
                                { key: 'insuranceFile', label: 'Insurance Policy File', numberKey: 'insuranceNumber', placeholder: 'Policy Number (e.g. INS-HDFC-9912)' },
                                { key: 'fitnessCertificate', label: 'Vehicle Fitness Certificate', numberKey: null, placeholder: '' },
                                { key: 'ambulancePermit', label: 'Commercial Ambulance Permit', numberKey: null, placeholder: '' }
                            ].map((doc) => (
                                <div key={doc.key} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                                    <span className="text-[10px] font-black uppercase text-slate-500 block">{doc.label}</span>

                                    {doc.numberKey && (
                                        <input
                                            type="text"
                                            name={doc.numberKey}
                                            value={formData[doc.numberKey]}
                                            onChange={handleInputChange}
                                            placeholder={doc.placeholder}
                                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 uppercase"
                                        />
                                    )}

                                    <label className="flex items-center justify-center gap-2 p-3 bg-white border border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-red-500 transition">
                                        <Upload size={14} className="text-slate-400" />
                                        <span className="text-xs font-bold text-slate-600 truncate">
                                            {files[doc.key] ? files[doc.key].name : 'Choose File (PDF/Image)'}
                                        </span>
                                        <input
                                            type="file"
                                            accept=".pdf,.png,.jpg,.jpeg"
                                            onChange={(e) => handleFileChange(e, doc.key)}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* MODAL FOOTER: SUBMIT BUTTON AT THE BOTTOM */}
                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 text-slate-500 hover:bg-slate-100 text-xs font-black uppercase tracking-wider rounded-2xl transition cursor-pointer"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-10 py-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-lg shadow-red-600/25 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} strokeWidth={3} />}
                            <span>{isEdit ? 'Save Ambulance Changes' : 'Submit for Admin Approval'}</span>
                        </button>
                    </div>

                </form>

            </div>
        </div>
    );
}