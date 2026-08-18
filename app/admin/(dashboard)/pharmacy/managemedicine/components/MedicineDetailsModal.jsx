"use client";
import React, { useState, useEffect, useRef } from 'react';
import {
    Search,
    Pill,
    FileText,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Eye,
    X,
    RefreshCw,
    Award,
    Plus,
    Upload,
    Trash2,
    Edit3,
    DollarSign,
    Layers,
    Tag,
    Activity,
    Info,
    Check,
    AlertTriangle
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Import your API service functions
import AdminAPI from '../../../../../services/AdminAPI';

// --- BASE MEDIA HELPER ---
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";

const getMediaUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    return `${BASE_SERVER_URL}/${cleanPath}`;
};

const PLACEHOLDER_IMAGE = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrBj9YgXEggJuv8rbwaXT9rsxFOCpG2dvia-uP_etJLA&s";

function MedicineDetailsModal({ medicineId, onClose }) {
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [zoomedImage, setZoomedImage] = useState(null);

    useEffect(() => {
        if (!medicineId) return;

        const loadMedicineDetails = async () => {
            setLoading(true);
            try {
                const response = await AdminAPI.getMedicineDetails(medicineId);
                if (response && response.success) {
                    setDetail(response.data);
                } else {
                    toast.error("Failed to fetch medicine detail profile.");
                }
            } catch (err) {
                console.error(err);
                toast.error(err.response?.data?.message || "Error reading medicine profile.");
            } finally {
                setLoading(false);
            }
        };

        loadMedicineDetails();
    }, [medicineId]);

    if (!medicineId) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

            <div className="bg-white rounded-[2.5rem] max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative z-10 border border-slate-100 max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-all">
                    <X size={18} />
                </button>

                <h2 className="text-xl font-black text-slate-800 tracking-tight mb-6 flex items-center gap-2">
                    <Pill className="text-[#3d3f96]" size={20} /> Medicine Product Sheet
                </h2>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Parsing database record...</p>
                    </div>
                ) : detail ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                        
                        {/* Images & Identifier Block */}
                        <div className="md:col-span-1 space-y-4">
                            <div className="h-44 w-full rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden relative cursor-zoom-in group">
                                <img
                                    src={(detail.image_url && detail.image_url[0]) || PLACEHOLDER_IMAGE}
                                    alt={detail.name}
                                    onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-[1.02]"
                                    onClick={() => setZoomedImage((detail.image_url && detail.image_url[0]) || PLACEHOLDER_IMAGE)}
                                />
                            </div>
                            
                            {/* Secondary Images List */}
                            {detail.image_url && detail.image_url.length > 1 && (
                                <div className="grid grid-cols-4 gap-2">
                                    {detail.image_url.slice(1).map((img, idx) => (
                                        <div 
                                            key={idx} 
                                            onClick={() => setZoomedImage(img)}
                                            className="h-10 border border-slate-100 rounded-lg overflow-hidden cursor-zoom-in bg-slate-50"
                                        >
                                            <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }} />
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400">Inventory ID</p>
                                <p className="text-xs font-bold text-slate-700 mt-0.5 select-all">{detail.Id}</p>
                            </div>

                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400">Breadcrumb Category Path</p>
                                <p className="text-xs font-semibold text-slate-500 mt-1 leading-relaxed">
                                    {detail.bread_crumb || "Categorized Pharmacy Goods"}
                                </p>
                            </div>
                        </div>

                        {/* General Formats & Uses */}
                        <div className="md:col-span-1 space-y-4 border-r border-slate-100 pr-0 md:pr-6">
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400">Medicine Name</p>
                                <p className="text-sm font-black text-slate-800 mt-0.5">{detail.name}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400">Active Salt Composition</p>
                                <p className="text-xs font-semibold text-[#3d3f96] mt-0.5 leading-relaxed italic bg-indigo-50/40 p-2 rounded-xl border border-indigo-100/30">
                                    {detail.salt_composition || "Not Available"}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 font-bold">Manufacturers / Brand</p>
                                <p className="text-xs font-bold text-slate-700 mt-0.5">{detail.manufacturers || "Unstated Manufacturers"}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400">Packaging Format</p>
                                <p className="text-xs font-bold text-slate-700 mt-0.5">{detail.packaging || "No specified unit type"}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400">Primary Intended Use</p>
                                <p className="text-xs font-bold text-slate-700 mt-0.5">{detail.primary_use || "General Medical Purposes"}</p>
                            </div>
                        </div>

                        {/* Pricing, Specifications, and Meta Info */}
                        <div className="md:col-span-1 space-y-4">
                            
                            {/* Pricing Subcard */}
                            <div className="bg-slate-50 border border-slate-100/80 p-4 rounded-2xl space-y-3">
                                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                    <Tag size={12} className="text-[#3d3f96]" /> Pricing Details
                                </h4>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <span className="text-slate-400 font-semibold block">Retail Price (MRP)</span>
                                        <span className="font-black text-slate-500 line-through">₹ {detail.mrp || "0.00"}</span>
                                    </div>
                                    <div>
                                        <span className="text-[#3d3f96] font-semibold block">Best Offer Price</span>
                                        <span className="font-black text-slate-800 text-sm">₹ {detail.best_price || "0.00"}</span>
                                    </div>
                                </div>
                                <div className="border-t border-slate-200/50 pt-2 flex justify-between items-center text-xs">
                                    <span className="text-slate-400 font-semibold">Standard Discount</span>
                                    <span className="font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100 text-[10px]">
                                        {detail.discont_percent || "0%"} Off
                                    </span>
                                </div>
                            </div>

                            {/* Verification Attributes */}
                            <div className="space-y-3 pt-2">
                                <p className="text-[10px] font-black uppercase text-slate-400">Purchase Constraints</p>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                                        <span className="flex items-center gap-1.5">
                                            <FileText size={13} className="text-slate-400" /> Rx Prescription Required
                                        </span>
                                        <span className={`px-2.5 py-0.5 rounded text-[10px] ${detail.prescription_required === "Yes" ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-slate-50 text-slate-500'}`}>
                                            {detail.prescription_required || "No"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                                        <span className="flex items-center gap-1.5">
                                            <Activity size={13} className="text-slate-400" /> Listed For Active Sale
                                        </span>
                                        <span className={`px-2.5 py-0.5 rounded text-[10px] ${detail.for_sale === "Yes" ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                            {detail.for_sale || "No"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {detail.description && (
                                <div className="pt-2 border-t border-slate-50">
                                    <p className="text-[10px] font-black uppercase text-slate-400">Detailed Description</p>
                                    <p className="text-[11px] font-semibold text-slate-500 mt-1 leading-relaxed max-h-24 overflow-y-auto [&::-webkit-scrollbar]:hidden">
                                        {detail.description}
                                    </p>
                                </div>
                            )}

                        </div>

                    </div>
                ) : (
                    <p className="text-slate-500 font-semibold text-center py-12">Failed to render medicine details.</p>
                )}
            </div>

            {/* --- Zoom Overlay inside Subcomponent --- */}
            {zoomedImage && (
                <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm">
                    <button
                        type="button"
                        onClick={() => setZoomedImage(null)}
                        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all cursor-pointer"
                    >
                        <X size={24} />
                    </button>
                    <img
                        src={zoomedImage}
                        alt="Zoomed document"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg"
                        onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                    />
                </div>
            )}
        </div>
    );
}

export default MedicineDetailsModal
