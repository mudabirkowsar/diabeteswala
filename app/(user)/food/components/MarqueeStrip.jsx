'use client';

import React from 'react';

const MARQUEE_ITEMS = [
    'DOCTOR-DESIGNED MEALS',
    '100% CLEAN INGREDIENTS',
    'READY IN 3 MINUTES',
    'CHEF-CRAFTED RECIPES',
    'ZERO ARTIFICIAL PRESERVATIVES',
    'FREE CHILLED DELIVERY',
    'DIETITIAN APPROVED',
    'CANCEL OR PAUSE ANYTIME',
];

export default function MarqueeStrip() {
    return (
        <div className="relative w-full overflow-hidden bg-[#3d3f96] py-4 border-y border-white/10 shadow-md select-none group">

            {/* CSS Keyframes for smooth infinite scrolling */}
            <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee-infinite {
          display: flex;
          width: max-content;
          animation: marquee 50s linear infinite;
        }
        .group:hover .animate-marquee-infinite {
          animation-play-state: paused;
        }
      `}</style>

            {/* Subtle left & right gradient fade edges */}
            <div className="absolute top-0 bottom-0 left-0 w-16 bg-gradient-to-r from-[#3d3f96] to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 bottom-0 right-0 w-16 bg-gradient-to-l from-[#3d3f96] to-transparent z-10 pointer-events-none" />

            {/* Marquee Track (Repeated twice for seamless loop) */}
            <div className="animate-marquee-infinite flex items-center">

                {/* Track 1 */}
                <div className="flex items-center shrink-0">
                    {MARQUEE_ITEMS.map((text, idx) => (
                        <div key={`track-1-${idx}`} className="flex items-center mx-6 sm:mx-8">
                            <span className="text-white font-extrabold text-sm sm:text-base tracking-widest uppercase whitespace-nowrap">
                                {text}
                            </span>
                            {/* Secondary Red Accent Icon / Separator */}
                            <span className="ml-6 sm:ml-8 text-red-500 font-black text-lg">
                                ★
                            </span>
                        </div>
                    ))}
                </div>

                {/* Track 2 (Clone for infinite seamless illusion) */}
                <div className="flex items-center shrink-0" aria-hidden="true">
                    {MARQUEE_ITEMS.map((text, idx) => (
                        <div key={`track-2-${idx}`} className="flex items-center mx-6 sm:mx-8">
                            <span className="text-white font-extrabold text-sm sm:text-base tracking-widest uppercase whitespace-nowrap">
                                {text}
                            </span>
                            {/* Secondary Red Accent Icon / Separator */}
                            <span className="ml-6 sm:ml-8 text-red-500 font-black text-lg">
                                ★
                            </span>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}