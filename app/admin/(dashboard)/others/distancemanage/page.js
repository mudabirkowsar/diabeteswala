"use client";

import React, { useState } from 'react';
import {
  FaMapMarkerAlt, FaUserMd, FaClinicMedical, FaUtensils,
  FaPills, FaFlask, FaSyncAlt, FaSave, FaUndo, FaClock
} from 'react-icons/fa';
import { Toaster, toast } from 'react-hot-toast';

// ---- Dummy data (no API) ----
const initialLimits = {
  doctor: { label: 'Doctor Limit', icon: FaUserMd, accent: '#3D3F96', value: 30 },
  clinic: { label: 'Clinic Limit', icon: FaClinicMedical, accent: '#3D3F96', value: 22 },
  food: { label: 'Food Limit', icon: FaUtensils, accent: '#F59E0B', value: 50 },
  pharmacy: { label: 'Pharmacy Limit', icon: FaPills, accent: '#10B981', value: 21 },
  lab: { label: 'Lab Limit', icon: FaFlask, accent: '#0EA5E9', value: 20 },
};

const themeBg = "bg-[#3D3F96]";
const themeHoverBg = "hover:bg-[#2C2D75]";
const themeText = "text-[#3D3F96]";
const themeRing = "focus:ring-[#3D3F96]/30";

export default function MaxDistanceManagement() {
  const [limits, setLimits] = useState(initialLimits);
  const [draft, setDraft] = useState(initialLimits);
  const [activeTab, setActiveTab] = useState('view'); // 'view' | 'edit'
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const openEdit = () => {
    setDraft(limits);
    setActiveTab('edit');
  };

  const handleDraftChange = (key, value) => {
    setDraft(prev => ({
      ...prev,
      [key]: { ...prev[key], value: value === '' ? '' : Number(value) }
    }));
  };

  const handleCancelEdit = () => {
    setDraft(limits);
    setActiveTab('view');
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setLimits(draft);
      setLastUpdated(new Date());
      setSaving(false);
      setActiveTab('view');
      toast.success('Distance limits updated successfully!');
    }, 800);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLimits(initialLimits);
      setDraft(initialLimits);
      setLastUpdated(new Date());
      setLoading(false);
      toast.success('Limits refreshed');
    }, 600);
  };

  const formatDate = (date) => {
    return date.toLocaleString('en-US', {
      month: 'numeric', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
    });
  };

  const entries = Object.entries(limits);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center shrink-0">
            <FaMapMarkerAlt className="text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-800 tracking-tight leading-snug">Distance Limits</h2>
            <p className="text-xs text-gray-400">Set the maximum free-service radius for each category</p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold uppercase tracking-wider transition-all focus:outline-none disabled:opacity-50"
        >
          <FaSyncAlt className={`text-xs ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Card container */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-gray-100 px-6 pt-5">
          <button
            onClick={() => setActiveTab('view')}
            className={`pb-3 text-sm font-bold tracking-tight transition-all relative ${
              activeTab === 'view' ? 'text-gray-800' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            View Limits
            {activeTab === 'view' && (
              <span className={`absolute left-0 right-0 -bottom-px h-0.5 rounded-full ${themeBg}`} />
            )}
          </button>
          <button
            onClick={openEdit}
            className={`pb-3 text-sm font-bold tracking-tight transition-all relative ${
              activeTab === 'edit' ? 'text-gray-800' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Edit Limits
            {activeTab === 'edit' && (
              <span className={`absolute left-0 right-0 -bottom-px h-0.5 rounded-full ${themeBg}`} />
            )}
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'view' ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {entries.map(([key, item]) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={key}
                      className="flex items-center gap-4 bg-gray-50/70 border border-gray-100 rounded-2xl p-5 hover:shadow-[0_8px_24px_rgb(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${item.accent}1A`, color: item.accent }}
                      >
                        <Icon className="text-lg" />
                      </div>
                      <div>
                        <small className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">{item.label}</small>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-2xl font-black text-gray-800">{item.value}</span>
                          <span className="text-xs font-bold text-gray-400">km</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-50 text-[11px] font-semibold text-gray-400">
                <FaClock className="text-[10px]" />
                Last Updated: {formatDate(lastUpdated)}
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Object.entries(draft).map(([key, item]) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={key}
                      className="bg-gray-50/70 border border-gray-100 rounded-2xl p-5 flex flex-col gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${item.accent}1A`, color: item.accent }}
                        >
                          <Icon className="text-sm" />
                        </div>
                        <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">{item.label}</label>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          value={item.value}
                          onChange={(e) => handleDraftChange(key, e.target.value)}
                          disabled={saving}
                          className={`w-full bg-white border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 text-sm font-black text-gray-800 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all disabled:opacity-50`}
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">km</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-gray-50">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold uppercase tracking-wider transition-all focus:outline-none disabled:opacity-50"
                >
                  <FaUndo className="text-[10px]" /> Cancel
                </button>
                <button
                  type="button"
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
                      <FaSave className="text-xs" /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}