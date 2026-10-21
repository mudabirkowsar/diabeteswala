"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Pill, Search, Edit3, Trash2, Eye, RefreshCw,
  Package, AlertTriangle, Check, X, ShieldCheck, RotateCcw
} from 'lucide-react';
import PharmacyVendorAPI from '../../../../../services/PharmacyVendorAPI';

export default function PharmacyInventory({ onShowMasterDetails, onNotify, hsnList = [] }) {
  const [inventoryList, setInventoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inventoryFilter, setInventoryFilter] = useState('all'); // 'all' | 'otc'
  const [searchQuery, setSearchQuery] = useState('');

  // Edit Modal State
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    vendor_price: '',
    stock_quantity: '',
    mrp: '',
    batch_number: '',
    expiry_date: '',
    manufacturing_date: '',
    hsn_number: '',
    isReturnAllowed: false,
    isReplacementAllowed: false
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Modal State
  const [deletingItem, setDeletingItem] = useState(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const res = inventoryFilter === 'otc'
        ? await PharmacyVendorAPI.getMyPharmacyOtcInventoryList()
        : await PharmacyVendorAPI.getMyPharmacyInventoryList();

      if (res && res.success) {
        setInventoryList(Array.isArray(res.data) ? res.data : []);
      } else {
        setInventoryList([]);
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
      onNotify?.('error', err?.response?.data?.message || 'Failed to load store inventory.');
    } finally {
      setLoading(false);
    }
  }, [inventoryFilter, onNotify]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const openEditModal = (item) => {
    setEditingItem(item);
    setEditFormData({
      vendor_price: item.vendor_price ?? '',
      stock_quantity: item.stock_quantity ?? '',
      mrp: item.mrp ?? '',
      batch_number: item.batch_number ?? '',
      expiry_date: item.expiry_date ? item.expiry_date.split('T')[0] : '',
      manufacturing_date: item.manufacturing_date ? item.manufacturing_date.split('T')[0] : '',
      hsn_number: item.hsn_number ?? '',
      isReturnAllowed: Boolean(item.isReturnAllowed),
      isReplacementAllowed: Boolean(item.isReplacementAllowed)
    });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      setSavingEdit(true);
      const payload = {
        vendor_price: Number(editFormData.vendor_price),
        stock_quantity: Number(editFormData.stock_quantity),
        mrp: Number(editFormData.mrp),
        batch_number: editFormData.batch_number,
        expiry_date: editFormData.expiry_date || undefined,
        manufacturing_date: editFormData.manufacturing_date || undefined,
        hsn_number: editFormData.hsn_number || undefined,
        isReturnAllowed: editFormData.isReturnAllowed,
        isReplacementAllowed: editFormData.isReplacementAllowed
      };

      const res = await PharmacyVendorAPI.updatePharmacyInventoryItem(editingItem._id, payload);
      if (res && res.success) {
        onNotify?.('success', 'Batch updated successfully!');
        setEditingItem(null);
        fetchInventory();
      }
    } catch (err) {
      console.error('Update error:', err);
      onNotify?.('error', err?.response?.data?.message || 'Failed to update item.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deletingItem) return;
    try {
      setConfirmingDelete(true);
      const res = await PharmacyVendorAPI.deletePharmacyInventoryItem(deletingItem._id);
      if (res && res.success) {
        onNotify?.('success', res.message || 'Item removed from inventory.');
        setDeletingItem(null);
        fetchInventory();
      }
    } catch (err) {
      console.error('Delete error:', err);
      onNotify?.('error', err?.response?.data?.message || 'Failed to delete item.');
    } finally {
      setConfirmingDelete(false);
    }
  };

  const filteredInventory = useMemo(() => {
    if (!searchQuery.trim()) return inventoryList;
    const q = searchQuery.toLowerCase();
    return inventoryList.filter((item) => {
      const medName = item?.medicineId?.name?.toLowerCase() || '';
      const salt = item?.medicineId?.salt_composition?.toLowerCase() || '';
      const batch = item?.batch_number?.toLowerCase() || '';
      const hsn = item?.hsn_number?.toLowerCase() || '';
      return medName.includes(q) || salt.includes(q) || batch.includes(q) || hsn.includes(q);
    });
  }, [inventoryList, searchQuery]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const selectedEditHsnDetails = hsnList.find((h) => h.hsnCode === editFormData.hsn_number);

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by brand name, salt, batch, HSN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:border-[#3d3f96] outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setInventoryFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                inventoryFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Items ({inventoryList.length})
            </button>
            <button
              onClick={() => setInventoryFilter('otc')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                inventoryFilter === 'otc' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              OTC Only
            </button>
          </div>

          <button
            onClick={fetchInventory}
            disabled={loading}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-[#3d3f96]' : ''} />
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw size={28} className="animate-spin text-[#3d3f96] mx-auto" />
            <p className="text-xs font-bold text-slate-500">Loading store inventory table...</p>
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package size={32} className="mx-auto text-slate-300" />
            <h3 className="text-base font-black text-slate-800">No inventory batches found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery ? 'No batches match your search.' : 'Add your first batch from the Global Master Catalog tab.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Medicine</th>
                  <th className="py-3.5 px-4">Batch / HSN</th>
                  <th className="py-3.5 px-4">Dates</th>
                  <th className="py-3.5 px-4">Pricing</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Return / Replace</th>
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
                      {/* Medicine Info */}
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
                            <span className="text-slate-900 font-black truncate max-w-[180px] block" title={med.name}>
                              {med.name || 'Unnamed Medicine'}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate max-w-[180px]">
                              {med.manufacturers || 'General'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Batch & HSN */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono text-slate-800 text-[11px] bg-slate-100 px-2 py-0.5 rounded-md block w-fit">
                          {item.batch_number}
                        </span>
                        {item.hsn_number && (
                          <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">
                            HSN: {item.hsn_number}
                          </span>
                        )}
                      </td>

                      {/* Dates */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-[11px]">
                        <div><span className="text-slate-400">Exp:</span> {formatDate(item.expiry_date)}</div>
                        {item.manufacturing_date && (
                          <div className="text-[10px] text-slate-400">Mfg: {formatDate(item.manufacturing_date)}</div>
                        )}
                      </td>

                      {/* Pricing */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-slate-900 font-black text-sm">₹{item.vendor_price}</span>
                        <div className="text-[10px] text-slate-400">
                          Batch MRP: ₹{item.mrp ?? med.mrp ?? '—'}
                        </div>
                      </td>

                      {/* Stock Units & Availability */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`text-sm font-black ${isAvailable ? 'text-slate-900' : 'text-rose-600'}`}>
                          {item.stock_quantity}
                        </span>
                        <span className={`block text-[9px] font-black uppercase ${isAvailable ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isAvailable ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>

                      {/* Return / Replace Policies */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                            item.isReturnAllowed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400'
                          }`}>
                            Return: {item.isReturnAllowed ? 'Yes' : 'No'}
                          </span>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                            item.isReplacementAllowed ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-400'
                          }`}>
                            Replace: {item.isReplacementAllowed ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          {med._id && (
                            <button
                              onClick={() => onShowMasterDetails?.(med._id)}
                              className="p-1.5 text-slate-400 hover:text-[#3d3f96] hover:bg-slate-100 rounded-lg transition-colors"
                              title="Master Catalog Info"
                            >
                              <Eye size={15} />
                            </button>
                          )}
                          <button
                            onClick={() => openEditModal(item)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                          >
                            <Edit3 size={13} /> Edit
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

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingItem(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-black text-slate-900">Update Batch Details</h3>

            <form onSubmit={handleUpdateSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Store Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editFormData.vendor_price}
                    onChange={(e) => setEditFormData({ ...editFormData, vendor_price: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Stock Units</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editFormData.stock_quantity}
                    onChange={(e) => setEditFormData({ ...editFormData, stock_quantity: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Batch MRP (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.mrp}
                    onChange={(e) => setEditFormData({ ...editFormData, mrp: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={editFormData.batch_number}
                    onChange={(e) => setEditFormData({ ...editFormData, batch_number: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={editFormData.expiry_date}
                    onChange={(e) => setEditFormData({ ...editFormData, expiry_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Mfg Date</label>
                  <input
                    type="date"
                    value={editFormData.manufacturing_date}
                    onChange={(e) => setEditFormData({ ...editFormData, manufacturing_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                  />
                </div>
              </div>

              {/* HSN CODE DROPDOWN */}
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                  Active GST HSN Code
                </label>
                <select
                  value={editFormData.hsn_number}
                  onChange={(e) => setEditFormData({ ...editFormData, hsn_number: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96]"
                >
                  <option value="">-- Select Active HSN Code --</option>
                  {hsnList.map((hsn) => (
                    <option key={hsn._id || hsn.hsnCode} value={hsn.hsnCode}>
                      {hsn.hsnCode} ({hsn.totalGstPercent}% GST) - {hsn.description?.slice(0, 38)}...
                    </option>
                  ))}
                </select>

                {selectedEditHsnDetails && (
                  <div className="mt-1 p-2 bg-blue-50 border border-blue-100 rounded-lg text-[10px] text-blue-900 font-medium">
                    <span className="font-bold">GST Slab:</span> {selectedEditHsnDetails.totalGstPercent}% |{' '}
                    <span className="font-bold">Commodity:</span> {selectedEditHsnDetails.description}
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editFormData.isReturnAllowed}
                    onChange={(e) => setEditFormData({ ...editFormData, isReturnAllowed: e.target.checked })}
                    className="w-4 h-4 rounded text-[#3d3f96]"
                  />
                  <span>Allow Return</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editFormData.isReplacementAllowed}
                    onChange={(e) => setEditFormData({ ...editFormData, isReplacementAllowed: e.target.checked })}
                    className="w-4 h-4 rounded text-[#3d3f96]"
                  />
                  <span>Allow Replace</span>
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex-1 py-2.5 rounded-xl bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {savingEdit ? 'Saving...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 size={22} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Delete Batch?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Batch <strong>{deletingItem.batch_number}</strong> and all linked promotional combo offers will be permanently removed.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={confirmingDelete}
                onClick={handleDeleteSubmit}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md disabled:opacity-50"
              >
                {confirmingDelete ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}