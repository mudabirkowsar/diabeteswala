'use client';

import React, { useState, useEffect } from 'react';
import AdminAPI from '../../../../../services/AdminAPI';
import { X, Plus, Trash2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CreateCategory({ isOpen, onClose, onSuccess, editCategoryData = null }) {
  const [mainCategory, setMainCategory] = useState('');
  const [subCategories, setSubCategories] = useState([{ name: '', tagline: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (editCategoryData) {
      setMainCategory(editCategoryData.mainCategory || '');
      setSubCategories(
        editCategoryData.subCategories && editCategoryData.subCategories.length > 0
          ? editCategoryData.subCategories.map((sub) => ({
              _id: sub._id,
              name: sub.name || '',
              tagline: sub.tagline || '',
            }))
          : [{ name: '', tagline: '' }]
      );
    } else {
      resetForm();
    }
    setError('');
    setSuccessMsg('');
  }, [editCategoryData, isOpen]);

  const resetForm = () => {
    setMainCategory('');
    setSubCategories([{ name: '', tagline: '' }]);
    setError('');
    setSuccessMsg('');
  };

  const handleAddSubCategory = () => {
    setSubCategories([...subCategories, { name: '', tagline: '' }]);
  };

  const handleSubCategoryChange = (index, field, value) => {
    const updated = [...subCategories];
    updated[index][field] = value;
    setSubCategories(updated);
  };

  const handleRemoveSubCategoryRow = async (index, subCategory) => {
    if (editCategoryData?._id && subCategory.name) {
      const confirmDelete = window.confirm(
        `Are you sure you want to delete "${subCategory.name}" subcategory?`
      );
      if (!confirmDelete) return;

      try {
        setLoading(true);
        await AdminAPI.deleteHealthySubCategory(editCategoryData._id, subCategory.name);
        const filtered = subCategories.filter((_, i) => i !== index);
        setSubCategories(filtered.length > 0 ? filtered : [{ name: '', tagline: '' }]);
        if (onSuccess) onSuccess();
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to delete subcategory');
      } finally {
        setLoading(false);
      }
    } else {
      const filtered = subCategories.filter((_, i) => i !== index);
      setSubCategories(filtered.length > 0 ? filtered : [{ name: '', tagline: '' }]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!mainCategory.trim()) {
      setError('Main Category Name is required.');
      return;
    }

    const validSubCategories = subCategories.filter((sub) => sub.name.trim() !== '');

    if (validSubCategories.length === 0) {
      setError('Please add at least one Subcategory with a name.');
      return;
    }

    const payload = {
      mainCategory: mainCategory.trim(),
      subCategories: validSubCategories.map((sub) => ({
        name: sub.name.trim(),
        tagline: sub.tagline.trim(),
      })),
    };

    setLoading(true);

    try {
      let res;
      if (editCategoryData?._id) {
        res = await AdminAPI.updateHealthyCategory(editCategoryData._id, {
          ...payload,
          isActive: true,
        });
      } else {
        res = await AdminAPI.addHealthyCategory(payload);
      }

      setSuccessMsg(res?.message || 'Category saved successfully!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Failed to save category. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {editCategoryData ? 'Update Category' : 'Create Healthy Category'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Add main target group and its diet programs
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Main Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={mainCategory}
              onChange={(e) => setMainCategory(e.target.value)}
              placeholder="e.g. Men, Women, Child, Old"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3d3f96] focus:border-[#3d3f96] outline-none text-sm transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">
                Subcategories / Programs <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAddSubCategory}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#3d3f96] hover:bg-[#3d3f96]/10 bg-gray-100 px-3 py-1.5 rounded-md transition"
              >
                <Plus size={14} /> Add Program
              </button>
            </div>

            <div className="space-y-3">
              {subCategories.map((sub, index) => (
                <div
                  key={index}
                  className="p-3.5 border border-gray-200 rounded-xl bg-gray-50/50 space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">
                      Program #{index + 1}
                    </span>
                    {subCategories.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSubCategoryRow(index, sub)}
                        className="text-gray-400 hover:text-red-600 transition p-1"
                        title="Remove Subcategory"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Name (e.g. Keto Flex)"
                        value={sub.name}
                        onChange={(e) =>
                          handleSubCategoryChange(index, 'name', e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3d3f96] focus:border-[#3d3f96] outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Tagline (e.g. Clinically balanced low GI meals)"
                        value={sub.tagline}
                        onChange={(e) =>
                          handleSubCategoryChange(index, 'tagline', e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3d3f96] focus:border-[#3d3f96] outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-[#3d3f96] hover:bg-[#343680] text-white text-sm font-medium transition flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {editCategoryData ? 'Update Category' : 'Save Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}