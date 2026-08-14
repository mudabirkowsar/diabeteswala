"use client";

import { useState, useEffect } from "react";
import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";

/**
 * DeliveryCharges — standalone, self-contained component.
 * No Context / API dependency: all state lives locally in this file.
 * `handleSubmit` currently simulates a save (setTimeout).
 * 
 * Styling: Tailwind utility classes with custom Royal Indigo (#3D3F96) accents.
 */

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  variable: "--font-fraunces",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-sans",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-plex-mono",
});

/* ----------------------------- Inline SVG Icons (No External Deps) ----------------------------- */

function CrossIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function RouteIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="6" cy="19" r="2.2" />
      <circle cx="18" cy="5" r="2.2" />
      <path d="M7.6 17.4 16.4 6.6" strokeDasharray="2.5 3" />
    </svg>
  );
}

function PercentBadgeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <circle cx="7.5" cy="7.5" r="1.6" />
      <circle cx="16.5" cy="16.5" r="1.6" />
    </svg>
  );
}

function SpinnerIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" className="animate-spin motion-reduce:animate-none" {...props}>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12.5 9.5 17 19 7" />
    </svg>
  );
}

function AlertIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3 22 20H2Z" />
      <line x1="12" y1="9" x2="12" y2="14" />
      <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ResetIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
    </svg>
  );
}

/* ----------------------------- Default Configuration Data ----------------------------- */

const DEFAULT_CHARGES = {
  baseDeliveryCharge: 67,
  freeDeliveryThreshold: 500,
  rapidDeliveryCharge: 111,
  taxPercentage: 2,
  freeDeliveryRadius: 10,
  perKmCharge: 7,
};

const SECTIONS = [
  {
    key: "basic",
    label: "Basic Delivery Charges",
    icon: CrossIcon,
    fields: [
      {
        name: "baseDeliveryCharge",
        label: "Base Delivery Charge",
        unit: "₹",
        step: "1",
        helper: "Standard charge applied within the free radius.",
      },
      {
        name: "freeDeliveryThreshold",
        label: "Free Delivery Threshold",
        unit: "₹",
        step: "1",
        helper: "Order value above which the base charge is waived — distance charges still apply.",
      },
      {
        name: "rapidDeliveryCharge",
        label: "Rapid Delivery Charge",
        unit: "₹",
        step: "1",
        helper: "Added on top for express delivery service.",
      },
    ],
  },
  {
    key: "distance",
    label: "Distance-Based Charges",
    icon: RouteIcon,
    fields: [
      {
        name: "freeDeliveryRadius",
        label: "Free Delivery Radius",
        unit: "km",
        step: "0.1",
        helper: "Only the base charge applies inside this radius.",
      },
      {
        name: "perKmCharge",
        label: "Per Kilometre Charge",
        unit: "₹/km",
        step: "0.5",
        helper: "Charged for every km beyond the free radius, even on free-delivery orders.",
      },
    ],
  },
  {
    key: "tax",
    label: "Tax Settings",
    icon: PercentBadgeIcon,
    fields: [
      {
        name: "taxPercentage",
        label: "Tax Percentage",
        unit: "%",
        step: "0.1",
        helper: "Applied to the order subtotal at checkout.",
      },
    ],
  },
];

function toFormStrings(obj) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, String(v)]));
}

function formatUnit(unit, rawValue) {
  const num = rawValue === "" || rawValue === undefined || rawValue === null ? 0 : rawValue;
  if (unit === "₹") return `₹${num}`;
  if (unit === "km") return `${num} km`;
  if (unit === "%") return `${num}%`;
  if (unit === "₹/km") return `₹${num}/km`;
  return `${num}`;
}

/* ----------------------------- Page Shell ----------------------------- */

function DeliveryCharges() {
  return (
    <div
      className={`${fraunces.variable} ${plexSans.variable} ${plexMono.variable} font-[family-name:var(--font-plex-sans)] min-h-screen w-full flex items-center justify-center px-5 py-12 text-slate-800 [background:radial-gradient(circle_at_18%_-10%,rgba(61,63,150,0.08),transparent_45%),radial-gradient(circle_at_100%_15%,rgba(56,189,248,0.06),transparent_42%),#F1F5F9]`}
    >
      <div className="relative w-full max-w-[800px] bg-white rounded-[20px] sm:rounded-[28px] border border-gray-100 shadow-[0_1px_3px_rgba(15,23,42,0.03),0_32px_70px_-28px_rgba(15,23,42,0.18)] px-6 py-9 sm:px-16 sm:pt-14 sm:pb-16">
        
        {/* Top Decorative Pricing Badge */}
        <div className="hidden sm:block absolute top-7 right-8 font-[family-name:var(--font-plex-mono)] text-[10.5px] tracking-[0.12em] uppercase text-[#3D3F96] border border-dashed border-[#3D3F96]/40 rounded-lg px-2.5 py-1.5 rotate-[-6deg] opacity-85">
          Pricing Ledger
        </div>

        {/* Header Title Area */}
        <div className="text-center mb-11">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#3D3F96] to-[#1E1B4B] flex items-center justify-center mx-auto mb-5 font-[family-name:var(--font-fraunces)] italic font-medium text-2xl text-white shadow-[0_14px_28px_-12px_rgba(61,63,150,0.5)]">
            Rx
          </div>
          <div className="text-[12.5px] font-semibold tracking-[0.16em] uppercase text-[#3D3F96] mb-2.5">
            Operations Management
          </div>
          <h1 className="font-[family-name:var(--font-fraunces)] font-semibold text-3xl sm:text-[2.35rem] m-0 tracking-[-0.01em] text-slate-800">
            Delivery Charges
          </h1>
          <p className="text-slate-400 text-sm mt-2">Configure distance-based delivery pricing parameters</p>
        </div>

        <DeliveryChargesForm />
      </div>
    </div>
  );
}

/* ----------------------------- Main Form ----------------------------- */

function DeliveryChargesForm() {
  const [savedCharges, setSavedCharges] = useState(DEFAULT_CHARGES);
  const [formData, setFormData] = useState(toFormStrings(DEFAULT_CHARGES));
  const [isModified, setIsModified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (!justSaved) return undefined;
    const t = setTimeout(() => setJustSaved(false), 3000);
    return () => clearTimeout(t);
  }, [justSaved]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsModified(true);
    setJustSaved(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isModified) return;

    setIsSaving(true);
    // Simulated saving animation
    setTimeout(() => {
      const numericData = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [key, parseFloat(value) || 0])
      );
      setSavedCharges(numericData);
      setIsSaving(false);
      setIsModified(false);
      setJustSaved(true);
    }, 850);
  };

  const handleReset = () => {
    setFormData(toFormStrings(savedCharges));
    setIsModified(false);
    setJustSaved(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {justSaved && (
        <div className="flex gap-2.5 items-start px-4 py-3.5 rounded-xl text-[0.85rem] mb-7 bg-emerald-50 text-emerald-700 border border-emerald-100">
          <CheckIcon />
          <span>Charges updated successfully. New rates are live on checkout.</span>
        </div>
      )}

      {SECTIONS.map((section) => {
        const SectionIcon = section.icon;
        return (
          <div className="mb-10" key={section.key}>
            <div className="flex items-center gap-3 mb-[22px] pb-3.5 border-b border-gray-100">
              <span className="w-9 h-9 rounded-[10px] flex-shrink-0 bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center">
                <SectionIcon />
              </span>
              <h2 className="font-[family-name:var(--font-fraunces)] font-semibold text-xl m-0 text-slate-800">
                {section.label}
              </h2>
            </div>

            {section.fields.map((field) => (
              <div className="mb-[26px] last:mb-0" key={field.name}>
                <label htmlFor={field.name} className="block font-semibold text-[0.95rem] mb-2.5 text-gray-700">
                  {field.label}
                </label>
                <div className="relative flex">
                  <input
                    id={field.name}
                    name={field.name}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step={field.step}
                    required
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    className="w-full font-[family-name:var(--font-plex-mono)] text-[1.05rem] pr-[78px] pl-[18px] py-4 rounded-[14px] border-[1.5px] border-gray-200 bg-gray-50/50 text-slate-800 transition-colors focus:outline-none focus:border-[#3D3F96] focus:bg-white focus:ring-4 focus:ring-[#3D3F96]/15"
                  />
                  <span className="absolute right-1.5 top-1.5 bottom-1.5 flex items-center justify-center px-3.5 rounded-[10px] bg-[#3D3F96] text-white font-semibold text-[0.85rem] whitespace-nowrap">
                    {field.unit}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-3 mt-2 text-[0.82rem]">
                  <span className="text-gray-400">{field.helper}</span>
                  <span className="text-[#3D3F96] font-bold whitespace-nowrap font-[family-name:var(--font-plex-mono)]">
                    Current: {formatUnit(field.unit, savedCharges[field.name])}
                  </span>
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {/* Modern Ledger-Style Pricing Slip (Live-updated from current form inputs) */}
      <div className="my-11 px-2 pb-5">
        <div className="bg-[#F5F6FF] border border-indigo-100/80 px-7 pt-[26px] pb-6 rotate-[-0.6deg] shadow-[0_20px_44px_-24px_rgba(61,63,150,0.18)] [clip-path:polygon(0_0,100%_0,100%_92%,95%_100%,90%_92%,85%_100%,80%_92%,75%_100%,70%_92%,65%_100%,60%_92%,55%_100%,50%_92%,45%_100%,40%_92%,35%_100%,30%_92%,25%_100%,20%_92%,15%_100%,10%_92%,5%_100%,0_92%)]">
          <div className="font-[family-name:var(--font-plex-mono)] text-[11px] tracking-[0.14em] uppercase text-slate-400 text-center mb-1">
            Summary Slip
          </div>
          <div className="font-[family-name:var(--font-fraunces)] italic font-medium text-[1.15rem] text-center text-[#3D3F96] mb-4">
            Delivery Pricing
          </div>
          <hr className="border-0 border-t border-dashed border-indigo-100 mb-3.5" />

          <div className="flex items-baseline gap-2 text-[0.92rem] mb-2.5">
            <span className="whitespace-nowrap text-slate-700 font-[family-name:var(--font-plex-sans)]">
              Base delivery, within {formData.freeDeliveryRadius || 0} km
            </span>
            <span className="flex-1 border-b border-dotted border-indigo-200/60 -translate-y-1" />
            <span className="whitespace-nowrap font-semibold [font-variant-numeric:tabular-nums] text-[#3D3F96] font-[family-name:var(--font-plex-mono)]">
              ₹{formData.baseDeliveryCharge || 0}
            </span>
          </div>
          <div className="flex items-baseline gap-2 text-[0.92rem] mb-2.5">
            <span className="whitespace-nowrap text-slate-700 font-[family-name:var(--font-plex-sans)]">
              Extra, per km beyond radius
            </span>
            <span className="flex-1 border-b border-dotted border-indigo-200/60 -translate-y-1" />
            <span className="whitespace-nowrap font-semibold [font-variant-numeric:tabular-nums] text-[#3D3F96] font-[family-name:var(--font-plex-mono)]">
              ₹{formData.perKmCharge || 0}/km
            </span>
          </div>
          <div className="flex items-baseline gap-2 text-[0.92rem] mb-2.5">
            <span className="whitespace-nowrap text-slate-700 font-[family-name:var(--font-plex-sans)]">
              Base delivery free above
            </span>
            <span className="flex-1 border-b border-dotted border-indigo-200/60 -translate-y-1" />
            <span className="whitespace-nowrap font-semibold [font-variant-numeric:tabular-nums] text-[#3D3F96] font-[family-name:var(--font-plex-mono)]">
              ₹{formData.freeDeliveryThreshold || 0}
            </span>
          </div>
          <div className="flex items-baseline gap-2 text-[0.92rem] mb-2.5">
            <span className="whitespace-nowrap text-slate-700 font-[family-name:var(--font-plex-sans)]">
              Rapid delivery add-on
            </span>
            <span className="flex-1 border-b border-dotted border-indigo-200/60 -translate-y-1" />
            <span className="whitespace-nowrap font-semibold [font-variant-numeric:tabular-nums] text-[#3D3F96] font-[family-name:var(--font-plex-mono)]">
              +₹{formData.rapidDeliveryCharge || 0}
            </span>
          </div>
          <div className="flex items-baseline gap-2 text-[0.92rem] mb-2.5">
            <span className="whitespace-nowrap text-slate-700 font-[family-name:var(--font-plex-sans)]">
              Tax on subtotal
            </span>
            <span className="flex-1 border-b border-dotted border-indigo-200/60 -translate-y-1" />
            <span className="whitespace-nowrap font-semibold [font-variant-numeric:tabular-nums] text-[#3D3F96] font-[family-name:var(--font-plex-mono)]">
              {formData.taxPercentage || 0}%
            </span>
          </div>

          <div className="text-center text-xs italic text-slate-400 mt-3">
            Distance charges apply beyond the free radius on every order.
          </div>
        </div>
      </div>

      {/* Button Controls */}
      <div className="flex gap-3.5 mt-2">
        <button
          type="submit"
          disabled={isSaving || !isModified}
          className={`flex-1 flex items-center justify-center gap-2.5 px-6 py-[17px] rounded-[14px] font-semibold text-base text-white bg-gradient-to-br from-[#3D3F96] to-[#1E1B4B] shadow-[0_16px_32px_-14px_rgba(61,63,150,0.65)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_20px_38px_-14px_rgba(61,63,150,0.75)] disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none disabled:translate-y-0`}
        >
          {isSaving ? (
            <>
              <SpinnerIcon />
              Updating…
            </>
          ) : (
            "Update Charges"
          )}
        </button>

        {isModified && (
          <button
            type="button"
            onClick={handleReset}
            disabled={isSaving}
            className="flex-none flex items-center justify-center gap-2.5 px-6 py-[17px] rounded-[14px] font-semibold text-base text-slate-800 bg-white border-[1.5px] border-gray-200 transition-colors hover:border-[#3D3F96] hover:text-[#3D3F96] disabled:opacity-50 disabled:pointer-events-none"
          >
            <ResetIcon />
            Reset
          </button>
        )}
      </div>

      {isModified && (
        <div className="flex gap-2.5 items-start px-4 py-3.5 rounded-xl text-[0.85rem] mt-3.5 bg-amber-50 text-amber-700 border border-amber-200/50 animate-fadeIn">
          <AlertIcon />
          <span>You have unsaved changes. Click Update to save or Reset to discard them.</span>
        </div>
      )}
    </form>
  );
}

export default DeliveryCharges;