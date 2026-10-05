
"use client";

import React, { useState, useEffect } from 'react';
import {
    Smartphone,
    X,
    Upload,
    Check,
    Loader2,
    Leaf,
    Activity
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminAPI from '../../../../../services/AdminAPI';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';
const getMediaUrl = (path) => {
    if (!path || typeof path !== 'string') return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const cleanBase = BACKEND_URL.replace(/\/+$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
};

export default function CreateProduct({
    isOpen,
    onClose,
    onSuccess,
    categories = [],
    editData = null
}) {
    const isEdit = Boolean(editData);
    const [actionLoading, setActionLoading] = useState(false);
    const [formTab, setFormTab] = useState('basic');

    const [formData, setFormData] = useState({
        categoryId: '',
        title: '',
        brand: 'DiabetesWala',
        deviceModel: 'Curv',
        tagline: '',
        badge: 'AI-Powered',
        productType: 'Glucometer',
        mrp: 1047,
        sellingPrice: 499,
        prepaidDiscountPrice: 474,
        compatibility: 'Android Only',
        connectorType: 'Type-C',
        stockQuantity: 100,
        totalUsersCountDisplay: '8 Lakh+ Users',
        isFeatured: false,
        isPopular: true,
        description: '',
        demoVideoUrl: '',
        supplementDetails: {
            form: 'Capsules',
            dosage: '2 capsules twice daily with water',
            keyIngredients: 'Organic Moringa Leaf Powder, Fenugreek',
            dietaryPreference: '100% Vegetarian',
            netQuantity: '60 Capsules'
        },
        cgmDetails: {
            sensorLifeSpanDays: 14,
            sensorWarmupTime: '60 mins',
            isDoctorConsultationIncluded: true
        }
    });

    const [formVariants, setFormVariants] = useState([]);
    const [formBoxContents, setFormBoxContents] = useState(['1 Smart Device', 'User Manual']);
    const [formHighlights, setFormHighlights] = useState([]);
    const [formFaqs, setFormFaqs] = useState([]);

    const [mainImageFile, setMainImageFile] = useState(null);
    const [mainImagePreview, setMainImagePreview] = useState('');
    const [galleryImageFiles, setGalleryImageFiles] = useState([]);
    const [existingGalleryImages, setExistingGalleryImages] = useState([]);

    useEffect(() => {
        if (editData) {
            const catId = typeof editData.categoryId === 'object' ? editData.categoryId?._id : editData.categoryId;
            setFormData({
                categoryId: catId || categories[0]?._id || '',
                title: editData.title || '',
                brand: editData.brand || 'DiabetesWala',
                deviceModel: editData.deviceModel || 'Curv',
                tagline: editData.tagline || '',
                badge: editData.badge || 'AI-Powered',
                productType: editData.productType || 'Glucometer',
                mrp: editData.mrp || 1047,
                sellingPrice: editData.sellingPrice || 499,
                prepaidDiscountPrice: editData.prepaidDiscountPrice || 474,
                compatibility: editData.compatibility || 'Android Only',
                connectorType: editData.connectorType || 'Type-C',
                stockQuantity: editData.stockQuantity || 100,
                totalUsersCountDisplay: editData.totalUsersCountDisplay || '8 Lakh+ Users',
                isFeatured: Boolean(editData.isFeatured),
                isPopular: Boolean(editData.isPopular),
                description: editData.description || '',
                demoVideoUrl: editData.demoVideoUrl || '',
                supplementDetails: {
                    form: editData.supplementDetails?.form || 'Capsules',
                    dosage: editData.supplementDetails?.dosage || '2 capsules twice daily with water',
                    keyIngredients: Array.isArray(editData.supplementDetails?.keyIngredients)
                        ? editData.supplementDetails.keyIngredients.join(', ')
                        : (editData.supplementDetails?.keyIngredients || 'Organic Moringa'),
                    dietaryPreference: editData.supplementDetails?.dietaryPreference || '100% Vegetarian',
                    netQuantity: editData.supplementDetails?.netQuantity || '60 Capsules'
                },
                cgmDetails: {
                    sensorLifeSpanDays: editData.cgmDetails?.sensorLifeSpanDays || 14,
                    sensorWarmupTime: editData.cgmDetails?.sensorWarmupTime || '60 mins',
                    isDoctorConsultationIncluded: editData.cgmDetails?.isDoctorConsultationIncluded !== undefined ? editData.cgmDetails.isDoctorConsultationIncluded : true
                }
            });

            setFormVariants(editData.variants?.length ? editData.variants : []);
            setFormBoxContents(editData.boxContents?.length ? editData.boxContents : ['1 Smart Device', 'User Manual']);
            setFormHighlights(editData.highlights?.length ? editData.highlights : []);
            setFormFaqs(editData.faqs?.length ? editData.faqs : []);
            setMainImageFile(null);
            setMainImagePreview(editData.mainImage ? getMediaUrl(editData.mainImage) : '');
            setGalleryImageFiles([]);
            setExistingGalleryImages(editData.images || []);
        } else {
            setFormData({
                categoryId: categories[0]?._id || '',
                title: '',
                brand: 'DiabetesWala',
                deviceModel: 'Curv',
                tagline: 'CDSCO Approved Lab-Grade Accuracy | ISO Certified | Lifetime warranty',
                badge: 'AI-Powered',
                productType: 'Glucometer',
                mrp: 1047,
                sellingPrice: 499,
                prepaidDiscountPrice: 474,
                compatibility: 'Android Only',
                connectorType: 'Type-C',
                stockQuantity: 150,
                totalUsersCountDisplay: '8 Lakh+ Users',
                isFeatured: false,
                isPopular: true,
                description: '',
                demoVideoUrl: '',
                supplementDetails: {
                    form: 'Capsules',
                    dosage: '2 capsules twice daily with water',
                    keyIngredients: 'Organic Moringa Leaf Powder, Fenugreek',
                    dietaryPreference: '100% Vegetarian',
                    netQuantity: '60 Capsules'
                },
                cgmDetails: {
                    sensorLifeSpanDays: 14,
                    sensorWarmupTime: '60 mins',
                    isDoctorConsultationIncluded: true
                }
            });
            setFormVariants([
                { variantName: '25 Strips & 25 Lancets', stripsCount: 25, lancetsCount: 25, compatibility: 'Android Only', mrp: 1047, sellingPrice: 499, stockQuantity: 100, isDefault: true }
            ]);
            setFormBoxContents(['1 Smart Device', '25 Strips', '25 Lancets', 'User Manual']);
            setFormHighlights([
                { title: 'Lab-Grade Accuracy', description: 'CV < 2% precision tested at NIB' },
                { title: 'Auto-Saves Readings', description: 'Syncs directly with cloud app' }
            ]);
            setFormFaqs([
                { question: 'Does this device require batteries?', answer: 'No, it draws power directly from your smartphone via Type-C.' }
            ]);
            setMainImageFile(null);
            setMainImagePreview('');
            setGalleryImageFiles([]);
            setExistingGalleryImages([]);
        }
        setFormTab('basic');
    }, [editData, categories, isOpen]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!formData.categoryId) return toast.error('Please select a device category.');
        if (!formData.title.trim()) return toast.error('Product title is required.');
        if (!formData.description.trim()) return toast.error('Product overview description is required.');
        if (!isEdit && !mainImageFile) return toast.error('Primary product image is required.');

        setActionLoading(true);
        try {
            const data = new FormData();

            data.append('categoryId', formData.categoryId);
            data.append('title', formData.title.trim());
            data.append('brand', formData.brand.trim());
            data.append('deviceModel', formData.deviceModel.trim());
            data.append('tagline', formData.tagline.trim());
            data.append('badge', formData.badge.trim());
            data.append('productType', formData.productType);
            data.append('mrp', Number(formData.mrp) || 0);
            data.append('sellingPrice', Number(formData.sellingPrice) || 0);
            data.append('prepaidDiscountPrice', Number(formData.prepaidDiscountPrice) || 0);
            data.append('stockQuantity', Number(formData.stockQuantity) || 0);
            data.append('totalUsersCountDisplay', formData.totalUsersCountDisplay);
            data.append('isFeatured', formData.isFeatured);
            data.append('isPopular', formData.isPopular);
            data.append('description', formData.description.trim());
            if (formData.demoVideoUrl) data.append('demoVideoUrl', formData.demoVideoUrl.trim());

            if (formData.productType === 'Supplement') {
                data.append('compatibility', 'Universal / Not Applicable');
                data.append('connectorType', 'None');
                data.append('supplementDetails', JSON.stringify({
                    form: formData.supplementDetails.form,
                    dosage: formData.supplementDetails.dosage,
                    keyIngredients: formData.supplementDetails.keyIngredients.split(',').map((s) => s.trim()).filter(Boolean),
                    dietaryPreference: formData.supplementDetails.dietaryPreference,
                    netQuantity: formData.supplementDetails.netQuantity
                }));
            } else if (formData.productType === 'CGM') {
                data.append('compatibility', formData.compatibility);
                data.append('connectorType', formData.connectorType || 'Bluetooth / Wireless');
                data.append('cgmDetails', JSON.stringify({
                    sensorLifeSpanDays: Number(formData.cgmDetails.sensorLifeSpanDays) || 14,
                    sensorWarmupTime: formData.cgmDetails.sensorWarmupTime,
                    isDoctorConsultationIncluded: Boolean(formData.cgmDetails.isDoctorConsultationIncluded)
                }));
            } else {
                data.append('compatibility', formData.compatibility);
                data.append('connectorType', formData.connectorType);
            }

            data.append('variants', JSON.stringify(formVariants));
            data.append('boxContents', JSON.stringify(formBoxContents.filter(Boolean)));
            data.append('highlights', JSON.stringify(formHighlights.filter((h) => h.title && h.title.trim())));
            data.append('faqs', JSON.stringify(formFaqs.filter((f) => f.question && f.question.trim())));

            if (mainImageFile) {
                data.append('mainImage', mainImageFile);
            }
            if (galleryImageFiles && galleryImageFiles.length > 0) {
                Array.from(galleryImageFiles).forEach((file) => {
                    data.append('images', file);
                });
            }

            let response;
            if (isEdit) {
                response = await AdminAPI.updateCgmDevice(editData._id, data);
            } else {
                response = await AdminAPI.createCgmDevice(data);
            }

            if (response && response.success) {
                toast.success(response.message || (isEdit ? 'Device updated successfully!' : 'Device created successfully!'));
                onSuccess();
            } else {
                toast.error(response?.message || 'Failed to save device.');
            }
        } catch (err) {
            console.error('Error submitting device:', err);
            toast.error(err.response?.data?.message || 'Error processing request.');
        } finally {
            setActionLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-5 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl relative text-left overflow-hidden">
                <div className="px-6 py-5 sm:px-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#3d3f96]/10 text-[#3d3f96] flex items-center justify-center border border-[#3d3f96]/20">
                            <Smartphone size={22} />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight">
                                {isEdit ? `Edit Product (${formData.title || 'Device'})` : 'Add New Glucose Monitoring Device'}
                            </h3>
                            <p className="text-xs text-slate-400 font-semibold mt-0.5">
                                Configure specifications, variants, pricing, and high-resolution attachments.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="px-6 sm:px-8 bg-slate-50/40 border-b border-slate-100 flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden shrink-0 py-2">
                    {[
                        { id: 'basic', label: '1. Basic Info' },
                        { id: 'type_specific', label: '2. Type Specs' },
                        { id: 'pricing', label: '3. Pricing & Stock' },
                        { id: 'media', label: '4. Images & Media' },
                        { id: 'variants_faqs', label: '5. Variants & FAQs' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setFormTab(tab.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer shrink-0 ${formTab === tab.id
                                    ? 'bg-white text-[#3d3f96] shadow-xs border border-slate-200'
                                    : 'text-slate-500 hover:text-slate-900'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 [&::-webkit-scrollbar]:hidden">
                    {formTab === 'basic' && (
                        <div className="space-y-4 animate-in fade-in">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-500">
                                        Device Category <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        required
                                        value={formData.categoryId}
                                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#3d3f96]"
                                    >
                                        {categories.map((c) => (
                                            <option key={c._id} value={c._id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-500">
                                        Product Classification <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={formData.productType}
                                        onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black text-indigo-700 focus:outline-none focus:border-[#3d3f96]"
                                    >
                                        <option value="Glucometer">Glucometer (Smart Smartphone Unit)</option>
                                        <option value="CGM">CGM (Continuous Glucose Monitor Sensor)</option>
                                        <option value="Supplement">Supplement (Diabetic Nutrition &amp; Care)</option>
                                        <option value="Accessory">Accessory (Lancets &amp; Strips)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-500">
                                    Product Display Title <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. New DiabetesWala AI-Powered Glucometer | Auto Saves Readings"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#3d3f96]"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-500">Brand</label>
                                    <input
                                        type="text"
                                        value={formData.brand}
                                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-500">Device Model</label>
                                    <input
                                        type="text"
                                        value={formData.deviceModel}
                                        onChange={(e) => setFormData({ ...formData, deviceModel: e.target.value })}
                                        placeholder="Curv, Smart, CGM Sensor"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-500">Highlight Badge</label>
                                    <input
                                        type="text"
                                        value={formData.badge}
                                        onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                                        placeholder="AI-Powered, 24/7 Sensor"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-500">Subtitle / Tagline</label>
                                <input
                                    type="text"
                                    value={formData.tagline}
                                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                                    placeholder="CDSCO Approved Lab-Grade Accuracy | ISO Certified | Lifetime warranty"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-500">
                                    Product Overview Description <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    rows={4}
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Detailed overview description..."
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 leading-relaxed focus:outline-none focus:border-[#3d3f96]"
                                />
                            </div>
                        </div>
                    )}

                    {formTab === 'type_specific' && (
                        <div className="space-y-4 animate-in fade-in">
                            {formData.productType === 'Supplement' ? (
                                <div className="p-5 bg-emerald-50/50 border border-emerald-200 rounded-3xl space-y-4">
                                    <div className="flex items-center gap-2 border-b border-emerald-100 pb-2">
                                        <Leaf size={16} className="text-emerald-700" />
                                        <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900">
                                            Supplement Specific Specifications
                                        </h4>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase text-slate-500">Supplement Form</label>
                                            <input
                                                type="text"
                                                value={formData.supplementDetails.form}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    supplementDetails: { ...formData.supplementDetails, form: e.target.value }
                                                })}
                                                placeholder="Capsules, Powder, Liquid / Juice"
                                                className="w-full px-3.5 py-2 bg-white border border-emerald-200 rounded-xl text-xs font-bold text-slate-800"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase text-slate-500">Net Quantity</label>
                                            <input
                                                type="text"
                                                value={formData.supplementDetails.netQuantity}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    supplementDetails: { ...formData.supplementDetails, netQuantity: e.target.value }
                                                })}
                                                placeholder="60 Capsules, 100g"
                                                className="w-full px-3.5 py-2 bg-white border border-emerald-200 rounded-xl text-xs font-bold text-slate-800"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-500">Recommended Dosage</label>
                                        <input
                                            type="text"
                                            value={formData.supplementDetails.dosage}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                supplementDetails: { ...formData.supplementDetails, dosage: e.target.value }
                                            })}
                                            placeholder="2 capsules twice daily with water"
                                            className="w-full px-3.5 py-2 bg-white border border-emerald-200 rounded-xl text-xs font-bold text-slate-800"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-500">Key Ingredients (Comma-separated)</label>
                                        <input
                                            type="text"
                                            value={formData.supplementDetails.keyIngredients}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                supplementDetails: { ...formData.supplementDetails, keyIngredients: e.target.value }
                                            })}
                                            placeholder="Organic Moringa Leaf Powder, Shilajit, Fenugreek"
                                            className="w-full px-3.5 py-2 bg-white border border-emerald-200 rounded-xl text-xs font-bold text-slate-800"
                                        />
                                    </div>
                                </div>
                            ) : formData.productType === 'CGM' ? (
                                <div className="p-5 bg-rose-50/50 border border-rose-200 rounded-3xl space-y-4">
                                    <div className="flex items-center gap-2 border-b border-rose-100 pb-2">
                                        <Activity size={16} className="text-rose-700" />
                                        <h4 className="text-xs font-black uppercase tracking-wider text-rose-900">
                                            CGM Continuous Sensor Specifications
                                        </h4>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase text-slate-500">Sensor Lifespan (Days)</label>
                                            <input
                                                type="number"
                                                value={formData.cgmDetails.sensorLifeSpanDays}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    cgmDetails: { ...formData.cgmDetails, sensorLifeSpanDays: e.target.value }
                                                })}
                                                placeholder="14"
                                                className="w-full px-3.5 py-2 bg-white border border-rose-200 rounded-xl text-xs font-bold text-slate-800"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase text-slate-500">Warmup Time</label>
                                            <input
                                                type="text"
                                                value={formData.cgmDetails.sensorWarmupTime}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    cgmDetails: { ...formData.cgmDetails, sensorWarmupTime: e.target.value }
                                                })}
                                                placeholder="60 mins"
                                                className="w-full px-3.5 py-2 bg-white border border-rose-200 rounded-xl text-xs font-bold text-slate-800"
                                            />
                                        </div>
                                    </div>

                                    <label className="flex items-center gap-3 p-3 bg-white border border-rose-200 rounded-2xl cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.cgmDetails.isDoctorConsultationIncluded}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                cgmDetails: { ...formData.cgmDetails, isDoctorConsultationIncluded: e.target.checked }
                                            })}
                                            className="w-4 h-4 accent-rose-600 rounded"
                                        />
                                        <span className="text-xs font-bold text-slate-800">
                                            Include complimentary Diabetologist / Nutritionist consultation
                                        </span>
                                    </label>
                                </div>
                            ) : (
                                <div className="p-5 bg-indigo-50/40 border border-indigo-200 rounded-3xl space-y-4">
                                    <div className="flex items-center gap-2 border-b border-indigo-100 pb-2">
                                        <Smartphone size={16} className="text-[#3d3f96]" />
                                        <h4 className="text-xs font-black uppercase tracking-wider text-indigo-900">
                                            Glucometer Hardware &amp; Connectivity
                                        </h4>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase text-slate-500">OS Compatibility</label>
                                            <select
                                                value={formData.compatibility}
                                                onChange={(e) => setFormData({ ...formData, compatibility: e.target.value })}
                                                className="w-full px-3.5 py-2.5 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-slate-800"
                                            >
                                                <option value="Android Only">Android Only</option>
                                                <option value="Android & iOS">Android &amp; iOS</option>
                                                <option value="iOS Only">iOS Only</option>
                                                <option value="Universal / Not Applicable">Universal</option>
                                            </select>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase text-slate-500">Port / Connector Type</label>
                                            <select
                                                value={formData.connectorType}
                                                onChange={(e) => setFormData({ ...formData, connectorType: e.target.value })}
                                                className="w-full px-3.5 py-2.5 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-slate-800"
                                            >
                                                <option value="Type-C">Type-C (Android)</option>
                                                <option value="Micro-USB">Micro-USB</option>
                                                <option value="Lightning (iPhone)">Lightning (iPhone)</option>
                                                <option value="3.5mm Audio Jack">3.5mm Audio Jack</option>
                                                <option value="Bluetooth / Wireless">Bluetooth / Wireless</option>
                                                <option value="NFC">NFC</option>
                                                <option value="None">None</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-500">Total Users Trust Label</label>
                                <input
                                    type="text"
                                    value={formData.totalUsersCountDisplay}
                                    onChange={(e) => setFormData({ ...formData, totalUsersCountDisplay: e.target.value })}
                                    placeholder="8 Lakh+ Users"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800"
                                />
                            </div>
                        </div>
                    )}

                    {formTab === 'pricing' && (
                        <div className="space-y-4 animate-in fade-in">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-500">MRP (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.mrp}
                                        onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-500">Selling Price (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.sellingPrice}
                                        onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-500">Prepaid Special Price (₹)</label>
                                    <input
                                        type="number"
                                        value={formData.prepaidDiscountPrice}
                                        onChange={(e) => setFormData({ ...formData, prepaidDiscountPrice: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-500">Stock Units Available</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.stockQuantity}
                                        onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-500">Demo Video URL (Optional)</label>
                                    <input
                                        type="url"
                                        value={formData.demoVideoUrl}
                                        onChange={(e) => setFormData({ ...formData, demoVideoUrl: e.target.value })}
                                        placeholder="https://youtube.com/watch?v=..."
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-6 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={formData.isPopular}
                                        onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                                        className="w-4 h-4 accent-[#3d3f96] rounded"
                                    />
                                    <span>Mark as Popular Choice</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={formData.isFeatured}
                                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                        className="w-4 h-4 accent-[#3d3f96] rounded"
                                    />
                                    <span>Show in Featured Spotlight</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {formTab === 'media' && (
                        <div className="space-y-4 animate-in fade-in">
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-3xl space-y-3">
                                <span className="text-[10px] font-black uppercase text-slate-500 block">
                                    Main Showcase Photo {!isEdit && <span className="text-rose-500">*</span>}
                                </span>
                                <div className="flex items-center gap-4">
                                    {mainImagePreview && (
                                        <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 overflow-hidden shrink-0">
                                            <img src={mainImagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <label className="flex-1 p-4 bg-white border border-dashed border-slate-300 hover:border-[#3d3f96] rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition">
                                        <Upload size={16} className="text-slate-400" />
                                        <span className="text-xs font-bold text-slate-700">
                                            {mainImageFile ? mainImageFile.name : 'Upload Primary Image (JPG, PNG, WebP)'}
                                        </span>
                                        <input
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.webp"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    setMainImageFile(e.target.files[0]);
                                                    setMainImagePreview(URL.createObjectURL(e.target.files[0]));
                                                }
                                            }}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-3xl space-y-3">
                                <span className="text-[10px] font-black uppercase text-slate-500 block">
                                    Gallery Images (Up to 10 photos)
                                </span>

                                {existingGalleryImages.length > 0 && (
                                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                                        {existingGalleryImages.map((img, idx) => (
                                            <div key={idx} className="w-14 h-14 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0">
                                                <img src={getMediaUrl(img)} alt="Gallery" className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <label className="p-4 bg-white border border-dashed border-slate-300 hover:border-[#3d3f96] rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition">
                                    <Upload size={16} className="text-slate-400" />
                                    <span className="text-xs font-bold text-slate-700">
                                        {galleryImageFiles.length > 0 ? `${galleryImageFiles.length} new photos selected` : 'Select Gallery Photos'}
                                    </span>
                                    <input
                                        type="file"
                                        multiple
                                        accept=".jpg,.jpeg,.png,.webp"
                                        onChange={(e) => {
                                            if (e.target.files) setGalleryImageFiles(Array.from(e.target.files));
                                        }}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>
                    )}

                    {formTab === 'variants_faqs' && (
                        <div className="space-y-6 animate-in fade-in">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase text-slate-500">In-The-Box Contents</span>
                                    <button
                                        type="button"
                                        onClick={() => setFormBoxContents([...formBoxContents, ''])}
                                        className="text-[11px] font-black text-[#3d3f96] uppercase cursor-pointer"
                                    >
                                        + Add Item
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {formBoxContents.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={item}
                                                onChange={(e) => {
                                                    const copy = [...formBoxContents];
                                                    copy[idx] = e.target.value;
                                                    setFormBoxContents(copy);
                                                }}
                                                placeholder="e.g. 25 Test Strips, 1 Lancing Pen"
                                                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setFormBoxContents(formBoxContents.filter((_, i) => i !== idx))}
                                                className="text-rose-500 p-1.5 hover:bg-rose-50 rounded-lg cursor-pointer"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2 pt-4 border-t border-slate-100">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase text-slate-500">Frequently Asked Questions</span>
                                    <button
                                        type="button"
                                        onClick={() => setFormFaqs([...formFaqs, { question: '', answer: '' }])}
                                        className="text-[11px] font-black text-[#3d3f96] uppercase cursor-pointer"
                                    >
                                        + Add FAQ
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {formFaqs.map((faq, idx) => (
                                        <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <input
                                                    type="text"
                                                    value={faq.question}
                                                    onChange={(e) => {
                                                        const copy = [...formFaqs];
                                                        copy[idx].question = e.target.value;
                                                        setFormFaqs(copy);
                                                    }}
                                                    placeholder="Question (e.g. Is it CDSCO approved?)"
                                                    className="flex-1 px-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setFormFaqs(formFaqs.filter((_, i) => i !== idx))}
                                                    className="text-rose-500 p-1 cursor-pointer"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                            <textarea
                                                rows={2}
                                                value={faq.answer}
                                                onChange={(e) => {
                                                    const copy = [...formFaqs];
                                                    copy[idx].answer = e.target.value;
                                                    setFormFaqs(copy);
                                                }}
                                                placeholder="Answer explanation..."
                                                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium resize-none"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 text-slate-500 hover:bg-slate-100 text-xs font-black uppercase tracking-wider rounded-2xl transition cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={actionLoading}
                            className="px-10 py-3.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-lg shadow-indigo-950/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
                        >
                            {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} strokeWidth={3} />}
                            <span>{isEdit ? 'Save Changes' : 'Publish Product'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}