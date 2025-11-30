import React, { useState } from 'react';
import { useAppStore } from '../store';
import { validateVital } from '../utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Thermometer, Ruler, Heart, Brain, Info, CheckCircle2 } from 'lucide-react';

// --- Pediatrics Widget ---
const growthData = [
  { age: 0, weight: 3.5, p50: 3.3 },
  { age: 1, weight: 10, p50: 9.6 },
  { age: 2, weight: 12.5, p50: 12.2 },
  { age: 3, weight: 14.8, p50: 14.3 },
  { age: 4, weight: 16.5, p50: 16.3 },
  { age: 5, weight: 18.2, p50: 18.3 },
];

const PediatricsWidget: React.FC = () => {
  const [temp, setTemp] = useState(38.2);
  const [headCirc, setHeadCirc] = useState(51);

  // Validation Logic
  const tempStatus = validateVital('temperature', temp);
  
  const getStatusColor = (status: string) => {
    if (status === 'high') return 'text-alert-danger border-alert-danger/50 bg-alert-danger/5';
    if (status === 'low') return 'text-alert-warning border-alert-warning/50 bg-alert-warning/5';
    return 'text-text-primary border-transparent';
  };

  return (
    <div className="space-y-4">
      <div className="bg-surface p-5 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2 uppercase tracking-wide">
          <Activity size={16} className="text-primary" />
          WHO Growth Chart (0-5y)
        </h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growthData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="age" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} width={30} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
              />
              <Line type="monotone" dataKey="p50" stroke="#94A3B8" strokeDasharray="5 5" strokeWidth={2} dot={false} name="50th %" />
              <Line type="monotone" dataKey="weight" stroke="#0574E4" strokeWidth={3} dot={{ r: 4, fill: '#0574E4', strokeWidth: 0 }} name="Patient" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={`p-4 rounded-xl shadow-sm border transition-all ${getStatusColor(tempStatus)} ${tempStatus === 'normal' ? 'bg-surface border-gray-200' : ''}`}>
          <div className="flex justify-between items-start mb-2">
             <label className="text-[10px] font-bold opacity-70 uppercase tracking-wide">Temperature</label>
             {tempStatus === 'high' && <span className="text-[10px] font-bold bg-alert-danger text-white px-1.5 rounded">HIGH</span>}
          </div>
          <div className="flex items-end gap-2">
            <Thermometer size={20} className={tempStatus === 'high' ? "text-alert-danger" : "text-gray-400"} />
            <input 
                type="number" 
                step="0.1"
                value={temp} 
                onChange={(e) => setTemp(parseFloat(e.target.value))}
                className="w-16 font-bold text-2xl bg-transparent outline-none border-b-2 border-transparent focus:border-current p-0 leading-none" 
            />
            <span className="text-xs font-bold opacity-70 mb-1">°C</span>
          </div>
        </div>
        <div className="bg-surface p-4 rounded-xl shadow-sm border border-gray-200 transition-colors focus-within:border-primary/50">
          <label className="text-[10px] font-bold text-text-secondary block mb-2 uppercase tracking-wide">Head Circ.</label>
          <div className="flex items-end gap-2">
            <Ruler size={20} className="text-primary" />
            <input 
                type="number" 
                value={headCirc} 
                onChange={(e) => setHeadCirc(parseFloat(e.target.value))}
                className="w-16 font-bold text-2xl bg-transparent outline-none border-b-2 border-transparent focus:border-primary text-text-primary p-0 leading-none" 
            />
            <span className="text-xs font-bold text-text-secondary mb-1">cm</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Cardiology Widget ---
const CardiologyWidget: React.FC = () => {
  const [edv, setEdv] = useState(120);
  const [esv, setEsv] = useState(65);
  
  const lvef = Math.round(((edv - esv) / edv) * 100);
  
  // Severity Logic
  let severityColor = '#00875F'; // Normal
  let severityText = 'Normal Function';
  let severityBg = 'bg-alert-success/10';
  
  if (lvef < 40) {
    severityColor = '#B65644'; // Failure
    severityText = 'Heart Failure';
    severityBg = 'bg-alert-danger/10';
  } else if (lvef < 50) {
    severityColor = '#FFAB00'; // Borderline
    severityText = 'Reduced Function';
    severityBg = 'bg-alert-warning/10';
  }

  // Calculate rotation for gauge (approximate)
  // Map 0-100 to -90 to 90 deg
  const rotation = (lvef / 100) * 180 - 90;

  return (
    <div className="bg-surface p-5 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-sm font-bold text-text-primary mb-6 flex items-center gap-2 uppercase tracking-wide">
        <Heart size={16} className="text-alert-danger" />
        LVEF Calculator
      </h3>

      <div className="flex flex-col items-center justify-center mb-8 relative">
        <div className="relative w-40 h-20 overflow-hidden">
             {/* Gauge Background */}
             <div className="absolute top-0 left-0 w-40 h-40 rounded-full border-[12px] border-gray-100 box-border"></div>
             {/* Gauge Active Arc - simplified for CSS implementation */}
             <div className="absolute top-0 left-0 w-40 h-40 rounded-full border-[12px] border-transparent border-t-primary transition-all duration-700 ease-out"
                  style={{ transform: `rotate(${rotation}deg)`, borderColor: severityColor }}></div>
        </div>
        
        <div className="absolute bottom-0 flex flex-col items-center">
            <span className="text-4xl font-bold text-text-primary transition-all">{lvef}%</span>
            <div className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide mt-1 transition-colors ${severityBg}`} style={{ color: severityColor }}>
                {severityText}
            </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
             <label className="text-xs font-semibold text-text-secondary">End-Diastolic Vol (EDV)</label>
             <span className="text-xs font-bold text-primary bg-primary/10 px-1.5 rounded">{edv} mL</span>
          </div>
          <input 
            type="range" min="50" max="250" value={edv} onChange={(e) => setEdv(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <div className="flex justify-between mb-2">
             <label className="text-xs font-semibold text-text-secondary">End-Systolic Vol (ESV)</label>
             <span className="text-xs font-bold text-primary bg-primary/10 px-1.5 rounded">{esv} mL</span>
          </div>
          <input 
            type="range" min="20" max="200" value={esv} onChange={(e) => setEsv(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>
    </div>
  );
};

// --- Oncology Widget ---
const OncologyWidget: React.FC = () => {
  const [t, setT] = useState('T2');
  const [n, setN] = useState('N1');
  const [m, setM] = useState('M0');

  // Logic
  const getStage = () => {
    if (m === 'M1') return 'IV';
    if (n === 'N3') return 'IIIC';
    if (t === 'T4') return 'IIIB';
    if (t === 'T3') return 'IIIA';
    if (t === 'T2' && n === 'N1') return 'IIB';
    if (t === 'T1' && n === 'N0') return 'IA';
    return 'IIA'; // Default fallback
  };

  const stage = getStage();

  const ToggleGroup = ({ label, options, val, setVal }: any) => (
    <div className="mb-5">
      <label className="text-[10px] font-bold text-text-secondary block mb-2 uppercase tracking-wide">{label}</label>
      <div className="flex bg-gray-100 p-1 rounded-lg">
        {options.map((opt: string) => (
          <button
            key={opt}
            onClick={() => setVal(opt)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ${val === opt ? 'bg-white shadow-sm text-primary ring-1 ring-gray-200' : 'text-text-secondary hover:text-text-primary hover:bg-gray-200/50'}`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-surface p-5 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-sm font-bold text-text-primary mb-5 flex items-center gap-2 uppercase tracking-wide">
        <Activity size={16} className="text-primary" />
        TNM Staging Calc
      </h3>

      <ToggleGroup label="Tumor Size (T)" options={['T1', 'T2', 'T3', 'T4']} val={t} setVal={setT} />
      <ToggleGroup label="Regional Lymph Nodes (N)" options={['N0', 'N1', 'N2', 'N3']} val={n} setVal={setN} />
      <ToggleGroup label="Distant Metastasis (M)" options={['M0', 'M1']} val={m} setVal={setM} />

      <div className="mt-6 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-4 flex items-center justify-between shadow-sm">
        <div>
           <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Calculated Stage</p>
           <p className="text-3xl font-bold text-text-primary">Stage {stage}</p>
        </div>
        <div className="bg-white p-2 rounded-full shadow-sm">
           <Info size={24} className="text-primary" />
        </div>
      </div>
    </div>
  );
};

// --- Psychiatry Widget ---
const PsychiatryWidget: React.FC = () => {
  const [scores, setScores] = useState<number[]>(Array(9).fill(0));

  const questions = [
    "Little interest or pleasure in doing things",
    "Feeling down, depressed, or hopeless",
    "Trouble falling or staying asleep",
    "Feeling tired or having little energy",
    "Poor appetite or overeating",
    "Feeling bad about yourself",
    "Trouble concentrating on things",
    "Moving or speaking slowly/fast",
    "Thoughts that you would be better off dead"
  ];

  const toggleScore = (index: number, val: number) => {
    const newScores = [...scores];
    newScores[index] = val;
    setScores(newScores);
  };

  const total = scores.reduce((a, b) => a + b, 0);
  
  let severity = "None-Minimal";
  let colorClass = "text-alert-success";
  let bgClass = "bg-alert-success";
  
  if (total >= 5) { severity = "Mild"; colorClass = "text-alert-warning"; bgClass="bg-alert-warning"; }
  if (total >= 10) { severity = "Moderate"; colorClass = "text-alert-warning"; bgClass="bg-alert-warning"; }
  if (total >= 15) { severity = "Moderately Severe"; colorClass = "text-alert-danger"; bgClass="bg-alert-danger"; }
  if (total >= 20) { severity = "Severe"; colorClass = "text-alert-danger"; bgClass="bg-alert-danger"; }

  return (
    <div className="bg-surface p-5 rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
       <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2 uppercase tracking-wide">
        <Brain size={16} className="text-primary" />
        PHQ-9 Screener
      </h3>
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[400px]">
        {questions.map((q, idx) => (
          <div key={idx} className="flex flex-col gap-2">
             <p className="text-xs font-medium text-text-primary">{idx + 1}. {q}</p>
             <div className="flex gap-1">
               {[0, 1, 2, 3].map(val => (
                 <button 
                    key={val} 
                    onClick={() => toggleScore(idx, val)}
                    className={`flex-1 h-8 rounded text-[10px] font-bold transition-all ${
                        scores[idx] === val 
                        ? (val > 1 ? 'bg-alert-danger text-white' : 'bg-primary text-white shadow-sm') 
                        : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                    }`}
                 >
                    {val}
                 </button>
               ))}
             </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
         <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-secondary">Total Score</span>
            <span className={`text-2xl font-bold ${colorClass}`}>{total}/27</span>
         </div>
         <div className={`w-full py-2 rounded text-center text-white font-bold text-sm ${bgClass} shadow-sm transition-colors`}>
             {severity} Depression
         </div>
      </div>
    </div>
  );
};

export const ClinicalIntelligence: React.FC = () => {
  const { currentSpecialty } = useAppStore();

  const renderWidget = () => {
    switch (currentSpecialty) {
      case 'Pediatrics': return <PediatricsWidget />;
      case 'Cardiology': return <CardiologyWidget />;
      case 'Oncology': return <OncologyWidget />;
      case 'Psychiatry': return <PsychiatryWidget />;
      default: return null;
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Specialty Widget */}
      <div className="animate-in fade-in slide-in-from-right-4 duration-500">
        {renderWidget()}
      </div>

      {/* Common Module: Recent Labs or Protocols */}
      <div className="bg-surface p-5 rounded-xl shadow-sm border border-gray-200 flex-1">
        <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2 uppercase tracking-wide">
           <CheckCircle2 size={16} className="text-alert-success" />
           Suggested Protocols
        </h3>
        <ul className="space-y-3">
           <li className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-transparent hover:border-gray-300 hover:bg-white transition-all cursor-pointer group shadow-sm">
              <div className="mt-1 w-4 h-4 rounded-full border-2 border-gray-300 group-hover:border-primary transition-colors"></div>
              <div>
                <p className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">Standard Blood Panel</p>
                <p className="text-xs text-text-secondary">CBC, BMP, Lipid Profile</p>
              </div>
           </li>
           <li className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-transparent hover:border-gray-300 hover:bg-white transition-all cursor-pointer group shadow-sm">
              <div className="mt-1 w-4 h-4 rounded-full border-2 border-gray-300 group-hover:border-primary transition-colors"></div>
              <div>
                <p className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">Annual Wellness Check</p>
                <p className="text-xs text-text-secondary">Age appropriate screening</p>
              </div>
           </li>
        </ul>
      </div>
    </div>
  );
};