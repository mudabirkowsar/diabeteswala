"use client";

import React, { useState, useEffect } from 'react';
import { 
    Layers, 
    Plus, 
    Edit, 
    Trash2, 
    Loader2, 
    Utensils, 
    Users, 
    Inbox, 
    RotateCcw,
    Coffee,
    Sun,
    Moon
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import CreateTiffin from './components/CreateTiffin';

// Import Admin API service functions
import AdminAPI from '../../../../../services/AdminAPI'; // Adjust path if needed

// --- MEDIA HELPER ---
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";

const getMediaUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    return `${BASE_SERVER_URL}/${cleanPath}`;
};

const DEFAULT_BANNER = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80";

export default function SubscriptionPlans() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState(null);

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedPlan, setSelectedPlan] = useState(null);

    // --- 1. Fetch All Subscription Plans ---
    const fetchAllPlans = async () => {
        setLoading(true);
        try {
            const response = await AdminAPI.getTiffinPlansList();
            if (response && response.success) {
                setPlans(response.data || []);
            }
        } catch (err) {
            console.error("Error fetching tiffin subscription plans:", err);
            toast.error("Failed to load subscription tiers.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllPlans();
    }, []);

    // --- 2. Toggle Plan Active / Inactive Status ---
    const handleToggleStatus = async (planId) => {
        setActionLoadingId(planId);
        try {
            const response = await AdminAPI.toggleTiffinPlanStatus(planId);
            if (response && response.success) {
                setPlans(prev => prev.map(p => 
                    (p._id === planId || p.planId === planId)
                        ? { ...p, isActive: response.isActive !== undefined ? response.isActive : !p.isActive }
                        : p
                ));
                toast.success(response.message || 'Status updated successfully!');
            }
        } catch (err) {
            console.error("Error toggling plan status:", err);
            toast.error(err.response?.data?.message || 'Failed to toggle status.');
        } finally {
            setActionLoadingId(null);
        }
    };

    // --- 3. Delete Plan with Confirmation ---
    const handleDeletePlan = async (planId) => {
        const isConfirmed = window.confirm("Are you sure you want to permanently delete this subscription plan tier?");
        if (!isConfirmed) return;

        setActionLoadingId(planId);
        try {
            const response = await AdminAPI.deleteTiffinPlan(planId);
            if (response && response.success) {
                setPlans(prev => prev.filter(p => p._id !== planId && p.planId !== planId));
                toast.success('Subscription plan removed successfully.');
            }
        } catch (err) {
            console.error("Error deleting plan:", err);
            toast.error(err.response?.data?.message || 'Failed to delete plan.');
        } finally {
            setActionLoadingId(null);
        }
    };

    // --- 4. Open Edit Modal ---
    const openEditModal = async (plan) => {
        const targetId = plan._id || plan.planId;
        try {
            const response = await AdminAPI.getTiffinPlanDetails(targetId);
            if (response && response.success) {
                setSelectedPlan(response.data);
            } else {
                setSelectedPlan(plan);
            }
        } catch (err) {
            console.error("Error fetching single plan details, fallback to grid data:", err);
            setSelectedPlan(plan);
        }
        setModalMode('edit');
        setIsModalOpen(true);
    };

    // --- 5. Open Create Modal ---
    const openCreateModal = () => {
        setModalMode('create');
        setSelectedPlan(null);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto animate-fade-in py-4 text-left select-none">
            <Toaster position="top-right" />

            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#3D3F96] flex items-center justify-center border border-indigo-100 shadow-xs">
                            <Layers size={20} />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Subscription Plans</h1>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 pl-12">
                        Configure customizable daily breakfast, lunch, and dinner tiffin subscription tiers.
                    </p>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto">
                    <button
                        onClick={fetchAllPlans}
                        title="Refresh plans list"
                        className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl border border-slate-200/80 transition cursor-pointer"
                    >
                        <RotateCcw size={16} className={loading ? "animate-spin" : ""} />
                    </button>
                    
                    <button
                        onClick={openCreateModal}
                        className="px-6 py-3.5 bg-[#3D3F96] hover:bg-[#2d2f75] text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-indigo-950/15 flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Plus size={16} />
                        <span>Create Custom Tier</span>
                    </button>
                </div>
            </div>

            {/* Plans List Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <Loader2 className="animate-spin text-[#3D3F96] mb-3" size={32} />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading subscription tiers...</p>
                </div>
            ) : plans.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 sm:p-20 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm border-dashed">
                    <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 mb-4 shadow-inner">
                        <Inbox size={32} />
                    </div>
                    <h3 className="text-base font-extrabold text-slate-800">No Subscription Plans Configured</h3>
                    <p className="text-xs text-slate-400 mt-1.5 max-w-sm font-medium leading-relaxed">
                        Create customizable meal bundles allowing subscribers to choose their daily clinical breakfast, lunch, or dinner.
                    </p>
                    <button
                        onClick={openCreateModal}
                        className="mt-6 inline-flex items-center gap-2 bg-[#3D3F96] hover:bg-[#2d2f75] text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-indigo-950/10 cursor-pointer"
                    >
                        <Plus size={14} />
                        <span>Create First Tier</span>
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {plans.map((plan) => {
                        const targetId = plan._id || plan.planId;
                        const isProcessing = actionLoadingId === targetId;
                        const isActive = plan.isActive !== false;
                        
                        // Extract first valid dish image as banner
                        const firstDish = plan.dishPool?.[0] || plan.slotDishes?.breakfast?.[0]?.itemId || plan.slotDishes?.lunch?.[0]?.itemId;
                        const bannerImg = (firstDish && typeof firstDish === 'object' && firstDish.imageUrl)
                            ? getMediaUrl(firstDish.imageUrl)
                            : DEFAULT_BANNER;

                        // Total count of configured slot items
                        const breakfastCount = plan.slotDishes?.breakfast?.length || 0;
                        const lunchCount = plan.slotDishes?.lunch?.length || 0;
                        const dinnerCount = plan.slotDishes?.dinner?.length || 0;
                        const totalConfiguredDishes = breakfastCount + lunchCount + dinnerCount;

                        return (
                            <div
                                key={targetId}
                                className={`bg-white rounded-3xl border border-slate-200/80 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group ${
                                    !isActive ? 'opacity-65 saturate-[0.5]' : ''
                                }`}
                            >
                                <div>
                                    {/* Photo Banner */}
                                    <div className="relative h-44 w-full overflow-hidden bg-slate-100 border-b border-slate-100">
                                        <img 
                                            src={bannerImg} 
                                            alt={plan.name} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                            onError={(e) => { e.target.src = DEFAULT_BANNER; }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                        
                                        {/* Meals count tag */}
                                        <span className="absolute bottom-3 left-4 bg-[#3D3F96] text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl shadow-sm border border-white/10">
                                            {plan.mealsPerDay} {plan.mealsPerDay === 1 ? 'Meal' : 'Meals'} / Day
                                        </span>

                                        {/* Plan ID Tag */}
                                        <span className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-lg uppercase border border-white/10">
                                            ID: {plan.planId || plan._id?.substring(0, 8)}
                                        </span>
                                    </div>

                                    {/* Inner Details */}
                                    <div className="p-6 space-y-4">
                                        <div className="space-y-1">
                                            <h3 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-[#3D3F96] transition-colors">
                                                {plan.name}
                                            </h3>
                                            <span className="inline-block text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest leading-none">
                                                {plan.planCycle || 'Monthly Cycle'}
                                            </span>
                                        </div>

                                        <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
                                            {plan.description}
                                        </p>

                                        {/* Allowed Slots Breakdown */}
                                        <div className="space-y-1.5 pt-1">
                                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                                                Permitted Meal Slots:
                                            </span>
                                            <div className="flex gap-1.5 flex-wrap">
                                                {[
                                                    { name: "Breakfast", icon: Coffee, count: breakfastCount },
                                                    { name: "Lunch", icon: Sun, count: lunchCount },
                                                    { name: "Dinner", icon: Moon, count: dinnerCount }
                                                ].map(({ name, icon: Icon, count }) => {
                                                    const isAllowed = plan.permittedSlots?.includes(name);
                                                    return (
                                                        <span 
                                                            key={name} 
                                                            className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold border flex items-center gap-1.5 transition-colors ${
                                                                isAllowed
                                                                    ? 'bg-indigo-50 border-indigo-100 text-[#3D3F96]'
                                                                    : 'bg-slate-100 border-slate-100 text-slate-400 line-through opacity-60'
                                                            }`}
                                                        >
                                                            <Icon size={11} />
                                                            <span>{name} ({count})</span>
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Stats and pricing details */}
                                        <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-100 text-xs font-bold bg-slate-50/60 p-3 rounded-2xl">
                                            <div>
                                                <span className="text-slate-400 block uppercase text-[10px]">Price</span>
                                                <span className="text-slate-900 text-base font-mono font-black">₹{plan.price}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block uppercase text-[10px]">Subscribers</span>
                                                <span className="text-[#3D3F96] text-base font-black flex items-center gap-1">
                                                    <Users size={14} /> {plan.activeSubscribers || 0}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Total configured items indicator */}
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                                                <Utensils size={10} /> Configured Dishes Pool:
                                            </span>
                                            <p className="text-xs font-bold text-slate-700">
                                                {totalConfiguredDishes > 0 ? `${totalConfiguredDishes} slot items mapped` : 'No slot items mapped'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Footer */}
                                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => openEditModal(plan)}
                                            disabled={isProcessing}
                                            className="p-2 border border-slate-200 text-slate-400 hover:text-[#3D3F96] hover:bg-[#3D3F96]/10 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                                            title="Edit Plan"
                                        >
                                            <Edit size={14} strokeWidth={2.2} />
                                        </button>
                                        
                                        <button
                                            onClick={() => handleDeletePlan(targetId)}
                                            disabled={isProcessing}
                                            className="p-2 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                                            title="Delete Plan"
                                        >
                                            <Trash2 size={14} strokeWidth={2.2} />
                                        </button>
                                    </div>

                                    {/* Toggle Active / Inactive Button */}
                                    <button
                                        onClick={() => handleToggleStatus(targetId)}
                                        disabled={isProcessing}
                                        className={`flex items-center gap-1.5 text-[10px] font-bold border px-3 py-1.5 rounded-full transition-all duration-300 cursor-pointer disabled:opacity-50 ${
                                            isActive
                                                ? "text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                                                : "text-slate-500 border-slate-200 bg-slate-100 hover:bg-slate-200"
                                        }`}
                                    >
                                        {isProcessing ? (
                                            <Loader2 size={10} className="animate-spin" />
                                        ) : (
                                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                                        )}
                                        <span>{isActive ? 'Active' : 'Inactive'}</span>
                                    </button>
                                </div>

                            </div>
                        );
                    })}
                </div>
            )}

            {/* CREATE & EDIT TIFFIN MODAL COMPONENT */}
            <CreateTiffin
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    fetchAllPlans();
                    toast.success(modalMode === 'create' ? 'Subscription tier created successfully!' : 'Plan updated successfully!');
                }}
                initialData={selectedPlan}
                mode={modalMode}
            />

        </div>
    );
}