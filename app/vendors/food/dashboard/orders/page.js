"use client";

import React, { useState } from 'react';
import { 
    Utensils, 
    Layers, 
    ShoppingBag, 
    ChefHat,
    Sparkles,
    CalendarClock
} from 'lucide-react';

// --- Import Order Components from ./components folder ---
import FoodOrders from './components/FoodOrders';
import TiffinOrders from './components/TiffinOrders';
import CustomizedTiffinOrders from './components/CustomizedTiffinOrders';

// --- Order Tabs Configuration ---
const ORDER_TABS = [
    {
        id: 'food',
        label: 'Food Orders',
        shortLabel: 'Food',
        badge: 'Direct',
        icon: Utensils,
        component: FoodOrders
    },
    {
        id: 'tiffin',
        label: 'Tiffin Orders',
        shortLabel: 'Tiffin Plans',
        badge: 'Subscription',
        icon: Layers,
        component: TiffinOrders
    },
    {
        id: 'custom_tiffin',
        label: 'Customized Tiffin',
        shortLabel: 'Custom Plate',
        badge: 'Personalized',
        icon: ChefHat,
        component: CustomizedTiffinOrders
    }
];

export default function OrdersManagementPage() {
    // --- Active Tab State ---
    const [activeTab, setActiveTab] = useState('food');

    // Retrieve active component
    const ActiveComponent = ORDER_TABS.find(tab => tab.id === activeTab)?.component || FoodOrders;

    return (
        <div className="max-w-[1400px] mx-auto py-6 px-4 sm:px-6 space-y-8 select-none antialiased text-left">
            
            {/* --- PAGE HEADER & MULTI-TAB NAVIGATION BAR --- */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-slate-100 pb-6">

                {/* Segmented Nav Tabs (Horizontally Scrollable on Mobile) */}
                <div className="flex items-center bg-slate-100/80 p-1.5 rounded-2xl gap-1.5 border border-slate-200/80 shadow-inner overflow-x-auto max-w-full [&::-webkit-scrollbar]:hidden">
                    {ORDER_TABS.map((tab) => {
                        const TabIcon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-2.5 shrink-0 border cursor-pointer ${
                                    isActive
                                        ? 'bg-red-50/60 text-red-600 border-red-200/60 shadow-sm shadow-red-100/50 scale-[1.01]'
                                        : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/55'
                                }`}
                            >
                                <TabIcon 
                                    size={15} 
                                    className={isActive ? 'text-red-600' : 'text-slate-400'} 
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                <span>{tab.label}</span>
                                
                                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase hidden sm:inline-block border ${
                                    isActive 
                                        ? 'bg-red-100/80 border-red-200/60 text-red-600' 
                                        : 'bg-slate-200 border-transparent text-slate-500'
                                }`}>
                                    {tab.badge}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* --- TAB CONTENT CONTAINER WITH ANIMATION --- */}
            <div className="transition-all duration-300">
                <div key={activeTab} className="animate-in fade-in duration-200">
                    <ActiveComponent />
                </div>
            </div>

        </div>
    );
}