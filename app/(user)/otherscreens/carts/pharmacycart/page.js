"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  CreditCard,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

const CartPage = () => {
  // Dummy Data for the Cart
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Metformin 500mg (Glycomet)",
      brand: "DiabetesWala Pharmacy",
      price: 145,
      quantity: 2,
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=400&auto=format&fit=crop",
      prescriptionRequired: true
    },
    {
      id: 2,
      name: "Accu-Chek Active Test Strips",
      brand: "Roche Diagnostics",
      price: 975,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1583947581924-860bda6a26df?q=80&w=400&auto=format&fit=crop",
      prescriptionRequired: false
    },
    {
      id: 3,
      name: "Sugar-Free Multivitamin",
      brand: "NutriCare",
      price: 450,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1550573105-05867a0da714?q=80&w=400&auto=format&fit=crop",
      prescriptionRequired: false
    }
  ]);

  const updateQuantity = (id, delta) => {
    setCartItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const removeItem = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + shipping;

  return (
    <main className="min-h-screen bg-[#f8fbff] pt-8 pb-20 antialiased">
      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* --- 1. HEADER --- */}
        <div className="flex items-center justify-between mb-10">
          <div className="space-y-1">
            <Link href="/pharmacy" className="flex items-center gap-2 text-[#3d3f96] font-bold text-sm hover:underline mb-2">
              <ArrowLeft size={16} /> Back to Pharmacy
            </Link>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Your Shopping <span className="text-[#3d3f96]">Cart</span>
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-2 text-slate-400 font-bold text-sm uppercase tracking-widest">
            <ShoppingBag size={20} />
            {cartItems.length} Items
          </div>
        </div>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* --- 2. PRODUCT LIST (8 Columns) --- */}
            <div className="lg:col-span-8 space-y-4">
              <AnimatePresence>
                {cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-6 group hover:shadow-md transition-all"
                  >
                    {/* Product Image */}
                    <div className="w-32 h-32 bg-slate-50 rounded-3xl overflow-hidden shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                        <h3 className="text-lg font-black text-slate-800">{item.name}</h3>
                        {item.prescriptionRequired && (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter border border-amber-100 w-fit mx-auto md:mx-0">
                            <AlertCircle size={10} /> Rx Required
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{item.brand}</p>
                      
                      <div className="flex items-center justify-center md:justify-start gap-6">
                        <div className="flex items-center gap-3 bg-slate-50 p-1 rounded-xl border border-slate-100">
                          <button onClick={() => updateQuantity(item.id, -1)} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-[#3d3f96]"><Minus size={14}/></button>
                          <span className="text-sm font-black text-slate-700 w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-[#3d3f96]"><Plus size={14}/></button>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 transition-colors flex items-center gap-1 text-xs font-bold uppercase tracking-widest">
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right shrink-0">
                      <p className="text-xl font-black text-slate-900">₹{item.price * item.quantity}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">₹{item.price} / unit</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* --- 3. ORDER SUMMARY (4 Columns) --- */}
            <div className="lg:col-span-4 sticky top-32">
              <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-2xl shadow-blue-100/50">
                <h2 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-tight">Order Summary</h2>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm font-bold text-slate-500">
                    <span>Subtotal</span>
                    <span className="text-slate-900">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-500">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? "text-emerald-500" : "text-slate-900"}>
                      {shipping === 0 ? "FREE" : `₹${shipping}`}
                    </span>
                  </div>
                  <div className="h-px bg-slate-100 my-2" />
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-black text-slate-800 uppercase tracking-widest">Total Amount</span>
                    <span className="text-3xl font-black text-[#3d3f96]">₹{total}</span>
                  </div>
                </div>

                <button className="w-full bg-[#3d3f96] hover:bg-[#2d2f75] text-white py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 transition-all active:scale-95 mb-6">
                  CHECKOUT NOW
                  <ChevronRight size={18} />
                </button>

                {/* Trust Badges */}
                <div className="space-y-4 pt-6 border-t border-slate-50">
                  <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <ShieldCheck size={18} className="text-emerald-500" /> 100% Secure Payments
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Truck size={18} className="text-blue-500" /> Express 24h Delivery
                  </div>
                </div>
              </div>

              {/* Promo Code Box */}
              <div className="mt-6 bg-white rounded-[2rem] p-4 border border-slate-100 flex items-center gap-2">
                <input type="text" placeholder="Enter Promo Code" className="flex-1 bg-transparent outline-none text-xs font-bold text-slate-700 px-2" />
                <button className="text-[#3d3f96] font-black text-[10px] uppercase tracking-widest hover:underline">Apply</button>
              </div>
            </div>

          </div>
        ) : (
          /* --- EMPTY STATE --- */
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[4rem] p-20 text-center border border-slate-100 shadow-xl"
          >
            <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShoppingBag size={40} className="text-slate-300" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Your cart is empty</h2>
            <p className="text-slate-500 font-medium mb-10">Looks like you haven't added any medicines yet.</p>
            <Link href="/pharmacy" className="bg-[#3d3f96] text-white px-10 py-4 rounded-2xl font-black text-sm hover:bg-[#2d2f75] transition-all shadow-lg shadow-indigo-100">
              START SHOPPING
            </Link>
          </motion.div>
        )}

      </div>
    </main>
  );
};

export default CartPage;