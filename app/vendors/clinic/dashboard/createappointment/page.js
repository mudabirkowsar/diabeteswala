"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Stethoscope,
  Building2,
  Bed,
  Car,
  User,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Activity,
  Check,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  Receipt,
  ShieldCheck,
  Loader2,
  Banknote,
  FileText,
  ArrowLeft,
  BadgeCheck,
  Sparkles,
  Star,
  Home
} from 'lucide-react';

import ClinicAPI from '../../../../services/ClinicAPI';

// --- MEDIA HELPER ---
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";

const getMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  return `${BASE_SERVER_URL}/${cleanPath}`;
};

const DOC_PLACEHOLDER = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop";

export default function ClinicDeskBookingPage() {
  const router = useRouter();

  // --- Dynamic API Resources States ---
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState({
    doctors: [],
    ambulances: [],
    wards: []
  });
  const [submitting, setSubmitting] = useState(false);

  // --- In-App Toast System ---
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // --- Form State 1: Walk-In / Phone Patient Information ---
  const [patientForm, setPatientForm] = useState({
    name: "",
    phone: "",
    age: "",
    gender: "Male",
    relation: "Self",
    houseNo: "",
    sector: "",
    city: "",
    state: "",
    pincode: ""
  });

  // --- Form State 2: Care Category & Mode ---
  // bookingType: 'Appointment' (OPD), 'Admission' (IPD), 'Emergency'
  const [bookingType, setBookingType] = useState('Appointment');
  // consultationType: 'Clinic Visit', 'Home Visit', 'Video Consult'
  const [consultationType, setConsultationType] = useState('Clinic Visit');

  // --- Form State 3: Doctor Selection ---
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [doctorSearch, setDoctorSearch] = useState("");

  // --- Form State 4: Ward & Bed Selection (IPD / Emergency) ---
  const [selectedWardId, setSelectedWardId] = useState("");
  const [selectedBedId, setSelectedBedId] = useState("");
  const [stayDuration, setStayDuration] = useState(1);

  // --- Form State 5: Ambulance Selection (Emergency) ---
  const [selectedAmbulanceId, setSelectedAmbulanceId] = useState("");

  // --- Form State 6: Timing & Clinical Symptoms ---
  const todayStr = new Date().toISOString().split('T')[0];
  const [appointmentDate, setAppointmentDate] = useState(todayStr);
  const [appointmentTime, setAppointmentTime] = useState("10:30 AM");
  const [symptoms, setSymptoms] = useState("");

  // --- Form State 7: Success Confirmation Receipt Modal ---
  const [createdBooking, setCreatedBooking] = useState(null);

  // Fetch dynamic clinic metadata resources on load (GET /api/clinic/booking/resources)
  useEffect(() => {
    let isMounted = true;

    const fetchClinicResources = async () => {
      setLoading(true);
      try {
        // Call GET /api/clinic/booking/resources
        const response = await ClinicAPI.getClinicAllData();

        if (isMounted && response && response.success) {
          const data = response.data || {};
          setResources({
            doctors: data.doctors || [],
            ambulances: data.ambulances || [],
            wards: data.wards || []
          });

          // Pre-select first doctor if available
          if (data.doctors && data.doctors.length > 0) {
            setSelectedDoctorId(data.doctors[0]._id);
          }

          // Pre-select first ward if available
          if (data.wards && data.wards.length > 0) {
            setSelectedWardId(data.wards[0]._id);
          }
        } else {
          if (isMounted) showToast(response?.message || "Unable to retrieve clinic booking resources.", "error");
        }
      } catch (err) {
        console.error("Error fetching clinic resources:", err);
        if (isMounted) showToast(err?.response?.data?.message || err.message || "Failed to load facility metadata.", "error");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchClinicResources();

    return () => {
      isMounted = false;
    };
  }, []);

  // Active Selected Doctor Object
  const activeDoctor = useMemo(() => {
    if (!resources.doctors) return null;
    return resources.doctors.find((d) => d._id === selectedDoctorId) || null;
  }, [resources.doctors, selectedDoctorId]);

  // Filtered Doctors List
  const filteredDoctors = useMemo(() => {
    if (!resources.doctors) return [];
    if (!doctorSearch.trim()) return resources.doctors;
    return resources.doctors.filter((doc) =>
      doc.name?.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      doc.speciality?.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      doc.qualification?.toLowerCase().includes(doctorSearch.toLowerCase())
    );
  }, [resources.doctors, doctorSearch]);

  // Active Selected Ward Object
  const activeWard = useMemo(() => {
    if (!resources.wards) return null;
    return resources.wards.find((w) => w._id === selectedWardId) || null;
  }, [resources.wards, selectedWardId]);

  // Active Ward's Beds List
  const wardBeds = useMemo(() => {
    return activeWard?.beds || [];
  }, [activeWard]);

  // Active Selected Bed Object
  const activeBed = useMemo(() => {
    if (!wardBeds) return null;
    return wardBeds.find((b) => b._id === selectedBedId) || null;
  }, [wardBeds, selectedBedId]);

  // Active Selected Ambulance Object
  const activeAmbulance = useMemo(() => {
    if (!resources.ambulances) return null;
    return resources.ambulances.find((a) => a._id === selectedAmbulanceId) || null;
  }, [resources.ambulances, selectedAmbulanceId]);

  // Real-time Dynamic Pricing Calculation
  const calculatedPricing = useMemo(() => {
    let doctorFee = 0;
    if (activeDoctor) {
      if (consultationType === 'Video Consult') {
        doctorFee = Number(activeDoctor.fees?.online || 500);
      } else if (consultationType === 'Home Visit') {
        doctorFee = Number(activeDoctor.fees?.home || 1200);
      } else {
        doctorFee = Number(activeDoctor.fees?.clinic || 800);
      }
    }

    let bedFee = 0;
    if ((bookingType === 'Admission' || bookingType === 'Emergency') && activeBed) {
      const pricePerDay = Number(activeBed.pricePerDay || activeWard?.pricePerDay || 0);
      bedFee = pricePerDay * Math.max(1, Number(stayDuration) || 1);
    }

    let ambulanceFee = 0;
    if (bookingType === 'Emergency' && activeAmbulance) {
      ambulanceFee = Number(activeAmbulance.pricing?.singleRidePrice || 400);
    }

    const totalAmount = doctorFee + bedFee + ambulanceFee;

    return {
      doctorFee,
      bedFee,
      ambulanceFee,
      totalAmount
    };
  }, [activeDoctor, consultationType, bookingType, activeBed, activeWard, stayDuration, activeAmbulance]);

  // Submit Clinic Desk Booking (POST /api/clinic/booking/create)
  const handleCreateDeskBooking = async (e) => {
    e.preventDefault();

    // 1. Mandatory Validations
    if (!patientForm.name.trim()) {
      showToast("Patient full name is required.", "error");
      return;
    }
    if (!patientForm.phone.trim()) {
      showToast("Patient contact phone number is required.", "error");
      return;
    }
    if (!patientForm.city.trim()) {
      showToast("Patient city is required.", "error");
      return;
    }
    if (consultationType === 'Home Visit' && !patientForm.houseNo.trim()) {
      showToast("House / Flat number is mandatory for Doctor Home Visits.", "error");
      return;
    }
    if (bookingType === 'Admission' && (!selectedWardId || !selectedBedId)) {
      showToast("Please assign an available ward and bed for IPD Admission.", "error");
      return;
    }

    setSubmitting(true);

    try {
      // Build request body according to API documentation
      const bookingPayload = {
        name: patientForm.name.trim(),
        phone: patientForm.phone.trim(),
        age: Number(patientForm.age) || undefined,
        gender: patientForm.gender || "Male",
        relation: patientForm.relation || "Self",
        bookingType, // 'Appointment' | 'Admission' | 'Emergency'
        consultationType, // 'Clinic Visit' | 'Home Visit' | 'Video Consult'
        doctorId: selectedDoctorId || undefined,
        wardId: (bookingType !== 'Appointment' && selectedWardId) ? selectedWardId : undefined,
        bedId: (bookingType !== 'Appointment' && selectedBedId) ? selectedBedId : undefined,
        stayDuration: (bookingType !== 'Appointment' && selectedBedId) ? Number(stayDuration) : undefined,
        ambulanceId: (bookingType === 'Emergency' && selectedAmbulanceId) ? selectedAmbulanceId : undefined,
        appointmentDate: appointmentDate || todayStr,
        appointmentTime: appointmentTime || "10:30 AM",
        symptoms: symptoms.trim() || undefined,
        paymentMethod: "COD",
        address: {
          houseNo: patientForm.houseNo.trim() || undefined,
          sector: patientForm.sector.trim() || undefined,
          city: patientForm.city.trim(),
          state: patientForm.state.trim() || undefined,
          pincode: patientForm.pincode.trim() || undefined
        }
      };

      const response = await ClinicAPI.createClinicDeskBooking(bookingPayload);

      if (response && response.success) {
        showToast(response.message || "Clinic booking/admission created successfully and Bed is now Occupied!", "success");
        setCreatedBooking(response.data || bookingPayload);

        // Update local bed status to Occupied dynamically so reception UI reflects it immediately
        if (selectedWardId && selectedBedId) {
          setResources((prev) => ({
            ...prev,
            wards: prev.wards.map((w) => {
              if (w._id === selectedWardId) {
                return {
                  ...w,
                  availableBedsCount: Math.max(0, (w.availableBedsCount || 1) - 1),
                  beds: w.beds.map((b) => b._id === selectedBedId ? { ...b, status: 'Occupied', isAvailable: false } : b)
                };
              }
              return w;
            })
          }));
        }

        // Reset form fields
        setPatientForm({
          name: "",
          phone: "",
          age: "",
          gender: "Male",
          relation: "Self",
          houseNo: "",
          sector: "",
          city: "",
          state: "",
          pincode: ""
        });
        setSymptoms("");
        setSelectedBedId("");
      } else {
        showToast(response?.message || "Failed to create clinic desk booking.", "error");
      }
    } catch (err) {
      console.error("Error creating clinic desk booking:", err);
      showToast(err?.response?.data?.message || err.message || "Error submitting booking. Please check fields.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-[#f4f7fc] to-[#eef2f9] flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-[#3d3f96] border-r-rose-500 animate-spin" />
          <Building2 size={24} className="absolute text-[#3d3f96]" />
        </div>
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 mt-5">
          Loading Clinic Metadata Resources...
        </h3>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Retrieving verified doctors, ward bed units &amp; ambulance fleet
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-800 pb-32 antialiased select-none text-left">

      {/* --- IN-APP TOAST NOTIFICATION --- */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-in slide-in-from-top duration-300">
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-xs font-black ${toast.type === "success"
              ? "bg-emerald-600 text-white border-emerald-500 shadow-emerald-950/20"
              : "bg-rose-600 text-white border-rose-500 shadow-rose-950/20"
            }`}>
            {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 hover:opacity-80">
              <X size={14} />
            </button>
          </div>
        </div>
      )}
      <main className="max-w-[1500px] mx-auto">
        <form onSubmit={handleCreateDeskBooking} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ========================================================================= */}
          {/* LEFT COLUMN: RECEPTION DESK ENTRY FORM (8 COLS) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-8 space-y-7">

            {/* SECTION 1: WALK-IN / PHONE PATIENT INFORMATION */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2.5 text-[#3d3f96]">
                  <div className="w-9 h-9 rounded-2xl border border-indigo-100/80 flex items-center justify-center">
                    <User size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      1. Patient Information (Walk-in / Phone Caller)
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">Direct receptionist entry without requiring patient login</p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
                  Name Required
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Full Name */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Patient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amit Verma"
                    value={patientForm.name}
                    onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96] transition-all"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit Phone"
                    value={patientForm.phone}
                    onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96] transition-all"
                  />
                </div>

                {/* Relation */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Relation
                  </label>
                  <select
                    value={patientForm.relation}
                    onChange={(e) => setPatientForm({ ...patientForm, relation: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96] transition-all"
                  >
                    <option value="Self">Self</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Age */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Age
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    placeholder="e.g. 34"
                    value={patientForm.age}
                    onChange={(e) => setPatientForm({ ...patientForm, age: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96] transition-all"
                  />
                </div>

                {/* Gender */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Gender
                  </label>
                  <select
                    value={patientForm.gender}
                    onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96] transition-all"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* City */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mohali"
                    value={patientForm.city}
                    onChange={(e) => setPatientForm({ ...patientForm, city: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96] transition-all"
                  />
                </div>
              </div>

              {/* Address Row (House / Sector / State / Pincode) */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    House / Flat #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. House #204"
                    value={patientForm.houseNo}
                    onChange={(e) => setPatientForm({ ...patientForm, houseNo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Sector / Area
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sector 70"
                    value={patientForm.sector}
                    onChange={(e) => setPatientForm({ ...patientForm, sector: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    State
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Punjab"
                    value={patientForm.state}
                    onChange={(e) => setPatientForm({ ...patientForm, state: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Pincode
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 160071"
                    value={patientForm.pincode}
                    onChange={(e) => setPatientForm({ ...patientForm, pincode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96]"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: CARE CATEGORY & CONSULTATION TYPE */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2.5 text-[#3d3f96]">
                  <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center">
                    <Stethoscope size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      2. Select Care Tier &amp; Mode
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">OPD Consultation vs Inpatient Bed Admission vs Emergency</p>
                  </div>
                </div>
              </div>

              {/* 3 Care Category Tabs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Option A: Appointment (OPD) */}
                <div
                  onClick={() => {
                    setBookingType('Appointment');
                    setSelectedBedId("");
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${bookingType === 'Appointment'
                      ? 'border-[#3d3f96] bg-indigo-50/50 ring-2 ring-[#3d3f96]/15 shadow-xs'
                      : 'border-slate-200/80 bg-white hover:border-slate-300'
                    }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bookingType === 'Appointment' ? 'bg-[#3d3f96] text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                    <Stethoscope size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">OPD Appointment</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Outpatient consultation</p>
                  </div>
                </div>

                {/* Option B: Admission (IPD) */}
                <div
                  onClick={() => setBookingType('Admission')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${bookingType === 'Admission'
                      ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/15 shadow-xs'
                      : 'border-slate-200/80 bg-white hover:border-slate-300'
                    }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bookingType === 'Admission' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                    <Building2 size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">IPD Bed Admission</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Multi-day inpatient bed</p>
                  </div>
                </div>

                {/* Option C: Emergency */}
                <div
                  onClick={() => setBookingType('Emergency')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${bookingType === 'Emergency'
                      ? 'border-rose-600 bg-rose-50/50 ring-2 ring-rose-600/15 shadow-xs'
                      : 'border-slate-200/80 bg-white hover:border-slate-300'
                    }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bookingType === 'Emergency' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                    <Activity size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">Emergency / Triage</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Casualty &amp; urgent bed</p>
                  </div>
                </div>
              </div>

              {/* Consultation Type Radio Pills */}
              <div className="space-y-1.5 pt-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  Consultation Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Clinic Visit', 'Home Visit', 'Video Consult'].map((mode) => (
                    <button
                      type="button"
                      key={mode}
                      onClick={() => setConsultationType(mode)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${consultationType === mode
                          ? 'border-[#3d3f96] bg-indigo-50 text-[#3d3f96] shadow-2xs'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                      {mode === 'Clinic Visit' && <MapPin size={13} className="text-rose-500" />}
                      {mode === 'Home Visit' && <Home size={13} className="text-emerald-600" />}
                      {mode === 'Video Consult' && <Clock size={13} className="text-indigo-600" />}
                      <span>{mode}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION 3: ATTENDING SPECIALIST DOCTOR */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2.5 text-[#3d3f96]">
                  <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center">
                    <Stethoscope size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      3. Assign Specialist Doctor ({resources.doctors.length})
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">Select attending specialist from clinic registry</p>
                  </div>
                </div>

                {resources.doctors.length > 2 && (
                  <div className="relative w-full sm:w-64">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={doctorSearch}
                      onChange={(e) => setDoctorSearch(e.target.value)}
                      placeholder="Search doctor..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#3d3f96]"
                    />
                  </div>
                )}
              </div>

              {/* Doctor Selection Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 max-h-72 overflow-y-auto pr-1">
                {filteredDoctors.map((doc) => {
                  const isSelected = selectedDoctorId === doc._id;
                  const photo = getMediaUrl(doc.profileImage) || DOC_PLACEHOLDER;

                  return (
                    <div
                      key={doc._id}
                      onClick={() => setSelectedDoctorId(doc._id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${isSelected
                          ? 'border-[#3d3f96] bg-indigo-50/50 ring-2 ring-[#3d3f96]/15 shadow-xs'
                          : 'border-slate-200/80 bg-white hover:border-slate-300'
                        }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                        <img
                          src={photo}
                          alt={doc.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = DOC_PLACEHOLDER; }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-slate-900 truncate">
                            {doc.name}
                          </h4>
                        </div>
                        <p className="text-[11px] font-bold text-rose-600 truncate">
                          {doc.speciality}
                        </p>
                        <span className="text-[10px] font-mono font-bold text-slate-500 block">
                          Fee: ₹{doc.fees?.clinic || 800} (Clinic) • ₹{doc.fees?.online || 500} (Video)
                        </span>
                      </div>

                      {isSelected && (
                        <CheckCircle2 size={18} className="text-[#3d3f96] shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION 4: INPATIENT WARD & BED ALLOCATION (FOR ADMISSION & EMERGENCY) */}
            {(bookingType === 'Admission' || bookingType === 'Emergency') && (
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-200/80 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-3.5">
                  <div className="flex items-center gap-2.5 text-emerald-700">
                    <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                      <Bed size={18} />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                        4. Inpatient Ward &amp; Bed Allocation ({resources.wards.length} Wards)
                      </h3>
                      <p className="text-[10px] text-slate-400 font-medium">Selected bed status will automatically update to Occupied</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {bookingType === 'Emergency' ? 'Casualty Bed Optional' : 'Bed Required'}
                  </span>
                </div>

                {/* Ward Selector Tabs */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                    Select Ward Category
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {resources.wards.map((ward) => (
                      <div
                        key={ward._id}
                        onClick={() => {
                          setSelectedWardId(ward._id);
                          setSelectedBedId("");
                        }}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${selectedWardId === ward._id
                            ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/15 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-xs font-black text-slate-900 truncate">
                            {ward.name}
                          </strong>
                          <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {ward.availableBedsCount} of {ward.totalBedsCount} Free
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1 text-[11px]">
                          <span className="text-slate-400 font-bold">{ward.type}</span>
                          <span className="font-mono font-bold text-slate-700">₹{ward.pricePerDay}/day</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dynamic Beds Grid for Active Ward with Status Indicators */}
                {selectedWardId && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                        Bed Units in {activeWard?.name} ({wardBeds.length} Total)
                      </label>
                      {selectedBedId && (
                        <button
                          type="button"
                          onClick={() => setSelectedBedId("")}
                          className="text-[10px] font-black uppercase text-rose-600 hover:underline"
                        >
                          Clear Selected Bed
                        </button>
                      )}
                    </div>

                    {wardBeds.length === 0 ? (
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-center text-xs text-slate-400 font-bold">
                        No bed records registered under this ward.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {wardBeds.map((bed) => {
                          const isSelected = selectedBedId === bed._id;
                          const isAvailable = bed.status === "Available" || bed.isAvailable === true;

                          return (
                            <button
                              type="button"
                              key={bed._id}
                              disabled={!isAvailable}
                              onClick={() => {
                                if (isAvailable) setSelectedBedId(bed._id);
                              }}
                              className={`py-3 px-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center relative ${isSelected
                                  ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs font-black cursor-pointer'
                                  : isAvailable
                                    ? 'border-slate-200 bg-white hover:border-emerald-500 text-slate-800 cursor-pointer shadow-2xs'
                                    : 'border-slate-100 bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                                }`}
                            >
                              <Bed size={14} className="mb-1" />
                              <span className="text-xs font-mono font-black">{bed.bedNumber}</span>
                              <span className={`text-[8px] font-black uppercase mt-0.5 px-1 py-0.2 rounded ${isSelected
                                  ? 'bg-white text-emerald-800'
                                  : isAvailable
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-slate-200 text-slate-500'
                                }`}>
                                {bed.status}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Stay Duration input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Inpatient Stay Duration (Days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="90"
                      value={stayDuration}
                      onChange={(e) => setStayDuration(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-emerald-600"
                    />
                  </div>
                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase">Calculated Bed Total</span>
                    <span className="text-sm font-mono font-black text-emerald-950">
                      ₹{calculatedPricing.bedFee} ({stayDuration}d × ₹{activeBed?.pricePerDay || activeWard?.pricePerDay || 0})
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 5: EMERGENCY AMBULANCE DISPATCH (FOR EMERGENCY TIER) */}
            {bookingType === 'Emergency' && resources.ambulances.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-rose-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-rose-100 pb-3.5">
                  <div className="flex items-center gap-2.5 text-rose-600">
                    <div className="w-9 h-9 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                      <Car size={18} />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                        5. Assign Emergency Ambulance ({resources.ambulances.length} Fleet)
                      </h3>
                      <p className="text-[10px] text-slate-400 font-medium">Select linked clinic emergency fleet</p>
                    </div>
                  </div>
                  {selectedAmbulanceId && (
                    <button
                      type="button"
                      onClick={() => setSelectedAmbulanceId("")}
                      className="text-[10px] font-black uppercase text-rose-600 hover:underline"
                    >
                      Remove Vehicle
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {resources.ambulances.map((amb) => {
                    const isSelected = selectedAmbulanceId === amb._id;
                    return (
                      <div
                        key={amb._id}
                        onClick={() => setSelectedAmbulanceId(amb._id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${isSelected
                            ? 'border-rose-600 bg-rose-50/60 ring-2 ring-rose-600/15 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                      >
                        <div>
                          <h4 className="text-xs font-black text-slate-900">{amb.vehicleType}</h4>
                          <span className="text-[10px] font-mono text-slate-500 font-bold block">{amb.vehicleNumber}</span>
                          <span className="text-[10px] text-slate-400">{amb.name} ({amb.phone})</span>
                        </div>
                        <span className="text-xs font-mono font-black text-rose-600">
                          ₹{amb.pricing?.singleRidePrice || 400}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECTION 6: CLINICAL NOTES & SYMPTOMS */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2.5 text-[#3d3f96] border-b border-slate-100 pb-3">
                <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    6. Symptoms &amp; Chief Complaints
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">Enter patient's health reason or diagnosis notes</p>
                </div>
              </div>

              <textarea
                rows={3}
                placeholder="e.g. Regular diabetic checkup, persistent chest pain, post-operative observation..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96] transition-all resize-none leading-relaxed"
              />
            </div>

          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: RECEPTION DESK INVOICE & ACTION DOCK (4 COLS) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">

            {/* DATE & TIME CONFIG */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2 text-[#3d3f96] border-b border-slate-100 pb-2.5">
                <Calendar size={16} />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Appointment Date &amp; Time
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Date</label>
                  <input
                    type="date"
                    min={todayStr}
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Time Slot</label>
                  <select
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96]"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="02:30 PM">02:30 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                    <option value="06:30 PM">06:30 PM</option>
                    <option value="Immediate">Immediate</option>
                  </select>
                </div>
              </div>
            </div>

            {/* LIVE DESK INVOICE SUMMARY */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <Receipt size={20} className="text-[#3d3f96]" />
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                      Desk Invoice
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">Auto-calculated reception bill</p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                  COD
                </span>
              </div>

              <div className="space-y-3 text-xs font-medium text-slate-600">
                {/* Doctor Fee */}
                <div className="flex items-center justify-between">
                  <span>Specialist ({activeDoctor?.name || 'Doctor'})</span>
                  <span className="font-mono font-bold text-slate-900">₹{calculatedPricing.doctorFee}</span>
                </div>

                {/* Bed Fee */}
                {calculatedPricing.bedFee > 0 && (
                  <div className="flex items-center justify-between">
                    <span>Bed #{activeBed?.bedNumber} ({stayDuration}d × ₹{activeBed?.pricePerDay || activeWard?.pricePerDay})</span>
                    <span className="font-mono font-bold text-slate-900">₹{calculatedPricing.bedFee}</span>
                  </div>
                )}

                {/* Ambulance Fee */}
                {calculatedPricing.ambulanceFee > 0 && (
                  <div className="flex items-center justify-between">
                    <span>Ambulance ({activeAmbulance?.vehicleType})</span>
                    <span className="font-mono font-bold text-slate-900">₹{calculatedPricing.ambulanceFee}</span>
                  </div>
                )}

                {/* Total Amount */}
                <div className="pt-4 border-t border-slate-200 flex items-baseline justify-between text-slate-900">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider block">Total Due</span>
                    <span className="text-[10px] text-slate-400 font-medium">To be collected on-site (COD)</span>
                  </div>
                  <strong className="text-2xl font-black font-mono text-[#3d3f96]">
                    ₹{calculatedPricing.totalAmount}
                  </strong>
                </div>
              </div>

              {/* Create Booking Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-wider bg-[#3d3f96] hover:bg-[#2d2f75] text-white shadow-xl shadow-indigo-950/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 hover:scale-[1.01] active:scale-98"
              >
                {submitting ? (
                  <Loader2 size={18} className="animate-spin text-white" />
                ) : (
                  <BadgeCheck size={18} />
                )}
                <span>
                  {submitting ? 'Booking & Occupying Bed...' : `Confirm Booking (₹${calculatedPricing.totalAmount})`}
                </span>
              </button>
            </div>

          </div>

        </form>
      </main>

      {/* ========================================================================= */}
      {/* SUCCESS CONFIRMATION RECEIPT MODAL */}
      {/* ========================================================================= */}
      {createdBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 size={32} />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                Booking Confirmed
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-2">
                {createdBooking.bookingId || "Booking Confirmed"}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Patient appointment has been created on the clinic desk ledger.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Patient:</span>
                <strong className="text-slate-900">{createdBooking.patientName || createdBooking.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Relation:</span>
                <strong className="text-slate-900">{createdBooking.relation || patientForm.relation || "Self"}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Care Tier:</span>
                <span className="font-bold text-[#3d3f96]">{createdBooking.bookingType}</span>
              </div>
              {createdBooking.wardName && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Ward &amp; Bed:</span>
                  <span className="font-bold text-emerald-700">{createdBooking.wardName} - Bed {createdBooking.bedNumber} (Occupied)</span>
                </div>
              )}
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-600 font-bold">Total Bill:</span>
                <strong className="font-mono text-sm text-slate-900">₹{createdBooking.totalAmount || calculatedPricing.totalAmount} (COD)</strong>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCreatedBooking(null)}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Book Another
              </button>
              <button
                type="button"
                onClick={() => router.push('/vendors/clinic/dashboard/appointments')}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-[#3d3f96] hover:bg-[#2d2f75] text-white shadow-md transition-all"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}