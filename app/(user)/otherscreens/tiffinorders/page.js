"use client";

import React, { useState } from 'react';
import { Calendar, Utensils, ChefHat, Sparkles } from 'lucide-react';

// Import your components from the ../components folder
import SubscriptionTiffin from './components/Tiffin'; // or ../components/OurTiffin
import CustomTiffin from './components/CustomTiffin';

export default function TiffinPage() {
    const [activeTab, setActiveTab] = useState('subscription'); // 'subscription' | 'custom'

    return (
        <div className="min-h-screen bg-[#f8fbff] py-8 px-4 sm:px-6 lg:px-10 max-w-[1600px] mx-auto space-y-8 antialiased select-none text-left">

            {/* Page Header */}
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-red-50/80 border border-red-100/60 text-red-600 flex items-center justify-center shadow-sm">
                        <ChefHat size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                            Tiffin &amp; Meal Services
                        </h1>
                        <p className="text-xs text-slate-500 font-bold mt-0.5">
                            Choose between curated dietitian subscription plans or customize your own daily tiffin meal.
                        </p>
                    </div>
                </div>
            </div>

            {/* --- NAVIGATION TABS --- */}
            <div className="flex items-center justify-center sm:justify-start">
                <div className="inline-flex p-1.5 bg-slate-200/60 backdrop-blur-md rounded-2xl border border-slate-200 shadow-inner gap-1.5">

                    {/* Subscription Tiffin Tab */}
                    <button
                        type="button"
                        onClick={() => setActiveTab('subscription')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all duration-200 cursor-pointer ${activeTab === 'subscription'
                                ? 'bg-[#3d3f96] text-white shadow-md shadow-indigo-950/15'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                            }`}
                    >
                        <Calendar size={15} />
                        <span>Subscription Tiffin</span>
                        <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${activeTab === 'subscription'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-slate-300/60 text-slate-600'
                                }`}
                        >
                            Plans
                        </span>
                    </button>

                    {/* Custom Tiffin Tab */}
                    <button
                        type="button"
                        onClick={() => setActiveTab('custom')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all duration-200 cursor-pointer ${activeTab === 'custom'
                                ? 'bg-[#3d3f96] text-white shadow-md shadow-indigo-950/15'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                            }`}
                    >
                        <Utensils size={15} />
                        <span>Custom Tiffin</span>
                        <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${activeTab === 'custom'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-slate-300/60 text-slate-600'
                                }`}
                        >
                            Build Own
                        </span>
                    </button>

                </div>
            </div>

            {/* --- TAB CONTENT VIEW --- */}
            <div className="w-full transition-all duration-300">
                {activeTab === 'subscription' ? (
                    <SubscriptionTiffin />
                ) : (
                    <CustomTiffin />
                )}
            </div>

        </div>
    );
}