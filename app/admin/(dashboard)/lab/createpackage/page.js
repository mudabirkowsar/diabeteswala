"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  PackageCheck,
  Plus,
  Trash2,
  Edit3,
  Eye,
  Loader2,
  Sparkles,
  Layers,
  RotateCcw,
  AlertTriangle,
  Building2,
  ChevronLeft,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

import CreateMasterPackageModal from './components/CreateMasterPackageModal';
import EditMasterPackageModal from './components/EditMasterPackageModal';
import MasterPackageDetailsModal from './components/MasterPackageDetailsModal';

// Adjust this import path to match your project directory
import AdminAPI from '../../../../services/AdminAPI';

export default function AdminMasterPackagesPage() {
  // --- Data & Pagination State ---
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toggleLoadingId, setToggleLoadingId] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 20;

  // --- Search & Filter State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // --- Modals State ---
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDetailPackage, setSelectedDetailPackage] = useState(null);
  const [editingPackage, setEditingPackage] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // --- Fetch Master Packages ---
  const fetchMasterPackages = useCallback(async () => {
    setLoading(true);
    try {
      const response = await AdminAPI.adminGetMasterPackages({ page, limit });
      if (response && response.success) {
        setPackages(response.data || []);
        setTotalPages(response.totalPages || 1);
        setTotalCount(response.total || (response.data ? response.data.length : 0));
      } else {
        toast.error(response?.message || "Failed to load master packages.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Could not retrieve master packages directory.");
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchMasterPackages();
  }, [fetchMasterPackages]);

  // --- Dynamic Categories Extraction ---
  const dynamicCategories = useMemo(() => {
    if (!packages || packages.length === 0) return ["All"];
    const unique = Array.from(
      new Set(
        packages
          .map((pkg) => pkg.mainCategory?.trim())
          .filter(Boolean)
      )
    );
    return ["All", ...unique];
  }, [packages]);

  // --- Client-side Search and Filter ---
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const matchesCategory =
        selectedCategory === "All" ||
        pkg.mainCategory?.trim().toLowerCase() === selectedCategory.trim().toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        pkg.packageName?.toLowerCase().includes(q) ||
        pkg.category?.toLowerCase().includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [packages, selectedCategory, searchQuery]);

  // --- Toggle Active Status ---
  const handleToggleStatus = async (pkgId, currentStatus) => {
    setToggleLoadingId(pkgId);
    try {
      const response = await AdminAPI.adminToggleMasterPackageStatus(pkgId);
      if (response && response.success) {
        toast.success(`Package ${currentStatus ? "deactivated" : "activated"} successfully.`);
        // Optimistic update
        setPackages((prev) =>
          prev.map((item) => (item._id === pkgId ? { ...item, isActive: !item.isActive } : item))
        );
      } else {
        toast.error(response?.message || "Failed to change status.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error updating package status.");
    } finally {
      setToggleLoadingId(null);
    }
  };

  // --- Execute Deletion ---
  const handleDeleteExecute = async () => {
    if (!deleteConfirmId) return;
    setActionLoading(true);
    try {
      const response = await AdminAPI.adminDeleteMasterPackage(deleteConfirmId);
      if (response && response.success) {
        toast.success(response.message || "Master package deleted permanently.");
        setDeleteConfirmId(null);
        fetchMasterPackages();
      } else {
        toast.error(response?.message || "Failed to delete master package.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "An error occurred while deleting the package.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuccessCallback = () => {
    setShowCreateModal(false);
    setEditingPackage(null);
    fetchMasterPackages();
  };

  return (
    <main className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 bg-slate-50/50 antialiased select-none">
      <Toaster position="top-right" />

      {/* --- PAGE HEADER --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <PackageCheck className="text-[#3d3f96]" /> Master Health Packages
          </h1>
          <p className="text-slate-500 font-semibold text-xs mt-1">
            Centrally manage standardized platform packages, set benchmark MRPs, and monitor vendor adoption.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 bg-[#3d3f96] hover:bg-[#2d2f75] text-white px-5 py-2.5 rounded-xl shadow-sm text-xs font-bold transition-all cursor-pointer"
        >
          <Plus size={15} /> Create Master Package
        </button>
      </div>

      {/* --- SEARCH & CATEGORY FILTER BAR --- */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search master packages by name or concern..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-8 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all cursor-pointer appearance-none"
            >
              {dynamicCategories.map((category) => (
                <option key={category} value={category}>
                  {category === "All" ? "All Main Categories" : category}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
              ▼
            </div>
          </div>

          {(searchQuery || selectedCategory !== "All") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              title="Reset Filters"
              className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition-all cursor-pointer flex items-center justify-center shrink-0"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* --- PACKAGES TABLE --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Master Packages...</p>
        </div>
      ) : filteredPackages.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1100px] table-auto align-middle">
              <thead>
                <tr className="text-[11px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/50 border-b border-slate-100">
                  <th className="text-center px-6 py-4 w-16">S No.</th>
                  <th className="text-left px-6 py-4">Package Profile</th>
                  <th className="text-left px-6 py-4 w-40">Main Category</th>
                  <th className="text-center px-6 py-4 w-32">Bundled Tests</th>
                  <th className="text-left px-6 py-4 w-36">Standard MRP</th>
                  <th className="text-left px-6 py-4 w-44">Market Competition</th>
                  <th className="text-center px-6 py-4 w-28">Status</th>
                  <th className="text-center px-6 py-4 w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredPackages.map((pkg, index) => {
                  const testCount = pkg.testCount || (Array.isArray(pkg.tests) ? pkg.tests.length : 0);
                  const serialNumber = (page - 1) * limit + index + 1;

                  return (
                    <tr key={pkg._id} className="hover:bg-slate-50/40 transition-colors duration-150">
                      {/* S No. */}
                      <td className="px-6 py-4 text-center font-bold text-slate-400 text-xs">
                        {String(serialNumber).padStart(2, "0")}
                      </td>

                      {/* Package Profile */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-800 tracking-tight leading-tight max-w-[280px] truncate" title={pkg.packageName}>
                            {pkg.packageName}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-semibold">
                          <span>Concern: <strong className="text-slate-600">{pkg.category || "General"}</strong></span>
                          <span>•</span>
                          <span>Gender: <strong className="text-slate-600">{pkg.gender || "Both"}</strong></span>
                        </div>
                      </td>

                      {/* Main Category */}
                      <td className="px-6 py-4">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 border border-slate-200/80 font-bold text-xs truncate max-w-[150px]">
                          {pkg.mainCategory || "General Pathology"}
                        </span>
                      </td>

                      {/* Tests Count */}
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50/70 text-[#3d3f96] border border-indigo-100/50 font-black text-xs">
                          <Sparkles size={12} /> {testCount} Tests
                        </span>
                      </td>

                      {/* Standard MRP */}
                      <td className="px-6 py-4">
                        <span className="text-sm font-extrabold text-slate-900">
                          ₹ {pkg.standardMRP || 0}
                        </span>
                      </td>

                      {/* Vendor Analytics (vendorCount & minPrice) */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700">
                            <Building2 size={13} className="text-[#3d3f96]" />
                            {pkg.vendorCount !== undefined ? `${pkg.vendorCount} Labs Offering` : '0 Labs Offering'}
                          </span>
                          {pkg.minPrice !== undefined && pkg.minPrice > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600">
                              <TrendingDown size={11} /> Lowest: ₹{pkg.minPrice}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-semibold">No active vendor pricing</span>
                          )}
                        </div>
                      </td>

                      {/* Interactive Toggle Switch */}
                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(pkg._id, pkg.isActive)}
                          disabled={toggleLoadingId === pkg._id}
                          className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            pkg.isActive ? 'bg-[#3d3f96]' : 'bg-slate-300'
                          }`}
                        >
                          {toggleLoadingId === pkg._id ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Loader2 size={10} className="animate-spin text-white" />
                            </div>
                          ) : (
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                pkg.isActive ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedDetailPackage(pkg)}
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60 transition-all cursor-pointer"
                            title="View Package Profile"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => setEditingPackage(pkg)}
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-[#3d3f96] text-slate-600 border border-slate-200/60 transition-all cursor-pointer"
                            title="Edit Master Package"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(pkg._id)}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-100/50 transition-all cursor-pointer"
                            title="Delete Master Package"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
              <span>
                Showing Page {page} of {totalPages} ({totalCount} total packages)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-2 bg-white rounded-xl border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-all"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-2 bg-white rounded-xl border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-all"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="py-24 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
          <PackageCheck size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-500 font-bold px-4">No master health packages found matching your criteria.</p>
        </div>
      )}

      {/* --- MODALS --- */}
      <CreateMasterPackageModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleSuccessCallback}
      />

      <EditMasterPackageModal
        isOpen={Boolean(editingPackage)}
        pkgData={editingPackage}
        onClose={() => setEditingPackage(null)}
        onSuccess={handleSuccessCallback}
      />

      <MasterPackageDetailsModal
        pkg={selectedDetailPackage}
        onClose={() => setSelectedDetailPackage(null)}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />
          <div className="bg-white rounded-[2rem] max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative z-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 mx-auto">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-base font-black text-slate-900">Delete Master Package</h3>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
              This will permanently remove this master health package template across all lab vendors on the platform.
            </p>
            <div className="grid grid-cols-2 gap-3 w-full mt-6">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteExecute}
                disabled={actionLoading}
                className="py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {actionLoading ? <Loader2 size={12} className="animate-spin" /> : <span>Delete</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}