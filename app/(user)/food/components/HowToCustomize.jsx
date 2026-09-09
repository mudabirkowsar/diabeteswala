'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Coffee,
    UtensilsCrossed,
    Moon,
    CalendarDays,
    SlidersHorizontal,
    CheckCircle2,
    ArrowRight,
    Sparkles,
    Check,
    ChevronRight
} from 'lucide-react';

const DAYS = [
    { label: 'M', active: true },
    { label: 'T', active: true },
    { label: 'W', active: true },
    { label: 'T', active: true },
    { label: 'F', active: true },
    { label: 'S', active: false },
    { label: 'S', active: false },
];

const STEPS = [
    {
        num: '01',
        label: 'Choose meals',
        detail: 'Select breakfast, lunch, or dinner combo for your routine.',
        icon: UtensilsCrossed,
    },
    {
        num: '02',
        label: 'Pick days',
        detail: 'Choose any schedule — 5-day work week or whole month.',
        icon: CalendarDays,
    },
    {
        num: '03',
        label: 'Customize daily',
        detail: 'Swap curries, base grains, and sides for every single day.',
        icon: SlidersHorizontal,
    },
    {
        num: '04',
        label: 'Lock & enjoy',
        detail: 'Review live nutrition & pricing, then activate with one tap.',
        icon: CheckCircle2,
    },
];

const STEP_DURATION = 3400;

export default function HowToCustomize() {
    const router = useRouter();
    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        if (paused) return undefined;
        const timer = setInterval(() => {
            setActive((prev) => (prev + 1) % STEPS.length);
        }, STEP_DURATION);
        return () => clearInterval(timer);
    }, [paused]);

    return (
        <div className="py-8 px-4 sm:px-6 lg:px-10">
            <div
                className="bg-gradient-to-br from-[#181926] via-[#121320] to-[#0b0c15] rounded-3xl p-5 sm:p-7 lg:p-8 text-white shadow-2xl shadow-black/40 relative overflow-hidden border border-red-500/20"
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
            >
                {/* Ambient Background Glows */}
                <div className="absolute -right-16 -bottom-16 w-60 h-60 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -left-10 -top-10 w-44 h-44 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-5">
                        <div className="space-y-2 max-w-xl">
                            <div className="inline-flex items-center gap-1.5 bg-red-500/15 text-red-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-red-500/25">
                                <Sparkles size={12} className="text-red-400 animate-pulse" /> Easy 4-Step Builder
                            </div>
                            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white">
                                Your tiffin, planned your way
                            </h3>
                            <p className="text-xs sm:text-[13px] text-slate-300 font-medium leading-relaxed">
                                Pick your meals, set your schedule, and customize your dishes in under 2 minutes.
                            </p>
                        </div>

                        <button
                            onClick={() => router.push('/food/customtiffin')}
                            className="shrink-0 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/25 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <span>Build My Tiffin</span>
                            <ArrowRight size={14} />
                        </button>
                    </div>

                    {/* Main Interactive Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center pt-3">

                        {/* Left: Device + Animated Chef Character */}
                        <div className="lg:col-span-5 flex flex-col items-center">
                            <div className="relative w-full max-w-[280px]">

                                {/* Floating character positioned smoothly on top-right */}
                                <div className="absolute -top-11 -right-4 z-20 drop-shadow-2xl pointer-events-none">
                                    <TiffinCharacter step={active} />
                                </div>

                                <div className="w-full rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4 h-[230px] relative overflow-hidden shadow-inner shadow-black/40">
                                    {/* Device Top Bar */}
                                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.06]">
                                        <div className="flex gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-red-500/60" />
                                            <div className="w-2 h-2 rounded-full bg-amber-500/60" />
                                            <div className="w-2 h-2 rounded-full bg-emerald-500/60" />
                                        </div>
                                        <span className="text-[9px] font-mono text-slate-400 tracking-wider">LIVE PREVIEW</span>
                                    </div>

                                    {/* Step 1: Meal Picker */}
                                    <PanelStep visible={active === 0}>
                                        <PanelLabel>1. Select Daily Meals</PanelLabel>
                                        <div className="space-y-1.5 mt-2">
                                            {[
                                                { icon: Coffee, label: 'Breakfast', tag: '8:00 AM', delay: '0ms' },
                                                { icon: UtensilsCrossed, label: 'Lunch', tag: '1:00 PM', delay: '100ms' },
                                                { icon: Moon, label: 'Dinner', tag: '8:30 PM', delay: '200ms' },
                                            ].map(({ icon: Icon, label, tag, delay }) => (
                                                <div
                                                    key={label}
                                                    className="flex items-center justify-between rounded-lg bg-white/[0.05] border border-white/10 px-3 py-1.5 animate-[fadeSlideIn_0.4s_ease-out_both]"
                                                    style={{ animationDelay: active === 0 ? delay : '0ms' }}
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <Icon size={14} className="text-red-400" />
                                                        <span className="text-xs font-bold text-slate-100">{label}</span>
                                                    </div>
                                                    <span className="text-[9px] text-slate-400 font-mono">{tag}</span>
                                                    <span className="w-3.5 h-3.5 rounded-full bg-red-500 flex items-center justify-center">
                                                        <Check size={9} className="text-white" strokeWidth={3} />
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </PanelStep>

                                    {/* Step 2: Day Picker */}
                                    <PanelStep visible={active === 1}>
                                        <PanelLabel>2. Select Active Days</PanelLabel>
                                        <div className="grid grid-cols-7 gap-1 mt-2.5">
                                            {DAYS.map((d, i) => (
                                                <div
                                                    key={`${d.label}-${i}`}
                                                    className={`h-7 rounded-md flex items-center justify-center text-[10px] font-black border transition-all animate-[popIn_0.35s_ease-out_both] ${d.active
                                                            ? 'bg-red-500 text-white border-red-400/60 shadow-sm shadow-red-500/30'
                                                            : 'bg-white/[0.04] text-slate-400 border-white/5 opacity-50'
                                                        }`}
                                                    style={{ animationDelay: active === 1 ? `${i * 60}ms` : '0ms' }}
                                                >
                                                    {d.label}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-3 rounded-lg bg-red-500/10 border border-red-400/20 py-1.5 px-2.5 flex items-center justify-between animate-[fadeSlideIn_0.4s_ease-out_0.3s_both]">
                                            <span className="text-[10px] font-bold text-slate-300">Work Week Plan</span>
                                            <span className="text-[10px] font-black text-red-300 bg-red-500/20 px-1.5 py-0.5 rounded">5 Days / Wk</span>
                                        </div>
                                    </PanelStep>

                                    {/* Step 3: Per-Day Customize */}
                                    <PanelStep visible={active === 2}>
                                        <PanelLabel>3. Swap Daily Items</PanelLabel>
                                        <div className="space-y-1.5 mt-2">
                                            {[
                                                { day: 'Mon', item: 'Paneer Makhani', sub: '2 Rotis + Rice' },
                                                { day: 'Tue', item: 'Yellow Dal Tadka', sub: 'Jeera Rice + Salad', active: true },
                                                { day: 'Wed', item: 'Kadhai Veg', sub: '3 Rotis' },
                                            ].map((row, i) => (
                                                <div
                                                    key={row.day}
                                                    className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 border transition-all animate-[fadeSlideIn_0.4s_ease-out_both] ${row.active
                                                            ? 'bg-red-500/15 border-red-400/40 text-white'
                                                            : 'bg-white/[0.03] border-white/5 text-slate-300'
                                                        }`}
                                                    style={{ animationDelay: active === 2 ? `${i * 100}ms` : '0ms' }}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-white/10 text-slate-200">{row.day}</span>
                                                        <span className="text-[11px] font-bold truncate max-w-[120px]">{row.item}</span>
                                                    </div>
                                                    {row.active ? (
                                                        <SlidersHorizontal size={12} className="text-red-400 shrink-0" />
                                                    ) : (
                                                        <span className="text-[9px] text-slate-400 font-medium">Custom</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </PanelStep>

                                    {/* Step 4: Confirm */}
                                    <PanelStep visible={active === 3}>
                                        <div className="h-full flex flex-col items-center justify-center text-center -mt-2">
                                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center animate-[popIn_0.4s_ease-out_both] mb-1.5">
                                                <Check size={18} strokeWidth={3} />
                                            </div>
                                            <span className="text-xs font-black text-white">Custom Tiffin Active</span>
                                            <span className="text-[10px] font-medium text-slate-400 mt-0.5 leading-tight">
                                                5 Days · 3 Meals · Zero Food Waste
                                            </span>
                                            <div className="mt-2.5 px-3 py-1 rounded-md bg-white/[0.06] border border-white/10 text-[9px] font-mono text-emerald-400">
                                                Doorstep delivery starts tomorrow
                                            </div>
                                        </div>
                                    </PanelStep>
                                </div>
                            </div>

                            {/* Interactive Pagination Dots */}
                            <div className="flex items-center gap-2 mt-3">
                                {STEPS.map((step, i) => (
                                    <button
                                        key={step.num}
                                        type="button"
                                        aria-label={`Show step ${i + 1}`}
                                        onClick={() => setActive(i)}
                                        className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${i === active ? 'w-5 bg-red-500' : 'w-1.5 bg-white/20 hover:bg-white/40'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Right: Compact Step Selector List */}
                        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {STEPS.map((step, i) => {
                                const isActive = i === active;
                                const Icon = step.icon;
                                return (
                                    <div
                                        key={step.num}
                                        onClick={() => setActive(i)}
                                        className={`relative text-left flex items-start gap-3 rounded-xl p-3 border transition-all duration-300 cursor-pointer select-none ${isActive
                                                ? 'bg-white/[0.07] border-red-500/50 shadow-md shadow-red-950/20'
                                                : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10'
                                            }`}
                                    >
                                        <span
                                            className={`shrink-0 mt-0.5 flex items-center justify-center w-7 h-7 rounded-lg transition-all ${isActive
                                                    ? 'bg-red-600 text-white shadow-sm shadow-red-600/40'
                                                    : 'bg-white/5 text-slate-400'
                                                }`}
                                        >
                                            <Icon size={14} />
                                        </span>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between">
                                                <span
                                                    className={`text-xs font-bold transition-colors ${isActive ? 'text-white' : 'text-slate-300'
                                                        }`}
                                                >
                                                    {step.num}. {step.label}
                                                </span>
                                                {isActive && (
                                                    <ChevronRight size={13} className="text-red-400 shrink-0" />
                                                )}
                                            </div>
                                            <p
                                                className={`text-[11px] leading-snug mt-0.5 transition-colors line-clamp-2 ${isActive ? 'text-slate-300' : 'text-slate-400'
                                                    }`}
                                            >
                                                {step.detail}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Scoped CSS Keyframes */}
                <style>{`
                    @keyframes fadeSlideIn {
                        from { opacity: 0; transform: translateY(6px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes popIn {
                        from { opacity: 0; transform: scale(0.85); }
                        to { opacity: 1; transform: scale(1); }
                    }
                    @keyframes scoopArm {
                        0%   { transform: rotate(0deg); }
                        30%  { transform: rotate(-34deg); }
                        50%  { transform: rotate(-34deg); }
                        75%  { transform: rotate(6deg); }
                        100% { transform: rotate(0deg); }
                    }
                    @keyframes foodDrop {
                        0%   { opacity: 0; transform: translate(0px, -14px) scale(0.5); }
                        35%  { opacity: 1; transform: translate(-2px, 2px) scale(1); }
                        60%  { opacity: 1; transform: translate(-2px, 2px) scale(1); }
                        100% { opacity: 0; transform: translate(-2px, 8px) scale(0.6); }
                    }
                    @keyframes stampCalendar {
                        0%   { transform: translateY(0) rotate(0deg); }
                        25%  { transform: translateY(-5px) rotate(-6deg); }
                        45%  { transform: translateY(3px) rotate(4deg); }
                        60%  { transform: translateY(0) rotate(0deg); }
                        100% { transform: translateY(0) rotate(0deg); }
                    }
                    @keyframes calendarCheck {
                        0%, 40% { opacity: 0; transform: scale(0.4); }
                        55% { opacity: 1; transform: scale(1.2); }
                        70% { transform: scale(0.95); }
                        100% { opacity: 1; transform: scale(1); }
                    }
                    @keyframes stirSpoon {
                        0%   { transform: rotate(-16deg); }
                        50%  { transform: rotate(16deg); }
                        100% { transform: rotate(-16deg); }
                    }
                    @keyframes stirArm {
                        0%   { transform: rotate(-6deg); }
                        50%  { transform: rotate(8deg); }
                        100% { transform: rotate(-6deg); }
                    }
                    @keyframes sparklePop {
                        0%, 100% { opacity: 0; transform: scale(0.4) rotate(0deg); }
                        50% { opacity: 1; transform: scale(1.1) rotate(25deg); }
                    }
                    @keyframes lidClose {
                        0%   { transform: translateY(-13px) rotate(-14deg); }
                        50%  { transform: translateY(-13px) rotate(-14deg); }
                        80%  { transform: translateY(1px) rotate(3deg); }
                        100% { transform: translateY(0px) rotate(0deg); }
                    }
                    @keyframes steamRise {
                        0%   { opacity: 0; transform: translateY(0) scaleX(0.9); }
                        30%  { opacity: 0.9; }
                        100% { opacity: 0; transform: translateY(-20px) scaleX(1.3); }
                    }
                    @keyframes thumbUp {
                        0%   { transform: rotate(35deg) scale(0.9); }
                        60%  { transform: rotate(-10deg) scale(1.05); }
                        100% { transform: rotate(-6deg) scale(1); }
                    }
                    @keyframes bobGentle {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-3px); }
                    }
                `}</style>
            </div>
        </div>
    );
}

function PanelLabel({ children }) {
    return (
        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1">
            {children}
        </span>
    );
}

function PanelStep({ visible, children }) {
    return (
        <div
            className={`transition-all duration-400 ease-out ${visible
                    ? 'opacity-100 translate-x-0 pointer-events-auto block'
                    : 'opacity-0 translate-x-2 pointer-events-none hidden'
                }`}
        >
            {children}
        </div>
    );
}

/**
 * TiffinCharacter Component
 * Illustrated chef who performs synchronized real-time actions per step.
 */
function TiffinCharacter({ step }) {
    return (
        <div key={step} className="relative w-[110px] h-[110px]" style={{ animation: 'bobGentle 2.6s ease-in-out infinite' }}>
            <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id="tierShade" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#000" stopOpacity="0" />
                        <stop offset="1" stopColor="#000" stopOpacity="0.45" />
                    </linearGradient>
                    <linearGradient id="metalGlow" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="50%" stopColor="#f87171" />
                        <stop offset="100%" stopColor="#dc2626" />
                    </linearGradient>
                </defs>

                {/* Ground soft shadow */}
                <ellipse cx="60" cy="104" rx="36" ry="5" fill="#000" opacity="0.4" />

                {/* Wooden Table Top */}
                <rect x="28" y="86" width="62" height="7" rx="2" fill="#451a03" />
                <rect x="34" y="93" width="6" height="11" rx="1" fill="#291102" />
                <rect x="78" y="93" width="6" height="11" rx="1" fill="#291102" />

                {/* 3-Tier Stainless Red Tiffin Box */}
                <g>
                    {/* Bottom Tier */}
                    <rect x="42" y="73" width="40" height="13" rx="3.5" fill="url(#metalGlow)" />
                    <rect x="42" y="73" width="40" height="13" rx="3.5" fill="url(#tierShade)" opacity="0.4" />
                    
                    {/* Middle Tier */}
                    <rect x="44" y="62" width="36" height="12" rx="3" fill="url(#metalGlow)" />
                    <rect x="44" y="62" width="36" height="12" rx="3" fill="url(#tierShade)" opacity="0.4" />

                    {/* Side Latches */}
                    <rect x="40" y="65" width="2.5" height="18" rx="1" fill="#e2e8f0" />
                    <rect x="79.5" y="65" width="2.5" height="18" rx="1" fill="#e2e8f0" />

                    {/* Animated Tiffin Lid */}
                    <g
                        style={{
                            transformOrigin: '62px 55px',
                            animation: step === 3 ? 'lidClose 1.2s ease-out both' : 'none',
                            transform: step === 3 ? 'translateY(0) rotate(0deg)' : 'translateY(-13px) rotate(-14deg)',
                        }}
                    >
                        <rect x="43" y="52" width="38" height="9" rx="3" fill="#fca5a5" />
                        {/* Top handle loop */}
                        <path d="M56 52 V44 Q62 40 68 44 V52" fill="none" stroke="#fca5a5" strokeWidth="2.5" strokeLinecap="round" />
                    </g>
                </g>

                {/* Steam plumes (Step 4 only) */}
                {step === 3 && (
                    <g className="pointer-events-none">
                        <path d="M52 46 q3 -7 0 -13" stroke="#fef08a" strokeWidth="2" fill="none" strokeLinecap="round"
                            style={{ animation: 'steamRise 1.6s ease-out 0.2s infinite' }} />
                        <path d="M62 46 q-3 -8 0 -15" stroke="#fef08a" strokeWidth="2" fill="none" strokeLinecap="round"
                            style={{ animation: 'steamRise 1.6s ease-out 0.6s infinite' }} />
                        <path d="M72 46 q3 -7 0 -13" stroke="#fef08a" strokeWidth="2" fill="none" strokeLinecap="round"
                            style={{ animation: 'steamRise 1.6s ease-out 1.0s infinite' }} />
                    </g>
                )}

                {/* Chef Character */}
                <g>
                    {/* Legs */}
                    <rect x="22" y="80" width="5.5" height="14" rx="2" fill="#0f172a" />
                    <rect x="29" y="80" width="5.5" height="14" rx="2" fill="#0f172a" />

                    {/* Torso / Clothes */}
                    <rect x="18" y="52" width="22" height="30" rx="6" fill="#1e293b" />
                    
                    {/* Apron */}
                    <path d="M20 56 h18 v20 q-9 4 -18 0 z" fill="#dc2626" />
                    <line x1="20" y1="56" x2="29" y2="50" stroke="#b91c1c" strokeWidth="1.5" />

                    {/* Head */}
                    <circle cx="29" cy="40" r="11" fill="#fbcfe8" />
                    
                    {/* Hair */}
                    <path d="M19 38 q2 -8 11 -8 q8 0 10 5 q-5 0 -9 2 z" fill="#451a03" />

                    {/* Chef Hat */}
                    <path d="M19 33 q-1 -10 10 -10 q11 0 10 10 q0 2 -2 2 h-16 q-2 0 -2 -2 z" fill="#ffffff" />
                    <rect x="18.5" y="32.5" width="21" height="3.5" rx="1" fill="#f1f5f9" />

                    {/* Happy Face */}
                    <circle cx="25" cy="40" r="1.3" fill="#1e293b" />
                    <circle cx="32" cy="40" r="1.3" fill="#1e293b" />
                    {/* Rosy Cheeks */}
                    <circle cx="23" cy="43" r="1.5" fill="#f43f5e" opacity="0.6" />
                    <circle cx="34" cy="43" r="1.5" fill="#f43f5e" opacity="0.6" />
                    {/* Smile */}
                    <path d="M26 44 q3 2.5 6 0" stroke="#1e293b" strokeWidth="1.3" fill="none" strokeLinecap="round" />

                    {/* Resting Left Arm */}
                    <rect x="14" y="56" width="5.5" height="14" rx="2.5" fill="#fbcfe8" />

                    {/* Dynamic Action Right Arm */}
                    <g style={{ transformOrigin: '38px 57px' }}>
                        {step === 0 && (
                            // Action 1: Scooping food into tiffin
                            <g style={{ animation: 'scoopArm 1.8s ease-in-out infinite' }}>
                                <rect x="36" y="56" width="6" height="18" rx="3" fill="#fbcfe8" />
                                <circle cx="39" cy="74" r="3.5" fill="#f59e0b" />
                            </g>
                        )}
                        {step === 1 && (
                            // Action 2: Stamping calendar
                            <g style={{ animation: 'stampCalendar 1.6s ease-in-out infinite' }}>
                                <rect x="36" y="56" width="6" height="16" rx="3" fill="#fbcfe8" />
                                <rect x="34" y="70" width="8" height="3" rx="1" fill="#dc2626" />
                            </g>
                        )}
                        {step === 2 && (
                            // Action 3: Stirring with spoon
                            <g style={{ animation: 'stirArm 1.4s ease-in-out infinite' }}>
                                <rect x="36" y="56" width="6" height="17" rx="3" fill="#fbcfe8" />
                                <g style={{ transformOrigin: '40px 72px', animation: 'stirSpoon 1.4s ease-in-out infinite' }}>
                                    <rect x="39" y="68" width="2" height="14" rx="1" fill="#cbd5e1" />
                                    <ellipse cx="40" cy="82" rx="3" ry="2" fill="#94a3b8" />
                                </g>
                            </g>
                        )}
                        {step === 3 && (
                            // Action 4: Excited Thumbs Up
                            <g style={{ transformOrigin: '38px 58px', animation: 'thumbUp 0.8s ease-out both' }}>
                                <rect x="36" y="54" width="6" height="13" rx="3" fill="#fbcfe8" />
                                <path d="M40 54 L44 50 Q45 49 44 48 Q43 47 41 49 L39 52 Z" fill="#fbcfe8" />
                            </g>
                        )}
                    </g>
                </g>

                {/* Floating Food Drop into Tier (Step 0) */}
                {step === 0 && (
                    <g style={{ animation: 'foodDrop 1.8s ease-in-out infinite' }}>
                        <circle cx="58" cy="53" r="3.5" fill="#fbbf24" />
                        <circle cx="58" cy="53" r="3.5" fill="none" stroke="#d97706" strokeWidth="0.8" />
                    </g>
                )}

                {/* Floating Calendar Badge with Green Check (Step 1) */}
                {step === 1 && (
                    <g transform="translate(86,22)">
                        <rect x="0" y="0" width="20" height="20" rx="3" fill="#ffffff" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))" />
                        <rect x="0" y="0" width="20" height="6" rx="2" fill="#dc2626" />
                        <g style={{ transformOrigin: '10px 13px', animation: 'calendarCheck 1.6s ease-in-out infinite' }}>
                            <path d="M5 13 l3.5 3.5 l7 -7" stroke="#16a34a" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </g>
                    </g>
                )}

                {/* Magic Seasoning Sparkles (Step 2) */}
                {step === 2 && (
                    <g transform="translate(84,26)" style={{ transformOrigin: '5px 5px', animation: 'sparklePop 1.4s ease-in-out infinite' }}>
                        <path d="M5 0 L6.2 3.5 L10 5 L6.2 6.5 L5 10 L3.8 6.5 L0 5 L3.8 3.5 Z" fill="#fbbf24" />
                    </g>
                )}
            </svg>
        </div>
    );
}