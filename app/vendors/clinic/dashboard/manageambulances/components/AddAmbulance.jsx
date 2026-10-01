"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
    Wind,
    Activity,
    Loader2,
    Check,
    AlertCircle,
    Layers,
    Sparkles
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Import ClinicAPI service
import ClinicAPI from '../../../../../services/ClinicAPI';

export default function AddAmbulance({ isOpen, onClose, onSuccess, editData = null }) {
    const isEdit = Boolean(editData);

    const [loading, setLoading] = useState(false);
    const [facilitiesLoading, setFacilitiesLoading] = useState(true);

    // Master Catalog Facilities fetched from API
    const [masterFacilities, setMasterFacilities] = useState([]);

    // Dynamic Facilities & Staff State: { [facilityId]: { available: boolean, price: number, name: string } }
    const [selectedFacilities, setSelectedFacilities] = useState({});

    // Main Form State
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
        vehicleNumber: '',
        vehicleType: 'Advance Life Support',
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

    // --- 1. Fetch Dynamic Master Facilities ---
    const fetchFacilities = useCallback(async () => {
        setFacilitiesLoading(true);
        try {
            const response = await ClinicAPI.getAmbulanceFacilitiesList({
                applicableFor: 'all',
                isActive: true
            });

            if (response && response.success && Array.isArray(response.data) && response.data.length > 0) {
                setMasterFacilities(response.data);

                // Initialize facility state with defaults
                const initialFacilities = {};
                response.data.forEach((facility) => {
                    const normName = (facility.name || '').toLowerCase();
                    let isAvailable = true;
                    let initialPrice = facility.defaultPrice || 0;

                    // Populate existing values if editing
                    if (editData && editData.supportStaff) {
                        if (Array.isArray(editData.supportStaff)) {
                            const matched = editData.supportStaff.find(
                                (s) => s.facilityId === facility._id || (s.name && s.name.toLowerCase() === normName)
                            );
                            if (matched) {
                                isAvailable = Boolean(matched.available);
                                initialPrice = matched.price !== undefined ? matched.price : facility.defaultPrice;
                            }
                        } else if (typeof editData.supportStaff === 'object') {
                            if (normName.includes('nurse') && editData.supportStaff.nurse) {
                                isAvailable = Boolean(editData.supportStaff.nurse.available);
                                initialPrice = editData.supportStaff.nurse.price ?? facility.defaultPrice;
                            } else if (normName.includes('doctor') && editData.supportStaff.doctor) {
                                isAvailable = Boolean(editData.supportStaff.doctor.available);
                                initialPrice = editData.supportStaff.doctor.price ?? facility.defaultPrice;
                            }
                        }
                    }

                    initialFacilities[facility._id] = {
                        facilityId: facility._id,
                        name: facility.name || 'Medical Facility',
                        available: isAvailable,
                        price: initialPrice
                    };
                });

                setSelectedFacilities(initialFacilities);
            } else {
                // Fallback standard facilities if master catalogue is empty
                const fallbackList = [
                    { _id: 'nurse_default', name: 'Nurse', description: 'On-board registered paramedic nurse', defaultPrice: 300 },
                    { _id: 'doctor_default', name: 'Doctor', description: 'On-board emergency MBBS doctor', defaultPrice: 700 }
                ];
                setMasterFacilities(fallbackList);
                setSelectedFacilities({
                    nurse_default: { facilityId: 'nurse_default', name: 'Nurse', available: true, price: 300 },
                    doctor_default: { facilityId: 'doctor_default', name: 'Doctor', available: true, price: 700 }
                });
            }
        } catch (err) {
            console.error('Error loading master facilities:', err);
            // Fallback list to prevent blocking
            const fallbackList = [
                { _id: 'nurse_default', name: 'Nurse', description: 'On-board registered paramedic nurse', defaultPrice: 300 },
                { _id: 'doctor_default', name: 'Doctor', description: 'On-board emergency MBBS doctor', defaultPrice: 700 }
            ];
            setMasterFacilities(fallbackList);
            setSelectedFacilities({
                nurse_default: { facilityId: 'nurse_default', name: 'Nurse', available: true, price: 300 },
                doctor_default: { facilityId: 'doctor_default', name: 'Doctor', available: true, price: 700 }
            });
        } finally {
            setFacilitiesLoading(false);
        }
    }, [editData]);

    useEffect(() => {
        if (isOpen) {
            fetchFacilities();
        }
    }, [isOpen, fetchFacilities]);

    // --- 2. Populate Standard Form Data on Edit Mode ---
    useEffect(() => {
        if (editData) {
            setFormData({
                name: editData.name || '',
                phone: editData.phone || '',
                email: editData.email || '',
                password: '', // Blank on edit
                vehicleNumber: editData.vehicleNumber || '',
                vehicleType: editData.vehicleType || 'Advance Life Support',
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

    // Handle Input Change
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle Facility Availability Toggle
    const handleFacilityToggle = (facilityId, facilityName) => {
        setSelectedFacilities((prev) => {
            const current = prev[facilityId] || { available: false, price: 0, name: facilityName };
            return {
                ...prev,
                [facilityId]: {
                    ...current,
                    name: facilityName || current.name || 'Medical Support',
                    available: !current.available
                }
            };
        });
    };

    // Handle Facility Price Change
    const handleFacilityPriceChange = (facilityId, newPrice, facilityName) => {
        setSelectedFacilities((prev) => {
            const current = prev[facilityId] || { available: true, price: 0, name: facilityName };
            return {
                ...prev,
                [facilityId]: {
                    ...current,
                    name: facilityName || current.name || 'Medical Support',
                    price: Number(newPrice) || 0
                }
            };
        });
    };

    // Handle File Attachment Selection
    const handleFileChange = (e, fieldKey) => {
        if (e.target.files && e.target.files[0]) {
            setFiles((prev) => ({ ...prev, [fieldKey]: e.target.files[0] }));
        }
    };

    // Icon Resolver for dynamic facility cards
    const getFacilityIcon = (name = '') => {
        const norm = (name || '').toLowerCase();
        if (norm.includes('nurse')) return <User size={18} className="text-emerald-700" />;
        if (norm.includes('doctor') || norm.includes('physician')) return <Stethoscope size={18} className="text-indigo-700" />;
        if (norm.includes('oxygen') || norm.includes('cylinder')) return <Wind size={18} className="text-sky-700" />;
        if (norm.includes('ventilator') || norm.includes('icu')) return <Activity size={18} className="text-rose-700" />;
        return <HeartPulse size={18} className="text-slate-700" />;
    };

    // --- 3. Form Submission ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Standard Validations
        if (!formData.name.trim()) return toast.error('Driver or vehicle display name is required.');
        if (!formData.phone.trim()) return toast.error('Driver mobile number is required.');
        if (!formData.vehicleNumber.trim()) return toast.error('Vehicle registration plate is required.');
        if (!isEdit && !formData.password.trim()) return toast.error('Driver login password is required for registration.');

        setLoading(true);
        try {
            const data = new FormData();

            // 1. Append scalar form fields
            Object.entries(formData).forEach(([key, val]) => {
                if (val !== '' && val !== null && val !== undefined) {
                    data.append(key, val);
                }
            });

            // 2. Build Structured supportStaff ARRAY where 'name' is ALWAYS present
            const supportStaffArray = [];

            masterFacilities.forEach((facility) => {
                const facConfig = selectedFacilities[facility._id] || {
                    available: true,
                    price: facility.defaultPrice || 0,
                    name: facility.name
                };

                const validName = facility.name || facConfig.name || 'Medical Support';

                supportStaffArray.push({
                    facilityId: facility._id,
                    name: validName, // MUST be a non-empty string
                    available: Boolean(facConfig.available),
                    price: Number(facConfig.price) || 0
                });
            });

            // If empty, supply guaranteed valid defaults
            if (supportStaffArray.length === 0) {
                supportStaffArray.push(
                    { name: 'Nurse', available: true, price: 300 },
                    { name: 'Doctor', available: true, price: 700 }
                );
            }

            // Append supportStaff array as JSON string
            data.append('supportStaff', JSON.stringify(supportStaffArray));

            // Legacy backward compatible fields
            const nurseItem = supportStaffArray.find((s) => s.name?.toLowerCase().includes('nurse'));
            const doctorItem = supportStaffArray.find((s) => s.name?.toLowerCase().includes('doctor'));

            data.append('hasNurse', nurseItem ? nurseItem.available : false);
            data.append('nursePrice', nurseItem ? nurseItem.price : 0);
            data.append('hasDoctor', doctorItem ? doctorItem.available : false);
            data.append('doctorPrice', doctorItem ? doctorItem.price : 0);

            // 3. Append statutory files
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
                toast.success(response.message || (isEdit ? 'Ambulance updated successfully!' : 'Ambulance registered & submitted for verification!'));
                onSuccess();
            } else {
                toast.error(response?.message || 'Failed to process ambulance registration.');
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
                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center border border-red-500/20 shadow-xs">
                            <Ambulance size={22} />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight">
                                {isEdit ? `Edit Ambulance (${formData.vehicleNumber})` : 'Register Clinic Ambulance'}
                            </h3>
                            <p className="text-xs text-slate-400 font-semibold mt-0.5">
                                Configure vehicle plate, driver login, dynamic equipment &amp; staff, and statutory documents.
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

                {/* Unified Scrolling Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 [&::-webkit-scrollbar]:hidden">

                    {/* SECTION 1: DRIVER & VEHICLE CREDENTIALS */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                            <User size={16} className="text-red-600" />
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                1. Driver &amp; Vehicle Information
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
                                    placeholder="e.g. Rajesh Kumar (Driver)"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-red-500 focus:bg-white transition"
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
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-red-500 focus:bg-white transition"
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
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 uppercase focus:outline-none focus:border-red-500 focus:bg-white transition"
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
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-red-500 focus:bg-white transition"
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
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-red-500 focus:bg-white transition"
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

                    {/* SECTION 2: DYNAMIC ON-BOARD MEDICAL SUPPORT STAFF & EQUIPMENT */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <div className="flex items-center gap-2">
                                <HeartPulse size={16} className="text-indigo-600" />
                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                    2. On-Board Medical Support Staff &amp; Equipment
                                </h4>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                                Dynamic Addons
                            </span>
                        </div>

                        {facilitiesLoading ? (
                            <div className="py-8 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center space-y-2">
                                <Loader2 className="animate-spin text-indigo-600" size={24} />
                                <p className="text-xs font-bold text-slate-400">Loading master staff and equipment options...</p>
                            </div>
                        ) : masterFacilities.length === 0 ? (
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 font-bold flex items-center gap-2">
                                <AlertCircle size={16} className="text-amber-600 shrink-0" />
                                <span>No dynamic support facilities registered. Default support staff configured.</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {masterFacilities.map((facility) => {
                                    const facConfig = selectedFacilities[facility._id] || {
                                        available: false,
                                        price: facility.defaultPrice || 0,
                                        name: facility.name
                                    };
                                    const isAvailable = Boolean(facConfig.available);

                                    return (
                                        <div
                                            key={facility._id}
                                            className={`p-4 rounded-3xl border transition-all space-y-3 ${isAvailable
                                                    ? 'bg-indigo-50/40 border-indigo-300 shadow-xs'
                                                    : 'bg-slate-50/60 border-slate-200'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                                                        {getFacilityIcon(facility.name)}
                                                    </div>
                                                    <div>
                                                        <h5 className="text-xs font-black text-slate-900 leading-tight">
                                                            {facility.name}
                                                        </h5>
                                                        <p className="text-[10px] text-slate-400 font-medium line-clamp-1" title={facility.description}>
                                                            {facility.description || 'On-board emergency support'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={isAvailable}
                                                        onChange={() => handleFacilityToggle(facility._id, facility.name)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                                </label>
                                            </div>

                                            {isAvailable && (
                                                <div className="pt-2 border-t border-indigo-100/80 space-y-1 animate-in fade-in duration-150">
                                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                                                        Additional Fare Add-On (₹)
                                                    </label>
                                                    <div className="relative">
                                                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={facConfig.price}
                                                            onChange={(e) => handleFacilityPriceChange(facility._id, e.target.value, facility.name)}
                                                            placeholder={String(facility.defaultPrice || 300)}
                                                            className="w-full pl-8 pr-3 py-1.5 bg-white border border-indigo-200 rounded-xl text-xs font-black text-slate-800 focus:outline-none focus:border-indigo-500"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* SECTION 3: FARE STRUCTURE & STATION LOCATION */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                            <IndianRupee size={16} className="text-amber-600" />
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                3. Ride Pricing Structure &amp; Base Station
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
                                4. Statutory Certificates &amp; Documents
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

                    {/* MODAL FOOTER */}
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
                            className="px-10 py-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-lg shadow-red-600/25 transition flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
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