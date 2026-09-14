'use client';

import React, { useState, useEffect } from 'react';
import IndependentDoctorAPI from '../../../../services/IndependentDoctorAPI';
import {
    Stethoscope,
    DollarSign,
    Calendar,
    Clock,
    MapPin,
    User,
    CheckCircle2,
    AlertCircle,
    Plus,
    Trash2,
    UploadCloud,
    Camera,
    PenTool,
    Globe,
    Activity,
    Award,
    Save,
    Loader2,
    ShieldAlert
} from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function DoctorProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState({ type: '', message: '' });

    // Active Section Tab
    const [activeTab, setActiveTab] = useState('fees');

    // 1. Basic & Clinical Info
    const [basicInfo, setBasicInfo] = useState({
        name: '',
        gender: 'Male',
        speciality: '',
        qualification: '',
        experienceYears: '',
        about: '',
        slotDuration: 30,
    });

    // 2. 3-Way Consultation Fees & Availability Toggles
    const [fees, setFees] = useState({
        onlineFee: '',
        clinicFee: '',
        homeFee: '',
        isOnlineAvailable: true,
        isClinicAvailable: true,
        isHomeAvailable: false,
    });

    // 3. Council Registration
    const [councilDetails, setCouncilDetails] = useState({
        licenseNumber: '',
        councilName: '',
        councilNumber: '',
    });

    // 4. Address & Location
    const [addressInfo, setAddressInfo] = useState({
        address: '',
        city: '',
        state: '',
        pincode: '',
        latitude: '',
        longitude: '',
    });

    // 5. Dynamic Qualifications
    const [qualifications, setQualifications] = useState([]);

    // 6. Dynamic Weekly Shifts Schedule
    const [availability, setAvailability] = useState([]);

    // 7. Arrays / Tags
    const [languages, setLanguages] = useState([]);
    const [langInput, setLangInput] = useState('');

    const [treatedConditions, setTreatedConditions] = useState([]);
    const [conditionInput, setConditionInput] = useState('');

    const [competencies, setCompetencies] = useState([]);
    const [compInput, setCompInput] = useState('');

    // 8. Media Files & Previews
    const [profileImageFile, setProfileImageFile] = useState(null);
    const [profileImagePreview, setProfileImagePreview] = useState('');
    const [signatureImageFile, setSignatureImageFile] = useState(null);
    const [signatureImagePreview, setSignatureImagePreview] = useState('');

    // Format Media URLs
    const getFullUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http://') || path.startsWith('https://')) return path;
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${BACKEND_URL.replace(/\/$/, '')}${cleanPath}`;
    };

    // Fetch Doctor Profile on Component Mount
    useEffect(() => {
        fetchDoctorProfile();
    }, []);

    const fetchDoctorProfile = async () => {
        setLoading(true);
        try {
            const res = await IndependentDoctorAPI.getDoctorSelfProfile();
            if (res?.success && res?.data) {
                const doc = res.data;

                // Basic Info
                setBasicInfo({
                    name: doc.name || '',
                    gender: doc.gender || 'Male',
                    speciality: doc.speciality || '',
                    qualification: doc.qualification || '',
                    experienceYears: doc.experienceYears ?? '',
                    about: doc.about || '',
                    slotDuration: doc.slotDuration || 30,
                });

                // Fees & Availability Status
                setFees({
                    onlineFee: doc.fees?.online ?? 0,
                    clinicFee: doc.fees?.clinic ?? 0,
                    homeFee: doc.fees?.home ?? 0,
                    isOnlineAvailable: doc.isOnlineAvailable ?? doc.consultationStatus?.online ?? true,
                    isClinicAvailable: doc.isClinicAvailable ?? doc.consultationStatus?.clinic ?? true,
                    isHomeAvailable: doc.isHomeAvailable ?? doc.consultationStatus?.home ?? false,
                });

                // Council
                setCouncilDetails({
                    licenseNumber: doc.licenseNumber || '',
                    councilName: doc.councilName || '',
                    councilNumber: doc.councilNumber || '',
                });

                // Address
                setAddressInfo({
                    address: doc.address || '',
                    city: doc.city || '',
                    state: doc.state || '',
                    pincode: doc.pincode || '',
                    latitude: doc.location?.lat ?? '',
                    longitude: doc.location?.lng ?? '',
                });

                // Qualifications Array
                setQualifications(
                    Array.isArray(doc.qualifications) && doc.qualifications.length > 0
                        ? doc.qualifications
                        : [{ degree: '', college: '', year: '', councilName: '', registrationNo: '', stateName: '' }]
                );

                // Availability Schedule
                setAvailability(
                    Array.isArray(doc.availability) && doc.availability.length > 0
                        ? doc.availability
                        : [{ day: 'Mon', startTime: '09:00', endTime: '18:00', isLiveTrackingAvailable: false }]
                );

                // Tags
                setLanguages(doc.languages || []);
                setTreatedConditions(doc.treatedConditions || []);
                setCompetencies(doc.competencies || []);

                // Images
                if (doc.profileImage) setProfileImagePreview(getFullUrl(doc.profileImage));
                if (doc.signatureImage) setSignatureImagePreview(getFullUrl(doc.signatureImage));
            }
        } catch (error) {
            setFeedback({
                type: 'error',
                message: error?.response?.data?.message || 'Failed to retrieve doctor profile.',
            });
        } finally {
            setLoading(false);
        }
    };

    // Dynamic Qualification Handlers
    const handleAddQualification = () => {
        setQualifications([
            ...qualifications,
            { degree: '', college: '', year: '', councilName: '', registrationNo: '', stateName: '' }
        ]);
    };

    const handleRemoveQualification = (index) => {
        setQualifications(qualifications.filter((_, i) => i !== index));
    };

    const handleQualificationChange = (index, field, value) => {
        const updated = [...qualifications];
        updated[index][field] = value;
        setQualifications(updated);
    };

    // Dynamic Schedule Handlers
    const handleAddAvailability = () => {
        setAvailability([
            ...availability,
            { day: 'Mon', startTime: '09:00', endTime: '18:00', isLiveTrackingAvailable: false }
        ]);
    };

    const handleRemoveAvailability = (index) => {
        setAvailability(availability.filter((_, i) => i !== index));
    };

    const handleAvailabilityChange = (index, field, value) => {
        const updated = [...availability];
        updated[index][field] = value;
        setAvailability(updated);
    };

    // Tag Handlers
    const handleAddTag = (type) => {
        if (type === 'lang' && langInput.trim()) {
            if (!languages.includes(langInput.trim())) setLanguages([...languages, langInput.trim()]);
            setLangInput('');
        } else if (type === 'condition' && conditionInput.trim()) {
            if (!treatedConditions.includes(conditionInput.trim())) setTreatedConditions([...treatedConditions, conditionInput.trim()]);
            setConditionInput('');
        } else if (type === 'comp' && compInput.trim()) {
            if (!competencies.includes(compInput.trim())) setCompetencies([...competencies, compInput.trim()]);
            setCompInput('');
        }
    };

    const handleRemoveTag = (type, item) => {
        if (type === 'lang') setLanguages(languages.filter((x) => x !== item));
        if (type === 'condition') setTreatedConditions(treatedConditions.filter((x) => x !== item));
        if (type === 'comp') setCompetencies(competencies.filter((x) => x !== item));
    };

    // Media Handlers
    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        if (type === 'profile') {
            setProfileImageFile(file);
            setProfileImagePreview(URL.createObjectURL(file));
        } else if (type === 'signature') {
            setSignatureImageFile(file);
            setSignatureImagePreview(URL.createObjectURL(file));
        }
    };

    // Form Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFeedback({ type: '', message: '' });

        try {
            const formData = new FormData();

            // 1. Consultation Fees & Status
            formData.append('onlineFee', Number(fees.onlineFee) || 0);
            formData.append('clinicFee', Number(fees.clinicFee) || 0);
            formData.append('homeFee', Number(fees.homeFee) || 0);
            formData.append('isOnlineAvailable', fees.isOnlineAvailable);
            formData.append('isClinicAvailable', fees.isClinicAvailable);
            formData.append('isHomeAvailable', fees.isHomeAvailable);

            // 2. Basic Info
            formData.append('name', basicInfo.name);
            formData.append('gender', basicInfo.gender);
            formData.append('speciality', basicInfo.speciality);
            formData.append('qualification', basicInfo.qualification);
            formData.append('experienceYears', Number(basicInfo.experienceYears) || 0);
            formData.append('about', basicInfo.about);
            formData.append('slotDuration', Number(basicInfo.slotDuration) || 30);

            // 3. Council Details
            formData.append('licenseNumber', councilDetails.licenseNumber);
            formData.append('councilName', councilDetails.councilName);
            formData.append('councilNumber', councilDetails.councilNumber);

            // 4. Address & Location
            formData.append('address', addressInfo.address);
            formData.append('city', addressInfo.city);
            formData.append('state', addressInfo.state);
            formData.append('pincode', addressInfo.pincode);
            if (addressInfo.latitude) formData.append('latitude', Number(addressInfo.latitude));
            if (addressInfo.longitude) formData.append('longitude', Number(addressInfo.longitude));

            // 5. JSON Stringified Array Fields
            formData.append('qualifications', JSON.stringify(qualifications));
            formData.append('availability', JSON.stringify(availability));
            formData.append('languages', JSON.stringify(languages));
            formData.append('treatedConditions', JSON.stringify(treatedConditions));
            formData.append('competencies', JSON.stringify(competencies));

            // 6. Media Files
            if (profileImageFile) {
                formData.append('profileImage', profileImageFile);
            }
            if (signatureImageFile) {
                formData.append('signatureImage', signatureImageFile);
            }

            const res = await IndependentDoctorAPI.updateDoctorProfileAndFees(formData);

            setFeedback({
                type: 'success',
                message: res.message || 'Profile updates submitted to Admin for review. Your profile will update once approved.',
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            setFeedback({
                type: 'error',
                message: error?.response?.data?.message || 'Error updating profile. Please check the entered data.',
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 text-[#3d3f96] animate-spin mb-3" />
                <p className="text-sm font-medium text-slate-600">Loading your profile & clinic details...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="max-w-6xl mx-auto">
                
                {/* Header Section */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-[#3d3f96]/10 flex items-center justify-center text-[#3d3f96]">
                                <Stethoscope className="w-6 h-6" />
                            </div>
                            Doctor Profile & Fee Settings
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">
                            Manage your 3-way consultation rates, clinic availability, medical council degrees, and digital credentials.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#3d3f96] hover:bg-[#2e3077] text-white font-medium text-sm rounded-lg shadow-sm transition disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Submitting...' : 'Save & Submit Profile'}
                    </button>
                </div>

                {/* Feedback Notification Banner */}
                {feedback.message && (
                    <div
                        className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${
                            feedback.type === 'success'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                : 'bg-[#e53e3e]/10 border-[#e53e3e]/30 text-[#e53e3e]'
                        }`}
                    >
                        {feedback.type === 'success' ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-[#e53e3e] mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                            <p className="text-sm font-semibold">{feedback.message}</p>
                            {feedback.type === 'success' && (
                                <p className="text-xs text-emerald-700 mt-0.5">
                                    Changes are held in Pending status and will go live once verified by platform administrators.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Navigation Tabs */}
                <div className="flex overflow-x-auto space-x-2 border-b border-slate-200 pb-2 mb-6 scrollbar-none">
                    {[
                        { id: 'fees', label: '3-Way Fees & Availability', icon: DollarSign },
                        { id: 'basic', label: 'Clinical Bio & Profile', icon: User },
                        { id: 'council', label: 'Council Verification', icon: ShieldAlert },
                        { id: 'qualifications', label: 'Degrees & Education', icon: Award },
                        { id: 'availability', label: 'Weekly Schedule', icon: Calendar },
                        { id: 'tags', label: 'Expertise & Conditions', icon: Activity },
                        { id: 'location', label: 'Clinic Address', icon: MapPin },
                        { id: 'media', label: 'Photo & Signature', icon: Camera },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition ${
                                    isActive
                                        ? 'bg-[#3d3f96] text-white shadow-sm'
                                        : 'bg-white text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* TAB 1: 3-WAY CONSULTATION FEES & AVAILABILITY */}
                    {activeTab === 'fees' && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-[#3d3f96]" />
                                3-Way Consultation Modes & Pricing Structure
                            </h2>
                            <p className="text-xs text-slate-500 mb-6">
                                Toggle availability for each consultation channel and specify your per-patient pricing in ₹ (INR).
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Online Video Consult */}
                                <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 flex flex-col justify-between hover:border-[#3d3f96]/50 transition">
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                                                <div className="p-1.5 rounded-md bg-[#3d3f96]/10 text-[#3d3f96]">
                                                    <Globe className="w-4 h-4" />
                                                </div>
                                                Online Video Call
                                            </span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={fees.isOnlineAvailable}
                                                    onChange={(e) => setFees({ ...fees, isOnlineAvailable: e.target.checked })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3d3f96]"></div>
                                            </label>
                                        </div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Session Fee (₹)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-slate-400 font-semibold text-sm">₹</span>
                                            <input
                                                type="number"
                                                disabled={!fees.isOnlineAvailable}
                                                value={fees.onlineFee}
                                                onChange={(e) => setFees({ ...fees, onlineFee: e.target.value })}
                                                placeholder="500"
                                                className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3d3f96] disabled:bg-slate-100 disabled:text-slate-400"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-3">In-app HD encrypted video consultation sessions.</p>
                                </div>

                                {/* Clinic Visit */}
                                <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 flex flex-col justify-between hover:border-[#3d3f96]/50 transition">
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                                                <div className="p-1.5 rounded-md bg-[#3d3f96]/10 text-[#3d3f96]">
                                                    <Stethoscope className="w-4 h-4" />
                                                </div>
                                                Clinic OPD Visit
                                            </span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={fees.isClinicAvailable}
                                                    onChange={(e) => setFees({ ...fees, isClinicAvailable: e.target.checked })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3d3f96]"></div>
                                            </label>
                                        </div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Session Fee (₹)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-slate-400 font-semibold text-sm">₹</span>
                                            <input
                                                type="number"
                                                disabled={!fees.isClinicAvailable}
                                                value={fees.clinicFee}
                                                onChange={(e) => setFees({ ...fees, clinicFee: e.target.value })}
                                                placeholder="800"
                                                className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3d3f96] disabled:bg-slate-100 disabled:text-slate-400"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-3">Physical patient checkups conducted at your clinic address.</p>
                                </div>

                                {/* Home Visit */}
                                <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 flex flex-col justify-between hover:border-[#3d3f96]/50 transition">
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                                                <div className="p-1.5 rounded-md bg-[#e53e3e]/10 text-[#e53e3e]">
                                                    <MapPin className="w-4 h-4" />
                                                </div>
                                                Home Visit
                                            </span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={fees.isHomeAvailable}
                                                    onChange={(e) => setFees({ ...fees, isHomeAvailable: e.target.checked })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3d3f96]"></div>
                                            </label>
                                        </div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Session Fee (₹)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-slate-400 font-semibold text-sm">₹</span>
                                            <input
                                                type="number"
                                                disabled={!fees.isHomeAvailable}
                                                value={fees.homeFee}
                                                onChange={(e) => setFees({ ...fees, homeFee: e.target.value })}
                                                placeholder="1500"
                                                className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3d3f96] disabled:bg-slate-100 disabled:text-slate-400"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-3">Doctor travels to patient’s registered residence.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: CLINICAL INFO & BIO */}
                    {activeTab === 'basic' && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <User className="w-5 h-5 text-[#3d3f96]" />
                                Doctor Bio & Clinical Profile
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor Full Display Name</label>
                                    <input
                                        type="text"
                                        value={basicInfo.name}
                                        onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
                                        placeholder="Dr. Kabir Singh"
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3d3f96] focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                                    <select
                                        value={basicInfo.gender}
                                        onChange={(e) => setBasicInfo({ ...basicInfo, gender: e.target.value })}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3d3f96] focus:outline-none bg-white"
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Speciality</label>
                                    <input
                                        type="text"
                                        value={basicInfo.speciality}
                                        onChange={(e) => setBasicInfo({ ...basicInfo, speciality: e.target.value })}
                                        placeholder="Senior Diabetologist & Endocrinologist"
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3d3f96] focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Qualification Summary</label>
                                    <input
                                        type="text"
                                        value={basicInfo.qualification}
                                        onChange={(e) => setBasicInfo({ ...basicInfo, qualification: e.target.value })}
                                        placeholder="MBBS, MD, DM (Endocrinology)"
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3d3f96] focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Practice Experience (in Years)</label>
                                    <input
                                        type="number"
                                        value={basicInfo.experienceYears}
                                        onChange={(e) => setBasicInfo({ ...basicInfo, experienceYears: e.target.value })}
                                        placeholder="14"
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3d3f96] focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Consultation Slot Duration (Minutes)</label>
                                    <input
                                        type="number"
                                        value={basicInfo.slotDuration}
                                        onChange={(e) => setBasicInfo({ ...basicInfo, slotDuration: e.target.value })}
                                        placeholder="30"
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3d3f96] focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Clinical Biography</label>
                                <textarea
                                    rows={4}
                                    value={basicInfo.about}
                                    onChange={(e) => setBasicInfo({ ...basicInfo, about: e.target.value })}
                                    placeholder="Write a summary of your medical career, special areas of interest, research, and patient care philosophy..."
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3d3f96] focus:outline-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* TAB 3: COUNCIL & REGISTRATION */}
                    {activeTab === 'council' && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5 text-[#3d3f96]" />
                                Medical Council Accreditation
                            </h2>
                            <p className="text-xs text-slate-500">
                                Verify your state or national council license credentials.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">License / Reg. Number</label>
                                    <input
                                        type="text"
                                        value={councilDetails.licenseNumber}
                                        onChange={(e) => setCouncilDetails({ ...councilDetails, licenseNumber: e.target.value })}
                                        placeholder="MCI-48209"
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3d3f96] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">State Medical Council Name</label>
                                    <input
                                        type="text"
                                        value={councilDetails.councilName}
                                        onChange={(e) => setCouncilDetails({ ...councilDetails, councilName: e.target.value })}
                                        placeholder="Delhi Medical Council"
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3d3f96] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Council Registration Code</label>
                                    <input
                                        type="text"
                                        value={councilDetails.councilNumber}
                                        onChange={(e) => setCouncilDetails({ ...councilDetails, councilNumber: e.target.value })}
                                        placeholder="DMC-9901"
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3d3f96] focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 4: QUALIFICATIONS & EDUCATION */}
                    {activeTab === 'qualifications' && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <Award className="w-5 h-5 text-[#3d3f96]" />
                                        Educational Qualifications & Degrees
                                    </h2>
                                    <p className="text-xs text-slate-500">Add all accredited undergraduate, postgraduate, and super-speciality degrees.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddQualification}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#3d3f96]/10 text-[#3d3f96] hover:bg-[#3d3f96]/20 text-xs font-bold rounded-lg transition"
                                >
                                    <Plus className="w-4 h-4" /> Add Degree
                                </button>
                            </div>

                            <div className="space-y-4">
                                {qualifications.map((q, idx) => (
                                    <div key={idx} className="p-4 border border-slate-200 rounded-xl bg-slate-50 relative space-y-3">
                                        <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                                            <span className="text-xs font-bold text-[#3d3f96] uppercase tracking-wider">
                                                Degree #{idx + 1}
                                            </span>
                                            {qualifications.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveQualification(idx)}
                                                    className="p-1 rounded text-[#e53e3e] hover:bg-[#e53e3e]/10 transition"
                                                    title="Remove Degree"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Degree Title</label>
                                                <input
                                                    type="text"
                                                    placeholder="MBBS"
                                                    value={q.degree || ''}
                                                    onChange={(e) => handleQualificationChange(idx, 'degree', e.target.value)}
                                                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#3d3f96]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">College / Institution</label>
                                                <input
                                                    type="text"
                                                    placeholder="AIIMS New Delhi"
                                                    value={q.college || ''}
                                                    onChange={(e) => handleQualificationChange(idx, 'college', e.target.value)}
                                                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#3d3f96]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Year of Completion</label>
                                                <input
                                                    type="text"
                                                    placeholder="2012"
                                                    value={q.year || ''}
                                                    onChange={(e) => handleQualificationChange(idx, 'year', e.target.value)}
                                                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#3d3f96]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Council Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="Delhi Medical Council"
                                                    value={q.councilName || ''}
                                                    onChange={(e) => handleQualificationChange(idx, 'councilName', e.target.value)}
                                                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#3d3f96]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Registration No.</label>
                                                <input
                                                    type="text"
                                                    placeholder="MCI-48209"
                                                    value={q.registrationNo || ''}
                                                    onChange={(e) => handleQualificationChange(idx, 'registrationNo', e.target.value)}
                                                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#3d3f96]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">State Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="Delhi"
                                                    value={q.stateName || ''}
                                                    onChange={(e) => handleQualificationChange(idx, 'stateName', e.target.value)}
                                                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#3d3f96]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAB 5: WEEKLY SCHEDULE */}
                    {activeTab === 'availability' && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-[#3d3f96]" />
                                        Weekly Consultation Shifts
                                    </h2>
                                    <p className="text-xs text-slate-500">Configure your operating clinic windows for patient bookings.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddAvailability}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#3d3f96]/10 text-[#3d3f96] hover:bg-[#3d3f96]/20 text-xs font-bold rounded-lg transition"
                                >
                                    <Plus className="w-4 h-4" /> Add Shift Slot
                                </button>
                            </div>

                            <div className="space-y-3">
                                {availability.map((slot, idx) => (
                                    <div key={idx} className="flex flex-wrap items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                                        <div className="w-32">
                                            <select
                                                value={slot.day || 'Mon'}
                                                onChange={(e) => handleAvailabilityChange(idx, 'day', e.target.value)}
                                                className="w-full px-2.5 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white focus:ring-1 focus:ring-[#3d3f96]"
                                            >
                                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                                                    <option key={day} value={day}>{day}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <input
                                                type="time"
                                                value={slot.startTime || '09:00'}
                                                onChange={(e) => handleAvailabilityChange(idx, 'startTime', e.target.value)}
                                                className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:ring-1 focus:ring-[#3d3f96]"
                                            />
                                            <span className="text-xs text-slate-400 font-medium">to</span>
                                            <input
                                                type="time"
                                                value={slot.endTime || '18:00'}
                                                onChange={(e) => handleAvailabilityChange(idx, 'endTime', e.target.value)}
                                                className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:ring-1 focus:ring-[#3d3f96]"
                                            />
                                        </div>

                                        <label className="flex items-center gap-2 text-xs font-medium text-slate-700 ml-auto cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={slot.isLiveTrackingAvailable || false}
                                                onChange={(e) => handleAvailabilityChange(idx, 'isLiveTrackingAvailable', e.target.checked)}
                                                className="rounded text-[#3d3f96] focus:ring-[#3d3f96]"
                                            />
                                            Enable Live Queue / Tracking
                                        </label>

                                        {availability.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveAvailability(idx)}
                                                className="p-1 text-[#e53e3e] hover:bg-[#e53e3e]/10 rounded transition ml-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAB 6: EXPERTISE, CONDITIONS & LANGUAGES */}
                    {activeTab === 'tags' && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-[#3d3f96]" />
                                Treated Conditions, Competencies & Languages
                            </h2>

                            {/* Spoken Languages */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-2">Spoken Languages</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={langInput}
                                        onChange={(e) => setLangInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag('lang'))}
                                        placeholder="e.g. English, Hindi, Punjabi"
                                        className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3d3f96]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleAddTag('lang')}
                                        className="px-4 py-2 bg-[#3d3f96] hover:bg-[#2e3077] text-white text-xs font-semibold rounded-lg transition"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {languages.map((item, idx) => (
                                        <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#3d3f96]/10 text-[#3d3f96] border border-[#3d3f96]/20 rounded-md text-xs font-semibold">
                                            {item}
                                            <button type="button" onClick={() => handleRemoveTag('lang', item)} className="text-[#e53e3e] hover:text-[#c53030] font-bold">×</button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Treated Conditions */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-2">Treated Pathologies & Conditions</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={conditionInput}
                                        onChange={(e) => setConditionInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag('condition'))}
                                        placeholder="e.g. Type 2 Diabetes, Gestational Diabetes, Thyroid Disorders"
                                        className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3d3f96]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleAddTag('condition')}
                                        className="px-4 py-2 bg-[#3d3f96] hover:bg-[#2e3077] text-white text-xs font-semibold rounded-lg transition"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {treatedConditions.map((item, idx) => (
                                        <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-md text-xs font-semibold">
                                            {item}
                                            <button type="button" onClick={() => handleRemoveTag('condition', item)} className="text-[#e53e3e] hover:text-[#c53030] font-bold">×</button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Key Competencies */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-2">Key Clinical Competencies</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={compInput}
                                        onChange={(e) => setCompInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag('comp'))}
                                        placeholder="e.g. Insulin Optimization, Continuous Glucose Monitoring (CGM)"
                                        className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3d3f96]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleAddTag('comp')}
                                        className="px-4 py-2 bg-[#3d3f96] hover:bg-[#2e3077] text-white text-xs font-semibold rounded-lg transition"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {competencies.map((item, idx) => (
                                        <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#e53e3e]/10 text-[#e53e3e] border border-[#e53e3e]/20 rounded-md text-xs font-semibold">
                                            {item}
                                            <button type="button" onClick={() => handleRemoveTag('comp', item)} className="text-[#e53e3e] hover:text-[#c53030] font-bold">×</button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 7: CLINIC LOCATION & ADDRESS */}
                    {activeTab === 'location' && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-[#3d3f96]" />
                                Physical Clinic Practice Address
                            </h2>
                            <p className="text-xs text-slate-500">
                                Exact clinic geo-coordinates and address for patient navigation and OPD bookings.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address</label>
                                    <input
                                        type="text"
                                        value={addressInfo.address}
                                        onChange={(e) => setAddressInfo({ ...addressInfo, address: e.target.value })}
                                        placeholder="Suite #402, Care Tower, Medical District"
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3d3f96] focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                                    <input
                                        type="text"
                                        value={addressInfo.city}
                                        onChange={(e) => setAddressInfo({ ...addressInfo, city: e.target.value })}
                                        placeholder="New Delhi"
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3d3f96] focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                                    <input
                                        type="text"
                                        value={addressInfo.state}
                                        onChange={(e) => setAddressInfo({ ...addressInfo, state: e.target.value })}
                                        placeholder="Delhi"
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3d3f96] focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Postal PIN Code</label>
                                    <input
                                        type="text"
                                        value={addressInfo.pincode}
                                        onChange={(e) => setAddressInfo({ ...addressInfo, pincode: e.target.value })}
                                        placeholder="110017"
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3d3f96] focus:outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Latitude</label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={addressInfo.latitude}
                                            onChange={(e) => setAddressInfo({ ...addressInfo, latitude: e.target.value })}
                                            placeholder="28.6139"
                                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3d3f96] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Longitude</label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={addressInfo.longitude}
                                            onChange={(e) => setAddressInfo({ ...addressInfo, longitude: e.target.value })}
                                            placeholder="77.2090"
                                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3d3f96] focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 8: PROFILE PHOTO & SIGNATURE */}
                    {activeTab === 'media' && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-1">
                                <Camera className="w-5 h-5 text-[#3d3f96]" />
                                Doctor Photo & Digital Signature
                            </h2>
                            <p className="text-xs text-slate-500 mb-6">
                                Upload a high-resolution profile photo and a clean digital signature image (.png with transparent background).
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Profile Image */}
                                <div className="border border-slate-200 rounded-xl p-5 bg-slate-50 flex flex-col items-center text-center">
                                    <span className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
                                        <Camera className="w-4 h-4 text-[#3d3f96]" /> Profile Display Photo
                                    </span>
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#3d3f96]/30 bg-white mb-4 relative flex items-center justify-center shadow">
                                        {profileImagePreview ? (
                                            <img src={profileImagePreview} alt="Doctor Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-12 h-12 text-slate-300" />
                                        )}
                                    </div>
                                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-[#3d3f96] text-[#3d3f96] hover:bg-[#3d3f96] hover:text-white rounded-lg text-xs font-semibold shadow-sm transition">
                                        <UploadCloud className="w-4 h-4" /> Upload New Photo
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'profile')}
                                            className="hidden"
                                        />
                                    </label>
                                    <p className="text-[11px] text-slate-400 mt-2">Supported: JPG, PNG, WEBP</p>
                                </div>

                                {/* Digital Signature */}
                                <div className="border border-slate-200 rounded-xl p-5 bg-slate-50 flex flex-col items-center text-center">
                                    <span className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
                                        <PenTool className="w-4 h-4 text-[#3d3f96]" /> Transparent Digital Signature
                                    </span>
                                    <div className="w-48 h-32 rounded-lg overflow-hidden border-2 border-dashed border-[#3d3f96]/50 bg-white mb-4 relative flex items-center justify-center p-2">
                                        {signatureImagePreview ? (
                                            <img src={signatureImagePreview} alt="Doctor Signature" className="max-h-full object-contain" />
                                        ) : (
                                            <span className="text-xs text-slate-400">No Signature Uploaded</span>
                                        )}
                                    </div>
                                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-[#3d3f96] text-[#3d3f96] hover:bg-[#3d3f96] hover:text-white rounded-lg text-xs font-semibold shadow-sm transition">
                                        <UploadCloud className="w-4 h-4" /> Upload Signature PNG
                                        <input
                                            type="file"
                                            accept="image/png, image/jpeg"
                                            onChange={(e) => handleFileChange(e, 'signature')}
                                            className="hidden"
                                        />
                                    </label>
                                    <p className="text-[11px] text-slate-400 mt-2">Required for valid electronic prescriptions</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bottom Floating Save Action */}
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-8 py-3 bg-[#3d3f96] hover:bg-[#2e3077] text-white font-bold text-sm rounded-xl shadow-lg transition disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {saving ? 'Submitting to Admin Review...' : 'Save & Submit All Changes'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}