'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

const STEPS = [
    {
        step: '01',
        title: 'We Plan',
        description: 'Registered Dietitians build your weekly macro & calorie blueprint.',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
        alt: 'Dietitian planning personalized nutrition program',
    },
    {
        step: '02',
        title: 'We Shop',
        description: 'We source 100% whole foods, clean lean proteins, and organic produce.',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
        alt: 'Fresh whole food ingredients and vegetables',
    },
    {
        step: '03',
        title: 'We Cook',
        description: 'Executive chefs cook every entrée fresh from scratch—never frozen.',
        image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80',
        alt: 'Chef preparing fresh healthy meals in kitchen',
    },
    {
        step: '04',
        title: 'You Enjoy!',
        description: 'Heated in 3 minutes. Burn fat and reach your health goals effortlessly.',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        alt: 'Happy customer enjoying fresh healthy meal',
    },
];

export default function HowItWorks() {
    return (
        <section className="py-20 lg:py-24 bg-white relative overflow-hidden">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Section Header with Decorative Lines */}
                <div className="text-center max-w-3xl mx-auto mb-16">

                    {/* Title with Classic Flanking Rules */}
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <span className="hidden sm:block h-[2px] w-16 md:w-24 bg-gradient-to-r from-transparent to-[#3d3f96]/40" />
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#3d3f96] tracking-tight">
                            How It Works
                        </h2>
                        <span className="hidden sm:block h-[2px] w-16 md:w-24 bg-gradient-to-l from-transparent to-[#3d3f96]/40" />
                    </div>

                    {/* Scientific / Operational Description */}
                    <p className="text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed font-normal">
                        Our program helps adjust your body’s specific metabolic rate so that you can lose weight and successfully maintain it. The balanced nutrition in our entrées retrains your body to sustain healthy and effective fat loss. From our chefs preparing your meals in our kitchens to our Registered Dietitians planning your daily and weekly menus, all of the hard work is done for you—so you can eat healthy effortlessly.
                    </p>

                </div>

                {/* 4 Circular Steps Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
                    {STEPS.map((item, index) => (
                        <div
                            key={index}
                            className="group flex flex-col items-center text-center"
                        >
                            {/* Circular Image Container */}
                            <div className="relative mb-5 w-36 h-36 sm:w-44 sm:h-44 lg:w-48 lg:h-48 rounded-full p-1.5 bg-gradient-to-b from-[#3d3f96]/20 via-slate-100 to-transparent shadow-md group-hover:shadow-xl group-hover:from-red-500/30 transition-all duration-300">
                                <div className="w-full h-full rounded-full overflow-hidden relative ring-4 ring-white">
                                    <img
                                        src={item.image}
                                        alt={item.alt}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                                    />
                                    {/* Subtle Gradient Shadow */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>

                                {/* Step Number Pill */}
                                <span className="absolute -top-1 right-2 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#3d3f96] group-hover:bg-red-500 text-white text-xs font-black flex items-center justify-center shadow-md transition-colors duration-300">
                                    {item.step}
                                </span>
                            </div>

                            {/* Step Title */}
                            <h3 className="text-lg sm:text-xl font-bold font-serif text-[#3d3f96] group-hover:text-red-500 transition-colors">
                                {item.title}
                            </h3>

                            {/* Step Description */}
                            <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-normal max-w-[200px]">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Bottom Trust Micro-Bar */}
                <div className="mt-16 pt-8 border-t border-slate-100 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-semibold text-slate-600">
                    <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-red-500" />
                        No Cooking or Cleaning
                    </span>
                    <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-red-500" />
                        Physician-Formulated
                    </span>
                    <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-red-500" />
                        Fresh Nationwide Delivery
                    </span>
                </div>

            </div>
        </section>
    );
}