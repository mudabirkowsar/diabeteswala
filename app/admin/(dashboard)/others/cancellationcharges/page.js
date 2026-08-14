"use client";

import React, { useState } from 'react';
import {
  FaCog, FaEgg, FaCapsules, FaFlask, FaHeartbeat,
  FaCheckCircle, FaTimesCircle, FaSave, FaSyncAlt,
  FaInfoCircle, FaPercentage, FaRupeeSign, FaShieldAlt
} from 'react-icons/fa';
import { Toaster, toast } from 'react-hot-toast';

// ---- Dummy data (no API / context — fully local) ----
const dummySettings = {
  food: { enabled: true, chargeType: 'percentage', percentage: 10, fixedAmount: 50 },
  pharmacy: { enabled: true, chargeType: 'fixed', percentage: 5, fixedAmount: 30 },
  lab: { enabled: false, chargeType: 'percentage', percentage: 15, fixedAmount: 40 },
  doctor: { enabled: true, chargeType: 'percentage', percentage: 20, fixedAmount: 100 },
};

const serviceMeta = {
  food: { label: 'Food Delivery', icon: FaEgg, accent: '#F59E0B' },
  pharmacy: { label: 'Pharmacy', icon: FaCapsules, accent: '#10B981' },
  lab: { label: 'Lab Test', icon: FaFlask, accent: '#0EA5E9' },
  doctor: { label: 'Doctor Consultation', icon: FaHeartbeat, accent: '#EF4444' },
};

const themeBg = "bg-[#3D3F96]";
const themeHoverBg = "hover:bg-[#2C2D75]";
const themeText = "text-[#3D3F96]";
const themeRing = "focus:ring-[#3D3F96]/30";

const AdminCancellationSettings = () => {
  const [settings, setSettings] = useState(dummySettings);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const updateService = (service, patch) => {
    setSettings(prev => ({
      ...prev,
      [service]: { ...prev[service], ...patch }
    }));
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setSettings(dummySettings);
      setLoading(false);
      toast.success('Settings reset to defaults');
    }, 600);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Settings updated successfully!');
    }, 900);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center" style={{ height: '300px' }}>
        <div className="w-10 h-10 border-4 border-[#3D3F96]/20 border-t-[#3D3F96] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center shrink-0">
            <FaCog className="text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-800 tracking-tight leading-snug">Cancellation Settings</h2>
            <p className="text-xs text-gray-400">Configure cancellation charges per service line</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold uppercase tracking-wider transition-all focus:outline-none disabled:opacity-50"
          >
            <FaSyncAlt className="text-xs" /> Refresh
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all focus:outline-none shadow-lg shadow-[#3D3F96]/20 disabled:opacity-60 ${themeBg} ${themeHoverBg}`}
          >
            {saving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Saving...
              </>
            ) : (
              <>
                <FaSave className="text-xs" /> Save Settings
              </>
            )}
          </button>
        </div>
      </div>

      {/* Service Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.keys(serviceMeta).map((service) => {
          const meta = serviceMeta[service];
          const Icon = meta.icon;
          const s = settings[service] || {};

          return (
            <div
              key={service}
              className={`bg-white rounded-3xl border border-gray-100 p-5 flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.012)] hover:shadow-[0_15px_40px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden ${
                s.enabled ? 'border-l-4' : 'border-l-4 border-l-slate-200'
              }`}
              style={s.enabled ? { borderLeftColor: meta.accent } : {}}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${meta.accent}1A`, color: meta.accent }}
                  >
                    <Icon className="text-lg" />
                  </div>
                  <div>
                    <h5 className="text-sm font-black text-gray-800 tracking-tight leading-snug">{meta.label}</h5>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mt-0.5">
                      {service}
                    </span>
                  </div>
                </div>

                {/* Custom toggle switch */}
                <button
                  type="button"
                  onClick={() => updateService(service, { enabled: !s.enabled })}
                  className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 shrink-0 focus:outline-none ${
                    s.enabled ? themeBg : 'bg-gray-200'
                  }`}
                  style={{ height: '22px' }}
                  aria-pressed={s.enabled}
                >
                  <span
                    className={`absolute top-[3px] left-[3px] w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                      s.enabled ? 'translate-x-[18px]' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Charge Type Segmented Control */}
              <div className="mb-4">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Charge Type</label>
                <div className="grid grid-cols-2 gap-1.5 bg-gray-50 border border-gray-100 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => updateService(service, { chargeType: 'percentage' })}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all focus:outline-none ${
                      s.chargeType === 'percentage'
                        ? `text-white ${themeBg} shadow-sm`
                        : 'text-gray-500 hover:bg-white'
                    }`}
                  >
                    <FaPercentage className="text-[9px]" /> Percent
                  </button>
                  <button
                    type="button"
                    onClick={() => updateService(service, { chargeType: 'fixed' })}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all focus:outline-none ${
                      s.chargeType === 'fixed'
                        ? `text-white ${themeBg} shadow-sm`
                        : 'text-gray-500 hover:bg-white'
                    }`}
                  >
                    <FaRupeeSign className="text-[9px]" /> Fixed
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div className="mb-4">
                {s.chargeType === 'percentage' ? (
                  <>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Percentage</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={s.percentage ?? ''}
                        onChange={(e) => updateService(service, { percentage: e.target.value })}
                        min="0"
                        max="100"
                        step="0.1"
                        disabled={!s.enabled}
                        className={`w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-9 py-2.5 text-sm font-black text-gray-800 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">%</span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-semibold mt-1.5">Percentage of order value charged on cancellation</p>
                  </>
                ) : (
                  <>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Fixed Amount</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">₹</span>
                      <input
                        type="number"
                        value={s.fixedAmount ?? ''}
                        onChange={(e) => updateService(service, { fixedAmount: e.target.value })}
                        min="0"
                        step="0.01"
                        disabled={!s.enabled}
                        className={`w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-4 py-2.5 text-sm font-black text-gray-800 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 font-semibold mt-1.5">Flat amount charged on cancellation</p>
                  </>
                )}
              </div>

              {/* Status Footer */}
              <div className="mt-auto pt-3 border-t border-gray-50">
                {s.enabled ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-700">
                    <FaCheckCircle className="text-[10px]" /> Cancellation Enabled
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wide bg-slate-100 text-gray-500">
                    <FaTimesCircle className="text-[10px]" /> Cancellation Disabled
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Banner */}
      <div className="bg-[#3D3F96]/5 border border-[#3D3F96]/10 rounded-2xl p-4 flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center shrink-0 mt-0.5">
          <FaShieldAlt className="text-sm" />
        </div>
        <div className="text-xs text-gray-600 leading-relaxed font-semibold">
          <strong className={themeText}>Note:</strong> These settings apply to all future orders only. Changes will not affect orders that are already placed.
        </div>
      </div>
    </div>
  );
};

export default AdminCancellationSettings;