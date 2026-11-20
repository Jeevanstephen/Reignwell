// Stub — Achu wires up real AI call (Gemini)
export interface SuggestedMeal {
  id: string;
  name: string;
  emoji: string;
  ingredients: string[];
  prepTime: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

const MOCK_MEALS: SuggestedMeal[] = [
  {
    id: '1',
    name: 'Chicken & Rice Bowl',
    emoji: '🍗',
    ingredients: ['chicken breast', 'brown rice', 'broccoli', 'olive oil', 'garlic'],
    prepTime: '25 min',
    kcal: 520,
    protein: 48,
    carbs: 52,
    fat: 12,
  },
  {
    id: '2',
    name: 'Egg & Veggie Scramble',
    emoji: '🍳',
    ingredients: ['eggs', 'spinach', 'cherry tomatoes', 'feta', 'olive oil'],
    prepTime: '10 min',
    kcal: 310,
    protein: 24,
    carbs: 8,
    fat: 20,
  },
  {
    id: '3',
    name: 'Salmon Avocado Salad',
    emoji: '🥗',
    ingredients: ['salmon', 'avocado', 'mixed greens', 'lemon', 'olive oil'],
    prepTime: '15 min',
    kcal: 440,
    protein: 36,
    carbs: 10,
    fat: 28,
  },
];

export async function suggestMeals(_ingredients: string[]): Promise<SuggestedMeal[]> {
  // TODO: Achu replaces with Gemini call using ingredients + today's macro gap
  await new Promise(res => setTimeout(res, 800));
  return MOCK_MEALS;
}
