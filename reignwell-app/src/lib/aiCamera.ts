import AsyncStorage from '@react-native-async-storage/async-storage';

const GEMINI_KEY_STORAGE = 'gemini_api_key';
const FOOD_LOG_STORAGE = 'rw_food_log';
const MODEL = 'gemini-2.5-pro';

const ANALYZE_PROMPT =
  'Identify the food in this picture and estimate the calories. ' +
  'Return JSON only: {"items": ["food1", "food2"], "total_calories": 450, ' +
  '"breakdown": [{"name": "food1", "calories": 200, "protein": 10, "carbs": 20, "fat": 5}, ' +
  '{"name": "food2", "calories": 250, "protein": 15, "carbs": 25, "fat": 8}]}';

export interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface AnalysisResult {
  items: string[];
  total_calories: number;
  breakdown: FoodItem[];
}

export interface LoggedMeal {
  id: string;
  source: 'ai_camera' | 'manual';
  emoji: string;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  breakdown?: FoodItem[];
}

// --- API key helpers ---

export async function getApiKey(): Promise<string | null> {
  return AsyncStorage.getItem(GEMINI_KEY_STORAGE);
}

export async function saveApiKey(key: string): Promise<void> {
  await AsyncStorage.setItem(GEMINI_KEY_STORAGE, key.trim());
}

export async function clearApiKey(): Promise<void> {
  await AsyncStorage.removeItem(GEMINI_KEY_STORAGE);
}

// --- Core analysis function ---

export async function analyzeFood(
  base64Data: string,
  apiKey: string,
): Promise<AnalysisResult> {
  if (!apiKey.trim()) throw new Error('No API key provided.');

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

  const body = {
    contents: [{
      parts: [
        { text: ANALYZE_PROMPT },
        { inline_data: { mime_type: 'image/jpeg', data: base64Data } },
      ],
    }],
    generationConfig: { temperature: 0.1 },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = (err as any)?.error?.message ?? `HTTP ${res.status}`;
    throw new Error(`Gemini API error: ${msg}`);
  }

  const data = await res.json();
  const rawText: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  return parseAnalysisResponse(rawText);
}

function parseAnalysisResponse(text: string): AnalysisResult {
  // Strip markdown code fences if present
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

  // Find JSON object boundaries
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON found in Gemini response.');

  const parsed = JSON.parse(cleaned.slice(start, end + 1));

  // Normalise — Gemini may return slightly different field names
  const breakdown: FoodItem[] = (parsed.breakdown ?? []).map((b: any) => ({
    name: b.name ?? 'Unknown',
    calories: Number(b.calories ?? b.kcal ?? 0),
    protein: Number(b.protein ?? 0),
    carbs: Number(b.carbs ?? b.carbohydrates ?? 0),
    fat: Number(b.fat ?? 0),
  }));

  const total_calories =
    Number(parsed.total_calories ?? parsed.totalCalories ?? 0) ||
    breakdown.reduce((s, b) => s + b.calories, 0);

  const items: string[] =
    parsed.items ?? breakdown.map((b) => b.name);

  return { items, total_calories, breakdown };
}

// --- Save to daily log ---

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export async function saveAnalysisToLog(result: AnalysisResult): Promise<LoggedMeal> {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const totalProtein = result.breakdown.reduce((s, b) => s + b.protein, 0);
  const totalCarbs   = result.breakdown.reduce((s, b) => s + b.carbs,   0);
  const totalFat     = result.breakdown.reduce((s, b) => s + b.fat,     0);

  const label = result.items.slice(0, 2).join(' & ');
  const meal: LoggedMeal = {
    id: `ai_${Date.now()}`,
    source: 'ai_camera',
    emoji: '📸',
    name: label || 'AI Camera Meal',
    kcal: result.total_calories,
    protein: Math.round(totalProtein),
    carbs: Math.round(totalCarbs),
    fat: Math.round(totalFat),
    time,
    breakdown: result.breakdown,
  };

  const raw = await AsyncStorage.getItem(FOOD_LOG_STORAGE);
  const all: Record<string, LoggedMeal[]> = raw ? JSON.parse(raw) : {};
  all[todayKey()] = [...(all[todayKey()] ?? []), meal];
  await AsyncStorage.setItem(FOOD_LOG_STORAGE, JSON.stringify(all));

  return meal;
}
