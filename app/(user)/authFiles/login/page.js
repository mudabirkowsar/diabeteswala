"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Stethoscope, Building2, Beaker, Pill, Apple, ShieldCheck
} from 'lucide-react';

// Import the sub-components (Create these files in the same folder)
import UserLogin from './components/UserLogin';
// import DoctorLogin from './components/DoctorLogin';
import ClinicLogin from './components/ClinicLogin';
import LabsLogin from './components/LabsLogin';
import PharmacyLogin from './components/PharmacyLogin';
import ExpertLogin from './components/ExpertLogin';

const LoginPage = () => {
  const [role, setRole] = useState('Home');

  const roles = [
    { id: 'Home', label: 'User', icon: <User size={18} /> },
    { id: 'Doctor', label: 'Doctor', icon: <Stethoscope size={18} /> },
    { id: 'Clinic', label: 'Clinic', icon: <Building2 size={18} /> },
    { id: 'Labs', label: 'Labs', icon: <Beaker size={18} /> },
    { id: 'Pharmacy', label: 'Pharmacy', icon: <Pill size={18} /> },
    { id: 'Food & Nutrition', label: 'Food & Nutrition', icon: <Apple size={18} /> },
  ];

  // Component Mapping Logic
  const renderLoginForm = () => {
    switch (role) {
      case 'Home': return <UserLogin />;
      // case 'Doctor': return <DoctorLogin />;
      case 'Clinic': return <ClinicLogin />;
      case 'Labs': return <LabsLogin />;
      case 'Pharmacy': return <PharmacyLogin />;
      case 'Food & Nutrition': return <ExpertLogin />;
      default: return <UserLogin />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f7ff] to-[#fcfdff] flex items-center justify-center p-4 md:p-10 antialiased">
      <div className="max-w-[1200px] w-full bg-white rounded-[2.5rem] sm:rounded-[3.5rem] shadow-[0_20px_60px_rgba(61,63,150,0.06)] border border-slate-100/80 overflow-hidden grid grid-cols-1 lg:grid-cols-2">

        {/* --- LEFT SIDE: BRANDING (Static) --- */}
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-b from-white to-[#f5f9ff] p-16 text-slate-800 relative overflow-hidden border-r border-slate-100">
          {/* Soft Ambient decorative blobs using brand colors */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#EB333C]/5 rounded-full -mr-24 -mt-24 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#3d3f96]/5 rounded-full -ml-20 -mb-20 blur-3xl"></div>

          <div className="relative z-10">
            <Link href="/">
              <Image
                src="/logo/diabeteslogo.png"
                alt="Logo"
                width={160}
                height={40}
                className="mb-12 object-contain"
                priority
              />
            </Link>
            <h1 className="text-5xl font-black leading-tight mb-6 text-slate-900">
              The Professional <br />
              <span className="text-[#EB333C]">Care Portal.</span>
            </h1>
            <p className="text-slate-500 text-lg font-medium max-w-md">
              Access your specialized dashboard to manage patients, orders, and health analytics.
            </p>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6">
              <ShieldCheck className="text-emerald-500 shrink-0" size={20} />
              <p className="text-sm font-bold text-slate-700">Secure Multi-Role Authentication</p>
            </div>
            <p className="text-[10px] text-[#3d3f96] font-black uppercase tracking-[0.3em]">
              Diabeteswala Ecosystem
            </p>
          </div>
        </div>

        {/* --- RIGHT SIDE: DYNAMIC CONTENT --- */}
        <div className="p-6 sm:p-10 md:p-16 flex flex-col justify-center">
          
          <div className="mb-6">
            {/* Ambient Status Chip */}
            <div className="inline-flex items-center gap-1.5 bg-indigo-50/60 border border-indigo-100/50 px-3 py-1 rounded-full mb-3">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EB333C] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#EB333C]"></span>
              </span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Ecosystem Auth</span>
            </div>
            
            <h2 className="text-3xl font-black text-slate-900 mb-1 tracking-tight">Login</h2>
            <p className="text-slate-400 font-semibold text-sm">Select your department to sign in</p>
          </div>

          {/* --- ROLE SELECTION GRID --- */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 active:scale-95 text-center cursor-pointer
                  ${role === r.id
                    ? 'border-[#3d3f96] bg-[#3d3f96]/5 text-[#3d3f96] shadow-sm font-extrabold'
                    : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 font-bold'
                  }`}
              >
                {/* Micro-container for active icons */}
                <div className={`p-2.5 rounded-xl transition-colors duration-300 ${role === r.id ? 'bg-[#3d3f96] text-white shadow-md shadow-indigo-100' : 'bg-slate-50 text-slate-400'}`}>
                  {r.icon}
                </div>
                <span className="text-[10px] uppercase tracking-wider text-center">
                  {r.label}
                </span>
              </button>
            ))}
          </div>

          {/* --- DYNAMIC FORM INJECTION --- */}
          <AnimatePresence mode="wait">
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderLoginForm()}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 text-center border-t border-slate-50 pt-6">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              New to Diabeteswala?
              <Link href="/authFiles/signup" className="text-[#EB333C] ml-2 font-black hover:underline transition-all">Create Account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;