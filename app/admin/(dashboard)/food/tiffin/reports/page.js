"use client";

import React from 'react';

export default function TiffinReports() {
  // Mock Analytical metrics
  const stats = [
    { name: "Active Retention Rate", value: "94.2%", description: "Average 6-month cycle", icon: SparklesIcon, color: "text-[#3D3F96] bg-[#3D3F96]/10" },
    { name: "Month-on-Month Growth", value: "+14.8%", description: "Acquisition trend", icon: GrowthIcon, color: "text-emerald-600 bg-emerald-50" },
    { name: "Avg Customer LTV", value: "₹18,400", description: "Lifetime value index", icon: LtvIcon, color: "text-sky-600 bg-sky-50" }
  ];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-fade-in pb-12">
      
      {/* Header section */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Reports & Analytics</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Audit customer retention curves, market shares, and monthly subscription growth indices.</p>
      </div>

      {/* Analytical overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map((s) => (
          <div key={s.name} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{s.name}</span>
              <p className="text-2xl font-black text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500 font-medium">{s.description}</p>
            </div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color} flex-shrink-0`}>
              <s.icon className="w-5.5 h-5.5 stroke-[2]" />
            </div>
          </div>
        ))}
      </div>

      {/* Analytical Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Subscription Growth Chart (2/3 width) */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">Subscriber Acquisition Timeline</h3>
              <p className="text-xs text-slate-400 mt-0.5">MoM count of newly registered active subscriptions</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-[#3D3F96] bg-[#3D3F96]/5 border border-[#3D3F96]/10 px-3 py-1 rounded-lg">
              MoM Growth Trace
            </div>
          </div>

          {/* Responsive custom SVG line chart */}
          <div className="relative w-full h-[300px]">
            <svg viewBox="0 0 800 300" className="w-full h-full overflow-visible">
              <line x1="50" y1="50" x2="780" y2="50" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="50" y1="110" x2="780" y2="110" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="50" y1="170" x2="780" y2="170" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="50" y1="230" x2="780" y2="230" stroke="#cbd5e1" strokeWidth="1.5" />

              {/* Y Labels */}
              <text x="40" y="54" textAnchor="end" className="text-[10px] fill-slate-400 font-bold">300 Subs</text>
              <text x="40" y="114" textAnchor="end" className="text-[10px] fill-slate-400 font-bold">200 Subs</text>
              <text x="40" y="174" textAnchor="end" className="text-[10px] fill-slate-400 font-bold">100 Subs</text>
              <text x="40" y="234" textAnchor="end" className="text-[10px] fill-slate-400 font-bold">0</text>

              {/* X Labels */}
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((m, idx) => {
                const x = 75 + idx * 110;
                return (
                  <text key={m} x={x} y="255" textAnchor="middle" className="text-[10px] fill-slate-400 font-bold uppercase tracking-wider">{m}</text>
                );
              })}

              {/* Line graph paths */}
              <path
                d="M 75 210 L 185 190 L 295 160 L 405 150 L 515 110 L 625 90 L 735 60"
                fill="none"
                stroke="#3D3F96"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-lg"
              />

              {/* Interactive circular points */}
              {[
                { x: 75, y: 210, label: "82" },
                { x: 185, y: 190, label: "114" },
                { x: 295, y: 160, label: "148" },
                { x: 405, y: 150, label: "162" },
                { x: 515, y: 110, label: "210" },
                { x: 625, y: 90, label: "232" },
                { x: 735, y: 60, label: "248" }
              ].map((pt) => (
                <g key={pt.x} className="group cursor-pointer">
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="6"
                    className="fill-white stroke-[#3D3F96] stroke-[3]"
                  />
                  <text x={pt.x} y={pt.y - 14} textAnchor="middle" className="text-[10px] font-black fill-[#3D3F96] hidden group-hover:block bg-white">
                    {pt.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Plan Popularity Split Donut (1/3 width) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-800 text-base">Plan Market Shares</h3>
            <p className="text-xs text-slate-400 mt-0.5">Market division of active subscription models</p>
          </div>

          {/* Donut Chart Graphics */}
          <div className="relative py-6 flex items-center justify-center">
            <svg viewBox="0 0 200 200" className="w-48 h-48 transform -rotate-90">
              {/* 1 Meal Plan - 55% */}
              <circle
                cx="100"
                cy="100"
                r="70"
                fill="transparent"
                stroke="#3D3F96"
                strokeWidth="28"
                strokeDasharray="440"
                strokeDashoffset="198"
              />
              {/* 2 Meals Plan - 30% */}
              <circle
                cx="100"
                cy="100"
                r="70"
                fill="transparent"
                stroke="#00B574"
                strokeWidth="28"
                strokeDasharray="440"
                strokeDashoffset="440"
                className="origin-center"
                style={{ transform: 'rotate(198deg)' }}
              />
              {/* Full Day Plan - 15% */}
              <circle
                cx="100"
                cy="100"
                r="70"
                fill="transparent"
                stroke="#38bdf8"
                strokeWidth="28"
                strokeDasharray="440"
                strokeDashoffset="440"
                className="origin-center"
                style={{ transform: 'rotate(306deg)' }}
              />
            </svg>

            {/* Inner details count */}
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-black text-slate-800">55%</span>
              <span className="text-[9px] uppercase font-extrabold tracking-widest text-slate-400 mt-0.5">1 Meal Choice</span>
            </div>
          </div>

          {/* Legend Details breakdown list */}
          <div className="border-t border-slate-100 pt-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3D3F96]"></span>
                <span className="text-slate-500 font-bold">1 Meal Anytime (55%)</span>
              </div>
              <span className="font-extrabold text-slate-800">142 Subs</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00B574]"></span>
                <span className="text-slate-500 font-bold">2 Meals Combo (30%)</span>
              </div>
              <span className="font-extrabold text-slate-800">84 Subs</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                <span className="text-slate-500 font-bold">Full Day Diet (15%)</span>
              </div>
              <span className="font-extrabold text-slate-800">52 Subs</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Icons

function SparklesIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096a.4.4 0 00-.332-.331L2.76 14.76a.4.4 0 000 .753l5.096.813a.4.4 0 01.331.332L9 21.76a.4.4 0 00.753 0l.813-5.096a.4.4 0 01.332-.331l5.096-.813a.4.4 0 000-.753l-5.096-.813a.4.4 0 01-.331-.332L9.813 15.904zM19.006 4.41l-.41-.41a.5.5 0 00-.707 0l-.41.41a.5.5 0 01-.707 0l-.41-.41a.5.5 0 00-.707 0l-.41.41a.5.5 0 01-.707 0" />
    </svg>
  );
}

function GrowthIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  );
}

function LtvIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.265.265c.3.3.732.366 1.078.263l1.25-.375c.3-.09.6-.09.9 0l1.25.375c.346.103.778.037 1.078-.263l.265-.265m-9-3.73l.265.265c.3.3.732.366 1.078.263l1.25-.375c.3-.09.6-.09.9 0l1.25.375c.346.103.778.037 1.078-.263l.265-.265m-9-3.73l.265.265c.3.3.732.366 1.078.263l1.25-.375c.3-.09.6-.09.9 0l1.25.375c.346.103.778.037 1.078-.263l.265-.265" />
    </svg>
  );
}