"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    X,
    Check,
    Loader2,
    UploadCloud,
    User,
    IndianRupee,
    Phone,
    Mail,
    MapPin,
    Languages,
    Lock,
    Eye,
    EyeOff
} from 'lucide-react';
import { Country, State, City } from 'country-state-city';
import { toast } from 'react-hot-toast';
import AdminAPI from '../../../../../services/AdminAPI';

// Helper to construct full backend image URL
const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('blob:')) {
        return imagePath;
    }
    const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.1.6:5002').replace(/\/$/, '');
    const cleanPath = imagePath.replace(/^\//, '');
    return `${backendUrl}/${cleanPath}`;
};

export default function CreateCoach({ isOpen, onClose, onSuccess, initialData = null, mode = 'create' }) {
    const isEdit = mode === 'edit';

    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Country, State, City ISO selectors (Defaults to India 'IN')
    const [selectedCountryCode, setSelectedCountryCode] = useState('IN');
    const [selectedStateCode, setSelectedStateCode] = useState('');
    const [selectedCityName, setSelectedCityName] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        password: '',
        price: '',
        phone: '',
        email: '',
        about: '',
        languages: '',
        address: '',
        state: '',
        city: '',
        pincode: '',
        lat: '',
        lng: ''
    });

    // Lists from country-state-city
    const allCountries = useMemo(() => Country.getAllCountries(), []);

    const availableStates = useMemo(() => {
        return selectedCountryCode ? State.getStatesOfCountry(selectedCountryCode) : [];
    }, [selectedCountryCode]);

    const availableCities = useMemo(() => {
        return selectedCountryCode && selectedStateCode
            ? City.getCitiesOfState(selectedCountryCode, selectedStateCode)
            : [];
    }, [selectedCountryCode, selectedStateCode]);

    // Populate data on mount or edit change
    useEffect(() => {
        setShowPassword(false);

        if (isEdit && initialData) {
            const stateName = initialData.location?.state || '';
            const cityName = initialData.location?.city || '';

            const foundState = State.getStatesOfCountry('IN').find(
                (s) => s.name.toLowerCase() === stateName.toLowerCase()
            );

            setSelectedCountryCode('IN');
            setSelectedStateCode(foundState ? foundState.isoCode : '');
            setSelectedCityName(cityName);

            setFormData({
                name: initialData.name || '',
                password: '', // Kept empty on edit so existing password isn't overridden unless typed
                price: initialData.price ?? '',
                phone: initialData.phone || '',
                email: initialData.email || '',
                about: initialData.about || '',
                languages: Array.isArray(initialData.languages)
                    ? initialData.languages.join(', ')
                    : initialData.languages || '',
                address: initialData.location?.address || '',
                city: cityName,
                state: stateName,
                pincode: initialData.location?.pincode || '',
                lat: initialData.location?.lat ?? '',
                lng: initialData.location?.lng ?? ''
            });

            if (initialData.profileImage) {
                setImagePreview(getImageUrl(initialData.profileImage));
            }
        } else {
            setSelectedCountryCode('IN');
            setSelectedStateCode('');
            setSelectedCityName('');
            setFormData({
                name: '',
                password: '',
                price: '',
                phone: '',
                email: '',
                about: '',
                languages: '',
                address: '',
                city: '',
                state: '',
                pincode: '',
                lat: '',
                lng: ''
            });
            setImageFile(null);
            setImagePreview('');
        }
    }, [initialData, isEdit, isOpen]);

    if (!isOpen) return null;

    // Dropdown handlers
    const handleCountryChange = (e) => {
        const countryCode = e.target.value;
        setSelectedCountryCode(countryCode);
        setSelectedStateCode('');
        setSelectedCityName('');
        setFormData((prev) => ({ ...prev, state: '', city: '', lat: '', lng: '' }));
    };

    const handleStateChange = (e) => {
        const stateCode = e.target.value;
        setSelectedStateCode(stateCode);
        setSelectedCityName('');

        const stateObj = availableStates.find((s) => s.isoCode === stateCode);
        const stateName = stateObj ? stateObj.name : '';

        setFormData((prev) => ({
            ...prev,
            state: stateName,
            city: '',
            lat: '',
            lng: ''
        }));
    };

    const handleCityChange = (e) => {
        const cityName = e.target.value;
        setSelectedCityName(cityName);

        const cityObj = availableCities.find((c) => c.name === cityName);

        setFormData((prev) => ({
            ...prev,
            city: cityName,
            lat: cityObj?.latitude ? cityObj.latitude : prev.lat,
            lng: cityObj?.longitude ? cityObj.longitude : prev.lng
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
        }

        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validations
        if (!formData.name.trim()) {
            return toast.error('Coach name is required.');
        }
        if (!formData.price && formData.price !== 0) {
            return toast.error('Consultation price is required.');
        }
        if (!isEdit && !formData.password.trim()) {
            return toast.error('Coach login password is required.');
        }

        setLoading(true);
        try {
            const data = new FormData();
            data.append('name', formData.name.trim());
            data.append('price', Number(formData.price));

            // Only append password if creating OR if updating with a new password
            if (formData.password.trim()) {
                data.append('password', formData.password.trim());
            }

            if (formData.phone) data.append('phone', formData.phone.trim());
            if (formData.email) data.append('email', formData.email.trim());
            if (formData.about) data.append('about', formData.about.trim());

            if (formData.languages.trim()) {
                const langArr = formData.languages
                    .split(',')
                    .map((l) => l.trim())
                    .filter(Boolean);
                data.append('languages', JSON.stringify(langArr));
            }

            if (formData.address) data.append('address', formData.address.trim());
            if (formData.city) data.append('city', formData.city.trim());
            if (formData.state) data.append('state', formData.state.trim());
            if (formData.pincode) data.append('pincode', formData.pincode.trim());
            if (formData.lat) data.append('lat', Number(formData.lat));
            if (formData.lng) data.append('lng', Number(formData.lng));

            if (imageFile) {
                data.append('profileImage', imageFile);
            }

            let response;
            if (isEdit) {
                response = await AdminAPI.updateDiabetesCoach(initialData._id, data);
            } else {
                response = await AdminAPI.createDiabetesCoach(data);
            }

            if (response && response.success) {
                toast.success(response.message || (isEdit ? 'Coach updated successfully!' : 'Coach created successfully!'));
                onSuccess();
                onClose();
            } else {
                toast.error(response?.message || 'Failed to save coach details.');
            }
        } catch (err) {
            console.error('Error saving coach:', err);
            toast.error(err.response?.data?.message || 'Server error processing request.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-in fade-in duration-150">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative text-left my-8 max-h-[92vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-[#3d3f96]/10 text-[#3d3f96] flex items-center justify-center border border-[#3d3f96]/15 shrink-0">
                            <User size={20} />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-slate-900 text-lg uppercase tracking-tight">
                                {isEdit ? 'Edit Diabetes Coach' : 'Add Diabetes Coach'}
                            </h3>
                            <p className="text-xs text-slate-400 font-semibold mt-0.5">
                                {isEdit ? `Updating profile for ${initialData?.name}` : 'Register a certified counselor or CGM specialist'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="overflow-y-auto pr-1 space-y-5 flex-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">

                    {/* Image Upload / Preview */}
                    <div className="flex items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <div className="w-20 h-20 rounded-2xl bg-slate-200 border border-slate-300 flex items-center justify-center overflow-hidden shrink-0 relative">
                            {imagePreview ? (
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            ) : (
                                <User className="text-slate-400" size={32} />
                            )}
                        </div>

                        <div className="flex-1 space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block">
                                Profile Photo (.jpg, .png, .webp &le; 5MB)
                            </label>
                            <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer shadow-xs transition">
                                <UploadCloud size={14} className="text-[#3d3f96]" />
                                <span>{imagePreview ? 'Change Photo' : 'Upload Photo'}</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                            {isEdit && (
                                <p className="text-[10px] text-slate-400">
                                    Uploading a new photo will automatically delete the old photo.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Basic Info & Login Credentials */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Coach Name */}
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                                Full Name <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Dr. Mudabir Kowsar"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-[#3d3f96] focus:bg-white transition"
                                />
                            </div>
                        </div>

                        {/* Consultation Price */}
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                                Consultation Fee (₹) <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    placeholder="e.g. 499"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-[#3d3f96] focus:bg-white transition"
                                />
                            </div>
                        </div>

                        {/* Phone Number */}
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                                Phone Number
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="e.g. 9876543210"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96] focus:bg-white transition"
                                />
                            </div>
                        </div>

                        {/* Email Address */}
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="e.g. coach@domain.com"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96] focus:bg-white transition"
                                />
                            </div>
                        </div>

                        {/* Login Password */}
                        <div className="space-y-1.5 sm:col-span-2">
                            <div className="flex items-center justify-between">
                                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                                    {isEdit ? 'Update Login Password' : 'Login Password'}{' '}
                                    {!isEdit && <span className="text-rose-500">*</span>}
                                </label>
                                {isEdit && (
                                    <span className="text-[10px] text-slate-400 font-semibold">
                                        Leave empty to keep existing password
                                    </span>
                                )}
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required={!isEdit}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder={isEdit ? 'Enter new password to reset' : 'Create strong portal password (e.g. Coach@123)'}
                                    className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-[#3d3f96] focus:bg-white transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Languages */}
                    <div className="space-y-1.5">
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                            Spoken Languages (Comma-separated)
                        </label>
                        <div className="relative">
                            <Languages className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                            <input
                                type="text"
                                value={formData.languages}
                                onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                                placeholder="e.g. Hindi, English, Punjabi"
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96] focus:bg-white transition"
                            />
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="space-y-1.5">
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                            About / Clinical Guidance Summary
                        </label>
                        <textarea
                            rows={3}
                            value={formData.about}
                            onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                            placeholder="Expert guidance on applying CGM sensors, glucose trend interpretation, and reversal strategies."
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96] focus:bg-white resize-none transition leading-relaxed"
                        />
                    </div>

                    {/* Location Breakdown */}
                    <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3.5">
                        <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider">
                            <MapPin size={14} className="text-[#3d3f96]" />
                            <span>Location & Coordinates (State / City Picker)</span>
                        </div>

                        {/* Dropdowns Row: Country, State, City */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 block">Country</label>
                                <select
                                    value={selectedCountryCode}
                                    onChange={handleCountryChange}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96] cursor-pointer"
                                >
                                    {allCountries.map((country) => (
                                        <option key={country.isoCode} value={country.isoCode}>
                                            {country.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 block">State</label>
                                <select
                                    value={selectedStateCode}
                                    onChange={handleStateChange}
                                    disabled={availableStates.length === 0}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96] cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
                                >
                                    <option value="">Select State</option>
                                    {availableStates.map((state) => (
                                        <option key={state.isoCode} value={state.isoCode}>
                                            {state.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 block">City</label>
                                <select
                                    value={selectedCityName}
                                    onChange={handleCityChange}
                                    disabled={availableCities.length === 0}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96] cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
                                >
                                    <option value="">
                                        {availableCities.length === 0 ? 'No cities found' : 'Select City'}
                                    </option>
                                    {availableCities.map((city) => (
                                        <option key={city.name} value={city.name}>
                                            {city.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Street & Pincode */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1 sm:col-span-2">
                                <label className="text-[10px] font-black uppercase text-slate-400">Street Address</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="e.g. Sector 62, Phase 8"
                                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96]"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400">Pincode</label>
                                <input
                                    type="text"
                                    value={formData.pincode}
                                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                                    placeholder="e.g. 160062"
                                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96]"
                                />
                            </div>
                        </div>

                        {/* Latitude & Longitude */}
                        <div className="grid grid-cols-2 gap-3 pt-1">
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black uppercase text-slate-400">Latitude</label>
                                    <span className="text-[9px] text-indigo-500 font-bold">Auto-detect</span>
                                </div>
                                <input
                                    type="number"
                                    step="any"
                                    value={formData.lat}
                                    onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                                    placeholder="e.g. 30.7046"
                                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96]"
                                />
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black uppercase text-slate-400">Longitude</label>
                                    <span className="text-[9px] text-indigo-500 font-bold">Auto-detect</span>
                                </div>
                                <input
                                    type="number"
                                    step="any"
                                    value={formData.lng}
                                    onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                                    placeholder="e.g. 76.7179"
                                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} strokeWidth={3} />}
                            <span>{isEdit ? 'Save Changes' : 'Create Coach'}</span>
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}