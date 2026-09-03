"use client";

import React, { useState, useEffect } from 'react';
import {
  FaUserMd,
  FaPlusCircle,
  FaTrashAlt,
  FaPhone,
  FaEnvelope,
  FaAward,
  FaCertificate,
  FaSearch,
  FaSpinner,
  FaExclamationCircle,
  FaChevronLeft,
  FaChevronRight,
  FaCheckCircle,
  FaEye
} from 'react-icons/fa';

import ClinicAPI from '../../../../services/ClinicAPI';
import AddDoctor from './components/AddDoctor';
import ViewDoctor from './components/ViewDoctor';

// Base backend URL from environment
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.1.7:5002';

// Helper function to resolve backend image paths
const getImageUrl = (path) => {
  if (!path) return 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:') || path.startsWith('data:')) {
    return path;
  }
  const cleanBase = BACKEND_URL.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

export default function ClinicDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Load clinic doctor directory from API
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await ClinicAPI.getClinicDoctorsDirectory();
      if (res?.success && Array.isArray(res.data)) {
        setDoctors(res.data);
      } else {
        setDoctors([]);
      }
    } catch (err) {
      console.error("Failed to fetch doctors directory:", err);
      setError(err.response?.data?.message || "Could not load clinic doctor roster.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Live Duty Status Patch
  const handleDutyStatusChange = async (e, doctorId) => {
    e.stopPropagation();
    const newStatus = e.target.value;

    try {
      const res = await ClinicAPI.toggleDoctorDutyStatus(doctorId, { dutyStatus: newStatus });
      if (res?.success) {
        setDoctors(prev => prev.map(d => d._id === doctorId ? { ...d, dutyStatus: newStatus } : d));
        showToast(`Status updated to "${newStatus}"`);
      }
    } catch (err) {
      console.error("Duty status toggle failed:", err);
      showToast(err.response?.data?.message || "Status update failed");
    }
  };

  // Remove doctor from clinic
  const handleDelete = async (e, doctor) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to remove Dr. ${doctor.name} from your clinic?`)) return;

    try {
      const res = await ClinicAPI.removeDoctorFromClinic(doctor._id);
      if (res?.success) {
        setDoctors(prev => prev.filter(d => d._id !== doctor._id));
        showToast(`Dr. ${doctor.name} removed successfully.`);
      }
    } catch (err) {
      console.error("Remove doctor failed:", err);
      alert(err.response?.data?.message || "Could not remove doctor.");
    }
  };

  const handleDoctorAdded = (newDoc) => {
    setDoctors(prev => [newDoc, ...prev]);
    showToast(`Dr. ${newDoc.name} registered successfully!`);
  };

  const handleDoctorUpdated = (updatedDoc) => {
    setDoctors(prev => prev.map(d => d._id === updatedDoc._id ? { ...d, ...updatedDoc } : d));
    setSelectedDoctor(updatedDoc);
    showToast("Profile updated successfully!");
  };

  const handleRowClick = (doctor) => {
    setSelectedDoctor(doctor);
    setShowViewModal(true);
  };

  // Search filtering
  const filteredDoctors = doctors.filter(doc => {
    const q = searchTerm.toLowerCase();
    const nameMatch = doc.name?.toLowerCase().includes(q);
    const specMatch = (doc.speciality || doc.specialist || '')?.toLowerCase().includes(q);
    const phoneMatch = doc.phone?.includes(q);
    return nameMatch || specMatch || phoneMatch;
  });

  // Pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDoctorsList = filteredDoctors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);

  return (
    <div className="space-y-8 select-none">

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[999999] px-5 py-3 rounded-2xl bg-[#3D3F96] text-white text-xs font-bold shadow-2xl border border-white/20 flex items-center gap-2">
          <FaCheckCircle /> {toastMessage}
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-800">Clinic Doctors</h2>
          <p className="text-xs text-gray-400 mt-1">Manage verified practitioner directory, duties, and profiles.</p>
        </div>

        {/* ADD DOCTOR MODAL BUTTON */}
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#3D3F96] hover:bg-[#2C2E75] text-white text-xs font-bold tracking-wide transition-all shadow-lg shadow-indigo-950/10 self-start sm:self-auto"
        >
          <FaPlusCircle /> Add Doctor
        </button>
      </div>

      {/* Registry Count & Search Filter */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Clinic Registry</span>
          <h4 className="text-xl font-black text-gray-800 mt-1">Staff Directory Table</h4>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Search */}
          <div className="relative">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:border-[#3D3F96] w-64"
            />
          </div>

          <span className="inline-block px-4 py-2 rounded-2xl text-xs font-bold bg-[#3D3F96]/10 text-[#3D3F96] shrink-0">
            {filteredDoctors.length} Registered Staff
          </span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-center gap-3 text-rose-700 text-xs font-semibold">
          <FaExclamationCircle className="text-base" /> {error}
          <button onClick={fetchDoctors} className="underline font-bold ml-auto">Retry</button>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse align-middle">
            <thead>
              <tr className="bg-slate-50/80 border-b border-gray-100 text-[10px] font-black uppercase text-gray-400 tracking-wider">
                <th className="p-4 w-20">Profile</th>
                <th className="p-4">Name</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Specialization</th>
                <th className="p-4 text-center">Experience</th>
                <th className="p-4 text-center">OPD Fee</th>
                <th className="p-4">Duty Status</th>
                <th className="p-4 text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-slate-400">
                    <FaSpinner className="animate-spin text-2xl mx-auto mb-2 text-[#3D3F96]" />
                    <span className="text-xs font-medium">Loading clinic doctors...</span>
                  </td>
                </tr>
              ) : currentDoctorsList.length > 0 ? (
                currentDoctorsList.map((doc) => (
                  <tr
                    key={doc._id}
                    onClick={() => handleRowClick(doc)}
                    className="hover:bg-indigo-50/10 cursor-pointer transition-all"
                  >
                    <td className="p-4">
                      <img
                        src={getImageUrl(doc.profileImage)}
                        alt={doc.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200';
                        }}
                        className="w-11 h-11 rounded-xl object-cover border border-slate-100 shadow-sm"
                      />
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-800">{doc.name}</div>
                      <div className="text-[11px] text-gray-400 font-medium">{doc.licenseNumber || 'License Pending'}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs font-bold text-gray-700">{doc.phone}</div>
                      <div className="text-[11px] text-gray-400">{doc.email || '-'}</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-block px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider bg-indigo-50 text-[#3D3F96]">
                        {doc.speciality || doc.specialist || 'General Medicine'}
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold text-gray-700">
                      {doc.experienceYears || doc.experience || 0} Yrs
                    </td>
                    <td className="p-4 text-center font-bold text-emerald-600">
                      ₹{doc.fees?.clinic || 0}
                    </td>
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={doc.dutyStatus || "On Duty"}
                        onChange={(e) => handleDutyStatusChange(e, doc._id)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border outline-none cursor-pointer ${doc.dutyStatus === 'Off Duty' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                            doc.dutyStatus === 'On Leave' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                              doc.dutyStatus === 'Busy' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                                'bg-emerald-50 text-emerald-600 border-emerald-200'
                          }`}
                      >
                        <option value="On Duty">On Duty</option>
                        <option value="Off Duty">Off Duty</option>
                        <option value="On Leave">On Leave</option>
                        <option value="Busy">Busy</option>
                      </select>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRowClick(doc); }}
                          className="p-2 rounded-xl border border-gray-100 bg-white hover:bg-indigo-50 text-gray-400 hover:text-[#3D3F96] transition-all"
                          title="View / Edit Doctor Details"
                        >
                          <FaEye size={12} />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, doc)}
                          className="p-2 rounded-xl border border-gray-100 bg-white hover:bg-rose-50 text-gray-400 hover:text-rose-500 transition-all"
                          title="Remove Doctor"
                        >
                          <FaTrashAlt size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-gray-400 font-bold">
                    <FaUserMd className="text-3xl mx-auto mb-2 text-indigo-400" />
                    <h5>No Doctors Found in Directory</h5>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-5 bg-slate-50/50 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">
              Showing <strong className="text-gray-700">{indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredDoctors.length)}</strong> of <strong className="text-gray-700">{filteredDoctors.length}</strong>
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                className="p-2 rounded-xl border border-gray-100 bg-white disabled:opacity-40"
              >
                <FaChevronLeft size={11} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold ${currentPage === i + 1 ? 'bg-[#3D3F96] text-white' : 'bg-white border border-gray-100 text-gray-600'
                    }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                className="p-2 rounded-xl border border-gray-100 bg-white disabled:opacity-40"
              >
                <FaChevronRight size={11} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- ADD DOCTOR COMPONENT MODAL --- */}
      {showAddModal && (
        <AddDoctor
          onClose={() => setShowAddModal(false)}
          onDoctorAdded={handleDoctorAdded}
        />
      )}

      {/* --- VIEW & EDIT DOCTOR COMPONENT MODAL --- */}
      {showViewModal && selectedDoctor && (
        <ViewDoctor
          doctor={selectedDoctor}
          onClose={() => { setShowViewModal(false); setSelectedDoctor(null); }}
          onDoctorUpdated={handleDoctorUpdated}
        />
      )}

    </div>
  );
}