"use client";
import React, { useState, useEffect } from 'react';
import {
    User, Mail, Phone, Lock, Eye, EyeOff, UserPlus,
    Globe, Map, MapPin, Loader2, CheckCircle2
} from 'lucide-react';
import { Country, State, City } from 'country-state-city';
import { useAuth } from '../../../../context/AuthContext';
import { useNotification } from '../../../../context/NotificationContext';
import UserAPI from '../../../../services/UserAPI';

const UserRegister = () => {
    const { login } = useAuth();
    const { showNotification } = useNotification();

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
            return showNotification("Passwords do not match", "error");
        }
        if (!formData.email && !formData.phone) {
            return showNotification("Email or Phone is required", "warning");
        }

        try {
            setLoading(true);
            const response = await UserAPI.registerUser(formData);

            if (response.success) {
                showNotification(response.message, "success");
                // Automatically log the user in with the token and data returned
                login(response.user, response.token);
            } else {
                showNotification(response.message || "Registration failed", "error");
            }
        } catch (err) {
            showNotification(err.response?.data?.message || "An error occurred during registration", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 antialiased">
            {/* Full Name */}
            <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        required
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        type="text"
                        placeholder="Enter your full name"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-[#3d3f96] transition-all"
                    />
                </div>
            </div>

            {/* Email & Phone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            type="email"
                            placeholder="email@example.com"
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-[#3d3f96] transition-all"
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <div className="flex gap-2">
                        <input
                            name="countryCode"
                            value={formData.countryCode}
                            onChange={handleChange}
                            className="w-20 px-2 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-center outline-none focus:border-[#3d3f96]"
                            placeholder="+91"
                        />
                        <div className="relative flex-1">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                type="tel"
                                placeholder="6006287541"
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-[#3d3f96] transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Location Selectors: Country, State, City */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Country */}
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Country</label>
                    <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <select
                            onChange={handleCountryChange}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none appearance-none focus:border-[#3d3f96]"
                        >
                            <option value="">Select Country</option>
                            {countries.map(c => <option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* State */}
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">State</label>
                    <div className="relative">
                        <Map className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <select
                            disabled={!selectedCountryCode}
                            onChange={handleStateChange}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none appearance-none focus:border-[#3d3f96] disabled:opacity-50"
                        >
                            <option value="">Select State</option>
                            {states.map(s => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* City */}
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <select
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

            {/* Submit Button */}
            <button
                disabled={loading}
                type="submit"
                className="w-full bg-[#3d3f96] hover:bg-[#2d2f75] text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 transition-all active:scale-95 mt-6 disabled:opacity-70"
            >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <><UserPlus size={18} /> Register as User</>}
            </button>
        </form>
    );
};

export default UserRegister;