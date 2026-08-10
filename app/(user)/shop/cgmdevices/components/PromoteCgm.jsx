"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Cpu, 
  Waves, 
  Smartphone, 
  CheckCircle2, 
  ArrowRight, 
  ShoppingBag, 
  Zap,
  ShieldCheck,
  Clock
} from 'lucide-react';

function PromoteCgm() {
  const features = [
    { icon: <Waves size={18} />, text: "100% Waterproof Design" },
    { icon: <Clock size={18} />, text: "14-Day Continuous Wear" },
    { icon: <Smartphone size={18} />, text: "Real-time Mobile Sync" },
    { icon: <Zap size={18} />, text: "Instant Glucose Alerts" },
  ];

  return (
    <section className="w-full max-w-[1400px] mx-auto px-6 py-16 antialiased">
      <div className="relative overflow-hidden bg-white rounded-[3rem] border border-slate-100 shadow-[0_40px_80px_-15px_rgba(61,63,150,0.1)]">
        
        {/* --- Background Decorative Elements --- */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50/50 rounded-l-[100px] pointer-events-none hidden lg:block" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-50/50 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center">
          
          {/* --- LEFT SIDE: PRODUCT CONTENT (7 Columns) --- */}
          <div className="lg:col-span-7 p-8 md:p-16 lg:pr-0">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {/* Tech Badge */}
              <div className="inline-flex items-center gap-2 bg-[#3d3f96]/5 border border-[#3d3f96]/10 px-4 py-2 rounded-full mb-8">
                <Cpu size={16} className="text-[#3d3f96] animate-pulse" />
                <span className="text-[10px] font-black text-[#3d3f96] uppercase tracking-[0.2em]">
                  Next-Gen Biosensor Technology
                </span>
              </div>
              
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">
                Monitor Sugar <br /> 
                <span className="text-[#3d3f96]">Without the Prick.</span>
              </h2>
              
              <p className="text-lg text-slate-500 font-medium leading-relaxed mb-10 max-w-xl">
                The <span className="text-slate-900 font-bold">DiabetesWala Pro CGM</span> provides a continuous stream of glucose data every 5 minutes, helping you understand how food, exercise, and stress affect your levels in real-time.
              </p>

              {/* Feature Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                {features.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-lg transition-all duration-300">
                    <div className="bg-white p-2 rounded-xl text-[#3d3f96] shadow-sm group-hover:scale-110 transition-transform">
                        {item.icon}
                    </div>
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Link href="/shop" className="group w-full sm:w-auto bg-[#3d3f96] text-white px-10 py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-2xl shadow-indigo-200 hover:bg-[#2d2f75] transition-all active:scale-95">
                  <ShoppingBag size={20} />
                  BUY NOW — ₹2,499
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <div className="flex items-center gap-2 text-slate-400">
                    <ShieldCheck size={18} className="text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-center">FDA & CE Approved <br/> Medical Device</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* --- RIGHT SIDE: PRODUCT VISUAL (5 Columns) --- */}
          <div className="lg:col-span-5 relative h-full min-h-[450px] flex items-center justify-center py-12 lg:py-0">
            
            {/* Background Glow/Orbit */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute w-72 h-72 md:w-96 md:h-96 border-2 border-dashed border-[#3d3f96]/10 rounded-full"
            />

            {/* Main CGM Image */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
              whileInView={{ scale: 1, opacity: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative z-10 w-[70%] lg:w-[85%] aspect-square"
            >
                <Image 
                  src="/cgmdevice.png" 
                  alt="DiabetesWala Pro CGM Device" 
                  fill
                  className="object-contain drop-shadow-[0_40px_60px_rgba(61,63,150,0.3)]"
                />
            </motion.div>

            {/* Floating "Live Data" Card */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-16 right-8 lg:-right-4 z-20 bg-white p-5 rounded-3xl shadow-2xl border border-slate-50 flex items-center gap-4 min-w-[200px]"
            >
              <div className="bg-blue-50 p-3 rounded-2xl text-[#3d3f96]">
                <Smartphone size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Sync</p>
                <p className="text-base font-black text-slate-800 tracking-tight">108 mg/dL</p>
              </div>
            </motion.div>

            {/* Floating "Pain-Free" Badge */}
            <motion.div 
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-16 left-4 lg:-left-8 z-20 bg-emerald-500 text-white p-4 rounded-[2rem] shadow-2xl flex items-center gap-3 border-4 border-white"
            >
              <CheckCircle2 size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">Painless Application</span>
            </motion.div>

          </div>

        </div>
      </div>
    </section>
  );
}

export default PromoteCgm;