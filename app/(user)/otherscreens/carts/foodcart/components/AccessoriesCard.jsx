"use client";

import React, { useState, useEffect } from 'react';
import { Utensils, Plus, Minus, Check, Leaf, Package, Loader2, RefreshCw } from 'lucide-react';

// Import your API service functions & Notification Context
import UserAPI from '../../../../../services/UserAPI';
import { useNotification } from '../../../../../context/NotificationContext';

export default function AccessoriesCard({
  selectedAccessories = [],
  onUpdateAccessoryQty,
  optOutOfCutlery = false,
  onToggleOptOutCutlery,
  getMediaUrl
}) {
  const { showNotification } = useNotification();

  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Fetch Dynamic Addons from API ---
  const fetchAddonsList = async () => {
    setLoading(true);
    try {
      const response = await UserAPI.getFoodAddons();
      if (response && response.success) {
        setAddons(response.data || []);
      } else {
        if (showNotification) {
          showNotification("Could not load dining add-ons.", "error");
        }
      }
    } catch (err) {
      console.error("Error loading food addons:", err);
      if (showNotification) {
        showNotification(err.response?.data?.message || "Failed to load accessories.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddonsList();
  }, []);

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-5 sm:p-6 shadow-sm space-y-4 text-left">

      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-slate-50 pb-3">
        <div>
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
            <Utensils size={12} className="text-[#3d3f96]" /> Dining Accessories & Add-ons
          </span>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Add eco-cutlery, extra container bowls, or thermal pouches
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAddonsList}
          disabled={loading}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          title="Refresh add-ons"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Opt-out of Cutlery / Green Initiative Card */}
      <div
        onClick={onToggleOptOutCutlery}
        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${optOutOfCutlery
            ? 'bg-emerald-50/80 border-emerald-200 ring-2 ring-emerald-500/20'
            : 'bg-slate-50/70 border-slate-100 hover:bg-slate-50'
          }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${optOutOfCutlery ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
            <Leaf size={15} />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-800 tracking-tight">
              Don't send cutlery (Save Environment)
            </h4>
            <p className="text-[10px] text-slate-400 font-semibold">
              Help reduce single-use waste and packaging footprint
            </p>
          </div>
        </div>

        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${optOutOfCutlery ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'
          }`}>
          {optOutOfCutlery && <Check size={12} strokeWidth={3} />}
        </div>
      </div>

      {/* Dynamic Addons List */}
      {!optOutOfCutlery && (
        <div className="space-y-3 pt-1">
          {loading ? (
            <div className="py-8 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-[#3d3f96] mb-2" size={24} />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loading available add-ons...</p>
            </div>
          ) : addons.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4 italic font-semibold">
              No extra accessories available for this kitchen.
            </p>
          ) : (
            addons.map((item) => {
              const existing = selectedAccessories.find(a => a._id === item._id);
              const currentQty = existing?.quantity || 0;
              const addonImage = item.imageUrl ? getMediaUrl(item.imageUrl) : null;

              return (
                <div
                  key={item._id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${currentQty > 0
                      ? 'border-[#3d3f96] bg-indigo-50/20 ring-1 ring-[#3d3f96]/20'
                      : 'border-slate-100 bg-slate-50/40 hover:bg-slate-50/80'
                    }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Addon Image or Fallback Icon */}
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center text-[#3d3f96] shrink-0">
                      {addonImage ? (
                        <img
                          src={addonImage}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package size={16} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h5 className="text-xs font-black text-slate-800 tracking-tight truncate" title={item.name}>
                        {item.name}
                      </h5>
                      {item.description && (
                        <p className="text-[10px] text-slate-400 font-medium truncate" title={item.description}>
                          {item.description}
                        </p>
                      )}
                      <span className="text-[11px] font-mono font-black text-slate-900 mt-0.5 block">
                        +₹{item.price}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Modifier Buttons */}
                  <div className="shrink-0">
                    {currentQty > 0 ? (
                      <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                        <button
                          type="button"
                          onClick={() => onUpdateAccessoryQty(item, -1)}
                          className="w-6 h-6 bg-slate-50 hover:bg-slate-100 rounded-lg flex items-center justify-center text-slate-700 cursor-pointer"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="w-4 text-center text-xs font-black font-mono text-slate-900">
                          {currentQty}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateAccessoryQty(item, 1)}
                          className="w-6 h-6 bg-slate-50 hover:bg-slate-100 rounded-lg flex items-center justify-center text-slate-700 cursor-pointer"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onUpdateAccessoryQty(item, 1)}
                        className="px-3.5 py-1.5 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-[#3d3f96] text-[#3d3f96] text-[11px] font-black uppercase rounded-xl transition cursor-pointer shadow-sm"
                      >
                        + Add
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
}