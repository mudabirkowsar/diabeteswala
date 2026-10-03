"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Ambulance,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Phone,
  Radio,
  CreditCard,
  Banknote,
  Loader2,
  ArrowLeft,
  Building2,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Import UserAPI service
import UserAPI from '../../../services/UserAPI';

export default function MyAmbulanceBookingsPage() {
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL'); // 'ALL' | 'EMERGENCY' | 'REFERRAL' | 'ACTIVE'

  // Fetch Booking Orders
  const fetchOrders = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await UserAPI.getMyAmbulanceBookingOrders();
      if (response && response.success) {
        setOrders(response.data || []);
        if (isManualRefresh) toast.success("Bookings list updated!");
      } else {
        toast.error("Failed to load ambulance bookings.");
      }
    } catch (err) {
      console.error("Error fetching ambulance orders:", err);
      toast.error(err.response?.data?.message || "Could not fetch your bookings.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filter & Search Logic
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.bookingId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.caseReference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.ambulance?.vehicleNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.pickupAddress?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.dropoffAddress?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === 'EMERGENCY') {
      return order.bookingCategory?.toLowerCase() === 'emergency';
    }
    if (selectedFilter === 'REFERRAL') {
      return order.bookingCategory?.toLowerCase() === 'referral';
    }
    if (selectedFilter === 'ACTIVE') {
      return order.status?.toLowerCase() === 'confirmed' || order.status?.toLowerCase() === 'searching';
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 py-8 px-4 sm:px-6 lg:px-8 text-left antialiased">
      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto space-y-6">

        {/* --- Top Navigation & Page Title --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="p-2.5 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-slate-900 shadow-xs transition cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  My Ambulance Rides
                </h1>
                <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-red-100 text-red-700">
                  {orders.length} Total
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Real-time tracking, active dispatches & ride histories
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchOrders(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 rounded-2xl text-xs font-black uppercase tracking-wider shadow-xs transition cursor-pointer"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin text-red-600" : ""} />
              <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
            </button>

            <Link
              href="/ambulance"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-red-500/20 transition cursor-pointer"
            >
              <Ambulance size={16} />
              <span>Book New Ride</span>
            </Link>
          </div>
        </div>

        {/* --- Filter Tabs & Search Bar --- */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'ALL', label: 'All Bookings' },
              { id: 'ACTIVE', label: 'Active Dispatches' },
              { id: 'EMERGENCY', label: '🚨 Emergency SOS' },
              { id: 'REFERRAL', label: '📅 Scheduled' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition cursor-pointer ${
                  selectedFilter === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, Vehicle, Location..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition"
            />
          </div>
        </div>

        {/* --- Orders List Display --- */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="animate-spin text-red-600" size={36} />
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
              Fetching your ambulance orders...
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center mx-auto">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-800">No Booking Orders Found</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {searchQuery || selectedFilter !== 'ALL'
                  ? 'No ambulance bookings match your filter criteria. Try resetting filters.'
                  : "You haven't requested any ambulance rides yet."}
              </p>
            </div>
            {(searchQuery || selectedFilter !== 'ALL') && (
              <button
                onClick={() => { setSelectedFilter('ALL'); setSearchQuery(''); }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredOrders.map((order) => {
              const isEmergency = order.bookingCategory?.toLowerCase() === 'emergency';
              const isPaid = order.paymentStatus?.toLowerCase() === 'paid';

              return (
                <div
                  key={order._id || order.bookingId}
                  onClick={() => router.push(`/otherscreens/myambulancebookings/bookingdetail/${order._id || order.bookingId}`)}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 hover:border-red-300 hover:shadow-xl hover:shadow-red-500/5 transition-all duration-200 cursor-pointer group space-y-5"
                >
                  {/* Card Header Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        isEmergency ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'
                      }`}>
                        <Ambulance size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-sm sm:text-base font-black text-slate-900 group-hover:text-red-600 transition-colors">
                            {order.bookingId}
                          </strong>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                            isEmergency ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700'
                          }`}>
                            {isEmergency ? 'Emergency SOS' : 'Scheduled Referral'}
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-400">
                          Ref: {order.caseReference} • {order.rideType || 'Single Ride'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black uppercase px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        {order.status || 'Confirmed'}
                      </span>
                    </div>
                  </div>

                  {/* Route & Timing Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                    
                    {/* Route Addresses (6 Cols) */}
                    <div className="lg:col-span-6 space-y-2 text-xs">
                      <div className="flex items-start gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-red-600 mt-1.5 shrink-0" />
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Pickup</span>
                          <span className="font-bold text-slate-800 line-clamp-1">{order.pickupAddress}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Drop-Off Destination</span>
                          <span className="font-bold text-slate-800 line-clamp-1">{order.dropoffAddress}</span>
                        </div>
                      </div>
                    </div>

                    {/* Schedule / Duration (3 Cols) */}
                    <div className="lg:col-span-3 p-3 bg-slate-50 rounded-2xl text-xs space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Timing</span>
                      {order.scheduledDate ? (
                        <div>
                          <p className="font-black text-slate-900 flex items-center gap-1">
                            <Calendar size={13} className="text-indigo-600" /> {order.scheduledDate}
                          </p>
                          <p className="text-[11px] text-slate-600 font-semibold flex items-center gap-1 mt-0.5">
                            <Clock size={12} className="text-indigo-500" /> {order.scheduledTime}
                          </p>
                        </div>
                      ) : (
                        <p className="font-black text-red-600 flex items-center gap-1">
                          <Radio size={13} className="animate-pulse" /> {order.estimateTime || 'Immediate (30 mins)'}
                        </p>
                      )}
                    </div>

                    {/* Pricing & CTA (3 Cols) */}
                    <div className="lg:col-span-3 flex lg:flex-col items-center lg:items-end justify-between gap-2 text-right">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Amount</span>
                        <div className="text-lg sm:text-xl font-black text-slate-900">
                          ₹{order.totalAmount}
                        </div>
                        <span className={`text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                          isPaid ? 'text-emerald-600' : 'text-amber-600'
                        }`}>
                          {isPaid ? <CreditCard size={11} /> : <Banknote size={11} />}
                          {order.paymentMethod} ({order.paymentStatus})
                        </span>
                      </div>

                      <div className="inline-flex items-center gap-1 text-xs font-black text-red-600 group-hover:translate-x-1 transition-transform">
                        <span>Details & Tracking</span>
                        <ArrowRight size={14} />
                      </div>
                    </div>

                  </div>

                  {/* Footer Pilot / Unit Info */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{order.ambulance?.vehicleNumber}</span>
                      <span>•</span>
                      <span>Pilot: <strong className="text-slate-700">{order.ambulance?.name}</strong></span>
                      {order.clinic && (
                        <>
                          <span>•</span>
                          <span className="text-indigo-600 font-semibold">{order.clinic.name}</span>
                        </>
                      )}
                    </div>

                    <span className="text-[11px] text-slate-400">
                      Booked on {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}