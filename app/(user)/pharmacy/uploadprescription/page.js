"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Upload,
  Sparkles,
  Search,
  Trash2,
  Calendar,
  User,
  Users,
  MapPin,
  Home,
  Briefcase,
  Store,
  Star,
  Truck,
  Loader2,
  Check,
  ArrowRight,
  Pill,
  Bot,
  Clock,
  CheckCircle2
} from 'lucide-react';

// --- SERVICE & CONTEXT IMPORTS ---
import UserAPI from '../../../services/UserAPI';
import { useNotification } from '../../../context/NotificationContext';

// Helper: Convert "DD-MM-YYYY" or ISO string to standard HTML5 input "YYYY-MM-DD"
const formatToInputDate = (dateStr) => {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  if (typeof dateStr === 'string' && dateStr.includes('-')) {
    const parts = dateStr.trim().split('-');
    if (parts[0].length <= 2 && parts[2]?.length === 4) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    if (parts[0].length === 4) {
      return dateStr.split('T')[0];
    }
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date().toISOString().split('T')[0] : d.toISOString().split('T')[0];
};

export default function SinglePageUploadPrescription() {
  const router = useRouter();
  const { showNotification } = useNotification();

  // --- Retrieve Stored Coordinates on Mount ---
  const getInitialCoords = () => {
    let lat;
    let lng;

    if (typeof window !== "undefined") {
      const savedCoords = localStorage.getItem("userCoords");
      if (savedCoords) {
        try {
          const parsed = JSON.parse(savedCoords);
          if (parsed.lat !== undefined && parsed.lng !== undefined) {
            lat = Number(parsed.lat);
            lng = Number(parsed.lng);
          }
        } catch (e) {
          console.error("Error reading stored user coordinates:", e);
        }
      }
    }
    return { lat, lng };
  };

  // --- 1. RX FILE & AI OCR STATE ---
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [aiScanResult, setAiScanResult] = useState(null); // RAW AI Scan Response Details
  const [doctorName, setDoctorName] = useState("");
  const [prescriptionDate, setPrescriptionDate] = useState(new Date().toISOString().split('T')[0]);
  const fileInputRef = useRef(null);

  // --- 2. MEDICINES & DURATION STATE ---
  const [durationType, setDurationType] = useState("Full Course");
  const [medicines, setMedicines] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searchingSuggestions, setSearchingSuggestions] = useState(false);

  // --- 3. ADDRESS & FAMILY RECIPIENT STATE ---
  const [addresses, setAddresses] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [loadingUserData, setLoadingUserData] = useState(true);

  // --- 4. PHARMACY & ESTIMATION STATE ---
  const [pharmacies, setPharmacies] = useState([]);
  const [selectedPharmacyId, setSelectedPharmacyId] = useState(null);
  const [loadingPharmacies, setLoadingPharmacies] = useState(true);
  const [estimate, setEstimate] = useState(null);
  const [estimatingPrice, setEstimatingPrice] = useState(false);

  // --- 5. SUBMISSION STATE ---
  const [submitting, setSubmitting] = useState(false);

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    const loadPageData = async () => {
      try {
        const [addrRes, famRes] = await Promise.all([
          UserAPI.getAddressList().catch(() => ({ data: [] })),
          UserAPI.getFamilyMembers().catch(() => ({ data: [] }))
        ]);

        if (addrRes?.success && addrRes.data?.length > 0) {
          setAddresses(addrRes.data);
          const defaultAddr = addrRes.data.find((a) => a.isDefault) || addrRes.data[0];
          setSelectedAddressId(defaultAddr._id);
        }

        if (famRes?.success) {
          setFamilyMembers(famRes.data || []);
        }
      } catch (err) {
        console.error("Error loading user address data:", err);
        showNotification(err?.message || "Failed to load saved addresses.", "error");
      } finally {
        setLoadingUserData(false);
      }

      try {
        const { lat, lng } = getInitialCoords();
        const coordsPayload = {
          lat: lat ?? 30.7046,
          lng: lng ?? 76.7179,
          search: ""
        };

        const pharmaRes = await UserAPI.getPharmacies(coordsPayload);
        if (pharmaRes?.success && pharmaRes.data?.length > 0) {
          setPharmacies(pharmaRes.data);
          setSelectedPharmacyId(pharmaRes.data[0]._id);
        }
      } catch (err) {
        console.error("Error loading pharmacies:", err);
        showNotification(err?.message || "Could not retrieve nearby pharmacies.", "error");
      } finally {
        setLoadingPharmacies(false);
      }
    };

    loadPageData();
  }, []);

  // --- HANDLE FILE UPLOAD & AI OCR SCAN ---
  const handleFileSelect = async (selectedFile) => {
    if (!selectedFile) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type)) {
      showNotification("Please upload a valid JPG, PNG, or PDF file.", "error");
      return;
    }

    setFile(selectedFile);
    if (selectedFile.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setPreviewUrl(null);
    }

    // Trigger AI Scanning
    setScanning(true);
    setAiScanResult(null);

    try {
      const formData = new FormData();
      formData.append('prescriptionFile', selectedFile);

      const res = await UserAPI.scanPrescription(formData);

      if (res && res.success) {
        const scanData = res.data?.data || res.data || {};

        // Save raw AI scan response for display
        setAiScanResult(scanData);
        showNotification(res.message || "AI Scan Complete! Medicines extracted.", "success");

        // 1. Populate Doctor Name
        if (scanData.doctorName) {
          setDoctorName(scanData.doctorName);
        }

        // 2. Populate Prescription Date (converted to YYYY-MM-DD)
        if (scanData.prescriptionDate) {
          setPrescriptionDate(formatToInputDate(scanData.prescriptionDate));
        }

        // 3. Populate Detected Medicines List
        const detected = scanData.detectedMedicines || [];
        if (detected.length > 0) {
          const parsed = detected.map((m, idx) => {
            let parsedDuration = 15;
            if (m.aiInstruction?.duration) {
              const match = String(m.aiInstruction.duration).match(/\d+/);
              if (match) parsedDuration = parseInt(match[0], 10);
            }

            return {
              id: m.medicineId || `med-${idx}-${Date.now()}`,
              medicineId: m.medicineId || "",
              name: m.name || "Prescribed Medicine",
              mrp: Number(m.mrp) || 0,
              packaging: m.packaging || "",
              imageUrl: m.imageUrl || null,
              dosage: m.aiInstruction?.dosage || "1-0-1",
              durationDays: parsedDuration,
              isAiDetected: true,
              isSelected: true
            };
          });
          setMedicines(parsed);
        }
      } else {
        showNotification("Prescription attached. You can confirm medicines manually.", "success");
      }
    } catch (err) {
      console.error("OCR Scan Error:", err);
      showNotification(err?.message || "File uploaded. Please enter medicines manually.", "error");
    } finally {
      setScanning(false);
    }
  };

  // --- AUTOCOMPLETE MEDICINE SUGGESTIONS ---
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchingSuggestions(true);
      try {
        const res = await UserAPI.getMedicineSuggestions({ query: searchQuery.trim() });
        if (res?.success) setSuggestions(res.data || []);
      } catch (err) {
        console.error("Search suggestion error:", err);
      } finally {
        setSearchingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const addSuggestedMedicine = (item) => {
    const newItem = {
      id: item.id || `custom-${Date.now()}`,
      medicineId: item.id || "",
      name: item.name,
      mrp: Number(item.price) || 0,
      packaging: "",
      imageUrl: item.image || null,
      dosage: "1-0-1",
      durationDays: 15,
      isAiDetected: false,
      isSelected: true
    };
    setMedicines((prev) => [...prev, newItem]);
    setSearchQuery("");
    setSuggestions([]);
    showNotification(`Added ${item.name}`, "success");
  };

  // --- REAL-TIME PRICE ESTIMATION ---
  useEffect(() => {
    const selectedMeds = medicines.filter((m) => m.isSelected);
    if (!selectedPharmacyId || selectedMeds.length === 0) {
      setEstimate(null);
      return;
    }

    const timer = setTimeout(async () => {
      setEstimatingPrice(true);
      try {
        const payload = {
          pharmacyId: selectedPharmacyId,
          medicines: selectedMeds.map((m) => ({
            name: m.name,
            medicineId: m.medicineId,
            durationDays: m.durationDays
          }))
        };
        const res = await UserAPI.estimateRxPrices(payload);
        if (res?.success) setEstimate(res);
      } catch (err) {
        setEstimate(null);
      } finally {
        setEstimatingPrice(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [selectedPharmacyId, medicines]);

  // --- MEDICINE TABLE ACTIONS ---
  const toggleMedicineSelection = (index) => {
    setMedicines((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, isSelected: !item.isSelected } : item))
    );
  };

  const removeMedicine = (index) => {
    setMedicines((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateMedicineField = (index, field, value) => {
    setMedicines((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  // --- FINAL SUBMISSION HANDLER ---
  const handleSubmit = async () => {
    if (!file) {
      showNotification("Please upload your prescription document first.", "error");
      return;
    }

    const confirmedMedicines = medicines.filter((m) => m.isSelected);
    if (confirmedMedicines.length === 0) {
      showNotification("Please confirm at least one medicine to proceed.", "error");
      return;
    }

    const chosenAddress = addresses.find((a) => a._id === selectedAddressId);
    if (!chosenAddress) {
      showNotification("Please select a delivery address.", "error");
      return;
    }

    if (!selectedPharmacyId) {
      showNotification("Please select a fulfilling pharmacy store.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('pharmacyId', selectedPharmacyId);
      formData.append('doctorName', doctorName || "Unspecified Doctor");
      formData.append('prescriptionDate', prescriptionDate || new Date().toISOString());
      formData.append('durationType', durationType);

      formData.append(
        'requestedMedicines',
        JSON.stringify(
          confirmedMedicines.map((m) => ({
            name: m.name,
            dosage: m.dosage,
            durationDays: Number(m.durationDays),
            isSelected: true,
            mrp: m.mrp
          }))
        )
      );

      formData.append(
        'address',
        JSON.stringify({
          name: chosenAddress.name,
          phone: chosenAddress.phone,
          houseNo: chosenAddress.houseNo,
          sector: chosenAddress.sector,
          landmark: chosenAddress.landmark || "",
          city: chosenAddress.city,
          state: chosenAddress.state,
          pincode: chosenAddress.pincode,
          addressType: chosenAddress.addressType || "Home"
        })
      );

      formData.append('prescriptionImage', file);

      const res = await UserAPI.createPrescriptionRequest(formData);

      if (res && res.success) {
        const reqId = res.data?.requestId || "REQ-PLACED";
        showNotification(`Prescription request #${reqId} submitted successfully!`, "success");
        // Absolute path navigation
        router.push('/otherscreens/orders/pharmacyprescriptionorders');
      } else {
        showNotification(res?.message || "Could not place prescription request.", "error");
      }
    } catch (err) {
      console.error("Prescription submission error:", err);
      showNotification(err?.message || "Prescription submission failed.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedAddress = addresses.find((a) => a._id === selectedAddressId);
  const selectedPharmacy = pharmacies.find((p) => p._id === selectedPharmacyId);
  const confirmedCount = medicines.filter((m) => m.isSelected).length;

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 py-8 px-4 sm:px-6 lg:px-8 text-left select-none antialiased">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* --- HEADER TITLE BAR --- */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#3d3f96] text-white flex items-center justify-center shadow-md shadow-indigo-100 shrink-0">
              <Sparkles size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Prescription Digitization &amp; Order
                </h1>
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase bg-indigo-50 text-[#3d3f96] border border-indigo-100">
                  AI Powered
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                Upload your Rx, auto-detect medicines, pick fulfilling licensed pharmacy, and receive quotation.
              </p>
            </div>
          </div>
        </div>

        {/* --- MAIN 2-COLUMN WORKSPACE --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* ========================================================= */}
          {/* LEFT 2 COLUMNS: SECTIONS                                  */}
          {/* ========================================================= */}
          <div className="lg:col-span-2 space-y-6">

            {/* SECTION 1: RX UPLOAD & AI OCR */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FileText size={16} className="text-[#3d3f96]" />
                  1. Upload Prescription Document
                </h2>
                {file && (
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
                    <Check size={11} /> Attached
                  </span>
                )}
              </div>

              {/* Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
                }}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${file ? 'border-[#3d3f96] bg-indigo-50/20' : 'border-slate-300 hover:border-[#3d3f96] bg-slate-50/50'
                  }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files?.[0])}
                />

                {scanning ? (
                  <div className="py-6 space-y-2">
                    <Loader2 size={32} className="animate-spin text-[#3d3f96] mx-auto" />
                    <p className="text-xs font-black text-slate-700">AI OCR is scanning doctor handwriting...</p>
                    <p className="text-[11px] text-slate-400">Extracting doctor notes, medicines, and duration</p>
                  </div>
                ) : previewUrl ? (
                  <div className="flex items-center justify-center gap-4">
                    <img
                      src={previewUrl}
                      alt="Prescription"
                      className="w-16 h-16 object-cover rounded-xl border border-slate-200 shadow-xs"
                    />
                    <div className="text-left">
                      <p className="text-xs font-black text-slate-800">{file?.name}</p>
                      <p className="text-[11px] text-[#3d3f96] font-bold">Click to replace file</p>
                    </div>
                  </div>
                ) : file ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText size={28} className="text-[#3d3f96]" />
                    <div className="text-left">
                      <p className="text-xs font-black text-slate-800">{file.name}</p>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Document Attached</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-center mx-auto text-[#3d3f96]">
                      <Upload size={18} />
                    </div>
                    <p className="text-xs font-black text-slate-800">
                      Click to browse or drag &amp; drop prescription (.jpg, .png, .pdf)
                    </p>
                    <p className="text-[10px] text-slate-400">Our Gemini AI reads handwritten prescriptions automatically</p>
                  </div>
                )}
              </div>

              {/* --- AI OCR DETECTED SUMMARY BANNER (Shows Exactly What AI Extracted) --- */}
              {aiScanResult && (
                <div className="bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 p-4 rounded-2xl border border-indigo-100 space-y-3">
                  <div className="flex items-center justify-between border-b border-indigo-100/60 pb-2.5">
                    <div className="flex items-center gap-2 text-xs font-black text-[#3d3f96]">
                      <Bot size={16} />
                      <span>AI Prescription OCR Results</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 size={11} />
                      {aiScanResult.detectedMedicines?.length || 0} Medicine(s) Detected
                    </span>
                  </div>

                  {/* AI Extracted Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="bg-white/80 p-2.5 rounded-xl border border-indigo-50">
                      <span className="text-[10px] font-black uppercase text-slate-400 block">Detected Doctor</span>
                      <strong className="text-slate-800 font-black">{aiScanResult.doctorName || "Not explicitly specified"}</strong>
                    </div>
                    <div className="bg-white/80 p-2.5 rounded-xl border border-indigo-50">
                      <span className="text-[10px] font-black uppercase text-slate-400 block">Prescription Date</span>
                      <strong className="text-slate-800 font-black">{aiScanResult.prescriptionDate || "Today"}</strong>
                    </div>
                  </div>

                  {/* AI Detected Medicines Badges */}
                  {aiScanResult.detectedMedicines?.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-black uppercase text-indigo-900 tracking-wider">
                        AI Extracted Items:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {aiScanResult.detectedMedicines.map((med, idx) => (
                          <div
                            key={idx}
                            className="bg-white px-2.5 py-1.5 rounded-xl border border-indigo-200 shadow-xs flex items-center gap-2 text-xs"
                          >
                            <Pill size={12} className="text-[#3d3f96]" />
                            <span className="font-black text-slate-900">{med.name}</span>
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                              Dosage: {med.aiInstruction?.dosage || "1-0-1"}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                              ({med.aiInstruction?.duration || "Full Course"})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Extracted Details Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Doctor / Clinic Name
                  </label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                      placeholder="Doctor name (e.g. Dr. Rajesh Sharma)"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Prescription Date
                  </label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="date"
                      value={prescriptionDate}
                      onChange={(e) => setPrescriptionDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: MEDICINES REVIEW & SEARCH */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Pill size={16} className="text-[#3d3f96]" />
                    2. Review Medicines &amp; Add More
                  </h2>
                  <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                    Verified AI scanned items are listed below. Use the search bar to append any additional medicines.
                  </p>
                </div>

                {/* Duration Toggle */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start sm:self-auto">
                  {["Full Course", "Custom"].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setDurationType(mode)}
                      className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer ${durationType === mode
                          ? 'bg-[#3d3f96] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Autocomplete Search Input to Add More Medicines */}
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search medicine catalog to add more (e.g. Dolo, Pan-D, Augmentin)..."
                  className="w-full pl-10 pr-24 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition"
                />
                {searchingSuggestions && (
                  <span className="absolute right-3 top-3 text-[10px] font-bold text-slate-400 animate-pulse">
                    Searching...
                  </span>
                )}

                {/* Suggestions Popover */}
                {suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-12 bg-white rounded-2xl border border-slate-200 shadow-xl z-30 max-h-56 overflow-y-auto divide-y divide-slate-100 p-2">
                    {suggestions.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => addSuggestedMedicine(item)}
                        className="p-2.5 hover:bg-slate-50 rounded-xl flex items-center justify-between cursor-pointer transition"
                      >
                        <div>
                          <p className="text-xs font-black text-slate-900">{item.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{item.salt}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono font-black text-slate-900 block">₹{item.price}</span>
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                            + Add
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Medicines Items Table */}
              {medicines.length === 0 ? (
                <div className="py-8 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs font-bold">
                  No medicines attached yet. Upload prescription or search above to add medicines.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                  {medicines.map((item, idx) => (
                    <div key={item.id || idx} className="p-3.5 flex items-center justify-between gap-3 bg-white hover:bg-slate-50/50 transition">
                      <div className="flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={item.isSelected}
                          onChange={() => toggleMedicineSelection(idx)}
                          className="w-4 h-4 accent-[#3d3f96] rounded cursor-pointer"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-black text-slate-900 truncate">{item.name}</p>
                            {item.isAiDetected ? (
                              <span className="text-[9px] font-black uppercase text-[#3d3f96] bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                                AI Scanned
                              </span>
                            ) : (
                              <span className="text-[9px] font-black uppercase text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                Manual
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 font-bold block mt-0.5">
                            MRP: ₹{item.mrp || 0} {item.packaging ? `• ${item.packaging}` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div>
                          <label className="text-[8px] font-black uppercase text-slate-400 block text-center">Dosage</label>
                          <input
                            type="text"
                            value={item.dosage}
                            onChange={(e) => updateMedicineField(idx, 'dosage', e.target.value)}
                            placeholder="1-0-1"
                            className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-center outline-none focus:border-[#3d3f96]"
                          />
                        </div>
                        <div>
                          <label className="text-[8px] font-black uppercase text-slate-400 block text-center">Days</label>
                          <input
                            type="number"
                            min="1"
                            value={item.durationDays}
                            onChange={(e) => updateMedicineField(idx, 'durationDays', Number(e.target.value))}
                            className="w-14 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-center outline-none focus:border-[#3d3f96]"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMedicine(idx)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer self-end mb-0.5"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 3: DELIVERY DESTINATION & PATIENT */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <MapPin size={16} className="text-[#3d3f96]" />
                  3. Delivery Destination
                </h2>
                {familyMembers.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <Users size={12} className="text-slate-400" />
                    <select
                      value={selectedMemberId || ""}
                      onChange={(e) => setSelectedMemberId(e.target.value || null)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-700 outline-none"
                    >
                      <option value="">Patient: Myself</option>
                      {familyMembers.map((m) => (
                        <option key={m._id} value={m._id}>
                          Patient: {m.memberName} ({m.relation})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {loadingUserData ? (
                <div className="py-6 flex items-center justify-center gap-2 text-slate-400 text-xs font-bold">
                  <Loader2 size={16} className="animate-spin text-[#3d3f96]" /> Loading Saved Addresses...
                </div>
              ) : addresses.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs font-bold">
                  No saved addresses found. Please add an address to proceed.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr._id;
                    return (
                      <div
                        key={addr._id}
                        onClick={() => setSelectedAddressId(addr._id)}
                        className={`p-4 rounded-2xl border transition cursor-pointer flex items-start justify-between gap-3 ${isSelected
                            ? 'border-[#3d3f96] bg-indigo-50/30 ring-2 ring-[#3d3f96]/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="p-2 rounded-xl bg-slate-100 text-slate-600 shrink-0 mt-0.5">
                            {addr.addressType === 'Home' ? <Home size={14} /> : <Briefcase size={14} />}
                          </div>
                          <div className="text-xs">
                            <div className="flex items-center gap-1.5">
                              <strong className="text-slate-900 font-extrabold">{addr.name}</strong>
                              <span className="text-[9px] font-bold uppercase text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                {addr.addressType || 'Home'}
                              </span>
                            </div>
                            <p className="text-slate-500 font-medium text-[11px] mt-1 line-clamp-2">
                              {[addr.houseNo, addr.sector, addr.city, addr.pincode].filter(Boolean).join(", ")}
                            </p>
                            <span className="text-[10px] text-slate-400 font-bold block mt-1">
                              Phone: {addr.phone}
                            </span>
                          </div>
                        </div>

                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${isSelected ? 'border-[#3d3f96] bg-[#3d3f96] text-white' : 'border-slate-300'
                          }`}>
                          {isSelected && <Check size={10} strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SECTION 4: SELECT FULFILLING PHARMACY */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Store size={16} className="text-[#3d3f96]" />
                4. Select Fulfilling Pharmacy Store
              </h2>

              {loadingPharmacies ? (
                <div className="py-6 flex items-center justify-center gap-2 text-slate-400 text-xs font-bold">
                  <Loader2 size={16} className="animate-spin text-[#3d3f96]" /> Loading Licensed Pharmacies...
                </div>
              ) : (
                <div className="space-y-2.5">
                  {pharmacies.map((store) => {
                    const isSelected = selectedPharmacyId === store._id;
                    return (
                      <div
                        key={store._id}
                        onClick={() => setSelectedPharmacyId(store._id)}
                        className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${isSelected
                            ? 'border-[#3d3f96] bg-indigo-50/30 ring-2 ring-[#3d3f96]/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#3d3f96] flex items-center justify-center shrink-0 font-bold">
                            <Store size={18} />
                          </div>
                          <div className="text-xs">
                            <div className="flex items-center gap-2">
                              <strong className="text-slate-900 font-extrabold">{store.name}</strong>
                              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                {store.openStatus || 'Open'}
                              </span>
                            </div>
                            <p className="text-slate-500 font-medium text-[11px] mt-0.5">
                              {store.address || `${store.city}, ${store.state}`}
                            </p>
                            <div className="flex items-center gap-2.5 text-[10px] font-bold text-slate-400 mt-1">
                              <span className="flex items-center gap-0.5 text-amber-500 font-black">
                                <Star size={11} className="fill-amber-500" /> {store.rating || 4.8}
                              </span>
                              <span>•</span>
                              <span>{store.distance || '2.5'} km away</span>
                              <span>•</span>
                              <span className="text-indigo-600 flex items-center gap-0.5">
                                <Truck size={10} /> Home Delivery
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-[#3d3f96] bg-[#3d3f96] text-white' : 'border-slate-300'
                          }`}>
                          {isSelected && <Check size={10} strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: STICKY LIVE SUMMARY & ACTION               */}
          {/* ========================================================= */}
          <div className="lg:sticky lg:top-6 space-y-5">

            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider border-b border-slate-100 pb-3">
                Prescription Request Summary
              </h3>

              {/* Rx Preview Thumbnail */}
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Rx"
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-[#3d3f96] flex items-center justify-center font-bold">
                    <FileText size={20} />
                  </div>
                )}
                <div className="text-xs min-w-0">
                  <p className="font-black text-slate-800 truncate">{doctorName || "Prescription Attached"}</p>
                  <p className="text-[10px] text-slate-400 font-semibold">{prescriptionDate}</p>
                  <span className="text-[9px] font-bold text-[#3d3f96] uppercase">{durationType}</span>
                </div>
              </div>

              {/* Summary Checklist */}
              <div className="space-y-2.5 text-xs font-bold divide-y divide-slate-100">
                <div className="flex justify-between items-center text-slate-600 pt-1">
                  <span className="text-slate-400">Medicines Selected</span>
                  <span className="text-slate-900">{confirmedCount} Item(s)</span>
                </div>

                <div className="flex justify-between items-center text-slate-600 pt-2.5">
                  <span className="text-slate-400">Selected Store</span>
                  <span className="text-slate-900 truncate max-w-[150px]">{selectedPharmacy?.name || "Not selected"}</span>
                </div>

                <div className="flex justify-between items-center text-slate-600 pt-2.5">
                  <span className="text-slate-400">Deliver To</span>
                  <span className="text-slate-900 truncate max-w-[150px]">{selectedAddress?.city || "Select Address"}</span>
                </div>

                {/* Dynamic Price Estimate */}
                <div className="flex justify-between items-center pt-3 text-slate-900">
                  <span className="font-black text-xs uppercase text-slate-500">Est. Total</span>
                  <span className="text-base font-black font-mono text-[#3d3f96]">
                    {estimatingPrice ? "Calculating..." : estimate ? `₹${estimate.estimatedTotal}` : "Pending Verification"}
                  </span>
                </div>
              </div>

              {/* Workflow Assurance Note */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-[11px] text-slate-500 leading-relaxed font-medium">
                <strong>Next Step:</strong> The pharmacist reviews your prescription and issues a certified quotation. You will confirm and complete payment on the next screen.
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="button"
                disabled={submitting || !file || confirmedCount === 0 || !selectedAddressId || !selectedPharmacyId}
                onClick={handleSubmit}
                className="w-full py-4 bg-[#3d3f96] hover:bg-[#2e3077] disabled:opacity-50 text-white rounded-2xl font-black text-xs transition shadow-md shadow-indigo-100 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Prescription Request</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}