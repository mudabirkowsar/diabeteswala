"use client";

import { useState, useRef, useEffect } from "react";
import { 
    FaFlask, FaPills, FaUtensils, FaEye, FaCheckCircle, 
    FaUsers, FaInbox, FaChevronRight, FaTimes, FaReceipt, FaUser, FaRegCalendarAlt, FaPhoneAlt, FaEnvelope 
} from "react-icons/fa";

export default function ManageVendorOrders() {
    const [activeTab, setActiveTab] = useState("lab"); // 'lab', 'pharmacy', 'food'
    const [showModal, setShowModal] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const modalRef = useRef(null);

    // Theme Color Tokens based on #3D3F96 (Royal Indigo)
    const themeBg = "bg-[#3D3F96]";
    const themeText = "text-[#3D3F96]";
    const themeHoverBg = "hover:bg-[#2C2D75]";
    const themeShadow = "shadow-[#3D3F96]/20";
    const themeRing = "focus:ring-[#3D3F96]/30";

    // Dynamic Mock Data with nested actual Order Lists for each vendor
    const mockData = {
        lab: [
            { 
                id: "l1", 
                initial: "N", 
                name: "Nishant Diagnostics", 
                email: "nishant@gmail.com", 
                phone: "9650008564", 
                city: "Gyumri", 
                status: "APPROVED",
                orders: [
                    { orderId: "ORD-9921", patient: "Abhishek Sharma", date: "15 July 2026", items: "HbA1c Diabetes Test, Thyroid Profile", amount: 1200, status: "Completed" },
                    { orderId: "ORD-3310", patient: "Sunita Devi", date: "14 July 2026", items: "Fasting Blood Sugar, CBC", amount: 650, status: "Pending" }
                ]
            },
            { 
                id: "l2", 
                initial: "A", 
                name: "Anmol Lab Delhi", 
                email: "anmollab@gmail.com", 
                phone: "12345678", 
                city: "Delhi", 
                status: "APPROVED",
                orders: [
                    { orderId: "ORD-5541", patient: "Rajesh Kumar", date: "12 July 2026", items: "Lipid Profile Test", amount: 980, status: "Completed" }
                ]
            },
            { 
                id: "l3", 
                initial: "D", 
                name: "Diabetes Lab Mohali", 
                email: "mohali@gmail.com", 
                phone: "1111111111", 
                city: "Mohali", 
                status: "APPROVED",
                orders: [
                    { orderId: "ORD-4412", patient: "Karan Malhotra", date: "15 July 2026", items: "Diabetes Screening Panel", amount: 1500, status: "Completed" },
                    { orderId: "ORD-2109", patient: "Priya Singh", date: "11 July 2026", items: "Post Prandial Blood Sugar", amount: 200, status: "Completed" }
                ]
            },
            { 
                id: "l4", 
                initial: "M", 
                name: "Mudabir Kowsar Diagnostics", 
                email: "lab@gmail.com", 
                phone: "1234567890", 
                city: "Mohali", 
                status: "APPROVED",
                orders: [
                    { orderId: "ORD-8871", patient: "Suresh Kumar", date: "10 July 2026", items: "Complete Urine Analysis", amount: 350, status: "Completed" }
                ]
            }
        ],
        pharmacy: [
            { 
                id: "p1", 
                initial: "M", 
                name: "MedPlus Pharmacy", 
                email: "medplus@gmail.com", 
                phone: "9876543210", 
                city: "Mohali", 
                status: "APPROVED",
                orders: [
                    { orderId: "ORD-1102", patient: "Rohan Mehra", date: "15 July 2026", items: "Metformin 500mg (Strip of 15), Dolo 650 (Strip of 15)", amount: 154, status: "Completed" },
                    { orderId: "ORD-7751", patient: "Vikram Singh", date: "13 July 2026", items: "Atorvastatin 10mg (Strip of 10)", amount: 224, status: "Completed" }
                ]
            },
            { 
                id: "p2", 
                initial: "A", 
                name: "Apollo Pharmacy Store", 
                email: "apollo@gmail.com", 
                phone: "8765432109", 
                city: "Delhi", 
                status: "APPROVED",
                orders: [
                    { orderId: "ORD-6629", patient: "Suresh Mehra", date: "12 July 2026", items: "Insulin Pen Needles (Pack of 5)", amount: 450, status: "Completed" }
                ]
            },
            { 
                id: "p3", 
                initial: "C", 
                name: "City Pharmacy", 
                email: "city.pharm@gmail.com", 
                phone: "7654321098", 
                city: "Jaipur", 
                status: "APPROVED",
                orders: [
                    { orderId: "ORD-3291", patient: "Amit Verma", date: "09 July 2026", items: "Voglibose 0.3mg Tablets", amount: 180, status: "Completed" }
                ]
            },
            { 
                id: "p4", 
                initial: "G", 
                name: "Guardian Pharmacy", 
                email: "guardian@gmail.com", 
                phone: "6543210987", 
                city: "Chandigarh", 
                status: "APPROVED",
                orders: [
                    { orderId: "ORD-5192", patient: "Dinesh Kumar", date: "14 July 2026", items: "Glimepiride 2mg", amount: 112, status: "Completed" }
                ]
            }
        ],
        food: [
            { 
                id: "f1", 
                initial: "Z", 
                name: "Zomato Fleet", 
                email: "zomato.fleet@gmail.com", 
                phone: "9999988888", 
                city: "Mohali", 
                status: "APPROVED",
                orders: [
                    { orderId: "ORD-8821", patient: "Rahul Sharma", date: "15 July 2026", items: "High-Fiber Diabetic Oats Meal, Fresh Sugar-free Juice", amount: 320, status: "Dispatched" },
                    { orderId: "ORD-1104", patient: "Dinesh Singh", date: "14 July 2026", items: "Grilled Chicken Salad", amount: 240, status: "Completed" }
                ]
            },
            { 
                id: "f2", 
                initial: "D", 
                name: "Dominos Kitchen", 
                email: "dominos.kitchen@gmail.com", 
                phone: "8888877777", 
                city: "Chandigarh", 
                status: "APPROVED",
                orders: [
                    { orderId: "ORD-5549", patient: "Karan Malhotra", date: "13 July 2026", items: "Multigrain Base Veggie Pizza (Small)", amount: 350, status: "Completed" }
                ]
            },
            { 
                id: "f3", 
                initial: "S", 
                name: "Swiggy Hub", 
                email: "swiggy.hub@gmail.com", 
                phone: "7777766666", 
                city: "Delhi", 
                status: "APPROVED",
                orders: [
                    { orderId: "ORD-4211", patient: "Sunita Sen", date: "15 July 2026", items: "Quinoa Veggie Bowl", amount: 280, status: "Completed" }
                ]
            },
            { 
                id: "f4", 
                initial: "P", 
                name: "Pizza Hut Depot", 
                email: "pizzahut.depot@gmail.com", 
                phone: "6666655555", 
                city: "New Delhi", 
                status: "APPROVED",
                orders: [
                    { orderId: "ORD-3021", patient: "Priya Verma", date: "09 July 2026", items: "Wheat Thin Crust Mushroom Pizza", amount: 390, status: "Completed" }
                ]
            }
        ]
    };

    // Close modal on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setShowModal(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleViewOrders = (vendor) => {
        setSelectedVendor(vendor);
        setShowModal(true);
    };

    const getCategoryConfig = () => {
        switch (activeTab) {
            case "lab":
                return {
                    title: "Approved Lab Vendors",
                    desc: "Manage, verify, and track orders across active laboratory channels",
                    badge: `Total Active Labs: ${mockData.lab.length}`,
                    label: "Lab Name",
                    icon: <FaFlask className="text-lg" />,
                    data: mockData.lab
                };
            case "pharmacy":
                return {
                    title: "Approved Pharmacy Vendors",
                    desc: "Manage, verify, and track orders across active pharmacy channels",
                    badge: `Total Active Pharmacies: ${mockData.pharmacy.length}`,
                    label: "Pharmacy Name",
                    icon: <FaPills className="text-lg" />,
                    data: mockData.pharmacy
                };
            case "food":
                return {
                    title: "Approved Food Outlets",
                    desc: "Manage, verify, and track orders across active food delivery channels",
                    badge: `Total Active Outlets: ${mockData.food.length}`,
                    label: "Outlet Name",
                    icon: <FaUtensils className="text-lg" />,
                    data: mockData.food
                };
            default:
                return { title: "", desc: "", badge: "", label: "", icon: null, data: [] };
        }
    };

    const config = getCategoryConfig();

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 py-8 select-none animate-fadeIn">
            
            {/* 1. PREMIUM TAB SWITCHER */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-wrap gap-2.5">
                <button
                    onClick={() => setActiveTab("lab")}
                    className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all focus:outline-none ${
                        activeTab === "lab" 
                            ? `${themeBg} text-white shadow-lg ${themeShadow}` 
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                >
                    <FaFlask /> Lab Diagnostics
                </button>
                <button
                    onClick={() => setActiveTab("pharmacy")}
                    className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all focus:outline-none ${
                        activeTab === "pharmacy" 
                            ? `${themeBg} text-white shadow-lg ${themeShadow}` 
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                >
                    <FaPills /> Pharmacy
                </button>
                <button
                    onClick={() => setActiveTab("food")}
                    className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all focus:outline-none ${
                        activeTab === "food" 
                            ? `${themeBg} text-white shadow-lg ${themeShadow}` 
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                >
                    <FaUtensils /> Food
                </button>
            </div>

            {/* 2. DYNAMIC HEADER SECTION */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center shrink-0">
                        {config.icon}
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-800 tracking-tight leading-snug">{config.title}</h2>
                        <p className="text-xs text-gray-400">{config.desc}</p>
                    </div>
                </div>

                <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide">
                    <FaCheckCircle className="text-[10px]" /> {config.badge}
                </span>
            </div>

            {/* 3. MANAGE VENDOR ORDERS DATA GRID TABLE */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[900px] table-auto align-middle">
                        <thead>
                            <tr className="text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50 border-b border-gray-100">
                                <th className="text-center px-6 py-4 w-16">Profile</th>
                                <th className="text-left px-6 py-4">{config.label}</th>
                                <th className="text-left px-6 py-4">Email Contact</th>
                                <th className="text-left px-6 py-4">Phone Line</th>
                                <th className="text-center px-6 py-4">City</th>
                                <th className="text-center px-6 py-4">Verification</th>
                                <th className="text-center px-6 py-4 w-40">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {config.data.length > 0 ? (
                                config.data.map((vendor) => (
                                    <tr 
                                        key={vendor.id}
                                        className="hover:bg-gray-50/60 transition-colors duration-150"
                                    >
                                        {/* Profile Avatar */}
                                        <td className="px-6 py-4 text-center">
                                            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-black text-white text-xs shrink-0 shadow-sm ${
                                                activeTab === "lab" ? "bg-emerald-500" : activeTab === "pharmacy" ? "bg-sky-500" : "bg-amber-500"
                                            }`}>
                                                {vendor.initial}
                                            </div>
                                        </td>

                                        {/* Vendor Name */}
                                        <td className="px-6 py-4 font-bold text-gray-800 tracking-tight">
                                            {vendor.name}
                                        </td>

                                        {/* Email */}
                                        <td className="px-6 py-4 text-gray-500 font-semibold">
                                            {vendor.email}
                                        </td>

                                        {/* Phone */}
                                        <td className="px-6 py-4 text-gray-500 font-bold tracking-wide">
                                            {vendor.phone}
                                        </td>

                                        {/* City */}
                                        <td className="px-6 py-4 text-center text-gray-600 font-semibold">
                                            {vendor.city}
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide">
                                                {vendor.status}
                                            </span>
                                        </td>

                                        {/* View Orders Action button */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center">
                                                <button
                                                    onClick={() => handleViewOrders(vendor)}
                                                    className="flex items-center gap-1 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-[#3D3F96]/10 text-[#3D3F96] hover:bg-[#3D3F96] hover:text-white transition-all focus:outline-none"
                                                >
                                                    <FaEye /> View Orders
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                                <FaInbox className="text-3xl" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-700">No Approved Vendors Found</h4>
                                                <p className="text-xs text-slate-400 mt-1">Select another category tab to view listings.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 3. PREMIUM PAGINATION CONTROLS */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 flex-wrap gap-4">
                    <button 
                        disabled
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-gray-400 text-xs font-bold uppercase tracking-wider cursor-not-allowed"
                    >
                        <FaChevronRight className="text-[10px] rotate-180" /> Previous
                    </button>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Page 1 of 1
                    </span>
                    <button 
                        disabled
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-gray-400 text-xs font-bold uppercase tracking-wider cursor-not-allowed"
                    >
                        Next <FaChevronRight className="text-[10px]" />
                    </button>
                </div>
            </div>

            {/* 4. PREMIUM ORDER HISTORY MODAL PANEL */}
            {showModal && selectedVendor && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
                    <div 
                        ref={modalRef}
                        className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 relative flex flex-col gap-6 select-none animate-in zoom-in-95 duration-200"
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/15 text-[#3D3F96] flex items-center justify-center shrink-0">
                                    <FaReceipt className="text-lg" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black tracking-tight text-gray-800">Order History</h3>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mt-0.5">Vendor: {selectedVendor.name} ({selectedVendor.id})</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-400 flex items-center justify-center transition-colors focus:outline-none"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Vendor Basic Contacts */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-2xl text-xs font-semibold text-gray-600 shrink-0">
                            <div className="flex items-center gap-2"><FaUser className="text-gray-400" /> Vendor: <strong className="text-gray-800">{selectedVendor.name}</strong></div>
                            <div className="flex items-center gap-2"><FaEnvelope className="text-gray-400" /> Email: <strong className="text-gray-800">{selectedVendor.email}</strong></div>
                            <div className="flex items-center gap-2"><FaPhoneAlt className="text-gray-400" /> Phone: <strong className="text-gray-800">{selectedVendor.phone}</strong></div>
                        </div>

                        {/* Modal Body - Order List Table */}
                        <div className="overflow-y-auto flex-1">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">All Associated Orders</h4>
                            <div className="border border-gray-100 rounded-2xl overflow-hidden">
                                <table className="w-full text-xs text-left align-middle">
                                    <thead>
                                        <tr className="text-[10px] font-black uppercase tracking-wider text-gray-400 bg-gray-50/50 border-b border-gray-100">
                                            <th className="px-4 py-3">Order ID</th>
                                            <th className="px-4 py-3">Customer / Patient</th>
                                            <th className="px-4 py-3">Order Date</th>
                                            <th className="px-4 py-3">Details / Items</th>
                                            <th className="px-4 py-3 text-right">Amount</th>
                                            <th className="px-4 py-3 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {selectedVendor.orders && selectedVendor.orders.length > 0 ? (
                                            selectedVendor.orders.map((order, index) => (
                                                <tr key={index} className="hover:bg-gray-50/40">
                                                    <td className="px-4 py-3 font-mono font-bold text-[#3D3F96]">{order.orderId}</td>
                                                    <td className="px-4 py-3 font-bold text-gray-700">{order.patient}</td>
                                                    <td className="px-4 py-3 text-gray-400 font-semibold flex items-center gap-1.5"><FaRegCalendarAlt className="text-[10px]" />{order.date}</td>
                                                    <td className="px-4 py-3 text-gray-500 font-semibold truncate max-w-[200px]" title={order.items}>{order.items}</td>
                                                    <td className="px-4 py-3 text-right font-black text-gray-800">₹{order.amount.toLocaleString("en-IN")}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                                            order.status === "Completed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                                                        }`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-12 text-center text-gray-400 font-semibold">
                                                    No orders associated with this vendor yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end border-t border-gray-100 pt-4 shrink-0">
                            <button 
                                type="button" 
                                onClick={() => setShowModal(false)}
                                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold uppercase tracking-wider transition-all focus:outline-none"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}