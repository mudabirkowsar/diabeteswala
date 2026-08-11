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
            <div className="max-w-[1400px] mx-auto px-6 lg:px-24 py-12">
                
                {/* --- TAB BAR --- */}
                <div className="mb-10">
                    <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-6 py-3.5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all duration-300 relative ${
                                    activeTab === tab.id 
                                    ? 'text-white' 
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                {/* Active Background Animation */}
                                {activeTab === tab.id && (
                                    <motion.div 
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-[#3d3f96] rounded-[1.5rem]"
                                        transition={{ type: 'spring', duration: 0.5 }}
                                    />
                                )}
                                
                                <span className="relative z-10 flex items-center gap-2">
                                    <tab.icon size={16} />
                                    {tab.label}
                                </span>
                            </button>
                        ))}
                    </div>
                    
                    {/* Breadcrumb style indicator for mobile/context */}
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
                        <span>Account</span>
                        <ChevronRight size={12} />
                        <span className="text-[#3d3f96]">{activeTab}</span>
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