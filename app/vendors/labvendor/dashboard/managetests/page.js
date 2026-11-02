"use client";
import React, { useState, useEffect } from 'react';
import {
  Search,
  FlaskConical,
  Plus,
  Trash2,
  Edit3,
  Eye,
  Loader2,
  TestTube2,
  Clock,
  Tag,
  AlertTriangle,
  Layers,
  Activity,
  Home,
  Building2,
  Sparkles
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

import AddMasterTestModal from './components/AddMasterTestModal';
import EditVendorTestModal from './components/EditVendorTestModal';
import VendorTestDetailsModal from './components/VendorTestDetailsModal';

// Import your API service functions
import LabVendorAPI from '../../../../services/LabVendorAPI';

export default function LabVendorInventoryPage() {
  // --- Data Listings ---
  const [myTests, setMyTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // --- Filters ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // --- Modals State ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDetailTest, setSelectedDetailTest] = useState(null);
  const [editingTest, setEditingTest] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // --- Fetch Lab's Active Inventory ---
  const fetchMyInventory = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory !== "All") {
        params.mainCategory = selectedCategory;
      }

      const response = await LabVendorAPI.getMyLabTests(params);
      if (response && response.success) {
        setMyTests(response.data || []);
      } else {
        toast.error(response?.message || "Failed to load laboratory inventory.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Could not retrieve your active test list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyInventory();
  }, [selectedCategory]);

  // Client-side instant filter by test name or specimen
  const filteredTests = myTests.filter((test) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      test.testName?.toLowerCase().includes(q) ||
      test.sampleType?.toLowerCase().includes(q) ||
      test.mainCategory?.toLowerCase().includes(q)
    );
  });

  // --- Execute Test Removal from Inventory ---
  const handleDeleteExecute = async () => {
    if (!deleteConfirmId) return;
    setActionLoading(true);
    try {
      const response = await LabVendorAPI.deleteLabTest(deleteConfirmId);
      if (response && response.success) {
        toast.success(response.message || "Test removed from your active catalog.");
        setDeleteConfirmId(null);
        fetchMyInventory();
      } else {
        toast.error(response?.message || "Failed to remove test.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "An error occurred while deleting the test.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuccessCallback = () => {
    setShowAddModal(false);
    setEditingTest(null);
    fetchMyInventory();
  };

  return (
    <main className="min-h-screen py-0 px-0 sm:px-6 lg:px-0 antialiased select-none">
      <Toaster position="top-right" />

      {/* --- PAGE HEADER --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <FlaskConical className="text-[#3d3f96]" /> My Laboratory Tests
          </h1>
          <p className="text-slate-500 font-semibold text-xs mt-1">
            Configure custom pricing, turnaround times (TAT), and service modes for tests imported from the platform catalog.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#3d3f96] hover:bg-[#2d2f75] text-white px-5 py-2.5 rounded-xl shadow-sm text-xs font-bold transition-all cursor-pointer"
          >
            <Plus size={14} /> Add Test from Platform Catalog
          </button>
        </div>
      </div>

      {/* --- SEARCH & CATEGORY FILTER BAR --- */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search your inventory by test name, specimen (e.g. Blood, Urine)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
          />
        </div>

        {/* Classification Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100/70 p-1 rounded-2xl self-stretch md:self-auto">
          {["All", "Pathology", "Radiology"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedCategory === cat
                  ? "bg-white text-[#3d3f96] shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* --- INVENTORY DATA TABLE --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Your Diagnostic Inventory...</p>
        </div>
      ) : filteredTests.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1050px] table-auto align-middle">
              <thead>
                <tr className="text-[11px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/50 border-b border-slate-100">
                  <th className="text-center px-6 py-4 w-16">S No.</th>
                  <th className="text-left px-6 py-4">Test Profile</th>
                  <th className="text-left px-6 py-4 w-32">Classification</th>
                  <th className="text-left px-6 py-4 w-32">Specimen</th>
                  <th className="text-left px-6 py-4 w-44">Pricing & Discount</th>
                  <th className="text-center px-6 py-4 w-28">Turnaround</th>
                  <th className="text-center px-6 py-4 w-36">Service Mode</th>
                  <th className="text-center px-6 py-4 w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTests.map((test, index) => {
                  const amount = Number(test.amount || 0);
                  const discount = Number(test.discountPercent || 0);
                  const finalPrice = test.discountPrice !== undefined
                    ? Number(test.discountPrice)
                    : Math.round(amount - (amount * (discount / 100)));

                  return (
                    <tr key={test._id} className="hover:bg-slate-50/40 transition-colors duration-150">

                      {/* S No. */}
                      <td className="px-6 py-4 text-center font-bold text-slate-400 text-xs">
                        {String(index + 1).padStart(2, "0")}
                      </td>

                      {/* Test Name & Code */}
                      <td className="px-6 py-4">
                        <h3 className="font-bold text-slate-800 tracking-tight leading-tight max-w-[260px] truncate" title={test.testName}>
                          {test.testName}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-semibold mt-1">
                          Master ID: <span className="font-mono text-slate-500">{typeof test.masterTestId === 'object' ? test.masterTestId?._id : test.masterTestId}</span>
                        </p>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-700 block">{test.mainCategory || "Pathology"}</span>
                      </td>

                      {/* Specimen */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700">
                          <TestTube2 size={13} className="text-rose-500" />
                          {test.sampleType || "Blood"}
                        </span>
                      </td>

                      {/* Custom Pricing */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-extrabold text-slate-900">₹ {finalPrice}</span>
                            {discount > 0 && (
                              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">
                                {discount}% OFF
                              </span>
                            )}
                          </div>
                          {discount > 0 && (
                            <span className="text-[10px] text-slate-400 font-semibold line-through">
                              MRP: ₹ {amount}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Turnaround Time (TAT) */}
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                          <Clock size={11} className="text-slate-400" /> {test.reportTime || "24 Hours"}
                        </span>
                      </td>

                      {/* Service Mode */}
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${test.testType === 'Home Collection'
                            ? 'bg-amber-50 text-amber-700 border-amber-100'
                            : test.testType === 'Walk-In'
                              ? 'bg-blue-50 text-blue-700 border-blue-100'
                              : 'bg-indigo-50 text-[#3d3f96] border-indigo-100'
                          }`}>
                          {test.testType === 'Home Collection' && <Home size={10} />}
                          {test.testType === 'Walk-In' && <Building2 size={10} />}
                          {test.testType || "Both"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedDetailTest(test)}
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60 transition-all cursor-pointer"
                            title="Inspect Test Profile"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => setEditingTest(test)}
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-[#3d3f96] text-slate-600 border border-slate-200/60 transition-all cursor-pointer"
                            title="Edit Pricing & TAT"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(test._id)}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-100/50 transition-all cursor-pointer"
                            title="Remove from My Lab Inventory"
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
          <FlaskConical size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-500 font-bold px-4">Your diagnostic inventory is currently empty.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 inline-flex items-center gap-2 bg-[#3d3f96] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#2d2f75] transition-all cursor-pointer"
          >
            <Plus size={14} /> Add Test from Catalog
          </button>
        </div>
      )}

      {/* --- MODALS --- */}

      {/* Step 1 & 2: Browse Master Tests & Add Custom Pricing */}
      <AddMasterTestModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleSuccessCallback}
      />

      {/* Step 5: Edit Custom Pricing & TAT */}
      <EditVendorTestModal
        isOpen={Boolean(editingTest)}
        testData={editingTest}
        onClose={() => setEditingTest(null)}
        onSuccess={handleSuccessCallback}
      />

      {/* Step 4: Detail Inspect View */}
      <VendorTestDetailsModal
        test={selectedDetailTest}
        onClose={() => setSelectedDetailTest(null)}
      />

      {/* Step 6: Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />

          <div className="bg-white rounded-[2rem] max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative z-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 mx-auto">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-base font-black text-slate-900">Remove From Inventory</h3>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
              Are you sure you want to remove this test from your lab's active services? Patients will no longer be able to book this test at your center.
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
                  <span>Remove Test</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}