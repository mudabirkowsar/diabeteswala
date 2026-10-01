// "use client";

// import React, { useState, useEffect, useCallback } from 'react';
// import { useParams, useRouter, useSearchParams } from 'next/navigation';
// import Image from 'next/image';
// import { 
//   Ambulance, 
//   Clock, 
//   MapPin, 
//   Phone, 
//   Mail, 
//   ShieldCheck, 
//   ArrowLeft, 
//   HeartPulse, 
//   Stethoscope, 
//   User, 
//   Check, 
//   AlertCircle, 
//   Star, 
//   CheckCircle2, 
//   IndianRupee, 
//   Loader2, 
//   Navigation, 
//   Building2, 
//   Share2,
//   Sparkles,
//   Award,
//   CalendarDays,
//   Plus
// } from 'lucide-react';
// import { toast, Toaster } from 'react-hot-toast';

// // Import UserAPI service
// import UserAPI from '../../../../services/UserAPI';

// // Helper function to read coordinates from localStorage
// const getInitialCoords = () => {
//     let lat;
//     let lng;

//     if (typeof window !== "undefined") {
//         const savedCoords = localStorage.getItem("userCoords");
//         if (savedCoords) {
//             try {
//                 const parsed = JSON.parse(savedCoords);
//                 if (parsed.lat !== undefined && parsed.lng !== undefined) {
//                     lat = Number(parsed.lat);
//                     lng = Number(parsed.lng);
//                 }
//             } catch (e) {
//                 console.error("Error reading stored user coordinates:", e);
//             }
//         }
//     }
//     return { lat, lng };
// };

// export default function AmbulanceDetailPage() {
//   const params = useParams();
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const ambulanceId = params?.id;

//   const queryLat = searchParams?.get('lat');
//   const queryLng = searchParams?.get('lng');

//   // State Management
//   const [ambulance, setAmbulance] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [selectedRideType, setSelectedRideType] = useState('single'); // 'single' | 'double'
//   const [selectedStaffIds, setSelectedStaffIds] = useState([]); // Array of facility _id's
//   const [bookingProcessing, setBookingProcessing] = useState(false);

//   // Fetch Ambulance Details
//   const fetchDetails = useCallback(async () => {
//     if (!ambulanceId) return;
//     setLoading(true);
//     try {
//       const saved = getInitialCoords();
//       const resolvedLat = queryLat ? parseFloat(queryLat) : (saved.lat || 30.7046);
//       const resolvedLng = queryLng ? parseFloat(queryLng) : (saved.lng || 76.7179);

//       const geoParams = {
//         lat: resolvedLat,
//         lng: resolvedLng
//       };

//       const response = await UserAPI.getAmbulanceDetails(ambulanceId, geoParams);
//       if (response && response.success) {
//         setAmbulance(response.data);
//       } else {
//         toast.error('Failed to load ambulance specifications.');
//       }
//     } catch (err) {
//       console.error('Error fetching ambulance details:', err);
//       toast.error(err.response?.data?.message || 'Ambulance record not found.');
//     } finally {
//       setLoading(false);
//     }
//   }, [ambulanceId, queryLat, queryLng]);

//   useEffect(() => {
//     fetchDetails();
//   }, [fetchDetails]);

//   // Toggle dynamic staff facilities
//   const toggleStaffFacility = (facilityId) => {
//     setSelectedStaffIds((prev) => 
//       prev.includes(facilityId)
//         ? prev.filter((id) => id !== facilityId)
//         : [...prev, facilityId]
//     );
//   };

//   // Dynamic Fare Calculation
//   const calculateTotalFare = () => {
//     if (!ambulance) return 0;
//     const baseFare = selectedRideType === 'single'
//       ? (ambulance.pricing?.singleRidePrice || 0)
//       : (ambulance.pricing?.doubleRidePrice || 0);

//     const addonsTotal = (ambulance.supportStaff || [])
//       .filter(item => item.available && selectedStaffIds.includes(item._id))
//       .reduce((sum, item) => sum + (item.price || 0), 0);

//     return baseFare + addonsTotal;
//   };

//   // Navigate to bookambulance page with payload
//   const handleProceedToBooking = () => {
//     if (!ambulance) return;

//     setBookingProcessing(true);

//     const selectedFacilities = (ambulance.supportStaff || []).filter(
//       item => item.available && selectedStaffIds.includes(item._id)
//     );

//     const baseFare = selectedRideType === 'single' 
//       ? ambulance.pricing?.singleRidePrice 
//       : ambulance.pricing?.doubleRidePrice;

//     const addonsFare = selectedFacilities.reduce((sum, item) => sum + (item.price || 0), 0);
//     const totalFare = baseFare + addonsFare;

//     const bookingPayload = {
//       ambulanceId: ambulance._id,
//       ambulance: {
//         _id: ambulance._id,
//         vehicleNumber: ambulance.vehicleNumber,
//         vehicleType: ambulance.vehicleType,
//         providerType: ambulance.providerType,
//         driverName: ambulance.driverName,
//         phone: ambulance.phone,
//         email: ambulance.email,
//         bloodGroup: ambulance.bloodGroup,
//         city: ambulance.city,
//         state: ambulance.state,
//         address: ambulance.address,
//         clinic: ambulance.clinic,
//         distanceText: ambulance.distanceText,
//         pricing: ambulance.pricing
//       },
//       selectedRideType,
//       selectedFacilities,
//       baseFare,
//       addonsFare,
//       totalFare,
//       createdAt: new Date().toISOString()
//     };

//     // Save configuration in localStorage
//     if (typeof window !== "undefined") {
//       localStorage.setItem("pendingAmbulanceBooking", JSON.stringify(bookingPayload));
//     }

//     setTimeout(() => {
//       setBookingProcessing(false);
//       router.push('/ambulance/bookambulance');
//     }, 400);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 space-y-4">
//         <Toaster position="top-right" />
//         <Loader2 className="animate-spin text-red-600" size={42} />
//         <p className="text-xs font-black uppercase tracking-widest text-slate-500">
//           Loading vehicle specifications & emergency facilities...
//         </p>
//       </div>
//     );
//   }

//   if (!ambulance) {
//     return (
//       <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
//         <Toaster position="top-right" />
//         <AlertCircle size={52} className="text-rose-400 mb-3" />
//         <h2 className="text-xl font-black text-slate-800">Ambulance Not Available</h2>
//         <p className="text-xs text-slate-500 mt-1 max-w-sm">
//           The requested emergency unit might have been reassigned or is currently offline.
//         </p>
//         <button
//           onClick={() => router.back()}
//           className="mt-6 px-6 py-2.5 bg-slate-900 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer hover:bg-slate-800"
//         >
//           Go Back
//         </button>
//       </div>
//     );
//   }

//   const { pricing = {}, supportStaff = [], clinic } = ambulance;

//   return (
//     <div className="min-h-screen bg-slate-50/70 text-slate-800 py-8 px-4 sm:px-6 lg:px-8 text-left antialiased">
//       <Toaster position="top-right" />
//       <div className="max-w-6xl mx-auto space-y-6">

//         {/* --- Top Navigation Bar --- */}
//         <div className="flex items-center justify-between">
//           <button
//             onClick={() => router.back()}
//             className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-600 hover:text-slate-900 bg-white px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-xs transition cursor-pointer"
//           >
//             <ArrowLeft size={16} />
//             <span>Back to Fleet</span>
//           </button>

//           <div className="flex items-center gap-2">
//             <span className="text-[11px] font-black uppercase px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1.5">
//               <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
//               Active Dispatch Unit
//             </span>
//             {ambulance.rating && (
//               <span className="text-[11px] font-black uppercase px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full flex items-center gap-1">
//                 <Star size={12} className="fill-amber-400 text-amber-400" />
//                 {ambulance.rating} ({ambulance.totalReviews || 0})
//               </span>
//             )}
//           </div>
//         </div>

//         {/* --- Main Content Grid --- */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

//           {/* Left 2 Cols: Unit Details, Clinic, Staff */}
//           <div className="lg:col-span-2 space-y-6">
            
//             {/* Header / Main Unit Card */}
//             <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
//               <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
//                 <div className="flex items-center gap-4">
//                   <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center border border-red-200 shrink-0">
//                     <Ambulance size={32} />
//                   </div>
//                   <div>
//                     <div className="flex items-center gap-2 flex-wrap">
//                       <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
//                         {ambulance.vehicleNumber || 'Emergency Unit'}
//                       </h1>
//                       <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-md bg-red-100/80 text-red-700 border border-red-200">
//                         {ambulance.vehicleType || 'ICU Ambulance'}
//                       </span>
//                     </div>
//                     <p className="text-xs text-slate-400 font-bold mt-1">
//                       Provider: <strong className="text-slate-700">{ambulance.providerType || 'Clinic Ambulance'}</strong>
//                     </p>
//                   </div>
//                 </div>

//                 <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-2xl flex items-center gap-2 shrink-0 self-start">
//                   <MapPin size={16} className="text-red-500" />
//                   <div>
//                     <span className="text-[9px] font-black uppercase block tracking-wider text-red-500">Live Distance</span>
//                     <strong className="text-xs font-black">{ambulance.distanceText || 'Nearby'}</strong>
//                   </div>
//                 </div>
//               </div>

//               {/* Spec Pills */}
//               <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
//                 <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
//                   <span className="text-[10px] font-bold text-slate-400 block uppercase">Base Hub</span>
//                   <strong className="text-xs font-black text-slate-800">{ambulance.city || 'Mohali'}</strong>
//                 </div>
//                 <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
//                   <span className="text-[10px] font-bold text-slate-400 block uppercase">Pilot Blood Group</span>
//                   <strong className="text-xs font-black text-rose-600">{ambulance.bloodGroup || 'N/A'}</strong>
//                 </div>
//                 <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
//                   <span className="text-[10px] font-bold text-slate-400 block uppercase">Experience</span>
//                   <strong className="text-xs font-black text-slate-800">{ambulance.experienceYears || '0'} Years</strong>
//                 </div>
//                 <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
//                   <span className="text-[10px] font-bold text-slate-400 block uppercase">Service Radius</span>
//                   <strong className="text-xs font-black text-slate-800">{ambulance.serviceRadius || '15 km'}</strong>
//                 </div>
//               </div>
//             </div>

//             {/* Clinic & Base Station Card */}
//             {clinic && (
//               <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
//                 <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
//                   <Building2 size={16} className="text-blue-600" /> Affiliated Medical Base / Clinic
//                 </h3>
//                 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//                   <div className="space-y-1">
//                     <h4 className="text-base font-black text-slate-900">{clinic.name}</h4>
//                     <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
//                       <MapPin size={13} className="text-slate-400" /> {clinic.address}, {clinic.city}
//                     </p>
//                   </div>
//                   <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-xl border border-blue-200">
//                     Verified Emergency Station
//                   </span>
//                 </div>
//               </div>
//             )}

//             {/* Pilot / Driver Contact Card */}
//             <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
//               <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
//                 <User size={15} className="text-indigo-600" /> Pilot & Operational Contact
//               </h3>

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
//                 <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100 space-y-1">
//                   <span className="text-[10px] font-black uppercase text-indigo-600 block">Lead Pilot</span>
//                   <h4 className="text-base font-black text-slate-900">{ambulance.driverName}</h4>
//                   <p className="text-slate-600 font-bold flex items-center gap-1.5 pt-1">
//                     <Phone size={13} className="text-indigo-500" /> {ambulance.phone}
//                   </p>
//                   <p className="text-slate-500 font-medium flex items-center gap-1.5 truncate">
//                     <Mail size={13} className="text-indigo-500" /> {ambulance.email}
//                   </p>
//                 </div>

//                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
//                   <span className="text-[10px] font-black uppercase text-slate-500 block">Operational Address</span>
//                   <h4 className="text-sm font-black text-slate-800">{ambulance.address}, {ambulance.city}</h4>
//                   <p className="text-slate-500 font-medium">
//                     {ambulance.state}, {ambulance.country}
//                   </p>
//                   <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 pt-1">
//                     <CheckCircle2 size={13} /> Ready for Dispatch
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* Dynamic Support Staff & Medical Facility Add-Ons */}
//             <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
//               <div className="flex items-center justify-between border-b border-slate-100 pb-3">
//                 <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
//                   <HeartPulse size={15} className="text-emerald-600" /> Available Support Staff & Add-On Facilities
//                 </h3>
//                 <span className="text-[10px] text-slate-400 font-bold">Select to attach with dispatch</span>
//               </div>

//               {supportStaff.length === 0 ? (
//                 <p className="text-xs text-slate-400 italic">No additional staff or facility add-ons available for this vehicle.</p>
//               ) : (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
//                   {supportStaff.map((staff) => {
//                     const isSelected = selectedStaffIds.includes(staff._id);
//                     return (
//                       <div 
//                         key={staff._id}
//                         onClick={() => staff.available && toggleStaffFacility(staff._id)}
//                         className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between ${
//                           !staff.available 
//                             ? 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed'
//                             : isSelected
//                               ? 'bg-emerald-50/60 border-emerald-500 shadow-xs'
//                               : 'bg-white border-slate-200 hover:border-emerald-300'
//                         }`}
//                       >
//                         <div className="space-y-1 pr-2">
//                           <div className="flex items-center gap-2">
//                             <Stethoscope size={16} className={staff.available ? "text-emerald-600" : "text-slate-400"} />
//                             <strong className="text-xs font-black text-slate-900">{staff.name}</strong>
//                           </div>
//                           <p className="text-[11px] text-slate-500 font-medium">
//                             {staff.available ? `+₹${staff.price} add-on charge` : 'Currently Unavailable'}
//                           </p>
//                         </div>

//                         {staff.available && (
//                           <div className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
//                             isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-slate-50'
//                           }`}>
//                             {isSelected && <Check size={14} strokeWidth={3} />}
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>

//           </div>

//           {/* Right 1 Col: Dynamic Booking Summary & Fare Calculator */}
//           <div className="space-y-6">
//             <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xl shadow-slate-100 space-y-6 sticky top-6">
              
//               <div>
//                 <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Fare Calculation</span>
//                 <h3 className="text-xl font-black text-slate-900 mt-0.5">Booking Summary</h3>
//               </div>

//               {/* Ride Type Switcher */}
//               <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl">
//                 <button
//                   type="button"
//                   onClick={() => setSelectedRideType('single')}
//                   className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
//                     selectedRideType === 'single'
//                       ? 'bg-white text-slate-900 shadow-xs'
//                       : 'text-slate-500 hover:text-slate-900'
//                   }`}
//                 >
//                   1-Way Ride
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setSelectedRideType('double')}
//                   className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
//                     selectedRideType === 'double'
//                       ? 'bg-white text-slate-900 shadow-xs'
//                       : 'text-slate-500 hover:text-slate-900'
//                   }`}
//                 >
//                   Round Trip
//                 </button>
//               </div>

//               {/* Price Calculation Breakdown */}
//               <div className="space-y-2.5 text-xs font-bold border-t border-b border-slate-100 py-4">
//                 <div className="flex items-center justify-between text-slate-600">
//                   <span>Base Fare ({selectedRideType === 'single' ? 'One-Way' : 'Round-Trip'}):</span>
//                   <span className="font-black text-slate-900">
//                     ₹{selectedRideType === 'single' ? (pricing.singleRidePrice || 0) : (pricing.doubleRidePrice || 0)}
//                   </span>
//                 </div>

//                 <div className="flex items-center justify-between text-slate-500 text-[11px]">
//                   <span>Included Base Distance:</span>
//                   <span>{pricing.baseDistance || 5} km</span>
//                 </div>

//                 <div className="flex items-center justify-between text-slate-500 text-[11px]">
//                   <span>After Base Distance Rate:</span>
//                   <span>₹{pricing.pricePerKM || 10}/km</span>
//                 </div>

//                 {/* Selected Add-ons List */}
//                 {supportStaff
//                   .filter(item => item.available && selectedStaffIds.includes(item._id))
//                   .map((item) => (
//                     <div key={item._id} className="flex items-center justify-between text-emerald-700 text-xs">
//                       <span>+ {item.name}:</span>
//                       <span className="font-black">+₹{item.price}</span>
//                     </div>
//                   ))}
//               </div>

//               {/* Total Estimated Cost */}
//               <div>
//                 <div className="flex items-baseline justify-between mb-1">
//                   <span className="text-xs font-black uppercase tracking-wider text-slate-500">Estimated Total</span>
//                   <div className="text-2xl font-black text-slate-900">
//                     ₹{calculateTotalFare()}
//                   </div>
//                 </div>
//                 <p className="text-[10px] text-slate-400 font-medium">
//                   *Final fare may include extra km (₹{pricing.pricePerKM || 10}/km) & government road tolls.
//                 </p>
//               </div>

//               {/* Action Buttons */}
//               <div className="space-y-3 pt-2">
//                 <button
//                   type="button"
//                   disabled={bookingProcessing}
//                   onClick={handleProceedToBooking}
//                   className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-500/25 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
//                 >
//                   {bookingProcessing ? (
//                     <Loader2 size={16} className="animate-spin" />
//                   ) : (
//                     <Ambulance size={16} />
//                   )}
//                   <span>{bookingProcessing ? 'Preparing Booking...' : 'Proceed to Patient Details'}</span>
//                 </button>

//                 <a
//                   href={`tel:${ambulance.phone}`}
//                   className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
//                 >
//                   <Phone size={14} className="text-slate-600" />
//                   <span>Call Pilot: {ambulance.phone}</span>
//                 </a>
//               </div>

//             </div>
//           </div>

//         </div>

//       </div>
//     </div>
//   );
// }