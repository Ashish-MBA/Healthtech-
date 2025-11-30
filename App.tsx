import React from 'react';
import { useAppStore } from './store';
import { Sidebar, Header } from './components/Layout';
import { PatientCard } from './components/PatientCard';
import { SmartSoap } from './components/SmartSoap';
import { ClinicalIntelligence } from './components/ClinicalWidgets';

const App: React.FC = () => {
  const { currentView } = useAppStore();

  return (
    <div className="flex w-full h-screen bg-background font-sans overflow-hidden text-text-primary">
      {/* Left Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
        
        {/* Workspace Canvas */}
        <main className="flex-1 p-6 overflow-hidden">
          {currentView === 'consultation' ? (
            <div className="grid grid-cols-12 gap-6 h-full">
               {/* Column 1: Patient Context (20%) */}
              <section className="col-span-3 h-full overflow-y-auto">
                 <PatientCard />
              </section>

              {/* Column 2: Clinical Workspace (50%) */}
              <section className="col-span-6 h-full flex flex-col">
                 <SmartSoap />
              </section>

              {/* Column 3: Clinical Intelligence (30%) */}
              <section className="col-span-3 h-full overflow-y-auto">
                 <ClinicalIntelligence />
              </section>
            </div>
          ) : (
            // Placeholder for other views to demonstrate routing structure
            <div className="w-full h-full flex flex-col items-center justify-center text-text-secondary">
               <div className="w-24 h-24 bg-gray-200 rounded-full mb-4 flex items-center justify-center">
                 <span className="text-4xl font-bold opacity-30">
                   {currentView.charAt(0).toUpperCase()}
                 </span>
               </div>
               <h2 className="text-2xl font-bold text-text-primary capitalize mb-2">{currentView} View</h2>
               <p className="text-sm">This module is part of the full Doctolib suite.</p>
               <p className="text-sm mt-1">Please return to <strong className="text-primary">Consultation</strong> to use the Clinical AI.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;