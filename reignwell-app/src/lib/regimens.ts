import AsyncStorage from '@react-native-async-storage/async-storage';

const ACTIVE_REGIMEN_KEY = 'rw_active_regimen';

export interface NutrientTarget {
  name: string;
  unit: string;
  dailyTarget: number;
  efsaRange: [number, number]; // [min, max]
}

export interface RegimenSupplement {
  name: string;
  dose: string;
  timing: string;
  amazonQuery: string;
}

export interface Regimen {
  id: string;
  name: string;
  goal: string;
  nutrients: NutrientTarget[];
  supplements: RegimenSupplement[];
  price: { monthly: number; currency: 'EUR' };
}

const REGIMENS: Regimen[] = [
  {
    id: 'muscle_gain',
    name: 'Muscle Gain',
    goal: 'Build lean muscle mass with optimal protein intake and key micronutrients',
    nutrients: [
      { name: 'Protein',    unit: 'g/kg bodyweight', dailyTarget: 1.6, efsaRange: [0.8, 2.2] },
      { name: 'Calories',   unit: 'kcal',            dailyTarget: 2800, efsaRange: [2000, 3500] },
      { name: 'Vitamin D',  unit: 'μg',              dailyTarget: 20,   efsaRange: [15, 100] },
      { name: 'Zinc',       unit: 'mg',              dailyTarget: 11,   efsaRange: [7.5, 25] },
      { name: 'Magnesium',  unit: 'mg',              dailyTarget: 420,  efsaRange: [300, 500] },
      { name: 'Creatine',   unit: 'g',               dailyTarget: 5,    efsaRange: [3, 5] },
    ],
    supplements: [
      { name: 'Whey Protein',    dose: '25–30g',    timing: 'Post-workout',          amazonQuery: 'whey protein powder 1kg' },
      { name: 'Creatine Monohydrate', dose: '5g',   timing: 'Daily, any time',       amazonQuery: 'creatine monohydrate powder' },
      { name: 'Vitamin D3',      dose: '2000 IU',   timing: 'Morning with food',     amazonQuery: 'vitamin d3 2000iu supplement' },
      { name: 'Zinc',            dose: '15mg',      timing: 'Evening with food',     amazonQuery: 'zinc supplement 15mg tablets' },
    ],
    price: { monthly: 42, currency: 'EUR' },
  },
  {
    id: 'weight_loss',
    name: 'Weight Loss',
    goal: 'Sustainable fat loss through caloric deficit, fibre, and metabolic support',
    nutrients: [
      { name: 'Calories',   unit: 'kcal',            dailyTarget: 1700, efsaRange: [1200, 2000] },
      { name: 'Protein',    unit: 'g/kg bodyweight', dailyTarget: 1.4,  efsaRange: [0.8, 1.8] },
      { name: 'Fibre',      unit: 'g',               dailyTarget: 25,   efsaRange: [25, 38] },
      { name: 'Omega-3',    unit: 'g',               dailyTarget: 1.5,  efsaRange: [0.5, 2] },
      { name: 'Vitamin D',  unit: 'μg',              dailyTarget: 15,   efsaRange: [15, 100] },
      { name: 'Chromium',   unit: 'μg',              dailyTarget: 35,   efsaRange: [20, 300] },
    ],
    supplements: [
      { name: 'Omega-3 Fish Oil',  dose: '1–2g EPA+DHA', timing: 'With meals',         amazonQuery: 'omega 3 fish oil high strength' },
      { name: 'Psyllium Husk',     dose: '5g',           timing: 'Before meals',       amazonQuery: 'psyllium husk fibre supplement' },
      { name: 'Green Tea Extract', dose: '400mg EGCG',   timing: 'Morning fasted',     amazonQuery: 'green tea extract supplement egcg' },
      { name: 'Vitamin D3',        dose: '1000 IU',      timing: 'Morning with food',  amazonQuery: 'vitamin d3 1000iu supplement' },
    ],
    price: { monthly: 28, currency: 'EUR' },
  },
  {
    id: 'heart_health',
    name: 'Heart Health',
    goal: 'Support cardiovascular health with evidence-based nutrients and reduced sat fat',
    nutrients: [
      { name: 'Omega-3',          unit: 'g',    dailyTarget: 2,   efsaRange: [0.5, 3] },
      { name: 'Magnesium',        unit: 'mg',   dailyTarget: 400, efsaRange: [300, 500] },
      { name: 'CoQ10',            unit: 'mg',   dailyTarget: 100, efsaRange: [30, 300] },
      { name: 'Saturated Fat',    unit: 'g',    dailyTarget: 20,  efsaRange: [0, 22] },
      { name: 'Vitamin K2',       unit: 'μg',   dailyTarget: 70,  efsaRange: [45, 200] },
      { name: 'Folate (B9)',       unit: 'μg',   dailyTarget: 400, efsaRange: [200, 1000] },
    ],
    supplements: [
      { name: 'Omega-3 (EPA+DHA)',  dose: '2g',    timing: 'With meals',          amazonQuery: 'omega 3 2000mg high strength capsules' },
      { name: 'CoQ10 Ubiquinol',    dose: '100mg', timing: 'Morning with food',   amazonQuery: 'coq10 ubiquinol 100mg supplement' },
      { name: 'Magnesium Glycinate',dose: '400mg', timing: 'Evening',             amazonQuery: 'magnesium glycinate 400mg supplement' },
      { name: 'Vitamin K2 (MK-7)', dose: '100μg', timing: 'With fat-containing meal', amazonQuery: 'vitamin k2 mk7 supplement' },
    ],
    price: { monthly: 38, currency: 'EUR' },
  },
];

export function getAllRegimens(): Regimen[] {
  return REGIMENS;
}

export function getRegimenById(id: string): Regimen | undefined {
  return REGIMENS.find(r => r.id === id);
}

export async function setActiveRegimen(id: string): Promise<void> {
  await AsyncStorage.setItem(ACTIVE_REGIMEN_KEY, id);
}

export async function getActiveRegimen(): Promise<Regimen | null> {
  const id = await AsyncStorage.getItem(ACTIVE_REGIMEN_KEY);
  return id ? (getRegimenById(id) ?? null) : null;
}
