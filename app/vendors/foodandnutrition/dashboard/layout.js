"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
// Dynamic imports matching your Clinic folder structure exactly
import Sidebar from "./components/sidebar/Sidebar";
import Topbar from "./components/topbar/ClinicTopbar";

export default function ClinicVendorLayout({ children }) {
  // Managing the sidebar minimize state from the topbar button
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Retrieve the clinicToken from localStorage (running client-side)
    const clinicToken = localStorage.getItem("clinicToken");

    if (!clinicToken) {
      // Redirect to login if the token is not found
      router.replace("/authFiles/login");
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  // Display a clean centered loader while authentication is being verified
  if (!isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50/50 antialiased">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[#3d3f96]" size={40} />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Verifying Credentials...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50/50">
      
      {/* Left Sidebar Container */}
      <aside className="h-screen shrink-0 z-40">
        <Sidebar sidebarOpen={sidebarOpen} />
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Topbar matching layout with Clinic Dashboard heading */}
        <Topbar heading="Clinic Dashboard" toggleSidebar={toggleSidebar} />
        
        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 bg-gray-50/50">
          {children}
        </main>

      </div>
    </div>
  );
}