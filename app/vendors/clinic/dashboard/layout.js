"use client";

import { useState } from "react";
// Dynamic imports matching your Clinic folder structure exactly
import Sidebar from "./components/sidebar/Sidebar";
import Topbar from "./components/topbar/ClinicTopbar";

export default function ClinicVendorLayout({ children }) {
  // Managing the sidebar minimize state from the topbar button
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

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