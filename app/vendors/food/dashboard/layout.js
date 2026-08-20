"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

// Global Active Fleet Pool for reassignment
const FLEET_DRIVERS = [
  { id: "DRV-02", name: "Rajesh Sharma", phone: "+91 98765 00112" },
  { id: "DRV-03", name: "Vikram Rathore", phone: "+91 88776 11223" },
  { id: "DRV-04", name: "Manpreet Singh", phone: "+91 77665 22334" }
];

export default function FoodVendorLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTiffinMenuExpanded, setIsTiffinMenuExpanded] = useState(false);

  // Omnipresent delayed-pickup alert states
  const [showDelayAlert, setShowDelayAlert] = useState(false);
  const [alertOrder, setAlertOrder] = useState(null);
  const [isReassigning, setIsReassigning] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsProfileOpen(false);
    if (pathname.startsWith('/vendors/food/tiffin')) {
      setIsTiffinMenuExpanded(true);
    }
  }, [pathname]);

  // Omnipresent Background Monitor Simulation
  useEffect(() => {
    const delayTimer = setTimeout(() => {
      setAlertOrder({
        id: "ORD-9475",
        customer: "Rohan Das",
        stalledDriver: "Suresh Kumar",
        timeElapsed: "12 minutes"
      });
      setShowDelayAlert(true);
    }, 10000); 

    return () => clearTimeout(delayTimer);
  }, []);

  const handleGlobalReassignment = (driver) => {
    alert(`Order ${alertOrder.id} successfully reassigned to ${driver.name}!`);
    setShowDelayAlert(false);
    setAlertOrder(null);
    setIsReassigning(false);
  };

  // Structured navigation categories
  const menuGroups = [
    {
      title: "Main Menu",
      items: [
        { name: 'Dashboard', href: '/vendors/food/dashboard', icon: DashboardIcon },
        { name: 'Orders', href: '/vendors/food/dashboard/orders', icon: RevenueIcon },
        { name: 'Bank Details', href: '/vendors/food/dashboard/bankdetails', icon: BankDetailsIcon },
        { name: 'Wallet & Earnings', href: '/vendors/food/dashboard/earnings', icon: WalletIcon } 
      ]
    },
    {
      title: "Operations",
      items: [
        { name: 'My Availability', href: '/vendors/food/dashboard/availability', icon: AvailabilityIcon },
        { name: 'Manage Driver', href: '/vendors/food/dashboard/managedriver', icon: DriverIcon },
        { name: 'Documents', href: '/vendors/food/dashboard/documents', icon: DocumentsIcon },
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
        <div className={`h-24 px-5 flex items-center border-b border-slate-50 flex-shrink-0 transition-all duration-300 ${
          isMinimized ? 'justify-center' : 'justify-between'
        }`}>
          {!isMinimized ? (
            <div className="relative w-40 h-10 animate-fade-in">
              <Image
                src="/Diabetes.jpg" 
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
              <ChevronRightIcon className="w-5 h-5 stroke-[2.5]" />
            ) : (
              <ChevronLeftIcon className="w-5 h-5 stroke-[2.5]" />
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
                          className={`flex items-center rounded-xl font-semibold text-[14px] transition-all duration-200 w-full ${
                            isMinimized ? 'justify-center p-3.5' : 'justify-between px-4 py-3'
                          } ${
                            pathname.startsWith('/vendors/food/tiffin')
                              ? 'bg-[#3D3F96]/5 text-[#3D3F96]'
                              : 'text-slate-600 hover:bg-[#3D3F96]/5 hover:text-[#3D3F96]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className={`w-5 h-5 stroke-[2] flex-shrink-0 ${
                              pathname.startsWith('/vendors/food/tiffin') ? 'text-[#3D3F96]' : 'text-slate-500'
                            }`} />
                            {!isMinimized && <span>{item.name}</span>}
                          </div>
                          {!isMinimized && (
                            <ChevronDownIcon className={`w-4 h-4 stroke-[2.5] transition-transform duration-200 ${
                              item.isExpanded ? 'transform rotate-180' : ''
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
                                  className={`block px-3 py-2 text-xs font-semibold rounded-lg transition-colors duration-150 ${
                                    isSubActive
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
                      className={`flex items-center rounded-xl font-semibold text-[14px] transition-all duration-200 ${
                        isMinimized ? 'justify-center p-3.5' : 'justify-between px-4 py-3'
                      } ${
                        isActive
                          ? 'bg-[#3D3F96] text-white shadow-lg shadow-[#3D3F96]/20'
                          : 'text-slate-600 hover:bg-[#3D3F96]/5 hover:text-[#3D3F96]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={`w-5 h-5 stroke-[2] flex-shrink-0 transition-colors duration-200 ${
                          isActive ? 'text-white' : 'text-slate-500'
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
      <div className={`flex-1 flex flex-col min-w-0 h-full overflow-hidden transition-all duration-300 ${
        isMinimized ? 'md:pl-20' : 'md:pl-72'
      }`}>
        {/* Top Header Bar (Increased Z-Index to stay above local backdrop overlay) */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 md:px-10 z-50 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-50 md:hidden focus:outline-none border border-slate-100"
              aria-label="Open Navigation"
            >
              <MenuToggleIcon className="w-5 h-5 stroke-[2]" />
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
              <NotificationIcon className="w-5 h-5 stroke-[2]" />
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
                  {/* LOCALIZED BACKDROP CATCHER (Rendered adjacent to dropdown inside stacking context) */}
                  <div 
                    className="fixed inset-0 bg-transparent z-40" 
                    onClick={() => setIsProfileOpen(false)}
                  />
                  
                  {/* Dropdown Card */}
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl p-1.5 flex flex-col z-50 animate-scale-up"
                  >
                    {/* FIXED: Converted button to Next.js semantic Link */}
                    <Link 
                      href="/vendors/food/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all text-left w-full"
                    >
                      <UserProfileIcon className="w-4.5 h-4.5 text-slate-400 stroke-[2]" />
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
                      <LogoutIcon className="w-4.5 h-4.5 text-rose-400 stroke-[2.5]" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Inner page content container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          {children}
        </main>
      </div>

      {/* OMNIPRESENT DRIVER DELAY WARNING MODAL */}
      {showDelayAlert && alertOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-scale-up">
            
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
                <WarningAlertIcon className="w-7 h-7 stroke-[2]" />
              </div>
              
              <div className="space-y-2">
                <h3 className="font-extrabold text-slate-900 text-lg uppercase tracking-tight"> Pickup Delay!</h3>
                <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider">{alertOrder.id}</p>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Driver <strong className="text-slate-800 font-extrabold">{alertOrder.stalledDriver}</strong> has not collected this order within the 10-minute dispatch threshold. Payout and delivery guarantees are at risk.
                </p>
              </div>

              {/* Reassign selection screen */}
              {isReassigning ? (
                <div className="space-y-2 pt-3 text-left border-t border-slate-100 animate-fade-in">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Select New Driver</span>
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                    {FLEET_DRIVERS.map(drv => (
                      <button
                        key={drv.id}
                        type="button"
                        onClick={() => handleGlobalReassignment(drv)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-100 hover:border-[#3D3F96]/30 rounded-xl text-left text-xs font-bold text-slate-700 flex justify-between items-center"
                      >
                        <span>{drv.name}</span>
                        <span className="text-[9px] bg-[#3D3F96]/10 text-[#3D3F96] px-2 py-0.5 rounded uppercase">{drv.id}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="pt-4 flex flex-col gap-2.5">
                  <button
                    onClick={() => setIsReassigning(true)}
                    className="w-full py-3 bg-[#3D3F96] hover:bg-[#3D3F96]/95 text-white font-bold text-xs rounded-xl shadow-lg shadow-[#3D3F96]/10 transition-all uppercase tracking-wider"
                  >
                    Reassign Driver
                  </button>
                  <button
                    onClick={() => {
                      alert("Stalled driver pinged for urgent collection!");
                      setShowDelayAlert(false);
                    }}
                    className="w-full py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl transition-all uppercase tracking-wider"
                  >
                    Ping Current Driver
                  </button>
                  <button
                    onClick={() => setShowDelayAlert(false)}
                    className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold uppercase"
                  >
                    Dismiss Warning
                  </button>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// Icon Components

function DashboardIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
    </svg>
  );
}

function RevenueIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75M16.5 12h-9m9 3h-9" />
    </svg>
  );
}

function BankDetailsIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function AvailabilityIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

function DriverIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.12-1.243l1.105-9.4A1.125 1.125 0 014.473 7.5h11.22c.518 0 .961.35 1.077.854l1.245 5.42a1.125 1.125 0 01.32.73V18h-.375a1.5 1.5 0 01-3 0M15 18.75a1.5 1.5 0 00-3 0m3 0h3.75a1.125 1.125 0 001.12-1.243l-1.104-9.4a1.125 1.125 0 00-1.12-1.007H15V18" />
    </svg>
  );
}

function DocumentsIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function ChevronRightIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

function ChevronLeftIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}

function ChevronDownIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function MenuToggleIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function NotificationIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  );
}

function UserProfileIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function LogoutIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  );
}

function WarningAlertIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376C1.83 15.002 2.285 12 3.75 9.75c1.12-1.722 2.646-3.155 4.5-4.148m11.303 13.5a11.97 11.97 0 01-13.803 0M12 18.75h.008v.008H12v-.008z" />
    </svg>
  );
}

function WalletIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v3" />
    </svg>
  );
}