"use client";

import { useState, useRef } from "react";
import { FaUserMd, FaUpload, FaArrowRight, FaPlusCircle, FaTimes } from "react-icons/fa";

export default function SpecialistUpload() {
    const [specialistName, setSpecialistName] = useState("");
    const [specialistImage, setSpecialistImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    // Theme Color Tokens based on #3D3F96 (Royal Indigo)
    const themeBg = "bg-[#3D3F96]";
    const themeText = "text-[#3D3F96]";
    const themeHoverBg = "hover:bg-[#2C2D75]";
    const themeShadow = "shadow-[#3D3F96]/20";
    const themeRing = "focus:ring-[#3D3F96]/30";

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setSpecialistImage(e.target.files[0]);
        }
    };

    const handleClearFile = (e) => {
        e.stopPropagation(); // Prevents triggering input click
        setSpecialistImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!specialistName || !specialistImage) return;

        setIsSubmitting(true);

        // Simulating API upload time for dynamic UI feedback
        setTimeout(() => {
            setIsSubmitting(false);
            alert(`Specialist "${specialistName}" uploaded successfully! (Mock Mode)`);
            setSpecialistName("");
            setSpecialistImage(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }, 1500);
    };

    return (
        <div className="min-h-[75vh] flex items-center justify-center bg-gray-50/50 p-4 select-none animate-fadeIn">
            
            {/* Specialist Upload Main Card */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] max-w-md w-full relative flex flex-col gap-6">
                
                {/* Card Header Section with Premium Icon Block */}
                <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center shadow-inner">
                        <FaUserMd className="text-2xl animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-800 tracking-tight leading-snug">Specialist Upload</h2>
                        <p className="text-xs text-gray-400">Add a new medical specialist and headshot to the clinical directory</p>
                    </div>
                </div>

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="space-y-5">    
                    
                    {/* Specialist Name Input */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Specialist Doctor Name*
                        </label>
                        <input
                            type="text"
                            value={specialistName}
                            onChange={(e) => setSpecialistName(e.target.value)}
                            placeholder="e.g. Dr. Rohan Verma"
                            required
                            disabled={isSubmitting}
                            className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all disabled:opacity-50`}
                        />
                    </div>

                    {/* Premium Drag & Drop Style File Uploader */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Specialist Image*
                        </label>
                        <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-[#3D3F96] bg-gray-50/50 rounded-2xl p-6 cursor-pointer transition-colors group">
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                accept="image/*"
                                required={!specialistImage}
                                onChange={handleFileChange}
                                disabled={isSubmitting}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed" 
                            />
                            <FaUpload className="text-2xl text-gray-400 group-hover:text-[#3D3F96] transition-colors mb-2" />
                            <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900 text-center px-4 transition-colors truncate max-w-full">
                                {specialistImage ? specialistImage.name : "Choose Image File"}
                            </span>
                            <span className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">
                                Supports PNG, JPG, JPEG
                            </span>

                            {/* Clear file button if selected */}
                            {specialistImage && (
                                <button
                                    type="button"
                                    onClick={handleClearFile}
                                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-50 text-rose-500 border border-rose-100 hover:bg-rose-100 transition-colors z-20"
                                    title="Remove file"
                                >
                                    <FaTimes className="text-[10px]" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Submit Button with Loader Animation */}
                    <button 
                        type="submit" 
                        disabled={isSubmitting || !specialistName || !specialistImage}
                        className={`w-full flex items-center justify-center gap-2 text-white font-bold py-3.5 rounded-xl text-sm transition-all focus:outline-none ${themeBg} ${themeHoverBg} ${themeShadow} shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                Uploading Specialist...
                            </>
                        ) : (
                            <>
                                <FaPlusCircle className="text-base" /> Upload Specialist
                            </>
                        )}
                    </button>
                </form>

            </div>
        </div>
    );
}