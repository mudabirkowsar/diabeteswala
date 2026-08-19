"use client";

import React from 'react';
import Link from 'next/link';

export default function TiffinDashboard() {
  // Mock Metrics
  const metrics = [
    { name: "Active Subscribers", value: "248 Users", description: "+8% growth this week", icon: UsersIcon, color: "text-[#3D3F96] bg-[#3D3F96]/10" },
    { name: "Today's Deliveries", value: "184 Boxes", description: "Breakfast, Lunch & Dinner", icon: DeliveryIcon, color: "text-emerald-600 bg-emerald-50" },
    { name: "Monthly Revenue", value: "₹1,42,800", description: "Recurring cashflow", icon: RevenueIcon, color: "text-sky-600 bg-sky-50" },
    { name: "Active Plans", value: "4 Plans", description: "Weekly & Monthly tiers", icon: PlansIcon, color: "text-amber-600 bg-amber-50" },
  ];

  // Mock Today's Meal Runs
  const todayRuns = [
    { meal: "Breakfast Run", slot: "07:30 AM - 09:00 AM", count: 62, status: "Delivered", color: "bg-emerald-500" },
    { meal: "Lunch Run", slot: "12:30 PM - 02:00 PM", count: 74, status: "In Progress", color: "bg-amber-500 animate-pulse" },
    { meal: "Dinner Run", slot: "07:30 PM - 09:00 PM", count: 48, status: "Scheduled", color: "bg-slate-300" }
  ];

  // Recent Subscribers Activity
  const recentSubscribers = [
    { name: "Rohan Sharma", plan: "Monthly Premium Veg", value: "₹4,500", date: "Today, 10:15 AM", payment: "Paid" },
    { name: "Anjali Gupta", plan: "Weekly Low GI Lunch", value: "₹1,200", date: "Today, 08:30 AM", payment: "Paid" },
    { name: "Vikram Malhotra", plan: "Monthly Keto Dinner", value: "₹5,200", date: "Yesterday, 06:15 PM", payment: "Paid" }
  ];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-fade-in">
      
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Tiffin Dashboard</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Real-time tracking of recurring meal plans and daily dispatches.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metrics.map((m) => (
          <div key={m.name} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{m.name}</span>
              <p className="text-2xl font-black text-slate-900">{m.value}</p>
              <p className="text-xs text-slate-500 font-medium">{m.description}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${m.color} flex-shrink-0`}>
              <m.icon className="w-6 h-6 stroke-[2]" />
            </div>
          </div>
        ))}
      </div>

      {/* Content Layout Splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Meal Runs (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Today's Delivery Batches</h2>
              <p className="text-xs text-slate-400 mt-1">Fulfillment schedule of active subscriber runs today.</p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full uppercase">
              Live Runs
            </span>
          </div>

          <div className="space-y-4">
            {todayRuns.map((run) => (
              <div key={run.meal} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#3D3F96]/30 transition-all gap-4">
                <div className="flex items-center gap-4">
                  <span className={`w-3.5 h-3.5 rounded-full ${run.color} flex-shrink-0`} />
                  <div>
                    <p className="font-extrabold text-slate-800 text-sm">{run.meal}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{run.slot}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 justify-between sm:justify-end">
                  <span className="px-3 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold">
                    {run.count} Subscriptions
                  </span>
                  <span className={`text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border ${
                    run.status === 'Delivered'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : run.status === 'In Progress'
                        ? 'bg-amber-50 text-amber-700 border-amber-100'
                        : 'bg-slate-100 text-slate-400 border-transparent'
                  }`}>
                    {run.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions & Pending skips */}
        <div className="space-y-6">
          
          {/* Quick Setup Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-tight pb-2 border-b border-slate-100">
              Fulfillment Operations
            </h3>
            <div className="space-y-2">
              <Link 
                href="/vendors/food/tiffin/plans"
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 transition-all"
              >
                <span>Setup Subscription Tiers</span>
                <span className="text-[#3D3F96]">→</span>
              </Link>
              <Link 
                href="/vendors/food/tiffin/menu"
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 transition-all"
              >
                <span>Manage Weekly Meal Plan</span>
                <span className="text-[#3D3F96]">→</span>
              </Link>
              <Link 
                href="/vendors/food/tiffin/requests"
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 transition-all"
              >
                <span>View Skip & Pause Requests</span>
                <span className="text-rose-600 font-extrabold bg-rose-50 px-2 py-0.5 rounded text-[10px]">2 New</span>
              </Link>
            </div>
          </div>

          {/* Recent Signups */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-tight pb-2 border-b border-slate-100">
              Recent Signups
            </h3>
            <div className="space-y-3.5">
              {recentSubscribers.map((sub) => (
                <div key={sub.name} className="flex justify-between items-center text-xs font-semibold">
                  <div>
                    <p className="font-bold text-slate-800">{sub.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{sub.plan}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{sub.value}</p>
                    <p className="text-[9px] text-emerald-600 font-extrabold uppercase mt-0.5">{sub.payment}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

// Icons

function UsersIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0110.089 21c-2.33 0-4.587-.426-6.621-1.203V19.13c0-2.016 1.502-3.613 3.48-3.816a11.318 11.318 0 017.062 0c1.978.203 3.48 1.8 3.48 3.816v.002zM15 4.5a3 3 0 11-6 0 3 3 0 016 0zM19.125 7.5a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  );
}

function DeliveryIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.12-1.243l1.105-9.4A1.125 1.125 0 014.473 7.5h11.22c.518 0 .961.35 1.077.854l1.245 5.42a1.125 1.125 0 01.32.73V18h-.375a1.5 1.5 0 01-3 0M15 18.75a1.5 1.5 0 00-3 0m3 0h3.75a1.125 1.125 0 001.12-1.243l-1.104-9.4a1.125 1.125 0 00-1.12-1.007H15V18" />
    </svg>
  );
}

function RevenueIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.265.265c.3.3.732.366 1.078.263l1.25-.375c.3-.09.6-.09.9 0l1.25.375c.346.103.778.037 1.078-.263l.265-.265m-9-3.73l.265.265c.3.3.732.366 1.078.263l1.25-.375c.3-.09.6-.09.9 0l1.25.375c.346.103.778.037 1.078-.263l.265-.265m-9-3.73l.265.265c.3.3.732.366 1.078.263l1.25-.375c.3-.09.6-.09.9 0l1.25.375c.346.103.778.037 1.078-.263l.265-.265" />
    </svg>
  );
}

function PlansIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.8.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 0A49.79 49.79 0 0112 3.75c.612.01 1.221.05 1.826.118" />
    </svg>
  );
}