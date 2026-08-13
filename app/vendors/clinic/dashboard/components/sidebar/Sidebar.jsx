"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    FaTachometerAlt,
    FaRupeeSign,
    FaUniversity,
    FaUserMd,
    FaCalendarCheck,
    FaTrophy,
    FaHandHoldingMedical,
    FaClock,
    FaFileMedical
} from "react-icons/fa";
import Image from "next/image";

export default function ClinicSidebar({ sidebarOpen }) {
    const pathname = usePathname();
    const [isHovering, setIsHovering] = useState(false);

    // Color Theme Token matching #3D3F96
    const themeColor = "#3D3F96";
    const isExpanded = sidebarOpen || isHovering;

    const rowBase = "group relative flex items-center gap-3.5 p-3.5 rounded-xl text-[14px] font-medium cursor-pointer transition-all duration-200 select-none";
    const rowActive = "bg-[#3D3F96]/[0.08] text-[#3D3F96] font-bold shadow-sm";
    const rowInactive = "text-gray-600 hover:bg-gray-50 hover:text-gray-950";

    // Menu list exactly as shown in your screen layout
    const menuItems = [
        { name: "Dashboard", route: "/vendors/clinic", icon: FaTachometerAlt },
        { name: "Revenue", route: "/vendors/clinic/revanue", icon: FaRupeeSign },
        { name: "Manage Bank Details", route: "/vendors/clinic/managebank", icon: FaUniversity },
        { name: "Clinic Doctors", route: "/vendors/clinic/clinicdoctor", icon: FaUserMd },
        { name: "Add New Doctor", route: "/vendors/clinic/addDoctors", icon: FaUserMd },
        { name: "Appointments", route: "/vendors/clinic/appointments", icon: FaCalendarCheck },
        { name: "Achievements", route: "/vendors/clinic/achievements", icon: FaTrophy },
        { name: "Services", route: "/vendors/clinic/services", icon: FaHandHoldingMedical },
        { name: "Clinic Timings", route: "/vendors/clinic/clinictiming", icon: FaClock },
        { name: "Documents", route: "/vendors/clinic/documents", icon: FaFileMedical },
    ];

    const isActive = (route) => pathname === route;

    return (
        <aside
            className={`flex flex-col h-screen bg-white border-r border-gray-100 transition-all duration-300 ease-in-out overflow-x-hidden overflow-y-auto p-5 select-none shrink-0 ${isExpanded ? "w-[260px]" : "w-20"
                }`}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {/* Logo Section */}
            <div className="flex justify-center items-center mb-8 transition-all duration-300 shrink-0">
                <Image
                    // src="/public/logo/diabeteslogo.png"
                    src="/logo/diabeteslogo.png"
                    width={145} height={38}
                    alt="Logo"
                    className={`transition-all duration-300 object-contain ${isExpanded ? "h-[75px] w-auto" : "h-[35px] w-auto"
                        }`}
                />
            </div>

            {/* Navigation Menu */}
            <div className="flex flex-col gap-1.5 w-full">
                {menuItems.map((item) => {
                    const IconComponent = item.icon;
                    const activeState = isActive(item.route);
                    return (
                        <Link
                            key={item.route}
                            href={item.route}
                            className={`${rowBase} ${activeState ? rowActive : rowInactive}`}
                        >
                            {activeState && (
                                <span
                                    className="absolute left-0 top-2 bottom-2 w-1.5 rounded-r-md"
                                    style={{ backgroundColor: themeColor }}
                                />
                            )}
                            <IconComponent
                                className={`text-lg shrink-0 ${activeState ? "text-[#3D3F96]" : "text-gray-400 group-hover:text-gray-700"}`}
                            />
                            {isExpanded && <span className="truncate">{item.name}</span>}
                        </Link>
                    );
                })}
            </div>
        </aside>
    );
}