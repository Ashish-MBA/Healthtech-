export type Specialty = 'Pediatrics' | 'Cardiology' | 'Oncology' | 'Psychiatry';
export type AppView = 'dashboard' | 'agenda' | 'patients' | 'consultation' | 'messages';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  avatarUrl: string;
  allergies: string[];
  conditions: string[];
  lastVisit: string;
  dob: string; // Added DOB for precise pediatric calc
  weight?: number; // Current weight
}

export interface DrugInteraction {
  id: string;
  severity: 'high' | 'moderate' | 'low';
  title: string;
  description: string;
  drugs: string[];
}

export interface ICDCode {
  code: string;
  description: string;
  category: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
}

export interface TNMStage {
  t: string;
  n: string;
  m: string;
  stageGroup: string;
}