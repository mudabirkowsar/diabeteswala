"use client";

import React, { useState, useEffect } from 'react';
import { 
  FaCalendarCheck, 
  FaHistory, 
  FaTimes, 
  FaCheck, 
  FaExchangeAlt, 
  FaUserInjured, 
  FaCheckDouble,
  FaExclamationCircle,
  FaClock,
  FaCalendarAlt,
  FaPhone,
  FaUserMd,
  FaRupeeSign,
  FaInfoCircle
} from 'react-icons/fa';

// --- MOCK DATA ---
const INITIAL_DOCTORS = [
  { _id: "doc-1", name: "Alok Sharma", specialist: "Endocrinology" },
  { _id: "doc-2", name: "Ritu Verma", specialist: "General Medicine" },
  { _id: "doc-3", name: "Suresh Gupta", specialist: "Diabetology" },
  { _id: "doc-4", name: "Neha Patwardhan", specialist: "Pediatrics" }
];

const INITIAL_APPOINTMENTS = [
  {
    _id: "appt-101",
    patientDetails: { name: "Nitish kumar", phone: "9876543210" },
    doctorDetails: { _id: "doc-1", name: "Alok Sharma", specialist: "Endocrinology" },
    date: "2026-07-24",
    timeSlot: "10:30 AM",
    price: "1200",
    type: "Online",
    status: "9" // Order Placed
  },
  {
    _id: "appt-102",
    patientDetails: { name: "Aman Preet", phone: "9812345678" },
    doctorDetails: { _id: "doc-2", name: "Ritu Verma", specialist: "General Medicine" },
    date: "2026-07-24",
    timeSlot: "02:15 PM",
    price: "800",
    type: "Offline",
    status: "0" // Pending Doctor
  },
  {
    _id: "appt-103",
    patientDetails: { name: "Siddharth Jain", phone: "9988776655" },
    doctorDetails: { _id: "doc-3", name: "Suresh Gupta", specialist: "Diabetology" },
    date: "2026-07-23",
    timeSlot: "11:00 AM",
    price: "1500",
    type: "Online",
    status: "1" // Accepted Doctor
  },
  {
    _id: "appt-104",
    patientDetails: { name: "Priyanka Roy", phone: "9899887766" },
    doctorDetails: { _id: "doc-1", name: "Alok Sharma", specialist: "Endocrinology" },
    date: "2026-07-22",
    timeSlot: "04:45 PM",
    price: "1000",
    type: "Offline",
    status: "3" // Completed
  },
  {
    _id: "appt-105",
    patientDetails: { name: "Karan Johar", phone: "9501234567" },
    doctorDetails: { _id: "doc-4", name: "Neha Patwardhan", specialist: "Pediatrics" },
    date: "2026-07-21",
    timeSlot: "01:00 PM",
    price: "900",
    type: "Online",
    status: "2", // Rejected
    rejectReason: "Doctor unavailable on slot timing."
  }
];

const INITIAL_APPOINTMENT_HISTORY = [
  {
    _id: "hist-201",
    patientDetails: { name: "Meera Rajput", phone: "9447123456" },
    doctorDetails: { name: "Alok Sharma", specialist: "Endocrinology" },
    date: "2026-07-20",
    timeSlot: "11:30 AM",
    price: "1200",
    status: "3"
  },
  {
    _id: "hist-202",
    patientDetails: { name: "Vikram Malhotra", phone: "9811223344" },
    doctorDetails: { name: "Ritu Verma", specialist: "General Medicine" },
    date: "2026-07-18",
    timeSlot: "03:00 PM",
    price: "800",
    status: "3"
  }
];

export default function ClinicAppointmentsPage() {
  const [mounted, setMounted] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('appointments'); // 'appointments' or 'history'
  
  // Interactive Mock States
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [appointmentHistory] = useState(INITIAL_APPOINTMENT_HISTORY);
  const [clinicDoctors] = useState(INITIAL_DOCTORS);
  
  // Modals States
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  // Modal Visibility Flags
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  const [notification, setNotification] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = (text, type = "success") => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Status Badge Component
  const renderStatusBadge = (status) => {
    switch (status) {
      case '9':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-indigo-50 text-[#3D3F96] border border-indigo-100">Order Placed</span>;
      case '0':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-100">Pending Doctor</span>;
      case '1':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-100">Accepted</span>;
      case '2':
      case '10':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-rose-50 text-rose-700 border border-rose-100">Rejected</span>;
      case '3':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-sky-50 text-sky-700 border border-sky-100">Completed</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-700">Unknown</span>;
    }
  };

  // --- ROW CLICK HANDLER FOR FULL INFO MODAL ---
  const handleRowClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  };

  // --- ACTIONS WITH PROPAGATION STOPPERS ---
  const handleAccept = (e, id, currentStatus) => {
    e.stopPropagation();
    let nextStatus = '1';
    if (currentStatus === '9') nextStatus = '0';

    setAppointments(appointments.map(a => a._id === id ? { ...a, status: nextStatus } : a));
    showToast(currentStatus === '9' ? "Moved to Doctor Pending Queue" : "Appointment Accepted!");
  };

  const handleOpenRejectModal = (e, appointment) => {
    e.stopPropagation();
    setSelectedAppointment(appointment);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (!rejectReason.trim()) {
      alert("Please provide a rejection reason!");
      return;
    }
    setAppointments(appointments.map(a => 
      a._id === selectedAppointment._id ? { ...a, status: '2', rejectReason } : a
    ));
    setShowRejectModal(false);
    setSelectedAppointment(null);
    showToast("Appointment Rejected", "danger");
  };

  const handleMarkAsDone = (e, id) => {
    e.stopPropagation();
    setAppointments(appointments.map(a => a._id === id ? { ...a, status: '3' } : a));
    showToast("Appointment marked as completed!");
  };

  const handleOpenReassign = (e, appointment) => {
    e.stopPropagation();
    setSelectedAppointment(appointment);
    setSelectedDoctorId(appointment.doctorDetails?._id || '');
    setShowReassignModal(true);
  };

  const confirmReassign = () => {
    if (!selectedDoctorId) return;
    const targetDoc = clinicDoctors.find(d => d._id === selectedDoctorId);
    
    setAppointments(appointments.map(a => 
      a._id === selectedAppointment._id 
        ? { ...a, doctorDetails: { _id: targetDoc._id, name: targetDoc.name, specialist: targetDoc.specialist } } 
        : a
    ));
    setShowReassignModal(false);
    setSelectedAppointment(null);
    showToast(`Doctor reassigned to Dr. ${targetDoc.name}!`);
  };

  // --- RESCHEDULE ACTION ---
  const handleOpenReschedule = (e, appointment) => {
    e.stopPropagation();
    setSelectedAppointment(appointment);
    setRescheduleDate(appointment.date || '');
    setRescheduleTime(appointment.timeSlot || '');
    setShowRescheduleModal(true);
  };

  const confirmReschedule = (e) => {
    e.preventDefault();
    if (!rescheduleDate || !rescheduleTime) {
      alert("Please choose new Date and Time slot!");
      return;
    }

    setAppointments(appointments.map(a => 
      a._id === selectedAppointment._id 
        ? { ...a, date: rescheduleDate, timeSlot: rescheduleTime } 
        : a
    ));

    setShowRescheduleModal(false);
    setSelectedAppointment(null);
    showToast("Appointment rescheduled successfully!");
  };

  if (!mounted) return null;

  return (
    <div className="p-4 md:p-8 space-y-8 select-none animate-fadeIn">
      
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>

      {/* Dynamic Toast Banner */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-2xl shadow-2xl text-xs font-black uppercase tracking-wider text-white border border-white/20 animate-fadeIn ${
          notification.type === 'danger' ? 'bg-rose-600' : 'bg-[#3D3F96]'
        }`}>
          {notification.text}
        </div>
      )}

      {/* Header & Sub-Tabs Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-800">Clinic Appointments & History</h2>
          <p className="text-xs text-gray-400 mt-1">Real-time consultation queue management. Click on any row to view complete info.</p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-gray-100 p-1.5 rounded-2xl flex items-center gap-1 border border-gray-200/50 self-start sm:self-auto">
          <button 
            onClick={() => setActiveSubTab('appointments')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeSubTab === 'appointments' 
                ? 'bg-[#3D3F96] text-white shadow-lg shadow-indigo-950/10' 
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <FaCalendarCheck /> Appointments ({appointments.length})
          </button>
          <button 
            onClick={() => setActiveSubTab('history')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeSubTab === 'history' 
                ? 'bg-[#3D3F96] text-white shadow-lg shadow-indigo-950/10' 
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <FaHistory /> Appointment History ({appointmentHistory.length})
          </button>
        </div>
      </div>

      {/* --- SUB-TAB 1: ACTIVE APPOINTMENTS TABLE --- */}
      {activeSubTab === 'appointments' && (
        <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm animate-fadeIn">
          <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#3D3F96] flex items-center justify-center text-lg">
                <FaCalendarCheck />
              </div>
              <div>
                <h4 className="text-base font-black text-gray-800 leading-none">Active Appointments Queue</h4>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-1">Click any row to open complete appointment details</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse align-middle">
              <thead>
                <tr className="bg-slate-50/80 border-b border-gray-100 text-[10px] font-black uppercase text-gray-400 tracking-wider">
                  <th className="p-4">Patient</th>
                  <th className="p-4">Doctor</th>
                  <th className="p-4">Date & Slot</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Reschedule</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {appointments.map((appt) => (
                  <tr 
                    key={appt._id} 
                    onClick={() => handleRowClick(appt)}
                    className="hover:bg-indigo-50/10 cursor-pointer transition-all duration-200"
                  >
                    
                    {/* Patient */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#3D3F96] flex items-center justify-center font-black text-xs shrink-0">
                          <FaUserInjured />
                        </div>
                        <div>
                          <span className="font-black text-gray-800 block">{appt.patientDetails?.name}</span>
                          <span className="text-[10px] text-gray-400 font-bold block">{appt.patientDetails?.phone}</span>
                        </div>
                      </div>
                    </td>

                    {/* Doctor */}
                    <td className="p-4">
                      <span className="font-black text-gray-800 block">Dr. {appt.doctorDetails?.name}</span>
                      <span className="text-[10px] text-indigo-600 font-bold block">{appt.doctorDetails?.specialist}</span>
                    </td>

                    {/* Date & Time */}
                    <td className="p-4">
                      <span className="font-bold text-gray-700 block">{appt.date}</span>
                      <span className="text-[10px] text-gray-400 font-bold block">{appt.timeSlot}</span>
                    </td>

                    {/* Price */}
                    <td className="p-4 font-black text-gray-800">₹{appt.price}</td>

                    {/* Type */}
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${
                        appt.type === 'Online' 
                          ? 'bg-sky-50 text-sky-700 border border-sky-100' 
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {appt.type}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-4">{renderStatusBadge(appt.status)}</td>

                    {/* NEW: RESCHEDULE COLUMN & BUTTON */}
                    <td className="p-4 text-center">
                      <button
                        onClick={(e) => handleOpenReschedule(e, appt)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-all shadow-sm"
                        title="Reschedule Appointment Date & Time"
                      >
                        <FaClock size={11} /> Reschedule
                      </button>
                    </td>

                    {/* Action Controls */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center flex-wrap gap-2">
                        
                        {/* Accept / Reject */}
                        {(appt.status === '0' || appt.status === '9') && (
                          <>
                            <button
                              onClick={(e) => handleAccept(e, appt._id, appt.status)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all shadow-sm"
                            >
                              <FaCheck size={11} /> Accept
                            </button>
                            <button
                              onClick={(e) => handleOpenRejectModal(e, appt)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all shadow-sm"
                            >
                              <FaTimes size={11} /> Reject
                            </button>
                          </>
                        )}

                        {/* Reassign Doctor */}
                        {(appt.status === '0' || appt.status === '1' || appt.status === '9') && (
                          <button
                            onClick={(e) => handleOpenReassign(e, appt)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#3D3F96] border border-indigo-200 text-xs font-bold transition-all shadow-sm"
                          >
                            <FaExchangeAlt size={11} /> Reassign
                          </button>
                        )}

                        {/* Mark as Done */}
                        {appt.status === '1' && (
                          <button
                            onClick={(e) => handleMarkAsDone(e, appt._id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold transition-all shadow-sm"
                          >
                            <FaCheckDouble size={11} /> Mark Done
                          </button>
                        )}

                        {/* Inactive indicators */}
                        {(appt.status === '2' || appt.status === '3' || appt.status === '10') && (
                          <span className="text-[10px] font-bold text-gray-400 uppercase">Archived</span>
                        )}

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- SUB-TAB 2: APPOINTMENT HISTORY TABLE --- */}
      {activeSubTab === 'history' && (
        <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm animate-fadeIn">
          <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
                <FaHistory />
              </div>
              <div>
                <h4 className="text-base font-black text-gray-800 leading-none">Completed Appointment History</h4>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-1">Archived session logs</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse align-middle">
              <thead>
                <tr className="bg-slate-50/80 border-b border-gray-100 text-[10px] font-black uppercase text-gray-400 tracking-wider">
                  <th className="p-4">Patient</th>
                  <th className="p-4">Doctor</th>
                  <th className="p-4">Date & Slot</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {appointmentHistory.map((order) => (
                  <tr 
                    key={order._id} 
                    onClick={() => handleRowClick(order)}
                    className="hover:bg-slate-50/50 cursor-pointer transition-all duration-200"
                  >
                    <td className="p-4 font-black text-gray-800">{order.patientDetails?.name}</td>
                    <td className="p-4 font-bold text-gray-700">Dr. {order.doctorDetails?.name}</td>
                    <td className="p-4 text-xs font-semibold text-gray-500">{order.date} - {order.timeSlot}</td>
                    <td className="p-4 font-black text-emerald-600">₹{order.price}</td>
                    <td className="p-4">{renderStatusBadge(order.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- ROW CLICK DETAIL MODAL (Complete Information Panel) --- */}
      {showDetailModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-xl p-6 md:p-8 shadow-2xl border border-gray-100 relative animate-fadeIn">
            
            <button onClick={() => setShowDetailModal(false)} className="absolute right-6 top-6 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-gray-400 hover:text-gray-600 transition-all">
              <FaTimes />
            </button>

            <div className="mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#3D3F96] flex items-center justify-center text-lg">
                <FaInfoCircle />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-800 leading-none">Appointment File #{selectedAppointment._id}</h3>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-1">Complete patient & consultation details</span>
              </div>
            </div>

            <div className="space-y-4 text-xs font-semibold">
              
              {/* Patient & Doctor Card */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[9px] uppercase font-black text-gray-400 block mb-1">Patient Details</span>
                  <h4 className="text-sm font-black text-gray-800 flex items-center gap-1.5"><FaUserInjured className="text-[#3D3F96]" /> {selectedAppointment.patientDetails?.name}</h4>
                  <span className="text-[11px] text-gray-500 font-bold block mt-1"><FaPhone className="inline text-gray-400 mr-1" /> {selectedAppointment.patientDetails?.phone}</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[9px] uppercase font-black text-gray-400 block mb-1">Assigned Doctor</span>
                  <h4 className="text-sm font-black text-gray-800 flex items-center gap-1.5"><FaUserMd className="text-emerald-600" /> Dr. {selectedAppointment.doctorDetails?.name}</h4>
                  <span className="text-[11px] text-indigo-600 font-bold block mt-1">{selectedAppointment.doctorDetails?.specialist}</span>
                </div>
              </div>

              {/* Slot & Financial Info */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2.5">
                <div className="flex justify-between border-b border-gray-200/60 pb-2">
                  <span className="text-gray-400 uppercase text-[9px]">Consultation Date</span>
                  <span className="font-black text-gray-800 flex items-center gap-1"><FaCalendarAlt className="text-indigo-500" /> {selectedAppointment.date}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200/60 pb-2">
                  <span className="text-gray-400 uppercase text-[9px]">Time Slot</span>
                  <span className="font-black text-gray-800 flex items-center gap-1"><FaClock className="text-amber-500" /> {selectedAppointment.timeSlot}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200/60 pb-2">
                  <span className="text-gray-400 uppercase text-[9px]">Consultation Mode</span>
                  <span className="font-black text-sky-600 uppercase">{selectedAppointment.type}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200/60 pb-2">
                  <span className="text-gray-400 uppercase text-[9px]">Consultation Fee</span>
                  <span className="font-black text-emerald-600 text-sm">₹{selectedAppointment.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 uppercase text-[9px]">Current Status</span>
                  {renderStatusBadge(selectedAppointment.status)}
                </div>
              </div>

              {/* Rejection reason note if rejected */}
              {selectedAppointment.rejectReason && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-800">
                  <span className="text-[9px] uppercase font-black text-rose-500 block">Rejection Note</span>
                  <p className="text-xs font-bold mt-0.5">{selectedAppointment.rejectReason}</p>
                </div>
              )}

            </div>

            <button 
              onClick={() => setShowDetailModal(false)}
              className="w-full text-center py-3.5 rounded-2xl bg-[#3D3F96] hover:bg-[#2C2D75] text-white text-xs font-black uppercase tracking-widest mt-6 transition-all"
            >
              Close Information
            </button>
          </div>
        </div>
      )}

      {/* --- RESCHEDULE MODAL --- */}
      {showRescheduleModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-6 md:p-8 shadow-2xl border border-gray-100 relative animate-fadeIn">
            
            <button onClick={() => setShowRescheduleModal(false)} className="absolute right-6 top-6 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-gray-400 hover:text-gray-600 transition-all">
              <FaTimes />
            </button>

            <div className="mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
                <FaClock />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-800 leading-none">Reschedule Appointment</h3>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-1">Select new consultation slot</span>
              </div>
            </div>

            <form onSubmit={confirmReschedule} className="space-y-4 text-xs font-semibold text-gray-600">
              
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-black text-gray-400 block">Patient</span>
                <span className="text-sm font-black text-gray-800 block">{selectedAppointment.patientDetails?.name}</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="uppercase text-[10px] text-gray-400 font-bold">New Date *</label>
                <input 
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  required
                  className="px-4 py-3 rounded-xl border border-gray-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#3D3F96]/10 outline-none text-gray-800 font-bold transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="uppercase text-[10px] text-gray-400 font-bold">New Time Slot *</label>
                <input 
                  type="text"
                  placeholder="e.g. 11:30 AM, 04:00 PM"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  required
                  className="px-4 py-3 rounded-xl border border-gray-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#3D3F96]/10 outline-none text-gray-800 font-bold transition-all"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowRescheduleModal(false)} 
                  className="px-5 py-2.5 rounded-xl border border-gray-100 hover:bg-slate-50 text-[10px] font-black uppercase tracking-wider text-gray-400 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 rounded-xl bg-[#3D3F96] hover:bg-[#2C2D75] text-white text-[10px] font-black uppercase tracking-wider transition-all"
                >
                  Save Reschedule
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* --- REASSIGN DOCTOR MODAL --- */}
      {showReassignModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-6 md:p-8 shadow-2xl border border-gray-100 relative animate-fadeIn">
            
            <button onClick={() => setShowReassignModal(false)} className="absolute right-6 top-6 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-gray-400 hover:text-gray-600 transition-all">
              <FaTimes />
            </button>

            <div className="mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#3D3F96] flex items-center justify-center text-lg">
                <FaExchangeAlt />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-800 leading-none">Reassign Doctor</h3>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-1">Re-route appointment slot</span>
              </div>
            </div>

            <p className="text-xs font-semibold text-gray-600 mb-4 bg-slate-50 p-3 rounded-xl">
              Reassigning appointment for <strong className="text-gray-800">{selectedAppointment.patientDetails?.name}</strong>.
            </p>

            <div className="space-y-4 text-xs font-bold text-gray-600">
              <div className="flex flex-col gap-1.5">
                <label className="uppercase text-[10px] text-gray-400">Select Available Doctor *</label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-gray-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#3D3F96]/10 outline-none text-gray-800 font-bold transition-all"
                >
                  <option value="">Choose a doctor...</option>
                  {clinicDoctors.map(doctor => (
                    <option key={doctor._id} value={doctor._id}>
                      Dr. {doctor.name} - ({doctor.specialist})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowReassignModal(false)} 
                  className="px-5 py-2.5 rounded-xl border border-gray-100 hover:bg-slate-50 text-[10px] font-black uppercase tracking-wider text-gray-400 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={confirmReassign} 
                  disabled={!selectedDoctorId}
                  className="px-5 py-2.5 rounded-xl bg-[#3D3F96] hover:bg-[#2C2D75] text-white text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-40"
                >
                  Reassign Doctor
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- REJECT REASON MODAL --- */}
      {showRejectModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-6 md:p-8 shadow-2xl border border-gray-100 relative animate-fadeIn">
            
            <button onClick={() => setShowRejectModal(false)} className="absolute right-6 top-6 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-gray-400 hover:text-gray-600 transition-all">
              <FaTimes />
            </button>

            <div className="mb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center text-lg">
                <FaExclamationCircle />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-800 leading-none">Reject Appointment</h3>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-1">Provide reason for rejection</span>
              </div>
            </div>

            <div className="space-y-4 text-xs font-semibold text-gray-600">
              <div className="flex flex-col gap-1.5">
                <label className="uppercase text-[10px] text-gray-400 font-bold">Reason for Rejection *</label>
                <textarea
                  rows="3"
                  placeholder="e.g. Doctor is unavailable at requested slot timing."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-gray-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500/20 outline-none text-gray-800 font-bold transition-all"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowRejectModal(false)} 
                  className="px-5 py-2.5 rounded-xl border border-gray-100 hover:bg-slate-50 text-[10px] font-black uppercase tracking-wider text-gray-400 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={confirmReject} 
                  className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider transition-all"
                >
                  Reject Appointment
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}