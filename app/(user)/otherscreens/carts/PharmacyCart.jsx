"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const PharmacyCart = ({ itemCount = 2, totalAmount = "1230" }) => {
    // Hide cart if no items (optional logic)
    if (itemCount === 0) return null;

    return (
        <div className="fixed bottom-8 right-8 z-[999] antialiased">
            <Link href="/otherscreens/carts/pharmacycart">
                <motion.div
                    initial={{ scale: 0, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative group flex items-center gap-4 bg-[#3d3f96] text-white p-2 pl-6 rounded-[2rem] shadow-[0_20px_50px_rgba(61,63,150,0.4)] border border-white/10 backdrop-blur-md"
                >
                    {/* Cart Info */}
                    <div className="flex flex-col">
                        <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest leading-none">
                            Your Cart
                        </p>
                        <p className="text-sm font-bold mt-1">
                            {itemCount} Items • <span className="text-emerald-400">₹{totalAmount}</span>
                        </p>
                    </div>

                    {/* Icon with Badge */}
                    <div className="relative bg-white/10 p-4 rounded-2xl group-hover:bg-white group-hover:text-[#3d3f96] transition-all duration-300">
                        <ShoppingBag size={24} strokeWidth={2.5} />

                        {/* Pulsing Badge */}
                        <span className="absolute -top-1 -right-1 flex h-5 w-5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-[10px] font-black items-center justify-center border-2 border-[#3d3f96]">
                                {itemCount}
                            </span>
                        </span>
                    </div>

                    {/* Hover Tooltip/Label */}
                    <div className="absolute -top-12 right-0 bg-slate-900 text-white text-[10px] font-black px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border border-white/10 uppercase tracking-widest">
                        Proceed to Checkout <ArrowRight size={12} className="inline ml-1 text-blue-400" />
                    </div>
                </motion.div>
            </Link>
        </div>
    );
};

export default PharmacyCart;