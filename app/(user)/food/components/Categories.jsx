'use client';

import React, { useRef } from 'react';
import { useRouter } from 'next/navigation'; // Added for Next.js routing

const categoriesList = [
  {
    id: 'all',
    name: "Show All",
    tagValue: "All",
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: 'low-gi',
    name: "Low GI Meals",
    tagValue: "Low GI",
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: 'keto',
    name: "Keto Bowls",
    tagValue: "Keto",
    imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: 'high-fiber',
    name: "High Fiber",
    tagValue: "High Fiber",
    imageUrl: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: 'gluten-free',
    name: "Gluten Free",
    tagValue: "Gluten Free",
    imageUrl: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: 'sugar-free',
    name: "Zero Sugar",
    tagValue: "Keto",
    imageUrl: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: 'soups',
    name: "Slow-Carb Soups",
    tagValue: "Low GI",
    imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: 'whole-grain',
    name: "Whole Grain Bakes",
    tagValue: "High Fiber",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&auto=format&fit=crop&q=80"
  }
];

export default function Categories({ selectedTag }) {
  const scrollContainerRef = useRef(null);
  const router = useRouter(); // Initialize router

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
    <div className="bg-white border-b border-gray-150/70 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto relative">
        
        {/* Header Title & Nav Arrows */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              What's on your mind?
            </h2>
            <p className="text-xs md:text-sm text-gray-400 mt-1">Explore curated menus targeted for your blood glucose goals.</p>
          </div>

          {/* Navigation Arrows */}
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 transition shadow-sm focus:outline-none"
              aria-label="Scroll left"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 transition shadow-sm focus:outline-none"
              aria-label="Scroll right"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Horizontal Slider Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-8 overflow-x-auto scrollbar-none pb-6 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categoriesList.map((cat) => {
            const isSelected = selectedTag === cat.tagValue;
            return (
              <div
                key={cat.id}
                onClick={() => router.push(`/user/food/directory?category=${cat.tagValue}`)} // Redirects directly to directory page
                className="flex flex-col items-center cursor-pointer snap-center shrink-0 group w-36 md:w-48 relative"
              >
                {/* Visual Position Wrapper */}
                <div className="relative">
                  {/* Circular image frame */}
                  <div 
                    className={`w-32 h-32 md:w-44 md:h-44 rounded-full overflow-hidden bg-gray-50 flex items-center justify-center transition-all duration-300 transform group-hover:scale-105 relative border-4 ${
                      isSelected 
                        ? 'border-[#3D3F96] ring-4 ring-[#3D3F96]/20 scale-105 shadow-md' 
                        : 'border-slate-100 group-hover:border-slate-200'
                    }`}
                    style={{ transform: 'translateZ(0)' }}
                  >
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover rounded-full"
                      loading="lazy"
                    />
                  </div>

                  {/* Active Floating Confirmation Checkmark Badge */}
                  {isSelected && (
                    <div className="absolute top-1 right-1 bg-[#3D3F96] text-white rounded-full p-1.5 shadow-md z-10 animate-fade-in">
                      <svg 
                        className="w-4 h-4 sm:w-5 sm:h-5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        strokeWidth="3"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Text Label */}
                <span className={`text-xs md:text-sm mt-4 font-bold text-center transition-all leading-tight line-clamp-1 max-w-full ${
                  isSelected 
                    ? 'text-[#3D3F96] font-black scale-105' 
                    : 'text-gray-700 group-hover:text-[#3D3F96]'
                }`}>
                  {cat.name}
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}