"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Stethoscope, 
  Apple, 
  Eye, 
  Footprints, 
  Video, 
  MapPin, 
  Star, 
  ArrowRight,
  CheckCircle2,
  CalendarCheck
} from 'lucide-react';

const Hero = () => {
  const categories = [
    { name: "Endocrinologist", icon: <Stethoscope size={18} />, color: "bg-blue-50 text-blue-600" },
    { name: "Nutritionist", icon: <Apple size={18} />, color: "bg-emerald-50 text-emerald-600" },
    { name: "Ophthalmologist", icon: <Eye size={18} />, color: "bg-purple-50 text-purple-600" },
    { name: "Podiatrist", icon: <Footprints size={18} />, color: "bg-orange-50 text-orange-600" },
  ];

  return (
    <section className="relative w-full min-h-screen bg-white overflow-hidden flex items-center pt-24 lg:pt-0">
      
      {/* --- Background Mesh Gradients --- */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-50 rounded-full blur-[120px] opacity-60"></div>
      <div className="absolute bottom-0 left-0 w-[30%] h-[40%] bg-indigo-50 rounded-full blur-[100px] opacity-60"></div>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center z-10">
        
        {/* --- LEFT SIDE: CONTENT --- */}
        <div className="space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-[#3d3f96]/5 border border-[#3d3f96]/10 px-4 py-2 rounded-full mb-6">
              <CalendarCheck size={16} className="text-[#3d3f96]" />
              <span className="text-[11px] font-bold text-[#3d3f96] uppercase tracking-widest">Instant Booking Available</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
              Expert Care for Your <br />
              <span className="text-[#3d3f96]">Diabetes Journey.</span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-slate-500 max-w-lg leading-relaxed font-medium">
              Access India's most experienced diabetes specialists. From reversal protocols to daily management, find the right expert today.
            </p>
          </motion.div>

          {/* --- CATEGORY SELECTOR --- */}
          <div className="grid grid-cols-2 gap-4 max-w-md">
            {categories.map((cat, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.02, backgroundColor: "#f8fafc" }}
                className="flex items-center gap-3 p-3 border border-slate-100 rounded-2xl cursor-pointer transition-all shadow-sm bg-white"
              >
                <div className={`${cat.color} p-2.5 rounded-xl`}>
                  {cat.icon}
                </div>
                <span className="text-xs font-bold text-slate-700">{cat.name}</span>
              </motion.div>
            ))}
          </div>

          {/* --- ACTION BUTTONS --- */}
          <div className="flex flex-wrap gap-5">
            <button className="bg-[#3d3f96] hover:bg-[#2d2f75] text-white px-10 py-5 rounded-2xl font-bold flex items-center gap-3 shadow-2xl shadow-indigo-100 transition-all active:scale-95">
              Find My Doctor <ArrowRight size={20} />
            </button>
            {/* <div className="flex items-center gap-4 px-2">
                <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                    <Video size={18} /> Video
                </div>
                <div className="w-px h-4 bg-slate-200"></div>
                <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                    <MapPin size={18} /> Clinic
                </div>
            </div> */}
          </div>
        </div>

        {/* --- RIGHT SIDE: INTERACTIVE DOCTOR CARD --- */}
        <div className="relative flex justify-center lg:justify-end">
          
          {/* Main Doctor Image with Frame */}
          <div className="relative w-full max-w-[450px] aspect-[4/5] rounded-[3rem] overflow-hidden border-[10px] border-white shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop" 
              alt="Specialist" 
              className="w-full h-full object-cover"
            />
            
            {/* Glassmorphic Doctor Info Overlay */}
            <div className="absolute bottom-6 left-6 right-6 backdrop-blur-xl bg-white/80 p-6 rounded-[2rem] border border-white/50 shadow-xl">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-lg font-black text-slate-800">Dr. Ananya Sharma</h3>
                        <p className="text-xs font-bold text-[#3d3f96] uppercase tracking-wider">Senior Endocrinologist</p>
                    </div>
                    <div className="bg-emerald-500 text-white px-2 py-1 rounded-lg text-[10px] font-black">
                        AVAILABLE
                    </div>
                </div>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-200/50">
                    <div className="flex items-center gap-1">
                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-bold text-slate-700">4.9 (2k+)</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <CheckCircle2 size={14} className="text-blue-500" />
                        <span className="text-xs font-bold text-slate-700">MCI Verified</span>
                    </div>
                </div>
            </div>
          </div>

          {/* Floating "Next Slot" Card */}
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-6 -left-6 lg:-left-12 bg-white p-5 rounded-3xl shadow-2xl border border-slate-50 min-w-[200px] z-20"
          >
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Next Available Slot</p>
            <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2 rounded-xl text-[#3d3f96]">
                    <CalendarCheck size={20} />
                </div>
                <div>
                    <p className="text-sm font-black text-slate-800">Today, 04:30 PM</p>
                    <p className="text-[10px] font-bold text-emerald-500">Instant Confirmation</p>
                </div>
            </div>
          </motion.div>

          {/* Decorative Dot Pattern */}
          <div className="absolute -bottom-10 -right-10 w-32 h-32 opacity-20 pointer-events-none hidden lg:block" 
               style={{ backgroundImage: 'radial-gradient(#3d3f96 2px, transparent 2px)', backgroundSize: '15px 15px' }}>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;