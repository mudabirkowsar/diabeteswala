'use client';

import React from 'react';

export default function IngredientCard({ item, isSelected, activeCategory, onSelect }) {
  return (
    <div
      onClick={onSelect}
      className={`rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between bg-white relative group ${
        isSelected 
          ? 'border-[#3D3F96] ring-2 ring-indigo-50 shadow-sm scale-[1.02]' 
          : 'border-gray-200 hover:border-gray-300 shadow-sm'
      }`}
    >
      {/* Photo header with price label */}
      <div className="relative h-20 w-full overflow-hidden bg-gray-50">
        <img 
          src={item.imageUrl} 
          alt={item.name} 
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <span className="absolute bottom-1.5 left-3 text-white text-[10px] font-black">+₹{item.price}</span>
        {isSelected && (
          <span className="absolute top-2 right-2 bg-[#3D3F96] text-white p-0.5 rounded-full shadow-sm">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </span>
        )}
      </div>
      
      {/* Specs Information */}
      <div className="p-3">
        <h4 className="text-xs font-bold text-gray-900 leading-tight truncate">{item.name}</h4>
        <p className="text-[9px] text-gray-400 mt-1 font-semibold">
          {activeCategory === 'bases' && `Carbs: ${item.netCarbs}g • GI: ${item.gi}`}
          {activeCategory === 'proteins' && `Protein: ${item.protein}g • Carbs: ${item.netCarbs}g`}
          {activeCategory === 'fibers' && `GI: ${item.gi} • Carbs: ${item.netCarbs}g`}
        </p>
      </div>
    </div>
  );
}