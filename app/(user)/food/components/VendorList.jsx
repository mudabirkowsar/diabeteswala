'use client';

import React, { useRef, useState, useEffect } from 'react';

// Master dataset representing your 8 active, certified kitchen hubs on the platform
const vendorsList = [
  {
    id: 1,
    name: "Diabeteswala Kitchen",
    area: "Indiranagar",
    distance: "3.2 km",
    rating: "4.9",
    fssaiLicense: "10822002900392",
    hygieneAuditScore: "100%",
    specialty: "High-Fiber Grains",
    averagePrepTime: "25 min",
    logoUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: 2,
    name: "Keto Artisan Hub",
    area: "Koramangala",
    distance: "5.5 km",
    rating: "4.8",
    fssaiLicense: "11221003400511",
    hygieneAuditScore: "98%",
    specialty: "Keto Baking",
    averagePrepTime: "30 min",
    logoUrl: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: 3,
    name: "Vedic Diabetology",
    area: "HSR Layout",
    distance: "7.1 km",
    rating: "4.7",
    fssaiLicense: "10020042007328",
    hygieneAuditScore: "100%",
    specialty: "Vegan Curries",
    averagePrepTime: "20 min",
    logoUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: 4,
    name: "Fiber-Rich Bakers",
    area: "Jayanagar",
    distance: "4.0 km",
    rating: "4.6",
    fssaiLicense: "10020038992019",
    hygieneAuditScore: "99%",
    specialty: "Sourdough & Bran",
    averagePrepTime: "15 min",
    logoUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: 5,
    name: "Low-GI Curry House",
    area: "Malleshwaram",
    distance: "8.2 km",
    rating: "4.8",
    fssaiLicense: "10022038112398",
    hygieneAuditScore: "100%",
    specialty: "Stevia Desserts",
    averagePrepTime: "30 min",
    logoUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: 6,
    name: "Keto Pizza Lab",
    area: "JP Nagar",
    distance: "4.8 km",
    rating: "4.7",
    fssaiLicense: "10822034992011",
    hygieneAuditScore: "100%",
    specialty: "Almond Pizza Base",
    averagePrepTime: "25 min",
    logoUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: 7,
    name: "Organic Sprout Desk",
    area: "Whitefield",
    distance: "6.2 km",
    rating: "4.5",
    fssaiLicense: "10022031123910",
    hygieneAuditScore: "97%",
    specialty: "Active Fiber Sprouts",
    averagePrepTime: "20 min",
    logoUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: 8,
    name: "Sweet Sensations",
    area: "Indiranagar Central",
    distance: "2.8 km",
    rating: "4.9",
    fssaiLicense: "10022038112999",
    hygieneAuditScore: "100%",
    specialty: "Sugar-Free Cheesecakes",
    averagePrepTime: "15 min",
    logoUrl: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=200&auto=format&fit=crop&q=80"
  }
];

export default function Vendors({ onSelectVendor, selectedVendor }) {
  const scrollContainerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Monitor scroll progress to update the bottom indicator track
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
      
      scrollContainerRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  };

  return (
    // Cleaned parent container: bg-transparent, borders completely removed
    <div className="bg-transparent py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto relative">
        
        {/* Header Title & Nav Buttons */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              Top kitchen brands for you
            </h2>
            <p className="text-xs md:text-sm text-gray-400 mt-1">Select a brand below to view their daily specials and bundled combo discounts.</p>
          </div>

          {/* Navigation Controls */}
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 transition shadow-sm"
              aria-label="Scroll left"
            >
              ←
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 transition shadow-sm"
              aria-label="Scroll right"
            >
              →
            </button>
          </div>
        </div>

        {/* Brand Logo Slider with Selection Toggles */}
        <div
          ref={scrollContainerRef}
          className="flex gap-8 overflow-x-auto scrollbar-none pb-6 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {vendorsList.map((vendor) => {
            const isSelected = selectedVendor?.id === vendor.id;

            return (
              <div
                key={vendor.id}
                onClick={() => onSelectVendor(isSelected ? null : vendor)}
                className="flex flex-col items-center text-center snap-start shrink-0 group w-28 md:w-36 cursor-pointer"
              >
                
                {/* Circular Logo Container with glow rings for selection */}
                <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-white border shadow-sm flex items-center justify-center transform group-hover:scale-105 transition-all duration-300 relative ${
                  isSelected 
                    ? 'border-[#3D3F96] ring-4 ring-indigo-50/80 shadow-md scale-102' 
                    : 'border-gray-150'
                }`}>
                  <img
                    src={vendor.logoUrl}
                    alt={vendor.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  
                  {/* Embedded Rating Tag */}
                  <div className="absolute bottom-1.5 bg-white/90 backdrop-blur-sm border border-gray-150 text-[9px] font-black text-amber-600 px-1.5 py-0.5 rounded shadow-sm">
                    ★ {vendor.rating}
                  </div>

                  {/* Selection checkmark indicator overlay */}
                  {isSelected && (
                    <span className="absolute top-2 right-2 bg-[#3D3F96] text-white p-0.5 rounded-full shadow-md z-20 animate-fade-in">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                </div>

                {/* Brand Metadata */}
                <h3 className="text-xs md:text-sm font-extrabold text-gray-800 mt-4 group-hover:text-[#3D3F96] transition-colors leading-tight line-clamp-1 max-w-full">
                  {vendor.name}
                </h3>
                
                <p className="text-[10px] md:text-xs text-gray-500 font-semibold mt-1">
                  {vendor.averagePrepTime} • {vendor.distance}
                </p>
                
                <span className="text-[9px] bg-emerald-50 text-[#00B574] font-black px-1.5 py-0.5 rounded uppercase mt-2.5 border border-emerald-100/30 tracking-wider">
                  {vendor.specialty}
                </span>

              </div>
            );
          })}
        </div>

        {/* Scroll Progress track indicator */}
        <div className="flex justify-center mt-6">
          <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden relative">
            <div 
              className="absolute h-full bg-orange-500 transition-all duration-150 rounded-full"
              style={{ width: '30%', left: `${(scrollProgress * 0.7)}%` }}
            ></div>
          </div>
        </div>

      </div>
    </div>
  );
}