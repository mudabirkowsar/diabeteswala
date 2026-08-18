"use client";

import React, { useState } from "react";
import { 
  FaUserMd, 
  FaCalendarAlt, 
  FaBullseye, 
  FaTrophy, 
  FaClock, 
  FaRegHeart, 
  FaUserInjured 
} from "react-icons/fa";
import Link from "next/link";

export default function ClinicDashboardNoDeps() {
  // Tooltip tracking states for Custom CSS hover events
  const [hoveredBar, setHoveredBar] = useState(null);
  const [hoveredLinePoint, setHoveredLinePoint] = useState(null);
  const [hoveredSlice, setHoveredSlice] = useState(null);
  
  const statsData = [
    {
      title: "Total Doctors",
      value: "4",
      growth: "+1 this month",
      icon: FaUserMd,
      btnText: "View Doctors →",
      link: "/clinic/doctors",
      color: "from-indigo-50/80 to-blue-50/50 text-[#3D3F96]",
      btnColor: "bg-[#3D3F96] hover:bg-[#2F3175]"
    },
    {
      title: "Total Appointments",
      value: "3",
      growth: "+12% vs last week",
      icon: FaCalendarAlt,
      btnText: "View Appointments →",
      link: "/clinic/appointments",
      color: "from-purple-50/80 to-indigo-50/50 text-purple-600",
      btnColor: "bg-purple-600 hover:bg-purple-700"
    },
    {
      title: "Specialists",
      value: "6",
      growth: "Across 4 fields",
      icon: FaBullseye,
      btnText: "View Specialists →",
      link: "/clinic/specialists",
      color: "from-pink-50/80 to-rose-50/50 text-pink-600",
      btnColor: "bg-pink-600 hover:bg-pink-700"
    },
    {
      title: "Achievements",
      value: "2",
      growth: "Top Rated 2026",
      icon: FaTrophy,
      btnText: "View Achievements →",
      link: "/clinic/achievements",
      color: "from-amber-50/80 to-yellow-50/50 text-amber-600",
      btnColor: "bg-amber-600 hover:bg-amber-700"
    }
  ];

  const weeklyLoad = [
    { day: "Mon", val: "40%", count: 25 },
    { day: "Tue", val: "65%", count: 38 },
    { day: "Wed", val: "80%", count: 45 },
    { day: "Thu", val: "55%", count: 30 },
    { day: "Fri", val: "95%", count: 52, highlight: true },
    { day: "Sat", val: "70%", count: 40 },
    { day: "Sun", val: "30%", count: 15 }
  ];

  const customLinePoints = [
    { month: "Jan", consult: 40, x: 20, y: 160 },
    { month: "Feb", consult: 55, x: 110, y: 130 },
    { month: "Mar", consult: 85, x: 200, y: 80 },
    { month: "Apr", consult: 65, x: 290, y: 110 },
    { month: "May", consult: 110, x: 380, y: 50 },
    { month: "Jun", consult: 130, x: 470, y: 25 }
  ];

  const customPieData = [
    { name: "Diabetic Care", val: "45%", desc: "Focuses on insulin therapy & monitoring" },
    { name: "General Med", val: "25%", desc: "Primary health diagnoses & checkups" },
    { name: "Endocrinology", val: "20%", desc: "Hormonal evaluations & treatments" },
    { name: "Cardiology", val: "10%", desc: "Cardiovascular health analysis" }
  ];

  const pieColors = ["bg-[#3D3F96]", "bg-[#5C5EB2]", "bg-[#7F81CE]", "bg-[#A4A6EA]"];

  return (
    <div className="p-4 md:p-8 space-y-8 bg-slate-50/40 min-h-screen select-none">
      
      {/* 1. Welcoming Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#3D3F96] via-[#4F52C0] to-[#6366F1] rounded-[2rem] p-8 md:p-10 text-white shadow-xl">
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/10">
            Live Vendor Suite
          </span>
          <h1 className="text-3xl md:text-4xl font-black mt-4">Clinic Dashboard</h1>
          <p className="text-base font-semibold text-indigo-100/90 mt-1">Welcome back, Diabetic 11</p>
        </div>
      </div>

      {/* 2. Key Metrics & Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col justify-between hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
              <div>
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${stat.color}`}>
                    <Icon className="text-xl" />
                  </div>
                  <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">{stat.growth}</span>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-black text-gray-800">{stat.value}</span>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400 mt-2">{stat.title}</p>
                </div>
              </div>
              <Link href={stat.link} className={`w-full text-center py-3 rounded-2xl text-white text-[10px] font-black uppercase mt-6 ${stat.btnColor}`}>
                {stat.btnText}
              </Link>
            </div>
          );
        })}
      </div>

      {/* 3. Visual Charts Grid (Interactive Custom SVG/CSS Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Line Graph with Hover Interactive Tooltip (Pure White Text) */}
        <div className="lg:col-span-7 bg-white rounded-[2rem] border border-gray-100 p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-black text-gray-800">Consultation Trends</h3>
              <p className="text-xs text-gray-400 mt-0.5">Analysing monthly consultations (Hover points for details).</p>
            </div>
          </div>
          
          <div className="relative h-64 w-full pt-4">
            {/* Interactive Custom Floating Tooltip */}
            {hoveredLinePoint !== null && (
              <div 
                className="absolute bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-xl z-30 transition-all duration-200"
                style={{ 
                  left: `${customLinePoints[hoveredLinePoint].x - 60}px`, 
                  top: `${customLinePoints[hoveredLinePoint].y - 65}px` 
                }}
              >
                {/* 100% White Text */}
                <p className="text-[10px] font-extrabold text-white uppercase tracking-wider">
                  {customLinePoints[hoveredLinePoint].month} Report
                </p>
                <p className="text-xs font-black text-white mt-1">
                  Consultations: {customLinePoints[hoveredLinePoint].consult}
                </p>
              </div>
            )}

            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              <line x1="0" y1="50" x2="500" y2="50" stroke="#F8FAFC" strokeWidth="1" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="#F8FAFC" strokeWidth="1" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="#F8FAFC" strokeWidth="1" />
              
              <path d="M 20,160 Q 110,130 200,80 T 380,50 T 470,25 L 470,200 L 20,200 Z" fill="url(#gradNoDep)" opacity="0.15" />
              <path d="M 20,160 Q 110,130 200,80 T 380,50 T 470,25" fill="none" stroke="#3D3F96" strokeWidth="4" strokeLinecap="round" />

              <defs>
                <linearGradient id="gradNoDep" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3D3F96" />
                  <stop offset="100%" stopColor="#3D3F96" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Interactive SVG point hooks */}
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
              {customLinePoints.map((pt, i) => <span key={i}>{pt.month}</span>)}
            </div>
          </div>
        </div>

        {/* Pie Chart with Interactive Legends (Pure White Text Tooltip) */}
        <div className="lg:col-span-5 bg-white rounded-[2rem] border border-gray-100 p-6 md:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-black text-gray-800">Specialty Distribution</h3>
            <p className="text-xs text-gray-400 mt-0.5">Patient load share (Hover blocks for active white text details).</p>
          </div>

          <div className="relative h-44 w-full flex items-center justify-center my-4">
            <svg className="w-36 h-36 transform -rotate-90">
              <circle cx="72" cy="72" r="54" fill="transparent" stroke="#F1F5F9" strokeWidth="14" />
              <circle cx="72" cy="72" r="54" fill="transparent" stroke="#3D3F96" strokeWidth="14" strokeDasharray="339.29" strokeDashoffset="150" />
              <circle cx="72" cy="72" r="54" fill="transparent" stroke="#5C5EB2" strokeWidth="14" strokeDasharray="339.29" strokeDashoffset="240" />
            </svg>
            <div className="absolute text-center">
              <span className="text-[10px] text-gray-400 uppercase font-black block">Top Specialty</span>
              <span className="text-xs font-black text-[#3D3F96] block mt-0.5">Diabetic Care</span>
            </div>
          </div>

          {/* Interactive Legends with Pure White Text Tooltips on hover */}
          <div className="grid grid-cols-2 gap-3 relative">
            {customPieData.map((item, index) => (
              <div 
                key={index} 
                onMouseEnter={() => setHoveredSlice(index)}
                onMouseLeave={() => setHoveredSlice(null)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 cursor-help transition-all hover:bg-indigo-50/50"
              >
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${pieColors[index]}`}></span>
                <span className="text-[10px] font-black text-gray-600 truncate">{item.name} ({item.val})</span>
                
                {/* Float Card on Hover */}
                {hoveredSlice === index && (
                  <div className="absolute left-0 right-0 -top-24 bg-slate-900 border border-slate-800 p-3 rounded-2xl shadow-xl z-30 animate-fadeIn">
                    {/* White Text */}
                    <h5 className="text-[10px] font-extrabold text-white uppercase tracking-wider">{item.name} - {item.val}</h5>
                    <p className="text-[11px] text-white/90 font-medium mt-1">{item.desc}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bar Graph with Interactive Hover Tooltip (Pure White Text) */}
        <div className="lg:col-span-12 bg-white rounded-[2rem] border border-gray-100 p-6 md:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-black text-gray-800">Weekly Appointment Load</h3>
              <p className="text-xs text-gray-400 mt-0.5">Hover on any bar to see live stats details.</p>
            </div>
          </div>

          <div className="relative flex items-end justify-between h-48 w-full gap-2 px-2 border-b border-gray-100 pb-1 pt-4">
            {weeklyLoad.map((item, idx) => (
              <div 
                key={idx} 
                className="flex-1 flex flex-col items-center relative group"
                onMouseEnter={() => setHoveredBar(idx)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {/* Floating Tooltip Box with 100% White Text */}
                {hoveredBar === idx && (
                  <div className="absolute -top-14 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl shadow-xl z-20 whitespace-nowrap animate-fadeIn text-center">
                    <span className="text-[9px] font-black text-white/60 uppercase block tracking-widest">{item.day} Slot</span>
                    <span className="text-xs font-black text-white mt-0.5 block">{item.count} Appointments</span>
                  </div>
                )}

                <div className="w-full max-w-[28px] relative rounded-t-lg overflow-hidden flex flex-col justify-end h-36 bg-slate-50 cursor-pointer">
                  <div 
                    style={{ height: item.val }} 
                    className={`w-full rounded-t-lg transition-all duration-500 origin-bottom ${
                      item.highlight ? "bg-indigo-500" : "bg-[#3D3F96]"
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