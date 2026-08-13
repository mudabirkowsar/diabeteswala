"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDown, User, Menu, X, LogOut, Settings,
  ClipboardList, UserCircle, LogIn, ShoppingBag, FileText,
  LayoutGrid, Package, Star, Sparkles,
  ChevronRight, MapPin, LocateFixed, Loader2, Pill
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
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

  const pathname = usePathname();
  const { showNotification } = useNotification();

  // 1. Function to get City Name from Coordinates (Reverse Geocoding)
  const fetchCityName = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await response.json();
      const city = data.address.city || data.address.town || data.address.village || data.address.state || "Patiala";
      return city;
    } catch (error) {
      console.error("Geocoding error:", error);
      return "Patiala";
    }
  };

  // 2. Main Detection Logic
  const handleDetectLocation = () => {
    setIsDetecting(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const coords = { lat: latitude, lng: longitude };

          const cityName = await fetchCityName(latitude, longitude);

          setUserLocationName(cityName);
          localStorage.setItem('userCoords', JSON.stringify(coords));
          localStorage.setItem('userLocationName', cityName);

          setIsDetecting(false);
          setIsLocationModalOpen(false);
          showNotification(`Location set to ${cityName}`, "success");
        },
        (error) => {
          setIsDetecting(false);
          setUserLocationName("Patiala");
          showNotification("Location access denied. Defaulting to Patiala.", "warning");
        }
      );
    } else {
      setIsDetecting(false);
      setUserLocationName("Patiala");
      showNotification("Geolocation not supported", "error");
    }
  };

  // 3. Auto-run on first visit
  useEffect(() => {
    const savedLoc = localStorage.getItem('userLocationName');
    if (savedLoc) {
      setUserLocationName(savedLoc);
    } else {
      handleDetectLocation();
    }
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
    { name: 'Doctor', href: '/doctor' },
    { name: 'Clinic', href: '/clinic' },
    { name: 'Labs', href: '/labs' },
    { name: 'Pharmacy', href: '/pharmacy' },
    { name: 'Food & Nutrition', href: '/food-nutrition' },
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

  const primaryLinks = allNavLinks.slice(0, 6);
  const secondaryLinks = allNavLinks.slice(6);

  const accountLinks = [
    { name: 'My Profile', icon: <UserCircle size={20} />, href: '/otherscreens/profile' },
    { name: 'My Appointments', icon: <ClipboardList size={20} />, href: '/appointments' },
    { name: 'My Orders', icon: <ShoppingBag size={20} />, href: '/orders' },
    { name: 'Lab Reports', icon: <FileText size={20} />, href: '/reports' },
    { name: 'My Prescriptions', icon: <FileText size={20} />, href: '/prescriptions' },
    { name: 'Settings', icon: <Settings size={20} />, href: '/settings' },
  ];

  return (
    <nav className="w-full sticky top-0 z-50 transition-all duration-300 antialiased bg-[#EBF2FC] border-b border-[#D4E4FA] py-4 shadow-sm">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">

        {/* --- 1. Logo --- */}
        <div className="flex-shrink-0 transition-transform duration-200 active:scale-95">
          <Link href="/">
            <Image src="/logo/diabeteslogo.png" alt="Diabetes Wala" width={145} height={38} className="object-contain h-9 w-auto" priority />
          </Link>
        </div>

        {/* --- 2. Desktop Nav --- */}
        <div className="hidden lg:flex items-center space-x-1">
          {primaryLinks.map((link) => (
            <Link key={link.name} href={link.href} className={`text-[13px] font-bold px-3 py-2 rounded-lg transition-all duration-200 relative whitespace-nowrap ${link.active ? 'text-red-600 bg-red-50/60' : 'text-gray-600 hover:text-[#3d3f96] hover:bg-white/60'}`}>
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
                    <div className={`text-[13px] font-semibold px-3 py-2.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${link.active ? 'text-red-600 bg-red-50/60' : 'text-gray-600 hover:text-[#3d3f96] hover:bg-slate-50'}`}>
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
                  <Link key={link.name} href={link.href} className={`text-[13px] font-semibold px-3 py-2.5 rounded-lg transition-colors flex items-center justify-between ${link.active ? 'text-red-600 bg-red-50/60' : 'text-gray-600 hover:text-[#3d3f96] hover:bg-slate-50'}`}>
                    {link.name}
                  </Link>
                )
              ))}
            </div>
          </div>
        </div>

        {/* --- 3. Enhanced Location Selector --- */}
        <div className="hidden md:flex flex-1 max-w-[260px] items-center">
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="relative w-full flex items-center gap-3 px-4 py-1.5 bg-white/60 backdrop-blur-md border border-slate-200 hover:border-[#3d3f96] hover:bg-white rounded-2xl transition-all duration-300 shadow-sm group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#3d3f96]/0 via-[#3d3f96]/5 to-[#3d3f96]/0 opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000" />

            <div className="shrink-0 bg-[#3d3f96]/10 p-2 rounded-xl group-hover:bg-[#3d3f96] group-hover:text-white transition-all duration-300">
              {isDetecting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <MapPin size={16} />
              )}
            </div>

            <div className="flex flex-col items-start overflow-hidden text-left">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] leading-none mb-1">
                Deliver to
              </span>
              <div className="flex items-center gap-1 w-full">
                <span className="text-xs font-black text-slate-700 truncate group-hover:text-[#3d3f96] transition-colors">
                  {userLocationName}
                </span>
              </div>
            </div>

            <div className="ml-auto pl-2 border-l border-slate-100 group-hover:border-[#3d3f96]/20 transition-colors">
              <ChevronDown
                size={14}
                className="text-slate-400 group-hover:text-[#3d3f96] transition-transform duration-300 group-hover:translate-y-0.5"
              />
            </div>
          </button>
        </div>

        {/* --- 4. Auth Hub & Carts --- */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Desktop Hoverable Cart Menu */}
          {/* <div className="relative group shrink-0 hidden sm:block">
            <button className="flex items-center gap-2 p-1.5 sm:px-3.5 sm:py-2 border border-transparent hover:border-gray-200 hover:bg-white bg-white/40 rounded-xl transition-all duration-200">
              <div className="bg-[#3d3f96]/10 text-[#3d3f96] p-1.5 rounded-lg group-hover:bg-[#3d3f96] group-hover:text-white transition-all duration-200">
                <ShoppingBag size={16} strokeWidth={2.5} />
              </div>
              <span className="text-xs font-bold text-gray-700">Cart</span>
              <ChevronDown size={12} className="text-slate-400 group-hover:rotate-180 transition-transform duration-300" />
            </button>

            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-xl p-1.5 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all origin-top-right flex flex-col gap-0.5 z-50">
              <Link href="/otherscreens/carts/pharmacycart" className="flex items-center gap-2.5 text-[12px] font-bold text-gray-600 px-3 py-2.5 rounded-lg hover:bg-blue-50 hover:text-[#3d3f96] transition-colors">
                <div className="p-1 bg-slate-50 text-[#3d3f96] rounded-md shrink-0">
                  <Pill size={14} />
                </div>
                <span>Pharmacy Cart</span>
              </Link>
              <Link href="/otherscreens/carts/labcart" className="flex items-center gap-2.5 text-[12px] font-bold text-gray-600 px-3 py-2.5 rounded-lg hover:bg-blue-50 hover:text-[#3d3f96] transition-colors">
                <div className="p-1 bg-slate-50 text-[#3d3f96] rounded-md shrink-0">
                  <FileText size={14} />
                </div>
                <span>Lab Cart</span>
              </Link>
              <Link href="/food-nutrition/cart" className="flex items-center gap-2.5 text-[12px] font-bold text-gray-600 px-3 py-2.5 rounded-lg hover:bg-blue-50 hover:text-[#3d3f96] transition-colors">
                <div className="p-1 bg-slate-50 text-[#3d3f96] rounded-md shrink-0">
                  <ShoppingBag size={14} />
                </div>
                <span>Food Cart</span>
              </Link>
            </div>
          </div> */}

          {!isLoggedIn ? (
            <Link href="/authFiles/login" className="flex items-center gap-2 px-4 py-2 bg-[#3d3f96] text-white rounded-xl hover:bg-[#2d2f75] transition-all shadow-md active:scale-95">
              <LogIn size={18} /> <span className="text-xs font-bold hidden sm:inline">Login / Sign Up</span>
            </Link>
          ) : (
            <button onClick={() => setIsAccountSidebarOpen(true)} className="flex items-center gap-2 p-1.5 sm:pl-1.5 sm:pr-3 sm:py-1.5 border border-transparent hover:border-gray-200 hover:bg-white bg-white/40 rounded-xl transition-all duration-200">
              <div className="bg-[#3d3f96] text-white p-1 rounded-lg"><User size={18} strokeWidth={2.5} /></div>
              <span className="text-xs font-bold hidden sm:inline text-gray-700">My Account</span>
            </button>
          )}
          <button className="lg:hidden p-2 text-gray-600 hover:bg-white/80 rounded-xl" onClick={() => setIsOpen(true)}>
            <Menu size={24} strokeWidth={2.25} />
          </button>
        </div>
      </div>

      {/* --- 5. Mobile Navigation Drawer --- */}
      <div className={`fixed inset-0 z-50 lg:hidden ${isOpen ? "visible" : "invisible"}`}>
        <div className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`} onClick={() => setIsOpen(false)}></div>
        <div className={`absolute right-0 top-0 bottom-0 h-full w-full max-w-[320px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 bg-slate-50/50">
            <span className="font-extrabold text-base text-gray-800">Diabetes Wala</span>
            <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"><X size={20} /></button>
          </div>
          <div className="p-4 border-b border-gray-100">
            <button onClick={() => { setIsOpen(false); setIsLocationModalOpen(true); }} className="flex items-center gap-3 w-full p-3 bg-slate-50 rounded-xl text-left">
              <MapPin size={18} className="text-[#3d3f96]" />
              <span className="text-xs font-bold text-gray-700 truncate">{userLocationName}</span>
            </button>
          </div>
          <div className="p-4 border-b border-gray-100">
            {!isLoggedIn ? (
              <Link href="/authFiles/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 w-full py-3 bg-[#3d3f96] text-white rounded-xl font-bold text-sm">
                <LogIn size={18} /> Login / Sign Up
              </Link>
            ) : (
              <button onClick={() => { setIsOpen(false); setIsAccountSidebarOpen(true) }} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl w-full text-left">
                <div className="bg-[#3d3f96] text-white p-2 rounded-xl"><User size={20} /></div>
                <div className="flex-1 min-w-0"><p className="text-sm font-black text-gray-800 truncate">{user?.name || "John Doe"}</p></div>
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
            {allNavLinks.map((link) => (
              <div key={link.name}>
                {link.isShop ? (
                  <div className="flex flex-col">
                    <button onClick={() => setIsMobileShopOpen(!isMobileShopOpen)} className={`flex items-center justify-between px-3 py-3 rounded-xl text-sm font-bold ${link.active ? 'text-red-600 bg-red-50/60' : 'text-gray-600 hover:bg-gray-50'}`}>
                      <span>{link.name}</span> <ChevronDown size={14} className={`transition-transform ${isMobileShopOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isMobileShopOpen && (
                      <div className="pl-6 mt-1 space-y-1 border-l-2 border-slate-100 ml-4">
                        {shopOptions.map(opt => (
                          <Link key={opt.name} href={opt.href} onClick={() => setIsOpen(false)} className="block px-3 py-2 text-xs font-bold text-slate-500">{opt.name}</Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link key={link.name} href={link.href} onClick={() => setIsOpen(false)} className={`flex items-center justify-between px-3 py-3 rounded-xl text-sm font-bold ${link.active ? 'text-red-600 bg-red-50/60' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <span>{link.name}</span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- 6. Account Sidebar Drawer --- */}
      <div className={`fixed inset-0 z-[60] ${isAccountSidebarOpen ? "visible" : "invisible"}`}>
        <div className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${isAccountSidebarOpen ? "opacity-100" : "opacity-0"}`} onClick={() => setIsAccountSidebarOpen(false)}></div>
        <div className={`absolute right-0 top-0 bottom-0 h-full w-full max-w-[350px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out transform ${isAccountSidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex justify-between items-center px-6 py-6 border-b border-gray-100">
            <h2 className="text-xl font-black text-gray-800 tracking-tight">My Account</h2>
            <button onClick={() => setIsAccountSidebarOpen(false)} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"><X size={20} strokeWidth={2.5} /></button>
          </div>
          <div className="p-6 bg-slate-50/50 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#3d3f96] text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-indigo-100">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-800">{user?.name || "User"}</h3>
                <p className="text-xs font-bold text-gray-400">{user?.phone || user?.email}</p>
                <Link href="/otherscreens/profile" onClick={() => setIsAccountSidebarOpen(false)} className="text-[10px] font-black text-[#3d3f96] uppercase tracking-widest mt-1 inline-block hover:underline">Edit Profile</Link>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {accountLinks.map((link) => (
              <Link key={link.name} href={link.href} onClick={() => setIsAccountSidebarOpen(false)} className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold text-gray-600 hover:bg-slate-50 hover:text-[#3d3f96] transition-all group">
                <span className="text-gray-400 group-hover:text-[#3d3f96] transition-colors">{link.icon}</span>
                <span className="flex-1">{link.name}</span>
                <ChevronDown size={14} className="-rotate-90 text-gray-300 group-hover:text-[#3d3f96]" />
              </Link>
            ))}
          </div>
          <div className="p-4 border-t border-gray-100">
            <button onClick={() => { logout(); setIsAccountSidebarOpen(false); showNotification("You have been logged out.", "info"); }} className="flex items-center justify-center gap-3 w-full py-4 bg-red-50 text-red-600 rounded-2xl font-black text-sm hover:bg-red-100 transition-colors">
              <LogOut size={20} /> Logout from Account
            </button>
          </div>
        </div>
      </div>

      {/* --- 7. LOCATION MODAL --- */}
      <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 ${isLocationModalOpen ? "visible" : "invisible"}`}>
        <div className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${isLocationModalOpen ? "opacity-100" : "opacity-0"}`} onClick={() => setIsLocationModalOpen(false)}></div>
        <div className={`relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl transition-all duration-300 transform ${isLocationModalOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-slate-800">Change Location</h3>
            <button onClick={() => setIsLocationModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
          </div>
          <button onClick={handleDetectLocation} disabled={isDetecting} className="w-full flex items-center justify-center gap-3 py-4 bg-blue-50 text-[#3d3f96] rounded-2xl font-black text-sm hover:bg-blue-100 transition-all mb-6 disabled:opacity-50">
            {isDetecting ? <Loader2 size={20} className="animate-spin" /> : <LocateFixed size={20} />} Detect My Location
          </button>
          <div className="relative flex items-center gap-3 mb-6">
            <div className="h-px bg-slate-100 flex-1"></div>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Or enter manually</span>
            <div className="h-px bg-slate-100 flex-1"></div>
          </div>
          <form onSubmit={handleManualLocationSubmit} className="space-y-4">
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Enter city or area" value={manualLocation} onChange={(e) => setManualLocation(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-[#3d3f96] transition-all" />
            </div>
            <button type="submit" className="w-full py-4 bg-[#3d3f96] text-white rounded-2xl font-black text-sm shadow-xl hover:bg-[#2d2f75] transition-all">Update Location</button>
          </form>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;