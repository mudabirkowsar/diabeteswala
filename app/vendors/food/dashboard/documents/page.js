"use client";

import React, { useState } from 'react';

const INITIAL_DOCUMENTS = [
  {
    id: "DOC-FSSAI",
    name: "FSSAI Food License",
    description: "Mandatory 14-digit central/state food safety license registration.",
    fileName: "fssai_license_2026.pdf",
    expiryDate: "12/10/2026",
    status: "Approved", // "Approved", "Pending", "Rejected"
    isActive: true, // Can only toggle if "Approved"
    licenseNumber: "10021011000124"
  },
  {
    id: "DOC-GSTIN",
    name: "GSTIN Certificate",
    description: "Goods and Services Tax identification certificate for business taxation.",
    fileName: "gst_certificate_signed.pdf",
    expiryDate: "No Expiry",
    status: "Approved",
    isActive: true,
    licenseNumber: "07AAAAA1111A1Z1"
  },
  {
    id: "DOC-PAN",
    name: "Business PAN Card",
    description: "Permanent Account Number card registered under the business entity.",
    fileName: "pan_card_corp.pdf",
    expiryDate: "No Expiry",
    status: "Pending", // Awaiting Admin Approval
    isActive: false,
    licenseNumber: "ABCDE1234F"
  },
  {
    id: "DOC-HEALTH",
    name: "Kitchen Health & Sanitation Audit",
    description: "Annual municipal department health and clean kitchen verification certificate.",
    fileName: "sanitation_clearance.pdf",
    expiryDate: "28/02/2026",
    status: "Rejected", // Needs update
    isActive: false,
    licenseNumber: "SAN-94820-2025"
  }
];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [selectedDoc, setSelectedDoc] = useState(null);
  
  // Modal Edit Inputs
  const [uploadFile, setUploadFile] = useState(null);
  const [licenseNumInput, setLicenseNumInput] = useState('');
  const [expiryInput, setExpiryInput] = useState(''); // Corrected state setter naming conflict

  // Handle live toggle activation (Only allowed if Approved)
  const handleToggleActivation = (id) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === id && doc.status === "Approved") {
        return { ...doc, isActive: !doc.isActive };
      }
      return doc;
    }));
  };

  // Open Update Modal
  const openUpdateModal = (doc) => {
    setSelectedDoc(doc);
    setLicenseNumInput(doc.licenseNumber);
    setExpiryInput(doc.expiryDate === "No Expiry" ? "" : doc.expiryDate);
    setUploadFile(null);
  };

  // Handle Form Submission (Submits to Admin)
  const handleDocumentSubmit = (e) => {
    e.preventDefault();
    if (!selectedDoc) return;

    setDocuments(prev => prev.map(doc => {
      if (doc.id === selectedDoc.id) {
        return {
          ...doc,
          fileName: uploadFile ? uploadFile.name : doc.fileName,
          licenseNumber: licenseNumInput,
          expiryDate: expiryInput || "No Expiry",
          status: "Pending", // State automatically resets to Pending Admin Approval
          isActive: false // Lock activation switch until admin approves
        };
      }
      return doc;
    }));

    setSelectedDoc(null);
  };

  // Status Badge styles
  const statusStyles = {
    Approved: {
      box: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      dot: 'bg-emerald-500',
      label: 'Approved'
    },
    Pending: {
      box: 'bg-amber-50 text-amber-700 border-amber-100',
      dot: 'bg-amber-500',
      label: 'Pending Admin Approval'
    },
    Rejected: {
      box: 'bg-rose-50 text-rose-700 border-rose-100',
      dot: 'bg-rose-500',
      label: 'Action Required / Rejected'
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-fade-in py-4">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center border border-[#3D3F96]/10 flex-shrink-0">
            <ShieldIcon className="w-7 h-7 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Business Verification</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Upload and manage statutory food licenses. Document changes undergo admin verification.</p>
          </div>
        </div>
      </div>

      {/* Documents Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documents.map((doc) => {
          const style = statusStyles[doc.status] || { box: 'bg-slate-100', dot: 'bg-slate-400', label: 'Unknown' };
          const isInteractable = doc.status === "Approved";

          return (
            <div 
              key={doc.id}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200"
            >
              <div className="space-y-4">
                {/* Top status bar */}
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-slate-900 text-[17px] leading-snug">{doc.name}</h3>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">{doc.description}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border flex-shrink-0 ${style.box}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${style.dot} ${doc.status === 'Pending' ? 'animate-pulse' : ''}`} />
                    {style.label}
                  </span>
                </div>

                {/* Document Metadata Details */}
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 text-xs font-semibold text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">License Number</span>
                    <span className="text-slate-800 uppercase font-bold">{doc.licenseNumber || 'Not Provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Attached File</span>
                    <span className="text-[#3D3F96] underline truncate max-w-[200px] flex items-center gap-1.5 cursor-pointer">
                      <PaperclipIcon className="w-3.5 h-3.5 stroke-[2]" />
                      {doc.fileName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Validity Expiry</span>
                    <span className="text-slate-800">{doc.expiryDate}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Control Bar */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                {/* Upload / Edit Button */}
                <button
                  onClick={() => openUpdateModal(doc)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:text-[#3D3F96] hover:bg-[#3D3F96]/5 rounded-xl font-bold text-xs transition-all flex items-center gap-2"
                >
                  <EditIcon className="w-4 h-4 stroke-[2]" />
                  Upload Update
                </button>

                {/* Activation Toggle Switch */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active</span>
                  <label className={`relative inline-flex items-center ${isInteractable ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}`}>
                    <input 
                      type="checkbox" 
                      disabled={!isInteractable}
                      checked={doc.isActive} 
                      onChange={() => handleToggleActivation(doc.id)}
                      className="sr-only peer" 
                    />
                    <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3D3F96]" />
                  </label>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* UPDATE DOCUMENT MODAL OVERLAY */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg uppercase tracking-tight">Update Business Document</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedDoc.name}</p>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus:outline-none"
              >
                <CloseIcon className="w-5 h-5 stroke-[2]" />
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleDocumentSubmit} className="space-y-5">
              
              {/* File Dropzone Simulator */}
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center mx-auto mb-1">
                  <UploadIcon className="w-5 h-5 stroke-[2]" />
                </div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Choose PDF / Image Certificate</span>
                <div className="pt-2 flex items-center justify-center gap-3">
                  <label className="cursor-pointer px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all">
                    Browse File
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => setUploadFile(e.target.files[0] || null)}
                    />
                  </label>
                  <span className="text-xs font-semibold text-slate-500 truncate max-w-[150px]">
                    {uploadFile ? uploadFile.name : selectedDoc.fileName}
                  </span>
                </div>
              </div>

              {/* License / Registration Number */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Document Registration Number</label>
                <input
                  type="text"
                  required
                  value={licenseNumInput}
                  onChange={(e) => setLicenseNumInput(e.target.value)}
                  placeholder="e.g. 10021011000124"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/5 uppercase"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Expiry Date (Leave blank if non-expiring)</label>
                <input
                  type="text"
                  value={expiryInput}
                  onChange={(e) => setExpiryInput(e.target.value)}
                  placeholder="e.g. 12/10/2026"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/5"
                />
              </div>

              {/* Warning Descriptor */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-100 flex gap-2.5 text-[11px] text-amber-700 font-semibold leading-relaxed">
                <WarningIcon className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />
                <p>Uploading launches an admin review session. Store validation will temporarily pause for this document.</p>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedDoc(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#3D3F96] hover:bg-[#3D3F96]/95 text-white font-bold text-xs rounded-xl shadow-lg shadow-[#3D3F96]/10 flex items-center gap-1.5"
                >
                  <UploadIcon className="w-4 h-4 stroke-[2]" />
                  Submit for Approval
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Icons

function ShieldIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.959 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.105-2.59-.308-3.83A11.959 11.959 0 0112 2.714z" />
    </svg>
  );
}

function PaperclipIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.75m-3.535-3.536L15.9 14.14a5 5 0 00-7.072-7.07l-3.535 3.536a5 5 0 007.072 7.072l3.535-3.536" />
    </svg>
  );
}

function EditIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  );
}

function CloseIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function UploadIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

function WarningIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}