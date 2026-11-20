import AsyncStorage from '@react-native-async-storage/async-storage';

const FOOD_LOG_STORAGE = 'rw_food_log';
const DAILY_GOALS = { kcal: 2100, protein: 120, carbs: 200, fat: 65 };

export interface MacroGaps {
  kcal: number;    // remaining kcal to hit goal (can be negative = over)
  protein: number; // remaining grams
  carbs: number;
  fat: number;
}

export interface MealSuggestion {
  name: string;
  emoji: string;
  ingredients: string[];
  macros: { kcal: number; protein: number; carbs: number; fat: number };
  prepTimeMin: number;
  fills: ('protein' | 'carbs' | 'fat' | 'kcal')[]; // which gaps it addresses
}

// ---- Meal template library ----

interface MealTemplate extends MealSuggestion {
  requiredIngredients: string[];   // must have ≥1 from this list
  tags: ('high-protein' | 'high-carb' | 'high-fat' | 'low-cal' | 'quick')[];
}

const MEAL_TEMPLATES: MealTemplate[] = [
  {
    name: 'Chicken & Rice Bowl',
    emoji: '🍗',
    requiredIngredients: ['chicken', 'rice'],
    ingredients: ['Chicken breast (150g)', 'White rice (1 cup)', 'Broccoli', 'Olive oil', 'Seasoning'],
    macros: { kcal: 520, protein: 45, carbs: 55, fat: 10 },
    prepTimeMin: 20,
    fills: ['protein', 'carbs'],
    tags: ['high-protein'],
  },
  {
    name: 'Egg & Veggie Scramble',
    emoji: '🍳',
    requiredIngredients: ['egg', 'eggs'],
    ingredients: ['3 Eggs', 'Spinach', 'Tomato', 'Feta cheese', 'Olive oil'],
    macros: { kcal: 320, protein: 22, carbs: 6, fat: 24 },
    prepTimeMin: 10,
    fills: ['protein'],
    tags: ['high-protein', 'quick'],
  },
  {
    name: 'Peanut Butter Oat Bowl',
    emoji: '🥣',
    requiredIngredients: ['oat', 'oats', 'peanut butter', 'peanut'],
    ingredients: ['Rolled oats (80g)', 'Peanut butter (2 tbsp)', 'Banana', 'Milk', 'Honey'],
    macros: { kcal: 580, protein: 20, carbs: 72, fat: 22 },
    prepTimeMin: 5,
    fills: ['kcal', 'carbs'],
    tags: ['high-carb', 'quick'],
  },
  {
    name: 'Tuna Avocado Wrap',
    emoji: '🫔',
    requiredIngredients: ['tuna', 'avocado'],
    ingredients: ['Canned tuna (1 tin)', 'Avocado (half)', 'Whole wheat wrap', 'Lemon', 'Mixed leaves'],
    macros: { kcal: 420, protein: 35, carbs: 28, fat: 18 },
    prepTimeMin: 8,
    fills: ['protein'],
    tags: ['high-protein', 'quick'],
  },
  {
    name: 'Dal & Roti',
    emoji: '🥘',
    requiredIngredients: ['dal', 'lentil', 'roti', 'flour'],
    ingredients: ['Red lentils (100g)', 'Whole wheat roti (2)', 'Tomato', 'Onion', 'Spices'],
    macros: { kcal: 460, protein: 22, carbs: 68, fat: 8 },
    prepTimeMin: 25,
    fills: ['protein', 'carbs'],
    tags: ['high-carb'],
  },
  {
    name: 'Greek Yogurt Protein Bowl',
    emoji: '🧋',
    requiredIngredients: ['yogurt', 'yoghurt', 'greek yogurt'],
    ingredients: ['Greek yogurt (200g)', 'Mixed berries', 'Granola (30g)', 'Honey', 'Chia seeds'],
    macros: { kcal: 380, protein: 24, carbs: 48, fat: 8 },
    prepTimeMin: 3,
    fills: ['protein'],
    tags: ['high-protein', 'quick'],
  },
  {
    name: 'Salmon & Sweet Potato',
    emoji: '🐟',
    requiredIngredients: ['salmon', 'sweet potato', 'sweet'],
    ingredients: ['Salmon fillet (150g)', 'Sweet potato (medium)', 'Asparagus', 'Olive oil', 'Lemon'],
    macros: { kcal: 550, protein: 38, carbs: 42, fat: 20 },
    prepTimeMin: 30,
    fills: ['protein', 'kcal'],
    tags: ['high-protein'],
  },
  {
    name: 'Paneer Stir Fry',
    emoji: '🫔',
    requiredIngredients: ['paneer', 'cheese'],
    ingredients: ['Paneer (150g)', 'Bell peppers', 'Onion', 'Spices', 'Oil'],
    macros: { kcal: 420, protein: 28, carbs: 12, fat: 30 },
    prepTimeMin: 15,
    fills: ['protein', 'fat'],
    tags: ['high-protein', 'high-fat'],
  },
  {
    name: 'Black Bean Rice Bowl',
    emoji: '🫘',
    requiredIngredients: ['bean', 'beans', 'rice'],
    ingredients: ['Black beans (1 cup)', 'Brown rice', 'Corn', 'Avocado', 'Lime', 'Cilantro'],
    macros: { kcal: 490, protein: 18, carbs: 78, fat: 10 },
    prepTimeMin: 15,
    fills: ['carbs', 'kcal'],
    tags: ['high-carb'],
  },
  {
    name: 'Almond Butter Banana Toast',
    emoji: '🍞',
    requiredIngredients: ['bread', 'toast', 'banana', 'almond'],
    ingredients: ['Whole grain bread (2 slices)', 'Almond butter', 'Banana', 'Cinnamon'],
    macros: { kcal: 390, protein: 12, carbs: 52, fat: 16 },
    prepTimeMin: 4,
    fills: ['carbs', 'kcal'],
    tags: ['quick', 'high-carb'],
  },
  {
    name: 'High-Protein Smoothie',
    emoji: '🥤',
    requiredIngredients: ['milk', 'banana', 'oat', 'berry', 'berries', 'yogurt'],
    ingredients: ['Milk (250ml)', 'Banana', 'Oats (40g)', 'Peanut butter', 'Frozen berries'],
    macros: { kcal: 480, protein: 20, carbs: 62, fat: 14 },
    prepTimeMin: 3,
    fills: ['kcal', 'protein'],
    tags: ['quick', 'high-protein'],
  },
  {
    name: 'Cottage Cheese & Fruit',
    emoji: '🫙',
    requiredIngredients: ['cottage', 'apple', 'fruit', 'berry', 'berries'],
    ingredients: ['Cottage cheese (200g)', 'Apple (1)', 'Walnuts (20g)', 'Honey'],
    macros: { kcal: 310, protein: 25, carbs: 28, fat: 10 },
    prepTimeMin: 3,
    fills: ['protein'],
    tags: ['high-protein', 'quick', 'low-cal'],
  },
];

// ---- Helpers ----

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getMacroGaps(): Promise<MacroGaps> {
  const raw = await AsyncStorage.getItem(FOOD_LOG_STORAGE);
  const all: Record<string, { kcal: number; protein: number; carbs: number; fat: number }[]> =
    raw ? JSON.parse(raw) : {};
  const meals = all[todayKey()] ?? [];

  const eaten = meals.reduce(
    (s, m) => ({ kcal: s.kcal + m.kcal, protein: s.protein + m.protein, carbs: s.carbs + m.carbs, fat: s.fat + m.fat }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );

  return {
    kcal:    DAILY_GOALS.kcal    - eaten.kcal,
    protein: DAILY_GOALS.protein - eaten.protein,
    carbs:   DAILY_GOALS.carbs   - eaten.carbs,
    fat:     DAILY_GOALS.fat     - eaten.fat,
  };
}

function normalise(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function matchesIngredients(template: MealTemplate, ingredients: string[]): boolean {
  if (ingredients.length === 0) return true; // no filter → show all
  const userSet = ingredients.map(normalise);
  return template.requiredIngredients.some(req =>
    userSet.some(u => u.includes(normalise(req)) || normalise(req).includes(u))
  );
}

export function getSuggestions(
  ingredients: string[],
  macroGaps: MacroGaps,
): MealSuggestion[] {
  // Score each template: ingredient match + macro gap alignment
  const scored = MEAL_TEMPLATES.map(t => {
    let score = 0;

    // Ingredient match bonus
    if (matchesIngredients(t, ingredients)) score += 10;

    // Macro gap alignment
    if (macroGaps.protein > 20 && t.tags.includes('high-protein')) score += 5;
    if (macroGaps.carbs   > 30 && t.tags.includes('high-carb'))    score += 4;
    if (macroGaps.kcal    > 300 && !t.tags.includes('low-cal'))    score += 3;
    if (macroGaps.fat     > 15 && t.tags.includes('high-fat'))     score += 2;

    // Quick bonus for small gaps (nearly full → suggest quick meals)
    const remaining = macroGaps.kcal;
    if (remaining < 400 && remaining > 0 && t.tags.includes('quick')) score += 3;

    return { template: t, score };
  });

  // Sort by score desc, take top 3, strip internal fields
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ template }) => ({
      name: template.name,
      emoji: template.emoji,
      ingredients: template.ingredients,
      macros: template.macros,
      prepTimeMin: template.prepTimeMin,
      fills: template.fills,
    }));
}
