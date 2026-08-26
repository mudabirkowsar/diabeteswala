"use client";

import React, { useState, useEffect } from 'react';
import FoodAPI from '../../../../services/FoodVendorAPI';

export default function ComboBundles() {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDietType, setSelectedDietType] = useState('All');

  // Tracking detailed modal view states
  const [selectedCombo, setSelectedCombo] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchComboData();
  }, []);

  const fetchComboData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await FoodAPI.getVendorMasterCombos();
      if (response.success && Array.isArray(response.data)) {
        setCombos(response.data);
      } else {
        setError('The combo catalog data structure returned was unexpected.');
      }
    } catch (err) {
      setError(err?.message || 'Failed to fetch the master combo bundles catalog.');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  // Helper function to resolve relative backend image paths
  const getFullImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
    const cleanBackendUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${cleanBackendUrl}${cleanPath}`;
  };

  // Open single combo details with 404 safety fallback (Spec 2B)
  const handleOpenComboDetails = async (comboId) => {
    const localFallback = combos.find(combo => combo._id === comboId);
    setSelectedCombo(localFallback || { _id: comboId, name: "Loading..." });
    setModalLoading(true);
    setError(null);

    try {
      const response = await FoodAPI.getVendorComboById(comboId);
      if (response.success && response.data) {
        setSelectedCombo(response.data);
      } else if (localFallback) {
        setSelectedCombo(localFallback);
      }
    } catch (err) {
      if (localFallback) {
        console.warn("API returned error, falling back to local combo details gracefully:", err);
        setSelectedCombo(localFallback);
      } else {
        setSelectedCombo(null);
        setError(err?.message || 'Error occurred while loading single combo details.');
      }
    } finally {
      setModalLoading(false);
    }
  };

  // Toggle dynamic availability switch for combo bundles (Spec 2C, 2D)
  const handleToggleComboAvailability = async (comboId, isCurrentlyAvailable, e) => {
    e.stopPropagation(); // Avoid triggering details modal click
    setActionLoading(true);
    setError(null);

    try {
      if (isCurrentlyAvailable) {
        // Deselect item from active menu (Spec 2D)
        const response = await FoodAPI.deselectVendorCombo(comboId);
        if (response.success) {
          showNotification(response.message || 'Combo package marked as unavailable.');
          await fetchComboData();
        }
      } else {
        // Select master combos to menu (Spec 2C)
        const response = await FoodAPI.bulkSelectVendorCombos([comboId]);
        if (response.success) {
          showNotification(response.message || 'Combo package marked as available.');
          await fetchComboData();
        }
      }
    } catch (err) {
      setError(err?.message || 'Failed to modify combo availability status.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredCombos = combos.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDiet = selectedDietType === 'All' || item.dishes?.[0]?.foodServiceId?.dietType === selectedDietType;
    return matchesSearch && matchesDiet;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Block */}
        <div className="border-b border-slate-100 pb-6 mb-8">
          <h1 className="text-2xl font-extrabold leading-7 text-slate-900 sm:text-3xl tracking-tight">
            Combo Bundles
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 font-medium">
            Create high-value package offers by grouping multiple dishes at discount pricing. Click any card to view detailed specifications.
          </p>
        </div>

        {/* Action Banners */}
        {error && (
          <div className="mb-6 rounded-2xl bg-rose-50 p-4 border border-rose-100 animate-fade-in shadow-sm">
            <div className="flex items-center">
              <span className="text-rose-500 mr-2">⚠️</span>
              <p className="text-xs font-bold text-rose-800 uppercase tracking-wider">{error}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 rounded-2xl bg-emerald-50 p-4 border border-emerald-100 animate-fade-in shadow-sm">
            <div className="flex items-center">
              <span className="text-emerald-500 mr-2">✓</span>
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Filter Controls Area */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8 flex flex-col md:flex-row gap-6 justify-between items-center">
          <div className="w-full md:w-1/3">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Search Items</label>
            <input
              type="text"
              className="block w-full border border-slate-200 rounded-xl py-3 px-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D3F96]/10 focus:border-[#3D3F96] transition"
              placeholder="Filter by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="w-full md:w-auto flex flex-wrap gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Diet Category</label>
              <div className="inline-flex rounded-xl border border-slate-200 overflow-hidden bg-white p-1">
                {['All', 'Veg', 'Non Veg', 'Egg'].map((diet) => (
                  <button
                    key={diet}
                    type="button"
                    onClick={() => setSelectedDietType(diet)}
                    className={`px-4 py-2 text-xs font-extrabold rounded-lg focus:outline-none transition-colors ${
                      selectedDietType === diet
                        ? 'bg-[#3D3F96] text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {diet}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Loader */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-24 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3D3F96]"></div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Fetching combo bundles...</p>
          </div>
        ) : filteredCombos.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No matching combo packages found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
            {filteredCombos.map((combo) => {
              const firstDishImage = combo.dishes?.[0]?.foodServiceId?.imageUrl;
              const firstDishDietType = combo.dishes?.[0]?.foodServiceId?.dietType || 'Veg';
              const isCurrentlyActiveDb = !!combo.isAvailable;
              const savingsPercentage = combo.basePrice && combo.comboPrice 
                ? Math.round(((combo.basePrice - combo.comboPrice) / combo.basePrice) * 100) 
                : 0;

              return (
                <div 
                  key={combo._id}
                  onClick={() => handleOpenComboDetails(combo._id)}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition duration-200 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Dynamic Image Header Block */}
                    <div className="relative h-64 bg-slate-100 w-full">
                      {firstDishImage ? (
                        <img 
                          className="w-full h-full object-cover animate-fade-in" 
                          src={getFullImageUrl(firstDishImage)} 
                          alt={combo.name} 
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full bg-slate-100 text-slate-400 text-xs font-semibold">
                          No Image Available
                        </div>
                      )}
                      <span className="absolute top-4 left-4 bg-black/40 backdrop-blur-md text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg">
                        ID: {combo.comboId || 'CMB-801'}
                      </span>
                      <span className={`absolute top-4 right-4 inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase shadow-sm ${
                        firstDishDietType === 'Veg' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                      }`}>
                        {firstDishDietType}
                      </span>
                      {savingsPercentage > 0 && (
                        <span className="absolute bottom-4 left-4 bg-emerald-500/95 text-white text-[11px] font-extrabold uppercase px-3 py-1 rounded-lg shadow-sm animate-pulse">
                          SAVE {savingsPercentage}% OFF
                        </span>
                      )}
                    </div>

                    <div className="p-6 space-y-4">
                      <div>
                        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{combo.name}</h2>
                        <span className="inline-flex items-center text-[10px] font-extrabold text-indigo-500 uppercase tracking-wider mt-1">READY FOR DISPATCH</span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">{combo.description}</p>

                      <div className="space-y-2 border-t border-slate-50 pt-4">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Items Included:</h4>
                        <ul className="space-y-1.5">
                          {combo.dishes?.map((dish, idx) => (
                            <li key={idx} className="flex justify-between items-center text-xs">
                              <span className="text-slate-700 font-bold">
                                • {dish.foodServiceId?.name} <span className="text-slate-400 font-semibold">x{dish.quantity}</span>
                              </span>
                              <span className="text-slate-400 font-semibold">₹{dish.foodServiceId?.price}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    {/* Price Tag container */}
                    <div className="mx-6 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex justify-between items-center">
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Normal Price</p>
                        <p className="text-sm font-extrabold text-slate-400 line-through mt-0.5">₹{combo.basePrice}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Combo Price</p>
                        <p className="text-base font-black text-slate-900 mt-0.5">₹{combo.comboPrice}</p>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="p-6 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex space-x-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold">
                          Spicy: {combo.spicyLevel?.split(' ')?.[0] || 'Medium'}
                        </span>
                        {combo.isPopular && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-[10px] font-extrabold uppercase">
                            Popular
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2.5" onClick={(e) => e.stopPropagation()}>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {isCurrentlyActiveDb ? 'Available' : 'Unavailable'}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleToggleComboAvailability(combo._id, isCurrentlyActiveDb, e)}
                          disabled={actionLoading}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            isCurrentlyActiveDb ? 'bg-[#3D3F96]' : 'bg-slate-200'
                          }`}
                        >
                          <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            isCurrentlyActiveDb ? 'translate-x-5' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* COMBO DETAILS VIEW DIALOG MODAL */}
      {selectedCombo && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto animate-fade-in">
          <div className="absolute inset-0" onClick={() => setSelectedCombo(null)} />
          <div className="bg-white rounded-3xl border border-slate-100 max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl relative z-10 flex flex-col animate-scale-up">
            
            {/* Modal Image Header */}
            <div className="relative h-60 bg-slate-100 flex-shrink-0">
              {selectedCombo.dishes?.[0]?.foodServiceId?.imageUrl ? (
                <img 
                  className="w-full h-full object-cover" 
                  src={getFullImageUrl(selectedCombo.dishes?.[0]?.foodServiceId?.imageUrl)} 
                  alt={selectedCombo.name} 
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full text-slate-400 text-sm font-semibold">
                  {modalLoading ? "Loading image parameters..." : "No Image Available"}
                </div>
              )}
              {/* Close Button */}
              <button 
                onClick={() => setSelectedCombo(null)} 
                className="absolute top-4 right-4 bg-slate-950/40 hover:bg-slate-950/60 text-white rounded-full p-2 focus:outline-none transition"
              >
                <svg className="w-5 h-5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <span className={`absolute bottom-4 left-4 inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold shadow ${
                selectedCombo.dishes?.[0]?.foodServiceId?.dietType === 'Veg' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
              }`}>
                {selectedCombo.dishes?.[0]?.foodServiceId?.dietType || 'Veg'}
              </span>
            </div>

            {/* Scrollable Modal Content Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
              {modalLoading ? (
                <div className="flex flex-col justify-center items-center py-12 space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3D3F96]"></div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Fetching bundle properties...</p>
                </div>
              ) : (
                <>
                  {/* Name & Pricing Overview */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-[#3D3F96] uppercase tracking-wider">Package ID: {selectedCombo.comboId || 'CMB-801'}</span>
                      <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">{selectedCombo.name}</h2>
                    </div>
                    <div className="flex items-baseline space-x-2 bg-slate-50 border border-slate-100 px-3.5 py-1.5 rounded-xl">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wide mr-1">Bundle Price:</span>
                      <span className="text-base font-extrabold text-slate-900">₹{selectedCombo.comboPrice}</span>
                      <span className="text-xs font-semibold text-slate-400 line-through">₹{selectedCombo.basePrice}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Description</span>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{selectedCombo.description || "No item description provided."}</p>
                  </div>

                  {/* Preparation & Prep Status Grid */}
                  <div className="grid grid-cols-2 gap-4 bg-slate-50/50 rounded-2xl border border-slate-100 p-4">
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Spicy Level</p>
                      <p className="text-xs font-extrabold text-slate-700 mt-1">{selectedCombo.spicyLevel || 'Low (Mild)'}</p>
                    </div>
                    <div className="text-center border-l border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</p>
                      <p className="text-xs font-extrabold text-slate-700 mt-1">{selectedCombo.isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'}</p>
                    </div>
                  </div>

                  {/* Included Dishes Detail Blocks */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Included Dishes</span>
                    <div className="space-y-2">
                      {selectedCombo.dishes?.map((dish, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex justify-between items-center">
                          <div className="leading-tight">
                            <span className="text-xs font-bold text-slate-800">{dish.foodServiceId?.name}</span>
                            <span className="text-[10px] block text-slate-400 font-semibold mt-1">Diet: {dish.foodServiceId?.dietType} • Calories: {dish.foodServiceId?.calories} Kcal</span>
                          </div>
                          <span className="text-xs font-bold bg-[#3D3F96]/10 text-[#3D3F96] px-3 py-1 rounded-xl">Qty: x{dish.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Modal sticky close control */}
            <div className="border-t border-slate-100 p-6 flex justify-end flex-shrink-0 bg-white">
              <button onClick={() => setSelectedCombo(null)} className="px-5 py-2.5 bg-[#3D3F96] hover:bg-[#3D3F96]/95 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-[#3D3F96]/15">
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}