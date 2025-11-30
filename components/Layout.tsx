import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { Specialty, AppView } from '../types';
import { 
  LayoutGrid, 
  Calendar, 
  Users, 
  MessageSquare, 
  FileText, 
  Search, 
  Bell, 
  ChevronDown,
  ShieldCheck,
  Stethoscope,
  LogOut,
  FileClock
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { currentView, setView } = useAppStore();
  
  const navItems: { id: AppView, icon: any, label: string }[] = [
    { id: 'dashboard', icon: LayoutGrid, label: 'Dashboard' },
    { id: 'agenda', icon: Calendar, label: 'Agenda' },
    { id: 'patients', icon: Users, label: 'Patients' },
    { id: 'consultation', icon: Stethoscope, label: 'Consultation' }, // Main view
    { id: 'messages', icon: MessageSquare, label: 'Messages' },
  ];

  return (
    <div className="w-20 h-screen bg-surface border-r border-gray-200 flex flex-col items-center py-6 z-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] print:hidden">
      <div className="mb-10">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-hover rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/30">
          D
        </div>
      </div>
      <div className="flex flex-col gap-6 w-full px-3">
        {navItems.map((item) => (
          <div key={item.id} className="relative group flex flex-col items-center">
             <button 
              onClick={() => setView(item.id)}
              className={`p-3 rounded-xl transition-all duration-200 group-hover:-translate-y-0.5 ${
                currentView === item.id 
                  ? 'bg-primary text-white shadow-md shadow-primary/25' 
                  : 'text-text-secondary hover:bg-gray-100 hover:text-primary'
              }`}
            >
              <item.icon size={22} strokeWidth={currentView === item.id ? 2.5 : 2} />
            </button>
            {/* Tooltip */}
            <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[60] pointer-events-none">
              {item.label}
            </span>
          </div>
        ))}
      </div>
      
      <div className="mt-auto pb-4">
        <button className="p-3 text-text-secondary hover:bg-alert-danger/10 hover:text-alert-danger rounded-xl transition-colors">
          <LogOut size={22} />
        </button>
      </div>
    </div>
  );
};

export const Header: React.FC = () => {
  const { currentSpecialty, setSpecialty, interactions, auditLogs } = useAppStore();
  const specialties: Specialty[] = ['Pediatrics', 'Cardiology', 'Oncology', 'Psychiatry'];
  const [isOpen, setIsOpen] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasAlerts = interactions.length > 0;

  return (
    <header className="h-16 bg-surface border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm print:hidden">
      <div className="flex items-center gap-6 flex-1">
        <div className="relative w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search for a patient (Cmd+K)" 
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-transparent focus:border-primary/20 rounded-md text-sm focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-400"
          />
        </div>
        
        {/* Specialty Switcher */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all border ${
              isOpen 
                ? 'bg-primary/10 border-primary/20 text-primary' 
                : 'bg-background border-transparent text-text-secondary hover:bg-gray-200/50'
            }`}
          >
            <Stethoscope size={16} />
            <span className="font-semibold">{currentSpecialty}</span> Mode
            <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isOpen && (
            <div className="absolute top-full left-0 mt-2 w-56 bg-surface rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Select Context</span>
              </div>
              {specialties.map(s => (
                <button
                  key={s}
                  onClick={() => {
                    setSpecialty(s);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between group ${
                    s === currentSpecialty ? 'bg-primary/5 text-primary font-semibold' : 'text-text-primary hover:bg-gray-50'
                  }`}
                >
                  {s}
                  {s === currentSpecialty && <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Audit Log Toggle */}
        <div className="relative">
          <button 
             onClick={() => setShowAudit(!showAudit)}
             className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
              showAudit ? 'bg-gray-100 text-primary border-gray-300' : 'bg-transparent text-text-secondary border-transparent hover:bg-gray-50'
             }`}
          >
             <FileClock size={14} />
             Audit Log
          </button>
          
          {showAudit && (
             <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-[60] overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                   <span className="text-xs font-bold text-text-secondary uppercase">Recent Activity</span>
                   <span className="text-[10px] text-gray-400">GDPR Compliant</span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                   {auditLogs.length === 0 ? (
                     <div className="p-4 text-center text-sm text-gray-400">No activity recorded yet.</div>
                   ) : (
                     auditLogs.map(log => (
                       <div key={log.id} className="p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-center mb-1">
                             <span className="text-xs font-bold text-text-primary">{log.action}</span>
                             <span className="text-[10px] text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-xs text-text-secondary truncate">{log.details}</p>
                       </div>
                     ))
                   )}
                </div>
             </div>
          )}
        </div>

        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
          hasAlerts 
            ? 'bg-alert-danger/10 text-alert-danger border-alert-danger/20 animate-pulse' 
            : 'bg-alert-success/10 text-alert-success border-alert-success/20'
        }`}>
          <ShieldCheck size={14} />
          {hasAlerts ? 'Safety Alerts Active' : 'Safety Shield Active'}
        </div>

        <div className="h-6 w-px bg-gray-200 mx-2"></div>

        <div className="flex items-center gap-3 pl-2 cursor-pointer hover:bg-gray-50 p-1 pr-3 rounded-full transition-colors border border-transparent hover:border-gray-200">
           <div className="w-9 h-9 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden">
              <img src="https://i.pravatar.cc/150?img=11" alt="Doctor" className="w-full h-full object-cover" />
           </div>
           <div className="flex flex-col">
             <span className="text-sm font-bold text-text-primary leading-none">Dr. Martin</span>
             <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded mt-1 w-fit font-bold">PHYSICIAN</span>
           </div>
        </div>
      </div>
    </header>
  );
};