'use client';

import React, { useState, useEffect } from 'react';
import AdminAPI from '../../../../../services/AdminAPI';
import { X, Trash2, Edit3, Loader2, RefreshCw, Layers, AlertCircle } from 'lucide-react';

export default function ViewCategories({ isOpen, onClose, onEditCategory, onDataChange }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await AdminAPI.getAllHealthyCategories();
      setCategories(res?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    const confirm = window.confirm(`Are you sure you want to delete category "${name}"?`);
    if (!confirm) return;

    try {
      setDeletingId(id);
      await AdminAPI.deleteHealthyMainCategory(id);
      await loadCategories();
      if (onDataChange) onDataChange();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteSubCategory = async (mainCategoryId, subCategoryName) => {
    const confirm = window.confirm(`Remove subcategory "${subCategoryName}"?`);
    if (!confirm) return;

    try {
      await AdminAPI.deleteHealthySubCategory(mainCategoryId, subCategoryName);
      await loadCategories();
      if (onDataChange) onDataChange();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete subcategory');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#3d3f96]/10 text-[#3d3f96]">
              <Layers size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Healthy Categories & Programs</h2>
              <p className="text-xs text-gray-500">Overview of all active healthy diet categories</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadCategories}
              disabled={loading}
              title="Refresh"
              className="p-2 text-gray-400 hover:text-[#3d3f96] hover:bg-gray-100 rounded-full transition"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="animate-spin text-[#3d3f96] mb-2" size={30} />
              <span className="text-sm">Fetching categories...</span>
            </div>
          ) : categories.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <p className="font-medium text-base">No categories found.</p>
              <p className="text-xs text-gray-400 mt-1">Add a new category to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat._id}
                  className="border border-gray-200 rounded-xl p-4 bg-white hover:border-[#3d3f96]/30 transition shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#3d3f96]">
                          Main Category
                        </span>
                        <h3 className="text-lg font-bold text-gray-800 leading-tight">
                          {cat.mainCategory}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            onClose();
                            onEditCategory(cat);
                          }}
                          className="p-1.5 text-gray-400 hover:text-[#3d3f96] hover:bg-gray-50 rounded-lg transition"
                          title="Edit Category"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat._id, cat.mainCategory)}
                          disabled={deletingId === cat._id}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-50 rounded-lg transition disabled:opacity-50"
                          title="Delete Entire Category"
                        >
                          {deletingId === cat._id ? (
                            <Loader2 size={16} className="animate-spin text-red-500" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Subcategories */}
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                        Subcategories ({cat.subCategories?.length || 0})
                      </p>
                      {cat.subCategories && cat.subCategories.length > 0 ? (
                        cat.subCategories.map((sub) => (
                          <div
                            key={sub._id || sub.name}
                            className="group flex items-start justify-between bg-gray-50 hover:bg-[#3d3f96]/5 p-2.5 rounded-lg border border-gray-100 transition"
                          >
                            <div className="pr-2">
                              <p className="text-xs font-semibold text-gray-800">{sub.name}</p>
                              {sub.tagline && (
                                <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                                  {sub.tagline}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteSubCategory(cat._id, sub.name)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition"
                              title="Delete this subcategory"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400 italic">No subprograms added.</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                    <span className="font-medium text-gray-500">ID: {cat._id?.slice(-6)}</span>
                    <span
                      className={`font-semibold ${
                        cat.isActive ? 'text-green-600' : 'text-red-500'
                      }`}
                    >
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}