"use client";

import { useMemo, useState, useEffect } from "react";
import {
    FaWallet, FaBoxOpen, FaFileInvoiceDollar, FaExclamationCircle,
    FaPrescriptionBottleAlt, FaMicroscope, FaUserMd, FaHospital,
    FaSearch, FaFilter, FaEye, FaCheck, FaTimes, FaChevronDown,
} from "react-icons/fa";

/* =========================================================================
   DESIGN TOKENS
   Fintech-admin register: near-black ink for authority, one emerald accent
   for "money moving/approved", amber for "waiting", rose for "rejected".
   Theme color configured to #3D3F96.
   ========================================================================= */
const theme = {
    ink: "#0B1120",
    primary: "#3D3F96",      // Main theme color configured
    primarySoft: "#EEF2FF",  // Soft tint for the theme color
    emerald: "#10B981",
    emeraldSoft: "#ECFDF5",
    amber: "#F59E0B",
    amberSoft: "#FFFBEB",
    rose: "#F43F5E",
    roseSoft: "#FFF1F2",
    slate: "#64748B",
    canvas: "#F6F7FB",
};

/* =========================================================================
   DUMMY DATA — Pharmacy / Laboratory / Doctor / Clinic only (Reduced to 5)
   ========================================================================= */
const CATEGORY_META = {
    Pharmacy: { icon: <FaPrescriptionBottleAlt />, color: "#0EA5E9", bg: "#E0F2FE" },
    Laboratory: { icon: <FaMicroscope />, color: "#2563EB", bg: "#DBEAFE" },
    Doctor: { icon: <FaUserMd />, color: "#F97316", bg: "#FFEDD5" },
    Clinic: { icon: <FaHospital />, color: theme.primary, bg: theme.primarySoft }, // Configured with theme color
};

const seedRequests = [
    { id: "r1", date: "Jul 6, 2026, 03:24 PM", vendor: "Mudabir Kowsar", email: "lab@gmail.com", category: "Laboratory", bankName: "ICICI", acc: "1234567890", ifsc: "ICIC0001234", amount: 200, status: "pending", verified: true },
    { id: "r2", date: "Jul 4, 2026, 11:05 AM", vendor: "MedPlus Pharmacy", email: "medplus@gmail.com", category: "Pharmacy", bankName: "HDFC Bank", acc: "5010023456", ifsc: "HDFC0000123", amount: 640, status: "pending", verified: false },
    { id: "r3", date: "Jun 28, 2026, 10:38 PM", vendor: "Omninos clinic", email: "clinic@gmail.com", category: "Clinic", bankName: "HDFC", acc: "1234567", ifsc: "HDFC0001234", amount: 100000, status: "pending", verified: false },
    { id: "r4", date: "Jun 28, 2026, 02:02 PM", vendor: "Omninos Clinic", email: "clinic.hosp@gmail.com", category: "Clinic", bankName: "HDFC", acc: "1234567", ifsc: "HDFC0001234", amount: 500, status: "approved", verified: true },
    { id: "r5", date: "Jun 25, 2026, 09:14 AM", vendor: "Dr. Ritika Sharma", email: "ritika.sharma@gmail.com", category: "Doctor", bankName: "Axis Bank", acc: "9120034567", ifsc: "UTIB0001122", amount: 300, status: "rejected", verified: true },
];

const statusMeta = {
    pending: { label: "Pending", color: theme.amber, bg: theme.amberSoft },
    approved: { label: "Approved", color: theme.emerald, bg: theme.emeraldSoft },
    rejected: { label: "Rejected", color: theme.rose, bg: theme.roseSoft },
};

/* =========================================================================
   UTILITIES
   ========================================================================= */
function useCountUp(target, active, duration = 900) {
    const [value, setValue] = useState(0);
    useEffect(() => {
        if (!active) return;
        let raf, start;
        const step = (t) => {
            if (!start) start = t;
            const p = Math.min((t - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setValue(eased * target);
            if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [active, target, duration]);
    return value;
}

function formatINR(n) {
    return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

/* =========================================================================
   SUMMARY CARD
   ========================================================================= */
function SummaryCard({ icon, iconBg, label, badge, badgeColor, badgeBg, value, delay, active }) {
    const isNumeric = typeof value === "number";
    const display = useCountUp(isNumeric ? value : 0, active && isNumeric, 1000);
    return (
        <div
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_10px_30px_rgb(11,17,32,0.03)] hover:shadow-[0_18px_45px_rgb(11,17,32,0.07)] hover:-translate-y-0.5 transition-all duration-400"
            style={{
                opacity: active ? 1 : 0,
                transform: active ? "translateY(0)" : "translateY(12px)",
                transition: `opacity 550ms ease ${delay}ms, transform 550ms cubic-bezier(.16,1,.3,1) ${delay}ms, box-shadow 300ms ease, translate 300ms ease`,
            }}
        >
            <div className="flex items-center justify-between mb-6">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: iconBg, color: badgeColor }}>
                    {icon}
                </div>
                <span
                    className="px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap"
                    style={{ backgroundColor: badgeBg, color: badgeColor }}
                >
                    {badge}
                </span>
            </div>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.slate }}>{label}</p>
            <p className="text-[28px] font-black mt-1 tabular-nums" style={{ color: theme.ink }}>
                {isNumeric ? formatINR(display) : value}
            </p>
        </div>
    );
}

/* =========================================================================
   CATEGORY CARD
   ========================================================================= */
function CategoryCard({ name, amount, delay, active }) {
    const meta = CATEGORY_META[name];
    const display = useCountUp(amount, active, 900);
    return (
        <div
            className="bg-white rounded-2xl px-5 py-6 border border-gray-100 shadow-[0_8px_24px_rgb(11,17,32,0.03)] hover:shadow-[0_14px_36px_rgb(11,17,32,0.06)] hover:-translate-y-0.5 transition-all duration-400 flex flex-col items-center text-center gap-3"
            style={{
                opacity: active ? 1 : 0,
                transform: active ? "translateY(0)" : "translateY(12px)",
                transition: `opacity 500ms ease ${delay}ms, transform 500ms cubic-bezier(.16,1,.3,1) ${delay}ms, box-shadow 300ms ease, translate 300ms ease`,
            }}
        >
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: meta.bg, color: meta.color }}>
                {meta.icon}
            </div>
            <div>
                <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: theme.slate }}>{name}</p>
                <p className="text-lg font-black tabular-nums mt-0.5" style={{ color: theme.ink }}>{formatINR(display)}</p>
            </div>
        </div>
    );
}

/* =========================================================================
   MAIN COMPONENT
   ========================================================================= */
export default function PendingWithdrawals() {
    const [requests, setRequests] = useState(seedRequests);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All Categories");
    const [filterOpen, setFilterOpen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setIsLoaded(true), 120);
        return () => clearTimeout(t);
    }, []);

    const categories = ["All Categories", "Pharmacy", "Laboratory", "Doctor", "Clinic"];

    const filtered = useMemo(() => {
        return requests.filter((r) => {
            const matchesCategory = category === "All Categories" || r.category === category;
            const q = search.trim().toLowerCase();
            const matchesSearch =
                !q ||
                r.vendor.toLowerCase().includes(q) ||
                r.email.toLowerCase().includes(q) ||
                r.bankName.toLowerCase().includes(q);
            return matchesCategory && matchesSearch;
        });
    }, [requests, search, category]);

    const totals = useMemo(() => {
        const liability = requests.reduce((s, r) => s + r.amount, 0);
        const pending = requests.filter((r) => r.status === "pending").reduce((s, r) => s + r.amount, 0);
        const approved = requests.filter((r) => r.status === "approved").reduce((s, r) => s + r.amount, 0);
        const rejected = requests.filter((r) => r.status === "rejected").reduce((s, r) => s + r.amount, 0);
        const awaitingVerification = requests.filter((r) => !r.verified).length;
        const pendingCount = requests.filter((r) => r.status === "pending").length;
        const approvedCount = requests.filter((r) => r.status === "approved").length;
        return { liability, pending, approved, rejected, awaitingVerification, pendingCount, approvedCount };
    }, [requests]);

    const categoryTotals = useMemo(() => {
        const map = { Pharmacy: 0, Laboratory: 0, Doctor: 0, Clinic: 0 };
        requests.forEach((r) => { map[r.category] += r.amount; });
        return map;
    }, [requests]);

    const setStatus = (id, status) => {
        setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    };

    // proportion bar segments
    const total = totals.liability || 1;
    const segments = [
        { key: "approved", pct: (totals.approved / total) * 100, color: theme.emerald },
        { key: "pending", pct: (totals.pending / total) * 100, color: theme.amber },
        { key: "rejected", pct: (totals.rejected / total) * 100, color: theme.rose },
    ];

    return (
        <div className="min-h-screen" style={{ backgroundColor: theme.canvas }}>
            <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">

                {/* HEADER */}
                <div>
                    <h1 className="text-3xl font-black tracking-tight" style={{ color: theme.ink }}>
                        PENDING <span style={{ color: theme.primary }}>WITHDRAWALS</span>
                    </h1>
                    <p className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: theme.slate }}>
                        Platform Settlements &amp; Financial Administration
                    </p>
                </div>

                {/* SUMMARY CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <SummaryCard
                        icon={<FaWallet />} iconBg={theme.primarySoft} badgeColor={theme.primary} badgeBg={theme.primarySoft}
                        label="Platform Liability" badge="Total Liability" value={totals.liability}
                        delay={0} active={isLoaded}
                    />
                    <SummaryCard
                        icon={<FaBoxOpen />} iconBg={theme.amberSoft} badgeColor={theme.amber} badgeBg={theme.amberSoft}
                        label="Pending Amount" badge={`${totals.pendingCount} Request${totals.pendingCount === 1 ? "" : "s"}`} value={totals.pending}
                        delay={70} active={isLoaded}
                    />
                    <SummaryCard
                        icon={<FaFileInvoiceDollar />} iconBg={theme.emeraldSoft} badgeColor={theme.emerald} badgeBg={theme.emeraldSoft}
                        label="Approved Amount" badge={`${totals.approvedCount} Settled`} value={totals.approved}
                        delay={140} active={isLoaded}
                    />
                    <SummaryCard
                        icon={<FaExclamationCircle />} iconBg={theme.roseSoft} badgeColor={theme.rose} badgeBg={theme.roseSoft}
                        label="Bank Verifications" badge={`${totals.awaitingVerification} Awaiting`} value={`${totals.awaitingVerification} Awaiting`}
                        delay={210} active={isLoaded}
                    />
                </div>

                {/* SETTLEMENT PROPORTION BAR — structure encodes real split of liability */}
                <div
                    className="bg-white rounded-2xl px-6 py-5 border border-gray-100 shadow-[0_8px_24px_rgb(11,17,32,0.03)]"
                    style={{ opacity: isLoaded ? 1 : 0, transition: "opacity 600ms ease 260ms" }}
                >
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.slate }}>Settlement Breakdown</p>
                        <div className="flex items-center gap-4 text-[11px] font-bold">
                            <span className="flex items-center gap-1.5" style={{ color: theme.emerald }}><span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.emerald }} />Approved</span>
                            <span className="flex items-center gap-1.5" style={{ color: theme.amber }}><span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.amber }} />Pending</span>
                            <span className="flex items-center gap-1.5" style={{ color: theme.rose }}><span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.rose }} />Rejected</span>
                        </div>
                    </div>
                    <div className="w-full h-3 rounded-full overflow-hidden flex bg-gray-100">
                        {segments.map((s) => (
                            <div
                                key={s.key}
                                style={{
                                    width: isLoaded ? `${s.pct}%` : "0%",
                                    backgroundColor: s.color,
                                    transition: "width 1000ms cubic-bezier(.16,1,.3,1) 350ms",
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* CATEGORY CARDS — Pharmacy / Laboratory / Doctor / Clinic only */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {Object.keys(CATEGORY_META).map((name, i) => (
                        <CategoryCard key={name} name={name} amount={categoryTotals[name]} delay={300 + i * 60} active={isLoaded} />
                    ))}
                </div>

                {/* PAYOUT REQUESTS */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_10px_30px_rgb(11,17,32,0.03)] overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-5 border-b border-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: theme.primary }}>
                                <FaFileInvoiceDollar />
                            </div>
                            <h2 className="text-lg font-black tracking-tight" style={{ color: theme.ink }}>
                                PAYOUT <span style={{ color: theme.primary }}>REQUESTS</span>
                            </h2>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: theme.slate }} />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search Name, Email, Bank..."
                                    className="pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-sm font-medium outline-none focus:ring-1 focus:ring-[#3D3F96]/30 focus:border-[#3D3F96] transition-all w-56"
                                />
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => setFilterOpen((v) => !v)}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-sm font-bold uppercase tracking-wide hover:bg-gray-100 transition-all"
                                    style={{ color: theme.slate }}
                                >
                                    <FaFilter className="text-xs" /> {category} <FaChevronDown className="text-[10px]" />
                                </button>
                                {filterOpen && (
                                    <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl border border-gray-100 shadow-lg py-1.5 z-10">
                                        {categories.map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => { setCategory(c); setFilterOpen(false); }}
                                                className="w-full text-left px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition-colors"
                                                style={{ color: category === c ? theme.primary : theme.ink }}
                                            >
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[900px]">
                            <thead>
                                <tr className="text-[11px] font-bold uppercase tracking-wider" style={{ color: theme.slate }}>
                                    <th className="text-left px-6 py-3">Request Date</th>
                                    <th className="text-left px-6 py-3">Vendor Identity</th>
                                    <th className="text-left px-6 py-3">Category</th>
                                    <th className="text-left px-6 py-3">Bank Details</th>
                                    <th className="text-right px-6 py-3">Requested Sum</th>
                                    <th className="text-center px-6 py-3">Settlement Status</th>
                                    <th className="text-center px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((r, i) => {
                                    const meta = CATEGORY_META[r.category];
                                    const sMeta = statusMeta[r.status];
                                    return (
                                        <tr
                                            key={r.id}
                                            className="border-t border-gray-50 hover:bg-gray-50/70 transition-colors duration-200"
                                            style={{
                                                opacity: isLoaded ? 1 : 0,
                                                transform: isLoaded ? "translateY(0)" : "translateY(8px)",
                                                transition: `opacity 400ms ease ${400 + i * 50}ms, transform 400ms ease ${400 + i * 50}ms`,
                                            }}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold" style={{ color: theme.slate }}>{r.date}</td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold" style={{ color: theme.ink }}>{r.vendor}</p>
                                                <p className="text-xs" style={{ color: theme.slate }}>{r.email}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide" style={{ backgroundColor: meta.bg, color: meta.color }}>
                                                    {meta.icon} {r.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs" style={{ color: theme.slate }}>
                                                <p className="font-bold" style={{ color: theme.ink }}>{r.bankName}</p>
                                                <p>A/C: {r.acc}</p>
                                                <p>IFSC: {r.ifsc}</p>
                                            </td>
                                            <td className="px-6 py-4 text-right font-black tabular-nums" style={{ color: theme.ink }}>
                                                {formatINR(r.amount)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span
                                                    className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide transition-all duration-300"
                                                    style={{ backgroundColor: sMeta.bg, color: sMeta.color }}
                                                >
                                                    {sMeta.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-3 text-sm">
                                                    <button aria-label="View" className="hover:scale-110 transition-transform" style={{ color: theme.slate }}>
                                                        <FaEye />
                                                    </button>
                                                    <button
                                                        aria-label="Approve"
                                                        onClick={() => setStatus(r.id, "approved")}
                                                        className="hover:scale-110 transition-transform disabled:opacity-30"
                                                        disabled={r.status === "approved"}
                                                        style={{ color: theme.emerald }}
                                                    >
                                                        <FaCheck />
                                                    </button>
                                                    <button
                                                        aria-label="Reject"
                                                        onClick={() => setStatus(r.id, "rejected")}
                                                        className="hover:scale-110 transition-transform disabled:opacity-30"
                                                        disabled={r.status === "rejected"}
                                                        style={{ color: theme.rose }}
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-sm font-semibold" style={{ color: theme.slate }}>
                                            No payout requests match your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}