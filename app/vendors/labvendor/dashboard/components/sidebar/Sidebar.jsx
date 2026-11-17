"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    FaTachometerAlt,
    FaUniversity,
    FaUserMd,
    FaTrophy,
    FaClock,
    FaTicketAlt,
    FaTruck,
    FaDatabase
} from "react-icons/fa";
import Image from "next/image";

// Adjust this import path according to your project's folder structure
import LabVendorApi  from "../../../../../services/LabVendorAPI";

export default function ClinicSidebar({ sidebarOpen }) {
    const pathname = usePathname();
    const [isHovering, setIsHovering] = useState(false);
    const [isClinicLab, setIsClinicLab] = useState(false);

    // Color Theme Token matching #3D3F96
    const themeColor = "#3D3F96";
    const isExpanded = sidebarOpen || isHovering;

    const rowBase = "group relative flex items-center gap-3.5 p-3.5 rounded-xl text-[14px] font-medium cursor-pointer transition-all duration-200 select-none";
    const rowActive = "bg-[#3D3F96]/[0.08] text-[#3D3F96] font-bold shadow-sm";
    const rowInactive = "text-gray-600 hover:bg-gray-50 hover:text-gray-950";

    // Fetch lab account type on component mount
    useEffect(() => {
        const fetchAccountType = async () => {
            try {
                const response = await LabVendorApi.getLabAccountType();
                if (response?.success && response?.data) {
                    setIsClinicLab(Boolean(response.data.isClinicLab));
                }
            } catch (error) {
                console.error("Failed to fetch lab account type:", error);
            }
        };

        fetchAccountType();
    }, []);

    // Menu list dynamically filtered based on isClinicLab
    const menuItems = [
        { name: "Dashboard", route: "/vendors/labvendor/dashboard", icon: FaTachometerAlt },
        { name: "Manage Orders", route: "/vendors/labvendor/dashboard/manageorders", icon: FaUniversity },
        // Shown only if isClinicLab is true
        ...(isClinicLab
            ? [{ name: "Manage In-House Orders", route: "/vendors/labvendor/dashboard/manageinhouseorders", icon: FaUserMd }]
            : []),
        { name: "Manage Lab Packages", route: "/vendors/labvendor/dashboard/managelabpackages", icon: FaDatabase },
        { name: "Manage Tests", route: "/vendors/labvendor/dashboard/managetests", icon: FaTrophy },
        { name: "Manage Coupons", route: "/vendors/labvendor/dashboard/managecoupon", icon: FaTicketAlt },
        { name: "Manage Timing", route: "/vendors/labvendor/dashboard/managetiming", icon: FaClock },
        { name: "Manage Drivers", route: "/vendors/labvendor/dashboard/managedrivers", icon: FaTruck },
    ];

    const isActive = (route) => pathname === route;

    return (
        <aside
            className={`flex flex-col h-screen bg-white border-r border-gray-100 transition-all duration-300 ease-in-out overflow-x-hidden overflow-y-auto p-5 select-none shrink-0 ${
                isExpanded ? "w-[260px]" : "w-20"
            }`}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {/* Logo Section */}
            <div className="flex justify-center items-center mb-8 transition-all duration-300 shrink-0">
                <Image
                    src="/logo/diabeteslogo.png"
                    width={145}
                    height={38}
                    alt="Logo"
                    className={`transition-all duration-300 object-contain ${
                        isExpanded ? "h-[75px] w-auto" : "h-[35px] w-auto"
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
                                className={`text-lg shrink-0 ${
                                    activeState ? "text-[#3D3F96]" : "text-gray-400 group-hover:text-gray-700"
                                }`}
                            />
                            {isExpanded && <span className="truncate">{item.name}</span>}
                        </Link>
                    );
                })}
            </div>
        </aside>
    );
}