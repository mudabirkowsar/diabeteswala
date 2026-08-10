"use client";
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Bell, 
  ShieldCheck, 
  Calendar, 
  Droplets, 
  CheckCircle2, 
  ArrowRight,
  ShoppingBag,
  HeartPulse
} from 'lucide-react';

const CGMAdvertisement = () => {
  const features = [
    {
      title: "Real-time Glucose Readings",
      desc: "Get instant data on your sugar levels every 5 minutes without any manual intervention.",
      icon: <Activity className="text-blue-500" size={24} />,
    },
    {
      title: "Instant Alerts & Insights",
      desc: "Receive immediate notifications on your phone for high or low glucose trends.",
      icon: <Bell className="text-indigo-500" size={24} />,
    },
    {
      title: "Safe, Accurate & Reliable",
      desc: "Clinically validated technology ensuring the highest standards of diagnostic precision.",
      icon: <ShieldCheck className="text-emerald-500" size={24} />,
    },
    {
      title: "Wear Up to 14 Days",
      desc: "A single, water-resistant sensor stays active for two full weeks of continuous care.",
      icon: <Calendar className="text-[#3d3f96]" size={24} />,
    }
  ];

  return (
    <section className="w-full py-0 bg-[#fcfdfe] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          
          {/* --- LEFT SIDE: THE IMAGE (5 Columns) --- */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded-[3rem] overflow-hidden shadow-[0_40px_80px_-15px_rgba(61,63,150,0.25)] border-[12px] border-white">
              <Image 
                src="/addv.png" 
                alt="Diabeteswala CGM Promotion" 
                width={800} 
                height={1000} 
                className="w-full h-auto object-cover"
                priority
              />
              {/* Subtle Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#3d3f96]/10 to-transparent pointer-events-none" />
            </div>

          </motion.div>

          {/* --- RIGHT SIDE: THE CONTENT (7 Columns) --- */}
          <div className="lg:col-span-7 space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-[#3d3f96]/5 border border-[#3d3f96]/10 px-4 py-2 rounded-full mb-6">
                <HeartPulse size={16} className="text-[#3d3f96]" />
                <span className="text-[11px] font-black text-[#3d3f96] uppercase tracking-[0.2em]">Advanced Metabolic Care</span>
              </div>

              <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight mb-6">
                Smarter Monitoring. <br />
                <span className="text-[#3d3f96]">Better Care.</span>
              </h2>

              <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-2xl">
                The <span className="text-slate-900 font-bold">Diabeteswala CGM</span> is a breakthrough in real-time glucose management. Designed for a healthier tomorrow, it removes the guesswork from your daily routine.
              </p>
            </motion.div>

            {/* Features List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex gap-4 group"
                >
                  <div className="shrink-0 w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-[#3d3f96] group-hover:text-white transition-all duration-300 shadow-sm">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-800 mb-1">{item.title}</h4>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pt-6">
              <button className="group w-full sm:w-auto bg-[#3d3f96] hover:bg-[#2d2f75] text-white px-10 py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-2xl shadow-indigo-100 transition-all active:scale-95">
                <ShoppingBag size={20} />
                ORDER YOUR CGM NOW
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                <CheckCircle2 size={16} className="text-emerald-500" />
                Free Installation Support
              </div>
            </div>

            {/* Footer Slogan */}
            <div className="pt-10 border-t border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                    <HeartPulse size={18} fill="currentColor" />
                </div>
                <p className="text-sm font-black text-slate-800 uppercase tracking-tighter italic">
                    Live Easy, Manage Better
                </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CGMAdvertisement;