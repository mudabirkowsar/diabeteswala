"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Star, 
  ShieldCheck, 
  Activity, 
  ChevronRight, 
  ChevronLeft, 
  Calendar, 
  ShoppingBag,
  CheckCircle
} from 'lucide-react';

const Hero = () => {
  const [index, setIndex] = useState(0);

  const slides = [
    {
      title: "Control Diabetes",
      subtitle: "Live Limitless",
      desc: "Empowering you with personalized AI-driven insights and world-class medical expertise to manage your sugar levels effortlessly.",
      img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=2070&auto=format&fit=crop",
      accent: "text-blue-500"
    },
    {
      title: "Expert Guidance",
      subtitle: "Anytime,Anywhere",
      desc: "Connect with top-tier endocrinologists and nutritionists from the comfort of your home. Real-time care for a better tomorrow.",
      img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=2070&q=80",
      accent: "text-emerald-500"
    },
    {
      title: "Smart Monitoring",
      subtitle: "Data Driven",
      desc: "Sync your devices and get instant alerts. Our medical-grade products ensure you are always one step ahead of your health.",
      img: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=2070&q=80",
      accent: "text-orange-500"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full min-h-screen bg-[#fcfdfe] overflow-hidden flex flex-col justify-center pt-0 lg:pt-0">
      
      {/* --- Background Decorative Elements --- */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[40%] bg-indigo-100/50 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center z-10">
        
        {/* --- LEFT SIDE: CONTENT --- */}
        <div className="order-2 lg:order-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm mb-8">
                <CheckCircle size={16} className="text-[#3d3f96]" />
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em]">World-Class Diabetes Care</span>
              </div>

              {/* Heading */}
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
                {slides[index].title} <br />
                <span className={slides[index].accent}>{slides[index].subtitle}</span>
              </h1>

              {/* Description */}
              <p className="mt-8 text-lg md:text-xl text-slate-600 max-w-lg leading-relaxed font-medium">
                {slides[index].desc}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* --- BUTTONS SECTION --- */}
          <div className="flex flex-wrap gap-5 mt-10">
            {/* Shop Now Button */}
            <button className="group relative bg-[#3d3f96] hover:bg-[#2d2f75] text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-2xl shadow-indigo-200 transition-all active:scale-95">
              <ShoppingBag size={20} className="group-hover:rotate-12 transition-transform" />
              Shop Now
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Book Consult Button */}
            <button className="bg-white border-2 border-slate-200 text-slate-800 px-10 py-4 rounded-2xl font-bold flex items-center gap-3 hover:border-[#3d3f96] hover:text-[#3d3f96] transition-all active:scale-95">
              <Calendar size={20} />
              Book Consult
            </button>
          </div>

          {/* --- TRUST BAR --- */}
          <div className="mt-12 pt-10 flex flex-col sm:flex-row items-start sm:items-center gap-8 border-t border-slate-200/60">
            <div className="flex -space-x-3">
              {[1,2,3,4].map(i => (
                <img key={i} className="w-12 h-12 rounded-full border-4 border-white shadow-sm" src={`https://i.pravatar.cc/150?img=${i+20}`} alt="user" />
              ))}
              <div className="w-12 h-12 rounded-full bg-[#3d3f96] border-4 border-white flex items-center justify-center text-[11px] font-bold text-white shadow-sm">+2k</div>
            </div>
            <div>
              <div className="flex text-yellow-400 gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
              </div>
              <p className="text-sm font-bold text-slate-500 mt-1.5">Trusted by 2,000+ happy patients</p>
            </div>
          </div>
        </div>

        {/* --- RIGHT SIDE: VISUAL CAROUSEL --- */}
        <div className="order-1 lg:order-2 relative">
          <div className="relative aspect-[4/5] md:aspect-square rounded-[3.5rem] overflow-hidden shadow-[0_40px_80px_-15px_rgba(61,63,150,0.25)] border-[12px] border-white">
            <AnimatePresence mode="wait">
              <motion.img
                key={index}
                src={slides[index].img}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.1, opacity: 0 }}
                transition={{ duration: 1, ease: "circOut" }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>

            {/* Subtle Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#3d3f96]/10 to-transparent"></div>

            {/* Floating Glass Card 1 */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-12 -left-8 backdrop-blur-xl bg-white/90 p-5 rounded-[2rem] shadow-2xl border border-white/50 flex items-center gap-4 min-w-[240px]"
            >
              <div className="bg-blue-500 p-3.5 rounded-2xl text-white shadow-lg shadow-blue-200">
                <Activity size={26} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Glucose Level</p>
                <p className="text-xl font-black text-slate-800 tracking-tight">98 mg/dL</p>
              </div>
            </motion.div>

            {/* Floating Glass Card 2 */}
            <motion.div 
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute bottom-12 -right-8 backdrop-blur-xl bg-white/90 p-5 rounded-[2rem] shadow-2xl border border-white/50 flex items-center gap-4 min-w-[240px]"
            >
              <div className="bg-emerald-500 p-3.5 rounded-2xl text-white shadow-lg shadow-emerald-200">
                <ShieldCheck size={26} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification</p>
                <p className="text-xl font-black text-slate-800 tracking-tight">Verified Dr.</p>
              </div>
            </motion.div>
          </div>

          {/* --- CAROUSEL NAVIGATION --- */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-white px-6 py-3 rounded-3xl shadow-xl border border-slate-100">
            <button 
              onClick={() => setIndex((index - 1 + slides.length) % slides.length)} 
              className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-[#3d3f96]"
            >
              <ChevronLeft size={24} />
            </button>
            
            <div className="flex gap-2">
              {slides.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setIndex(i)}
                  className={`h-2 rounded-full transition-all duration-500 ${i === index ? 'w-10 bg-[#3d3f96]' : 'w-2 bg-slate-200'}`}
                />
              ))}
            </div>

            <button 
              onClick={() => setIndex((index + 1) % slides.length)} 
              className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-[#3d3f96]"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;