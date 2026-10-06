"use client";

import React from 'react';
import {
    X,
    Star,
    Sparkles,
    CheckCircle2,
    Package,
    Smartphone,
    Layers,
    Activity,
    HelpCircle,
    ShieldCheck,
    Clock,
    Droplets,
    Battery,
    Zap,
    Tag,
    Check,
    Calendar,
    Award
} from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

const getMediaUrl = (path) => {
    if (!path || typeof path !== 'string') return '/placeholder-device.png';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const cleanBase = BACKEND_URL.replace(/\/+$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
};

export default function ViewProduct({
    isOpen,
    onClose,
    device
}) {
    if (!isOpen || !device) return null;

    const prodType = device.productType || 'Glucometer';
    const glucSpecs = device.glucometerConfig?.specifications;
    const glucVariants = device.glucometerConfig?.stripLancetVariants || [];
    const cgmConfig = device.cgmConfig;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-5 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl border border-slate-100 max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl relative text-left overflow-hidden">
                
                {/* Header Section */}
                <div className="px-6 py-4 sm:px-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 overflow-hidden shrink-0 shadow-sm p-1 flex items-center justify-center">
                            <img
                                src={getMediaUrl(device.mainImage)}
                                alt={device.title}
                                className="w-full h-full object-contain rounded-xl"
                                onError={(e) => { 
                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?q=80&w=300&auto=format&fit=crop'; 
                                }}
                            />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-black text-slate-900 text-lg sm:text-xl tracking-tight">
                                    {device.title}
                                </h3>
                                {device.badge && (
                                    <span className="inline-flex items-center gap-1 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        <Sparkles size={10} /> {device.badge}
                                    </span>
                                )}
                                {device.isActive && (
                                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        Active
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-700">{device.brand}</span>
                                {device.deviceModel && <span>• Model: <strong className="text-slate-700">{device.deviceModel}</strong></span>}
                                <span>• Category: <strong className="text-slate-700">{device.categoryId?.name || prodType}</strong></span>
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition cursor-pointer"
                        title="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content Body */}
                <div className="p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 text-xs">
                    
                    {/* Tagline Banner */}
                    {device.tagline && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-3 rounded-2xl flex items-center justify-between gap-2">
                            <span className="text-blue-900 font-bold text-xs tracking-tight">
                                🌟 {device.tagline}
                            </span>
                            {device.totalUsersCountDisplay && (
                                <span className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap shadow-sm">
                                    {device.totalUsersCountDisplay}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Quick Pricing & Rating Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                            <span className="text-[10px] text-slate-400 uppercase font-black block">Selling Price</span>
                            <div className="flex items-center justify-center gap-1.5 mt-0.5">
                                <strong className="text-base font-black text-emerald-600">₹{device.sellingPrice}</strong>
                                {device.mrp && <span className="text-[11px] line-through text-slate-400">₹{device.mrp}</span>}
                            </div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                            <span className="text-[10px] text-slate-400 uppercase font-black block">Savings</span>
                            <strong className="text-base font-black text-indigo-600">
                                {device.savingsAmount ? `₹${device.savingsAmount}` : '₹0'}
                            </strong>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                            <span className="text-[10px] text-slate-400 uppercase font-black block">Stock Quantity</span>
                            <strong className={`text-base font-black ${device.stockQuantity > 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                                {device.stockQuantity} Units
                            </strong>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                            <span className="text-[10px] text-slate-400 uppercase font-black block">Rating & Reviews</span>
                            <div className="flex items-center justify-center gap-1.5 mt-0.5">
                                <strong className="text-base font-black text-amber-500 flex items-center gap-1">
                                    <Star size={14} fill="currentColor" /> {device.averageRating || 0}
                                </strong>
                                <span className="text-slate-400 text-[10px]">({device.totalReviews || 0})</span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {device.description && (
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Description</span>
                            <div className="text-slate-700 font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100 leading-relaxed whitespace-pre-line">
                                {device.description}
                            </div>
                        </div>
                    )}

                    {/* Highlights Cards */}
                    {device.highlights?.length > 0 && (
                        <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Key Highlights</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {device.highlights.map((item, idx) => (
                                    <div key={item._id || idx} className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-2xl flex items-start gap-3">
                                        <div className="p-2 bg-amber-100 text-amber-800 rounded-xl mt-0.5 shrink-0">
                                            <Sparkles size={14} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-800">{item.title}</h4>
                                            <p className="text-slate-600 font-medium text-[11px] mt-0.5">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Glucometer Specifications & Compatibility */}
                    {device.glucometerConfig && (
                        <div className="space-y-4">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Glucometer Configuration</span>
                            
                            {/* Quick Connection Badges */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-2xl flex items-center gap-2.5">
                                    <Smartphone className="text-indigo-600 shrink-0" size={16} />
                                    <div>
                                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Compatibility</span>
                                        <span className="font-bold text-slate-800">{device.glucometerConfig.compatibility || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-2xl flex items-center gap-2.5">
                                    <Zap className="text-indigo-600 shrink-0" size={16} />
                                    <div>
                                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Connector</span>
                                        <span className="font-bold text-slate-800">{device.glucometerConfig.connectorType || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-2xl flex items-center gap-2.5 col-span-2 sm:col-span-1">
                                    <ShieldCheck className="text-indigo-600 shrink-0" size={16} />
                                    <div>
                                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Warranty</span>
                                        <span className="font-bold text-slate-800">{glucSpecs?.warranty || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Technical Specs Table/Grid */}
                            {glucSpecs && (
                                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                                    <h4 className="font-black text-slate-800 text-xs flex items-center gap-1.5">
                                        <Layers size={13} className="text-indigo-600" /> Lab & Technical Specifications
                                    </h4>
                                    
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2.5 gap-x-4">
                                        <div>
                                            <span className="text-slate-400 text-[10px] block">Accuracy Testing</span>
                                            <span className="font-bold text-slate-700">{glucSpecs.accuracyTesting || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 text-[10px] block">Variation (CV)</span>
                                            <span className="font-bold text-slate-700">{glucSpecs.coefficientOfVariation || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 text-[10px] block">Blood Sample Size</span>
                                            <span className="font-bold text-slate-700">{glucSpecs.bloodSampleSize || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 text-[10px] block">Test Duration</span>
                                            <span className="font-bold text-slate-700">{glucSpecs.testDurationSeconds ? `${glucSpecs.testDurationSeconds} Seconds` : 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 text-[10px] block">Measuring Range</span>
                                            <span className="font-bold text-slate-700">{glucSpecs.measuringRange || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 text-[10px] block">Battery Required</span>
                                            <span className="font-bold text-slate-700">{glucSpecs.batteryRequired ? 'Yes' : 'No (Direct Power)'}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 text-[10px] block">Auto-Save Cloud Readings</span>
                                            <span className="font-bold text-slate-700">{glucSpecs.autoSaveReadings ? 'Supported (Yes)' : 'No'}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 text-[10px] block">HbA1c Estimation</span>
                                            <span className="font-bold text-slate-700">{glucSpecs.hba1cEstimationCapable ? 'Capable (Yes)' : 'No'}</span>
                                        </div>
                                    </div>

                                    {/* Certifications List */}
                                    {glucSpecs.certifications?.length > 0 && (
                                        <div className="pt-2 border-t border-slate-200/70 flex flex-wrap items-center gap-1.5">
                                            <span className="text-[10px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                                                <Award size={12} /> Certifications:
                                            </span>
                                            {glucSpecs.certifications.map((cert, i) => (
                                                <span key={i} className="bg-slate-200/70 text-slate-700 font-bold px-2 py-0.5 rounded-md text-[10px]">
                                                    {cert}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Strip & Lancet Variants */}
                            {glucVariants.length > 0 && (
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Available Strip & Lancet Variants</span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                        {glucVariants.map((v, idx) => (
                                            <div 
                                                key={v._id || idx} 
                                                className={`p-3 rounded-2xl border ${v.isDefault ? 'bg-indigo-50/40 border-indigo-300 ring-1 ring-indigo-300' : 'bg-slate-50 border-slate-100'} space-y-1.5 relative`}
                                            >
                                                {v.isDefault && (
                                                    <span className="absolute top-2 right-2 bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                                        Default
                                                    </span>
                                                )}
                                                <h5 className="font-bold text-slate-900 pr-12">{v.variantName}</h5>
                                                <p className="text-[11px] text-slate-500 font-medium">
                                                    Strips: <strong className="text-slate-700">{v.stripsCount}</strong> • Lancets: <strong className="text-slate-700">{v.lancetsCount}</strong>
                                                </p>
                                                <div className="flex items-baseline gap-1.5 pt-1 border-t border-slate-200/60">
                                                    <span className="font-black text-slate-900 text-sm">₹{v.sellingPrice}</span>
                                                    {v.mrp && <span className="text-[10px] line-through text-slate-400">₹{v.mrp}</span>}
                                                    <span className="text-[10px] font-bold text-emerald-600 ml-auto">Save ₹{v.savingsAmount}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* CGM Continuous Glucose Monitoring Specifications (if present) */}
                    {cgmConfig && (cgmConfig.sensorLifeSpanDays || cgmConfig.waterResistance) && (
                        <div className="p-4 bg-rose-50/50 border border-rose-200/80 rounded-2xl space-y-3">
                            <span className="text-[10px] font-black uppercase text-rose-800 flex items-center gap-1.5">
                                <Activity size={13} /> Continuous Glucose Monitor (CGM) Details
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-700 font-medium">
                                <div>
                                    <span className="text-[10px] text-slate-400 block">Sensor Lifespan</span>
                                    <strong>{cgmConfig.sensorLifeSpanDays ? `${cgmConfig.sensorLifeSpanDays} Days` : 'N/A'}</strong>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 block">Warmup Time</span>
                                    <strong>{cgmConfig.sensorWarmupTime || 'N/A'}</strong>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 block">Water Resistance</span>
                                    <strong>{cgmConfig.waterResistance || 'N/A'}</strong>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 block">App Sync</span>
                                    <strong>{cgmConfig.appSyncSupported ? 'Yes' : 'No'}</strong>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 block">Coach Support</span>
                                    <strong>{cgmConfig.isCoachSupportIncluded ? cgmConfig.coachSupportDuration || 'Included' : 'Not Included'}</strong>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Box Contents */}
                    {device.boxContents?.length > 0 && (
                        <div className="space-y-1.5">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">In The Box</span>
                            <div className="flex flex-wrap gap-2">
                                {device.boxContents.map((item, idx) => (
                                    <div key={idx} className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 font-bold text-slate-700 flex items-center gap-2">
                                        <Package size={13} className="text-indigo-600" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* FAQs */}
                    {device.faqs?.length > 0 && (
                        <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Frequently Asked Questions</span>
                            <div className="space-y-2">
                                {device.faqs.map((faq, idx) => (
                                    <div key={faq._id || idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                                        <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
                                            <HelpCircle size={13} className="text-indigo-600 shrink-0" />
                                            {faq.question}
                                        </h5>
                                        <p className="text-slate-600 font-medium pl-5 leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Metadata Footer */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[10px] text-slate-400">
                        <span>ID: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{device._id}</code></span>
                        {device.createdAt && (
                            <span className="flex items-center gap-1">
                                <Calendar size={11} /> Created: {new Date(device.createdAt).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                        {device.isFeatured && <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">★ Featured</span>}
                        {device.isPopular && <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">🔥 Popular</span>}
                        {device.isAvailable && <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">✓ In Stock</span>}
                    </div>
                    
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer transition shadow-sm"
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
}