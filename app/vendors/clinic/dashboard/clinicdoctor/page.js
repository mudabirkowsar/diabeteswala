"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Next.js router for navigation
import { 
  FaUserMd, 
  FaPlusCircle, 
  FaTrashAlt, 
  FaPencilAlt, 
  FaPhone, 
  FaEnvelope, 
  FaAward, 
  FaCertificate,
  FaTimes,
  FaMapMarkerAlt,
  FaBuilding,
  FaIdCard,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';

// --- ENRICHED MOCK DOCTORS LIST ---
const INITIAL_DOCTORS = [
  { _id: "doc-01", name: "Alok Sharma", email: "dr.alok@yopmail.com", phoneNumber: "9876543210", alternatePhoneNumber: "9123456789", specialist: "Endocrinology", experience: "12", qualification: "MD, DM (Endocrinology)", licenceNumber: "MCI-48209", councilNumber: "Delhi Medical Council", clinicName: "Diabetic 11", address: "A-24, Green Park, New Delhi", country: "India", state: "Delhi", city: "New Delhi", image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200", status: "Active" },
  { _id: "doc-02", name: "Ritu Verma", email: "dr.ritu@yopmail.com", phoneNumber: "9812345678", alternatePhoneNumber: "9876541230", specialist: "General Medicine", experience: "8", qualification: "MBBS, MD (Medicine)", licenceNumber: "MCI-52104", councilNumber: "Haryana Medical Council", clinicName: "Diabetic 11", address: "Sec-14, Gurgaon", country: "India", state: "Haryana", city: "Gurugram", image: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=200", status: "Active" },
  { _id: "doc-03", name: "Suresh Gupta", email: "dr.suresh@yopmail.com", phoneNumber: "9988776655", alternatePhoneNumber: "9911223344", specialist: "Diabetology", experience: "15", qualification: "MD, Fellowship in Diabetology", licenceNumber: "MCI-31420", councilNumber: "Delhi Medical Council", clinicName: "Diabetic 11", address: "H-12, Rohini, New Delhi", country: "India", state: "Delhi", city: "New Delhi", image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200", status: "Active" },
  { _id: "doc-04", name: "Neha Patwardhan", email: "dr.neha@yopmail.com", phoneNumber: "9822334455", alternatePhoneNumber: "9899887766", specialist: "Pediatrics", experience: "6", qualification: "MBBS, DCH", licenceNumber: "MCI-18934", councilNumber: "Maharashtra Medical Council", clinicName: "Diabetic 11", address: "Kharghar, Navi Mumbai", country: "India", state: "Maharashtra", city: "Navi Mumbai", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200", status: "Active" },
  { _id: "doc-05", name: "Arvind Swamy", email: "dr.arvind@yopmail.com", phoneNumber: "9501234567", alternatePhoneNumber: "9501234568", specialist: "Cardiology", experience: "18", qualification: "MD, DM (Cardiology)", licenceNumber: "MCI-10294", councilNumber: "Tamil Nadu Medical Council", clinicName: "Diabetic 11", address: "Adyar, Chennai", country: "India", state: "Tamil Nadu", city: "Chennai", image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200", status: "Active" },
  { _id: "doc-06", name: "Meera Nair", email: "dr.meera@yopmail.com", phoneNumber: "9447123456", alternatePhoneNumber: "9447123457", specialist: "Dietetics", experience: "10", qualification: "M.Sc Food & Nutrition", licenceNumber: "REG-89410", councilNumber: "Kerala Dietetic Council", clinicName: "Diabetic 11", address: "Kaloor, Kochi", country: "India", state: "Kerala", city: "Kochi", image: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=200", status: "Active" }
];

// --- DOCTOR DETAIL MODAL (max-w-xl) ---
const DoctorDetailModal = ({ doctor, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl border border-gray-100 p-6 md:p-8 relative max-h-[90vh] overflow-y-auto animate-fadeIn">
        
        <button onClick={onClose} className="absolute right-6 top-6 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-gray-400 hover:text-gray-600 transition-all">
          <FaTimes />
        </button>

        <div className="flex flex-col items-center text-center border-b border-gray-50 pb-6 mb-6">
          <img src={doctor.image} alt={doctor.name} className="w-24 h-24 rounded-2xl object-cover border border-slate-100 shadow-md mb-4" />
          <h3 className="text-xl font-black text-gray-800 leading-none">Dr. {doctor.name}</h3>
          <span className="inline-block mt-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
            {doctor.specialist}
          </span>
        </div>

        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-3 rounded-xl">
              <span className="text-[10px] uppercase font-black text-gray-400 block mb-1">Qualification</span>
              <span className="font-bold text-gray-700 flex items-center gap-1.5"><FaCertificate className="text-indigo-500" /> {doctor.qualification}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <span className="text-[10px] uppercase font-black text-gray-400 block mb-1">Experience</span>
              <span className="font-bold text-gray-700 flex items-center gap-1.5"><FaAward className="text-amber-500" /> {doctor.experience} Years</span>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl space-y-2.5">
            <div className="flex justify-between border-b border-gray-200/50 pb-2">
              <span className="font-bold text-gray-400 uppercase text-[9px]">Email</span>
              <span className="font-semibold text-gray-700 flex items-center gap-1.5"><FaEnvelope className="text-slate-400" /> {doctor.email}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200/50 pb-2">
              <span className="font-bold text-gray-400 uppercase text-[9px]">Phone</span>
              <span className="font-semibold text-gray-700 flex items-center gap-1.5"><FaPhone className="text-slate-400" /> {doctor.phoneNumber}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200/50 pb-2">
              <span className="font-bold text-gray-400 uppercase text-[9px]">Alternate Phone</span>
              <span className="font-semibold text-gray-700">{doctor.alternatePhoneNumber || '-'}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200/50 pb-2">
              <span className="font-bold text-gray-400 uppercase text-[9px]">Licence Number</span>
              <span className="font-semibold text-gray-700 flex items-center gap-1.5"><FaIdCard className="text-[#3D3F96]" /> {doctor.licenceNumber}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200/50 pb-2">
              <span className="font-bold text-gray-400 uppercase text-[9px]">Council Name</span>
              <span className="font-semibold text-gray-700">{doctor.councilNumber || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-gray-400 uppercase text-[9px]">Registered Clinic</span>
              <span className="font-semibold text-gray-700 flex items-center gap-1.5"><FaBuilding className="text-[#3D3F96]" /> {doctor.clinicName}</span>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl">
            <span className="text-[10px] uppercase font-black text-gray-400 block mb-1">Clinic Address</span>
            <span className="font-semibold text-gray-700 flex items-start gap-1.5"><FaMapMarkerAlt className="text-rose-500 mt-0.5 shrink-0" /> {doctor.address}, {doctor.city}, {doctor.state}</span>
          </div>
        </div>

        <button onClick={onClose} className="w-full text-center py-3 rounded-2xl bg-[#3D3F96] hover:bg-[#2F3175] text-white text-xs font-black uppercase tracking-widest mt-6 transition-all">
          Close Details
        </button>
      </div>
    </div>
  );
};

// --- EDIT DOCTOR MODAL (max-w-2xl) ---
const DoctorEditModal = ({ doctor, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    name: doctor.name || '',
    email: doctor.email || '',
    specialist: doctor.specialist || '',
    experience: doctor.experience || 0,
    address: doctor.address || '',
    phoneNumber: doctor.phoneNumber || '',
    licenceNumber: doctor.licenceNumber || '',
    qualification: doctor.qualification || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl border border-gray-100 p-6 md:p-8 relative max-h-[90vh] overflow-y-auto animate-fadeIn">
        
        <button onClick={onClose} className="absolute right-6 top-6 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-gray-400 hover:text-gray-600 transition-all">
          <FaTimes />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#3D3F96] flex items-center justify-center text-lg">
            <FaPencilAlt />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-800 leading-none">Edit Dr. {doctor.name}</h3>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-1 font-black">Modify clinic registry listing details</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs font-semibold text-gray-600">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-gray-400 uppercase text-[10px]">Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="px-4 py-2.5 rounded-xl border border-gray-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#3D3F96]/10 outline-none text-gray-700 font-bold" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-gray-400 uppercase text-[10px]">Email *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className="px-4 py-2.5 rounded-xl border border-gray-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#3D3F96]/10 outline-none text-gray-700 font-bold" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-gray-400 uppercase text-[10px]">Specialization</label>
              <input type="text" name="specialist" value={formData.specialist} onChange={handleChange} className="px-4 py-2.5 rounded-xl border border-gray-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#3D3F96]/10 outline-none text-gray-700 font-bold" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-gray-400 uppercase text-[10px]">Experience (Years)</label>
              <input type="number" name="experience" value={formData.experience} onChange={handleChange} min="0" className="px-4 py-2.5 rounded-xl border border-gray-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#3D3F96]/10 outline-none text-gray-700 font-bold" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-gray-400 uppercase text-[10px]">Phone Number</label>
              <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="px-4 py-2.5 rounded-xl border border-gray-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#3D3F96]/10 outline-none text-gray-700 font-bold" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-gray-400 uppercase text-[10px]">Licence Number</label>
              <input type="text" name="licenceNumber" value={formData.licenceNumber} onChange={handleChange} className="px-4 py-2.5 rounded-xl border border-gray-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#3D3F96]/10 outline-none text-gray-700 font-bold" />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-gray-400 uppercase text-[10px]">Complete Address</label>
              <textarea name="address" value={formData.address} onChange={handleChange} rows="2" className="px-4 py-2.5 rounded-xl border border-gray-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#3D3F96]/10 outline-none text-gray-700 font-bold" />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={loading} className="px-6 py-3 rounded-xl border border-gray-100 hover:bg-slate-50 text-[10px] font-black uppercase tracking-wider text-gray-400 transition-all">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-3 rounded-xl bg-[#3D3F96] hover:bg-[#2C2E75] text-white text-[10px] font-black uppercase tracking-wider transition-all">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- MAIN DIRECTORY VIEW CONTAINER ---
export default function ClinicDoctors() {
  const router = useRouter(); // Next.js navigation hook

  const [doctors, setDoctors] = useState(INITIAL_DOCTORS);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- PAGINATION STATES ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // 5 Doctors per page

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDoctorsList = doctors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(doctors.length / itemsPerPage);

  const handleRowClick = (doctor) => {
    setSelectedDoctor(doctor);
    setShowDetailModal(true);
  };

  const handleDeleteClick = (e, doctor) => {
    e.stopPropagation();
    setSelectedDoctor(doctor);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!selectedDoctor) return;
    setLoading(true);
    
    setTimeout(() => {
      const remainingDoctorsList = doctors.filter(doc => doc._id !== selectedDoctor._id);
      setDoctors(remainingDoctorsList);
      setShowDeleteModal(false);
      setSelectedDoctor(null);
      setLoading(false);

      const updatedTotalPages = Math.ceil(remainingDoctorsList.length / itemsPerPage);
      if (currentPage > updatedTotalPages && currentPage > 1) {
        setCurrentPage(updatedTotalPages);
      }
    }, 600);
  };

  const handleEditClick = (e, doctor) => {
    e.stopPropagation();
    setSelectedDoctor(doctor);
    setShowEditModal(true);
  };

  const handleEditSubmit = (updatedData) => {
    if (!selectedDoctor) return;
    setLoading(true);

    setTimeout(() => {
      setDoctors(doctors.map(doc => 
        doc._id === selectedDoctor._id ? { ...doc, ...updatedData } : doc
      ));
      setShowEditModal(false);
      setSelectedDoctor(null);
      setLoading(false);
    }, 700);
  };

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

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-800">Clinic Doctors</h2>
          <p className="text-xs text-gray-400 mt-1">Manage directory metadata registry list. Click on any row to view complete profile files.</p>
        </div>
        
        {/* REDIRECT TO /vendors/clinic/addDoctors ON CLICK */}
        <button 
          onClick={() => router.push('/vendors/clinic/addDoctors')}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#3D3F96] hover:bg-[#2C2E75] text-white text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-lg shadow-indigo-950/10 self-start sm:self-auto"
        >
          <FaPlusCircle /> Add Doctor
        </button>
      </div>

      {/* Registry Count display banner */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Clinic Registry</span>
          <h4 className="text-xl font-black text-gray-800 mt-1">Staff Directory Table</h4>
        </div>
        <span className="inline-block px-4 py-2 rounded-2xl text-xs font-black bg-[#3D3F96]/10 text-[#3D3F96] border border-[#3D3F96]/10">
          {doctors.length} Registered Staff
        </span>
      </div>

      {/* Premium Table Layout Section */}
      <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse align-middle">
            <thead>
              <tr className="bg-slate-50/80 border-b border-gray-100 text-[10px] font-black uppercase text-gray-400 tracking-wider">
                <th className="p-4 w-20">Profile</th>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone Number</th>
                <th className="p-4">Specialization</th>
                <th className="p-4 text-center">Experience</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {currentDoctorsList.length > 0 ? (
                currentDoctorsList.map((doc) => (
                  <tr 
                    key={doc._id}
                    onClick={() => handleRowClick(doc)}
                    className="hover:bg-indigo-50/10 cursor-pointer transition-all duration-200"
                  >
                    <td className="p-4">
                      <img src={doc.image} alt={doc.name} className="w-11 h-11 rounded-xl object-cover border border-slate-100 shadow-sm" />
                    </td>
                    <td className="p-4 font-black text-gray-800">Dr. {doc.name}</td>
                    <td className="p-4 font-semibold text-gray-500">{doc.email}</td>
                    <td className="p-4 font-bold text-gray-600">{doc.phoneNumber}</td>
                    <td className="p-4">
                      <span className="inline-block px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider bg-indigo-50 text-[#3D3F96] border border-[#3D3F96]/10">
                        {doc.specialist || 'General Medicine'}
                      </span>
                    </td>
                    <td className="p-4 text-center font-extrabold text-gray-700">{doc.experience || '0'} Years</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={(e) => handleEditClick(e, doc)}
                          className="p-2.5 rounded-xl border border-gray-100 bg-white hover:bg-indigo-50 text-gray-400 hover:text-[#3D3F96] transition-all"
                          title="Edit Profile"
                        >
                          <FaPencilAlt size={12} />
                        </button>
                        <button 
                          onClick={(e) => handleDeleteClick(e, doc)}
                          className="p-2.5 rounded-xl border border-gray-100 bg-white hover:bg-rose-50 text-gray-400 hover:text-rose-500 transition-all"
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
                    <div className="mb-3"><FaUserMd className="text-indigo-400 text-3xl mx-auto" /></div>
                    <h5>No Doctors Listed</h5>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- PREMIUM PAGINATION INTERACTION CONTROLS --- */}
        {totalPages > 1 && (
          <div className="p-5 bg-slate-50/50 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400">
              Showing <strong className="text-gray-700">{indexOfFirstItem + 1} - {Math.min(indexOfLastItem, doctors.length)}</strong> of <strong className="text-gray-700">{doctors.length}</strong> Profiles
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-2 rounded-xl border border-gray-100 bg-white hover:bg-slate-50 text-gray-500 hover:text-gray-800 transition-all disabled:opacity-40"
              >
                <FaChevronLeft size={12} />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                    currentPage === i + 1 
                      ? 'bg-[#3D3F96] text-white shadow-lg shadow-indigo-950/10' 
                      : 'border border-gray-100 bg-white hover:bg-slate-50 text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-2 rounded-xl border border-gray-100 bg-white hover:bg-slate-50 text-gray-500 hover:text-gray-800 transition-all disabled:opacity-40"
              >
                <FaChevronRight size={12} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- DOCTOR DETAIL MODAL --- */}
      {showDetailModal && selectedDoctor && (
        <DoctorDetailModal 
          doctor={selectedDoctor} 
          onClose={() => { setShowDetailModal(false); setSelectedDoctor(null); }} 
        />
      )}

      {/* --- EDIT DOCTOR MODAL --- */}
      {showEditModal && selectedDoctor && (
        <DoctorEditModal 
          doctor={selectedDoctor} 
          onClose={() => { setShowEditModal(false); setSelectedDoctor(null); }} 
          onSubmit={handleEditSubmit} 
          loading={loading} 
        />
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {showDeleteModal && selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl border border-gray-100 relative animate-fadeIn text-center">
            
            <button onClick={() => setShowDeleteModal(false)} className="absolute right-6 top-6 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-gray-400 hover:text-gray-600 transition-all">
              <FaTimes />
            </button>

            <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center text-xl mx-auto mb-4 animate-bounce">
              <FaTrashAlt />
            </div>

            <h4 className="text-base font-black text-gray-800">Confirm Deletion</h4>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Are you sure you want to delete **Dr. {selectedDoctor?.name}** from the clinic roster? This directory removal cannot be undone.
            </p>

            <div className="grid grid-cols-2 gap-3.5 mt-6">
              <button type="button" onClick={() => setShowDeleteModal(false)} className="px-5 py-3 rounded-xl border border-gray-100 hover:bg-slate-50 text-xs font-black uppercase tracking-wider text-gray-400 transition-all">
                Cancel
              </button>
              <button type="button" onClick={confirmDelete} disabled={loading} className="px-5 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50">
                {loading ? 'Deleting...' : 'Delete Doctor'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}