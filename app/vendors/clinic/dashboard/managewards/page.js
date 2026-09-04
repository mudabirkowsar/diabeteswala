"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  FaBed, 
  FaPlus, 
  FaArrowLeft, 
  FaPencilAlt, 
  FaTrashAlt, 
  FaSave, 
  FaCheckCircle, 
  FaSpinner, 
  FaTimes, 
  FaRupeeSign,
  FaExclamationTriangle,
  FaLayerGroup,
  FaSearch,
  FaFilter,
  FaUserInjured,
  FaCheck,
  FaWrench,
  FaBookmark,
  FaShieldAlt
} from 'react-icons/fa';

import ClinicAPI from '../../../../services/ClinicAPI';

const WARD_TYPES = ["Daycare", "Observation", "General", "ICU", "Private Room", "Semi Private"];

export default function ClinicWardsSimplePage() {
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWard, setSelectedWard] = useState(null); // null = Step 1, object = Step 2
  const [toast, setToast] = useState(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [bedStatusFilter, setBedStatusFilter] = useState('All');

  // Step 1: Create Ward Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    type: 'Daycare',
    totalBeds: 4,
    pricePerDay: 600
  });
  const [creating, setCreating] = useState(false);

  // Step 2: Selected Ward Beds & Edit State
  const [beds, setBeds] = useState([]);
  const [loadingBeds, setLoadingBeds] = useState(false);
  const [isEditingWard, setIsEditingWard] = useState(false);
  const [wardEditForm, setWardEditForm] = useState({ name: '', type: 'Daycare', pricePerDay: 0, isActive: true });
  const [savingWard, setSavingWard] = useState(false);
  const [newBedCount, setNewBedCount] = useState(1);
  const [addingBeds, setAddingBeds] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // --- 1. FETCH ALL WARDS ---
  const fetchWards = async () => {
    try {
      setLoading(true);
      const res = await ClinicAPI.getClinicWardsList();
      if (res?.success && Array.isArray(res.data)) {
        setWards(res.data);
      }
    } catch (err) {
      console.error("Failed to load wards:", err);
      showToast(err.response?.data?.message || "Could not load wards", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWards();
  }, []);

  // Overall Statistics Calculation
  const overallStats = useMemo(() => {
    return wards.reduce(
      (acc, ward) => {
        acc.totalBeds += ward.totalBeds || 0;
        acc.occupiedBeds += ward.occupiedBeds || 0;
        acc.availableBeds += ward.availableBeds || 0;
        return acc;
      },
      { totalBeds: 0, occupiedBeds: 0, availableBeds: 0 }
    );
  }, [wards]);

  // --- 2. SELECT WARD & FETCH BEDS ---
  const handleSelectWard = async (ward) => {
    setSelectedWard(ward);
    setIsEditingWard(false);
    setBedStatusFilter('All');
    setWardEditForm({
      name: ward.name,
      type: ward.type,
      pricePerDay: ward.pricePerDay,
      isActive: ward.isActive ?? true
    });
    fetchBeds(ward._id);
  };

  const fetchBeds = async (wardId) => {
    try {
      setLoadingBeds(true);
      const res = await ClinicAPI.getClinicWardBeds(wardId);
      if (res?.success) {
        setBeds(res.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch beds:", err);
      showToast("Could not load beds for this ward", "error");
    } finally {
      setLoadingBeds(false);
    }
  };

  // --- CREATE NEW WARD ---
  const handleCreateWard = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await ClinicAPI.createClinicWard({
        name: createForm.name.trim(),
        type: createForm.type,
        totalBeds: Number(createForm.totalBeds),
        pricePerDay: Number(createForm.pricePerDay)
      });
      if (res?.success) {
        showToast("Ward created and initial beds generated successfully!");
        setShowAddModal(false);
        setCreateForm({ name: '', type: 'Daycare', totalBeds: 4, pricePerDay: 600 });
        fetchWards();
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create ward", "error");
    } finally {
      setCreating(false);
    }
  };

  // --- UPDATE WARD DETAILS ---
  const handleSaveWardInfo = async () => {
    setSavingWard(true);
    try {
      const res = await ClinicAPI.updateClinicWardInfo(selectedWard._id, {
        name: wardEditForm.name.trim(),
        type: wardEditForm.type,
        pricePerDay: Number(wardEditForm.pricePerDay),
        isActive: Boolean(wardEditForm.isActive)
      });
      if (res?.success) {
        showToast("Ward details updated successfully!");
        setSelectedWard(res.data);
        setIsEditingWard(false);
        fetchWards();
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update ward details", "error");
    } finally {
      setSavingWard(false);
    }
  };

  // --- DELETE WARD ---
  const handleDeleteWard = async () => {
    if (selectedWard.occupiedBeds > 0) {
      showToast("Cannot delete ward while beds are currently occupied.", "error");
      return;
    }
    if (!window.confirm(`Are you sure you want to delete ward "${selectedWard.name}" and all associated beds?`)) return;

    try {
      const res = await ClinicAPI.deleteClinicWard(selectedWard._id);
      if (res?.success) {
        showToast("Ward deleted successfully", "success");
        setSelectedWard(null);
        fetchWards();
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete ward", "error");
    }
  };

  // --- BULK ADD BEDS ---
  const handleAddBeds = async () => {
    if (newBedCount < 1) return;
    setAddingBeds(true);
    try {
      const res = await ClinicAPI.updateClinicWardBedsCapacity({
        wardId: selectedWard._id,
        action: 'add',
        bedCount: Number(newBedCount),
        pricePerDay: Number(selectedWard.pricePerDay)
      });
      if (res?.success) {
        showToast(`Added ${newBedCount} bed(s) successfully!`);
        setNewBedCount(1);
        fetchBeds(selectedWard._id);
        fetchWards();
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add beds", "error");
    } finally {
      setAddingBeds(false);
    }
  };

  // --- UPDATE SINGLE BED STATUS ---
  const handleBedStatusChange = async (bedId, newStatus) => {
    try {
      const res = await ClinicAPI.updateClinicBedStatus({ bedId, status: newStatus });
      if (res?.success) {
        setBeds(prev => prev.map(b => b._id === bedId ? { ...b, status: newStatus } : b));
        showToast(`Bed updated to ${newStatus}`);
        fetchWards();
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update status", "error");
    }
  };

  // --- DELETE SINGLE BED ---
  const handleDeleteBed = async (bed) => {
    if (bed.status === 'Occupied') {
      showToast("Cannot delete an occupied bed.", "error");
      return;
    }
    if (!window.confirm(`Delete bed ${bed.bedNumber}?`)) return;

    try {
      const res = await ClinicAPI.deleteClinicBed(bed._id);
      if (res?.success) {
        setBeds(prev => prev.filter(b => b._id !== bed._id));
        showToast(`Bed ${bed.bedNumber} removed`);
        fetchWards();
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete bed", "error");
    }
  };

  // Filtered wards for Step 1
  const filteredWards = useMemo(() => {
    return wards.filter(ward => {
      const matchesSearch = ward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            ward.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'All' || ward.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [wards, searchTerm, typeFilter]);

  // Filtered beds for Step 2
  const filteredBeds = useMemo(() => {
    if (bedStatusFilter === 'All') return beds;
    return beds.filter(bed => bed.status === bedStatusFilter);
  }, [beds, bedStatusFilter]);

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto font-sans text-slate-800">
      
      {/* Toast Alert Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[999999] px-4 py-3 rounded-lg text-white text-xs font-semibold shadow-xl border flex items-center gap-2.5 transition-all animate-bounce ${
          toast.type === 'error' 
            ? 'bg-red-600 border-red-700' 
            : 'bg-[#3D3F96] border-indigo-900'
        }`}>
          {toast.type === 'error' ? <FaExclamationTriangle className="text-white" /> : <FaCheckCircle className="text-emerald-300" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 1: ALL WARDS VIEW                                   */}
      {/* ========================================================= */}
      {!selectedWard && (
        <div className="space-y-6">
          
          {/* Header Banner */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-[#3D3F96] rounded-lg">
                  <FaLayerGroup size={18} />
                </div>
                <h1 className="text-xl font-black tracking-tight text-slate-900">Ward & Bed Management</h1>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Monitor live occupancy, configure daily rates, and manage admission beds across all clinic departments.
              </p>
            </div>

            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#3D3F96] hover:bg-[#2C2E75] active:scale-95 text-white text-xs font-bold shadow-sm transition-all"
            >
              <FaPlus size={11} /> Add New Ward
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Wards</span>
              <span className="text-xl font-black text-slate-800 mt-1 block">{wards.length}</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Bed Capacity</span>
              <span className="text-xl font-black text-[#3D3F96] mt-1 block">{overallStats.totalBeds} Units</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">Available Beds</span>
              <span className="text-xl font-black text-emerald-600 mt-1 block">{overallStats.availableBeds} Ready</span>
            </div>

            <div className="bg-white border border-red-100 rounded-xl p-4 shadow-sm bg-gradient-to-br from-white to-red-50/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 block">Occupied Beds</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-black text-red-600">{overallStats.occupiedBeds} In Use</span>
                <span className="text-[10px] font-bold text-red-500">
                  ({overallStats.totalBeds > 0 ? Math.round((overallStats.occupiedBeds / overallStats.totalBeds) * 100) : 0}%)
                </span>
              </div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Search ward name or classification..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-[#3D3F96] transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <FaFilter size={10} /> Type:
              </span>
              {['All', ...WARD_TYPES].map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                    typeFilter === type
                      ? 'bg-[#3D3F96] text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Wards List Grid */}
          {loading ? (
            <div className="py-24 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
              <FaSpinner className="animate-spin text-2xl mx-auto mb-2 text-[#3D3F96]" />
              <p className="text-xs font-bold tracking-wide text-slate-500">Loading clinic wards...</p>
            </div>
          ) : filteredWards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredWards.map(ward => {
                const total = ward.totalBeds || 0;
                const occupied = ward.occupiedBeds || 0;
                const available = ward.availableBeds || 0;
                const rate = total > 0 ? Math.round((occupied / total) * 100) : 0;
                const isHighOccupancy = rate >= 75;

                return (
                  <div 
                    key={ward._id}
                    onClick={() => handleSelectWard(ward)}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-[#3D3F96]/50 cursor-pointer transition-all flex flex-col justify-between group relative overflow-hidden"
                  >
                    {/* Top Accent Strip for High Occupancy */}
                    {isHighOccupancy && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-[#3D3F96] border border-indigo-100">
                          {ward.type}
                        </span>
                        
                        <div className="text-right">
                          <span className="text-xs font-black text-slate-800 flex items-center justify-end">
                            <FaRupeeSign size={10} className="text-slate-400" />{ward.pricePerDay}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 block uppercase">Per Day</span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-base font-black text-slate-800 group-hover:text-[#3D3F96] transition-colors line-clamp-1">
                          {ward.name}
                        </h3>
                        <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                          Capacity: <span className="font-bold text-slate-600">{total} Beds</span>
                        </p>
                      </div>

                      {/* Occupancy Indicator Bar */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-slate-500">Occupancy</span>
                          <span className={isHighOccupancy ? "text-red-600" : "text-slate-700"}>
                            {occupied}/{total} ({rate}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                          <div style={{ width: `${rate}%` }} className="bg-red-500 transition-all duration-300" />
                          <div style={{ width: `${100 - rate}%` }} className="bg-emerald-500 transition-all duration-300" />
                        </div>
                        <div className="flex justify-between text-[10px] font-bold pt-0.5">
                          <span className="text-emerald-600">{available} Ready</span>
                          <span className={occupied > 0 ? "text-red-500 font-black" : "text-slate-400"}>
                            {occupied} In Use
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Action */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold text-slate-400 group-hover:text-[#3D3F96] transition-colors">
                        Manage Ward Units
                      </span>
                      <span className="text-[#3D3F96] font-bold group-hover:translate-x-0.5 transition-transform">
                        →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 space-y-3">
              <div className="w-12 h-12 rounded-lg bg-indigo-50 text-[#3D3F96] flex items-center justify-center mx-auto">
                <FaBed size={22} />
              </div>
              <h4 className="text-sm font-black text-slate-700">No Wards Found</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchTerm || typeFilter !== 'All' 
                  ? "No wards match your search or category filter." 
                  : "Click '+ Add New Ward' to register your first clinical unit."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 2: DETAILS & BEDS VIEW (AFTER SELECTING A WARD)       */}
      {/* ========================================================= */}
      {selectedWard && (
        <div className="space-y-6">
          
          {/* Breadcrumb / Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <button 
              onClick={() => setSelectedWard(null)}
              className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#3D3F96] transition-colors"
            >
              <FaArrowLeft size={10} /> Return to All Wards
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditingWard(!isEditingWard)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all shadow-sm"
              >
                <FaPencilAlt size={10} className="text-[#3D3F96]" /> {isEditingWard ? "Cancel Edit" : "Edit Ward"}
              </button>

              <button
                onClick={handleDeleteWard}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-all shadow-sm"
              >
                <FaTrashAlt size={10} /> Delete Ward
              </button>
            </div>
          </div>

          {/* Ward Summary & Configuration Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            {isEditingWard ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#3D3F96]">Update Ward Configuration</h4>
                  <span className="text-[10px] font-bold text-slate-400">Modify properties below</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Ward Name</label>
                    <input 
                      type="text" 
                      value={wardEditForm.name} 
                      onChange={(e) => setWardEditForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold text-xs outline-none focus:border-[#3D3F96] bg-slate-50 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Classification</label>
                    <select 
                      value={wardEditForm.type}
                      onChange={(e) => setWardEditForm(p => ({ ...p, type: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold text-xs outline-none focus:border-[#3D3F96] bg-slate-50 focus:bg-white transition-all"
                    >
                      {WARD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Daily Bed Rate (₹)</label>
                    <input 
                      type="number" 
                      value={wardEditForm.pricePerDay} 
                      onChange={(e) => setWardEditForm(p => ({ ...p, pricePerDay: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold text-xs outline-none focus:border-[#3D3F96] bg-slate-50 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveWardInfo}
                    disabled={savingWard}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#3D3F96] hover:bg-[#2C2E75] text-white text-xs font-bold transition-all shadow-sm disabled:opacity-60"
                  >
                    {savingWard ? <FaSpinner className="animate-spin" /> : <><FaSave size={11} /> Save Ward Details</>}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-lg font-black text-slate-900">{selectedWard.name}</h2>
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-indigo-50 text-[#3D3F96] border border-indigo-100">
                      {selectedWard.type}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 pt-0.5">
                    <span>Base Rate: <strong className="text-slate-800">₹{selectedWard.pricePerDay} / day</strong></span>
                    <span>•</span>
                    <span>Total Bed Units: <strong className="text-slate-800">{beds.length}</strong></span>
                    <span>•</span>
                    <span>Occupancy: <strong className="text-red-600">{beds.filter(b => b.status === 'Occupied').length} Occupied</strong></span>
                  </div>
                </div>

                {/* Quick Add Beds Action Bar */}
                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200 self-start lg:self-auto">
                  <span className="text-[11px] font-bold text-slate-500 pl-2">Generate Beds:</span>
                  <input 
                    type="number" 
                    min="1" 
                    max="20" 
                    value={newBedCount} 
                    onChange={(e) => setNewBedCount(e.target.value)}
                    className="w-12 px-2 py-1 rounded-md border border-slate-200 text-center text-xs font-bold outline-none bg-white focus:border-[#3D3F96]"
                  />
                  <button
                    onClick={handleAddBeds}
                    disabled={addingBeds}
                    className="px-3.5 py-1 rounded-md bg-[#3D3F96] hover:bg-[#2C2E75] text-white text-xs font-bold transition-all disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {addingBeds ? <FaSpinner className="animate-spin" /> : <><FaPlus size={10} /> Add</>}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Beds Grid & Status Controls */}
          <div className="space-y-4">
            
            {/* Filter Pill Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <FaBed className="text-[#3D3F96]" /> Bed Units Roster ({filteredBeds.length})
              </h3>

              <div className="flex items-center gap-1.5 overflow-x-auto">
                {['All', 'Available', 'Occupied', 'Maintenance', 'Reserved'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setBedStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                      bedStatusFilter === st
                        ? st === 'Occupied' ? 'bg-red-500 text-white' : 'bg-[#3D3F96] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st} {st !== 'All' && `(${beds.filter(b => b.status === st).length})`}
                  </button>
                ))}
              </div>
            </div>

            {loadingBeds ? (
              <div className="py-20 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
                <FaSpinner className="animate-spin text-2xl mx-auto mb-2 text-[#3D3F96]" />
                <p className="text-xs font-bold text-slate-500">Loading beds in this ward...</p>
              </div>
            ) : filteredBeds.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {filteredBeds.map(bed => {
                  const isOccupied = bed.status === 'Occupied';
                  const isMaintenance = bed.status === 'Maintenance';
                  const isReserved = bed.status === 'Reserved';

                  return (
                    <div 
                      key={bed._id}
                      className={`p-3.5 rounded-xl border bg-white shadow-sm flex flex-col justify-between space-y-3 transition-all ${
                        isOccupied 
                          ? 'border-red-200 bg-gradient-to-b from-white to-red-50/20' 
                          : isMaintenance 
                          ? 'border-amber-200 bg-amber-50/10' 
                          : isReserved 
                          ? 'border-indigo-200 bg-indigo-50/10' 
                          : 'border-emerald-200 bg-emerald-50/10'
                      }`}
                    >
                      {/* Bed Top Info */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-sm text-slate-900 tracking-tight">
                          {bed.bedNumber}
                        </span>

                        {!isOccupied && (
                          <button
                            onClick={() => handleDeleteBed(bed)}
                            className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="Remove bed unit"
                          >
                            <FaTrashAlt size={10} />
                          </button>
                        )}
                      </div>

                      {/* Daily Rate Info */}
                      <div className="text-[11px] font-bold text-slate-500">
                        ₹{bed.pricePerDay} <span className="text-[9px] text-slate-400 font-normal">/day</span>
                      </div>

                      {/* Status Selector / Badge */}
                      {isOccupied ? (
                        <div className="flex items-center justify-center gap-1.5 py-1 rounded-md bg-red-50 text-red-600 border border-red-200 text-[10px] font-black uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          Occupied
                        </div>
                      ) : (
                        <select
                          value={bed.status}
                          onChange={(e) => handleBedStatusChange(bed._id, e.target.value)}
                          className={`w-full py-1 px-2 rounded-md text-[10px] font-black uppercase tracking-wider border outline-none cursor-pointer transition-all ${
                            isMaintenance 
                              ? 'bg-amber-50 text-amber-800 border-amber-300' 
                              : isReserved 
                              ? 'bg-indigo-50 text-[#3D3F96] border-indigo-200' 
                              : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          }`}
                        >
                          <option value="Available">Available</option>
                          <option value="Maintenance">Maintenance</option>
                          <option value="Reserved">Reserved</option>
                        </select>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-10 text-center text-slate-400 text-xs font-semibold border border-slate-200 space-y-2">
                <FaBed size={24} className="mx-auto text-slate-300" />
                <p>No beds match the selected status filter.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* ADD NEW WARD MODAL                                        */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <FaTimes size={13} />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-lg bg-indigo-50 text-[#3D3F96]">
                <FaBed size={16} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Register New Ward</h3>
                <p className="text-[11px] font-medium text-slate-400">Configure unit classifications and bed auto-generation</p>
              </div>
            </div>

            <form onSubmit={handleCreateWard} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Ward Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Critical Observation Unit" 
                  value={createForm.name} 
                  onChange={(e) => setCreateForm(p => ({ ...p, name: e.target.value }))}
                  required 
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs font-bold text-slate-800 outline-none focus:border-[#3D3F96] transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Classification</label>
                  <select 
                    value={createForm.type} 
                    onChange={(e) => setCreateForm(p => ({ ...p, type: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs font-bold text-slate-800 outline-none focus:border-[#3D3F96] transition-all"
                  >
                    {WARD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Initial Beds</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="50" 
                    value={createForm.totalBeds} 
                    onChange={(e) => setCreateForm(p => ({ ...p, totalBeds: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs font-bold text-slate-800 outline-none focus:border-[#3D3F96] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Daily Bed Rate (₹)</label>
                <input 
                  type="number" 
                  min="0" 
                  value={createForm.pricePerDay} 
                  onChange={(e) => setCreateForm(p => ({ ...p, pricePerDay: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs font-bold text-slate-800 outline-none focus:border-[#3D3F96] transition-all"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-lg bg-[#3D3F96] hover:bg-[#2C2E75] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-60"
                >
                  {creating ? <FaSpinner className="animate-spin" /> : "Create Ward"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}