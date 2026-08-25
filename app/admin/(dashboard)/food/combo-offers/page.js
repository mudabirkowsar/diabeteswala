"use client";

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Edit3,
  Trash2,
  X,
  Plus,
  Minus,
  Search,
  Check,
  Loader2,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Flame,
  Layers,
  Package,
  Tag,
  AlertCircle
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Import your API service functions
import AdminAPI from '../../../../services/AdminAPI';

// --- BASE MEDIA HELPER ---
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";

const getMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  return `${BASE_SERVER_URL}/${cleanPath}`;
};

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600";

export default function ComboOffersPage() {
  // --- Data States ---
  const [combos, setCombos] = useState([]);
  const [masterDishes, setMasterDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  // --- Modal States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [editingId, setEditingId] = useState(null);

  // --- Form Fields State ---
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formComboPrice, setFormComboPrice] = useState('');
  const [formSpicy, setFormSpicy] = useState('Medium (Regular)');
  const [formPopular, setFormPopular] = useState(false);
  const [formRecommended, setFormRecommended] = useState(false);
  const [selectedDishes, setSelectedDishes] = useState([]);

  // --- Modal-specific search query for dish selection ---
  const [modalSearchQuery, setModalSearchQuery] = useState('');

  // --- 1. Fetch All Combo Offers ---
  const fetchCombos = async () => {
    setLoading(true);
    try {
      const response = await AdminAPI.getAllComboOffers();
      if (response && response.success) {
        setCombos(response.data || []);
      } else {
        toast.error("Failed to load combo packages.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error reading combo database.");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Fetch Master Food Items (For Bundling Selection) ---
  const fetchMasterDishes = async () => {
    setLoadingCatalog(true);
    try {
      const response = await AdminAPI.getAllFoodItems();
      if (response && response.success) {
        setMasterDishes(response.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not fetch master food items.");
    } finally {
      setLoadingCatalog(false);
    }
  };

  useEffect(() => {
    fetchCombos();
    fetchMasterDishes();
  }, []);

  // --- Toggle Combo Availability Switch ---
  const toggleComboAvailability = async (id) => {
    setTogglingId(id);
    try {
      const response = await AdminAPI.toggleComboStatus(id);
      if (response && response.success) {
        toast.success(response.message || "Combo availability updated.");
        const newStatus = response.data?.isActive ?? response.isActive;
        setCombos(prev => prev.map(c =>
          c._id === id ? { ...c, isActive: newStatus !== undefined ? newStatus : !c.isActive } : c
        ));
      } else {
        toast.error("Failed to update combo status.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error toggling availability.");
    } finally {
      setTogglingId(null);
    }
  };

  // --- Delete Combo Package ---
  const deleteCombo = async (id) => {
    if (!window.confirm("Are you sure you want to remove this combo bundle?")) return;
    setActionLoading(true);
    try {
      const response = await AdminAPI.deleteComboPackage(id);
      if (response && response.success) {
        toast.success(response.message || "Combo offer deleted.");
        setCombos(prev => prev.filter(c => c._id !== id));
      } else {
        toast.error("Failed to remove combo offer.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error removing combo bundle.");
    } finally {
      setActionLoading(false);
    }
  };

  // --- Select/Deselect Dish inside Modal ---
  const handleDishToggle = (dish) => {
    const exists = selectedDishes.find(d => d.foodServiceId === dish._id);
    if (exists) {
      setSelectedDishes(prev => prev.filter(d => d.foodServiceId !== dish._id));
    } else {
      setSelectedDishes(prev => [
        ...prev,
        {
          foodServiceId: dish._id,
          name: dish.name,
          price: dish.price || 0,
          imageUrl: dish.imageUrl || null,
          quantity: 1
        }
      ]);
    }
  };

  // --- Modify Quantity of a Selected Dish ---
  const handleQtyChange = (foodServiceId, newQty) => {
    if (newQty < 1) return;
    setSelectedDishes(prev => prev.map(d =>
      d.foodServiceId === foodServiceId ? { ...d, quantity: newQty } : d
    ));
  };

  // Calculate Base Price dynamically
  const calculatedBasePrice = selectedDishes.reduce(
    (acc, curr) => acc + (curr.price * curr.quantity),
    0
  );

  // Calculate live discount percentage
  const getLiveDiscountPct = () => {
    const parsedPrice = parseFloat(formComboPrice);
    if (!calculatedBasePrice || !parsedPrice || parsedPrice >= calculatedBasePrice) return 0;
    return Math.round(((calculatedBasePrice - parsedPrice) / calculatedBasePrice) * 100);
  };

  // Open Create Modal
  const openCreateModal = () => {
    setModalMode('create');
    resetForm();
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (combo) => {
    setModalMode('edit');
    setEditingId(combo._id);

    setFormName(combo.name || '');
    setFormDesc(combo.description || '');
    setFormComboPrice(combo.comboPrice?.toString() || '');
    setFormSpicy(combo.spicyLevel || 'Medium (Regular)');
    setFormPopular(!!combo.isPopular);
    setFormRecommended(!!combo.isRecommended);

    // Map existing dishes to selection format
    const mappedDishes = (combo.dishes || []).map(d => ({
      foodServiceId: d.foodServiceId?._id || d.foodServiceId,
      name: d.foodServiceId?.name || "Dish",
      price: d.foodServiceId?.price || 0,
      imageUrl: d.foodServiceId?.imageUrl || null,
      quantity: d.quantity || 1
    }));

    setSelectedDishes(mappedDishes);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormName('');
    setFormDesc('');
    setFormComboPrice('');
    setFormSpicy('Medium (Regular)');
    setFormPopular(false);
    setFormRecommended(false);
    setSelectedDishes([]);
    setModalSearchQuery('');
    setEditingId(null);
  };

  // --- Submit Create or Update ---
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (selectedDishes.length < 2) {
      toast.error("A combo bundle must contain at least 2 dishes.");
      return;
    }

    if (parseFloat(formComboPrice) >= calculatedBasePrice) {
      toast.error("Combo price must be less than the calculated base price.");
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        name: formName.trim(),
        description: formDesc.trim(),
        comboPrice: Number(formComboPrice),
        spicyLevel: formSpicy,
        isPopular: formPopular,
        isRecommended: formRecommended,
        dishes: selectedDishes.map(d => ({
          foodServiceId: d.foodServiceId,
          quantity: d.quantity
        }))
      };

      let response;
      if (modalMode === 'create') {
        response = await AdminAPI.createComboOffer(payload);
      } else {
        response = await AdminAPI.updateComboDetails(editingId, payload);
      }

      if (response && response.success) {
        toast.success(response.message || "Combo offer saved successfully.");
        resetForm();
        setIsModalOpen(false);
        fetchCombos();
      } else {
        toast.error("Failed to save combo offer.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error submitting combo offer.");
    } finally {
      setActionLoading(false);
    }
  };

  // Filter master dishes based on search query in modal
  const filteredMasterDishes = masterDishes.filter(dish =>
    dish.name?.toLowerCase().includes(modalSearchQuery.toLowerCase())
  );

  const renderDietBadge = (type) => {
    const colors = {
      Veg: 'bg-emerald-500',
      'Non Veg': 'bg-rose-500',
      Egg: 'bg-amber-500'
    };
    return (
      <span className={`inline-flex items-center text-[10px] font-extrabold px-2 py-0.5 rounded-md text-white shadow-sm ${colors[type] || 'bg-slate-500'}`}>
        {type || 'Veg'}
      </span>
    );
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto py-4 pb-12 antialiased select-none">
      <Toaster position="top-right" />

      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Package className="text-[#3d3f96]" /> Combo Bundles & Offers
          </h1>
          <p className="text-xs text-slate-500 font-bold mt-1">
            Assemble multi-dish packages at promotional pricing to boost sales volume.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={fetchCombos}
            disabled={loading}
            className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 px-4 py-3 rounded-xl border border-slate-200 shadow-sm text-xs font-bold transition-all cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button
            onClick={openCreateModal}
            className="px-6 py-3.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-indigo-950/10 flex items-center gap-2 cursor-pointer"
          >
            <Plus size={15} /> Assemble New Combo
          </button>
        </div>
      </div>

      {/* --- COMBOS GRID --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-28 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading active combo packages...</p>
        </div>
      ) : combos.length === 0 ? (
        <div className="text-center py-24 bg-white border border-slate-100 rounded-3xl shadow-sm border-dashed">
          <Package size={44} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-bold text-slate-700">No combo offers published yet.</p>
          <p className="text-xs text-slate-400 mt-1">Click "Assemble New Combo" above to build your first bundle.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {combos.map((combo) => {
            const firstDish = combo.dishes?.[0]?.foodServiceId || {};
            const cardBanner = getMediaUrl(firstDish.imageUrl) || PLACEHOLDER_IMAGE;
            const dietType = firstDish.dietType || "Veg";
            const discountPct = combo.basePrice > combo.comboPrice
              ? Math.round(((combo.basePrice - combo.comboPrice) / combo.basePrice) * 100)
              : 0;

            const isComboActive = combo.isActive !== undefined ? combo.isActive : true;

            return (
              <div
                key={combo._id}
                className={`bg-white rounded-3xl border border-slate-100 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden text-left ${!isComboActive ? 'opacity-65' : ''
                  }`}
              >
                <div>
                  {/* Visual Header Banner */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img
                      src={cardBanner}
                      alt={combo.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="bg-black/50 backdrop-blur-sm text-white text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                        {combo.comboId || "COMBO"}
                      </span>
                      {renderDietBadge(dietType)}
                    </div>

                    {discountPct > 0 && (
                      <span className="absolute bottom-3 left-4 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm">
                        Save {discountPct}% Off
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-lg leading-snug line-clamp-1">{combo.name}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                        {combo.dishes?.length || 0} Bundled Dishes
                      </p>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {combo.description}
                    </p>

                    {/* Dot-Track for Included Dishes */}
                    <div className="space-y-3 py-2 border-t border-slate-100/70 mt-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Items included:</span>
                      <div className="relative pl-6 space-y-3">
                        <div className="absolute left-2 top-2 bottom-2 w-[1.5px] bg-slate-200" />

                        {(combo.dishes || []).map((item, idx) => {
                          const dishObj = item.foodServiceId || {};
                          return (
                            <div key={idx} className="relative flex items-center justify-between text-xs font-bold text-slate-700">
                              <span className="absolute -left-5 w-2 h-2 rounded-full bg-[#3d3f96] border border-white" />
                              <span className="truncate max-w-[180px]">{dishObj.name || "Dish"} <strong className="text-[#3d3f96]">x{item.quantity}</strong></span>
                              <span className="text-slate-400 font-mono">₹{(dishObj.price || 0) * item.quantity}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Price Details */}
                    <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-50 text-xs font-bold items-center bg-slate-50 p-3.5 rounded-2xl">
                      <div>
                        <span className="text-slate-400 block uppercase text-[10px]">Normal Price</span>
                        <span className="text-slate-400 text-sm line-through font-mono">₹{combo.basePrice}</span>
                      </div>
                      <div>
                        <span className="text-[#3d3f96] block uppercase text-[10px]">Combo Price</span>
                        <span className="text-[#3d3f96] text-xl font-black font-mono">₹{combo.comboPrice}</span>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-extrabold">
                        Spicy: {combo.spicyLevel}
                      </span>
                      {combo.isPopular && (
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg text-[10px] font-bold uppercase">
                          Popular
                        </span>
                      )}
                      {combo.isRecommended && (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-[10px] font-bold uppercase">
                          Recommended
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(combo)}
                      className="p-2 border border-slate-200 text-slate-400 hover:text-[#3d3f96] hover:bg-[#3d3f96]/5 rounded-xl transition-all cursor-pointer"
                      title="Edit Bundle Details"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => deleteCombo(combo._id)}
                      disabled={actionLoading}
                      className="p-2 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                      title="Delete Offer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Availability Toggle */}
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Available</span>
                    <button
                      type="button"
                      disabled={togglingId === combo._id}
                      onClick={() => toggleComboAvailability(combo._id)}
                      className="focus:outline-none transition-colors duration-200 cursor-pointer inline-flex items-center justify-center disabled:opacity-50"
                      title={isComboActive ? "Set Inactive" : "Set Active"}
                    >
                      {isComboActive ? (
                        <ToggleRight className="text-[#3d3f96]" size={28} />
                      ) : (
                        <ToggleLeft className="text-slate-300" size={28} />
                      )}
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* --- CREATE & EDIT COMBO OFFER MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col [&::-webkit-scrollbar]:hidden text-left">

            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#3d3f96]/10 text-[#3d3f96] flex items-center justify-center border border-[#3d3f96]/10">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg uppercase tracking-tight">
                    {modalMode === 'create' ? 'Assemble Combo Offer' : 'Update Combo Parameters'}
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Bundle your catalog recipes together at discounted rates</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={actionLoading}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Split Dual-Column Layout Workspace */}
            <form onSubmit={handleFormSubmit} className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto">

              {/* LEFT COLUMN: Core Combo Specifications */}
              <div className="space-y-5">
                <span className="block text-[10px] text-slate-400 font-black uppercase tracking-wider">1. Bundle Specifications</span>

                {/* Combo Name */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Combo Package Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Diabetic Couple Combo"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#3d3f96]"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Bundle Description</label>
                  <textarea
                    rows={2}
                    required
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Detail the campaign focus of this package bundle..."
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#3d3f96] resize-none leading-relaxed"
                  />
                </div>

                {/* Pricing Fields & Dynamic Savings Output */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Sum Base Price (Calculated)</label>
                    <input
                      type="text"
                      readOnly
                      value={`₹${calculatedBasePrice}`}
                      className="w-full px-4 py-2.5 bg-slate-100 border border-transparent rounded-xl text-xs font-black text-slate-500 cursor-not-allowed font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-baseline ml-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Combo Price (₹)</label>
                      {getLiveDiscountPct() > 0 && (
                        <span className="text-[10px] text-emerald-600 font-extrabold animate-pulse">({getLiveDiscountPct()}% Off)</span>
                      )}
                    </div>
                    <input
                      type="number"
                      required
                      value={formComboPrice}
                      onChange={(e) => setFormComboPrice(e.target.value)}
                      placeholder="e.g. 360"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#3d3f96]"
                    />
                  </div>
                </div>

                {/* Spiciness & Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Spicy Level</label>
                    <select
                      value={formSpicy}
                      onChange={(e) => setFormSpicy(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3d3f96] cursor-pointer"
                    >
                      <option value="Low (Mild)">Low (Mild)</option>
                      <option value="Medium (Regular)">Medium (Regular)</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="flex flex-col justify-end pb-2">
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formPopular}
                          onChange={() => setFormPopular(!formPopular)}
                          className="rounded border-slate-200 text-[#3d3f96] focus:ring-[#3d3f96]"
                        />
                        <span>Popular</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formRecommended}
                          onChange={() => setFormRecommended(!formRecommended)}
                          className="rounded border-slate-200 text-[#3d3f96] focus:ring-[#3d3f96]"
                        />
                        <span>Recommended</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={actionLoading}
                    className="px-6 py-3 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-8 py-3 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-950/10 flex items-center gap-1.5 cursor-pointer disabled:opacity-75"
                  >
                    {actionLoading ? <Loader2 size={13} className="animate-spin" /> : null}
                    <span>{modalMode === 'create' ? 'Create Combo' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: Interactive Dish Selector & Quantities Setup */}
              <div className="space-y-6">
                <span className="block text-[10px] text-slate-400 font-black uppercase tracking-wider">
                  2. Select Bundled Dishes ({selectedDishes.length} Chosen)
                </span>

                {/* Search Bar */}
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Search master catalog dishes..."
                    value={modalSearchQuery}
                    onChange={(e) => setModalSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#3d3f96] text-slate-700"
                  />
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                </div>

                {/* Food List Card Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden">
                  {loadingCatalog ? (
                    <div className="col-span-full py-8 text-center">
                      <Loader2 className="animate-spin text-[#3d3f96] mx-auto mb-2" size={24} />
                      <p className="text-xs font-bold text-slate-400 uppercase">Loading catalog...</p>
                    </div>
                  ) : filteredMasterDishes.length === 0 ? (
                    <div className="col-span-full py-6 text-center text-slate-400 text-xs font-bold">
                      No dishes matched your search.
                    </div>
                  ) : (
                    filteredMasterDishes.map((dish) => {
                      const isChecked = selectedDishes.some(d => d.foodServiceId === dish._id);
                      return (
                        <div
                          key={dish._id}
                          onClick={() => handleDishToggle(dish)}
                          className={`rounded-2xl border overflow-hidden cursor-pointer transition-all duration-200 relative flex flex-col justify-between bg-white ${isChecked
                              ? 'border-[#3d3f96] ring-2 ring-indigo-50 shadow-sm'
                              : 'border-slate-200 hover:border-slate-300'
                            }`}
                        >
                          <div className="relative h-16 w-full bg-slate-100">
                            <img
                              src={getMediaUrl(dish.imageUrl) || PLACEHOLDER_IMAGE}
                              alt={dish.name}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <span className="absolute bottom-1.5 left-2.5 text-white text-[10px] font-black font-mono">₹{dish.price}</span>

                            {isChecked && (
                              <span className="absolute top-2 right-2 bg-[#3d3f96] text-white p-1 rounded-full shadow-md z-20">
                                <Check size={10} strokeWidth={3.5} />
                              </span>
                            )}
                          </div>
                          <div className="p-2.5">
                            <h4 className="text-[11px] font-extrabold text-slate-900 truncate leading-tight">{dish.name}</h4>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Dynamic Quantity Controllers */}
                {selectedDishes.length > 0 && (
                  <div className="space-y-2.5 pt-4 border-t border-slate-100">
                    <span className="block text-[10px] text-slate-400 font-black uppercase tracking-wider">Configure Item Quantities</span>
                    <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden">
                      {selectedDishes.map((dish) => (
                        <div key={dish.foodServiceId} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold">
                          <span className="text-slate-800 truncate max-w-[180px]">{dish.name}</span>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleQtyChange(dish.foodServiceId, dish.quantity - 1)}
                              className="w-6 h-6 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-slate-900 font-black font-mono">{dish.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleQtyChange(dish.foodServiceId, dish.quantity + 1)}
                              className="w-6 h-6 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}