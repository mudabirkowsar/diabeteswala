"use client";
import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, 
  Activity, 
  Info, 
  X, 
  Plus, 
  Loader2, 
  CheckCircle2, 
  Dna, 
  ClipboardList,
  Save,
  Circle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNotification } from '../../../../context/NotificationContext';
import UserAPI from '../../../../services/UserAPI';

function FamilyHistoryAndAll() {
  const { showNotification } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);

  // --- Master Data (Simulating data coming from Admin Panel) ---
  // In a real app, you might fetch these from a 'UserAPI.getMasterData()' call
  const masterDiseases = ["Type 2 Diabetes", "Hypertension", "Obesity", "High Cholesterol", "Thyroid", "Heart Disease"];
  const masterConditions = ["Prediabetes", "PCOS", "Fatty Liver", "Sleep Apnea", "Anemia", "Gestational Diabetes"];
  const masterAllergies = ["Penicillin", "Aspirin", "Sulfa Drugs", "NSAIDs", "Lactose", "Gluten"];

  // --- User State Management ---
  const [familyHistory, setFamilyHistory] = useState({ 
    diseases: [], 
    notes: '' 
  });
  const [medicalConditions, setMedicalConditions] = useState({ 
    conditions: [], 
    allergies: [] 
  });

  // 1. Fetch Data on Mount
  const fetchMedicalData = async () => {
    try {
      setLoading(true);
      const [histRes, profRes] = await Promise.all([
        UserAPI.getFamilyHistory(),
        UserAPI.getUserProfile()
      ]);

      if (histRes.success && histRes.data) {
        setFamilyHistory({
          diseases: histRes.data.diseases || [],
          notes: histRes.data.notes || ''
        });
      }

      if (profRes.success && profRes.data) {
        setMedicalConditions({
          conditions: profRes.data.conditionStatus?.addedConditions || [],
          allergies: profRes.data.conditionStatus?.addedAllergies || []
        });
      }
    } catch (err) {
      showNotification("Failed to load medical records", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicalData();
  }, []);

  // 2. Toggle Logic (True/False selection)
  const toggleItem = (currentList, item, setter, stateKey, subKey) => {
    const list = [...currentList];
    const index = list.indexOf(item);
    
    if (index > -1) {
      list.splice(index, 1); // Remove (False)
    } else {
      list.push(item); // Add (True)
    }

    setter(prev => ({
      ...prev,
      [subKey]: list
    }));
  };

  // 3. Handle Global Sync
  const handleSyncRecords = async () => {
    try {
      setBtnLoading(true);
      const [res1, res2] = await Promise.all([
        UserAPI.updateFamilyHistory(familyHistory),
        UserAPI.updateMedicalConditions(medicalConditions)
      ]);

      if (res1.success && res2.success) {
        showNotification("Medical records synchronized successfully", "success");
      }
    } catch (err) {
      showNotification("Failed to update records", "error");
    } finally {
      setBtnLoading(false);
    }
  };

  if (loading) return (
    <div className="p-20 flex flex-col items-center justify-center gap-4 bg-white">
      <Loader2 className="animate-spin text-[#3d3f96]" size={40} />
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Accessing Clinical Vault...</p>
    </div>
  );

  return (
    <div className="max-w-[1200px] mx-auto p-6 lg:p-10 antialiased">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-[#3d3f96] px-3 py-1 rounded-full border border-blue-100 mb-2">
            <ClipboardList size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Clinical Selection</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Medical & <span className="text-[#3d3f96]">Family History</span>
          </h1>
          <p className="text-sm font-medium text-slate-500">Select applicable conditions from the lists below</p>
        </div>

        <button 
          onClick={handleSyncRecords}
          disabled={btnLoading}
          className="flex items-center justify-center gap-3 bg-[#3d3f96] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-[#2d2f75] transition-all active:scale-95 disabled:opacity-50"
        >
          {btnLoading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Sync All Records</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* --- LEFT: FAMILY HISTORY --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-8"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-indigo-50 p-3 rounded-2xl text-[#3d3f96]">
              <Dna size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Genetic Profile</h3>
          </div>

          <SelectionGrid 
            label="Family Diseases" 
            masterList={masterDiseases}
            selectedItems={familyHistory.diseases}
            onToggle={(item) => toggleItem(familyHistory.diseases, item, setFamilyHistory, 'familyHistory', 'diseases')}
          />

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Detailed Genetic Notes</label>
            <textarea 
              value={familyHistory.notes}
              onChange={(e) => setFamilyHistory({...familyHistory, notes: e.target.value})}
              className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-medium outline-none focus:border-[#3d3f96] transition-all h-32 resize-none"
              placeholder="Provide details about family members' health history..."
            />
          </div>
        </motion.div>

        {/* --- RIGHT: PERSONAL CONDITIONS --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-8"
        >
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="bg-red-50 p-3 rounded-2xl text-red-500">
                <HeartPulse size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Personal Health</h3>
            </div>

            <SelectionGrid 
              label="Current Conditions" 
              masterList={masterConditions}
              selectedItems={medicalConditions.conditions}
              onToggle={(item) => toggleItem(medicalConditions.conditions, item, setMedicalConditions, 'medicalConditions', 'conditions')}
            />

            <SelectionGrid 
              label="Known Drug Allergies" 
              masterList={masterAllergies}
              selectedItems={medicalConditions.allergies}
              onToggle={(item) => toggleItem(medicalConditions.allergies, item, setMedicalConditions, 'medicalConditions', 'allergies')}
            />
          </div>

          {/* Info Box */}
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 p-6 opacity-10">
                <Activity size={80} />
            </div>
            <div className="relative z-10 flex items-start gap-4">
                <div className="bg-white/10 p-2 rounded-lg text-blue-400">
                    <Info size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-sm mb-1 uppercase tracking-wide">Selection Guide</h4>
                    <p className="text-xs text-blue-100/60 leading-relaxed">
                        Simply click on the conditions that apply to you. Selected items will be highlighted in blue. If a condition is not listed, you can add it in the notes section.
                    </p>
                </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

// --- REUSABLE SELECTION GRID COMPONENT ---
const SelectionGrid = ({ label, masterList = [], selectedItems = [], onToggle }) => {
  return (
    <div className="space-y-4">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      
      <div className="grid grid-cols-2 gap-3">
        {masterList.map((item) => {
          const isSelected = selectedItems.includes(item);
          return (
            <button
              key={item}
              type="button"
              onClick={() => onToggle(item)}
              className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                isSelected 
                ? 'bg-blue-50 border-[#3d3f96] text-[#3d3f96] shadow-md shadow-blue-100' 
                : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
              }`}
            >
              <span className="text-xs font-bold">{item}</span>
              {isSelected ? (
                <CheckCircle2 size={16} className="shrink-0" />
              ) : (
                <Circle size={16} className="shrink-0 opacity-20" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FamilyHistoryAndAll;