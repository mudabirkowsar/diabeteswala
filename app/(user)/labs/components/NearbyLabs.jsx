"use client";
import React from 'react';
import { 
  MapPin, 
  Navigation, 
  Star, 
  Phone, 
  Clock, 
  Search, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

const NearbyLabs = () => {
  const labs = [
    {
      id: 1,
      name: "Diabeteswala Wellness Lab",
      address: "Sector 15, Gurgaon, Haryana",
      distance: "0.8 km away",
      rating: 4.9,
      reviews: 1240,
      timing: "07:00 AM - 09:00 PM",
      features: ["Home Collection", "NABL Accredited"],
      image: "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 2,
      name: "Apollo Diagnostics Center",
      address: "DLF Phase 3, Gurgaon",
      distance: "2.4 km away",
      rating: 4.7,
      reviews: 850,
      timing: "08:00 AM - 08:00 PM",
      features: ["Home Collection"],
      image: "https://images.unsplash.com/photo-1579154235828-ac51edfb3983?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 3,
      name: "Dr. Lal PathLabs",
      address: "MG Road, Near Metro Station",
      distance: "3.1 km away",
      rating: 4.8,
      reviews: 2100,
      timing: "06:30 AM - 10:00 PM",
      features: ["Home Collection", "Express Reports"],
      image: "https://images.unsplash.com/photo-1511174511562-5f7f18b874f8?q=80&w=400&auto=format&fit=crop"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* --- HEADER & LOCATION SEARCH --- */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 text-[#3d3f96] font-bold text-xs uppercase tracking-widest mb-3">
              <Navigation size={14} className="animate-pulse" />
              Find Labs Near You
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
              Locate Our <span className="text-[#3d3f96]">Partner Labs</span> <br className="hidden md:block" /> For Quick Testing
            </h2>
          </div>

          {/* Location Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-80">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Enter your area or pincode" 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-[#3d3f96] transition-all"
              />
            </div>
            <button className="w-full sm:w-auto bg-[#3d3f96] text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-[#2d2f75] transition-all shadow-lg shadow-indigo-100">
              Detect My Location
            </button>
          </div>
        </div>

        {/* --- LABS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {labs.map((lab) => (
            <div 
              key={lab.id} 
              className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-slate-100 transition-all duration-500"
            >
              {/* Lab Image & Distance Badge */}
              <div className="relative h-52 overflow-hidden">
                <img 
                  src={lab.image} 
                  alt={lab.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg">
                  <Navigation size={12} className="text-[#3d3f96]" />
                  <span className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">{lab.distance}</span>
                </div>
                {/* Rating Overlay */}
                <div className="absolute bottom-4 left-4 bg-[#3d3f96] text-white px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg">
                  <Star size={10} fill="currentColor" className="text-yellow-400" />
                  <span className="text-[10px] font-bold">{lab.rating} ({lab.reviews})</span>
                </div>
              </div>

              {/* Lab Content */}
              <div className="p-6">
                <h3 className="text-lg font-black text-slate-800 mb-2 group-hover:text-[#3d3f96] transition-colors">
                  {lab.name}
                </h3>
                
                <div className="flex items-start gap-2 text-slate-500 mb-4">
                  <MapPin size={16} className="shrink-0 mt-0.5" />
                  <p className="text-xs font-medium leading-relaxed">{lab.address}</p>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {lab.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg">
                      <CheckCircle2 size={12} />
                      <span className="text-[9px] font-black uppercase tracking-widest">{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-6">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} />
                    {lab.timing}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button className="bg-[#3d3f96] text-white py-3 rounded-xl font-bold text-xs hover:bg-[#2d2f75] transition-all flex items-center justify-center gap-2">
                    Book Test
                  </button>
                  <button className="border border-slate-200 text-slate-600 py-3 rounded-xl font-bold text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                    <Phone size={14} /> Call Lab
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- VIEW ALL CTA --- */}
        <div className="mt-12 text-center">
          <button className="inline-flex items-center gap-2 text-slate-400 font-bold text-sm hover:text-[#3d3f96] transition-colors">
            View all 50+ partner labs in your city <ChevronRight size={18} />
          </button>
        </div>

      </div>
    </section>
  );
};

export default NearbyLabs;