"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Sidebar from "./component/sidebar/Sidebar";
import AdminTopbar from "./component/topbar/AdminTopbar";

export default function AdminDashboardLayout({ children }) {
  const router = useRouter();
  
  // Authorization states to prevent content flashing
  const [authorized, setAuthorized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Perform client-side authentication check
    const token = localStorage.getItem("adminToken");
    
    if (!token) {
      router.push("/admin/login");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  // Render a clean loading screen while validating the token
  if (!authorized) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-slate-900 select-none">
        <Loader2 className="animate-spin text-white mb-4" size={36} />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Verifying clearance level...
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      
      {/* HTML Head / Metadata injection */}
      <title>Diabetes Care Admin Portal | Dashboard</title>
      <meta name="description" content="Clinical therapy focus admin panel for managing personalized dietary care, diabetes nutrition, and lifestyle configurations." />
      <meta name="robots" content="noindex, nofollow" />
      
      {/* Sidebar Container */}
      <aside className="h-screen shrink-0">
        <Sidebar sidebarOpen={sidebarOpen} />
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Navbar */}
        <AdminTopbar heading="Dashboard" toggleSidebar={toggleSidebar} />
        
        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 bg-gray-50">
          {children}
        </main>

      </div>
    </div>
  );
}