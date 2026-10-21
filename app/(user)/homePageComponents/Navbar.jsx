"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDown, User, Menu, X, LogOut, Settings,
  ClipboardList, UserCircle, LogIn, ShoppingBag, FileText,
  LayoutGrid, Package, Star, Sparkles,
  ChevronRight, MapPin, LocateFixed, Loader2, Pill,
  CheckCircle2, AlertCircle, ArrowUpRight, CreditCard,
  Building2, FlaskConical, Stethoscope, Utensils
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import UserAPI from '../../services/UserAPI';

const Navbar = () => {
  // Hardcoded coordinates for testing
  const HARDCODED_COORDS = {
    lat: 30.698396,
    lng: 76.6857
  };

  // Use isLoggedIn and logout directly from context for instant UI updates
  const { user, isLoggedIn, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isAccountSidebarOpen, setIsAccountSidebarOpen] = useState(false);
  const [isMobileShopOpen, setIsMobileShopOpen] = useState(false);

  // --- Location States ---
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [userLocationName, setUserLocationName] = useState("Detecting...");
  const [manualLocation, setManualLocation] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);

  // --- Profile Completion State ---
  const [completionData, setCompletionData] = useState(null);
  const [loadingCompletion, setLoadingCompletion] = useState(false);

  const pathname = usePathname();
  const { showNotification } = useNotification();

  // 1. Fetch Profile Completion Status
  const fetchProfileCompletion = async () => {
    if (!isLoggedIn) return;
    try {
      setLoadingCompletion(true);
      const res = await UserAPI.getUserProfileCompletionStatus();
      if (res?.success && res?.data) {
        setCompletionData(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch profile completion:", error);
    } finally {
      setLoadingCompletion(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchProfileCompletion();
    } else {
      setCompletionData(null);
    }
  }, [isLoggedIn, pathname]);

  // 2. Reverse Geocoding helper
  const fetchCityName = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await response.json();
      const city = data.address?.city || data.address?.town || data.address?.village || data.address?.state || "Kharar";
      return city;
    } catch (error) {
      console.error("Geocoding error:", error);
      return "Kharar";
    }
  };

  // 3. Location Detection
  const handleDetectLocation = async () => {
    setIsDetecting(true);
    try {
      const { lat, lng } = HARDCODED_COORDS;
      const coords = { lat, lng };

      const cityName = await fetchCityName(lat, lng);

      setUserLocationName(cityName);
      localStorage.setItem('userCoords', JSON.stringify(coords));
      localStorage.setItem('userLocationName', cityName);

      setIsDetecting(false);
      setIsLocationModalOpen(false);
      showNotification(`Location set to ${cityName} (Test Mode)`, "success");
    } catch (error) {
      setIsDetecting(false);
      setUserLocationName("Kharar");
      showNotification("Failed to set test location", "error");
    }
  };

  useEffect(() => {
    handleDetectLocation();
  }, []);

  const handleManualLocationSubmit = (e) => {
    e.preventDefault();
    if (manualLocation.trim()) {
      setUserLocationName(manualLocation);
      localStorage.setItem('userLocationName', manualLocation);
      localStorage.removeItem('userCoords');
      showNotification(`Location updated to ${manualLocation}`, "success");
      setIsLocationModalOpen(false);
      setManualLocation("");
    }
  };

  const allNavLinks = [
    { name: 'Home', href: '/' },
    { name: 'Clinic', href: '/clinic' },
    { name: 'Labs', href: '/labs' },
    { name: 'Pharmacy', href: '/pharmacy' },
    { name: 'Doctor', href: '/doctor' },
    { name: 'Food & Nutrition', href: '/food' },
    { name: 'Shop', href: '/shop', isShop: true },
    { name: 'Care Program', href: '/care-program' },
    { name: 'Science', href: '/science' },
    { name: 'About Us', href: '/about' },
    { name: 'Blogs', href: '/blogs' },
    { name: 'Videos', href: '/videos' },
  ].map(link => ({
    ...link,
    active: pathname === link.href
  }));

  const shopOptions = [
    { name: 'By Category', href: '/shop/categories', icon: <LayoutGrid size={14} /> },
    { name: 'By Products', href: '/shop/products', icon: <Package size={14} /> },
    { name: 'Best Sellers', href: '/shop/best-sellers', icon: <Star size={14} /> },
    { name: 'New Arrivals', href: '/shop/new', icon: <Sparkles size={14} /> },
  ];

  // Mobile Bottom Tab Items
  const bottomTabs = [
    { name: 'Clinic', href: '/clinic', icon: <Building2 size={19} /> },
    { name: 'Labs', href: '/labs', icon: <FlaskConical size={19} /> },
    { name: 'Pharmacy', href: '/pharmacy', icon: <Pill size={19} /> },
    { name: 'Doctor', href: '/doctor', icon: <Stethoscope size={19} /> },
    { name: 'Food', href: '/food', icon: <Utensils size={19} /> },
  ];

  const primaryLinks = allNavLinks.slice(0, 6);
  const secondaryLinks = allNavLinks.slice(6);

  const accountLinks = [
    { name: 'My Profile', icon: <UserCircle size={20} />, href: '/otherscreens/profile' },
    { name: 'My Appointments', icon: <ClipboardList size={20} />, href: '/otherscreens/myappointments' },
    { name: 'My Orders', icon: <ShoppingBag size={20} />, href: '/otherscreens/orders' },
    { name: 'Tiffin Services', icon: <ShoppingBag size={20} />, href: '/otherscreens/tiffinorders' },
    { name: 'Ambulance Bookings', icon: <FileText size={20} />, href: '/otherscreens/myambulancebookings' },
    { name: 'Lab Reports', icon: <FileText size={20} />, href: '/reports' },
    { name: 'My Prescriptions', icon: <FileText size={20} />, href: '/prescriptions' },
    { name: 'Settings', icon: <Settings size={20} />, href: '/settings' },
  ];

  const percentage = completionData?.percentage ?? 0;
  const isComplete = completionData?.is100PercentCompleted ?? false;

  return (
    <>
      {/* ========================================================
          1. MAIN TOP NAVBAR
      ======================================================== */}
      <nav className="w-full sticky top-0 z-50 transition-all duration-300 antialiased bg-[#EBF2FC] border-b border-[#D4E4FA] py-2.5 sm:py-4 shadow-sm">
        <div className="max-w-[1536px] mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">

          {/* --- Logo --- */}
          <div className="flex-shrink-0 transition-transform duration-200 active:scale-95">
            <Link href="/">
              <Image
                src="/logo/diabeteslogo.png"
                alt="Diabetes Wala"
                width={145}
                height={38}
                className="object-contain h-7 sm:h-9 w-auto"
                priority
              />
            </Link>
          </div>

          {/* --- Desktop Nav Links --- */}
          <div className="hidden lg:flex items-center space-x-1">
            {primaryLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-[13px] font-bold px-3 py-2 rounded-lg transition-all duration-200 relative whitespace-nowrap ${link.active ? 'text-red-600 bg-red-50/60' : 'text-gray-600 hover:text-[#3d3f96] hover:bg-white/60'
                  }`}
              >
                {link.name}
                {link.active && <span className="absolute bottom-1 left-3 right-3 h-[2px] bg-red-500 rounded-full"></span>}
              </Link>
            ))}

            <div className="relative group">
              <button className="text-[13px] font-bold px-3 py-2 rounded-lg text-gray-600 hover:text-[#3d3f96] hover:bg-white/60 flex items-center gap-1.5 transition-all">
                <span>More</span>
                <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
              </button>
              <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-gray-100 rounded-xl shadow-xl p-2 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all origin-top-left flex flex-col gap-0.5">
                {secondaryLinks.map((link) => (
                  link.isShop ? (
                    <div key={link.name} className="relative group/shop">
                      <div className={`text-[13px] font-semibold px-3 py-2.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${link.active ? 'text-red-600 bg-red-50/60' : 'text-gray-600 hover:text-[#3d3f96] hover:bg-slate-50'
                        }`}>
                        <span>{link.name}</span>
                        <ChevronRight size={14} className="text-gray-400" />
                      </div>
                      <div className="absolute top-0 left-full ml-1 w-48 bg-white border border-gray-100 rounded-xl shadow-2xl p-2 opacity-0 scale-95 pointer-events-none group-hover/shop:opacity-100 group-hover/shop:scale-100 group-hover/shop:pointer-events-auto transition-all origin-left flex flex-col gap-0.5">
                        {shopOptions.map((opt) => (
                          <Link key={opt.name} href={opt.href} className="flex items-center gap-2 text-[12px] font-bold text-gray-600 px-3 py-2 rounded-lg hover:bg-blue-50 hover:text-[#3d3f96] transition-colors">
                            <span className="text-slate-400">{opt.icon}</span> {opt.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`text-[13px] font-semibold px-3 py-2.5 rounded-lg transition-colors flex items-center justify-between ${link.active ? 'text-red-600 bg-red-50/60' : 'text-gray-600 hover:text-[#3d3f96] hover:bg-slate-50'
                        }`}
                    >
                      {link.name}
                    </Link>
                  )
                ))}
              </div>
            </div>
          </div>

          {/* --- Desktop Location Selector --- */}
          <div className="hidden md:flex flex-1 max-w-[240px] lg:max-w-[260px] items-center">
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="relative w-full flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-1.5 bg-white/60 backdrop-blur-md border border-slate-200 hover:border-[#3d3f96] hover:bg-white rounded-2xl transition-all duration-300 shadow-sm group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#3d3f96]/0 via-[#3d3f96]/5 to-[#3d3f96]/0 opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000" />

              <div className="shrink-0 bg-[#3d3f96]/10 p-1.5 sm:p-2 rounded-xl group-hover:bg-[#3d3f96] group-hover:text-white transition-all duration-300">
                {isDetecting ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <MapPin size={15} />
                )}
              </div>

              <div className="flex flex-col items-start overflow-hidden text-left">
                <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] leading-none mb-1">
                  Deliver to
                </span>
                <div className="flex items-center gap-1 w-full">
                  <span className="text-[11px] sm:text-xs font-black text-slate-700 truncate group-hover:text-[#3d3f96] transition-colors">
                    {userLocationName}
                  </span>
                </div>
              </div>

              <div className="ml-auto pl-1 sm:pl-2 border-l border-slate-100 group-hover:border-[#3d3f96]/20 transition-colors">
                <ChevronDown
                  size={13}
                  className="text-slate-400 group-hover:text-[#3d3f96] transition-transform duration-300 group-hover:translate-y-0.5"
                />
              </div>
            </button>
          </div>

          {/* --- Auth Hub & Profile Indicator --- */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {!isLoggedIn ? (
              <Link
                href="/authFiles/login"
                className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#3d3f96] text-white rounded-xl hover:bg-[#2d2f75] transition-all shadow-md active:scale-95 text-xs font-bold"
              >
                <LogIn size={16} /> <span className="hidden sm:inline">Login / Sign Up</span>
              </Link>
            ) : (
              <button
                onClick={() => {
                  fetchProfileCompletion();
                  setIsAccountSidebarOpen(true);
                }}
                className="flex items-center gap-2 p-1 sm:pl-1.5 sm:pr-3 sm:py-1.5 border border-transparent hover:border-gray-200 hover:bg-white bg-white/40 rounded-xl transition-all duration-200"
              >
                <div className="relative">
                  <div className="bg-[#3d3f96] text-white p-1 rounded-lg">
                    <User size={16} strokeWidth={2.5} />
                  </div>
                  {completionData && !isComplete && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white ring-1 ring-amber-300 animate-pulse" />
                  )}
                </div>
                <div className="hidden sm:flex flex-col items-start leading-tight">
                  <span className="text-xs font-bold text-gray-700">My Account</span>
                  {completionData && (
                    <span className={`text-[9px] font-black uppercase tracking-tight ${isComplete ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {percentage}% Completed
                    </span>
                  )}
                </div>
              </button>
            )}

            {/* Mobile Hamburger Drawer Trigger */}
            <button
              className="lg:hidden p-1.5 text-gray-600 hover:bg-white/80 rounded-xl transition-colors"
              onClick={() => setIsOpen(true)}
              aria-label="Open Mobile Menu"
            >
              <Menu size={22} strokeWidth={2.25} />
            </button>
          </div>
        </div>
      </nav>

      {/* ========================================================
          2. MOBILE BOTTOM NAVIGATION BAR
      ======================================================== */}
      <aside aria-label="Mobile Navigation" className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] px-2 py-1.5 safe-area-pb">
        <div className="grid grid-cols-5 items-center justify-around max-w-lg mx-auto">
          {bottomTabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 group active:scale-95 ${isActive ? 'text-[#3d3f96]' : 'text-slate-500 hover:text-slate-900'
                  }`}
              >
                <div
                  className={`p-1.5 rounded-xl transition-all duration-200 ${isActive
                      ? 'bg-[#3d3f96]/10 text-[#3d3f96] scale-105 shadow-sm'
                      : 'text-slate-500 group-hover:text-slate-800'
                    }`}
                >
                  {tab.icon}
                </div>
                <span className={`text-[10px] tracking-tight mt-0.5 truncate w-full text-center ${isActive ? 'font-extrabold text-[#3d3f96]' : 'font-semibold text-slate-500'
                  }`}>
                  {tab.name}
                </span>
              </Link>
            );
          })}
        </div>
      </aside>

      {/* ========================================================
          3. MOBILE NAVIGATION DRAWER
      ======================================================== */}
      <div className={`fixed inset-0 z-[55] lg:hidden ${isOpen ? "visible" : "invisible"}`}>
        <div
          className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setIsOpen(false)}
        />
        <div
          className={`absolute right-0 top-0 bottom-0 h-full w-full max-w-[320px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
          <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 bg-slate-50/50">
            <span className="font-extrabold text-sm sm:text-base text-gray-800">Diabetes Wala</span>
            <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100">
              <X size={18} />
            </button>
          </div>

          <div className="p-3 border-b border-gray-100">
            <button
              onClick={() => {
                setIsOpen(false);
                setIsLocationModalOpen(true);
              }}
              className="flex items-center gap-2.5 w-full p-2.5 bg-slate-50 rounded-xl text-left"
            >
              <MapPin size={16} className="text-[#3d3f96]" />
              <span className="text-xs font-bold text-gray-700 truncate">{userLocationName}</span>
            </button>
          </div>

          <div className="p-3 border-b border-gray-100">
            {!isLoggedIn ? (
              <Link
                href="/authFiles/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#3d3f96] text-white rounded-xl font-bold text-xs"
              >
                <LogIn size={16} /> Login / Sign Up
              </Link>
            ) : (
              <div className="space-y-2.5">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    fetchProfileCompletion();
                    setIsAccountSidebarOpen(true);
                  }}
                  className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl w-full text-left"
                >
                  <div className="bg-[#3d3f96] text-white p-2 rounded-xl">
                    <User size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-gray-800 truncate">{user?.name || "User"}</p>
                    <p className="text-[10px] text-gray-400 truncate">{user?.phone || user?.email}</p>
                  </div>
                </button>

                {/* Mobile View Profile Card Button */}
                <Link
                  href="/otherscreens/profilecard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between w-full px-3 py-2.5 bg-gradient-to-r from-[#3d3f96] to-indigo-600 hover:from-[#2d2f75] hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm group"
                >
                  <div className="flex items-center gap-2">
                    <CreditCard size={15} className="text-indigo-200 group-hover:text-white" />
                    <span>View Your Profile Card</span>
                  </div>
                  <ChevronRight size={14} className="text-indigo-200 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                {/* Mobile Profile Completion Card */}
                {completionData && (
                  <Link
                    href="/otherscreens/profile"
                    onClick={() => setIsOpen(false)}
                    className="block p-3 rounded-xl bg-gradient-to-br from-indigo-50/70 to-blue-50/50 border border-indigo-100"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Profile Completion</span>
                      <span className={`text-[11px] font-black ${isComplete ? 'text-emerald-600' : 'text-[#3d3f96]'}`}>
                        {percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-2">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-emerald-500' : 'bg-gradient-to-r from-[#3d3f96] to-indigo-500'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    {completionData.nextStep && !isComplete && (
                      <p className="text-[9px] font-bold text-amber-700 truncate">
                        Next: {completionData.nextStep}
                      </p>
                    )}
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 pb-16">
            {allNavLinks.map((link) => (
              <div key={link.name}>
                {link.isShop ? (
                  <div className="flex flex-col">
                    <button
                      onClick={() => setIsMobileShopOpen(!isMobileShopOpen)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold w-full text-left ${link.active ? 'text-red-600 bg-red-50/60' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      <span>{link.name}</span>
                      <ChevronDown size={14} className={`transition-transform duration-200 ${isMobileShopOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isMobileShopOpen && (
                      <div className="pl-6 mt-1 space-y-1 border-l-2 border-slate-100 ml-4">
                        {shopOptions.map((opt) => (
                          <Link
                            key={opt.name}
                            href={opt.href}
                            onClick={() => setIsOpen(false)}
                            className="block px-3 py-2 text-xs font-bold text-slate-500 hover:text-[#3d3f96]"
                          >
                            {opt.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold ${link.active ? 'text-red-600 bg-red-50/60' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <span>{link.name}</span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================
          4. ACCOUNT SIDEBAR DRAWER
      ======================================================== */}
      <div className={`fixed inset-0 z-[60] ${isAccountSidebarOpen ? "visible" : "invisible"}`}>
        <div
          className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${isAccountSidebarOpen ? "opacity-100" : "opacity-0"
            }`}
          onClick={() => setIsAccountSidebarOpen(false)}
        />
        <div
          className={`absolute right-0 top-0 bottom-0 h-full w-full max-w-[340px] sm:max-w-[360px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out transform ${isAccountSidebarOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
          <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
            <h2 className="text-lg sm:text-xl font-black text-gray-800 tracking-tight">My Account</h2>
            <button
              onClick={() => setIsAccountSidebarOpen(false)}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          <div className="p-4 sm:p-5 bg-slate-50/60 border-b border-gray-100 space-y-3.5">
            {/* User Details Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#3d3f96] text-white flex items-center justify-center text-xl sm:text-2xl font-black shadow-md shadow-indigo-100 shrink-0">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm sm:text-base font-black text-gray-800 truncate">{user?.name || "User"}</h3>
                <p className="text-[11px] font-bold text-gray-400 truncate">{user?.phone || user?.email}</p>
                <Link
                  href="/otherscreens/profile"
                  onClick={() => setIsAccountSidebarOpen(false)}
                  className="text-[10px] font-black text-[#3d3f96] uppercase tracking-wider inline-flex items-center gap-1 hover:underline mt-0.5"
                >
                  Edit Profile <ArrowUpRight size={11} />
                </Link>
              </div>
            </div>

            {/* Profile Card Button */}
            <Link
              href="/otherscreens/profilecard"
              onClick={() => setIsAccountSidebarOpen(false)}
              className="flex items-center justify-between w-full px-3.5 py-2.5 bg-gradient-to-r from-[#3d3f96] to-indigo-600 hover:from-[#2d2f75] hover:to-indigo-700 text-white rounded-xl shadow-sm transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <CreditCard size={16} className="text-indigo-200 group-hover:text-white transition-colors" />
                <span className="text-xs font-bold">View Your Profile Card</span>
              </div>
              <ChevronRight size={14} className="text-indigo-200 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* Profile Completion Checklist */}
            {completionData && (
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Profile Status</span>
                    {isComplete ? (
                      <span className="bg-emerald-100 text-emerald-700 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                        Verified
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-700 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                        Action Required
                      </span>
                    )}
                  </div>
                  <span className={`text-xs font-black ${isComplete ? 'text-emerald-600' : 'text-[#3d3f96]'}`}>
                    {percentage}%
                  </span>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isComplete
                        ? 'bg-emerald-500'
                        : percentage >= 50
                          ? 'bg-gradient-to-r from-[#3d3f96] to-indigo-500'
                          : 'bg-amber-500'
                      }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {!isComplete && completionData.nextStep && (
                  <div className="flex items-start gap-1.5 bg-amber-50/70 p-2 rounded-xl text-[10px] text-amber-800 font-bold">
                    <AlertCircle size={13} className="text-amber-500 shrink-0 mt-0.5" />
                    <span>{completionData.nextStep}</span>
                  </div>
                )}

                {completionData.checklist && (
                  <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-1.5">
                    {[
                      { key: 'mainUserDetails', label: 'User Details' },
                      { key: 'diseaseDetails', label: 'Disease Details' },
                      { key: 'addressDetails', label: 'Address' },
                      { key: 'familyMemberDetails', label: 'Family Circle' },
                    ].map(({ key, label }) => {
                      const done = !!completionData.checklist[key];
                      return (
                        <div key={key} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
                          {done ? (
                            <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                          ) : (
                            <span className="w-3 h-3 rounded-full border border-slate-300 inline-block shrink-0" />
                          )}
                          <span className={`truncate ${done ? 'text-slate-700' : 'text-slate-400'}`}>{label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Account Links */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1">
            {accountLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsAccountSidebarOpen(false)}
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold text-gray-600 hover:bg-slate-50 hover:text-[#3d3f96] transition-all group"
              >
                <span className="text-gray-400 group-hover:text-[#3d3f96] transition-colors">{link.icon}</span>
                <span className="flex-1">{link.name}</span>
                <ChevronDown size={14} className="-rotate-90 text-gray-300 group-hover:text-[#3d3f96]" />
              </Link>
            ))}
          </div>

          <div className="p-3 sm:p-4 border-t border-gray-100">
            <button
              onClick={() => {
                logout();
                setIsAccountSidebarOpen(false);
                showNotification("You have been logged out.", "info");
              }}
              className="flex items-center justify-center gap-2 sm:gap-3 w-full py-3 sm:py-3.5 bg-red-50 text-red-600 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm hover:bg-red-100 transition-colors"
            >
              <LogOut size={16} /> Logout from Account
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          5. LOCATION MODAL
      ======================================================== */}
      <div className={`fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 ${isLocationModalOpen ? "visible" : "invisible"}`}>
        <div
          className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${isLocationModalOpen ? "opacity-100" : "opacity-0"
            }`}
          onClick={() => setIsLocationModalOpen(false)}
        />
        <div
          className={`relative bg-white w-full max-w-md rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 shadow-2xl transition-all duration-300 transform ${isLocationModalOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
        >
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-black text-slate-800">Change Location</h3>
            <button
              onClick={() => setIsLocationModalOpen(false)}
              className="p-1.5 hover:bg-slate-100 rounded-full"
            >
              <X size={18} />
            </button>
          </div>

          <button
            onClick={handleDetectLocation}
            disabled={isDetecting}
            className="w-full flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 bg-blue-50 text-[#3d3f96] rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm hover:bg-blue-100 transition-all mb-4 sm:mb-6 disabled:opacity-50"
          >
            {isDetecting ? <Loader2 size={18} className="animate-spin" /> : <LocateFixed size={18} />} Detect My Location
          </button>

          <div className="relative flex items-center gap-3 mb-4 sm:mb-6">
            <div className="h-px bg-slate-100 flex-1" />
            <span className="text-[9px] sm:text-[10px] font-black text-slate-300 uppercase tracking-widest">Or enter manually</span>
            <div className="h-px bg-slate-100 flex-1" />
          </div>

          <form onSubmit={handleManualLocationSubmit} className="space-y-3 sm:space-y-4">
            <div className="relative">
              <MapPin className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Enter city or area"
                value={manualLocation}
                onChange={(e) => setManualLocation(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold text-slate-700 outline-none focus:border-[#3d3f96] transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 sm:py-4 bg-[#3d3f96] text-white rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm shadow-lg sm:shadow-xl hover:bg-[#2d2f75] transition-all"
            >
              Update Location
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Navbar;