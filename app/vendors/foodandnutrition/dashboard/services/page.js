"use client";

import React, { useState, useEffect } from 'react';
import { 
  FaHandHoldingMedical, 
  FaSyncAlt, 
  FaPlusCircle, 
  FaTrashAlt, 
  FaCheckCircle, 
  FaHeartbeat, 
  FaList, 
  FaTimes, 
  FaStethoscope,
  FaCheck
} from 'react-icons/fa';

// --- EXACT 4 INITIAL DUMMY SERVICES DATA ---
const INITIAL_SERVICES = [
  {
    id: "srv-1",
    name: "Neuro",
    category: "Neurology",
    addedOn: "10/30/2025",
    status: "Active",
    image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "srv-2",
    name: "Endocrinologists",
    category: "Endocrinology",
    addedOn: "10/30/2025",
    status: "Active",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "srv-3",
    name: "Gastroenterologists",
    category: "Gastroenterology",
    addedOn: "10/30/2025",
    status: "Active",
    image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "srv-4",
    name: "Heart",
    category: "Cardiology",
    addedOn: "10/30/2025",
    status: "Active",
    image: "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?auto=format&fit=crop&q=80&w=600"
  }
];

// Available specialties options for Add Modal
const AVAILABLE_SPECIALTIES = [
  { name: "Pediatrics", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600" },
  { name: "Dermatology", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=600" },
  { name: "Orthopedics", image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=600" },
  { name: "Ophthalmology", image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=600" }
];

export default function ClinicServicesPage() {
  const [mounted, setMounted] = useState(false);
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [refreshing, setRefreshing] = useState(false);

  // Modals States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // New Service Form State
  const [selectedSpecialtyName, setSelectedSpecialtyName] = useState('');
  const [customName, setCustomName] = useState('');

  const [notification, setNotification] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = (text, type = "success") => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- REFRESH HANDLER ---
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      showToast("Services & KPI stats updated!");
    }, 600);
  };

  // --- REMOVE SERVICE HANDLER ---
  const handleOpenRemoveModal = (service) => {
    setSelectedService(service);
    setShowRemoveModal(true);
  };

  const confirmRemove = () => {
    if (!selectedService) return;
    setServices(services.filter(s => s.id !== selectedService.id));
    setShowRemoveModal(false);
    setSelectedService(null);
    showToast("Specialty service removed from clinic queue", "danger");
  };

  // --- ADD SERVICE HANDLER ---
  const handleAddService = (e) => {
    e.preventDefault();
    const nameToAdd = customName || selectedSpecialtyName;
    if (!nameToAdd) {
      alert("Please choose or enter a specialty name!");
      return;
    }

    const matchedOpt = AVAILABLE_SPECIALTIES.find(opt => opt.name === nameToAdd);
    const defaultImage = matchedOpt ? matchedOpt.image : "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600";

    const newServiceObj = {
      id: `srv-${Date.now()}`,
      name: nameToAdd,
      category: nameToAdd,
      addedOn: new Date().toLocaleDateString(),
      status: "Active",
      image: defaultImage
    };

    setServices([...services, newServiceObj]);
    setShowAddModal(false);
    setSelectedSpecialtyName('');
    setCustomName('');
    showToast(`Added ${nameToAdd} to Clinic Services!`);
  };

  if (!mounted) return null;

  const activeServicesCount = services.filter(s => s.status === 'Active').length;

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

      {/* Dynamic Toast Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-2xl shadow-2xl text-xs font-black uppercase tracking-wider text-white border border-white/20 animate-fadeIn ${
          notification.type === 'danger' ? 'bg-rose-600' : 'bg-[#3D3F96]'
        }`}>
          {notification.text}
        </div>
      )}

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-800">Clinic Services & Specialists</h2>
          <p className="text-xs text-gray-400 mt-1">Manage your clinic's medical specialties, active departments, and patient offerings.</p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Refresh Button */}
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-gray-200 text-xs font-black text-gray-600 uppercase tracking-wider transition-all shadow-sm"
          >
            <FaSyncAlt className={refreshing ? "animate-spin text-[#3D3F96]" : "text-gray-400"} /> Refresh
          </button>

          {/* Add New Button */}
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#3D3F96] hover:bg-[#2C2E75] text-white text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-lg shadow-indigo-950/10"
          >
            <FaPlusCircle /> Add New Specialists
          </button>
        </div>
      </div>

      {/* --- TOP 3 KPI METRICS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* KPI 1: Total Specialists */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#3D3F96] to-[#5154b8] rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-900/10 flex items-center justify-between">
          <div>
            <h3 className="text-3xl font-black">{services.length}</h3>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mt-2 block">Total Specialists</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white text-2xl backdrop-blur-md">
            <FaHeartbeat className="animate-pulse" />
          </div>
        </div>

        {/* KPI 2: Active Services */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2rem] p-6 text-white shadow-xl shadow-emerald-900/10 flex items-center justify-between">
          <div>
            <h3 className="text-3xl font-black">{activeServicesCount}</h3>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100 mt-2 block">Active Services</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white text-2xl backdrop-blur-md">
            <FaCheckCircle />
          </div>
        </div>

        {/* KPI 3: Available Specialties */}
        <div className="relative overflow-hidden bg-gradient-to-br from-sky-500 to-indigo-600 rounded-[2rem] p-6 text-white shadow-xl shadow-sky-900/10 flex items-center justify-between">
          <div>
            <h3 className="text-3xl font-black">8</h3>
            <span className="text-[10px] font-black uppercase tracking-widest text-sky-100 mt-2 block">Available Specialties</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white text-2xl backdrop-blur-md">
            <FaList />
          </div>
        </div>

      </div>

      {/* --- MAIN SERVICES GRID CONTAINER --- */}
      <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
        
        {/* Container Banner Header */}
        <div className="p-6 md:p-8 bg-slate-50/50 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#3D3F96] flex items-center justify-center text-lg">
              <FaHandHoldingMedical />
            </div>
            <div>
              <h4 className="text-base font-black text-gray-800 leading-none">Current Specialists & Services</h4>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-1">Active medical departments in clinic</span>
            </div>
          </div>

          <span className="px-3 py-1.5 rounded-full text-xs font-black bg-[#3D3F96] text-white shadow-sm">
            {services.length} items
          </span>
        </div>

        {/* 4 Cards Grid View */}
        <div className="p-6 md:p-8">
          {services.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((item) => (
                <div 
                  key={item.id}
                  className="group bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Image Container with Zoom */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-emerald-500 text-white px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shadow-md">
                      {item.status}
                    </div>
                  </div>

                  {/* Specialty Details */}
                  <div className="p-5 border-b border-gray-50 space-y-1">
                    <h4 className="text-base font-black text-gray-800">{item.name}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Added on {item.addedOn}
                    </p>
                  </div>

                  {/* Remove Action Button */}
                  <div className="p-4 bg-slate-50/60">
                    <button 
                      onClick={() => handleOpenRemoveModal(item)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-gray-200/80 text-xs font-black uppercase tracking-wider transition-all shadow-sm"
                    >
                      <FaTrashAlt size={11} /> Remove
                    </button>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-400 font-bold">
              <FaStethoscope className="text-gray-300 text-4xl mx-auto mb-3" />
              <h5 className="text-base text-gray-700 font-black">No Active Services Found</h5>
              <p className="text-xs text-gray-400 mt-1">Click "Add New Specialists" above to list medical services.</p>
            </div>
          )}
        </div>

      </div>

      {/* --- ADD NEW SPECIALIST MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-lg p-6 md:p-8 shadow-2xl border border-gray-100 relative animate-fadeIn">
            
            <button onClick={() => setShowAddModal(false)} className="absolute right-6 top-6 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-gray-400 hover:text-gray-600 transition-all">
              <FaTimes />
            </button>

            <div className="mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#3D3F96] flex items-center justify-center text-lg">
                <FaPlusCircle />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-800 leading-none">Add New Specialist</h3>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-1">Select from available clinic specialties</span>
              </div>
            </div>

            <form onSubmit={handleAddService} className="space-y-4 text-xs font-semibold text-gray-600">
              
              {/* Select Preset Specialty */}
              <div className="flex flex-col gap-1.5">
                <label className="uppercase text-[10px] text-gray-400 font-bold">Choose Available Specialty *</label>
                <select
                  value={selectedSpecialtyName}
                  onChange={(e) => {
                    setSelectedSpecialtyName(e.target.value);
                    setCustomName('');
                  }}
                  className="px-4 py-3 rounded-xl border border-gray-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#3D3F96]/10 outline-none text-gray-800 font-bold transition-all"
                >
                  <option value="">Select a specialty...</option>
                  {AVAILABLE_SPECIALTIES.map((opt, i) => (
                    <option key={i} value={opt.name}>{opt.name}</option>
                  ))}
                </select>
              </div>

              {/* Or enter custom name */}
              <div className="flex flex-col gap-1.5">
                <label className="uppercase text-[10px] text-gray-400 font-bold">Or Enter Custom Specialty Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Oncology, Nephrology"
                  value={customName} 
                  onChange={(e) => {
                    setCustomName(e.target.value);
                    setSelectedSpecialtyName('');
                  }} 
                  className="px-4 py-3 rounded-xl border border-gray-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#3D3F96]/10 outline-none text-gray-800 font-bold transition-all"
                />
              </div>

              {/* Modal Control Buttons */}
              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)} 
                  className="px-5 py-2.5 rounded-xl border border-gray-100 hover:bg-slate-50 text-[10px] font-black uppercase tracking-wider text-gray-400 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={!selectedSpecialtyName && !customName}
                  className="px-5 py-2.5 rounded-xl bg-[#3D3F96] hover:bg-[#2C2D75] text-white text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-40"
                >
                  Add Specialty
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* --- REMOVE CONFIRMATION MODAL --- */}
      {showRemoveModal && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-6 md:p-8 shadow-2xl border border-gray-100 relative animate-fadeIn text-center">
            
            <button onClick={() => setShowRemoveModal(false)} className="absolute right-6 top-6 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-gray-400 hover:text-gray-600 transition-all">
              <FaTimes />
            </button>

            <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center text-xl mx-auto mb-4 animate-bounce">
              <FaTrashAlt />
            </div>

            <h4 className="text-base font-black text-gray-800">Remove Specialty Service?</h4>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Are you sure you want to remove **{selectedService?.name}** from active clinic offerings?
            </p>

            <div className="grid grid-cols-2 gap-3.5 mt-6">
              <button 
                type="button" 
                onClick={() => setShowRemoveModal(false)} 
                className="px-5 py-3 rounded-xl border border-gray-100 hover:bg-slate-50 text-xs font-black uppercase tracking-wider text-gray-400 transition-all"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={confirmRemove} 
                className="px-5 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-black uppercase tracking-wider transition-all"
              >
                Confirm Remove
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}