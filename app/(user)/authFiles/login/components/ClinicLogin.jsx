"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, Loader2,
  Clock, XCircle, UploadCloud, LogOut
} from 'lucide-react';
import { useNotification } from '../../../../context/NotificationContext';
import ClinicAPI from '../../../../services/ClinicAPI'; // Adjust path based on your structure

const ClinicLogin = () => {
  const router = useRouter();
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Modal Control States
  const [statusModal, setStatusModal] = useState(null); // 'Pending', 'Incomplete', 'Rejected', or null
  const [rejectReason, setRejectReason] = useState("");

  const handleLogoutAndClear = () => {
    // Clear stored token and reset states
    localStorage.removeItem('clinicToken');
    setStatusModal(null);
    setEmail("");
    setPassword("");
    showNotification("Logged out successfully.", "info");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusModal(null);

    try {
      const credentials = { email, password };
      const response = await ClinicAPI.loginClinic(credentials);
      // alert(JSON.stringify(response.Accountverify)); 

      if (response.success) {
        const verifyStatus = response.Accountverify;

        // 1. Handle Approved Account
        if (verifyStatus === 'Approved') {
          if (response.token) {
            localStorage.setItem('clinicToken', response.token);
          }
          showNotification("Welcome back!", "success");
          router.push('/vendors/clinic/dashboard');
          return;
        }

        // Store token if it exists in incomplete/rejected responses to grant authorized access to document pages
        if (response.token) {
          localStorage.setItem('clinicToken', response.token);
        }

        // 2. Handle Pending Account
        if (verifyStatus === 'Pending') {
          setStatusModal('Pending');
        }
        // 3. Handle Incomplete Account
        else if (verifyStatus === 'Incomplete') {
          // setStatusModal('Incomplete');
          router.push('/vendors/clinic/documents');
        }
        // 4. Handle Rejected Account
        else if (verifyStatus === 'Rejected') {
          setRejectReason(response.rejectReason || "No specific reason provided.");
          setStatusModal('Rejected');
        }
      } else {
        showNotification(response.message || "Invalid Credentials", "error");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Login failed. Please check your credentials.";
      showNotification(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleLogin} className="space-y-5 antialiased">
        {/* Email Field */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Email Address
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3d3f96] transition-colors">
              <Mail size={18} />
            </div>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aarav.wellness@example.com"
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:ring-4 focus:ring-blue-50 transition-all"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
            <Link href="/forgot-password" className="text-[11px] font-bold text-[#3d3f96] hover:underline">
              Forgot Password?
            </Link>
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3d3f96] transition-colors" size={18} />
            <input
              required
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:ring-4 focus:ring-blue-50 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          disabled={loading}
          type="submit"
          className="w-full bg-[#3d3f96] hover:bg-[#2d2f75] text-white py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-blue-100 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={20} />
              <span>Authenticating...</span>
            </div>
          ) : (
            <>
              Login to Account
              <ArrowRight size={18} />
            </>
          )}
        </button>

        {/* Security Note */}
        <p className="text-[10px] text-center text-slate-400 font-medium uppercase tracking-tighter">
          Your data is encrypted and secure with Diabetes Wala
        </p>
      </form>

      {/* ================= STATUS DIALOG MODALS ================= */}

      {/* 1. PENDING REVIEW MODAL */}
      {statusModal === 'Pending' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 p-8 text-center relative animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 flex items-center justify-center text-amber-600 text-3xl mx-auto mb-5 animate-pulse">
              <Clock size={32} />
            </div>
            <h3 className="text-xl font-black text-gray-800">Profile Under Review</h3>
            <p className="text-xs text-gray-400 mt-3 leading-relaxed">
              Your clinic application is currently undergoing verification by our administrators. This process typically takes 24-48 hours.
            </p>
            <div className="bg-amber-50/50 border border-amber-100/50 rounded-2xl p-4 my-5 text-amber-800 text-xs font-semibold">
              You will receive an email notification once approval is completed.
            </div>
            <button
              onClick={handleLogoutAndClear}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-widest transition-all"
            >
              <LogOut size={14} /> Back & Logout
            </button>
          </div>
        </div>
      )}

      {/* 2. INCOMPLETE PROFILE MODAL */}
      {statusModal === 'Incomplete' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 p-8 text-center relative animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-blue-100 flex items-center justify-center text-blue-600 text-3xl mx-auto mb-5">
              <UploadCloud size={32} />
            </div>
            <h3 className="text-xl font-black text-gray-800">Credentials Required</h3>
            <p className="text-xs text-gray-400 mt-3 leading-relaxed">
              Your account exists, but valid medical license documents are required before listing your practice.
            </p>
            <div className="bg-blue-50/50 border border-blue-100/50 rounded-2xl p-4 my-5 text-blue-800 text-xs font-semibold">
              Complete documentation setup to list your clinic on our network.
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push('/vendors/clinic/documents')}
                className="w-full py-4 rounded-2xl bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-100"
              >
                Upload Documents Now
              </button>
              <button
                onClick={handleLogoutAndClear}
                className="w-full py-3 text-slate-400 hover:text-slate-600 text-xs font-bold transition-all"
              >
                Back to Log In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. REJECTED PROFILE MODAL */}
      {statusModal === 'Rejected' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 p-8 text-center relative animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-rose-100 flex items-center justify-center text-rose-600 text-3xl mx-auto mb-5">
              <XCircle size={32} />
            </div>
            <h3 className="text-xl font-black text-gray-800">Application Rejected</h3>
            <p className="text-xs text-gray-400 mt-3 leading-relaxed">
              The administration system was unable to verify your clinical credentials.
            </p>
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 my-5 text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 block mb-1">Reason for Rejection</span>
              <p className="text-xs font-bold text-rose-700 leading-normal">{rejectReason}</p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push('/vendors/clinic/documents')}
                className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-rose-100"
              >
                Re-upload Credentials
              </button>
              <button
                onClick={handleLogoutAndClear}
                className="w-full py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-widest transition-all"
              >
                Back & Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ClinicLogin;