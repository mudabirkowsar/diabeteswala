"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Utensils, Activity, Pill, ClipboardCheck, Cpu } from 'lucide-react';

// Dynamically imported orders panels from your local components directory
import FoodOrders from './components/FoodOrders';
import LabOrders from './components/LabOrders';
import PharmacyOrders from './components/PharmacyOrders';
import CgmOrders from './components/CgmOrders';

function OrdersDashboardContent() {
  const searchParams = useSearchParams();
  const tabQuery = searchParams.get('tab'); // Reads ?tab=cgm from URL

  // Initialize with query param if valid, otherwise fallback to 'food'
  const [activeTab, setActiveTab] = useState('food');

  useEffect(() => {
    if (tabQuery && ['food', 'labs', 'pharmacy', 'cgm'].includes(tabQuery.toLowerCase())) {
      setActiveTab(tabQuery.toLowerCase());
    }
  }, [tabQuery]);

  const tabs = [
    {
      id: 'food',
      name: 'Food Orders',
      icon: <Utensils size={15} />,
      component: <FoodOrders />
    },
    {
      id: 'labs',
      name: 'Lab Orders',
      icon: <Activity size={15} />,
      component: <LabOrders />
    },
    {
      id: 'pharmacy',
      name: 'Pharmacy Orders',
      icon: <Pill size={15} />,
      component: <PharmacyOrders />
    },
    {
      id: 'cgm',
      name: 'CGM Orders',
      icon: <Cpu size={15} />, // Changed to Cpu icon for hardware/sensors
      component: <CgmOrders />
    }
  ];

  return (
    <main className="min-h-screen bg-[#f8fbff] py-8 sm:py-12 antialiased select-none text-slate-800 text-left">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Header Block */}
        <div className="space-y-2 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-50/80 border border-red-100/60 text-red-600 flex items-center justify-center shadow-sm">
              <ClipboardCheck size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Order Management</h1>
              <p className="text-xs text-slate-500 font-bold mt-0.5">
                Track, monitor, and manage your active clinical meals, diagnostic lab tests, CGM devices, and pharmacy orders.
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Category NavTabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 border-b border-slate-100/60 [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border flex items-center gap-2 ${isSelected
                  ? 'bg-red-50/60 text-red-600 border-red-200/60 font-black shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100 hover:border-slate-200'
                  }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Render Active Tab Component */}
        <div className="mt-6">
          {tabs.find((tab) => tab.id === activeTab)?.component}
        </div>

      </div>
    </main>
  );
}

export default function OrdersDashboardPage() {
  return (
    // Wrapped in Suspense as required by Next.js App Router for useSearchParams
    <Suspense fallback={<div className="p-10 text-center text-xs font-bold text-slate-400">Loading dashboard...</div>}>
      <OrdersDashboardContent />
    </Suspense>
  );
}