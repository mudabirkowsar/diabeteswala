// "use client";

// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import {
//     Ambulance,
//     ArrowLeft,
//     MapPin,
//     Phone,
//     User,
//     ShieldCheck,
//     HeartPulse,
//     Clock,
//     Calendar,
//     IndianRupee,
//     CheckCircle2,
//     AlertTriangle,
//     Building2,
//     LocateFixed,
//     Send,
//     Loader2,
//     Sparkles
// } from 'lucide-react';
// import { toast, Toaster } from 'react-hot-toast';

// export default function BookAmbulancePage() {
//     const router = useRouter();

//     // Booking details from previous page
//     const [bookingData, setBookingData] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [submitting, setSubmitting] = useState(false);
//     const [locating, setLocating] = useState(false);

//     // Form Fields
//     const [patientName, setPatientName] = useState('');
//     const [patientAge, setPatientAge] = useState('');
//     const [patientGender, setPatientGender] = useState('Male');
//     const [contactPhone, setContactPhone] = useState('');
//     const [pickupAddress, setPickupAddress] = useState('');
//     const [destinationHospital, setDestinationHospital] = useState('');
//     const [emergencyReason, setEmergencyReason] = useState('Diabetic Emergency / Hypoglycemia');
//     const [notes, setNotes] = useState('');

//     useEffect(() => {
//         if (typeof window !== "undefined") {
//             const stored = localStorage.getItem("pendingAmbulanceBooking");
//             if (stored) {
//                 try {
//                     const parsed = JSON.parse(stored);
//                     setBookingData(parsed);
//                 } catch (e) {
//                     console.error("Error reading booking session:", e);
//                 }
//             }
//             setLoading(false);
//         }
//     }, []);

//     // Quick GPS Auto-fill
//     const handleAutoGPS = () => {
//         setLocating(true);
//         setTimeout(() => {
//             setPickupAddress("Sector 62, Phase 8, Industrial Area, Mohali (GPS Detected)");
//             setLocating(false);
//             toast.success("Current location captured!");
//         }, 900);
//     };

//     // Final Dispatch Submission
//     const handleConfirmDispatch = (e) => {
//         e.preventDefault();

//         if (!patientName.trim() || !contactPhone.trim() || !pickupAddress.trim()) {
//             toast.error("Please fill in the Patient Name, Phone Number, and Pickup Location.");
//             return;
//         }

//         setSubmitting(true);

//         // Simulate API Dispatch Request
//         setTimeout(() => {
//             setSubmitting(false);
//             toast.success("Emergency Dispatch Confirmed! The pilot has received your route.");
//             // Clear session
//             localStorage.removeItem("pendingAmbulanceBooking");
//             // Redirect or show track screen
//             setTimeout(() => {
//                 router.push('/');
//             }, 2000);
//         }, 1500);
//     };

//     if (loading) {
//         return (
//             <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
//                 <Loader2 className="animate-spin text-red-600" size={36} />
//             </div>
//         );
//     }

//     if (!bookingData) {
//         return (
//             <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
//                 <Toaster position="top-right" />
//                 <AlertTriangle size={52} className="text-amber-500 mb-3" />
//                 <h2 className="text-xl font-black text-slate-800">No Active Booking Found</h2>
//                 <p className="text-xs text-slate-500 mt-1 max-w-sm">
//                     Please select an ambulance from the fleet before proceeding to the checkout and patient details.
//                 </p>
//                 <button
//                     onClick={() => router.back()}
//                     className="mt-6 px-6 py-2.5 bg-slate-900 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
//                 >
//                     Return to Fleet
//                 </button>
//             </div>
//         );
//     }

//     const { ambulance, selectedRideType, selectedFacilities = [], baseFare, addonsFare, totalFare } = bookingData;

//     return (
//         <div className="min-h-screen bg-slate-50/70 text-slate-800 py-8 px-4 sm:px-6 lg:px-8 text-left antialiased">
//             <Toaster position="top-right" />

//             <div className="max-w-5xl mx-auto space-y-6">

//                 {/* --- Top Header Navigation --- */}
//                 <div className="flex items-center justify-between">
//                     <button
//                         onClick={() => router.back()}
//                         className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-600 hover:text-slate-900 bg-white px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-xs transition cursor-pointer"
//                     >
//                         <ArrowLeft size={16} />
//                         <span>Modify Selection</span>
//                     </button>

//                     <span className="text-[11px] font-black uppercase px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full flex items-center gap-1.5">
//                         <span className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
//                         Step 2: Dispatch Verification
//                     </span>
//                 </div>

//                 {/* --- Main 2-Column Grid --- */}
//                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

//                     {/* LEFT 7 COLS: PATIENT & EMERGENCY DISPATCH FORM */}
//                     <div className="lg:col-span-7 space-y-6">
//                         <form onSubmit={handleConfirmDispatch} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">

//                             <div>
//                                 <span className="text-[10px] font-black uppercase tracking-widest text-red-600 block">Emergency Info</span>
//                                 <h2 className="text-xl sm:text-2xl font-black text-slate-900">Patient & Location Details</h2>
//                             </div>

//                             {/* Patient Basic Info */}
//                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                                 <div className="space-y-1.5">
//                                     <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Patient Full Name *</label>
//                                     <input
//                                         type="text"
//                                         required
//                                         value={patientName}
//                                         onChange={(e) => setPatientName(e.target.value)}
//                                         placeholder="Enter patient full name"
//                                         className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition"
//                                     />
//                                 </div>

//                                 <div className="grid grid-cols-2 gap-2">
//                                     <div className="space-y-1.5">
//                                         <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Age *</label>
//                                         <input
//                                             type="number"
//                                             required
//                                             value={patientAge}
//                                             onChange={(e) => setPatientAge(e.target.value)}
//                                             placeholder="e.g. 54"
//                                             className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition"
//                                         />
//                                     </div>

//                                     <div className="space-y-1.5">
//                                         <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Gender</label>
//                                         <select
//                                             value={patientGender}
//                                             onChange={(e) => setPatientGender(e.target.value)}
//                                             className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition"
//                                         >
//                                             <option value="Male">Male</option>
//                                             <option value="Female">Female</option>
//                                             <option value="Other">Other</option>
//                                         </select>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Emergency Contact Phone */}
//                             <div className="space-y-1.5">
//                                 <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Caller / Relative Phone Number *</label>
//                                 <div className="relative">
//                                     <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
//                                         <Phone size={16} />
//                                     </div>
//                                     <input
//                                         type="tel"
//                                         required
//                                         value={contactPhone}
//                                         onChange={(e) => setContactPhone(e.target.value)}
//                                         placeholder="Enter 10-digit mobile number for driver GPS link"
//                                         className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition"
//                                     />
//                                 </div>
//                             </div>

//                             {/* Pickup Address with GPS Button */}
//                             <div className="space-y-1.5">
//                                 <div className="flex items-center justify-between">
//                                     <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Pickup Address *</label>
//                                     <button
//                                         type="button"
//                                         onClick={handleAutoGPS}
//                                         disabled={locating}
//                                         className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
//                                     >
//                                         <LocateFixed size={13} className={locating ? "animate-spin" : ""} />
//                                         {locating ? "Detecting..." : "Use Current GPS"}
//                                     </button>
//                                 </div>
//                                 <div className="relative">
//                                     <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-red-500">
//                                         <MapPin size={18} />
//                                     </div>
//                                     <textarea
//                                         rows={2}
//                                         required
//                                         value={pickupAddress}
//                                         onChange={(e) => setPickupAddress(e.target.value)}
//                                         placeholder="House / Flat No., Landmark, Street Address"
//                                         className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition"
//                                     />
//                                 </div>
//                             </div>

//                             {/* Destination Hospital */}
//                             <div className="space-y-1.5">
//                                 <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Destination Hospital (Optional)</label>
//                                 <div className="relative">
//                                     <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
//                                         <Building2 size={18} />
//                                     </div>
//                                     <input
//                                         type="text"
//                                         value={destinationHospital}
//                                         onChange={(e) => setDestinationHospital(e.target.value)}
//                                         placeholder="Nearest Emergency Hospital (or enter preferred hospital)"
//                                         className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition"
//                                     />
//                                 </div>
//                             </div>

//                             {/* Emergency Condition Selection */}
//                             <div className="space-y-1.5">
//                                 <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Clinical Condition / Symptoms</label>
//                                 <select
//                                     value={emergencyReason}
//                                     onChange={(e) => setEmergencyReason(e.target.value)}
//                                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition"
//                                 >
//                                     <option value="Diabetic Emergency / Hypoglycemia">Diabetic Emergency / Hypoglycemia (Severe Low Sugar)</option>
//                                     <option value="Diabetic Ketoacidosis (DKA)">Diabetic Ketoacidosis (DKA - High Sugar Crisis)</option>
//                                     <option value="Cardiac & Chest Pain">Cardiac & Severe Chest Pain</option>
//                                     <option value="Unconscious / Stroke Symptoms">Unconscious / Altered Sensorium / Stroke</option>
//                                     <option value="General Planned Hospital Transfer">General Non-Emergency Hospital Transfer</option>
//                                 </select>
//                             </div>

//                             {/* Dispatch Action */}
//                             <button
//                                 type="submit"
//                                 disabled={submitting}
//                                 className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-500/25 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2 mt-4"
//                             >
//                                 {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
//                                 <span>{submitting ? "Initiating Emergency Dispatch..." : "Confirm & Dispatch Ambulance Now"}</span>
//                             </button>

//                         </form>
//                     </div>

//                     {/* RIGHT 5 COLS: REVIEW OF SELECTIONS MADE IN PREVIOUS PAGE */}
//                     <div className="lg:col-span-5 space-y-6">

//                         {/* Vehicle & Pilot Summary Card */}
//                         <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
//                             <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block border-b border-slate-100 pb-2">
//                                 Selected Unit Details
//                             </span>

//                             <div className="flex items-center gap-3.5">
//                                 <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-200 shrink-0">
//                                     <Ambulance size={24} />
//                                 </div>
//                                 <div>
//                                     <h3 className="text-lg font-black text-slate-900">{ambulance.vehicleNumber}</h3>
//                                     <div className="flex items-center gap-2">
//                                         <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded">
//                                             {ambulance.vehicleType}
//                                         </span>
//                                         <span className="text-xs text-slate-500 font-medium">({selectedRideType === 'single' ? 'One-Way' : 'Round Trip'})</span>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Pilot Contact Details */}
//                             <div className="p-3.5 bg-slate-50 rounded-2xl text-xs space-y-1">
//                                 <p className="font-bold text-slate-800 flex items-center justify-between">
//                                     <span>Assigned Pilot:</span>
//                                     <strong className="text-slate-900">{ambulance.driverName}</strong>
//                                 </p>
//                                 <p className="text-slate-500 flex items-center justify-between">
//                                     <span>Phone Number:</span>
//                                     <strong className="text-slate-700">{ambulance.phone}</strong>
//                                 </p>
//                                 {ambulance.clinic && (
//                                     <p className="text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200/60">
//                                         <span>Base Hub:</span>
//                                         <strong className="text-indigo-600">{ambulance.clinic.name}</strong>
//                                     </p>
//                                 )}
//                             </div>
//                         </div>

//                         {/* Selected Add-On Staff Card */}
//                         <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
//                             <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block border-b border-slate-100 pb-2">
//                                 Selected Support Staff & Equipment
//                             </span>

//                             {selectedFacilities.length === 0 ? (
//                                 <p className="text-xs text-slate-400 italic py-1">No additional medical staff selected.</p>
//                             ) : (
//                                 <div className="space-y-2">
//                                     {selectedFacilities.map((item) => (
//                                         <div key={item._id} className="flex items-center justify-between p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900">
//                                             <span className="flex items-center gap-2">
//                                                 <CheckCircle2 size={14} className="text-emerald-600" />
//                                                 {item.name}
//                                             </span>
//                                             <span>+₹{item.price}</span>
//                                         </div>
//                                     ))}
//                                 </div>
//                             )}
//                         </div>

//                         {/* Final Price Ledger */}
//                         <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xl shadow-slate-100 space-y-4">
//                             <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block border-b border-slate-100 pb-2">
//                                 Payment & Fare Ledger
//                             </span>

//                             <div className="space-y-2 text-xs font-bold">
//                                 <div className="flex items-center justify-between text-slate-600">
//                                     <span>Base Ride Fare:</span>
//                                     <span className="font-black text-slate-900">₹{baseFare}</span>
//                                 </div>

//                                 <div className="flex items-center justify-between text-slate-600">
//                                     <span>Medical Add-ons Total:</span>
//                                     <span className="font-black text-emerald-700">+₹{addonsFare}</span>
//                                 </div>

//                                 <div className="flex items-center justify-between text-slate-500 text-[11px]">
//                                     <span>Included Base Distance:</span>
//                                     <span>{ambulance.pricing?.baseDistance || 5} km</span>
//                                 </div>
//                             </div>

//                             <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between">
//                                 <div>
//                                     <span className="text-xs font-black uppercase tracking-wider text-slate-500 block">Total Fare</span>
//                                     <span className="text-[10px] text-emerald-600 font-bold">No Advance Payment Needed</span>
//                                 </div>
//                                 <div className="text-3xl font-black text-slate-900">
//                                     ₹{totalFare}
//                                 </div>
//                             </div>
//                         </div>

//                     </div>

//                 </div>

//             </div>
//         </div>
//     );
// }