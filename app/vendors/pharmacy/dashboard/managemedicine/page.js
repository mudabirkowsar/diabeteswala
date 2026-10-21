"use client";

import React, { useState, useEffect } from 'react';
import {
  Pill,
  Send,
  Plus,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';

import PharmacyInventory from './components/PharmacyInventory';
import GlobalInventory from './components/GlobalInventory';
import RequestHsnNumber from './components/RequestHsnNumber';
import RequestNewMedicine from './components/RequestNewMedicine';
import PharmacyVendorAPI from '../../../../services/PharmacyVendorAPI';

export default function PharmacyInventoryManagementPage() {
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'global_catalog' | 'hsn_requests'
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Global Active HSN Codes List
  const [hsnList, setHsnList] = useState([]);
  const [loadingHsn, setLoadingHsn] = useState(false);

  // Master Details Modal
  const [selectedMasterDetails, setSelectedMasterDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const notify = (type, text) => {
    setMessage({ type, text });
  };

  // Fetch all active HSN codes once on page mount
  const fetchActiveHsnCodes = async () => {
    try {
      setLoadingHsn(true);
      const res = await PharmacyVendorAPI.getAllActiveHsnCodes();
      if (res && res.success && Array.isArray(res.data)) {
        // Filter active HSN codes
        const activeOnly = res.data.filter((item) => item.isActive !== false);
        setHsnList(activeOnly);
      }
    } catch (err) {
      console.error('Failed to load active HSN codes:', err);
    } finally {
      setLoadingHsn(false);
    }
  };

  useEffect(() => {
    fetchActiveHsnCodes();
  }, []);

  const handleShowMasterDetails = async (id) => {
    try {
      setLoadingDetails(true);
      const res = await PharmacyVendorAPI.getMasterMedicineDetailsById(id);
      if (res && res.success && res.data) {
        setSelectedMasterDetails(res.data);
      } else {
        notify('error', 'Medicine details not found.');
      }
    } catch (err) {
      console.error('Master details fetch error:', err);
      notify('error', err?.response?.data?.message || 'Failed to load details.');
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header Section */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#3d3f96] text-white flex items-center justify-center shadow-md shadow-indigo-100 shrink-0">
              <Pill size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Pharmacy Inventory & Master Catalog
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Manage medicine batches with GST HSN validation, retail pricing, and catalog requests.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Send size={14} className="text-amber-500" />
              <span>Request New Medicine</span>
            </button>

            <button
              onClick={() => setActiveTab('global_catalog')}
              className="px-4 py-2.5 rounded-xl bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-200 active:scale-95 transition-all"
            >
              <Plus size={15} />
              <span>Add From Catalog</span>
            </button>
          </div>
        </div>

        {/* Global Notifications */}
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
              className="p-1 hover:bg-black/5 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'inventory'
                ? 'bg-[#3d3f96] text-white shadow-md shadow-indigo-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Store Inventory Table
          </button>

          <button
            onClick={() => setActiveTab('global_catalog')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'global_catalog'
                ? 'bg-[#3d3f96] text-white shadow-md shadow-indigo-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Global Master Catalog
          </button>

          <button
            onClick={() => setActiveTab('hsn_requests')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'hsn_requests'
                ? 'bg-[#3d3f96] text-white shadow-md shadow-indigo-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            HSN Code Requests ({hsnList.length} Active Codes)
          </button>
        </div>

        {/* Component Views */}
        {activeTab === 'inventory' && (
          <PharmacyInventory
            onShowMasterDetails={handleShowMasterDetails}
            onNotify={notify}
            hsnList={hsnList}
          />
        )}

        {activeTab === 'global_catalog' && (
          <GlobalInventory
            onShowDetails={handleShowMasterDetails}
            onNotify={notify}
            hsnList={hsnList}
            onRequestHsnTab={() => setActiveTab('hsn_requests')}
          />
        )}

        {activeTab === 'hsn_requests' && (
          <RequestHsnNumber
            onNotify={notify}
          />
        )}

      </div>

      {/* Request New Medicine Modal */}
      <RequestNewMedicine
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onNotify={notify}
      />

      {/* Global Master Medicine Full Details Modal */}
      {selectedMasterDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative max-h-[85vh] overflow-y-auto space-y-4">
            <button
              onClick={() => setSelectedMasterDetails(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
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

            <div className="grid grid-cols-3 gap-2.5 text-xs font-bold">
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
                <span className={`text-xs font-black ${selectedMasterDetails.prescription_required === 'Yes' ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {selectedMasterDetails.prescription_required || 'No'}
                </span>
              </div>
            </div>

            {selectedMasterDetails.salt_composition && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">Salt Composition</span>
                <p className="text-xs font-bold text-slate-700">{selectedMasterDetails.salt_composition}</p>
              </div>
            )}

            {selectedMasterDetails.primary_use && (
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">Primary Use</span>
                <p className="text-xs text-slate-700 font-medium">{selectedMasterDetails.primary_use}</p>
              </div>
            )}

            {selectedMasterDetails.description && (
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">Description</span>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">{selectedMasterDetails.description}</p>
              </div>
            )}

            {selectedMasterDetails.how_to_use && (
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">How To Use</span>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">{selectedMasterDetails.how_to_use}</p>
              </div>
            )}

            {selectedMasterDetails.side_effect && (
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">Side Effects</span>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">{selectedMasterDetails.side_effect}</p>
              </div>
            )}

            {selectedMasterDetails.storage && (
              <div className="text-xs font-bold text-slate-500">
                <span className="text-slate-400">Storage:</span> {selectedMasterDetails.storage}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}