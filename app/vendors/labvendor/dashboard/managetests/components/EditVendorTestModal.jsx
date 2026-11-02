"use client";
import React, { useState, useEffect } from 'react';
import { X, Edit3, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import LabVendorAPI from '../../../../../services/LabVendorAPI';

export default function EditVendorTestModal({ isOpen, testData, onClose, onSuccess }) {
    const [actionLoading, setActionLoading] = useState(false);

    const [formValues, setFormValues] = useState({
        amount: '',
        discountPercent: 0,
        reportTime: '24 Hours',
        testType: 'Both',
        precaution: '',
        description: ''
    });

    useEffect(() => {
        if (!isOpen || !testData) return;

        setFormValues({
            amount: testData.amount || '',
            discountPercent: testData.discountPercent || 0,
            reportTime: testData.reportTime || '24 Hours',
            testType: testData.testType || 'Both',
            precaution: testData.precaution || '',
            description: testData.description || ''
        });
    }, [isOpen, testData]);

    if (!isOpen || !testData) return null;

    const numAmount = Number(formValues.amount) || 0;
    const numDiscount = Number(formValues.discountPercent) || 0;
    const calculatedDiscountPrice = Math.max(0, Math.round(numAmount - (numAmount * (numDiscount / 100))));

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();

        if (!numAmount || numAmount <= 0) {
            toast.error("Please enter a valid MRP amount.");
            return;
        }

        setActionLoading(true);
        try {
            const payload = {
                id: testData._id,
                amount: numAmount,
                discountPercent: numDiscount,
                reportTime: formValues.reportTime,
                testType: formValues.testType,
                precaution: formValues.precaution,
                description: formValues.description
            };

            const response = await LabVendorAPI.updateLabTest(payload);
            if (response && response.success) {
                toast.success(response.message || "Test updated successfully!");
                onSuccess();
            } else {
                toast.error(response?.message || "Failed to update test details.");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "An error occurred while updating test.");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

            <div className="bg-white rounded-[2.5rem] max-w-xl w-full p-6 sm:p-8 shadow-2xl relative z-10 border border-slate-100 max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-all cursor-pointer"
                >
                    <X size={18} />
                </button>

                <h2 className="text-xl font-black text-slate-800 tracking-tight mb-2 flex items-center gap-2">
                    <Edit3 className="text-[#3d3f96]" size={20} /> Update Lab Pricing & Terms
                </h2>
                <p className="text-xs font-bold text-slate-400 mb-6">{testData.testName}</p>

                <form onSubmit={handleUpdateSubmit} className="space-y-4 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* MRP */}
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Lab MRP (₹) *</label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={formValues.amount}
                                onChange={(e) => setFormValues({ ...formValues, amount: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96]"
                            />
                        </div>

                        {/* Discount */}
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Discount (%)</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={formValues.discountPercent}
                                onChange={(e) => setFormValues({ ...formValues, discountPercent: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96]"
                            />
                        </div>

                        {/* Discount Price */}
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Patient Price</label>
                            <div className="w-full px-4 py-3 bg-indigo-50/50 border border-indigo-100/40 rounded-xl text-xs font-black text-[#3d3f96]">
                                ₹ {calculatedDiscountPrice}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* TAT */}
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Report TAT</label>
                            <input
                                type="text"
                                value={formValues.reportTime}
                                onChange={(e) => setFormValues({ ...formValues, reportTime: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96]"
                            />
                        </div>

                        {/* Service Type */}
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Service Type</label>
                            <select
                                value={formValues.testType}
                                onChange={(e) => setFormValues({ ...formValues, testType: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 outline-none focus:border-[#3d3f96] cursor-pointer"
                            >
                                <option value="Both">Both (Home Collection & Walk-In)</option>
                                <option value="Home Collection">Home Collection Only</option>
                                <option value="Walk-In">Walk-In Center Only</option>
                            </select>
                        </div>
                    </div>

                    {/* Precautions */}
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Patient Precautions</label>
                        <input
                            type="text"
                            value={formValues.precaution}
                            onChange={(e) => setFormValues({ ...formValues, precaution: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96]"
                        />
                    </div>

                    {/* Notes */}
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Lab Notes</label>
                        <textarea
                            rows={2}
                            value={formValues.description}
                            onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                            className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium text-slate-700 outline-none focus:border-[#3d3f96] resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={actionLoading}
                            className="py-3 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            {actionLoading ? (
                                <Loader2 size={12} className="animate-spin" />
                            ) : (
                                <span>Save Changes</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}