"use client";

import React from 'react';

export default function FoodLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* GLOBAL VIEWPORT MOUNT */}
      <main className="flex-1">
        {children}
      </main>

    </div>
  );
}