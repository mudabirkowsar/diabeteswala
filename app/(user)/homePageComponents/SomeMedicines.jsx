"use client";
import React, { useRef } from 'react';
import { ShoppingBag, Star, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

function SomeMedicines() {
  const scrollContainerRef = useRef(null);

  // Data for 8 medicines (Updated with proper calculation support data)
  const medicines = [
    { id: 1, name: "Metformin 500mg", type: "Tablet", price: "120", oldPrice: "150", rating: 4.8, img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=400&auto=format&fit=crop" },
    { id: 2, name: "Voglibose 0.3mg", type: "Tablet", price: "210", oldPrice: "250", rating: 4.5, img: "https://images.unsplash.com/photo-1603398938378-e54eab446f91?q=80&w=400&auto=format&fit=crop" },
    { id: 3, name: "Glimepiride 2mg", type: "Tablet", price: "85", oldPrice: "100", rating: 4.7, img: "https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?q=80&w=400&auto=format&fit=crop" },
    { id: 4, name: "Insulin Pen", type: "Injection", price: "1,200", oldPrice: "1,500", rating: 4.9, img: "https://images.unsplash.com/photo-1579154235828-ac51edfb3983?q=80&w=400&auto=format&fit=crop" },
    { id: 5, name: "Sitagliptin 100mg", type: "Tablet", price: "450", oldPrice: "500", rating: 4.6, img: "https://images.unsplash.com/photo-1628771065518-0d82f1938462?q=80&w=400&auto=format&fit=crop" },
    { id: 6, name: "Dapagliflozin", type: "Tablet", price: "320", oldPrice: "400", rating: 4.4, img: "https://images.unsplash.com/photo-1584017945516-30751f77a81b?q=80&w=400&auto=format&fit=crop" },
    { id: 7, name: "Pioglitazone", type: "Tablet", price: "180", oldPrice: "220", rating: 4.3, img: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?q=80&w=400&auto=format&fit=crop" },
    { id: 8, name: "Sugar Free Gold", type: "Powder", price: "145", oldPrice: "160", rating: 4.7, img: "https://images.unsplash.com/photo-1550573105-05867a0da714?q=80&w=400&auto=format&fit=crop" },
  ];

  // Calculated scroll mechanism for non-touch viewports
  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.6 : scrollLeft + clientWidth * 0.6;
      scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  // Helper function to extract numbers and calculate standard discount
  const getDiscount = (priceStr, oldPriceStr) => {
    const price = parseFloat(priceStr.replace(/,/g, ''));
    const oldPrice = parseFloat(oldPriceStr.replace(/,/g, ''));
    if (!isNaN(price) && !isNaN(oldPrice) && oldPrice > 0) {
      return Math.round(((oldPrice - price) / oldPrice) * 100);
    }
    return 0;
  };

  return (
    <section className="py-16 bg-slate-50/50 antialiased overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative">
        
        {/* --- Header Architecture --- */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-[#3d3f96]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#3d3f96]/80">Pharmacy Hub</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Essential Medicines
            </h2>
            <p className="text-slate-500 text-sm font-medium mt-1">
              Verified clinical healthcare solutions brought directly to you
            </p>
          </div>
          
          {/* Navigation Action Container */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleScroll('left')}
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#3d3f96] hover:border-[#3d3f96] hover:shadow-sm active:scale-95 transition-all"
              aria-label="Scroll left"
            >
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>
            <button 
              onClick={() => handleScroll('right')}
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#3d3f96] hover:border-[#3d3f96] hover:shadow-sm active:scale-95 transition-all"
              aria-label="Scroll right"
            >
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
            <div className="h-6 w-px bg-slate-200 hidden md:block mx-1"></div>
            <button className="text-[#3d3f96] font-extrabold text-xs tracking-wider uppercase border-b-2 border-transparent hover:border-[#3d3f96] pb-1 transition-all">
              View All
            </button>
          </div>
        </div>

        {/* --- Card Dynamic Slider Canvas --- */}
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-6 pb-8 pt-2 px-1 snap-x snap-mandatory scroll-smooth
            [&::-webkit-scrollbar]:hidden 
            [-ms-overflow-style:none] 
            [scrollbar-width:none]"
        >
          {medicines.map((med) => {
            const discount = getDiscount(med.price, med.oldPrice);
            
            return (
              <div 
                key={med.id} 
                className="flex-shrink-0 w-[220px] bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-slate-300/40 snap-start transition-all duration-300 ease-out group"
              >
                {/* Visual Frame Block */}
                <div className="relative h-44 w-full bg-slate-100 rounded-t-2xl overflow-hidden flex items-center justify-center">
                  <img 
                    src={med.img} 
                    alt={med.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  {/* Absolute Card Gradient Cover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 via-transparent to-transparent opacity-60"></div>

                  {/* Contextual Badges Row */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                    {/* Rating Tag */}
                    <div className="bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm border border-slate-100">
                      <Star size={11} className="text-amber-400 fill-amber-400" />
                      <span className="text-[10px] font-extrabold text-slate-700">{med.rating}</span>
                    </div>
                    {/* Discount Tag */}
                    {discount > 0 && (
                      <div className="bg-red-500 text-white text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-lg shadow-sm">
                        {discount}% OFF
                      </div>
                    )}
                  </div>

                  {/* Interactive Quick Add System */}
                  <div className="absolute bottom-3 right-3 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out hidden sm:block">
                    <button className="bg-[#3d3f96] text-white pl-2.5 pr-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 shadow-lg shadow-indigo-900/20 hover:bg-[#343680] active:scale-95 transition-all">
                      <Plus size={14} strokeWidth={3} />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* Information Workspace details */}
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-extrabold text-[#3d3f96] uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md">
                      {med.type}
                    </span>
                  </div>
                  
                  <h3 className="text-[14px] font-bold text-slate-800 mt-2 tracking-tight line-clamp-1 group-hover:text-[#3d3f96] transition-colors">
                    {med.name}
                  </h3>
                  
                  <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                    <div>
                      <p className="text-lg font-black text-slate-900 leading-none">
                        ₹{med.price}
                      </p>
                      <p className="text-[11px] text-slate-400 line-through font-medium mt-1">
                        ₹{med.oldPrice}
                      </p>
                    </div>
                    
                    {/* Mobile Fallback trigger / E-Commerce Indicator icon */}
                    <button className="bg-slate-50 border border-slate-100 text-slate-400 group-hover:bg-[#3d3f96]/10 group-hover:text-[#3d3f96] group-hover:border-transparent p-2 rounded-xl transition-all duration-300 sm:group-hover:scale-90">
                      <ShoppingBag size={16} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default SomeMedicines;