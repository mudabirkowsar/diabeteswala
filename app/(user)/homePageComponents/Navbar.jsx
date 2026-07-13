"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, ChevronDown, UserCircle, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/', active: true },
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
  ];

  return (
    <nav className="w-full bg-[#D9E6F9] sticky top-0 z-50 shadow-sm">
      {/* Main Container */}
      <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between gap-4">
        
        {/* 1. Logo Section */}
        <div className="flex-shrink-0">
          <Link href="/">
            <Image 
              src="/logo/diabeteslogo.png" 
              alt="Logo" 
              width={140} 
              height={40} 
              className="object-contain"
              priority
            />
          </Link>
        </div>

        {/* 2. Search Bar (Smaller size, hidden on very small screens) */}
        <div className="hidden sm:flex flex-1 max-w-[220px] items-center">
          <div className="relative w-full flex overflow-hidden rounded-md border border-blue-700 bg-white h-9">
            <input
              type="text"
              placeholder="Search"
              className="w-full px-3 text-sm text-gray-700 focus:outline-none"
            />
            <button className="bg-[#D1E3FA] border-l border-blue-700 px-2 flex items-center justify-center">
              <Search size={16} className="text-gray-700" />
            </button>
          </div>
        </div>

        {/* 3. Desktop Navigation Links (Visible only on XL screens) */}
        <div className="hidden xl:flex items-center space-x-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-[12px] font-bold whitespace-nowrap transition-colors flex items-center gap-0.5
                ${link.active 
                  ? 'text-red-600 border-b-2 border-red-600 pb-0.5' 
                  : 'text-gray-700 hover:text-blue-600'
                }`}
            >
              {link.name}
              {link.hasDropdown && <ChevronDown size={12} />}
            </Link>
          ))}
        </div>

        {/* 4. Right Side Icons (Profile & Menu) */}
        <div className="flex items-center gap-2">
          {/* Profile Icon */}
          <button className="text-gray-800 hover:text-blue-600 transition-colors">
            <UserCircle size={32} strokeWidth={1.5} />
          </button>

          {/* Mobile/Tablet Menu Button (Visible below XL) */}
          <button 
            className="xl:hidden p-1 text-gray-700 hover:bg-blue-100 rounded-md transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* --- Mobile & Tablet Sidebar Menu --- */}
      <div className={`
        fixed inset-0 z-40 transform ${isOpen ? "translate-x-0" : "translate-x-full"} 
        transition-transform duration-300 ease-in-out xl:hidden
      `}>
        {/* Overlay */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-40" 
          onClick={() => setIsOpen(false)}
        ></div>

        {/* Sidebar Content */}
        <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-xl flex flex-col p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-lg text-blue-800">Menu</span>
                <button onClick={() => setIsOpen(false)}><X size={24}/></button>
            </div>

            {/* Mobile Search Bar */}
            <div className="flex sm:hidden mb-6 h-10 border border-blue-700 rounded-md overflow-hidden">
                <input type="text" placeholder="Search..." className="w-full px-3 text-sm focus:outline-none" />
                <button className="bg-blue-100 px-3"><Search size={18}/></button>
            </div>

            <div className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                    <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`text-sm font-semibold border-b border-gray-100 pb-2 ${link.active ? 'text-red-600' : 'text-gray-700'}`}
                    >
                        {link.name}
                    </Link>
                ))}
            </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;