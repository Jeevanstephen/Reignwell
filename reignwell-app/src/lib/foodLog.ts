import AsyncStorage from '@react-native-async-storage/async-storage';
import { calcCalories, DEFAULT_PROFILE, UserProfile } from './userProfile';

const FOOD_LOG_STORAGE = 'rw_food_log';
const PROFILE_KEY = 'rw_user_profile';

export type PortionSize = 'S' | 'M' | 'L';

export const PORTION_MULTIPLIER: Record<PortionSize, number> = {
  S: 0.6,
  M: 1.0,
  L: 1.5,
};

export interface FoodEntry {
  id: string;
  source: 'manual' | 'ai_camera';
  emoji: string;
  name: string;
  /** Base (medium) values — multiply by PORTION_MULTIPLIER[size] for actuals */
  baseKcal: number;
  baseProtein: number;
  baseCarbs: number;
  baseFat: number;
  size: PortionSize;
  /** Computed = base × multiplier */
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  date: string;
}

export interface DaySummary {
  date: string;
  consumed: number;
  target: number;
  remaining: number;
  protein: number;
  carbs: number;
  fat: number;
}

export type DayLog = { date: string; entries: FoodEntry[] };

type RawLog = Record<string, any[]>; // date → raw entries

async function readRaw(): Promise<RawLog> {
  const raw = await AsyncStorage.getItem(FOOD_LOG_STORAGE);
  return raw ? JSON.parse(raw) : {};
}

async function readProfile(): Promise<UserProfile> {
  const raw = await AsyncStorage.getItem(PROFILE_KEY);
  return raw ? { ...DEFAULT_PROFILE, ...JSON.parse(raw) } : { ...DEFAULT_PROFILE };
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Enrich a raw stored entry with portion-adjusted macros. */
function hydrate(raw: any): FoodEntry {
  const size: PortionSize = raw.size ?? 'M';
  const mult = PORTION_MULTIPLIER[size];
  const base = {
    baseKcal:    raw.baseKcal    ?? raw.kcal    ?? 0,
    baseProtein: raw.baseProtein ?? raw.protein ?? 0,
    baseCarbs:   raw.baseCarbs   ?? raw.carbs   ?? 0,
    baseFat:     raw.baseFat     ?? raw.fat      ?? 0,
  };
  return {
    ...raw,
    ...base,
    size,
    kcal:    Math.round(base.baseKcal    * mult),
    protein: Math.round(base.baseProtein * mult),
    carbs:   Math.round(base.baseCarbs   * mult),
    fat:     Math.round(base.baseFat     * mult),
    date:    raw.date ?? todayKey(),
  };
}

export async function addFoodEntry(
  entry: Omit<FoodEntry, 'kcal' | 'protein' | 'carbs' | 'fat' | 'date'>,
): Promise<FoodEntry> {
  const hydrated = hydrate({ ...entry, date: todayKey() });
  const all = await readRaw();
  all[todayKey()] = [...(all[todayKey()] ?? []), hydrated];
  await AsyncStorage.setItem(FOOD_LOG_STORAGE, JSON.stringify(all));
  return hydrated;
}

export async function removeFoodEntry(id: string, date = todayKey()): Promise<void> {
  const all = await readRaw();
  all[date] = (all[date] ?? []).filter((e: any) => e.id !== id);
  await AsyncStorage.setItem(FOOD_LOG_STORAGE, JSON.stringify(all));
}

export async function getDailyCalorieSummary(date = todayKey()): Promise<DaySummary> {
  const [all, profile] = await Promise.all([readRaw(), readProfile()]);
  const entries = (all[date] ?? []).map(hydrate);
  const target = calcCalories(profile);

  const consumed = entries.reduce((s, e) => s + e.kcal,    0);
  const protein  = entries.reduce((s, e) => s + e.protein, 0);
  const carbs    = entries.reduce((s, e) => s + e.carbs,   0);
  const fat      = entries.reduce((s, e) => s + e.fat,     0);

  return { date, consumed, target, remaining: target - consumed, protein, carbs, fat };
}

export async function getMealHistory(days: number): Promise<DayLog[]> {
  const all = await readRaw();
  const result: DayLog[] = [];

  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, entries: (all[key] ?? []).map(hydrate) });
  }
  return result;
}
