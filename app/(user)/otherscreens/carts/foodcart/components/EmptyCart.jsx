"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function EmptyCart() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#f8fbff] flex flex-col items-center justify-center p-6 text-center antialiased select-none">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-5 border border-slate-200/60">
                <ShoppingBag size={36} className="text-slate-300" />
            </div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Your Food Tray is Empty</h1>
            <p className="text-slate-400 text-xs font-semibold mt-1.5 max-w-xs leading-relaxed">
                You haven't added any clinical wellness formulations to your tray yet. Explore our nearest kitchen menus to begin.
            </p>
            <button
                type="button"
                onClick={() => router.push('/food/nearest')}
                className="mt-6 inline-flex items-center gap-2 bg-[#3d3f96] hover:bg-[#2d2f75] text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-indigo-950/15"
            >
                <span>Explore Healthy Meals</span>
                <ArrowRight size={14} />
            </button>
        </div>
    );
}