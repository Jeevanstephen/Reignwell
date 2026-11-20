export type Gender = 'M' | 'F' | 'Other';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type Goal = 'lose' | 'maintain' | 'gain';
export type Locale = 'UK' | 'DE' | 'FR' | 'ES' | 'IT';

export interface UserProfile {
  name: string;
  age: number;
  gender: Gender;
  weightKg: number;
  heightCm: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  locale: Locale;
}

const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  sedentary:    1.2,
  light:        1.375,
  moderate:     1.55,
  active:       1.725,
  very_active:  1.9,
};

const GOAL_ADJUSTMENT: Record<Goal, number> = {
  lose:     -400,
  maintain: 0,
  gain:     300,
};

export function calcCalories(profile: UserProfile): number {
  // Mifflin-St Jeor BMR
  let bmr: number;
  if (profile.gender === 'M') {
    bmr = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + 5;
  } else {
    bmr = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age - 161;
  }
  const tdee = bmr * ACTIVITY_MULTIPLIER[profile.activityLevel];
  return Math.round(tdee + GOAL_ADJUSTMENT[profile.goal]);
}

export const DEFAULT_PROFILE: UserProfile = {
  name: '',
  age: 30,
  gender: 'M',
  weightKg: 75,
  heightCm: 175,
  activityLevel: 'moderate',
  goal: 'maintain',
  locale: 'UK',
};
