"use client";

import React, { useState, useEffect } from 'react';
import {
    Smartphone,
    Activity,
    X,
    Upload,
    Check,
    Loader2,
    Plus,
    Trash2,
    Sparkles,
    ShieldCheck,
    HelpCircle,
    Package,
    Layers,
    IndianRupee,
    Info,
    ListOrdered
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

    // --- 1. Common Master Form State ---
    const [formData, setFormData] = useState({
        categoryId: '',
        productType: 'Glucometer', // 'Glucometer' | 'CGM'
        title: '',
        brand: 'DiabetesWala',
        deviceModel: 'Curv',
        tagline: 'CDSCO Approved Lab-Grade Accuracy | ISO Certified | Lifetime warranty',
        badge: 'AI-Powered',
        mrp: 1047,
        sellingPrice: 499,
        stockQuantity: 100,
        totalUsersCountDisplay: '8 Lakh+ Users',
        isFeatured: false,
        isPopular: true,
        description: '',
        demoVideoUrl: ''
    });

    // --- 2. Glucometer Specific Config State ---
    const [glucometerConfig, setGlucometerConfig] = useState({
        compatibility: 'Android Only',
        connectorType: 'Type-C',
        specifications: {
            coefficientOfVariation: 'CV < 2%',
            accuracyTesting: 'NIB Tested & CDSCO Approved',
            certifications: ['ISO 15197:2013', 'CDSCO Approved', 'CE Certified'],
            bloodSampleSize: '0.5 µL',
            testDurationSeconds: 5,
            measuringRange: '20 - 600 mg/dL',
            batteryRequired: false,
            autoSaveReadings: true,
            hba1cEstimationCapable: true,
            warranty: 'Lifetime Warranty'
        }
    });
    const [stripLancetVariants, setStripLancetVariants] = useState([
        {
            variantName: '25 Strips & 25 Lancets',
            stripsCount: 25,
            lancetsCount: 25,
            compatibility: 'Android Only',
            mrp: 1047,
            sellingPrice: 499,
            stockQuantity: 100,
            isDefault: true
        }
    ]);

    // --- 3. CGM Specific Config State ---
    const [cgmConfig, setCgmConfig] = useState({
        sensorLifeSpanDays: 15,
        sensorWarmupTime: '60 mins',
        waterResistance: 'IP28 Water Resistant',
        appSyncSupported: true,
        isCoachSupportIncluded: true,
        coachSupportDuration: '1 Month Free Coaching'
    });
    const [cgmPacks, setCgmPacks] = useState([
        {
            packName: 'Pack of 1',
            sensorsCount: 1,
            mrp: 5400,
            sellingPrice: 3947,
            savingsBadge: '',
            stockQuantity: 50,
            isDefault: true
        }
    ]);

    // --- 4. Extra Content Arrays ---
    const [boxContents, setBoxContents] = useState(['1 Smart Device', 'User Manual']);
    const [highlights, setHighlights] = useState([
        { icon: '', title: 'Lab-Grade Accuracy', description: 'CV < 2% precision tested at NIB' }
    ]);
    const [howToUseSteps, setHowToUseSteps] = useState([]);
    const [faqs, setFaqs] = useState([
        { question: 'Does this device require batteries?', answer: 'No, it draws power directly from your smartphone via Type-C.' }
    ]);

    // --- 5. Media Upload States ---
    const [mainImageFile, setMainImageFile] = useState(null);
    const [mainImagePreview, setMainImagePreview] = useState('');
    const [galleryImageFiles, setGalleryImageFiles] = useState([]);
    const [existingGalleryImages, setExistingGalleryImages] = useState([]);

    // Populate or Reset Form
    useEffect(() => {
        if (editData) {
            const catId = typeof editData.categoryId === 'object' ? editData.categoryId?._id : editData.categoryId;
            const pType = editData.productType === 'CGM' ? 'CGM' : 'Glucometer';

            setFormData({
                categoryId: catId || categories[0]?._id || '',
                productType: pType,
                title: editData.title || '',
                brand: editData.brand || 'DiabetesWala',
                deviceModel: editData.deviceModel || 'Curv',
                tagline: editData.tagline || '',
                badge: editData.badge || 'AI-Powered',
                mrp: editData.mrp || 1047,
                sellingPrice: editData.sellingPrice || 499,
                stockQuantity: editData.stockQuantity || 100,
                totalUsersCountDisplay: editData.totalUsersCountDisplay || '8 Lakh+ Users',
                isFeatured: Boolean(editData.isFeatured),
                isPopular: Boolean(editData.isPopular),
                description: editData.description || '',
                demoVideoUrl: editData.demoVideoUrl || ''
            });

            // Edit Glucometer Config
            if (editData.glucometerConfig) {
                setGlucometerConfig({
                    compatibility: editData.glucometerConfig.compatibility || 'Android Only',
                    connectorType: editData.glucometerConfig.connectorType || 'Type-C',
                    specifications: {
                        coefficientOfVariation: editData.glucometerConfig.specifications?.coefficientOfVariation || 'CV < 2%',
                        accuracyTesting: editData.glucometerConfig.specifications?.accuracyTesting || 'NIB Tested & CDSCO Approved',
                        certifications: editData.glucometerConfig.specifications?.certifications || ['ISO 15197:2013', 'CDSCO Approved', 'CE Certified'],
                        bloodSampleSize: editData.glucometerConfig.specifications?.bloodSampleSize || '0.5 µL',
                        testDurationSeconds: editData.glucometerConfig.specifications?.testDurationSeconds || 5,
                        measuringRange: editData.glucometerConfig.specifications?.measuringRange || '20 - 600 mg/dL',
                        batteryRequired: Boolean(editData.glucometerConfig.specifications?.batteryRequired),
                        autoSaveReadings: editData.glucometerConfig.specifications?.autoSaveReadings !== undefined ? editData.glucometerConfig.specifications.autoSaveReadings : true,
                        hba1cEstimationCapable: editData.glucometerConfig.specifications?.hba1cEstimationCapable !== undefined ? editData.glucometerConfig.specifications.hba1cEstimationCapable : true,
                        warranty: editData.glucometerConfig.specifications?.warranty || 'Lifetime Warranty'
                    }
                });
                setStripLancetVariants(editData.glucometerConfig.stripLancetVariants?.length ? editData.glucometerConfig.stripLancetVariants : []);
            }

            // Edit CGM Config
            if (editData.cgmConfig) {
                setCgmConfig({
                    sensorLifeSpanDays: editData.cgmConfig.sensorLifeSpanDays || 15,
                    sensorWarmupTime: editData.cgmConfig.sensorWarmupTime || '60 mins',
                    waterResistance: editData.cgmConfig.waterResistance || 'IP28 Water Resistant',
                    appSyncSupported: editData.cgmConfig.appSyncSupported !== undefined ? editData.cgmConfig.appSyncSupported : true,
                    isCoachSupportIncluded: editData.cgmConfig.isCoachSupportIncluded !== undefined ? editData.cgmConfig.isCoachSupportIncluded : true,
                    coachSupportDuration: editData.cgmConfig.coachSupportDuration || '1 Month Free Coaching'
                });
                setCgmPacks(editData.cgmConfig.cgmPacks?.length ? editData.cgmConfig.cgmPacks : []);
            }

            setBoxContents(editData.boxContents?.length ? editData.boxContents : ['1 Smart Device', 'User Manual']);
            setHighlights(editData.highlights?.length ? editData.highlights : []);
            setHowToUseSteps(editData.howToUseSteps?.length ? editData.howToUseSteps : []);
            setFaqs(editData.faqs?.length ? editData.faqs : []);

            setMainImageFile(null);
            setMainImagePreview(editData.mainImage ? getMediaUrl(editData.mainImage) : '');
            setGalleryImageFiles([]);
            setExistingGalleryImages(editData.images || []);
        } else {
            // Reset to defaults for new product
            setFormData({
                categoryId: categories[0]?._id || '',
                productType: 'Glucometer',
                title: '',
                brand: 'DiabetesWala',
                deviceModel: 'Curv',
                tagline: 'CDSCO Approved Lab-Grade Accuracy | ISO Certified | Lifetime warranty',
                badge: 'AI-Powered',
                mrp: 1047,
                sellingPrice: 499,
                stockQuantity: 100,
                totalUsersCountDisplay: '8 Lakh+ Users',
                isFeatured: false,
                isPopular: true,
                description: '',
                demoVideoUrl: ''
            });
            setGlucometerConfig({
                compatibility: 'Android Only',
                connectorType: 'Type-C',
                specifications: {
                    coefficientOfVariation: 'CV < 2%',
                    accuracyTesting: 'NIB Tested & CDSCO Approved',
                    certifications: ['ISO 15197:2013', 'CDSCO Approved', 'CE Certified'],
                    bloodSampleSize: '0.5 µL',
                    testDurationSeconds: 5,
                    measuringRange: '20 - 600 mg/dL',
                    batteryRequired: false,
                    autoSaveReadings: true,
                    hba1cEstimationCapable: true,
                    warranty: 'Lifetime Warranty'
                }
            });
            setStripLancetVariants([
                {
                    variantName: '25 Strips & 25 Lancets',
                    stripsCount: 25,
                    lancetsCount: 25,
                    compatibility: 'Android Only',
                    mrp: 1047,
                    sellingPrice: 499,
                    stockQuantity: 100,
                    isDefault: true
                },
                {
                    variantName: '50 Strips & 50 Lancets',
                    stripsCount: 50,
                    lancetsCount: 50,
                    compatibility: 'Android Only',
                    mrp: 1699,
                    sellingPrice: 849,
                    stockQuantity: 50,
                    isDefault: false
                }
            ]);
            setCgmConfig({
                sensorLifeSpanDays: 15,
                sensorWarmupTime: '60 mins',
                waterResistance: 'IP28 Water Resistant',
                appSyncSupported: true,
                isCoachSupportIncluded: true,
                coachSupportDuration: '1 Month Free Coaching'
            });
            setCgmPacks([
                {
                    packName: 'Pack of 1',
                    sensorsCount: 1,
                    mrp: 5400,
                    sellingPrice: 3947,
                    savingsBadge: '',
                    stockQuantity: 50,
                    isDefault: true
                },
                {
                    packName: 'Pack of 2',
                    sensorsCount: 2,
                    mrp: 10800,
                    sellingPrice: 7499,
                    savingsBadge: '',
                    stockQuantity: 40,
                    isDefault: false
                }
            ]);
            setBoxContents(['1 Smart Device', 'User Manual']);
            setHighlights([
                { icon: '', title: 'Lab-Grade Accuracy', description: 'CV < 2% precision tested at NIB' },
                { icon: '', title: 'Auto-Saves Readings', description: 'Syncs directly with cloud app' }
            ]);
            setHowToUseSteps([]);
            setFaqs([
                { question: 'Does this device require batteries?', answer: 'No, it draws power directly from your smartphone via Type-C.' }
            ]);
            setMainImageFile(null);
            setMainImagePreview('');
            setGalleryImageFiles([]);
            setExistingGalleryImages([]);
        }
        setFormTab('basic');
    }, [editData, categories, isOpen]);

    // --- FORM SUBMIT HANDLER ---
    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!formData.categoryId) return toast.error('Please select a device category.');
        if (!formData.title.trim()) return toast.error('Product title is required.');
        if (!formData.description.trim()) return toast.error('Product overview description is required.');
        if (!isEdit && !mainImageFile) return toast.error('Main product image is required.');

        setActionLoading(true);
        try {
            const data = new FormData();

            // 1. Common Master Fields
            data.append('categoryId', formData.categoryId);
            data.append('productType', formData.productType);
            data.append('title', formData.title.trim());
            data.append('brand', formData.brand.trim());
            data.append('deviceModel', formData.deviceModel.trim());
            data.append('tagline', formData.tagline.trim());
            data.append('badge', formData.badge.trim());
            data.append('mrp', Number(formData.mrp) || 0);
            data.append('sellingPrice', Number(formData.sellingPrice) || 0);
            data.append('stockQuantity', Number(formData.stockQuantity) || 0);
            data.append('totalUsersCountDisplay', formData.totalUsersCountDisplay.trim());
            data.append('isFeatured', Boolean(formData.isFeatured));
            data.append('isPopular', Boolean(formData.isPopular));
            data.append('description', formData.description.trim());
            if (formData.demoVideoUrl) data.append('demoVideoUrl', formData.demoVideoUrl.trim());

            // 2. Specific Configs Payload
            if (formData.productType === 'Glucometer') {
                const finalGlucometerConfig = {
                    compatibility: glucometerConfig.compatibility,
                    connectorType: glucometerConfig.connectorType,
                    stripLancetVariants: stripLancetVariants.map(v => ({
                        variantName: v.variantName,
                        stripsCount: Number(v.stripsCount) || 0,
                        lancetsCount: Number(v.lancetsCount) || 0,
                        compatibility: v.compatibility || glucometerConfig.compatibility,
                        mrp: Number(v.mrp) || 0,
                        sellingPrice: Number(v.sellingPrice) || 0,
                        stockQuantity: Number(v.stockQuantity) || 0,
                        isDefault: Boolean(v.isDefault)
                    })),
                    specifications: {
                        ...glucometerConfig.specifications,
                        testDurationSeconds: Number(glucometerConfig.specifications.testDurationSeconds) || 5,
                        certifications: Array.isArray(glucometerConfig.specifications.certifications)
                            ? glucometerConfig.specifications.certifications
                            : (glucometerConfig.specifications.certifications || '').split(',').map(s => s.trim()).filter(Boolean)
                    }
                };
                data.append('glucometerConfig', JSON.stringify(finalGlucometerConfig));
            } else if (formData.productType === 'CGM') {
                const finalCgmConfig = {
                    sensorLifeSpanDays: Number(cgmConfig.sensorLifeSpanDays) || 15,
                    sensorWarmupTime: cgmConfig.sensorWarmupTime,
                    waterResistance: cgmConfig.waterResistance,
                    appSyncSupported: Boolean(cgmConfig.appSyncSupported),
                    isCoachSupportIncluded: Boolean(cgmConfig.isCoachSupportIncluded),
                    coachSupportDuration: cgmConfig.coachSupportDuration,
                    cgmPacks: cgmPacks.map(p => ({
                        packName: p.packName,
                        sensorsCount: Number(p.sensorsCount) || 1,
                        mrp: Number(p.mrp) || 0,
                        sellingPrice: Number(p.sellingPrice) || 0,
                        savingsBadge: p.savingsBadge || '',
                        stockQuantity: Number(p.stockQuantity) || 0,
                        isDefault: Boolean(p.isDefault)
                    }))
                };
                data.append('cgmConfig', JSON.stringify(finalCgmConfig));
            }

            // 3. Structured Content Arrays
            data.append('boxContents', JSON.stringify(boxContents.filter(Boolean)));
            data.append('highlights', JSON.stringify(highlights.filter(h => h.title && h.title.trim())));
            data.append('howToUseSteps', JSON.stringify(howToUseSteps.filter(s => s.title && s.title.trim())));
            data.append('faqs', JSON.stringify(faqs.filter(f => f.question && f.question.trim())));

            // 4. Media Attachments
            if (mainImageFile) {
                data.append('mainImage', mainImageFile);
            }
            if (galleryImageFiles && galleryImageFiles.length > 0) {
                Array.from(galleryImageFiles).forEach((file) => {
                    data.append('images', file);
                });
            }

            // 5. Send Request
            let response;
            if (isEdit) {
                response = await AdminAPI.updateCgmDevice(editData._id, data);
            } else {
                response = await AdminAPI.createCgmDevice(data);
            }

            if (response && response.success) {
                toast.success(response.message || (isEdit ? 'Device updated successfully!' : 'Product created successfully!'));
                onSuccess();
            } else {
                toast.error(response?.message || 'Failed to save device.');
            }
        } catch (err) {
            console.error('Error submitting product:', err);
            toast.error(err.response?.data?.message || 'Error processing request.');
        } finally {
            setActionLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-5 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl relative text-left overflow-hidden">
                
                {/* --- HEADER --- */}
                <div className="px-6 py-5 sm:px-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#3d3f96]/10 text-[#3d3f96] flex items-center justify-center border border-[#3d3f96]/20 shrink-0">
                            {formData.productType === 'CGM' ? <Activity size={22} /> : <Smartphone size={22} />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight">
                                    {isEdit ? `Edit (${formData.title || 'Product'})` : 'Add New Glucose Product'}
                                </h3>
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                                    formData.productType === 'CGM' ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-[#3d3f96]'
                                }`}>
                                    {formData.productType}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 font-semibold mt-0.5">
                                Set specifications, multi-pack variants, pricing, and high-resolution visuals.
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

                {/* --- NAVIGATION TABS --- */}
                <div className="px-6 sm:px-8 bg-slate-50/40 border-b border-slate-100 flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden shrink-0 py-2">
                    {[
                        { id: 'basic', label: '1. Basic Info' },
                        { id: 'config', label: `2. ${formData.productType} Specs` },
                        { id: 'variants', label: `3. ${formData.productType === 'CGM' ? 'CGM Packs' : 'Strip Variants'}` },
                        { id: 'pricing_media', label: '4. Pricing & Media' },
                        { id: 'content', label: '5. Box & Highlights' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setFormTab(tab.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer shrink-0 ${
                                formTab === tab.id
                                    ? 'bg-white text-[#3d3f96] shadow-xs border border-slate-200'
                                    : 'text-slate-500 hover:text-slate-900'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* --- FORM CONTAINER --- */}
                <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 [&::-webkit-scrollbar]:hidden">
                    
                    {/* TAB 1: BASIC INFO */}
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
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#3d3f96] cursor-pointer"
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
                                        Product Type <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={formData.productType}
                                        onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black text-[#3d3f96] focus:outline-none focus:border-[#3d3f96] cursor-pointer"
                                    >
                                        <option value="Glucometer">Glucometer (Smart Smartphone Unit)</option>
                                        <option value="CGM">CGM (Continuous Glucose Monitor Sensor)</option>
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
                                    placeholder={formData.productType === 'CGM' ? 'e.g. BeatO 24/7 Real-Time CGM Continuous Sensor' : 'e.g. BeatO Curv AI-Powered Glucometer | Auto Saves Readings'}
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
                                        placeholder="AI-Powered, DEAL OF THE DAY"
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
                                    placeholder="Detailed clinical and commercial product overview..."
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 leading-relaxed focus:outline-none focus:border-[#3d3f96]"
                                />
                            </div>
                        </div>
                    )}

                    {/* TAB 2: HARDWARE & CLINICAL SPECS */}
                    {formTab === 'config' && (
                        <div className="space-y-5 animate-in fade-in">
                            {formData.productType === 'Glucometer' ? (
                                <div className="p-5 bg-indigo-50/40 border border-indigo-200/80 rounded-3xl space-y-4">
                                    <div className="flex items-center gap-2 border-b border-indigo-100 pb-2">
                                        <Smartphone size={16} className="text-[#3d3f96]" />
                                        <h4 className="text-xs font-black uppercase tracking-wider text-indigo-900">
                                            Glucometer Hardware &amp; Clinical Specifications
                                        </h4>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase text-slate-500">OS Compatibility</label>
                                            <select
                                                value={glucometerConfig.compatibility}
                                                onChange={(e) => setGlucometerConfig({ ...glucometerConfig, compatibility: e.target.value })}
                                                className="w-full px-3.5 py-2.5 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-slate-800"
                                            >
                                                <option value="Android Only">Android Only</option>
                                                <option value="Android & iOS">Android &amp; iOS</option>
                                                <option value="iOS Only">iOS Only</option>
                                                <option value="Universal">Universal</option>
                                            </select>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase text-slate-500">Connector Type</label>
                                            <select
                                                value={glucometerConfig.connectorType}
                                                onChange={(e) => setGlucometerConfig({ ...glucometerConfig, connectorType: e.target.value })}
                                                className="w-full px-3.5 py-2.5 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-slate-800"
                                            >
                                                <option value="Type-C">Type-C (Android)</option>
                                                <option value="Micro-USB">Micro-USB</option>
                                                <option value="Lightning (iPhone)">Lightning (iPhone)</option>
                                                <option value="3.5mm Audio Jack">3.5mm Audio Jack</option>
                                                <option value="Bluetooth / Wireless">Bluetooth / Wireless</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-slate-500">Blood Sample Size</label>
                                            <input
                                                type="text"
                                                value={glucometerConfig.specifications.bloodSampleSize}
                                                onChange={(e) => setGlucometerConfig({
                                                    ...glucometerConfig,
                                                    specifications: { ...glucometerConfig.specifications, bloodSampleSize: e.target.value }
                                                })}
                                                placeholder="0.5 µL"
                                                className="w-full px-3 py-2 bg-white border border-indigo-100 rounded-xl text-xs font-bold"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-slate-500">Test Duration (Sec)</label>
                                            <input
                                                type="number"
                                                value={glucometerConfig.specifications.testDurationSeconds}
                                                onChange={(e) => setGlucometerConfig({
                                                    ...glucometerConfig,
                                                    specifications: { ...glucometerConfig.specifications, testDurationSeconds: e.target.value }
                                                })}
                                                placeholder="5"
                                                className="w-full px-3 py-2 bg-white border border-indigo-100 rounded-xl text-xs font-bold"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-slate-500">Measuring Range</label>
                                            <input
                                                type="text"
                                                value={glucometerConfig.specifications.measuringRange}
                                                onChange={(e) => setGlucometerConfig({
                                                    ...glucometerConfig,
                                                    specifications: { ...glucometerConfig.specifications, measuringRange: e.target.value }
                                                })}
                                                placeholder="20 - 600 mg/dL"
                                                className="w-full px-3 py-2 bg-white border border-indigo-100 rounded-xl text-xs font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-slate-500">Precision / CV</label>
                                            <input
                                                type="text"
                                                value={glucometerConfig.specifications.coefficientOfVariation}
                                                onChange={(e) => setGlucometerConfig({
                                                    ...glucometerConfig,
                                                    specifications: { ...glucometerConfig.specifications, coefficientOfVariation: e.target.value }
                                                })}
                                                placeholder="CV < 2%"
                                                className="w-full px-3 py-2 bg-white border border-indigo-100 rounded-xl text-xs font-bold"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-slate-500">Warranty</label>
                                            <input
                                                type="text"
                                                value={glucometerConfig.specifications.warranty}
                                                onChange={(e) => setGlucometerConfig({
                                                    ...glucometerConfig,
                                                    specifications: { ...glucometerConfig.specifications, warranty: e.target.value }
                                                })}
                                                placeholder="Lifetime Warranty"
                                                className="w-full px-3 py-2 bg-white border border-indigo-100 rounded-xl text-xs font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-5 pt-3 border-t border-indigo-100">
                                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                                            <input
                                                type="checkbox"
                                                checked={glucometerConfig.specifications.autoSaveReadings}
                                                onChange={(e) => setGlucometerConfig({
                                                    ...glucometerConfig,
                                                    specifications: { ...glucometerConfig.specifications, autoSaveReadings: e.target.checked }
                                                })}
                                                className="w-4 h-4 accent-[#3d3f96] rounded"
                                            />
                                            <span>Auto-Save Readings to Cloud</span>
                                        </label>

                                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                                            <input
                                                type="checkbox"
                                                checked={glucometerConfig.specifications.hba1cEstimationCapable}
                                                onChange={(e) => setGlucometerConfig({
                                                    ...glucometerConfig,
                                                    specifications: { ...glucometerConfig.specifications, hba1cEstimationCapable: e.target.checked }
                                                })}
                                                className="w-4 h-4 accent-[#3d3f96] rounded"
                                            />
                                            <span>HbA1c Estimation Capable</span>
                                        </label>

                                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                                            <input
                                                type="checkbox"
                                                checked={glucometerConfig.specifications.batteryRequired}
                                                onChange={(e) => setGlucometerConfig({
                                                    ...glucometerConfig,
                                                    specifications: { ...glucometerConfig.specifications, batteryRequired: e.target.checked }
                                                })}
                                                className="w-4 h-4 accent-[#3d3f96] rounded"
                                            />
                                            <span>Battery Required</span>
                                        </label>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-5 bg-rose-50/50 border border-rose-200/80 rounded-3xl space-y-4">
                                    <div className="flex items-center gap-2 border-b border-rose-100 pb-2">
                                        <Activity size={16} className="text-rose-700" />
                                        <h4 className="text-xs font-black uppercase tracking-wider text-rose-900">
                                            CGM Continuous Sensor Specifications
                                        </h4>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase text-slate-500">Sensor Lifespan (Days)</label>
                                            <input
                                                type="number"
                                                value={cgmConfig.sensorLifeSpanDays}
                                                onChange={(e) => setCgmConfig({ ...cgmConfig, sensorLifeSpanDays: e.target.value })}
                                                placeholder="15"
                                                className="w-full px-3.5 py-2.5 bg-white border border-rose-200 rounded-xl text-xs font-bold text-slate-800"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase text-slate-500">Sensor Warmup Time</label>
                                            <input
                                                type="text"
                                                value={cgmConfig.sensorWarmupTime}
                                                onChange={(e) => setCgmConfig({ ...cgmConfig, sensorWarmupTime: e.target.value })}
                                                placeholder="60 mins"
                                                className="w-full px-3.5 py-2.5 bg-white border border-rose-200 rounded-xl text-xs font-bold text-slate-800"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase text-slate-500">Water Resistance Rating</label>
                                            <input
                                                type="text"
                                                value={cgmConfig.waterResistance}
                                                onChange={(e) => setCgmConfig({ ...cgmConfig, waterResistance: e.target.value })}
                                                placeholder="IP28 Water Resistant"
                                                className="w-full px-3.5 py-2.5 bg-white border border-rose-200 rounded-xl text-xs font-bold text-slate-800"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase text-slate-500">Coach Support Duration</label>
                                            <input
                                                type="text"
                                                value={cgmConfig.coachSupportDuration}
                                                onChange={(e) => setCgmConfig({ ...cgmConfig, coachSupportDuration: e.target.value })}
                                                placeholder="1 Month Free Coaching"
                                                className="w-full px-3.5 py-2.5 bg-white border border-rose-200 rounded-xl text-xs font-bold text-slate-800"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-5 pt-3 border-t border-rose-100">
                                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                                            <input
                                                type="checkbox"
                                                checked={cgmConfig.appSyncSupported}
                                                onChange={(e) => setCgmConfig({ ...cgmConfig, appSyncSupported: e.target.checked })}
                                                className="w-4 h-4 accent-rose-600 rounded"
                                            />
                                            <span>Bluetooth 24/7 Mobile App Live Sync</span>
                                        </label>

                                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                                            <input
                                                type="checkbox"
                                                checked={cgmConfig.isCoachSupportIncluded}
                                                onChange={(e) => setCgmConfig({ ...cgmConfig, isCoachSupportIncluded: e.target.checked })}
                                                className="w-4 h-4 accent-rose-600 rounded"
                                            />
                                            <span>Complimentary Certified Coach Support Included</span>
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 3: VARIANTS & PACKS CONFIG */}
                    {formTab === 'variants' && (
                        <div className="space-y-4 animate-in fade-in">
                            {formData.productType === 'Glucometer' ? (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                                                Test Strips &amp; Lancets Multi-Variants
                                            </h4>
                                            <p className="text-[11px] text-slate-400 font-medium">Configure bundles with custom strip counts and prices.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setStripLancetVariants([
                                                ...stripLancetVariants,
                                                {
                                                    variantName: '50 Strips & 50 Lancets',
                                                    stripsCount: 50,
                                                    lancetsCount: 50,
                                                    compatibility: glucometerConfig.compatibility,
                                                    mrp: 1699,
                                                    sellingPrice: 849,
                                                    stockQuantity: 50,
                                                    isDefault: false
                                                }
                                            ])}
                                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-[#3d3f96] font-black text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                                        >
                                            <Plus size={14} />
                                            <span>Add Variant</span>
                                        </button>
                                    </div>

                                    {stripLancetVariants.map((variant, idx) => (
                                        <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative">
                                            <div className="flex items-center justify-between">
                                                <input
                                                    type="text"
                                                    value={variant.variantName}
                                                    onChange={(e) => {
                                                        const copy = [...stripLancetVariants];
                                                        copy[idx].variantName = e.target.value;
                                                        setStripLancetVariants(copy);
                                                    }}
                                                    placeholder="Variant Name (e.g. 50 Strips & 50 Lancets)"
                                                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold w-64"
                                                />
                                                <div className="flex items-center gap-3">
                                                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="defaultVariant"
                                                            checked={variant.isDefault}
                                                            onChange={() => {
                                                                setStripLancetVariants(stripLancetVariants.map((v, i) => ({ ...v, isDefault: i === idx })));
                                                            }}
                                                            className="accent-[#3d3f96]"
                                                        />
                                                        <span>Default Selected</span>
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() => setStripLancetVariants(stripLancetVariants.filter((_, i) => i !== idx))}
                                                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-slate-400">Strips</label>
                                                    <input
                                                        type="number"
                                                        value={variant.stripsCount}
                                                        onChange={(e) => {
                                                            const copy = [...stripLancetVariants];
                                                            copy[idx].stripsCount = e.target.value;
                                                            setStripLancetVariants(copy);
                                                        }}
                                                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-slate-400">Lancets</label>
                                                    <input
                                                        type="number"
                                                        value={variant.lancetsCount}
                                                        onChange={(e) => {
                                                            const copy = [...stripLancetVariants];
                                                            copy[idx].lancetsCount = e.target.value;
                                                            setStripLancetVariants(copy);
                                                        }}
                                                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-slate-400">MRP (₹)</label>
                                                    <input
                                                        type="number"
                                                        value={variant.mrp}
                                                        onChange={(e) => {
                                                            const copy = [...stripLancetVariants];
                                                            copy[idx].mrp = e.target.value;
                                                            setStripLancetVariants(copy);
                                                        }}
                                                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-slate-400">Selling (₹)</label>
                                                    <input
                                                        type="number"
                                                        value={variant.sellingPrice}
                                                        onChange={(e) => {
                                                            const copy = [...stripLancetVariants];
                                                            copy[idx].sellingPrice = e.target.value;
                                                            setStripLancetVariants(copy);
                                                        }}
                                                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-slate-400">Stock</label>
                                                    <input
                                                        type="number"
                                                        value={variant.stockQuantity}
                                                        onChange={(e) => {
                                                            const copy = [...stripLancetVariants];
                                                            copy[idx].stockQuantity = e.target.value;
                                                            setStripLancetVariants(copy);
                                                        }}
                                                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                                                CGM Multi-Sensor Packs
                                            </h4>
                                            <p className="text-[11px] text-slate-400 font-medium">Create Pack of 1, 2, 4, 6 or 10 with custom discounts.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setCgmPacks([
                                                ...cgmPacks,
                                                {
                                                    packName: `Pack of ${cgmPacks.length + 1}`,
                                                    sensorsCount: cgmPacks.length + 1,
                                                    mrp: 5400 * (cgmPacks.length + 1),
                                                    sellingPrice: 3800 * (cgmPacks.length + 1),
                                                    savingsBadge: 'Save ₹500',
                                                    stockQuantity: 20,
                                                    isDefault: false
                                                }
                                            ])}
                                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-black text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                                        >
                                            <Plus size={14} />
                                            <span>Add CGM Pack</span>
                                        </button>
                                    </div>

                                    {cgmPacks.map((pack, idx) => (
                                        <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative">
                                            <div className="flex items-center justify-between">
                                                <input
                                                    type="text"
                                                    value={pack.packName}
                                                    onChange={(e) => {
                                                        const copy = [...cgmPacks];
                                                        copy[idx].packName = e.target.value;
                                                        setCgmPacks(copy);
                                                    }}
                                                    placeholder="e.g. Pack of 4"
                                                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold w-48"
                                                />
                                                <div className="flex items-center gap-3">
                                                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="defaultCgmPack"
                                                            checked={pack.isDefault}
                                                            onChange={() => {
                                                                setCgmPacks(cgmPacks.map((p, i) => ({ ...p, isDefault: i === idx })));
                                                            }}
                                                            className="accent-rose-600"
                                                        />
                                                        <span>Default Selected</span>
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() => setCgmPacks(cgmPacks.filter((_, i) => i !== idx))}
                                                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-slate-400">Sensors Count</label>
                                                    <input
                                                        type="number"
                                                        value={pack.sensorsCount}
                                                        onChange={(e) => {
                                                            const copy = [...cgmPacks];
                                                            copy[idx].sensorsCount = e.target.value;
                                                            setCgmPacks(copy);
                                                        }}
                                                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-slate-400">MRP (₹)</label>
                                                    <input
                                                        type="number"
                                                        value={pack.mrp}
                                                        onChange={(e) => {
                                                            const copy = [...cgmPacks];
                                                            copy[idx].mrp = e.target.value;
                                                            setCgmPacks(copy);
                                                        }}
                                                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-slate-400">Selling (₹)</label>
                                                    <input
                                                        type="number"
                                                        value={pack.sellingPrice}
                                                        onChange={(e) => {
                                                            const copy = [...cgmPacks];
                                                            copy[idx].sellingPrice = e.target.value;
                                                            setCgmPacks(copy);
                                                        }}
                                                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-slate-400">Savings Badge</label>
                                                    <input
                                                        type="text"
                                                        value={pack.savingsBadge}
                                                        onChange={(e) => {
                                                            const copy = [...cgmPacks];
                                                            copy[idx].savingsBadge = e.target.value;
                                                            setCgmPacks(copy);
                                                        }}
                                                        placeholder="Save ₹497"
                                                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-slate-400">Stock</label>
                                                    <input
                                                        type="number"
                                                        value={pack.stockQuantity}
                                                        onChange={(e) => {
                                                            const copy = [...cgmPacks];
                                                            copy[idx].stockQuantity = e.target.value;
                                                            setCgmPacks(copy);
                                                        }}
                                                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 4: PRICING & MEDIA */}
                    {formTab === 'pricing_media' && (
                        <div className="space-y-6 animate-in fade-in">
                            {/* Base Pricing Grid */}
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-3xl space-y-3">
                                <span className="text-[10px] font-black uppercase text-slate-500 block">
                                    Base Product Pricing &amp; Stock
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-500">Base MRP (₹) <span className="text-rose-500">*</span></label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            value={formData.mrp}
                                            onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-800"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-500">Base Selling Price (₹) <span className="text-rose-500">*</span></label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            value={formData.sellingPrice}
                                            onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-800"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-500">Total Stock Available</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.stockQuantity}
                                            onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-800"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-500">Total Users Trust Label</label>
                                        <input
                                            type="text"
                                            value={formData.totalUsersCountDisplay}
                                            onChange={(e) => setFormData({ ...formData, totalUsersCountDisplay: e.target.value })}
                                            placeholder="8 Lakh+ Users"
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-800"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-500">Demo Video URL (YouTube / Vimeo)</label>
                                        <input
                                            type="url"
                                            value={formData.demoVideoUrl}
                                            onChange={(e) => setFormData({ ...formData, demoVideoUrl: e.target.value })}
                                            placeholder="https://youtube.com/watch?v=..."
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-800"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 pt-3 border-t border-slate-200/60">
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

                            {/* Main Product Showcase Image */}
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-3xl space-y-3">
                                <span className="text-[10px] font-black uppercase text-slate-500 block">
                                    Main Showcase Photo {!isEdit && <span className="text-rose-500">*</span>}
                                </span>
                                <div className="flex items-center gap-4">
                                    {mainImagePreview && (
                                        <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 overflow-hidden shrink-0">
                                            <img src={mainImagePreview} alt="Main Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <label className="flex-1 p-4 bg-white border border-dashed border-slate-300 hover:border-[#3d3f96] rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition">
                                        <Upload size={16} className="text-slate-400" />
                                        <span className="text-xs font-bold text-slate-700">
                                            {mainImageFile ? mainImageFile.name : 'Upload Primary Image (.jpg, .png, .webp)'}
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

                            {/* Gallery Images */}
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-3xl space-y-3">
                                <span className="text-[10px] font-black uppercase text-slate-500 block">
                                    Gallery Visuals (Up to 10 photos)
                                </span>

                                {existingGalleryImages.length > 0 && (
                                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                                        {existingGalleryImages.map((img, idx) => (
                                            <div key={idx} className="w-14 h-14 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0">
                                                <img src={getMediaUrl(img)} alt="Gallery Item" className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <label className="p-4 bg-white border border-dashed border-slate-300 hover:border-[#3d3f96] rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition">
                                    <Upload size={16} className="text-slate-400" />
                                    <span className="text-xs font-bold text-slate-700">
                                        {galleryImageFiles.length > 0 ? `${galleryImageFiles.length} new photos selected` : 'Select Multiple Gallery Photos'}
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

                    {/* TAB 5: CONTENT, BOX, USAGE & FAQS */}
                    {formTab === 'content' && (
                        <div className="space-y-6 animate-in fade-in">
                            {/* In-The-Box Contents */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase text-slate-500">In-The-Box Contents</span>
                                    <button
                                        type="button"
                                        onClick={() => setBoxContents([...boxContents, ''])}
                                        className="text-[11px] font-black text-[#3d3f96] uppercase cursor-pointer"
                                    >
                                        + Add Item
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {boxContents.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={item}
                                                onChange={(e) => {
                                                    const copy = [...boxContents];
                                                    copy[idx] = e.target.value;
                                                    setBoxContents(copy);
                                                }}
                                                placeholder="e.g. 1 Smart Device, 25 Strips"
                                                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setBoxContents(boxContents.filter((_, i) => i !== idx))}
                                                className="text-rose-500 p-2 hover:bg-rose-50 rounded-lg cursor-pointer"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Key Highlights */}
                            <div className="space-y-2 pt-4 border-t border-slate-100">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase text-slate-500">Key Product Highlights</span>
                                    <button
                                        type="button"
                                        onClick={() => setHighlights([...highlights, { icon: '', title: '', description: '' }])}
                                        className="text-[11px] font-black text-[#3d3f96] uppercase cursor-pointer"
                                    >
                                        + Add Highlight
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {highlights.map((h, idx) => (
                                        <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <input
                                                    type="text"
                                                    value={h.title}
                                                    onChange={(e) => {
                                                        const copy = [...highlights];
                                                        copy[idx].title = e.target.value;
                                                        setHighlights(copy);
                                                    }}
                                                    placeholder="Highlight Title (e.g. Lab-Grade Accuracy)"
                                                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setHighlights(highlights.filter((_, i) => i !== idx))}
                                                    className="text-rose-500 p-1 cursor-pointer"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                            <input
                                                type="text"
                                                value={h.description}
                                                onChange={(e) => {
                                                    const copy = [...highlights];
                                                    copy[idx].description = e.target.value;
                                                    setHighlights(copy);
                                                }}
                                                placeholder="Highlight Description (e.g. CV < 2% precision tested at NIB)"
                                                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* FAQs */}
                            <div className="space-y-2 pt-4 border-t border-slate-100">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase text-slate-500">Frequently Asked Questions</span>
                                    <button
                                        type="button"
                                        onClick={() => setFaqs([...faqs, { question: '', answer: '' }])}
                                        className="text-[11px] font-black text-[#3d3f96] uppercase cursor-pointer"
                                    >
                                        + Add FAQ
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {faqs.map((faq, idx) => (
                                        <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <input
                                                    type="text"
                                                    value={faq.question}
                                                    onChange={(e) => {
                                                        const copy = [...faqs];
                                                        copy[idx].question = e.target.value;
                                                        setFaqs(copy);
                                                    }}
                                                    placeholder="Question (e.g. Is it CDSCO approved?)"
                                                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))}
                                                    className="text-rose-500 p-1 cursor-pointer"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                            <textarea
                                                rows={2}
                                                value={faq.answer}
                                                onChange={(e) => {
                                                    const copy = [...faqs];
                                                    copy[idx].answer = e.target.value;
                                                    setFaqs(copy);
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

                    {/* --- ACTIONS FOOTER --- */}
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