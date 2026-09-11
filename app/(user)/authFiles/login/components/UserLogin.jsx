"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    Loader2,
    Phone,
    KeyRound,
    CheckCircle2,
    AlertCircle,
    UserCheck,
    ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { useNotification } from '../../../../context/NotificationContext';
import UserAPI from '../../../../services/UserAPI'; // Adjust path if needed

const UserLogin = () => {
    const router = useRouter();
    const { login } = useAuth();
    const { showNotification } = useNotification();

    // Input States
    const [identifier, setIdentifier] = useState("");
    const [countryCode, setCountryCode] = useState("+91");
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Real-time Status States: 'IDLE' | 'PASSWORD_SET' | 'PASSWORD_NOT_SET' | 'NOT_REGISTERED'
    const [status, setStatus] = useState('IDLE');
    const [checkingStatus, setCheckingStatus] = useState(false);
    const [userData, setUserData] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Password Visibility Toggles
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Ref to handle debounce race conditions
    const latestPhoneRef = useRef("");

    const isEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

    // =========================================================================
    // 1. REAL-TIME AUTO CHECK WHILE TYPING
    // =========================================================================
    useEffect(() => {
        const cleanPhone = identifier.replace(/[^0-9]/g, '');
        latestPhoneRef.current = cleanPhone;

        // If email format, allow standard login directly
        if (isEmail(identifier.trim())) {
            setStatus('PASSWORD_SET');
            setUserData(null);
            setCheckingStatus(false);
            return;
        }

        // When phone reaches exactly 10 digits
        if (cleanPhone.length === 10) {
            const checkPasswordStatus = async () => {
                setCheckingStatus(true);
                try {
                    const response = await UserAPI.checkUserPasswordStatus({
                        phone: cleanPhone,
                        countryCode: countryCode
                    });

                    // Ignore if input has changed in the meantime
                    if (latestPhoneRef.current !== cleanPhone) return;

                    if (response.success) {
                        setUserData(response.data || null);

                        if (response.isPasswordAvailable) {
                            // User already has a password set
                            setStatus('PASSWORD_SET');
                        } else {
                            // User is registered (Clinic Walk-in) but NO password set
                            setStatus('PASSWORD_NOT_SET');
                            showNotification(response.message || "Please set your password to continue.", "info");
                        }
                    } else {
                        setStatus('NOT_REGISTERED');
                        setUserData(null);
                    }
                } catch (err) {
                    if (latestPhoneRef.current === cleanPhone) {
                        setStatus('NOT_REGISTERED');
                        setUserData(null);
                    }
                } finally {
                    if (latestPhoneRef.current === cleanPhone) {
                        setCheckingStatus(false);
                    }
                }
            };

            const timer = setTimeout(checkPasswordStatus, 300);
            return () => clearTimeout(timer);
        } else {
            // Reset if number is incomplete or cleared
            setStatus('IDLE');
            setUserData(null);
            setCheckingStatus(false);
        }
    }, [identifier, countryCode]);

    // =========================================================================
    // 2. FORM SUBMIT HANDLER (LOGIN OR SET INITIAL PASSWORD)
    // =========================================================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // -------------------------------------------------------------
            // CASE A: User has password -> Standard Login
            // -------------------------------------------------------------
            if (status === 'PASSWORD_SET') {
                let credentials = { password };
                if (isEmail(identifier)) {
                    credentials.email = identifier.trim();
                } else {
                    credentials.phone = identifier.replace(/[^0-9]/g, '');
                    credentials.countryCode = countryCode;
                }

                const res = await UserAPI.loginUser(credentials);
                if (res.success) {
                    // Update Auth Context State
                    login(res.user, res.token);
                    showNotification("Welcome back to Diabetes Wala!", "success");

                    // Redirect to home page
                    router.push('/');
                } else {
                    showNotification(res.message || "Invalid credentials", "error");
                }
            }
            // -------------------------------------------------------------
            // CASE B: isPasswordAvailable is FALSE -> Set Password & Auto Login
            // -------------------------------------------------------------
            else if (status === 'PASSWORD_NOT_SET') {
                if (newPassword.length < 6) {
                    showNotification("Password must be at least 6 characters long.", "error");
                    setSubmitting(false);
                    return;
                }

                if (newPassword !== confirmPassword) {
                    showNotification("Passwords do not match.", "error");
                    setSubmitting(false);
                    return;
                }

                const payload = {
                    phone: identifier.replace(/[^0-9]/g, ''),
                    countryCode: countryCode,
                    newPassword: newPassword,
                    confirmPassword: confirmPassword
                };

                const res = await UserAPI.setUserInitialPassword(payload);

                if (res.success) {
                    // 1. Auto login user with token & user object from API
                    login(res.user, res.token);

                    // 2. Notify success
                    showNotification("Password set successfully! You are now logged in.", "success");

                    // 3. Redirect user directly to Home page
                    router.push('/');
                } else {
                    showNotification(res.message || "Failed to set password.", "error");
                }
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Operation failed. Please try again.";
            showNotification(errorMsg, "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 antialiased">

            {/* Phone or Email Input */}
            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Phone Number or Email
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
                        placeholder="e.g. 9876543210"
                        className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:ring-4 focus:ring-blue-50 transition-all"
                    />

                    {/* Real-time Status Icon */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {checkingStatus && <Loader2 className="animate-spin text-[#3d3f96]" size={18} />}
                        {!checkingStatus && status === 'PASSWORD_SET' && <CheckCircle2 className="text-emerald-500" size={18} />}
                        {!checkingStatus && status === 'PASSWORD_NOT_SET' && <KeyRound className="text-amber-500" size={18} />}
                        {!checkingStatus && status === 'NOT_REGISTERED' && <AlertCircle className="text-rose-500" size={18} />}
                    </div>
                </div>
            </div>

            {/* ERROR MESSAGE IF USER IS NOT REGISTERED */}
            {status === 'NOT_REGISTERED' && !checkingStatus && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-between text-rose-700 text-xs font-semibold animate-in fade-in duration-200">
                    <span>User is not registered. Please register first.</span>
                    <Link href="/authFiles/signup" className="text-[#3d3f96] font-bold underline ml-2">
                        Sign Up
                    </Link>
                </div>
            )}

            {/* WELCOME BADGE FOR FOUND USER */}
            {userData && status !== 'IDLE' && !checkingStatus && (
                <div className="px-3.5 py-2.5 bg-blue-50/60 border border-blue-100/80 rounded-2xl flex items-center gap-2.5 animate-in fade-in duration-200">
                    <UserCheck size={16} className="text-[#3d3f96]" />
                    <p className="text-xs font-bold text-slate-700">
                        Hello, <span className="text-[#3d3f96]">{userData.name || "Patient"}</span>
                    </p>
                </div>
            )}

            {/* ========================================================= */}
            {/* OPTION 1: USER ALREADY HAS PASSWORD (PASSWORD_SET)        */}
            {/* ========================================================= */}
            {status === 'PASSWORD_SET' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Password
                            </label>
                            <Link href="/forgot-password" className="text-[11px] font-bold text-[#3d3f96] hover:underline">
                                Forgot Password?
                            </Link>
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3d3f96] transition-colors" size={18} />
                            <input
                                required
                                autoFocus
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

                    <button
                        disabled={submitting}
                        type="submit"
                        className="w-full bg-[#3d3f96] hover:bg-[#2d2f75] text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-blue-100 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="animate-spin" size={18} />
                                <span>Logging in...</span>
                            </div>
                        ) : (
                            <>
                                <span>Login to Account</span>
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* ========================================================= */}
            {/* OPTION 2: isPasswordAvailable: false (SET PASSWORD FLOW)  */}
            {/* ========================================================= */}
            {status === 'PASSWORD_NOT_SET' && (
                <div className="space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="p-3 bg-amber-50 border border-amber-100/80 rounded-2xl flex items-center gap-2.5 text-amber-800">
                        <KeyRound size={18} className="shrink-0 text-amber-600" />
                        <p className="text-xs font-semibold leading-tight">
                            Password is not set yet. Please set your password to activate your account.
                        </p>
                    </div>

                    {/* New Password */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Set New Password
                        </label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3d3f96] transition-colors" size={18} />
                            <input
                                required
                                autoFocus
                                type={showNewPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Min. 6 characters (e.g. MyPassword@123)"
                                className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:ring-4 focus:ring-blue-50 transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Confirm Password
                        </label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3d3f96] transition-colors" size={18} />
                            <input
                                required
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter same password"
                                className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:ring-4 focus:ring-blue-50 transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Set Password Button */}
                    <button
                        disabled={submitting}
                        type="submit"
                        className="w-full bg-[#3d3f96] hover:bg-[#2d2f75] text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-blue-100 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-1"
                    >
                        {submitting ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="animate-spin" size={18} />
                                <span>Setting Password & Logging in...</span>
                            </div>
                        ) : (
                            <>
                                <span>Set Password & Login</span>
                                <ShieldCheck size={18} />
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Helper text when waiting for input */}
            {status === 'IDLE' && (
                <p className="text-[11px] text-center text-slate-400 font-medium pt-1">
                    Enter your registered 10-digit mobile number to proceed
                </p>
            )}
        </form>
    );
};

export default UserLogin;