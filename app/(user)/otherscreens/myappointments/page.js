"use client";

import React, { useState } from 'react';
import { Stethoscope, Building2, CalendarCheck, Activity } from 'lucide-react';

// Dynamically imported appointment panels from your local components directory
import DoctorAppointments from './components/DoctorAppointments';
import ClinicalAppointments from './components/ClinicalAppointments';

export default function AppointmentsDashboardPage() {
  const [activeTab, setActiveTab] = useState('doctor'); // Default selected tab is 'doctor'

  const tabs = [
    {
      id: 'doctor',
      name: 'Doctor Consultations',
      icon: <Stethoscope size={15} />,
      component: <DoctorAppointments />
    },
    {
      id: 'clinic',
      name: 'Clinical Bookings',
      icon: <Building2 size={15} />,
      component: <ClinicalAppointments />
    }
  ];

  return (
    <main className="min-h-screen bg-[#f8fbff] py-8 sm:py-12 antialiased select-none text-slate-800 text-left">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Block */}
        <div className="space-y-2 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-50/80 border border-red-100/60 text-red-600 flex items-center justify-center shadow-sm">
              <CalendarCheck size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Appointments &amp; Bookings</h1>
              <p className="text-xs text-slate-500 font-bold mt-0.5">
                Track, monitor, and manage your specialist doctor consultations, video calls, and clinic facility admissions.
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
                className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border flex items-center gap-2 ${
                  isSelected
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