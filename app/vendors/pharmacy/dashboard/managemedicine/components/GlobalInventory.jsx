"use client";

import React, { useState, useEffect } from 'react';
import {
  Pill, Search, Plus, Eye, RefreshCw, ChevronLeft, ChevronRight,
  TrendingUp, Check, X, ShieldCheck
} from 'lucide-react';
import PharmacyVendorAPI from '../../../../../services/PharmacyVendorAPI';

export default function GlobalInventory({ onShowDetails, onNotify, hsnList = [], onRequestHsnTab }) {
  const [query, setQuery] = useState('');
  const [masterList, setMasterList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });

  // Add Batch Modal
  const [selectedMedForBatch, setSelectedMedForBatch] = useState(null);
  const [batchData, setBatchData] = useState({
    batch_number: '',
    mrp: '',
    vendor_price: '',
    stock_quantity: '',
    expiry_date: '',
    manufacturing_date: '',
    hsn_number: '',
    packaging: '',
    isReturnAllowed: true,
    isReplacementAllowed: true
  });
  const [submittingBatch, setSubmittingBatch] = useState(false);

  // Request MRP Increase Modal
  const [mrpRequestMed, setMrpRequestMed] = useState(null);
  const [proposedMrp, setProposedMrp] = useState('');
  const [mrpReason, setMrpReason] = useState('');
  const [submittingMrpRequest, setSubmittingMrpRequest] = useState(false);

  const fetchMasterMedicines = async (page = 1) => {
    try {
      setLoading(true);
      const res = await PharmacyVendorAPI.searchMasterMedicines({
        query: query.trim(),
        page,
        limit: pagination.limit
      });

      if (res && res.success) {
        setMasterList(Array.isArray(res.data) ? res.data : []);
        setPagination({
          page: res.currentPage || page,
          limit: pagination.limit,
          totalPages: res.totalPages || 1,
          total: res.total || 0
        });
      } else {
        setMasterList([]);
      }
    } catch (err) {
      console.error('Master search error:', err);
      onNotify?.('error', err?.response?.data?.message || 'Error searching master catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasterMedicines(1);
  }, []);

  const openAddBatchModal = (med) => {
    setSelectedMedForBatch(med);
    const catalogMrp = med.mrp ? Number(String(med.mrp).replace(/[^0-9.]/g, '')) : '';
    setBatchData({
      batch_number: '',
      mrp: catalogMrp,
      vendor_price: '',
      stock_quantity: '',
      expiry_date: '',
      manufacturing_date: '',
      hsn_number: hsnList[0]?.hsnCode || '', // default to first active HSN code if available
      packaging: med.packaging || '',
      isReturnAllowed: true,
      isReplacementAllowed: true
    });
  };

  const handleAddBatchSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMedForBatch) return;

    // Client-side rule check: Batch MRP cannot exceed Catalog MRP
    const catalogMrpLimit = Number(String(selectedMedForBatch.mrp).replace(/[^0-9.]/g, ''));
    if (catalogMrpLimit && Number(batchData.mrp) > catalogMrpLimit) {
      onNotify?.('error', `MRP exceeds approved catalog limit of ₹${catalogMrpLimit}. Request an MRP hike first.`);
      return;
    }

    try {
      setSubmittingBatch(true);
      const payload = {
        medicineId: selectedMedForBatch._id,
        batch_number: batchData.batch_number.trim(),
        mrp: Number(batchData.mrp),
        vendor_price: Number(batchData.vendor_price),
        stock_quantity: Number(batchData.stock_quantity),
        expiry_date: batchData.expiry_date || undefined,
        manufacturing_date: batchData.manufacturing_date || undefined,
        hsn_number: batchData.hsn_number.trim() || undefined,
        packaging: batchData.packaging.trim() || undefined,
        isReturnAllowed: batchData.isReturnAllowed,
        isReplacementAllowed: batchData.isReplacementAllowed
      };

      const res = await PharmacyVendorAPI.addMedicineBatchToPharmacyInventory(payload);
      if (res && res.success) {
        onNotify?.('success', res.message || 'Batch successfully added to your store!');
        setSelectedMedForBatch(null);
      }
    } catch (err) {
      console.error('Add batch error:', err);
      onNotify?.('error', err?.response?.data?.message || 'Failed to add batch.');
    } finally {
      setSubmittingBatch(false);
    }
  };

  const handleMrpIncreaseSubmit = async (e) => {
    e.preventDefault();
    if (!mrpRequestMed || !proposedMrp) return;

    try {
      setSubmittingMrpRequest(true);
      const payload = {
        medicineId: mrpRequestMed._id,
        proposedMrp: Number(proposedMrp),
        reason: mrpReason.trim() || undefined
      };

      const res = await PharmacyVendorAPI.requestMasterMedicineMrpIncrease(payload);
      if (res && res.success) {
        onNotify?.('success', res.message || 'MRP increase request submitted to Admin!');
        setMrpRequestMed(null);
        setProposedMrp('');
        setMrpReason('');
      }
    } catch (err) {
      console.error('MRP request error:', err);
      onNotify?.('error', err?.response?.data?.message || 'Failed to submit MRP request.');
    } finally {
      setSubmittingMrpRequest(false);
    }
  };

  // Find selected HSN code object for contextual guidance
  const selectedHsnDetails = hsnList.find((h) => h.hsnCode === batchData.hsn_number);

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search master catalog by brand name (e.g. Dolo), salt, manufacturer..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchMasterMedicines(1)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:border-[#3d3f96] outline-none"
          />
        </div>

        <button
          onClick={() => fetchMasterMedicines(1)}
          disabled={loading}
          className="px-6 py-2.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <RefreshCw size={15} className="animate-spin" /> : <Search size={15} />}
          <span>Search Catalog</span>
        </button>
      </div>

      {/* Catalog Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw size={28} className="animate-spin text-[#3d3f96] mx-auto" />
            <p className="text-xs font-bold text-slate-500">Searching global master database...</p>
          </div>
        ) : masterList.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Pill size={32} className="mx-auto text-slate-300" />
            <h3 className="text-base font-black text-slate-800">No master medicines found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try searching with another keyword or request this medicine to be added via the Request tab.
            </p>
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4">Medicine</th>
                    <th className="py-3.5 px-4">Manufacturer</th>
                    <th className="py-3.5 px-4">Salt Composition</th>
                    <th className="py-3.5 px-4">Packaging</th>
                    <th className="py-3.5 px-4">Approved MRP</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                  {masterList.map((med) => {
                    const thumb = Array.isArray(med.image_url) && med.image_url[0] ? med.image_url[0] : null;

                    return (
                      <tr key={med._id} className="hover:bg-slate-50/80 transition-colors">
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

                        <td className="py-3.5 px-4 text-slate-600 text-[11px]">{med.manufacturers || '—'}</td>

                        <td className="py-3.5 px-4 max-w-[220px]">
                          <span className="text-slate-600 text-[11px] font-semibold line-clamp-1" title={med.salt_composition}>
                            {med.salt_composition || '—'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 text-[11px] whitespace-nowrap">{med.packaging || '—'}</td>

                        <td className="py-3.5 px-4 whitespace-nowrap font-black text-slate-900">
                          {med.mrp ? `₹${med.mrp}` : 'N/A'}
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => onShowDetails?.(med._id)}
                              className="px-2.5 py-1.5 text-slate-600 hover:text-[#3d3f96] hover:bg-slate-100 rounded-lg text-xs font-bold inline-flex items-center gap-1"
                            >
                              <Eye size={14} /> Details
                            </button>

                            <button
                              onClick={() => {
                                setMrpRequestMed(med);
                                setProposedMrp('');
                                setMrpReason('');
                              }}
                              className="px-2.5 py-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-xs font-bold inline-flex items-center gap-1"
                              title="Request MRP Hike"
                            >
                              <TrendingUp size={13} /> Request Hike
                            </button>

                            <button
                              onClick={() => openAddBatchModal(med)}
                              className="px-3 py-1.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-sm"
                            >
                              <Plus size={14} /> Add Batch
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-500">
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchMasterMedicines(pagination.page - 1)}
                    disabled={pagination.page <= 1 || loading}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => fetchMasterMedicines(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages || loading}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Batch Modal */}
      {selectedMedForBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedMedForBatch(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X size={18} />
            </button>

            <div>
              <h3 className="text-base font-black text-slate-900">Add Stock Batch to Inventory</h3>
              <p className="text-xs text-slate-400 font-bold truncate max-w-[320px]">
                {selectedMedForBatch.name} (Catalog MRP: ₹{selectedMedForBatch.mrp})
              </p>
            </div>

            <form onSubmit={handleAddBatchSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                    Batch Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DL-2026-B1"
                    value={batchData.batch_number}
                    onChange={(e) => setBatchData({ ...batchData, batch_number: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                    Batch MRP (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={batchData.mrp}
                    onChange={(e) => setBatchData({ ...batchData, mrp: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                  />
                  <span className="text-[9px] text-slate-400 block mt-0.5">
                    Max allowed: ₹{selectedMedForBatch.mrp}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                    Store Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="29.50"
                    value={batchData.vendor_price}
                    onChange={(e) => setBatchData({ ...batchData, vendor_price: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                    Stock Quantity <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="100"
                    value={batchData.stock_quantity}
                    onChange={(e) => setBatchData({ ...batchData, stock_quantity: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={batchData.expiry_date}
                    onChange={(e) => setBatchData({ ...batchData, expiry_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Mfg Date</label>
                  <input
                    type="date"
                    value={batchData.manufacturing_date}
                    onChange={(e) => setBatchData({ ...batchData, manufacturing_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                  />
                </div>
              </div>

              {/* HSN CODE DROPDOWN */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 block">
                    Active GST HSN Code
                  </label>
                  {onRequestHsnTab && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMedForBatch(null);
                        onRequestHsnTab();
                      }}
                      className="text-[10px] text-[#3d3f96] hover:underline font-bold"
                    >
                      + Request New HSN
                    </button>
                  )}
                </div>

                <select
                  value={batchData.hsn_number}
                  onChange={(e) => setBatchData({ ...batchData, hsn_number: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96]"
                >
                  <option value="">-- Select Active HSN Code --</option>
                  {hsnList.map((hsn) => (
                    <option key={hsn._id || hsn.hsnCode} value={hsn.hsnCode}>
                      {hsn.hsnCode} ({hsn.totalGstPercent}% GST) - {hsn.description?.slice(0, 42)}...
                    </option>
                  ))}
                </select>

                {selectedHsnDetails && (
                  <div className="mt-1.5 p-2 bg-blue-50 border border-blue-100 rounded-lg text-[10px] text-blue-900 font-medium">
                    <span className="font-bold">GST Slab:</span> {selectedHsnDetails.totalGstPercent}% |{' '}
                    <span className="font-bold">Commodity:</span> {selectedHsnDetails.description}
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Packaging</label>
                <input
                  type="text"
                  placeholder="strip of 15 tablets"
                  value={batchData.packaging}
                  onChange={(e) => setBatchData({ ...batchData, packaging: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={batchData.isReturnAllowed}
                    onChange={(e) => setBatchData({ ...batchData, isReturnAllowed: e.target.checked })}
                    className="w-4 h-4 rounded text-[#3d3f96]"
                  />
                  <span>Allow Customer Return</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={batchData.isReplacementAllowed}
                    onChange={(e) => setBatchData({ ...batchData, isReplacementAllowed: e.target.checked })}
                    className="w-4 h-4 rounded text-[#3d3f96]"
                  />
                  <span>Allow Replacement</span>
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedMedForBatch(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBatch}
                  className="flex-1 py-2.5 rounded-xl bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {submittingBatch ? 'Registering...' : 'Add Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request MRP Increase Modal */}
      {mrpRequestMed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setMrpRequestMed(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X size={18} />
            </button>

            <div>
              <h3 className="text-base font-black text-slate-900">Request MRP Increase</h3>
              <p className="text-xs text-slate-400 font-bold truncate max-w-[240px]">
                {mrpRequestMed.name} (Current: ₹{mrpRequestMed.mrp})
              </p>
            </div>

            <form onSubmit={handleMrpIncreaseSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                  Proposed New MRP (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="38.50"
                  value={proposedMrp}
                  onChange={(e) => setProposedMrp(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Reason for Admin</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Manufacturer released updated batch with higher printed MRP."
                  value={mrpReason}
                  onChange={(e) => setMrpReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMrpRequestMed(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingMrpRequest}
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {submittingMrpRequest ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}