import React from 'react';
import { Star, Video, MapPin, Calendar, ChevronRight, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

function DoctorShowcase() {
  // Sample data for 6 doctors
  const doctors = [
    { id: 1, name: "Dr. Ananya Sharma", spec: "Senior Endocrinologist", exp: "15+ Yrs", rating: 4.9, reviews: "2k", img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop", slot: "Today, 05:00 PM" },
    { id: 2, name: "Dr. Rajesh Varma", spec: "Diabetes Specialist", exp: "12+ Yrs", rating: 4.8, reviews: "1.5k", img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=400&auto=format&fit=crop", slot: "Tomorrow, 10:30 AM" },
    { id: 3, name: "Dr. Sneha Kapoor", spec: "Clinical Nutritionist", exp: "10+ Yrs", rating: 4.9, reviews: "900", img: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=400&auto=format&fit=crop", slot: "Today, 06:15 PM" },
    { id: 4, name: "Dr. Amit Mehra", spec: "Podiatrist (Foot Care)", exp: "18+ Yrs", rating: 4.7, reviews: "1.2k", img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop", slot: "24 Oct, 11:00 AM" },
    { id: 5, name: "Dr. Priya Iyer", spec: "Ophthalmologist", exp: "14+ Yrs", rating: 4.8, reviews: "1.1k", img: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?q=80&w=400&auto=format&fit=crop", slot: "Today, 04:00 PM" },
    { id: 6, name: "Dr. Vikram Singh", spec: "General Physician", exp: "20+ Yrs", rating: 4.9, reviews: "3k", img: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=400&auto=format&fit=crop", slot: "Tomorrow, 09:00 AM" },
  ];

  return (
    <section className="py-20 bg-[#F8FAFC] relative">
      {/* Structural subtle geometric accents */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-70 pointer-events-none"></div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Modern Minimalist Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-slate-200/60 gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#3d3f96] font-bold text-xs tracking-widest uppercase mb-2">
              <ShieldCheck size={16} className="text-emerald-500 fill-emerald-50" />
              Verified Expert Panels
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              Consult Top <span className="text-[#3d3f96] relative inline-block">Diabetes Experts</span>
            </h2>
            <p className="text-slate-500 text-base font-normal mt-2">Direct access to clinical leaders, credentialed specialists, and certified nutritionists.</p>
          </div>
          <button className="flex items-center gap-2 text-sm font-bold text-[#3d3f96] hover:text-slate-900 transition-colors group bg-white border border-slate-200 shadow-sm px-5 py-3 rounded-2xl whitespace-nowrap self-start md:self-end">
            View Panel Directory
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Clinical Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-5 gap-y-10">
          {doctors.map((doc) => (
            <div 
              key={doc.id} 
              className="flex flex-col bg-white rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-2xl hover:border-transparent transition-all duration-300 group h-full relative p-4"
            >
              {/* Profile Image Container with Layer offset */}
              <div className="relative -mt-8 mx-2 h-48 rounded-xl overflow-hidden bg-slate-100 shadow-md border border-white">
                <img 
                  src={doc.img} 
                  alt={doc.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                
                {/* Clean rating strip on image edge */}
                <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-md text-white px-2 py-0.5 rounded-lg flex items-center gap-1 text-[10px] font-bold border border-white/10">
                  <Star size={10} fill="currentColor" className="text-amber-400" />
                  <span>{doc.rating}</span>
                  <span className="text-slate-400 font-normal">({doc.reviews})</span>
                </div>
              </div>

              {/* Doctor Metadata Body */}
              <div className="flex flex-col flex-1 pt-4 px-1">
                <div className="flex-1">
                  {/* Experience pill left, specialty top right */}
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                      {doc.exp} Experience
                    </span>
                    <div className="flex items-center gap-0.5 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">
                      <CheckCircle2 size={10} className="fill-emerald-100" /> Live
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 tracking-tight truncate group-hover:text-[#3d3f96] transition-colors">
                    {doc.name}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5 truncate">{doc.spec}</p>
                  
                  {/* Service delivery configuration rows */}
                  <div className="mt-3 flex flex-wrap gap-1.5 items-center">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-indigo-50/70 text-indigo-700 rounded-lg border border-indigo-100/40">
                      <Video size={11} strokeWidth={2.5} /> Telehealth
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-emerald-50/70 text-emerald-700 rounded-lg border border-emerald-100/40">
                      <MapPin size={11} strokeWidth={2.5} /> In-Person
                    </span>
                  </div>
                </div>

                {/* Unified Contextual Action Footer */}
                <div className="mt-6 pt-3 border-t border-slate-100 flex flex-col gap-2.5">
                    <div>
                      <div className="flex items-center gap-1 text-slate-400">
                        <Calendar size={11} />
                        <span className="text-[9px] font-bold tracking-widest uppercase text-slate-400">Earliest Window</span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">{doc.slot}</p>
                    </div>
                    
                    <button className="w-full bg-[#3d3f96] hover:bg-slate-900 text-white py-3 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-1.5 group/btn shadow-md shadow-indigo-100">
                      <span>Request Booking</span>
                      <ChevronRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
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

export default DoctorShowcase;