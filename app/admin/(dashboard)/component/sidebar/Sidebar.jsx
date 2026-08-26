"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    FaTachometerAlt, FaChartLine, FaWallet, FaUserShield, FaUsers, FaStore,
    FaChevronDown, FaChevronRight, FaSlidersH, FaPills, FaCapsules, FaTruck,
    FaFlask, FaUserMd, FaStethoscope, FaBoxes, FaHeadset, FaClipboardList, FaAd,
    FaUtensils, FaHospital, FaCheck // Added FaUtensils for the Food section icon
} from "react-icons/fa";

/* =========================================================================
   THEME — shared indigo identity with the rest of the admin suite
   ========================================================================= */
const theme = {
    primary: "#3D3F96",
    primaryDeep: "#1E1B4B",
    primarySoft: "#EEF0FC",
};

/* =========================================================================
   Reusable pieces — an icon "chip" that solidifies on the active route,
   plus a tooltip that only appears when the rail is collapsed to icons.
   ========================================================================= */
function IconChip({ icon: Icon, active }) {
    return (
        <span
            className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-all duration-200"
            style={{
                backgroundColor: active ? theme.primary : "transparent",
                color: active ? "#fff" : "#94A3B8",
                boxShadow: active ? `0 4px 10px ${theme.primary}40` : "none",
            }}
        >
            <Icon className="text-[15px]" />
        </span>
    );
}

function CollapsedTooltip({ label, show }) {
    if (!show) return null;
    return (
        <span
            className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold text-white opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 z-50 shadow-lg"
            style={{ backgroundColor: theme.primaryDeep }}
        >
            {label}
        </span>
    );
}

function GroupLabel({ children, show }) {
    if (!show) return null;
    return (
        <p className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 select-none">
            {children}
        </p>
    );
}

// Accept sidebarOpen prop from layout.js
export default function Sidebar({ sidebarOpen }) {
    const pathname = usePathname();
    const [openMenu, setOpenMenu] = useState(null);
    const [isHovering, setIsHovering] = useState(false);
    const [openTiffinMenu, setOpenTiffinMenu] = useState(false)

    const toggleMenu = (menu) => {
        setOpenMenu(openMenu === menu ? null : menu);
    };

    useEffect(() => {
        if (pathname.includes("/subadmin")) setOpenMenu("subadmin");
        if (pathname.includes("/users")) setOpenMenu("users");
        if (pathname.includes("/vendors")) setOpenMenu("vendors");
        if (pathname.includes("/manageorders")) setOpenMenu("manageorders");
        if (pathname.includes("/managepackages")) setOpenMenu("managepackages");
        if (pathname.includes("/food")) setOpenMenu("food"); // Keep Food menu expanded if path is active
        if (pathname.includes("/requests")) setOpenMenu("requests");
        if (pathname.includes("/appbanners")) setOpenMenu("appbanners");
        if (pathname.includes("/articles")) setOpenMenu("articles");
        if (pathname.includes("/subscribers")) setOpenMenu("subscribers");
        if (pathname.includes("/website-setting")) setOpenMenu("website-setting");
        if (pathname.includes("/managemedicines")) setOpenMenu("managemedicines");

        if (pathname.includes("/manage-issues")) setOpenMenu("/admin/manage-issues");
        if (pathname.includes("/withdraw-request")) setOpenMenu("/admin/manage-withdraw");
        if (pathname.includes("/settings")) setOpenMenu("settings");

        if (pathname.includes("/vendors/lab")) {
            setOpenMenu("vendors");
        }

        if (pathname.includes("/vendors/food/tiffen")) {
            setOpenMenu("vendors/food");
            setOpenTiffinMenu(true)
        }
    }, [pathname]);

    const isActive = (route) => pathname === route;
    const isParentActive = (route) => pathname.startsWith(route);

    // Bypassed access logic for design preview
    const hasAccess = () => true;
    const isSuperAdmin = true;
    const hasVendorAccess = true;

    const isExpanded = sidebarOpen || isHovering;

    const rowBase = "group relative flex items-center gap-3 p-2 rounded-xl text-[15px] font-medium cursor-pointer transition-all duration-200";
    const rowActive = "bg-[#3D3F96]/[0.07] text-[#3D3F96] font-semibold";
    const rowInactive = "text-gray-600 hover:bg-gray-50 hover:text-gray-900";

    return (
        <aside
            className={`flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out overflow-x-hidden overflow-y-auto p-5 select-none shrink-0 ${isExpanded ? "w-[260px]" : "w-20"
                }`}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {/* Logo Section */}
            <div className="flex justify-center items-center mb-6 transition-all duration-300 shrink-0">
                <img
                    src="/logo/diabeteslogo.png"
                    alt="Logo"
                    className={`transition-all duration-300 object-contain ${isExpanded ? "h-[85px] w-auto" : "h-[35px] w-auto"
                        }`}
                />
            </div>

            {/* Menu Items */}
            <div className="flex flex-col gap-1 w-full">

                <GroupLabel show={isExpanded}>Overview</GroupLabel>

                {hasAccess() && (
                    <Link href="/admin" className={`${rowBase} ${isActive("/admin") ? rowActive : rowInactive}`}>
                        {isActive("/admin") && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md" style={{ backgroundColor: theme.primary }} />}
                        <IconChip icon={FaTachometerAlt} active={isActive("/admin")} />
                        {isExpanded && <span className="truncate">Dashboard</span>}
                        <CollapsedTooltip label="Dashboard" show={!isExpanded} />
                    </Link>
                )}

                {hasAccess() && (
                    <Link href="/admin/revenue" className={`${rowBase} ${isActive("/admin/revenue") ? rowActive : rowInactive}`}>
                        {isActive("/admin/revenue") && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md" style={{ backgroundColor: theme.primary }} />}
                        <IconChip icon={FaChartLine} active={isActive("/admin/revenue")} />
                        {isExpanded && <span className="truncate">Revanue</span>}
                        <CollapsedTooltip label="Order Dashboard" show={!isExpanded} />
                    </Link>
                )}

                {hasAccess() && (
                    <Link href="/admin/earning" className={`${rowBase} ${isActive("/admin/earning") ? rowActive : rowInactive}`}>
                        {isActive("/admin/earning") && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md" style={{ backgroundColor: theme.primary }} />}
                        <IconChip icon={FaWallet} active={isActive("/admin/earning")} />
                        {isExpanded && <span className="truncate">Admin Earning</span>}
                        <CollapsedTooltip label="Admin Earning" show={!isExpanded} />
                    </Link>
                )}

                <GroupLabel show={isExpanded}>Access Control</GroupLabel>

                {/* Sub Admin */}
                {isSuperAdmin && (
                    <>
                        <div
                            className={`${rowBase} ${isParentActive("/admin/subadmin") ? rowActive : rowInactive}`}
                            onClick={() => toggleMenu("subadmin")}
                        >
                            {isParentActive("/admin/subadmin") && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md" style={{ backgroundColor: theme.primary }} />}
                            <IconChip icon={FaUserShield} active={isParentActive("/admin/subadmin")} />
                            {isExpanded && <span className="truncate">Sub Admin</span>}
                            {isExpanded && (
                                openMenu === "subadmin"
                                    ? <FaChevronDown className="ml-auto text-[11px] text-gray-400 transition-transform duration-200 rotate-90" />
                                    : <FaChevronRight className="ml-auto text-[11px] text-gray-400 transition-transform duration-200" />
                            )}
                            <CollapsedTooltip label="Sub Admin" show={!isExpanded} />
                        </div>
                        {openMenu === "subadmin" && isExpanded && (
                            <div className="flex flex-col gap-1 mt-1 mb-1 pl-4 border-l-2 border-gray-100 transition-all duration-200">
                                <Link href="/admin/subadmin/managesubadmins" className={`p-2 px-3 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 relative ${isActive("/admin/subadmin/managesubadmins") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isActive("/admin/subadmin/managesubadmins") ? theme.primary : "#D1D5DB" }} />
                                    Manage Subadmin
                                </Link>
                                <Link href="/admin/subadmin/managesubadminrole" className={`p-2 px-3 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 relative ${isActive("/admin/subadmin/managesubadminrole") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isActive("/admin/subadmin/managesubadminrole") ? theme.primary : "#D1D5DB" }} />
                                    Manage Role
                                </Link>
                            </div>
                        )}
                    </>
                )}

                {/* Users */}
                {hasAccess() && (
                    <Link href="/admin/users" className={`${rowBase} ${isActive("/admin/users") ? rowActive : rowInactive}`}>
                        {isActive("/admin/users") && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md" style={{ backgroundColor: theme.primary }} />}
                        <IconChip icon={FaUsers} active={isActive("/admin/users")} />
                        {isExpanded && <span className="truncate">Manage Users</span>}
                        <CollapsedTooltip label="Manage Users" show={!isExpanded} />
                    </Link>
                )}

                <GroupLabel show={isExpanded}>Catalog &amp; Vendors</GroupLabel>

                {/* Vendors */}
                {hasVendorAccess && (
                    <>
                        <div
                            className={`${rowBase} ${isParentActive("/admin/vendors") ? rowActive : rowInactive}`}
                            onClick={() => toggleMenu("vendors")}
                        >
                            {isParentActive("/admin/vendors") && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md" style={{ backgroundColor: theme.primary }} />}
                            <IconChip icon={FaStore} active={isParentActive("/admin/vendors")} />
                            {isExpanded && <span className="truncate">Pharmacy Vendors</span>}
                            {isExpanded && (
                                openMenu === "vendors"
                                    ? <FaChevronDown className="ml-auto text-[11px] text-gray-400 transition-transform duration-200 rotate-90" />
                                    : <FaChevronRight className="ml-auto text-[11px] text-gray-400 transition-transform duration-200" />
                            )}
                            <CollapsedTooltip label="Vendors" show={!isExpanded} />
                        </div>
                        {openMenu === "vendors" && isExpanded && (
                            <div className="flex flex-col gap-1 mt-1 mb-1 pl-4 border-l-2 border-gray-100 transition-all duration-200">
                                {hasAccess() && (
                                    <Link href="/admin/pharmacy/managepharmacy" className={`p-2 px-3 rounded-lg text-xs transition-all duration-200 flex items-center gap-2 ${isActive("/admin/pharmacy/managepharmacy") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                        <FaPills className="text-xs shrink-0" style={{ color: isActive("/admin/pharmacy/managepharmacy") ? theme.primary : "#9CA3AF" }} /> Manage Pharmacies
                                    </Link>
                                )}
                                {hasAccess() && (
                                    <Link href="/admin/pharmacy/approvemedicine" className={`p-2 px-3 rounded-lg text-xs transition-all duration-200 flex items-center gap-2 ${isActive("/admin/pharmacy/approvemedicine") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                        <FaPills className="text-xs shrink-0" style={{ color: isActive("/admin/pharmacy/approvemedicine") ? theme.primary : "#9CA3AF" }} /> Approve Medicine
                                    </Link>
                                )}
                                {hasAccess() && (
                                    <Link href="/admin/pharmacy/managemedicine" className={`p-2 px-3 rounded-lg text-xs transition-all duration-200 flex items-center gap-2 ${isActive("/admin/pharmacy/managemedicine") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                        <FaFlask className="text-xs shrink-0" style={{ color: isActive("/admin/pharmacy/managemedicine") ? theme.primary : "#9CA3AF" }} /> Manage Medicines
                                    </Link>
                                )}
                                {hasAccess() && (
                                    <Link href="/admin/pharmacy/deliverycharge" className={`p-2 px-3 rounded-lg text-xs transition-all duration-200 flex items-center gap-2 ${isActive("/admin/pharmacy/deliverycharge") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                        <FaUserMd className="text-xs shrink-0" style={{ color: isActive("/admin/pharmacy/deliverycharge") ? theme.primary : "#9CA3AF" }} /> Delivery Charges
                                    </Link>
                                )}
                                {hasAccess() && (
                                    <Link href="/admin/pharmacy/brandimage" className={`p-2 px-3 rounded-lg text-xs transition-all duration-200 flex items-center gap-2 ${isActive("/admin/pharmacy/brandimage") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                        <FaUserMd className="text-xs shrink-0" style={{ color: isActive("/admin/pharmacy/brandimage") ? theme.primary : "#9CA3AF" }} /> Brand Image
                                    </Link>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* Manage Labs */}
                {hasAccess() && (
                    <>
                        <div
                            className={`${rowBase} ${isParentActive("/admin/managepackages") ? rowActive : rowInactive}`}
                            onClick={() => toggleMenu("managepackages")}
                        >
                            {isParentActive("/admin/managepackages") && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md" style={{ backgroundColor: theme.primary }} />}
                            <IconChip icon={FaBoxes} active={isParentActive("/admin/managepackages")} />
                            {isExpanded && <span className="truncate">Lab Vendor</span>}
                            {isExpanded && (
                                openMenu === "managepackages"
                                    ? <FaChevronDown className="ml-auto text-[11px] text-gray-400 transition-transform duration-200 rotate-90" />
                                    : <FaChevronRight className="ml-auto text-[11px] text-gray-400 transition-transform duration-200" />
                            )}
                            <CollapsedTooltip label="Tests/Packages" show={!isExpanded} />
                        </div>
                        {openMenu === "managepackages" && isExpanded && (
                            <div className="flex flex-col gap-1 mt-1 mb-1 pl-4 border-l-2 border-gray-100 transition-all duration-200">
                                <Link href="/admin/lab/managelabs" className={`p-2 px-3 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${isActive("/admin/lab/managelabs") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isActive("/admin/lab/managelabs") ? theme.primary : "#D1D5DB" }} /> Manage Labs
                                </Link>

                            </div>
                        )}
                        {openMenu === "managepackages" && isExpanded && (
                            <div className="flex flex-col gap-1 mt-1 mb-1 pl-4 border-l-2 border-gray-100 transition-all duration-200">
                                <Link href="/admin/lab/labtestcreate" className={`p-2 px-3 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${isActive("/admin/lab/labtestcreate") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isActive("/admin/lab/labtestcreate") ? theme.primary : "#D1D5DB" }} /> Lab Test Create
                                </Link>

                            </div>
                        )}
                    </>
                )}

                {/* Manage Food */}
                {hasAccess() && (
                    <>
                        <div
                            className={`${rowBase} ${isParentActive("/admin/food") ? rowActive : rowInactive}`}
                            onClick={() => toggleMenu("food")}
                        >
                            {isParentActive("/admin/food") && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md" style={{ backgroundColor: theme.primary }} />}
                            <IconChip icon={FaUtensils} active={isParentActive("/admin/food")} />
                            {isExpanded && <span className="truncate">Food Vendor</span>}
                            {isExpanded && (
                                openMenu === "food"
                                    ? <FaChevronDown className="ml-auto text-[11px] text-gray-400 transition-transform duration-200 rotate-90" />
                                    : <FaChevronRight className="ml-auto text-[11px] text-gray-400 transition-transform duration-200" />
                            )}
                            <CollapsedTooltip label="Food" show={!isExpanded} />
                        </div>
                        {openMenu === "food" && isExpanded && (
                            <div className="flex flex-col gap-1 mt-1 mb-1 pl-4 border-l-2 border-gray-100 transition-all duration-200">
                                <Link href="/admin/food/foodvendors" className={`p-2 px-3 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${isActive("/admin/food/foodvendors") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isActive("/admin/food/foodvendors") ? theme.primary : "#D1D5DB" }} /> Food Vendors
                                </Link>
                                <Link href="/admin/food/foodcategory" className={`p-2 px-3 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${isActive("/admin/food/foodcategory") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isActive("/admin/food/foodcategory") ? theme.primary : "#D1D5DB" }} /> Manage Food
                                </Link>
                                <Link href="/admin/food/managecategory" className={`p-2 px-3 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${isActive("/admin/food/managecategory") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isActive("/admin/food/managecategory") ? theme.primary : "#D1D5DB" }} /> Manage Category
                                </Link>

                                <Link href="/admin/food/manageaddons" className={`p-2 px-3 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${isActive("/admin/food/manageaddons") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isActive("/admin/food/manageaddons") ? theme.primary : "#D1D5DB" }} /> Manage Add On's
                                </Link>
                                <Link href="/admin/food/managedeliverycharges" className={`p-2 px-3 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${isActive("/admin/food/managedeliverycharges") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isActive("/admin/food/managedeliverycharges") ? theme.primary : "#D1D5DB" }} /> Manage Delivery Charges
                                </Link>
                                <Link href="/admin/food/combo-offers" className={`p-2 px-3 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${isActive("/admin/food/combo-offers") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isActive("/admin/food/combo-offers") ? theme.primary : "#D1D5DB" }} /> Combo Offers
                                </Link>
                                <Link href="/admin/food/today-special" className={`p-2 px-3 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${isActive("/admin/food/today-special") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isActive("/admin/food/today-special") ? theme.primary : "#D1D5DB" }} /> Today's Special
                                </Link>
                                <Link href="/admin/food/managebanner" className={`p-2 px-3 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${isActive("/admin/food/managebanner") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isActive("/admin/food/managebanner") ? theme.primary : "#D1D5DB" }} /> Manage Banners
                                </Link>


                                {/* Interactive Expandable Tiffin Sub-Dropdown */}
                                <div
                                    className={`p-2 px-3 rounded-lg text-sm transition-all duration-200 flex items-center justify-between cursor-pointer ${isParentActive("/admin/food/tiffin") ? "bg-[#3D3F96]/[0.04] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenTiffinMenu(!openTiffinMenu);
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isParentActive("/admin/food/tiffin") ? theme.primary : "#D1D5DB" }} />
                                        Tiffin Service
                                    </div>
                                    {openTiffinMenu
                                        ? <FaChevronDown className="text-[9px] text-[#3D3F96] transition-transform duration-200 rotate-90 shrink-0" />
                                        : <FaChevronRight className="text-[9px] text-gray-400 shrink-0" />
                                    }
                                </div>
                                {openTiffinMenu && (
                                    <div className="flex flex-col gap-1 pl-4 mt-1 border-l border-gray-150 transition-all duration-200">
                                        <Link href="/admin/food/tiffin/dashboard" className={`p-2 px-3 rounded-lg text-xs transition-all duration-200 flex items-center gap-2 ${isActive("/admin/food/tiffin/dashboard") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                            Dashboard
                                        </Link>
                                        <Link href="/admin/food/tiffin/subscribers" className={`p-2 px-3 rounded-lg text-xs transition-all duration-200 flex items-center gap-2 ${isActive("/admin/food/tiffin/subscribers") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                            Subscribers
                                        </Link>
                                        <Link href="/admin/food/tiffin/plans" className={`p-2 px-3 rounded-lg text-xs transition-all duration-200 flex items-center gap-2 ${isActive("/admin/food/tiffin/plans") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                            Plans
                                        </Link>
                                        <Link href="/admin/food/tiffin/requests" className={`p-2 px-3 rounded-lg text-xs transition-all duration-200 flex items-center gap-2 ${isActive("/admin/food/tiffin/requests") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                            Requests
                                        </Link>
                                        <Link href="/admin/food/tiffin/payments" className={`p-2 px-3 rounded-lg text-xs transition-all duration-200 flex items-center gap-2 ${isActive("/admin/food/tiffin/payments") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                            Payments
                                        </Link>
                                        <Link href="/admin/food/tiffin/reports" className={`p-2 px-3 rounded-lg text-xs transition-all duration-200 flex items-center gap-2 ${isActive("/admin/food/tiffin/reports") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                            Reports
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* Manage Clinics */}
                {hasAccess() && (
                    <>
                        <div
                            className={`${rowBase} ${isParentActive("/admin/manageclinic") ? rowActive : rowInactive}`}
                            onClick={() => toggleMenu("manageclinic")} // FIX 1: Changed "food" to "manageclinic"
                        >
                            {isParentActive("/admin/manageclinic") && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md" style={{ backgroundColor: theme.primary }} />}
                            <IconChip icon={FaHospital} active={isParentActive("/admin/manageclinic")} /> {/* FIX 2: Changed FaUtensils to FaHospital */}
                            {isExpanded && <span className="truncate">Clinic Vendor</span>}
                            {isExpanded && (
                                openMenu === "manageclinic"
                                    ? <FaChevronDown className="ml-auto text-[11px] text-gray-400 transition-transform duration-200 rotate-90" />
                                    : <FaChevronRight className="ml-auto text-[11px] text-gray-400 transition-transform duration-200" />
                            )}
                            <CollapsedTooltip label="Clinic" show={!isExpanded} />
                        </div>

                        {/* FIX 3: Changed "Clinic" to "manageclinic" to match state */}
                        {openMenu === "manageclinic" && isExpanded && (
                            <div className="flex flex-col gap-1 mt-1 mb-1 pl-4 border-l-2 border-gray-100 transition-all duration-200">
                                <Link href="/admin/manageclinic/clinics" className={`p-2 px-3 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${isActive("/admin/manageclinic/clinics") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isActive("/admin/manageclinic/clinics") ? theme.primary : "#D1D5DB" }} /> Manage Clinics
                                </Link>
                                <Link href="/admin/manageclinic/createspecialists" className={`p-2 px-3 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${isActive("/admin/manageclinic/createspecialists") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isActive("/admin/manageclinic/createspecialists") ? theme.primary : "#D1D5DB" }} /> Create Specialists
                                </Link>
                            </div>
                        )}
                    </>
                )}

                <GroupLabel show={isExpanded}>Operations</GroupLabel>

                {/* Manage Drivers */}
                {hasAccess() && (
                    <Link href="/admin/managedrivers" className={`${rowBase} ${isActive("/admin/managedrivers") ? rowActive : rowInactive}`}>
                        {isActive("/admin/managedrivers") && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md" style={{ backgroundColor: theme.primary }} />}
                        <IconChip icon={FaTruck} active={isActive("/admin/managedrivers")} />
                        {isExpanded && <span className="truncate">Manage Drivers</span>}
                        <CollapsedTooltip label="Manage Drivers" show={!isExpanded} />
                    </Link>
                )}

                {/* Manage Doctors */}
                {hasAccess() && (
                    <Link href="/admin/managedoctors" className={`${rowBase} ${isActive("/admin/managedoctors") ? rowActive : rowInactive}`}>
                        {isActive("/admin/managedoctors") && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md" style={{ backgroundColor: theme.primary }} />}
                        <IconChip icon={FaStethoscope} active={isActive("/admin/managedoctors")} />
                        {isExpanded && <span className="truncate">Manage Doctors</span>}
                        <CollapsedTooltip label="Manage Doctors" show={!isExpanded} />
                    </Link>
                )}

                {/* Manage Vendor Orders */}
                {hasAccess() && (
                    <Link href="/admin/managevendorsorder" className={`${rowBase} ${isActive("/admin/managevendorsorder") ? rowActive : rowInactive}`}>
                        {isActive("/admin/managevendorsorder") && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md" style={{ backgroundColor: theme.primary }} />}
                        <IconChip icon={FaClipboardList} active={isActive("/admin/managevendorsorder")} />
                        {isExpanded && <span className="truncate">Manage Vendor Orders</span>}
                        <CollapsedTooltip label="Manage Vendor Orders" show={!isExpanded} />
                    </Link>
                )}

                <GroupLabel show={isExpanded}>Support &amp; Content</GroupLabel>

                {/* Requests Issue */}
                {hasAccess() && (
                    <>
                        <div
                            className={`${rowBase} ${isParentActive("/admin/requests") ? rowActive : rowInactive}`}
                            onClick={() => toggleMenu("requests")}
                        >
                            {isParentActive("/admin/requests") && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md" style={{ backgroundColor: theme.primary }} />}
                            <IconChip icon={FaHeadset} active={isParentActive("/admin/requests")} />
                            {isExpanded && <span className="truncate">Requests Issue</span>}
                            {isExpanded && (
                                openMenu === "requests"
                                    ? <FaChevronDown className="ml-auto text-[11px] text-gray-400 transition-transform duration-200 rotate-90" />
                                    : <FaChevronRight className="ml-auto text-[11px] text-gray-400 transition-transform duration-200" />
                            )}
                            <CollapsedTooltip label="Requests Issue" show={!isExpanded} />
                        </div>
                        {openMenu === "requests" && isExpanded && (
                            <div className="flex flex-col gap-1 mt-1 mb-1 pl-4 border-l-2 border-gray-100 transition-all duration-200">
                                <Link href="/admin/issue-request" className={`p-2 px-3 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${isActive("/admin/issue-request") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isActive("/admin/issue-request") ? theme.primary : "#D1D5DB" }} /> Help Request
                                </Link>
                            </div>
                        )}
                    </>
                )}

                {/* App Banners */}
                {hasAccess() && (
                    <Link href="/admin/banners" className={`${rowBase} ${isActive("/admin/banners") ? rowActive : rowInactive}`}>
                        {isActive("/admin/banners") && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md" style={{ backgroundColor: theme.primary }} />}
                        <IconChip icon={FaAd} active={isActive("/admin/banners")} />
                        {isExpanded && <span className="truncate">App Banners</span>}
                        <CollapsedTooltip label="App Banners" show={!isExpanded} />
                    </Link>
                )}
                {/* Get Blogs */}
                {hasAccess() && (
                    <Link href="/admin/website-setting/getblogs" className={`${rowBase} ${isActive("/admin/website-setting/getblogs") ? rowActive : rowInactive}`}>
                        {isActive("/admin/website-setting/getblogs") && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md" style={{ backgroundColor: theme.primary }} />}
                        <IconChip icon={FaAd} active={isActive("/admin/addblogs")} />
                        {isExpanded && <span className="truncate">All Blogs</span>}
                        <CollapsedTooltip label="Admin Blogs" show={!isExpanded} />
                    </Link>
                )}

                {/* Website Setting */}
                {hasAccess() && (
                    <>
                        <div
                            className={`${rowBase} ${isParentActive("/admin/website-setting") ? rowActive : rowInactive}`}
                            onClick={() => toggleMenu("website-setting")}
                        >
                            {isParentActive("/admin/website-setting") && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md" style={{ backgroundColor: theme.primary }} />}
                            <IconChip icon={FaSlidersH} active={isParentActive("/admin/website-setting")} />
                            {isExpanded && <span className="truncate">Website Setting</span>}
                            {isExpanded && (
                                openMenu === "website-setting"
                                    ? <FaChevronDown className="ml-auto text-[11px] text-gray-400 transition-transform duration-200 rotate-90" />
                                    : <FaChevronRight className="ml-auto text-[11px] text-gray-400 transition-transform duration-200" />
                            )}
                            <CollapsedTooltip label="Website Setting" show={!isExpanded} />
                        </div>
                        {openMenu === "website-setting" && isExpanded && (
                            <div className="flex flex-col gap-1 mt-1 mb-1 pl-4 border-l-2 border-gray-100 transition-all duration-200">
                                {/* 1. Home */}
                                <Link href="/admin/website-setting/homepage-setting" className={`p-2 px-3 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${isActive("/admin/website-setting/homepage-setting") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isActive("/admin/website-setting/homepage-setting") ? theme.primary : "#D1D5DB" }} /> Home Page Setting
                                </Link>
                                <Link href="/admin/website-setting/footermanagement" className={`p-2 px-3 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${isActive("/admin/website-setting/footermanagement") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isActive("/admin/website-setting/footermanagement") ? theme.primary : "#D1D5DB" }} /> Footer Management
                                </Link>

                                {/* 2. Doctor */}
                                <Link href="/admin/website-setting/doctorpage" className={`p-2 px-3 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${isActive("/admin/website-setting/doctorpage") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isActive("/admin/website-setting/doctorpage") ? theme.primary : "#D1D5DB" }} /> Doctors Screen Setting
                                </Link>

                                {/* 3. Clinic */}
                                <Link href="/admin/website-setting/clinicpage" className={`p-2 px-3 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${isActive("/admin/website-setting/clinicpage") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isActive("/admin/website-setting/clinicpage") ? theme.primary : "#D1D5DB" }} /> Clinic Page Setting
                                </Link>

                                {/* 4. Labs */}
                                <Link href="/admin/website-setting/labpage" className={`p-2 px-3 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${isActive("/admin/website-setting/labpage") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isActive("/admin/website-setting/labpage") ? theme.primary : "#D1D5DB" }} /> Lab Page Setting
                                </Link>

                                {/* 5. Pharmacy */}
                                <Link href="/admin/website-setting/buymedicinepage" className={`p-2 px-3 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${isActive("/admin/website-setting/buymedicinepage") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isActive("/admin/website-setting/buymedicinepage") ? theme.primary : "#D1D5DB" }} /> Buy Medicine Setting
                                </Link>

                                {/* 6. Shop */}
                                <Link href="/admin/website-setting/shoppage" className={`p-2 px-3 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${isActive("/admin/website-setting/shoppage") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isActive("/admin/website-setting/shoppage") ? theme.primary : "#D1D5DB" }} /> Shop Page Setting
                                </Link>

                                {/* 7. Food & Nutrition */}
                                <Link href="/admin/website-setting/foodpage" className={`p-2 px-3 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${isActive("/admin/website-setting/foodpage") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isActive("/admin/website-setting/foodpage") ? theme.primary : "#D1D5DB" }} /> Food &amp; Nutrition Setting
                                </Link>

                                {/* 8. Care Program */}
                                <Link href="/admin/website-setting/careprogrampage" className={`p-2 px-3 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${isActive("/admin/website-setting/careprogrampage") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isActive("/admin/website-setting/careprogrampage") ? theme.primary : "#D1D5DB" }} /> Care Program Setting
                                </Link>

                                {/* 9. Science */}
                                <Link href="/admin/website-setting/sciencepage" className={`p-2 px-3 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${isActive("/admin/website-setting/sciencepage") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isActive("/admin/website-setting/sciencepage") ? theme.primary : "#D1D5DB" }} /> Science Page Setting
                                </Link>

                                {/* 10. About Us */}
                                <Link href="/admin/website-setting/aboutuspage" className={`p-2 px-3 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${isActive("/admin/website-setting/aboutuspage") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isActive("/admin/website-setting/aboutuspage") ? theme.primary : "#D1D5DB" }} /> About Us Setting
                                </Link>

                                {/* 11. Blogs */}
                                <Link href="/admin/website-setting/addblogs" className={`p-2 px-3 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${isActive("/admin/website-setting/addblogs") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isActive("/admin/website-setting/addblogs") ? theme.primary : "#D1D5DB" }} /> Blogs Page Setting
                                </Link>

                                {/* 12. Videos */}
                                <Link href="/admin/website-setting/videoupload" className={`p-2 px-3 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${isActive("/admin/website-setting/videoupload") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isActive("/admin/website-setting/videoupload") ? theme.primary : "#D1D5DB" }} /> Videos Page Setting
                                </Link>
                            </div>
                        )}
                    </>
                )}

                {/* Others Group Section (Membership Plans, Distance Manage, Cancellation Charges) */}
                {hasAccess() && (
                    <>
                        <div
                            className={`${rowBase} ${isParentActive("/admin/others") ? rowActive : rowInactive}`}
                            onClick={() => toggleMenu("others")}
                        >
                            {isParentActive("/admin/others") && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md" style={{ backgroundColor: theme.primary }} />}
                            <IconChip icon={FaSlidersH} active={isParentActive("/admin/others")} />
                            {isExpanded && <span className="truncate">Others</span>}
                            {isExpanded && (
                                openMenu === "others"
                                    ? <FaChevronDown className="ml-auto text-[11px] text-gray-400 transition-transform duration-200 rotate-90" />
                                    : <FaChevronRight className="ml-auto text-[11px] text-gray-400 transition-transform duration-200" />
                            )}
                            <CollapsedTooltip label="Others" show={!isExpanded} />
                        </div>
                        {openMenu === "others" && isExpanded && (
                            <div className="flex flex-col gap-1 mt-1 mb-1 pl-4 border-l-2 border-gray-100 transition-all duration-200">
                                {/* 1. Membership Plans */}
                                <Link href="/admin/others/membershipplans" className={`p-2 px-3 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${isActive("/admin/others/membershipplans") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isActive("/admin/others/membershipplans") ? theme.primary : "#D1D5DB" }} />
                                    Membership Plans
                                </Link>

                                {/* 2. Distance Manage */}
                                <Link href="/admin/others/distancemanage" className={`p-2 px-3 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${isActive("/admin/others/distancemanage") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isActive("/admin/others/distancemanage") ? theme.primary : "#D1D5DB" }} />
                                    Distance Manage
                                </Link>

                                <Link href="/admin/others/codconfig" className={`p-2 px-3 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${isActive("/admin/others/codconfig") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isActive("/admin/others/codconfig") ? theme.primary : "#D1D5DB" }} />
                                    Manage COD
                                </Link>

                                <Link href="/admin/others/managedeliverycharges" className={`p-2 px-3 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${isActive("/admin/others/managedeliverycharges") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isActive("/admin/others/managedeliverycharges") ? theme.primary : "#D1D5DB" }} />
                                    Manage Delivery Charge
                                </Link>

                                <Link href="/admin/others/promotions" className={`p-2 px-3 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${isActive("/admin/others/promotions") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isActive("/admin/others/promotions") ? theme.primary : "#D1D5DB" }} />
                                    Manage Coupon
                                </Link>

                                {/* 3. Cancellation Charges */}
                                <Link href="/admin/others/cancellationcharges" className={`p-2 px-3 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${isActive("/admin/others/cancellationcharges") ? "bg-[#3D3F96]/[0.06] text-[#3D3F96] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isActive("/admin/others/cancellationcharges") ? theme.primary : "#D1D5DB" }} />
                                    Cancellation Charges
                                </Link>
                            </div>
                        )}
                    </>
                )}

            </div>
        </aside>
    );
}