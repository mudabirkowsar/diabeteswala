"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Phone } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { useNotification } from '../../../../context/NotificationContext';
import UserAPI from '../../../../services/UserAPI'; // Adjust path based on your structure

const UserLogin = () => {
    const { login } = useAuth();
    const { showNotification } = useNotification();

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Form State
    const [identifier, setIdentifier] = useState(""); // Can be email or phone
    const [password, setPassword] = useState("");

    // Helper to check if input is an email
    const isEmail = (input) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(input);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let credentials = { password };

            // Construct payload based on documentation
            if (isEmail(identifier)) {
                credentials.email = identifier;
            } else {
                // Assuming it's a phone number if not an email
                credentials.phone = identifier;
                credentials.countryCode = "+91"; // Defaulting to +91 as per your previous context
            }

            const response = await UserAPI.loginUser(credentials);

            if (response.success) {
                // 1. Update Global Auth State
                login(response.user, response.token);

                // 2. Show Success Notification
                showNotification("Welcome back to Diabetes Wala!", "success");
            } else {
                showNotification(response.message || "Invalid Credentials", "error");
            }
        } catch (err) {
            // Handle API errors (400, 401, 500 etc)
            const errorMessage = err.response?.data?.message || "Login failed. Please check your credentials.";
            showNotification(errorMessage, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleLogin} className="space-y-5 antialiased">
            {/* Email or Phone Field */}
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
                        placeholder="e.g. name@mail.com or 9876543210"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:ring-4 focus:ring-blue-50 transition-all"
                    />
                </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                    <Link href="/forgot-password" size={18} className="text-[11px] font-bold text-[#3d3f96] hover:underline">
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
    );
};

export default UserLogin;