"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  Zap,
  Truck,
  CheckCircle2,
  Wallet,
  RotateCcw,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  Clock,
  IndianRupee
} from "lucide-react";
import PharmacyAPI from "../../../services/PharmacyVendorAPI"; // Adjust relative path as needed

export default function PharmacyDashboard() {
  const [stats, setStats] = useState({
    pendingRequests: 0,
    priorityRequests: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalEarnings: 0,
    walletBalance: 0,
    pendingReturns: 0
  });

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Tooltip tracking states for custom SVG / CSS charts
  const [hoveredBar, setHoveredBar] = useState(null);
  const [hoveredLinePoint, setHoveredLinePoint] = useState(null);
  const [hoveredSlice, setHoveredSlice] = useState(null);

  const fetchStats = async (isManual = false) => {
    try {
      if (isManual) setIsRefreshing(true);
      else setLoading(true);
      setError(null);

      const response = await PharmacyAPI.getPharmacyDashboardStats();
      if (response && response.success) {
        setStats(response.data || {});
      } else {
        setError("Failed to retrieve live stats from the server.");
      }
    } catch (err) {
      console.error("Dashboard stats error:", err);
      setError(err?.response?.data?.message || err.message || "Unable to connect to pharmacy servers.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Operational metrics config
  const operationalCards = [
    {
      title: "Pending Orders",
      value: stats.pendingRequests,
      subtext: stats.pendingRequests > 0 ? "Requires packaging" : "All packed",
      icon: Package,
      alert: stats.pendingRequests > 0,
      alertText: `${stats.pendingRequests} New`,
      btnText: "Pack Orders →",
      link: "/vendors/pharmacy/dashboard/manageorders?status=pending",
      color: "from-amber-500/10 to-amber-50 text-amber-600 border-amber-200/60",
      btnColor: "bg-amber-600 hover:bg-amber-700"
    },
    {
      title: "1-Hour Express Orders",
      value: stats.priorityRequests,
      subtext: stats.priorityRequests > 0 ? "Dispatch immediately" : "No urgent queue",
      icon: Zap,
      alert: stats.priorityRequests > 0,
      alertText: "Rapid Dispatch",
      btnText: "View Express Queue →",
      link: "/vendors/pharmacy/dashboard/manageorders?priority=true",
      color: "from-rose-500/10 to-rose-50 text-rose-600 border-rose-200/60",
      btnColor: "bg-rose-600 hover:bg-rose-700 animate-pulse"
    },
    {
      title: "Active In-Transit",
      value: stats.activeOrders,
      subtext: "Dispatched / With courier",
      icon: Truck,
      alert: false,
      alertText: "Out For Delivery",
      btnText: "Track Deliveries →",
      link: "/vendors/pharmacy/dashboard/manageorders?status=active",
      color: "from-blue-500/10 to-blue-50 text-[#3D3F96] border-blue-200/60",
      btnColor: "bg-[#3D3F96] hover:bg-[#2F3175]"
    },
    {
      title: "Completed Orders",
      value: stats.completedOrders,
      subtext: "Delivered successfully",
      icon: CheckCircle2,
      alert: false,
      alertText: "100% Fulfilled",
      btnText: "View History →",
      link: "/vendors/pharmacy/dashboard/manageorders?status=completed",
      color: "from-emerald-500/10 to-emerald-50 text-emerald-600 border-emerald-200/60",
      btnColor: "bg-emerald-600 hover:bg-emerald-700"
    }
  ];

  // Visual Chart Data
  const weeklyOrderVolume = [
    { day: "Mon", val: "45%", count: 28 },
    { day: "Tue", val: "68%", count: 42 },
    { day: "Wed", val: "85%", count: 54 },
    { day: "Thu", val: "60%", count: 36 },
    { day: "Fri", val: "95%", count: 62, highlight: true },
    { day: "Sat", val: "72%", count: 48 },
    { day: "Sun", val: "35%", count: 20 }
  ];

  const customLinePoints = [
    { month: "Jan", orders: 120, x: 20, y: 150 },
    { month: "Feb", orders: 165, x: 110, y: 125 },
    { month: "Mar", orders: 240, x: 200, y: 80 },
    { month: "Apr", orders: 210, x: 290, y: 95 },
    { month: "May", orders: 310, x: 380, y: 45 },
    { month: "Jun", orders: 365, x: 470, y: 20 }
  ];

  const customPieData = [
    { name: "Diabetes & Insulin", val: "48%", desc: "Cold chain & chronic care medications" },
    { name: "General Antibiotics", val: "24%", desc: "Prescription antibiotics & anti-infectives" },
    { name: "Vitamins & Calcium", val: "18%", desc: "Nutritional supplements & daily OTC" },
    { name: "Rapid Express Items", val: "10%", desc: "Emergency 1-hour fast dispatch" }
  ];

  const pieColors = ["bg-[#3D3F96]", "bg-indigo-500", "bg-emerald-500", "bg-amber-500"];

  return (
    <div className="space-y-8 bg-slate-50/50 min-h-screen pb-12 select-none">
      
      {/* 1. Welcoming Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#3D3F96] via-[#484cb0] to-[#5a5dbd] rounded-[2rem] p-6 sm:p-8 md:p-10 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/10 backdrop-blur-md border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Live Pharmacy Operations Suite
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mt-3">
              Chemist Dispatch Console
            </h1>
            <p className="text-xs sm:text-sm font-medium text-indigo-100/90 mt-1 max-w-xl">
              Monitor incoming prescription orders, prioritize 1-hour express requests, track delivery transit, and manage chemist payouts.
            </p>
          </div>

          {/* Quick Refresh CTA */}
          <button
            onClick={() => fetchStats(true)}
            disabled={isRefreshing || loading}
            className="self-start md:self-auto inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 active:scale-95 border border-white/20 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all backdrop-blur-sm cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            <span>{isRefreshing ? "Syncing..." : "Sync Live Stats"}</span>
          </button>
        </div>

        {/* Ambient background blur */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Urgent Attention Banner (If Rapid Requests > 0) */}
      {stats.priorityRequests > 0 && (
        <div className="bg-gradient-to-r from-rose-500 to-red-600 rounded-2xl p-4 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-rose-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Zap size={20} className="fill-white" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-rose-100">
                Action Required • Rapid 1-Hour Dispatch
              </p>
              <h4 className="text-sm sm:text-base font-black">
                You have {stats.priorityRequests} priority rapid order(s) waiting for immediate packaging!
              </h4>
            </div>
          </div>
          <Link
            href="/vendors/pharmacy/dashboard/manageorders"
            className="bg-white text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shrink-0"
          >
            Dispatch Now →
          </Link>
        </div>
      )}

      {/* 3. Primary Operations Metrics (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {operationalCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${card.color} border`}>
                    <Icon size={22} />
                  </div>
                  {card.alert ? (
                    <span className="text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full animate-bounce">
                      {card.alertText}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                      {card.alertText}
                    </span>
                  )}
                </div>

                <div className="mt-5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-800">
                      {loading ? "..." : card.value}
                    </span>
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mt-1">
                    {card.title}
                  </h3>
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                    {card.subtext}
                  </p>
                </div>
              </div>

              <Link
                href={card.link}
                className={`w-full text-center py-2.5 rounded-xl text-white text-[11px] font-black uppercase tracking-wider mt-6 transition-all active:scale-[0.98] ${card.btnColor}`}
              >
                {card.btnText}
              </Link>
            </div>
          );
        })}
      </div>

      {/* 4. Financial & Returns Action Center */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Earnings Card */}
        <div className="bg-gradient-to-br from-indigo-900 to-[#3D3F96] text-white rounded-3xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-200">
                Delivered Orders Revenue
              </span>
              <div className="p-2 bg-white/10 rounded-xl">
                <TrendingUp size={18} className="text-emerald-400" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black tracking-tight flex items-center">
                ₹{loading ? "..." : (stats.totalEarnings || 0).toLocaleString("en-IN")}
              </span>
              <p className="text-[11px] font-medium text-indigo-200 mt-1">
                Net lifetime sales across all completed medicine deliveries
              </p>
            </div>
          </div>
          <Link
            href="/provider/pharmacy/settlements"
            className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-200 hover:text-white transition-colors"
          >
            <span>View Payout Settlements</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Live Wallet Balance */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Available Wallet Balance
              </span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Wallet size={18} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-slate-800 flex items-center">
                ₹{loading ? "..." : (stats.walletBalance || 0).toLocaleString("en-IN")}
              </span>
              <p className="text-[11px] font-medium text-slate-500 mt-1">
                Active withdrawable balance ready for bank transfer
              </p>
            </div>
          </div>
          <Link
            href="/provider/pharmacy/wallet"
            className="mt-6 w-full text-center py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black uppercase tracking-wider transition-all"
          >
            Request Payout / Wallet →
          </Link>
        </div>

        {/* Pending Customer Returns Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Return & Replacement
              </span>
              <div className={`p-2 rounded-xl ${stats.pendingReturns > 0 ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-500"}`}>
                <RotateCcw size={18} />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black text-slate-800">
                  {loading ? "..." : stats.pendingReturns}
                </span>
                {stats.pendingReturns > 0 && (
                  <span className="text-[10px] font-black uppercase text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                    Action Needed
                  </span>
                )}
              </div>
              <p className="text-[11px] font-medium text-slate-500 mt-1">
                {stats.pendingReturns > 0
                  ? "Customer replacement requests awaiting chemist inspection"
                  : "Zero pending return requests"}
              </p>
            </div>
          </div>
          <Link
            href="/provider/pharmacy/returns"
            className={`mt-6 w-full text-center py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
              stats.pendingReturns > 0
                ? "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            Inspect Returns ({stats.pendingReturns}) →
          </Link>
        </div>

      </div>

      {/* 5. Custom Interactive SVG Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Order Fulfillment Trends Line Chart */}
        <div className="lg:col-span-7 bg-white rounded-[2rem] border border-gray-100 p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-black text-gray-800">Order Dispatch Trends</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Monthly dispatch volume (Hover point markers for detailed counts).
              </p>
            </div>
          </div>

          <div className="relative h-64 w-full pt-4">
            {/* Custom Interactive Floating Tooltip (Pure White Text) */}
            {hoveredLinePoint !== null && (
              <div
                className="absolute bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-xl z-30 transition-all duration-200 pointer-events-none"
                style={{
                  left: `${customLinePoints[hoveredLinePoint].x - 60}px`,
                  top: `${customLinePoints[hoveredLinePoint].y - 65}px`
                }}
              >
                <p className="text-[10px] font-extrabold text-white uppercase tracking-wider">
                  {customLinePoints[hoveredLinePoint].month} Dispatch
                </p>
                <p className="text-xs font-black text-white mt-1">
                  Orders: {customLinePoints[hoveredLinePoint].orders} Units
                </p>
              </div>
            )}

            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              <line x1="0" y1="50" x2="500" y2="50" stroke="#F8FAFC" strokeWidth="1" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="#F8FAFC" strokeWidth="1" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="#F8FAFC" strokeWidth="1" />

              <path
                d="M 20,150 Q 110,125 200,80 T 380,45 T 470,20 L 470,200 L 20,200 Z"
                fill="url(#gradPharmacy)"
                opacity="0.15"
              />
              <path
                d="M 20,150 Q 110,125 200,80 T 380,45 T 470,20"
                fill="none"
                stroke="#3D3F96"
                strokeWidth="4"
                strokeLinecap="round"
              />

              <defs>
                <linearGradient id="gradPharmacy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3D3F96" />
                  <stop offset="100%" stopColor="#3D3F96" stopOpacity="0" />
                </linearGradient>
              </defs>

              {customLinePoints.map((pt, idx) => (
                <circle
                  key={idx}
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredLinePoint === idx ? "8" : "5"}
                  fill="#3D3F96"
                  stroke="#FFF"
                  strokeWidth="3"
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredLinePoint(idx)}
                  onMouseLeave={() => setHoveredLinePoint(null)}
                />
              ))}
            </svg>

            <div className="flex justify-between text-[11px] font-bold text-gray-400 mt-2 px-4">
              {customLinePoints.map((pt, i) => (
                <span key={i}>{pt.month}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Medicine Inventory Category Share (Pie/Donut) */}
        <div className="lg:col-span-5 bg-white rounded-[2rem] border border-gray-100 p-6 md:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-black text-gray-800">Order Category Share</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Breakdown by therapy and priority level (Hover for details).
            </p>
          </div>

          <div className="relative h-44 w-full flex items-center justify-center my-4">
            <svg className="w-36 h-36 transform -rotate-90">
              <circle cx="72" cy="72" r="54" fill="transparent" stroke="#F1F5F9" strokeWidth="14" />
              <circle cx="72" cy="72" r="54" fill="transparent" stroke="#3D3F96" strokeWidth="14" strokeDasharray="339.29" strokeDashoffset="140" />
              <circle cx="72" cy="72" r="54" fill="transparent" stroke="#6366F1" strokeWidth="14" strokeDasharray="339.29" strokeDashoffset="240" />
              <circle cx="72" cy="72" r="54" fill="transparent" stroke="#10B981" strokeWidth="14" strokeDasharray="339.29" strokeDashoffset="290" />
            </svg>
            <div className="absolute text-center">
              <span className="text-[10px] text-gray-400 uppercase font-black block">Top Demand</span>
              <span className="text-xs font-black text-[#3D3F96] block mt-0.5">Insulin Care</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 relative">
            {customPieData.map((item, index) => (
              <div
                key={index}
                onMouseEnter={() => setHoveredSlice(index)}
                onMouseLeave={() => setHoveredSlice(null)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 cursor-help transition-all hover:bg-indigo-50/50"
              >
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${pieColors[index]}`}></span>
                <span className="text-[10px] font-black text-gray-600 truncate">
                  {item.name} ({item.val})
                </span>

                {hoveredSlice === index && (
                  <div className="absolute left-0 right-0 -top-24 bg-slate-900 border border-slate-800 p-3 rounded-2xl shadow-xl z-30 pointer-events-none">
                    <h5 className="text-[10px] font-extrabold text-white uppercase tracking-wider">
                      {item.name} - {item.val}
                    </h5>
                    <p className="text-[11px] text-white/90 font-medium mt-1">{item.desc}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Order Volume Bar Chart */}
        <div className="lg:col-span-12 bg-white rounded-[2rem] border border-gray-100 p-6 md:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-black text-gray-800">Weekly Fulfillment Load</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Daily package dispatch volumes (Hover on bars to inspect unit counts).
              </p>
            </div>
          </div>

          <div className="relative flex items-end justify-between h-48 w-full gap-2 px-2 border-b border-gray-100 pb-1 pt-4">
            {weeklyOrderVolume.map((item, idx) => (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center relative group"
                onMouseEnter={() => setHoveredBar(idx)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {hoveredBar === idx && (
                  <div className="absolute -top-14 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl shadow-xl z-20 whitespace-nowrap text-center pointer-events-none">
                    <span className="text-[9px] font-black text-white/60 uppercase block tracking-widest">
                      {item.day} Dispatch
                    </span>
                    <span className="text-xs font-black text-white mt-0.5 block">
                      {item.count} Orders Packed
                    </span>
                  </div>
                )}

                <div className="w-full max-w-[28px] relative rounded-t-lg overflow-hidden flex flex-col justify-end h-36 bg-slate-50 cursor-pointer">
                  <div
                    style={{ height: item.val }}
                    className={`w-full rounded-t-lg transition-all duration-500 origin-bottom ${
                      item.highlight ? "bg-rose-500" : "bg-[#3D3F96]"
                    }`}
                  ></div>
                </div>
                <span className="text-[11px] font-bold text-gray-400 mt-3">{item.day}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}