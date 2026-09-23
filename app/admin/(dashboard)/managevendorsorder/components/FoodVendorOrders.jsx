"use client";

import { useState, useRef, useEffect } from "react";
import {
    FaUtensils, FaEye, FaCheckCircle, FaInbox, FaChevronRight,
    FaTimes, FaReceipt, FaUser, FaRegCalendarAlt, FaPhoneAlt, FaEnvelope
} from "react-icons/fa";

export default function FoodVendorOrders() {
    const [showModal, setShowModal] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const modalRef = useRef(null);

    // Food Vendor Mock Data
    const foodVendors = [
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
    ];

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

    return (
        <div className="space-y-6">
            {/* DYNAMIC HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <FaUtensils className="text-lg" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-800 tracking-tight leading-snug">Approved Food Outlets</h2>
                        <p className="text-xs text-gray-400">Manage, verify, and track orders across active food delivery channels</p>
                    </div>
                </div>

                <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide">
                    <FaCheckCircle className="text-[10px]" /> Total Active Outlets: {foodVendors.length}
                </span>
            </div>

            {/* DATA GRID TABLE */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[900px] table-auto align-middle">
                        <thead>
                            <tr className="text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50 border-b border-gray-100">
                                <th className="text-center px-6 py-4 w-16">Profile</th>
                                <th className="text-left px-6 py-4">Outlet Name</th>
                                <th className="text-left px-6 py-4">Email Contact</th>
                                <th className="text-left px-6 py-4">Phone Line</th>
                                <th className="text-center px-6 py-4">City</th>
                                <th className="text-center px-6 py-4">Verification</th>
                                <th className="text-center px-6 py-4 w-40">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {foodVendors.length > 0 ? (
                                foodVendors.map((vendor) => (
                                    <tr
                                        key={vendor.id}
                                        className="hover:bg-gray-50/60 transition-colors duration-150"
                                    >
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full font-black text-white text-xs shrink-0 shadow-sm bg-amber-500">
                                                {vendor.initial}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-800 tracking-tight">
                                            {vendor.name}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 font-semibold">
                                            {vendor.email}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 font-bold tracking-wide">
                                            {vendor.phone}
                                        </td>
                                        <td className="px-6 py-4 text-center text-gray-600 font-semibold">
                                            {vendor.city}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide">
                                                {vendor.status}
                                            </span>
                                        </td>
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
                                                <h4 className="text-sm font-bold text-slate-700">No Approved Outlets Found</h4>
                                                <p className="text-xs text-slate-400 mt-1">There are no food vendors configured yet.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
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

            {/* ORDER HISTORY MODAL */}
            {showModal && selectedVendor && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
                    <div
                        ref={modalRef}
                        className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 relative flex flex-col gap-6 select-none"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/15 text-[#3D3F96] flex items-center justify-center shrink-0">
                                    <FaReceipt className="text-lg" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black tracking-tight text-gray-800">Order History</h3>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mt-0.5">
                                        Outlet: {selectedVendor.name} ({selectedVendor.id})
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-400 flex items-center justify-center transition-colors focus:outline-none"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Contacts */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-2xl text-xs font-semibold text-gray-600 shrink-0">
                            <div className="flex items-center gap-2"><FaUser className="text-gray-400" /> Outlet: <strong className="text-gray-800">{selectedVendor.name}</strong></div>
                            <div className="flex items-center gap-2"><FaEnvelope className="text-gray-400" /> Email: <strong className="text-gray-800">{selectedVendor.email}</strong></div>
                            <div className="flex items-center gap-2"><FaPhoneAlt className="text-gray-400" /> Phone: <strong className="text-gray-800">{selectedVendor.phone}</strong></div>
                        </div>

                        {/* Orders Table */}
                        <div className="overflow-y-auto flex-1">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">All Associated Orders</h4>
                            <div className="border border-gray-100 rounded-2xl overflow-hidden">
                                <table className="w-full text-xs text-left align-middle">
                                    <thead>
                                        <tr className="text-[10px] font-black uppercase tracking-wider text-gray-400 bg-gray-50/50 border-b border-gray-100">
                                            <th className="px-4 py-3">Order ID</th>
                                            <th className="px-4 py-3">Customer / Patient</th>
                                            <th className="px-4 py-3">Order Date</th>
                                            <th className="px-4 py-3">Meal / Items</th>
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
                                                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${order.status === "Completed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                                                            }`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-12 text-center text-gray-400 font-semibold">
                                                    No orders associated with this outlet yet.
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