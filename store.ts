import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Specialty, Patient, DrugInteraction, AppView, AuditLog } from './types';

interface AppState {
  currentView: AppView;
  setView: (v: AppView) => void;

  currentSpecialty: Specialty;
  setSpecialty: (s: Specialty) => void;
  
  currentPatient: Patient;
  setPatient: (p: Patient) => void;

  soapNote: string;
  setSoapNote: (note: string) => void;
  
  // History for Undo/Redo
  history: string[];
  historyIndex: number;
  pushToHistory: (note: string) => void;
  undo: () => void;
  redo: () => void;

  interactions: DrugInteraction[];
  checkInteractions: (text: string) => void;
  dismissInteraction: (id: string) => void;

  // Compliance & metadata
  isSaving: boolean;
  lastSaved: string | null;
  setIsSaving: (saving: boolean) => void;
  
  auditLogs: AuditLog[];
  addAuditLog: (action: string, details: string) => void;
}

// Mock Patients
const MOCK_PATIENTS: Record<Specialty, Patient> = {
  Pediatrics: {
    id: 'p1',
    name: 'Léo Dubois',
    age: 5,
    gender: 'Male',
    dob: '2019-05-14',
    weight: 18.5,
    avatarUrl: 'https://images.unsplash.com/photo-1596815064285-45ed8a9c0463?w=200&h=200&fit=crop',
    allergies: ['Amoxicillin', 'Peanuts'],
    conditions: ['Asthma (Mild)'],
    lastVisit: '2023-09-15'
  },
  Cardiology: {
    id: 'c1',
    name: 'Jean-Pierre Martin',
    age: 64,
    gender: 'Male',
    dob: '1960-02-10',
    weight: 82,
    avatarUrl: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=200&h=200&fit=crop',
    allergies: ['Penicillin'],
    conditions: ['Hypertension', 'Type 2 Diabetes'],
    lastVisit: '2024-01-10'
  },
  Oncology: {
    id: 'o1',
    name: 'Marie Curie',
    age: 68,
    gender: 'Female',
    dob: '1956-11-07',
    avatarUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&h=200&fit=crop',
    allergies: ['Latex'],
    conditions: ['Breast CA (Remission)', 'Osteoporosis'],
    lastVisit: '2024-02-20'
  },
  Psychiatry: {
    id: 'ps1',
    name: 'Sophie Laurent',
    age: 29,
    gender: 'Female',
    dob: '1995-04-12',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    allergies: ['None known'],
    conditions: ['Anxiety Disorder'],
    lastVisit: '2024-03-01'
  }
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentView: 'consultation',
      setView: (v) => set({ currentView: v }),

      currentSpecialty: 'Pediatrics',
      currentPatient: MOCK_PATIENTS['Pediatrics'],
      
      setSpecialty: (s) => set({ 
        currentSpecialty: s, 
        currentPatient: MOCK_PATIENTS[s],
        soapNote: '', 
        interactions: [],
        history: [''],
        historyIndex: 0
      }),

      setPatient: (p) => set({ currentPatient: p }),

      soapNote: '',
      history: [''],
      historyIndex: 0,
      
      setSoapNote: (note) => {
        // We only push to history on debounce or specific actions, but for simple state update:
        set({ soapNote: note });
        get().checkInteractions(note);
      },

      pushToHistory: (note) => {
        const { history, historyIndex } = get();
        // If we are not at the end of history, discard future
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(note);
        // Limit stack size
        if (newHistory.length > 50) newHistory.shift();
        
        set({ 
          history: newHistory, 
          historyIndex: newHistory.length - 1,
          soapNote: note 
        });
      },

      undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          set({ 
            historyIndex: newIndex, 
            soapNote: history[newIndex] 
          });
        }
      },

      redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1;
          set({ 
            historyIndex: newIndex, 
            soapNote: history[newIndex] 
          });
        }
      },

      interactions: [],
      checkInteractions: (text) => {
        const lowerText = text.toLowerCase();
        const currentInteractions = get().interactions;
        const hasWarfarin = lowerText.includes('warfarin');
        const hasAspirin = lowerText.includes('aspirin');
        const interactionId = 'warfarin-aspirin';

        const hasInteraction = hasWarfarin && hasAspirin;
        const alreadyExists = currentInteractions.some(i => i.id === interactionId);

        if (hasInteraction && !alreadyExists) {
          set({
            interactions: [
              ...currentInteractions,
              {
                id: interactionId,
                severity: 'high',
                title: 'CRITICAL INTERACTION',
                description: 'Concurrent use of Warfarin and Aspirin significantly increases the risk of major bleeding complications.',
                drugs: ['Warfarin', 'Aspirin']
              }
            ]
          });
          get().addAuditLog('SAFETY_ALERT', 'Detected interaction: Warfarin + Aspirin');
        } else if (!hasInteraction && alreadyExists) {
          set({
            interactions: currentInteractions.filter(i => i.id !== interactionId)
          });
        }
      },

      dismissInteraction: (id) => {
        set((state) => ({
          interactions: state.interactions.filter(i => i.id !== id)
        }));
        get().addAuditLog('SAFETY_OVERRIDE', `Physician dismissed alert ${id}`);
      },

      isSaving: false,
      lastSaved: null,
      setIsSaving: (saving) => set({ isSaving: saving, lastSaved: saving ? null : new Date().toLocaleTimeString() }),

      auditLogs: [],
      addAuditLog: (action, details) => set((state) => ({
        auditLogs: [
          {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            user: 'Dr. Martin',
            action,
            details
          },
          ...state.auditLogs
        ].slice(0, 100) // Keep last 100 logs
      }))
    }),
    {
      name: 'doctolib-clinical-storage-v2',
      partialize: (state) => ({ 
        currentSpecialty: state.currentSpecialty,
        currentPatient: state.currentPatient,
        soapNote: state.soapNote,
        auditLogs: state.auditLogs
      }),
    }
  )
);