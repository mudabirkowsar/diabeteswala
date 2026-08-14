"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { 
    FaPills, FaFlask, FaUserMd, FaHospital, FaIndustry, FaSave, FaTimes, 
    FaEdit, FaTrash, FaCheck, FaExclamationCircle, FaCrown, FaBarcode, 
    FaInbox, FaColumns, FaUpload, FaEye, FaArrowRight 
} from "react-icons/fa";

// Memoized Image component to optimize performance
const MedicineImage = React.memo(({ src, alt, className, style, onError }) => {
    return (
        <img 
            src={src} 
            alt={alt} 
            className={className}
            style={style}
            onError={onError}
            loading="lazy"
        />
    );
});
MedicineImage.displayName = "MedicineImage";

// Realistic Mock Data for Pure Design Mode
const initialMedicinesMock = [
    { 
        _id: "m1", 
        Id: "MED001",
        name: "Metformin ER 500mg", 
        manufacturers: "Sun Pharmaceutical Industries", 
        salt_composition: "Metformin Hydrochloride 500mg",
        packaging: "Strip of 15 tablets",
        mrp: 150, 
        best_price: 120, 
        discont_percent: 20,
        prescription_required: "YES", 
        for_sale: "FOR SALE",
        rating: "4.5",
        expectedDelivery: "Tomorrow",
        bread_crumb: "Diabetes",
        url: "https://www.diabeteswala.com",
        image_url: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop"],
        description: "Metformin is a first-line medication for the treatment of type 2 diabetes, particularly in people who are overweight.",
        introduction: "Used to improve glycemic control in adults with type 2 diabetes mellitus.",
        how_works: "It helps lower blood glucose levels by decreasing glucose production in the liver.",
        benefits: "Controls blood sugar level, lowers liver glucose production, and increases insulin sensitivity.",
        storage: "Store below 30°C. Protect from moisture.",
        use_of: "Type 2 Diabetes Mellitus",
        how_to_use: "Take it with food as advised by your healthcare professional.",
        side_effect: "Nausea, diarrhea, abdominal pain, loss of appetite.",
        safety_advise: "Avoid alcohol consumption while taking this medication as it increases the risk of lactic acidosis."
    },
    { 
        _id: "m2", 
        Id: "MED002",
        name: "Atorvastatin 10mg", 
        manufacturers: "Cipla Ltd", 
        salt_composition: "Atorvastatin 10mg",
        packaging: "Strip of 10 tablets",
        mrp: 280, 
        best_price: 224, 
        discont_percent: 20,
        prescription_required: "YES", 
        for_sale: "FOR SALE",
        rating: "4.7",
        expectedDelivery: "2-3 Days",
        bread_crumb: "Cardiovascular",
        url: "https://www.diabeteswala.com",
        image_url: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop"],
        description: "Atorvastatin belongs to a group of medicines called statins. It is used to lower cholesterol and to reduce the risk of heart disease.",
        introduction: "Used to prevent cardiovascular disease in high-risk patients and treat abnormal lipid levels.",
        how_works: "It works by blocking an enzyme (HMG-CoA reductase) that your body needs to make cholesterol.",
        benefits: "Lowers LDL (bad) cholesterol and triglycerides, while raising HDL (good) cholesterol.",
        storage: "Store at room temperature away from heat and light.",
        use_of: "High Cholesterol & Prevention of Heart Attack",
        how_to_use: "Swallow the tablet whole with a glass of water, with or without food.",
        side_effect: "Headache, muscle pain, weakness, digestive upset.",
        safety_advise: "Inform your doctor if you experience unexplained muscle pain or weakness."
    },
    { 
        _id: "m3", 
        Id: "MED003",
        name: "Paracetamol 650mg (Dolo)", 
        manufacturers: "Micro Labs Ltd", 
        salt_composition: "Paracetamol / Acetaminophen 650mg",
        packaging: "Strip of 15 tablets",
        mrp: 34, 
        best_price: 28, 
        discont_percent: 17,
        prescription_required: "NO", 
        for_sale: "FOR SALE",
        rating: "4.8",
        expectedDelivery: "Tomorrow",
        bread_crumb: "Analgesic / Antipyretic",
        url: "https://www.diabeteswala.com",
        image_url: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop"],
        description: "Dolo-650 is a widely used pain reliever and fever reducer.",
        introduction: "Commonly used to treat headache, muscle ache, arthritis, backache, toothache, and cold.",
        how_works: "It acts on the brain to block pain signals and reduce body temperature by regulating heat centers.",
        benefits: "Relieves mild to moderate pain and reduces fever effectively.",
        storage: "Keep out of reach of children. Store in a cool dry place.",
        use_of: "Fever and Pain Relief",
        how_to_use: "Take one tablet as needed or directed by your doctor. Maximum 4g per day.",
        side_effect: "Rare when taken in recommended doses. Liver damage can occur if overdosed.",
        safety_advise: "Do not take with other paracetamol-containing products to avoid accidental overdose."
    }
];

function Medicines() {
    // Local states bypassing context
    const [medicines, setMedicines] = useState(initialMedicinesMock);
    const [editingRowId, setEditingRowId] = useState(null);
    const [editableMedicines, setEditableMedicines] = useState(initialMedicinesMock);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    
    // Process indicators
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [savingMedicine, setSavingMedicine] = useState(null);

    const [excelFile, setExcelFile] = useState(null);
    const fileInputRef = useRef(null);
    const [selectedIds, setSelectedIds] = useState([]);

    // Royal Indigo theme styling variables
    const themeBg = "bg-[#3D3F96]";
    const themeText = "text-[#3D3F96]";
    const themeHoverBg = "hover:bg-[#2C2D75]";
    const themeBorder = "border-[#3D3F96]";
    const themeRing = "focus:ring-[#3D3F96]/30";
    const themeShadow = "shadow-[#3D3F96]/20";

    // Default visible columns
    const [visibleColumns, setVisibleColumns] = useState(new Set([
        'Id', 'name', 'manufacturers', 'mrp', 'best_price', 'prescription_required', 'for_sale', 'actions', 'image_url'
    ]));

    const dummyImages = useMemo(() => [
        "https://images.pexels.com/photos/3873209/pexels-photo-3873209.jpeg",
        "https://images.pexels.com/photos/51929/medications-cure-tablets-pharmacy-51929.jpeg",
        "https://images.pexels.com/photos/208512/pexels-photo-208512.jpeg"
    ], []);
  
    // Full metadata mapping for all columns
    const tableHeaders = useMemo(() => [
        { key: 'Id', label: 'ID' },
        { key: 'name', label: 'Medicine Name' },
        { key: 'manufacturers', label: 'Manufacturer' },
        { key: 'salt_composition', label: 'Salt Composition' },
        { key: 'packaging', label: 'Packaging' },
        { key: 'mrp', label: 'MRP' },
        { key: 'best_price', label: 'Best Price' },
        { key: 'discont_percent', label: 'Discount %' },
        { key: 'prescription_required', label: 'Prescription Required' },
        { key: 'image_url', label: 'Image' },
        { key: 'primary_use', label: 'Primary Use' },
        { key: 'description', label: 'Description' },
        { key: 'storage', label: 'Storage' },
        { key: 'introduction', label: 'Introduction' },
        { key: 'use_of', label: 'Use Of' },
        { key: 'benefits', label: 'Benefits' },
        { key: 'side_effect', label: 'Side Effects' },
        { key: 'how_to_use', label: 'How to Use' },
        { key: 'how_works', label: 'How it Works' },
        { key: 'safety_advise', label: 'Safety Advice' },
        { key: 'for_sale', label: 'For Sale' },
        { key: 'rating', label: 'Rating' },
        { key: 'expectedDelivery', label: 'Expected Delivery' },
        { key: 'bread_crumb', label: 'Category' },
        { key: 'url', label: 'URL' },
        { key: 'actions', label: 'Actions' }
    ], []);

    const handleFileChange = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            setExcelFile(file);
        }
    }, []);

    const handleExcelUpload = useCallback(async (e) => {
        e.preventDefault();
        if (!excelFile) return;

        setIsUploading(true);
        // Simulating upload time for pure-design interactive visual feedback
        setTimeout(() => {
            setIsUploading(false);
            setExcelFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            alert("Excel File uploaded successfully (Mock Mode)!");
        }, 1500);
    }, [excelFile]);

    const handleEdit = useCallback((medicineId) => {
        setEditingRowId(medicineId);
    }, []);

    const handleSave = useCallback(async (medicineId) => {
        setSavingMedicine(medicineId);
        
        // Simulating dynamic database update time
        setTimeout(() => {
            setMedicines([...editableMedicines]);
            setEditingRowId(null);
            setSavingMedicine(null);
        }, 1000);
    }, [editableMedicines]);

    const handleCancel = useCallback(() => {
        setEditableMedicines([...medicines]);
        setEditingRowId(null);
    }, [medicines]);

    const handleInputChange = useCallback((id, field, value) => {
        setEditableMedicines(prev =>
            prev.map(med => (med._id === id ? { ...med, [field]: value } : med))
        );
    }, []);
  
    const handleDelete = useCallback(async (medicineId) => {
        if (window.confirm("Are you sure you want to delete this medicine?")) {
            setIsDeleting(true);
            setTimeout(() => {
                setMedicines(prev => prev.filter(med => med._id !== medicineId));
                setEditableMedicines(prev => prev.filter(med => med._id !== medicineId));
                setIsDeleting(false);
            }, 800);
        }
    }, []);

    const handleDeleteSelected = useCallback(async () => {
        if (window.confirm(`Are you sure you want to delete the ${selectedIds.length} selected medicines?`)) {
            setIsDeleting(true);
            setTimeout(() => {
                setMedicines(prev => prev.filter(med => !selectedIds.includes(med._id)));
                setEditableMedicines(prev => prev.filter(med => !selectedIds.includes(med._id)));
                setSelectedIds([]);
                setIsDeleting(false);
            }, 1000);
        }
    }, [selectedIds]);

    const handleSelectRow = useCallback((id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
        );
    }, []);

    const handleSelectAll = useCallback(() => {
        if (selectedIds.length === medicines.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(medicines.map(med => med._id));
        }
    }, [selectedIds.length, medicines]);

    const toggleColumn = useCallback((columnKey) => {
        setVisibleColumns(prev => {
            const newVisibleColumns = new Set(prev);
            newVisibleColumns.has(columnKey) ? newVisibleColumns.delete(columnKey) : newVisibleColumns.add(columnKey);
            return newVisibleColumns;
        });
    }, []);

    const handleImageError = useCallback((e) => {
        e.target.src = dummyImages[0];
    }, [dummyImages]);

    const handleRowClick = useCallback((medicine) => {
        setSelectedMedicine(medicine);
        setShowDetailModal(true);
    }, []);

    const visibleHeaders = useMemo(() => tableHeaders.filter(header => visibleColumns.has(header.key)), [tableHeaders, visibleColumns]);

    // Renders table cell contents based on current state and columns
    const renderCellContent = (medicine, header) => {
        const isEditing = editingRowId === medicine._id;
        const value = medicine[header.key];

        if (isEditing && header.key !== 'actions') {
            return (
                <input 
                    type="text" 
                    value={value || ''} 
                    onChange={(e) => handleInputChange(medicine._id, header.key, e.target.value)} 
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs font-semibold outline-none focus:border-[#3D3F96]" 
                />
            );
        }

        switch (header.key) {
            case 'actions':
                return (
                    <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {isEditing ? (
                            <>
                                <button className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors" onClick={() => handleSave(medicine._id)} disabled={savingMedicine === medicine._id}>
                                    {savingMedicine === medicine._id ? <span className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></span> : <FaSave className="text-xs" />}
                                </button>
                                <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors" onClick={handleCancel}><FaTimes className="text-xs" /></button>
                            </>
                        ) : (
                            <>
                                <button className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 transition-colors" onClick={() => handleEdit(medicine._id)} disabled={isDeleting}><FaEdit className="text-xs" /></button>
                                <button className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors" onClick={() => handleDelete(medicine._id)} disabled={isDeleting}><FaTrash className="text-xs" /></button>
                            </>
                        )}
                    </div>
                );
            case 'image_url': {
                const imageUrl = Array.isArray(value) && value.length > 0 ? value[0] : dummyImages[0];
                return (
                    <div className="inline-block relative w-9 h-9 rounded-lg overflow-hidden border border-gray-100 shadow-sm shrink-0">
                        <MedicineImage src={imageUrl} alt={medicine.name || "Medicine"} className="w-full h-full object-cover" onError={handleImageError} />
                    </div>
                );
            }
            case 'prescription_required':
                return (
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${value === 'YES' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                        {value === 'YES' ? 'Required' : 'OTC'}
                    </span>
                );
            case 'for_sale':
                return (
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${value === 'FOR SALE' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {value}
                    </span>
                );
            case 'best_price':
                return <span className="text-emerald-600 font-black tabular-nums">{value ? `₹${value}` : 'N/A'}</span>;
            case 'mrp':
                return <span className="font-black text-gray-800 tabular-nums">{value ? `₹${value}` : 'N/A'}</span>;
            default:
                return <span className="text-xs font-semibold text-gray-700 truncate block max-w-[200px]" title={value}>{value || 'N/A'}</span>;
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 py-8 select-none animate-fadeIn">
            
            {/* 1. FILE UPLOAD CARD */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center">
                        <FaUpload className="text-lg" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 leading-snug">Upload Medicines</h2>
                        <p className="text-xs text-gray-400">Import bulk medicine inventory via Excel spreadsheet (.xlsx, .xls)</p>
                    </div>
                </div>

                <form onSubmit={handleExcelUpload} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-3 flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Excel File</label>
                        <input 
                            type="file" 
                            accept=".xlsx,.xls" 
                            onChange={handleFileChange} 
                            ref={fileInputRef} 
                            disabled={isUploading}
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-500 outline-none file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#3D3F96]/10 file:text-[#3D3F96] hover:file:bg-[#3D3F96]/15 file:cursor-pointer transition-all focus:border-[#3D3F96]"
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={!excelFile || isUploading}
                        className={`w-full flex items-center justify-center gap-2 text-white font-bold py-2.5 rounded-xl text-sm transition-all focus:outline-none ${themeBg} ${themeHoverBg} ${themeShadow} shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isUploading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                Uploading...
                            </>
                        ) : "Upload File"}
                    </button>
                </form>
            </div>

            {/* 2. COLUMN VISIBILITY CARD */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center">
                        <FaColumns className="text-lg" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 leading-snug">Column Visibility</h2>
                        <p className="text-xs text-gray-400">Toggle columns dynamically to customize your layout view</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {tableHeaders.map((header) => (
                        <label key={header.key} className="flex items-center gap-2.5 cursor-pointer group">
                            <input 
                                type="checkbox" 
                                id={`col-${header.key}`} 
                                checked={visibleColumns.has(header.key)} 
                                onChange={() => toggleColumn(header.key)}
                                className="w-4.5 h-4.5 text-[#3D3F96] bg-gray-50 border-gray-200 rounded focus:ring-1 focus:ring-[#3D3F96]/30 cursor-pointer accent-[#3D3F96]"
                            />
                            <span className="text-xs font-semibold text-gray-600 group-hover:text-gray-900 transition-colors truncate">{header.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* 3. MEDICINES LIST TABLE CARD */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden">
                
                {/* Table Header Section */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-[#3D3F96]/5 flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/15 text-[#3D3F96] flex items-center justify-center">
                            <FaPills className="text-lg" />
                        </div>
                        <h2 className="text-lg font-black tracking-tight text-gray-800">
                            Medicines List 
                            <span className="ml-2.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#3D3F96]/15 text-[#3D3F96]">
                                {medicines.length} Registered
                            </span>
                        </h2>
                    </div>

                    {selectedIds.length > 0 && (
                        <button 
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-rose-600 text-white shadow-sm hover:bg-rose-700 transition-all focus:outline-none" 
                            onClick={handleDeleteSelected} 
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <FaTrash /> Delete Selected ({selectedIds.length})
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Table Scrollable Wrapper */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[1000px] table-auto align-middle">
                        <thead>
                            <tr className="text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50 border-b border-gray-100">
                                <th className="text-center px-6 py-4 w-16">
                                    <input 
                                        type="checkbox" 
                                        onChange={handleSelectAll} 
                                        checked={medicines.length > 0 && selectedIds.length === medicines.length} 
                                        className="w-4 h-4 text-[#3D3F96] bg-gray-50 border-gray-200 rounded focus:ring-1 focus:ring-[#3D3F96]/30 cursor-pointer accent-[#3D3F96]"
                                        title="Select All"
                                    />
                                </th>
                                <th className="text-center px-6 py-4 w-20">S.No</th> 
                                {visibleHeaders.map(header => (
                                    <th key={header.key} className="text-left px-6 py-4">{header.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {medicines.length > 0 ? (
                                medicines.map((medicine, index) => {
                                    const isEditing = editingRowId === medicine._id;
                                    return (
                                        <tr 
                                            key={medicine._id} 
                                            onClick={() => !isEditing && handleRowClick(medicine)}
                                            style={{ cursor: isEditing ? 'default' : 'pointer' }}
                                            className={`transition-colors duration-150 ${isEditing ? 'bg-amber-50/40 hover:bg-amber-50/50' : 'hover:bg-gray-50/60'}`}
                                        >
                                            <td onClick={(e) => e.stopPropagation()} className="text-center">
                                                <input 
                                                    type="checkbox" 
                                                    onChange={() => handleSelectRow(medicine._id)} 
                                                    checked={selectedIds.includes(medicine._id)} 
                                                    className="w-4 h-4 text-[#3D3F96] bg-gray-50 border-gray-200 rounded focus:ring-1 focus:ring-[#3D3F96]/30 cursor-pointer accent-[#3D3F96]"
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-center font-bold text-gray-400 text-xs">{index + 1}</td>
                                            {visibleHeaders.map(header => (
                                                <td key={header.key} className="px-6 py-4">
                                                    {renderCellContent(medicine, header)}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={visibleHeaders.length + 2} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                                <FaInbox className="text-3xl" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-700">No Medicines Found</h4>
                                                <p className="text-xs text-slate-400 mt-1">Add medicines by uploading an Excel sheet or updating your DB.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 4. DETAILS MODAL PANEL */}
            {showDetailModal && selectedMedicine && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 relative flex flex-col gap-6 select-none animate-in zoom-in-95 duration-200">
                        
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/15 text-[#3D3F96] flex items-center justify-center shrink-0">
                                    <FaBarcode className="text-lg" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black tracking-tight text-gray-800">{selectedMedicine.name || 'Medicine Details'}</h3>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mt-0.5">DB-ID: {selectedMedicine.Id || selectedMedicine._id}</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowDetailModal(false)}
                                className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-400 flex items-center justify-center transition-colors focus:outline-none"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Modal Body Scroll Area */}
                        <div className="space-y-6 overflow-y-auto">
                            {/* Medicine Images */}
                            <div className="flex justify-center bg-gray-50/50 rounded-2xl border border-gray-100/60 p-4">
                                {Array.isArray(selectedMedicine.image_url) && selectedMedicine.image_url.length > 0 ? (
                                    <div className="relative w-full max-w-lg h-64 overflow-hidden rounded-xl bg-white shadow-sm border border-gray-50">
                                        <img 
                                            src={selectedMedicine.image_url[0]} 
                                            alt={selectedMedicine.name} 
                                            className="w-full h-full object-contain"
                                            onError={handleImageError} 
                                        />
                                    </div>
                                ) : (
                                    <div className="relative w-full max-w-lg h-64 overflow-hidden rounded-xl bg-white shadow-sm border border-gray-50">
                                        <img 
                                            src={dummyImages[0]} 
                                            alt={selectedMedicine.name} 
                                            className="w-full h-full object-contain"
                                            onError={handleImageError} 
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Medical Detailed Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                                    <div>
                                        <h4 className={`text-xs font-bold uppercase tracking-wider ${themeText}`}>Description</h4>
                                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">{selectedMedicine.description || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <h4 className={`text-xs font-bold uppercase tracking-wider ${themeText}`}>Introduction</h4>
                                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">{selectedMedicine.introduction || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <h4 className={`text-xs font-bold uppercase tracking-wider ${themeText}`}>How It Works</h4>
                                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">{selectedMedicine.how_works || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <h4 className={`text-xs font-bold uppercase tracking-wider ${themeText}`}>Benefits</h4>
                                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">{selectedMedicine.benefits || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                                    <div>
                                        <h4 className={`text-xs font-bold uppercase tracking-wider ${themeText}`}>Storage</h4>
                                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">{selectedMedicine.storage || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <h4 className={`text-xs font-bold uppercase tracking-wider ${themeText}`}>Usage / Indication</h4>
                                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">{selectedMedicine.use_of || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <h4 className={`text-xs font-bold uppercase tracking-wider ${themeText}`}>How To Use</h4>
                                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">{selectedMedicine.how_to_use || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <h4 className={`text-xs font-bold uppercase tracking-wider ${themeText}`}>Side Effects</h4>
                                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">{selectedMedicine.side_effect || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <h4 className={`text-xs font-bold uppercase tracking-wider ${themeText}`}>Safety Advice</h4>
                                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">{selectedMedicine.safety_advise || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-4 shrink-0">
                            <button 
                                type="button" 
                                onClick={() => setShowDetailModal(false)}
                                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold uppercase tracking-wider transition-all focus:outline-none"
                            >
                                Close
                            </button>
                            {selectedMedicine.url && (
                                <a 
                                    href={selectedMedicine.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className={`flex items-center gap-1.5 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all focus:outline-none ${themeBg} ${themeHoverBg}`}
                                >
                                    View Source <FaArrowRight />
                                </a>
                            )}
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}

export default Medicines;