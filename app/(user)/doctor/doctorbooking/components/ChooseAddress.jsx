'use client';

import React, { useEffect, useState } from 'react';
import { 
  X, 
  MapPin, 
  Check, 
  Home, 
  Building2, 
  Briefcase, 
  Phone, 
  Plus, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  Navigation
} from 'lucide-react';
import UserAPI from '../../../../services/UserAPI';

export default function ChooseAddress({ isOpen, onClose, onSelectAddress, selectedAddressId }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch address list when drawer opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchAddresses = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await UserAPI.getAddressList();

        if (res && res.success && Array.isArray(res.data)) {
          setAddresses(res.data);
          
          // If no address selected yet, auto-select default address
          if (!selectedAddressId) {
            const defaultAddr = res.data.find(a => a.isDefault) || res.data[0];
            if (defaultAddr && onSelectAddress) {
              onSelectAddress(defaultAddr);
            }
          }
        } else {
          setAddresses([]);
          setError(res?.message || 'No saved addresses found.');
        }
      } catch (err) {
        console.error('Error fetching addresses:', err);
        setError(err?.response?.data?.message || 'Failed to load saved addresses.');
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [isOpen, selectedAddressId, onSelectAddress]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
      />

      {/* Right Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col justify-between transform transition-transform duration-300 ease-out animate-slideLeft">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold border border-amber-100">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Select Home Visit Address</h3>
              <p className="text-xs text-slate-400">Doctor will visit this registered location</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Address List Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3.5">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="animate-spin text-[#3d3f96]" size={32} />
              <p className="text-xs font-semibold text-slate-500">Retrieving saved addresses...</p>
            </div>
          ) : error && addresses.length === 0 ? (
            <div className="text-center py-16 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <AlertCircle size={28} className="mx-auto text-amber-500 mb-2" />
              <p className="text-xs font-bold text-slate-700">{error}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Please add a delivery address to proceed.</p>
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-16 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <MapPin size={28} className="mx-auto text-slate-400 mb-2" />
              <p className="text-xs font-bold text-slate-700">No Saved Addresses Found</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Add an address to book home consultations.</p>
            </div>
          ) : (
            addresses.map((addr) => {
              const isSelected = selectedAddressId === addr._id;
              const type = addr.addressType?.toLowerCase() || 'home';

              return (
                <div
                  key={addr._id}
                  onClick={() => {
                    onSelectAddress(addr);
                    onClose();
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-[#3d3f96] bg-indigo-50/40 ring-2 ring-[#3d3f96]/20 shadow-sm'
                      : 'border-slate-200/80 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        type === 'home' 
                          ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                      }`}>
                        {type === 'home' ? <Home size={16} /> : <Briefcase size={16} />}
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-extrabold text-slate-900 tracking-tight">{addr.name}</h4>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            {addr.addressType || 'Home'}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                              Default
                            </span>
                          )}
                        </div>

                        {/* Full Address Details */}
                        <p className="text-xs font-medium text-slate-600 leading-relaxed">
                          {[addr.houseNo, addr.sector, addr.landmark].filter(Boolean).join(', ')}
                        </p>
                        <p className="text-xs font-semibold text-slate-800">
                          {[addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}
                        </p>

                        {addr.phone && (
                          <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 pt-1">
                            <Phone size={11} className="text-slate-400" />
                            <span>+91 {addr.phone}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Radio/Check Indicator */}
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all mt-0.5 ${
                      isSelected 
                        ? 'bg-[#3d3f96] border-[#3d3f96] text-white' 
                        : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>

                  </div>
                </div>
              );
            })
          )}

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-[#3d3f96] hover:bg-slate-900 text-white py-3.5 rounded-2xl text-xs font-bold tracking-wider uppercase transition-all shadow-md shadow-indigo-100 cursor-pointer"
          >
            Confirm Selected Address
          </button>
        </div>

      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        .animate-slideLeft {
          animation: slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}