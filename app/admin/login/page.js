"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Mail, Lock, Eye, EyeOff, ArrowRight, Loader2,
    Phone, ShieldCheck, X, AlertTriangle
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import AdminAPI from '../../services/AdminAPI'; // Adjust path based on your structure

export default function AdminLoginPage() {
    const router = useRouter();

    // --- Safe Notification Wrapper & Fallback ---
    const notificationContext = useNotification();
    const [localAlert, setLocalAlert] = useState(null);

    const triggerNotification = (message, type = 'info') => {
        if (notificationContext && typeof notificationContext.showNotification === 'function') {
            notificationContext.showNotification(message, type);
        } else {
            setLocalAlert({ message, type });
            setTimeout(() => setLocalAlert(null), 4000);
        }
    };

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Form State
    const [identifier, setIdentifier] = useState(""); // Can be email or phone
    const [password, setPassword] = useState("");

    // Email Check Helper
    const isEmail = (input) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(input);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const credentials = { password };

            // Construct payload based on documentation options
            if (isEmail(identifier)) {
                credentials.email = identifier.trim();
            } else {
                credentials.phone = identifier.trim();
            }

            const response = await AdminAPI.loginAdmin(credentials);

            if (response.success) {
                // 1. Store credentials & configuration in local storage
                localStorage.setItem('adminToken', response.token);
                localStorage.setItem('adminRole', response.admin?.role);
                localStorage.setItem('allowedTabs', JSON.stringify(response.admin?.allowedTabs));

                // 2. Call global auth login trigger if context exists
                // if (login) {
                //     login(response.admin, response.token);
                // }

                triggerNotification("Successfully logged in as administrator", "success");

                // 3. Redirect to Admin Dashboard
                router.push('/admin');
            } else {
                triggerNotification(response.message || "Invalid Admin Credentials", "error");
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Login failed. Please check your admin credentials.";
            triggerNotification(errorMessage, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-8 select-none antialiased relative">

            {/* Fallback Local Toast Overlay */}
            {localAlert && (
                <div className={`fixed top-6 right-6 z-50 p-4 rounded-2xl shadow-xl border text-xs font-black flex items-center gap-3 animate-bounce ${localAlert.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                    localAlert.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-800' :
                        localAlert.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-800' :
                            'bg-slate-50 border-slate-100 text-slate-800'
                    }`}>
                    <span>{localAlert.message}</span>
                    <button type="button" onClick={() => setLocalAlert(null)} className="text-slate-400 hover:text-slate-600">
                        <X size={14} />
                    </button>
                </div>
            )}

            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-800/10 max-w-md w-full overflow-hidden p-8 md:p-12 relative">

                {/* Admin Verification Header Icon */}
                <div className="text-center mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#3d3f96] flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck size={28} />
                    </div>
                    <span className="text-[10px] uppercase font-black tracking-widest text-[#3d3f96] bg-indigo-50 px-3 py-1.5 rounded-full">
                        Secure System Gate
                    </span>
                    <h2 className="text-2xl font-black text-gray-800 mt-4">Admin Access</h2>
                    <p className="text-xs text-gray-400 mt-1.5">Sign in with authorized administrative privileges</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    {/* Identifier Input */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Email or Phone Number
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3d3f96] transition-colors">
                                {isEmail(identifier) ? <Mail size={18} /> : <Phone size={18} />}
                            </div>
                            <input
                                required
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                placeholder="superadmin@example.com or +919876543210"
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:ring-4 focus:ring-blue-50 transition-all"
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                            <Link href="/admin/forgot-password" className="text-[11px] font-bold text-[#3d3f96] hover:underline">
                                Help Center
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
                        className="w-full bg-[#3d3f96] hover:bg-[#2d2f75] text-white py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="animate-spin" size={20} />
                                <span>Verifying clearance...</span>
                            </div>
                        ) : (
                            <>
                                Authenticate Admin
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>

                    {/* Encryption Notice */}
                    <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-wider pt-2">
                        Standard AES-256 session encryption active
                    </p>
                </form>

            </div>
        </div>
    );
}