'use client';

import React from 'react';
import Link from 'next/link';

const PROGRAM_DETAILS = [
    {
        id: 'women',
        title: "Women's Health Program",
        tagline: 'Formulated for female metabolic rate and balanced vitality.',
        href: '/programs/women', // Change to your page path
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
        tag: "Women's Plan",
        specs: [
            { label: 'Caloric Range', value: '1,200 – 1,400 / day' },
            { label: 'Focus', value: 'Hormonal & Metabolic Balance' },
            { label: 'Sodium Level', value: '< 600mg per entrée' },
            { label: 'Dietitian Support', value: 'Included' },
        ],
    },
    {
        id: 'men',
        title: "Men's Health Program",
        tagline: 'Calibrated for higher lean mass maintenance and sustained energy.',
        href: '/programs/men', // Change to your page path
        image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
        tag: "Men's Plan",
        specs: [
            { label: 'Caloric Range', value: '1,500 – 1,800 / day' },
            { label: 'Focus', value: 'Lean Muscle & High Satiety' },
            { label: 'Sodium Level', value: '< 600mg per entrée' },
            { label: 'Dietitian Support', value: 'Included' },
        ],
    },
];

export default function GenderProgramDetails() {
    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="max-w-2xl mx-auto text-center mb-12">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                        Targeted Nutrition
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-[#3d3f96] mt-3 tracking-tight">
                        Explore Personalized Details
                    </h2>
                    <p className="mt-2 text-sm sm:text-base text-slate-500">
                        Select a program below to review the complete nutritional breakdown, weekly rotating menus, and pricing.
                    </p>
                </div>

                {/* 2-Column Detail Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {PROGRAM_DETAILS.map((item) => (
                        <Link
                            key={item.id}
                            href={item.href}
                            className="group block bg-slate-50 rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl hover:border-[#3d3f96] transition-all duration-300"
                        >
                            {/* Image Preview Banner */}
                            <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-100">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-[#3d3f96] text-xs font-bold px-3 py-1 rounded-full shadow">
                                    {item.tag}
                                </span>

                                <div className="absolute bottom-4 left-4 right-4">
                                    <h3 className="text-xl sm:text-2xl font-black text-white">
                                        {item.title}
                                    </h3>
                                </div>
                            </div>

                            {/* Detail Content */}
                            <div className="p-6 sm:p-7 space-y-5">
                                <p className="text-sm text-slate-600 font-medium">
                                    {item.tagline}
                                </p>

                                {/* Structured Specs Grid */}
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    {item.specs.map((spec, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-white p-3 rounded-xl border border-slate-200/70"
                                        >
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                                {spec.label}
                                            </p>
                                            <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                                                {spec.value}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Clickable CTA Trigger */}
                                <div className="pt-3 border-t border-slate-200/70 flex items-center justify-between">
                                    <span className="text-sm font-bold text-[#3d3f96] group-hover:text-red-500 transition-colors">
                                        View Full Details & Menu
                                    </span>
                                    <span className="w-8 h-8 rounded-full bg-[#3d3f96] group-hover:bg-red-500 text-white flex items-center justify-center transition-colors shadow-sm text-sm">
                                        →
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

            </div>
        </section>
    );
}