"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowRight, Pill, FileText, ChevronRight } from 'lucide-react';
import Link from 'next/link';
// Import your Auth Context
// import { useAuth } from '../../context/AuthContext'; 
import { useAuth } from '../../../context/AuthContext'; // Adjust the path as necessary

const menuVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95, pointerEvents: "none" },
    visible: { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        pointerEvents: "auto",
        transition: {
            type: "spring",
            stiffness: 150,
            damping: 20,
            staggerChildren: 0.05,
            delayChildren: 0.05
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
};

const Cart = ({ 
    pharmacyCount = 2, 
    pharmacyTotal = "1,230",
    labCount = 1,
    labTotal = "450",
    foodCount = 0,
    foodTotal = "0"
}) => {
    const { isLoggedIn } = useAuth(); // Get login status from context
    const [isHovered, setIsHovered] = useState(false);

    // Calculate aggregate totals
    const totalItems = pharmacyCount + labCount + foodCount;
    const aggregateTotal = (
        parseFloat(pharmacyTotal.replace(/,/g, '')) + 
        parseFloat(labTotal.replace(/,/g, '')) + 
        parseFloat(foodTotal.replace(/,/g, ''))
    );

    // --- AUTH & EMPTY CHECK ---
    // If user is not logged in OR the cart is empty, return null (hide component)
    if (!isLoggedIn || totalItems === 0) return null;

    const cartOptions = [
        {
            name: "Pharmacy Cart",
            count: pharmacyCount,
            total: pharmacyTotal,
            href: "/otherscreens/carts/pharmacycart",
            icon: <Pill size={16} className="text-[#3d3f96]" />,
            bgLight: "bg-indigo-50/60"
        },
        {
            name: "Lab Cart",
            count: labCount,
            total: labTotal,
            href: "/labs/cart",
            icon: <FileText size={16} className="text-[#3d3f96]" />,
            bgLight: "bg-indigo-50/60"
        },
        {
            name: "Food Cart",
            count: foodCount,
            total: foodTotal,
            href: "/food-nutrition/cart",
            icon: <ShoppingBag size={16} className="text-[#3d3f96]" />,
            bgLight: "bg-indigo-50/60"
        }
    ];

    return (
        <div 
            className="fixed bottom-8 right-8 z-[999] antialiased flex flex-col items-end gap-3"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* --- SLIDE-UP CART OPTIONS --- */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        variants={menuVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="flex flex-col gap-2.5 mb-1.5 w-[260px]"
                    >
                        {cartOptions.map((opt, idx) => (
                            <motion.div key={idx} variants={itemVariants}>
                                <Link 
                                    href={opt.href}
                                    className="flex items-center justify-between bg-white border border-slate-100 p-3 rounded-2xl shadow-xl hover:shadow-2xl hover:border-slate-200 transition-all duration-300 group/item w-full relative overflow-hidden"
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#EB333C] opacity-0 group-hover/item:opacity-100 transition-opacity" />

                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`p-2.5 rounded-xl ${opt.bgLight} shrink-0`}>
                                            {opt.icon}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider leading-none">
                                                {opt.name}
                                            </p>
                                            <p className="text-xs font-bold text-slate-700 mt-1">
                                                {opt.count} Items • <span className="text-emerald-600 font-extrabold">₹{opt.total}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-300 group-hover/item:text-[#EB333C] group-hover/item:translate-x-0.5 transition-all shrink-0" />
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- MAIN FLOATING ACTION TRIGGER --- */}
            <div className="relative">
                <motion.div
                    initial={{ scale: 0, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-4 bg-[#3d3f96] text-white p-2 pl-6 rounded-[2rem] shadow-[0_20px_50px_rgba(61,63,150,0.3)] border border-white/10 cursor-pointer"
                >
                    <div className="flex flex-col pr-1">
                        <p className="text-[9px] font-black text-indigo-200 uppercase tracking-widest leading-none">
                            Total Cart
                        </p>
                        <p className="text-sm font-bold mt-1 whitespace-nowrap">
                            {totalItems} Items • <span className="text-emerald-400 font-extrabold">₹{aggregateTotal.toLocaleString()}</span>
                        </p>
                    </div>

                    <div className="relative bg-white/10 p-4 rounded-2xl transition-all duration-300">
                        <ShoppingBag size={24} strokeWidth={2.5} />

                        <span className="absolute -top-1 -right-1 flex h-5 w-5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EB333C] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-5 w-5 bg-[#EB333C] text-[10px] font-black items-center justify-center border-2 border-[#3d3f96]">
                                {totalItems}
                            </span>
                        </span>
                    </div>

                    <div className="absolute -top-10 right-0 bg-slate-900 text-white text-[9px] font-black px-3.5 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border border-white/10 uppercase tracking-widest">
                        View Sub Carts <ArrowRight size={11} className="inline ml-1 text-[#EB333C]" />
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Cart;