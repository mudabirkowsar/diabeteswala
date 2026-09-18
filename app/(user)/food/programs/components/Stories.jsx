'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
    ChevronLeft, 
    ChevronRight, 
    Star, 
    CheckCircle2, 
    Sparkles, 
    Quote,
    ArrowRight
} from 'lucide-react';

const SUCCESS_STORIES = [
    {
        id: 'david',
        name: 'David S.',
        age: 37,
        lostWeight: '280 lbs',
        timeframe: 'In 18 months',
        category: "Men's Health",
        headline: 'Successful Weight Loss Program Built For a Man',
        quote: 'I didn’t just lose 280 lbs—I regained my mobility, reversed my health markers, and completely transformed my relationship with food.',
        description:
            'Men need a weight loss program that works as hard as they do. Designed with over 20 years of clinical physician experience, this program does the heavy lifting for you. Not only do we handle the nutrition and chef preparation, the science behind our success lies in targeted metabolic correction—helping you burn stubborn fat while preserving lean muscle for permanent results.',
        beforeImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
        afterImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
        promoRibbon: 'Get 50% OFF & FREE Shipping on Your First Order',
        ctaText: "GET STARTED WITH MEN'S PLAN",
        ctaLink: '/food/programs/men',
    },
    {
        id: 'sarah',
        name: 'Sarah M.',
        age: 42,
        lostWeight: '85 lbs',
        timeframe: 'In 9 months',
        category: "Women's Health",
        headline: 'Physician-Designed Fat Loss for Female Biology',
        quote: 'After battling hormonal weight gain and restrictive calorie counting for years, this metabolic sync program gave me my confidence back.',
        description:
            'Female metabolic balance requires steady blood glucose and balanced cortisol. Our doctor-curated meal tracks are rich in clean phyto-nutrients, healthy fats, and exact micronutrient ratios so you experience consistent fat loss without hunger, fatigue, or thyroid crashes.',
        beforeImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
        afterImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        promoRibbon: 'Get 50% OFF & FREE Shipping on Your First Order',
        ctaText: "GET STARTED WITH WOMEN'S PLAN",
        ctaLink: '/food/programs/women',
    },
    {
        id: 'marcus',
        name: 'Marcus T.',
        age: 48,
        lostWeight: '115 lbs',
        timeframe: 'In 12 months',
        category: "Men's Health",
        headline: 'Reversing Metabolic Resistance & Restoring Vitality',
        quote: 'My doctor was stunned by my blood work. My cholesterol, blood sugar, and visceral fat numbers dropped back to normal.',
        description:
            'You don’t have to spend hours in the kitchen measuring macros. Every meal arrives ready to enjoy, perfectly portioned with high-satiety lean protein and low-glycemic carbs to reset insulin sensitivity and fuel high-energy daily performance.',
        beforeImage: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80',
        afterImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
        promoRibbon: 'Get 50% OFF & FREE Shipping on Your First Order',
        ctaText: "GET STARTED WITH MEN'S PLAN",
        ctaLink: '/food/programs/men',
    }
];

export default function Stories() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const story = SUCCESS_STORIES[currentIndex];

    const nextStory = () => {
        setCurrentIndex((prev) => (prev + 1) % SUCCESS_STORIES.length);
    };

    const prevStory = () => {
        setCurrentIndex((prev) => (prev - 1 + SUCCESS_STORIES.length) % SUCCESS_STORIES.length);
    };

    return (
        <section className="py-10 bg-[#FAFDFB] overflow-hidden relative">
            {/* Ambient Background Accents */}
            <div className="absolute top-1/2 -left-40 w-96 h-96 bg-[#3d3f96]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/3 -right-40 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">

                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-red-50 text-red-500 border border-red-200 mb-3 shadow-xs">
                        <Sparkles className="w-3.5 h-3.5 text-red-500" />
                        Real Patient Transformations
                    </div>
                    
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                        Proven Results. <span className="text-[#3d3f96]">Clinically Backed.</span>
                    </h2>
                    
                    <p className="mt-3 text-sm sm:text-base text-slate-600">
                        Thousands of men and women have transformed their health with our physician-formulated meal blueprints.
                    </p>

                    {/* Patient Switcher Tabs */}
                    <div className="mt-6 inline-flex p-1.5 bg-slate-100 rounded-full border border-slate-200 shadow-inner">
                        {SUCCESS_STORIES.map((s, idx) => (
                            <button
                                key={s.id}
                                onClick={() => setCurrentIndex(idx)}
                                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 ${
                                    currentIndex === idx
                                        ? 'bg-[#3d3f96] text-white shadow-md'
                                        : 'text-slate-600 hover:text-[#3d3f96]'
                                }`}
                            >
                                {s.name} ({s.lostWeight.split(' ')[0]} lbs)
                            </button>
                        ))}
                    </div>
                </div>

                {/* Transformation Spotlight Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
                    
                    {/* LEFT: Before & After Visual Component */}
                    <div className="lg:col-span-6 relative">
                        {/* Floating Result Stats Badge */}
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900">
                                    {story.name} <span className="text-slate-400 text-lg font-semibold">({story.age})</span>
                                </h3>
                                <p className="text-xs font-bold text-[#3d3f96]">
                                    {story.timeframe} • {story.category}
                                </p>
                            </div>

                            <div className="text-right bg-red-50 px-4 py-2 rounded-2xl border border-red-200">
                                <span className="text-2xl sm:text-3xl font-black text-red-500 tracking-tight leading-none block">
                                    {story.lostWeight}
                                </span>
                                <span className="text-[11px] font-black text-red-600 uppercase tracking-wider">
                                    Lighter
                                </span>
                            </div>
                        </div>

                        {/* Dual Before / After Image Card */}
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-3xl border-2 border-slate-200/80 shadow-xl shadow-slate-200/50">
                            
                            {/* BEFORE IMAGE */}
                            <div className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-slate-100 group">
                                <img
                                    src={story.beforeImage}
                                    alt={`${story.name} Before Transformation`}
                                    className="w-full h-full object-cover grayscale contrast-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                                
                                {/* "BEFORE" Badge */}
                                <div className="absolute bottom-3 left-3 right-3">
                                    <span className="block text-center py-1 px-2.5 rounded-lg bg-slate-900/90 backdrop-blur-sm text-white text-xs font-black uppercase tracking-wider border border-white/20 shadow-md">
                                        BEFORE
                                    </span>
                                </div>
                            </div>

                            {/* AFTER IMAGE */}
                            <div className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-slate-100 group ring-2 ring-[#3d3f96]/30">
                                <img
                                    src={story.afterImage}
                                    alt={`${story.name} After Transformation`}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                                
                                {/* "AFTER" Badge */}
                                <div className="absolute bottom-3 left-3 right-3">
                                    <span className="block text-center py-1 px-2.5 rounded-lg bg-[#3d3f96] backdrop-blur-sm text-white text-xs font-black uppercase tracking-wider border border-indigo-300/30 shadow-md">
                                        AFTER
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Verification & Controls Bar */}
                        <div className="mt-4 flex items-center justify-between text-xs font-bold text-slate-500">
                            <div className="flex items-center gap-1 text-amber-500">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                ))}
                                <span className="ml-1 text-slate-800 font-bold">Verified Clinical Patient</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={prevStory}
                                    aria-label="Previous story"
                                    className="w-8 h-8 rounded-full border border-slate-300 bg-white hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-700 shadow-xs"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={nextStory}
                                    aria-label="Next story"
                                    className="w-8 h-8 rounded-full border border-slate-300 bg-white hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-700 shadow-xs"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Editorial Story & Offer Section */}
                    <div className="lg:col-span-6 space-y-6">
                        
                        {/* Main Editorial Headline */}
                        <h3 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#3d3f96] leading-[1.15] font-bold tracking-tight">
                            {story.headline}
                        </h3>

                        {/* Patient Quote with Secondary Red Accent */}
                        <div className="relative pl-5 border-l-4 border-red-500 italic text-slate-700 text-base sm:text-lg font-medium">
                            <Quote className="w-6 h-6 text-red-500/20 absolute -top-2 -left-3 -z-10" />
                            "{story.quote}"
                        </div>

                        {/* Clinical Program Narrative */}
                        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                            {story.description}
                        </p>

                        {/* Clinical Guarantee Points */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs sm:text-sm font-bold text-slate-700">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
                                <span>No counting calories or measuring</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
                                <span>100% Chef-Prepared Fresh Meals</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
                                <span>Doctor & Dietitian Formulated</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
                                <span>Cancel or Pause Anytime</span>
                            </div>
                        </div>

                        {/* Primary #3d3f96 Promotional Ribbon */}
                        <div className="pt-2">
                            <div className="relative bg-[#3d3f96] text-white py-3.5 px-6 text-center rounded-xl shadow-md font-bold text-sm tracking-wide overflow-hidden border border-indigo-900">
                                <div className="absolute left-0 top-0 bottom-0 w-2 bg-red-500" />
                                <span>
                                    Get <strong className="text-red-300 font-black">50% OFF</strong> & <strong className="text-red-300 font-black">FREE Shipping</strong> on Your First Order
                                </span>
                            </div>
                        </div>

                        {/* Secondary Red-500 CTA Button */}
                        {/* <div className="pt-1">
                            <Link
                                href={story.ctaLink}
                                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto text-center px-10 py-4 rounded-xl bg-red-500 hover:bg-red-600 text-white text-base font-black uppercase tracking-wider shadow-lg shadow-red-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                            >
                                <span>{story.ctaText}</span>
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div> */}

                    </div>

                </div>

            </div>
        </section>
    );
}