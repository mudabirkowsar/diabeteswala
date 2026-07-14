import React from 'react';
import { 
  Activity, 
  Target, 
  Apple, 
  Stethoscope, 
  ArrowRight, 
  CheckCircle2,
  Zap
} from 'lucide-react';

function CarePrograms() {
  const programs = [
    {
      id: 1,
      title: "Type 2 Reversal",
      tag: "Most Popular",
      desc: "A science-backed protocol designed to help you reduce dependency on medication and aim for clinical remission.",
      icon: <Zap className="text-orange-500" size={28} />,
      features: ["Personalized Diet", "Doctor Consults", "Exercise Plans"],
      bgColor: "bg-orange-50",
      borderColor: "border-orange-100"
    },
    {
      id: 2,
      title: "CGM Management",
      tag: "Tech Driven",
      desc: "Real-time glucose monitoring with expert data analysis to understand how your body reacts to different foods.",
      icon: <Activity className="text-blue-500" size={28} />,
      features: ["24/7 Monitoring", "Instant Alerts", "Data Reports"],
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100"
    },
    {
      id: 3,
      title: "Gestational Care",
      tag: "Pregnancy",
      desc: "Specialized care for expecting mothers to manage blood sugar levels safely for both mother and baby.",
      icon: <Target className="text-purple-500" size={28} />,
      features: ["Safe Nutrition", "Fetal Tracking", "Expert Support"],
      bgColor: "bg-purple-50",
      borderColor: "border-purple-100"
    },
    {
      id: 4,
      title: "Dietary Therapy",
      tag: "Nutrition",
      desc: "Customized low-glycemic meal plans created by clinical nutritionists specifically for diabetic health.",
      icon: <Apple className="text-emerald-500" size={28} />,
      features: ["Recipe Library", "Calorie Tracking", "Chef Support"],
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-100"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-[#3d3f96] px-4 py-1.5 rounded-full mb-4">
            <Stethoscope size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Our Expertise</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
            Comprehensive <span className="text-[#3d3f96]">Diabetes Care</span> Programs
          </h2>
          <p className="text-lg text-slate-600 font-medium leading-relaxed">
            We don't just manage diabetes; we help you master it. Choose a program tailored to your specific health goals and lifestyle.
          </p>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {programs.map((program) => (
            <div 
              key={program.id} 
              className={`relative group p-8 rounded-[2.5rem] border-2 ${program.borderColor} ${program.bgColor} transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden`}
            >
              {/* Tag */}
              <span className="absolute top-6 right-6 text-[10px] font-black bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-slate-500 uppercase tracking-tighter">
                {program.tag}
              </span>

              {/* Icon */}
              <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm mb-8 group-hover:scale-110 transition-transform">
                {program.icon}
              </div>

              {/* Content */}
              <h3 className="text-xl font-black text-slate-900 mb-4">{program.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-8">
                {program.desc}
              </p>

              {/* Features List */}
              <ul className="space-y-3 mb-10">
                {program.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <CheckCircle2 size={14} className="text-[#3d3f96]" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Action Button */}
              <button className="w-full bg-white text-[#3d3f96] py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border border-transparent hover:border-[#3d3f96] transition-all group-hover:bg-[#3d3f96] group-hover:text-white">
                Learn More <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 bg-[#3d3f96] rounded-[3rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 text-white">
          <div className="max-w-xl">
            <h3 className="text-3xl font-bold mb-4">Not sure which program is right for you?</h3>
            <p className="text-blue-100 opacity-80">Take our 2-minute health assessment and get a personalized recommendation from our doctors.</p>
          </div>
          <button className="bg-white text-[#3d3f96] px-10 py-5 rounded-2xl font-black whitespace-nowrap hover:bg-blue-50 transition-colors shadow-xl">
            Take Assessment
          </button>
        </div>

      </div>
    </section>
  );
}

export default CarePrograms;