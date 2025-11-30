import { ICDCode, Patient, Specialty } from './types';

// --- I. PEDIATRIC VITAL NORMS ---
// Min/Max ranges for validation
export const PEDIATRIC_RANGES = {
  heartRate: { min: 70, max: 140, unit: 'bpm' }, // Approx for 5yo
  respiratoryRate: { min: 20, max: 30, unit: 'bpm' },
  temperature: { min: 36.5, max: 37.5, unit: '°C' },
  systolicBP: { min: 90, max: 110, unit: 'mmHg' },
};

export const validateVital = (type: keyof typeof PEDIATRIC_RANGES, value: number) => {
  const range = PEDIATRIC_RANGES[type];
  if (value < range.min) return 'low';
  if (value > range.max) return 'high';
  return 'normal';
};

// --- II. MOCK ICD-10 MICROSERVICE ---
// Simulates a Redis-cached microservice with latency and fallbacks
const ICD_CACHE: Record<string, ICDCode[]> = {
  'otitis': [
    { code: 'H66.0', description: 'Acute suppurative otitis media', category: 'Pediatrics' },
    { code: 'H66.9', description: 'Otitis media, unspecified', category: 'Pediatrics' },
    { code: 'H65.1', description: 'Other acute nonsuppurative otitis media', category: 'Pediatrics' },
  ],
  'asthma': [
    { code: 'J45.20', description: 'Mild intermittent asthma, uncomplicated', category: 'Pediatrics' },
    { code: 'J45.40', description: 'Moderate persistent asthma, uncomplicated', category: 'Pediatrics' },
  ],
  'anxiety': [
    { code: 'F41.1', description: 'Generalized anxiety disorder', category: 'Psychiatry' },
    { code: 'F41.9', description: 'Anxiety disorder, unspecified', category: 'Psychiatry' },
  ]
};

export const searchICD10 = async (query: string): Promise<ICDCode[]> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate Service Reliability (99% uptime)
      if (Math.random() > 0.99) {
        reject(new Error("ICD Microservice Timeout"));
        return;
      }
      
      const lowerQuery = query.toLowerCase();
      // Mock search logic
      const results: ICDCode[] = [];
      Object.keys(ICD_CACHE).forEach(key => {
        if (key.includes(lowerQuery) || lowerQuery.includes(key)) {
          results.push(...ICD_CACHE[key]);
        }
      });
      
      // Fallback/Generic search
      if (results.length === 0 && query.length > 2) {
         results.push({ code: 'R69', description: `Unspecified diagnosis matching "${query}"`, category: 'General' });
      }

      resolve(results);
    }, 300); // 300ms simulated latency
  });
};

// --- III. AI GENERATION TEMPLATES ---
export const generateSoapTemplate = (specialty: Specialty, patient: Patient): string => {
  if (specialty === 'Pediatrics') {
    return `Subjective:
Parent reports ${patient.name} has had a fever (38.5°C) for 2 days.
Complains of left ear pain ("ouchie ear").
Decreased appetite, but drinking fluids well.
No vomiting or diarrhea.
Sleep disrupted due to pain.

Objective:
Vitals: T 38.2°C, HR 110, RR 24, BP 100/65.
Gen: Alert, irritable but consolable 5yo male.
HEENT:
 - Right TM: Normal, pearly gray.
 - Left TM: Erythematous, bulging, poor light reflex.
 - Oropharynx: Clear, no exudate.
Neck: Supple, small shotty anterior cervical lymph nodes.
Lungs: Clear to auscultation bilaterally.
Heart: Regular rate and rhythm, no murmurs.
Skin: No rashes.

Assessment:
1. Acute Otitis Media, Left Ear (H66.0)
2. Fever

Plan:
1. Amoxicillin 80-90mg/kg/day divided BID x 7 days.
   - Prescribed: Amoxicillin 400mg/5mL susp, 7.5mL PO BID.
2. Acetaminophen 15mg/kg PO q4-6h prn pain/fever.
3. Supportive care: hydration, rest.
4. Return precautions reviewed: high fever >3 days, lethargy, vomiting.
5. Follow up in 3 months or sooner if not improving in 48h.`;
  }
  
  if (specialty === 'Cardiology') {
    return `Subjective:
Patient reports shortness of breath with moderate exertion.
Mild bilateral ankle swelling in evenings.
Denies chest pain or palpitations.
Adherent to current meds: Lisinopril 10mg.

Objective:
BP 135/85, HR 72, RR 18.
Neck: No JVD at 45 degrees.
Lungs: Mild basilar crackles, otherwise clear.
Heart: RRR, S1 S2 normal, soft S3 audible at apex.
Extremities: 1+ pitting edema bilateral ankles.
Echo (Today): LVEF 42% (Reduced).

Assessment:
1. Heart Failure with Reduced Ejection Fraction (HFrEF).
2. Essential Hypertension.

Plan:
1. Optimize medical therapy.
2. Increase Lisinopril to 20mg daily.
3. Start Furosemide 20mg daily for fluid management.
4. Advise daily weight monitoring.
5. Follow up in 2 weeks for electrolyte check.`;
  }

  return `Subjective:
Patient presents for routine follow-up.
Reports stable symptoms.

Objective:
Vitals stable.
Exam within normal limits.

Assessment:
Condition stable.

Plan:
Continue current management.
Follow up as needed.`;
};