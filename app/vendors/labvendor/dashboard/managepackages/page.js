"use client";
import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  PackageCheck,
  Plus,
  Trash2,
  Edit3,
  Eye,
  Loader2,
  Clock,
  Sparkles,
  Filter,
  Layers,
  RotateCcw,
  Boxes,
  CheckCircle2,
  ShieldCheck,
  Check,
  IndianRupee,
  Percent,
  AlertTriangle,
  PackagePlus
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Existing Custom Package Modals
import CreateCustomPackageModal from './components/CreateCustomPackageModal';
import EditCustomPackageModal from './components/EditCustomPackageModal';
import CustomPackageDetailsModal from './components/CustomPackageDetailsModal';

// Import your API service functions
import LabVendorAPI from '../../../../services/LabVendorAPI';

export default function LabVendorPackagesPage() {
  // --- Only 2 Tabs: 'my-packages' | 'admin-catalog' ---
  const [activeTab, setActiveTab] = useState('my-packages');

  // ================= DATA LISTINGS =================
  const [customPackages, setCustomPackages] = useState([]);
  const [inventoryPackages, setInventoryPackages] = useState([]);
  const [masterPackages, setMasterPackages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSourceType, setSelectedSourceType] = useState("All"); // "All" | "custom" | "inventory"

  // ================= MODAL STATES =================
  // 1. Custom Package Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDetailPackage, setSelectedDetailPackage] = useState(null);
  const [editingCustomPackage, setEditingCustomPackage] = useState(null);

  // 2. Admin Inventory Modals
  const [selectedMasterPkg, setSelectedMasterPkg] = useState(null); // Add to Inventory Modal
  const [editingInventoryPkg, setEditingInventoryPkg] = useState(null); // Edit Inventory Price Modal

  // Form State for Admin Package Pricing
  const [inventoryForm, setInventoryForm] = useState({
    mrp: '',
    discountPercent: 10,
    reportTime: '12 Hours'
  });

  // 3. Unified Delete Modal
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    id: null,
    name: '',
    type: 'custom' // 'custom' | 'inventory'
  });

  // ================= FETCHING APIS =================
  const fetchCustomPackages = async () => {
    try {
      const res = await LabVendorAPI.getMyLabPackages();
      if (res && res.success) {
        setCustomPackages(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load custom packages", err);
    }
  };

  const fetchInventoryPackages = async () => {
    try {
      const res = await LabVendorAPI.getMyLabInventoryPackages();
      if (res && res.success) {
        setInventoryPackages(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load inventory packages", err);
    }
  };

  const fetchMasterPackages = async () => {
    try {
      const fetchFn =
        LabVendorAPI.getAllMasterPackages ||
        LabVendorAPI.getMasterPackages ||
        LabVendorAPI.getAdminPackages;

      if (typeof fetchFn === 'function') {
        const res = await fetchFn();
        if (res && res.success) {
          setMasterPackages(res.data || []);
        }
      }
    } catch (err) {
      console.error("Failed to load master packages", err);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchCustomPackages(),
      fetchInventoryPackages(),
      fetchMasterPackages()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Set of already added master package IDs
  const addedMasterIds = useMemo(() => {
    return new Set(
      inventoryPackages
        .map((pkg) => pkg.masterPackageId?._id || pkg.masterPackageId)
        .filter(Boolean)
    );
  }, [inventoryPackages]);

  // ================= TAB 1: MERGE ALL MY PACKAGES =================
  // Combines vendor custom-created packages + admin packages added to lab inventory
  const mergedMyPackages = useMemo(() => {
    const customList = (customPackages || []).map((pkg) => ({
      ...pkg,
      _source: 'custom',
      displayType: 'Custom Lab Package'
    }));

    const inventoryList = (inventoryPackages || []).map((pkg) => ({
      ...pkg,
      _source: 'inventory',
      displayType: 'Admin Master'
    }));

    // Deduplicate in case any IDs overlap
    const seen = new Set();
    const combined = [];
    for (const item of [...customList, ...inventoryList]) {
      if (!seen.has(item._id)) {
        seen.add(item._id);
        combined.push(item);
      }
    }
    return combined;
  }, [customPackages, inventoryPackages]);

  // Categories extracted dynamically from My Packages
  const dynamicCategories = useMemo(() => {
    if (!mergedMyPackages || mergedMyPackages.length === 0) return ["All"];
    const unique = Array.from(
      new Set(
        mergedMyPackages
          .map((pkg) => pkg.mainCategory?.trim())
          .filter(Boolean)
      )
    );
    return ["All", ...unique];
  }, [mergedMyPackages]);

  // Real-time calculation: offerPrice = mrp - (mrp * discountPercent / 100)
  const calculatedOfferPrice = useMemo(() => {
    const mrp = Number(inventoryForm.mrp) || 0;
    const discount = Number(inventoryForm.discountPercent) || 0;
    if (mrp <= 0) return 0;
    const discountAmount = mrp * (discount / 100);
    return Math.max(0, Math.round(mrp - discountAmount));
  }, [inventoryForm.mrp, inventoryForm.discountPercent]);

  // ================= FILTERED LISTS =================
  // Filtered list for Tab 1 (My Packages)
  const filteredMyPackages = useMemo(() => {
    return mergedMyPackages.filter((pkg) => {
      // Category condition
      const matchesCategory =
        selectedCategory === "All" ||
        pkg.mainCategory?.trim().toLowerCase() === selectedCategory.trim().toLowerCase();

      // Source condition (All vs Custom vs Admin Master)
      const matchesSource =
        selectedSourceType === "All" || pkg._source === selectedSourceType;

      // Search condition
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        pkg.packageName?.toLowerCase().includes(q) ||
        pkg.category?.toLowerCase().includes(q) ||
        pkg.sampleTypes?.some((s) => s.toLowerCase().includes(q));

      return matchesCategory && matchesSource && matchesQuery;
    });
  }, [mergedMyPackages, selectedCategory, selectedSourceType, searchQuery]);

  // Filtered list for Tab 2 (Admin Catalog)
  const filteredAdminCatalog = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return masterPackages;
    return masterPackages.filter((pkg) =>
      pkg.packageName?.toLowerCase().includes(q) ||
      pkg.mainCategory?.toLowerCase().includes(q) ||
      pkg.category?.toLowerCase().includes(q)
    );
  }, [masterPackages, searchQuery]);

  // ================= ACTION HANDLERS =================
  // 1. Add Admin Package to Lab Inventory
  const handleAddMasterSubmit = async (e) => {
    e.preventDefault();
    if (!inventoryForm.mrp || Number(inventoryForm.mrp) <= 0) {
      return toast.error("Please enter a valid MRP greater than 0");
    }

    setActionLoading(true);
    try {
      const payload = {
        masterPackageId: selectedMasterPkg._id,
        mrp: Number(inventoryForm.mrp),
        discountPercent: Number(inventoryForm.discountPercent) || 0,
        reportTime: inventoryForm.reportTime?.trim() || "12 Hours"
      };

      const res = await LabVendorAPI.addMasterPackageToLabInventory(payload);
      if (res && res.success) {
        toast.success(res.message || "Package added to your inventory!");
        setSelectedMasterPkg(null);
        await fetchInventoryPackages();
        setActiveTab('my-packages'); // Switch back to My Packages
      } else {
        toast.error(res?.message || "Failed to add package.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "An error occurred while adding package.");
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Update Admin Package Price & Discount in Lab Inventory
  const handleUpdateInventorySubmit = async (e) => {
    e.preventDefault();
    if (!inventoryForm.mrp || Number(inventoryForm.mrp) <= 0) {
      return toast.error("Please enter a valid MRP greater than 0");
    }

    setActionLoading(true);
    try {
      const payload = {
        id: editingInventoryPkg._id,
        mrp: Number(inventoryForm.mrp),
        discountPercent: Number(inventoryForm.discountPercent) || 0,
        reportTime: inventoryForm.reportTime?.trim() || "12 Hours"
      };

      const res = await LabVendorAPI.updateLabPackagePrice(payload);
      if (res && res.success) {
        toast.success(res.message || "Package pricing updated successfully!");
        setEditingInventoryPkg(null);
        fetchInventoryPackages();
      } else {
        toast.error(res?.message || "Failed to update package.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "An error occurred while updating.");
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Delete / Remove Package (Custom or Admin Inventory)
  const handleDeleteExecute = async () => {
    if (!deleteConfirm.id) return;
    setActionLoading(true);

    try {
      if (deleteConfirm.type === 'custom') {
        const res = await LabVendorAPI.deleteLabPackage(deleteConfirm.id);
        if (res && res.success) {
          toast.success(res.message || "Custom package removed.");
          fetchCustomPackages();
        } else {
          toast.error(res?.message || "Failed to delete package.");
        }
      } else {
        const res = await LabVendorAPI.deleteLabPackageFromInventory(deleteConfirm.id);
        if (res && res.success) {
          toast.success(res.message || "Package removed from inventory.");
          fetchInventoryPackages();
        } else {
          toast.error(res?.message || "Failed to remove package.");
        }
      }
      setDeleteConfirm({ isOpen: false, id: null, name: '', type: 'custom' });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <main className="min-h-screen py-0 px-0 sm:px-6 lg:px-0 antialiased select-none">
      <Toaster position="top-right" />

      {/* --- PAGE HEADER --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <PackageCheck className="text-[#3d3f96]" /> Health Packages
          </h1>
          <p className="text-slate-500 font-semibold text-xs mt-1">
            Manage your full catalog: custom bundles and Admin packages added with your custom rates.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          {activeTab === 'my-packages' ? (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#3d3f96] hover:bg-[#2d2f75] text-white px-5 py-2.5 rounded-xl shadow-sm text-xs font-bold transition-all cursor-pointer"
            >
              <Plus size={14} /> Create Custom Package
            </button>
          ) : (
            <button
              onClick={() => { setActiveTab('my-packages'); setSearchQuery(''); }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#3d3f96] hover:bg-[#2d2f75] text-white px-5 py-2.5 rounded-xl shadow-sm text-xs font-bold transition-all cursor-pointer"
            >
              <CheckCircle2 size={14} /> Back to My Packages
            </button>
          )}
        </div>
      </div>

      {/* --- TWO TABS ONLY --- */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl mb-6 w-full sm:w-fit">
        <button
          onClick={() => { setActiveTab('my-packages'); setSearchQuery(''); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'my-packages'
              ? 'bg-white text-[#3d3f96] shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Boxes size={15} /> My Packages
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-[#3d3f96] font-black">
            {mergedMyPackages.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('admin-catalog'); setSearchQuery(''); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'admin-catalog'
              ? 'bg-white text-[#3d3f96] shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Plus size={15} /> Add from Admin Packages
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-black">
            {masterPackages.length}
          </span>
        </button>
      </div>

      {/* --- SEARCH & FILTER BAR --- */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder={
              activeTab === 'my-packages'
                ? "Search among all your active packages (custom or admin)..."
                : "Search admin master catalog packages..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
          />
        </div>

        {/* Tab 1 Extra Filters (Source Type & Main Category) */}
        {activeTab === 'my-packages' && (
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Package Source Filter */}
            <div className="relative">
              <select
                value={selectedSourceType}
                onChange={(e) => setSelectedSourceType(e.target.value)}
                className="pl-3 pr-8 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all cursor-pointer appearance-none"
              >
                <option value="All">All Types</option>
                <option value="custom">Custom Bundles Only</option>
                <option value="inventory">Admin Master Packages Only</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                ▼
              </div>
            </div>

            {/* Category Dropdown */}
            <div className="relative">
              <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-9 pr-8 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all cursor-pointer appearance-none"
              >
                {dynamicCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "All" ? "All Categories" : cat}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                ▼
              </div>
            </div>
          </div>
        )}

        {/* Reset Filter Button */}
        {(searchQuery || selectedCategory !== "All" || selectedSourceType !== "All") && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
              setSelectedSourceType("All");
            }}
            title="Reset filters"
            className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition-all cursor-pointer flex items-center justify-center shrink-0"
          >
            <RotateCcw size={14} />
          </button>
        )}
      </div>

      {/* ================= CONTENT BODY ================= */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Loading Catalog Data...
          </p>
        </div>
      ) : activeTab === 'my-packages' ? (
        /* ================= TAB 1: ALL MY PACKAGES ================= */
        filteredMyPackages.length > 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[1050px] table-auto align-middle">
                <thead>
                  <tr className="text-[11px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/50 border-b border-slate-100">
                    <th className="text-center px-6 py-4 w-16">S No.</th>
                    <th className="text-left px-6 py-4">Package Profile</th>
                    <th className="text-left px-6 py-4 w-36">Source Type</th>
                    <th className="text-center px-6 py-4 w-32">Tests Included</th>
                    <th className="text-left px-6 py-4 w-44">Price & MRP</th>
                    <th className="text-center px-6 py-4 w-28">Status</th>
                    <th className="text-center px-6 py-4 w-28">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredMyPackages.map((pkg, index) => {
                    const testCount = pkg.totalTestsIncluded || (Array.isArray(pkg.tests) ? pkg.tests.length : 1);
                    const mrp = Number(pkg.mrp || 0);
                    const discount = Number(pkg.discountPercent || 0);
                    const offerPrice =
                      pkg.offerPrice !== undefined
                        ? Number(pkg.offerPrice)
                        : Math.round(mrp - mrp * (discount / 100));

                    const isCustom = pkg._source === 'custom';

                    return (
                      <tr key={pkg._id} className="hover:bg-slate-50/40 transition-colors duration-150">
                        {/* Index */}
                        <td className="px-6 py-4 text-center font-bold text-slate-400 text-xs">
                          {String(index + 1).padStart(2, "0")}
                        </td>

                        {/* Title & Metadata */}
                        <td className="px-6 py-4">
                          <h3 className="font-bold text-slate-800 text-sm tracking-tight leading-snug line-clamp-1">
                            {pkg.packageName}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-semibold">
                            <span>Category: <strong className="text-slate-600">{pkg.mainCategory || pkg.category || "General"}</strong></span>
                            {pkg.reportTime && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Clock size={10} /> {pkg.reportTime}
                                </span>
                              </>
                            )}
                          </div>
                        </td>

                        {/* Source Badge */}
                        <td className="px-6 py-4">
                          {isCustom ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-50 text-[#3d3f96] border border-indigo-100">
                              Custom Bundle
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                              <ShieldCheck size={11} /> Admin Master
                            </span>
                          )}
                        </td>

                        {/* Test Count */}
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50/70 text-[#3d3f96] border border-indigo-100/50 font-black text-xs">
                            <Sparkles size={12} /> {testCount} Tests
                          </span>
                        </td>

                        {/* Price & Discount */}
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

                        {/* Status */}
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center justify-center text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                            pkg.isActive !== false
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : 'bg-red-50 text-red-700 border-red-100'
                          }`}>
                            {pkg.isActive !== false ? "Active" : "Inactive"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Inspect (if custom) */}
                            {isCustom && (
                              <button
                                onClick={() => setSelectedDetailPackage(pkg)}
                                className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60 transition-all cursor-pointer"
                                title="Inspect Details"
                              >
                                <Eye size={13} />
                              </button>
                            )}

                            {/* Edit (Custom bundle modal OR inventory price modal) */}
                            <button
                              onClick={() => {
                                if (isCustom) {
                                  setEditingCustomPackage(pkg);
                                } else {
                                  setEditingInventoryPkg(pkg);
                                  setInventoryForm({
                                    mrp: pkg.mrp || '',
                                    discountPercent: pkg.discountPercent || 0,
                                    reportTime: pkg.reportTime || '12 Hours'
                                  });
                                }
                              }}
                              className="p-1.5 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-[#3d3f96] text-slate-600 border border-slate-200/60 transition-all cursor-pointer"
                              title={isCustom ? "Edit Custom Bundle" : "Edit Selling Price & TAT"}
                            >
                              <Edit3 size={13} />
                            </button>

                            {/* Delete / Remove */}
                            <button
                              onClick={() => setDeleteConfirm({
                                isOpen: true,
                                id: pkg._id,
                                name: pkg.packageName,
                                type: isCustom ? 'custom' : 'inventory'
                              })}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-100/50 transition-all cursor-pointer"
                              title="Delete / Remove Package"
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
              No packages found matching your query.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => { setSearchQuery(""); setSelectedCategory("All"); setSelectedSourceType("All"); }}
                className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all cursor-pointer"
              >
                <RotateCcw size={12} /> Clear Filters
              </button>
              <button
                onClick={() => setActiveTab('admin-catalog')}
                className="inline-flex items-center gap-1.5 bg-[#3d3f96] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#2d2f75] transition-all cursor-pointer"
              >
                <Plus size={12} /> Add from Admin Packages
              </button>
            </div>
          </div>
        )
      ) : (
        /* ================= TAB 2: ADMIN MASTER CATALOG ================= */
        filteredAdminCatalog.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAdminCatalog.map((pkg) => {
              const isAlreadyAdded = addedMasterIds.has(pkg._id);
              const testCount = pkg.totalTestsIncluded || (Array.isArray(pkg.tests) ? pkg.tests.length : 1);

              return (
                <div
                  key={pkg._id}
                  className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-indigo-50 text-[#3d3f96] border border-indigo-100 truncate max-w-[170px]">
                        {pkg.mainCategory || "Admin Bundle"}
                      </span>
                      {isAlreadyAdded ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          <Check size={11} /> In My Packages
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400">Available</span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-extrabold text-slate-800 text-base leading-snug line-clamp-2 mb-2 group-hover:text-[#3d3f96] transition-colors">
                      {pkg.packageName}
                    </h3>

                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-semibold text-slate-400">
                      <span className="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 text-slate-600">
                        <Sparkles size={12} className="text-[#3d3f96]" /> {testCount} Included Tests
                      </span>
                      {pkg.gender && (
                        <span className="bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 text-slate-600">
                          Target: {pkg.gender}
                        </span>
                      )}
                    </div>

                    {/* Admin Suggested Base Reference */}
                    {pkg.mrp && (
                      <div className="mb-4 p-3 bg-slate-50/70 rounded-2xl border border-slate-100 text-xs">
                        <span className="text-slate-400 font-medium block text-[10px] uppercase">
                          Admin Reference MRP
                        </span>
                        <span className="text-slate-800 font-bold text-sm">₹ {pkg.mrp}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-50">
                    {isAlreadyAdded ? (
                      <button
                        onClick={() => {
                          const existing = inventoryPackages.find(
                            (item) => (item.masterPackageId?._id || item.masterPackageId) === pkg._id
                          );
                          if (existing) {
                            setEditingInventoryPkg(existing);
                            setInventoryForm({
                              mrp: existing.mrp || '',
                              discountPercent: existing.discountPercent || 0,
                              reportTime: existing.reportTime || '12 Hours'
                            });
                          }
                        }}
                        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 size={13} /> Update My Selling Rate
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedMasterPkg(pkg);
                          setInventoryForm({
                            mrp: pkg.mrp || '',
                            discountPercent: 10,
                            reportTime: pkg.reportTime || '12 Hours'
                          });
                        }}
                        className="w-full py-2.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Plus size={14} /> Add to My Packages
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-24 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
            <Boxes size={44} className="mx-auto text-slate-200 mb-3" />
            <p className="text-slate-500 font-bold text-sm">No admin packages found.</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#3d3f96] hover:underline"
              >
                <RotateCcw size={12} /> Clear search
              </button>
            )}
          </div>
        )
      )}

      {/* ================= MODAL: ADD ADMIN PACKAGE TO MY PACKAGES ================= */}
      {selectedMasterPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !actionLoading && setSelectedMasterPkg(null)}
          />

          <div className="bg-white rounded-[2rem] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative z-10 animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Boxes className="text-[#3d3f96]" size={20} /> Add to My Packages
            </h2>
            <p className="text-slate-500 text-xs font-semibold mt-1">
              Configure your laboratory's base retail price, patient discount %, and turnaround time.
            </p>

            <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#3d3f96] block mb-0.5">
                Admin Package Name
              </span>
              <p className="text-xs font-bold text-slate-800 line-clamp-1">
                {selectedMasterPkg.packageName}
              </p>
            </div>

            <form onSubmit={handleAddMasterSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1">
                    Your Base MRP (₹) *
                  </label>
                  <div className="relative">
                    <IndianRupee size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      min="1"
                      required
                      value={inventoryForm.mrp}
                      onChange={(e) => setInventoryForm({ ...inventoryForm, mrp: e.target.value })}
                      placeholder="e.g. 2000"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1">
                    Discount Percent (%)
                  </label>
                  <div className="relative">
                    <Percent size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={inventoryForm.discountPercent}
                      onChange={(e) => setInventoryForm({ ...inventoryForm, discountPercent: e.target.value })}
                      placeholder="e.g. 20"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1">
                  Turnaround Time (TAT)
                </label>
                <div className="relative">
                  <Clock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={inventoryForm.reportTime}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, reportTime: e.target.value })}
                    placeholder="e.g. 12 Hours or Same Day"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Offer Price Live Preview */}
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">
                    Calculated Offer Price
                  </span>
                  <span className="text-base font-black text-[#3d3f96]">
                    ₹ {calculatedOfferPrice}
                  </span>
                </div>
                <div className="text-right text-[10px] text-slate-500 font-semibold">
                  Formula:
                  <div className="font-bold text-slate-700">
                    ₹{inventoryForm.mrp || 0} - {inventoryForm.discountPercent || 0}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setSelectedMasterPkg(null)}
                  className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="py-3 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <span>Add to My Packages</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: UPDATE ADMIN INVENTORY PRICING ================= */}
      {editingInventoryPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !actionLoading && setEditingInventoryPkg(null)}
          />

          <div className="bg-white rounded-[2rem] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative z-10 animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Edit3 className="text-[#3d3f96]" size={18} /> Update Pricing & Turnaround
            </h2>
            <p className="text-slate-500 text-xs font-semibold mt-1">
              Modify rates or promotional discounts for {editingInventoryPkg.packageName}.
            </p>

            <form onSubmit={handleUpdateInventorySubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1">
                    Your Base MRP (₹) *
                  </label>
                  <div className="relative">
                    <IndianRupee size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      min="1"
                      required
                      value={inventoryForm.mrp}
                      onChange={(e) => setInventoryForm({ ...inventoryForm, mrp: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1">
                    Discount Percent (%)
                  </label>
                  <div className="relative">
                    <Percent size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={inventoryForm.discountPercent}
                      onChange={(e) => setInventoryForm({ ...inventoryForm, discountPercent: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1">
                  Report Delivery Time (TAT)
                </label>
                <div className="relative">
                  <Clock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={inventoryForm.reportTime}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, reportTime: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">
                    Updated Offer Price
                  </span>
                  <span className="text-base font-black text-[#3d3f96]">
                    ₹ {calculatedOfferPrice}
                  </span>
                </div>
                <div className="text-right text-[10px] text-slate-500 font-semibold">
                  Formula:
                  <div className="font-bold text-slate-700">
                    ₹{inventoryForm.mrp || 0} - {inventoryForm.discountPercent || 0}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setEditingInventoryPkg(null)}
                  className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="py-3 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <span>Update Pricing</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODALS: CUSTOM PACKAGES ================= */}
      <CreateCustomPackageModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          fetchCustomPackages();
        }}
      />

      <EditCustomPackageModal
        isOpen={Boolean(editingCustomPackage)}
        pkgData={editingCustomPackage}
        onClose={() => setEditingCustomPackage(null)}
        onSuccess={() => {
          setEditingCustomPackage(null);
          fetchCustomPackages();
        }}
      />

      <CustomPackageDetailsModal
        pkg={selectedDetailPackage}
        onClose={() => setSelectedDetailPackage(null)}
      />

      {/* ================= UNIFIED DELETE CONFIRMATION MODAL ================= */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !actionLoading && setDeleteConfirm({ isOpen: false, id: null, name: '', type: 'custom' })}
          />

          <div className="bg-white rounded-[2rem] max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative z-10 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 mx-auto">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-base font-black text-slate-900">
              {deleteConfirm.type === 'custom' ? "Delete Custom Package?" : "Remove from My Packages?"}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
              {deleteConfirm.type === 'custom'
                ? `Are you sure you want to delete "${deleteConfirm.name}"? Patients will no longer be able to book this bundle.`
                : `Are you sure you want to unlist "${deleteConfirm.name}"? The Admin master bundle will remain unaffected.`}
            </p>
            <div className="grid grid-cols-2 gap-3 w-full mt-6">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setDeleteConfirm({ isOpen: false, id: null, name: '', type: 'custom' })}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteExecute}
                disabled={actionLoading}
                className="py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                {actionLoading ? <Loader2 size={13} className="animate-spin" /> : <span>Confirm Delete</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}