"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  Bike,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  Trash2,
  Eye,
  Loader2,
  RefreshCw,
  User,
  ChevronLeft,
  ChevronRight,
  TestTube2,
  Edit3
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Import child modals
import CreateDriver from './components/CreateDriver';
import ViewDriver from './components/ViewDriver';
import EditDriver from './components/EditDriver';

// Import Lab API service
import LabVendorAPI from '../../../../services/LabVendorAPI';

// Helper to resolve backend image paths
export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('blob:') || path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.1.10:5002').replace(/\/+$/, '');
  const clean = path.replace(/^public\//, '').replace(/^\/+/, '');
  return `${base}/${clean}`;
};

export default function LabDriversPage() {
  // --- Data States ---
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDrivers, setTotalDrivers] = useState(0);

  // --- Search & Filters ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Available' | 'Busy' | 'Offline'

  // --- Modals Control ---
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewDriverId, setViewDriverId] = useState(null);
  const [editDriverId, setEditDriverId] = useState(null);

  // --- Action Loading State ---
  const [statusTogglingId, setStatusTogglingId] = useState(null);

  // --- 1. Fetch Paginated Drivers List ---
  const fetchDriversList = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await LabVendorAPI.labVendorGetDriversList({ page: pageNumber });
      if (res && res.success) {
        setDrivers(res.data || []);
        setPage(res.page || 1);
        setTotalPages(res.pages || 1);
        setTotalDrivers(res.total || 0);
      } else {
        toast.error('Failed to load phlebotomists list');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error loading lab phlebotomists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriversList(1);
  }, []);

  // --- 2. Live Search Handling ---
  const handleSearchSubmit = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) {
      fetchDriversList(1);
      return;
    }

    setSearching(true);
    try {
      const res = await LabVendorAPI.labVendorSearchDrivers({ query: searchQuery.trim() });
      if (res && res.success) {
        setDrivers(res.data || []);
        setTotalPages(1);
      } else {
        toast.error('Search query failed');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error searching phlebotomists');
    } finally {
      setSearching(false);
    }
  };

  // --- 3. Toggle Status from Table ---
  const handleInlineStatusChange = async (driverId, newStatus) => {
    setStatusTogglingId(driverId);
    try {
      const res = await LabVendorAPI.labVendorToggleDriverStatus(driverId, { status: newStatus });
      if (res && res.success) {
        toast.success(res.message || `Status updated to ${newStatus}`);
        setDrivers(prev =>
          prev.map(d => (d._id === driverId ? { ...d, status: newStatus, isOnline: res.isOnline } : d))
        );
      } else {
        toast.error(res?.message || 'Status update failed');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error updating duty status');
    } finally {
      setStatusTogglingId(null);
    }
  };

  // --- 4. Delete Driver / Phlebotomist ---
  const handleDeleteDriver = async (driver) => {
    if (!window.confirm(`Are you sure you want to remove phlebotomist "${driver.name}"? If they are assigned to an active home sample collection, this action will be blocked.`)) {
      return;
    }

    try {
      const res = await LabVendorAPI.labVendorDeleteDriver(driver._id);
      if (res && res.success) {
        toast.success(res.message || 'Phlebotomist deleted successfully');
        setDrivers(prev => prev.filter(d => d._id !== driver._id));
        setTotalDrivers(prev => Math.max(0, prev - 1));
      } else {
        toast.error(res?.message || 'Failed to delete record');
      }
    } catch (err) {
      console.error(err);
      // Handles 400 Bad Request if assigned to active sample collection order
      toast.error(err.response?.data?.message || 'Error deleting phlebotomist');
    }
  };

  // Filter by status client-side
  const displayedDrivers = useMemo(() => {
    if (statusFilter === 'All') return drivers;
    return drivers.filter(d => d.status === statusFilter);
  }, [drivers, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased ">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto space-y-6">

        {/* --- HEADER SECTION --- */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#3d3f96] text-white flex items-center justify-center shadow-md shadow-teal-100 shrink-0">
              <TestTube2 size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Phlebotomists &amp; Fleet Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Manage home sample collection riders, track live duty statuses, and onboard verified phlebotomists.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => {
                setSearchQuery('');
                fetchDriversList(page);
              }}
              title="Refresh Staff List"
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#3d3f96] hover:bg-[#0f766e] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-teal-100 active:scale-95 transition-all cursor-pointer"
            >
              <Plus size={15} />
              <span>Onboard Phlebotomist</span>
            </button>
          </div>
        </div>

        {/* --- SEARCH & STATUS FILTER TOOLBAR --- */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-96 flex items-center gap-2">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, phone, or username..."
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl active:scale-95 transition-all cursor-pointer"
            >
              {searching ? '...' : 'Search'}
            </button>
          </form>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 w-full lg:w-auto overflow-x-auto">
            <span className="text-[10px] font-black uppercase text-slate-400 mr-1.5 flex items-center gap-1 shrink-0">
              <Filter size={12} /> Status:
            </span>
            {['All', 'Available', 'Busy', 'Offline'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#3d3f96] text-white shadow-md shadow-teal-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

        </div>

        {/* --- PHLEBOTOMISTS TABLE --- */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                  <th className="py-3.5 px-5 min-w-[200px]">Phlebotomist Profile</th>
                  <th className="py-3.5 px-5 min-w-[140px]">Contact No.</th>
                  <th className="py-3.5 px-5 min-w-[160px]">Assigned Vehicle</th>
                  <th className="py-3.5 px-5 w-36">Duty Status</th>
                  <th className="py-3.5 px-5 w-28 text-center">App State</th>
                  <th className="py-3.5 px-5 w-32 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-400">
                      <Loader2 className="animate-spin text-[#3d3f96] mx-auto mb-2" size={26} />
                      <span className="font-black text-[11px] uppercase tracking-wider">Loading Phlebotomists Fleet...</span>
                    </td>
                  </tr>
                ) : displayedDrivers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-400">
                      No staff records found matching the chosen criteria.
                    </td>
                  </tr>
                ) : (
                  displayedDrivers.map((driver) => {
                    const isToggling = statusTogglingId === driver._id;

                    return (
                      <tr key={driver._id} className="hover:bg-slate-50/80 transition-colors">
                        
                        {/* 1. Profile info */}
                        <td className="py-3.5 px-5 align-top">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center">
                              {driver.profilePic ? (
                                <img
                                  src={getImageUrl(driver.profilePic)}
                                  alt={driver.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = 'https://placehold.co/60x60?text=Staff';
                                  }}
                                />
                              ) : (
                                <User size={18} className="text-slate-300" />
                              )}
                            </div>
                            <div>
                              <div className="font-black text-slate-900 leading-snug">{driver.name}</div>
                              <span className="text-[11px] text-slate-400 font-mono font-bold">@{driver.username}</span>
                            </div>
                          </div>
                        </td>

                        {/* 2. Phone */}
                        <td className="py-3.5 px-5 align-top font-mono font-bold text-slate-700">
                          {driver.phone}
                        </td>

                        {/* 3. Vehicle */}
                        <td className="py-3.5 px-5 align-top">
                          <span className="inline-flex items-center gap-1 text-[11px] font-black text-slate-800">
                            <Bike size={14} className="text-[#3d3f96]" />
                            {driver.vehicleType || 'Bike'}
                          </span>
                          <div className="text-[11px] font-mono text-slate-400 font-bold mt-0.5">
                            {driver.vehicleNumber || '--'}
                          </div>
                        </td>

                        {/* 4. Duty Status Select */}
                        <td className="py-3.5 px-5 align-top">
                          <select
                            disabled={isToggling}
                            value={driver.status}
                            onChange={(e) => handleInlineStatusChange(driver._id, e.target.value)}
                            className={`px-3 py-1.5 text-[11px] font-black uppercase rounded-xl border outline-none cursor-pointer transition-all ${
                              driver.status === 'Available'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : driver.status === 'Busy'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            <option value="Available">Available</option>
                            <option value="Busy">Busy</option>
                            <option value="Offline">Offline</option>
                          </select>
                        </td>

                        {/* 5. Online Status */}
                        <td className="py-3.5 px-5 align-top text-center">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase ${
                            driver.isOnline ? 'text-emerald-600' : 'text-slate-400'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${driver.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                            {driver.isOnline ? 'Online' : 'Offline'}
                          </span>
                        </td>

                        {/* 6. Actions */}
                        <td className="py-3.5 px-5 align-top text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setViewDriverId(driver._id)}
                              title="Inspect Dossier & Certifications"
                              className="p-2 bg-slate-50 hover:bg-[#3d3f96]/10 text-slate-600 hover:text-[#3d3f96] border border-slate-200 rounded-xl transition-all active:scale-95 cursor-pointer"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => setEditDriverId(driver._id)}
                              title="Edit Phlebotomist Details"
                              className="p-2 bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-600 border border-slate-200 rounded-xl transition-all active:scale-95 cursor-pointer"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteDriver(driver)}
                              title="Delete Record"
                              className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl transition-all active:scale-95 cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          {!loading && totalPages > 1 && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>
                Total <strong className="text-slate-800 font-bold">{totalDrivers}</strong> registered phlebotomists
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => fetchDriversList(page - 1)}
                  className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-40 transition-all active:scale-95 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="font-black text-slate-700">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => fetchDriversList(page + 1)}
                  className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-40 transition-all active:scale-95 cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* --- CHILD MODALS --- */}
        <CreateDriver
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => fetchDriversList(1)}
        />

        <ViewDriver
          driverId={viewDriverId}
          isOpen={!!viewDriverId}
          onClose={() => setViewDriverId(null)}
          onStatusUpdated={(id, newStatus, isOnline) => {
            setDrivers(prev =>
              prev.map(d => (d._id === id ? { ...d, status: newStatus, isOnline } : d))
            );
          }}
        />

        <EditDriver
          driverId={editDriverId}
          isOpen={!!editDriverId}
          onClose={() => setEditDriverId(null)}
          onSuccess={() => fetchDriversList(page)}
        />

      </div>
    </div>
  );
}