"use client";

import { useMemo, useState, useEffect } from "react";
import {
    FaUsers, FaUserCheck, FaSearch, FaEye, FaPen, FaEllipsisH,
    FaBriefcase, FaCalendarAlt, FaCircle,
} from "react-icons/fa";

/* =========================================================================
   DESIGN TOKENS — indigo identity, shared with the rest of the admin suite
   ========================================================================= */
const theme = {
    primary: "#3D3F96",
    primaryDark: "#2C2D75",
    primaryDeep: "#1E1B4B",
    primarySoft: "#EEF0FC",
    primaryGlow: "#6366F1",
    slate: "#64748B",
    canvas: "#F6F7FB",
    live: "#10B981",
    liveSoft: "#ECFDF5",
    idle: "#CBD5E1",
};

// small rotating avatar-gradient palette so initials never look flat/repetitive
const AVATAR_RAMPS = [
    ["#3D3F96", "#6366F1"],
    ["#0EA5E9", "#0284C7"],
    ["#F97316", "#EA580C"],
    ["#10B981", "#059669"],
    ["#EC4899", "#DB2777"],
    ["#8B5CF6", "#7C3AED"],
];

/* =========================================================================
   DUMMY DATA — 11 personnel records, distinct names + richer detail
   ========================================================================= */
const seedUsers = [
    { id: "u1", name: "Priya Nair", handle: "priya.nair", email: "priya.nair@omninos.com", phone: "+91 98220 14563", role: "Vendor Operations", dept: "Operations", joined: "Jan 12, 2026", lastActive: "2 min ago", active: true },
    { id: "u2", name: "Rohan Mehta", handle: "rohan.mehta", email: "rohan.mehta@omninos.com", phone: "+91 90210 44987", role: "Finance Analyst", dept: "Finance", joined: "Nov 3, 2025", lastActive: "14 min ago", active: true },
    { id: "u3", name: "Kavya Iyer", handle: "kavya.iyer", email: "kavya.iyer@omninos.com", phone: "+91 87654 33210", role: "Support Lead", dept: "Customer Success", joined: "Mar 27, 2026", lastActive: "1 hr ago", active: true },
    { id: "u4", name: "Siddharth Rao", handle: "sid.rao", email: "sid.rao@omninos.com", phone: "+91 99887 65123", role: "Platform Admin", dept: "Engineering", joined: "Jul 19, 2025", lastActive: "3 hr ago", active: false },
    { id: "u5", name: "Meera Kapoor", handle: "meera.kapoor", email: "meera.kapoor@omninos.com", phone: "+91 91234 56780", role: "Compliance Officer", dept: "Legal", joined: "Feb 8, 2026", lastActive: "Just now", active: true },
    { id: "u6", name: "Vikram Desai", handle: "vikram.desai", email: "vikram.desai@omninos.com", phone: "+91 98765 12340", role: "Vendor Manager", dept: "Operations", joined: "Sep 14, 2025", lastActive: "5 min ago", active: true },
    { id: "u7", name: "Neha Joshi", handle: "neha.joshi", email: "neha.joshi@omninos.com", phone: "+91 90909 87654", role: "Support Agent", dept: "Customer Success", joined: "Apr 2, 2026", lastActive: "22 min ago", active: true },
    { id: "u8", name: "Arjun Malhotra", handle: "arjun.malhotra", email: "arjun.malhotra@omninos.com", phone: "+91 99001 23456", role: "Finance Manager", dept: "Finance", joined: "Dec 30, 2025", lastActive: "6 hr ago", active: false },
    { id: "u9", name: "Isha Bansal", handle: "isha.bansal", email: "isha.bansal@omninos.com", phone: "+91 88776 65544", role: "Data Analyst", dept: "Engineering", joined: "Jun 5, 2026", lastActive: "18 min ago", active: true },
    { id: "u10", name: "Karan Chopra", handle: "karan.chopra", email: "karan.chopra@omninos.com", phone: "+91 97531 08642", role: "Onboarding Specialist", dept: "Operations", joined: "Jan 29, 2026", lastActive: "1 min ago", active: true },
    { id: "u11", name: "Tanvi Shah", handle: "tanvi.shah", email: "tanvi.shah@omninos.com", phone: "+91 90123 45678", role: "Support Agent", dept: "Customer Success", joined: "May 16, 2026", lastActive: "9 min ago", active: true },
];

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
            setValue((1 - Math.pow(1 - p, 3)) * target);
            if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active, target]);
    return value;
}

function initialsOf(name) {
    const parts = name.trim().split(" ");
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
}

function rampFor(index) {
    return AVATAR_RAMPS[index % AVATAR_RAMPS.length];
}

/* =========================================================================
   STAT PILL (top-right)
   ========================================================================= */
function StatPill({ icon, iconBg, iconColor, label, value, active, delay }) {
    const display = useCountUp(value, active, 800);
    return (
        <div
            className="flex items-center gap-3 bg-white rounded-2xl px-5 py-3 border border-gray-100 shadow-[0_8px_24px_rgb(11,17,32,0.04)]"
            style={{
                opacity: active ? 1 : 0,
                transform: active ? "translateY(0)" : "translateY(-8px)",
                transition: `opacity 500ms ease ${delay}ms, transform 500ms cubic-bezier(.16,1,.3,1) ${delay}ms`,
            }}
        >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm" style={{ backgroundColor: iconBg, color: iconColor }}>
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.slate }}>{label}</p>
                <p className="text-xl font-black tabular-nums leading-tight" style={{ color: theme.primaryDeep }}>{Math.round(display)}</p>
            </div>
        </div>
    );
}

/* =========================================================================
   MAIN COMPONENT
   ========================================================================= */
export default function UserRegistry() {
    const [users, setUsers] = useState(seedUsers);
    const [search, setSearch] = useState("");
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setIsLoaded(true), 120);
        return () => clearTimeout(t);
    }, []);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return users;
        return users.filter(
            (u) =>
                u.name.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q) ||
                u.phone.includes(q) ||
                u.role.toLowerCase().includes(q) ||
                u.dept.toLowerCase().includes(q)
        );
    }, [users, search]);

    const liveCount = users.filter((u) => u.active).length;

    const toggleActive = (id) => {
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u)));
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: theme.canvas }}>
            <div className="max-w-7xl mx-auto px-6 py-10 space-y-6">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black italic tracking-tight" style={{ color: theme.primaryDeep }}>
                            USER REGISTRY
                        </h1>
                        <p className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: theme.slate }}>
                            Personnel Management Center
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <StatPill
                            icon={<FaUsers />} iconBg={theme.primarySoft} iconColor={theme.primary}
                            label="Total Users" value={users.length} active={isLoaded} delay={0}
                        />
                        <StatPill
                            icon={<FaUserCheck />} iconBg={theme.liveSoft} iconColor={theme.live}
                            label="Live Now" value={liveCount} active={isLoaded} delay={80}
                        />
                    </div>
                </div>

                {/* REGISTRY PANEL */}
                <div
                    className="bg-white rounded-2xl border border-gray-100 shadow-[0_10px_30px_rgb(11,17,32,0.03)] overflow-hidden"
                    style={{ opacity: isLoaded ? 1 : 0, transition: "opacity 500ms ease 140ms" }}
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 border-b border-gray-50">
                        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.slate }}>
                            Discoveries: <span style={{ color: theme.primaryDeep }}>{filtered.length}</span>
                        </p>
                        <div className="relative">
                            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: theme.slate }} />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search records..."
                                className="pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-sm font-medium outline-none focus:ring-1 focus:border-[#3D3F96] transition-all w-64"
                                style={{ "--tw-ring-color": `${theme.primary}4D` }}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[1000px]">
                            <thead>
                                <tr className="text-[11px] font-bold uppercase tracking-wider" style={{ color: theme.slate }}>
                                    <th className="text-left px-6 py-3">Identity</th>
                                    <th className="text-left px-6 py-3">Contact Details</th>
                                    <th className="text-left px-6 py-3">Role &amp; Department</th>
                                    <th className="text-left px-6 py-3">Joined</th>
                                    <th className="text-left px-6 py-3">Last Active</th>
                                    <th className="text-center px-6 py-3">Status</th>
                                    <th className="text-center px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((u, i) => {
                                    const [c1, c2] = rampFor(i);
                                    return (
                                        <tr
                                            key={u.id}
                                            className="border-t border-gray-50 hover:bg-gray-50/70 transition-colors duration-200"
                                            style={{
                                                opacity: isLoaded ? 1 : 0,
                                                transform: isLoaded ? "translateY(0)" : "translateY(8px)",
                                                transition: `opacity 400ms ease ${220 + i * 45}ms, transform 400ms ease ${220 + i * 45}ms`,
                                            }}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-black shrink-0 shadow-sm"
                                                        style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
                                                    >
                                                        {initialsOf(u.name)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold" style={{ color: theme.primaryDeep }}>{u.name}</p>
                                                        <p className="text-xs" style={{ color: theme.slate }}>@{u.handle}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs font-semibold" style={{ color: theme.slate }}>{u.email}</p>
                                                <p className="text-xs font-bold" style={{ color: theme.primary }}>{u.phone}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-semibold flex items-center gap-1.5" style={{ color: theme.primaryDeep }}>
                                                    <FaBriefcase className="text-[11px]" style={{ color: theme.primary }} /> {u.role}
                                                </p>
                                                <p className="text-xs mt-0.5" style={{ color: theme.slate }}>{u.dept}</p>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-semibold whitespace-nowrap" style={{ color: theme.slate }}>
                                                <span className="flex items-center gap-1.5">
                                                    <FaCalendarAlt className="text-[11px]" style={{ color: theme.primary }} /> {u.joined}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-semibold whitespace-nowrap">
                                                <span className="flex items-center gap-1.5" style={{ color: u.lastActive === "Just now" || u.lastActive.includes("min") ? theme.live : theme.slate }}>
                                                    <FaCircle className="text-[6px]" /> {u.lastActive}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center">
                                                    <button
                                                        onClick={() => toggleActive(u.id)}
                                                        aria-label="Toggle status"
                                                        className="relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none"
                                                        style={{ backgroundColor: u.active ? theme.live : theme.idle }}
                                                    >
                                                        <span
                                                            className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300"
                                                            style={{ left: u.active ? "22px" : "2px" }}
                                                        />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        aria-label="View"
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                                                        style={{ backgroundColor: theme.primarySoft, color: theme.primary }}
                                                    >
                                                        <FaEye className="text-xs" />
                                                    </button>
                                                    <button
                                                        aria-label="Edit"
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                                                        style={{ backgroundColor: "#FFF7ED", color: "#F97316" }}
                                                    >
                                                        <FaPen className="text-xs" />
                                                    </button>
                                                    <button
                                                        aria-label="More"
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                                                        style={{ backgroundColor: "#F1F5F9", color: theme.slate }}
                                                    >
                                                        <FaEllipsisH className="text-xs" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-sm font-semibold" style={{ color: theme.slate }}>
                                            No records match your search.
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