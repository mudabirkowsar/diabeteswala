"use client";

import { useState, useEffect, useRef } from "react";
import {
    FaGlobeAmericas, FaFlask, FaPills, FaClinicMedical, FaUtensils,
    FaUserMd, FaSync, FaUndo, FaChartBar, FaChartPie, FaChartLine
} from "react-icons/fa";

/* =========================================================================
   DESIGN TOKENS
   Primary brand ink stays #3D3F96 (already the client's identity), built
   out into a small deep/soft/glow ramp so gradients, glass panels and
   chart fills all read as one deliberate palette instead of flat reuse.
   ========================================================================= */
const theme = {
    primary: "#3D3F96",
    primaryDark: "#2C2D75",
    primaryDeep: "#1E1B4B",
    primarySoft: "#EEF0FC",
    primaryGlow: "#6366F1",
};

/* =========================================================================
   SMALL UTILITIES
   ========================================================================= */

// requestAnimationFrame count-up with cubic ease-out, restartable via `tick`
function useCountUp(target, active, duration = 1100, tick = 0) {
    const [value, setValue] = useState(0);
    useEffect(() => {
        if (!active) return;
        let raf;
        let start;
        const step = (t) => {
            if (!start) start = t;
            const p = Math.min((t - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setValue(eased * target);
            if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active, target, tick]);
    return value;
}

// Catmull-Rom -> cubic bezier smoothing, so the line chart reads as a
// genuine curve rather than a jagged polyline.
function buildSmoothPath(pts) {
    if (!pts.length) return "";
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    const get = (i) => pts[Math.max(0, Math.min(pts.length - 1, i))];
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
        const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
        const c1x = p1.x + (p2.x - p0.x) / 6;
        const c1y = p1.y + (p2.y - p0.y) / 6;
        const c2x = p2.x - (p3.x - p1.x) / 6;
        const c2y = p2.y - (p3.y - p1.y) / 6;
        d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x} ${p2.y}`;
    }
    return d;
}

/* =========================================================================
   CHART CARD — every metric gets BOTH a bar and a line view. A pill
   toggle switches between them with a proper draw-in / grow-in animation
   each time, rather than a single fixed chart type.
   ========================================================================= */
function ChartCard({ icon, title, badgeLabel, badgeTone, data, color, gradientId, delay = 0, defaultMode = "bar" }) {
    const [mode, setMode] = useState(defaultMode);
    const [drawn, setDrawn] = useState(false);
    const [hoverIdx, setHoverIdx] = useState(null);
    const total = data.reduce((s, d) => s + d.value, 0);
    const displayTotal = useCountUp(total, drawn);

    // (Re)play the entrance / draw animation on mount and every mode switch.
    useEffect(() => {
        setDrawn(false);
        const t1 = setTimeout(() => setDrawn(true), 120 + delay);
        return () => clearTimeout(t1);
    }, [mode, delay]);

    const maxVal = Math.max(2, ...data.map((d) => d.value));
    const W = 400, H = 200, left = 34, right = 388, top = 22, base = 160;
    const step = (right - left) / (data.length - 1 || 1);

    const points = data.map((d, i) => ({
        x: left + i * step,
        y: base - (d.value / maxVal) * (base - top),
        v: d.value,
        label: d.label,
    }));

    const linePath = buildSmoothPath(points);
    const areaPath = points.length
        ? `${linePath} L ${points[points.length - 1].x} ${base} L ${points[0].x} ${base} Z`
        : "";

    const gridLines = [top, (top + base) / 2, base];
    const gridLabels = [maxVal, Math.round(maxVal / 2), 0];

    return (
        <div
            className="group/card bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_18px_45px_rgb(0,0,0,0.05)] transition-shadow duration-500 overflow-hidden"
            style={{
                opacity: drawn ? 1 : 0,
                transform: drawn ? "translateY(0)" : "translateY(10px)",
                transition: `opacity 500ms ease ${delay}ms, transform 500ms ease ${delay}ms, box-shadow 400ms ease`,
            }}
        >
            {/* top accent hairline in the chart's own color */}
            <div className="h-[3px] w-full" style={{ background: `linear-gradient(90deg, ${color}, transparent 85%)` }} />

            <div className="p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
                    <div className="flex items-center gap-2">
                        {icon}
                        <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider">{title}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                        <span
                            className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                            style={{ backgroundColor: `${badgeTone}1A`, color: badgeTone }}
                        >
                            {badgeLabel}: {Math.round(displayTotal)}
                        </span>

                        {/* bar / line toggle — both chart types always available */}
                        <div className="flex items-center bg-gray-50 border border-gray-100 rounded-lg p-0.5">
                            <button
                                aria-label="Show bar chart"
                                onClick={() => setMode("bar")}
                                className={`px-2 py-1.5 rounded-md text-xs transition-all duration-300 focus:outline-none ${
                                    mode === "bar" ? "bg-white shadow-sm" : "opacity-50 hover:opacity-80"
                                }`}
                                style={{ color: mode === "bar" ? color : undefined }}
                            >
                                <FaChartBar />
                            </button>
                            <button
                                aria-label="Show line chart"
                                onClick={() => setMode("line")}
                                className={`px-2 py-1.5 rounded-md text-xs transition-all duration-300 focus:outline-none ${
                                    mode === "line" ? "bg-white shadow-sm" : "opacity-50 hover:opacity-80"
                                }`}
                                style={{ color: mode === "line" ? color : undefined }}
                            >
                                <FaChartLine />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="relative w-full h-64 mt-2">
                    <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
                        <defs>
                            <linearGradient id={`${gradientId}-bar`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={color} stopOpacity="1" />
                                <stop offset="100%" stopColor={color} stopOpacity="0.55" />
                            </linearGradient>
                            <linearGradient id={`${gradientId}-area`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={color} stopOpacity="0.28" />
                                <stop offset="100%" stopColor={color} stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {gridLines.map((y, i) => (
                            <line key={i} x1={left} y1={y} x2={right} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                        ))}
                        {gridLabels.map((label, i) => (
                            <text key={i} x="4" y={gridLines[i] + 4} className="text-[10px] font-bold" fill="#9ca3af">
                                {label}
                            </text>
                        ))}

                        {/* ---------- BAR MODE ---------- */}
                        <g style={{ opacity: mode === "bar" ? 1 : 0, transition: "opacity 350ms ease", pointerEvents: mode === "bar" ? "auto" : "none" }}>
                            {points.map((p, i) => {
                                const barW = Math.min(20, step * 0.42);
                                const h = drawn ? base - p.y : 0;
                                const y = base - h;
                                return (
                                    <g key={i} onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)} className="cursor-pointer">
                                        <rect
                                            x={p.x - barW / 2}
                                            y={y}
                                            width={barW}
                                            height={h}
                                            rx={5}
                                            fill={`url(#${gradientId}-bar)`}
                                            style={{
                                                transition: `height 850ms cubic-bezier(.16,1,.3,1) ${i * 55}ms, y 850ms cubic-bezier(.16,1,.3,1) ${i * 55}ms, opacity 300ms ease`,
                                                opacity: hoverIdx === null || hoverIdx === i ? 1 : 0.45,
                                            }}
                                        />
                                        <text
                                            x={p.x}
                                            y={y - 8}
                                            textAnchor="middle"
                                            className="text-[10px] font-bold"
                                            fill={theme.primaryDeep}
                                            style={{ opacity: hoverIdx === i ? 1 : 0, transition: "opacity 200ms ease" }}
                                        >
                                            {p.v}
                                        </text>
                                    </g>
                                );
                            })}
                        </g>

                        {/* ---------- LINE MODE ---------- */}
                        <g style={{ opacity: mode === "line" ? 1 : 0, transition: "opacity 350ms ease", pointerEvents: mode === "line" ? "auto" : "none" }}>
                            <path d={areaPath} fill={`url(#${gradientId}-area)`} style={{ opacity: drawn ? 1 : 0, transition: "opacity 700ms ease 550ms" }} />
                            <path
                                d={linePath}
                                fill="none"
                                stroke={color}
                                strokeWidth="2.75"
                                strokeLinecap="round"
                                pathLength="1000"
                                style={{
                                    strokeDasharray: 1000,
                                    strokeDashoffset: drawn ? 0 : 1000,
                                    transition: "stroke-dashoffset 1100ms cubic-bezier(.16,1,.3,1)",
                                }}
                            />
                            {points.map((p, i) => (
                                <g key={i} onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)} className="cursor-pointer">
                                    <circle
                                        cx={p.x}
                                        cy={p.y}
                                        r={hoverIdx === i ? 5.5 : 3.5}
                                        fill="#fff"
                                        stroke={color}
                                        strokeWidth="2.5"
                                        style={{
                                            opacity: drawn ? 1 : 0,
                                            transition: `opacity 400ms ease ${650 + i * 60}ms, r 200ms ease`,
                                        }}
                                    />
                                    <text
                                        x={p.x}
                                        y={p.y - 12}
                                        textAnchor="middle"
                                        className="text-[10px] font-bold"
                                        fill={theme.primaryDeep}
                                        style={{ opacity: hoverIdx === i ? 1 : 0, transition: "opacity 200ms ease" }}
                                    >
                                        {p.v}
                                    </text>
                                </g>
                            ))}
                        </g>

                        <line x1={left} y1={base} x2={right} y2={base} stroke="#cbd5e1" strokeWidth="1.5" />
                    </svg>

                    <div className="flex justify-between pl-8 pr-2 mt-2">
                        {data.map((d, i) => (
                            <span
                                key={i}
                                className="text-[9px] font-bold w-10 text-center tracking-tight truncate leading-none transition-colors duration-200"
                                style={{ color: hoverIdx === i ? color : "#9ca3af" }}
                            >
                                {d.label}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* =========================================================================
   VENDOR STAT CARD — count-up number + staggered entrance
   ========================================================================= */
function VendorCard({ title, count, icon, iconBg, avatars, delay, active }) {
    const displayCount = useCountUp(count, active, 900);
    return (
        <div
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.012)] hover:shadow-[0_15px_40px_rgb(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            style={{
                opacity: active ? 1 : 0,
                transform: active ? "translateY(0)" : "translateY(14px)",
                transition: `opacity 550ms ease ${delay}ms, transform 550ms cubic-bezier(.16,1,.3,1) ${delay}ms, box-shadow 300ms ease, translate 300ms ease`,
            }}
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{title}</h4>
                    <p className="text-3xl font-black text-gray-800 mt-1 tabular-nums">{Math.round(displayCount)}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                    {icon}
                </div>
            </div>

            <div className="flex -space-x-2.5 overflow-hidden pt-2 mt-auto">
                {avatars.map((url, i) => (
                    <img
                        key={i}
                        src={url}
                        alt="Avatar"
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover shadow-sm transition-transform duration-300 hover:scale-110 hover:z-10"
                        style={{ transitionDelay: `${i * 30}ms` }}
                    />
                ))}
            </div>
        </div>
    );
}

/* =========================================================================
   MAIN DASHBOARD
   ========================================================================= */
export default function Dashboard() {
    const [activeTab, setActiveTab] = useState("vendor");
    const [selectedCountry, setSelectedCountry] = useState("India");
    const [selectedState, setSelectedState] = useState("All States");
    const [selectedCity, setSelectedCity] = useState("All Cities");
    const [isLoaded, setIsLoaded] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [hoverLegend, setHoverLegend] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 150);
        return () => clearTimeout(timer);
    }, []);

    const themeColor = theme.primary;
    const themeBg = "bg-[#3D3F96]";
    const themeHoverBg = "hover:bg-[#2C2D75]";
    const themeText = "text-[#3D3F96]";
    const themeRing = "focus:ring-[#3D3F96]/30";
    const themeShadow = "shadow-[#3D3F96]/20";

    const vendorCards = [
        {
            title: "Lab", count: 2,
            icon: <FaFlask className="text-xl text-blue-600" />, iconBg: "bg-blue-50",
            avatars: [
                "https://images.unsplash.com/photo-1579684389782-64d84b5e901d?w=100&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=100&auto=format&fit=crop",
            ],
        },
        {
            title: "Pharmacy", count: 4,
            icon: <FaPills className="text-xl text-red-500" />, iconBg: "bg-red-50",
            avatars: [
                "https://images.unsplash.com/photo-1587854692152-cbe660db0969?w=100&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1550572017-edd951b55104?w=100&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1607619056574-7b8d304a2906?w=100&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=100&auto=format&fit=crop",
            ],
        },
        {
            title: "Clinic", count: 4,
            icon: <FaClinicMedical className="text-xl text-emerald-500" />, iconBg: "bg-emerald-50",
            avatars: [
                "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=100&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=100&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1579684389782-64d84b5e901d?w=100&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=100&auto=format&fit=crop",
            ],
        },
        {
            title: "Food", count: 2,
            icon: <FaUtensils className="text-xl text-amber-500" />, iconBg: "bg-amber-50",
            avatars: [
                "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=100&auto=format&fit=crop",
            ],
        },
        {
            title: "Doctors", count: 3,
            icon: <FaUserMd className="text-xl text-indigo-500" />, iconBg: "bg-indigo-50",
            avatars: [
                "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop",
            ],
        },
    ];

    const doctorsChartData = [
        { label: "Aug 2025", value: 0 }, { label: "Sep 2025", value: 1 }, { label: "Oct 2025", value: 2 },
        { label: "Nov 2025", value: 0 }, { label: "Dec 2025", value: 0 }, { label: "Jan 2026", value: 0 },
        { label: "Feb 2026", value: 0 }, { label: "Mar 2026", value: 0 },
    ];
    const usersChartData = [
        { label: "Aug 2025", value: 0 }, { label: "Sep 2025", value: 0 }, { label: "Oct 2025", value: 0 },
        { label: "Nov 2025", value: 1 }, { label: "Dec 2025", value: 0 }, { label: "Jan 2026", value: 0 },
        { label: "Feb 2026", value: 0 }, { label: "Mar 2026", value: 0 },
    ];
    const pharmacyChartData = [
        { label: "Aug 2025", value: 0 }, { label: "Sep 2025", value: 0 }, { label: "Oct 2025", value: 0 },
        { label: "Nov 2025", value: 1 }, { label: "Dec 2025", value: 0 }, { label: "Jan 2026", value: 0 },
        { label: "Feb 2026", value: 0 }, { label: "Mar 2026", value: 0 },
    ];

    const doughnutData = [
        { label: "Jan", value: 40, color: theme.primary },
        { label: "Feb", value: 20, color: "#38bdf8" },
        { label: "Mar", value: 15, color: "#fb7185" },
        { label: "Apr", value: 15, color: "#facc15" },
        { label: "May", value: 10, color: "#a855f7" },
    ];

    const handleReset = () => {
        setSelectedCountry("India");
        setSelectedState("All States");
        setSelectedCity("All Cities");
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        setIsLoaded(false);
        setTimeout(() => {
            setIsLoaded(true);
            setIsRefreshing(false);
        }, 500);
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-fadeIn select-none">

            {/* 1. GLOBAL LOCATION FILTERS SECTION */}
            <div
                className="relative rounded-2xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden"
                style={{ background: `linear-gradient(135deg, #ffffff 65%, ${theme.primarySoft} 100%)` }}
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md"
                         style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryGlow})` }}>
                        <FaGlobeAmericas className="text-xl" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 leading-snug">Global Location Filters</h2>
                        <p className="text-xs text-gray-400">Filter your analytical dashboard by region</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Country</label>
                        <select
                            value={selectedCountry}
                            onChange={(e) => setSelectedCountry(e.target.value)}
                            className={`bg-white/80 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                        >
                            <option value="India">India</option>
                            <option value="USA">USA</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">State</label>
                        <select
                            value={selectedState}
                            onChange={(e) => setSelectedState(e.target.value)}
                            className={`bg-white/80 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                        >
                            <option value="All States">All States</option>
                            <option value="Maharashtra">Maharashtra</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">City</label>
                        <select
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            className={`bg-white/80 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                        >
                            <option value="All Cities">All Cities</option>
                            <option value="Mumbai">Mumbai</option>
                        </select>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleReset}
                            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 font-semibold py-2.5 rounded-xl text-sm transition-all focus:outline-none"
                        >
                            <FaUndo className="text-xs" /> Reset
                        </button>
                        <button
                            onClick={handleRefresh}
                            className={`flex-1 flex items-center justify-center gap-2 text-white font-semibold py-2.5 rounded-xl text-sm transition-all active:scale-95 focus:outline-none ${themeBg} ${themeHoverBg} ${themeShadow} shadow-lg`}
                        >
                            <FaSync className={`text-xs ${isRefreshing ? "animate-spin" : ""}`} /> Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. TAB TOGGLING */}
            <div className="flex gap-2 border-b border-gray-100 pb-3 shrink-0">
                {["vendor", "user"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 focus:outline-none ${
                            activeTab === tab ? `${themeBg} text-white shadow-lg ${themeShadow}` : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* 3. VENDOR STATS CARDS */}
            {activeTab === "vendor" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    {vendorCards.map((card, index) => (
                        <VendorCard key={card.title} {...card} delay={index * 70} active={isLoaded} />
                    ))}
                </div>
            )}

            {/* 4. DOCTORS & USERS — each with a bar/line toggle */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard
                    icon={<FaChartBar className={`text-lg ${themeText}`} />}
                    title="Number of Doctors"
                    badgeLabel="Total Doctors"
                    badgeTone={themeColor}
                    data={doctorsChartData}
                    color={themeColor}
                    gradientId="doctors"
                    delay={0}
                    defaultMode="bar"
                />
                <ChartCard
                    icon={<FaChartBar className={`text-lg ${themeText}`} />}
                    title="Number of Users"
                    badgeLabel="Total Users"
                    badgeTone={themeColor}
                    data={usersChartData}
                    color={themeColor}
                    gradientId="users"
                    delay={90}
                    defaultMode="line"
                />
            </div>

            {/* 5. SECTION HEADER */}
            <div className="pt-4 text-center">
                <div className="inline-block h-1 w-16 rounded-full mb-2" style={{ background: `linear-gradient(90deg, ${theme.primary}, ${theme.primaryGlow})` }} />
                <h2 className="text-lg font-black text-gray-800 tracking-tight uppercase">Charts of Pharmacies and Labs</h2>
                <p className="text-xs text-gray-400">Monthly overview of pharmacies and lab categories</p>
            </div>

            {/* 6. BOTTOM GRID — interactive doughnut + toggleable pharmacy chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_18px_45px_rgb(0,0,0,0.05)] transition-shadow duration-500">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-50">
                        <FaChartPie className={`text-lg ${themeText}`} />
                        <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Monthly Analysis (Doughnut)</h3>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-around gap-6 h-64">
                        <div className="relative w-44 h-44">
                            <svg className="w-full h-full" viewBox="0 0 36 36" style={{ filter: "drop-shadow(0 4px 10px rgba(61,63,150,0.15))" }}>
                                <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="4" />
                                {(() => {
                                    let acc = 0;
                                    return doughnutData.map((item, index) => {
                                        const percent = item.value;
                                        const dash = `${percent} ${100 - percent}`;
                                        const offset = 100 - acc + 25;
                                        acc += percent;
                                        const isHovered = hoverLegend === index;
                                        const isDimmed = hoverLegend !== null && !isHovered;
                                        return (
                                            <circle
                                                key={index}
                                                cx="18" cy="18" r="15.915"
                                                fill="transparent"
                                                stroke={item.color}
                                                strokeWidth={isHovered ? 5.2 : 4}
                                                strokeDasharray={dash}
                                                strokeDashoffset={isLoaded ? offset : 125}
                                                strokeOpacity={isDimmed ? 0.25 : 1}
                                                onMouseEnter={() => setHoverLegend(index)}
                                                onMouseLeave={() => setHoverLegend(null)}
                                                className="cursor-pointer origin-center"
                                                style={{ transform: "rotate(-90deg)", transition: "stroke-dashoffset 1000ms cubic-bezier(.16,1,.3,1), stroke-width 200ms ease, stroke-opacity 200ms ease" }}
                                            />
                                        );
                                    });
                                })()}
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-black text-gray-800 tabular-nums transition-all duration-200">
                                    {hoverLegend !== null ? `${doughnutData[hoverLegend].value}%` : "100%"}
                                </span>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                    {hoverLegend !== null ? doughnutData[hoverLegend].label : "Total"}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2.5">
                            {doughnutData.map((item, index) => (
                                <div
                                    key={index}
                                    onMouseEnter={() => setHoverLegend(index)}
                                    onMouseLeave={() => setHoverLegend(null)}
                                    className="flex items-center gap-3 cursor-pointer rounded-lg px-1.5 py-1 -mx-1.5 transition-colors duration-200"
                                    style={{ backgroundColor: hoverLegend === index ? `${item.color}14` : "transparent" }}
                                >
                                    <span className="w-3.5 h-3.5 rounded-md transition-transform duration-200" style={{ backgroundColor: item.color, transform: hoverLegend === index ? "scale(1.2)" : "scale(1)" }} />
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{item.label} ({item.value}%)</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <ChartCard
                    icon={<FaChartBar className="text-lg text-red-500" />}
                    title="Number of Pharmacies"
                    badgeLabel="Total Pharmacies"
                    badgeTone="#ef4444"
                    data={pharmacyChartData}
                    color="#ef4444"
                    gradientId="pharmacy"
                    delay={60}
                    defaultMode="bar"
                />
            </div>

        </div>
    );
}