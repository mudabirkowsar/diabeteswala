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
// import ClinicLogin from './components/ClinicLogin';
// import LabsLogin from './components/LabsLogin';
// import PharmacyLogin from './components/PharmacyLogin';
// import ExpertLogin from './components/ExpertLogin';

const LoginPage = () => {
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
  const renderLoginForm = () => {
    switch (role) {
      case 'Home': return <UserLogin />;
      // case 'Doctor': return <DoctorLogin />;
      // case 'Clinic': return <ClinicLogin />;
      // case 'Labs': return <LabsLogin />;
      // case 'Pharmacy': return <PharmacyLogin />;
      // case 'Food & Nutrition': return <ExpertLogin />;
      default: return <UserLogin />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f7ff] flex items-center justify-center p-4 md:p-10">
      <div className="max-w-[1200px] w-full bg-white rounded-[3rem] shadow-2xl shadow-blue-100 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        
        {/* --- LEFT SIDE: BRANDING (Static) --- */}
        <div className="hidden lg:flex flex-col justify-between bg-[#3d3f96] p-16 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          
          <div className="relative z-10">
            <Link href="/">
              <Image 
                src="/logo/diabeteslogo.png" 
                alt="Logo" 
                width={160} 
                height={40} 
                className="brightness-0 invert mb-12"
              />
            </Link>
            <h1 className="text-5xl font-black leading-tight mb-6">
              The Professional <br />
              <span className="text-blue-300">Care Portal.</span>
            </h1>
            <p className="text-blue-100/70 text-lg font-medium max-w-md">
              Access your specialized dashboard to manage patients, orders, and health analytics.
            </p>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 mb-6">
              <ShieldCheck className="text-emerald-400" />
              <p className="text-sm font-bold">Secure Multi-Role Authentication</p>
            </div>
            <p className="text-[10px] text-blue-200/50 font-bold uppercase tracking-[0.3em]">
              Diabeteswala Ecosystem
            </p>
          </div>
        </div>

        {/* --- RIGHT SIDE: DYNAMIC CONTENT --- */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 mb-2">Login</h2>
            <p className="text-slate-500 font-medium text-sm">Select your department to sign in</p>
          </div>

          {/* --- ROLE SELECTION GRID --- */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all
                  ${role === r.id 
                    ? 'border-[#3d3f96] bg-blue-50 text-[#3d3f96] shadow-sm' 
                    : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                  }`}
              >
                <div className={`${role === r.id ? 'text-[#3d3f96]' : 'text-slate-400'}`}>
                  {r.icon}
                </div>
                <span className="text-[11px] font-black uppercase tracking-tighter text-center">
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

          <div className="mt-8 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              New to Diabeteswala? 
              <Link href="/authFiles/signup" className="text-[#3d3f96] ml-2 hover:underline">Create Account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;