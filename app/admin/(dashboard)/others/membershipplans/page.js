"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { 
  FaCrown, FaStethoscope, FaTruck, FaPills, FaFlask, FaEdit, 
  FaTrash, FaPlus, FaTimes, FaSearch, FaFilter, 
  FaInfoCircle, FaUndo, FaSync, FaEye, FaPlusCircle, FaArrowRight, FaBoxOpen,
  FaUtensils
} from 'react-icons/fa';
import { Toaster, toast } from 'react-hot-toast';

// 1. Standalone Mock Database for Membership Plans (Directly matching your screen contents)
const initialPlansMock = [
  {
    _id: "p1",
    planName: "Ultra",
    description: "just for a limited period of time. A ultra premium plan",
    price: 7000,
    discountPercentage: 20,
    durationDays: 60,
    consultationLimit: 100,
    labDeliveryLimit: 100,
    foodDeliveryLimit: 100,
    pharmacyDeliveryLimit: 100,
    features: [
      "Free consultations for 90 days",
      "Priority support",
      "Health tracking",
      "Medicine reminders"
    ],
    isActive: true,
    showDiscounts: true,
    BloodSugar: ["Normal", "Pre-diabetic", "Diabetic Type 1", "Diabetic Type 2"],
    BloodSugarDiscounts: [0, 5, 10, 15],
    AgeGroup: ["18-25", "26-35", "36-50", "51-65", "66+"],
    AgeGroupDiscounts: [0, 3, 5, 8, 10],
    HadDiabetes: ["Yes", "No", "Family History", "Gestational"],
    HadDiabetesDiscounts: [0, 10, 5, 8],
    LifeStyle: ["Very Active", "Active", "Moderate", "Sedentary"],
    LifeStyleDiscounts: [5, 3, 0, 0]
  },
  {
    _id: "p2",
    planName: "Begginer",
    description: "Basic Plan 45 Days",
    price: 4500,
    discountPercentage: 10,
    durationDays: 45,
    consultationLimit: 8,
    labDeliveryLimit: 2,
    foodDeliveryLimit: 3,
    pharmacyDeliveryLimit: 4,
    features: [
      "Free consultations for 90 days",
      "30 consultation limit",
      "Diabetes lifestyle coaching"
    ],
    isActive: true,
    showDiscounts: true,
    BloodSugar: ["Normal", "Pre-diabetic", "Diabetic Type 1"],
    BloodSugarDiscounts: [0, 5, 10],
    AgeGroup: ["18-25", "26-35", "36-50"],
    AgeGroupDiscounts: [0, 3, 5],
    HadDiabetes: ["Yes", "No"],
    HadDiabetesDiscounts: [0, 10],
    LifeStyle: ["Moderate", "Sedentary"],
    LifeStyleDiscounts: [0, 0]
  },
  {
    _id: "p3",
    planName: "Premium Plan - 90 Days",
    description: "90 days premium membership with higher consultation limits",
    price: 3999,
    discountPercentage: 10,
    durationDays: 90,
    consultationLimit: 30,
    labDeliveryLimit: 5,
    foodDeliveryLimit: 5,
    pharmacyDeliveryLimit: 5,
    features: [
      "Free consultations for 90 days",
      "30 consultation limit",
      "Premium clinical support"
    ],
    isActive: true,
    showDiscounts: true,
    BloodSugar: ["Normal", "Pre-diabetic", "Diabetic Type 1", "Diabetic Type 2"],
    BloodSugarDiscounts: [0, 5, 10, 15],
    AgeGroup: ["18-25", "26-35", "36-50", "51-65", "66+"],
    AgeGroupDiscounts: [0, 3, 5, 8, 10],
    HadDiabetes: ["Yes", "No", "Family History", "Gestational"],
    HadDiabetesDiscounts: [0, 10, 5, 8],
    LifeStyle: ["Very Active", "Active", "Moderate", "Sedentary"],
    LifeStyleDiscounts: [5, 3, 0, 0]
  }
];

export default function MembershipPlansList() {
  const [membershipPlans, setMembershipPlans] = useState(initialPlansMock);
  const [filters, setFilters] = useState({
    status: 'active',
    limit: 10,
    search: ''
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  
  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [discountMatrixData, setDiscountMatrixData] = useState(null);

  // Theme Color Tokens based on #3D3F96
  const themeBg = "bg-[#3D3F96]";
  const themeText = "text-[#3D3F96]";
  const themeHoverBg = "hover:bg-[#2C2D75]";
  const themeShadow = "shadow-[#3D3F96]/20";
  const themeRing = "focus:ring-[#3D3F96]/30";
  
  const initialFormState = {
    planName: '',
    description: '',
    durationDays: 90,
    consultationLimit: 30,
    labDeliveryLimit: 0,
    foodDeliveryLimit: 0,
    pharmacyDeliveryLimit: 0,
    price: 0,
    discountPercentage: 10,
    features: ["Free consultations for 90 days", "Priority support"],
    BloodSugar: ["Normal", "Pre-diabetic", "Diabetic Type 1", "Diabetic Type 2"],
    BloodSugarDiscounts: [0, 5, 10, 15],
    AgeGroup: ["18-25", "26-35", "36-50", "51-65", "66+"],
    AgeGroupDiscounts: [0, 3, 5, 8, 10],
    HadDiabetes: ["Yes", "No", "Family History", "Gestational"],
    HadDiabetesDiscounts: [0, 10, 5, 8],
    LifeStyle: ["Very Active", "Active", "Moderate", "Sedentary"],
    LifeStyleDiscounts: [5, 3, 0, 0],
    showDiscounts: true
  };

  const [formData, setFormData] = useState(initialFormState);

  const resetForm = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setEditingId(null);
    setCreateLoading(false);
  };

  useEffect(() => {
    loadMembershipPlans();
  }, [filters.status, filters.search]);

  const loadMembershipPlans = () => {
    // Local data loading in standalone mode
  };

  const handleStatusToggle = (planId, currentStatus) => {
    if (window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this plan?`)) {
      setMembershipPlans(prev => prev.map(p => 
        p._id === planId ? { ...p, isActive: !currentStatus } : p
      ));
      toast.success("Plan status updated!");
    }
  };

  const handleEditClick = (plan) => {
    setIsEditing(true);
    setEditingId(plan._id);

    setFormData({
      planName: plan.planName,
      description: plan.description || '',
      durationDays: plan.durationDays,
      consultationLimit: plan.consultationLimit,
      labDeliveryLimit: plan.labDeliveryLimit || 0,
      foodDeliveryLimit: plan.foodDeliveryLimit || 0,
      pharmacyDeliveryLimit: plan.pharmacyDeliveryLimit || 0,
      price: plan.price,
      discountPercentage: plan.discountPercentage || 0,
      features: plan.features || [],
      showDiscounts: plan.showDiscounts !== false,
      BloodSugar: plan.BloodSugar || [],
      BloodSugarDiscounts: plan.BloodSugarDiscounts || [],
      AgeGroup: plan.AgeGroup || [],
      AgeGroupDiscounts: plan.AgeGroupDiscounts || [],
      HadDiabetes: plan.HadDiabetes || [],
      HadDiabetesDiscounts: plan.HadDiabetesDiscounts || [],
      LifeStyle: plan.LifeStyle || [],
      LifeStyleDiscounts: plan.LifeStyleDiscounts || [],
    });

    setShowCreateModal(true);
  };

  const handleViewDiscountMatrix = (plan) => {
    setDiscountMatrixData({
      planId: plan._id,
      planName: plan.planName,
      BloodSugar: plan.BloodSugar.map((option, idx) => ({ option, discount: plan.BloodSugarDiscounts[idx] || 0 })),
      AgeGroup: plan.AgeGroup.map((option, idx) => ({ option, discount: plan.AgeGroupDiscounts[idx] || 0 }))
    });
    setShowDiscountModal(plan._id);
  };

  const handleUpdateDiscountMatrix = () => {
    if (!discountMatrixData) return;
    
    setMembershipPlans(prev => prev.map(p => {
      if (p._id === discountMatrixData.planId) {
        return {
          ...p,
          BloodSugarDiscounts: discountMatrixData.BloodSugar.map(item => item.discount),
          AgeGroupDiscounts: discountMatrixData.AgeGroup.map(item => item.discount)
        };
      }
      return p;
    }));

    toast.success("Discount matrix updated successfully!");
    setShowDiscountModal(null);
    setDiscountMatrixData(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
  };

  const removeFeature = (index) => {
    setFormData(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
  };

  const handleArrayFieldChange = (fieldName, index, value) => {
    const newArray = [...formData[fieldName]];
    newArray[index] = value;
    setFormData(prev => ({ ...prev, [fieldName]: newArray }));
  };

  const handleDiscountArrayChange = (fieldName, index, value) => {
    const newArray = [...formData[fieldName]];
    newArray[index] = parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, [fieldName]: newArray }));
  };

  const addArrayFieldItem = (fieldName, discountFieldName) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: [...prev[fieldName], ''],
      [discountFieldName]: [...prev[discountFieldName], 0]
    }));
  };

  const removeArrayFieldItem = (fieldName, discountFieldName, index) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index),
      [discountFieldName]: prev[discountFieldName].filter((_, i) => i !== index)
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setCreateLoading(true);

    setTimeout(() => {
      const submissionData = {
        ...formData,
        _id: isEditing ? editingId : `p_${Date.now()}`,
        isActive: true,
        features: formData.features.filter(feature => feature.trim() !== ''),
        BloodSugar: formData.BloodSugar.filter(item => item.trim() !== ''),
        AgeGroup: formData.AgeGroup.filter(item => item.trim() !== ''),
        HadDiabetes: formData.HadDiabetes.filter(item => item.trim() !== ''),
        LifeStyle: formData.LifeStyle.filter(item => item.trim() !== ''),
        BloodSugarDiscounts: formData.BloodSugarDiscounts.slice(0, formData.BloodSugar.length),
        AgeGroupDiscounts: formData.AgeGroupDiscounts.slice(0, formData.AgeGroup.length),
        HadDiabetesDiscounts: formData.HadDiabetesDiscounts.slice(0, formData.HadDiabetes.length),
        LifeStyleDiscounts: formData.LifeStyleDiscounts.slice(0, formData.LifeStyle.length)
      };

      if (isEditing && editingId) {
        setMembershipPlans(prev => prev.map(p => p._id === editingId ? submissionData : p));
        toast.success("Membership plan updated successfully!");
      } else {
        setMembershipPlans([submissionData, ...membershipPlans]);
        toast.success("Membership plan created successfully!");
      }

      setShowCreateModal(false);
      resetForm();
    }, 1200);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Filter and Search logic in useMemo
  const filteredPlans = useMemo(() => {
    return membershipPlans.filter(plan => {
      const matchesSearch = plan.planName.toLowerCase().includes(filters.search.toLowerCase()) || 
                            plan.description.toLowerCase().includes(filters.search.toLowerCase());
      
      let matchesStatus = true;
      if (filters.status === "active") matchesStatus = plan.isActive;
      if (filters.status === "inactive") matchesStatus = !plan.isActive;

      return matchesSearch && matchesStatus;
    });
  }, [membershipPlans, filters]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-8 select-none animate-fadeIn">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center shrink-0">
            <FaCrown className="text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-800 tracking-tight leading-snug">Membership Plans</h2>
            <p className="text-xs text-gray-400">Configure, structure, and manage premium clinical subscription plans</p>
          </div>
        </div>

        <button 
          onClick={() => { resetForm(); setShowCreateModal(true); }}
          className={`flex items-center justify-center gap-2 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all focus:outline-none ${themeBg} ${themeHoverBg} ${themeShadow} shadow-lg`}
        >
          <FaPlus className="text-xs" /> Create New Plan
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all cursor-pointer`}
          >
            <option value="active">Active Plans</option>
            <option value="inactive">Inactive Plans</option>
            <option value="all">All Plans</option>
          </select>

          <div className="relative w-full sm:w-64">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400" />
            <input
              type="text"
              placeholder="Search plans..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className={`pl-9 pr-4 py-2 w-full rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <select
            value={filters.limit}
            onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value) }))}
            className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-semibold text-gray-700 outline-none focus:border-[#3D3F96] transition-all cursor-pointer`}
          >
            <option value="10">10 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
          </select>

          <button onClick={() => setFilters(prev => ({ ...prev, search: "" }))} className="p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 hover:text-gray-800 transition-all focus:outline-none" title="Reset Search">
            <FaSync className="text-xs" />
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => (
          <div 
            key={plan._id} 
            className={`bg-white rounded-3xl border border-gray-100 p-6 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.012)] hover:shadow-[0_15px_40px_rgb(0,0,0,0.03)] hover:-translate-y-1 transition-all duration-300 relative ${
              plan.isActive ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-slate-400'
            }`}
          >
            <div>
              {/* Header inside Card */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-base font-black text-gray-800 tracking-tight leading-snug">{plan.planName}</h3>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mt-0.5">ID: {plan._id.slice(-6)}</span>
                </div>
                <div className="flex gap-1.5">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${plan.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-gray-500'}`}>
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {plan.showDiscounts && (
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-[#3D3F96]/10 text-[#3D3F96] uppercase tracking-wide">Dynamic</span>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed font-semibold mb-4">{plan.description}</p>
              
              <div className="mb-4">
                <span className="text-2xl font-black text-gray-800">{formatPrice(plan.price)}</span>
                {plan.discountPercentage > 0 && (
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wide ml-2">
                    {plan.discountPercentage}% OFF
                  </span>
                )}
              </div>

              {/* Specs Row */}
              <div className="grid grid-cols-2 gap-4 mb-4 border-t border-b border-gray-50 py-3">
                <div>
                  <small className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Duration</small>
                  <strong className="text-sm font-black text-gray-800">{plan.durationDays} Days</strong>
                </div>
                <div>
                  <small className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Consultations</small>
                  <strong className="text-sm font-black text-gray-800">{plan.consultationLimit}</strong>
                </div>
              </div>

              {/* Delivery Limits Display */}
              <div className="mb-4 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <small className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Free Delivery Limits</small>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-100 text-gray-600 rounded-lg text-[10px] font-bold">
                    <FaFlask className="text-xs text-sky-500" /> Lab: {plan.labDeliveryLimit || 0}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-100 text-gray-600 rounded-lg text-[10px] font-bold">
                    <FaUtensils className="text-xs text-amber-500" /> Food: {plan.foodDeliveryLimit || 0}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-100 text-gray-600 rounded-lg text-[10px] font-bold">
                    <FaPills className="text-xs text-emerald-500" /> Pharm: {plan.pharmacyDeliveryLimit || 0}
                  </span>
                </div>
              </div>

              {/* Features Preview */}
              {plan.features && plan.features.length > 0 && (
                <div className="mb-4 pt-1">
                  <small className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Features</small>
                  <ul className="space-y-1.5 mt-2">
                    {plan.features.slice(0, 2).map((feature, i) => (
                      <li key={i} className="text-xs font-semibold text-gray-500 truncate">• {feature}</li>
                    ))}
                    {plan.features.length > 2 && <li className={`text-xs font-bold ${themeText}`}>+{plan.features.length - 2} more features</li>}
                  </ul>
                </div>
              )}
            </div>

            {/* Card Footer Actions */}
            <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-auto">
              <button
                className="px-3 py-1.5 rounded-lg bg-[#3D3F96]/10 text-[#3D3F96] text-xs font-bold uppercase tracking-wider hover:bg-[#3D3F96] hover:text-white transition-all focus:outline-none"
                onClick={() => handleViewDiscountMatrix(plan)}
              >
                Discounts
              </button>
              <div className="flex gap-2">
                <button
                  className="p-2 rounded-lg bg-indigo-50 hover:bg-[#3D3F96]/10 text-[#3D3F96] border border-indigo-100/60 transition-all focus:outline-none"
                  onClick={() => handleEditClick(plan)}
                  title="Edit Plan"
                >
                  <FaEdit className="text-xs" />
                </button>
                <button
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all focus:outline-none ${
                    plan.isActive 
                      ? "bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100" 
                      : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100"
                  }`}
                  onClick={() => handleStatusToggle(plan._id, plan.isActive)}
                >
                  {plan.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 1. CREATE/EDIT PLAN MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative flex flex-col gap-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 shrink-0">
              <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">{isEditing ? 'Edit Membership Plan' : 'Create New Membership Plan'}</h3>
              <button 
                type="button" 
                className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-400 flex items-center justify-center transition-colors focus:outline-none" 
                onClick={() => { setShowCreateModal(false); resetForm(); }}
                disabled={createLoading}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="space-y-6 overflow-y-auto pr-1">
              <form onSubmit={handleFormSubmit} className="space-y-6">
                
                {/* Basic Information Section */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Plan Name *</label>
                      <input
                        type="text"
                        name="planName"
                        value={formData.planName}
                        onChange={handleInputChange}
                        required
                        disabled={createLoading}
                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Price (₹) *</label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleNumberInputChange}
                        min="0"
                        required
                        disabled={createLoading}
                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Duration (Days) *</label>
                      <input
                        type="number"
                        name="durationDays"
                        value={formData.durationDays}
                        onChange={handleNumberInputChange}
                        min="1"
                        required
                        disabled={createLoading}
                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Consultation Limit *</label>
                      <input
                        type="number"
                        name="consultationLimit"
                        value={formData.consultationLimit}
                        onChange={handleNumberInputChange}
                        min="0"
                        required
                        disabled={createLoading}
                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Base Discount %</label>
                      <input
                        type="number"
                        name="discountPercentage"
                        value={formData.discountPercentage}
                        onChange={handleNumberInputChange}
                        min="0"
                        max="100"
                        disabled={createLoading}
                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Show Dynamic Discounts</label>
                        <select
                          name="showDiscounts"
                          value={formData.showDiscounts ? "true" : "false"}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            showDiscounts: e.target.value === 'true' 
                          }))}
                          disabled={createLoading}
                          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] transition-all cursor-pointer"
                        >
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5 col-span-full">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="2"
                        disabled={createLoading}
                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all resize-none`}
                      />
                    </div>
                  </div>

                  {/* Delivery Limits Section */}
                  <div className="space-y-4 bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                    <div>
                      <h4 className={`text-xs font-bold uppercase tracking-wider ${themeText}`}>Free Delivery Limits</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Set how many free deliveries are allowed per plan. Set 0 for none.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><FaFlask className="text-sky-500" /> Lab Delivery Limit</label>
                          <input
                            type="number"
                            name="labDeliveryLimit"
                            value={formData.labDeliveryLimit}
                            onChange={handleNumberInputChange}
                            min="0"
                            placeholder="0"
                            disabled={createLoading}
                            className={`bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><FaUtensils className="text-amber-500" /> Food Delivery Limit</label>
                          <input
                            type="number"
                            name="foodDeliveryLimit"
                            value={formData.foodDeliveryLimit}
                            onChange={handleNumberInputChange}
                            min="0"
                            placeholder="0"
                            disabled={createLoading}
                            className={`bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><FaPills className="text-emerald-500" /> Pharmacy Delivery Limit</label>
                          <input
                            type="number"
                            name="pharmacyDeliveryLimit"
                            value={formData.pharmacyDeliveryLimit}
                            onChange={handleNumberInputChange}
                            min="0"
                            placeholder="0"
                            disabled={createLoading}
                            className={`bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                          />
                        </div>
                    </div>
                  </div>

                  {/* Features Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Features</label>
                      <button 
                        type="button" 
                        onClick={addFeature}
                        disabled={createLoading}
                        className="text-xs font-bold text-[#3D3F96] hover:underline flex items-center gap-1 focus:outline-none"
                      >
                        <FaPlus className="text-[10px]" /> Add Feature
                      </button>
                    </div>
                    <div className="space-y-2">
                        {formData.features.map((feature, index) => (
                            <div key={`feature-${index}`} className="flex gap-2">
                              <input
                                type="text"
                                value={feature}
                                onChange={(e) => handleFeatureChange(index, e.target.value)}
                                placeholder={`Feature ${index + 1}`}
                                disabled={createLoading}
                                className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-semibold text-gray-700 outline-none w-full focus:border-[#3D3F96]`}
                              />
                              {formData.features.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeFeature(index)}
                                  disabled={createLoading}
                                  className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl border border-rose-100 transition-colors focus:outline-none"
                                >
                                  <FaTrash className="text-[10px]" />
                                </button>
                              )}
                            </div>
                        ))}
                    </div>
                  </div>

                  {/* Discount Matrix Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100">
                    {/* Blood Sugar Section */}
                    <div className="space-y-3">
                       <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Blood Sugar Options (Discounts)</label>
                            <button 
                                type="button" 
                                onClick={() => addArrayFieldItem('BloodSugar', 'BloodSugarDiscounts')}
                                className="text-xs font-bold text-[#3D3F96] hover:underline flex items-center gap-1 focus:outline-none"
                            >
                                <FaPlus className="text-[10px]" /> Add Option
                            </button>
                       </div>
                       <div className="space-y-2">
                            {formData.BloodSugar.map((option, index) => (
                                <div key={index} className="flex gap-2">
                                  <input 
                                    type="text" 
                                    value={option} 
                                    onChange={(e) => handleArrayFieldChange('BloodSugar', index, e.target.value)} 
                                    placeholder="Option Name" 
                                    className={`bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none w-1/2 focus:border-[#3D3F96]`}
                                  />
                                  <input 
                                    type="number" 
                                    value={formData.BloodSugarDiscounts[index] || 0} 
                                    onChange={(e) => handleDiscountArrayChange('BloodSugarDiscounts', index, e.target.value)} 
                                    placeholder="%" 
                                    className={`bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none w-16 focus:border-[#3D3F96] text-center`}
                                  />
                                  <button 
                                    type="button" 
                                    onClick={() => removeArrayFieldItem('BloodSugar', 'BloodSugarDiscounts', index)}
                                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl border border-rose-100 transition-colors focus:outline-none"
                                  >
                                    <FaTrash className="text-[10px]" />
                                  </button>
                                </div>
                            ))}
                       </div>
                    </div>

                    {/* Age Group Section */}
                    <div className="space-y-3">
                       <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Age Group Options (Discounts)</label>
                            <button 
                                type="button" 
                                onClick={() => addArrayFieldItem('AgeGroup', 'AgeGroupDiscounts')}
                                className="text-xs font-bold text-[#3D3F96] hover:underline flex items-center gap-1 focus:outline-none"
                            >
                                <FaPlus className="text-[10px]" /> Add Option
                            </button>
                       </div>
                       <div className="space-y-2">
                            {formData.AgeGroup.map((option, index) => (
                                <div key={index} className="flex gap-2">
                                  <input 
                                    type="text" 
                                    value={option} 
                                    onChange={(e) => handleArrayFieldChange('AgeGroup', index, e.target.value)} 
                                    placeholder="Option Name" 
                                    className={`bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none w-1/2 focus:border-[#3D3F96]`}
                                  />
                                  <input 
                                    type="number" 
                                    value={formData.AgeGroupDiscounts[index] || 0} 
                                    onChange={(e) => handleDiscountArrayChange('AgeGroupDiscounts', index, e.target.value)} 
                                    placeholder="%" 
                                    className={`bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none w-16 focus:border-[#3D3F96] text-center`}
                                  />
                                  <button 
                                    type="button" 
                                    onClick={() => removeArrayFieldItem('AgeGroup', 'AgeGroupDiscounts', index)}
                                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl border border-rose-100 transition-colors focus:outline-none"
                                  >
                                    <FaTrash className="text-[10px]" />
                                  </button>
                                </div>
                            ))}
                       </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex justify-end gap-2 border-t border-gray-100 pt-4 shrink-0">
                    <button
                      type="button"
                      onClick={() => { setShowCreateModal(false); resetForm(); }}
                      disabled={createLoading}
                      className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold uppercase tracking-wider transition-all focus:outline-none"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createLoading}
                      className={`flex items-center gap-1.5 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all focus:outline-none ${themeBg} ${themeHoverBg} ${themeShadow} shadow-lg`}
                    >
                      {createLoading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Processing...
                        </>
                      ) : (
                        isEditing ? 'Update Plan' : 'Create Plan'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 2. DETAILED DISCOUNT MATRIX MODAL */}
      {showDiscountModal && discountMatrixData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-100 p-6 relative flex flex-col gap-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 shrink-0">
              <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Detailed Discount Matrix</h3>
              <button 
                type="button" 
                className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-400 flex items-center justify-center transition-colors focus:outline-none" 
                onClick={() => setShowDiscountModal(null)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3.5 text-blue-700 text-xs leading-relaxed font-semibold">
                <FaInfoCircle className="text-base shrink-0 mt-0.5" />
                <span>To change the Options themselves, please use the &quot;Edit&quot; button on the main plan card. Use this modal only to tweak specific discount percentages for existing options.</span>
              </div>
              
              <div className="overflow-x-auto border border-gray-100 rounded-2xl">
                <table className="w-full text-xs text-left align-middle">
                  <thead>
                    <tr className="text-[10px] font-black uppercase tracking-wider text-gray-400 bg-gray-50/50 border-b border-gray-100">
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Option</th>
                      <th className="px-4 py-3 text-right">Discount %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {/* Blood Sugar Option Rows */}
                    {discountMatrixData.BloodSugar.map((item, idx) => (
                      <tr key={`bs-${idx}`} className="hover:bg-gray-50/40">
                        {idx === 0 && <td rowSpan={discountMatrixData.BloodSugar.length} className="px-4 py-3 font-bold text-gray-800">Blood Sugar</td>}
                        <td className="px-4 py-3 font-semibold text-gray-600">{item.option}</td>
                        <td className="px-4 py-3">
                          <input 
                            type="number" 
                            value={item.discount}
                            onChange={(e) => {
                              const updatedBloodSugar = [...discountMatrixData.BloodSugar];
                              updatedBloodSugar[idx].discount = parseFloat(e.target.value) || 0;
                              setDiscountMatrixData({ ...discountMatrixData, BloodSugar: updatedBloodSugar });
                            }}
                            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 w-20 text-xs font-semibold text-right text-gray-700 outline-none ml-auto block focus:border-[#3D3F96]"
                          />
                        </td>
                      </tr>
                    ))}
                    {/* Age Group Option Rows */}
                    {discountMatrixData.AgeGroup.map((item, idx) => (
                      <tr key={`ag-${idx}`} className="hover:bg-gray-50/40">
                        {idx === 0 && <td rowSpan={discountMatrixData.AgeGroup.length} className="px-4 py-3 font-bold text-gray-800">Age Group</td>}
                        <td className="px-4 py-3 font-semibold text-gray-600">{item.option}</td>
                        <td className="px-4 py-3">
                          <input 
                            type="number" 
                            value={item.discount}
                            onChange={(e) => {
                              const updatedAgeGroup = [...discountMatrixData.AgeGroup];
                              updatedAgeGroup[idx].discount = parseFloat(e.target.value) || 0;
                              setDiscountMatrixData({ ...discountMatrixData, AgeGroup: updatedAgeGroup });
                            }}
                            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 w-20 text-xs font-semibold text-right text-gray-700 outline-none ml-auto block focus:border-[#3D3F96]"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-4 shrink-0">
              <button type="button" onClick={() => setShowDiscountModal(null)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold uppercase tracking-wider focus:outline-none">Cancel</button>
              <button onClick={handleUpdateDiscountMatrix} className={`flex items-center gap-1.5 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider focus:outline-none ${themeBg} ${themeHoverBg}`}>Save Matrix Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}