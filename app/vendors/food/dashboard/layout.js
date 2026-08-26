"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Landmark,
  Wallet,
  Utensils,
  CalendarCheck,
  Truck,
  FileText,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Menu,
  Bell,
  User,
  LogOut
} from 'lucide-react';

export default function FoodVendorLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTiffinMenuExpanded, setIsTiffinMenuExpanded] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsProfileOpen(false);
    if (pathname.startsWith('/vendors/food/tiffin')) {
      setIsTiffinMenuExpanded(true);
    }
  }, [pathname]);

  // Structured navigation categories
  const menuGroups = [
    {
      title: "Main Menu",
      items: [
        { name: 'Dashboard', href: '/vendors/food/dashboard', icon: LayoutDashboard },
        { name: 'Orders', href: '/vendors/food/dashboard/orders', icon: ShoppingBag },
        { name: 'Bank Details', href: '/vendors/food/dashboard/bankdetails', icon: Landmark },
        { name: 'Wallet & Earnings', href: '/vendors/food/dashboard/earnings', icon: Wallet },
        { name: 'Manage Food', href: '/vendors/food/dashboard/manage-food', icon: Utensils },
        { name: 'Manage Combo', href: '/vendors/food/dashboard/combo-bundles', icon: Utensils },
        { name: 'Manage Tiffin', href: '/vendors/food/dashboard/managetiffin', icon: Utensils },
      ]
    },
    {
      title: "Operations",
      items: [
        { name: 'My Availability', href: '/vendors/food/dashboard/availability', icon: CalendarCheck },
        { name: 'Manage Driver', href: '/vendors/food/dashboard/managedriver', icon: Truck },
        { name: 'Documents', href: '/vendors/food/dashboard/documents', icon: FileText },
      ]
    },
  ];

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 flex font-sans antialiased">

      {/* Mobile Sidebar Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-30 transition-opacity duration-300 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-white border-r border-slate-100 transition-all duration-300 transform h-screen flex flex-col flex-shrink-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 
          ${isMinimized ? 'w-20' : 'w-72'}`}
      >
        {/* Brand Logo Container */}
        <div className={`h-24 px-5 flex items-center border-b border-slate-50 flex-shrink-0 transition-all duration-300 ${isMinimized ? 'justify-center' : 'justify-between'
          }`}>
          {!isMinimized ? (
            <div className="relative w-40 h-10 animate-fade-in">
              <Image
                src="/logo/diabeteslogo.png"
                alt="Diabeteswala Logo"
                fill
                priority
                className="object-contain object-left"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center font-bold text-sm tracking-tight border border-[#3D3F96]/10 animate-fade-in flex-shrink-0">
              DW
            </div>
          )}

          <button
            onClick={() => {
              setIsMinimized(!isMinimized);
              if (!isMinimized) setIsTiffinMenuExpanded(false);
            }}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-150 focus:outline-none"
            aria-label={isMinimized ? "Expand Sidebar" : "Minimize Sidebar"}
          >
            {isMinimized ? (
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            ) : (
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            )}
          </button>
        </div>

        {/* Navigation Content */}
        <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-7 no-scrollbar">
          {menuGroups.map((group) => (
            <div key={group.title} className="space-y-2">
              {!isMinimized && (
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase px-3 block transition-all duration-300">
                  {group.title}
                </span>
              )}

              <div className="space-y-1">
                {group.items.map((item) => {
                  if (item.isSubmenuTrigger) {
                    return (
                      <div key={item.name} className="space-y-1">
                        <button
                          onClick={item.onToggle}
                          className={`flex items-center rounded-xl font-semibold text-[14px] transition-all duration-200 w-full ${isMinimized ? 'justify-center p-3.5' : 'justify-between px-4 py-3'
                            } ${pathname.startsWith('/vendors/food/tiffin')
                              ? 'bg-[#3D3F96]/5 text-[#3D3F96]'
                              : 'text-slate-600 hover:bg-[#3D3F96]/5 hover:text-[#3D3F96]'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className={`w-5 h-5 stroke-[2] flex-shrink-0 ${pathname.startsWith('/vendors/food/tiffin') ? 'text-[#3D3F96]' : 'text-slate-500'
                              }`} />
                            {!isMinimized && <span>{item.name}</span>}
                          </div>
                          {!isMinimized && (
                            <ChevronDown className={`w-4 h-4 stroke-[2.5] transition-transform duration-200 ${item.isExpanded ? 'transform rotate-180' : ''
                              }`} />
                          )}
                        </button>

                        {/* Collapsible Submenu Items */}
                        {!isMinimized && item.isExpanded && (
                          <div className="pl-9 space-y-1 pr-2 animate-fade-in">
                            {item.subItems.map((sub) => {
                              const isSubActive = pathname === sub.href;
                              return (
                                <Link
                                  key={sub.name}
                                  href={sub.href}
                                  className={`block px-3 py-2 text-xs font-semibold rounded-lg transition-colors duration-150 ${isSubActive
                                      ? 'text-[#3D3F96] bg-[#3D3F96]/10 font-bold'
                                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                    }`}
                                >
                                  {sub.name}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      title={isMinimized ? item.name : undefined}
                      className={`flex items-center rounded-xl font-semibold text-[14px] transition-all duration-200 ${isMinimized ? 'justify-center p-3.5' : 'justify-between px-4 py-3'
                        } ${isActive
                          ? 'bg-[#3D3F96] text-white shadow-lg shadow-[#3D3F96]/20'
                          : 'text-slate-600 hover:bg-[#3D3F96]/5 hover:text-[#3D3F96]'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={`w-5 h-5 stroke-[2] flex-shrink-0 transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-500'
                          }`} />
                        {!isMinimized && (
                          <span className="transition-opacity duration-300">{item.name}</span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content Area Wrapper */}
      <div className={`flex-1 flex flex-col min-w-0 h-full overflow-hidden transition-all duration-300 ${isMinimized ? 'md:pl-20' : 'md:pl-72'
        }`}>
        {/* Top Header Bar */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 md:px-10 z-50 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-50 md:hidden focus:outline-none border border-slate-100"
              aria-label="Open Navigation"
            >
              <Menu className="w-5 h-5 stroke-[2]" />
            </button>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Vendor Dashboard</p>
              <p className="text-sm font-bold text-slate-700">Healthy Food Portal</p>
            </div>
          </div>

          {/* Topbar actions */}
          <div className="flex items-center gap-4">
            <button className="p-2.5 rounded-xl border border-slate-100 text-slate-500 hover:bg-slate-50 relative flex-shrink-0">
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#3D3F96]" />
              <Bell className="w-5 h-5 stroke-[2]" />
            </button>

            <div className="h-8 w-px bg-slate-100 hidden sm:block" />

            {/* Profile Dropdown Container */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsProfileOpen(!isProfileOpen);
                }}
                className="flex items-center gap-3 pl-1 focus:outline-none hover:bg-slate-50 p-1.5 rounded-xl transition-all duration-150 relative z-50"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center font-bold text-sm flex-shrink-0 border border-[#3D3F96]/5">
                    FV
                  </div>
                  <div className="hidden sm:block leading-tight text-left">
                    <p className="text-xs font-bold text-slate-800">Food Vendor</p>
                    <p className="text-[10px] font-medium text-slate-400 mt-0.5">ID: #VND-9482</p>
                  </div>
                </div>
                <span className="flex h-2.5 w-2.5 relative flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </button>

              {isProfileOpen && (
                <>
                  {/* LOCALIZED BACKDROP CATCHER */}
                  <div
                    className="fixed inset-0 bg-transparent z-40"
                    onClick={() => setIsProfileOpen(false)}
                  />

                  {/* Dropdown Card */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl p-1.5 flex flex-col z-50 animate-scale-up"
                  >
                    <Link
                      href="/vendors/food/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all text-left w-full"
                    >
                      <User className="w-4 h-4 text-slate-400 stroke-[2]" />
                      My Profile
                    </Link>
                    <div className="h-px bg-slate-100 my-1" />
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        alert("Logging out...");
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-all text-left w-full"
                    >
                      <LogOut className="w-4 h-4 text-rose-400 stroke-[2.5]" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Inner page content container */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
}