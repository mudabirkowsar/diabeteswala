"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, 
    MapPin, 
    Siren, 
    Users,
    ChevronRight
} from 'lucide-react';

// Components
import UserProfile from './components/UserProfile';
import UserAddress from './components/UserAddress';
import EmergencyContacts from './components/EmergencyContacts';
import FamilyMembers from './components/FamilyMembers';
import FamilyHistoryAndAll from './components/FamilyHistoryAndAll';

function Page() {
    // 1. State to track active tab
    const [activeTab, setActiveTab] = useState('profile');

    // 2. Tab Configuration
    const tabs = [
        { id: 'profile', label: 'Profile', icon: User, component: <UserProfile /> },
        { id: 'address', label: 'Address', icon: MapPin, component: <UserAddress /> },
        { id: 'emergency', label: 'Emergency', icon: Siren, component: <EmergencyContacts /> },
        { id: 'family', label: 'Family', icon: Users, component: <FamilyMembers /> },
        { id: 'family-history', label: 'Family History', icon: Users, component: <FamilyHistoryAndAll />},
    ];

    return (
        <main className="min-h-screen bg-[#F8FAFC]">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-24 py-12">
                
                {/* --- TAB BAR --- */}
                <div className="mb-10">
                    {/* Horizontally scrollable on mobile, wraps cleanly on desktop */}
                    <div className="flex overflow-x-auto lg:flex-wrap lg:overflow-x-visible items-center gap-2 bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] whitespace-nowrap">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-6 py-3.5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all duration-350 relative shrink-0 ${
                                    activeTab === tab.id 
                                    ? 'text-white' 
                                    : 'text-slate-500 hover:text-[#EB333C] hover:bg-slate-50'
                                }`}
                            >
                                {/* Active Background Gradient Animation (#3d3f96 to #EB333C) */}
                                {activeTab === tab.id && (
                                    <motion.div 
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-gradient-to-r from-[#3d3f96] to-[#EB333C] rounded-[1.5rem] shadow-lg shadow-indigo-100"
                                        transition={{ type: 'spring', duration: 0.5 }}
                                    />
                                )}
                                
                                <span className="relative z-10 flex items-center gap-2">
                                    <tab.icon size={15} />
                                    {tab.label}
                                </span>
                            </button>
                        ))}
                    </div>
                    
                    {/* Breadcrumb indicator with updated accent color */}
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
                        <span>Account</span>
                        <ChevronRight size={12} className="text-slate-300" />
                        <span className="text-[#EB333C]">{activeTab.replace('-', ' ')}</span>
                    </div>
                </div>

                {/* --- CONTENT AREA --- */}
                <div className="relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {tabs.find(t => t.id === activeTab)?.component}
                        </motion.div>
                    </AnimatePresence>
                </div>

            </div>
        </main>
    );
}

export default Page;