"use client";

import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  PlusCircle,
  Trash2,
  Phone,
  Mail,
  Search,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Eye,
  Clock,
  Home,
  Zap,
  ShieldCheck,
  MapPin,
  Star
} from 'lucide-react';

import ClinicAPI from '../../../../services/ClinicAPI'; // Adjust path if needed
import AddClinicLab from './components/AddClinicLab';
import ViewClinicLab from './components/ViewClinicLab';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.1.7:5002';

const getImageUrl = (path) => {
  if (!path) return 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=200';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:') || path.startsWith('data:')) {
    return path;
  }
  const cleanBase = BACKEND_URL.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

export default function ClinicLabsPage() {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedLabId, setSelectedLabId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Load clinic labs from API
  const fetchLabs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await ClinicAPI.getMyClinicLabs();
      if (res?.success && Array.isArray(res.data)) {
        setLabs(res.data);
      } else {
        setLabs([]);
      }
    } catch (err) {
      console.error("Failed to fetch clinic labs:", err);
      setError(err.response?.data?.message || "Could not load diagnostic labs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabs();
  }, []);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Toggle Active / Inactive Status
  const handleToggleStatus = async (e, labId) => {
    e.stopPropagation();
    try {
      const res = await ClinicAPI.toggleClinicLabStatus(labId);
      if (res?.success) {
        setLabs(prev =>
          prev.map(l => (l._id === labId ? { ...l, isActive: res.isActive } : l))
        );
        showToast(res.message || "Lab status updated successfully.");
      }
    } catch (err) {
      console.error("Toggle lab status failed:", err);
      showToast(err.response?.data?.message || "Status toggle failed.");
    }
  };

  // Delete Lab
  const handleDelete = async (e, lab) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to permanently delete "${lab.name}" and all diagnostic records?`)) return;

    try {
      const res = await ClinicAPI.deleteClinicLab(lab._id);
      if (res?.success) {
        setLabs(prev => prev.filter(l => l._id !== lab._id));
        showToast(`Lab "${lab.name}" deleted successfully.`);
      }
    } catch (err) {
      console.error("Delete lab failed:", err);
      alert(err.response?.data?.message || "Could not delete laboratory.");
    }
  };

  const handleLabAdded = (newLab) => {
    setLabs(prev => [newLab, ...prev]);
    showToast(`Lab "${newLab.name}" registered and submitted for approval!`);
  };

  const handleLabUpdated = (updatedLab, message) => {
    setLabs(prev =>
      prev.map(l => (l._id === (updatedLab._id || selectedLabId) ? { ...l, ...updatedLab } : l))
    );
    showToast(message || "Lab profile updated successfully!");
  };

  const handleRowClick = (labId) => {
    setSelectedLabId(labId);
    setShowViewModal(true);
  };

  // Search filtering
  const filteredLabs = labs.filter(lab => {
    const q = searchTerm.toLowerCase();
    const nameMatch = lab.name?.toLowerCase().includes(q);
    const phoneMatch = lab.phone?.includes(q);
    const cityMatch = lab.city?.toLowerCase().includes(q);
    return nameMatch || phoneMatch || cityMatch;
  });

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentList = filteredLabs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLabs.length / itemsPerPage);

  return (
    <div className="space-y-8 select-none">

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[999999] px-5 py-3 rounded-2xl bg-[#3D3F96] text-white text-xs font-bold shadow-2xl border border-white/20 flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 size={16} /> {toastMessage}
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Clinic Diagnostic Labs</h2>
          <p className="text-xs text-slate-400 mt-1">Manage diagnostic testing centers, NABL accreditations, home sample pickups, and operations.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#3D3F96] hover:bg-[#2C2E75] text-white text-xs font-bold tracking-wide transition-all shadow-lg shadow-indigo-950/10 self-start sm:self-auto"
        >
          <PlusCircle size={16} /> Add Lab
        </button>
      </div>

      {/* Registry Count & Search Filter */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Diagnostic Registry</span>
          <h4 className="text-xl font-black text-slate-800 mt-1">Laboratory Directory</h4>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search by lab name, phone, city..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:border-[#3D3F96] w-64 transition-all"
            />
          </div>

          <span className="inline-block px-4 py-2 rounded-2xl text-xs font-bold bg-[#3D3F96]/10 text-[#3D3F96] shrink-0">
            {filteredLabs.length} Registered Labs
          </span>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-center gap-3 text-rose-700 text-xs font-semibold">
          <AlertCircle size={18} className="shrink-0" /> {error}
          <button onClick={fetchLabs} className="underline font-bold ml-auto">Retry</button>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse align-middle">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                <th className="p-4 w-20">Lab</th>
                <th className="p-4">Diagnostic Name</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Location</th>
                <th className="p-4 text-center">Services</th>
                <th className="p-4 text-center">Approval</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-slate-400">
                    <Loader2 className="animate-spin text-2xl mx-auto mb-2 text-[#3D3F96]" size={24} />
                    <span className="text-xs font-medium">Loading clinic laboratories...</span>
                  </td>
                </tr>
              ) : currentList.length > 0 ? (
                currentList.map((lab) => (
                  <tr
                    key={lab._id}
                    onClick={() => handleRowClick(lab._id)}
                    className="hover:bg-indigo-50/10 cursor-pointer transition-all"
                  >
                    <td className="p-4">
                      <img
                        src={getImageUrl(lab.profileImage)}
                        alt={lab.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=200';
                        }}
                        className="w-11 h-11 rounded-xl object-cover border border-slate-100 shadow-sm"
                      />
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{lab.name}</div>
                      <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                        <span className="flex items-center text-amber-500 font-bold">
                          <Star size={11} className="fill-amber-400 stroke-amber-400 mr-0.5" />
                          {lab.rating || 5.0}
                        </span>
                        <span>•</span>
                        <span>{lab.documents?.nablNumber || 'Standard Lab'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <Phone size={11} className="text-slate-400" /> {lab.phone}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Mail size={11} className="text-slate-400" /> {lab.email || '-'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <MapPin size={11} className="text-slate-400" /> {lab.city || 'N/A'}, {lab.state || ''}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[140px]">{lab.address || '-'}</div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {lab.isHomeCollectionAvailable && (
                          <span className="p-1 rounded bg-indigo-50 text-[#3D3F96] text-[10px] font-bold" title="Home Sample Collection">
                            <Home size={13} />
                          </span>
                        )}
                        {lab.isRapidServiceAvailable && (
                          <span className="p-1 rounded bg-amber-50 text-amber-600 text-[10px] font-bold" title="Rapid Express Testing">
                            <Zap size={13} />
                          </span>
                        )}
                        {lab.isInsuranceAccepted && (
                          <span className="p-1 rounded bg-emerald-50 text-emerald-600 text-[10px] font-bold" title="Insurance Accepted">
                            <ShieldCheck size={13} />
                          </span>
                        )}
                        {lab.is24x7 && (
                          <span className="p-1 rounded bg-purple-50 text-purple-600 text-[10px] font-bold" title="24x7 Operations">
                            <Clock size={13} />
                          </span>
                        )}
                        {!lab.isHomeCollectionAvailable && !lab.isRapidServiceAvailable && !lab.isInsuranceAccepted && !lab.is24x7 && (
                          <span className="text-[10px] text-slate-400 font-semibold">Standard</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        lab.profileStatus === 'Approved'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : lab.profileStatus === 'Rejected'
                          ? 'bg-rose-50 text-rose-600 border border-rose-200'
                          : 'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}>
                        {lab.profileStatus || 'Pending'}
                      </span>
                    </td>
                    <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => handleToggleStatus(e, lab._id)}
                        className={`text-[11px] font-bold px-3 py-1 rounded-xl transition-all border ${
                          lab.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {lab.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRowClick(lab._id); }}
                          className="p-2 rounded-xl border border-slate-100 bg-white hover:bg-indigo-50 text-slate-400 hover:text-[#3D3F96] transition-all"
                          title="View / Edit Lab Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, lab)}
                          className="p-2 rounded-xl border border-slate-100 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-all"
                          title="Delete Lab"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-slate-400 font-bold">
                    <FlaskConical className="text-3xl mx-auto mb-2 text-indigo-400" size={32} />
                    <h5>No Diagnostic Labs Found</h5>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              Showing <strong className="text-slate-700">{indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredLabs.length)}</strong> of <strong className="text-slate-700">{filteredLabs.length}</strong>
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                className="p-2 rounded-xl border border-slate-100 bg-white disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronLeft size={14} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold ${
                    currentPage === i + 1 ? 'bg-[#3D3F96] text-white' : 'bg-white border border-slate-100 text-slate-600'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                className="p-2 rounded-xl border border-slate-100 bg-white disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- ADD MODAL --- */}
      {showAddModal && (
        <AddClinicLab
          onClose={() => setShowAddModal(false)}
          onLabAdded={handleLabAdded}
        />
      )}

      {/* --- VIEW & EDIT MODAL --- */}
      {showViewModal && selectedLabId && (
        <ViewClinicLab
          labId={selectedLabId}
          onClose={() => { setShowViewModal(false); setSelectedLabId(null); }}
          onLabUpdated={handleLabUpdated}
        />
      )}

    </div>
  );
}