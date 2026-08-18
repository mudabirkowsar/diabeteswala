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

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1607619056574-7b8d304a2c07?q=80&w=150";

function BulkUploadModal({ isOpen, onClose, onSuccess }) {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.name.endsWith('.csv')) {
                setFile(droppedFile);
            } else {
                toast.error("Please drop a valid CSV file.");
            }
        }
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            toast.error("Please select a CSV file to continue.");
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await AdminAPI.bulkUploadMedicines(formData);
            if (response && response.success) {
                toast.success(response.message || "Bulk upload completed successfully.");
                setFile(null);
                onSuccess();
            } else {
                toast.error(response?.message || "File upload failed.");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Error processing bulk inventory upload.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            
            <div className="bg-white rounded-[2rem] max-w-md w-full p-6 shadow-2xl relative z-10 border border-slate-100 text-center">
                <button onClick={onClose} className="absolute top-5 right-5 p-2 bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-all">
                    <X size={16} />
                </button>

                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#3d3f96] flex items-center justify-center mb-4 mx-auto">
                    <Upload size={22} />
                </div>

                <h3 className="text-base font-black text-slate-900">Bulk Import Medicines</h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                    Upload your formatted CSV file to add multiple items. Existing duplicate Medicine IDs will be skipped automatically.
                </p>

                <form onSubmit={handleUploadSubmit} className="mt-5 space-y-4">
                    <div
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className="border-dashed border-2 border-slate-200 hover:border-[#3d3f96] bg-slate-50 hover:bg-indigo-50/20 rounded-2xl p-8 cursor-pointer transition-all flex flex-col items-center justify-center"
                    >
                        <input
                            type="file"
                            accept=".csv"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <FileText size={32} className="text-slate-350 mb-2" />
                        <span className="text-xs font-bold text-slate-700">
                            {file ? file.name : "Drag and drop CSV file here"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold mt-1">
                            {file ? `${(file.size / 1024).toFixed(1)} KB` : "or click to browse local files"}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={uploading || !file}
                            className="py-3 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                        >
                            {uploading ? (
                                <Loader2 size={12} className="animate-spin" />
                            ) : (
                                <span>Upload Database</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default BulkUploadModal
