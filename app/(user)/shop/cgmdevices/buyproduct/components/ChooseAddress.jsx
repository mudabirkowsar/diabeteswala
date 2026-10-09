'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Home,
  Briefcase,
  CheckCircle2,
  PlusCircle,
  Loader2,
  Plus
} from 'lucide-react';
import UserAPI from '../../../../../services/UserAPI';

export default function ChooseAddress({
  selectedAddress,
  onAddressSelect,
  showNotification
}) {
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNewAddressSelected, setIsNewAddressSelected] = useState(false);

  const [customAddress, setCustomAddress] = useState({
    name: '',
    phone: '',
    houseNo: '',
    sector: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    addressType: 'Home'
  });

  // Fetch saved addresses on mount
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setLoading(true);
        const res = await UserAPI.getAddressList();
        if (res && res.data && Array.isArray(res.data)) {
          setSavedAddresses(res.data);
          const defaultAddr = res.data.find((a) => a.isDefault) || res.data[0];
          if (defaultAddr) {
            onAddressSelect({
              name: defaultAddr.name,
              phone: defaultAddr.phone,
              houseNo: defaultAddr.houseNo,
              sector: defaultAddr.sector || '',
              landmark: defaultAddr.landmark || '',
              city: defaultAddr.city,
              state: defaultAddr.state,
              pincode: defaultAddr.pincode,
              addressType: defaultAddr.addressType || 'Home',
              _id: defaultAddr._id
            });
            setIsNewAddressSelected(false);
          } else {
            setIsNewAddressSelected(true);
          }
        } else {
          setIsNewAddressSelected(true);
        }
      } catch (err) {
        console.error('Error fetching address list:', err);
        setIsNewAddressSelected(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  const handleSelectSaved = (addr) => {
    setIsNewAddressSelected(false);
    onAddressSelect({
      name: addr.name,
      phone: addr.phone,
      houseNo: addr.houseNo,
      sector: addr.sector || '',
      landmark: addr.landmark || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      addressType: addr.addressType || 'Home',
      _id: addr._id
    });
  };

  const handleCustomFieldChange = (field, value) => {
    const updated = { ...customAddress, [field]: value };
    setCustomAddress(updated);
    onAddressSelect(updated);
  };

  const handleChooseNew = () => {
    setIsNewAddressSelected(true);
    onAddressSelect(customAddress);
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-slate-200/80 shadow-xs space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between pb-1.5 sm:pb-2 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <MapPin size={16} className="text-[#3d3f96]" />
          <h3 className="text-xs sm:text-base font-extrabold text-slate-900">
            Delivery Address
          </h3>
        </div>
        <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">Free express courier</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6 gap-2 text-slate-400 text-xs">
          <Loader2 size={16} className="animate-spin text-[#3d3f96]" />
          <span>Loading saved addresses...</span>
        </div>
      ) : (
        <>
          {/* Saved Addresses List */}
          {savedAddresses.length > 0 && (
            <div className="space-y-2">
              <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Select from Saved Addresses
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {savedAddresses.map((addr) => {
                  const isSelected = !isNewAddressSelected && selectedAddress?._id === addr._id;
                  return (
                    <div
                      key={addr._id}
                      onClick={() => handleSelectSaved(addr)}
                      className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-[#3d3f96] bg-indigo-50/40 ring-1 ring-[#3d3f96]'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] sm:text-xs font-extrabold text-slate-900 flex items-center gap-1 truncate">
                          {addr.addressType === 'Work' ? <Briefcase size={12} /> : <Home size={12} />}
                          {addr.name}
                        </span>
                        {isSelected && <CheckCircle2 size={15} className="text-[#3d3f96] shrink-0" />}
                      </div>

                      <p className="text-[10px] sm:text-[11px] text-slate-500 leading-snug line-clamp-2">
                        {addr.houseNo}, {addr.sector && `${addr.sector}, `}
                        {addr.landmark && `${addr.landmark}, `}
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>

                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 block mt-1">
                        Ph: {addr.phone}
                      </span>
                    </div>
                  );
                })}

                {/* Add New Address Card */}
                <div
                  onClick={handleChooseNew}
                  className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center gap-1 min-h-[75px] sm:min-h-[90px] ${
                    isNewAddressSelected
                      ? 'border-[#3d3f96] bg-indigo-50/40 ring-1 ring-[#3d3f96]'
                      : 'border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/50'
                  }`}
                >
                  <PlusCircle size={16} className="text-[#3d3f96]" />
                  <span className="text-[11px] sm:text-xs font-bold text-slate-800">
                    Use Another / New Address
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* New / Custom Address Form */}
          {(isNewAddressSelected || savedAddresses.length === 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mudabir Kowser"
                  value={customAddress.name}
                  onChange={(e) => handleCustomFieldChange('name', e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3d3f96]"
                />
              </div>

              <div>
                <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={customAddress.phone}
                  onChange={(e) => handleCustomFieldChange('phone', e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3d3f96]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                  House / Flat / Street *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Flat 402, Green Valley"
                  value={customAddress.houseNo}
                  onChange={(e) => handleCustomFieldChange('houseNo', e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3d3f96]"
                />
              </div>

              <div>
                <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                  Sector / Area
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sector 62"
                  value={customAddress.sector}
                  onChange={(e) => handleCustomFieldChange('sector', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3d3f96]"
                />
              </div>

              <div>
                <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                  Landmark
                </label>
                <input
                  type="text"
                  placeholder="e.g. Near City Hospital"
                  value={customAddress.landmark}
                  onChange={(e) => handleCustomFieldChange('landmark', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3d3f96]"
                />
              </div>

              <div>
                <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                  City *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mohali"
                  value={customAddress.city}
                  onChange={(e) => handleCustomFieldChange('city', e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3d3f96]"
                />
              </div>

              <div>
                <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                  State *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Punjab"
                  value={customAddress.state}
                  onChange={(e) => handleCustomFieldChange('state', e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3d3f96]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                  Pincode *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 160062"
                  value={customAddress.pincode}
                  onChange={(e) => handleCustomFieldChange('pincode', e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3d3f96]"
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}