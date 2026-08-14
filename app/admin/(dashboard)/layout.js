"use client";

import { useState } from "react";
import Sidebar from "./component/sidebar/Sidebar";
import AdminTopbar from "./component/topbar/AdminTopbar";

export default function AdminDashboardLayout({ children }) {
  // Lifting state up to manage sidebar minimize from topbar button
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      
      {/* Sidebar Container */}
      <aside className="h-screen shrink-0">
        <Sidebar sidebarOpen={sidebarOpen} />
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Navbar */}
        <AdminTopbar heading="Dashboard" toggleSidebar={toggleSidebar} />
        
        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 bg-gray-50">
          {children}
        </main>

      </div>
    </div>
  );
}