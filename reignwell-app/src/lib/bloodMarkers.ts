export type RiskLevel = 'green' | 'amber' | 'red';

export interface MarkerReading {
  value: number;
  date: string; // YYYY-MM-DD
}

export interface BloodMarker {
  id: string;
  name: string;
  unit: string;
  group: 'Metabolic' | 'Lipids' | 'Nutrients' | 'Hormones';
  refMin: number;
  refMax: number;
  readings: MarkerReading[];
}

function risk(value: number, min: number, max: number): RiskLevel {
  if (value < min || value > max) return 'red';
  const lo = min + (max - min) * 0.2;
  const hi = min + (max - min) * 0.8;
  if (value < lo || value > hi) return 'amber';
  return 'green';
}

export const markers: BloodMarker[] = [
  // Metabolic
  { id: 'glucose',    name: 'Glucose',       unit: 'mmol/L', group: 'Metabolic', refMin: 3.9,  refMax: 5.6,  readings: [{ value: 5.1, date: '2026-11-01' }, { value: 5.3, date: '2026-09-15' }, { value: 4.9, date: '2026-07-10' }] },
  { id: 'hba1c',      name: 'HbA1c',         unit: '%',      group: 'Metabolic', refMin: 4.0,  refMax: 5.6,  readings: [{ value: 5.2, date: '2026-11-01' }, { value: 5.4, date: '2026-09-15' }] },
  { id: 'creatinine', name: 'Creatinine',    unit: 'µmol/L', group: 'Metabolic', refMin: 62,   refMax: 115,  readings: [{ value: 88,  date: '2026-11-01' }, { value: 92,  date: '2026-09-15' }, { value: 85, date: '2026-07-10' }] },
  // Lipids
  { id: 'ldl',        name: 'LDL Cholesterol', unit: 'mmol/L', group: 'Lipids', refMin: 1.0, refMax: 3.0,  readings: [{ value: 3.4, date: '2026-11-01' }, { value: 3.1, date: '2026-09-15' }, { value: 3.6, date: '2026-07-10' }] },
  { id: 'hdl',        name: 'HDL Cholesterol', unit: 'mmol/L', group: 'Lipids', refMin: 1.0, refMax: 3.5,  readings: [{ value: 1.4, date: '2026-11-01' }, { value: 1.3, date: '2026-09-15' }] },
  { id: 'triglyc',    name: 'Triglycerides',   unit: 'mmol/L', group: 'Lipids', refMin: 0.0, refMax: 1.7,  readings: [{ value: 1.2, date: '2026-11-01' }, { value: 1.5, date: '2026-09-15' }, { value: 0.9, date: '2026-07-10' }] },
  // Nutrients
  { id: 'vitd',       name: 'Vitamin D',   unit: 'nmol/L', group: 'Nutrients', refMin: 50,  refMax: 150, readings: [{ value: 42,  date: '2026-11-01' }, { value: 38, date: '2026-09-15' }, { value: 55, date: '2026-07-10' }] },
  { id: 'b12',        name: 'Vitamin B12', unit: 'pmol/L', group: 'Nutrients', refMin: 148, refMax: 616, readings: [{ value: 290, date: '2026-11-01' }, { value: 260, date: '2026-09-15' }] },
  { id: 'ferritin',   name: 'Ferritin',    unit: 'µg/L',   group: 'Nutrients', refMin: 15,  refMax: 200, readings: [{ value: 68,  date: '2026-11-01' }, { value: 72, date: '2026-09-15' }, { value: 60, date: '2026-07-10' }] },
  // Hormones
  { id: 'tsh',        name: 'TSH',         unit: 'mIU/L',  group: 'Hormones',  refMin: 0.4, refMax: 4.0, readings: [{ value: 2.1, date: '2026-11-01' }, { value: 1.9, date: '2026-09-15' }] },
  { id: 'testosterone', name: 'Testosterone', unit: 'nmol/L', group: 'Hormones', refMin: 9.9, refMax: 27.8, readings: [{ value: 18.4, date: '2026-11-01' }, { value: 17.2, date: '2026-09-15' }, { value: 19.0, date: '2026-07-10' }] },
  { id: 'cortisol',   name: 'Cortisol',    unit: 'nmol/L', group: 'Hormones',  refMin: 171, refMax: 536, readings: [{ value: 480, date: '2026-11-01' }, { value: 390, date: '2026-09-15' }] },
];

export function getRisk(marker: BloodMarker): RiskLevel {
  const latest = marker.readings[0];
  if (!latest) return 'amber';
  return risk(latest.value, marker.refMin, marker.refMax);
}

export const GROUPS = ['Metabolic', 'Lipids', 'Nutrients', 'Hormones'] as const;
