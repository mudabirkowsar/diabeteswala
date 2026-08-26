"use client";

import React, { useState, useEffect } from 'react';
import FoodAPI from '../../../../services/FoodVendorAPI';


export default function DashboardPage() {
  const [isOnline, setIsOnline] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Fetch initial profile status on load if available, otherwise fallback to true
  useEffect(() => {
    // Optional: Query current kitchen status on mount
    const fetchCurrentStatus = async () => {
      try {
        // Query the master catalog as it returns current active states
        const response = await FoodAPI.getVendorMasterCatalog();
        if (response.success && response.data && response.data.length > 0) {
          // If profile/kitchen online state is returned, sync it here
        }
      } catch (err) {
        console.warn("Failed to fetch initial online status on load:", err);
      }
    };
    fetchCurrentStatus();
  }, []);

  const handleToggleOnline = async () => {
    setStatusLoading(true);
    setErrorMessage(null);
    try {
      const response = await FoodAPI.toggleVendorLiveStatus(!isOnline);
      if (response.success) {
        setIsOnline(response.isOnline);
        setSuccessMessage(response.message || `Kitchen status set to ${response.isOnline ? 'Online' : 'Offline'}`);
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err) {
      setErrorMessage(err?.message || 'Failed to modify live kitchen status.');
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      
      {/* Dashboard Header Block with Status Toggler */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Food Revenue & Payouts</h1>
          <p className="text-sm text-slate-500 mt-1">Overview of lifetime earnings, current plan status, and analytics.</p>
        </div>

        {/* Live Kitchen Status Switcher Card */}
        <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2.5 rounded-2xl shadow-sm self-start sm:self-center transition-all duration-150">
          <div className="flex items-center gap-2">
            <span className={`relative flex h-2 w-2 ${isOnline ? 'block' : 'hidden'}`}>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            {!isOnline && <span className="w-2 h-2 rounded-full bg-slate-300"></span>}
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {isOnline ? 'Online (Accepting Orders)' : 'Offline (Orders Paused)'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleToggleOnline}
            disabled={statusLoading}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isOnline ? 'bg-emerald-500' : 'bg-slate-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isOnline ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Action Notification Banners */}
      {successMessage && (
        <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-100 animate-fade-in shadow-sm">
          <div className="flex items-center">
            <span className="text-emerald-500 mr-2">✓</span>
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">{successMessage}</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-2xl bg-rose-50 p-4 border border-rose-100 animate-fade-in shadow-sm">
          <div className="flex items-center">
            <span className="text-rose-500 mr-2">⚠️</span>
            <p className="text-xs font-bold text-rose-800 uppercase tracking-wider">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Colored Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#3D3F96] to-[#5558BE] text-white p-6 rounded-2xl shadow-sm border border-[#3D3F96]/10">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-100">Total Revenue</p>
          <p className="text-2xl lg:text-3xl font-bold mt-2 truncate">₹1,98,00,50,637.78</p>
          <p className="text-xs text-indigo-200 mt-4">All-time accumulated earnings</p>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Monthly Revenue</p>
            <p className="text-2xl lg:text-3xl font-bold mt-2 text-slate-900">₹0.00</p>
          </div>
          <p className="text-xs text-slate-400 mt-4">Current month performance</p>
        </div>

        {/* Weekly Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-sky-600">Weekly Revenue</p>
            <p className="text-2xl lg:text-3xl font-bold mt-2 text-slate-900">₹0.00</p>
          </div>
          <p className="text-xs text-slate-400 mt-4">Past 7 days performance</p>
        </div>

        {/* Daily Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Daily Revenue</p>
            <p className="text-2xl lg:text-3xl font-bold mt-2 text-slate-900">₹0.00</p>
          </div>
          <p className="text-xs text-slate-400 mt-4">Today's dynamic updates</p>
        </div>
      </div>

      {/* Secondary Bordered Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border-l-4 border-l-[#3D3F96] border-y border-r border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-[#3D3F96]/80 uppercase">Gross Revenue</p>
          <p className="text-lg font-bold text-slate-800 mt-1">₹1,98,00,50,637.78</p>
        </div>

        <div className="bg-white p-5 rounded-xl border-l-4 border-l-emerald-500 border-y border-r border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-emerald-600 uppercase">Net Earnings</p>
          <p className="text-lg font-bold text-slate-800 mt-1">₹1,88,10,48,105.91</p>
        </div>

        <div className="bg-white p-5 rounded-xl border-l-4 border-l-rose-500 border-y border-r border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-rose-500 uppercase">Admin Commission</p>
          <p className="text-lg font-bold text-slate-800 mt-1">₹9,90,02,531.91</p>
        </div>

        <div className="bg-white p-5 rounded-xl border-l-4 border-l-slate-400 border-y border-r border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Current Plan</p>
          <p className="text-lg font-bold text-slate-800 mt-1">5% Comm. Rate</p>
        </div>
      </div>

      {/* Charts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Graph Card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
            <div>
              <h3 className="font-bold text-slate-800">Earnings Timeline</h3>
              <p className="text-xs text-slate-400">Comparison across active periods</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-500"></span>
                <span className="text-slate-600">Your Net Earning</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-rose-500"></span>
                <span className="text-slate-600">Admin Commission</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Graphic */}
          <div className="relative w-full h-[320px]">
            <svg viewBox="0 0 800 300" className="w-full h-full overflow-visible">
              <line x1="50" y1="50" x2="780" y2="50" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="50" y1="100" x2="780" y2="100" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="50" y1="150" x2="780" y2="150" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="50" y1="200" x2="780" y2="200" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="50" y1="250" x2="780" y2="250" stroke="#cbd5e1" strokeWidth="1.5" />

              <text x="40" y="55" textAnchor="end" className="text-[10px] fill-slate-400 font-medium">2B</text>
              <text x="40" y="105" textAnchor="end" className="text-[10px] fill-slate-400 font-medium">1.5B</text>
              <text x="40" y="155" textAnchor="end" className="text-[10px] fill-slate-400 font-medium">1B</text>
              <text x="40" y="205" textAnchor="end" className="text-[10px] fill-slate-400 font-medium">500M</text>
              <text x="40" y="255" textAnchor="end" className="text-[10px] fill-slate-400 font-medium">0</text>

              {['Aug 25', 'Sep 25', 'Oct 25', 'Nov 25', 'Dec 25', 'Jan 26', 'Feb 26', 'Mar 26', 'Apr 26', 'May 26', 'Jun 26', 'Jul 26'].map((month, idx) => {
                const x = 75 + idx * 58;
                return (
                  <text key={month} x={x} y="275" textAnchor="middle" className="text-[10px] fill-slate-400 font-medium tracking-tight">
                    {month}
                  </text>
                );
              })}

              {[...Array(10)].map((_, idx) => {
                const x = 75 + idx * 58;
                return (
                  <g key={idx}>
                    <rect x={x - 8} y="247" width="7" height="3" fill="#10b981" rx="1" />
                    <rect x={x} y="248.5" width="7" height="1.5" fill="#f43f5e" rx="1" />
                  </g>
                );
              })}

              <rect x={647} y="60" width="12" height="190" fill="#10b981" rx="2" />
              <rect x={661} y="235" width="12" height="15" fill="#f43f5e" rx="2" />

              <rect x={705} y="248" width="12" height="2" fill="#10b981" rx="1" />
              <rect x={719} y="249" width="12" height="1" fill="#f43f5e" rx="1" />
            </svg>
          </div>
        </div>

        {/* Right Distribution Donut */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800">Distribution Split</h3>
            <p className="text-xs text-slate-400">Net split vs admin system commission fee</p>
          </div>

          <div className="relative py-6 flex items-center justify-center">
            <svg viewBox="0 0 200 200" className="w-48 h-48 transform -rotate-90">
              <circle
                cx="100"
                cy="100"
                r="70"
                fill="transparent"
                stroke="#10b981"
                strokeWidth="32"
                strokeDasharray="440"
                strokeDashoffset="22"
              />
              <circle
                cx="100"
                cy="100"
                r="70"
                fill="transparent"
                stroke="#f43f5e"
                strokeWidth="32"
                strokeDasharray="440"
                strokeDashoffset="440"
                className="origin-center"
                style={{ transform: 'rotate(342deg)' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-xl font-bold text-slate-800">95%</span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Net Share</span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-slate-500">Your Share (95%)</span>
              </div>
              <span className="font-semibold text-slate-800">₹1,88,10,48,105.91</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="text-slate-500">Admin Cut (5%)</span>
              </div>
              <span className="font-semibold text-slate-800">₹9,90,02,531.91</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}