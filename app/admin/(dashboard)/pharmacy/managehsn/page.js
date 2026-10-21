"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  Percent,
  Building2,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  X,
  Check,
  ShieldCheck
} from 'lucide-react';

// Adjust path based on your folder structure
import AdminAPI from '../../../../services/AdminAPI';

export default function HsnTaxConfigPage() {
  // --- Active Tab State ('master' | 'requests') ---
  const [activeTab, setActiveTab] = useState('master');

  // --- HSN Master States ---
  const [masterHsnList, setMasterHsnList] = useState([]);
  const [loadingMaster, setLoadingMaster] = useState(true);
  const [searchMasterTerm, setSearchMasterTerm] = useState('');

  // --- Create HSN Form State ---
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    hsnCode: '',
    description: '',
    totalGstPercent: ''
  });

  // --- Pharmacy Requests States ---
  const [requestsList, setRequestsList] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [searchRequestTerm, setSearchRequestTerm] = useState('');

  // --- Action Modal States (Approve / Reject) ---
  const [activeRequest, setActiveRequest] = useState(null);
  const [actionType, setActionType] = useState(null); // 'Approved' | 'Rejected'
  const [finalTaxPercent, setFinalTaxPercent] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  // --- Global Notification Feedback ---
  const [bannerError, setBannerError] = useState('');
  const [bannerSuccess, setBannerSuccess] = useState('');

  // Auto-dismiss alert notifications after 5 seconds
  useEffect(() => {
    if (bannerError || bannerSuccess) {
      const timer = setTimeout(() => {
        setBannerError('');
        setBannerSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [bannerError, bannerSuccess]);

  // --- 1. Fetch All Active HSN Master Codes ---
  const fetchMasterHsnList = async () => {
    setLoadingMaster(true);
    try {
      const res = await AdminAPI.getAllActiveHsnCodes();
      if (res && res.success) {
        setMasterHsnList(res.data || []);
      }
    } catch (err) {
      setBannerError(err.response?.data?.message || 'Failed to fetch HSN Master list.');
    } finally {
      setLoadingMaster(false);
    }
  };

  // --- 2. Fetch Pharmacy HSN Requests ---
  const fetchHsnRequests = async (status = selectedStatusFilter) => {
    setLoadingRequests(true);
    try {
      const params = status !== 'All' ? { status } : {};
      const res = await AdminAPI.getAdminPharmacyHsnRequests(params);
      if (res && res.success) {
        setRequestsList(res.data || []);
      }
    } catch (err) {
      setBannerError(err.response?.data?.message || 'Failed to load pharmacy HSN requests.');
    } finally {
      setLoadingRequests(false);
    }
  };

  // Initial Load
  useEffect(() => {
    fetchMasterHsnList();
    fetchHsnRequests();
  }, []);

  // Handle status filter change
  const handleStatusFilterChange = (status) => {
    setSelectedStatusFilter(status);
    fetchHsnRequests(status);
  };

  // --- Handle Create Master HSN Code ---
  const handleCreateHsnSubmit = async (e) => {
    e.preventDefault();
    setBannerError('');
    setBannerSuccess('');

    if (!formData.hsnCode.trim()) {
      setBannerError('HSN Code is required.');
      return;
    }
    if (!formData.description.trim()) {
      setBannerError('HSN Description is required.');
      return;
    }
    if (formData.totalGstPercent === '' || isNaN(Number(formData.totalGstPercent))) {
      setBannerError('A valid GST percentage is required.');
      return;
    }

    setCreating(true);
    try {
      const payload = {
        hsnCode: formData.hsnCode.trim(),
        description: formData.description.trim(),
        totalGstPercent: Number(formData.totalGstPercent)
      };

      const res = await AdminAPI.createAdminHsnMasterEntry(payload);
      if (res && res.success) {
        setBannerSuccess(res.message || 'HSN Code slab registered successfully!');
        setFormData({ hsnCode: '', description: '', totalGstPercent: '' });
        setIsCreateOpen(false);
        fetchMasterHsnList();
      } else {
        setBannerError(res?.message || 'Failed to register HSN code.');
      }
    } catch (err) {
      setBannerError(err.response?.data?.message || 'Error creating HSN code entry.');
    } finally {
      setCreating(false);
    }
  };

  // --- Action Modal Openers ---
  const openActionModal = (request, type) => {
    setActiveRequest(request);
    setActionType(type);
    setBannerError('');
    if (type === 'Approved') {
      setFinalTaxPercent(request.suggestedTaxPercent?.toString() || '12');
      setRejectionReason('');
    } else {
      setRejectionReason('');
      setFinalTaxPercent('');
    }
  };

  const closeActionModal = () => {
    setActiveRequest(null);
    setActionType(null);
    setFinalTaxPercent('');
    setRejectionReason('');
  };

  // --- Handle Review Decision Submit ---
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!activeRequest || !actionType) return;

    setProcessingAction(true);
    setBannerError('');

    try {
      let payload = { action: actionType };

      if (actionType === 'Approved') {
        if (finalTaxPercent !== '') {
          payload.finalTaxPercent = Number(finalTaxPercent);
        }
      } else if (actionType === 'Rejected') {
        if (!rejectionReason.trim()) {
          setBannerError('Please provide a valid rejection reason.');
          setProcessingAction(false);
          return;
        }
        payload.rejectionReason = rejectionReason.trim();
      }

      const res = await AdminAPI.reviewAdminPharmacyHsnRequest(activeRequest._id, payload);
      if (res && res.success) {
        setBannerSuccess(res.message || `Request successfully ${actionType.toLowerCase()}.`);
        closeActionModal();
        fetchHsnRequests();
        if (actionType === 'Approved') {
          fetchMasterHsnList();
        }
      } else {
        setBannerError(res?.message || 'Failed to process request.');
      }
    } catch (err) {
      setBannerError(err.response?.data?.message || 'Error occurred while reviewing request.');
    } finally {
      setProcessingAction(false);
    }
  };

  // --- Memoized Filtered Master List ---
  const filteredMasterList = useMemo(() => {
    return masterHsnList.filter((item) => {
      const q = searchMasterTerm.toLowerCase();
      return (
        item.hsnCode?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
      );
    });
  }, [masterHsnList, searchMasterTerm]);

  // --- Memoized Filtered Requests ---
  const filteredRequests = useMemo(() => {
    return requestsList.filter((req) => {
      const q = searchRequestTerm.toLowerCase();
      const code = req.hsnCode?.toLowerCase() || '';
      const desc = req.description?.toLowerCase() || '';
      const vendorName = req.vendorId?.name?.toLowerCase() || '';
      return code.includes(q) || desc.includes(q) || vendorName.includes(q);
    });
  }, [requestsList, searchRequestTerm]);

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-4 px-2 sm:px-3 lg:px-4 antialiased">
      <div className="max-w-[1500px] mx-auto space-y-6">
        
        {/* --- PAGE HEADER --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 bg-[#3d3f96]/10 text-[#3d3f96] rounded">
                <FileText size={16} />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#3d3f96]">
                Tax & Compliance Master
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">GST & HSN Master Management</h1>
            <p className="text-slate-500 font-medium text-xs mt-0.5">
              Manage centralized GST HSN tax slabs and inspect vendor requests.
            </p>
          </div>

          {/* Action Header Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                fetchMasterHsnList();
                fetchHsnRequests();
              }}
              title="Refresh Data"
              className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-[#3d3f96] hover:bg-slate-50 transition-all shadow-sm"
            >
              <RefreshCw size={16} className={loadingMaster || loadingRequests ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white rounded-lg font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus size={16} />
              <span>Add HSN Slab</span>
            </button>
          </div>
        </div>

        {/* --- STATUS ALERTS --- */}
        {bannerError && (
          <div className="flex items-center justify-between bg-[#EB333C]/10 border border-[#EB333C]/20 text-[#EB333C] px-4 py-3 rounded-lg text-xs font-semibold">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{bannerError}</span>
            </div>
            <button onClick={() => setBannerError('')} className="p-1 hover:bg-[#EB333C]/10 rounded">
              <X size={14} />
            </button>
          </div>
        )}

        {bannerSuccess && (
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-xs font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="shrink-0 text-emerald-600" />
              <span>{bannerSuccess}</span>
            </div>
            <button onClick={() => setBannerSuccess('')} className="p-1 hover:bg-emerald-100 rounded">
              <X size={14} />
            </button>
          </div>
        )}

        {/* --- TABS --- */}
        <div className="flex border-b border-slate-200 gap-8">
          <button
            onClick={() => setActiveTab('master')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'master'
                ? 'border-[#3d3f96] text-[#3d3f96]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck size={16} />
            HSN Master Registry ({masterHsnList.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'requests'
                ? 'border-[#3d3f96] text-[#3d3f96]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock size={16} />
            Pharmacy Custom Requests
            {requestsList.filter((r) => r.status === 'Pending').length > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#EB333C] text-white font-bold">
                {requestsList.filter((r) => r.status === 'Pending').length}
              </span>
            )}
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: ACTIVE MASTER TABLE                                */}
        {/* ========================================================= */}
        {activeTab === 'master' && (
          <div className="space-y-4">
            
            {/* Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  value={searchMasterTerm}
                  onChange={(e) => setSearchMasterTerm(e.target.value)}
                  placeholder="Filter HSN code or molecule..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                />
              </div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total: {filteredMasterList.length} Active Codes
              </span>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                      <th className="py-3 px-4 w-36">HSN Code</th>
                      <th className="py-3 px-4 min-w-[320px]">Molecule / Commodity Classification</th>
                      <th className="py-3 px-4 w-32">GST Rate</th>
                      <th className="py-3 px-4 w-32">Status</th>
                      <th className="py-3 px-4 w-36">Created On</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                    {loadingMaster ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          <Loader2 className="animate-spin text-[#3d3f96] mx-auto mb-2" size={24} />
                          <span className="font-bold text-[11px] uppercase tracking-wider">Loading HSN Registry...</span>
                        </td>
                      </tr>
                    ) : filteredMasterList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          No HSN Master entries found matching the filter.
                        </td>
                      </tr>
                    ) : (
                      filteredMasterList.map((item) => (
                        <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {item.hsnCode}
                          </td>
                          <td className="py-3 px-4 text-slate-600 leading-snug">
                            {item.description}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-[#3d3f96] border border-indigo-100">
                              {item.totalGstPercent}% GST
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                              <CheckCircle size={11} /> Active
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })
                              : '--'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PHARMACY HSN REQUESTS TABLE                        */}
        {/* ========================================================= */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            
            {/* Filter Toolbar */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
              <div className="relative w-full lg:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  value={searchRequestTerm}
                  onChange={(e) => setSearchRequestTerm(e.target.value)}
                  placeholder="Search HSN, medicine, or pharmacy..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                />
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1.5 w-full lg:w-auto overflow-x-auto">
                <span className="text-[11px] font-bold uppercase text-slate-400 mr-2 flex items-center gap-1 shrink-0">
                  <Filter size={12} /> Status:
                </span>
                {['All', 'Pending', 'Approved', 'Rejected'].map((status) => {
                  const isActive = selectedStatusFilter === status;
                  return (
                    <button
                      key={status}
                      onClick={() => handleStatusFilterChange(status)}
                      className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#3d3f96] text-white shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Requests Table */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                      <th className="py-3 px-4 w-32">HSN Code</th>
                      <th className="py-3 px-4 min-w-[200px]">Pharmacy Vendor</th>
                      <th className="py-3 px-4 min-w-[300px]">Molecule / Reason</th>
                      <th className="py-3 px-4 w-28">GST Slab</th>
                      <th className="py-3 px-4 w-28">Status</th>
                      <th className="py-3 px-4 w-28">Date</th>
                      <th className="py-3 px-4 w-36 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                    {loadingRequests ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          <Loader2 className="animate-spin text-[#3d3f96] mx-auto mb-2" size={24} />
                          <span className="font-bold text-[11px] uppercase tracking-wider">Loading Requests...</span>
                        </td>
                      </tr>
                    ) : filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          No requests found for current filter.
                        </td>
                      </tr>
                    ) : (
                      filteredRequests.map((req) => {
                        const isPending = req.status === 'Pending';
                        const isApproved = req.status === 'Approved';
                        const isRejected = req.status === 'Rejected';

                        return (
                          <tr key={req._id} className="hover:bg-slate-50/80 transition-colors">
                            
                            {/* HSN Code */}
                            <td className="py-3 px-4 font-mono font-bold text-slate-900 align-top">
                              {req.hsnCode}
                            </td>

                            {/* Pharmacy Vendor */}
                            <td className="py-3 px-4 align-top">
                              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                <Building2 size={13} className="text-[#3d3f96] shrink-0" />
                                <span className="truncate max-w-[180px]">{req.vendorId?.name || 'N/A'}</span>
                              </div>
                              <div className="text-[11px] text-slate-500 mt-1 space-y-0.5">
                                {req.vendorId?.phone && (
                                  <div className="flex items-center gap-1">
                                    <Phone size={11} className="text-slate-400" />
                                    <span>{req.vendorId.phone}</span>
                                  </div>
                                )}
                                {(req.vendorId?.city || req.vendorId?.address) && (
                                  <div className="flex items-center gap-1">
                                    <MapPin size={11} className="text-slate-400" />
                                    <span className="truncate max-w-[170px]">
                                      {[req.vendorId?.address, req.vendorId?.city].filter(Boolean).join(', ')}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Description & Remarks */}
                            <td className="py-3 px-4 align-top">
                              <p className="font-semibold text-slate-800 leading-snug">{req.description}</p>
                              
                              {req.reason && (
                                <p className="text-[11px] text-slate-500 mt-1">
                                  <span className="font-bold text-slate-600">Note: </span>
                                  {req.reason}
                                </p>
                              )}

                              {isRejected && req.rejectionReason && (
                                <p className="text-[11px] text-[#EB333C] bg-rose-50 border border-rose-100 p-1.5 rounded mt-1.5">
                                  <span className="font-bold">Rejection Note: </span>
                                  {req.rejectionReason}
                                </p>
                              )}
                            </td>

                            {/* GST Rate */}
                            <td className="py-3 px-4 align-top">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-[#3d3f96] border border-indigo-100">
                                {req.suggestedTaxPercent}% GST
                              </span>
                            </td>

                            {/* Status */}
                            <td className="py-3 px-4 align-top">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                                  isApproved
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : isRejected
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                              >
                                {isApproved && <CheckCircle size={10} />}
                                {isRejected && <XCircle size={10} />}
                                {isPending && <Clock size={10} />}
                                {req.status}
                              </span>
                            </td>

                            {/* Date */}
                            <td className="py-3 px-4 text-slate-500 text-[11px] align-top">
                              {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : '--'}
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-4 align-top text-center">
                              {isPending ? (
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => openActionModal(req, 'Approved')}
                                    title="Approve Request"
                                    className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-xs font-bold transition-all"
                                  >
                                    <Check size={14} />
                                  </button>
                                  <button
                                    onClick={() => openActionModal(req, 'Rejected')}
                                    title="Reject Request"
                                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-xs font-bold transition-all"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-400 font-semibold italic">Reviewed</span>
                              )}
                            </td>

                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 1: CREATE HSN MASTER SLAB                           */}
        {/* ========================================================= */}
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-md overflow-hidden">
              
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">New HSN Master Entry</h3>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateHsnSubmit} className="p-4 space-y-4">
                
                {/* HSN Code */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    HSN Code (6-8 Digits) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={formData.hsnCode}
                    onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value.replace(/\s+/g, '') })}
                    placeholder="e.g. 30049099"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-mono font-bold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                  />
                </div>

                {/* Total GST Percent */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    GST Slab Rate (%) *
                  </label>
                  <div className="relative">
                    <Percent className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="number"
                      required
                      min={0}
                      max={100}
                      step="0.01"
                      value={formData.totalGstPercent}
                      onChange={(e) => setFormData({ ...formData, totalGstPercent: e.target.value })}
                      placeholder="e.g. 12"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Molecule / Formulation Description *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g. Medicaments consisting of mixed or unmixed products for therapeutic uses..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-medium text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all resize-none"
                  />
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-3 py-2 rounded text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-4 py-2 bg-[#3d3f96] hover:bg-[#2d2f75] text-white rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
                  >
                    {creating && <Loader2 size={13} className="animate-spin" />}
                    <span>{creating ? 'Saving...' : 'Register Code'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 2: APPROVE / REJECT PHARMACY REQUEST                */}
        {/* ========================================================= */}
        {activeRequest && actionType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-md overflow-hidden">
              
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    {actionType === 'Approved' ? 'Approve HSN Entry' : 'Reject HSN Request'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    HSN: {activeRequest.hsnCode} | {activeRequest.vendorId?.name || 'Pharmacy'}
                  </p>
                </div>
                <button
                  onClick={closeActionModal}
                  className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleReviewSubmit} className="p-4 space-y-4">
                {actionType === 'Approved' ? (
                  <>
                    <div className="p-3 bg-emerald-50 rounded border border-emerald-200 text-emerald-800 text-xs font-medium leading-relaxed">
                      Approving will automatically activate this HSN Code in the Master Registry.
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Final GST Percentage (%)
                      </label>
                      <div className="relative">
                        <Percent className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step="0.01"
                          value={finalTaxPercent}
                          onChange={(e) => setFinalTaxPercent(e.target.value)}
                          placeholder={activeRequest.suggestedTaxPercent?.toString() || '12'}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Defaults to pharmacy's suggested rate ({activeRequest.suggestedTaxPercent}%) if unchanged.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3 bg-rose-50 rounded border border-rose-200 text-rose-800 text-xs font-medium leading-relaxed">
                      Please supply the exact reason for rejection so the vendor can resubmit correctly.
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Rejection Reason *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="e.g. This formulation falls under 18% GST under HSN 30049090, not 12%."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-medium text-slate-700 outline-none focus:border-rose-500 focus:bg-white transition-all resize-none"
                      />
                    </div>
                  </>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={closeActionModal}
                    className="px-3 py-2 rounded text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processingAction}
                    className={`px-4 py-2 text-white rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 disabled:opacity-60 cursor-pointer ${
                      actionType === 'Approved'
                        ? 'bg-[#3d3f96] hover:bg-[#2d2f75]'
                        : 'bg-rose-600 hover:bg-rose-700'
                    }`}
                  >
                    {processingAction && <Loader2 size={13} className="animate-spin" />}
                    <span>{processingAction ? 'Saving...' : `Confirm ${actionType}`}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}