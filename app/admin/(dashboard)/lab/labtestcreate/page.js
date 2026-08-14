"use client";

import React, { useState } from "react";
import { FaPlusCircle, FaFlask, FaTags } from "react-icons/fa";

function LabTestCreate() {
  // Standalone component states (API and Context dependencies removed)
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
 
  // Dynamic color token classes matching theme color #3D3F96
  const themeBg = "bg-[#3D3F96]";
  const themeHoverBg = "hover:bg-[#2C2D75]";
  const themeText = "text-[#3D3F96]";
  const themeRing = "focus:ring-[#3D3F96]/30";
  const themeShadow = "shadow-[#3D3F96]/20";

  const handleSubmit = (e) => {  
    e.preventDefault();
    setIsSubmitting(true);

    // Simulating API creation time for dynamic UI feedback
    setTimeout(() => {
        setIsSubmitting(false);
        alert(`Lab Test "${name}" created successfully under "${category}" category! (Mock Mode)`);
        setName("");
        setCategory("");
    }, 1000);
  };
 
  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-gray-50/50 p-4 select-none animate-fadeIn">
      
      {/* Create Lab Test Main Card */}
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] max-w-md w-full relative flex flex-col gap-6">
        
        {/* Card Header Section with Premium Icon Block */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center shadow-inner">
            <FaFlask className="text-2xl animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-800 tracking-tight leading-snug">Create Lab Test</h2>
            <p className="text-xs text-gray-400">Add a new diagnostic test and category to the platform directory</p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">    
          
          {/* Test Name Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <FaFlask className={themeText} /> Test Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Blood Sugar (Fasting)"
              required
              disabled={isSubmitting}
              className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all disabled:opacity-50`}
            />
          </div>

          {/* Category Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <FaTags className={themeText} /> Category
            </label>  
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Diabetes Panel"
              required
              disabled={isSubmitting}
              className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all disabled:opacity-50`}
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full flex items-center justify-center gap-2 text-white font-bold py-3.5 rounded-xl text-sm transition-all focus:outline-none ${themeBg} ${themeHoverBg} ${themeShadow} shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? (
                <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Creating Test...
                </>
            ) : (
                <>
                    <FaPlusCircle className="text-base" /> Create New Test
                </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
 
export default LabTestCreate;