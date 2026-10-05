"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowRight, Pill, FileText, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext'; // Adjust the path as necessary
import { useCart } from '../../../context/CartContext'; // Adjust the path as necessary

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

const Cart = () => {
    const { isLoggedIn } = useAuth(); // Get login status from auth context
    const {
        pharmacyCart,
        pharmacyCartTotal,
        labCart,
        labCartTotal,
        foodCart,
        foodCartTotal
    } = useCart(); // Get real-time cart states from context

    const [isHovered, setIsHovered] = useState(false);

    // --- DYNAMIC CALCULATIONS ---
    const pharmacyCount = pharmacyCart?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
    const pharmacyTotalVal = pharmacyCartTotal || 0;

    const labCount = labCart?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
    const labTotalVal = labCartTotal || 0;

    const foodCount = foodCart?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
    const foodTotalVal = foodCartTotal || 0;

    // Aggregate totals
    const totalItems = pharmacyCount + labCount + foodCount;
    const aggregateTotal = pharmacyTotalVal + labTotalVal + foodTotalVal;

    // --- AUTH & EMPTY CHECK ---
    // If user is not logged in OR the cart is completely empty, hide the floating component
    if (!isLoggedIn || totalItems === 0) return null;

    // Build cart items dynamically. Only show sub-carts that currently contain items.
    const cartOptions = [
        ...(pharmacyCount > 0 ? [{
            name: "Pharmacy Cart",
            count: pharmacyCount,
            total: pharmacyTotalVal.toLocaleString(),
            href: "/otherscreens/carts/pharmacycart",
            icon: <Pill size={16} className="text-[#3d3f96]" />,
            bgLight: "bg-indigo-50/60"
        }] : []),
        ...(labCount > 0 ? [{
            name: "Lab Cart",
            count: labCount,
            total: labTotalVal.toLocaleString(),
            href: "/labs/cart",
            icon: <FileText size={16} className="text-[#3d3f96]" />,
            bgLight: "bg-indigo-50/60"
        }] : []),
        ...(foodCount > 0 ? [{
            name: "Food Cart",
            count: foodCount,
            total: foodTotalVal.toLocaleString(),
            href: "/otherscreens/carts/foodcart",
            icon: <ShoppingBag size={16} className="text-[#3d3f96]" />,
            bgLight: "bg-indigo-50/60"
        }] : [])
    ];

    const toggleMenu = () => {
        setIsHovered((prev) => !prev);
    };

    return (
        <div
            className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-[999] antialiased flex flex-col items-end gap-3 select-none"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* --- SLIDE-UP CART OPTIONS --- */}
            <AnimatePresence>
                {isHovered && cartOptions.length > 0 && (
                    <motion.div
                        variants={menuVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="flex flex-col gap-2.5 mb-1.5 w-[240px] sm:w-[260px]"
                    >
                        {cartOptions.map((opt, idx) => (
                            <motion.div key={idx} variants={itemVariants}>
                                <Link
                                    href={opt.href}
                                    onClick={() => setIsHovered(false)}
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
            <div className="relative group">
                <motion.div
                    onClick={toggleMenu}
                    initial={{ scale: 0, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center bg-[#3d3f96] text-white p-3.5 sm:p-2 sm:pl-6 rounded-full sm:rounded-[2rem] shadow-[0_15px_35px_rgba(61,63,150,0.35)] border border-white/10 cursor-pointer"
                >
                    {/* Text Section (Desktop / Tablet only) */}
                    <div className="hidden sm:flex flex-col pr-2">
                        <p className="text-[9px] font-black text-indigo-200 uppercase tracking-widest leading-none">
                            Total Cart
                        </p>
                        <p className="text-sm font-bold mt-1 whitespace-nowrap">
                            {totalItems} Items • <span className="text-emerald-400 font-extrabold">₹{aggregateTotal.toLocaleString()}</span>
                        </p>
                    </div>

                    {/* Icon Container (Mobile shows only this icon structure) */}
                    <div className="relative bg-white/10 sm:p-4 rounded-2xl transition-all duration-300">
                        <ShoppingBag size={22} className="sm:w-6 sm:h-6" strokeWidth={2.5} />

                        <span className="absolute -top-2 -right-2 sm:-top-1 sm:-right-1 flex h-5 w-5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EB333C] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-5 w-5 bg-[#EB333C] text-[10px] font-black items-center justify-center border-2 border-[#3d3f96]">
                                {totalItems}
                            </span>
                        </span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Cart;