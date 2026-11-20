// Stub — Achu wires up real AsyncStorage persistence from FoodLogScreen
export interface DayMacros {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const GOALS: DayMacros = { kcal: 2100, protein: 120, carbs: 200, fat: 65 };

export function getTodayMacros(): DayMacros {
  // Returns zeroes until Achu wires up shared state
  return { kcal: 0, protein: 0, carbs: 0, fat: 0 };
}
