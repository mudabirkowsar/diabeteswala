"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Ambulance, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  HeartPulse, 
  Wind, 
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

function AmbulancesList() {
  // Sample data for the ambulance fleet
  const ambulances = [
    {
      id: 1,
      name: "Basic Life Support",
      type: "BLS Unit",
      eta: "10-12 Mins",
      price: "₹800",
      features: ["Oxygen Support", "Basic First Aid", "Trained Driver"],
      icon: <Ambulance size={24} className="text-blue-600" />,
      image: "https://images.unsplash.com/photo-1587745416684-47953f16f02f?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: 2,
      name: "Cardiac Advanced",
      type: "ALS Unit",
      eta: "8-10 Mins",
      price: "₹2,500",
      features: ["Defibrillator", "ECG Monitor", "Paramedics"],
      icon: <HeartPulse size={24} className="text-red-600" />,
      image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=600&auto=format&fit=crop",
      recommended: true
    },
    {
      id: 3,
      name: "Mobile ICU",
      type: "ICU on Wheels",
      eta: "12-15 Mins",
      price: "₹5,000",
      features: ["Ventilator", "Syringe Pumps", "Critical Care MD"],
      icon: <Wind size={24} className="text-purple-600" />,
      image: "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: 4,
      name: "Diabetes Emergency",
      type: "Specialized Unit",
      eta: "10 Mins",
      price: "₹1,800",
      features: ["IV Insulin", "Glucagon Kits", "Sugar Monitoring"],
      icon: <Ambulance size={24} className="text-emerald-600" />,
      image: "https://images.unsplash.com/photo-1511174511562-5f7f18b874f8?q=80&w=600&auto=format&fit=crop"
    }
  ];

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-100">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-widest">Emergency Response</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Diabetes <span className="text-[#3d3f96]">On Wheels</span>
            </h2>
            <p className="text-slate-500 font-medium text-sm max-w-md">
              Specialized medical transport equipped for critical diabetic care and rapid stabilization.
            </p>
          </div>

          {/* CTA Button to navigate to full page */}
          <Link href="/ambulance">
            <button className="group flex items-center gap-3 bg-[#3d3f96] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-[#2d2f75] transition-all active:scale-95">
              View All Ambulances
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>

        {/* --- Horizontal Scroll Container --- */}
        <div className="flex overflow-x-auto gap-6 pb-8 
          [&::-webkit-scrollbar]:hidden 
          [-ms-overflow-style:none] 
          [scrollbar-width:none]"
        >
          {ambulances.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`flex-shrink-0 w-80 bg-white rounded-[2.5rem] border-2 transition-all duration-500 overflow-hidden flex flex-col ${
                item.recommended ? 'border-[#3d3f96] shadow-2xl shadow-indigo-50' : 'border-slate-100 shadow-lg shadow-slate-100 hover:border-slate-200'
              }`}
            >
              {/* Image Section */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                
                {/* ETA Badge */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-lg">
                  <Clock size={14} className="text-red-500" />
                  <span className="text-[10px] font-black text-slate-800 uppercase">{item.eta}</span>
                </div>

                {item.recommended && (
                  <div className="absolute top-4 right-4 bg-[#3d3f96] text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                    Recommended
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black text-[#3d3f96] uppercase tracking-widest">{item.type}</span>
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-4 leading-tight">
                  {item.name}
                </h3>

                <div className="space-y-3 mb-8">
                  {item.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      {feat}
                    </div>
                  ))}
                </div>

                {/* Footer Action */}
                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Starts At</p>
                    <p className="text-xl font-black text-slate-900">{item.price}</p>
                  </div>
                  <Link href="/ambulance">
                    <button className={`p-3 rounded-xl transition-all active:scale-95 shadow-md ${
                        item.recommended ? 'bg-[#3d3f96] text-white hover:bg-[#2d2f75]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}>
                        <ChevronRight size={20} />
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* --- Bottom Trust Strip --- */}
        <div className="mt-8 flex items-center gap-6 opacity-60">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <ShieldCheck size={16} /> MCI Certified Staff
            </div>
            <div className="w-1 h-1 bg-slate-300 rounded-full" />
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <Clock size={16} /> 24/7 Dispatch
            </div>
        </div>
      </div>
    </section>
  );
}

export default AmbulancesList;