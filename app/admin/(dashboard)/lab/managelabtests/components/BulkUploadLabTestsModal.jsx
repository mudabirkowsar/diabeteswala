"use client";
import React, { useState, useRef } from 'react';
import { Upload, X, FileSpreadsheet, Loader2, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminAPI from '../../../../../services/AdminAPI';

export default function BulkUploadLabTestsModal({ isOpen, onClose, onSuccess }) {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const allowedExtensions = ['.xlsx', '.xls', '.csv', '.tsv'];

    const isValidFile = (fileName) => {
        return allowedExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const selected = e.target.files[0];
            if (isValidFile(selected.name)) {
                setFile(selected);
            } else {
                toast.error("Please select a supported file (.xlsx, .xls, .csv, .tsv)");
            }
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const dropped = e.dataTransfer.files[0];
            if (isValidFile(dropped.name)) {
                setFile(dropped);
            } else {
                toast.error("Please drop a valid .xlsx, .xls, .csv, or .tsv file.");
            }
        }
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            toast.error("Please select an Excel or CSV file to continue.");
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await AdminAPI.uploadMasterTests(formData);
            if (response && response.success) {
                toast.success(response.message || "Tests imported successfully!");
                setFile(null);
                onSuccess();
            } else {
                toast.error(response?.message || "Bulk import failed.");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Error processing spreadsheet upload.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

            <div className="bg-white rounded-[2rem] max-w-md w-full p-6 shadow-2xl relative z-10 border border-slate-100 text-center">
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 p-2 bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-all cursor-pointer"
                >
                    <X size={16} />
                </button>

                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#3d3f96] flex items-center justify-center mb-4 mx-auto">
                    <FileSpreadsheet size={24} />
                </div>

                <h3 className="text-base font-black text-slate-900">Bulk Upload Master Tests</h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                    Upload an Excel (<code className="font-bold text-slate-700">.xlsx / .xls</code>) or <code className="font-bold text-slate-700">.csv</code> spreadsheet containing test specifications.
                </p>

                <div className="mt-3 p-3 bg-slate-50 border border-slate-100 rounded-xl text-left text-[11px] text-slate-500 space-y-1">
                    <p className="font-bold text-slate-700 flex items-center gap-1">
                        <Info size={12} className="text-[#3d3f96]" /> Required Columns:
                    </p>
                    <p className="leading-tight text-[10px]">
                        <code className="text-[#3d3f96] font-bold">testName, testCode, mainCategory, category, sampleType, standardMRP</code>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                        Parameters, FAQs & descriptions should use <code className="bg-slate-200/80 px-1 rounded">||</code> delimiters.
                    </p>
                </div>

                <form onSubmit={handleUploadSubmit} className="mt-4 space-y-4">
                    <div
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className="border-dashed border-2 border-slate-200 hover:border-[#3d3f96] bg-slate-50 hover:bg-indigo-50/20 rounded-2xl p-8 cursor-pointer transition-all flex flex-col items-center justify-center"
                    >
                        <input
                            type="file"
                            accept=".xlsx, .xls, .csv, .tsv"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <Upload size={30} className="text-slate-350 mb-2" />
                        <span className="text-xs font-bold text-slate-700">
                            {file ? file.name : "Drag & drop spreadsheet here"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold mt-1">
                            {file ? `${(file.size / 1024).toFixed(1)} KB` : "or click to select file (.xlsx, .xls, .csv)"}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={uploading || !file}
                            className="py-3 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
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