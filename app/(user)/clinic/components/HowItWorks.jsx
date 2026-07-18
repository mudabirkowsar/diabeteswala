"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Search, Stethoscope, FileText, ChevronRight } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      id: "01",
      title: "Book a Service",
      desc: "Select a doctor, lab test, or care program that fits your needs.",
      icon: <Search size={24} />,
      color: "bg-blue-50 text-blue-600"
    },
    {
      id: "02",
      title: "Consult & Test",
      desc: "Visit a clinic or consult online. Get samples collected from home.",
      icon: <Stethoscope size={24} />,
      color: "bg-purple-50 text-purple-600"
    },
    {
      id: "03",
      title: "Get Care Plan",
      desc: "Receive digital reports and a personalized diabetes reversal plan.",
      icon: <FileText size={24} />,
      color: "bg-emerald-50 text-emerald-600"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-[1400px] mx-auto px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">
            Your Journey to <span className="text-[#3d3f96]">Better Health</span>
          </h2>
          <p className="text-slate-500 font-medium">Three simple steps to start your diabetes reversal journey today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connecting Line (Desktop Only) */}
          <div className="hidden md:block absolute top-1/4 left-0 w-full h-0.5 bg-slate-100 -z-10"></div>

          {steps.map((step, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="flex flex-col items-center text-center group"
            >
              <div className="relative mb-8">
                <div className="absolute -top-4 -right-4 text-4xl font-black text-slate-100 group-hover:text-[#3d3f96]/10 transition-colors">
                  {step.id}
                </div>
                <div className={`${step.color} w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                  {step.icon}
                </div>
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-3">{step.title}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed px-4">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;