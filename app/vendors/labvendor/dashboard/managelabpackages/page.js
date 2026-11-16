"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  ShieldCheck,
  Check,
  AlertTriangle,
  PackagePlus,
  ArrowRight
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

// Modals
import CreateCustomPackageModal from "./components/CreateCustomPackageModal";
import AddMasterPackageModal from "./components/AddMasterPackageModal";
import EditPackageModal from "./components/EditPackageModal";
import PackageDetailsModal from "./components/PackageDetailsModal";

// Import your API service functions
import LabVendorAPI from "../../../../services/LabVendorAPI";

export default function LabVendorPackagesPage() {
  // --- 2 TABS: 'my-packages' | 'admin-catalog' ---
  const [activeTab, setActiveTab] = useState("my-packages");

  // --- DATA STATES ---
  const [myPackages, setMyPackages] = useState([]);
  const [adminPackages, setAdminPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // --- SEARCH & FILTERS ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSourceType, setSelectedSourceType] = useState("All"); // 'All' | 'custom' | 'admin'

  // --- MODAL CONTROLS ---
  const [showCreateCustomModal, setShowCreateCustomModal] = useState(false);
  const [selectedMasterForAdd, setSelectedMasterForAdd] = useState(null);
  const [editingPackage, setEditingPackage] = useState(null);
  const [inspectingPackage, setInspectingPackage] = useState(null);

  // --- DELETE CONFIRMATION STATE ---
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    id: null,
    name: "",
    isCustom: false
  });

  // ================= FETCH HANDLERS =================
  const fetchMyPackages = useCallback(async () => {
    try {
      const res = await LabVendorAPI.getMyLabPackages();
      if (res && res.success) {
        setMyPackages(res.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load your packages.");
    }
  }, []);

  const fetchAdminCatalog = useCallback(async () => {
    try {
      const res = await LabVendorAPI.getMasterPackagesCatalog({ isAdminCreated: true });
      if (res && res.success) {
        setAdminPackages(res.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load master packages catalog.");
    }
  }, []);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchMyPackages(), fetchAdminCatalog()]);
    setLoading(false);
  }, [fetchMyPackages, fetchAdminCatalog]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Set of linked Admin Master Package IDs for fast lookup
  const addedMasterPackageIds = useMemo(() => {
    return new Set(
      myPackages
        .filter((pkg) => !pkg.isCustom && pkg.masterPackageId)
        .map((pkg) => (typeof pkg.masterPackageId === "object" ? pkg.masterPackageId._id : pkg.masterPackageId))
    );
  }, [myPackages]);

  // Dynamic Categories from My Packages
  const dynamicCategories = useMemo(() => {
    if (!myPackages || myPackages.length === 0) return ["All"];
    const unique = Array.from(new Set(myPackages.map((p) => p.mainCategory?.trim()).filter(Boolean)));
    return ["All", ...unique];
  }, [myPackages]);

  // ================= FILTERED LISTINGS =================
  const filteredMyPackages = useMemo(() => {
    return myPackages.filter((pkg) => {
      const matchesCategory =
        selectedCategory === "All" ||
        pkg.mainCategory?.trim().toLowerCase() === selectedCategory.trim().toLowerCase();

      const matchesSource =
        selectedSourceType === "All" ||
        (selectedSourceType === "custom" && pkg.isCustom) ||
        (selectedSourceType === "admin" && !pkg.isCustom);

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        pkg.packageName?.toLowerCase().includes(q) ||
        pkg.category?.toLowerCase().includes(q) ||
        pkg.sampleTypes?.some((s) => s.toLowerCase().includes(q));

      return matchesCategory && matchesSource && matchesQuery;
    });
  }, [myPackages, selectedCategory, selectedSourceType, searchQuery]);

  const filteredAdminPackages = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return adminPackages;
    return adminPackages.filter(
      (pkg) =>
        pkg.packageName?.toLowerCase().includes(q) ||
        pkg.mainCategory?.toLowerCase().includes(q) ||
        pkg.category?.toLowerCase().includes(q)
    );
  }, [adminPackages, searchQuery]);

  // ================= DELETE HANDLER =================
  const handleDeleteExecute = async () => {
    if (!deleteConfirm.id) return;
    setActionLoading(true);
    try {
      const res = await LabVendorAPI.deleteLabPackage(deleteConfirm.id);
      if (res && res.success) {
        toast.success(res.message || "Package removed successfully.");
        setDeleteConfirm({ isOpen: false, id: null, name: "", isCustom: false });
        fetchMyPackages();
      } else {
        toast.error(res?.message || "Failed to remove package.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "An error occurred during removal.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <main className="min-h-screen py-2 px-0 sm:px-6 lg:px-0 antialiased select-none">
      <Toaster position="top-right" />

      {/* --- PAGE HEADER --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <PackageCheck className="text-[#3d3f96]" /> Health Packages
          </h1>
          <p className="text-slate-500 font-semibold text-xs mt-1">
            Build your laboratory's custom test bundles or link verified Admin packages with custom pricing.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          {activeTab === "my-packages" ? (
            <button
              onClick={() => setShowCreateCustomModal(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#3d3f96] hover:bg-[#2d2f75] text-white px-5 py-2.5 rounded-xl shadow-sm text-xs font-bold transition-all cursor-pointer"
            >
              <Plus size={14} /> Create Custom Package
            </button>
          ) : (
            <button
              onClick={() => {
                setActiveTab("my-packages");
                setSearchQuery("");
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#3d3f96] hover:bg-[#2d2f75] text-white px-5 py-2.5 rounded-xl shadow-sm text-xs font-bold transition-all cursor-pointer"
            >
              <Boxes size={14} /> Back to My Packages
            </button>
          )}
        </div>
      </div>

      {/* --- TWO TABS ONLY --- */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl mb-6 w-full sm:w-fit">
        <button
          onClick={() => {
            setActiveTab("my-packages");
            setSearchQuery("");
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "my-packages" ? "bg-white text-[#3d3f96] shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Boxes size={15} /> My Lab Packages (Inventory)
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-[#3d3f96] font-black">
            {myPackages.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab("admin-catalog");
            setSearchQuery("");
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "admin-catalog" ? "bg-white text-[#3d3f96] shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Plus size={15} /> Add from Admin Packages
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-black">
            {adminPackages.length}
          </span>
        </button>
      </div>

      {/* --- SEARCH & FILTERS BAR --- */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder={
              activeTab === "my-packages"
                ? "Search your packages by title or specimen..."
                : "Search admin master packages by title or category..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
          />
        </div>

        {/* Tab 1 Extra Filters (Type & Category) */}
        {activeTab === "my-packages" && (
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Source Type Filter */}
            <div className="relative">
              <select
                value={selectedSourceType}
                onChange={(e) => setSelectedSourceType(e.target.value)}
                className="pl-3 pr-8 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all cursor-pointer appearance-none"
              >
                <option value="All">All Types</option>
                <option value="custom">Custom Bundles Only</option>
                <option value="admin">Linked Admin Packages Only</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                ▼
              </div>
            </div>

            {/* Category Filter */}
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

      {/* ================= BODY CONTENT ================= */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Catalog Data...</p>
        </div>
      ) : activeTab === "my-packages" ? (
        /* ================= TAB 1: MY LAB PACKAGES ================= */
        filteredMyPackages.length > 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[1050px] table-auto align-middle">
                <thead>
                  <tr className="text-[11px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/50 border-b border-slate-100">
                    <th className="text-center px-6 py-4 w-16">S No.</th>
                    <th className="text-left px-6 py-4">Package Profile</th>
                    <th className="text-left px-6 py-4 w-36">Type</th>
                    <th className="text-center px-6 py-4 w-32">Included Tests</th>
                    <th className="text-left px-6 py-4 w-44">Offer Price & MRP</th>
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
                            <span>
                              Category:{" "}
                              <strong className="text-slate-600">
                                {pkg.mainCategory || pkg.category || "General"}
                              </strong>
                            </span>
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

                        {/* Type Badge */}
                        <td className="px-6 py-4">
                          {pkg.isCustom ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-50 text-[#3d3f96] border border-indigo-100">
                              Custom Bundle
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                              <ShieldCheck size={11} /> Admin Master
                            </span>
                          )}
                        </td>

                        {/* Tests Count */}
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50/70 text-[#3d3f96] border border-indigo-100/50 font-black text-xs">
                            <Sparkles size={12} /> {testCount} Tests
                          </span>
                        </td>

                        {/* Price */}
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
                          <span
                            className={`inline-flex items-center justify-center text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                              pkg.isActive !== false
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : "bg-red-50 text-red-700 border-red-100"
                            }`}
                          >
                            {pkg.isActive !== false ? "Active" : "Inactive"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setInspectingPackage(pkg)}
                              className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60 transition-all cursor-pointer"
                              title="Inspect Details"
                            >
                              <Eye size={13} />
                            </button>
                            <button
                              onClick={() => setEditingPackage(pkg)}
                              className="p-1.5 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-[#3d3f96] text-slate-600 border border-slate-200/60 transition-all cursor-pointer"
                              title="Edit Price & Details"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirm({
                                  isOpen: true,
                                  id: pkg._id,
                                  name: pkg.packageName,
                                  isCustom: pkg.isCustom
                                })
                              }
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
            <p className="text-slate-500 font-bold px-4">No packages found matching your query.</p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedSourceType("All");
                }}
                className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all cursor-pointer"
              >
                <RotateCcw size={12} /> Clear Filters
              </button>
              <button
                onClick={() => setActiveTab("admin-catalog")}
                className="inline-flex items-center gap-1.5 bg-[#3d3f96] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#2d2f75] transition-all cursor-pointer"
              >
                <Plus size={12} /> Browse Admin Packages
              </button>
            </div>
          </div>
        )
      ) : (
        /* ================= TAB 2: ADMIN MASTER CATALOG ================= */
        filteredAdminPackages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAdminPackages.map((pkg) => {
              const isAlreadyAdded = addedMasterPackageIds.has(pkg._id);
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
                          <Check size={11} /> In Your Lab
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
                      {pkg.reportTime && (
                        <span className="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 text-slate-600">
                          <Clock size={11} /> {pkg.reportTime}
                        </span>
                      )}
                    </div>

                    {/* Benchmark MRP */}
                    {pkg.standardMRP && (
                      <div className="mb-4 p-3 bg-slate-50/70 rounded-2xl border border-slate-100 text-xs flex justify-between items-center">
                        <span className="text-slate-400 font-medium text-[10px] uppercase">Benchmark MRP</span>
                        <span className="text-slate-800 font-extrabold text-sm">₹ {pkg.standardMRP}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-50">
                    {isAlreadyAdded ? (
                      <button
                        onClick={() => {
                          const existing = myPackages.find(
                            (p) =>
                              (typeof p.masterPackageId === "object" ? p.masterPackageId?._id : p.masterPackageId) ===
                              pkg._id
                          );
                          if (existing) setEditingPackage(existing);
                        }}
                        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 size={13} /> Update My Listed Rates
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedMasterForAdd(pkg)}
                        className="w-full py-2.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Plus size={14} /> Add to My Lab
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
            <p className="text-slate-500 font-bold text-sm">No master packages found.</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#3d3f96] hover:underline"
              >
                <RotateCcw size={12} /> Clear search
              </button>
            )}
          </div>
        )
      )}

      {/* ================= MODALS ================= */}

      {/* 1. Create Custom Package Modal */}
      <CreateCustomPackageModal
        isOpen={showCreateCustomModal}
        onClose={() => setShowCreateCustomModal(false)}
        onSuccess={() => {
          setShowCreateCustomModal(false);
          fetchMyPackages();
        }}
      />

      {/* 2. Add Master Package to Inventory Modal */}
      <AddMasterPackageModal
        isOpen={Boolean(selectedMasterForAdd)}
        masterPkg={selectedMasterForAdd}
        onClose={() => setSelectedMasterForAdd(null)}
        onSuccess={() => {
          setSelectedMasterForAdd(null);
          fetchMyPackages();
          setActiveTab("my-packages");
        }}
      />

      {/* 3. Edit Package Modal */}
      <EditPackageModal
        isOpen={Boolean(editingPackage)}
        pkgData={editingPackage}
        onClose={() => setEditingPackage(null)}
        onSuccess={() => {
          setEditingPackage(null);
          fetchMyPackages();
        }}
      />

      {/* 4. Package Inspection Details Modal */}
      <PackageDetailsModal pkg={inspectingPackage} onClose={() => setInspectingPackage(null)} />

      {/* 5. Delete / Remove Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !actionLoading && setDeleteConfirm({ isOpen: false, id: null, name: "", isCustom: false })}
          />

          <div className="bg-white rounded-[2rem] max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative z-10 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 mx-auto">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-base font-black text-slate-900">
              {deleteConfirm.isCustom ? "Delete Custom Package?" : "Remove from Lab Catalog?"}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
              {deleteConfirm.isCustom
                ? `Are you sure you want to permanently delete "${deleteConfirm.name}"? Patients will no longer be able to book this bundle.`
                : `Are you sure you want to unlist "${deleteConfirm.name}"? The Admin master bundle will remain unaffected.`}
            </p>
            <div className="grid grid-cols-2 gap-3 w-full mt-6">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setDeleteConfirm({ isOpen: false, id: null, name: "", isCustom: false })}
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