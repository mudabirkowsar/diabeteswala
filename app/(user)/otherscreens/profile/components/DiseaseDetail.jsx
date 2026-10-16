"use client";
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation'; // or 'react-router-dom' depending on your project
import {
    Activity,
    Calendar,
    Users,
    HeartHandshake,
    Tag,
    ChevronRight,
    Loader2,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../../../../context/NotificationContext'; // Adjust path if needed

// Diabetic Type Options
const DIABETIC_TYPES = [
    'Type 1 Diabetic',
    'Type 2 Diabetic',
    'Pre Diabetic',
    'Non Diabetic',
    'Don’t Know'
];

// Family Members List
const FAMILY_MEMBERS = [
    'Father',
    'Mother',
    'Grandfather',
    'Grandmother',
    'Sibling',
    'Other'
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function DiseaseDetail({ updateUserProfile }) {
    const router = useRouter();
    const { showNotification } = useNotification();
    const [btnLoading, setBtnLoading] = useState(false);

    // Form state corresponding directly to your API documentation
    const [formData, setFormData] = useState({
        diabeticType: '',
        sinceHowLong: {
            day: '',
            month: '',
            year: ''
        },
        hasFamilyHistoryDiabetes: false,
        familyHistoryDiabetesMembers: [],
        familyHistoryDiabetesOther: '',
        hasCaregiver: false,
        caregiverDetails: {
            name: '',
            relationship: '',
            phone: '',
            diabeticType: 'Non Diabetic'
        },
        partnerCode: ''
    });

    // Generate years dynamically (from 1950 to Current Year)
    const currentYear = new Date().getFullYear();
    const years = useMemo(() => {
        const arr = [];
        for (let y = currentYear; y >= 1950; y--) arr.push(String(y));
        return arr;
    }, [currentYear]);

    // Handle Family Member Checkboxes
    const toggleFamilyMember = (member) => {
        setFormData((prev) => {
            const exists = prev.familyHistoryDiabetesMembers.includes(member);
            const updated = exists
                ? prev.familyHistoryDiabetesMembers.filter((m) => m !== member)
                : [...prev.familyHistoryDiabetesMembers, member];

            return {
                ...prev,
                familyHistoryDiabetesMembers: updated,
                // Clear 'other' input if 'Other' is deselected
                familyHistoryDiabetesOther: exists && member === 'Other' ? '' : prev.familyHistoryDiabetesOther
            };
        });
    };

    // Form Submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.diabeticType) {
            showNotification('Please select your diabetic type', 'error');
            return;
        }

        try {
            setBtnLoading(true);

            // Using FormData because updateUserProfile sets 'Content-Type': 'multipart/form-data'
            const payload = new FormData();
            payload.append('diabeticType', formData.diabeticType);
            payload.append('sinceHowLong', JSON.stringify(formData.sinceHowLong));
            payload.append('hasFamilyHistoryDiabetes', String(formData.hasFamilyHistoryDiabetes));
            payload.append('familyHistoryDiabetesMembers', JSON.stringify(formData.familyHistoryDiabetesMembers));
            payload.append('familyHistoryDiabetesOther', formData.familyHistoryDiabetesOther);
            payload.append('hasCaregiver', String(formData.hasCaregiver));
            payload.append('caregiverDetails', JSON.stringify(formData.caregiverDetails));
            payload.append('partnerCode', formData.partnerCode);

            const response = await updateUserProfile(payload);

            if (response.success) {
                showNotification(response.message || 'Profile updated successfully!', 'success');

                // Navigation rule as defined in documentation
                if (response.isProfileCompleted) {
                    router.push('/dashboard');
                } else {
                    router.push('/onboarding-diabetic-info');
                }
            } else {
                showNotification(response.message || 'Failed to update details', 'error');
            }
        } catch (err) {
            showNotification(err?.response?.data?.message || err.message || 'Something went wrong', 'error');
        } finally {
            setBtnLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8 antialiased">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <span className="inline-block bg-indigo-50 text-[#3d3f96] text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
                        Onboarding Details
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                        Let us know <span className="text-[#3d3f96]">about you</span>
                    </h1>
                    <p className="text-sm font-medium text-slate-500 mt-2">
                        Help us personalize your care journey and health management
                    </p>
                </div>

                {/* Form Card */}
                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-indigo-50/50 p-6 sm:p-10 space-y-8"
                >
                    {/* Section 1: Diabetic Type */}
                    <div className="space-y-4">
                        <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                            <Activity size={16} className="text-[#3d3f96]" />
                            What is your diabetic condition? *
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {DIABETIC_TYPES.map((type) => {
                                const isSelected = formData.diabeticType === type;
                                return (
                                    <button
                                        type="button"
                                        key={type}
                                        onClick={() => setFormData({ ...formData, diabeticType: type })}
                                        className={`p-4 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between ${isSelected
                                            ? 'border-[#3d3f96] bg-indigo-50/40 text-[#3d3f96] shadow-sm'
                                            : 'border-slate-100 bg-slate-50/50 text-slate-600 hover:border-slate-200'
                                            }`}
                                    >
                                        <span>{type}</span>
                                        {isSelected && <CheckCircle2 size={16} className="text-[#3d3f96]" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Section 2: Since How Long */}
                    <div className="space-y-4">
                        <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                            <Calendar size={16} className="text-[#3d3f96]" />
                            Since how long have you had this condition?
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <select
                                    value={formData.sinceHowLong.day}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            sinceHowLong: { ...formData.sinceHowLong, day: e.target.value }
                                        })
                                    }
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-[#3d3f96]"
                                >
                                    <option value="">Day</option>
                                    {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')).map((d) => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <select
                                    value={formData.sinceHowLong.month}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            sinceHowLong: { ...formData.sinceHowLong, month: e.target.value }
                                        })
                                    }
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-[#3d3f96]"
                                >
                                    <option value="">Month</option>
                                    {MONTHS.map((m) => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <select
                                    value={formData.sinceHowLong.year}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            sinceHowLong: { ...formData.sinceHowLong, year: e.target.value }
                                        })
                                    }
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-[#3d3f96]"
                                >
                                    <option value="">Year</option>
                                    {years.map((y) => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 my-4" />

                    {/* Section 3: Family History */}
                    <div className="space-y-4">
                        <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                            <Users size={16} className="text-[#3d3f96]" />
                            Any family history of diabetes?
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="familyHistory"
                                    checked={formData.hasFamilyHistoryDiabetes === true}
                                    onChange={() => setFormData({ ...formData, hasFamilyHistoryDiabetes: true })}
                                    className="accent-[#3d3f96] w-4 h-4 cursor-pointer"
                                />
                                <span className="text-sm font-bold text-slate-700">Yes</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="familyHistory"
                                    checked={formData.hasFamilyHistoryDiabetes === false}
                                    onChange={() =>
                                        setFormData({
                                            ...formData,
                                            hasFamilyHistoryDiabetes: false,
                                            familyHistoryDiabetesMembers: [],
                                            familyHistoryDiabetesOther: ''
                                        })
                                    }
                                    className="accent-[#3d3f96] w-4 h-4 cursor-pointer"
                                />
                                <span className="text-sm font-bold text-slate-700">No</span>
                            </label>
                        </div>

                        {/* Expandable Family Members Checkboxes */}
                        <AnimatePresence>
                            {formData.hasFamilyHistoryDiabetes && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-4 pt-2 overflow-hidden"
                                >
                                    <p className="text-xs font-semibold text-slate-500">Select affected family member(s):</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                        {FAMILY_MEMBERS.map((member) => {
                                            const isChecked = formData.familyHistoryDiabetesMembers.includes(member);
                                            return (
                                                <label
                                                    key={member}
                                                    onClick={() => toggleFamilyMember(member)}
                                                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2.5 cursor-pointer transition-all ${isChecked
                                                        ? 'bg-indigo-50/50 border-[#3d3f96] text-[#3d3f96]'
                                                        : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100/60'
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => { }} // Controlled via label onClick
                                                        className="rounded text-[#3d3f96] focus:ring-[#3d3f96] accent-[#3d3f96]"
                                                    />
                                                    {member}
                                                </label>
                                            );
                                        })}
                                    </div>

                                    {formData.familyHistoryDiabetesMembers.includes('Other') && (
                                        <div className="mt-2 space-y-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                                Please specify other member
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.familyHistoryDiabetesOther}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        familyHistoryDiabetesOther: e.target.value
                                                    })
                                                }
                                                placeholder="e.g. Maternal Uncle"
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-[#3d3f96]"
                                            />
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="border-t border-slate-100 my-4" />

                    {/* Section 4: Caregiver Info */}
                    <div className="space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.hasCaregiver}
                                onChange={(e) => setFormData({ ...formData, hasCaregiver: e.target.checked })}
                                className="w-4 h-4 rounded text-[#3d3f96] focus:ring-[#3d3f96] accent-[#3d3f96] cursor-pointer"
                            />
                            <span className="flex items-center gap-2 text-xs font-black text-slate-700 uppercase tracking-widest">
                                <HeartHandshake size={16} className="text-[#3d3f96]" />
                                Do you have a caregiver?
                            </span>
                        </label>

                        {/* Expandable Caregiver Form */}
                        <AnimatePresence>
                            {formData.hasCaregiver && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-4 pt-2 overflow-hidden"
                                >
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Caregiver Name</label>
                                            <input
                                                type="text"
                                                required={formData.hasCaregiver}
                                                value={formData.caregiverDetails.name}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        caregiverDetails: { ...formData.caregiverDetails, name: e.target.value }
                                                    })
                                                }
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-[#3d3f96]"
                                                placeholder="e.g. Aman Khan"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Relationship</label>
                                            <input
                                                type="text"
                                                required={formData.hasCaregiver}
                                                value={formData.caregiverDetails.relationship}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        caregiverDetails: { ...formData.caregiverDetails, relationship: e.target.value }
                                                    })
                                                }
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-[#3d3f96]"
                                                placeholder="e.g. Brother / Spouse"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Caregiver Phone</label>
                                            <input
                                                type="tel"
                                                required={formData.hasCaregiver}
                                                value={formData.caregiverDetails.phone}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        caregiverDetails: { ...formData.caregiverDetails, phone: e.target.value }
                                                    })
                                                }
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-[#3d3f96]"
                                                placeholder="e.g. 9876543210"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Caregiver Condition</label>
                                            <select
                                                value={formData.caregiverDetails.diabeticType}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        caregiverDetails: { ...formData.caregiverDetails, diabeticType: e.target.value }
                                                    })
                                                }
                                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-[#3d3f96]"
                                            >
                                                {DIABETIC_TYPES.map((type) => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="border-t border-slate-100 my-4" />

                    {/* Section 5: Partner Code */}
                    <div className="space-y-1">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            <Tag size={14} className="text-[#3d3f96]" />
                            Partner Code (Optional)
                        </label>
                        <input
                            type="text"
                            value={formData.partnerCode}
                            onChange={(e) => setFormData({ ...formData, partnerCode: e.target.value })}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold uppercase outline-none focus:border-[#3d3f96]"
                            placeholder="e.g. DW-SPECIAL-10"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={btnLoading}
                        className="w-full py-4 sm:py-5 bg-[#3d3f96] text-white rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-[#2d2f75] transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99] cursor-pointer"
                    >
                        {btnLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                <span>Updating...</span>
                            </>
                        ) : (
                            <>
                                <span>Continue</span>
                                <ChevronRight size={18} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default DiseaseDetail;