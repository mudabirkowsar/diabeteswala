"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Siren, ArrowRight } from "lucide-react";

export default function AmbulanceButton() {
    const pathname = usePathname();

    // Hide on the buy/checkout product page and ambulance page
    if (
        pathname === "/shop/cgmdevices/buyproduct" ||
        pathname === "/shop/cgmdevices/devicedetail" ||
        pathname === " /doctor/doctordetail/" ||
        pathname?.startsWith("/shop/cgmdevices/buyproduct") ||
        pathname?.startsWith("/shop/cgmdevices/devicedetail") ||
        pathname?.startsWith("/doctor/doctordetail") ||
        pathname === "/ambulance"
    ) {
        return null;
    }

    return (
        <div className="fixed bottom-4 left-3 sm:bottom-6 sm:left-6 z-50 group select-none">
            {/* Outer Radiant Glow Rings */}
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 opacity-70 blur-md group-hover:opacity-100 group-hover:blur-lg transition-all duration-500 animate-pulse pointer-events-none" />

            <Link
                href="/ambulance"
                className="relative flex items-center p-2.5 sm:gap-3 sm:pl-3.5 sm:pr-4 sm:py-3 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white rounded-full shadow-[0_10px_30px_rgba(225,29,72,0.4)] hover:shadow-[0_15px_40px_rgba(225,29,72,0.6)] border border-white/25 backdrop-blur-md transition-all duration-300 transform group-hover:scale-105 group-hover:-translate-y-1 active:scale-95 overflow-hidden"
                aria-label="Book Emergency Ambulance Service"
            >
                {/* Shimmer Light Reflection Effect on Hover */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                {/* Pulsing Emergency Siren Icon Circle */}
                <div className="relative w-10 h-10 sm:w-10 sm:h-10 rounded-full bg-white/15 border border-white/30 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-white group-hover:text-rose-600 transition-colors duration-300">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-60 pointer-events-none" />
                    <Siren className="w-5 h-5 text-white group-hover:text-rose-600 animate-bounce duration-700 transition-colors" />
                </div>

                {/* Text Content - HIDDEN on mobile, SHOWN on sm+ screens */}
                <div className="hidden sm:flex flex-col text-left pr-0.5 sm:pr-1">
                    <div className="flex items-center gap-1.5 leading-none mb-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-rose-100/90 font-mono">
                            24/7 Rapid SOS
                        </span>
                    </div>
                    <span className="text-sm font-black tracking-wide text-white drop-shadow-sm uppercase whitespace-nowrap">
                        Book Ambulance
                    </span>
                </div>

                {/* Interactive Micro Arrow - HIDDEN on mobile, SHOWN on sm+ screens */}
                <div className="hidden sm:flex w-6 h-6 rounded-full bg-white/20 items-center justify-center shrink-0 group-hover:bg-white group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all duration-300">
                    <ArrowRight className="w-3.5 h-3.5" />
                </div>
            </Link>
        </div>
    );
}