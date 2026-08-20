"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    User, Mail, Phone, Lock, Eye, EyeOff, Building,
    Globe, Map, MapPin, Loader2, ArrowRight, X
} from 'lucide-react';
import { Country, State, City } from 'country-state-city';
import { useNotification } from '../../../../context/NotificationContext';
import FoodAPI from '../../../../services/FoodVendorAPI'; // Service file FoodVendorAPI.js

const ExpertRegister = () => {
    const router = useRouter();
    
    // --- Safe Context Extraction & Fallback ---
    const notificationContext = useNotification();
    const [localAlert, setLocalAlert] = useState(null); // Fallback state if context is undefined

    const triggerNotification = (message, type = 'info') => {
        if (notificationContext && typeof notificationContext.showNotification === 'function') {
            notificationContext.showNotification(message, type);
        } else {
            // Local self-contained alert system when provider is missing
            setLocalAlert({ message, type });
            setTimeout(() => setLocalAlert(null), 4000);
        }
    };

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // --- Form State ---
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        countryCode: '+91',
        country: '',
        state: '',
        city: '',
        password: '',
        confirmPassword: ''
    });

    // --- Location Selection States ---
    const [countries] = useState(Country.getAllCountries());
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    // We store ISO codes for filtering but send names to API
    const [selectedCountryCode, setSelectedCountryCode] = useState('');
    const [selectedStateCode, setSelectedStateCode] = useState('');

    // Handle Country Change
    const handleCountryChange = (e) => {
        const countryIso = e.target.value;
        const countryName = countries.find(c => c.isoCode === countryIso)?.name || '';

        setSelectedCountryCode(countryIso);
        setFormData({ ...formData, country: countryName, state: '', city: '' });
        setStates(State.getStatesOfCountry(countryIso));
        setCities([]);
    };

    // Handle State Change
    const handleStateChange = (e) => {
        const stateIso = e.target.value;
        const stateName = states.find(s => s.isoCode === stateIso)?.name || '';

        setSelectedStateCode(stateIso);
        setFormData({ ...formData, state: stateName, city: '' });
        setCities(City.getCitiesOfState(selectedCountryCode, stateIso));
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Basic Validation
        if (formData.password !== formData.confirmPassword) {
            return triggerNotification("Passwords do not match", "error");
        }
        if (!formData.email && !formData.phone) {
            return triggerNotification("Email or Phone is required", "warning");
        }

        // 2. Format payload to match the documentation schema
        const payload = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone.trim(), // API documentation expects "phone" key directly
            password: formData.password,
            category: "Food", // Category is strictly validated as "Food"
            country: formData.country,
            state: formData.state,
            city: formData.city
        };

        try {
            setLoading(true);
            const response = await FoodAPI.registerFoodPartner(payload);

            if (response.success) {
                triggerNotification(response.message || "Registered successfully. Please upload documents.", "success");
                
                // Set the user session token returned on successful registration
                if (response.token) {
                    localStorage.setItem('foodToken', response.token);
                }

                // Redirect directly to the document upload page for Food and Nutrition Vendors
                router.push('/vendors/food/documents');
            } else {
                triggerNotification(response.message || "Registration failed", "error");
            }
        } catch (err) {
            triggerNotification(err.response?.data?.message || "An error occurred during registration", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Local Fallback Alert UI */}
            {localAlert && (
                <div className={`fixed top-6 right-6 z-50 p-4 rounded-2xl shadow-xl border text-xs font-black flex items-center gap-3 animate-bounce ${
                    localAlert.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                    localAlert.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-800' :
                    localAlert.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-800' :
                    'bg-slate-50 border-slate-100 text-slate-800'
                }`}>
                    <span>{localAlert.message}</span>
                    <button type="button" onClick={() => setLocalAlert(null)} className="text-slate-400 hover:text-slate-600">
                        <X size={14} />
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 antialiased">
                {/* Name & Category Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Kitchen Name */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kitchen / Service Name</label>
                        <div className="relative">
                            <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                required
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                type="text"
                                placeholder="e.g. Healthy Bites Kitchen"
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-[#3d3f96] transition-all"
                            />
                        </div>
                    </div>

                    {/* Forced Category Representation */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Provider Category</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                                disabled
                                type="text"
                                value="Food &amp; Nutrition"
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-100 border border-slate-100 rounded-2xl text-sm font-bold text-slate-400 outline-none cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>

                {/* Email & Phone Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Email Address */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                required
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                type="email"
                                placeholder="healthybites@example.com"
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-[#3d3f96] transition-all"
                            />
                        </div>
                    </div>

                    {/* Phone Number Input */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Phone Number</label>
                        <div className="flex gap-2">
                            <input
                                disabled
                                value={formData.countryCode}
                                className="w-20 px-2 bg-slate-100 border border-slate-100 rounded-2xl text-xs font-bold text-center text-slate-400 cursor-not-allowed outline-none"
                            />
                            <div className="relative flex-1">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    required
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    type="tel"
                                    placeholder="9876543210"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-[#3d3f96] transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Location Selectors: Country, State, City */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Country Selector */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Country</label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                            <select
                                required
                                onChange={handleCountryChange}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none appearance-none focus:border-[#3d3f96]"
                            >
                                <option value="">Select Country</option>
                                {countries.map(c => <option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* State Selector */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">State</label>
                        <div className="relative">
                            <Map className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                            <select
                                required
                                disabled={!selectedCountryCode}
                                onChange={handleStateChange}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none appearance-none focus:border-[#3d3f96] disabled:opacity-50"
                            >
                                <option value="">Select State</option>
                                {states.map(s => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* City Selector */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                            <select
                                required
                                disabled={!selectedStateCode}
                                name="city"
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none appearance-none focus:border-[#3d3f96] disabled:opacity-50"
                            >
                                <option value="">Select City</option>
                                {cities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Password Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Password Field */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                required
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-[#3d3f96] transition-all"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password Field */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                required
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                type="password"
                                placeholder="••••••••"
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-[#3d3f96] transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Submit button */}
                <button
                    disabled={loading}
                    type="submit"
                    className="w-full bg-[#3d3f96] hover:bg-[#2d2f75] text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 transition-all active:scale-95 mt-6 disabled:opacity-70"
                >
                    {loading ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : (
                        <>
                            <span>Continue to Document Upload</span>
                            <ArrowRight size={18} />
                        </>
                    )}
                </button>
            </form>
        </>
    );
};

export default ExpertRegister;