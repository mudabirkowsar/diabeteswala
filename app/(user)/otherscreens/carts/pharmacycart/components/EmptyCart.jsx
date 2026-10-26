// components/EmptyCart.jsx
"use client";
import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function EmptyCart() {
  return (
    <main className="min-h-screen bg-[#f8fbff] flex items-center justify-center py-12 px-4 antialiased text-left">
      <div className="bg-white rounded-[2.5rem] p-8 sm:p-14 text-center border border-slate-100 shadow-xl shadow-indigo-100/30 max-w-lg w-full space-y-6">
        <div className="bg-[#3d3f96]/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto text-[#3d3f96]">
          <ShoppingBag size={44} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Medicine Cart is Empty</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-2 leading-relaxed max-w-sm mx-auto">
            You don't have any medications queued for dispatch. Explore your nearby partner stores to find your prescribed items.
          </p>
        </div>
        <Link
          href="/pharmacy"
          className="inline-flex items-center justify-center gap-2 bg-[#3d3f96] hover:bg-[#2d2f75] text-white px-8 py-3.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-indigo-100"
        >
          Browse Catalog <ArrowRight size={16} />
        </Link>
      </div>
    </main>
  );
}