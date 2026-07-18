"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ChevronDown, User, Menu, X, Bell } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // Monitor scroll behavior to tweak styling when user scrolls down
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const allNavLinks = [
    { name: 'Home', href: '/' },
    { name: 'Doctor', href: '/doctor' },
    { name: 'Clinic', href: '/clinic' },
    { name: 'Labs', href: '/labs' },
    { name: 'Pharmacy', href: '/pharmacy' },
    { name: 'Shop', href: '/shop', hasDropdown: true },
    { name: 'Food & Nutrition', href: '/food-nutrition' },
    { name: 'Care Program', href: '/care-program' },
    { name: 'Science', href: '/science' },
    { name: 'About Us', href: '/about' },
    { name: 'Blogs', href: '/blogs' },
    { name: 'Videos', href: '/videos' },
  ].map(link => ({
    ...link,
    active: pathname === link.href
  }));

  // Primary links visible directly on Large viewports (others shift into the dropdown menu)
  const primaryLinks = allNavLinks.slice(0, 5);
  const secondaryLinks = allNavLinks.slice(5);

  return (
    <nav className={`w-full sticky top-0 z-50 transition-all duration-300 antialiased
      ${isScrolled 
        ? 'bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-md shadow-gray-100/20 py-4' 
        : 'bg-[#EBF2FC] border-b border-[#D4E4FA] py-4'
      }`}
    >
      {/* Container wrapper */}
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* --- 1. Logo Workspace --- */}
        <div className="flex-shrink-0 transition-transform duration-200 active:scale-95">
          <Link href="/" className="flex items-center">
            <Image 
              src="/logo/diabeteslogo.png" 
              alt="Care Platform Logo" 
              width={145} 
              height={38} 
              className="object-contain h-9 w-auto"
              priority
            />
          </Link>
        </div>

        {/* --- 2. Advanced Desktop Nav Hub (Hidden on tablets/mobiles) --- */}
        <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
          {/* Always Visible Core Links */}
          {primaryLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-[13px] font-bold tracking-wide px-3 py-2 rounded-lg transition-all duration-200 relative whitespace-nowrap group
                ${link.active 
                  ? 'text-red-600 bg-red-50/60' 
                  : 'text-gray-600 hover:text-[#3d3f96] hover:bg-white/60'
                }`}
            >
              {link.name}
              {link.active && (
                <span className="absolute bottom-1 left-3 right-3 h-[2px] bg-red-500 rounded-full"></span>
              )}
            </Link>
          ))}

          {/* Elegant "More Paths" Dropdown for Secondary Links */}
          <div className="relative group">
            <button className="text-[13px] font-bold tracking-wide px-3 py-2 rounded-lg text-gray-600 hover:text-[#3d3f96] hover:bg-white/60 flex items-center gap-1.5 transition-all duration-200">
              <span>More</span>
              <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
            </button>
            
            {/* Contextual Floating Grid Dropdown */}
            <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-100 rounded-xl shadow-xl shadow-gray-200/50 p-2 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-200 origin-top-left flex flex-col gap-0.5">
              {secondaryLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-[13px] font-semibold px-3 py-2.5 rounded-lg transition-colors flex items-center justify-between
                    ${link.active 
                      ? 'text-red-600 bg-red-50/60' 
                      : 'text-gray-600 hover:text-[#3d3f96] hover:bg-slate-50'
                    }`}
                >
                  {link.name}
                  {link.hasDropdown && <ChevronDown size={12} className="-rotate-90 text-gray-400" />}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* --- 3. Micro Search Integration Engine --- */}
        <div className="hidden md:flex flex-1 max-w-[240px] xl:max-w-[280px] items-center">
          <div className="relative w-full flex items-center bg-white border border-gray-200 hover:border-gray-300 focus-within:!border-[#3d3f96] focus-within:ring-2 focus-within:ring-[#3d3f96]/10 rounded-xl h-10 transition-all duration-200 overflow-hidden shadow-sm shadow-gray-100">
            <input
              type="text"
              placeholder="Search services, labs..."
              className="w-full pl-3.5 pr-10 text-xs font-medium text-gray-700 placeholder-gray-400 bg-transparent focus:outline-none"
            />
            <div className="absolute right-0 top-0 bottom-0 pr-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
          </div>
        </div>

        {/* --- 4. Right Side Interactive Hub --- */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications Utility Button */}
          {/* <button className="p-2 text-gray-500 hover:text-[#3d3f96] hover:bg-white/80 rounded-xl transition-all hidden sm:block relative">
            <Bell size={20} strokeWidth={2} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          </button> */}

          {/* Main Workspace Profile Trigger */}
          <button className="flex items-center gap-2 p-1.5 sm:pl-1.5 sm:pr-3 sm:py-1.5 text-gray-700 hover:text-[#3d3f96] bg-white/40 border border-transparent hover:border-gray-200 hover:bg-white rounded-xl transition-all duration-200">
            <div className="bg-[#3d3f96] text-white p-1 rounded-lg">
              <User size={18} strokeWidth={2.5} />
            </div>
            <span className="text-xs font-bold hidden sm:inline tracking-wide">Account</span>
          </button>

          {/* Master Responsive Sidebar Controller */}
          <button 
            className="lg:hidden p-2 text-gray-600 hover:text-[#3d3f96] hover:bg-white/80 rounded-xl transition-colors"
            onClick={() => setIsOpen(true)}
            aria-label="Open Navigation Menu"
          >
            <Menu size={24} strokeWidth={2.25} />
          </button>
        </div>
      </div>

      {/* --- 5. Mobile & Tablet Modern Drawer Overlay --- */}
      <div className={`fixed inset-0 z-50 transition-opacity duration-300 lg:hidden ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        {/* Backdrop Tint */}
        <div 
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        ></div>

        {/* Sheet Surface */}
        <div className={`absolute right-0 top-0 bottom-0 h-full w-full max-w-[320px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out transform ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
            
            {/* Drawer Header Area */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 bg-slate-50/50">
              <span className="font-extrabold text-base text-gray-800 tracking-wide">Explore Care</span>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* Compact Search Inject on Mobile viewports */}
            <div className="p-4 md:hidden border-b border-gray-50">
              <div className="relative flex items-center bg-gray-50 border border-gray-200 focus-within:border-[#3d3f96] rounded-xl h-10 px-3">
                <Search size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                <input 
                  type="text" 
                  placeholder="Search clinics, diagnostics..." 
                  className="w-full text-xs font-medium bg-transparent focus:outline-none text-gray-700" 
                />
              </div>
            </div>

            {/* List Layout Navigation Container */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              {allNavLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-3 py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-150
                    ${link.active 
                      ? 'text-red-600 bg-red-50/60' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-[#3d3f96]'
                    }`}
                >
                  <span>{link.name}</span>
                  {link.hasDropdown && <ChevronDown size={14} className="text-gray-400 -rotate-90" />}
                </Link>
              ))}
            </div>

            {/* Footer Layer inside Sidebar */}
            <div className="p-4 border-t border-gray-100 bg-slate-50/50 text-center text-[11px] font-semibold text-gray-400 tracking-wider uppercase">
              Diabetes Care Platform v2.0
            </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;