"use client";

import React, { useState } from 'react';

const INITIAL_REQUESTS = [
  {
    id: "SKP-2041",
    customer: "Rohan Sharma",
    plan: "Monthly Premium Veg",
    date: "12 Jun 2026",
    mealsToSkip: ["Lunch", "Dinner"],
    reason: "Out of town for business trip",
    status: "Pending" // "Pending", "Approved", "Rejected"
  },
  {
    id: "SKP-2040",
    customer: "Anjali Gupta",
    plan: "Weekly Low GI Lunch",
    date: "14 Jun 2026",
    mealsToSkip: ["Lunch"],
    reason: "Office lunch party scheduled",
    status: "Pending"
  },
  {
    id: "SKP-2035",
    customer: "Vikram Malhotra",
    plan: "Monthly Keto Dinner",
    date: "10 Jun 2026",
    mealsToSkip: ["Dinner"],
    reason: "Fasting on spiritual holiday",
    status: "Approved"
  }
];

export default function SkipRequests() {
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [activeFilter, setActiveFilter] = useState('All'); // 'All', 'Pending', 'Approved', 'Rejected'

  // Update request state (Approve)
  const handleApprove = (id) => {
    setRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: "Approved" } : req
    ));
  };

  // Update request state (Reject)
  const handleReject = (id) => {
    setRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: "Rejected" } : req
    ));
  };

  // Get counters for badges
  const getCount = (status) => {
    if (status === 'All') return requests.length;
    return requests.filter(r => r.status === status).length;
  };

  const filteredRequests = requests.filter(req => 
    activeFilter === 'All' || req.status === activeFilter
  );

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  // Status-badge styling maps
  const statusStyles = {
    Pending: 'bg-amber-50 text-amber-700 border-amber-100',
    Approved: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    Rejected: 'bg-rose-50 text-rose-700 border-rose-100'
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-fade-in">
      
      {/* Header section */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Skip & Pause Requests</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Review, approve, and reschedule meal-pause requests submitted by subscribers.</p>
      </div>

      {/* Segmented Filter Tab Controls */}
      <div className="bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200/60 flex items-center overflow-x-auto gap-1 no-scrollbar max-w-lg">
        {['All', 'Pending', 'Approved', 'Rejected'].map((tab) => {
          const isActive = activeFilter === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                isActive
                  ? 'bg-[#3D3F96] text-white shadow-lg shadow-[#3D3F96]/15'
                  : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
              }`}
            >
              <span>{tab}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-all duration-200 ${
                isActive 
                  ? 'bg-white text-[#3D3F96]' 
                  : 'bg-slate-200/80 text-slate-600'
              }`}>
                {getCount(tab)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Requests Directory Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase font-extrabold bg-slate-50/70 tracking-wider">
                  <th className="py-5 px-6">Request details</th>
                  <th className="py-5 px-6">Subscriber</th>
                  <th className="py-5 px-6">Skip date</th>
                  <th className="py-5 px-6">Target meals</th>
                  <th className="py-5 px-6">Reason given</th>
                  <th className="py-5 px-6">Status</th>
                  <th className="py-5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-[#3D3F96]/5 transition-all duration-150">
                    
                    {/* ID */}
                    <td className="py-5 px-6 font-bold text-[#3D3F96]">{req.id}</td>

                    {/* Subscriber info */}
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center font-bold text-xs tracking-wider flex-shrink-0">
                          {getInitials(req.customer)}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-800 leading-tight">{req.customer}</p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-1">{req.plan}</p>
                        </div>
                      </div>
                    </td>

                    {/* Skip Date */}
                    <td className="py-5 px-6 text-slate-500 font-bold text-xs">{req.date}</td>

                    {/* Meals targeted */}
                    <td className="py-5 px-6">
                      <div className="flex gap-1">
                        {req.mealsToSkip.map(meal => (
                          <span key={meal} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-extrabold uppercase">
                            {meal}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Reason */}
                    <td className="py-5 px-6">
                      <p className="text-xs text-slate-500 font-medium truncate max-w-xs">{req.reason}</p>
                    </td>

                    {/* Status badge */}
                    <td className="py-5 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${statusStyles[req.status]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${req.status === 'Pending' ? 'bg-amber-500 animate-pulse' : req.status === 'Approved' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {req.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-5 px-6 text-right">
                      {req.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleReject(req.id)}
                            className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 rounded-lg transition-all"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg shadow-sm transition-all"
                          >
                            Approve
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium italic">Fulfillment Locked</span>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-16 text-center bg-white rounded-3xl border border-slate-200">
            <EmptyBoxIcon className="w-12 h-12 text-slate-300 mb-3" />
            <p className="font-bold text-slate-700">No Request Logs Found</p>
            <p className="text-sm text-slate-400 mt-1">There are no skip requests matching this category selection.</p>
          </div>
        )}
      </div>

    </div>
  );
}

// Icons

function EmptyBoxIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125 1.125-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
}