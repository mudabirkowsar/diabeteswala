"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Stethoscope, 
  Building2, 
  Beaker, 
  Pill, 
  Apple, 
  Mail, 
  Lock, 
  UserPlus, 
  Eye, 
  EyeOff,
  ShieldCheck,
  Phone,
  CheckSquare
} from 'lucide-react';

const SignupPage = () => {
  const [role, setRole] = useState('Home');
  const [showPassword, setShowPassword] = useState(false);

  const roles = [
    { id: 'Home', label: 'User', icon: <User size={18} /> },
    { id: 'Doctor', label: 'Doctor', icon: <Stethoscope size={18} /> },
    { id: 'Clinic', label: 'Clinic', icon: <Building2 size={18} /> },
    { id: 'Labs', label: 'Labs', icon: <Beaker size={18} /> },
    { id: 'Pharmacy', label: 'Pharmacy', icon: <Pill size={18} /> },
    { id: 'Food & Nutrition', label: 'Expert', icon: <Apple size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#f0f7ff] flex items-center justify-center p-4 md:p-10">
      <div className="max-w-[1200px] w-full bg-white rounded-[3rem] shadow-2xl shadow-blue-100 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        
        {/* --- LEFT SIDE: BRANDING --- */}
        <div className="hidden lg:flex flex-col justify-between bg-[#3d3f96] p-16 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          
          <div className="relative z-10">
            <Link href="/">
              <Image 
                src="/logo/diabeteslogo.png" 
                alt="Diabeteswala" 
                width={160} 
                height={40} 
                className="brightness-0 invert mb-12"
              />
            </Link>
            <h1 className="text-5xl font-black leading-tight mb-6">
              Join the <br />
              <span className="text-blue-300">Care Network.</span>
            </h1>
            <p className="text-blue-100/70 text-lg font-medium max-w-md">
              Create an account to access India's most advanced diabetes management ecosystem.
            </p>
          </div>

          <div className="relative z-10">
            <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-sm font-bold">
                    <CheckSquare className="text-emerald-400" size={20} />
                    <span>Personalized Health Dashboard</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-bold">
                    <CheckSquare className="text-emerald-400" size={20} />
                    <span>Verified Medical Professionals</span>
                </div>
            </div>
            <p className="text-[10px] text-blue-200/50 font-bold uppercase tracking-[0.3em]">
              Diabeteswala • Secure Registration
            </p>
          </div>
        </div>

        {/* --- RIGHT SIDE: SIGNUP FORM --- */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 mb-2">Create Account</h2>
            <p className="text-slate-500 font-medium text-sm">Select your profile type to get started</p>
          </div>

          {/* --- ROLE SELECTION GRID --- */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all
                  ${role === r.id 
                    ? 'border-[#3d3f96] bg-blue-50 text-[#3d3f96] shadow-sm' 
                    : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                  }`}
              >
                <div className={`${role === r.id ? 'text-[#3d3f96]' : 'text-slate-400'}`}>
                  {r.icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-tighter">
                  {r.label}
                </span>
              </button>
            ))}
          </div>

          {/* --- FORM --- */}
          <form className="space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={role}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Name Field */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    {role === 'Home' ? 'Full Name' : `${role} Name / Title`}
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Enter name"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-[#3d3f96] transition-all"
                    />
                  </div>
                </div>

                {/* Email/Phone Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input type="email" placeholder="email@example.com" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-[#3d3f96] transition-all" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input type="tel" placeholder="+91 00000 00000" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-[#3d3f96] transition-all" />
                        </div>
                    </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Create Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-[#3d3f96] transition-all"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 px-1 py-2">
                <input type="checkbox" className="mt-1 rounded border-slate-300 text-[#3d3f96] focus:ring-[#3d3f96]" />
                <p className="text-[11px] text-slate-500 font-medium leading-tight">
                    I agree to the <Link href="#" className="text-[#3d3f96] font-bold">Terms of Service</Link> and <Link href="#" className="text-[#3d3f96] font-bold">Privacy Policy</Link>.
                </p>
            </div>

            {/* Signup Button */}
            <button className="w-full bg-[#3d3f96] hover:bg-[#2d2f75] text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-blue-100 transition-all active:scale-95 mt-4">
              Register as {role}
              <UserPlus size={18} />
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Already have an account? 
              <Link href="/authFiles/login" className="text-[#3d3f96] ml-2 hover:underline">Login Here</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SignupPage;