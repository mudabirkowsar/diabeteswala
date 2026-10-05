"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Headset, Microscope } from 'lucide-react';

const TrustFeatures = () => {
  const features = [
    { 
      title: "NABL Certified Labs", 
      desc: "100% accurate & verified reports", 
      icon: <Microscope className="w-5 h-5 sm:w-6 sm:h-6" />, 
      color: "text-blue-600", 
      bg: "bg-blue-50" 
    },
    { 
      title: "24/7 Expert Support", 
      desc: "Always here for your emergencies", 
      icon: <Headset className="w-5 h-5 sm:w-6 sm:h-6" />, 
      color: "text-purple-600", 
      bg: "bg-purple-50" 
    },
    { 
      title: "MCI Verified Doctors", 
      desc: "Consult with India's top 1% experts", 
      icon: <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />, 
      color: "text-emerald-600", 
      bg: "bg-emerald-50" 
    },
    { 
      title: "Instant Consultations", 
      desc: "Connect with a doctor in 10 mins", 
      icon: <Zap className="w-5 h-5 sm:w-6 sm:h-6" />, 
      color: "text-orange-600", 
      bg: "bg-orange-50" 
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-10 antialiased select-none">
      {/* 
        Single Row Grid on md+ screens. 
        Horizontal scroll list on mobile (< md) for seamless UX without shrinking text.
      */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="flex md:grid md:grid-cols-4 gap-4 sm:gap-6 overflow-x-auto md:overflow-visible no-scrollbar pb-4 md:pb-0 scroll-smooth snap-x snap-mandatory"
      >
        {features.map((f, i) => (
          <motion.div 
            key={i}
            variants={itemVariants}
            whileHover={{ y: -6 }}
            whileTap={{ scale: 0.98 }}
            className="min-w-[260px] sm:min-w-[280px] md:min-w-0 flex-1 bg-white p-5 sm:p-6 border border-slate-100 rounded-2xl sm:rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-slate-100/80 transition-all duration-300 group cursor-pointer snap-start flex flex-col justify-between"
          >
            <div>
              <div className={`${f.bg} ${f.color} w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {f.icon}
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-800 mb-1.5 sm:mb-2 group-hover:text-[#3d3f96] transition-colors">
                {f.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                {f.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default TrustFeatures;