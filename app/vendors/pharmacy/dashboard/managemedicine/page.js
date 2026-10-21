"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Pill,
  Search,
  Plus,
  RefreshCw,
  Edit3,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  Eye,
  Calendar,
  Layers,
  Package,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
  Check
} from 'lucide-react';

import PharmacyVendorAPI from '../../../../services/PharmacyVendorAPI';

export default function PharmacyInventoryPage() {
  // --- View States ---
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'master_search'
  const [inventoryFilter, setInventoryFilter] = useState('all'); // 'all' | 'otc'

  // --- Inventory State ---
  const [inventoryList, setInventoryList] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [inventorySearchQuery, setInventorySearchQuery] = useState('');

  // --- Master Medicines Search State ---
  const [masterQuery, setMasterQuery] = useState('');
  const [masterList, setMasterList] = useState([]);
  const [masterPagination, setMasterPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [loadingMaster, setLoadingMaster] = useState(false);

  // --- Modals State ---
  const [selectedMasterDetails, setSelectedMasterDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Add Batch Modal
  const [isAddBatchModalOpen, setIsAddBatchModalOpen] = useState(false);
  const [selectedMedicineForBatch, setSelectedMedicineForBatch] = useState(null);
  const [batchFormData, setBatchFormData] = useState({
    batch_number: '',
    vendor_price: '',
    stock_quantity: '',
    expiry_date: ''
  });
  const [submittingBatch, setSubmittingBatch] = useState(false);

  // Edit Stock / Price Modal
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({ vendor_price: '', stock_quantity: '' });
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Confirmation Modal
  const [deletingItem, setDeletingItem] = useState(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // Request New Medicine Modal
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestFormData, setRequestFormData] = useState({
    name: '',
    manufacturers: '',
    salt_composition: '',
    packaging: '',
    mrp: '',
    best_price: '',
    prescription_required: 'No',
    description: '',
    image_url: ''
  });
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Global Notification Banner
  const [message, setMessage] = useState({ type: '', text: '' });

  // Auto-clear notification message after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // =========================================================================
  // 1. FETCH MY INVENTORY (All or OTC)
  // =========================================================================
  const fetchMyInventory = useCallback(async () => {
    try {
      setLoadingInventory(true);
      let res;
      if (inventoryFilter === 'otc') {
        res = await PharmacyVendorAPI.getMyPharmacyOtcInventoryList();
      } else {
        res = await PharmacyVendorAPI.getMyPharmacyInventoryList();
      }

      if (res && res.success) {
        setInventoryList(Array.isArray(res.data) ? res.data : []);
      } else {
        setInventoryList([]);
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to load store inventory.'
      });
    } finally {
      setLoadingInventory(false);
    }
  }, [inventoryFilter]);

  useEffect(() => {
    fetchMyInventory();
  }, [fetchMyInventory]);

  // =========================================================================
  // 2. SEARCH MASTER MEDICINES
  // =========================================================================
  const handleSearchMaster = async (page = 1) => {
    try {
      setLoadingMaster(true);
      const params = {
        query: masterQuery.trim(),
        page,
        limit: masterPagination.limit
      };
      const res = await PharmacyVendorAPI.searchMasterMedicines(params);
      if (res && res.success) {
        setMasterList(Array.isArray(res.data) ? res.data : []);
        setMasterPagination({
          page: res.currentPage || page,
          limit: masterPagination.limit,
          totalPages: res.totalPages || 1,
          total: res.total || 0
        });
      } else {
        setMasterList([]);
      }
    } catch (err) {
      console.error('Error searching master medicines:', err);
      setMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Error searching master medicines.'
      });
    } finally {
      setLoadingMaster(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'master_search' && masterList.length === 0) {
      handleSearchMaster(1);
    }
  }, [activeTab]);

  // =========================================================================
  // 3. GET MASTER MEDICINE FULL DETAILS BY ID
  // =========================================================================
  const handleViewMasterDetails = async (id) => {
    try {
      setLoadingDetails(true);
      const res = await PharmacyVendorAPI.getMasterMedicineDetailsById(id);
      if (res && res.success && res.data) {
        setSelectedMasterDetails(res.data);
      } else {
        setMessage({ type: 'error', text: 'Medicine details not found.' });
      }
    } catch (err) {
      console.error('Error fetching medicine details:', err);
      setMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to load medicine details.'
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  // =========================================================================
  // 4. ADD MEDICINE BATCH TO STORE INVENTORY
  // =========================================================================
  const openAddBatchModal = (medicine) => {
    setSelectedMedicineForBatch(medicine);
    setBatchFormData({
      batch_number: '',
      vendor_price: medicine.mrp ? String(medicine.mrp).replace(/[^0-9.]/g, '') : '',
      stock_quantity: '',
      expiry_date: ''
    });
    setIsAddBatchModalOpen(true);
  };

  const handleAddBatchSubmit = async (e) => {
    e.preventDefault();
    if (!batchFormData.batch_number || !batchFormData.vendor_price || !batchFormData.stock_quantity) {
      setMessage({ type: 'error', text: 'Please fill in Batch Number, Selling Price, and Stock Quantity.' });
      return;
    }

    try {
      setSubmittingBatch(true);
      const payload = {
        medicineId: selectedMedicineForBatch._id,
        batch_number: batchFormData.batch_number.trim(),
        vendor_price: Number(batchFormData.vendor_price),
        stock_quantity: Number(batchFormData.stock_quantity),
        expiry_date: batchFormData.expiry_date || undefined
      };

      const res = await PharmacyVendorAPI.addMedicineToPharmacyInventory(payload);
      if (res && res.success) {
        setMessage({ type: 'success', text: res.message || 'Medicine batch added to your inventory!' });
        setIsAddBatchModalOpen(false);
        fetchMyInventory();
      }
    } catch (err) {
      console.error('Error adding batch:', err);
      setMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to add batch to inventory.'
      });
    } finally {
      setSubmittingBatch(false);
    }
  };

  // =========================================================================
  // 5. UPDATE INVENTORY ITEM (PRICE & STOCK)
  // =========================================================================
  const openEditModal = (item) => {
    setEditingItem(item);
    setEditFormData({
      vendor_price: item.vendor_price ?? '',
      stock_quantity: item.stock_quantity ?? ''
    });
  };

  const handleUpdateItemSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      setSavingEdit(true);
      const payload = {
        vendor_price: Number(editFormData.vendor_price),
        stock_quantity: Number(editFormData.stock_quantity)
      };

      const res = await PharmacyVendorAPI.updatePharmacyInventoryItem(editingItem._id, payload);
      if (res && res.success) {
        setMessage({ type: 'success', text: 'Inventory item updated successfully!' });
        setEditingItem(null);
        fetchMyInventory();
      }
    } catch (err) {
      console.error('Error updating item:', err);
      setMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to update item.'
      });
    } finally {
      setSavingEdit(false);
    }
  };

  // =========================================================================
  // 6. DELETE INVENTORY ITEM
  // =========================================================================
  const handleDeleteItem = async () => {
    if (!deletingItem) return;
    try {
      setConfirmingDelete(true);
      const res = await PharmacyVendorAPI.deletePharmacyInventoryItem(deletingItem._id);
      if (res && res.success) {
        setMessage({ type: 'success', text: res.message || 'Item removed from inventory.' });
        setDeletingItem(null);
        fetchMyInventory();
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      setMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to delete item.'
      });
    } finally {
      setConfirmingDelete(false);
    }
  };

  // =========================================================================
  // 7. REQUEST NEW MEDICINE ADD TO MASTER DATABASE
  // =========================================================================
  const handleRequestMedicineSubmit = async (e) => {
    e.preventDefault();
    if (!requestFormData.name.trim()) {
      setMessage({ type: 'error', text: 'Medicine name is required.' });
      return;
    }

    try {
      setSubmittingRequest(true);
      const imagesArray = requestFormData.image_url
        ? requestFormData.image_url.split(',').map((u) => u.trim()).filter(Boolean)
        : [];

      const payload = {
        name: requestFormData.name.trim(),
        manufacturers: requestFormData.manufacturers.trim() || undefined,
        salt_composition: requestFormData.salt_composition.trim() || undefined,
        packaging: requestFormData.packaging.trim() || undefined,
        mrp: requestFormData.mrp || undefined,
        best_price: requestFormData.best_price || undefined,
        description: requestFormData.description.trim() || undefined,
        prescription_required: requestFormData.prescription_required || 'No',
        image_url: imagesArray.length > 0 ? imagesArray : undefined
      };

      const res = await PharmacyVendorAPI.requestNewMedicineToMaster(payload);
      if (res && res.success) {
        setMessage({
          type: 'success',
          text: res.message || 'New medicine request submitted successfully!'
        });
        setIsRequestModalOpen(false);
        setRequestFormData({
          name: '',
          manufacturers: '',
          salt_composition: '',
          packaging: '',
          mrp: '',
          best_price: '',
          prescription_required: 'No',
          description: '',
          image_url: ''
        });
      }
    } catch (err) {
      console.error('Error submitting request:', err);
      setMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to submit medicine request.'
      });
    } finally {
      setSubmittingRequest(false);
    }
  };

  // Filter local inventory
  const filteredInventory = useMemo(() => {
    if (!inventorySearchQuery.trim()) return inventoryList;
    const q = inventorySearchQuery.toLowerCase();
    return inventoryList.filter((item) => {
      const medName = item?.medicineId?.name?.toLowerCase() || '';
      const salt = item?.medicineId?.salt_composition?.toLowerCase() || '';
      const batch = item?.batch_number?.toLowerCase() || '';
      const mfg = item?.medicineId?.manufacturers?.toLowerCase() || '';
      return medName.includes(q) || salt.includes(q) || batch.includes(q) || mfg.includes(q);
    });
  }, [inventoryList, inventorySearchQuery]);

  // Inventory Summary Metrics
  const stats = useMemo(() => {
    const total = inventoryList.length;
    const inStock = inventoryList.filter((i) => i.is_available && i.stock_quantity > 0).length;
    const outOfStock = inventoryList.filter((i) => !i.is_available || i.stock_quantity <= 0).length;
    const otcCount = inventoryList.filter((i) => i.medicineId?.prescription_required === 'No').length;
    return { total, inStock, outOfStock, otcCount };
  }, [inventoryList]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ================= HEADER SECTION ================= */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#3d3f96] text-white flex items-center justify-center shadow-md shadow-indigo-100 shrink-0">
              <Pill size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Pharmacy Medicine Inventory
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Manage stock batches, retail prices, and Master Medicine records.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <Send size={14} className="text-amber-500" />
              <span>Request New Medicine</span>
            </button>

            <button
              onClick={() => setActiveTab('master_search')}
              className="px-4 py-2.5 rounded-xl bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-200 transition-all active:scale-95"
            >
              <Plus size={15} />
              <span>Add From Master DB</span>
            </button>
          </div>
        </div>

        {/* ================= ALERTS BANNER ================= */}
        {message.text && (
          <div
            className={`p-4 rounded-xl flex items-start justify-between gap-3 text-xs sm:text-sm font-semibold border transition-all ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {message.type === 'success' ? (
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle size={18} className="text-rose-600 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
            <button
              onClick={() => setMessage({ type: '', text: '' })}
              className="p-1 hover:bg-black/5 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* ================= STATS ROW ================= */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Total Batches
            </span>
            <div className="flex items-center justify-between">
              <span className="text-xl sm:text-2xl font-black text-slate-800">{stats.total}</span>
              <Layers size={18} className="text-[#3d3f96]" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">
              In Stock & Active
            </span>
            <div className="flex items-center justify-between">
              <span className="text-xl sm:text-2xl font-black text-emerald-600">{stats.inStock}</span>
              <CheckCircle2 size={18} className="text-emerald-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 block mb-1">
              Out of Stock
            </span>
            <div className="flex items-center justify-between">
              <span className="text-xl sm:text-2xl font-black text-rose-600">{stats.outOfStock}</span>
              <AlertTriangle size={18} className="text-rose-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-1">
              OTC Medicines
            </span>
            <div className="flex items-center justify-between">
              <span className="text-xl sm:text-2xl font-black text-blue-600">{stats.otcCount}</span>
              <ShieldCheck size={18} className="text-blue-500" />
            </div>
          </div>
        </div>

        {/* ================= NAVIGATION TABS ================= */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'inventory'
                  ? 'bg-[#3d3f96] text-white shadow-md shadow-indigo-100'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Store Inventory Table
            </button>
            <button
              onClick={() => setActiveTab('master_search')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'master_search'
                  ? 'bg-[#3d3f96] text-white shadow-md shadow-indigo-100'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Global Master Medicines Search
            </button>
          </div>

          {activeTab === 'inventory' && (
            <button
              onClick={fetchMyInventory}
              disabled={loadingInventory}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
              title="Refresh Inventory"
            >
              <RefreshCw size={16} className={loadingInventory ? 'animate-spin text-[#3d3f96]' : ''} />
            </button>
          )}
        </div>

        {/* ================= TAB 1: STORE INVENTORY TABLE ================= */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            {/* Search & Sub-filters */}
            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter table by brand name, salt, batch..."
                  value={inventorySearchQuery}
                  onChange={(e) => setInventorySearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:border-[#3d3f96] outline-none transition-all"
                />
              </div>

              {/* All vs OTC filter toggle */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setInventoryFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    inventoryFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  All Items ({stats.total})
                </button>
                <button
                  onClick={() => setInventoryFilter('otc')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    inventoryFilter === 'otc'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  OTC Only ({stats.otcCount})
                </button>
              </div>
            </div>

            {/* Inventory Table Container */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {loadingInventory ? (
                <div className="p-12 text-center space-y-3">
                  <RefreshCw size={28} className="animate-spin text-[#3d3f96] mx-auto" />
                  <p className="text-xs font-bold text-slate-500">Loading store inventory table...</p>
                </div>
              ) : filteredInventory.length === 0 ? (
                <div className="p-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-indigo-50 text-[#3d3f96] flex items-center justify-center mx-auto">
                    <Package size={28} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-800">No inventory records found</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      {inventorySearchQuery
                        ? 'No medicines match your filter criteria.'
                        : 'Your store does not have any medicines registered yet.'}
                    </p>
                  </div>
                  {!inventorySearchQuery && (
                    <button
                      onClick={() => setActiveTab('master_search')}
                      className="px-4 py-2.5 bg-[#3d3f96] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#2d2f75] transition-all"
                    >
                      Search & Add from Master
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                        <th className="py-3.5 px-4">Medicine</th>
                        <th className="py-3.5 px-4">Salt Composition</th>
                        <th className="py-3.5 px-4">Batch No.</th>
                        <th className="py-3.5 px-4">Expiry Date</th>
                        <th className="py-3.5 px-4">Store Price</th>
                        <th className="py-3.5 px-4">Stock Units</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                      {filteredInventory.map((item) => {
                        const med = item.medicineId || {};
                        const isAvailable = item.is_available && item.stock_quantity > 0;
                        const thumb = Array.isArray(med.image_url) && med.image_url[0] ? med.image_url[0] : null;

                        return (
                          <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                            {/* Medicine Details */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3 min-w-[200px]">
                                <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                  {thumb ? (
                                    <img src={thumb} alt={med.name} className="w-full h-full object-contain p-0.5" />
                                  ) : (
                                    <Pill size={18} className="text-slate-400" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-slate-900 font-black truncate max-w-[180px] block" title={med.name}>
                                      {med.name || 'Unnamed Medicine'}
                                    </span>
                                    {med.prescription_required === 'No' && (
                                      <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                        OTC
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-medium block truncate max-w-[180px]">
                                    {med.manufacturers || 'General Formulation'}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Salt Composition */}
                            <td className="py-3.5 px-4 max-w-[200px]">
                              <span className="text-slate-600 text-[11px] font-semibold line-clamp-1" title={med.salt_composition}>
                                {med.salt_composition || '—'}
                              </span>
                            </td>

                            {/* Batch No */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="font-mono text-slate-800 text-[11px] bg-slate-100 px-2 py-0.5 rounded-md">
                                {item.batch_number}
                              </span>
                            </td>

                            {/* Expiry Date */}
                            <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 text-[11px]">
                              {formatDate(item.expiry_date)}
                            </td>

                            {/* Price */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="text-slate-900 font-black text-sm">₹{item.vendor_price}</span>
                              {med.mrp && (
                                <span className="text-[10px] text-slate-400 line-through ml-1.5 font-normal">
                                  {med.mrp}
                                </span>
                              )}
                            </td>

                            {/* Stock Units */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span
                                className={`text-sm font-black ${
                                  item.stock_quantity > 0 ? 'text-slate-900' : 'text-rose-600'
                                }`}
                              >
                                {item.stock_quantity}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                                  isAvailable
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}
                              >
                                {isAvailable ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1">
                                {med._id && (
                                  <button
                                    onClick={() => handleViewMasterDetails(med._id)}
                                    className="p-1.5 text-slate-400 hover:text-[#3d3f96] hover:bg-slate-100 rounded-lg transition-colors"
                                    title="View Master Details"
                                  >
                                    <Eye size={15} />
                                  </button>
                                )}

                                <button
                                  onClick={() => openEditModal(item)}
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                                  title="Edit Price & Stock"
                                >
                                  <Edit3 size={13} />
                                  <span>Edit</span>
                                </button>

                                <button
                                  onClick={() => setDeletingItem(item)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Delete Item"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 2: GLOBAL MASTER MEDICINES SEARCH TABLE ================= */}
        {activeTab === 'master_search' && (
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search master database by brand name (e.g. Dolo), salt (Paracetamol), manufacturer..."
                  value={masterQuery}
                  onChange={(e) => setMasterQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchMaster(1)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:border-[#3d3f96] outline-none transition-all"
                />
              </div>

              <button
                onClick={() => handleSearchMaster(1)}
                disabled={loadingMaster}
                className="px-6 py-2.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loadingMaster ? <RefreshCw size={15} className="animate-spin" /> : <Search size={15} />}
                <span>Search Master</span>
              </button>
            </div>

            {/* Master Table Container */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {loadingMaster ? (
                <div className="p-12 text-center space-y-3">
                  <RefreshCw size={28} className="animate-spin text-[#3d3f96] mx-auto" />
                  <p className="text-xs font-bold text-slate-500">Searching global master database...</p>
                </div>
              ) : masterList.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <AlertCircle size={28} className="text-amber-500 mx-auto" />
                  <h3 className="text-base font-black text-slate-800">No master medicines found</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Can't find the medicine in the master database? Submit a request to add it.
                  </p>
                  <button
                    onClick={() => setIsRequestModalOpen(true)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md transition-all inline-flex items-center gap-1.5"
                  >
                    <Send size={13} /> Request New Medicine
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 p-4 border-b border-slate-100">
                    <span>Found {masterPagination.total} master medicines</span>
                    <span>Page {masterPagination.page} of {masterPagination.totalPages}</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                          <th className="py-3.5 px-4">Medicine</th>
                          <th className="py-3.5 px-4">Manufacturer</th>
                          <th className="py-3.5 px-4">Salt Composition</th>
                          <th className="py-3.5 px-4">Packaging</th>
                          <th className="py-3.5 px-4">MRP</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                        {masterList.map((med) => {
                          const thumb = Array.isArray(med.image_url) && med.image_url[0] ? med.image_url[0] : null;

                          return (
                            <tr key={med._id} className="hover:bg-slate-50/80 transition-colors">
                              {/* Medicine Name & Thumb */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3 min-w-[200px]">
                                  <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                    {thumb ? (
                                      <img src={thumb} alt={med.name} className="w-full h-full object-contain p-0.5" />
                                    ) : (
                                      <Pill size={18} className="text-slate-400" />
                                    )}
                                  </div>
                                  <span className="text-slate-900 font-black truncate max-w-[200px] block" title={med.name}>
                                    {med.name}
                                  </span>
                                </div>
                              </td>

                              {/* Manufacturer */}
                              <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                                {med.manufacturers || 'N/A'}
                              </td>

                              {/* Salt Composition */}
                              <td className="py-3.5 px-4 max-w-[220px]">
                                <span className="text-slate-600 text-[11px] font-semibold line-clamp-1" title={med.salt_composition}>
                                  {med.salt_composition || '—'}
                                </span>
                              </td>

                              {/* Packaging */}
                              <td className="py-3.5 px-4 text-slate-600 text-[11px] whitespace-nowrap">
                                {med.packaging || '—'}
                              </td>

                              {/* MRP */}
                              <td className="py-3.5 px-4 whitespace-nowrap font-black text-slate-900">
                                {med.mrp || 'N/A'}
                              </td>

                              {/* Actions */}
                              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                <div className="inline-flex items-center gap-2">
                                  <button
                                    onClick={() => handleViewMasterDetails(med._id)}
                                    className="px-2.5 py-1.5 text-slate-600 hover:text-[#3d3f96] text-xs font-bold hover:bg-slate-100 rounded-lg transition-colors inline-flex items-center gap-1"
                                  >
                                    <Eye size={14} /> Full Info
                                  </button>

                                  <button
                                    onClick={() => openAddBatchModal(med)}
                                    className="px-3 py-1.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-sm transition-all"
                                  >
                                    <Plus size={14} /> Add to Store
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
                  {masterPagination.totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-500">
                        Page {masterPagination.page} of {masterPagination.totalPages}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSearchMaster(masterPagination.page - 1)}
                          disabled={masterPagination.page <= 1 || loadingMaster}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          onClick={() => handleSearchMaster(masterPagination.page + 1)}
                          disabled={masterPagination.page >= masterPagination.totalPages || loadingMaster}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ========================================================= */}
      {/* MODAL 1: ADD BATCH TO PHARMACY STORE                      */}
      {/* ========================================================= */}
      {isAddBatchModalOpen && selectedMedicineForBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsAddBatchModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#3d3f96] flex items-center justify-center shrink-0">
                <Package size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Add Stock Batch</h3>
                <p className="text-xs text-slate-400 font-bold truncate max-w-[260px]">
                  {selectedMedicineForBatch.name}
                </p>
              </div>
            </div>

            <form onSubmit={handleAddBatchSubmit} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Batch Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DL-2026-A1"
                  value={batchFormData.batch_number}
                  onChange={(e) => setBatchFormData({ ...batchFormData, batch_number: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                    Store Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="e.g. 30.00"
                    value={batchFormData.vendor_price}
                    onChange={(e) => setBatchFormData({ ...batchFormData, vendor_price: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96]"
                  />
                  {selectedMedicineForBatch.mrp && (
                    <span className="text-[9px] text-slate-400 mt-1 block">
                      MRP: {selectedMedicineForBatch.mrp}
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                    Stock Quantity <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 100"
                    value={batchFormData.stock_quantity}
                    onChange={(e) => setBatchFormData({ ...batchFormData, stock_quantity: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Batch Expiry Date
                </label>
                <input
                  type="date"
                  value={batchFormData.expiry_date}
                  onChange={(e) => setBatchFormData({ ...batchFormData, expiry_date: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddBatchModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBatch}
                  className="flex-1 py-2.5 rounded-xl bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-xs font-bold shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {submittingBatch ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                  <span>Confirm Add</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: EDIT INVENTORY ITEM (PRICE & STOCK)              */}
      {/* ========================================================= */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setEditingItem(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Edit3 size={18} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Update Stock & Price</h3>
                <p className="text-xs text-slate-400 font-bold truncate max-w-[220px]">
                  Batch: {editingItem.batch_number}
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateItemSubmit} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Updated Price (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={editFormData.vendor_price}
                  onChange={(e) => setEditFormData({ ...editFormData, vendor_price: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96]"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Available Stock Units
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editFormData.stock_quantity}
                  onChange={(e) => setEditFormData({ ...editFormData, stock_quantity: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96]"
                />
                <p className="text-[9px] text-slate-400 mt-1">
                  Setting stock to 0 automatically marks this batch as Out of Stock.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex-1 py-2.5 rounded-xl bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-xs font-bold shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {savingEdit ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: MASTER MEDICINE FULL DETAILS VIEW                */}
      {/* ========================================================= */}
      {selectedMasterDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative max-h-[85vh] overflow-y-auto space-y-4">
            <button
              onClick={() => setSelectedMasterDetails(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#3d3f96] flex items-center justify-center shrink-0">
                <Pill size={24} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  {selectedMasterDetails.name}
                </h3>
                <p className="text-xs text-slate-400 font-bold truncate">
                  {selectedMasterDetails.manufacturers || 'Manufacturer Unknown'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-bold">
              <div className="bg-slate-50 p-2.5 rounded-xl">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-black">MRP</span>
                <span className="text-slate-800 text-sm font-black">{selectedMasterDetails.mrp || 'N/A'}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-black">Best Price</span>
                <span className="text-slate-800 text-sm font-black">{selectedMasterDetails.best_price || 'N/A'}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-black">Prescription</span>
                <span
                  className={`text-xs font-black ${
                    selectedMasterDetails.prescription_required === 'Yes' ? 'text-amber-600' : 'text-emerald-600'
                  }`}
                >
                  {selectedMasterDetails.prescription_required || 'No'}
                </span>
              </div>
            </div>

            {selectedMasterDetails.salt_composition && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                  Salt Composition
                </span>
                <p className="text-xs font-bold text-slate-700">{selectedMasterDetails.salt_composition}</p>
              </div>
            )}

            {selectedMasterDetails.primary_use && (
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                  Primary Use
                </span>
                <p className="text-xs text-slate-700 font-medium">{selectedMasterDetails.primary_use}</p>
              </div>
            )}

            {selectedMasterDetails.description && (
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                  Overview
                </span>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {selectedMasterDetails.description}
                </p>
              </div>
            )}

            {selectedMasterDetails.how_to_use && (
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                  How To Use
                </span>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">{selectedMasterDetails.how_to_use}</p>
              </div>
            )}

            {selectedMasterDetails.side_effect && (
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                  Side Effects
                </span>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">{selectedMasterDetails.side_effect}</p>
              </div>
            )}

            {selectedMasterDetails.storage && (
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <span className="text-slate-400">Storage:</span> {selectedMasterDetails.storage}
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={() => {
                  const med = selectedMasterDetails;
                  setSelectedMasterDetails(null);
                  openAddBatchModal(med);
                }}
                className="w-full py-2.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-1.5"
              >
                <Plus size={15} /> Add This Medicine to Store
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: DELETE CONFIRMATION                              */}
      {/* ========================================================= */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 size={22} />
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">Remove from Store?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete batch <strong className="text-slate-800">{deletingItem.batch_number}</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={confirmingDelete}
                onClick={handleDeleteItem}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-1"
              >
                {confirmingDelete ? <RefreshCw size={13} className="animate-spin" /> : <Trash2 size={13} />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: REQUEST NEW MEDICINE TO MASTER DATABASE          */}
      {/* ========================================================= */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
            <button
              onClick={() => setIsRequestModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Send size={18} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Request New Medicine</h3>
                <p className="text-xs text-slate-400 font-bold">Submit a medicine to be added to the Global Master list</p>
              </div>
            </div>

            <form onSubmit={handleRequestMedicineSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Medicine Trade Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Crocin 650 Advance Tablet"
                  value={requestFormData.name}
                  onChange={(e) => setRequestFormData({ ...requestFormData, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. GlaxoSmithKline"
                    value={requestFormData.manufacturers}
                    onChange={(e) => setRequestFormData({ ...requestFormData, manufacturers: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                    Packaging
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. strip of 15 tablets"
                    value={requestFormData.packaging}
                    onChange={(e) => setRequestFormData({ ...requestFormData, packaging: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Salt / Chemical Composition
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paracetamol (650mg)"
                  value={requestFormData.salt_composition}
                  onChange={(e) => setRequestFormData({ ...requestFormData, salt_composition: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                    MRP (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="35.00"
                    value={requestFormData.mrp}
                    onChange={(e) => setRequestFormData({ ...requestFormData, mrp: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                    Best Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="31.50"
                    value={requestFormData.best_price}
                    onChange={(e) => setRequestFormData({ ...requestFormData, best_price: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                    Rx Required
                  </label>
                  <select
                    value={requestFormData.prescription_required}
                    onChange={(e) => setRequestFormData({ ...requestFormData, prescription_required: e.target.value })}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96]"
                  >
                    <option value="No">No (OTC)</option>
                    <option value="Yes">Yes (Rx)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Description / Primary Use
                </label>
                <textarea
                  rows={2}
                  placeholder="Relieves fever, pain, and headache..."
                  value={requestFormData.description}
                  onChange={(e) => setRequestFormData({ ...requestFormData, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96]"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Image URL(s) <span className="text-[9px] text-slate-400 font-normal">(Optional, comma separated)</span>
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/crocin.jpg"
                  value={requestFormData.image_url}
                  onChange={(e) => setRequestFormData({ ...requestFormData, image_url: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRequest}
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {submittingRequest ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                  <span>Submit Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}