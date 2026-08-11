"use client";
import React from 'react';
import { motion } from 'framer-motion';
import {
  Ambulance,
  ShieldCheck,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowRight,
  HeartPulse,
  Wind,
  Zap,
  Navigation
} from 'lucide-react';

function Ambulances() {
  const ambulanceList = [
    {
      id: 1,
      name: "Basic Life Support (BLS)",
      type: "Non-Emergency / Stable",
      eta: "10-12 Mins",
      price: "₹800",
      image: "https://images.unsplash.com/photo-1587745416684-47953f16f02f?q=80&w=600&auto=format&fit=crop",
      features: ["Oxygen Cylinder", "Basic First Aid", "Trained Driver"],
      color: "blue"
    },
    {
      id: 2,
      name: "Cardiac Advanced (ALS)",
      type: "Critical / Cardiac",
      eta: "8-10 Mins",
      price: "₹2,500",
      image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=600&auto=format&fit=crop",
      features: ["Defibrillator", "ECG Monitor", "Paramedic Staff"],
      color: "red",
      recommended: true
    },
    {
      id: 3,
      name: "Mobile ICU (MICU)",
      type: "Highly Critical",
      eta: "12-15 Mins",
      price: "₹5,000",
      image: "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?q=80&w=600&auto=format&fit=crop",
      features: ["Ventilator", "Syringe Pumps", "Critical Care MD"],
      color: "purple"
    },
    {
      id: 4,
      name: "Diabetes Emergency Unit",
      type: "Specialized Reversal",
      eta: "10 Mins",
      price: "₹1,800",
      image: "https://images.unsplash.com/photo-1511174511562-5f7f18b874f8?q=80&w=600&auto=format&fit=crop",
      features: ["IV Insulin", "Glucagon Kits", "Sugar Monitoring"],
      color: "emerald"
    }
  ];

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-[1400px] mx-auto px-6">

        {/* --- Section Header --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-red-100 text-red-600 px-4 py-1.5 rounded-full mb-4">
              <Zap size={14} className="fill-red-600" />
              <span className="text-[10px] font-black uppercase tracking-widest text-red-700">Available 24/7</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Our Specialized <span className="text-[#3d3f96]">Fleet</span>
            </h2>
            <p className="text-lg text-slate-500 font-medium mt-4">
              Choose the right level of care. All units are equipped with specialized diabetes emergency kits.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
            <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
              <Navigation size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase">Current Location</p>
              <p className="text-sm font-bold text-slate-800">Detecting Nearby Units...</p>
            </div>
          </div>
        </div>

        {/* --- Ambulance Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {ambulanceList.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`group relative bg-white rounded-[2.5rem] border-2 transition-all duration-500 overflow-hidden flex flex-col ${item.recommended ? 'border-[#3d3f96] shadow-2xl shadow-indigo-100' : 'border-white shadow-xl shadow-slate-200/50 hover:border-slate-200'}`}
            >
              {/* Image Section */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

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

                <div className="absolute bottom-4 left-6">
                  <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">{item.type}</p>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-black text-slate-800 mb-4 leading-tight group-hover:text-[#3d3f96] transition-colors">
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
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Fare</p>
                    <p className="text-xl font-black text-slate-900">{item.price}</p>
                  </div>
                  <button className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg ${item.recommended ? 'bg-[#3d3f96] text-white hover:bg-[#2d2f75] shadow-indigo-200' : 'bg-slate-900 text-white hover:bg-red-600 shadow-slate-200'}`}>
                    Book Now
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* --- Trust Footer --- */}
        <div className="mt-16 bg-white border border-slate-100 p-8 rounded-[3rem] flex flex-wrap justify-center lg:justify-between items-center gap-8 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-2xl text-[#3d3f96]"><ShieldCheck size={24} /></div>
            <div>
              <p className="text-sm font-black text-slate-800">MCI Certified Staff</p>
              <p className="text-xs font-medium text-slate-400">On-board medical professionals</p>
            </div>
          </div>
          <div className="h-10 w-px bg-slate-100 hidden lg:block"></div>
          <div className="flex items-center gap-4">
            <div className="bg-red-50 p-3 rounded-2xl text-red-600"><HeartPulse size={24} /></div>
            <div>
              <p className="text-sm font-black text-slate-800">Advanced Cardiac Life Support</p>
              <p className="text-xs font-medium text-slate-400">Equipped for cardiac emergencies</p>
            </div>
          </div>
          <div className="h-10 w-px bg-slate-100 hidden lg:block"></div>
          <div className="flex items-center gap-4">
            <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600"><CheckCircle2 size={24} /></div>
            <div>
              <p className="text-sm font-black text-slate-800">NABL Accredited</p>
              <p className="text-xs font-medium text-slate-400">Standardized medical equipment</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

export default Ambulances;