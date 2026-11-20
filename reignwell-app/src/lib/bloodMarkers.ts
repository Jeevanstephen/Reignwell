import AsyncStorage from '@react-native-async-storage/async-storage';

const BLOOD_LOG_KEY = 'rw_blood_log';

export type RiskLevel = 'optimal' | 'borderline' | 'at-risk';

export interface MarkerDefinition {
  id: string;
  name: string;
  unit: string;
  euRange: [number, number];       // general EU reference range
  optimal: [number, number];
  borderline: [number, number][];  // ranges that are borderline (can be multiple)
  // values outside optimal AND not borderline are 'at-risk'
  description: string;
}

export interface BloodReading {
  markerId: string;
  value: number;
  date: string;        // YYYY-MM-DD
  riskLevel: RiskLevel;
}

const MARKER_DEFINITIONS: MarkerDefinition[] = [
  {
    id: 'glucose',
    name: 'Glucose (Fasting)',
    unit: 'mmol/L',
    euRange: [3.9, 5.5],
    optimal: [3.9, 5.5],
    borderline: [[5.6, 6.9]],
    description: 'Fasting blood glucose. Values ≥7.0 indicate diabetes.',
  },
  {
    id: 'hba1c',
    name: 'HbA1c',
    unit: '%',
    euRange: [4.0, 5.6],
    optimal: [4.0, 5.6],
    borderline: [[5.7, 6.4]],
    description: '3-month average blood sugar. ≥6.5% = diabetes.',
  },
  {
    id: 'total_chol',
    name: 'Total Cholesterol',
    unit: 'mmol/L',
    euRange: [0, 5.0],
    optimal: [0, 5.0],
    borderline: [[5.0, 6.2]],
    description: 'Total blood cholesterol. European target <5.0 mmol/L.',
  },
  {
    id: 'ldl',
    name: 'LDL Cholesterol',
    unit: 'mmol/L',
    euRange: [0, 3.0],
    optimal: [0, 2.6],
    borderline: [[2.6, 3.4]],
    description: '"Bad" cholesterol. Lower is better for heart health.',
  },
  {
    id: 'hdl',
    name: 'HDL Cholesterol',
    unit: 'mmol/L',
    euRange: [1.0, 2.5],
    optimal: [1.6, 2.5],
    borderline: [[1.0, 1.59]],
    description: '"Good" cholesterol. Higher is protective for the heart.',
  },
  {
    id: 'triglycerides',
    name: 'Triglycerides',
    unit: 'mmol/L',
    euRange: [0, 1.7],
    optimal: [0, 1.7],
    borderline: [[1.7, 2.2]],
    description: 'Blood fats. Elevated values raise cardiovascular risk.',
  },
  {
    id: 'ferritin',
    name: 'Ferritin',
    unit: 'μg/L',
    euRange: [15, 200],
    optimal: [30, 150],
    borderline: [[15, 29], [151, 200]],
    description: 'Iron storage protein. Low = iron deficiency.',
  },
  {
    id: 'vitamin_d',
    name: 'Vitamin D (25-OH)',
    unit: 'nmol/L',
    euRange: [50, 200],
    optimal: [75, 200],
    borderline: [[50, 74]],
    description: 'Vitamin D status. <50 nmol/L = deficiency.',
  },
  {
    id: 'tsh',
    name: 'TSH (Thyroid)',
    unit: 'mU/L',
    euRange: [0.4, 4.0],
    optimal: [0.4, 2.5],
    borderline: [[2.5, 4.0]],
    description: 'Thyroid-stimulating hormone. Outside range = thyroid issue.',
  },
  {
    id: 'crp',
    name: 'CRP (Inflammation)',
    unit: 'mg/L',
    euRange: [0, 3.0],
    optimal: [0, 1.0],
    borderline: [[1.0, 3.0]],
    description: 'C-reactive protein. Elevated = systemic inflammation.',
  },
  {
    id: 'testosterone',
    name: 'Testosterone (Total)',
    unit: 'nmol/L',
    euRange: [8.7, 29.4],  // adult males; females typically 0.3–2.4
    optimal: [15.0, 29.4],
    borderline: [[8.7, 14.9]],
    description: 'Total testosterone. Low levels affect energy and mood.',
  },
  {
    id: 'haemoglobin',
    name: 'Haemoglobin',
    unit: 'g/dL',
    euRange: [12.0, 17.5],
    optimal: [13.5, 17.5],
    borderline: [[12.0, 13.4]],
    description: 'Oxygen-carrying protein in red blood cells. Low = anaemia.',
  },
];

// ---- Risk classification ----

export function getRiskLevel(markerId: string, value: number): RiskLevel {
  const def = MARKER_DEFINITIONS.find(m => m.id === markerId);
  if (!def) return 'at-risk';

  const [optMin, optMax] = def.optimal;
  if (value >= optMin && value <= optMax) return 'optimal';

  for (const [bMin, bMax] of def.borderline) {
    if (value >= bMin && value <= bMax) return 'borderline';
  }

  return 'at-risk';
}

// ---- Persistence ----

type LogStore = Record<string, BloodReading[]>; // markerId → readings[]

async function readLog(): Promise<LogStore> {
  const raw = await AsyncStorage.getItem(BLOOD_LOG_KEY);
  return raw ? JSON.parse(raw) : {};
}

async function writeLog(store: LogStore): Promise<void> {
  await AsyncStorage.setItem(BLOOD_LOG_KEY, JSON.stringify(store));
}

export async function logMarker(
  markerId: string,
  value: number,
  date: string = new Date().toISOString().slice(0, 10),
): Promise<BloodReading> {
  const reading: BloodReading = {
    markerId,
    value,
    date,
    riskLevel: getRiskLevel(markerId, value),
  };
  const store = await readLog();
  store[markerId] = [reading, ...(store[markerId] ?? [])].sort(
    (a, b) => b.date.localeCompare(a.date),
  );
  await writeLog(store);
  return reading;
}

export async function getMarkerHistory(markerId: string): Promise<BloodReading[]> {
  const store = await readLog();
  return store[markerId] ?? [];
}

export async function getLatestMarkers(): Promise<BloodReading[]> {
  const store = await readLog();
  return Object.values(store)
    .map(readings => readings[0])
    .filter(Boolean)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getAllMarkerDefinitions(): MarkerDefinition[] {
  return MARKER_DEFINITIONS;
}
