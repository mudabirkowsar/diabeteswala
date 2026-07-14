import React from 'react';
import { Calendar, ArrowRight, HeartPulse, ShieldCheck, Star } from 'lucide-react';

const HealthBanner = () => {
  return (
    <section className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-12 antialiased">
      <div className="relative overflow-hidden bg-[#3d3f96] rounded-[2rem] md:rounded-[3rem] p-8 sm:p-12 lg:p-16 shadow-[0_25px_60px_-15px_rgba(61,63,150,0.3)]">
        
        {/* --- Advanced Ambient Background --- */}
        {/* Top Right Orb */}
        <div className="absolute top-[-20%] right-[-10%] w-[450px] h-[450px] bg-gradient-to-br from-white/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        {/* Bottom Left Light Leak */}
        <div className="absolute bottom-[-30%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-blue-400/30 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        {/* Accent Glow Behind CTA */}
        <div className="absolute right-[10%] bottom-[10%] w-72 h-72 bg-blue-300/10 rounded-full blur-2xl pointer-events-none mix-blend-screen"></div>
        
        {/* Premium Geometric Dot Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.07] pointer-events-none mix-blend-overlay" 
          style={{ 
            backgroundImage: 'radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)', 
            backgroundSize: '24px 24px' 
          }}
        ></div>

        {/* --- Main Grid Content --- */}
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
          
          {/* --- Left Content Area --- */}
          <div className="text-center lg:text-left max-w-2xl flex flex-col items-center lg:items-start">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/15 px-4 py-1.5 rounded-full mb-6 shadow-sm">
              <HeartPulse size={15} className="text-blue-300 animate-pulse" />
              <span className="text-[11px] font-bold text-blue-100 uppercase tracking-[0.15em]">
                Compassionate Care
              </span>
            </div>
            
            {/* Main Headline */}
            <h2 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-black text-white leading-[1.15] mb-6 tracking-tight">
              Your Health is Our <br /> 
              <span className="relative inline-block text-blue-300 mt-1">
                Primary Concern
                <span className="absolute bottom-1 left-0 w-full h-[3px] bg-gradient-to-r from-blue-400/50 to-transparent rounded-full"></span>
              </span>
            </h2>
            
            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-blue-100/90 font-normal leading-relaxed mb-8 max-w-xl">
              Get personalized guidance from India's top endocrinologists. Whether it's reversal programs or daily management, we are here to support your journey to a healthier life.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-5 border-t border-white/10 pt-6 w-full">
              <div className="flex items-center gap-2 text-white/80 text-sm font-medium tracking-wide">
                <ShieldCheck size={18} className="text-blue-300 flex-shrink-0" />
                Verified Specialists
              </div>
              <div className="h-4 w-px bg-white/20 hidden sm:block self-center"></div>
              <div className="flex items-center gap-2 text-white/80 text-sm font-medium tracking-wide">
                <ShieldCheck size={18} className="text-blue-300 flex-shrink-0" />
                24/7 Dedicated Support
              </div>
            </div>
          </div>

          {/* --- Right Side: CTA Action Box --- */}
          <div className="flex-shrink-0 w-full sm:w-auto text-center">
            <div className="group relative inline-block w-full sm:w-auto transition-transform duration-300 ease-out hover:-translate-y-1">
              
              {/* Outer Glow Effect on Hover */}
              <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Main Interactive Button */}
              <button className="relative w-full sm:w-auto bg-white text-[#3d3f96] px-10 py-5 sm:py-6 rounded-2xl font-extrabold text-lg flex items-center justify-center gap-3.5 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.15)] transition-all duration-200 active:scale-[0.98]">
                <Calendar size={22} className="text-[#3d3f96]/80 group-hover:rotate-[15deg] transition-transform duration-300 ease-out" />
                <span>Book Consult Now</span>
                <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform duration-300 ease-out" />
              </button>
            </div>
            
            {/* Scarcity / Urgency Text */}
            <div className="flex items-center justify-center gap-1.5 mt-4">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400"></span>
              </span>
              <p className="text-blue-200/70 text-xs font-bold uppercase tracking-wider">
                Limited Slots Available This Week
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HealthBanner;