"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Microscope, 
  Award, 
  Activity, 
  Bookmark,
  FlaskConical,
  Users,
  TrendingDown,
  ArrowRight,
  CheckCircle2,
  Quote
} from 'lucide-react';

// Exact import path for your API services
import UserAPI from '../../services/UserAPI';

const BACKEND_IMAGE_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

const SciencePage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${BACKEND_IMAGE_BASE}${path}`;
  };

  useEffect(() => {
    const fetchHeroDetails = async () => {
      try {
        setLoading(true);
        const response = await UserAPI.getSciencePageHeroDetail();
        if (response && response.success === 1 && response.data) {
          setData(response.data);
        } else {
          setError(response?.message || "Failed to retrieve scientific data.");
        }
      } catch (err) {
        setError(err?.message || "An error occurred while fetching scientific data.");
      } finally {
        setLoading(false);
      }
    };
    fetchHeroDetails();
  }, []);

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center font-medium text-slate-500">Loading Research Data...</div>;
  if (error || !data) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <main className="w-full bg-white">
      
      {/* --- 1. FULL-WIDTH HERO SECTION --- */}
      <section className="relative h-[90vh] min-h-[700px] w-full flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={getImageUrl(data.heroBackgroundImage)} 
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent" />
          {/* Subtle Grid Overlay */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl space-y-8"
          >
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 px-5 py-2 rounded-full">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-indigo-100 uppercase tracking-[0.3em]">
                Pioneering Diabetes Science
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-white leading-[1.05] tracking-tight">
              {data.heroTitle.split(' ').map((word, i) => (
                <span key={i} className={i === 1 ? "text-indigo-400" : ""}>{word} </span>
              ))}
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 max-w-2xl leading-relaxed font-light">
              {data.heroSubtitle}
            </p>

            <div className="flex flex-wrap gap-4 pt-6">
              <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-full font-bold transition-all flex items-center gap-3 group shadow-2xl shadow-indigo-500/20">
                View Research Papers
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- 2. CLINICAL RESULTS (STATISTICS) - OVERHAULED --- */}
      {data.statistics && data.statistics.length > 0 && (
        <section className="py-32 bg-[#f8fafc] relative overflow-hidden">
            {/* Decorative Background Element */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-indigo-50/50 skew-x-12 translate-x-20 pointer-events-none" />
            
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10">
                <div className="flex flex-col items-start mb-16 space-y-4">
                    <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest">
                        <Activity size={16} />
                        Evidence-Based Results
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                        {data.statsTitle}
                    </h2>
                </div>

                {/* Statistics Layout */}
                <div className={`grid gap-8 ${data.statistics.length === 1 ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
                    {data.statistics.map((stat) => (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            key={stat._id}
                            className="relative group bg-white border border-slate-200 rounded-[3rem] p-1 shadow-2xl shadow-slate-200/50 overflow-hidden"
                        >
                            <div className="flex flex-col md:flex-row items-stretch">
                                {/* Left Side: The Big Number Visual */}
                                <div className="md:w-2/5 bg-indigo-600 p-12 flex flex-col items-center justify-center text-center relative overflow-hidden rounded-[2.8rem]">
                                    {/* Abstract background pattern for the number side */}
                                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
                                    
                                    <motion.span 
                                        initial={{ y: 20, opacity: 0 }}
                                        whileInView={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-7xl md:text-8xl font-black text-white tracking-tighter relative z-10"
                                    >
                                        {stat.percentage}
                                    </motion.span>
                                    <div className="mt-2 text-indigo-200 font-bold uppercase tracking-widest text-[10px] relative z-10 flex items-center gap-2">
                                        <TrendingDown size={14} />
                                        Measured Impact
                                    </div>
                                </div>

                                {/* Right Side: Content */}
                                <div className="md:w-3/5 p-10 md:p-14 flex flex-col justify-center">
                                    <Quote className="text-indigo-100 absolute top-10 right-10 w-20 h-20 -z-0" />
                                    
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs mb-4">
                                            <CheckCircle2 size={16} />
                                            Clinically Validated
                                        </div>
                                        <h3 className="text-2xl md:text-3xl font-bold text-slate-800 leading-tight mb-6">
                                            {stat.description}
                                        </h3>
                                        
                                        <div className="pt-8 border-t border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Primary Source</p>
                                            <div className="flex items-center gap-3 text-slate-600 font-semibold italic text-sm">
                                                <Bookmark size={16} className="text-indigo-500" />
                                                {stat.source}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
      )}

      {/* --- 3. OUR IMPACT SECTION --- */}
      {data.impactCards && data.impactCards.length > 0 && (
        <section className="py-32 bg-white">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <span className="text-indigo-600 font-black text-xs uppercase tracking-widest">Global Reach</span>
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">{data.impactTitle}</h2>
              <p className="text-slate-500 text-lg">Driving change through data and dedicated community support.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {data.impactCards.map((card) => (
                <div key={card._id} className="group relative overflow-hidden rounded-[3.5rem] bg-slate-900 h-[350px] flex items-center shadow-2xl shadow-slate-900/20">
                  <div className="absolute inset-0 opacity-30 group-hover:scale-110 transition-transform duration-1000">
                    <img src="https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80" className="w-full h-full object-cover" alt="bg" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <div className="relative z-10 p-12 flex flex-col md:flex-row items-center gap-10">
                    <div className="h-28 w-28 bg-white/10 backdrop-blur-2xl rounded-[2rem] flex items-center justify-center p-6 border border-white/20 shadow-inner">
                      <img src={getImageUrl(card.image)} alt="icon" className="w-full h-full object-contain brightness-0 invert" />
                    </div>
                    <div className="text-center md:text-left">
                      <div className="text-5xl font-black text-white mb-3 tracking-tighter">{card.number}</div>
                      <p className="text-slate-300 text-xl leading-relaxed font-light">{card.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --- 4. LATEST RESEARCH GALLERY --- */}
      <section className="py-32 bg-[#f8fafc]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest">
                <FlaskConical size={18} />
                Laboratory Insights
              </div>
              <h2 className="text-5xl font-black text-slate-900 tracking-tight">{data.researchTitle}</h2>
              <p className="text-slate-500 max-w-xl text-lg">{data.researchDescription}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {data.researchImages.map((img, idx) => (
              <motion.div 
                whileHover={{ y: -10 }}
                key={idx} 
                className="bg-white p-5 rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100 group"
              >
                <div className="aspect-[4/5] rounded-[2rem] overflow-hidden mb-6">
                  <img 
                    src={getImageUrl(img)} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    alt="Research" 
                  />
                </div>
                <div className="px-2 pb-2">
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Dataset Fig. 0{idx + 1}</span>
                  <h4 className="text-base font-bold text-slate-800 mt-1">Cellular Micro-Analysis</h4>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 5. GRANTS & TEAM --- */}
      <section className="py-32 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Grant Card */}
            <div className="lg:col-span-7 relative rounded-[4rem] overflow-hidden min-h-[550px] flex flex-col justify-end p-12 text-white shadow-2xl shadow-indigo-900/20 group">
              <img 
                src={getImageUrl(data.grantBackgroundImage)} 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                alt="Grant" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
              <div className="relative z-10 space-y-6">
                <div className="bg-emerald-500 w-fit px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                  Grant Cycle 2024 Open
                </div>
                <h2 className="text-5xl font-black tracking-tight">{data.grantTitle}</h2>
                <p className="text-slate-200 text-xl max-w-lg font-light leading-relaxed">{data.grantSubtitle}</p>
                <button className="mt-4 flex items-center gap-3 font-bold text-base bg-white text-slate-900 px-8 py-4 rounded-full hover:bg-indigo-50 transition-colors">
                  Apply for Funding <ArrowRight size={20} />
                </button>
              </div>
            </div>

            {/* Team List */}
            <div className="lg:col-span-5 flex flex-col gap-8">
              <div className="space-y-2">
                <span className="text-indigo-600 font-black text-xs uppercase tracking-widest">Expertise</span>
                <h3 className="text-4xl font-black text-slate-900 tracking-tight">Lead Investigators</h3>
              </div>
              <div className="space-y-6">
                {data.teamCards.map((member) => (
                  <div key={member._id} className="group bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex items-center gap-8 hover:bg-white hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500">
                    <div className="h-20 w-20 rounded-3xl bg-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-200 group-hover:rotate-6 transition-transform">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-xl mb-1">{member.name}</h4>
                      <p className="text-indigo-600 text-xs font-bold uppercase tracking-widest mb-2">{member.institution}</p>
                      <div className="h-1 w-12 bg-slate-200 rounded-full group-hover:w-24 transition-all duration-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

    </main>
  );
};

export default SciencePage;