"use client";

import React, { useState, useEffect } from 'react';
import { 
  FaChartLine, 
  FaWallet, 
  FaInfoCircle, 
  FaCheckCircle, 
  FaTimes,
  FaClock,
  FaUserInjured
} from 'react-icons/fa';
import {
  AreaChart, Area,
  BarChart, Bar,
  Cell,
  PieChart, Pie,
  XAxis, YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const PIE_COLORS = ['#10B981', '#EF4444']; // Net Earnings vs Admin Commission

export default function ClinicRevenueMock() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [payoutTab, setPayoutTab] = useState('analytics'); // 'analytics' or 'payout'

  // --- MOCK REVENUE DATA ---
  const [revenueData] = useState({
    totalRevenue: 38240,
    monthlyRevenue: 12500,
    weeklyRevenue: 4200,
    dailyRevenue: 950,
    ordersCount: 42,
    totalNetEarning: 30592, // ~80% Net
    totalAdminShare: 7648,  // ~20% Admin
    currentCutoff: 20,
    revenueByDate: { 
      "2026-07-17": 500, "2026-07-18": 800, "2026-07-19": 650, 
      "2026-07-20": 1100, "2026-07-21": 950, "2026-07-22": 1300, "2026-07-23": 950 
    },
    netEarningByDate: { 
      "2026-07-17": 400, "2026-07-18": 640, "2026-07-19": 520, 
      "2026-07-20": 880, "2026-07-21": 760, "2026-07-22": 1040, "2026-07-23": 760 
    },
    monthlyRevenueData: { "Jan 2026": 4500, "Feb 2026": 5200, "Mar 2026": 6100, "Apr 2026": 5800, "May 2026": 7200, "Jun 2026": 9440 },
    monthlyNetData: { "Jan 2026": 3600, "Feb 2026": 4160, "Mar 2026": 4880, "Apr 2026": 4640, "May 2026": 5760, "Jun 2026": 7552 },
    monthlyAdminData: { "Jan 2026": 900, "Feb 2026": 1040, "Mar 2026": 1220, "Apr 2026": 1160, "May 2026": 1440, "Jun 2026": 1888 },
    recentOrders: [
      { orderId: "APPT-90412", displayDate: "7/23/2026", displayTime: "10:30 AM", doctorName: "Dr. Alok Sharma", customerName: "Nitish kumar", status: "completed", gross: 1500, admin: 300, net: 1200 },
      { orderId: "APPT-90415", displayDate: "7/22/2026", displayTime: "02:15 PM", doctorName: "Dr. Alok Sharma", customerName: "Aman Preet", status: "completed", gross: 1200, admin: 240, net: 960 },
      { orderId: "APPT-90422", displayDate: "7/21/2026", displayTime: "11:00 AM", doctorName: "Dr. Ritu Verma", customerName: "Siddharth Jain", status: "completed", gross: 2000, admin: 400, net: 1600 },
      { orderId: "APPT-90430", displayDate: "7/20/2026", displayTime: "04:45 PM", doctorName: "Dr. Ritu Verma", customerName: "Priyanka Roy", status: "pending", gross: 800, admin: 160, net: 640 },
      { orderId: "APPT-90435", displayDate: "7/19/2026", displayTime: "12:30 PM", doctorName: "Dr. Alok Sharma", customerName: "Karan Johar", status: "cancelled", gross: 1500, admin: 300, net: 1200 }
    ]
  });

  // --- MOCK INTERACTIVE PAYOUT STATES ---
  const [eligibleOrders, setEligibleOrders] = useState([
    { id: "1", orderId: "APPT-90412", date: "2026-07-15T10:30:00", status: "completed", amount: 1500, adminEarnings: 300, payableAmount: 1200, cutoffPercentage: 20 },
    { id: "2", orderId: "APPT-90415", date: "2026-07-15T14:15:00", status: "completed", amount: 1200, adminEarnings: 240, payableAmount: 960, cutoffPercentage: 20 },
    { id: "3", orderId: "APPT-90422", date: "2026-07-16T11:00:00", status: "completed", amount: 2000, adminEarnings: 400, payableAmount: 1600, cutoffPercentage: 20 },
    { id: "4", orderId: "APPT-90430", date: "2026-07-16T16:45:00", status: "completed", amount: 800, adminEarnings: 160, payableAmount: 640, cutoffPercentage: 20 }
  ]);

  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [payoutStats, setPayoutStats] = useState({ totalAmount: 4400, count: 4 }); 
  const [payoutSummary, setPayoutSummary] = useState({
    pendingRequestAmount: 4800,
    totalPaidAmount: 15400,
    paidBreakdown: { today: 1200, week: 4800, month: 12400, year: 15400 }
  });

  const [payoutHistory, setPayoutHistory] = useState([
    { createdAt: "2026-07-20T12:00:00", totalOrders: 4, totalAmount: 4800, status: "pending", transactionId: null, adminNote: null },
    { createdAt: "2026-07-10T15:30:00", totalOrders: 6, totalAmount: 8200, status: "approved", transactionId: "TXN-98410294", adminNote: "Settled directly to registered Bank Account" },
    { createdAt: "2026-06-25T11:20:00", totalOrders: 5, totalAmount: 7200, status: "approved", transactionId: "TXN-87421102", adminNote: "Settle with manual adjustment" }
  ]);

  // Premium Page Mounting Experience
  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 550); // Elegant simulated loading screen
    return () => clearTimeout(timer);
  }, []);

  const getStatusBadge = (status) => {
    const s = String(status).toLowerCase();
    if (s === 'completed' || s === 'visited' || s === 'visited') {
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">Visited</span>;
    }
    if (s === 'confirmed' || s === 'approved') {
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-sky-100 text-sky-800 border border-sky-200">Confirmed</span>;
    }
    if (s === 'pending') {
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">Pending</span>;
    }
    if (s === 'cancelled') {
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">Cancelled</span>;
    }
    return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-slate-100 text-slate-800">Status: {status}</span>;
  };

  const getPayoutStatusBadge = (status) => {
    if(status === 'approved') return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">Paid</span>;
    if(status === 'rejected') return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">Rejected</span>;
    return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">Pending</span>;
  };

  // --- INTERACTIVE SIMULATION LOGIC ---
  const submitPayoutRequest = () => {
    if(selectedOrderIds.length === 0) return;
    
    setPayoutLoading(true);
    
    setTimeout(() => {
      const selectedOrders = eligibleOrders.filter(o => selectedOrderIds.includes(o.id));
      const requestTotal = selectedOrders.reduce((sum, item) => sum + item.payableAmount, 0);

      // 1. Update lists dynamically
      const remainingOrders = eligibleOrders.filter(o => !selectedOrderIds.includes(o.id));
      setEligibleOrders(remainingOrders);

      // 2. Append mock pending request to transaction history
      const newRequest = {
        createdAt: new Date().toISOString(),
        totalOrders: selectedOrders.length,
        totalAmount: requestTotal,
        status: "pending",
        transactionId: null,
        adminNote: null
      };
      setPayoutHistory([newRequest, ...payoutHistory]);

      // 3. Update Payout overview values
      const newStatsAmount = remainingOrders.reduce((sum, item) => sum + item.payableAmount, 0);
      setPayoutStats({
        totalAmount: newStatsAmount,
        count: remainingOrders.length
      });

      setPayoutSummary(prev => ({
        ...prev,
        pendingRequestAmount: prev.pendingRequestAmount + requestTotal
      }));

      setSelectedOrderIds([]);
      setPayoutLoading(false);
      setShowSuccessModal(true); // Popup confirmation
    }, 800); // Quick elegant loading spinner delay
  };

  const handleSelectAll = (e) => {
    if(e.target.checked) setSelectedOrderIds(eligibleOrders.map(o => o.id));
    else setSelectedOrderIds([]);
  };

  const handleSelectOrder = (id) => {
    if(selectedOrderIds.includes(id)) setSelectedOrderIds(selectedOrderIds.filter(item => item !== id));
    else setSelectedOrderIds([...selectedOrderIds, id]);
  };

  const getSelectedTotal = () => {
    return eligibleOrders
      .filter(o => selectedOrderIds.includes(o.id))
      .reduce((sum, current) => sum + current.payableAmount, 0);
  };

  // --- CHART FORMATTING ---
  const sortedMonthLabels = Object.keys(revenueData.monthlyRevenueData).sort((a,b)=>new Date(a)-new Date(b));
  const lineChartSortedDates = Object.keys(revenueData.revenueByDate).sort();

  const barData = sortedMonthLabels.map(m => ({
    name: m,
    "Net Earning": revenueData.monthlyNetData[m] || 0,
    "Admin Share": revenueData.monthlyAdminData[m] || 0
  }));

  const lineData = lineChartSortedDates.map(d => ({
    name: d,
    "Gross": revenueData.revenueByDate[d] || 0,
    "Net": revenueData.netEarningByDate[d] || 0
  }));

  const pieData = [
    { name: 'Net Earning', value: revenueData.totalNetEarning || 0 },
    { name: 'Admin Share', value: revenueData.totalAdminShare || 0 }
  ];

  if (!mounted || loading) {
    return (
      <div className="flex justify-center items-center h-screen select-none">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3D3F96]"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 select-none animate-fadeIn">
      
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>

      {/* Header Container */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-800">Clinic Revenue & Payouts</h2>
          <p className="text-xs text-gray-400 mt-1">Manage, analyze, and request payouts for completed consultation earnings (Prototype Preview).</p>
        </div>
        
        {/* Toggle Mode button group */}
        <div className="bg-gray-100 p-1.5 rounded-2xl flex items-center gap-1 border border-gray-200/50 self-start sm:self-auto">
          <button 
            onClick={() => setPayoutTab('analytics')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              payoutTab === 'analytics' 
                ? 'bg-[#3D3F96] text-white shadow-lg shadow-indigo-900/10' 
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <FaChartLine /> Analytics
          </button>
          <button 
            onClick={() => setPayoutTab('payout')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              payoutTab === 'payout' 
                ? 'bg-[#3D3F96] text-white shadow-lg shadow-indigo-900/10' 
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <FaWallet /> Payouts
          </button>
        </div>
      </div>

      {/* === VIEW 1: ANALYTICS TAB === */}
      {payoutTab === 'analytics' ? (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Metrics cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Revenue', key: 'totalRevenue', desc: `From ${revenueData.ordersCount} sessions`, grad: 'from-[#3D3F96] to-[#5154b8]' },
              { label: 'Monthly Revenue', key: 'monthlyRevenue', desc: 'Current month bookings', grad: 'from-[#10B981] to-[#059669]' },
              { label: 'Weekly Revenue', key: 'weeklyRevenue', desc: 'Past 7 days volume', grad: 'from-sky-500 to-sky-600' },
              { label: 'Daily Revenue', key: 'dailyRevenue', desc: "Today's consultations", grad: 'from-amber-500 to-amber-600' }
            ].map((card, i) => (
              <div 
                key={i} 
                className={`bg-gradient-to-br ${card.grad} text-white p-6 rounded-3xl shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between`}
              >
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-white/70 block">{card.label}</span>
                  <h3 className="text-2xl font-black mt-2">₹{(revenueData[card.key] || 0).toFixed(2)}</h3>
                </div>
                <span className="text-[10px] font-bold text-white/80 block mt-4 bg-white/10 px-2 py-1 rounded-lg self-start">
                  {card.desc}
                </span>
              </div>
            ))}
          </div>

          {/* Settlement numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Gross Revenue', val: revenueData.totalRevenue, color: 'border-[#3D3F96] text-[#3D3F96]' },
              { label: 'Net Earnings', val: revenueData.totalNetEarning, color: 'border-emerald-500 text-emerald-600' },
              { label: 'Admin Commission', val: revenueData.totalAdminShare, color: 'border-rose-500 text-rose-500' },
              { label: 'Current Plan Share', val: `${revenueData.currentCutoff}%`, color: 'border-slate-300 text-slate-700', isPerc: true }
            ].map((metric, idx) => (
              <div key={idx} className={`bg-white border-l-4 ${metric.color} p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300`}>
                <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider block">{metric.label}</span>
                <h4 className="text-xl font-black mt-1">
                  {metric.isPerc ? metric.val : `₹${(metric.val || 0).toFixed(2)}`}
                </h4>
              </div>
            ))}
          </div>

          {/* Chart visualizers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            <div className="bg-white rounded-[2rem] border border-gray-100 p-6 md:p-8 shadow-sm">
              <h3 className="text-lg font-black text-gray-800 mb-6">Settlement Distributions</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} barSize={16}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                    {/* Hover text white color override */}
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#1E293B", borderRadius: "12px", border: "none" }}
                      labelStyle={{ color: "#FFF", fontSize: "11px", fontWeight: "bold" }}
                      itemStyle={{ color: "#FFF", fontSize: "11px" }}
                    />
                    <Bar dataKey="Net Earning" fill="#10B981" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="Admin Share" fill="#EF4444" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 p-6 md:p-8 shadow-sm flex flex-col justify-between">
              <h3 className="text-lg font-black text-gray-800 mb-4">Cumulative Split Share</h3>
              <div className="relative h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={6} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#1E293B", borderRadius: "12px", border: "none" }}
                      itemStyle={{ color: "#FFF", fontSize: "11px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-center">
                  <span className="text-[9px] uppercase font-black text-gray-400 block tracking-widest">Share split</span>
                  <span className="text-base font-black text-gray-800 block mt-0.5">₹{(revenueData.totalRevenue || 0).toFixed(0)}</span>
                </div>
              </div>
              
              <div className="flex gap-4 justify-center mt-4 text-xs font-bold text-gray-500">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Net Earnings</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500"></span> Admin Share</span>
              </div>
            </div>

          </div>

          <div className="bg-white rounded-[2rem] border border-gray-100 p-6 md:p-8 shadow-sm">
            <h3 className="text-lg font-black text-gray-800 mb-6">Gross vs Net Analytics (Weekly Trend)</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3D3F96" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#3D3F96" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1E293B", borderRadius: "12px", border: "none" }}
                    labelStyle={{ color: "#FFF", fontSize: "11px", fontWeight: "bold" }}
                    itemStyle={{ color: "#FFF", fontSize: "11px" }}
                  />
                  <Area type="monotone" dataKey="Gross" stroke="#3D3F96" strokeWidth={3} fill="url(#colorGross)" />
                  <Area type="monotone" dataKey="Net" stroke="#10B981" strokeWidth={3} fill="url(#colorNet)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent sessions log */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-6 md:p-8 shadow-sm">
            <h3 className="text-lg font-black text-gray-800 mb-6">Recent Clinic Consultations</h3>
            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full text-left border-collapse align-middle">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-100 text-[11px] font-black uppercase text-gray-400 tracking-wider">
                    <th className="p-4">Appt ID</th>
                    <th className="p-4">Date/Time</th>
                    <th className="p-4">Doctor</th>
                    <th className="p-4">Patient</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Gross Total</th>
                    <th className="p-4 text-right">Admin Fee</th>
                    <th className="p-4 text-right">Net Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {revenueData.recentOrders.map((o, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-all duration-200">
                      <td className="p-4 font-black text-[#3D3F96]">{o.orderId}</td>
                      <td className="p-4">
                        <span className="font-bold text-gray-700 block">{o.displayDate}</span>
                        <span className="text-[10px] text-gray-400 font-bold block">{o.displayTime}</span>
                      </td>
                      <td className="p-4 font-bold text-gray-700">{o.doctorName}</td>
                      <td className="p-4 font-semibold text-gray-600">{o.customerName}</td>
                      <td className="p-4">{getStatusBadge(o.status)}</td>
                      <td className="p-4 text-right font-black text-gray-800">₹{o.gross.toFixed(2)}</td>
                      <td className="p-4 text-right font-bold text-rose-500">-₹{o.admin.toFixed(2)}</td>
                      <td className="p-4 text-right font-black text-emerald-600">₹{o.net.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : (
        // === VIEW 2: PAYOUTS TAB ===
        <div className="space-y-8 animate-fadeIn">
          
          <div className="bg-sky-50/60 border border-sky-100 rounded-2xl p-5 flex items-start gap-3.5 text-sky-800">
            <FaInfoCircle size={20} className="shrink-0 mt-0.5 text-sky-600" />
            <div>
              <h5 className="font-black text-sm">Payout Policy Rules</h5>
              <p className="text-xs font-semibold text-sky-700/90 mt-1">Consultation payments are secure and cleared for settlement **7 days after successful completed validation**.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white border-t-4 border-emerald-500 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
              <span className="text-[10px] uppercase font-black text-gray-400 block tracking-widest">Available for Withdrawal</span>
              <h3 className="text-3xl font-black text-emerald-600 mt-2">₹{payoutStats.totalAmount.toFixed(2)}</h3>
              <span className="inline-block mt-4 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                {payoutStats.count} Completed slots ready
              </span>
            </div>

            <div className="bg-white border-t-4 border-amber-500 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
              <span className="text-[10px] uppercase font-black text-gray-400 block tracking-widest">Pending Requests</span>
              <h3 className="text-3xl font-black text-amber-600 mt-2">₹{payoutSummary.pendingRequestAmount.toFixed(2)}</h3>
              <span className="text-xs font-semibold text-gray-400 block mt-4">Awaiting Admin Settlement</span>
            </div>

            <div className="bg-white border-t-4 border-[#3D3F96] p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
              <span className="text-[10px] uppercase font-black text-gray-400 block tracking-widest">Total Paid Out</span>
              <h3 className="text-3xl font-black text-[#3D3F96] mt-2">₹{payoutSummary.totalPaidAmount.toFixed(2)}</h3>
              <span className="text-xs font-semibold text-gray-400 block mt-4">Lifetime earnings settled</span>
            </div>

          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Paid Today', val: payoutSummary.paidBreakdown.today },
              { label: 'Paid This Week', val: payoutSummary.paidBreakdown.week },
              { label: 'Paid This Month', val: payoutSummary.paidBreakdown.month },
              { label: 'Paid This Year', val: payoutSummary.paidBreakdown.year },
            ].map((box, i) => (
              <div key={i} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center">
                <span className="text-[9px] uppercase font-black tracking-wider text-gray-400 block">{box.label}</span>
                <span className="text-base font-black text-gray-800 mt-1 block">₹{box.val.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-[2rem] border border-gray-100 p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h4 className="text-base font-black text-gray-800">Select Appointments for payout</h4>
              <p className="text-xs text-gray-400 mt-1">Multi-select completed, eligible slots below to package your payout request (Interactive Simulator).</p>
            </div>
            
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between gap-8 md:min-w-[320px]">
              <div>
                <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider block">Selected Amount</span>
                <span className="text-xl font-black text-emerald-600 block">₹{getSelectedTotal().toFixed(2)}</span>
              </div>
              <button 
                disabled={selectedOrderIds.length === 0 || payoutLoading} 
                onClick={submitPayoutRequest}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider transition-all disabled:opacity-40 shadow-lg shadow-emerald-500/10 shrink-0"
              >
                {payoutLoading ? <span className="animate-spin inline-block w-4 h-4 border-2 border-white rounded-full"></span> : 'Request payout'}
              </button>
            </div>
          </div>

          {/* ELIGIBLE ORDERS TABLE */}
          <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
            <div className="p-6 md:p-8 bg-slate-50/50 border-b border-gray-100 flex items-center justify-between">
              <h5 className="font-black text-gray-800 text-sm">Eligible Appointments ({eligibleOrders.length})</h5>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={eligibleOrders.length > 0 && selectedOrderIds.length === eligibleOrders.length}
                  onChange={handleSelectAll}
                  disabled={eligibleOrders.length === 0}
                  className="rounded border-gray-300 text-[#3D3F96] focus:ring-[#3D3F96] h-4.5 w-4.5 cursor-pointer"
                />
                <span className="text-xs font-black uppercase tracking-wider text-gray-500 cursor-pointer">Select All</span>
              </label>
            </div>

            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-left border-collapse align-middle">
                <thead className="bg-slate-50/80 sticky top-0 border-b border-gray-100 z-10">
                  <tr className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                    <th className="p-4 text-center w-12">#</th>
                    <th className="p-4">Appt ID</th>
                    <th className="p-4">Completed Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Gross Total</th>
                    <th className="p-4 text-right">Commission</th>
                    <th className="p-4 text-right">Net Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {eligibleOrders.length > 0 ? (
                    eligibleOrders.map((order) => (
                      <tr key={order.id} className={`hover:bg-slate-50/30 transition-all ${selectedOrderIds.includes(order.id) ? "bg-indigo-50/20" : ""}`}>
                        <td className="p-4 text-center">
                          <input 
                            type="checkbox" 
                            checked={selectedOrderIds.includes(order.id)}
                            onChange={() => handleSelectOrder(order.id)}
                            className="rounded border-gray-300 text-[#3D3F96] focus:ring-[#3D3F96] h-4 w-4 cursor-pointer"
                          />
                        </td>
                        <td className="p-4 font-black text-indigo-900">{order.orderId}</td>
                        <td className="p-4">
                          <span className="font-bold text-gray-700 block">{new Date(order.date).toLocaleDateString()}</span>
                          <span className="text-[9px] text-gray-400 font-bold block mt-0.5">{new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </td>
                        <td className="p-4">{getStatusBadge(order.status)}</td>
                        <td className="p-4 text-right font-black text-gray-800">₹{order.amount.toFixed(2)}</td>
                        <td className="p-4 text-right font-bold text-rose-500">
                          -₹{order.adminEarnings.toFixed(2)}
                          {order.cutoffPercentage && <span className="block text-[9px] text-gray-400 mt-0.5">({order.cutoffPercentage}%)</span>}
                        </td>
                        <td className="p-4 text-right font-black text-emerald-600">₹{order.payableAmount.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="p-12 text-center text-gray-400 font-bold">
                        <div className="mb-3"><FaCheckCircle className="text-emerald-500 text-3xl mx-auto" /></div>
                        <h5>No Eligible Consultations</h5>
                        <p className="text-xs font-semibold text-gray-400 mt-1">All settled! Complete consultations appear here 7 days after completion.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ledger History list */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-6 md:p-8 shadow-sm">
            <h3 className="text-lg font-black text-gray-800 mb-6">Request History Ledger</h3>
            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full text-left border-collapse align-middle">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-100 text-[10px] font-black uppercase text-gray-400 tracking-wider">
                    <th className="p-4">Request Date</th>
                    <th className="p-4">Consultations Included</th>
                    <th className="p-4 text-right">Total Amount</th>
                    <th className="p-4 text-center">Approval Status</th>
                    <th className="p-4">Admin Notes / TXN ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {payoutHistory.map((req, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-all duration-200">
                      <td className="p-4">
                        <span className="font-bold text-gray-700 block">{new Date(req.createdAt).toLocaleDateString()}</span>
                        <span className="text-[10px] text-gray-400 font-bold block">{new Date(req.createdAt).toLocaleTimeString()}</span>
                      </td>
                      <td className="p-4 font-bold text-slate-600">{req.totalOrders} sessions request</td>
                      <td className="p-4 text-right font-black text-gray-800">₹{req.totalAmount.toFixed(2)}</td>
                      <td className="p-4 text-center">{getPayoutStatusBadge(req.status)}</td>
                      <td className="p-4">
                        {req.status === 'approved' ? (
                          <div className="text-emerald-600 text-xs font-bold">
                            <strong>Paid via:</strong> {req.transactionId || 'Bank Ledger Transfer'}
                          </div>
                        ) : req.status === 'rejected' ? (
                          <span className="text-rose-500 text-xs font-bold">{req.adminNote || 'Rejected by Admin'}</span>
                        ) : (
                          <span className="text-slate-400 text-xs font-bold">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Success Modal Popup Simulator */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-[2rem] max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 p-8 relative animate-fadeIn">
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="absolute right-6 top-6 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-gray-400 hover:text-gray-600 transition-all"
            >
              <FaTimes />
            </button>
            
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 flex items-center justify-center text-emerald-600 text-3xl mx-auto mb-4 animate-bounce">
                <FaCheckCircle />
              </div>
              <h3 className="text-lg font-black text-gray-800">Payout Request Sent</h3>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                Your request has been filed and sent to the admin portal for authorization. <br/>Once processed, the status ledger will update to "Paid".
              </p>
            </div>

            <button 
              onClick={() => setShowSuccessModal(false)}
              className="w-full text-center py-3.5 rounded-2xl bg-[#3D3F96] hover:bg-[#2F3175] text-white text-xs font-black uppercase tracking-widest mt-6 transition-all"
            >
              Close Ledger
            </button>
          </div>
        </div>
      )}

    </div>
  );
}