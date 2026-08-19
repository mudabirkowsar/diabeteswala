"use client";

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';

// List of actual Diabeteswala branches
const outletsList = [
  {
    id: "out-1",
    name: "Diabeteswala - Indiranagar",
    address: "100 Feet Rd, Indiranagar, Bangalore",
    distance: "1.2 km",
    rating: "4.9",
    prepTime: "20-25 mins",
    status: "Open Now",
    fssai: "10822002900392"
  },
  {
    id: "out-2",
    name: "Diabeteswala - Koramangala",
    address: "80 Feet Rd, 4th Block, Koramangala, Bangalore",
    distance: "4.5 km",
    rating: "4.8",
    prepTime: "25-30 mins",
    status: "Open Now",
    fssai: "11221003400511"
  },
  {
    id: "out-3",
    name: "Diabeteswala - HSR Layout",
    address: "27th Main Rd, Sector 1, HSR Layout, Bangalore",
    distance: "6.8 km",
    rating: "4.7",
    prepTime: "30-35 mins",
    status: "Open Now",
    fssai: "10020042007328"
  },
  {
    id: "out-4",
    name: "Diabeteswala - Jayanagar",
    address: "9th Block, Jayanagar, Bangalore",
    distance: "8.1 km",
    rating: "4.6",
    prepTime: "35-40 mins",
    status: "Open Now",
    fssai: "10020038992019"
  }
];

export default function Outlets({ onSelectOutlet, selectedOutlet }) {
  const scrollContainerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScrollProgress = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const totalScrollableWidth = scrollWidth - clientWidth;
      if (totalScrollableWidth > 0) {
        setScrollProgress((scrollLeft / totalScrollableWidth) * 100);
      }
    }
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) el.addEventListener('scroll', handleScrollProgress);
    return () => {
      if (el) el.removeEventListener('scroll', handleScrollProgress);
    };
  }, []);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth / 2 
        : scrollLeft + clientWidth / 2;
      scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-slate-50 border-t border-b border-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto relative">
        
        {/* HEADER CONTROLS */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[10px] bg-indigo-50 text-[#3D3F96] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-[#3D3F96]/10">
              Fulfillment Network
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-3">
              Nearest Outlets
            </h2>
            <p className="text-sm text-slate-500 mt-2 max-w-xl">
              Select your closest Diabeteswala kitchen hub to secure optimal dispatch times and fresh preparation.
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex gap-2.5 self-end">
            <button 
              onClick={() => scroll('left')} 
              className="w-11 h-11 rounded-full border border-slate-200 bg-white hover:border-[#3D3F96] text-slate-500 hover:text-[#3D3F96] flex items-center justify-center transition-all duration-200 shadow-sm focus:outline-none"
              aria-label="Scroll Left"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={() => scroll('right')} 
              className="w-11 h-11 rounded-full border border-slate-200 bg-white hover:border-[#3D3F96] text-slate-500 hover:text-[#3D3F96] flex items-center justify-center transition-all duration-200 shadow-sm focus:outline-none"
              aria-label="Scroll Right"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* OUTLETS CAROUSEL */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scrollbar-none pb-6 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {outletsList.map((outlet) => {
            const isSelected = selectedOutlet?.id === outlet.id;

            return (
              <div
                key={outlet.id}
                onClick={() => onSelectOutlet(isSelected ? null : outlet)}
                className={`w-[340px] shrink-0 snap-start rounded-[32px] p-6 bg-[#3D3F96] text-white border transition-all duration-300 ${
                  isSelected 
                    ? 'border-white ring-4 ring-white/15 shadow-xl shadow-[#3D3F96]/30' 
                    : 'border-white/10 hover:border-white/30 hover:shadow-xl hover:shadow-[#3D3F96]/10'
                }`}
              >
                {/* Visual Header Logo Container (Keeps white background so logo is clearly visible) */}
                <div className="relative h-28 w-full rounded-[24px] bg-white flex items-center justify-center p-4 overflow-hidden shadow-inner">
                  
                  {/* Identical Brand Logo */}
                  <div className="relative w-44 h-12 z-10">
                    <Image
                      src="/Diabetes.jpg"
                      alt="Diabeteswala Logo"
                      fill
                      priority
                      className="object-contain"
                    />
                  </div>

                  {/* Active Selection Indicator */}
                  {isSelected && (
                    <span className="absolute top-4 right-4 bg-emerald-500 text-white p-1.5 rounded-full shadow-md z-20 animate-scale-up">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                </div>

                {/* Outlet metadata details */}
                <div className="mt-5">
                  <h3 className="text-base font-extrabold text-white transition-colors leading-tight">
                    {outlet.name}
                  </h3>
                  
                  {/* Rating, Time & Distance layout */}
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-100 mt-3">
                    <div className="flex items-center gap-1 text-emerald-400 bg-white/10 px-2 py-0.5 rounded-md">
                      <span className="text-[11px]">★</span>
                      <span>{outlet.rating}</span>
                    </div>
                    <span className="text-indigo-300/60">•</span>
                    <span>{outlet.prepTime}</span>
                    <span className="text-indigo-300/60">•</span>
                    <span className="text-white bg-white/15 px-2 py-0.5 rounded-md">{outlet.distance}</span>
                  </div>

                  <p className="text-xs text-indigo-100/90 truncate mt-3 font-semibold">
                    {outlet.address}
                  </p>

                  <div className="flex items-center justify-between text-[11px] mt-4 pt-3.5 border-t border-white/15">
                    <span className="text-indigo-200 font-bold">FSSAI No: {outlet.fssai}</span>
                    <span className="inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      {outlet.status}
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Scroll Progress track indicator */}
        <div className="flex justify-center mt-6">
          <div className="w-20 h-1 bg-slate-200 rounded-full overflow-hidden relative">
            <div 
              className="absolute h-full bg-[#3D3F96] transition-all duration-300 rounded-full"
              style={{ width: '30%', left: `${(scrollProgress * 0.7)}%` }}
            ></div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Vector Navigation Chevrons

function ChevronRightIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

function ChevronLeftIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}