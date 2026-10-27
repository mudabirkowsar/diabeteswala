"use client";

import React, { useState } from 'react';
import {
    ShoppingBag,
    FileText,
    Zap,
    RotateCcw,
    RefreshCw,
    Clock,
    CheckCircle2,
    Truck,
    AlertCircle,
    Volume2,
    VolumeX,
    Layers,
    Sparkles
} from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

// --- CHILD COMPONENTS ---
// Make sure these files exist inside your ./components folder
import Orders from './components/Orders';
import UploadPrescriptionOrders from './components/UploadPrescriptionOrders';
import RapidOrders from './components/RapidOrders';
import ReturnOrders from './components/ReturnOrders';

export default function PharmacyOrdersHubPage() {
    // --- Active Tab State ---
    // 'orders' | 'prescriptions' | 'rapid' | 'returns'
    const [activeTab, setActiveTab] = useState('orders');

    // Audio notification toggle (for incoming pharmacy orders)
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Example Live Summary Stats (Replace with your actual API counts)
    const [stats, setStats] = useState({
        pendingCartOrders: 5,
        pendingRxUploads: 3,
        inTransit: 8,
        todayCompleted: 24
    });

    const handleRefreshAll = () => {
        setRefreshing(true);
        toast.success('Refreshing order channels...');
        setTimeout(() => {
            setRefreshing(false);
        }, 600);
    };

    const toggleSound = () => {
        const nextState = !soundEnabled;
        setSoundEnabled(nextState);
        toast(nextState ? 'Order notification chime enabled' : 'Order notification sound muted', {
            icon: nextState ? '🔔' : '🔕'
        });
    };

    // Tab definitions
    const tabs = [
        {
            id: 'orders',
            label: 'Standard Cart Orders',
            shortLabel: 'Cart Orders',
            icon: ShoppingBag,
            //   badge: stats.pendingCartOrders > 0 ? `${stats.pendingCartOrders} New` : null,
            badgeColor: 'bg-[#3d3f96] text-white',
            description: 'Medicines & OTC products ordered directly through patient shopping cart'
        },
        {
            id: 'rapid',
            label: 'Express 60-Min Orders',
            shortLabel: 'Express Orders',
            icon: Zap,
            badge: 'Priority',
            badgeColor: 'bg-amber-500 text-white',
            description: 'Urgent priority deliveries requiring immediate dispatch'
        },
        {
            id: 'prescriptions',
            label: 'Uploaded Prescriptions (Rx)',
            shortLabel: 'Rx Uploads',
            icon: FileText,
            //   badge: stats.pendingRxUploads > 0 ? `${stats.pendingRxUploads} Awaiting` : null,
            badgeColor: 'bg-[#EB333C] text-white animate-pulse',
            description: 'Prescription images requiring pharmacist verification & quote generation'
        },

        {
            id: 'returns',
            label: 'Returns & Cancellations',
            shortLabel: 'Returns',
            icon: RotateCcw,
            badge: null,
            description: 'Manage returned items, order cancellations, and patient refunds'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 antialiased text-left select-none">
            <Toaster position="top-right" />

            <div className="max-w-7xl mx-auto space-y-6">

                {/* --- HEADER SECTION --- */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-[#3d3f96] text-white flex items-center justify-center shadow-md shadow-indigo-100 shrink-0">
                            <ShoppingBag size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                    Pharmacy Order Fulfillment Hub
                                </h1>
                                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Live Channel
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                                Process direct cart checkouts, verify handwritten Rx uploads, and dispatch delivery riders.
                            </p>
                        </div>
                    </div>

                    {/* Action Header Controls */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <button
                            onClick={toggleSound}
                            title={soundEnabled ? 'Mute alert sounds' : 'Enable alert sounds'}
                            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center shadow-sm active:scale-95 transition-all cursor-pointer"
                        >
                            {soundEnabled ? (
                                <Volume2 size={16} className="text-[#3d3f96]" />
                            ) : (
                                <VolumeX size={16} className="text-slate-400" />
                            )}
                        </button>

                        <button
                            onClick={handleRefreshAll}
                            title="Refresh all channels"
                            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center shadow-sm active:scale-95 transition-all cursor-pointer"
                        >
                            <RefreshCw size={16} className={refreshing ? 'animate-spin text-[#3d3f96]' : ''} />
                        </button>
                    </div>
                </div>

                {/* --- QUICK KPI SUMMARY CARDS --- */}
                {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div 
            onClick={() => setActiveTab('orders')}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Cart Orders</span>
              <div className="p-1.5 rounded-lg bg-indigo-50 text-[#3d3f96] group-hover:scale-110 transition-transform">
                <ShoppingBag size={15} />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900">{stats.pendingCartOrders}</span>
              <span className="text-xs text-amber-600 font-bold">Needs Packing</span>
            </div>
          </div>

          <div 
            onClick={() => setActiveTab('prescriptions')}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-rose-200 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Rx Uploads</span>
              <div className="p-1.5 rounded-lg bg-rose-50 text-[#EB333C] group-hover:scale-110 transition-transform">
                <FileText size={15} />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900">{stats.pendingRxUploads}</span>
              <span className="text-xs text-[#EB333C] font-bold">Create Quotes</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Out for Delivery</span>
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <Truck size={15} />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900">{stats.inTransit}</span>
              <span className="text-xs text-blue-600 font-bold">With Riders</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Fulfilled Today</span>
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={15} />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900">{stats.todayCompleted}</span>
              <span className="text-xs text-emerald-600 font-bold">Completed</span>
            </div>
          </div>

        </div> */}

                {/* --- NAVIGATION TAB STRIP --- */}
                <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-200">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap active:scale-95 cursor-pointer ${isActive
                                        ? 'bg-[#3d3f96] text-white shadow-md shadow-indigo-100'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                        }`}
                                >
                                    <Icon size={16} />
                                    <span>{tab.label}</span>

                                    {tab.badge && (
                                        <span
                                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white text-[#3d3f96]' : tab.badgeColor
                                                }`}
                                        >
                                            {tab.badge}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* --- DYNAMIC CHANNEL VIEW MOUNTING --- */}
                <div className="transition-all duration-200">
                    {activeTab === 'orders' && (
                        <Orders />
                    )}

                    {activeTab === 'prescriptions' && (
                        <UploadPrescriptionOrders />
                    )}

                    {activeTab === 'rapid' && (
                        <RapidOrders />
                    )}

                    {activeTab === 'returns' && (
                        <ReturnOrders />
                    )}
                </div>

            </div>
        </div>
    );
}