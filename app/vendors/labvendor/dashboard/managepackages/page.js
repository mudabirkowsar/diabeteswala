"use client";
import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  PackagePlus,
  PackageCheck,
  Plus,
  Trash2,
  Edit3,
  Eye,
  Loader2,
  TestTube2,
  Clock,
  Tag,
  AlertTriangle,
  Sparkles,
  User,
  CheckCircle2,
  Filter,
  Layers,
  RotateCcw
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

import CreateCustomPackageModal from './components/CreateCustomPackageModal';
import EditCustomPackageModal from './components/EditCustomPackageModal';
import CustomPackageDetailsModal from './components/CustomPackageDetailsModal';

// Import your API service functions
import LabVendorAPI from '../../../../services/LabVendorAPI';

export default function LabVendorPackagesPage() {
  // --- Data Listings ---
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // --- Search & Main Category Filters ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // --- Modals State ---
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDetailPackage, setSelectedDetailPackage] = useState(null);
  const [editingPackage, setEditingPackage] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // --- Fetch Lab's Custom Packages ---
  const fetchVendorPackages = async () => {
    setLoading(true);
    try {
      const response = await LabVendorAPI.getMyLabPackages();
      if (response && response.success) {
        setPackages(response.data || []);
      } else {
        toast.error(response?.message || "Failed to load custom packages.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Could not retrieve your custom package catalog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorPackages();
  }, []);

  // --- DYNAMICALLY EXTRACT UNIQUE MAIN CATEGORIES FROM DATABASE ---
  const dynamicCategories = useMemo(() => {
    if (!packages || packages.length === 0) return ["All"];

    // Extract every valid mainCategory, trim whitespace, and eliminate duplicates
    const uniqueCategories = Array.from(
      new Set(
        packages
          .map((pkg) => pkg.mainCategory?.trim())
          .filter((cat) => Boolean(cat))
      )
    );

    return ["All", ...uniqueCategories];
  }, [packages]);

  // If active category selection disappears on re-fetch, reset to "All"
  useEffect(() => {
    if (selectedCategory !== "All" && !dynamicCategories.includes(selectedCategory)) {
      setSelectedCategory("All");
    }
  }, [dynamicCategories, selectedCategory]);

  // --- REAL-TIME FILTERING (BY DYNAMIC CATEGORY & SEARCH QUERY) ---
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      // Category condition
      const matchesCategory =
        selectedCategory === "All" ||
        pkg.mainCategory?.trim().toLowerCase() === selectedCategory.trim().toLowerCase();

      // Search condition
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        pkg.packageName?.toLowerCase().includes(q) ||
        pkg.category?.toLowerCase().includes(q) ||
        pkg.sampleTypes?.some((s) => s.toLowerCase().includes(q));

      return matchesCategory && matchesQuery;
    });
  }, [packages, selectedCategory, searchQuery]);

  // --- Reset Filters ---
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
  };

  // --- Execute Package Deletion ---
  const handleDeleteExecute = async () => {
    if (!deleteConfirmId) return;
    setActionLoading(true);
    try {
      const response = await LabVendorAPI.deleteLabPackage(deleteConfirmId);
      if (response && response.success) {
        toast.success(response.message || "Custom package removed successfully.");
        setDeleteConfirmId(null);
        fetchVendorPackages();
      } else {
        toast.error(response?.message || "Failed to delete package.");
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
    fetchVendorPackages();
  };

  return (
    <main className="min-h-screen py-0 px-0 sm:px-6 lg:px-0 antialiased select-none">
      <Toaster position="top-right" />

      {/* --- PAGE HEADER --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <PackageCheck className="text-[#3d3f96]" /> My Custom Health Packages
          </h1>
          <p className="text-slate-500 font-semibold text-xs mt-1">
            Build customized clinical bundles, set your laboratory's base MRP, and configure promotional patient discounts.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#3d3f96] hover:bg-[#2d2f75] text-white px-5 py-2.5 rounded-xl shadow-sm text-xs font-bold transition-all cursor-pointer"
          >
            <Plus size={14} /> Create Custom Package
          </button>
        </div>
      </div>

      {/* --- SEARCH & DYNAMIC MAIN CATEGORY DROPDOWN BAR --- */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">

        {/* Search Bar */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search your packages by title or specimen (e.g. Blood, Urine)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
          />
        </div>

        {/* Dynamic Main Category Dropdown Selector */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-8 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all cursor-pointer appearance-none"
            >
              {dynamicCategories.map((category) => (
                <option key={category} value={category} className="text-slate-700 font-bold">
                  {category === "All" ? "All Main Categories" : category}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
              ▼
            </div>
          </div>

          {/* Reset Button */}
          {(searchQuery || selectedCategory !== "All") && (
            <button
              onClick={handleResetFilters}
              title="Reset filters"
              className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition-all cursor-pointer flex items-center justify-center shrink-0"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>

      </div>

      {/* --- ACTIVE FILTER CHIP --- */}
      {selectedCategory !== "All" && (
        <div className="flex items-center gap-2 mb-4 px-2">
          <span className="text-xs text-slate-400 font-semibold">Active Category:</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 text-[#3d3f96] border border-indigo-100 font-black text-xs">
            <Filter size={11} /> {selectedCategory}
            <button
              onClick={() => setSelectedCategory("All")}
              className="ml-1 text-slate-400 hover:text-red-500 font-bold cursor-pointer"
            >
              ×
            </button>
          </span>
          <span className="text-xs font-bold text-slate-500">
            ({filteredPackages.length} package{filteredPackages.length === 1 ? '' : 's'})
          </span>
        </div>
      )}

      {/* --- PACKAGES TABLE --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Your Custom Packages...</p>
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
                  <th className="text-center px-6 py-4 w-32">Included Tests</th>
                  {/* <th className="text-left px-6 py-4 w-36">Specimen Types</th> */}
                  <th className="text-left px-6 py-4 w-44">Offer Price & MRP</th>
                  <th className="text-center px-6 py-4 w-28">TAT</th>
                  <th className="text-center px-6 py-4 w-24">Status</th>
                  <th className="text-center px-6 py-4 w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredPackages.map((pkg, index) => {
                  const testCount = pkg.totalTestsIncluded || (Array.isArray(pkg.tests) ? pkg.tests.length : 0);
                  const mrp = Number(pkg.mrp || 0);
                  const discount = Number(pkg.discountPercent || 0);
                  const offerPrice = pkg.offerPrice !== undefined ? Number(pkg.offerPrice) : Math.round(mrp - (mrp * (discount / 100)));

                  return (
                    <tr key={pkg._id} className="hover:bg-slate-50/40 transition-colors duration-150">

                      {/* S No. */}
                      <td className="px-6 py-4 text-center font-bold text-slate-400 text-xs">
                        {String(index + 1).padStart(2, "0")}
                      </td>

                      {/* Package Title & Demographic */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-800 tracking-tight leading-tight max-w-[280px] truncate" title={pkg.packageName}>
                            {pkg.packageName}
                          </h3>
                          {pkg.isCustom && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-indigo-50 text-[#3d3f96] border border-indigo-100">
                              Custom
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-semibold">
                          <span>Subcategory: <strong className="text-slate-600">{pkg.category || "General"}</strong></span>
                          <span>•</span>
                          <span>Target: <strong className="text-slate-600">{pkg.gender || "Both"}</strong></span>
                        </div>
                      </td>

                      {/* Main Category Badge */}
                      <td className="px-6 py-4">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 border border-slate-200/80 font-bold text-xs truncate max-w-[150px]" title={pkg.mainCategory}>
                          {pkg.mainCategory || "Uncategorized"}
                        </span>
                      </td>

                      {/* Tests Count */}
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50/70 text-[#3d3f96] border border-indigo-100/50 font-black text-xs">
                          <Sparkles size={12} /> {testCount} Tests
                        </span>
                      </td>

                      {/* Specimen Types */}
                      {/* <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700">
                                                    <TestTube2 size={13} className="text-rose-500" />
                                                    {Array.isArray(pkg.sampleTypes) && pkg.sampleTypes.length > 0 
                                                        ? pkg.sampleTypes.join(", ") 
                                                        : "Standard Specimen"}
                                                </span>
                                            </td> */}

                      {/* Pricing & Offer Price */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-extrabold text-slate-900">₹ {offerPrice}</span>
                            {discount > 0 && (
                              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">
                                {discount}% OFF
                              </span>
                            )}
                          </div>
                          {discount > 0 && (
                            <span className="text-[10px] text-slate-400 font-semibold line-through">
                              MRP: ₹ {mrp}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Turnaround */}
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                          <Clock size={11} className="text-slate-400" /> {pkg.reportTime || "12 Hours"}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${pkg.isActive !== false
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-red-50 text-red-700 border-red-100'
                          }`}>
                          {pkg.isActive !== false ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedDetailPackage(pkg)}
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60 transition-all cursor-pointer"
                            title="Inspect Package Profile"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => setEditingPackage(pkg)}
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-[#3d3f96] text-slate-600 border border-slate-200/60 transition-all cursor-pointer"
                            title="Edit Package Pricing & Tests"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(pkg._id)}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-100/50 transition-all cursor-pointer"
                            title="Delete Custom Package"
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
        </div>
      ) : (
        <div className="py-24 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
          <PackagePlus size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-500 font-bold px-4">
            {selectedCategory !== "All"
              ? `No custom packages found under "${selectedCategory}".`
              : "No custom packages match your query parameters."}
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all cursor-pointer"
          >
            <RotateCcw size={12} /> Clear Filters
          </button>
        </div>
      )}

      {/* --- MODALS --- */}
      <CreateCustomPackageModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleSuccessCallback}
      />

      <EditCustomPackageModal
        isOpen={Boolean(editingPackage)}
        pkgData={editingPackage}
        onClose={() => setEditingPackage(null)}
        onSuccess={handleSuccessCallback}
      />

      <CustomPackageDetailsModal
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
            <h3 className="text-base font-black text-slate-900">Delete Custom Package</h3>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
              Are you sure you want to permanently delete this package? Patients will no longer be able to book this bundle.
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
                {actionLoading ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}