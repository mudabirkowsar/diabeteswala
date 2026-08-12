"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Star, Plus, ChevronRight } from 'lucide-react';

const Bestsellers = () => {
  const [activeTab, setActiveTab] = useState('Glucometers');

  const categories = ['Glucometers', 'CGM', 'Supplements'];

  // Dummy Data for all categories
  const allProducts = [
    { id: 1, category: 'Glucometers', name: "Accu-Chek Active", price: "₹975", rating: 4.8, img: "https://images.unsplash.com/photo-1583947581924-860bda6a26df?q=80&w=400&auto=format&fit=crop" },
    { id: 2, category: 'Glucometers', name: "OneTouch Select Plus", price: "₹1,150", rating: 4.7, img: "https://images.unsplash.com/photo-1603398938378-e54eab446f91?q=80&w=400&auto=format&fit=crop" },
    { id: 3, category: 'CGM', name: "DiabetesWala Pro Sensor", price: "₹2,499", rating: 4.9, img: "https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=400&auto=format&fit=crop" },
    { id: 4, category: 'CGM', name: "Freestyle Libre Reader", price: "₹5,200", rating: 4.9, img: "https://images.unsplash.com/photo-1579154235828-ac51edfb3983?q=80&w=400&auto=format&fit=crop" },
    { id: 5, category: 'Supplements', name: "Omega-3 Fish Oil", price: "₹650", rating: 4.6, img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=400&auto=format&fit=crop" },
    { id: 6, category: 'Supplements', name: "Sugar-Free Multivitamin", price: "₹450", rating: 4.5, img: "https://images.unsplash.com/photo-1550573105-05867a0da714?q=80&w=400&auto=format&fit=crop" },
  ];

  const filteredProducts = allProducts.filter(p => p.category === activeTab);

  return (
    <section className="py-20 relative overflow-hidden antialiased">
      {/* --- Background Gradient (Matching your original theme shade) --- */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#EBF2FC] via-white to-white -z-10" />

      <div className="max-w-[1440px] mx-auto px-6">
        
        {/* --- Header Section --- */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-[#3d3f96] mb-8 tracking-tight">
            Bestsellers
          </h2>

          {/* --- Filter Tabs --- */}
          <div className="flex justify-center items-center gap-8 md:gap-16 border-b border-slate-100 pb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`relative text-lg md:text-xl font-bold transition-all duration-300 ${
                  activeTab === cat ? 'text-[#3d3f96]' : 'text-slate-400 hover:text-[#3d3f96]'
                }`}
              >
                {cat}
                {activeTab === cat && (
                  <motion.div 
                    layoutId="activeTabUnderline"
                    className="absolute -bottom-[17px] left-0 right-0 h-[3px] bg-[#3d3f96] rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* --- Product Grid --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <AnimatePresence mode="wait">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-50 transition-all duration-500 flex flex-col overflow-hidden"
              >
                {/* Image Section */}
                <div className="relative h-60 bg-slate-50 overflow-hidden">
                  <img 
                    src={product.img} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm border border-slate-100">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-[10px] font-bold text-slate-700">{product.rating}</span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-black text-slate-800 mb-4 leading-tight group-hover:text-[#3d3f96] transition-colors">
                    {product.name}
                  </h3>
                  
                  <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Price</p>
                      <p className="text-xl font-black text-slate-900">{product.price}</p>
                    </div>
                    
                    <button className="bg-[#3d3f96] text-white p-3 rounded-2xl hover:bg-[#2d2f75] transition-all shadow-xl shadow-indigo-100 active:scale-95">
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* --- View All Footer --- */}
        <div className="mt-16 text-center">
            <button className="inline-flex items-center gap-2 text-slate-400 font-bold text-sm hover:text-[#3d3f96] transition-colors uppercase tracking-[0.2em]">
                Explore All Products <ChevronRight size={18} />
            </button>
        </div>
      </div>
    </section>
  );
};

export default Bestsellers;