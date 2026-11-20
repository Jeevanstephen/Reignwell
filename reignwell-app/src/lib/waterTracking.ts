import AsyncStorage from '@react-native-async-storage/async-storage';

const WATER_LOG_KEY = 'rw_water_log';
const WATER_GOAL_KEY = 'rw_water_goal';
const DEFAULT_GOAL_ML = 2500;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

// --- Goal ---

export async function getWaterGoal(): Promise<number> {
  const raw = await AsyncStorage.getItem(WATER_GOAL_KEY);
  return raw ? Number(raw) : DEFAULT_GOAL_ML;
}

export async function setWaterGoal(ml: number): Promise<void> {
  await AsyncStorage.setItem(WATER_GOAL_KEY, String(Math.max(0, ml)));
}

// --- Daily log ---

async function readLog(): Promise<Record<string, number>> {
  const raw = await AsyncStorage.getItem(WATER_LOG_KEY);
  return raw ? JSON.parse(raw) : {};
}

async function writeLog(log: Record<string, number>): Promise<void> {
  await AsyncStorage.setItem(WATER_LOG_KEY, JSON.stringify(log));
}

export async function getWaterToday(): Promise<number> {
  const log = await readLog();
  return log[todayKey()] ?? 0;
}

export async function addWater(ml: number): Promise<number> {
  const log = await readLog();
  const key = todayKey();
  const next = (log[key] ?? 0) + Math.max(0, ml);
  log[key] = next;
  await writeLog(log);
  return next;
}

export async function removeWater(ml: number): Promise<number> {
  const log = await readLog();
  const key = todayKey();
  const next = Math.max(0, (log[key] ?? 0) - Math.max(0, ml));
  log[key] = next;
  await writeLog(log);
  return next;
}
