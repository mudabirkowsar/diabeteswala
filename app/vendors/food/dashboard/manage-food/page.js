"use client";

import React, { useState, useEffect } from 'react';
import FoodAPI from '../../../../services/FoodVendorAPI';

export default function ManageFoodList() {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDietType, setSelectedDietType] = useState('All');
  const [selectedEffect, setSelectedEffect] = useState('All');

  // Tracking selection checklist states
  const [localSelections, setLocalSelections] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchCatalogData();
  }, []);

  const fetchCatalogData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await FoodAPI.getVendorMasterCatalog();
      if (response.success && Array.isArray(response.data)) {
        setCatalog(response.data);
        
        // Sync local selections with isAvailable property returned by the API
        const initialSelections = {};
        response.data.forEach(item => {
          initialSelections[item._id] = !!item.isAvailable;
        });
        setLocalSelections(initialSelections);
      } else {
        setError('The catalog data structure returned was unexpected.');
      }
    } catch (err) {
      setError(err?.message || 'Failed to fetch the vendor master catalog.');
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

  // Open detail modal and fetch comprehensive meal properties dynamically (Spec 2)
  const handleOpenDetails = async (itemId) => {
    const localItemFallback = catalog.find(item => item._id === itemId);
    
    // Instantly set pre-loaded local details to keep UI responsive
    setSelectedItem(localItemFallback || { _id: itemId, name: "Loading..." });
    setModalLoading(true);
    setError(null);

    try {
      const response = await FoodAPI.getVendorMealById(itemId);
      if (response.success && response.data) {
        setSelectedItem(response.data);
      } else if (localItemFallback) {
        setSelectedItem(localItemFallback);
      } else {
        setError('Failed to fetch individual meal detail properties.');
      }
    } catch (err) {
      // Suppress 404 and use the available item details from the catalog list
      if (localItemFallback) {
        console.warn("Details API returned 404 error. Gracefully falling back to local catalog data:", err);
        setSelectedItem(localItemFallback);
      } else {
        setSelectedItem(null);
        setError(err?.message || 'Error occurred while loading single meal details.');
      }
    } finally {
      setModalLoading(false);
    }
  };

  // Checkbox & Toggle Switch interactions mapping to Select/Deselect specs
  const handleCheckboxChange = async (itemId, isCurrentlySelectedDb, e) => {
    e.stopPropagation(); // Avoid triggering details modal click
    
    if (isCurrentlySelectedDb) {
      // If the item is active on DB, deselecting instantly calls deselect API (Spec 4)
      setActionLoading(true);
      setError(null);
      try {
        const response = await FoodAPI.deselectVendorMeal(itemId);
        if (response.success) {
          showNotification(response.message || 'Item marked as Unavailable.');
          await fetchCatalogData();
        }
      } catch (err) {
        setError(err?.message || 'Failed to deselect meal item.');
      } finally {
        setActionLoading(false);
      }
    } else {
      // Toggle local checklist state before bulk select save
      setLocalSelections(prev => ({
        ...prev,
        [itemId]: !prev[itemId]
      }));
    }
  };

  // Bulk select publishing (Spec 3)
  const handleBulkSave = async () => {
    setActionLoading(true);
    setError(null);

    // Collect all newly selected item IDs
    const selectedIds = Object.keys(localSelections).filter(
      id => localSelections[id] === true
    );

    try {
      const response = await FoodAPI.bulkSelectVendorMeals(selectedIds);
      if (response.success) {
        showNotification(response.message || 'Menu items added to active catalog successfully.');
        await fetchCatalogData();
      }
    } catch (err) {
      setError(err?.message || 'Failed to complete menu selection publication.');
    } finally {
      setActionLoading(false);
    }
  };

  // Compare local checklist modifications against saved DB states
  const hasPendingChanges = () => {
    return catalog.some(item => {
      const dbVal = !!item.isAvailable;
      const localVal = !!localSelections[item._id];
      return dbVal !== localVal;
    });
  };

  // Search & filter logic
  const filteredCatalog = catalog.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDiet = selectedDietType === 'All' || item.dietType === selectedDietType;
    const matchesEffect = selectedEffect === 'All' || item.foodEffectCategory === selectedEffect;

    return matchesSearch && matchesDiet && matchesEffect;
  });

  // Group items dynamically by categoryId name (Figma reference categories)
  const groupedCatalog = filteredCatalog.reduce((groups, item) => {
    const categoryName = item.categoryId?.foodCategory || 'General Catalog';
    if (!groups[categoryName]) {
      groups[categoryName] = [];
    }
    groups[categoryName].push(item);
    return groups;
  }, {});

  const uniqueEffects = ['All', ...new Set(catalog.map(i => i.foodEffectCategory).filter(Boolean))];

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Block */}
        <div className="md:flex md:items-center md:justify-between border-b border-slate-100 pb-6 mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-extrabold leading-7 text-slate-900 sm:text-3xl tracking-tight">
              Tiffin & Meals Inventory
            </h1>
            <p className="mt-1.5 text-sm text-slate-500 font-medium">
              Check master meals to add to your menu, or uncheck to instantly make them unavailable. Click any row to view full details.
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              onClick={handleBulkSave}
              disabled={actionLoading || !hasPendingChanges()}
              className={`inline-flex items-center px-6 py-3 border border-transparent rounded-2xl shadow-lg shadow-[#3D3F96]/10 text-xs font-bold text-white uppercase tracking-wider transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3D3F96] ${
                hasPendingChanges() && !actionLoading
                  ? 'bg-[#3D3F96] hover:bg-[#3D3F96]/95 hover:shadow-xl'
                  : 'bg-slate-300 cursor-not-allowed shadow-none'
              }`}
            >
              {actionLoading ? 'Saving...' : 'Save & Publish Menu'}
            </button>
          </div>
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

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Health Tag</label>
              <select
                className="block w-full border border-slate-200 rounded-xl py-3 px-4 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#3D3F96]/10 focus:border-[#3D3F96] transition"
                value={selectedEffect}
                onChange={(e) => setSelectedEffect(e.target.value)}
              >
                {uniqueEffects.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Inventory Table Container */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-24 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3D3F96]"></div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Fetching catalog details...</p>
          </div>
        ) : filteredCatalog.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No matching results found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 table-fixed">
                <thead className="bg-[#FAFBFD]">
                  <tr>
                    <th scope="col" className="w-[10%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Select
                    </th>
                    <th scope="col" className="w-[32%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Food Details
                    </th>
                    <th scope="col" className="w-[26%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Description
                    </th>
                    <th scope="col" className="w-[12%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Pricing
                    </th>
                    <th scope="col" className="w-[20%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Nutrition & Size
                    </th>
                    <th scope="col" className="w-[15%] px-6 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Availability
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {Object.keys(groupedCatalog).map((categoryName) => (
                    <React.Fragment key={categoryName}>
                      
                      {/* Section Category Header */}
                      <tr className="bg-[#FAFBFD] border-t border-b border-slate-100">
                        <td colSpan="6" className="px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                              {/* Folder/Category Icon */}
                              <svg className="w-5 h-5 text-[#3D3F96] stroke-[2.2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21V9.75M3.284 14.253A8.998 8.998 0 0112 3c3.812 0 7.07 2.36 8.351 5.7M3.284 14.253h17.432M3.284 14.253L12 9.75l8.716 4.503M12 3v6.75" />
                              </svg>
                              <span className="text-xs font-extrabold text-[#3D3F96] tracking-wider uppercase">
                                {categoryName}
                              </span>
                            </div>
                            <span className="text-[10px] font-extrabold bg-[#3D3F96]/10 text-[#3D3F96] px-3 py-1 rounded-full uppercase tracking-wider">
                              {groupedCatalog[categoryName].length} Items
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* Items under Category */}
                      {groupedCatalog[categoryName].map((item) => {
                        const isCheckedLocal = !!localSelections[item._id];
                        const isCurrentlyActiveDb = !!item.isAvailable;

                        return (
                          <tr 
                            key={item._id} 
                            onClick={() => handleOpenDetails(item._id)}
                            className="hover:bg-slate-50/50 transition-colors duration-150 cursor-pointer"
                            title="Click to view full details"
                          >
                            {/* Checkbox Selector (Propagation stopped to prevent opening detailed modal) */}
                            <td 
                              className="px-6 py-5 whitespace-nowrap text-left"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                checked={isCheckedLocal}
                                disabled={actionLoading}
                                onChange={(e) => handleCheckboxChange(item._id, isCurrentlyActiveDb, e)}
                                className="h-5 w-5 text-[#3D3F96] focus:ring-[#3D3F96] border-slate-300 rounded cursor-pointer transition"
                              />
                            </td>

                            {/* Food Details */}
                            <td className="px-6 py-5 whitespace-nowrap">
                              <div className="flex items-center space-x-4">
                                {/* Customized Diet Indicator Box */}
                                <div className="flex-shrink-0">
                                  {item.dietType === 'Veg' ? (
                                    <div className="w-5 h-5 border-2 border-emerald-500 p-0.5 rounded flex items-center justify-center">
                                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                    </div>
                                  ) : item.dietType === 'Non Veg' ? (
                                    <div className="w-5 h-5 border-2 border-rose-500 p-0.5 rounded flex items-center justify-center">
                                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                                    </div>
                                  ) : (
                                    <div className="w-5 h-5 border-2 border-amber-500 p-0.5 rounded flex items-center justify-center">
                                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                    </div>
                                  )}
                                </div>

                                {/* Rounded Preview Image */}
                                <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                                  {item.imageUrl ? (
                                    <img
                                      className="h-full w-full object-cover animate-fade-in"
                                      src={item.imageUrl}
                                      alt={item.name}
                                    />
                                  ) : (
                                    <div className="h-full w-full flex items-center justify-center text-slate-300">
                                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                    </div>
                                  )}
                                </div>

                                {/* Text Details */}
                                <div className="leading-tight">
                                  <div className="text-[13px] font-bold text-slate-800 line-clamp-1">{item.name}</div>
                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                                    {item.categoryId?.foodEffectCategory || 'GENERAL'}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Description */}
                            <td className="px-6 py-5">
                              <p className="text-[12px] text-slate-500 leading-relaxed line-clamp-2 pr-4 font-medium">
                                {item.description || 'No description provided.'}
                              </p>
                            </td>

                            {/* Pricing */}
                            <td className="px-6 py-5 whitespace-nowrap">
                              <div className="flex items-baseline space-x-1.5">
                                {item.discountPrice ? (
                                  <>
                                    <span className="text-sm font-extrabold text-slate-800">₹{item.discountPrice}</span>
                                    <span className="text-[11px] font-semibold text-slate-400 line-through">₹{item.price}</span>
                                  </>
                                ) : (
                                  <span className="text-sm font-extrabold text-slate-800">₹{item.price}</span>
                                )}
                              </div>
                            </td>

                            {/* Nutrition & Size */}
                            <td className="px-6 py-5">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  {item.calories && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#3D3F96]/10 text-[#3D3F96] text-[10px] font-bold">
                                      {item.calories} Kcal
                                    </span>
                                  )}
                                  <span className="text-[11px] font-bold text-slate-500">Size: {item.servingSize || '1 Person'}</span>
                                </div>
                                <div className="text-[10px] text-slate-400 font-semibold truncate max-w-[180px]">
                                  Ingredients: {Array.isArray(item.ingredients) ? item.ingredients.slice(0, 3).join(', ') : 'Fresh Greens'}
                                </div>
                              </div>
                            </td>

                            {/* Switch Availability Toggle (Propagation stopped to prevent opening detailed modal) */}
                            <td 
                              className="px-6 py-5 whitespace-nowrap text-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={(e) => handleCheckboxChange(item._id, isCurrentlyActiveDb, e)}
                                disabled={actionLoading}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                  isCheckedLocal ? 'bg-[#3D3F96]' : 'bg-slate-200'
                                }`}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                    isCheckedLocal ? 'translate-x-5' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* DETAILS VIEW DIALOG MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto animate-fade-in">
          {/* Backdrop Closer */}
          <div className="absolute inset-0" onClick={() => setSelectedItem(null)} />

          {/* Modal Container */}
          <div className="bg-white rounded-3xl border border-slate-100 max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl relative z-10 flex flex-col animate-scale-up">
            
            {/* Modal Header banner/image */}
            <div className="relative h-60 bg-slate-100 flex-shrink-0">
              {selectedItem.imageUrl ? (
                <img
                  className="w-full h-full object-cover"
                  src={selectedItem.imageUrl}
                  alt={selectedItem.name}
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full text-slate-400 text-sm font-semibold">
                  {modalLoading ? "Loading Image..." : "No Image Available"}
                </div>
              )}
              {/* Close Button */}
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 bg-slate-950/40 hover:bg-slate-950/60 text-white rounded-full p-2 focus:outline-none transition"
              >
                <svg className="w-5 h-5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Diet Tag */}
              <span className={`absolute bottom-4 left-4 inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold shadow ${
                selectedItem.dietType === 'Veg' 
                  ? 'bg-emerald-500 text-white' 
                  : selectedItem.dietType === 'Non Veg'
                  ? 'bg-rose-500 text-white'
                  : 'bg-amber-500 text-white'
              }`}>
                {selectedItem.dietType || 'Veg'}
              </span>
            </div>

            {/* Scrollable Modal Content Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
              {modalLoading ? (
                <div className="flex flex-col justify-center items-center py-12 space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3D3F96]"></div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Fetching full properties...</p>
                </div>
              ) : (
                <>
                  {/* Name & Pricing Overview */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-[#3D3F96] uppercase tracking-wider">
                        {selectedItem.categoryId?.foodCategory || 'General Catalog'} • {selectedItem.categoryId?.foodEffectCategory || 'General'}
                      </span>
                      <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
                        {selectedItem.name}
                      </h2>
                    </div>
                    <div className="flex items-baseline space-x-2 bg-slate-50 border border-slate-100 px-3.5 py-1.5 rounded-xl">
                      {selectedItem.discountPrice ? (
                        <>
                          <span className="text-base font-extrabold text-slate-900">₹{selectedItem.discountPrice}</span>
                          <span className="text-xs font-semibold text-slate-400 line-through">₹{selectedItem.price}</span>
                        </>
                      ) : (
                        <span className="text-base font-extrabold text-slate-900">₹{selectedItem.price}</span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Description</span>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {selectedItem.description || "No item description provided."}
                    </p>
                  </div>

                  {/* Preparation & Prep Status Grid */}
                  <div className="grid grid-cols-3 gap-4 bg-slate-50/50 rounded-2xl border border-slate-100 p-4">
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Prep Time</p>
                      <p className="text-xs font-extrabold text-slate-700 mt-1">{selectedItem.prepTime || '15'} Mins</p>
                    </div>
                    <div className="text-center border-x border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Serving Size</p>
                      <p className="text-xs font-extrabold text-slate-700 mt-1">{selectedItem.servingSize || '1 Person'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Spicy Level</p>
                      <p className="text-xs font-extrabold text-slate-700 mt-1">{selectedItem.spicyLevel || 'Low (Mild)'}</p>
                    </div>
                  </div>

                  {/* Nutritional Matrix Dashboard */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Nutritional Statistics</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-slate-400">Calories</span>
                        <span className="text-sm font-extrabold text-slate-800 mt-1">{selectedItem.calories || '0'} Kcal</span>
                      </div>
                      <div className="bg-[#3D3F96]/5 border border-[#3D3F96]/10 rounded-2xl p-3 flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-[#3D3F96]">Glycemic Index</span>
                        <span className="text-sm font-extrabold text-[#3D3F96] mt-1">{selectedItem.glycemicIndex ?? '0'} GI</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-slate-400">Net Carbs</span>
                        <span className="text-sm font-extrabold text-slate-800 mt-1">{selectedItem.netCarbs ?? '0'}g</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-slate-400">Sodium</span>
                        <span className="text-sm font-extrabold text-slate-800 mt-1">{selectedItem.sodium ?? '0'} mg</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-slate-400">Potassium</span>
                        <span className="text-sm font-extrabold text-slate-800 mt-1">{selectedItem.potassium ?? '0'} mg</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-slate-400">Phosphorus</span>
                        <span className="text-sm font-extrabold text-slate-800 mt-1">{selectedItem.phosphorus ?? '0'} mg</span>
                      </div>
                    </div>
                  </div>

                  {/* Ingredients Array Block */}
                  {Array.isArray(selectedItem.ingredients) && selectedItem.ingredients.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Raw Ingredients</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.ingredients.map((ing, idx) => (
                          <span key={idx} className="bg-slate-50 border border-slate-100 text-slate-600 text-[11px] font-bold px-3 py-1 rounded-xl">
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags Array Block */}
                  {Array.isArray(selectedItem.tags) && selectedItem.tags.length > 0 && (
                    <div className="space-y-2 border-t border-slate-100 pt-4">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Food Tags</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.tags.map((tag, idx) => (
                          <span key={idx} className="bg-[#3D3F96]/10 text-[#3D3F96] text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Bottom Sticky Control */}
            <div className="border-t border-slate-100 p-6 flex justify-end flex-shrink-0 bg-white">
              <button 
                onClick={() => setSelectedItem(null)}
                className="px-5 py-2.5 bg-[#3D3F96] hover:bg-[#3D3F96]/95 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-[#3D3F96]/15"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}