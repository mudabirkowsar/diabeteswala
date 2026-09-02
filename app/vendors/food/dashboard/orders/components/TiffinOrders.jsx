"use client";

import React, { useState, useEffect } from 'react';
import { 
    Layers, 
    Search, 
    Loader2, 
    Phone, 
    Calendar, 
    CheckCircle2, 
    AlertCircle, 
    Eye, 
    Inbox 
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

import FoodAPI from '../../../../../services/FoodVendorAPI';
import TiffinDetailModal from './TiffinDetailModal';

export default function TiffinOrders() {
    // --- Data & Loading States ---
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- Filter & Search States ---
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [selectedCycle, setSelectedCycle] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // --- Detail Modal Target State ---
    const [inspectSubId, setInspectSubId] = useState(null);

    // --- Fetch Subscriptions List ---
    const fetchSubscriptions = async () => {
        setLoading(true);
        try {
            const params = {
                ...(selectedStatus !== 'All' && { status: selectedStatus }),
                ...(selectedCycle !== 'All' && { billingCycle: selectedCycle }),
                ...(searchQuery.trim() && { search: searchQuery.trim() })
            };
            const response = await FoodAPI.getVendorStandardSubscriptions(params);
            if (response && response.success) {
                setSubscriptions(response.data || []);
            }
        } catch (err) {
            console.error("Error retrieving tiffin subscriptions:", err);
            toast.error("Failed to load tiffin subscriptions.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, [selectedStatus, selectedCycle, searchQuery]);

    // --- Helper: Status Badge Render ---
    const renderStatusBadge = (status) => {
        const uppercase = status?.toUpperCase();
        if (uppercase === 'ACTIVE') {
            return (
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 flex items-center gap-1 w-fit">
                    <CheckCircle2 size={11} /> Active
                </span>
            );
        }
        if (uppercase === 'COMPLETED') {
            return (
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 flex items-center gap-1 w-fit">
                    <CheckCircle2 size={11} /> Completed
                </span>
            );
        }
        if (uppercase === 'CANCELLED') {
            return (
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100 flex items-center gap-1 w-fit">
                    <AlertCircle size={11} /> Cancelled
                </span>
            );
        }
        return (
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 flex items-center gap-1 w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" /> {status || 'New'}
            </span>
        );
    };

    const statusOptions = ['All', 'New', 'Active', 'Completed', 'Cancelled'];
    const cycleOptions = ['All', 'weekly', 'monthly'];

    return (
        <div className="space-y-6 text-left select-none antialiased">
            <Toaster position="top-right" />

            {/* --- SEARCH & FILTERS BAR --- */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                    
                    {/* Search Input */}
                    <div className="relative w-full lg:w-96">
                        <Search className="absolute left-4 top-3 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by Booking ID, Customer, Phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        {/* Billing Cycle Filter */}
                        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-150">
                            {cycleOptions.map((cycle) => (
                                <button
                                    key={cycle}
                                    onClick={() => setSelectedCycle(cycle)}
                                    className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition cursor-pointer ${
                                        selectedCycle === cycle
                                            ? 'bg-white text-[#3d3f96] shadow-sm'
                                            : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    {cycle}
                                </button>
                            ))}
                        </div>

                        {/* Status Filter Tabs */}
                        <div className="flex items-center gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden">
                            {statusOptions.map((status) => {
                                const isSelected = selectedStatus === status;
                                return (
                                    <button
                                        key={status}
                                        onClick={() => setSelectedStatus(status)}
                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                                            isSelected
                                                ? 'bg-red-50/60 text-red-600 border-red-200/60 font-black shadow-sm'
                                                : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                                        }`}
                                    >
                                        {status}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>

            {/* --- SUBSCRIPTIONS TABLE VIEW --- */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading tiffin subscription ledger...</p>
                </div>
            ) : subscriptions.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm border-dashed">
                    <Inbox className="w-12 h-12 text-slate-300 mb-3" />
                    <h3 className="text-base font-bold text-slate-700">No Tiffin Subscriptions Found</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        No standard subscription packages match your current filter parameters.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 uppercase font-extrabold bg-slate-50/70 tracking-wider">
                                    <th className="py-4 px-5">Booking ID</th>
                                    <th className="py-4 px-5">Plan Specification</th>
                                    <th className="py-4 px-5">Customer &amp; Phone</th>
                                    <th className="py-4 px-5">Subscription Period</th>
                                    <th className="py-4 px-5">Total Revenue</th>
                                    <th className="py-4 px-5">Current State</th>
                                    <th className="py-4 px-5 text-right">Inspect</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                                {subscriptions.map((sub) => {
                                    return (
                                        <tr key={sub._id} className="hover:bg-slate-50/50 transition-colors">
                                            
                                            {/* Booking ID */}
                                            <td className="py-4 px-5">
                                                <div className="space-y-0.5">
                                                    <strong className="text-slate-900 font-black tracking-tight block">{sub.bookingId}</strong>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase">{sub.bookingType}</span>
                                                </div>
                                            </td>

                                            {/* Plan Name & Cycle */}
                                            <td className="py-4 px-5">
                                                <div className="space-y-0.5">
                                                    <strong className="text-slate-800 font-extrabold block truncate max-w-[180px]">{sub.planName}</strong>
                                                    <span className="text-[10px] font-black uppercase text-[#3d3f96] bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 inline-block">
                                                        {sub.billingCycle} cycle
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Customer Info */}
                                            <td className="py-4 px-5">
                                                <div className="space-y-0.5">
                                                    <strong className="text-slate-800 font-bold block">{sub.customerName || "Customer"}</strong>
                                                    <a href={`tel:${sub.customerPhone}`} className="text-[11px] font-bold text-[#3d3f96] hover:underline flex items-center gap-1">
                                                        <Phone size={10} /> {sub.customerPhone}
                                                    </a>
                                                </div>
                                            </td>

                                            {/* Period Schedule */}
                                            <td className="py-4 px-5">
                                                <div className="space-y-0.5 text-[11px] text-slate-600">
                                                    <p className="flex items-center gap-1 font-bold">
                                                        <Calendar size={11} className="text-slate-400" /> {sub.startDate}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 font-semibold pl-4">to {sub.endDate}</p>
                                                </div>
                                            </td>

                                            {/* Total Amount */}
                                            <td className="py-4 px-5">
                                                <strong className="font-mono text-sm font-black text-slate-900">₹{sub.totalAmount}</strong>
                                            </td>

                                            {/* Status Badge */}
                                            <td className="py-4 px-5">
                                                {renderStatusBadge(sub.status)}
                                            </td>

                                            {/* Action Button */}
                                            <td className="py-4 px-5 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => setInspectSubId(sub._id || sub.bookingId)}
                                                    className="px-3.5 py-2 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 ml-auto cursor-pointer"
                                                >
                                                    <Eye size={13} />
                                                    <span>View Details</span>
                                                </button>
                                            </td>

                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- STANDALONE DETAIL MODAL --- */}
            <TiffinDetailModal 
                subscriptionId={inspectSubId}
                isOpen={!!inspectSubId}
                onClose={() => setInspectSubId(null)}
            />

        </div>
    );
}