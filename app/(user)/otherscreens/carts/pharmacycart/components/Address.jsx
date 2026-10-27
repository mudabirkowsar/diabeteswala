// components/Address.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, CheckCircle2, Loader2, Plus, ArrowLeft } from 'lucide-react';
import UserAPI from '../../../../../services/UserAPI';

export default function Address({ isOpen, onClose, selectedAddressId, onSelectAddress }) {
  const [addressList, setAddressList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    houseNo: "",
    sector: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    addressType: "Home"
  });

  useEffect(() => {
    if (!isOpen) return;
    setIsAddingNew(false);
    setFormError("");
    const fetchList = async () => {
      setLoading(true);
      try {
        const res = await UserAPI.getAddressList();
        if (res && res.success) {
          setAddressList(res.data || []);
        }
      } catch (err) {
        console.error("Failed to load address list:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUseCustomAddress = (e) => {
    e.preventDefault();
    setFormError("");

    if (
      !formData.name.trim() ||
      !formData.phone.trim() ||
      !formData.houseNo.trim() ||
      !formData.city.trim() ||
      !formData.state.trim() ||
      !formData.pincode.trim()
    ) {
      setFormError("Please fill in all mandatory fields (*)");
      return;
    }

    const tempAddress = {
      _id: `temp_${Date.now()}`,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      houseNo: formData.houseNo.trim(),
      sector: formData.sector.trim(),
      landmark: formData.landmark.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      pincode: formData.pincode.trim(),
      addressType: formData.addressType || "Other",
      isTemporary: true
    };

    onSelectAddress(tempAddress);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-lg w-full relative z-10 shadow-2xl border border-slate-100 max-h-[88vh] flex flex-col text-left"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-black text-xs sm:text-sm uppercase tracking-wider">
            {isAddingNew ? (
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="inline-flex items-center gap-1 text-[#3d3f96] hover:underline cursor-pointer mr-1"
              >
                <ArrowLeft size={16} />
              </button>
            ) : (
              <MapPin size={17} className="text-[#3d3f96]" />
            )}
            <span>{isAddingNew ? "Enter Delivery Address" : "Select Delivery Destination"}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 text-xs">
          <AnimatePresence mode="wait">
            {!isAddingNew ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-3"
              >
                {/* Button to Switch to Add Form */}
                <button
                  type="button"
                  onClick={() => setIsAddingNew(true)}
                  className="w-full py-2.5 px-3 border-2 border-dashed border-[#3d3f96]/30 hover:border-[#3d3f96] bg-[#3d3f96]/5 hover:bg-[#3d3f96]/10 text-[#3d3f96] rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Plus size={15} /> Add New / Temporary Address
                </button>

                {loading ? (
                  <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin text-[#3d3f96]" />
                    <span className="text-xs font-bold">Loading addresses...</span>
                  </div>
                ) : addressList.length > 0 ? (
                  addressList.map((addr) => {
                    const isSelected = selectedAddressId === addr._id;
                    return (
                      <div
                        key={addr._id}
                        onClick={() => onSelectAddress(addr)}
                        className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                          isSelected
                            ? "border-[#3d3f96] bg-[#3d3f96]/5 ring-2 ring-[#3d3f96]/20"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                              {addr.addressType || "Home"}
                            </span>
                            <h4 className="text-xs font-black text-slate-900">{addr.name}</h4>
                          </div>
                          <p className="text-[11px] font-medium text-slate-600 leading-relaxed">
                            {addr.houseNo}, {addr.sector && `${addr.sector}, `}
                            {addr.landmark && `Near ${addr.landmark}, `}
                            {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400">Phone: {addr.phone}</p>
                        </div>
                        {isSelected && <CheckCircle2 size={18} className="text-[#3d3f96] shrink-0 mt-0.5" />}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs font-bold text-slate-400 text-center py-6">
                    No saved addresses found. Add one above.
                  </p>
                )}
              </motion.div>
            ) : (
              /* Inline Add Address Form */
              <motion.form
                key="form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleUseCustomAddress}
                className="space-y-3"
              >
                {formError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 font-bold text-[11px]">
                    {formError}
                  </div>
                )}

                {/* Recipient Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="10-digit number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96]"
                    />
                  </div>
                </div>

                {/* House & Street */}
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                    House / Flat No / Building *
                  </label>
                  <input
                    type="text"
                    name="houseNo"
                    placeholder="e.g. Flat 402, Block B, Sunshine Heights"
                    value={formData.houseNo}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96]"
                  />
                </div>

                {/* Area & Landmark */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                      Sector / Area (Optional)
                    </label>
                    <input
                      type="text"
                      name="sector"
                      placeholder="e.g. Sector 62"
                      value={formData.sector}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      name="landmark"
                      placeholder="e.g. Near City Hospital"
                      value={formData.landmark}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96]"
                    />
                  </div>
                </div>

                {/* City, State & Pincode */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      placeholder="State"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      placeholder="Pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96]"
                    />
                  </div>
                </div>

                {/* Address Type Tag */}
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1.5">
                    Save Address As
                  </label>
                  <div className="flex gap-2">
                    {["Home", "Work", "Other"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, addressType: type }))}
                        className={`px-3 py-1.5 rounded-lg border text-[11px] font-black transition-all cursor-pointer ${
                          formData.addressType === type
                            ? "bg-[#3d3f96] text-white border-[#3d3f96]"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-black text-xs transition-all cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 bg-[#3d3f96] hover:bg-[#2d2f75] text-white py-3 rounded-xl font-black text-xs shadow-md shadow-indigo-100 transition-all cursor-pointer"
                  >
                    Use This Address
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}