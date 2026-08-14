"use client";

import React, { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { FaUserPlus, FaUser, FaEnvelope, FaLock, FaPhoneAlt, FaShieldAlt, FaGlobeAmericas, FaMapMarkerAlt, FaCity } from "react-icons/fa";

// Standalone Mock Datasets for Roles & Locations
const dbRolesMock = [
    { _id: "r1", name: "Pharmacy Manager" },
    { _id: "r2", name: "Lab Diagnostics Coordinator" },
    { _id: "r3", name: "Food Fleet Supervisor" },
    { _id: "r4", name: "General Content Manager" }
];

const countriesMock = [
    { id: "c1", name: "India" },
    { id: "c2", name: "United States" }
];

const statesMock = [
    // India States
    { id: "s1", countryId: "c1", name: "Punjab" },
    { id: "s2", countryId: "c1", name: "Chandigarh" },
    { id: "s3", countryId: "c1", name: "Delhi" },
    // USA States
    { id: "s4", countryId: "c2", name: "California" },
    { id: "s5", countryId: "c2", name: "New York" }
];

const citiesMock = [
    // Punjab Cities
    { id: "ci1", stateId: "s1", name: "Mohali" },
    { id: "ci2", stateId: "s1", name: "Ludhiana" },
    // Chandigarh Cities
    { id: "ci3", stateId: "s2", name: "Chandigarh Sector 17" },
    // Delhi Cities
    { id: "ci4", stateId: "s3", name: "New Delhi" },
    // California Cities
    { id: "ci5", stateId: "s4", name: "Los Angeles" },
    // New York Cities
    { id: "ci6", stateId: "s5", name: "New York City" }
];

function AddNewSubadmin({ onSuccess }) { 
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        roleTypeId: "", 
        country: "",
        state: "",
        city: "",
    });

    const [submitting, setSubmitting] = useState(false);
    const [dbRoles] = useState(dbRolesMock); 

    const [countries] = useState(countriesMock);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    // Theme Color Tokens based on #3D3F96
    const themeBg = "bg-[#3D3F96]";
    const themeText = "text-[#3D3F96]";
    const themeHoverBg = "hover:bg-[#2C2D75]";
    const themeShadow = "shadow-[#3D3F96]/20";
    const themeRing = "focus:ring-[#3D3F96]/30";

    // Dynamic Filter: Load States when Country changes locally
    useEffect(() => {
        if (!formData.country) {
            setStates([]);
            return;
        }
        const filteredStates = statesMock.filter(s => s.countryId === formData.country);
        setStates(filteredStates);
    }, [formData.country]);

    // Dynamic Filter: Load Cities when State changes locally
    useEffect(() => {
        if (!formData.state) {
            setCities([]);
            return;
        }
        const filteredCities = citiesMock.filter(c => c.stateId === formData.state);
        setCities(filteredCities);
    }, [formData.state]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation: Role selection is mandatory
        if (!formData.roleTypeId) {
            toast.error("Please select an Authority Role.");
            return;
        }

        setSubmitting(true);

        // Simulating API save delay for live animated feedback
        setTimeout(() => {
            const countryName = countries.find(c => c.id === formData.country)?.name;
            const stateName = states.find(s => s.id === formData.state)?.name;
            const cityName = cities.find(c => c.id === formData.city)?.name;

            console.log("Mock Payload Deployed:", {
                ...formData,
                locationAccess: { country: countryName, state: stateName, city: cityName }
            });

            toast.success("Sub-Admin Deployed Successfully (Mock Mode)!");
            setFormData({
                name: "",
                email: "",
                password: "",
                phone: "",
                roleTypeId: "", 
                country: "",
                state: "",
                city: "",
            });
            setStates([]);
            setCities([]);
            setSubmitting(false);
            if (onSuccess) onSuccess(); 
        }, 1200);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex justify-center items-start py-10 px-4 animate-fadeIn select-none">
            <Toaster 
                position="top-right"
                toastOptions={{
                    style: {
                        background: '#1e293b',
                        color: '#fff',
                        borderRadius: '16px',
                        fontSize: '14px',
                        fontWeight: '600',
                        padding: '16px',
                    },
                }}
            />
            
            <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-xl shadow-black/5 p-10 border border-gray-100">

                {/* Header Title Section */}
                <div className="mb-8 flex items-center gap-3.5 border-b border-gray-100 pb-5">
                    <div className="w-12 h-12 rounded-2xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center shadow-inner">
                        <FaUserPlus className="text-xl" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">
                            Deploy New Administrator
                        </h2>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Assign system access and regional authority</p>
                    </div>
                </div>

                {/* Form Elements */}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Name */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><FaUser className={themeText} /> Full Name</label>
                        <input 
                            type="text" 
                            name="name" 
                            required 
                            placeholder="John Doe" 
                            value={formData.name}
                            onChange={handleChange}
                            disabled={submitting}
                            className={`w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all font-bold text-sm text-gray-700 disabled:opacity-50`} 
                        />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><FaEnvelope className={themeText} /> Official Email</label>
                        <input 
                            type="email" 
                            name="email" 
                            required 
                            placeholder="admin@diabeteswala.com" 
                            value={formData.email}
                            onChange={handleChange}
                            disabled={submitting}
                            className={`w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all font-bold text-sm text-gray-700 disabled:opacity-50`} 
                        />
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><FaLock className={themeText} /> Security Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            required 
                            placeholder="••••••••" 
                            value={formData.password}
                            onChange={handleChange}
                            disabled={submitting}
                            className={`w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all font-bold text-sm text-gray-700 disabled:opacity-50`} 
                        />
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><FaPhoneAlt className={themeText} /> Contact Number</label>
                        <input 
                            type="text" 
                            name="phone" 
                            required 
                            placeholder="9876543210" 
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={submitting}
                            className={`w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all font-bold text-sm text-gray-700 disabled:opacity-50`} 
                        />
                    </div>

                    {/* Authority Role Dropdown */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><FaShieldAlt className={themeText} /> Authority Role</label>
                        <select 
                            name="roleTypeId" 
                            required 
                            value={formData.roleTypeId} 
                            onChange={handleChange}
                            disabled={submitting}
                            className={`w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all font-bold text-sm text-gray-700 cursor-pointer disabled:opacity-50`}
                        >
                            <option value="">Select Permission Level</option>
                            {dbRoles.map((role) => (
                                <option key={role._id} value={role._id}> {role.name} </option>
                            ))}
                        </select>
                    </div>

                    {/* Country Dropdown */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><FaGlobeAmericas className={themeText} /> Region (Country)</label>
                        <select 
                            name="country" 
                            value={formData.country} 
                            required 
                            disabled={submitting}
                            className={`w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all font-bold text-sm text-gray-700 cursor-pointer disabled:opacity-50`}
                            onChange={(e) => {
                                setFormData({ ...formData, country: e.target.value, state: "", city: "" });
                                setStates([]); 
                                setCities([]);
                            }}
                        >
                            <option value="">Select Country</option>
                            {countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    {/* State Dropdown */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><FaMapMarkerAlt className="text-rose-500" /> State / Province</label>
                        <select 
                            name="state" 
                            value={formData.state} 
                            required 
                            disabled={!formData.country || submitting} 
                            className={`w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all font-bold text-sm text-gray-700 cursor-pointer disabled:opacity-50`}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value, city: "" })}
                        >
                            <option value="">Select State</option>
                            {states.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>

                    {/* City Dropdown */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><FaCity className={themeText} /> Assigned City</label>
                        <select 
                            name="city" 
                            value={formData.city} 
                            required 
                            disabled={!formData.state || submitting} 
                            onChange={handleChange}
                            className={`w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all font-bold text-sm text-gray-700 cursor-pointer disabled:opacity-50`}
                        >
                            <option value="">Select City</option>
                            {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    {/* Submit Button */}
                    <div className="md:col-span-2 pt-4">
                        <button 
                            type="submit" 
                            disabled={submitting}
                            className={`w-full text-white py-5 rounded-2xl transition-all font-black uppercase text-xs tracking-[0.2em] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 focus:outline-none ${themeBg} ${themeHoverBg} ${themeShadow} shadow-xl`}
                        >
                            {submitting ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    Processing Deployment...
                                </>
                            ) : "Confirm & Create Admin"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default AddNewSubadmin;