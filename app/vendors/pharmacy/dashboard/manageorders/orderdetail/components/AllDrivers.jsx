"use client";

import React, { useState, useEffect } from 'react';
import { Truck, AlertCircle, Loader2, X, Phone, Bike, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import PharmacyAPI from '../../../../../../services/PharmacyVendorAPI';

export default function AllDrivers({
  isOpen,
  onClose,
  orderId,
  assignedDriver,
  onDriverAssigned
}) {
  const [drivers, setDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState('');

  // Fetch drivers whenever the modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchDrivers = async () => {
      setLoadingDrivers(true);
      setSelectedDriverId('');
      try {
        const res = await PharmacyAPI.getAvailableDrivers();
        if (res && res.success) {
          setDrivers(res.data || []);
        } else {
          setDrivers([]);
        }
      } catch (err) {
        console.error("Failed to fetch available drivers:", err);
        toast.error("Could not fetch available drivers.");
      } finally {
        setLoadingDrivers(false);
      }
    };

    fetchDrivers();
  }, [isOpen]);

  if (!isOpen) return null;

  // Submit assignment / reassignment
  const handleConfirmAssignment = async () => {
    if (!selectedDriverId) {
      toast.error("Please select a delivery partner.");
      return;
    }

    setSubmitting(true);
    try {
      const isReassign = Boolean(assignedDriver);

      let res;
      if (isReassign) {
        res = await PharmacyAPI.reassignDriverManual({
          orderId,
          newDriverId: selectedDriverId,
          isReturnReassignment: false
        });
      } else {
        res = await PharmacyAPI.assignDriverManual({
          orderId,
          driverId: selectedDriverId
        });
      }

      if (res && res.success) {
        toast.success(res.message || (isReassign ? "Driver reassigned successfully!" : "Driver assigned successfully!"));
        if (onDriverAssigned) onDriverAssigned();
        onClose();
      } else {
        toast.error(res?.message || "Failed to assign driver.");
      }
    } catch (err) {
      console.error("Driver assignment error:", err);
      toast.error("An error occurred while assigning driver.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#3d3f96] flex items-center justify-center font-bold">
              <Truck size={16} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm">
                {assignedDriver ? "Reassign Delivery Partner" : "Assign Delivery Partner"}
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold">
                Select an active on-duty delivery driver
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body Content */}
        {loadingDrivers ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2">
            <Loader2 className="animate-spin text-[#3d3f96]" size={28} />
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Checking Available Drivers...
            </span>
          </div>
        ) : drivers.length === 0 ? (
          <div className="py-10 text-center space-y-2 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 p-4">
            <AlertCircle size={32} className="text-amber-500 mx-auto" />
            <h4 className="text-xs font-black text-slate-700">No Drivers Currently Available</h4>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              All fleet partners linked to your pharmacy are either busy or offline.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {drivers.map((driver) => {
              const isSelected = selectedDriverId === driver._id;
              return (
                <label
                  key={driver._id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${isSelected
                      ? 'border-[#3d3f96] bg-indigo-50/50 ring-2 ring-[#3d3f96]/20'
                      : 'border-slate-200 hover:bg-slate-50'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="driverSelection"
                      value={driver._id}
                      checked={isSelected}
                      onChange={() => setSelectedDriverId(driver._id)}
                      className="accent-[#3d3f96] w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <p className="text-xs font-black text-slate-900">{driver.name}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold mt-0.5">
                        <span className="flex items-center gap-0.5">
                          <Phone size={10} /> {driver.phone}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 uppercase">
                          <Bike size={11} /> {driver.vehicleType || "Bike"} ({driver.vehicleNumber || "N/A"})
                        </span>
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#3d3f96] text-white flex items-center justify-center shrink-0">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </label>
              );
            })}
          </div>
        )}

        {/* Footer Controls */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting || !selectedDriverId}
            onClick={handleConfirmAssignment}
            className="px-4 py-2 bg-[#3d3f96] hover:bg-[#2d2f75] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            {submitting && <Loader2 size={13} className="animate-spin" />}
            <span>Confirm Assignment</span>
          </button>
        </div>

      </div>
    </div>
  );
}