// components/PrescriptionCard.jsx
"use client";
import React, { useRef } from 'react';
import { FileText, Upload, X, AlertCircle } from 'lucide-react';

export default function PrescriptionCard({ files = [], setFiles, isMandatory }) {
  const fileInputRef = useRef(null);

  const handleFiles = (e) => {
    if (e.target.files) {
      const chosen = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...chosen]);
    }
  };

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const hasMissingPrescription = isMandatory && files.length === 0;

  return (
    <div
      id="prescription-section"
      className={`rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border transition-all space-y-3 sm:space-y-4 ${
        hasMissingPrescription
          ? "bg-rose-50/40 border-rose-300 ring-2 ring-rose-200"
          : "bg-white border-slate-100 shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 ${
            isMandatory ? "bg-rose-500 text-white" : "bg-[#3d3f96]/10 text-[#3d3f96]"
          }`}>
            <FileText size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
                Doctor's Prescription
              </h3>
              {isMandatory && (
                <span className="text-[8px] sm:text-[9px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Mandatory
                </span>
              )}
            </div>
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-400">
              Required for government regulated medicines in your cart
            </p>
          </div>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFiles}
        accept="image/png, image/jpeg, image/jpg, application/pdf"
        multiple
        className="hidden"
      />

      <div
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl sm:rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-all ${
          hasMissingPrescription
            ? "border-rose-300 bg-rose-50/30 hover:bg-rose-50/60"
            : "border-slate-200 hover:border-[#3d3f96] hover:bg-slate-50/60"
        }`}
      >
        <Upload size={20} className={`mx-auto mb-1 ${hasMissingPrescription ? "text-rose-400" : "text-slate-400"}`} />
        <p className="text-[11px] sm:text-xs font-black text-slate-800">
          Click to upload prescription files
        </p>
        <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold mt-0.5">
          PNG, JPG, or PDF (Max 10MB)
        </p>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {files.map((file, idx) => {
            const isImg = file.type.startsWith('image/');
            const previewUrl = isImg ? URL.createObjectURL(file) : null;

            return (
              <div key={idx} className="relative group bg-slate-50 border border-slate-200 rounded-xl p-2 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="absolute top-1 right-1 bg-rose-500 text-white p-1 rounded-full shadow hover:bg-rose-600 transition-colors"
                >
                  <X size={10} />
                </button>
                {previewUrl ? (
                  <img src={previewUrl} alt="prescription" className="w-full h-12 sm:h-14 object-cover rounded-lg mb-1" />
                ) : (
                  <div className="w-full h-12 sm:h-14 flex items-center justify-center bg-slate-200 rounded-lg mb-1 text-slate-500">
                    <FileText size={18} />
                  </div>
                )}
                <span className="text-[8px] sm:text-[9px] font-bold text-slate-700 truncate w-full text-center">
                  {file.name}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {hasMissingPrescription && (
        <p className="text-[10px] sm:text-[11px] font-bold text-rose-600 flex items-center gap-1.5 pt-0.5">
          <AlertCircle size={13} className="shrink-0" />
          You cannot place this order without uploading a valid doctor's prescription.
        </p>
      )}
    </div>
  );
}