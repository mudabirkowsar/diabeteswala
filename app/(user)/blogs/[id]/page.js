"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Eye, 
  ArrowLeft, 
  Share2, 
  Bookmark, 
  CheckCircle2,
  Quote,
  Activity,
  X,
  Copy,
  Check
} from 'lucide-react';
// Social Icons
import { FaWhatsapp, FaFacebookF, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";

import UserAPI from '../../../services/UserAPI'; 

const BACKEND_IMAGE_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

const BlogDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Share States
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${BACKEND_IMAGE_BASE}${path}`;
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const response = await UserAPI.getBlogDetail(id);
        if (response && response.success === 1) {
          setBlog(response.data);
        } else {
          setError("Article not found.");
        }
      } catch (err) {
        setError("An error occurred while fetching the article.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  // --- SHARE LOGIC ---
  const shareData = {
    title: blog?.title,
    text: blog?.description,
    url: typeof window !== 'undefined' ? window.location.href : '',
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Share failed", err);
      }
    } else {
      setIsShareModalOpen(true);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareData.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const socialLinks = [
    { name: 'WhatsApp', icon: <FaWhatsapp />, color: 'bg-[#25D366]', url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareData.title + " " + shareData.url)}` },
    { name: 'Facebook', icon: <FaFacebookF />, color: 'bg-[#1877F2]', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}` },
    { name: 'X', icon: <FaXTwitter />, color: 'bg-[#000000]', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.title)}&url=${encodeURIComponent(shareData.url)}` },
    { name: 'LinkedIn', icon: <FaLinkedinIn />, color: 'bg-[#0A66C2]', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}` },
  ];

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
      <div className="w-12 h-12 border-4 border-slate-100 border-t-[#3d3f96] rounded-full animate-spin"></div>
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Clinical Insights...</p>
    </div>
  );

  if (error || !blog) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
      <h2 className="text-2xl font-black text-slate-800 mb-4">Oops! {error}</h2>
      <button onClick={() => router.back()} className="text-[#3d3f96] font-bold flex items-center gap-2">
        <ArrowLeft size={18} /> Go Back
      </button>
    </div>
  );

  return (
    <main className="bg-white min-h-screen pb-20">
      
      {/* --- SHARE MODAL --- */}
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsShareModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-800">Share Article</h3>
                <button onClick={() => setIsShareModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-8">
                {socialLinks.map((social) => (
                  <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group">
                    <div className={`${social.color} text-white p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                      {social.icon}
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{social.name}</span>
                  </a>
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Copy Link</p>
                <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded-2xl">
                  <input readOnly value={shareData.url} className="flex-1 bg-transparent border-none outline-none text-xs font-medium text-slate-500 px-2 truncate" />
                  <button 
                    onClick={copyToClipboard}
                    className="bg-[#3d3f96] text-white px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 hover:bg-[#2d2f75] transition-colors"
                  >
                    {copied ? <><Check size={14}/> COPIED</> : <><Copy size={14}/> COPY</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- 1. TOP NAVIGATION BAR --- */}
      <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-[1000px] mx-auto px-6 py-4 flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-[#3d3f96] font-bold text-sm transition-colors"
          >
            <ArrowLeft size={18} /> Back to Blogs
          </button>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleNativeShare}
              className="p-2 text-slate-400 hover:text-[#3d3f96] transition-colors"
            >
              <Share2 size={20} />
            </button>
            <button className="p-2 text-slate-400 hover:text-[#3d3f96] transition-colors"><Bookmark size={20} /></button>
          </div>
        </div>
      </div>

      {/* --- 2. HERO HEADER --- */}
      <header className="max-w-[1000px] mx-auto px-6 pt-12 pb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="bg-blue-50 text-[#3d3f96] text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-[0.2em] mb-6 inline-block">
            {blog.type}
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tight">
            {blog.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 py-6 border-y border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#3d3f96] flex items-center justify-center text-white font-bold text-xs">DW</div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Published By</p>
                <p className="text-sm font-bold text-slate-800">{blog.createdBy}</p>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-100 hidden sm:block"></div>
            <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
              <Calendar size={16} className="text-[#3d3f96]" />
              {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
              <Eye size={16} className="text-[#3d3f96]" />
              {blog.viewCount} Views
            </div>
          </div>
        </motion.div>
      </header>

      {/* --- 3. FEATURED IMAGE --- */}
      <div className="max-w-[1200px] mx-auto px-6 mb-16">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative aspect-[21/9] rounded-[3rem] overflow-hidden shadow-2xl shadow-indigo-100 border-[12px] border-white">
          <img src={getImageUrl(blog.blogImage)} alt={blog.title} className="w-full h-full object-cover" />
        </motion.div>
      </div>

      {/* --- 4. ARTICLE CONTENT --- */}
      <article className="max-w-[850px] mx-auto px-6">
        <div className="mb-16">
          <p className="text-xl md:text-2xl text-slate-600 leading-relaxed font-medium italic border-l-4 border-[#3d3f96] pl-8">
            {blog.description}
          </p>
        </div>

        <div className="space-y-16">
          {blog.subheadings?.map((sub, index) => (
            <motion.div key={sub._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-[#3d3f96] font-black group-hover:bg-[#3d3f96] group-hover:text-white transition-colors">{index + 1}</div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">{sub.title}</h2>
              </div>
              <p className="text-lg text-slate-600 leading-relaxed font-normal">{sub.description}</p>
            </motion.div>
          ))}
        </div>

        {/* --- 5. CONCLUSION --- */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="mt-20 p-10 md:p-16 bg-slate-900 rounded-[3.5rem] text-white relative overflow-hidden">
          <Quote className="absolute top-10 right-10 text-white/5 w-40 h-40" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-500 p-2 rounded-xl"><CheckCircle2 size={24} /></div>
              <h3 className="text-2xl font-black uppercase tracking-widest">Clinical Conclusion</h3>
            </div>
            <p className="text-xl text-blue-100/80 leading-relaxed font-medium">{blog.conclusion}</p>
            <div className="mt-12 pt-10 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-4">
                    <div className="bg-white/10 p-3 rounded-2xl text-blue-400"><Activity size={32} /></div>
                    <div>
                        <p className="text-sm font-black uppercase tracking-widest">Ready to take control?</p>
                        <p className="text-xs text-slate-400">Consult with our endocrinologists today.</p>
                    </div>
                </div>
                <button onClick={() => router.push('/doctor')} className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black text-sm hover:bg-blue-50 transition-all shadow-xl">BOOK A CONSULTATION</button>
            </div>
          </div>
        </motion.div>
      </article>

      <div className="max-w-[850px] mx-auto px-6 mt-20 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Medical Disclaimer</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            The information provided in this article is for educational purposes only and is not intended as medical advice. Always consult with a qualified healthcare professional before making changes to your diabetes management plan.
          </p>
      </div>
    </main>
  );
};

export default BlogDetailPage;