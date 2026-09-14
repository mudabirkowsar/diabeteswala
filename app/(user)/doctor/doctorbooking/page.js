'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ChevronLeft, 
  Video, 
  MapPin, 
  Home, 
  ShieldCheck, 
  Loader2, 
  CheckCircle2, 
  LockKeyhole, 
  Building2,
  Calendar,
  Clock,
  ArrowRight,
  Navigation,
  Phone,
  User,
  Users
} from 'lucide-react';
import UserAPI from '../../../services/UserAPI';
import DoctorSlotPicker from './components/DoctorSlotPicker';
import ChooseAddress from './components/ChooseAddress';
import ChooseFamilyMember from './components/ChooseFamilyMember';

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const doctorIdParam = searchParams.get('doctorId');
  const initialType = searchParams.get('consultationType') || 'Clinic Visit';
  const initialFee = Number(searchParams.get('fee')) || 0;

  const [bookingData, setBookingData] = useState(null);
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedFee, setSelectedFee] = useState(initialFee);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedMember, setSelectedMember] = useState({
    _id: 'self',
    memberName: 'Myself (Primary Account)',
    relation: 'SELF'
  });

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Retrieve details from localStorage or fallback API fetch
  useEffect(() => {
    const loadBookingContext = async () => {
      setLoading(true);
      try {
        let stored = null;
        if (typeof window !== 'undefined') {
          const cached = localStorage.getItem('pendingDoctorBooking');
          if (cached) {
            stored = JSON.parse(cached);
          }
        }

        if (stored && (!doctorIdParam || stored.doctorId === doctorIdParam)) {
          setBookingData(stored);
          setSelectedType(stored.consultationType || initialType);
          setSelectedFee(stored.fee !== undefined ? stored.fee : initialFee);
        } else if (doctorIdParam) {
          const res = await UserAPI.getIndependentDoctorDetails(doctorIdParam);
          if (res && res.success && res.data) {
            const { profile, activeServices = [] } = res.data;
            const currentService = activeServices.find(s => s.type === initialType) || activeServices[0];
            const dataObj = {
              doctorId: profile._id,
              doctorName: profile.name,
              doctorSpeciality: profile.speciality,
              doctorQualification: profile.qualification,
              doctorImage: profile.profileImage,
              consultationType: currentService?.type || initialType,
              fee: currentService?.fee !== undefined ? currentService.fee : initialFee,
              slotDuration: profile.slotDuration || 30,
              clinicDetails: profile.clinicId,
              address: profile.address || profile.clinicId?.address || profile.city
            };
            setBookingData(dataObj);
            setSelectedType(dataObj.consultationType);
            setSelectedFee(dataObj.fee);
          }
        }
      } catch (err) {
        console.error('Error loading booking context:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBookingContext();
  }, [doctorIdParam, initialType, initialFee]);

  const getImageSrc = (imgPath) => {
    if (!imgPath) return 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop';
    if (imgPath.startsWith('http')) return imgPath;
    return `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}${imgPath}`;
  };

  // Calculate dynamic total including slot premium fees
  const totalAmountPayable = selectedFee + (selectedSlot?.premiumFee || 0);

  const handleSlotSelect = (slotData) => {
    setSelectedSlot(slotData);
  };

  const handleAddressSelect = (addr) => {
    setSelectedAddress(addr);
  };

  const handleMemberSelect = (member) => {
    setSelectedMember(member);
  };

  const handleConfirmSlot = () => {
    if (!selectedSlot) {
      alert('Please select an appointment time slot.');
      return;
    }

    if (selectedType === 'Home Visit' && !selectedAddress) {
      alert('Please choose a delivery/visit address for Home Visit consultation.');
      setIsAddressModalOpen(true);
      return;
    }

    // Pass complete booking payload forward
    const sessionPayload = {
      ...bookingData,
      consultationType: selectedType,
      consultationFee: selectedFee,
      slot: selectedSlot,
      patient: selectedMember,
      address: selectedType === 'Home Visit' ? selectedAddress : bookingData?.address,
      totalFee: totalAmountPayable
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('confirmedDoctorAppointment', JSON.stringify(sessionPayload));
    }

    alert(`Appointment confirmed for ${selectedMember.memberName} on ${selectedSlot.date} at ${selectedSlot.formattedTime}! Total: ₹${totalAmountPayable}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-[#3d3f96]" size={36} />
        <p className="text-slate-600 font-semibold text-sm">Preparing appointment session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-24 relative selection:bg-[#3d3f96] selection:text-white">
      {/* Subtle geometric background accents */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-70 pointer-events-none -z-10" />

      {/* Top Navigation Header */}
      <header className="bg-white/90 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-200/80 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-[#3d3f96] transition-colors group cursor-pointer"
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>Change Consultation</span>
          </button>

          <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-full uppercase tracking-wider">
            <ShieldCheck size={14} className="fill-emerald-100" />
            Encrypted Appointment Session
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================= LEFT SECTION (7 COLS) ================= */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. SINGLE UNIFIED CONSULTATION & ADDRESS CARD */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-5">
              
              {/* Card Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#3d3f96] text-white text-xs font-bold flex items-center justify-center">1</span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {selectedType === 'Home Visit' ? 'Home Visit & Consultation Mode' : 'Selected Consultation Mode'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {selectedType === 'Home Visit' ? 'Patient address & locked consultation channel' : 'Your chosen consultation format'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                  <LockKeyhole size={12} />
                  <span>Locked</span>
                </div>
              </div>

              {/* Consultation Details Pill/Row */}
              <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/40 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className={`p-3 rounded-2xl ${
                    selectedType === 'Video Consult'
                      ? 'bg-indigo-100 text-indigo-700'
                      : selectedType === 'Clinic Visit'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {selectedType === 'Video Consult' && <Video size={20} strokeWidth={2.3} />}
                    {selectedType === 'Clinic Visit' && <MapPin size={20} strokeWidth={2.3} />}
                    {selectedType === 'Home Visit' && <Home size={20} strokeWidth={2.3} />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-extrabold text-slate-900">{selectedType}</p>
                      <CheckCircle2 size={15} className="text-emerald-600" />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedType === 'Video Consult' && 'Online video consultation via secure link'}
                      {selectedType === 'Clinic Visit' && 'In-person consultation at doctor clinic'}
                      {selectedType === 'Home Visit' && 'Doctor home visit consultation'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-extrabold text-[#3d3f96]">₹{selectedFee}</span>
                </div>
              </div>

              {/* Address Picker Section (Embedded inside the same card for Home Visit) */}
              {selectedType === 'Home Visit' && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Patient Visit Address</h4>
                      <p className="text-[11px] text-slate-400">Doctor will visit this designated location</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAddressModalOpen(true)}
                      className="flex items-center gap-1.5 text-xs font-extrabold text-[#3d3f96] hover:text-slate-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                    >
                      <Navigation size={12} />
                      <span>{selectedAddress ? 'Change' : 'Select Address'}</span>
                    </button>
                  </div>

                  {selectedAddress ? (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-900">{selectedAddress.name}</span>
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/60">
                            {selectedAddress.addressType || 'Home'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium">
                          {[selectedAddress.houseNo, selectedAddress.sector, selectedAddress.landmark].filter(Boolean).join(', ')}
                        </p>
                        <p className="text-xs font-bold text-slate-800">
                          {[selectedAddress.city, selectedAddress.state, selectedAddress.pincode].filter(Boolean).join(', ')}
                        </p>
                        {selectedAddress.phone && (
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 pt-0.5">
                            <Phone size={10} /> +91 {selectedAddress.phone}
                          </p>
                        )}
                      </div>

                      <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg text-[10px] font-bold shrink-0">
                        Confirmed
                      </span>
                    </div>
                  ) : (
                    <div 
                      onClick={() => setIsAddressModalOpen(true)}
                      className="p-5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-center cursor-pointer transition-all"
                    >
                      <MapPin size={22} className="mx-auto text-slate-400 mb-1.5" />
                      <p className="text-xs font-bold text-slate-700">No Address Selected</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Click here to choose a home address for doctor visit.</p>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* 2. CHOOSE PATIENT / FAMILY MEMBER CARD */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#3d3f96] text-white text-xs font-bold flex items-center justify-center">2</span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Patient Details</h3>
                    <p className="text-xs text-slate-400">Book for yourself or a family member</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-extrabold text-[#3d3f96] hover:text-slate-900 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer"
                >
                  <Users size={13} />
                  <span>Change Patient</span>
                </button>
              </div>

              {/* Selected Patient Banner */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0">
                    <User size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-extrabold text-slate-900">{selectedMember?.memberName}</p>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                        {selectedMember?.relation || 'SELF'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {selectedMember?._id === 'self' 
                        ? 'Consultation records will be linked to primary account' 
                        : 'Consultation records will be linked to family member profile'}
                    </p>
                  </div>
                </div>

                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              </div>
            </div>

            {/* 3. SLOT PICKER COMPONENT */}
            {bookingData?.doctorId && (
              <DoctorSlotPicker
                doctorId={bookingData.doctorId}
                selectedSlot={selectedSlot}
                onSlotSelect={handleSlotSelect}
              />
            )}

          </div>

          {/* ================= RIGHT SUMMARY & DOCTOR DETAILS SECTION (5 COLS) ================= */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm sticky top-24">
              
              <h3 className="text-base font-extrabold text-slate-900 mb-4 pb-3 border-b border-slate-100">
                Appointment Summary
              </h3>

              {/* Doctor Details Card */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 mb-5">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-200 shrink-0 border border-white shadow-xs">
                  <img
                    src={getImageSrc(bookingData?.doctorImage)}
                    alt={bookingData?.doctorName || 'Doctor'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-extrabold text-slate-900 truncate">
                    {bookingData?.doctorName?.toLowerCase().startsWith('dr.') ? bookingData.doctorName : `Dr. ${bookingData?.doctorName || ''}`}
                  </h4>
                  <p className="text-xs font-semibold text-[#3d3f96] truncate">{bookingData?.doctorSpeciality || 'Consultant'}</p>
                  <p className="text-[10px] text-slate-400 truncate">{bookingData?.doctorQualification || 'MBBS, MD'}</p>
                </div>
              </div>

              {/* Appointment Specifics */}
              <div className="space-y-3 text-xs mb-5">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Patient:</span>
                  <span className="font-bold text-slate-900">
                    {selectedMember?.memberName} ({selectedMember?.relation || 'SELF'})
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Consultation Type:</span>
                  <span className="font-bold text-slate-900 bg-indigo-50 text-[#3d3f96] px-2.5 py-1 rounded-lg">
                    {selectedType}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Chosen Slot:</span>
                  <span className="font-bold text-slate-900">
                    {selectedSlot ? `${selectedSlot.date} • ${selectedSlot.formattedTime}` : 'Not Selected Yet'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Session Duration:</span>
                  <span className="font-bold text-slate-900">{bookingData?.slotDuration || 30} Minutes</span>
                </div>

                {/* Location / Home Address in Summary */}
                {selectedType === 'Home Visit' ? (
                  <div className="flex justify-between items-start py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Patient Address:</span>
                    <span className="font-semibold text-slate-700 text-right max-w-[200px] truncate">
                      {selectedAddress ? `${selectedAddress.houseNo || ''}, ${selectedAddress.city}` : 'Address Pending'}
                    </span>
                  </div>
                ) : bookingData?.address ? (
                  <div className="flex justify-between items-start py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Practice Location:</span>
                    <span className="font-semibold text-slate-700 text-right max-w-[200px] truncate">
                      {bookingData.address}
                    </span>
                  </div>
                ) : null}
              </div>

              {/* Price Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2 mb-5">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Consultation Base Fee</span>
                  <span className="font-bold">₹{selectedFee}</span>
                </div>
                {selectedSlot?.premiumFee > 0 && (
                  <div className="flex justify-between text-xs text-amber-700 font-semibold">
                    <span>Peak Slot Surcharge</span>
                    <span>+₹{selectedSlot.premiumFee}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Platform Booking Fee</span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200/80">
                  <span>Total Amount Payable</span>
                  <span className="text-[#3d3f96]">₹{totalAmountPayable}</span>
                </div>
              </div>

              {/* Proceed Button */}
              <button
                type="button"
                onClick={handleConfirmSlot}
                disabled={!selectedSlot || (selectedType === 'Home Visit' && !selectedAddress)}
                className="w-full bg-[#3d3f96] hover:bg-slate-900 text-white py-4 rounded-2xl text-xs font-extrabold tracking-wider uppercase transition-all duration-200 shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed mb-3"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={15} />
              </button>

              {/* Trust Badge */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50/80 border border-emerald-200/60 p-3 rounded-2xl">
                <ShieldCheck size={14} className="fill-emerald-100" />
                <span>Instant Confirmation & Free Rescheduling</span>
              </div>

            </div>

          </div>

        </div>
      </main>

      {/* Right Drawer Modal for Choosing Address */}
      <ChooseAddress
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        selectedAddressId={selectedAddress?._id}
        onSelectAddress={handleAddressSelect}
      />

      {/* Right Drawer Modal for Choosing Family Member / Patient */}
      <ChooseFamilyMember
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        selectedMemberId={selectedMember?._id}
        onSelectMember={handleMemberSelect}
      />
    </div>
  );
}

export default function DoctorBookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-[#3d3f96]" size={36} />
        <p className="text-slate-600 font-semibold text-sm">Loading appointment details...</p>
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}