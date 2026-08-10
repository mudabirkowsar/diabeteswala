"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Sparkles, 
  Star, 
  CheckCircle2, 
  Target, 
  Eye, 
  Heart, 
  ArrowRight,
  Activity,
  Award,
  Users,
  Microscope
} from 'lucide-react';

// Replace with your actual service import path
import UserAPI from '../../services/UserAPI'; 

const BACKEND_IMAGE_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

const AboutUsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${BACKEND_IMAGE_BASE}${path}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await UserAPI.getAboutUsDetails();
        if (response && response.success === 1) {
          setData(response.data);
        } else {
          setError("Failed to load About Us details.");
        }
      } catch (err) {
        setError("An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Map JSON icons to Lucide components
  const getIcon = (type) => {
    switch (type) {
      case 'mission': return <Target size={32} />;
      case 'vision': return <Eye size={32} />;
      case 'values': return <Heart size={32} />;
      default: return <ShieldCheck size={32} />;
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
      <div className="w-12 h-12 border-4 border-slate-100 border-t-[#3d3f96] rounded-full animate-spin"></div>
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Brand Story...</p>
    </div>
  );

  if (error || !data) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">{error}</div>;

  return (
    <main className="bg-white antialiased overflow-hidden">
      
      {/* --- 1. HERO SECTION --- */}
      <section className="relative pt-32 pb-20 lg:pt-12 lg:pb-32 bg-[#f8fbff]">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')]" />
        
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-white border border-blue-100 px-4 py-2 rounded-full shadow-sm mb-8"
            >
              <Sparkles size={16} className="text-[#3d3f96]" />
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">The Future of Metabolic Health</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight mb-8"
            >
              {data.heroTitle}
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed mb-12"
            >
              {data.heroDescription}
            </motion.p>

            {/* Stats Cards */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-6"
            >
              <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-blue-100/50 border border-slate-50 flex items-center gap-4 min-w-[200px]">
                <div className="bg-blue-50 p-3 rounded-2xl text-[#3d3f96]"><Users size={24} /></div>
                <div className="text-left">
                  <p className="text-2xl font-black text-slate-900">{data.stats.patientReviews}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Patient Reviews</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-blue-100/50 border border-slate-50 flex items-center gap-4 min-w-[200px]">
                <div className="bg-yellow-50 p-3 rounded-2xl text-yellow-500"><Star size={24} fill="currentColor" /></div>
                <div className="text-left">
                  <p className="text-2xl font-black text-slate-900">{data.googleRating} / 5</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Google Rating</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- 2. MAIN CONTENT SECTION --- */}
      <section className="py-24 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            
            {/* Left: Visual/Image */}
            <div className="relative">
              <div className="aspect-square rounded-[4rem] overflow-hidden shadow-2xl border-[12px] border-slate-50">
                <img 
                  src={getImageUrl(data.mainImage) || "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1000&auto=format&fit=crop"} 
                  className="w-full h-full object-cover" 
                  alt="Clinical Care" 
                />
              </div>
              {/* Floating Badge */}
              <div className="absolute -bottom-10 -right-10 bg-[#3d3f96] text-white p-10 rounded-[3rem] shadow-2xl hidden md:block">
                <Activity size={40} className="mb-4 text-blue-300" />
                <p className="text-sm font-bold leading-tight uppercase tracking-widest">Precision <br/> Diagnostics</p>
              </div>
            </div>

            {/* Right: Text & Features */}
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                {data.mainTitle}
              </h2>
              <p className="text-lg text-slate-500 font-medium leading-relaxed">
                {data.mainDescription}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
                <div className="space-y-4">
                  {data.leftFeatures.map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                      <CheckCircle2 size={18} className="text-emerald-500" /> {feat}
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  {data.rightFeatures.map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                      <CheckCircle2 size={18} className="text-emerald-500" /> {feat}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- 3. PRIORITY STATEMENT STRIP --- */}
      <div className="bg-[#3d3f96] py-6 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="text-white font-black text-sm uppercase tracking-[0.5em] mx-10 opacity-80">
              {data.priorityStatement}
            </span>
          ))}
        </div>
      </div>

      {/* --- 4. SERVICE CARDS GRID --- */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900">{data.moreAboutTitle}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {data.cards.map((card) => (
              <div key={card._id} className="bg-white rounded-[3rem] overflow-hidden shadow-xl border border-slate-100 group">
                <div className="h-64 overflow-hidden">
                  <img src={getImageUrl(card.image)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={card.title} />
                </div>
                <div className="p-10">
                  <h3 className="text-xl font-black text-slate-800 mb-4">{card.title}</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{card.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 5. MISSION / VISION / VALUES --- */}
      <section className="py-24 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {data.missionVision.map((item) => (
              <div 
                key={item._id} 
                style={{ backgroundColor: item.backgroundColor + '15' }} // Adding transparency
                className="p-12 rounded-[3.5rem] border-2 border-transparent hover:border-slate-200 transition-all"
              >
                <div 
                  style={{ backgroundColor: item.backgroundColor }} 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg mb-8"
                >
                  {getIcon(item.type)}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tighter">{item.title}</h3>
                <p className="text-slate-600 font-medium leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 6. INSURANCE PARTNERS --- */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 text-center">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-12">{data.insuranceTitle}</h3>
          <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all">
            {data.insuranceLogos.map((logo, i) => (
              <img key={i} src={logo} className="h-10 md:h-14 object-contain" alt="Insurance Partner" />
            ))}
          </div>
        </div>
      </section>

      {/* Custom CSS for Marquee */}
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: 200%;
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </main>
  );
};

export default AboutUsPage;