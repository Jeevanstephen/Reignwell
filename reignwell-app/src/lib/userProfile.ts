import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_KEY = 'rw_user_profile';

export type Gender = 'male' | 'female' | 'other';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type Goal = 'muscle_gain' | 'weight_loss' | 'heart_health' | 'general_health';
export type UnitSystem = 'metric' | 'imperial';

export interface UserProfile {
  name: string;
  age: number;
  gender: Gender;
  weightKg: number;
  heightCm: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  currency: string;   // ISO 4217, default 'EUR'
  locale: string;     // BCP-47, default 'en-EU'
  unitSystem: UnitSystem;
}

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  age: 30,
  gender: 'male',
  weightKg: 75,
  heightCm: 175,
  activityLevel: 'moderate',
  goal: 'general_health',
  currency: 'EUR',
  locale: 'en-EU',
  unitSystem: 'metric',
};

// Activity multipliers (Mifflin-St Jeor TDEE)
const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  sedentary:   1.2,
  light:       1.375,
  moderate:    1.55,
  active:      1.725,
  very_active: 1.9,
};

export async function getProfile(): Promise<UserProfile> {
  const raw = await AsyncStorage.getItem(PROFILE_KEY);
  return raw ? { ...DEFAULT_PROFILE, ...JSON.parse(raw) } : { ...DEFAULT_PROFILE };
}

export async function saveProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
  const current = await getProfile();
  const updated: UserProfile = { ...current, ...profile };
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Mifflin-St Jeor BMR × activity multiplier.
 * Returns total daily energy expenditure in kcal, adjusted for goal.
 */
export async function getDailyCalorieTarget(): Promise<number> {
  const p = await getProfile();

  // BMR (Mifflin-St Jeor)
  let bmr: number;
  if (p.gender === 'male') {
    bmr = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age + 5;
  } else {
    bmr = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age - 161;
  }

  const tdee = bmr * ACTIVITY_MULTIPLIER[p.activityLevel];

  // Goal adjustment
  switch (p.goal) {
    case 'muscle_gain':  return Math.round(tdee + 300);
    case 'weight_loss':  return Math.round(tdee - 500);
    default:             return Math.round(tdee);
  }
}

export async function getUnit(): Promise<UnitSystem> {
  const p = await getProfile();
  return p.unitSystem;
}

/** Convert kg to lbs for display in imperial mode. */
export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

/** Convert cm to feet + inches string for display in imperial mode. */
export function cmToFeetInches(cm: number): string {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}'${inches}"`;
}
