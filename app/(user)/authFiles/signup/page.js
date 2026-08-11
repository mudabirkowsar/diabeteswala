"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Stethoscope, Building2, Beaker, Pill, Apple, CheckSquare 
} from 'lucide-react';

// Import the sub-components (Create these files in the same folder)
import UserRegister from './components/UserRegister';
import DoctorRegister from './components/DoctorRegister';
import ClinicRegister from './components/ClinicRegister';
import LabsRegister from './components/LabsRegister';
import PharmacyRegister from './components/PharmacyRegister';
import ExpertRegister from './components/ExpertRegister';

const SignupPage = () => {
  const [role, setRole] = useState('Home');

  const roles = [
    { id: 'Home', label: 'User', icon: <User size={18} /> },
    { id: 'Doctor', label: 'Doctor', icon: <Stethoscope size={18} /> },
    { id: 'Clinic', label: 'Clinic', icon: <Building2 size={18} /> },
    { id: 'Labs', label: 'Labs', icon: <Beaker size={18} /> },
    { id: 'Pharmacy', label: 'Pharmacy', icon: <Pill size={18} /> },
    { id: 'Food & Nutrition', label: 'Expert', icon: <Apple size={18} /> },
  ];

  // Component Mapping Logic
  const renderRegisterForm = () => {
    switch (role) {
      case 'Home': return <UserRegister />;
      case 'Doctor': return <DoctorRegister />;
      case 'Clinic': return <ClinicRegister />;
      case 'Labs': return <LabsRegister />;
      case 'Pharmacy': return <PharmacyRegister />;
      case 'Food & Nutrition': return <ExpertRegister />;
      default: return <UserRegister />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f7ff] flex items-center justify-center p-4 md:p-10">
      <div className="max-w-[1200px] w-full bg-white rounded-[3rem] shadow-2xl shadow-blue-100 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        
        {/* --- LEFT SIDE: BRANDING (Static) --- */}
        <div className="hidden lg:flex flex-col justify-between bg-[#3d3f96] p-16 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="relative z-10">
            <Link href="/"><Image src="/logo/diabeteslogo.png" alt="Logo" width={160} height={40} className="brightness-0 invert mb-12" /></Link>
            <h1 className="text-5xl font-black leading-tight mb-6">Join the <br /><span className="text-blue-300">Care Network.</span></h1>
            <p className="text-blue-100/70 text-lg font-medium max-w-md">Create an account to access India's most advanced diabetes management ecosystem.</p>
          </div>
          <div className="relative z-10">
            <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-sm font-bold"><CheckSquare className="text-emerald-400" size={20} /><span>Personalized Health Dashboard</span></div>
                <div className="flex items-center gap-3 text-sm font-bold"><CheckSquare className="text-emerald-400" size={20} /><span>Verified Medical Professionals</span></div>
            </div>
            <p className="text-[10px] text-blue-200/50 font-bold uppercase tracking-[0.3em]">Diabeteswala • Secure Registration</p>
          </div>
        </div>

        {/* --- RIGHT SIDE: DYNAMIC CONTENT --- */}
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
                  ${role === r.id ? 'border-[#3d3f96] bg-blue-50 text-[#3d3f96] shadow-sm' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'}`}
              >
                <div className={`${role === r.id ? 'text-[#3d3f96]' : 'text-slate-400'}`}>{r.icon}</div>
                <span className="text-[10px] font-black uppercase tracking-tighter">{r.label}</span>
              </button>
            ))}
          </div>

          {/* --- DYNAMIC FORM INJECTION --- */}
          <AnimatePresence mode="wait">
            <motion.div
              key={role}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderRegisterForm()}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Already have an account? <Link href="/authFiles/login" className="text-[#3d3f96] ml-2 hover:underline">Login Here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;