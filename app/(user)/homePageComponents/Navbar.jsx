"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Search, 
  ChevronDown, 
  User, 
  Menu, 
  X, 
  LogOut, 
  Settings, 
  ClipboardList,
  UserCircle,
  LogIn,
  ShoppingBag,
  FileText,
  Heart,
  HelpCircle,
  Bell
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAccountSidebarOpen, setIsAccountSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Toggle this for testing
  const pathname = usePathname();

  const { showNotification } = useNotification();

  const allNavLinks = [
    { name: 'Home', href: '/' },
    { name: 'Doctor', href: '/doctor' },
    { name: 'Clinic', href: '/clinic' },
    { name: 'Labs', href: '/labs' },
    { name: 'Pharmacy', href: '/pharmacy' },
    { name: 'Food & Nutrition', href: '/food-nutrition' },
    { name: 'Shop', href: '/shop', hasDropdown: true },
    { name: 'Care Program', href: '/care-program' },
    { name: 'Science', href: '/science' },
    { name: 'About Us', href: '/about' },
    { name: 'Blogs', href: '/blogs' },
    { name: 'Videos', href: '/videos' },
  ].map(link => ({
    ...link,
    active: pathname === link.href
  }));

  const primaryLinks = allNavLinks.slice(0, 6);
  const secondaryLinks = allNavLinks.slice(6);

  const accountLinks = [
    { name: 'My Profile', icon: <UserCircle size={20} />, href: '/profile' },
    { name: 'My Appointments', icon: <ClipboardList size={20} />, href: '/appointments' },
    { name: 'My Orders', icon: <ShoppingBag size={20} />, href: '/orders' },
    { name: 'Lab Reports', icon: <FileText size={20} />, href: '/reports' },
    { name: 'My Prescriptions', icon: <FileText size={20} />, href: '/prescriptions' },
    // { name: 'Wishlist', icon: <Heart size={20} />, href: '/wishlist' },
    // { name: 'Notifications', icon: <Bell size={20} />, href: '/notifications' },
    { name: 'Settings', icon: <Settings size={20} />, href: '/settings' },
    // { name: 'Help & Support', icon: <HelpCircle size={20} />, href: '/support' },
  ];

  return (
    <nav className="w-full sticky top-0 z-50 transition-all duration-300 antialiased bg-[#EBF2FC] border-b border-[#D4E4FA] py-4 shadow-sm">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* --- 1. Logo --- */}
        <div className="flex-shrink-0 transition-transform duration-200 active:scale-95">
          <Link href="/">
            <Image 
              src="/logo/diabeteslogo.png" 
              alt="Diabetes Wala" 
              width={145} 
              height={38} 
              className="object-contain h-9 w-auto"
              priority
            />
          </Link>
        </div>

        {/* --- 2. Desktop Nav --- */}
        <div className="hidden lg:flex items-center space-x-1">
          {primaryLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-[13px] font-bold px-3 py-2 rounded-lg transition-all duration-200 relative whitespace-nowrap
                ${link.active 
                  ? 'text-red-600 bg-red-50/60' 
                  : 'text-gray-600 hover:text-[#3d3f96] hover:bg-white/60'
                }`}
            >
              {link.name}
              {link.active && <span className="absolute bottom-1 left-3 right-3 h-[2px] bg-red-500 rounded-full"></span>}
            </Link>
          ))}

          {/* More Dropdown */}
          <div className="relative group">
            <button className="text-[13px] font-bold px-3 py-2 rounded-lg text-gray-600 hover:text-[#3d3f96] hover:bg-white/60 flex items-center gap-1.5 transition-all">
              <span>More</span>
              <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
            </button>
            <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-100 rounded-xl shadow-xl p-2 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all origin-top-left flex flex-col gap-0.5">
              {secondaryLinks.map((link) => (
                <Link key={link.name} href={link.href} className={`text-[13px] font-semibold px-3 py-2.5 rounded-lg transition-colors flex items-center justify-between ${link.active ? 'text-red-600 bg-red-50/60' : 'text-gray-600 hover:text-[#3d3f96] hover:bg-slate-50'}`}>
                  {link.name}
                  {link.hasDropdown && <ChevronDown size={12} className="-rotate-90 text-gray-400" />}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* --- 3. Search --- */}
        <div className="hidden md:flex flex-1 max-w-[240px] items-center">
          <div className="relative w-full flex items-center bg-white border border-gray-200 rounded-xl h-10 overflow-hidden shadow-sm">
            <input type="text" placeholder="Search services..." className="w-full pl-3.5 pr-10 text-xs font-medium focus:outline-none" />
            <Search size={16} className="absolute right-3 text-gray-400" />
          </div>
        </div>

        {/* --- 4. Auth Hub --- */}
        <div className="flex items-center gap-2 sm:gap-3">
          {!isLoggedIn ? (
            <Link 
              href="/authFiles/login"
              className="flex items-center gap-2 px-4 py-2 bg-[#3d3f96] text-white rounded-xl hover:bg-[#2d2f75] transition-all shadow-md shadow-indigo-100 active:scale-95"
            >
              <LogIn size={18} />
              <span className="text-xs font-bold hidden sm:inline">Login / Sign Up</span>
            </Link>
          ) : (
            <button 
              onClick={() => setIsAccountSidebarOpen(true)}
              className="flex items-center gap-2 p-1.5 sm:pl-1.5 sm:pr-3 sm:py-1.5 border border-transparent hover:border-gray-200 hover:bg-white bg-white/40 rounded-xl transition-all duration-200"
            >
              <div className="bg-[#3d3f96] text-white p-1 rounded-lg">
                <User size={18} strokeWidth={2.5} />
              </div>
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
              {!isLoggedIn ? (
                <Link href="/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 w-full py-3 bg-[#3d3f96] text-white rounded-xl font-bold text-sm">
                  <LogIn size={18} /> Login / Sign Up
                </Link>
              ) : (
                <button onClick={() => {setIsOpen(false); setIsAccountSidebarOpen(true)}} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl w-full text-left">
                  <div className="bg-[#3d3f96] text-white p-2 rounded-xl"><User size={20} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-gray-800 truncate">John Doe</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">View Account Sidebar</p>
                  </div>
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              {allNavLinks.map((link) => (
                <Link key={link.name} href={link.href} onClick={() => setIsOpen(false)} className={`flex items-center justify-between px-3 py-3 rounded-xl text-sm font-bold ${link.active ? 'text-red-600 bg-red-50/60' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <span>{link.name}</span>
                  {link.hasDropdown && <ChevronDown size={14} className="-rotate-90 text-gray-400" />}
                </Link>
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
              <div className="w-16 h-16 rounded-2xl bg-[#3d3f96] text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-indigo-100">JD</div>
              <div>
                <h3 className="text-lg font-black text-gray-800">John Doe</h3>
                <p className="text-xs font-bold text-gray-400">john.doe@example.com</p>
                <Link href="/profile" onClick={() => setIsAccountSidebarOpen(false)} className="text-[10px] font-black text-[#3d3f96] uppercase tracking-widest mt-1 inline-block hover:underline">Edit Profile</Link>
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
            <button onClick={() => {setIsLoggedIn(false); setIsAccountSidebarOpen(false); showNotification("You have been logged out.", "info");}} className="flex items-center justify-center gap-3 w-full py-4 bg-red-50 text-red-600 rounded-2xl font-black text-sm hover:bg-red-100 transition-colors">
              <LogOut size={20} /> Logout from Account
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;