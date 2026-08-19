"use client";

import React, { useState } from 'react';

const INITIAL_SUBSCRIBERS = [
  {
    id: "SUB-8041",
    customer: "Amit Verma",
    phone: "+91 98765 43210",
    planName: "1 Meal Anytime Plan",
    cycle: "Monthly",
    mealsPerDay: 1,
    deliverySlot: "Lunch (12:30 PM - 02:00 PM)",
    status: "Active", // "Active" or "Paused"
    joiningDate: "12 Mar 2026",
    paymentStatus: "Paid",
    address: "Flat 302, Height-A, Green Glen Layout, Bellandur, Bengaluru"
  },
  {
    id: "SUB-8039",
    customer: "Priya Nair",
    phone: "+91 91234 56789",
    planName: "Full Day Diet Plan",
    cycle: "Monthly",
    mealsPerDay: 3,
    deliverySlot: "Multi-Slot (Bkf / Lun / Din)",
    status: "Active",
    joiningDate: "05 Mar 2026",
    paymentStatus: "Paid",
    address: "Villa 14, Lotus Boulevard, Sector 150, Noida, UP"
  },
  {
    id: "SUB-8025",
    customer: "Rohan Das",
    phone: "+91 88776 55443",
    planName: "Low-GI Weekly Lunch Starter",
    cycle: "Weekly",
    mealsPerDay: 1,
    deliverySlot: "Lunch (12:30 PM - 02:00 PM)",
    status: "Paused", // Cycle holds/paused by user
    joiningDate: "28 Feb 2026",
    paymentStatus: "Refunded",
    address: "H-82, Second Floor, Sector 62, Noida, UP"
  }
];

export default function SubscribersDirectory() {
  const [subscribers, setSubscribers] = useState(INITIAL_SUBSCRIBERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSub, setSelectedSub] = useState(null);

  // Toggle Pause / Resume Subscriber Cycle
  const togglePauseCycle = (id) => {
    setSubscribers(prev => prev.map(sub => {
      if (sub.id === id) {
        const nextStatus = sub.status === "Active" ? "Paused" : "Active";
        const updated = { ...sub, status: nextStatus };
        if (selectedSub && selectedSub.id === id) setSelectedSub(updated);
        return updated;
      }
      return sub;
    }));
  };

  // Terminate/Cancel Subscription contract
  const cancelContract = (id) => {
    setSubscribers(prev => prev.filter(sub => sub.id !== id));
    setSelectedSub(null);
  };

  // Filter Search
  const filteredSubscribers = subscribers.filter(sub => 
    sub.customer.toLowerCase().includes(searchQuery.toLowerCase()) || 
    sub.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-fade-in">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Subscribers Directory</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage active food subscription plans, pause/resume delivery cycles, and inspect routing slots.</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-80 self-start sm:self-auto">
          <input
            type="text"
            placeholder="Search by ID or customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/15 text-slate-700 transition-all shadow-sm"
          />
          <SearchIcon className="absolute left-4 top-3.5 w-4 h-4 text-slate-400 stroke-[2.2]" />
        </div>
      </div>

      {/* Directory Table Grid Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredSubscribers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase font-extrabold bg-slate-50/70 tracking-wider">
                  <th className="py-5 px-6">Subscriber</th>
                  <th className="py-5 px-6">Active Plan Details</th>
                  <th className="py-5 px-6">Scheduled Delivery Slot</th>
                  <th className="py-5 px-6">Joined Date</th>
                  <th className="py-5 px-6">Status</th>
                  <th className="py-5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredSubscribers.map((sub) => (
                  <tr 
                    key={sub.id} 
                    onClick={() => setSelectedSub(sub)}
                    className="hover:bg-[#3D3F96]/5 cursor-pointer transition-all duration-150 group"
                  >
                    {/* Subscriber details */}
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center font-bold text-xs tracking-wider flex-shrink-0">
                          {getInitials(sub.customer)}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-800 text-[14px] leading-snug group-hover:underline">{sub.customer}</p>
                          <p className="text-[11px] font-semibold text-slate-400 mt-0.5">ID: <span className="text-[#3D3F96]">{sub.id}</span></p>
                        </div>
                      </div>
                    </td>

                    {/* Plan details */}
                    <td className="py-5 px-6">
                      <p className="font-bold text-slate-800 text-xs">{sub.planName}</p>
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-1">
                        {sub.cycle} • {sub.mealsPerDay} {sub.mealsPerDay === 1 ? 'Meal' : 'Meals'}/day
                      </p>
                    </td>

                    {/* Delivery Slots */}
                    <td className="py-5 px-6 font-semibold text-slate-500 text-xs">
                      {sub.deliverySlot}
                    </td>

                    {/* Joined Date */}
                    <td className="py-5 px-6 text-slate-500 font-bold text-xs">{sub.joiningDate}</td>

                    {/* Status badge */}
                    <td className="py-5 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                        sub.status === "Active"
                          ? "text-emerald-600 border-emerald-100 bg-emerald-50"
                          : "text-slate-500 border-slate-200 bg-slate-100"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sub.status === "Active" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                        {sub.status}
                      </span>
                    </td>

                    {/* Row actions */}
                    <td className="py-5 px-6 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => togglePauseCycle(sub.id)}
                          className={`px-3 py-1.5 text-xs font-bold border rounded-lg transition-all ${
                            sub.status === 'Active'
                              ? 'text-slate-600 bg-white border-slate-200 hover:bg-slate-50'
                              : 'text-emerald-700 bg-emerald-50 border-emerald-100 hover:bg-emerald-100'
                          }`}
                        >
                          {sub.status === 'Active' ? 'Pause' : 'Resume'}
                        </button>
                        <button
                          onClick={() => setSelectedSub(sub)}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-[#3D3F96] hover:bg-[#3D3F96]/95 rounded-lg shadow-sm shadow-[#3D3F96]/10"
                        >
                          Profile
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-16 text-center bg-white rounded-3xl border border-slate-200">
            <EmptyBoxIcon className="w-12 h-12 text-slate-300 mb-3" />
            <p className="font-bold text-slate-700">No Subscribers Found</p>
            <p className="text-sm text-slate-400 mt-1">There are no subscribers matching your current search query.</p>
          </div>
        )}
      </div>

      {/* DETAILED SUBSCRIBER OVERLAY PROFILE MODAL */}
      {selectedSub && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-scale-up flex flex-col">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center font-bold text-sm border border-[#3D3F96]/10">
                  {getInitials(selectedSub.customer)}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg uppercase tracking-tight">{selectedSub.customer}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Subscriber ID: {selectedSub.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus:outline-none"
              >
                <CloseIcon className="w-5 h-5 stroke-[2]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto">
              
              {/* Detailed Plan Parameter overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Contract Status</span>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                      selectedSub.status === "Active"
                        ? "text-emerald-600 border-emerald-100 bg-emerald-50"
                        : "text-slate-500 border-slate-200 bg-slate-100"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${selectedSub.status === "Active" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                      {selectedSub.status}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Payment Status</span>
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    selectedSub.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-slate-400'
                  }`}>
                    {selectedSub.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Personal metadata */}
              <div className="p-5 border border-slate-100 rounded-2xl space-y-3 text-xs font-semibold text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Primary Mobile</span>
                  <span className="text-slate-800 font-bold">{selectedSub.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Delivery Slot</span>
                  <span className="text-slate-800 font-bold">{selectedSub.deliverySlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Subscription Joined</span>
                  <span className="text-slate-800 font-bold">{selectedSub.joiningDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Meal Plan Tier</span>
                  <span className="text-slate-800 font-bold">{selectedSub.planName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Daily Meals Allotted</span>
                  <span className="text-slate-800 font-bold">{selectedSub.mealsPerDay} {selectedSub.mealsPerDay === 1 ? 'Meal' : 'Meals'} daily</span>
                </div>
                <div className="flex justify-between items-start pt-3 border-t border-slate-100">
                  <span className="text-slate-400">Delivery Address</span>
                  <span className="text-slate-800 font-bold max-w-xs text-right leading-relaxed">{selectedSub.address}</span>
                </div>
              </div>

              {/* Action Operations Bar */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => cancelContract(selectedSub.id)}
                  className="px-5 py-2.5 bg-white hover:bg-rose-50 border border-rose-100 text-rose-600 font-bold text-xs rounded-xl transition-all"
                >
                  Cancel Contract
                </button>
                <button
                  type="button"
                  onClick={() => togglePauseCycle(selectedSub.id)}
                  className={`px-5 py-2.5 font-bold text-xs rounded-xl transition-all shadow-md ${
                    selectedSub.status === 'Active'
                      ? 'bg-slate-200 hover:bg-slate-300 text-slate-700 shadow-slate-200/10'
                      : 'bg-[#3D3F96] hover:bg-[#3D3F96]/95 text-white shadow-[#3D3F96]/10'
                  }`}
                >
                  {selectedSub.status === 'Active' ? 'Pause Cycle' : 'Resume Cycle'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Icons

function SearchIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.604 10.604z" />
    </svg>
  );
}

function EmptyBoxIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125 1.125-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
}

function CloseIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}