import React from 'react';
import { MapPin, Star, Clock, Phone, ChevronRight, Building2, CheckCircle2 } from 'lucide-react';

function ClinicShowcase() {
  // Sample data for 6 clinics
  const clinics = [
    {
      id: 1,
      name: "Diabeteswala Wellness Center",
      location: "Sector 15, Gurgaon",
      rating: 4.9,
      reviews: "1.2k",
      timing: "08:00 AM - 09:00 PM",
      image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=400&auto=format&fit=crop",
      tag: "Premium Center"
    },
    {
      id: 2,
      name: "City Diabetes Clinic",
      location: "DLF Phase 3, Gurgaon",
      rating: 4.7,
      reviews: "850",
      timing: "09:00 AM - 08:00 PM",
      image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=400&auto=format&fit=crop",
      tag: "Top Rated"
    },
    {
      id: 3,
      name: "Advanced Endocrine Care",
      location: "MG Road, Delhi",
      rating: 4.8,
      reviews: "2.1k",
      timing: "07:00 AM - 10:00 PM",
      image: "https://images.unsplash.com/photo-1504813184591-01592f259ee2?q=80&w=400&auto=format&fit=crop",
      tag: "Specialist Hub"
    },
    {
      id: 4,
      name: "Sugar Control Institute",
      location: "Indirapuram, Ghaziabad",
      rating: 4.6,
      reviews: "600",
      timing: "08:30 AM - 07:30 PM",
      image: "https://images.unsplash.com/photo-1519494080410-f9aa76cb4283?q=80&w=400&auto=format&fit=crop",
      tag: "Verified"
    },
    {
      id: 5,
      name: "LifeCare Diabetes Hub",
      location: "Hauz Khas, Delhi",
      rating: 4.9,
      reviews: "3k",
      timing: "08:00 AM - 09:00 PM",
      image: "https://images.unsplash.com/photo-1538108197017-c1b4628490d1?q=80&w=400&auto=format&fit=crop",
      tag: "ISO Certified"
    },
    {
      id: 6,
      name: "Global Diabetes Clinic",
      location: "Noida Sector 62",
      rating: 4.7,
      reviews: "1.1k",
      timing: "09:00 AM - 08:30 PM",
      image: "https://images.unsplash.com/photo-1512678080530-7760d81faba6?q=80&w=400&auto=format&fit=crop",
      tag: "Modern Lab"
    }
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* Header Section */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Our <span className="text-[#3d3f96]">Premium Clinics</span>
            </h2>
            <p className="text-slate-500 text-sm font-medium mt-1">Experience world-class diabetes care in person</p>
          </div>
          <button className="text-[#3d3f96] font-bold text-xs flex items-center gap-1 hover:underline uppercase tracking-wider">
            View All Locations <ChevronRight size={14} />
          </button>
        </div>

        {/* Horizontal Scroll Container */}
        <div className="flex overflow-x-auto gap-6 pb-8 
          [&::-webkit-scrollbar]:hidden 
          [-ms-overflow-style:none] 
          [scrollbar-width:none]"
        >
          {clinics.map((clinic) => (
            <div 
              key={clinic.id} 
              className="flex-shrink-0 w-80 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden"
            >
              {/* Clinic Image */}
              <div className="relative h-52 w-full overflow-hidden">
                <img 
                  src={clinic.image} 
                  alt={clinic.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {/* Verified Badge */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm">
                  <CheckCircle2 size={12} className="text-blue-500" />
                  <span className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">Verified Clinic</span>
                </div>
                {/* Tag Badge */}
                <div className="absolute top-4 right-4 bg-[#3d3f96] text-white px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                  {clinic.tag}
                </div>
              </div>

              {/* Clinic Details */}
              <div className="p-6">
                <div className="flex items-center gap-1 text-yellow-400 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} fill="currentColor" />
                  ))}
                  <span className="text-[11px] font-bold text-slate-400 ml-1">({clinic.reviews} Reviews)</span>
                </div>

                <h3 className="text-lg font-black text-slate-800 leading-tight mb-2 group-hover:text-[#3d3f96] transition-colors">
                  {clinic.name}
                </h3>
                
                <div className="flex items-center gap-2 text-slate-500 mb-4">
                  <MapPin size={16} className="text-[#3d3f96]" />
                  <p className="text-xs font-bold">{clinic.location}</p>
                </div>

                <div className="flex items-center gap-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-6">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} />
                    {clinic.timing}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button className="bg-[#3d3f96] text-white py-3 rounded-xl font-bold text-xs hover:bg-[#2d2f75] transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-50">
                    Book Visit
                  </button>
                  <button className="border border-slate-200 text-slate-600 py-3 rounded-xl font-bold text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                    <Phone size={14} /> Call
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ClinicShowcase;