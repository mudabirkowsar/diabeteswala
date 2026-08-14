"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
    FaPercentage, FaUtensils, FaPills, FaFlask, FaUserMd, 
    FaHospital, FaCrown, FaSave, FaSync, FaInfoCircle, FaChartPie, FaStethoscope, FaChartLine 
} from "react-icons/fa";

const CutoffSettingsPanel = () => {
    const [settings, setSettings] = useState({
        foodCutoff: 5,
        pharmacyCutoff: 5,
        labCutoff: 5,
        doctorCutoff: 5,
        clinicCutoff: 5,
        membershipCutoff: 10
    });

    const [loading, setLoading] = useState(false);

    // Color structures and utilities
    const themeBg = "bg-[#3D3F96]";
    const themeText = "text-[#3D3F96]";
    const themeHoverBg = "hover:bg-[#2C2D75]";
    const themeShadow = "shadow-[#3D3F96]/20";

    useEffect(() => {
        fetchCutoffSettings();
    }, []);

    const getToken = () => {
        const data = sessionStorage.getItem("admin");
        if (!data) return null;
        try {
            return JSON.parse(data).token;
        } catch {
            return null;
        }
    };

    const fetchCutoffSettings = async () => {
        try {
            const token = getToken();
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/admin-revenue/cutoff-settings`,
                { headers: { token } }
            );

            if (response.data.success) {
                setSettings(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching cutoff settings:", error);
            alert("Error fetching cutoff settings");
        }
    };

    const updateCutoffSettings = async () => {
        try {
            setLoading(true);
            const token = getToken();

            const response = await axios.put(
                `${process.env.REACT_APP_API_URL}/admin-revenue/cutoff-settings`,
                settings,
                { headers: { token } }
            );

            if (response.data.success) {
                alert("Cutoff settings updated successfully!");
            } else {
                alert("Failed to update settings");
            }
        } catch (error) {
            console.error("Error updating cutoff settings:", error);
            alert("Error updating settings");
        } finally {
            setLoading(false);
        }
    };

    const handleCutoffChange = (type, value) => {
        setSettings(prev => ({
            ...prev,
            [type]: Math.min(100, Math.max(0, value))
        }));
    };

    // Card structure mapping with Tailwind configurations
    const cards = [
        {
            key: "foodCutoff",
            label: "Food Orders",
            desc: "Restaurant and food delivery orders",
            icon: <FaUtensils className="text-lg text-blue-600" />,
            border: "border-blue-100",
            bg: "bg-blue-50/10",
            accent: "accent-blue-600",
            badge: "bg-blue-50 text-blue-700",
            value: settings.foodCutoff
        },
        {
            key: "pharmacyCutoff",
            label: "Pharmacy Orders",
            desc: "Medicine and pharmacy product orders",
            icon: <FaPills className="text-lg text-emerald-600" />,
            border: "border-emerald-100",
            bg: "bg-emerald-50/10",
            accent: "accent-emerald-600",
            badge: "bg-emerald-50 text-emerald-700",
            value: settings.pharmacyCutoff
        },
        {
            key: "labCutoff",
            label: "Lab Orders",
            desc: "Lab tests and diagnostic services",
            icon: <FaFlask className="text-lg text-sky-600" />,
            border: "border-sky-100",
            bg: "bg-sky-50/10",
            accent: "accent-sky-600",
            badge: "bg-sky-50 text-sky-700",
            value: settings.labCutoff
        },
        {
            key: "doctorCutoff",
            label: "Doctor Orders",
            desc: "Independent doctor consultations",
            icon: <FaUserMd className="text-lg text-amber-600" />,
            border: "border-amber-100",
            bg: "bg-amber-50/10",
            accent: "accent-amber-600",
            badge: "bg-amber-50 text-amber-700",
            value: settings.doctorCutoff
        },
        {
            key: "clinicCutoff",
            label: "Clinic Orders",
            desc: "Clinic-based doctor consultations",
            icon: <FaHospital className="text-lg text-rose-600" />,
            border: "border-rose-100",
            bg: "bg-rose-50/10",
            accent: "accent-rose-600",
            badge: "bg-rose-50 text-rose-700",
            value: settings.clinicCutoff
        },
        {
            key: "membershipCutoff",
            label: "Membership Purchases",
            desc: "Doctor membership plan purchases",
            icon: <FaCrown className="text-lg text-[#3D3F96]" />,
            border: "border-indigo-100",
            bg: "bg-[#3D3F96]/5",
            accent: "accent-[#3D3F96]",
            badge: "bg-indigo-50 text-[#3D3F96]",
            value: settings.membershipCutoff
        }
    ];

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            
            {/* COMPONENT TITLE */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center">
                        <FaPercentage className="text-xl" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 leading-snug">Revenue Cutoff Settings</h2>
                        <p className="text-xs text-gray-400">Set commission percentages for different service categories</p>
                    </div>
                </div>
                <span className="self-start sm:self-auto bg-[#3D3F96]/10 text-[#3D3F96] text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                    Admin Commission Control
                </span>
            </div>

            {/* HOW IT WORKS BANNER */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center shrink-0">
                    <FaInfoCircle className="text-xl" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-slate-800 leading-snug">How it works:</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Set the percentage of each order that goes to admin as commission. The remaining amount will be credited directly to the vendor/doctor/clinic.
                    </p>
                </div>
            </div>

            {/* CUTOFF SLIDERS GRID (6 categories) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card) => (
                    <div key={card.key} className={`bg-white rounded-2xl border ${card.border} p-6 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.012)] hover:shadow-[0_15px_40px_rgb(0,0,0,0.03)] transition-all duration-300`}>
                        <div>
                            {/* Card Header inside slider */}
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                                    {card.icon}
                                </div>
                                <h3 className="text-sm font-bold text-slate-800">{card.label}</h3>
                            </div>
                            <p className="text-xs text-slate-400 mb-4">{card.desc}</p>
                        </div>

                        {/* Slider Controller */}
                        <div className="space-y-3 mt-auto">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-semibold text-slate-500">Current Cutoff:</span>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${card.badge}`}>{card.value}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="50"
                                step="1"
                                value={card.value}
                                onChange={(e) => handleCutoffChange(card.key, parseInt(e.target.value))}
                                className={`w-full h-1.5 bg-gray-100 rounded-lg cursor-pointer ${card.accent}`}
                            />
                            <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                <span>0%</span>
                                <span>50%</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* CURRENT SETTINGS SUMMARY BOX */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-2.5 mb-6 border-b border-gray-200/60 pb-3">
                    <FaChartPie className="text-slate-500 text-lg" />
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Settings Summary</h3>
                </div>

                {/* Micro Summaries */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
                        <small className="text-xs font-bold text-gray-400 uppercase block tracking-wider">Food</small>
                        <strong className="text-lg font-black text-blue-600 block mt-1">{settings.foodCutoff}%</strong>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
                        <small className="text-xs font-bold text-gray-400 uppercase block tracking-wider">Pharmacy</small>
                        <strong className="text-lg font-black text-emerald-600 block mt-1">{settings.pharmacyCutoff}%</strong>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
                        <small className="text-xs font-bold text-gray-400 uppercase block tracking-wider">Lab</small>
                        <strong className="text-lg font-black text-sky-600 block mt-1">{settings.labCutoff}%</strong>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
                        <small className="text-xs font-bold text-gray-400 uppercase block tracking-wider">Doctor</small>
                        <strong className="text-lg font-black text-amber-600 block mt-1">{settings.doctorCutoff}%</strong>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
                        <small className="text-xs font-bold text-gray-400 uppercase block tracking-wider">Clinic</small>
                        <strong className="text-lg font-black text-rose-600 block mt-1">{settings.clinicCutoff}%</strong>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
                        <small className="text-xs font-bold text-gray-400 uppercase block tracking-wider">Membership</small>
                        <strong className="text-lg font-black text-[#3D3F96] block mt-1">{settings.membershipCutoff}%</strong>
                    </div>
                </div>

                {/* Average Calculation Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FaStethoscope className="text-slate-400" />
                            <span className="text-xs font-semibold text-slate-500">Medical Services Average</span>
                        </div>
                        <strong className="text-base font-black text-slate-700">
                            {((settings.doctorCutoff + settings.clinicCutoff) / 2).toFixed(1)}%
                        </strong>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FaChartLine className="text-slate-400" />
                            <span className="text-xs font-semibold text-slate-500">Overall Platform Average</span>
                        </div>
                        <strong className="text-base font-black text-slate-700">
                            {(
                                (settings.foodCutoff +
                                 settings.pharmacyCutoff +
                                 settings.labCutoff +
                                 settings.doctorCutoff +
                                 settings.clinicCutoff +
                                 settings.membershipCutoff) / 6
                            ).toFixed(1)}%
                        </strong>
                    </div>
                </div>
            </div>

            {/* CONTROLLING ACTIONS */}
            <div className="text-center pt-4">
                <div className="flex justify-center gap-3 flex-wrap">
                    <button
                        onClick={updateCutoffSettings}
                        disabled={loading}
                        className={`flex items-center justify-center gap-2 text-white font-bold px-8 py-3 rounded-xl text-sm transition-all focus:outline-none ${themeBg} ${themeHoverBg} ${themeShadow} shadow-lg`}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm animate-spin mr-2"></span>
                                Updating Settings...
                            </>
                        ) : (
                            <>
                                <FaSave /> Update All Settings
                            </>
                        )}
                    </button>
                    <button
                        onClick={fetchCutoffSettings}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-sm font-semibold transition-all focus:outline-none"
                    >
                        <FaSync /> Refresh
                    </button>
                </div>
                <p className="text-xs text-gray-400 mt-4 max-w-md mx-auto">
                    Changes will affect all future orders immediately. Existing orders will maintain their original cutoff percentages.
                </p>
            </div>

        </div>
    );
};

export default CutoffSettingsPanel;