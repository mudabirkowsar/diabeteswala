import React from 'react';
import { Stethoscope, Beaker, Pill, ClipboardList } from 'lucide-react';

const ServiceShortcuts = () => {
  const services = [
    { title: "Consult Doctor", icon: <Stethoscope size={20} />, color: "bg-blue-50 text-blue-600" },
    { title: "Book Lab Test", icon: <Beaker size={20} />, color: "bg-purple-50 text-purple-600" },
    { title: "Order Meds", icon: <Pill size={20} />, color: "bg-emerald-50 text-emerald-600" },
    { title: "Care Plans", icon: <ClipboardList size={20} />, color: "bg-orange-50 text-orange-600" },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {services.map((s, i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-all cursor-pointer group">
            <div className={`${s.color} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
              {s.icon}
            </div>
            <span className="text-sm font-bold text-slate-700">{s.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceShortcuts;