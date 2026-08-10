"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Calendar, 
  X, 
  Search, 
  Sparkles, 
  Video, 
  MonitorPlay,
  FileVideo,
  ChevronRight
} from 'lucide-react';
import { FaYoutube } from "react-icons/fa6";

// Replace with your actual service import path
import UserAPI from '../../services/UserAPI'; 

const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

const VideosPage = () => {
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [localVideos, setLocalVideos] = useState([]);
  const [activeTab, setActiveTab] = useState('youtube'); // 'youtube' or 'local'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    // Fixed: Added encodeURI to handle spaces and special characters in filenames
    return encodeURI(`${BACKEND_BASE}${path}`);
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        // Fetching both APIs in parallel
        const [ytRes, localRes] = await Promise.all([
          UserAPI.getAllYoutubeVideos(),
          UserAPI.getAllLocalVideos()
        ]);

        if (ytRes?.success === 1) {
          setYoutubeVideos(ytRes.youtubeLinks);
        }

        if (localRes?.success === 1 && localRes.details.length > 0) {
          const detail = localRes.details[0];
          const extractedLocal = [];
          
          // Loop through the 6 possible video slots in your JSON
          for (let i = 1; i <= 6; i++) {
            if (detail[`video${i}`]) {
              extractedLocal.push({
                _id: `${detail._id}-v${i}`,
                url: detail[`video${i}`],
                thumbnail: detail[`thumbnail${i}`],
                title: `Clinical Session ${i}`, // Fallback title
                type: 'local',
                addedAt: detail.createdAt
              });
            }
          }
          setLocalVideos(extractedLocal);
        }
      } catch (err) {
        setError("An error occurred while fetching the video library.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const getYTThumbnail = (videoId) => `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-slate-100 border-t-[#3d3f96] rounded-full animate-spin"></div>
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Synchronizing Media...</p>
    </div>
  );

  const currentDisplayList = activeTab === 'youtube' ? youtubeVideos : localVideos;

  return (
    <main className="bg-white min-h-screen pb-20 antialiased">
      
      {/* --- 1. HERO SECTION --- */}
      <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 bg-[#f8fbff] overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')]" />
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-white border border-blue-100 px-4 py-2 rounded-full shadow-sm mb-6">
              <Sparkles size={16} className="text-[#3d3f96]" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Diabetes Learning Hub</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6">Watch & <span className="text-[#3d3f96]">Learn.</span></h1>
            <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto mb-10">
              Access our complete library of clinical guides, reversal protocols, and expert health tips.
            </p>

            {/* --- TAB SWITCHER --- */}
            <div className="inline-flex p-1.5 bg-slate-100 rounded-[2rem] shadow-inner mb-12">
              <button 
                onClick={() => setActiveTab('youtube')}
                className={`flex items-center gap-2 px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'youtube' ? 'bg-white text-[#3d3f96] shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <FaYoutube size={16} className={activeTab === 'youtube' ? 'text-red-600' : ''} /> YouTube Guides
              </button>
              <button 
                onClick={() => setActiveTab('local')}
                className={`flex items-center gap-2 px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'local' ? 'bg-white text-[#3d3f96] shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <MonitorPlay size={16} className={activeTab === 'local' ? 'text-[#3d3f96]' : ''} /> Clinical Uploads
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- 2. VIDEO GRID --- */}
      <section className="py-12">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          {currentDisplayList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {currentDisplayList.map((video, index) => (
                <motion.div
                  key={video._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group cursor-pointer"
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500 border border-slate-100">
                    <img 
                      src={video.type === 'local' ? (getImageUrl(video.thumbnail) || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1000&auto=format&fit=crop') : getYTThumbnail(video.videoId)} 
                      alt={video.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-[#3d3f96]/40 transition-colors flex items-center justify-center">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all">
                        <Play size={28} className="text-[#3d3f96] fill-[#3d3f96] ml-1" />
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-sm">
                      {video.type === 'local' ? <FileVideo size={16} className="text-[#3d3f96]" /> : <FaYoutube size={16} className="text-red-600" />}
                    </div>
                  </div>

                  <div className="mt-6 px-2">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-blue-50 text-[#3d3f96] text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest">
                        {video.type === 'local' ? 'Internal Resource' : 'Public Guide'}
                      </span>
                      <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold">
                        <Calendar size={12} />
                        {new Date(video.addedAt || video.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    <h3 className="text-xl font-black text-slate-800 leading-tight group-hover:text-[#3d3f96] transition-colors line-clamp-2">
                      {video.title}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                <Video size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 font-bold">No videos found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* --- 3. UNIVERSAL VIDEO MODAL --- */}
      <AnimatePresence>
        {selectedVideo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedVideo(null)} className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-5xl aspect-video bg-black rounded-[2rem] overflow-hidden shadow-2xl">
              <button onClick={() => setSelectedVideo(null)} className="absolute top-6 right-6 z-10 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"><X size={24} /></button>
              
              {selectedVideo.type === 'local' ? (
                <video 
                  key={selectedVideo.url}
                  src={getImageUrl(selectedVideo.url)} 
                  controls 
                  autoPlay 
                  playsInline
                  className="w-full h-full object-contain"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1`}
                  title={selectedVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- 4. CTA --- */}
      <section className="max-w-[1440px] mx-auto px-6 mt-12">
        <div className="bg-[#3d3f96] rounded-[3.5rem] p-10 md:p-16 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20" />
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
                <div className="max-w-2xl text-center lg:text-left">
                    <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight">Join the Reversal <br/> Movement</h2>
                    <p className="text-blue-100/70 text-lg font-medium">Subscribe to our channel for the latest breakthroughs in metabolic science.</p>
                </div>
                <a href="https://youtube.com" target="_blank" className="bg-white text-[#3d3f96] px-10 py-5 rounded-2xl font-black text-sm flex items-center gap-3 hover:bg-blue-50 transition-all shadow-xl">
                    <FaYoutube size={20} className="text-red-600" /> SUBSCRIBE NOW
                </a>
            </div>
        </div>
      </section>
    </main>
  );
};

export default VideosPage;