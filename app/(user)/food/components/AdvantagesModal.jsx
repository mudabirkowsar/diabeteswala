import React from 'react';

export default function AdvantagesModal() {
  return (
    <section className="w-full bg-[#FAFAFC] py-16 px-6 md:py-24 lg:px-16 border-b border-gray-200/60 overflow-hidden relative">
      
      {/* INLINE CSS KEYFRAME ANIMATIONS FOR ENHANCED DYNAMIC EFFECTS */}
      <style dangerouslySetInnerHTML={{__html: `
        /* --- Core Layout & Hero Animations --- */
        @keyframes float-hero {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-14px) rotate(0.8deg); }
        }
        @keyframes float-badge {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-8px) scale(1.03); }
        }
        @keyframes pulse-soft-glow {
          0%, 100% { transform: scale(1); opacity: 0.35; }
          50% { transform: scale(1.08); opacity: 0.55; }
        }
        @keyframes radar-ripple {
          0% { transform: scale(0.95); opacity: 1; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes shine-sweep {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        /* --- Continuous Slow Background Rotations --- */
        @keyframes slow-spin-clockwise {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes slow-spin-counter {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }

        /* --- Micro-Staggered Fade/Reveal Entry --- */
        @keyframes reveal-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        /* --- 4 Fluid Drifting Paths for Background Deco --- */
        @keyframes drift-path-1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(20px, -25px) scale(1.08); }
        }
        @keyframes drift-path-2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-25px, 20px) scale(0.92); }
        }
        @keyframes drift-path-3 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(22px, 22px) scale(1.05); }
        }
        @keyframes drift-path-4 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-20px, -20px) scale(0.95); }
        }

        /* --- Animation Utilities --- */
        .animate-float-hero {
          animation: float-hero 8s ease-in-out infinite;
        }
        .animate-float-badge {
          animation: float-badge 6s ease-in-out infinite;
        }
        .animate-pulse-soft-glow {
          animation: pulse-soft-glow 6s ease-in-out infinite;
        }
        .animate-radar-ripple {
          animation: radar-ripple 2.5s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }
        .animate-slow-spin-cw {
          animation: slow-spin-clockwise 50s linear infinite;
        }
        .animate-slow-spin-ccw {
          animation: slow-spin-counter 55s linear infinite;
        }
        .animate-drift-path-1 {
          animation: drift-path-1 18s ease-in-out infinite;
        }
        .animate-drift-path-2 {
          animation: drift-path-2 20s ease-in-out infinite;
        }
        .animate-drift-path-3 {
          animation: drift-path-3 22s ease-in-out infinite;
        }
        .animate-drift-path-4 {
          animation: drift-path-4 24s ease-in-out infinite;
        }

        /* Entry Reveal Utilities */
        .reveal-item {
          animation: reveal-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .delay-100 { animation-delay: 150ms; }
        .delay-200 { animation-delay: 300ms; }
        .delay-300 { animation-delay: 450ms; }
        .delay-400 { animation-delay: 600ms; }
        .delay-500 { animation-delay: 750ms; }

        /* Button Shine Trigger */
        .hover-shine-btn:hover::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.3) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: skewX(-25deg);
          animation: shine-sweep 0.75s ease-out;
        }
      `}} />

      {/* --- BACKGROUND GRAPHIC ELEMENTS --- */}
      {/* Decorative Dot Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-70 pointer-events-none" />

      {/* Background 1: Fresh Lime/Citrus (Top-Left) */}
      <div 
        className="absolute top-12 left-6 md:left-24 w-28 h-28 md:w-40 md:h-40 rounded-full overflow-hidden opacity-[0.09] filter blur-[1px] select-none pointer-events-none z-0 animate-drift-path-1"
        style={{ transform: 'translateZ(0)' }}
      >
        <img 
          src="https://images.unsplash.com/photo-1591244275451-c6374f762691?w=400&auto=format&fit=crop&q=80" 
          alt=""
          className="w-full h-full object-cover animate-slow-spin-cw"
        />
      </div>

      {/* Background 2: Steamed Garlic Broccoli (Bottom-Left) */}
      <div 
        className="absolute bottom-12 left-10 md:left-28 w-28 h-28 md:w-40 md:h-40 rounded-full overflow-hidden opacity-[0.09] filter blur-[1px] select-none pointer-events-none z-0 animate-drift-path-2"
        style={{ transform: 'translateZ(0)' }}
      >
        <img 
          src="https://images.unsplash.com/photo-1584005397045-bf4af2c0cc76?w=400&auto=format&fit=crop&q=80" 
          alt=""
          className="w-full h-full object-cover animate-slow-spin-ccw"
        />
      </div>

      {/* Background 3: Raw Avocado Slice (Top-Right) */}
      <div 
        className="absolute top-10 right-10 md:right-32 w-28 h-28 md:w-40 md:h-40 rounded-full overflow-hidden opacity-[0.09] filter blur-[1px] select-none pointer-events-none z-0 animate-drift-path-3"
        style={{ transform: 'translateZ(0)' }}
      >
        <img 
          src="https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&auto=format&fit=crop&q=80" 
          alt=""
          className="w-full h-full object-cover animate-slow-spin-cw"
        />
      </div>

      {/* Background 4: Fresh Mint Sprig (Bottom-Right) */}
      <div 
        className="absolute bottom-10 right-8 md:right-28 w-28 h-28 md:w-40 md:h-40 rounded-full overflow-hidden opacity-[0.09] filter blur-[1px] select-none pointer-events-none z-0 animate-drift-path-4"
        style={{ transform: 'translateZ(0)' }}
      >
        <img 
          src="https://images.unsplash.com/photo-1508737027454-e6454ef45afd?w=400&auto=format&fit=crop&q=80" 
          alt=""
          className="w-full h-full object-cover animate-slow-spin-ccw"
        />
      </div>
      {/* ---------------------------------- */}

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
        
        {/* LEFT COLUMN: HERO COMPOSITION */}
        <div className="lg:col-span-5 flex justify-center items-center relative reveal-item delay-100">
          <div className="relative w-[310px] h-[310px] sm:w-[400px] sm:h-[400px] md:w-[440px] md:h-[440px]">
            
            {/* Glowing Aura Ring */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-indigo-150 to-indigo-50/20 -z-10 animate-pulse-soft-glow" />
            
            {/* Outer dotted tracking circle */}
            <div className="absolute inset-[-12px] rounded-full border-2 border-dashed border-gray-200/80 -z-10 animate-slow-spin-cw" />

            {/* Main Round Image Frame */}
            <div className="w-full h-full rounded-full overflow-hidden border-[6px] border-white shadow-2xl relative animate-float-hero transition-all duration-500 hover:shadow-indigo-100 hover:border-indigo-50">
              <img
                src="https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&q=80&w=800" 
                alt="Nutritious diabetic-friendly dining option"
                className="w-full h-full object-cover object-center transition-transform duration-1000 hover:scale-110"
              />
              <div className="absolute inset-0 rounded-full ring-1 ring-black/5 pointer-events-none" />
            </div>

            {/* Floating Badge: Glycemic Indicator */}
            <div className="absolute -top-3 -right-3 sm:-right-5 bg-white border border-gray-100 p-3.5 sm:p-4 rounded-2xl shadow-xl flex items-center space-x-3 max-w-[190px] animate-float-badge z-20 hover:scale-105 transition-transform duration-300">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-[#3D3F96]">
                <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Glycemic Index</p>
                <p className="text-sm font-black text-gray-800">Guaranteed &lt; 53</p>
              </div>
            </div>

            {/* Bottom-left Badge Container with continuous Radar Pulse */}
            <div className="absolute -bottom-2 -left-2 z-20">
              {/* Pulsing Backlight Radar rings */}
              <div className="absolute inset-0 rounded-full bg-indigo-400/40 animate-radar-ripple" />
              <div className="absolute inset-0 rounded-full bg-indigo-400/20 animate-radar-ripple" style={{ animationDelay: '1.25s' }} />
              
              {/* Main Badge Button */}
              <div className="relative bg-[#3D3F96] text-white p-4.5 rounded-full shadow-lg flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 transition-all duration-300 hover:scale-110 hover:rotate-12 cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  stroke="currentColor"
                  className="w-6 h-6 sm:w-7 sm:h-7"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                  />
                </svg>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: RESTRUCTURED CONTENT & ADVANTAGES GRID */}
        <div className="lg:col-span-7 flex flex-col space-y-8 relative">
          
          {/* Label Tag */}
          <div className="flex items-center space-x-3 reveal-item delay-100">
            <span className="w-8 h-[2px] bg-[#3D3F96] inline-block rounded-full"></span>
            <span className="text-xs font-extrabold tracking-widest text-[#3D3F96] uppercase">
              100% Diabetic-Safe Culinary Standards
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-4 reveal-item delay-200">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-[1.15] tracking-tight">
              Seamless Nutrition for{' '}
              <span className="text-[#3D3F96] relative inline-block">
                Glycemic Balance.
                <span className="absolute bottom-1 left-0 w-full h-[6px] bg-indigo-100 -z-10 rounded-sm"></span>
              </span>
            </h2>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed max-w-2xl font-medium">
              We eliminate the stress of calculating daily glycemic loads by managing your nutrition from selection to preparation. Enjoy chef-prepared meals configured by clinical dietitians.
            </p>
          </div>

          {/* Core Advantages Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 reveal-item delay-300">
            
            {/* Advantage 1 */}
            <div className="bg-white p-5 rounded-2xl border border-gray-150/80 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/30 transition-all duration-350 group hover:-translate-y-1">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-[#3D3F96] mb-4 group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-300">
                <svg className="w-5.5 h-5.5 transition-transform duration-500 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1 transition-colors group-hover:text-[#3D3F96]">Clinically Controlled</h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-medium">
                Recipes engineered with low-glycemic indexes to prevent glucose spikes.
              </p>
            </div>

            {/* Advantage 2 */}
            <div className="bg-white p-5 rounded-2xl border border-gray-150/80 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/30 transition-all duration-350 group hover:-translate-y-1">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-[#3D3F96] mb-4 group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-300">
                <svg className="w-5.5 h-5.5 transition-transform duration-500 group-hover:-rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1 transition-colors group-hover:text-[#3D3F96]">Dietitian Formulated</h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-medium">
                Every calorie, fat ratio, and carb source is planned and measured.
              </p>
            </div>

            {/* Advantage 3 */}
            <div className="bg-white p-5 rounded-2xl border border-gray-150/80 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/30 transition-all duration-350 group hover:-translate-y-1">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-[#3D3F96] mb-4 group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-300">
                <svg className="w-5.5 h-5.5 transition-transform duration-500 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1 transition-colors group-hover:text-[#3D3F96]">Slow-Release Carbs</h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-medium">
                Sustained energy without sudden crashes using whole-grain selections.
              </p>
            </div>

            {/* Advantage 4 */}
            <div className="bg-white p-5 rounded-2xl border border-gray-150/80 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/30 transition-all duration-350 group hover:-translate-y-1">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-[#3D3F96] mb-4 group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-300">
                <svg className="w-5.5 h-5.5 transition-transform duration-500 group-hover:-rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1 transition-colors group-hover:text-[#3D3F96]">Ready-to-Eat Delivery</h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-medium">
                Freshly cooked meals prepared in custom kitchens and delivered to you.
              </p>
            </div>

          </div>

          {/* CTA Action Button */}
          <div className="pt-4 reveal-item delay-400">
            <button 
              onClick={() => {
                const element = document.getElementById('menu-hub');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover-shine-btn relative overflow-hidden bg-[#3D3F96] hover:bg-indigo-900 hover:shadow-xl hover:shadow-indigo-900/20 text-white text-xs sm:text-sm font-bold tracking-wider py-4 px-8 rounded-xl shadow-md transition-all duration-300 active:scale-[0.98] uppercase"
            >
              Browse Diabetic Menu
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}