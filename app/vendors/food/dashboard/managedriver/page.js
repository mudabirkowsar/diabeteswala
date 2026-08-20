"use client";

import React, { useState } from 'react';

const INITIAL_DRIVERS = [
  {
    id: "@7597272101",
    name: "Aarush",
    phone: "7597272101",
    location: "Jaipur, Rajasthan",
    plate: "Rj14ca9081",
    vehicle: "Motorcycle",
    status: "Available"
  },
  {
    id: "@123456754",
    name: "you",
    phone: "6758493",
    location: "Chandigarh, chandigarh",
    plate: "hu00h543243",
    vehicle: "Motorcycle",
    status: "Busy" // New Busy status integrated
  },
  {
    id: "@1234567899",
    name: "demo",
    phone: "2345678",
    location: "Chandigarh, chandigarh",
    plate: "UP32 AB 1233",
    vehicle: "Motorcycle",
    status: "Offline"
  }
];

export default function DriversPage() {
  const [drivers, setDrivers] = useState(INITIAL_DRIVERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [editingId, setEditingId] = useState(null);

  // Form Field States
  const [formName, setFormCodeName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formAadhaar, setFormAadhaar] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('');
  const [formCountry, setFormCountry] = useState('India');
  const [formAddress, setFormAddress] = useState('');
  const [formPlate, setFormPlate] = useState('');
  const [formStatus, setFormStatus] = useState('Available');

  // File Upload states (Simulation)
  const [profileFileName, setProfileFileName] = useState('No file chosen');
  const [licenseFileName, setLicenseFileName] = useState('No file chosen');
  const [certFileName, setCertFileName] = useState('No file chosen');
  const [rcFileName, setRcFileName] = useState('No file chosen');

  // Edit Action Trigger
  const openEditModal = (driver) => {
    setModalMode('edit');
    setEditingId(driver.id);
    
    setFormCodeName(driver.name);
    setFormPhone(driver.phone);
    setFormPlate(driver.plate);
    setFormStatus(driver.status);
    
    setFormCity(driver.location.split(',')[0].trim());
    setFormState(driver.location.split(',')[1]?.trim() || '');
    setFormAddress('123 Green Glen, Near Market, Housing Sector');
    setFormAadhaar('5892-4820-1940');
    setFormPassword('******');

    setIsModalOpen(true);
  };

  // Create Action Trigger
  const openCreateModal = () => {
    setModalMode('create');
    resetForm();
    setIsModalOpen(true);
  };

  // Form Submit Handler
  const handleFormSubmit = (e) => {
    e.preventDefault();

    const locationText = `${formCity || 'Chandigarh'}, ${formState || 'chandigarh'}`;

    if (modalMode === 'create') {
      const newDriver = {
        id: `@${formPhone || Date.now()}`,
        name: formName,
        phone: formPhone || '9988776655',
        location: locationText,
        plate: formPlate.toUpperCase() || 'MH 12 AB 1234',
        vehicle: "Motorcycle",
        status: formStatus
      };
      setDrivers([...drivers, newDriver]);
    } else {
      // Edit mode submit
      setDrivers(prev => prev.map(d => 
        d.id === editingId 
          ? {
              ...d,
              name: formName,
              phone: formPhone,
              location: locationText,
              plate: formPlate.toUpperCase(),
              status: formStatus
            }
          : d
      ));
    }

    resetForm();
    setIsModalOpen(false);
  };

  const deleteDriver = (id) => {
    setDrivers(prev => prev.filter(d => d.id !== id));
  };

  const resetForm = () => {
    setFormCodeName('');
    setFormPhone('');
    setFormPassword('');
    setFormAadhaar('');
    setFormCity('');
    setFormState('');
    setFormCountry('India');
    setFormAddress('');
    setFormPlate('');
    setFormStatus('Available');
    setProfileFileName('No file chosen');
    setLicenseFileName('No file chosen');
    setCertFileName('No file chosen');
    setRcFileName('No file chosen');
    setEditingId(null);
  };

  // Map status colors cleanly
  const statusStyles = {
    Available: {
      box: 'text-emerald-600 border-emerald-100 bg-emerald-50',
      dot: 'bg-emerald-500'
    },
    Busy: {
      box: 'text-amber-600 border-amber-100 bg-amber-50',
      dot: 'bg-amber-500'
    },
    Offline: {
      box: 'text-slate-500 border-slate-200 bg-slate-100',
      dot: 'bg-slate-400'
    }
  };

  return (
    <div className="max-w-[1650px] mx-auto space-y-10 animate-fade-in py-4">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center border border-[#3D3F96]/10 flex-shrink-0">
            <DriverIcon className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Delivery Fleet Management</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Manage your pharmacy's medicine delivery and collection agents.</p>
          </div>
        </div>

        {/* Action button triggers modal */}
        <button
          onClick={openCreateModal}
          className="px-6 py-3.5 bg-[#3D3F96] hover:bg-[#3D3F96]/95 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-[#3D3F96]/10 flex items-center gap-2 self-start sm:self-auto"
        >
          <span>+</span>
          Add New Driver
        </button>
      </div>

      {/* Directory Table Grid card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase font-extrabold bg-slate-50/70 tracking-wider">
                <th className="py-5 px-6">Agent Details</th>
                <th className="py-5 px-6">Contact & Route</th>
                <th className="py-5 px-6">Vehicle Info</th>
                <th className="py-5 px-6">Live Status</th>
                <th className="py-5 px-6 text-right">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {drivers.map((driver) => {
                const styleRef = statusStyles[driver.status] || { box: 'bg-slate-100', dot: 'bg-slate-400' };
                return (
                  <tr key={driver.id} className="hover:bg-[#3D3F96]/5 transition-all duration-150 group">
                    
                    {/* Agent Details */}
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center font-bold text-sm border border-[#3D3F96]/10">
                          {getInitials(driver.name)}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-800 text-[15px]">{driver.name}</p>
                          <p className="text-xs font-semibold text-slate-400 mt-1">Driver ID: <span className="text-[#3D3F96]">{driver.id}</span></p>
                        </div>
                      </div>
                    </td>

                    {/* Contact details */}
                    <td className="py-5 px-6 space-y-1.5 text-xs font-semibold text-slate-500">
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="w-4 h-4 text-slate-400 stroke-[2]" />
                        <span className="text-slate-700">{driver.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4 text-slate-400 stroke-[2]" />
                        <span className="capitalize text-slate-500">{driver.location}</span>
                      </div>
                    </td>

                    {/* Vehicle details */}
                    <td className="py-5 px-6 space-y-1.5 text-xs font-semibold text-slate-500">
                      <span className="inline-block px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg font-bold uppercase tracking-wider">
                        {driver.plate}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <MotoIcon className="w-4 h-4 stroke-[2]" />
                        <span>{driver.vehicle}</span>
                      </div>
                    </td>

                    {/* Live Status indicator */}
                    <td className="py-5 px-6">
                      <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border ${styleRef.box}`}>
                        <span className={`w-2 h-2 rounded-full ${styleRef.dot} ${driver.status !== 'Offline' ? 'animate-pulse' : ''}`} />
                        {driver.status}
                      </span>
                    </td>

                    {/* Manage actions */}
                    <td className="py-5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(driver)}
                          className="p-2 border border-slate-200 text-slate-400 hover:text-[#3D3F96] hover:bg-[#3D3F96]/5 rounded-xl transition-all"
                          title="Edit Driver profile"
                        >
                          <EditIcon className="w-4 h-4 stroke-[2]" />
                        </button>
                        <button 
                          onClick={() => deleteDriver(driver.id)}
                          className="p-2 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          title="Remove Agent"
                        >
                          <TrashIcon className="w-4 h-4 stroke-[2]" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DRIVER REGISTRATION MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-scale-up flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center border border-[#3D3F96]/10">
                  <DriverIcon className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg uppercase tracking-tight">Register Delivery Agent</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Healthy Food Logistics Fulfillment Team</p>
                </div>
              </div>
              <button
                onClick={() => { resetForm(); setIsModalOpen(false); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus:outline-none"
              >
                <CloseIcon className="w-6 h-6 stroke-[2]" />
              </button>
            </div>

            {/* Modal Scrollable Inputs */}
            <form onSubmit={handleFormSubmit} className="p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto">
              
              {/* Profile Image upload card */}
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5">
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 bg-white">
                  <CameraIcon className="w-6 h-6 stroke-[2]" />
                </div>
                <div className="text-center sm:text-left space-y-2">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Profile Image (Required)</span>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer px-4 py-2 bg-[#00B574] hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/10">
                      Choose File
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => setProfileFileName(e.target.files[0]?.name || 'No file chosen')}
                      />
                    </label>
                    <span className="text-xs font-semibold text-slate-500 truncate max-w-xs">{profileFileName}</span>
                  </div>
                </div>
              </div>

              {/* Documents grid */}
              <div className="space-y-2">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Required Documents</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* License */}
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                    <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">License</span>
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[11px] rounded-lg transition-all">
                        Choose File
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={(e) => setLicenseFileName(e.target.files[0]?.name || 'No file chosen')}
                        />
                      </label>
                      <span className="text-[10px] text-slate-500 truncate max-w-[120px]">{licenseFileName}</span>
                    </div>
                  </div>
                  {/* Certificate */}
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                    <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Certificate</span>
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[11px] rounded-lg transition-all">
                        Choose File
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={(e) => setCertFileName(e.target.files[0]?.name || 'No file chosen')}
                        />
                      </label>
                      <span className="text-[10px] text-slate-500 truncate max-w-[120px]">{certFileName}</span>
                    </div>
                  </div>
                  {/* RC Image */}
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                    <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">RC Image</span>
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[11px] rounded-lg transition-all">
                        Choose File
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={(e) => setRcFileName(e.target.files[0]?.name || 'No file chosen')}
                        />
                      </label>
                      <span className="text-[10px] text-slate-500 truncate max-w-[120px]">{rcFileName}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">Phone Number (Unique ID)</label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="e.g. 9988776655"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/5"
                    />
                    <PhoneIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 stroke-[2]" />
                  </div>
                </div>
                {/* Full Name */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormCodeName(e.target.value)}
                      placeholder="e.g. Aarush"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/5"
                    />
                    <UserCircleIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 stroke-[2]" />
                  </div>
                </div>
                {/* Password */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">Login Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/5"
                    />
                    <LockIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 stroke-[2]" />
                  </div>
                </div>
                {/* Aadhaar */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">Aadhaar Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formAadhaar}
                      onChange={(e) => setFormAadhaar(e.target.value)}
                      placeholder="e.g. 5829-4820-1940"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/5"
                    />
                    <IdIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 stroke-[2]" />
                  </div>
                </div>
              </div>

              {/* Geographic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">City</label>
                  <input
                    type="text"
                    required
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="e.g. Jaipur"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-transparent rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">State</label>
                  <input
                    type="text"
                    required
                    value={formState}
                    onChange={(e) => setFormState(e.target.value)}
                    placeholder="e.g. Rajasthan"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-transparent rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">Country</label>
                  <input
                    type="text"
                    required
                    readOnly
                    value={formCountry}
                    className="w-full px-4 py-2.5 bg-slate-100 border border-transparent rounded-xl text-sm font-bold text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Residential Address */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">Residential Address</label>
                <textarea
                  required
                  rows={2}
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Enter full flat number, street and landmark address..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-transparent rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/5 resize-none"
                />
              </div>

              {/* Vehicle Plates & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">Vehicle Plate No.</label>
                  <input
                    type="text"
                    required
                    value={formPlate}
                    onChange={(e) => setFormPlate(e.target.value)}
                    placeholder="e.g. MH 12 AB 1234"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-transparent rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/5 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">Initial Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-transparent rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/5 cursor-pointer"
                  >
                    <option value="Available">Available</option>
                    <option value="Busy">Busy</option> {/* Busy status option */}
                    <option value="Offline">Offline</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => { resetForm(); setIsModalOpen(false); }}
                  className="px-6 py-3.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-8 py-3.5 bg-[#3D3F96] hover:bg-[#3D3F96]/95 text-white font-bold text-xs rounded-xl shadow-lg shadow-[#3D3F96]/10"
                >
                  {modalMode === 'create' ? 'Add Driver' : 'Save Changes'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Helpers
const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
};

// Clean Vector Icons (Uniform strokeWeights)

function DriverIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function PhoneIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.28-5.116-3.6-6.397-6.4l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  );
}

function MapPinIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function MotoIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.115 5.19l.319 1.913A6 6 0 008.11 10.36L9.75 12h3.878l1.64-1.64a6 6 0 001.676-3.257l.319-1.913M6.115 5.19A3 3 0 119 2.25M6.115 5.19H4.152M12 21a9 9 0 110-18 9 9 0 010 18zm0 0v-4.5m0 4.5h.008" />
    </svg>
  );
}

function EditIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  );
}

function TrashIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function CloseIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function CameraIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
    </svg>
  );
}

function LockIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

function IdIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm-1.2 6.456A4.5 4.5 0 006.18 18h5.64a4.5 4.5 0 00-3.32-2.169z" />
    </svg>
  );
}

function UserCircleIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}