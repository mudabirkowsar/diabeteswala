"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  Heart, 
  ChevronRight, 
  ArrowRight,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import Link from 'next/link';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 16 }
  }
};

const MedicineShowcase = () => {
  const medicines = [
    { id: 1, name: "Metformin 500mg", brand: "Glycomet", price: "₹145", oldPrice: "₹180", discount: "20% OFF", rating: 4.8, img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=400&auto=format&fit=crop" },
    { id: 2, name: "Voglibose 0.3mg", brand: "Voglistar", price: "₹210", oldPrice: "₹260", discount: "15% OFF", rating: 4.7, img: "https://images.unsplash.com/photo-1603398938378-e54eab446f91?q=80&w=400&auto=format&fit=crop" },
    { id: 3, name: "Insulin Glargine", brand: "Lantus SoloStar", price: "₹650", oldPrice: "₹800", discount: "18% OFF", rating: 4.9, img: "https://images.unsplash.com/photo-1579154235828-ac51edfb3983?q=80&w=400&auto=format&fit=crop" },
    { id: 4, name: "Glimepiride 2mg", brand: "Amaryl", price: "₹95", oldPrice: "₹120", discount: "20% OFF", rating: 4.6, img: "https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?q=80&w=400&auto=format&fit=crop" },
    { id: 5, name: "Sitagliptin 100mg", brand: "Januvia", price: "₹420", oldPrice: "₹500", discount: "16% OFF", rating: 4.8, img: "https://images.unsplash.com/photo-1628771065518-0d82f1938462?q=80&w=400&auto=format&fit=crop" },
    { id: 6, name: "Dapagliflozin 10mg", brand: "Forxiga", price: "₹580", oldPrice: "₹700", discount: "17% OFF", rating: 4.7, img: "https://images.unsplash.com/photo-1584017945516-30751f77a81b?q=80&w=400&auto=format&fit=crop" },
    { id: 7, name: "Pioglitazone 15mg", brand: "Pioz", price: "₹110", oldPrice: "₹140", discount: "21% OFF", rating: 4.5, img: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?q=80&w=400&auto=format&fit=crop" },
    { id: 8, name: "Teneligliptin 20mg", brand: "Zita Plus", price: "₹190", oldPrice: "₹240", discount: "20% OFF", rating: 4.7, img: "https://images.unsplash.com/photo-1550573105-05867a0da714?q=80&w=400&auto=format&fit=crop" },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-[#fdfeff]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
        
        {/* --- HEADER BLOCK --- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12">
          <div>
            {/* Soft Sparkle Tag */}
            <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100/60 px-3 py-1 rounded-full mb-3">
              <Sparkles size={11} className="text-indigo-600 fill-indigo-500" />
              <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider">Certified Care</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none">
              Top Selling <span className="text-[#3d3f96]">Medicines</span>
            </h2>
            <p className="text-slate-500 text-sm font-medium mt-2">Genuine diabetes medications batch-tested and storage-verified</p>
          </div>
          
          <Link href="/pharmacy/allmedicines" className="group text-[#3d3f96] font-bold text-xs flex items-center gap-1.5 hover:text-[#2a2c7a] uppercase tracking-wider transition-colors shrink-0">
            View All Medicines 
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* --- CAROUSEL WRAPPER WITH INVISIBLE SCROLL --- */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="flex overflow-x-auto gap-6 pb-10 
            [&::-webkit-scrollbar]:hidden 
            [-ms-overflow-style:none] 
            [scrollbar-width:none]
            px-1" // minimal padding to avoid clipping box-shadows on scroll bounds
        >
          {medicines.map((med) => (
            <motion.div 
              key={med.id} 
              variants={cardVariants}
              className="flex-shrink-0 w-[270px] bg-white rounded-[2.2rem] border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(61,63,150,0.12)] hover:-translate-y-1.5 transition-all duration-300 group overflow-hidden flex flex-col justify-between"
            >
              {/* Media Section */}
              <div className="relative h-52 w-full bg-slate-50 overflow-hidden">
                <img 
                  src={med.img} 
                  alt={med.name} 
                  className="w-full h-full object-cover scale-102 group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                
                {/* Premium Discount Ribbon */}
                <div className="absolute top-4 left-4 bg-red-500 text-white text-[9px] font-black px-2.5 py-1.5 rounded-xl shadow-md shadow-red-500/20 tracking-wider">
                  {med.discount}
                </div>

                {/* Glassmorphic Wishlist Button */}
                <button className="absolute top-4 right-4 p-2.5 bg-white/75 hover:bg-white backdrop-blur-md rounded-xl text-slate-400 hover:text-rose-500 hover:scale-105 active:scale-95 transition-all shadow-sm">
                  <Heart size={15} className="stroke-[2.5]" />
                </button>

                {/* Rating Badge */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-sm border border-slate-100/50">
                  <Star size={11} fill="currentColor" className="text-amber-400 stroke-amber-400" />
                  <span className="text-[10px] font-black text-slate-800">{med.rating}</span>
                </div>
              </div>

              {/* Content Block */}
              <div className="p-6 flex flex-col flex-grow">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{med.brand}</span>
                <h3 className="text-base font-black text-slate-800 mt-1.5 truncate group-hover:text-[#3d3f96] transition-colors leading-snug">
                  {med.name}
                </h3>
                
                {/* Pricing Block */}
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-xl font-black text-slate-900 leading-none">{med.price}</span>
                  <span className="text-xs text-slate-400 line-through font-bold">{med.oldPrice}</span>
                </div>

                {/* View Details CTA (Replaces the generic Plus Button) */}
                <button className="w-full mt-5 bg-slate-50 hover:bg-gradient-to-r hover:from-[#3d3f96] hover:to-[#5a5dbd] text-slate-700 hover:text-white py-3.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:shadow-[0_10px_20px_rgba(61,63,150,0.2)] active:scale-[0.98] transition-all duration-300 group/btn">
                  View Details
                  <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform stroke-[2.5]" />
                </button>

                {/* Delivery Tag */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">Delivery by Tomorrow</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default MedicineShowcase;