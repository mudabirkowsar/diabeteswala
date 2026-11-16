"use client";
import React, { useState, useMemo } from "react";
import { X, Edit3, IndianRupee, Percent, Clock, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import LabVendorAPI from "../../../../../services/LabVendorAPI";

export default function EditPackageModal({ isOpen, pkgData, onClose, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    packageName: pkgData?.packageName || "",
    mrp: pkgData?.mrp || "",
    discountPercent: pkgData?.discountPercent || 0,
    reportTime: pkgData?.reportTime || "12 Hours"
  });

  const offerPrice = useMemo(() => {
    const mrp = Number(formData.mrp) || 0;
    const discount = Number(formData.discountPercent) || 0;
    if (mrp <= 0) return 0;
    return Math.max(0, Math.round(mrp - mrp * (discount / 100)));
  }, [formData.mrp, formData.discountPercent]);

  if (!isOpen || !pkgData) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.mrp || Number(formData.mrp) <= 0) {
      return toast.error("Please enter a valid MRP greater than 0");
    }

    setSubmitting(true);
    try {
      const payload = {
        id: pkgData._id,
        mrp: Number(formData.mrp),
        discountPercent: Number(formData.discountPercent) || 0,
        reportTime: formData.reportTime?.trim() || "12 Hours"
      };

      if (pkgData.isCustom && formData.packageName) {
        payload.packageName = formData.packageName;
      }

      const res = await LabVendorAPI.updateLabPackage(payload);
      if (res && res.success) {
        toast.success(res.message || "Package updated successfully!");
        onSuccess();
      } else {
        toast.error(res?.message || "Failed to update package.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update package.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !submitting && onClose()} />

      <div className="bg-white rounded-[2rem] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Edit3 className="text-[#3d3f96]" size={18} /> Update Package Pricing
          </h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {pkgData.isCustom ? (
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Package Title</label>
              <input
                type="text"
                required
                value={formData.packageName}
                onChange={(e) => setFormData({ ...formData, packageName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white"
              />
            </div>
          ) : (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Package Name</span>
              <p className="text-xs font-bold text-slate-800">{pkgData.packageName}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">MRP (₹) *</label>
              <div className="relative">
                <IndianRupee size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.mrp}
                  onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Discount %</label>
              <div className="relative">
                <Percent size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discountPercent}
                  onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Turnaround Time</label>
            <div className="relative">
              <Clock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={formData.reportTime}
                onChange={(e) => setFormData({ ...formData, reportTime: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white"
              />
            </div>
          </div>

          <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Updated Offer Price</span>
              <span className="text-base font-black text-[#3d3f96]">₹ {offerPrice}</span>
            </div>
            <div className="text-right text-[10px] text-slate-500 font-semibold">
              Formula: ₹{formData.mrp || 0} - {formData.discountPercent || 0}%
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="py-3 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <span>Update Pricing</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}