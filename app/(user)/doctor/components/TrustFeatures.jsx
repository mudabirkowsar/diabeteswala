import React from 'react';
import { ShieldCheck, Zap, Headset, Microscope } from 'lucide-react';

const TrustFeatures = () => {
  const features = [
    { title: "NABL Certified Labs", desc: "100% accurate & verified reports", icon: <Microscope size={24} />, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "24/7 Expert Support", desc: "Always here for your emergencies", icon: <Headset size={24} />, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "MCI Verified Doctors", desc: "Consult with India's top 1% experts", icon: <ShieldCheck size={24} />, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Instant Consultations", desc: "Connect with a doctor in 10 mins", icon: <Zap size={24} />, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <div key={i} className="p-6 bg-white border border-slate-100 rounded-[2rem] hover:shadow-xl hover:shadow-slate-100 transition-all group">
            <div className={`${f.bg} ${f.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              {f.icon}
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2">{f.title}</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrustFeatures;