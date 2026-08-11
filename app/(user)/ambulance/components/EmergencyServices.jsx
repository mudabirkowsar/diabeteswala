"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Droplets, 
  Smartphone, 
  HeartPulse, 
  Building2, 
  Stretcher, // Note: using a similar icon if stretcher isn't default
  Activity,
  ChevronRight,
  Bed
} from 'lucide-react';

const EmergencyServices = () => {
  const services = [
    {
      title: "HYPOGLYCEMIA EMERGENCY",
      desc: "Low sugar risk? We are just a call away.",
      icon: <Droplets className="text-red-500 fill-red-500" size={28} />,
      bg: "bg-red-50"
    },
    {
      title: "HIGH BLOOD SUGAR EMERGENCY",
      desc: "Immediate care for high blood sugar complications.",
      icon: <Smartphone className="text-blue-600" size={28} />,
      bg: "bg-blue-50"
    },
    {
      title: "DIABETIC COMPLICATIONS",
      desc: "Expert care for sudden diabetic complications.",
      icon: <HeartPulse className="text-purple-600" size={28} />,
      bg: "bg-purple-50"
    },
    {
      title: "HOSPITAL TRANSFER",
      desc: "Safe & comfortable hospital transfers.",
      icon: <Building2 className="text-emerald-600" size={28} />,
      bg: "bg-emerald-50"
    },
    {
      title: "POST SURGERY CARE TRANSFER",
      desc: "Specialized transport for continuous care.",
      icon: <Bed className="text-orange-500" size={28} />,
      bg: "bg-orange-50"
    }
  ];

  return (
    <section className="py-16 bg-white antialiased">
      <div className="max-w-[1536px] mx-auto px-6">
        
        {/* --- SECTION HEADER WITH DECORATIVE LINES --- */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="hidden md:block h-[2px] w-24 bg-gradient-to-r from-transparent to-red-500 rounded-full" />
          <h2 className="text-center text-lg md:text-xl font-black tracking-tight text-slate-800">
            WE ARE HERE FOR EVERY <span className="text-red-600">DIABETES EMERGENCY</span>
          </h2>
          <div className="hidden md:block h-[2px] w-24 bg-gradient-to-l from-transparent to-red-500 rounded-full" />
        </div>

        {/* --- SERVICES GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {services.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 flex flex-col items-center text-center lg:items-start lg:text-left"
            >
              {/* Icon Container */}
              <div className={`${item.bg} w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                {item.icon}
              </div>

              {/* Text Content */}
              <h3 className="text-[13px] font-black text-[#3d3f96] leading-tight mb-3 tracking-wide uppercase">
                {item.title}
              </h3>
              <p className="text-xs font-medium text-slate-500 leading-relaxed">
                {item.desc}
              </p>

              {/* Subtle Hover Indicator */}
              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight size={16} className="text-[#3d3f96]" />
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default EmergencyServices;