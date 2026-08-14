"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { 
  FaUserEdit, FaArrowLeft, FaSave, FaUser, FaEnvelope, 
  FaLock, FaPhoneAlt, FaShieldAlt, FaGlobeAmericas, 
  FaMapMarkerAlt, FaCity, FaCamera 
} from "react-icons/fa";

// Standalone Mock Datasets for Roles & Locations (No external package dependencies)
const dbRolesMock = [
    { _id: "r1", name: "Pharmacy Manager" },
    { _id: "r2", name: "Lab Diagnostics Coordinator" },
    { _id: "r3", name: "Food Fleet Supervisor" },
    { _id: "r4", name: "General Content Manager" }
];

const countriesMock = [
    { isoCode: "IN", name: "India" },
    { isoCode: "US", name: "United States" }
];

const statesMock = [
    // India States
    { isoCode: "PB", countryCode: "IN", name: "Punjab" },
    { isoCode: "CH", countryCode: "IN", name: "Chandigarh" },
    { isoCode: "DL", countryCode: "IN", name: "Delhi" },
    // USA States
    { isoCode: "CA", countryCode: "US", name: "California" },
    { isoCode: "NY", countryCode: "US", name: "New York" }
];

const citiesMock = [
    // Punjab Cities
    { id: "ci1", stateCode: "PB", name: "Mohali" },
    { id: "ci2", stateCode: "PB", name: "Ludhiana" },
    // Chandigarh Cities
    { id: "ci3", stateCode: "CH", name: "Chandigarh Sector 17" },
    // Delhi Cities
    { id: "ci4", stateCode: "DL", name: "New Delhi" },
    // California Cities
    { id: "ci5", stateCode: "CA", name: "Los Angeles" },
    // New York Cities
    { id: "ci6", stateCode: "NY", name: "New York City" }
];

function EditSubadmin({ user, onClose, onSuccess }) {
    const [countries] = useState(countriesMock);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [dbRoles] = useState(dbRolesMock); 
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        roleTypeId: "", 
        phone: "",
        address: "",
        country: "",
        countryCode: "",
        state: "",
        stateCode: "",
        city: "",
        image: "",
    });

    const [previewImage, setPreviewImage] = useState(null);

    // Royal Indigo theme configurations based on #3D3F96
    const themeBg = "bg-[#3D3F96]";
    const themeText = "text-[#3D3F96]";
    const themeHoverBg = "hover:bg-[#2C2D75]";
    const themeShadow = "shadow-[#3D3F96]/20";
    const themeRing = "focus:ring-[#3D3F96]/30";

    useEffect(() => {
        // Pre-populate data based on the selected user in standalone design mode
        const defaultUser = user || {
            _id: "mock_subadmin",
            name: "Rahul Sharma",
            email: "rahul.sharma@diabeteswala.com",
            phone: "9876543210",
            locationAccess: { country: "India", state: "Punjab", city: "Mohali" },
            roleType: "r1",
            image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&auto=format&fit=crop"
        };

        const countryName = defaultUser.locationAccess?.country || defaultUser.country;
        const stateName = defaultUser.locationAccess?.state || defaultUser.state;
        const cityName = defaultUser.locationAccess?.city || defaultUser.city;

        const selectedCountry = countries.find((c) => c.name === countryName);
        const countryCode = selectedCountry?.isoCode || "";

        const stateList = statesMock.filter(s => s.countryCode === countryCode);
        const selectedState = stateList.find((s) => s.name === stateName);
        const stateCode = selectedState?.isoCode || "";

        const cityList = citiesMock.filter(c => c.stateCode === stateCode);

        setStates(stateList);
        setCities(cityList);

        const userRole = defaultUser.roleType 
            ? (Array.isArray(defaultUser.roleType) 
                ? (defaultUser.roleType[0]?._id || defaultUser.roleType[0] || "") 
                : (typeof defaultUser.roleType === 'object' ? defaultUser.roleType._id : defaultUser.roleType))
            : "";

        setFormData({
            name: defaultUser.name || "",
            email: defaultUser.email || "",
            password: "", 
            roleTypeId: userRole,
            phone: defaultUser.phone || "",
            address: defaultUser.address || "",
            country: countryName || "",
            countryCode,
            state: stateName || "",
            stateCode,
            city: cityName || "",
            image: defaultUser.image || "",
        });

        setPreviewImage(defaultUser.image);
    }, [user, countries]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCountryChange = (e) => {
        const countryCode = e.target.value;
        const selectedCountry = countries.find((c) => c.isoCode === countryCode);
        const stateList = statesMock.filter(s => s.countryCode === countryCode);

        setStates(stateList);
        setCities([]);

        setFormData({
            ...formData,
            country: selectedCountry?.name || "",
            countryCode,
            state: "",
            stateCode: "",
            city: "",
        });
    };

    const handleStateChange = (e) => {
        const stateCode = e.target.value;
        const selectedState = states.find((s) => s.isoCode === stateCode);
        const cityList = citiesMock.filter(c => c.stateCode === stateCode);

        setCities(cityList);

        setFormData({
            ...formData,
            state: selectedState?.name || "",
            stateCode,
            city: "",
        });
    };

    const handleCityChange = (e) => {
        setFormData({ ...formData, city: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setPreviewImage(imageUrl);
            setFormData({ ...formData, image: imageUrl });
            toast.success("Profile picture updated locally!");
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.roleTypeId) {
            toast.error("Please select an Authority Role.");
            return;
        }

        setSubmitting(true);
        // Simulating API save delay for live animated feedback
        setTimeout(() => {
            toast.success("Sub-Admin updated successfully (Mock Mode)!");
            setSubmitting(false);
            if (onSuccess) onSuccess(); 
            if (onClose) onClose(); 
        }, 1200);
    };

    return (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto max-w-4xl mx-auto select-none animate-fadeIn">
            <Toaster position="top-right" />
            
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center shrink-0">
                        <FaUserEdit className="text-xl" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-gray-800 tracking-tight leading-snug">Edit Sub-Admin Profile</h2>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mt-0.5">Admin ID: #{user?._id || "mock_subadmin"}</span>
                    </div>
                </div>
                <button 
                    onClick={onClose} 
                    className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold uppercase tracking-wider transition-all focus:outline-none"
                >
                    <FaArrowLeft className="text-[10px]" /> Go Back
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Profile Picture Uploader */}
                <div className="flex flex-col items-center justify-center pb-4 border-b border-gray-50">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#3D3F96]/20 shadow-md group shrink-0">
                        <img 
                            src={previewImage || "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&auto=format&fit=crop"} 
                            alt="Preview" 
                            className="w-full h-full object-cover rounded-full"
                        />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                            <FaCamera className="text-white text-sm" />
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Upload Profile Photo</span>
                </div>

                {/* Basic Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><FaUser className={themeText} /> Full Name</label>
                        <input 
                            type="text" 
                            name="name" 
                            required 
                            value={formData.name} 
                            onChange={handleChange}
                            className={`w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all font-bold text-sm text-gray-700`} 
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><FaEnvelope className={themeText} /> Official Email</label>
                        <input 
                            type="email" 
                            name="email" 
                            required 
                            value={formData.email} 
                            onChange={handleChange}
                            className={`w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all font-bold text-sm text-gray-700`} 
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><FaPhoneAlt className={themeText} /> Contact Number</label>
                        <input 
                            type="text" 
                            name="phone" 
                            required 
                            value={formData.phone} 
                            onChange={handleChange}
                            className={`w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all font-bold text-sm text-gray-700`} 
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><FaLock className={themeText} /> Security Password (Optional)</label>
                        <input 
                            type="password" 
                            name="password" 
                            placeholder="Leave blank to keep current" 
                            value={formData.password} 
                            onChange={handleChange}
                            className={`w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all font-bold text-sm text-gray-700 placeholder:text-gray-300`} 
                        />
                    </div>

                    {/* Single Select Dropdown for Role Template */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><FaShieldAlt className={themeText} /> Authority Role</label>
                        <select
                            name="roleTypeId"
                            value={formData.roleTypeId}
                            onChange={handleChange}
                            required
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#3D3F96] focus:ring-1 focus:ring-[#3D3F96]/30 transition-all font-bold text-sm text-gray-700 cursor-pointer"
                        >
                            <option value="">Select Permission Level</option>
                            {dbRoles.map((role) => (
                                <option key={role._id} value={role._id}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Locations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-50">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><FaGlobeAmericas className={themeText} /> Country</label>
                        <select 
                            value={formData.countryCode} 
                            onChange={handleCountryChange} 
                            required 
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#3D3F96] focus:ring-1 focus:ring-[#3D3F96]/30 transition-all font-bold text-sm text-gray-700 cursor-pointer"
                        >
                            <option value="">Select Country</option>
                            {countries.map((country) => (
                                <option key={country.isoCode} value={country.isoCode}>{country.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><FaMapMarkerAlt className="text-rose-500" /> State / Province</label>
                        <select 
                            value={formData.stateCode} 
                            onChange={handleStateChange} 
                            disabled={!formData.countryCode} 
                            required 
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#3D3F96] focus:ring-1 focus:ring-[#3D3F96]/30 transition-all font-bold text-sm text-gray-700 cursor-pointer disabled:opacity-50"
                        >
                            <option value="">Select State</option>
                            {states.map((state) => (
                                <option key={state.isoCode} value={state.isoCode}>{state.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><FaCity className={themeText} /> Assigned City</label>
                        <select 
                            value={formData.city} 
                            onChange={handleCityChange} 
                            disabled={!formData.stateCode} 
                            required 
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#3D3F96] focus:ring-1 focus:ring-[#3D3F96]/30 transition-all font-bold text-sm text-gray-700 cursor-pointer disabled:opacity-50"
                        >
                            <option value="">Select City</option>
                            {cities.map((city, index) => (
                                <option key={index} value={city.name}>{city.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Submit button */}
                <div className="pt-6 border-t border-gray-50 flex justify-end">
                    <button 
                        type="submit" 
                        disabled={submitting} 
                        className={`w-full md:w-auto text-white font-bold px-10 py-3.5 rounded-xl text-xs uppercase tracking-[0.2em] transition-all focus:outline-none ${themeBg} ${themeHoverBg} ${themeShadow} shadow-lg disabled:opacity-50`}
                    >
                        {submitting ? "Updating..." : "Update Details"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditSubadmin;