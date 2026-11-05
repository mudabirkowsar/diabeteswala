"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const bannerData = [
    {
        id: 1,
        image: '/labb1.webp',
        alt: 'PCOD Management and Health Support',
        link: '/packages/pcod-care',
    },
    {
        id: 2,
        image: '/labb2.webp',
        alt: 'Doctor and Diet Consultation at Home',
        link: '/services/consultation',
    },
    {
        id: 3,
        image: '/labb3.webp',
        alt: 'AI Based Personalized Health Test Report',
        link: '/smart-reports',
    },
    {
        id: 4,
        image: '/labb4.webp',
        alt: 'Routine Lab Diagnostics and Tests',
        link: '/tests/diagnostics',
    },
];

const KnowMoreBanners = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const total = bannerData.length;

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % total);
    }, [total]);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + total) % total);
    }, [total]);

    // Auto-play interval (pauses on hover)
    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(() => {
            nextSlide();
        }, 5000);
        return () => clearInterval(interval);
    }, [nextSlide, isPaused]);

    // Calculate position of each slide relative to currentIndex
    const getSlideConfig = (index) => {
        const diff = (index - currentIndex + total) % total;

        if (diff === 0) {
            // Active center banner
            return {
                x: '0%',
                scale: 1,
                opacity: 1,
                zIndex: 20,
                pointerEvents: 'auto',
                isClickableToNav: false,
            };
        }
        if (diff === 1 || (total === 2 && diff === 1)) {
            // Right peeking banner
            return {
                x: '72%',
                scale: 0.86,
                opacity: 0.55,
                zIndex: 10,
                pointerEvents: 'auto',
                isClickableToNav: true,
            };
        }
        if (diff === total - 1) {
            // Left peeking banner
            return {
                x: '-72%',
                scale: 0.86,
                opacity: 0.55,
                zIndex: 10,
                pointerEvents: 'auto',
                isClickableToNav: true,
            };
        }

        // Hidden banners
        return {
            x: diff > 1 ? '120%' : '-120%',
            scale: 0.7,
            opacity: 0,
            zIndex: 0,
            pointerEvents: 'none',
            isClickableToNav: false,
        };
    };

    return (
        <section
            className="relative w-full py-2 md:py-4 overflow-hidden select-none"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Outer wrapper to contain overflowing side banners */}
            <div className="w-full max-w-[1440px] mx-auto px-4 relative">

                {/* =========================================================================
            CENTERED CAROUSEL STAGE
            This box defines the exact size and position of the center active banner.
            All other slides and the arrows are anchored directly to this box.
            ========================================================================= */}
                <div className="relative mx-auto w-[86%] sm:w-[74%] md:w-[62%] lg:w-[54%] max-w-[840px] aspect-[3.2/1]">

                    {/* Slides Track */}
                    {bannerData.map((banner, index) => {
                        const config = getSlideConfig(index);
                        const isActive = index === currentIndex;

                        return (
                            <motion.div
                                key={banner.id}
                                animate={{
                                    x: config.x,
                                    scale: config.scale,
                                    opacity: config.opacity,
                                    zIndex: config.zIndex,
                                }}
                                transition={{
                                    duration: 0.5,
                                    ease: [0.25, 1, 0.5, 1], // Natural easeOut
                                }}
                                onClick={() => {
                                    if (config.isClickableToNav) {
                                        setCurrentIndex(index);
                                    }
                                }}
                                className={`absolute inset-0 w-full h-full rounded-2xl md:rounded-3xl overflow-hidden border border-slate-200/90 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.16)] bg-white ${config.isClickableToNav ? 'cursor-pointer hover:opacity-75' : ''
                                    }`}
                                style={{ pointerEvents: config.pointerEvents }}
                            >
                                {isActive ? (
                                    <Link
                                        href={banner.link}
                                        className="block w-full h-full cursor-pointer"
                                    >
                                        <img
                                            src={banner.image}
                                            alt={banner.alt}
                                            className="w-full h-full object-cover object-center pointer-events-none"
                                        />
                                    </Link>
                                ) : (
                                    <div className="w-full h-full">
                                        <img
                                            src={banner.image}
                                            alt={banner.alt}
                                            className="w-full h-full object-cover object-center pointer-events-none"
                                        />
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}

                    {/* =========================================================================
              NAVIGATION ARROWS (Locked strictly to the center banner boundaries)
              ========================================================================= */}
                    {/* Left Arrow Button */}
                    <button
                        onClick={prevSlide}
                        aria-label="Previous Slide"
                        className="absolute -left-4 sm:-left-5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white text-[#0d8591] hover:text-[#096670] shadow-[0_4px_16px_rgba(0,0,0,0.15)] border border-slate-200 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                    >
                        <ChevronLeft size={22} className="stroke-[2.5] -translate-x-[1px]" />
                    </button>

                    {/* Right Arrow Button */}
                    <button
                        onClick={nextSlide}
                        aria-label="Next Slide"
                        className="absolute -right-4 sm:-right-5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white text-[#0d8591] hover:text-[#096670] shadow-[0_4px_16px_rgba(0,0,0,0.15)] border border-slate-200 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                    >
                        <ChevronRight size={22} className="stroke-[2.5] translate-x-[1px]" />
                    </button>

                </div>

                {/* Soft edge fade masks on extreme outer screen edges */}
                <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-20 bg-gradient-to-r from-white via-white/80 to-transparent z-20 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-20 bg-gradient-to-l from-white via-white/80 to-transparent z-20 pointer-events-none" />
            </div>

            {/* --- PAGINATION DOTS (Centered below) --- */}
            <div className="flex items-center justify-center gap-1.5 mt-5 sm:mt-7">
                {bannerData.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        aria-label={`Go to slide ${idx + 1}`}
                        className={`transition-all duration-300 rounded-full h-1.5 cursor-pointer ${currentIndex === idx
                                ? 'w-6 bg-[#0d8591]'
                                : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                            }`}
                    />
                ))}
            </div>
        </section>
    );
};

export default KnowMoreBanners;