// components/PharmacyItemsList.jsx
"use client";
import React from 'react';
import { Minus, Plus, Trash2, Loader2, Sparkles } from 'lucide-react';

export default function PharmacyItemsList({
  items = [],
  updatingId,
  onQtyChange,
  onRemoveItem,
  getMediaUrl,
  placeholderImage
}) {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-slate-100 shadow-sm space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-100">
        <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
          Prescribed & Healthcare Items ({items.length})
        </h3>
      </div>

      <div className="space-y-2.5 sm:space-y-3">
        {items.map((item, idx) => {
          const med = item.medicineId || {};
          const itemId = med._id || item.medicineId || item._id || idx;
          const isUpdating = updatingId === itemId;
          const isRx = med.prescription_required === "YES" || med.prescriptionRequired === "YES" || item.prescriptionRequired === "YES";
          const rawImg = med.image || item.image || (med.image_url && med.image_url[0]);
          const imgSrc = getMediaUrl(rawImg) || placeholderImage;

          return (
            <div
              key={itemId}
              className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50/60 flex items-center gap-2.5 sm:gap-4 transition-all"
            >
              {/* Thumbnail */}
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-white border border-slate-200/80 shrink-0">
                <img src={imgSrc} alt={item.name} className="w-full h-full object-cover" />
                {isRx && (
                  <span className="absolute top-1 left-1 bg-rose-500 text-white text-[7px] sm:text-[8px] font-black px-1.5 py-0.5 rounded shadow">
                    Rx
                  </span>
                )}
              </div>

              {/* Item Info */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-slate-400 truncate">
                    {med.manufacturers || "Verified Partner"}
                  </span>
                  {item.isComboApplied && (
                    <span className="inline-flex items-center gap-0.5 text-[7px] sm:text-[8px] font-black px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      <Sparkles size={8} /> Deal
                    </span>
                  )}
                </div>

                <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate mt-0.5" title={item.name}>
                  {item.name}
                </h4>

                <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 mt-0.5">
                  Unit Price: <span className="text-slate-800 font-black">₹{item.price}</span>
                </p>
              </div>

              {/* Stepper Controls */}
              <div className="flex items-center bg-white border border-slate-200 rounded-lg sm:rounded-xl p-0.5 sm:p-1 shadow-inner shrink-0">
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => onQtyChange(itemId, item.quantity, 'dec')}
                  className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 transition-colors disabled:opacity-40"
                >
                  <Minus size={11} />
                </button>

                <span className="w-6 sm:w-7 text-center text-[11px] sm:text-xs font-black text-slate-800">
                  {isUpdating ? <Loader2 size={10} className="animate-spin mx-auto text-[#3d3f96]" /> : item.quantity}
                </span>

                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => onQtyChange(itemId, item.quantity, 'inc')}
                  className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 transition-colors disabled:opacity-40"
                >
                  <Plus size={11} />
                </button>
              </div>

              {/* Price & Delete */}
              <div className="text-right shrink-0">
                <p className="text-xs sm:text-sm font-black text-slate-900">
                  ₹{(item.price * item.quantity).toLocaleString()}
                </p>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => onRemoveItem(itemId)}
                  className="text-slate-400 hover:text-rose-500 transition-colors p-1 mt-0.5 cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}