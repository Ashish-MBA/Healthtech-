import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { generateSoapTemplate, searchICD10 } from '../utils';
import { ICDCode } from '../types';
import { Sparkles, Save, Send, Beaker, AlertTriangle, Check, Undo2, Redo2, Printer, Search as SearchIcon, X } from 'lucide-react';

// Simple Toast Component
const Toast = ({ message, type = 'success' }: { message: string, type?: 'success' | 'info' }) => (
  <div className={`absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium z-50 animate-in slide-in-from-bottom-5 fade-in ${type === 'success' ? 'bg-gray-900' : 'bg-primary'}`}>
    {type === 'success' ? <Check size={16} className="text-alert-success" /> : <Beaker size={16} />}
    {message}
  </div>
);

export const SmartSoap: React.FC = () => {
  const { 
    soapNote, setSoapNote, pushToHistory, undo, redo, 
    interactions, dismissInteraction, 
    isSaving, setIsSaving, lastSaved,
    currentSpecialty, currentPatient, addAuditLog
  } = useAppStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const [overrideId, setOverrideId] = useState<string | null>(null);
  const [overrideReason, setOverrideReason] = useState('');
  const [toast, setToast] = useState<{msg: string, type: 'success'|'info'} | null>(null);
  
  // ICD Search State
  const [icdQuery, setIcdQuery] = useState('');
  const [icdResults, setIcdResults] = useState<ICDCode[]>([]);
  const [isSearchingICD, setIsSearchingICD] = useState(false);
  const [showICD, setShowICD] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [soapNote]);

  // Autosave Timer
  useEffect(() => {
    const timer = setInterval(() => {
      if (soapNote && !isSaving) {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 800);
      }
    }, 10000); // 10 seconds
    return () => clearInterval(timer);
  }, [soapNote, isSaving]);

  const showToast = (msg: string, type: 'success' | 'info' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    addAuditLog('AI_GENERATION', `Generated SOAP for ${currentSpecialty}`);
    
    const targetText = generateSoapTemplate(currentSpecialty, currentPatient);
    
    // Clear current note for typewriter effect
    setSoapNote(''); 
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < targetText.length) {
        const nextChar = targetText[currentIndex];
        // We need to use functional update to append ensuring we don't lose chars
        // But for Zustand simplicity in this demo, we read from local var
        // However, simulating streaming directly to store:
        setSoapNote(targetText.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsGenerating(false);
        pushToHistory(targetText); // Save snapshot after generation
      }
    }, 10); // Fast typing speed
  };

  const handleManualChange = (val: string) => {
    setSoapNote(val);
    // Debounce pushing to history could be added here
  };

  const handleSave = () => {
    setIsSaving(true);
    addAuditLog('MANUAL_SAVE', 'Physician manually saved note');
    setTimeout(() => {
        setIsSaving(false);
        showToast("Consultation note saved successfully");
    }, 1000);
  };

  const handleOverrideSubmit = (id: string) => {
    if (!overrideReason.trim()) return;
    dismissInteraction(id);
    setOverrideId(null);
    setOverrideReason('');
    showToast("Safety alert overridden. Reason logged.", 'info');
  };

  const handleICDSearch = async (q: string) => {
    setIcdQuery(q);
    if (q.length < 2) {
      setIcdResults([]);
      return;
    }
    setIsSearchingICD(true);
    try {
      const results = await searchICD10(q);
      setIcdResults(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearchingICD(false);
    }
  };

  const insertICD = (code: ICDCode) => {
    const insertion = `\nDiagnosis: ${code.description} (${code.code})`;
    const newNote = soapNote + insertion;
    setSoapNote(newNote);
    pushToHistory(newNote);
    setShowICD(false);
    setIcdQuery('');
    addAuditLog('ICD_SELECTION', `Added ${code.code}`);
  };

  const handlePrint = () => {
    addAuditLog('EXPORT_PDF', 'Generated PDF export');
    window.print();
  };

  return (
    <div className="flex flex-col h-full bg-surface rounded-xl shadow-sm border border-gray-200 overflow-hidden relative group print:shadow-none print:border-none">
      {/* Toast Notification */}
      {toast && <Toast message={toast.msg} type={toast.type} />}

      {/* Interaction Alert Overlay */}
      {interactions.length > 0 && (
        <div className="absolute top-16 left-4 right-4 z-30 animate-in slide-in-from-top-2 fade-in duration-300 print:hidden">
          {interactions.map(interaction => (
            <div key={interaction.id} className="bg-white border-l-4 border-alert-danger rounded-r-md shadow-xl p-0 flex flex-col relative overflow-hidden ring-1 ring-black/5">
               {/* Header */}
               <div className="bg-alert-danger/10 p-3 flex items-start gap-3 border-b border-alert-danger/10">
                  <div className="p-2 bg-white rounded-full text-alert-danger shadow-sm">
                    <AlertTriangle size={20} />
                  </div>
                  <div className="flex-1">
                      <h4 className="font-bold text-text-primary">{interaction.title}</h4>
                      <p className="text-sm text-text-primary mt-1">{interaction.description}</p>
                  </div>
               </div>

               {/* Action Area */}
               <div className="p-3 bg-white flex justify-end gap-2">
                  {overrideId === interaction.id ? (
                      <div className="flex-1 flex gap-2 items-center animate-in fade-in slide-in-from-right-5">
                          <input 
                            autoFocus
                            type="text" 
                            value={overrideReason}
                            onChange={(e) => setOverrideReason(e.target.value)}
                            placeholder="Type clinical justification..."
                            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:border-alert-danger focus:ring-1 focus:ring-alert-danger outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && handleOverrideSubmit(interaction.id)}
                          />
                          <button 
                             onClick={() => handleOverrideSubmit(interaction.id)}
                             disabled={!overrideReason.trim()}
                             className="px-3 py-1.5 bg-alert-danger text-white text-xs font-bold rounded hover:bg-alert-danger/90 disabled:opacity-50 transition-colors"
                          >
                              Confirm
                          </button>
                      </div>
                  ) : (
                    <button 
                        onClick={() => setOverrideId(interaction.id)}
                        className="text-xs font-bold text-text-secondary hover:text-alert-danger hover:underline transition-colors px-2"
                    >
                        Override Alert (Requires Reason)
                    </button>
                  )}
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/80 backdrop-blur-sm print:hidden">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <button onClick={undo} className="p-1.5 text-text-secondary hover:bg-white hover:shadow-sm rounded transition-all" title="Undo">
              <Undo2 size={16} />
            </button>
            <button onClick={redo} className="p-1.5 text-text-secondary hover:bg-white hover:shadow-sm rounded transition-all" title="Redo">
              <Redo2 size={16} />
            </button>
          </div>
          <div className="h-4 w-px bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-text-primary">Clinical Note</span>
            <span className="px-2 py-0.5 bg-gray-200 text-text-secondary text-[10px] font-bold uppercase rounded tracking-wide">SOAP</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <button 
            onClick={() => setShowICD(!showICD)}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold border rounded-md transition-all shadow-sm ${showICD ? 'bg-primary text-white border-primary' : 'bg-white text-text-secondary border-gray-200 hover:border-primary/50'}`}
          >
            <SearchIcon size={14} />
            Add Diagnosis (ICD-10)
          </button>
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-primary bg-white border border-primary/20 hover:border-primary/50 hover:bg-primary/5 rounded-md transition-all disabled:opacity-50 shadow-sm"
          >
            <Sparkles size={14} className={isGenerating ? 'animate-pulse' : ''} />
            {isGenerating ? 'AI Writing...' : 'Auto-Generate'}
          </button>
        </div>
      </div>

      {/* ICD Search Panel */}
      {showICD && (
        <div className="absolute top-14 right-4 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-20 animate-in fade-in zoom-in-95 print:hidden">
          <div className="p-3 border-b border-gray-100 flex items-center gap-2">
             <SearchIcon size={14} className="text-gray-400" />
             <input 
               autoFocus
               type="text" 
               placeholder="Search diagnosis (e.g. 'otitis')..."
               className="flex-1 text-sm outline-none placeholder:text-gray-300"
               value={icdQuery}
               onChange={(e) => handleICDSearch(e.target.value)}
             />
             <button onClick={() => setShowICD(false)}><X size={14} className="text-gray-400 hover:text-gray-600" /></button>
          </div>
          <div className="max-h-60 overflow-y-auto">
             {isSearchingICD && <div className="p-4 text-center text-xs text-gray-400">Searching global database...</div>}
             {!isSearchingICD && icdResults.length > 0 && icdResults.map(code => (
               <button 
                 key={code.code}
                 onClick={() => insertICD(code)}
                 className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-50 transition-colors group"
               >
                 <div className="flex justify-between items-center mb-0.5">
                   <span className="font-bold text-sm text-text-primary group-hover:text-primary">{code.code}</span>
                   <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 rounded">{code.category}</span>
                 </div>
                 <p className="text-xs text-text-secondary">{code.description}</p>
               </button>
             ))}
             {!isSearchingICD && icdResults.length === 0 && icdQuery.length > 1 && (
               <div className="p-4 text-center text-xs text-gray-400">No codes found.</div>
             )}
          </div>
        </div>
      )}

      {/* Editor Area */}
      <div className="flex-1 p-8 overflow-y-auto relative bg-surface print:p-0 print:overflow-visible">
        {/* Printable Header - Visible only in Print */}
        <div className="hidden print:block mb-8 pb-6 border-b border-gray-200">
           <div className="flex justify-between items-start">
              <div>
                 <h1 className="text-2xl font-bold text-black mb-1">Medical Consultation Report</h1>
                 <p className="text-sm text-gray-600">Generated by Doctolib Clinical AI • {new Date().toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                 <h2 className="font-bold text-black">Dr. Jean Martin</h2>
                 <p className="text-xs text-gray-600">Pediatrics • License #482910</p>
                 <p className="text-xs text-gray-600">12 Rue de la République, Paris</p>
              </div>
           </div>
           <div className="mt-6 p-4 bg-gray-50 border border-gray-100 rounded">
              <p className="font-bold text-sm">Patient: {currentPatient.name}</p>
              <p className="text-xs">DOB: {currentPatient.dob} ({currentPatient.age}yo)</p>
           </div>
        </div>

        <textarea
          ref={textareaRef}
          value={soapNote}
          onChange={(e) => handleManualChange(e.target.value)}
          onBlur={() => pushToHistory(soapNote)} // Save state on blur
          placeholder="Start typing or dictating clinical notes..."
          className="w-full h-full resize-none outline-none text-text-primary leading-loose bg-transparent font-sans text-base placeholder:text-gray-300 print:text-black print:text-sm"
          style={{ minHeight: '400px' }}
        />
        
        {soapNote.length === 0 && (
           <div className="absolute top-1/3 left-1/2 -translate-x-1/2 text-center pointer-events-none opacity-40 print:hidden">
               <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Sparkles size={24} className="text-gray-400" />
               </div>
               <p className="text-sm font-medium text-gray-400">AI Assistant Ready</p>
               <p className="text-xs text-gray-400 mt-1">Type notes or click Auto-Generate</p>
           </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between z-10 print:hidden">
        <div className="flex gap-3">
          <button 
             onClick={handlePrint}
             className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-text-primary text-sm font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
          >
            <Printer size={18} className="text-text-secondary" />
            PDF Export
          </button>
          <button 
            onClick={() => { addAuditLog('ORDER_LABS', 'Standard panel'); showToast('Labs ordered', 'info'); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-text-primary text-sm font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
          >
            <Beaker size={18} className="text-text-secondary" />
            Order Labs
          </button>
          <button 
             onClick={() => { addAuditLog('E_PRESCRIBE', 'Sent to pharmacy'); showToast('Prescription sent', 'info'); }}
             className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-text-primary text-sm font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
          >
            <Send size={18} className="text-text-secondary" />
            e-Prescribe
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-xs text-text-secondary font-medium">
             {isSaving ? 'Saving to cloud...' : lastSaved ? `Autosaved ${lastSaved}` : ''}
          </span>
          <button 
            onClick={handleSave}
            className={`flex items-center gap-2 px-8 py-2.5 text-white text-sm font-bold rounded-lg shadow-lg hover:shadow-xl transition-all active:scale-95 ${
                isSaving ? 'bg-alert-success cursor-default' : 'bg-primary hover:bg-primary-hover'
            }`}
          >
            {isSaving ? <><Check size={18} />Saved</> : <><Save size={18} />Save Note</>}
          </button>
        </div>
      </div>
    </div>
  );
};