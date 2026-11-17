"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail, Phone, Lock, Eye, EyeOff, ArrowRight, Loader2,
  Clock, XCircle, UploadCloud, LogOut, Building2, UserCheck, ChevronDown
} from 'lucide-react';
import { useNotification } from '../../../../context/NotificationContext';
import IndependentDoctorAPI from '../../../../services/IndependentDoctorAPI';
// Import your Clinic Doctor API service (adjust path if needed)
import ClinicDoctorAPI from '../../../../services/ClinicDoctorAPI';

const DoctorLogin = () => {
  const router = useRouter();
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Doctor Type Selection: 'independent' | 'clinic'
  const [doctorType, setDoctorType] = useState('independent');

  // Form State (Accepts Email or Phone)
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  // Modal Control States
  const [statusModal, setStatusModal] = useState(null); // 'Pending', 'Incomplete', 'Rejected', or null
  const [rejectReason, setRejectReason] = useState("");

  const handleLogoutAndClear = () => {
    // Clear both tokens if any exist
    localStorage.removeItem('independentDoctorToken');
    localStorage.removeItem('clinicDoctorToken');
    setStatusModal(null);
    setIdentifier("");
    setPassword("");
    showNotification("Logged out successfully.", "info");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusModal(null);

    const cleanIdentifier = identifier.trim();
    const isEmail = cleanIdentifier.includes('@');
    const credentials = {
      ...(isEmail ? { email: cleanIdentifier.toLowerCase() } : { phone: cleanIdentifier }),
      identifier: cleanIdentifier, // Provided for clinic doctor generic compatibility
      password: password
    };

    try {
      // ==========================================
      // FLOW 1: INDEPENDENT DOCTOR LOGIN
      // ==========================================
      if (doctorType === 'independent') {
        const response = await IndependentDoctorAPI.loginIndependentDoctor(credentials);

        if (response.success) {
          const verifyStatus = response.profileStatus || response.data?.profileStatus;

          // 1. Approved Doctor
          if (verifyStatus === 'Approved') {
            if (response.token) {
              localStorage.setItem('independentDoctorToken', response.token);
            }
            showNotification("Welcome back, Doctor!", "success");
            router.push('/vendors/independentdoctor/dashboard');
            return;
          }

          // Intermediate token for document review
          if (response.token) {
            localStorage.setItem('independentDoctorToken', response.token);
          }

          // 2. Pending
          if (verifyStatus === 'Pending') {
            setStatusModal('Pending');
          }
          // 3. Incomplete
          else if (verifyStatus === 'Incomplete') {
            showNotification("Please complete your medical KYC documents.", "warning");
            router.push('/vendors/independentdoctor/documents');
          }
          // 4. Rejected
          else if (verifyStatus === 'Rejected') {
            setRejectReason(response.rejectionReason || "Medical license or degree certificate verification failed.");
            setStatusModal('Rejected');
          }
        } else {
          showNotification(response.message || "Invalid Credentials", "error");
        }
      } 
      // ==========================================
      // FLOW 2: CLINIC DOCTOR LOGIN
      // ==========================================
      else {
        const response = await ClinicDoctorAPI.clinicDoctorLogin(credentials);

        if (response.success) {
          const verifyStatus = response.profileStatus || response.data?.profileStatus;

          // 1. Approved Clinic Doctor
          if (verifyStatus === 'Approved' && response.fullAccess) {
            if (response.token) {
              localStorage.setItem('clinicDoctorToken', response.token);
            }
            showNotification(`Welcome back, ${response.data?.name || 'Doctor'}!`, "success");
            router.push('/vendors/clinicdoctor/dashboard');
            return;
          }

          // 2. Under Review
          if (verifyStatus === 'Pending') {
            setStatusModal('Pending');
          }
          // 3. Incomplete
          else if (verifyStatus === 'Incomplete') {
            setStatusModal('Incomplete');
          }
          // 4. Rejected
          else if (verifyStatus === 'Rejected') {
            setRejectReason(response.rejectionReason || response.message || "Profile rejected by medical administrator.");
            setStatusModal('Rejected');
          }
        } else {
          showNotification(response.message || "Invalid Credentials", "error");
        }
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Login failed. Please verify credentials.";
      showNotification(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleLogin} className="space-y-5 antialiased">
        {/* DOCTOR TYPE SELECTOR */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Practitioner Type
          </label>
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setDoctorType('independent');
                setStatusModal(null);
              }}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold transition-all ${
                doctorType === 'independent'
                  ? 'bg-white text-[#3d3f96] shadow-md shadow-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserCheck size={16} />
              <span>Independent</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setDoctorType('clinic');
                setStatusModal(null);
              }}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold transition-all ${
                doctorType === 'clinic'
                  ? 'bg-white text-[#3d3f96] shadow-md shadow-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 size={16} />
              <span>Clinic Doctor</span>
            </button>
          </div>
        </div>

        {/* Email or Phone Field */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Registered Email or Phone Number
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3d3f96] transition-colors">
              {identifier.includes('@') ? <Mail size={18} /> : <Phone size={18} />}
            </div>
            <input
              required
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={doctorType === 'clinic' ? "e.g. 9876543210 or sharma.clinic@example.com" : "e.g. 9876543210 or dr.ramesh@example.com"}
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
              <span>Authenticating {doctorType === 'clinic' ? 'Clinic' : 'Independent'} Doctor...</span>
            </div>
          ) : (
            <>
              Login as {doctorType === 'clinic' ? 'Clinic Doctor' : 'Independent Doctor'}
              <ArrowRight size={18} />
            </>
          )}
        </button>

        {/* Security Note */}
        <p className="text-[10px] text-center text-slate-400 font-medium uppercase tracking-tighter">
          Encrypted Healthcare Provider Authentication • Diabetes Wala
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
            <h3 className="text-xl font-black text-gray-800">
              {doctorType === 'clinic' ? 'Clinic Doctor Under Review' : 'Medical Credentials Under Review'}
            </h3>
            <p className="text-xs text-gray-400 mt-3 leading-relaxed">
              {doctorType === 'clinic'
                ? "Your clinic association and credentials are being reviewed by the administration. You will get access once verified."
                : "Your medical licenses and qualifications are undergoing verification by our Medical Council review board. This typically takes 24-48 hours."}
            </p>
            <div className="bg-amber-50/50 border border-amber-100/50 rounded-2xl p-4 my-5 text-amber-800 text-xs font-semibold">
              Please check back later or contact your clinic administrator for approval status.
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
            <h3 className="text-xl font-black text-gray-800">Profile Details Incomplete</h3>
            <p className="text-xs text-gray-400 mt-3 leading-relaxed">
              {doctorType === 'clinic'
                ? "Your profile is incomplete. Please contact your Clinic Administrator to submit your medical license and practice details."
                : "Your account exists, but your Medical License, Degree Certificates, and Digital Signature are required before you can accept appointments."}
            </p>
            <div className="bg-blue-50/50 border border-blue-100/50 rounded-2xl p-4 my-5 text-blue-800 text-xs font-semibold">
              {doctorType === 'clinic'
                ? "Clinic management is authorized to complete your documentation."
                : "Complete your KYC documentation to list your practice on our platform."}
            </div>
            <div className="flex flex-col gap-3">
              {doctorType === 'independent' ? (
                <button
                  onClick={() => {
                    setStatusModal(null);
                    router.push('/vendors/independentdoctor/documents');
                  }}
                  className="w-full py-4 rounded-2xl bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-100"
                >
                  Upload Medical Documents Now
                </button>
              ) : null}
              <button
                onClick={handleLogoutAndClear}
                className="w-full py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-widest transition-all"
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
            <h3 className="text-xl font-black text-gray-800">Application Needs Attention</h3>
            <p className="text-xs text-gray-400 mt-3 leading-relaxed">
              {doctorType === 'clinic'
                ? "Your clinic doctor verification could not be completed by administration."
                : "The Medical Review Board was unable to verify your submitted practitioner credentials."}
            </p>
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 my-5 text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 block mb-1">Reason for Rejection</span>
              <p className="text-xs font-bold text-rose-700 leading-normal">{rejectReason}</p>
            </div>
            <div className="flex flex-col gap-3">
              {doctorType === 'independent' ? (
                <button
                  onClick={() => {
                    setStatusModal(null);
                    router.push('/vendors/independentdoctor/documents');
                  }}
                  className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-rose-100"
                >
                  Re-upload Clear Documents
                </button>
              ) : null}
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

export default DoctorLogin;