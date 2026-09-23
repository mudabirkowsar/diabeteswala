"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Ban,
    X,
    Search,
    Calendar,
    Phone,
    User,
    ShoppingBag,
    CreditCard,
    ChevronLeft,
    ChevronRight,
    Loader2,
    RotateCcw
} from "lucide-react";

export default function CancelledFoodOrdersModal({ isOpen, onClose }) {
    const [search, setSearch] = useState("");
    const modalRef = useRef(null);

    // Mock Cancelled Orders Data (or replace with your cancelled orders API)
    const cancelledOrders = [
        {
            _id: "c1",
            orderId: "ORD-CAN-8821",
            outletName: "The Harvest Kitchen",
            customer: { name: "Aarav Sharma", phone: "9876543210" },
            cancelledDate: "20 Sept 2026",
            items: "Diabetic Super Oats Bowl (x2)",
            amount: 540,
            refundStatus: "Refunded",
            reason: "Delivery address out of service area"
        },
        {
            _id: "c2",
            orderId: "ORD-CAN-4190",
            outletName: "Healthy Bites Kitchen",
            customer: { name: "Sunita Verma", phone: "9123456789" },
            cancelledDate: "18 Sept 2026",
            items: "Multigrain Avocado Salad (x1)",
            amount: 290,
            refundStatus: "Processing",
            reason: "Cancelled by customer within grace period"
        }
    ];

    // Close on backdrop click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150">
            <div
                ref={modalRef}
                className="bg-white rounded-3xl w-full max-w-6xl max-h-[88vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col select-none animate-in zoom-in-95 duration-150"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-rose-50/50 shrink-0">
                    <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200 shadow-xs">
                            <Ban className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-black text-slate-900 tracking-tight">Cancelled Food Orders</h3>
                                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700">
                                    {cancelledOrders.length} Cancelled
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 font-medium">Audit logs for cancelled direct orders and refund statuses</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer shadow-xs"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Filter */}
                <div className="px-6 py-3.5 border-b border-slate-100 bg-white flex items-center justify-between gap-4 shrink-0">
                    <div className="relative w-72">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search cancelled order ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-rose-400 focus:outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Table Body */}
                <div className="overflow-y-auto flex-1 p-6">
                    <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                        <table className="w-full text-xs text-left align-middle">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-100">
                                    <th className="px-5 py-4">Order ID</th>
                                    <th className="px-5 py-4">Outlet Name</th>
                                    <th className="px-5 py-4">Customer Details</th>
                                    <th className="px-5 py-4">Cancelled Date</th>
                                    <th className="px-5 py-4">Items / Details</th>
                                    <th className="px-5 py-4">Reason</th>
                                    <th className="px-5 py-4 text-right">Amount</th>
                                    <th className="px-5 py-4 text-center">Refund</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {cancelledOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="px-5 py-4 font-mono font-black text-rose-600">
                                            {order.orderId}
                                        </td>
                                        <td className="px-5 py-4 font-bold text-slate-800">
                                            {order.outletName}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="font-extrabold text-slate-800">{order.customer.name}</div>
                                            <div className="text-[10px] text-slate-400">{order.customer.phone}</div>
                                        </td>
                                        <td className="px-5 py-4 text-slate-600 font-bold">
                                            {order.cancelledDate}
                                        </td>
                                        <td className="px-5 py-4 text-slate-600 font-medium truncate max-w-[180px]">
                                            {order.items}
                                        </td>
                                        <td className="px-5 py-4 text-slate-500 font-medium text-[11px]">
                                            {order.reason}
                                        </td>
                                        <td className="px-5 py-4 text-right font-black text-slate-800">
                                            ₹{order.amount}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                order.refundStatus === "Refunded"
                                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                    : "bg-amber-50 text-amber-700 border border-amber-200"
                                            }`}>
                                                {order.refundStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-xl bg-slate-900 text-white hover:bg-black text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}